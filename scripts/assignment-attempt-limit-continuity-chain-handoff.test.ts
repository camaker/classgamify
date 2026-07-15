import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES,
  buildAssignmentAttemptLimitContinuityChainHandoffView,
} from '@/assignments/attempt-limit-continuity-chain';
import { ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS } from '@/assignments/attempt-limit-handoff';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt limit continuity chain carries 30 aligned handoff slices', () => {
  const view = buildAssignmentAttemptLimitContinuityChainHandoffView();

  assert.equal(
    ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
    ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS]
  );
  assert.equal(new Set(view.itemViews.map((item) => item.id)).size, 30);
});

test('attempt limit continuity keeps a real 30-file source boundary', () => {
  const view = buildAssignmentAttemptLimitContinuityChainHandoffView();

  assert.equal(
    ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing attempt-limit source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
  assert.deepEqual(view.privacy.sourceFiles, [
    ...ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES,
  ]);
});

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
  assert.match(read('src/assignments/public.ts'), /attempt-limit/);
  assert.match(read('src/assignments/result-view.ts'), /settingsSummaryView/);
  assert.match(
    read('src/assignments/results-export.ts'),
    /delivery-attempt-limit/
  );
});

test('attempt limit continuity keeps private slot metadata out of summaries', () => {
  const view = buildAssignmentAttemptLimitContinuityChainHandoffView();

  assert.equal(view.privacy.finiteAttemptsUseUniqueIdentitySlots, true);
  assert.equal(view.privacy.preservesIdempotentReplayPriority, true);
  assert.equal(view.privacy.unlimitedAttemptsAvoidSlotContention, true);
  assert.equal(view.privacy.usesSharedAttemptLimitHelpers, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and e2e catalogs register the attempt limit source chain', () => {
  assert.match(
    read('docs/product.md'),
    /attempt limit continuity chain[\s\S]*30-slice[\s\S]*identity[\s\S]*idempotent replay[\s\S]*concurrent[\s\S]*retry[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-limit-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
