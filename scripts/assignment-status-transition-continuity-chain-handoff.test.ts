import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES,
  ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES,
  buildAssignmentStatusTransitionContinuityChainView,
} from '@/assignments/status-transition-continuity-chain';
import { ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES } from '@/assignments/status-transition-concurrency';

const read = (path: string) => readFileSync(path, 'utf8');

test('status transition continuity carries 30 aligned stages', () => {
  const view = buildAssignmentStatusTransitionContinuityChainView();
  assert.equal(ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.deepEqual(
    ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES,
    ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES.map((stage) => stage.id)
  );
});

test('status transition continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentStatusTransitionContinuityChainView();
  assert.equal(
    ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing transition source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('transition revisions advance monotonically at the domain boundary', () => {
  const source = read('src/assignments/status-transition-concurrency.ts');
  assert.match(source, /normalizeAssignmentLifecycleTimestamp/);
  assert.match(source, /normalizeAssignmentLifecycleNowTimestamp/);
  assert.match(source, /Math\.max\(nowTimestamp, currentTimestamp \+ 1\)/);
  assert.match(source, /getAssignmentStatusTransitionConflictMessage/);
});

test('compare-and-set carries owner status revision and reopen time', () => {
  const query = read('src/assignments/detail-query.ts');
  assert.match(query, /buildAssignmentStatusTransitionWhere/);
  assert.match(query, /buildAssignmentDetailOwnerWhere/);
  assert.match(query, /eq\(assignment\.status, currentStatus\)/);
  assert.match(query, /eq\(assignment\.updatedAt, currentUpdatedAt\)/);
  assert.match(query, /isNull\(assignment\.expiresAt\)/);
  assert.match(query, /gt\(assignment\.expiresAt, normalizedNow\)/);
});

test('status API uses one returning update and reloads conflicts', () => {
  const api = read('src/api/assignments.ts');
  const start = api.indexOf('export const updateAssignmentStatus');
  const end = api.indexOf('const getAssignmentResultsInputSchema', start);
  const handler = api.slice(start, end);
  assert.match(handler, /assertAssignmentStatusTransition/);
  assert.match(handler, /resolveAssignmentStatusTransitionUpdatedAt/);
  assert.match(handler, /buildAssignmentStatusTransitionWhere/);
  assert.match(handler, /returning\(buildAssignmentLifecycleGateSelect\(\)\)/);
  assert.match(
    handler,
    /if \(!transitionedAssignment\)[\s\S]*getAssignmentStatusTransitionConflictMessage/
  );
});

test('close and reopen retain snapshots attempts and teacher results', () => {
  assert.match(
    read('src/assignments/assignment-lifecycle-governance-chain.ts'),
    /snapshot-retention[\s\S]*attempt-review-retention/
  );
  assert.match(
    read('src/assignments/submission-lifecycle-continuity-chain.ts'),
    /preservesReplayBeforeLifecycleRejection/
  );
  assert.match(read('src/assignments/results.ts'), /attempts/);
  assert.match(read('src/assignments/results-export.ts'), /attempts/);
});

test('status transition continuity hides private lifecycle details', () => {
  const view = buildAssignmentStatusTransitionContinuityChainView();
  assert.equal(view.privacy.preservesAttemptsAndResults, true);
  assert.equal(view.privacy.preservesFrozenSnapshot, true);
  assert.equal(view.privacy.usesMonotonicRevision, true);
  assert.equal(view.privacy.usesOwnerScopedCompareAndSet, true);
  assert.equal(view.privacy.usesSingleUpdateReturning, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and catalog register status transition continuity', () => {
  assert.match(
    read('docs/product.md'),
    /status transition continuity chain[\s\S]*30[\s\S]*owner[\s\S]*updatedAt[\s\S]*RETURNING[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-status-transition-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
