import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt stats source keeps result, timer, score, and numeric guards', () => {
  const source = read('src/assignments/attempt-stats.ts');
  assert.match(source, /attempts\.filter\(hasAttemptResult\)/);
  assert.match(source, /normalizeAttemptDurationSeconds/);
  assert.match(source, /respectAttemptTimeLimit/);
  assert.match(source, /item\.score[\s\S]*item\.resultJson\?\.earnedPoints/);
  assert.match(source, /Math\.min\(normalizedValue, options\.max\)/);
  assert.match(source, /Number\.isFinite/);
  assert.match(source, /Math\.floor/);
});

test('attempt stats continuity reaches every aggregate product consumer', () => {
  assert.match(
    read('src/assignments/list-summary.ts'),
    /summarizeAssignmentAttempts/
  );
  assert.match(
    read('src/assignments/list-view.ts'),
    /buildAssignmentAttemptStatsView/
  );
  assert.match(
    read('src/assignments/result-view.ts'),
    /buildAssignmentAttemptStatsView/
  );
  assert.match(
    read('src/assignments/classroom-brief.ts'),
    /buildAssignmentAttemptStatsView/
  );
  assert.match(
    read('src/assignments/results-export.ts'),
    /buildAssignmentAttemptStatsView/
  );
  assert.match(
    read('src/api/assignments.ts'),
    /summarizeAssignmentAttemptsByAssignmentId/
  );
});

test('attempt stats continuity keeps hidden semantic and privacy boundaries', () => {
  assert.doesNotMatch(
    read('src/routes/dashboard/assignments/$assignmentId.tsx'),
    /attemptStatsHandoffView|data-handoff/,
    'The results page should render attempt stats as visible metric cards only.'
  );
});

test('product and e2e catalogs register the attempt stats source chain', () => {
  assert.match(
    read('docs/product.md'),
    /attempt statistics continuity gate[\s\S]*assignment lists[\s\S]*result\s+pages[\s\S]*classroom briefs[\s\S]*CSV[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-stats-continuity\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
