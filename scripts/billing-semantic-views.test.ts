import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSettingsBillingCardViewModel } from '@/payment/billing-view';
import type { PricePlan, Subscription } from '@/payment/types';
import {
  buildSettingsBillingPageViewModel,
  buildSettingsBillingWorkspaceSummaryView,
} from '@/settings/billing-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('billing page exposes ClassGamify workspace billing semantics', () => {
  const pageView = buildSettingsBillingPageViewModel();
  const workspaceSummaryView = buildSettingsBillingWorkspaceSummaryView();

  assert.equal(pageView.breadcrumbs.at(-1)?.id, 'billing');
  assert.equal(
    pageView.contentAriaLabel,
    'Billing: Review your ClassGamify workspace access, hosted checkout status, assignment workflow limits, and plan management options'
  );
  assert.equal(
    pageView.planSectionAriaLabel,
    'Current ClassGamify plan and hosted billing controls'
  );
  assert.deepEqual(
    pageView.workspaceSummaryView.itemViews.map((item) => item.id),
    ['plan-access', 'activity-library', 'assignment-workflow', 'results-ai']
  );
  assert.equal(workspaceSummaryView.itemViews.length, 4);
  assert.equal(
    pageView.workspaceSummaryView.itemViews.every((item) =>
      Boolean(item.ariaLabel)
    ),
    true
  );
});

test('billing card exposes plan, action, status, and period semantics', () => {
  const freeBillingView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: freeBillingPlan,
    formatDate: formatBillingTestDate,
    hasLoadError: false,
    isLoading: false,
    plans: [configuredFreeBillingPlan, proBillingPlan],
    subscription: null,
  });
  const trialBillingView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: proBillingPlan,
    formatDate: formatBillingTestDate,
    hasLoadError: false,
    isLoading: false,
    plans: [configuredFreeBillingPlan, proBillingPlan],
    subscription: {
      ...trialBillingSubscription,
      cancelAtPeriodEnd: true,
    },
  });
  const noPlanBillingView = buildSettingsBillingCardViewModel({
    canManageBilling: false,
    currentPlan: null,
    formatDate: formatBillingTestDate,
    hasLoadError: false,
    isLoading: false,
    plans: [],
    subscription: null,
  });

  assert.equal(freeBillingView.ariaLabel.startsWith('Current plan:'), true);
  assert.equal(freeBillingView.action?.ariaLabel.includes('ClassGamify'), true);
  assert.deepEqual(
    freeBillingView.plan?.featureSections.map((section) => [
      section.id,
      Boolean(section.ariaLabel),
      section.items.map((item) => Boolean(item.ariaLabel)),
    ]),
    [
      ['features', true, [true, true]],
      ['limits', true, [true, true]],
    ]
  );
  assert.equal(
    freeBillingView.plan?.nextStep.ariaLabel.includes('assignment'),
    true
  );
  assert.equal(
    noPlanBillingView.nextStep?.ariaLabel.includes('student previews'),
    true
  );
  assert.equal(trialBillingView.statusBadge?.ariaLabel, 'Plan status: Trial');
  assert.deepEqual(
    trialBillingView.periodRows.map((row) => [row.id, row.ariaLabel]),
    [
      ['period-start', 'Current period starts: date:2026-01-01'],
      [
        'period-end',
        'Current period ends: date:2026-02-01 (cancels at period end)',
      ],
      ['trial-end', 'Trial ends: date:2026-01-15'],
    ]
  );
  assert.deepEqual(collectBillingSemanticSliceIds(), [
    'page-content',
    'plan-section',
    'workspace-plan-access',
    'workspace-activity-library',
    'workspace-assignment-workflow',
    'workspace-results-ai',
    'card-current-plan',
    'card-state-ready',
    'card-action-upgrade',
    'card-plan',
    'card-next-step',
    'card-feature-section-features',
    'card-feature-section-limits',
    'card-feature-items',
    'card-limit-items',
    'card-status-trial',
    'card-action-manage-subscription',
    'card-period-start',
    'card-period-end',
    'card-trial-end',
  ]);
});

const formatBillingTestDate = (date: Date) =>
  `date:${date.toISOString().slice(0, 10)}`;

const freeBillingPlan: PricePlan = {
  id: 'free',
  isFree: true,
  isLifetime: false,
  name: 'Imported Free',
  prices: [],
};

const configuredFreeBillingPlan: PricePlan = {
  ...freeBillingPlan,
  description: 'Configured starter classroom access.',
  features: ['Create classroom activities', 'Open student preview links'],
  limits: ['AI drafts', 'Result exports'],
  name: 'Configured Free',
};

const proBillingPlan: PricePlan = {
  description: 'Reusable activities and assignment review for teachers.',
  features: [
    'Larger activity library',
    'Student completion and score tracking',
  ],
  id: 'pro',
  isFree: false,
  isLifetime: false,
  limits: ['School workspace seats'],
  name: 'Classroom Pro',
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

const trialBillingSubscription: Subscription = {
  createdAt: new Date('2026-01-01T00:00:00Z'),
  currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
  currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
  customerId: 'cus_test',
  id: 'sub_test',
  interval: 'month',
  priceId: 'price_pro_monthly',
  status: 'trialing',
  trialEndDate: new Date('2026-01-15T00:00:00Z'),
  type: 'subscription',
};

function collectBillingSemanticSliceIds() {
  const pageView = buildSettingsBillingPageViewModel();
  const freeBillingView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: freeBillingPlan,
    formatDate: formatBillingTestDate,
    hasLoadError: false,
    isLoading: false,
    plans: [configuredFreeBillingPlan, proBillingPlan],
    subscription: null,
  });
  const trialBillingView = buildSettingsBillingCardViewModel({
    canManageBilling: true,
    currentPlan: proBillingPlan,
    formatDate: formatBillingTestDate,
    hasLoadError: false,
    isLoading: false,
    plans: [configuredFreeBillingPlan, proBillingPlan],
    subscription: trialBillingSubscription,
  });

  return [
    'page-content',
    'plan-section',
    ...pageView.workspaceSummaryView.itemViews.map(
      (item) => `workspace-${item.id}`
    ),
    'card-current-plan',
    `card-state-${freeBillingView.state}`,
    `card-action-${freeBillingView.action?.kind}`,
    'card-plan',
    'card-next-step',
    ...(freeBillingView.plan?.featureSections.map(
      (section) => `card-feature-section-${section.id}`
    ) ?? []),
    'card-feature-items',
    'card-limit-items',
    `card-status-${trialBillingView.statusBadge?.tone}`,
    `card-action-${trialBillingView.action?.kind}`,
    ...trialBillingView.periodRows.map((row) => `card-${row.id}`),
  ];
}
