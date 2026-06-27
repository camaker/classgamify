import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import type { AssignmentResultsAnalysis } from '@/assignments/results';
import { isAssignmentAttemptAnswerNeedsReview } from '@/assignments/results';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultCsvDate,
} from '@/assignments/result-format';
import {
  buildAssignmentDeliverySummary,
  formatAssignmentDeliveryPolicyText,
} from '@/assignments/delivery-summary';
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

type AssignmentResultsExportData = {
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
    averageDurationSeconds: number;
    averagePoints: number;
    averageScore: number;
    completions: number;
  };
  now?: number;
};

export function buildAssignmentResultsCsv(data: AssignmentResultsExportData) {
  const settings = resolveAssignmentSettings(data.assignment.settingsJson);
  const resolvedSource = resolveAssignmentSnapshotSource(data);
  const statsView = buildAssignmentAttemptStatsView(data.stats);
  const deliverySummaryById = new Map(
    buildAssignmentDeliverySummary({
      collectStudentName: settings.collectStudentName,
      expiresAt: data.assignment.expiresAt,
      maxAttempts: settings.maxAttempts,
      showCorrectAnswers: settings.showCorrectAnswers,
      shuffleItems: settings.shuffleItems,
      timeLimitSeconds: settings.timeLimitSeconds,
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
      timeLimitSeconds: settings.timeLimitSeconds,
    });
    const baseColumns = [
      data.assignment.id,
      data.assignment.title,
      data.assignment.shareSlug,
      formatAssignmentExportStatusLabel({
        expiresAt: data.assignment.expiresAt,
        now: data.now,
        status: data.assignment.status,
      }),
      formatAssignmentResultCsvDate(data.assignment.expiresAt),
      formatAssignmentDeliveryPolicyText({
        expiresAt: data.assignment.expiresAt,
        settings,
      }),
      settings.instructions ?? '',
      deliverySummaryById.get('identity') ?? '',
      deliverySummaryById.get('answerReveal') ?? '',
      deliverySummaryById.get('itemOrder') ?? '',
      formatAssignmentExportMaxAttempts(settings.maxAttempts),
      settings.timeLimitSeconds ?? '',
      resolvedSource.activityTitle,
      formatAssignmentExportTemplateLabel(resolvedSource.templateType),
      formatAssignmentExportNumber(statsView.completions, { min: 0 }),
      formatAssignmentExportNumber(statsView.averageScore, { min: 0 }),
      formatAssignmentExportNumber(statsView.averagePoints, { min: 0 }),
      statsView.completed
        ? formatAssignmentExportNumber(statsView.averageDurationSeconds, {
            min: 0,
            round: true,
          })
        : '',
      attempt.id,
      attempt.studentLabel,
      formatAssignmentResultCsvDate(attempt.completedAt),
      formatAssignmentExportNumber(storedAttempt?.score ?? attempt.score, {
        min: 0,
      }),
      formatAssignmentExportNumber(storedAttempt?.maxScore, { min: 0 }),
      formatAssignmentExportNumber(attempt.accuracy, { min: 0 }),
      formatAssignmentExportNumber(
        storedAttempt?.resultJson?.completedItemCount,
        {
          min: 0,
        }
      ),
      runtimeItemCount,
      attemptDurationSeconds ?? '',
      formatAssignmentExportNumber(studentSummary?.attempts, { min: 0 }),
      formatAssignmentExportNumber(studentSummary?.latestAccuracy, { min: 0 }),
      formatAssignmentExportNumber(studentSummary?.averageAccuracy, { min: 0 }),
      formatAssignmentExportNumber(studentSummary?.bestAccuracy, { min: 0 }),
      formatAssignmentExportNumber(studentSummary?.needsReviewCount, {
        min: 0,
      }),
    ];

    if (attempt.answers.length === 0) {
      return [[...baseColumns, '', '', '', '', '', '', '', '']];
    }

    return attempt.answers.map((answer, index) => [
      ...baseColumns,
      index + 1,
      answer.itemId,
      answer.prompt,
      formatAssignmentExportStudentAnswer(answer),
      answer.expectedAnswer,
      formatAcceptedAnswerAlternatives(answer.acceptedAnswers, {
        emptyValue: '',
      }),
      formatAssignmentExportAnswerStatus(answer),
      answer.explanation ?? '',
    ]);
  });

  return rowsToCsv([getAssignmentResultsExportColumns(), ...rows]);
}

export function buildAssignmentResultsCsvFilename(
  data: AssignmentResultsExportData
) {
  const title = slugifyFilename(data.assignment.title);
  const shareSlug = slugifyFilename(
    data.assignment.shareSlug,
    ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS.shareSlugMaxLength
  );
  return m.assignment_results_export_filename({ shareSlug, title });
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

function formatAssignmentExportStudentAnswer(
  answer: AssignmentResultsAnalysis['attempts'][number]['answers'][number]
) {
  if (!answer.submitted) {
    return m.assignment_results_export_status_unanswered();
  }

  return answer.answer;
}

function formatAssignmentExportAnswerStatus(
  answer: AssignmentResultsAnalysis['attempts'][number]['answers'][number]
) {
  if (!answer.submitted) {
    return m.assignment_results_export_status_unanswered();
  }

  return isAssignmentAttemptAnswerNeedsReview(answer)
    ? m.assignment_results_export_status_review()
    : m.assignment_results_export_status_correct();
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

function formatAssignmentExportNumber(
  value: number | null | undefined,
  options?: {
    min?: number;
    round?: boolean;
  }
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '';
  }

  const normalizedValue =
    options?.min === undefined ? value : Math.max(options.min, value);

  return options?.round ? Math.round(normalizedValue) : normalizedValue;
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
