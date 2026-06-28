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

type ActivityLifecycleActionCopy = {
  failureMessage: string;
  successMessage: string;
};

type ActivityDerivativeActionGate =
  | {
      type: 'ready';
    }
  | {
      action: ActivityDerivativeAction;
      message: string;
      type: 'blocked';
    };

type ActivityLifecycleActionView = ActivityLifecycleActionCopy & {
  gate: ActivityDerivativeActionGate;
};

type ActivityDerivativeBlockedExecutionPlan = {
  failureMessage: string;
  message: string;
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
      targetTemplateType: ActivityTemplateType;
      visibility: ActivityVisibility;
    };

type ActivityVisibilityAction = Extract<
  ActivityLifecycleAction,
  'archive' | 'restore'
>;

type ActivityVisibilityBlockedExecutionPlan = {
  failureMessage: string;
  message: string;
  type: 'blocked';
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
  const message =
    action === 'archive'
      ? getActivityArchiveBlockedMessage(visibility)
      : getActivityRestoreBlockedMessage(visibility);

  if (message) {
    return {
      failureMessage: actionCopy.failureMessage,
      message,
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

export function buildActivityEditAccessView(visibility: ActivityVisibility) {
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
  const message = getActivityArchiveBlockedMessage(visibility);

  if (message) {
    throw new Error(message);
  }
}

export function assertActivityCanRestore(visibility: ActivityVisibility) {
  const message = getActivityRestoreBlockedMessage(visibility);

  if (message) {
    throw new Error(message);
  }
}

function getActivityArchiveBlockedMessage(visibility: ActivityVisibility) {
  return canArchiveActivity(visibility)
    ? undefined
    : m.activity_lifecycle_archive_blocked();
}

function getActivityRestoreBlockedMessage(visibility: ActivityVisibility) {
  return canRestoreActivity(visibility)
    ? undefined
    : m.activity_lifecycle_restore_blocked();
}
