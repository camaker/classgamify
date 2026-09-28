import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('shared identity helpers normalize names, tokens, and browser scope', () => {
  const source = read('src/assignments/identity.ts');
  assert.match(source, /normalizeStudentName/);
  assert.match(source, /normalizeAnonymousToken/);
  assert.match(source, /buildAnonymousAttemptTokenStorageKey/);
  assert.match(source, /getOrCreateAnonymousAttemptToken/);
  assert.match(source, /createStudentIdentityResolver/);
});

test('API resolves identity before attempt counting and persistence', () => {
  const api = read('src/api/assignments.ts');
  assert.match(
    api,
    /const submissionIdentity = resolveAttemptSubmissionIdentity[\s\S]*persistAttemptWithinIdentityLimit\([\s\S]*countPreviousIdentityAttempts/
  );
  assert.match(api, /studentName: submissionIdentity\.studentName/);
  assert.match(api, /anonymousToken: submissionIdentity\.anonymousToken/);
});

test('attempt limits and idempotency use normalized identity', () => {
  assert.match(
    read('src/assignments/attempt-identity-query.ts'),
    /resolveAttemptIdentityCountStrategy/
  );
  assert.match(
    read('src/assignments/attempt-limit-concurrency.ts'),
    /buildAttemptIdentitySlot/
  );
  assert.match(
    read('src/assignments/submission-idempotency.ts'),
    /doesAttemptSubmissionIdentityMatch/
  );
});

test('teacher results group and display safe student identities', () => {
  assert.match(
    read('src/assignments/results.ts'),
    /createStudentIdentityResolver/
  );
  assert.match(read('src/assignments/result-filters.ts'), /studentLabel/);
  assert.match(
    read('src/assignments/student-follow-up-priority.ts'),
    /studentLabel/
  );
});

test('product and catalog register attempt identity continuity', () => {
  assert.match(
    read('docs/product.md'),
    /attempt identity continuity gate[\s\S]*name[\s\S]*anonymous[\s\S]*attempt limit[\s\S]*teacher result[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-identity-continuity\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
