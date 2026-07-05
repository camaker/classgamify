import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { getSafeCallbackPath } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';

const SETTINGS_PAYMENT_DEFAULT_CALLBACK = '/settings/billing';

export type SettingsBillingWorkspaceSummaryItemId =
  | 'activity-library'
  | 'assignment-workflow'
  | 'plan-access'
  | 'results-ai';

export type SettingsBillingWorkspaceSummaryItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsBillingWorkspaceSummaryItemId;
  label: string;
};

export const SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS = [
  'workspace-scope',
  'route-gate',
  'payment-feature-gate',
  'plan-source',
  'current-plan-card',
  'plan-status-badge',
  'plan-feature-section',
  'plan-limit-section',
  'free-plan-boundary',
  'pro-plan-boundary',
  'lifetime-plan-boundary',
  'upgrade-action',
  'portal-action',
  'retry-action',
  'hosted-checkout',
  'customer-portal',
  'payment-callback',
  'activity-library-access',
  'assignment-workflow-access',
  'ai-draft-access',
  'result-export-access',
  'source-material-access',
  'school-workspace-path',
  'period-start',
  'period-end',
  'trial-end',
  'cancel-at-period-end',
  'provider-boundary',
  'student-data-boundary',
  'privacy-guard',
] as const;

export type SettingsBillingWorkspaceHandoffItemId =
  (typeof SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS)[number];

export type SettingsBillingWorkspaceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsBillingWorkspaceHandoffItemId;
  label: string;
  value: string;
};

export type SettingsBillingWorkspaceHandoffPrivacyContract = {
  changesActivityContent: false;
  changesAssignmentLinks: false;
  exposesActivityContent: false;
  exposesPaymentProviderSecrets: false;
  exposesRawCheckoutSession: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswers: false;
  exposesStudentIdentifiers: false;
  exposesTeacherEmail: false;
  hostedBillingOnly: true;
  itemIds: SettingsBillingWorkspaceHandoffItemId[];
  modifiesAssignmentSnapshots: false;
  planCapabilitiesAffectClassroomLoop: true;
  scope: 'teacher-billing-workspace';
};

export type SettingsBillingWorkspaceHandoffView = {
  description: string;
  itemViews: SettingsBillingWorkspaceHandoffItemView[];
  privacy: SettingsBillingWorkspaceHandoffPrivacyContract;
  title: string;
};

export type SettingsBillingWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  handoffView: SettingsBillingWorkspaceHandoffView;
  itemViews: SettingsBillingWorkspaceSummaryItemView[];
  title: string;
};

export type SettingsBillingPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  description: string;
  planSectionAriaLabel: string;
  title: string;
  workspaceSummaryView: SettingsBillingWorkspaceSummaryView;
};

export type SettingsPaymentPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  callback: string;
  description: string;
  title: string;
};

export function isSettingsBillingEnabled() {
  return websiteConfig.payment?.enable === true;
}

export function buildSettingsBillingPageViewModel(): SettingsBillingPageViewModel {
  const title = m.settings_billing_title();
  const description = m.settings_billing_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      {
        id: 'billing',
        label: m.settings_billing_breadcrumb(),
        isCurrentPage: true,
      },
    ],
    contentAriaLabel: m.settings_billing_content_aria_label({
      description,
      title,
    }),
    description,
    planSectionAriaLabel: m.settings_billing_plan_section_aria_label(),
    title,
    workspaceSummaryView: buildSettingsBillingWorkspaceSummaryView(),
  };
}

export function buildSettingsPaymentPageViewModel({
  callback,
}: {
  callback?: string;
}): SettingsPaymentPageViewModel {
  const title = m.settings_payment_title();
  const description = m.settings_payment_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      {
        id: 'payment',
        label: m.settings_billing_breadcrumb(),
        isCurrentPage: true,
      },
    ],
    callback: normalizeSettingsPaymentCallback(callback),
    description,
    title,
  };
}

