import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES,
  buildAssignmentAttemptReviewCardChainHandoffView,
  type AssignmentAttemptReviewCardChainHandoffItemId,
  type AssignmentAttemptReviewCardChainHandoffView,
} from '@/assignments/attempt-review-card-chain';
import {
  ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptReviewCardHandoffEvidence,
  buildAssignmentAttemptReviewCardHandoffView,
} from '@/assignments/attempt-review-card-handoff';
import { ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS } from '@/assignments/copy-artifact-handoff';
import {
  ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES,
} from '@/assignments/result-accepted-answer-chain';
import {
  buildAssignmentResultAnswerStatusView,
  buildAssignmentResultAttemptAnswerTextView,
} from '@/assignments/result-answer-view';
import {
  ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES,
} from '@/assignments/result-explanation-chain';
import {
  ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES,
} from '@/assignments/result-submitted-date-chain';
import {
  ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptAnswerReviewViews,
  buildAssignmentAttemptReviewCardView,
} from '@/assignments/result-view';
import { buildAssignmentAttemptReviewSummary } from '@/assignments/result-review-summary';
import type { AssignmentAttemptReviewAnswer } from '@/assignments/results';
import { PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-review-lifecycle-chain';
import { SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/scored-attempt-result-chain';
import { TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-result-copy-lifecycle-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const HANDOFF_SOURCE = readFileSync(
  'src/assignments/attempt-review-card-handoff.ts',
  'utf8'
);
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
const PRIVATE_COPY_TEXT = 'PRIVATE_REVIEW_CARD_COPY_TEXT';
const PRIVATE_CSV_DATA_URL = 'data:text/csv,PRIVATE_REVIEW_CARD_CSV';
const PRIVATE_PROMPT = 'PRIVATE_REVIEW_CARD_PROMPT';
const PRIVATE_RAW_TOKEN = 'PRIVATE_REVIEW_CARD_RAW_TOKEN';
const PRIVATE_SHARE_SLUG = 'private-review-card-share-slug';
const PRIVATE_STUDENT_ANSWER = 'PRIVATE_REVIEW_CARD_STUDENT_ANSWER';
const PRIVATE_STUDENT_LABEL = 'Private Review Student';
const PRIVATE_TEACHER_ANSWER = 'PRIVATE_REVIEW_CARD_TEACHER_ANSWER';

test('assignment attempt review card chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentAttemptReviewCardChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Assignment attempt review card chain');
  assert.match(
    handoffView.description,
    /Thirty-slice assignment attempt review card chain/
  );
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
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES.length,
    connectsAcceptedAnswerChain: true,
    connectsExplanationChain: true,
    connectsPrintableReviewLifecycleChain: true,
    connectsScoredAttemptResultChain: true,
    connectsSubmittedDateChain: true,
    connectsTeacherResultCopyLifecycleChain: true,
    connectsTeacherResultsReviewChain: true,
    exposesAcceptedAnswerText: false,
    exposesAttemptId: false,
    exposesCopyArtifactText: false,
    exposesCsvDataUrls: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesShareSlug: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabel: false,
    exposesTeacherAnswerText: false,
    itemIds,
    mutatesResultData: false,
    preservesSnapshotAnswerOrder: true,
    protectsCopyScopeBoundary: true,
    protectsCsvExportBoundary: true,
    sourceFiles: [...ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES],
    usesAssignmentAttemptReviewCardHandoff: true,
    usesAssignmentDomainHelpers: true,
    usesResultReviewFilters: true,
    usesResultViewCardConsumer: true,
  });
  assertNoPrivateAttemptReviewCardChainText(JSON.stringify(handoffView));
});

