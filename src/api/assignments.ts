import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import { assertActivityCanDeriveWork } from '@/activities/lifecycle';
import type { AssignmentStatus } from '@/activities/types';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import {
  countMatchingStudentIdentityAttempts,
  resolveAttemptIdentityCountStrategy,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import {
  summarizeAssignmentAttempts,
  summarizeAssignmentAttemptsByAssignmentId,
} from '@/assignments/attempt-stats';
import {
  buildAttemptStartedAt,
  normalizeAttemptDurationSeconds,
} from '@/assignments/attempt-duration';
import {
  buildAssignmentAttemptUsage,
  canUseAnotherAssignmentAttempt,
} from '@/assignments/attempt-limits';
import {
  type AssignmentLifecycleStatusFilter,
  normalizeAssignmentListSearch,
} from '@/assignments/list-filters';
import { buildAssignmentListSummary } from '@/assignments/list-summary';
import {
  assertAssignmentAcceptsSubmissions,
  assertAssignmentStatusTransition,
} from '@/assignments/lifecycle';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import {
  buildPublicAssignmentLookupResult,
  buildPublicAttemptReviewItems,
} from '@/assignments/public';
import { buildPrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  publishAssignmentInputSchema,
  resolveAssignmentSettings,
  updateAssignmentStatusInputSchema,
} from '@/assignments/validation';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  buildAssignmentSnapshotInsert,
  resolveAssignmentSnapshotSource,
} from '@/assignments/snapshot';
import { getDb } from '@/db';
import {
  activity,
  assignment,
  assignmentSnapshot,
  attempt,
} from '@/db/app.schema';
import { sqlLikeContains } from '@/lib/sql-like';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import {
  and,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  type SQL,
} from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const assignmentStatusFilterSchema = z.enum([
  'closed',
  'draft',
  'expired',
  'open',
]);
const assignmentShareSlugSchema = z
  .string()
  .transform(normalizeAssignmentShareSlug)
  .pipe(z.string().min(1).max(80));

const listAssignmentsInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
  publishedShareSlug: assignmentShareSlugSchema.optional(),
  search: z.string().trim().max(120).optional(),
  status: assignmentStatusFilterSchema.optional(),
});

