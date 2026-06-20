import { NextResponse } from 'next/server';
import { getGeminiClient } from '../_shared/geminiClient';
import { FALLBACKS } from '../_shared/fallbacks';
import { sanitizeInput } from '../_shared/validation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, apiKeyOverride } = await req.json();
    const ai = getGeminiClient(apiKeyOverride);

    if (!ai) {
      return NextResponse.json(FALLBACKS.chatOffline());
    }

    const systemInstruction = `
      You are Sprout AI, a warm, poetic, and highly knowledgeable environmental coach.
      You help users build ecological awareness and sustainable habits without shaming them.
      You focus on visual metaphors (gardens, soil, sunlight, ripples) and practical, creative everyday solutions.
      Keep your responses relatively brief (under 120 words), formatting key recommendations with clear, simple bullet points.
      Do not repeat clichés. Avoid generic introductory text. Be encouraging, thoughtful, and direct.
    `;

    // Map message roles: user -> user, assistant -> model, and sanitize content
    const formattedContents = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: sanitizeInput(m.content, 1000) }],
      }),
    );

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return NextResponse.json({
      role: 'assistant',
      content:
        response.text ||
        'I was unable to formulate a response. Let us focus on nurturing simple eco choices today.',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(FALLBACKS.chatError());
  }
}
