import type { AssignmentStatus } from '@/activities/types';

export type AssignmentDate = Date | string | null | undefined;

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
