import {
  buildActivityLifecycleActionView,
  type ActivityDerivativeBlockedReason,
} from '@/activities/lifecycle';
import type {
  ActivityVisibility,
  AssignmentSettings,
} from '@/activities/types';
import {
  type AssignmentDeliverySummaryId,
  type AssignmentSettingsSummaryView,
  buildAssignmentSettingsSummaryView,
} from '@/assignments/delivery-summary';
import {
  ASSIGNMENT_MAX_ATTEMPTS_RANGE,
  ASSIGNMENT_PUBLISH_FIELD_LIMITS,
  ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE,
  defaultAssignmentSettings,
  resolveAssignmentSettings,
} from '@/assignments/validation';
import {
  type AssignmentPublishCloseAfterResolution,
  type AssignmentPublishCloseAfterStatus,
  resolveAssignmentPublishCloseAfterLocal,
} from '@/assignments/publish-schedule';
import { normalizeRuntimeDisplayText } from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

export function parseOptionalWholeNumber(value: string) {
  const trimmed = normalizePublishDraftText(value).replace(/\s+/gu, '');
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return undefined;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export type AssignmentPublishDraft = {
  activityId: string;
  collectStudentName: boolean;
  expiresAtLocal: string;
  instructions: string;
  maxAttempts: string;
  now?: Date;
  showCorrectAnswers: boolean;
  shuffleItems: boolean;
  timeLimitMinutes: string;
  title: string;
};

export type AssignmentPublishValidationCode =
  | 'close-time-invalid'
  | 'close-time-past'
  | 'instructions-too-long'
  | 'max-attempts-invalid'
  | 'time-limit-invalid'
  | 'title-required'
  | 'title-too-long'
  | 'title-too-short';

export type AssignmentPublishBlockedReason =
  | AssignmentPublishValidationCode
  | ActivityDerivativeBlockedReason;

type AssignmentPublishDraftResult =
  | {
      input: {
        activityId: string;
        expiresAt?: string;
        settings: {
          collectStudentName: boolean;
          instructions?: string;
          maxAttempts?: number | null;
          showCorrectAnswers: boolean;
          shuffleItems: boolean;
          timeLimitSeconds?: number;
        };
        title: string;
      };
      ok: true;
    }
  | {
      message: string;
      ok: false;
      reason: AssignmentPublishValidationCode;
    };

export type AssignmentPublishExecutionPlan =
  | {
      failureMessage: string;
      message: string;
      reason: AssignmentPublishBlockedReason;
      type: 'blocked';
    }
  | {
      failureMessage: string;
      input: {
        activityId: string;
        expiresAt?: string;
        settings: {
          collectStudentName: boolean;
          instructions?: string;
          maxAttempts?: number | null;
          showCorrectAnswers: boolean;
          shuffleItems: boolean;
          timeLimitSeconds?: number;
        };
        title: string;
      };
      successMessage: string;
      type: 'publish';
    };

export type AssignmentPublishDraftValidation =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
      reason: AssignmentPublishValidationCode;
    };

export type AssignmentPublishPreviewContextStatId =
  | 'closeAfter'
  | 'deliveryRules'
  | 'studentInstructions'
  | 'timer';

export type AssignmentPublishPreviewReviewItemId =
  | 'results-policy'
  | 'snapshot-freeze'
  | 'student-link-rules';

export type AssignmentPublishPreviewContextTone = 'blocked' | 'ready';

export type AssignmentPublishDialogAccessStatus = 'blocked' | 'ready';

export type AssignmentPublishDialogAccessView = {
  ariaLabel: string;
  canOpen: boolean;
  canPublish: boolean;
  description: string;
  label: string;
  message?: string;
  status: AssignmentPublishDialogAccessStatus;
  value: string;
};

export type AssignmentPublishPreviewContextStatusView = {
  label: string;
  message: string;
  tone: AssignmentPublishPreviewContextTone;
};

export type AssignmentPublishPreviewContextStatView = {
  id: AssignmentPublishPreviewContextStatId;
  label: string;
  value: string;
};

export type AssignmentPublishPreviewReviewItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentPublishPreviewReviewItemId;
  label: string;
};

