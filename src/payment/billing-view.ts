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
  ariaLabel: string;
  kind: SettingsBillingCardActionKind;
  label: string;
};

export type SettingsBillingCardPlanFeatureSectionId = 'features' | 'limits';

export type SettingsBillingCardPlanFeatureItem = {
  ariaLabel: string;
  id: string;
  label: string;
};

export type SettingsBillingCardPlanFeatureSection = {
  ariaLabel: string;
  description: string;
  id: SettingsBillingCardPlanFeatureSectionId;
  items: SettingsBillingCardPlanFeatureItem[];
  title: string;
};

export type SettingsBillingCardNextStepView = {
  ariaLabel: string;
  description: string;
  label: string;
};

export type SettingsBillingCardBadge = {
  ariaLabel: string;
  icon: SettingsBillingCardBadgeIcon;
  label: string;
  tone: SettingsBillingCardBadgeTone;
};

export type SettingsBillingCardPeriodRow = {
  ariaLabel: string;
  id: SettingsBillingCardPeriodRowId;
  label: string;
  suffix?: string;
  tone: SettingsBillingCardPeriodRowTone;
  value: string;
};

export type SettingsBillingCardPlanView = {
  description?: string;
  featureSections: SettingsBillingCardPlanFeatureSection[];
  id: string;
  isFree: boolean;
  isLifetime: boolean;
  message?: string;
  name: string;
  nextStep: SettingsBillingCardNextStepView;
};

