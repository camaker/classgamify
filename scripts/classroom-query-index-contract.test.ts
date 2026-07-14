import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { CLASSROOM_QUERY_INDEX_CONTRACT } from '@/db/classroom-query-index-contract';

const APP_SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const ACTIVITY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const ASSIGNMENT_QUERY_SOURCE = readFileSync(
  'src/assignments/list-query.ts',
  'utf8'
);
const ATTEMPT_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const FILE_QUERY_SOURCE = readFileSync('src/storage/file-query.ts', 'utf8');
const PAYMENT_API_SOURCE = readFileSync('src/api/payment.ts', 'utf8');

const NEW_INDEXES = {
  activity_owner_template_updated_idx: [
    'owner_id',
    'template_type',
    'updated_at',
  ],
  activity_owner_visibility_updated_idx: [
    'owner_id',
    'visibility',
    'updated_at',
  ],
  assignment_owner_status_expires_updated_idx: [
    'owner_id',
    'status',
    'expires_at',
    'updated_at',
  ],
  payment_user_paid_created_idx: ['user_id', 'paid', 'created_at'],
  user_files_user_created_idx: ['user_id', 'created_at'],
} as const;

test('classroom query index contract covers 30 stable read paths', () => {
  assert.equal(CLASSROOM_QUERY_INDEX_CONTRACT.length, 30);
  assert.equal(
    new Set(CLASSROOM_QUERY_INDEX_CONTRACT.map((item) => item.id)).size,
    30
  );
  assert.ok(
    CLASSROOM_QUERY_INDEX_CONTRACT.every(
      (item) =>
        item.id &&
        item.indexName &&
        item.surface &&
        item.columns.length > 0 &&
        item.columns.every((column) => /^[a-z][a-z0-9_]*$/.test(column))
    )
  );
});

test('classroom query indexes match schema and generated migration', () => {
  const migrationSource = readClassroomQueryIndexMigrationSource();

  for (const [indexName, columns] of Object.entries(NEW_INDEXES)) {
    assert.match(
      APP_SCHEMA_SOURCE,
      new RegExp(`index\\('${indexName}'\\)\\.on\\(`),
      `Schema should declare ${indexName}.`
    );
    const migrationStatement = migrationSource
      .split(/\r?\n/)
      .find((line) => line.includes(`CREATE INDEX \`${indexName}\``));
    const expectedColumnList = `(${columns
      .map((column) => `\`${column}\``)
      .join(',')})`;
    assert.ok(
      migrationStatement?.includes(expectedColumnList),
      `Generated index migration should create ${indexName} with ${columns.join(', ')}.`
    );
  }
});

test('generated classroom query indexes apply with the expected SQLite order', () => {
  const db = new DatabaseSync(':memory:');

  try {
    db.exec(`
      CREATE TABLE activity (
        owner_id TEXT NOT NULL,
        template_type TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        visibility TEXT NOT NULL
      );
      CREATE TABLE assignment (
        expires_at INTEGER,
        owner_id TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE payment (
        created_at INTEGER NOT NULL,
        paid INTEGER NOT NULL,
        user_id TEXT NOT NULL
      );
      CREATE TABLE user_files (
        created_at INTEGER NOT NULL,
        user_id TEXT NOT NULL
      );
    `);
    db.exec(
      readClassroomQueryIndexMigrationSource().replaceAll(
        '--> statement-breakpoint',
        ''
      )
    );

    for (const [indexName, columns] of Object.entries(NEW_INDEXES)) {
      const indexedColumns = db
        .prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno')
        .all(indexName) as Array<{ name: string }>;
      assert.deepEqual(
        indexedColumns.map((column) => column.name),
        columns,
        `SQLite should preserve ${indexName} column order.`
      );
    }
  } finally {
    db.close();
  }
});

test('classroom query paths stay aligned with owner filters and ordering', () => {
  assert.match(
    ACTIVITY_QUERY_SOURCE,
    /eq\(activity\.ownerId, userId\)[\s\S]*activity\.visibility[\s\S]*activity\.templateType[\s\S]*updatedAtDelta[\s\S]*a\.id\.localeCompare/
  );
  assert.match(
    ASSIGNMENT_QUERY_SOURCE,
    /eq\(assignment\.ownerId, userId\)[\s\S]*buildAssignmentLifecycleStatusFilter[\s\S]*desc\(assignment\.updatedAt\)[\s\S]*asc\(assignment\.id\)/
  );
  assert.match(
    ATTEMPT_QUERY_SOURCE,
    /attempt\.assignmentId[\s\S]*attempt\.studentName[\s\S]*attempt\.anonymousToken[\s\S]*desc\(attempt\.completedAt\)[\s\S]*asc\(attempt\.id\)/
  );
  assert.match(
    FILE_QUERY_SOURCE,
    /eq\(userFiles\.userId, userId\)[\s\S]*desc\(userFiles\.createdAt\)[\s\S]*asc\(userFiles\.id\)/
  );
  assert.match(
    PAYMENT_API_SOURCE,
    /eq\(payment\.paid, true\)[\s\S]*eq\(payment\.userId, userId\)[\s\S]*orderBy\(desc\(payment\.createdAt\)\)/
  );
});

test('classroom query index contract is documented without private data', () => {
  assert.match(
    PRODUCT_SOURCE,
    /30-path classroom query index contract[\s\S]*activity library[\s\S]*assignment lifecycle[\s\S]*attempt identity[\s\S]*source-material library[\s\S]*payment lookup/
  );
  assert.match(
    DB_DOC_SOURCE,
    /Query index contract[\s\S]*classroom-query-index-contract\.ts[\s\S]*owner[\s\S]*stable ordering/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Classroom query index contract has a fast script-level gate via[\s\S]*scripts\/classroom-query-index-contract\.test\.ts/
  );

  const serialized = JSON.stringify(CLASSROOM_QUERY_INDEX_CONTRACT);
  for (const privateTerm of [
    'student_answer',
    'anonymous_token_value',
    'storage_key_value',
    'teacher_email',
  ]) {
    assert.equal(serialized.includes(privateTerm), false);
  }
});

function readClassroomQueryIndexMigrationSource() {
  const migrationSources = readdirSync('src/db/migrations')
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort()
    .map((file) => ({
      file,
      source: readFileSync(`src/db/migrations/${file}`, 'utf8'),
    }));
  const migration = migrationSources.find(({ source }) =>
    Object.keys(NEW_INDEXES).every((indexName) =>
      source.includes(`CREATE INDEX \`${indexName}\``)
    )
  );
  assert.ok(
    migration,
    'Expected the generated classroom query index migration.'
  );
  return migration.source;
}
