import type { AssignmentStatus } from '@/activities/types';

export type AssignmentDate = Date | string | null | undefined;
export type ManagedAssignmentStatus = Extract<
  AssignmentStatus,
  'closed' | 'published'
>;

export function getAssignmentTimestamp(value: AssignmentDate) {
  if (!value) return undefined;

  const timestamp =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

export function isAssignmentExpired(
  expiresAt: AssignmentDate,
  now = Date.now()
) {
  const timestamp = getAssignmentTimestamp(expiresAt);
  return timestamp !== undefined && timestamp <= now;
}

export function isAssignmentOpen(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now = Date.now()
) {
  return status === 'published' && !isAssignmentExpired(expiresAt, now);
}

export function getAssignmentStatusLabel(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now = Date.now()
) {
  if (status === 'published' && isAssignmentExpired(expiresAt, now)) {
    return 'Expired';
  }
  if (status === 'published') return 'Open';
  if (status === 'closed') return 'Closed';
  return 'Draft';
}

export function canUpdateAssignmentStatus({
  currentStatus,
  expiresAt,
  nextStatus,
  now = Date.now(),
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: number;
}) {
  if (nextStatus === 'closed') {
    return currentStatus === 'published';
  }

  if (nextStatus === 'published') {
    return currentStatus === 'closed' && !isAssignmentExpired(expiresAt, now);
  }

  return false;
}

export function getAssignmentStatusTransitionError({
  currentStatus,
  expiresAt,
  nextStatus,
  now = Date.now(),
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: number;
}) {
  if (currentStatus === nextStatus) {
    return nextStatus === 'published'
      ? 'Assignment link is already open.'
      : 'Assignment link is already closed.';
  }

  if (nextStatus === 'closed' && currentStatus !== 'published') {
    return 'Only published assignment links can be closed.';
  }

  if (nextStatus === 'published') {
    if (currentStatus !== 'closed') {
      return 'Only closed assignment links can be reopened.';
    }

    if (isAssignmentExpired(expiresAt, now)) {
      return 'Expired assignments cannot be reopened.';
    }
  }

  return undefined;
}

export function assertAssignmentStatusTransition(input: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: number;
}) {
  if (canUpdateAssignmentStatus(input)) return;

  throw new Error(
    getAssignmentStatusTransitionError(input) ??
      'Assignment status could not be updated.'
  );
}
