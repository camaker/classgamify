import { matchAnswer } from '@/activities/answer-matching';
import { buildQuestionChoices } from '@/activities/distractors';
import type {
  ActivityContent,
  ActivityTemplateType,
  AttemptAnswer,
  AttemptResult,
} from '@/activities/types';

export type RuntimeItem =
  | {
      answer: string;
      choices?: string[];
      explanation?: string;
      id: string;
      kind: 'question';
      prompt: string;
    }
  | {
      answer: string;
      choices: string[];
      id: string;
      kind: 'pair';
      prompt: string;
    }
  | {
      answer: string;
      choices: string[];
      id: string;
      kind: 'group-item';
      prompt: string;
    };

export type RuntimeEvaluation = {
  answers: AttemptAnswer[];
  result: AttemptResult;
};

export function getRuntimeItems(
  templateType: ActivityTemplateType,
  content: ActivityContent
): RuntimeItem[] {
  switch (templateType) {
    case 'line-match':
    case 'match-up':
    case 'matching-pairs': {
      const choices = content.pairs.map((pair) => pair.right);
      return content.pairs.map((pair) => ({
        answer: pair.right,
        choices,
        id: pair.id,
        kind: 'pair',
        prompt: pair.left,
      }));
    }
    case 'group-sort': {
      const choices = content.groups.map((group) => group.label);
      return content.groups.flatMap((group) =>
        group.items.map((item) => ({
          answer: group.label,
          choices,
          id: `${group.id}-${makeStableId(item)}`,
          kind: 'group-item',
          prompt: item,
        }))
      );
    }
    case 'fill-blank':
    case 'listening':
    case 'open-box':
      return content.questions.map((question) => ({
        answer: question.answer,
        choices: question.options?.map((option) => option.text),
        explanation: question.explanation,
        id: question.id,
        kind: 'question',
        prompt: question.prompt,
      }));
    case 'quiz':
      return content.questions.map((question) => ({
        answer: question.answer,
        choices: buildQuestionChoices({ content, question }),
        explanation: question.explanation,
        id: question.id,
        kind: 'question',
        prompt: question.prompt,
      }));
  }
}

export function evaluateRuntimeAnswers({
  answers,
  content,
  durationSeconds,
  templateType,
}: {
  answers: Array<{ answer: string; itemId: string }>;
  content: ActivityContent;
  durationSeconds?: number;
  templateType: ActivityTemplateType;
}): RuntimeEvaluation {
  const runtimeItems = getRuntimeItems(templateType, content);
  const answerMap = new Map(
    answers.map((answer) => [answer.itemId, answer.answer.trim()])
  );
  const scoredAnswers = runtimeItems.map((item) => {
    const submitted = answerMap.get(item.id) ?? '';
    const match = matchAnswer({
      expectedAnswer: item.answer,
      submittedAnswer: submitted,
    });
    return {
      answer: submitted,
      correct: match.correct,
      itemId: item.id,
    };
  });
  const correctItemCount = scoredAnswers.filter(
    (answer) => answer.correct
  ).length;
  const totalPoints = runtimeItems.length;
  const earnedPoints = correctItemCount;
  const accuracy =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    answers: scoredAnswers,
    result: {
      accuracy,
      completedItemCount: scoredAnswers.filter((answer) => answer.answer)
        .length,
      correctItemCount,
      durationSeconds,
      earnedPoints,
      totalPoints,
    },
  };
}

export function getRuntimeSummary(
  templateType: ActivityTemplateType,
  content: ActivityContent
) {
  const items = getRuntimeItems(templateType, content);

  return {
    itemCount: items.length,
    templateType,
  };
}

function makeStableId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}
