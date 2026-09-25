import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from '@playwright/test';

const guides = [
  {
    path: '/classroom-quiz-game',
    heading: 'Turn review questions into a classroom quiz game',
    example: 'Which word means a red or green fruit?',
    action: 'Create a classroom quiz',
    template: 'quiz',
  },
  {
    path: '/classroom-matching-game',
    heading: 'Make a classroom matching game from pairs students should know',
    example: 'Food words and categories',
    action: 'Create a matching game',
    template: 'matching-pairs',
  },
] as const;

for (const guide of guides) {
  test(`${guide.template} guide has a real example and opens its editor`, async ({
    page,
  }: {
    page: Page;
  }) => {
    const response = await page.goto(guide.path);
    expect(response?.status()).toBe(200);
    expect(await response?.text()).toContain(guide.example);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      guide.heading
    );
    await expect(page.getByText(guide.example)).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new URL(guide.path, page.url()).toString()
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      0
    );

    await page.getByRole('link', { name: guide.action }).click();
    await expect(page).toHaveURL(/\/create\?/);
    const editorUrl = new URL(page.url());
    expect(editorUrl.pathname).toBe('/create');
    expect(editorUrl.searchParams.get('source')).toBe('templates');
    expect(editorUrl.searchParams.get('template')).toBe(guide.template);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('quiz guide links to the student demo without mislabeling the matching guide', async ({
  page,
}: {
  page: Page;
}) => {
  await page.goto('/classroom-quiz-game');
  await expect(
    page.getByRole('link', { name: 'Try the student quiz' })
  ).toHaveAttribute('href', '/play/demo-food');

  await page.goto('/classroom-matching-game');
  await expect(
    page.getByRole('main').locator('a[href="/play/demo-food"]')
  ).toHaveCount(0);
  await expect(
    page.getByRole('table', { name: 'Example food word and category pairs' })
  ).toContainText('apple');
  await expect(
    page.getByRole('table', { name: 'Example food word and category pairs' })
  ).toContainText('fruit');
});

for (const guide of guides) {
  for (const locale of ['zh', 'es']) {
    test(`${locale} version of ${guide.template} guide returns 404`, async ({
      request,
    }: {
      request: APIRequestContext;
    }) => {
      const response = await request.get(`/${locale}${guide.path}`);
      expect(response.status()).toBe(404);
      expect(await response.text()).not.toContain(guide.heading);
    });
  }
}
