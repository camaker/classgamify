import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES,
  doesAttemptSubmissionIdentityMatch,
  normalizeAttemptSubmissionKey,
  resolveAttemptSubmissionKey,
} from '@/assignments/submission-idempotency';

const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/attempt-persistence.ts',
  'utf8'
);
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const RUNNER_ROUTE_SOURCE = readFileSync(
  'src/routes/play/$shareId.tsx',
  'utf8'
);
const SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const MIGRATION_SOURCE = readFileSync(
  'src/db/migrations/0009_minor_winter_soldier.sql',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('attempt submission idempotency contract exposes 30 stable stages', () => {
  assert.equal(ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES.length, 30);
  assert.equal(
    new Set(ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES.map((stage) => stage.id))
      .size,
    30
  );
  assert.deepEqual(countByLayer(), {
    client: 11,
    database: 2,
    privacy: 1,
    result: 2,
    server: 14,
  });
});

test('submission keys normalize, reuse, and remain bound to one identity', () => {
  let createCount = 0;
  assert.equal(normalizeAttemptSubmissionKey(' retry-key '), 'retry-key');
  assert.equal(
    resolveAttemptSubmissionKey({
      createSubmissionKey: () => {
        createCount += 1;
        return 'unused-key';
      },
      currentSubmissionKey: ' existing-key ',
    }),
    'existing-key'
  );
  assert.equal(createCount, 0);
  assert.equal(
    resolveAttemptSubmissionKey({
      createSubmissionKey: () => {
        createCount += 1;
        return ' created-key ';
      },
    }),
    'created-key'
  );
  assert.equal(createCount, 1);
  assert.equal(
    doesAttemptSubmissionIdentityMatch({
      existing: { studentName: ' Ada   Lovelace ' },
      requested: { studentName: 'ada lovelace' },
    }),
    true
  );
  assert.equal(
    doesAttemptSubmissionIdentityMatch({
      existing: { anonymousToken: 'browser-token-a' },
      requested: { anonymousToken: 'browser-token-b' },
    }),
    false
  );
});

test('generated migration enforces assignment-scoped submission uniqueness', () => {
  assert.match(SCHEMA_SOURCE, /submissionKey: text\('submission_key'\)/);
  assert.match(
    SCHEMA_SOURCE,
    /uniqueIndex\('attempt_assignment_submission_key_unique'\)\.on\([\s\S]*table\.assignmentId,[\s\S]*table\.submissionKey/
  );
  assert.match(
    MIGRATION_SOURCE,
    /ALTER TABLE `attempt` ADD `submission_key` text;[\s\S]*CREATE UNIQUE INDEX `attempt_assignment_submission_key_unique` ON `attempt` \(`assignment_id`,`submission_key`\)/
  );

  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE attempt (assignment_id TEXT NOT NULL);');
    db.exec(MIGRATION_SOURCE.replaceAll('--> statement-breakpoint', ''));
    const insert = db.prepare(
      'INSERT INTO attempt (assignment_id, submission_key) VALUES (?, ?)'
    );
    insert.run('assignment-a', 'submission-key-1');
    assert.throws(() => insert.run('assignment-a', 'submission-key-1'));
    insert.run('assignment-b', 'submission-key-1');
    insert.run('assignment-a', null);
    insert.run('assignment-a', null);
  } finally {
    db.close();
  }
});

test('student runner reuses failed submission keys and resets new attempts', () => {
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /const submissionKey = resolveAttemptSubmissionKey\(\{[\s\S]*createSubmissionKey,[\s\S]*currentSubmissionKey[\s\S]*submissionKey,/
  );
  assert.match(
    RUNNER_ROUTE_SOURCE,
    /const \[submissionKey, setSubmissionKey\] = useState<string>\(\)[\s\S]*createSubmissionKey: \(\) => window\.crypto\.randomUUID\(\)[\s\S]*submissionKey,[\s\S]*setSubmissionKey\(executionPlan\.input\.submissionKey\)[\s\S]*mutateAsync/
  );
  assert.match(
    RUNNER_ROUTE_SOURCE,
    /setSubmissionKey\(resetPlan\.submissionKey\)[\s\S]*setSubmissionKey\(restartPlan\.submissionKey\)/
  );
});

test('server recovers existing and concurrent retries before new-submit gates', () => {
  const handlerSource = getSourceSlice(
    API_SOURCE,
    'export const submitAttempt',
    'async function recoverAttemptSubmissionResponse'
  );
  const replayIndex = handlerSource.indexOf(
    'const replayResponse = await recoverAttemptSubmissionResponse'
  );
  const lifecycleIndex = handlerSource.indexOf(
    'assertAssignmentAcceptsSubmissions'
  );
  const attemptLimitIndex = handlerSource.indexOf(
    'canUseAnotherAssignmentAttempt'
  );
  const insertIndex = handlerSource.indexOf('await db.insert(attempt)');
  const conflictRecoveryIndex = handlerSource.indexOf(
    'const concurrentReplayResponse = await recoverAttemptSubmissionResponse'
  );

  assert.ok(replayIndex >= 0);
  assert.ok(lifecycleIndex > replayIndex);
  assert.ok(attemptLimitIndex > lifecycleIndex);
  assert.ok(insertIndex > attemptLimitIndex);
  assert.ok(conflictRecoveryIndex > insertIndex);
  assert.match(
    ATTEMPT_QUERY_SOURCE,
    /buildAttemptSubmissionReplaySelect[\s\S]*answersJson: attempt\.answersJson[\s\S]*resultJson: attempt\.resultJson[\s\S]*buildAttemptSubmissionKeyWhere[\s\S]*eq\(attempt\.assignmentId, assignmentId\)[\s\S]*eq\(attempt\.submissionKey, submissionKey\)/
  );
  assert.match(
    PERSISTENCE_SOURCE,
    /buildScoredAttemptInsert[\s\S]*submissionKey[\s\S]*submissionKey,/
  );
  assert.match(
    API_SOURCE,
    /doesAttemptSubmissionIdentityMatch[\s\S]*assignment_api_error_submission_retry_conflict[\s\S]*function buildAttemptSubmissionResponse[\s\S]*buildPublicAttemptReviewSummaryView[\s\S]*buildPublicAttemptResult\(result\)/
  );
});

test('idempotency contract is documented without exposing private keys', () => {
  assert.match(
    PRODUCT_SOURCE,
    /submission idempotency contract[\s\S]*network retry[\s\S]*same persisted attempt[\s\S]*new attempt/
  );
  assert.match(
    DB_DOC_SOURCE,
    /Attempt submission idempotency[\s\S]*nullable[\s\S]*submission_key[\s\S]*assignment_id/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment submission idempotency has a fast script-level gate via[\s\S]*assignment-submission-idempotency-contract\.test\.ts/
  );
  assert.doesNotMatch(
    getSourceSlice(
      API_SOURCE,
      'function buildAttemptSubmissionResponse',
      API_SOURCE.length
    ),
    /submissionKey:|anonymousToken:|studentName:/
  );
});

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}

function getSourceSlice(source: string, start: string, end: string | number) {
  const startIndex = source.indexOf(start);
  const endIndex =
    typeof end === 'number' ? end : source.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `Missing source start: ${start}`);
  assert.notEqual(endIndex, -1, `Missing source end: ${String(end)}`);
  return source.slice(startIndex, endIndex);
}
