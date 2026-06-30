import { assignment } from '@/db/app.schema';
import type { AssignmentLifecycleStatusFilter } from '@/assignments/list-filters';
import {
  type AssignmentLifecycleNow,
  normalizeAssignmentLifecycleNowDate,
} from '@/assignments/lifecycle';
import { and, eq, gt, isNotNull, isNull, lte, or, type SQL } from 'drizzle-orm';

export function buildAssignmentLifecycleStatusFilter({
  now = new Date(),
  status,
}: {
  now?: AssignmentLifecycleNow;
  status: AssignmentLifecycleStatusFilter;
}): SQL {
  const normalizedNow = normalizeAssignmentLifecycleNowDate(now);

  if (status === 'open') {
    return and(
      eq(assignment.status, 'published'),
      or(isNull(assignment.expiresAt), gt(assignment.expiresAt, normalizedNow))
    ) as SQL;
  }

  if (status === 'expired') {
    return and(
      eq(assignment.status, 'published'),
      isNotNull(assignment.expiresAt),
      lte(assignment.expiresAt, normalizedNow)
    ) as SQL;
  }

  return eq(assignment.status, status);
}
