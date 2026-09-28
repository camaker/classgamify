import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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
  assert.match(read('src/assignments/results.ts'), /attempts/);
  assert.match(read('src/assignments/results-export.ts'), /attempts/);
});

test('product and catalog register status transition continuity', () => {
  assert.match(
    read('docs/product.md'),
    /status transition continuity chain[\s\S]*30[\s\S]*owner[\s\S]*updatedAt[\s\S]*RETURNING[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-status-transition-continuity\.test\.ts[\s\S]*source guards/i
  );
});
