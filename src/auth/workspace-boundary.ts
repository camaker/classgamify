import { m } from '@/locale/paraglide/messages';
import { websiteConfig } from '@/config/website';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';

export const AUTH_WORKSPACE_BOUNDARY_ITEM_IDS = [
  'account-access',
  'activity-library',
  'assignment-links',
  'student-results',
  'source-materials',
] as const;

export const AUTH_WORKSPACE_HANDOFF_ITEM_IDS = [
  'auth-surface',
  'teacher-workspace',
  'credential-login-gate',
  'google-login-gate',
  'provider-status-api',
  'google-one-tap-boundary',
  'social-redirect-validation',
  'callback-url-safety',
  'default-login-redirect',
  'modal-login-boundary',
  'login-form',
  'register-form',
  'forgot-password-form',
  'reset-password-form',
  'email-field',
  'password-field',
  'password-visibility-control',
  'password-reset-link',
  'guest-session-redirect',
  'account-access',
  'activity-library',
  'assignment-links',
  'student-results',
  'source-materials',
  'billing-settings',
  'public-runner-boundary',
  'answer-key-guard',
  'student-token-guard',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type AuthWorkspaceBoundaryItemId =
  (typeof AUTH_WORKSPACE_BOUNDARY_ITEM_IDS)[number];

export type AuthWorkspaceHandoffItemId =
  (typeof AUTH_WORKSPACE_HANDOFF_ITEM_IDS)[number];

export type AuthWorkspaceHandoffSurface =
  | 'forgot-password'
  | 'login'
  | 'modal-login'
  | 'register'
  | 'reset-password'
  | 'shared-auth-card';

export type AuthWorkspaceBoundaryItemView = {
  description: string;
  id: AuthWorkspaceBoundaryItemId;
  label: string;
};

export type AuthWorkspaceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AuthWorkspaceHandoffItemId;
  label: string;
  value: string;
};

export type AuthWorkspaceHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesAuthSecrets: false;
  exposesCallbackUrl: false;
  exposesOAuthClientSecret: false;
  exposesPassword: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttempts: false;
  exposesTeacherEmail: false;
  itemIds: AuthWorkspaceHandoffItemId[];
  modifiesActivityContent: false;
  modifiesStudentResults: false;
  requiresTeacherSessionForWorkspace: true;
  scope: 'auth-workspace-entry';
  usesSafeCallbackPaths: true;
};

export type AuthWorkspaceBoundaryView = {
  description: string;
  itemViews: AuthWorkspaceHandoffItemView[];
  items: AuthWorkspaceBoundaryItemView[];
  privacy: AuthWorkspaceHandoffPrivacyContract;
  title: string;
};

export type AuthWorkspaceBoundaryInput = {
  credentialLoginEnabled?: boolean;
  googleLoginConfigured?: boolean;
  surface?: AuthWorkspaceHandoffSurface;
};

export function buildAuthWorkspaceBoundaryView({
  credentialLoginEnabled = websiteConfig.auth?.enableCredentialLogin ?? false,
  googleLoginConfigured = websiteConfig.auth?.enableGoogleLogin ?? false,
  surface = 'shared-auth-card',
}: AuthWorkspaceBoundaryInput = {}): AuthWorkspaceBoundaryView {
  const items = buildAuthWorkspaceBoundaryItems();
  const itemViews = AUTH_WORKSPACE_HANDOFF_ITEM_IDS.map((id) =>
    buildAuthWorkspaceHandoffItemView({
      credentialLoginEnabled,
      googleLoginConfigured,
      id,
      items,
      surface,
    })
  );

  return {
    description: m.auth_workspace_boundary_description(),
    items,
    itemViews,
    privacy: buildAuthWorkspaceHandoffPrivacyContract(itemViews),
    title: m.auth_workspace_boundary_title(),
  };
}

function buildAuthWorkspaceBoundaryItems(): AuthWorkspaceBoundaryItemView[] {
  return [
    {
      description: m.auth_workspace_boundary_item_account_access_description(),
      id: 'account-access',
      label: m.auth_workspace_boundary_item_account_access_label(),
    },
    {
      description:
        m.auth_workspace_boundary_item_activity_library_description(),
      id: 'activity-library',
      label: m.auth_workspace_boundary_item_activity_library_label(),
    },
    {
      description:
        m.auth_workspace_boundary_item_assignment_links_description(),
      id: 'assignment-links',
      label: m.auth_workspace_boundary_item_assignment_links_label(),
    },
    {
      description: m.auth_workspace_boundary_item_student_results_description(),
      id: 'student-results',
      label: m.auth_workspace_boundary_item_student_results_label(),
    },
    {
      description:
        m.auth_workspace_boundary_item_source_materials_description(),
      id: 'source-materials',
      label: m.auth_workspace_boundary_item_source_materials_label(),
    },
  ];
}

