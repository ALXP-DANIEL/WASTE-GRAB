import { expect, request, test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from 'node:process';

const backendURL = env['BACKEND_URL'] || 'http://127.0.0.1:3000';

type Operation = {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  data?: unknown;
};

const customerOperations: Operation[] = [
  { method: 'get', path: '/api/customer/address' },
  { method: 'get', path: '/api/customer/address/address-id' },
  {
    method: 'post',
    path: '/api/customer/address',
    data: {
      label: 'Home',
      street: '1 Test Street',
      city: 'Kuala Lumpur',
      state: 'WP Kuala Lumpur',
      postalCode: '50000',
      country: 'Malaysia',
    },
  },
  { method: 'patch', path: '/api/customer/address/address-id', data: { label: 'Office' } },
  { method: 'delete', path: '/api/customer/address/address-id' },
  { method: 'post', path: '/api/customer/address/address-id/default' },
  { method: 'get', path: '/api/customer/vouchers' },
  { method: 'get', path: '/api/customer/vouchers/redemptions' },
  { method: 'post', path: '/api/customer/vouchers/voucher-id/redeem' },
  { method: 'get', path: '/api/notifications' },
  { method: 'get', path: '/api/notifications/stream' },
  { method: 'patch', path: '/api/notifications/read-all' },
  {
    method: 'post',
    path: '/api/notifications/push-subscriptions',
    data: {
      endpoint: 'https://example.com/push',
      keys: {
        p256dh: 'p256dh',
        auth: 'auth',
      },
    },
  },
  {
    method: 'delete',
    path: '/api/notifications/push-subscriptions',
    data: { endpoint: 'https://example.com/push' },
  },
  { method: 'patch', path: '/api/notifications/notification-id/read' },
  { method: 'delete', path: '/api/notifications/notification-id' },
  { method: 'delete', path: '/api/notifications' },
];

test.describe('customer non-pickup API operations', () => {
  for (const operation of customerOperations) {
    test(`${operation.method.toUpperCase()} ${operation.path} requires authentication`, async () => {
      const api = await request.newContext({ baseURL: backendURL });
      const response = await send(api, operation);

      expect(response.status()).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: 'Not authenticated.',
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

  return api.delete(operation.path, { data: operation.data });
}
