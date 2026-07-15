import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';

export const ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS =
  ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS;

export const ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/assignments.ts',
  'src/routes/dashboard/assignments.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'src/assignments/attempt-query.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/attempt-stats-handoff.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-duration-handoff.ts',
  'src/assignments/validation.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/list-view.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-summary-format.ts',
  'src/assignments/result-format.ts',
  'src/assignments/results.ts',
  'src/assignments/classroom-brief.ts',
  'src/assignments/copy-artifact-handoff.ts',
  'src/assignments/results-export.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/assignment-list-filter-state-chain.ts',
  'src/components/assignments/assignment-results-attempt-stats-handoff.tsx',
  'src/components/assignments/assignment-results-metric-card.tsx',
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'src/components/assignments/assignment-list-card.tsx',
  'src/components/assignments/assignment-list-summary-card.tsx',
  'scripts/assignment-attempt-stats-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentAttemptStatsContinuityChainHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptStatsContinuityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptStatsContinuityChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptStatsContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAcceptedAnswers: false;
  exposesCopyArtifactText: false;
  exposesCsvDataUrl: false;
  exposesPromptText: false;
  exposesRawAnonymousTokens: false;
  exposesRuntimeItemIds: false;
  exposesShareSlugs: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesTeacherAnswerKeys: false;
  itemIds: AssignmentAttemptStatsContinuityChainHandoffItemId[];
  mutatesAttempts: false;
  sourceFiles: string[];
  usesCompletedScoredAttempts: true;
  usesSharedAssignmentDomainStats: true;
};

export type AssignmentAttemptStatsContinuityChainHandoffView = {
  description: string;
  itemViews: AssignmentAttemptStatsContinuityChainHandoffItemView[];
  privacy: AssignmentAttemptStatsContinuityChainPrivacyContract;
  title: string;
};

const ITEM_VALUES: Record<
  AssignmentAttemptStatsContinuityChainHandoffItemId,
  string
> = {
  'stats-scope': 'Teacher result metrics',
  'source-attempt-count': 'Scored attempt rows',
  'completed-attempt-count': 'Completed results only',
  'completion-filter': 'resultJson required',
  'average-accuracy': 'Shared percent average',
  'average-points': 'Shared points average',
  'average-duration': 'Shared duration average',
  'duration-normalization': 'Normalized seconds',
  'duration-time-limit': 'Assignment timer cap',
  'points-score-source': 'Stored score first',
  'earned-points-fallback': 'Result earned points',
  'percent-boundary': '0 to 100',
  'points-boundary': '0 to total points',
  'completion-boundary': 'Whole non-negative count',
  'empty-state': 'Averages hidden',
  'nonfinite-number-guard': 'Invalid averages hidden',
  'negative-number-guard': 'Clamped to zero',
  'fractional-count-guard': 'Floored count',
  'result-metric-consumer': 'Result summary cards',
  'assignment-list-summary-consumer': 'Assignment overview',
  'assignment-card-consumer': 'Assignment cards',
  'classroom-brief-consumer': 'Classroom brief',
  'copy-artifact-consumer': 'Teacher copy scope',
  'csv-export-consumer': 'Private offline export',
  'duration-display-consumer': 'Shared duration label',
  'settings-time-limit-source': 'Frozen delivery policy',
  'by-assignment-grouping': 'Owner list aggregation',
  'normalization-helper': 'Prepared stats view',
  'student-data-guard': 'Aggregate values only',
  'privacy-guard': 'Private details hidden',
};

export function buildAssignmentAttemptStatsContinuityChainHandoffView(): AssignmentAttemptStatsContinuityChainHandoffView {
  const itemViews =
    ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.map((id) => {
      const label = id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = ITEM_VALUES[id];
      const description = `${label} stays aligned from scored attempt queries through shared assignment-domain statistics and every teacher-facing aggregate consumer.`;

      return {
        ariaLabel: `${label}: ${value}`,
        description,
        id,
        label,
        value,
      };
    });

  return {
    description:
      'Thirty-slice attempt statistics continuity chain from completed scored attempts and delivery timer settings through normalized aggregate metrics, assignment lists, result review, classroom briefs, copy artifacts, CSV export, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesAcceptedAnswers: false,
      exposesCopyArtifactText: false,
      exposesCsvDataUrl: false,
      exposesPromptText: false,
      exposesRawAnonymousTokens: false,
      exposesRuntimeItemIds: false,
      exposesShareSlugs: false,
      exposesStudentAnswerText: false,
      exposesStudentDisplayLabels: false,
      exposesTeacherAnswerKeys: false,
      itemIds: [...ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS],
      mutatesAttempts: false,
      sourceFiles: [...ASSIGNMENT_ATTEMPT_STATS_CONTINUITY_CHAIN_SOURCE_FILES],
      usesCompletedScoredAttempts: true,
      usesSharedAssignmentDomainStats: true,
    },
    title: 'Assignment attempt statistics continuity chain',
  };
}
