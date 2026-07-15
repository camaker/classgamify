import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES,
  ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES,
  buildAssignmentSubmissionIdempotencyContinuityChainView,
} from '@/assignments/submission-idempotency-continuity-chain';
import { ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES } from '@/assignments/submission-idempotency';

const read = (path: string) => readFileSync(path, 'utf8');

test('submission idempotency continuity carries 30 aligned stages', () => {
  const view = buildAssignmentSubmissionIdempotencyContinuityChainView();

  assert.equal(
    ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES,
    ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES.map((stage) => stage.id)
  );
  assert.equal(new Set(view.itemViews.map((item) => item.id)).size, 30);
});

test('submission idempotency continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentSubmissionIdempotencyContinuityChainView();

  assert.equal(
    ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES)
      .size,
    30
  );
  for (const path of ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing idempotency source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('runner creates keys after gates, reuses retries, and resets boundaries', () => {
  const submission = read('src/assignments/student-submission.ts');
  const state = read('src/assignments/student-runner-state.ts');
  const route = read('src/routes/play/$shareId.tsx');

  assert.match(
    submission,
    /if \(submitGate\.type !== 'submit'\) return submitGate;[\s\S]*resolveAttemptSubmissionKey/
  );
  assert.match(state, /currentSubmissionKey: submissionKey/);
  assert.match(state, /submissionKey: undefined/);
  assert.match(
    route,
    /setSubmissionKey\(executionPlan\.input\.submissionKey\)/
  );
  assert.match(route, /setSubmissionKey\(resetPlan\.submissionKey\)/);
  assert.match(route, /setSubmissionKey\(restartPlan\.submissionKey\)/);
});

test('API recovers replay before lifecycle, validation, scoring, and writes', () => {
  const api = read('src/api/assignments.ts');
  const replay = api.indexOf(
    'const replayResponse = await recoverAttemptSubmissionResponse'
  );
  const lifecycle = api.indexOf('assertAssignmentAcceptsSubmissions', replay);
  const validation = api.indexOf(
    'assertSubmittedAnswersMatchRuntimeItems',
    lifecycle
  );
  const scoring = api.indexOf('evaluateRuntimeAnswers', validation);
  const persistence = api.indexOf(
    'const persistence = await persistAttemptWithinIdentityLimit',
    scoring
  );

  assert.ok(replay >= 0);
  assert.ok(lifecycle > replay);
  assert.ok(validation > lifecycle);
  assert.ok(scoring > validation);
  assert.ok(persistence > scoring);
  assert.match(api, /doesAttemptSubmissionIdentityMatch/);
  assert.match(api, /persistence\.type === 'replay'/);
});

test('D1 uniqueness and concurrency recover matching retries first', () => {
  const schema = read('src/db/app.schema.ts');
  const migration = read('src/db/migrations/0009_minor_winter_soldier.sql');
  const concurrency = read('src/assignments/attempt-limit-concurrency.ts');

  assert.match(schema, /attempt_assignment_submission_key_unique/);
  assert.match(migration, /attempt_assignment_submission_key_unique/);
  assert.match(
    concurrency,
    /catch \(error\)[\s\S]*recoverReplay\(\)[\s\S]*replay !== null[\s\S]*isSlotOccupied/
  );
});

test('replay returns persisted sanitized feedback without private keys', () => {
  const api = read('src/api/assignments.ts');
  const responseStart = api.indexOf('function buildAttemptSubmissionResponse');
  const response = api.slice(responseStart);

  assert.match(response, /buildPublicAttemptReviewSummaryView/);
  assert.match(response, /buildPublicAttemptResult\(result\)/);
  assert.doesNotMatch(response, /submissionKey:|anonymousToken:|studentName:/);
  assert.doesNotMatch(
    read('src/assignments/results-export.ts'),
    /submissionKey/
  );
});

test('submission idempotency continuity hides private retry details', () => {
  const view = buildAssignmentSubmissionIdempotencyContinuityChainView();

  assert.equal(view.privacy.preservesReplayBeforeNewAttemptGates, true);
  assert.equal(view.privacy.usesAssignmentScopedKeyUniqueness, true);
  assert.equal(view.privacy.usesNormalizedIdentityForReplay, true);
  assert.equal(view.privacy.usesOneKeyPerAttempt, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and catalog register idempotency continuity', () => {
  assert.match(
    read('docs/product.md'),
    /submission idempotency continuity chain[\s\S]*30[\s\S]*browser key[\s\S]*replay[\s\S]*D1[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-submission-idempotency-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
