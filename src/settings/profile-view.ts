import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { m } from '@/locale/paraglide/messages';

type SettingsProfilePageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  title: string;
};

export function buildSettingsProfilePageViewModel(): SettingsProfilePageViewModel {
  const title = m.settings_profile_title();
  const description = m.settings_profile_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'profile', label: title, isCurrentPage: true },
    ],
    description,
    title,
  };
}
