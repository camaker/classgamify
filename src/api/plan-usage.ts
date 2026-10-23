import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { getPlanUsageSnapshotForUser } from '@/payment/plan-entitlements-runtime';
import { createServerFn } from '@tanstack/react-start';

/** Current plan and usage meters for the signed-in teacher. */
export const getPlanUsage = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    const snapshot = await getPlanUsageSnapshotForUser(context.userId);
    return {
      meters: snapshot.meters,
      planId: snapshot.plan.planId,
      state: snapshot.plan.state,
    };
  });
