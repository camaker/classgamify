import type { AssignmentStatus } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type AssignmentDate = Date | string | null | undefined;
export type AssignmentLifecycleNow = AssignmentDate | number;
export type AssignmentLifecycleStatus = 'closed' | 'draft' | 'expired' | 'open';
export const ASSIGNMENT_MANAGED_STATUSES = ['published', 'closed'] as const;
export const ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS = [
  'current-status',
  'source-status',
  'status-label',
  'persisted-source',
  'student-access',
  'public-payload',
  'public-route-contract',
  'submission-gate',
  'teacher-list-state',
  'status-filter-alignment',
  'result-page-state',
  'close-action',
  'reopen-action',
  'copy-link-action',
  'preview-link-action',
  'next-status',
  'close-transition',
  'reopen-transition',
  'transition-error',
  'execution-plan',
  'expiry-check',
  'close-time',
  'close-window-policy',
  'draft-snapshot-gate',
  'snapshot-retention',
  'closed-snapshot-retention',
  'attempt-review-retention',
  'server-transition-guard',
  'owner-scope',
  'privacy-guard',
] as const;
export type ManagedAssignmentStatus = Extract<
  AssignmentStatus,
  (typeof ASSIGNMENT_MANAGED_STATUSES)[number]
>;
export type AssignmentLifecycleHandoffItemId =
  (typeof ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS)[number];
export type AssignmentLifecycleHandoffSurface =
  | 'result-page'
  | 'server-function'
  | 'shared'
  | 'student-access'
  | 'teacher-list';
export type AssignmentStatusActionKind = 'close-link' | 'reopen-link';
export type AssignmentStatusTransitionErrorCode =
  | 'already-closed'
  | 'already-open'
  | 'close-only-published'
  | 'reopen-expired'
  | 'reopen-only-closed'
  | 'unsupported-transition';

export type AssignmentStatusTransitionErrorView = {
  code: AssignmentStatusTransitionErrorCode;
  message: string;
};

export type AssignmentStatusAction = {
  ariaLabel: string;
  currentStatusLabel: string;
  currentStatusValue: string;
  description: string;
  failureMessage: string;
  kind: AssignmentStatusActionKind;
  label: string;
  nextStatusLabel: string;
  nextStatus: ManagedAssignmentStatus;
  nextStatusValue: string;
  pendingLabel: string;
  successMessage: string;
};

export type AssignmentLifecycleHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentLifecycleHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type AssignmentLifecycleHandoffPrivacyContract = {
  exposesActivityContent: false;
  exposesAnswerKeys: false;
  exposesInternalAssignmentIds: false;
  exposesPublicRouteUrl: false;
  exposesPublicShareSlug: false;
  exposesRawAnonymousToken: false;
  exposesStudentAnswerText: false;
  exposesStudentNames: false;
  exposesTeacherNotes: false;
  itemIds: AssignmentLifecycleHandoffItemId[];
};

export type AssignmentLifecycleHandoffView = {
  description: string;
  itemViews: AssignmentLifecycleHandoffItemView[];
  privacy: AssignmentLifecycleHandoffPrivacyContract;
  surface: AssignmentLifecycleHandoffSurface;
  title: string;
};

export type AssignmentStatusActionBlockedReason = 'missing-status-action';

export type AssignmentStatusActionExecutionPlan =
  | {
      reason: AssignmentStatusActionBlockedReason;
      type: 'blocked';
    }
  | {
      failureMessage: string;
      input: {
        assignmentId: string;
        status: ManagedAssignmentStatus;
      };
      successMessage: string;
      type: 'update-status';
    };

