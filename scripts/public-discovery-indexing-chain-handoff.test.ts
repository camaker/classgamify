import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS } from '@/activities/entry-page-view';
import { AUTH_WORKSPACE_HANDOFF_ITEM_IDS } from '@/auth/workspace-boundary';
import { CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS } from '@/contact/inquiry-view';
import { ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS } from '@/config/active-surface-product-boundary';
import { Routes } from '@/lib/routes';
import { PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS } from '@/navigation/public-navigation-handoff';
import { LEGAL_POLICY_HANDOFF_ITEM_IDS } from '@/pages/legal-policy-view';
import {
  HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS,
  PRICING_PAGE_HANDOFF_ITEM_IDS,
  ROADMAP_PUBLIC_HANDOFF_ITEM_IDS,
  TEACHERS_PAGE_HANDOFF_ITEM_IDS,
} from '@/pages/public-page-view';
import { PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS } from '@/pages/public-editorial-content-view';
import {
  PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS,
  PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES,
  buildPublicDiscoveryIndexingChainHandoffView,
  type PublicDiscoveryIndexingChainHandoffItemId,
  type PublicDiscoveryIndexingChainHandoffView,
} from '@/seo/public-discovery-indexing-chain';
import {
  PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES,
  PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES,
  PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS,
} from '@/seo/public-dom-handoff-boundary';
import {
  buildRobotsTxt,
  buildSitemap,
  buildSitemapUrlEntries,
  getRobotsDisallowPaths,
  getSitemapUrls,
} from '@/seo/public-indexing';
import { LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS } from '@/seo/legacy-public-route-handoff';
import { PUBLIC_METADATA_HANDOFF_ITEM_IDS } from '@/seo/public-metadata-handoff';
import {
  PUBLIC_INDEXABLE_STATIC_ROUTES,
  PUBLIC_ROBOTS_DISALLOW_RULES,
  RETIRED_LEGACY_PUBLIC_PATHS,
} from '@/seo/public-routes';
import {
  buildWebAppManifest,
  buildWebAppManifestInstallBoundary,
} from '@/seo/web-manifest';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const PUBLIC_ROUTES_SOURCE = readFileSync('src/seo/public-routes.ts', 'utf8');
const PUBLIC_INDEXING_SOURCE = readFileSync(
  'src/seo/public-indexing.ts',
  'utf8'
);
const SITEMAP_ROUTE_SOURCE = readFileSync(
  'src/routes/sitemap[.]xml.ts',
  'utf8'
);
const ROBOTS_ROUTE_SOURCE = readFileSync('src/routes/robots[.]txt.ts', 'utf8');
const MANIFEST_ROUTE_SOURCE = readFileSync(
  'src/routes/manifest[.]json.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PUBLIC_ROUTE_INTERNAL_HANDOFF_PATTERN =
  /data-handoff|data-handoff-item|HandoffPanel|handoffView\.itemViews|<[^>]*Handoff\b/;

const PRIVATE_ANSWER_KEY = 'SECRET_PUBLIC_DISCOVERY_ANSWER_KEY';
const PRIVATE_ATTEMPT_RECORD = 'SECRET_PUBLIC_DISCOVERY_ATTEMPT_RECORD';
const PRIVATE_FILE_BYTES = 'raw-private-public-discovery-file-bytes';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/public-discovery.pdf';
const PRIVATE_STUDENT_TOKEN = 'SECRET_PUBLIC_DISCOVERY_ANONYMOUS_TOKEN';
const PRIVATE_TEACHER_CONTENT =
  'SECRET_PUBLIC_DISCOVERY_TEACHER_ACTIVITY_CONTENT';

test('public discovery/indexing chain exposes 30 safe public slices', () => {
  const handoffView = buildPublicDiscoveryIndexingChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Public discovery/indexing chain');
  assert.match(
    handoffView.description,
    /Thirty-slice public discovery and indexing chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
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
    chainSourceFileCount: PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesPublicDomHandoffMarkup: false,
    exposesRawAnonymousTokens: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    includesLocalizedAlternates: true,
    itemIds,
    keepsAuthEntryOutOfIndex: true,
    keepsDashboardOutOfIndex: true,
    keepsManifestProtectedSurfacesOut: true,
    keepsManifestRetiredLegacyOut: true,
    keepsPrintRoutesOutOfIndex: true,
    keepsPublicHandoffsSourceLevel: true,
    keepsRetiredLegacyOutOfIndex: true,
    keepsStudentRunnerOutOfIndex: true,
    manifestTargetsPublicRoot: true,
    readsSourceMaterialFileBytes: false,
    routeActionsUseSharedConstants: true,
    sourceFiles: [...PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES],
    usesPublicMetadataHandoff: true,
    usesSharedIndexingHelpers: true,
  });
  assertNoPrivatePublicDiscoveryText(JSON.stringify(handoffView));
});

