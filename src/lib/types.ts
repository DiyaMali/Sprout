export type ActivityCategory = 'transport' | 'meal' | 'energy' | 'shopping';

export interface ActivityOption {
  id: string;
  label: string;
  category: ActivityCategory;
  emissionsValue: number; // in kg CO2e
}

export interface LoggedActivity {
  id: string;
  timestamp: number;
  categoryId: ActivityCategory;
  optionId: string;
  label: string;
  emissionsValue: number;
}

export type PlantStage = 
  | 'wilted' 
  | 'seedling' 
  | 'budding' 
  | 'blooming' 
  | 'flourishing';

export interface WeeklyState {
  score: number; // 0 to 100
  plantStage: PlantStage;
  streakLength: number; // consecutive days with activities logged
  totalEmissions: number; // total kg CO2e for the last 7 days
}

export interface InsightResponse {
  insight: string;
  suggestion: string;
  title?: string;
  quote?: string;
}

export interface SavedWeeklyCard {
  id: string;
  timestamp: number;
  score: number;
  plantStage: PlantStage;
  streakLength: number;
  totalEmissions: number;
  theme: 'ethereal' | 'blueprint';
  showIllustration: boolean;
  showMetrics: boolean;
  dateRange: string;
}

export interface AppState {
  activities: LoggedActivity[];
  settings: {
    geminiApiKey?: string;
  };
  user?: {
    name: string;
    email: string;
    avatar: string;
  } | null;
  savedCards?: SavedWeeklyCard[];
}
