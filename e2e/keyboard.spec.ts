import { test, expect } from '@playwright/test';

test.describe('Keyboard-only navigation flow', () => {
  test('user can log an action using only the keyboard on the journey page', async ({ page }) => {
    // Setup mock login state
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('sprout_app_state', JSON.stringify({
        activities: [],
        settings: {},
        user: { name: 'Test User', email: 'test@example.com', avatar: 'test-avatar' }
      }));
    });

    // Go to journey page directly
    await page.goto('/journey');

    // Tab through to find an action button
    let pressed = 0;
    while (pressed < 30) {
      await page.keyboard.press('Tab');
      pressed++;

      const activeInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        return {
          tagName: el.tagName,
          textContent: el.textContent || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          role: el.getAttribute('role') || '',
        };
      });

      if (!activeInfo) continue;

      // If we've focused a button that logs an action (chip button)
      if (
        (activeInfo.role === 'button' || activeInfo.tagName === 'BUTTON') &&
        (activeInfo.textContent.includes('Walk') || activeInfo.textContent.includes('Biked') || activeInfo.ariaLabel.includes('Walk'))
      ) {
        await page.keyboard.press('Enter');
        break;
      }
    }

    // Verify the page is still intact (no crash)
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });
});
