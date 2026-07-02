import { readFileSync } from 'node:fs';
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
    fieldKeys: [
      'contact_classroom_learners_label',
      'contact_classroom_grade_label',
      'contact_classroom_material_label',
      'contact_classroom_routine_label',
      'contact_classroom_need_label',
    ],
    locale: 'en',
  },
  {
    fieldKeys: [
      'contact_classroom_learners_label',
      'contact_classroom_grade_label',
      'contact_classroom_material_label',
      'contact_classroom_routine_label',
      'contact_classroom_need_label',
    ],
    locale: 'zh',
  },
] as const;
type LocaleMessages = Record<string, string>;

const localeMessages: Record<LocaleMode, LocaleMessages> = {
  en: readLocaleMessages('en'),
  zh: readLocaleMessages('zh'),
};

const worksheetEntryCases = [
  {
    actionKey: 'worksheets_page_mode_fill_blank_action',
    template: 'fill-blank',
    titleKey: 'worksheets_page_mode_fill_blank_title',
  },
  {
    actionKey: 'worksheets_page_mode_line_match_action',
    template: 'line-match',
    titleKey: 'worksheets_page_mode_line_match_title',
  },
  {
    actionKey: 'worksheets_page_mode_listening_action',
    template: 'listening',
    titleKey: 'worksheets_page_mode_listening_title',
  },
  {
    actionKey: 'worksheets_page_mode_group_sort_action',
    template: 'group-sort',
    titleKey: 'worksheets_page_mode_group_sort_title',
  },
] as const;

const templateEntryCases = [
  { shortNameKey: 'activity_template_quiz_short_name', template: 'quiz' },
  {
    shortNameKey: 'activity_template_match_up_short_name',
    template: 'match-up',
  },
  {
    shortNameKey: 'activity_template_line_match_short_name',
    template: 'line-match',
  },
  {
    shortNameKey: 'activity_template_group_sort_short_name',
    template: 'group-sort',
  },
  {
    shortNameKey: 'activity_template_fill_blank_short_name',
    template: 'fill-blank',
  },
  {
    shortNameKey: 'activity_template_listening_short_name',
    template: 'listening',
  },
  {
    shortNameKey: 'activity_template_matching_pairs_short_name',
    template: 'matching-pairs',
  },
  {
    shortNameKey: 'activity_template_open_box_short_name',
    template: 'open-box',
  },
] as const;

function readLocaleMessages(locale: LocaleMode): LocaleMessages {
  return JSON.parse(
    readFileSync(
      new URL(
        `../../../project.inlang/messages/${locale}.json`,
        import.meta.url
      ),
      'utf8'
    )
  ) as LocaleMessages;
}

function getLocaleMessage(locale: LocaleMode, key: string) {
  const value = localeMessages[locale][key];
  if (!value) throw new Error(`Missing locale message ${locale}:${key}`);

  return value;
}

function formatLocaleMessage(message: string, values: Record<string, string>) {
  return message.replace(/\{(\w+)\}/g, (placeholder, key) => {
    return values[key] ?? placeholder;
  });
}

function getTemplateEntryActionLabel(locale: LocaleMode, shortNameKey: string) {
  return formatLocaleMessage(
    getLocaleMessage(locale, 'activity_template_start_action'),
    { template: getLocaleMessage(locale, shortNameKey) }
  );
}

