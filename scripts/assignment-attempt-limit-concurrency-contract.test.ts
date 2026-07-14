import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  ATTEMPT_LIMIT_CONCURRENCY_STAGES,
  buildAttemptIdentitySlot,
  persistAttemptWithinIdentityLimit,
  type AttemptIdentitySlot,
} from '@/assignments/attempt-limit-concurrency';

const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const MIGRATION_SOURCE = readFileSync(
  'src/db/migrations/0010_breezy_toro.sql',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('attempt limit concurrency contract exposes 30 stable stages', () => {
  assert.equal(ATTEMPT_LIMIT_CONCURRENCY_STAGES.length, 30);
  assert.equal(
    new Set(ATTEMPT_LIMIT_CONCURRENCY_STAGES.map((stage) => stage.id)).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    database: 6,
    domain: 8,
    privacy: 4,
    server: 12,
  });
});

test('finite attempt slots normalize identity and advance from stored count', () => {
  assert.deepEqual(
    buildAttemptIdentitySlot({
      identity: { studentName: ' Ada   Lovelace ' },
      maxAttempts: 3,
      previousAttemptCount: 1,
    }),
    {
      attemptNumber: 2,
      identityKey: 'name:ada lovelace',
    }
  );
  assert.deepEqual(
    buildAttemptIdentitySlot({
      identity: { anonymousToken: ' browser-token-1 ' },
      maxAttempts: 2,
      previousAttemptCount: 0,
    }),
    {
      attemptNumber: 1,
      identityKey: 'anonymous:browser-token-1',
    }
  );
  assert.deepEqual(
    buildAttemptIdentitySlot({
      identity: { anonymousToken: 'browser-token-1' },
      maxAttempts: null,
      previousAttemptCount: 8,
    }),
    { attemptNumber: null, identityKey: null }
  );
});

test('concurrent finite submissions cannot exceed one available slot', async () => {
  const harness = createSlotHarness();
  const results = await Promise.all([reserve(harness, 1), reserve(harness, 1)]);

  assert.equal(
    results.filter((result) => result.type === 'inserted').length,
    1
  );
  assert.equal(
    results.filter((result) => result.type === 'limit-reached').length,
    1
  );
  assert.deepEqual([...harness.slots], [1]);
});

test('concurrent submissions fill distinct slots up to the configured limit', async () => {
  const harness = createSlotHarness();
  const results = await Promise.all([
    reserve(harness, 2),
    reserve(harness, 2),
    reserve(harness, 2),
  ]);

  assert.equal(
    results.filter((result) => result.type === 'inserted').length,
    2
  );
  assert.equal(
    results.filter((result) => result.type === 'limit-reached').length,
    1
  );
  assert.deepEqual(
    [...harness.slots].sort((left, right) => left - right),
    [1, 2]
  );
});

test('generated migration enforces assignment identity attempt slots', () => {
  assert.match(SCHEMA_SOURCE, /identityKey: text\('identity_key'\)/);
  assert.match(SCHEMA_SOURCE, /attemptNumber: integer\('attempt_number'\)/);
  assert.match(
    SCHEMA_SOURCE,
    /uniqueIndex\('attempt_assignment_identity_number_unique'\)\.on\([\s\S]*table\.assignmentId,[\s\S]*table\.identityKey,[\s\S]*table\.attemptNumber/
  );

  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE attempt (assignment_id TEXT NOT NULL);');
    db.exec(MIGRATION_SOURCE.replaceAll('--> statement-breakpoint', ''));
    const insert = db.prepare(
      'INSERT INTO attempt (assignment_id, identity_key, attempt_number) VALUES (?, ?, ?)'
    );
    insert.run('assignment-a', 'name:ada', 1);
    assert.throws(() => insert.run('assignment-a', 'name:ada', 1));
    insert.run('assignment-a', 'name:ada', 2);
    insert.run('assignment-a', 'name:grace', 1);
    insert.run('assignment-b', 'name:ada', 1);
    insert.run('assignment-a', null, null);
    insert.run('assignment-a', null, null);
  } finally {
    db.close();
  }
});

test('submit API retries occupied slots without bypassing idempotency', () => {
  assert.match(
    API_SOURCE,
    /persistAttemptWithinIdentityLimit\(\{[\s\S]*countPreviousAttempts:[\s\S]*countPreviousIdentityAttempts[\s\S]*insertAttempt: async \(identitySlot\)[\s\S]*identitySlot,[\s\S]*isSlotOccupied:[\s\S]*isAttemptIdentitySlotOccupied[\s\S]*recoverReplay:[\s\S]*recoverAttemptSubmissionResponse/
  );
  assert.match(
    API_SOURCE,
    /persistence\.type === 'replay'[\s\S]*persistence\.type === 'limit-reached'[\s\S]*assignment_api_error_attempt_limit_reached[\s\S]*previousAttemptCount: persistence\.previousAttemptCount/
  );
  assert.match(
    API_SOURCE,
    /function isAttemptIdentitySlotOccupied[\s\S]*buildAttemptIdentitySlotWhere[\s\S]*return Boolean\(occupiedAttempt\)/
  );
});

test('attempt slot contract is documented and remains private', () => {
  assert.match(
    PRODUCT_SOURCE,
    /finite attempt concurrency\s+contract[\s\S]*identity attempt\s+slot[\s\S]*different submission keys[\s\S]*configured limit/i
  );
  assert.match(
    DB_DOC_SOURCE,
    /Attempt limit concurrency[\s\S]*identity_key[\s\S]*attempt_number[\s\S]*nullable/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment attempt-limit concurrency has a fast script-level gate via[\s\S]*assignment-attempt-limit-concurrency-contract\.test\.ts/
  );
  const responseSource = API_SOURCE.slice(
    API_SOURCE.indexOf('function buildAttemptSubmissionResponse')
  );
  assert.doesNotMatch(responseSource, /identityKey:|attemptNumber:/);
});

function createSlotHarness() {
  return { slots: new Set<number>() };
}

function reserve(
  harness: ReturnType<typeof createSlotHarness>,
  maxAttempts: number
) {
  return persistAttemptWithinIdentityLimit({
    countPreviousAttempts: async () => harness.slots.size,
    identity: { studentName: 'Ada' },
    insertAttempt: async (slot) => {
      await Promise.resolve();
      const attemptNumber = requireAttemptNumber(slot);
      if (harness.slots.has(attemptNumber)) throw new Error('slot-conflict');
      harness.slots.add(attemptNumber);
    },
    isSlotOccupied: async (slot) =>
      harness.slots.has(requireAttemptNumber(slot)),
    maxAttempts,
    recoverReplay: async () => null,
  });
}

function requireAttemptNumber(slot: AttemptIdentitySlot) {
  assert.notEqual(slot.attemptNumber, null);
  return slot.attemptNumber as number;
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      ATTEMPT_LIMIT_CONCURRENCY_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
