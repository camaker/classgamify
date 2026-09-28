import { expect, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  registerE2EUser,
  seedE2EAssignment,
} from '../fixtures/auth';
import { installPageHealthMonitor } from '../fixtures/page-health';

type AssignmentFixture = Awaited<ReturnType<typeof seedE2EAssignment>>;

test.describe('student submit feedback', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });
  let quiz: AssignmentFixture;
  let groupSort: AssignmentFixture;

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
    const user = await registerE2EUser(request);
    quiz = await seedE2EAssignment(request, {
      email: user.email,
      templateType: 'quiz',
    });
    groupSort = await seedE2EAssignment(request, {
      email: user.email,
      templateType: 'group-sort',
    });
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('name errors and the score card stay in place', async ({ page }) => {
    const monitor = installPageHealthMonitor(page);
    await page.goto(`/play/${quiz.shareSlug}`);
    await expect(
      page.getByRole('heading', { name: quiz.title, exact: true }).first()
    ).toBeVisible({ timeout: 20_000 });

    const nameInput = page.getByRole('textbox', {
      name: 'Student name',
      exact: true,
    });
    await page.getByRole('button', { name: /^submit answers/i }).click();
    await expect(nameInput).toBeFocused();
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByRole('alert').filter({
        hasText: 'Type your name before submitting.',
      })
    ).toBeVisible();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);

    await nameInput.fill('E2E Feedback Student');
    await expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');

    for (const [index, word] of ['apple', 'milk', 'rice'].entries()) {
      await expect(page.getByText(`Question ${index + 1} of 3`)).toBeVisible();
      await page
        .getByRole('button', { name: new RegExp(`^${word}$`, 'i') })
        .filter({ visible: true })
        .first()
        .click();
      await expect(
        page.getByRole('status', {
          name: `Completion progress: ${index + 1}/3 answered`,
          exact: true,
        })
      ).toBeVisible();
    }
    await page.getByRole('button', { name: /^submit answers/i }).click();

    const resultPanel = page.locator('#student-runner-result-panel');
    await expect(resultPanel).toBeVisible({ timeout: 20_000 });
    await expect(resultPanel).toBeInViewport();
    await expect(resultPanel).toContainText('Answered');
    await expect(resultPanel).toContainText('Not correct');
    await expect(resultPanel).not.toContainText('Needs review');
    await expect(page.getByText('Attempt submitted.')).toHaveCount(0);
    monitor.expectNoErrors('student submit feedback');
  });

  test('phones place group-sort items without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/play/${groupSort.shareSlug}`);
    await expect(
      page.getByRole('heading', { name: groupSort.title, exact: true }).first()
    ).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: /^egg$/i }).first().click();
    const placeBar = page.getByText('Put “egg” in:');
    await expect(placeBar).toBeInViewport();
    await placeBar
      .locator('..')
      .getByRole('button', { name: /^food$/i })
      .click();
    await expect(placeBar).toHaveCount(0);
    await expect(page.getByText('1/6 sorted')).toBeVisible();
  });
});
