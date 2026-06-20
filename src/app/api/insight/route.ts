import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { EQUIVALENCIES } from '@/lib/carbonData';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { activity, weeklyEmissions, score, apiKeyOverride } = body;

    if (!activity) {
      return NextResponse.json({ error: 'Missing activity data' }, { status: 400 });
    }

    const apiKey = (apiKeyOverride as string | undefined) || process.env.GEMINI_API_KEY;

    // Fallback if no API key is available
    if (!apiKey) {
      return NextResponse.json({
        insight: `Every choice adds up. Your recent log of "${activity.label as string}" has a footprint of ${activity.emissionsValue as number}kg CO2e.`,
        suggestion: 'Consider a lower-impact alternative next time you are in this situation.',
        title: 'Deepen the Root',
        quote: 'Sustainability is not a destination, but a state of being conscious in every moment.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Sanitise: user input is interpolated into a structured JSON prompt.
    // We strip control characters and limit length to prevent prompt injection.
    const safeLabel = String(activity.label ?? '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .slice(0, 200);
    const safeCategoryId = String(activity.categoryId ?? '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .slice(0, 50);

    // Prepare context using carbon equivalencies
    const equivalenciesText = EQUIVALENCIES
      .map((e) => `${e.co2e}kg CO2e is about equivalent to ${e.equivalent}`)
      .join('. ');

    const prompt = `
      You are an encouraging, non-shaming environmental awareness AI. 
      The user just logged an activity: Category "${safeCategoryId}", Action "${safeLabel}", which is estimated at ${activity.emissionsValue as number}kg CO2e.
      Their current rolling weekly score is ${score as number}/100 (where 100 is best). Their total recent emissions are ${weeklyEmissions as number}kg CO2e.
      
      Here are some reference points: ${equivalenciesText}.
      
      Provide a short (1-2 sentence) encouraging insight that reframes today's specific logged activity (${safeLabel}) into a relatable real-world equivalent using the reference points if helpful, but DO NOT shame the user. 
      Then provide one concrete, small alternative action they could take next time.
      Also provide a 2-4 word Title for this next step.
      Finally, provide a unique, poetic quote about nature, sustainability, or consciousness that relates to their action.

      Return ONLY a strict JSON object with this exact structure:
      {
        "insight": "the 1-2 sentence reframing insight",
        "suggestion": "the short, concrete alternative action",
        "title": "the 2-4 word title",
        "quote": "the poetic quote"
      }
      Do not include markdown blocks or any other text.
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
    const result = JSON.parse(text) as {
      insight: string;
      suggestion: string;
      title: string;
      quote: string;
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route Error:', error);
    // Graceful fallback on error
    return NextResponse.json({
      insight: 'Small steps shape the world. Your activity has been logged successfully.',
      suggestion: 'Try exploring other low-impact options in this category tomorrow.',
      title: 'Keep Growing',
      quote: 'Every leaf that falls nourishes the soil for the next season.',
    });
  }
}
