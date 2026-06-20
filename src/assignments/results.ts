import { getAcceptedAnswers } from '@/activities/answer-matching';
import type { RuntimeItem } from '@/activities/runtime';
import type { AttemptAnswers, AttemptResult } from '@/activities/types';
import { createStudentIdentityResolver } from '@/assignments/identity';
import { getSubmittedAssignmentReviewPriorityItems } from '@/assignments/review-priority';

type AttemptForAnalysis = {
  anonymousToken?: string | null;
  answersJson: AttemptAnswers;
  completedAt: Date | null;
  id: string;
  resultJson: AttemptResult | null;
  score: number | null;
  studentName: string | null;
};

export type AssignmentItemAnalysis = {
  acceptedAnswers: string[];
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
    acceptedAnswers: string[];
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
  studentKey: string;
  studentLabel: string;
};

export type AssignmentStudentSummary = {
  attempts: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastCompletedAt: Date | null;
  latestAccuracy: number;
  needsReviewCount: number;
  studentKey: string;
  studentLabel: string;
};

export type AssignmentResultsAnalysis = {
  attempts: AssignmentAttemptReview[];
  needsReview: AssignmentItemAnalysis[];
  perItem: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
};

export function analyzeAssignmentResults({
  attempts,
  runtimeItems,
}: {
  attempts: AttemptForAnalysis[];
  runtimeItems: RuntimeItem[];
}): AssignmentResultsAnalysis {
  const runtimeItemById = new Map(runtimeItems.map((item) => [item.id, item]));
  const identityResolver = createStudentIdentityResolver(attempts);
  const perItem = runtimeItems.map((item) => {
    const acceptedAnswers = getAcceptedAnswers(item.answer);
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
      acceptedAnswers,
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

  const attemptReviews = attempts.map((attempt) => {
    const identity = identityResolver.resolve(attempt);

    return {
      accuracy: attempt.resultJson?.accuracy ?? 0,
      answers: attempt.answersJson.answers.map((answer) => {
        const item = runtimeItemById.get(answer.itemId);
        const acceptedAnswers = item ? getAcceptedAnswers(item.answer) : [];
        return {
          acceptedAnswers,
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
      studentKey: identity.key,
      studentLabel: identity.label,
    };
  });

  return {
    attempts: attemptReviews,
    needsReview: getSubmittedAssignmentReviewPriorityItems(perItem, {
      limit: 3,
    }),
    perItem,
    students: buildStudentSummaries(attemptReviews),
  };
}

function buildStudentSummaries(
  attempts: AssignmentAttemptReview[]
): AssignmentStudentSummary[] {
  const byStudent = new Map<string, AssignmentAttemptReview[]>();

  for (const attempt of attempts) {
    const group = byStudent.get(attempt.studentKey) ?? [];
    group.push(attempt);
    byStudent.set(attempt.studentKey, group);
  }

  return [...byStudent.entries()]
    .map(([studentKey, studentAttempts]) => {
      const sortedAttempts = [...studentAttempts].sort(
        (left, right) =>
          getDateTimestamp(right.completedAt) -
          getDateTimestamp(left.completedAt)
      );
      const latestAttempt = sortedAttempts[0];
      const averageAccuracy = Math.round(
        studentAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) /
          studentAttempts.length
      );

      return {
        attempts: studentAttempts.length,
        averageAccuracy,
        bestAccuracy: Math.max(
          ...studentAttempts.map((attempt) => attempt.accuracy)
        ),
        lastCompletedAt: latestAttempt?.completedAt ?? null,
        latestAccuracy: latestAttempt?.accuracy ?? 0,
        needsReviewCount: latestAttempt
          ? latestAttempt.answers.filter((answer) => !answer.correct).length
          : 0,
        studentKey,
        studentLabel: latestAttempt?.studentLabel ?? studentKey,
      };
    })
    .sort((left, right) => {
      if (left.latestAccuracy !== right.latestAccuracy) {
        return left.latestAccuracy - right.latestAccuracy;
      }
      return (
        getDateTimestamp(right.lastCompletedAt) -
        getDateTimestamp(left.lastCompletedAt)
      );
    });
}

function getDateTimestamp(value: Date | null) {
  return value?.getTime() ?? 0;
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
