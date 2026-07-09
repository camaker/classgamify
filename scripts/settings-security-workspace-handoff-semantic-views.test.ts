import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildSettingsSecurityWorkspaceHandoffView,
  SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS,
  type SettingsSecurityWorkspaceHandoffItemId,
  type SettingsSecurityWorkspaceHandoffView,
} from '@/settings/security-handoff';
import { buildSettingsSecurityWorkspaceSummaryView } from '@/settings/security-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_AUTH_SECRET = 'raw-auth-secret-provider-token';
const SECRET_PASSWORD = 'teacher-password-secret';
const SECRET_PROVIDER_ERROR = 'Better Auth raw provider exception';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/security-key.pdf';
const SECRET_STUDENT_TOKEN = 'anonymous-student-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

const SECURITY_SUMMARY_SOURCE = readFileSync(
  'src/components/settings/security/security-workspace-summary.tsx',
  'utf8'
);
const SECURITY_VIEW_SOURCE = readFileSync(
  'src/settings/security-view.ts',
  'utf8'
);
const UPDATE_PASSWORD_CARD_SOURCE = readFileSync(
  'src/components/settings/security/update-password-card.tsx',
  'utf8'
);
const DELETE_ACCOUNT_CARD_SOURCE = readFileSync(
  'src/components/settings/security/delete-account-card.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('settings security workspace handoff exposes 30 safe security slices', () => {
  const handoffView = buildSettingsSecurityWorkspaceHandoffView({
    credentialLoginEnabled: true,
    deleteAccountEnabled: false,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS]);
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
    itemIds,
    modifiesAssignmentSnapshots: false,
    modifiesStudentAttempts: false,
    requiresAuthenticatedTeacher: true,
    scope: 'settings-security-workspace-boundary',
  });
  assertNoPrivateSecurityHandoffText(JSON.stringify(handoffView));
});

