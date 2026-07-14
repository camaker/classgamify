import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { getArchivedActivityDerivationError } from '@/activities/lifecycle';
import {
  ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER,
  ASSIGNMENT_PUBLISH_SOURCE_OWNER_MISMATCH_MARKER,
  ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES,
  getAssignmentPublishSourceWriteErrorMessage,
  rethrowAssignmentPublishSourceWriteError,
} from '@/assignments/publish-source-write';
import { m } from '@/locale/paraglide/messages';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const MIGRATION_SOURCE = readFileSync(
  'src/db/migrations/0012_assignment_publish_source_guard.sql',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('publish source write guard exposes 30 stable stages', () => {
  assert.equal(ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES.length, 30);
  assert.equal(
    new Set(
      ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES.map((stage) => stage.id)
    ).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    database: 8,
    domain: 8,
    privacy: 4,
    server: 10,
  });
});

test('database owner guard rejects a mismatched assignment owner', () => {
  const db = createPublishSourceGuardDatabase();
  try {
    insertActivity(db, {
      id: 'activity-owned-by-a',
      ownerId: 'teacher-a',
      visibility: 'private',
    });

    const error = captureAssignmentInsertError(db, {
      activityId: 'activity-owned-by-a',
      id: 'assignment-wrong-owner',
      ownerId: 'teacher-b',
    });
    assert.match(
      getErrorText(error),
      new RegExp(ASSIGNMENT_PUBLISH_SOURCE_OWNER_MISMATCH_MARKER)
    );
    assert.equal(countRows(db, 'assignment'), 0);
  } finally {
    db.close();
  }
});

test('database archive guard closes the read-to-write publish race', () => {
  const db = createPublishSourceGuardDatabase();
  try {
    insertActivity(db, {
      id: 'activity-archive-race',
      ownerId: 'teacher-a',
      visibility: 'private',
    });
    db.prepare('UPDATE activity SET visibility = ? WHERE id = ?').run(
      'archived',
      'activity-archive-race'
    );

    const error = captureAssignmentInsertError(db, {
      activityId: 'activity-archive-race',
      id: 'assignment-archive-race',
      ownerId: 'teacher-a',
    });
    assert.match(
      getErrorText(error),
      new RegExp(ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER)
    );
    assert.equal(countRows(db, 'assignment'), 0);
  } finally {
    db.close();
  }
});

test('owner mismatch takes privacy-safe priority over archived state', () => {
  const db = createPublishSourceGuardDatabase();
  try {
    insertActivity(db, {
      id: 'activity-archived-other-owner',
      ownerId: 'teacher-a',
      visibility: 'archived',
    });

    const error = captureAssignmentInsertError(db, {
      activityId: 'activity-archived-other-owner',
      id: 'assignment-archived-other-owner',
      ownerId: 'teacher-b',
    });
    assert.match(
      getErrorText(error),
      new RegExp(ASSIGNMENT_PUBLISH_SOURCE_OWNER_MISMATCH_MARKER)
    );
    assert.doesNotMatch(
      getErrorText(error),
      new RegExp(ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER)
    );
  } finally {
    db.close();
  }
});

test('all active activity visibilities remain publishable', () => {
  const db = createPublishSourceGuardDatabase();
  try {
    for (const visibility of ['draft', 'private', 'public', 'unlisted']) {
      const activityId = `activity-${visibility}`;
      insertActivity(db, {
        id: activityId,
        ownerId: 'teacher-a',
        visibility,
      });
      insertAssignment(db, {
        activityId,
        id: `assignment-${visibility}`,
        ownerId: 'teacher-a',
      });
    }

    assert.equal(countRows(db, 'assignment'), 4);
  } finally {
    db.close();
  }
});

test('trigger abort rolls back assignment and snapshot together', () => {
  const db = createPublishSourceGuardDatabase();
  try {
    insertActivity(db, {
      id: 'activity-transaction-race',
      ownerId: 'teacher-a',
      visibility: 'archived',
    });

    assert.throws(
      () =>
        publishInTransaction(db, {
          activityId: 'activity-transaction-race',
          assignmentId: 'assignment-transaction-race',
          ownerId: 'teacher-a',
        }),
      new RegExp(ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER)
    );
    assert.equal(countRows(db, 'assignment'), 0);
    assert.equal(countRows(db, 'assignment_snapshot'), 0);
  } finally {
    db.close();
  }
});

test('later source archival preserves existing assignment snapshots', () => {
  const db = createPublishSourceGuardDatabase();
  try {
    insertActivity(db, {
      id: 'activity-existing-assignment',
      ownerId: 'teacher-a',
      visibility: 'private',
    });
    publishInTransaction(db, {
      activityId: 'activity-existing-assignment',
      assignmentId: 'assignment-existing',
      ownerId: 'teacher-a',
    });
    db.prepare('UPDATE activity SET visibility = ? WHERE id = ?').run(
      'archived',
      'activity-existing-assignment'
    );

    assert.equal(countRows(db, 'assignment'), 1);
    assert.equal(countRows(db, 'assignment_snapshot'), 1);
  } finally {
    db.close();
  }
});