function expectedLocalizedUrlPattern(path: string, locale: LocaleMode) {
  return new RegExp(`${escapeRegExp(localizedPath(path, locale))}$`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  for (const { fieldKeys, locale } of classroomContactCases) {
    test(`shows classroom inquiry fields in ${locale}`, async ({ page }) => {
      await setTheme(page, 'light');
      const monitor = installPageHealthMonitor(page);

      await expectHealthyPage(
        page,
        monitor,
        localizedPath('/contact?subject=classroom', locale),
        { theme: 'light' }
      );

      for (const fieldKey of fieldKeys) {
        await expect(
          page.getByLabel(getLocaleMessage(locale, fieldKey))
        ).toBeVisible();
      }

      await expect(
        page.getByLabel(getLocaleMessage(locale, 'contact_message'))
      ).toHaveValue(
        getLocaleMessage(locale, 'contact_classroom_message_template')
      );

      await expect(
        page.getByText(
          getLocaleMessage(locale, 'contact_classroom_details_description')
        )
      ).toBeVisible();

      const bodyText = (await page.locator('body').innerText()).trim();
      expect(bodyText).not.toMatch(/HSK|Hanzi|Lang Study|getlangstudy/i);
      monitor.expectNoErrors(`classroom contact ${locale}`);
    });
  }

  for (const locale of ['en', 'zh'] as const) {
    test(`worksheets page enters template-specific creation flows in ${locale}`, async ({
      page,
    }) => {
      await setTheme(page, 'light');
      const monitor = installPageHealthMonitor(page);

      await expectHealthyPage(
        page,
        monitor,
        localizedPath('/worksheets', locale),
        { theme: 'light' }
      );

      await expect(
        page.getByRole('heading', {
          name: getLocaleMessage(locale, 'worksheets_page_title'),
        })
      ).toBeVisible();

      for (const mode of worksheetEntryCases) {
        await expect(
          page.getByText(getLocaleMessage(locale, mode.titleKey))
        ).toBeVisible();

        const link = page
          .getByRole('link', {
            name: getLocaleMessage(locale, mode.actionKey),
          })
          .first();

        await expect(link).toHaveAttribute(
          'href',
          localizedPath(`/create?template=${mode.template}`, locale)
        );
      }

      const bodyText = (await page.locator('body').innerText()).trim();
      expect(bodyText).not.toMatch(/HSK|Hanzi|Lang Study|getlangstudy/i);
      monitor.expectNoErrors(`worksheets template entry ${locale}`);
    });

    test(`templates page enters template-specific creation flows in ${locale}`, async ({
      page,
    }) => {
      await setTheme(page, 'light');
      const monitor = installPageHealthMonitor(page);

      await expectHealthyPage(
        page,
        monitor,
        localizedPath('/templates', locale),
        { theme: 'light' }
      );

      await expect(
        page.getByRole('heading', {
          name: getLocaleMessage(locale, 'templates_page_title'),
        })
      ).toBeVisible();

      for (const action of templateEntryCases) {
        const link = page
          .getByRole('link', {
            name: getTemplateEntryActionLabel(locale, action.shortNameKey),
          })
          .first();

        await expect(link).toHaveAttribute(
          'href',
          localizedPath(`/create?template=${action.template}`, locale)
        );
      }

      const lineMatchAction = templateEntryCases.find(
        (action) => action.template === 'line-match'
      );
      if (!lineMatchAction) throw new Error('Missing line-match action case.');

      await page
        .getByRole('link', {
          name: getTemplateEntryActionLabel(
            locale,
            lineMatchAction.shortNameKey
          ),
        })
        .first()
        .click();
      await expect(page).toHaveURL(
        expectedLocalizedUrlPattern('/create?template=line-match', locale)
      );
      await expect(
        page.getByDisplayValue(
          getLocaleMessage(locale, 'activity_scaffold_line_match_title')
        )
      ).toBeVisible();
      await expect(
        page.getByLabel(
          getLocaleMessage(locale, 'activity_form_field_primary_template')
        )
      ).toHaveValue('line-match');

      const bodyText = (await page.locator('body').innerText()).trim();
      expect(bodyText).not.toMatch(/HSK|Hanzi|Lang Study|getlangstudy/i);
      monitor.expectNoErrors(`templates template entry ${locale}`);
    });
  }

  test('health check responds with pong', async ({ request }) => {
    const response = await request.get('/api/ping');

    await expect(response).toBeOK();
    expect(await response.json()).toEqual({ message: 'pong' });
  });
});