export type AssignmentPublishPreviewContextSummary = {
  closeAfterStatus: AssignmentPublishCloseAfterStatus;
  deliveryRuleCount: number;
  hasCloseAfter: boolean;
  hasInstructions: boolean;
  hasTimer: boolean;
  status: AssignmentPublishPreviewContextTone;
};

export type AssignmentPublishPreviewContextView = {
  description: string;
  reviewItems: AssignmentPublishPreviewReviewItemView[];
  reviewLabel: string;
  statItems: AssignmentPublishPreviewContextStatView[];
  status: AssignmentPublishPreviewContextStatusView;
  summary: AssignmentPublishPreviewContextSummary;
  title: string;
};

export const ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS = [
  'publish-access',
  'publish-action',
  'publish-disabled',
  'validation-status',
  'validation-message',
  'title-field',
  'frozen-link-status',
  'delivery-rule-count',
  'student-instructions',
  'timer-status',
  'close-time-status',
  'attempts-policy',
  'identity-policy',
  'answer-reveal-policy',
  'item-order-policy',
  'settings-json',
  'close-time-parser',
  'snapshot-freeze',
  'student-link-rules',
  'results-policy',
] as const;

export type AssignmentPublishHandoffItemId =
  (typeof ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS)[number];

export type AssignmentPublishHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentPublishHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type AssignmentPublishHandoffPrivacyContract = {
  exposesActivityContent: false;
  exposesAnswerKeys: false;
  exposesAssignmentTitle: false;
  exposesRawSettingsJson: false;
  exposesShareSlug: false;
  exposesStudentInstructions: false;
  exposesStudentNames: false;
  itemIds: AssignmentPublishHandoffItemId[];
};

export type AssignmentPublishHandoffView = {
  description: string;
  itemViews: AssignmentPublishHandoffItemView[];
  privacy: AssignmentPublishHandoffPrivacyContract;
  title: string;
};

export type AssignmentPublishPreview = {
  closeAfter: AssignmentPublishCloseAfterResolution;
  context: AssignmentPublishPreviewContextView;
  expiresAt: Date | null;
  settings: AssignmentSettings;
  settingsSummaryView: AssignmentSettingsSummaryView;
};

export type AssignmentPublishDialogState = {
  errorMessage?: string;
  publishDisabled: boolean;
};

export type AssignmentPublishDraftValues = Partial<
  Omit<AssignmentPublishDraft, 'activityId' | 'now'>
>;

export type AssignmentPublishDialogViewModel = {
  accessView: AssignmentPublishDialogAccessView;
  dialogState: AssignmentPublishDialogState;
  draft: AssignmentPublishDraft;
  handoffView: AssignmentPublishHandoffView;
  preview: AssignmentPublishPreview;
  toggleViews: AssignmentPublishToggleView[];
  validation: AssignmentPublishDraftValidation;
};

export type AssignmentPublishToggleKey =
  | 'collectStudentName'
  | 'showCorrectAnswers'
  | 'shuffleItems';

type AssignmentPublishToggleOption = {
  description: string;
  key: AssignmentPublishToggleKey;
  label: string;
};

export type AssignmentPublishToggleView = AssignmentPublishToggleOption & {
  checked: boolean;
};

export const assignmentPublishDialogCopy = {
  get cancelLabel() {
    return m.assignment_publish_dialog_cancel();
  },
  get closeAfterHelp() {
    return m.assignment_publish_dialog_close_after_help();
  },
  get closeAfterLabel() {
    return m.assignment_publish_dialog_close_after_label();
  },
  get description() {
    return m.assignment_publish_dialog_description();
  },
  get accessLabel() {
    return m.assignment_publish_dialog_access_label();
  },
  get instructionsLabel() {
    return m.assignment_publish_dialog_instructions_label();
  },
  get instructionsHelp() {
    return m.assignment_publish_dialog_instructions_help();
  },
  get instructionsPlaceholder() {
    return m.assignment_publish_dialog_instructions_placeholder();
  },
  get maxAttemptsLabel() {
    return m.assignment_publish_dialog_max_attempts_label();
  },
  get maxAttemptsHelp() {
    return m.assignment_publish_dialog_max_attempts_help();
  },
  get previewLabel() {
    return m.assignment_publish_dialog_preview_label();
  },
  get previewContextDescription() {
    return m.assignment_publish_preview_context_description();
  },
  get previewContextTitle() {
    return m.assignment_publish_preview_context_title();
  },
  get publishLabel() {
    return m.assignment_publish_dialog_publish();
  },
  get timeLimitHelp() {
    return m.assignment_publish_dialog_time_limit_help();
  },
  get timeLimitLabel() {
    return m.assignment_publish_dialog_time_limit_label();
  },
  get timeLimitPlaceholder() {
    return m.assignment_publish_dialog_time_limit_placeholder();
  },
  get title() {
    return m.assignment_publish_dialog_title();
  },
  get titleHelp() {
    return m.assignment_publish_dialog_title_help();
  },
  get titleLabel() {
    return m.assignment_publish_dialog_title_label();
  },
} as const;

