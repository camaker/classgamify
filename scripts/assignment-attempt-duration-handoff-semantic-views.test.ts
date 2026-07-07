import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildAttemptDurationDisplayView,
  buildAttemptStartedAt,
  buildAttemptTimerState,
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
  normalizeAttemptTimeLimitSeconds,
  resolveAttemptSubmissionDurationSeconds,
  ASSIGNMENT_ATTEMPT_DURATION_UNITS,
} from '@/assignments/attempt-duration';
import {
  buildStudentAttemptControlState,
  buildStudentAttemptResultDisplay,
  buildStudentAttemptSubmissionPlan,
  buildStudentAttemptTimerBadge,
} from '@/assignments/student-submission';
import {
  buildStudentRunnerAttemptClockStartPlan,
  buildStudentRunnerTimerTickPlan,
} from '@/assignments/student-runner-state';
import {
  ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptDurationHandoffView,
  type AssignmentAttemptDurationHandoffEvidence,
  type AssignmentAttemptDurationHandoffItemId,
  type AssignmentAttemptDurationHandoffView,
} from '@/assignments/attempt-duration-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_ANONYMOUS_TOKEN = 'raw-anonymous-browser-token';
const SECRET_RUNTIME_ITEM_ID = 'private-runtime-item-id';
const SECRET_STUDENT_NAME = 'Private Student';
const SECRET_TEACHER_ANSWER = 'SECRET_TEACHER_ANSWER';

const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_DURATION_SOURCE = readFileSync(
  'src/attempts/duration.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync('src/routes/play/$shareId.tsx', 'utf8');
const RUNNER_STATE_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const EVIDENCE = buildAttemptDurationEvidence();

test('assignment attempt duration handoff exposes 30 safe timer slices', () => {
  const handoffView = buildAssignmentAttemptDurationHandoffView(EVIDENCE);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawStartedAt: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    mutatesAttempts: false,
    readsBrowserStorage: false,
    scope: 'assignment-attempt-duration-boundary',
    usesSharedDurationHelpers: true,
  });
  assertNoPrivateAttemptDurationText(JSON.stringify(handoffView));
});

