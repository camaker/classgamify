import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

type SettingsSecurityPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
  description: string;
  title: string;
};

export function buildSettingsSecurityPageViewModel(): SettingsSecurityPageViewModel {
  const title = m.settings_security_title();
  const description = m.settings_security_description();
  const credentialLoginEnabled =
    websiteConfig.auth?.enableCredentialLogin ?? false;
  const deleteAccountEnabled = websiteConfig.auth?.enableDeleteAccount ?? false;

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'security', label: title, isCurrentPage: true },
    ],
    credentialLoginEnabled,
    deleteAccountEnabled,
    description,
    title,
  };
}
