/**
 * Activity category types for Sprout carbon tracking.
 */
export type ActivityCategory = 'transport' | 'meal' | 'energy' | 'shopping';

/**
 * Represents a predefined activity option selection.
 */
export interface ActivityOption {
  /** The unique key identifying the option. */
  id: string;
  /** Human-readable name of the option. */
  label: string;
  /** The category this option belongs to. */
  category: ActivityCategory;
  /** Kilograms of CO2e carbon footprint estimate. */
  emissionsValue: number;
}

/**
 * Represents a single instance of a logged activity habit.
 */
export interface LoggedActivity {
  /** Unique tracking ID (UUID). */
  id: string;
  /** Unix epoch millisecond timestamp when the activity was logged. */
  timestamp: number;
  /** The category category ID. */
  categoryId: ActivityCategory;
  /** The selected option ID. */
  optionId: string;
  /** The label description of the logged choice. */
  label: string;
  /** Kilograms of carbon footprint associated with the choice. */
  emissionsValue: number;
}

/**
 * Visual growth and health stages of the digital garden plant organism.
 */
export type PlantStage =
  | 'wilted'
  | 'seedling'
  | 'budding'
  | 'blooming'
  | 'flourishing';

/**
 * Weekly aggregation metrics summarizing user environmental impact.
 */
export interface WeeklyState {
  /** Clamped eco score between 0 and 100 representing positive decisions. */
  score: number;
  /** Plant growth visual stage corresponding to the eco score. */
  plantStage: PlantStage;
  /** Uninterrupted daily activity streak count. */
  streakLength: number;
  /** Total kilograms of carbon emissions compiled over the rolling week. */
  totalEmissions: number;
}

/**
 * Structured response properties returned from the Gemini AI insights compiler.
 */
export interface InsightResponse {
  /** Warm narrative contextualizing user behavior in nature metaphors. */
  insight: string;
  /** Concrete alternative action step recommendation for next time. */
  suggestion: string;
  /** Short motivational title for the next step. */
  title?: string;
  /** Inspiring quote about nature and consciousness. */
  quote?: string;
}

/**
 * Archive keepsake template details saved in the client's Garden Gallery.
 */
export interface SavedWeeklyCard {
  /** Unique ID. */
  id: string;
  /** Saved card timestamp. */
  timestamp: number;
  /** Score compiled for the week. */
  score: number;
  /** Plant stage reached. */
  plantStage: PlantStage;
  /** Streak count reached. */
  streakLength: number;
  /** Total footprint savings. */
  totalEmissions: number;
  /** Visual customization theme. */
  theme: 'ethereal' | 'blueprint';
  /** Toggle whether the botanical SVG is shown. */
  showIllustration: boolean;
  /** Toggle whether numerical scores are shown in footers. */
  showMetrics: boolean;
  /** Calendar range string representing the report period. */
  dateRange: string;
}

/**
 * Main application client-side state schema.
 */
export interface AppState {
  /** List of logged activities history. */
  activities: LoggedActivity[];
  /** App-wide preferences. */
  settings: {
    /** Optional API key override supplied in local panel settings. */
    geminiApiKey?: string;
  };
  /** Hydrated session profile details. */
  user?: {
    /** Full name. */
    name: string;
    /** Email address. */
    email: string;
    /** dicebear avatar URL reference. */
    avatar: string;
  } | null;
  /** Saved keepsake gallery cards list. */
  savedCards?: SavedWeeklyCard[];
}
