import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-lifecycle-chain';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS } from '@/assignments/attempt-review-card-handoff';
import {
  buildAssignmentItemAnalysisCardView,
  buildAssignmentAttemptAnswerReviewView,
  buildAssignmentItemPerformanceRowView,
} from '@/assignments/result-view';
import { buildAssignmentItemReviewSummaryItemView } from '@/assignments/item-review-summary';
import {
  ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS,
  buildAssignmentResultsCsv,
} from '@/assignments/results-export';
import {
  ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES,
  buildAssignmentResultExplanationChainHandoffView,
  type AssignmentResultExplanationChainHandoffItemId,
  type AssignmentResultExplanationChainHandoffView,
} from '@/assignments/result-explanation-chain';
import { formatAssignmentResultValue } from '@/assignments/result-format';
import { buildPublicAnswerFeedbackView } from '@/assignments/student-runner-view';
import { buildPrintableWorksheetAnswerKeyItemView } from '@/assignments/printable-worksheet-view';
import { PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-review-lifecycle-chain';
import { SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/scored-attempt-result-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import { TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-result-copy-lifecycle-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ACTIVITY_TYPES_SOURCE = readFileSync('src/activities/types.ts', 'utf8');
const RUNTIME_DISPLAY_SOURCE = readFileSync(
  'src/activities/runtime-display.ts',
  'utf8'
);
const RESULT_FORMAT_SOURCE = readFileSync(
  'src/assignments/result-format.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const STUDENT_RUNNER_VIEW_SOURCE = readFileSync(
  'src/assignments/student-runner-view.ts',
  'utf8'
);
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const PUBLIC_FEEDBACK_SOURCE = readFileSync(
  'src/components/activities/public-answer-feedback.tsx',
  'utf8'
);
const ATTEMPT_REVIEW_CARD_HANDOFF_SOURCE = readFileSync(
  'src/assignments/attempt-review-card-handoff.ts',
  'utf8'
);
const ITEM_REVIEW_SUMMARY_SOURCE = readFileSync(
  'src/assignments/item-review-summary.ts',
  'utf8'
);
const RESULT_ACTIONS_SOURCE = readFileSync(
  'src/assignments/result-actions.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_VIEW_SOURCE = readFileSync(
  'src/assignments/printable-worksheet-view.ts',
  'utf8'
);
const PRINTABLE_ANSWER_KEY_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-answer-key.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_CSV_DATA_URL = 'data:text/csv,SECRET_EXPLANATION_CSV';
const PRIVATE_EXPLANATION_TEXT = 'SECRET_TEACHER_EXPLANATION_TEXT';
const PRIVATE_PROMPT_TEXT = 'SECRET_EXPLANATION_PROMPT';
const PRIVATE_RUNTIME_ITEM_ID = 'explanation-secret-runtime-id';
const PRIVATE_STUDENT_ANSWER = 'SECRET_EXPLANATION_STUDENT_ANSWER';
const PRIVATE_STUDENT_NAME = 'SECRET_EXPLANATION_STUDENT_NAME';

test('assignment result explanation chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentResultExplanationChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Assignment result explanation chain');
  assert.match(handoffView.description, /Thirty-slice assignment result/);
  assert.equal(handoffView.itemViews.length, 30);
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
    chainSourceFileCount:
      ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES.length,
    copyArtifactsUseFormattedExplanations: true,
    csvExportsUseFormattedExplanations: true,
    exposesCsvDataUrlInHandoff: false,
    exposesPromptTextInHandoff: false,
    exposesRawRuntimeItemIdsInHandoff: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentNamesInHandoff: false,
    exposesTeacherExplanationTextInHandoff: false,
    itemIds,
    printableAnswerKeysUseFormattedExplanations: true,
    publicFeedbackRespectsAnswerReveal: true,
    resultPagesUseFormattedExplanations: true,
    sourceFiles: [...ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES],
  });
  assertNoPrivateExplanationText(JSON.stringify(handoffView));
});

