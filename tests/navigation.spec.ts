import { test, expect } from '@playwright/test';

test('navigation to main pages', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin@moozup.com');
  await page.getByLabel('Password').fill('Admin@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');

  const links = [
    { name: 'Dashboard', url: '/' },
    { name: 'Events', url: '/events' },
    { name: 'Agenda', url: '/agenda' },
    { name: 'Sponsors', url: '/sponsors' },
    { name: 'Exhibitors', url: '/exhibitors' },
    { name: 'Official News', url: '/news' },
    { name: 'Social Feed', url: '/social' },
    { name: 'Directory', url: '/directory' },
    { name: 'Engagement', url: '/engagement' },
    { name: 'Gallery', url: '/gallery' },
    { name: 'Community', url: '/community' },
    { name: 'Moderation', url: '/moderation' },
    { name: 'Settings', url: '/settings' },
  ];

  for (const link of links) {
    // Navigate using sidebar
    await page.getByRole('link', { name: link.name, exact: true }).click();
    await expect(page).toHaveURL(link.url);
    
    // Verify header exists on the page
    if (link.url !== '/') { 
        // Handle specific header titles that differ from sidebar link names
        const headerMappings: Record<string, string> = {
          'Agenda': 'Agenda & Sessions',
          'Community': 'Communities'
        };
        const expectedHeader = headerMappings[link.name] || link.name;

        // Target H1 specifically to avoid matching other headings like "Active Events"
        // Increase timeout to 10s to account for API loading states on some pages (Directory, Community)
        await expect(page.getByRole('heading', { name: expectedHeader, level: 1 })).toBeVisible({ timeout: 10000 });
    }
  }
});
