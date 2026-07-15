import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES,
  buildAssignmentAttemptIdentityContinuityChainHandoffView,
} from '@/assignments/attempt-identity-continuity-chain';
import { ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/identity-handoff';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt identity continuity carries 30 aligned slices', () => {
  const view = buildAssignmentAttemptIdentityContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
    ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    [...ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS]
  );
});

test('attempt identity continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentAttemptIdentityContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

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

test('attempt identity continuity hides raw identity details', () => {
  const view = buildAssignmentAttemptIdentityContinuityChainHandoffView();
  assert.equal(view.privacy.namedIdentityTakesPriority, true);
  assert.equal(view.privacy.usesAssignmentScopedAnonymousTokens, true);
  assert.equal(view.privacy.usesNormalizedIdentityForAttemptLimits, true);
  assert.equal(view.privacy.usesSharedIdentityHelpers, true);
  for (const [key, value] of Object.entries(view.privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});

test('product and catalog register attempt identity continuity', () => {
  assert.match(
    read('docs/product.md'),
    /attempt identity continuity chain[\s\S]*30-slice[\s\S]*name[\s\S]*anonymous[\s\S]*attempt limit[\s\S]*teacher result[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-identity-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
