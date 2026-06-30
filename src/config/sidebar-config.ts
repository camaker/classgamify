import { m } from '@/locale/paraglide/messages';
import {
  IconDeviceGamepad2,
  IconBell,
  IconCreditCard,
  IconFiles,
  IconLayoutDashboard,
  IconListCheck,
  IconLock,
  IconSettings2,
  IconShieldCheck,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';
/**
 * Sidebar links
 */
export function getSidebarLinks(): MenuItemConfig[] {
  return [
    {
      id: 'dashboard',
      title: m.dashboard_sidebar_dashboard(),
      icon: IconLayoutDashboard,
      href: Routes.Dashboard,
      external: false,
    },
    {
      id: 'activities',
      title: m.dashboard_sidebar_activities(),
      icon: IconDeviceGamepad2,
      href: Routes.DashboardActivities,
      external: false,
    },
    {
      id: 'assignments',
      title: m.dashboard_sidebar_assignments(),
      icon: IconListCheck,
      href: Routes.DashboardAssignments,
      external: false,
    },
    {
      id: 'admin',
      title: m.admin_title(),
      icon: IconShieldCheck,
      authorizeOnly: ['admin'],
      items: [
        {
          id: 'users',
          title: m.admin_users_title(),
          icon: IconUsers,
          href: Routes.AdminUsers,
          external: false,
        },
      ],
    },
    {
      id: 'settings',
      title: m.dashboard_sidebar_settings(),
      icon: IconSettings2,
      items: [
        {
          id: 'profile',
          title: m.dashboard_sidebar_profile(),
          icon: IconUserCircle,
          href: Routes.SettingsProfile,
          external: false,
        },
        ...(websiteConfig.storage?.enable
          ? [
              {
                id: 'files',
                title: m.dashboard_sidebar_files(),
                icon: IconFiles,
                href: Routes.SettingsFiles,
                external: false,
              },
            ]
          : []),
        ...(websiteConfig.payment?.enable
          ? [
              {
                id: 'billing',
                title: m.dashboard_sidebar_billing(),
                icon: IconCreditCard,
                href: Routes.SettingsBilling,
                external: false,
              },
            ]
          : []),
        {
          id: 'security',
          title: m.dashboard_sidebar_security(),
          icon: IconLock,
          href: Routes.SettingsSecurity,
          external: false,
        },
        ...(websiteConfig.newsletter?.enable
          ? [
              {
                id: 'notifications',
                title: m.dashboard_sidebar_notifications(),
                icon: IconBell,
                href: Routes.SettingsNotifications,
                external: false,
              },
            ]
          : []),
      ],
    },
  ];
}
