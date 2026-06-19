import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, apiKeyOverride } = await req.json();
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Poetic offline reflections based on category
      const reflections = [
        "In the quiet of our routines, we find our highest agency. Swapping one drive for public transit can prevent roughly 4.5kg of carbon emissions.",
        "A plant-powered plate is a landscape of healing. Opting for a plant-based meal today helps conserve soil health and clear the skies.",
        "Unplugging a device silences the phantom currents that run unseen through our walls. Small awarenesses form deep roots over time.",
        "Choosing secondhand extends the lifecycle of our shared artifacts. It is an act of preservation, utility, and refined taste."
      ];
      const randomReflection = reflections[Math.floor(Math.random() * reflections.length)];
      return NextResponse.json({
        role: "assistant",
        content: `I am currently in offline mode, but here is a reflection for you:\n\n*"${randomReflection}"*\n\nTo unlock conversational coaching, please supply your Gemini API Key in the settings panel (gear icon) in the header!`
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are Sprout AI, a warm, poetic, and highly knowledgeable environmental coach.
      You help users build ecological awareness and sustainable habits without shaming them.
      You focus on visual metaphors (gardens, soil, sunlight, ripples) and practical, creative everyday solutions.
      Keep your responses relatively brief (under 120 words), formatting key recommendations with clear, simple bullet points.
      Do not repeat clichés. Avoid generic introductory text. Be encouraging, thoughtful, and direct.
    `;

    // Map message roles: user -> user, assistant -> model
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    return NextResponse.json({
      role: "assistant",
      content: response.text || "I was unable to formulate a response. Let us focus on nurturing simple eco choices today."
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      role: "assistant",
      content: "I hit a small snag. Let's focus on simple habits today while I get back on my feet!"
    });
  }
}
