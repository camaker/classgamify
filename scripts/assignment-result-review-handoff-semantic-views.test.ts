import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  resolveAssignmentResultViewState,
  type AssignmentResultReviewHandoffItemId,
  type AssignmentResultReviewHandoffView,
  type AssignmentResultsPageData,
  type AssignmentAttemptRowDisplayInput,
} from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_EXPECTED_ANSWER = 'SECRET_REVIEW_EXPECTED_ANSWER';
const SECRET_PROMPT = 'SECRET_REVIEW_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_REVIEW_STUDENT_ANSWER';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment result review handoff exposes 30 safe current-review slices', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildResultReviewPageData(),
    search: buildAssignmentResultRouteSearch({
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: '  Alice  ',
    }),
  });
  const handoffView = pageView.reviewHandoffView;
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS]);
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
    exposesCsvDataUrl: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    scope: 'teacher-result-review',
  });

  assert.equal(getHandoffValue(handoffView, 'review-status'), 'Needs review');
  assert.equal(
    getHandoffValue(handoffView, 'review-next-step'),
    'Review flagged answers'
  );
  assert.equal(getHandoffValue(handoffView, 'student-search'), 'Alice');
  assert.equal(
    getHandoffValue(handoffView, 'student-search-status'),
    'Adjusted'
  );
  assert.equal(getHandoffValue(handoffView, 'student-sort'), 'Best score');
  assert.equal(getHandoffValue(handoffView, 'student-sort-status'), 'Adjusted');
  assert.equal(getHandoffValue(handoffView, 'item-sort'), 'Lowest accuracy');
  assert.equal(getHandoffValue(handoffView, 'item-sort-status'), 'Adjusted');
  assert.equal(
    getHandoffValue(handoffView, 'answer-review'),
    'Needs review only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-review-status'),
    'Adjusted'
  );
  assert.equal(getHandoffValue(handoffView, 'matched-students'), '1/3');
  assert.equal(getHandoffValue(handoffView, 'matched-attempts'), '2/4');
  assert.equal(getHandoffValue(handoffView, 'matched-items'), '3/3');
  assert.equal(getHandoffValue(handoffView, 'matched-answer-reviews'), '1/4');
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-students'),
    '1 student · 2 attempts'
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-items'),
    'Lowest accuracy'
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-review'),
    'Needs review only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-copy-brief'),
    'Current review | Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-copy-reteach-plan'),
    'Current review | Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-copy-item-review'),
    'Current review | Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-copy-follow-up'),
    'Current review | Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-export-csv'),
    'Full assignment results | Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-copy-brief'),
    'Focus items: 3 · Follow-up students: 1'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-copy-reteach-plan'),
    'Review items: 3 · Priority students: 1'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-copy-item-review'),
    'Reviewed items with answers and notes: 3'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-copy-follow-up'),
    'Students sorted by follow-up need: 1'
  );
  assert.equal(getHandoffValue(handoffView, 'route-state'), 'Adjusted route');
  assert.equal(
    getHandoffValue(handoffView, 'current-review-boundary'),
    'Current review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'full-export-boundary'),
    'Full assignment results'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), 'Hidden');

  assert.equal(pageView.copyActionData?.analysis.attempts.length, 1);
  assert.equal(pageView.copyActionData?.analysis.students.length, 1);
  assert.equal(
    pageView.actionDataSet.exportActionData?.analysis.attempts.length,
    4
  );
  assert.ok(
    pageView.copyArtifactPreviews.some((preview) =>
      preview.text.includes(SECRET_PROMPT)
    ),
    'fixture should prove private copy text exists before handoff sanitizing'
  );
  assertNoPrivateReviewHandoffText(JSON.stringify(handoffView));
});

