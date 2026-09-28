import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import type {
  PublicAttemptReviewItem,
  PublicAttemptReviewSummary,
} from '@/assignments/public';
import {
  STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES,
  buildStudentRunnerSubmissionChainHandoffView,
  type StudentRunnerSubmissionChainHandoffItemId,
  type StudentRunnerSubmissionChainHandoffView,
} from '@/assignments/student-runner-submission-chain';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
  type StudentRunnerAttemptResult,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync('src/routes/play/$shareId.tsx', 'utf8');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_ANSWER';
const SECRET_RAW_PAYLOAD = 'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_RAW_PAYLOAD';
const SECRET_RUNTIME_ITEM_ID =
  'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_RUNTIME_ITEM_ID';
const SECRET_SOURCE_MATERIAL =
  'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_MATERIAL';
const SECRET_STUDENT_NAME =
  'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_STUDENT_NAME';
const SECRET_TEACHER_ANSWER =
  'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_TEACHER_ANSWER';
const SECRET_TOKEN = 'SECRET_STUDENT_RUNNER_SUBMISSION_CHAIN_TOKEN';

test('student runner submission chain exposes 30 safe slices', () => {
  const handoffView = buildStudentRunnerSubmissionChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Student runner submission chain');
  assert.match(
    handoffView.description,
    /Thirty-slice student runner submission chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    chainSourceFileCount: STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES.length,
    connectsAnswerFeedbackLifecycleChain: true,
    connectsAttemptDurationHandoff: true,
    connectsAttemptLimitHandoff: true,
    connectsAttemptPersistenceHandoff: true,
    connectsScoredAttemptResultChain: true,
    connectsStudentRunnerPlayChain: true,
    connectsSubmitControls: true,
    connectsSubmissionValidationHandoff: true,
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    itemIds,
    sourceFiles: [...STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES],
    usesAttemptTimerView: true,
    usesFeedbackScopeView: true,
    usesIdentityView: true,
    usesNextStepsView: true,
    usesPayloadSummaryView: true,
    usesPreparedPageViewModel: true,
    usesResultPanelView: true,
    usesReviewSummaryView: true,
    usesStudentRunnerSubmitControls: true,
    usesSubmitReadinessView: true,
    validatesSubmissionBeforePersistence: true,
  });
  assertNoPrivateStudentSubmissionChainText(JSON.stringify(handoffView));
});

test('student runner submission chain summarizes each boundary', () => {
  const handoffView = buildStudentRunnerSubmissionChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['share-link', 'Normalized public share link'],
      ['runtime-items', 'Frozen runtime count'],
      ['answered-items', 'Answered count'],
      ['unanswered-items', 'Unanswered count'],
      ['progress', 'Progress label'],
      ['payload-summary', 'Prepared payload metrics'],
      ['submit-readiness', 'Prepared readiness state'],
      ['partial-confirmation', 'Explicit incomplete confirmation'],
      ['submission-state', 'Ready, submitting, or blocked'],
      ['identity-mode', 'Name or anonymous mode'],
      ['identity-privacy', 'Name/token hidden'],
      ['timer-status', 'Prepared timer badge'],
      ['timer-limit', 'Assignment time limit'],
      ['attempt-duration', 'Normalized duration display'],
      ['attempt-clock', 'Clock starts after readiness'],
      ['result-status', 'Pending or submitted'],
      ['score-summary', 'Earned/total points'],
      ['result-accuracy', 'Accuracy label'],
      ['attempt-usage', 'Remaining attempts'],
      ['retry-availability', 'Retry if allowed'],
      ['review-summary', 'Submitted, correct, review, unanswered'],
      ['review-submitted', 'Submitted review count'],
      ['review-needs-review', 'Needs-review count'],
      ['review-unanswered', 'Unanswered count'],
      ['feedback-scope', 'Hidden or visible'],
      ['feedback-visibility', 'Visibility metric'],
      ['feedback-items', 'Visible feedback item count'],
      ['feedback-detail-evidence', 'Alternatives and explanations counts'],
      ['next-steps', 'Review or retry guidance'],
      ['privacy-guard', 'Private submission data omitted'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'payload-summary'),
    'Prepared payload metrics'
  );
});

