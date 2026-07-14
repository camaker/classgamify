import assert from 'node:assert/strict';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { RuntimeItem } from '@/activities/runtime';
import type {
  AssignmentSeed,
  AttemptAnswers,
  AttemptResult,
} from '@/activities/types';
import { analyzeAssignmentResults } from '@/assignments/results';
import type {
  PrintableAssignmentWorksheet,
  PrintableWorksheetItem,
} from '@/assignments/printable-worksheet';
import { buildPrintableWorksheetPageViewModel } from '@/assignments/printable-worksheet-view';
import {
  ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS,
  buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
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

type ResultAttemptFixture = {
  anonymousToken: string | null;
  answersJson: AttemptAnswers;
  completedAt: Date;
  id: string;
  resultJson: AttemptResult;
  score: number;
  studentName: string | null;
};

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
    createSubmissionKey: () => 'semantic-submission-key',
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
      'handout-overview',
      'preparation-metric-count',
      'student-fields',
      'response-plan',
      'answer-key',
      'answer-key-access',
      'answer-key-toggle-boundary',
      'printable-items',
      'response-modes',
      'choice-bank-coverage',
      'choice-bank-choice-count',
      'writing-area-coverage',
      'answer-line-count',
      'item-response-help',
      'assignment-field-count',
      'student-name-field',
      'date-field',
      'score-field',
      'share-path',
      'template',
      'snapshot-source',
      'instructions',
      'delivery-policy',
      'answer-key-items',
      'answer-key-details',
      'results-return',
      'print-action',
      'print-route-boundary',
      'public-runner-boundary',
      'privacy-guard',
    ]
  );
  assert.equal(hiddenPageView.handoffView.itemViews.length, 30);
  assert.deepEqual(hiddenPageView.handoffView.privacy, {
    exposesAnswerKeyText: false,
    exposesChoiceText: false,
    exposesPromptText: false,
    exposesStudentResponseText: false,
    itemIds: hiddenPageView.handoffView.itemViews.map((item) => item.id),
    scope: 'teacher-printable-worksheet',
  });
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
  assert.equal(
    includedPageView.handoffView.itemViews.find(
      (item) => item.id === 'answer-key-items'
    )?.value,
    '1 item'
  );
  assert.equal(
    JSON.stringify(includedPageView.handoffView).includes('Paris'),
    false
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

test('teacher results expose a scoped review handoff contract', () => {
  const runtimeItems = buildResultRuntimeItems();
  const resultAttempts = buildResultAttempts();
  const analysis = analyzeAssignmentResults({
    attempts: resultAttempts,
    runtimeItems,
    timeLimitSeconds: 120,
  });
  const pageView = buildAssignmentResultsPageViewModel({
    data: {
      activity: {
        description: 'Exit ticket review.',
        templateType: 'quiz',
        title: 'Capital review',
      },
      analysis,
      assignment: {
        expiresAt: null,
        id: 'assignment-1',
        settingsJson: {
          collectStudentName: true,
          maxAttempts: 2,
          showCorrectAnswers: true,
          shuffleItems: false,
          timeLimitSeconds: 120,
        },
        shareSlug: 'capital-review',
        status: 'published',
        title: 'Capital review',
      },
      attempts: resultAttempts.map(buildResultAttemptRow),
      snapshot: {
        activityDescription: 'Exit ticket review.',
        activityTitle: 'Capital review',
        templateType: 'quiz',
      },
      stats: {
        averageDurationSeconds: 43,
        averagePoints: 1.5,
        averageScore: 75,
        completions: 2,
      },
    },
    search: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'name',
      student: ' Alice ',
    },
  });

  const handoffView = pageView.reviewHandoffView;
  const expectedItemIds = [...ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS];

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    expectedItemIds
  );
  assert.equal(new Set(expectedItemIds).size, 30);
  assert.deepEqual(handoffView.privacy, {
    exposesCopyArtifactText: false,
    exposesCsvDataUrl: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesTeacherAnswerKey: false,
    itemIds: expectedItemIds,
    scope: 'teacher-result-review',
  });
  assert.equal(
    handoffView.itemViews.every((item) => Boolean(item.ariaLabel)),
    true
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'review-status'),
    'Needs review'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'review-next-step'),
    'Review flagged answers'
  );
  assert.equal(getReviewHandoffValue(handoffView, 'student-search'), 'Alice');
  assert.equal(
    getReviewHandoffValue(handoffView, 'student-search-status'),
    'Adjusted'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'student-sort'),
    'Student name'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'item-sort'),
    'Lowest accuracy'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'answer-review'),
    'Needs review only'
  );
  assert.equal(getReviewHandoffValue(handoffView, 'matched-students'), '1/2');
  assert.equal(getReviewHandoffValue(handoffView, 'matched-attempts'), '1/2');
  assert.equal(getReviewHandoffValue(handoffView, 'matched-items'), '2/2');
  assert.equal(
    getReviewHandoffValue(handoffView, 'matched-answer-reviews'),
    '1/2'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'route-state'),
    'Adjusted route'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'current-review-boundary'),
    'Current review'
  );
  assert.equal(
    getReviewHandoffValue(handoffView, 'full-export-boundary'),
    'Full assignment results'
  );
  assert.equal(getReviewHandoffValue(handoffView, 'privacy-guard'), 'Hidden');
  assert.equal(
    handoffView.itemViews.find((item) => item.id === 'action-export-csv')
      ?.dataScope,
    'full-assignment-results'
  );
  assert.equal(
    handoffView.itemViews.find((item) => item.id === 'preview-copy-brief')
      ?.dataScope,
    'current-review'
  );
  assert.deepEqual(
    pageView.copyArtifactPreviews.map((preview) => preview.actionButton.id),
    [
      'copy-brief:current-review',
      'copy-reteach-plan:current-review',
      'copy-item-review:current-review',
      'copy-follow-up:current-review',
    ]
  );

  const serializedHandoff = JSON.stringify(handoffView);
  assert.equal(serializedHandoff.includes(SECRET_ANSWER_TEXT), false);
  assert.equal(serializedHandoff.includes(SECRET_TOKEN), false);
  assert.equal(serializedHandoff.includes('data:text/csv'), false);
  assert.equal(serializedHandoff.includes('Paris'), false);
});

