import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  type AssignmentDate,
  type AssignmentLifecycleStatus,
  getAssignmentLifecycleStatus,
} from '@/assignments/lifecycle';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_SHARE_ROUTE_TARGET = '/play/$shareId';

export const ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS = [
  'route-target',
  'normalized-share-slug',
  'normalized-slug-component',
  'encoded-share-path',
  'encoded-route-param',
  'absolute-share-url',
  'base-url-origin',
  'route-param',
  'preview-route-params',
  'path-label',
  'url-label',
  'public-delivery-contract',
  'availability',
  'lifecycle-guard',
  'disabled-reason',
  'copy-disabled-gate',
  'copy-action',
  'clipboard-payload',
  'copy-execution-plan',
  'copy-feedback',
  'preview-disabled-gate',
  'preview-action',
  'student-runner-target',
  'path-encoding-guard',
  'publish-success-surface',
  'assignment-list-surface',
  'result-page-surface',
  'surface-consistency',
  'missing-slug-guard',
  'privacy-guard',
] as const;

export type AssignmentShareLinkHandoffItemId =
  (typeof ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS)[number];

export type AssignmentShareLinkHandoffSurface =
  | 'assignment-list'
  | 'publish-success'
  | 'result-page'
  | 'shared';

export type AssignmentShareLinkAvailability = {
  disabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
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
  disabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
  disabledReason?: string;
  isAvailable: boolean;
  label: string;
  sharePath: string;
  sharePathLabel: string;
  shareSlug: string;
  shareUrl: string;
  shareUrlLabel: string;
  to: typeof ASSIGNMENT_SHARE_ROUTE_TARGET;
};

export type AssignmentShareLinkHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentShareLinkHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type AssignmentShareLinkHandoffPrivacyContract = {
  exposesActivityContent: false;
  exposesAnswerKeys: false;
  exposesClipboardPrivateData: false;
  exposesInternalAssignmentIds: false;
  exposesInternalBaseUrlConfig: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesStudentNames: false;
  exposesTeacherNotes: false;
  itemIds: AssignmentShareLinkHandoffItemId[];
  scope: 'assignment-share-link-distribution';
  shareUrlIsPublicDeliveryLink: true;
};

export type AssignmentShareLinkHandoffView = {
  description: string;
  itemViews: AssignmentShareLinkHandoffItemView[];
  privacy: AssignmentShareLinkHandoffPrivacyContract;
  surface: AssignmentShareLinkHandoffSurface;
  title: string;
};

export type AssignmentShareLinkDisabledReasonCode =
  | Exclude<AssignmentLifecycleStatus, 'open'>
  | 'missing-share-slug';

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
  get urlLabel() {
    return m.assignment_share_link_url_label();
  },
} as const;

export type AssignmentShareLinkCopyExecutionPlan =
  | {
      failureMessage: string;
      message: string;
      reason: AssignmentShareLinkDisabledReasonCode | 'disabled';
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
  const disabledReason = getAssignmentShareLinkDisabledReasonCode({
    lifecycleStatus: availabilityState.lifecycleStatus,
    shareSlug: normalizedShareSlug,
  });

  return {
    ...availabilityState,
    ...disabledReason,
    isAvailable:
      availabilityState.isAvailable && !disabledReason.disabledReasonCode,
    sharePath: buildAssignmentSharePath(normalizedShareSlug),
    shareSlug: normalizedShareSlug,
  };
}