test('assignment result explanation chain summarizes each boundary', () => {
  const handoffView = buildAssignmentResultExplanationChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-explanation-policy', 'Review after scoring'],
      ['activity-content-explanation-source', 'ActivityContent'],
      ['public-payload-explanation-guard', 'Hidden before review'],
      ['post-submit-explanation-policy', 'Reveal if allowed'],
      ['runtime-display-normalization', 'Runtime display text'],
      ['result-format-empty-value', 'Empty hidden'],
      ['result-analysis-per-item-explanation', 'Item analysis'],
      ['result-analysis-attempt-review-explanation', 'Answer review'],
      ['student-feedback-explanation-value', 'Optional value'],
      ['student-feedback-explanation-line', 'Line when present'],
      ['student-feedback-explanation-detail', 'Detail item'],
      ['feedback-scope-explanation-count', 'Explanation count'],
      ['public-feedback-dom-detail', 'data-feedback-detail'],
      ['item-card-explanation', 'Optional card note'],
      ['item-performance-explanation-column', 'Explanation column'],
      ['attempt-review-card-explanation', 'Optional card note'],
      ['attempt-review-card-handoff-lines', 'Line count'],
      ['item-review-summary-explanation', 'Notes field'],
      ['copy-artifact-item-review', 'Item review copy'],
      ['csv-explanation-column', 'explanation'],
      ['csv-answer-row-explanation', 'Formatted text'],
      ['export-preparation-explanation-slice', 'explanation-column'],
      ['printable-answer-key-explanation', 'Explanation detail'],
      ['printable-answer-key-detail-dom', 'Labelled output'],
      ['answer-feedback-chain-alignment', 'Answer feedback'],
      ['teacher-results-chain-alignment', 'Results chain'],
      ['scored-result-chain-alignment', 'Scored attempts'],
      ['printable-review-chain-alignment', 'Printable review'],
      ['explanation-privacy-guard', 'Raw data hidden'],
      ['explanation-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'csv-answer-row-explanation'),
    'Formatted text'
  );
});

test('assignment result explanation chain is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(filePath), `Missing explanation chain ${filePath}`);
  }

  assert.deepEqual(
    [
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 8 }, () => 30)
  );
});

test('explanation formatting keeps optional result text explicit', () => {
  assert.equal(
    formatAssignmentResultValue(' Ｆｒａｎｃｅ\u00A0　capital. ', {
      emptyValue: '',
    }),
    'France capital.'
  );
  assert.equal(formatAssignmentResultValue('', { emptyValue: '' }), '');

  const itemCard = buildAssignmentItemAnalysisCardView({
    acceptedAnswers: ['Paris'],
    correctCount: 1,
    correctRate: 100,
    expectedAnswer: 'Paris',
    explanation: ' Ｐａｒｉｓ\u00A0　is the capital. ',
    itemId: 'item-1',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Capital?',
    submittedCount: 1,
    unansweredCount: 0,
  });
  assert.equal(itemCard.explanationText, 'Paris is the capital.');

  const emptyItemCard = buildAssignmentItemAnalysisCardView({
    acceptedAnswers: ['Paris'],
    correctCount: 0,
    correctRate: 0,
    expectedAnswer: 'Paris',
    explanation: '',
    itemId: 'item-2',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Capital?',
    submittedCount: 0,
    unansweredCount: 1,
  });
  assert.equal(emptyItemCard.explanationText, null);

  const performanceRow = buildAssignmentItemPerformanceRowView({
    index: 0,
    item: {
      acceptedAnswers: ['Paris'],
      correctCount: 0,
      correctRate: 0,
      expectedAnswer: 'Paris',
      explanation: undefined,
      itemId: 'item-3',
      kind: 'question',
      kindLabel: 'Question',
      prompt: 'Capital?',
      submittedCount: 0,
      unansweredCount: 1,
    },
  });
  assert.equal(performanceRow.explanationText, '-');

  const answerReview = buildAssignmentAttemptAnswerReviewView({
    answer: {
      acceptedAnswers: ['Paris'],
      answer: 'Lyon',
      correct: false,
      expectedAnswer: 'Paris',
      explanation: ' France\tcapital. ',
      itemId: 'item-4',
      prompt: 'Capital?',
      submitted: true,
    },
    index: 0,
  });
  assert.equal(answerReview.explanationText, 'France capital.');
});

test('student feedback exposes explanations only through prepared review detail views', () => {
  const feedbackView = buildPublicAnswerFeedbackView({
    reviewItem: {
      acceptedAnswers: ['Paris', 'City of Light'],
      correct: false,
      correctAnswer: 'Paris',
      explanation: ' France capital. ',
      itemId: 'item-1',
      submitted: true,
      submittedAnswer: 'Lyon',
    },
  });

  assert.equal(feedbackView.explanation, 'France capital.');
  assert.match(feedbackView.explanationText ?? '', /France capital\./);
  assert.deepEqual(
    feedbackView.detailLines.map((line) => line.id),
    ['submitted-answer', 'correct-answer', 'accepted-answers', 'explanation']
  );

  const feedbackWithoutExplanation = buildPublicAnswerFeedbackView({
    reviewItem: {
      acceptedAnswers: ['Paris'],
      correct: true,
      correctAnswer: 'Paris',
      explanation: '',
      itemId: 'item-2',
      submitted: true,
      submittedAnswer: 'Paris',
    },
  });
  assert.equal(feedbackWithoutExplanation.explanationText, null);
  assert.equal(
    feedbackWithoutExplanation.detailLines.some(
      (line) => line.id === 'explanation'
    ),
    false
  );
});

