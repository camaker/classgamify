import { expect, test, type Page } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';
import {
  installPageHealthMonitor,
  type PageHealthMonitor,
} from '../fixtures/page-health';

type UploadFixture = {
  body: string;
  description: string;
  materialLabel: string;
  mimeType: string;
  name: string;
};

async function expectNoBrowserErrors(
  monitor: PageHealthMonitor,
  context: string
) {
  await test.step(`health: ${context}`, async () => {
    monitor.expectNoErrors(context);
  });
}

async function uploadFixture(page: Page, fixture: UploadFixture) {
  await page.getByRole('button', { name: 'Upload file', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Upload file', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.locator('input[type="file"]').setInputFiles({
    buffer: Buffer.from(fixture.body),
    mimeType: fixture.mimeType,
    name: fixture.name,
  });
  await dialog
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill(fixture.description);
  await dialog.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(
    page.getByText('File uploaded successfully').last()
  ).toBeVisible();
  await expect(dialog).not.toBeVisible();

  const row = page.getByRole('row').filter({ hasText: fixture.name });
  await expect(row).toBeVisible();
  await expect(
    row.getByText(fixture.materialLabel, { exact: true })
  ).toBeVisible();
  await expect(row.getByText('Private', { exact: true })).toBeVisible();
  return row;
}

test.describe('storage source materials', () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('uploads, downloads, classifies, and attaches private classroom files', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const monitor = installPageHealthMonitor(page);
    const suffix = Date.now().toString(36);
    const fixtures: UploadFixture[] = [
      {
        body: 'ID3\u0004\u0000\u0000classgamify-audio',
        description: 'Listening prompt for the classroom activity',
        materialLabel: 'Audio',
        mimeType: 'audio/mpeg',
        name: `listening-${suffix}.mp3`,
      },
      {
        body: '\u0089PNG\r\n\u001a\nclassgamify-worksheet-image',
        description: 'Scanned worksheet image',
        materialLabel: 'Worksheet image',
        mimeType: 'image/png',
        name: `worksheet-image-${suffix}.png`,
      },
      {
        body: '%PDF-1.4\nclassgamify worksheet\n%%EOF',
        description: 'Printable worksheet document',
        materialLabel: 'Worksheet document',
        mimeType: 'application/pdf',
        name: `worksheet-${suffix}.pdf`,
      },
      {
        body: 'PK\u0003\u0004classgamify-spreadsheet',
        description: 'Vocabulary import spreadsheet',
        materialLabel: 'Spreadsheet',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: `vocabulary-${suffix}.xlsx`,
      },
      {
        body: 'ClassGamify classroom reference',
        description: 'Reference file with an unknown material type',
        materialLabel: 'File',
        mimeType: 'application/octet-stream',
        name: `reference-${suffix}.bin`,
      },
    ];

    await loginByForm(page, user);
    await page.goto('/settings/files');
    await expect(
      page.getByRole('heading', { name: 'Files', exact: true })
    ).toBeVisible();

    const rows = new Map<string, ReturnType<Page['getByRole']>>();
    for (const fixture of fixtures) {
      rows.set(fixture.name, await uploadFixture(page, fixture));
    }
    await expectNoBrowserErrors(monitor, 'private classroom file uploads');

    const audio = fixtures[0];
    const audioRow = rows.get(audio.name);
    if (!audioRow) throw new Error('Uploaded audio row was not captured.');
    const accessPath = await audioRow
      .getByRole('link', { name: 'Open', exact: true })
      .getAttribute('href');
    expect(accessPath).toMatch(/^\/api\/storage\/file\?id=/);
    const download = await page.request.get(accessPath ?? '');
    expect(download.status()).toBe(200);
    expect(download.headers()['content-type']).toContain(audio.mimeType);
    expect(download.headers()['content-disposition']).toContain(audio.name);
    expect(download.headers()['x-content-type-options']).toBe('nosniff');
    expect((await download.body()).equals(Buffer.from(audio.body))).toBe(true);

    await page.goto('/create');
    await expect(
      page.getByRole('heading', { name: 'Source materials', exact: true })
    ).toBeVisible();
    for (const fixture of fixtures) {
      await expect(page.getByText(fixture.name, { exact: true })).toBeVisible();
      await page
        .getByRole('button', {
          name: new RegExp(`attach ${fixture.name.replace('.', '\\.')}`, 'i'),
        })
        .click();
    }
    await expect(page.getByText('5 attached', { exact: true })).toBeVisible();

    const activityTitle = `Uploaded materials ${suffix}`;
    await page
      .getByRole('textbox', { name: 'Title', exact: true })
      .fill(activityTitle);
    await page
      .getByRole('button', { name: 'Save activity', exact: true })
      .click();
    await expect(page).toHaveURL(/\/dashboard\/activities\?created=/);
    const summary = page.getByRole('region', {
      name: `Source materials for ${activityTitle}`,
      exact: true,
    });
    await expect(summary).toBeVisible();
    await expect(
      summary
        .locator('[data-slot="badge"]')
        .filter({ hasText: /^4 extraction-ready files$/ })
    ).toBeVisible();
    await expect(
      summary
        .getByText(
          'Audio · 1, File · 1, Spreadsheet · 1, Worksheet document · 1, Worksheet image · 1',
          { exact: true }
        )
        .first()
    ).toBeVisible();
    await expectNoBrowserErrors(monitor, 'uploaded material activity save');
  });
});
