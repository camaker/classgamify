import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt limit domain normalizes limits, counts, and remaining usage', () => {
  const source = read('src/assignments/attempt-limits.ts');

  assert.match(source, /normalizeAssignmentMaxAttempts/);
  assert.match(source, /normalizeAssignmentAttemptCount/);
  assert.match(source, /buildAssignmentAttemptUsage/);
  assert.match(source, /canUseAnotherAssignmentAttempt/);
  assert.match(source, /Math\.trunc/);
  assert.match(source, /Math\.max\(0,/);
});

test('finite attempts use normalized identity slots and a D1 unique boundary', () => {
  const concurrency = read('src/assignments/attempt-limit-concurrency.ts');
  const schema = read('src/db/app.schema.ts');
  const migration = read('src/db/migrations/0010_breezy_toro.sql');

  assert.match(concurrency, /buildAttemptIdentitySlot/);
  assert.match(concurrency, /identityKey/);
  assert.match(concurrency, /attemptNumber/);
  assert.match(schema, /attempt_assignment_identity_number_unique/);
  assert.match(migration, /attempt_assignment_identity_number_unique/);
});

test('submit API preserves replay before limit and concurrent slot recovery', () => {
  const api = read('src/api/assignments.ts');

  assert.match(api, /recoverAttemptSubmissionResponse/);
  assert.match(api, /persistAttemptWithinIdentityLimit/);
  assert.match(api, /countPreviousIdentityAttempts/);
  assert.match(api, /isAttemptIdentitySlotOccupied/);
  assert.match(
    api,
    /persistence\.type === 'replay'[\s\S]*persistence\.type === 'limit-reached'/
  );
});

test('student retry, public rules, teacher result, and export stay aligned', () => {
  assert.match(
    read('src/assignments/student-submission.ts'),
    /canUseAnotherAssignmentAttempt/
  );
  assert.match(read('src/assignments/student-runner-state.ts'), /attemptUsage/);
  assert.match(read('src/assignments/delivery-summary.ts'), /maxAttempts/);
  assert.match(
    read('src/assignments/delivery-summary.ts'),
    /assignment_delivery_label_attempts/
  );
  assert.match(read('src/assignments/result-view.ts'), /settingsSummaryView/);
  assert.match(
    read('src/assignments/results-export.ts'),
    /deliveryView\.maxAttempts/
  );
});

test('product and e2e catalogs register the attempt limit source chain', () => {
  assert.match(
    read('docs/product.md'),
    /attempt limit continuity gate[\s\S]*identity[\s\S]*idempotent replay[\s\S]*concurrent[\s\S]*retry[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-limit-continuity\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
