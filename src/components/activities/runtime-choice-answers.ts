export type RuntimeChoiceAnswerChange = {
  answer: string;
  itemId: string;
};

export function findChoiceOwner(
  answers: Record<string, string>,
  choice: string
) {
  return Object.entries(answers).find(([, answer]) => answer === choice)?.[0];
}

export function buildExclusiveChoiceAnswerChanges({
  answers,
  choice,
  itemId,
}: {
  answers: Record<string, string>;
  choice: string;
  itemId: string;
}): RuntimeChoiceAnswerChange[] {
  const usedByItemId = findChoiceOwner(answers, choice);
  const changes: RuntimeChoiceAnswerChange[] = [];

  if (usedByItemId && usedByItemId !== itemId) {
    changes.push({ answer: '', itemId: usedByItemId });
  }

  changes.push({ answer: choice, itemId });

  return changes;
}
