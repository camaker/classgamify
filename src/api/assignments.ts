import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import { assertActivityCanDeriveWork } from '@/activities/lifecycle';
import type { AssignmentStatus } from '@/activities/types';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import {
  countMatchingStudentIdentityAttempts,
  resolveAttemptIdentityCountStrategy,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import { summarizeAssignmentAttempts } from '@/assignments/attempt-stats';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import { normalizeAssignmentListSearch } from '@/assignments/list-filters';
import {
  assertAssignmentStatusTransition,
  isAssignmentExpired,
  isAssignmentOpen,
} from '@/assignments/lifecycle';
import {
  buildPublicAssignmentPayload,
  buildPublicAttemptReviewItems,
} from '@/assignments/public';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  publishAssignmentInputSchema,
  resolveAssignmentSettings,
  updateAssignmentStatusInputSchema,
} from '@/assignments/validation';
import { getDb } from '@/db';
import {
  activity,
  assignment,
  assignmentSnapshot,
  attempt,
} from '@/db/app.schema';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const assignmentStatusFilterSchema = z.enum(['draft', 'published', 'closed']);

const listAssignmentsInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
  publishedShareSlug: z.string().trim().min(1).max(80).optional(),
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
      })
      .from(attempt)
      .innerJoin(assignment, eq(attempt.assignmentId, assignment.id))
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .leftJoin(
        assignmentSnapshot,
        eq(assignmentSnapshot.assignmentId, assignment.id)
      )
      .where(where);
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

    const enriched = await Promise.all(
      items.map(async (item) => {
        const attempts = await db
          .select({
            resultJson: attempt.resultJson,
          })
          .from(attempt)
          .where(eq(attempt.assignmentId, item.assignment.id));
        const stats = summarizeAssignmentAttempts(attempts);

        return {
          ...withResolvedAssignmentSettings(item),
          stats,
        };
      })
    );
    const summaryStats = summarizeAssignmentAttempts(summaryAttempts);

    return {
      items: enriched,
      publishedAssignment,
      summary: {
        averageScore: summaryStats.averageScore,
        completions: summaryStats.completions,
        openAssignments: matchingAssignments.filter((item) =>
          isAssignmentOpen(item.status, item.expiresAt)
        ).length,
        totalAssignments: totalRow?.count ?? 0,
      },
      total: totalRow?.count ?? 0,
    };
  });

function buildAssignmentListWhere({
  search,
  status,
  userId,
}: {
  search?: string;
  status?: AssignmentStatus;
  userId: string;
}) {
  const normalizedSearch = normalizeAssignmentListSearch(search);
  const filters: SQL[] = [eq(assignment.ownerId, userId)];

  if (status) {
    filters.push(eq(assignment.status, status));
  }

  if (normalizedSearch) {
    filters.push(
      or(
        like(assignment.title, `%${normalizedSearch}%`),
        like(assignment.shareSlug, `%${normalizedSearch}%`),
        like(activity.title, `%${normalizedSearch}%`),
        like(activity.description, `%${normalizedSearch}%`),
        like(assignmentSnapshot.activityTitle, `%${normalizedSearch}%`),
        like(assignmentSnapshot.activityDescription, `%${normalizedSearch}%`),
        like(assignmentSnapshot.templateType, `%${normalizedSearch}%`)
      ) as SQL
    );
  }

  return and(...filters);
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

    await db.insert(assignment).values({
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

    await db.insert(assignmentSnapshot).values({
      activityDescription: sourceActivity.description,
      activityTitle: sourceActivity.title,
      assignmentId: id,
      contentJson: sourceActivity.contentJson,
      createdAt: now,
      templateType: sourceActivity.templateType,
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
      .where(eq(attempt.assignmentId, row.assignment.id))
      .orderBy(desc(attempt.completedAt));
    const stats = summarizeAssignmentAttempts(attempts);
    const content = row.snapshot?.contentJson ?? row.activity.contentJson;
    const templateType =
      row.snapshot?.templateType ?? row.activity.templateType;
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

const getPublicAssignmentInputSchema = z.object({
  shareSlug: z.string().min(1).max(80),
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
      .where(
        and(
          eq(assignment.shareSlug, data.shareSlug),
          eq(assignment.status, 'published')
        )
      )
      .limit(1);

    if (
      !row ||
      !isAssignmentOpen(row.assignment.status, row.assignment.expiresAt)
    ) {
      return null;
    }

    return buildPublicAssignmentPayload(row);
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
  shareSlug: z.string().min(1).max(80),
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
    if (row.assignment.status !== 'published') {
      throw new Error(m.assignment_api_error_assignment_closed());
    }
    if (isAssignmentExpired(row.assignment.expiresAt)) {
      throw new Error(m.assignment_api_error_assignment_expired());
    }

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

    if (settings.maxAttempts) {
      const attemptCount = await countPreviousIdentityAttempts({
        anonymousToken: submissionIdentity.anonymousToken ?? '',
        assignmentId: row.assignment.id,
        studentName: submissionIdentity.studentName ?? '',
      });
      if (attemptCount >= settings.maxAttempts) {
        throw new Error(m.assignment_api_error_attempt_limit_reached());
      }
    }

    const content = row.snapshot?.contentJson ?? row.activity.contentJson;
    const templateType =
      row.snapshot?.templateType ?? row.activity.templateType;
    const runtimeItems = getRuntimeItems(templateType, content);
    assertSubmittedAnswersMatchRuntimeItems({
      answers: data.answers,
      runtimeItems,
    });
    const evaluation = evaluateRuntimeAnswers({
      answers: data.answers,
      content,
      durationSeconds,
      templateType,
    });
    const now = new Date();
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
      startedAt: now,
      anonymousToken: submissionIdentity.anonymousToken,
      studentName: submissionIdentity.studentName,
    });

    return {
      id,
      reviewItems: buildPublicAttemptReviewItems({
        answers: evaluation.answers,
        runtimeItems,
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
          eq(attempt.anonymousToken, strategy.identity.anonymousToken)
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
      .where(eq(attempt.assignmentId, assignmentId));

    return countMatchingStudentIdentityAttempts({
      attempts: previousAttempts,
      identity: strategy.identity,
    });
  }

  return 0;
}
