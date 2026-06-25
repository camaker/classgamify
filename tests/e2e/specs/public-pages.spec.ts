import { expect, test } from '@playwright/test';
import {
  expectHealthyPage,
  installPageHealthMonitor,
  localizedPath,
  setTheme,
  type LocaleMode,
  type ThemeMode,
} from '../fixtures/page-health';

const publicPages = [
  { path: '/', name: 'home' },
  { path: '/templates', name: 'templates' },
  { path: '/create', name: 'create' },
  { path: '/worksheets', name: 'worksheets' },
  { path: '/play/demo-food', name: 'student play demo' },
  { path: '/pricing', name: 'pricing' },
  { path: '/teachers', name: 'teachers' },
  { path: '/contact', name: 'contact' },
  { path: '/contact?subject=classroom', name: 'classroom contact' },
  { path: '/roadmap', name: 'roadmap' },
  { path: '/blog', name: 'blog index' },
  { path: '/cookie', name: 'cookie policy' },
  { path: '/privacy', name: 'privacy policy' },
  { path: '/terms', name: 'terms of service' },
  { path: '/auth/login', name: 'login' },
  { path: '/auth/register', name: 'register' },
  { path: '/auth/forgot-password', name: 'forgot password' },
  { path: '/auth/reset-password', name: 'reset password' },
] as const;

const smokeMatrix: Array<{ locale: LocaleMode; theme: ThemeMode }> = [
  { locale: 'en', theme: 'dark' },
  { locale: 'en', theme: 'light' },
  { locale: 'zh', theme: 'dark' },
  { locale: 'zh', theme: 'light' },
];

const classroomContactCases = [
  {
    fields: [
      'Learners',
      'Class or grade',
      'Activity material',
      'Weekly routine',
      'Main need',
    ],
    locale: 'en',
  },
  {
    fields: ['学习者', '班级或年级', '活动材料', '每周节奏', '主要需求'],
    locale: 'zh',
  },
] as const;

test.describe('public page smoke coverage', () => {
  for (const { locale, theme } of smokeMatrix) {
    test(`renders all public pages in ${locale}/${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      const monitor = installPageHealthMonitor(page);

      for (const publicPage of publicPages) {
        await test.step(publicPage.name, async () => {
          await expectHealthyPage(
            page,
            monitor,
            localizedPath(publicPage.path, locale),
            { theme }
          );
        });
      }
    });
  }

  test('opens the home page login modal', async ({ page }) => {
    await setTheme(page, 'dark');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, '/', { theme: 'dark' });
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^log in$/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[name="email"]')).toBeVisible();
    await expect(dialog.locator('input[name="password"]')).toBeVisible();
    monitor.expectNoErrors('home login modal');
  });

  for (const { fields, locale } of classroomContactCases) {
    test(`shows classroom inquiry fields in ${locale}`, async ({ page }) => {
      await setTheme(page, 'light');
      const monitor = installPageHealthMonitor(page);

      await expectHealthyPage(
        page,
        monitor,
        localizedPath('/contact?subject=classroom', locale),
        { theme: 'light' }
      );

      for (const field of fields) {
        await expect(page.getByLabel(field)).toBeVisible();
      }

      const bodyText = (await page.locator('body').innerText()).trim();
      expect(bodyText).not.toMatch(/HSK|Hanzi|Lang Study|getlangstudy/i);
      monitor.expectNoErrors(`classroom contact ${locale}`);
    });
  }

  test('worksheets page enters template-specific creation flows', async ({
    page,
  }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, '/worksheets', { theme: 'light' });

    await expect(
      page.getByRole('heading', {
        name: /worksheet modes for the same activity content/i,
      })
    ).toBeVisible();

    for (const text of [
      'Fill blanks',
      'Line matching',
      'Listening prompts',
      'Drag sorting',
    ]) {
      await expect(page.getByText(text)).toBeVisible();
    }

    const actions = [
      { name: /create fill blanks/i, template: 'fill-blank' },
      { name: /start line match/i, template: 'line-match' },
      { name: /create listening/i, template: 'listening' },
      { name: /create sort/i, template: 'group-sort' },
    ] as const;

    for (const action of actions) {
      const link = page.getByRole('link', { name: action.name }).first();

      await expect(link).toHaveAttribute(
        'href',
        `/create?template=${action.template}`
      );
    }

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText).not.toMatch(/HSK|Hanzi|Lang Study|getlangstudy/i);
    monitor.expectNoErrors('worksheets template entry');
  });

  test('templates page enters template-specific creation flows', async ({
    page,
  }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, '/templates', { theme: 'light' });

    await expect(
      page.getByRole('heading', {
        name: /pick a game format for the same lesson content/i,
      })
    ).toBeVisible();

    const actions = [
      {
        name: /start quiz/i,
        template: 'quiz',
      },
      {
        name: /start match/i,
        template: 'match-up',
      },
      {
        name: /start lines/i,
        template: 'line-match',
      },
      {
        name: /start sort/i,
        template: 'group-sort',
      },
      {
        name: /start fill/i,
        template: 'fill-blank',
      },
      {
        name: /start listen/i,
        template: 'listening',
      },
      {
        name: /start pairs/i,
        template: 'matching-pairs',
      },
      {
        name: /start box/i,
        template: 'open-box',
      },
    ] as const;

    for (const action of actions) {
      const link = page.getByRole('link', { name: action.name }).first();

      await expect(link).toHaveAttribute(
        'href',
        `/create?template=${action.template}`
      );
    }

    await page
      .getByRole('link', { name: /start lines/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/create\?template=line-match$/);
    await expect(
      page.getByDisplayValue('Draw lines for food words')
    ).toBeVisible();
    await expect(page.getByLabel('Primary template')).toHaveValue('line-match');

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText).not.toMatch(/HSK|Hanzi|Lang Study|getlangstudy/i);
    monitor.expectNoErrors('templates template entry');
  });

  test('health check responds with pong', async ({ request }) => {
    const response = await request.get('/api/ping');

    await expect(response).toBeOK();
    expect(await response.json()).toEqual({ message: 'pong' });
  });
});
