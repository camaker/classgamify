import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { allBlogs, allChangelogs } from 'content-collections';
import type { Blog, Changelog } from 'content-collections';
import { baseLocale, type Locale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import {
  buildPublicEditorialHandoffView,
  PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS,
  type PublicEditorialHandoffItemId,
  type PublicEditorialHandoffView,
} from '@/pages/public-editorial-content-view';
import { getSitemapUrls } from '@/seo/public-indexing';
import { PUBLIC_INDEXED_BLOG_BASE_PATH } from '@/seo/public-routes';

overwriteGetLocale(() => 'en');

type EditorialBlogDoc = Blog & { locale: Locale; slug: string };
type EditorialChangelogDoc = Changelog & { locale: Locale; slug: string };

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_IMAGE_PROVIDER = 'image-generation-provider-secret';
const SECRET_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

const BLOG_POSTS = allBlogs as EditorialBlogDoc[];
const CHANGELOG_ENTRIES = allChangelogs as EditorialChangelogDoc[];
const BASE_BLOG_POST_COUNT = BLOG_POSTS.filter(
  (post) => post.locale === baseLocale
).length;
const BASE_CHANGELOG_ENTRY_COUNT = CHANGELOG_ENTRIES.filter(
  (entry) => entry.locale === baseLocale
).length;
const SITEMAP_BLOG_URL_COUNT = getSitemapUrls().filter((url) =>
  url.path.startsWith(`${PUBLIC_INDEXED_BLOG_BASE_PATH}/`)
).length;

test('public editorial handoff exposes 30 safe content-boundary slices', () => {
  const handoffView = buildPublicEditorialHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    includesBlogCtaRoutes: true,
    includesLocalizedBlogPairs: true,
    includesReleaseNotesBoundary: true,
    itemIds,
    keepsChangelogOutOfIndex: true,
    keepsLegacyCopyOut: true,
    readsSourceMaterialFileBytes: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-editorial-content-boundary',
  });
  assertNoPrivateEditorialText(JSON.stringify(handoffView));
});

test('public editorial handoff summarizes blog, release, route, and sitemap state', () => {
  const handoffView = buildPublicEditorialHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      [
        'editorial-set',
        `${BLOG_POSTS.length + CHANGELOG_ENTRIES.length} documents`,
      ],
      ['blog-post-count', `${BASE_BLOG_POST_COUNT} posts`],
      ['changelog-entry-count', `${BASE_CHANGELOG_ENTRY_COUNT} entries`],
      ['localized-blog-pairs', '4 pairs'],
      ['localized-changelog-pairs', '2 pairs'],
      ['blog-list-route', Routes.Blog],
      ['blog-post-route', `${Routes.Blog}/:slug`],
      ['blog-cta-create', Routes.Create],
      ['blog-cta-templates', Routes.Templates],
      ['blog-cta-preview', Routes.StudentPreview],
      ['sitemap-blog-urls', `${SITEMAP_BLOG_URL_COUNT} URLs`],
      ['sitemap-blog-lastmod', 'Present'],
      ['sitemap-changelog-boundary', 'Excluded'],
      ['article-json-ld', 'Configured'],
      ['content-collection-source', 'Content collections'],
      ['product-loop-copy', 'Covered'],
      ['template-copy', 'Covered'],
      ['assignment-copy', 'Covered'],
      ['ai-authoring-copy', 'Covered'],
      ['teacher-results-copy', 'Covered'],
      ['source-material-boundary', 'Private file references hidden'],
      ['student-runner-boundary', 'Safe student assignment'],
      ['release-notes-boundary', 'Product updates'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['handwriting-copy-guard', 'Excluded'],
      ['course-copy-guard', 'Excluded'],
      ['image-generation-provider-guard', 'Excluded'],
      ['public-route-helper', 'Public links'],
      ['private-data-guard', 'Private data hidden'],
      ['editorial-privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateEditorialText(JSON.stringify(handoffView));
});

test('public editorial handoff localizes Chinese content boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildPublicEditorialHandoffView();

    assert.equal(handoffView.title, '公开内容交接');
    assert.match(handoffView.description, /30 切片公开内容契约/);
    assert.equal(
      getHandoffValue(handoffView, 'editorial-set'),
      `${BLOG_POSTS.length + CHANGELOG_ENTRIES.length} 个文档`
    );
    assert.equal(
      getHandoffValue(handoffView, 'blog-post-count'),
      `${BASE_BLOG_POST_COUNT} 篇文章`
    );
    assert.equal(getHandoffValue(handoffView, 'localized-blog-pairs'), '4 组');
    assert.equal(
      getHandoffValue(handoffView, 'sitemap-changelog-boundary'),
      '已排除'
    );
    assert.equal(
      getHandoffValue(handoffView, 'student-runner-boundary'),
      '安全学生作答页'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-route-helper'),
      'Routes 常量'
    );
    assert.equal(
      getHandoffValue(handoffView, 'editorial-privacy-guard'),
      '私密数据隐藏'
    );
    assertNoPrivateEditorialText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('blog routes keep internal editorial handoff out of public DOM', () => {
  const blogListRouteSource = readFileSync('src/routes/blog/index.tsx', 'utf8');
  const blogPostRouteSource = readFileSync('src/routes/blog/$slug.tsx', 'utf8');

  assert.doesNotMatch(
    blogListRouteSource,
    /PublicEditorialHandoff|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Blog list route must not render internal editorial handoff markup.'
  );
  assert.doesNotMatch(
    blogListRouteSource,
    /public-editorial-handoff/,
    'Blog list route must not import the internal editorial handoff component.'
  );
  assert.doesNotMatch(
    blogPostRouteSource,
    /PublicEditorialHandoff|buildPublicEditorialHandoffView|data-handoff|data-handoff-item/,
    'Blog post route must not render internal editorial handoff markup.'
  );
});

function getHandoffValue(
  view: PublicEditorialHandoffView,
  id: PublicEditorialHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing public editorial handoff item ${id}`);
  return item.value;
}

function assertNoPrivateEditorialText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_FILE_BYTES,
    SECRET_IMAGE_PROVIDER,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public editorial handoff leaked private text: ${privateValue}`
    );
  }
}
