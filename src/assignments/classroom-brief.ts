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

export type AssignmentClassroomBriefStats = {
  averageDurationSeconds: number;
  averagePoints: number;
  averageScore: number;
  completions: number;
};

export type AssignmentClassroomBriefInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
  stats: AssignmentClassroomBriefStats;
  students: AssignmentStudentSummary[];
};

export type AssignmentClassroomBrief = {
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
    `ClassGamify classroom brief: ${assignmentTitle}`,
    '',
    `Completions: ${stats.completions}`,
    `Average accuracy: ${formatAssignmentSummaryAccuracy(stats.averageScore)}`,
    `Average points: ${stats.averagePoints}`,
    `Average time: ${formatAttemptDuration(stats.averageDurationSeconds)}`,
    '',
    'Class review focus:',
    ...formatFocusItems(focusItems),
    '',
    'Student follow-up:',
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
    return ['- No submitted item data yet.'];
  }

  return items.map(
    (item, index) =>
      `- ${index + 1}. ${item.prompt} (${formatAssignmentSummaryItemPerformance(item)})`
  );
}

function formatFollowUpStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return ['- No student-specific review needs yet.'];
  }

  return students.map(
    (student, index) =>
      `- ${index + 1}. ${student.studentLabel}: ${formatAssignmentSummaryAccuracy(
        student.latestAccuracy
      )} latest, ${formatAssignmentSummaryReviewItemCount(
        student.needsReviewCount
      )}`
  );
}
