const { test, expect } = require('@playwright/test');

test.describe('Grill Master Functionality', () => {
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

        // Navigate to Kitchen -> Grill Master
        await page.click('button[data-category="kitchen"]', { force: true });
        await page.click('button[data-mode="grill"]', { force: true });
    });

    test('should display Grill Dashboard', async ({ page }) => {
        const dashboard = page.locator('#grill-dashboard');
        await expect(dashboard).toBeVisible();
        await expect(page.locator('#grill-dashboard .quick-presets')).toBeVisible();
    });

    test('should add a Steak timer via preset', async ({ page }) => {
        // Click Steak preset (first one)
        await page.locator('.emoji-preset-btn[data-name="Steak Medium"]').click();

        // Check availability in grid
        const card = page.locator('.timer-card').first();
        await expect(card).toBeVisible();
        await expect(card.locator('.timer-name')).toHaveValue('Steak Medium 1');
        await expect(card.locator('.timer-digits')).toHaveText('06:00'); // 360s
    });

    test('should start and run a grill timer', async ({ page }) => {
        // Monitor console
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // Add timer
        await page.locator('.emoji-preset-btn[data-name="Burger"]').click();

        const card = page.locator('.timer-card').first();
        const startBtn = card.locator('.card-btn.start');
        const digits = card.locator('.timer-digits');

        await expect(digits).toHaveText('08:00');

        // Start
        await startBtn.click();

        // Verify button changed to Pause (logic executed)
        const pauseBtn = card.locator('.card-btn.pause');
        await expect(pauseBtn).toBeVisible();

        // Wait for tick (increase to 2s to be safe)
        await page.waitForTimeout(2000);

        // Verify time changed
        const timeText = await digits.innerText();
        console.log(`Time after wait: ${timeText}`);
        expect(timeText).not.toBe('08:00');
    });

    test('should delete a grill timer', async ({ page }) => {
        await page.locator('.emoji-preset-btn[data-name="Corn"]').click();
        await expect(page.locator('.timer-card')).toHaveCount(1);

        await page.locator('.timer-close-btn').click();
        await expect(page.locator('.timer-card')).toHaveCount(0);
    });
});
