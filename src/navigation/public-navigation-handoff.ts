import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { getFooterLinks } from '@/config/footer-config';
import { getNavbarLinks } from '@/config/navbar-config';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import type { MenuItemConfig } from '@/types';

export const PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS = [
  'product-loop',
  'navbar-surface',
  'navbar-count',
  'navbar-templates-route',
  'navbar-worksheets-route',
  'navbar-create-route',
  'navbar-student-preview-route',
  'navbar-pricing-route',
  'navbar-blog-route',
  'mobile-navbar-source',
  'footer-surface',
  'footer-section-count',
  'footer-product-section',
  'footer-product-templates-route',
  'footer-product-worksheets-route',
  'footer-product-create-route',
  'footer-product-preview-route',
  'footer-product-pricing-route',
  'footer-platform-activities-route',
  'footer-platform-assignments-route',
  'footer-support-roadmap-route',
  'footer-support-articles-route',
  'footer-support-contact-route',
  'footer-support-teachers-route',
  'footer-legal-routes',
  'footer-cta-actions',
  'footer-loop-metrics',
  'route-constant-boundary',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type PublicNavigationHandoffItemId =
  (typeof PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS)[number];

export type PublicNavigationHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicNavigationHandoffItemId;
  label: string;
  value: string;
};

export type PublicNavigationHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  footerUsesSharedConfig: true;
  itemIds: PublicNavigationHandoffItemId[];
  keepsLegacyCopyOut: true;
  mobileNavUsesSharedConfig: true;
  mutatesTeacherWorkspace: false;
  navbarUsesSharedConfig: true;
  routeActionsUseSharedConstants: true;
  scope: 'public-navigation-entrypoints';
};

export type PublicNavigationHandoffView = {
  description: string;
  itemViews: PublicNavigationHandoffItemView[];
  privacy: PublicNavigationHandoffPrivacyContract;
  title: string;
};

type PublicNavigationHandoffInput = {
  footerLinks?: MenuItemConfig[];
  navbarLinks?: MenuItemConfig[];
};

type PublicNavigationHandoffBuildContext =
  Required<PublicNavigationHandoffInput> & {
    id: PublicNavigationHandoffItemId;
  };

export function buildPublicNavigationHandoffView({
  footerLinks = getFooterLinks(),
  navbarLinks = getNavbarLinks(),
}: PublicNavigationHandoffInput = {}): PublicNavigationHandoffView {
  const itemViews = PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS.map((id) =>
    buildPublicNavigationHandoffItemView({ footerLinks, id, navbarLinks })
  );

  return {
    description: m.public_navigation_handoff_description(),
    itemViews,
    privacy: buildPublicNavigationHandoffPrivacyContract(itemViews),
    title: m.public_navigation_handoff_title(),
  };
}

function buildPublicNavigationHandoffItemView(
  context: PublicNavigationHandoffBuildContext
): PublicNavigationHandoffItemView {
  const label = getPublicNavigationHandoffItemLabel(context);
  const description = getPublicNavigationHandoffItemDescription(context);
  const value = getPublicNavigationHandoffItemValue(context);

  return {
    ariaLabel: m.home_handoff_item_aria({ description, label, value }),
    description,
    id: context.id,
    label,
    value,
  };
}

function getPublicNavigationHandoffItemLabel(
  context: PublicNavigationHandoffBuildContext
) {
  switch (context.id) {
    case 'product-loop':
      return m.home_handoff_product_loop_label();
    case 'navbar-surface':
      return m.common_main_navigation();
    case 'navbar-count':
      return m.public_navigation_handoff_navbar_count_label();
    case 'navbar-templates-route':
      return getMenuItem(context.navbarLinks, 'templates').title;
    case 'navbar-worksheets-route':
      return getMenuItem(context.navbarLinks, 'worksheets').title;
    case 'navbar-create-route':
      return getMenuItem(context.navbarLinks, 'create').title;
    case 'navbar-student-preview-route':
      return getMenuItem(context.navbarLinks, 'student-preview').title;
    case 'navbar-pricing-route':
      return getMenuItem(context.navbarLinks, 'pricing').title;
    case 'navbar-blog-route':
      return getMenuItem(context.navbarLinks, 'blog').title;
    case 'mobile-navbar-source':
      return m.common_mobile_navigation();
    case 'footer-surface':
      return m.footer_directory_label();
    case 'footer-section-count':
      return m.public_navigation_handoff_footer_section_count_label();
    case 'footer-product-section':
      return getFooterSection(context.footerLinks, 'product').title;
    case 'footer-product-templates-route':
      return getFooterItem(context.footerLinks, 'product', 'templates').title;
    case 'footer-product-worksheets-route':
      return getFooterItem(context.footerLinks, 'product', 'worksheets').title;
    case 'footer-product-create-route':
      return getFooterItem(context.footerLinks, 'product', 'create').title;
    case 'footer-product-preview-route':
      return getFooterItem(context.footerLinks, 'product', 'student-preview')
        .title;
    case 'footer-product-pricing-route':
      return getFooterItem(context.footerLinks, 'product', 'pricing').title;
    case 'footer-platform-activities-route':
      return getFooterItem(context.footerLinks, 'platform', 'activities').title;
    case 'footer-platform-assignments-route':
      return getFooterItem(context.footerLinks, 'platform', 'assignments')
        .title;
    case 'footer-support-roadmap-route':
      return getFooterItem(context.footerLinks, 'support', 'roadmap').title;
    case 'footer-support-articles-route':
      return getFooterItem(context.footerLinks, 'support', 'articles').title;
    case 'footer-support-contact-route':
      return getFooterItem(context.footerLinks, 'support', 'support').title;
    case 'footer-support-teachers-route':
      return getFooterItem(context.footerLinks, 'support', 'teachers').title;
    case 'footer-legal-routes':
      return getFooterSection(context.footerLinks, 'legal').title;
    case 'footer-cta-actions':
      return m.public_navigation_handoff_footer_cta_label();
    case 'footer-loop-metrics':
      return m.public_navigation_handoff_footer_metrics_label();
    case 'route-constant-boundary':
      return m.public_navigation_handoff_route_constant_label();
    case 'legacy-copy-guard':
      return m.public_navigation_handoff_legacy_copy_guard_label();
    case 'privacy-guard':
      return m.public_navigation_handoff_privacy_guard_label();
  }
}

