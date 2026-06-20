import type { ActivityVisibility } from '@/activities/types';

export const ARCHIVED_ACTIVITY_DERIVATION_ERROR =
  'Restore this activity before publishing, duplicating, or remixing it.';

export function isActivityArchived(visibility: ActivityVisibility) {
  return visibility === 'archived';
}

export function canDeriveActivityWork(visibility: ActivityVisibility) {
  return !isActivityArchived(visibility);
}

export function assertActivityCanDeriveWork(visibility: ActivityVisibility) {
  if (!canDeriveActivityWork(visibility)) {
    throw new Error(ARCHIVED_ACTIVITY_DERIVATION_ERROR);
  }
}
