import {
  generateActivityDraftFromAi,
  generateActivityDraftInputSchema,
} from '@/activities/ai-draft';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import {
  assertPlanAllowsForUser,
  recordAiDraftUsageForUser,
} from '@/payment/plan-entitlements-runtime';
import { createServerFn } from '@tanstack/react-start';

export const generateActivityDraft = createServerFn({ method: 'POST' })
  .validator(generateActivityDraftInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    await assertPlanAllowsForUser('aiDrafts', context.userId);
    const result = await generateActivityDraftFromAi(data);
    // Only successful drafts use the monthly allowance.
    await recordAiDraftUsageForUser(context.userId);
    return result;
  });
