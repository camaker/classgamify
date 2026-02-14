import {
  IconBell,
  IconCoin,
  IconCreditCard,
  IconLayoutDashboard,
  IconLock,
  IconSettings,
  IconSettings2,
  IconUserCircle,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * Dashboard sidebar links (English only). Icons are Tabler icon components.
 */
export function getSidebarLinks(): MenuItemConfig[] {
  const creditsEnabled = websiteConfig.credits?.enableCredits ?? false;

  return [
    {
      title: 'Dashboard',
      icon: IconLayoutDashboard,
      href: Routes.Dashboard,
      external: false,
    },
    {
      title: 'Admin',
      icon: IconSettings,
      authorizeOnly: ['admin'],
      items: [
        {
          title: 'Users',
          icon: IconUsersGroup,
          href: Routes.AdminUsers,
          external: false,
        },
      ],
    },
    {
      title: 'Settings',
      icon: IconSettings2,
      items: [
        {
          title: 'Profile',
          icon: IconUserCircle,
          href: Routes.SettingsProfile,
          external: false,
        },
        {
          title: 'Billing',
          icon: IconCreditCard,
          href: Routes.SettingsBilling,
          external: false,
        },
        ...(creditsEnabled
          ? [
              {
                title: 'Credits',
                icon: IconCoin,
                href: Routes.SettingsCredits,
                external: false,
              } as MenuItemConfig,
            ]
          : []),
        {
          title: 'Security',
          icon: IconLock,
          href: Routes.SettingsSecurity,
          external: false,
        },
        {
          title: 'Notifications',
          icon: IconBell,
          href: Routes.SettingsNotifications,
          external: false,
        },
      ],
    },
  ];
}
