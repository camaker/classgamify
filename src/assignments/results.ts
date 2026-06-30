import {
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
  type RuntimeItem,
  type RuntimeItemKind,
} from '@/activities/runtime';
import type { AttemptAnswers, AttemptResult } from '@/activities/types';
import { buildAttemptAnswerMapByItemId } from '@/assignments/attempt-answers';
import { createStudentIdentityResolver } from '@/assignments/identity';
import { getAssignmentReviewPriorityItems } from '@/assignments/review-priority';
import {
  getRuntimeDisplayAcceptedAnswers,
  hasRuntimeDisplayText,
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';

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
  kind: RuntimeItemKind;
  kindLabel: string;
  prompt: string;
  submittedCount: number;
  unansweredCount: number;
};

export type AssignmentAttemptReviewAnswer = {
  acceptedAnswers: string[];
  answer: string;
  correct: boolean;
  expectedAnswer: string;
  explanation?: string;
  itemId: string;
  prompt: string;
  submitted: boolean;
};

export type AssignmentAttemptReview = {
  accuracy: number;
  answers: AssignmentAttemptReviewAnswer[];
  completedAt: Date | null;
  id: string;
  score: number;
  studentKey: string;
  studentLabel: string;
};

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

export const ASSIGNMENT_RESULTS_ANALYSIS_LIMITS = {
  needsReviewItems: 3,
} as const;

export function analyzeAssignmentResults({
  attempts,
  runtimeItems,
}: {
  attempts: AttemptForAnalysis[];
  runtimeItems: RuntimeItem[];
}): AssignmentResultsAnalysis {
  const completedAttempts = attempts.filter(hasAttemptResult);
  const completedAttemptAnswerMaps = completedAttempts.map((attempt) =>
    buildAttemptAnswerMapByItemId(attempt.answersJson.answers)
  );
  const completedAttemptCount = normalizeResultCount(completedAttempts.length);
  const identityResolver = createStudentIdentityResolver(completedAttempts);
  const perItem = runtimeItems.map((item) => {
    const acceptedAnswers = getResultAcceptedAnswers(item.answer);
    const submittedAnswers = completedAttemptAnswerMaps.flatMap((answerMap) => {
      const answer = answerMap.get(item.id);

      return hasRuntimeDisplayText(answer?.answer) ? [answer] : [];
    });
    const correctCount = submittedAnswers.filter(
      (answer) => answer.correct
    ).length;
    const submittedCount = submittedAnswers.length;
    const normalizedSubmittedCount = normalizeResultCount(submittedCount);

    return {
      acceptedAnswers,
      correctCount: normalizeResultCount(correctCount),
      correctRate: normalizeResultPercent(
        submittedCount > 0
          ? Math.round((correctCount / submittedCount) * 100)
          : 0
      ),
      expectedAnswer: normalizeRuntimeDisplayText(item.answer),
      explanation: normalizeOptionalRuntimeDisplayText(item.explanation),
      itemId: item.id,
      kind: item.kind,
      kindLabel: formatRuntimeItemKindLabel(item),
      prompt: normalizeRuntimeDisplayText(formatRuntimeItemPrompt(item)),
      submittedCount: normalizedSubmittedCount,
      unansweredCount: normalizeResultCount(
        completedAttemptCount - normalizedSubmittedCount
      ),
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
    needsReview: getAssignmentReviewPriorityItems(perItem, {
      limit: ASSIGNMENT_RESULTS_ANALYSIS_LIMITS.needsReviewItems,
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
  const answerByItemId = buildAttemptAnswerMapByItemId(
    attempt.answersJson.answers
  );

  return runtimeItems.map((item) => {
    const submittedAnswer = answerByItemId.get(item.id);
    const acceptedAnswers = getResultAcceptedAnswers(item.answer);

    return {
      acceptedAnswers,
      answer: normalizeRuntimeDisplayText(submittedAnswer?.answer),
      correct: Boolean(submittedAnswer?.correct),
      expectedAnswer: normalizeRuntimeDisplayText(item.answer),
      explanation: normalizeOptionalRuntimeDisplayText(item.explanation),
      itemId: item.id,
      prompt: normalizeRuntimeDisplayText(formatRuntimeItemPrompt(item)),
      submitted: hasRuntimeDisplayText(submittedAnswer?.answer),
    };
  });
}

function hasAttemptResult(
  attempt: AttemptForAnalysis
): attempt is AttemptForAnalysis & { resultJson: AttemptResult } {
  return attempt.resultJson != null;
}

function getAttemptReviewAccuracy(attempt: AttemptForAnalysis) {
  return normalizeResultPercent(
    getFiniteNumber(attempt.resultJson?.accuracy, 0)
  );
}

function getAttemptReviewScore(attempt: AttemptForAnalysis) {
  const totalPoints = getFiniteNumber(attempt.resultJson?.totalPoints);
  const maxScore =
    totalPoints === undefined ? undefined : normalizeResultCount(totalPoints);
  const score = getFiniteNumber(attempt.score);
  if (score !== undefined)
    return normalizeResultCount(score, { max: maxScore });

  return normalizeResultCount(
    getFiniteNumber(attempt.resultJson?.earnedPoints, 0),
    {
      max: maxScore,
    }
  );
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
      const normalizedAccuracies = studentAttempts.map((attempt) =>
        normalizeResultPercent(attempt.accuracy)
      );
      const averageAccuracy = normalizeResultPercent(
        Math.round(
          normalizedAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) /
            normalizedAccuracies.length
        )
      );

      return {
        attempts: normalizeResultCount(studentAttempts.length),
        averageAccuracy,
        bestAccuracy: Math.max(...normalizedAccuracies),
        lastCompletedAt: latestAttempt?.completedAt ?? null,
        latestAccuracy: normalizeResultPercent(latestAttempt?.accuracy ?? 0),
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
  const timestamp = value?.getTime() ?? 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function isAssignmentAttemptAnswerNeedsReview(
  answer: AssignmentAttemptReviewAnswerStatus
) {
  return !answer.submitted || !answer.correct;
}

function getResultAcceptedAnswers(answer: string) {
  return getRuntimeDisplayAcceptedAnswers(answer);
}

function normalizeResultCount(
  value: number | undefined,
  options?: {
    max?: number;
  }
) {
  return normalizeRuntimeDisplayCount(value ?? 0, options);
}

function normalizeResultPercent(value: number | undefined) {
  return normalizeRuntimeDisplayCount(value ?? 0, {
    max: 100,
    min: 0,
  });
}