test('nested trigger markers map to existing localized errors', () => {
  const ownerError = new Error('D1 transaction failed', {
    cause: new Error(ASSIGNMENT_PUBLISH_SOURCE_OWNER_MISMATCH_MARKER),
  });
  const archiveError = new Error('D1 transaction failed', {
    cause: new Error(ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER),
  });

  assert.equal(
    getAssignmentPublishSourceWriteErrorMessage(ownerError),
    m.assignment_api_error_activity_not_found()
  );
  assert.equal(
    getAssignmentPublishSourceWriteErrorMessage(archiveError),
    getArchivedActivityDerivationError()
  );
  assert.throws(
    () => rethrowAssignmentPublishSourceWriteError(ownerError),
    new RegExp(escapeRegExp(m.assignment_api_error_activity_not_found()))
  );
  assert.throws(
    () => rethrowAssignmentPublishSourceWriteError(archiveError),
    new RegExp(escapeRegExp(getArchivedActivityDerivationError()))
  );

  const unrelatedError = new Error('storage unavailable');
  assert.throws(
    () => rethrowAssignmentPublishSourceWriteError(unrelatedError),
    (error) => error === unrelatedError
  );
});

test('publish API orders initial checks, guarded writes, and reload', () => {
  const handlerSource = API_SOURCE.slice(
    API_SOURCE.indexOf('export const publishAssignment'),
    API_SOURCE.indexOf('export const updateAssignmentStatus')
  );
  const sourceReadIndex = handlerSource.indexOf(
    'buildActivityAssignmentSourceSelect()'
  );
  const lifecycleCheckIndex = handlerSource.indexOf(
    'assertActivityCanDeriveWork(sourceActivity.visibility)'
  );
  const transactionIndex = handlerSource.indexOf('.transaction(async (tx)');
  const assignmentInsertIndex = handlerSource.indexOf(
    'tx.insert(assignment).values'
  );
  const snapshotInsertIndex = handlerSource.indexOf(
    'tx.insert(assignmentSnapshot).values'
  );
  const errorMappingIndex = handlerSource.indexOf(
    '.catch(rethrowAssignmentPublishSourceWriteError)'
  );
  const detailReloadIndex = handlerSource.indexOf(
    'buildAssignmentDetailSelect()'
  );

  assert.ok(sourceReadIndex >= 0);
  assert.ok(lifecycleCheckIndex > sourceReadIndex);
  assert.ok(transactionIndex > lifecycleCheckIndex);
  assert.ok(assignmentInsertIndex > transactionIndex);
  assert.ok(snapshotInsertIndex > assignmentInsertIndex);
  assert.ok(errorMappingIndex > snapshotInsertIndex);
  assert.ok(detailReloadIndex > errorMappingIndex);
});

test('source guard contract is documented without marker disclosure', () => {
  assert.match(
    PRODUCT_SOURCE,
    /source-activity write guard[\s\S]*assignment insert[\s\S]*archived[\s\S]*transaction rolls back[\s\S]*activity-not-found/i
  );
  assert.match(
    DB_DOC_SOURCE,
    /Assignment publish source guard[\s\S]*0012_assignment_publish_source_guard\.sql[\s\S]*owner guard[\s\S]*differs[\s\S]*archived/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment publish source writes have a fast script-level gate via[\s\S]*assignment-publish-source-write-guard-contract\.test\.ts/
  );
  const reloadAndResponseSource = API_SOURCE.slice(
    API_SOURCE.indexOf(
      'const [row] = await db',
      API_SOURCE.indexOf('publishAssignment')
    ),
    API_SOURCE.indexOf('export const updateAssignmentStatus')
  );
  assert.doesNotMatch(
    reloadAndResponseSource,
    /classgamify_assignment_publish_source_|contentJson:|ownerId:|material/
  );
});

function createPublishSourceGuardDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE activity (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      visibility TEXT NOT NULL
    );
    CREATE TABLE assignment (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL REFERENCES activity(id),
      owner_id TEXT NOT NULL
    );
    CREATE TABLE assignment_snapshot (
      assignment_id TEXT PRIMARY KEY REFERENCES assignment(id),
      activity_title TEXT NOT NULL
    );
  `);
  db.exec(MIGRATION_SOURCE.replaceAll('--> statement-breakpoint', ''));
  return db;
}

function insertActivity(
  db: DatabaseSync,
  input: { id: string; ownerId: string; visibility: string }
) {
  db.prepare(
    'INSERT INTO activity (id, owner_id, visibility) VALUES (?, ?, ?)'
  ).run(input.id, input.ownerId, input.visibility);
}

function insertAssignment(
  db: DatabaseSync,
  input: { activityId: string; id: string; ownerId: string }
) {
  db.prepare(
    'INSERT INTO assignment (id, activity_id, owner_id) VALUES (?, ?, ?)'
  ).run(input.id, input.activityId, input.ownerId);
}

function captureAssignmentInsertError(
  db: DatabaseSync,
  input: { activityId: string; id: string; ownerId: string }
) {
  try {
    insertAssignment(db, input);
  } catch (error) {
    return error;
  }
  assert.fail('Expected assignment insertion to fail');
}

function publishInTransaction(
  db: DatabaseSync,
  input: { activityId: string; assignmentId: string; ownerId: string }
) {
  db.exec('BEGIN');
  try {
    insertAssignment(db, {
      activityId: input.activityId,
      id: input.assignmentId,
      ownerId: input.ownerId,
    });
    db.prepare(
      'INSERT INTO assignment_snapshot (assignment_id, activity_title) VALUES (?, ?)'
    ).run(input.assignmentId, 'Snapshot title');
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function countRows(db: DatabaseSync, table: string) {
  assert.match(table, /^(assignment|assignment_snapshot)$/);
  const row = db.prepare(`SELECT count(*) AS count FROM ${table}`).get() as {
    count: number;
  };
  return row.count;
}

function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
