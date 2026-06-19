import type { RuntimeItem } from '@/activities/runtime';
import type { AttemptAnswers, AttemptResult } from '@/activities/types';

type AttemptForAnalysis = {
  answersJson: AttemptAnswers;
  completedAt: Date | null;
  id: string;
  resultJson: AttemptResult | null;
  score: number | null;
  studentName: string | null;
};

export type AssignmentItemAnalysis = {
  correctCount: number;
  correctRate: number;
  explanation?: string;
  expectedAnswer: string;
  itemId: string;
  kind: RuntimeItem['kind'];
  prompt: string;
  submittedCount: number;
};

export type AssignmentAttemptReview = {
  accuracy: number;
  answers: Array<{
    answer: string;
    correct: boolean;
    expectedAnswer: string;
    explanation?: string;
    itemId: string;
    prompt: string;
  }>;
  completedAt: Date | null;
  id: string;
  score: number;
  studentLabel: string;
};

export type AssignmentResultsAnalysis = {
  attempts: AssignmentAttemptReview[];
  needsReview: AssignmentItemAnalysis[];
  perItem: AssignmentItemAnalysis[];
};

export function analyzeAssignmentResults({
  attempts,
  runtimeItems,
}: {
  attempts: AttemptForAnalysis[];
  runtimeItems: RuntimeItem[];
}): AssignmentResultsAnalysis {
  const runtimeItemById = new Map(runtimeItems.map((item) => [item.id, item]));
  const perItem = runtimeItems.map((item) => {
    const submittedAnswers = attempts
      .map((attempt) =>
        attempt.answersJson.answers.find((answer) => answer.itemId === item.id)
      )
      .filter((answer) => answer?.answer.trim());
    const correctCount = submittedAnswers.filter(
      (answer) => answer?.correct
    ).length;
    const submittedCount = submittedAnswers.length;

    return {
      correctCount,
      correctRate:
        submittedCount > 0
          ? Math.round((correctCount / submittedCount) * 100)
          : 0,
      expectedAnswer: item.answer,
      explanation: item.explanation,
      itemId: item.id,
      kind: item.kind,
      prompt: getRuntimePrompt(item),
      submittedCount,
    };
  });

  return {
    attempts: attempts.map((attempt) => ({
      accuracy: attempt.resultJson?.accuracy ?? 0,
      answers: attempt.answersJson.answers.map((answer) => {
        const item = runtimeItemById.get(answer.itemId);
        return {
          answer: answer.answer,
          correct: Boolean(answer.correct),
          expectedAnswer: item?.answer ?? '',
          explanation: item?.explanation,
          itemId: answer.itemId,
          prompt: item ? getRuntimePrompt(item) : answer.itemId,
        };
      }),
      completedAt: attempt.completedAt,
      id: attempt.id,
      score: attempt.score ?? 0,
      studentLabel: attempt.studentName || 'Anonymous student',
    })),
    needsReview: perItem
      .filter((item) => item.submittedCount > 0)
      .sort((left, right) => {
        if (left.correctRate !== right.correctRate) {
          return left.correctRate - right.correctRate;
        }
        return right.submittedCount - left.submittedCount;
      })
      .slice(0, 3),
    perItem,
  };
}

function getRuntimePrompt(item: RuntimeItem) {
  if (item.kind === 'pair') {
    return `Match "${item.prompt}" with its pair.`;
  }

  if (item.kind === 'group-item') {
    return `Choose the group for "${item.prompt}".`;
  }

  return item.prompt;
}
