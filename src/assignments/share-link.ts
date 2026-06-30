import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  type AssignmentDate,
  type AssignmentLifecycleStatus,
  getAssignmentLifecycleStatus,
} from '@/assignments/lifecycle';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_SHARE_ROUTE_TARGET = '/play/$shareId';

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

export type AssignmentShareLinkActionView = {
  copyLabel: string;
  disabledReason?: string;
  isAvailable: boolean;
  label: string;
  sharePath: string;
  sharePathLabel: string;
  shareSlug: string;
  to: typeof ASSIGNMENT_SHARE_ROUTE_TARGET;
};

export const assignmentShareLinkActionCopy = {
  get copyLabel() {
    return m.assignment_share_link_copy_label();
  },
  get copyStudentLabel() {
    return m.assignment_share_link_copy_student_label();
  },
  get failureMessage() {
    return m.assignment_share_link_copy_failure();
  },
  get pathLabel() {
    return m.assignment_share_link_path_label();
  },
  get successMessage() {
    return m.assignment_share_link_copy_success();
  },
} as const;

export type AssignmentShareLinkCopyExecutionPlan =
  | {
      failureMessage: string;
      message: string;
      reason: 'disabled' | 'missing-share-slug';
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

export function buildAssignmentShareLinkActionView({
  disabledReason,
  isAvailable = true,
  label,
  shareSlug,
}: {
  disabledReason?: string;
  isAvailable?: boolean;
  label: string;
  shareSlug: string;
}): AssignmentShareLinkActionView {
  const normalizedShareSlug = normalizeAssignmentShareSlug(shareSlug);

  return {
    copyLabel: assignmentShareLinkActionCopy.copyStudentLabel,
    ...(disabledReason ? { disabledReason } : {}),
    isAvailable,
    label,
    sharePath: buildAssignmentSharePath(normalizedShareSlug),
    sharePathLabel: assignmentShareLinkActionCopy.pathLabel,
    shareSlug: normalizedShareSlug,
    to: ASSIGNMENT_SHARE_ROUTE_TARGET,
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
      reason: 'disabled',
      type: 'blocked',
    };
  }

  if (!normalizeAssignmentShareSlug(shareSlug)) {
    return {
      failureMessage: assignmentShareLinkActionCopy.failureMessage,
      message: assignmentShareLinkActionCopy.failureMessage,
      reason: 'missing-share-slug',
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
  const normalized = baseUrl.normalize('NFKC').replace(/\s+/gu, '').trim();
  if (!normalized) return '';

  const absoluteUrl = normalizeShareAbsoluteUrl(normalized);
  if (absoluteUrl) return absoluteUrl;

  const secureUrl = normalizeShareAbsoluteUrl(`https://${normalized}`);
  if (secureUrl) return secureUrl;

  return normalized.replace(/\/+$/, '');
}

function normalizeShareAbsoluteUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
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
