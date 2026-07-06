import {
  type AssignmentAttemptStats,
  type AssignmentAttemptStatsSource,
  type AssignmentAttemptStatsView,
  buildAssignmentAttemptStatsView,
  normalizeAssignmentAttemptStats,
  summarizeAssignmentAttempts,
} from '@/assignments/attempt-stats';
import { buildAttemptDurationDisplayView } from '@/assignments/attempt-duration';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
} from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS = [
  'stats-scope',
  'source-attempt-count',
  'completed-attempt-count',
  'completion-filter',
  'average-accuracy',
  'average-points',
  'average-duration',
  'duration-normalization',
  'duration-time-limit',
  'points-score-source',
  'earned-points-fallback',
  'percent-boundary',
  'points-boundary',
  'completion-boundary',
  'empty-state',
  'nonfinite-number-guard',
  'negative-number-guard',
  'fractional-count-guard',
  'result-metric-consumer',
  'assignment-list-summary-consumer',
  'assignment-card-consumer',
  'classroom-brief-consumer',
  'copy-artifact-consumer',
  'csv-export-consumer',
  'duration-display-consumer',
  'settings-time-limit-source',
  'by-assignment-grouping',
  'normalization-helper',
  'student-data-guard',
  'privacy-guard',
] as const;

export type AssignmentAttemptStatsHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptStatsHandoffEvidence = {
  emptyStateAveragesHidden: boolean;
  fractionalCompletionGuardValue: number;
  negativeNumberGuardValue: number;
  nonfiniteAverageHidden: boolean;
  sourceAttemptCount: number;
  stats: AssignmentAttemptStats;
  statsView: AssignmentAttemptStatsView;
  timeLimitSeconds: number | undefined;
};

export type AssignmentAttemptStatsHandoffSource = {
  resultJson: Partial<
    NonNullable<AssignmentAttemptStatsSource['resultJson']>
  > | null;
  score?: number | null;
  timeLimitSeconds?: number | null;
};

export type BuildAssignmentAttemptStatsHandoffEvidenceInput = {
  attempts?: AssignmentAttemptStatsHandoffSource[];
  stats?: Partial<AssignmentAttemptStats> | null;
  timeLimitSeconds?: number | null;
};

export type AssignmentAttemptStatsHandoffPrivacyContract = {
  exposesAcceptedAnswers: false;
  exposesCsvDataUrl: false;
  exposesPromptText: false;
  exposesRawAnonymousToken: false;
  exposesRuntimeItemIds: false;
  exposesShareSlug: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesTeacherAnswerKey: false;
  itemIds: AssignmentAttemptStatsHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-result-attempt-stats';
  usesAssignmentDomainHelpers: true;
};

export type AssignmentAttemptStatsHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptStatsHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptStatsHandoffView = {
  description: string;
  itemViews: AssignmentAttemptStatsHandoffItemView[];
  privacy: AssignmentAttemptStatsHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentAttemptStatsHandoffEvidence({
  attempts,
  stats,
  timeLimitSeconds,
}: BuildAssignmentAttemptStatsHandoffEvidenceInput): AssignmentAttemptStatsHandoffEvidence {
  const summarizedStats = summarizeAssignmentAttempts(
    normalizeAssignmentAttemptStatsHandoffSources(attempts ?? []),
    {
      timeLimitSeconds,
    }
  );
  const normalizedStats = normalizeAssignmentAttemptStats(
    stats ?? summarizedStats
  );
  const statsView = buildAssignmentAttemptStatsView(normalizedStats);
  const emptyStateAveragesHidden =
    buildAssignmentAttemptStatsView({
      averageDurationSeconds: 60,
      averagePoints: 10,
      averageScore: 80,
      completions: 0,
    }).averageScore === undefined;
  const nonfiniteAverageHidden =
    buildAssignmentAttemptStatsView({
      averageDurationSeconds: Number.NaN,
      averagePoints: Number.POSITIVE_INFINITY,
      averageScore: Number.NaN,
      completions: 1,
    }).averageScore === undefined;
  const negativeNumberGuardValue = normalizeAssignmentAttemptStats({
    averagePoints: -4,
  }).averagePoints;
  const fractionalCompletionGuardValue =
    buildAssignmentAttemptStatsView({
      completions: 2.8,
    }).completions ?? 0;

  return {
    emptyStateAveragesHidden,
    fractionalCompletionGuardValue,
    negativeNumberGuardValue,
    nonfiniteAverageHidden,
    sourceAttemptCount: normalizeAttemptStatsHandoffCount(
      attempts?.length ?? 0
    ),
    stats: normalizedStats,
    statsView,
    timeLimitSeconds:
      normalizeAttemptStatsHandoffPositiveSeconds(timeLimitSeconds),
  };
}

export function buildAssignmentAttemptStatsHandoffView(
  evidence: AssignmentAttemptStatsHandoffEvidence
): AssignmentAttemptStatsHandoffView {
  const itemViews = ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentAttemptStatsHandoffItemView(id, evidence)
  );

  return {
    description: m.assignment_attempt_stats_handoff_description(),
    itemViews,
    privacy: buildAssignmentAttemptStatsHandoffPrivacyContract(itemViews),
    title: m.assignment_attempt_stats_handoff_title(),
  };
}

