import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityContent,
  type ActivityTemplateType,
} from '@/activities/types';
import { summarizeActivitySourceMaterials } from '@/activities/material-summary';

export type ActivityLibraryStatus = 'active' | 'archived';
export type ActivitySourceMaterialFilter =
  | 'all'
  | 'audio'
  | 'extractable'
  | 'spreadsheet'
  | 'worksheet';
export type ActivityTemplateFilter = 'all' | ActivityTemplateType;

export const ACTIVITY_LIBRARY_PAGE_SIZE = 12;
export const ACTIVITY_LIBRARY_INPUT_LIMITS = {
  createdActivityIdMaxLength: 80,
  idMinLength: 1,
  pageSizeMax: 100,
  pageSizeMin: 1,
  searchMaxLength: 120,
} as const;
export const ACTIVITY_LIBRARY_STATUSES = [
  'active',
  'archived',
] as const satisfies readonly ActivityLibraryStatus[];
export const ACTIVITY_SOURCE_MATERIAL_FILTERS = [
  'all',
  'audio',
  'extractable',
  'spreadsheet',
  'worksheet',
] as const satisfies readonly ActivitySourceMaterialFilter[];
export const ACTIVITY_FILTERABLE_SOURCE_MATERIALS = [
  'audio',
  'extractable',
  'spreadsheet',
  'worksheet',
] as const satisfies readonly Exclude<ActivitySourceMaterialFilter, 'all'>[];

type ActivityLibrarySearchState = {
  created?: string;
  page?: number;
  q?: string;
  source?: ActivitySourceMaterialFilter;
  status?: ActivityLibraryStatus;
  template?: ActivityTemplateFilter;
};

type ActivityLibraryRouteSearch = {
  created?: string;
  page?: number;
  q?: string;
  source?: Exclude<ActivitySourceMaterialFilter, 'all'>;
  status?: ActivityLibraryStatus;
  template?: ActivityTemplateType;
};