test('copy and printable handoffs format explanations without raw handoff text', () => {
  const itemReview = buildAssignmentItemReviewSummaryItemView({
    index: 0,
    item: {
      acceptedAnswers: ['Paris', 'City of Light'],
      correctCount: 1,
      correctRate: 50,
      expectedAnswer: 'Paris',
      explanation: ' France capital. ',
      itemId: 'item-1',
      kind: 'question',
      kindLabel: 'Question',
      prompt: 'Capital?',
      submittedCount: 2,
      unansweredCount: 0,
    },
  });
  assert.equal(itemReview.explanationText, 'France capital.');
  assert.match(itemReview.text, /Notes: France capital\./);

  const answerKey = buildPrintableWorksheetAnswerKeyItemView({
    acceptedAnswers: ['Paris', 'City of Light'],
    answer: 'Paris',
    explanation: ' France capital. ',
    id: 'item-1',
    kind: 'question',
    prompt: 'Capital?',
    sequenceNumber: 1,
  });
  assert.deepEqual(
    answerKey.detailViews.map((detail) => detail.id),
    ['expected-answer', 'accepted-answers', 'explanation']
  );
  assert.match(
    answerKey.detailViews.find((detail) => detail.id === 'explanation')
      ?.label ?? '',
    /France capital\./
  );
});

