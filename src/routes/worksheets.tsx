import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/worksheets')({
  component: () => (
    <LegacyProductRoute
      title="Worksheets are becoming activity assignments"
      description="The new ClassGamify skeleton keeps printable and fill-in practice in the broader assignment model, alongside quiz, matching, sorting, and other game templates."
      primaryHref={Routes.Templates}
      primaryLabel="View templates"
      secondaryHref={Routes.PlayDemo}
      secondaryLabel="Open student preview"
    />
  ),
});
