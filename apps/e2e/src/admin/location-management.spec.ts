import { expect, test, type Page } from '@playwright/test';

import { admin } from './admin-test-utils';

type LocationRecord = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  createdBy: string | null;
};

const existingLocation: LocationRecord = {
  id: 'location-id',
  name: 'Central Market',
  address: 'Jalan Hang Kasturi',
  city: 'Kuala Lumpur',
  state: 'WP Kuala Lumpur',
  postalCode: '50050',
  googlePlaceId: null,
  latitude: 3.1457,
  longitude: 101.6954,
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: admin.id,
};

test('admin can create a collection location from the management page', async ({ page }) => {
  const locations = [existingLocation];
  await mockAdminLocationApi(page, locations);

  await page.goto('/admin/locations');

  await expect(page.getByRole('heading', { name: 'Collection Locations', exact: true })).toBeVisible();
  await expect(page.getByRole('table').getByText('Central Market')).toBeVisible();

  await page.getByRole('button', { name: 'New Location' }).first().click();
  await expect(page.getByRole('heading', { name: 'Create Location' })).toBeVisible();

  await page.getByPlaceholder('Central Market').fill('Bukit Bintang Dropoff');
  await page.getByRole('button', { name: 'Create Location' }).click();

  await expect(page.getByRole('table').getByText('Bukit Bintang Dropoff')).toBeVisible();
});

async function mockAdminLocationApi(page: Page, locations: LocationRecord[]): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: admin } });
  });

  await page.route('**/api/admin/locations', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON() as Partial<LocationRecord>;
      const created: LocationRecord = {
        ...existingLocation,
        ...payload,
        id: 'bukit-bintang-id',
        address: payload.address ?? null,
        city: payload.city ?? null,
        state: payload.state ?? null,
        postalCode: payload.postalCode ?? null,
        googlePlaceId: payload.googlePlaceId ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        createdAt: '2026-01-02T00:00:00.000Z',
      };

      locations.unshift(created);
      await route.fulfill({ status: 201, json: created });
      return;
    }

    await route.fulfill({ json: locations });
  });
}
