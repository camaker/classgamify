import type {
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_RESTORED_VISIBILITY = 'draft' as const;

export const ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS = [
  'source-status',
  'lifecycle-surface',
  'owner-scope',
  'persisted-source',
  'default-library-scope',
  'archived-library-scope',
  'active-library-visibility',
  'archived-library-visibility',
  'edit-action',
  'publish-action',
  'duplicate-action',
  'remix-action',
  'archive-action',
  'restore-action',
  'derivative-gate',
  'restore-before-derive',
  'archive-transition',
  'restore-transition',
  'restored-visibility',
  'content-retention',
  'source-material-retention',
  'assignment-snapshot-protection',
  'public-assignment-continuity',
  'status-filter-alignment',
  'server-archive-guard',
  'server-restore-guard',
  'server-derivative-guard',
  'execution-plan',
  'teacher-next-step',
  'privacy-guard',
] as const;

export function getArchivedActivityDerivationError() {
  return m.activity_lifecycle_derivation_blocked();
}

export type ActivityDerivativeAction = 'duplicate' | 'publish' | 'remix';
export type ActivityLifecycleAction =
  | ActivityDerivativeAction
  | 'archive'
  | 'restore';
export type ActivityLifecycleHandoffItemId =
  (typeof ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS)[number];
export type ActivityLifecycleHandoffSurface =
  | 'active-library'
  | 'archived-library'
  | 'library-card'
  | 'server-function'
  | 'shared';

export type ActivityLifecycleActionCopy = {
  failureMessage: string;
  successMessage: string;
};

export type ActivityDerivativeBlockedReason =
  | 'activity-archived'
  | 'same-template';

export type ActivityDerivativeActionGate =
  | {
      type: 'ready';
    }
  | {
      action: ActivityDerivativeAction;
      message: string;
      reason: Extract<ActivityDerivativeBlockedReason, 'activity-archived'>;
      type: 'blocked';
    };

export type ActivityLifecycleActionView = ActivityLifecycleActionCopy & {
  gate: ActivityDerivativeActionGate;
};

export type ActivityLifecycleHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityLifecycleHandoffItemId;
  label: string;
  value: string;
};

export type ActivityLifecycleHandoffPrivacyContract = {
  exposesActivityContentText: false;
  exposesAssignmentSnapshotContent: false;
  exposesInternalActivityIds: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityLifecycleHandoffItemId[];
  mutatesAssignmentSnapshots: false;
  scope: 'owner-activity-lifecycle';
};

export type ActivityLifecycleHandoffView = {
  description: string;
  itemViews: ActivityLifecycleHandoffItemView[];
  privacy: ActivityLifecycleHandoffPrivacyContract;
  surface: ActivityLifecycleHandoffSurface;
  title: string;
};

export type ActivityLifecycleHandoffSource = {
  persisted?: boolean;
  surface?: ActivityLifecycleHandoffSurface;
  visibility: ActivityVisibility;
};

type ActivityDerivativeBlockedExecutionPlan = {
  failureMessage: string;
  message: string;
  reason: ActivityDerivativeBlockedReason;
  type: 'blocked';
};

type ActivityDuplicateExecutionPlan = {
  action: 'duplicate';
  failureMessage: string;
  input: {
    activityId: string;
  };
  successMessage: string;
  type: 'duplicate';
};

type ActivityRemixExecutionPlan = {
  action: 'remix';
  failureMessage: string;
  input: {
    activityId: string;
    targetTemplateType: ActivityTemplateType;
  };
  successMessage: string;
  type: 'remix';
};

export type ActivityDerivativeActionExecutionPlan =
  | ActivityDerivativeBlockedExecutionPlan
  | ActivityDuplicateExecutionPlan
  | ActivityRemixExecutionPlan;

type ActivityDerivativeActionExecutionPlanInput =
  | {
      action: 'duplicate';
      activityId: string;
      visibility: ActivityVisibility;
    }
  | {
      action: 'remix';
      activityId: string;
      currentTemplateType: ActivityTemplateType;
      targetTemplateType: ActivityTemplateType;
      visibility: ActivityVisibility;
    };

type ActivityVisibilityAction = Extract<
  ActivityLifecycleAction,
  'archive' | 'restore'
