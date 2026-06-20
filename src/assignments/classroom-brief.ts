import type {
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { formatAttemptDuration } from '@/assignments/attempt-duration';

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
    `Average accuracy: ${stats.averageScore}%`,
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
  return items
    .filter((item) => item.submittedCount > 0)
    .sort((left, right) => {
      if (left.correctRate !== right.correctRate) {
        return left.correctRate - right.correctRate;
      }
      return right.submittedCount - left.submittedCount;
    })
    .slice(0, 3);
}

function getClassroomBriefFollowUpStudents(
  students: AssignmentStudentSummary[]
) {
  return students
    .filter((student) => student.needsReviewCount > 0)
    .sort((left, right) => {
      if (left.needsReviewCount !== right.needsReviewCount) {
        return right.needsReviewCount - left.needsReviewCount;
      }
      if (left.latestAccuracy !== right.latestAccuracy) {
        return left.latestAccuracy - right.latestAccuracy;
      }
      return left.studentLabel.localeCompare(right.studentLabel);
    })
    .slice(0, 6);
}

function formatFocusItems(items: AssignmentItemAnalysis[]) {
  if (items.length === 0) {
    return ['- No submitted item data yet.'];
  }

  return items.map(
    (item, index) =>
      `- ${index + 1}. ${item.prompt} (${item.correctRate}% correct, ${item.correctCount}/${item.submittedCount})`
  );
}

function formatFollowUpStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return ['- No student-specific review needs yet.'];
  }

  return students.map(
    (student, index) =>
      `- ${index + 1}. ${student.studentLabel}: ${student.latestAccuracy}% latest, ${student.needsReviewCount} ${student.needsReviewCount === 1 ? 'item' : 'items'} to review`
  );
}