export function normalizeSettingsPaymentCallback(callback?: string) {
  return getSafeCallbackPath(callback, SETTINGS_PAYMENT_DEFAULT_CALLBACK);
}

export function buildSettingsBillingWorkspaceSummaryView(): SettingsBillingWorkspaceSummaryView {
  const title = m.settings_billing_workspace_summary_title();
  const description = m.settings_billing_workspace_summary_description();

  return {
    ariaLabel: m.settings_billing_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    handoffView: buildSettingsBillingWorkspaceHandoffView(),
    itemViews: [
      buildSettingsBillingWorkspaceSummaryItemView({
        description: m.settings_billing_workspace_summary_plan_description(),
        id: 'plan-access',
        label: m.settings_billing_workspace_summary_plan_label(),
      }),
      buildSettingsBillingWorkspaceSummaryItemView({
        description:
          m.settings_billing_workspace_summary_activities_description(),
        id: 'activity-library',
        label: m.settings_billing_workspace_summary_activities_label(),
      }),
      buildSettingsBillingWorkspaceSummaryItemView({
        description:
          m.settings_billing_workspace_summary_assignments_description(),
        id: 'assignment-workflow',
        label: m.settings_billing_workspace_summary_assignments_label(),
      }),
      buildSettingsBillingWorkspaceSummaryItemView({
        description: m.settings_billing_workspace_summary_results_description(),
        id: 'results-ai',
        label: m.settings_billing_workspace_summary_results_label(),
      }),
    ],
    title,
  };
}

export function buildSettingsBillingWorkspaceHandoffView(): SettingsBillingWorkspaceHandoffView {
  const itemViews = SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS.map((id) =>
    buildSettingsBillingWorkspaceHandoffItemView(id)
  );

  return {
    description: m.settings_billing_handoff_description(),
    itemViews,
    privacy: buildSettingsBillingWorkspaceHandoffPrivacyContract(itemViews),
    title: m.settings_billing_handoff_title(),
  };
}

function buildSettingsBillingWorkspaceSummaryItemView({
  description,
  id,
  label,
}: {
  description: string;
  id: SettingsBillingWorkspaceSummaryItemId;
  label: string;
}): SettingsBillingWorkspaceSummaryItemView {
  return {
    ariaLabel: m.settings_billing_workspace_summary_item_aria_label({
      description,
      label,
    }),
    description,
    id,
    label,
  };
}