>;

export type ActivityVisibilityBlockedReason =
  | 'already-archived'
  | 'not-archived';

type ActivityVisibilityBlockedExecutionPlan = {
  failureMessage: string;
  message: string;
  reason: ActivityVisibilityBlockedReason;
  type: 'blocked';
};

type ActivityVisibilityBlockedView = {
  message: string;
  reason: ActivityVisibilityBlockedReason;
};

type ActivityVisibilityUpdateExecutionPlan = {
  action: ActivityVisibilityAction;
  failureMessage: string;
  input: {
    activityId: string;
  };
  successMessage: string;
  type: 'update-visibility';
};

export type ActivityVisibilityActionExecutionPlan =
  | ActivityVisibilityBlockedExecutionPlan
  | ActivityVisibilityUpdateExecutionPlan;

export const activityEditPageCopy = {
  get backToLibraryLabel() {
    return m.activity_edit_page_back_to_library();
  },
  get breadcrumbActivities() {
    return m.activity_library_breadcrumb_current();
  },
  get breadcrumbDashboard() {
    return m.activity_library_breadcrumb_dashboard();
  },
  get fallbackDescription() {
    return m.activity_edit_access_ready_description();
  },
  get fallbackTitle() {
    return m.activity_edit_access_ready_action();
  },
  get loadErrorMessage() {
    return m.activity_edit_page_load_error();
  },
} as const;

const activityEditAccessCopy = {
  archived: {
    get actionLabel() {
      return m.activity_edit_access_archived_action();
    },
    get description() {
      return m.activity_edit_access_archived_description();
    },
    get title() {
      return m.activity_edit_access_archived_title();
    },
  },
  ready: {
    get actionLabel() {
      return m.activity_edit_access_ready_action();
    },
    get description() {
      return m.activity_edit_access_ready_description();
    },
    get title() {
      return m.activity_edit_access_ready_title();
    },
  },
} as const;

export type ActivityEditAccessView = {
  actionLabel: string;
  canEdit: boolean;
  description: string;
  title: string;
};

export function isActivityArchived(visibility: ActivityVisibility) {
  return visibility === 'archived';
}

export function canDeriveActivityWork(visibility: ActivityVisibility) {
  return !isActivityArchived(visibility);
}

export function canEditActivity(visibility: ActivityVisibility) {
  return !isActivityArchived(visibility);
}

export function canArchiveActivity(visibility: ActivityVisibility) {
  return !isActivityArchived(visibility);
}

export function canRestoreActivity(visibility: ActivityVisibility) {
  return isActivityArchived(visibility);
}

export function getSameTemplateRemixError() {
  return m.activity_api_error_remix_same_template();
}

export function buildActivityDerivativeActionGate({
  action,
  visibility,
}: {
  action: ActivityDerivativeAction;
  visibility: ActivityVisibility;
}): ActivityDerivativeActionGate {
  if (canDeriveActivityWork(visibility)) {
    return { type: 'ready' };
  }

  return {
    action,
    message: getArchivedActivityDerivationError(),
    reason: 'activity-archived',
    type: 'blocked',
  };
}

export function getActivityLifecycleActionCopy(
  action: ActivityLifecycleAction
): ActivityLifecycleActionCopy {
  if (action === 'publish') {
    return {
      failureMessage: m.activity_lifecycle_publish_failure(),
      successMessage: m.activity_lifecycle_publish_success(),
    };
  }

  if (action === 'remix') {
    return {
      failureMessage: m.activity_lifecycle_remix_failure(),
      successMessage: m.activity_lifecycle_remix_success(),
    };
  }

  if (action === 'duplicate') {
    return {
      failureMessage: m.activity_lifecycle_duplicate_failure(),
      successMessage: m.activity_lifecycle_duplicate_success(),
    };
  }

  if (action === 'archive') {
    return {
      failureMessage: m.activity_lifecycle_archive_failure(),
      successMessage: m.activity_lifecycle_archive_success(),
    };
  }

  return {
    failureMessage: m.activity_lifecycle_restore_failure(),
    successMessage: m.activity_lifecycle_restore_success(),
  };
}

