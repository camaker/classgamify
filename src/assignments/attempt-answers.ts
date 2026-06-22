import { m } from '@/locale/paraglide/messages';

type SubmittedAttemptAnswer = {
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
  if (answers.length > runtimeItems.length) {
    throw new Error(m.assignment_attempt_answers_error_too_many());
  }

  const runtimeItemIds = new Set(runtimeItems.map((item) => item.id));
  const submittedItemIds = new Set<string>();

  for (const answer of answers) {
    if (!runtimeItemIds.has(answer.itemId)) {
      throw new Error(m.assignment_attempt_answers_error_unknown_item());
    }

    if (submittedItemIds.has(answer.itemId)) {
      throw new Error(m.assignment_attempt_answers_error_duplicate_item());
    }

    submittedItemIds.add(answer.itemId);
  }
}
