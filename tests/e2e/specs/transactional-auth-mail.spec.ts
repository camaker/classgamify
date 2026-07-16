import { expect, test, type APIRequestContext } from '@playwright/test';
import { cleanupE2EUsers, updateE2EUser } from '../fixtures/auth';
import { E2E_TEST_SECRET, createE2EUser } from '../fixtures/test-data';

type OutboxRecord = {
  context?: { url?: string };
  html: string;
  subject: string;
  template: string;
  text: string;
  to: string;
};

const headers = { 'x-e2e-secret': E2E_TEST_SECRET };

async function clearOutbox(request: APIRequestContext) {
  const response = await request.delete('/api/e2e/mail', { headers });
  expect(response.ok(), await response.text()).toBeTruthy();
}

async function getLatestMail(
  request: APIRequestContext,
  email: string,
  template: string
) {
  await expect
    .poll(async () => {
      const response = await request.get('/api/e2e/mail', {
        headers,
        params: { email, template },
      });
      if (!response.ok()) return [];
      return ((await response.json()) as { items: OutboxRecord[] }).items;
    })
    .not.toHaveLength(0);
  const response = await request.get('/api/e2e/mail', {
    headers,
    params: { email, template },
  });
  const { items } = (await response.json()) as { items: OutboxRecord[] };
  const item = items.at(-1);
  if (!item) throw new Error(`Missing ${template} mail for ${email}.`);
  return item;
}

test.describe('transactional auth mail', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
    await clearOutbox(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
    await clearOutbox(request);
  });

  test('registration captures a rendered verification email and verifies the user', async ({
    page,
    request,
  }) => {
    const user = createE2EUser();
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    const signUpButton = page.getByRole('button', { name: /^sign up$/i });
    await expect(signUpButton).toBeEnabled({ timeout: 20_000 });
    await page.locator('input[name="name"]').fill(user.name);
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill(user.password);
    await signUpButton.click();
    await expect(page.getByText(/check your email to verify/i)).toBeVisible({
      timeout: 20_000,
    });

    const mail = await getLatestMail(request, user.email, 'verifyEmail');
    expect(mail.subject).toContain('Verify');
    expect(mail.html).toContain('ClassGamify');
    expect(mail.text).toContain('ClassGamify');
    expect(mail.context?.url).toMatch(/\/api\/auth\/verify-email/);

    await page.goto(mail.context?.url ?? '');
    await expect(
      page.getByRole('heading', { name: 'Teacher dashboard' })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('forgot-password captures a rendered reset email', async ({
    page,
    request,
  }) => {
    const user = createE2EUser();
    const origin = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
    const signup = await request.post('/api/auth/sign-up/email', {
      headers: { Origin: origin, Referer: `${origin}/auth/register` },
      data: {
        callbackURL: '/dashboard',
        email: user.email,
        name: user.name,
        password: user.password,
      },
    });
    expect(signup.ok(), await signup.text()).toBeTruthy();
    await updateE2EUser(request, {
      email: user.email,
      emailVerified: true,
      role: 'user',
    });
    await clearOutbox(request);

    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('networkidle');
    const sendButton = page.getByRole('button', { name: /send reset link/i });
    await expect(sendButton).toBeEnabled({ timeout: 20_000 });
    await page.locator('input[name="email"]').fill(user.email);
    await sendButton.click();
    await expect(page.getByText(/sent a reset link/i)).toBeVisible();

    const mail = await getLatestMail(request, user.email, 'forgotPassword');
    expect(mail.subject).toContain('Reset');
    expect(mail.html).toContain('ClassGamify');
    expect(mail.text).toContain('ClassGamify');
    expect(mail.context?.url).toMatch(/\/api\/auth\/reset-password/);
  });
});
