import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptReviewCardHandoffEvidence,
  buildAssignmentAttemptReviewCardHandoffView,
  type AssignmentAttemptReviewCardHandoffItemId,
  type AssignmentAttemptReviewCardHandoffView,
} from '@/assignments/attempt-review-card-handoff';
import {
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  type AssignmentAttemptRowDisplayInput,
  type AssignmentResultsPageData,
} from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_ANSWER';
const SECRET_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_ATTEMPT_ID = 'attempt-secret-card';
const SECRET_EXPECTED_ANSWER = 'SECRET_EXPECTED_ANSWER';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_LABEL = 'Alice Private';

test('assignment attempt review card handoff exposes 30 safe card slices', () => {
  overwriteGetLocale(() => 'en');

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildAttemptReviewCardPageData(),
    search: buildAssignmentResultRouteSearch({
      review: 'needs-review',
      student: SECRET_STUDENT_LABEL,
    }),
  });
  const handoffView = pageView.attemptReviewCardViews[0]?.handoffView;
  assert.ok(handoffView, 'Expected a focused attempt review card handoff.');

  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);
  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAcceptedAnswerText: false,
    exposesAttemptId: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabel: false,
    exposesTeacherAnswerText: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-attempt-review-card',
    usesAssignmentDomainHelpers: true,
  });

  assert.equal(
    getHandoffValue(handoffView, 'review-card-scope'),
    'Teacher answer review card'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-display-boundary'),
    'Display label prepared'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submitted-time-display'),
    'Prepared'
  );
  assert.equal(getHandoffValue(handoffView, 'score-badge'), 'Prepared');
  assert.equal(getHandoffValue(handoffView, 'summary-metric-count'), '4');
  assert.equal(getHandoffValue(handoffView, 'submitted-count'), '2/3');
  assert.equal(getHandoffValue(handoffView, 'correct-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'needs-review-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'unanswered-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'answer-card-count'), '3');
  assert.equal(
    getHandoffValue(handoffView, 'answer-sequence'),
    'Snapshot order'
  );
  assert.equal(getHandoffValue(handoffView, 'prompt-labels'), 'Numbered');
  assert.equal(getHandoffValue(handoffView, 'status-labels'), '3');
  assert.equal(getHandoffValue(handoffView, 'correct-status-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'needs-review-status-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-status-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'student-answer-lines'), '3');
  assert.equal(getHandoffValue(handoffView, 'expected-answer-lines'), '3');
  assert.equal(
    getHandoffValue(handoffView, 'accepted-alternatives-lines'),
    '3'
  );
  assert.equal(getHandoffValue(handoffView, 'explanation-lines'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'unsubmitted-answer-guard'),
    'Unanswered label'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-text-view-helper'),
    'buildAssignmentResultAttemptAnswerTextView'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-status-helper'),
    'buildAssignmentResultAnswerStatusView'
  );
  assert.equal(
    getHandoffValue(handoffView, 'attempt-summary-helper'),
    'buildAssignmentAttemptReviewSummary'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-card-consumer'),
    'Answer review card'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-filter-consumer'),
    'Attempt review filter'
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-boundary'),
    'Current copy scope'
  );
  assert.equal(
    getHandoffValue(handoffView, 'csv-export-boundary'),
    'Full CSV export'
  );
  assert.equal(getHandoffValue(handoffView, 'anonymous-token-guard'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), 'Hidden');

  assertNoPrivateCardHandoffText(JSON.stringify(handoffView));
});

