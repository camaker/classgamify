import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildAssignmentResultAnswerStatusView,
  buildAssignmentResultAttemptAnswerTextView,
} from '@/assignments/result-answer-view';
import { buildAssignmentAttemptReviewCardView } from '@/assignments/result-view';
import { buildAssignmentAttemptReviewSummary } from '@/assignments/result-review-summary';
import type { AssignmentAttemptReviewAnswer } from '@/assignments/results';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const RESULT_REVIEW_SUMMARY_SOURCE = readFileSync(
  'src/assignments/result-review-summary.ts',
  'utf8'
);
const RESULT_ANSWER_VIEW_SOURCE = readFileSync(
  'src/assignments/result-answer-view.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULT_FILTERS_SOURCE = readFileSync(
  'src/assignments/result-filters.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'utf8'
);
const CARD_COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'utf8'
);

const PRIVATE_ACCEPTED_ANSWER = 'PRIVATE_REVIEW_CARD_ACCEPTED_ANSWER';
const PRIVATE_ATTEMPT_ID = 'private-review-card-attempt-id';
const PRIVATE_PROMPT = 'PRIVATE_REVIEW_CARD_PROMPT';
const PRIVATE_STUDENT_ANSWER = 'PRIVATE_REVIEW_CARD_STUDENT_ANSWER';
const PRIVATE_STUDENT_LABEL = 'Private Review Student';
const PRIVATE_TEACHER_ANSWER = 'PRIVATE_REVIEW_CARD_TEACHER_ANSWER';

test('attempt review summary and answer helpers keep card counts shared', () => {
  const answers = buildAttemptReviewAnswers();
  const summary = buildAssignmentAttemptReviewSummary({ answers });

  assert.deepEqual(summary, {
    correctItemCount: 1,
    needsReviewItemCount: 2,
    submittedItemCount: 2,
    totalItemCount: 3,
    unansweredItemCount: 1,
  });

  assert.deepEqual(buildAssignmentResultAnswerStatusView(answers[0]), {
    exportLabel: 'correct',
    label: 'Correct',
    tone: 'correct',
  });
  assert.deepEqual(buildAssignmentResultAnswerStatusView(answers[1]), {
    exportLabel: 'review',
    label: 'Incorrect',
    tone: 'review',
  });
  assert.deepEqual(buildAssignmentResultAnswerStatusView(answers[2]), {
    exportLabel: 'unanswered',
    label: 'Unanswered',
    tone: 'idle',
  });

  const missedAnswerView = buildAssignmentResultAttemptAnswerTextView(
    answers[1]
  );
  assert.equal(missedAnswerView.studentAnswerText, PRIVATE_STUDENT_ANSWER);
  assert.equal(missedAnswerView.expectedAnswerText, PRIVATE_TEACHER_ANSWER);
  assert.equal(
    missedAnswerView.optionalAcceptedAlternativesText,
    PRIVATE_ACCEPTED_ANSWER
  );
  assert.equal(missedAnswerView.statusTone, 'review');

  const unansweredAnswerView = buildAssignmentResultAttemptAnswerTextView(
    answers[2]
  );
  assert.equal(unansweredAnswerView.studentAnswerText, 'Unanswered');
  assert.equal(unansweredAnswerView.exportStudentAnswerText, 'unanswered');
  assert.equal(unansweredAnswerView.statusTone, 'idle');
});

