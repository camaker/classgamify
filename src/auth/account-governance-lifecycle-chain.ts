import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';

export const ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-account-boundary',
  'auth-session-runtime',
  'email-verification-gate',
  'safe-callback-redirect',
  'credential-login-provider',
  'google-oauth-provider',
  'google-one-tap-provider',
  'auth-error-recovery',
  'profile-route',
  'profile-identity-update',
  'profile-avatar-update',
  'profile-no-classroom-mutation',
  'security-route',
  'password-update-gate',
  'password-reset-mail',
  'account-delete-feature-gate',
  'delete-confirmation-required',
  'delete-no-silent-data-loss',
  'admin-route-gate',
  'admin-api-gate',
  'admin-user-list-query',
  'admin-user-ban-actions',
  'billing-payment-callback-boundary',
  'notification-email-preference',
  'files-owner-scope-boundary',
  'storage-private-owner-check',
  'provider-secret-guard',
  'student-data-guard',
  'legacy-copy-guard',
  'account-governance-chain-gate',
] as const;

export const ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/auth.md',
  'docs/configuration.md',
  'src/auth/auth.ts',
  'src/auth/client.ts',
  'src/auth/provider-status.ts',
  'src/auth/workspace-boundary.ts',
  'src/auth/error-recovery.ts',
  'src/auth/plugin-copy.ts',
  'src/middlewares/auth-middleware.ts',
  'src/middlewares/admin-middleware.ts',
  'src/settings/account-handoff.ts',
  'src/settings/security-handoff.ts',
  'src/settings/profile-view.ts',
  'src/settings/security-view.ts',
  'src/routes/settings/profile.tsx',
  'src/routes/settings/security.tsx',
  'src/components/settings/security/delete-account-card.tsx',
  'src/api/users.ts',
  'src/admin/users-query.ts',
  'src/admin/users-view.ts',
  'src/routes/admin/users.tsx',
  'src/settings/billing-view.ts',
  'src/settings/notifications-view.ts',
  'src/settings/files-view.ts',
  'src/storage/file-access.ts',
  'src/payment/payment-status-view.ts',
  'src/config/website.ts',
  'src/db/auth.schema.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AccountGovernanceLifecycleChainHandoffItemId =
  (typeof ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AccountGovernanceLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AccountGovernanceLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type AccountGovernanceLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  deletesWorkspaceDataWithoutExplicitAction: false;
  exposesAdminSearchText: false;
  exposesAuthSecrets: false;
  exposesOAuthClientSecrets: false;
  exposesPasswordValues: false;
  exposesPaymentProviderSecrets: false;
  exposesProviderErrors: false;
  exposesRawAnonymousTokens: false;
  exposesRawUserEmails: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswers: false;
  exposesStudentIdentifiers: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: AccountGovernanceLifecycleChainHandoffItemId[];
  keepsAccountSettingsFromMutatingClassroomData: true;
  keepsAdminActionsAwayFromClassroomLinks: true;
  keepsRuntimeSecretsServerSide: true;
  requiresAdminRoleForUserGovernance: true;
  requiresTeacherSessionForAccountSettings: true;
  sourceFiles: string[];
  usesClassGamifyAccountCopy: true;
  usesPaymentCallbackHandoff: true;
};

export type AccountGovernanceLifecycleChainHandoffView = {
  description: string;
  itemViews: AccountGovernanceLifecycleChainHandoffItemView[];
  privacy: AccountGovernanceLifecycleChainPrivacyContract;
  title: string;
};

export function buildAccountGovernanceLifecycleChainHandoffView(): AccountGovernanceLifecycleChainHandoffView {
  const itemViews = ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildAccountGovernanceLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice teacher account governance and lifecycle chain from auth session entry through profile/security settings, explicit deletion, admin user governance, billing/payment callback, notification/file boundaries, and private classroom data guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      deletesWorkspaceDataWithoutExplicitAction: false,
      exposesAdminSearchText: false,
      exposesAuthSecrets: false,
      exposesOAuthClientSecrets: false,
      exposesPasswordValues: false,
      exposesPaymentProviderSecrets: false,
      exposesProviderErrors: false,
      exposesRawAnonymousTokens: false,
      exposesRawUserEmails: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswers: false,
      exposesStudentIdentifiers: false,
      exposesTeacherPrivateActivityContent: false,
      itemIds: [...ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      keepsAccountSettingsFromMutatingClassroomData: true,
      keepsAdminActionsAwayFromClassroomLinks: true,
      keepsRuntimeSecretsServerSide: true,
      requiresAdminRoleForUserGovernance: true,
      requiresTeacherSessionForAccountSettings: true,
      sourceFiles: [...ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES],
      usesClassGamifyAccountCopy: true,
      usesPaymentCallbackHandoff: true,
    },
    title: 'Account governance lifecycle chain',
  };
}

