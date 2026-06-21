import type { AssignmentSettings } from '@/activities/types';
import { defaultAssignmentSettings } from '@/assignments/validation';

export function formatAssignmentDateTimeLocal(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function parseAssignmentDateTimeLocal(value: string) {
  if (!value.trim()) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseOptionalWholeNumber(value: string) {
  if (!value.trim()) return undefined;

  const parsed = Number(value);
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

export type AssignmentPublishDraftResult =
  | {
      input: {
        activityId: string;
        expiresAt?: string;
        settings: {
          collectStudentName: boolean;
          instructions?: string;
          maxAttempts: number;
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

export type AssignmentPublishPreview = {
  expiresAt: Date | null;
  settings: AssignmentSettings;
};

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

export function buildAssignmentPublishPreviewFromDraft({
  collectStudentName,
  expiresAtLocal,
  instructions,
  maxAttempts,
  showCorrectAnswers,
  shuffleItems,
  timeLimitMinutes,
}: AssignmentPublishDraft): AssignmentPublishPreview {
  const timeLimitMinutesNumber = parseOptionalWholeNumber(timeLimitMinutes);

  return {
    expiresAt: parseAssignmentDateTimeLocal(expiresAtLocal),
    settings: {
      collectStudentName,
      instructions: instructions.trim() || undefined,
      maxAttempts: parseOptionalWholeNumber(maxAttempts),
      showCorrectAnswers,
      shuffleItems,
      timeLimitSeconds: timeLimitMinutesNumber
        ? timeLimitMinutesNumber * 60
        : undefined,
    },
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
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return {
      message: 'Add an assignment title before publishing.',
      ok: false,
    };
  }

  const attempts = Number(maxAttempts);
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) {
    return {
      message: 'Max attempts must be a whole number from 1 to 10.',
      ok: false,
    };
  }

  const timeLimit = parseOptionalWholeNumber(timeLimitMinutes);
  if (
    timeLimitMinutes.trim() &&
    (!Number.isInteger(timeLimit) || timeLimit < 1 || timeLimit > 180)
  ) {
    return {
      message: 'Time limit must be a whole number from 1 to 180 minutes.',
      ok: false,
    };
  }

  const expiresAt = parseAssignmentDateTimeLocal(expiresAtLocal);
  if (expiresAtLocal.trim() && !expiresAt) {
    return {
      message: 'Choose a valid close time.',
      ok: false,
    };
  }

  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    return {
      message: 'Close time must be in the future.',
      ok: false,
    };
  }

  const trimmedInstructions = instructions.trim();

  return {
    input: {
      activityId,
      expiresAt: expiresAt?.toISOString(),
      settings: {
        collectStudentName,
        instructions: trimmedInstructions || undefined,
        maxAttempts: attempts,
        showCorrectAnswers,
        shuffleItems,
        timeLimitSeconds: timeLimit ? timeLimit * 60 : undefined,
      },
      title: trimmedTitle,
    },
    ok: true,
  };
}
