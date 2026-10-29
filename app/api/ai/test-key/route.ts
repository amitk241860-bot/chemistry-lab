import { NextRequest, NextResponse } from 'next/server';
import {
  resolveServerApiKey,
  generateContentWithFallback,
  classifyGeminiError,
  normalizeGeminiModel,
  listAvailableGeminiModels,
} from '@/lib/ai/geminiServer';

/**
 * GET /api/ai/test-key
 * Returns whether a server-side Gemini API key (.env.local) is configured,
 * without ever exposing the key value or prefix.
 */
export async function GET() {
  const { apiKey, source } = resolveServerApiKey();
  return NextResponse.json({
    configured: Boolean(apiKey),
    keySource: source,
    defaultModel: normalizeGeminiModel(),
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { apiKey, source } = resolveServerApiKey(req, body.apiKey);

  if (!apiKey) {
    return NextResponse.json(
      {
        valid: false,
        error:
          'No API key found. Set GEMINI_API_KEY in .env.local on the server or provide a key to test.',
      },
      { status: 400 }
    );
  }

  const requestedModel = normalizeGeminiModel(body.model);

  try {
    const { text, modelUsed } = await generateContentWithFallback({
      apiKey,
      preferredModel: requestedModel,
      contents: 'Ping test for ChemLab VLab. Respond with single word "Ready".',
      timeoutMs: 10000,
    });

    let availableModels: string[] | undefined;
    if (body.includeModels) {
      try {
        availableModels = await listAvailableGeminiModels(apiKey, 8000);
      } catch {
        availableModels = undefined;
      }
    }

    return NextResponse.json({
      valid: true,
      keySource: source,
      model: modelUsed,
      availableModels,
      message: `Google Gemini API connection successful using model "${modelUsed}" (${
        source === 'server-env' ? 'server .env.local key' : 'provided key'
      }).`,
      preview: text.trim(),
    });
  } catch (error: unknown) {
    const classified = classifyGeminiError(error, apiKey);
    return NextResponse.json(
      {
        valid: false,
        code: classified.code,
        error: classified.userMessage,
      },
      { status: classified.httpStatus }
    );
  }
}
