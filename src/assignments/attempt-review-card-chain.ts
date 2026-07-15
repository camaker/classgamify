export const ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS = [
  'review-card-scope',
  'student-display-boundary',
  'submitted-time-display',
  'score-badge',
  'summary-metric-count',
  'submitted-count',
  'correct-count',
  'needs-review-count',
  'unanswered-count',
  'answer-card-count',
  'answer-sequence',
  'prompt-labels',
  'status-labels',
  'correct-status-count',
  'needs-review-status-count',
  'unanswered-status-count',
  'student-answer-lines',
  'expected-answer-lines',
  'accepted-alternatives-lines',
  'explanation-lines',
  'unsubmitted-answer-guard',
  'answer-text-view-helper',
  'answer-status-helper',
  'attempt-summary-helper',
  'review-card-consumer',
  'review-filter-consumer',
  'copy-scope-boundary',
  'csv-export-boundary',
  'anonymous-token-guard',
  'privacy-guard',
] as const;

export const ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-review-summary.ts',
  'src/assignments/result-answer-view.ts',
  'src/assignments/result-format.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/result-copy-format.ts',
  'src/assignments/result-filters.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/result-submitted-date-chain.ts',
  'src/assignments/result-accepted-answer-chain.ts',
  'src/assignments/result-explanation-chain.ts',
  'src/assignments/copy-artifact-handoff.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/assignments/printable-worksheet-review-lifecycle-chain.ts',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'src/components/assignments/assignment-results-attempt-review-filter-control.tsx',
  'src/components/assignments/assignment-results-attempts-table.tsx',
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/components/assignments/assignment-results-review-handoff-panel.tsx',
  'scripts/assignment-attempt-review-card-handoff-semantic-views.test.ts',
  'scripts/scored-attempt-result-chain-handoff.test.ts',
  'scripts/teacher-results-review-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentAttemptReviewCardChainHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptReviewCardChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptReviewCardChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptReviewCardChainPrivacyContract = {
  chainSourceFileCount: number;
  connectsAcceptedAnswerChain: true;
  connectsExplanationChain: true;
  connectsPrintableReviewLifecycleChain: true;
  connectsScoredAttemptResultChain: true;
  connectsSubmittedDateChain: true;
  connectsTeacherResultCopyLifecycleChain: true;
  connectsTeacherResultsReviewChain: true;
  exposesAcceptedAnswerText: false;
  exposesAttemptId: false;
  exposesCopyArtifactText: false;
  exposesCsvDataUrls: false;
  exposesPromptText: false;
  exposesRawAnonymousToken: false;
  exposesShareSlug: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabel: false;
  exposesTeacherAnswerText: false;
  itemIds: AssignmentAttemptReviewCardChainHandoffItemId[];
  mutatesResultData: false;
  preservesSnapshotAnswerOrder: true;
  protectsCopyScopeBoundary: true;
  protectsCsvExportBoundary: true;
  sourceFiles: string[];
  usesAssignmentAttemptReviewCardHandoff: true;
  usesAssignmentDomainHelpers: true;
  usesResultReviewFilters: true;
  usesResultViewCardConsumer: true;
};

export type AssignmentAttemptReviewCardChainHandoffView = {
  description: string;
  itemViews: AssignmentAttemptReviewCardChainHandoffItemView[];
  privacy: AssignmentAttemptReviewCardChainPrivacyContract;
  title: string;
};

export function buildAssignmentAttemptReviewCardChainHandoffView(): AssignmentAttemptReviewCardChainHandoffView {
  const itemViews = ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentAttemptReviewCardChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice assignment attempt review card chain from scored attempt persistence and answer review summaries through prepared card rows, review filters, copy scope, CSV export boundaries, printable review alignment, and privacy guards.',
    itemViews,
    privacy: {
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
      itemIds: [...ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_HANDOFF_ITEM_IDS],
      mutatesResultData: false,
      preservesSnapshotAnswerOrder: true,
      protectsCopyScopeBoundary: true,
      protectsCsvExportBoundary: true,
      sourceFiles: [...ASSIGNMENT_ATTEMPT_REVIEW_CARD_CHAIN_SOURCE_FILES],
      usesAssignmentAttemptReviewCardHandoff: true,
      usesAssignmentDomainHelpers: true,
      usesResultReviewFilters: true,
      usesResultViewCardConsumer: true,
    },
    title: 'Assignment attempt review card chain',
  };
}