test('attempt review card source boundaries preserve domain ownership', () => {
  assert.match(
    RESULT_REVIEW_SUMMARY_SOURCE,
    /buildAssignmentAttemptReviewSummary[\s\S]*submittedItemCount[\s\S]*correctItemCount[\s\S]*needsReviewItemCount[\s\S]*unansweredItemCount/,
    'Attempt review card counts should come from the shared summary helper.'
  );
  assert.match(
    RESULT_ANSWER_VIEW_SOURCE,
    /buildAssignmentResultAttemptAnswerTextView[\s\S]*buildAssignmentResultAcceptedAnswerView[\s\S]*buildAssignmentResultAnswerStatusView[\s\S]*studentAnswerText/,
    'Attempt review answer rows should consume the shared answer text and status helpers.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentAttemptReviewCardView[\s\S]*buildAssignmentAttemptAnswerReviewViews\(attempt\.answers\)[\s\S]*buildAssignmentAttemptReviewSummaryMetricViews\(attempt\)/,
    'Result view models should prepare card evidence before React renders the card.'
  );
  assert.match(
    RESULT_FILTERS_SOURCE,
    /DEFAULT_ATTEMPT_REVIEW_FILTER[\s\S]*ATTEMPT_REVIEW_FILTER_VALUES[\s\S]*isAttemptReviewFilter/,
    'Attempt review filters should stay in assignment-domain route helpers.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /buildAssignmentResultsExportAnswerRow[\s\S]*buildAssignmentResultAttemptAnswerTextView\(answer,[\s\S]*getAssignmentResultsExportAnswerColumns/,
    'CSV exports should use the same attempt answer text view as review cards.'
  );
  assert.match(
    ROUTE_SOURCE,
    /validateSearch: buildAssignmentResultRouteSearch[\s\S]*pageView\.attemptReviewCardViews\.map\(\(attemptView\) =>[\s\S]*<AssignmentResultsAttemptReviewCard/,
    'The teacher result route should validate review filters and render prepared attempt review card views.'
  );
  assert.doesNotMatch(
    CARD_COMPONENT_SOURCE,
    /data-handoff|Handoff\b/,
    'Attempt review cards should render only visible answer rows and metrics.'
  );
});

test('attempt review card chain preserves visible card privacy', () => {
  const cardView = buildAssignmentAttemptReviewCardView({
    accuracy: 33,
    answers: buildAttemptReviewAnswers(),
    completedAt: new Date('2026-04-05T10:00:00.000Z'),
    id: PRIVATE_ATTEMPT_ID,
    score: 1,
    studentLabel: PRIVATE_STUDENT_LABEL,
  });

  assert.equal(cardView.id, PRIVATE_ATTEMPT_ID);
  assert.equal(cardView.studentLabel, PRIVATE_STUDENT_LABEL);
  assert.equal(cardView.answerViews.length, 3);
  const serializedCard = JSON.stringify(cardView);
  assert.equal(serializedCard.includes('anonymousToken'), false);
});

test('assignment attempt review card chain is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment attempt review card chain has a fast script-level gate via[\s\S]*scripts\/assignment-attempt-review-card-chain\.test\.ts/,
    'TEST-CATALOG should document the attempt review card chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /scored result persistence[\s\S]*answer review summaries[\s\S]*review filters[\s\S]*copy scope[\s\S]*CSV export[\s\S]*printable review alignment[\s\S]*privacy guards/,
    'TEST-CATALOG should document the attempt review card chain trigger scope.'
  );
});

function buildAttemptReviewAnswers(): AssignmentAttemptReviewAnswer[] {
  return [
    {
      acceptedAnswers: ['Paris', PRIVATE_ACCEPTED_ANSWER],
      answer: 'Paris',
      correct: true,
      expectedAnswer: PRIVATE_TEACHER_ANSWER,
      explanation: 'Correct explanation hidden from chain.',
      itemId: 'item-correct',
      prompt: `${PRIVATE_PROMPT} correct`,
      submitted: true,
    },
    {
      acceptedAnswers: [PRIVATE_TEACHER_ANSWER, PRIVATE_ACCEPTED_ANSWER],
      answer: PRIVATE_STUDENT_ANSWER,
      correct: false,
      expectedAnswer: PRIVATE_TEACHER_ANSWER,
      explanation: 'Review explanation hidden from chain.',
      itemId: 'item-review',
      prompt: `${PRIVATE_PROMPT} review`,
      submitted: true,
    },
    {
      acceptedAnswers: [PRIVATE_TEACHER_ANSWER, PRIVATE_ACCEPTED_ANSWER],
      answer: '',
      correct: false,
      expectedAnswer: PRIVATE_TEACHER_ANSWER,
      explanation: undefined,
      itemId: 'item-unanswered',
      prompt: `${PRIVATE_PROMPT} unanswered`,
      submitted: false,
    },
  ];
}
