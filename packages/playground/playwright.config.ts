import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  // Assertions wait longer than the 5 s default: the tests that share and
  // reload a 1 MB source compress it in the page, and Firefox and WebKit on a
  // loaded CI runner take more than 5 s for that and for a reparse after Apply.
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:4175/mmd-toolkit/playground/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/hmr.spec.ts",
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: "**/hmr.spec.ts",
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: "**/hmr.spec.ts",
    },
    {
      name: "hmr",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/hmr.spec.ts",
    },
  ],
  webServer: {
    command: "pnpm exec vite preview --port 4175 --strictPort --open=false",
    url: "http://localhost:4175/mmd-toolkit/playground/",
    reuseExistingServer: false,
  },
})
