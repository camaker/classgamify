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

export function assertSubmittedAnswersMatchRuntimeItems({
  answers,
  runtimeItems,
}: {
  answers: SubmittedAttemptAnswer[];
  runtimeItems: AttemptAnswerRuntimeItem[];
}) {
  assertRuntimeItemIdsAreUnique(runtimeItems);

  if (answers.length > runtimeItems.length) {
    throw new Error(m.assignment_attempt_answers_error_too_many());
  }

  const runtimeItemIds = new Set(
    getAttemptAnswerRuntimeItemIds({
      includeEmpty: true,
      runtimeItems,
    })
  );
  const submittedItemIds = new Set<string>();

  for (const answer of answers) {
    const itemId = normalizeAttemptAnswerItemId(answer.itemId);

    if (!runtimeItemIds.has(itemId)) {
      throw new Error(m.assignment_attempt_answers_error_unknown_item());
    }

    if (submittedItemIds.has(itemId)) {
      throw new Error(m.assignment_attempt_answers_error_duplicate_item());
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
    if (entry.originalIds.length > 1) {
      throw new Error(
        m.assignment_attempt_answers_error_duplicate_runtime_item()
      );
    }
  }
}

export function normalizeAttemptAnswerItemId(value: string | undefined) {
  return normalizeRuntimeDisplayText(value);
}