export function normalizeAssignmentLifecycleTimestamp(
  value: AssignmentLifecycleNow
) {
  if (value === null || value === undefined || value === '') return undefined;

  const timestamp =
    value instanceof Date
      ? value.getTime()
      : typeof value === 'number'
        ? value
        : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function normalizeAssignmentLifecycleNowTimestamp(
  now: AssignmentLifecycleNow = Date.now()
) {
  return normalizeAssignmentLifecycleTimestamp(now) ?? Date.now();
}

export function normalizeAssignmentLifecycleNowDate(
  now: AssignmentLifecycleNow = new Date()
) {
  return new Date(normalizeAssignmentLifecycleNowTimestamp(now));
}

export function isAssignmentExpired(
  expiresAt: AssignmentDate,
  now: AssignmentLifecycleNow = Date.now()
) {
  const timestamp = normalizeAssignmentLifecycleTimestamp(expiresAt);
  const nowTimestamp = normalizeAssignmentLifecycleNowTimestamp(now);
  return timestamp !== undefined && timestamp <= nowTimestamp;
}

export function isAssignmentOpen(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now: AssignmentLifecycleNow = Date.now()
) {
  return getAssignmentLifecycleStatus(status, expiresAt, now) === 'open';
}

export function getAssignmentLifecycleStatus(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now: AssignmentLifecycleNow = Date.now()
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
  now?: AssignmentLifecycleNow;
  status: AssignmentStatus | string;
}) {
  return getAssignmentLifecycleStatus(status, expiresAt, now) === filter;
}

export function getAssignmentSubmissionErrorMessage({
  expiresAt,
  now = Date.now(),
  status,
}: {
  expiresAt: AssignmentDate;
  now?: AssignmentLifecycleNow;
  status: AssignmentStatus | string;
}) {
  const lifecycleStatus = getAssignmentLifecycleStatus(status, expiresAt, now);

  if (lifecycleStatus === 'open') return undefined;
  if (lifecycleStatus === 'expired') {
    return m.assignment_api_error_assignment_expired();
  }
  if (lifecycleStatus === 'closed') {
    return m.assignment_api_error_assignment_closed();
  }

  return m.assignment_api_error_assignment_not_published();
}

