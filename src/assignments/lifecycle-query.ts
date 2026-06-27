import { assignment } from '@/db/app.schema';
import type { AssignmentLifecycleStatusFilter } from '@/assignments/list-filters';
import { and, eq, gt, isNotNull, isNull, lte, or, type SQL } from 'drizzle-orm';

export function buildAssignmentLifecycleStatusFilter({
  now = new Date(),
  status,
}: {
  now?: Date;
  status: AssignmentLifecycleStatusFilter;
}): SQL {
  if (status === 'open') {
    return and(
      eq(assignment.status, 'published'),
      or(isNull(assignment.expiresAt), gt(assignment.expiresAt, now))
    ) as SQL;
  }

  if (status === 'expired') {
    return and(
      eq(assignment.status, 'published'),
      isNotNull(assignment.expiresAt),
      lte(assignment.expiresAt, now)
    ) as SQL;
  }

  return eq(assignment.status, status);
}
