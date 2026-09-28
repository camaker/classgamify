import { expect, test, type Page } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
  updateE2EUser,
} from '../fixtures/auth';
import { createE2EUser } from '../fixtures/test-data';

async function expectClassGamifyDashboard(page: Page) {
  await expect(
    page.getByRole('heading', { name: 'Teacher dashboard' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /^create activity$/i })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /^open activity library$/i })
  ).toBeVisible();
  // A freshly registered teacher owns no activities yet, so the classroom
  // loop panel points at the first step.
  await expect(
    page.getByRole('heading', {
      name: 'Start by creating a reusable activity.',
    })
  ).toBeVisible();
}

test.describe('authentication and protected routes', () => {
  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  for (const viewport of [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'mobile', width: 375, height: 667 },
  ]) {
    test(`shows the auth forms in the first ${viewport.name} viewport`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      for (const path of ['/auth/login', '/auth/register']) {
        await page.goto(path);
        // Nothing may push the form below the fold: no explanation panels.
        await expect(page.locator('input[name="email"]')).toBeInViewport();
      }
    });
  }

  test('redirects guests from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('allows a verified user to sign in and view dashboard', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);

    await loginByForm(page, user);
    await expectClassGamifyDashboard(page);
  });

  test('allows a user to register from the register page', async ({
    page,
    request,
  }) => {
    const user = createE2EUser();

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="name"]').fill(user.name);
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill(user.password);
    await page.getByRole('button', { name: /^sign up$|^注册$/i }).click();

    await expect(
      page.getByRole('status').filter({
        hasText:
          /check your email to verify your teacher workspace|请检查邮箱以验证你的教师工作区/i,
      })
    ).toBeVisible();

    await updateE2EUser(request, {
      email: user.email,
      emailVerified: true,
      role: 'user',
    });
    await loginByForm(page, user);
    await expectClassGamifyDashboard(page);
  });

  test('redirects non-admin users away from admin pages', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);

    await loginByForm(page, user);
    await page.goto('/admin/users');

    await expect(page).toHaveURL(/\/dashboard\/?$/);
  });

  test('allows admin users to view the users dashboard', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request, { role: 'admin' });

    await loginByForm(page, user);
    await page.goto('/admin/users');

    await expect(page).toHaveURL(/\/admin\/users\/?$/);
    await expect(
      page.getByRole('table').getByText(user.email).first()
    ).toBeVisible();
  });
});
