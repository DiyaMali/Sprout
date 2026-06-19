import { LoggedActivity, PlantStage } from './types';

// Compute the emissions for a single logged activity
export function computeEmissions(activity: LoggedActivity): number {
  return activity.emissionsValue;
}

// Compute the total emissions for the last 7 days
export function computeWeeklyEmissions(activities: LoggedActivity[], now: number = Date.now()): number {
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  return activities
    .filter(a => a.timestamp >= sevenDaysAgo && a.timestamp <= now)
    .reduce((total, a) => total + a.emissionsValue, 0);
}

// Compute daily score (0 to 100) based on emissions.
// Score scales linearly between 0 and 50 emissions (where 0 emissions = 100 score, >= 50 emissions = 0 score).
export function computeRollingScore(totalEmissions: number): number {
  return Math.max(0, Math.min(100, 100 - (totalEmissions * 2)));
}

// Map a 0-100 score to a plant stage
export function computePlantStage(score: number): PlantStage {
  if (score < 0 || score > 100) return 'wilted';
  if (score <= 20) return 'wilted';
  if (score <= 40) return 'seedling';
  if (score <= 60) return 'budding';
  if (score <= 80) return 'blooming';
  return 'flourishing'; // 81-100
}

// Get a description for the current plant stage
export function getPlantStageDescription(stage: PlantStage, activityCount: number): string {
  if (activityCount === 0) return 'Log your first action to plant a seed';
  switch (stage) {
    case 'wilted': return 'Your garden needs more eco-friendly choices';
    case 'seedling': return 'Growing! Keep making green decisions';
    case 'budding': return 'Your garden is taking shape beautifully';
    case 'blooming': return 'Thriving with your consistent good choices';
    case 'flourishing': return 'A masterpiece of sustainable living';
    default: return 'Health depends on consistency';
  }
}

// Compute consecutive days of logging activity
export function computeStreaks(activities: LoggedActivity[], now: number = Date.now()): number {
  if (activities.length === 0) return 0;
  
  const days = Array.from(new Set(activities.map(a => {
    const d = new Date(a.timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))).sort((a, b) => b.localeCompare(a));

  if (days.length === 0) return 0;

  let streak = 0;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  let currentCheckDate = new Date(today);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (!days.includes(todayStr) && !days.includes(yesterdayStr)) {
    return 0;
  }

  if (!days.includes(todayStr) && days.includes(yesterdayStr)) {
    currentCheckDate = yesterday;
  }

  while (true) {
    const checkStr = `${currentCheckDate.getFullYear()}-${String(currentCheckDate.getMonth() + 1).padStart(2, '0')}-${String(currentCheckDate.getDate()).padStart(2, '0')}`;
    
    if (days.includes(checkStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
