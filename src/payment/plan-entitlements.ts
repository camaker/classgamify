import type { PaymentStatus } from '@/payment/types';
import { PaymentScenes, PaymentTypes } from '@/payment/types';

/**
 * Plan entitlements: which plan a teacher is on and what each plan allows.
 *
 * This module is pure and safe to import on the client. The server-side
 * checks live in `src/payment/plan-entitlements-server.ts`. Design and
 * rationale: docs/plan-value-design.md.
 */

export type EntitlementPlanId = 'free' | 'pro' | 'lifetime';

export type PlanUsageKind = 'activities' | 'aiDrafts' | 'openAssignments';

/** `null` means no limit. */
type PlanLimits = Record<PlanUsageKind, number | null>;

export const PLAN_LIMITS = {
  free: { activities: 15, aiDrafts: 10, openAssignments: 3 },
  pro: { activities: null, aiDrafts: 300, openAssignments: null },
  lifetime: { activities: null, aiDrafts: 300, openAssignments: null },
} as const satisfies Record<EntitlementPlanId, PlanLimits>;

/** Message parameters for copy that quotes the enforced plan limits. */
export function getPlanLimitCopyParams() {
  return {
    activities: PLAN_LIMITS.free.activities,
    aiDrafts: PLAN_LIMITS.free.aiDrafts,
    openAssignments: PLAN_LIMITS.free.openAssignments,
    paidAiDrafts: PLAN_LIMITS.pro.aiDrafts,
  };
}

/** Days a past-due subscription keeps Teacher Pro after its period ends. */
export const PAST_DUE_GRACE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export type EntitlementPaymentRecord = {
  cancelAtPeriodEnd?: boolean | null;
  paid: boolean;
  periodEnd?: Date | null;
  priceId: string;
  scene?: string | null;
  status: PaymentStatus | string;
  type: string;
  /**
   * Last webhook write for the record. For a past-due subscription this is
   * when the failed payment was recorded, which anchors the grace window
   * even if the provider later moves `periodEnd`.
   */
  updatedAt?: Date | null;
};

export type EntitlementPlanState =
  | 'cancel-scheduled'
  | 'free'
  | 'lifetime'
  | 'past-due'
  | 'subscribed';

export type ResolvedEntitlementPlan<
  TRecord extends EntitlementPaymentRecord = EntitlementPaymentRecord,
> = {
  /** When paid access ends, if it is known to end. */
  accessEndsAt?: Date;
  planId: EntitlementPlanId;
  /** The payment record that grants the plan, when one does. */
  record?: TRecord;
  state: EntitlementPlanState;
};

/**
 * Picks the best plan the payment history grants right now. Lifetime wins
 * over a subscription; any paid subscription grants Teacher Pro even if its
 * price id is no longer configured, so a price rotation never downgrades a
 * payer. Billing settings and plan enforcement both use this resolver.
 */
export function resolveEntitlementPlan<
  TRecord extends EntitlementPaymentRecord,
>(
  records: TRecord[],
  now: Date = new Date()
): ResolvedEntitlementPlan<TRecord> {
  const paidRecords = records.filter((record) => record.paid);

  const lifetime = paidRecords.find(
    (record) =>
      record.type === PaymentTypes.ONE_TIME &&
      record.scene === PaymentScenes.LIFETIME &&
      record.status === 'completed'
  );
  if (lifetime) {
    return { planId: 'lifetime', record: lifetime, state: 'lifetime' };
  }

  let best: ResolvedEntitlementPlan<TRecord> | undefined;
  for (const record of paidRecords) {
    if (record.type !== PaymentTypes.SUBSCRIPTION) continue;
    const candidate = resolveSubscriptionRecord(record, now);
    if (!candidate) continue;
    if (!best || compareAccess(candidate, best) > 0) best = candidate;
  }

  return best ?? { planId: 'free', state: 'free' };
}

