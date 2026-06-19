import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/hsk/1')({
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
