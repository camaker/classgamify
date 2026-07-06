import type { AssignmentSettings } from '@/activities/types';
import {
  type AssignmentDate,
  normalizeAssignmentLifecycleTimestamp,
} from '@/assignments/lifecycle';
import { normalizeAttemptTimeLimitSeconds } from '@/assignments/attempt-duration';
import {
  defaultAssignmentSettings,
  type AssignmentSettingsInput,
  resolveAssignmentSettings,
} from '@/assignments/validation';
import { normalizeOptionalRuntimeDisplayText } from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

export type AssignmentDeliverySummaryId =
  | 'answerReveal'
  | 'attempts'
  | 'closes'
  | 'identity'
  | 'itemOrder'
  | 'timer';

export type AssignmentDeliverySummaryItem = {
  id: AssignmentDeliverySummaryId;
  label: string;
  value: string;
};

export type PublicAssignmentRuleSummaryId =
  | AssignmentDeliverySummaryId
  | 'items';

export type PublicAssignmentRuleSummaryItem = {
  ariaLabel: string;
  description: string;
  id: PublicAssignmentRuleSummaryId;
  label: string;
  value: string;
};

type PublicAssignmentRuleDescriptionState =
  | 'attemptsLimited'
  | 'attemptsOpen'
  | 'closesNone'
  | 'closesScheduled'
  | 'identityAnonymous'
  | 'identityNames'
  | 'itemOrderShuffled'
  | 'itemOrderFixed'
  | 'items'
  | 'reviewHidden'
  | 'reviewVisible'
  | 'timerLimited'
  | 'timerNone';

type PublicAssignmentRuleSummarySourceItem = Pick<
  PublicAssignmentRuleSummaryItem,
  'id' | 'label' | 'value'
> & {
  descriptionState: PublicAssignmentRuleDescriptionState;
};

export type PublicAssignmentRuleSummaryStats = {
  collectsStudentName: boolean;
  hasAttemptLimit: boolean;
  hasCloseTime: boolean;
  hasTimer: boolean;
  itemCount: number;
  ruleCount: number;
  ruleIds: PublicAssignmentRuleSummaryId[];
  shufflesItems: boolean;
  showsCorrectAnswers: boolean;
};

export type PublicAssignmentRuleSummaryStatus =
  | 'attempt-limited'
  | 'open'
  | 'scheduled'
  | 'timed'
  | 'timed-scheduled';

export type PublicAssignmentRuleSummaryStatusTone = 'attention' | 'neutral';

export type PublicAssignmentRuleSummaryStatusView = {
  ariaLabel: string;
  description: string;
  label: string;
  status: PublicAssignmentRuleSummaryStatus;
  tone: PublicAssignmentRuleSummaryStatusTone;
};

export type PublicAssignmentRuleSummaryView = {
  description: string;
  items: PublicAssignmentRuleSummaryItem[];
  status: PublicAssignmentRuleSummaryStatusView;
  summary: PublicAssignmentRuleSummaryStats;
  title: string;
};

export const ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS = [
  'domain-helper-source',
  'settings-resolution',
  'settings-summary-surface',
  'public-rules-surface',
  'publish-dialog-surface',
  'assignment-card-surface',
  'result-header-surface',
  'student-runner-surface',
  'item-count-rule',
  'attempts-rule',
  'timer-rule',
  'close-time-rule',
  'identity-rule',
  'answer-reveal-rule',
  'item-order-rule',
  'instructions-rule',
  'delivery-rule-order',
  'public-rule-count',
  'settings-rule-count',
  'status-derivation',
  'default-attempts',
  'unlimited-attempts',
  'timer-normalization',
  'close-time-normalization',
  'policy-text-export',
  'snapshot-boundary',
  'public-payload-boundary',
  'result-export-boundary',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type AssignmentDeliveryPolicyHandoffItemId =
  (typeof ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS)[number];

export type AssignmentDeliveryPolicyHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentDeliveryPolicyHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentDeliveryPolicyHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawSettingsJson: false;
  exposesShareSlug: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesStudentNames: false;
  itemIds: AssignmentDeliveryPolicyHandoffItemId[];
  mutatesAssignment: false;
  publicRulesAreSanitized: true;
  scope: 'assignment-delivery-policy-summary';
  settingsResolveThroughDomain: true;
  surfacesShareSummaryView: true;
};

export type AssignmentDeliveryPolicyHandoffView = {
  description: string;
  itemViews: AssignmentDeliveryPolicyHandoffItemView[];
  privacy: AssignmentDeliveryPolicyHandoffPrivacyContract;
  title: string;
};

type AssignmentDeliverySummaryInput = {
  collectStudentName?: boolean;
  expiresAt: AssignmentDate;
  maxAttempts?: number | null;
  showCorrectAnswers?: boolean;
  shuffleItems?: boolean;
  timeLimitSeconds?: number | null;
};

