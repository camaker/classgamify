import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment attempt stats stay wired to shared consumers', () => {
  const attemptStatsSource = readFileSync(
    'src/assignments/attempt-stats.ts',
    'utf8'
  );
  const resultViewSource = readFileSync(
    'src/assignments/result-view.ts',
    'utf8'
  );
  const listSummarySource = readFileSync(
    'src/assignments/list-summary.ts',
    'utf8'
  );
  const listViewSource = readFileSync('src/assignments/list-view.ts', 'utf8');
  const classroomBriefSource = readFileSync(
    'src/assignments/classroom-brief.ts',
    'utf8'
  );
  const resultsExportSource = readFileSync(
    'src/assignments/results-export.ts',
    'utf8'
  );
  const routeSource = readFileSync(
    'src/routes/dashboard/assignments/$assignmentId.tsx',
    'utf8'
  );
  assert.match(
    attemptStatsSource,
    /normalizeAttemptDurationSeconds[\s\S]*function getAttemptAccuracy[\s\S]*function getAttemptPoints[\s\S]*summarizeAssignmentAttemptsByAssignmentId/
  );
  assert.doesNotMatch(
    resultViewSource,
    /attemptStatsHandoffView/,
    'The result page view model should not build the hidden attempt stats view.'
  );
  assert.match(
    listSummarySource,
    /buildAssignmentAttemptStatsView\(resolvedSummary\)/
  );
  assert.match(
    listViewSource,
    /buildAssignmentAttemptStatsView\(\{[\s\S]*averageScore,[\s\S]*completions,[\s\S]*\}\)/
  );
  assert.match(
    classroomBriefSource,
    /const statsView = buildAssignmentAttemptStatsView\(stats\)/
  );
  assert.match(
    resultsExportSource,
    /const statsView = buildAssignmentAttemptStatsView\(\s*normalizeAssignmentResultsExportStats\(data\.stats\)\s*\)/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment attempt stats has a fast script-level gate via[\s\S]*scripts\/assignment-attempt-stats\.test\.ts[\s\S]*average accuracy[\s\S]*CSV exports/
  );
  assert.doesNotMatch(
    routeSource,
    /AssignmentResultsAttemptStatsHandoff|attemptStatsHandoffView/,
    'The results page should not render the hidden attempt stats section.'
  );
});