test('public discovery/indexing chain summarizes the route and indexing flow', () => {
  const handoffView = buildPublicDiscoveryIndexingChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['public-route-registry', 'PUBLIC_INDEXABLE_STATIC_ROUTES'],
      ['home-product-entry', Routes.Root],
      ['navigation-entrypoints', 'Navbar and footer'],
      ['template-directory-entry', Routes.Templates],
      ['worksheet-entry', Routes.Worksheets],
      ['teachers-page-entry', Routes.Teachers],
      ['pricing-plan-boundary', Routes.Pricing],
      ['roadmap-status-boundary', Routes.Roadmap],
      ['contact-classroom-entry', Routes.ContactClassroom],
      ['editorial-content-boundary', Routes.Blog],
      ['legal-policy-boundary', 'Terms/privacy/cookie'],
      ['auth-entry-boundary', Routes.Auth],
      ['active-surface-copy-boundary', 'ClassGamify copy'],
      ['sitemap-static-routes', 'Shared registry'],
      ['sitemap-blog-routes', 'Published posts'],
      ['localized-alternates', 'hreflang + x-default'],
      ['robots-protected-boundaries', 'dashboard/settings/play/print/auth'],
      ['manifest-install-boundary', Routes.Root],
      ['legacy-route-inventory', 'Retired path list'],
      ['legacy-noindex-boundary', 'Noindex when mounted'],
      ['legacy-navigation-exclusion', 'Navigation excluded'],
      ['public-dom-route-guard', 'Route files blocked'],
      ['public-dom-component-guard', 'Shared components blocked'],
      ['source-level-handoff-contracts', 'Focused gates only'],
      ['classroom-control-route-gate', 'Create/dashboard/play/print'],
      ['student-runner-index-guard', Routes.Play],
      ['print-route-index-guard', '/print'],
      ['private-data-guard', 'Private data hidden'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['public-metadata-handoff-boundary', '30 metadata slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'manifest-install-boundary'),
    Routes.Root
  );
  assert.equal(
    getHandoffValue(handoffView, 'private-data-guard'),
    'Private data hidden'
  );
});

test('public discovery/indexing chain is backed by focused public gates', () => {
  assert.equal(PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing public discovery/indexing chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS.length,
      PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS.length,
      PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS.length,
      TEACHERS_PAGE_HANDOFF_ITEM_IDS.length,
      ROADMAP_PUBLIC_HANDOFF_ITEM_IDS.length,
      PRICING_PAGE_HANDOFF_ITEM_IDS.length,
      PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS.length,
      LEGAL_POLICY_HANDOFF_ITEM_IDS.length,
      CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS.length,
      AUTH_WORKSPACE_HANDOFF_ITEM_IDS.length,
      ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS.length,
      PUBLIC_METADATA_HANDOFF_ITEM_IDS.length,
      PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS.length,
      LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 14 }, () => 30)
  );
});

test('public discovery/indexing sources preserve docs product boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Public\s+navigation and homepage entry points should point at ClassGamify templates,[\s\S]*creation, assignment links, and results[\s\S]*legacy learning routes/,
    'docs/product.md should keep public navigation focused on current ClassGamify entry points.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /sitemap URLs, localized alternates, robots disallow rules, and the web[\s\S]*app manifest must agree on which ClassGamify pages are public entry points[\s\S]*teacher, student-runner, print, or retired legacy paths stay out of[\s\S]*search indexing/,
    'docs/product.md should keep sitemap, robots, and manifest on the same public/private route boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Public template directories, worksheet entry pages, marketing pages,[\s\S]*should not render internal `data-handoff`[\s\S]*audit output into public DOM/,
    'docs/product.md should keep public handoff contracts source-level.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Copied-template surfaces[\s\S]*Legacy learning URLs that remain mounted[\s\S]*ClassGamify migration entry points and carry noindex metadata/,
    'docs/product.md should require noindex migration-only handling for mounted retired paths.'
  );
});

