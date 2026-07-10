import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import {
  buildAssignmentAttemptStatsView,
  type AssignmentAttemptStatsView,
} from '@/assignments/attempt-stats';
import { buildAttemptDurationDisplayView } from '@/assignments/attempt-duration';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import type {
  AssignmentAttemptReview,
  AssignmentAttemptReviewAnswer,
  AssignmentItemAnalysis,
  AssignmentResultsAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { buildAssignmentAttemptReviewSummary } from '@/assignments/result-review-summary';
import { buildAssignmentResultAttemptAnswerTextView } from '@/assignments/result-answer-view';
import {
  formatAssignmentResultCsvDate,
  formatAssignmentResultCsvNumber,
  formatAssignmentResultNumber,
  formatAssignmentResultValue,
} from '@/assignments/result-format';
import { formatAssignmentResultStudentLabel } from '@/assignments/result-display';
import {
  buildAssignmentDeliverySummary,
  formatAssignmentExpiry,
  formatAssignmentDeliveryPolicyText,
} from '@/assignments/delivery-summary';
import { formatAssignmentResultCopyOrdinal } from '@/assignments/result-copy-format';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  resolveAssignmentSnapshotSource,
  type ResolvedAssignmentSnapshotSource,
} from '@/assignments/snapshot';
import {
  type AssignmentSettingsInput,
  resolveAssignmentSettings,
} from '@/assignments/validation';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS = {
  shareSlugMaxLength: 48,
  titleMaxLength: 80,
} as const;

const CSV_FORMULA_PREFIX = "'";
const CSV_FORMULA_PREFIX_PATTERN = /^[=+\-@]/u;

type ExportAttempt = {
  completedAt: Date | string | null;
  id: string;
  maxScore: number | null;
  resultJson: {
    accuracy: number;
    completedItemCount: number;
    durationSeconds?: number;
    totalPoints: number;
  } | null;
  score: number | null;
};

export type AssignmentResultsExportData = {
  activity: {
    description: string | null;
    templateType: ActivityTemplateType;
    title: string;
  };
  analysis: AssignmentResultsAnalysis;
  assignment: {
    expiresAt: Date | string | null;
    id: string;
    settingsJson: AssignmentSettingsInput;
    shareSlug: string;
    status: string;
    title: string;
  };
  attempts: ExportAttempt[];
  snapshot: {
    activityDescription: string | null;
    activityTitle: string;
    templateType: ActivityTemplateType;
  } | null;
  stats: {
    averageDurationSeconds: number | null | undefined;
    averagePoints: number;
    averageScore: number;
    completions: number;
  };
  now?: number;
};

type AssignmentResultsExportAttemptReview = AssignmentAttemptReview;

type AssignmentResultsExportAttemptAnswer = AssignmentAttemptReviewAnswer;

type AssignmentResultsExportItemAnalysis = AssignmentItemAnalysis;

type AssignmentResultsExportStudentSummary = AssignmentStudentSummary;

type AssignmentResultsExportContext = {
  assignmentTitle: string;
  attemptsById: Map<string, ExportAttempt>;
  deliveryView: AssignmentResultsExportDeliveryView;
  itemAnalysisById: Map<string, AssignmentResultsExportItemAnalysis>;
  resolvedSource: ResolvedAssignmentSnapshotSource;
  runtimeItemCount: number;
  shareSlug: string;
  statsView: AssignmentAttemptStatsView;
  studentsByKey: Map<string, AssignmentResultsExportStudentSummary>;
};

export const ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS = [
  'export-scope',
  'assignment-context',
  'activity-snapshot',
  'attempts',
  'students',
  'student-privacy',
  'delivery-identity',
  'delivery-answer-reveal',
  'delivery-item-order',
  'delivery-attempt-limit',
  'delivery-timer',
  'delivery-close-time',
  'delivery-instructions',
  'raw-settings',
  'result-metrics',
  'item-performance',
  'answer-rows',
  'expected-answer',
  'accepted-alternatives',
  'export-filename',
  'csv-data-url-boundary',
  'formula-injection-guard',
  'submitted-date-format',
  'duration-normalization',
  'empty-answer-row',
  'prompt-column',
  'student-answer-column',
  'correctness-column',
  'explanation-column',
  'columns',
] as const;

export type AssignmentResultsExportPreparationItemId =
  (typeof ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS)[number];

export type AssignmentResultsExportPreparationItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultsExportPreparationItemId;
  label: string;
  value: string;
};

