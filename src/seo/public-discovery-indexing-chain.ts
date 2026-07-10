import { Routes } from '@/lib/routes';

export const PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS = [
  'public-route-registry',
  'home-product-entry',
  'navigation-entrypoints',
  'template-directory-entry',
  'worksheet-entry',
  'teachers-page-entry',
  'pricing-plan-boundary',
  'roadmap-status-boundary',
  'contact-classroom-entry',
  'editorial-content-boundary',
  'legal-policy-boundary',
  'auth-entry-boundary',
  'active-surface-copy-boundary',
  'sitemap-static-routes',
  'sitemap-blog-routes',
  'localized-alternates',
  'robots-protected-boundaries',
  'manifest-install-boundary',
  'legacy-route-inventory',
  'legacy-noindex-boundary',
  'legacy-navigation-exclusion',
  'public-dom-route-guard',
  'public-dom-component-guard',
  'source-level-handoff-contracts',
  'classroom-control-route-gate',
  'student-runner-index-guard',
  'print-route-index-guard',
  'private-data-guard',
  'legacy-copy-guard',
  'public-discovery-chain-gate',
] as const;

export const PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/seo/public-routes.ts',
  'src/seo/public-indexing.ts',
  'src/seo/public-metadata-handoff.ts',
  'src/seo/public-dom-handoff-boundary.ts',
  'src/seo/legacy-public-route-handoff.ts',
  'src/seo/web-manifest.ts',
  'src/navigation/public-navigation-handoff.ts',
  'src/pages/public-page-view.ts',
  'src/pages/public-editorial-content-view.ts',
  'src/pages/legal-policy-view.ts',
  'src/activities/entry-page-view.ts',
  'src/contact/inquiry-view.ts',
  'src/auth/workspace-boundary.ts',
  'src/config/active-surface-product-boundary.ts',
  'src/routes/index.tsx',
  'src/routes/templates.tsx',
  'src/routes/worksheets.tsx',
  'src/routes/(pages)/pricing.tsx',
  'src/routes/(pages)/teachers.tsx',
  'src/routes/(pages)/roadmap.tsx',
  'src/routes/(pages)/contact.tsx',
  'src/routes/blog/index.tsx',
  'src/routes/blog/$slug.tsx',
  'src/routes/(legals)/privacy.tsx',
  'src/routes/(legals)/terms.tsx',
  'src/routes/(legals)/cookie.tsx',
  'src/routes/sitemap[.]xml.ts',
  'src/routes/robots[.]txt.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type PublicDiscoveryIndexingChainHandoffItemId =
  (typeof PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS)[number];

export type PublicDiscoveryIndexingChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicDiscoveryIndexingChainHandoffItemId;
  label: string;
  value: string;
};

export type PublicDiscoveryIndexingChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesPublicDomHandoffMarkup: false;
  exposesRawAnonymousTokens: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  includesLocalizedAlternates: true;
  itemIds: PublicDiscoveryIndexingChainHandoffItemId[];
  keepsAuthEntryOutOfIndex: true;
  keepsPrintRoutesOutOfIndex: true;
  keepsPublicHandoffsSourceLevel: true;
  keepsRetiredLegacyOutOfIndex: true;
  keepsStudentRunnerOutOfIndex: true;
  manifestTargetsPublicRoot: true;
  routeActionsUseSharedConstants: true;
  sourceFiles: string[];
  usesSharedIndexingHelpers: true;
};

export type PublicDiscoveryIndexingChainHandoffView = {
  description: string;
  itemViews: PublicDiscoveryIndexingChainHandoffItemView[];
  privacy: PublicDiscoveryIndexingChainPrivacyContract;
  title: string;
};

export function buildPublicDiscoveryIndexingChainHandoffView(): PublicDiscoveryIndexingChainHandoffView {
  const itemViews = PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildPublicDiscoveryIndexingChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice public discovery and indexing chain from public product entry routes through sitemap, robots, manifest, legacy-route retirement, public DOM handoff blocking, and privacy/indexing guards.',
    itemViews,
    privacy: {
      chainSourceFileCount: PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinks: false,
      exposesAnswerKeys: false,
      exposesPublicDomHandoffMarkup: false,
      exposesRawAnonymousTokens: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAttemptRecords: false,
      exposesTeacherPrivateActivityContent: false,
      includesLocalizedAlternates: true,
      itemIds: [...PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS],
      keepsAuthEntryOutOfIndex: true,
      keepsPrintRoutesOutOfIndex: true,
      keepsPublicHandoffsSourceLevel: true,
      keepsRetiredLegacyOutOfIndex: true,
      keepsStudentRunnerOutOfIndex: true,
      manifestTargetsPublicRoot: true,
      routeActionsUseSharedConstants: true,
      sourceFiles: [...PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES],
      usesSharedIndexingHelpers: true,
    },
    title: 'Public discovery/indexing chain',
  };
}

