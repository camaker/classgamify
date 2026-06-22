import type { AssignmentSettings } from '@/activities/types';
import type { AssignmentDate } from '@/assignments/lifecycle';
import { resolveAssignmentSettings } from '@/assignments/validation';
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
  id: PublicAssignmentRuleSummaryId;
  label: string;
  value: string;
};

export type AssignmentDeliverySummaryInput = {
  collectStudentName?: boolean;
  expiresAt: AssignmentDate;
  maxAttempts?: number | null;
  showCorrectAnswers?: boolean;
  shuffleItems?: boolean;
  timeLimitSeconds?: number | null;
};

type AssignmentSettingsSummaryInput = AssignmentDeliverySummaryInput & {
  instructions?: string;
  settings?: Partial<AssignmentSettings> | null;
};

type AssignmentSettingsSummaryView = {
  instructions?: string;
  items: AssignmentDeliverySummaryItem[];
  settings: AssignmentSettings;
};

export function buildAssignmentDeliverySummary({
  collectStudentName = true,
  expiresAt,
  maxAttempts,
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
      maxAttempts: maxAttempts ?? undefined,
      showCorrectAnswers,
      shuffleItems,
      timeLimitSeconds: timeLimitSeconds ?? undefined,
    }
  );

  return {
    instructions: resolvedSettings.instructions,
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

export function buildPublicAssignmentRuleSummary({
  itemCount,
  ...input
}: AssignmentDeliverySummaryInput & {
  itemCount: number;
}): PublicAssignmentRuleSummaryItem[] {
  return [
    {
      id: 'items',
      label: m.assignment_delivery_label_items(),
      value: formatAssignmentItemCount(itemCount),
    },
    ...buildAssignmentDeliverySummary(input)
      .filter((rule) => rule.id !== 'itemOrder')
      .map((rule) => ({
        ...rule,
        label:
          rule.id === 'answerReveal'
            ? m.assignment_delivery_label_review()
            : rule.label,
      })),
  ];
}

export function buildPublicAssignmentRuleSummaryFromSettings({
  expiresAt,
  itemCount,
  settings,
}: {
  expiresAt: AssignmentDate;
  itemCount: number;
  settings?: Partial<AssignmentSettings> | null;
}): PublicAssignmentRuleSummaryItem[] {
  const resolvedSettings = resolveAssignmentSettings(settings);

  return buildPublicAssignmentRuleSummary({
    collectStudentName: resolvedSettings.collectStudentName,
    expiresAt,
    itemCount,
    maxAttempts: resolvedSettings.maxAttempts,
    showCorrectAnswers: resolvedSettings.showCorrectAnswers,
    timeLimitSeconds: resolvedSettings.timeLimitSeconds,
  });
}

export function formatAssignmentItemCount(itemCount: number) {
  if (itemCount === 1) {
    return m.assignment_delivery_item_count_one({ count: itemCount });
  }

  return m.assignment_delivery_item_count_many({ count: itemCount });
}

function formatAssignmentAttempts(maxAttempts?: number | null) {
  return isPositiveWholeNumber(maxAttempts)
    ? m.assignment_delivery_attempts_max({ count: maxAttempts })
    : m.assignment_delivery_attempts_open();
}

export function formatAssignmentExpiry(expiresAt: AssignmentDate) {
  if (!expiresAt) return m.assignment_delivery_expiry_none();

  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return m.assignment_delivery_expiry_none();
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatAssignmentTimeLimit(seconds?: number | null) {
  if (!isPositiveWholeNumber(seconds))
    return m.assignment_delivery_timer_none();

  const minutes = Math.max(1, Math.ceil(seconds / 60));
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