test('public route registry and indexing helpers keep crawlable routes aligned', () => {
  assert.deepEqual(
    PUBLIC_INDEXABLE_STATIC_ROUTES.map((route) => [route.id, route.path]),
    [
      ['home', Routes.Root],
      ['templates', Routes.Templates],
      ['worksheets', Routes.Worksheets],
      ['create', Routes.Create],
      ['pricing', Routes.Pricing],
      ['teachers', Routes.Teachers],
      ['contact', Routes.Contact],
      ['blog', Routes.Blog],
      ['roadmap', Routes.Roadmap],
      ['cookie', Routes.CookiePolicy],
      ['terms', Routes.TermsOfService],
      ['privacy', Routes.PrivacyPolicy],
    ]
  );
  assert.deepEqual(
    PUBLIC_ROBOTS_DISALLOW_RULES.map((rule) => [rule.id, rule.path]),
    [
      ['auth', Routes.Auth],
      ['admin', Routes.Admin],
      ['settings', Routes.Settings],
      ['dashboard', Routes.Dashboard],
      ['print', '/print'],
      ['play', '/play'],
    ]
  );
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
  assert.doesNotMatch(
    JSON.stringify(getSitemapUrls()),
    /\/play|\/print|\/dashboard|\/settings|\/auth|\/admin|\/learn|\/hsk|\/hanzi|\/waitlist/i,
    'Sitemap URL helpers should not include protected or retired public paths.'
  );
  assert.match(buildSitemap(), /hreflang="x-default"/);
  assert.match(
    buildSitemap(),
    /<loc>https?:\/\/[^<]+\/templates<\/loc>|<loc>\/templates<\/loc>/
  );
  assert.match(buildRobotsTxt(), /Disallow: \/dashboard/);
  assert.match(buildRobotsTxt(), /Disallow: \/settings/);
  assert.match(buildRobotsTxt(), /Disallow: \/play/);
  assert.match(buildRobotsTxt(), /Disallow: \/print/);
  assert.match(buildRobotsTxt(), /Disallow: \/auth/);
  assert.match(buildRobotsTxt(), /Sitemap: .*\/sitemap\.xml/);
});