function buildAssignmentAttemptReviewCardChainHandoffItemView(
  id: AssignmentAttemptReviewCardChainHandoffItemId
): AssignmentAttemptReviewCardChainHandoffItemView {
  const item = getAssignmentAttemptReviewCardChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentAttemptReviewCardChainHandoffItem(
  id: AssignmentAttemptReviewCardChainHandoffItemId
): Omit<AssignmentAttemptReviewCardChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'review-card-scope':
      return item(
        id,
        'Review card scope',
        'Teacher answer review card',
        'Attempt review card slices stay scoped to the teacher result page answer-review card.'
      );
    case 'student-display-boundary':
      return item(
        id,
        'Student display boundary',
        'Prepared display label',
        'Student labels are prepared before rendering but never exposed by the aggregate handoff.'
      );
    case 'submitted-time-display':
      return item(
        id,
        'Submitted time display',
        'Prepared submitted label',
        'Submitted-at labels flow through result display formatting before the review card consumes them.'
      );
    case 'score-badge':
      return item(
        id,
        'Score badge',
        'Prepared score badge',
        'Score badges are prepared from result-domain values before the card renders.'
      );
    case 'summary-metric-count':
      return item(
        id,
        'Summary metric count',
        'Four review metrics',
        'Attempt review cards keep submitted, correct, needs-review, and unanswered summary metric slots aligned.'
      );
    case 'submitted-count':
      return item(
        id,
        'Submitted count',
        'Submitted/total count',
        'Submitted answer counts come from the shared attempt review summary.'
      );
    case 'correct-count':
      return item(
        id,
        'Correct count',
        'Correct count',
        'Correct answer counts stay downstream of scored attempt records and summary helpers.'
      );
    case 'needs-review-count':
      return item(
        id,
        'Needs-review count',
        'Needs-review count',
        'Missed submitted answers remain visible as needs-review counts without leaking answer text.'
      );
    case 'unanswered-count':
      return item(
        id,
        'Unanswered count',
        'Unanswered count',
        'Unsubmitted runtime items stay counted separately from wrong submitted answers.'
      );
    case 'answer-card-count':
      return item(
        id,
        'Answer card count',
        'Answer row count',
        'Every snapshot answer row can be represented by a prepared review card row.'
      );
    case 'answer-sequence':
      return item(
        id,
        'Answer sequence',
        'Snapshot answer order',
        'Answer rows preserve frozen snapshot order for teacher review and export alignment.'
      );
    case 'prompt-labels':
      return item(
        id,
        'Prompt labels',
        'Numbered prompts',
        'Prompt labels are prepared as numbered display labels without exposing raw prompt text in the handoff.'
      );
    case 'status-labels':
      return item(
        id,
        'Status labels',
        'Prepared status labels',
        'Answer status labels use the shared result answer status helper.'
      );
    case 'correct-status-count':
      return item(
        id,
        'Correct status count',
        'Correct status count',
        'Correct status tones are counted from prepared answer status views.'
      );
    case 'needs-review-status-count':
      return item(
        id,
        'Needs-review status count',
        'Needs-review status count',
        'Review status tones are counted from prepared answer status views.'
      );
    case 'unanswered-status-count':
      return item(
        id,
        'Unanswered status count',
        'Unanswered status count',
        'Idle status tones are counted for unsubmitted answer rows.'
      );
    case 'student-answer-lines':
      return item(
        id,
        'Student answer lines',
        'Prepared student-answer lines',
        'Student answer lines are counted as prepared outputs but raw answer text stays outside the chain.'
      );
    case 'expected-answer-lines':
      return item(
        id,
        'Expected answer lines',
        'Prepared expected-answer lines',
        'Expected answer lines are counted without exposing teacher answer text.'
      );
    case 'accepted-alternatives-lines':
      return item(
        id,
        'Accepted alternatives lines',
        'Prepared accepted-answer lines',
        'Accepted alternatives stay connected to the shared accepted-answer continuity chain.'
      );
    case 'explanation-lines':
      return item(
        id,
        'Explanation lines',
        'Prepared explanation lines',
        'Teacher explanations stay connected to the explanation continuity chain without leaking text.'
      );
    case 'unsubmitted-answer-guard':
      return item(
        id,
        'Unsubmitted answer guard',
        'Unanswered label guard',
        'Unsubmitted rows use a prepared unanswered label instead of blank or misleading answer text.'
      );
    case 'answer-text-view-helper':
      return item(
        id,
        'Answer text view helper',
        'buildAssignmentResultAttemptAnswerTextView',
        'Attempt answer rows consume the shared answer text view helper for student, expected, accepted, explanation, and status text.'
      );
    case 'answer-status-helper':
      return item(
        id,
        'Answer status helper',
        'buildAssignmentResultAnswerStatusView',
        'Answer status labels and tones use the shared assignment-domain status helper.'
      );
    case 'attempt-summary-helper':
      return item(
        id,
        'Attempt summary helper',
        'buildAssignmentAttemptReviewSummary',
        'Submitted, correct, needs-review, and unanswered counts come from the shared attempt review summary.'
      );
    case 'review-card-consumer':
      return item(
        id,
        'Review card consumer',
        'buildAssignmentAttemptReviewCardView',
        'Result page view models prepare attempt review card views before React renders them.'
      );
    case 'review-filter-consumer':
      return item(
        id,
        'Review filter consumer',
        'Attempt review filter',
        'All versus needs-review card filtering stays connected to result route state.'
      );
    case 'copy-scope-boundary':
      return item(
        id,
        'Copy scope boundary',
        'Current copy scope',
        'Copy artifacts can summarize the current review scope without leaking raw card answers.'
      );
    case 'csv-export-boundary':
      return item(
        id,
        'CSV export boundary',
        'Full CSV export',
        'Full CSV exports can include private result rows while handoff summaries keep URLs and row text hidden.'
      );
    case 'anonymous-token-guard':
      return item(
        id,
        'Anonymous token guard',
        'Raw token hidden',
        'Anonymous attempt tokens stay outside review card handoff summaries.'
      );
    case 'privacy-guard':
      return item(
        id,
        'Privacy guard',
        'Private review data hidden',
        'The chain exposes counts and helper boundaries without leaking attempt ids, prompts, student labels, answers, accepted answers, teacher answers, share slugs, copy text, or CSV URLs.'
      );
  }
}

function item(
  id: AssignmentAttemptReviewCardChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentAttemptReviewCardChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
