import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_SUBMISSION_VALIDATION_ANSWER';
const SECRET_ANONYMOUS_TOKEN = 'secret-submission-validation-token';
const SECRET_RUNTIME_ITEM_ID = 'secret-runtime-item-id';
const SECRET_STUDENT_NAME = 'Secret Submission Validation Student';

const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_ANSWERS_SOURCE = readFileSync(
  'src/assignments/attempt-answers.ts',
  'utf8'
);
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync('src/routes/play/$shareId.tsx', 'utf8');
const RUNNER_STATE_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const SUBMIT_CONTROLS_SOURCE = readFileSync(
  'src/components/assignments/student-runner-submit-controls.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('student runner progress counts only answered runtime items', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const runtimeItem = starterPreview.runtimeItems[0];
  assert.ok(runtimeItem);

  const pageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: starterPreview.assignment,
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });

  const payloadSummaryView = pageView.controlView.payloadSummaryView;
  assert.equal(pageView.controlView.progressView.answeredItemCount, 1);
  assert.equal(
    pageView.controlView.progressView.itemCount,
    starterPreview.runtimeItems.length
  );
  assertNoPrivateSubmissionValidationText(JSON.stringify(payloadSummaryView));
  assert.equal(
    JSON.stringify(payloadSummaryView).includes(runtimeItem.id),
    false
  );
});

test('submission validation is wired to source boundaries', () => {
  assert.match(
    ATTEMPT_ANSWERS_SOURCE,
    /assertSubmittedAnswersMatchRuntimeItems[\s\S]*answers\.length > runtimeItems\.length[\s\S]*unknown-item[\s\S]*duplicate-item[\s\S]*duplicate-runtime-item/,
    'Attempt-answer helper should reject too-many, unknown, duplicate, and duplicate-runtime ids.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /const submittedAnswers = normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*answers: submittedAnswers,[\s\S]*runtimeItems: orderedRuntimeItems,[\s\S]*\}\)[\s\S]*evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/,
    'Submit attempt API should normalize and validate answers before scoring.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /const evaluation = evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers[\s\S]*buildScoredAttemptInsert\(\{[\s\S]*evaluation,/,
    'Scored attempt persistence should receive the evaluation produced from normalized submitted answers.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildAttemptSubmissionAnswers[\s\S]*getUniqueSubmissionRuntimeItemEntries\(runtimeItems\)[\s\S]*if \(!isStudentAnswerFilled\(answer\)\) return \[\]/,
    'Browser payload builder should derive rows from runtime items and omit empty answers.'
  );
  assert.match(
    RUNNER_STATE_SOURCE,
    /const currentPayloadSummary = buildStudentRunnerCurrentPayloadSummary\(\{[\s\S]*activeShareId,[\s\S]*attemptState,/,
    'Student runner page view-model should derive payload counts from the active attempt state.'
  );
  assert.doesNotMatch(
    SUBMIT_CONTROLS_SOURCE,
    /data-handoff="assignment-submission-validation"|function AssignmentSubmissionValidationHandoff/,
    'Student submit controls should keep submission-validation handoff diagnostics out of the public student DOM.'
  );
  assert.doesNotMatch(
    ROUTE_SOURCE,
    /submissionValidationHandoffView=\{\s*runnerPageView\.submissionValidationHandoffView\s*\}/,
    'Student play route should not pass submission-validation handoff diagnostics into public submit controls.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /stripRuntimeAnswers[\s\S]*answer:[\s\S]*undefined/,
    'Public assignment payloads should strip teacher-only answers before student delivery.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultsPageViewModel[\s\S]*reviews: data\?\.analysis\.attempts/,
    'Teacher result views should rely on stored attempt analysis rather than public payload internals.'
  );
});

test('submission validation focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-submission-validation\.test\.ts/,
    'E2E catalog should point submission-validation work at the focused script gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /frozen runtime validation[\s\S]*partial-submission payloads[\s\S]*runtime id normalization[\s\S]*unknown\/duplicate\/too-many rejection[\s\S]*API answer\s+limits[\s\S]*safe failure mapping[\s\S]*teacher-result\/public-payload boundaries[\s\S]*submission-validation privacy-scope\s+boundaries[\s\S]*no-public-audit DOM\s+boundaries/,
    'E2E catalog should say which submission-validation product boundaries need the focused gate.'
  );
});

function assertNoPrivateSubmissionValidationText(serialized: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_ANONYMOUS_TOKEN,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_STUDENT_NAME,
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
      `Submission validation handoff leaked private text: ${privateValue}`
    );
  }
}

test('assignment submission validation source boundaries stay wired to shared helpers', () => {
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /const submittedAnswers = normalizeSubmittedAttemptAnswers/,
    'apiNormalizesAnswersBeforeValidation'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /assertSubmittedAnswersMatchRuntimeItems[\s\S]*evaluateRuntimeAnswers/,
    'apiValidatesBeforeScoring'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildAttemptSubmissionAnswers[\s\S]*getUniqueSubmissionRuntimeItemEntries/,
    'clientPayloadUsesRuntimeItems'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /getAttemptCompletionSummary[\s\S]*getUniqueSubmissionRuntimeItemEntries/,
    'clientProgressUsesRuntimeItems'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /stripRuntimeAnswers/,
    'publicPayloadExcludesTeacherAnswers'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /isSafeStudentAttemptAnswerValidationErrorCode[\s\S]*unknown-item/,
    'safeFailureMapping'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/,
    'scoringUsesNormalizedAnswers'
  );
});
