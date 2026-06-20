import { sortAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';
import type { AssignmentStudentSummary } from '@/assignments/results';

export type AssignmentStudentFollowUpSummaryInput = {
  assignmentTitle: string;
  students: AssignmentStudentSummary[];
};

export function buildAssignmentStudentFollowUpSummary({
  assignmentTitle,
  students,
}: AssignmentStudentFollowUpSummaryInput) {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(students);

  const lines = [
    `ClassGamify student follow-up: ${assignmentTitle}`,
    '',
    ...formatStudents(sortedStudents),
  ];

  return lines.join('\n');
}

function formatStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return ['- No student attempts yet.'];
  }

  return students.map(
    (student, index) =>
      `- ${index + 1}. ${student.studentLabel}: latest ${student.latestAccuracy}%, average ${student.averageAccuracy}%, best ${student.bestAccuracy}%, ${student.attempts} ${student.attempts === 1 ? 'attempt' : 'attempts'}, ${student.needsReviewCount} ${student.needsReviewCount === 1 ? 'item' : 'items'} to review`
  );
}
