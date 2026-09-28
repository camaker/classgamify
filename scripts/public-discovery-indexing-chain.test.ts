import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Routes } from '@/lib/routes';
import {
  buildRobotsTxt,
  buildSitemap,
  buildSitemapUrlEntries,
  getRobotsDisallowPaths,
  getSitemapUrls,
} from '@/seo/public-indexing';
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
      ['classroom-quiz-game', '/classroom-quiz-game'],
      ['classroom-matching-game', '/classroom-matching-game'],
      ['worksheets', Routes.Worksheets],
      ['create', Routes.Create],
      ['pricing', Routes.Pricing],
      ['about', Routes.About],
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
    /RETIRED_LEGACY_PUBLIC_PATHS[\s\S]*'\/ai'[\s\S]*'\/learn'[\s\S]*'\/waitlist'/
  );
  assert.match(
    PUBLIC_INDEXING_SOURCE,
    /buildSitemapUrlEntries[\s\S]*getSitemapLocalesForPath\(url\.path\)[\s\S]*buildSitemapUrlEntry[\s\S]*buildSitemapAlternateLinks/
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
    /Public discovery\/indexing chain has a fast script-level gate via[\s\S]*scripts\/public-discovery-indexing-chain\.test\.ts/,
    'TEST-CATALOG should document the public discovery/indexing chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public entry routes[\s\S]*navigation[\s\S]*template\/worksheet entries[\s\S]*sitemap\/robots\/manifest[\s\S]*legacy route retirement[\s\S]*public DOM boundaries[\s\S]*privacy\/indexing guards/,
    'TEST-CATALOG should describe the full public discovery/indexing chain scope.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public metadata boundary/,
    'TEST-CATALOG should document the public metadata boundary.'
  );
});
