import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES,
  ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_STAGES,
  buildActivityAuthoringPublishContinuityChainView,
} from '@/activities/activity-authoring-publish-continuity-chain';

const read = (path: string) => readFileSync(path, 'utf8');

test('activity authoring publish continuity carries 30 unique stages', () => {
  const view = buildActivityAuthoringPublishContinuityChainView();
  assert.equal(ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.equal(
    new Set(
      ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      )
    ).size,
    30
  );
  assert.deepEqual(view.sourceContracts, {
    authoringLibrary: 30,
    derivative: 30,
    filterState: 30,
    lifecycle: 30,
    mutation: 30,
    publish: 30,
  });
});

test('activity authoring publish continuity keeps a real 30-file boundary', () => {
  const view = buildActivityAuthoringPublishContinuityChainView();
  assert.equal(
    ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.sourceFileCount, 30);
});

test('create edit and library paths stay owner scoped', () => {
  const api = read('src/api/activities.ts');
  assert.match(api, /createActivityInputSchema/);
  assert.match(api, /buildActivityDetailOwnerWhere/);
  assert.match(api, /buildActivityLibraryWhere\([\s\S]*userId/);
  assert.match(api, /validateActivitySourceMaterialWrite/);
});

test('mutations use lifecycle revision compare and set', () => {
  const api = read('src/api/activities.ts');
  assert.match(api, /resolveActivityMutationUpdatedAt/);
  assert.match(api, /buildActivityMutationWhere/);
  assert.match(api, /\.returning\(buildActivityDetailSelect\(\)\)/);
  assert.match(api, /throwActivityMutationConflict/);
});

test('duplicate remix and publish use guarded source writes', () => {
  const activities = read('src/api/activities.ts');
  const assignments = read('src/api/assignments.ts');
  assert.match(activities, /rethrowActivityDerivativeSourceWriteError/);
  assert.match(activities, /assertActivityCanDeriveWork/);
  assert.match(assignments, /rethrowAssignmentPublishSourceWriteError/);
  assert.match(assignments, /tx\.insert\(assignmentSnapshot\)/);
});

test('published snapshots remain isolated from later activity writes', () => {
  const snapshot = read('src/assignments/snapshot.ts');
  const publicSource = read('src/assignments/public.ts');
  assert.match(snapshot, /buildAssignmentSnapshot/);
  assert.match(publicSource, /snapshot: buildPublicAssignmentSnapshotSummary/);
  assert.doesNotMatch(
    publicSource.slice(
      publicSource.indexOf('export type PublicAssignmentPayload'),
      publicSource.indexOf('export type PublicAssignmentUnavailableReason')
    ),
    /teacherOwnerId|sourceActivityRevision|sourceActivityId/
  );
});

test('authoring publish aggregate hides private workflow data', () => {
  const privacy = buildActivityAuthoringPublishContinuityChainView().privacy;
  assert.equal(privacy.usesAtomicLifecycleMutations, true);
  assert.equal(privacy.usesGuardedDerivativeWrites, true);
  assert.equal(privacy.usesGuardedPublishWrites, true);
  assert.equal(privacy.preservesExistingAssignmentSnapshots, true);
  for (const [key, value] of Object.entries(privacy))
    if (key.startsWith('exposes') || key.startsWith('creates'))
      assert.equal(value, false, key);
});

test('product and catalog register activity authoring publish continuity', () => {
  assert.match(
    read('docs/product.md'),
    /activity authoring-to-publish continuity chain[\s\S]*30[\s\S]*library[\s\S]*archive[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-authoring-publish-continuity-chain-handoff\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
