import type { PricePlan, Subscription } from '@/payment/types';
import { m } from '@/locale/paraglide/messages';

export type SettingsBillingCardState =
  | 'error'
  | 'loading'
  | 'no-plan'
  | 'ready';

export type SettingsBillingCardActionKind =
  | 'manage-billing'
  | 'manage-subscription'
  | 'retry'
  | 'upgrade';

export type SettingsBillingCardBadgeIcon = 'check' | 'clock';

export type SettingsBillingCardBadgeTone = 'active' | 'trial';

export type SettingsBillingCardPeriodRowId =
  | 'period-end'
  | 'period-start'
  | 'trial-end';

export type SettingsBillingCardPeriodRowTone = 'muted' | 'warning';

type SettingsBillingCardHeader = {
  description: string;
  title: string;
};

type SettingsBillingCardAction = {
  kind: SettingsBillingCardActionKind;
  label: string;
};

export type SettingsBillingCardBadge = {
  icon: SettingsBillingCardBadgeIcon;
  label: string;
  tone: SettingsBillingCardBadgeTone;
};

export type SettingsBillingCardPeriodRow = {
  id: SettingsBillingCardPeriodRowId;
  label: string;
  suffix?: string;
  tone: SettingsBillingCardPeriodRowTone;
  value: string;
};

export type SettingsBillingCardPlanView = {
  id: string;
  isFree: boolean;
  isLifetime: boolean;
  message?: string;
  name: string;
};

export type SettingsBillingCardViewModel = {
  action?: SettingsBillingCardAction;
  header: SettingsBillingCardHeader;
  message?: string;
  periodRows: SettingsBillingCardPeriodRow[];
  plan?: SettingsBillingCardPlanView;
  state: SettingsBillingCardState;
  statusBadge?: SettingsBillingCardBadge;
};

type BuildSettingsBillingCardViewModelInput = {
  canManageBilling: boolean;
  currentPlan?: PricePlan | null;
  formatDate: (date: Date) => string;
  hasLoadError: boolean;
  isLoading: boolean;
  plans: PricePlan[];
  subscription?: Subscription | null;
};

const settingsBillingCardHeader = {
  get description() {
    return m.settings_billing_card_current_plan_description();
  },
  get title() {
    return m.settings_billing_card_current_plan();
  },
} as const;

export function buildSettingsBillingCardViewModel({
  canManageBilling,
  currentPlan,
  formatDate,
  hasLoadError,
  isLoading,
  plans,
  subscription,
}: BuildSettingsBillingCardViewModelInput): SettingsBillingCardViewModel {
  if (isLoading) {
    return buildSettingsBillingCardBaseView('loading');
  }

  if (hasLoadError) {
    return {
      ...buildSettingsBillingCardBaseView('error'),
      action: {
        kind: 'retry',
        label: m.settings_billing_card_retry(),
      },
      message: m.settings_billing_card_load_error(),
    };
  }

  const resolvedPlan = resolveSettingsBillingPlan({
    currentPlan,
    plans,
  });

  if (!resolvedPlan) {
    return {
      ...buildSettingsBillingCardBaseView('no-plan'),
      action: {
        kind: 'upgrade',
        label: m.settings_billing_card_upgrade_plan(),
      },
      message: m.settings_billing_card_no_plan(),
    };
  }

  const plan = buildSettingsBillingCardPlanView(resolvedPlan);

  return {
    ...buildSettingsBillingCardBaseView('ready'),
    action: buildSettingsBillingCardAction({
      canManageBilling,
      isFreePlan: plan.isFree,
      isLifetimePlan: plan.isLifetime,
    }),
    periodRows: buildSettingsBillingCardPeriodRows({
      formatDate,
      subscription,
    }),
    plan,
    statusBadge: buildSettingsBillingCardStatusBadge(subscription),
  };
}

export function resolveSettingsBillingPlan({
  currentPlan,
  plans,
}: {
  currentPlan?: PricePlan | null;
  plans: PricePlan[];
}): PricePlan | null {
  if (!currentPlan) return null;

  return plans.find((plan) => plan.id === currentPlan.id) ?? currentPlan;
}

function buildSettingsBillingCardBaseView(
  state: SettingsBillingCardState
): SettingsBillingCardViewModel {
  return {
    header: settingsBillingCardHeader,
    periodRows: [],
    state,
  };
}

function buildSettingsBillingCardPlanView(
  plan: PricePlan
): SettingsBillingCardPlanView {
  return {
    id: plan.id,
    isFree: plan.isFree,
    isLifetime: plan.isLifetime,
    message: buildSettingsBillingPlanMessage(plan),
    name: plan.name ?? plan.id ?? m.settings_billing_card_free(),
  };
}

function buildSettingsBillingPlanMessage(plan: PricePlan) {
  if (plan.isFree) return m.settings_billing_card_free_plan_message();
  if (plan.isLifetime) return m.settings_billing_card_lifetime_message();

  return undefined;
}

function buildSettingsBillingCardAction({
  canManageBilling,
  isFreePlan,
  isLifetimePlan,
}: {
  canManageBilling: boolean;
  isFreePlan: boolean;
  isLifetimePlan: boolean;
}): SettingsBillingCardAction | undefined {
  if (isFreePlan) {
    return {
      kind: 'upgrade',
      label: m.settings_billing_card_upgrade_plan(),
    };
  }

  if (!canManageBilling) return undefined;

  if (isLifetimePlan) {
    return {
      kind: 'manage-billing',
      label: m.settings_billing_card_manage_billing(),
    };
  }

  return {
    kind: 'manage-subscription',
    label: m.settings_billing_card_manage_subscription(),
  };
}

function buildSettingsBillingCardStatusBadge(
  subscription?: Subscription | null
): SettingsBillingCardBadge | undefined {
  if (!subscription) return undefined;

  if (subscription.status === 'trialing') {
    return {
      icon: 'clock',
      label: m.settings_billing_card_status_trial(),
      tone: 'trial',
    };
  }

  if (subscription.status === 'active') {
    return {
      icon: 'check',
      label: m.settings_billing_card_status_active(),
      tone: 'active',
    };
  }

  return undefined;
}

function buildSettingsBillingCardPeriodRows({
  formatDate,
  subscription,
}: {
  formatDate: (date: Date) => string;
  subscription?: Subscription | null;
}): SettingsBillingCardPeriodRow[] {
  if (!subscription) return [];

  const rows: SettingsBillingCardPeriodRow[] = [];
  const currentPeriodStart = subscription.currentPeriodStart
    ? formatDate(subscription.currentPeriodStart)
    : null;
  const currentPeriodEnd = subscription.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;
  const trialEndDate = subscription.trialEndDate
    ? formatDate(subscription.trialEndDate)
    : null;

  if (currentPeriodStart) {
    rows.push({
      id: 'period-start',
      label: m.settings_billing_card_period_start(),
      tone: 'muted',
      value: currentPeriodStart,
    });
  }

  if (currentPeriodEnd) {
    rows.push({
      id: 'period-end',
      label: m.settings_billing_card_period_ends(),
      suffix: subscription.cancelAtPeriodEnd
        ? m.settings_billing_card_cancels_at_period_end()
        : undefined,
      tone: 'muted',
      value: currentPeriodEnd,
    });
  }

  if (subscription.status === 'trialing' && trialEndDate) {
    rows.push({
      id: 'trial-end',
      label: m.settings_billing_card_trial_ends(),
      tone: 'warning',
      value: trialEndDate,
    });
  }

  return rows;
}
