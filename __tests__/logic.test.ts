import {
  computeEmissions,
  computeWeeklyEmissions,
  computeRollingScore,
  computePlantStage,
  computeStreaks,
  getPlantStageDescription,
  STAGE_THRESHOLDS,
  STAGE_NAMES,
  ECO_FRIENDLY_THRESHOLD,
  SCORE_MIN,
  SCORE_MAX,
  POINTS_PER_GOOD_ACTION,
  POINTS_PER_BAD_ACTION,
} from '../src/lib/logic';
import { LoggedActivity, PlantStage } from '../src/lib/types';

// ─── Shared fixture ───────────────────────────────────────────────────────────

const baseActivity: LoggedActivity = {
  id: 'test-id',
  timestamp: Date.now(),
  categoryId: 'transport',
  optionId: 't_walk',
  label: 'Walked or Biked',
  emissionsValue: 0,
};

function makeActivity(overrides: Partial<LoggedActivity> = {}): LoggedActivity {
  return { ...baseActivity, ...overrides };
}

// ─── computeEmissions ────────────────────────────────────────────────────────

describe('computeEmissions', () => {
  it('returns 0 when called with a zero-value activity', () => {
    expect(computeEmissions(makeActivity({ emissionsValue: 0 }))).toBe(0);
  });

  it('returns the correct value for a transport category option', () => {
    expect(computeEmissions(makeActivity({ categoryId: 'transport', emissionsValue: 4.5 }))).toBe(4.5);
  });

  it('returns the correct value for a meal category option', () => {
    expect(computeEmissions(makeActivity({ categoryId: 'meal', emissionsValue: 5.5 }))).toBe(5.5);
  });

  it('returns the correct value for an energy category option', () => {
    expect(computeEmissions(makeActivity({ categoryId: 'energy', emissionsValue: 6.0 }))).toBe(6.0);
  });

  it('returns the correct value for a shopping category option', () => {
    expect(computeEmissions(makeActivity({ categoryId: 'shopping', emissionsValue: 3.0 }))).toBe(3.0);
  });

  it('clamps negative input values to 0 — never returns a negative number', () => {
    expect(computeEmissions(makeActivity({ emissionsValue: -5 }))).toBe(0);
    expect(computeEmissions(makeActivity({ emissionsValue: -0.001 }))).toBe(0);
  });

  it('handles an extreme outlier input (10 000 kg) without crashing', () => {
    const result = computeEmissions(makeActivity({ emissionsValue: 10000 }));
    expect(result).toBe(10000);
  });

  it('returns a number type, never NaN or undefined', () => {
    const result = computeEmissions(makeActivity({ emissionsValue: 1.2 }));
    expect(typeof result).toBe('number');
    expect(result).not.toBeNaN();
  });
});

// ─── computeRollingScore (computeWeeklyEcoScore equivalent) ──────────────────

describe('computeRollingScore', () => {
  it('returns 0 when called with an empty activity array', () => {
    expect(computeRollingScore([])).toBe(0);
  });

  it('returns a positive score when all activities are the lowest-carbon options', () => {
    const goodActivities = [
      makeActivity({ emissionsValue: 0 }),
      makeActivity({ emissionsValue: 0.5 }),
      makeActivity({ emissionsValue: 1.5 }),
    ];
    expect(computeRollingScore(goodActivities)).toBe(3 * POINTS_PER_GOOD_ACTION);
  });

  it('returns a negative (minimum) score when all activities are the highest-carbon options', () => {
    const badActivities = Array.from({ length: 15 }, () =>
      makeActivity({ emissionsValue: 50 }),
    );
    expect(computeRollingScore(badActivities)).toBe(SCORE_MIN);
  });

  it('returns a value between SCORE_MIN and SCORE_MAX for a mixed set of activities', () => {
    const mixed = [
      makeActivity({ emissionsValue: 0 }),
      makeActivity({ emissionsValue: 4.5 }),
      makeActivity({ emissionsValue: 1.2 }),
    ];
    const score = computeRollingScore(mixed);
    expect(score).toBeGreaterThanOrEqual(SCORE_MIN);
    expect(score).toBeLessThanOrEqual(SCORE_MAX);
  });

  it('score for 7 good days is higher than score for 1 day of all-bad choices', () => {
    const sevenGood = Array.from({ length: 7 }, () => makeActivity({ emissionsValue: 0 }));
    const oneBad = [makeActivity({ emissionsValue: 50 })];
    expect(computeRollingScore(sevenGood)).toBeGreaterThan(computeRollingScore(oneBad));
  });

  it('handles an array with a single activity', () => {
    expect(computeRollingScore([makeActivity({ emissionsValue: 0 })])).toBe(POINTS_PER_GOOD_ACTION);
    expect(computeRollingScore([makeActivity({ emissionsValue: 5 })])).toBe(POINTS_PER_BAD_ACTION);
  });

  it('handles an array with 100+ activities without performance regression', () => {
    const activities = Array.from({ length: 150 }, () => makeActivity({ emissionsValue: 0 }));
    const start = performance.now();
    const score = computeRollingScore(activities);
    const elapsed = performance.now() - start;
    expect(score).toBe(SCORE_MAX); // capped at 100
    expect(elapsed).toBeLessThan(100); // well under 100ms
  });

  it('uses ECO_FRIENDLY_THRESHOLD as the boundary (boundary value)', () => {
    const exactlyOnThreshold = makeActivity({ emissionsValue: ECO_FRIENDLY_THRESHOLD });
    expect(computeRollingScore([exactlyOnThreshold])).toBe(POINTS_PER_GOOD_ACTION);

    const justOverThreshold = makeActivity({ emissionsValue: ECO_FRIENDLY_THRESHOLD + 0.01 });
    expect(computeRollingScore([justOverThreshold])).toBe(POINTS_PER_BAD_ACTION);
  });
});

