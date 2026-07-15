import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES,
  ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES,
  buildActivityMutationContinuityChainView,
} from '@/activities/activity-mutation-continuity-chain';
import { ACTIVITY_MUTATION_CONCURRENCY_STAGES } from '@/activities/mutation-concurrency';

const read = (path: string) => readFileSync(path, 'utf8');

test('activity mutation continuity carries 30 aligned stages', () => {
  const view = buildActivityMutationContinuityChainView();
  assert.equal(ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.deepEqual(
    ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES,
    ACTIVITY_MUTATION_CONCURRENCY_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ACTIVITY_MUTATION_CONCURRENCY_STAGES.map((stage) => stage.id)
  );
});

test('activity mutation continuity keeps a real 30-file boundary', () => {
  const view = buildActivityMutationContinuityChainView();
  assert.equal(ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES.length, 30);
  assert.equal(
    new Set(ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing activity mutation source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('mutation revisions advance monotonically', () => {
  const source = read('src/activities/mutation-concurrency.ts');
  assert.match(source, /resolveActivityMutationUpdatedAt/);
  assert.match(source, /Math\.max\(nowTimestamp, currentTimestamp \+ 1\)/);
  assert.match(source, /getActivityMutationConflictMessage/);
  assert.match(source, /buildActivityEditAccessView/);
});

test('compare-and-set includes owner visibility and revision predicates', () => {
  const query = read('src/activities/detail-query.ts');
  assert.match(query, /buildActivityMutationWhere/);
  assert.match(query, /buildActivityDetailOwnerWhere/);
  assert.match(query, /eq\(activity\.visibility, currentVisibility\)/);
  assert.match(query, /eq\(activity\.updatedAt, currentUpdatedAt\)/);
});

test('activity APIs use returning updates and conflict reloads', () => {
  const api = read('src/api/activities.ts');
  assert.match(
    api,
    /export const updateActivity[\s\S]*resolveActivityMutationUpdatedAt[\s\S]*buildActivityMutationWhere[\s\S]*returning\(buildActivityDetailSelect\(\)\)[\s\S]*throwActivityMutationConflict/
  );
  assert.match(
    api,
    /async function updateActivityVisibility[\s\S]*resolveActivityMutationUpdatedAt[\s\S]*buildActivityMutationWhere[\s\S]*returning\(buildActivityDetailSelect\(\)\)/
  );
  assert.match(
    api,
    /async function throwActivityMutationConflict[\s\S]*getActivityMutationConflictMessage/
  );
});

test('mutations preserve downstream snapshots and derivative gates', () => {
  assert.match(
    read('src/activities/activity-lifecycle-governance-chain.ts'),
    /snapshot-protection/
  );
  assert.match(read('src/assignments/snapshot.ts'), /snapshot/i);
  assert.match(read('src/activities/duplicate.ts'), /visibility/);
  assert.match(read('src/activities/template-remix.ts'), /visibility/);
});

test('activity mutation continuity hides private workspace details', () => {
  const view = buildActivityMutationContinuityChainView();
  assert.equal(view.privacy.preservesAssignmentSnapshots, true);
  assert.equal(view.privacy.usesMonotonicRevision, true);
  assert.equal(view.privacy.usesOwnerScopedCompareAndSet, true);
  assert.equal(view.privacy.usesSingleUpdateReturning, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and catalog register activity mutation continuity', () => {
  assert.match(
    read('docs/product.md'),
    /activity mutation continuity chain[\s\S]*30[\s\S]*owner[\s\S]*updatedAt[\s\S]*RETURNING[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-mutation-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
