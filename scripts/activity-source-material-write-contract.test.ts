import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES,
  getActivitySourceMaterialWriteFileIds,
  resolveActivitySourceMaterialWrite,
} from '@/activities/source-material-write';
import {
  buildUserFileMaterialReferenceSelect,
  buildUserFileMaterialsOwnerWhere,
} from '@/storage/file-query';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

const API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const FILE_QUERY_SOURCE = readFileSync('src/storage/file-query.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const EN_MESSAGES_SOURCE = readFileSync(
  'project.inlang/messages/en.json',
  'utf8'
);
const ZH_MESSAGES_SOURCE = readFileSync(
  'project.inlang/messages/zh.json',
  'utf8'
);
const DIALECT = new SQLiteSyncDialect();

test('activity source-material writes expose 30 stable stages', () => {
  assert.equal(ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES.length, 30);
  assert.equal(
    new Set(ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES.map((stage) => stage.id))
      .size,
    30
  );
  assert.deepEqual(countByLayer(), {
    database: 8,
    domain: 8,
    privacy: 4,
    server: 10,
  });
});

test('requested file ids normalize, deduplicate, and preserve order', () => {
  assert.deepEqual(
    getActivitySourceMaterialWriteFileIds([
      material(' File １ ', 'First.pdf'),
      material('file 2', 'Second.mp3'),
      material('file 1', 'Duplicate.pdf'),
      material('https://unsafe.example/file', 'Unsafe.pdf'),
    ]),
    ['File 1', 'file 2']
  );
});

test('owned rows replace untrusted client material metadata', () => {
  const resolution = resolveActivitySourceMaterialWrite({
    ownedFiles: [
      {
        contentType: 'audio/mpeg',
        filename: 'stored-audio.mp3',
        id: 'file-audio',
        originalName: 'Unit listening.mp3',
        size: 4096,
      },
      {
        contentType: 'application/pdf',
        filename: 'stored-sheet.pdf',
        id: 'file-sheet',
        originalName: 'C:\\private\\Worksheet.pdf?token=hidden',
        size: 2048,
      },
    ],
    value: [
      material('file-sheet', 'Forged.exe', {
        contentType: 'application/x-msdownload',
        size: 999_999,
      }),
      material('file-audio', 'Forged.txt', {
        contentType: 'text/plain',
        size: 1,
      }),
    ],
  });

  assert.deepEqual(resolution, {
    references: [
      {
        contentType: 'application/pdf',
        fileId: 'file-sheet',
        kind: 'worksheet-document',
        originalName: 'Worksheet.pdf',
        size: 2048,
      },
      {
        contentType: 'audio/mpeg',
        fileId: 'file-audio',
        kind: 'audio',
        originalName: 'Unit listening.mp3',
        size: 4096,
      },
    ],
    requestedCount: 2,
    type: 'ready',
  });
});

test('missing requested rows block the entire source-material write', () => {
  assert.deepEqual(
    resolveActivitySourceMaterialWrite({
      ownedFiles: [
        {
          contentType: 'application/pdf',
          id: 'file-owned',
          originalName: 'Owned.pdf',
          size: 100,
        },
      ],
      value: [
        material('file-owned', 'Owned.pdf'),
        material('file-missing', 'Missing.pdf'),
      ],
    }),
    {
      missingCount: 1,
      requestedCount: 2,
      type: 'blocked',
    }
  );
});

test('invalid authoritative metadata also blocks rather than trusting input', () => {
  assert.deepEqual(
    resolveActivitySourceMaterialWrite({
      ownedFiles: [
        {
          contentType: 'application/pdf',
          id: 'file-invalid-name',
          originalName: 'token=secret storageKey=r2-key',
          size: 100,
        },
      ],
      value: [material('file-invalid-name', 'Client fallback.pdf')],
    }),
    {
      missingCount: 1,
      requestedCount: 1,
      type: 'blocked',
    }
  );
});

