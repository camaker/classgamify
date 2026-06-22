import type {
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryItemPerformance,
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
  focusItems: AssignmentItemAnalysis[];
  followUpStudents: AssignmentStudentSummary[];
  text: string;
};

export function buildAssignmentClassroomBrief({
  assignmentTitle,
  items,
  stats,
  students,
}: AssignmentClassroomBriefInput): AssignmentClassroomBrief {
  const focusItems = getClassroomBriefFocusItems(items);
  const followUpStudents = getClassroomBriefFollowUpStudents(students);
  const lines = [
    m.assignment_classroom_brief_title({ title: assignmentTitle }),
    '',
    m.assignment_classroom_brief_completions({
      count: stats.completions,
    }),
    m.assignment_classroom_brief_average_accuracy({
      accuracy: formatAssignmentSummaryAccuracy(stats.averageScore),
    }),
    m.assignment_classroom_brief_average_points({
      points: stats.averagePoints,
    }),
    m.assignment_classroom_brief_average_time({
      time: formatAttemptDuration(stats.averageDurationSeconds),
    }),
    '',
    m.assignment_classroom_brief_focus_heading(),
    ...formatFocusItems(focusItems),
    '',
    m.assignment_classroom_brief_follow_up_heading(),
    ...formatFollowUpStudents(followUpStudents),
  ];

  return {
    focusItems,
    followUpStudents,
    text: lines.join('\n'),
  };
}

function getClassroomBriefFocusItems(items: AssignmentItemAnalysis[]) {
  return getSubmittedAssignmentReviewPriorityItems(items, { limit: 3 });
}

function getClassroomBriefFollowUpStudents(
  students: AssignmentStudentSummary[]
) {
  return getAssignmentStudentFollowUpPriorityStudents(students, { limit: 6 });
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
