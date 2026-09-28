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
  type StudentRunnerAttemptResult,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

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
    TEST_CATALOG_SOURCE,
    /Student runner submission chain has a fast script-level gate via[\s\S]*scripts\/student-runner-submission-chain\.test\.ts/,
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
