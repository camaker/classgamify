import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { RETIRED_LEGACY_PUBLIC_PATHS } from '@/seo/public-routes';

export const LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS = [
  'retired-inventory-count',
  'retired-path-list',
  'mounted-route-count',
  'route-tree-boundary',
  'migration-entrypoint-boundary',
  'noindex-metadata-boundary',
  'sitemap-exclusion',
  'localized-sitemap-exclusion',
  'route-constant-exclusion',
  'navbar-exclusion',
  'footer-exclusion',
  'sidebar-exclusion',
  'robots-protected-boundary',
  'homepage-entrypoint-boundary',
  'template-entrypoint-boundary',
  'create-entrypoint-boundary',
  'worksheet-entrypoint-boundary',
  'student-preview-boundary',
  'about-path',
  'ai-path',
  'changelog-path',
  'hanzi-path',
  'hsk-path',
  'learn-path',
  'settings-credits-path',
  'waitlist-path',
  'route-module-cleanup',
  'migration-copy-boundary',
  'product-loop-redirect-boundary',
  'privacy-guard',
] as const;

export type LegacyPublicRouteHandoffItemId =
  (typeof LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS)[number];

export type LegacyPublicRouteHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: LegacyPublicRouteHandoffItemId;
  label: string;
  value: string;
};

export type LegacyPublicRouteHandoffEvidence = {
  footerRetiredHrefs: string[];
  homeEntrypointHrefs: string[];
  localizedSitemapRetiredPaths: string[];
  migrationCopyRetiredPaths: string[];
  migrationEntrypointRetiredPaths: string[];
  mountedRetiredPaths: string[];
  navbarRetiredHrefs: string[];
  noindexRetiredPaths: string[];
  protectedRobotsPaths: string[];
  routeConstantRetiredPaths: string[];
  routeModuleRetiredPaths: string[];
  routeTreeRetiredPaths: string[];
  sidebarRetiredHrefs: string[];
  sitemapRetiredPaths: string[];
};

export type LegacyPublicRouteHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: LegacyPublicRouteHandoffItemId[];
  keepsLegacyNavigationOut: true;
  keepsRetiredLegacyOutOfIndex: true;
  migrationEntrypointsOnlyWhenMounted: true;
  readsSourceMaterialFileBytes: false;
  requiresNoindexWhenMounted: true;
  routeActionsUseSharedConstants: true;
  scope: 'legacy-public-route-retirement-boundary';
};

export type LegacyPublicRouteHandoffView = {
  description: string;
  itemViews: LegacyPublicRouteHandoffItemView[];
  privacy: LegacyPublicRouteHandoffPrivacyContract;
  title: string;
};

type LegacyPublicRouteHandoffItemContext = LegacyPublicRouteHandoffEvidence & {
  id: LegacyPublicRouteHandoffItemId;
};

const LEGACY_PUBLIC_ROUTE_PATH_ITEMS = {
  'about-path': '/about',
  'ai-path': '/ai',
  'changelog-path': '/changelog',
  'hanzi-path': '/hanzi',
  'hsk-path': '/hsk',
  'learn-path': '/learn',
  'settings-credits-path': '/settings/credits',
  'waitlist-path': '/waitlist',
} as const satisfies Partial<
  Record<
    LegacyPublicRouteHandoffItemId,
    (typeof RETIRED_LEGACY_PUBLIC_PATHS)[number]
  >
>;

const PROTECTED_ROBOTS_BOUNDARY_PATHS = [
  Routes.Dashboard,
  Routes.Settings,
  '/play',
  '/print',
] as const;

export function buildLegacyPublicRouteHandoffView(
  evidence: LegacyPublicRouteHandoffEvidence
): LegacyPublicRouteHandoffView {
  const itemViews = LEGACY_PUBLIC_ROUTE_HANDOFF_ITEM_IDS.map((id) =>
    buildLegacyPublicRouteHandoffItemView({ ...evidence, id })
  );

  return {
    description: m.legacy_public_route_handoff_description(),
    itemViews,
    privacy: buildLegacyPublicRouteHandoffPrivacyContract(itemViews),
    title: m.legacy_public_route_handoff_title(),
  };
}

