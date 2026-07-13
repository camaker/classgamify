export const SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS = [
  'product-scored-attempt-policy',
  'submit-api-lifecycle-gate',
  'submit-api-identity-gate',
  'attempt-limit-gate',
  'runtime-answer-validation',
  'duration-normalization',
  'runtime-scoring-evaluation',
  'scored-insert-builder',
  'answers-json-clone',
  'result-json-clone',
  'score-field-mapping',
  'public-result-sanitization',
  'public-review-summary',
  'public-feedback-policy',
  'attempt-query-scored-filter',
  'attempt-stats-consumer',
  'assignment-list-stats-consumer',
  'result-analysis-consumer',
  'teacher-review-state',
  'attempt-review-cards',
  'classroom-brief-consumer',
  'copy-artifact-consumer',
  'csv-export-consumer',
  'csv-formula-guard',
  'printable-result-return',
  'duration-display-consistency',
  'accepted-alternatives-consistency',
  'anonymous-token-guard',
  'source-material-guard',
  'attempt-review-card-handoff-boundary',
] as const;

export const SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/assignments.ts',
  'src/routes/play/$shareId.tsx',
  'src/routes/dashboard/assignments.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'src/routes/print/assignments/$assignmentId.tsx',
  'src/assignments/student-submission.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/submission-limits.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/attempt-stats-handoff.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/list-view.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-review-summary.ts',
  'src/assignments/result-answer-view.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/result-copy-format.ts',
  'src/assignments/results-export.ts',
  'src/assignments/printable-worksheet.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-play-chain.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ScoredAttemptResultChainHandoffItemId =
  (typeof SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ScoredAttemptResultChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ScoredAttemptResultChainHandoffItemId;
  label: string;
  value: string;
};

export type ScoredAttemptResultChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerKeysBeforeAllowedReview: false;
  exposesCsvDataUrlInHandoff: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIdsInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentNamesInHandoff: false;
  exposesTeacherOnlyAnswersInHandoff: false;
  itemIds: ScoredAttemptResultChainHandoffItemId[];
  publicResponseUsesSanitizedResult: true;
  resultConsumersUseScoredAttempts: true;
  sourceFiles: string[];
  storesImmutableAnswerJson: true;
  storesImmutableResultJson: true;
  usesSharedAttemptStats: true;
  usesSharedDurationFormatting: true;
  usesAttemptReviewCardHandoff: true;
};

export type ScoredAttemptResultChainHandoffView = {
  description: string;
  itemViews: ScoredAttemptResultChainHandoffItemView[];
  privacy: ScoredAttemptResultChainPrivacyContract;
  title: string;
};

export function buildScoredAttemptResultChainHandoffView(): ScoredAttemptResultChainHandoffView {
  const itemViews = SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildScoredAttemptResultChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice scored attempt result chain from validated student submissions and immutable scored-attempt persistence through sanitized public feedback, shared stats, teacher result review, copy artifacts, CSV export, printable review return, and privacy guards.',
    itemViews,
    privacy: {
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
      itemIds: [...SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS],
      publicResponseUsesSanitizedResult: true,
      resultConsumersUseScoredAttempts: true,
      sourceFiles: [...SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES],
      storesImmutableAnswerJson: true,
      storesImmutableResultJson: true,
      usesSharedAttemptStats: true,
      usesSharedDurationFormatting: true,
      usesAttemptReviewCardHandoff: true,
    },
    title: 'Scored attempt result chain',
  };
}

