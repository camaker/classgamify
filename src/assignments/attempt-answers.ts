import type { AttemptAnswer } from '@/activities/types';
import { normalizeRuntimeDisplayText } from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

type SubmittedAttemptAnswer = {
  answer?: string;
  itemId: string;
};

type AttemptAnswerRuntimeItem = {
  id: string;
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
    runtimeItems.map((item) => normalizeAttemptAnswerItemId(item.id))
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

function assertRuntimeItemIdsAreUnique(
  runtimeItems: AttemptAnswerRuntimeItem[]
) {
  const runtimeItemIds = new Set<string>();

  for (const item of runtimeItems) {
    const itemId = normalizeAttemptAnswerItemId(item.id);
    if (runtimeItemIds.has(itemId)) {
      throw new Error(
        m.assignment_attempt_answers_error_duplicate_runtime_item()
      );
    }

    runtimeItemIds.add(itemId);
  }
}

function normalizeAttemptAnswerItemId(value: string) {
  return normalizeRuntimeDisplayText(value);
}
