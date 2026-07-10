import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildAccountGovernanceLifecycleChainHandoffView,
  type AccountGovernanceLifecycleChainHandoffItemId,
  type AccountGovernanceLifecycleChainHandoffView,
} from '@/auth/account-governance-lifecycle-chain';
import { AUTH_ERROR_RECOVERY_STEP_IDS } from '@/auth/error-recovery';
import { AUTH_WORKSPACE_HANDOFF_ITEM_IDS } from '@/auth/workspace-boundary';
import { Routes } from '@/lib/routes';
import { ADMIN_USERS_HANDOFF_ITEM_IDS } from '@/admin/users-view';
import { SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/account-handoff';
import { SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/billing-view';
import { SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS } from '@/settings/files-view';
import { SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS } from '@/settings/notifications-view';
import { SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/security-handoff';
import { STORAGE_FILE_ACCESS_ITEM_IDS } from '@/storage/file-access';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const AUTH_DOC_SOURCE = readFileSync('docs/auth.md', 'utf8');
const CONFIGURATION_DOC_SOURCE = readFileSync('docs/configuration.md', 'utf8');
const AUTH_SERVER_SOURCE = readFileSync('src/auth/auth.ts', 'utf8');
const AUTH_CLIENT_SOURCE = readFileSync('src/auth/client.ts', 'utf8');
const PROVIDER_STATUS_SOURCE = readFileSync(
  'src/auth/provider-status.ts',
  'utf8'
);
const AUTH_WORKSPACE_SOURCE = readFileSync(
  'src/auth/workspace-boundary.ts',
  'utf8'
);
const AUTH_ERROR_SOURCE = readFileSync('src/auth/error-recovery.ts', 'utf8');
const AUTH_PLUGIN_COPY_SOURCE = readFileSync('src/auth/plugin-copy.ts', 'utf8');
const AUTH_MIDDLEWARE_SOURCE = readFileSync(
  'src/middlewares/auth-middleware.ts',
  'utf8'
);
const ADMIN_MIDDLEWARE_SOURCE = readFileSync(
  'src/middlewares/admin-middleware.ts',
  'utf8'
);
const SETTINGS_ACCOUNT_SOURCE = readFileSync(
  'src/settings/account-handoff.ts',
  'utf8'
);
const SETTINGS_SECURITY_SOURCE = readFileSync(
  'src/settings/security-handoff.ts',
  'utf8'
);
const PROFILE_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/profile.tsx',
  'utf8'
);
const SECURITY_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/security.tsx',
  'utf8'
);
const DELETE_ACCOUNT_SOURCE = readFileSync(
  'src/components/settings/security/delete-account-card.tsx',
  'utf8'
);
const ADMIN_USERS_API_SOURCE = readFileSync('src/api/users.ts', 'utf8');
const ADMIN_USERS_QUERY_SOURCE = readFileSync(
  'src/admin/users-query.ts',
  'utf8'
);
const ADMIN_USERS_VIEW_SOURCE = readFileSync('src/admin/users-view.ts', 'utf8');
const ADMIN_USERS_ROUTE_SOURCE = readFileSync(
  'src/routes/admin/users.tsx',
  'utf8'
);
const BILLING_SOURCE = readFileSync('src/settings/billing-view.ts', 'utf8');
const NOTIFICATION_SOURCE = readFileSync(
  'src/settings/notifications-view.ts',
  'utf8'
);
const FILES_SOURCE = readFileSync('src/settings/files-view.ts', 'utf8');
const STORAGE_FILE_ACCESS_SOURCE = readFileSync(
  'src/storage/file-access.ts',
  'utf8'
);
const WEBSITE_CONFIG_SOURCE = readFileSync('src/config/website.ts', 'utf8');
const AUTH_SCHEMA_SOURCE = readFileSync('src/db/auth.schema.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ADMIN_SEARCH = 'SECRET_ACCOUNT_GOVERNANCE_ADMIN_SEARCH_TEXT';
const PRIVATE_AUTH_SECRET = 'SECRET_ACCOUNT_GOVERNANCE_AUTH_SECRET';
const PRIVATE_OAUTH_SECRET = 'SECRET_ACCOUNT_GOVERNANCE_OAUTH_SECRET';
const PRIVATE_PASSWORD = 'SECRET_ACCOUNT_GOVERNANCE_PASSWORD_VALUE';
const PRIVATE_PAYMENT_SECRET = 'SECRET_ACCOUNT_GOVERNANCE_PAYMENT_SECRET';
const PRIVATE_PROVIDER_ERROR = 'SECRET_ACCOUNT_GOVERNANCE_PROVIDER_ERROR';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/account-governance.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_ACCOUNT_GOVERNANCE_STUDENT_ANSWER';
const PRIVATE_STUDENT_IDENTIFIER =
  'SECRET_ACCOUNT_GOVERNANCE_STUDENT_IDENTIFIER';
const PRIVATE_STUDENT_TOKEN = 'SECRET_ACCOUNT_GOVERNANCE_RAW_ANONYMOUS_TOKEN';
const PRIVATE_TEACHER_CONTENT =
  'SECRET_ACCOUNT_GOVERNANCE_TEACHER_ACTIVITY_CONTENT';
const PRIVATE_USER_EMAIL = 'account-governance-private@example.test';

test('account governance lifecycle chain exposes 30 safe lifecycle slices', () => {
  const handoffView = buildAccountGovernanceLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Account governance lifecycle chain');
  assert.match(
    handoffView.description,
    /Thirty-slice teacher account governance and lifecycle chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
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
    itemIds,
    keepsAccountSettingsFromMutatingClassroomData: true,
    keepsAdminActionsAwayFromClassroomLinks: true,
    keepsRuntimeSecretsServerSide: true,
    requiresAdminRoleForUserGovernance: true,
    requiresTeacherSessionForAccountSettings: true,
    sourceFiles: [...ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES],
    usesClassGamifyAccountCopy: true,
  });
  assertNoPrivateAccountGovernanceText(JSON.stringify(handoffView));
});

test('account governance lifecycle chain summarizes auth through admin and settings flow', () => {
  const handoffView = buildAccountGovernanceLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-account-boundary', 'Teacher account lifecycle'],
      ['auth-session-runtime', 'Better Auth + D1'],
      ['email-verification-gate', 'Verified teachers only'],
      ['safe-callback-redirect', Routes.Dashboard],
      ['credential-login-provider', 'Feature gated'],
      ['google-oauth-provider', 'Runtime secret gated'],
      ['google-one-tap-provider', 'Auth routes skipped'],
      ['auth-error-recovery', Routes.Login],
      ['profile-route', Routes.SettingsProfile],
      ['profile-identity-update', 'Display name only'],
      ['profile-avatar-update', 'Avatar only'],
      ['profile-no-classroom-mutation', 'No classroom mutation'],
      ['security-route', Routes.SettingsSecurity],
      ['password-update-gate', 'Credential gate'],
      ['password-reset-mail', 'Forgot-password email'],
      ['account-delete-feature-gate', 'Feature gated'],
      ['delete-confirmation-required', 'Explicit confirmation'],
      ['delete-no-silent-data-loss', 'No implicit classroom deletion'],
      ['admin-route-gate', Routes.AdminUsers],
      ['admin-api-gate', '401/403 protected'],
      ['admin-user-list-query', 'Search/filter/sort/page'],
      ['admin-user-ban-actions', 'Ban/unban only'],
      ['billing-plan-access-boundary', Routes.SettingsBilling],
      ['notification-email-preference', Routes.SettingsNotifications],
      ['files-owner-scope-boundary', Routes.SettingsFiles],
      ['storage-private-owner-check', 'Private owner required'],
      ['provider-secret-guard', 'Runtime secrets hidden'],
      ['student-data-guard', 'Student data hidden'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['account-governance-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'profile-route'),
    Routes.SettingsProfile
  );
  assert.equal(
    getHandoffValue(handoffView, 'security-route'),
    Routes.SettingsSecurity
  );
  assert.equal(
    getHandoffValue(handoffView, 'admin-route-gate'),
    Routes.AdminUsers
  );
});

test('account governance lifecycle chain is backed by focused governance gates', () => {
  assert.equal(ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACCOUNT_GOVERNANCE_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing account governance lifecycle chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      AUTH_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS.length,
      ADMIN_USERS_HANDOFF_ITEM_IDS.length,
      SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS.length,
      SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS.length,
      STORAGE_FILE_ACCESS_ITEM_IDS.length,
    ],
    Array.from({ length: 8 }, () => 30)
  );
  assert.ok(
    AUTH_ERROR_RECOVERY_STEP_IDS.length >= 3,
    'Auth error recovery should keep multiple safe recovery steps.'
  );
});

test('account governance lifecycle docs preserve account and runtime boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /active account\/contact copy[\s\S]*current forms, billing pages, and[\s\S]*configuration examples should speak in ClassGamify terms/i,
    'docs/product.md should keep account surfaces in ClassGamify terms.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /The authenticated teacher dashboard should use owner-scoped activity and[\s\S]*assignment summaries/i,
    'docs/product.md should keep authenticated workspace data owner scoped.'
  );
  assert.match(
    AUTH_DOC_SOURCE,
    /auth secrets protect the ClassGamify teacher workspace, saved[\s\S]*activities, assignment links, source materials, attempts, and results/i,
    'docs/auth.md should tie auth secrets to the teacher workspace data model.'
  );
  assert.match(
    AUTH_DOC_SOURCE,
    /freshness check disabled to allow user deletion/i,
    'docs/auth.md should document user-deletion freshness behavior.'
  );
  assert.match(
    CONFIGURATION_DOC_SOURCE,
    /Authentication gates the teacher workspace[\s\S]*Better Auth uses the D1 `DB`[\s\S]*runtime secrets/i,
    'docs/configuration.md should keep auth, D1, and runtime secrets connected.'
  );
  assert.match(
    CONFIGURATION_DOC_SOURCE,
    /Student assignment payloads should expose sanitized runtime prompts[\s\S]*should not expose teacher source-material[\s\S]*payment metadata, OAuth metadata, or server-only[\s\S]*provider settings/i,
    'docs/configuration.md should keep student payloads out of account/provider data.'
  );
});

