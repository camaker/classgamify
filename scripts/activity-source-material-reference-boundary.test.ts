import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT,
  buildActivityMaterialReferenceFromUserFile,
  getActivityMaterialReferenceKey,
  normalizeActivityMaterialReferenceFileId,
  normalizeActivityMaterialReferenceFilename,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';

const MATERIAL_REFERENCES_SOURCE = readFileSync(
  'src/activities/material-references.ts',
  'utf8'
);
const VALIDATION_SOURCE = readFileSync('src/activities/validation.ts', 'utf8');
const STORAGE_DOCS_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const SECRET_BYTES = 'SECRET_FILE_BYTES';
const SECRET_OWNER = 'teacher-owner-secret';
const SECRET_PERMISSION = 'signed-url-permission-secret';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private/unit.pdf';
const SECRET_STUDENT_PAYLOAD = 'SECRET_STUDENT_PAYLOAD_FILE_LIST';

test('activity source material reference boundary exposes 30 safe reference slices', () => {
  assert.equal(ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS.length, 30);
  assert.equal(new Set(ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS).size, 30);
  assert.deepEqual(ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS, {
    fileIdMaxLength: 120,
    originalNameMaxLength: 200,
  });
  assert.deepEqual(ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT, {
    exposesFileBytes: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    itemIds: [...ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS],
    keepsOnlyCompactReferenceShape: true,
    maxReferences: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
    normalizesSafeFilenameBasenames: true,
    rejectsUnsafeFileIds: true,
    scope: 'activity-source-material-reference-boundary',
  });
});

test('activity source material references build compact provenance from user files', () => {
  const reference = buildActivityMaterialReferenceFromUserFile({
    contentType: 'Audio/MPEG; charset=binary',
    filename: 'fallback.mp3',
    id: ' File １ ',
    originalName:
      'https://files.example.test/class/private/unit%20listening.mp3?token=secret#page=2',
    size: 2048.9,
  });

  assert.deepEqual(reference, {
    contentType: 'audio/mpeg',
    fileId: 'File 1',
    kind: 'audio',
    originalName: 'unit listening.mp3',
    size: 2048,
  });
  assert.deepEqual(Object.keys(reference ?? {}).sort(), [
    'contentType',
    'fileId',
    'kind',
    'originalName',
    'size',
  ]);
  assert.equal(
    JSON.stringify(reference).includes('https://files.example.test'),
    false
  );
  assert.equal(JSON.stringify(reference).includes('token=secret'), false);
});

test('activity source material references reject unsafe file ids before persistence', () => {
  for (const unsafeFileId of [
    'https://files.example.test/private/file-id',
    'userfiles/teacher/private-file-id',
    'file-id?token=secret',
    'file-id#signed',
    'storageKey=userfiles/private/unit.pdf',
    'token:secret',
    `file${String.fromCharCode(1)}id`,
  ]) {
    assert.equal(
      normalizeActivityMaterialReferenceFileId(unsafeFileId),
      undefined,
      `Expected unsafe file id to be rejected: ${unsafeFileId}`
    );
    assert.equal(
      buildActivityMaterialReferenceFromUserFile({
        id: unsafeFileId,
        originalName: 'worksheet.pdf',
      }),
      null,
      `Expected unsafe user file id to block reference creation: ${unsafeFileId}`
    );
  }

  assert.equal(normalizeActivityMaterialReferenceFileId(' File １ '), 'File 1');
  assert.equal(
    normalizeActivityMaterialReferenceFileId('  '.repeat(80)),
    undefined
  );
});

test('activity source material filenames keep safe basenames and omit secrets', () => {
  assert.equal(
    normalizeActivityMaterialReferenceFilename(
      'C:\\class\\private\\worksheet scan.pdf?signature=abc'
    ),
    'worksheet scan.pdf'
  );
  assert.equal(
    normalizeActivityMaterialReferenceFilename(
      'https:%2F%2Ffiles.example.test%2Fteacher%2Fprivate%2Fencoded%20unit.pdf%3Ftoken%3Dsecret%26signature%3Dabc'
    ),
    'encoded unit.pdf'
  );
  assert.equal(
    normalizeActivityMaterialReferenceFilename(
      'worksheet%20scan.pdf%20storageKey%3Dclassroom%2Fprivate%2Fscan.pdf%20token%3Asecret'
    ),
    'worksheet scan.pdf'
  );
  assert.equal(
    normalizeActivityMaterialReferenceFilename(
      'worksheet.pdf storageKey=classroom/private/unit.pdf token:secret permission=owner'
    ),
    'worksheet.pdf'
  );
  assert.equal(
    normalizeActivityMaterialReferenceFilename('token=secret storageKey=r2Key'),
    undefined
  );
});

