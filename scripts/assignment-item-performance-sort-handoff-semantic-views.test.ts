import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS,
  buildAssignmentItemPerformanceSortHandoffEvidence,
  type AssignmentItemPerformanceSortHandoffItemId,
  type AssignmentItemPerformanceSortHandoffView,
} from '@/assignments/item-performance-sort-handoff';
import {
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  resolveAssignmentResultViewState,
  sortItemPerformance,
  type AssignmentAttemptRowDisplayInput,
  type AssignmentResultsPageData,
} from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_STUDENT_LABEL = 'Alice Private';
const SECRET_RAW_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_EXPECTED_ANSWER = 'SECRET_EXPECTED_ANSWER';
const SECRET_PROMPT = 'SECRET_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment item performance sort handoff exposes 30 safe table slices', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildSortHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      itemSort: 'submitted',
      review: 'needs-review',
      sort: 'best',
      student: `  ${SECRET_STUDENT_LABEL}  `,
    }),
  });
  const handoffView = pageView.itemPerformanceTableView.sortHandoffView;
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS,
  ]);
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
    exposesCopyArtifactText: false,
    exposesCsvDataUrl: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesShareSlug: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-item-performance-sort',
    usesAssignmentDomainHelpers: true,
    usesSortedTableRows: true,
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['sort-scope', 'Teacher item performance table'],
      ['selected-sort', 'Most answered'],
      ['default-sort', 'Non-default persisted'],
      ['sort-option-count', '4'],
      ['snapshot-order', 'Available'],
      ['lowest-accuracy-order', 'Available'],
      ['submitted-count-order', 'Active'],
      ['item-type-order', 'Available'],
      ['route-parser', 'parseItemPerformanceSort'],
      ['route-default-elision', 'Defaults omitted'],
      ['invalid-route-guard', 'Invalid values cleared'],
      ['control-status', 'Adjusted'],
      [
        'control-description',
        'Review the prompts with the highest submission volume first.',
      ],
      ['table-row-count', '3'],
      ['matched-item-count', '3/3'],
      ['copy-scope-row-count', '3'],
      ['stable-order-tiebreak', 'Snapshot order'],
      ['submitted-count-tiebreak', 'Lower accuracy, then snapshot order'],
      ['accuracy-tiebreak', 'Review priority helper'],
      ['type-tiebreak', 'Type, then snapshot order'],
      ['zero-count-guard', '0'],
      ['nonfinite-accuracy-guard', '0'],
      ['table-consumer', 'Item performance table'],
      ['review-scope-consumer', 'Result review scope'],
      ['copy-artifact-consumer', 'Current copy scope'],
      ['csv-export-boundary', 'Full export'],
      ['prompt-text-guard', 'Hidden'],
      ['answer-key-guard', 'Hidden'],
      ['student-answer-guard', 'Hidden'],
      ['privacy-guard', 'Hidden'],
    ]
  );
  assert.deepEqual(
    pageView.itemPerformanceTableView.rows.map((rowView) => rowView.id),
    pageView.copyActionData?.analysis.perItem.map((item) => item.itemId)
  );
  assert.deepEqual(
    pageView.itemPerformanceTableView.rows.map((rowView) => rowView.id),
    ['item-fraction', 'item-vocabulary', 'item-listening']
  );
  assertNoPrivateSortHandoffText(JSON.stringify(handoffView));
});

