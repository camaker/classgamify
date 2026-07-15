import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES,
  buildAssignmentAttemptDurationContinuityChainHandoffView,
} from '@/assignments/attempt-duration-continuity-chain';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt duration continuity chain carries 30 aligned handoff slices', () => {
  const view = buildAssignmentAttemptDurationContinuityChainHandoffView();

  assert.equal(
    ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
    ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS]
  );
  assert.equal(new Set(view.itemViews.map((item) => item.id)).size, 30);
  assert.ok(
    view.itemViews.every((item) => item.ariaLabel.includes(item.value))
  );
});

test('attempt duration continuity chain keeps a real 30-file boundary', () => {
  const view = buildAssignmentAttemptDurationContinuityChainHandoffView();

  assert.equal(
    ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing attempt-duration source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
  assert.deepEqual(view.privacy.sourceFiles, [
    ...ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES,
  ]);
});

test('duration core rounds, bounds, caps, and derives timer state', () => {
  const core = read('src/attempts/duration.ts');

  assert.match(core, /Math\.round\(durationSeconds\)/);
  assert.match(core, /Math\.max\(0,/);
  assert.match(core, /Math\.min\(normalizedDuration, normalizedTimeLimit\)/);
  assert.match(core, /Number\.isFinite/);
  assert.match(core, /elapsedSeconds/);
  assert.match(core, /remainingSeconds/);
  assert.match(core, /timeExpired/);
});

test('runner starts time only after playable runtime readiness', () => {
  const state = read('src/assignments/student-runner-state.ts');
  const route = read('src/routes/play/$shareId.tsx');

  assert.match(state, /buildStudentRunnerAttemptClockStartPlan/);
  assert.match(state, /shouldStartStudentRunnerAttemptClock/);
  assert.match(state, /buildStudentRunnerTimerTickPlan/);
  assert.match(route, /buildStudentRunnerAttemptClockStartPlan/);
  assert.match(route, /buildStudentRunnerTimerTickPlan/);
});

test('server normalizes duration before scored persistence', () => {
  const api = read('src/api/assignments.ts');
  const persistence = read('src/assignments/attempt-persistence.ts');

  assert.match(api, /normalizeAttemptDurationSeconds/);
  assert.match(api, /durationSeconds: data\.durationSeconds/);
  assert.match(
    api,
    /evaluateRuntimeAnswers\([\s\S]*durationSeconds[\s\S]*buildAttemptStartedAt\([\s\S]*durationSeconds/
  );
  assert.match(
    persistence,
    /resultJson: cloneAttemptResult\(evaluation\.result\)/
  );
  assert.match(
    read('src/assignments/scored-attempt-result-chain.ts'),
    /duration-normalization/
  );
});

test('duration consumers share assignment-domain formatting', () => {
  assert.match(
    read('src/assignments/student-submission.ts'),
    /formatAttemptDuration/
  );
  assert.match(
    read('src/assignments/attempt-stats.ts'),
    /normalizeAttemptDurationSeconds/
  );
  assert.match(
    read('src/assignments/result-view.ts'),
    /buildAttemptDurationDisplayView/
  );
  assert.match(
    read('src/assignments/results-export.ts'),
    /buildAttemptDurationDisplayView/
  );
  assert.match(
    read('src/assignments/student-follow-up-summary.ts'),
    /buildAttemptDurationDisplayView/
  );
});

test('duration continuity keeps aggregate-only privacy boundaries', () => {
  const view = buildAssignmentAttemptDurationContinuityChainHandoffView();

  assert.equal(view.privacy.mutatesAssignmentSnapshots, false);
  assert.equal(view.privacy.startsClockAfterPlayableRuntimeReady, true);
  assert.equal(view.privacy.usesServerNormalizedStoredDuration, true);
  assert.equal(view.privacy.usesSharedAssignmentDurationFormatting, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and e2e catalogs register the duration source chain', () => {
  assert.match(
    read('docs/product.md'),
    /attempt duration continuity chain[\s\S]*30-slice[\s\S]*runner[\s\S]*server normalization[\s\S]*result[\s\S]*CSV[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-duration-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
