import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES,
  SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES,
  buildSourceMaterialIntegrityContinuityChainView,
} from '@/activities/source-material-integrity-continuity-chain';
import { SOURCE_MATERIAL_INTEGRITY_STAGES } from '@/activities/source-material-integrity';

const read = (path: string) => readFileSync(path, 'utf8');
test('source material integrity continuity carries 30 aligned stages', () => {
  const view = buildSourceMaterialIntegrityContinuityChainView();
  assert.equal(SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.deepEqual(
    SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES,
    SOURCE_MATERIAL_INTEGRITY_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    SOURCE_MATERIAL_INTEGRITY_STAGES.map((stage) => stage.id)
  );
});
test('source material integrity continuity keeps a real 30-file boundary', () => {
  const view = buildSourceMaterialIntegrityContinuityChainView();
  assert.equal(
    SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.chainSourceFileCount, 30);
});
test('migration guards activity snapshot and file metadata races', () => {
  const migration = read(
    'src/db/migrations/0014_source_material_integrity_guard.sql'
  );
  assert.equal((migration.match(/CREATE TRIGGER/g) ?? []).length, 6);
  assert.match(migration, /BEFORE INSERT ON `activity`/);
  assert.match(
    migration,
    /BEFORE UPDATE OF `owner_id`, `content_json` ON `activity`/
  );
  assert.match(migration, /BEFORE INSERT ON `assignment_snapshot`/);
  assert.match(
    migration,
    /BEFORE UPDATE OF `assignment_id`, `content_json` ON `assignment_snapshot`/
  );
  assert.match(migration, /BEFORE DELETE ON `user_files`/);
});
test('activity and assignment writes map integrity trigger errors', () => {
  assert.match(
    read('src/api/activities.ts'),
    /rethrowSourceMaterialIntegrityError/
  );
  assert.match(
    read('src/api/assignments.ts'),
    /rethrowAssignmentPublishSourceWriteError/
  );
  const source = read('src/activities/source-material-integrity.ts');
  assert.match(source, /getErrorTextChain/);
  assert.match(source, /activity_api_error_source_material_not_found/);
  assert.match(source, /user_files_api_error_file_in_use/);
});
test('file deletion claims metadata before R2 and recovers failures', () => {
  const api = read('src/api/user-files.ts');
  const handler = api.slice(
    api.indexOf('export const deleteUserFile'),
    api.indexOf('const uploadSchema')
  );
  const claim = handler.indexOf('.delete(userFiles)');
  const storage = handler.indexOf('deleteFile(deletedRow.r2Key)');
  const recovery = handler.indexOf('recoverUserFileDeleteAfterStorageFailure');
  assert.ok(claim >= 0 && storage > claim && recovery > storage);
  assert.match(handler, /getFileInfo/);
  assert.match(handler, /insert\(userFiles\)\.values\(deletedRow\)/);
});
test('recovery distinguishes absent restored and unconfirmed objects', () => {
  const source = read('src/activities/source-material-integrity.ts');
  assert.match(source, /if \(!object\) return 'already-deleted'/);
  assert.match(source, /await restoreMetadata\(\)[\s\S]*return 'restored'/);
  assert.match(source, /return 'unconfirmed'/);
});
test('source material integrity continuity hides private data', () => {
  const privacy = buildSourceMaterialIntegrityContinuityChainView().privacy;
  assert.equal(privacy.usesDatabaseWriteGuards, true);
  assert.equal(privacy.usesGuardedMetadataClaim, true);
  assert.equal(privacy.usesStoragePresenceRecovery, true);
  assert.equal(privacy.preservesSingleWriterOrdering, true);
  for (const [key, value] of Object.entries(privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});
test('product and catalog register source material integrity continuity', () => {
  assert.match(
    read('docs/product.md'),
    /source-material integrity continuity chain[\s\S]*30[\s\S]*trigger[\s\S]*metadata[\s\S]*R2[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /source-material-integrity-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
