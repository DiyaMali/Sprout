import { NextResponse } from 'next/server';
import { getGeminiClient } from '../_shared/geminiClient';
import { FALLBACKS } from '../_shared/fallbacks';
import { sanitizeInput } from '../_shared/validation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { customAction, apiKeyOverride } = await req.json();
    const ai = getGeminiClient(apiKeyOverride);

    if (!ai) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 401 },
      );
    }

    const safeAction = sanitizeInput(customAction, 500);

    const prompt = `
      You are an expert carbon footprint estimator.
      The user has submitted a custom sustainable action: "${safeAction}"
      Estimate the approximate kilograms of CO2e (emissionsValue) saved by this action. 
      Also provide a short 1-3 word label for it.
      Return ONLY a valid JSON object in this exact format:
      {
        "label": "Short Action Name",
        "emissionsValue": 1.5
      }
      Do not wrap the JSON in markdown blocks. Return purely the JSON object.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text returned from Gemini');
    }
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Evaluate API error:', error);
    return NextResponse.json(FALLBACKS.evaluateError());
  }
}
