import { expect, request, test } from '@playwright/test';

const backendURL = process.env['BACKEND_URL'] || 'http://localhost:3000';

test('health endpoint returns service status', async () => {
  const api = await request.newContext({ baseURL: backendURL });
  const response = await api.get('/api/health');

  await expect(response).toBeOK();
  await expect(response.json()).resolves.toEqual({
    status: 'ok',
    service: 'wastegrab-api',
  });
});

test('cors preflight includes credentialed API headers', async () => {
  const api = await request.newContext({ baseURL: backendURL });
  const response = await api.fetch('/api/roboflow-ai/analyze-image', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:4200',
      'Access-Control-Request-Method': 'POST',
    },
  });

  expect(response.status()).toBe(204);
  expect(response.headers()['access-control-allow-origin']).toBe('http://localhost:4200');
  expect(response.headers()['access-control-allow-credentials']).toBe('true');
  expect(response.headers()['access-control-allow-headers']).toContain('Authorization');
  expect(response.headers()['vary']).toContain('Origin');
});

test('roboflow image analysis rejects anonymous requests before scanning', async () => {
  const api = await request.newContext({ baseURL: backendURL });
  const response = await api.post('/api/roboflow-ai/analyze-image', {
    multipart: {
      images: {
        name: 'waste.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
          'base64',
        ),
      },
    },
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    error: 'Authentication required.',
  });
});
