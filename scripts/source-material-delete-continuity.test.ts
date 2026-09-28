import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');
test('activity and snapshot queries bind owner and compact file id', () => {
  const source = read('src/activities/source-material-delete.ts');
  assert.match(
    source,
    /buildActivitySourceMaterialFileReferenceWhere[\s\S]*eq\(activity\.ownerId, userId\)[\s\S]*json_each/
  );
  assert.match(
    source,
    /buildAssignmentSnapshotSourceMaterialFileReferenceWhere[\s\S]*eq\(assignment\.ownerId, userId\)[\s\S]*json_each/
  );
});
test('delete API checks references before metadata and R2 deletion', () => {
  const api = read('src/api/user-files.ts');
  const handler = api.slice(
    api.indexOf('export const deleteUserFile'),
    api.indexOf('const uploadSchema')
  );
  const fileRead = handler.indexOf('buildUserFileDetailOwnerWhere');
  const checks = handler.indexOf(
    'const [activityReferences, snapshotReferences] = await Promise.all'
  );
  const blocked = handler.indexOf('user_files_api_error_file_in_use');
  const metadata = handler.indexOf('.delete(userFiles)');
  const storage = handler.indexOf('deleteFile(deletedRow.r2Key)');
  assert.ok(
    fileRead >= 0 &&
      checks > fileRead &&
      blocked > checks &&
      metadata > blocked &&
      storage > metadata
  );
});
test('reference checks use minimal evidence and avoid student data', () => {
  const source = read('src/activities/source-material-delete.ts');
  assert.doesNotMatch(
    source,
    /studentName|anonymousToken|answersJson|resultJson|r2Key|originalName/
  );
  const api = read('src/api/user-files.ts');
  assert.match(api, /select\(\{ id: activity\.id \}\)/);
  assert.match(
    api,
    /select\(\{ assignmentId: assignmentSnapshot\.assignmentId \}\)/
  );
});
test('active archived and frozen snapshot provenance remain protected', () => {
  assert.match(
    read('docs/product.md'),
    /Active and archived[\s\S]*historical snapshot references/i
  );
  assert.match(
    read('src/assignments/snapshot.ts'),
    /contentJson: structuredClone\(sourceActivity\.contentJson\)/
  );
  assert.match(read('src/activities/lifecycle.ts'), /archived/);
});
test('product and catalog register source material delete continuity', () => {
  assert.match(
    read('docs/product.md'),
    /source-material deletion continuity gate[\s\S]*active[\s\S]*archived[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /source-material-delete-continuity\.test\.ts[\s\S]*source guards/i
  );
});
