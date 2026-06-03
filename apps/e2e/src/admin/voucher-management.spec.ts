import { expect, test, type Page } from '@playwright/test';

import { admin } from './admin-test-utils';

type Voucher = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  pointsCost: number;
  code: string | null;
  stock: number | null;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const existingVoucher: Voucher = {
  id: 'voucher-id',
  title: 'Coffee Voucher',
  description: 'Free coffee reward',
  imageUrl: 'https://example.com/coffee-voucher.jpg',
  pointsCost: 100,
  code: 'COFFEE100',
  stock: 5,
  status: 'ACTIVE',
  startsAt: null,
  expiresAt: '2026-12-31T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

test('admin can create a voucher and review voucher operations', async ({ page }) => {
  const vouchers = [existingVoucher];
  await mockAdminVoucherApi(page, vouchers);

  await page.goto('/admin/vouchers');

  await expect(page.getByRole('heading', { name: 'Voucher Catalog' })).toBeVisible();
  await expect(page.getByRole('table').getByText('Coffee Voucher')).toBeVisible();

  await page.getByRole('button', { name: 'New Voucher' }).first().click();
  await expect(page.getByRole('heading', { name: 'Create Voucher' })).toBeVisible();

  await page.getByPlaceholder('Coffee Voucher').fill('Transit Voucher');
  await page.locator('input[formcontrolname="imageUrl"]').fill('https://example.com/transit-voucher.jpg');
  await page.locator('input[formcontrolname="pointsCost"]').fill('80');
  await page.getByPlaceholder('Optional code').fill('TRANSIT80');
  await page.getByRole('button', { name: 'Create Voucher' }).click();

  await expect(page.getByRole('table').getByText('Transit Voucher')).toBeVisible();
  await expect(page.getByRole('table').getByText('80 pts')).toBeVisible();

  await page.getByRole('button', { name: 'Redemptions' }).click();
  await expect(page.getByRole('heading', { name: 'Redemption Logs' })).toBeVisible();
  await expect(page.getByRole('table').getByText('Test Customer')).toBeVisible();

  await page.getByRole('button', { name: 'Point Ledger' }).click();
  await expect(page.getByRole('heading', { name: 'Point Ledger' })).toBeVisible();
  await expect(page.getByRole('table').getByText('Redeemed Coffee Voucher')).toBeVisible();
});

async function mockAdminVoucherApi(page: Page, vouchers: Voucher[]): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ json: { user: admin } });
  });

  await page.route('**/api/admin/vouchers/redemptions', async (route) => {
    await route.fulfill({
      json: [
        {
          id: 'redemption-id',
          userId: 'customer-id',
          userName: 'Test Customer',
          userEmail: 'customer@test.com',
          voucherId: existingVoucher.id,
          voucherTitle: existingVoucher.title,
          pointsSpent: existingVoucher.pointsCost,
          status: 'REDEEMED',
          redeemedCode: existingVoucher.code,
          redeemedAt: '2026-01-03T00:00:00.000Z',
        },
      ],
    });
  });

  await page.route('**/api/admin/vouchers/point-ledger', async (route) => {
    await route.fulfill({
      json: [
        {
          id: 'ledger-id',
          userId: 'customer-id',
          userName: 'Test Customer',
          userEmail: 'customer@test.com',
          type: 'SPENT',
          status: 'POSTED',
          points: -100,
          balanceAfter: 150,
          pickupRequestId: null,
          voucherId: existingVoucher.id,
          voucherTitle: existingVoucher.title,
          description: 'Redeemed Coffee Voucher',
          metadata: null,
          createdAt: '2026-01-03T00:00:00.000Z',
        },
      ],
    });
  });

  await page.route('**/api/admin/vouchers', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON() as Partial<Voucher>;
      const created: Voucher = {
        ...existingVoucher,
        ...payload,
        id: 'transit-voucher-id',
        title: payload.title ?? 'Transit Voucher',
        description: payload.description ?? null,
        imageUrl: payload.imageUrl ?? null,
        code: payload.code ?? null,
        stock: payload.stock ?? null,
        status: payload.status ?? 'ACTIVE',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      vouchers.unshift(created);
      await route.fulfill({ status: 201, json: created });
      return;
    }

    await route.fulfill({ json: vouchers });
  });
}
