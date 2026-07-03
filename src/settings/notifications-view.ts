import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

export type SettingsNotificationWorkspaceSummaryItemId =
  | 'assignment-review'
  | 'teacher-control'
  | 'template-updates'
  | 'worksheet-workflows';

export type SettingsNotificationWorkspaceSummaryItemView = {
  ariaLabel: string;
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
  ariaLabel: string;
  description: string;
  emailRequiredMessage: string;
  errorMessage: string;
  formAriaLabel: string;
  hint: string;
  hintAriaLabel: string;
  label: string;
  scopeAriaLabel: string;
  scopeDescription: string;
  scopeLabel: string;
  subscribeSuccessMessage: string;
  switchAriaLabel: string;
  switchDescription: string;
  switchGroupAriaLabel: string;
  title: string;
  unsubscribeSuccessMessage: string;
};

export type SettingsNotificationPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  description: string;
  newsletterCardView: SettingsNotificationNewsletterCardView;
  newsletterSectionAriaLabel: string;
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
    contentAriaLabel: m.settings_notification_content_aria_label({
      description,
      title,
    }),
    description,
    newsletterCardView: buildSettingsNotificationNewsletterCardView(),
    newsletterSectionAriaLabel:
      m.settings_notification_newsletter_section_aria_label(),
    title,
    workspaceSummaryView: buildSettingsNotificationWorkspaceSummaryView(),
  };
}

export function buildSettingsNotificationNewsletterCardView(): SettingsNotificationNewsletterCardView {
  const description = m.settings_notification_newsletter_description();
  const hint = m.settings_notification_newsletter_hint();
  const label = m.settings_notification_newsletter_label();
  const scopeDescription =
    m.settings_notification_newsletter_scope_description();
  const scopeLabel = m.settings_notification_newsletter_scope_label();
  const switchDescription =
    m.settings_notification_newsletter_switch_description();
  const title = m.settings_notification_newsletter_title();

  return {
    ariaLabel: m.settings_notification_newsletter_card_aria_label({
      description,
      title,
    }),
    description,
    emailRequiredMessage: m.settings_notification_newsletter_email_required(),
    errorMessage: m.settings_notification_newsletter_error(),
    formAriaLabel: m.settings_notification_newsletter_form_aria_label({
      title,
    }),
    hint,
    hintAriaLabel: m.settings_notification_newsletter_hint_aria_label({
      hint,
    }),
    label,
    scopeAriaLabel: m.settings_notification_newsletter_scope_aria_label({
      description: scopeDescription,
      label: scopeLabel,
    }),
    scopeDescription,
    scopeLabel,
    subscribeSuccessMessage:
      m.settings_notification_newsletter_subscribe_success(),
    switchAriaLabel: m.settings_notification_newsletter_switch_aria_label(),
    switchDescription,
    switchGroupAriaLabel:
      m.settings_notification_newsletter_switch_group_aria_label({
        description: switchDescription,
        label,
      }),
    title,
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
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_templates_description(),
        id: 'template-updates',
        label: m.settings_notification_workspace_summary_templates_label(),
      }),
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_worksheets_description(),
        id: 'worksheet-workflows',
        label: m.settings_notification_workspace_summary_worksheets_label(),
      }),
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_review_description(),
        id: 'assignment-review',
        label: m.settings_notification_workspace_summary_review_label(),
      }),
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_control_description(),
        id: 'teacher-control',
        label: m.settings_notification_workspace_summary_control_label(),
      }),
    ],
    title,
  };
}

function buildSettingsNotificationWorkspaceSummaryItemView({
  description,
  id,
  label,
}: {
  description: string;
  id: SettingsNotificationWorkspaceSummaryItemId;
  label: string;
}): SettingsNotificationWorkspaceSummaryItemView {
  return {
    ariaLabel: m.settings_notification_workspace_summary_item_aria_label({
      description,
      label,
    }),
    description,
    id,
    label,
  };
}
