import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildSettingsPaymentPageViewModel,
  normalizeSettingsPaymentCallback,
} from '@/settings/billing-view';
import {
  PAYMENT_STATUS_HANDOFF_ITEM_IDS,
  buildPaymentStatusHandoffView,
  buildPaymentStatusView,
  getInitialPaymentConfirmationStatus,
  type PaymentStatusHandoffItemId,
  type PaymentStatusHandoffView,
} from '@/payment/payment-status-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_CHECKOUT_SESSION = 'checkout-session-secret';
const SECRET_PROVIDER_KEY = 'sk_live_payment_provider_secret';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote a private answer';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

const PAYMENT_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/payment.tsx',
  'utf8'
);
const PAYMENT_CARD_SOURCE = readFileSync(
  'src/components/payment/payment-card.tsx',
  'utf8'
);
const PAYMENT_STATUS_SOURCE = readFileSync(
  'src/payment/payment-status-view.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('settings payment callback normalizes only teacher-workspace paths', () => {
  assert.equal(
    normalizeSettingsPaymentCallback('/dashboard/assignments?published=abc'),
    '/dashboard/assignments?published=abc'
  );
  assert.equal(
    normalizeSettingsPaymentCallback('dashboard/assignments#results'),
    '/dashboard/assignments#results'
  );
  for (const unsafeCallback of [
    undefined,
    '',
    'https://evil.example/dashboard',
    '//evil.example/dashboard',
    'javascript:alert(1)',
  ]) {
    assert.equal(
      normalizeSettingsPaymentCallback(unsafeCallback),
      '/settings/billing'
    );
  }

  assert.equal(
    buildSettingsPaymentPageViewModel({
      callback: 'https://evil.example/payments',
    }).callback,
    '/settings/billing'
  );
  assert.equal(
    buildSettingsPaymentPageViewModel({
      callback: '/dashboard/assignments',
    }).callback,
    '/dashboard/assignments'
  );
  assert.match(
    PAYMENT_ROUTE_SOURCE,
    /validateSearch:[\s\S]*session_id:[\s\S]*callback:[\s\S]*buildSettingsPaymentPageViewModel\(\{[\s\S]*callback: search\.callback[\s\S]*PaymentCard sessionId=\{search\.session_id\} callback=\{pageView\.callback\}/,
    'Payment route should validate search, normalize callback, and pass safe route state into the payment card.'
  );
});

test('payment status view keeps hosted checkout states classroom-scoped', () => {
  assert.equal(getInitialPaymentConfirmationStatus(undefined), 'failed');
  assert.equal(getInitialPaymentConfirmationStatus('cs_test'), 'processing');

  const processing = buildPaymentStatusView('processing', {
    hasSessionId: true,
  });
  const success = buildPaymentStatusView('success', { hasSessionId: true });
  const failed = buildPaymentStatusView('failed', { hasSessionId: false });
  const timeout = buildPaymentStatusView('timeout', { hasSessionId: true });

  assert.deepEqual(
    [processing.tone, success.tone, failed.tone, timeout.tone],
    ['working', 'success', 'danger', 'warning']
  );
  assert.deepEqual(
    [processing.icon, success.icon, failed.icon, timeout.icon],
    ['loader', 'check', 'x', 'alert']
  );
  assert.match(processing.description, /teacher workspace/);
  assert.match(success.description, /activity, assignment, and AI access/);
  assert.match(failed.description, /pricing page/);
  assert.match(timeout.description, /assignment workflow limits/);
  assert.match(processing.nextStep.description, /result workflows/);
  assert.match(timeout.nextStep.description, /source of truth/);
});

test('payment callback handoff exposes 30 hosted checkout slices', () => {
  const processing = buildPaymentStatusView('processing', {
    hasSessionId: true,
  });
  const success = buildPaymentStatusView('success', { hasSessionId: true });
  const failed = buildPaymentStatusView('failed', { hasSessionId: false });
  const timeout = buildPaymentStatusView('timeout', { hasSessionId: true });
  const directHandoff = buildPaymentStatusHandoffView({
    hasSessionId: true,
    icon: processing.icon,
    status: 'processing',
    title: processing.title,
    tone: processing.tone,
  });
  const itemIds = processing.handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...PAYMENT_STATUS_HANDOFF_ITEM_IDS]);
  assert.deepEqual(
    directHandoff.itemViews.map((item) => item.id),
    [...PAYMENT_STATUS_HANDOFF_ITEM_IDS]
  );
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    processing.handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(processing.handoffView.privacy, {
    changesActivityContent: false,
    changesAssignmentLinks: false,
    exposesActivityContent: false,
    exposesPaymentProviderSecrets: false,
    exposesRawCheckoutSession: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    hostedCheckoutStatusOnly: true,
    itemIds,
    modifiesAssignmentSnapshots: false,
    refreshesPlanCacheOnlyAfterSuccess: true,
    scope: 'teacher-payment-callback',
  });

  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'workspace-scope'),
    'Teacher payment callback'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'route-gate'),
    'Protected payment route'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'status'),
    'Confirming your payment'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'status-tone'),
    'Working'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'session-id-presence'),
    'Session present'
  );
  assert.equal(
    getPaymentHandoffValue(failed.handoffView, 'session-id-presence'),
    'Session missing'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'session-id-privacy'),
    'Raw session id omitted'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'payment-polling'),
    'Polling active'
  );
  assert.equal(
    getPaymentHandoffValue(success.handoffView, 'payment-polling'),
    'Polling stopped'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'poll-interval'),
    'Every 2 seconds'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'poll-timeout'),
    'Up to 60 seconds'
  );
  assert.equal(
    getPaymentHandoffValue(success.handoffView, 'current-plan-cache'),
    'Plan cache refresh queued'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'current-plan-cache'),
    'Waiting for confirmation'
  );
  assert.equal(
    getPaymentHandoffValue(success.handoffView, 'redirect-callback'),
    'Redirect ready'
  );
  assert.equal(
    getPaymentHandoffValue(failed.handoffView, 'pricing-retry'),
    'Restart checkout'
  );
  assert.equal(
    getPaymentHandoffValue(timeout.handoffView, 'timeout-recovery'),
    'Check Billing later'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'activity-access'),
    'Plan-linked activities'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'assignment-link-boundary'),
    'Links unchanged'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'student-data-boundary'),
    'Student data unchanged'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'provider-secret-boundary'),
    'Provider secrets hidden'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'raw-session-boundary'),
    'Raw session omitted'
  );
  assert.equal(
    getPaymentHandoffValue(processing.handoffView, 'privacy-guard'),
    'Private payment data omitted'
  );
  assertNoPrivatePaymentText(JSON.stringify(processing.handoffView));
});