export type AssignmentResultsExportPreparationPrivacyContract = {
  exposesAssignmentTitle: false;
  exposesCopyArtifactText: false;
  exposesCsvDataUrl: false;
  exposesCsvFilename: false;
  exposesPromptText: false;
  exposesRawAnonymousToken: false;
  exposesStudentAnswerText: false;
  exposesStudentInstructions: false;
  exposesTeacherAnswerText: false;
  itemIds: AssignmentResultsExportPreparationItemId[];
  scope: 'full-assignment-results';
};

export type AssignmentResultsExportPreparationView = {
  description: string;
  itemViews: AssignmentResultsExportPreparationItemView[];
  privacy: AssignmentResultsExportPreparationPrivacyContract;
  title: string;
};

export function buildAssignmentResultsCsv(data: AssignmentResultsExportData) {
  const exportContext = buildAssignmentResultsExportContext(data);
  const rows = buildAssignmentResultsExportRows({
    data,
    exportContext,
  });

  return rowsToCsv([getAssignmentResultsExportColumns(), ...rows]);
}

export function buildAssignmentResultsExportPreparationView(
  data: Pick<
    AssignmentResultsExportData,
    'activity' | 'analysis' | 'assignment' | 'snapshot'
  > & {
    stats?: AssignmentResultsExportData['stats'];
  }
): AssignmentResultsExportPreparationView {
  const deliveryView = buildAssignmentResultsExportDeliveryView({
    expiresAt: data.assignment.expiresAt,
    settings: resolveAssignmentSettings(data.assignment.settingsJson),
  });
  const summary = buildAssignmentResultsExportPreparationSummary({
    data,
    deliveryView,
  });
  const itemViews = ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.map((id) =>
    buildAssignmentResultsExportPreparationItemView(
      buildAssignmentResultsExportPreparationItem({
        deliveryView,
        id,
        summary,
      })
    )
  );

  return {
    description: m.assignment_results_export_preparation_description(),
    itemViews,
    privacy: buildAssignmentResultsExportPreparationPrivacyContract(itemViews),
    title: m.assignment_results_export_preparation_title(),
  };
}

type AssignmentResultsExportPreparationSummary = ReturnType<
  typeof buildAssignmentResultsExportPreparationSummary
>;

function buildAssignmentResultsExportPreparationSummary({
  data,
  deliveryView,
}: {
  data: Pick<
    AssignmentResultsExportData,
    'activity' | 'analysis' | 'assignment' | 'snapshot'
  > & {
    stats?: AssignmentResultsExportData['stats'];
  };
  deliveryView: AssignmentResultsExportDeliveryView;
}) {
  const resolvedSource = resolveAssignmentSnapshotSource(data);

  return {
    answerRowCount: countAssignmentResultsExportAnswerRows(
      data.analysis.attempts
    ),
    attemptCount: data.analysis.attempts.length,
    columnCount: getAssignmentResultsExportColumns().length,
    deliveryInstructionState: deliveryView.instructions
      ? m.assignment_results_export_preparation_present_value()
      : m.assignment_results_export_preparation_empty_value(),
    itemPerformanceCount: data.analysis.perItem.length,
    rawSettingFieldCount:
      countAssignmentResultsExportRawSettingFields(deliveryView),
    resultMetricCount: countAssignmentResultsExportResultMetricColumns(),
    snapshotTemplateLabel: formatAssignmentExportTemplateLabel(
      resolvedSource.templateType
    ),
    studentCount: data.analysis.students.length,
  };
}

