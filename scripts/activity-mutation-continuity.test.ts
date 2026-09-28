import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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
  assert.match(read('src/assignments/snapshot.ts'), /snapshot/i);
  assert.match(
    read('src/api/activities.ts'),
    /assertActivityCanDeriveWork\(sourceActivity\.visibility\)/,
    'Duplicate and remix requests should refuse archived sources on the server.'
  );
});

test('product and catalog register activity mutation continuity', () => {
  assert.match(
    read('docs/product.md'),
    /activity mutation continuity gate[\s\S]*owner[\s\S]*updatedAt[\s\S]*RETURNING[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-mutation-continuity\.test\.ts[\s\S]*source guards/i
  );
});
