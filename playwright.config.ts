import { defineConfig } from '@playwright/test';

// One end-to-end journey on a phone-size screen. Uses its own port so it never clashes with a dev server.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
