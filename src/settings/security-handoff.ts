import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';

export const SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS = [
  'security-scope',
  'authenticated-workspace',
  'credential-login-gate',
  'password-card',
  'current-password-field',
  'new-password-field',
  'password-visibility-controls',
  'password-update-action',
  'password-reset-boundary',
  'user-accounts-query',
  'provider-account-boundary',
  'session-boundary',
  'account-deletion-gate',
  'delete-warning',
  'delete-confirmation-dialog',
  'delete-explicit-action',
  'activity-library-protection',
  'source-material-protection',
  'assignment-link-protection',
  'assignment-snapshot-protection',
  'student-result-protection',
  'public-runner-boundary',
  'billing-access-boundary',
  'owner-scope',
  'auth-secret-guard',
  'password-value-guard',
  'teacher-email-guard',
  'raw-error-guard',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type SettingsSecurityWorkspaceHandoffItemId =
  (typeof SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS)[number];

export type SettingsSecurityWorkspaceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsSecurityWorkspaceHandoffItemId;
  label: string;
  value: string;
};

export type SettingsSecurityWorkspaceHandoffPrivacyContract = {
  changesActivityContent: false;
  changesPublicAssignmentLinks: false;
  deletesWorkspaceDataWithoutExplicitAction: false;
  exposesAuthSecrets: false;
  exposesPasswordValues: false;
  exposesProviderErrors: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentIdentifiers: false;
  exposesTeacherEmail: false;
  itemIds: SettingsSecurityWorkspaceHandoffItemId[];
  modifiesAssignmentSnapshots: false;
  modifiesStudentAttempts: false;
  requiresAuthenticatedTeacher: true;
  scope: 'settings-security-workspace-boundary';
};

export type SettingsSecurityWorkspaceHandoffView = {
  description: string;
  itemViews: SettingsSecurityWorkspaceHandoffItemView[];
  privacy: SettingsSecurityWorkspaceHandoffPrivacyContract;
  title: string;
};

type SettingsSecurityWorkspaceHandoffInput = {
  credentialLoginEnabled?: boolean;
  deleteAccountEnabled?: boolean;
};

export function buildSettingsSecurityWorkspaceHandoffView({
  credentialLoginEnabled = websiteConfig.auth?.enableCredentialLogin ?? false,
  deleteAccountEnabled = websiteConfig.auth?.enableDeleteAccount ?? false,
}: SettingsSecurityWorkspaceHandoffInput = {}): SettingsSecurityWorkspaceHandoffView {
  const itemViews = SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS.map((id) =>
    buildSettingsSecurityWorkspaceHandoffItemView({
      credentialLoginEnabled,
      deleteAccountEnabled,
      id,
    })
  );

  return {
    description: m.settings_security_workspace_summary_description(),
    itemViews,
    privacy: buildSettingsSecurityWorkspaceHandoffPrivacyContract(itemViews),
    title: m.settings_security_workspace_summary_title(),
  };
}

