import assert from 'node:assert/strict';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import type {
  PublicAttemptReviewItem,
  PublicAttemptReviewSummary,
} from '@/assignments/public';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
  type StudentRunnerAttemptResult,
  type StudentRunnerSubmissionHandoffItemId,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'Student Private Name';
const SECRET_TOKEN = 'raw-anonymous-token-value';

const EXPECTED_HANDOFF_ITEM_IDS = [
  'share-link',
  'runtime-items',
  'answered-items',
  'unanswered-items',
  'progress',
  'payload-summary',
  'submit-readiness',
  'partial-confirmation',
  'submission-state',
  'identity-mode',
  'identity-privacy',
  'timer-status',
  'timer-limit',
  'attempt-duration',
  'attempt-clock',
  'result-status',
  'score-summary',
  'review-summary',
  'feedback-scope',
  'next-steps',
] satisfies StudentRunnerSubmissionHandoffItemId[];

test('student runner submission handoff exposes 20 safe pre-submit slices', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const runtimeItem = starterPreview.runtimeItems[0];
  assert.ok(runtimeItem);

  const pageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: false,
        showCorrectAnswers: false,
        timeLimitSeconds: 120,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });

  assert.deepEqual(
    pageView.submissionHandoffView.itemViews.map((item) => item.id),
    EXPECTED_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(pageView.submissionHandoffView.privacy, {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    itemIds: EXPECTED_HANDOFF_ITEM_IDS,
    payloadMetricKeys: ['share-link', 'items', 'answers', 'unanswered'],
    readinessItemIds: [
      'share-link',
      'runtime-items',
      'completion',
      'incomplete-confirmation',
      'submission-state',
    ],
  });
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'share-link'),
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'answered-items'),
    '1'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'identity-mode'),
    'anonymous'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'identity-privacy'),
    'Token hidden'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'timer-limit'),
    '2:00'
  );
  assert.equal(
    pageView.submissionHandoffView.itemViews.every((item) =>
      Boolean(item.ariaLabel)
    ),
    true
  );
  assertNoPrivateSubmissionText(JSON.stringify(pageView.submissionHandoffView));
});

test('student runner submission handoff summarizes safe post-submit review state', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const runtimeItem = starterPreview.runtimeItems[0];
  assert.ok(runtimeItem);

  const result = buildAttemptResult({
    itemCount: starterPreview.runtimeItems.length,
    itemId: runtimeItem.id,
  });
  const pageView = buildStudentRunnerPageViewModel({
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: true,
        maxAttempts: 2,
        showCorrectAnswers: true,
        timeLimitSeconds: 90,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    result,
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 1,
  });

  assert.deepEqual(
    pageView.submissionHandoffView.itemViews.map((item) => item.id),
    EXPECTED_HANDOFF_ITEM_IDS
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'identity-mode'),
    'student-name'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'result-status'),
    'Score submitted'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'score-summary'),
    `0/${starterPreview.runtimeItems.length}`
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'feedback-scope'),
    'Visible'
  );
  assert.match(
    getHandoffItemValue(pageView.submissionHandoffView, 'review-summary'),
    /Submitted: 1/
  );
  assert.match(
    getHandoffItemValue(pageView.submissionHandoffView, 'next-steps'),
    /Review your score/
  );
  assertNoPrivateSubmissionText(JSON.stringify(pageView.submissionHandoffView));
});

function withAssignmentSettings(
  assignment: AssignmentSeed,
  settings: Partial<AssignmentSeed['settings']>
): AssignmentSeed {
  return {
    ...assignment,
    settings: {
      ...assignment.settings,
      ...settings,
    },
  };
}

function buildAttemptResult({
  itemCount,
  itemId,
}: {
  itemCount: number;
  itemId: string;
}): StudentRunnerAttemptResult {
  const reviewItems: PublicAttemptReviewItem[] = [
    {
      acceptedAnswers: ['Paris'],
      correct: false,
      correctAnswer: 'Paris',
      explanation: 'Capital city review note',
      itemId,
      submitted: true,
      submittedAnswer: SECRET_ANSWER_TEXT,
    },
  ];
  const reviewSummary: PublicAttemptReviewSummary = {
    correctItemCount: 0,
    hiddenBySettings: false,
    needsReviewItemCount: 1,
    reviewItemCount: 1,
    showCorrectAnswers: true,
    submittedItemCount: 1,
    totalItemCount: itemCount,
    unansweredItemCount: itemCount - 1,
  };

  return {
    accuracy: 0,
    attemptUsage: {
      maxAttempts: 2,
      remainingAttempts: 1,
      usedAttempts: 1,
    },
    completedItemCount: 1,
    correctItemCount: 0,
    durationSeconds: 22,
    earnedPoints: 0,
    reviewItems,
    reviewSummary,
    totalPoints: itemCount,
  };
}

function getHandoffItemValue(
  view: {
    itemViews: Array<{
      id: StudentRunnerSubmissionHandoffItemId;
      value: string;
    }>;
  },
  id: StudentRunnerSubmissionHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing handoff item ${id}`);
  return item.value;
}

function assertNoPrivateSubmissionText(serializedView: string) {
  assert.equal(serializedView.includes(SECRET_ANSWER_TEXT), false);
  assert.equal(serializedView.includes(SECRET_STUDENT_NAME), false);
  assert.equal(serializedView.includes(SECRET_TOKEN), false);
}
