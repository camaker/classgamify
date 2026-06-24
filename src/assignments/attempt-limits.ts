export type AssignmentAttemptUsage = {
  maxAttempts?: number;
  remainingAttempts?: number;
  usedAttempts: number;
};

export function buildAssignmentAttemptUsage({
  maxAttempts,
  previousAttemptCount,
}: {
  maxAttempts?: number | null;
  previousAttemptCount: number;
}): AssignmentAttemptUsage {
  const usedAttempts =
    normalizeAssignmentAttemptCount(previousAttemptCount) + 1;
  const normalizedMaxAttempts = normalizeAssignmentMaxAttempts(maxAttempts);

  return {
    maxAttempts: normalizedMaxAttempts,
    remainingAttempts:
      normalizedMaxAttempts === undefined
        ? undefined
        : Math.max(0, normalizedMaxAttempts - usedAttempts),
    usedAttempts,
  };
}

export function canUseAnotherAssignmentAttempt({
  maxAttempts,
  usedAttempts,
}: {
  maxAttempts?: number | null;
  usedAttempts: number;
}) {
  const normalizedMaxAttempts = normalizeAssignmentMaxAttempts(maxAttempts);

  return (
    normalizedMaxAttempts === undefined ||
    normalizeAssignmentAttemptCount(usedAttempts) < normalizedMaxAttempts
  );
}

function normalizeAssignmentAttemptCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function normalizeAssignmentMaxAttempts(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  const normalized = Math.trunc(value);
  return normalized >= 1 ? normalized : undefined;
}
