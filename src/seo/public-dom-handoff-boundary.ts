import { Routes } from '@/lib/routes';

export const PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS = [
  'product-loop',
  'public-route-set',
  'home-route',
  'template-directory-route',
  'worksheet-entry-route',
  'pricing-route',
  'teachers-route',
  'roadmap-route',
  'contact-route',
  'blog-list-route',
  'blog-post-route',
  'legal-policy-routes',
  'auth-entry-routes',
  'navigation-surface',
  'footer-surface',
  'public-view-models',
  'source-level-contracts',
  'public-route-dom-guard',
  'public-handoff-markup-guard',
  'public-handoff-panel-guard',
  'classroom-control-route-gate',
  'student-runner-allowed',
  'create-authoring-allowed',
  'teacher-workspace-allowed',
  'print-route-allowed',
  'result-review-allowed',
  'private-data-guard',
  'legacy-copy-guard',
  'search-index-boundary',
  'privacy-guard',
] as const;

export const PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES = [
  'src/routes/index.tsx',
  'src/routes/templates.tsx',
  'src/routes/worksheets.tsx',
  'src/routes/(pages)/pricing.tsx',
  'src/routes/(pages)/teachers.tsx',
  'src/routes/(pages)/roadmap.tsx',
  'src/routes/(pages)/contact.tsx',
  'src/routes/blog/index.tsx',
  'src/routes/blog/$slug.tsx',
  'src/routes/(legals)/cookie.tsx',
  'src/routes/(legals)/privacy.tsx',
  'src/routes/(legals)/terms.tsx',
  'src/routes/auth.tsx',
  'src/routes/auth/login.tsx',
  'src/routes/auth/register.tsx',
  'src/routes/auth/forgot-password.tsx',
  'src/routes/auth/reset-password.tsx',
  'src/routes/auth/error.tsx',
] as const;

export const PUBLIC_DOM_HANDOFF_ALLOWED_ROUTE_SCOPES = [
  Routes.Create,
  Routes.Dashboard,
  Routes.Play,
  '/print',
] as const;

export type PublicDomHandoffBoundaryItemId =
  (typeof PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS)[number];

export type PublicDomHandoffBoundaryItemView = {
  ariaLabel: string;
  description: string;
  id: PublicDomHandoffBoundaryItemId;
  label: string;
  value: string;
};

export type PublicDomHandoffBoundaryPrivacyContract = {
  allowsAuthoringHandoffs: boolean;
  allowsPrintHandoffs: boolean;
  allowsStudentRunnerHandoffs: boolean;
  allowsTeacherWorkspaceHandoffs: boolean;
  blocksAuthPublicDomHandoffs: boolean;
  blocksMarketingPublicDomHandoffs: boolean;
  itemIds: PublicDomHandoffBoundaryItemId[];
  keepsPublicHandoffsSourceLevel: boolean;
  protectsPrivateClassroomData: boolean;
  routeFiles: string[];
  scope: 'public-dom-handoff-boundary';
};

export type PublicDomHandoffBoundaryView = {
  description: string;
  itemViews: PublicDomHandoffBoundaryItemView[];
  privacy: PublicDomHandoffBoundaryPrivacyContract;
  title: string;
};

export function buildPublicDomHandoffBoundaryView(): PublicDomHandoffBoundaryView {
  const itemViews = PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS.map((id) =>
    buildPublicDomHandoffBoundaryItemView(id)
  );

  return {
    description:
      'Source-level boundary for keeping public marketing, editorial, legal, contact, and auth route DOM free of internal data-handoff audit markup.',
    itemViews,
    privacy: {
      allowsAuthoringHandoffs: true,
      allowsPrintHandoffs: true,
      allowsStudentRunnerHandoffs: true,
      allowsTeacherWorkspaceHandoffs: true,
      blocksAuthPublicDomHandoffs: true,
      blocksMarketingPublicDomHandoffs: true,
      itemIds: [...PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS],
      keepsPublicHandoffsSourceLevel: true,
      protectsPrivateClassroomData: true,
      routeFiles: [...PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES],
      scope: 'public-dom-handoff-boundary',
    },
    title: 'Public DOM handoff boundary',
  };
}