export function buildActivityLifecycleActionView({
  action,
  visibility,
}: {
  action: ActivityDerivativeAction;
  visibility: ActivityVisibility;
}): ActivityLifecycleActionView {
  return {
    ...getActivityLifecycleActionCopy(action),
    gate: buildActivityDerivativeActionGate({
      action,
      visibility,
    }),
  };
}

export function buildActivityLifecycleHandoffView({
  persisted = true,
  surface = 'shared',
  visibility,
}: ActivityLifecycleHandoffSource): ActivityLifecycleHandoffView {
  const context = buildActivityLifecycleHandoffContext({
    persisted,
    surface,
    visibility,
  });
  const itemViews = ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityLifecycleHandoffItemView({ context, id })
  );

  return {
    description: m.activity_lifecycle_handoff_description(),
    itemViews,
    privacy: buildActivityLifecycleHandoffPrivacyContract(itemViews),
    surface,
    title: m.activity_lifecycle_handoff_title(),
  };
}

export function buildActivityDerivativeActionExecutionPlan(
  input: ActivityDerivativeActionExecutionPlanInput
): ActivityDerivativeActionExecutionPlan {
  const actionView = buildActivityLifecycleActionView({
    action: input.action,
    visibility: input.visibility,
  });

  if (actionView.gate.type === 'blocked') {
    return {
      failureMessage: actionView.failureMessage,
      message: actionView.gate.message,
      reason: actionView.gate.reason,
      type: 'blocked',
    };
  }

  if (input.action === 'duplicate') {
    return {
      action: 'duplicate',
      failureMessage: actionView.failureMessage,
      input: {
        activityId: input.activityId,
      },
      successMessage: actionView.successMessage,
      type: 'duplicate',
    };
  }

  if (input.currentTemplateType === input.targetTemplateType) {
    return {
      failureMessage: actionView.failureMessage,
      message: getSameTemplateRemixError(),
      reason: 'same-template',
      type: 'blocked',
    };
  }

  return {
    action: 'remix',
    failureMessage: actionView.failureMessage,
    input: {
      activityId: input.activityId,
      targetTemplateType: input.targetTemplateType,
    },
    successMessage: actionView.successMessage,
    type: 'remix',
  };
}

export function buildActivityVisibilityActionExecutionPlan({
  action,
  activityId,
  visibility,
}: {
  action: ActivityVisibilityAction;
  activityId: string;
  visibility: ActivityVisibility;
}): ActivityVisibilityActionExecutionPlan {
  const actionCopy = getActivityLifecycleActionCopy(action);
  const blockedView =
    action === 'archive'
      ? getActivityArchiveBlockedView(visibility)
      : getActivityRestoreBlockedView(visibility);

  if (blockedView) {
    return {
      failureMessage: actionCopy.failureMessage,
      message: blockedView.message,
      reason: blockedView.reason,
      type: 'blocked',
    };
  }

  return {
    action,
    failureMessage: actionCopy.failureMessage,
    input: {
      activityId,
    },
    successMessage: actionCopy.successMessage,
    type: 'update-visibility',
  };
}

export function buildActivityEditAccessView(
  visibility: ActivityVisibility
): ActivityEditAccessView {
  if (!canEditActivity(visibility)) {
    return {
      ...activityEditAccessCopy.archived,
      canEdit: false,
    };
  }

  return {
    ...activityEditAccessCopy.ready,
    canEdit: true,
  };
}

export function assertActivityCanDeriveWork(visibility: ActivityVisibility) {
  if (!canDeriveActivityWork(visibility)) {
    throw new Error(getArchivedActivityDerivationError());
  }
}

export function assertActivityCanEdit(visibility: ActivityVisibility) {
  if (!canEditActivity(visibility)) {
    throw new Error(activityEditAccessCopy.archived.description);
  }
}

export function assertActivityCanArchive(visibility: ActivityVisibility) {
  const blockedView = getActivityArchiveBlockedView(visibility);

  if (blockedView) {
    throw new Error(blockedView.message);
  }
}

export function assertActivityCanRestore(visibility: ActivityVisibility) {
  const blockedView = getActivityRestoreBlockedView(visibility);

  if (blockedView) {
    throw new Error(blockedView.message);
  }
}

