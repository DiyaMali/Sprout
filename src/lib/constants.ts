/**
 * Application-wide constants for Sprout.
 * All magic numbers and configuration values live here.
 */

/** Emissions threshold (kg CO2e) below which an action is considered eco-friendly */
export const ECO_FRIENDLY_THRESHOLD = 1.5 as const;

/** Rolling score is clamped to [-100, 100] */
export const SCORE_MIN = -100 as const;
export const SCORE_MAX = 100 as const;

/** Points awarded/deducted per logged action */
export const POINTS_PER_GOOD_ACTION = 10 as const;
export const POINTS_PER_BAD_ACTION = -10 as const;

/** Number of days in the rolling window used for eco score calculation. */
export const ROLLING_WINDOW_DAYS = 7 as const;

/** Number of past weeks to retain in localStorage before pruning. */
export const STORAGE_RETENTION_WEEKS = 8 as const;

/** localStorage key prefix for all Sprout data. */
export const STORAGE_KEY_PREFIX = 'sprout' as const;

/** localStorage key for the application state. */
export const STORAGE_KEY = 'sprout_app_state' as const;

/** Eco score thresholds for each plant stage (index = stage number). */
export const STAGE_THRESHOLDS = [0, 1, 21, 51, 81] as const;

/** Stage names in the same order as STAGE_THRESHOLDS */
export const STAGE_NAMES = [
  'wilted',
  'seedling',
  'budding',
  'blooming',
  'flourishing',
] as const;

/** Human-readable label for each plant stage. */
export const STAGE_LABELS = [
  'Wilted',
  'Seedling',
  'Budding',
  'Blooming',
  'Flourishing',
] as const;

/** Encouraging description for each plant stage shown to screen readers and users. */
export const STAGE_DESCRIPTIONS = [
  'Your plant needs care — try a green choice today.',
  'A new beginning — small steps are growing.',
  'Progress is blooming — keep it up!',
  "You're thriving — great eco choices this week!",
  "Flourishing! You're making a real difference.",
] as const;

/** Maximum character length for user-submitted custom action descriptions. */
export const CUSTOM_ACTION_MAX_LENGTH = 500 as const;

/** Weekly streak length in days considered a full streak. */
export const WEEKLY_STREAK_LENGTH = 7 as const;

/** Streak is only counted if today or yesterday has a log */
export const STREAK_GRACE_DAYS = 1 as const;

/** Number of milliseconds in a single day (24 hours). */
export const MS_IN_DAY = 86_400_000 as const;

/** Streak length thresholds for soil health categorization. */
export const STREAK_PRISTINE = 10 as const;
export const STREAK_RICH = 3 as const;

/** Eco score thresholds for luminosity levels. */
export const LUMINOSITY_RADIANT = 80 as const;
export const LUMINOSITY_HIGH = 50 as const;
export const LUMINOSITY_MODERATE = 20 as const;