type AssignmentSettingsSummaryInput = AssignmentDeliverySummaryInput & {
  instructions?: string;
  settings?: AssignmentSettingsInput;
};

type AssignmentDeliveryPolicyHandoffInput = {
  expiresAt?: AssignmentDate;
  itemCount?: number;
  settings?: AssignmentSettingsInput;
};

type AssignmentDeliveryPolicyHandoffContext = {
  defaultSettingsSummary: AssignmentSettingsSummaryView;
  policyText: string;
  publicRuleSummary: PublicAssignmentRuleSummaryView;
  settingsSummary: AssignmentSettingsSummaryView;
};

export type AssignmentInstructionSummary = {
  isEmpty: boolean;
  label: string;
  value: string;
};

export type AssignmentSettingsSummaryStatus =
  | 'attempt-limited'
  | 'open'
  | 'scheduled'
  | 'timed'
  | 'timed-scheduled';

export type AssignmentSettingsSummaryStatusTone = 'attention' | 'neutral';

export type AssignmentSettingsSummaryStatusView = {
  ariaLabel: string;
  description: string;
  label: string;
  status: AssignmentSettingsSummaryStatus;
  tone: AssignmentSettingsSummaryStatusTone;
  value: string;
};

export type AssignmentSettingsSummaryStats = {
  deliveryRuleCount: number;
  hasAttemptLimit: boolean;
  hasCloseTime: boolean;
  hasInstructions: boolean;
  hasTimer: boolean;
  status: AssignmentSettingsSummaryStatus;
};

export type AssignmentSettingsSummaryView = {
  instructions: AssignmentInstructionSummary;
  items: AssignmentDeliverySummaryItem[];
  settings: AssignmentSettings;
  status: AssignmentSettingsSummaryStatusView;
  summary: AssignmentSettingsSummaryStats;
};

export function buildAssignmentDeliverySummary({
  collectStudentName = true,
  expiresAt,
  maxAttempts = defaultAssignmentSettings.maxAttempts,
  showCorrectAnswers = true,
  shuffleItems = true,
  timeLimitSeconds,
}: AssignmentDeliverySummaryInput): AssignmentDeliverySummaryItem[] {
  return [
    {
      id: 'attempts',
      label: m.assignment_delivery_label_attempts(),
      value: formatAssignmentAttempts(maxAttempts),
    },
    {
      id: 'timer',
      label: m.assignment_delivery_label_timer(),
      value: formatAssignmentTimeLimit(timeLimitSeconds),
    },
    {
      id: 'closes',
      label: m.assignment_delivery_label_closes(),
      value: formatAssignmentExpiry(expiresAt),
    },
    {
      id: 'identity',
      label: m.assignment_delivery_label_identity(),
      value: formatStudentIdentity(collectStudentName),
    },
    {
      id: 'answerReveal',
      label: m.assignment_delivery_label_answer_reveal(),
      value: formatAnswerReveal(showCorrectAnswers),
    },
    {
      id: 'itemOrder',
      label: m.assignment_delivery_label_item_order(),
      value: formatShuffleItems(shuffleItems),
    },
  ];
}

export function buildAssignmentSettingsSummaryView({
  collectStudentName = true,
  expiresAt,
  instructions,
  maxAttempts,
  settings,
  showCorrectAnswers = true,
  shuffleItems = true,
  timeLimitSeconds,
}: AssignmentSettingsSummaryInput): AssignmentSettingsSummaryView {
  const resolvedSettings = resolveAssignmentSettings(
    settings ?? {
      collectStudentName,
      instructions,
      maxAttempts:
        maxAttempts === undefined
          ? defaultAssignmentSettings.maxAttempts
          : maxAttempts,
      showCorrectAnswers,
      shuffleItems,
      timeLimitSeconds: timeLimitSeconds ?? undefined,
    }
  );
  const items = buildAssignmentDeliverySummary({
    collectStudentName: resolvedSettings.collectStudentName,
    expiresAt,
    maxAttempts: resolvedSettings.maxAttempts,
    showCorrectAnswers: resolvedSettings.showCorrectAnswers,
    shuffleItems: resolvedSettings.shuffleItems,
    timeLimitSeconds: resolvedSettings.timeLimitSeconds,
  });
  const summary = buildAssignmentSettingsSummaryStats({
    deliveryRuleCount: items.length,
    expiresAt,
    instructions: resolvedSettings.instructions,
    maxAttempts: resolvedSettings.maxAttempts,
    timeLimitSeconds: resolvedSettings.timeLimitSeconds,
  });

  return {
    instructions: buildAssignmentInstructionSummary(
      resolvedSettings.instructions
    ),
    items,
    settings: resolvedSettings,
    status: buildAssignmentSettingsSummaryStatusView(summary),
    summary,
  };
}

