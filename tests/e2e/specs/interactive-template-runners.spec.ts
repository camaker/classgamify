import { expect, test, type Page } from '@playwright/test';
import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityTemplateType,
} from '@/activities/types';
import {
  cleanupE2EUsers,
  registerE2EUser,
  seedE2EAssignment,
} from '../fixtures/auth';
import {
  installPageHealthMonitor,
  type PageHealthMonitor,
} from '../fixtures/page-health';

const RUNNER_SURFACES: Record<ActivityTemplateType, string> = {
  'fill-blank': 'fill-blank',
  'group-sort': 'group-sort',
  'line-match': 'line-match',
  listening: 'listening',
  'match-up': 'choice-list',
  'matching-pairs': 'matching-pairs',
  'open-box': 'open-box',
  quiz: 'choice-list',
};

type AssignmentFixture = Awaited<ReturnType<typeof seedE2EAssignment>>;

async function answerOneRuntimeItem(
  page: Page,
  templateType: ActivityTemplateType
) {
  const surface = page.locator(
    `[data-runtime-surface="${RUNNER_SURFACES[templateType]}"]`
  );
  await expect(surface).toBeVisible();

  if (templateType === 'listening') {
    const input = surface.locator('input').first();
    if ((await input.count()) > 0) {
      await input.fill('E2E answer');
    } else {
      await surface.locator('button:enabled').last().click();
    }
    return;
  }

  if (['fill-blank', 'open-box'].includes(templateType)) {
    await surface.locator('input').first().fill('E2E answer');
    return;
  }

  const enabledButtons = surface.locator('button:enabled');
  await enabledButtons.first().click();
  if (
    templateType === 'group-sort' ||
    templateType === 'line-match' ||
    templateType === 'matching-pairs'
  ) {
    await surface.locator('button:enabled').last().click();
  }
}

async function expectNoBrowserErrors(
  monitor: PageHealthMonitor,
  context: string
) {
  await test.step(`health: ${context}`, async () => {
    monitor.expectNoErrors(context);
  });
}

test.describe('interactive template runners', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });
  const fixtures = new Map<ActivityTemplateType, AssignmentFixture>();

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
    const user = await registerE2EUser(request);
    for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
      fixtures.set(
        templateType,
        await seedE2EAssignment(request, {
          email: user.email,
          templateType,
        })
      );
    }
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
    test(`${templateType} accepts a scored partial attempt`, async ({
      page,
    }) => {
      const fixture = fixtures.get(templateType);
      if (!fixture)
        throw new Error(`Missing ${templateType} assignment fixture.`);
      const monitor = installPageHealthMonitor(page);

      await page.goto(`/play/${fixture.shareSlug}`);
      await expect(
        page.getByRole('heading', { name: fixture.title, exact: true }).first()
      ).toBeVisible({ timeout: 20_000 });
      await page
        .getByRole('textbox', { name: 'Student name', exact: true })
        .fill(`E2E ${templateType}`);
      await answerOneRuntimeItem(page, templateType);

      await page.getByRole('button', { name: /^Submit answers\./i }).click();
      await expect(
        page.getByRole('button', { name: /^Submit anyway\./i })
      ).toBeVisible();
      await page.getByRole('button', { name: /^Submit anyway\./i }).click();
      await expect(page.locator('#student-runner-result-status')).toContainText(
        'Score submitted',
        { timeout: 20_000 }
      );
      await expectNoBrowserErrors(monitor, `${templateType} runner submission`);
    });
  }
});