test('assignment item performance sort handoff localizes Chinese sort state', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentResultsPageViewModel({
    data: buildSortHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      itemSort: 'submitted',
      review: 'needs-review',
      sort: 'best',
      student: SECRET_STUDENT_LABEL,
    }),
  }).itemPerformanceTableView.sortHandoffView;

  assert.equal(handoffView.title, '题目表现排序交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(getHandoffValue(handoffView, 'selected-sort'), '最多作答');
  assert.equal(getHandoffValue(handoffView, 'submitted-count-order'), '当前');
  assert.equal(getHandoffValue(handoffView, 'snapshot-order'), '可用');
  assert.equal(getHandoffValue(handoffView, 'control-status'), '已调整');
  assert.equal(getHandoffValue(handoffView, 'table-consumer'), '题目表现表');
  assert.equal(
    getHandoffValue(handoffView, 'review-scope-consumer'),
    '结果复盘范围'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment item performance sort helpers keep route defaults and guards aligned', () => {
  overwriteGetLocale(() => 'en');

  assert.deepEqual(
    buildAssignmentResultRouteSearch({
      itemSort: 'original',
      review: 'all',
      sort: 'needs-review',
      student: '  Ａｌｉｃｅ 　 Ｐｒｉｖａｔｅ  ',
    }),
    {
      itemSort: undefined,
      review: undefined,
      sort: undefined,
      student: SECRET_STUDENT_LABEL,
    }
  );
  assert.deepEqual(
    resolveAssignmentResultViewState(
      buildAssignmentResultRouteSearch({
        itemSort: 'unknown',
        review: 'wrong',
        sort: ['best'],
        student: ['student'],
      })
    ),
    {
      attemptReviewFilter: 'all',
      itemPerformanceSort: 'original',
      studentSearch: '',
      studentSort: 'needs-review',
    }
  );
  assert.deepEqual(
    buildAssignmentResultControlSearchState({
      current: {
        itemSort: 'submitted',
        review: 'needs-review',
        sort: 'best',
        student: SECRET_STUDENT_LABEL,
      },
      update: {
        control: 'item-performance-sort',
        value: 'original',
      },
    }),
    {
      itemSort: undefined,
      review: 'needs-review',
      sort: 'best',
      student: SECRET_STUDENT_LABEL,
    }
  );

  const defaultHandoffView = buildAssignmentResultsPageViewModel({
    data: buildSortHandoffPageData(),
    search: buildAssignmentResultRouteSearch({}),
  }).itemPerformanceTableView.sortHandoffView;

  assert.equal(
    getHandoffValue(defaultHandoffView, 'selected-sort'),
    'Snapshot order'
  );
  assert.equal(
    getHandoffValue(defaultHandoffView, 'default-sort'),
    'Default kept'
  );
  assert.equal(getHandoffValue(defaultHandoffView, 'snapshot-order'), 'Active');
});

test('assignment item performance sort evidence normalizes counts and table sort branches', () => {
  overwriteGetLocale(() => 'en');

  const pageData = buildSortHandoffPageData();
  const abnormalItems = [
    buildItemAnalysis({
      correctRate: Number.NaN,
      itemId: 'item-abnormal-a',
      kind: 'question',
      kindLabel: 'Question',
      submittedCount: Number.POSITIVE_INFINITY,
      unansweredCount: -1,
    }),
    buildItemAnalysis({
      correctRate: 20,
      itemId: 'item-abnormal-b',
      kind: 'listening',
      kindLabel: 'Listening',
      submittedCount: -5,
      unansweredCount: 0,
    }),
  ];

  assert.deepEqual(
    sortItemPerformance(pageData.analysis.perItem, 'accuracy').map(
      (item) => item.itemId
    ),
    ['item-listening', 'item-fraction', 'item-vocabulary']
  );
  assert.deepEqual(
    sortItemPerformance(pageData.analysis.perItem, 'type').map(
      (item) => item.itemId
    ),
    ['item-listening', 'item-fraction', 'item-vocabulary']
  );
  assert.deepEqual(
    sortItemPerformance(abnormalItems, 'submitted').map((item) => item.itemId),
    ['item-abnormal-a', 'item-abnormal-b']
  );
  assert.deepEqual(
    buildAssignmentItemPerformanceSortHandoffEvidence({
      items: pageData.analysis.perItem,
      reviewScopeSummary: {
        attemptReviews: { matched: 1, total: 4 },
        attemptRows: { matched: 2, total: 4 },
        itemPerformance: { matched: 3.8, total: Number.NaN },
        students: { matched: 1, total: 3 },
      },
      sort: 'submitted',
      tableRowCount: -2,
    }),
    {
      copyScopeRowCount: 3,
      itemSort: 'submitted',
      matchedItemCount: 3,
      sortOptionCount: 4,
      tableRowCount: 0,
      totalItemCount: 0,
    }
  );
});

