import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import type { AssignmentLifecycleStatus } from '@/assignments/lifecycle';

export type AssignmentLifecycleStatusFilter = AssignmentLifecycleStatus;
export type AssignmentStatusFilter = 'all' | AssignmentLifecycleStatusFilter;

export const ASSIGNMENT_LIFECYCLE_STATUS_FILTERS = [
  'closed',
  'draft',
  'expired',
  'open',
] as const satisfies readonly AssignmentLifecycleStatusFilter[];

type AssignmentListSearchState = {
  page?: number;
  published?: string;
  q?: string;
  status?: AssignmentStatusFilter;
};

type AssignmentListRouteSearch = {
  page?: number;
  published?: string;
  q?: string;
  status?: AssignmentLifecycleStatusFilter;
};

export function normalizeAssignmentListSearch(value?: string | null) {
  const normalized = value?.normalize('NFKC').replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function normalizeAssignmentListPublishedSearch(value?: string | null) {
  const normalized = value ? normalizeAssignmentShareSlug(value) : undefined;
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
    published: normalizeAssignmentListPublishedSearch(published),
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
): AssignmentLifecycleStatusFilter | undefined {
  if (value === 'published') return 'open';
  if (typeof value !== 'string') return undefined;
  if (
    ASSIGNMENT_LIFECYCLE_STATUS_FILTERS.includes(
      value as AssignmentLifecycleStatusFilter
    )
  ) {
    return value as AssignmentLifecycleStatusFilter;
  }

  return undefined;
}

export function buildAssignmentListValidatedSearch(
  search: Record<string, unknown>
): AssignmentListRouteSearch {
  return {
    page: parseAssignmentListPageSearch(search.page),
    published:
      typeof search.published === 'string'
        ? normalizeAssignmentListPublishedSearch(search.published)
        : undefined,
    q:
      typeof search.q === 'string'
        ? normalizeAssignmentListSearch(search.q)
        : undefined,
    status: parseAssignmentStatusFilter(search.status),
  };
}

function parseAssignmentListPageSearch(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : undefined;
}