test('CSV explanation formatting exports a dedicated formatted explanation column', () => {
  const csv = buildAssignmentResultsCsv({
    activity: {
      description: 'Live activity description',
      templateType: 'quiz',
      title: 'Live activity title',
    },
    analysis: {
      attempts: [
        {
          accuracy: 100,
          answers: [
            {
              acceptedAnswers: ['Paris'],
              answer: 'Paris',
              correct: true,
              expectedAnswer: 'Paris',
              explanation: ' Ｆｒａｎｃｅ\u00A0　capital. ',
              itemId: 'item-1',
              prompt: 'Capital of France',
              submitted: true,
            },
          ],
          completedAt: new Date('2026-01-02T03:04:05.000Z'),
          durationSeconds: 30,
          id: 'attempt-1',
          score: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
      needsReview: [],
      perItem: [
        {
          acceptedAnswers: ['Paris'],
          correctCount: 1,
          correctRate: 100,
          expectedAnswer: 'Paris',
          explanation: 'France capital.',
          itemId: 'item-1',
          kind: 'question',
          kindLabel: 'Question',
          prompt: 'Capital of France',
          submittedCount: 1,
          unansweredCount: 0,
        },
      ],
      students: [
        {
          attempts: 1,
          averageAccuracy: 100,
          bestAccuracy: 100,
          lastCompletedAt: new Date('2026-01-02T03:04:05.000Z'),
          latestAccuracy: 100,
          needsReviewCount: 0,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
    },
    assignment: {
      expiresAt: null,
      id: 'assignment-1',
      settingsJson: {
        collectStudentName: true,
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
      },
      shareSlug: 'share-123',
      status: 'published',
      title: 'Explanation export check',
    },
    attempts: [
      {
        completedAt: new Date('2026-01-02T03:04:05.000Z'),
        id: 'attempt-1',
        maxScore: 1,
        resultJson: {
          accuracy: 100,
          completedItemCount: 1,
          durationSeconds: 30,
          totalPoints: 1,
        },
        score: 1,
      },
    ],
    now: Date.parse('2026-01-03T00:00:00.000Z'),
    snapshot: {
      activityDescription: 'Snapshot description',
      activityTitle: 'Snapshot title',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 30,
      averagePoints: 1,
      averageScore: 100,
      completions: 1,
    },
  });

  assert.match(csv, /"correct","explanation"/);
  assert.match(csv, /"Paris","","correct","France capital\."/);
  assert.doesNotMatch(csv, /Ｆｒａｎｃｅ/);
});

test('explanation sources preserve result, feedback, export, and print boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teacher-only answer data, accepted alternatives, and explanations stay out of\s+the public runtime payload[\s\S]*Correct answers and explanations are returned only\s+after an attempt is scored[\s\S]*answer explanations from the assignment\s+snapshot[\s\S]*CSV exports/,
    'docs/product.md should keep explanations out of public payloads and in scored review/results/export.'
  );
  assert.match(
    ACTIVITY_TYPES_SOURCE,
    /explanation\?: string/,
    'Activity content should keep optional teacher-authored answer explanations.'
  );
  assert.match(
    RUNTIME_DISPLAY_SOURCE,
    /export function normalizeOptionalRuntimeDisplayText[\s\S]*const normalized = normalizeRuntimeDisplayText\(value\)[\s\S]*return normalized \|\| undefined/,
    'Runtime display helpers should normalize optional explanation text.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /export function formatAssignmentResultValue[\s\S]*normalizeRuntimeDisplayText\(value\)[\s\S]*emptyValue/,
    'Result formatting should normalize explanation values and respect empty fallbacks.'
  );
  assert.match(
    RESULTS_SOURCE,
    /(?=[\s\S]*explanation: normalizeOptionalRuntimeDisplayText\(item\.explanation\))(?=[\s\S]*buildAttemptReviewAnswers[\s\S]*explanation: normalizeOptionalRuntimeDisplayText\(item\.explanation\))/,
    'Result analysis should carry normalized explanations for item analysis and attempt review answers.'
  );
  assert.match(
    STUDENT_RUNNER_VIEW_SOURCE,
    /const explanationValue = formatPublicAnswerFeedbackOptionalValue\([\s\S]*reviewItem\.explanation[\s\S]*const explanationText = explanationValue[\s\S]*id: 'explanation'/,
    'Student feedback should prepare explanation values, lines, and detail entries after review.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /countStudentAttemptReviewItemsWithExplanations[\s\S]*normalizeRuntimeDisplayText\(reviewItem\.explanation\)/,
    'Student feedback scope should count normalized explanation-bearing review items.'
  );
  assert.match(
    PUBLIC_FEEDBACK_SOURCE,
    /feedback\.detailLines\.map[\s\S]*data-feedback-detail=\{line\.id\}[\s\S]*aria-label=\{line\.ariaLabel\}/,
    'Public feedback DOM should render prepared explanation detail lines with semantic outputs.'
  );
});

test('teacher copy, CSV, printable, and catalog sources document explanation continuity', () => {
  assert.match(
    RESULT_VIEW_SOURCE,
    /(?=[\s\S]*buildAssignmentItemAnalysisCardView[\s\S]*explanationText: formatAssignmentResultOptionalText\(item\.explanation\))(?=[\s\S]*buildAssignmentItemPerformanceRowView[\s\S]*explanationText: formatAssignmentResultValue\(item\.explanation\))(?=[\s\S]*buildAssignmentAttemptAnswerReviewView[\s\S]*const explanationText = formatAssignmentResultOptionalText\(\s*answer\.explanation)/,
    'Teacher result views should format explanations for item cards, performance rows, and answer review cards.'
  );
  assert.match(
    ATTEMPT_REVIEW_CARD_HANDOFF_SOURCE,
    /'explanation-lines'[\s\S]*explanationLineCount[\s\S]*Boolean\(answerView\.explanationText\)/,
    'Attempt review card handoff should count explanation lines without exposing explanation text.'
  );
  assert.match(
    ITEM_REVIEW_SUMMARY_SOURCE,
    /const explanationText = formatAssignmentResultValue\(item\.explanation,[\s\S]*emptyValue: ''[\s\S]*assignment_item_review_notes/,
    'Copied item review summaries should format explanation notes through result-format.'
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultCopyArtifacts[\s\S]*itemReviewSummary: buildAssignmentItemReviewSummary/,
    'Result copy artifacts should build item review summaries through the shared item-review helper.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /buildAssignmentResultsExportAnswerRow[\s\S]*formatAssignmentExportText\(answer\.explanation\)[\s\S]*assignment_results_export_column_explanation/,
    'CSV answer rows should format explanation values and include the explanation column.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_VIEW_SOURCE,
    /buildPrintableWorksheetAnswerKeyItemView[\s\S]*const explanation = normalizeOptionalRuntimeDisplayText\(item\.explanation\)[\s\S]*id: 'explanation'/,
    'Printable answer keys should normalize explanations before creating explanation detail rows.'
  );
  assert.match(
    PRINTABLE_ANSWER_KEY_SOURCE,
    /detailView\.id[\s\S]*aria-label=\{detailView\.ariaLabel\}[\s\S]*detailView\.label/,
    'Printable answer-key DOM should render prepared explanation detail labels.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment result explanation continuity chain has a fast script-level gate[\s\S]*scripts\/assignment-result-explanation-chain-handoff\.test\.ts[\s\S]*result explanations[\s\S]*student feedback explanations[\s\S]*CSV explanation columns[\s\S]*printable answer-key explanations/,
    'TEST-CATALOG should document the explanation continuity chain and its scope.'
  );
});

function getHandoffValue(
  view: AssignmentResultExplanationChainHandoffView,
  id: AssignmentResultExplanationChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing explanation chain item ${id}`);
  return item.value;
}

function assertNoPrivateExplanationText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_CSV_DATA_URL,
    PRIVATE_EXPLANATION_TEXT,
    PRIVATE_PROMPT_TEXT,
    PRIVATE_RUNTIME_ITEM_ID,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Explanation chain leaked private text: ${privateValue}`
    );
  }
}
