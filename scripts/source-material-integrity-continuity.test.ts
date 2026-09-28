import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');
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
test('product and catalog register source material integrity continuity', () => {
  assert.match(
    read('docs/product.md'),
    /source-material integrity continuity gate[\s\S]*trigger[\s\S]*metadata[\s\S]*R2[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /source-material-integrity-continuity\.test\.ts[\s\S]*source guards/i
  );
});
