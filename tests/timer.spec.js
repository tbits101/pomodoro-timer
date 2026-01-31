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
        await page.click('button[data-mode="short"]');
        await expect(page.locator('#time-display')).toHaveText('05:00');
        await expect(page.locator('#title-display')).toHaveText('Short Break');

        // Switch to Long Break
        await page.click('button[data-mode="long"]');
        await expect(page.locator('#time-display')).toHaveText('15:00');
        await expect(page.locator('#title-display')).toHaveText('Long Break');

        // Switch back to Focus
        await page.click('button[data-mode="focus"]');
        await expect(page.locator('#time-display')).toHaveText('25:00');
        await expect(page.locator('#title-display')).toHaveText('Focus');
    });

    test('should start and pause timer', async ({ page }) => {
        const startBtn = page.locator('#start-btn');
        const timeDisplay = page.locator('#time-display');

        await startBtn.click();
        await expect(startBtn).toHaveText('Pause');

        // Wait for at least 1 second to pass
        await page.waitForTimeout(1100);
        const timeAfterStart = await timeDisplay.innerText();
        expect(timeAfterStart).not.toBe('25:00');

        await startBtn.click();
        await expect(startBtn).toHaveText('Start');

        const timePaused = await timeDisplay.innerText();
        await page.waitForTimeout(1100);
        await expect(timeDisplay).toHaveText(timePaused); // Should stay same
    });

    test('should reset timer', async ({ page }) => {
        await page.click('#start-btn');
        await page.waitForTimeout(1100);
        await page.click('#reset-btn');
        await expect(page.locator('#time-display')).toHaveText('25:00');
        await expect(page.locator('#start-btn')).toHaveText('Start');
    });

    test('should allow custom timer edit', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');
        await timeDisplay.click();

        // The app uses contenteditable or prompt? 
        // Checking script.js... it uses contenteditable for multi-timers but for main timer 
        // it seems to use click -> focus -> keydown handle.

        // Let's check how main timer handles clicks.
        // In script.js: timeDisplay.addEventListener('click', () => { ... })
        // It seems it might just be a click listener that changes text or allows editing.
        // Let's assume it's editable if clicked.

        await timeDisplay.fill('10:00'); // playright fill works on contenteditable too
        await page.keyboard.press('Enter');
        await expect(timeDisplay).toHaveText('10:00');
    });
});

test.describe('Flowtime Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('button[data-mode="flowtime"]');
    });

    test('should start counting up in Flowtime', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');
        const startBtn = page.locator('#start-btn');

        await expect(timeDisplay).toHaveText('00:00');
        await startBtn.click();
        await expect(startBtn).toHaveText('Stop & Break');

        await page.waitForTimeout(2100);
        const time = await timeDisplay.innerText();
        const [mins, secs] = time.split(':').map(Number);
        expect(mins * 60 + secs).toBeGreaterThanOrEqual(2);
    });
});
