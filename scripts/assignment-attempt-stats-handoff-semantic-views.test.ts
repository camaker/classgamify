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
import {
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  type AssignmentAttemptRowDisplayInput,
  type AssignmentResultsPageData,
} from '@/assignments/result-view';
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

test('assignment result page carries attempt stats handoff without leaking private data', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildStatsHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      student: SECRET_STUDENT_LABEL,
    }),
  });
  const handoffView = pageView.attemptStatsHandoffView;

  assert.equal(getHandoffValue(handoffView, 'source-attempt-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'completed-attempt-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'average-accuracy'), '75%');
  assert.equal(getHandoffValue(handoffView, 'average-points'), '6');
  assert.equal(getHandoffValue(handoffView, 'average-duration'), '1m 30s');
  assert.equal(getHandoffValue(handoffView, 'duration-time-limit'), '180s cap');
  assert.equal(
    pageView.metricItems.find((metric) => metric.key === 'average-accuracy')
      ?.value,
    getHandoffValue(handoffView, 'average-accuracy')
  );
  assert.equal(
    pageView.metricItems.find((metric) => metric.key === 'average-points')
      ?.value,
    getHandoffValue(handoffView, 'average-points')
  );
  assertNoPrivateAttemptStatsHandoffText(JSON.stringify(handoffView));
});

test('assignment attempt stats handoff is wired to shared consumers and hidden route output', () => {
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
  const handoffComponentSource = readFileSync(
    'src/components/assignments/assignment-results-attempt-stats-handoff.tsx',
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
  assert.match(
    resultViewSource,
    /attemptStatsHandoffView: AssignmentAttemptStatsHandoffView[\s\S]*buildAssignmentAttemptStatsHandoffView\(\s*buildAssignmentAttemptStatsHandoffEvidence\(\{[\s\S]*attempts: data\?\.attempts \?\? \[\],[\s\S]*stats: data\?\.stats \?\? null,[\s\S]*timeLimitSeconds:/
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
    handoffComponentSource,
    /function AssignmentResultsAttemptStatsHandoff[\s\S]*const titleId = 'assignment-attempt-stats-handoff-title'[\s\S]*const descriptionId = 'assignment-attempt-stats-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-attempt-stats"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentAttemptStatsHandoffItem[\s\S]*function AssignmentAttemptStatsHandoffItem[\s\S]*const labelId = `assignment-attempt-stats-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-attempt-stats-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-attempt-stats-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment attempt stats has a fast script-level gate via[\s\S]*scripts\/assignment-attempt-stats-handoff-semantic-views\.test\.ts[\s\S]*average accuracy[\s\S]*assignment-attempt-stats handoff/
  );
  assert.match(
    routeSource,
    /AssignmentResultsAttemptStatsHandoff[\s\S]*view=\{pageView\.attemptStatsHandoffView\}/
  );
});

function buildStatsHandoffPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const aliceAt = new Date('2026-04-03T10:00:00.000Z');
  const bobAt = new Date('2026-04-02T10:00:00.000Z');
  const anonymousAt = new Date('2026-04-01T10:00:00.000Z');

  return {
    activity: {
      description: 'Teacher-owned classroom review.',
      templateType: 'quiz',
      title: 'Attempt stats review',
    },
    analysis: {
      attempts: [
        buildAttemptReview({
          accuracy: 50,
          completedAt: aliceAt,
          id: 'attempt-alice',
          score: 5,
          studentKey: 'name:private-student',
          studentLabel: SECRET_STUDENT_LABEL,
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: bobAt,
          id: 'attempt-bob',
          score: 7,
          studentKey: 'name:bob',
          studentLabel: 'Bob',
          variant: 'perfect',
        }),
      ],
      needsReview: [
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-stats-a',
          submittedCount: 2,
          unansweredCount: 0,
        }),
      ],
      perItem: [
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-stats-a',
          submittedCount: 2,
          unansweredCount: 0,
        }),
      ],
      students: [
        {
          attempts: 1,
          averageAccuracy: 50,
          bestAccuracy: 50,
          lastCompletedAt: aliceAt,
          latestAccuracy: 50,
          needsReviewCount: 1,
          studentKey: 'name:private-student',
          studentLabel: SECRET_STUDENT_LABEL,
        },
        {
          attempts: 1,
          averageAccuracy: 100,
          bestAccuracy: 100,
          lastCompletedAt: bobAt,
          latestAccuracy: 100,
          needsReviewCount: 0,
          studentKey: 'name:bob',
          studentLabel: 'Bob',
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-04-10T10:00:00.000Z'),
      id: 'assignment-attempt-stats-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review the stats contract.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 180,
      },
      shareSlug: SECRET_SHARE_SLUG,
      status: 'published',
      title: 'Attempt stats exit ticket',
    },
    attempts: [
      buildAttemptRow({
        accuracy: 50,
        anonymousToken: null,
        completedAt: aliceAt,
        id: 'attempt-alice',
        score: 5,
        studentName: SECRET_STUDENT_LABEL,
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: bobAt,
        id: 'attempt-bob',
        score: 7,
        studentName: 'Bob',
      }),
      {
        anonymousToken: SECRET_RAW_ANONYMOUS_TOKEN,
        completedAt: anonymousAt,
        id: 'attempt-pending',
        maxScore: 10,
        resultJson: null,
        score: null,
        studentName: null,
      },
    ],
    snapshot: {
      activityDescription: 'Frozen classroom activity snapshot.',
      activityTitle: 'Attempt stats review snapshot',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 90,
      averagePoints: 6,
      averageScore: 75,
      completions: 2,
    },
  };
}

