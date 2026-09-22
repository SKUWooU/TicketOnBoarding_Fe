import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/local-backend",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium-local-backend", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
    env: {
      VITE_REACT_APP_AXIOS_BASE_URL: "/api",
      VITE_REACT_APP_KAKAOMAP_SERVICE_KEY: "",
    },
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !globalThis.process?.env.CI,
    timeout: 30_000,
  },
});
