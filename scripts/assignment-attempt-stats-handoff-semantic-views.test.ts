import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptStatsHandoffEvidence,
  buildAssignmentAttemptStatsHandoffView,
  type AssignmentAttemptStatsHandoffItemId,
  type AssignmentAttemptStatsHandoffView,
} from '@/assignments/attempt-stats-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_STUDENT_LABEL = 'Private Student';
const SECRET_RAW_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_EXPECTED_ANSWER = 'SECRET_EXPECTED_ANSWER';
const SECRET_PROMPT = 'SECRET_PROMPT';
const SECRET_SHARE_SLUG = 'stats-share-slug';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment attempt stats handoff exposes 30 safe shared metric slices', () => {
  overwriteGetLocale(() => 'en');

  const handoffView = buildAssignmentAttemptStatsHandoffView(
    buildAssignmentAttemptStatsHandoffEvidence({
      attempts: [
        {
          resultJson: {
            accuracy: 80,
            durationSeconds: 40,
            earnedPoints: 7,
            totalPoints: 10,
          },
          score: 8,
        },
        {
          resultJson: {
            accuracy: 50,
            durationSeconds: 200,
            earnedPoints: 5,
            totalPoints: 10,
          },
          score: null,
        },
        {
          resultJson: {
            accuracy: 110,
            durationSeconds: -5,
            earnedPoints: 12,
            totalPoints: 10,
          },
          score: 999,
        },
        {
          resultJson: null,
          score: null,
        },
      ],
      timeLimitSeconds: 120,
    })
  );
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    handoffView.itemViews.every(
      (itemView) =>
        itemView.ariaLabel &&
        itemView.description &&
        itemView.label &&
        itemView.value
    )
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAcceptedAnswers: false,
    exposesCsvDataUrl: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesRuntimeItemIds: false,
    exposesShareSlug: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-attempt-stats',
    usesAssignmentDomainHelpers: true,
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['stats-scope', 'Assignment attempt metrics'],
      ['source-attempt-count', '4'],
      ['completed-attempt-count', '3'],
      ['completion-filter', 'Scored resultJson only'],
      ['average-accuracy', '77%'],
      ['average-points', '8'],
      ['average-duration', '53s'],
      ['duration-normalization', 'normalizeAttemptDurationSeconds'],
      ['duration-time-limit', '120s cap'],
      ['points-score-source', 'Stored score first'],
      ['earned-points-fallback', 'Result earnedPoints fallback'],
      ['percent-boundary', '0-100%'],
      ['points-boundary', '0-totalPoints'],
      ['completion-boundary', 'Whole attempts'],
      ['empty-state', 'Averages hidden'],
      ['nonfinite-number-guard', 'Hidden'],
      ['negative-number-guard', '0'],
      ['fractional-count-guard', '2'],
      ['result-metric-consumer', 'Result metric cards'],
      ['assignment-list-summary-consumer', 'Assignment list summary'],
      ['assignment-card-consumer', 'Assignment cards'],
      ['classroom-brief-consumer', 'Classroom brief'],
      ['copy-artifact-consumer', 'Copy artifacts'],
      ['csv-export-consumer', 'CSV export'],
      ['duration-display-consumer', 'buildAttemptDurationDisplayView'],
      ['settings-time-limit-source', 'Delivery settings'],
      ['by-assignment-grouping', 'summarizeAssignmentAttemptsByAssignmentId'],
      ['normalization-helper', 'buildAssignmentAttemptStatsView'],
      ['student-data-guard', 'Hidden'],
      ['privacy-guard', 'Hidden'],
    ]
  );
  assertNoPrivateAttemptStatsHandoffText(JSON.stringify(handoffView));
});

test('assignment attempt stats handoff localizes Chinese metric boundaries', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentAttemptStatsHandoffView(
    buildAssignmentAttemptStatsHandoffEvidence({
      stats: {
        averageDurationSeconds: 150,
        averagePoints: 6,
        averageScore: 88,
        completions: 12,
      },
      timeLimitSeconds: 180,
    })
  );

  assert.equal(handoffView.title, '作答统计指标交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(getHandoffValue(handoffView, 'stats-scope'), '作业作答指标');
  assert.equal(getHandoffValue(handoffView, 'completed-attempt-count'), '12');
  assert.equal(getHandoffValue(handoffView, 'average-accuracy'), '88%');
  assert.equal(
    getHandoffValue(handoffView, 'duration-time-limit'),
    '180 秒上限'
  );
  assert.equal(
    getHandoffValue(handoffView, 'result-metric-consumer'),
    '结果指标卡'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment attempt stats stay wired to shared consumers', () => {
  const handoffSource = readFileSync(
    'src/assignments/attempt-stats-handoff.ts',
    'utf8'
  );
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
    handoffSource,
    /ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS = \[[\s\S]*'stats-scope'[\s\S]*'average-duration'[\s\S]*'csv-export-consumer'[\s\S]*'privacy-guard'/
  );
  assert.match(
    handoffSource,
    /buildAssignmentAttemptStatsHandoffEvidence[\s\S]*summarizeAssignmentAttempts[\s\S]*normalizeAssignmentAttemptStats[\s\S]*buildAssignmentAttemptStatsView/
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
    /Assignment attempt stats has a fast script-level gate via[\s\S]*scripts\/assignment-attempt-stats-handoff-semantic-views\.test\.ts[\s\S]*average accuracy[\s\S]*assignment-attempt-stats handoff/
  );
  assert.doesNotMatch(
    routeSource,
    /AssignmentResultsAttemptStatsHandoff|attemptStatsHandoffView/,
    'The results page should not render the hidden attempt stats section.'
  );
});

function getHandoffValue(
  view: AssignmentAttemptStatsHandoffView,
  id: AssignmentAttemptStatsHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing assignment attempt stats handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateAttemptStatsHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_STUDENT_LABEL,
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_SHARE_SLUG,
    SECRET_STUDENT_ANSWER,
    'item-stats-a',
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Attempt stats handoff leaked private text: ${privateValue}`
    );
  }
}