test('compiled material query requires owner and all requested ids', () => {
  const query = DIALECT.sqlToQuery(
    buildUserFileMaterialsOwnerWhere({
      fileIds: ['file-a', 'file-b'],
      userId: 'teacher-1',
    })
  );
  assert.match(
    query.sql,
    /"user_files"\."user_id" = \? and "user_files"\."id" in \(\?, \?\)/
  );
  assert.deepEqual(query.params, ['teacher-1', 'file-a', 'file-b']);

  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE user_files (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL
      );
      INSERT INTO user_files VALUES ('file-a', 'teacher-1');
      INSERT INTO user_files VALUES ('file-b', 'teacher-2');
    `);
    const rows = db
      .prepare(`SELECT id FROM user_files WHERE ${query.sql}`)
      .all(...query.params) as { id: string }[];
    assert.deepEqual(
      rows.map((row) => row.id),
      ['file-a']
    );
  } finally {
    db.close();
  }
});

test('material write select exposes only authoritative compact metadata', () => {
  assert.deepEqual(Object.keys(buildUserFileMaterialReferenceSelect()).sort(), [
    'contentType',
    'filename',
    'id',
    'originalName',
    'size',
  ]);
  const selectSource = getSourceSlice(
    FILE_QUERY_SOURCE,
    'export function buildUserFileMaterialReferenceSelect',
    'export function buildUserFileMaterialsOwnerWhere'
  );
  assert.doesNotMatch(
    selectSource,
    /r2Key|isPublic|description|createdAt|updatedAt/
  );
});

test('create and update validate references before persistence', () => {
  const createHandler = getSourceSlice(
    API_SOURCE,
    'export const createActivity',
    'const duplicateActivityInputSchema'
  );
  const updateHandler = getSourceSlice(
    API_SOURCE,
    'export const updateActivity',
    'const updateActivityVisibilityInputSchema'
  );

  assert.match(
    createHandler,
    /validateActivitySourceMaterialWrite[\s\S]*buildActivityCreateInsert\(\{ id, input, now, userId \}\)/
  );
  assert.match(
    updateHandler,
    /assertActivityCanEdit\(existingActivity\.visibility\)[\s\S]*validateActivitySourceMaterialWrite[\s\S]*buildActivityUpdateSet\(\{ input, now: updatedAt \}\)[\s\S]*buildActivityMutationWhere/
  );
});

test('empty references bypass the user-files query', () => {
  const helperSource = API_SOURCE.slice(
    API_SOURCE.indexOf('async function validateActivitySourceMaterialWrite')
  );
  const emptyIndex = helperSource.indexOf('if (fileIds.length === 0)');
  const selectIndex = helperSource.indexOf(
    '.select(buildUserFileMaterialReferenceSelect())'
  );
  assert.ok(emptyIndex >= 0);
  assert.ok(selectIndex > emptyIndex);
  assert.match(
    helperSource,
    /if \(fileIds\.length === 0\)[\s\S]*sourceMaterials: \[\][\s\S]*buildUserFileMaterialsOwnerWhere\(\{ fileIds, userId \}\)/
  );
});

test('missing and other-owner references share localized unavailable copy', () => {
  assert.match(
    API_SOURCE,
    /resolution\.type === 'blocked'[\s\S]*activity_api_error_source_material_not_found/
  );
  assert.match(
    EN_MESSAGES_SOURCE,
    /"activity_api_error_source_material_not_found": "One or more source materials are no longer available\./
  );
  assert.match(
    ZH_MESSAGES_SOURCE,
    /"activity_api_error_source_material_not_found": "一个或多个来源素材已不可用。/
  );
});

test('source-material write validation is documented as a private boundary', () => {
  assert.match(
    PRODUCT_SOURCE,
    /create and edit writes[\s\S]*owner-scoped `userFiles` query[\s\S]*authoritative database filename[\s\S]*Empty reference lists skip the query[\s\S]*file bytes/i
  );
  assert.match(
    DB_DOC_SOURCE,
    /Activity source-material write validation[\s\S]*at most 12[\s\S]*current owner[\s\S]*omits `r2_key`[\s\S]*Every requested id/i
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity source-material writes have a fast script-level gate via[\s\S]*activity-source-material-write-contract\.test\.ts/
  );
  assert.doesNotMatch(
    JSON.stringify(ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES),
    /teacher-1|file-a|originalName|r2Key|sourceText/
  );
});

function material(
  fileId: string,
  originalName: string,
  metadata: { contentType?: string; size?: number } = {}
) {
  return {
    contentType: metadata.contentType ?? 'application/pdf',
    fileId,
    kind: 'worksheet-document',
    originalName,
    size: metadata.size ?? 100,
  };
}

function getSourceSlice(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `Missing source start: ${start}`);
  assert.notEqual(endIndex, -1, `Missing source end: ${end}`);
  return source.slice(startIndex, endIndex);
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
