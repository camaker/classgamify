import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES,
  SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_STAGES,
  buildSourceMaterialLifecycleContinuityChainView,
} from '@/activities/source-material-lifecycle-continuity-chain';

const read = (path: string) => readFileSync(path, 'utf8');

test('source material lifecycle continuity carries 30 unique stages', () => {
  const view = buildSourceMaterialLifecycleContinuityChainView();
  assert.equal(SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.equal(
    new Set(
      SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_STAGES.map((stage) => stage.id)
    ).size,
    30
  );
  assert.deepEqual(view.sourceContracts, {
    deleteContinuity: 30,
    integrityContinuity: 30,
    privacy: 30,
    publishContinuity: 30,
    uploadTransaction: 30,
    writeContinuity: 30,
  });
});

test('source material lifecycle continuity keeps a real 30-file boundary', () => {
  const view = buildSourceMaterialLifecycleContinuityChainView();
  assert.equal(
    SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.sourceFileCount, 30);
});

test('private upload precedes safe compact reference resolution', () => {
  const upload = read('src/api/user-files.ts');
  const references = read('src/activities/material-references.ts');
  assert.match(upload, /file: buildUserFileClientItem/);
  assert.match(references, /normalizeActivityMaterialReferences/);
  assert.match(references, /ACTIVITY_SOURCE_MATERIALS_MAX_COUNT/);
  assert.match(references, /normalizeActivityMaterialReferenceFilename/);
});

test('activity and publish writes preserve source revision integrity', () => {
  const activities = read('src/api/activities.ts');
  const assignments = read('src/api/assignments.ts');
  assert.match(activities, /validateActivitySourceMaterialWrite/);
  assert.match(activities, /rethrowSourceMaterialIntegrityError/);
  assert.match(assignments, /rethrowAssignmentPublishSourceWriteError/);
  assert.match(assignments, /assignmentSnapshot/);
});

test('D1 triggers protect activity snapshot and deletion races', () => {
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
  assert.match(migration, /BEFORE DELETE ON `user_files`/);
});

test('metadata claims and R2 recovery retain referenced materials', () => {
  const api = read('src/api/user-files.ts');
  const handler = api.slice(
    api.indexOf('export const deleteUserFile'),
    api.indexOf('const uploadSchema')
  );
  const claim = handler.indexOf('.delete(userFiles)');
  const storageDelete = handler.indexOf('deleteFile(deletedRow.r2Key)');
  const recovery = handler.indexOf('recoverUserFileDeleteAfterStorageFailure');
  assert.ok(claim >= 0 && storageDelete > claim && recovery > storageDelete);
  assert.match(handler, /getFileInfo/);
  assert.match(handler, /insert\(userFiles\)\.values\(deletedRow\)/);
});

test('public payload and aggregate lifecycle hide private material data', () => {
  const publicSource = read('src/assignments/public.ts');
  const payloadType = publicSource.slice(
    publicSource.indexOf('export type PublicAssignmentPayload'),
    publicSource.indexOf('export type PublicAssignmentUnavailableReason')
  );
  assert.doesNotMatch(
    payloadType,
    /sourceMaterials|r2Key|storageKey|fileId|originalName|fileList/
  );
  const privacy = buildSourceMaterialLifecycleContinuityChainView().privacy;
  assert.equal(privacy.usesDatabaseIntegrityGuards, true);
  assert.equal(privacy.usesFrozenSnapshotReferences, true);
  assert.equal(privacy.usesGuardedMetadataClaims, true);
  for (const [key, value] of Object.entries(privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});

test('product and catalog register source material lifecycle continuity', () => {
  assert.match(
    read('docs/product.md'),
    /source-material lifecycle continuity chain[\s\S]*30[\s\S]*upload[\s\S]*snapshot[\s\S]*deletion[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /source-material-lifecycle-continuity-chain-handoff\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
