import { createServerFn } from '@tanstack/react-start';
import {
  ADMIN_USER_LIST_INPUT_LIMITS,
  ADMIN_USER_STATUS_FILTERS,
  buildAdminUserListOrderBy,
  buildAdminUserListWhere,
  getAdminUserListOffset,
} from '@/admin/users-query';
import type { User } from '@/db/types';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { getDb } from '@/db';
import { user } from '@/db/auth.schema';
import { count as countFn } from 'drizzle-orm';
import { z } from 'zod';

const listUsersInputSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z
    .number()
    .int()
    .min(ADMIN_USER_LIST_INPUT_LIMITS.pageSizeMin)
    .max(ADMIN_USER_LIST_INPUT_LIMITS.pageSizeMax),
  search: z.string(),
  sortId: z.string(),
  sortDesc: z.boolean(),
  role: z.string().optional(),
  status: z.enum(ADMIN_USER_STATUS_FILTERS).optional(),
});

export const listUsers = createServerFn({ method: 'GET' })
  .inputValidator(listUsersInputSchema)
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    const { pageIndex, pageSize, search, sortDesc, role, status } = data;
    const where = buildAdminUserListWhere({ role, search, status });

    const selectQuery = db
      .select()
      .from(user)
      .where(where)
      .orderBy(buildAdminUserListOrderBy({ sortDesc, sortId: data.sortId }))
      .limit(pageSize)
      .offset(getAdminUserListOffset({ pageIndex, pageSize }));
    const countQuery = db.select({ count: countFn() }).from(user).where(where);

    const [items, [{ count }]] = await Promise.all([selectQuery, countQuery]);

    return {
      items: items.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        image: row.image,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        role: row.role,
        banned: row.banned,
        banReason: row.banReason,
        banExpires: row.banExpires,
      })) as User[],
      total: Number(count),
    };
  });