test('assignment result review helpers keep route state and sorting domain-owned', () => {
  overwriteGetLocale(() => 'en');

  const parsedSearch = buildAssignmentResultRouteSearch({
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'name',
    student: '  Ａｌｉｃｅ 　 Group  ',
  });

  assert.deepEqual(parsedSearch, {
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'name',
    student: 'Alice Group',
  });
  assert.deepEqual(resolveAssignmentResultViewState(parsedSearch), {
    attemptReviewFilter: 'needs-review',
    itemPerformanceSort: 'submitted',
    studentSearch: 'Alice Group',
    studentSort: 'name',
  });
  assert.deepEqual(
    buildAssignmentResultControlSearchState({
      current: parsedSearch,
      update: {
        control: 'student-sort',
        value: 'needs-review',
      },
    }),
    {
      itemSort: 'submitted',
      review: 'needs-review',
      sort: undefined,
      student: 'Alice Group',
    }
  );
  assert.deepEqual(
    buildAssignmentResultControlSearchState({
      current: parsedSearch,
      update: {
        control: 'attempt-review-filter',
        value: 'all',
      },
    }),
    {
      itemSort: 'submitted',
      review: undefined,
      sort: 'name',
      student: 'Alice Group',
    }
  );

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildResultReviewPageData(),
    search: parsedSearch,
  });

  assert.deepEqual(
    pageView.studentSummaryRowViews.map((row) => row.studentLabel),
    []
  );
  assert.equal(pageView.reviewStatusView.status, 'no-matches');
  assert.equal(
    getHandoffValue(pageView.reviewHandoffView, 'route-state'),
    'Adjusted route'
  );
  assert.equal(
    getHandoffValue(pageView.reviewHandoffView, 'matched-students'),
    '0/3'
  );
  assert.equal(
    getHandoffValue(pageView.reviewHandoffView, 'matched-attempts'),
    '0/4'
  );
  assert.equal(
    getHandoffValue(pageView.reviewHandoffView, 'matched-answer-reviews'),
    '0/4'
  );
});

test('assignment result review handoff localizes Chinese review boundaries', () => {
  overwriteGetLocale(() => 'zh');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildResultReviewPageData(),
    search: buildAssignmentResultRouteSearch({
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: 'Alice',
    }),
  });
  const handoffView = pageView.reviewHandoffView;

  assert.equal(handoffView.title, '结果复盘交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(getHandoffValue(handoffView, 'review-status'), '需要复盘');
  assert.equal(getHandoffValue(handoffView, 'student-search-status'), '已调整');
  assert.equal(getHandoffValue(handoffView, 'student-sort'), '最佳分数');
  assert.equal(getHandoffValue(handoffView, 'item-sort'), '最低正确率');
  assert.equal(getHandoffValue(handoffView, 'answer-review'), '仅需复盘');
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-students'),
    '1 名学生 · 2 次作答'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-export-csv'),
    '完整作业结果 | 可执行'
  );
  assert.equal(getHandoffValue(handoffView, 'route-state'), '已调整路由');
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment result review handoff renders stable page markers', () => {
  const source = readFileSync(
    'src/components/assignments/assignment-results-review-handoff-panel.tsx',
    'utf8'
  );

  assert.match(
    source,
    /export function AssignmentResultsReviewHandoffPanel[\s\S]*const titleId = 'assignment-result-review-handoff-title'[\s\S]*const descriptionId = 'assignment-result-review-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="assignment-result-review"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentResultReviewHandoffItem[\s\S]*function AssignmentResultReviewHandoffItem[\s\S]*const labelId = `assignment-result-review-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-result-review-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-result-review-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*data-scope=\{itemView\.dataScope\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*aria-hidden="true"[\s\S]*id=\{descriptionId\}/,
    'Assignment result review handoff should expose the hidden localized result-page marker, privacy scope, item ids, data scopes, and stable label/value/description output relationships.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment result review handoff has a fast script-level gate via[\s\S]*scripts\/assignment-result-review-handoff-semantic-views\.test\.ts[\s\S]*copy-scope alignment[\s\S]*assignment-result-review\s+handoff/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /\|\s*6b\s*\|\s*Result review scope exposes a 30-slice handoff\s*\|[\s\S]*`assignment-result-review`[\s\S]*hidden `dl\/dt\/dd`[\s\S]*label\/value\/description[\s\S]*`data-handoff-item`/
  );
});

function buildResultReviewPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const completedAtAliceLatest = new Date('2026-02-03T10:00:00.000Z');
  const completedAtAliceFirst = new Date('2026-02-02T10:00:00.000Z');
  const completedAtBob = new Date('2026-02-03T09:00:00.000Z');
  const completedAtAnonymous = new Date('2026-02-01T08:00:00.000Z');

  return {
    activity: {
      description: 'A teacher-owned fractions review activity.',
      templateType: 'quiz',
      title: 'Fractions review',
    },
    analysis: {
      attempts: [
        buildAttemptReview({
          accuracy: 50,
          completedAt: completedAtAliceLatest,
          id: 'attempt-alice-latest',
          score: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: completedAtAliceFirst,
          id: 'attempt-alice-first',
          score: 2,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
          variant: 'perfect',
        }),
        buildAttemptReview({
          accuracy: 100,
          completedAt: completedAtBob,
          id: 'attempt-bob',
          score: 2,
          studentKey: 'student:bob',
          studentLabel: 'Bob',
          variant: 'perfect',
        }),
        buildAttemptReview({
          accuracy: 0,
          completedAt: completedAtAnonymous,
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
          prompt: `${SECRET_PROMPT} listening item`,
          submittedCount: 2,
          unansweredCount: 2,
        }),
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-fraction',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} fraction item`,
          submittedCount: 4,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctRate: 100,
          itemId: 'item-vocabulary',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} vocabulary item`,
          submittedCount: 3,
          unansweredCount: 1,
        }),
      ],
      perItem: [
        buildItemAnalysis({
          correctRate: 50,
          itemId: 'item-fraction',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} fraction item`,
          submittedCount: 4,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctRate: 100,
          itemId: 'item-vocabulary',
          kind: 'question',
          kindLabel: 'Question',
          prompt: `${SECRET_PROMPT} vocabulary item`,
          submittedCount: 3,
          unansweredCount: 1,
        }),
        buildItemAnalysis({
          correctRate: 0,
          itemId: 'item-listening',
          kind: 'listening',
          kindLabel: 'Listening',
          prompt: `${SECRET_PROMPT} listening item`,
          submittedCount: 2,
          unansweredCount: 2,
        }),
      ],
      students: [
        {
          attempts: 2,
          averageAccuracy: 75,
          bestAccuracy: 100,
          lastCompletedAt: completedAtAliceLatest,
          latestAccuracy: 50,
          needsReviewCount: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
        {
          attempts: 1,
          averageAccuracy: 100,
          bestAccuracy: 100,
          lastCompletedAt: completedAtBob,
          latestAccuracy: 100,
          needsReviewCount: 0,
          studentKey: 'student:bob',
          studentLabel: 'Bob',
        },
        {
          attempts: 1,
          averageAccuracy: 0,
          bestAccuracy: 0,
          lastCompletedAt: completedAtAnonymous,
          latestAccuracy: 0,
          needsReviewCount: 2,
          studentKey: 'anonymous:1',
          studentLabel: 'Anonymous student 1',
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-02-10T10:00:00.000Z'),
      id: 'assignment-result-review-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review visible classroom policy, not private answers.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'review-share-slug',
      status: 'published',
      title: 'Fractions exit ticket',
    },
    attempts: [
      buildAttemptRow({
        accuracy: 50,
        anonymousToken: null,
        completedAt: completedAtAliceLatest,
        id: 'attempt-alice-latest',
        score: 1,
        studentName: 'Alice',
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: completedAtAliceFirst,
        id: 'attempt-alice-first',
        score: 2,
        studentName: 'Alice',
      }),
      buildAttemptRow({
        accuracy: 100,
        anonymousToken: null,
        completedAt: completedAtBob,
        id: 'attempt-bob',
        score: 2,
        studentName: 'Bob',
      }),
      buildAttemptRow({
        accuracy: 0,
        anonymousToken: SECRET_ANONYMOUS_TOKEN,
        completedAt: completedAtAnonymous,
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
      averageDurationSeconds: 64,
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
    explanation: 'Teacher-only explanation stays outside review handoff.',
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
  prompt,
  submittedCount,
  unansweredCount,
}: {
  correctRate: number;
  itemId: string;
  kind: 'listening' | 'question';
  kindLabel: string;
  prompt: string;
  submittedCount: number;
  unansweredCount: number;
}) {
  return {
    acceptedAnswers: ['1/2', SECRET_EXPECTED_ANSWER],
    correctCount: Math.max(0, submittedCount - unansweredCount),
    correctRate,
    explanation: 'Teacher-only explanation stays outside review handoff.',
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    itemId,
    kind,
    kindLabel,
    prompt,
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
  view: AssignmentResultReviewHandoffView,
  id: AssignmentResultReviewHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing result review handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateReviewHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    'data:text/csv',
    'review-share-slug',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Result review handoff leaked private text: ${privateValue}`
    );
  }
}
