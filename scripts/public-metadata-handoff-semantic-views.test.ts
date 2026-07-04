import assert from 'node:assert/strict';
import test from 'node:test';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import {
  buildSitemapUrlEntries,
  getRobotsDisallowPaths,
  getSitemapUrls,
  SITEMAP_XML_HEADERS,
} from '@/seo/public-indexing';
import {
  PUBLIC_INDEXABLE_STATIC_ROUTES,
  PUBLIC_INDEXED_BLOG_BASE_PATH,
  PUBLIC_LOCALIZED_PATHS,
  PUBLIC_ROBOTS_DISALLOW_RULES,
  RETIRED_LEGACY_PUBLIC_PATHS,
} from '@/seo/public-routes';
import {
  buildPublicMetadataHandoffView,
  PUBLIC_METADATA_HANDOFF_ITEM_IDS,
  type PublicMetadataHandoffItemId,
  type PublicMetadataHandoffView,
} from '@/seo/public-metadata-handoff';

overwriteGetLocale(() => 'en');

const BASE_URL = 'https://classgamify.example/';
const NORMALIZED_BASE_URL = 'https://classgamify.example';
const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_STORAGE_KEY = 'source-material/private/storage-key.pdf';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

test('public metadata handoff exposes 30 indexing and install slices', () => {
  const handoffView = buildPublicMetadataHandoffView({ baseUrl: BASE_URL });
  const itemIds = handoffView.itemViews.map((item) => item.id);
  const sitemapEntries = buildSitemapUrlEntries({
    baseUrl: NORMALIZED_BASE_URL,
  });
  const sitemapUrls = getSitemapUrls();
  const blogUrlCount = sitemapUrls.filter((url) =>
    url.path.startsWith(`${PUBLIC_INDEXED_BLOG_BASE_PATH}/`)
  ).length;

  assert.deepEqual(itemIds, [...PUBLIC_METADATA_HANDOFF_ITEM_IDS]);
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
    includesLocalizedAlternates: true,
    itemIds,
    keepsDashboardOutOfIndex: true,
    keepsPrintViewsOutOfIndex: true,
    keepsRetiredLegacyOutOfIndex: true,
    keepsStudentRunnerOutOfIndex: true,
    readsSourceMaterialFileBytes: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-indexing-install-metadata',
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['static-route-registry', String(PUBLIC_INDEXABLE_STATIC_ROUTES.length)],
      ['indexable-entrypoints', '9'],
      ['route-helper-source', 'Routes constants'],
      ['localized-path-registry', String(PUBLIC_LOCALIZED_PATHS.length)],
      ['localized-alternate-links', '2 locales'],
      ['x-default-alternate', 'Included'],
      ['sitemap-url-count', String(sitemapEntries.length)],
      ['sitemap-static-count', String(PUBLIC_INDEXABLE_STATIC_ROUTES.length)],
      ['sitemap-blog-count', String(blogUrlCount)],
      ['sitemap-blog-lastmod', 'Present'],
      ['sitemap-xml-headers', SITEMAP_XML_HEADERS['Content-Type']],
      ['sitemap-base-url', NORMALIZED_BASE_URL],
      ['robots-rule-registry', String(PUBLIC_ROBOTS_DISALLOW_RULES.length)],
      ['robots-disallow-paths', String(getRobotsDisallowPaths().length)],
      ['robots-localized-variants', '2 per rule'],
      ['robots-dashboard-boundary', 'Blocked'],
      ['robots-settings-boundary', 'Blocked'],
      ['robots-student-runner-boundary', 'Blocked'],
      ['robots-print-boundary', 'Blocked'],
      ['retired-legacy-inventory', String(RETIRED_LEGACY_PUBLIC_PATHS.length)],
      ['retired-legacy-indexing', 'Excluded'],
      ['retired-legacy-route-constants', 'Excluded'],
      ['manifest-builder-source', 'Configured'],
      ['manifest-name', 'Configured'],
      ['manifest-description', 'Configured'],
      ['manifest-start-url', Routes.Root],
      ['manifest-scope', Routes.Root],
      ['manifest-display', 'standalone'],
      ['manifest-maskable-icons', '2'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateMetadataText(JSON.stringify(handoffView));
});

test('public metadata handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildPublicMetadataHandoffView({ baseUrl: BASE_URL });

    assert.equal(handoffView.title, '公开索引元数据交接');
    assert.match(handoffView.description, /30 切片公开索引与安装元数据契约/);
    assert.equal(
      getHandoffValue(handoffView, 'route-helper-source'),
      'Routes 常量'
    );
    assert.equal(
      getHandoffValue(handoffView, 'localized-alternate-links'),
      '2 种语言'
    );
    assert.equal(
      getHandoffValue(handoffView, 'robots-student-runner-boundary'),
      '已阻止'
    );
    assert.equal(
      getHandoffValue(handoffView, 'retired-legacy-indexing'),
      '已排除'
    );
    assert.equal(
      getHandoffValue(handoffView, 'manifest-description'),
      '已配置'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateMetadataText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: PublicMetadataHandoffView,
  id: PublicMetadataHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing public metadata handoff item ${id}`);
  return item.value;
}

function assertNoPrivateMetadataText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_FILE_BYTES,
    SECRET_STUDENT_TOKEN,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public metadata handoff leaked private text: ${privateValue}`
    );
  }
}