function buildAttemptReview({
  accuracy,
  completedAt,
  id,
  score,
  studentKey,
  studentLabel,
  variant = 'needs-review',
}: {
  accuracy: number;
  completedAt: Date;
  id: string;
  score: number;
  studentKey: string;
  studentLabel: string;
  variant?: 'needs-review' | 'perfect';
}) {
  return {
    accuracy,
    answers:
      variant === 'perfect'
        ? [buildAttemptAnswer({ correct: true, itemId: 'item-stats-a' })]
        : [
            buildAttemptAnswer({
              answer: SECRET_STUDENT_ANSWER,
              correct: false,
              itemId: 'item-stats-a',
            }),
          ],
    completedAt,
    durationSeconds: 90,
    id,
    score,
    studentKey,
    studentLabel,
  };
}

function buildAttemptAnswer({
  answer = '2',
  correct,
  itemId,
  submitted = true,
}: {
  answer?: string;
  correct: boolean;
  itemId: string;
  submitted?: boolean;
}) {
  return {
    acceptedAnswers: ['2', SECRET_EXPECTED_ANSWER],
    answer,
    correct,
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    explanation: 'Teacher-only explanation remains outside this handoff.',
    itemId,
    prompt: `${SECRET_PROMPT} ${itemId}`,
    submitted,
  };
}

function buildItemAnalysis({
  correctRate,
  itemId,
  submittedCount,
  unansweredCount,
}: {
  correctRate: number;
  itemId: string;
  submittedCount: number;
  unansweredCount: number;
}) {
  return {
    acceptedAnswers: ['2', SECRET_EXPECTED_ANSWER],
    correctCount: Math.max(0, submittedCount - unansweredCount),
    correctRate,
    explanation: 'Teacher-only explanation remains outside this handoff.',
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    itemId,
    kind: 'question',
    kindLabel: 'Question',
    prompt: `${SECRET_PROMPT} ${itemId}`,
    submittedCount,
    unansweredCount,
  };
}

function buildAttemptRow({
  accuracy,
  anonymousToken,
  completedAt,
  id,
  score,
  studentName,
}: {
  accuracy: number;
  anonymousToken: string | null;
  completedAt: Date;
  id: string;
  score: number;
  studentName: string | null;
}): AssignmentAttemptRowDisplayInput {
  return {
    anonymousToken,
    completedAt,
    id,
    maxScore: 10,
    resultJson: {
      accuracy,
      completedItemCount: 1,
      durationSeconds: 90,
      totalPoints: 10,
    },
    score,
    studentName,
  };
}

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
