import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('publish API orders guarded source read D1 batch and reload', () => {
  const api = read('src/api/assignments.ts');
  const handler = api.slice(
    api.indexOf('export const publishAssignment'),
    api.indexOf('export const updateAssignmentStatus')
  );
  const sourceRead = handler.indexOf('buildActivityAssignmentSourceSelect()');
  const lifecycle = handler.indexOf('assertActivityCanDeriveWork');
  const batch = handler.indexOf('.batch([');
  const assignmentInsert = handler.indexOf('db.insert(assignment).values');
  const snapshotInsert = handler.indexOf(
    'db.insert(assignmentSnapshot).values'
  );
  const mapping = handler.indexOf(
    '.catch(rethrowAssignmentPublishSourceWriteError)'
  );
  const reload = handler.indexOf('buildAssignmentDetailSelect()');
  assert.ok(sourceRead >= 0);
  assert.ok(lifecycle > sourceRead);
  assert.ok(batch > lifecycle);
  assert.ok(assignmentInsert > batch);
  assert.ok(snapshotInsert > assignmentInsert);
  assert.ok(mapping > snapshotInsert);
  assert.ok(reload > mapping);
});

test('D1 checks source owner and archive state before assignment insert', () => {
  const migration = read(
    'src/db/migrations/0012_assignment_publish_source_guard.sql'
  );
  assert.match(migration, /BEFORE INSERT ON `assignment`/);
  assert.match(
    migration,
    /classgamify_assignment_publish_source_owner_mismatch/
  );
  assert.match(migration, /classgamify_assignment_publish_source_archived/);
  assert.match(migration, /NEW\.`activity_id`/);
  assert.match(migration, /NEW\.`owner_id`/);
  assert.match(migration, /`visibility` = 'archived'/);
});

test('source errors preserve privacy-safe localized mappings', () => {
  const source = read('src/assignments/publish-source-write.ts');
  assert.match(source, /getErrorTextChain/);
  assert.match(source, /getSourceMaterialIntegrityErrorMessage/);
  assert.match(source, /assignment_api_error_activity_not_found/);
  assert.match(source, /getArchivedActivityDerivationError/);
  assert.match(source, /throw error/);
});

test('existing assignments snapshots and results stay independent', () => {
  assert.match(read('src/assignments/snapshot.ts'), /snapshot/i);
  assert.match(read('src/assignments/results.ts'), /attempts/);
  assert.match(read('src/assignments/results-export.ts'), /attempts/);
});

test('product and catalog register publish source continuity', () => {
  assert.match(
    read('docs/product.md'),
    /publish source continuity chain[\s\S]*30[\s\S]*owner[\s\S]*BEFORE INSERT[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-publish-source-continuity\.test\.ts[\s\S]*source guards/i
  );
});
