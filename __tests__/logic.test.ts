import { computeEmissions, computeWeeklyEmissions, computeRollingScore, computePlantStage, computeStreaks } from '../src/lib/logic';
import { LoggedActivity } from '../src/lib/types';

describe('logic.ts', () => {
  const mockActivity: LoggedActivity = {
    id: '1',
    timestamp: Date.now(),
    categoryId: 'transport',
    optionId: 't_walk',
    label: 'Walked or Biked',
    emissionsValue: 0,
  };

  describe('computeEmissions', () => {
    it('returns the emissions value of the activity', () => {
      expect(computeEmissions(mockActivity)).toBe(0);
      expect(computeEmissions({ ...mockActivity, emissionsValue: 5.5 })).toBe(5.5);
    });
  });

  describe('computeWeeklyEmissions', () => {
    it('returns 0 for no activities', () => {
      expect(computeWeeklyEmissions([])).toBe(0);
    });

    it('sums emissions for activities within the last 7 days', () => {
      const now = Date.now();
      const activities: LoggedActivity[] = [
        { ...mockActivity, emissionsValue: 10, timestamp: now - 1000 },
        { ...mockActivity, emissionsValue: 5, timestamp: now - 3 * 24 * 60 * 60 * 1000 },
        { ...mockActivity, emissionsValue: 20, timestamp: now - 8 * 24 * 60 * 60 * 1000 }, // outside 7 days
      ];
      expect(computeWeeklyEmissions(activities, now)).toBe(15);
    });
  });

  describe('computeRollingScore', () => {
    it('returns 100 for 0 emissions', () => {
      expect(computeRollingScore(0)).toBe(100);
    });

    it('returns 100 for negative emissions (edge case)', () => {
      expect(computeRollingScore(-5)).toBe(100);
    });

    it('returns 0 for >= 50 emissions', () => {
      expect(computeRollingScore(50)).toBe(0);
      expect(computeRollingScore(100)).toBe(0);
    });

    it('scales linearly between 0 and 50', () => {
      expect(computeRollingScore(25)).toBe(50);
      expect(computeRollingScore(10)).toBe(80);
    });
  });

  describe('computePlantStage', () => {
    it('returns wilted for score <= 20', () => {
      expect(computePlantStage(0)).toBe('wilted');
      expect(computePlantStage(20)).toBe('wilted');
      expect(computePlantStage(-10)).toBe('wilted');
    });

    it('returns seedling for score 21-40', () => {
      expect(computePlantStage(21)).toBe('seedling');
      expect(computePlantStage(40)).toBe('seedling');
    });

    it('returns budding for score 41-60', () => {
      expect(computePlantStage(41)).toBe('budding');
      expect(computePlantStage(60)).toBe('budding');
    });

    it('returns blooming for score 61-80', () => {
      expect(computePlantStage(61)).toBe('blooming');
      expect(computePlantStage(80)).toBe('blooming');
    });

    it('returns flourishing for score 81-100', () => {
      expect(computePlantStage(81)).toBe('flourishing');
      expect(computePlantStage(100)).toBe('flourishing');
      expect(computePlantStage(110)).toBe('wilted'); // Edge case fallback
    });
  });

  describe('computeStreaks', () => {
    it('returns 0 for no activities', () => {
      expect(computeStreaks([])).toBe(0);
    });

    it('returns 1 for activity today only', () => {
      const now = Date.now();
      expect(computeStreaks([{ ...mockActivity, timestamp: now }], now)).toBe(1);
    });

    it('returns 1 for activity yesterday only', () => {
      const now = Date.now();
      expect(computeStreaks([{ ...mockActivity, timestamp: now - 24 * 60 * 60 * 1000 }], now)).toBe(1);
    });

    it('returns 0 if last activity was 2 days ago', () => {
      const now = Date.now();
      expect(computeStreaks([{ ...mockActivity, timestamp: now - 2 * 24 * 60 * 60 * 1000 }], now)).toBe(0);
    });

    it('counts consecutive days correctly', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const now = today.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      const activities: LoggedActivity[] = [
        { ...mockActivity, timestamp: now }, // today
        { ...mockActivity, timestamp: now - oneDay }, // yesterday
        { ...mockActivity, timestamp: now - 2 * oneDay }, // 2 days ago
        { ...mockActivity, timestamp: now - 4 * oneDay }, // 4 days ago (streak broken)
      ];

      expect(computeStreaks(activities, now)).toBe(3);
    });

    it('counts multiple activities on the same day as 1 day', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const now = today.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      const activities: LoggedActivity[] = [
        { ...mockActivity, timestamp: now }, // today
        { ...mockActivity, timestamp: now - 1000 }, // today again
        { ...mockActivity, timestamp: now - oneDay }, // yesterday
      ];

      expect(computeStreaks(activities, now)).toBe(2);
    });
  });
});