test('account governance lifecycle sources preserve auth and account settings boundaries', () => {
  assert.match(
    AUTH_SERVER_SOURCE,
    /emailAndPassword:[\s\S]*requireEmailVerification: true[\s\S]*sendResetPassword:[\s\S]*template: 'forgotPassword'/,
    'Auth server should require email verification and route password reset through mail.'
  );
  assert.match(
    AUTH_SERVER_SOURCE,
    /emailVerification:[\s\S]*sendVerificationEmail:[\s\S]*template: 'verifyEmail'/,
    'Auth server should route verification email through mail.'
  );
  assert.match(
    AUTH_SERVER_SOURCE,
    /freshAge: 0[\s\S]*deleteUser:[\s\S]*enabled: websiteConfig\.auth\?\.enableDeleteAccount/,
    'Auth server should gate account deletion via website configuration.'
  );
  assert.match(
    AUTH_SERVER_SOURCE,
    /admin\([\s\S]*defaultBanReason: getAuthDefaultBanReason\(\)[\s\S]*bannedUserMessage: getAuthBannedUserMessage\(\)/,
    'Auth server should use localized admin ban copy.'
  );
  assert.match(
    AUTH_CLIENT_SOURCE,
    /adminClient\(\)[\s\S]*apiKeyClient\(\)[\s\S]*inferAdditionalFields<typeof auth>\(\)/,
    'Auth client should keep admin, API key, and typed user fields configured.'
  );
  assert.match(
    PROVIDER_STATUS_SOURCE,
    /enableGoogleLogin[\s\S]*GOOGLE_CLIENT_ID[\s\S]*GOOGLE_CLIENT_SECRET[\s\S]*googleOneTapClientId/,
    'Provider status should expose One Tap client id only after runtime Google availability checks.'
  );
  assert.match(
    AUTH_WORKSPACE_SOURCE,
    /createsAssignmentLinks: false[\s\S]*exposesAuthSecrets: false[\s\S]*exposesPassword: false[\s\S]*modifiesActivityContent: false[\s\S]*requiresTeacherSessionForWorkspace: true/,
    'Auth workspace handoff should protect account entry without mutating classroom data.'
  );
  assert.match(
    AUTH_ERROR_SOURCE,
    /retry-sign-in[\s\S]*check-email[\s\S]*protect-workspace/,
    'Auth error recovery should remain safe and user-facing.'
  );
  assert.match(
    AUTH_PLUGIN_COPY_SOURCE,
    /getAuthBannedUserMessage[\s\S]*m\.auth_banned_user_message[\s\S]*getAuthDefaultBanReason[\s\S]*m\.admin_users_ban_default_reason/,
    'Auth plugin copy should use localized account governance messages.'
  );
  assert.match(
    AUTH_MIDDLEWARE_SOURCE,
    /auth\.api\.getSession[\s\S]*Routes\.Login[\s\S]*email_not_verified/,
    'Auth middleware should require session and verified teacher email.'
  );
  assert.match(
    SETTINGS_ACCOUNT_SOURCE,
    /deletesWorkspaceDataWithoutExplicitAction: false[\s\S]*changesActivityContent: false[\s\S]*changesPublicAssignmentLinks: false[\s\S]*exposesTeacherEmail: false/,
    'Account settings should avoid silent data deletion and classroom mutation.'
  );
  assert.match(
    SETTINGS_SECURITY_SOURCE,
    /deletesWorkspaceDataWithoutExplicitAction: false[\s\S]*exposesPasswordValues: false[\s\S]*requiresAuthenticatedTeacher: true/,
    'Security settings should protect password values and require an authenticated teacher.'
  );
  assert.match(
    PROFILE_ROUTE_SOURCE,
    /ProfileWorkspaceSummary[\s\S]*UpdateNameCard[\s\S]*UpdateAvatarCard/,
    'Profile route should expose only teacher identity update cards.'
  );
  assert.match(
    SECURITY_ROUTE_SOURCE,
    /credentialLoginEnabled[\s\S]*PasswordCardWrapper[\s\S]*deleteAccountEnabled[\s\S]*DeleteAccountCard/,
    'Security route should gate password and delete controls by settings view model flags.'
  );
  assert.match(
    DELETE_ACCOUNT_SOURCE,
    /authClient\.deleteUser[\s\S]*setShowConfirmation\(true\)[\s\S]*AlertDialog[\s\S]*onClick=\{handleDeleteAccount\}[\s\S]*settings_security_delete_account_confirm/,
    'Delete account UI should require explicit confirmation before deleteUser.'
  );
});

test('account governance lifecycle sources preserve admin, storage, and provider boundaries', () => {
  assert.match(
    ADMIN_MIDDLEWARE_SOURCE,
    /const ADMIN_ROLE = 'admin'[\s\S]*Routes\.Login[\s\S]*Routes\.Dashboard[\s\S]*unauthorizedResponse[\s\S]*forbiddenResponse/,
    'Admin middleware should gate route and API access with admin role checks.'
  );
  assert.match(
    ADMIN_USERS_API_SOURCE,
    /listUsers[\s\S]*\.middleware\(\[adminApiMiddleware\]\)[\s\S]*buildAdminUserListWhere[\s\S]*buildAdminUserListOrderBy[\s\S]*getAdminUserListOffset/,
    'Admin users server function should be admin-gated and reuse query helpers.'
  );
  assert.match(
    ADMIN_USERS_QUERY_SOURCE,
    /(?=[\s\S]*ADMIN_USER_LIST_INPUT_LIMITS)(?=[\s\S]*pageSizeMax: 100)(?=[\s\S]*buildAdminUserListWhere)(?=[\s\S]*buildSqlLikeContainsPattern)(?=[\s\S]*buildAdminUserListOrderBy)(?=[\s\S]*getAdminUserListOffset)/,
    'Admin user query helpers should normalize search, role/status, sorting, and bounded paging.'
  );
  assert.match(
    ADMIN_USERS_VIEW_SOURCE,
    /changesActivityContent: false[\s\S]*changesAssignmentLinks: false[\s\S]*exposesSearchText: false[\s\S]*exposesUserEmails: false/,
    'Admin users handoff should avoid exposing search text, emails, or classroom data.'
  );
  assert.match(
    ADMIN_USERS_ROUTE_SOURCE,
    /buildAdminUsersPageViewModel[\s\S]*AdminUsersContent/,
    'Admin users route should render the governed user page view model.'
  );
  assert.match(
    BILLING_SOURCE,
    /changesActivityContent: false[\s\S]*changesAssignmentLinks: false[\s\S]*exposesPaymentProviderSecrets: false[\s\S]*hostedBillingOnly: true/,
    'Billing should preserve hosted provider boundaries without classroom data mutation.'
  );
  assert.match(
    NOTIFICATION_SOURCE,
    /updatesTeacherProductEmailOnly: true[\s\S]*notifiesLearners: false[\s\S]*sendsStudentAssignmentReminders: false/,
    'Notification settings should remain teacher product-email preferences.'
  );
  assert.match(
    FILES_SOURCE,
    /(?=[\s\S]*tracksOwnerScopedUserFiles: true)(?=[\s\S]*storageKeysStayServerSide: true)(?=[\s\S]*publicPayloadIncludesFileList: false)/,
    'Files settings should keep source-material user files owner scoped.'
  );
  assert.match(
    STORAGE_FILE_ACCESS_SOURCE,
    /(?=[\s\S]*requiresOwnerForPrivateUserFiles: true)(?=[\s\S]*exposesStorageKeysToStudentPayloads: false)(?=[\s\S]*returnsNoStoreForPrivateFiles: true)/,
    'Storage file access should require owner checks and keep private files no-store.'
  );
  assert.match(
    WEBSITE_CONFIG_SOURCE,
    /(?=[\s\S]*enableCredentialLogin)(?=[\s\S]*enableGoogleLogin)(?=[\s\S]*enableDeleteAccount)/,
    'Website config should keep account lifecycle features behind explicit flags.'
  );
  assert.match(
    AUTH_SCHEMA_SOURCE,
    /role:[\s\S]*banned:[\s\S]*banReason:[\s\S]*banExpires:[\s\S]*normalizedEmail:/,
    'Auth schema should include admin-governed role, ban, and normalized email fields.'
  );
});

test('account governance lifecycle chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Account governance lifecycle chain has a fast script-level gate via[\s\S]*scripts\/account-governance-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the account governance lifecycle chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /auth session and email verification[\s\S]*profile and security settings[\s\S]*explicit account deletion[\s\S]*admin user governance[\s\S]*billing\/notification\/files boundaries[\s\S]*storage owner checks[\s\S]*provider-secret and student-data guards/,
    'TEST-CATALOG should describe the full account governance lifecycle chain scope.'
  );
});

function getHandoffValue(
  view: AccountGovernanceLifecycleChainHandoffView,
  id: AccountGovernanceLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing account governance lifecycle chain item ${id}`);
  return item.value;
}

function assertNoPrivateAccountGovernanceText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ADMIN_SEARCH,
    PRIVATE_AUTH_SECRET,
    PRIVATE_OAUTH_SECRET,
    PRIVATE_PASSWORD,
    PRIVATE_PAYMENT_SECRET,
    PRIVATE_PROVIDER_ERROR,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_IDENTIFIER,
    PRIVATE_STUDENT_TOKEN,
    PRIVATE_TEACHER_CONTENT,
    PRIVATE_USER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Account governance lifecycle chain leaked private text: ${privateValue}`
    );
  }
}