export function formatAssignmentDeliveryPolicyText({
  expiresAt,
  settings,
}: {
  expiresAt: AssignmentDate;
  settings?: AssignmentSettingsInput;
}) {
  const summaryView = buildAssignmentSettingsSummaryView({
    expiresAt,
    settings,
  });

  return [summaryView.instructions, ...summaryView.items]
    .map(formatAssignmentDeliveryPolicyItem)
    .join(m.assignment_delivery_policy_separator());
}

export function buildAssignmentDeliveryPolicyHandoffView({
  expiresAt,
  itemCount = 4,
  settings = {
    collectStudentName: false,
    instructions: 'Read rules before starting.',
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 15 * 60,
  },
}: AssignmentDeliveryPolicyHandoffInput = {}): AssignmentDeliveryPolicyHandoffView {
  const settingsSummary = buildAssignmentSettingsSummaryView({
    expiresAt,
    settings,
  });
  const publicRuleSummary = buildPublicAssignmentRuleSummaryViewFromSettings({
    expiresAt,
    itemCount,
    settings,
  });
  const defaultSettingsSummary = buildAssignmentSettingsSummaryView({
    expiresAt,
    settings: {},
  });
  const policyText = formatAssignmentDeliveryPolicyText({
    expiresAt,
    settings,
  });
  const context = {
    defaultSettingsSummary,
    policyText,
    publicRuleSummary,
    settingsSummary,
  };
  const itemViews = ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentDeliveryPolicyHandoffItemView({ context, id })
  );

  return {
    description: m.assignment_delivery_policy_handoff_description(),
    itemViews,
    privacy: buildAssignmentDeliveryPolicyHandoffPrivacyContract(itemViews),
    title: m.assignment_delivery_policy_handoff_title(),
  };
}

export function formatAssignmentDeliveryInstructions(
  instructions: string | null | undefined
) {
  return normalizeOptionalRuntimeDisplayText(instructions);
}

function formatAssignmentDeliveryPolicyItem(
  item: Pick<AssignmentDeliverySummaryItem, 'label' | 'value'>
) {
  return m.assignment_delivery_policy_item({
    label: item.label,
    value: item.value,
  });
}

function buildAssignmentDeliveryPolicyHandoffItemView({
  context,
  id,
}: {
  context: AssignmentDeliveryPolicyHandoffContext;
  id: AssignmentDeliveryPolicyHandoffItemId;
}): AssignmentDeliveryPolicyHandoffItemView {
  const label = getAssignmentDeliveryPolicyHandoffItemLabel(id);
  const description = getAssignmentDeliveryPolicyHandoffItemDescription(id);
  const value = getAssignmentDeliveryPolicyHandoffItemValue({ context, id });

  return {
    ariaLabel: m.assignment_delivery_policy_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildAssignmentDeliveryPolicyHandoffPrivacyContract(
  itemViews: AssignmentDeliveryPolicyHandoffItemView[]
): AssignmentDeliveryPolicyHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawSettingsJson: false,
    exposesShareSlug: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesAssignment: false,
    publicRulesAreSanitized: true,
    scope: 'assignment-delivery-policy-summary',
    settingsResolveThroughDomain: true,
    surfacesShareSummaryView: true,
  };
}

function getAssignmentDeliveryPolicyHandoffItemLabel(
  id: AssignmentDeliveryPolicyHandoffItemId
) {
  switch (id) {
    case 'domain-helper-source':
      return m.assignment_delivery_policy_handoff_domain_helper_label();
    case 'settings-resolution':
      return m.assignment_delivery_policy_handoff_settings_resolution_label();
    case 'settings-summary-surface':
      return m.assignment_delivery_policy_handoff_settings_surface_label();
    case 'public-rules-surface':
      return m.assignment_delivery_policy_handoff_public_rules_surface_label();
    case 'publish-dialog-surface':
      return m.assignment_delivery_policy_handoff_publish_surface_label();
    case 'assignment-card-surface':
      return m.assignment_delivery_policy_handoff_card_surface_label();
    case 'result-header-surface':
      return m.assignment_delivery_policy_handoff_result_surface_label();
    case 'student-runner-surface':
      return m.assignment_delivery_policy_handoff_runner_surface_label();
    case 'item-count-rule':
      return m.assignment_delivery_label_items();
    case 'attempts-rule':
      return m.assignment_delivery_label_attempts();
    case 'timer-rule':
      return m.assignment_delivery_label_timer();
    case 'close-time-rule':
      return m.assignment_delivery_label_closes();
    case 'identity-rule':
      return m.assignment_delivery_label_identity();
    case 'answer-reveal-rule':
      return m.assignment_delivery_label_answer_reveal();
    case 'item-order-rule':
      return m.assignment_delivery_label_item_order();
    case 'instructions-rule':
      return m.assignment_delivery_label_instructions();
    case 'delivery-rule-order':
      return m.assignment_delivery_policy_handoff_rule_order_label();
    case 'public-rule-count':
      return m.assignment_delivery_policy_handoff_public_rule_count_label();
    case 'settings-rule-count':
      return m.assignment_delivery_policy_handoff_settings_rule_count_label();
    case 'status-derivation':
      return m.assignment_delivery_policy_handoff_status_label();
    case 'default-attempts':
      return m.assignment_delivery_policy_handoff_default_attempts_label();
    case 'unlimited-attempts':
      return m.assignment_delivery_policy_handoff_unlimited_attempts_label();
    case 'timer-normalization':
      return m.assignment_delivery_policy_handoff_timer_normalization_label();
    case 'close-time-normalization':
      return m.assignment_delivery_policy_handoff_close_normalization_label();
    case 'policy-text-export':
      return m.assignment_delivery_policy_handoff_policy_text_label();
    case 'snapshot-boundary':
      return m.assignment_delivery_policy_handoff_snapshot_boundary_label();
    case 'public-payload-boundary':
      return m.assignment_delivery_policy_handoff_public_payload_label();
    case 'result-export-boundary':
      return m.assignment_delivery_policy_handoff_result_export_label();
    case 'legacy-copy-guard':
      return m.assignment_delivery_policy_handoff_legacy_guard_label();
    case 'privacy-guard':
      return m.assignment_delivery_policy_handoff_privacy_guard_label();
  }
}

