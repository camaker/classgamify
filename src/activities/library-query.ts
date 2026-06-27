import {
  ACTIVITY_LIBRARY_PAGE_SIZE,
  type ActivityLibraryStatus,
  type ActivitySourceMaterialFilter,
  type ActivityTemplateFilter,
  matchesActivitySourceMaterialFilter,
  normalizeActivityLibrarySearch,
} from '@/activities/library-filters';
import type { ActivityContent } from '@/activities/types';
import { activity } from '@/db/app.schema';
import { sqlLikeContains } from '@/lib/sql-like';
import { and, eq, ne, or, type SQL } from 'drizzle-orm';

type ActivityLibrarySourceItem = {
  contentJson: ActivityContent;
};

type ActivityLibraryPagedItem = {
  updatedAt: Date;
};

export function buildActivityLibraryWhere({
  search,
  status = 'active',
  template,
  userId,
}: {
  search?: string;
  status?: ActivityLibraryStatus;
  template?: ActivityTemplateFilter;
  userId: string;
}) {
  const normalizedSearch = normalizeActivityLibrarySearch(search);
  const filters: SQL[] = [
    eq(activity.ownerId, userId),
    status === 'archived'
      ? eq(activity.visibility, 'archived')
      : ne(activity.visibility, 'archived'),
  ];

  if (template && template !== 'all') {
    filters.push(eq(activity.templateType, template));
  }

  if (normalizedSearch) {
    filters.push(
      or(
        sqlLikeContains(activity.title, normalizedSearch),
        sqlLikeContains(activity.description, normalizedSearch),
        sqlLikeContains(activity.templateType, normalizedSearch)
      ) as SQL
    );
  }

  return and(...filters);
}

export function filterActivityLibrarySourceItems<
  TItem extends ActivityLibrarySourceItem,
>({
  items,
  source = 'all',
}: {
  items: readonly TItem[];
  source?: ActivitySourceMaterialFilter;
}) {
  return items.filter((item) =>
    matchesActivitySourceMaterialFilter({
      content: item.contentJson,
      source,
    })
  );
}

export function getActivityLibraryPageItems<
  TItem extends ActivityLibraryPagedItem,
>({
  items,
  pageIndex = 0,
  pageSize = ACTIVITY_LIBRARY_PAGE_SIZE,
}: {
  items: readonly TItem[];
  pageIndex?: number;
  pageSize?: number;
}) {
  const normalizedPageIndex =
    Number.isInteger(pageIndex) && pageIndex > 0 ? pageIndex : 0;
  const normalizedPageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : ACTIVITY_LIBRARY_PAGE_SIZE;
  const start = normalizedPageIndex * normalizedPageSize;

  return [...items]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(start, start + normalizedPageSize);
}
