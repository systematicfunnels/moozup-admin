import { test, expect } from '@playwright/test';

test.describe('Feature Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email address').fill('admin@moozup.com');
    await page.getByLabel('Password').fill('Admin@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should toggle feature settings for an event', async ({ page }) => {
    // Navigate to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');

    // Wait for the select to be populated.
    const eventSelect = page.locator('header select');
    await expect(eventSelect).toBeVisible();
    
    // Check if options are loaded (more than 1 option: default "Select an event" + at least 1 event)
    // We might need to wait for events to load.
    await expect(async () => {
      const count = await eventSelect.locator('option').count();
      expect(count).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });

    // Select the second option (first actual event)
    const firstEventValue = await eventSelect.locator('option').nth(1).getAttribute('value');
    if (!firstEventValue) throw new Error('No event found to select');
    
    await eventSelect.selectOption(firstEventValue);

    // Verify "Event Features" section is visible
    await expect(page.getByText('Event Features')).toBeVisible();

    // Find a toggle switch.
    // There should be "Agenda", "NewsFeed", etc.
    // We look for a row that has "Agenda" text and a switch
    const agendaRow = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'Agenda' });
    const agendaSwitch = agendaRow.locator('button[role="switch"]');
    await expect(agendaSwitch).toBeVisible();

    // Get initial state
    const isChecked = await agendaSwitch.getAttribute('aria-checked') === 'true';
    
    // Toggle it
    await agendaSwitch.click();

    // Verify state changed
    await expect(agendaSwitch).toHaveAttribute('aria-checked', (!isChecked).toString());
    
    // Reload page to verify persistence (context should persist in localStorage)
    await page.reload();
    
    // Wait for settings to load again
    await expect(page.getByText('Event Features')).toBeVisible();
    
    const agendaRowAfter = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'Agenda' });
    const agendaSwitchAfter = agendaRowAfter.locator('button[role="switch"]');
    
    await expect(agendaSwitchAfter).toHaveAttribute('aria-checked', (!isChecked).toString());
    
    // Toggle back to restore state
    await agendaSwitchAfter.click();
    await expect(agendaSwitchAfter).toHaveAttribute('aria-checked', isChecked.toString());
  });
});
