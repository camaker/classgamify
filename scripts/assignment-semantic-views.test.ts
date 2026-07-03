import assert from 'node:assert/strict';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import type {
  PrintableAssignmentWorksheet,
  PrintableWorksheetItem,
} from '@/assignments/printable-worksheet';
import { buildPrintableWorksheetPageViewModel } from '@/assignments/printable-worksheet-view';
import type {
  PublicAttemptReviewItem,
  PublicAttemptReviewSummary,
} from '@/assignments/public';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
  buildStudentRunnerSubmissionExecutionPlan,
  type StudentRunnerAttemptResult,
  type StudentRunnerSubmissionPayloadSummaryView,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'Student Private Name';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('student runner exposes a safe submission contract view', () => {
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
    fallbackStartedAt: 1000,
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
    pageView.submissionContractView.itemViews.map((item) => item.id),
    ['payload-summary', 'submit-readiness', 'identity', 'timer', 'feedback']
  );
  assert.deepEqual(pageView.submissionContractView.privacy, {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    metricKeys: ['share-link', 'items', 'answers', 'unanswered'],
  });
  assert.deepEqual(
    pageView.controlView.payloadSummaryView.metrics.map((metric) => metric.key),
    ['share-link', 'items', 'answers', 'unanswered']
  );
  assert.equal(pageView.controlView.submitReadinessView.items.length, 5);
  assert.equal(
    pageView.controlView.submitReadinessView.items.some(
      (item) => item.id === 'completion' && item.status === 'needs-action'
    ),
    true
  );
  assert.equal(
    pageView.controlView.submitReadinessView.items.some(
      (item) =>
        item.id === 'incomplete-confirmation' && item.status === 'needs-action'
    ),
    true
  );
  assert.equal(pageView.controlView.timerBadge.show, true);
  assert.equal(pageView.identityView?.mode, 'anonymous');

  const serializedPayloadView = JSON.stringify(
    pageView.controlView.payloadSummaryView
  );
  assertNoPrivateSubmissionText(serializedPayloadView);

  const executionPlan = buildStudentRunnerSubmissionExecutionPlan({
    anonymousToken: SECRET_TOKEN,
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: true,
    createAnonymousToken: () => SECRET_TOKEN,
    now: 32_000,
    pageView,
    studentName: SECRET_STUDENT_NAME,
  });
  assert.equal(executionPlan.type, 'submit');
  if (executionPlan.type === 'submit') {
    assert.equal(executionPlan.payloadSummary.answerCount, 1);
    assert.equal(
      executionPlan.payloadSummary.unansweredItemCount,
      starterPreview.runtimeItems.length - 1
    );
    assertNoPrivateSubmissionText(
      JSON.stringify(executionPlan.payloadSummaryView)
    );
  }
});

test('student runner result contract reflects review visibility', () => {
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
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    result,
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 1,
  });

  assert.equal(pageView.resultPanelView.show, true);
  assert.equal(pageView.showStartAnotherAttempt, true);
  assert.equal(pageView.identityView?.mode, 'student-name');
  assert.equal(
    pageView.identityView?.mode === 'student-name'
      ? pageView.identityView.disabled
      : false,
    true
  );
  assert.equal(
    pageView.submissionContractView.itemViews.find(
      (item) => item.id === 'feedback'
    )?.value,
    pageView.resultPanelView.show
      ? pageView.resultPanelView.feedbackScopeView.statusLabel
      : ''
  );
  assert.equal(pageView.resultPanelView.show, true);
  if (pageView.resultPanelView.show) {
    assert.deepEqual(
      pageView.resultPanelView.reviewSummaryView.metrics.map(
        (metric) => metric.key
      ),
      ['submitted', 'correct', 'needs-review', 'unanswered']
    );
    assert.deepEqual(
      pageView.resultPanelView.feedbackScopeView.metrics.map(
        (metric) => metric.key
      ),
      [
        'visibility',
        'item-feedback',
        'accepted-alternatives',
        'explanations',
        'needs-review',
        'unanswered',
      ]
    );
    assert.deepEqual(
      pageView.resultPanelView.nextStepsView.stepViews.map((step) => step.id),
      ['review-score', 'feedback', 'start-another']
    );
  }
  assertNoPrivateSubmissionText(
    JSON.stringify(pageView.submissionContractView)
  );
});

test('printable worksheet page view exposes a complete handoff contract', () => {
  const hiddenPageView = buildPrintableWorksheetPageViewModel({
    answerKey: false,
    assignmentId: 'assignment-1',
    worksheet: buildWorksheet(),
  });
  assert.deepEqual(
    hiddenPageView.handoffView.itemViews.map((item) => item.id),
    [
      'student-fields',
      'response-plan',
      'answer-key',
      'share-path',
      'results-return',
      'print-action',
    ]
  );
  assert.equal(hiddenPageView.showAnswerKey, false);
  assert.equal(hiddenPageView.answerKeyView.accessView.state, 'hidden');
  assert.equal(
    hiddenPageView.handoffView.itemViews.every((item) =>
      Boolean(item.ariaLabel)
    ),
    true
  );
  assert.equal(
    JSON.stringify(hiddenPageView.handoffView).includes('Paris'),
    false
  );

  const includedPageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-1',
    worksheet: buildWorksheet(),
  });
  assert.equal(includedPageView.showAnswerKey, true);
  assert.equal(includedPageView.answerKeyView.accessView.state, 'included');
  assert.equal(includedPageView.answerKeyItemViews.length, 1);
  assert.equal(
    includedPageView.handoffView.itemViews.find(
      (item) => item.id === 'answer-key'
    )?.value,
    includedPageView.answerKeyView.accessView.value
  );

  const unavailablePageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-1',
    worksheet: {
      ...buildWorksheet(),
      answerKey: [],
    },
  });
  assert.equal(unavailablePageView.showAnswerKey, false);
  assert.equal(
    unavailablePageView.answerKeyView.accessView.state,
    'unavailable'
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

function buildWorksheet(): PrintableAssignmentWorksheet {
  const item: PrintableWorksheetItem = {
    answerSpaceLines: 1,
    choicePresentation: 'choice-list',
    choices: ['Paris', 'Lyon'],
    id: 'question-1',
    kind: 'question',
    layout: 'multiple-choice',
    prompt: 'Which city is the capital of France?',
    responseMode: 'choice',
    sequenceNumber: 1,
  };

  return {
    activityDescription: 'Practice capital cities.',
    activityTitle: 'Capital city check',
    answerKey: [
      {
        acceptedAnswers: ['Paris'],
        answer: 'Paris',
        explanation: 'Paris is the capital city.',
        id: item.id,
        kind: item.kind,
        prompt: item.prompt,
        sequenceNumber: item.sequenceNumber,
      },
    ],
    assignmentTitle: 'Capital city exit ticket',
    deliveryPolicyText: 'Two attempts, no shuffle.',
    deliverySummary: [],
    includeAnswerKey: false,
    instructions: 'Write the best answer.',
    items: [item],
    sharePath: '/play/demo-food',
    shareSlug: 'demo-food',
    templateType: 'quiz',
  };
}

function assertNoPrivateSubmissionText(serializedView: string) {
  assert.equal(serializedView.includes(SECRET_ANSWER_TEXT), false);
  assert.equal(serializedView.includes(SECRET_STUDENT_NAME), false);
  assert.equal(serializedView.includes(SECRET_TOKEN), false);
}
