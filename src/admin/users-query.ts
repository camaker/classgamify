import { user } from '@/db/auth.schema';
import { buildSqlLikeContainsPattern } from '@/lib/sql-like';
import { and, asc, desc, eq, isNull, or, sql, type SQL } from 'drizzle-orm';

export const ADMIN_USER_LIST_INPUT_LIMITS = {
  pageSizeMax: 100,
  pageSizeMin: 1,
} as const;

export const ADMIN_USER_STATUS_FILTERS = ['active', 'inactive'] as const;

export type AdminUserStatusFilter = (typeof ADMIN_USER_STATUS_FILTERS)[number];
export type AdminUserSortId = 'createdAt' | 'email' | 'name';

const ADMIN_USER_SORT_FIELD_MAP = {
  createdAt: user.createdAt,
  email: user.email,
  name: user.name,
} satisfies Record<
  AdminUserSortId,
  typeof user.createdAt | typeof user.email | typeof user.name
>;

export function normalizeAdminUserSortId(
  value: string | null | undefined
): AdminUserSortId {
  const normalized = (value ?? 'createdAt').trim().toLowerCase();

  if (normalized === 'email') return 'email';
  if (normalized === 'name') return 'name';

  return 'createdAt';
}

export function buildAdminUserListWhere({
  role,
  search,
  status,
}: {
  role?: string;
  search?: string;
  status?: AdminUserStatusFilter;
}) {
  const conditions: SQL[] = [];
  const searchWhere = buildAdminUserSearchWhere(search);
  const normalizedRole = normalizeAdminUserRoleFilter(role);

  if (searchWhere) conditions.push(searchWhere);
  if (normalizedRole) conditions.push(eq(user.role, normalizedRole));

  if (status === 'active') {
    conditions.push(or(eq(user.banned, false), isNull(user.banned)) as SQL);
  } else if (status === 'inactive') {
    conditions.push(eq(user.banned, true));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export function buildAdminUserListOrderBy({
  sortDesc,
  sortId,
}: {
  sortDesc: boolean;
  sortId: string;
}) {
  const sortField =
    ADMIN_USER_SORT_FIELD_MAP[normalizeAdminUserSortId(sortId)] ??
    user.createdAt;

  return sortDesc ? desc(sortField) : asc(sortField);
}

export function getAdminUserListOffset({
  pageIndex,
  pageSize,
}: {
  pageIndex: number;
  pageSize: number;
}) {
  const normalizedPageIndex =
    Number.isInteger(pageIndex) && pageIndex > 0 ? pageIndex : 0;
  const normalizedPageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : ADMIN_USER_LIST_INPUT_LIMITS.pageSizeMin;

  return normalizedPageIndex * normalizedPageSize;
}

function buildAdminUserSearchWhere(search: string | undefined) {
  const normalizedSearch = normalizeAdminUserSearch(search);
  if (!normalizedSearch) return undefined;

  const pattern = buildSqlLikeContainsPattern(normalizedSearch);

  return or(
    sql`lower(${user.name}) like lower(${pattern}) escape '\\'`,
    sql`lower(${user.email}) like lower(${pattern}) escape '\\'`
  );
}

function normalizeAdminUserSearch(value: string | undefined) {
  return value?.trim() ?? '';
}

function normalizeAdminUserRoleFilter(value: string | undefined) {
  const normalized = value?.trim();

  return normalized || undefined;
}
