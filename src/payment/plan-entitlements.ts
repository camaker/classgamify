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
};

export type EntitlementPlanState =
  | 'cancel-scheduled'
  | 'free'
  | 'lifetime'
  | 'past-due'
  | 'subscribed';

export type ResolvedEntitlementPlan = {
  /** When paid access ends, if it is known to end. */
  accessEndsAt?: Date;
  planId: EntitlementPlanId;
  state: EntitlementPlanState;
};

/**
 * Picks the best plan the payment history grants right now. Lifetime wins
 * over a subscription; any paid subscription grants Teacher Pro even if its
 * price id is no longer configured, so a price rotation never downgrades a
 * payer.
 */
export function resolveEntitlementPlan(
  records: EntitlementPaymentRecord[],
  now: Date = new Date()
): ResolvedEntitlementPlan {
  const paidRecords = records.filter((record) => record.paid);

  if (
    paidRecords.some(
      (record) =>
        record.type === PaymentTypes.ONE_TIME &&
        record.scene === PaymentScenes.LIFETIME &&
        record.status === 'completed'
    )
  ) {
    return { planId: 'lifetime', state: 'lifetime' };
  }

  let best: ResolvedEntitlementPlan | undefined;
  for (const record of paidRecords) {
    if (record.type !== PaymentTypes.SUBSCRIPTION) continue;
    const candidate = resolveSubscriptionRecord(record, now);
    if (!candidate) continue;
    if (!best || compareAccess(candidate, best) > 0) best = candidate;
  }

  return best ?? { planId: 'free', state: 'free' };
}

function resolveSubscriptionRecord(
  record: EntitlementPaymentRecord,
  now: Date
): ResolvedEntitlementPlan | undefined {
  const periodEnd = record.periodEnd ?? undefined;
  const nowMs = now.getTime();

  switch (record.status) {
    case 'active':
    case 'trialing':
      return record.cancelAtPeriodEnd && periodEnd
        ? { accessEndsAt: periodEnd, planId: 'pro', state: 'cancel-scheduled' }
        : { planId: 'pro', state: 'subscribed' };
    case 'past_due': {
      if (!periodEnd) return undefined;
      const graceEnd = new Date(
        periodEnd.getTime() + PAST_DUE_GRACE_DAYS * DAY_MS
      );
      return nowMs < graceEnd.getTime()
        ? { accessEndsAt: graceEnd, planId: 'pro', state: 'past-due' }
        : undefined;
    }
    case 'canceled':
      return periodEnd && nowMs < periodEnd.getTime()
        ? { accessEndsAt: periodEnd, planId: 'pro', state: 'cancel-scheduled' }
        : undefined;
    default:
      return undefined;
  }
}

/** Open-ended access beats access with an end date; later ends beat earlier. */
function compareAccess(
  left: ResolvedEntitlementPlan,
  right: ResolvedEntitlementPlan
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
