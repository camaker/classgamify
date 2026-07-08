import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS,
  buildAssignmentStudentSummarySortHandoffEvidence,
  type AssignmentStudentSummarySortHandoffItemId,
  type AssignmentStudentSummarySortHandoffView,
} from '@/assignments/student-summary-sort-handoff';
import {
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  resolveAssignmentResultViewState,
  sortStudentSummaries,
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

test('assignment student summary sort handoff exposes 30 safe table slices', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildStudentSortHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      sort: 'attempts',
    }),
  });
  const handoffView = pageView.studentSummaryTableView.sortHandoffView;
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS,
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
    exposesCopyArtifactText: false,
    exposesRawAnonymousToken: false,
    exposesRawRouteQuery: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesStudentKeys: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-student-summary-sort',
    usesAssignmentDomainHelpers: true,
    usesSortedTableRows: true,
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['sort-scope', 'Teacher student summary table'],
      ['selected-sort', 'Attempts'],
      ['default-sort', 'Non-default persisted'],
      ['sort-option-count', '5'],
      ['needs-review-order', 'Available'],
      ['best-score-order', 'Available'],
      ['student-name-order', 'Available'],
      ['attempt-count-order', 'Active'],
      ['last-submitted-order', 'Available'],
      ['route-parser', 'parseStudentSummarySort'],
      ['route-default-elision', 'Defaults omitted'],
      ['invalid-route-guard', 'Invalid values cleared'],
      ['control-status', 'Adjusted'],
      [
        'control-description',
        'Put students with the most submitted attempts first.',
      ],
      ['table-row-count', '3'],
      ['matched-student-count', '3/3'],
      ['copy-scope-row-count', '3'],
      ['follow-up-priority-tiebreak', 'Follow-up priority helper'],
      ['best-score-tiebreak', 'Display label'],
      ['attempt-count-tiebreak', 'Display label'],
      ['last-submitted-tiebreak', 'Display label'],
      ['display-label-tiebreak', 'Normalized label'],
      ['missing-date-guard', '0'],
      ['nonfinite-count-guard', '0'],
      ['table-consumer', 'Student summary table'],
      ['review-scope-consumer', 'Result review scope'],
      ['copy-artifact-consumer', 'Current copy scope'],
      ['anonymous-label-guard', 'Hidden'],
      ['student-answer-guard', 'Hidden'],
      ['privacy-guard', 'Hidden'],
    ]
  );
  assert.deepEqual(
    pageView.studentSummaryTableView.rows.map((rowView) => rowView.id),
    pageView.copyActionData?.analysis.students.map(
      (student) => student.studentKey
    )
  );
  assertNoPrivateStudentSummarySortHandoffText(JSON.stringify(handoffView));
});

test('assignment student summary sort handoff localizes Chinese sort state', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentResultsPageViewModel({
    data: buildStudentSortHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      sort: 'last-submitted',
    }),
  }).studentSummaryTableView.sortHandoffView;

  assert.equal(handoffView.title, '学生汇总排序交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(getHandoffValue(handoffView, 'selected-sort'), '最近提交');
  assert.equal(getHandoffValue(handoffView, 'last-submitted-order'), '当前');
  assert.equal(getHandoffValue(handoffView, 'needs-review-order'), '可用');
  assert.equal(getHandoffValue(handoffView, 'control-status'), '已调整');
  assert.equal(getHandoffValue(handoffView, 'table-consumer'), '学生汇总表');
  assert.equal(
    getHandoffValue(handoffView, 'review-scope-consumer'),
    '结果复盘范围'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment student summary sort helpers keep route defaults and guards aligned', () => {
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
        itemSort: ['accuracy'],
        review: 'wrong',
        sort: 'unknown',
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
        sort: 'attempts',
        student: SECRET_STUDENT_LABEL,
      },
      update: {
        control: 'student-sort',
        value: 'needs-review',
      },
    }),
    {
      itemSort: 'submitted',
      review: 'needs-review',
      sort: undefined,
      student: SECRET_STUDENT_LABEL,
    }
  );

  const defaultHandoffView = buildAssignmentResultsPageViewModel({
    data: buildStudentSortHandoffPageData(),
    search: buildAssignmentResultRouteSearch({}),
  }).studentSummaryTableView.sortHandoffView;

  assert.equal(
    getHandoffValue(defaultHandoffView, 'selected-sort'),
    'Needs review'
  );
  assert.equal(
    getHandoffValue(defaultHandoffView, 'default-sort'),
    'Default kept'
  );
  assert.equal(
    getHandoffValue(defaultHandoffView, 'needs-review-order'),
    'Active'
  );
});