function buildActivityLifecycleHandoffContext({
  persisted,
  surface,
  visibility,
}: Required<ActivityLifecycleHandoffSource>) {
  const archived = isActivityArchived(visibility);
  const canArchive = persisted && canArchiveActivity(visibility);
  const canRestore = persisted && canRestoreActivity(visibility);
  const canEdit = persisted && canEditActivity(visibility);
  const canDerive = persisted && canDeriveActivityWork(visibility);

  return {
    activeLibraryVisibility:
      persisted && !archived
        ? m.activity_lifecycle_handoff_visible_value()
        : m.activity_lifecycle_handoff_hidden_value(),
    archiveAction: getActivityLifecycleArchiveActionValue({
      archived,
      canArchive,
      persisted,
    }),
    archived,
    archivedLibraryVisibility: archived
      ? m.activity_lifecycle_handoff_visible_value()
      : m.activity_lifecycle_handoff_hidden_value(),
    archiveTransition: canArchive
      ? m.activity_lifecycle_handoff_archive_transition_value()
      : m.activity_lifecycle_handoff_blocked_value(),
    derivativeGate: canDerive
      ? m.activity_lifecycle_handoff_derivative_allowed_value()
      : getActivityLifecycleUnavailableValue({ persisted }),
    duplicateAction: getActivityLifecycleDerivativeActionValue({
      canDerive,
      persisted,
    }),
    editAction: getActivityLifecycleEditActionValue({
      canEdit,
      persisted,
    }),
    executionPlan: getActivityLifecycleExecutionPlanValue({
      canArchive,
      canDerive,
      canRestore,
      persisted,
    }),
    persisted,
    persistedSource: persisted
      ? m.activity_lifecycle_handoff_saved_source_value()
      : m.activity_lifecycle_handoff_preview_source_value(),
    publishAction: getActivityLifecycleDerivativeActionValue({
      canDerive,
      persisted,
    }),
    remixAction: getActivityLifecycleDerivativeActionValue({
      canDerive,
      persisted,
    }),
    restoreAction: getActivityLifecycleRestoreActionValue({
      canRestore,
      persisted,
    }),
    restoreBeforeDerive: archived
      ? m.activity_lifecycle_handoff_restore_first_value()
      : m.activity_lifecycle_handoff_not_required_value(),
    restoreTransition: canRestore
      ? m.activity_lifecycle_handoff_restore_transition_value()
      : m.activity_lifecycle_handoff_blocked_value(),
    statusFilterAlignment: archived
      ? m.activity_lifecycle_handoff_archived_filter_value()
      : m.activity_lifecycle_handoff_active_filter_value(),
    statusLabel: getActivityLifecycleStatusLabel({ persisted, visibility }),
    surfaceLabel: getActivityLifecycleSurfaceLabel(surface),
    teacherNextStep: getActivityLifecycleTeacherNextStepValue({
      canRestore,
      persisted,
    }),
  };
}

type ActivityLifecycleHandoffContext = ReturnType<
  typeof buildActivityLifecycleHandoffContext
>;

