import { test, expect } from '@playwright/test';

test.describe('Events Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email address').fill('admin@moozup.com');
    await page.getByLabel('Password').fill('Admin@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate to Events page
    await page.getByRole('link', { name: 'Events', exact: true }).click();
    await expect(page).toHaveURL('/events');
  });

  test('should display events list or empty state', async ({ page }) => {
    // Check for page header
    await expect(page.getByRole('heading', { name: 'Events', exact: true })).toBeVisible();
    
    // Check if either event cards exist OR empty state exists
    const eventCards = page.locator('.group.relative'); // Assuming card class
    const emptyState = page.getByText('No events found');
    
    await expect(eventCards.first().or(emptyState)).toBeVisible();
  });

  test('should open create event modal', async ({ page }) => {
    // Click Create Event button
    await page.getByRole('button', { name: 'Create Event' }).click();
    
    // Verify modal is visible
    await expect(page.getByText('Basic Information')).toBeVisible();
    
    // Check form fields in Step 1
    // Note: Some inputs might not have labels fully associated yet or might use different matching strategies
    // We can use getByPlaceholder if getByLabel fails, or check generic visibility
    await expect(page.getByPlaceholder('Enter event name')).toBeVisible();
    await expect(page.getByPlaceholder('Enter event description')).toBeVisible();
    
    await expect(page.getByPlaceholder('Enter event name')).toBeEditable();
    
    // Check if Close button exists (usually X icon), if not we can press Escape or click outside
    // For now, let's just verify the modal content is there
  });
});
