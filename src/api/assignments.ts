import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
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
import { and, avg, count, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

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
    const settings = {
      ...defaultAssignmentSettings,
      ...data.settings,
    };

    await db.insert(assignment).values({
      activityId: sourceActivity.id,
      createdAt: now,
      id,
      ownerId: userId,
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

    if (!row) {
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

    const settings = {
      ...defaultAssignmentSettings,
      ...row.assignment.settingsJson,
    };
    const studentName = data.studentName?.trim();
    const anonymousToken = data.anonymousToken?.trim();
    if (settings.collectStudentName && !studentName) {
      throw new Error('Student name is required for this assignment.');
    }
    if (!settings.collectStudentName && !anonymousToken) {
      throw new Error('Anonymous student token is required.');
    }

    if (settings.maxAttempts) {
      const identityWhere =
        settings.collectStudentName && studentName
          ? eq(attempt.studentName, studentName)
          : anonymousToken
            ? eq(attempt.anonymousToken, anonymousToken)
            : undefined;
      if (!identityWhere) {
        throw new Error('Attempt identity is required.');
      }
      const [attemptCount] = await db
        .select({ count: count() })
        .from(attempt)
        .where(and(eq(attempt.assignmentId, row.assignment.id), identityWhere));
      if ((attemptCount?.count ?? 0) >= settings.maxAttempts) {
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
