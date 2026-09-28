import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('API preserves replay before lifecycle, validation, scoring, and writes', () => {
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
    'persistAttemptWithinIdentityLimit({',
    scoring
  );
  const writeMapping = api.indexOf(
    '.catch(rethrowAssignmentSubmissionWriteError)',
    persistence
  );
  assert.ok(replay >= 0);
  assert.ok(lifecycle > replay);
  assert.ok(validation > lifecycle);
  assert.ok(scoring > validation);
  assert.ok(persistence > scoring);
  assert.ok(writeMapping > persistence);
});

test('D1 guards status and expiry at the before-insert boundary', () => {
  const migration = read(
    'src/db/migrations/0011_attempt_submission_lifecycle_guard.sql'
  );
  assert.match(
    migration,
    /CREATE TRIGGER `attempt_assignment_submission_status_guard`/
  );
  assert.match(
    migration,
    /CREATE TRIGGER `attempt_assignment_submission_expiry_guard`/
  );
  assert.match(migration, /BEFORE INSERT ON `attempt`/);
  assert.match(migration, /`status` = 'published'/);
  assert.match(migration, /unixepoch\('subsecond'\) \* 1000/);
  assert.match(migration, /classgamify_assignment_submission_status_blocked/);
  assert.match(migration, /classgamify_assignment_submission_expired/);
});

test('write errors classify lifecycle and slot conflicts without overlap', () => {
  const lifecycle = read('src/assignments/submission-lifecycle-write.ts');
  const concurrency = read('src/assignments/attempt-limit-concurrency.ts');
  assert.match(lifecycle, /getErrorTextChain/);
  assert.match(lifecycle, /getAssignmentSubmissionLifecycleWriteErrorMessage/);
  assert.match(lifecycle, /isAttemptIdentitySlotConflict/);
  assert.match(lifecycle, /attempt_assignment_identity_number_unique/);
  assert.match(
    concurrency,
    /recoverReplay\(\)[\s\S]*!isSlotConflict\(error\)[\s\S]*isSlotOccupied/
  );
});

test('public feedback and teacher results hide write-boundary metadata', () => {
  const api = read('src/api/assignments.ts');
  const response = api.slice(
    api.indexOf('function buildAttemptSubmissionResponse')
  );
  assert.doesNotMatch(
    response,
    /classgamify_assignment_submission_|identityKey:|attemptNumber:/
  );
  assert.doesNotMatch(
    read('src/assignments/results-export.ts'),
    /classgamify_assignment_submission_|identityKey|attemptNumber/
  );
});

test('product and catalog register submission lifecycle continuity', () => {
  assert.match(
    read('docs/product.md'),
    /submission lifecycle continuity gate[\s\S]*replay[\s\S]*BEFORE INSERT[\s\S]*localized[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-submission-lifecycle-continuity\.test\.ts[\s\S]*source guards/i
  );
});
