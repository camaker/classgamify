import { evaluateRuntimeAnswers } from '@/activities/runtime';
import {
  buildActivityAssignmentSourceSelect,
  buildActivityDetailOwnerWhere,
} from '@/activities/detail-query';
import { assertActivityCanDeriveWork } from '@/activities/lifecycle';
import type {
  AssignmentSettings,
  AttemptAnswer,
  AttemptResult,
} from '@/activities/types';
import type { RuntimeItem } from '@/activities/runtime';
import {
  assertSubmittedAnswersMatchRuntimeItems,
  normalizeSubmittedAttemptAnswers,
} from '@/assignments/attempt-answers';
import {
  countPreviousIdentityAttempts,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import {
  buildAssignmentAttemptStatsByAssignmentSelect,
  buildAssignmentAttemptStatsSelect,
  buildAssignmentAttemptsInWhere,
  buildAssignmentResultsAttemptSelect,
  buildAttemptSubmissionKeyWhere,
  buildAttemptSubmissionReplaySelect,
  buildAttemptAssignmentJoin,
  buildAttemptCompletedAtOrderBy,
  buildAttemptIdentitySlotWhere,
  buildScoredAssignmentAttemptWhere,
  buildScoredAttemptWhere,
} from '@/assignments/attempt-query';
import {
  summarizeAssignmentAttempts,
  summarizeAssignmentAttemptsByAssignmentId,
  withAssignmentAttemptStatsSettings,
} from '@/assignments/attempt-stats';
import { buildScoredAttemptInsert } from '@/assignments/attempt-persistence';
import { persistAttemptWithinIdentityLimit } from '@/assignments/attempt-limit-concurrency';
import {
  isAttemptIdentitySlotConflict,
  rethrowAssignmentSubmissionWriteError,
} from '@/assignments/submission-lifecycle-write';
import { doesAttemptSubmissionIdentityMatch } from '@/assignments/submission-idempotency';
import {
  buildAttemptStartedAt,
  normalizeAttemptDurationSeconds,
} from '@/assignments/attempt-duration';
import { buildAssignmentAttemptUsage } from '@/assignments/attempt-limits';
import {
  ASSIGNMENT_LIST_INPUT_LIMITS,
  ASSIGNMENT_LIST_PAGE_SIZE,
  ASSIGNMENT_LIFECYCLE_STATUS_FILTERS,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  buildAssignmentListCountSelect,
  buildAssignmentListOrderBy,
  buildAssignmentListSummarySelect,
  buildAssignmentListWhere,
  buildPublishedAssignmentListItemSelect,
  getAssignmentListOffset,
} from '@/assignments/list-query';
import { buildAssignmentListSummary } from '@/assignments/list-summary';
import {
  assertAssignmentAcceptsSubmissions,
  assertAssignmentStatusTransition,
} from '@/assignments/lifecycle';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import {
  buildAssignmentStatusUpdateSet,
  buildPublishedAssignmentInsert,
  buildPublishedAssignmentSnapshotInsert,
} from '@/assignments/persistence';
import {
  buildPublicAssignmentLookupResult,
  buildPublicAttemptResult,
  buildPublicAttemptReviewSummaryView,
} from '@/assignments/public';
import { buildPrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import {
  buildAssignmentActivityJoin,
  buildAssignmentDetailSelect,
  buildAssignmentDetailOwnerWhere,
  buildAssignmentDetailOwnerShareWhere,
  buildAssignmentDetailShareWhere,
  buildAssignmentLifecycleGateSelect,
  buildAssignmentSnapshotJoin,
} from '@/assignments/detail-query';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  ASSIGNMENT_SUBMISSION_ANSWER_LIMITS,
  ASSIGNMENT_SUBMISSION_DURATION_RANGE,
  ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS,
  ASSIGNMENT_SUBMISSION_KEY_LIMITS,
} from '@/assignments/submission-limits';
import {
  publishAssignmentInputSchema,
  resolveAssignmentSettings,
  updateAssignmentStatusInputSchema,
  withResolvedAssignmentSettings,
} from '@/assignments/validation';
import { resolveAssignmentPublishCloseAfterIso } from '@/assignments/publish-schedule';
import {
  ASSIGNMENT_SHARE_SLUG_LENGTH,
  normalizeAssignmentShareSlug,
} from '@/assignments/share-slug';
import { resolveAssignmentRuntimeSource } from '@/assignments/snapshot';
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
  .validator(listAssignmentsInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildAssignmentListWhere({
      search: data.search,
      status: data.status,
      userId,
    });

    const [
      totalRows,
      matchingAssignments,
      summaryAttempts,
      publishedAssignmentRows,
      items,
    ] = await Promise.all([
      db
        .select(buildAssignmentListCountSelect())
        .from(assignment)
        .innerJoin(activity, buildAssignmentActivityJoin())
        .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
        .where(where),
      db
        .select(buildAssignmentListSummarySelect())
        .from(assignment)
        .innerJoin(activity, buildAssignmentActivityJoin())
        .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
        .where(where),
      db
        .select(buildAssignmentAttemptStatsSelect())
        .from(attempt)
        .innerJoin(assignment, buildAttemptAssignmentJoin())
        .innerJoin(activity, buildAssignmentActivityJoin())
        .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
        .where(buildScoredAttemptWhere(where)),
      data.publishedShareSlug
        ? db
            .select(buildPublishedAssignmentListItemSelect())
            .from(assignment)
            .where(
              buildAssignmentDetailOwnerShareWhere({
                shareSlug: data.publishedShareSlug,
                userId,
              })
            )
            .limit(1)
        : Promise.resolve([]),
      db
        .select(buildAssignmentDetailSelect())
        .from(assignment)
        .innerJoin(activity, buildAssignmentActivityJoin())
        .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
        .where(where)
        .orderBy(...buildAssignmentListOrderBy())
        .limit(data.pageSize)
        .offset(
          getAssignmentListOffset({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
          })
        ),
    ]);
    const [totalRow] = totalRows;
    const [publishedAssignment] = publishedAssignmentRows;
    const itemAssignmentIds = items.map((item) => item.assignment.id);
    const itemAttempts =
      itemAssignmentIds.length > 0
        ? await db
            .select(buildAssignmentAttemptStatsByAssignmentSelect())
            .from(attempt)
            .innerJoin(assignment, buildAttemptAssignmentJoin())
            .where(
              buildScoredAttemptWhere(
                buildAssignmentAttemptsInWhere({
                  assignmentIds: itemAssignmentIds,
                })
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

export const publishAssignment = createServerFn({ method: 'POST' })
  .validator(publishAssignmentInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [sourceActivity] = await db
      .select(buildActivityAssignmentSourceSelect())
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
    const closeAfter = resolveAssignmentPublishCloseAfterIso({
      now,
      value: data.expiresAt,
    });
    if (closeAfter.status !== 'none' && closeAfter.status !== 'ready') {
      throw new Error(m.assignment_api_error_close_time_future());
    }
    const expiresAt = closeAfter.expiresAt;
    const settings = resolveAssignmentSettings(data.settings);

    await db.transaction(async (tx) => {
      await tx.insert(assignment).values(
        buildPublishedAssignmentInsert({
          expiresAt,
          id,
          now,
          settings,
          shareSlug,
          sourceActivity,
          title: data.title,
          userId,
        })
      );

      await tx.insert(assignmentSnapshot).values(
        buildPublishedAssignmentSnapshotInsert({
          assignmentId: id,
          createdAt: now,
          sourceActivity,
        })
      );
    });

    const [row] = await db
      .select(buildAssignmentDetailSelect())
      .from(assignment)
      .innerJoin(activity, buildAssignmentActivityJoin())
      .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
      .where(buildAssignmentDetailOwnerWhere({ assignmentId: id, userId }))
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_create_load_failed());
    }

    return withResolvedAssignmentSettings(row);
  });

export const updateAssignmentStatus = createServerFn({ method: 'POST' })
  .validator(updateAssignmentStatusInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildAssignmentDetailOwnerWhere({
      assignmentId: data.assignmentId,
      userId,
    });
    const [existingAssignment] = await db
      .select(buildAssignmentLifecycleGateSelect())
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
      .set(
        buildAssignmentStatusUpdateSet({
          nextStatus: data.status,
          updatedAt: new Date(),
        })
      )
      .where(where);

    const [row] = await db
      .select(buildAssignmentDetailSelect())
      .from(assignment)
      .innerJoin(activity, buildAssignmentActivityJoin())
      .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
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
  .validator(getAssignmentResultsInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select(buildAssignmentDetailSelect())
      .from(assignment)
      .innerJoin(activity, buildAssignmentActivityJoin())
      .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
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
      .select(buildAssignmentResultsAttemptSelect())
      .from(attempt)
      .where(
        buildScoredAssignmentAttemptWhere({
          assignmentId: row.assignment.id,
        })
      )
      .orderBy(...buildAttemptCompletedAtOrderBy());
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
        timeLimitSeconds: settings.timeLimitSeconds,
      }),
      attempts,
      stats,
    };
  });

