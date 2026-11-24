import { readFileSync } from 'node:fs';
import type { APIRequestContext, Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';
import {
  cleanupE2EUsers,
  registerE2EUser,
  seedE2EAssignment,
} from '../fixtures/auth';

for (const locale of ['en', 'zh'] as const) {
  const messages = JSON.parse(
    readFileSync(
      new URL(
        `../../../project.inlang/messages/${locale}.json`,
        import.meta.url
      ),
      'utf8'
    )
  );
  const path = (route: string) =>
    locale === 'en' ? route : `/zh${route === '/' ? '' : route}`;
  test(`Clarity: home sample feedback and feature links in ${locale}`, async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto(path('/'));
    const hero = page.getByRole('region', {
      name: messages.home_hero_preview_label,
    });
    const apple = hero.getByRole('button', {
      name: messages.activity_starter_food_vocabulary_apple,
      exact: true,
    });
    await expect(apple).toBeVisible();
    await apple.click();
    await expect(
      hero.locator('section').filter({ has: page.locator('output') })
    ).toBeVisible();
    await expect(
      hero.getByText(
        messages.student_play_question_position
          .replace('{current}', '1')
          .replace('{total}', '3'),
        { exact: true }
      )
    ).toBeVisible();
    await hero
      .getByRole('button', { name: messages.student_play_next, exact: true })
      .click();
    await hero
      .getByRole('button', {
        name: messages.student_play_previous,
        exact: true,
      })
      .click();
    await expect(apple).toHaveAttribute('aria-pressed', 'true');
    const tools = page.getByRole('region', {
      name: new RegExp(messages.home_features_title),
    });
    await expect(tools.getByRole('link')).toHaveCount(4);
    await expect(tools.getByRole('link').first()).toHaveAttribute(
      'href',
      /\/create$/
    );
  });
}

test('Clarity: group-first sorting and tappable student name hint', async ({
  page,
  request,
}: {
  page: Page;
  request: APIRequestContext;
}) => {
  test.setTimeout(90_000);
  await cleanupE2EUsers(request);
  try {
    const user = await registerE2EUser(request);
    const assignment = await seedE2EAssignment(request, {
      email: user.email,
      templateType: 'group-sort',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/play/${assignment.shareSlug}`);
    const hint = page
      .locator('label[for="student-name"]')
      .filter({ hasText: 'Type the name your teacher' });
    await expect(hint).toBeVisible();
    await hint.click();
    await expect(
      page.getByRole('textbox', { name: 'Student name', exact: true })
    ).toBeFocused();
    const group = page.getByRole('button', { name: /^Food\s*0$/ });
    await expect(group).toBeEnabled();
    await group.click();
    await expect(group).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: /Food/ })
    ).toHaveCount(1);
    await page.getByRole('button', { name: /^egg$/i }).first().click();
    await expect(page.getByText('1/6 sorted')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Food\s*1$/ })
    ).toHaveAttribute('aria-pressed', 'false');
  } finally {
    await cleanupE2EUsers(request);
  }
});
