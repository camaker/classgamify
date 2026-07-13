export const TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS = [
  'result-route-owner-scope',
  'frozen-snapshot-source',
  'attempt-stats-summary',
  'assignment-metric-cards',
  'review-status-summary',
  'review-scope-controls',
  'student-search-normalization',
  'attempt-review-filter',
  'student-summary-sort',
  'item-performance-sort',
  'item-analysis-priority',
  'attempt-review-cards',
  'answer-review-status',
  'accepted-alternatives-format',
  'duration-formatting',
  'classroom-brief',
  'lowest-performing-items',
  'student-follow-up-priority',
  'reteach-plan-copy',
  'item-review-copy',
  'student-follow-up-copy',
  'copy-artifact-boundary',
  'csv-export-preparation',
  'delivery-policy-export',
  'result-material-handoff',
  'empty-state-guidance',
  'anonymous-token-guard',
  'source-material-guard',
  'public-runner-boundary',
  'result-review-controls-boundary',
] as const;

export const TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'src/api/assignments.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/result-filters.ts',
  'src/assignments/result-review-summary.ts',
  'src/assignments/result-answer-view.ts',
  'src/assignments/result-format.ts',
  'src/assignments/result-display.ts',
  'src/assignments/result-summary-format.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/attempt-stats-handoff.ts',
  'src/assignments/review-priority.ts',
  'src/assignments/student-follow-up-summary.ts',
  'src/assignments/student-follow-up-priority.ts',
  'src/assignments/item-review-summary.ts',
  'src/assignments/classroom-brief.ts',
  'src/assignments/reteach-plan.ts',
  'src/assignments/copy-artifact-handoff.ts',
  'src/assignments/results-export.ts',
  'src/assignments/result-student-search-handoff.ts',
  'src/assignments/result-empty-state-handoff.ts',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/item-performance-sort-handoff.ts',
  'src/assignments/student-summary-sort-handoff.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
] as const;

export type TeacherResultsReviewChainHandoffItemId =
  (typeof TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS)[number];

export type TeacherResultsReviewChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: TeacherResultsReviewChainHandoffItemId;
  label: string;
  value: string;
};

export type TeacherResultsReviewChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAcceptedAlternativesToTeachersOnly: true;
  exposesAnswerKeysToPublicRunner: false;
  exposesCopyArtifactText: false;
  exposesRawAnonymousToken: false;
  exposesRawAnonymousTokens: false;
  exposesRawRouteQuery: false;
  exposesRawCopyArtifactsInHandoff: false;
  exposesRawCsvDataUrlInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentDisplayLabels: false;
  exposesTeacherAnswerKey: false;
  itemIds: TeacherResultsReviewChainHandoffItemId[];
  mutatesResultData: false;
  preservesFrozenSnapshots: true;
  resultExportsIncludeDeliveryPolicy: true;
  sourceFiles: string[];
  usesSharedAttemptStats: true;
  usesAssignmentDomainHelpers: true;
  usesResultReviewControlsHandoff: true;
  usesTeacherOnlyResultScope: true;
};

export type TeacherResultsReviewChainHandoffView = {
  description: string;
  itemViews: TeacherResultsReviewChainHandoffItemView[];
  privacy: TeacherResultsReviewChainPrivacyContract;
  title: string;
};

export function buildTeacherResultsReviewChainHandoffView(): TeacherResultsReviewChainHandoffView {
  const itemViews = TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildTeacherResultsReviewChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice teacher results review chain from owner-scoped frozen assignments and shared attempt stats through result review controls, review filters, reteach priorities, classroom briefs, copy artifacts, CSV exports, and private result-review boundaries.',
    itemViews,
    privacy: {
      chainSourceFileCount: TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES.length,
      exposesAcceptedAlternativesToTeachersOnly: true,
      exposesAnswerKeysToPublicRunner: false,
      exposesCopyArtifactText: false,
      exposesRawAnonymousToken: false,
      exposesRawAnonymousTokens: false,
      exposesRawRouteQuery: false,
      exposesRawCopyArtifactsInHandoff: false,
      exposesRawCsvDataUrlInHandoff: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentDisplayLabels: false,
      exposesTeacherAnswerKey: false,
      itemIds: [...TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS],
      mutatesResultData: false,
      preservesFrozenSnapshots: true,
      resultExportsIncludeDeliveryPolicy: true,
      sourceFiles: [...TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES],
      usesSharedAttemptStats: true,
      usesAssignmentDomainHelpers: true,
      usesResultReviewControlsHandoff: true,
      usesTeacherOnlyResultScope: true,
    },
    title: 'Teacher results review chain',
  };
}

