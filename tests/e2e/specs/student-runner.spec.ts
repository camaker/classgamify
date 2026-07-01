import { expect, test } from '@playwright/test';
import {
  expectHealthyPage,
  installPageHealthMonitor,
  setTheme,
} from '../fixtures/page-health';

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
      page.getByRole('heading', { name: /^food words homework$/i })
    ).toBeVisible();
    await expect(page.getByText('0/3 answered')).toBeVisible();
    await expect(page.getByLabel('Student name')).toBeEnabled();

    await page
      .getByRole('button', { name: /^apple$/i })
      .first()
      .click();
    await expect(page.getByText('1/3 answered')).toBeVisible();

    await page
      .getByRole('button', { name: /^milk$/i })
      .first()
      .click();
    await expect(page.getByText('2/3 answered')).toBeVisible();

    const submitButton = page.getByRole('button', {
      name: /^submit answers$/i,
    });
    const readOnlyHint = page.getByText(
      'Preview assignments are read-only until a teacher publishes a share link.'
    );

    await expect(submitButton).toBeDisabled();
    await expect(readOnlyHint).toBeVisible();
    await expect(submitButton).toHaveAttribute(
      'aria-describedby',
      /student-runner-submit-read-only-hint/
    );
    await expect(
      page.getByRole('link', { name: /^create activity$/i })
    ).toBeVisible();

    monitor.expectNoErrors('starter student runner interaction');
  });
});
