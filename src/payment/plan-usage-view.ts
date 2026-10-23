import { m } from '@/locale/paraglide/messages';
import type {
  EntitlementPlanId,
  EntitlementPlanState,
  PlanUsageKind,
  PlanUsageMeter,
} from '@/payment/plan-entitlements';

export function buildPlanLimitReachedMessage({
  kind,
  limit,
  planId,
}: {
  kind: PlanUsageKind;
  limit: number;
  planId: EntitlementPlanId;
}) {
  if (kind === 'activities') {
    return m.plan_limit_activities_reached({ limit });
  }
  if (kind === 'openAssignments') {
    return m.plan_limit_open_assignments_reached({ limit });
  }
  const message = m.plan_limit_ai_drafts_reached({ limit });
  return planId === 'free'
    ? `${message} ${m.plan_limit_upgrade_hint()}`
    : message;
}

export type PlanUsageMeterStatus = 'near' | 'ok' | 'reached';

export type PlanUsageMeterView = {
  ariaLabel: string;
  kind: PlanUsageKind;
  label: string;
  /** null when the plan has no limit for this meter. */
  limit: number | null;
  status: PlanUsageMeterStatus;
  statusLabel?: string;
  used: number;
  value: string;
};

type PlanUsageCardView = {
  manageBillingLabel?: string;
  meters: PlanUsageMeterView[];
  note: string;
  planLabel: string;
  showUpgrade: boolean;
  title: string;
  upgradeLabel: string;
};

const METER_ORDER: PlanUsageKind[] = [
  'activities',
  'openAssignments',
  'aiDrafts',
];

function getMeterLabel(kind: PlanUsageKind) {
  switch (kind) {
    case 'activities':
      return m.plan_usage_activities_label();
    case 'openAssignments':
      return m.plan_usage_open_assignments_label();
    case 'aiDrafts':
      return m.plan_usage_ai_drafts_label();
  }
}

export function getPlanUsageMeterStatus(
  meter: PlanUsageMeter
): PlanUsageMeterStatus {
  if (meter.limit === null) return 'ok';
  if (meter.reached) return 'reached';
  return meter.used / meter.limit >= 0.8 ? 'near' : 'ok';
}

function buildPlanUsageMeterView(meter: PlanUsageMeter): PlanUsageMeterView {
  const label = getMeterLabel(meter.kind);
  const value =
    meter.limit === null
      ? m.plan_usage_value_unlimited({ used: meter.used })
      : m.plan_usage_value_limited({ limit: meter.limit, used: meter.used });
  const status = getPlanUsageMeterStatus(meter);
  const statusLabel =
    status === 'reached'
      ? m.plan_usage_status_reached()
      : status === 'near'
        ? m.plan_usage_status_near()
        : undefined;

  return {
    ariaLabel: m.plan_usage_meter_aria({
      label,
      value: statusLabel ? `${value}, ${statusLabel}` : value,
    }),
    kind: meter.kind,
    label,
    limit: meter.limit,
    status,
    statusLabel,
    used: meter.used,
    value,
  };
}

function getPlanName(planId: EntitlementPlanId) {
  switch (planId) {
    case 'free':
      return m.pricing_plans_free_name();
    case 'pro':
      return m.pricing_plans_pro_name();
    case 'lifetime':
      return m.pricing_plans_lifetime_name();
  }
}

function getPlanNote(planId: EntitlementPlanId, state: EntitlementPlanState) {
  if (state === 'past-due') return m.plan_usage_note_past_due();
  if (state === 'cancel-scheduled') return m.plan_usage_note_cancel_scheduled();
  return planId === 'free'
    ? m.plan_usage_note_free()
    : m.plan_usage_note_paid();
}

export function buildPlanUsageCardView({
  meters,
  planId,
  state,
}: {
  meters: Record<PlanUsageKind, PlanUsageMeter>;
  planId: EntitlementPlanId;
  state: EntitlementPlanState;
}): PlanUsageCardView {
  return {
    manageBillingLabel:
      state === 'past-due' || state === 'cancel-scheduled'
        ? m.plan_usage_manage_plan()
        : undefined,
    meters: METER_ORDER.map((kind) => buildPlanUsageMeterView(meters[kind])),
    note: getPlanNote(planId, state),
    planLabel: m.plan_usage_current_plan({ plan: getPlanName(planId) }),
    showUpgrade: planId === 'free',
    title: m.plan_usage_title(),
    upgradeLabel: m.plan_usage_compare_plans(),
  };
}
