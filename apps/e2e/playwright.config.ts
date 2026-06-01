import { defineConfig, devices } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';

const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4200';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      "bash -lc 'npm exec -- nx run backend:serve:development & until curl -fsS http://127.0.0.1:3000/api/health >/dev/null; do sleep 1; done; npm exec -- nx run frontend:serve:development --excludeTaskDependencies --port=4200 --host=127.0.0.1'",
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: true,
    timeout: 120_000,
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
    },
    {
      name: 'chromium',
      testMatch: [
        /admin\/(?!api-).*\.spec\.ts/,
        /customer\/(?!api-)(?!.*-api).*\.spec\.ts/,
      ],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
