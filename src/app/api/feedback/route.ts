import { NextResponse } from 'next/server';
import { getGeminiClient } from '../_shared/geminiClient';
import { FALLBACKS } from '../_shared/fallbacks';
import { sanitizeInput } from '../_shared/validation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const GOOD_THRESHOLD = 1.5;

export async function POST(req: Request) {
  try {
    const { activity, apiKeyOverride } = await req.json();
    const safeLabel = sanitizeInput(activity?.label, 200);
    const safeCategoryId = sanitizeInput(activity?.categoryId, 50);
    const isGood = (activity?.emissionsValue ?? 0) <= GOOD_THRESHOLD;

    const ai = getGeminiClient(apiKeyOverride);

    if (!ai) {
      return NextResponse.json(
        FALLBACKS.feedbackOffline(safeCategoryId, isGood),
      );
    }

    let prompt: string;

    if (isGood) {
      prompt = `
        You are a warm, creative environmental coach.
        The user just logged a LOW-IMPACT, ECO-FRIENDLY action: "${safeLabel}" (category: "${safeCategoryId}", emissions: ${activity?.emissionsValue as number}kg CO2e).
        
        This is a GOOD action. Celebrate it! Then give 2 bonus tips to go even further.
        
        RULES:
        - The praise should be 1-2 sentences, warm, specific to "${safeLabel}", and make the user feel genuinely proud.
        - The 2 bonus tips should be creative, unconventional, and directly related to "${safeLabel}".
        - Avoid clichés like "ride a bike" or "turn off lights".
        - Keep each tip under 15 words.
        
        Return ONLY a JSON object:
        {
          "type": "good",
          "praise": "1-2 sentence celebration specific to their action",
          "bonusTips": ["tip 1", "tip 2"]
        }
      `;
    } else {
      prompt = `
        You are an honest but compassionate environmental coach.
        The user just logged a HIGH-IMPACT action: "${safeLabel}" (category: "${safeCategoryId}", emissions: ${activity?.emissionsValue as number}kg CO2e).
        
        This is a BAD action for the environment. Be honest about the impact, then suggest 2 better alternatives.
        
        RULES:
        - "reality" should be 1-2 sentences explaining the real environmental cost of "${safeLabel}" using a vivid, relatable comparison (not shaming, but eye-opening).
        - The 2 alternatives should be practical, specific swaps directly related to "${safeLabel}".
        - Avoid clichés. Be creative and actionable.
        - Keep each alternative under 15 words.
        
        Return ONLY a JSON object:
        {
          "type": "bad",
          "reality": "1-2 sentence honest impact statement",
          "alternatives": ["alternative 1", "alternative 2"]
        }
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No text returned');
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(FALLBACKS.feedbackError());
  }
}