export function buildAssignmentShareLinkActionView({
  baseUrl,
  disabledReasonCode,
  disabledReason,
  isAvailable = true,
  label,
  shareSlug,
}: {
  baseUrl?: string;
  disabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
  disabledReason?: string;
  isAvailable?: boolean;
  label: string;
  shareSlug: string;
}): AssignmentShareLinkActionView {
  const normalizedShareSlug = normalizeAssignmentShareSlug(shareSlug);
  const resolvedDisabledReasonCode =
    disabledReasonCode ??
    getAssignmentShareLinkDisabledReasonCode({
      lifecycleStatus: 'open',
      shareSlug: normalizedShareSlug,
    }).disabledReasonCode;
  const resolvedIsAvailable = isAvailable && !resolvedDisabledReasonCode;

  return {
    copyLabel: assignmentShareLinkActionCopy.copyStudentLabel,
    ...(resolvedDisabledReasonCode
      ? { disabledReasonCode: resolvedDisabledReasonCode }
      : {}),
    ...(disabledReason ? { disabledReason } : {}),
    isAvailable: resolvedIsAvailable,
    label,
    sharePath: buildAssignmentSharePath(normalizedShareSlug),
    sharePathLabel: assignmentShareLinkActionCopy.pathLabel,
    shareSlug: normalizedShareSlug,
    shareUrl: buildAssignmentShareUrl(normalizedShareSlug, baseUrl),
    shareUrlLabel: assignmentShareLinkActionCopy.urlLabel,
    to: ASSIGNMENT_SHARE_ROUTE_TARGET,
  };
}

export function buildAssignmentShareLinkHandoffView(
  actionView: AssignmentShareLinkActionView,
  {
    surface = 'shared',
  }: {
    surface?: AssignmentShareLinkHandoffSurface;
  } = {}
): AssignmentShareLinkHandoffView {
  const availabilityValue = actionView.isAvailable
    ? m.assignment_share_link_handoff_available_value()
    : m.assignment_share_link_handoff_unavailable_value();
  const actionStateValue = actionView.isAvailable
    ? m.assignment_share_link_handoff_enabled_value()
    : m.assignment_share_link_handoff_disabled_value();
  const disabledReasonValue =
    actionView.disabledReason ??
    formatAssignmentShareLinkDisabledReasonCode(actionView.disabledReasonCode);
  const copyExecutionPlan = buildAssignmentShareLinkCopyExecutionPlan({
    disabled: !actionView.isAvailable,
    disabledMessage: disabledReasonValue || undefined,
    disabledReasonCode: actionView.disabledReasonCode,
    shareSlug: actionView.shareSlug,
    shareUrl: actionView.shareUrl,
  });
  const encodedRouteParam = getAssignmentShareLinkEncodedRouteParam(
    actionView.sharePath
  );
  const encodedRouteParamValue =
    encodedRouteParam || m.assignment_share_link_handoff_missing_value();
  const itemViews: AssignmentShareLinkHandoffItemView[] = [
    buildAssignmentShareLinkHandoffItem({
      id: 'route-target',
      value: actionView.to,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'normalized-share-slug',
      value: actionView.shareSlug
        ? m.assignment_share_link_handoff_resolved_value()
        : m.assignment_share_link_handoff_missing_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'normalized-slug-component',
      value:
        actionView.shareSlug || m.assignment_share_link_handoff_missing_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'encoded-share-path',
      value: actionView.sharePath,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'encoded-route-param',
      value: encodedRouteParamValue,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'absolute-share-url',
      value: actionView.shareUrl,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'base-url-origin',
      value: getAssignmentShareLinkUrlOrigin(actionView.shareUrl),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'route-param',
      value: 'shareId',
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'preview-route-params',
      value: `shareId=${encodedRouteParamValue}`,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'path-label',
      value: actionView.sharePathLabel,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'url-label',
      value: actionView.shareUrlLabel,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'public-delivery-contract',
      value: m.assignment_share_link_handoff_public_delivery_link_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'availability',
      statusLabel: availabilityValue,
      value: availabilityValue,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'lifecycle-guard',
      statusLabel: disabledReasonValue,
      value:
        disabledReasonValue || m.assignment_share_link_handoff_open_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'disabled-reason',
      value:
        disabledReasonValue || m.assignment_share_link_handoff_none_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'copy-disabled-gate',
      statusLabel: actionStateValue,
      value: actionStateValue,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'copy-action',
      statusLabel: actionStateValue,
      value: actionStateValue,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'clipboard-payload',
      value: actionView.isAvailable
        ? actionView.shareUrl
        : m.assignment_share_link_handoff_blocked_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'copy-execution-plan',
      statusLabel:
        formatAssignmentShareLinkCopyExecutionPlanValue(copyExecutionPlan),
      value: formatAssignmentShareLinkCopyExecutionPlanValue(copyExecutionPlan),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'copy-feedback',
      value: assignmentShareLinkActionCopy.successMessage,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'preview-disabled-gate',
      statusLabel: actionStateValue,
      value: actionStateValue,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'preview-action',
      statusLabel: actionStateValue,
      value: actionStateValue,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'student-runner-target',
      value: ASSIGNMENT_SHARE_ROUTE_TARGET,
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'path-encoding-guard',
      statusLabel: formatAssignmentShareLinkPathEncodingGuard(actionView),
      value: formatAssignmentShareLinkPathEncodingGuard(actionView),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'publish-success-surface',
      statusLabel: formatAssignmentShareLinkHandoffSurfaceValue(
        surface,
        'publish-success'
      ),
      value: formatAssignmentShareLinkHandoffSurfaceValue(
        surface,
        'publish-success'
      ),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'assignment-list-surface',
      statusLabel: formatAssignmentShareLinkHandoffSurfaceValue(
        surface,
        'assignment-list'
      ),
      value: formatAssignmentShareLinkHandoffSurfaceValue(
        surface,
        'assignment-list'
      ),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'result-page-surface',
      statusLabel: formatAssignmentShareLinkHandoffSurfaceValue(
        surface,
        'result-page'
      ),
      value: formatAssignmentShareLinkHandoffSurfaceValue(
        surface,
        'result-page'
      ),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'surface-consistency',
      statusLabel: m.assignment_share_link_handoff_surface_consistent_value(),
      value: m.assignment_share_link_handoff_surface_consistent_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'missing-slug-guard',
      statusLabel:
        actionView.disabledReasonCode === 'missing-share-slug'
          ? m.assignment_share_link_handoff_blocked_value()
          : m.assignment_share_link_handoff_passed_value(),
      value:
        actionView.disabledReasonCode === 'missing-share-slug'
          ? m.assignment_share_link_handoff_blocked_value()
          : m.assignment_share_link_handoff_passed_value(),
    }),
    buildAssignmentShareLinkHandoffItem({
      id: 'privacy-guard',
      value: m.assignment_share_link_handoff_private_data_omitted_value(),
    }),
  ];

  return {
    description: m.assignment_share_link_handoff_description(),
    itemViews,
    privacy: buildAssignmentShareLinkHandoffPrivacyContract(itemViews),
    surface,
    title: m.assignment_share_link_handoff_title(),
  };
}

