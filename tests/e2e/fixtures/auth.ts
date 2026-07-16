import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { E2E_TEST_SECRET, type E2EUser, createE2EUser } from './test-data';
import type { ActivityTemplateType } from '@/activities/types';

const e2eHeaders = {
  'x-e2e-secret': E2E_TEST_SECRET,
};

export async function cleanupE2EUsers(request: APIRequestContext) {
  const response = await request.delete('/api/e2e/users', {
    headers: e2eHeaders,
  });

  expect(response.status()).toBeLessThan(500);
}

export async function registerE2EUser(
  request: APIRequestContext,
  overrides: Partial<E2EUser> = {}
) {
  const user = createE2EUser(overrides);
  const origin = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
  const response = await request.post('/api/auth/sign-up/email', {
    headers: {
      Origin: origin,
      Referer: `${origin}/auth/register`,
    },
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
      callbackURL: '/dashboard',
    },
  });

  expect(response.ok(), await response.text()).toBeTruthy();

  await updateE2EUser(request, {
    email: user.email,
    emailVerified: true,
    role: user.role ?? 'user',
  });

  return user;
}

export async function updateE2EUser(
  request: APIRequestContext,
  data: {
    email: string;
    emailVerified?: boolean;
    role?: 'admin' | 'user' | null;
  }
) {
  const response = await request.patch('/api/e2e/users', {
    headers: e2eHeaders,
    data,
  });

  expect(response.ok(), await response.text()).toBeTruthy();
}

export async function loginByForm(page: Page, user: E2EUser) {
  await page.goto('/auth/login');
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');
  const signInButton = page.getByRole('button', {
    name: /^sign in$|^登录$/i,
  });
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(signInButton).toBeEnabled({ timeout: 30_000 });
  await emailInput.fill(user.email);
  await passwordInput.fill(user.password);
  await signInButton.click();
  await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 20_000 });
}

export async function seedE2EUserFile(
  request: APIRequestContext,
  data: {
    contentType?: string;
    email: string;
    filename?: string;
    id?: string;
    originalName: string;
    size?: number;
  }
) {
  const response = await request.post('/api/e2e/users', {
    headers: e2eHeaders,
    data,
  });

  expect(response.ok(), await response.text()).toBeTruthy();

  return (await response.json()) as {
    file: {
      contentType: string;
      id: string;
      originalName: string;
      size: number;
    };
  };
}

export async function seedE2EAssignment(
  request: APIRequestContext,
  data: { email: string; templateType: ActivityTemplateType }
) {
  const response = await request.post('/api/e2e/assignments', {
    headers: e2eHeaders,
    data,
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()) as {
    shareSlug: string;
    templateType: ActivityTemplateType;
    title: string;
  };
}
