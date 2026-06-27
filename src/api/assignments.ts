import { evaluateRuntimeAnswers } from '@/activities/runtime';
import { buildActivityDetailOwnerWhere } from '@/activities/detail-query';
import { assertActivityCanDeriveWork } from '@/activities/lifecycle';
import type { AssignmentStatus } from '@/activities/types';
import {
  assertSubmittedAnswersMatchRuntimeItems,
  normalizeSubmittedAttemptAnswers,
} from '@/assignments/attempt-answers';
import {
  countMatchingStudentIdentityAttempts,
  resolveAttemptIdentityCountStrategy,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import {
  summarizeAssignmentAttempts,
  summarizeAssignmentAttemptsByAssignmentId,
  withAssignmentAttemptStatsSettings,
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
  ASSIGNMENT_LIST_INPUT_LIMITS,
  ASSIGNMENT_LIST_PAGE_SIZE,
  ASSIGNMENT_LIFECYCLE_STATUS_FILTERS,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  buildAssignmentListWhere,
  getAssignmentListOffset,
} from '@/assignments/list-query';
import { buildAssignmentListSummary } from '@/assignments/list-summary';
import {
  assertAssignmentAcceptsSubmissions,
  assertAssignmentStatusTransition,
} from '@/assignments/lifecycle';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import {
  buildPublicAssignmentLookupResult,
  buildPublicAttemptResult,
  buildPublicAttemptReviewItems,
} from '@/assignments/public';
import { buildPrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import {
  buildAssignmentDetailOwnerWhere,
  buildAssignmentDetailOwnerShareWhere,
  buildAssignmentDetailShareWhere,
} from '@/assignments/detail-query';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  ASSIGNMENT_SUBMISSION_ANSWER_LIMITS,
  ASSIGNMENT_SUBMISSION_DURATION_RANGE,
  ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS,
} from '@/assignments/submission-limits';
import {
  publishAssignmentInputSchema,
  resolveAssignmentSettings,
  updateAssignmentStatusInputSchema,
} from '@/assignments/validation';
import {
  ASSIGNMENT_SHARE_SLUG_LENGTH,
  normalizeAssignmentShareSlug,
} from '@/assignments/share-slug';
import {
  buildAssignmentSnapshotInsert,
  resolveAssignmentRuntimeSource,
} from '@/assignments/snapshot';
import { getDb } from '@/db';
import {
  activity,
  assignment,
  assignmentSnapshot,
  attempt,
} from '@/db/app.schema';
import { APP_ENTITY_ID_LENGTH } from '@/lib/entity-id';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const assignmentStatusFilterSchema = z.preprocess(
  parseAssignmentStatusFilter,
  z.enum(ASSIGNMENT_LIFECYCLE_STATUS_FILTERS).optional()
);
const assignmentShareSlugSchema = z
  .string()
  .transform(normalizeAssignmentShareSlug)
  .pipe(
    z
      .string()
      .min(ASSIGNMENT_SHARE_SLUG_LENGTH.min)
      .max(ASSIGNMENT_SHARE_SLUG_LENGTH.max)
  );

const listAssignmentsInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z
    .number()
    .int()
    .min(ASSIGNMENT_LIST_INPUT_LIMITS.pageSizeMin)
    .max(ASSIGNMENT_LIST_INPUT_LIMITS.pageSizeMax)
    .default(ASSIGNMENT_LIST_PAGE_SIZE),
  publishedShareSlug: assignmentShareSlugSchema.optional(),
  search: z
    .string()
    .trim()
    .max(ASSIGNMENT_LIST_INPUT_LIMITS.searchMaxLength)
    .optional(),
  status: assignmentStatusFilterSchema,
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
            buildAssignmentDetailOwnerShareWhere({
              shareSlug: data.publishedShareSlug,
              userId,
            })
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
      .offset(
        getAssignmentListOffset({
          pageIndex: data.pageIndex,
          pageSize: data.pageSize,
        })
      );
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
      itemAttempts.map(withAssignmentAttemptStatsSettings)
    );
    const emptyStats = summarizeAssignmentAttempts([]);
    const enriched = items.map((item) => ({
      ...withResolvedAssignmentSettings(item),
      stats: statsByAssignmentId.get(item.assignment.id) ?? emptyStats,
    }));
    const summary = buildAssignmentListSummary({
      attempts: summaryAttempts.map(withAssignmentAttemptStatsSettings),
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
        buildActivityDetailOwnerWhere({
          activityId: data.activityId,
          userId,
        })
      )
      .limit(1);

    if (!sourceActivity) {
      throw new Error(m.assignment_api_error_activity_not_found());
    }
    assertActivityCanDeriveWork(sourceActivity.visibility);

    const now = new Date();
    const id = nanoid(APP_ENTITY_ID_LENGTH.generated);
    const shareSlug = nanoid(ASSIGNMENT_SHARE_SLUG_LENGTH.generated);
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
    const where = buildAssignmentDetailOwnerWhere({
      assignmentId: data.assignmentId,
      userId,
    });
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
        buildAssignmentDetailOwnerWhere({
          assignmentId: data.assignmentId,
          userId,
        })
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
    const resolvedSource = resolveAssignmentRuntimeSource(row);

    return {
      ...withResolvedAssignmentSettings(row),
      analysis: analyzeAssignmentResults({
        attempts,
        runtimeItems: resolvedSource.runtimeItems,
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
        buildAssignmentDetailOwnerWhere({
          assignmentId: data.assignmentId,
          userId,
        })
      )
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_assignment_not_found());
    }

    const resolvedSource = resolveAssignmentRuntimeSource(row);

    return buildPrintableAssignmentWorksheet({
      activity: row.activity,
      assignment: row.assignment,
      includeAnswerKey: data.includeAnswerKey,
      runtimeItems: resolvedSource.runtimeItems,
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
      .where(buildAssignmentDetailShareWhere({ shareSlug: data.shareSlug }))
      .limit(1);

    if (!row) return null;

    return buildPublicAssignmentLookupResult(row);
  });

const submitAttemptInputSchema = z.object({
  anonymousToken: z
    .string()
    .trim()
    .min(ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS.anonymousTokenMinLength)
    .max(ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS.anonymousTokenMaxLength)
    .optional(),
  answers: z
    .array(
      z.object({
        answer: z
          .string()
          .trim()
          .max(ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.answerMaxLength),
        itemId: z
          .string()
          .min(1)
          .max(ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.itemIdMaxLength),
      })
    )
    .max(ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.maxAnswers),
  durationSeconds: z
    .number()
    .int()
    .min(ASSIGNMENT_SUBMISSION_DURATION_RANGE.min)
    .max(ASSIGNMENT_SUBMISSION_DURATION_RANGE.max)
    .optional(),
  shareSlug: assignmentShareSlugSchema,
  studentName: z
    .string()
    .trim()
    .min(1)
    .max(ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS.studentNameMaxLength)
    .optional(),
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
      .where(buildAssignmentDetailShareWhere({ shareSlug: data.shareSlug }))
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

    const resolvedSource = resolveAssignmentRuntimeSource(row);
    const content = resolvedSource.contentJson;
    const templateType = resolvedSource.templateType;
    const orderedRuntimeItems = orderAssignmentRuntimeItems({
      items: resolvedSource.runtimeItems,
      shareSlug: row.assignment.shareSlug,
      shuffleItems: settings.shuffleItems,
    });
    const submittedAnswers = normalizeSubmittedAttemptAnswers(data.answers);
    assertSubmittedAnswersMatchRuntimeItems({
      answers: submittedAnswers,
      runtimeItems: orderedRuntimeItems,
    });
    const evaluation = evaluateRuntimeAnswers({
      answers: submittedAnswers,
      content,
      durationSeconds,
      templateType,
    });
    const now = new Date();
    const startedAt = buildAttemptStartedAt({
      completedAt: now,
      durationSeconds,
    });
    const id = nanoid(APP_ENTITY_ID_LENGTH.generated);

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
      result: buildPublicAttemptResult(evaluation.result),
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
