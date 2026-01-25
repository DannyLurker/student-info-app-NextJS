import { test as setup, expect } from "@playwright/test";
import { STAFF_STATE, STUDENT_STATE } from "./auth.constants";

setup("authentication as staff", async ({ page }) => {
  // 1. Pergi ke halaman login
  await page.goto("/login"); // sesuaikan dengan route login kamu

  // 2. Isi form
  await page.getByPlaceholder(/email/i).fill("viceprincipal@test.com");
  await page.getByPlaceholder(/password/i).fill("Test@12345");

  // 3. Klik submit dan tunggu navigasi selesai
  await page.getByRole("button", { name: /login|sign in/i }).click();

  // 4. Tunggu sampai masuk ke halaman dashboard (tanda login berhasil)
  await expect(page).toHaveURL(/.*dashboard/);

  // 5. Simpan state (Cookie sekarang otomatis tersimpan di sini)
  await page.context().storageState({ path: STAFF_STATE });
});

setup("authentication as class secretary (student)", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder(/email/i).fill("secretary@test.com");
  await page.getByPlaceholder(/password/i).fill("Test@12345");
  await page.getByRole("button", { name: /login|sign in/i }).click();

  // Tunggu URL berubah ke halaman siswa
  await expect(page).toHaveURL(/.*dashboard/);

  await page.context().storageState({ path: STUDENT_STATE });
});
