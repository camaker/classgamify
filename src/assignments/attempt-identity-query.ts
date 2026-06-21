import type { StudentIdentitySource } from '@/assignments/identity';
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
