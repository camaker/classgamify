import {
  activityPersistedVisibilitySchema,
  activityTemplateTypeSchema,
  createActivityInputSchema,
} from '@/activities/validation';
import {
  buildActivityCreateInsert,
  buildDuplicatedActivityInsert,
  buildActivityUpdateSet,
  buildActivityVisibilityUpdateSet,
  buildRemixedActivityInsert,
} from '@/activities/persistence';
import {
  buildActivityDetailOwnerWhere,
  buildActivityDetailSelect,
  buildActivityLifecycleGateSelect,
} from '@/activities/detail-query';
import { getTemplateByType } from '@/activities/catalog';
import {
  ACTIVITY_LIBRARY_INPUT_LIMITS,
  ACTIVITY_LIBRARY_PAGE_SIZE,
  ACTIVITY_LIBRARY_STATUSES,
  ACTIVITY_SOURCE_MATERIAL_FILTERS,
} from '@/activities/library-filters';
import {
  buildCreatedActivityListItemSelect,
  buildActivityLibraryItemSelect,
  buildActivityLibraryWhere,
  filterActivityLibrarySourceItems,
  getActivityLibraryPageItems,
} from '@/activities/library-query';
import { summarizeActivityLibrary } from '@/activities/library-summary';
import {
  ACTIVITY_RESTORED_VISIBILITY,
  assertActivityCanDeriveWork,
  assertActivityCanEdit,
  assertActivityCanArchive,
  assertActivityCanRestore,
} from '@/activities/lifecycle';
import {
  assertTemplateRemixOptionReady,
  getTemplateRemixOption,
} from '@/activities/template-remix';
import { getDb } from '@/db';
import { activity } from '@/db/app.schema';
import { APP_ENTITY_ID_LENGTH } from '@/lib/entity-id';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const activityListStatusSchema = z.enum(ACTIVITY_LIBRARY_STATUSES);
const activityListSourceSchema = z.enum(ACTIVITY_SOURCE_MATERIAL_FILTERS);

const listActivitiesInputSchema = z.object({
  createdActivityId: z
    .string()
    .trim()
    .min(ACTIVITY_LIBRARY_INPUT_LIMITS.idMinLength)
    .max(ACTIVITY_LIBRARY_INPUT_LIMITS.createdActivityIdMaxLength)
    .optional(),
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z
    .number()
    .int()
    .min(ACTIVITY_LIBRARY_INPUT_LIMITS.pageSizeMin)
    .max(ACTIVITY_LIBRARY_INPUT_LIMITS.pageSizeMax)
    .default(ACTIVITY_LIBRARY_PAGE_SIZE),
  search: z
    .string()
    .trim()
    .max(ACTIVITY_LIBRARY_INPUT_LIMITS.searchMaxLength)
    .optional(),
  source: activityListSourceSchema.default('all'),
  status: activityListStatusSchema.default('active'),
  template: activityTemplateTypeSchema.optional(),
});

export const listActivities = createServerFn({ method: 'GET' })
  .validator(listActivitiesInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildActivityLibraryWhere({
      search: data.search,
      status: data.status,
      template: data.template,
      userId,
    });
    const summaryWhere = buildActivityLibraryWhere({
      search: data.search,
      template: data.template,
      userId,
    });

    const matchingRows = await db
      .select(buildActivityLibraryItemSelect())
      .from(activity)
      .where(where);
    const summaryRows = await db
      .select(buildActivityLibraryItemSelect())
      .from(activity)
      .where(summaryWhere);
    const matchingActivities = filterActivityLibrarySourceItems({
      items: matchingRows,
      source: data.source,
    });
    const summaryActivities = filterActivityLibrarySourceItems({
      items: summaryRows,
      source: data.source,
    });
    const total = matchingActivities.length;
    const [createdActivity] = data.createdActivityId
      ? await db
          .select(buildCreatedActivityListItemSelect())
          .from(activity)
          .where(
            buildActivityDetailOwnerWhere({
              activityId: data.createdActivityId,
              userId,
            })
          )
          .limit(1)
      : [];
    const items = getActivityLibraryPageItems({
      items: matchingActivities,
      pageIndex: data.pageIndex,
      pageSize: data.pageSize,
    });

    return {
      createdActivity,
      items,
      summary: summarizeActivityLibrary(matchingActivities),
      statusSummary: summarizeActivityLibrary(summaryActivities),
      total,
    };
  });

const getActivityInputSchema = z.object({
  id: z.string().min(1),
});

export const getActivity = createServerFn({ method: 'GET' })
  .validator(getActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(buildActivityDetailOwnerWhere({ activityId: data.id, userId }))
      .limit(1);

    if (!row) {
      throw new Error(m.activity_api_error_activity_not_found());
    }

    return row;
  });

