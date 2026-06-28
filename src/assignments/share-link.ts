import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  type AssignmentDate,
  type AssignmentLifecycleStatus,
  getAssignmentLifecycleStatus,
} from '@/assignments/lifecycle';
import { m } from '@/locale/paraglide/messages';

export type AssignmentShareLinkAvailability = {
  isAvailable: boolean;
  lifecycleStatus: AssignmentLifecycleStatus;
  sharePath: string;
  shareSlug: string;
};

export type AssignmentShareLinkAvailabilityState = Pick<
  AssignmentShareLinkAvailability,
  'isAvailable' | 'lifecycleStatus'
>;

export const assignmentShareLinkActionCopy = {
  get copyLabel() {
    return m.assignment_share_link_copy_label();
  },
  get failureMessage() {
    return m.assignment_share_link_copy_failure();
  },
  get successMessage() {
    return m.assignment_share_link_copy_success();
  },
} as const;

export type AssignmentShareLinkCopyExecutionPlan =
  | {
      failureMessage: string;
      message: string;
      type: 'blocked';
    }
  | {
      failureMessage: string;
      successMessage: string;
      type: 'copy-link';
      url: string;
    };

export function buildAssignmentSharePath(shareSlug: string) {
  return `/play/${encodeURIComponent(normalizeAssignmentShareSlug(shareSlug))}`;
}

export function resolveAssignmentShareLinkLifecycle({
  expiresAt,
  now,
  status,
}: {
  expiresAt: AssignmentDate;
  now?: number;
  status: string;
}) {
  return getAssignmentLifecycleStatus(status, expiresAt, now);
}

export function buildAssignmentShareLinkAvailabilityState({
  expiresAt,
  now,
  status,
}: {
  expiresAt: AssignmentDate;
  now?: number;
  status: string;
}): AssignmentShareLinkAvailabilityState {
  const lifecycleStatus = resolveAssignmentShareLinkLifecycle({
    expiresAt,
    now,
    status,
  });

  return {
    isAvailable: lifecycleStatus === 'open',
    lifecycleStatus,
  };
}

export function buildAssignmentShareLinkAvailability({
  expiresAt,
  now,
  shareSlug,
  status,
}: {
  expiresAt: AssignmentDate;
  now?: number;
  shareSlug: string;
  status: string;
}): AssignmentShareLinkAvailability {
  const availabilityState = buildAssignmentShareLinkAvailabilityState({
    expiresAt,
    now,
    status,
  });
  const normalizedShareSlug = normalizeAssignmentShareSlug(shareSlug);

  return {
    ...availabilityState,
    sharePath: buildAssignmentSharePath(normalizedShareSlug),
    shareSlug: normalizedShareSlug,
  };
}

export function buildAssignmentShareUrl(shareSlug: string, baseUrl?: string) {
  const origin = normalizeShareBaseUrl(baseUrl ?? '') || getRuntimeBaseUrl();
  return `${origin}${buildAssignmentSharePath(shareSlug)}`;
}

export function buildAssignmentShareLinkCopyExecutionPlan({
  baseUrl,
  disabled,
  disabledMessage,
  shareSlug,
}: {
  baseUrl?: string;
  disabled?: boolean;
  disabledMessage?: string;
  shareSlug: string;
}): AssignmentShareLinkCopyExecutionPlan {
  if (disabled) {
    return {
      failureMessage: assignmentShareLinkActionCopy.failureMessage,
      message: disabledMessage ?? assignmentShareLinkActionCopy.failureMessage,
      type: 'blocked',
    };
  }

  return {
    failureMessage: assignmentShareLinkActionCopy.failureMessage,
    successMessage: assignmentShareLinkActionCopy.successMessage,
    type: 'copy-link',
    url: buildAssignmentShareUrl(shareSlug, baseUrl),
  };
}

export function normalizeShareBaseUrl(baseUrl: string) {
  const normalized = baseUrl.trim();
  if (!normalized) return '';

  try {
    return new URL(normalized).origin;
  } catch {
    return normalized.replace(/\/+$/, '');
  }
}

function getRuntimeBaseUrl() {
  if (typeof window !== 'undefined') {
    return normalizeShareBaseUrl(window.location.origin);
  }

  return normalizeShareBaseUrl(
    import.meta.env?.VITE_BASE_URL ?? 'http://localhost:3000'
  );
}
