import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CLASSROOM_QUERY_EXECUTION_CONTRACT } from '@/db/classroom-query-execution-contract';

const ACTIVITIES_API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const USER_FILES_API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('classroom query execution contract exposes 30 stable stages', () => {
  assert.equal(CLASSROOM_QUERY_EXECUTION_CONTRACT.length, 30);
  assert.equal(
    new Set(CLASSROOM_QUERY_EXECUTION_CONTRACT.map((item) => item.id)).size,
    30
  );
  assert.deepEqual(countByMode(), {
    barrier: 4,
    'conditional-read': 2,
    'dependent-read': 1,
    invariant: 1,
    'parallel-read': 11,
    'post-process': 8,
    precondition: 3,
  });
});

test('activity library groups independent reads before domain assembly', () => {
  const source = getHandlerSource(
    ACTIVITIES_API_SOURCE,
    'export const listActivities',
    'const getActivityInputSchema'
  );

  assert.match(
    source,
    /const \[matchingRows, summaryRows, createdActivityRows\] = await Promise\.all\(\[[\s\S]*buildActivityLibraryItemSelect[\s\S]*summaryWhere[\s\S]*data\.createdActivityId[\s\S]*buildCreatedActivityListItemSelect[\s\S]*Promise\.resolve\(\[\]\)[\s\S]*\]\)/
  );
  assert.match(
    source,
    /Promise\.all[\s\S]*filterActivityLibrarySourceItems[\s\S]*getActivityLibraryPageItems[\s\S]*summarizeActivityLibrary/
  );
});

test('assignment library keeps page attempt stats behind the page-id barrier', () => {
  const source = getHandlerSource(
    ASSIGNMENTS_API_SOURCE,
    'export const listAssignments',
    'export const publishAssignment'
  );

  assert.match(
    source,
    /await Promise\.all\(\[[\s\S]*buildAssignmentListCountSelect[\s\S]*buildAssignmentListSummarySelect[\s\S]*buildAssignmentAttemptStatsSelect[\s\S]*data\.publishedShareSlug[\s\S]*buildAssignmentDetailSelect[\s\S]*\]\)/
  );
  assert.match(
    source,
    /Promise\.all[\s\S]*const itemAssignmentIds = items\.map[\s\S]*const itemAttempts =[\s\S]*buildAssignmentAttemptsInWhere[\s\S]*summarizeAssignmentAttemptsByAssignmentId/
  );
  const barrierIndex = source.indexOf('] = await Promise.all([');
  const barrierEndIndex = source.indexOf(']);', barrierIndex);
  const pageIdsIndex = source.indexOf('const itemAssignmentIds');
  const pageAttemptsIndex = source.indexOf('const itemAttempts');
  const pageAttemptWhereIndex = source.indexOf(
    'buildAssignmentAttemptsInWhere',
    pageAttemptsIndex
  );

  assert.ok(barrierIndex >= 0);
  assert.ok(barrierEndIndex > barrierIndex);
  assert.ok(pageIdsIndex > barrierEndIndex);
  assert.ok(pageAttemptsIndex > pageIdsIndex);
  assert.ok(pageAttemptWhereIndex > pageAttemptsIndex);
});

test('file list and material picker group owner-scoped reads', () => {
  const fileListSource = getHandlerSource(
    USER_FILES_API_SOURCE,
    'export const listUserFiles',
    'export const listUserFileMaterials'
  );
  const materialListSource = getHandlerSource(
    USER_FILES_API_SOURCE,
    'export const listUserFileMaterials',
    'const deleteSchema'
  );

  assert.match(
    fileListSource,
    /const \[totalRows, items, summaryItems\] = await Promise\.all\(\[[\s\S]*count\(\)[\s\S]*buildUserFileListOrderBy[\s\S]*contentType: userFiles\.contentType[\s\S]*\]\)/
  );
  assert.match(
    materialListSource,
    /const \[totalRows, items\] = await Promise\.all\(\[[\s\S]*count\(\)[\s\S]*buildUserFileListOrderBy[\s\S]*\]\)/
  );
});

test('query execution contract stays read-only, owner-scoped, and documented', () => {
  for (const source of [
    getHandlerSource(
      ACTIVITIES_API_SOURCE,
      'export const listActivities',
      'const getActivityInputSchema'
    ),
    getHandlerSource(
      ASSIGNMENTS_API_SOURCE,
      'export const listAssignments',
      'export const publishAssignment'
    ),
    getHandlerSource(
      USER_FILES_API_SOURCE,
      'export const listUserFiles',
      'const deleteSchema'
    ),
  ]) {
    assert.match(source, /userId/);
    assert.doesNotMatch(source, /\.insert\(|\.update\(|\.delete\(/);
  }
  const normalizedProductSource = PRODUCT_SOURCE.replace(/\s+/g, ' ');
  assert.match(
    normalizedProductSource,
    /30-stage classroom query execution contract.*independent D1 reads.*dependent page-attempt query.*owner scope.*read-only/i
  );
  assert.match(
    DB_DOC_SOURCE,
    /Query execution contract[\s\S]*classroom-query-execution-contract\.ts[\s\S]*Promise\.all[\s\S]*page assignment ids/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Classroom query execution contract has a fast script-level gate via[\s\S]*scripts\/classroom-query-execution-contract\.test\.ts/
  );
});

function countByMode() {
  return Object.fromEntries(
    Array.from(
      CLASSROOM_QUERY_EXECUTION_CONTRACT.reduce((counts, item) => {
        counts.set(item.mode, (counts.get(item.mode) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}

function getHandlerSource(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `Missing handler start: ${start}`);
  assert.notEqual(endIndex, -1, `Missing handler end: ${end}`);
  return source.slice(startIndex, endIndex);
}