export type SettingsBillingCardViewModel = {
  action?: SettingsBillingCardAction;
  ariaLabel: string;
  header: SettingsBillingCardHeader;
  message?: string;
  nextStep?: SettingsBillingCardNextStepView;
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
      action: buildSettingsBillingCardActionView({
        kind: 'retry',
        label: m.settings_billing_card_retry(),
      }),
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
      action: buildSettingsBillingCardActionView({
        kind: 'upgrade',
        label: m.settings_billing_card_upgrade_plan(),
      }),
      message: m.settings_billing_card_no_plan(),
      nextStep: buildSettingsBillingNoPlanNextStepView(),
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

function resolveSettingsBillingPlan({
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
  const description = settingsBillingCardHeader.description;
  const title = settingsBillingCardHeader.title;

  return {
    ariaLabel: m.settings_billing_card_aria_label({ description, title }),
    header: settingsBillingCardHeader,
    periodRows: [],
    state,
  };
}

function buildSettingsBillingCardPlanView(
  plan: PricePlan
): SettingsBillingCardPlanView {
  return {
    description: normalizeSettingsBillingText(plan.description),
    featureSections: buildSettingsBillingPlanFeatureSections(plan),
    id: plan.id,
    isFree: plan.isFree,
    isLifetime: plan.isLifetime,
    message: buildSettingsBillingPlanMessage(plan),
    name: plan.name ?? plan.id ?? m.settings_billing_card_free(),
    nextStep: buildSettingsBillingPlanNextStepView(plan),
  };
}

function buildSettingsBillingPlanMessage(plan: PricePlan) {
  if (plan.isFree) return m.settings_billing_card_free_plan_message();
  if (plan.isLifetime) return m.settings_billing_card_lifetime_message();

  return undefined;
}

function buildSettingsBillingPlanFeatureSections(
  plan: PricePlan
): SettingsBillingCardPlanFeatureSection[] {
  const sections: SettingsBillingCardPlanFeatureSection[] = [];
  const featureItems = buildSettingsBillingPlanFeatureItems({
    items: plan.features,
    sectionId: 'features',
  });
  const limitItems = buildSettingsBillingPlanFeatureItems({
    items: plan.limits,
    sectionId: 'limits',
  });

  if (featureItems.length > 0) {
    const description = m.settings_billing_card_features_description();
    const title = m.settings_billing_card_features_title();

    sections.push({
      ariaLabel: m.settings_billing_card_feature_section_aria({
        description,
        title,
      }),
      description,
      id: 'features',
      items: featureItems,
      title,
    });
  }

  if (limitItems.length > 0) {
    const description = m.settings_billing_card_limits_description();
    const title = m.settings_billing_card_limits_title();

    sections.push({
      ariaLabel: m.settings_billing_card_feature_section_aria({
        description,
        title,
      }),
      description,
      id: 'limits',
      items: limitItems,
      title,
    });
  }

  return sections;
}

function buildSettingsBillingPlanFeatureItems({
  items,
  sectionId,
}: {
  items?: string[];
  sectionId: SettingsBillingCardPlanFeatureSectionId;
}): SettingsBillingCardPlanFeatureItem[] {
  return normalizeSettingsBillingTextList(items).map((label, index) => ({
    ariaLabel:
      sectionId === 'features'
        ? m.settings_billing_card_feature_item_aria({ label })
        : m.settings_billing_card_limit_item_aria({ label }),
    id: `${sectionId}:${index}`,
    label,
  }));
}

function buildSettingsBillingPlanNextStepView(
  plan: PricePlan
): SettingsBillingCardNextStepView {
  if (plan.isFree) {
    return buildSettingsBillingNextStepView({
      description: m.settings_billing_card_next_step_free_description(),
      label: m.settings_billing_card_next_step_free_label(),
    });
  }

  if (plan.isLifetime) {
    return buildSettingsBillingNextStepView({
      description: m.settings_billing_card_next_step_lifetime_description(),
      label: m.settings_billing_card_next_step_lifetime_label(),
    });
  }

  return buildSettingsBillingNextStepView({
    description: m.settings_billing_card_next_step_pro_description(),
    label: m.settings_billing_card_next_step_pro_label(),
  });
}

function buildSettingsBillingNoPlanNextStepView(): SettingsBillingCardNextStepView {
  return buildSettingsBillingNextStepView({
    description: m.settings_billing_card_next_step_no_plan_description(),
    label: m.settings_billing_card_next_step_no_plan_label(),
  });
}

function buildSettingsBillingNextStepView({
  description,
  label,
}: {
  description: string;
  label: string;
}): SettingsBillingCardNextStepView {
  return {
    ariaLabel: m.settings_billing_card_next_step_aria({
      description,
      label,
    }),
    description,
    label,
  };
}

function normalizeSettingsBillingText(value: string | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function normalizeSettingsBillingTextList(values: string[] | undefined) {
  return (
    values
      ?.map((value) => normalizeSettingsBillingText(value))
      .filter((value): value is string => Boolean(value)) ?? []
  );
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
    return buildSettingsBillingCardActionView({
      kind: 'upgrade',
      label: m.settings_billing_card_upgrade_plan(),
    });
  }

  if (!canManageBilling) return undefined;

  if (isLifetimePlan) {
    return buildSettingsBillingCardActionView({
      kind: 'manage-billing',
      label: m.settings_billing_card_manage_billing(),
    });
  }

  return buildSettingsBillingCardActionView({
    kind: 'manage-subscription',
    label: m.settings_billing_card_manage_subscription(),
  });
}

function buildSettingsBillingCardActionView({
  kind,
  label,
}: {
  kind: SettingsBillingCardActionKind;
  label: string;
}): SettingsBillingCardAction {
  return {
    ariaLabel: m.settings_billing_card_action_aria({ label }),
    kind,
    label,
  };
}

function buildSettingsBillingCardStatusBadge(
  subscription?: Subscription | null
): SettingsBillingCardBadge | undefined {
  if (!subscription) return undefined;

  if (subscription.status === 'trialing') {
    const label = m.settings_billing_card_status_trial();

    return {
      ariaLabel: m.settings_billing_card_status_aria({ status: label }),
      icon: 'clock',
      label,
      tone: 'trial',
    };
  }

  if (subscription.status === 'active') {
    const label = m.settings_billing_card_status_active();

    return {
      ariaLabel: m.settings_billing_card_status_aria({ status: label }),
      icon: 'check',
      label,
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
    rows.push(
      buildSettingsBillingCardPeriodRowView({
        id: 'period-start',
        label: m.settings_billing_card_period_start(),
        tone: 'muted',
        value: currentPeriodStart,
      })
    );
  }

  if (currentPeriodEnd) {
    rows.push(
      buildSettingsBillingCardPeriodRowView({
        id: 'period-end',
        label: m.settings_billing_card_period_ends(),
        suffix: subscription.cancelAtPeriodEnd
          ? m.settings_billing_card_cancels_at_period_end()
          : undefined,
        tone: 'muted',
        value: currentPeriodEnd,
      })
    );
  }

  if (subscription.status === 'trialing' && trialEndDate) {
    rows.push(
      buildSettingsBillingCardPeriodRowView({
        id: 'trial-end',
        label: m.settings_billing_card_trial_ends(),
        tone: 'warning',
        value: trialEndDate,
      })
    );
  }

  return rows;
}

function buildSettingsBillingCardPeriodRowView({
  id,
  label,
  suffix,
  tone,
  value,
}: Omit<
  SettingsBillingCardPeriodRow,
  'ariaLabel'
>): SettingsBillingCardPeriodRow {
  return {
    ariaLabel: m.settings_billing_card_period_row_aria({
      label,
      suffix: suffix ? ` ${suffix}` : '',
      value,
    }),
    id,
    label,
    suffix,
    tone,
    value,
  };
}
