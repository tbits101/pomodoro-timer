const { test, expect } = require('@playwright/test');

test.describe('Health Mode Tests', () => {
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
        await page.click('button[data-category="health"]', { force: true });
    });

    test('should display Breathing instructions', async ({ page }) => {
        await page.click('button[data-mode="breath"]', { force: true });
        const instruction = page.locator('#breath-instruction');
        await expect(instruction).toBeVisible();
        await expect(instruction).toHaveText('Ready?');
    });

    test('should change breathing pattern', async ({ page }) => {
        await page.click('button[data-mode="breath"]', { force: true });
        const sessionItems = page.locator('.breath-session-item');
        await expect(sessionItems).toHaveCount(6); // Box, 4-7-8, Relax, Prep, Deep, Custom

        await page.click('button[data-session="box"]');
        await expect(page.locator('#time-display')).toHaveText('02:00'); // Based on script.js BREATH_SESSIONS.box.duration
    });

    test('should handle Grounding mode', async ({ page }) => {
        await page.click('button[data-mode="grounding"]', { force: true });
        const instruction = page.locator('#grounding-instruction');
        await expect(instruction).toBeVisible();
        await expect(page.locator('#time-display')).toHaveText('05:00');

        await page.click('#start-btn', { force: true });
        await expect(instruction).toContainText('Focus on');
    });
});

test.describe('Sport Mode Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('button[data-category="sport"]', { force: true });
    });

    test('should configure and run Intervals', async ({ page }) => {
        await page.click('button[data-mode="interval"]', { force: true });
        const workInput = page.locator('#interval-work');
        const restInput = page.locator('#interval-rest');

        await workInput.fill('30');
        await restInput.fill('15');

        await page.click('#start-btn', { force: true });
        await expect(page.locator('#time-display')).toHaveText('00:30');
        await expect(page.locator('#session-counter')).toContainText('Cycle 1');
    });

    test('should run Stopwatch', async ({ page }) => {
        await page.click('button[data-mode="stopwatch"]', { force: true });
        await expect(page.locator('#time-display')).toHaveText('00:00');

        await page.click('#start-btn', { force: true });
        await page.waitForTimeout(1100);
        const time = await page.locator('#time-display').innerText();
        expect(time).not.toBe('00:00');
    });
});