export const assignmentPublishToggleOptions = [
  {
    get description() {
      return m.assignment_publish_toggle_collect_name_description();
    },
    key: 'collectStudentName',
    get label() {
      return m.assignment_publish_toggle_collect_name_label();
    },
  },
  {
    get description() {
      return m.assignment_publish_toggle_show_answers_description();
    },
    key: 'showCorrectAnswers',
    get label() {
      return m.assignment_publish_toggle_show_answers_label();
    },
  },
  {
    get description() {
      return m.assignment_publish_toggle_shuffle_items_description();
    },
    key: 'shuffleItems',
    get label() {
      return m.assignment_publish_toggle_shuffle_items_label();
    },
  },
] satisfies Array<AssignmentPublishToggleOption>;

export function buildAssignmentPublishToggleViews({
  collectStudentName,
  showCorrectAnswers,
  shuffleItems,
}: Pick<
  AssignmentPublishDraft,
  'collectStudentName' | 'showCorrectAnswers' | 'shuffleItems'
>): AssignmentPublishToggleView[] {
  const checkedByKey = {
    collectStudentName,
    showCorrectAnswers,
    shuffleItems,
  } satisfies Record<AssignmentPublishToggleKey, boolean>;

  return assignmentPublishToggleOptions.map((option) => ({
    ...option,
    checked: checkedByKey[option.key],
  }));
}

export function buildAssignmentPublishDraftDefaults({
  activityId,
  title,
}: {
  activityId: string;
  title: string;
}): AssignmentPublishDraft {
  return {
    activityId,
    collectStudentName: defaultAssignmentSettings.collectStudentName,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: String(defaultAssignmentSettings.maxAttempts ?? 2),
    showCorrectAnswers: defaultAssignmentSettings.showCorrectAnswers,
    shuffleItems: defaultAssignmentSettings.shuffleItems,
    timeLimitMinutes: '',
    title,
  };
}

export function buildAssignmentPublishDraft({
  defaults,
  values,
}: {
  defaults: AssignmentPublishDraft;
  values: AssignmentPublishDraftValues;
}): AssignmentPublishDraft {
  return {
    ...defaults,
    ...values,
    activityId: defaults.activityId,
  };
}

export function buildAssignmentPublishDialogViewModel({
  defaults,
  isPublishing = false,
  now,
  values,
  visibility = 'draft',
}: {
  defaults: AssignmentPublishDraft;
  isPublishing?: boolean;
  now?: Date;
  values: AssignmentPublishDraftValues;
  visibility?: ActivityVisibility;
}): AssignmentPublishDialogViewModel {
  const draft = buildAssignmentPublishDraft({ defaults, values });
  const effectiveNow = now ?? new Date();
  const validation = validateAssignmentPublishDraft({
    ...draft,
    now: effectiveNow,
  });
  const accessView = buildAssignmentPublishDialogAccessView(visibility);
  const dialogState = buildAssignmentPublishDialogState({
    accessView,
    isPublishing,
    validation,
  });
  const preview = buildAssignmentPublishPreviewFromDraft({
    draft,
    now: effectiveNow,
    validation,
  });
  const toggleViews = buildAssignmentPublishToggleViews(draft);

  return {
    accessView,
    dialogState,
    draft,
    handoffView: buildAssignmentPublishHandoffView({
      accessView,
      dialogState,
      draft,
      preview,
      toggleViews,
      validation,
    }),
    preview,
    toggleViews,
    validation,
  };
}

