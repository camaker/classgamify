import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS,
  buildAssignmentResultStudentSearchHandoffEvidence,
  type AssignmentResultStudentSearchHandoffItemId,
  type AssignmentResultStudentSearchHandoffView,
} from '@/assignments/result-student-search-handoff';
import {
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  resolveAssignmentResultViewState,
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

test('assignment result student search handoff exposes 30 safe search slices', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildStudentSearchHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      review: 'needs-review',
      student: `  ${SECRET_STUDENT_LABEL}  `,
    }),
  });
  const handoffView = pageView.studentSearchHandoffView;
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS,
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
    exposesAnswerReviewText: false,
    exposesCopyArtifactText: false,
    exposesRawAnonymousToken: false,
    exposesRawRouteQuery: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesStudentKeys: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-student-search',
    usesAssignmentDomainHelpers: true,
    usesCurrentReviewScope: true,
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['search-scope', 'Teacher result student search'],
      ['route-parser', 'parseResultStudentSearch'],
      ['route-update-helper', 'buildAssignmentResultControlSearchState'],
      ['query-normalization', 'normalizeResultSearchQuery'],
      ['width-normalization', 'NFKC'],
      ['whitespace-collapse', 'Whitespace collapsed'],
      ['route-default-elision', 'Defaults omitted'],
      ['invalid-route-guard', 'Invalid values cleared'],
      ['control-status', 'Adjusted'],
      [
        'control-description',
        'Which students and attempts are included in the visible result tables.',
      ],
      ['resolved-search', 'Search applied'],
      ['total-students', '3'],
      ['matched-students', '1/3'],
      ['matched-attempt-rows', '2/4'],
      ['matched-answer-reviews', '1/4'],
      ['matched-copy-students', '1'],
      ['matched-copy-attempts', '1'],
      ['student-empty-state', 'Ready'],
      ['attempt-empty-state', 'Ready'],
      ['answer-review-empty-state', 'Ready'],
      ['anonymous-label-search', 'Normalized labels only'],
      ['named-label-search', 'Normalized labels'],
      ['student-table-consumer', 'Student summary table'],
      ['attempt-table-consumer', 'Attempt rows'],
      ['answer-review-consumer', 'Answer review cards'],
      ['review-scope-consumer', 'Current review scope'],
      ['copy-artifact-consumer', 'Current copy scope'],
      ['raw-query-guard', 'Hidden'],
      ['student-answer-guard', 'Hidden'],
      ['privacy-guard', 'Hidden'],
    ]
  );
  assert.equal(pageView.studentSummaryTableView.rows.length, 1);
  assert.equal(pageView.attemptTableView.rows.length, 2);
  assert.equal(pageView.attemptReviewCardViews.length, 1);
  assert.equal(pageView.copyActionData?.analysis.students.length, 1);
  assert.equal(pageView.copyActionData?.analysis.attempts.length, 1);
  assertNoPrivateStudentSearchHandoffText(JSON.stringify(handoffView));
});