export function normalizeActivityLibrarySearch(value?: string | null) {
  const normalized = value?.normalize('NFKC').replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function normalizeActivityLibraryCreatedSearch(value?: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function buildActivityLibraryRouteSearch({
  created,
  page,
  q,
  source = 'all',
  status = 'active',
  template = 'all',
}: ActivityLibrarySearchState): ActivityLibraryRouteSearch {
  const normalizedSearch = normalizeActivityLibrarySearch(q);
  const normalizedPage =
    page && Number.isInteger(page) && page > 1 ? page : undefined;
  const normalizedSource = resolveActivitySourceMaterialFilter(source);
  const normalizedStatus = resolveActivityLibraryStatus(status);
  const normalizedTemplate = resolveActivityTemplateFilter(template);

  return {
    created: normalizeActivityLibraryCreatedSearch(created),
    page: normalizedPage,
    q: normalizedSearch,
    source: normalizedSource === 'all' ? undefined : normalizedSource,
    status: normalizedStatus === 'active' ? undefined : normalizedStatus,
    template: normalizedTemplate === 'all' ? undefined : normalizedTemplate,
  };
}

export function buildActivityLibraryPageRouteSearch({
  current,
  page,
}: {
  current: Omit<ActivityLibrarySearchState, 'page'>;
  page: number;
}): ActivityLibraryRouteSearch {
  return buildActivityLibraryRouteSearch({
    ...current,
    page,
  });
}

export function buildActivityLibraryFilterRouteSearch({
  created,
  current,
  next,
}: {
  created?: string;
  current: Omit<ActivityLibrarySearchState, 'created' | 'page'>;
  next: Partial<Omit<ActivityLibrarySearchState, 'created' | 'page'>>;
}): ActivityLibraryRouteSearch {
  return buildActivityLibraryRouteSearch({
    created,
    q: next.q ?? current.q,
    source: next.source ?? current.source,
    status: next.status ?? current.status,
    template: next.template ?? current.template,
  });
}

export function buildActivityLibraryDismissCreatedRouteSearch({
  current,
}: {
  current: Omit<ActivityLibrarySearchState, 'created'>;
}): ActivityLibraryRouteSearch {
  return buildActivityLibraryRouteSearch(current);
}

export function parseActivityLibraryStatus(
  value: unknown
): ActivityLibraryStatus | undefined {
  return isActivityLibraryStatus(value) ? value : undefined;
}

export function parseActivitySourceMaterialFilter(
  value: unknown
): Exclude<ActivitySourceMaterialFilter, 'all'> | undefined {
  return isActivityFilterableSourceMaterial(value) ? value : undefined;
}

export function parseActivityTemplateFilter(
  value: unknown
): ActivityTemplateType | undefined {
  return isActivityTemplateType(value) ? value : undefined;
}

export function buildActivityLibraryValidatedSearch(
  search: Record<string, unknown>
): ActivityLibraryRouteSearch {
  return {
    created:
      typeof search.created === 'string'
        ? normalizeActivityLibraryCreatedSearch(search.created)
        : undefined,
    page: parseActivityLibraryPageSearch(search.page),
    q:
      typeof search.q === 'string'
        ? normalizeActivityLibrarySearch(search.q)
        : undefined,
    source: parseActivitySourceMaterialFilter(search.source),
    status: parseActivityLibraryStatus(search.status),
    template: parseActivityTemplateFilter(search.template),
  };
}

export function isActivityTemplateType(
  value: unknown
): value is ActivityTemplateType {
  return (
    typeof value === 'string' &&
    ACTIVITY_TEMPLATE_TYPES.includes(value as ActivityTemplateType)
  );
}

function isActivityLibraryStatus(
  value: unknown
): value is ActivityLibraryStatus {
  return (
    typeof value === 'string' &&
    ACTIVITY_LIBRARY_STATUSES.includes(value as ActivityLibraryStatus)
  );
}

function isActivityFilterableSourceMaterial(
  value: unknown
): value is Exclude<ActivitySourceMaterialFilter, 'all'> {
  return (
    typeof value === 'string' &&
    ACTIVITY_FILTERABLE_SOURCE_MATERIALS.includes(
      value as Exclude<ActivitySourceMaterialFilter, 'all'>
    )
  );
}

function resolveActivityLibraryStatus(value: unknown): ActivityLibraryStatus {
  return isActivityLibraryStatus(value) ? value : 'active';
}

function resolveActivitySourceMaterialFilter(
  value: unknown
): ActivitySourceMaterialFilter {
  if (value === 'all') return 'all';
  return isActivityFilterableSourceMaterial(value) ? value : 'all';
}

function resolveActivityTemplateFilter(value: unknown): ActivityTemplateFilter {
  if (value === 'all') return 'all';
  return isActivityTemplateType(value) ? value : 'all';
}

export function matchesActivitySourceMaterialFilter({
  content,
  source = 'all',
}: {
  content: ActivityContent;
  source?: ActivitySourceMaterialFilter;
}) {
  if (source === 'all') return true;

  const summary = summarizeActivitySourceMaterials(content.sourceMaterials);

  switch (source) {
    case 'audio':
      return summary.readiness.hasAudio;
    case 'extractable':
      return summary.readiness.extractableCount > 0;
    case 'spreadsheet':
      return summary.readiness.hasSpreadsheet;
    case 'worksheet':
      return summary.readiness.hasWorksheet;
  }
}

export function getActivityLibraryTotalPages({
  pageSize = ACTIVITY_LIBRARY_PAGE_SIZE,
  total,
}: {
  pageSize?: number;
  total: number;
}) {
  const normalizedPageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : ACTIVITY_LIBRARY_PAGE_SIZE;
  const normalizedTotal =
    Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;

  return Math.max(1, Math.ceil(normalizedTotal / normalizedPageSize));
}

function parseActivityLibraryPageSearch(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : undefined;
}