function buildAccountGovernanceLifecycleChainHandoffItemView(
  id: AccountGovernanceLifecycleChainHandoffItemId
): AccountGovernanceLifecycleChainHandoffItemView {
  const item = getAccountGovernanceLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAccountGovernanceLifecycleChainHandoffItem(
  id: AccountGovernanceLifecycleChainHandoffItemId
): Omit<AccountGovernanceLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-account-boundary':
      return item(
        id,
        'Product account boundary',
        'Teacher account lifecycle',
        'Account surfaces protect the teacher workspace that owns activities, assignment links, attempts, results, and source materials.'
      );
    case 'auth-session-runtime':
      return item(
        id,
        'Auth session runtime',
        'Better Auth + D1',
        'Better Auth sessions use D1-backed server configuration and TanStack cookies.'
      );
    case 'email-verification-gate':
      return item(
        id,
        'Email verification gate',
        'Verified teachers only',
        'Protected teacher workspace routes and APIs require an authenticated, verified teacher.'
      );
    case 'safe-callback-redirect':
      return item(
        id,
        'Safe callback redirect',
        DEFAULT_LOGIN_REDIRECT,
        'Auth redirect handling falls back to the dashboard instead of reflecting unsafe callback paths.'
      );
    case 'credential-login-provider':
      return item(
        id,
        'Credential login provider',
        'Feature gated',
        'Email/password login, password updates, and reset actions follow the configured credential gate.'
      );
    case 'google-oauth-provider':
      return item(
        id,
        'Google OAuth provider',
        'Runtime secret gated',
        'Google sign-in is available only when enabled and runtime OAuth secrets exist.'
      );
    case 'google-one-tap-provider':
      return item(
        id,
        'Google One Tap provider',
        'Auth routes skipped',
        'One Tap uses the public client id only after server-side provider availability checks.'
      );
    case 'auth-error-recovery':
      return item(
        id,
        'Auth error recovery',
        Routes.Login,
        'Auth errors route teachers back to safe login and workspace recovery actions.'
      );
    case 'profile-route':
      return item(
        id,
        'Profile route',
        Routes.SettingsProfile,
        'Profile settings are the teacher identity surface inside the authenticated workspace.'
      );
    case 'profile-identity-update':
      return item(
        id,
        'Profile identity update',
        'Display name only',
        'Display name updates affect teacher identity without rewriting classroom content.'
      );
    case 'profile-avatar-update':
      return item(
        id,
        'Profile avatar update',
        'Avatar only',
        'Avatar updates stay in account identity and file boundaries.'
      );
    case 'profile-no-classroom-mutation':
      return item(
        id,
        'Profile mutation boundary',
        'No classroom mutation',
        'Profile settings do not edit activities, assignment snapshots, public links, attempts, or results.'
      );
    case 'security-route':
      return item(
        id,
        'Security route',
        Routes.SettingsSecurity,
        'Security settings handle credentials, sessions, connected providers, and account deletion.'
      );
    case 'password-update-gate':
      return item(
        id,
        'Password update gate',
        'Credential gate',
        'Password controls render only when credential login is configured.'
      );
    case 'password-reset-mail':
      return item(
        id,
        'Password reset mail',
        'Forgot-password email',
        'Password reset sends the localized transactional mail template through the mail provider boundary.'
      );
    case 'account-delete-feature-gate':
      return item(
        id,
        'Account deletion feature gate',
        'Feature gated',
        'Delete-account UI follows the configured Better Auth delete-user feature gate.'
      );
    case 'delete-confirmation-required':
      return item(
        id,
        'Delete confirmation required',
        'Explicit confirmation',
        'Teacher deletion requires an explicit confirmation dialog before the delete request.'
      );
    case 'delete-no-silent-data-loss':
      return item(
        id,
        'No silent data loss',
        'No implicit classroom deletion',
        'The account governance handoff never promises silent deletion of classroom activities, links, snapshots, attempts, results, files, or billing records.'
      );
    case 'admin-route-gate':
      return item(
        id,
        'Admin route gate',
        Routes.AdminUsers,
        'Admin user governance pages require an authenticated admin role.'
      );
    case 'admin-api-gate':
      return item(
        id,
        'Admin API gate',
        '401/403 protected',
        'Admin server functions return unauthorized or forbidden JSON instead of exposing user governance data.'
      );
    case 'admin-user-list-query':
      return item(
        id,
        'Admin user list query',
        'Search/filter/sort/page',
        'Admin user list queries normalize search, role, status, sort, and pagination.'
      );
    case 'admin-user-ban-actions':
      return item(
        id,
        'Admin user ban actions',
        'Ban/unban only',
        'Admin user actions govern account access without changing classroom content or assignment links.'
      );
    case 'billing-payment-callback-boundary':
      return item(
        id,
        'Billing payment callback boundary',
        'Billing + callback',
        'Hosted billing and payment callback status refresh plan access without exposing provider sessions or mutating classroom records.'
      );
    case 'notification-email-preference':
      return item(
        id,
        'Notification email preference',
        Routes.SettingsNotifications,
        'Notification settings control teacher product emails, not student reminders.'
      );
    case 'files-owner-scope-boundary':
      return item(
        id,
        'Files owner scope boundary',
        Routes.SettingsFiles,
        'Source-material files stay owner scoped and summarized without exposing private filenames or storage keys.'
      );
    case 'storage-private-owner-check':
      return item(
        id,
        'Storage private owner check',
        'Private owner required',
        'Same-origin file access requires owner checks for private user files.'
      );
    case 'provider-secret-guard':
      return item(
        id,
        'Provider secret guard',
        'Runtime secrets hidden',
        'OAuth, auth, mail, payment, AI, newsletter, and notification secrets remain server-side.'
      );
    case 'student-data-guard':
      return item(
        id,
        'Student data guard',
        'Student data hidden',
        'Account governance handoffs omit student answers, raw anonymous tokens, identifiers, and private result rows.'
      );
    case 'legacy-copy-guard':
      return item(
        id,
        'Legacy copy guard',
        'ClassGamify only',
        'Account lifecycle copy stays tied to teacher workspace access instead of copied starter or learning-site terms.'
      );
    case 'account-governance-chain-gate':
      return item(
        id,
        'Account governance chain gate',
        '30 source files',
        'A focused gate keeps auth, profile, security, deletion, admin user, billing, notification, file, storage, and privacy boundaries aligned.'
      );
  }
}

function item(
  id: AccountGovernanceLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AccountGovernanceLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
