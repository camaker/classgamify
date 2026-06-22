import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import type { AssignmentResultsAnalysis } from '@/assignments/results';
import { formatAcceptedAnswerAlternatives } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

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
    settingsJson: AssignmentSettings;
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
};

export function buildAssignmentResultsCsv(data: AssignmentResultsExportData) {
  const attemptsById = new Map(data.attempts.map((item) => [item.id, item]));
  const studentsByKey = new Map(
    data.analysis.students.map((student) => [student.studentKey, student])
  );
  const rows = data.analysis.attempts.flatMap((attempt) => {
    const storedAttempt = attemptsById.get(attempt.id);
    const studentSummary = studentsByKey.get(attempt.studentKey);
    const baseColumns = [
      data.assignment.id,
      data.assignment.title,
      data.assignment.shareSlug,
      data.assignment.status,
      formatCsvDate(data.assignment.expiresAt),
      data.assignment.settingsJson.instructions ?? '',
      data.assignment.settingsJson.collectStudentName,
      data.assignment.settingsJson.showCorrectAnswers,
      data.assignment.settingsJson.shuffleItems,
      data.assignment.settingsJson.maxAttempts ?? '',
      data.assignment.settingsJson.timeLimitSeconds ?? '',
      data.snapshot?.activityTitle ?? data.activity.title,
      data.snapshot?.templateType ?? data.activity.templateType,
      data.stats.completions,
      data.stats.averageScore,
      data.stats.averagePoints,
      data.stats.averageDurationSeconds || '',
      attempt.id,
      attempt.studentLabel,
      formatCsvDate(attempt.completedAt),
      storedAttempt?.score ?? attempt.score,
      storedAttempt?.maxScore ?? '',
      attempt.accuracy,
      storedAttempt?.resultJson?.completedItemCount ?? '',
      storedAttempt?.resultJson?.totalPoints ?? '',
      storedAttempt?.resultJson?.durationSeconds ?? '',
      studentSummary?.attempts ?? '',
      studentSummary?.latestAccuracy ?? '',
      studentSummary?.averageAccuracy ?? '',
      studentSummary?.bestAccuracy ?? '',
      studentSummary?.needsReviewCount ?? '',
    ];

    if (attempt.answers.length === 0) {
      return [[...baseColumns, '', '', '', '', '', '', '', '']];
    }

    return attempt.answers.map((answer, index) => [
      ...baseColumns,
      index + 1,
      answer.itemId,
      answer.prompt,
      answer.answer,
      answer.expectedAnswer,
      formatAcceptedAnswerAlternatives(answer.acceptedAnswers, {
        emptyValue: '',
        separator: ' | ',
      }),
      answer.correct
        ? m.assignment_results_export_status_correct()
        : m.assignment_results_export_status_review(),
      answer.explanation ?? '',
    ]);
  });

  return rowsToCsv([getAssignmentResultsExportColumns(), ...rows]);
}

export function buildAssignmentResultsCsvFilename(
  data: AssignmentResultsExportData
) {
  const title = slugifyFilename(data.assignment.title);
  return m.assignment_results_export_filename({ title });
}

function getAssignmentResultsExportColumns() {
  return [
    m.assignment_results_export_column_assignment_id(),
    m.assignment_results_export_column_assignment_title(),
    m.assignment_results_export_column_share_slug(),
    m.assignment_results_export_column_assignment_status(),
    m.assignment_results_export_column_expires_at(),
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

function rowsToCsv(rows: readonly (readonly unknown[])[]) {
  return `\uFEFF${rows.map((row) => row.map(formatCsvCell).join(',')).join('\r\n')}`;
}

function formatCsvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatCsvDate(value: Date | string | null) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function slugifyFilename(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || m.assignment_results_export_filename_fallback_assignment();
}
