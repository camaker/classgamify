import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import type { AssignmentResultsAnalysis } from '@/assignments/results';
import { buildAssignmentResultAttemptAnswerTextView } from '@/assignments/result-answer-view';
import {
  formatAssignmentResultCsvDate,
  formatAssignmentResultCsvNumber,
  formatAssignmentResultValue,
} from '@/assignments/result-format';
import { formatAssignmentResultStudentLabel } from '@/assignments/result-display';
import {
  buildAssignmentDeliverySummary,
  formatAssignmentDeliveryPolicyText,
} from '@/assignments/delivery-summary';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
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

export function buildAssignmentResultsCsv(data: AssignmentResultsExportData) {
  const settings = resolveAssignmentSettings(data.assignment.settingsJson);
  const exportSettings = buildAssignmentExportSettings(settings);
  const resolvedSource = resolveAssignmentSnapshotSource(data);
  const assignmentTitle = formatAssignmentDisplayTitle(data.assignment.title);
  const shareSlug = normalizeAssignmentShareSlug(data.assignment.shareSlug);
  const statsView = buildAssignmentAttemptStatsView(data.stats);
  const deliverySummaryById = new Map(
    buildAssignmentDeliverySummary({
      collectStudentName: exportSettings.collectStudentName,
      expiresAt: data.assignment.expiresAt,
      maxAttempts: exportSettings.maxAttempts,
      showCorrectAnswers: exportSettings.showCorrectAnswers,
      shuffleItems: exportSettings.shuffleItems,
      timeLimitSeconds: exportSettings.timeLimitSeconds,
    }).map((item) => [item.id, item.value])
  );
  const attemptsById = new Map(data.attempts.map((item) => [item.id, item]));
  const studentsByKey = new Map(
    data.analysis.students.map((student) => [student.studentKey, student])
  );
  const runtimeItemCount = data.analysis.perItem.length;
  const rows = data.analysis.attempts.flatMap((attempt) => {
    const storedAttempt = attemptsById.get(attempt.id);
    const studentSummary = studentsByKey.get(attempt.studentKey);
    const attemptDurationSeconds = normalizeAttemptDurationSeconds({
      durationSeconds: storedAttempt?.resultJson?.durationSeconds,
      timeLimitSeconds: exportSettings.timeLimitSeconds,
    });
    const baseColumns = [
      data.assignment.id,
      assignmentTitle,
      shareSlug,
      formatAssignmentExportStatusLabel({
        expiresAt: data.assignment.expiresAt,
        now: data.now,
        status: data.assignment.status,
      }),
      formatAssignmentResultCsvDate(data.assignment.expiresAt),
      formatAssignmentDeliveryPolicyText({
        expiresAt: data.assignment.expiresAt,
        settings: exportSettings,
      }),
      exportSettings.instructions ?? '',
      deliverySummaryById.get('identity') ?? '',
      deliverySummaryById.get('answerReveal') ?? '',
      deliverySummaryById.get('itemOrder') ?? '',
      formatAssignmentExportMaxAttempts(exportSettings.maxAttempts),
      exportSettings.timeLimitSeconds ?? '',
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
      runtimeItemCount,
      attemptDurationSeconds ?? '',
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

    if (attempt.answers.length === 0) {
      return [[...baseColumns, '', '', '', '', '', '', '', '']];
    }

    return attempt.answers.map((answer, index) => {
      const answerView = buildAssignmentResultAttemptAnswerTextView(answer, {
        acceptedAnswerEmptyValue: '',
        studentAnswerEmptyValue: '',
      });

      return [
        ...baseColumns,
        index + 1,
        answer.itemId,
        formatAssignmentExportText(answer.prompt),
        answerView.exportStudentAnswerText,
        answerView.expectedAnswerText,
        answerView.acceptedAlternativesText,
        answerView.exportStatusLabel,
        formatAssignmentExportText(answer.explanation),
      ];
    });
  });

  return rowsToCsv([getAssignmentResultsExportColumns(), ...rows]);
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

function getAssignmentResultsExportColumns() {
  return [
    m.assignment_results_export_column_assignment_id(),
    m.assignment_results_export_column_assignment_title(),
    m.assignment_results_export_column_share_slug(),
    m.assignment_results_export_column_assignment_status(),
    m.assignment_results_export_column_expires_at(),
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
