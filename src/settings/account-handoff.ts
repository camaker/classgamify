import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

export type SettingsAccountWorkspaceHandoffPage = 'profile' | 'security';

export const SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS = [
  'account-scope',
  'profile-page',
  'security-page',
  'account-access',
  'profile-display-name',
  'profile-avatar',
  'activity-author-identity',
  'assignment-handoff-identity',
  'student-recognition',
  'result-review-identity',
  'credential-login-gate',
  'password-card',
  'password-update-action',
  'password-reset-action',
  'account-deletion-gate',
  'account-delete-action',
  'delete-confirmation-boundary',
  'session-boundary',
  'owner-scope',
  'source-material-boundary',
  'assignment-link-boundary',
  'student-result-boundary',
  'public-runner-boundary',
  'auth-provider-boundary',
  'email-visibility',
  'raw-secret-guard',
  'student-token-guard',
  'storage-key-guard',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type SettingsAccountWorkspaceHandoffItemId =
  (typeof SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS)[number];

export type SettingsAccountWorkspaceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsAccountWorkspaceHandoffItemId;
  label: string;
  value: string;
};

export type SettingsAccountWorkspaceHandoffPrivacyContract = {
  changesActivityContent: false;
  changesPublicAssignmentLinks: false;
  deletesWorkspaceDataWithoutExplicitAction: false;
  exposesAuthSecrets: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentIdentifiers: false;
  exposesTeacherEmail: false;
  itemIds: SettingsAccountWorkspaceHandoffItemId[];
  modifiesAssignmentSnapshots: false;
  modifiesStudentAttempts: false;
  scope: 'teacher-account-settings';
};

export type SettingsAccountWorkspaceHandoffView = {
  description: string;
  itemViews: SettingsAccountWorkspaceHandoffItemView[];
  privacy: SettingsAccountWorkspaceHandoffPrivacyContract;
  title: string;
};

type SettingsAccountWorkspaceHandoffInput = {
  credentialLoginEnabled?: boolean;
  deleteAccountEnabled?: boolean;
  page: SettingsAccountWorkspaceHandoffPage;
};

export function buildSettingsAccountWorkspaceHandoffView({
  credentialLoginEnabled = websiteConfig.auth?.enableCredentialLogin ?? false,
  deleteAccountEnabled = websiteConfig.auth?.enableDeleteAccount ?? false,
  page,
}: SettingsAccountWorkspaceHandoffInput): SettingsAccountWorkspaceHandoffView {
  const itemViews = SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS.map((id) =>
    buildSettingsAccountWorkspaceHandoffItemView({
      credentialLoginEnabled,
      deleteAccountEnabled,
      id,
      page,
    })
  );

  return {
    description: m.settings_account_handoff_description(),
    itemViews,
    privacy: buildSettingsAccountWorkspaceHandoffPrivacyContract(itemViews),
    title: m.settings_account_handoff_title(),
  };
}

