import type { AssignmentSettings } from '@/activities/types';
import {
  ASSIGNMENT_MAX_ATTEMPTS_RANGE,
  ASSIGNMENT_PUBLISH_FIELD_LIMITS,
  ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE,
  defaultAssignmentSettings,
} from '@/assignments/validation';
import { m } from '@/locale/paraglide/messages';

export function formatAssignmentDateTimeLocal(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function buildAssignmentPublishCloseAfterMinLocal(now = new Date()) {
  return formatAssignmentDateTimeLocal(new Date(now.getTime() + 60 * 1000));
}

export function parseAssignmentDateTimeLocal(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    trimmed
  );
  if (!match) return null;

  const [, year, month, day, hour, minute, second = '0'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  if (Number.isNaN(date.getTime())) return null;

  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date.getHours() === Number(hour) &&
    date.getMinutes() === Number(minute) &&
    date.getSeconds() === Number(second)
    ? date
    : null;
}

export function parseOptionalWholeNumber(value: string) {
  const trimmed = value.normalize('NFKC').trim();
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
    };

type AssignmentPublishDraftValidation =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

type AssignmentPublishPreview = {
  expiresAt: Date | null;
  settings: AssignmentSettings;
};

type AssignmentPublishDialogState = {
  errorMessage?: string;
  publishDisabled: boolean;
};

export type AssignmentPublishDraftValues = Partial<
  Omit<AssignmentPublishDraft, 'activityId' | 'now'>
>;

export type AssignmentPublishDialogViewModel = {
  dialogState: AssignmentPublishDialogState;
  draft: AssignmentPublishDraft;
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
  get instructionsLabel() {
    return m.assignment_publish_dialog_instructions_label();
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
}: {
  defaults: AssignmentPublishDraft;
  isPublishing?: boolean;
  now?: Date;
  values: AssignmentPublishDraftValues;
}): AssignmentPublishDialogViewModel {
  const draft = buildAssignmentPublishDraft({ defaults, values });
  const validation = validateAssignmentPublishDraft({ ...draft, now });

  return {
    dialogState: buildAssignmentPublishDialogState({
      isPublishing,
      validation,
    }),
    draft,
    preview: buildAssignmentPublishPreviewFromDraft(draft),
    toggleViews: buildAssignmentPublishToggleViews(draft),
    validation,
  };
}

export function buildAssignmentPublishPreviewFromDraft({
  collectStudentName,
  expiresAtLocal,
  instructions,
  maxAttempts,
  showCorrectAnswers,
  shuffleItems,
  timeLimitMinutes,
}: AssignmentPublishDraft): AssignmentPublishPreview {
  const previewTimeLimitMinutes =
    parseAssignmentPublishTimeLimitMinutes(timeLimitMinutes);
  const previewMaxAttempts = isAssignmentPublishMaxAttemptsBlank(maxAttempts)
    ? null
    : parseAssignmentPublishMaxAttempts(maxAttempts);

  return {
    expiresAt: parseAssignmentDateTimeLocal(expiresAtLocal),
    settings: {
      collectStudentName,
      instructions: instructions.trim() || undefined,
      maxAttempts: previewMaxAttempts,
      showCorrectAnswers,
      shuffleItems,
      timeLimitSeconds: previewTimeLimitMinutes
        ? previewTimeLimitMinutes * 60
        : undefined,
    },
  };
}

export function validateAssignmentPublishDraft({
  expiresAtLocal,
  instructions,
  maxAttempts,
  now = new Date(),
  timeLimitMinutes,
  title,
}: AssignmentPublishDraft): AssignmentPublishDraftValidation {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return {
      message: m.assignment_publish_validation_title_required(),
      ok: false,
    };
  }

  if (trimmedTitle.length < ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength) {
    return {
      message: m.assignment_publish_validation_title_min({
        min: ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength,
      }),
      ok: false,
    };
  }

  if (trimmedTitle.length > ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMaxLength) {
    return {
      message: m.assignment_publish_validation_title_max({
        max: ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMaxLength,
      }),
      ok: false,
    };
  }

  if (
    instructions.trim().length >
    ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength
  ) {
    return {
      message: m.assignment_publish_validation_instructions_max({
        max: ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength,
      }),
      ok: false,
    };
  }

  if (
    !isAssignmentPublishMaxAttemptsBlank(maxAttempts) &&
    parseAssignmentPublishMaxAttempts(maxAttempts) === undefined
  ) {
    return {
      message: m.assignment_publish_validation_max_attempts(),
      ok: false,
    };
  }

  const timeLimit = parseOptionalWholeNumber(timeLimitMinutes);
  if (
    timeLimitMinutes.trim() &&
    !isWholeNumberInRange(timeLimit, ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE)
  ) {
    return {
      message: m.assignment_publish_validation_time_limit(),
      ok: false,
    };
  }

  const expiresAt = parseAssignmentDateTimeLocal(expiresAtLocal);
  if (expiresAtLocal.trim() && !expiresAt) {
    return {
      message: m.assignment_publish_validation_close_time_valid(),
      ok: false,
    };
  }

  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    return {
      message: m.assignment_publish_validation_close_time_future(),
      ok: false,
    };
  }

  return { ok: true };
}

export function buildAssignmentPublishDialogState({
  isPublishing = false,
  validation,
}: {
  isPublishing?: boolean;
  validation: AssignmentPublishDraftValidation;
}): AssignmentPublishDialogState {
  return {
    errorMessage: validation.ok ? undefined : validation.message,
    publishDisabled: isPublishing || !validation.ok,
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

  const trimmedTitle = title.trim();
  const attempts = parseAssignmentPublishMaxAttempts(maxAttempts);
  if (
    !isAssignmentPublishMaxAttemptsBlank(maxAttempts) &&
    attempts === undefined
  ) {
    return {
      message: m.assignment_publish_validation_max_attempts(),
      ok: false,
    };
  }

  const timeLimit = parseAssignmentPublishTimeLimitMinutes(timeLimitMinutes);
  const expiresAt = parseAssignmentDateTimeLocal(expiresAtLocal);
  const trimmedInstructions = instructions.trim();

  return {
    input: {
      activityId,
      expiresAt: expiresAt?.toISOString(),
      settings: {
        collectStudentName,
        instructions: trimmedInstructions || undefined,
        maxAttempts: attempts ?? null,
        showCorrectAnswers,
        shuffleItems,
        timeLimitSeconds: timeLimit ? timeLimit * 60 : undefined,
      },
      title: trimmedTitle,
    },
    ok: true,
  };
}

function parseAssignmentPublishMaxAttempts(value: string) {
  if (isAssignmentPublishMaxAttemptsBlank(value)) return undefined;

  return parseWholeNumberInRange(value, ASSIGNMENT_MAX_ATTEMPTS_RANGE);
}

function isAssignmentPublishMaxAttemptsBlank(value: string) {
  return value.trim().length === 0;
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
