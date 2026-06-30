import type {
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export function getArchivedActivityDerivationError() {
  return m.activity_lifecycle_derivation_blocked();
}

export type ActivityDerivativeAction = 'duplicate' | 'publish' | 'remix';
export type ActivityLifecycleAction =
  | ActivityDerivativeAction
  | 'archive'
  | 'restore';

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
