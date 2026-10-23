import {
  generateActivityDraftFromAi,
  generateActivityDraftInputSchema,
} from '@/activities/ai-draft';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import {
  releaseAiDraftReservationSafely,
  reserveAiDraftForUser,
} from '@/payment/plan-entitlements-runtime';
import { createServerFn } from '@tanstack/react-start';

export const generateActivityDraft = createServerFn({ method: 'POST' })
  .validator(generateActivityDraftInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    // Reserve atomically before calling the provider so parallel requests
    // cannot overrun the monthly allowance.
    const reservationId = await reserveAiDraftForUser(context.userId);
    let result: Awaited<ReturnType<typeof generateActivityDraftFromAi>>;
    try {
      result = await generateActivityDraftFromAi(data);
    } catch (error) {
      await releaseAiDraftReservationSafely(reservationId);
      throw error;
    }
    // Only drafts produced by the AI provider use the allowance; the offline
    // template fallback costs nothing, so its reservation is given back.
    if (result.provider !== 'workers-ai') {
      await releaseAiDraftReservationSafely(reservationId);
    }
    return result;
  });