export const listAssignments = createServerFn({ method: 'GET' })
  .inputValidator(listAssignmentsInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildAssignmentListWhere({
      search: data.search,
      status: data.status,
      userId,
    });

    const [totalRow] = await db
      .select({ count: count() })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(where);
    const matchingAssignments = await db
      .select({
        expiresAt: assignment.expiresAt,
        id: assignment.id,
        status: assignment.status,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(where);
    const summaryAttempts = await db
      .select({
        resultJson: attempt.resultJson,
        settingsJson: assignment.settingsJson,
      })
      .from(attempt)
      .innerJoin(assignment, eq(attempt.assignmentId, assignment.id))
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(and(where, isNotNull(attempt.resultJson)));
    const [publishedAssignment] = data.publishedShareSlug
      ? await db
          .select({
            id: assignment.id,
            shareSlug: assignment.shareSlug,
            title: assignment.title,
          })
          .from(assignment)
          .where(
            and(
              eq(assignment.ownerId, userId),
              eq(assignment.shareSlug, data.publishedShareSlug)
            )
          )
          .limit(1)
      : [];
    const items = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(where)
      .orderBy(desc(assignment.updatedAt))
      .limit(data.pageSize)
      .offset(data.pageIndex * data.pageSize);
    const itemAssignmentIds = items.map((item) => item.assignment.id);
    const itemAttempts =
      itemAssignmentIds.length > 0
        ? await db
            .select({
              assignmentId: attempt.assignmentId,
              resultJson: attempt.resultJson,
              settingsJson: assignment.settingsJson,
            })
            .from(attempt)
            .innerJoin(assignment, eq(attempt.assignmentId, assignment.id))
            .where(
              and(
                inArray(attempt.assignmentId, itemAssignmentIds),
                isNotNull(attempt.resultJson)
              )
            )
        : [];
    const statsByAssignmentId = summarizeAssignmentAttemptsByAssignmentId(
      itemAttempts.map(withAttemptStatsSettings)
    );
    const emptyStats = summarizeAssignmentAttempts([]);
    const enriched = items.map((item) => ({
      ...withResolvedAssignmentSettings(item),
      stats: statsByAssignmentId.get(item.assignment.id) ?? emptyStats,
    }));
    const summary = buildAssignmentListSummary({
      attempts: summaryAttempts.map(withAttemptStatsSettings),
      assignments: matchingAssignments,
      totalAssignments: totalRow?.count ?? 0,
    });

    return {
      items: enriched,
      publishedAssignment,
      summary,
      total: totalRow?.count ?? 0,
    };
  });

function buildAssignmentListWhere({
  now = new Date(),
  search,
  status,
  userId,
}: {
  now?: Date;
  search?: string;
  status?: AssignmentLifecycleStatusFilter;
  userId: string;
}) {
  const normalizedSearch = normalizeAssignmentListSearch(search);
  const filters: SQL[] = [eq(assignment.ownerId, userId)];

  if (status) {
    filters.push(buildAssignmentStatusFilter(status, now));
  }

  if (normalizedSearch) {
    filters.push(
      or(
        sqlLikeContains(assignment.title, normalizedSearch),
        sqlLikeContains(assignment.shareSlug, normalizedSearch),
        sqlLikeContains(activity.title, normalizedSearch),
        sqlLikeContains(activity.description, normalizedSearch),
        sqlLikeContains(assignmentSnapshot.activityTitle, normalizedSearch),
        sqlLikeContains(
          assignmentSnapshot.activityDescription,
          normalizedSearch
        ),
        sqlLikeContains(assignmentSnapshot.templateType, normalizedSearch)
      ) as SQL
    );
  }

  return and(...filters);
}

function buildAssignmentStatusFilter(
  status: AssignmentLifecycleStatusFilter,
  now: Date
) {
  if (status === 'open') {
    return and(
      eq(assignment.status, 'published'),
      or(isNull(assignment.expiresAt), gt(assignment.expiresAt, now))
    ) as SQL;
  }

  if (status === 'expired') {
    return and(
      eq(assignment.status, 'published'),
      isNotNull(assignment.expiresAt),
      lte(assignment.expiresAt, now)
    ) as SQL;
  }

  return eq(assignment.status, status);
}

function withResolvedAssignmentSettings<
  TItem extends {
    assignment: {
      settingsJson: Parameters<typeof resolveAssignmentSettings>[0];
    };
  },
>(item: TItem) {
  return {
    ...item,
    assignment: {
      ...item.assignment,
      settingsJson: resolveAssignmentSettings(item.assignment.settingsJson),
    },
  };
}

function withAttemptStatsSettings<
  TItem extends {
    settingsJson: Parameters<typeof resolveAssignmentSettings>[0];
  },
>(item: TItem) {
  const settings = resolveAssignmentSettings(item.settingsJson);

  return {
    ...item,
    timeLimitSeconds: settings.timeLimitSeconds,
  };
}

export const publishAssignment = createServerFn({ method: 'POST' })
  .inputValidator(publishAssignmentInputSchema)
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
      throw new Error(m.assignment_api_error_activity_not_found());
    }
    assertActivityCanDeriveWork(sourceActivity.visibility);

    const now = new Date();
    const id = nanoid(16);
    const shareSlug = nanoid(10);
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (expiresAt && expiresAt.getTime() <= now.getTime()) {
      throw new Error(m.assignment_api_error_close_time_future());
    }
    const settings = resolveAssignmentSettings(data.settings);

    await db.transaction(async (tx) => {
      await tx.insert(assignment).values({
        activityId: sourceActivity.id,
        createdAt: now,
        id,
        ownerId: userId,
        expiresAt,
        settingsJson: settings,
        shareSlug,
        status: 'published',
        title: data.title,
        updatedAt: now,
      });

      await tx.insert(assignmentSnapshot).values(
        buildAssignmentSnapshotInsert({
          assignmentId: id,
          createdAt: now,
          sourceActivity,
        })
      );
    });

    const [row] = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(eq(assignment.id, id))
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_create_load_failed());
    }

    return withResolvedAssignmentSettings(row);
  });