export function buildAssignmentPublishDialogAccessView(
  visibility: ActivityVisibility
): AssignmentPublishDialogAccessView {
  const actionView = buildActivityLifecycleActionView({
    action: 'publish',
    visibility,
  });
  const blockedGate =
    actionView.gate.type === 'blocked' ? actionView.gate : undefined;
  const label = m.assignment_publish_dialog_access_label();
  const value = blockedGate
    ? m.assignment_publish_dialog_access_blocked_value()
    : m.assignment_publish_dialog_access_ready_value();
  const description = blockedGate
    ? m.assignment_publish_dialog_access_blocked_description({
        reason: blockedGate.message,
      })
    : m.assignment_publish_dialog_access_ready_description();

  return {
    ariaLabel: m.assignment_publish_dialog_access_aria_label({
      description,
      label,
      value,
    }),
    canOpen: !blockedGate,
    canPublish: !blockedGate,
    description,
    label,
    ...(blockedGate ? { message: blockedGate.message } : {}),
    status: blockedGate ? 'blocked' : 'ready',
    value,
  };
}

export function buildAssignmentPublishPreviewFromDraft({
  draft,
  now,
  validation,
}: {
  draft: AssignmentPublishDraft;
  now?: Date;
  validation?: AssignmentPublishDraftValidation;
}): AssignmentPublishPreview {
  const effectiveNow = now ?? new Date();
  const closeAfter = resolveAssignmentPublishCloseAfterLocal({
    now: effectiveNow,
    value: draft.expiresAtLocal,
  });
  const expiresAt = closeAfter.status === 'ready' ? closeAfter.expiresAt : null;
  const settings = buildAssignmentPublishSettingsFromDraft(draft);
  const settingsSummaryView = buildAssignmentSettingsSummaryView({
    expiresAt,
    settings,
  });
  const previewValidation =
    validation ??
    validateAssignmentPublishDraft({
      ...draft,
      now: effectiveNow,
    });

  return {
    closeAfter,
    context: buildAssignmentPublishPreviewContextView({
      closeAfter,
      settingsSummaryView,
      validation: previewValidation,
    }),
    expiresAt,
    settings,
    settingsSummaryView,
  };
}

export function buildAssignmentPublishPreviewContextView({
  closeAfter,
  settingsSummaryView,
  validation,
}: {
  closeAfter: AssignmentPublishCloseAfterResolution;
  settingsSummaryView: AssignmentSettingsSummaryView;
  validation: AssignmentPublishDraftValidation;
}): AssignmentPublishPreviewContextView {
  const status = validation.ok ? 'ready' : 'blocked';
  const hasInstructions = !settingsSummaryView.instructions.isEmpty;
  const hasTimer = settingsSummaryView.settings.timeLimitSeconds !== undefined;
  const hasCloseAfter = closeAfter.status === 'ready';
  const deliveryRuleCount = settingsSummaryView.summary.deliveryRuleCount;

  return {
    description: m.assignment_publish_preview_context_description(),
    reviewItems: buildAssignmentPublishPreviewReviewItems(),
    reviewLabel: m.assignment_publish_preview_review_label(),
    statItems: [
      {
        id: 'deliveryRules',
        label: m.assignment_publish_preview_stat_rules_label(),
        value: m.assignment_publish_preview_stat_rules_value({
          count: deliveryRuleCount,
        }),
      },
      {
        id: 'studentInstructions',
        label: m.assignment_publish_preview_stat_instructions_label(),
        value: hasInstructions
          ? m.assignment_publish_preview_stat_instructions_ready()
          : m.assignment_publish_preview_stat_instructions_empty(),
      },
      {
        id: 'timer',
        label: m.assignment_publish_preview_stat_timer_label(),
        value: hasTimer
          ? m.assignment_publish_preview_stat_timer_enabled()
          : m.assignment_publish_preview_stat_timer_off(),
      },
      {
        id: 'closeAfter',
        label: m.assignment_publish_preview_stat_close_after_label(),
        value: formatAssignmentPublishPreviewCloseAfterStat(closeAfter.status),
      },
    ],
    status: {
      label: validation.ok
        ? m.assignment_publish_preview_status_ready_label()
        : m.assignment_publish_preview_status_blocked_label(),
      message: validation.ok
        ? m.assignment_publish_preview_status_ready_message()
        : m.assignment_publish_preview_status_blocked_message(),
      tone: status,
    },
    summary: {
      closeAfterStatus: closeAfter.status,
      deliveryRuleCount,
      hasCloseAfter,
      hasInstructions,
      hasTimer,
      status,
    },
    title: m.assignment_publish_preview_context_title(),
  };
}