function getAssignmentDeliveryPolicyHandoffItemDescription(
  id: AssignmentDeliveryPolicyHandoffItemId
) {
  switch (id) {
    case 'domain-helper-source':
      return m.assignment_delivery_policy_handoff_domain_helper_description();
    case 'settings-resolution':
      return m.assignment_delivery_policy_handoff_settings_resolution_description();
    case 'settings-summary-surface':
      return m.assignment_delivery_policy_handoff_settings_surface_description();
    case 'public-rules-surface':
      return m.assignment_delivery_policy_handoff_public_rules_surface_description();
    case 'publish-dialog-surface':
      return m.assignment_delivery_policy_handoff_publish_surface_description();
    case 'assignment-card-surface':
      return m.assignment_delivery_policy_handoff_card_surface_description();
    case 'result-header-surface':
      return m.assignment_delivery_policy_handoff_result_surface_description();
    case 'student-runner-surface':
      return m.assignment_delivery_policy_handoff_runner_surface_description();
    case 'item-count-rule':
      return m.assignment_delivery_policy_handoff_item_count_description();
    case 'attempts-rule':
      return m.assignment_delivery_policy_handoff_attempts_description();
    case 'timer-rule':
      return m.assignment_delivery_policy_handoff_timer_description();
    case 'close-time-rule':
      return m.assignment_delivery_policy_handoff_close_time_description();
    case 'identity-rule':
      return m.assignment_delivery_policy_handoff_identity_description();
    case 'answer-reveal-rule':
      return m.assignment_delivery_policy_handoff_answer_reveal_description();
    case 'item-order-rule':
      return m.assignment_delivery_policy_handoff_item_order_description();
    case 'instructions-rule':
      return m.assignment_delivery_policy_handoff_instructions_description();
    case 'delivery-rule-order':
      return m.assignment_delivery_policy_handoff_rule_order_description();
    case 'public-rule-count':
      return m.assignment_delivery_policy_handoff_public_rule_count_description();
    case 'settings-rule-count':
      return m.assignment_delivery_policy_handoff_settings_rule_count_description();
    case 'status-derivation':
      return m.assignment_delivery_policy_handoff_status_description();
    case 'default-attempts':
      return m.assignment_delivery_policy_handoff_default_attempts_description();
    case 'unlimited-attempts':
      return m.assignment_delivery_policy_handoff_unlimited_attempts_description();
    case 'timer-normalization':
      return m.assignment_delivery_policy_handoff_timer_normalization_description();
    case 'close-time-normalization':
      return m.assignment_delivery_policy_handoff_close_normalization_description();
    case 'policy-text-export':
      return m.assignment_delivery_policy_handoff_policy_text_description();
    case 'snapshot-boundary':
      return m.assignment_delivery_policy_handoff_snapshot_boundary_description();
    case 'public-payload-boundary':
      return m.assignment_delivery_policy_handoff_public_payload_description();
    case 'result-export-boundary':
      return m.assignment_delivery_policy_handoff_result_export_description();
    case 'legacy-copy-guard':
      return m.assignment_delivery_policy_handoff_legacy_guard_description();
    case 'privacy-guard':
      return m.assignment_delivery_policy_handoff_privacy_guard_description();
  }
}

