import { test, expect } from '@playwright/test';

test.describe('Event Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email address').fill('admin@moozup.com');
    await page.getByLabel('Password').fill('Admin@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should create a new event successfully', async ({ page }) => {
    const timestamp = Date.now();
    const eventName = `E2E Event ${timestamp}`;
    
    // Navigate to Events page
    await page.getByRole('link', { name: 'Events', exact: true }).click();
    await expect(page).toHaveURL('/events');
    
    // Open Create Event Modal
    await page.getByRole('button', { name: 'Create Event' }).click();
    await expect(page.getByText('Basic Information')).toBeVisible();

    // Step 1: Basic Information
    await page.getByPlaceholder('Enter event name').fill(eventName);
    await page.getByPlaceholder('Enter event description').fill('This is an automated test event description.');
    
    // Dates (Using current date for start/end)
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="eventStartDate"]').fill(today);
    await page.locator('input[name="eventEndDate"]').fill(today);
    
    // Times
    await page.locator('input[name="startTime"]').fill('09:00');
    await page.locator('input[name="endTime"]').fill('17:00');
    
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 2: Location & Links
    await expect(page.getByText('Location & Links')).toBeVisible();
    await page.getByPlaceholder("Physical address or 'Online'").fill('Online Test Location');
    await page.getByPlaceholder('e.g. tech-conference-2024').fill(`test-event-${timestamp}`);
    await page.getByPlaceholder('https://example.com').fill('https://example.com');
    
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 3: Social & Integrations (Optional - skip)
    await expect(page.getByText('Social & Integrations')).toBeVisible();
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 4: Assets (Optional - skip files for now)
    await expect(page.getByText('Assets')).toBeVisible();
    
    // Submit
    // Note: The button text is 'Create Event' in step 4
    // Use type="submit" to target the modal button specifically, or scope to modal
    await page.locator('button[type="submit"]').click();

    // Verify Modal Closes
    await expect(page.getByText('Basic Information')).not.toBeVisible();

    // Verify Event Appears in List
    // The list uses React Query so it should update automatically if invalidation works
    // Use heading role to avoid matching dropdown options
    const eventHeading = page.getByRole('heading', { name: eventName });
    await expect(eventHeading).toBeVisible();
    
    // Cleanup: Delete the event
    // Find the card with the event name
    const eventCard = page.locator('.group', { has: eventHeading });
    
    // Setup dialog handler BEFORE checking/clicking
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    // Hover to show actions
    await eventCard.hover();
    
    // Click delete button
    // Target button inside the card that contains "Delete" text
    const deleteBtn = eventCard.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();
    
    // Verify event is removed
    // Use heading role to ensure we are checking the card removal
    await expect(eventHeading).not.toBeVisible({ timeout: 10000 });
    
    // Also check for any error message
    await expect(page.getByText('Failed to delete event')).not.toBeVisible();
  });
});
