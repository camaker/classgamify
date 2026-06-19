import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
/**
 * Footer links, grouped by section
 */
export function getFooterLinks(): MenuItemConfig[] {
  const productItems: MenuItemConfig[] = [
    {
      title: m.nav_templates(),
      href: Routes.Templates,
      description: m.footer_link_templates_desc(),
      external: false,
    },
    {
      title: m.nav_create(),
      href: Routes.Create,
      description: m.footer_link_create_desc(),
      external: false,
    },
    {
      title: m.nav_play_demo(),
      href: Routes.PlayDemo,
      description: m.footer_link_play_desc(),
      external: false,
    },
    {
      title: m.nav_pricing(),
      href: Routes.Pricing,
      description: m.footer_link_pricing_desc(),
      external: false,
    },
  ];
  const platformItems: MenuItemConfig[] = [
    {
      title: m.dashboard_sidebar_activities(),
      href: Routes.DashboardActivities,
      description: m.footer_link_activities_desc(),
      external: false,
    },
    {
      title: m.dashboard_sidebar_assignments(),
      href: Routes.DashboardAssignments,
      description: m.footer_link_assignments_desc(),
      external: false,
    },
  ];
  const supportItems: MenuItemConfig[] = [
    {
      title: m.nav_roadmap_title(),
      href: Routes.Roadmap,
      description: m.nav_roadmap_description(),
      external: false,
    },
    {
      title: m.footer_link_support(),
      href: Routes.Contact,
      description: m.footer_link_support_desc(),
      external: false,
    },
    {
      title: m.footer_link_teachers(),
      href: Routes.Teachers,
      description: m.footer_link_teachers_desc(),
      external: false,
    },
  ];

  const legalItems: MenuItemConfig[] = [
    {
      title: m.nav_privacy_policy_title(),
      href: Routes.PrivacyPolicy,
      external: false,
    },
    {
      title: m.nav_cookie_policy_title(),
      href: Routes.CookiePolicy,
      external: false,
    },
    {
      title: m.nav_terms_of_service_title(),
      href: Routes.TermsOfService,
      external: false,
    },
  ];
  return [
    { title: m.footer_section_product(), items: productItems },
    { title: m.footer_section_platform(), items: platformItems },
    { title: m.footer_section_support(), items: supportItems },
    { title: m.nav_legal(), items: legalItems },
  ];
}