function buildAssignmentResultsExportPreparationItem({
  deliveryView,
  id,
  summary,
}: {
  deliveryView: AssignmentResultsExportDeliveryView;
  id: AssignmentResultsExportPreparationItemId;
  summary: AssignmentResultsExportPreparationSummary;
}): Omit<AssignmentResultsExportPreparationItemView, 'ariaLabel'> {
  if (id === 'export-scope') {
    return {
      description:
        m.assignment_results_export_preparation_export_scope_description(),
      id,
      label: m.assignment_results_export_preparation_export_scope_label(),
      value: m.assignment_results_export_preparation_export_scope_value(),
    };
  }

  if (id === 'assignment-context') {
    return {
      description:
        m.assignment_results_export_preparation_assignment_context_description(),
      id,
      label: m.assignment_results_export_preparation_assignment_context_label(),
      value: m.assignment_results_export_preparation_prepared_value(),
    };
  }

  if (id === 'activity-snapshot') {
    return {
      description:
        m.assignment_results_export_preparation_activity_snapshot_description(),
      id,
      label: m.assignment_results_export_preparation_activity_snapshot_label(),
      value: summary.snapshotTemplateLabel,
    };
  }

  if (id === 'attempts') {
    return {
      description:
        m.assignment_results_export_preparation_attempts_description(),
      id,
      label: m.assignment_results_export_preparation_attempts_label(),
      value: formatAssignmentResultsExportPreparationCount(
        summary.attemptCount
      ),
    };
  }

  if (id === 'students') {
    return {
      description:
        m.assignment_results_export_preparation_students_description(),
      id,
      label: m.assignment_results_export_preparation_students_label(),
      value: formatAssignmentResultsExportPreparationCount(
        summary.studentCount
      ),
    };
  }

  if (id === 'student-privacy') {
    return {
      description:
        m.assignment_results_export_preparation_student_privacy_description(),
      id,
      label: m.assignment_results_export_preparation_student_privacy_label(),
      value: m.assignment_results_export_preparation_student_privacy_value(),
    };
  }

  if (id === 'delivery-identity') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_identity_description(),
      id,
      label: m.assignment_results_export_preparation_delivery_identity_label(),
      value: deliveryView.identityMode,
    };
  }

  if (id === 'delivery-answer-reveal') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_answer_reveal_description(),
      id,
      label:
        m.assignment_results_export_preparation_delivery_answer_reveal_label(),
      value: deliveryView.answerReveal,
    };
  }

  if (id === 'delivery-item-order') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_item_order_description(),
      id,
      label:
        m.assignment_results_export_preparation_delivery_item_order_label(),
      value: deliveryView.itemOrder,
    };
  }

  if (id === 'delivery-attempt-limit') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_attempt_limit_description(),
      id,
      label:
        m.assignment_results_export_preparation_delivery_attempt_limit_label(),
      value: String(deliveryView.maxAttempts),
    };
  }

  if (id === 'delivery-timer') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_timer_description(),
      id,
      label: m.assignment_results_export_preparation_delivery_timer_label(),
      value: deliveryView.timeLimitSeconds
        ? formatAssignmentResultsExportPreparationCount(
            deliveryView.timeLimitSeconds
          )
        : m.assignment_delivery_timer_none(),
    };
  }

  if (id === 'delivery-close-time') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_close_time_description(),
      id,
      label:
        m.assignment_results_export_preparation_delivery_close_time_label(),
      value: deliveryView.closeTime,
    };
  }

  if (id === 'delivery-instructions') {
    return {
      description:
        m.assignment_results_export_preparation_delivery_instructions_description(),
      id,
      label:
        m.assignment_results_export_preparation_delivery_instructions_label(),
      value: summary.deliveryInstructionState,
    };
  }

  if (id === 'raw-settings') {
    return {
      description:
        m.assignment_results_export_preparation_raw_settings_description(),
      id,
      label: m.assignment_results_export_preparation_raw_settings_label(),
      value: formatAssignmentResultsExportPreparationCount(
        summary.rawSettingFieldCount
      ),
    };
  }

  if (id === 'result-metrics') {
    return {
      description:
        m.assignment_results_export_preparation_result_metrics_description(),
      id,
      label: m.assignment_results_export_preparation_result_metrics_label(),
      value: formatAssignmentResultsExportPreparationCount(
        summary.resultMetricCount
      ),
    };
  }

  if (id === 'item-performance') {
    return {
      description:
        m.assignment_results_export_preparation_item_performance_description(),
      id,
      label: m.assignment_results_export_preparation_item_performance_label(),
      value: formatAssignmentResultsExportPreparationCount(
        summary.itemPerformanceCount
      ),
    };
  }

  if (id === 'answer-rows') {
    return {
      description:
        m.assignment_results_export_preparation_answer_rows_description(),
      id,
      label: m.assignment_results_export_preparation_answer_rows_label(),
      value: formatAssignmentResultsExportPreparationCount(
        summary.answerRowCount
      ),
    };
  }

  if (id === 'expected-answer') {
    return {
      description:
        m.assignment_results_export_preparation_expected_answer_description(),
      id,
      label: m.assignment_results_export_preparation_expected_answer_label(),
      value: m.assignment_results_export_preparation_expected_answer_value(),
    };
  }

  if (id === 'accepted-alternatives') {
    return {
      description:
        m.assignment_results_export_preparation_accepted_alternatives_description(),
      id,
      label:
        m.assignment_results_export_preparation_accepted_alternatives_label(),
      value:
        m.assignment_results_export_preparation_accepted_alternatives_value(),
    };
  }

  if (id === 'export-filename') {
    return {
      description:
        m.assignment_results_export_preparation_export_filename_description(),
      id,
      label: m.assignment_results_export_preparation_export_filename_label(),
      value: m.assignment_results_export_preparation_prepared_value(),
    };
  }

  if (id === 'csv-data-url-boundary') {
    return {
      description:
        m.assignment_results_export_preparation_data_url_boundary_description(),
      id,
      label: m.assignment_results_export_preparation_data_url_boundary_label(),
      value: m.assignment_results_export_preparation_not_exposed_value(),
    };
  }

  if (id === 'formula-injection-guard') {
    return {
      description:
        m.assignment_results_export_preparation_formula_guard_description(),
      id,
      label: m.assignment_results_export_preparation_formula_guard_label(),
      value: m.assignment_results_export_preparation_enabled_value(),
    };
  }

  if (id === 'submitted-date-format') {
    return {
      description:
        m.assignment_results_export_preparation_submitted_date_format_description(),
      id,
      label:
        m.assignment_results_export_preparation_submitted_date_format_label(),
      value: m.assignment_results_export_preparation_prepared_value(),
    };
  }

  if (id === 'duration-normalization') {
    return {
      description:
        m.assignment_results_export_preparation_duration_normalization_description(),
      id,
      label:
        m.assignment_results_export_preparation_duration_normalization_label(),
      value:
        m.assignment_results_export_preparation_duration_normalization_value(),
    };
  }

  if (id === 'empty-answer-row') {
    return {
      description:
        m.assignment_results_export_preparation_empty_answer_row_description(),
      id,
      label: m.assignment_results_export_preparation_empty_answer_row_label(),
      value: m.assignment_results_export_preparation_prepared_value(),
    };
  }

  if (id === 'prompt-column') {
    return {
      description:
        m.assignment_results_export_preparation_prompt_column_description(),
      id,
      label: m.assignment_results_export_preparation_prompt_column_label(),
      value: m.assignment_results_export_preparation_prompt_column_value(),
    };
  }

  if (id === 'student-answer-column') {
    return {
      description:
        m.assignment_results_export_preparation_student_answer_column_description(),
      id,
      label:
        m.assignment_results_export_preparation_student_answer_column_label(),
      value:
        m.assignment_results_export_preparation_student_answer_column_value(),
    };
  }

  if (id === 'correctness-column') {
    return {
      description:
        m.assignment_results_export_preparation_correctness_column_description(),
      id,
      label: m.assignment_results_export_preparation_correctness_column_label(),
      value: m.assignment_results_export_preparation_correctness_column_value(),
    };
  }

  if (id === 'explanation-column') {
    return {
      description:
        m.assignment_results_export_preparation_explanation_column_description(),
      id,
      label: m.assignment_results_export_preparation_explanation_column_label(),
      value: m.assignment_results_export_preparation_explanation_column_value(),
    };
  }

  return {
    description: m.assignment_results_export_preparation_columns_description(),
    id,
    label: m.assignment_results_export_preparation_columns_label(),
    value: formatAssignmentResultsExportPreparationCount(summary.columnCount),
  };
}

