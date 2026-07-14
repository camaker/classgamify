import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  ACTIVITY_DERIVATIVE_SOURCE_ARCHIVED_MARKER,
  ACTIVITY_DERIVATIVE_SOURCE_OWNER_MARKER,
  ACTIVITY_DERIVATIVE_SOURCE_PAIR_MARKER,
  ACTIVITY_DERIVATIVE_SOURCE_REVISION_MARKER,
  ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES,
  getActivityDerivativeSourceWriteErrorMessage,
  rethrowActivityDerivativeSourceWriteError,
} from '@/activities/derivative-source-write';
import { getArchivedActivityDerivationError } from '@/activities/lifecycle';
import { m } from '@/locale/paraglide/messages';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const PERSISTENCE_SOURCE = readFileSync(
  'src/activities/persistence.ts',
  'utf8'
);
const DETAIL_QUERY_SOURCE = readFileSync(
  'src/activities/detail-query.ts',
  'utf8'
);
const MIGRATION_SOURCE = readFileSync(
  'src/db/migrations/0013_activity_derivative_source_guard.sql',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity derivative source guard exposes 30 stable stages', () => {
  assert.equal(ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES.length, 30);
  assert.equal(
    new Set(
      ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES.map((stage) => stage.id)
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

test('ordinary activity creation remains source-free', () => {
  const db = createDerivativeGuardDatabase();
  try {
    insertActivity(db, {
      id: 'ordinary-create',
      ownerId: 'teacher-1',
      updatedAt: 1_000,
      visibility: 'draft',
    });
    assert.deepEqual(readProvenance(db, 'ordinary-create'), {
      sourceActivityId: null,
      sourceUpdatedAt: null,
    });
  } finally {
    db.close();
  }
});

test('all active source visibilities accept an exact source revision', () => {
  const db = createDerivativeGuardDatabase();
  try {
    for (const visibility of ['draft', 'private', 'public', 'unlisted']) {
      const sourceId = `source-${visibility}`;
      insertActivity(db, {
        id: sourceId,
        ownerId: 'teacher-1',
        updatedAt: 1_000,
        visibility,
      });
      insertActivity(db, {
        id: `derivative-${visibility}`,
        ownerId: 'teacher-1',
        sourceActivityId: sourceId,
        sourceUpdatedAt: 1_000,
        updatedAt: 2_000,
        visibility: 'draft',
      });
    }

    assert.equal(countActivities(db), 8);
  } finally {
    db.close();
  }
});

test('missing and different-owner sources use the private owner marker', () => {
  const db = createDerivativeGuardDatabase();
  try {
    insertActivity(db, {
      id: 'source-other-owner',
      ownerId: 'teacher-2',
      updatedAt: 1_000,
      visibility: 'private',
    });

    for (const sourceActivityId of ['source-missing', 'source-other-owner']) {
      const error = captureInsertError(db, {
        id: `derivative-${sourceActivityId}`,
        ownerId: 'teacher-1',
        sourceActivityId,
        sourceUpdatedAt: 1_000,
        updatedAt: 2_000,
        visibility: 'draft',
      });
      assert.match(
        getErrorText(error),
        new RegExp(ACTIVITY_DERIVATIVE_SOURCE_OWNER_MARKER)
      );
    }
  } finally {
    db.close();
  }
});

test('archive state wins over revision drift for a matching owner', () => {
  const db = createDerivativeGuardDatabase();
  try {
    insertActivity(db, {
      id: 'source-archived',
      ownerId: 'teacher-1',
      updatedAt: 2_000,
      visibility: 'archived',
    });

    const error = captureInsertError(db, {
      id: 'derivative-archived',
      ownerId: 'teacher-1',
      sourceActivityId: 'source-archived',
      sourceUpdatedAt: 1_000,
      updatedAt: 3_000,
      visibility: 'draft',
    });
    assert.match(
      getErrorText(error),
      new RegExp(ACTIVITY_DERIVATIVE_SOURCE_ARCHIVED_MARKER)
    );
    assert.doesNotMatch(
      getErrorText(error),
      new RegExp(ACTIVITY_DERIVATIVE_SOURCE_REVISION_MARKER)
    );
  } finally {
    db.close();
  }
});

test('active source edits block stale duplicate and remix inserts', () => {
  const db = createDerivativeGuardDatabase();
  try {
    insertActivity(db, {
      id: 'source-edited',
      ownerId: 'teacher-1',
      updatedAt: 2_000,
      visibility: 'private',
    });

    const error = captureInsertError(db, {
      id: 'derivative-stale',
      ownerId: 'teacher-1',
      sourceActivityId: 'source-edited',
      sourceUpdatedAt: 1_000,
      updatedAt: 3_000,
      visibility: 'draft',
    });
    assert.match(
      getErrorText(error),
      new RegExp(ACTIVITY_DERIVATIVE_SOURCE_REVISION_MARKER)
    );
    assert.equal(countActivities(db), 1);
  } finally {
    db.close();
  }
});

test('incomplete derivative provenance is rejected while owner privacy holds', () => {
  const db = createDerivativeGuardDatabase();
  try {
    const error = captureInsertError(db, {
      id: 'derivative-pair-invalid',
      ownerId: 'teacher-1',
      sourceActivityId: 'source-unpaired',
      updatedAt: 2_000,
      visibility: 'draft',
    });
    assert.match(
      getErrorText(error),
      new RegExp(ACTIVITY_DERIVATIVE_SOURCE_PAIR_MARKER)
    );
    assert.doesNotMatch(
      getErrorText(error),
      new RegExp(ACTIVITY_DERIVATIVE_SOURCE_OWNER_MARKER)
    );
  } finally {
    db.close();
  }
});

test('later source changes preserve an existing independent derivative', () => {
  const db = createDerivativeGuardDatabase();
  try {
    insertActivity(db, {
      id: 'source-later-change',
      ownerId: 'teacher-1',
      updatedAt: 1_000,
      visibility: 'private',
    });
    insertActivity(db, {
      id: 'derivative-existing',
      ownerId: 'teacher-1',
      sourceActivityId: 'source-later-change',
      sourceUpdatedAt: 1_000,
      updatedAt: 2_000,
      visibility: 'draft',
    });
    db.prepare(
      'UPDATE activity SET visibility = ?, updated_at = ? WHERE id = ?'
    ).run('archived', 3_000, 'source-later-change');

    assert.deepEqual(readProvenance(db, 'derivative-existing'), {
      sourceActivityId: 'source-later-change',
      sourceUpdatedAt: 1_000,
    });
    assert.equal(countActivities(db), 2);
  } finally {
    db.close();
  }
});

test('nested trigger markers map to existing safe localized errors', () => {
  const ownerError = nestedMarkerError(ACTIVITY_DERIVATIVE_SOURCE_OWNER_MARKER);
  const archiveError = nestedMarkerError(
    ACTIVITY_DERIVATIVE_SOURCE_ARCHIVED_MARKER
  );
  const revisionError = nestedMarkerError(
    ACTIVITY_DERIVATIVE_SOURCE_REVISION_MARKER
  );
  const pairError = nestedMarkerError(ACTIVITY_DERIVATIVE_SOURCE_PAIR_MARKER);

  assert.equal(
    getActivityDerivativeSourceWriteErrorMessage(ownerError),
    m.activity_api_error_activity_not_found()
  );
  assert.equal(
    getActivityDerivativeSourceWriteErrorMessage(archiveError),
    getArchivedActivityDerivationError()
  );
  for (const error of [revisionError, pairError]) {
    assert.equal(
      getActivityDerivativeSourceWriteErrorMessage(error),
      m.activity_api_error_write_conflict()
    );
  }
  assert.throws(
    () => rethrowActivityDerivativeSourceWriteError(archiveError),
    new RegExp(escapeRegExp(getArchivedActivityDerivationError()))
  );
  const unrelatedError = new Error('storage unavailable');
  assert.throws(
    () => rethrowActivityDerivativeSourceWriteError(unrelatedError),
    (error) => error === unrelatedError
  );
});

test('duplicate and remix APIs persist guarded provenance before reload', () => {
  const duplicateHandler = getSourceSlice(
    API_SOURCE,
    'export const duplicateActivity',
    'const remixActivityTemplateInputSchema'
  );
  const remixHandler = getSourceSlice(
    API_SOURCE,
    'export const remixActivityTemplate',
    'const updateActivityInputSchema'
  );

  for (const handler of [duplicateHandler, remixHandler]) {
    const lifecycleIndex = handler.indexOf(
      'assertActivityCanDeriveWork(sourceActivity.visibility)'
    );
    const insertIndex = handler.indexOf('.insert(activity)');
    const mappingIndex = handler.indexOf(
      '.catch(rethrowActivityDerivativeSourceWriteError)'
    );
    const reloadIndex = handler.indexOf(
      '.select(buildActivityDetailSelect())',
      mappingIndex
    );
    assert.ok(lifecycleIndex >= 0);
    assert.ok(insertIndex > lifecycleIndex);
    assert.ok(mappingIndex > insertIndex);
    assert.ok(reloadIndex > mappingIndex);
  }
  assert.match(
    PERSISTENCE_SOURCE,
    /buildDuplicatedActivityInsert[\s\S]*derivationSourceActivityId: sourceActivity\.id[\s\S]*derivationSourceUpdatedAt: sourceActivity\.updatedAt[\s\S]*buildRemixedActivityInsert[\s\S]*derivationSourceActivityId: sourceActivity\.id[\s\S]*derivationSourceUpdatedAt: sourceActivity\.updatedAt/
  );
});

test('schema and docs retain derivative provenance as a private boundary', () => {
  assert.match(
    SCHEMA_SOURCE,
    /derivationSourceActivityId: text\('derivation_source_activity_id'\)[\s\S]*derivationSourceUpdatedAt: integer\('derivation_source_updated_at'/
  );
  assert.doesNotMatch(
    DETAIL_QUERY_SOURCE,
    /derivationSourceActivityId|derivationSourceUpdatedAt/
  );
  assert.match(
    PRODUCT_SOURCE,
    /duplicate and template-remix inserts[\s\S]*source activity id[\s\S]*expected source revision[\s\S]*archived or edited[\s\S]*remain private/i
  );
  assert.match(
    DB_DOC_SOURCE,
    /Activity derivative source guard[\s\S]*0013_activity_derivative_source_guard\.sql[\s\S]*four `BEFORE INSERT` triggers[\s\S]*mutually exclusive/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity derivative source writes have a fast script-level gate via[\s\S]*activity-derivative-source-write-guard-contract\.test\.ts/
  );
  const responseSource = API_SOURCE.slice(
    API_SOURCE.indexOf('export const duplicateActivity'),
    API_SOURCE.indexOf('const updateActivityInputSchema')
  );
  assert.doesNotMatch(
    responseSource,
    /derivationSourceActivityId:|derivationSourceUpdatedAt:|classgamify_activity_derivative_source_/
  );
});

function createDerivativeGuardDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE activity (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      visibility TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  db.exec(MIGRATION_SOURCE.replaceAll('--> statement-breakpoint', ''));
  return db;
}

function insertActivity(
  db: DatabaseSync,
  input: {
    id: string;
    ownerId: string;
    sourceActivityId?: string | null;
    sourceUpdatedAt?: number | null;
    updatedAt: number;
    visibility: string;
  }
) {
  db.prepare(
    `INSERT INTO activity (
      id,
      owner_id,
      visibility,
      updated_at,
      derivation_source_activity_id,
      derivation_source_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    input.id,
    input.ownerId,
    input.visibility,
    input.updatedAt,
    input.sourceActivityId ?? null,
    input.sourceUpdatedAt ?? null
  );
}

function captureInsertError(
  db: DatabaseSync,
  input: Parameters<typeof insertActivity>[1]
) {
  try {
    insertActivity(db, input);
  } catch (error) {
    return error;
  }
  assert.fail('Expected derivative activity insertion to fail');
}

function readProvenance(db: DatabaseSync, activityId: string) {
  const row = db
    .prepare(
      `SELECT
        derivation_source_activity_id,
        derivation_source_updated_at
      FROM activity
      WHERE id = ?`
    )
    .get(activityId) as
    | {
        derivation_source_activity_id: string | null;
        derivation_source_updated_at: number | null;
      }
    | undefined;
  assert.ok(row);
  return {
    sourceActivityId: row.derivation_source_activity_id,
    sourceUpdatedAt: row.derivation_source_updated_at,
  };
}

function countActivities(db: DatabaseSync) {
  const row = db.prepare('SELECT count(*) AS count FROM activity').get() as {
    count: number;
  };
  return row.count;
}

function nestedMarkerError(marker: string) {
  return new Error('D1 insert failed', { cause: new Error(marker) });
}

function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getSourceSlice(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `Missing source start: ${start}`);
  assert.notEqual(endIndex, -1, `Missing source end: ${end}`);
  return source.slice(startIndex, endIndex);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
