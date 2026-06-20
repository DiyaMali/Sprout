import { test, expect } from '@playwright/test';

test.describe('Sprout Core Flow', () => {
  test('should log an activity, update the UI, and generate insight (fallback)', async ({ page }) => {
    // 1. Setup mock login state
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('sprout_app_state', JSON.stringify({
        activities: [],
        settings: {},
        user: { name: 'Test User', email: 'test@example.com', avatar: 'test-avatar' }
      }));
    });

    // 2. Go to journey page
    await page.goto('/journey');

    // Check title contains "Your Living Garden"
    await expect(page.locator('h1')).toContainText('Your Living Garden');

    // Make sure no choices are logged today yet
    await expect(page.locator('text=No choices logged today yet')).toBeVisible();

    // 3. Log an activity
    await page.click('button:has-text("Walked or Biked")');

    // Wait for the Instant Feedback to appear to confirm the log was processed
    await expect(page.locator('text=Great Choice!').or(page.locator('text=Consider This'))).toBeVisible({ timeout: 10000 });

    // Verify it is added to today's choices
    await expect(page.locator('h3:has-text("Walked or Biked")').first()).toBeVisible();

    // 4. Navigate to Weekly Card page to view/export the canvas snapshot
    await page.goto('/weekly');
    await expect(page.locator('h1')).toContainText('choices helped my garden bloom');
    await expect(page.locator('canvas')).toHaveCount(1);
  });

  test('should allow setting an API key in settings', async ({ page }) => {
    await page.goto('/');

    // Open settings
    await page.click('button[aria-label="Settings"]');
    
    // Fill key
    await page.fill('input#apiKey', 'test-fake-key');
    
    // Save
    await page.click('button:has-text("Save")');

    // Settings should close
    await expect(page.locator('text=Settings')).toHaveCount(0);

    // Reopen and check if saved
    await page.click('button[aria-label="Settings"]');
    await expect(page.locator('input#apiKey')).toHaveValue('test-fake-key');
  });
});
