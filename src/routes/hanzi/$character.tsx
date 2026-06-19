import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/hanzi/$character')({
  component: () => (
    <LegacyProductRoute
      title="Character detail pages are no longer the product"
      description="The new platform is organized around teacher-created activities, assignments, and student play links. Legacy character URLs now point teachers toward the ClassGamify creation flow."
      primaryHref={Routes.Create}
      primaryLabel="Create activity"
      secondaryHref={Routes.PlayDemo}
      secondaryLabel="Open student preview"
    />
  ),
});
