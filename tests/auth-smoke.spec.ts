import { expect, test } from "@playwright/test";

const smokeEmail = process.env.SMOKE_TEST_EMAIL;
const smokePassword = process.env.SMOKE_TEST_PASSWORD;

test("login opens the main dashboard page", async ({ page }) => {
  if (!smokeEmail || !smokePassword) {
    throw new Error(
      "Set SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD before running the authentication smoke test.",
    );
  }

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Good to have you back." })).toBeVisible();

  await page.getByLabel("Work email").fill(smokeEmail);
  await page.getByLabel("Password").fill(smokePassword);
  await page.getByRole("button", { name: "Sign in to workspace" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByText(`Signed in as ${smokeEmail}`)).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});
