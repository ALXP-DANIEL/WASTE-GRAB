import { expect, test } from '@playwright/test';

import { addresses, mockPickupApi, pickupRequest } from './pickup-test-utils';

test('customer pickup list supports active, completed, and cancelled filters', async ({
  page,
}) => {
  await mockPickupApi(page, {
    pickupRequests: [
      pickupRequest,
      {
        ...pickupRequest,
        id: 'completed-pickup-id',
        status: 'COMPLETED',
        aiClassificationLabel: 'Paper',
        completedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        ...pickupRequest,
        id: 'cancelled-pickup-id',
        status: 'CANCELLED',
        aiClassificationLabel: 'Plastic',
      },
    ],
  });

  await page.goto('/customer/pickups');

  await expect(page.getByText('My Requests')).toBeVisible();
  await expect(page.getByRole('link', { name: /#PICKUP-R/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /#COMPLET/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /#CANCEL/ })).toBeVisible();

  await page.getByRole('button', { name: 'Active' }).click();
  await expect(page.getByRole('link', { name: /#PICKUP-R/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /#COMPLET/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /#CANCEL/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Completed' }).click();
  await expect(page.getByRole('link', { name: /#COMPLET/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /#PICKUP-R/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Cancelled' }).click();
  await expect(page.getByRole('link', { name: /#CANCEL/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /#COMPLET/ })).toHaveCount(0);
});

test('customer can view and cancel a pickup request', async ({ page }) => {
  let currentPickup = { ...pickupRequest };
  await mockPickupApi(page, {
    pickupRequests: [currentPickup],
    getPickupRequest: () => currentPickup,
    cancelPickupRequest: () => {
      currentPickup = { ...currentPickup, status: 'CANCELLED' };
      return currentPickup;
    },
  });

  await page.goto('/customer/pickups/pickup-request-id');

  await expect(page.getByRole('heading', { name: 'pickup-request-id' })).toBeVisible();
  await expect(page.getByText('Plastic, Paper')).toBeVisible();
  await expect(page.getByText(addresses[0].formattedAddress).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await page.getByRole('button', { name: 'Cancel Request' }).last().click();

  await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toHaveCount(0);
});

test('new pickup page blocks creation while an active request exists', async ({
  page,
}) => {
  await mockPickupApi(page, { pickupRequests: [pickupRequest] });

  await page.goto('/customer/new-pickup');

  await expect(page.getByText('Active request already exists')).toBeVisible();
  await expect(page.getByText('You already have an active pickup request.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'View My Requests' })).toBeVisible();
});