function buildLegacyPublicRouteHandoffItemView(
  context: LegacyPublicRouteHandoffItemContext
): LegacyPublicRouteHandoffItemView {
  const item = buildLegacyPublicRouteHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.legacy_public_route_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildLegacyPublicRouteHandoffItem(
  context: LegacyPublicRouteHandoffItemContext
): Omit<LegacyPublicRouteHandoffItemView, 'ariaLabel'> {
  const path = LEGACY_PUBLIC_ROUTE_PATH_ITEMS[context.id];

  if (path) {
    return buildLegacyPublicRouteHandoffStaticItem({
      description: m.legacy_public_route_handoff_retired_path_description({
        path,
      }),
      id: context.id,
      label: path,
      value: getLegacyPublicRoutePathState(path, context),
    });
  }

  switch (context.id) {
    case 'retired-inventory-count':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_retired_inventory_count_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_retired_inventory_count_label(),
        value: m.legacy_public_route_handoff_path_count_value({
          count: String(RETIRED_LEGACY_PUBLIC_PATHS.length),
        }),
      });
    case 'retired-path-list':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_retired_path_list_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_retired_path_list_label(),
        value: RETIRED_LEGACY_PUBLIC_PATHS.join(', '),
      });
    case 'mounted-route-count':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_mounted_route_count_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_mounted_route_count_label(),
        value: m.legacy_public_route_handoff_mounted_count_value({
          count: String(context.mountedRetiredPaths.length),
        }),
      });
    case 'route-tree-boundary':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_route_tree_boundary_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_route_tree_boundary_label(),
        ok: context.routeTreeRetiredPaths.length === 0,
        value: m.legacy_public_route_handoff_no_generated_routes_value(),
      });
    case 'migration-entrypoint-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_migration_entrypoint_boundary_description(),
        id: context.id,
        label:
          m.legacy_public_route_handoff_migration_entrypoint_boundary_label(),
        value:
          context.mountedRetiredPaths.length === 0
            ? m.legacy_public_route_handoff_not_required_value()
            : allPathsCovered(
                  context.mountedRetiredPaths,
                  context.migrationEntrypointRetiredPaths
                )
              ? m.legacy_public_route_handoff_migration_only_value()
              : m.legacy_public_route_handoff_needs_review_value(),
      });
    case 'noindex-metadata-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_noindex_metadata_boundary_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_noindex_metadata_boundary_label(),
        value:
          context.mountedRetiredPaths.length === 0 ||
          allPathsCovered(
            context.mountedRetiredPaths,
            context.noindexRetiredPaths
          )
            ? m.legacy_public_route_handoff_noindex_ready_value()
            : m.legacy_public_route_handoff_needs_review_value(),
      });
    case 'sitemap-exclusion':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_sitemap_exclusion_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_sitemap_exclusion_label(),
        ok: context.sitemapRetiredPaths.length === 0,
        value: m.legacy_public_route_handoff_excluded_value(),
      });
    case 'localized-sitemap-exclusion':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_localized_sitemap_exclusion_description(),
        id: context.id,
        label:
          m.legacy_public_route_handoff_localized_sitemap_exclusion_label(),
        ok: context.localizedSitemapRetiredPaths.length === 0,
        value: m.legacy_public_route_handoff_excluded_value(),
      });
    case 'route-constant-exclusion':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_route_constant_exclusion_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_route_constant_exclusion_label(),
        ok: context.routeConstantRetiredPaths.length === 0,
        value: m.legacy_public_route_handoff_excluded_value(),
      });
    case 'navbar-exclusion':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_navbar_exclusion_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_navbar_exclusion_label(),
        ok: context.navbarRetiredHrefs.length === 0,
        value: m.legacy_public_route_handoff_classgamify_navigation_value(),
      });
    case 'footer-exclusion':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_footer_exclusion_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_footer_exclusion_label(),
        ok: context.footerRetiredHrefs.length === 0,
        value: m.legacy_public_route_handoff_classgamify_footer_value(),
      });
    case 'sidebar-exclusion':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_sidebar_exclusion_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_sidebar_exclusion_label(),
        ok: context.sidebarRetiredHrefs.length === 0,
        value: m.legacy_public_route_handoff_classgamify_sidebar_value(),
      });
    case 'robots-protected-boundary':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_robots_protected_boundary_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_robots_protected_boundary_label(),
        ok: allPathsCovered(
          [...PROTECTED_ROBOTS_BOUNDARY_PATHS],
          context.protectedRobotsPaths
        ),
        value: m.legacy_public_route_handoff_protected_surfaces_blocked_value(),
      });
    case 'homepage-entrypoint-boundary':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_homepage_entrypoint_boundary_description(),
        id: context.id,
        label:
          m.legacy_public_route_handoff_homepage_entrypoint_boundary_label(),
        ok: noRetiredPaths(context.homeEntrypointHrefs),
        value: m.legacy_public_route_handoff_classgamify_entrypoints_value(),
      });
    case 'template-entrypoint-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_template_entrypoint_boundary_description(),
        id: context.id,
        label:
          m.legacy_public_route_handoff_template_entrypoint_boundary_label(),
        value: Routes.Templates,
      });
    case 'create-entrypoint-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_create_entrypoint_boundary_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_create_entrypoint_boundary_label(),
        value: Routes.Create,
      });
    case 'worksheet-entrypoint-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_worksheet_entrypoint_boundary_description(),
        id: context.id,
        label:
          m.legacy_public_route_handoff_worksheet_entrypoint_boundary_label(),
        value: Routes.Worksheets,
      });
    case 'student-preview-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_student_preview_boundary_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_student_preview_boundary_label(),
        value: Routes.StudentPreview,
      });
    case 'route-module-cleanup':
      return buildLegacyPublicRouteHandoffStatusItem({
        description:
          m.legacy_public_route_handoff_route_module_cleanup_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_route_module_cleanup_label(),
        ok: context.routeModuleRetiredPaths.length === 0,
        value: m.legacy_public_route_handoff_no_route_modules_value(),
      });
    case 'migration-copy-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_migration_copy_boundary_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_migration_copy_boundary_label(),
        value:
          context.mountedRetiredPaths.length === 0
            ? m.legacy_public_route_handoff_not_required_value()
            : allPathsCovered(
                  context.mountedRetiredPaths,
                  context.migrationCopyRetiredPaths
                )
              ? m.legacy_public_route_handoff_classgamify_migration_value()
              : m.legacy_public_route_handoff_needs_review_value(),
      });
    case 'product-loop-redirect-boundary':
      return buildLegacyPublicRouteHandoffStaticItem({
        description:
          m.legacy_public_route_handoff_product_loop_redirect_boundary_description(),
        id: context.id,
        label:
          m.legacy_public_route_handoff_product_loop_redirect_boundary_label(),
        value:
          context.mountedRetiredPaths.length === 0
            ? m.legacy_public_route_handoff_classgamify_routes_only_value()
            : allPathsCovered(
                  context.mountedRetiredPaths,
                  context.migrationEntrypointRetiredPaths
                )
              ? m.legacy_public_route_handoff_activity_assignment_loop_value()
              : m.legacy_public_route_handoff_needs_review_value(),
      });
    case 'privacy-guard':
      return buildLegacyPublicRouteHandoffStaticItem({
        description: m.legacy_public_route_handoff_privacy_guard_description(),
        id: context.id,
        label: m.legacy_public_route_handoff_privacy_guard_label(),
        value: m.legacy_public_route_handoff_private_data_hidden_value(),
      });
  }
}

