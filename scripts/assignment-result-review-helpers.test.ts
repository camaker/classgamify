import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  resolveAssignmentResultViewState,
  type AssignmentResultsPageData,
  type AssignmentAttemptRowDisplayInput,
} from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_EXPECTED_ANSWER = 'SECRET_REVIEW_EXPECTED_ANSWER';
const SECRET_PROMPT = 'SECRET_REVIEW_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_REVIEW_STUDENT_ANSWER';

test('assignment result review helpers keep route state and sorting domain-owned', () => {
  overwriteGetLocale(() => 'en');

  const parsedSearch = buildAssignmentResultRouteSearch({
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'name',
    student: '  Ａｌｉｃｅ 　 Group  ',
  });

  assert.deepEqual(parsedSearch, {
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'name',
    student: 'Alice Group',
  });
  assert.deepEqual(resolveAssignmentResultViewState(parsedSearch), {
    attemptReviewFilter: 'needs-review',
    itemPerformanceSort: 'submitted',
    studentSearch: 'Alice Group',
    studentSort: 'name',
  });
  assert.deepEqual(
    buildAssignmentResultControlSearchState({
      current: parsedSearch,
      update: {
        control: 'student-sort',
        value: 'needs-review',
      },
    }),
    {
      itemSort: 'submitted',
      review: 'needs-review',
      sort: undefined,
      student: 'Alice Group',
    }
  );
  assert.deepEqual(
    buildAssignmentResultControlSearchState({
      current: parsedSearch,
      update: {
        control: 'attempt-review-filter',
        value: 'all',
      },
    }),
    {
      itemSort: 'submitted',
      review: undefined,
      sort: 'name',
      student: 'Alice Group',
    }
  );

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildResultReviewPageData(),
    search: parsedSearch,
  });

  assert.deepEqual(
    pageView.studentSummaryRowViews.map((row) => row.studentLabel),
    []
  );
  assert.equal(pageView.reviewStatusView.status, 'no-matches');
  const reviewSummary = pageView.resultView.reviewScope.summary;
  assert.deepEqual(reviewSummary.students, { matched: 0, total: 3 });
  assert.deepEqual(reviewSummary.attemptRows, { matched: 0, total: 4 });
  assert.deepEqual(reviewSummary.attemptReviews, { matched: 0, total: 4 });
});

function buildResultReviewPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const completedAtAliceLatest = new Date('2026-02-03T10:00:00.000Z');
  const completedAtAliceFirst = new Date('2026-02-02T10:00:00.000Z');
  const completedAtBob = new Date('2026-02-03T09:00:00.000Z');
  const completedAtAnonymous = new Date('2026-02-01T08:00:00.000Z');

  return {
    activity: {
      description: 'A teacher-owned fractions review activity.',
      templateType: 'quiz',
      title: 'Fractions review',
    },
    analysis: {
      attempts: [
        buildAttemptReview({
          accuracy: 50,
          completedAt: completedAtAliceLatest,
          id: 'attempt-alice-latest',
          score: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: completedAtAliceFirst,
          id: 'attempt-alice-first',
          score: 2,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
          variant: 'perfect',
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: completedAtBob,
          id: 'attempt-bob',
          score: 2,
          studentKey: 'student:bob',
          studentLabel: 'Bob',
          variant: 'perfect',
        }),
        buildAttemptReview({
          accuracy: 0,
          completedAt: completedAtAnonymous,
          id: 'attempt-anonymous',
          score: 0,
          studentKey: 'anonymous:1',
          studentLabel: 'Anonymous student 1',
          variant: 'empty',
        }),
      ],
      needsReview: [
        buildItemAnalysis({
          correctRate: 0,
          itemId: 'item-listening',
          kind: 'listening',
          kindLabel: 'Listening',
          prompt: `${SECRET_PROMPT} listening item`,
          submittedCount: 2,
          unansweredCount: 2,
        }),
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-fraction',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} fraction item`,
          submittedCount: 4,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctRate: 100,
          itemId: 'item-vocabulary',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} vocabulary item`,
          submittedCount: 3,
          unansweredCount: 1,
        }),
      ],
      perItem: [
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-fraction',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} fraction item`,
          submittedCount: 4,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctRate: 100,
          itemId: 'item-vocabulary',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} vocabulary item`,
          submittedCount: 3,
          unansweredCount: 1,
        }),
        buildItemAnalysis({
          correctRate: 0,
          itemId: 'item-listening',
          kind: 'listening',
          kindLabel: 'Listening',
          prompt: `${SECRET_PROMPT} listening item`,
          submittedCount: 2,
          unansweredCount: 2,
        }),
      ],
      students: [
        {
          attempts: 2,
          averageAccuracy: 75,
          bestAccuracy: 100,
          lastCompletedAt: completedAtAliceLatest,
          latestAccuracy: 50,
          needsReviewCount: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
        {
          attempts: 1,
          averageAccuracy: 100,
          bestAccuracy: 100,
          lastCompletedAt: completedAtBob,
          latestAccuracy: 100,
          needsReviewCount: 0,
          studentKey: 'student:bob',
          studentLabel: 'Bob',
        },
        {
          attempts: 1,
          averageAccuracy: 0,
          bestAccuracy: 0,
          lastCompletedAt: completedAtAnonymous,
          latestAccuracy: 0,
          needsReviewCount: 2,
          studentKey: 'anonymous:1',
          studentLabel: 'Anonymous student 1',
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-02-10T10:00:00.000Z'),
      id: 'assignment-result-review-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review visible classroom policy, not private answers.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'review-share-slug',
      status: 'published',
      title: 'Fractions exit ticket',
    },
    attempts: [
      buildAttemptRow({
        accuracy: 50,
        anonymousToken: null,
        completedAt: completedAtAliceLatest,
        id: 'attempt-alice-latest',
        score: 1,
        studentName: 'Alice',
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: completedAtAliceFirst,
        id: 'attempt-alice-first',
        score: 2,
        studentName: 'Alice',
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: completedAtBob,
        id: 'attempt-bob',
        score: 2,
        studentName: 'Bob',
      }),
      buildAttemptRow({
        accuracy: 0,
        anonymousToken: SECRET_ANONYMOUS_TOKEN,
        completedAt: completedAtAnonymous,
        id: 'attempt-anonymous',
        score: 0,
        studentName: null,
      }),
    ],
    snapshot: {
      activityDescription: 'Frozen classroom activity snapshot.',
      activityTitle: 'Fractions review snapshot',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 64,
      averagePoints: 1.25,
      averageScore: 63,
      completions: 4,
    },
  };
}

function buildAttemptReview({
  accuracy,
  completedAt,
  id,
  score,
  studentKey,
  studentLabel,
  variant = 'needs-review',
}: {
  accuracy: number;
  completedAt: Date;
  id: string;
  score: number;
  studentKey: string;
  studentLabel: string;
  variant?: 'empty' | 'needs-review' | 'perfect';
}) {
  return {
    accuracy,
    answers:
      variant === 'perfect'
        ? [
            buildAttemptAnswer({ correct: true, itemId: 'item-fraction' }),
            buildAttemptAnswer({ correct: true, itemId: 'item-vocabulary' }),
          ]
        : variant === 'empty'
          ? [
              buildAttemptAnswer({
                answer: '',
                correct: false,
                itemId: 'item-fraction',
                submitted: false,
              }),
              buildAttemptAnswer({
                answer: '',
                correct: false,
                itemId: 'item-listening',
                submitted: false,
              }),
            ]
          : [
              buildAttemptAnswer({ correct: true, itemId: 'item-fraction' }),
              buildAttemptAnswer({
                answer: SECRET_STUDENT_ANSWER,
                correct: false,
                itemId: 'item-listening',
              }),
            ],
    completedAt,
    durationSeconds: 55,
    id,
    score,
    studentKey,
    studentLabel,
  };
}

function buildAttemptAnswer({
  answer = '1/2',
  correct,
  itemId,
  submitted = true,
}: {
  answer?: string;
  correct: boolean;
  itemId: string;
  submitted?: boolean;
}) {
  return {
    acceptedAnswers: ['1/2', SECRET_EXPECTED_ANSWER],
    answer,
    correct,
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    explanation: 'Teacher-only explanation stays outside review handoff.',
    itemId,
    prompt: `${SECRET_PROMPT} ${itemId}`,
    submitted,
  };
}

function buildItemAnalysis({
  correctRate,
  itemId,
  kind,
  kindLabel,
  prompt,
  submittedCount,
  unansweredCount,
}: {
  correctRate: number;
  itemId: string;
  kind: 'listening' | 'question';
  kindLabel: string;
  prompt: string;
  submittedCount: number;
  unansweredCount: number;
}) {
  return {
    acceptedAnswers: ['1/2', SECRET_EXPECTED_ANSWER],
    correctCount: Math.max(0, submittedCount - unansweredCount),
    correctRate,
    explanation: 'Teacher-only explanation stays outside review handoff.',
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    itemId,
    kind,
    kindLabel,
    prompt,
    submittedCount,
    unansweredCount,
  };
}

function buildAttemptRow({
  accuracy,
  anonymousToken,
  completedAt,
  id,
  score,
  studentName,
}: {
  accuracy: number;
  anonymousToken: string | null;
  completedAt: Date;
  id: string;
  score: number;
  studentName: string | null;
}): AssignmentAttemptRowDisplayInput {
  return {
    anonymousToken,
    completedAt,
    id,
    maxScore: 2,
    resultJson: {
      accuracy,
      completedItemCount: score,
      durationSeconds: 55,
      totalPoints: 2,
    },
    score,
    studentName,
  };
}