function buildAssignmentAttemptStatsHandoffItemView(
  id: AssignmentAttemptStatsHandoffItemId,
  evidence: AssignmentAttemptStatsHandoffEvidence
): AssignmentAttemptStatsHandoffItemView {
  switch (id) {
    case 'stats-scope':
      return buildAssignmentAttemptStatsHandoffOutput({
        description: m.assignment_attempt_stats_handoff_scope_description(),
        id,
        label: m.assignment_attempt_stats_handoff_scope_label(),
        value: m.assignment_attempt_stats_handoff_scope_value(),
      });
    case 'source-attempt-count':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_source_count_description(),
        id,
        label: m.assignment_attempt_stats_handoff_source_count_label(),
        value: formatAttemptStatsHandoffNumber(evidence.sourceAttemptCount),
      });
    case 'completed-attempt-count':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_completed_count_description(),
        id,
        label: m.assignment_attempt_stats_handoff_completed_count_label(),
        value: formatAttemptStatsHandoffNumber(evidence.statsView.completions),
      });
    case 'completion-filter':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_completion_filter_description(),
        id,
        label: m.assignment_attempt_stats_handoff_completion_filter_label(),
        value: m.assignment_attempt_stats_handoff_completion_filter_value(),
      });
    case 'average-accuracy':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_average_accuracy_description(),
        id,
        label: m.assignment_result_metric_average_accuracy(),
        value: formatAssignmentResultPercent(evidence.statsView.averageScore),
      });
    case 'average-points':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_average_points_description(),
        id,
        label: m.assignment_result_metric_average_points(),
        value: formatAttemptStatsHandoffNumber(
          evidence.statsView.averagePoints
        ),
      });
    case 'average-duration':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_average_duration_description(),
        id,
        label: m.assignment_result_metric_average_time(),
        value: buildAttemptDurationDisplayView({
          durationSeconds: evidence.statsView.averageDurationSeconds,
          timeLimitSeconds: evidence.timeLimitSeconds,
        }).label,
      });
    case 'duration-normalization':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_duration_normalization_description(),
        id,
        label:
          m.assignment_attempt_stats_handoff_duration_normalization_label(),
        value: 'normalizeAttemptDurationSeconds',
      });
    case 'duration-time-limit':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_duration_time_limit_description(),
        id,
        label: m.assignment_attempt_stats_handoff_duration_time_limit_label(),
        value: formatAttemptStatsHandoffTimeLimit(evidence.timeLimitSeconds),
      });
    case 'points-score-source':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_points_score_source_description(),
        id,
        label: m.assignment_attempt_stats_handoff_points_score_source_label(),
        value: m.assignment_attempt_stats_handoff_points_score_source_value(),
      });
    case 'earned-points-fallback':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_earned_points_fallback_description(),
        id,
        label:
          m.assignment_attempt_stats_handoff_earned_points_fallback_label(),
        value:
          m.assignment_attempt_stats_handoff_earned_points_fallback_value(),
      });
    case 'percent-boundary':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_percent_boundary_description(),
        id,
        label: m.assignment_attempt_stats_handoff_percent_boundary_label(),
        value: m.assignment_attempt_stats_handoff_percent_boundary_value(),
      });
    case 'points-boundary':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_points_boundary_description(),
        id,
        label: m.assignment_attempt_stats_handoff_points_boundary_label(),
        value: m.assignment_attempt_stats_handoff_points_boundary_value(),
      });
    case 'completion-boundary':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_completion_boundary_description(),
        id,
        label: m.assignment_attempt_stats_handoff_completion_boundary_label(),
        value: m.assignment_attempt_stats_handoff_completion_boundary_value(),
      });
    case 'empty-state':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_empty_state_description(),
        id,
        label: m.assignment_attempt_stats_handoff_empty_state_label(),
        value: evidence.emptyStateAveragesHidden
          ? m.assignment_attempt_stats_handoff_averages_hidden_value()
          : m.assignment_attempt_stats_handoff_needs_review_value(),
      });
    case 'nonfinite-number-guard':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_nonfinite_guard_description(),
        id,
        label: m.assignment_attempt_stats_handoff_nonfinite_guard_label(),
        value: evidence.nonfiniteAverageHidden
          ? m.assignment_attempt_stats_handoff_hidden_value()
          : m.assignment_attempt_stats_handoff_needs_review_value(),
      });
    case 'negative-number-guard':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_negative_guard_description(),
        id,
        label: m.assignment_attempt_stats_handoff_negative_guard_label(),
        value: formatAttemptStatsHandoffNumber(
          evidence.negativeNumberGuardValue
        ),
      });
    case 'fractional-count-guard':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_fractional_count_description(),
        id,
        label: m.assignment_attempt_stats_handoff_fractional_count_label(),
        value: formatAttemptStatsHandoffNumber(
          evidence.fractionalCompletionGuardValue
        ),
      });
    case 'result-metric-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_result_metric_description(),
        id,
        label: m.assignment_attempt_stats_handoff_result_metric_label(),
        value: m.assignment_attempt_stats_handoff_result_metric_value(),
      });
    case 'assignment-list-summary-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_list_summary_description(),
        id,
        label: m.assignment_attempt_stats_handoff_list_summary_label(),
        value: m.assignment_attempt_stats_handoff_list_summary_value(),
      });
    case 'assignment-card-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description: m.assignment_attempt_stats_handoff_card_description(),
        id,
        label: m.assignment_attempt_stats_handoff_card_label(),
        value: m.assignment_attempt_stats_handoff_card_value(),
      });
    case 'classroom-brief-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_classroom_brief_description(),
        id,
        label: m.assignment_attempt_stats_handoff_classroom_brief_label(),
        value: m.assignment_attempt_stats_handoff_classroom_brief_value(),
      });
    case 'copy-artifact-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_copy_artifact_description(),
        id,
        label: m.assignment_attempt_stats_handoff_copy_artifact_label(),
        value: m.assignment_attempt_stats_handoff_copy_artifact_value(),
      });
    case 'csv-export-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_csv_export_description(),
        id,
        label: m.assignment_attempt_stats_handoff_csv_export_label(),
        value: m.assignment_attempt_stats_handoff_csv_export_value(),
      });
    case 'duration-display-consumer':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_duration_display_description(),
        id,
        label: m.assignment_attempt_stats_handoff_duration_display_label(),
        value: 'buildAttemptDurationDisplayView',
      });
    case 'settings-time-limit-source':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_settings_time_limit_description(),
        id,
        label: m.assignment_attempt_stats_handoff_settings_time_limit_label(),
        value: m.assignment_attempt_stats_handoff_settings_time_limit_value(),
      });
    case 'by-assignment-grouping':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_by_assignment_description(),
        id,
        label: m.assignment_attempt_stats_handoff_by_assignment_label(),
        value: 'summarizeAssignmentAttemptsByAssignmentId',
      });
    case 'normalization-helper':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_normalization_helper_description(),
        id,
        label: m.assignment_attempt_stats_handoff_normalization_helper_label(),
        value: 'buildAssignmentAttemptStatsView',
      });
    case 'student-data-guard':
      return buildAssignmentAttemptStatsHandoffOutput({
        description:
          m.assignment_attempt_stats_handoff_student_data_guard_description(),
        id,
        label: m.assignment_attempt_stats_handoff_student_data_guard_label(),
        value: m.assignment_attempt_stats_handoff_hidden_value(),
      });
    case 'privacy-guard':
      return buildAssignmentAttemptStatsHandoffOutput({
        description: m.assignment_attempt_stats_handoff_privacy_description(),
        id,
        label: m.assignment_attempt_stats_handoff_privacy_label(),
        value: m.assignment_attempt_stats_handoff_hidden_value(),
      });
  }
}

