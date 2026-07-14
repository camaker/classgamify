import { activity } from '@/db/app.schema';
import type { ActivityVisibility } from '@/activities/types';
import { and, eq } from 'drizzle-orm';

export function buildActivityDetailSelect() {
  return {
    contentJson: activity.contentJson,
    createdAt: activity.createdAt,
    description: activity.description,
    id: activity.id,
    ownerId: activity.ownerId,
    templateType: activity.templateType,
    title: activity.title,
    updatedAt: activity.updatedAt,
    visibility: activity.visibility,
  };
}

export function buildActivityAssignmentSourceSelect() {
  return {
    contentJson: activity.contentJson,
    description: activity.description,
    id: activity.id,
    templateType: activity.templateType,
    title: activity.title,
    visibility: activity.visibility,
  };
}

export function buildActivityLifecycleGateSelect() {
  return {
    id: activity.id,
    updatedAt: activity.updatedAt,
    visibility: activity.visibility,
  };
}

export function buildActivityDetailOwnerWhere({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) {
  return and(eq(activity.id, activityId), eq(activity.ownerId, userId));
}

export function buildActivityMutationWhere({
  activityId,
  currentUpdatedAt,
  currentVisibility,
  userId,
}: {
  activityId: string;
  currentUpdatedAt: Date;
  currentVisibility: ActivityVisibility;
  userId: string;
}) {
  return and(
    buildActivityDetailOwnerWhere({ activityId, userId }),
    eq(activity.visibility, currentVisibility),
    eq(activity.updatedAt, currentUpdatedAt)
  );
}
