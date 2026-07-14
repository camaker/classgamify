import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER,
  ASSIGNMENT_SNAPSHOT_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER,
  getSourceMaterialIntegrityErrorMessage,
  recoverUserFileDeleteAfterStorageFailure,
  SOURCE_MATERIAL_INTEGRITY_STAGES,
  USER_FILE_SOURCE_MATERIAL_IN_USE_MARKER,
} from '@/activities/source-material-integrity';
import { m } from '@/locale/paraglide/messages';

const MIGRATION_SOURCE = readFileSync(
  'src/db/migrations/0014_source_material_integrity_guard.sql',
  'utf8'
);
const ACTIVITIES_API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const USER_FILES_API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');
const PUBLISH_GUARD_SOURCE = readFileSync(
  'src/assignments/publish-source-write.ts',
  'utf8'
);
const DERIVATIVE_GUARD_SOURCE = readFileSync(
  'src/activities/derivative-source-write.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('source-material integrity exposes 30 stable stages', () => {
  assert.equal(SOURCE_MATERIAL_INTEGRITY_STAGES.length, 30);
  assert.equal(
    new Set(SOURCE_MATERIAL_INTEGRITY_STAGES.map((stage) => stage.id)).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    database: 12,
    domain: 6,
    privacy: 4,
    server: 8,
  });
});

test('activity insert guard accepts owned files and rejects unavailable references', () => {
  const db = createIntegrityDatabase();
  try {
    insertFile(db, 'file-owned', 'teacher-1');
    insertFile(db, 'file-other-owner', 'teacher-2');
    insertActivity(db, 'activity-valid', 'teacher-1', 'file-owned');

    assert.throws(
      () => insertActivity(db, 'activity-missing', 'teacher-1', 'file-missing'),
      new RegExp(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER)
    );
    assert.throws(
      () =>
        insertActivity(
          db,
          'activity-other-owner',
          'teacher-1',
          'file-other-owner'
        ),
      new RegExp(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER)
    );
    assert.throws(
      () => insertRawActivity(db, 'activity-malformed', 'teacher-1', [{}]),
      new RegExp(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER)
    );
  } finally {
    db.close();
  }
});

test('activity update guard rejects a stale file after initial validation', () => {
  const db = createIntegrityDatabase();
  try {
    insertFile(db, 'file-owned', 'teacher-1');
    insertActivity(db, 'activity-1', 'teacher-1', 'file-owned');

    assert.throws(
      () =>
        db
          .prepare('UPDATE activity SET content_json = ? WHERE id = ?')
          .run(contentWithFile('file-missing'), 'activity-1'),
      new RegExp(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER)
    );
    assert.equal(readActivityFileId(db, 'activity-1'), 'file-owned');
  } finally {
    db.close();
  }
});

test('snapshot insert and update guards resolve files through assignment owner', () => {
  const db = createIntegrityDatabase();
  try {
    insertFile(db, 'file-owned', 'teacher-1');
    insertFile(db, 'file-other-owner', 'teacher-2');
    insertAssignment(db, 'assignment-1', 'teacher-1');
    insertSnapshot(db, 'assignment-1', 'file-owned');

    assert.throws(
      () =>
        db
          .prepare(
            'UPDATE assignment_snapshot SET content_json = ? WHERE assignment_id = ?'
          )
          .run(contentWithFile('file-other-owner'), 'assignment-1'),
      new RegExp(ASSIGNMENT_SNAPSHOT_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER)
    );
    assert.equal(readSnapshotFileId(db, 'assignment-1'), 'file-owned');
  } finally {
    db.close();
  }
});

test('file delete guard retains active and archived activity references', () => {
  for (const visibility of ['private', 'archived']) {
    const db = createIntegrityDatabase();
    try {
      insertFile(db, 'file-owned', 'teacher-1');
      insertActivity(db, `activity-${visibility}`, 'teacher-1', 'file-owned', {
        visibility,
      });
      assert.throws(
        () => deleteFileMetadata(db, 'file-owned', 'teacher-1'),
        new RegExp(USER_FILE_SOURCE_MATERIAL_IN_USE_MARKER)
      );
      assert.equal(countFiles(db), 1);
    } finally {
      db.close();
    }
  }
});