function buildSettingsAccountWorkspaceHandoffItemView({
  credentialLoginEnabled,
  deleteAccountEnabled,
  id,
  page,
}: {
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
  id: SettingsAccountWorkspaceHandoffItemId;
  page: SettingsAccountWorkspaceHandoffPage;
}): SettingsAccountWorkspaceHandoffItemView {
  const item = buildSettingsAccountWorkspaceHandoffItem({
    credentialLoginEnabled,
    deleteAccountEnabled,
    id,
    page,
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

function buildSettingsAccountWorkspaceHandoffItem({
  credentialLoginEnabled,
  deleteAccountEnabled,
  id,
  page,
}: {
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
  id: SettingsAccountWorkspaceHandoffItemId;
  page: SettingsAccountWorkspaceHandoffPage;
}): Omit<SettingsAccountWorkspaceHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'account-scope':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_account_scope_description(),
        id,
        label: m.settings_account_handoff_account_scope_label(),
        value: m.settings_account_handoff_account_scope_value(),
      });
    case 'profile-page':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_profile_page_description(),
        id,
        label: m.settings_account_handoff_profile_page_label(),
        value: formatSettingsAccountWorkspacePageState(page === 'profile'),
      });
    case 'security-page':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_security_page_description(),
        id,
        label: m.settings_account_handoff_security_page_label(),
        value: formatSettingsAccountWorkspacePageState(page === 'security'),
      });
    case 'account-access':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_account_access_description(),
        id,
        label: m.settings_account_handoff_account_access_label(),
        value: m.settings_account_handoff_authenticated_value(),
      });
    case 'profile-display-name':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_profile_display_name_description(),
        id,
        label: m.settings_account_handoff_profile_display_name_label(),
        value: m.settings_profile_name_title(),
      });
    case 'profile-avatar':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_profile_avatar_description(),
        id,
        label: m.settings_account_handoff_profile_avatar_label(),
        value: m.settings_profile_avatar_title(),
      });
    case 'activity-author-identity':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_activity_author_identity_description(),
        id,
        label: m.settings_account_handoff_activity_author_identity_label(),
        value: m.settings_profile_workspace_summary_activities_label(),
      });
    case 'assignment-handoff-identity':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_assignment_handoff_identity_description(),
        id,
        label: m.settings_account_handoff_assignment_handoff_identity_label(),
        value: m.settings_profile_workspace_summary_assignments_label(),
      });
    case 'student-recognition':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_student_recognition_description(),
        id,
        label: m.settings_account_handoff_student_recognition_label(),
        value: m.settings_profile_workspace_summary_student_label(),
      });
    case 'result-review-identity':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_result_review_identity_description(),
        id,
        label: m.settings_account_handoff_result_review_identity_label(),
        value: m.settings_profile_workspace_summary_results_label(),
      });
    case 'credential-login-gate':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_credential_login_gate_description(),
        id,
        label: m.settings_account_handoff_credential_login_gate_label(),
        value: formatSettingsAccountWorkspaceFeatureState(
          credentialLoginEnabled
        ),
      });
    case 'password-card':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_password_card_description(),
        id,
        label: m.settings_account_handoff_password_card_label(),
        value: formatSettingsAccountWorkspaceFeatureState(
          credentialLoginEnabled
        ),
      });
    case 'password-update-action':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_password_update_action_description(),
        id,
        label: m.settings_account_handoff_password_update_action_label(),
        value: formatSettingsAccountWorkspacePreparedState(
          credentialLoginEnabled
        ),
      });
    case 'password-reset-action':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_password_reset_action_description(),
        id,
        label: m.settings_account_handoff_password_reset_action_label(),
        value: formatSettingsAccountWorkspacePreparedState(
          credentialLoginEnabled
        ),
      });
    case 'account-deletion-gate':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_account_deletion_gate_description(),
        id,
        label: m.settings_account_handoff_account_deletion_gate_label(),
        value: formatSettingsAccountWorkspaceFeatureState(deleteAccountEnabled),
      });
    case 'account-delete-action':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_account_delete_action_description(),
        id,
        label: m.settings_account_handoff_account_delete_action_label(),
        value: deleteAccountEnabled
          ? m.settings_account_handoff_delete_explicit_value()
          : m.settings_account_handoff_not_configured_value(),
      });
    case 'delete-confirmation-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_delete_confirmation_boundary_description(),
        id,
        label: m.settings_account_handoff_delete_confirmation_boundary_label(),
        value: m.settings_account_handoff_explicit_confirmation_value(),
      });
    case 'session-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_session_boundary_description(),
        id,
        label: m.settings_account_handoff_session_boundary_label(),
        value: m.settings_account_handoff_authenticated_value(),
      });
    case 'owner-scope':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_owner_scope_description(),
        id,
        label: m.settings_account_handoff_owner_scope_label(),
        value: m.settings_account_handoff_teacher_owned_value(),
      });
    case 'source-material-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_source_material_boundary_description(),
        id,
        label: m.settings_account_handoff_source_material_boundary_label(),
        value: m.settings_account_handoff_private_references_value(),
      });
    case 'assignment-link-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_assignment_link_boundary_description(),
        id,
        label: m.settings_account_handoff_assignment_link_boundary_label(),
        value: m.settings_account_handoff_no_link_changes_value(),
      });
    case 'student-result-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_student_result_boundary_description(),
        id,
        label: m.settings_account_handoff_student_result_boundary_label(),
        value: m.settings_account_handoff_private_records_value(),
      });
    case 'public-runner-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_public_runner_boundary_description(),
        id,
        label: m.settings_account_handoff_public_runner_boundary_label(),
        value: m.settings_account_handoff_sanitized_payload_value(),
      });
    case 'auth-provider-boundary':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_auth_provider_boundary_description(),
        id,
        label: m.settings_account_handoff_auth_provider_boundary_label(),
        value: m.settings_account_handoff_configured_providers_value(),
      });
    case 'email-visibility':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_email_visibility_description(),
        id,
        label: m.settings_account_handoff_email_visibility_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'raw-secret-guard':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_raw_secret_guard_description(),
        id,
        label: m.settings_account_handoff_raw_secret_guard_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'student-token-guard':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description:
          m.settings_account_handoff_student_token_guard_description(),
        id,
        label: m.settings_account_handoff_student_token_guard_label(),
        value: m.settings_account_handoff_not_exposed_value(),
      });
    case 'storage-key-guard':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_storage_key_guard_description(),
        id,
        label: m.settings_account_handoff_storage_key_guard_label(),
        value: m.settings_account_handoff_server_side_only_value(),
      });
    case 'legacy-copy-guard':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_legacy_copy_guard_description(),
        id,
        label: m.settings_account_handoff_legacy_copy_guard_label(),
        value: m.settings_account_handoff_classgamify_only_value(),
      });
    case 'privacy-guard':
      return buildSettingsAccountWorkspaceHandoffStaticItem({
        description: m.settings_account_handoff_privacy_guard_description(),
        id,
        label: m.settings_account_handoff_privacy_guard_label(),
        value: m.settings_account_handoff_private_data_omitted_value(),
      });
  }
}

function buildSettingsAccountWorkspaceHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<SettingsAccountWorkspaceHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildSettingsAccountWorkspaceHandoffPrivacyContract(
  itemViews: SettingsAccountWorkspaceHandoffItemView[]
): SettingsAccountWorkspaceHandoffPrivacyContract {
  return {
    changesActivityContent: false,
    changesPublicAssignmentLinks: false,
    deletesWorkspaceDataWithoutExplicitAction: false,
    exposesAuthSecrets: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    itemIds: itemViews.map((item) => item.id),
    modifiesAssignmentSnapshots: false,
    modifiesStudentAttempts: false,
    scope: 'teacher-account-settings',
  };
}

function formatSettingsAccountWorkspaceFeatureState(enabled: boolean) {
  return enabled
    ? m.settings_account_handoff_enabled_value()
    : m.settings_account_handoff_not_configured_value();
}

function formatSettingsAccountWorkspacePreparedState(enabled: boolean) {
  return enabled
    ? m.settings_account_handoff_prepared_value()
    : m.settings_account_handoff_not_configured_value();
}

function formatSettingsAccountWorkspacePageState(isCurrentPage: boolean) {
  return isCurrentPage
    ? m.settings_account_handoff_current_page_value()
    : m.settings_account_handoff_available_page_value();
}
