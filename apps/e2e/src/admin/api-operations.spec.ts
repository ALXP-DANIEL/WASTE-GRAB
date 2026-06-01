import { expect, request, test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from 'node:process';

const backendURL = env['BACKEND_URL'] || 'http://127.0.0.1:3000';

type Operation = {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  data?: unknown;
};

const adminOperations: Operation[] = [
  { method: 'get', path: '/api/admin/users' },
  { method: 'get', path: '/api/admin/users/user-id' },
  {
    method: 'post',
    path: '/api/admin/users',
    data: {
      name: 'Test User',
      email: 'test-user@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
    },
  },
  { method: 'patch', path: '/api/admin/users/user-id', data: { name: 'Updated User' } },
  { method: 'delete', path: '/api/admin/users/user-id' },
  { method: 'get', path: '/api/admin/locations' },
  { method: 'get', path: '/api/admin/locations/location-id' },
  {
    method: 'post',
    path: '/api/admin/locations',
    data: {
      name: 'Kuala Lumpur',
      city: 'Kuala Lumpur',
      state: 'WP Kuala Lumpur',
      country: 'Malaysia',
      isActive: true,
    },
  },
  { method: 'patch', path: '/api/admin/locations/location-id', data: { isActive: false } },
  { method: 'delete', path: '/api/admin/locations/location-id' },
  { method: 'get', path: '/api/admin/notifications' },
  {
    method: 'post',
    path: '/api/admin/notifications',
    data: {
      title: 'System notice',
      message: 'Testing admin notification operation.',
      audience: 'ALL',
      type: 'SYSTEM',
    },
  },
  { method: 'get', path: '/api/admin/waste-categories' },
  { method: 'get', path: '/api/admin/waste-categories/category-id' },
  {
    method: 'post',
    path: '/api/admin/waste-categories',
    data: {
      name: 'Glass',
      pointsPerKg: 3,
      averageWeightKg: '1.00',
      isBanned: false,
      isHazardous: false,
      isAiDetectable: true,
    },
  },
  { method: 'patch', path: '/api/admin/waste-categories/category-id', data: { pointsPerKg: 4 } },
  { method: 'delete', path: '/api/admin/waste-categories/category-id' },
  { method: 'get', path: '/api/admin/vouchers' },
  { method: 'get', path: '/api/admin/vouchers/redemptions' },
  { method: 'get', path: '/api/admin/vouchers/point-ledger' },
  { method: 'get', path: '/api/admin/vouchers/voucher-id' },
  {
    method: 'post',
    path: '/api/admin/vouchers',
    data: {
      title: 'Coffee Voucher',
      pointsCost: 100,
      status: 'ACTIVE',
    },
  },
  { method: 'patch', path: '/api/admin/vouchers/voucher-id', data: { status: 'INACTIVE' } },
  { method: 'delete', path: '/api/admin/vouchers/voucher-id' },
  { method: 'get', path: '/api/admin/pickups' },
];

test.describe('admin API operations', () => {
  for (const operation of adminOperations) {
    test(`${operation.method.toUpperCase()} ${operation.path} rejects non-admin access`, async () => {
      const api = await request.newContext({ baseURL: backendURL });
      const response = await send(api, operation);

      expect(response.status()).toBe(403);
      await expect(response.json()).resolves.toEqual({
        error: 'Forbidden. Admin access required.',
      });
    });
  }
});

function send(api: APIRequestContext, operation: Operation): Promise<APIResponse> {
  if (operation.method === 'get') {
    return api.get(operation.path);
  }

  if (operation.method === 'post') {
    return api.post(operation.path, { data: operation.data ?? {} });
  }

  if (operation.method === 'patch') {
    return api.patch(operation.path, { data: operation.data ?? {} });
  }

  return api.delete(operation.path);
}
