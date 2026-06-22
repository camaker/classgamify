import type { AssignmentStatus } from '@/activities/types';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';

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
): AssignmentStatus | undefined {
  return value === 'published' || value === 'closed' || value === 'draft'
    ? value
    : undefined;
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
