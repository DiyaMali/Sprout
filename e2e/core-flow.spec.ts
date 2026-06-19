import { test, expect } from '@playwright/test';

test.describe('Sprout Core Flow', () => {
  test('should log an activity, update the UI, and generate insight (fallback)', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.locator('h1')).toContainText('Your Garden');

    // Make sure Weekly card is not present yet
    await expect(page.locator('text=Your Weekly Snapshot')).toHaveCount(0);

    // Log an activity
    await page.click('button:has-text("Walked or Biked")');

    // Wait for the Weekly card to appear, which proves the flow completed
    await expect(page.locator('text=Your Weekly Snapshot')).toBeVisible({ timeout: 10000 });
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