function buildScoredAttemptResultChainHandoffItemView(
  id: ScoredAttemptResultChainHandoffItemId
): ScoredAttemptResultChainHandoffItemView {
  const item = getScoredAttemptResultChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getScoredAttemptResultChainHandoffItem(
  id: ScoredAttemptResultChainHandoffItemId
): Omit<ScoredAttemptResultChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-scored-attempt-policy':
      return item(
        id,
        'Scored attempt policy',
        'Submit -> review',
        'The post-submit result boundary stays shared from student submission through public feedback and teacher result consumers.'
      );
    case 'submit-api-lifecycle-gate':
      return item(
        id,
        'Submit API lifecycle gate',
        'Open assignment only',
        'Submit-attempt requests must pass the assignment lifecycle gate before scoring or persistence can happen.'
      );
    case 'submit-api-identity-gate':
      return item(
        id,
        'Submit API identity gate',
        'Name or browser token',
        'Submit-attempt requests resolve named or anonymous identity before enforcing limits and storing attempts.'
      );
    case 'attempt-limit-gate':
      return item(
        id,
        'Attempt-limit gate',
        'Per identity',
        'Attempt limits count previous scored attempts for the same normalized student identity before insertion.'
      );
    case 'runtime-answer-validation':
      return item(
        id,
        'Runtime answer validation',
        'Frozen runtime ids',
        'Submitted answers are normalized and checked against the ordered frozen runtime items before scoring.'
      );
    case 'duration-normalization':
      return item(
        id,
        'Duration normalization',
        'Timer capped seconds',
        'Submitted browser durations are normalized to whole non-negative seconds and capped by assignment timer settings.'
      );
    case 'runtime-scoring-evaluation':
      return item(
        id,
        'Runtime scoring evaluation',
        'evaluateRuntimeAnswers',
        'Runtime scoring produces the answer rows and result metrics consumed by persistence, feedback, and teacher review.'
      );
    case 'scored-insert-builder':
      return item(
        id,
        'Scored insert builder',
        'buildScoredAttemptInsert',
        'Scored-attempt rows are built through the shared assignment-domain insert helper.'
      );
    case 'answers-json-clone':
      return item(
        id,
        'Answers JSON clone',
        'Immutable answer rows',
        'Persisted answer JSON clones the scored answer rows so later mutations cannot rewrite stored submissions.'
      );
    case 'result-json-clone':
      return item(
        id,
        'Result JSON clone',
        'Immutable result',
        'Persisted result JSON clones the scored result object before public or teacher consumers read it.'
      );
    case 'score-field-mapping':
      return item(
        id,
        'Score field mapping',
        'earned/max points',
        'Score and max score fields map directly from earned and total points in the scored result.'
      );
    case 'public-result-sanitization':
      return item(
        id,
        'Public result sanitization',
        'Public score view',
        'The submit response returns a sanitized public result instead of raw scorer output or database rows.'
      );
    case 'public-review-summary':
      return item(
        id,
        'Public review summary',
        'Review summary',
        'Public review summary views derive from the scored evaluation and ordered runtime items after submission.'
      );
    case 'public-feedback-policy':
      return item(
        id,
        'Public feedback policy',
        'Reveal if allowed',
        'Student feedback exposes accepted answers and explanations only after scoring and only when assignment policy allows review.'
      );
    case 'attempt-query-scored-filter':
      return item(
        id,
        'Scored query filter',
        'resultJson required',
        'Result-facing queries filter to completed attempts that have scored result JSON.'
      );
    case 'attempt-stats-consumer':
      return item(
        id,
        'Attempt stats consumer',
        'Shared metrics',
        'Completions, accuracy, points, and duration are summarized from scored result records.'
      );
    case 'assignment-list-stats-consumer':
      return item(
        id,
        'Assignment list stats',
        'Card/list metrics',
        'Assignment list summaries and cards use the same scored-attempt stats helpers as result pages.'
      );
    case 'result-analysis-consumer':
      return item(
        id,
        'Result analysis consumer',
        'Stored answers',
        'Teacher result analysis combines frozen runtime items with stored answers and result JSON.'
      );
    case 'teacher-review-state':
      return item(
        id,
        'Teacher review state',
        'Current review',
        'Result review state, filters, matched counts, and next steps are prepared from the same scored result scope.'
      );
    case 'attempt-review-cards':
      return item(
        id,
        'Attempt review cards',
        'Answer review',
        'Attempt review cards render teacher-only answer status, submitted state, accepted answers, and explanations from stored attempts.'
      );
    case 'classroom-brief-consumer':
      return item(
        id,
        'Classroom brief consumer',
        'Reteach evidence',
        'Classroom briefs reuse the scored result analysis for metrics, low-performing items, and follow-up students.'
      );
    case 'copy-artifact-consumer':
      return item(
        id,
        'Copy artifact consumer',
        'Current review copy',
        'Teacher copy artifacts are generated from the current review scope without mutating attempts or exposing raw payloads.'
      );
    case 'csv-export-consumer':
      return item(
        id,
        'CSV export consumer',
        'Full assignment export',
        'CSV export rows consume stored attempts, scored results, delivery policy, and item analysis for offline review.'
      );
    case 'csv-formula-guard':
      return item(
        id,
        'CSV formula guard',
        'Formula prefix',
        'CSV formatting prefixes spreadsheet formula-like text before exporting teacher result data.'
      );
    case 'printable-result-return':
      return item(
        id,
        'Printable result return',
        'Back to results',
        'Printable worksheet review stays teacher-controlled and returns to the same result page evidence.'
      );
    case 'duration-display-consistency':
      return item(
        id,
        'Duration display consistency',
        'Shared duration view',
        'Student result displays, attempt rows, averages, and CSV fields use shared duration normalization and formatting.'
      );
    case 'accepted-alternatives-consistency':
      return item(
        id,
        'Accepted alternatives',
        'Shared formatting',
        'Student feedback, teacher answer review, copy summaries, and CSV exports share accepted-answer formatting.'
      );
    case 'anonymous-token-guard':
      return item(
        id,
        'Anonymous token guard',
        'Raw token hidden',
        'Anonymous browser tokens may enforce limits and grouping but remain hidden from handoffs and public responses.'
      );
    case 'source-material-guard':
      return item(
        id,
        'Source material guard',
        'Storage keys hidden',
        'Scored-attempt result handoffs do not expose source-material storage keys, file ids, or metadata.'
      );
    case 'attempt-review-card-handoff-boundary':
      return item(
        id,
        'Attempt review card handoff boundary',
        '30 review card slices',
        'Student display, submission time, score and answer summaries, snapshot-ordered answer cards, statuses, accepted alternatives, explanations, review filters, copy/export scope, and privacy guards stay aligned.'
      );
  }
}

function item(
  id: ScoredAttemptResultChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ScoredAttemptResultChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
