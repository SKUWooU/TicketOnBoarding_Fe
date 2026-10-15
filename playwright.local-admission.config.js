import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e/local-admission",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4175",
    viewport: { width: 1440, height: 900 },
    timezoneId: "Asia/Seoul",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    { name: "chromium-local-admission", use: { browserName: "chromium" } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4175 --strictPort",
    env: {
      VITE_REACT_APP_AXIOS_BASE_URL: "/api",
      VITE_REACT_APP_KAKAOMAP_SERVICE_KEY: "",
      VITE_REACT_APP_IMP_CODE: "",
    },
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