test('file delete guard retains frozen assignment snapshot references', () => {
  const db = createIntegrityDatabase();
  try {
    insertFile(db, 'file-owned', 'teacher-1');
    insertAssignment(db, 'assignment-1', 'teacher-1');
    insertSnapshot(db, 'assignment-1', 'file-owned');

    assert.throws(
      () => deleteFileMetadata(db, 'file-owned', 'teacher-1'),
      new RegExp(USER_FILE_SOURCE_MATERIAL_IN_USE_MARKER)
    );
    assert.equal(countFiles(db), 1);
  } finally {
    db.close();
  }
});

test('teacher account deletion keeps the existing owner cascade available', () => {
  const db = createIntegrityDatabase();
  try {
    insertFile(db, 'file-owned', 'teacher-1');
    insertActivity(db, 'activity-1', 'teacher-1', 'file-owned');
    db.prepare('DELETE FROM user WHERE id = ?').run('teacher-1');

    assert.equal(countFiles(db), 0);
    assert.equal(
      (
        db.prepare('SELECT COUNT(*) AS count FROM activity').get() as {
          count: number;
        }
      ).count,
      0
    );
  } finally {
    db.close();
  }
});

test('metadata claim wins a race before a later activity write', () => {
  const db = createIntegrityDatabase();
  try {
    insertFile(db, 'file-owned', 'teacher-1');
    deleteFileMetadata(db, 'file-owned', 'teacher-1');
    assert.equal(countFiles(db), 0);
    assert.throws(
      () => insertActivity(db, 'activity-late', 'teacher-1', 'file-owned'),
      new RegExp(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER)
    );
  } finally {
    db.close();
  }
});

test('nested trigger markers map to safe localized errors across write paths', () => {
  const missingError = new Error('D1 transaction failed', {
    cause: new Error(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER),
  });
  const inUseError = new Error('D1 transaction failed', {
    cause: new Error(USER_FILE_SOURCE_MATERIAL_IN_USE_MARKER),
  });
  assert.equal(
    getSourceMaterialIntegrityErrorMessage(missingError),
    m.activity_api_error_source_material_not_found()
  );
  assert.equal(
    getSourceMaterialIntegrityErrorMessage(inUseError),
    m.user_files_api_error_file_in_use()
  );
  assert.match(
    DERIVATIVE_GUARD_SOURCE,
    /getSourceMaterialIntegrityErrorMessage\(error\)/
  );
  assert.match(
    PUBLISH_GUARD_SOURCE,
    /getSourceMaterialIntegrityErrorMessage\(error\)/
  );
});

test('storage failure recovery distinguishes absent, restored, and unknown objects', async () => {
  let restores = 0;
  assert.equal(
    await recoverUserFileDeleteAfterStorageFailure({
      probeObject: async () => null,
      restoreMetadata: async () => {
        restores += 1;
      },
    }),
    'already-deleted'
  );
  assert.equal(restores, 0);

  assert.equal(
    await recoverUserFileDeleteAfterStorageFailure({
      probeObject: async () => ({ size: 10 }),
      restoreMetadata: async () => {
        restores += 1;
      },
    }),
    'restored'
  );
  assert.equal(restores, 1);

  assert.equal(
    await recoverUserFileDeleteAfterStorageFailure({
      probeObject: async () => {
        throw new Error('R2 unavailable');
      },
      restoreMetadata: async () => {
        restores += 1;
      },
    }),
    'unconfirmed'
  );
  assert.equal(
    await recoverUserFileDeleteAfterStorageFailure({
      probeObject: async () => ({ size: 10 }),
      restoreMetadata: async () => {
        throw new Error('D1 unavailable');
      },
    }),
    'unconfirmed'
  );
});