test('assignment attempt duration handoff summarizes normalized timer state', () => {
  const handoffView = buildAssignmentAttemptDurationHandoffView(EVIDENCE);

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['duration-unit-contract', '1000 ms / 60 s'],
      ['time-limit-normalization', '90s'],
      ['duration-rounding', '46s'],
      ['duration-cap', '90s'],
      ['negative-duration-guard', '0s'],
      ['nonfinite-duration-guard', 'Ignored'],
      ['zero-duration-display', '-'],
      ['readable-format', '1m 30s'],
      ['timer-format', '1:30'],
      ['display-view', '46s'],
      ['capped-display-view', '1:30'],
      ['timer-state-elapsed', '45s'],
      ['timer-state-remaining', '45s'],
      ['timer-state-expiry', 'Expired at 90s'],
      ['started-at-derivation', '90s before completion'],
      ['submission-duration-resolution', '90s'],
      ['submission-input-duration', '90s submitted'],
      ['runner-clock-start-plan', 'After load'],
      ['route-clock-effect', 'Ready'],
      ['runner-tick-plan', '1000ms tick'],
      ['timer-badge', '45s remaining'],
      ['time-expired-control', 'Disabled'],
      ['start-handoff-boundary', 'Ready'],
      ['submission-handoff-boundary', 'Ready'],
      ['result-display-boundary', 'Time: 1:30'],
      ['result-analysis-boundary', 'Ready'],
      ['result-view-boundary', 'Ready'],
      ['export-average-duration', 'Ready'],
      ['export-attempt-duration', 'Ready'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateAttemptDurationText(JSON.stringify(handoffView));
});

test('assignment attempt duration handoff localizes Chinese timer boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAssignmentAttemptDurationHandoffView(
      buildAttemptDurationEvidence()
    );

    assert.equal(handoffView.title, '作答计时与用时交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(getHandoffValue(handoffView, 'duration-rounding'), '46 秒');
    assert.equal(getHandoffValue(handoffView, 'timer-format'), '1:30');
    assert.equal(
      getHandoffValue(handoffView, 'runner-clock-start-plan'),
      '加载后'
    );
    assert.equal(getHandoffValue(handoffView, 'timer-badge'), '45 秒剩余');
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateAttemptDurationText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('assignment attempt duration evidence comes from shared runner and result helpers', () => {
  assert.deepEqual(EVIDENCE.durationUnits, {
    millisecondsPerSecond: 1000,
    secondsPerMinute: 60,
    timerSecondPaddingLength: 2,
  });
  assert.equal(EVIDENCE.normalizedTimeLimitSeconds, 90);
  assert.equal(EVIDENCE.durationRoundedSeconds, 46);
  assert.equal(EVIDENCE.cappedDurationSeconds, 90);
  assert.equal(EVIDENCE.nonFiniteDurationRecorded, false);
  assert.equal(EVIDENCE.runnerClockStartPlanType, 'start');
  assert.equal(EVIDENCE.runnerTickPlanType, 'tick');
  assert.equal(EVIDENCE.runnerTickIntervalMs, 1000);
  assert.equal(EVIDENCE.routeUsesClockStartPlan, true);
  assert.equal(EVIDENCE.startHandoffHasTimerBoundary, true);
  assert.equal(EVIDENCE.submissionHandoffHasAttemptDuration, true);
  assert.equal(EVIDENCE.resultAnalysisUsesDurationHelper, true);
  assert.equal(EVIDENCE.resultViewUsesDisplayContract, true);
  assert.equal(EVIDENCE.exportAverageUsesDisplayContract, true);
  assert.equal(EVIDENCE.exportAttemptUsesDisplayContract, true);
  assertNoPrivateAttemptDurationText(JSON.stringify(EVIDENCE));
});

test('assignment attempt duration submit path normalizes before scoring and persistence', () => {
  assert.match(
    ATTEMPT_DURATION_SOURCE,
    /export function normalizeAttemptDurationSeconds[\s\S]*Math\.round\(durationSeconds\)[\s\S]*normalizeAttemptTimeLimitSeconds\(timeLimitSeconds\)[\s\S]*Math\.min\(normalizedDuration, normalizedTimeLimit\)/,
    'Attempt duration helper should round submitted seconds and cap them at the normalized timer.'
  );

  const apiDurationBeforeScoringAndPersistence = new RegExp(
    [
      'const settings = resolveAssignmentSettings\\(',
      'const durationSeconds = normalizeAttemptDurationSeconds\\(\\{',
      'durationSeconds: data\\.durationSeconds,',
      'timeLimitSeconds: settings\\.timeLimitSeconds,',
      '\\}\\);',
      'const evaluation = evaluateRuntimeAnswers\\(\\{',
      'durationSeconds,',
      'const startedAt = buildAttemptStartedAt\\(\\{',
      'durationSeconds,',
      'buildScoredAttemptInsert\\(\\{',
      'evaluation,',
    ].join('[\\s\\S]*')
  );

  assert.match(
    API_ASSIGNMENTS_SOURCE,
    apiDurationBeforeScoringAndPersistence,
    'Submit attempt API should normalize the browser duration with assignment timer settings before scoring, startedAt derivation, and scored-attempt persistence.'
  );
});

test('assignment attempt duration focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-attempt-duration-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point duration work at the focused script gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /timer start plans[\s\S]*submission duration normalization[\s\S]*result duration labels[\s\S]*CSV[\s\S]*duration fields/,
    'E2E catalog should say which duration product boundaries need the focused gate.'
  );
});

