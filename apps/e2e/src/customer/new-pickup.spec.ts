import { expect, test } from '@playwright/test';

import { addresses, imageFile, mockPickupApi } from './pickup-test-utils';

test('customer can analyze all uploaded images and create a pickup request', async ({
  page,
}) => {
  await mockPickupApi(page);
  await page.addInitScript(() => {
    window.localStorage.setItem('wastegrab-new-pickup-tour-complete', 'true');
  });

  await page.goto('/customer/new-pickup');
  await expect(page.getByText('Upload Images')).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles([
    imageFile('first-waste.png'),
    imageFile('second-waste.png'),
  ]);

  await expect(page.getByAltText('Pickup image 1')).toBeVisible();
  await expect(page.getByAltText('Pickup image 2')).toBeVisible();

  await page.getByLabel('Analyze images with AI').click();
  await expect(page.getByText('Image 1')).toBeVisible();
  await expect(page.getByText('Plastic x1', { exact: true })).toBeVisible();
  await expect(page.getByText('Paper x1')).toBeVisible();
  await page.getByRole('button', { name: 'Review Items' }).click();

  await expect(page.getByText('Review Waste Items')).toBeVisible();
  const itemsStep = page.locator('[data-tour="pickup-items"]');
  await expect(itemsStep.getByText('Plastic', { exact: true }).first()).toBeVisible();
  await expect(itemsStep.getByText('Paper', { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Weight').first()).toHaveValue('2');

  await page.getByRole('button', { name: /^Next$/ }).click();
  await expect(page.getByText('Pickup Details')).toBeVisible();
  const pickupStep = page.locator('[data-tour="pickup-address"]');
  await expect(
    pickupStep.getByText(addresses[0].formattedAddress, { exact: true }).first(),
  ).toBeVisible();

  await page.getByRole('button', { name: /^Next$/ }).click();
  await expect(page.getByText('Review the request before saving.')).toBeVisible();

  await page.getByRole('button', { name: 'Request Pickup' }).click();
  await expect(page.getByText('Pickup request created')).toBeVisible();
});
