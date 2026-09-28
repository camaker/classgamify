import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildSettingsBillingPageViewModel,
  buildSettingsBillingWorkspaceSummaryView,
} from '@/settings/billing-view';
import { buildSettingsBillingCardViewModel } from '@/payment/billing-view';
import type { PricePlan, Subscription } from '@/payment/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const BILLING_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/billing.tsx',
  'utf8'
);
const BILLING_CARD_SOURCE = readFileSync(
  'src/components/settings/billing/billing-card.tsx',
  'utf8'
);

test('settings billing workspace summary lists hosted classroom billing areas', () => {
  const pageView = buildSettingsBillingPageViewModel();
  const summaryView = buildSettingsBillingWorkspaceSummaryView();

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

test('billing route consumes prepared workspace view models', () => {
  assert.match(
    BILLING_ROUTE_SOURCE,
    /buildSettingsBillingPageViewModel\(\)[\s\S]*BillingWorkspaceSummary[\s\S]*view=\{pageView\.workspaceSummaryView\}[\s\S]*BillingCard/,
    'Billing route should render prepared workspace summary before plan card.'
  );
  assert.match(
    BILLING_CARD_SOURCE,
    /buildSettingsBillingCardViewModel\(\{[\s\S]*canManageBilling:[\s\S]*currentPlan,[\s\S]*hasLoadError:[\s\S]*plans,[\s\S]*subscription,[\s\S]*\}\)/,
    'Billing card should delegate plan state to the payment billing view model.'
  );
});

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
