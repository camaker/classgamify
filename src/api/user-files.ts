import { getDb } from '@/db';
import { userFiles } from '@/db/app.schema';
import { authApiMiddleware } from '@/middleware/auth-middleware';
import { deleteFile } from '@/storage';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const listSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
});

export const listUserFiles = createServerFn({ method: 'GET' })
  .inputValidator(listSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const pageIndex = data.pageIndex;
    const pageSize = data.pageSize;
    const db = getDb();
    const where = eq(userFiles.userId, userId);

    const [totalRow] = await db
      .select({ count: count() })
      .from(userFiles)
      .where(where);
    const total = totalRow?.count ?? 0;

    const items = await db
      .select()
      .from(userFiles)
      .where(where)
      .orderBy(desc(userFiles.createdAt))
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    return { items, total };
  });

const deleteSchema = z.object({ id: z.string() });

export const deleteUserFile = createServerFn({ method: 'POST' })
  .inputValidator(deleteSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select()
      .from(userFiles)
      .where(and(eq(userFiles.id, data.id), eq(userFiles.userId, userId)))
      .limit(1);

    if (!row) {
      throw new Error('Not found');
    }

    await deleteFile(row.r2Key);
    await db.delete(userFiles).where(eq(userFiles.id, data.id));
  });
