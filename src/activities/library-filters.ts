import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityTemplateType,
} from '@/activities/types';

export type ActivityLibraryStatus = 'active' | 'archived';
export type ActivityTemplateFilter = 'all' | ActivityTemplateType;

export function normalizeActivityLibrarySearch(value?: string | null) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
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

export function isActivityTemplateType(
  value: unknown
): value is ActivityTemplateType {
  return (
    typeof value === 'string' &&
    ACTIVITY_TEMPLATE_TYPES.includes(value as ActivityTemplateType)
  );
}
