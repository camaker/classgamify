import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const locales = [
  'en',
  'zh',
  'fr',
  'de',
  'ja',
  'ko',
  'it',
  'es',
  'pt-BR',
  'ar',
] as const;
const hreflangs = [
  'en',
  'zh-Hans',
  'fr',
  'de',
  'ja',
  'ko',
  'it',
  'es',
  'pt-BR',
  'ar',
  'x-default',
] as const;

function route(locale: (typeof locales)[number], pathname: string) {
  return locale === 'en' ? pathname : `/${locale}${pathname}`;
}

function messages(locale: (typeof locales)[number]) {
  return JSON.parse(
    readFileSync(path.resolve(`project.inlang/messages/${locale}.json`), 'utf8')
  ) as Record<string, string>;
}

test.describe('ten-language runtime expansion', () => {
  for (const locale of locales) {
    test(`${locale} student demo renders its native public route`, async ({
      page,
    }) => {
      const response = await page.goto(route(locale, '/play/demo-food'));
      expect(response?.ok()).toBe(true);
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        locale === 'zh' ? 'zh-Hans' : locale
      );
      await expect(page.locator('html')).toHaveAttribute(
        'dir',
        locale === 'ar' ? 'rtl' : 'ltr'
      );
      await expect(
        page
          .getByText(messages(locale).student_runner_public_route_badge, {
            exact: true,
          })
          .first()
      ).toBeVisible();
      for (const hreflang of hreflangs) {
        await expect(
          page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)
        ).toHaveCount(1);
      }
    });
  }

  test('Arabic privacy route keeps the English legal source', async ({
    page,
  }) => {
    const response = await page.goto('/ar/privacy');
    expect(response?.ok()).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.getByRole('heading', { name: 'Privacy Policy', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(/This Privacy Policy explains how ClassGamify/)
    ).toBeVisible();
  });
});
