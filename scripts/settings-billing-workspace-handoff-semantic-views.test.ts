import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS,
  buildSettingsBillingPageViewModel,
  buildSettingsBillingWorkspaceHandoffView,
  buildSettingsBillingWorkspaceSummaryView,
  buildSettingsPaymentPageViewModel,
  normalizeSettingsPaymentCallback,
  type SettingsBillingWorkspaceHandoffItemId,
  type SettingsBillingWorkspaceHandoffView,
} from '@/settings/billing-view';
import { buildSettingsBillingCardViewModel } from '@/payment/billing-view';
import {
  PAYMENT_STATUS_HANDOFF_ITEM_IDS,
  buildPaymentStatusHandoffView,
  buildPaymentStatusView,
  getInitialPaymentConfirmationStatus,
  type PaymentStatusHandoffItemId,
  type PaymentStatusHandoffView,
} from '@/payment/payment-status-view';
import type { PricePlan, Subscription } from '@/payment/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_CHECKOUT_SESSION = 'checkout-session-secret';
const SECRET_PROVIDER_KEY = 'sk_live_payment_provider_secret';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote a private answer';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

const BILLING_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/billing.tsx',
  'utf8'
);
const PAYMENT_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/payment.tsx',
  'utf8'
);
const BILLING_WORKSPACE_SUMMARY_SOURCE = readFileSync(
  'src/components/settings/billing/billing-workspace-summary.tsx',
  'utf8'
);
const BILLING_CARD_SOURCE = readFileSync(
  'src/components/settings/billing/billing-card.tsx',
  'utf8'
);
const PAYMENT_CARD_SOURCE = readFileSync(
  'src/components/payment/payment-card.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('settings billing handoff exposes 30 hosted classroom billing slices', () => {
  const pageView = buildSettingsBillingPageViewModel();
  const summaryView = buildSettingsBillingWorkspaceSummaryView();
  const handoffView = buildSettingsBillingWorkspaceHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.equal(pageView.workspaceSummaryView.title, summaryView.title);
  assert.deepEqual(
    summaryView.itemViews.map((item) => item.id),
    ['plan-access', 'activity-library', 'assignment-workflow', 'results-ai']
  );
  assert.equal(
    summaryView.itemViews.every(
      (item) =>
        item.ariaLabel.includes(item.label) &&
        item.ariaLabel.includes(item.description)
    ),
    true
  );
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

  assert.equal(
    getHandoffValue(handoffView, 'workspace-scope'),
    'Teacher billing workspace'
  );
  assert.equal(
    getHandoffValue(handoffView, 'route-gate'),
    'Protected billing route'
  );
  assert.equal(getHandoffValue(handoffView, 'plan-source'), 'Plan access');
  assert.equal(
    getHandoffValue(handoffView, 'current-plan-card'),
    'Current plan'
  );
  assert.equal(
    getHandoffValue(handoffView, 'hosted-checkout'),
    'Hosted checkout'
  );
  assert.equal(
    getHandoffValue(handoffView, 'customer-portal'),
    'Hosted portal'
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-library-access'),
    'Activity library'
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-workflow-access'),
    'Assignment workflow'
  );
  assert.equal(getHandoffValue(handoffView, 'ai-draft-access'), 'AI drafts');
  assert.equal(
    getHandoffValue(handoffView, 'result-export-access'),
    'Result exports'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-access'),
    'Source materials'
  );
  assert.equal(
    getHandoffValue(handoffView, 'provider-boundary'),
    'Provider secrets hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-data-boundary'),
    'Student data unchanged'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private billing data omitted'
  );
  assertNoPrivateBillingText(JSON.stringify(handoffView));
});

test('settings payment callback stays inside the teacher workspace', () => {
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
});

test('billing card view model separates classroom plan states and hosted actions', () => {
  const formatDate = (date: Date) => `date:${date.toISOString().slice(0, 10)}`;
  const loadingView = buildSettingsBillingCardViewModel({
    canManageBilling: false,
    formatDate,
    hasLoadError: false,
    isLoading: true,
    plans: [],
  });
  const errorView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    formatDate,
    hasLoadError: true,
    isLoading: false,
    plans: [],
  });
  const noPlanView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    formatDate,
    hasLoadError: false,
    isLoading: false,
    plans: [],
  });
  const freeView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: freePlan,
    formatDate,
    hasLoadError: false,
    isLoading: false,
    plans: [freePlan],
  });
  const proView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: { ...proPlan, name: 'Imported Pro' },
    formatDate,
    hasLoadError: false,
    isLoading: false,
    plans: [proPlan],
    subscription: activeSubscription,
  });
  const lifetimeView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: lifetimePlan,
    formatDate,
    hasLoadError: false,
    isLoading: false,
    plans: [lifetimePlan],
  });

  assert.equal(loadingView.state, 'loading');
  assert.equal(errorView.state, 'error');
  assert.equal(errorView.action?.kind, 'retry');
  assert.equal(noPlanView.state, 'no-plan');
  assert.equal(noPlanView.action?.kind, 'upgrade');
  assert.match(noPlanView.nextStep?.description ?? '', /free workflow/);
  assert.equal(freeView.plan?.id, 'free');
  assert.equal(freeView.action?.kind, 'upgrade');
  assert.match(freeView.plan?.message ?? '', /starter activities/);
  assert.equal(proView.plan?.name, 'Teacher Pro');
  assert.equal(proView.action?.kind, 'manage-subscription');
  assert.equal(proView.statusBadge?.tone, 'active');
  assert.deepEqual(
    proView.periodRows.map((row) => [row.id, row.value, row.suffix ?? '']),
    [
      ['period-start', 'date:2026-01-01', ''],
      ['period-end', 'date:2026-02-01', '(cancels at period end)'],
    ]
  );
  assert.deepEqual(
    proView.plan?.featureSections.map((section) => [
      section.id,
      section.items.map((item) => item.label),
    ]),
    [
      [
        'features',
        ['Reusable activities', 'Assignment links', 'Result exports'],
      ],
      ['limits', ['School workspace path']],
    ]
  );
  assert.equal(lifetimeView.plan?.isLifetime, true);
  assert.equal(lifetimeView.action?.kind, 'manage-billing');
  assert.match(
    lifetimeView.plan?.nextStep.description ?? '',
    /source-material/
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
  assertNoPrivateBillingText(JSON.stringify(processing.handoffView));
});