export function assertAssignmentAcceptsSubmissions(input: {
  expiresAt: AssignmentDate;
  now?: AssignmentLifecycleNow;
  status: AssignmentStatus | string;
}) {
  const errorMessage = getAssignmentSubmissionErrorMessage(input);

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

export function getAssignmentStatusLabel(
  status: AssignmentStatus | string,
  expiresAt: AssignmentDate,
  now: AssignmentLifecycleNow = Date.now()
) {
  const lifecycleStatus = getAssignmentLifecycleStatus(status, expiresAt, now);

  if (lifecycleStatus === 'expired') return m.assignment_status_label_expired();
  if (lifecycleStatus === 'open') return m.assignment_status_label_open();
  if (lifecycleStatus === 'closed') return m.assignment_status_label_closed();

  return m.assignment_status_label_draft();
}

export function getAssignmentStatusTransitionError({
  currentStatus,
  expiresAt,
  nextStatus,
  now,
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: AssignmentLifecycleNow;
}) {
  return getAssignmentStatusTransitionErrorView({
    currentStatus,
    expiresAt,
    nextStatus,
    now,
  })?.message;
}

export function getAssignmentStatusTransitionErrorView({
  currentStatus,
  expiresAt,
  nextStatus,
  now = Date.now(),
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: AssignmentLifecycleNow;
}): AssignmentStatusTransitionErrorView | undefined {
  if (currentStatus === nextStatus) {
    return nextStatus === 'published'
      ? {
          code: 'already-open',
          message: m.assignment_status_error_already_open(),
        }
      : {
          code: 'already-closed',
          message: m.assignment_status_error_already_closed(),
        };
  }

  if (nextStatus === 'closed') {
    return currentStatus === 'published'
      ? undefined
      : {
          code: 'close-only-published',
          message: m.assignment_status_error_close_only_published(),
        };
  }

  if (nextStatus === 'published') {
    if (currentStatus !== 'closed') {
      return {
        code: 'reopen-only-closed',
        message: m.assignment_status_error_reopen_only_closed(),
      };
    }

    if (isAssignmentExpired(expiresAt, now)) {
      return {
        code: 'reopen-expired',
        message: m.assignment_status_error_reopen_expired(),
      };
    }

    return undefined;
  }

  return {
    code: 'unsupported-transition',
    message: m.assignment_status_action_failure(),
  };
}

function getNextManagedAssignmentStatus(
  currentStatus: AssignmentStatus
): ManagedAssignmentStatus {
  return currentStatus === 'published' ? 'closed' : 'published';
}

export function getAssignmentStatusActionCopy(
  nextStatus: ManagedAssignmentStatus
): Pick<
  AssignmentStatusAction,
  'description' | 'failureMessage' | 'label' | 'pendingLabel' | 'successMessage'
> {
  if (nextStatus === 'closed') {
    return {
      description: m.assignment_status_action_close_description(),
      failureMessage: m.assignment_status_action_failure(),
      label: m.assignment_status_action_close_label(),
      pendingLabel: m.assignment_status_action_close_pending_label(),
      successMessage: m.assignment_status_action_close_success(),
    };
  }

  return {
    description: m.assignment_status_action_reopen_description(),
    failureMessage: m.assignment_status_action_failure(),
    label: m.assignment_status_action_reopen_label(),
    pendingLabel: m.assignment_status_action_reopen_pending_label(),
    successMessage: m.assignment_status_action_reopen_success(),
  };
}

function buildAssignmentStatusActionAriaLabel({
  currentStatusValue,
  label,
  nextStatusValue,
}: {
  currentStatusValue: string;
  label: string;
  nextStatusValue: string;
}) {
  return m.assignment_status_action_aria_label({
    currentStatus: currentStatusValue,
    label,
    nextStatus: nextStatusValue,
  });
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
  now?: AssignmentLifecycleNow;
}): AssignmentStatusAction | undefined {
  if (!isPersisted) return undefined;

  const nextStatus = getNextManagedAssignmentStatus(currentStatus);

  if (
    getAssignmentStatusTransitionErrorView({
      currentStatus,
      expiresAt,
      nextStatus,
      now,
    })
  ) {
    return undefined;
  }

  const copy = getAssignmentStatusActionCopy(nextStatus);
  const currentStatusValue = getAssignmentStatusLabel(
    currentStatus,
    expiresAt,
    now
  );
  const nextStatusValue = getAssignmentStatusLabel(nextStatus, expiresAt, now);

  return {
    ariaLabel: buildAssignmentStatusActionAriaLabel({
      currentStatusValue,
      label: copy.label,
      nextStatusValue,
    }),
    currentStatusLabel: m.assignment_status_action_current_status_label(),
    currentStatusValue,
    kind: nextStatus === 'closed' ? 'close-link' : 'reopen-link',
    nextStatus,
    nextStatusLabel: m.assignment_status_action_next_status_label(),
    nextStatusValue,
    ...copy,
  };
}

export function buildAssignmentStatusActionExecutionPlan({
  assignmentId,
  statusAction,
}: {
  assignmentId: string;
  statusAction?: AssignmentStatusAction;
}): AssignmentStatusActionExecutionPlan {
  if (!statusAction) {
    return {
      reason: 'missing-status-action',
      type: 'blocked',
    };
  }

  return {
    failureMessage: statusAction.failureMessage,
    input: {
      assignmentId,
      status: statusAction.nextStatus,
    },
    successMessage: statusAction.successMessage,
    type: 'update-status',
  };
}

export function assertAssignmentStatusTransition(input: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: AssignmentLifecycleNow;
}) {
  const transitionError = getAssignmentStatusTransitionErrorView(input);
  if (!transitionError) return;

  throw new Error(transitionError.message);
}