test('assignment attempt review card chain summarizes each boundary', () => {
  const handoffView = buildAssignmentAttemptReviewCardChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['review-card-scope', 'Teacher answer review card'],
      ['student-display-boundary', 'Prepared display label'],
      ['submitted-time-display', 'Prepared submitted label'],
      ['score-badge', 'Prepared score badge'],
      ['summary-metric-count', 'Four review metrics'],
      ['submitted-count', 'Submitted/total count'],
      ['correct-count', 'Correct count'],
      ['needs-review-count', 'Needs-review count'],
      ['unanswered-count', 'Unanswered count'],
      ['answer-card-count', 'Answer row count'],
      ['answer-sequence', 'Snapshot answer order'],
      ['prompt-labels', 'Numbered prompts'],
      ['status-labels', 'Prepared status labels'],
      ['correct-status-count', 'Correct status count'],
      ['needs-review-status-count', 'Needs-review status count'],
      ['unanswered-status-count', 'Unanswered status count'],
      ['student-answer-lines', 'Prepared student-answer lines'],
      ['expected-answer-lines', 'Prepared expected-answer lines'],
      ['accepted-alternatives-lines', 'Prepared accepted-answer lines'],
      ['explanation-lines', 'Prepared explanation lines'],
      ['unsubmitted-answer-guard', 'Unanswered label guard'],
      ['answer-text-view-helper', 'buildAssignmentResultAttemptAnswerTextView'],
      ['answer-status-helper', 'buildAssignmentResultAnswerStatusView'],
      ['attempt-summary-helper', 'buildAssignmentAttemptReviewSummary'],
      ['review-card-consumer', 'buildAssignmentAttemptReviewCardView'],
      ['review-filter-consumer', 'Attempt review filter'],
      ['copy-scope-boundary', 'Current copy scope'],
      ['csv-export-boundary', 'Full CSV export'],
      ['anonymous-token-guard', 'Raw token hidden'],
      ['privacy-guard', 'Private review data hidden'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'attempt-summary-helper'),
    'buildAssignmentAttemptReviewSummary'
  );
});

test('assignment attempt review card chain is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing attempt review card chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 10 }, () => 30)
  );
  assert.equal(
    ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES.includes(
      'src/assignments/attempt-review-card-handoff.ts'
    ),
    true
  );
  assert.equal(
    ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES.includes(
      'src/assignments/attempt-review-card-handoff.ts'
    ),
    true
  );
  assert.equal(
    ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES.includes(
      'src/assignments/attempt-review-card-handoff.ts'
    ),
    true
  );
});

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
    label: 'Review',
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

test('attempt review card handoff evidence aggregates prepared rows only', () => {
  const answers = buildAttemptReviewAnswers();
  const answerViews = buildAssignmentAttemptAnswerReviewViews(answers);
  const evidence = buildAssignmentAttemptReviewCardHandoffEvidence({
    answers,
    answerViews,
    badgeLabel: '33% - 1 points',
    submittedAtLabel: 'Apr 5, 2026, 10:00 AM',
    summaryMetricCount: 4,
  });

  assert.deepEqual(evidence, {
    acceptedAlternativesLineCount: 3,
    answerCardCount: 3,
    correctAnswerCount: 1,
    correctStatusCount: 1,
    expectedAnswerLineCount: 3,
    explanationLineCount: 2,
    hasScoreBadge: true,
    hasSubmittedAtLabel: true,
    needsReviewAnswerCount: 2,
    needsReviewStatusCount: 1,
    statusLabelCount: 3,
    studentAnswerLineCount: 3,
    submittedAnswerCount: 2,
    summaryMetricCount: 4,
    totalAnswerCount: 3,
    unansweredAnswerCount: 1,
    unansweredStatusCount: 1,
  });

  const handoffView = buildAssignmentAttemptReviewCardHandoffView(evidence);

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS]
  );
  assert.equal(getVisibleHandoffValue(handoffView, 'submitted-count'), '2/3');
  assert.equal(getVisibleHandoffValue(handoffView, 'correct-count'), '1');
  assert.equal(getVisibleHandoffValue(handoffView, 'needs-review-count'), '2');
  assert.equal(getVisibleHandoffValue(handoffView, 'unanswered-count'), '1');
  assertNoPrivateAttemptReviewCardChainText(JSON.stringify(handoffView));
});

