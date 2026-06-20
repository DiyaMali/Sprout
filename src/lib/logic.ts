import { LoggedActivity, PlantStage } from './types';
import {
  ECO_FRIENDLY_THRESHOLD,
  POINTS_PER_BAD_ACTION,
  POINTS_PER_GOOD_ACTION,
  ROLLING_WINDOW_DAYS,
  SCORE_MAX,
  SCORE_MIN,
  STAGE_NAMES,
  STAGE_THRESHOLDS,
  MS_IN_DAY,
} from './constants';

export {
  ECO_FRIENDLY_THRESHOLD,
  POINTS_PER_BAD_ACTION,
  POINTS_PER_GOOD_ACTION,
  ROLLING_WINDOW_DAYS,
  SCORE_MAX,
  SCORE_MIN,
  STAGE_NAMES,
  STAGE_THRESHOLDS,
  MS_IN_DAY,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns a YYYY-MM-DD string for the given timestamp (local time).
 *
 * @param timestamp - The epoch milliseconds time.
 * @returns A formatted string YYYY-MM-DD.
 */
function toDateString(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the emissions value for a single logged activity.
 * Always returns a non-negative number.
 *
 * @param activity - The logged activity selection.
 * @returns The non-negative emission value in kg CO2e.
 */
export function computeEmissions(activity: LoggedActivity): number {
  return Math.max(0, activity.emissionsValue);
}

/**
 * Sums emissions for activities within the last ROLLING_WINDOW_DAYS days.
 * O(n) — single filter+reduce pass.
 *
 * @param activities - Logged activities array history.
 * @param now - Current reference timestamp in epoch milliseconds.
 * @returns Total carbon emissions sum.
 */
export function computeWeeklyEmissions(
  activities: LoggedActivity[],
  now: number = Date.now(),
): number {
  const windowStart = now - ROLLING_WINDOW_DAYS * MS_IN_DAY;
  return activities
    .filter((a) => a.timestamp >= windowStart && a.timestamp <= now)
    .reduce((total, a) => total + a.emissionsValue, 0);
}

/**
 * Rolling score (clamped to [SCORE_MIN, SCORE_MAX]).
 * +POINTS_PER_GOOD_ACTION for eco-friendly actions, POINTS_PER_BAD_ACTION otherwise.
 * O(n) — single reduce pass.
 *
 * @param activities - Logged activities array history.
 * @returns The overall calculated weekly score clamped between -100 and 100.
 */
export function computeRollingScore(activities: LoggedActivity[]): number {
  const raw = activities.reduce((sum, a) => {
    const points =
      a.emissionsValue <= ECO_FRIENDLY_THRESHOLD
        ? POINTS_PER_GOOD_ACTION
        : POINTS_PER_BAD_ACTION;
    return sum + points;
  }, 0);
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, raw));
}

/**
 * Maps a numeric score to a PlantStage using STAGE_THRESHOLDS.
 * O(k) where k = number of stages (constant 5).
 * Returns 'wilted' for out-of-range scores.
 *
 * @param score - A weekly score value between -100 and 100.
 * @returns Corresponding PlantStage name string.
 */
export function computePlantStage(score: number): PlantStage {
  if (score < 0 || score > SCORE_MAX) return 'wilted';
  // Find the last threshold the score satisfies
  let stageIndex = 0;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    const threshold = STAGE_THRESHOLDS[i];
    if (threshold !== undefined && score >= threshold) {
      stageIndex = i;
    }
  }
  const stage = STAGE_NAMES[stageIndex] as PlantStage;
  return stage;
}

/**
 * Returns a human-readable description for the current plant stage.
 *
 * @param stage - The visual PlantStage name.
 * @param activityCount - The number of logged activities.
 * @returns Friendly poetic status text.
 */
export function getPlantStageDescription(
  stage: PlantStage,
  activityCount: number,
): string {
  if (activityCount === 0) return 'Log your first action to plant a seed';
  switch (stage) {
    case 'wilted':
      return 'Your garden needs more eco-friendly choices';
    case 'seedling':
      return 'Growing! Keep making green decisions';
    case 'budding':
      return 'Your garden is taking shape beautifully';
    case 'blooming':
      return 'Thriving with your consistent good choices';
    case 'flourishing':
      return 'A masterpiece of sustainable living';
    default:
      return 'Health depends on consistency';
  }
}

/**
 * Computes consecutive days of logging activity (streak).
 * O(n) — builds a Set of date strings in one pass, then walks backward from today.
 * Multiple logs on the same day count as 1 day.
 * The streak is preserved if today OR yesterday has a log.
 *
 * @param activities - Logged activities array history.
 * @param now - Current reference timestamp in epoch milliseconds.
 * @returns Uninterrupted logging streak length.
 */
export function computeStreaks(
  activities: LoggedActivity[],
  now: number = Date.now(),
): number {
  if (activities.length === 0) return 0;

  // Build O(n) Set of logged date strings
  const daySet = new Set(activities.map((a) => toDateString(a.timestamp)));

  const todayStr = toDateString(now);
  const yesterday = now - MS_IN_DAY;
  const yesterdayStr = toDateString(yesterday);

  // Streak is broken if neither today nor yesterday has a log
  if (!daySet.has(todayStr) && !daySet.has(yesterdayStr)) return 0;

  // Start counting from today or yesterday, whichever has a log
  let cursor = daySet.has(todayStr) ? now : yesterday;
  let streak = 0;

  while (daySet.has(toDateString(cursor))) {
    streak++;
    cursor -= MS_IN_DAY;
  }

  return streak;
}
