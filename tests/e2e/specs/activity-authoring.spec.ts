import { expect, test, type Page } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
  seedE2EUserFile,
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

    await page.getByRole('link', { name: /^open published link$/i }).click();
    await expect(page).toHaveURL(/\/play\/[^/]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle })
    ).toBeVisible();

    await page.getByLabel('Student name').fill('E2E Student');
    await page
      .getByRole('button', { name: /^apple$/i })
      .first()
      .click();
    await page
      .getByRole('button', { name: /^milk$/i })
      .first()
      .click();
    await expect(page.getByText('2/2 answered')).toBeVisible();
    await page.getByRole('button', { name: /^submit answers$/i }).click();

    await expect(page.getByText('Score submitted')).toBeVisible();
    await expect(page.getByText('1 attempt left')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^start another attempt$/i })
    ).toBeVisible();

    await page
      .getByRole('button', { name: /^start another attempt$/i })
      .click();
    await expect(page.getByText('Score submitted')).not.toBeVisible();
    await expect(page.getByText('0/2 answered')).toBeVisible();
    await expect(page.getByLabel('Student name')).toHaveValue('E2E Student');
    await expectNoBrowserErrors(monitor, 'publish assignment from saved panel');
  });

  test('attaches uploaded source materials to a saved activity', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const monitor = installPageHealthMonitor(page);
    const uniqueSuffix = Date.now().toString(36);
    const activityTitle = `E2E source materials ${uniqueSuffix}`;

    await seedE2EUserFile(request, {
      contentType: 'audio/mpeg',
      email: user.email,
      filename: `listening-${uniqueSuffix}.mp3`,
      id: `e2e-listening-${uniqueSuffix}`,
      originalName: `Listening track ${uniqueSuffix}.mp3`,
      size: 2048,
    });
    await seedE2EUserFile(request, {
      contentType: 'application/pdf',
      email: user.email,
      filename: `worksheet-${uniqueSuffix}.pdf`,
      id: `e2e-worksheet-${uniqueSuffix}`,
      originalName: `Worksheet ${uniqueSuffix}.pdf`,
      size: 4096,
    });

    await loginByForm(page, user);
    await page.goto('/create');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /^source materials$/i })
    ).toBeVisible();
    await expect(
      page.getByText(`Listening track ${uniqueSuffix}.mp3`)
    ).toBeVisible();
    await expect(page.getByText(`Worksheet ${uniqueSuffix}.pdf`)).toBeVisible();
    await page
      .getByRole('button', {
        name: new RegExp(`attach Listening track ${uniqueSuffix}\\.mp3`, 'i'),
      })
      .click();
    await expect(page.getByText('1 attached')).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: new RegExp(`remove Listening track ${uniqueSuffix}\\.mp3`, 'i'),
      })
    ).toBeVisible();

    await page.getByLabel('Title').fill(activityTitle);
    await page.getByRole('button', { name: /^save activity$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/activities\?created=/);
    await expect(
      page.getByRole('heading', { name: activityTitle })
    ).toBeVisible();
    await page
      .getByRole('link', { name: /^edit activity$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/activities\/[^/]+$/);
    await expect(
      page.getByRole('heading', { name: /^source materials$/i })
    ).toBeVisible();
    await expect(page.getByText('1 attached')).toBeVisible();
    await expect(
      page.getByText(`Listening track ${uniqueSuffix}.mp3`)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: new RegExp(`remove Listening track ${uniqueSuffix}\\.mp3`, 'i'),
      })
    ).toBeVisible();
    await expectNoBrowserErrors(monitor, 'source material attachment');
  });
});
