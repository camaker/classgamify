import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
/**
 * Footer links, grouped by section
 */
export function getFooterLinks(): MenuItemConfig[] {
  const productItems: MenuItemConfig[] = [
    {
      title: m.nav_learn(),
      href: Routes.Learn,
      external: false,
    },
    {
      title: 'Worksheets',
      href: Routes.Worksheets,
      external: false,
    },
    {
      title: m.nav_pricing(),
      href: Routes.Pricing,
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
      title: m.nav_terms_of_service_title(),
      href: Routes.TermsOfService,
      external: false,
    },
  ];
  return [
    { title: m.nav_product(), items: productItems },
    { title: m.nav_legal(), items: legalItems },
  ];
}
