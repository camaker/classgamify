import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildAssignmentResultsCsv } from '@/assignments/results-export';
import {
  formatAcceptedAnswerAlternatives,
  formatOptionalAcceptedAnswerAlternatives,
  formatPrimaryAcceptedAnswer,
} from '@/assignments/result-format';
import {
  buildAssignmentResultAcceptedAnswerView,
  buildAssignmentResultAttemptAnswerTextView,
} from '@/assignments/result-answer-view';
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
    /Assignment result accepted-answer continuity chain has a fast script-level gate[\s\S]*scripts\/assignment-result-accepted-answer-chain\.test\.ts/,
    'TEST-CATALOG should document the accepted-answer continuity chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /accepted-answer parser[\s\S]*primary-vs-alternatives\s+formatting[\s\S]*result cards[\s\S]*item performance columns[\s\S]*attempt review cards[\s\S]*CSV\s+accepted-answer columns/,
    'TEST-CATALOG should document the accepted-answer chain scope.'
  );
});
