import {
  buildActivityContent,
  activityPersistedVisibilitySchema,
  activityTemplateTypeSchema,
  createActivityInputSchema,
} from '@/activities/validation';
import {
  buildDuplicatedActivityTitle,
  buildRemixedActivityTitle,
} from '@/activities/duplicate';
import { getTemplateByType } from '@/activities/catalog';
import { normalizeActivityLibrarySearch } from '@/activities/library-filters';
import { summarizeActivityLibrary } from '@/activities/library-summary';
import {
  assertActivityCanDeriveWork,
  assertActivityCanEdit,
} from '@/activities/lifecycle';
import { getTemplateRemixOption } from '@/activities/template-remix';
import { getDb } from '@/db';
import { activity } from '@/db/app.schema';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, like, ne, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const activityListStatusSchema = z.enum(['active', 'archived']);

const listActivitiesInputSchema = z.object({
  createdActivityId: z.string().trim().min(1).max(80).optional(),
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
  search: z.string().trim().max(120).optional(),
  status: activityListStatusSchema.default('active'),
  template: activityTemplateTypeSchema.optional(),
});

export const listActivities = createServerFn({ method: 'GET' })
  .inputValidator(listActivitiesInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const search = normalizeActivityLibrarySearch(data.search);
    const searchWhere = search
      ? or(
          like(activity.title, `%${search}%`),
          like(activity.description, `%${search}%`),
          like(activity.templateType, `%${search}%`)
        )
      : undefined;
    const statusWhere =
      data.status === 'archived'
        ? eq(activity.visibility, 'archived')
        : ne(activity.visibility, 'archived');
    const templateWhere = data.template
      ? eq(activity.templateType, data.template)
      : undefined;
    const where = and(
      eq(activity.ownerId, userId),
      statusWhere,
      templateWhere,
      searchWhere
    );

    const [totalRow] = await db
      .select({ count: count() })
      .from(activity)
      .where(where);
    const matchingActivities = await db.select().from(activity).where(where);
    const [createdActivity] = data.createdActivityId
      ? await db
          .select({
            id: activity.id,
            templateType: activity.templateType,
            title: activity.title,
            visibility: activity.visibility,
          })
          .from(activity)
          .where(
            and(
              eq(activity.id, data.createdActivityId),
              eq(activity.ownerId, userId)
            )
          )
          .limit(1)
      : [];
    const items = await db
      .select()
      .from(activity)
      .where(where)
      .orderBy(desc(activity.updatedAt))
      .limit(data.pageSize)
      .offset(data.pageIndex * data.pageSize);

    return {
      createdActivity,
      items,
      summary: summarizeActivityLibrary(matchingActivities),
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
      throw new Error(m.activity_api_error_activity_not_found());
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
      throw new Error(m.activity_api_error_create_load_failed());
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
      throw new Error(m.activity_api_error_activity_not_found());
    }
    assertActivityCanDeriveWork(sourceActivity.visibility);

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
      throw new Error(m.activity_api_error_duplicate_load_failed());
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
      throw new Error(m.activity_api_error_activity_not_found());
    }
    assertActivityCanDeriveWork(sourceActivity.visibility);
    if (sourceActivity.templateType === data.targetTemplateType) {
      throw new Error(m.activity_api_error_remix_same_template());
    }

    const targetTemplate = getTemplateByType(data.targetTemplateType);
    if (!targetTemplate) {
      throw new Error(m.activity_api_error_template_not_found());
    }
    const remixOption = getTemplateRemixOption({
      content: sourceActivity.contentJson,
      currentTemplateType: sourceActivity.templateType,
      template: targetTemplate,
    });
    if (!remixOption.isReady) {
      throw new Error(remixOption.diagnosis);
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
      title: buildRemixedActivityTitle({
        sourceTitle: sourceActivity.title,
        targetShortName: targetTemplate.shortName,
      }),
      updatedAt: now,
      visibility: 'draft',
    });

    const [row] = await db.select().from(activity).where(eq(activity.id, id));

    if (!row) {
      throw new Error(m.activity_api_error_remix_load_failed());
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
    const [existingActivity] = await db
      .select({
        id: activity.id,
        visibility: activity.visibility,
      })
      .from(activity)
      .where(and(eq(activity.id, data.id), eq(activity.ownerId, userId)))
      .limit(1);

    if (!existingActivity) {
      throw new Error(m.activity_api_error_activity_not_found());
    }
    assertActivityCanEdit(existingActivity.visibility);

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

    return row;
  });

const updateActivityVisibilityInputSchema = z.object({
  activityId: z.string().min(1),
  visibility: activityPersistedVisibilitySchema,
});

export const archiveActivity = createServerFn({ method: 'POST' })
  .inputValidator(
    updateActivityVisibilityInputSchema.pick({ activityId: true })
  )
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) =>
    updateActivityVisibility({
      activityId: data.activityId,
      ownerId: context.userId,
      visibility: 'archived',
    })
  );

export const restoreActivity = createServerFn({ method: 'POST' })
  .inputValidator(
    updateActivityVisibilityInputSchema.pick({ activityId: true })
  )
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) =>
    updateActivityVisibility({
      activityId: data.activityId,
      ownerId: context.userId,
      visibility: 'draft',
    })
  );

async function updateActivityVisibility({
  activityId,
  ownerId,
  visibility,
}: {
  activityId: string;
  ownerId: string;
  visibility: z.infer<typeof activityPersistedVisibilitySchema>;
}) {
  const db = getDb();
  await db
    .update(activity)
    .set({
      updatedAt: new Date(),
      visibility,
    })
    .where(and(eq(activity.id, activityId), eq(activity.ownerId, ownerId)));

  const [row] = await db
    .select()
    .from(activity)
    .where(and(eq(activity.id, activityId), eq(activity.ownerId, ownerId)))
    .limit(1);

  if (!row) {
    throw new Error(m.activity_api_error_activity_not_found());
  }

  return row;
}