function buildAssignmentAttemptStatsHandoffOutput({
  description,
  id,
  label,
  value,
}: Omit<AssignmentAttemptStatsHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.assignment_attempt_stats_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildAssignmentAttemptStatsHandoffPrivacyContract(
  itemViews: AssignmentAttemptStatsHandoffItemView[]
): AssignmentAttemptStatsHandoffPrivacyContract {
  return {
    exposesAcceptedAnswers: false,
    exposesCsvDataUrl: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesRuntimeItemIds: false,
    exposesShareSlug: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultData: false,
    scope: 'teacher-result-attempt-stats',
    usesAssignmentDomainHelpers: true,
  };
}

function normalizeAssignmentAttemptStatsHandoffSources(
  attempts: AssignmentAttemptStatsHandoffSource[]
): AssignmentAttemptStatsSource[] {
  return attempts.map((attempt) => ({
    resultJson: attempt.resultJson
      ? {
          accuracy: attempt.resultJson.accuracy ?? 0,
          completedItemCount: attempt.resultJson.completedItemCount ?? 0,
          correctItemCount: attempt.resultJson.correctItemCount ?? 0,
          durationSeconds: attempt.resultJson.durationSeconds,
          earnedPoints: attempt.resultJson.earnedPoints ?? attempt.score ?? 0,
          totalPoints: attempt.resultJson.totalPoints ?? 0,
        }
      : null,
    score: attempt.score,
    timeLimitSeconds: attempt.timeLimitSeconds,
  }));
}

function formatAttemptStatsHandoffTimeLimit(
  timeLimitSeconds: number | undefined
) {
  if (timeLimitSeconds === undefined) {
    return m.assignment_attempt_stats_handoff_no_timer_value();
  }

  return m.assignment_attempt_stats_handoff_timer_cap_value({
    seconds: formatAttemptStatsHandoffNumber(timeLimitSeconds),
  });
}

function formatAttemptStatsHandoffNumber(value: number | null | undefined) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

function normalizeAttemptStatsHandoffCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeAttemptStatsHandoffPositiveSeconds(
  value: number | null | undefined
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;

  const seconds = Math.floor(value);
  return seconds > 0 ? seconds : undefined;
}
