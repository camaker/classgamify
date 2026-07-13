import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-lifecycle-chain';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS } from '@/assignments/attempt-review-card-handoff';
import {
  ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS,
  buildAssignmentResultsCsv,
} from '@/assignments/results-export';
import {
  ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES,
  buildAssignmentResultAcceptedAnswerChainHandoffView,
  type AssignmentResultAcceptedAnswerChainHandoffItemId,
  type AssignmentResultAcceptedAnswerChainHandoffView,
} from '@/assignments/result-accepted-answer-chain';
import {
  formatAcceptedAnswerAlternatives,
  formatOptionalAcceptedAnswerAlternatives,
  formatPrimaryAcceptedAnswer,
} from '@/assignments/result-format';
import {
  buildAssignmentResultAcceptedAnswerView,
  buildAssignmentResultAttemptAnswerTextView,
} from '@/assignments/result-answer-view';
import { ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS } from '@/assignments/result-view';
import { SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/scored-attempt-result-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ANSWER_MATCHING_SOURCE = readFileSync(
  'src/activities/answer-matching.ts',
  'utf8'
);
const RESULT_FORMAT_SOURCE = readFileSync(
  'src/assignments/result-format.ts',
  'utf8'
);
const RESULT_ANSWER_VIEW_SOURCE = readFileSync(
  'src/assignments/result-answer-view.ts',
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
const ITEM_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-item-analysis-card.tsx',
  'utf8'
);
const PERFORMANCE_TABLE_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-item-performance-table.tsx',
  'utf8'
);
const ATTEMPT_REVIEW_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_CSV_DATA_URL = 'data:text/csv,SECRET_ACCEPTED_ANSWER_CSV';
const PRIVATE_PROMPT_TEXT = 'SECRET_ACCEPTED_ANSWER_PROMPT';
const PRIVATE_RUNTIME_ITEM_ID = 'accepted-answer-secret-runtime-id';
const PRIVATE_STUDENT_ANSWER = 'SECRET_ACCEPTED_ANSWER_STUDENT_ANSWER';
const PRIVATE_STUDENT_NAME = 'SECRET_ACCEPTED_ANSWER_STUDENT_NAME';
const PRIVATE_TEACHER_ANSWER = 'SECRET_ACCEPTED_ANSWER_TEACHER_ANSWER';

test('assignment result accepted-answer chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentResultAcceptedAnswerChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Assignment result accepted-answer chain');
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
      ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES.length,
    csvExportsUseSharedAnswerView: true,
    exposesCsvDataUrlInHandoff: false,
    exposesPromptTextInHandoff: false,
    exposesRawRuntimeItemIdsInHandoff: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentNamesInHandoff: false,
    exposesTeacherAnswerTextInHandoff: false,
    itemIds,
    resultPagesUseSharedAnswerView: true,
    scoringUsesSharedAcceptedAnswerParser: true,
    sourceFiles: [...ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES],
    splitsPrimaryFromAlternatives: true,
    usesResultReviewHandoff: true,
  });
  assertNoPrivateAcceptedAnswerText(JSON.stringify(handoffView));
});

test('assignment result accepted-answer chain summarizes each boundary', () => {
  const handoffView = buildAssignmentResultAcceptedAnswerChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-accepted-answer-policy', 'Shared result formatting'],
      ['accepted-answer-parser-source', 'answer-matching.ts'],
      ['accepted-answer-separators', 'Slash/semicolon/Chinese'],
      ['accepted-answer-unique-normalization', 'Normalized dedupe'],
      ['accepted-answer-display-normalization', 'Runtime display text'],
      ['result-format-source', 'result-format.ts'],
      ['alternatives-empty-value', 'Empty value'],
      ['alternatives-single-answer-empty', 'No alternatives'],
      ['alternatives-exclude-primary', 'Primary split'],
      ['alternatives-localized-separator', 'Locale aware'],
      ['alternatives-custom-separator', 'Caller override'],
      ['primary-answer-source', 'First accepted answer'],
      ['optional-alternatives-null-empty', 'Null when empty'],
      ['result-answer-view-source', 'result-answer-view.ts'],
      ['expected-answer-text', 'Primary answer'],
      ['accepted-alternatives-text', 'Alternatives only'],
      ['optional-alternatives-line', 'Line when present'],
      ['attempt-answer-text-view', 'Shared attempt view'],
      ['analysis-per-item-accepted-answers', 'Accepted answers retained'],
      ['analysis-attempt-review-accepted-answers', 'Accepted answers retained'],
      ['item-card-accepted-line', 'Optional line'],
      ['item-performance-accepted-column', 'Accepted column'],
      ['attempt-review-card-accepted-line', 'Optional line'],
      ['csv-answer-view-consumer', 'Shared answer view'],
      ['csv-accepted-answer-column', 'accepted answers'],
      ['export-preparation-alternatives-slice', 'accepted-alternatives'],
      ['answer-feedback-chain-alignment', 'Answer feedback'],
      ['scored-result-chain-alignment', 'Scored attempts'],
      ['accepted-answer-privacy-guard', 'Raw data hidden'],
      ['result-review-handoff-boundary', '30 review slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'accepted-alternatives-text'),
    'Alternatives only'
  );
});

