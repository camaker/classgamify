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

export type SettingsNotificationNewsletterCardView = {
  description: string;
  emailRequiredMessage: string;
  errorMessage: string;
  hint: string;
  label: string;
  scopeDescription: string;
  scopeLabel: string;
  subscribeSuccessMessage: string;
  switchAriaLabel: string;
  switchDescription: string;
  title: string;
  unsubscribeSuccessMessage: string;
};

export type SettingsNotificationPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  newsletterCardView: SettingsNotificationNewsletterCardView;
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
    newsletterCardView: buildSettingsNotificationNewsletterCardView(),
    title,
    workspaceSummaryView: buildSettingsNotificationWorkspaceSummaryView(),
  };
}

export function buildSettingsNotificationNewsletterCardView(): SettingsNotificationNewsletterCardView {
  return {
    description: m.settings_notification_newsletter_description(),
    emailRequiredMessage: m.settings_notification_newsletter_email_required(),
    errorMessage: m.settings_notification_newsletter_error(),
    hint: m.settings_notification_newsletter_hint(),
    label: m.settings_notification_newsletter_label(),
    scopeDescription: m.settings_notification_newsletter_scope_description(),
    scopeLabel: m.settings_notification_newsletter_scope_label(),
    subscribeSuccessMessage:
      m.settings_notification_newsletter_subscribe_success(),
    switchAriaLabel: m.settings_notification_newsletter_switch_aria_label(),
    switchDescription: m.settings_notification_newsletter_switch_description(),
    title: m.settings_notification_newsletter_title(),
    unsubscribeSuccessMessage:
      m.settings_notification_newsletter_unsubscribe_success(),
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
