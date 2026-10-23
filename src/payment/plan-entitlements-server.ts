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
import { and, count, eq, gt, gte, isNull, ne, or, sql } from 'drizzle-orm';
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
      updatedAt: payment.updatedAt,
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

/**
 * Atomically reserves one AI draft from this month's allowance before the
 * provider is called. The insert only happens while the monthly count is
 * below the limit, in a single statement, so parallel requests cannot
 * overrun the cap. Returns the reservation id; call `releaseAiDraftReservation`
 * when the draft did not use the provider.
 */
export async function reserveAiDraft(
  userId: string,
  { db, now = new Date() }: { db: Db; now?: Date }
): Promise<string> {
  const plan = await getEntitlementPlan(userId, { db, now });
  const limit = getPlanLimits(plan.planId).aiDrafts;
  const id = nanoid(APP_ENTITY_ID_LENGTH.generated);

  if (limit === null) {
    await db.insert(aiDraftUsage).values({ createdAt: now, id, userId });
    return id;
  }

  const windowStart = getAiDraftWindowStart(now).getTime();
  await db.run(sql`
    insert into ${aiDraftUsage} (id, user_id, created_at)
    select ${id}, ${userId}, ${now.getTime()}
    where (
      select count(*) from ${aiDraftUsage}
      where user_id = ${userId} and created_at >= ${windowStart}
    ) < ${limit}
  `);
  const [reserved] = await db
    .select({ id: aiDraftUsage.id })
    .from(aiDraftUsage)
    .where(eq(aiDraftUsage.id, id))
    .limit(1);

  if (!reserved) {
    throw new Error(
      formatPlanLimitErrorMessage(
        'aiDrafts',
        buildPlanLimitReachedMessage({
          kind: 'aiDrafts',
          limit,
          planId: plan.planId,
        })
      )
    );
  }
  return id;
}

export async function releaseAiDraftReservation(
  reservationId: string,
  { db }: { db: Db }
) {
  await db.delete(aiDraftUsage).where(eq(aiDraftUsage.id, reservationId));
}
