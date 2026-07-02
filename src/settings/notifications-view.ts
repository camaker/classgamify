import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

export type SettingsNotificationWorkspaceSummaryItemId =
  | 'assignment-review'
  | 'teacher-control'
  | 'template-updates'
  | 'worksheet-workflows';

export type SettingsNotificationWorkspaceSummaryItemView = {
  description: string;
  id: SettingsNotificationWorkspaceSummaryItemId;
  label: string;
};

export type SettingsNotificationWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  itemViews: SettingsNotificationWorkspaceSummaryItemView[];
  title: string;
};

export type SettingsNotificationPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  title: string;
  workspaceSummaryView: SettingsNotificationWorkspaceSummaryView;
};

export function isSettingsNotificationsEnabled() {
  return websiteConfig.newsletter?.enable === true;
}

export function buildSettingsNotificationPageViewModel(): SettingsNotificationPageViewModel {
  const title = m.settings_notification_title();
  const description = m.settings_notification_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      {
        id: 'notifications',
        label: title,
        isCurrentPage: true,
      },
    ],
    description,
    title,
    workspaceSummaryView: buildSettingsNotificationWorkspaceSummaryView(),
  };
}

export function buildSettingsNotificationWorkspaceSummaryView(): SettingsNotificationWorkspaceSummaryView {
  const title = m.settings_notification_workspace_summary_title();
  const description = m.settings_notification_workspace_summary_description();

  return {
    ariaLabel: m.settings_notification_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    itemViews: [
      {
        description:
          m.settings_notification_workspace_summary_templates_description(),
        id: 'template-updates',
        label: m.settings_notification_workspace_summary_templates_label(),
      },
      {
        description:
          m.settings_notification_workspace_summary_worksheets_description(),
        id: 'worksheet-workflows',
        label: m.settings_notification_workspace_summary_worksheets_label(),
      },
      {
        description:
          m.settings_notification_workspace_summary_review_description(),
        id: 'assignment-review',
        label: m.settings_notification_workspace_summary_review_label(),
      },
      {
        description:
          m.settings_notification_workspace_summary_control_description(),
        id: 'teacher-control',
        label: m.settings_notification_workspace_summary_control_label(),
      },
    ],
    title,
  };
}
