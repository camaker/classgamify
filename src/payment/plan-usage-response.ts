import { z } from 'zod';
import type {
  EntitlementPlanId,
  EntitlementPlanState,
  PlanUsageKind,
  PlanUsageMeter,
} from '@/payment/plan-entitlements';

type PlanUsageResponse = {
  meters: Record<PlanUsageKind, PlanUsageMeter>;
  planId: EntitlementPlanId;
  state: EntitlementPlanState;
};

const meterFields = {
  limit: z.number().nonnegative().nullable(),
  reached: z.boolean(),
  remaining: z.number().nonnegative().nullable(),
  used: z.number().nonnegative(),
};
const planUsageResponseSchema: z.ZodType<PlanUsageResponse> = z.object({
  meters: z.object({
    activities: z.object({ ...meterFields, kind: z.literal('activities') }),
    aiDrafts: z.object({ ...meterFields, kind: z.literal('aiDrafts') }),
    openAssignments: z.object({
      ...meterFields,
      kind: z.literal('openAssignments'),
    }),
  }),
  planId: z.enum(['free', 'pro', 'lifetime']),
  state: z.enum([
    'cancel-scheduled',
    'free',
    'lifetime',
    'past-due',
    'subscribed',
  ]),
});

/** ServerFn middleware can return an auth error body instead of usage data. */
export function parsePlanUsageResponse(value: unknown): PlanUsageResponse {
  return planUsageResponseSchema.parse(value);
}