test('assignment result accepted-answer chain is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing accepted-answer chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS.length,
      SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 7 }, () => 30)
  );
});

test('accepted-answer formatters keep primary and alternatives explicit', () => {
  assert.equal(formatAcceptedAnswerAlternatives([]), '-');
  assert.equal(formatAcceptedAnswerAlternatives(['Paris']), '-');
  assert.equal(
    formatAcceptedAnswerAlternatives([
      ' Paris ',
      'paris',
      'Ｐａｒｉｓ',
      'Paris, France',
    ]),
    'Paris, Paris, France'
  );
  assert.equal(
    formatAcceptedAnswerAlternatives(['Paris', 'City of Light'], {
      includePrimary: false,
    }),
    'City of Light'
  );
  assert.equal(
    formatAcceptedAnswerAlternatives(['Paris', 'City of Light'], {
      separator: ' | ',
    }),
    'Paris | City of Light'
  );
  assert.equal(formatPrimaryAcceptedAnswer([' Paris ', 'City']), 'Paris');
  assert.equal(formatPrimaryAcceptedAnswer([]), '-');
  assert.equal(formatOptionalAcceptedAnswerAlternatives(['Paris']), null);
  assert.equal(
    formatOptionalAcceptedAnswerAlternatives(['Paris', 'City of Light'], {
      includePrimary: false,
    }),
    'City of Light'
  );

  const acceptedAnswerView = buildAssignmentResultAcceptedAnswerView([
    'Paris',
    'City of Light',
    'paris',
  ]);
  assert.deepEqual(acceptedAnswerView, {
    acceptedAlternativesText: 'City of Light',
    expectedAnswerText: 'Paris',
    optionalAcceptedAlternativesText: 'City of Light',
  });

  const attemptTextView = buildAssignmentResultAttemptAnswerTextView({
    acceptedAnswers: ['Paris', 'City of Light'],
    answer: 'Lyon',
    correct: false,
    expectedAnswer: 'Paris',
    explanation: 'Review the accepted alternative.',
    itemId: 'item-1',
    prompt: 'Capital of France',
    submitted: true,
  });
  assert.equal(attemptTextView.expectedAnswerText, 'Paris');
  assert.equal(attemptTextView.acceptedAlternativesText, 'City of Light');
  assert.equal(
    attemptTextView.optionalAcceptedAlternativesText,
    'City of Light'
  );
  assert.equal(attemptTextView.studentAnswerText, 'Lyon');
});

test('accepted-answer sources preserve shared parser and result formatting', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Accepted\s+alternatives must use the same parser as scoring[\s\S]*Result pages and CSV exports should share\s+assignment-domain formatting for submitted dates and accepted-answer\s+alternatives/,
    'docs/product.md should keep accepted-answer parser and result/export formatting shared.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /export function getAcceptedAnswers[\s\S]*split\([\s\S]*getUniqueAcceptedAnswers/,
    'Accepted answers should split through the shared parser with slash, semicolon, and Chinese separators.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /\\\/\|／\|;\|；\|、/,
    'Accepted-answer parser should keep slash, full-width slash, semicolon, Chinese semicolon, and ideographic comma separators.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /export function getUniqueAcceptedAnswers[\s\S]*normalizeAnswerForMatching\(displayValue\)[\s\S]*seen\.has\(normalized\)[\s\S]*acceptedAnswers\.push\(displayValue\)/,
    'Accepted answers should dedupe by normalized value while preserving display text.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /export function formatAcceptedAnswerAlternatives[\s\S]*const acceptedAnswers = getDisplayAcceptedAnswers\(values,[\s\S]*if \(acceptedAnswers\.length === 0\) return emptyValue[\s\S]*acceptedAnswers\.join\(/,
    'Accepted-answer alternatives should use shared display values and the result empty value.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /export function formatPrimaryAcceptedAnswer[\s\S]*const acceptedAnswers = getDisplayAcceptedAnswerValues\(values\)[\s\S]*formatAssignmentResultValue\(acceptedAnswers\[0\]/,
    'Primary expected answers should come from the first display accepted-answer value.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /export function formatOptionalAcceptedAnswerAlternatives[\s\S]*if \(acceptedAnswers\.length === 0\) return null[\s\S]*acceptedAnswers\.join/,
    'Optional accepted-answer alternatives should return null when no alternatives exist.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /getDisplayAcceptedAnswerValues[\s\S]*normalizeRuntimeDisplayList\(getUniqueAcceptedAnswers\(values\)\)/,
    'Accepted-answer display values should use unique accepted answers and runtime display normalization.'
  );
});

