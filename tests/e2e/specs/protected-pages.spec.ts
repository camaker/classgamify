import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
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
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_security_workspace_summary_title'
                )
              )
            ).toBeVisible();
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_security_workspace_capabilities_title'
                )
              )
            ).toBeVisible();
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_security_workspace_summary_results_label'
                )
              )
            ).toBeVisible();
          }
          if (protectedPage.path === '/settings/files') {
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_files_workspace_summary_title'
                )
              )
            ).toBeVisible();
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_files_workspace_summary_library_label'
                )
              )
            ).toBeVisible();
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_files_workspace_summary_privacy_label'
                )
              )
            ).toBeVisible();
          }
          if (protectedPage.path === '/settings/billing') {
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_billing_workspace_summary_title'
                )
              )
            ).toBeVisible();
            await expect(
              page.getByText(
                getLocaleMessage(
                  locale,
                  'settings_billing_workspace_summary_assignments_label'
                )
              )
            ).toBeVisible();
            await expect(
              page.getByText(
                getLocaleMessage(locale, 'settings_billing_handoff_title')
              )
            ).toBeVisible();
          }
          if (protectedPage.path === '/settings/payment') {
            await expect(
              page.getByText(
                getLocaleMessage(locale, 'settings_payment_failed_title')
              )
            ).toBeVisible();
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
