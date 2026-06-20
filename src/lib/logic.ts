import { LoggedActivity, PlantStage } from './types';

// ─── Named constants (single source of truth) ───────────────────────────────
/** Emissions threshold (kg CO2e) below which an action is considered eco-friendly */
export const ECO_FRIENDLY_THRESHOLD = 1.5;

/** Rolling score is clamped to [-100, 100] */
export const SCORE_MIN = -100;
export const SCORE_MAX = 100;

/** Points awarded/deducted per logged action */
export const POINTS_PER_GOOD_ACTION = 10;
export const POINTS_PER_BAD_ACTION = -10;

/**
 * Stage thresholds (inclusive lower bounds, ascending).
 * Index 0 → wilted, 1 → seedling, 2 → budding, 3 → blooming, 4 → flourishing.
 * This is the single source of truth used by both the logic and the test suite.
 */
export const STAGE_THRESHOLDS = [0, 1, 21, 51, 81] as const;

/** Stage names in the same order as STAGE_THRESHOLDS */
export const STAGE_NAMES: PlantStage[] = [
  'wilted',
  'seedling',
  'budding',
  'blooming',
  'flourishing',
];

/** How many days back "weekly" emissions covers */
export const ROLLING_WINDOW_DAYS = 7;

/** Streak is only counted if today or yesterday has a log */
export const STREAK_GRACE_DAYS = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a YYYY-MM-DD string for the given timestamp (local time) */
function toDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the emissions value for a single logged activity.
 * Always returns a non-negative number.
 */
export function computeEmissions(activity: LoggedActivity): number {
  return Math.max(0, activity.emissionsValue);
}

/**
 * Sums emissions for activities within the last ROLLING_WINDOW_DAYS days.
 * O(n) — single filter+reduce pass.
 */
export function computeWeeklyEmissions(
  activities: LoggedActivity[],
  now: number = Date.now(),
): number {
  const windowStart = now - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return activities
    .filter((a) => a.timestamp >= windowStart && a.timestamp <= now)
    .reduce((total, a) => total + a.emissionsValue, 0);
}

/**
 * Rolling score (clamped to [SCORE_MIN, SCORE_MAX]).
 * +POINTS_PER_GOOD_ACTION for eco-friendly actions, POINTS_PER_BAD_ACTION otherwise.
 * O(n) — single reduce pass.
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

/** Returns a human-readable description for the current plant stage. */
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
 */
export function computeStreaks(
  activities: LoggedActivity[],
  now: number = Date.now(),
): number {
  if (activities.length === 0) return 0;

  // Build O(n) Set of logged date strings
  const daySet = new Set(activities.map((a) => toDateString(a.timestamp)));

  const todayStr = toDateString(now);
  const yesterday = now - 24 * 60 * 60 * 1000;
  const yesterdayStr = toDateString(yesterday);

  // Streak is broken if neither today nor yesterday has a log
  if (!daySet.has(todayStr) && !daySet.has(yesterdayStr)) return 0;

  // Start counting from today or yesterday, whichever has a log
  let cursor = daySet.has(todayStr) ? now : yesterday;
  let streak = 0;

  while (daySet.has(toDateString(cursor))) {
    streak++;
    cursor -= 24 * 60 * 60 * 1000;
  }

  return streak;
}
