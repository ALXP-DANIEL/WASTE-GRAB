import { type Page } from '@playwright/test';

export type TestCollectorPickup = {
  id: string;
  userId: string;
  collectorId: string | null;
  addressText: string;
  latitude: string | null;
  longitude: string | null;
  status: string;
  notes: string | null;
  aiClassificationLabel: string | null;
  aiConfidence: string | null;
  aiSuggestedPayload: unknown;
  createdAt: string;
  completedAt: string | null;
  distanceKm: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  collector: {
    id: string;
    name: string;
    email: string;
  } | null;
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

export const collector = {
  id: 'collector-id',
  name: 'Test Collector',
  email: 'collector@test.com',
  phone: null,
  role: 'COLLECTOR',
  profileImageUrl: null,
  hasCompletedOnboarding: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const customer = {
  id: 'customer-id',
  name: 'Test Customer',
  email: 'customer@test.com',
};

export const collectionLocations = [
  {
    id: 'dropoff-klang-valley',
    name: 'WasteGrab Klang Valley Hub',
    address: 'Persiaran Kewajipan, USJ 1',
    city: 'Subang Jaya',
    state: 'Selangor',
    postalCode: '47600',
    latitude: 3.0611,
    longitude: 101.5922,
    googlePlaceId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'admin-id',
  },
  {
    id: 'dropoff-klang',
    name: 'WasteGrab Klang Drop-Off',
    address: 'Bandar Bukit Tinggi',
    city: 'Klang',
    state: 'Selangor',
    postalCode: '41200',
    latitude: 3.0079,
    longitude: 101.4454,
    googlePlaceId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'admin-id',
  },
];

export const pickupA = collectorPickup({
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  addressText: 'Stop A, Puchong, Selangor 47100',
  latitude: '3.0477000',
  longitude: '101.6174000',
  distanceKm: '1.00',
  status: 'VERIFIED',
});

export const pickupB = collectorPickup({
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  addressText: 'Stop B, Subang Jaya, Selangor 47500',
  latitude: '3.0744000',
  longitude: '101.5889000',
  distanceKm: '5.00',
  status: 'ACCEPTED',
});

export const completedPickup = collectorPickup({
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  addressText: 'Completed Stop, Petaling Jaya, Selangor 46200',
  latitude: '3.1191000',
  longitude: '101.6535000',
  distanceKm: '8.00',
  status: 'COMPLETED',
  completedAt: '2026-06-01T10:00:00.000Z',
});

type MockCollectorOptions = {
  pickups?: TestCollectorPickup[];
  getPickup?: (id: string) => TestCollectorPickup;
  onCompletePickup?: (id: string) => TestCollectorPickup;
  onArrivePickup?: (id: string) => TestCollectorPickup;
  onVerifyPickup?: (id: string) => TestCollectorPickup;
};

export async function mockCollectorApi(page: Page, options: MockCollectorOptions = {}): Promise<void> {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 3.02, longitude: 101.55 });

  await page.route('https://router.project-osrm.org/**', async (route) => {
    await route.fulfill({
      json: {
        routes: [
          {
            geometry: {
              type: 'LineString',
              coordinates: [
                [101.55, 3.02],
                [101.59, 3.06],
                [101.62, 3.08],
              ],
            },
          },
        ],
      },
    });
  });

  await page.route('https://tile.openstreetmap.org/**', async (route) => {
    await route.abort();
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: collector } });
  });

  await page.route(/\/api\/collector\/pickups(?:\/.*)?(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const parts = url.pathname.split('/').filter(Boolean);
    const pickupIndex = parts.indexOf('pickups');
    const id = parts[pickupIndex + 1] ?? '';
    const action = parts[pickupIndex + 2] ?? '';

    if (id === 'collection-locations') {
      await route.fulfill({ json: collectionLocations });
      return;
    }

    if (!id && method === 'GET') {
      await route.fulfill({ json: { pickupRequests: options.pickups ?? [] } });
      return;
    }

    if (method === 'PATCH' && action === 'arrive') {
      await route.fulfill({ json: { pickupRequest: options.onArrivePickup?.(id) ?? updatePickup(id, options.pickups ?? [], 'ARRIVED') } });
      return;
    }

    if (method === 'PATCH' && action === 'verify') {
      await route.fulfill({ json: { pickupRequest: options.onVerifyPickup?.(id) ?? updatePickup(id, options.pickups ?? [], 'VERIFIED') } });
      return;
    }

    if (method === 'PATCH' && action === 'complete') {
      await route.fulfill({ json: { pickupRequest: options.onCompletePickup?.(id) ?? updatePickup(id, options.pickups ?? [], 'COMPLETED') } });
      return;
    }

    if (method === 'PATCH' && action === 'accept') {
      await route.fulfill({ json: { pickupRequest: updatePickup(id, options.pickups ?? [], 'ACCEPTED') } });
      return;
    }

    await route.fulfill({
      json: {
        pickupRequest: options.getPickup?.(id) ?? (options.pickups ?? []).find((pickup) => pickup.id === id) ?? pickupA,
      },
    });
  });
}

export function collectorPickup(overrides: Partial<TestCollectorPickup>): TestCollectorPickup {
  const id = overrides.id ?? 'pickup-id';
  const status = overrides.status ?? 'ACCEPTED';
  const collectorDetails = overrides.collectorId === null
    ? null
    : {
        id: collector.id,
        name: collector.name,
        email: collector.email,
      };

  return {
    id,
    userId: customer.id,
    collectorId: overrides.collectorId === null ? null : collector.id,
    addressText: overrides.addressText ?? 'Collector pickup address',
    latitude: overrides.latitude ?? '3.0477000',
    longitude: overrides.longitude ?? '101.6174000',
    status,
    notes: null,
    aiClassificationLabel: 'Paper, Plastic',
    aiConfidence: null,
    aiSuggestedPayload: null,
    createdAt: '2026-06-01T08:00:00.000Z',
    completedAt: overrides.completedAt ?? null,
    distanceKm: overrides.distanceKm ?? '1.00',
    user: customer,
    collector: collectorDetails,
    items: [
      {
        id: `${id}-paper-item`,
        pickupRequestId: id,
        categoryId: 'paper-id',
        estimatedWeight: '2.00',
        actualWeight: status === 'VERIFIED' || status === 'COMPLETED' ? '2.20' : null,
        category: {
          id: 'paper-id',
          name: 'Paper',
          pointsPerKg: 1,
        },
      },
    ],
    images: [],
    ...overrides,
  };
}

function updatePickup(id: string, pickups: TestCollectorPickup[], status: string): TestCollectorPickup {
  const pickup = pickups.find((entry) => entry.id === id) ?? collectorPickup({ id });
  return {
    ...pickup,
    status,
    completedAt: status === 'COMPLETED' ? '2026-06-01T11:00:00.000Z' : pickup.completedAt,
  };
}