function buildAttemptDurationEvidence(): AssignmentAttemptDurationHandoffEvidence {
  const normalizedTimeLimitSeconds = normalizeAttemptTimeLimitSeconds(90.8);
  const durationRoundedSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: 45.6,
  });
  const cappedDurationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: 95.4,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const negativeDurationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: -12,
  });
  const nonFiniteDurationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: Number.NaN,
  });
  const displayView = buildAttemptDurationDisplayView({
    durationSeconds: durationRoundedSeconds,
    style: 'timer',
  });
  const cappedDisplayView = buildAttemptDurationDisplayView({
    durationSeconds: 95.4,
    style: 'timer',
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const timerState = buildAttemptTimerState({
    now: 45_000,
    startedAt: 0,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const expiredTimerState = buildAttemptTimerState({
    now: 120_000,
    startedAt: 0,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const completedAt = new Date('2026-07-05T00:02:00.000Z');
  const startedAt = buildAttemptStartedAt({
    completedAt,
    durationSeconds: cappedDurationSeconds,
  });
  const submissionDurationSeconds = resolveAttemptSubmissionDurationSeconds({
    now: 120_000,
    startedAt: 0,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const submissionPlan = buildStudentAttemptSubmissionPlan({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
    },
    canSubmit: true,
    collectStudentName: false,
    completionSummary: {
      answeredItemCount: 1,
      itemCount: 1,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: false,
    createAnonymousToken: () => SECRET_ANONYMOUS_TOKEN,
    now: 120_000,
    runtimeItems: [
      {
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'question',
        prompt: SECRET_TEACHER_ANSWER,
      },
    ],
    shareSlug: 'duration-class-link',
    startedAt: 0,
    studentName: SECRET_STUDENT_NAME,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  assert.equal(submissionPlan.type, 'submit');

  const clockStartPlan = buildStudentRunnerAttemptClockStartPlan({
    activeShareId: 'duration-class-link',
    canSubmit: true,
    hasResult: false,
    now: 1000,
  });
  const tickPlan = buildStudentRunnerTimerTickPlan({
    activeShareId: 'duration-class-link',
    attemptClock: {
      shareId: 'duration-class-link',
      startedAt: 1000,
    },
    canSubmit: true,
    hasResult: false,
    timeExpired: false,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const timerBadge = buildStudentAttemptTimerBadge({
    remainingSeconds: timerState.remainingSeconds,
    timeExpired: timerState.timeExpired,
    timeLimitSeconds: normalizedTimeLimitSeconds,
  });
  const expiredControlState = buildStudentAttemptControlState({
    canSubmit: true,
    hasResult: false,
    isSubmitting: false,
    timeExpired: true,
  });
  const resultDisplay = buildStudentAttemptResultDisplay({
    accuracy: 100,
    durationSeconds: cappedDurationSeconds,
    earnedPoints: 1,
    totalPoints: 1,
  });

  return {
    cappedDisplayLabel: cappedDisplayView.label,
    cappedDurationSeconds,
    displayLabel: displayView.label,
    durationRoundedSeconds,
    durationUnits: ASSIGNMENT_ATTEMPT_DURATION_UNITS,
    expiredDurationSeconds: expiredTimerState.durationSeconds,
    expiredStateTimeExpired: expiredTimerState.timeExpired,
    exportAttemptUsesDisplayContract:
      /function buildAssignmentResultsExportAttemptDurationView[\s\S]*buildAttemptDurationDisplayView/.test(
        RESULTS_EXPORT_SOURCE
      ),
    exportAverageUsesDisplayContract:
      /averageDurationView = buildAttemptDurationDisplayView/.test(
        RESULTS_EXPORT_SOURCE
      ),
    nonFiniteDurationRecorded: nonFiniteDurationSeconds !== undefined,
    normalizedTimeLimitSeconds,
    negativeDurationSeconds,
    privacyGuardsPrivateData: true,
    readableDurationLabel: formatAttemptDuration(cappedDurationSeconds),
    resultAnalysisUsesDurationHelper:
      /normalizeAttemptDurationSeconds\(\{[\s\S]*timeLimitSeconds/.test(
        RESULTS_SOURCE
      ),
    resultDisplayDurationLabel: resultDisplay.durationLabel,
    resultViewUsesDisplayContract: /buildAttemptDurationDisplayView/.test(
      RESULT_VIEW_SOURCE
    ),
    routeUsesClockStartPlan: /buildStudentRunnerAttemptClockStartPlan/.test(
      ROUTE_SOURCE
    ),
    runnerClockStartPlanType: clockStartPlan.type,
    runnerTickIntervalMs: tickPlan.type === 'tick' ? tickPlan.intervalMs : 0,
    runnerTickPlanType: tickPlan.type,
    startHandoffHasTimerBoundary: /'timer-start-boundary'/.test(
      RUNNER_STATE_SOURCE
    ),
    startedAtDeltaSeconds: (completedAt.getTime() - startedAt.getTime()) / 1000,
    submissionDurationSeconds,
    submissionHandoffHasAttemptDuration: /id: 'attempt-duration'/.test(
      RUNNER_STATE_SOURCE
    ),
    submissionInputDurationSeconds: submissionPlan.input.durationSeconds,
    timeExpiredControlsDisabled: expiredControlState.submitDisabled,
    timeExpiredNoticeShown: expiredControlState.showTimeExpiredMessage,
    timerBadgeLabel: timerBadge.label,
    timerBadgeShows: timerBadge.show,
    timerDurationLabel: formatAttemptDuration(cappedDurationSeconds, {
      style: 'timer',
    }),
    timerStateElapsedSeconds: timerState.elapsedSeconds,
    timerStateRemainingSeconds: timerState.remainingSeconds,
    zeroDurationLabel: formatAttemptDuration(0),
  };
}

function getHandoffValue(
  view: AssignmentAttemptDurationHandoffView,
  id: AssignmentAttemptDurationHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing handoff item: ${id}`);
  return item.value;
}

function assertNoPrivateAttemptDurationText(serialized: string) {
  for (const secret of [
    SECRET_ANSWER_TEXT,
    SECRET_ANONYMOUS_TOKEN,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_STUDENT_NAME,
    SECRET_TEACHER_ANSWER,
  ]) {
    assert.equal(
      serialized.includes(secret),
      false,
      `Leaked private attempt-duration text: ${secret}`
    );
  }
}
