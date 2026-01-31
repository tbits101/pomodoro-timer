const { test, expect } = require('@playwright/test');

test.describe('Tasks and History', () => {
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

    test('should manage tasks in queue', async ({ page }) => {
        const taskInput = page.locator('#task-input');
        const taskList = page.locator('#task-list');

        await taskInput.fill('Task 1');
        await page.keyboard.press('Enter');
        await expect(taskList).toContainText('Task 1');

        await taskInput.fill('Task 2');
        await page.keyboard.press('Enter');
        await expect(taskList).toContainText('Task 2');

        // Edit task
        const taskItem = taskList.locator('.task-item-text').first();
        await taskItem.click();
        await page.keyboard.type(' Edited');
        await page.keyboard.press('Enter');
        await expect(taskItem).toHaveText('Task 1 Edited');

        // Delete task
        await taskList.locator('.delete-task-btn').first().click();
        await expect(taskList).not.toContainText('Task 1 Edited');
    });

    test('should record history after timer finish', async ({ page }) => {
        // We can't wait 25 mins. 
        // We can either mock the timer in the script or use a very short custom time.

        // Switch to short break (5 mins)
        await page.click('button[data-mode="short"]');

        // Set custom time to 1 second for testing
        const timeDisplay = page.locator('#time-display');
        await timeDisplay.click();
        await timeDisplay.fill('00:01');
        await page.keyboard.press('Enter');

        await page.click('#start-btn');

        // Wait for it to finish and ring
        await page.waitForTimeout(2000);

        await page.click('#history-btn');
        const historyList = page.locator('#history-list');
        await expect(historyList).toContainText('Short Break');
    });

    test('should persist data in localStorage', async ({ page }) => {
        await page.locator('#task-input').fill('Persistent Task');
        await page.keyboard.press('Enter');

        await page.reload();
        await expect(page.locator('#task-list')).toContainText('Persistent Task');
    });
});
