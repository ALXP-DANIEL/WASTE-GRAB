import { defineConfig, devices } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';

const frontendURL = process.env['BASE_URL'] || 'http://localhost:4200';
const backendURL = process.env['API_BASE_URL'] || 'http://127.0.0.1:3000';
const frontendEndpoint = new URL(frontendURL);
const frontendHost = frontendEndpoint.hostname;
const frontendPort = frontendEndpoint.port || (frontendEndpoint.protocol === 'https:' ? '443' : '80');

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),

  use: {
    baseURL: frontendURL,
    trace: 'on-first-retry',
  },

  webServer: {
    command: `
      bash -lc '
        set -euo pipefail

        echo "Starting backend..."
        PORT=3000 HOST=127.0.0.1 npm exec -- nx run backend:serve:development &
        BACKEND_PID=$!

        echo "Waiting for backend health..."
        for i in {1..90}; do
          if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            echo "Backend crashed before becoming healthy."
            wait "$BACKEND_PID"
            exit 1
          fi

          if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
            echo "Backend is healthy."
            break
          fi

          echo "Backend not ready yet... attempt $i"
          sleep 1
        done

        curl -fsS http://127.0.0.1:3000/api/health >/dev/null

        echo "Starting frontend..."
        npm exec -- nx run frontend:serve:development --excludeTaskDependencies --port=${frontendPort} --host=${frontendHost}
      '
    `,
    url: frontendURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    cwd: workspaceRoot,
  },

  projects: [
    {
      name: 'api',
      testMatch: [
        /api\/.*\.spec\.ts/,
        /admin\/api-.*\.spec\.ts/,
        /customer\/api-.*\.spec\.ts/,
        /customer\/.*-api\.spec\.ts/,
      ],
      use: {
        baseURL: backendURL,
      },
    },
    {
      name: 'chromium',
      testMatch: [
        /admin\/(?!api-).*\.spec\.ts/,
        /collector\/.*\.spec\.ts/,
        /customer\/(?!api-)(?!.*-api).*\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: frontendURL,
      },
    },
  ],
});
