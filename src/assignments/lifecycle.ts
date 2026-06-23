import type { AssignmentStatus } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type AssignmentDate = Date | string | null | undefined;
export type AssignmentLifecycleStatus = 'closed' | 'draft' | 'expired' | 'open';
export type ManagedAssignmentStatus = Extract<
  AssignmentStatus,
  'closed' | 'published'
>;
export type AssignmentStatusActionKind = 'close-link' | 'reopen-link';

export type AssignmentStatusAction = {
  failureMessage: string;
  kind: AssignmentStatusActionKind;
  label: string;
  nextStatus: ManagedAssignmentStatus;
  successMessage: string;
};

function getAssignmentTimestamp(value: AssignmentDate) {
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
  return getAssignmentLifecycleStatus(status, expiresAt, now) === 'open';
}

export function getAssignmentLifecycleStatus(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now = Date.now()
): AssignmentLifecycleStatus {
  if (status === 'published') {
    return isAssignmentExpired(expiresAt, now) ? 'expired' : 'open';
  }

  if (status === 'closed') return 'closed';

  return 'draft';
}

export function matchesAssignmentLifecycleStatus({
  expiresAt,
  filter,
  now = Date.now(),
  status,
}: {
  expiresAt: AssignmentDate;
  filter: AssignmentLifecycleStatus;
  now?: number;
  status: AssignmentStatus | string;
}) {
  return getAssignmentLifecycleStatus(status, expiresAt, now) === filter;
}

export function getAssignmentStatusLabel(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now = Date.now()
) {
  const lifecycleStatus = getAssignmentLifecycleStatus(status, expiresAt, now);

  if (lifecycleStatus === 'expired') return m.assignment_status_label_expired();
  if (lifecycleStatus === 'open') return m.assignment_status_label_open();
  if (lifecycleStatus === 'closed') return m.assignment_status_label_closed();

  return m.assignment_status_label_draft();
}

function canUpdateAssignmentStatus({
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

function getNextManagedAssignmentStatus(
  currentStatus: AssignmentStatus
): ManagedAssignmentStatus {
  return currentStatus === 'published' ? 'closed' : 'published';
}

export function getAssignmentStatusActionCopy(
  nextStatus: ManagedAssignmentStatus
): Omit<AssignmentStatusAction, 'kind' | 'nextStatus'> {
  if (nextStatus === 'closed') {
    return {
      failureMessage: m.assignment_status_action_failure(),
      label: m.assignment_status_action_close_label(),
      successMessage: m.assignment_status_action_close_success(),
    };
  }

  return {
    failureMessage: m.assignment_status_action_failure(),
    label: m.assignment_status_action_reopen_label(),
    successMessage: m.assignment_status_action_reopen_success(),
  };
}

export function buildAssignmentStatusAction({
  currentStatus,
  expiresAt,
  isPersisted = true,
  now = Date.now(),
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  isPersisted?: boolean;
  now?: number;
}): AssignmentStatusAction | undefined {
  if (!isPersisted) return undefined;

  const nextStatus = getNextManagedAssignmentStatus(currentStatus);

  if (
    !canUpdateAssignmentStatus({
      currentStatus,
      expiresAt,
      nextStatus,
      now,
    })
  ) {
    return undefined;
  }

  return {
    kind: nextStatus === 'closed' ? 'close-link' : 'reopen-link',
    nextStatus,
    ...getAssignmentStatusActionCopy(nextStatus),
  };
}

function getAssignmentStatusTransitionError({
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
      ? m.assignment_status_error_already_open()
      : m.assignment_status_error_already_closed();
  }

  if (nextStatus === 'closed' && currentStatus !== 'published') {
    return m.assignment_status_error_close_only_published();
  }

  if (nextStatus === 'published') {
    if (currentStatus !== 'closed') {
      return m.assignment_status_error_reopen_only_closed();
    }

    if (isAssignmentExpired(expiresAt, now)) {
      return m.assignment_status_error_reopen_expired();
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
      m.assignment_status_action_failure()
  );
}
