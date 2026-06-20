import {
  buildActivityContent,
  activityTemplateTypeSchema,
  createActivityInputSchema,
} from '@/activities/validation';
import { buildDuplicatedActivityTitle } from '@/activities/duplicate';
import { getTemplateByType } from '@/activities/catalog';
import { getMissingTemplateRequirements } from '@/activities/template-remix';
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

const duplicateActivityInputSchema = z.object({
  activityId: z.string().min(1),
});

export const duplicateActivity = createServerFn({ method: 'POST' })
  .inputValidator(duplicateActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [sourceActivity] = await db
      .select()
      .from(activity)
      .where(
        and(eq(activity.id, data.activityId), eq(activity.ownerId, userId))
      )
      .limit(1);

    if (!sourceActivity) {
      throw new Error('Activity not found.');
    }

    const now = new Date();
    const id = nanoid(16);
    await db.insert(activity).values({
      contentJson: sourceActivity.contentJson,
      createdAt: now,
      description: sourceActivity.description,
      id,
      ownerId: userId,
      templateType: sourceActivity.templateType,
      title: buildDuplicatedActivityTitle(sourceActivity.title),
      updatedAt: now,
      visibility: 'draft',
    });

    const [row] = await db.select().from(activity).where(eq(activity.id, id));

    if (!row) {
      throw new Error('Duplicated activity was saved but could not be loaded.');
    }

    return row;
  });

const remixActivityTemplateInputSchema = z.object({
  activityId: z.string().min(1),
  targetTemplateType: activityTemplateTypeSchema,
});

export const remixActivityTemplate = createServerFn({ method: 'POST' })
  .inputValidator(remixActivityTemplateInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [sourceActivity] = await db
      .select()
      .from(activity)
      .where(
        and(eq(activity.id, data.activityId), eq(activity.ownerId, userId))
      )
      .limit(1);

    if (!sourceActivity) {
      throw new Error('Activity not found.');
    }
    if (sourceActivity.templateType === data.targetTemplateType) {
      throw new Error('Choose a different template to remix into.');
    }

    const targetTemplate = getTemplateByType(data.targetTemplateType);
    if (!targetTemplate) {
      throw new Error('Template not found.');
    }
    const missingRequirements = getMissingTemplateRequirements(
      targetTemplate,
      sourceActivity.contentJson
    );
    if (missingRequirements.length > 0) {
      throw new Error(
        `This activity needs ${missingRequirements.join(', ')} before remixing.`
      );
    }

    const now = new Date();
    const id = nanoid(16);
    await db.insert(activity).values({
      contentJson: sourceActivity.contentJson,
      createdAt: now,
      description: sourceActivity.description,
      id,
      ownerId: userId,
      templateType: targetTemplate.type,
      title: `${sourceActivity.title} (${targetTemplate.shortName})`,
      updatedAt: now,
      visibility: 'draft',
    });

    const [row] = await db.select().from(activity).where(eq(activity.id, id));

    if (!row) {
      throw new Error('Remixed activity was saved but could not be loaded.');
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
