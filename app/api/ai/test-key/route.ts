import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey =
      body.apiKey ||
      req.headers.get('x-gemini-api-key') ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'No API key provided. Please enter your Google Gemini API key.' },
        { status: 400 }
      );
    }

    let modelName = body.model || 'gemini-3.6-flash';
    if (modelName.includes('1.5') || modelName.includes('2.5')) {
      modelName = 'gemini-3.6-flash';
    }

    const ai = new GoogleGenAI({ apiKey });

    // Test a lightweight generation with Gemini 3
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Ping test for ChemLab VLab. Respond with single word "Ready".',
    });

    const text = response.text || '';
    return NextResponse.json({
      valid: true,
      model: modelName,
      message: 'Google Gemini API connection successful! Chemistry engine is ready.',
      preview: text.trim(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        error: error?.message || 'Failed to authenticate with Google Gemini API. Please check your key.',
      },
      { status: 401 }
    );
  }
}