export const getPrintableAssignmentWorksheet = createServerFn({
  method: 'GET',
})
  .validator(getPrintableAssignmentWorksheetInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select(buildAssignmentDetailSelect())
      .from(assignment)
      .innerJoin(activity, buildAssignmentActivityJoin())
      .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
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
  .validator(getPublicAssignmentInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [row] = await db
      .select(buildAssignmentDetailSelect())
      .from(assignment)
      .innerJoin(activity, buildAssignmentActivityJoin())
      .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
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
  submissionKey: z
    .string()
    .trim()
    .min(ASSIGNMENT_SUBMISSION_KEY_LIMITS.minLength)
    .max(ASSIGNMENT_SUBMISSION_KEY_LIMITS.maxLength),
});

export const submitAttempt = createServerFn({ method: 'POST' })
  .validator(submitAttemptInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [row] = await db
      .select(buildAssignmentDetailSelect())
      .from(assignment)
      .innerJoin(activity, buildAssignmentActivityJoin())
      .leftJoin(assignmentSnapshot, buildAssignmentSnapshotJoin())
      .where(buildAssignmentDetailShareWhere({ shareSlug: data.shareSlug }))
      .limit(1);

    if (!row) {
      throw new Error(m.assignment_api_error_assignment_not_found());
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

    const resolvedSource = resolveAssignmentRuntimeSource(row);
    const content = resolvedSource.contentJson;
    const templateType = resolvedSource.templateType;
    const orderedRuntimeItems = orderAssignmentRuntimeItems({
      items: resolvedSource.runtimeItems,
      shareSlug: row.assignment.shareSlug,
      shuffleItems: settings.shuffleItems,
    });
    const replayResponse = await recoverAttemptSubmissionResponse({
      assignmentId: row.assignment.id,
      db,
      identity: submissionIdentity,
      orderedRuntimeItems,
      settings,
      submissionKey: data.submissionKey,
    });
    if (replayResponse) return replayResponse;

    assertAssignmentAcceptsSubmissions({
      expiresAt: row.assignment.expiresAt,
      status: row.assignment.status,
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

    const persistence = await persistAttemptWithinIdentityLimit({
      countPreviousAttempts: () =>
        countPreviousIdentityAttempts({
          anonymousToken: submissionIdentity.anonymousToken ?? '',
          assignmentId: row.assignment.id,
          db,
          studentName: submissionIdentity.studentName ?? '',
        }),
      identity: submissionIdentity,
      insertAttempt: async (identitySlot) => {
        await db.insert(attempt).values(
          buildScoredAttemptInsert({
            assignmentId: row.assignment.id,
            completedAt: now,
            evaluation,
            id,
            identity: submissionIdentity,
            identitySlot,
            startedAt,
            submissionKey: data.submissionKey,
            templateType,
          })
        );
      },
      isSlotConflict: isAttemptIdentitySlotConflict,
      isSlotOccupied: (identitySlot) =>
        isAttemptIdentitySlotOccupied({
          assignmentId: row.assignment.id,
          db,
          identitySlot,
        }),
      maxAttempts: settings.maxAttempts,
      recoverReplay: () =>
        recoverAttemptSubmissionResponse({
          assignmentId: row.assignment.id,
          db,
          identity: submissionIdentity,
          orderedRuntimeItems,
          settings,
          submissionKey: data.submissionKey,
        }),
    }).catch(rethrowAssignmentSubmissionWriteError);
    if (persistence.type === 'replay') return persistence.replay;
    if (persistence.type === 'limit-reached') {
      throw new Error(m.assignment_api_error_attempt_limit_reached());
    }

    return buildAttemptSubmissionResponse({
      answers: evaluation.answers,
      attemptId: id,
      orderedRuntimeItems,
      previousAttemptCount: persistence.previousAttemptCount,
      result: evaluation.result,
      settings,
    });
  });

async function isAttemptIdentitySlotOccupied({
  assignmentId,
  db,
  identitySlot,
}: {
  assignmentId: string;
  db: ReturnType<typeof getDb>;
  identitySlot: {
    attemptNumber: number | null;
    identityKey: string | null;
  };
}) {
  if (
    identitySlot.attemptNumber === null ||
    identitySlot.identityKey === null
  ) {
    return false;
  }

  const [occupiedAttempt] = await db
    .select({ id: attempt.id })
    .from(attempt)
    .where(
      buildAttemptIdentitySlotWhere({
        assignmentId,
        attemptNumber: identitySlot.attemptNumber,
        identityKey: identitySlot.identityKey,
      })
    )
    .limit(1);

  return Boolean(occupiedAttempt);
}

async function recoverAttemptSubmissionResponse({
  assignmentId,
  db,
  identity,
  orderedRuntimeItems,
  settings,
  submissionKey,
}: {
  assignmentId: string;
  db: ReturnType<typeof getDb>;
  identity: {
    anonymousToken: string | null;
    studentName: string | null;
  };
  orderedRuntimeItems: RuntimeItem[];
  settings: AssignmentSettings;
  submissionKey: string;
}) {
  const [existingAttempt] = await db
    .select(buildAttemptSubmissionReplaySelect())
    .from(attempt)
    .where(buildAttemptSubmissionKeyWhere({ assignmentId, submissionKey }))
    .limit(1);

  if (!existingAttempt?.resultJson) return null;
  if (
    !doesAttemptSubmissionIdentityMatch({
      existing: existingAttempt,
      requested: identity,
    })
  ) {
    throw new Error(m.assignment_api_error_submission_retry_conflict());
  }

  const attemptCount = settings.maxAttempts
    ? await countPreviousIdentityAttempts({
        anonymousToken: identity.anonymousToken ?? '',
        assignmentId,
        db,
        studentName: identity.studentName ?? '',
      })
    : 1;

  return buildAttemptSubmissionResponse({
    answers: existingAttempt.answersJson.answers,
    attemptId: existingAttempt.id,
    orderedRuntimeItems,
    previousAttemptCount: Math.max(0, attemptCount - 1),
    result: existingAttempt.resultJson,
    settings,
  });
}

function buildAttemptSubmissionResponse({
  answers,
  attemptId,
  orderedRuntimeItems,
  previousAttemptCount,
  result,
  settings,
}: {
  answers: AttemptAnswer[];
  attemptId: string;
  orderedRuntimeItems: RuntimeItem[];
  previousAttemptCount: number;
  result: AttemptResult;
  settings: AssignmentSettings;
}) {
  const reviewSummaryView = buildPublicAttemptReviewSummaryView({
    answers,
    runtimeItems: orderedRuntimeItems,
    showCorrectAnswers: settings.showCorrectAnswers,
  });

  return {
    attemptUsage: buildAssignmentAttemptUsage({
      maxAttempts: settings.maxAttempts,
      previousAttemptCount,
    }),
    id: attemptId,
    reviewItems: reviewSummaryView.items,
    reviewSummary: reviewSummaryView.summary,
    result: buildPublicAttemptResult(result),
  };
}
