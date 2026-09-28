import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { AUTH_ERROR_RECOVERY_STEP_IDS } from '@/auth/error-recovery';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const AUTH_DOC_SOURCE = readFileSync('docs/auth.md', 'utf8');
const CONFIGURATION_DOC_SOURCE = readFileSync('docs/configuration.md', 'utf8');
const AUTH_SERVER_SOURCE = readFileSync('src/auth/auth.ts', 'utf8');
const AUTH_CLIENT_SOURCE = readFileSync('src/auth/client.ts', 'utf8');
const PROVIDER_STATUS_SOURCE = readFileSync(
  'src/auth/provider-status.ts',
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
const ADMIN_USERS_ROUTE_SOURCE = readFileSync(
  'src/routes/admin/users.tsx',
  'utf8'
);
const STORAGE_FILE_ACCESS_SOURCE = readFileSync(
  'src/storage/file-access.ts',
  'utf8'
);
const WEBSITE_CONFIG_SOURCE = readFileSync('src/config/website.ts', 'utf8');
const AUTH_SCHEMA_SOURCE = readFileSync('src/db/auth.schema.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('account governance lifecycle chain is backed by focused governance gates', () => {
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
    PROFILE_ROUTE_SOURCE,
    /UpdateNameCard[\s\S]*UpdateAvatarCard/,
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
    ADMIN_USERS_ROUTE_SOURCE,
    /buildAdminUsersPageViewModel[\s\S]*AdminUsersContent/,
    'Admin users route should render the governed user page view model.'
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
    PRODUCT_SOURCE,
    /account governance lifecycle[\s\S]*security workspace[\s\S]*credential controls[\s\S]*explicit account deletion[\s\S]*must not expose passwords[\s\S]*must not silently mutate or delete classroom records/,
    'docs/product.md should describe the security workspace and classroom-record boundary.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Account governance lifecycle chain has a fast script-level gate via[\s\S]*scripts\/account-governance-lifecycle-chain\.test\.ts/,
    'TEST-CATALOG should document the account governance lifecycle chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /auth session and email verification[\s\S]*profile and security settings[\s\S]*explicit account deletion[\s\S]*admin user governance[\s\S]*billing\/payment callback\/notification\/files boundaries[\s\S]*storage owner checks[\s\S]*provider-secret and student-data guards/,
    'TEST-CATALOG should describe the full account governance lifecycle chain scope.'
  );
});
