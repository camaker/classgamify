import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/hsk/1')({
  head: () =>
    seo('/hsk/1', {
      title: m.legacy_course_seo_title(),
      description: m.legacy_course_seo_description(),
      robots: 'noindex,follow',
    }),
  component: () => (
    <LegacyProductRoute
      title={m.legacy_course_title()}
      description={m.legacy_course_description()}
      primaryHref={Routes.Create}
      primaryLabel={m.legacy_primary_create_activity()}
      secondaryHref={Routes.Templates}
      secondaryLabel={m.legacy_secondary_browse_templates()}
    />
  ),
});
