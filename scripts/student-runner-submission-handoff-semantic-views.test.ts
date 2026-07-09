import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS,
  type StudentRunnerAttemptResult,
  type StudentRunnerSubmissionHandoffItemId,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'Student Private Name';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('student runner submission handoff exposes 30 safe pre-submit slices', () => {
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
    [...STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS]
  );
  assert.equal(pageView.submissionHandoffView.itemViews.length, 30);
  assert.deepEqual(pageView.submissionHandoffView.privacy, {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    feedbackMetricKeys: [],
    itemIds: [...STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS],
    payloadMetricKeys: ['share-link', 'items', 'answers', 'unanswered'],
    readinessItemIds: [
      'share-link',
      'runtime-items',
      'completion',
      'incomplete-confirmation',
      'submission-state',
    ],
    reviewMetricKeys: [],
    scope: 'public-student-runner-submission',
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
    getHandoffItemValue(pageView.submissionHandoffView, 'result-accuracy'),
    'Not submitted'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'attempt-usage'),
    'Not submitted'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'retry-availability'),
    'Not submitted'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'review-submitted'),
    'Not submitted'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'feedback-items'),
    'Not submitted'
  );
  assert.equal(
    getHandoffItemValue(
      pageView.submissionHandoffView,
      'feedback-detail-evidence'
    ),
    'Alternatives: Not submitted · Explanations: Not submitted'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'privacy-guard'),
    'Private data omitted'
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
    [...STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS]
  );
  assert.equal(pageView.submissionHandoffView.itemViews.length, 30);
  assert.deepEqual(pageView.submissionHandoffView.privacy.reviewMetricKeys, [
    'submitted',
    'correct',
    'needs-review',
    'unanswered',
  ]);
  assert.deepEqual(pageView.submissionHandoffView.privacy.feedbackMetricKeys, [
    'visibility',
    'item-feedback',
    'accepted-alternatives',
    'explanations',
    'needs-review',
    'unanswered',
  ]);
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
    getHandoffItemValue(pageView.submissionHandoffView, 'result-accuracy'),
    '0% accuracy'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'attempt-usage'),
    '1 attempt left'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'retry-availability'),
    'Available'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'feedback-scope'),
    'Visible'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'review-submitted'),
    '1'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'review-needs-review'),
    '1'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'review-unanswered'),
    String(starterPreview.runtimeItems.length - 1)
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'feedback-visibility'),
    'Shown'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'feedback-items'),
    '1'
  );
  assert.equal(
    getHandoffItemValue(
      pageView.submissionHandoffView,
      'feedback-detail-evidence'
    ),
    'Alternatives: 0 · Explanations: 1'
  );
  assert.equal(
    getHandoffItemValue(pageView.submissionHandoffView, 'privacy-guard'),
    'Private data omitted'
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

test('student runner submission handoff renders hidden DOM relationships', () => {
  const componentSource = readFileSync(
    'src/components/assignments/student-runner-submission-handoff.tsx',
    'utf8'
  );
  const routeSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');

  assert.match(
    componentSource,
    /StudentRunnerSubmissionHandoffItemView[\s\S]*StudentRunnerSubmissionHandoffView[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="student-runner-submission"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map[\s\S]*StudentRunnerSubmissionHandoffItem[\s\S]*function StudentRunnerSubmissionHandoffItem[\s\S]*const labelId = `student-runner-submission-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `student-runner-submission-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `student-runner-submission-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Student runner submission handoff should render each safe submission slice with privacy scope plus stable label, value, and description relationships.'
  );
  assert.match(
    routeSource,
    /StudentRunnerSubmissionHandoff[\s\S]*from '@\/components\/assignments\/student-runner-submission-handoff'[\s\S]*<StudentRunnerSubmissionHandoff[\s\S]*view=\{runnerPageView\.submissionHandoffView\}/,
    'Student runner route should render the prepared hidden submission handoff view.'
  );
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
