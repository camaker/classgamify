import type { ActivityVisibility } from '@/activities/types';

export const ARCHIVED_ACTIVITY_DERIVATION_ERROR =
  'Restore this activity before publishing, duplicating, or remixing it.';

type ActivityDerivativeAction = 'duplicate' | 'publish' | 'remix';
export type ActivityLifecycleAction =
  | ActivityDerivativeAction
  | 'archive'
  | 'restore';

export type ActivityLifecycleActionCopy = {
  failureMessage: string;
  successMessage: string;
};

export type ActivityDerivativeActionGate =
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

const activityEditAccessCopy = {
  archived: {
    actionLabel: 'Open archived activities',
    description:
      'Restore this activity from the archived library before editing its structured content.',
    title: 'Activity is archived.',
  },
  ready: {
    actionLabel: 'Edit activity',
    description:
      'Update reusable activity content before publishing or reusing it across templates.',
    title: 'Edit reusable activity',
  },
} as const;

export function isActivityArchived(visibility: ActivityVisibility) {
  return visibility === 'archived';
}

export function canDeriveActivityWork(visibility: ActivityVisibility) {
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
    message: ARCHIVED_ACTIVITY_DERIVATION_ERROR,
    type: 'blocked',
  };
}

export function getActivityLifecycleActionCopy(
  action: ActivityLifecycleAction
): ActivityLifecycleActionCopy {
  if (action === 'publish') {
    return {
      failureMessage: 'Assignment could not be published.',
      successMessage: 'Assignment link published.',
    };
  }

  if (action === 'remix') {
    return {
      failureMessage: 'Activity could not be remixed.',
      successMessage: 'Template remix created.',
    };
  }

  if (action === 'duplicate') {
    return {
      failureMessage: 'Activity could not be duplicated.',
      successMessage: 'Activity duplicated.',
    };
  }

  if (action === 'archive') {
    return {
      failureMessage: 'Activity could not be archived.',
      successMessage: 'Activity archived.',
    };
  }

  return {
    failureMessage: 'Activity could not be restored.',
    successMessage: 'Activity restored to drafts.',
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
  if (isActivityArchived(visibility)) {
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
    throw new Error(ARCHIVED_ACTIVITY_DERIVATION_ERROR);
  }
}
