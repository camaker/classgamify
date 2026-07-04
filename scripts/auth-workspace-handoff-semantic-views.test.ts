import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTH_WORKSPACE_BOUNDARY_ITEM_IDS,
  AUTH_WORKSPACE_HANDOFF_ITEM_IDS,
  buildAuthWorkspaceBoundaryView,
  type AuthWorkspaceBoundaryView,
  type AuthWorkspaceHandoffItemId,
} from '@/auth/workspace-boundary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_CALLBACK_URL = 'https://evil.example/auth?callback=secret';
const SECRET_CLIENT_SECRET = 'google-oauth-client-secret';
const SECRET_PASSWORD = 'teacher-password-value';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ATTEMPT = 'raw-student-attempt-record';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

test('auth workspace handoff exposes 30 safe entry slices', () => {
  const handoffView = buildAuthWorkspaceBoundaryView({
    credentialLoginEnabled: true,
    googleLoginConfigured: true,
    surface: 'login',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(
    handoffView.items.map((item) => item.id),
    [...AUTH_WORKSPACE_BOUNDARY_ITEM_IDS]
  );
  assert.deepEqual(itemIds, [...AUTH_WORKSPACE_HANDOFF_ITEM_IDS]);
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
    itemIds,
    modifiesActivityContent: false,
    modifiesStudentResults: false,
    requiresTeacherSessionForWorkspace: true,
    scope: 'auth-workspace-entry',
    usesSafeCallbackPaths: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['auth-surface', 'Login page'],
      ['teacher-workspace', 'ClassGamify account'],
      ['credential-login-gate', 'Enabled'],
      ['google-login-gate', 'Enabled'],
      ['provider-status-api', 'Runtime checked'],
      ['google-one-tap-boundary', 'Auth routes skipped'],
      ['social-redirect-validation', 'Google code flow'],
      ['callback-url-safety', 'Safe callback'],
      ['default-login-redirect', DEFAULT_LOGIN_REDIRECT],
      ['modal-login-boundary', 'Shared login form'],
      ['login-form', 'Sign In'],
      ['register-form', 'Sign Up'],
      ['forgot-password-form', 'Send reset link'],
      ['reset-password-form', 'Reset password'],
      ['email-field', 'Email'],
      ['password-field', 'Password'],
      ['password-visibility-control', 'Screen-reader labelled'],
      ['password-reset-link', Routes.ResetPassword],
      ['guest-session-redirect', 'Signed-in redirect'],
      ['account-access', 'Account access'],
      ['activity-library', 'Activity library'],
      ['assignment-links', 'Assignment links'],
      ['student-results', 'Student results'],
      ['source-materials', 'Source materials'],
      ['billing-settings', Routes.SettingsBilling],
      ['public-runner-boundary', 'Sanitized payload'],
      ['answer-key-guard', 'Not exposed'],
      ['student-token-guard', 'Not exposed'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateAuthHandoffText(JSON.stringify(handoffView));
});

test('auth workspace handoff keeps disabled providers explicit', () => {
  const handoffView = buildAuthWorkspaceBoundaryView({
    credentialLoginEnabled: false,
    googleLoginConfigured: false,
    surface: 'modal-login',
  });

  assert.equal(handoffView.items.length, 5);
  assert.equal(getHandoffValue(handoffView, 'auth-surface'), 'Login modal');
  assert.equal(
    getHandoffValue(handoffView, 'credential-login-gate'),
    'Not configured'
  );
  assert.equal(
    getHandoffValue(handoffView, 'google-login-gate'),
    'Not configured'
  );
  assert.equal(
    getHandoffValue(handoffView, 'callback-url-safety'),
    'Safe callback'
  );
  assert.equal(
    getHandoffValue(handoffView, 'legacy-copy-guard'),
    'ClassGamify only'
  );
  assertNoPrivateAuthHandoffText(JSON.stringify(handoffView));
});

test('auth workspace handoff localizes Chinese classroom boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAuthWorkspaceBoundaryView({
      credentialLoginEnabled: true,
      googleLoginConfigured: false,
      surface: 'register',
    });

    assert.equal(handoffView.title, '教师工作区边界');
    assert.equal(getHandoffValue(handoffView, 'auth-surface'), '注册页');
    assert.equal(
      getHandoffValue(handoffView, 'credential-login-gate'),
      '已启用'
    );
    assert.equal(getHandoffValue(handoffView, 'google-login-gate'), '未配置');
    assert.equal(getHandoffValue(handoffView, 'account-access'), '账号访问');
    assert.equal(getHandoffValue(handoffView, 'student-token-guard'), '不暴露');
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );
    assertNoPrivateAuthHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: AuthWorkspaceBoundaryView,
  id: AuthWorkspaceHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing auth handoff item ${id}`);
  return item.value;
}

function assertNoPrivateAuthHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_CALLBACK_URL,
    SECRET_CLIENT_SECRET,
    SECRET_PASSWORD,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ATTEMPT,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Auth workspace handoff leaked private text: ${privateValue}`
    );
  }
}