test('settings security workspace handoff summarizes configured controls and data boundaries', () => {
  const handoffView = buildSettingsSecurityWorkspaceHandoffView({
    credentialLoginEnabled: true,
    deleteAccountEnabled: false,
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['security-scope', 'Workspace security boundary'],
      ['authenticated-workspace', 'Authenticated workspace'],
      ['credential-login-gate', 'Enabled'],
      ['password-card', 'Enabled'],
      ['current-password-field', 'Prepared'],
      ['new-password-field', 'Prepared'],
      ['password-visibility-controls', 'Screen-reader labelled'],
      ['password-update-action', 'Prepared'],
      ['password-reset-boundary', 'Prepared'],
      ['user-accounts-query', 'Prepared'],
      ['provider-account-boundary', 'Configured providers'],
      ['session-boundary', 'Authenticated workspace'],
      ['account-deletion-gate', 'Not configured'],
      ['delete-warning', 'Explicit confirmation'],
      ['delete-confirmation-dialog', 'Explicit confirmation'],
      ['delete-explicit-action', 'Not configured'],
      ['activity-library-protection', 'Activities'],
      ['source-material-protection', 'Private references'],
      ['assignment-link-protection', 'No link changes'],
      ['assignment-snapshot-protection', 'Snapshots unchanged'],
      ['student-result-protection', 'Private records'],
      ['public-runner-boundary', 'Sanitized payload'],
      ['billing-access-boundary', '/settings/billing'],
      ['owner-scope', 'Teacher-owned'],
      ['auth-secret-guard', 'Not exposed'],
      ['password-value-guard', 'Not exposed'],
      ['teacher-email-guard', 'Not exposed'],
      ['raw-error-guard', 'Not exposed'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateSecurityHandoffText(JSON.stringify(handoffView));
});

test('settings security summary attaches the dedicated security handoff view', () => {
  const summaryView = buildSettingsSecurityWorkspaceSummaryView({
    credentialLoginEnabled: true,
    deleteAccountEnabled: true,
  });

  assert.deepEqual(
    summaryView.securityHandoffView.itemViews.map((item) => item.id),
    [...SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffItemValue(
      summaryView.securityHandoffView,
      'credential-login-gate'
    ),
    'Enabled'
  );
  assert.equal(
    getHandoffItemValue(
      summaryView.securityHandoffView,
      'delete-explicit-action'
    ),
    'Explicit only'
  );
  assertNoPrivateSecurityHandoffText(
    JSON.stringify(summaryView.securityHandoffView)
  );
});

test('settings security workspace handoff localizes Chinese security boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildSettingsSecurityWorkspaceHandoffView({
      credentialLoginEnabled: true,
      deleteAccountEnabled: true,
    });

    assert.equal(handoffView.title, '工作区安全边界');
    assert.equal(
      getHandoffItemValue(handoffView, 'security-scope'),
      '工作区安全边界'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'credential-login-gate'),
      '已启用'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'delete-explicit-action'),
      '仅显式操作'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'legacy-copy-guard'),
      '仅 ClassGamify'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );
    assertNoPrivateSecurityHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('settings security workspace handoff renders hidden stable DOM relationships', () => {
  assert.match(
    SECURITY_VIEW_SOURCE,
    /securityHandoffView: buildSettingsSecurityWorkspaceHandoffView\(\{[\s\S]*credentialLoginEnabled[\s\S]*deleteAccountEnabled[\s\S]*\}\)/,
    'Settings security page view should attach the dedicated security handoff from prepared config flags.'
  );
  assert.match(
    SECURITY_SUMMARY_SOURCE,
    /<SettingsSecurityWorkspaceHandoff[\s\S]*handoffView=\{view\.securityHandoffView\}[\s\S]*className="sr-only"[\s\S]*data-handoff="settings-security-workspace"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*handoffView\.itemViews\.map[\s\S]*SettingsSecurityWorkspaceHandoffItem[\s\S]*const labelId = `settings-security-workspace-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `settings-security-workspace-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `settings-security-workspace-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Settings security handoff should render marker, privacy scope, item ids, and stable label/value/description relationships.'
  );
});

test('settings security controls keep localized failures and explicit delete boundaries', () => {
  assert.match(
    UPDATE_PASSWORD_CARD_SOURCE,
    /const message = m\.settings_security_update_password_fail\(\);/,
    'Password update failures should use localized security copy instead of raw auth errors.'
  );
  assert.match(
    DELETE_ACCOUNT_CARD_SOURCE,
    /const message = m\.settings_security_delete_account_fail\(\);/,
    'Delete-account failures should use localized security copy instead of raw auth errors.'
  );
  assert.match(DELETE_ACCOUNT_CARD_SOURCE, /authClient\.deleteUser/);
  assert.match(
    DELETE_ACCOUNT_CARD_SOURCE,
    /settings_security_delete_account_warning/
  );
  assert.match(
    DELETE_ACCOUNT_CARD_SOURCE,
    /settings_security_delete_account_confirm_description[\s\S]*onClick=\{handleDeleteAccount\}/,
    'Delete-account confirmation should explicitly invoke the destructive account deletion client through the confirm button.'
  );
  assertNoPrivateSecurityHandoffText(
    [
      UPDATE_PASSWORD_CARD_SOURCE,
      DELETE_ACCOUNT_CARD_SOURCE,
      SECURITY_SUMMARY_SOURCE,
    ].join('\n')
  );
});

test('settings security workspace focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/settings-security-workspace-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point settings security work at the focused script gate.'
  );
  for (const boundary of [
    'workspace security summary',
    'credential-login gate',
    'password fields',
    'password update action',
    'password reset boundary',
    'connected provider boundary',
    'account deletion gate',
    'delete confirmation dialog',
    'activity and source-material protections',
    'assignment link and snapshot protections',
    'student result protection',
    'settings-security-workspace handoff',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace(/[ -]+/g, '[\\s-]+')),
      `E2E catalog should mention security boundary: ${boundary}`
    );
  }
});

function getHandoffItemValue(
  view: SettingsSecurityWorkspaceHandoffView,
  id: SettingsSecurityWorkspaceHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing security handoff item ${id}`);
  return item.value;
}

function assertNoPrivateSecurityHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_AUTH_SECRET,
    SECRET_PASSWORD,
    SECRET_PROVIDER_ERROR,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Security handoff leaked private text: ${privateValue}`
    );
  }
}
