import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import type { AssignmentResultsAnalysis } from '@/assignments/results';

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

const RESULT_EXPORT_COLUMNS = [
  'assignment_id',
  'assignment_title',
  'share_slug',
  'assignment_status',
  'expires_at',
  'instructions',
  'collect_student_name',
  'show_correct_answers',
  'shuffle_items',
  'max_attempts',
  'time_limit_seconds',
  'activity_title',
  'template_type',
  'completions',
  'average_accuracy',
  'average_points',
  'average_duration_seconds',
  'attempt_id',
  'student',
  'submitted_at',
  'score',
  'max_score',
  'attempt_accuracy',
  'completed_items',
  'total_items',
  'duration_seconds',
  'student_attempts',
  'student_latest_accuracy',
  'student_average_accuracy',
  'student_best_accuracy',
  'student_needs_review_count',
  'item_number',
  'item_id',
  'prompt',
  'student_answer',
  'expected_answer',
  'correct',
  'explanation',
] as const;

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
      return [[...baseColumns, '', '', '', '', '', '', '']];
    }

    return attempt.answers.map((answer, index) => [
      ...baseColumns,
      index + 1,
      answer.itemId,
      answer.prompt,
      answer.answer,
      answer.expectedAnswer,
      answer.correct ? 'correct' : 'review',
      answer.explanation ?? '',
    ]);
  });

  return rowsToCsv([RESULT_EXPORT_COLUMNS, ...rows]);
}

export function buildAssignmentResultsCsvFilename(
  data: AssignmentResultsExportData
) {
  const title = slugifyFilename(data.assignment.title);
  return `classgamify-${title}-results.csv`;
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
  return slug || 'assignment';
}
