import { useMemo } from 'react';
import { LoggedActivity } from '../types';
import {
  computeWeeklyEmissions,
  computeRollingScore,
  computePlantStage,
  computeStreaks,
  getPlantStageDescription,
} from '../logic';
import {
  STREAK_PRISTINE,
  STREAK_RICH,
  LUMINOSITY_RADIANT,
  LUMINOSITY_HIGH,
  LUMINOSITY_MODERATE,
} from '../constants';

/**
 * Custom hook to calculate all plant growth metrics and environmental statistics reactively.
 *
 * @param activities - Logged activities list.
 * @returns The compiled environmental and botanical metrics state.
 */
export function usePlantStage(activities: LoggedActivity[]) {
  return useMemo(() => {
    const totalEmissions = computeWeeklyEmissions(activities);
    const score = computeRollingScore(activities);
    const plantStage = computePlantStage(score);
    const stageDescription = getPlantStageDescription(
      plantStage,
      activities.length,
    );
    const streakLength = computeStreaks(activities);

    let soilHealth = 'Dry';
    if (streakLength > STREAK_PRISTINE) {
      soilHealth = 'Pristine';
    } else if (streakLength > STREAK_RICH) {
      soilHealth = 'Rich';
    } else if (streakLength > 0) {
      soilHealth = 'Developing';
    }

    let luminosity = 'Low';
    if (score >= LUMINOSITY_RADIANT) {
      luminosity = 'Radiant';
    } else if (score >= LUMINOSITY_HIGH) {
      luminosity = 'High';
    } else if (score >= LUMINOSITY_MODERATE) {
      luminosity = 'Moderate';
    }

    return {
      totalEmissions,
      score,
      plantStage,
      stageDescription,
      streakLength,
      soilHealth,
      luminosity,
    };
  }, [activities]);
}
