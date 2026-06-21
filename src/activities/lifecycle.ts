import type { ActivityVisibility } from '@/activities/types';

export const ARCHIVED_ACTIVITY_DERIVATION_ERROR =
  'Restore this activity before publishing, duplicating, or remixing it.';

export type ActivityDerivativeAction = 'duplicate' | 'publish' | 'remix';

export type ActivityDerivativeActionGate =
  | {
      type: 'ready';
    }
  | {
      action: ActivityDerivativeAction;
      message: string;
      type: 'blocked';
    };

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

export function assertActivityCanDeriveWork(visibility: ActivityVisibility) {
  if (!canDeriveActivityWork(visibility)) {
    throw new Error(ARCHIVED_ACTIVITY_DERIVATION_ERROR);
  }
}
