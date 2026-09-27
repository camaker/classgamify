import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getAssignmentStudentFollowUpPriorityStudents,
  sortAssignmentStudentsByFollowUpPriority,
} from '@/assignments/student-follow-up-priority';
import type { AssignmentStudentSummary } from '@/assignments/results';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');
const SECRET_STUDENT_KEY = 'SECRET_STUDENT_KEY';
const SECRET_STUDENT_LABEL = 'Secret Student Label';
const RESULT_FILTERS_SOURCE = readFileSync(
  'src/assignments/result-filters.ts',
  'utf8'
);
const STUDENT_FOLLOW_UP_SUMMARY_SOURCE = readFileSync(
  'src/assignments/student-follow-up-summary.ts',
  'utf8'
);

test('student follow-up priority remains a shared domain helper', () => {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(
    buildStudentSummaries()
  );

  assert.deepEqual(
    sortedStudents.map((student) => student.studentKey),
    ['avery', 'blake', SECRET_STUDENT_KEY, 'devon', 'casey']
  );
  assert.deepEqual(
    getAssignmentStudentFollowUpPriorityStudents(buildStudentSummaries()).map(
      (student) => student.studentKey
    ),
    ['avery', 'blake', SECRET_STUDENT_KEY]
  );
  assert.match(
    RESULT_FILTERS_SOURCE,
    /compareAssignmentStudentsByFollowUpPriority/
  );
  assert.match(
    STUDENT_FOLLOW_UP_SUMMARY_SOURCE,
    /sortAssignmentStudentsByFollowUpPriority/
  );
});

function buildStudentSummaries(): AssignmentStudentSummary[] {
  return [
    {
      attempts: 2,
      averageAccuracy: 58,
      bestAccuracy: 70,
      lastCompletedAt: new Date('2026-01-01T09:00:00.000Z'),
      latestAccuracy: 65,
      needsReviewCount: 3,
      studentKey: 'avery',
      studentLabel: 'Avery',
    },
    {
      attempts: 2,
      averageAccuracy: 72,
      bestAccuracy: 82,
      lastCompletedAt: new Date('2026-01-01T09:10:00.000Z'),
      latestAccuracy: 80,
      needsReviewCount: 3,
      studentKey: 'blake',
      studentLabel: 'Blake',
    },
    {
      attempts: 1,
      averageAccuracy: 96,
      bestAccuracy: 96,
      lastCompletedAt: new Date('2026-01-01T09:20:00.000Z'),
      latestAccuracy: 96,
      needsReviewCount: 0,
      studentKey: 'casey',
      studentLabel: 'Casey',
    },
    {
      attempts: 1,
      averageAccuracy: 88,
      bestAccuracy: 88,
      lastCompletedAt: new Date('2026-01-01T09:30:00.000Z'),
      latestAccuracy: 88,
      needsReviewCount: 0,
      studentKey: 'devon',
      studentLabel: 'Devon',
    },
    {
      attempts: 1,
      averageAccuracy: 55,
      bestAccuracy: 55,
      lastCompletedAt: new Date('2026-01-01T09:40:00.000Z'),
      latestAccuracy: 55,
      needsReviewCount: 1,
      studentKey: SECRET_STUDENT_KEY,
      studentLabel: SECRET_STUDENT_LABEL,
    },
  ];
}
