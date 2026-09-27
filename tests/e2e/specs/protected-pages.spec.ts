import { readFileSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';
import {
  expectHealthyPage,
  installPageHealthMonitor,
  localizedPath,
  setTheme,
  type LocaleMode,
  type ThemeMode,
} from '../fixtures/page-health';

/**
 * The /settings layout sets `ssr: false`, so settings pages paint only after
 * hydration and the session check, which takes several seconds on a dev
 * server. Give their text assertions the same budget as other client-loaded
 * checks.
 */
const CLIENT_RENDER_TIMEOUT = 20_000;

/**
 * Text the teacher can see. Settings pages also mount screen-reader-only
 * audit sections (class `sr-only`) that repeat the same labels, and
 * Playwright treats those 1px boxes as visible, so exclude anything inside
 * an sr-only container. Match exactly: short labels such as "Assignment
 * workflow" also appear inside longer page and card descriptions.
 */
function onScreenText(page: Page, text: string) {
  return page
    .getByText(text, { exact: true })
    .and(
      page.locator(
        'xpath=//*[not(ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " sr-only ")])]'
      )
    );
}

type LocaleMessages = Record<string, string>;

const protectedPages = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/dashboard/activities', name: 'activity library' },
  { path: '/dashboard/assignments', name: 'assignments' },
  { path: '/admin/users', name: 'admin users' },
  { path: '/settings/profile', name: 'profile settings' },
  { path: '/settings/security', name: 'security settings' },
  { path: '/settings/files', name: 'files settings' },
  ...(process.env.VITE_PAYMENT_PROVIDER
    ? ([
        { path: '/settings/billing', name: 'billing settings' },
        { path: '/settings/payment', name: 'payment status' },
      ] as const)
    : []),
] as const;

const smokeMatrix: Array<{ locale: LocaleMode; theme: ThemeMode }> = [
  { locale: 'en', theme: 'dark' },
  { locale: 'en', theme: 'light' },
  { locale: 'zh', theme: 'dark' },
  { locale: 'zh', theme: 'light' },
];

const localeMessages: Record<LocaleMode, LocaleMessages> = {
  en: readLocaleMessages('en'),
  zh: readLocaleMessages('zh'),
};

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

test.describe('protected page smoke coverage', () => {
  // Each test signs in and walks every protected page, several client-only.
  test.describe.configure({ timeout: 120_000 });

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  for (const { locale, theme } of smokeMatrix) {
    test(`renders all protected pages in ${locale}/${theme}`, async ({
      page,
      request,
    }) => {
      const user = await registerE2EUser(request, { role: 'admin' });
      await setTheme(page, theme);
      const monitor = installPageHealthMonitor(page);

      await loginByForm(page, user);

      for (const protectedPage of protectedPages) {
        await test.step(protectedPage.name, async () => {
          await expectHealthyPage(
            page,
            monitor,
            localizedPath(protectedPage.path, locale),
            { theme }
          );
          if (protectedPage.path === '/settings/security') {
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_security_workspace_summary_title'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_security_workspace_capabilities_title'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_security_workspace_summary_results_label'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
          }
          if (protectedPage.path === '/settings/files') {
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_files_workspace_summary_title'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_files_workspace_summary_library_label'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_files_workspace_summary_privacy_label'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
          }
          if (protectedPage.path === '/settings/billing') {
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_billing_workspace_summary_title'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            await expect(
              onScreenText(
                page,
                getLocaleMessage(
                  locale,
                  'settings_billing_workspace_summary_assignments_label'
                )
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            // The handoff section is screen-reader-only by design (6790a20e),
            // so check it is in the accessibility tree, not on screen.
            await expect(
              page.getByRole('heading', {
                name: getLocaleMessage(
                  locale,
                  'settings_billing_handoff_title'
                ),
                exact: true,
              })
            ).toBeAttached({ timeout: CLIENT_RENDER_TIMEOUT });
          }
          if (protectedPage.path === '/settings/payment') {
            await expect(
              onScreenText(
                page,
                getLocaleMessage(locale, 'settings_payment_failed_title')
              )
            ).toBeVisible({ timeout: CLIENT_RENDER_TIMEOUT });
            const paymentHandoff = page.locator(
              '[data-handoff="settings-payment-callback"]'
            );
            await expect(paymentHandoff).toHaveCount(1);
            await expect(paymentHandoff).toContainText(
              getLocaleMessage(locale, 'settings_payment_handoff_title')
            );
          }
        });
      }
    });
  }
});