function getAssignmentDeliveryPolicyHandoffItemValue({
  context,
  id,
}: {
  context: AssignmentDeliveryPolicyHandoffContext;
  id: AssignmentDeliveryPolicyHandoffItemId;
}) {
  switch (id) {
    case 'domain-helper-source':
      return m.assignment_delivery_policy_handoff_domain_helper_value();
    case 'settings-resolution':
      return m.assignment_delivery_policy_handoff_settings_resolution_value();
    case 'settings-summary-surface':
      return m.assignment_delivery_policy_handoff_settings_surface_value();
    case 'public-rules-surface':
      return m.assignment_delivery_policy_handoff_public_rules_surface_value();
    case 'publish-dialog-surface':
      return m.assignment_delivery_policy_handoff_publish_surface_value();
    case 'assignment-card-surface':
      return m.assignment_delivery_policy_handoff_card_surface_value();
    case 'result-header-surface':
      return m.assignment_delivery_policy_handoff_result_surface_value();
    case 'student-runner-surface':
      return m.assignment_delivery_policy_handoff_runner_surface_value();
    case 'item-count-rule':
      return getPublicAssignmentRuleValue(context.publicRuleSummary, 'items');
    case 'attempts-rule':
      return getAssignmentSettingsItemValue(
        context.settingsSummary,
        'attempts'
      );
    case 'timer-rule':
      return getAssignmentSettingsItemValue(context.settingsSummary, 'timer');
    case 'close-time-rule':
      return getAssignmentSettingsItemValue(context.settingsSummary, 'closes');
    case 'identity-rule':
      return getAssignmentSettingsItemValue(
        context.settingsSummary,
        'identity'
      );
    case 'answer-reveal-rule':
      return getAssignmentSettingsItemValue(
        context.settingsSummary,
        'answerReveal'
      );
    case 'item-order-rule':
      return getAssignmentSettingsItemValue(
        context.settingsSummary,
        'itemOrder'
      );
    case 'instructions-rule':
      return context.settingsSummary.instructions.value;
    case 'delivery-rule-order':
      return context.settingsSummary.items.map((item) => item.id).join(' -> ');
    case 'public-rule-count':
      return formatAssignmentDeliveryPolicyHandoffRuleCount(
        context.publicRuleSummary.summary.ruleCount
      );
    case 'settings-rule-count':
      return formatAssignmentDeliveryPolicyHandoffRuleCount(
        context.settingsSummary.summary.deliveryRuleCount
      );
    case 'status-derivation':
      return context.settingsSummary.status.value;
    case 'default-attempts':
      return getAssignmentSettingsItemValue(
        context.defaultSettingsSummary,
        'attempts'
      );
    case 'unlimited-attempts':
      return formatAssignmentAttempts(null);
    case 'timer-normalization':
      return getAssignmentSettingsItemValue(context.settingsSummary, 'timer');
    case 'close-time-normalization':
      return getAssignmentSettingsItemValue(context.settingsSummary, 'closes');
    case 'policy-text-export':
      return context.policyText;
    case 'snapshot-boundary':
      return m.assignment_delivery_policy_handoff_snapshot_boundary_value();
    case 'public-payload-boundary':
      return m.assignment_delivery_policy_handoff_public_payload_value();
    case 'result-export-boundary':
      return m.assignment_delivery_policy_handoff_result_export_value();
    case 'legacy-copy-guard':
      return m.assignment_delivery_policy_handoff_legacy_guard_value();
    case 'privacy-guard':
      return m.assignment_delivery_policy_handoff_privacy_guard_value();
  }
}

function getAssignmentSettingsItemValue(
  summary: AssignmentSettingsSummaryView,
  id: AssignmentDeliverySummaryId
) {
  return summary.items.find((item) => item.id === id)?.value ?? '';
}

function getPublicAssignmentRuleValue(
  summary: PublicAssignmentRuleSummaryView,
  id: PublicAssignmentRuleSummaryId
) {
  return summary.items.find((item) => item.id === id)?.value ?? '';
}

function formatAssignmentDeliveryPolicyHandoffRuleCount(count: number) {
  return m.assignment_delivery_policy_handoff_rule_count_value({
    count: Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0)),
  });
}

export function buildPublicAssignmentRuleSummary({
  itemCount,
  ...input
}: AssignmentDeliverySummaryInput & {
  itemCount: number;
}): PublicAssignmentRuleSummaryItem[] {
  return buildPublicAssignmentRuleSummaryView({
    itemCount,
    ...input,
  }).items;
}