function buildSettingsBillingWorkspaceHandoffItemView(
  id: SettingsBillingWorkspaceHandoffItemId
): SettingsBillingWorkspaceHandoffItemView {
  const label = getSettingsBillingWorkspaceHandoffItemLabel(id);
  const description = getSettingsBillingWorkspaceHandoffItemDescription(id);
  const value = getSettingsBillingWorkspaceHandoffItemValue(id);

  return {
    ariaLabel: m.settings_billing_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function getSettingsBillingWorkspaceHandoffItemLabel(
  id: SettingsBillingWorkspaceHandoffItemId
) {
  switch (id) {
    case 'workspace-scope':
      return m.settings_billing_handoff_workspace_scope_label();
    case 'route-gate':
      return m.settings_billing_handoff_route_gate_label();
    case 'payment-feature-gate':
      return m.settings_billing_handoff_payment_feature_gate_label();
    case 'plan-source':
      return m.settings_billing_handoff_plan_source_label();
    case 'current-plan-card':
      return m.settings_billing_handoff_current_plan_card_label();
    case 'plan-status-badge':
      return m.settings_billing_handoff_plan_status_badge_label();
    case 'plan-feature-section':
      return m.settings_billing_handoff_plan_feature_section_label();
    case 'plan-limit-section':
      return m.settings_billing_handoff_plan_limit_section_label();
    case 'free-plan-boundary':
      return m.settings_billing_handoff_free_plan_boundary_label();
    case 'pro-plan-boundary':
      return m.settings_billing_handoff_pro_plan_boundary_label();
    case 'lifetime-plan-boundary':
      return m.settings_billing_handoff_lifetime_plan_boundary_label();
    case 'upgrade-action':
      return m.settings_billing_handoff_upgrade_action_label();
    case 'portal-action':
      return m.settings_billing_handoff_portal_action_label();
    case 'retry-action':
      return m.settings_billing_handoff_retry_action_label();
    case 'hosted-checkout':
      return m.settings_billing_handoff_hosted_checkout_label();
    case 'customer-portal':
      return m.settings_billing_handoff_customer_portal_label();
    case 'payment-callback':
      return m.settings_billing_handoff_payment_callback_label();
    case 'activity-library-access':
      return m.settings_billing_handoff_activity_library_access_label();
    case 'assignment-workflow-access':
      return m.settings_billing_handoff_assignment_workflow_access_label();
    case 'ai-draft-access':
      return m.settings_billing_handoff_ai_draft_access_label();
    case 'result-export-access':
      return m.settings_billing_handoff_result_export_access_label();
    case 'source-material-access':
      return m.settings_billing_handoff_source_material_access_label();
    case 'school-workspace-path':
      return m.settings_billing_handoff_school_workspace_path_label();
    case 'period-start':
      return m.settings_billing_handoff_period_start_label();
    case 'period-end':
      return m.settings_billing_handoff_period_end_label();
    case 'trial-end':
      return m.settings_billing_handoff_trial_end_label();
    case 'cancel-at-period-end':
      return m.settings_billing_handoff_cancel_at_period_end_label();
    case 'provider-boundary':
      return m.settings_billing_handoff_provider_boundary_label();
    case 'student-data-boundary':
      return m.settings_billing_handoff_student_data_boundary_label();
    case 'privacy-guard':
      return m.settings_billing_handoff_privacy_guard_label();
  }
}

function getSettingsBillingWorkspaceHandoffItemDescription(
  id: SettingsBillingWorkspaceHandoffItemId
) {
  switch (id) {
    case 'workspace-scope':
      return m.settings_billing_handoff_workspace_scope_description();
    case 'route-gate':
      return m.settings_billing_handoff_route_gate_description();
    case 'payment-feature-gate':
      return m.settings_billing_handoff_payment_feature_gate_description();
    case 'plan-source':
      return m.settings_billing_handoff_plan_source_description();
    case 'current-plan-card':
      return m.settings_billing_handoff_current_plan_card_description();
    case 'plan-status-badge':
      return m.settings_billing_handoff_plan_status_badge_description();
    case 'plan-feature-section':
      return m.settings_billing_handoff_plan_feature_section_description();
    case 'plan-limit-section':
      return m.settings_billing_handoff_plan_limit_section_description();
    case 'free-plan-boundary':
      return m.settings_billing_handoff_free_plan_boundary_description();
    case 'pro-plan-boundary':
      return m.settings_billing_handoff_pro_plan_boundary_description();
    case 'lifetime-plan-boundary':
      return m.settings_billing_handoff_lifetime_plan_boundary_description();
    case 'upgrade-action':
      return m.settings_billing_handoff_upgrade_action_description();
    case 'portal-action':
      return m.settings_billing_handoff_portal_action_description();
    case 'retry-action':
      return m.settings_billing_handoff_retry_action_description();
    case 'hosted-checkout':
      return m.settings_billing_handoff_hosted_checkout_description();
    case 'customer-portal':
      return m.settings_billing_handoff_customer_portal_description();
    case 'payment-callback':
      return m.settings_billing_handoff_payment_callback_description();
    case 'activity-library-access':
      return m.settings_billing_handoff_activity_library_access_description();
    case 'assignment-workflow-access':
      return m.settings_billing_handoff_assignment_workflow_access_description();
    case 'ai-draft-access':
      return m.settings_billing_handoff_ai_draft_access_description();
    case 'result-export-access':
      return m.settings_billing_handoff_result_export_access_description();
    case 'source-material-access':
      return m.settings_billing_handoff_source_material_access_description();
    case 'school-workspace-path':
      return m.settings_billing_handoff_school_workspace_path_description();
    case 'period-start':
      return m.settings_billing_handoff_period_start_description();
    case 'period-end':
      return m.settings_billing_handoff_period_end_description();
    case 'trial-end':
      return m.settings_billing_handoff_trial_end_description();
    case 'cancel-at-period-end':
      return m.settings_billing_handoff_cancel_at_period_end_description();
    case 'provider-boundary':
      return m.settings_billing_handoff_provider_boundary_description();
    case 'student-data-boundary':
      return m.settings_billing_handoff_student_data_boundary_description();
    case 'privacy-guard':
      return m.settings_billing_handoff_privacy_guard_description();
  }
}

function getSettingsBillingWorkspaceHandoffItemValue(
  id: SettingsBillingWorkspaceHandoffItemId
) {
  switch (id) {
    case 'workspace-scope':
      return m.settings_billing_handoff_workspace_scope_value();
    case 'route-gate':
      return m.settings_billing_handoff_route_gate_value();
    case 'payment-feature-gate':
      return isSettingsBillingEnabled()
        ? m.settings_billing_handoff_enabled_value()
        : m.settings_billing_handoff_disabled_value();
    case 'plan-source':
      return m.settings_billing_workspace_summary_plan_label();
    case 'current-plan-card':
      return m.settings_billing_card_current_plan();
    case 'plan-status-badge':
      return m.settings_billing_handoff_status_badge_value();
    case 'plan-feature-section':
      return m.settings_billing_card_features_title();
    case 'plan-limit-section':
      return m.settings_billing_card_limits_title();
    case 'free-plan-boundary':
      return m.settings_billing_card_free();
    case 'pro-plan-boundary':
      return m.pricing_plans_pro_name();
    case 'lifetime-plan-boundary':
      return m.settings_billing_card_lifetime();
    case 'upgrade-action':
      return m.settings_billing_card_upgrade_plan();
    case 'portal-action':
      return m.settings_billing_card_manage_billing();
    case 'retry-action':
      return m.settings_billing_card_retry();
    case 'hosted-checkout':
      return m.settings_billing_handoff_hosted_checkout_value();
    case 'customer-portal':
      return m.settings_billing_handoff_customer_portal_value();
    case 'payment-callback':
      return m.settings_payment_title();
    case 'activity-library-access':
      return m.settings_billing_workspace_summary_activities_label();
    case 'assignment-workflow-access':
      return m.settings_billing_workspace_summary_assignments_label();
    case 'ai-draft-access':
      return m.settings_billing_handoff_ai_draft_access_value();
    case 'result-export-access':
      return m.settings_billing_handoff_result_export_access_value();
    case 'source-material-access':
      return m.settings_billing_handoff_source_material_access_value();
    case 'school-workspace-path':
      return m.settings_billing_handoff_school_workspace_path_value();
    case 'period-start':
      return m.settings_billing_card_period_start();
    case 'period-end':
      return m.settings_billing_card_period_ends();
    case 'trial-end':
      return m.settings_billing_card_trial_ends();
    case 'cancel-at-period-end':
      return m.settings_billing_card_cancels_at_period_end();
    case 'provider-boundary':
      return m.settings_billing_handoff_provider_boundary_value();
    case 'student-data-boundary':
      return m.settings_billing_handoff_student_data_boundary_value();
    case 'privacy-guard':
      return m.settings_billing_handoff_privacy_guard_value();
  }
}

function buildSettingsBillingWorkspaceHandoffPrivacyContract(
  itemViews: SettingsBillingWorkspaceHandoffItemView[]
): SettingsBillingWorkspaceHandoffPrivacyContract {
  return {
    changesActivityContent: false,
    changesAssignmentLinks: false,
    exposesActivityContent: false,
    exposesPaymentProviderSecrets: false,
    exposesRawCheckoutSession: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    hostedBillingOnly: true,
    itemIds: itemViews.map((item) => item.id),
    modifiesAssignmentSnapshots: false,
    planCapabilitiesAffectClassroomLoop: true,
    scope: 'teacher-billing-workspace',
  };
}
