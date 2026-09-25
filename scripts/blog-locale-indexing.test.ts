import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBlogIndexingPolicy,
  getBlogLocalesWithPosts,
  getPostLocales,
  getSortedPosts,
} from '@/lib/blog';
import { seo } from '@/lib/seo';
import { getBaseUrl } from '@/lib/urls';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { Route as BlogPostRoute } from '@/routes/blog/$slug';
import { Route as BlogIndexRoute } from '@/routes/blog/index';
import { buildSitemapUrlEntries } from '@/seo/public-indexing';

const BASE_URL = 'https://classgamify.example';
const POST_SLUG = 'wordwall-style-activity-loop';
const POST_PATH = `/blog/${POST_SLUG}`;

test('blog index and article locales reflect published content', () => {
  assert.deepEqual(getBlogLocalesWithPosts(), ['en', 'zh']);
  assert.deepEqual(getPostLocales(POST_SLUG), ['en', 'zh']);

  for (const post of getSortedPosts('en')) {
    assert.deepEqual(getPostLocales(post.slug), ['en', 'zh']);
  }
});

test('sitemap publishes only actual blog translations and their hreflang links', () => {
  const entries = buildSitemapUrlEntries({ baseUrl: BASE_URL });
  const blogEntries = entries.filter(
    (entry) => entry.path === '/blog' || entry.path.startsWith('/blog/')
  );
  const articleEntries = blogEntries.filter((entry) =>
    entry.path.startsWith('/blog/')
  );

  assert.deepEqual(
    blogEntries
      .filter((entry) => entry.path === '/blog')
      .map((entry) => entry.locale),
    ['en', 'zh']
  );
  assert.equal(articleEntries.length, getSortedPosts('en').length * 2);

  for (const entry of blogEntries) {
    assert.ok(getPostOrIndexLocales(entry.path).includes(entry.locale));
    assert.deepEqual(
      entry.alternates.map((alternate) => alternate.hreflang),
      ['en', 'zh-CN', 'x-default']
    );
    assert.ok(
      entry.alternates.every(
        (alternate) =>
          !alternate.href.includes('/fr/blog') &&
          !alternate.href.includes('/de/blog')
      )
    );
  }

  assert.ok(
    entries.every(
      (entry) =>
        !new URL(entry.loc).pathname.startsWith('/fr/blog') &&
        !new URL(entry.loc).pathname.startsWith('/de/blog')
    )
  );
});

test('unsupported blog locales redirect to published English pages', () => {
  overwriteGetLocale(() => 'fr');
  try {
    assertRedirectsToEnglish(() => {
      BlogPostRoute.options.beforeLoad?.({
        params: { slug: POST_SLUG },
      } as never);
    }, POST_PATH);
    assertRedirectsToEnglish(() => {
      BlogIndexRoute.options.beforeLoad?.({} as never);
    }, '/blog');
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('published English and Chinese blog routes remain reachable', () => {
  for (const locale of ['en', 'zh'] as const) {
    overwriteGetLocale(() => locale);
    try {
      assert.doesNotThrow(() => {
        BlogPostRoute.options.beforeLoad?.({
          params: { slug: POST_SLUG },
        } as never);
        BlogIndexRoute.options.beforeLoad?.({} as never);
      });
    } finally {
      overwriteGetLocale(() => 'en');
    }
  }
});

test('unsupported blog metadata has noindex and English canonical as a fallback', () => {
  overwriteGetLocale(() => 'fr');
  try {
    for (const [path, publishedLocales] of [
      [POST_PATH, getPostLocales(POST_SLUG)],
      ['/blog', getBlogLocalesWithPosts()],
    ] as const) {
      const policy = getBlogIndexingPolicy(publishedLocales, 'fr');
      assert.equal(policy.indexable, false);
      assert.equal(policy.canonicalLocale, 'en');
      assert.deepEqual(policy.alternateLocales, []);

      const head = seo(path, {
        title: 'ClassGamify blog',
        alternateLocales: policy.alternateLocales,
        canonicalLocale: policy.canonicalLocale,
        robots: policy.indexable ? undefined : 'noindex,follow',
      });
      assert.deepEqual(head.links, [
        { rel: 'canonical', href: `${getBaseUrl()}${path}` },
      ]);
      assert.ok(
        head.meta.some(
          (tag) => tag.name === 'robots' && tag.content === 'noindex,follow'
        )
      );
    }
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('translated articles keep their own canonical and only real hreflang peers', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const policy = getBlogIndexingPolicy(getPostLocales(POST_SLUG), 'zh');
    assert.equal(policy.indexable, true);
    const head = seo(POST_PATH, {
      title: '课堂活动闭环',
      alternateLocales: policy.alternateLocales,
      canonicalLocale: policy.canonicalLocale,
    });
    assert.equal(head.links[0]?.href, `${getBaseUrl()}/zh${POST_PATH}`);
    assert.deepEqual(
      head.links.slice(1).map((link) => link.hrefLang),
      ['en', 'zh-CN', 'x-default']
    );
    assert.ok(head.meta.every((tag) => tag.name !== 'robots'));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getPostOrIndexLocales(path: string) {
  return path === '/blog'
    ? getBlogLocalesWithPosts()
    : getPostLocales(path.slice('/blog/'.length));
}

function assertRedirectsToEnglish(call: () => void, path: string) {
  assert.throws(call, (error: unknown) => {
    assert.ok(error instanceof Response);
    assert.equal(error.status, 308);
    assert.equal(error.headers.get('Location'), `${getBaseUrl()}${path}`);
    return true;
  });
}
