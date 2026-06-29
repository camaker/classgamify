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
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import type {
  AssignmentAttemptReview,
  AssignmentAttemptReviewAnswer,
  AssignmentItemAnalysis,
  AssignmentResultsAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { buildAssignmentResultAttemptAnswerTextView } from '@/assignments/result-answer-view';
import {
  formatAssignmentResultCsvDate,
  formatAssignmentResultCsvNumber,
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
import { resolveAssignmentSettings } from '@/assignments/validation';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS = {
  shareSlugMaxLength: 48,
  titleMaxLength: 80,
} as const;

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
    settingsJson: Partial<AssignmentSettings> | null | undefined;
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

export function buildAssignmentResultsCsv(data: AssignmentResultsExportData) {
  const exportContext = buildAssignmentResultsExportContext(data);
  const rows = buildAssignmentResultsExportRows({
    data,
    exportContext,
  });

  return rowsToCsv([getAssignmentResultsExportColumns(), ...rows]);
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
  const statsView = buildAssignmentAttemptStatsView(data.stats);
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
  const attemptDurationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: storedAttempt?.resultJson?.durationSeconds,
    timeLimitSeconds: deliveryView.timeLimitSeconds,
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
    resolvedSource.activityTitle,
    formatAssignmentExportTemplateLabel(resolvedSource.templateType),
    formatAssignmentResultCsvNumber(statsView.completions, { min: 0 }),
    formatAssignmentResultCsvNumber(statsView.averageScore, { min: 0 }),
    formatAssignmentResultCsvNumber(statsView.averagePoints, { min: 0 }),
    statsView.completed
      ? formatAssignmentResultCsvNumber(statsView.averageDurationSeconds, {
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
    formatAssignmentResultCsvNumber(attemptDurationSeconds, {
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
  ];
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
  return [...baseColumns, '', '', '', '', '', '', '', '', '', '', '', ''];
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
  maxAttempts: string;
  policyText: string;
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
    m.assignment_results_export_column_activity_title(),
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
    m.assignment_results_export_column_duration_seconds(),
    m.assignment_results_export_column_student_attempts(),
    m.assignment_results_export_column_student_latest_accuracy(),
    m.assignment_results_export_column_student_average_accuracy(),
    m.assignment_results_export_column_student_best_accuracy(),
    m.assignment_results_export_column_student_needs_review_count(),
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
  return `"${text.replace(/"/g, '""')}"`;
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
