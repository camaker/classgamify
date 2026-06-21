import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityTemplateType,
} from '@/activities/types';

export type ActivityLibraryStatus = 'active' | 'archived';
export type ActivityTemplateFilter = 'all' | ActivityTemplateType;

export type ActivityLibrarySearchState = {
  created?: string;
  page?: number;
  q?: string;
  status?: ActivityLibraryStatus;
  template?: ActivityTemplateFilter;
};

export type ActivityLibraryRouteSearch = {
  created?: string;
  page?: number;
  q?: string;
  status?: ActivityLibraryStatus;
  template?: ActivityTemplateType;
};

export function normalizeActivityLibrarySearch(value?: string | null) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

export function buildActivityLibraryRouteSearch({
  created,
  page,
  q,
  status = 'active',
  template = 'all',
}: ActivityLibrarySearchState): ActivityLibraryRouteSearch {
  const normalizedSearch = normalizeActivityLibrarySearch(q);
  const normalizedPage =
    page && Number.isInteger(page) && page > 1 ? page : undefined;

  return {
    created,
    page: normalizedPage,
    q: normalizedSearch,
    status: status === 'active' ? undefined : status,
    template: template === 'all' ? undefined : template,
  };
}

export function parseActivityLibraryStatus(
  value: unknown
): ActivityLibraryStatus | undefined {
  return value === 'archived' || value === 'active' ? value : undefined;
}

export function parseActivityTemplateFilter(
  value: unknown
): ActivityTemplateType | undefined {
  return isActivityTemplateType(value) ? value : undefined;
}

export function parseCreateActivityTemplateSearch(
  value: unknown
): ActivityTemplateType | undefined {
  return isActivityTemplateType(value) ? value : undefined;
}

export function isActivityTemplateType(
  value: unknown
): value is ActivityTemplateType {
  return (
    typeof value === 'string' &&
    ACTIVITY_TEMPLATE_TYPES.includes(value as ActivityTemplateType)
  );
}