function getReviewHandoffValue(
  view: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['reviewHandoffView'],
  id: (typeof ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS)[number]
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing result review handoff item ${id}`);
  return itemView.value;
}

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

function buildResultRuntimeItems(): RuntimeItem[] {
  return [
    {
      answer: 'Paris',
      choices: ['Paris', 'Lyon'],
      explanation: 'Paris is the capital city.',
      id: 'capital-city',
      kind: 'question',
      prompt: 'Which city is the capital of France?',
    },
    {
      answer: '4',
      choices: ['3', '4'],
      explanation: 'Two plus two equals four.',
      id: 'simple-sum',
      kind: 'question',
      prompt: 'What is 2 + 2?',
    },
  ];
}

function buildResultAttempts(): ResultAttemptFixture[] {
  return [
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          {
            answer: SECRET_ANSWER_TEXT,
            correct: false,
            itemId: 'capital-city',
          },
          {
            answer: '4',
            correct: true,
            itemId: 'simple-sum',
          },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-04T10:00:00.000Z'),
      id: 'attempt-alice',
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        correctItemCount: 1,
        durationSeconds: 42,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
      studentName: ' Alice ',
    },
    {
      anonymousToken: SECRET_TOKEN,
      answersJson: {
        answers: [
          {
            answer: 'Paris',
            correct: true,
            itemId: 'capital-city',
          },
          {
            answer: '4',
            correct: true,
            itemId: 'simple-sum',
          },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-05T10:00:00.000Z'),
      id: 'attempt-anonymous',
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        durationSeconds: 44,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
      studentName: null,
    },
  ];
}

function buildResultAttemptRow(attempt: ResultAttemptFixture) {
  return {
    anonymousToken: attempt.anonymousToken,
    completedAt: attempt.completedAt,
    id: attempt.id,
    maxScore: attempt.resultJson.totalPoints,
    resultJson: attempt.resultJson,
    score: attempt.score,
    studentName: attempt.studentName,
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
