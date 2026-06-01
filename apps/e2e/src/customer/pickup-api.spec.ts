import { expect, request, test, type APIResponse } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { env } from 'node:process';

const backendURL = env['BACKEND_URL'] || 'http://127.0.0.1:3000';

test.describe('customer pickup API operations', () => {
  test('list, rewards, detail, cancel, and create require authentication', async () => {
    const api = await request.newContext({ baseURL: backendURL });

    await expectUnauthorized(api.get('/api/customer/pickups'), 'Not authenticated.');
    await expectUnauthorized(api.get('/api/customer/pickups/rewards/summary'), 'Not authenticated.');
    await expectUnauthorized(api.get('/api/customer/pickups/pickup-id'), 'Not authenticated.');
    await expectUnauthorized(
      api.patch('/api/customer/pickups/pickup-id/cancel'),
      'Not authenticated.',
    );

    const createResponse = await api.post('/api/customer/pickups', {
      multipart: {
        items: JSON.stringify([{ categoryId: 'plastic-id', estimatedWeight: '1.5' }]),
        addressText: '1 Test Street',
        images: {
          name: 'waste.png',
          mimeType: 'image/png',
          buffer: pngBuffer(),
        },
      },
    });

    expect(createResponse.status()).toBe(401);
    await expect(createResponse.json()).resolves.toEqual({
      error: 'Not authenticated.',
    });
  });
});

async function expectUnauthorized(
  responsePromise: Promise<APIResponse>,
  error: string,
): Promise<void> {
  const response = await responsePromise;
  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({ error });
}

function pngBuffer(): Buffer {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64',
  );
}
