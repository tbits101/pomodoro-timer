const { test, expect } = require('@playwright/test');

test.describe('Kitchen Mode Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.addStyleTag({
            content: `
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0s !important;
                scroll-behavior: auto !important;
            }
        `});
        await page.click('button[data-category="kitchen"]');
    });

    test('should run Multi-Timer Dashboard', async ({ page }) => {
        await page.click('button[data-mode="multi"]');
        const addBtn = page.locator('#add-timer-btn');
        await expect(addBtn).toBeVisible();

        await addBtn.click();
        const timerCards = page.locator('.timer-card');
        await expect(timerCards).toHaveCount(1);

        // Add another one with preset
        await page.click('.preset-time-btn[data-time="180"]');
        await expect(timerCards).toHaveCount(2);
        await expect(timerCards.nth(1).locator('.timer-digits')).toHaveText('03:00');
    });

    test('should run Grill Master', async ({ page }) => {
        await page.click('button[data-mode="grill"]');
        await expect(page.locator('#grill-presets')).toBeVisible();

        await page.click('.grill-btn[data-time="300"]'); // Medium
        await expect(page.locator('#time-display')).toHaveText('05:00');
    });
});

test.describe('Utility Mode Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('button[data-category="utility"]');
    });

    test('should run General Countdown', async ({ page }) => {
        await page.click('button[data-mode="countdown"]');
        await expect(page.locator('#time-display')).toHaveText('10:00');
    });

    test('should handle Deadline Timer', async ({ page }) => {
        await page.click('button[data-mode="deadline"]');
        const deadlineInput = page.locator('#deadline-input');
        await expect(deadlineInput).toBeVisible();

        // Set a future date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 16);
        await deadlineInput.fill(dateStr);

        await page.click('#start-btn');
        await expect(page.locator('#time-display')).toContainText('d');
    });
});
