import {
  buildActivityContent,
  createActivityInputSchema,
} from '@/activities/validation';
import { getDb } from '@/db';
import { activity } from '@/db/app.schema';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const listActivitiesInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
  search: z.string().trim().max(120).optional(),
});

export const listActivities = createServerFn({ method: 'GET' })
  .inputValidator(listActivitiesInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const search = data.search?.trim();
    const where = search
      ? and(eq(activity.ownerId, userId), like(activity.title, `%${search}%`))
      : eq(activity.ownerId, userId);

    const [totalRow] = await db
      .select({ count: count() })
      .from(activity)
      .where(where);
    const items = await db
      .select()
      .from(activity)
      .where(where)
      .orderBy(desc(activity.updatedAt))
      .limit(data.pageSize)
      .offset(data.pageIndex * data.pageSize);

    return {
      items,
      total: totalRow?.count ?? 0,
    };
  });

const getActivityInputSchema = z.object({
  id: z.string().min(1),
});

export const getActivity = createServerFn({ method: 'GET' })
  .inputValidator(getActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select()
      .from(activity)
      .where(and(eq(activity.id, data.id), eq(activity.ownerId, userId)))
      .limit(1);

    if (!row) {
      throw new Error('Activity not found.');
    }

    return row;
  });

export const createActivity = createServerFn({ method: 'POST' })
  .inputValidator(createActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const now = new Date();
    const id = nanoid(16);
    const content = buildActivityContent(data);

    await db.insert(activity).values({
      contentJson: content,
      createdAt: now,
      description: data.description?.trim() || null,
      id,
      ownerId: userId,
      templateType: data.templateType,
      title: data.title,
      updatedAt: now,
      visibility: data.visibility,
    });

    const [row] = await db.select().from(activity).where(eq(activity.id, id));

    if (!row) {
      throw new Error('Activity was saved but could not be loaded.');
    }

    return row;
  });

const updateActivityInputSchema = createActivityInputSchema.extend({
  id: z.string().min(1),
});

export const updateActivity = createServerFn({ method: 'POST' })
  .inputValidator(updateActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const now = new Date();
    const content = buildActivityContent(data);

    await db
      .update(activity)
      .set({
        contentJson: content,
        description: data.description?.trim() || null,
        templateType: data.templateType,
        title: data.title,
        updatedAt: now,
        visibility: data.visibility,
      })
      .where(and(eq(activity.id, data.id), eq(activity.ownerId, userId)));

    const [row] = await db
      .select()
      .from(activity)
      .where(and(eq(activity.id, data.id), eq(activity.ownerId, userId)))
      .limit(1);

    if (!row) {
      throw new Error('Activity not found.');
    }

    return row;
  });