export function buildAssignmentShareUrl(shareSlug: string, baseUrl?: string) {
  const origin = normalizeShareBaseUrl(baseUrl ?? '') || getRuntimeBaseUrl();
  return `${origin}${buildAssignmentSharePath(shareSlug)}`;
}

export function buildAssignmentShareLinkCopyExecutionPlan({
  baseUrl,
  disabled,
  disabledReasonCode,
  disabledMessage,
  shareSlug,
  shareUrl,
}: {
  baseUrl?: string;
  disabled?: boolean;
  disabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
  disabledMessage?: string;
  shareSlug: string;
  shareUrl?: string;
}): AssignmentShareLinkCopyExecutionPlan {
  if (disabled) {
    return {
      failureMessage: assignmentShareLinkActionCopy.failureMessage,
      message: disabledMessage ?? assignmentShareLinkActionCopy.failureMessage,
      reason: disabledReasonCode ?? 'disabled',
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
    url: shareUrl ?? buildAssignmentShareUrl(shareSlug, baseUrl),
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

function getAssignmentShareLinkDisabledReasonCode({
  lifecycleStatus,
  shareSlug,
}: {
  lifecycleStatus: AssignmentLifecycleStatus;
  shareSlug: string;
}): { disabledReasonCode?: AssignmentShareLinkDisabledReasonCode } {
  if (!shareSlug) return { disabledReasonCode: 'missing-share-slug' };
  if (lifecycleStatus === 'open') return {};

  return { disabledReasonCode: lifecycleStatus };
}

function buildAssignmentShareLinkHandoffPrivacyContract(
  itemViews: AssignmentShareLinkHandoffItemView[]
): AssignmentShareLinkHandoffPrivacyContract {
  return {
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesClipboardPrivateData: false,
    exposesInternalAssignmentIds: false,
    exposesInternalBaseUrlConfig: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    exposesTeacherNotes: false,
    itemIds: itemViews.map((item) => item.id),
    scope: 'assignment-share-link-distribution',
    shareUrlIsPublicDeliveryLink: true,
  };
}

function buildAssignmentShareLinkHandoffItem({
  id,
  statusLabel,
  value,
}: {
  id: AssignmentShareLinkHandoffItemId;
  statusLabel?: string;
  value: string;
}): AssignmentShareLinkHandoffItemView {
  const copy = getAssignmentShareLinkHandoffItemCopy(id);

  return {
    ariaLabel: m.assignment_share_link_handoff_item_aria({
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

function getAssignmentShareLinkHandoffItemCopy(
  id: AssignmentShareLinkHandoffItemId
) {
  switch (id) {
    case 'route-target':
      return {
        description: m.assignment_share_link_handoff_route_target_description(),
        label: m.assignment_share_link_handoff_route_target_label(),
      };
    case 'normalized-share-slug':
      return {
        description:
          m.assignment_share_link_handoff_normalized_slug_description(),
        label: m.assignment_share_link_handoff_normalized_slug_label(),
      };
    case 'normalized-slug-component':
      return {
        description:
          m.assignment_share_link_handoff_normalized_component_description(),
        label: m.assignment_share_link_handoff_normalized_component_label(),
      };
    case 'encoded-share-path':
      return {
        description: m.assignment_share_link_handoff_encoded_path_description(),
        label: m.assignment_share_link_handoff_encoded_path_label(),
      };
    case 'encoded-route-param':
      return {
        description:
          m.assignment_share_link_handoff_encoded_route_param_description(),
        label: m.assignment_share_link_handoff_encoded_route_param_label(),
      };
    case 'absolute-share-url':
      return {
        description: m.assignment_share_link_handoff_absolute_url_description(),
        label: m.assignment_share_link_handoff_absolute_url_label(),
      };
    case 'base-url-origin':
      return {
        description: m.assignment_share_link_handoff_base_origin_description(),
        label: m.assignment_share_link_handoff_base_origin_label(),
      };
    case 'route-param':
      return {
        description: m.assignment_share_link_handoff_route_param_description(),
        label: m.assignment_share_link_handoff_route_param_label(),
      };
    case 'preview-route-params':
      return {
        description:
          m.assignment_share_link_handoff_preview_route_params_description(),
        label: m.assignment_share_link_handoff_preview_route_params_label(),
      };
    case 'path-label':
      return {
        description: m.assignment_share_link_handoff_path_label_description(),
        label: m.assignment_share_link_handoff_path_label_label(),
      };
    case 'url-label':
      return {
        description: m.assignment_share_link_handoff_url_label_description(),
        label: m.assignment_share_link_handoff_url_label_label(),
      };
    case 'public-delivery-contract':
      return {
        description:
          m.assignment_share_link_handoff_public_delivery_contract_description(),
        label: m.assignment_share_link_handoff_public_delivery_contract_label(),
      };
    case 'availability':
      return {
        description: m.assignment_share_link_handoff_availability_description(),
        label: m.assignment_share_link_handoff_availability_label(),
      };
    case 'lifecycle-guard':
      return {
        description:
          m.assignment_share_link_handoff_lifecycle_guard_description(),
        label: m.assignment_share_link_handoff_lifecycle_guard_label(),
      };
    case 'disabled-reason':
      return {
        description:
          m.assignment_share_link_handoff_disabled_reason_description(),
        label: m.assignment_share_link_handoff_disabled_reason_label(),
      };
    case 'copy-disabled-gate':
      return {
        description:
          m.assignment_share_link_handoff_copy_disabled_gate_description(),
        label: m.assignment_share_link_handoff_copy_disabled_gate_label(),
      };
    case 'copy-action':
      return {
        description: m.assignment_share_link_handoff_copy_action_description(),
        label: m.assignment_share_link_handoff_copy_action_label(),
      };
    case 'clipboard-payload':
      return {
        description:
          m.assignment_share_link_handoff_clipboard_payload_description(),
        label: m.assignment_share_link_handoff_clipboard_payload_label(),
      };
    case 'copy-execution-plan':
      return {
        description:
          m.assignment_share_link_handoff_copy_execution_plan_description(),
        label: m.assignment_share_link_handoff_copy_execution_plan_label(),
      };
    case 'copy-feedback':
      return {
        description:
          m.assignment_share_link_handoff_copy_feedback_description(),
        label: m.assignment_share_link_handoff_copy_feedback_label(),
      };
    case 'preview-disabled-gate':
      return {
        description:
          m.assignment_share_link_handoff_preview_disabled_gate_description(),
        label: m.assignment_share_link_handoff_preview_disabled_gate_label(),
      };
    case 'preview-action':
      return {
        description:
          m.assignment_share_link_handoff_preview_action_description(),
        label: m.assignment_share_link_handoff_preview_action_label(),
      };
    case 'student-runner-target':
      return {
        description:
          m.assignment_share_link_handoff_student_runner_target_description(),
        label: m.assignment_share_link_handoff_student_runner_target_label(),
      };
    case 'path-encoding-guard':
      return {
        description:
          m.assignment_share_link_handoff_path_encoding_guard_description(),
        label: m.assignment_share_link_handoff_path_encoding_guard_label(),
      };
    case 'publish-success-surface':
      return {
        description:
          m.assignment_share_link_handoff_publish_surface_description(),
        label: m.assignment_share_link_handoff_publish_surface_label(),
      };
    case 'assignment-list-surface':
      return {
        description: m.assignment_share_link_handoff_list_surface_description(),
        label: m.assignment_share_link_handoff_list_surface_label(),
      };
    case 'result-page-surface':
      return {
        description:
          m.assignment_share_link_handoff_result_surface_description(),
        label: m.assignment_share_link_handoff_result_surface_label(),
      };
    case 'surface-consistency':
      return {
        description:
          m.assignment_share_link_handoff_surface_consistency_description(),
        label: m.assignment_share_link_handoff_surface_consistency_label(),
      };
    case 'missing-slug-guard':
      return {
        description:
          m.assignment_share_link_handoff_missing_slug_guard_description(),
        label: m.assignment_share_link_handoff_missing_slug_guard_label(),
      };
    case 'privacy-guard':
      return {
        description:
          m.assignment_share_link_handoff_privacy_guard_description(),
        label: m.assignment_share_link_handoff_privacy_guard_label(),
      };
  }
}

function formatAssignmentShareLinkHandoffSurfaceValue(
  surface: AssignmentShareLinkHandoffSurface,
  target: Exclude<AssignmentShareLinkHandoffSurface, 'shared'>
) {
  return surface === target
    ? m.assignment_share_link_handoff_active_value()
    : m.assignment_share_link_handoff_compatible_value();
}

function formatAssignmentShareLinkDisabledReasonCode(
  reasonCode?: AssignmentShareLinkDisabledReasonCode
) {
  if (!reasonCode) return '';

  if (reasonCode === 'missing-share-slug') {
    return m.assignment_share_link_handoff_missing_slug_value();
  }

  if (reasonCode === 'closed') {
    return m.assignment_share_link_handoff_closed_value();
  }

  if (reasonCode === 'draft') {
    return m.assignment_share_link_handoff_draft_value();
  }

  return m.assignment_share_link_handoff_expired_value();
}

function getAssignmentShareLinkUrlOrigin(shareUrl: string) {
  try {
    return new URL(shareUrl).origin;
  } catch {
    return m.assignment_share_link_handoff_missing_value();
  }
}

function getAssignmentShareLinkEncodedRouteParam(sharePath: string) {
  if (!sharePath.startsWith('/play/')) return '';

  return sharePath.slice('/play/'.length);
}

function formatAssignmentShareLinkCopyExecutionPlanValue(
  plan: AssignmentShareLinkCopyExecutionPlan
) {
  if (plan.type === 'copy-link') {
    return m.assignment_share_link_handoff_copy_plan_copy_link_value();
  }

  return m.assignment_share_link_handoff_copy_plan_blocked_value();
}

function formatAssignmentShareLinkPathEncodingGuard(
  actionView: AssignmentShareLinkActionView
) {
  return actionView.sharePath === buildAssignmentSharePath(actionView.shareSlug)
    ? m.assignment_share_link_handoff_passed_value()
    : m.assignment_share_link_handoff_blocked_value();
}
