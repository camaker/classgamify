import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import { assertActivityCanDeriveWork } from '@/activities/lifecycle';
import type { AssignmentStatus, AttemptResult } from '@/activities/types';
import {
  isSameStudentIdentity,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';
import { isAssignmentExpired, isAssignmentOpen } from '@/assignments/lifecycle';
import {
  buildAttemptReviewItems,
  estimateAssignmentMinutes,
  stripRuntimeAnswers,
} from '@/assignments/public';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  defaultAssignmentSettings,
  publishAssignmentInputSchema,
  updateAssignmentStatusInputSchema,
} from '@/assignments/validation';
import { getDb } from '@/db';
import {
  activity,
  assignment,
  assignmentSnapshot,
  attempt,
} from '@/db/app.schema';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const assignmentStatusFilterSchema = z.enum(['draft', 'published', 'closed']);

const listAssignmentsInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
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
          ...item,
          stats,
        };
      })
    );
    const summaryStats = summarizeAssignmentAttempts(summaryAttempts);

    return {
      items: enriched,
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

function summarizeAssignmentAttempts(
  attempts: Array<{ resultJson: AttemptResult | null }>
) {
  const completions = attempts.length;
  const averageScore =
    completions > 0
      ? Math.round(
          attempts.reduce(
            (sum, item) => sum + (item.resultJson?.accuracy ?? 0),
            0
          ) / completions
        )
      : 0;

  return {
    averageScore,
    completions,
  };
}

function buildAssignmentListWhere({
  search,
  status,
  userId,
}: {
  search?: string;
  status?: AssignmentStatus;
  userId: string;
}) {
  const normalizedSearch = normalizeAssignmentSearch(search);
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

function normalizeAssignmentSearch(value?: string) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
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
      throw new Error('Activity not found.');
    }
    assertActivityCanDeriveWork(sourceActivity.visibility);

    const now = new Date();
    const id = nanoid(16);
    const shareSlug = nanoid(10);
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (expiresAt && expiresAt.getTime() <= now.getTime()) {
      throw new Error('Choose a future close time for this assignment.');
    }
    const settings = {
      ...defaultAssignmentSettings,
      ...data.settings,
    };

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
      throw new Error('Assignment was saved but could not be loaded.');
    }

    return row;
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
      .select({ id: assignment.id })
      .from(assignment)
      .where(where)
      .limit(1);

    if (!existingAssignment) {
      throw new Error('Assignment not found.');
    }

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
      throw new Error('Assignment status was saved but could not be loaded.');
    }

    return row;
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
      throw new Error('Assignment not found.');
    }

    const attempts = await db
      .select()
      .from(attempt)
      .where(eq(attempt.assignmentId, row.assignment.id))
      .orderBy(desc(attempt.completedAt));
    const completions = attempts.length;
    const averageScore =
      completions > 0
        ? Math.round(
            attempts.reduce((sum, item) => {
              const result = item.resultJson;
              return sum + (result?.accuracy ?? 0);
            }, 0) / completions
          )
        : 0;
    const averagePoints =
      completions > 0
        ? Math.round(
            attempts.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              completions
          )
        : 0;
    const durationAttempts = attempts.filter(
      (item) => item.resultJson?.durationSeconds !== undefined
    );
    const averageDurationSeconds =
      durationAttempts.length > 0
        ? Math.round(
            durationAttempts.reduce(
              (sum, item) => sum + (item.resultJson?.durationSeconds ?? 0),
              0
            ) / durationAttempts.length
          )
        : 0;
    const content = row.snapshot?.contentJson ?? row.activity.contentJson;
    const templateType =
      row.snapshot?.templateType ?? row.activity.templateType;
    const runtimeItems = getRuntimeItems(templateType, content);

    return {
      ...row,
      analysis: analyzeAssignmentResults({
        attempts,
        runtimeItems,
      }),
      attempts,
      stats: {
        averagePoints,
        averageDurationSeconds,
        averageScore,
        completions,
      },
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

    const content = row.snapshot?.contentJson ?? row.activity.contentJson;
    const templateType =
      row.snapshot?.templateType ?? row.activity.templateType;
    const runtimeItems = getRuntimeItems(templateType, content);

    return {
      activity: {
        description:
          row.snapshot?.activityDescription ?? row.activity.description,
        id: row.activity.id,
        templateType,
        title: row.snapshot?.activityTitle ?? row.activity.title,
        visibility: row.activity.visibility,
      },
      assignment: {
        expiresAt: row.assignment.expiresAt,
        id: row.assignment.id,
        settingsJson: {
          ...defaultAssignmentSettings,
          ...row.assignment.settingsJson,
        },
        shareSlug: row.assignment.shareSlug,
        status: row.assignment.status,
        title: row.assignment.title,
      },
      runtimeItems: stripRuntimeAnswers(runtimeItems),
      snapshot: row.snapshot
        ? {
            activityDescription: row.snapshot.activityDescription,
            activityTitle: row.snapshot.activityTitle,
            templateType: row.snapshot.templateType,
          }
        : null,
      summary: {
        difficulty: content.difficulty,
        estimatedMinutes: estimateAssignmentMinutes(runtimeItems.length),
        gradeBand: content.gradeBand,
        itemCount: runtimeItems.length,
        language: content.language,
        learningGoal: content.learningGoal,
        subject: content.subject,
      },
    };
  });

const submitAttemptInputSchema = z.object({
  anonymousToken: z.string().trim().min(12).max(120).optional(),
  answers: z.array(
    z.object({
      answer: z.string().trim().max(500),
      itemId: z.string().min(1).max(120),
    })
  ),
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
      throw new Error('Assignment not found.');
    }
    if (row.assignment.status !== 'published') {
      throw new Error('This assignment is closed.');
    }
    if (isAssignmentExpired(row.assignment.expiresAt)) {
      throw new Error('This assignment has expired.');
    }

    const settings = {
      ...defaultAssignmentSettings,
      ...row.assignment.settingsJson,
    };
    const studentName = normalizeStudentName(data.studentName);
    const anonymousToken = normalizeAnonymousToken(data.anonymousToken);
    if (settings.collectStudentName && !studentName) {
      throw new Error('Student name is required for this assignment.');
    }
    if (!settings.collectStudentName && !anonymousToken) {
      throw new Error('Anonymous student token is required.');
    }

    if (settings.maxAttempts) {
      const previousAttempts = await db
        .select({
          anonymousToken: attempt.anonymousToken,
          studentName: attempt.studentName,
        })
        .from(attempt)
        .where(eq(attempt.assignmentId, row.assignment.id));
      const attemptCount = previousAttempts.filter((item) =>
        isSameStudentIdentity(item, { anonymousToken, studentName })
      ).length;
      if (attemptCount >= settings.maxAttempts) {
        throw new Error('This assignment has reached its attempt limit.');
      }
    }

    const content = row.snapshot?.contentJson ?? row.activity.contentJson;
    const templateType =
      row.snapshot?.templateType ?? row.activity.templateType;
    const runtimeItems = getRuntimeItems(templateType, content);
    const evaluation = evaluateRuntimeAnswers({
      answers: data.answers,
      content,
      durationSeconds: data.durationSeconds,
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
      anonymousToken: anonymousToken || null,
      studentName: studentName || null,
    });

    return {
      id,
      reviewItems: settings.showCorrectAnswers
        ? buildAttemptReviewItems({
            answers: evaluation.answers,
            runtimeItems,
          })
        : [],
      result: evaluation.result,
    };
  });