test('assignment student summary sort evidence normalizes counts and sort branches', () => {
  overwriteGetLocale(() => 'en');

  const pageData = buildStudentSortHandoffPageData();
  const students = pageData.analysis.students;

  assert.deepEqual(
    sortStudentSummaries(students, 'best').map((student) => student.studentKey),
    ['name:alice-private', 'name:bob', 'anonymous:1']
  );
  assert.deepEqual(
    sortStudentSummaries(students, 'last-submitted').map(
      (student) => student.studentKey
    ),
    ['name:alice-private', 'name:bob', 'anonymous:1']
  );
  assert.deepEqual(
    sortStudentSummaries(students, 'attempts').map(
      (student) => student.studentKey
    ),
    ['name:alice-private', 'anonymous:1', 'name:bob']
  );
  assert.deepEqual(
    buildAssignmentStudentSummarySortHandoffEvidence({
      reviewScopeSummary: {
        attemptReviews: { matched: 1, total: 4 },
        attemptRows: { matched: 2, total: 4 },
        itemPerformance: { matched: 2, total: 3 },
        students: { matched: 3.8, total: Number.NaN },
      },
      sort: 'attempts',
      students,
      tableRowCount: -2,
    }),
    {
      copyScopeRowCount: 3,
      matchedStudentCount: 3,
      sortOptionCount: 5,
      studentSort: 'attempts',
      tableRowCount: 0,
      totalStudentCount: 0,
    }
  );
});

test('assignment student summary sort handoff is rendered as hidden semantic output', () => {
  const handoffSource = readFileSync(
    'src/assignments/student-summary-sort-handoff.ts',
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
    'src/components/assignments/assignment-results-student-summary-table.tsx',
    'utf8'
  );
  const routeSource = readFileSync(
    'src/routes/dashboard/assignments/$assignmentId.tsx',
    'utf8'
  );

  assert.match(
    handoffSource,
    /ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS = \[[\s\S]*'sort-scope'[\s\S]*'attempt-count-order'[\s\S]*'copy-artifact-consumer'[\s\S]*'privacy-guard'/
  );
  assert.match(
    resultFiltersSource,
    /export function sortStudentSummaries[\s\S]*if \(sort === 'best'\)[\s\S]*if \(sort === 'name'\)[\s\S]*if \(sort === 'attempts'\)[\s\S]*if \(sort === 'last-submitted'\)[\s\S]*compareAssignmentStudentsByFollowUpPriority/
  );
  assert.match(
    resultViewSource,
    /buildAssignmentStudentSummaryTableView\(\{[\s\S]*controlView: controlViews\.studentSearch,[\s\S]*reviewScopeSummary: resultView\.reviewScope\.summary,[\s\S]*sort: viewState\.studentSort,[\s\S]*students: resultView\.filteredStudents/
  );
  assert.match(
    tableSource,
    /function AssignmentStudentSummarySortHandoff[\s\S]*const titleId = 'assignment-student-summary-sort-handoff-title'[\s\S]*const descriptionId = 'assignment-student-summary-sort-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-student-summary-sort"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentStudentSummarySortHandoffItem[\s\S]*function AssignmentStudentSummarySortHandoffItem[\s\S]*const labelId = `assignment-student-summary-sort-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-student-summary-sort-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-student-summary-sort-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment student summary sort has a fast script-level gate via[\s\S]*scripts\/assignment-student-summary-sort-handoff-semantic-views\.test\.ts[\s\S]*needs review[\s\S]*assignment-student-summary-sort[\s\S]*handoff/
  );
  assert.match(
    routeSource,
    /AssignmentResultsStudentSearch[\s\S]*AssignmentResultsStudentSummaryTable/
  );
});

function buildStudentSortHandoffPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const aliceLatestAt = new Date('2026-05-04T10:00:00.000Z');
  const aliceFirstAt = new Date('2026-05-03T10:00:00.000Z');
  const bobAt = new Date('2026-05-02T10:00:00.000Z');
  const anonymousAt = new Date('2026-05-01T10:00:00.000Z');

  return {
    activity: {
      description: 'Teacher-owned student summary review.',
      templateType: 'quiz',
      title: 'Student summary review',
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
      expiresAt: new Date('2026-05-10T10:00:00.000Z'),
      id: 'assignment-student-summary-sort-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review the student scan sort.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'student-summary-sort-share-slug',
      status: 'published',
      title: 'Student summary exit ticket',
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
      activityTitle: 'Student summary review snapshot',
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
  view: AssignmentStudentSummarySortHandoffView,
  id: AssignmentStudentSummarySortHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing student summary sort handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateStudentSummarySortHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_STUDENT_LABEL,
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    'student-summary-sort-share-slug',
    'name:alice-private',
    'anonymous:1',
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student summary sort handoff leaked private text: ${privateValue}`
    );
  }
}
