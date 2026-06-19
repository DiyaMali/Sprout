import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Threshold: actions with emissionsValue <= this are "good"
const GOOD_THRESHOLD = 1.5;

export async function POST(req: Request) {
  try {
    const { activity, apiKeyOverride } = await req.json();
    const isGood = (activity.emissionsValue ?? 0) <= GOOD_THRESHOLD;

    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Offline fallbacks based on good/bad and category
      if (isGood) {
        const goodFallbacks: Record<string, { type: string; praise: string; bonusTips: string[] }> = {
          transport: {
            type: 'good',
            praise: "Incredible choice! You just kept emissions at near-zero for this trip.",
            bonusTips: ["Map a scenic walking route you haven't tried before.", "Invite a friend to walk with you next time for shared impact."]
          },
          meal: {
            type: 'good',
            praise: "A plant-powered meal is one of the single highest-impact daily choices you can make.",
            bonusTips: ["Try growing one herb at home for your next dish.", "Explore a farmer's market this weekend for ultra-local ingredients."]
          },
          energy: {
            type: 'good',
            praise: "Turning things off is the simplest, most powerful habit. Well done.",
            bonusTips: ["Use a power strip to kill phantom loads in one click.", "Open curtains for natural light instead of flipping a switch."]
          },
          shopping: {
            type: 'good',
            praise: "Restraint is a superpower. You just proved the most sustainable product is the one you don't buy.",
            bonusTips: ["Try a 30-day wishlist rule before any purchase.", "Organize a swap event with friends for things you need."]
          },
          custom: {
            type: 'good',
            praise: "That's a thoughtful, low-impact choice. Your garden thanks you.",
            bonusTips: ["Journal this habit to build momentum.", "Share this win with someone to inspire them."]
          }
        };
        return NextResponse.json(goodFallbacks[activity.categoryId] || goodFallbacks.custom);
      } else {
        const badFallbacks: Record<string, { type: string; reality: string; alternatives: string[] }> = {
          transport: {
            type: 'bad',
            reality: "Solo driving emits roughly 4.5kg CO2 per trip — that's like charging your phone 540 times.",
            alternatives: ["Try carpooling with a colleague even once this week.", "Combine multiple errands into a single trip to cut mileage in half."]
          },
          meal: {
            type: 'bad',
            reality: "Red meat has one of the highest carbon footprints of any single food item.",
            alternatives: ["Swap beef for chicken in your favourite recipe — it cuts emissions by 60%.", "Try one 'Meatless Monday' this week as an experiment."]
          },
          energy: {
            type: 'bad',
            reality: "Leaving everything running overnight can waste as much energy as a short road trip.",
            alternatives: ["Set a nightly phone alarm to do a quick 'power sweep' of your space.", "Use smart plugs to auto-schedule high-draw devices."]
          },
          shopping: {
            type: 'bad',
            reality: "Fast fashion items are worn an average of just 7 times before being discarded.",
            alternatives: ["Check if the item exists secondhand before buying new.", "Ask yourself: 'Will I wear this 30 times?' before checkout."]
          },
          custom: {
            type: 'bad',
            reality: "This action has a higher environmental cost than you might think.",
            alternatives: ["Research a lower-impact alternative for next time.", "Track this habit to see how small swaps add up over a month."]
          }
        };
        return NextResponse.json(badFallbacks[activity.categoryId] || badFallbacks.custom);
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt: string;

    if (isGood) {
      prompt = `
        You are a warm, creative environmental coach.
        The user just logged a LOW-IMPACT, ECO-FRIENDLY action: "${activity.label}" (category: "${activity.categoryId}", emissions: ${activity.emissionsValue}kg CO2e).
        
        This is a GOOD action. Celebrate it! Then give 2 bonus tips to go even further.
        
        RULES:
        - The praise should be 1-2 sentences, warm, specific to "${activity.label}", and make the user feel genuinely proud.
        - The 2 bonus tips should be creative, unconventional, and directly related to "${activity.label}".
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
        The user just logged a HIGH-IMPACT action: "${activity.label}" (category: "${activity.categoryId}", emissions: ${activity.emissionsValue}kg CO2e).
        
        This is a BAD action for the environment. Be honest about the impact, then suggest 2 better alternatives.
        
        RULES:
        - "reality" should be 1-2 sentences explaining the real environmental cost of "${activity.label}" using a vivid, relatable comparison (not shaming, but eye-opening).
        - The 2 alternatives should be practical, specific swaps directly related to "${activity.label}".
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
        responseMimeType: "application/json",
        temperature: 0.9,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({
      type: 'good',
      praise: "Every conscious choice matters. You're building awareness with each step.",
      bonusTips: ["Reflect on today's choice before bed.", "Share your journey with someone you care about."]
    });
  }
}