test('assignment result student search handoff localizes Chinese scope state', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentResultsPageViewModel({
    data: buildStudentSearchHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      review: 'needs-review',
      student: SECRET_STUDENT_LABEL,
    }),
  }).studentSearchHandoffView;

  assert.equal(handoffView.title, '学生搜索交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(getHandoffValue(handoffView, 'resolved-search'), '已应用搜索');
  assert.equal(getHandoffValue(handoffView, 'control-status'), '已调整');
  assert.equal(getHandoffValue(handoffView, 'matched-students'), '1/3');
  assert.equal(getHandoffValue(handoffView, 'student-empty-state'), '就绪');
  assert.equal(
    getHandoffValue(handoffView, 'copy-artifact-consumer'),
    '当前复制范围'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment result student search helpers keep route and empty states aligned', () => {
  overwriteGetLocale(() => 'en');

  assert.deepEqual(
    buildAssignmentResultRouteSearch({
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: '  Ａｌｉｃｅ 　 Ｐｒｉｖａｔｅ  ',
    }),
    {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: SECRET_STUDENT_LABEL,
    }
  );
  assert.deepEqual(
    resolveAssignmentResultViewState(
      buildAssignmentResultRouteSearch({
        review: 'wrong',
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
        itemSort: 'accuracy',
        review: 'needs-review',
        sort: 'best',
        student: SECRET_STUDENT_LABEL,
      },
      update: {
        control: 'student-search',
        value: '',
      },
    }),
    {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: undefined,
    }
  );
  assert.deepEqual(
    buildAssignmentResultStudentSearchHandoffEvidence({
      search: 'nobody',
      summary: {
        attemptReviews: { matched: 0, total: 4 },
        attemptRows: { matched: 0, total: 4 },
        itemPerformance: { matched: 3.8, total: Number.NaN },
        students: { matched: -2, total: 3.4 },
      },
    }),
    {
      answerReviewEmptyState: 'search-no-matches',
      attemptEmptyState: 'search-no-matches',
      copyAttemptCount: 0,
      copyStudentCount: 0,
      hasNormalizedSearch: true,
      matchedAnswerReviewCount: 0,
      matchedAttemptRowCount: 0,
      matchedStudentCount: 0,
      normalizedSearchHidden: true,
      rawQueryHidden: true,
      studentEmptyState: 'search-no-matches',
      totalAnswerReviewCount: 4,
      totalAttemptRowCount: 4,
      totalStudentCount: 3,
    }
  );
});

test('assignment result student search handoff is rendered beside the search control', () => {
  const componentSource = readFileSync(
    'src/components/assignments/assignment-results-student-search.tsx',
    'utf8'
  );
  const routeSource = readFileSync(
    'src/routes/dashboard/assignments/$assignmentId.tsx',
    'utf8'
  );
  const resultViewSource = readFileSync(
    'src/assignments/result-view.ts',
    'utf8'
  );

  assert.match(
    componentSource,
    /function AssignmentResultStudentSearchHandoff[\s\S]*const titleId = 'assignment-result-student-search-handoff-title'[\s\S]*const descriptionId = 'assignment-result-student-search-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-result-student-search"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentResultStudentSearchHandoffItem[\s\S]*function AssignmentResultStudentSearchHandoffItem[\s\S]*const labelId = `assignment-result-student-search-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-result-student-search-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-result-student-search-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment result student search has a fast script-level gate via[\s\S]*scripts\/assignment-result-student-search-handoff-semantic-views\.test\.ts[\s\S]*query[\s\S]*normalization[\s\S]*assignment-result-student-search[\s\S]*handoff/
  );
  assert.match(
    routeSource,
    /searchHandoffView=\{pageView\.studentSearchHandoffView\}/
  );
  assert.match(
    resultViewSource,
    /buildAssignmentResultStudentSearchHandoffView\(\{[\s\S]*search: viewState\.studentSearch,[\s\S]*searchDescription: controlViews\.studentSearch\.searchDescription,[\s\S]*summary: resultView\.reviewScope\.summary/
  );
});

function buildStudentSearchHandoffPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const aliceLatestAt = new Date('2026-06-04T10:00:00.000Z');
  const aliceFirstAt = new Date('2026-06-03T10:00:00.000Z');
  const bobAt = new Date('2026-06-02T10:00:00.000Z');
  const anonymousAt = new Date('2026-06-01T10:00:00.000Z');

  return {
    activity: {
      description: 'Teacher-owned result search review.',
      templateType: 'quiz',
      title: 'Result search review',
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
      expiresAt: new Date('2026-06-10T10:00:00.000Z'),
      id: 'assignment-student-search-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review the searched student scope.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'student-search-share-slug',
      status: 'published',
      title: 'Student search exit ticket',
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
      activityTitle: 'Student search snapshot',
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
  view: AssignmentResultStudentSearchHandoffView,
  id: AssignmentResultStudentSearchHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing result student search handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateStudentSearchHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_STUDENT_LABEL,
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    'student-search-share-slug',
    'name:alice-private',
    'anonymous:1',
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Result student search handoff leaked private text: ${privateValue}`
    );
  }
}
