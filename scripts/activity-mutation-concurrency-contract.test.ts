import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { buildActivityMutationWhere } from '@/activities/detail-query';
import {
  ACTIVITY_MUTATION_CONCURRENCY_STAGES,
  getActivityMutationConflictMessage,
  resolveActivityMutationUpdatedAt,
} from '@/activities/mutation-concurrency';
import { m } from '@/locale/paraglide/messages';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

overwriteGetLocale(() => 'en');

const API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const DETAIL_QUERY_SOURCE = readFileSync(
  'src/activities/detail-query.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const DIALECT = new SQLiteSyncDialect();

test('activity mutation concurrency exposes 30 stable stages', () => {
  assert.equal(ACTIVITY_MUTATION_CONCURRENCY_STAGES.length, 30);
  assert.equal(
    new Set(ACTIVITY_MUTATION_CONCURRENCY_STAGES.map((stage) => stage.id)).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    database: 8,
    domain: 8,
    privacy: 4,
    server: 10,
  });
});

test('activity mutation revisions advance monotonically', () => {
  assert.equal(
    resolveActivityMutationUpdatedAt({
      currentUpdatedAt: new Date(1_000),
      now: new Date(1_000),
    }).getTime(),
    1_001
  );
  assert.equal(
    resolveActivityMutationUpdatedAt({
      currentUpdatedAt: new Date(2_000),
      now: new Date(1_000),
    }).getTime(),
    2_001
  );
  assert.equal(
    resolveActivityMutationUpdatedAt({
      currentUpdatedAt: new Date(1_000),
      now: new Date(4_000),
    }).getTime(),
    4_000
  );
});

test('conflicts preserve specific lifecycle guidance before generic reload', () => {
  assert.equal(
    getActivityMutationConflictMessage({
      action: 'edit',
      currentVisibility: 'archived',
    }),
    m.activity_edit_access_archived_description()
  );
  assert.equal(
    getActivityMutationConflictMessage({
      action: 'archive',
      currentVisibility: 'archived',
    }),
    m.activity_lifecycle_archive_blocked()
  );
  assert.equal(
    getActivityMutationConflictMessage({
      action: 'restore',
      currentVisibility: 'draft',
    }),
    m.activity_lifecycle_restore_blocked()
  );
  assert.equal(
    getActivityMutationConflictMessage({
      action: 'edit',
      currentVisibility: 'private',
    }),
    m.activity_api_error_write_conflict()
  );
});

test('compiled compare-and-set query carries owner visibility and revision', () => {
  const query = compileMutationWhere();
  assert.match(
    query.sql,
    /"activity"\."id" = \? and "activity"\."owner_id" = \?\) and "activity"\."visibility" = \? and "activity"\."updated_at" = \?/
  );
  assert.deepEqual(query.params, [
    'activity-cas',
    'teacher-1',
    'private',
    1_000,
  ]);
});

test('a concurrent archive blocks a stale content edit', () => {
  const db = createMutationDatabase();
  try {
    insertActivity(db, {
      id: 'activity-edit-race',
      ownerId: 'teacher-1',
      title: 'Original title',
      updatedAt: 1_000,
      visibility: 'private',
    });
    executeMutation(
      db,
      { activityId: 'activity-edit-race' },
      { title: 'Original title', updatedAt: 2_000, visibility: 'archived' }
    );

    assert.equal(
      executeMutation(
        db,
        { activityId: 'activity-edit-race' },
        { title: 'Stale edited title', updatedAt: 2_001, visibility: 'private' }
      ).length,
      0
    );
    assert.deepEqual(readActivity(db, 'activity-edit-race'), {
      ownerId: 'teacher-1',
      title: 'Original title',
      updatedAt: 2_000,
      visibility: 'archived',
    });
  } finally {
    db.close();
  }
});

test('revision changes block stale lifecycle actions at the same visibility', () => {
  const db = createMutationDatabase();
  try {
    insertActivity(db, {
      id: 'activity-revision-race',
      ownerId: 'teacher-1',
      title: 'Newer title',
      updatedAt: 1_500,
      visibility: 'private',
    });

    assert.equal(
      executeMutation(
        db,
        { activityId: 'activity-revision-race' },
        { title: 'Newer title', updatedAt: 2_000, visibility: 'archived' }
      ).length,
      0
    );
    assert.equal(readActivity(db, 'activity-revision-race')?.updatedAt, 1_500);
  } finally {
    db.close();
  }
});

test('concurrent lifecycle actions cannot reuse one activity revision', () => {
  const db = createMutationDatabase();
  try {
    insertActivity(db, {
      id: 'activity-concurrent-archive',
      ownerId: 'teacher-1',
      title: 'Activity',
      updatedAt: 1_000,
      visibility: 'private',
    });
    const first = executeMutation(
      db,
      { activityId: 'activity-concurrent-archive' },
      { title: 'Activity', updatedAt: 2_000, visibility: 'archived' }
    );
    const second = executeMutation(
      db,
      { activityId: 'activity-concurrent-archive' },
      { title: 'Activity', updatedAt: 2_001, visibility: 'archived' }
    );

    assert.equal(first.length, 1);
    assert.equal(second.length, 0);
  } finally {
    db.close();
  }
});