function buildLegacyPublicRouteHandoffStatusItem({
  description,
  id,
  label,
  ok,
  value,
}: Omit<LegacyPublicRouteHandoffItemView, 'ariaLabel'> & {
  ok: boolean;
}) {
  return buildLegacyPublicRouteHandoffStaticItem({
    description,
    id,
    label,
    value: ok ? value : m.legacy_public_route_handoff_needs_review_value(),
  });
}

function buildLegacyPublicRouteHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<LegacyPublicRouteHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildLegacyPublicRouteHandoffPrivacyContract(
  itemViews: LegacyPublicRouteHandoffItemView[]
): LegacyPublicRouteHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsLegacyNavigationOut: true,
    keepsRetiredLegacyOutOfIndex: true,
    migrationEntrypointsOnlyWhenMounted: true,
    readsSourceMaterialFileBytes: false,
    requiresNoindexWhenMounted: true,
    routeActionsUseSharedConstants: true,
    scope: 'legacy-public-route-retirement-boundary',
  };
}

function getLegacyPublicRoutePathState(
  path: (typeof RETIRED_LEGACY_PUBLIC_PATHS)[number],
  evidence: LegacyPublicRouteHandoffEvidence
) {
  if (!evidence.mountedRetiredPaths.includes(path)) {
    return m.legacy_public_route_handoff_unmounted_value();
  }

  if (
    evidence.migrationEntrypointRetiredPaths.includes(path) &&
    evidence.noindexRetiredPaths.includes(path)
  ) {
    return m.legacy_public_route_handoff_migration_noindex_value();
  }

  return m.legacy_public_route_handoff_needs_review_value();
}

function allPathsCovered(paths: readonly string[], coveredPaths: string[]) {
  return paths.every((path) => coveredPaths.includes(path));
}

function noRetiredPaths(paths: string[]) {
  return paths.every(
    (path) =>
      !RETIRED_LEGACY_PUBLIC_PATHS.includes(
        path as (typeof RETIRED_LEGACY_PUBLIC_PATHS)[number]
      )
  );
}
