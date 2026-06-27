import type {
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
} from '@/assignments/result-format';
import {
  formatAssignmentResultItemNumberLabel,
  formatAssignmentResultPromptLabel,
} from '@/assignments/result-display';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryItemPerformance,
  formatAssignmentSummaryReviewCount,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import { getSubmittedAssignmentReviewPriorityItems } from '@/assignments/review-priority';
import { getAssignmentStudentFollowUpPriorityStudents } from '@/assignments/student-follow-up-priority';
import { m } from '@/locale/paraglide/messages';

type AssignmentClassroomBriefStats = {
  averageDurationSeconds: number | null | undefined;
  averagePoints: number;
  averageScore: number;
  completions: number;
};

type AssignmentClassroomBriefInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
  stats: AssignmentClassroomBriefStats;
  students: AssignmentStudentSummary[];
};

type AssignmentClassroomBrief = {
  focusItemViews: AssignmentClassroomBriefFocusItemView[];
  focusItems: AssignmentItemAnalysis[];
  followUpStudentViews: AssignmentClassroomBriefFollowUpStudentView[];
  followUpStudents: AssignmentStudentSummary[];
  statViews: AssignmentClassroomBriefStatView[];
  text: string;
};

export type AssignmentClassroomBriefStatView = {
  key: 'average-accuracy' | 'average-points' | 'average-time' | 'completions';
  text: string;
};

export type AssignmentClassroomBriefFocusItemView = {
  correctRateLabel: string;
  correctSummaryLabel: string;
  itemId: string;
  itemNumberLabel: string;
  performanceLabel: string;
  prompt: string;
  promptLabel: string;
  text: string;
};

export type AssignmentClassroomBriefFollowUpStudentView = {
  accuracyLabel: string;
  latestAccuracyLabel: string;
  needsReviewLabel: string;
  reviewItemCountLabel: string;
  studentKey: string;
  studentLabel: string;
  text: string;
};

export const ASSIGNMENT_CLASSROOM_BRIEF_LIMITS = {
  focusItems: 3,
  followUpStudents: 6,
} as const;

export function buildAssignmentClassroomBrief({
  assignmentTitle,
  items,
  stats,
  students,
}: AssignmentClassroomBriefInput): AssignmentClassroomBrief {
  const focusItems = getClassroomBriefFocusItems(items);
  const followUpStudents = getClassroomBriefFollowUpStudents(students);
  const statViews = buildAssignmentClassroomBriefStatViews(stats);
  const focusItemViews =
    buildAssignmentClassroomBriefFocusItemViews(focusItems);
  const followUpStudentViews =
    buildAssignmentClassroomBriefFollowUpStudentViews(followUpStudents);
  const lines = [
    m.assignment_classroom_brief_title({ title: assignmentTitle }),
    '',
    ...statViews.map((statView) => statView.text),
    '',
    m.assignment_classroom_brief_focus_heading(),
    ...formatFocusItems(focusItemViews),
    '',
    m.assignment_classroom_brief_follow_up_heading(),
    ...formatFollowUpStudents(followUpStudentViews),
  ];

  return {
    focusItemViews,
    focusItems,
    followUpStudentViews,
    followUpStudents,
    statViews,
    text: lines.join('\n'),
  };
}

export function buildAssignmentClassroomBriefStatViews(
  stats: AssignmentClassroomBriefStats
): AssignmentClassroomBriefStatView[] {
  const statsView = buildAssignmentAttemptStatsView(stats);

  return [
    {
      key: 'completions',
      text: m.assignment_classroom_brief_completions({
        count: statsView.completions ?? 0,
      }),
    },
    {
      key: 'average-accuracy',
      text: m.assignment_classroom_brief_average_accuracy({
        accuracy: formatAssignmentSummaryAccuracy(statsView.averageScore),
      }),
    },
    {
      key: 'average-points',
      text: m.assignment_classroom_brief_average_points({
        points: formatAssignmentResultNumber(statsView.averagePoints),
      }),
    },
    {
      key: 'average-time',
      text: m.assignment_classroom_brief_average_time({
        time: formatAttemptDuration(statsView.averageDurationSeconds),
      }),
    },
  ];
}

export function buildAssignmentClassroomBriefFocusItemViews(
  items: AssignmentItemAnalysis[]
) {
  return items.map((item, index) =>
    buildAssignmentClassroomBriefFocusItemView({
      index,
      item,
    })
  );
}

export function buildAssignmentClassroomBriefFollowUpStudentViews(
  students: AssignmentStudentSummary[]
) {
  return students.map((student, index) =>
    buildAssignmentClassroomBriefFollowUpStudentView({
      index,
      student,
    })
  );
}

export function buildAssignmentClassroomBriefFocusItemView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}): AssignmentClassroomBriefFocusItemView {
  const itemNumberLabel = formatAssignmentResultItemNumberLabel(index);
  const performanceLabel = formatAssignmentSummaryItemPerformance(item);
  const promptLabel = formatAssignmentResultPromptLabel({
    itemNumberLabel,
    prompt: item.prompt,
  });

  return {
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    correctSummaryLabel: formatAssignmentSummaryCorrectCount(item),
    itemId: item.itemId,
    itemNumberLabel,
    performanceLabel,
    prompt: item.prompt,
    promptLabel,
    text: m.assignment_classroom_brief_focus_item({
      performance: performanceLabel,
      promptLabel,
    }),
  };
}

export function buildAssignmentClassroomBriefFollowUpStudentView({
  index,
  student,
}: {
  index: number;
  student: AssignmentStudentSummary;
}): AssignmentClassroomBriefFollowUpStudentView {
  const latestAccuracyLabel = formatAssignmentSummaryAccuracy(
    student.latestAccuracy
  );
  const reviewItemCountLabel = formatAssignmentSummaryReviewItemCount(
    student.needsReviewCount
  );

  return {
    accuracyLabel: formatAssignmentBriefStudentAccuracy(student),
    latestAccuracyLabel,
    needsReviewLabel: formatAssignmentSummaryReviewCount(
      student.needsReviewCount
    ),
    reviewItemCountLabel,
    studentKey: student.studentKey,
    studentLabel: student.studentLabel,
    text: m.assignment_classroom_brief_follow_up_student({
      accuracy: latestAccuracyLabel,
      index: index + 1,
      reviewCount: reviewItemCountLabel,
      student: student.studentLabel,
    }),
  };
}

export function formatAssignmentBriefStudentAccuracy({
  bestAccuracy,
  latestAccuracy,
}: Pick<AssignmentStudentSummary, 'bestAccuracy' | 'latestAccuracy'>) {
  return m.assignment_result_brief_student_accuracy({
    best: formatAssignmentResultPercent(bestAccuracy),
    latest: formatAssignmentResultPercent(latestAccuracy),
  });
}

function getClassroomBriefFocusItems(items: AssignmentItemAnalysis[]) {
  return getSubmittedAssignmentReviewPriorityItems(items, {
    limit: ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.focusItems,
  });
}

function getClassroomBriefFollowUpStudents(
  students: AssignmentStudentSummary[]
) {
  return getAssignmentStudentFollowUpPriorityStudents(students, {
    limit: ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.followUpStudents,
  });
}

function formatFocusItems(items: AssignmentClassroomBriefFocusItemView[]) {
  if (items.length === 0) {
    return [m.assignment_classroom_brief_empty_items()];
  }

  return items.map((item) => item.text);
}

function formatFollowUpStudents(
  students: AssignmentClassroomBriefFollowUpStudentView[]
) {
  if (students.length === 0) {
    return [m.assignment_classroom_brief_empty_students()];
  }

  return students.map((student) => student.text);
}