export function buildAssignmentLifecycleHandoffView({
  currentStatus,
  expiresAt,
  isPersisted = true,
  now = Date.now(),
  surface = 'shared',
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  isPersisted?: boolean;
  now?: AssignmentLifecycleNow;
  surface?: AssignmentLifecycleHandoffSurface;
}): AssignmentLifecycleHandoffView {
  const lifecycleStatus = getAssignmentLifecycleStatus(
    currentStatus,
    expiresAt,
    now
  );
  const statusLabel = getAssignmentStatusLabel(currentStatus, expiresAt, now);
  const submissionErrorMessage = getAssignmentSubmissionErrorMessage({
    expiresAt,
    now,
    status: currentStatus,
  });
  const statusAction = buildAssignmentStatusAction({
    currentStatus,
    expiresAt,
    isPersisted,
    now,
  });
  const executionPlan = buildAssignmentStatusActionExecutionPlan({
    assignmentId: 'assignment-lifecycle-handoff',
    statusAction,
  });
  const closeTransitionError = getAssignmentStatusTransitionErrorView({
    currentStatus,
    expiresAt,
    nextStatus: 'closed',
    now,
  });
  const reopenTransitionError = getAssignmentStatusTransitionErrorView({
    currentStatus,
    expiresAt,
    nextStatus: 'published',
    now,
  });
  const transitionErrorMessage = resolveAssignmentLifecycleTransitionError({
    closeTransitionError,
    currentStatus,
    reopenTransitionError,
    statusAction,
  });
  const timestamp = normalizeAssignmentLifecycleTimestamp(expiresAt);
  const isOpen = lifecycleStatus === 'open';
  const isPersistedOpen = isPersisted && isOpen;
  const itemViews: AssignmentLifecycleHandoffItemView[] = [
    buildAssignmentLifecycleHandoffItem({
      id: 'current-status',
      statusLabel,
      value: lifecycleStatus,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'source-status',
      statusLabel: currentStatus,
      value: currentStatus,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'status-label',
      statusLabel,
      value: statusLabel,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'persisted-source',
      value: formatAssignmentLifecyclePersistence(isPersisted),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'student-access',
      statusLabel: formatAssignmentLifecycleAvailability(isOpen),
      value: formatAssignmentLifecycleAvailability(isOpen),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'public-payload',
      statusLabel: formatAssignmentLifecycleAvailability(isOpen),
      value: formatAssignmentLifecycleAvailability(isOpen),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'public-route-contract',
      statusLabel: formatAssignmentLifecycleAvailability(isPersistedOpen),
      value: formatAssignmentLifecycleAvailability(isPersistedOpen),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'submission-gate',
      statusLabel: isOpen
        ? m.assignment_lifecycle_handoff_accepting_submissions_value()
        : m.assignment_lifecycle_handoff_rejecting_submissions_value(),
      value:
        submissionErrorMessage ??
        m.assignment_lifecycle_handoff_accepting_submissions_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'teacher-list-state',
      statusLabel,
      value: statusLabel,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'status-filter-alignment',
      statusLabel: lifecycleStatus,
      value: lifecycleStatus,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'result-page-state',
      statusLabel,
      value: statusLabel,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'close-action',
      statusLabel: formatAssignmentLifecycleActionReadiness(
        statusAction?.kind === 'close-link'
      ),
      value: formatAssignmentLifecycleActionReadiness(
        statusAction?.kind === 'close-link'
      ),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'reopen-action',
      statusLabel: formatAssignmentLifecycleActionReadiness(
        statusAction?.kind === 'reopen-link'
      ),
      value: formatAssignmentLifecycleActionReadiness(
        statusAction?.kind === 'reopen-link'
      ),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'copy-link-action',
      statusLabel: formatAssignmentLifecycleActionReadiness(isPersistedOpen),
      value: formatAssignmentLifecycleActionReadiness(isPersistedOpen),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'preview-link-action',
      statusLabel: formatAssignmentLifecycleActionReadiness(isPersistedOpen),
      value: formatAssignmentLifecycleActionReadiness(isPersistedOpen),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'next-status',
      value:
        statusAction?.nextStatusValue ??
        m.assignment_lifecycle_handoff_not_available_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'close-transition',
      value:
        closeTransitionError?.message ??
        m.assignment_lifecycle_handoff_ready_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'reopen-transition',
      value:
        reopenTransitionError?.message ??
        m.assignment_lifecycle_handoff_ready_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'transition-error',
      value:
        transitionErrorMessage ?? m.assignment_lifecycle_handoff_none_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'execution-plan',
      statusLabel: executionPlan.type,
      value: executionPlan.type,
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'expiry-check',
      value: formatAssignmentLifecycleExpiryCheck({
        expiresAt,
        now,
      }),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'close-time',
      value:
        timestamp === undefined
          ? m.assignment_lifecycle_handoff_not_scheduled_value()
          : m.assignment_lifecycle_handoff_scheduled_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'close-window-policy',
      value: formatAssignmentLifecycleCloseWindowPolicy({
        expiresAt,
        now,
      }),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'draft-snapshot-gate',
      value:
        lifecycleStatus === 'draft'
          ? m.assignment_lifecycle_handoff_publish_required_value()
          : m.assignment_lifecycle_handoff_snapshot_frozen_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'snapshot-retention',
      value:
        lifecycleStatus === 'draft'
          ? m.assignment_lifecycle_handoff_publish_required_value()
          : m.assignment_lifecycle_handoff_snapshot_frozen_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'closed-snapshot-retention',
      value:
        lifecycleStatus === 'closed'
          ? m.assignment_lifecycle_handoff_results_retained_value()
          : m.assignment_lifecycle_handoff_snapshot_frozen_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'attempt-review-retention',
      value: m.assignment_lifecycle_handoff_attempt_review_retained_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'server-transition-guard',
      value: m.assignment_lifecycle_handoff_validated_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'owner-scope',
      value: m.assignment_lifecycle_handoff_owner_scoped_value(),
    }),
    buildAssignmentLifecycleHandoffItem({
      id: 'privacy-guard',
      value: m.assignment_lifecycle_handoff_private_data_omitted_value(),
    }),
  ];

  return {
    description: m.assignment_lifecycle_handoff_description(),
    itemViews,
    privacy: buildAssignmentLifecycleHandoffPrivacyContract(itemViews),
    surface,
    title: m.assignment_lifecycle_handoff_title(),
  };
}

