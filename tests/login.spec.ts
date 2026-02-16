import { test, expect } from '@playwright/test';

test('has title and login form', async ({ page }) => {
  await page.goto('/login');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/moozup-admin/i);
  
  // Check for heading
  await expect(page.getByRole('heading', { name: 'Moozup Admin' })).toBeVisible();
  
  // Check for inputs
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('login flow', async ({ page }) => {
  await page.goto('/login');

  // Fill credentials
  await page.getByLabel('Email address').fill('admin@moozup.com');
  await page.getByLabel('Password').fill('Admin@123');
  
  // Click Sign in
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for navigation or success message
  // If login succeeds, it navigates to / (Dashboard)
  // We can check URL or a dashboard element
  // But since we are mocking/running against local backend, it might fail if backend not running.
  // We'll check if we get redirected or error.
  
  // If backend is running (which it should be from previous steps), this should pass.
  // Note: The webServer config in playwright.config.ts starts the frontend.
  // The backend must be running separately.
  
  // Assert URL changes to root
  await expect(page).toHaveURL('/');
  
  // Assert Dashboard content (optional)
  // await expect(page.getByText('Dashboard')).toBeVisible();
});
