import { expect, test, type Page } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';
import {
  installPageHealthMonitor,
  type PageHealthMonitor,
} from '../fixtures/page-health';

async function expectNoBrowserErrors(
  monitor: PageHealthMonitor,
  context: string
) {
  await test.step(`health: ${context}`, async () => {
    monitor.expectNoErrors(context);
  });
}

async function saveActivityFromCreatePage(page: Page, title: string) {
  await page.goto('/create');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Title').fill(title);
  await page.getByRole('button', { name: /^save activity$/i }).click();

  await expect(page).toHaveURL(/\/dashboard\/activities\?created=/);
  await expect(page.getByText('Activity saved').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test.describe('activity authoring', () => {
  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('publishes a saved activity from the saved panel', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const monitor = installPageHealthMonitor(page);
    const uniqueSuffix = Date.now().toString(36);
    const activityTitle = `E2E quiz saved panel ${uniqueSuffix}`;
    const assignmentTitle = `E2E assignment ${uniqueSuffix}`;

    await loginByForm(page, user);
    await saveActivityFromCreatePage(page, activityTitle);
    await expectNoBrowserErrors(monitor, 'create and save activity');

    const savedPanel = page
      .locator('section')
      .filter({ hasText: 'Activity saved' })
      .first();
    await expect(savedPanel).toContainText(activityTitle);
    await savedPanel
      .getByRole('button', { name: /^publish assignment$/i })
      .click();

    const publishDialog = page.getByRole('dialog', {
      name: /^publish assignment$/i,
    });
    await expect(publishDialog).toBeVisible();
    await publishDialog.getByLabel('Assignment title').fill(assignmentTitle);
    await publishDialog.getByRole('button', { name: /^publish$/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/assignments\?published=/);
    await expect(page.getByText('Assignment published').first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: assignmentTitle })
    ).toBeVisible();
    await expect(page.getByText(/^\/play\/[^/\s]+$/).first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^open published link$/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^view results$/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^copy link$/i })
    ).toBeVisible();
    await expectNoBrowserErrors(monitor, 'publish assignment from saved panel');
  });
});