function buildAssignmentResultsExportPreparationItemView({
  description,
  id,
  label,
  value,
}: Omit<
  AssignmentResultsExportPreparationItemView,
  'ariaLabel'
>): AssignmentResultsExportPreparationItemView {
  return {
    ariaLabel: m.assignment_results_export_preparation_item_aria_label({
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

function buildAssignmentResultsExportPreparationPrivacyContract(
  itemViews: AssignmentResultsExportPreparationItemView[]
): AssignmentResultsExportPreparationPrivacyContract {
  return {
    exposesAssignmentTitle: false,
    exposesCopyArtifactText: false,
    exposesCsvDataUrl: false,
    exposesCsvFilename: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentInstructions: false,
    exposesTeacherAnswerText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    scope: 'full-assignment-results',
  };
}

function buildAssignmentResultsExportContext(
  data: AssignmentResultsExportData
): AssignmentResultsExportContext {
  const settings = resolveAssignmentSettings(data.assignment.settingsJson);
  const deliveryView = buildAssignmentResultsExportDeliveryView({
    expiresAt: data.assignment.expiresAt,
    settings,
  });
  const resolvedSource = resolveAssignmentSnapshotSource(data);
  const assignmentTitle = formatAssignmentDisplayTitle(data.assignment.title);
  const shareSlug = normalizeAssignmentShareSlug(data.assignment.shareSlug);
  const statsView = buildAssignmentAttemptStatsView(
    normalizeAssignmentResultsExportStats(data.stats)
  );
  const attemptsById = new Map(data.attempts.map((item) => [item.id, item]));
  const itemAnalysisById = new Map(
    data.analysis.perItem.map((item) => [item.itemId, item])
  );
  const studentsByKey = new Map(
    data.analysis.students.map((student) => [student.studentKey, student])
  );

  return {
    assignmentTitle,
    attemptsById,
    deliveryView,
    itemAnalysisById,
    resolvedSource,
    runtimeItemCount: data.analysis.perItem.length,
    shareSlug,
    statsView,
    studentsByKey,
  };
}

function normalizeAssignmentResultsExportStats(
  stats: AssignmentResultsExportData['stats']
) {
  return {
    ...stats,
    completions: normalizeAssignmentResultsExportCount(stats.completions),
  };
}

function normalizeAssignmentResultsExportCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(Math.max(0, value));
}

function buildAssignmentResultsExportRows({
  data,
  exportContext,
}: {
  data: AssignmentResultsExportData;
  exportContext: AssignmentResultsExportContext;
}) {
  return data.analysis.attempts.flatMap((attempt) =>
    buildAssignmentResultsExportAttemptRows({
      attempt,
      data,
      exportContext,
    })
  );
}

function buildAssignmentResultsExportAttemptRows({
  attempt,
  data,
  exportContext,
}: {
  attempt: AssignmentResultsExportAttemptReview;
  data: AssignmentResultsExportData;
  exportContext: AssignmentResultsExportContext;
}) {
  const baseColumns = buildAssignmentResultsExportAttemptBaseColumns({
    attempt,
    data,
    exportContext,
  });

  if (attempt.answers.length === 0) {
    return [buildAssignmentResultsExportEmptyAnswerRow(baseColumns)];
  }

  return attempt.answers.map((answer, index) =>
    buildAssignmentResultsExportAnswerRow({
      answer,
      baseColumns,
      exportContext,
      index,
    })
  );
}

function countAssignmentResultsExportAnswerRows(
  attempts: AssignmentResultsExportAttemptReview[]
) {
  return attempts.reduce(
    (count, attempt) => count + Math.max(1, attempt.answers.length),
    0
  );
}

function countAssignmentResultsExportRawSettingFields(
  deliveryView: AssignmentResultsExportDeliveryView
) {
  return [
    deliveryView.rawCollectStudentName,
    deliveryView.rawShowCorrectAnswers,
    deliveryView.rawShuffleItems,
    deliveryView.rawMaxAttempts,
    deliveryView.rawTimeLimitSeconds,
  ].length;
}

function countAssignmentResultsExportResultMetricColumns() {
  return [
    m.assignment_results_export_column_completions(),
    m.assignment_results_export_column_average_accuracy(),
    m.assignment_results_export_column_average_points(),
    m.assignment_results_export_column_average_duration_seconds(),
  ].length;
}

function buildAssignmentResultsExportAttemptBaseColumns({
  attempt,
  data,
  exportContext,
}: {
  attempt: AssignmentResultsExportAttemptReview;
  data: AssignmentResultsExportData;
  exportContext: AssignmentResultsExportContext;
}) {
  const { deliveryView, resolvedSource, statsView } = exportContext;
  const storedAttempt = exportContext.attemptsById.get(attempt.id);
  const studentSummary = exportContext.studentsByKey.get(attempt.studentKey);
  const attemptSummary = buildAssignmentAttemptReviewSummary(attempt);
  const averageDurationView = buildAttemptDurationDisplayView({
    durationSeconds: statsView.averageDurationSeconds,
    timeLimitSeconds: deliveryView.timeLimitSeconds,
  });
  const attemptDurationView = buildAssignmentResultsExportAttemptDurationView({
    attempt,
    deliveryView,
  });

  return [
    data.assignment.id,
    exportContext.assignmentTitle,
    exportContext.shareSlug,
    formatAssignmentExportStatusLabel({
      expiresAt: data.assignment.expiresAt,
      now: data.now,
      status: data.assignment.status,
    }),
    formatAssignmentResultCsvDate(data.assignment.expiresAt),
    deliveryView.closeTime,
    deliveryView.policyText,
    deliveryView.instructions,
    deliveryView.identityMode,
    deliveryView.answerReveal,
    deliveryView.itemOrder,
    deliveryView.maxAttempts,
    deliveryView.timeLimitSeconds ?? '',
    deliveryView.rawCollectStudentName,
    deliveryView.rawShowCorrectAnswers,
    deliveryView.rawShuffleItems,
    deliveryView.rawMaxAttempts ?? '',
    deliveryView.rawTimeLimitSeconds ?? '',
    resolvedSource.activityTitle,
    formatAssignmentExportText(resolvedSource.activityDescription),
    formatAssignmentExportTemplateLabel(resolvedSource.templateType),
    formatAssignmentResultCsvNumber(statsView.completions, { min: 0 }),
    formatAssignmentResultCsvNumber(statsView.averageScore, { min: 0 }),
    formatAssignmentResultCsvNumber(statsView.averagePoints, { min: 0 }),
    statsView.completed
      ? formatAssignmentResultCsvNumber(averageDurationView.seconds, {
          min: 0,
          round: true,
        })
      : '',
    attempt.id,
    formatAssignmentResultStudentLabel(attempt.studentLabel),
    formatAssignmentResultCsvDate(attempt.completedAt),
    formatAssignmentResultCsvNumber(storedAttempt?.score ?? attempt.score, {
      min: 0,
    }),
    formatAssignmentResultCsvNumber(storedAttempt?.maxScore, { min: 0 }),
    formatAssignmentResultCsvNumber(attempt.accuracy, { min: 0 }),
    formatAssignmentResultCsvNumber(
      storedAttempt?.resultJson?.completedItemCount,
      {
        min: 0,
      }
    ),
    exportContext.runtimeItemCount,
    formatAssignmentResultCsvNumber(attemptSummary.correctItemCount, {
      min: 0,
    }),
    formatAssignmentResultCsvNumber(attemptSummary.needsReviewItemCount, {
      min: 0,
    }),
    formatAssignmentResultCsvNumber(attemptSummary.unansweredItemCount, {
      min: 0,
    }),
    formatAssignmentResultCsvNumber(attemptDurationView.seconds, {
      min: 0,
      round: true,
    }),
    formatAssignmentResultCsvNumber(studentSummary?.attempts, { min: 0 }),
    formatAssignmentResultCsvNumber(studentSummary?.latestAccuracy, {
      min: 0,
    }),
    formatAssignmentResultCsvNumber(studentSummary?.averageAccuracy, {
      min: 0,
    }),
    formatAssignmentResultCsvNumber(studentSummary?.bestAccuracy, { min: 0 }),
    formatAssignmentResultCsvNumber(studentSummary?.needsReviewCount, {
      min: 0,
    }),
    formatAssignmentResultCsvDate(studentSummary?.lastCompletedAt),
  ];
}

function buildAssignmentResultsExportAttemptDurationView({
  attempt,
  deliveryView,
}: {
  attempt: Pick<AssignmentResultsExportAttemptReview, 'durationSeconds'>;
  deliveryView: Pick<AssignmentResultsExportDeliveryView, 'timeLimitSeconds'>;
}) {
  return buildAttemptDurationDisplayView({
    durationSeconds: attempt.durationSeconds,
    timeLimitSeconds: deliveryView.timeLimitSeconds,
  });
}

function buildAssignmentResultsExportAnswerRow({
  answer,
  baseColumns,
  exportContext,
  index,
}: {
  answer: AssignmentResultsExportAttemptAnswer;
  baseColumns: unknown[];
  exportContext: AssignmentResultsExportContext;
  index: number;
}) {
  const answerView = buildAssignmentResultAttemptAnswerTextView(answer, {
    acceptedAnswerEmptyValue: '',
    studentAnswerEmptyValue: '',
  });

  return [
    ...baseColumns,
    formatAssignmentResultCopyOrdinal(index),
    answer.itemId,
    ...buildAssignmentResultsExportItemPerformanceColumns({
      answer,
      exportContext,
    }),
    formatAssignmentExportText(answer.prompt),
    answerView.exportStudentAnswerText,
    answerView.expectedAnswerText,
    answerView.acceptedAlternativesText,
    answerView.exportStatusLabel,
    formatAssignmentExportText(answer.explanation),
  ];
}

function buildAssignmentResultsExportEmptyAnswerRow(baseColumns: unknown[]) {
  return [
    ...baseColumns,
    ...getAssignmentResultsExportAnswerColumns().map(() => ''),
  ];
}

function buildAssignmentResultsExportItemPerformanceColumns({
  answer,
  exportContext,
}: {
  answer: AssignmentResultsExportAttemptAnswer;
  exportContext: AssignmentResultsExportContext;
}) {
  const itemAnalysis = exportContext.itemAnalysisById.get(answer.itemId);
  if (!itemAnalysis) return ['', '', '', ''];

  return [
    formatAssignmentResultCsvNumber(itemAnalysis.correctRate, { min: 0 }),
    formatAssignmentResultCsvNumber(itemAnalysis.correctCount, { min: 0 }),
    formatAssignmentResultCsvNumber(itemAnalysis.submittedCount, { min: 0 }),
    formatAssignmentResultCsvNumber(itemAnalysis.unansweredCount, { min: 0 }),
  ];
}

export function buildAssignmentResultsCsvFilename(
  data: AssignmentResultsExportData
) {
  const title = slugifyFilename(
    formatAssignmentDisplayTitle(data.assignment.title)
  );
  const shareSlug = slugifyFilename(
    normalizeAssignmentShareSlug(data.assignment.shareSlug),
    ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS.shareSlugMaxLength
  );
  return m.assignment_results_export_filename({ shareSlug, title });
}

export function buildAssignmentResultsCsvDataUrl(csv: string) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

export type AssignmentResultsExportDeliveryView = {
  answerReveal: string;
  closeTime: string;
  identityMode: string;
  instructions: string;
  itemOrder: string;
  maxAttempts: number | string;
  policyText: string;
  rawCollectStudentName: boolean;
  rawMaxAttempts: number | null | undefined;
  rawShowCorrectAnswers: boolean;
  rawShuffleItems: boolean;
  rawTimeLimitSeconds: number | undefined;
  settings: AssignmentSettings;
  timeLimitSeconds: number | undefined;
};

export function buildAssignmentResultsExportDeliveryView({
  expiresAt,
  settings,
}: {
  expiresAt: Date | string | null;
  settings: AssignmentSettings;
}): AssignmentResultsExportDeliveryView {
  const exportSettings = buildAssignmentExportSettings(settings);
  const deliverySummaryById = new Map(
    buildAssignmentDeliverySummary({
      collectStudentName: exportSettings.collectStudentName,
      expiresAt,
      maxAttempts: exportSettings.maxAttempts,
      showCorrectAnswers: exportSettings.showCorrectAnswers,
      shuffleItems: exportSettings.shuffleItems,
      timeLimitSeconds: exportSettings.timeLimitSeconds,
    }).map((item) => [item.id, item.value])
  );

  return {
    answerReveal: deliverySummaryById.get('answerReveal') ?? '',
    closeTime: formatAssignmentExpiry(expiresAt),
    identityMode: deliverySummaryById.get('identity') ?? '',
    instructions: exportSettings.instructions ?? '',
    itemOrder: deliverySummaryById.get('itemOrder') ?? '',
    maxAttempts: formatAssignmentExportMaxAttempts(exportSettings.maxAttempts),
    policyText: formatAssignmentDeliveryPolicyText({
      expiresAt,
      settings: exportSettings,
    }),
    rawCollectStudentName: exportSettings.collectStudentName,
    rawMaxAttempts: exportSettings.maxAttempts,
    rawShowCorrectAnswers: exportSettings.showCorrectAnswers,
    rawShuffleItems: exportSettings.shuffleItems,
    rawTimeLimitSeconds: exportSettings.timeLimitSeconds,
    settings: exportSettings,
    timeLimitSeconds: exportSettings.timeLimitSeconds,
  };
}

function getAssignmentResultsExportColumns() {
  return [
    m.assignment_results_export_column_assignment_id(),
    m.assignment_results_export_column_assignment_title(),
    m.assignment_results_export_column_share_slug(),
    m.assignment_results_export_column_assignment_status(),
    m.assignment_results_export_column_expires_at(),
    m.assignment_results_export_column_close_time(),
    m.assignment_results_export_column_delivery_policy(),
    m.assignment_results_export_column_instructions(),
    m.assignment_results_export_column_collect_student_name(),
    m.assignment_results_export_column_show_correct_answers(),
    m.assignment_results_export_column_shuffle_items(),
    m.assignment_results_export_column_max_attempts(),
    m.assignment_results_export_column_time_limit_seconds(),
    m.assignment_results_export_column_collect_student_name_raw(),
    m.assignment_results_export_column_show_correct_answers_raw(),
    m.assignment_results_export_column_shuffle_items_raw(),
    m.assignment_results_export_column_max_attempts_raw(),
    m.assignment_results_export_column_time_limit_seconds_raw(),
    m.assignment_results_export_column_activity_title(),
    m.assignment_results_export_column_activity_description(),
    m.assignment_results_export_column_template_type(),
    m.assignment_results_export_column_completions(),
    m.assignment_results_export_column_average_accuracy(),
    m.assignment_results_export_column_average_points(),
    m.assignment_results_export_column_average_duration_seconds(),
    m.assignment_results_export_column_attempt_id(),
    m.assignment_results_export_column_student(),
    m.assignment_results_export_column_submitted_at(),
    m.assignment_results_export_column_score(),
    m.assignment_results_export_column_max_score(),
    m.assignment_results_export_column_attempt_accuracy(),
    m.assignment_results_export_column_completed_items(),
    m.assignment_results_export_column_total_items(),
    m.assignment_results_export_column_attempt_correct_items(),
    m.assignment_results_export_column_attempt_needs_review_items(),
    m.assignment_results_export_column_attempt_unanswered_items(),
    m.assignment_results_export_column_duration_seconds(),
    m.assignment_results_export_column_student_attempts(),
    m.assignment_results_export_column_student_latest_accuracy(),
    m.assignment_results_export_column_student_average_accuracy(),
    m.assignment_results_export_column_student_best_accuracy(),
    m.assignment_results_export_column_student_needs_review_count(),
    m.assignment_results_export_column_student_last_submitted(),
    ...getAssignmentResultsExportAnswerColumns(),
  ] as const;
}

function getAssignmentResultsExportAnswerColumns() {
  return [
    m.assignment_results_export_column_item_number(),
    m.assignment_results_export_column_item_id(),
    m.assignment_results_export_column_item_correct_rate(),
    m.assignment_results_export_column_item_correct_count(),
    m.assignment_results_export_column_item_submitted_count(),
    m.assignment_results_export_column_item_unanswered_count(),
    m.assignment_results_export_column_prompt(),
    m.assignment_results_export_column_student_answer(),
    m.assignment_results_export_column_expected_answer(),
    m.assignment_results_export_column_accepted_answers(),
    m.assignment_results_export_column_correct(),
    m.assignment_results_export_column_explanation(),
  ] as const;
}

function formatAssignmentExportTemplateLabel(
  templateType: ActivityTemplateType
) {
  return getTemplateByType(templateType).name;
}

function formatAssignmentExportStatusLabel({
  expiresAt,
  now,
  status,
}: {
  expiresAt: Date | string | null;
  now: number | undefined;
  status: string;
}) {
  return getAssignmentStatusLabel(status, expiresAt, now);
}

function formatAssignmentExportMaxAttempts(value: number | null | undefined) {
  return value === null ? m.assignment_delivery_attempts_open() : (value ?? '');
}

function formatAssignmentResultsExportPreparationCount(value: number) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

function buildAssignmentExportSettings(
  settings: AssignmentSettings
): AssignmentSettings {
  return {
    ...settings,
    instructions:
      formatAssignmentExportText(settings.instructions) || undefined,
  };
}

function formatAssignmentExportText(value: string | null | undefined) {
  return formatAssignmentResultValue(value, { emptyValue: '' });
}

function rowsToCsv(rows: readonly (readonly unknown[])[]) {
  return `\uFEFF${rows.map((row) => row.map(formatCsvCell).join(',')).join('\r\n')}`;
}

function formatCsvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  const safeText =
    typeof value === 'string' ? prefixCsvFormulaText(text) : text;

  return `"${safeText.replace(/"/g, '""')}"`;
}

function prefixCsvFormulaText(text: string) {
  const formulaCheckText = text.normalize('NFKC').trimStart();
  if (!CSV_FORMULA_PREFIX_PATTERN.test(formulaCheckText)) return text;

  return `${CSV_FORMULA_PREFIX}${text}`;
}

function slugifyFilename(
  value: string,
  maxLength = ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS.titleMaxLength
) {
  const slug = value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  const truncatedSlug = [...slug]
    .slice(0, maxLength)
    .join('')
    .replace(/-+$/g, '');

  return (
    truncatedSlug || m.assignment_results_export_filename_fallback_assignment()
  );
}
