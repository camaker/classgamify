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

  return {
    created: normalizeActivityLibraryCreatedSearch(created),
    page: normalizedPage,
    q: normalizedSearch,
    source: source === 'all' ? undefined : source,
    status: status === 'active' ? undefined : status,
    template: template === 'all' ? undefined : template,
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

export function parseActivityLibraryStatus(
  value: unknown
): ActivityLibraryStatus | undefined {
  return value === 'archived' || value === 'active' ? value : undefined;
}

export function parseActivitySourceMaterialFilter(
  value: unknown
): Exclude<ActivitySourceMaterialFilter, 'all'> | undefined {
  switch (value) {
    case 'audio':
    case 'extractable':
    case 'spreadsheet':
    case 'worksheet':
      return value;
    default:
      return undefined;
  }
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

function parseActivityLibraryPageSearch(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : undefined;
}
