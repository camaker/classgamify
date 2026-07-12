import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { getFooterLinks } from '@/config/footer-config';
import { getNavbarLinks } from '@/config/navbar-config';
import { getSidebarLinks } from '@/config/sidebar-config';
import { Routes } from '@/lib/routes';
import { localizeHref, locales } from '@/lib/locale';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { buildHomePageViewModel } from '@/pages/public-page-view';
import {
  buildSitemapUrlEntries,
  getRobotsDisallowPaths,
  getSitemapUrls,
} from '@/seo/public-indexing';
import {
  buildLegacyPublicRouteHandoffView,
  LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS,
  type LegacyPublicRouteHandoffEvidence,
  type LegacyPublicRouteHandoffItemId,
  type LegacyPublicRouteHandoffView,
} from '@/seo/legacy-public-route-handoff';
import { RETIRED_LEGACY_PUBLIC_PATHS } from '@/seo/public-routes';

overwriteGetLocale(() => 'en');

const BASE_URL = 'https://classgamify.example';
const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

type RetiredLegacyPath = (typeof RETIRED_LEGACY_PUBLIC_PATHS)[number];

const ROUTE_TREE_SOURCE = readFileSync('src/routeTree.gen.ts', 'utf8');
const PUBLIC_ROUTES_SOURCE = readFileSync('src/seo/public-routes.ts', 'utf8');
const SERVER_SOURCE = readFileSync('src/server.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const RETIRED_ROUTE_MODULE_CANDIDATES = {
  '/about': ['src/routes/(pages)/about.tsx', 'src/routes/about.tsx'],
  '/ai': ['src/routes/(pages)/ai.tsx', 'src/routes/ai.tsx'],
  '/changelog': [
    'src/routes/(pages)/changelog.tsx',
    'src/routes/changelog.tsx',
  ],
  '/hanzi': ['src/routes/(pages)/hanzi.tsx', 'src/routes/hanzi.tsx'],
  '/hsk': ['src/routes/(pages)/hsk.tsx', 'src/routes/hsk.tsx'],
  '/learn': ['src/routes/(pages)/learn.tsx', 'src/routes/learn.tsx'],
  '/settings/credits': ['src/routes/settings/credits.tsx'],
  '/waitlist': ['src/routes/(pages)/waitlist.tsx', 'src/routes/waitlist.tsx'],
} as const satisfies Record<RetiredLegacyPath, readonly string[]>;

const EVIDENCE = buildLegacyPublicRouteEvidence();

test('leaked route-group URLs redirect only to their canonical public pages', () => {
  assert.match(SERVER_SOURCE, /\['\/\(pages\)\/roadmap', '\/roadmap'\]/);
  assert.match(SERVER_SOURCE, /\['\/\(legals\)\/terms', '\/terms'\]/);
  assert.match(SERVER_SOURCE, /\['\/\(legals\)\/terms\/terms', '\/terms'\]/);
  assert.match(SERVER_SOURCE, /Response\.redirect\(url, 308\)/);
});

test('legacy public route handoff exposes 30 safe retirement slices', () => {
  const handoffView = buildLegacyPublicRouteHandoffView(EVIDENCE);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS]);
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
    itemIds,
    keepsLegacyNavigationOut: true,
    keepsRetiredLegacyOutOfIndex: true,
    migrationEntrypointsOnlyWhenMounted: true,
    readsSourceMaterialFileBytes: false,
    requiresNoindexWhenMounted: true,
    routeActionsUseSharedConstants: true,
    scope: 'legacy-public-route-retirement-boundary',
  });
  assertNoPrivateLegacyRouteText(JSON.stringify(handoffView));
});