test('activity source material normalization dedupes, limits, orders, and compacts references', () => {
  const normalized = normalizeActivityMaterialReferences([
    null,
    {
      bytes: SECRET_BYTES,
      contentType: 'application/pdf; charset=utf-8',
      fileId: ' Worksheet １ ',
      kind: 'not-a-kind',
      originalName:
        'worksheet.pdf storageKey=userfiles/teacher/private.pdf token:secret',
      ownerId: SECRET_OWNER,
      permission: SECRET_PERMISSION,
      r2Key: SECRET_STORAGE_KEY,
      size: 120.7,
      storageKey: SECRET_STORAGE_KEY,
      studentPayload: SECRET_STUDENT_PAYLOAD,
    },
    {
      contentType: 'audio/mpeg',
      fileId: 'worksheet 1',
      kind: 'audio',
      originalName: 'duplicate.mp3',
      size: 1000,
    },
    {
      contentType: '',
      fileId: 'Spreadsheet-1',
      kind: 'spreadsheet',
      originalName: 'scores.xlsx',
      size: -20,
    },
    {
      contentType: 'application/octet-stream',
      fileId: 'Unknown-1',
      kind: 'unknown',
      originalName: 'mystery.resource',
      size: Number.POSITIVE_INFINITY,
    },
  ]);

  assert.deepEqual(normalized, [
    {
      contentType: 'application/pdf',
      fileId: 'Worksheet 1',
      kind: 'worksheet-document',
      originalName: 'worksheet.pdf',
      size: 120,
    },
    {
      fileId: 'Spreadsheet-1',
      kind: 'spreadsheet',
      originalName: 'scores.xlsx',
      size: 0,
    },
    {
      contentType: 'application/octet-stream',
      fileId: 'Unknown-1',
      kind: 'file',
      originalName: 'mystery.resource',
    },
  ]);
  assert.equal(
    JSON.stringify(normalized).includes(SECRET_BYTES) ||
      JSON.stringify(normalized).includes(SECRET_OWNER) ||
      JSON.stringify(normalized).includes(SECRET_PERMISSION) ||
      JSON.stringify(normalized).includes(SECRET_STORAGE_KEY) ||
      JSON.stringify(normalized).includes(SECRET_STUDENT_PAYLOAD),
    false
  );
});

test('activity source material normalization preserves first 12 safe references only', () => {
  const normalized = normalizeActivityMaterialReferences(
    Array.from({ length: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT + 3 }, (_, i) => ({
      contentType: 'image/png',
      fileId: `image-${i + 1}`,
      originalName: `scan-${i + 1}.png`,
      size: i + 1,
    }))
  );

  assert.equal(normalized.length, ACTIVITY_SOURCE_MATERIALS_MAX_COUNT);
  assert.deepEqual(
    normalized.map((material) => material.fileId),
    Array.from(
      { length: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT },
      (_, i) => `image-${i + 1}`
    )
  );
  assert.equal(
    normalized.every((material) => material.kind === 'worksheet-image'),
    true
  );
});

test('activity source material reference boundary stays wired into creation validation and docs', () => {
  assert.match(
    VALIDATION_SOURCE,
    /sourceMaterials:\s*normalizeActivityMaterialReferences\(input\.sourceMaterials\)/
  );
  assert.match(
    MATERIAL_REFERENCES_SOURCE,
    /export const ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS = \[/
  );
  assert.match(
    STORAGE_DOCS_SOURCE,
    /activity source-material reference boundary/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /scripts\/activity-source-material-reference-boundary\.test\.ts/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /compact ActivityContent\.sourceMaterials references[\s\S]*safe filename basenames/
  );
  assert.equal(getActivityMaterialReferenceKey(' File １ '), 'file 1');
  assert.equal(getActivityMaterialReferenceKey('\u00A0　\t'), undefined);
});
