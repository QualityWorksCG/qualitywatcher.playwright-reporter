import { test, expect } from '@playwright/test';

test('[S100C1] Verify that the user can navigate to the getting started page', async ({
  page,
}) => {
  // Go to https://playwright.dev/
  await page.goto('https://playwright.dev/');
  // Click text=Get started
  await page.locator('text=Get started').click();
  await expect(page).toHaveURL('https://playwright.dev/docs/intro');
  // Click h1:has-text("Getting started")
  await page.locator('h1:has-text("Getting started")').click();
});
