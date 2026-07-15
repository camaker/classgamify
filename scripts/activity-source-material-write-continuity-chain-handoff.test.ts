import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES,
  ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES,
  buildActivitySourceMaterialWriteContinuityChainView,
} from '@/activities/source-material-write-continuity-chain';
import { ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES } from '@/activities/source-material-write';

const read = (path: string) => readFileSync(path, 'utf8');

test('source material write continuity carries 30 aligned stages', () => {
  const view = buildActivitySourceMaterialWriteContinuityChainView();
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES.length,
    30
  );
  assert.deepEqual(
    ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES,
    ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES.map((stage) => stage.id)
  );
});

test('source material write continuity keeps a real 30-file boundary', () => {
  const view = buildActivitySourceMaterialWriteContinuityChainView();
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('references normalize and rebuild from owned file metadata', () => {
  const source = read('src/activities/source-material-write.ts');
  assert.match(source, /normalizeActivityMaterialReferences/);
  assert.match(source, /getActivityMaterialReferenceKey/);
  assert.match(source, /buildActivityMaterialReferenceFromUserFile/);
  assert.match(source, /missingCount/);
});

test('file query is owner scoped and omits private storage columns', () => {
  const source = read('src/storage/file-query.ts');
  assert.match(source, /buildUserFileMaterialReferenceSelect/);
  assert.match(source, /buildUserFileMaterialsOwnerWhere/);
  assert.match(source, /eq\(userFiles\.userId, userId\)/);
  assert.match(source, /inArray\(userFiles\.id, fileIds\)/);
  const select = source.slice(
    source.indexOf('export function buildUserFileMaterialReferenceSelect'),
    source.indexOf('export function buildUserFileMaterialsOwnerWhere')
  );
  assert.doesNotMatch(select, /r2Key|isPublic|description|createdAt|updatedAt/);
});

test('create and update resolve materials before persistence', () => {
  const api = read('src/api/activities.ts');
  assert.match(
    api.slice(
      api.indexOf('export const createActivity'),
      api.indexOf('const duplicateActivityInputSchema')
    ),
    /validateActivitySourceMaterialWrite[\s\S]*buildActivityCreateInsert/
  );
  assert.match(
    api.slice(
      api.indexOf('export const updateActivity'),
      api.indexOf('const updateActivityVisibilityInputSchema')
    ),
    /assertActivityCanEdit[\s\S]*validateActivitySourceMaterialWrite[\s\S]*buildActivityUpdateSet[\s\S]*buildActivityMutationWhere/
  );
});

test('empty requests bypass queries and missing rows block writes', () => {
  const api = read('src/api/activities.ts').slice(
    read('src/api/activities.ts').indexOf(
      'async function validateActivitySourceMaterialWrite'
    )
  );
  assert.match(api, /if \(fileIds\.length === 0\)[\s\S]*sourceMaterials: \[\]/);
  assert.match(
    api,
    /resolution\.type === 'blocked'[\s\S]*activity_api_error_source_material_not_found/
  );
});

test('source material continuity hides private storage details', () => {
  const privacy = buildActivitySourceMaterialWriteContinuityChainView().privacy;
  assert.equal(privacy.usesAllOrNothingResolution, true);
  assert.equal(privacy.usesAuthoritativeMetadata, true);
  assert.equal(privacy.usesOwnerScopedBatchRead, true);
  assert.equal(privacy.usesSingleBatchQuery, true);
  for (const [key, value] of Object.entries(privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});

test('product and catalog register source material write continuity', () => {
  assert.match(
    read('docs/product.md'),
    /source-material write continuity chain[\s\S]*30[\s\S]*owner[\s\S]*authoritative[\s\S]*all-or-nothing[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-source-material-write-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
