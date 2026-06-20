import type { AssignmentStatus } from '@/activities/types';

export type AssignmentStatusFilter = 'all' | AssignmentStatus;

export function normalizeAssignmentListSearch(value?: string | null) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

export function parseAssignmentStatusFilter(
  value: unknown
): AssignmentStatus | undefined {
  return value === 'published' || value === 'closed' || value === 'draft'
    ? value
    : undefined;
}
