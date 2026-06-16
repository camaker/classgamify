import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { IconPencil } from '@tabler/icons-react';
import type { MenuItemConfig } from '../types';
/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  return [
    { title: m.nav_learn(), href: Routes.Learn, icon: IconPencil },
    { title: m.nav_features(), href: Routes.Features, external: false },
  ];
}
