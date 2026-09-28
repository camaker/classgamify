import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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

test('product and e2e catalogs register the duration source chain', () => {
  assert.match(
    read('docs/product.md'),
    /attempt duration continuity gate[\s\S]*runner[\s\S]*server normalization[\s\S]*result[\s\S]*CSV[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-duration-continuity\.test\.ts[\s\S]*source guards/i
  );
});