test('student runner submission chain is backed by adjacent gates', () => {
  assert.equal(STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing student runner submission chain file ${filePath}`
    );
  }
});

test('student runner submission chain keeps pre-submit visible state private', () => {
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

  const visibleView = {
    attemptTimerBadge: pageView.attemptTimerBadge,
    controlView: pageView.controlView,
    identityView: pageView.identityView,
    resultPanelView: pageView.resultPanelView,
  };

  assert.equal(pageView.controlView.progressView.answeredItemCount, 1);
  assert.equal(
    pageView.controlView.progressView.itemCount,
    starterPreview.runtimeItems.length
  );
  assert.equal(pageView.identityView?.mode, 'anonymous');
  assert.equal(pageView.attemptTimerBadge.show, true);
  assert.match(pageView.attemptTimerBadge.label, /2:00/);
  assert.equal(pageView.resultPanelView.show, false);
  assertNoPrivateStudentSubmissionChainText(JSON.stringify(visibleView));
});

test('student runner submission chain shows the post-submit result panel', () => {
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

  const resultPanelView = pageView.resultPanelView;
  assert.equal(resultPanelView.show, true);
  assert.ok(resultPanelView.show);
  assert.equal(pageView.identityView?.mode, 'student-name');
  assert.equal(
    resultPanelView.scoreLabel,
    `0/${starterPreview.runtimeItems.length}`
  );
  assert.equal(resultPanelView.showStartAnotherAttempt, true);
  assertNoPrivateStudentSubmissionChainText(
    JSON.stringify({
      controlView: pageView.controlView,
      identityView: pageView.identityView,
      resultPanelView,
    })
  );
});

test('student runner submission source boundaries preserve domain ownership', () => {
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /normalizeAttemptDurationSeconds[\s\S]*durationSeconds/,
    'Student submission helpers should normalize submitted duration seconds.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /resolveAttemptSubmissionDurationSeconds[\s\S]*runtimeItems[\s\S]*shareSlug/,
    'Student submission plans should resolve browser attempt duration before building the payload.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildAttemptDurationDisplayView[\s\S]*durationView/,
    'Student result display should render duration through the shared attempt-duration view.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /attempt-limit-reached/,
    'Student submission helpers should connect duration normalization and attempt-limit failure mapping.'
  );
  assert.doesNotMatch(
    ROUTE_SOURCE,
    /Handoff\b|data-handoff/,
    'The focused public play route should not render hidden submission audit markup.'
  );
});

test('student runner submission chain is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /student-runner-submission chain[\s\S]*30-slice source-level contract[\s\S]*progress[\s\S]*payload[\s\S]*submit-readiness[\s\S]*identity[\s\S]*timer[\s\S]*result[\s\S]*review-summary[\s\S]*feedback-scope[\s\S]*next-step[\s\S]*privacy/,
    'docs/product.md should document the student-runner-submission chain scope.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/assignments\/student-runner-submission-chain\.ts[\s\S]*source-level contract/i,
    'docs/product.md should name the student runner submission chain source file.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Student runner submission chain has a fast script-level gate via[\s\S]*scripts\/student-runner-submission-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the student runner submission chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /progress[\s\S]*payload summary[\s\S]*submit-readiness[\s\S]*identity privacy[\s\S]*timer[\s\S]*attempt duration[\s\S]*result panel[\s\S]*review summary[\s\S]*feedback scope[\s\S]*next steps[\s\S]*privacy guards/,
    'TEST-CATALOG should document the student runner submission chain trigger scope.'
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
      correctAnswer: SECRET_TEACHER_ANSWER,
      explanation: 'Submission chain explanation hidden.',
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

function getHandoffValue(
  view: StudentRunnerSubmissionChainHandoffView,
  id: StudentRunnerSubmissionChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing student runner submission chain item ${id}`);
  return item.value;
}

function assertNoPrivateStudentSubmissionChainText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_RAW_PAYLOAD,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TEACHER_ANSWER,
    SECRET_TOKEN,
    'Submission chain explanation hidden.',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runner submission chain leaked private text: ${privateValue}`
    );
  }
}
