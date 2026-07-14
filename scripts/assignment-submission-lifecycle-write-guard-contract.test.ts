import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { persistAttemptWithinIdentityLimit } from '@/assignments/attempt-limit-concurrency';
import {
  ASSIGNMENT_SUBMISSION_EXPIRED_MARKER,
  ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER,
  ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES,
  getAssignmentSubmissionLifecycleWriteErrorMessage,
  isAttemptIdentitySlotConflict,
  rethrowAssignmentSubmissionWriteError,
} from '@/assignments/submission-lifecycle-write';
import { m } from '@/locale/paraglide/messages';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const CONCURRENCY_SOURCE = readFileSync(
  'src/assignments/attempt-limit-concurrency.ts',
  'utf8'
);
const MIGRATION_SOURCE = readFileSync(
  'src/db/migrations/0011_attempt_submission_lifecycle_guard.sql',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('submission lifecycle write guard exposes 30 stable stages', () => {
  assert.equal(ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES.length, 30);
  assert.equal(
    new Set(ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES.map((stage) => stage.id))
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

test('database triggers reject assignment closure at attempt write time', () => {
  const db = createLifecycleGuardDatabase();
  try {
    insertAssignment(db, {
      id: 'assignment-close-race',
      status: 'published',
    });
    assert.equal(
      readAssignmentStatus(db, 'assignment-close-race'),
      'published'
    );
    db.prepare('UPDATE assignment SET status = ? WHERE id = ?').run(
      'closed',
      'assignment-close-race'
    );

    const error = captureInsertError(
      db,
      'attempt-close-race',
      'assignment-close-race'
    );
    assert.match(
      getErrorText(error),
      new RegExp(ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER)
    );
    assert.equal(countAttempts(db), 0);
  } finally {
    db.close();
  }
});

test('database triggers reject expiry reached before attempt persistence', () => {
  const db = createLifecycleGuardDatabase();
  try {
    insertAssignment(db, {
      expiresAt: Date.now() + 60_000,
      id: 'assignment-expiry-race',
      status: 'published',
    });
    assert.equal(
      readAssignmentStatus(db, 'assignment-expiry-race'),
      'published'
    );
    db.prepare('UPDATE assignment SET expires_at = ? WHERE id = ?').run(
      1,
      'assignment-expiry-race'
    );

    const error = captureInsertError(
      db,
      'attempt-expiry-race',
      'assignment-expiry-race'
    );
    assert.match(
      getErrorText(error),
      new RegExp(ASSIGNMENT_SUBMISSION_EXPIRED_MARKER)
    );
    assert.equal(countAttempts(db), 0);
  } finally {
    db.close();
  }
});

test('open and unscheduled assignments still persist attempts', () => {
  const db = createLifecycleGuardDatabase();
  try {
    insertAssignment(db, { id: 'assignment-open', status: 'published' });
    insertAssignment(db, {
      expiresAt: Date.now() + 60_000,
      id: 'assignment-future',
      status: 'published',
    });

    insertAttempt(db, 'attempt-open', 'assignment-open');
    insertAttempt(db, 'attempt-future', 'assignment-future');
    assert.equal(countAttempts(db), 2);
  } finally {
    db.close();
  }
});

test('write markers map through causes to existing localized lifecycle errors', () => {
  const statusError = new Error('D1 write failed', {
    cause: new Error(ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER),
  });
  const expiryError = new Error('D1 write failed', {
    cause: new Error(ASSIGNMENT_SUBMISSION_EXPIRED_MARKER),
  });

  assert.equal(
    getAssignmentSubmissionLifecycleWriteErrorMessage(statusError),
    m.assignment_api_error_assignment_closed()
  );
  assert.equal(
    getAssignmentSubmissionLifecycleWriteErrorMessage(expiryError),
    m.assignment_api_error_assignment_expired()
  );
  assert.throws(
    () => rethrowAssignmentSubmissionWriteError(statusError),
    new RegExp(escapeRegExp(m.assignment_api_error_assignment_closed()))
  );
  const unrelatedError = new Error('storage unavailable');
  assert.throws(
    () => rethrowAssignmentSubmissionWriteError(unrelatedError),
    (error) => error === unrelatedError
  );
});

test('only the identity-slot unique target is classified for recount', () => {
  assert.equal(
    isAttemptIdentitySlotConflict(
      new Error(
        'UNIQUE constraint failed: attempt.assignment_id, attempt.identity_key, attempt.attempt_number'
      )
    ),
    true
  );
  assert.equal(
    isAttemptIdentitySlotConflict(
      new Error('constraint attempt_assignment_identity_number_unique failed')
    ),
    true
  );
  assert.equal(
    isAttemptIdentitySlotConflict(
      new Error(
        'UNIQUE constraint failed: attempt.assignment_id, attempt.submission_key'
      )
    ),
    false
  );
  assert.equal(
    isAttemptIdentitySlotConflict(
      new Error(ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER)
    ),
    false
  );
});

test('non-slot write errors bypass occupied-slot recounts', async () => {
  const lifecycleError = new Error(ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER);
  let occupiedChecks = 0;

  await assert.rejects(
    persistAttemptWithinIdentityLimit({
      countPreviousAttempts: async () => 0,
      identity: { studentName: 'Ada' },
      insertAttempt: async () => {
        throw lifecycleError;
      },
      isSlotConflict: isAttemptIdentitySlotConflict,
      isSlotOccupied: async () => {
        occupiedChecks += 1;
        return true;
      },
      maxAttempts: 2,
      recoverReplay: async () => null,
    }),
    (error) => error === lifecycleError
  );
  assert.equal(occupiedChecks, 0);
});

test('same-key replay recovery remains ahead of lifecycle error mapping', async () => {
  const replay = { attemptId: 'attempt-already-persisted' };
  const result = await persistAttemptWithinIdentityLimit({
    countPreviousAttempts: async () => 0,
    identity: { studentName: 'Ada' },
    insertAttempt: async () => {
      throw new Error(ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER);
    },
    isSlotConflict: isAttemptIdentitySlotConflict,
    isSlotOccupied: async () => false,
    maxAttempts: 2,
    recoverReplay: async () => replay,
  });

  assert.deepEqual(result, { replay, type: 'replay' });
});

test('API preserves replay priority and maps write-time lifecycle failures', () => {
  const handlerSource = API_SOURCE.slice(
    API_SOURCE.indexOf('export const submitAttempt'),
    API_SOURCE.indexOf('async function isAttemptIdentitySlotOccupied')
  );
  const initialReplayIndex = handlerSource.indexOf(
    'const replayResponse = await recoverAttemptSubmissionResponse'
  );
  const initialLifecycleIndex = handlerSource.indexOf(
    'assertAssignmentAcceptsSubmissions'
  );
  const persistenceIndex = handlerSource.indexOf(
    'persistAttemptWithinIdentityLimit({'
  );
  const writeMappingIndex = handlerSource.indexOf(
    '.catch(rethrowAssignmentSubmissionWriteError)'
  );

  assert.ok(initialReplayIndex >= 0);
  assert.ok(initialLifecycleIndex > initialReplayIndex);
  assert.ok(persistenceIndex > initialLifecycleIndex);
  assert.ok(writeMappingIndex > persistenceIndex);
  assert.match(
    API_SOURCE,
    /insertAttempt: async \(identitySlot\)[\s\S]*await db\.insert\(attempt\)[\s\S]*isSlotConflict: isAttemptIdentitySlotConflict[\s\S]*recoverReplay:[\s\S]*recoverAttemptSubmissionResponse[\s\S]*catch\(rethrowAssignmentSubmissionWriteError\)/
  );
  assert.match(
    CONCURRENCY_SOURCE,
    /catch \(error\)[\s\S]*recoverReplay\(\)[\s\S]*replay !== null[\s\S]*!isSlotConflict\(error\)[\s\S]*isSlotOccupied\(slot\)/
  );
});

test('write guard is documented without exposing internal markers', () => {
  assert.match(
    PRODUCT_SOURCE,
    /submission lifecycle write guard[\s\S]*BEFORE INSERT[\s\S]*closing a\s+link[\s\S]*same-key replay[\s\S]*identity-slot unique conflicts/i
  );
  assert.match(
    DB_DOC_SOURCE,
    /Attempt submission lifecycle guard[\s\S]*0011_attempt_submission_lifecycle_guard\.sql[\s\S]*database clock[\s\S]*localized closed\/expired/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment submission lifecycle writes have a fast script-level gate via[\s\S]*assignment-submission-lifecycle-write-guard-contract\.test\.ts/
  );
  const responseSource = API_SOURCE.slice(
    API_SOURCE.indexOf('function buildAttemptSubmissionResponse')
  );
  assert.doesNotMatch(
    responseSource,
    /classgamify_assignment_submission_|identityKey:|attemptNumber:/
  );
});

function createLifecycleGuardDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE assignment (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      expires_at INTEGER
    );
    CREATE TABLE attempt (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignment(id)
    );
  `);
  db.exec(MIGRATION_SOURCE.replaceAll('--> statement-breakpoint', ''));
  return db;
}

function insertAssignment(
  db: DatabaseSync,
  input: { expiresAt?: number; id: string; status: string }
) {
  db.prepare(
    'INSERT INTO assignment (id, status, expires_at) VALUES (?, ?, ?)'
  ).run(input.id, input.status, input.expiresAt ?? null);
}

function readAssignmentStatus(db: DatabaseSync, assignmentId: string) {
  const row = db
    .prepare('SELECT status FROM assignment WHERE id = ?')
    .get(assignmentId) as { status: string } | undefined;
  return row?.status;
}

function insertAttempt(
  db: DatabaseSync,
  attemptId: string,
  assignmentId: string
) {
  db.prepare('INSERT INTO attempt (id, assignment_id) VALUES (?, ?)').run(
    attemptId,
    assignmentId
  );
}

function captureInsertError(
  db: DatabaseSync,
  attemptId: string,
  assignmentId: string
) {
  try {
    insertAttempt(db, attemptId, assignmentId);
  } catch (error) {
    return error;
  }
  assert.fail('Expected attempt insertion to fail');
}

function countAttempts(db: DatabaseSync) {
  const row = db.prepare('SELECT count(*) AS count FROM attempt').get() as {
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
      ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
