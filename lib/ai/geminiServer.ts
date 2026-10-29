import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { NextRequest } from 'next/server';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const SUPPORTED_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
] as const;

// Models that are retired, invalid, or fail on standard consumer keys
const INVALID_OR_RETIRED_MODEL_PATTERNS = [
  'gemini-3.6-flash',
  'gemini-3.6',
  'gemini-1.5',
  'gemini-1.0',
  'gemini-2.0-flash-thinking',
  'gemini-pro',
];

/**
 * Strips surrounding quotes and whitespace from an API key loaded from .env.local or headers.
 */
export function sanitizeApiKey(rawKey?: string | null): string {
  if (!rawKey || typeof rawKey !== 'string') return '';
  return rawKey.trim().replace(/^['"]+|['"]+$/g, '').trim();
}

/**
 * Resolves the active Gemini API key on the server.
 * Prioritizes server-side environment variables (.env.local: GEMINI_API_KEY or GOOGLE_API_KEY),
 * with optional fallback to a request-supplied key if testing from the UI.
 */
export function resolveServerApiKey(
  req?: NextRequest,
  bodyApiKey?: string | null
): { apiKey: string; source: 'server-env' | 'request' | 'none' } {
  const envKey = sanitizeApiKey(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  );
  const clientKey = sanitizeApiKey(
    bodyApiKey || req?.headers.get('x-gemini-api-key')
  );

  if (clientKey && clientKey.length > 10) {
    return { apiKey: clientKey, source: 'request' };
  }
  if (envKey && envKey.length > 10) {
    return { apiKey: envKey, source: 'server-env' };
  }
  return { apiKey: '', source: 'none' };
}

/**
 * Normalizes a requested model ID, replacing unverified ("gemini-3.6-flash")
 * or retired (1.5) models with a valid supported model while preserving valid 2.5/3.x models.
 */
export function normalizeGeminiModel(requestedModel?: string | null): string {
  const envModel = (
    process.env.GEMINI_MODEL ||
    process.env.NEXT_PUBLIC_GEMINI_MODEL ||
    ''
  ).trim();

  const raw = (requestedModel || envModel || DEFAULT_GEMINI_MODEL)
    .trim()
    .replace(/^models\//i, '');

  if (!raw) {
    return envModel && !isInvalidModelId(envModel) ? envModel : DEFAULT_GEMINI_MODEL;
  }

  if (isInvalidModelId(raw)) {
    return envModel && !isInvalidModelId(envModel) ? envModel : DEFAULT_GEMINI_MODEL;
  }

  return raw;
}

export function isInvalidModelId(modelId: string): boolean {
  const lower = modelId.trim().toLowerCase().replace(/^models\//, '');
  if (!lower) return true;
  if (lower === 'gemini-pro') return true;
  return INVALID_OR_RETIRED_MODEL_PATTERNS.some((pat) =>
    pat === 'gemini-pro' ? lower === 'gemini-pro' : lower.includes(pat)
  );
}

/**
 * Builds a deduplicated list of candidate models to try in order if a model
 * returns 404 NOT_FOUND for a specific API key / environment.
 */
export function getCandidateModels(requestedModel?: string | null): string[] {
  const primary = normalizeGeminiModel(requestedModel);
  const candidates = [
    primary,
    process.env.GEMINI_MODEL?.trim(),
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
  ].filter((m): m is string => Boolean(m && !isInvalidModelId(m)));

  return Array.from(new Set(candidates));
}

/**
 * Redacts any API key strings from error messages before logging or returning to client.
 */
export function redactSecrets(message: string, apiKey?: string): string {
  if (!message) return 'Unknown error';
  let safe = message;
  if (apiKey && apiKey.length >= 6) {
    safe = safe.split(apiKey).join('[REDACTED_KEY]');
  }
  safe = safe.replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_API_KEY]');
  return safe;
}

export interface ClassifiedGeminiError {
  code:
    | 'MISSING_KEY'
    | 'INVALID_KEY'
    | 'MODEL_NOT_FOUND'
    | 'QUOTA_EXCEEDED'
    | 'TIMEOUT'
    | 'PROVIDER_ERROR';
  httpStatus: number;
  userMessage: string;
  technicalReason: string;
}

export function classifyGeminiError(err: unknown, apiKey?: string): ClassifiedGeminiError {
  const rawMsg =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : JSON.stringify(err || '');
  const safeMsg = redactSecrets(rawMsg, apiKey);
  const lower = safeMsg.toLowerCase();

  if (
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('invalid api key') ||
    lower.includes('permission_denied') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return {
      code: 'INVALID_KEY',
      httpStatus: 401,
      userMessage:
        'Google Gemini API key was rejected (invalid or unauthorized). Verify GEMINI_API_KEY in .env.local.',
      technicalReason: safeMsg,
    };
  }

  if (
    lower.includes('not_found') ||
    lower.includes('not found') ||
    lower.includes('404') ||
    lower.includes('is not supported for generatecontent')
  ) {
    return {
      code: 'MODEL_NOT_FOUND',
      httpStatus: 404,
      userMessage:
        'The requested Gemini model is not available for this API key.',
      technicalReason: safeMsg,
    };
  }

  if (
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('429') ||
    lower.includes('rate limit')
  ) {
    return {
      code: 'QUOTA_EXCEEDED',
      httpStatus: 429,
      userMessage:
        'Gemini API rate limit or quota exceeded. Using local ChemMCP chemistry engine.',
      technicalReason: safeMsg,
    };
  }

  if (
    lower.includes('abort') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('etimedout')
  ) {
    return {
      code: 'TIMEOUT',
      httpStatus: 504,
      userMessage:
        'Gemini API request timed out. Falling back to local ChemMCP chemistry engine.',
      technicalReason: safeMsg,
    };
  }

  return {
    code: 'PROVIDER_ERROR',
    httpStatus: 502,
    userMessage: 'Gemini API request failed. Using local ChemMCP chemistry engine.',
    technicalReason: safeMsg,
  };
}

export function createGeminiClient(apiKey: string, timeoutMs = 25000): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface GenerateWithFallbackOptions {
  apiKey: string;
  preferredModel?: string | null;
  contents: string;
  responseMimeType?: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface GenerateWithFallbackResult {
  text: string;
  modelUsed: string;
}

/**
 * Builds low-latency thinking configuration appropriate for the target Gemini model family
 * so structured JSON extraction finishes in ~2-4 seconds instead of timing out after 16+ seconds.
 */
function getFastThinkingConfig(modelName: string): Record<string, unknown> | undefined {
  const lower = modelName.toLowerCase();
  if (lower.startsWith('gemini-2.5-flash')) {
    return { thinkingBudget: 0 };
  }
  if (lower.startsWith('gemini-3.8') || lower.startsWith('gemini-4')) {
    return { thinkingLevel: ThinkingLevel.LOW };
  }
  return undefined;
}

/**
 * Calls ai.models.generateContent with automatic model fallback on 404 NOT_FOUND
 * and low-latency thinking config so requests complete fast and never crash with HTTP 500.
 */
export async function generateContentWithFallback(
  options: GenerateWithFallbackOptions
): Promise<GenerateWithFallbackResult> {
  const {
    apiKey,
    preferredModel,
    contents,
    responseMimeType,
    timeoutMs = 25000,
  } = options;

  const ai = createGeminiClient(apiKey, timeoutMs);
  const candidates = getCandidateModels(preferredModel);
  let lastError: unknown = null;

  for (const candidateModel of candidates) {
    try {
      const config: Record<string, unknown> = {};
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }
      const thinkingConfig = getFastThinkingConfig(candidateModel);
      if (thinkingConfig) {
        config.thinkingConfig = thinkingConfig;
      }

      const response = await ai.models.generateContent({
        model: candidateModel,
        contents,
        ...(Object.keys(config).length > 0 ? { config } : {}),
      });

      const text = (response.text || '').trim();
      if (text) {
        return {
          text,
          modelUsed: candidateModel,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      const classified = classifyGeminiError(err, apiKey);
      if (classified.code === 'MODEL_NOT_FOUND' || classified.code === 'TIMEOUT') {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
}

/**
 * Lists models available to the provided API key using the @google/genai Pager async iterable.
 */
export async function listAvailableGeminiModels(
  apiKey: string,
  timeoutMs = 10000
): Promise<string[]> {
  const ai = createGeminiClient(apiKey, timeoutMs);
  const pager = await ai.models.list();
  const names: string[] = [];

  for await (const model of pager) {
    if (model?.name) {
      const cleanName = model.name.replace(/^models\//, '');
      const actions = (model as { supportedActions?: string[] }).supportedActions;
      if (
        !actions ||
        actions.length === 0 ||
        actions.includes('generateContent')
      ) {
        names.push(cleanName);
      }
    }
  }

  return names;
}
