import { expect, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';
import { installPageHealthMonitor } from '../fixtures/page-health';

test.describe('deterministic AI draft fallback', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 });

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('generates a reviewable draft and saves it only after teacher action', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const monitor = installPageHealthMonitor(page);
    const sourceText =
      'Plants need sunlight, water, air, and nutrients. Roots absorb water, leaves use sunlight, and flowers help plants reproduce.';

    await loginByForm(page, user);
    await page.goto('/create');
    await page.waitForLoadState('networkidle');

    const sourceInput = page.locator('#activity-ai-source');
    const titleInput = page.locator('input[name="title"]');
    const questionsInput = page.locator('textarea[name="questionsText"]');
    await expect(sourceInput).toBeVisible();
    await sourceInput.fill(sourceText);
    await page.locator('#activity-ai-item-count').selectOption('5');
    await page.locator('#activity-ai-focus').selectOption('worksheet-practice');

    const generateButton = page.getByRole('button', {
      name: /^generate draft$/i,
    });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    await expect(titleInput).toHaveValue(/Plants need sunlight/i, {
      timeout: 20_000,
    });
    await expect(questionsInput).toHaveValue(/sunlight/i);
    await expect(
      page.getByText('Fallback', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText(/local deterministic draft was used/i).first()
    ).toBeVisible();
    await expect(page).toHaveURL(/\/create\/?$/);

    const generatedTitle = await titleInput.inputValue();
    expect(generatedTitle.trim()).not.toBe('');
    await page.getByRole('button', { name: /^save activity$/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/activities\?created=/, {
      timeout: 20_000,
    });
    await expect(page.getByText('Activity saved').first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: generatedTitle, exact: true }).first()
    ).toBeVisible();
    monitor.expectNoErrors('generate and save deterministic AI fallback draft');
  });
});