// ─── computePlantStage ───────────────────────────────────────────────────────

describe('computePlantStage', () => {
  it('returns wilted for a score of 0 (lowest stage)', () => {
    expect(computePlantStage(0)).toBe('wilted');
  });

  it('returns the correct stage for each threshold boundary value', () => {
    // Test every threshold in STAGE_THRESHOLDS against STAGE_NAMES
    STAGE_THRESHOLDS.forEach((threshold: number, i: number) => {
      const expected = STAGE_NAMES[i] as PlantStage;
      expect(computePlantStage(threshold)).toBe(expected);
    });
  });

  it('returns flourishing for a score of 100 (highest stage)', () => {
    expect(computePlantStage(100)).toBe('flourishing');
  });

  it('returns wilted for a negative score (out of range)', () => {
    expect(computePlantStage(-1)).toBe('wilted');
    expect(computePlantStage(-100)).toBe('wilted');
  });

  it('returns wilted for a score above 100 (out of range)', () => {
    expect(computePlantStage(101)).toBe('wilted');
    expect(computePlantStage(999)).toBe('wilted');
  });

  it('never returns a value outside the valid PlantStage union', () => {
    const validStages: PlantStage[] = ['wilted', 'seedling', 'budding', 'blooming', 'flourishing'];
    for (let score = 0; score <= 100; score++) {
      const result = computePlantStage(score);
      expect(validStages).toContain(result);
    }
  });

  it('is deterministic — same input always returns same output', () => {
    for (const score of [0, 20, 50, 80, 100]) {
      expect(computePlantStage(score)).toBe(computePlantStage(score));
    }
  });

  it('returns seedling for scores in the seedling range (1–20)', () => {
    expect(computePlantStage(1)).toBe('seedling');
    expect(computePlantStage(10)).toBe('seedling');
    expect(computePlantStage(20)).toBe('seedling');
  });

  it('returns budding for scores in the budding range (21–50)', () => {
    expect(computePlantStage(21)).toBe('budding');
    expect(computePlantStage(35)).toBe('budding');
    expect(computePlantStage(50)).toBe('budding');
  });

  it('returns blooming for scores in the blooming range (51–80)', () => {
    expect(computePlantStage(51)).toBe('blooming');
    expect(computePlantStage(65)).toBe('blooming');
    expect(computePlantStage(80)).toBe('blooming');
  });
});

// ─── computeStreaks ───────────────────────────────────────────────────────────

