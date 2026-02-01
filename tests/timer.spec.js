const { test, expect } = require('@playwright/test');

test.describe('Core Timer Functionality', () => {
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
    });

    test('should display default Pomodoro time of 25:00', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');
        await expect(timeDisplay).toHaveText('25:00');
    });

    test('should switch modes correctly', async ({ page }) => {
        // Switch to Short Break
        await page.click('button[data-mode="short"]', { force: true });
        await expect(page.locator('#time-display')).toHaveText('05:00');
        await expect(page.locator('#title-display')).toHaveText('Short Break');

        // Switch to Long Break
        await page.click('button[data-mode="long"]', { force: true });
        await expect(page.locator('#time-display')).toHaveText('15:00');
        await expect(page.locator('#title-display')).toHaveText('Long Break');

        // Switch back to Focus
        await page.click('button[data-mode="focus"]', { force: true });
        await expect(page.locator('#time-display')).toHaveText('25:00');
        await expect(page.locator('#title-display')).toHaveText('Focus');
    });

    test('should start and pause timer', async ({ page }) => {
        const startBtn = page.locator('#start-btn');
        const timeDisplay = page.locator('#time-display');

        await startBtn.click({ force: true });
        await expect(startBtn).toHaveText('Pause');

        // Wait for at least 1 second to pass
        await page.waitForTimeout(1100);
        const timeAfterStart = await timeDisplay.innerText();
        expect(timeAfterStart).not.toBe('25:00');

        await startBtn.click({ force: true });
        await expect(startBtn).toHaveText('Start');

        const timePaused = await timeDisplay.innerText();
        await page.waitForTimeout(1100);
        await expect(timeDisplay).toHaveText(timePaused); // Should stay same
    });

    test('should reset timer', async ({ page }) => {
        await page.click('#start-btn', { force: true });
        await page.waitForTimeout(1100);
        await page.click('#reset-btn');
        await expect(page.locator('#time-display')).toHaveText('25:00');
        await expect(page.locator('#start-btn')).toHaveText('Start');
    });

    test('should allow custom timer edit', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');
        await timeDisplay.click();

        const timerInput = page.locator('.timer-input');
        await expect(timerInput).toBeVisible();
        await timerInput.fill('10:00');
        await page.keyboard.press('Enter');
        await expect(timeDisplay).toHaveText('10:00');
    });
});

test.describe('Flowtime Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('button[data-mode="flowtime"]', { force: true });
    });

    test('should start counting up in Flowtime', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');
        const startBtn = page.locator('#start-btn');

        await expect(timeDisplay).toHaveText('00:00');
        await startBtn.click({ force: true });
        await expect(startBtn).toHaveText('Stop & Break');

        await page.waitForTimeout(2100);
        const time = await timeDisplay.innerText();
        const [mins, secs] = time.split(':').map(Number);
        expect(mins * 60 + secs).toBeGreaterThanOrEqual(2);
    });
});
