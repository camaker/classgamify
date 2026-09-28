import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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

test('scored attempt result sources preserve submit, score, and persistence boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /submission contract remains template-neutral[\s\S]*server rejects answers[\s\S]*shared assignment-domain helpers[\s\S]*post-submit result boundary[\s\S]*public feedback[\s\S]*assignment stats[\s\S]*teacher result analysis[\s\S]*answer review cards[\s\S]*copy artifacts[\s\S]*CSV export/,
    'docs/product.md should describe the shared post-submit scored-result boundary.'
  );
  assert.match(
    API_SOURCE,
    /(?=[\s\S]*resolveAttemptSubmissionIdentity\(\{)(?=[\s\S]*recoverAttemptSubmissionResponse\(\{)(?=[\s\S]*assertAssignmentAcceptsSubmissions\(\{)(?=[\s\S]*persistAttemptWithinIdentityLimit\(\{)(?=[\s\S]*countPreviousAttempts:[\s\S]*countPreviousIdentityAttempts\(\{)(?=[\s\S]*insertAttempt:[\s\S]*buildScoredAttemptInsert\(\{[\s\S]*identitySlot,)(?=[\s\S]*isAttemptIdentitySlotOccupied\(\{)(?=[\s\S]*persistence\.type === 'limit-reached')(?=[\s\S]*normalizeSubmittedAttemptAnswers\(data\.answers\))(?=[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{)(?=[\s\S]*evaluateRuntimeAnswers\(\{)(?=[\s\S]*function buildAttemptSubmissionResponse)(?=[\s\S]*buildPublicAttemptResult\(result\))(?=[\s\S]*buildPublicAttemptReviewSummaryView\(\{)/,
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
    /Scored attempt result lifecycle chain has a fast script-level gate via[\s\S]*scripts\/scored-attempt-result-chain\.test\.ts/,
    'TEST-CATALOG should document the scored attempt result lifecycle gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /post-submit scored-result boundary[\s\S]*public\s+feedback[\s\S]*attempt\s+stats[\s\S]*teacher\s+result\s+review[\s\S]*30-slice attempt review card[\s\S]*copy\s+artifacts[\s\S]*CSV\s+export[\s\S]*printable\s+review\s+return/,
    'TEST-CATALOG should describe the scored attempt result lifecycle scope.'
  );
});
