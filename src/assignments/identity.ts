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

function getStudentIdentityGroupingKey(source: StudentIdentitySource) {
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
  return (
    getStudentIdentityGroupingKey(left) === getStudentIdentityGroupingKey(right)
  );
}

export function createStudentIdentityResolver(
  attempts: StudentIdentitySource[]
) {
  const identitiesByGroupingKey = new Map<string, StudentIdentity>();
  let anonymousIndex = 1;

  for (const attempt of attempts) {
    const groupingKey = getStudentIdentityGroupingKey(attempt);
    if (identitiesByGroupingKey.has(groupingKey)) continue;

    const studentName = normalizeStudentName(attempt.studentName);
    if (studentName) {
      identitiesByGroupingKey.set(groupingKey, {
        key: `name:${studentName.toLocaleLowerCase()}`,
        label: studentName,
      });
      continue;
    }

    const anonymousToken = normalizeAnonymousToken(attempt.anonymousToken);
    const label = anonymousToken
      ? formatAnonymousStudentLabel(anonymousIndex)
      : formatAnonymousStudentLabel();

    identitiesByGroupingKey.set(groupingKey, {
      key: anonymousToken ? `anonymous:${anonymousIndex}` : 'anonymous:unknown',
      label,
    });

    if (anonymousToken) {
      anonymousIndex += 1;
    }
  }

  return {
    resolve(source: StudentIdentitySource): StudentIdentity {
      const groupingKey = getStudentIdentityGroupingKey(source);
      const identity = identitiesByGroupingKey.get(groupingKey);
      if (identity) return identity;

      const studentName = normalizeStudentName(source.studentName);
      if (studentName) {
        return {
          key: `name:${studentName.toLocaleLowerCase()}`,
          label: studentName,
        };
      }

      return {
        key: 'anonymous:unknown',
        label: formatAnonymousStudentLabel(),
      };
    },
  };
}

function formatAnonymousStudentLabel(index?: number) {
  return index
    ? m.student_identity_anonymous_student_index({ index })
    : m.student_identity_anonymous_student();
}