test('assignment item performance sort handoff is rendered as hidden semantic output', () => {
  const handoffSource = readFileSync(
    'src/assignments/item-performance-sort-handoff.ts',
    'utf8'
  );
  const resultFiltersSource = readFileSync(
    'src/assignments/result-filters.ts',
    'utf8'
  );
  const resultViewSource = readFileSync(
    'src/assignments/result-view.ts',
    'utf8'
  );
  const tableSource = readFileSync(
    'src/components/assignments/assignment-results-item-performance-table.tsx',
    'utf8'
  );
  const routeSource = readFileSync(
    'src/routes/dashboard/assignments/$assignmentId.tsx',
    'utf8'
  );

  assert.match(
    handoffSource,
    /ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS = \[[\s\S]*'sort-scope'[\s\S]*'submitted-count-order'[\s\S]*'copy-artifact-consumer'[\s\S]*'privacy-guard'/
  );
  assert.match(
    resultFiltersSource,
    /if \(sort === 'original'\)[\s\S]*if \(sort === 'accuracy'\)[\s\S]*if \(sort === 'submitted'\)[\s\S]*if \(sort === 'type'\)/
  );
  assert.match(
    resultViewSource,
    /buildAssignmentItemPerformanceTableView\(\{[\s\S]*controlView: controlViews\.itemPerformanceSort,[\s\S]*items: resultView\.sortedPerformanceItems,[\s\S]*reviewScopeSummary: resultView\.reviewScope\.summary,[\s\S]*sort: viewState\.itemPerformanceSort/
  );
  assert.match(
    tableSource,
    /function AssignmentItemPerformanceSortHandoff[\s\S]*const titleId = 'assignment-item-performance-sort-handoff-title'[\s\S]*const descriptionId = 'assignment-item-performance-sort-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-item-performance-sort"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentItemPerformanceSortHandoffItem[\s\S]*function AssignmentItemPerformanceSortHandoffItem[\s\S]*const labelId = `assignment-item-performance-sort-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-item-performance-sort-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-item-performance-sort-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment item performance sort has a fast script-level gate via[\s\S]*scripts\/assignment-item-performance-sort-handoff-semantic-views\.test\.ts[\s\S]*snapshot order[\s\S]*assignment-item-performance-sort[\s\S]*handoff/
  );
  assert.match(
    routeSource,
    /AssignmentResultsItemPerformanceSortControl[\s\S]*AssignmentResultsItemPerformanceTable/
  );
});

function buildSortHandoffPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const aliceLatestAt = new Date('2026-03-04T10:00:00.000Z');
  const aliceFirstAt = new Date('2026-03-03T10:00:00.000Z');
  const bobAt = new Date('2026-03-02T10:00:00.000Z');
  const anonymousAt = new Date('2026-03-01T10:00:00.000Z');

  return {
    activity: {
      description: 'Teacher-owned fractions review.',
      templateType: 'quiz',
      title: 'Fractions review',
    },
    analysis: {
      attempts: [
        buildAttemptReview({
          accuracy: 50,
          completedAt: aliceLatestAt,
          id: 'attempt-alice-latest',
          score: 1,
          studentKey: 'name:alice-private',
          studentLabel: SECRET_STUDENT_LABEL,
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: aliceFirstAt,
          id: 'attempt-alice-first',
          score: 2,
          studentKey: 'name:alice-private',
          studentLabel: SECRET_STUDENT_LABEL,
          variant: 'perfect',
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: bobAt,
          id: 'attempt-bob',
          score: 2,
          studentKey: 'name:bob',
          studentLabel: 'Bob',
          variant: 'perfect',
        }),
        buildAttemptReview({
          accuracy: 0,
          completedAt: anonymousAt,
          id: 'attempt-anonymous',
          score: 0,
          studentKey: 'anonymous:1',
          studentLabel: 'Anonymous student 1',
          variant: 'empty',
        }),
      ],
      needsReview: [
        buildItemAnalysis({
          correctRate: 0,
          itemId: 'item-listening',
          kind: 'listening',
          kindLabel: 'Listening',
          submittedCount: 2,
          unansweredCount: 2,
        }),
      ],
      perItem: [
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-fraction',
          kind: 'question',
          kindLabel: 'Question',
          submittedCount: 4,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctRate: 100,
          itemId: 'item-vocabulary',
          kind: 'question',
          kindLabel: 'Question',
          submittedCount: 3,
          unansweredCount: 1,
        }),
        buildItemAnalysis({
          correctRate: 0,
          itemId: 'item-listening',
          kind: 'listening',
          kindLabel: 'Listening',
          submittedCount: 2,
          unansweredCount: 2,
        }),
      ],
      students: [
        {
          attempts: 2,
          averageAccuracy: 75,
          bestAccuracy: 100,
          lastCompletedAt: aliceLatestAt,
          latestAccuracy: 50,
          needsReviewCount: 1,
          studentKey: 'name:alice-private',
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
        {
          attempts: 1,
          averageAccuracy: 0,
          bestAccuracy: 0,
          lastCompletedAt: anonymousAt,
          latestAccuracy: 0,
          needsReviewCount: 2,
          studentKey: 'anonymous:1',
          studentLabel: 'Anonymous student 1',
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-03-10T10:00:00.000Z'),
      id: 'assignment-item-performance-sort-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review the result sort.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'item-performance-sort-share-slug',
      status: 'published',
      title: 'Fractions exit ticket',
    },
    attempts: [
      buildAttemptRow({
        accuracy: 50,
        anonymousToken: null,
        completedAt: aliceLatestAt,
        id: 'attempt-alice-latest',
        score: 1,
        studentName: SECRET_STUDENT_LABEL,
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: aliceFirstAt,
        id: 'attempt-alice-first',
        score: 2,
        studentName: SECRET_STUDENT_LABEL,
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: bobAt,
        id: 'attempt-bob',
        score: 2,
        studentName: 'Bob',
      }),
      buildAttemptRow({
        accuracy: 0,
        anonymousToken: SECRET_RAW_ANONYMOUS_TOKEN,
        completedAt: anonymousAt,
        id: 'attempt-anonymous',
        score: 0,
        studentName: null,
      }),
    ],
    snapshot: {
      activityDescription: 'Frozen classroom activity snapshot.',
      activityTitle: 'Fractions review snapshot',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 60,
      averagePoints: 1.25,
      averageScore: 63,
      completions: 4,
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
  variant?: 'empty' | 'needs-review' | 'perfect';
}) {
  return {
    accuracy,
    answers:
      variant === 'perfect'
        ? [
            buildAttemptAnswer({ correct: true, itemId: 'item-fraction' }),
            buildAttemptAnswer({ correct: true, itemId: 'item-vocabulary' }),
          ]
        : variant === 'empty'
          ? [
              buildAttemptAnswer({
                answer: '',
                correct: false,
                itemId: 'item-fraction',
                submitted: false,
              }),
              buildAttemptAnswer({
                answer: '',
                correct: false,
                itemId: 'item-listening',
                submitted: false,
              }),
            ]
          : [
              buildAttemptAnswer({ correct: true, itemId: 'item-fraction' }),
              buildAttemptAnswer({
                answer: SECRET_STUDENT_ANSWER,
                correct: false,
                itemId: 'item-listening',
              }),
            ],
    completedAt,
    durationSeconds: 55,
    id,
    score,
    studentKey,
    studentLabel,
  };
}

function buildAttemptAnswer({
  answer = '1/2',
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
    acceptedAnswers: ['1/2', SECRET_EXPECTED_ANSWER],
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
  kind,
  kindLabel,
  submittedCount,
  unansweredCount,
}: {
  correctRate: number;
  itemId: string;
  kind: 'listening' | 'question';
  kindLabel: string;
  submittedCount: number;
  unansweredCount: number;
}) {
  return {
    acceptedAnswers: ['1/2', SECRET_EXPECTED_ANSWER],
    correctCount: Math.max(0, submittedCount - unansweredCount),
    correctRate,
    explanation: 'Teacher-only explanation remains outside this handoff.',
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    itemId,
    kind,
    kindLabel,
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
    maxScore: 2,
    resultJson: {
      accuracy,
      completedItemCount: score,
      durationSeconds: 55,
      totalPoints: 2,
    },
    score,
    studentName,
  };
}

function getHandoffValue(
  view: AssignmentItemPerformanceSortHandoffView,
  id: AssignmentItemPerformanceSortHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing item performance sort handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateSortHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_STUDENT_LABEL,
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    'item-performance-sort-share-slug',
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Item performance sort handoff leaked private text: ${privateValue}`
    );
  }
}
