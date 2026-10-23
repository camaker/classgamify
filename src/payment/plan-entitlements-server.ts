import type { getDb } from '@/db';
import { activity, aiDraftUsage, assignment, payment } from '@/db/app.schema';
import { APP_ENTITY_ID_LENGTH } from '@/lib/entity-id';
import {
  buildPlanUsageMeter,
  formatPlanLimitErrorMessage,
  getAiDraftWindowStart,
  getPlanLimits,
  type PlanUsageKind,
  type PlanUsageMeter,
  type ResolvedEntitlementPlan,
  resolveEntitlementPlan,
  wouldExceedPlanLimit,
} from '@/payment/plan-entitlements';
import { buildPlanLimitReachedMessage } from '@/payment/plan-usage-view';
import { and, count, eq, gt, gte, isNull, ne, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Server-side plan enforcement. Every check reads the teacher's plan from the
 * payment table and counts owner-scoped rows before a write. Checks only run
 * when a teacher creates new work; student submissions and existing data are
 * never gated (docs/plan-value-design.md).
 */

type Db = ReturnType<typeof getDb>;

type PlanUsageSnapshot = {
  meters: Record<PlanUsageKind, PlanUsageMeter>;
  plan: ResolvedEntitlementPlan;
};

async function getEntitlementPlan(
  userId: string,
  { db, now = new Date() }: { db: Db; now?: Date }
): Promise<ResolvedEntitlementPlan> {
  const records = await db
    .select({
      cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
      paid: payment.paid,
      periodEnd: payment.periodEnd,
      priceId: payment.priceId,
      scene: payment.scene,
      status: payment.status,
      type: payment.type,
    })
    .from(payment)
    .where(and(eq(payment.userId, userId), eq(payment.paid, true)));

  return resolveEntitlementPlan(records, now);
}

async function countUsage(
  kind: PlanUsageKind,
  userId: string,
  db: Db,
  now: Date
): Promise<number> {
  if (kind === 'activities') {
    const [row] = await db
      .select({ value: count() })
      .from(activity)
      .where(
        and(eq(activity.ownerId, userId), ne(activity.visibility, 'archived'))
      );
    return row?.value ?? 0;
  }

  if (kind === 'openAssignments') {
    const [row] = await db
      .select({ value: count() })
      .from(assignment)
      .where(
        and(
          eq(assignment.ownerId, userId),
          eq(assignment.status, 'published'),
          or(isNull(assignment.expiresAt), gt(assignment.expiresAt, now))
        )
      );
    return row?.value ?? 0;
  }

  const [row] = await db
    .select({ value: count() })
    .from(aiDraftUsage)
    .where(
      and(
        eq(aiDraftUsage.userId, userId),
        gte(aiDraftUsage.createdAt, getAiDraftWindowStart(now))
      )
    );
  return row?.value ?? 0;
}

export async function getPlanUsageSnapshot(
  userId: string,
  { db, now = new Date() }: { db: Db; now?: Date }
): Promise<PlanUsageSnapshot> {
  const plan = await getEntitlementPlan(userId, { db, now });
  const limits = getPlanLimits(plan.planId);
  const [activities, openAssignments, aiDrafts] = await Promise.all([
    countUsage('activities', userId, db, now),
    countUsage('openAssignments', userId, db, now),
    countUsage('aiDrafts', userId, db, now),
  ]);

  return {
    meters: {
      activities: buildPlanUsageMeter({
        kind: 'activities',
        limit: limits.activities,
        used: activities,
      }),
      aiDrafts: buildPlanUsageMeter({
        kind: 'aiDrafts',
        limit: limits.aiDrafts,
        used: aiDrafts,
      }),
      openAssignments: buildPlanUsageMeter({
        kind: 'openAssignments',
        limit: limits.openAssignments,
        used: openAssignments,
      }),
    },
    plan,
  };
}

/**
 * Throws a plan-limit error when adding `adding` items of `kind` would go past
 * the teacher's plan limit. Call before the write it guards.
 */
export async function assertPlanAllows(
  kind: PlanUsageKind,
  userId: string,
  { adding = 1, db, now = new Date() }: { adding?: number; db: Db; now?: Date }
) {
  const plan = await getEntitlementPlan(userId, { db, now });
  const limit = getPlanLimits(plan.planId)[kind];
  if (limit === null) return plan;

  const used = await countUsage(kind, userId, db, now);
  if (wouldExceedPlanLimit({ adding, limit, used })) {
    throw new Error(
      formatPlanLimitErrorMessage(
        kind,
        buildPlanLimitReachedMessage({ kind, limit, planId: plan.planId })
      )
    );
  }
  return plan;
}

export async function recordAiDraftUsage(
  userId: string,
  { db, now = new Date() }: { db: Db; now?: Date }
) {
  await db.insert(aiDraftUsage).values({
    createdAt: now,
    id: nanoid(APP_ENTITY_ID_LENGTH.generated),
    userId,
  });
}