test('activity mutation compare-and-set remains owner scoped', () => {
  const db = createMutationDatabase();
  try {
    insertActivity(db, {
      id: 'activity-owner',
      ownerId: 'teacher-2',
      title: 'Other teacher activity',
      updatedAt: 1_000,
      visibility: 'private',
    });
    assert.equal(
      executeMutation(
        db,
        { activityId: 'activity-owner' },
        {
          title: 'Changed title',
          updatedAt: 2_000,
          visibility: 'archived',
        }
      ).length,
      0
    );
  } finally {
    db.close();
  }
});

test('activity APIs use compare-and-set returning and conflict reload', () => {
  const editHandler = getSourceSlice(
    API_SOURCE,
    'export const updateActivity',
    'const updateActivityVisibilityInputSchema'
  );
  const lifecycleHandler = getSourceSlice(
    API_SOURCE,
    'async function updateActivityVisibility',
    'async function throwActivityMutationConflict'
  );
  const conflictHandler = API_SOURCE.slice(
    API_SOURCE.indexOf('async function throwActivityMutationConflict')
  );

  for (const handler of [editHandler, lifecycleHandler]) {
    assert.match(
      handler,
      /buildActivityLifecycleGateSelect[\s\S]*resolveActivityMutationUpdatedAt[\s\S]*buildActivityMutationWhere[\s\S]*returning\(buildActivityDetailSelect\(\)\)[\s\S]*throwActivityMutationConflict/
    );
  }
  assert.match(
    conflictHandler,
    /select\(buildActivityLifecycleGateSelect\(\)\)[\s\S]*buildActivityDetailOwnerWhere[\s\S]*activity_api_error_activity_not_found[\s\S]*getActivityMutationConflictMessage/
  );
  assert.match(
    DETAIL_QUERY_SOURCE,
    /buildActivityLifecycleGateSelect[\s\S]*updatedAt: activity\.updatedAt[\s\S]*buildActivityMutationWhere[\s\S]*buildActivityDetailOwnerWhere[\s\S]*eq\(activity\.visibility, currentVisibility\)[\s\S]*eq\(activity\.updatedAt, currentUpdatedAt\)/
  );
});

test('activity mutation concurrency is documented with private boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /atomic lifecycle[\s\S]*expected `updatedAt` revision[\s\S]*stale edit[\s\S]*Zero-row updates[\s\S]*assignment snapshots/
  );
  assert.match(
    DB_DOC_SOURCE,
    /Activity mutation concurrency[\s\S]*compare-and-set `UPDATE`[\s\S]*expected `updated_at` revision[\s\S]*UPDATE \.\.\. RETURNING[\s\S]*monotonically/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity mutation concurrency has a fast script-level gate via[\s\S]*activity-mutation-concurrency-contract\.test\.ts/
  );
  assert.doesNotMatch(
    JSON.stringify(ACTIVITY_MUTATION_CONCURRENCY_STAGES),
    /teacher-1|activity-cas|title|contentJson|sourceMaterials|assignmentId/
  );
});

type MutationInput = {
  activityId?: string;
  currentUpdatedAt?: Date;
  currentVisibility?: 'private';
  userId?: string;
};

function compileMutationWhere(input: MutationInput = {}) {
  return DIALECT.sqlToQuery(
    buildActivityMutationWhere({
      activityId: input.activityId ?? 'activity-cas',
      currentUpdatedAt: input.currentUpdatedAt ?? new Date(1_000),
      currentVisibility: input.currentVisibility ?? 'private',
      userId: input.userId ?? 'teacher-1',
    })
  );
}

function executeMutation(
  db: DatabaseSync,
  input: MutationInput,
  update: { title: string; updatedAt: number; visibility: string }
) {
  const where = compileMutationWhere(input);
  return db
    .prepare(
      `UPDATE activity SET title = ?, visibility = ?, updated_at = ? WHERE ${where.sql} RETURNING id`
    )
    .all(update.title, update.visibility, update.updatedAt, ...where.params);
}

function createMutationDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE activity (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      visibility TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return db;
}

function insertActivity(
  db: DatabaseSync,
  input: {
    id: string;
    ownerId: string;
    title: string;
    updatedAt: number;
    visibility: string;
  }
) {
  db.prepare(
    'INSERT INTO activity (id, owner_id, title, visibility, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(
    input.id,
    input.ownerId,
    input.title,
    input.visibility,
    input.updatedAt
  );
}

function readActivity(db: DatabaseSync, activityId: string) {
  const row = db
    .prepare(
      'SELECT owner_id, title, visibility, updated_at FROM activity WHERE id = ?'
    )
    .get(activityId) as
    | {
        owner_id: string;
        title: string;
        updated_at: number;
        visibility: string;
      }
    | undefined;
  if (!row) return undefined;
  return {
    ownerId: row.owner_id,
    title: row.title,
    updatedAt: row.updated_at,
    visibility: row.visibility,
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
      ACTIVITY_MUTATION_CONCURRENCY_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
