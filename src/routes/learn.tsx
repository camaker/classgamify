import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/learn')({
  head: () =>
    seo('/learn', {
      title: 'Learning path moved | ClassGamify',
      description:
        'Legacy learning paths now point teachers toward ClassGamify activities, templates, assignments, and student play links.',
      robots: 'noindex,follow',
    }),
  component: () => (
    <LegacyProductRoute
      title="The old learning path has moved"
      description="ClassGamify is now organized around reusable classroom activities, game templates, assignments, and student play links."
      primaryHref={Routes.Create}
      primaryLabel="Create activity"
      secondaryHref={Routes.Templates}
      secondaryLabel="Browse templates"
    />
  ),
});
