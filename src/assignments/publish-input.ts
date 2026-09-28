import {
  buildActivityLifecycleActionView,
  type ActivityDerivativeBlockedReason,
} from '@/activities/lifecycle';
import type {
  ActivityVisibility,
  AssignmentSettings,
} from '@/activities/types';
import {
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

type AssignmentPublishExecutionPlan =
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

type AssignmentPublishDialogAccessStatus = 'blocked' | 'ready';

type AssignmentPublishFieldControlKey =
  | 'closeAfter'
  | 'instructions'
  | 'maxAttempts'
  | 'timeLimit'
  | 'title';

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

export const ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS = [
  'title-input',
  'title-help',
  'instructions-input',
  'instructions-help',
  'attempt-limit-input',
  'attempt-limit-help',
  'timer-input',
  'timer-help',
  'close-time-input',
  'close-time-help',
  'delivery-toggle-group',
  'identity-toggle',
  'answer-reveal-toggle',
  'item-order-toggle',
  'preview-region',
  'preview-title',
  'frozen-link-status',
  'delivery-rule-stats',
  'instructions-stat',
  'timer-stat',
  'close-time-stat',
  'settings-summary',
  'review-checklist',
  'snapshot-freeze',
  'student-link-rules',
  'results-policy',
  'validation-alert',
  'field-limits',
  'publish-action',
  'privacy-guard',
] as const;

export type AssignmentPublishControlBoundaryItemId =
  (typeof ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS)[number];

type AssignmentPublishFieldControlIds = {
  describedByIds: string[];
  helpId: string;
  inputId: string;
};

type AssignmentPublishToggleControlIds = {
  describedByIds: string[];
  descriptionId: string;
  inputId: string;
};

type AssignmentPublishPreviewStatControlIds = {
  labelId: string;
  valueId: string;
};

type AssignmentPublishPreviewReviewControlIds = {
  describedByIds: string[];
  descriptionId: string;
  labelledByIds: string[];
  labelId: string;
};

export type AssignmentPublishControlBoundaryIds = {
  fieldIds: Record<
    AssignmentPublishFieldControlKey,
    AssignmentPublishFieldControlIds
  >;
  previewContextDescription: string;
  previewContextStatusMessage: string;
  previewContextTitle: string;
  previewLabel: string;
  previewReviewLabel: string;
  reviewItemIds: Record<
    AssignmentPublishPreviewReviewItemId,
    AssignmentPublishPreviewReviewControlIds
  >;
  statItemIds: Record<
    AssignmentPublishPreviewContextStatId,
    AssignmentPublishPreviewStatControlIds
  >;
  toggleGroup: string;
  toggleIds: Record<
    AssignmentPublishToggleKey,
    AssignmentPublishToggleControlIds
  >;
  validationAlert: string;
};

export type AssignmentPublishControlBoundaryView = {
  closeAfterStatus: AssignmentPublishCloseAfterStatus;
  controlIdBase: string;
  controlIds: AssignmentPublishControlBoundaryIds;
  deliveryRuleCount: number;
  describesCloseTimeWithHelp: true;
  describesInstructionsWithHelp: true;
  describesMaxAttemptsWithHelp: true;
  describesPreviewWithStatus: true;
  describesPublishTogglesWithHelp: true;
  describesTimeLimitWithHelp: true;
  describesTitleWithHelp: true;
  exposesActivityContent: false;
  exposesAnswerKeys: false;
  exposesAssignmentTitle: false;
  exposesInternalActivityIds: false;
  exposesRawSettingsJson: false;
  exposesShareSlug: false;
  exposesStudentInstructions: false;
  fieldCount: number;
  itemIds: AssignmentPublishControlBoundaryItemId[];
  previewRegionDescribedByIds: string[];
  previewRegionLabelledByIds: string[];
  previewStatCount: number;
  publishDisabled: boolean;
  reviewChecklistLabelledByIds: string[];
  reviewItemCount: number;
  scope: 'assignment-publish-control-semantics';
  status: AssignmentPublishPreviewContextTone;
  toggleCount: number;
  usesOpaqueControlScope: true;
  usesPreparedControlIds: true;
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
  controlBoundary: AssignmentPublishControlBoundaryView;
  dialogState: AssignmentPublishDialogState;
  draft: AssignmentPublishDraft;
  preview: AssignmentPublishPreview;
  toggleViews: AssignmentPublishToggleView[];
  validation: AssignmentPublishDraftValidation;
};

type AssignmentPublishToggleKey =
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
  controlIdBase = 'assignment-publish-control',
  defaults,
  isPublishing = false,
  now,
  values,
  visibility = 'draft',
}: {
  controlIdBase?: string;
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
    controlBoundary: buildAssignmentPublishControlBoundary({
      controlIdBase,
      dialogState,
      preview,
      toggleViews,
    }),
    dialogState,
    draft,
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

function buildAssignmentPublishControlBoundary({
  controlIdBase,
  dialogState,
  preview,
  toggleViews,
}: {
  controlIdBase: string;
  dialogState: AssignmentPublishDialogState;
  preview: AssignmentPublishPreview;
  toggleViews: AssignmentPublishToggleView[];
}): AssignmentPublishControlBoundaryView {
  const controlIds = buildAssignmentPublishControlIds(controlIdBase);

  return {
    closeAfterStatus: preview.closeAfter.status,
    controlIdBase,
    controlIds,
    deliveryRuleCount: preview.context.summary.deliveryRuleCount,
    describesCloseTimeWithHelp: true,
    describesInstructionsWithHelp: true,
    describesMaxAttemptsWithHelp: true,
    describesPreviewWithStatus: true,
    describesPublishTogglesWithHelp: true,
    describesTimeLimitWithHelp: true,
    describesTitleWithHelp: true,
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesInternalActivityIds: false,
    exposesRawSettingsJson: false,
    exposesShareSlug: false,
    exposesStudentInstructions: false,
    fieldCount: Object.keys(controlIds.fieldIds).length,
    itemIds: [...ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS],
    previewRegionDescribedByIds: [
      controlIds.previewContextDescription,
      controlIds.previewContextStatusMessage,
    ],
    previewRegionLabelledByIds: [controlIds.previewLabel],
    previewStatCount: preview.context.statItems.length,
    publishDisabled: dialogState.publishDisabled,
    reviewChecklistLabelledByIds: [controlIds.previewReviewLabel],
    reviewItemCount: preview.context.reviewItems.length,
    scope: 'assignment-publish-control-semantics',
    status: preview.context.summary.status,
    toggleCount: toggleViews.length,
    usesOpaqueControlScope: true,
    usesPreparedControlIds: true,
  };
}

function buildAssignmentPublishControlIds(
  controlIdBase: string
): AssignmentPublishControlBoundaryIds {
  const id = (suffix: string) => `${controlIdBase}-${suffix}`;

  return {
    fieldIds: {
      closeAfter: buildAssignmentPublishFieldControlIds(id, 'expires-at'),
      instructions: buildAssignmentPublishFieldControlIds(
        id,
        'assignment-instructions'
      ),
      maxAttempts: buildAssignmentPublishFieldControlIds(id, 'max-attempts'),
      timeLimit: buildAssignmentPublishFieldControlIds(id, 'time-limit'),
      title: buildAssignmentPublishFieldControlIds(id, 'assignment-title'),
    },
    previewContextDescription: id('preview-context-description'),
    previewContextStatusMessage: id('preview-context-status-message'),
    previewContextTitle: id('preview-context-title'),
    previewLabel: id('preview-label'),
    previewReviewLabel: id('preview-review-label'),
    reviewItemIds: {
      'results-policy': buildAssignmentPublishReviewControlIds(
        id,
        'results-policy'
      ),
      'snapshot-freeze': buildAssignmentPublishReviewControlIds(
        id,
        'snapshot-freeze'
      ),
      'student-link-rules': buildAssignmentPublishReviewControlIds(
        id,
        'student-link-rules'
      ),
    },
    statItemIds: {
      closeAfter: buildAssignmentPublishPreviewStatControlIds(
        id,
        'close-after'
      ),
      deliveryRules: buildAssignmentPublishPreviewStatControlIds(
        id,
        'delivery-rules'
      ),
      studentInstructions: buildAssignmentPublishPreviewStatControlIds(
        id,
        'student-instructions'
      ),
      timer: buildAssignmentPublishPreviewStatControlIds(id, 'timer'),
    },
    toggleGroup: id('delivery-toggle-group'),
    toggleIds: {
      collectStudentName: buildAssignmentPublishToggleControlIds(
        id,
        'collect-student-name'
      ),
      showCorrectAnswers: buildAssignmentPublishToggleControlIds(
        id,
        'show-correct-answers'
      ),
      shuffleItems: buildAssignmentPublishToggleControlIds(id, 'shuffle-items'),
    },
    validationAlert: id('validation-alert'),
  };
}

function buildAssignmentPublishFieldControlIds(
  id: (suffix: string) => string,
  key: string
): AssignmentPublishFieldControlIds {
  const helpId = id(`${key}-help`);

  return {
    describedByIds: [helpId],
    helpId,
    inputId: id(key),
  };
}

function buildAssignmentPublishToggleControlIds(
  id: (suffix: string) => string,
  key: string
): AssignmentPublishToggleControlIds {
  const descriptionId = id(`${key}-description`);

  return {
    describedByIds: [descriptionId],
    descriptionId,
    inputId: id(`${key}-toggle`),
  };
}

function buildAssignmentPublishPreviewStatControlIds(
  id: (suffix: string) => string,
  key: string
): AssignmentPublishPreviewStatControlIds {
  return {
    labelId: id(`preview-stat-${key}-label`),
    valueId: id(`preview-stat-${key}-value`),
  };
}

function buildAssignmentPublishReviewControlIds(
  id: (suffix: string) => string,
  key: string
): AssignmentPublishPreviewReviewControlIds {
  const labelId = id(`preview-review-${key}-label`);
  const descriptionId = id(`preview-review-${key}-description`);

  return {
    describedByIds: [descriptionId],
    descriptionId,
    labelledByIds: [labelId],
    labelId,
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
