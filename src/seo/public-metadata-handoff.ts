import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
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
  type PublicIndexableRouteId,
} from '@/seo/public-routes';
import { buildWebAppManifest } from '@/seo/web-manifest';
import { baseLocale, locales, localizeHref } from '@/lib/locale';

export const PUBLIC_METADATA_HANDOFF_ITEM_IDS = [
  'static-route-registry',
  'indexable-entrypoints',
  'route-helper-source',
  'localized-path-registry',
  'localized-alternate-links',
  'x-default-alternate',
  'sitemap-url-count',
  'sitemap-static-count',
  'sitemap-blog-count',
  'sitemap-blog-lastmod',
  'sitemap-xml-headers',
  'sitemap-base-url',
  'robots-rule-registry',
  'robots-disallow-paths',
  'robots-localized-variants',
  'robots-dashboard-boundary',
  'robots-settings-boundary',
  'robots-student-runner-boundary',
  'robots-print-boundary',
  'retired-legacy-inventory',
  'retired-legacy-indexing',
  'retired-legacy-route-constants',
  'manifest-builder-source',
  'manifest-name',
  'manifest-description',
  'manifest-start-url',
  'manifest-scope',
  'manifest-display',
  'manifest-maskable-icons',
  'privacy-guard',
] as const;

export type PublicMetadataHandoffItemId =
  (typeof PUBLIC_METADATA_HANDOFF_ITEM_IDS)[number];

export type PublicMetadataHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicMetadataHandoffItemId;
  label: string;
  value: string;
};

export type PublicMetadataHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  includesLocalizedAlternates: true;
  itemIds: PublicMetadataHandoffItemId[];
  keepsDashboardOutOfIndex: true;
  keepsPrintViewsOutOfIndex: true;
  keepsRetiredLegacyOutOfIndex: true;
  keepsStudentRunnerOutOfIndex: true;
  readsSourceMaterialFileBytes: false;
  routeActionsUseSharedConstants: true;
  scope: 'public-indexing-install-metadata';
};

export type PublicMetadataHandoffView = {
  description: string;
  itemViews: PublicMetadataHandoffItemView[];
  privacy: PublicMetadataHandoffPrivacyContract;
  title: string;
};

const PUBLIC_PRODUCT_ENTRY_ROUTE_IDS = [
  'home',
  'templates',
  'worksheets',
  'create',
  'pricing',
  'teachers',
  'contact',
  'blog',
  'roadmap',
] as const satisfies readonly PublicIndexableRouteId[];

export function buildPublicMetadataHandoffView({
  baseUrl = 'https://classgamify.example/',
}: {
  baseUrl?: string;
} = {}): PublicMetadataHandoffView {
  const context = buildPublicMetadataHandoffContext({ baseUrl });
  const itemViews = PUBLIC_METADATA_HANDOFF_ITEM_IDS.map((id) =>
    buildPublicMetadataHandoffItemView({ ...context, id })
  );

  return {
    description: m.public_metadata_handoff_description(),
    itemViews,
    privacy: buildPublicMetadataHandoffPrivacyContract(itemViews),
    title: m.public_metadata_handoff_title(),
  };
}

type PublicMetadataHandoffContext = {
  baseUrl: string;
  blogUrlCount: number;
  disallowPaths: string[];
  manifest: ReturnType<typeof buildWebAppManifest>;
  sitemapEntries: ReturnType<typeof buildSitemapUrlEntries>;
  sitemapUrls: ReturnType<typeof getSitemapUrls>;
};

type PublicMetadataHandoffItemContext = PublicMetadataHandoffContext & {
  id: PublicMetadataHandoffItemId;
};

function buildPublicMetadataHandoffContext({
  baseUrl,
}: {
  baseUrl: string;
}): PublicMetadataHandoffContext {
  const normalizedBaseUrl = normalizePublicMetadataBaseUrl(baseUrl);
  const sitemapUrls = getSitemapUrls();

  return {
    baseUrl: normalizedBaseUrl,
    blogUrlCount: sitemapUrls.filter((url) =>
      url.path.startsWith(`${PUBLIC_INDEXED_BLOG_BASE_PATH}/`)
    ).length,
    disallowPaths: getRobotsDisallowPaths(),
    manifest: buildWebAppManifest(),
    sitemapEntries: buildSitemapUrlEntries({ baseUrl: normalizedBaseUrl }),
    sitemapUrls,
  };
}

