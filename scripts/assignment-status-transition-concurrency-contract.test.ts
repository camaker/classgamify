import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { buildAssignmentStatusTransitionWhere } from '@/assignments/detail-query';
import {
  ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES,
  getAssignmentStatusTransitionConflictMessage,
  resolveAssignmentStatusTransitionUpdatedAt,
} from '@/assignments/status-transition-concurrency';
import { m } from '@/locale/paraglide/messages';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

overwriteGetLocale(() => 'en');

const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const DETAIL_QUERY_SOURCE = readFileSync(
  'src/assignments/detail-query.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const DIALECT = new SQLiteSyncDialect();

test('assignment status transition concurrency exposes 30 stable stages', () => {
  assert.equal(ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES.length, 30);
  assert.equal(
    new Set(
      ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES.map((stage) => stage.id)
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

test('status transition revisions advance monotonically', () => {
  assert.equal(
    resolveAssignmentStatusTransitionUpdatedAt({
      currentUpdatedAt: new Date(1_000),
      now: new Date(1_000),
    }).getTime(),
    1_001
  );
  assert.equal(
    resolveAssignmentStatusTransitionUpdatedAt({
      currentUpdatedAt: new Date(2_000),
      now: new Date(1_000),
    }).getTime(),
    2_001
  );
  assert.equal(
    resolveAssignmentStatusTransitionUpdatedAt({
      currentUpdatedAt: new Date(1_000),
      now: new Date(4_000),
    }).getTime(),
    4_000
  );
});

test('transition conflicts preserve specific lifecycle errors', () => {
  assert.equal(
    getAssignmentStatusTransitionConflictMessage({
      currentStatus: 'closed',
      expiresAt: null,
      nextStatus: 'closed',
      now: 2_000,
    }),
    m.assignment_status_error_already_closed()
  );
  assert.equal(
    getAssignmentStatusTransitionConflictMessage({
      currentStatus: 'closed',
      expiresAt: new Date(1_000),
      nextStatus: 'published',
      now: 2_000,
    }),
    m.assignment_status_error_reopen_expired()
  );
  assert.equal(
    getAssignmentStatusTransitionConflictMessage({
      currentStatus: 'published',
      expiresAt: null,
      nextStatus: 'closed',
      now: 2_000,
    }),
    m.assignment_status_action_failure()
  );
});

test('compiled compare-and-set query carries owner status and revision', () => {
  const closeQuery = compileTransitionWhere({
    currentStatus: 'published',
    currentUpdatedAt: new Date(1_000),
    nextStatus: 'closed',
    now: new Date(2_000),
  });
  assert.match(
    closeQuery.sql,
    /"assignment"\."id" = \? and "assignment"\."owner_id" = \?\) and "assignment"\."status" = \? and "assignment"\."updated_at" = \?/
  );
  assert.doesNotMatch(closeQuery.sql, /expires_at/);

  const reopenQuery = compileTransitionWhere({
    currentStatus: 'closed',
    currentUpdatedAt: new Date(1_000),
    nextStatus: 'published',
    now: new Date(2_000),
  });
  assert.match(
    reopenQuery.sql,
    /"assignment"\."expires_at" is null or "assignment"\."expires_at" > \?/
  );
});

test('concurrent transitions cannot reuse the same lifecycle revision', () => {
  const db = createTransitionDatabase();
  try {
    insertAssignment(db, {
      expiresAt: null,
      id: 'assignment-cas',
      ownerId: 'teacher-1',
      status: 'published',
      updatedAt: 1_000,
    });
    const transition = {
      currentStatus: 'published' as const,
      currentUpdatedAt: new Date(1_000),
      nextStatus: 'closed' as const,
      now: new Date(2_000),
    };

    assert.equal(
      executeTransition(db, transition, {
        nextStatus: 'closed',
        updatedAt: new Date(2_000),
      }).length,
      1
    );
    assert.equal(
      executeTransition(db, transition, {
        nextStatus: 'closed',
        updatedAt: new Date(2_001),
      }).length,
      0
    );
    assert.deepEqual(readAssignment(db, 'assignment-cas'), {
      expiresAt: null,
      ownerId: 'teacher-1',
      status: 'closed',
      updatedAt: 2_000,
    });
  } finally {
    db.close();
  }
});

test('reopen compare-and-set blocks an elapsed close window', () => {
  const db = createTransitionDatabase();
  try {
    insertAssignment(db, {
      expiresAt: 1_500,
      id: 'assignment-expired',
      ownerId: 'teacher-1',
      status: 'closed',
      updatedAt: 1_000,
    });
    assert.equal(
      executeTransition(
        db,
        {
          currentStatus: 'closed',
          currentUpdatedAt: new Date(1_000),
          nextStatus: 'published',
          now: new Date(2_000),
        },
        { nextStatus: 'published', updatedAt: new Date(2_000) }
      ).length,
      0
    );
    assert.equal(readAssignment(db, 'assignment-expired')?.status, 'closed');
  } finally {
    db.close();
  }
});

test('revision changes block stale transitions even when status still matches', () => {
  const db = createTransitionDatabase();
  try {
    insertAssignment(db, {
      expiresAt: null,
      id: 'assignment-revision',
      ownerId: 'teacher-1',
      status: 'published',
      updatedAt: 1_500,
    });
    assert.equal(
      executeTransition(
        db,
        {
          assignmentId: 'assignment-revision',
          currentStatus: 'published',
          currentUpdatedAt: new Date(1_000),
          nextStatus: 'closed',
          now: new Date(2_000),
        },
        { nextStatus: 'closed', updatedAt: new Date(2_000) }
      ).length,
      0
    );
    assert.deepEqual(readAssignment(db, 'assignment-revision'), {
      expiresAt: null,
      ownerId: 'teacher-1',
      status: 'published',
      updatedAt: 1_500,
    });
  } finally {
    db.close();
  }
});

test('reopen compare-and-set accepts future and unscheduled windows', () => {
  const db = createTransitionDatabase();
  try {
    insertAssignment(db, {
      expiresAt: 3_000,
      id: 'assignment-future',
      ownerId: 'teacher-1',
      status: 'closed',
      updatedAt: 1_000,
    });
    insertAssignment(db, {
      expiresAt: null,
      id: 'assignment-unscheduled',
      ownerId: 'teacher-1',
      status: 'closed',
      updatedAt: 1_000,
    });

    for (const assignmentId of [
      'assignment-future',
      'assignment-unscheduled',
    ]) {
      assert.equal(
        executeTransition(
          db,
          {
            assignmentId,
            currentStatus: 'closed',
            currentUpdatedAt: new Date(1_000),
            nextStatus: 'published',
            now: new Date(2_000),
          },
          { nextStatus: 'published', updatedAt: new Date(2_000) }
        ).length,
        1
      );
    }
  } finally {
    db.close();
  }
});

test('compare-and-set remains owner scoped', () => {
  const db = createTransitionDatabase();
  try {
    insertAssignment(db, {
      expiresAt: null,
      id: 'assignment-owner',
      ownerId: 'teacher-2',
      status: 'published',
      updatedAt: 1_000,
    });
    assert.equal(
      executeTransition(
        db,
        {
          assignmentId: 'assignment-owner',
          currentStatus: 'published',
          currentUpdatedAt: new Date(1_000),
          nextStatus: 'closed',
          now: new Date(2_000),
          userId: 'teacher-1',
        },
        { nextStatus: 'closed', updatedAt: new Date(2_000) }
      ).length,
      0
    );
  } finally {
    db.close();
  }
});

test('status API uses compare-and-set returning and conflict reload', () => {
  const handler = getSourceSlice(
    API_SOURCE,
    'export const updateAssignmentStatus',
    'const getAssignmentResultsInputSchema'
  );
  assert.match(
    handler,
    /buildAssignmentLifecycleGateSelect[\s\S]*const now = new Date\(\)[\s\S]*assertAssignmentStatusTransition[\s\S]*resolveAssignmentStatusTransitionUpdatedAt[\s\S]*buildAssignmentStatusTransitionWhere[\s\S]*returning\(buildAssignmentLifecycleGateSelect\(\)\)/
  );
  assert.match(
    handler,
    /if \(!transitionedAssignment\)[\s\S]*select\(buildAssignmentLifecycleGateSelect\(\)\)[\s\S]*getAssignmentStatusTransitionConflictMessage[\s\S]*buildAssignmentDetailSelect/
  );
  assert.match(
    DETAIL_QUERY_SOURCE,
    /buildAssignmentStatusTransitionWhere[\s\S]*buildAssignmentDetailOwnerWhere[\s\S]*eq\(assignment\.status, currentStatus\)[\s\S]*eq\(assignment\.updatedAt, currentUpdatedAt\)[\s\S]*nextStatus === 'published'[\s\S]*isNull\(assignment\.expiresAt\)[\s\S]*gt\(assignment\.expiresAt, normalizedNow\)/
  );
});

test('transition concurrency is documented with private data boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /atomic lifecycle transition[\s\S]*expected `updatedAt` revision[\s\S]*same database statement[\s\S]*zero rows[\s\S]*never overwrites a newer teacher action/
  );
  assert.match(
    DB_DOC_SOURCE,
    /Assignment lifecycle transition concurrency[\s\S]*compare-and-set `UPDATE`[\s\S]*expected `updated_at` revision[\s\S]*UPDATE \.\.\. RETURNING[\s\S]*monotonic/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment lifecycle transition concurrency has a fast script-level gate via[\s\S]*assignment-status-transition-concurrency-contract\.test\.ts/
  );
  const serializedStages = JSON.stringify(
    ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES
  );
  assert.doesNotMatch(
    serializedStages,
    /teacher-1|assignment-cas|shareSlug|anonymousToken|studentName|answersJson/
  );
});

type TransitionInput = {
  assignmentId?: string;
  currentStatus: 'closed' | 'published';
  currentUpdatedAt: Date;
  nextStatus: 'closed' | 'published';
  now: Date;
  userId?: string;
};

function compileTransitionWhere(input: TransitionInput) {
  return DIALECT.sqlToQuery(
    buildAssignmentStatusTransitionWhere({
      assignmentId: input.assignmentId ?? 'assignment-cas',
      currentStatus: input.currentStatus,
      currentUpdatedAt: input.currentUpdatedAt,
      nextStatus: input.nextStatus,
      now: input.now,
      userId: input.userId ?? 'teacher-1',
    })
  );
}

function executeTransition(
  db: DatabaseSync,
  input: TransitionInput,
  update: { nextStatus: 'closed' | 'published'; updatedAt: Date }
) {
  const where = compileTransitionWhere(input);
  return db
    .prepare(
      `UPDATE assignment SET status = ?, updated_at = ? WHERE ${where.sql} RETURNING id`
    )
    .all(update.nextStatus, update.updatedAt.getTime(), ...where.params);
}

function createTransitionDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE assignment (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      expires_at INTEGER
    );
  `);
  return db;
}

function insertAssignment(
  db: DatabaseSync,
  input: {
    expiresAt: number | null;
    id: string;
    ownerId: string;
    status: 'closed' | 'published';
    updatedAt: number;
  }
) {
  db.prepare(
    'INSERT INTO assignment (id, owner_id, status, updated_at, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(
    input.id,
    input.ownerId,
    input.status,
    input.updatedAt,
    input.expiresAt
  );
}

function readAssignment(db: DatabaseSync, assignmentId: string) {
  const row = db
    .prepare(
      'SELECT owner_id, status, updated_at, expires_at FROM assignment WHERE id = ?'
    )
    .get(assignmentId) as
    | {
        expires_at: number | null;
        owner_id: string;
        status: 'closed' | 'published';
        updated_at: number;
      }
    | undefined;
  if (!row) return undefined;
  return {
    expiresAt: row.expires_at,
    ownerId: row.owner_id,
    status: row.status,
    updatedAt: row.updated_at,
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
      ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES.reduce(
        (counts, stage) => {
          counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
          return counts;
        },
        new Map<string, number>()
      )
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
