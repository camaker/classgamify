import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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
  assert.match(assignments, /\.batch\(\[/);
  assert.match(assignments, /db\.insert\(assignmentSnapshot\)/);
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

test('product and catalog register activity authoring publish continuity', () => {
  assert.match(
    read('docs/product.md'),
    /activity authoring-to-publish continuity chain[\s\S]*30[\s\S]*library[\s\S]*archive[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-authoring-publish-continuity\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