export function buildPublicAssignmentRuleSummaryView({
  collectStudentName = true,
  expiresAt,
  itemCount,
  maxAttempts = defaultAssignmentSettings.maxAttempts,
  showCorrectAnswers = true,
  shuffleItems = true,
  timeLimitSeconds,
}: AssignmentDeliverySummaryInput & {
  itemCount: number;
}): PublicAssignmentRuleSummaryView {
  const ruleItems = [
    {
      descriptionState: 'items',
      id: 'items',
      label: m.assignment_delivery_label_items(),
      value: formatAssignmentItemCount(itemCount),
    },
    {
      descriptionState: isPositiveWholeNumber(maxAttempts)
        ? 'attemptsLimited'
        : 'attemptsOpen',
      id: 'attempts',
      label: m.assignment_delivery_label_attempts(),
      value: formatAssignmentAttempts(maxAttempts),
    },
    {
      descriptionState:
        normalizeAttemptTimeLimitSeconds(timeLimitSeconds) === undefined
          ? 'timerNone'
          : 'timerLimited',
      id: 'timer',
      label: m.assignment_delivery_label_timer(),
      value: formatAssignmentTimeLimit(timeLimitSeconds),
    },
    {
      descriptionState: hasAssignmentCloseTime(expiresAt)
        ? 'closesScheduled'
        : 'closesNone',
      id: 'closes',
      label: m.assignment_delivery_label_closes(),
      value: formatAssignmentExpiry(expiresAt),
    },
    {
      descriptionState: collectStudentName
        ? 'identityNames'
        : 'identityAnonymous',
      id: 'identity',
      label: m.assignment_delivery_label_identity(),
      value: formatStudentIdentity(collectStudentName),
    },
    {
      descriptionState: showCorrectAnswers ? 'reviewVisible' : 'reviewHidden',
      id: 'answerReveal',
      label: m.assignment_delivery_label_review(),
      value: formatAnswerReveal(showCorrectAnswers),
    },
    {
      descriptionState: shuffleItems ? 'itemOrderShuffled' : 'itemOrderFixed',
      id: 'itemOrder',
      label: m.assignment_delivery_label_item_order(),
      value: formatShuffleItems(shuffleItems),
    },
  ] satisfies PublicAssignmentRuleSummarySourceItem[];
  const items = ruleItems.map(toPublicAssignmentRuleSummaryItem);
  const summary = buildPublicAssignmentRuleSummaryStats({
    collectStudentName,
    expiresAt,
    itemCount,
    maxAttempts,
    ruleIds: items.map((item) => item.id),
    showCorrectAnswers,
    shuffleItems,
    timeLimitSeconds,
  });

  return {
    description: m.assignment_delivery_public_rules_description(),
    items,
    status: buildPublicAssignmentRuleSummaryStatusView(summary),
    summary,
    title: m.assignment_delivery_public_rules_title(),
  };
}

export function buildPublicAssignmentRuleSummaryFromSettings({
  expiresAt,
  itemCount,
  settings,
}: {
  expiresAt: AssignmentDate;
  itemCount: number;
  settings?: AssignmentSettingsInput;
}): PublicAssignmentRuleSummaryItem[] {
  return buildPublicAssignmentRuleSummaryViewFromSettings({
    expiresAt,
    itemCount,
    settings,
  }).items;
}

export function buildPublicAssignmentRuleSummaryViewFromSettings({
  expiresAt,
  itemCount,
  settings,
}: {
  expiresAt: AssignmentDate;
  itemCount: number;
  settings?: AssignmentSettingsInput;
}): PublicAssignmentRuleSummaryView {
  const resolvedSettings = resolveAssignmentSettings(settings);

  return buildPublicAssignmentRuleSummaryView({
    collectStudentName: resolvedSettings.collectStudentName,
    expiresAt,
    itemCount,
    maxAttempts: resolvedSettings.maxAttempts,
    showCorrectAnswers: resolvedSettings.showCorrectAnswers,
    shuffleItems: resolvedSettings.shuffleItems,
    timeLimitSeconds: resolvedSettings.timeLimitSeconds,
  });
}

export function formatAssignmentItemCount(itemCount: number) {
  const normalizedItemCount = normalizeAssignmentItemCount(itemCount);

  if (normalizedItemCount === 1) {
    return m.assignment_delivery_item_count_one({
      count: normalizedItemCount,
    });
  }

  return m.assignment_delivery_item_count_many({ count: normalizedItemCount });
}

function normalizeAssignmentItemCount(itemCount: number) {
  return Number.isFinite(itemCount) ? Math.max(0, Math.floor(itemCount)) : 0;
}

function buildPublicAssignmentRuleSummaryStats({
  collectStudentName = true,
  expiresAt,
  itemCount,
  maxAttempts = defaultAssignmentSettings.maxAttempts,
  ruleIds,
  showCorrectAnswers = true,
  shuffleItems = true,
  timeLimitSeconds,
}: AssignmentDeliverySummaryInput & {
  itemCount: number;
  ruleIds: PublicAssignmentRuleSummaryId[];
}): PublicAssignmentRuleSummaryStats {
  return {
    collectsStudentName: collectStudentName,
    hasAttemptLimit: isPositiveWholeNumber(maxAttempts),
    hasCloseTime: hasAssignmentCloseTime(expiresAt),
    hasTimer: normalizeAttemptTimeLimitSeconds(timeLimitSeconds) !== undefined,
    itemCount: normalizeAssignmentItemCount(itemCount),
    ruleCount: ruleIds.length,
    ruleIds,
    shufflesItems: shuffleItems,
    showsCorrectAnswers: showCorrectAnswers,
  };
}

