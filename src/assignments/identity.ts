export const ANONYMOUS_STUDENT_LABEL = 'Anonymous student';
export const ANONYMOUS_BROWSER_LABEL = 'Anonymous browser';

type StudentIdentitySource = {
  anonymousToken?: string | null;
  studentName?: string | null;
};

export type StudentIdentity = {
  key: string;
  label: string;
};

export function normalizeStudentName(value?: string | null) {
  return (value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeAnonymousToken(value?: string | null) {
  return (value ?? '').trim();
}

export function getAnonymousBrowserLabel(value?: string | null) {
  const anonymousToken = normalizeAnonymousToken(value);
  if (!anonymousToken) return ANONYMOUS_BROWSER_LABEL;

  const suffix = anonymousToken.replace(/[^a-z0-9]/gi, '').slice(-6);
  return suffix
    ? `${ANONYMOUS_BROWSER_LABEL} ${suffix.toUpperCase()}`
    : ANONYMOUS_BROWSER_LABEL;
}

export function getStudentIdentityKey(source: StudentIdentitySource) {
  const studentName = normalizeStudentName(source.studentName);
  if (studentName) {
    return `name:${studentName.toLocaleLowerCase()}`;
  }

  const anonymousToken = normalizeAnonymousToken(source.anonymousToken);
  if (anonymousToken) {
    return `anonymous:${anonymousToken}`;
  }

  return 'anonymous:unknown';
}

export function isSameStudentIdentity(
  left: StudentIdentitySource,
  right: StudentIdentitySource
) {
  return getStudentIdentityKey(left) === getStudentIdentityKey(right);
}

export function createStudentIdentityResolver(
  attempts: StudentIdentitySource[]
) {
  const labelsByKey = new Map<string, string>();
  let anonymousIndex = 1;

  for (const attempt of attempts) {
    const key = getStudentIdentityKey(attempt);
    if (labelsByKey.has(key)) continue;

    const studentName = normalizeStudentName(attempt.studentName);
    if (studentName) {
      labelsByKey.set(key, studentName);
      continue;
    }

    const anonymousToken = normalizeAnonymousToken(attempt.anonymousToken);
    labelsByKey.set(
      key,
      anonymousToken
        ? `${ANONYMOUS_STUDENT_LABEL} ${anonymousIndex++}`
        : ANONYMOUS_STUDENT_LABEL
    );
  }

  return {
    resolve(source: StudentIdentitySource): StudentIdentity {
      const key = getStudentIdentityKey(source);
      return {
        key,
        label: labelsByKey.get(key) ?? ANONYMOUS_STUDENT_LABEL,
      };
    },
  };
}