function buildAssignmentLifecycleHandoffPrivacyContract(
  itemViews: AssignmentLifecycleHandoffItemView[]
): AssignmentLifecycleHandoffPrivacyContract {
  return {
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesInternalAssignmentIds: false,
    exposesPublicRouteUrl: false,
    exposesPublicShareSlug: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    exposesTeacherNotes: false,
    itemIds: itemViews.map((item) => item.id),
  };
}

function buildAssignmentLifecycleHandoffItem({
  id,
  statusLabel,
  value,
}: {
  id: AssignmentLifecycleHandoffItemId;
  statusLabel?: string;
  value: string;
}): AssignmentLifecycleHandoffItemView {
  const copy = getAssignmentLifecycleHandoffItemCopy(id);

  return {
    ariaLabel: m.assignment_lifecycle_handoff_item_aria({
      description: copy.description,
      label: copy.label,
      value,
    }),
    description: copy.description,
    id,
    label: copy.label,
    statusLabel,
    value,
  };
}

function getAssignmentLifecycleHandoffItemCopy(
  id: AssignmentLifecycleHandoffItemId
) {
  switch (id) {
    case 'current-status':
      return {
        description:
          m.assignment_lifecycle_handoff_current_status_description(),
        label: m.assignment_lifecycle_handoff_current_status_label(),
      };
    case 'source-status':
      return {
        description: m.assignment_lifecycle_handoff_source_status_description(),
        label: m.assignment_lifecycle_handoff_source_status_label(),
      };
    case 'status-label':
      return {
        description: m.assignment_lifecycle_handoff_status_label_description(),
        label: m.assignment_lifecycle_handoff_status_label_label(),
      };
    case 'persisted-source':
      return {
        description:
          m.assignment_lifecycle_handoff_persisted_source_description(),
        label: m.assignment_lifecycle_handoff_persisted_source_label(),
      };
    case 'student-access':
      return {
        description:
          m.assignment_lifecycle_handoff_student_access_description(),
        label: m.assignment_lifecycle_handoff_student_access_label(),
      };
    case 'public-payload':
      return {
        description:
          m.assignment_lifecycle_handoff_public_payload_description(),
        label: m.assignment_lifecycle_handoff_public_payload_label(),
      };
    case 'public-route-contract':
      return {
        description:
          m.assignment_lifecycle_handoff_public_route_contract_description(),
        label: m.assignment_lifecycle_handoff_public_route_contract_label(),
      };
    case 'submission-gate':
      return {
        description:
          m.assignment_lifecycle_handoff_submission_gate_description(),
        label: m.assignment_lifecycle_handoff_submission_gate_label(),
      };
    case 'teacher-list-state':
      return {
        description:
          m.assignment_lifecycle_handoff_teacher_list_state_description(),
        label: m.assignment_lifecycle_handoff_teacher_list_state_label(),
      };
    case 'status-filter-alignment':
      return {
        description:
          m.assignment_lifecycle_handoff_status_filter_alignment_description(),
        label: m.assignment_lifecycle_handoff_status_filter_alignment_label(),
      };
    case 'result-page-state':
      return {
        description:
          m.assignment_lifecycle_handoff_result_page_state_description(),
        label: m.assignment_lifecycle_handoff_result_page_state_label(),
      };
    case 'close-action':
      return {
        description: m.assignment_lifecycle_handoff_close_action_description(),
        label: m.assignment_lifecycle_handoff_close_action_label(),
      };
    case 'reopen-action':
      return {
        description: m.assignment_lifecycle_handoff_reopen_action_description(),
        label: m.assignment_lifecycle_handoff_reopen_action_label(),
      };
    case 'copy-link-action':
      return {
        description:
          m.assignment_lifecycle_handoff_copy_link_action_description(),
        label: m.assignment_lifecycle_handoff_copy_link_action_label(),
      };
    case 'preview-link-action':
      return {
        description:
          m.assignment_lifecycle_handoff_preview_link_action_description(),
        label: m.assignment_lifecycle_handoff_preview_link_action_label(),
      };
    case 'next-status':
      return {
        description: m.assignment_lifecycle_handoff_next_status_description(),
        label: m.assignment_lifecycle_handoff_next_status_label(),
      };
    case 'close-transition':
      return {
        description:
          m.assignment_lifecycle_handoff_close_transition_description(),
        label: m.assignment_lifecycle_handoff_close_transition_label(),
      };
    case 'reopen-transition':
      return {
        description:
          m.assignment_lifecycle_handoff_reopen_transition_description(),
        label: m.assignment_lifecycle_handoff_reopen_transition_label(),
      };
    case 'transition-error':
      return {
        description:
          m.assignment_lifecycle_handoff_transition_error_description(),
        label: m.assignment_lifecycle_handoff_transition_error_label(),
      };
    case 'execution-plan':
      return {
        description:
          m.assignment_lifecycle_handoff_execution_plan_description(),
        label: m.assignment_lifecycle_handoff_execution_plan_label(),
      };
    case 'expiry-check':
      return {
        description: m.assignment_lifecycle_handoff_expiry_check_description(),
        label: m.assignment_lifecycle_handoff_expiry_check_label(),
      };
    case 'close-time':
      return {
        description: m.assignment_lifecycle_handoff_close_time_description(),
        label: m.assignment_lifecycle_handoff_close_time_label(),
      };
    case 'close-window-policy':
      return {
        description:
          m.assignment_lifecycle_handoff_close_window_policy_description(),
        label: m.assignment_lifecycle_handoff_close_window_policy_label(),
      };
    case 'draft-snapshot-gate':
      return {
        description:
          m.assignment_lifecycle_handoff_draft_snapshot_gate_description(),
        label: m.assignment_lifecycle_handoff_draft_snapshot_gate_label(),
      };
    case 'snapshot-retention':
      return {
        description:
          m.assignment_lifecycle_handoff_snapshot_retention_description(),
        label: m.assignment_lifecycle_handoff_snapshot_retention_label(),
      };
    case 'closed-snapshot-retention':
      return {
        description:
          m.assignment_lifecycle_handoff_closed_snapshot_retention_description(),
        label: m.assignment_lifecycle_handoff_closed_snapshot_retention_label(),
      };
    case 'attempt-review-retention':
      return {
        description:
          m.assignment_lifecycle_handoff_attempt_review_retention_description(),
        label: m.assignment_lifecycle_handoff_attempt_review_retention_label(),
      };
    case 'server-transition-guard':
      return {
        description:
          m.assignment_lifecycle_handoff_server_transition_guard_description(),
        label: m.assignment_lifecycle_handoff_server_transition_guard_label(),
      };
    case 'owner-scope':
      return {
        description: m.assignment_lifecycle_handoff_owner_scope_description(),
        label: m.assignment_lifecycle_handoff_owner_scope_label(),
      };
    case 'privacy-guard':
      return {
        description: m.assignment_lifecycle_handoff_privacy_guard_description(),
        label: m.assignment_lifecycle_handoff_privacy_guard_label(),
      };
  }
}