export function buildAssignmentPublishHandoffView({
  accessView,
  dialogState,
  draft,
  preview,
  toggleViews,
  validation,
}: {
  accessView: AssignmentPublishDialogAccessView;
  dialogState: AssignmentPublishDialogState;
  draft: AssignmentPublishDraft;
  preview: AssignmentPublishPreview;
  toggleViews: AssignmentPublishToggleView[];
  validation: AssignmentPublishDraftValidation;
}): AssignmentPublishHandoffView {
  const deliveryRuleStat = getAssignmentPublishPreviewStat(
    preview.context,
    'deliveryRules'
  );
  const instructionsStat = getAssignmentPublishPreviewStat(
    preview.context,
    'studentInstructions'
  );
  const timerStat = getAssignmentPublishPreviewStat(preview.context, 'timer');
  const closeAfterStat = getAssignmentPublishPreviewStat(
    preview.context,
    'closeAfter'
  );
  const attemptsPolicy = getAssignmentPublishDeliveryPolicy(
    preview.settingsSummaryView,
    'attempts'
  );
  const identityPolicy = getAssignmentPublishDeliveryPolicy(
    preview.settingsSummaryView,
    'identity'
  );
  const answerRevealPolicy = getAssignmentPublishDeliveryPolicy(
    preview.settingsSummaryView,
    'answerReveal'
  );
  const itemOrderPolicy = getAssignmentPublishDeliveryPolicy(
    preview.settingsSummaryView,
    'itemOrder'
  );
  const snapshotReview = getAssignmentPublishReviewItem(
    preview.context,
    'snapshot-freeze'
  );
  const studentLinkReview = getAssignmentPublishReviewItem(
    preview.context,
    'student-link-rules'
  );
  const resultsReview = getAssignmentPublishReviewItem(
    preview.context,
    'results-policy'
  );
  const actionValue = dialogState.publishDisabled
    ? m.assignment_publish_handoff_disabled_value()
    : m.assignment_publish_handoff_enabled_value();
  const validationStatusValue = validation.ok
    ? m.assignment_publish_preview_status_ready_label()
    : m.assignment_publish_preview_status_blocked_label();
  const itemViews: AssignmentPublishHandoffItemView[] = [
    buildAssignmentPublishHandoffItem({
      description: accessView.description,
      id: 'publish-access',
      label: accessView.label,
      statusLabel: accessView.status,
      value: accessView.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_publish_action_description(),
      id: 'publish-action',
      label: m.assignment_publish_handoff_publish_action_label(),
      statusLabel: actionValue,
      value: actionValue,
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_publish_disabled_description(),
      id: 'publish-disabled',
      label: m.assignment_publish_handoff_publish_disabled_label(),
      statusLabel: actionValue,
      value: actionValue,
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_validation_status_description(),
      id: 'validation-status',
      label: m.assignment_publish_handoff_validation_status_label(),
      statusLabel: validationStatusValue,
      value: validationStatusValue,
    }),
    buildAssignmentPublishHandoffItem({
      description:
        m.assignment_publish_handoff_validation_message_description(),
      id: 'validation-message',
      label: m.assignment_publish_handoff_validation_message_label(),
      statusLabel: validationStatusValue,
      value: validation.ok
        ? m.assignment_publish_handoff_no_validation_blocker()
        : validation.message,
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_title_field_description(),
      id: 'title-field',
      label: assignmentPublishDialogCopy.titleLabel,
      value: normalizePublishDraftText(draft.title)
        ? m.assignment_publish_handoff_field_present()
        : m.assignment_publish_handoff_field_missing(),
    }),
    buildAssignmentPublishHandoffItem({
      description: preview.context.status.message,
      id: 'frozen-link-status',
      label: preview.context.title,
      statusLabel: preview.context.status.label,
      value: preview.context.status.label,
    }),
    buildAssignmentPublishHandoffItem({
      description: preview.context.description,
      id: 'delivery-rule-count',
      label: deliveryRuleStat.label,
      value: deliveryRuleStat.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: assignmentPublishDialogCopy.instructionsHelp,
      id: 'student-instructions',
      label: instructionsStat.label,
      value: instructionsStat.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: assignmentPublishDialogCopy.timeLimitHelp,
      id: 'timer-status',
      label: timerStat.label,
      value: timerStat.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: assignmentPublishDialogCopy.closeAfterHelp,
      id: 'close-time-status',
      label: closeAfterStat.label,
      statusLabel: preview.closeAfter.status,
      value: closeAfterStat.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_attempts_description(),
      id: 'attempts-policy',
      label: attemptsPolicy.label,
      value: attemptsPolicy.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: getAssignmentPublishToggleDescription(
        toggleViews,
        'collectStudentName'
      ),
      id: 'identity-policy',
      label: identityPolicy.label,
      value: identityPolicy.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: getAssignmentPublishToggleDescription(
        toggleViews,
        'showCorrectAnswers'
      ),
      id: 'answer-reveal-policy',
      label: answerRevealPolicy.label,
      value: answerRevealPolicy.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: getAssignmentPublishToggleDescription(
        toggleViews,
        'shuffleItems'
      ),
      id: 'item-order-policy',
      label: itemOrderPolicy.label,
      value: itemOrderPolicy.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_settings_json_description(),
      id: 'settings-json',
      label: m.assignment_publish_handoff_settings_json_label(),
      value: m.assignment_publish_handoff_settings_json_value({
        count: countAssignmentPublishSettingsJsonFields(),
      }),
    }),
    buildAssignmentPublishHandoffItem({
      description: m.assignment_publish_handoff_close_parser_description(),
      id: 'close-time-parser',
      label: m.assignment_publish_handoff_close_parser_label(),
      statusLabel: preview.closeAfter.status,
      value: closeAfterStat.value,
    }),
    buildAssignmentPublishHandoffItem({
      description: snapshotReview.description,
      id: 'snapshot-freeze',
      label: snapshotReview.label,
      value: preview.context.status.label,
    }),
    buildAssignmentPublishHandoffItem({
      description: studentLinkReview.description,
      id: 'student-link-rules',
      label: studentLinkReview.label,
      value: preview.context.status.label,
    }),
    buildAssignmentPublishHandoffItem({
      description: resultsReview.description,
      id: 'results-policy',
      label: resultsReview.label,
      value: preview.context.status.label,
    }),
  ];

  return {
    description: m.assignment_publish_handoff_description(),
    itemViews,
    privacy: buildAssignmentPublishHandoffPrivacyContract(itemViews),
    title: m.assignment_publish_handoff_title(),
  };
}