test('attempt review card source boundaries preserve domain ownership', () => {
  assert.match(
    HANDOFF_SOURCE,
    /ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS[\s\S]*buildAssignmentAttemptReviewCardHandoffEvidence[\s\S]*buildAssignmentAttemptReviewSummary[\s\S]*buildAssignmentAttemptReviewCardHandoffView/,
    'Attempt review card handoff should keep the 30-item evidence builder in the assignment domain.'
  );
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
    /buildAssignmentAttemptReviewCardView[\s\S]*buildAssignmentAttemptAnswerReviewViews\(attempt\.answers\)[\s\S]*buildAssignmentAttemptReviewSummaryMetricViews\(attempt\)[\s\S]*handoffView: buildAssignmentAttemptReviewCardHandoffView[\s\S]*buildAssignmentAttemptReviewCardHandoffEvidence/,
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
  assert.match(
    CARD_COMPONENT_SOURCE,
    /data-handoff="assignment-attempt-review-card"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*data-handoff-item=\{itemView\.id\}/,
    'Attempt review card components should render the hidden semantic handoff from prepared view data.'
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
  assert.deepEqual(
    cardView.handoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS]
  );
  assert.equal(cardView.handoffView.privacy.exposesAcceptedAnswerText, false);
  assert.equal(cardView.handoffView.privacy.exposesAttemptId, false);
  assert.equal(cardView.handoffView.privacy.exposesPromptText, false);
  assert.equal(cardView.handoffView.privacy.exposesRawAnonymousToken, false);
  assert.equal(cardView.handoffView.privacy.exposesStudentAnswerText, false);
  assert.equal(cardView.handoffView.privacy.exposesStudentDisplayLabel, false);
  assert.equal(cardView.handoffView.privacy.exposesTeacherAnswerText, false);
  assert.equal(cardView.handoffView.privacy.mutatesResultData, false);
  assert.equal(cardView.handoffView.privacy.usesAssignmentDomainHelpers, true);
  assertNoPrivateAttemptReviewCardChainText(
    JSON.stringify(cardView.handoffView)
  );
});

test('assignment attempt review card chain is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /attempt-review-card chain[\s\S]*30-slice source-level contract[\s\S]*scored-attempt persistence[\s\S]*answer review summaries[\s\S]*review filters[\s\S]*copy scope[\s\S]*CSV export[\s\S]*privacy guards/,
    'docs/product.md should document the attempt-review-card chain scope.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/assignments\/attempt-review-card-chain\.ts[\s\S]*source-level contract/i,
    'docs/product.md should name the attempt review card chain source file.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment attempt review card chain has a fast script-level gate via[\s\S]*scripts\/assignment-attempt-review-card-chain-handoff\.test\.ts/,
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

function getHandoffValue(
  view: AssignmentAttemptReviewCardChainHandoffView,
  id: AssignmentAttemptReviewCardChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing attempt review card chain item ${id}`);
  return item.value;
}

function getVisibleHandoffValue(
  view: ReturnType<typeof buildAssignmentAttemptReviewCardHandoffView>,
  id: AssignmentAttemptReviewCardChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing attempt review card handoff item ${id}`);
  return item.value;
}

function assertNoPrivateAttemptReviewCardChainText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACCEPTED_ANSWER,
    PRIVATE_ATTEMPT_ID,
    PRIVATE_COPY_TEXT,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_PROMPT,
    PRIVATE_RAW_TOKEN,
    PRIVATE_SHARE_SLUG,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_LABEL,
    PRIVATE_TEACHER_ANSWER,
    'Correct explanation hidden from chain.',
    'Review explanation hidden from chain.',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Attempt review card chain leaked private text: ${privateValue}`
    );
  }
}
