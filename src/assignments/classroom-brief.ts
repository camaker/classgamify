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
  averageDurationSeconds: number;
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
  text: string;
};

export type AssignmentClassroomBriefFocusItemView = {
  correctRateLabel: string;
  correctSummaryLabel: string;
  itemId: string;
  itemNumberLabel: string;
  prompt: string;
};

export type AssignmentClassroomBriefFollowUpStudentView = {
  accuracyLabel: string;
  needsReviewLabel: string;
  studentKey: string;
  studentLabel: string;
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
  const statsView = buildAssignmentAttemptStatsView(stats);
  const lines = [
    m.assignment_classroom_brief_title({ title: assignmentTitle }),
    '',
    m.assignment_classroom_brief_completions({
      count: statsView.completions ?? 0,
    }),
    m.assignment_classroom_brief_average_accuracy({
      accuracy: formatAssignmentSummaryAccuracy(statsView.averageScore),
    }),
    m.assignment_classroom_brief_average_points({
      points: formatAssignmentResultNumber(statsView.averagePoints),
    }),
    m.assignment_classroom_brief_average_time({
      time: formatAttemptDuration(statsView.averageDurationSeconds),
    }),
    '',
    m.assignment_classroom_brief_focus_heading(),
    ...formatFocusItems(focusItems),
    '',
    m.assignment_classroom_brief_follow_up_heading(),
    ...formatFollowUpStudents(followUpStudents),
  ];

  return {
    focusItemViews: focusItems.map((item, index) =>
      buildAssignmentClassroomBriefFocusItemView({
        index,
        item,
      })
    ),
    focusItems,
    followUpStudentViews: followUpStudents.map(
      buildAssignmentClassroomBriefFollowUpStudentView
    ),
    followUpStudents,
    text: lines.join('\n'),
  };
}

export function buildAssignmentClassroomBriefFocusItemView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}): AssignmentClassroomBriefFocusItemView {
  return {
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    correctSummaryLabel: formatAssignmentSummaryCorrectCount(item),
    itemId: item.itemId,
    itemNumberLabel: `${Math.max(0, index) + 1}.`,
    prompt: item.prompt,
  };
}

export function buildAssignmentClassroomBriefFollowUpStudentView(
  student: AssignmentStudentSummary
): AssignmentClassroomBriefFollowUpStudentView {
  return {
    accuracyLabel: formatAssignmentBriefStudentAccuracy(student),
    needsReviewLabel: formatAssignmentSummaryReviewCount(
      student.needsReviewCount
    ),
    studentKey: student.studentKey,
    studentLabel: student.studentLabel,
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

function formatFocusItems(items: AssignmentItemAnalysis[]) {
  if (items.length === 0) {
    return [m.assignment_classroom_brief_empty_items()];
  }

  return items.map((item, index) =>
    m.assignment_classroom_brief_focus_item({
      index: index + 1,
      performance: formatAssignmentSummaryItemPerformance(item),
      prompt: item.prompt,
    })
  );
}

function formatFollowUpStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return [m.assignment_classroom_brief_empty_students()];
  }

  return students.map((student, index) =>
    m.assignment_classroom_brief_follow_up_student({
      accuracy: formatAssignmentSummaryAccuracy(student.latestAccuracy),
      index: index + 1,
      reviewCount: formatAssignmentSummaryReviewItemCount(
        student.needsReviewCount
      ),
      student: student.studentLabel,
    })
  );
}
