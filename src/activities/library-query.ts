import {
  type ActivityLibraryStatus,
  type ActivityTemplateFilter,
  normalizeActivityLibrarySearch,
} from '@/activities/library-filters';
import { activity } from '@/db/app.schema';
import { sqlLikeContains } from '@/lib/sql-like';
import { and, eq, ne, or, type SQL } from 'drizzle-orm';

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
