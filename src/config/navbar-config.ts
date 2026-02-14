import {
  IconBuilding,
  IconCookie,
  IconFileText,
  IconMail,
  IconMailbox,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * Navbar links (English only, no i18n). Icons are Tabler icon components.
 */
export function getNavbarLinks(): MenuItemConfig[] {
  const links: MenuItemConfig[] = [
    { title: 'Features', href: Routes.Features, external: false },
    { title: 'Pricing', href: Routes.Pricing, external: false },
  ];
  if (websiteConfig.blog?.enable) {
    links.push({ title: 'Blog', href: Routes.Blog, external: false });
  }
  if (websiteConfig.docs?.enable) {
    links.push({ title: 'Docs', href: Routes.Docs, external: false });
  }
  links.push({
    title: 'Pages',
    items: [
      {
        title: 'About',
        description: 'Learn more about us',
        href: Routes.About,
        icon: IconBuilding,
        external: false,
      },
      {
        title: 'Contact',
        description: 'Get in touch',
        href: Routes.Contact,
        icon: IconMail,
        external: false,
      },
      {
        title: 'Waitlist',
        description: 'Join the waitlist',
        href: Routes.Waitlist,
        icon: IconMailbox,
        external: false,
      },
      {
        title: 'Cookie Policy',
        description: 'Cookie policy',
        href: Routes.CookiePolicy,
        icon: IconCookie,
        external: false,
      },
      {
        title: 'Privacy Policy',
        description: 'Privacy policy',
        href: Routes.PrivacyPolicy,
        icon: IconShieldCheck,
        external: false,
      },
      {
        title: 'Terms of Service',
        description: 'Terms of service',
        href: Routes.TermsOfService,
        icon: IconFileText,
        external: false,
      },
    ],
  });
  return links;
}