export const createActivity = createServerFn({ method: 'POST' })
  .validator(createActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const now = new Date();
    const id = nanoid(APP_ENTITY_ID_LENGTH.generated);

    await db
      .insert(activity)
      .values(buildActivityCreateInsert({ id, input: data, now, userId }));

    const [row] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(buildActivityDetailOwnerWhere({ activityId: id, userId }))
      .limit(1);

    if (!row) {
      throw new Error(m.activity_api_error_create_load_failed());
    }

    return row;
  });

const duplicateActivityInputSchema = z.object({
  activityId: z.string().min(1),
});

export const duplicateActivity = createServerFn({ method: 'POST' })
  .validator(duplicateActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [sourceActivity] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(
        buildActivityDetailOwnerWhere({
          activityId: data.activityId,
          userId,
        })
      )
      .limit(1);

    if (!sourceActivity) {
      throw new Error(m.activity_api_error_activity_not_found());
    }
    assertActivityCanDeriveWork(sourceActivity.visibility);

    const now = new Date();
    const id = nanoid(APP_ENTITY_ID_LENGTH.generated);
    await db.insert(activity).values(
      buildDuplicatedActivityInsert({
        id,
        now,
        sourceActivity,
        userId,
      })
    );

    const [row] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(buildActivityDetailOwnerWhere({ activityId: id, userId }))
      .limit(1);

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
  .validator(remixActivityTemplateInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [sourceActivity] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(
        buildActivityDetailOwnerWhere({
          activityId: data.activityId,
          userId,
        })
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
    assertTemplateRemixOptionReady(remixOption);

    const now = new Date();
    const id = nanoid(APP_ENTITY_ID_LENGTH.generated);
    await db.insert(activity).values(
      buildRemixedActivityInsert({
        id,
        now,
        sourceActivity,
        targetTemplate,
        userId,
      })
    );

    const [row] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(buildActivityDetailOwnerWhere({ activityId: id, userId }))
      .limit(1);

    if (!row) {
      throw new Error(m.activity_api_error_remix_load_failed());
    }

    return row;
  });

const updateActivityInputSchema = createActivityInputSchema.extend({
  id: z.string().min(1),
});

export const updateActivity = createServerFn({ method: 'POST' })
  .validator(updateActivityInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [existingActivity] = await db
      .select(buildActivityLifecycleGateSelect())
      .from(activity)
      .where(buildActivityDetailOwnerWhere({ activityId: data.id, userId }))
      .limit(1);

    if (!existingActivity) {
      throw new Error(m.activity_api_error_activity_not_found());
    }
    assertActivityCanEdit(existingActivity.visibility);

    const now = new Date();

    await db
      .update(activity)
      .set(buildActivityUpdateSet({ input: data, now }))
      .where(buildActivityDetailOwnerWhere({ activityId: data.id, userId }));

    const [row] = await db
      .select(buildActivityDetailSelect())
      .from(activity)
      .where(buildActivityDetailOwnerWhere({ activityId: data.id, userId }))
      .limit(1);

    return row;
  });

const updateActivityVisibilityInputSchema = z.object({
  activityId: z.string().min(1),
  visibility: activityPersistedVisibilitySchema,
});

export const archiveActivity = createServerFn({ method: 'POST' })
  .validator(updateActivityVisibilityInputSchema.pick({ activityId: true }))
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) =>
    updateActivityVisibility({
      action: 'archive',
      activityId: data.activityId,
      ownerId: context.userId,
      nextVisibility: 'archived',
    })
  );

export const restoreActivity = createServerFn({ method: 'POST' })
  .validator(updateActivityVisibilityInputSchema.pick({ activityId: true }))
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) =>
    updateActivityVisibility({
      action: 'restore',
      activityId: data.activityId,
      ownerId: context.userId,
      nextVisibility: ACTIVITY_RESTORED_VISIBILITY,
    })
  );

async function updateActivityVisibility({
  action,
  activityId,
  nextVisibility,
  ownerId,
}: {
  action: 'archive' | 'restore';
  activityId: string;
  nextVisibility: z.infer<typeof activityPersistedVisibilitySchema>;
  ownerId: string;
}) {
  const db = getDb();
  const [row] = await db
    .select(buildActivityLifecycleGateSelect())
    .from(activity)
    .where(buildActivityDetailOwnerWhere({ activityId, userId: ownerId }))
    .limit(1);

  if (!row) {
    throw new Error(m.activity_api_error_activity_not_found());
  }

  if (action === 'archive') {
    assertActivityCanArchive(row.visibility);
  } else {
    assertActivityCanRestore(row.visibility);
  }

  const updatedAt = new Date();
  await db
    .update(activity)
    .set(buildActivityVisibilityUpdateSet({ nextVisibility, updatedAt }))
    .where(buildActivityDetailOwnerWhere({ activityId, userId: ownerId }));

  const [updatedRow] = await db
    .select(buildActivityDetailSelect())
    .from(activity)
    .where(buildActivityDetailOwnerWhere({ activityId, userId: ownerId }))
    .limit(1);

  if (!updatedRow) {
    throw new Error(m.activity_api_error_activity_not_found());
  }

  return updatedRow;
}