function getAssignmentPublishPreviewStat(
  context: AssignmentPublishPreviewContextView,
  id: AssignmentPublishPreviewContextStatId
) {
  return (
    context.statItems.find((item) => item.id === id) ?? {
      id,
      label: id,
      value: '',
    }
  );
}

function getAssignmentPublishDeliveryPolicy(
  settingsSummaryView: AssignmentSettingsSummaryView,
  id: AssignmentDeliverySummaryId
) {
  return (
    settingsSummaryView.items.find((item) => item.id === id) ?? {
      id,
      label: id,
      value: '',
    }
  );
}

function getAssignmentPublishReviewItem(
  context: AssignmentPublishPreviewContextView,
  id: AssignmentPublishPreviewReviewItemId
) {
  return (
    context.reviewItems.find((item) => item.id === id) ?? {
      ariaLabel: id,
      description: '',
      id,
      label: id,
    }
  );
}

function getAssignmentPublishToggleDescription(
  toggleViews: AssignmentPublishToggleView[],
  key: AssignmentPublishToggleKey
) {
  return (
    toggleViews.find((toggleView) => toggleView.key === key)?.description ?? ''
  );
}

function countAssignmentPublishSettingsJsonFields() {
  return 6;
}

function buildAssignmentPublishHandoffPrivacyContract(
  itemViews: AssignmentPublishHandoffItemView[]
): AssignmentPublishHandoffPrivacyContract {
  return {
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesRawSettingsJson: false,
    exposesShareSlug: false,
    exposesStudentInstructions: false,
    exposesStudentNames: false,
    itemIds: itemViews.map((item) => item.id),
  };
}

function buildAssignmentPublishHandoffItem({
  description,
  id,
  label,
  statusLabel,
  value,
}: {
  description: string;
  id: AssignmentPublishHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
}): AssignmentPublishHandoffItemView {
  return {
    ariaLabel: m.assignment_publish_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    statusLabel,
    value,
  };
}