test('public indexing route handlers delegate to shared helpers', () => {
  assert.match(
    PUBLIC_ROUTES_SOURCE,
    /PUBLIC_INDEXABLE_STATIC_ROUTES[\s\S]*Routes\.Templates[\s\S]*Routes\.Worksheets[\s\S]*Routes\.Create/
  );
  assert.match(
    PUBLIC_ROUTES_SOURCE,
    /PUBLIC_ROBOTS_DISALLOW_RULES[\s\S]*Routes\.Auth[\s\S]*Routes\.Admin[\s\S]*Routes\.Settings[\s\S]*Routes\.Dashboard[\s\S]*'\/print'[\s\S]*'\/play'/
  );
  assert.match(
    PUBLIC_ROUTES_SOURCE,
    /RETIRED_LEGACY_PUBLIC_PATHS[\s\S]*'\/about'[\s\S]*'\/learn'[\s\S]*'\/waitlist'/
  );
  assert.match(
    PUBLIC_INDEXING_SOURCE,
    /buildSitemapUrlEntries[\s\S]*isLocalizedPath\(url\.path\)[\s\S]*locales\.map[\s\S]*buildSitemapAlternateLinks/
  );
  assert.match(
    PUBLIC_INDEXING_SOURCE,
    /function getRobotsDisallowLines\(\)[\s\S]*getRobotsDisallowPaths\(\)\.map/
  );
  assert.match(
    PUBLIC_INDEXING_SOURCE,
    /getSitemapUrls\(\)[\s\S]*PUBLIC_INDEXABLE_STATIC_ROUTES[\s\S]*getSortedPosts\(baseLocale\)/
  );
  assert.match(
    SITEMAP_ROUTE_SOURCE,
    /GET: async \(\) => \{[\s\S]*new Response\(buildSitemap\(\),[\s\S]*headers: SITEMAP_XML_HEADERS/
  );
  assert.match(
    ROBOTS_ROUTE_SOURCE,
    /GET: async \(\) => \{[\s\S]*new Response\(buildRobotsTxt\(\),[\s\S]*headers: ROBOTS_TXT_HEADERS/
  );
  assert.match(
    MANIFEST_ROUTE_SOURCE,
    /GET: async \(\) => \{[\s\S]*JSON\.stringify\(buildWebAppManifest\(\)\)[\s\S]*headers: WEB_MANIFEST_HEADERS/
  );
  assert.doesNotMatch(
    `${SITEMAP_ROUTE_SOURCE}\n${ROBOTS_ROUTE_SOURCE}\n${MANIFEST_ROUTE_SOURCE}`,
    /PUBLIC_INDEXABLE_STATIC_ROUTES|PUBLIC_ROBOTS_DISALLOW_RULES|RETIRED_LEGACY_PUBLIC_PATHS|websiteConfig/,
    'Public metadata routes should delegate to shared helpers instead of rebuilding registries inline.'
  );
});

test('public DOM route and component sources keep audit handoff markup out', () => {
  const routeLeaks = PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES.filter(
    (filePath) => {
      assert.ok(existsSync(filePath), `Missing public route file ${filePath}`);
      return PUBLIC_ROUTE_INTERNAL_HANDOFF_PATTERN.test(
        readFileSync(filePath, 'utf8')
      );
    }
  );
  const componentLeaks = PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES.filter(
    (filePath) => {
      assert.ok(
        existsSync(filePath),
        `Missing public component file ${filePath}`
      );
      return PUBLIC_ROUTE_INTERNAL_HANDOFF_PATTERN.test(
        readFileSync(filePath, 'utf8')
      );
    }
  );

  assert.deepEqual(routeLeaks, []);
  assert.deepEqual(componentLeaks, []);
  assert.equal(PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES.length, 18);
  assert.equal(PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES.length, 12);
});

test('manifest and robots keep protected and legacy paths out of discovery', () => {
  const manifest = buildWebAppManifest();
  const installBoundary = buildWebAppManifestInstallBoundary(manifest);
  const robotsDisallowPaths = getRobotsDisallowPaths();
  const sitemapEntryPaths = buildSitemapUrlEntries({
    baseUrl: 'https://classgamify.example',
  }).map((entry) => new URL(entry.loc).pathname);

  assert.deepEqual(installBoundary, {
    hasConfiguredDescription: true,
    hasConfiguredName: true,
    hasMaskableIcons: true,
    keepsProtectedSurfacesOut: true,
    keepsRetiredLegacyOut: true,
    maskableIconCount: 2,
    scope: 'public-web-app-install-metadata',
    usesPublicRootScope: true,
    usesPublicRootStartUrl: true,
  });
  assert.equal(manifest.start_url, Routes.Root);
  assert.equal(manifest.scope, Routes.Root);
  for (const blockedPath of [
    Routes.Auth,
    Routes.Admin,
    Routes.Settings,
    Routes.Dashboard,
    '/play',
    '/print',
  ]) {
    assert.ok(
      robotsDisallowPaths.includes(blockedPath),
      `${blockedPath} should be disallowed by robots.`
    );
  }
  assert.deepEqual(
    sitemapEntryPaths.filter((path) =>
      RETIRED_LEGACY_PUBLIC_PATHS.includes(
        path as (typeof RETIRED_LEGACY_PUBLIC_PATHS)[number]
      )
    ),
    []
  );
});

test('public discovery/indexing chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Public discovery\/indexing chain has a fast script-level gate via[\s\S]*scripts\/public-discovery-indexing-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the public discovery/indexing chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public entry routes[\s\S]*navigation[\s\S]*template\/worksheet entries[\s\S]*sitemap\/robots\/manifest[\s\S]*legacy route retirement[\s\S]*public DOM handoff boundaries[\s\S]*privacy\/indexing guards/,
    'TEST-CATALOG should describe the full public discovery/indexing chain scope.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public metadata handoff boundary/,
    'TEST-CATALOG should document the concrete public metadata handoff boundary.'
  );
});

function getHandoffValue(
  view: PublicDiscoveryIndexingChainHandoffView,
  id: PublicDiscoveryIndexingChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing public discovery/indexing chain item ${id}`);
  return item.value;
}

function assertNoPrivatePublicDiscoveryText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_KEY,
    PRIVATE_ATTEMPT_RECORD,
    PRIVATE_FILE_BYTES,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_TOKEN,
    PRIVATE_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public discovery/indexing chain leaked private text: ${privateValue}`
    );
  }
}
