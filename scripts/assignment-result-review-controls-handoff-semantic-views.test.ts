import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_RESULT_REVIEW_CONTROLS_HANDOFF_ITEM_IDS,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  resolveAssignmentResultViewState,
  type AssignmentAttemptRowDisplayInput,
  type AssignmentResultReviewControlsHandoffItemId,
  type AssignmentResultReviewControlsHandoffView,
  type AssignmentResultsPageData,
} from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_STUDENT_LABEL = 'Alice Private';
const SECRET_RAW_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_EXPECTED_ANSWER = 'SECRET_EXPECTED_ANSWER';
const SECRET_PROMPT = 'SECRET_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment result review controls handoff exposes 30 safe scope slices', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildControlsHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: `  ${SECRET_STUDENT_LABEL}  `,
    }),
  });
  const handoffView = pageView.reviewControlsHandoffView;
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULT_REVIEW_CONTROLS_HANDOFF_ITEM_IDS,
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
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-review-controls',
    usesAssignmentDomainHelpers: true,
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['route-parser', 'buildAssignmentResultRouteSearch'],
      ['route-update-helper', 'buildAssignmentResultControlSearchState'],
      ['route-default-elision', 'Defaults omitted'],
      ['invalid-route-guard', 'Invalid values cleared'],
      ['search-normalization', 'NFKC + trim'],
      ['resolved-student-search', 'Search applied'],
      ['student-search-status', 'Adjusted'],
      ['student-search-match-count', '1/3'],
      ['student-sort-option', 'Best score'],
      ['student-sort-status', 'Adjusted'],
      ['student-sort-default', 'Non-default persisted'],
      ['item-sort-option', 'Lowest accuracy'],
      ['item-sort-status', 'Adjusted'],
      ['item-sort-default', 'Non-default persisted'],
      ['answer-review-filter', 'Needs review only'],
      ['answer-review-status', 'Adjusted'],
      ['answer-review-default', 'Non-default persisted'],
      ['filtered-students', '1/3'],
      ['filtered-attempt-rows', '2/4'],
      ['filtered-answer-reviews', '1/4'],
      ['sorted-performance-items', '3/3'],
      [
        'review-scope-summary',
        'Students 1/3; attempts 2/4; items 3/3; reviews 1/4',
      ],
      ['copy-scope-students', '1 student · 2 attempts'],
      ['copy-scope-items', 'Lowest accuracy'],
      ['copy-scope-review', 'Needs review only'],
      ['table-consumer', 'Result tables'],
      ['review-card-consumer', 'Answer review cards'],
      ['copy-artifact-consumer', 'Current copy scope'],
      ['anonymous-label-search', 'Normalized labels only'],
      ['privacy-guard', 'Hidden'],
    ]
  );
  assert.equal(pageView.reviewScopeView.summaryItems[0]?.value, '1/3');
  assert.equal(pageView.copyActionData?.analysis.students.length, 1);
  assert.equal(pageView.copyActionData?.analysis.attempts.length, 1);
  assert.equal(pageView.copyActionData?.analysis.perItem.length, 3);
  assertNoPrivateControlsHandoffText(JSON.stringify(handoffView));
});

test('assignment result review controls handoff localizes Chinese scope state', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentResultsPageViewModel({
    data: buildControlsHandoffPageData(),
    search: buildAssignmentResultRouteSearch({
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: SECRET_STUDENT_LABEL,
    }),
  }).reviewControlsHandoffView;

  assert.equal(handoffView.title, '结果复盘控件交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(
    getHandoffValue(handoffView, 'resolved-student-search'),
    '已应用搜索'
  );
  assert.equal(getHandoffValue(handoffView, 'student-search-status'), '已调整');
  assert.equal(getHandoffValue(handoffView, 'student-sort-option'), '最佳分数');
  assert.equal(getHandoffValue(handoffView, 'item-sort-option'), '最低正确率');
  assert.equal(
    getHandoffValue(handoffView, 'answer-review-filter'),
    '仅需复盘'
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-students'),
    '1 名学生 · 2 次作答'
  );
  assert.equal(getHandoffValue(handoffView, 'table-consumer'), '结果表格');
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment result review controls helpers keep default and invalid route state out', () => {
  overwriteGetLocale(() => 'en');

  const parsedSearch = buildAssignmentResultRouteSearch({
    itemSort: 'original',
    review: 'all',
    sort: 'needs-review',
    student: '  Ａｌｉｃｅ 　 Ｐｒｉｖａｔｅ  ',
  });

  assert.deepEqual(parsedSearch, {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
    student: SECRET_STUDENT_LABEL,
  });
  assert.deepEqual(resolveAssignmentResultViewState(parsedSearch), {
    attemptReviewFilter: 'all',
    itemPerformanceSort: 'original',
    studentSearch: SECRET_STUDENT_LABEL,
    studentSort: 'needs-review',
  });
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
    buildAssignmentResultRouteSearch({
      itemSort: 'unknown',
      review: 'wrong',
      sort: ['best'],
      student: ['student'],
    }),
    {
      itemSort: undefined,
      review: undefined,
      sort: undefined,
      student: undefined,
    }
  );

  const defaultHandoffView = buildAssignmentResultsPageViewModel({
    data: buildControlsHandoffPageData(),
    search: buildAssignmentResultRouteSearch({}),
  }).reviewControlsHandoffView;

  assert.equal(
    getHandoffValue(defaultHandoffView, 'resolved-student-search'),
    'All students'
  );
  assert.equal(
    getHandoffValue(defaultHandoffView, 'student-sort-default'),
    'Default kept'
  );
  assert.equal(
    getHandoffValue(defaultHandoffView, 'item-sort-default'),
    'Default kept'
  );
  assert.equal(
    getHandoffValue(defaultHandoffView, 'answer-review-default'),
    'Default kept'
  );
});

test('assignment result review controls handoff is rendered as hidden semantic output', () => {
  const panelSource = readFileSync(
    'src/components/assignments/assignment-results-review-handoff-panel.tsx',
    'utf8'
  );
  const routeSource = readFileSync(
    'src/routes/dashboard/assignments/$assignmentId.tsx',
    'utf8'
  );

  assert.match(
    panelSource,
    /function AssignmentResultReviewControlsHandoff[\s\S]*const titleId = 'assignment-result-review-controls-handoff-title'[\s\S]*const descriptionId = 'assignment-result-review-controls-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-result-review-controls"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentResultReviewControlsHandoffItem[\s\S]*function AssignmentResultReviewControlsHandoffItem[\s\S]*const labelId = `assignment-result-review-controls-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-result-review-controls-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-result-review-controls-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment result review controls has a fast script-level gate via[\s\S]*scripts\/assignment-result-review-controls-handoff-semantic-views\.test\.ts[\s\S]*student search[\s\S]*assignment-result-review-controls handoff/
  );
  assert.match(
    routeSource,
    /controlsView=\{pageView\.reviewControlsHandoffView\}/
  );
});

function buildControlsHandoffPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
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
      id: 'assignment-result-review-controls-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review the result scope.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'review-controls-share-slug',
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
  view: AssignmentResultReviewControlsHandoffView,
  id: AssignmentResultReviewControlsHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing result review controls handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateControlsHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_STUDENT_LABEL,
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    'review-controls-share-slug',
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Result review controls handoff leaked private text: ${privateValue}`
    );
  }
}