function buildActivityLifecycleHandoffItemView({
  context,
  id,
}: {
  context: ActivityLifecycleHandoffContext;
  id: ActivityLifecycleHandoffItemId;
}): ActivityLifecycleHandoffItemView {
  const label = getActivityLifecycleHandoffItemLabel(id);
  const description = getActivityLifecycleHandoffItemDescription(id);
  const value = getActivityLifecycleHandoffItemValue({ context, id });

  return {
    ariaLabel: m.activity_lifecycle_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildActivityLifecycleHandoffPrivacyContract(
  itemViews: ActivityLifecycleHandoffItemView[]
): ActivityLifecycleHandoffPrivacyContract {
  return {
    exposesActivityContentText: false,
    exposesAssignmentSnapshotContent: false,
    exposesInternalActivityIds: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesAssignmentSnapshots: false,
    scope: 'owner-activity-lifecycle',
  };
}

function getActivityLifecycleHandoffItemValue({
  context,
  id,
}: {
  context: ActivityLifecycleHandoffContext;
  id: ActivityLifecycleHandoffItemId;
}) {
  switch (id) {
    case 'source-status':
      return context.statusLabel;
    case 'lifecycle-surface':
      return context.surfaceLabel;
    case 'owner-scope':
      return m.activity_lifecycle_handoff_owner_scope_value();
    case 'persisted-source':
      return context.persistedSource;
    case 'default-library-scope':
      return m.activity_lifecycle_handoff_default_library_scope_value();
    case 'archived-library-scope':
      return m.activity_lifecycle_handoff_archived_library_scope_value();
    case 'active-library-visibility':
      return context.activeLibraryVisibility;
    case 'archived-library-visibility':
      return context.archivedLibraryVisibility;
    case 'edit-action':
      return context.editAction;
    case 'publish-action':
      return context.publishAction;
    case 'duplicate-action':
      return context.duplicateAction;
    case 'remix-action':
      return context.remixAction;
    case 'archive-action':
      return context.archiveAction;
    case 'restore-action':
      return context.restoreAction;
    case 'derivative-gate':
      return context.derivativeGate;
    case 'restore-before-derive':
      return context.restoreBeforeDerive;
    case 'archive-transition':
      return context.archiveTransition;
    case 'restore-transition':
      return context.restoreTransition;
    case 'restored-visibility':
      return m.activity_lifecycle_handoff_restored_visibility_value();
    case 'content-retention':
      return m.activity_lifecycle_handoff_content_retention_value();
    case 'source-material-retention':
      return m.activity_lifecycle_handoff_source_material_retention_value();
    case 'assignment-snapshot-protection':
      return m.activity_lifecycle_handoff_snapshot_protection_value();
    case 'public-assignment-continuity':
      return m.activity_lifecycle_handoff_assignment_continuity_value();
    case 'status-filter-alignment':
      return context.statusFilterAlignment;
    case 'server-archive-guard':
    case 'server-restore-guard':
    case 'server-derivative-guard':
      return m.activity_lifecycle_handoff_server_guard_value();
    case 'execution-plan':
      return context.executionPlan;
    case 'teacher-next-step':
      return context.teacherNextStep;
    case 'privacy-guard':
      return m.activity_lifecycle_handoff_privacy_guard_value();
  }
}

function getActivityLifecycleHandoffItemLabel(
  id: ActivityLifecycleHandoffItemId
) {
  switch (id) {
    case 'source-status':
      return m.activity_lifecycle_handoff_source_status_label();
    case 'lifecycle-surface':
      return m.activity_lifecycle_handoff_surface_label();
    case 'owner-scope':
      return m.activity_lifecycle_handoff_owner_scope_label();
    case 'persisted-source':
      return m.activity_lifecycle_handoff_persisted_source_label();
    case 'default-library-scope':
      return m.activity_lifecycle_handoff_default_library_scope_label();
    case 'archived-library-scope':
      return m.activity_lifecycle_handoff_archived_library_scope_label();
    case 'active-library-visibility':
      return m.activity_lifecycle_handoff_active_visibility_label();
    case 'archived-library-visibility':
      return m.activity_lifecycle_handoff_archived_visibility_label();
    case 'edit-action':
      return m.activity_lifecycle_handoff_edit_action_label();
    case 'publish-action':
      return m.activity_lifecycle_handoff_publish_action_label();
    case 'duplicate-action':
      return m.activity_lifecycle_handoff_duplicate_action_label();
    case 'remix-action':
      return m.activity_lifecycle_handoff_remix_action_label();
    case 'archive-action':
      return m.activity_lifecycle_handoff_archive_action_label();
    case 'restore-action':
      return m.activity_lifecycle_handoff_restore_action_label();
    case 'derivative-gate':
      return m.activity_lifecycle_handoff_derivative_gate_label();
    case 'restore-before-derive':
      return m.activity_lifecycle_handoff_restore_before_derive_label();
    case 'archive-transition':
      return m.activity_lifecycle_handoff_archive_transition_label();
    case 'restore-transition':
      return m.activity_lifecycle_handoff_restore_transition_label();
    case 'restored-visibility':
      return m.activity_lifecycle_handoff_restored_visibility_label();
    case 'content-retention':
      return m.activity_lifecycle_handoff_content_retention_label();
    case 'source-material-retention':
      return m.activity_lifecycle_handoff_source_material_retention_label();
    case 'assignment-snapshot-protection':
      return m.activity_lifecycle_handoff_snapshot_protection_label();
    case 'public-assignment-continuity':
      return m.activity_lifecycle_handoff_assignment_continuity_label();
    case 'status-filter-alignment':
      return m.activity_lifecycle_handoff_status_filter_label();
    case 'server-archive-guard':
      return m.activity_lifecycle_handoff_server_archive_guard_label();
    case 'server-restore-guard':
      return m.activity_lifecycle_handoff_server_restore_guard_label();
    case 'server-derivative-guard':
      return m.activity_lifecycle_handoff_server_derivative_guard_label();
    case 'execution-plan':
      return m.activity_lifecycle_handoff_execution_plan_label();
    case 'teacher-next-step':
      return m.activity_lifecycle_handoff_teacher_next_step_label();
    case 'privacy-guard':
      return m.activity_lifecycle_handoff_privacy_guard_label();
  }
}

function getActivityLifecycleHandoffItemDescription(
  id: ActivityLifecycleHandoffItemId
) {
  switch (id) {
    case 'source-status':
      return m.activity_lifecycle_handoff_source_status_description();
    case 'lifecycle-surface':
      return m.activity_lifecycle_handoff_surface_description();
    case 'owner-scope':
      return m.activity_lifecycle_handoff_owner_scope_description();
    case 'persisted-source':
      return m.activity_lifecycle_handoff_persisted_source_description();
    case 'default-library-scope':
      return m.activity_lifecycle_handoff_default_library_scope_description();
    case 'archived-library-scope':
      return m.activity_lifecycle_handoff_archived_library_scope_description();
    case 'active-library-visibility':
      return m.activity_lifecycle_handoff_active_visibility_description();
    case 'archived-library-visibility':
      return m.activity_lifecycle_handoff_archived_visibility_description();
    case 'edit-action':
      return m.activity_lifecycle_handoff_edit_action_description();
    case 'publish-action':
      return m.activity_lifecycle_handoff_publish_action_description();
    case 'duplicate-action':
      return m.activity_lifecycle_handoff_duplicate_action_description();
    case 'remix-action':
      return m.activity_lifecycle_handoff_remix_action_description();
    case 'archive-action':
      return m.activity_lifecycle_handoff_archive_action_description();
    case 'restore-action':
      return m.activity_lifecycle_handoff_restore_action_description();
    case 'derivative-gate':
      return m.activity_lifecycle_handoff_derivative_gate_description();
    case 'restore-before-derive':
      return m.activity_lifecycle_handoff_restore_before_derive_description();
    case 'archive-transition':
      return m.activity_lifecycle_handoff_archive_transition_description();
    case 'restore-transition':
      return m.activity_lifecycle_handoff_restore_transition_description();
    case 'restored-visibility':
      return m.activity_lifecycle_handoff_restored_visibility_description();
    case 'content-retention':
      return m.activity_lifecycle_handoff_content_retention_description();
    case 'source-material-retention':
      return m.activity_lifecycle_handoff_source_material_retention_description();
    case 'assignment-snapshot-protection':
      return m.activity_lifecycle_handoff_snapshot_protection_description();
    case 'public-assignment-continuity':
      return m.activity_lifecycle_handoff_assignment_continuity_description();
    case 'status-filter-alignment':
      return m.activity_lifecycle_handoff_status_filter_description();
    case 'server-archive-guard':
      return m.activity_lifecycle_handoff_server_archive_guard_description();
    case 'server-restore-guard':
      return m.activity_lifecycle_handoff_server_restore_guard_description();
    case 'server-derivative-guard':
      return m.activity_lifecycle_handoff_server_derivative_guard_description();
    case 'execution-plan':
      return m.activity_lifecycle_handoff_execution_plan_description();
    case 'teacher-next-step':
      return m.activity_lifecycle_handoff_teacher_next_step_description();
    case 'privacy-guard':
      return m.activity_lifecycle_handoff_privacy_guard_description();
  }
}

function getActivityLifecycleStatusLabel({
  persisted,
  visibility,
}: {
  persisted: boolean;
  visibility: ActivityVisibility;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_status_preview_value();

  switch (visibility) {
    case 'archived':
      return m.activity_lifecycle_handoff_status_archived_value();
    case 'draft':
      return m.activity_form_visibility_draft();
    case 'private':
      return m.activity_form_visibility_private();
    case 'public':
      return m.activity_form_visibility_public();
    case 'unlisted':
      return m.activity_form_visibility_unlisted();
  }
}

function getActivityLifecycleSurfaceLabel(
  surface: ActivityLifecycleHandoffSurface
) {
  switch (surface) {
    case 'active-library':
      return m.activity_lifecycle_handoff_surface_active_library_value();
    case 'archived-library':
      return m.activity_lifecycle_handoff_surface_archived_library_value();
    case 'library-card':
      return m.activity_lifecycle_handoff_surface_library_card_value();
    case 'server-function':
      return m.activity_lifecycle_handoff_surface_server_function_value();
    case 'shared':
      return m.activity_lifecycle_handoff_surface_shared_value();
  }
}

function getActivityLifecycleDerivativeActionValue({
  canDerive,
  persisted,
}: {
  canDerive: boolean;
  persisted: boolean;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_preview_only_value();

  return canDerive
    ? m.activity_lifecycle_handoff_ready_value()
    : m.activity_lifecycle_handoff_restore_required_value();
}

function getActivityLifecycleArchiveActionValue({
  archived,
  canArchive,
  persisted,
}: {
  archived: boolean;
  canArchive: boolean;
  persisted: boolean;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_preview_only_value();
  if (canArchive) return m.activity_lifecycle_handoff_ready_value();

  return archived
    ? m.activity_lifecycle_handoff_already_archived_value()
    : m.activity_lifecycle_handoff_blocked_value();
}

function getActivityLifecycleRestoreActionValue({
  canRestore,
  persisted,
}: {
  canRestore: boolean;
  persisted: boolean;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_preview_only_value();

  return canRestore
    ? m.activity_lifecycle_handoff_ready_value()
    : m.activity_lifecycle_handoff_not_available_value();
}

function getActivityLifecycleEditActionValue({
  canEdit,
  persisted,
}: {
  canEdit: boolean;
  persisted: boolean;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_preview_only_value();

  return canEdit
    ? m.activity_lifecycle_handoff_ready_value()
    : m.activity_lifecycle_handoff_restore_required_value();
}

function getActivityLifecycleUnavailableValue({
  persisted,
}: {
  persisted: boolean;
}) {
  return persisted
    ? m.activity_lifecycle_handoff_restore_required_value()
    : m.activity_lifecycle_handoff_preview_only_value();
}

function getActivityLifecycleExecutionPlanValue({
  canArchive,
  canDerive,
  canRestore,
  persisted,
}: {
  canArchive: boolean;
  canDerive: boolean;
  canRestore: boolean;
  persisted: boolean;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_execution_blocked_value();
  if (canRestore) return m.activity_lifecycle_handoff_execution_restore_value();
  if (canArchive && canDerive) {
    return m.activity_lifecycle_handoff_execution_active_value();
  }

  return m.activity_lifecycle_handoff_execution_blocked_value();
}

function getActivityLifecycleTeacherNextStepValue({
  canRestore,
  persisted,
}: {
  canRestore: boolean;
  persisted: boolean;
}) {
  if (!persisted) return m.activity_lifecycle_handoff_next_step_save_value();

  return canRestore
    ? m.activity_lifecycle_handoff_next_step_restore_value()
    : m.activity_lifecycle_handoff_next_step_ready_value();
}

function getActivityArchiveBlockedView(
  visibility: ActivityVisibility
): ActivityVisibilityBlockedView | undefined {
  if (canArchiveActivity(visibility)) return undefined;

  return {
    message: m.activity_lifecycle_archive_blocked(),
    reason: 'already-archived',
  };
}

function getActivityRestoreBlockedView(
  visibility: ActivityVisibility
): ActivityVisibilityBlockedView | undefined {
  if (canRestoreActivity(visibility)) return undefined;

  return {
    message: m.activity_lifecycle_restore_blocked(),
    reason: 'not-archived',
  };
}
