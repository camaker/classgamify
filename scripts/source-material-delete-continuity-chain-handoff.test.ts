import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES,
  SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES,
  buildSourceMaterialDeleteContinuityChainView,
} from '@/activities/source-material-delete-continuity-chain';
import { ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES } from '@/activities/source-material-delete';

const read = (path: string) => readFileSync(path, 'utf8');

test('source material delete continuity carries 30 aligned stages', () => {
  const view = buildSourceMaterialDeleteContinuityChainView();
  assert.equal(SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.deepEqual(
    SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES,
    ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES.map((stage) => stage.id)
  );
});
test('source material delete continuity keeps a real 30-file boundary', () => {
  const view = buildSourceMaterialDeleteContinuityChainView();
  assert.equal(SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES.length, 30);
  assert.equal(
    new Set(SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.chainSourceFileCount, 30);
});
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
test('source material delete continuity hides private records', () => {
  const privacy = buildSourceMaterialDeleteContinuityChainView().privacy;
  assert.equal(privacy.preservesActivityContent, true);
  assert.equal(privacy.preservesSnapshotProvenance, true);
  assert.equal(privacy.usesOwnerScopedReferenceChecks, true);
  assert.equal(privacy.verifiesReferencesBeforeStorageDelete, true);
  for (const [key, value] of Object.entries(privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});
test('product and catalog register source material delete continuity', () => {
  assert.match(
    read('docs/product.md'),
    /source-material deletion continuity chain[\s\S]*30[\s\S]*active[\s\S]*archived[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /source-material-delete-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
