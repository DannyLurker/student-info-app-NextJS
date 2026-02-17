import { test as setup } from "@playwright/test";
import { STAFF_STATE, STUDENT_STATE } from "./auth.constants";

setup("authentication as staff", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder(/email/i).fill("viceprincipal@test.com");
  await page.getByPlaceholder(/password/i).fill("Test@12345");

  await page.getByRole("button", { name: /sign in/i }).click();

  await page.waitForURL(/.*dashboard\/staff/, { timeout: 15000 });

  await page.context().storageState({ path: STAFF_STATE });
});

setup("authentication as class secretary (student)", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder(/email/i).fill("secretary@test.com");
  await page.getByPlaceholder(/password/i).fill("Test@12345");
  await page.getByRole("button", { name: /Sign In/i }).click();

  await page.waitForURL(/.*dashboard\/student/, { timeout: 15000 });

  await page.context().storageState({ path: STUDENT_STATE });
});