function buildSettingsSecurityWorkspaceHandoffItemView({
  credentialLoginEnabled,
  deleteAccountEnabled,
  id,
}: {
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
  id: SettingsSecurityWorkspaceHandoffItemId;
}): SettingsSecurityWorkspaceHandoffItemView {
  const item = buildSettingsSecurityWorkspaceHandoffItem({
    credentialLoginEnabled,
    deleteAccountEnabled,
    id,
  });

  return {
    ...item,
    ariaLabel: m.settings_account_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildSettingsSecurityWorkspaceHandoffItem({
  credentialLoginEnabled,
  deleteAccountEnabled,
  id,
}: {
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
  id: SettingsSecurityWorkspaceHandoffItemId;
}): Omit<SettingsSecurityWorkspaceHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'security-scope':
      return buildStaticItem({
        description: m.settings_security_description(),
        id,
        label: m.settings_security_title(),
        value: m.settings_security_workspace_summary_title(),
      });
    case 'authenticated-workspace':
      return buildStaticItem({
        description: m.settings_account_handoff_account_access_description(),
        id,
        label: m.settings_account_handoff_account_access_label(),
        value: m.settings_account_handoff_authenticated_value(),
      });
    case 'credential-login-gate':
      return buildStaticItem({
        description:
          m.settings_account_handoff_credential_login_gate_description(),
        id,
        label: m.settings_account_handoff_credential_login_gate_label(),
        value: formatFeatureState(credentialLoginEnabled),
      });
    case 'password-card':
      return buildStaticItem({
        description: m.settings_account_handoff_password_card_description(),
        id,
        label: m.settings_account_handoff_password_card_label(),
        value: formatFeatureState(credentialLoginEnabled),
      });
    case 'current-password-field':
      return buildStaticItem({
        description: m.settings_security_update_password_description(),
        id,
        label: m.settings_security_update_password_current_password(),
        value: formatPreparedState(credentialLoginEnabled),
      });
    case 'new-password-field':
      return buildStaticItem({
        description: m.settings_security_update_password_hint(),
        id,
        label: m.settings_security_update_password_new_password(),
        value: formatPreparedState(credentialLoginEnabled),
      });
    case 'password-visibility-controls':
      return buildStaticItem({
        description:
          m.auth_workspace_handoff_password_visibility_control_description(),
        id,
        label: m.auth_workspace_handoff_password_visibility_control_label(),
        value: m.auth_workspace_handoff_screen_reader_labelled_value(),
      });
    case 'password-update-action':
      return buildStaticItem({
        description:
          m.settings_account_handoff_password_update_action_description(),
        id,
        label: m.settings_account_handoff_password_update_action_label(),
        value: formatPreparedState(credentialLoginEnabled),
      });
    case 'password-reset-boundary':
      return buildStaticItem({
        description:
          m.settings_account_handoff_password_reset_action_description(),
        id,
        label: m.settings_account_handoff_password_reset_action_label(),
        value: formatPreparedState(credentialLoginEnabled),
      });
    case 'user-accounts-query':
      return buildStaticItem({
        description: m.settings_security_workspace_capabilities_description(),
        id,
        label: m.settings_security_workspace_capabilities_title(),
        value: m.settings_account_handoff_prepared_value(),
      });
    case 'provider-account-boundary':
      return buildStaticItem({
        description:
          m.settings_account_handoff_auth_provider_boundary_description(),
        id,
        label: m.settings_account_handoff_auth_provider_boundary_label(),
        value: m.settings_account_handoff_configured_providers_value(),
      });
    case 'session-boundary':
      return buildStaticItem({
        description: m.settings_account_handoff_session_boundary_description(),
        id,
        label: m.settings_account_handoff_session_boundary_label(),
        value: m.settings_account_handoff_authenticated_value(),
      });
    case 'account-deletion-gate':
      return buildStaticItem({
        description:
          m.settings_account_handoff_account_deletion_gate_description(),
        id,
        label: m.settings_account_handoff_account_deletion_gate_label(),
        value: formatFeatureState(deleteAccountEnabled),
      });
    case 'delete-warning':
      return buildStaticItem({
        description: m.settings_security_delete_account_warning(),
        id,
        label: m.settings_security_delete_account_title(),
        value: m.settings_account_handoff_explicit_confirmation_value(),
      });
    case 'delete-confirmation-dialog':
      return buildStaticItem({
        description:
          m.settings_account_handoff_delete_confirmation_boundary_description(),
        id,
        label: m.settings_account_handoff_delete_confirmation_boundary_label(),
        value: m.settings_account_handoff_explicit_confirmation_value(),
      });
    case 'delete-explicit-action':
      return buildStaticItem({
        description:
          m.settings_account_handoff_account_delete_action_description(),
        id,
        label: m.settings_account_handoff_account_delete_action_label(),
        value: deleteAccountEnabled
          ? m.settings_account_handoff_delete_explicit_value()
          : m.settings_account_handoff_not_configured_value(),
      });
    case 'activity-library-protection':
      return buildStaticItem({
        description:
          m.settings_security_workspace_summary_activities_description(),
        id,
        label: m.settings_security_workspace_summary_activities_label(),
        value: m.settings_profile_workspace_summary_activities_label(),
      });
    case 'source-material-protection':
      return buildStaticItem({
        description:
          m.settings_account_handoff_source_material_boundary_description(),
        id,
        label: m.settings_account_handoff_source_material_boundary_label(),
        value: m.settings_account_handoff_private_references_value(),
      });
    case 'assignment-link-protection':
      return buildStaticItem({
        description:
          m.settings_security_workspace_summary_assignments_description(),
        id,
        label: m.settings_security_workspace_summary_assignments_label(),
        value: m.settings_account_handoff_no_link_changes_value(),
      });
    case 'assignment-snapshot-protection':
      return buildStaticItem({
        description:
          m.activity_lifecycle_handoff_snapshot_protection_description(),
        id,
        label: m.activity_lifecycle_handoff_snapshot_protection_label(),
        value: m.activity_lifecycle_handoff_snapshot_protection_value(),
      });
    case 'student-result-protection':
      return buildStaticItem({
        description:
          m.settings_security_workspace_summary_results_description(),
        id,
        label: m.settings_security_workspace_summary_results_label(),
        value: m.settings_account_handoff_private_records_value(),
      });
    case 'public-runner-boundary':
      return buildStaticItem({
        description:
          m.settings_account_handoff_public_runner_boundary_description(),
        id,
        label: m.settings_account_handoff_public_runner_boundary_label(),
        value: m.settings_account_handoff_sanitized_payload_value(),
      });
    case 'billing-access-boundary':
      return buildStaticItem({
        description: m.auth_workspace_handoff_billing_settings_description(),
        id,
        label: m.auth_workspace_handoff_billing_settings_label(),
        value: Routes.SettingsBilling,
      });
    case 'owner-scope':
      return buildStaticItem({
        description: m.settings_account_handoff_owner_scope_description(),
        id,
        label: m.settings_account_handoff_owner_scope_label(),
        value: m.settings_account_handoff_teacher_owned_value(),
      });
    case 'auth-secret-guard':
      return buildStaticItem({
        description: m.settings_account_handoff_raw_secret_guard_description(),
        id,
        label: m.settings_account_handoff_raw_secret_guard_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'password-value-guard':
      return buildStaticItem({
        description: m.auth_workspace_handoff_password_field_description(),
        id,
        label: m.auth_workspace_handoff_password_field_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'teacher-email-guard':
      return buildStaticItem({
        description: m.settings_account_handoff_email_visibility_description(),
        id,
        label: m.settings_account_handoff_email_visibility_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'raw-error-guard':
      return buildStaticItem({
        description: m.settings_security_update_password_fail(),
        id,
        label: m.settings_account_handoff_raw_secret_guard_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'legacy-copy-guard':
      return buildStaticItem({
        description: m.settings_account_handoff_legacy_copy_guard_description(),
        id,
        label: m.settings_account_handoff_legacy_copy_guard_label(),
        value: m.settings_account_handoff_classgamify_only_value(),
      });
    case 'privacy-guard':
      return buildStaticItem({
        description: m.settings_account_handoff_privacy_guard_description(),
        id,
        label: m.settings_account_handoff_privacy_guard_label(),
        value: m.settings_account_handoff_private_data_omitted_value(),
      });
  }
}

function buildStaticItem({
  description,
  id,
  label,
  value,
}: Omit<SettingsSecurityWorkspaceHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildSettingsSecurityWorkspaceHandoffPrivacyContract(
  itemViews: SettingsSecurityWorkspaceHandoffItemView[]
): SettingsSecurityWorkspaceHandoffPrivacyContract {
  return {
    changesActivityContent: false,
    changesPublicAssignmentLinks: false,
    deletesWorkspaceDataWithoutExplicitAction: false,
    exposesAuthSecrets: false,
    exposesPasswordValues: false,
    exposesProviderErrors: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    itemIds: itemViews.map((item) => item.id),
    modifiesAssignmentSnapshots: false,
    modifiesStudentAttempts: false,
    requiresAuthenticatedTeacher: true,
    scope: 'settings-security-workspace-boundary',
  };
}

function formatFeatureState(enabled: boolean) {
  return enabled
    ? m.settings_account_handoff_enabled_value()
    : m.settings_account_handoff_not_configured_value();
}

function formatPreparedState(enabled: boolean) {
  return enabled
    ? m.settings_account_handoff_prepared_value()
    : m.settings_account_handoff_not_configured_value();
}