function getPublicNavigationHandoffItemDescription(
  context: PublicNavigationHandoffBuildContext
) {
  switch (context.id) {
    case 'product-loop':
      return m.home_handoff_product_loop_description();
    case 'navbar-surface':
      return m.public_navigation_handoff_navbar_surface_description();
    case 'navbar-count':
      return m.public_navigation_handoff_navbar_count_description();
    case 'navbar-templates-route':
    case 'navbar-worksheets-route':
    case 'navbar-create-route':
    case 'navbar-student-preview-route':
    case 'navbar-pricing-route':
    case 'navbar-blog-route':
      return m.public_navigation_handoff_navbar_route_description({
        route: getPublicNavigationHandoffItemValue(context),
      });
    case 'mobile-navbar-source':
      return m.public_navigation_handoff_mobile_source_description();
    case 'footer-surface':
      return m.public_navigation_handoff_footer_surface_description();
    case 'footer-section-count':
      return m.public_navigation_handoff_footer_section_count_description();
    case 'footer-product-section':
      return m.public_navigation_handoff_footer_product_section_description();
    case 'footer-product-templates-route':
      return getFooterItem(context.footerLinks, 'product', 'templates')
        .description!;
    case 'footer-product-worksheets-route':
      return getFooterItem(context.footerLinks, 'product', 'worksheets')
        .description!;
    case 'footer-product-create-route':
      return getFooterItem(context.footerLinks, 'product', 'create')
        .description!;
    case 'footer-product-preview-route':
      return getFooterItem(context.footerLinks, 'product', 'student-preview')
        .description!;
    case 'footer-product-pricing-route':
      return getFooterItem(context.footerLinks, 'product', 'pricing')
        .description!;
    case 'footer-platform-activities-route':
      return getFooterItem(context.footerLinks, 'platform', 'activities')
        .description!;
    case 'footer-platform-assignments-route':
      return getFooterItem(context.footerLinks, 'platform', 'assignments')
        .description!;
    case 'footer-support-roadmap-route':
      return getFooterItem(context.footerLinks, 'support', 'roadmap')
        .description!;
    case 'footer-support-articles-route':
      return getFooterItem(context.footerLinks, 'support', 'articles')
        .description!;
    case 'footer-support-contact-route':
      return getFooterItem(context.footerLinks, 'support', 'support')
        .description!;
    case 'footer-support-teachers-route':
      return getFooterItem(context.footerLinks, 'support', 'teachers')
        .description!;
    case 'footer-legal-routes':
      return m.public_navigation_handoff_footer_legal_description();
    case 'footer-cta-actions':
      return m.footer_cta_description();
    case 'footer-loop-metrics':
      return m.footer_tagline();
    case 'route-constant-boundary':
      return m.public_navigation_handoff_route_constant_description();
    case 'legacy-copy-guard':
      return m.public_navigation_handoff_legacy_copy_guard_description();
    case 'privacy-guard':
      return m.public_navigation_handoff_privacy_guard_description();
  }
}

