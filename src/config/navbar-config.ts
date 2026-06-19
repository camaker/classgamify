import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import {
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import type { MenuItemConfig } from '../types';
/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  return [
    {
      title: m.nav_templates(),
      href: Routes.Templates,
      icon: IconLayoutGrid,
    },
    { title: m.nav_create(), href: Routes.Create, icon: IconPlus },
    {
      title: m.nav_play_demo(),
      href: Routes.PlayDemo,
      icon: IconDeviceGamepad2,
    },
    { title: m.nav_pricing(), href: Routes.Pricing, icon: IconSparkles },
  ];
}
