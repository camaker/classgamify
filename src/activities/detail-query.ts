import { activity } from '@/db/app.schema';
import { and, eq } from 'drizzle-orm';

export function buildActivityDetailOwnerWhere({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) {
  return and(eq(activity.id, activityId), eq(activity.ownerId, userId));
}