function formatAssignmentPublishPreviewCloseAfterStat(
  status: AssignmentPublishCloseAfterStatus
) {
  switch (status) {
    case 'ready':
      return m.assignment_publish_preview_stat_close_after_scheduled();
    case 'invalid':
      return m.assignment_publish_preview_stat_close_after_invalid();
    case 'past':
      return m.assignment_publish_preview_stat_close_after_past();
    case 'none':
      return m.assignment_publish_preview_stat_close_after_open();
  }
}

function buildAssignmentPublishPreviewReviewItems(): AssignmentPublishPreviewReviewItemView[] {
  const items = [
    {
      description: m.assignment_publish_preview_review_snapshot_description(),
      id: 'snapshot-freeze',
      label: m.assignment_publish_preview_review_snapshot_label(),
    },
    {
      description: m.assignment_publish_preview_review_student_description(),
      id: 'student-link-rules',
      label: m.assignment_publish_preview_review_student_label(),
    },
    {
      description: m.assignment_publish_preview_review_results_description(),
      id: 'results-policy',
      label: m.assignment_publish_preview_review_results_label(),
    },
  ] satisfies Array<Omit<AssignmentPublishPreviewReviewItemView, 'ariaLabel'>>;

  return items.map((item) => ({
    ...item,
    ariaLabel: m.assignment_publish_preview_review_item_aria({
      description: item.description,
      label: item.label,
    }),
  }));
}

export function validateAssignmentPublishDraft({
  expiresAtLocal,
  instructions,
  maxAttempts,
  now = new Date(),
  timeLimitMinutes,
  title,
}: AssignmentPublishDraft): AssignmentPublishDraftValidation {
  const trimmedTitle = normalizePublishDraftText(title);
  if (!trimmedTitle) {
    return {
      message: m.assignment_publish_validation_title_required(),
      ok: false,
      reason: 'title-required',
    };
  }

  if (trimmedTitle.length < ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength) {
    return {
      message: m.assignment_publish_validation_title_min({
        min: ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength,
      }),
      ok: false,
      reason: 'title-too-short',
    };
  }

  if (trimmedTitle.length > ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMaxLength) {
    return {
      message: m.assignment_publish_validation_title_max({
        max: ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMaxLength,
      }),
      ok: false,
      reason: 'title-too-long',
    };
  }

  if (
    normalizePublishDraftText(instructions).length >
    ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength
  ) {
    return {
      message: m.assignment_publish_validation_instructions_max({
        max: ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength,
      }),
      ok: false,
      reason: 'instructions-too-long',
    };
  }

  if (
    !isAssignmentPublishMaxAttemptsBlank(maxAttempts) &&
    parseAssignmentPublishMaxAttempts(maxAttempts) === undefined
  ) {
    return {
      message: m.assignment_publish_validation_max_attempts(),
      ok: false,
      reason: 'max-attempts-invalid',
    };
  }

  const timeLimit = parseOptionalWholeNumber(timeLimitMinutes);
  if (
    normalizePublishDraftText(timeLimitMinutes) &&
    !isWholeNumberInRange(timeLimit, ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE)
  ) {
    return {
      message: m.assignment_publish_validation_time_limit(),
      ok: false,
      reason: 'time-limit-invalid',
    };
  }

  const closeAfter = resolveAssignmentPublishCloseAfterLocal({
    now,
    value: expiresAtLocal,
  });
  if (closeAfter.status === 'invalid') {
    return {
      message: m.assignment_publish_validation_close_time_valid(),
      ok: false,
      reason: 'close-time-invalid',
    };
  }

  if (closeAfter.status === 'past') {
    return {
      message: m.assignment_publish_validation_close_time_future(),
      ok: false,
      reason: 'close-time-past',
    };
  }

  return { ok: true };
}

export function buildAssignmentPublishDialogState({
  accessView,
  isPublishing = false,
  validation,
}: {
  accessView?: AssignmentPublishDialogAccessView;
  isPublishing?: boolean;
  validation: AssignmentPublishDraftValidation;
}): AssignmentPublishDialogState {
  const accessBlocked = accessView ? !accessView.canPublish : false;

  return {
    errorMessage: validation.ok ? undefined : validation.message,
    publishDisabled: isPublishing || !validation.ok || accessBlocked,
  };
}