function buildPublicAssignmentRuleSummaryStatusView(
  summary: PublicAssignmentRuleSummaryStats
): PublicAssignmentRuleSummaryStatusView {
  const status = resolvePublicAssignmentRuleSummaryStatus(summary);
  const label = formatPublicAssignmentRuleSummaryStatusLabel(status);
  const description =
    formatPublicAssignmentRuleSummaryStatusDescription(status);

  return {
    ariaLabel: m.assignment_delivery_public_rules_status_aria({
      description,
      label,
    }),
    description,
    label,
    status,
    tone:
      status === 'open' || status === 'attempt-limited'
        ? 'neutral'
        : 'attention',
  };
}

function resolvePublicAssignmentRuleSummaryStatus({
  hasAttemptLimit,
  hasCloseTime,
  hasTimer,
}: Pick<
  PublicAssignmentRuleSummaryStats,
  'hasAttemptLimit' | 'hasCloseTime' | 'hasTimer'
>): PublicAssignmentRuleSummaryStatus {
  if (hasTimer && hasCloseTime) return 'timed-scheduled';
  if (hasTimer) return 'timed';
  if (hasCloseTime) return 'scheduled';
  if (hasAttemptLimit) return 'attempt-limited';

  return 'open';
}

function formatPublicAssignmentRuleSummaryStatusLabel(
  status: PublicAssignmentRuleSummaryStatus
) {
  switch (status) {
    case 'attempt-limited':
      return m.assignment_delivery_public_rules_status_attempt_limited_label();
    case 'open':
      return m.assignment_delivery_public_rules_status_open_label();
    case 'scheduled':
      return m.assignment_delivery_public_rules_status_scheduled_label();
    case 'timed':
      return m.assignment_delivery_public_rules_status_timed_label();
    case 'timed-scheduled':
      return m.assignment_delivery_public_rules_status_timed_scheduled_label();
  }
}

function formatPublicAssignmentRuleSummaryStatusDescription(
  status: PublicAssignmentRuleSummaryStatus
) {
  switch (status) {
    case 'attempt-limited':
      return m.assignment_delivery_public_rules_status_attempt_limited_description();
    case 'open':
      return m.assignment_delivery_public_rules_status_open_description();
    case 'scheduled':
      return m.assignment_delivery_public_rules_status_scheduled_description();
    case 'timed':
      return m.assignment_delivery_public_rules_status_timed_description();
    case 'timed-scheduled':
      return m.assignment_delivery_public_rules_status_timed_scheduled_description();
  }
}

function hasAssignmentCloseTime(expiresAt: AssignmentDate) {
  return normalizeAssignmentLifecycleTimestamp(expiresAt) !== undefined;
}

export function formatAssignmentAttempts(maxAttempts?: number | null) {
  return isPositiveWholeNumber(maxAttempts)
    ? m.assignment_delivery_attempts_max({ count: maxAttempts })
    : m.assignment_delivery_attempts_open();
}

export function formatAssignmentExpiry(expiresAt: AssignmentDate) {
  const timestamp = normalizeAssignmentLifecycleTimestamp(expiresAt);
  if (timestamp === undefined) {
    return m.assignment_delivery_expiry_none();
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function formatAssignmentTimeLimit(seconds?: number | null) {
  const normalizedSeconds = normalizeAttemptTimeLimitSeconds(seconds);
  if (normalizedSeconds === undefined) {
    return m.assignment_delivery_timer_none();
  }

  const minutes = Math.max(1, Math.ceil(normalizedSeconds / 60));
  return m.assignment_delivery_timer_minutes({ minutes });
}

function isPositiveWholeNumber(value?: number | null) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value > 0
  );
}

function buildAssignmentInstructionSummary(
  instructions: string | undefined
): AssignmentInstructionSummary {
  const normalizedInstructions =
    formatAssignmentDeliveryInstructions(instructions);

  return {
    isEmpty: !normalizedInstructions,
    label: m.assignment_delivery_label_instructions(),
    value:
      normalizedInstructions && normalizedInstructions.length > 0
        ? normalizedInstructions
        : m.assignment_delivery_instructions_none(),
  };
}

function buildAssignmentSettingsSummaryStats({
  expiresAt,
  instructions,
  deliveryRuleCount,
  maxAttempts,
  timeLimitSeconds,
}: {
  deliveryRuleCount: number;
  expiresAt: AssignmentDate;
  instructions?: string;
  maxAttempts?: number | null;
  timeLimitSeconds?: number | null;
}): AssignmentSettingsSummaryStats {
  const hasAttemptLimit = isPositiveWholeNumber(maxAttempts);
  const hasCloseTime = hasAssignmentCloseTime(expiresAt);
  const hasTimer =
    normalizeAttemptTimeLimitSeconds(timeLimitSeconds) !== undefined;
  const status = resolveAssignmentSettingsSummaryStatus({
    hasAttemptLimit,
    hasCloseTime,
    hasTimer,
  });

  return {
    deliveryRuleCount,
    hasAttemptLimit,
    hasCloseTime,
    hasInstructions: Boolean(
      formatAssignmentDeliveryInstructions(instructions)
    ),
    hasTimer,
    status,
  };
}