function resolveSubscriptionRecord<TRecord extends EntitlementPaymentRecord>(
  record: TRecord,
  now: Date
): ResolvedEntitlementPlan<TRecord> | undefined {
  const periodEnd = record.periodEnd ?? undefined;
  const nowMs = now.getTime();

  switch (record.status) {
    case 'active':
    case 'trialing':
      if (!record.cancelAtPeriodEnd) {
        return { planId: 'pro', record, state: 'subscribed' };
      }
      // A scheduled cancellation whose period already ended means a missed
      // webhook; do not keep granting Teacher Pro.
      return periodEnd && nowMs < periodEnd.getTime()
        ? {
            accessEndsAt: periodEnd,
            planId: 'pro',
            record,
            state: 'cancel-scheduled',
          }
        : undefined;
    case 'past_due': {
      const graceStart = getPastDueGraceStart(record);
      if (!graceStart) return undefined;
      const graceEnd = new Date(
        graceStart.getTime() + PAST_DUE_GRACE_DAYS * DAY_MS
      );
      return nowMs < graceEnd.getTime()
        ? { accessEndsAt: graceEnd, planId: 'pro', record, state: 'past-due' }
        : undefined;
    }
    case 'canceled':
      // Only a cancellation scheduled for period end keeps access; an
      // immediate cancellation or refund ends it now.
      return record.cancelAtPeriodEnd &&
        periodEnd &&
        nowMs < periodEnd.getTime()
        ? {
            accessEndsAt: periodEnd,
            planId: 'pro',
            record,
            state: 'cancel-scheduled',
          }
        : undefined;
    default:
      return undefined;
  }
}

/**
 * The grace window starts at the earlier of the period end and the moment
 * the failed payment was recorded, so a provider that pushes `periodEnd`
 * forward during retries cannot stretch the grace window.
 */
function getPastDueGraceStart(record: EntitlementPaymentRecord) {
  const candidates = [record.periodEnd, record.updatedAt].filter(
    (value): value is Date => value instanceof Date
  );
  if (candidates.length === 0) return undefined;
  return new Date(Math.min(...candidates.map((value) => value.getTime())));
}

/** Open-ended access beats access with an end date; later ends beat earlier. */
function compareAccess(
  left: { accessEndsAt?: Date },
  right: { accessEndsAt?: Date }
) {
  if (!left.accessEndsAt && right.accessEndsAt) return 1;
  if (left.accessEndsAt && !right.accessEndsAt) return -1;
  return (
    (left.accessEndsAt?.getTime() ?? 0) - (right.accessEndsAt?.getTime() ?? 0)
  );
}

export function getPlanLimits(planId: EntitlementPlanId): PlanLimits {
  return PLAN_LIMITS[planId];
}

/** Start of the current AI draft window: the first day of the UTC month. */
export function getAiDraftWindowStart(now: Date = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export type PlanUsageMeter = {
  kind: PlanUsageKind;
  limit: number | null;
  reached: boolean;
  remaining: number | null;
  used: number;
};

export function buildPlanUsageMeter({
  kind,
  limit,
  used,
}: {
  kind: PlanUsageKind;
  limit: number | null;
  used: number;
}): PlanUsageMeter {
  const safeUsed = Math.max(0, Math.floor(used));
  if (limit === null) {
    return { kind, limit, reached: false, remaining: null, used: safeUsed };
  }
  return {
    kind,
    limit,
    reached: safeUsed >= limit,
    remaining: Math.max(0, limit - safeUsed),
    used: safeUsed,
  };
}

/** True when `adding` more items would go past the limit. */
export function wouldExceedPlanLimit({
  adding = 1,
  limit,
  used,
}: {
  adding?: number;
  limit: number | null;
  used: number;
}) {
  return limit !== null && used + adding > limit;
}

/**
 * Plan-limit errors cross the server-function boundary as plain messages, so
 * they carry a short machine-readable prefix the client strips before showing
 * the localized text with an upgrade action.
 */
const PLAN_LIMIT_ERROR_PATTERN =
  /^\[plan-limit:(activities|aiDrafts|openAssignments)\] ([\s\S]+)$/;

export function formatPlanLimitErrorMessage(
  kind: PlanUsageKind,
  message: string
) {
  return `[plan-limit:${kind}] ${message}`;
}

export function parsePlanLimitError(
  error: unknown
): { kind: PlanUsageKind; message: string } | undefined {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : undefined;
  const match = message?.match(PLAN_LIMIT_ERROR_PATTERN);
  if (!match) return undefined;
  return { kind: match[1] as PlanUsageKind, message: match[2] };
}
