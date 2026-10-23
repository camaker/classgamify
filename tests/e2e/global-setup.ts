import {
  chromium,
  type FullConfig,
  type Page,
  request as playwrightRequest,
} from '@playwright/test';
import { E2E_TEST_SECRET, createE2EUser } from './fixtures/test-data';

/**
 * Warms the dev server before the first journey.
 *
 * `pnpm dev` compiles routes lazily: the first browser visit to a heavy route
 * (the workspace editor, the student runner, the dashboard) triggers server
 * and client module transforms and dependency optimization that can take far
 * longer than a test's assertion timeout. Loading those routes once in a real
 * browser, signed in, makes every journey start from a compiled server so
 * timing-sensitive assertions measure the app, not the compiler.
 */
const WARM_TIMEOUT_MS = 180_000;

const PUBLIC_ROUTES = ['/', '/templates', '/pricing', '/play/demo-food'];
const SIGNED_IN_ROUTES = [
  '/dashboard',
  '/dashboard/activities',
  '/dashboard/activities/new?template=matching-pairs&source=templates',
  '/dashboard/assignments',
  '/settings/billing',
];

async function visit(page: Page, path: string) {
  await page.goto(path, { timeout: WARM_TIMEOUT_MS, waitUntil: 'load' });
  // Wait until client modules for the route finish loading and hydrating.
  await page.waitForLoadState('networkidle', { timeout: WARM_TIMEOUT_MS });
}

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    config.projects[0]?.use.baseURL ??
    process.env.PLAYWRIGHT_BASE_URL ??
    'http://localhost:3000';
  const api = await playwrightRequest.newContext({ baseURL });
  const user = createE2EUser();
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  try {
    for (const path of PUBLIC_ROUTES) {
      await visit(page, path);
    }

    const signUp = await api.post('/api/auth/sign-up/email', {
      data: {
        callbackURL: '/dashboard',
        email: user.email,
        name: user.name,
        password: user.password,
      },
      headers: { Origin: baseURL, Referer: `${baseURL}/auth/register` },
      timeout: WARM_TIMEOUT_MS,
    });
    if (!signUp.ok()) {
      throw new Error(`Warm-up sign-up failed: ${await signUp.text()}`);
    }
    await api.patch('/api/e2e/users', {
      data: { email: user.email, emailVerified: true, role: 'user' },
      headers: { 'x-e2e-secret': E2E_TEST_SECRET },
    });

    await visit(page, '/auth/login');
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill(user.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await page.waitForURL(/\/dashboard\/?$/, { timeout: WARM_TIMEOUT_MS });

    for (const path of SIGNED_IN_ROUTES) {
      await visit(page, path);
    }
    // The editor is the heaviest client route; wait for its real content.
    await visit(page, '/create?template=quiz&source=templates');
    await page
      .getByRole('heading', { level: 1, name: 'New activity' })
      .waitFor({ timeout: WARM_TIMEOUT_MS });
  } finally {
    await browser.close();
    await api.delete('/api/e2e/users', {
      headers: { 'x-e2e-secret': E2E_TEST_SECRET },
    });
    await api.dispose();
  }
}
