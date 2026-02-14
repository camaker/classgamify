import {
  IconCreditCard,
  IconLayoutDashboard,
  IconSettings2,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';

/**
 * Avatar dropdown links (English). Shown when user clicks avatar in header.
 */
export function getAvatarLinks(): MenuItemConfig[] {
  return [
    {
      title: 'Dashboard',
      href: Routes.Dashboard,
      icon: IconLayoutDashboard,
    },
    {
      title: 'Billing',
      href: Routes.SettingsBilling,
      icon: IconCreditCard,
    },
    {
      title: 'Settings',
      href: Routes.SettingsProfile,
      icon: IconSettings2,
    },
  ];
}