test('payment callback route and component render the hidden handoff contract', () => {
  assert.match(
    PAYMENT_STATUS_SOURCE,
    /export const PAYMENT_STATUS_HANDOFF_ITEM_IDS = \[[\s\S]*'workspace-scope'[\s\S]*'hosted-checkout'[\s\S]*'completion-check'[\s\S]*'current-plan-cache'[\s\S]*'callback-normalization'[\s\S]*'provider-secret-boundary'[\s\S]*'raw-session-boundary'[\s\S]*'privacy-guard'[\s\S]*\] as const;[\s\S]*hostedCheckoutStatusOnly: true[\s\S]*scope: 'teacher-payment-callback'/,
    'Payment status view should expose the stable 30-slice callback contract and privacy scope.'
  );
  assert.match(
    PAYMENT_CARD_SOURCE,
    /buildPaymentStatusView\(status,[\s\S]*hasSessionId:[\s\S]*Boolean\(sessionId\)[\s\S]*PaymentStatusNextStep[\s\S]*PaymentStatusHandoff[\s\S]*view=\{statusView\.handoffView\}/,
    'Payment card should render prepared payment status, next-step, and handoff views.'
  );
  assert.match(
    PAYMENT_CARD_SOURCE,
    /function PaymentStatusHandoff[\s\S]*const titleId = 'settings-payment-callback-handoff-title'[\s\S]*const descriptionId = 'settings-payment-callback-handoff-description'[\s\S]*data-handoff="settings-payment-callback"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*view\.itemViews\.map[\s\S]*PaymentStatusHandoffItem[\s\S]*function PaymentStatusHandoffItem[\s\S]*const labelId = `settings-payment-callback-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `settings-payment-callback-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `settings-payment-callback-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Payment status handoff should render marker, privacy scope, item ids, and stable label/value/description relationships.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Settings payment callback handoff has a fast script-level gate via[\s\S]*scripts\/settings-payment-callback-handoff-semantic-views\.test\.ts[\s\S]*hosted checkout confirmation[\s\S]*settings-payment-callback handoff/,
    'E2E catalog should document the dedicated settings payment callback handoff focused gate.'
  );
});

test('payment callback handoff localizes Chinese checkout boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildPaymentStatusView('success', {
      hasSessionId: true,
    }).handoffView;

    assert.equal(handoffView.title, '支付回调交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getPaymentHandoffValue(handoffView, 'workspace-scope'),
      '教师支付回调'
    );
    assert.equal(
      getPaymentHandoffValue(handoffView, 'session-id-presence'),
      '会话存在'
    );
    assert.equal(
      getPaymentHandoffValue(handoffView, 'poll-interval'),
      '每 2 秒'
    );
    assert.equal(
      getPaymentHandoffValue(handoffView, 'poll-timeout'),
      '最多 60 秒'
    );
    assert.equal(
      getPaymentHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密支付数据'
    );
    assert.match(
      handoffView.itemViews[0].ariaLabel,
      /工作区范围：教师支付回调。/
    );
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getPaymentHandoffValue(
  view: PaymentStatusHandoffView,
  id: PaymentStatusHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing payment handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivatePaymentText(serializedView: string) {
  for (const privateValue of [
    SECRET_CHECKOUT_SESSION,
    SECRET_PROVIDER_KEY,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Payment callback handoff leaked private text: ${privateValue}`
    );
  }
}
