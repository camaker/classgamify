import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * Footer links (English only). Grouped by section.
 */
export function getFooterLinks(): MenuItemConfig[] {
  const productItems: MenuItemConfig[] = [
    { title: 'Features', href: Routes.Features, external: false },
    { title: 'Pricing', href: Routes.Pricing, external: false },
    { title: 'FAQ', href: Routes.FAQ, external: false },
  ];

  const resourcesItems: MenuItemConfig[] = [];
  if (websiteConfig.blog?.enable) {
    resourcesItems.push({ title: 'Blog', href: Routes.Blog, external: false });
  }
  if (websiteConfig.docs?.enable) {
    resourcesItems.push({ title: 'Docs', href: Routes.Docs, external: false });
  }
  // Changelog and Roadmap removed from footer

  const companyItems: MenuItemConfig[] = [
    { title: 'About', href: Routes.About, external: false },
    { title: 'Contact', href: Routes.Contact, external: false },
    { title: 'Waitlist', href: Routes.Waitlist, external: false },
  ];

  const legalItems: MenuItemConfig[] = [
    { title: 'Cookie Policy', href: Routes.CookiePolicy, external: false },
    { title: 'Privacy Policy', href: Routes.PrivacyPolicy, external: false },
    { title: 'Terms of Service', href: Routes.TermsOfService, external: false },
  ];

  return [
    { title: 'Product', items: productItems },
    { title: 'Resources', items: resourcesItems },
    { title: 'Company', items: companyItems },
    { title: 'Legal', items: legalItems },
  ];
}
