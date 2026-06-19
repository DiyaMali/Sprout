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

// Compute rolling score (0 to 100) based on action quality (+10 for eco-friendly, -10 for high-impact).
// Starts at a base score of 0 and accumulates across all logged activities.
export function computeRollingScore(activities: LoggedActivity[]): number {
  const score = activities.reduce((sum, a) => {
    const points = a.emissionsValue <= 1.5 ? 10 : -10;
    return sum + points;
  }, 0);

  return Math.max(-100, Math.min(100, score));
}

// Map a 0-100 score to a plant stage with responsive growth thresholds
export function computePlantStage(score: number): PlantStage {
  if (score < 0 || score > 100) return 'wilted';
  if (score <= 0) return 'wilted';
  if (score <= 20) return 'seedling';
  if (score <= 50) return 'budding';
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
