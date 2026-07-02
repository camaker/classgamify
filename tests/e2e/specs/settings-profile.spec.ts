import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';

type LocaleMode = 'en' | 'zh';
type LocaleMessages = Record<string, string>;

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

test.describe('settings profile', () => {
  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('updates the signed-in user display name', async ({ page, request }) => {
    const user = await registerE2EUser(request);
    const newName = `E2E Updated ${Date.now().toString().slice(-6)}`;

    await loginByForm(page, user);
    await page.goto('/settings/profile');

    await expect(
      page.getByText(
        getLocaleMessage('en', 'settings_profile_workspace_summary_title')
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        getLocaleMessage(
          'en',
          'settings_profile_workspace_summary_assignments_label'
        )
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        getLocaleMessage(
          'en',
          'settings_profile_workspace_summary_results_label'
        )
      )
    ).toBeVisible();

    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(newName);
    await page.getByRole('button', { name: /save|保存/i }).click();

    await expect(
      page.getByText(/name updated successfully|名字更新成功/i)
    ).toBeVisible();
    await expect(nameInput).toHaveValue(newName);

    await page.reload();
    await expect(page.locator('input[name="name"]')).toHaveValue(newName);
  });

  test('shows the localized teacher identity scope', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);

    await loginByForm(page, user);
    await page.goto('/zh/settings/profile');

    await expect(
      page.getByText(
        getLocaleMessage('zh', 'settings_profile_workspace_summary_title')
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        getLocaleMessage(
          'zh',
          'settings_profile_workspace_summary_student_label'
        )
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        getLocaleMessage('zh', 'settings_profile_workspace_summary_description')
      )
    ).toBeVisible();
  });
});
