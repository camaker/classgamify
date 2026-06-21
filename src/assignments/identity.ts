const ANONYMOUS_STUDENT_LABEL = 'Anonymous student';
export const ANONYMOUS_BROWSER_LABEL = 'Anonymous browser';
const ANONYMOUS_ATTEMPT_TOKEN_PREFIX = 'classgamify:attempt-token:';

type StudentIdentitySource = {
  anonymousToken?: string | null;
  studentName?: string | null;
};

type AnonymousAttemptTokenStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
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

export function buildAnonymousAttemptTokenStorageKey(shareId: string) {
  return `${ANONYMOUS_ATTEMPT_TOKEN_PREFIX}${shareId}`;
}

function createAnonymousAttemptToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateAnonymousAttemptToken({
  createToken = createAnonymousAttemptToken,
  shareId,
  storage,
}: {
  createToken?: () => string;
  shareId: string;
  storage: AnonymousAttemptTokenStorage;
}) {
  const storageKey = buildAnonymousAttemptTokenStorageKey(shareId);
  const existingToken = storage.getItem(storageKey);
  if (existingToken) return existingToken;

  const token = createToken();
  storage.setItem(storageKey, token);
  return token;
}

function getStudentIdentityKey(source: StudentIdentitySource) {
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
