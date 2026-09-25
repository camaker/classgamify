import assert from 'node:assert/strict';
import test from 'node:test';
import { localeConfig, locales, localizeHref } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getBaseUrl } from '@/lib/urls';
import { overwriteGetLocale, type Locale } from '@/locale/paraglide/runtime';
import { buildSitemapUrlEntries } from '@/seo/public-indexing';
import { getIndexableLocalesForStaticPath } from '@/seo/public-routes';

const BASE_URL = 'https://classgamify.example';
const EN_ZH_PATHS = [
  Routes.Worksheets,
  Routes.Create,
  Routes.Pricing,
  Routes.Contact,
  Routes.Roadmap,
];
const EN_ONLY_PATHS = [
  Routes.PrivacyPolicy,
  Routes.TermsOfService,
  Routes.CookiePolicy,
];
const ALL_LOCALE_PATHS = [
  Routes.Root,
  Routes.Templates,
  Routes.About,
  Routes.Teachers,
];

test('static route indexing locales reflect translated public content', () => {
  for (const path of EN_ZH_PATHS) {
    assert.deepEqual(getIndexableLocalesForStaticPath(path), ['en', 'zh']);
  }
  for (const path of EN_ONLY_PATHS) {
    assert.deepEqual(getIndexableLocalesForStaticPath(path), ['en']);
  }
  for (const path of ALL_LOCALE_PATHS) {
    assert.deepEqual(getIndexableLocalesForStaticPath(path), locales);
  }
  assert.deepEqual(getIndexableLocalesForStaticPath('/classroom-quiz-game'), [
    'en',
  ]);
  assert.equal(getIndexableLocalesForStaticPath('/unknown'), undefined);
});

test('sitemap and hreflang exclude untranslated static locale variants', () => {
  const entries = buildSitemapUrlEntries({ baseUrl: BASE_URL });

  for (const [paths, availableLocales] of [
    [EN_ZH_PATHS, ['en', 'zh']],
    [EN_ONLY_PATHS, ['en']],
    [ALL_LOCALE_PATHS, locales],
  ] as const) {
    for (const path of paths) {
      const routeEntries = entries.filter((entry) => entry.path === path);
      assert.deepEqual(
        routeEntries.map((entry) => entry.locale),
        availableLocales,
        path
      );
      for (const entry of routeEntries) {
        assert.deepEqual(
          entry.alternates.map((alternate) => alternate.hreflang),
          [
            ...availableLocales.map((locale) => localeConfig[locale].hreflang),
            'x-default',
          ],
          path
        );
        assert.ok(
          entry.alternates.every((alternate) =>
            availableLocales.some(
              (locale) =>
                new URL(alternate.href).pathname ===
                localizeHref(path, { locale })
            )
          ),
          path
        );
      }
    }
  }
});

test('untranslated static pages stay reachable but use noindex and English canonical', () => {
  for (const [paths, excludedLocales] of [
    [EN_ZH_PATHS, locales.filter((locale) => !['en', 'zh'].includes(locale))],
    [EN_ONLY_PATHS, locales.filter((locale) => locale !== 'en')],
  ] as const) {
    for (const locale of excludedLocales) {
      withLocale(locale, () => {
        for (const path of paths) {
          const head = seo(path, { title: 'ClassGamify' });
          assert.deepEqual(head.links, [
            { rel: 'canonical', href: `${getBaseUrl()}${path}` },
          ]);
          assert.ok(
            head.meta.some(
              (tag) => tag.name === 'robots' && tag.content === 'noindex,follow'
            ),
            `${locale}${path}`
          );
          assert.ok(
            head.meta.every((tag) => tag.property !== 'og:locale:alternate'),
            `${locale}${path}`
          );
        }
      });
    }
  }
});

test('translated static pages retain self canonical and only available alternates', () => {
  for (const [path, availableLocales] of [
    [Routes.Worksheets, ['en', 'zh']],
    [Routes.PrivacyPolicy, ['en']],
    [Routes.Templates, locales],
  ] as const) {
    for (const locale of availableLocales) {
      withLocale(locale, () => {
        const head = seo(path, { title: 'ClassGamify' });
        assert.equal(
          new URL(head.links[0]?.href ?? '').pathname,
          localizeHref(path, { locale })
        );
        assert.deepEqual(
          head.links.slice(1).map((link) => link.hrefLang),
          [
            ...availableLocales.map(
              (availableLocale) => localeConfig[availableLocale].hreflang
            ),
            'x-default',
          ]
        );
        assert.ok(head.meta.every((tag) => tag.name !== 'robots'));
      });
    }
  }
});

function withLocale(locale: Locale, callback: () => void) {
  overwriteGetLocale(() => locale);
  try {
    callback();
  } finally {
    overwriteGetLocale(() => 'en');
  }
}
