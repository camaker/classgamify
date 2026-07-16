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

  await page.getByRole('textbox', { name: 'Title', exact: true }).fill(title);
  await page.getByRole('button', { name: /^save activity$/i }).click();

  await expect(page).toHaveURL(/\/dashboard\/activities\?created=/);
  await expect(page.getByText('Activity saved').first()).toBeVisible();
  await expect(
    page.getByRole('heading', { name: title, exact: true }).first()
  ).toBeVisible({ timeout: 20_000 });
}

test.describe('activity authoring', () => {
  test.describe.configure({ timeout: 90_000 });

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
    await publishDialog
      .getByRole('textbox', { name: 'Assignment title', exact: true })
      .fill(assignmentTitle);
    await publishDialog.getByRole('button', { name: /^publish$/i }).click();
    await expectNoBrowserErrors(monitor, 'publish assignment action');

    await expect(page).toHaveURL(/\/dashboard\/assignments\?published=/, {
      timeout: 20_000,
    });
    await expect(page.getByText('Assignment published').first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: assignmentTitle, exact: true }).first()
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/^\/play\/[^/\s]+$/).first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^open link$/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^view results$/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^copy student link$/i }).first()
    ).toBeVisible();

    await page.getByRole('link', { name: /^open link$/i }).click();
    await expect(page).toHaveURL(/\/play\/[^/]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle, exact: true }).first()
    ).toBeVisible();

    const studentNameInput = page.getByRole('textbox', {
      name: 'Student name',
      exact: true,
    });
    await studentNameInput.fill('E2E Student');
    await page
      .getByRole('button', { name: /^apple$/i })
      .first()
      .click();
    await expect(
      page.getByRole('status', {
        name: 'Completion progress: 1/2 answered',
        exact: true,
      })
    ).toBeVisible();
    await page.getByRole('button', { name: /^submit answers\./i }).click();
    await expect(
      page.getByRole('note', {
        name: 'Incomplete attempt confirmation: 1 question is still unanswered.',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^submit anyway\./i })
    ).toBeVisible();

    await page
      .getByRole('button', { name: /^apple$/i })
      .nth(1)
      .click();
    await expect(
      page.getByRole('status', {
        name: 'Completion progress: 2/2 answered',
        exact: true,
      })
    ).toBeVisible();
    await page.getByRole('button', { name: /^submit answers\./i }).click();

    const resultStatus = page.locator('#student-runner-result-status');
    await expect(resultStatus).toContainText('Score submitted', {
      timeout: 20_000,
    });
    await expect(
      page.getByRole('status', { name: '1 attempt left', exact: true })
    ).toBeVisible();
    const startAnotherAttemptButton = page.getByRole('button', {
      name: 'Start another attempt with the same student identity',
      exact: true,
    });
    await expect(startAnotherAttemptButton).toBeVisible();

    await startAnotherAttemptButton.click();
    await expect(resultStatus).not.toBeVisible();
    await expect(
      page.getByRole('status', {
        name: 'Completion progress: 0/2 answered',
        exact: true,
      })
    ).toBeVisible();
    await expect(studentNameInput).toHaveValue('E2E Student');
    await expectNoBrowserErrors(monitor, 'student attempt lifecycle');

    await page.goto('/dashboard/assignments');
    await page
      .getByRole('link', { name: /^view results$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle, exact: true }).first()
    ).toBeVisible();
    const resultActions = page.getByLabel('Result actions', { exact: true });
    await expect(
      resultActions.getByText(
        'Copy a compact class snapshot with metrics, reteach focus, and students who need follow-up.'
      )
    ).toBeVisible();
    await expect(
      resultActions.getByText(
        'Copy a lesson-ready script for the weakest items and priority students.'
      )
    ).toBeVisible();
    await expect(
      resultActions.getByText(
        'Copy prompt-level performance with expected answers, alternatives, and notes.'
      )
    ).toBeVisible();
    await expect(
      resultActions.getByText(
        'Copy a student-by-student support list sorted by review need.'
      )
    ).toBeVisible();
    await expect(
      resultActions.getByText(
        'Download gradebook-ready results with delivery policy and item-level answers.'
      )
    ).toBeVisible();

    await expectThirtySliceHandoff(page, 'assignment-result-material');
    await expectThirtySliceHandoff(page, 'assignment-result-review');
    await expectThirtySliceHandoff(page, 'assignment-copy-artifact');

    await expect(
      page.getByRole('heading', {
        name: 'Ready to review the full class.',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Current review scope', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Classroom brief', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Item performance', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Student summary', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Student attempts', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Answer review', exact: true })
    ).toBeVisible();
    await expectNoBrowserErrors(monitor, 'teacher result page load');

    await page
      .getByRole('textbox', { name: /^Find student:/ })
      .fill('E2E Student');
    await expect(page).toHaveURL(/student=E2E(?:\+|%20)Student/);
    await page
      .getByRole('combobox', { name: /^Sort students:/ })
      .selectOption('name');
    await expect(page).toHaveURL(/sort=name/);
    await page
      .getByRole('combobox', { name: /^Sort items:/ })
      .selectOption('accuracy');
    await expect(page).toHaveURL(/itemSort=accuracy/);
    const reviewViewControl = page.getByRole('combobox', {
      name: /^Review view:/,
    });
    await reviewViewControl.selectOption('needs-review');
    await expect(page).toHaveURL(/review=needs-review/);
    await expect(
      page
        .locator('[data-handoff="assignment-result-review"]')
        .locator(
          ':scope > dl > [data-handoff-item="student-search-status"] output'
        )
    ).toHaveText('Adjusted');
    await expectNoBrowserErrors(monitor, 'teacher result filters');
    await expect(
      page
        .locator('[data-handoff="assignment-result-review"]')
        .locator(
          ':scope > dl > [data-handoff-item="answer-review-status"] output'
        )
    ).toHaveText('Adjusted');

    await page.getByRole('button', { name: 'Clear student search' }).click();
    await expect(page).not.toHaveURL(/student=/);
    await reviewViewControl.selectOption('all');
    await expect(page).not.toHaveURL(/review=/);
    await expectNoBrowserErrors(monitor, 'teacher result filter reset');

    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await resultActions.getByRole('button', { name: /^Copy brief\./ }).click();
    await expect(page.getByText('Classroom brief copied.')).toBeVisible();
    const copiedBrief = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(copiedBrief).toContain(assignmentTitle);
    expect(copiedBrief).toContain('E2E Student');
    await expectNoBrowserErrors(monitor, 'teacher result clipboard action');

    const csvDownloadPromise = page.waitForEvent('download');
    await resultActions
      .getByRole('button', { name: /^Download CSV\./ })
      .click();
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
    await expectNoBrowserErrors(monitor, 'teacher result actions');

    await page.getByRole('link', { name: 'Print worksheet' }).click();
    await expect(page).toHaveURL(/\/print\/assignments\/[^/?]+$/);
    await expect(
      page.getByRole('heading', { name: assignmentTitle, exact: true }).first()
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
      page.getByRole('heading', { name: assignmentTitle, exact: true }).first()
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
      page.getByText(`Listening track ${uniqueSuffix}.mp3`, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(`Worksheet ${uniqueSuffix}.pdf`, { exact: true })
    ).toBeVisible();
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

    await page
      .getByRole('textbox', { name: 'Title', exact: true })
      .fill(activityTitle);
    await page.getByRole('button', { name: /^save activity$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/activities\?created=/);
    await expect(
      page.getByRole('heading', { name: activityTitle, exact: true }).first()
    ).toBeVisible();
    const sourceSummary = page.getByRole('region', {
      name: `Source materials for ${activityTitle}`,
      exact: true,
    });
    await expect(sourceSummary).toBeVisible();
    await expect(
      sourceSummary
        .getByRole('paragraph')
        .filter({ hasText: /^Source materials$/ })
    ).toBeVisible();
    await expect(
      sourceSummary
        .locator('[data-slot="badge"]')
        .filter({ hasText: /^3 extraction-ready files$/ })
    ).toBeVisible();
    await expect(
      sourceSummary
        .getByText('Audio · 1, Spreadsheet · 1, Worksheet document · 1', {
          exact: true,
        })
        .first()
    ).toBeVisible();
    await expect(
      sourceSummary.getByText('Ready for future AI extraction', { exact: true })
    ).toBeVisible();
    await expect(
      sourceSummary.getByText(/Audio extraction · Audio · 1/)
    ).toBeVisible();
    await expect(
      sourceSummary.getByText(/Worksheet extraction · Worksheet document · 1/)
    ).toBeVisible();
    await expect(
      sourceSummary.getByText(/Spreadsheet import · Spreadsheet · 1/)
    ).toBeVisible();

    const sourceMaterialFilter = page.getByRole('combobox', {
      name: 'Source material',
      exact: true,
    });
    await sourceMaterialFilter.selectOption('worksheet');
    await expect(page).toHaveURL(/source=worksheet/);
    await expect(
      page.getByRole('heading', { name: activityTitle, exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('paragraph').filter({ hasText: /^Source extraction$/ })
    ).toBeVisible();
    await sourceMaterialFilter.selectOption('spreadsheet');
    await expect(page).toHaveURL(/source=spreadsheet/);
    await expect(
      page.getByRole('heading', { name: activityTitle, exact: true }).first()
    ).toBeVisible();
    await sourceMaterialFilter.selectOption('audio');
    await expect(page).toHaveURL(/source=audio/);
    await expect(
      page.getByRole('heading', { name: activityTitle, exact: true }).first()
    ).toBeVisible();
    await page.getByRole('button', { name: /^clear filters$/i }).click();
    await expect(page).not.toHaveURL(/source=/);

    const savedActivityCard = page.getByRole('article', {
      name: new RegExp(`^${activityTitle}`),
    });
    await savedActivityCard
      .getByRole('link', { name: /^edit activity$/i })
      .click();
    await expect(page).toHaveURL(/\/dashboard\/activities\/[^/]+$/);
    await expect(
      page.getByRole('textbox', { name: 'Title', exact: true })
    ).toHaveValue(activityTitle, { timeout: 20_000 });
    await expect(page.getByText('3 attached')).toBeVisible();
    await expect(
      page
        .getByText(`Listening track ${uniqueSuffix}.mp3`, { exact: true })
        .first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: new RegExp(`remove Listening track ${uniqueSuffix}\\.mp3`, 'i'),
      })
    ).toBeVisible();
    await expectNoBrowserErrors(monitor, 'source material attachment');
  });
});