test('assignment attempt review card handoff localizes Chinese card state', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentResultsPageViewModel({
    data: buildAttemptReviewCardPageData(),
    search: buildAssignmentResultRouteSearch({
      review: 'needs-review',
      student: SECRET_STUDENT_LABEL,
    }),
  }).attemptReviewCardViews[0]?.handoffView;
  assert.ok(handoffView, 'Expected localized attempt review card handoff.');

  assert.equal(handoffView.title, '答案复盘卡片交接');
  assert.match(handoffView.description, /三十切片/);
  assert.equal(
    getHandoffValue(handoffView, 'review-card-scope'),
    '教师答案复盘卡片'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-display-boundary'),
    '显示标签已准备'
  );
  assert.equal(getHandoffValue(handoffView, 'submitted-count'), '2/3');
  assert.equal(
    getHandoffValue(handoffView, 'unsubmitted-answer-guard'),
    '未作答标签'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-card-consumer'),
    '答案复盘卡片'
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-scope-boundary'),
    '当前复制范围'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment attempt review card handoff normalizes evidence counts', () => {
  overwriteGetLocale(() => 'en');

  const evidence = buildAssignmentAttemptReviewCardHandoffEvidence({
    answers: [
      buildAttemptAnswer({
        answer: '',
        correct: false,
        explanation: undefined,
        itemId: 'item-empty',
        submitted: false,
      }),
    ],
    answerViews: [
      {
        acceptedAnswersLineText: null,
        expectedAnswerLineText: 'Expected answer: hidden',
        explanationText: null,
        statusLabel: 'Unanswered',
        statusTone: 'idle',
        studentAnswerLineText: 'Student answer: Unanswered',
      },
    ],
    badgeLabel: '',
    submittedAtLabel: '',
    summaryMetricCount: Number.NaN,
  });
  const handoffView = buildAssignmentAttemptReviewCardHandoffView(evidence);

  assert.equal(getHandoffValue(handoffView, 'summary-metric-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'submitted-count'), '0/1');
  assert.equal(getHandoffValue(handoffView, 'correct-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'needs-review-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'submitted-time-display'),
    'Missing'
  );
  assert.equal(getHandoffValue(handoffView, 'score-badge'), 'Missing');
});

test('assignment attempt review card handoff is wired into result card rendering', () => {
  const resultViewSource = readFileSync(
    'src/assignments/result-view.ts',
    'utf8'
  );
  const cardSource = readFileSync(
    'src/components/assignments/assignment-results-attempt-review-card.tsx',
    'utf8'
  );
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

  assert.match(
    resultViewSource,
    /buildAssignmentAttemptReviewCardHandoffEvidence\(\{[\s\S]*answers: attempt\.answers,[\s\S]*answerViews,[\s\S]*summaryMetricCount: summaryMetricViews\.length/
  );
  assert.match(
    resultViewSource,
    /handoffView: buildAssignmentAttemptReviewCardHandoffView/
  );
  assert.match(
    cardSource,
    /function AssignmentResultsAttemptReviewCardHandoff[\s\S]*const baseId = useId\(\)[\s\S]*const titleId = `\$\{baseId\}-assignment-attempt-review-card-handoff-title`[\s\S]*const descriptionId = `\$\{baseId\}-assignment-attempt-review-card-handoff-description`[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-attempt-review-card"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*AssignmentResultsAttemptReviewCardHandoffItem[\s\S]*baseId=\{baseId\}[\s\S]*function AssignmentResultsAttemptReviewCardHandoffItem[\s\S]*const itemId = `\$\{baseId\}-assignment-attempt-review-card-\$\{itemView\.id\}`[\s\S]*const labelId = `\$\{itemId\}-label`[\s\S]*const valueId = `\$\{itemId\}-value`[\s\S]*const descriptionId = `\$\{itemId\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(catalogSource, /\|\s*6h\s*\|/);
  assert.match(
    catalogSource,
    /Assignment attempt review cards has a fast script-level gate via[\s\S]*scripts\/assignment-attempt-review-card-handoff-semantic-views\.test\.ts[\s\S]*answer review cards[\s\S]*assignment-attempt-review-card[\s\S]*handoff/
  );
});

function buildAttemptReviewCardPageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const completedAt = new Date('2026-04-05T10:00:00.000Z');

  return {
    activity: {
      description: 'Private classroom review activity.',
      templateType: 'quiz',
      title: 'Card review activity',
    },
    analysis: {
      attempts: [
        {
          accuracy: 33,
          answers: [
            buildAttemptAnswer({
              answer: 'Paris',
              correct: true,
              itemId: 'item-correct',
            }),
            buildAttemptAnswer({
              answer: SECRET_STUDENT_ANSWER,
              correct: false,
              itemId: 'item-review',
            }),
            buildAttemptAnswer({
              answer: '',
              correct: false,
              explanation: '',
              itemId: 'item-empty',
              submitted: false,
            }),
          ],
          completedAt,
          durationSeconds: 90,
          id: SECRET_ATTEMPT_ID,
          score: 1,
          studentKey: 'name:alice-private',
          studentLabel: SECRET_STUDENT_LABEL,
        },
      ],
      needsReview: [
        buildItemAnalysis({
          correctCount: 0,
          itemId: 'item-review',
          submittedCount: 1,
          unansweredCount: 0,
        }),
      ],
      perItem: [
        buildItemAnalysis({
          correctCount: 1,
          itemId: 'item-correct',
          submittedCount: 1,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctCount: 0,
          itemId: 'item-review',
          submittedCount: 1,
          unansweredCount: 0,
        }),
        buildItemAnalysis({
          correctCount: 0,
          itemId: 'item-empty',
          submittedCount: 0,
          unansweredCount: 1,
        }),
      ],
      students: [
        {
          attempts: 1,
          averageAccuracy: 33,
          bestAccuracy: 33,
          lastCompletedAt: completedAt,
          latestAccuracy: 33,
          needsReviewCount: 2,
          studentKey: 'name:alice-private',
          studentLabel: SECRET_STUDENT_LABEL,
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-04-10T10:00:00.000Z'),
      id: 'assignment-attempt-review-card-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Keep card review private.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: 'attempt-review-card-share-slug',
      status: 'published',
      title: 'Attempt review card',
    },
    attempts: [
      {
        anonymousToken: SECRET_ANONYMOUS_TOKEN,
        completedAt,
        id: SECRET_ATTEMPT_ID,
        maxScore: 3,
        resultJson: {
          accuracy: 33,
          completedItemCount: 2,
          durationSeconds: 90,
          totalPoints: 3,
        },
        score: 1,
        studentName: SECRET_STUDENT_LABEL,
      },
    ],
    snapshot: {
      activityDescription: 'Frozen card review snapshot.',
      activityTitle: 'Card review snapshot',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 90,
      averagePoints: 1,
      averageScore: 33,
      completions: 1,
    },
  };
}

function buildAttemptAnswer({
  answer,
  correct,
  explanation = 'Private explanation text.',
  itemId,
  submitted = true,
}: {
  answer: string;
  correct: boolean;
  explanation?: string;
  itemId: string;
  submitted?: boolean;
}) {
  return {
    acceptedAnswers: ['Paris', SECRET_EXPECTED_ANSWER, SECRET_ACCEPTED_ANSWER],
    answer,
    correct,
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    explanation,
    itemId,
    prompt: `${SECRET_PROMPT} ${itemId}`,
    submitted,
  };
}

function buildItemAnalysis({
  correctCount,
  itemId,
  submittedCount,
  unansweredCount,
}: {
  correctCount: number;
  itemId: string;
  submittedCount: number;
  unansweredCount: number;
}) {
  return {
    acceptedAnswers: ['Paris', SECRET_EXPECTED_ANSWER, SECRET_ACCEPTED_ANSWER],
    correctCount,
    correctRate: submittedCount
      ? Math.round((correctCount / submittedCount) * 100)
      : 0,
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    explanation: 'Private explanation text.',
    itemId,
    kind: 'question' as const,
    kindLabel: 'Question',
    prompt: `${SECRET_PROMPT} ${itemId}`,
    submittedCount,
    unansweredCount,
  };
}

function getHandoffValue(
  view: AssignmentAttemptReviewCardHandoffView,
  id: AssignmentAttemptReviewCardHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing attempt review card handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateCardHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACCEPTED_ANSWER,
    SECRET_ANONYMOUS_TOKEN,
    SECRET_ATTEMPT_ID,
    SECRET_EXPECTED_ANSWER,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_LABEL,
    'Private explanation text.',
    'attempt-review-card-share-slug',
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Attempt review card handoff leaked private text: ${privateValue}`
    );
  }
}
