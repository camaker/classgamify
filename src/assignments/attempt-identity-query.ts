import type { StudentIdentitySource } from '@/assignments/identity';
import {
  buildScoredAnonymousAssignmentAttemptWhere,
  buildScoredAssignmentAttemptWhere,
} from '@/assignments/attempt-query';
import type { getDb } from '@/db';
import { attempt } from '@/db/app.schema';
import { count } from 'drizzle-orm';
import {
  isSameStudentIdentity,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';

type AttemptIdentityCountStrategy =
  | {
      identity: {
        anonymousToken: string;
      };
      type: 'anonymous-token';
    }
  | {
      identity: {
        studentName: string;
      };
      type: 'normalized-student-name';
    }
  | {
      type: 'unknown';
    };

type AssignmentAttemptIdentityDb = ReturnType<typeof getDb>;

export function resolveAttemptIdentityCountStrategy(
  source: StudentIdentitySource
): AttemptIdentityCountStrategy {
  const studentName = normalizeStudentName(source.studentName);
  if (studentName) {
    return {
      identity: {
        studentName,
      },
      type: 'normalized-student-name',
    };
  }

  const anonymousToken = normalizeAnonymousToken(source.anonymousToken);
  if (anonymousToken) {
    return {
      identity: {
        anonymousToken,
      },
      type: 'anonymous-token',
    };
  }

  return {
    type: 'unknown',
  };
}

export function resolveAttemptSubmissionIdentity({
  anonymousToken,
  collectStudentName,
  studentName,
}: StudentIdentitySource & {
  collectStudentName: boolean;
}) {
  if (collectStudentName) {
    const normalizedStudentName = normalizeStudentName(studentName);

    return {
      anonymousToken: null,
      studentName: normalizedStudentName || null,
      type: normalizedStudentName ? 'student-name' : 'missing',
    } as const;
  }

  const normalizedAnonymousToken = normalizeAnonymousToken(anonymousToken);

  return {
    anonymousToken: normalizedAnonymousToken || null,
    studentName: null,
    type: normalizedAnonymousToken ? 'anonymous-token' : 'missing',
  } as const;
}

export function countMatchingStudentIdentityAttempts({
  attempts,
  identity,
}: {
  attempts: StudentIdentitySource[];
  identity: StudentIdentitySource;
}) {
  return attempts.filter((attempt) => isSameStudentIdentity(attempt, identity))
    .length;
}

export async function countPreviousIdentityAttempts({
  anonymousToken,
  assignmentId,
  db,
  studentName,
}: StudentIdentitySource & {
  assignmentId: string;
  db: AssignmentAttemptIdentityDb;
}) {
  const strategy = resolveAttemptIdentityCountStrategy({
    anonymousToken,
    studentName,
  });

  if (strategy.type === 'anonymous-token') {
    const [row] = await db
      .select({ count: count() })
      .from(attempt)
      .where(
        buildScoredAnonymousAssignmentAttemptWhere({
          anonymousToken: strategy.identity.anonymousToken,
          assignmentId,
        })
      );

    return row?.count ?? 0;
  }

  if (strategy.type === 'normalized-student-name') {
    const previousAttempts = await db
      .select({
        anonymousToken: attempt.anonymousToken,
        studentName: attempt.studentName,
      })
      .from(attempt)
      .where(buildScoredAssignmentAttemptWhere({ assignmentId }));

    return countMatchingStudentIdentityAttempts({
      attempts: previousAttempts,
      identity: strategy.identity,
    });
  }

  return 0;
}
