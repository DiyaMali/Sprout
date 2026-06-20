import { useState, useEffect } from 'react';
import { InsightResponse, LoggedActivity } from '../types';

/**
 * Custom hook to fetch and manage AI carbon insights based on activities and scores.
 *
 * @param activities - Logged activities list.
 * @param geminiApiKey - Optional override API key.
 * @param weeklyEmissions - Sum of carbon emissions over the rolling week.
 * @param score - Calculated eco score.
 * @returns An object containing the current insight data and loading state.
 */
export function useInsight(
  activities: LoggedActivity[],
  geminiApiKey: string | undefined,
  weeklyEmissions: number,
  score: number,
) {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function fetchInsight() {
      if (active) {
        setLoading(true);
      }
      if (activities.length === 0) {
        if (active) {
          setInsight({
            insight:
              'Awaiting your first step. Log an activity to begin your journey of awareness.',
            suggestion:
              'Visit your Garden and log a sustainable choice to see it grow.',
            title: 'First Steps',
            quote: 'The journey of a thousand miles begins with a single step.',
          });
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity: activities[0],
            weeklyEmissions,
            score,
            apiKeyOverride: geminiApiKey,
          }),
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        if (active) {
          setInsight(data);
        }
      } catch {
        if (active) {
          setInsight({
            insight:
              "The choices you've made are not just ripples, but waves of intent. Your awareness acts as the sunlight that filters through the canopy of your daily routine.",
            suggestion:
              "Transition your evening routine to a 'Low-Lumen' hour.",
            title: 'Deepen the Root',
            quote:
              'Sustainability is not a destination, but a state of being conscious in every moment.',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchInsight();

    return () => {
      active = false;
    };
  }, [activities, geminiApiKey, weeklyEmissions, score]);

  return { insight, loading };
}