function buildTeacherResultsReviewChainHandoffItemView(
  id: TeacherResultsReviewChainHandoffItemId
): TeacherResultsReviewChainHandoffItemView {
  const item = getTeacherResultsReviewChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getTeacherResultsReviewChainHandoffItem(
  id: TeacherResultsReviewChainHandoffItemId
): Omit<TeacherResultsReviewChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'result-route-owner-scope':
      return item(
        id,
        'Result route owner scope',
        'Teacher assignment only',
        'Result pages load assignment detail, snapshot, and attempts through owner-scoped route and query contracts.'
      );
    case 'frozen-snapshot-source':
      return item(
        id,
        'Frozen snapshot source',
        'AssignmentSnapshot',
        'Result analysis uses the frozen published snapshot instead of mutable activity content.'
      );
    case 'attempt-stats-summary':
      return item(
        id,
        'Attempt stats summary',
        'Shared metrics',
        'Completed attempts, average accuracy, points, and duration are computed through shared attempt-stats helpers.'
      );
    case 'assignment-metric-cards':
      return item(
        id,
        'Assignment metric cards',
        'Prepared metrics',
        'Result metric cards expose prepared labels, values, descriptions, and accessible labels from result-domain helpers.'
      );
    case 'review-status-summary':
      return item(
        id,
        'Review status summary',
        'Current review state',
        'Review status summarizes matched attempts, missed items, search state, and next review steps.'
      );
    case 'review-scope-controls':
      return item(
        id,
        'Review scope controls',
        'URL-backed controls',
        'Attempt filters, student search, item sort, and student sort stay in route state for repeat review passes.'
      );
    case 'student-search-normalization':
      return item(
        id,
        'Student search normalization',
        'Anonymous labels',
        'Student search matches normalized display labels without exposing raw anonymous tokens.'
      );
    case 'attempt-review-filter':
      return item(
        id,
        'Attempt review filter',
        'All or missed',
        'Teachers can switch between all submissions and attempts needing review through result-domain filters.'
      );
    case 'student-summary-sort':
      return item(
        id,
        'Student summary sort',
        'Review order',
        'Student summaries sort by review need, score, name, attempt volume, or latest submission.'
      );
    case 'item-performance-sort':
      return item(
        id,
        'Item performance sort',
        'Lowest accuracy first',
        'Item performance rows can keep snapshot order or sort by accuracy, submitted count, or item type.'
      );
    case 'item-analysis-priority':
      return item(
        id,
        'Item analysis priority',
        'Reteach priorities',
        'Frozen runtime items and stored answers produce reteach priorities and per-item correct rates.'
      );
    case 'attempt-review-cards':
      return item(
        id,
        'Attempt review cards',
        'Item-level review',
        'Attempt review cards prepare answer status, submitted state, accepted answers, explanations, and review labels.'
      );
    case 'answer-review-status':
      return item(
        id,
        'Answer review status',
        'Correct or needs review',
        'Teacher answer review status derives from shared scoring and runtime-answer helpers.'
      );
    case 'accepted-alternatives-format':
      return item(
        id,
        'Accepted alternatives format',
        'Shared formatter',
        'Result pages and CSV exports format primary accepted answers and alternatives through assignment-domain helpers.'
      );
    case 'duration-formatting':
      return item(
        id,
        'Duration formatting',
        'Shared duration labels',
        'Result rows, averages, and CSV fields use shared duration formatting from assignment-domain helpers.'
      );
    case 'classroom-brief':
      return item(
        id,
        'Classroom brief',
        'Teacher-only brief',
        'The classroom brief combines metrics, low-performing items, and student follow-up evidence for teachers.'
      );
    case 'lowest-performing-items':
      return item(
        id,
        'Lowest-performing items',
        'Top reteach focus',
        'Classroom brief and item analysis identify the lowest-correct-rate submitted items.'
      );
    case 'student-follow-up-priority':
      return item(
        id,
        'Student follow-up priority',
        'Needs support first',
        'Student follow-up lists prioritize missed answers, lower accuracy, recency, and normalized labels.'
      );
    case 'reteach-plan-copy':
      return item(
        id,
        'Reteach plan copy',
        'Classroom script',
        'Teachers can copy a reteach plan built from low-performing items and follow-up summaries.'
      );
    case 'item-review-copy':
      return item(
        id,
        'Item review copy',
        'Prompt summary',
        'Teachers can copy item-by-item review summaries for lesson planning or team review.'
      );
    case 'student-follow-up-copy':
      return item(
        id,
        'Student follow-up copy',
        'Support list',
        'Teachers can copy student follow-up summaries sorted by review need without exposing raw tokens.'
      );
    case 'copy-artifact-boundary':
      return item(
        id,
        'Copy artifact boundary',
        'Handoff hidden',
        'Copy artifacts remain teacher-only and hidden semantic handoffs do not expose raw artifact text.'
      );
    case 'csv-export-preparation':
      return item(
        id,
        'CSV export preparation',
        'Private export',
        'CSV exports include private teacher result data for offline review without exposing raw data URLs in handoffs.'
      );
    case 'delivery-policy-export':
      return item(
        id,
        'Delivery policy export',
        'Rules included',
        'CSV exports preserve identity mode, answer reveal, shuffle, attempts, timer, close time, and instructions.'
      );
    case 'result-material-handoff':
      return item(
        id,
        'Result material handoff',
        'Teacher material scope',
        'Result material handoffs summarize copy/export scope without leaking student answers or source storage keys.'
      );
    case 'empty-state-guidance':
      return item(
        id,
        'Empty state guidance',
        'No attempts yet',
        'Empty results guide teachers back to distribution without inventing attempt records.'
      );
    case 'anonymous-token-guard':
      return item(
        id,
        'Anonymous token guard',
        'Raw token hidden',
        'Anonymous student labels support search and summaries while raw tokens stay hidden.'
      );
    case 'source-material-guard':
      return item(
        id,
        'Source material guard',
        'Storage keys hidden',
        'Teacher result surfaces do not expose source-material storage keys or file metadata in audit handoffs.'
      );
    case 'public-runner-boundary':
      return item(
        id,
        'Public runner boundary',
        'Teacher-only results',
        'Result review and copy/export artifacts do not mutate or expose the public student runner.'
      );
    case 'result-review-controls-boundary':
      return item(
        id,
        'Result review controls boundary',
        '30 control slices',
        'Route parsing, default elision, search and sort status, attempt filters, review and copy scope summaries, table/card/copy consumers, anonymous-label search, and control privacy guards stay aligned.'
      );
  }
}

function item(
  id: TeacherResultsReviewChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<TeacherResultsReviewChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
