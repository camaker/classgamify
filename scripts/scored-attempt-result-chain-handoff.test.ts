import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS } from '@/assignments/attempt-review-card-handoff';
import { ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-lifecycle-chain';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';
import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import {
  SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS,
  SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES,
  buildScoredAttemptResultChainHandoffView,
  type ScoredAttemptResultChainHandoffItemId,
  type ScoredAttemptResultChainHandoffView,
} from '@/assignments/scored-attempt-result-chain';
import { STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-play-chain';
import { STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-state';
import { TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-result-copy-lifecycle-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/attempt-persistence.ts',
  'utf8'
);
const ATTEMPT_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const ATTEMPT_STATS_SOURCE = readFileSync(
  'src/assignments/attempt-stats.ts',
  'utf8'
);
const LIST_SUMMARY_SOURCE = readFileSync(
  'src/assignments/list-summary.ts',
  'utf8'
);
const LIST_VIEW_SOURCE = readFileSync('src/assignments/list-view.ts', 'utf8');
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
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
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_TEXT = 'SECRET_SCORED_ATTEMPT_ANSWER';
const PRIVATE_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const PRIVATE_SOURCE_MATERIAL = 'source-materials/private/scored-result.pdf';
const PRIVATE_STUDENT_NAME = 'SECRET_STUDENT_NAME';
const PRIVATE_RUNTIME_ITEM_ID = 'runtime-item-secret-id';
const PRIVATE_CSV_DATA_URL = 'data:text/csv;charset=utf-8,SECRET';

test('scored attempt result chain exposes 30 safe result slices', () => {
  const handoffView = buildScoredAttemptResultChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Scored attempt result chain');
  assert.match(handoffView.description, /Thirty-slice scored attempt/);
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
    chainSourceFileCount: SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES.length,
    exposesAnswerKeysBeforeAllowedReview: false,
    exposesCsvDataUrlInHandoff: false,
    exposesRawAnonymousTokens: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIdsInHandoff: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentNamesInHandoff: false,
    exposesTeacherOnlyAnswersInHandoff: false,
    itemIds,
    publicResponseUsesSanitizedResult: true,
    resultConsumersUseScoredAttempts: true,
    sourceFiles: [...SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES],
    storesImmutableAnswerJson: true,
    storesImmutableResultJson: true,
    usesSharedAttemptStats: true,
    usesSharedDurationFormatting: true,
    usesAttemptReviewCardHandoff: true,
  });
  assertNoPrivateScoredResultText(JSON.stringify(handoffView));
});

test('scored attempt result chain summarizes each post-submit boundary', () => {
  const handoffView = buildScoredAttemptResultChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-scored-attempt-policy', 'Submit -> review'],
      ['submit-api-lifecycle-gate', 'Open assignment only'],
      ['submit-api-identity-gate', 'Name or browser token'],
      ['attempt-limit-gate', 'Per identity'],
      ['runtime-answer-validation', 'Frozen runtime ids'],
      ['duration-normalization', 'Timer capped seconds'],
      ['runtime-scoring-evaluation', 'evaluateRuntimeAnswers'],
      ['scored-insert-builder', 'buildScoredAttemptInsert'],
      ['answers-json-clone', 'Immutable answer rows'],
      ['result-json-clone', 'Immutable result'],
      ['score-field-mapping', 'earned/max points'],
      ['public-result-sanitization', 'Public score view'],
      ['public-review-summary', 'Review summary'],
      ['public-feedback-policy', 'Reveal if allowed'],
      ['attempt-query-scored-filter', 'resultJson required'],
      ['attempt-stats-consumer', 'Shared metrics'],
      ['assignment-list-stats-consumer', 'Card/list metrics'],
      ['result-analysis-consumer', 'Stored answers'],
      ['teacher-review-state', 'Current review'],
      ['attempt-review-cards', 'Answer review'],
      ['classroom-brief-consumer', 'Reteach evidence'],
      ['copy-artifact-consumer', 'Current review copy'],
      ['csv-export-consumer', 'Full assignment export'],
      ['csv-formula-guard', 'Formula prefix'],
      ['printable-result-return', 'Back to results'],
      ['duration-display-consistency', 'Shared duration view'],
      ['accepted-alternatives-consistency', 'Shared formatting'],
      ['anonymous-token-guard', 'Raw token hidden'],
      ['source-material-guard', 'Storage keys hidden'],
      ['attempt-review-card-handoff-boundary', '30 review card slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'result-analysis-consumer'),
    'Stored answers'
  );
});

test('scored attempt result chain is backed by adjacent result gates', () => {
  assert.equal(SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing scored attempt result chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 11 }, () => 30)
  );
});