export function buildAssignmentPublishInputFromDraft({
  activityId,
  collectStudentName,
  expiresAtLocal,
  instructions,
  maxAttempts,
  now = new Date(),
  showCorrectAnswers,
  shuffleItems,
  timeLimitMinutes,
  title,
}: AssignmentPublishDraft): AssignmentPublishDraftResult {
  const validation = validateAssignmentPublishDraft({
    activityId,
    collectStudentName,
    expiresAtLocal,
    instructions,
    maxAttempts,
    now,
    showCorrectAnswers,
    shuffleItems,
    timeLimitMinutes,
    title,
  });
  if (!validation.ok) return validation;

  const trimmedTitle = normalizePublishDraftText(title);
  const closeAfter = resolveAssignmentPublishCloseAfterLocal({
    now,
    value: expiresAtLocal,
  });
  const settings = buildAssignmentPublishSettingsFromDraft({
    activityId,
    collectStudentName,
    expiresAtLocal,
    instructions,
    maxAttempts,
    now,
    showCorrectAnswers,
    shuffleItems,
    timeLimitMinutes,
    title,
  });

  return {
    input: {
      activityId,
      expiresAt: closeAfter.expiresAt?.toISOString(),
      settings,
      title: trimmedTitle,
    },
    ok: true,
  };
}

export function buildActivityPublishExecutionPlan({
  draft,
  visibility,
}: {
  draft: AssignmentPublishDraft;
  visibility: ActivityVisibility;
}): AssignmentPublishExecutionPlan {
  const actionView = buildActivityLifecycleActionView({
    action: 'publish',
    visibility,
  });

  if (actionView.gate.type === 'blocked') {
    return {
      failureMessage: actionView.failureMessage,
      message: actionView.gate.message,
      reason: actionView.gate.reason,
      type: 'blocked',
    };
  }

  const draftResult = buildAssignmentPublishInputFromDraft(draft);

  if (!draftResult.ok) {
    return {
      failureMessage: actionView.failureMessage,
      message: draftResult.message,
      reason: draftResult.reason,
      type: 'blocked',
    };
  }

  return {
    failureMessage: actionView.failureMessage,
    input: draftResult.input,
    successMessage: actionView.successMessage,
    type: 'publish',
  };
}

function buildAssignmentPublishSettingsFromDraft({
  collectStudentName,
  instructions,
  maxAttempts,
  showCorrectAnswers,
  shuffleItems,
  timeLimitMinutes,
}: AssignmentPublishDraft): AssignmentSettings {
  const timeLimitMinutesValue =
    parseAssignmentPublishTimeLimitMinutes(timeLimitMinutes);
  const attempts = isAssignmentPublishMaxAttemptsBlank(maxAttempts)
    ? null
    : parseAssignmentPublishMaxAttempts(maxAttempts);

  return resolveAssignmentSettings({
    collectStudentName,
    instructions: normalizePublishDraftText(instructions) || undefined,
    maxAttempts: attempts,
    showCorrectAnswers,
    shuffleItems,
    timeLimitSeconds: timeLimitMinutesValue
      ? timeLimitMinutesValue * 60
      : undefined,
  });
}

function parseAssignmentPublishMaxAttempts(value: string) {
  if (isAssignmentPublishMaxAttemptsBlank(value)) return undefined;

  return parseWholeNumberInRange(value, ASSIGNMENT_MAX_ATTEMPTS_RANGE);
}

function isAssignmentPublishMaxAttemptsBlank(value: string) {
  return normalizePublishDraftText(value).length === 0;
}

function parseAssignmentPublishTimeLimitMinutes(value: string) {
  return parseWholeNumberInRange(value, ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE);
}

function parseWholeNumberInRange(
  value: string,
  range: { max: number; min: number }
) {
  const parsed = parseOptionalWholeNumber(value);
  return isWholeNumberInRange(parsed, range) ? parsed : undefined;
}

function isWholeNumberInRange(
  value: number | undefined,
  range: { max: number; min: number }
) {
  return (
    value !== undefined &&
    Number.isInteger(value) &&
    value >= range.min &&
    value <= range.max
  );
}

function normalizePublishDraftText(value: string) {
  return normalizeRuntimeDisplayText(value);
}