function buildPublicMetadataHandoffItemView(
  context: PublicMetadataHandoffItemContext
): PublicMetadataHandoffItemView {
  switch (context.id) {
    case 'static-route-registry':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_static_route_registry_description(),
        id: context.id,
        label: m.public_metadata_handoff_static_route_registry_label(),
        value: String(PUBLIC_INDEXABLE_STATIC_ROUTES.length),
      });
    case 'indexable-entrypoints':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_indexable_entrypoints_description(),
        id: context.id,
        label: m.public_metadata_handoff_indexable_entrypoints_label(),
        value: String(PUBLIC_PRODUCT_ENTRY_ROUTE_IDS.length),
      });
    case 'route-helper-source':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_route_helper_source_description(),
        id: context.id,
        label: m.public_metadata_handoff_route_helper_source_label(),
        value: m.public_metadata_handoff_route_helper_source_value(),
      });
    case 'localized-path-registry':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_localized_path_registry_description(),
        id: context.id,
        label: m.public_metadata_handoff_localized_path_registry_label(),
        value: String(PUBLIC_LOCALIZED_PATHS.length),
      });
    case 'localized-alternate-links':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_localized_alternate_links_description(),
        id: context.id,
        label: m.public_metadata_handoff_localized_alternate_links_label(),
        value: m.public_metadata_handoff_localized_alternate_links_value({
          count: String(locales.length),
        }),
      });
    case 'x-default-alternate':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_x_default_alternate_description(),
        id: context.id,
        label: m.public_metadata_handoff_x_default_alternate_label(),
        value: m.public_metadata_handoff_included_value(),
      });
    case 'sitemap-url-count':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_sitemap_url_count_description(),
        id: context.id,
        label: m.public_metadata_handoff_sitemap_url_count_label(),
        value: String(context.sitemapEntries.length),
      });
    case 'sitemap-static-count':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_sitemap_static_count_description(),
        id: context.id,
        label: m.public_metadata_handoff_sitemap_static_count_label(),
        value: String(PUBLIC_INDEXABLE_STATIC_ROUTES.length),
      });
    case 'sitemap-blog-count':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_sitemap_blog_count_description(),
        id: context.id,
        label: m.public_metadata_handoff_sitemap_blog_count_label(),
        value: String(context.blogUrlCount),
      });
    case 'sitemap-blog-lastmod':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_sitemap_blog_lastmod_description(),
        id: context.id,
        label: m.public_metadata_handoff_sitemap_blog_lastmod_label(),
        value: allBlogUrlsHaveLastmod(context.sitemapUrls)
          ? m.public_metadata_handoff_present_value()
          : m.public_metadata_handoff_missing_value(),
      });
    case 'sitemap-xml-headers':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_sitemap_xml_headers_description(),
        id: context.id,
        label: m.public_metadata_handoff_sitemap_xml_headers_label(),
        value: SITEMAP_XML_HEADERS['Content-Type'],
      });
    case 'sitemap-base-url':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_sitemap_base_url_description(),
        id: context.id,
        label: m.public_metadata_handoff_sitemap_base_url_label(),
        value: context.baseUrl,
      });
    case 'robots-rule-registry':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_robots_rule_registry_description(),
        id: context.id,
        label: m.public_metadata_handoff_robots_rule_registry_label(),
        value: String(PUBLIC_ROBOTS_DISALLOW_RULES.length),
      });
    case 'robots-disallow-paths':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_robots_disallow_paths_description(),
        id: context.id,
        label: m.public_metadata_handoff_robots_disallow_paths_label(),
        value: String(context.disallowPaths.length),
      });
    case 'robots-localized-variants':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_robots_localized_variants_description(),
        id: context.id,
        label: m.public_metadata_handoff_robots_localized_variants_label(),
        value: m.public_metadata_handoff_robots_localized_variants_value({
          count: String(locales.length),
        }),
      });
    case 'robots-dashboard-boundary':
      return buildPublicMetadataHandoffRobotsBoundaryItem({
        id: context.id,
        label: m.public_metadata_handoff_robots_dashboard_boundary_label(),
        path: Routes.Dashboard,
        paths: context.disallowPaths,
      });
    case 'robots-settings-boundary':
      return buildPublicMetadataHandoffRobotsBoundaryItem({
        id: context.id,
        label: m.public_metadata_handoff_robots_settings_boundary_label(),
        path: Routes.Settings,
        paths: context.disallowPaths,
      });
    case 'robots-student-runner-boundary':
      return buildPublicMetadataHandoffRobotsBoundaryItem({
        id: context.id,
        label: m.public_metadata_handoff_robots_student_runner_boundary_label(),
        path: '/play',
        paths: context.disallowPaths,
      });
    case 'robots-print-boundary':
      return buildPublicMetadataHandoffRobotsBoundaryItem({
        id: context.id,
        label: m.public_metadata_handoff_robots_print_boundary_label(),
        path: '/print',
        paths: context.disallowPaths,
      });
    case 'retired-legacy-inventory':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_retired_legacy_inventory_description(),
        id: context.id,
        label: m.public_metadata_handoff_retired_legacy_inventory_label(),
        value: String(RETIRED_LEGACY_PUBLIC_PATHS.length),
      });
    case 'retired-legacy-indexing':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_retired_legacy_indexing_description(),
        id: context.id,
        label: m.public_metadata_handoff_retired_legacy_indexing_label(),
        value: retiredLegacyPathsAreExcluded(context.sitemapUrls)
          ? m.public_metadata_handoff_excluded_value()
          : m.public_metadata_handoff_needs_review_value(),
      });
    case 'retired-legacy-route-constants':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_retired_legacy_route_constants_description(),
        id: context.id,
        label: m.public_metadata_handoff_retired_legacy_route_constants_label(),
        value: m.public_metadata_handoff_excluded_value(),
      });
    case 'manifest-builder-source':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_manifest_builder_source_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_builder_source_label(),
        value: m.public_metadata_handoff_configured_value(),
      });
    case 'manifest-name':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_manifest_name_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_name_label(),
        value: context.manifest.name
          ? m.public_metadata_handoff_configured_value()
          : m.public_metadata_handoff_missing_value(),
      });
    case 'manifest-description':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_manifest_description_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_description_label(),
        value: context.manifest.description
          ? m.public_metadata_handoff_configured_value()
          : m.public_metadata_handoff_missing_value(),
      });
    case 'manifest-start-url':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_manifest_start_url_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_start_url_label(),
        value: context.manifest.start_url,
      });
    case 'manifest-scope':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_manifest_scope_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_scope_label(),
        value: context.manifest.scope,
      });
    case 'manifest-display':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_manifest_display_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_display_label(),
        value: context.manifest.display,
      });
    case 'manifest-maskable-icons':
      return buildPublicMetadataHandoffItem({
        description:
          m.public_metadata_handoff_manifest_maskable_icons_description(),
        id: context.id,
        label: m.public_metadata_handoff_manifest_maskable_icons_label(),
        value: String(
          context.manifest.icons.filter((icon) => icon.purpose === 'maskable')
            .length
        ),
      });
    case 'privacy-guard':
      return buildPublicMetadataHandoffItem({
        description: m.public_metadata_handoff_privacy_guard_description(),
        id: context.id,
        label: m.public_metadata_handoff_privacy_guard_label(),
        value: m.public_metadata_handoff_privacy_guard_value(),
      });
  }
}

