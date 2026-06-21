import type { AssignmentStatus } from '@/activities/types';

export type AssignmentStatusFilter = 'all' | AssignmentStatus;

export type AssignmentListSearchState = {
  page?: number;
  published?: string;
  q?: string;
  status?: AssignmentStatusFilter;
};

export type AssignmentListRouteSearch = {
  page?: number;
  published?: string;
  q?: string;
  status?: AssignmentStatus;
};

export function normalizeAssignmentListSearch(value?: string | null) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

export function buildAssignmentListRouteSearch({
  page,
  published,
  q,
  status = 'all',
}: AssignmentListSearchState): AssignmentListRouteSearch {
  const normalizedSearch = normalizeAssignmentListSearch(q);
  const normalizedPage =
    page && Number.isInteger(page) && page > 1 ? page : undefined;

  return {
    page: normalizedPage,
    published,
    q: normalizedSearch,
    status: status === 'all' ? undefined : status,
  };
}

export function buildAssignmentListPageRouteSearch({
  current,
  page,
}: {
  current: Omit<AssignmentListSearchState, 'page'>;
  page: number;
}): AssignmentListRouteSearch {
  return buildAssignmentListRouteSearch({
    ...current,
    page,
  });
}

export function parseAssignmentStatusFilter(
  value: unknown
): AssignmentStatus | undefined {
  return value === 'published' || value === 'closed' || value === 'draft'
    ? value
    : undefined;
}
