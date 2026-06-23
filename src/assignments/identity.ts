import { m } from '@/locale/paraglide/messages';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';

const ANONYMOUS_ATTEMPT_TOKEN_PREFIX = 'classgamify:attempt-token:';
const ANONYMOUS_BROWSER_CODE_LENGTH = 6;

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

  return `${baseLabel} ${buildAnonymousBrowserCode(anonymousToken)}`;
}

export function buildAnonymousAttemptTokenStorageKey(shareId: string) {
  return `${ANONYMOUS_ATTEMPT_TOKEN_PREFIX}${normalizeAssignmentShareSlug(
    shareId
  )}`;
}

function createAnonymousAttemptToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildAnonymousBrowserCode(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0)
    .toString(36)
    .toUpperCase()
    .padStart(ANONYMOUS_BROWSER_CODE_LENGTH, '0')
    .slice(-ANONYMOUS_BROWSER_CODE_LENGTH);
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
  const existingTokenValue = storage.getItem(storageKey);
  const existingToken = normalizeAnonymousToken(existingTokenValue);
  if (existingToken) {
    if (existingToken !== existingTokenValue) {
      storage.setItem(storageKey, existingToken);
    }

    return existingToken;
  }

  const token = normalizeAnonymousToken(createToken());
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
