import { activity } from '@/db/app.schema';
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

export function buildActivityDetailOwnerWhere({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) {
  return and(eq(activity.id, activityId), eq(activity.ownerId, userId));
}
