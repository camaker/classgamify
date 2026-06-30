import type { AttemptAnswer } from '@/activities/types';
import { normalizeRuntimeDisplayText } from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

export type SubmittedAttemptAnswer = {
  answer?: string;
  itemId: string;
};

export type AttemptAnswerRuntimeItem = {
  id: string;
};

export type AttemptAnswerRuntimeItemEntry = {
  itemId: string;
  originalIds: string[];
};

export type AssignmentAttemptAnswerValidationErrorCode =
  | 'duplicate-item'
  | 'duplicate-runtime-item'
  | 'too-many'
  | 'unknown-item';

export class AssignmentAttemptAnswerValidationError extends Error {
  readonly code: AssignmentAttemptAnswerValidationErrorCode;

  constructor(code: AssignmentAttemptAnswerValidationErrorCode) {
    super(getAssignmentAttemptAnswerValidationErrorMessage(code));
    this.code = code;
    this.name = 'AssignmentAttemptAnswerValidationError';
  }
}

export function assertSubmittedAnswersMatchRuntimeItems({
  answers,
  runtimeItems,
}: {
  answers: SubmittedAttemptAnswer[];
  runtimeItems: AttemptAnswerRuntimeItem[];
}) {
  assertRuntimeItemIdsAreUnique(runtimeItems);

  if (answers.length > runtimeItems.length) {
    throw new AssignmentAttemptAnswerValidationError('too-many');
  }

  const runtimeItemIds = new Set(
    getAttemptAnswerRuntimeItemIds({
      runtimeItems,
    })
  );
  const submittedItemIds = new Set<string>();

  for (const answer of answers) {
    const itemId = normalizeAttemptAnswerItemId(answer.itemId);

    if (!itemId || !runtimeItemIds.has(itemId)) {
      throw new AssignmentAttemptAnswerValidationError('unknown-item');
    }

    if (submittedItemIds.has(itemId)) {
      throw new AssignmentAttemptAnswerValidationError('duplicate-item');
    }

    submittedItemIds.add(itemId);
  }
}

export function normalizeSubmittedAttemptAnswers(
  answers: Array<SubmittedAttemptAnswer & { answer: string }>
) {
  return answers.map((answer) => ({
    ...answer,
    itemId: normalizeAttemptAnswerItemId(answer.itemId),
  }));
}

export function buildAttemptAnswerMapByItemId(answers: AttemptAnswer[]) {
  return new Map(
    answers.map((answer) => [
      normalizeAttemptAnswerItemId(answer.itemId),
      answer,
    ])
  );
}

export function getAttemptAnswerByRuntimeItemId<TAnswer>(
  answersByItemId: Map<string, TAnswer>,
  itemId: string | undefined
) {
  return answersByItemId.get(normalizeAttemptAnswerItemId(itemId));
}

export function getAttemptAnswerRuntimeItemIds({
  includeEmpty = false,
  runtimeItems,
}: {
  includeEmpty?: boolean;
  runtimeItems: AttemptAnswerRuntimeItem[];
}) {
  return getAttemptAnswerRuntimeItemEntries({
    includeEmpty,
    runtimeItems,
  }).map((entry) => entry.itemId);
}

export function getAttemptAnswerRuntimeItemEntries({
  includeEmpty = false,
  runtimeItems,
}: {
  includeEmpty?: boolean;
  runtimeItems: AttemptAnswerRuntimeItem[];
}): AttemptAnswerRuntimeItemEntry[] {
  const entriesById = new Map<string, AttemptAnswerRuntimeItemEntry>();

  for (const item of runtimeItems) {
    const itemId = normalizeAttemptAnswerItemId(item.id);
    if (!itemId && !includeEmpty) continue;

    const entry = entriesById.get(itemId);
    if (entry) {
      entry.originalIds.push(item.id);
      continue;
    }

    entriesById.set(itemId, {
      itemId,
      originalIds: [item.id],
    });
  }

  return [...entriesById.values()];
}

function assertRuntimeItemIdsAreUnique(
  runtimeItems: AttemptAnswerRuntimeItem[]
) {
  for (const entry of getAttemptAnswerRuntimeItemEntries({
    includeEmpty: true,
    runtimeItems,
  })) {
    if (!entry.itemId || entry.originalIds.length > 1) {
      throw new AssignmentAttemptAnswerValidationError(
        'duplicate-runtime-item'
      );
    }
  }
}

export function isAssignmentAttemptAnswerValidationError(
  error: unknown
): error is AssignmentAttemptAnswerValidationError {
  return error instanceof AssignmentAttemptAnswerValidationError;
}

function getAssignmentAttemptAnswerValidationErrorMessage(
  code: AssignmentAttemptAnswerValidationErrorCode
) {
  if (code === 'duplicate-item') {
    return m.assignment_attempt_answers_error_duplicate_item();
  }
  if (code === 'duplicate-runtime-item') {
    return m.assignment_attempt_answers_error_duplicate_runtime_item();
  }
  if (code === 'too-many') {
    return m.assignment_attempt_answers_error_too_many();
  }

  return m.assignment_attempt_answers_error_unknown_item();
}

export function normalizeAttemptAnswerItemId(value: string | undefined) {
  return normalizeRuntimeDisplayText(value);
}
