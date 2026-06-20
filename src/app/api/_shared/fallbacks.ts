/**
 * Poetic offline reflections used in chat when API key is missing.
 */
export const OFFLINE_CHAT_REFLECTIONS = [
  'In the quiet of our routines, we find our highest agency. Swapping one drive for public transit can prevent roughly 4.5kg of carbon emissions.',
  'A plant-powered plate is a landscape of healing. Opting for a plant-based meal today helps conserve soil health and clear the skies.',
  'Unplugging a device silences the phantom currents that run unseen through our walls. Small awarenesses form deep roots over time.',
  'Choosing secondhand extends the lifecycle of our shared artifacts. It is an act of preservation, utility, and refined taste.',
] as const;

/**
 * Standard error response structures and offline fallbacks.
 */
export const FALLBACKS = {
  chatOffline: () => {
    const randomReflection =
      OFFLINE_CHAT_REFLECTIONS[
        Math.floor(Math.random() * OFFLINE_CHAT_REFLECTIONS.length)
      ];
    return {
      role: 'assistant' as const,
      content: `I am currently in offline mode, but here is a reflection for you:\n\n*"${randomReflection}"*\n\nTo unlock conversational coaching, please supply your Gemini API Key in the settings panel (gear icon) in the header!`,
    };
  },
  chatError: () => ({
    role: 'assistant' as const,
    content:
      "I hit a small snag. Let's focus on simple habits today while I get back on my feet!",
  }),
  evaluateError: () => ({
    label: 'Eco Action',
    emissionsValue: 0.5,
  }),
  feedbackOffline: (categoryId: string, isGood: boolean) => {
    if (isGood) {
      const goodFallbacks: Record<
        string,
        { type: 'good'; praise: string; bonusTips: string[] }
      > = {
        transport: {
          type: 'good',
          praise:
            'Incredible choice! You just kept emissions at near-zero for this trip.',
          bonusTips: [
            "Map a scenic walking route you haven't tried before.",
            'Invite a friend to walk with you next time for shared impact.',
          ],
        },
        meal: {
          type: 'good',
          praise:
            'A plant-powered meal is one of the single highest-impact daily choices you can make.',
          bonusTips: [
            'Try growing one herb at home for your next dish.',
            "Explore a farmer's market this weekend for ultra-local ingredients.",
          ],
        },
        energy: {
          type: 'good',
          praise:
            'Turning things off is the simplest, most powerful habit. Well done.',
          bonusTips: [
            'Use a power strip to kill phantom loads in one click.',
            'Open curtains for natural light instead of flipping a switch.',
          ],
        },
        shopping: {
          type: 'good',
          praise:
            "Restraint is a superpower. You just proved the most sustainable product is the one you don't buy.",
          bonusTips: [
            'Try a 30-day wishlist rule before any purchase.',
            'Organize a swap event with friends for things you need.',
          ],
        },
        custom: {
          type: 'good',
          praise:
            "That's a thoughtful, low-impact choice. Your garden thanks you.",
          bonusTips: [
            'Journal this habit to build momentum.',
            'Share this win with someone to inspire them.',
          ],
        },
      };
      return goodFallbacks[categoryId] || goodFallbacks.custom;
    } else {
      const badFallbacks: Record<
        string,
        { type: 'bad'; reality: string; alternatives: string[] }
      > = {
        transport: {
          type: 'bad',
          reality:
            "Solo driving emits roughly 4.5kg CO2 per trip — that's like charging your phone 540 times.",
          alternatives: [
            'Try carpooling with a colleague even once this week.',
            'Combine multiple errands into a single trip to cut mileage in half.',
          ],
        },
        meal: {
          type: 'bad',
          reality:
            'Red meat has one of the highest carbon footprints of any single food item.',
          alternatives: [
            'Swap beef for chicken in your favourite recipe — it cuts emissions by 60%.',
            "Try one 'Meatless Monday' this week as an experiment.",
          ],
        },
        energy: {
          type: 'bad',
          reality:
            'Leaving everything running overnight can waste as much energy as a short road trip.',
          alternatives: [
            "Set a nightly phone alarm to do a quick 'power sweep' of your space.",
            'Use smart plugs to auto-schedule high-draw devices.',
          ],
        },
        shopping: {
          type: 'bad',
          reality:
            'Fast fashion items are worn an average of just 7 times before being discarded.',
          alternatives: [
            'Check if the item exists secondhand before buying new.',
            "Ask yourself: 'Will I wear this 30 times?' before checkout.",
          ],
        },
        custom: {
          type: 'bad',
          reality:
            'This action has a higher environmental cost than you might think.',
          alternatives: [
            'Research a lower-impact alternative for next time.',
            'Track this habit to see how small swaps add up over a month.',
          ],
        },
      };
      return badFallbacks[categoryId] || badFallbacks.custom;
    }
  },
  feedbackError: () => ({
    type: 'good' as const,
    praise:
      "Every conscious choice matters. You're building awareness with each step.",
    bonusTips: [
      "Reflect on today's choice before bed.",
      'Share your journey with someone you care about.',
    ],
  }),
  insightOffline: (label: string, emissionsValue: number) => ({
    insight: `Every choice adds up. Your recent log of "${label}" has a footprint of ${emissionsValue}kg CO2e.`,
    suggestion:
      'Consider a lower-impact alternative next time you are in this situation.',
    title: 'Deepen the Root',
    quote:
      'Sustainability is not a destination, but a state of being conscious in every moment.',
  }),
  insightError: () => ({
    insight:
      'Small steps shape the world. Your activity has been logged successfully.',
    suggestion:
      'Try exploring other low-impact options in this category tomorrow.',
    title: 'Keep Growing',
    quote: 'Every leaf that falls nourishes the soil for the next season.',
  }),
};