test('API ordering and documentation preserve the guarded privacy boundary', () => {
  const deleteHandler = sourceSlice(
    USER_FILES_API_SOURCE,
    'export const deleteUserFile',
    'const uploadSchema'
  );
  assert.ok(
    deleteHandler.indexOf('.delete(userFiles)') <
      deleteHandler.indexOf('deleteFile(deletedRow.r2Key)')
  );
  assert.match(
    deleteHandler,
    /returning\(\)[\s\S]*rethrowSourceMaterialIntegrityError[\s\S]*recoverUserFileDeleteAfterStorageFailure[\s\S]*getFileInfo[\s\S]*insert\(userFiles\)\.values\(deletedRow\)/
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /createActivity[\s\S]*rethrowSourceMaterialIntegrityError[\s\S]*updateActivity[\s\S]*rethrowSourceMaterialIntegrityError/
  );
  assert.equal((MIGRATION_SOURCE.match(/CREATE TRIGGER/g) ?? []).length, 6);
  assert.match(
    PRODUCT_SOURCE,
    /Source-material reference integrity[\s\S]*file deletion race[\s\S]*claims the metadata before touching R2/
  );
  assert.match(
    DB_DOC_SOURCE,
    /0014_source_material_integrity_guard\.sql[\s\S]*six database triggers/
  );
  assert.match(
    STORAGE_DOC_SOURCE,
    /metadata delete is trigger-guarded and happens before R2 cleanup/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /source-material-integrity-guard-contract\.test\.ts/
  );
  assert.doesNotMatch(
    JSON.stringify(SOURCE_MATERIAL_INTEGRITY_STAGES),
    /file-owned|teacher-1|r2Key|studentName/
  );
});

function createIntegrityDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE user (id TEXT PRIMARY KEY);
    CREATE TABLE user_files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
    );
    CREATE TABLE activity (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      visibility TEXT NOT NULL,
      content_json TEXT NOT NULL
    );
    CREATE TABLE assignment (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
    );
    CREATE TABLE assignment_snapshot (
      assignment_id TEXT PRIMARY KEY,
      content_json TEXT NOT NULL
    );
  `);
  db.exec(MIGRATION_SOURCE.replaceAll('--> statement-breakpoint', ''));
  return db;
}

function insertFile(db: DatabaseSync, id: string, userId: string) {
  insertUser(db, userId);
  db.prepare('INSERT INTO user_files (id, user_id) VALUES (?, ?)').run(
    id,
    userId
  );
}

function insertActivity(
  db: DatabaseSync,
  id: string,
  ownerId: string,
  fileId: string,
  options: { visibility?: string } = {}
) {
  insertRawActivity(db, id, ownerId, [{ fileId }], options);
}

function insertRawActivity(
  db: DatabaseSync,
  id: string,
  ownerId: string,
  sourceMaterials: unknown[],
  options: { visibility?: string } = {}
) {
  db.prepare(
    'INSERT INTO activity (id, owner_id, visibility, content_json) VALUES (?, ?, ?, ?)'
  ).run(
    id,
    ownerId,
    options.visibility ?? 'private',
    JSON.stringify({ sourceMaterials })
  );
}

function insertAssignment(db: DatabaseSync, id: string, ownerId: string) {
  insertUser(db, ownerId);
  db.prepare('INSERT INTO assignment (id, owner_id) VALUES (?, ?)').run(
    id,
    ownerId
  );
}

function insertUser(db: DatabaseSync, id: string) {
  db.prepare('INSERT OR IGNORE INTO user (id) VALUES (?)').run(id);
}

function insertSnapshot(
  db: DatabaseSync,
  assignmentId: string,
  fileId: string
) {
  db.prepare(
    'INSERT INTO assignment_snapshot (assignment_id, content_json) VALUES (?, ?)'
  ).run(assignmentId, contentWithFile(fileId));
}

function deleteFileMetadata(db: DatabaseSync, id: string, userId: string) {
  db.prepare('DELETE FROM user_files WHERE id = ? AND user_id = ?').run(
    id,
    userId
  );
}

function countFiles(db: DatabaseSync) {
  return (
    db.prepare('SELECT COUNT(*) AS count FROM user_files').get() as {
      count: number;
    }
  ).count;
}

function readActivityFileId(db: DatabaseSync, id: string) {
  const row = db
    .prepare('SELECT content_json FROM activity WHERE id = ?')
    .get(id) as { content_json: string };
  return JSON.parse(row.content_json).sourceMaterials[0].fileId as string;
}

function readSnapshotFileId(db: DatabaseSync, assignmentId: string) {
  const row = db
    .prepare(
      'SELECT content_json FROM assignment_snapshot WHERE assignment_id = ?'
    )
    .get(assignmentId) as { content_json: string };
  return JSON.parse(row.content_json).sourceMaterials[0].fileId as string;
}

function contentWithFile(fileId: string) {
  return JSON.stringify({ sourceMaterials: [{ fileId }] });
}

function sourceSlice(source: string, start: string, end: string) {
  return source.slice(source.indexOf(start), source.indexOf(end));
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      SOURCE_MATERIAL_INTEGRITY_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
