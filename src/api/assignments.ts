import { evaluateRuntimeAnswers } from '@/activities/runtime';
import { getDb } from '@/db';
import { activity, assignment, attempt } from '@/db/app.schema';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, avg, count, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const DEFAULT_ASSIGNMENT_SETTINGS = {
  collectStudentName: true,
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
};

const listAssignmentsInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
});

export const listAssignments = createServerFn({ method: 'GET' })
  .inputValidator(listAssignmentsInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = eq(assignment.ownerId, userId);

    const [totalRow] = await db
      .select({ count: count() })
      .from(assignment)
      .where(where);
    const items = await db
      .select({
        activity,
        assignment,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .where(where)
      .orderBy(desc(assignment.updatedAt))
      .limit(data.pageSize)
      .offset(data.pageIndex * data.pageSize);

    const enriched = await Promise.all(
      items.map(async (item) => {
        const [stats] = await db
          .select({
            averageScore: avg(attempt.score),
            completions: count(attempt.id),
          })
          .from(attempt)
          .where(eq(attempt.assignmentId, item.assignment.id));

        return {
          ...item,
          stats: {
            averageScore: Math.round(Number(stats?.averageScore ?? 0)),
            completions: stats?.completions ?? 0,
          },
        };
      })
    );

    return {
      items: enriched,
      total: totalRow?.count ?? 0,
    };
  });

const publishAssignmentInputSchema = z.object({
  activityId: z.string().min(1),
});

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

    const now = new Date();
    const id = nanoid(16);
    const shareSlug = nanoid(10);

    await db.insert(assignment).values({
      activityId: sourceActivity.id,
      createdAt: now,
      id,
      ownerId: userId,
      settingsJson: DEFAULT_ASSIGNMENT_SETTINGS,
      shareSlug,
      status: 'published',
      title: sourceActivity.title,
      updatedAt: now,
    });

    const [row] = await db
      .select({
        activity,
        assignment,
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .where(eq(assignment.id, id))
      .limit(1);

    if (!row) {
      throw new Error('Assignment was saved but could not be loaded.');
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
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
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

    return {
      ...row,
      attempts,
      stats: {
        averagePoints,
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
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .where(
        and(
          eq(assignment.shareSlug, data.shareSlug),
          eq(assignment.status, 'published')
        )
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return row;
  });

const submitAttemptInputSchema = z.object({
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
      })
      .from(assignment)
      .innerJoin(activity, eq(assignment.activityId, activity.id))
      .where(
        and(
          eq(assignment.shareSlug, data.shareSlug),
          eq(assignment.status, 'published')
        )
      )
      .limit(1);

    if (!row) {
      throw new Error('Assignment not found.');
    }

    const evaluation = evaluateRuntimeAnswers({
      answers: data.answers,
      content: row.activity.contentJson,
      durationSeconds: data.durationSeconds,
      templateType: row.activity.templateType,
    });
    const now = new Date();
    const id = nanoid(16);

    await db.insert(attempt).values({
      answersJson: {
        answers: evaluation.answers,
        templateType: row.activity.templateType,
      },
      assignmentId: row.assignment.id,
      completedAt: now,
      id,
      maxScore: evaluation.result.totalPoints,
      resultJson: evaluation.result,
      score: evaluation.result.earnedPoints,
      startedAt: now,
      studentName: data.studentName?.trim() || null,
    });

    return {
      id,
      result: evaluation.result,
    };
  });
