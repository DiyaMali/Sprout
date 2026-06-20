import { ACTIVITY_OPTIONS } from '../../src/lib/carbonData';
import { ActivityCategory } from '../../src/lib/types';

const CATEGORIES: ActivityCategory[] = ['transport', 'meal', 'energy', 'shopping'];

describe('carbonData — ACTIVITY_OPTIONS', () => {
  it('has at least one entry for every category', () => {
    for (const category of CATEGORIES) {
      const options = ACTIVITY_OPTIONS.filter((o) => o.category === category);
      expect(options.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a numeric emissionsValue that is 0 or greater (non-negative)', () => {
    for (const option of ACTIVITY_OPTIONS) {
      expect(typeof option.emissionsValue).toBe('number');
      expect(option.emissionsValue).toBeGreaterThanOrEqual(0);
      expect(option.emissionsValue).not.toBeNaN();
    }
  });

  it('no two entries in the same category share the same label', () => {
    for (const category of CATEGORIES) {
      const labels = ACTIVITY_OPTIONS
        .filter((o) => o.category === category)
        .map((o) => o.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    }
  });

  it('every entry has a non-empty id and label', () => {
    for (const option of ACTIVITY_OPTIONS) {
      expect(option.id.trim().length).toBeGreaterThan(0);
      expect(option.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('each entry belongs to a valid category', () => {
    for (const option of ACTIVITY_OPTIONS) {
      expect(CATEGORIES).toContain(option.category);
    }
  });

  it('lookup by id is unique — no two entries share the same id', () => {
    const ids = ACTIVITY_OPTIONS.map((o) => o.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('filtering by an unknown category returns an empty array gracefully', () => {
    const result = ACTIVITY_OPTIONS.filter(
      // @ts-expect-error testing unknown category
      (o) => o.category === 'unknown_category',
    );
    expect(result).toHaveLength(0);
  });

  it('has at least one zero-emissions option (eco-friendly baseline)', () => {
    const zeroOptions = ACTIVITY_OPTIONS.filter((o) => o.emissionsValue === 0);
    expect(zeroOptions.length).toBeGreaterThan(0);
  });

  it('has at least one high-emissions option (> 3 kg CO2e) for realistic comparison', () => {
    const highOptions = ACTIVITY_OPTIONS.filter((o) => o.emissionsValue > 3);
    expect(highOptions.length).toBeGreaterThan(0);
  });
});
