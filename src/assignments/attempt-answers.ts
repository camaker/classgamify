export type SubmittedAttemptAnswer = {
  itemId: string;
};

export type AttemptAnswerRuntimeItem = {
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
    throw new Error('Submitted answers exceed assignment item count.');
  }

  const runtimeItemIds = new Set(runtimeItems.map((item) => item.id));
  const submittedItemIds = new Set<string>();

  for (const answer of answers) {
    if (!runtimeItemIds.has(answer.itemId)) {
      throw new Error('Submitted answers include an unknown item.');
    }

    if (submittedItemIds.has(answer.itemId)) {
      throw new Error('Submitted answers include a duplicate item.');
    }

    submittedItemIds.add(answer.itemId);
  }
}
