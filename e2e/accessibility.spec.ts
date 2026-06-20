import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/login'];

test.describe('Accessibility smoke tests — axe-core', () => {
  for (const route of ROUTES) {
    test(`${route} has zero critical/serious axe violations`, async ({ page }) => {
      await page.goto(route);

      // Wait for the page to be fully rendered
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const criticalOrSerious = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      if (criticalOrSerious.length > 0) {
        console.log(`Axe violations on ${route}:`);
        criticalOrSerious.forEach((v) => {
          console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
          v.nodes.forEach((n) => console.log(`    → ${n.html}`));
        });
      }

      expect(criticalOrSerious.length).toBe(0);
    });
  }
});
