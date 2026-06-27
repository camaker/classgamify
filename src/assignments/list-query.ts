import { buildAssignmentLifecycleStatusFilter } from '@/assignments/lifecycle-query';
import {
  type AssignmentLifecycleStatusFilter,
  normalizeAssignmentListSearch,
} from '@/assignments/list-filters';
import { activity, assignment, assignmentSnapshot } from '@/db/app.schema';
import { sqlLikeContains } from '@/lib/sql-like';
import { and, eq, or, type SQL } from 'drizzle-orm';

export function buildAssignmentListWhere({
  now = new Date(),
  search,
  status,
  userId,
}: {
  now?: Date;
  search?: string;
  status?: AssignmentLifecycleStatusFilter;
  userId: string;
}) {
  const normalizedSearch = normalizeAssignmentListSearch(search);
  const filters: SQL[] = [eq(assignment.ownerId, userId)];

  if (status) {
    filters.push(
      buildAssignmentLifecycleStatusFilter({
        now,
        status,
      })
    );
  }

  if (normalizedSearch) {
    filters.push(
      or(
        sqlLikeContains(assignment.title, normalizedSearch),
        sqlLikeContains(assignment.shareSlug, normalizedSearch),
        sqlLikeContains(activity.title, normalizedSearch),
        sqlLikeContains(activity.description, normalizedSearch),
        sqlLikeContains(assignmentSnapshot.activityTitle, normalizedSearch),
        sqlLikeContains(
          assignmentSnapshot.activityDescription,
          normalizedSearch
        ),
        sqlLikeContains(assignmentSnapshot.templateType, normalizedSearch),
        sqlLikeContains(activity.contentJson, normalizedSearch),
        sqlLikeContains(assignmentSnapshot.contentJson, normalizedSearch)
      ) as SQL
    );
  }

  return and(...filters);
}
