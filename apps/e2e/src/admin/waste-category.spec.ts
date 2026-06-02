import { expect, test, type Page } from '@playwright/test';

const admin = {
  id: 'admin-id',
  name: 'Test Admin',
  email: 'admin@test.com',
  phone: null,
  role: 'ADMIN',
  profileImageUrl: null,
  hasCompletedOnboarding: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

type WasteCategory = {
  id: string;
  name: string;
  pointsPerKg: number;
  averageWeightKg: string;
  isBanned: boolean;
  isHazardous: boolean;
  isAiDetectable: boolean;
  description: string | null;
};

const plasticCategory: WasteCategory = {
  id: 'plastic-id',
  name: 'Plastic',
  pointsPerKg: 2,
  averageWeightKg: '1.000',
  isBanned: false,
  isHazardous: false,
  isAiDetectable: true,
  description: 'Plastic waste',
};

test('admin can create a waste category from the management page', async ({
  page,
}) => {
  const categories = [plasticCategory];
  await mockAdminWasteCategoryApi(page, categories);

  await page.goto('/admin/waste-categories');

  await expect(
    page.getByRole('heading', { name: 'Waste Categories', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('table').getByText('Plastic', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'New Category' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Create Waste Category' }),
  ).toBeVisible();

  await page.getByPlaceholder('Plastic').fill('Glass');
  await page.locator('input[formcontrolname="pointsPerKg"]').fill('3');
  await page.locator('input[formcontrolname="averageWeightKg"]').fill('1.250');
  await page.getByRole('button', { name: 'Create Category' }).click();

  await expect(page.getByRole('table').getByText('Glass', { exact: true })).toBeVisible();
  await expect(page.getByRole('table').getByText('3 pts/kg')).toBeVisible();
});

async function mockAdminWasteCategoryApi(
  page: Page,
  categories: WasteCategory[],
): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: admin } });
  });

  await page.route('**/api/admin/waste-categories', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON() as Partial<WasteCategory>;
      const created = {
        ...plasticCategory,
        ...payload,
        id: 'glass-id',
        description: payload.description ?? null,
      };
      categories.push(created);
      await route.fulfill({ json: created });
      return;
    }

    await route.fulfill({ json: categories });
  });
}
