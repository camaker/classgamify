import type { ActivityTemplateType } from '@/activities/types';

/**
 * Public guide URL for every template. Quiz and matching pairs have
 * hand-built guide routes; the rest render through `/templates/$template`.
 * Kept apart from the guide copy so links do not pull that copy into client
 * chunks. `src/seo/public-routes.ts` lists the same `/templates/*` slugs for
 * the sitemap; a unit test keeps the two in sync.
 */
export const TEMPLATE_GUIDE_PATHS = {
  quiz: '/classroom-quiz-game',
  'matching-pairs': '/classroom-matching-game',
  'match-up': '/templates/match-up',
  'line-match': '/templates/line-match',
  'group-sort': '/templates/group-sort',
  'fill-blank': '/templates/fill-blank',
  listening: '/templates/listening',
  'open-box': '/templates/open-box',
} as const satisfies Record<ActivityTemplateType, string>;
