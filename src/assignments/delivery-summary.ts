import type { AssignmentDate } from '@/assignments/lifecycle';

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

export type AssignmentDeliverySummaryInput = {
  collectStudentName?: boolean;
  expiresAt: AssignmentDate;
  maxAttempts?: number | null;
  showCorrectAnswers?: boolean;
  shuffleItems?: boolean;
  timeLimitSeconds?: number | null;
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
      label: 'Attempts',
      value: formatAssignmentAttempts(maxAttempts),
    },
    {
      id: 'timer',
      label: 'Timer',
      value: formatAssignmentTimeLimit(timeLimitSeconds),
    },
    {
      id: 'closes',
      label: 'Closes',
      value: formatAssignmentExpiry(expiresAt),
    },
    {
      id: 'identity',
      label: 'Student identity',
      value: formatStudentIdentity(collectStudentName),
    },
    {
      id: 'answerReveal',
      label: 'Answer reveal',
      value: formatAnswerReveal(showCorrectAnswers),
    },
    {
      id: 'itemOrder',
      label: 'Item order',
      value: formatShuffleItems(shuffleItems),
    },
  ];
}

export function formatAssignmentAttempts(maxAttempts?: number | null) {
  return maxAttempts ? `${maxAttempts} max` : 'Open';
}

export function formatAssignmentExpiry(expiresAt: AssignmentDate) {
  if (!expiresAt) return 'No close time';

  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return 'No close time';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatAssignmentTimeLimit(seconds?: number | null) {
  if (!seconds) return 'No timer';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function formatStudentIdentity(collectStudentName: boolean) {
  return collectStudentName ? 'Names' : 'Anonymous';
}

export function formatAnswerReveal(showCorrectAnswers: boolean) {
  return showCorrectAnswers ? 'After submit' : 'Hidden';
}

export function formatShuffleItems(shuffleItems: boolean) {
  return shuffleItems ? 'Shuffled' : 'Fixed order';
}