test('billing and payment routes consume prepared view models', () => {
  assert.match(
    BILLING_ROUTE_SOURCE,
    /buildSettingsBillingPageViewModel\(\)[\s\S]*BillingWorkspaceSummary[\s\S]*view=\{pageView\.workspaceSummaryView\}[\s\S]*BillingCard/,
    'Billing route should render prepared workspace summary before plan card.'
  );
  assert.match(
    PAYMENT_ROUTE_SOURCE,
    /buildSettingsPaymentPageViewModel\(\{[\s\S]*callback: search\.callback[\s\S]*PaymentCard sessionId=\{search\.session_id\} callback=\{pageView\.callback\}/,
    'Payment route should pass the normalized callback from the page view model.'
  );
  assert.match(
    BILLING_WORKSPACE_SUMMARY_SOURCE,
    /view\.itemViews\.map\(\(itemView\) =>[\s\S]*key=\{itemView\.id\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*data-handoff="settings-billing-workspace"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*handoffView\.itemViews\.map[\s\S]*BillingWorkspaceHandoffItem[\s\S]*const labelId = `settings-billing-workspace-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `settings-billing-workspace-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `settings-billing-workspace-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Billing workspace component should render prepared summary and handoff items.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Settings billing workspace handoff has a fast script-level gate via[\s\S]*scripts\/settings-billing-workspace-handoff-semantic-views\.test\.ts[\s\S]*plan access[\s\S]*settings-billing-workspace handoff/,
    'E2E catalog should document the settings billing handoff focused gate.'
  );
  assert.match(
    BILLING_CARD_SOURCE,
    /buildSettingsBillingCardViewModel\(\{[\s\S]*canManageBilling:[\s\S]*currentPlan,[\s\S]*hasLoadError:[\s\S]*plans,[\s\S]*subscription,[\s\S]*\}\)/,
    'Billing card should delegate plan state to the payment billing view model.'
  );
  assert.match(
    PAYMENT_CARD_SOURCE,
    /buildPaymentStatusView\(status,[\s\S]*hasSessionId:[\s\S]*Boolean\(sessionId\)[\s\S]*PaymentStatusNextStep[\s\S]*PaymentStatusHandoff[\s\S]*view=\{statusView\.handoffView\}/,
    'Payment card should render prepared payment status, next-step, and handoff views.'
  );
});

test('settings billing handoff localizes Chinese workspace boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildSettingsBillingWorkspaceHandoffView();

    assert.equal(handoffView.title, '账单工作区交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getHandoffValue(handoffView, 'workspace-scope'),
      '教师账单工作区'
    );
    assert.equal(getHandoffValue(handoffView, 'hosted-checkout'), '托管结账');
    assert.equal(
      getHandoffValue(handoffView, 'student-data-boundary'),
      '学生数据不变'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密账单数据'
    );
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: SettingsBillingWorkspaceHandoffView,
  id: SettingsBillingWorkspaceHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing billing handoff item ${id}`);
  return itemView.value;
}

function getPaymentHandoffValue(
  view: PaymentStatusHandoffView,
  id: PaymentStatusHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing payment handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateBillingText(serializedView: string) {
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
      `Billing handoff leaked private text: ${privateValue}`
    );
  }
}

const freePlan: PricePlan = {
  features: ['Starter activities'],
  id: 'free',
  isFree: true,
  isLifetime: false,
  limits: ['Preview links'],
  name: 'Free',
  prices: [],
};

const proPlan: PricePlan = {
  features: ['Reusable activities', 'Assignment links', 'Result exports'],
  id: 'pro',
  isFree: false,
  isLifetime: false,
  limits: ['School workspace path'],
  name: 'Teacher Pro',
  prices: [
    {
      amount: 699,
      currency: 'USD',
      interval: 'month',
      priceId: 'price_pro_monthly',
      type: 'subscription',
    },
  ],
};

const lifetimePlan: PricePlan = {
  features: ['Lifetime classroom toolkit'],
  id: 'lifetime',
  isFree: false,
  isLifetime: true,
  name: 'Lifetime',
  prices: [
    {
      amount: 7900,
      currency: 'USD',
      priceId: 'price_lifetime',
      type: 'one_time',
    },
  ],
};

const activeSubscription: Subscription = {
  cancelAtPeriodEnd: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  currentPeriodEnd: new Date('2026-02-01T00:00:00.000Z'),
  currentPeriodStart: new Date('2026-01-01T00:00:00.000Z'),
  customerId: 'cus_classroom',
  id: 'sub_classroom',
  interval: 'month',
  priceId: 'price_pro_monthly',
  status: 'active',
  type: 'subscription',
};
