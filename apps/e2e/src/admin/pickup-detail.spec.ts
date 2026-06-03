import { expect, test } from '@playwright/test';

import { admin } from './admin-test-utils';

const adminPickup = {
  id: 'admin-pickup-id',
  userId: 'customer-id',
  collectorId: 'collector-id',
  addressText: 'Admin Detail Address, Kuala Lumpur 50000',
  latitude: '3.1543000',
  longitude: '101.7042000',
  status: 'VERIFIED',
  notes: 'Admin should see the full shared pickup detail.',
  aiClassificationLabel: 'Paper',
  aiConfidence: null,
  aiSuggestedPayload: {
    source: 'seed-ai',
    items: [
      {
        categoryId: 'paper-id',
        estimatedWeight: 2,
      },
    ],
  },
  createdAt: '2026-06-01T08:00:00.000Z',
  completedAt: null,
  user: {
    id: 'customer-id',
    name: 'Detail Customer',
    email: 'customer@test.com',
  },
  collector: {
    id: 'collector-id',
    name: 'Detail Collector',
    email: 'collector@test.com',
  },
  items: [
    {
      id: 'paper-item-id',
      pickupRequestId: 'admin-pickup-id',
      categoryId: 'paper-id',
      estimatedWeight: '2.00',
      actualWeight: '2.40',
      category: {
        id: 'paper-id',
        name: 'Paper',
        pointsPerKg: 1,
      },
    },
  ],
  images: [],
};

test('admin pickup slug detail renders shared detail with admin-only category ids', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: admin } });
  });

  await page.route('**/api/admin/pickups/admin-pickup-id', async (route) => {
    await route.fulfill({ json: { pickupRequest: adminPickup } });
  });

  await page.goto('/admin/pickups/admin-pickup-id');

  await expect(page.getByRole('heading', { name: '#ADMIN-P' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Status Timeline' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pickup Items' })).toBeVisible();
  await expect(page.getByText('Category ID: paper-id')).toBeVisible();
  await expect(page.getByText('Detail Customer')).toBeVisible();
  await expect(page.getByText('Detail Collector')).toBeVisible();
});
