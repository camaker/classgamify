import {
  type EntitlementPaymentRecord,
  resolveEntitlementPlan,
} from '@/payment/plan-entitlements';
import type {
  PaymentStatus,
  PlanInterval,
  PricePlan,
  Subscription,
} from '@/payment/types';

type BillingPaymentRecord = EntitlementPaymentRecord & {
  createdAt: Date;
  customerId: string;
  id: string;
  interval?: string | null;
  periodStart?: Date | null;
  subscriptionId?: string | null;
  trialEnd?: Date | null;
  trialStart?: Date | null;
};

type CurrentBillingPlan = {
  currentPlan: PricePlan | null;
  /**
   * True when the teacher has any billing relationship (a customer id or a
   * past payment), so the hosted billing portal is always reachable, even
   * after a subscription ended.
   */
  hasBillingAccount: boolean;
  subscription: Subscription | null;
};

/**
 * Billing settings use the same plan resolver as plan enforcement, so a
 * past-due subscription in its grace window, a scheduled cancellation, or a
 * subscription on a retired price id shows the plan the teacher actually has.
 */
export function resolveCurrentBillingPlan({
  customerId,
  now = new Date(),
  plans,
  records,
}: {
  customerId?: string | null;
  now?: Date;
  plans: PricePlan[];
  records: BillingPaymentRecord[];
}): CurrentBillingPlan {
  const resolved = resolveEntitlementPlan(records, now);
  const freePlan = plans.find((plan) => plan.isFree && !plan.disabled) ?? null;
  const currentPlan =
    resolved.planId === 'free'
      ? freePlan
      : (plans.find((plan) => plan.id === resolved.planId) ?? null);
  const record = resolved.record;
  const subscription: Subscription | null =
    resolved.planId === 'pro' && record
      ? {
          cancelAtPeriodEnd:
            resolved.state === 'cancel-scheduled' ||
            Boolean(record.cancelAtPeriodEnd),
          createdAt: record.createdAt,
          currentPeriodEnd: record.periodEnd ?? undefined,
          currentPeriodStart: record.periodStart ?? undefined,
          customerId: record.customerId,
          id: record.id,
          interval: (record.interval ?? undefined) as PlanInterval | undefined,
          priceId: record.priceId,
          status: record.status as PaymentStatus,
          trialEndDate: record.trialEnd ?? undefined,
          trialStartDate: record.trialStart ?? undefined,
          type: 'subscription',
        }
      : null;

  return {
    currentPlan,
    hasBillingAccount:
      Boolean(customerId) ||
      records.some((item) => Boolean(item.customerId || item.subscriptionId)),
    subscription,
  };
}
