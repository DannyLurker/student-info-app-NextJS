import { defineConfig, devices } from "@playwright/test";
import { STAFF_STATE } from "./tests/auth.constants";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "authentication",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium staff test",
      use: { ...devices["Desktop Chrome"], storageState: STAFF_STATE },
      // Dependencies are a list of projects that need to run before the tests in another project run.
      dependencies: ["authentication"],
      testMatch: /staff\.spec\.ts/,
    },
    // {
    //   name: "firefox staff test",
    //   use: { ...devices["Desktop Firefox"], storageState: STAFF_STATE },
    //   dependencies: ["authentication"],
    //   testMatch: /staff\.spec\.ts/,
    // },
    // {
    //   name: "webkit staff test",
    //   use: { ...devices["Desktop Safari"], storageState: STAFF_STATE },
    //   dependencies: ["authentication"],
    //   testMatch: /staff\.spec\.ts/,
    // },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