function buildPublicMetadataHandoffRobotsBoundaryItem({
  id,
  label,
  path,
  paths,
}: {
  id: PublicMetadataHandoffItemId;
  label: string;
  path: string;
  paths: string[];
}) {
  return buildPublicMetadataHandoffItem({
    description: m.public_metadata_handoff_robots_boundary_description({
      path,
    }),
    id,
    label,
    value: robotsPathIsBlocked(paths, path)
      ? m.public_metadata_handoff_blocked_value()
      : m.public_metadata_handoff_needs_review_value(),
  });
}

function buildPublicMetadataHandoffItem({
  description,
  id,
  label,
  value,
}: Omit<PublicMetadataHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.public_metadata_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildPublicMetadataHandoffPrivacyContract(
  itemViews: PublicMetadataHandoffItemView[]
): PublicMetadataHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    includesLocalizedAlternates: true,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsDashboardOutOfIndex: true,
    keepsPrintViewsOutOfIndex: true,
    keepsRetiredLegacyOutOfIndex: true,
    keepsStudentRunnerOutOfIndex: true,
    readsSourceMaterialFileBytes: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-indexing-install-metadata',
  };
}

function allBlogUrlsHaveLastmod(urls: ReturnType<typeof getSitemapUrls>) {
  return urls
    .filter((url) => url.path.startsWith(`${PUBLIC_INDEXED_BLOG_BASE_PATH}/`))
    .every((url) => Boolean(url.lastmod));
}

function retiredLegacyPathsAreExcluded(
  urls: ReturnType<typeof getSitemapUrls>
) {
  return RETIRED_LEGACY_PUBLIC_PATHS.every(
    (legacyPath) => !urls.some((url) => url.path === legacyPath)
  );
}

function robotsPathIsBlocked(paths: string[], path: string) {
  return (
    paths.includes(path) && paths.includes(localizePublicMetadataPath(path))
  );
}

function localizePublicMetadataPath(path: string) {
  const alternateLocale = locales.find((locale) => locale !== baseLocale);
  return alternateLocale
    ? localizeHref(path, { locale: alternateLocale })
    : path;
}

function normalizePublicMetadataBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}
