import type { ActivityVisibility } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export function getArchivedActivityDerivationError() {
  return m.activity_lifecycle_derivation_blocked();
}

type ActivityDerivativeAction = 'duplicate' | 'publish' | 'remix';
type ActivityLifecycleAction = ActivityDerivativeAction | 'archive' | 'restore';

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
