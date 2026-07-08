import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildSettingsAccountWorkspaceHandoffView,
  SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS,
  type SettingsAccountWorkspaceHandoffItemId,
  type SettingsAccountWorkspaceHandoffView,
} from '@/settings/account-handoff';
import { buildSettingsProfilePageViewModel } from '@/settings/profile-view';
import { buildSettingsSecurityPageViewModel } from '@/settings/security-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_AUTH_TOKEN = 'raw-auth-provider-secret';
const SECRET_EMAIL = 'teacher-private@example.test';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const PROFILE_WORKSPACE_SUMMARY_SOURCE = readFileSync(
  'src/components/settings/profile/profile-workspace-summary.tsx',
  'utf8'
);
const SECURITY_WORKSPACE_SUMMARY_SOURCE = readFileSync(
  'src/components/settings/security/security-workspace-summary.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('account settings handoff exposes 30 safe teacher-account slices', () => {
  const handoffView = buildSettingsAccountWorkspaceHandoffView({
    credentialLoginEnabled: true,
    deleteAccountEnabled: false,
    page: 'security',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS]);
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
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    itemIds,
    modifiesAssignmentSnapshots: false,
    modifiesStudentAttempts: false,
    scope: 'teacher-account-settings',
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['account-scope', 'Teacher account settings'],
      ['profile-page', 'Available page'],
      ['security-page', 'Current page'],
      ['account-access', 'Authenticated workspace'],
      ['profile-display-name', 'Name'],
      ['profile-avatar', 'Avatar'],
      ['activity-author-identity', 'Activities'],
      ['assignment-handoff-identity', 'Assignment links'],
      ['student-recognition', 'Student recognition'],
      ['result-review-identity', 'Results'],
      ['credential-login-gate', 'Enabled'],
      ['password-card', 'Enabled'],
      ['password-update-action', 'Prepared'],
      ['password-reset-action', 'Prepared'],
      ['account-deletion-gate', 'Not configured'],
      ['account-delete-action', 'Not configured'],
      ['delete-confirmation-boundary', 'Explicit confirmation'],
      ['session-boundary', 'Authenticated workspace'],
      ['owner-scope', 'Teacher-owned'],
      ['source-material-boundary', 'Private references'],
      ['assignment-link-boundary', 'No link changes'],
      ['student-result-boundary', 'Private records'],
      ['public-runner-boundary', 'Sanitized payload'],
      ['auth-provider-boundary', 'Configured providers'],
      ['email-visibility', 'Not exposed'],
      ['raw-secret-guard', 'Not exposed'],
      ['student-token-guard', 'Not exposed'],
      ['storage-key-guard', 'Server-side only'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateAccountHandoffText(JSON.stringify(handoffView));
});

test('profile and security settings attach account handoff views', () => {
  const profilePageView = buildSettingsProfilePageViewModel();
  const securityPageView = buildSettingsSecurityPageViewModel();

  assert.deepEqual(
    profilePageView.workspaceSummaryView.handoffView.itemViews.map(
      (item) => item.id
    ),
    [...SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS]
  );
  assert.deepEqual(
    securityPageView.workspaceSummaryView.handoffView.itemViews.map(
      (item) => item.id
    ),
    [...SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffItemValue(
      profilePageView.workspaceSummaryView.handoffView,
      'profile-page'
    ),
    'Current page'
  );
  assert.equal(
    getHandoffItemValue(
      securityPageView.workspaceSummaryView.handoffView,
      'security-page'
    ),
    'Current page'
  );
  assertNoPrivateAccountHandoffText(
    JSON.stringify(profilePageView.workspaceSummaryView.handoffView)
  );
  assertNoPrivateAccountHandoffText(
    JSON.stringify(securityPageView.workspaceSummaryView.handoffView)
  );
});

test('profile and security account handoffs render stable semantic outputs', () => {
  for (const [sourceName, source] of [
    ['profile', PROFILE_WORKSPACE_SUMMARY_SOURCE],
    ['security', SECURITY_WORKSPACE_SUMMARY_SOURCE],
  ] as const) {
    assert.match(
      source,
      /<AccountWorkspaceHandoff handoffView=\{view\.handoffView\} \/>[\s\S]*data-handoff="settings-account-workspace"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*handoffView\.itemViews\.map[\s\S]*AccountWorkspaceHandoffItem[\s\S]*const labelId = `settings-account-workspace-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `settings-account-workspace-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `settings-account-workspace-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
      `${sourceName} account handoff should render marker, privacy scope, item ids, and stable label/value/description relationships.`
    );
  }
  assert.match(
    TEST_CATALOG_SOURCE,
    /Settings account workspace handoff has a fast script-level gate via[\s\S]*scripts\/settings-account-workspace-handoff-semantic-views\.test\.ts[\s\S]*teacher identity scope[\s\S]*settings-account-workspace handoff/,
    'E2E catalog should document the settings account handoff focused gate.'
  );
});

test('account settings handoff localizes Chinese account boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildSettingsAccountWorkspaceHandoffView({
      credentialLoginEnabled: true,
      deleteAccountEnabled: true,
      page: 'profile',
    });

    assert.equal(handoffView.title, '账号工作区交接');
    assert.equal(
      getHandoffItemValue(handoffView, 'account-scope'),
      '教师账号设置'
    );
    assert.equal(getHandoffItemValue(handoffView, 'profile-page'), '当前页面');
    assert.equal(getHandoffItemValue(handoffView, 'security-page'), '可用页面');
    assert.equal(
      getHandoffItemValue(handoffView, 'credential-login-gate'),
      '已启用'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'account-delete-action'),
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
    assertNoPrivateAccountHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffItemValue(
  view: SettingsAccountWorkspaceHandoffView,
  id: SettingsAccountWorkspaceHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing account handoff item ${id}`);
  return item.value;
}

function assertNoPrivateAccountHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_AUTH_TOKEN,
    SECRET_EMAIL,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Account handoff leaked private text: ${privateValue}`
    );
  }
}
