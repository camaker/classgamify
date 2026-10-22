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

const templateGuides = [
  {
    path: '/templates/match-up',
    template: 'match-up',
    heading: 'Match up template for terms, meanings, and translations',
    example: 'bakery food',
  },
  {
    path: '/templates/line-match',
    template: 'line-match',
    heading: 'Line matching worksheet students complete online',
    example: 'bakery food',
  },
  {
    path: '/templates/group-sort',
    template: 'group-sort',
    heading: 'Group sort template for classification practice',
    example: 'Container',
  },
  {
    path: '/templates/fill-blank',
    template: 'fill-blank',
    heading: 'Fill in the blank worksheet template',
    example: 'I drink ___ in the morning.',
  },
  {
    path: '/templates/listening',
    template: 'listening',
    heading: 'Listening quiz template for language practice',
    example: 'The cup has water in it.',
  },
  {
    path: '/templates/open-box',
    template: 'open-box',
    heading: 'Open the box template for prompts and review rounds',
    example: 'Which fruit do people say keeps the doctor away?',
  },
] as const;

for (const guide of templateGuides) {
  test(`${guide.template} template guide is indexable and opens its editor`, async ({
    page,
  }: {
    page: Page;
  }) => {
    const response = await page.goto(guide.path);
    expect(response?.status()).toBe(200);
    const html = (await response?.text()) ?? '';
    expect(html).toContain(guide.example);
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"BreadcrumbList"');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      guide.heading
    );
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new URL(guide.path, page.url()).toString()
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      0
    );
    await expect(
      page.getByRole('heading', { name: 'Frequently asked questions' })
    ).toBeVisible();
    await expect(
      page.getByRole('main').locator('a[href="/classroom-quiz-game"]')
    ).toHaveCount(1);

    await page
      .getByRole('main')
      .locator(`a[href="/create?source=templates&template=${guide.template}"]`)
      .first()
      .click();
    await expect(page).toHaveURL(/\/create\?/);
    const editorUrl = new URL(page.url());
    expect(editorUrl.searchParams.get('template')).toBe(guide.template);
  });
}

test('template guide aliases, unknown templates, and other locales', async ({
  request,
}: {
  request: APIRequestContext;
}) => {
  const quiz = await request.get('/templates/quiz', { maxRedirects: 0 });
  expect(quiz.status()).toBe(308);
  expect(quiz.headers().location).toMatch(/\/classroom-quiz-game$/);

  const pairs = await request.get('/templates/matching-pairs', {
    maxRedirects: 0,
  });
  expect(pairs.status()).toBe(308);
  expect(pairs.headers().location).toMatch(/\/classroom-matching-game$/);

  const tracked = await request.get('/templates/quiz?utm_source=newsletter', {
    maxRedirects: 0,
  });
  expect(tracked.status()).toBe(308);
  expect(tracked.headers().location).toMatch(
    /\/classroom-quiz-game\?utm_source=newsletter$/
  );

  expect((await request.get('/templates/not-a-template')).status()).toBe(404);
  expect((await request.get('/es/templates/match-up')).status()).toBe(404);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const guide of templateGuides) {
    expect(sitemap).toContain(`${guide.path}</loc>`);
  }
  expect(sitemap).not.toContain('/templates/quiz<');
});

test('English template directory links every card to its guide', async ({
  page,
}: {
  page: Page;
}) => {
  await page.goto('/templates');
  for (const href of [
    '/classroom-quiz-game',
    '/classroom-matching-game',
    ...templateGuides.map((guide) => guide.path),
  ]) {
    await expect(
      page.getByRole('main').locator(`a[href="${href}"]`)
    ).toHaveCount(1);
  }
  await expect(
    page.getByRole('heading', {
      name: 'Pick a template by the content you have',
    })
  ).toBeVisible();

  await page.goto('/es/templates');
  await expect(
    page.getByRole('main').locator('a[href^="/templates/"]')
  ).toHaveCount(0);
});

test('homepage explains the workflow, links examples, and answers FAQs', async ({
  page,
}: {
  page: Page;
}) => {
  const response = await page.goto('/');
  const html = (await response?.text()) ?? '';
  expect(html).toContain('"@type":"FAQPage"');
  // No SoftwareApplication node: without real ratings or reviews Google
  // treats it as invalid, and the page must never advertise a paid offer.
  expect(html).not.toContain('"@type":"SoftwareApplication"');
  expect(html).not.toMatch(/"@type":"Offer"/);

  await expect(
    page.getByRole('heading', {
      name: 'From lesson content to student results in three steps',
    })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Eight classroom game templates' })
  ).toBeVisible();
  for (const guide of templateGuides) {
    await expect(
      page.getByRole('main').locator(`a[href="${guide.path}"]`)
    ).toHaveCount(1);
  }
  await expect(page.getByText('Do students need an account?')).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('link', { name: /How teachers use/ })
  ).toHaveAttribute('href', '/teachers');

  await page.goto('/fr/');
  await expect(
    page.getByText('Les élèves ont-ils besoin d’un compte ?')
  ).toBeVisible();
  await expect(
    page.getByRole('main').locator('a[href^="/templates/"]')
  ).toHaveCount(0);
  // All eight example cards plus "See all templates" stay on /fr/templates.
  await expect(
    page.locator(
      'section[aria-labelledby="home-examples-heading"] a[href="/fr/templates"]'
    )
  ).toHaveCount(9);
  await expect(page.locator('a[href="/fr/blog"]')).toHaveCount(0);
});