function buildAuthWorkspaceHandoffItemView({
  credentialLoginEnabled,
  googleLoginConfigured,
  id,
  items,
  surface,
}: {
  credentialLoginEnabled: boolean;
  googleLoginConfigured: boolean;
  id: AuthWorkspaceHandoffItemId;
  items: AuthWorkspaceBoundaryItemView[];
  surface: AuthWorkspaceHandoffSurface;
}): AuthWorkspaceHandoffItemView {
  const item = buildAuthWorkspaceHandoffItem({
    credentialLoginEnabled,
    googleLoginConfigured,
    id,
    items,
    surface,
  });

  return {
    ...item,
    ariaLabel: m.auth_workspace_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildAuthWorkspaceHandoffItem({
  credentialLoginEnabled,
  googleLoginConfigured,
  id,
  items,
  surface,
}: {
  credentialLoginEnabled: boolean;
  googleLoginConfigured: boolean;
  id: AuthWorkspaceHandoffItemId;
  items: AuthWorkspaceBoundaryItemView[];
  surface: AuthWorkspaceHandoffSurface;
}): Omit<AuthWorkspaceHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'auth-surface':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_auth_surface_description(),
        id,
        label: m.auth_workspace_handoff_auth_surface_label(),
        value: formatAuthWorkspaceSurface(surface),
      });
    case 'teacher-workspace':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_teacher_workspace_description(),
        id,
        label: m.auth_workspace_handoff_teacher_workspace_label(),
        value: m.auth_workspace_handoff_teacher_workspace_value(),
      });
    case 'credential-login-gate':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_credential_login_gate_description(),
        id,
        label: m.auth_workspace_handoff_credential_login_gate_label(),
        value: formatAuthWorkspaceFeatureState(credentialLoginEnabled),
      });
    case 'google-login-gate':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_google_login_gate_description(),
        id,
        label: m.auth_workspace_handoff_google_login_gate_label(),
        value: formatAuthWorkspaceFeatureState(googleLoginConfigured),
      });
    case 'provider-status-api':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_provider_status_api_description(),
        id,
        label: m.auth_workspace_handoff_provider_status_api_label(),
        value: m.auth_workspace_handoff_runtime_checked_value(),
      });
    case 'google-one-tap-boundary':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_google_one_tap_boundary_description(),
        id,
        label: m.auth_workspace_handoff_google_one_tap_boundary_label(),
        value: m.auth_workspace_handoff_auth_routes_skipped_value(),
      });
    case 'social-redirect-validation':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_social_redirect_validation_description(),
        id,
        label: m.auth_workspace_handoff_social_redirect_validation_label(),
        value: m.auth_workspace_handoff_google_code_flow_value(),
      });
    case 'callback-url-safety':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_callback_url_safety_description(),
        id,
        label: m.auth_workspace_handoff_callback_url_safety_label(),
        value: m.auth_workspace_handoff_safe_callback_value(),
      });
    case 'default-login-redirect':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_default_login_redirect_description(),
        id,
        label: m.auth_workspace_handoff_default_login_redirect_label(),
        value: DEFAULT_LOGIN_REDIRECT,
      });
    case 'modal-login-boundary':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_modal_login_boundary_description(),
        id,
        label: m.auth_workspace_handoff_modal_login_boundary_label(),
        value: m.auth_workspace_handoff_shared_login_form_value(),
      });
    case 'login-form':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_login_form_description(),
        id,
        label: m.auth_workspace_handoff_login_form_label(),
        value: m.auth_login_sign_in(),
      });
    case 'register-form':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_register_form_description(),
        id,
        label: m.auth_workspace_handoff_register_form_label(),
        value: m.auth_register_sign_up(),
      });
    case 'forgot-password-form':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_forgot_password_form_description(),
        id,
        label: m.auth_workspace_handoff_forgot_password_form_label(),
        value: m.auth_forgot_password_send(),
      });
    case 'reset-password-form':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_reset_password_form_description(),
        id,
        label: m.auth_workspace_handoff_reset_password_form_label(),
        value: m.auth_reset_password_reset(),
      });
    case 'email-field':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_email_field_description(),
        id,
        label: m.auth_workspace_handoff_email_field_label(),
        value: m.auth_login_email(),
      });
    case 'password-field':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_password_field_description(),
        id,
        label: m.auth_workspace_handoff_password_field_label(),
        value: m.auth_login_password(),
      });
    case 'password-visibility-control':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_password_visibility_control_description(),
        id,
        label: m.auth_workspace_handoff_password_visibility_control_label(),
        value: m.auth_workspace_handoff_screen_reader_labelled_value(),
      });
    case 'password-reset-link':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_password_reset_link_description(),
        id,
        label: m.auth_workspace_handoff_password_reset_link_label(),
        value: Routes.ResetPassword,
      });
    case 'guest-session-redirect':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_guest_session_redirect_description(),
        id,
        label: m.auth_workspace_handoff_guest_session_redirect_label(),
        value: m.auth_workspace_handoff_signed_in_redirect_value(),
      });
    case 'account-access':
      return buildAuthWorkspaceHandoffBoundaryItem({
        boundaryItem: getAuthWorkspaceBoundaryItem(items, 'account-access'),
        id,
      });
    case 'activity-library':
      return buildAuthWorkspaceHandoffBoundaryItem({
        boundaryItem: getAuthWorkspaceBoundaryItem(items, 'activity-library'),
        id,
      });
    case 'assignment-links':
      return buildAuthWorkspaceHandoffBoundaryItem({
        boundaryItem: getAuthWorkspaceBoundaryItem(items, 'assignment-links'),
        id,
      });
    case 'student-results':
      return buildAuthWorkspaceHandoffBoundaryItem({
        boundaryItem: getAuthWorkspaceBoundaryItem(items, 'student-results'),
        id,
      });
    case 'source-materials':
      return buildAuthWorkspaceHandoffBoundaryItem({
        boundaryItem: getAuthWorkspaceBoundaryItem(items, 'source-materials'),
        id,
      });
    case 'billing-settings':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_billing_settings_description(),
        id,
        label: m.auth_workspace_handoff_billing_settings_label(),
        value: Routes.SettingsBilling,
      });
    case 'public-runner-boundary':
      return buildAuthWorkspaceHandoffStaticItem({
        description:
          m.auth_workspace_handoff_public_runner_boundary_description(),
        id,
        label: m.auth_workspace_handoff_public_runner_boundary_label(),
        value: m.auth_workspace_handoff_sanitized_payload_value(),
      });
    case 'answer-key-guard':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_answer_key_guard_description(),
        id,
        label: m.auth_workspace_handoff_answer_key_guard_label(),
        value: m.auth_workspace_handoff_not_exposed_value(),
      });
    case 'student-token-guard':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_student_token_guard_description(),
        id,
        label: m.auth_workspace_handoff_student_token_guard_label(),
        value: m.auth_workspace_handoff_not_exposed_value(),
      });
    case 'legacy-copy-guard':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_legacy_copy_guard_description(),
        id,
        label: m.auth_workspace_handoff_legacy_copy_guard_label(),
        value: m.auth_workspace_handoff_classgamify_only_value(),
      });
    case 'privacy-guard':
      return buildAuthWorkspaceHandoffStaticItem({
        description: m.auth_workspace_handoff_privacy_guard_description(),
        id,
        label: m.auth_workspace_handoff_privacy_guard_label(),
        value: m.auth_workspace_handoff_private_data_omitted_value(),
      });
  }
}

function buildAuthWorkspaceHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<AuthWorkspaceHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildAuthWorkspaceHandoffBoundaryItem({
  boundaryItem,
  id,
}: {
  boundaryItem: AuthWorkspaceBoundaryItemView;
  id: AuthWorkspaceHandoffItemId;
}): Omit<AuthWorkspaceHandoffItemView, 'ariaLabel'> {
  return {
    description: boundaryItem.description,
    id,
    label: m.auth_workspace_handoff_boundary_scope_label({
      label: boundaryItem.label,
    }),
    value: boundaryItem.label,
  };
}

function buildAuthWorkspaceHandoffPrivacyContract(
  itemViews: AuthWorkspaceHandoffItemView[]
): AuthWorkspaceHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesAuthSecrets: false,
    exposesCallbackUrl: false,
    exposesOAuthClientSecret: false,
    exposesPassword: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttempts: false,
    exposesTeacherEmail: false,
    itemIds: itemViews.map((item) => item.id),
    modifiesActivityContent: false,
    modifiesStudentResults: false,
    requiresTeacherSessionForWorkspace: true,
    scope: 'auth-workspace-entry',
    usesSafeCallbackPaths: true,
  };
}

function formatAuthWorkspaceFeatureState(enabled: boolean) {
  return enabled
    ? m.auth_workspace_handoff_enabled_value()
    : m.auth_workspace_handoff_not_configured_value();
}

function formatAuthWorkspaceSurface(surface: AuthWorkspaceHandoffSurface) {
  switch (surface) {
    case 'forgot-password':
      return m.auth_workspace_handoff_surface_forgot_password_value();
    case 'login':
      return m.auth_workspace_handoff_surface_login_value();
    case 'modal-login':
      return m.auth_workspace_handoff_surface_modal_login_value();
    case 'register':
      return m.auth_workspace_handoff_surface_register_value();
    case 'reset-password':
      return m.auth_workspace_handoff_surface_reset_password_value();
    case 'shared-auth-card':
      return m.auth_workspace_handoff_surface_shared_auth_card_value();
  }
}

function getAuthWorkspaceBoundaryItem(
  items: AuthWorkspaceBoundaryItemView[],
  id: AuthWorkspaceBoundaryItemId
) {
  const item = items.find((boundaryItem) => boundaryItem.id === id);
  if (!item) {
    throw new Error(`Missing auth workspace boundary item: ${id}`);
  }

  return item;
}
