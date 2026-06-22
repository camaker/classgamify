import { m } from '@/locale/paraglide/messages';

const ANONYMOUS_ATTEMPT_TOKEN_PREFIX = 'classgamify:attempt-token:';

export type StudentIdentitySource = {
  anonymousToken?: string | null;
  studentName?: string | null;
};

type AnonymousAttemptTokenStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type StudentIdentity = {
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
  const baseLabel = m.student_identity_anonymous_browser();
  if (!anonymousToken) return baseLabel;

  const suffix = anonymousToken.replace(/[^a-z0-9]/gi, '').slice(-6);
  return suffix ? `${baseLabel} ${suffix.toUpperCase()}` : baseLabel;
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
        ? formatAnonymousStudentLabel(anonymousIndex++)
        : formatAnonymousStudentLabel()
    );
  }

  return {
    resolve(source: StudentIdentitySource): StudentIdentity {
      const key = getStudentIdentityKey(source);
      return {
        key,
        label: labelsByKey.get(key) ?? formatAnonymousStudentLabel(),
      };
    },
  };
}

function formatAnonymousStudentLabel(index?: number) {
  return index
    ? m.student_identity_anonymous_student_index({ index })
    : m.student_identity_anonymous_student();
}
