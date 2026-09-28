import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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

test('product and catalog register idempotency continuity', () => {
  assert.match(
    read('docs/product.md'),
    /submission idempotency continuity gate[\s\S]*browser key[\s\S]*replay[\s\S]*D1[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-submission-idempotency-continuity\.test\.ts[\s\S]*source guards/i
  );
});
