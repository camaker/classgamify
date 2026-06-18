import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
/**
 * Footer links, grouped by section
 */
export function getFooterLinks(): MenuItemConfig[] {
  const learnItems: MenuItemConfig[] = [
    {
      title: m.footer_link_start_practice(),
      href: Routes.Learn,
      description: m.footer_link_start_practice_desc(),
      external: false,
    },
    {
      title: 'HSK1',
      href: Routes.Hsk1,
      description: m.footer_link_hsk_desc(),
      external: false,
    },
    {
      title: m.footer_link_articles(),
      href: Routes.Blog,
      description: m.footer_link_articles_desc(),
      external: false,
    },
    {
      title: m.nav_pricing(),
      href: Routes.Pricing,
      description: m.footer_link_pricing_desc(),
      external: false,
    },
  ];
  const toolItems: MenuItemConfig[] = [
    {
      title: m.footer_link_worksheets(),
      href: Routes.Worksheets,
      description: m.footer_link_worksheets_desc(),
      external: false,
    },
    {
      title: m.footer_link_review_queue(),
      href: Routes.Learn,
      description: m.footer_link_review_queue_desc(),
      external: false,
    },
  ];
  const supportItems: MenuItemConfig[] = [
    {
      title: m.footer_link_support(),
      href: Routes.Contact,
      description: m.footer_link_support_desc(),
      external: false,
    },
    {
      title: m.footer_link_teachers(),
      href: Routes.Contact,
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
    { title: m.footer_section_learn(), items: learnItems },
    { title: m.footer_section_tools(), items: toolItems },
    { title: m.footer_section_support(), items: supportItems },
    { title: m.nav_legal(), items: legalItems },
  ];
}
