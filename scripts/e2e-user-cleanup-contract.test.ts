import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const ROUTE_SOURCE = readFileSync('src/routes/api/e2e/users.ts', 'utf8');

test('E2E cleanup removes source-material owners before file metadata', () => {
  const activityDelete = ROUTE_SOURCE.indexOf('.delete(activity)');
  const userFileDelete = ROUTE_SOURCE.indexOf('.delete(userFiles)');
  const userDelete = ROUTE_SOURCE.indexOf('.delete(user)');

  assert.ok(activityDelete >= 0, 'activity cleanup must be explicit');
  assert.ok(
    userFileDelete > activityDelete,
    'activities and their cascaded snapshots must be removed before user files'
  );
  assert.ok(
    userDelete > userFileDelete,
    'test users must remain present until guarded file metadata is removed'
  );
});

test('E2E classroom cleanup stays scoped to selected test users', () => {
  assert.match(
    ROUTE_SOURCE,
    /\.delete\(activity\)\.where\(inArray\(activity\.ownerId, userIds\)\)/
  );
  assert.match(
    ROUTE_SOURCE,
    /\.delete\(userFiles\)\.where\(inArray\(userFiles\.userId, userIds\)\)/
  );
});
