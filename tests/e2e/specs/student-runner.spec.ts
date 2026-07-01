import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  expectHealthyPage,
  installPageHealthMonitor,
  type LocaleMode,
  setTheme,
} from '../fixtures/page-health';

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

function formatLocaleMessage(message: string, values: Record<string, string>) {
  return message.replace(/\{(\w+)\}/g, (placeholder, key) => {
    return values[key] ?? placeholder;
  });
}

test.describe('student runner', () => {
  test('starter play link stays interactive while read-only', async ({
    page,
  }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, '/play/demo-food', {
      theme: 'light',
    });

    await expect(
      page.getByRole('heading', {
        name: getLocaleMessage('en', 'activity_starter_assignment_food_title'),
      })
    ).toBeVisible();
    await expect(
      page.getByText(
        formatLocaleMessage(
          getLocaleMessage('en', 'student_attempt_progress_label'),
          {
            answeredCount: '0',
            itemCount: '3',
            verb: getLocaleMessage('en', 'student_attempt_progress_answered'),
          }
        )
      )
    ).toBeVisible();
    await expect(
      page.getByLabel(
        getLocaleMessage('en', 'student_runner_student_name_label')
      )
    ).toBeEnabled();
    await expect(
      page.getByText(
        getLocaleMessage('en', 'student_runner_student_name_description')
      )
    ).toBeVisible();

    await page
      .getByRole('button', {
        name: getLocaleMessage('en', 'activity_starter_food_vocabulary_apple'),
      })
      .first()
      .click();
    await expect(
      page.getByText(
        formatLocaleMessage(
          getLocaleMessage('en', 'student_attempt_progress_label'),
          {
            answeredCount: '1',
            itemCount: '3',
            verb: getLocaleMessage('en', 'student_attempt_progress_answered'),
          }
        )
      )
    ).toBeVisible();

    await page
      .getByRole('button', {
        name: getLocaleMessage('en', 'activity_starter_food_vocabulary_milk'),
      })
      .first()
      .click();
    await expect(
      page.getByText(
        formatLocaleMessage(
          getLocaleMessage('en', 'student_attempt_progress_label'),
          {
            answeredCount: '2',
            itemCount: '3',
            verb: getLocaleMessage('en', 'student_attempt_progress_answered'),
          }
        )
      )
    ).toBeVisible();

    const submitButton = page.getByRole('button', {
      name: getLocaleMessage('en', 'student_attempt_submit_answers'),
    });
    const readOnlyHint = page.getByText(
      getLocaleMessage('en', 'student_runner_read_only_preview')
    );

    await expect(submitButton).toBeDisabled();
    await expect(readOnlyHint).toBeVisible();
    await expect(submitButton).toHaveAttribute(
      'aria-describedby',
      /student-runner-submit-read-only-hint/
    );
    await expect(
      page.getByRole('link', {
        name: getLocaleMessage('en', 'student_runner_create_activity'),
      })
    ).toBeVisible();

    monitor.expectNoErrors('starter student runner interaction');
  });
});
