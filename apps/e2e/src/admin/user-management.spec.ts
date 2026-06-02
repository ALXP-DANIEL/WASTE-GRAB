import { expect, test, type Page } from '@playwright/test';

import { admin } from './admin-test-utils';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  profileImageUrl: string | null;
  hasCompletedOnboarding: boolean;
  createdAt: string;
};

const existingUser: AdminUser = {
  id: 'customer-id',
  name: 'Existing Customer',
  email: 'customer@test.com',
  phone: null,
  role: 'CUSTOMER',
  profileImageUrl: null,
  hasCompletedOnboarding: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

test('admin can create a user from the management page', async ({ page }) => {
  const users = [existingUser];
  await mockAdminUserApi(page, users);

  await page.goto('/admin/users');

  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  await expect(page.getByRole('table').getByText('Existing Customer')).toBeVisible();

  await page.getByRole('button', { name: 'Add User' }).first().click();
  await expect(page.getByRole('heading', { name: 'Add User' })).toBeVisible();

  await page.getByPlaceholder('John Doe').fill('New Customer');
  await page.getByPlaceholder('john@example.com').fill('new-customer@test.com');
  await page.getByPlaceholder('Enter password').fill('Password123!');
  await page.getByRole('button', { name: 'Save User' }).click();

  await expect(page.getByRole('table').getByText('New Customer')).toBeVisible();
  await expect(page.getByRole('table').getByText('new-customer@test.com')).toBeVisible();
});

async function mockAdminUserApi(page: Page, users: AdminUser[]): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: admin } });
  });

  await page.route('**/api/admin/users', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON() as Partial<AdminUser>;
      const created: AdminUser = {
        ...existingUser,
        ...payload,
        id: 'new-customer-id',
        phone: payload.phone ?? null,
        role: payload.role ?? 'CUSTOMER',
        createdAt: '2026-01-02T00:00:00.000Z',
      };

      users.unshift(created);
      await route.fulfill({ status: 201, json: created });
      return;
    }

    await route.fulfill({ json: users });
  });
}