function resolveAssignmentSettingsSummaryStatus({
  hasAttemptLimit,
  hasCloseTime,
  hasTimer,
}: Pick<
  AssignmentSettingsSummaryStats,
  'hasAttemptLimit' | 'hasCloseTime' | 'hasTimer'
>): AssignmentSettingsSummaryStatus {
  if (hasTimer && hasCloseTime) return 'timed-scheduled';
  if (hasTimer) return 'timed';
  if (hasCloseTime) return 'scheduled';
  if (hasAttemptLimit) return 'attempt-limited';

  return 'open';
}

function buildAssignmentSettingsSummaryStatusView(
  summary: AssignmentSettingsSummaryStats
): AssignmentSettingsSummaryStatusView {
  const value = formatAssignmentSettingsSummaryStatusValue(summary.status);
  const description = formatAssignmentSettingsSummaryStatusDescription(
    summary.status
  );
  const label = m.assignment_settings_summary_status_label();

  return {
    ariaLabel: m.assignment_settings_summary_status_aria({
      description,
      label,
      value,
    }),
    description,
    label,
    status: summary.status,
    tone:
      summary.status === 'open' || summary.status === 'attempt-limited'
        ? 'neutral'
        : 'attention',
    value,
  };
}

function formatAssignmentSettingsSummaryStatusValue(
  status: AssignmentSettingsSummaryStatus
) {
  switch (status) {
    case 'attempt-limited':
      return m.assignment_settings_summary_status_attempt_limited_value();
    case 'open':
      return m.assignment_settings_summary_status_open_value();
    case 'scheduled':
      return m.assignment_settings_summary_status_scheduled_value();
    case 'timed':
      return m.assignment_settings_summary_status_timed_value();
    case 'timed-scheduled':
      return m.assignment_settings_summary_status_timed_scheduled_value();
  }
}

function formatAssignmentSettingsSummaryStatusDescription(
  status: AssignmentSettingsSummaryStatus
) {
  switch (status) {
    case 'attempt-limited':
      return m.assignment_settings_summary_status_attempt_limited_description();
    case 'open':
      return m.assignment_settings_summary_status_open_description();
    case 'scheduled':
      return m.assignment_settings_summary_status_scheduled_description();
    case 'timed':
      return m.assignment_settings_summary_status_timed_description();
    case 'timed-scheduled':
      return m.assignment_settings_summary_status_timed_scheduled_description();
  }
}

function formatStudentIdentity(collectStudentName: boolean) {
  return collectStudentName
    ? m.assignment_delivery_identity_names()
    : m.assignment_delivery_identity_anonymous();
}

function formatAnswerReveal(showCorrectAnswers: boolean) {
  return showCorrectAnswers
    ? m.assignment_delivery_answer_reveal_after_submit()
    : m.assignment_delivery_answer_reveal_hidden();
}

function formatShuffleItems(shuffleItems: boolean) {
  return shuffleItems
    ? m.assignment_delivery_item_order_shuffled()
    : m.assignment_delivery_item_order_fixed();
}

function toPublicAssignmentRuleSummaryItem(
  item: PublicAssignmentRuleSummarySourceItem
): PublicAssignmentRuleSummaryItem {
  const description = getPublicAssignmentRuleDescription(item.descriptionState);

  return {
    ariaLabel: m.assignment_delivery_public_rule_aria({
      description,
      label: item.label,
      value: item.value,
    }),
    description,
    id: item.id,
    label: item.label,
    value: item.value,
  };
}

function getPublicAssignmentRuleDescription(
  state: PublicAssignmentRuleDescriptionState
) {
  switch (state) {
    case 'items':
      return m.assignment_delivery_public_rule_items_description();
    case 'attemptsOpen':
      return m.assignment_delivery_public_rule_attempts_open_description();
    case 'attemptsLimited':
      return m.assignment_delivery_public_rule_attempts_limited_description();
    case 'timerNone':
      return m.assignment_delivery_public_rule_timer_none_description();
    case 'timerLimited':
      return m.assignment_delivery_public_rule_timer_limited_description();
    case 'closesNone':
      return m.assignment_delivery_public_rule_closes_none_description();
    case 'closesScheduled':
      return m.assignment_delivery_public_rule_closes_scheduled_description();
    case 'identityAnonymous':
      return m.assignment_delivery_public_rule_identity_anonymous_description();
    case 'identityNames':
      return m.assignment_delivery_public_rule_identity_names_description();
    case 'itemOrderShuffled':
      return m.assignment_delivery_public_rule_item_order_shuffled_description();
    case 'itemOrderFixed':
      return m.assignment_delivery_public_rule_item_order_fixed_description();
    case 'reviewVisible':
      return m.assignment_delivery_public_rule_review_visible_description();
    case 'reviewHidden':
      return m.assignment_delivery_public_rule_review_hidden_description();
  }
}