export const updateAssignmentStatus = createServerFn({ method: 'POST' })
  .inputValidator(updateAssignmentStatusInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = and(
      eq(assignment.id, data.assignmentId),
      eq(assignment.ownerId, userId)
    );
    const [existingAssignment] = await db
      .select({
        expiresAt: assignment.expiresAt,
        id: assignment.id,
        status: assignment.status,
      })
      .from(assignment)
      .where(where)
      .limit(1);

    if (!existingAssignment) {
      throw new Error(m.assignment_api_error_assignment_not_found());
    }
    assertAssignmentStatusTransition({
      currentStatus: existingAssignment.status,
      expiresAt: existingAssignment.expiresAt,
      nextStatus: data.status,
    });

    await db
      .update(assignment)
      .set({
        status: data.status,
        updatedAt: new Date(),
      })
      .where(where);

    const [row] = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(where)
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_status_load_failed());
    }

    return withResolvedAssignmentSettings(row);
  });

const getAssignmentResultsInputSchema = z.object({
  assignmentId: z.string().min(1),
});
const getPrintableAssignmentWorksheetInputSchema = z.object({
  assignmentId: z.string().min(1),
  includeAnswerKey: z.boolean().optional(),
});

export const getAssignmentResults = createServerFn({ method: 'GET' })
  .inputValidator(getAssignmentResultsInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(
        and(
          eq(assignment.id, data.assignmentId),
          eq(assignment.ownerId, userId)
        )
      )
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_assignment_not_found());
    }

    const attempts = await db
      .select()
      .from(attempt)
      .where(
        and(
          eq(attempt.assignmentId, row.assignment.id),
          isNotNull(attempt.resultJson)
        )
      )
      .orderBy(desc(attempt.completedAt));
    const settings = resolveAssignmentSettings(row.assignment.settingsJson);
    const stats = summarizeAssignmentAttempts(attempts, {
      timeLimitSeconds: settings.timeLimitSeconds,
    });
    const resolvedSource = resolveAssignmentSnapshotSource(row);
    const content = resolvedSource.contentJson ?? row.activity.contentJson;
    const templateType = resolvedSource.templateType;
    const runtimeItems = getRuntimeItems(templateType, content);

    return {
      ...withResolvedAssignmentSettings(row),
      analysis: analyzeAssignmentResults({
        attempts,
        runtimeItems,
      }),
      attempts,
      stats,
    };
  });

export const getPrintableAssignmentWorksheet = createServerFn({
  method: 'GET',
})
  .inputValidator(getPrintableAssignmentWorksheetInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(
        and(
          eq(assignment.id, data.assignmentId),
          eq(assignment.ownerId, userId)
        )
      )
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_assignment_not_found());
    }

    const resolvedSource = resolveAssignmentSnapshotSource(row);
    const content = resolvedSource.contentJson ?? row.activity.contentJson;
    const templateType = resolvedSource.templateType;

    return buildPrintableAssignmentWorksheet({
      activity: row.activity,
      assignment: row.assignment,
      includeAnswerKey: data.includeAnswerKey,
      runtimeItems: getRuntimeItems(templateType, content),
      snapshot: row.snapshot,
    });
  });

const getPublicAssignmentInputSchema = z.object({
  shareSlug: assignmentShareSlugSchema,
});

export const getPublicAssignment = createServerFn({ method: 'GET' })
  .inputValidator(getPublicAssignmentInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [row] = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(eq(assignment.shareSlug, data.shareSlug))
      .limit(1);

    if (!row) return null;

    return buildPublicAssignmentLookupResult(row);
  });

const submitAttemptInputSchema = z.object({
  anonymousToken: z.string().trim().min(12).max(120).optional(),
  answers: z
    .array(
      z.object({
        answer: z.string().trim().max(500),
        itemId: z.string().min(1).max(120),
      })
    )
    .max(200),
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60)
    .optional(),
  shareSlug: assignmentShareSlugSchema,
  studentName: z.string().trim().min(1).max(80).optional(),
});