function buildPublicDiscoveryIndexingChainHandoffItemView(
  id: PublicDiscoveryIndexingChainHandoffItemId
): PublicDiscoveryIndexingChainHandoffItemView {
  const item = getPublicDiscoveryIndexingChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getPublicDiscoveryIndexingChainHandoffItem(
  id: PublicDiscoveryIndexingChainHandoffItemId
): Omit<PublicDiscoveryIndexingChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'public-route-registry':
      return item(
        id,
        'Public route registry',
        'PUBLIC_INDEXABLE_STATIC_ROUTES',
        'Shared public route constants define the crawlable ClassGamify entry set.'
      );
    case 'home-product-entry':
      return item(
        id,
        'Home product entry',
        Routes.Root,
        'The homepage points at the activity, template, worksheet, assignment, and results loop.'
      );
    case 'navigation-entrypoints':
      return item(
        id,
        'Navigation entrypoints',
        'Navbar and footer',
        'Public navigation uses shared route constants for current ClassGamify surfaces.'
      );
    case 'template-directory-entry':
      return item(
        id,
        'Template directory entry',
        Routes.Templates,
        'Template cards are indexable creation entry points into the shared editor.'
      );
    case 'worksheet-entry':
      return item(
        id,
        'Worksheet entry',
        Routes.Worksheets,
        'Worksheet-style pages stay on the activity-assignment-attempt-results model.'
      );
    case 'teachers-page-entry':
      return item(
        id,
        'Teachers page entry',
        Routes.Teachers,
        'Teacher-facing public copy describes classroom activity workflows.'
      );
    case 'pricing-plan-boundary':
      return item(
        id,
        'Pricing plan boundary',
        Routes.Pricing,
        'Pricing stays a public capability summary without creating assignment links.'
      );
    case 'roadmap-status-boundary':
      return item(
        id,
        'Roadmap status boundary',
        Routes.Roadmap,
        'Roadmap status copy stays tied to current usable product loops.'
      );
    case 'contact-classroom-entry':
      return item(
        id,
        'Contact classroom entry',
        Routes.ContactClassroom,
        'Classroom inquiries collect teacher context without exposing student records.'
      );
    case 'editorial-content-boundary':
      return item(
        id,
        'Editorial content boundary',
        Routes.Blog,
        'Editorial pages remain public content surfaces backed by source-level contracts.'
      );
    case 'legal-policy-boundary':
      return item(
        id,
        'Legal policy boundary',
        'Terms/privacy/cookie',
        'Legal routes are public policy pages without internal audit DOM output.'
      );
    case 'auth-entry-boundary':
      return item(
        id,
        'Auth entry boundary',
        Routes.Auth,
        'Auth entry pages are public UX routes but stay out of indexing and audit DOM.'
      );
    case 'active-surface-copy-boundary':
      return item(
        id,
        'Active surface copy',
        'ClassGamify copy',
        'Current public and active surfaces avoid copied learning-site terminology.'
      );
    case 'sitemap-static-routes':
      return item(
        id,
        'Sitemap static routes',
        'Shared registry',
        'Static sitemap entries come from the shared public route registry.'
      );
    case 'sitemap-blog-routes':
      return item(
        id,
        'Sitemap blog routes',
        'Published posts',
        'Blog URLs append sorted public posts with lastmod metadata.'
      );
    case 'localized-alternates':
      return item(
        id,
        'Localized alternates',
        'hreflang + x-default',
        'Localized sitemap entries include alternate links for configured locales.'
      );
    case 'robots-protected-boundaries':
      return item(
        id,
        'Robots protected boundaries',
        'dashboard/settings/play/print/auth',
        'Robots rules block teacher workspace, student runner, print, auth, and admin surfaces.'
      );
    case 'manifest-install-boundary':
      return item(
        id,
        'Manifest install boundary',
        Routes.Root,
        'Web app install metadata starts and scopes at the public root.'
      );
    case 'legacy-route-inventory':
      return item(
        id,
        'Legacy route inventory',
        'Retired path list',
        'Retired copied-template paths stay centralized for cleanup and migration review.'
      );
    case 'legacy-noindex-boundary':
      return item(
        id,
        'Legacy noindex boundary',
        'Noindex when mounted',
        'Any still-mounted retired public paths must be migration-only and noindex.'
      );
    case 'legacy-navigation-exclusion':
      return item(
        id,
        'Legacy navigation exclusion',
        'Navigation excluded',
        'Public navbar, footer, and sidebar avoid retired legacy entry points.'
      );
    case 'public-dom-route-guard':
      return item(
        id,
        'Public DOM route guard',
        'Route files blocked',
        'Public marketing, editorial, legal, contact, and auth routes do not render data-handoff audit markup.'
      );
    case 'public-dom-component-guard':
      return item(
        id,
        'Public DOM component guard',
        'Shared components blocked',
        'Shared public components do not mount internal handoff audit output.'
      );
    case 'source-level-handoff-contracts':
      return item(
        id,
        'Source-level handoff contracts',
        'Focused gates only',
        'Public handoff evidence stays available to tests without leaking into public DOM.'
      );
    case 'classroom-control-route-gate':
      return item(
        id,
        'Classroom control route gate',
        'Create/dashboard/play/print',
        'Classroom control semantics remain scoped to authoring, workspace, runner, and print routes.'
      );
    case 'student-runner-index-guard':
      return item(
        id,
        'Student runner index guard',
        Routes.Play,
        'Public assignment play URLs stay protected from general discovery indexing.'
      );
    case 'print-route-index-guard':
      return item(
        id,
        'Print route index guard',
        '/print',
        'Teacher printable worksheet routes stay protected from public indexing.'
      );
    case 'private-data-guard':
      return item(
        id,
        'Private data guard',
        'Private data hidden',
        'The discovery chain excludes answer keys, attempt records, raw tokens, and storage keys.'
      );
    case 'legacy-copy-guard':
      return item(
        id,
        'Legacy copy guard',
        'ClassGamify only',
        'Public discovery surfaces describe ClassGamify instead of retired copied-template pages.'
      );
    case 'public-discovery-chain-gate':
      return item(
        id,
        'Public discovery chain gate',
        '30 source files',
        'A focused gate keeps public entry routes, indexing helpers, DOM boundaries, and legacy-route retirement aligned.'
      );
  }
}

function item(
  id: PublicDiscoveryIndexingChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<PublicDiscoveryIndexingChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
