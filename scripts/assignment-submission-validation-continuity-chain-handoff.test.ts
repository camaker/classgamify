import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES,
  buildAssignmentSubmissionValidationContinuityChainHandoffView,
} from '@/assignments/submission-validation-continuity-chain';
import { ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS } from '@/assignments/submission-validation-handoff';

const read = (path: string) => readFileSync(path, 'utf8');

test('submission validation continuity carries 30 aligned slices', () => {
  const view = buildAssignmentSubmissionValidationContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
    ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    [...ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS]
  );
  assert.equal(new Set(view.itemViews.map((item) => item.id)).size, 30);
});

test('submission validation continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentSubmissionValidationContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES)
      .size,
    30
  );
  for (const path of ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('shared answer validation rejects invalid ids before scoring', () => {
  const answers = read('src/assignments/attempt-answers.ts');
  assert.match(answers, /answers\.length > runtimeItems\.length/);
  assert.match(answers, /unknown-item/);
  assert.match(answers, /duplicate-item/);
  assert.match(answers, /duplicate-runtime-item/);
  assert.match(answers, /normalizeAttemptAnswerItemId/);
});

test('API normalizes and validates frozen runtime answers before scoring', () => {
  const api = read('src/api/assignments.ts');
  assert.match(
    api,
    /normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems[\s\S]*evaluateRuntimeAnswers/
  );
  assert.match(api, /runtimeItems: orderedRuntimeItems/);
});

test('browser payload and progress derive from runtime items', () => {
  const submission = read('src/assignments/student-submission.ts');
  assert.match(
    submission,
    /buildAttemptSubmissionAnswers[\s\S]*getUniqueSubmissionRuntimeItemEntries/
  );
  assert.match(
    submission,
    /getAttemptCompletionSummary[\s\S]*getUniqueSubmissionRuntimeItemEntries/
  );
  assert.match(submission, /isSafeStudentAttemptAnswerValidationErrorCode/);
});

test('public payload strips answers while teacher results use scored attempts', () => {
  assert.match(
    read('src/assignments/public.ts'),
    /stripRuntimeAnswers[\s\S]*answer:[\s\S]*undefined/
  );
  assert.match(
    read('src/assignments/result-view.ts'),
    /reviews: data\?\.analysis\.attempts/
  );
  assert.match(
    read('src/assignments/attempt-persistence.ts'),
    /resultJson: cloneAttemptResult\(evaluation\.result\)/
  );
});

test('public controls do not render submission validation audit DOM', () => {
  const controls = read(
    'src/components/assignments/student-runner-submit-controls.tsx'
  );
  const route = read('src/routes/play/$shareId.tsx');
  assert.doesNotMatch(
    controls,
    /data-handoff="assignment-submission-validation"/
  );
  assert.doesNotMatch(route, /submissionValidationHandoffView=\{/);
});

test('submission validation continuity keeps private content hidden', () => {
  const view = buildAssignmentSubmissionValidationContinuityChainHandoffView();
  assert.equal(view.privacy.allowsConfirmedPartialSubmissions, true);
  assert.equal(view.privacy.validatesBeforeScoring, true);
  assert.equal(view.privacy.usesFrozenRuntimeItems, true);
  for (const [key, value] of Object.entries(view.privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});

test('product and catalog register submission validation continuity', () => {
  assert.match(
    read('docs/product.md'),
    /submission validation continuity chain[\s\S]*30-slice[\s\S]*frozen runtime[\s\S]*partial[\s\S]*validate-before-scoring[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-submission-validation-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