test('legacy public route handoff summarizes current retired-route state', () => {
  const handoffView = buildLegacyPublicRouteHandoffView(EVIDENCE);

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['retired-inventory-count', '8 paths'],
      [
        'retired-path-list',
        '/about, /ai, /changelog, /hanzi, /hsk, /learn, /settings/credits, /waitlist',
      ],
      ['mounted-route-count', '0 mounted'],
      ['route-tree-boundary', 'No generated routes'],
      ['migration-entrypoint-boundary', 'Not required'],
      ['noindex-metadata-boundary', 'Noindex ready'],
      ['sitemap-exclusion', 'Excluded'],
      ['localized-sitemap-exclusion', 'Excluded'],
      ['route-constant-exclusion', 'Excluded'],
      ['navbar-exclusion', 'ClassGamify navigation'],
      ['footer-exclusion', 'ClassGamify footer'],
      ['sidebar-exclusion', 'ClassGamify sidebar'],
      ['robots-protected-boundary', 'Protected surfaces blocked'],
      ['homepage-entrypoint-boundary', 'ClassGamify entrypoints'],
      ['template-entrypoint-boundary', Routes.Templates],
      ['create-entrypoint-boundary', Routes.Create],
      ['worksheet-entrypoint-boundary', Routes.Worksheets],
      ['student-preview-boundary', Routes.StudentPreview],
      ['about-path', 'Unmounted'],
      ['ai-path', 'Unmounted'],
      ['changelog-path', 'Unmounted'],
      ['hanzi-path', 'Unmounted'],
      ['hsk-path', 'Unmounted'],
      ['learn-path', 'Unmounted'],
      ['settings-credits-path', 'Unmounted'],
      ['waitlist-path', 'Unmounted'],
      ['route-module-cleanup', 'No route modules'],
      ['migration-copy-boundary', 'Not required'],
      ['product-loop-redirect-boundary', 'ClassGamify routes only'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateLegacyRouteText(JSON.stringify(handoffView));
});

test('legacy public route handoff localizes Chinese retirement boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildLegacyPublicRouteHandoffView(EVIDENCE);

    assert.equal(handoffView.title, '旧公开路径退役交接');
    assert.match(handoffView.description, /30 切片旧公开路径退役契约/);
    assert.equal(
      getHandoffValue(handoffView, 'retired-inventory-count'),
      '8 个路径'
    );
    assert.equal(
      getHandoffValue(handoffView, 'mounted-route-count'),
      '0 个挂载'
    );
    assert.equal(
      getHandoffValue(handoffView, 'route-tree-boundary'),
      '无生成路由'
    );
    assert.equal(getHandoffValue(handoffView, 'hanzi-path'), '未挂载');
    assert.equal(
      getHandoffValue(handoffView, 'homepage-entrypoint-boundary'),
      'ClassGamify 入口'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateLegacyRouteText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('retired legacy route evidence comes from generated routes and public helpers', () => {
  assert.deepEqual(EVIDENCE.mountedRetiredPaths, []);
  assert.deepEqual(EVIDENCE.routeTreeRetiredPaths, []);
  assert.deepEqual(EVIDENCE.routeModuleRetiredPaths, []);
  assert.deepEqual(EVIDENCE.routeConstantRetiredPaths, []);
  assert.deepEqual(EVIDENCE.sitemapRetiredPaths, []);
  assert.deepEqual(EVIDENCE.localizedSitemapRetiredPaths, []);
  assert.deepEqual(EVIDENCE.navbarRetiredHrefs, []);
  assert.deepEqual(EVIDENCE.footerRetiredHrefs, []);
  assert.deepEqual(EVIDENCE.sidebarRetiredHrefs, []);
  assert.deepEqual(EVIDENCE.migrationEntrypointRetiredPaths, []);
  assert.deepEqual(EVIDENCE.migrationCopyRetiredPaths, []);
  assert.deepEqual(EVIDENCE.noindexRetiredPaths, []);
  assert.deepEqual(
    [...RETIRED_LEGACY_PUBLIC_PATHS],
    [
      '/about',
      '/ai',
      '/changelog',
      '/hanzi',
      '/hsk',
      '/learn',
      '/settings/credits',
      '/waitlist',
    ]
  );
  assert.match(PUBLIC_ROUTES_SOURCE, /RETIRED_LEGACY_PUBLIC_PATHS/);
});

test('legacy public route focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Legacy public route retirement has a fast script-level gate via[\s\S]*scripts\/legacy-public-route-handoff-semantic-views\.test\.ts[\s\S]*retired copied-learning routes[\s\S]*route-tree cleanup[\s\S]*noindex migration entrypoints[\s\S]*sitemap exclusion[\s\S]*localized sitemap exclusion[\s\S]*navigation exclusion[\s\S]*robots protected-surface rules[\s\S]*legacy-copy guards[\s\S]*legacy-public-route handoff/,
    'E2E catalog should point retired legacy route work at the focused script gate.'
  );
});

function buildLegacyPublicRouteEvidence(): LegacyPublicRouteHandoffEvidence {
  const mountedRetiredPaths = getMountedRetiredPathsFromRouteTree();
  const routeModuleSources = getRetiredRouteModuleSources();
  const sitemapPaths = getSitemapUrls().map((url) => url.path);
  const localizedSitemapPaths = buildSitemapUrlEntries({
    baseUrl: BASE_URL,
  }).map((entry) => new URL(entry.loc).pathname);
  const routeConstantPaths = Object.values(Routes);
  const robotsDisallowPaths = getRobotsDisallowPaths();
  const homePageView = buildHomePageViewModel();

  return {
    footerRetiredHrefs: getRetiredHrefs(flattenMenuHrefs(getFooterLinks())),
    homeEntrypointHrefs: [
      homePageView.hero.browseTemplatesAction.to,
      homePageView.hero.primaryAction.to,
      homePageView.hero.worksheetAction.to,
    ],
    localizedSitemapRetiredPaths: getRetiredLocalizedPaths(
      localizedSitemapPaths
    ),
    migrationCopyRetiredPaths: getRouteSourceRetiredPathsMatching(
      routeModuleSources,
      /ClassGamify[\s\S]*(migration|迁移)|Activity -> Assignment -> Attempt -> Results/i
    ),
    migrationEntrypointRetiredPaths: getRouteSourceRetiredPathsMatching(
      routeModuleSources,
      /ClassGamify[\s\S]*(migration|迁移|templates|assignment links|results)/i
    ),
    mountedRetiredPaths,
    navbarRetiredHrefs: getRetiredHrefs(flattenMenuHrefs(getNavbarLinks())),
    noindexRetiredPaths: getRouteSourceRetiredPathsMatching(
      routeModuleSources,
      /robots:\s*['"`]noindex|name:\s*['"`]robots['"`][\s\S]*noindex/i
    ),
    protectedRobotsPaths: ['/dashboard', '/settings', '/play', '/print'].filter(
      (path) => robotsDisallowPaths.includes(path)
    ),
    routeConstantRetiredPaths: getRetiredHrefs(routeConstantPaths),
    routeModuleRetiredPaths: Object.keys(routeModuleSources),
    routeTreeRetiredPaths: mountedRetiredPaths,
    sidebarRetiredHrefs: getRetiredHrefs(flattenMenuHrefs(getSidebarLinks())),
    sitemapRetiredPaths: getRetiredHrefs(sitemapPaths),
  };
}

function getMountedRetiredPathsFromRouteTree() {
  return RETIRED_LEGACY_PUBLIC_PATHS.filter((path) =>
    routeTreeContainsPath(path)
  );
}

function routeTreeContainsPath(path: string) {
  const quotedPath = escapeRegExp(path);
  return new RegExp(`['"]${quotedPath}['"]`).test(ROUTE_TREE_SOURCE);
}

function getRetiredRouteModuleSources() {
  return Object.fromEntries(
    Object.entries(RETIRED_ROUTE_MODULE_CANDIDATES)
      .flatMap(([path, candidates]) =>
        candidates
          .filter((candidate) => existsSync(candidate))
          .map((candidate) => [path, readFileSync(candidate, 'utf8')] as const)
      )
      .slice(0)
  );
}

function getRouteSourceRetiredPathsMatching(
  sourcesByPath: Record<string, string>,
  pattern: RegExp
) {
  return Object.entries(sourcesByPath)
    .filter(([, source]) => pattern.test(source))
    .map(([path]) => path);
}

function getRetiredLocalizedPaths(paths: string[]) {
  const retiredVariants = RETIRED_LEGACY_PUBLIC_PATHS.flatMap((path) => [
    path,
    ...locales.map((locale) => localizeHref(path, { locale })),
  ]);

  return paths.filter((path) => retiredVariants.includes(path));
}

function flattenMenuHrefs(items: unknown[]): string[] {
  return items.flatMap((item) => {
    const menuItem = item as {
      href?: string;
      items?: unknown[];
    };

    return [
      ...(menuItem.href ? [menuItem.href] : []),
      ...(menuItem.items ? flattenMenuHrefs(menuItem.items) : []),
    ];
  });
}

function getRetiredHrefs(paths: string[]) {
  return paths.filter((path) =>
    RETIRED_LEGACY_PUBLIC_PATHS.includes(path as RetiredLegacyPath)
  );
}

function getHandoffValue(
  view: LegacyPublicRouteHandoffView,
  id: LegacyPublicRouteHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing legacy public route handoff item ${id}`);
  return item.value;
}

function assertNoPrivateLegacyRouteText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_FILE_BYTES,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Legacy public route handoff leaked private text: ${privateValue}`
    );
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
