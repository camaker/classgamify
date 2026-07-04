import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS,
  buildSettingsBillingPageViewModel,
  buildSettingsBillingWorkspaceHandoffView,
  buildSettingsBillingWorkspaceSummaryView,
  isSettingsBillingEnabled,
  type SettingsBillingWorkspaceHandoffItemId,
  type SettingsBillingWorkspaceHandoffView,
} from '@/settings/billing-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_CHECKOUT_SESSION = 'checkout-session-secret';
const SECRET_PAYMENT_PROVIDER_KEY = 'sk_live_payment_provider_secret';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote a private answer';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

test('billing workspace handoff exposes 30 safe plan-boundary slices', () => {
  const handoffView = buildSettingsBillingWorkspaceHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS]);
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
    changesAssignmentLinks: false,
    exposesActivityContent: false,
    exposesPaymentProviderSecrets: false,
    exposesRawCheckoutSession: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    hostedBillingOnly: true,
    itemIds,
    modifiesAssignmentSnapshots: false,
    planCapabilitiesAffectClassroomLoop: true,
    scope: 'teacher-billing-workspace',
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['workspace-scope', 'Teacher billing workspace'],
      ['route-gate', 'Protected billing route'],
      [
        'payment-feature-gate',
        isSettingsBillingEnabled() ? 'Enabled' : 'Disabled',
      ],
      ['plan-source', 'Plan access'],
      ['current-plan-card', 'Current plan'],
      ['plan-status-badge', 'Plan status badge'],
      ['plan-feature-section', 'Included classroom access'],
      ['plan-limit-section', 'Upgrade path'],
      ['free-plan-boundary', 'Free'],
      ['pro-plan-boundary', 'Teacher Pro'],
      ['lifetime-plan-boundary', 'Lifetime'],
      ['upgrade-action', 'View ClassGamify plans'],
      ['portal-action', 'Manage billing'],
      ['retry-action', 'Retry'],
      ['hosted-checkout', 'Hosted checkout'],
      ['customer-portal', 'Hosted portal'],
      ['payment-callback', 'Payment status'],
      ['activity-library-access', 'Activity library'],
      ['assignment-workflow-access', 'Assignment workflow'],
      ['ai-draft-access', 'AI drafts'],
      ['result-export-access', 'Result exports'],
      ['source-material-access', 'Source materials'],
      ['school-workspace-path', 'School plan path'],
      ['period-start', 'Current period starts:'],
      ['period-end', 'Current period ends:'],
      ['trial-end', 'Trial ends:'],
      ['cancel-at-period-end', '(cancels at period end)'],
      ['provider-boundary', 'Provider secrets hidden'],
      ['student-data-boundary', 'Student data unchanged'],
      ['privacy-guard', 'Private billing data omitted'],
    ]
  );
  assertNoPrivateBillingText(JSON.stringify(handoffView));
});

test('billing page and summary attach the billing handoff contract', () => {
  const pageView = buildSettingsBillingPageViewModel();
  const summaryView = buildSettingsBillingWorkspaceSummaryView();

  assert.deepEqual(
    pageView.workspaceSummaryView.handoffView.itemViews.map((item) => item.id),
    [...SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS]
  );
  assert.deepEqual(
    summaryView.handoffView.itemViews.map((item) => item.id),
    [...SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffValue(summaryView.handoffView, 'assignment-workflow-access'),
    'Assignment workflow'
  );
  assertNoPrivateBillingText(JSON.stringify(pageView.workspaceSummaryView));
});

test('billing workspace handoff localizes Chinese billing boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildSettingsBillingWorkspaceHandoffView();

    assert.equal(handoffView.title, '账单工作区交接');
    assert.match(handoffView.description, /30 切片账单工作区契约/);
    assert.equal(
      getHandoffValue(handoffView, 'workspace-scope'),
      '教师账单工作区'
    );
    assert.equal(getHandoffValue(handoffView, 'route-gate'), '受保护账单路由');
    assert.equal(getHandoffValue(handoffView, 'hosted-checkout'), '托管结账');
    assert.equal(
      getHandoffValue(handoffView, 'student-data-boundary'),
      '学生数据不变'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密账单数据'
    );
    assertNoPrivateBillingText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: SettingsBillingWorkspaceHandoffView,
  id: SettingsBillingWorkspaceHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing billing handoff item ${id}`);
  return item.value;
}

function assertNoPrivateBillingText(serializedView: string) {
  for (const privateValue of [
    SECRET_CHECKOUT_SESSION,
    SECRET_PAYMENT_PROVIDER_KEY,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Billing handoff leaked private text: ${privateValue}`
    );
  }
}
