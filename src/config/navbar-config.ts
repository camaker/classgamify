import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import {
  IconBook2,
  IconFileText,
  IconPencil,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';
import type { MenuItemConfig } from '../types';
/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  return [
    { title: m.nav_learn(), href: Routes.Learn, icon: IconPencil },
    { title: 'HSK1', href: Routes.Hsk1, icon: IconBook2 },
    { title: m.nav_worksheets(), href: Routes.Worksheets, icon: IconFileText },
    { title: m.footer_link_teachers(), href: Routes.Teachers, icon: IconUsers },
    { title: m.nav_pricing(), href: Routes.Pricing, icon: IconSparkles },
  ];
}
