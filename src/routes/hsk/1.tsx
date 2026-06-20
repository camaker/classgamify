import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/hsk/1')({
  head: () =>
    seo('/hsk/1', {
      title: 'Course practice moved | ClassGamify',
      description:
        'Legacy course-specific practice now points teachers toward ClassGamify classroom activity templates.',
      robots: 'noindex,follow',
    }),
  component: () => (
    <LegacyProductRoute
      title="Course-specific practice has been retired"
      description="ClassGamify now starts from teacher activities instead of fixed course pages. Use templates to build activities for any subject, grade band, or lesson."
      primaryHref={Routes.Create}
      primaryLabel="Create activity"
      secondaryHref={Routes.Templates}
      secondaryLabel="Browse templates"
    />
  ),
});
