import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES,
  buildActivitySourceMaterialFileReferenceWhere,
  buildAssignmentSnapshotSourceMaterialFileReferenceWhere,
} from '@/activities/source-material-delete';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

const API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');
const QUERY_SOURCE = readFileSync(
  'src/activities/source-material-delete.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
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

test('source-material deletion exposes 30 stable stages', () => {
  assert.equal(ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES.length, 30);
  assert.equal(
    new Set(ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES.map((stage) => stage.id))
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

test('activity reference query binds owner and compact file id', () => {
  const query = compileActivityReferenceWhere();
  assert.match(query.sql, /"activity"\."owner_id" = \?/);
  assert.match(
    query.sql,
    /json_each\("activity"\."content_json", '\$\.sourceMaterials'\)/
  );
  assert.match(query.sql, /json_extract\(material\.value, '\$\.fileId'\) = \?/);
  assert.deepEqual(query.params, ['teacher-1', 'file-target']);
});

test('active and archived owner activities both retain referenced files', () => {
  const db = createReferenceDatabase();
  try {
    insertActivity(db, {
      fileId: 'file-target',
      id: 'activity-active',
      ownerId: 'teacher-1',
      visibility: 'private',
    });
    insertActivity(db, {
      fileId: 'file-target',
      id: 'activity-archived',
      ownerId: 'teacher-1',
      visibility: 'archived',
    });
    insertActivity(db, {
      fileId: 'file-target',
      id: 'activity-other-owner',
      ownerId: 'teacher-2',
      visibility: 'private',
    });

    assert.deepEqual(readActivityReferenceIds(db), [
      'activity-active',
      'activity-archived',
    ]);
  } finally {
    db.close();
  }
});

test('activity query ignores unrelated, absent, and other-owner references', () => {
  const db = createReferenceDatabase();
  try {
    insertActivity(db, {
      fileId: 'file-other',
      id: 'activity-unrelated',
      ownerId: 'teacher-1',
      visibility: 'private',
    });
    insertActivity(db, {
      id: 'activity-no-materials',
      ownerId: 'teacher-1',
      visibility: 'draft',
    });
    insertActivity(db, {
      fileId: 'file-target',
      id: 'activity-other-owner',
      ownerId: 'teacher-2',
      visibility: 'private',
    });

    assert.deepEqual(readActivityReferenceIds(db), []);
  } finally {
    db.close();
  }
});

test('frozen assignment snapshots retain referenced files by assignment owner', () => {
  const db = createReferenceDatabase();
  try {
    insertSnapshot(db, {
      assignmentId: 'assignment-owner',
      fileId: 'file-target',
      ownerId: 'teacher-1',
    });
    insertSnapshot(db, {
      assignmentId: 'assignment-other-owner',
      fileId: 'file-target',
      ownerId: 'teacher-2',
    });
    insertSnapshot(db, {
      assignmentId: 'assignment-unrelated',
      fileId: 'file-other',
      ownerId: 'teacher-1',
    });

    assert.deepEqual(readSnapshotReferenceIds(db), ['assignment-owner']);
  } finally {
    db.close();
  }
});

test('snapshot query compiles owner, join-scope, and JSON reference predicates', () => {
  const query = compileSnapshotReferenceWhere();
  assert.match(query.sql, /"assignment"\."owner_id" = \?/);
  assert.match(
    query.sql,
    /json_each\("assignment_snapshot"\."content_json", '\$\.sourceMaterials'\)/
  );
  assert.deepEqual(query.params, ['teacher-1', 'file-target']);
});

test('delete API blocks references before claiming metadata or touching R2', () => {
  const handler = getSourceSlice(
    API_SOURCE,
    'export const deleteUserFile',
    'const uploadSchema'
  );
  const fileReadIndex = handler.indexOf('buildUserFileDetailOwnerWhere');
  const referenceCheckIndex = handler.indexOf(
    'const [activityReferences, snapshotReferences] = await Promise.all'
  );
  const inUseIndex = handler.indexOf('user_files_api_error_file_in_use');
  const storageDeleteIndex = handler.indexOf('deleteFile(deletedRow.r2Key)');
  const metadataDeleteIndex = handler.indexOf('.delete(userFiles)');

  assert.ok(fileReadIndex >= 0);
  assert.ok(referenceCheckIndex > fileReadIndex);
  assert.ok(inUseIndex > referenceCheckIndex);
  assert.ok(metadataDeleteIndex > inUseIndex);
  assert.ok(storageDeleteIndex > metadataDeleteIndex);
  assert.match(
    handler,
    /select\(\{ id: activity\.id \}\)[\s\S]*select\(\{ assignmentId: assignmentSnapshot\.assignmentId \}\)/
  );
});

test('in-use error is localized without revealing referencing records', () => {
  assert.match(
    EN_MESSAGES_SOURCE,
    /"user_files_api_error_file_in_use": "This source material is still used by a saved activity or assignment snapshot and cannot be deleted\."/
  );
  assert.match(
    ZH_MESSAGES_SOURCE,
    /"user_files_api_error_file_in_use": "这份来源素材仍被已保存活动或作业快照使用，无法删除。"/
  );
  const handler = getSourceSlice(
    API_SOURCE,
    'export const deleteUserFile',
    'const uploadSchema'
  );
  assert.doesNotMatch(
    handler,
    /activityReferences\[0\]|snapshotReferences\[0\]|contentJson:|studentName|answersJson/
  );
});

test('reference query module reads JSON only as minimal existence evidence', () => {
  assert.match(
    QUERY_SOURCE,
    /buildActivitySourceMaterialFileReferenceWhere[\s\S]*activity\.ownerId[\s\S]*json_each[\s\S]*buildAssignmentSnapshotSourceMaterialFileReferenceWhere[\s\S]*assignment\.ownerId[\s\S]*json_each/
  );
  assert.doesNotMatch(
    QUERY_SOURCE,
    /studentName|anonymousToken|answersJson|resultJson|r2Key|originalName/
  );
  assert.doesNotMatch(
    JSON.stringify(ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES),
    /teacher-1|file-target|activity-active/
  );
});

test('source-material deletion guard is documented across product and storage', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Source-material deletion[\s\S]*saved activity\s+content and frozen assignment snapshots[\s\S]*block deletion before\s+R2 is touched[\s\S]*snapshot provenance remains retained and\s+continues to block deletion/
  );
  assert.match(
    DB_DOC_SOURCE,
    /Source-material deletion reference guard[\s\S]*json_each[\s\S]*active and archived[\s\S]*joins `assignment`[\s\S]*blocks both R2/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Source-material deletion has a fast script-level gate via[\s\S]*activity-source-material-delete-contract\.test\.ts/
  );
  assert.match(STORAGE_DOC_SOURCE, /deleteUserFile/);
});

function compileActivityReferenceWhere() {
  return DIALECT.sqlToQuery(
    buildActivitySourceMaterialFileReferenceWhere({
      fileId: 'file-target',
      userId: 'teacher-1',
    })
  );
}

function compileSnapshotReferenceWhere() {
  return DIALECT.sqlToQuery(
    buildAssignmentSnapshotSourceMaterialFileReferenceWhere({
      fileId: 'file-target',
      userId: 'teacher-1',
    })
  );
}

function createReferenceDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE activity (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      visibility TEXT NOT NULL,
      content_json TEXT NOT NULL
    );
    CREATE TABLE assignment (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL
    );
    CREATE TABLE assignment_snapshot (
      assignment_id TEXT PRIMARY KEY,
      content_json TEXT NOT NULL
    );
  `);
  return db;
}

function insertActivity(
  db: DatabaseSync,
  input: {
    fileId?: string;
    id: string;
    ownerId: string;
    visibility: string;
  }
) {
  db.prepare(
    'INSERT INTO activity (id, owner_id, visibility, content_json) VALUES (?, ?, ?, ?)'
  ).run(
    input.id,
    input.ownerId,
    input.visibility,
    JSON.stringify(contentWithFile(input.fileId))
  );
}

function insertSnapshot(
  db: DatabaseSync,
  input: { assignmentId: string; fileId: string; ownerId: string }
) {
  db.prepare('INSERT INTO assignment (id, owner_id) VALUES (?, ?)').run(
    input.assignmentId,
    input.ownerId
  );
  db.prepare(
    'INSERT INTO assignment_snapshot (assignment_id, content_json) VALUES (?, ?)'
  ).run(input.assignmentId, JSON.stringify(contentWithFile(input.fileId)));
}

function readActivityReferenceIds(db: DatabaseSync) {
  const query = compileActivityReferenceWhere();
  const rows = db
    .prepare(`SELECT id FROM activity WHERE ${query.sql} ORDER BY id`)
    .all(...query.params) as { id: string }[];
  return rows.map((row) => row.id);
}

function readSnapshotReferenceIds(db: DatabaseSync) {
  const query = compileSnapshotReferenceWhere();
  const rows = db
    .prepare(
      `SELECT assignment_snapshot.assignment_id
       FROM assignment_snapshot
       INNER JOIN assignment
         ON assignment_snapshot.assignment_id = assignment.id
       WHERE ${query.sql}
       ORDER BY assignment_snapshot.assignment_id`
    )
    .all(...query.params) as { assignment_id: string }[];
  return rows.map((row) => row.assignment_id);
}

function contentWithFile(fileId?: string) {
  return {
    sourceMaterials: fileId
      ? [{ fileId, kind: 'worksheet-document', originalName: 'Sheet.pdf' }]
      : [],
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
      ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
