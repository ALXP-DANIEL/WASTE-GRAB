import { type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

type TestPickupRequest = {
  id: string;
  userId: string;
  collectorId: string | null;
  addressText: string;
  status: string;
  notes: string | null;
  aiClassificationLabel: string | null;
  aiConfidence: string | null;
  aiSuggestedPayload: unknown;
  createdAt: string;
  completedAt: string | null;
  items: Array<{
    id: string;
    pickupRequestId: string;
    categoryId: string;
    estimatedWeight: string | null;
    actualWeight: string | null;
    category: {
      id: string;
      name: string;
      pointsPerKg: number;
    } | null;
  }>;
  images: Array<{
    id: string;
    pickupRequestId: string;
    imageUrl: string;
    imageType: string;
    uploadedAt: string;
  }>;
};

export const customer = {
  id: 'customer-id',
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: null,
  role: 'CUSTOMER',
  profileImageUrl: null,
  hasCompletedOnboarding: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const categories = [
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

export const addresses = [
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

export const pickupRequest: TestPickupRequest = {
  id: 'pickup-request-id',
  userId: customer.id,
  collectorId: null,
  addressText: addresses[0].formattedAddress,
  status: 'PENDING',
  notes: 'Place bags near the guardhouse',
  aiClassificationLabel: 'Plastic, Paper',
  aiConfidence: null,
  aiSuggestedPayload: {
    source: 'roboflow',
    items: [
      {
        categoryId: 'plastic-id',
        categoryName: 'Plastic',
        detectedCount: 2,
        estimatedWeight: 2,
        points: 4,
      },
      {
        categoryId: 'paper-id',
        categoryName: 'Paper',
        detectedCount: 1,
        estimatedWeight: 2,
        points: 2,
      },
    ],
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
  items: [
    {
      id: 'plastic-item-id',
      pickupRequestId: 'pickup-request-id',
      categoryId: 'plastic-id',
      estimatedWeight: '2',
      actualWeight: null,
      category: {
        id: 'plastic-id',
        name: 'Plastic',
        pointsPerKg: 2,
      },
    },
    {
      id: 'paper-item-id',
      pickupRequestId: 'pickup-request-id',
      categoryId: 'paper-id',
      estimatedWeight: '2',
      actualWeight: null,
      category: {
        id: 'paper-id',
        name: 'Paper',
        pointsPerKg: 1,
      },
    },
  ],
  images: [
    {
      id: 'pickup-image-id',
      pickupRequestId: 'pickup-request-id',
      imageUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      imageType: 'USER_UPLOAD',
      uploadedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

type MockApiOptions = {
  pickupRequests?: TestPickupRequest[];
  getPickupRequest?: () => TestPickupRequest;
  cancelPickupRequest?: () => TestPickupRequest;
};

export async function mockPickupApi(page: Page, options: MockApiOptions = {}): Promise<void> {
  const pickupRequests = options.pickupRequests ?? [];

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
            ...pickupRequest,
            notes: null,
            aiClassificationLabel: null,
            aiSuggestedPayload: null,
            items: [],
            images: [],
          },
        },
      });
      return;
    }

    await route.fulfill({ json: { pickupRequests } });
  });

  await page.route('**/api/customer/pickups/*/cancel', async (route) => {
    const pickup = options.cancelPickupRequest?.() ?? {
      ...(options.getPickupRequest?.() ?? pickupRequest),
      status: 'CANCELLED',
    };

    await route.fulfill({ json: { pickupRequest: pickup } });
  });

  await page.route('**/api/customer/pickups/*', async (route) => {
    await route.fulfill({
      json: {
        pickupRequest: options.getPickupRequest?.() ?? pickupRequests[0] ?? pickupRequest,
      },
    });
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

export function imageFile(name: string) {
  return {
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    ),
  };
}
