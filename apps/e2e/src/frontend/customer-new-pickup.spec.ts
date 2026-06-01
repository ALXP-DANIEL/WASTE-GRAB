import { expect, test, type Page } from '@playwright/test';

const customer = {
  id: 'customer-id',
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: null,
  role: 'CUSTOMER',
  profileImageUrl: null,
  hasCompletedCustomerOnboarding: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const categories = [
  {
    id: 'plastic-id',
    name: 'Plastic',
    pointsPerKg: 2,
    averageWeightKg: '1',
    isBanned: false,
    isHazardous: false,
    isAiDetectable: true,
    description: 'Plastic waste',
  },
  {
    id: 'paper-id',
    name: 'Paper',
    pointsPerKg: 1,
    averageWeightKg: '2',
    isBanned: false,
    isHazardous: false,
    isAiDetectable: true,
    description: 'Paper waste',
  },
];

const addresses = [
  {
    id: 'address-id',
    userId: customer.id,
    label: 'Home',
    street: '1 Test Street',
    city: 'Kuala Lumpur',
    state: 'WP Kuala Lumpur',
    postalCode: '50000',
    country: 'Malaysia',
    formattedAddress: '1 Test Street, Kuala Lumpur, WP Kuala Lumpur 50000',
    latitude: null,
    longitude: null,
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

test('customer can analyze all uploaded images and create a pickup request', async ({
  page,
}) => {
  await mockApi(page);
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

async function mockApi(page: Page): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: customer } });
  });

  await page.route('**/api/waste-categories', async (route) => {
    await route.fulfill({ json: categories });
  });

  await page.route('**/api/customer/address', async (route) => {
    await route.fulfill({ json: addresses });
  });

  await page.route('**/api/customer/pickups', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        json: {
          pickupRequest: {
            id: 'pickup-request-id',
            userId: customer.id,
            collectorId: null,
            addressText: addresses[0].formattedAddress,
            status: 'PENDING',
            notes: null,
            aiClassificationLabel: null,
            aiConfidence: null,
            aiSuggestedPayload: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            completedAt: null,
            items: [],
            images: [],
          },
        },
      });
      return;
    }

    await route.fulfill({ json: { pickupRequests: [] } });
  });

  await page.route('**/api/roboflow-ai/analyze-image', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        result: {
          detectedWaste: ['Plastic', 'Paper'],
          detectedCategories: [
            {
              id: 'plastic-id',
              name: 'Plastic',
              count: 2,
              estimatedWeight: 2,
              points: 4,
            },
            {
              id: 'paper-id',
              name: 'Paper',
              count: 1,
              estimatedWeight: 2,
              points: 2,
            },
          ],
          images: [
            {
              index: 0,
              totalItems: 1,
              detectedCategories: [
                {
                  id: 'plastic-id',
                  name: 'Plastic',
                  count: 1,
                  estimatedWeight: 1,
                  points: 2,
                },
              ],
            },
            {
              index: 1,
              totalItems: 2,
              detectedCategories: [
                {
                  id: 'plastic-id',
                  name: 'Plastic',
                  count: 1,
                  estimatedWeight: 1,
                  points: 2,
                },
                {
                  id: 'paper-id',
                  name: 'Paper',
                  count: 1,
                  estimatedWeight: 2,
                  points: 2,
                },
              ],
            },
          ],
          counts: {
            Plastic: 2,
            Paper: 1,
          },
          totalItems: 3,
          estimatedWeight: 4,
          points: 6,
          size: 'Small',
          recyclable: 'Yes',
        },
      },
    });
  });
}

function imageFile(name: string) {
  return {
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    ),
  };
}