test('scored attempt result sources preserve submit, score, and persistence boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /submission contract remains template-neutral[\s\S]*server rejects answers[\s\S]*shared assignment-domain helpers[\s\S]*post-submit result boundary[\s\S]*public feedback[\s\S]*assignment stats[\s\S]*teacher result analysis[\s\S]*30-slice attempt review card handoff[\s\S]*copy artifacts[\s\S]*CSV export/,
    'docs/product.md should describe the shared post-submit scored-result boundary.'
  );
  assert.match(
    API_SOURCE,
    /(?=[\s\S]*resolveAttemptSubmissionIdentity\(\{)(?=[\s\S]*recoverAttemptSubmissionResponse\(\{)(?=[\s\S]*assertAssignmentAcceptsSubmissions\(\{)(?=[\s\S]*countPreviousIdentityAttempts\(\{)(?=[\s\S]*canUseAnotherAssignmentAttempt\(\{)(?=[\s\S]*normalizeSubmittedAttemptAnswers\(data\.answers\))(?=[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{)(?=[\s\S]*evaluateRuntimeAnswers\(\{)(?=[\s\S]*buildScoredAttemptInsert\(\{)(?=[\s\S]*function buildAttemptSubmissionResponse)(?=[\s\S]*buildPublicAttemptResult\(result\))(?=[\s\S]*buildPublicAttemptReviewSummaryView\(\{)/,
    'Submit-attempt API should gate lifecycle, identity, limits, runtime answers, scoring, persistence, public result, and review summary in order.'
  );
  assert.match(
    ATTEMPT_PERSISTENCE_SOURCE,
    /(?=[\s\S]*score: evaluation\.result\.earnedPoints)(?=[\s\S]*maxScore: evaluation\.result\.totalPoints)(?=[\s\S]*answers:\s*cloneAttemptAnswerRows\(evaluation\.answers\))(?=[\s\S]*resultJson:\s*cloneAttemptResult\(evaluation\.result\))/,
    'Scored-attempt persistence should map score fields and clone answer/result JSON.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /(?=[\s\S]*buildStudentAttemptResultDisplay)(?=[\s\S]*buildStudentAttemptReviewSummaryView)(?=[\s\S]*buildStudentAttemptFeedbackScopeView)(?=[\s\S]*buildStudentAttemptResultNextStepsView)/,
    'Student submission helpers should prepare sanitized result, review, feedback, and next-step views after submit.'
  );
  assert.match(
    ATTEMPT_QUERY_SOURCE,
    /(?=[\s\S]*buildScoredAttemptWhere[\s\S]*isNotNull\(attempt\.resultJson\))(?=[\s\S]*buildAssignmentResultsAttemptSelect)(?=[\s\S]*answersJson)(?=[\s\S]*resultJson)(?=[\s\S]*score)(?=[\s\S]*maxScore)/,
    'Attempt queries should expose scored-attempt selects with stored answers, result, score, and max score.'
  );
});

test('scored attempt result consumers keep stats, review, export, and print aligned', () => {
  assert.match(
    ATTEMPT_STATS_SOURCE,
    /const completedAttempts = attempts\.filter\(hasAttemptResult\)[\s\S]*averageDurationSeconds[\s\S]*getAttemptDurationSeconds[\s\S]*averagePoints[\s\S]*getAttemptPoints[\s\S]*averageScore[\s\S]*getAttemptAccuracy/,
    'Attempt stats should derive completions, duration, points, and accuracy from scored result rows.'
  );
  assert.match(
    LIST_SUMMARY_SOURCE,
    /(?=[\s\S]*summarizeAssignmentAttempts\(attempts,)(?=[\s\S]*buildAssignmentAttemptStatsView\(resolvedSummary\))/,
    'Assignment list summaries should use shared attempt stats helpers.'
  );
  assert.match(
    LIST_VIEW_SOURCE,
    /buildAssignmentListCardStats[\s\S]*buildAssignmentAttemptStatsView/,
    'Assignment cards should use the same scored-attempt stats view.'
  );
  assert.match(
    RESULTS_SOURCE,
    /(?=[\s\S]*const completedAttempts = attempts\.filter\(hasAttemptResult\))(?=[\s\S]*buildAttemptAnswerMapByItemId\(\s*attempt\.answersJson\.answers\s*\))(?=[\s\S]*attempt\.resultJson)(?=[\s\S]*normalizeAttemptDurationSeconds)/,
    'Teacher result analysis should read stored answer/result JSON and normalize durations.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /(?=[\s\S]*buildAssignmentResultMetricItems[\s\S]*buildAssignmentAttemptStatsView)(?=[\s\S]*buildAssignmentAttemptReviewCardViews)(?=[\s\S]*buildAssignmentResultCopyArtifacts)/,
    'Result view models should prepare shared metrics, attempt review cards, and copy artifacts from result scope.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /const storedAttempt = exportContext\.attemptsById\.get\(attempt\.id\)[\s\S]*storedAttempt\?\.score \?\? attempt\.score[\s\S]*storedAttempt\?\.maxScore[\s\S]*storedAttempt\?\.resultJson\?\.completedItemCount[\s\S]*CSV_FORMULA_PREFIX_PATTERN/,
    'CSV export should consume stored attempts and keep formula injection protection.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_VIEW_SOURCE,
    /(?=[\s\S]*buildPrintableWorksheetControlView)(?=[\s\S]*backToResultsAction)(?=[\s\S]*assignment_printable_back_to_results)(?=[\s\S]*Routes\.DashboardAssignmentResults)/,
    'Printable worksheet views should preserve the teacher return-to-results boundary.'
  );
});

test('scored attempt result focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Scored attempt result lifecycle chain has a fast script-level gate via[\s\S]*scripts\/scored-attempt-result-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the scored attempt result lifecycle gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /post-submit scored-result boundary[\s\S]*public\s+feedback[\s\S]*attempt\s+stats[\s\S]*teacher\s+result\s+review[\s\S]*30-slice attempt review card[\s\S]*copy\s+artifacts[\s\S]*CSV\s+export[\s\S]*printable\s+review\s+return/,
    'TEST-CATALOG should describe the scored attempt result lifecycle scope.'
  );
});

function getHandoffValue(
  view: ScoredAttemptResultChainHandoffView,
  id: ScoredAttemptResultChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing scored attempt result chain item ${id}`);
  return item.value;
}

function assertNoPrivateScoredResultText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_TEXT,
    PRIVATE_ANONYMOUS_TOKEN,
    PRIVATE_SOURCE_MATERIAL,
    PRIVATE_STUDENT_NAME,
    PRIVATE_RUNTIME_ITEM_ID,
    PRIVATE_CSV_DATA_URL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Scored attempt result chain leaked private text: ${privateValue}`
    );
  }
}