function getPublicNavigationHandoffItemValue(
  context: PublicNavigationHandoffBuildContext
) {
  switch (context.id) {
    case 'product-loop':
      return 'Activity -> Assignment -> Attempt -> Results';
    case 'navbar-surface':
      return m.public_navigation_handoff_navbar_surface_value();
    case 'navbar-count':
      return formatPublicNavigationCount(context.navbarLinks.length);
    case 'navbar-templates-route':
      return getMenuItemHref(context.navbarLinks, 'templates');
    case 'navbar-worksheets-route':
      return getMenuItemHref(context.navbarLinks, 'worksheets');
    case 'navbar-create-route':
      return getMenuItemHref(context.navbarLinks, 'create');
    case 'navbar-student-preview-route':
      return getMenuItemHref(context.navbarLinks, 'student-preview');
    case 'navbar-pricing-route':
      return getMenuItemHref(context.navbarLinks, 'pricing');
    case 'navbar-blog-route':
      return getMenuItemHref(context.navbarLinks, 'blog');
    case 'mobile-navbar-source':
      return m.public_navigation_handoff_shared_config_value();
    case 'footer-surface':
      return m.public_navigation_handoff_footer_surface_value();
    case 'footer-section-count':
      return formatPublicNavigationCount(context.footerLinks.length);
    case 'footer-product-section':
      return formatPublicNavigationCount(
        getFooterSectionItems(context.footerLinks, 'product').length
      );
    case 'footer-product-templates-route':
      return getFooterItemHref(context.footerLinks, 'product', 'templates');
    case 'footer-product-worksheets-route':
      return getFooterItemHref(context.footerLinks, 'product', 'worksheets');
    case 'footer-product-create-route':
      return getFooterItemHref(context.footerLinks, 'product', 'create');
    case 'footer-product-preview-route':
      return getFooterItemHref(
        context.footerLinks,
        'product',
        'student-preview'
      );
    case 'footer-product-pricing-route':
      return getFooterItemHref(context.footerLinks, 'product', 'pricing');
    case 'footer-platform-activities-route':
      return getFooterItemHref(context.footerLinks, 'platform', 'activities');
    case 'footer-platform-assignments-route':
      return getFooterItemHref(context.footerLinks, 'platform', 'assignments');
    case 'footer-support-roadmap-route':
      return getFooterItemHref(context.footerLinks, 'support', 'roadmap');
    case 'footer-support-articles-route':
      return getFooterItemHref(context.footerLinks, 'support', 'articles');
    case 'footer-support-contact-route':
      return getFooterItemHref(context.footerLinks, 'support', 'support');
    case 'footer-support-teachers-route':
      return getFooterItemHref(context.footerLinks, 'support', 'teachers');
    case 'footer-legal-routes':
      return formatPublicNavigationCount(
        getFooterSectionItems(context.footerLinks, 'legal').length
      );
    case 'footer-cta-actions':
      return `${Routes.Create} + ${Routes.Templates}`;
    case 'footer-loop-metrics':
      return m.public_navigation_handoff_footer_metrics_value({
        assignmentValue: m.footer_metric_assignment_value(),
        resultValue: m.footer_metric_result_value(),
        templateCount: String(ACTIVITY_TEMPLATE_TYPES.length),
      });
    case 'route-constant-boundary':
      return m.public_navigation_handoff_route_constant_value();
    case 'legacy-copy-guard':
      return m.public_navigation_handoff_legacy_copy_guard_value();
    case 'privacy-guard':
      return m.public_navigation_handoff_privacy_guard_value();
  }
}

function buildPublicNavigationHandoffPrivacyContract(
  itemViews: PublicNavigationHandoffItemView[]
): PublicNavigationHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    footerUsesSharedConfig: true,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsLegacyCopyOut: true,
    mobileNavUsesSharedConfig: true,
    mutatesTeacherWorkspace: false,
    navbarUsesSharedConfig: true,
    routeActionsUseSharedConstants: true,
    scope: 'public-navigation-entrypoints',
  };
}

function getMenuItem(items: MenuItemConfig[], id: string) {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    throw new Error(`Missing public navigation item: ${id}`);
  }

  return item;
}

function getMenuItemHref(items: MenuItemConfig[], id: string) {
  const href = getMenuItem(items, id).href;

  if (!href) {
    throw new Error(`Missing public navigation href: ${id}`);
  }

  return href;
}

function getFooterSection(sections: MenuItemConfig[], sectionId: string) {
  return getMenuItem(sections, sectionId);
}

function getFooterSectionItems(sections: MenuItemConfig[], sectionId: string) {
  return getFooterSection(sections, sectionId).items ?? [];
}

function getFooterItem(
  sections: MenuItemConfig[],
  sectionId: string,
  itemId: string
) {
  return getMenuItem(getFooterSectionItems(sections, sectionId), itemId);
}

function getFooterItemHref(
  sections: MenuItemConfig[],
  sectionId: string,
  itemId: string
) {
  const href = getFooterItem(sections, sectionId, itemId).href;

  if (!href) {
    throw new Error(`Missing public footer href: ${sectionId}/${itemId}`);
  }

  return href;
}

function formatPublicNavigationCount(count: number) {
  return m.home_handoff_count_value({
    count: Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0)),
  });
}
