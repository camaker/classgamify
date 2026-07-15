import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES,
  buildAssignmentAttemptStatsContinuityChainHandoffView,
} from '@/assignments/attempt-stats-continuity-chain';
import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt stats continuity chain carries 30 aligned handoff slices', () => {
  const view = buildAssignmentAttemptStatsContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
    ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS]
  );
  assert.equal(new Set(view.itemViews.map((item) => item.id)).size, 30);
  assert.ok(
    view.itemViews.every((item) => item.ariaLabel.includes(item.value))
  );
});

test('attempt stats continuity chain keeps a real 30-file source boundary', () => {
  const view = buildAssignmentAttemptStatsContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing attempt-stats source file: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
  assert.deepEqual(view.privacy.sourceFiles, [
    ...ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES,
  ]);
});

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
  const view = buildAssignmentAttemptStatsContinuityChainHandoffView();
  const component = read(
    'src/components/assignments/assignment-results-attempt-stats-handoff.tsx'
  );
  assert.match(component, /className="sr-only"/);
  assert.match(component, /data-handoff="assignment-attempt-stats"/);
  assert.match(component, /<dl>/);
  assert.equal(view.privacy.mutatesAttempts, false);
  assert.equal(view.privacy.usesCompletedScoredAttempts, true);
  assert.equal(view.privacy.usesSharedAssignmentDomainStats, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and e2e catalogs register the attempt stats source chain', () => {
  assert.match(
    read('docs/product.md'),
    /attempt statistics continuity chain[\s\S]*30-slice[\s\S]*assignment lists[\s\S]*result pages[\s\S]*classroom briefs[\s\S]*CSV[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-stats-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