export const submitAttempt = createServerFn({ method: 'POST' })
  .inputValidator(submitAttemptInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [row] = await db
      .select({
        activity,
        assignment,
        snapshot: assignmentSnapshot,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(eq(assignment.shareSlug, data.shareSlug))
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_assignment_not_found());
    }
    assertAssignmentAcceptsSubmissions({
      expiresAt: row.assignment.expiresAt,
      status: row.assignment.status,
    });

    const settings = resolveAssignmentSettings(row.assignment.settingsJson);
    const durationSeconds = normalizeAttemptDurationSeconds({
      durationSeconds: data.durationSeconds,
      timeLimitSeconds: settings.timeLimitSeconds,
    });
    const submissionIdentity = resolveAttemptSubmissionIdentity({
      anonymousToken: data.anonymousToken,
      collectStudentName: settings.collectStudentName,
      studentName: data.studentName,
    });
    if (settings.collectStudentName && !submissionIdentity.studentName) {
      throw new Error(m.assignment_api_error_student_name_required());
    }
    if (!settings.collectStudentName && !submissionIdentity.anonymousToken) {
      throw new Error(m.assignment_api_error_anonymous_token_required());
    }

    let previousAttemptCount = 0;
    if (settings.maxAttempts) {
      previousAttemptCount = await countPreviousIdentityAttempts({
        anonymousToken: submissionIdentity.anonymousToken ?? '',
        assignmentId: row.assignment.id,
        studentName: submissionIdentity.studentName ?? '',
      });
      if (
        !canUseAnotherAssignmentAttempt({
          maxAttempts: settings.maxAttempts,
          usedAttempts: previousAttemptCount,
        })
      ) {
        throw new Error(m.assignment_api_error_attempt_limit_reached());
      }
    }

    const resolvedSource = resolveAssignmentSnapshotSource(row);
    const content = resolvedSource.contentJson ?? row.activity.contentJson;
    const templateType = resolvedSource.templateType;
    const runtimeItems = getRuntimeItems(templateType, content);
    const orderedRuntimeItems = orderAssignmentRuntimeItems({
      items: runtimeItems,
      shareSlug: row.assignment.shareSlug,
      shuffleItems: settings.shuffleItems,
    });
    assertSubmittedAnswersMatchRuntimeItems({
      answers: data.answers,
      runtimeItems: orderedRuntimeItems,
    });
    const evaluation = evaluateRuntimeAnswers({
      answers: data.answers,
      content,
      durationSeconds,
      templateType,
    });
    const now = new Date();
    const startedAt = buildAttemptStartedAt({
      completedAt: now,
      durationSeconds,
    });
    const id = nanoid(16);

    await db.insert(attempt).values({
      answersJson: {
        answers: evaluation.answers,
        templateType,
      },
      assignmentId: row.assignment.id,
      completedAt: now,
      id,
      maxScore: evaluation.result.totalPoints,
      resultJson: evaluation.result,
      score: evaluation.result.earnedPoints,
      startedAt,
      anonymousToken: submissionIdentity.anonymousToken,
      studentName: submissionIdentity.studentName,
    });

    return {
      attemptUsage: buildAssignmentAttemptUsage({
        maxAttempts: settings.maxAttempts,
        previousAttemptCount,
      }),
      id,
      reviewItems: buildPublicAttemptReviewItems({
        answers: evaluation.answers,
        runtimeItems: orderedRuntimeItems,
        showCorrectAnswers: settings.showCorrectAnswers,
      }),
      result: evaluation.result,
    };
  });

async function countPreviousIdentityAttempts({
  anonymousToken,
  assignmentId,
  studentName,
}: {
  anonymousToken: string;
  assignmentId: string;
  studentName: string;
}) {
  const db = getDb();
  const strategy = resolveAttemptIdentityCountStrategy({
    anonymousToken,
    studentName,
  });

  if (strategy.type === 'anonymous-token') {
    const [row] = await db
      .select({ count: count() })
      .from(attempt)
      .where(
        and(
          eq(attempt.assignmentId, assignmentId),
          eq(attempt.anonymousToken, strategy.identity.anonymousToken),
          isNotNull(attempt.resultJson)
        )
      );

    return row?.count ?? 0;
  }

  if (strategy.type === 'normalized-student-name') {
    const previousAttempts = await db
      .select({
        anonymousToken: attempt.anonymousToken,
        studentName: attempt.studentName,
      })
      .from(attempt)
      .where(
        and(
          eq(attempt.assignmentId, assignmentId),
          isNotNull(attempt.resultJson)
        )
      );

    return countMatchingStudentIdentityAttempts({
      attempts: previousAttempts,
      identity: strategy.identity,
    });
  }

  return 0;
}
