import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

type SettingsFilesPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  title: string;
};

export function isSettingsFilesEnabled() {
  return websiteConfig.storage?.enable === true;
}

export function buildSettingsFilesPageViewModel(): SettingsFilesPageViewModel {
  const title = m.settings_files_title();
  const description = m.settings_files_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'files', label: title, isCurrentPage: true },
    ],
    description,
    title,
  };
}
