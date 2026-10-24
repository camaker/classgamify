import { expect, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';
import { installPageHealthMonitor } from '../fixtures/page-health';

test.beforeAll(async ({ request }) => {
  await cleanupE2EUsers(request);
});
test.afterAll(async ({ request }) => {
  await cleanupE2EUsers(request);
});

test('archived editor returns to the library and restores original content', async ({
  page,
  request,
}) => {
  const user = await registerE2EUser(request);
  const monitor = installPageHealthMonitor(page);
  await loginByForm(page, user);
  await page.goto('/create');
  const title = 'Archived editor recovery';
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill(title);
  await page.getByRole('button', { name: /^save activity$/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/activities\?created=/);
  const id = new URL(page.url()).searchParams.get('created');
  expect(id).toBeTruthy();
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await card.getByRole('button', { name: /^more$/i }).click();
  await page.getByRole('menuitem', { name: /^archive/i }).click();
  await expect(card).toHaveCount(0);
  await page.goto(`/dashboard/activities/${id}`);
  await expect(
    page.getByRole('heading', { name: 'Activity is archived.', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Title', exact: true })
  ).toHaveCount(0);
  const recovery = page.getByRole('button', {
    name: 'Open archived activities',
    exact: true,
  });
  await expect(recovery).toHaveAttribute(
    'href',
    '/dashboard/activities?status=archived'
  );
  await recovery.click();
  await expect(page).toHaveURL(/status=archived/);
  await card.getByRole('button', { name: /^restore/i }).click();
  await expect(card).toHaveCount(0);
  await page.goto(`/dashboard/activities/${id}`);
  await expect(
    page.getByRole('textbox', { name: 'Title', exact: true })
  ).toHaveValue(title);
  monitor.expectNoErrors('archived editor recovery and restore');
});
