import { expect, type APIRequestContext, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
  seedE2EAssignment,
} from '../fixtures/auth';
import { E2E_TEST_SECRET } from '../fixtures/test-data';

async function seedPlanState(
  request: APIRequestContext,
  data: {
    activities?: number;
    aiDrafts?: number;
    email: string;
    lifetime?: boolean;
    subscription?: {
      cancelAtPeriodEnd?: boolean;
      periodEndDays?: number;
      status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
    };
  }
) {
  const response = await request.post('/api/e2e/plan', {
    headers: { 'x-e2e-secret': E2E_TEST_SECRET },
    data,
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

test.describe('plan limits and upgrade path', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('a free teacher at the activity limit sees usage, a clear notice, and the plans page', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    await seedPlanState(request, { activities: 15, email: user.email });
    await loginByForm(page, user);

    const usage = page.getByTestId('plan-usage-card');
    await expect(usage).toBeVisible({ timeout: 20_000 });
    await expect(usage).toContainText('Current plan: Free');
    await expect(usage).toContainText('15 of 15');
    await expect(usage).toContainText('Limit reached');
    await expect(
      usage.getByRole('meter', { name: /Active activities: 15 of 15/ })
    ).toBeVisible();

    await page.goto('/dashboard/activities/new');
    const notice = page.getByTestId('plan-limit-notice');
    await expect(notice).toBeVisible({ timeout: 20_000 });
    await expect(notice).toContainText(
      'You have 15 active activities, the most the free plan allows.'
    );

    // The server enforces the limit even if the teacher saves anyway.
    await page
      .getByRole('textbox', { name: 'Title', exact: true })
      .fill('One activity too many');
    await page.getByRole('button', { name: /^save activity$/i }).click();
    await expect(
      page.getByText(/the most the free plan allows/).last()
    ).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard\/activities\/new\/?$/);

    await notice.getByRole('link', { name: 'View plans' }).click();
    await expect(page).toHaveURL(/\/pricing\/?$/);
    await expect(page.getByText('Up to 15 active activities')).toBeVisible();
    await expect(
      page.getByText('Unlimited open assignment links')
    ).toBeVisible();
  });

  test('open links at the cap block publishing but never block students', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const links = [];
    for (let index = 0; index < 3; index += 1) {
      links.push(
        await seedE2EAssignment(request, {
          email: user.email,
          templateType: 'quiz',
        })
      );
    }

    await page.goto(`/play/${links[0]?.shareSlug}`);
    await expect(
      page.getByRole('heading', { name: links[0]?.title, exact: true }).first()
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole('button', { name: /^submit answers/i })
    ).toBeEnabled();

    await loginByForm(page, user);
    const usage = page.getByTestId('plan-usage-card');
    await expect(usage).toContainText('3 of 3', { timeout: 20_000 });

    await page.goto('/dashboard/activities');
    const card = page.getByRole('article').first();
    await card
      .getByRole('button', { name: /publish/i })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: /^publish assignment$/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('plan-limit-notice')).toContainText(
      'Students can still finish the links that are open.'
    );
    await expect(
      dialog.getByRole('button', { name: /^publish$/i })
    ).toBeDisabled();
  });

  test('the AI draft allowance shows a friendly limit with a plans action', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    await seedPlanState(request, { aiDrafts: 10, email: user.email });
    await loginByForm(page, user);
    await expect(page.getByTestId('plan-usage-card')).toContainText(
      '10 of 10',
      { timeout: 20_000 }
    );

    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    await page
      .locator('#activity-ai-source')
      .fill('Plants need sunlight, water, air, and nutrients to grow.');
    await page.getByRole('button', { name: /^generate draft$/i }).click();
    await expect(
      page.getByText(/You've used all 10 AI drafts for this month/)
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole('button', { name: 'View plans' })
    ).toBeVisible();
  });

  test('paid, past-due, and lifetime teachers get the paid limits', async ({
    page,
    request,
  }) => {
    const pro = await registerE2EUser(request);
    await seedPlanState(request, {
      activities: 20,
      email: pro.email,
      subscription: { status: 'active' },
    });
    await loginByForm(page, pro);
    const usage = page.getByTestId('plan-usage-card');
    await expect(usage).toContainText('Current plan: Teacher Pro', {
      timeout: 20_000,
    });
    await expect(usage).toContainText('20, no limit');
    await expect(
      usage.getByRole('link', { name: 'Compare plans' })
    ).toHaveCount(0);
    await page.goto('/dashboard/activities/new');
    await expect(page.getByTestId('plan-limit-notice')).toHaveCount(0);

    await page.context().clearCookies();
    const pastDue = await registerE2EUser(request);
    await seedPlanState(request, {
      email: pastDue.email,
      subscription: { periodEndDays: -2, status: 'past_due' },
    });
    await loginByForm(page, pastDue);
    await expect(page.getByTestId('plan-usage-card')).toContainText(
      "Your last payment didn't go through.",
      { timeout: 20_000 }
    );
    await expect(
      page
        .getByTestId('plan-usage-card')
        .getByRole('link', { name: 'Manage billing' })
    ).toBeVisible();

    await page.context().clearCookies();
    const lifetime = await registerE2EUser(request);
    await seedPlanState(request, { email: lifetime.email, lifetime: true });
    await loginByForm(page, lifetime);
    await expect(page.getByTestId('plan-usage-card')).toContainText(
      'Current plan: Early Supporter',
      { timeout: 20_000 }
    );
  });
});