function buildPublicDomHandoffBoundaryItemView(
  id: PublicDomHandoffBoundaryItemId
): PublicDomHandoffBoundaryItemView {
  const { description, label, value } = getPublicDomHandoffBoundaryItem(id);

  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function getPublicDomHandoffBoundaryItem(
  id: PublicDomHandoffBoundaryItemId
): Omit<PublicDomHandoffBoundaryItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-loop':
      return item(
        'Product loop',
        'Activity -> Assignment -> Attempt -> Results',
        'The public DOM boundary protects the current classroom loop.'
      );
    case 'public-route-set':
      return item(
        'Public route set',
        `${PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES.length} route files`,
        'Marketing, editorial, legal, contact, and auth route files stay free of internal audit DOM.'
      );
    case 'home-route':
      return item(
        'Home route',
        Routes.Root,
        'The homepage uses source-level product-loop handoff evidence without rendering audit markup.'
      );
    case 'template-directory-route':
      return item(
        'Template directory',
        Routes.Templates,
        'The template directory stays a creation entry point without internal handoff DOM.'
      );
    case 'worksheet-entry-route':
      return item(
        'Worksheet entry',
        Routes.Worksheets,
        'The worksheet entry page stays public and source-level only.'
      );
    case 'pricing-route':
      return item(
        'Pricing route',
        Routes.Pricing,
        'Pricing keeps plan-boundary evidence out of public DOM.'
      );
    case 'teachers-route':
      return item(
        'Teachers route',
        Routes.Teachers,
        'The teacher-facing public page keeps product-loop handoff evidence source-level.'
      );
    case 'roadmap-route':
      return item(
        'Roadmap route',
        Routes.Roadmap,
        'Roadmap status evidence stays source-level.'
      );
    case 'contact-route':
      return item(
        'Contact route',
        Routes.Contact,
        'Classroom intake keeps structured visible panels without internal audit markup.'
      );
    case 'blog-list-route':
      return item(
        'Blog list route',
        Routes.Blog,
        'Editorial list evidence stays source-level.'
      );
    case 'blog-post-route':
      return item(
        'Blog post route',
        `${Routes.Blog}/:slug`,
        'Article pages do not render internal editorial handoff markup.'
      );
    case 'legal-policy-routes':
      return item(
        'Legal policy routes',
        '3 policy routes',
        'Terms, privacy, and cookie routes keep policy handoff evidence out of DOM.'
      );
    case 'auth-entry-routes':
      return item(
        'Auth entry routes',
        '5 auth routes',
        'Login, register, reset, forgot-password, and auth-error pages avoid internal handoff DOM.'
      );
    case 'navigation-surface':
      return item(
        'Navigation surface',
        'Navbar',
        'Public navigation handoff evidence stays in source-level tests.'
      );
    case 'footer-surface':
      return item(
        'Footer surface',
        'Footer',
        'Footer links stay visible without rendering audit output.'
      );
    case 'public-view-models':
      return item(
        'Public view models',
        'Source-level',
        'Public page view models may expose handoff data to tests without mounting it.'
      );
    case 'source-level-contracts':
      return item(
        'Source-level contracts',
        'Allowed',
        'Public handoff contracts remain script-visible and DOM-hidden.'
      );
    case 'public-route-dom-guard':
      return item(
        'Public route DOM guard',
        'Blocked',
        'Public route sources must not contain data-handoff attributes.'
      );
    case 'public-handoff-markup-guard':
      return item(
        'Markup guard',
        'Blocked',
        'Public route sources must not render data-handoff-item audit rows.'
      );
    case 'public-handoff-panel-guard':
      return item(
        'Panel guard',
        'Blocked',
        'Public route sources must not mount internal HandoffPanel components.'
      );
    case 'classroom-control-route-gate':
      return item(
        'Control route gate',
        'Create/dashboard/play/print only',
        'Classroom control semantics stay route-gated away from public entry pages.'
      );
    case 'student-runner-allowed':
      return item(
        'Student runner allowed',
        Routes.Play,
        'Student runner routes may render hidden semantic outputs for accessibility and QA.'
      );
    case 'create-authoring-allowed':
      return item(
        'Create authoring allowed',
        Routes.Create,
        'Authoring surfaces may render hidden semantic outputs.'
      );
    case 'teacher-workspace-allowed':
      return item(
        'Teacher workspace allowed',
        Routes.Dashboard,
        'Authenticated teacher workspace pages may render hidden semantic outputs.'
      );
    case 'print-route-allowed':
      return item(
        'Print route allowed',
        '/print',
        'Printable worksheet routes may render hidden semantic outputs.'
      );
    case 'result-review-allowed':
      return item(
        'Result review allowed',
        Routes.DashboardAssignmentResults,
        'Teacher result-review surfaces may render hidden semantic outputs.'
      );
    case 'private-data-guard':
      return item(
        'Private data guard',
        'Private data hidden',
        'The boundary blocks answer keys, attempt records, raw tokens, and source-material storage keys.'
      );
    case 'legacy-copy-guard':
      return item(
        'Legacy copy guard',
        'ClassGamify only',
        'Public DOM stays aligned with the current ClassGamify product model.'
      );
    case 'search-index-boundary':
      return item(
        'Search index boundary',
        'Public entry only',
        'Indexed public pages avoid internal audit output while metadata helpers stay source-level.'
      );
    case 'privacy-guard':
      return item(
        'Privacy guard',
        'Audit DOM hidden',
        'Internal handoff summaries stay out of public DOM.'
      );
  }
}

function item(
  label: string,
  value: string,
  description: string
): Omit<PublicDomHandoffBoundaryItemView, 'ariaLabel' | 'id'> {
  return {
    description,
    label,
    value,
  };
}
