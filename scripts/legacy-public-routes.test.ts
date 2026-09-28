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
import { redirectLegacyPublicRoute } from '@/seo/legacy-public-redirects';
import {
  buildSitemapUrlEntries,
  getRobotsDisallowPaths,
  getSitemapUrls,
} from '@/seo/public-indexing';
import { RETIRED_LEGACY_PUBLIC_PATHS } from '@/seo/public-routes';

overwriteGetLocale(() => 'en');

const BASE_URL = 'https://classgamify.example';

type RetiredLegacyPath = (typeof RETIRED_LEGACY_PUBLIC_PATHS)[number];

const ROUTE_TREE_SOURCE = readFileSync('src/routeTree.gen.ts', 'utf8');
const PUBLIC_ROUTES_SOURCE = readFileSync('src/seo/public-routes.ts', 'utf8');
const REDIRECT_SOURCE = readFileSync(
  'src/seo/legacy-public-redirects.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const RETIRED_ROUTE_MODULE_CANDIDATES = {
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
  assert.match(REDIRECT_SOURCE, /\['\/\(pages\)\/roadmap', '\/roadmap'\]/);
  assert.match(REDIRECT_SOURCE, /\['\/\(legals\)\/terms', '\/terms'\]/);
  assert.match(REDIRECT_SOURCE, /\['\/\(legals\)\/terms\/terms', '\/terms'\]/);
  assert.match(REDIRECT_SOURCE, /Response\.redirect\(url, 308\)/);
  assert.ok(
    redirectLegacyPublicRoute(
      new Request('https://example.test/(pages)/roadmap')
    )
  );
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
    /Legacy public route retirement has a fast script-level gate via[\s\S]*scripts\/legacy-public-routes\.test\.ts[\s\S]*retired copied-learning routes[\s\S]*route-tree cleanup[\s\S]*noindex migration entrypoints[\s\S]*sitemap exclusion[\s\S]*localized sitemap exclusion[\s\S]*navigation exclusion[\s\S]*robots protected-surface rules[\s\S]*legacy-copy guards[\s\S]*legacy-public-route handoff/,
    'E2E catalog should point retired legacy route work at the focused script gate.'
  );
});

function buildLegacyPublicRouteEvidence() {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
