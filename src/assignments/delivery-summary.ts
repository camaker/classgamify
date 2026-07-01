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
  showsCorrectAnswers: boolean;
};

export type PublicAssignmentRuleSummaryView = {
  items: PublicAssignmentRuleSummaryItem[];
  summary: PublicAssignmentRuleSummaryStats;
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

export type AssignmentInstructionSummary = {
  isEmpty: boolean;
  label: string;
  value: string;
};

export type AssignmentSettingsSummaryView = {
  instructions: AssignmentInstructionSummary;
  items: AssignmentDeliverySummaryItem[];
  settings: AssignmentSettings;
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

  return {
    instructions: buildAssignmentInstructionSummary(
      resolvedSettings.instructions
    ),
    items: buildAssignmentDeliverySummary({
      collectStudentName: resolvedSettings.collectStudentName,
      expiresAt,
      maxAttempts: resolvedSettings.maxAttempts,
      showCorrectAnswers: resolvedSettings.showCorrectAnswers,
      shuffleItems: resolvedSettings.shuffleItems,
      timeLimitSeconds: resolvedSettings.timeLimitSeconds,
    }),
    settings: resolvedSettings,
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
  ] satisfies PublicAssignmentRuleSummarySourceItem[];
  const items = ruleItems.map(toPublicAssignmentRuleSummaryItem);

  return {
    items,
    summary: buildPublicAssignmentRuleSummaryStats({
      collectStudentName,
      expiresAt,
      itemCount,
      maxAttempts,
      ruleIds: items.map((item) => item.id),
      showCorrectAnswers,
      timeLimitSeconds,
    }),
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
    showsCorrectAnswers: showCorrectAnswers,
  };
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
    case 'reviewVisible':
      return m.assignment_delivery_public_rule_review_visible_description();
    case 'reviewHidden':
      return m.assignment_delivery_public_rule_review_hidden_description();
  }
}