describe('computeStreaks', () => {
  // Fixed reference "now": noon on an arbitrary day
  const NOW = new Date('2024-03-15T12:00:00.000Z').getTime();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  function daysAgo(n: number): number {
    return NOW - n * ONE_DAY;
  }

  it('returns 0 when no activities have been logged', () => {
    expect(computeStreaks([], NOW)).toBe(0);
  });

  it('returns 1 for a single activity logged today', () => {
    const activities = [makeActivity({ timestamp: daysAgo(0) })];
    expect(computeStreaks(activities, NOW)).toBe(1);
  });

  it('returns 1 for a single activity logged yesterday', () => {
    const activities = [makeActivity({ timestamp: daysAgo(1) })];
    expect(computeStreaks(activities, NOW)).toBe(1);
  });

  it('returns 0 when the last log was 2+ days ago (streak broken)', () => {
    const activities = [makeActivity({ timestamp: daysAgo(2) })];
    expect(computeStreaks(activities, NOW)).toBe(0);
  });

  it('returns the correct streak for 3 consecutive days', () => {
    const activities = [
      makeActivity({ timestamp: daysAgo(0) }),
      makeActivity({ timestamp: daysAgo(1) }),
      makeActivity({ timestamp: daysAgo(2) }),
    ];
    expect(computeStreaks(activities, NOW)).toBe(3);
  });

  it('stops counting when a day in the streak is missing', () => {
    const activities = [
      makeActivity({ timestamp: daysAgo(0) }),
      makeActivity({ timestamp: daysAgo(1) }),
      // gap on day 2
      makeActivity({ timestamp: daysAgo(3) }),
    ];
    expect(computeStreaks(activities, NOW)).toBe(2);
  });

  it('correctly handles a streak that spans a week boundary', () => {
    // 7 consecutive days including today
    const activities = Array.from({ length: 7 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i) }),
    );
    expect(computeStreaks(activities, NOW)).toBe(7);
  });

  it('returns the correct value when there are multiple logs on the same day', () => {
    const activities = [
      makeActivity({ timestamp: daysAgo(0) }),
      makeActivity({ timestamp: daysAgo(0) - 1000 }), // same day, different time
      makeActivity({ timestamp: daysAgo(0) - 2000 }), // same day
      makeActivity({ timestamp: daysAgo(1) }),
    ];
    expect(computeStreaks(activities, NOW)).toBe(2);
  });

  it('does NOT double-count a day with multiple activities', () => {
    // 5 logs all on the same day should count as 1 day
    const activities = Array.from({ length: 5 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(0) - i * 1000 }),
    );
    expect(computeStreaks(activities, NOW)).toBe(1);
  });

  it('handles 100+ activities without performance regression', () => {
    const activities = Array.from({ length: 100 }, (_, i) =>
      makeActivity({ timestamp: daysAgo(i % 30) }),
    );
    const start = performance.now();
    const result = computeStreaks(activities, NOW);
    const elapsed = performance.now() - start;
    expect(typeof result).toBe('number');
    expect(elapsed).toBeLessThan(100);
  });
});

// ─── computeWeeklyEmissions ──────────────────────────────────────────────────

describe('computeWeeklyEmissions', () => {
  const NOW = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  it('returns 0 when there are no activities', () => {
    expect(computeWeeklyEmissions([])).toBe(0);
  });

  it('sums emissions for activities within the 7-day rolling window', () => {
    const activities = [
      makeActivity({ timestamp: NOW, emissionsValue: 1.0 }),
      makeActivity({ timestamp: NOW - 3 * ONE_DAY, emissionsValue: 2.0 }),
      makeActivity({ timestamp: NOW - 6 * ONE_DAY, emissionsValue: 3.0 }),
    ];
    expect(computeWeeklyEmissions(activities, NOW)).toBe(6.0);
  });

  it('excludes activities outside the rolling window (too old or in the future)', () => {
    const activities = [
      makeActivity({ timestamp: NOW - 8 * ONE_DAY, emissionsValue: 10.0 }), // too old
      makeActivity({ timestamp: NOW + ONE_DAY, emissionsValue: 5.0 }),     // in future
      makeActivity({ timestamp: NOW - 2 * ONE_DAY, emissionsValue: 4.0 }),
    ];
    expect(computeWeeklyEmissions(activities, NOW)).toBe(4.0);
  });

  it('uses Date.now() as default now parameter', () => {
    const activities = [
      makeActivity({ timestamp: Date.now(), emissionsValue: 2.5 }),
    ];
    expect(computeWeeklyEmissions(activities)).toBe(2.5);
  });
});

// ─── getPlantStageDescription ────────────────────────────────────────────────

describe('getPlantStageDescription', () => {
  it('returns seed planting instruction when activityCount is 0', () => {
    expect(getPlantStageDescription('seedling', 0)).toContain('seed');
  });

  it('returns category-specific guidance based on stage when activityCount > 0', () => {
    expect(getPlantStageDescription('wilted', 1)).toContain('needs more');
    expect(getPlantStageDescription('seedling', 1)).toContain('Growing');
    expect(getPlantStageDescription('budding', 1)).toContain('shape');
    expect(getPlantStageDescription('blooming', 1)).toContain('Thriving');
    expect(getPlantStageDescription('flourishing', 1)).toContain('masterpiece');
  });

  it('safely handles fallback default case for unknown stages', () => {
    expect(getPlantStageDescription('invalid' as any, 1)).toContain('consistency');
  });
});