test('result pages and CSV exports reuse accepted-answer views', () => {
  assert.match(
    RESULT_ANSWER_VIEW_SOURCE,
    /buildAssignmentResultAcceptedAnswerView[\s\S]*acceptedAlternativesText: formatAcceptedAnswerAlternatives\([\s\S]*includePrimary: false[\s\S]*expectedAnswerText: formatPrimaryAcceptedAnswer[\s\S]*optionalAcceptedAlternativesText: formatOptionalAcceptedAnswerAlternatives\([\s\S]*includePrimary: false/,
    'Shared result answer views should split primary expected answers from accepted alternatives.'
  );
  assert.match(
    RESULT_ANSWER_VIEW_SOURCE,
    /(?=[\s\S]*buildAssignmentResultAttemptAnswerTextView)(?=[\s\S]*buildAssignmentResultAcceptedAnswerView\()(?=[\s\S]*exportStudentAnswerText)(?=[\s\S]*exportStatusLabel)(?=[\s\S]*statusLabel)(?=[\s\S]*studentAnswerText)/,
    'Attempt answer text views should combine student answer, expected answer, alternatives, and status.'
  );
  assert.match(
    RESULTS_SOURCE,
    /runtimeItems\.map\(\(item\) => \{[\s\S]*const acceptedAnswers = getResultAcceptedAnswers\(item\.answer\)[\s\S]*return \{[\s\S]*acceptedAnswers[\s\S]*expectedAnswer: normalizeRuntimeDisplayText\(item\.answer\)/,
    'Per-item result analysis should carry accepted answers from frozen runtime items.'
  );
  assert.match(
    RESULTS_SOURCE,
    /return runtimeItems\.map\(\(item\) => \{[\s\S]*const acceptedAnswers = getResultAcceptedAnswers\(item\.answer\)[\s\S]*return \{[\s\S]*acceptedAnswers[\s\S]*answer: normalizeRuntimeDisplayText\(submittedAnswer\?\.answer\)/,
    'Attempt review rows should carry accepted answers alongside submitted answer text.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentItemAnalysisCardView[\s\S]*buildAssignmentResultAcceptedAnswerView\([\s\S]*item\.acceptedAnswers[\s\S]*acceptedAnswersLineText[\s\S]*answerView\.optionalAcceptedAlternativesText/,
    'Item analysis cards should show accepted alternatives only from the shared answer view.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentItemPerformanceRowView[\s\S]*buildAssignmentResultAcceptedAnswerView\([\s\S]*acceptedAnswersText: answerView\.acceptedAlternativesText/,
    'Item performance rows should use the shared accepted-alternatives text.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentAttemptAnswerReviewView[\s\S]*buildAssignmentResultAttemptAnswerTextView\(answer\)[\s\S]*acceptedAnswersLineText[\s\S]*answerView\.optionalAcceptedAlternativesText/,
    'Attempt review cards should use the shared attempt answer text view.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /buildAssignmentResultsExportAnswerRow[\s\S]*buildAssignmentResultAttemptAnswerTextView\(answer,[\s\S]*acceptedAnswerEmptyValue: ''[\s\S]*answerView\.expectedAnswerText[\s\S]*answerView\.acceptedAlternativesText[\s\S]*answerView\.exportStatusLabel/,
    'CSV answer rows should reuse the shared answer view for expected answers, alternatives, and status.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /getAssignmentResultsExportAnswerColumns[\s\S]*assignment_results_export_column_expected_answer[\s\S]*assignment_results_export_column_accepted_answers/,
    'CSV export columns should include expected answer and accepted-answer columns.'
  );
});

test('accepted-answer consumers render through prepared view fields', () => {
  assert.match(
    ITEM_CARD_SOURCE,
    /itemView\.expectedAnswerSummaryText[\s\S]*itemView\.acceptedAnswersLineText[\s\S]*itemView\.acceptedAnswersLineText/,
    'Item analysis cards should render prepared expected and accepted-answer lines.'
  );
  assert.match(
    PERFORMANCE_TABLE_SOURCE,
    /rowView\.expectedAnswerText[\s\S]*rowView\.acceptedAnswersText/,
    'Item performance tables should render prepared expected and accepted-answer columns.'
  );
  assert.match(
    ATTEMPT_REVIEW_CARD_SOURCE,
    /answerView\.expectedAnswerLineText[\s\S]*answerView\.acceptedAnswersLineText[\s\S]*answerView\.acceptedAnswersLineText/,
    'Attempt review cards should render prepared expected and accepted-answer lines.'
  );
});

test('CSV accepted-answer formatting exports alternatives without repeating primary answers', () => {
  const csv = buildAssignmentResultsCsv({
    activity: {
      description: 'Live activity description',
      templateType: 'fill-blank',
      title: 'Live activity title',
    },
    analysis: {
      attempts: [
        {
          accuracy: 50,
          answers: [
            {
              acceptedAnswers: ['Paris', 'City of Light', 'paris'],
              answer: 'Lyon',
              correct: false,
              expectedAnswer: 'Paris',
              explanation: 'Review the accepted alternative.',
              itemId: 'item-1',
              prompt: 'Capital of France',
              submitted: true,
            },
          ],
          completedAt: new Date('2026-01-02T03:04:05.000Z'),
          durationSeconds: 95,
          id: 'attempt-1',
          score: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
      needsReview: [],
      perItem: [
        {
          acceptedAnswers: ['Paris', 'City of Light', 'paris'],
          correctCount: 0,
          correctRate: 0,
          expectedAnswer: 'Paris',
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
          averageAccuracy: 50,
          bestAccuracy: 50,
          lastCompletedAt: new Date('2026-01-02T03:04:05.000Z'),
          latestAccuracy: 50,
          needsReviewCount: 1,
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
        timeLimitSeconds: 60,
      },
      shareSlug: 'share-123',
      status: 'published',
      title: 'Accepted answer export check',
    },
    attempts: [
      {
        completedAt: new Date('2026-01-02T03:04:05.000Z'),
        id: 'attempt-1',
        maxScore: 2,
        resultJson: {
          accuracy: 50,
          completedItemCount: 1,
          durationSeconds: 95,
          totalPoints: 2,
        },
        score: 1,
      },
    ],
    now: Date.parse('2026-01-03T00:00:00.000Z'),
    snapshot: {
      activityDescription: 'Snapshot description',
      activityTitle: 'Snapshot title',
      templateType: 'fill-blank',
    },
    stats: {
      averageDurationSeconds: 95,
      averagePoints: 1,
      averageScore: 50,
      completions: 1,
    },
  });

  assert.match(
    csv,
    /"expected_answer","accepted_answers","correct","explanation"/
  );
  assert.match(
    csv,
    /"Paris","City of Light","review","Review the accepted alternative\."/
  );
  assert.doesNotMatch(csv, /"Paris, City of Light"/);
  assert.doesNotMatch(csv, /"Paris \/ City of Light"/);
});

test('assignment result accepted-answer focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment result accepted-answer continuity chain has a fast script-level gate[\s\S]*scripts\/assignment-result-accepted-answer-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the accepted-answer continuity chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /accepted-answer parser[\s\S]*primary-vs-alternatives\s+formatting[\s\S]*result cards[\s\S]*item performance columns[\s\S]*attempt review cards[\s\S]*CSV\s+accepted-answer columns/,
    'TEST-CATALOG should document the accepted-answer chain scope.'
  );
});

function getHandoffValue(
  view: AssignmentResultAcceptedAnswerChainHandoffView,
  id: AssignmentResultAcceptedAnswerChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing accepted-answer chain item ${id}`);
  return item.value;
}

function assertNoPrivateAcceptedAnswerText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_CSV_DATA_URL,
    PRIVATE_PROMPT_TEXT,
    PRIVATE_RUNTIME_ITEM_ID,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TEACHER_ANSWER,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Accepted-answer chain leaked private text: ${privateValue}`
    );
  }
}
