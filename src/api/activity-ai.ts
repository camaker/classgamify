import {
  generateActivityDraftFromAi,
  generateActivityDraftInputSchema,
} from '@/activities/ai-draft';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';

export const generateActivityDraft = createServerFn({ method: 'POST' })
  .validator(generateActivityDraftInputSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data }) => generateActivityDraftFromAi(data));
