import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
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

async function expectThirtySliceHandoff(page: Page, handoffName: string) {
  const handoff = page.locator(`[data-handoff="${handoffName}"]`);
  const itemViews = handoff.locator(':scope > dl > [data-handoff-item]');

  await expect(handoff).toHaveCount(1);
  await expect(handoff).toHaveClass(/sr-only/);
  await expect(handoff).toHaveAttribute('data-handoff-scope', /.+/);
  await expect(itemViews).toHaveCount(30);
  await expect(itemViews.locator(':scope > dt')).toHaveCount(30);
  await expect(itemViews.locator(':scope > dd > output')).toHaveCount(30);

  const itemIds = await itemViews.evaluateAll((items) =>
    items.map((item) => item.getAttribute('data-handoff-item'))
  );
  expect(itemIds.every(Boolean)).toBe(true);
  expect(new Set(itemIds).size).toBe(30);
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
    await expect(page.getByText('1/2 answered')).toBeVisible();
    await page.getByRole('button', { name: /^submit answers$/i }).click();
    await expect(
      page.getByText('1 question is still unanswered.')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^submit anyway$/i })
    ).toBeVisible();

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

    await page.goto('/dashboard/assignments');
    await page
      .getByRole('link', { name: /^view results$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle })
    ).toBeVisible();
    await expect(
      page.getByText(
        'Copy a compact class snapshot with metrics, reteach focus, and students who need follow-up.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Copy a lesson-ready script for the weakest items and priority students.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Copy prompt-level performance with expected answers, alternatives, and notes.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Copy a student-by-student support list sorted by review need.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Download gradebook-ready results with delivery policy and item-level answers.'
      )
    ).toBeVisible();

    await expectThirtySliceHandoff(page, 'assignment-result-material');
    await expectThirtySliceHandoff(page, 'assignment-result-review');
    await expectThirtySliceHandoff(page, 'assignment-copy-artifact');

    await expect(
      page.getByRole('heading', { name: 'Ready to review the full class.' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Current review scope' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Classroom brief' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Item performance' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Student summary' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Student attempts' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Answer review' })
    ).toBeVisible();

    await page.getByLabel('Find student').fill('E2E Student');
    await expect(page).toHaveURL(/student=E2E(?:\+|%20)Student/);
    await page.getByLabel('Sort students').selectOption('name');
    await expect(page).toHaveURL(/sort=name/);
    await page.getByLabel('Sort items').selectOption('accuracy');
    await expect(page).toHaveURL(/itemSort=accuracy/);
    await page.getByLabel('Review view').selectOption('needs-review');
    await expect(page).toHaveURL(/review=needs-review/);
    await expect(
      page
        .locator('[data-handoff="assignment-result-review"]')
        .locator(
          ':scope > dl > [data-handoff-item="student-search-status"] output'
        )
    ).toHaveText('Adjusted');
    await expect(
      page
        .locator('[data-handoff="assignment-result-review"]')
        .locator(
          ':scope > dl > [data-handoff-item="answer-review-status"] output'
        )
    ).toHaveText('Adjusted');

    await page.getByRole('button', { name: 'Clear student search' }).click();
    await expect(page).not.toHaveURL(/student=/);
    await page.getByLabel('Review view').selectOption('all');
    await expect(page).not.toHaveURL(/review=/);

    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: /^Copy brief\./ }).click();
    await expect(page.getByText('Classroom brief copied.')).toBeVisible();
    const copiedBrief = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(copiedBrief).toContain(assignmentTitle);
    expect(copiedBrief).toContain('E2E Student');

    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /^Download CSV\./ }).click();
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(
      /classgamify-.*-results\.csv/
    );
    const csvPath = await csvDownload.path();
    expect(csvPath).not.toBeNull();
    const csvText = await readFile(csvPath as string, 'utf8');
    expect(csvText).toContain('assignment_title');
    expect(csvText).toContain('student_answer');
    expect(csvText).toContain('E2E Student');

    await page.getByRole('link', { name: 'Print worksheet' }).click();
    await expect(page).toHaveURL(/\/print\/assignments\/[^/?]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle })
    ).toBeVisible();
    await expect(page.getByText('Before printing')).toBeVisible();
    await expect(page.getByText('Hidden by default').first()).toBeVisible();
    await expectThirtySliceHandoff(page, 'printable-worksheet');

    await page.getByRole('switch', { name: 'Include answer key' }).click();
    await expect(page).toHaveURL(/answerKey=true/);
    await expect(
      page.getByText('Teacher-only key included').first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Answer key' })
    ).toBeVisible();
    await page.getByRole('link', { name: 'Back to results' }).click();
    await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/?]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle })
    ).toBeVisible();

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
    await seedE2EUserFile(request, {
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      email: user.email,
      filename: `words-${uniqueSuffix}.xlsx`,
      id: `e2e-spreadsheet-${uniqueSuffix}`,
      originalName: `Word list ${uniqueSuffix}.xlsx`,
      size: 3072,
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
    await page
      .getByRole('button', {
        name: new RegExp(`attach Worksheet ${uniqueSuffix}\\.pdf`, 'i'),
      })
      .click();
    await expect(page.getByText('2 attached')).toBeVisible();
    await page
      .getByRole('button', {
        name: new RegExp(`attach Word list ${uniqueSuffix}\\.xlsx`, 'i'),
      })
      .click();
    await expect(page.getByText('3 attached')).toBeVisible();
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
    await expect(page.getByText('Source materials')).toBeVisible();
    await expect(page.getByText('3 files')).toBeVisible();
    await expect(page.getByText('Audio')).toBeVisible();
    await expect(page.getByText('Worksheet document')).toBeVisible();
    await expect(page.getByText('Spreadsheet')).toBeVisible();
    await expect(
      page.getByText('Ready for future AI extraction')
    ).toBeVisible();
    await expect(page.getByText('Audio extraction')).toBeVisible();
    await expect(page.getByText('Worksheet extraction')).toBeVisible();
    await expect(page.getByText('Spreadsheet import')).toBeVisible();

    await page.getByLabel('Source material').selectOption('worksheet');
    await expect(page).toHaveURL(/source=worksheet/);
    await expect(
      page.getByRole('heading', { name: activityTitle })
    ).toBeVisible();
    await expect(page.getByText('Source extraction')).toBeVisible();
    await page.getByLabel('Source material').selectOption('spreadsheet');
    await expect(page).toHaveURL(/source=spreadsheet/);
    await expect(
      page.getByRole('heading', { name: activityTitle })
    ).toBeVisible();
    await page.getByLabel('Source material').selectOption('audio');
    await expect(page).toHaveURL(/source=audio/);
    await expect(
      page.getByRole('heading', { name: activityTitle })
    ).toBeVisible();
    await page.getByRole('button', { name: /^clear filters$/i }).click();
    await expect(page).not.toHaveURL(/source=/);

    await page
      .getByRole('link', { name: /^edit activity$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/activities\/[^/]+$/);
    await expect(
      page.getByRole('heading', { name: /^source materials$/i })
    ).toBeVisible();
    await expect(page.getByText('3 attached')).toBeVisible();
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
