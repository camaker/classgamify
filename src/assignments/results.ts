import { getAcceptedAnswers } from '@/activities/answer-matching';
import {
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
  type RuntimeItem,
} from '@/activities/runtime';
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
  kindLabel: string;
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
    submitted: boolean;
  }>;
  completedAt: Date | null;
  id: string;
  score: number;
  studentKey: string;
  studentLabel: string;
};

type AssignmentAttemptReviewAnswer = AssignmentAttemptReview['answers'][number];

export type AssignmentAttemptReviewAnswerStatus = Pick<
  AssignmentAttemptReviewAnswer,
  'correct' | 'submitted'
>;

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
  const completedAttempts = attempts.filter(hasAttemptResult);
  const identityResolver = createStudentIdentityResolver(completedAttempts);
  const perItem = runtimeItems.map((item) => {
    const acceptedAnswers = getAcceptedAnswers(item.answer);
    const submittedAnswers = completedAttempts.flatMap((attempt) => {
      const answer = attempt.answersJson.answers.find(
        (attemptAnswer) => attemptAnswer.itemId === item.id
      );

      return answer?.answer.trim() ? [answer] : [];
    });
    const correctCount = submittedAnswers.filter(
      (answer) => answer.correct
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
      kindLabel: formatRuntimeItemKindLabel(item),
      prompt: formatRuntimeItemPrompt(item),
      submittedCount,
    };
  });

  const attemptReviews = completedAttempts.map((attempt) => {
    const identity = identityResolver.resolve(attempt);

    return {
      accuracy: getAttemptReviewAccuracy(attempt),
      answers: buildAttemptReviewAnswers({
        attempt,
        runtimeItems,
      }),
      completedAt: attempt.completedAt,
      id: attempt.id,
      score: getAttemptReviewScore(attempt),
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

function buildAttemptReviewAnswers({
  attempt,
  runtimeItems,
}: {
  attempt: AttemptForAnalysis;
  runtimeItems: RuntimeItem[];
}): AssignmentAttemptReviewAnswer[] {
  const answerByItemId = new Map(
    attempt.answersJson.answers.map((answer) => [answer.itemId, answer])
  );

  return runtimeItems.map((item) => {
    const submittedAnswer = answerByItemId.get(item.id);

    return {
      acceptedAnswers: getAcceptedAnswers(item.answer),
      answer: submittedAnswer?.answer ?? '',
      correct: Boolean(submittedAnswer?.correct),
      expectedAnswer: item.answer,
      explanation: item.explanation,
      itemId: item.id,
      prompt: formatRuntimeItemPrompt(item),
      submitted:
        submittedAnswer !== undefined &&
        submittedAnswer.answer.trim().length > 0,
    };
  });
}

function hasAttemptResult(
  attempt: AttemptForAnalysis
): attempt is AttemptForAnalysis & { resultJson: AttemptResult } {
  return attempt.resultJson != null;
}

function getAttemptReviewAccuracy(attempt: AttemptForAnalysis) {
  return getFiniteNumber(attempt.resultJson?.accuracy, 0);
}

function getAttemptReviewScore(attempt: AttemptForAnalysis) {
  const score = getFiniteNumber(attempt.score);
  if (score !== undefined) return score;

  return getFiniteNumber(attempt.resultJson?.earnedPoints, 0);
}

function getFiniteNumber(value: number | null | undefined, fallback?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
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
          ? latestAttempt.answers.filter(isAssignmentAttemptAnswerNeedsReview)
              .length
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

export function isAssignmentAttemptAnswerNeedsReview(
  answer: AssignmentAttemptReviewAnswerStatus
) {
  return answer.submitted && !answer.correct;
}
