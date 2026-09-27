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

    // The runner loads client-side; a cold dev server can take a while.
    await expect(
      page.getByRole('heading', {
        name: getLocaleMessage('en', 'activity_starter_assignment_food_title'),
      })
    ).toBeVisible({ timeout: 20_000 });
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

    // Answering a question moves the runner on to the next one.
    await expect(
      page.getByText(
        formatLocaleMessage(
          getLocaleMessage('en', 'student_play_question_position'),
          { current: '2', total: '3' }
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

  test('play links use the focused student layout', async ({ page }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, '/play/demo-food', {
      theme: 'light',
    });

    // No marketing chrome around the student runner.
    await expect(page.getByRole('link', { name: /^pricing$/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^sign up$/i })).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);

    // One question at a time. The runner loads client-side, so wait for it.
    const surface = page.locator('[data-runtime-surface="choice-list"]');
    await expect(surface).toBeVisible({ timeout: 20_000 });
    await expect(surface.getByRole('article')).toHaveCount(1);
    await expect(
      page.getByText(
        formatLocaleMessage(
          getLocaleMessage('en', 'student_play_question_position'),
          { current: '1', total: '3' }
        )
      )
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: getLocaleMessage('en', 'student_play_previous'),
      })
    ).toBeDisabled();

    await page
      .getByRole('button', {
        name: formatLocaleMessage(
          getLocaleMessage('en', 'student_play_go_to_question'),
          { number: '3' }
        ),
      })
      .click();
    await expect(
      page.getByText(
        formatLocaleMessage(
          getLocaleMessage('en', 'student_play_question_position'),
          { current: '3', total: '3' }
        )
      )
    ).toBeVisible();

    // Full rules stay behind the disclosure until the student opens it.
    const rulesToggle = page.getByText(
      getLocaleMessage('en', 'student_play_rules_toggle')
    );
    const rulesList = page.locator('details dl');
    await expect(rulesList).toBeHidden();
    await rulesToggle.click();
    await expect(rulesList).toBeVisible();

    monitor.expectNoErrors('focused student layout');
  });
});