function formatAssignmentLifecycleAvailability(isAvailable: boolean) {
  return isAvailable
    ? m.assignment_lifecycle_handoff_available_value()
    : m.assignment_lifecycle_handoff_blocked_value();
}

function formatAssignmentLifecycleActionReadiness(isReady: boolean) {
  return isReady
    ? m.assignment_lifecycle_handoff_ready_value()
    : m.assignment_lifecycle_handoff_not_available_value();
}

function formatAssignmentLifecyclePersistence(isPersisted: boolean) {
  return isPersisted
    ? m.assignment_lifecycle_handoff_persisted_value()
    : m.assignment_lifecycle_handoff_preview_value();
}

function formatAssignmentLifecycleExpiryCheck({
  expiresAt,
  now,
}: {
  expiresAt: AssignmentDate;
  now: AssignmentLifecycleNow;
}) {
  if (isAssignmentExpired(expiresAt, now)) {
    return m.assignment_lifecycle_handoff_expired_close_time_value();
  }

  if (normalizeAssignmentLifecycleTimestamp(expiresAt) !== undefined) {
    return m.assignment_lifecycle_handoff_future_close_time_value();
  }

  return m.assignment_lifecycle_handoff_no_close_time_value();
}

function formatAssignmentLifecycleCloseWindowPolicy({
  expiresAt,
  now,
}: {
  expiresAt: AssignmentDate;
  now: AssignmentLifecycleNow;
}) {
  if (isAssignmentExpired(expiresAt, now)) {
    return m.assignment_lifecycle_handoff_close_window_expired_value();
  }

  if (normalizeAssignmentLifecycleTimestamp(expiresAt) !== undefined) {
    return m.assignment_lifecycle_handoff_close_window_scheduled_value();
  }

  return m.assignment_lifecycle_handoff_close_window_open_value();
}

function resolveAssignmentLifecycleTransitionError({
  closeTransitionError,
  currentStatus,
  reopenTransitionError,
  statusAction,
}: {
  closeTransitionError?: AssignmentStatusTransitionErrorView;
  currentStatus: AssignmentStatus;
  reopenTransitionError?: AssignmentStatusTransitionErrorView;
  statusAction?: AssignmentStatusAction;
}) {
  if (statusAction?.nextStatus === 'published') {
    return reopenTransitionError?.message;
  }

  if (statusAction?.nextStatus === 'closed') {
    return closeTransitionError?.message;
  }

  if (currentStatus === 'closed') {
    return reopenTransitionError?.message ?? closeTransitionError?.message;
  }

  return closeTransitionError?.message ?? reopenTransitionError?.message;
}
