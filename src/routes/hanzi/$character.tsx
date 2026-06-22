import { createFileRoute } from '@tanstack/react-router';
import { LegacyProductRoute } from '@/components/activities/legacy-product-route';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/hanzi/$character')({
  head: ({ params }) =>
    seo(`/hanzi/${params.character}`, {
      title: m.legacy_character_seo_title(),
      description: m.legacy_character_seo_description(),
      robots: 'noindex,follow',
    }),
  component: () => (
    <LegacyProductRoute
      title={m.legacy_character_title()}
      description={m.legacy_character_description()}
      primaryHref={Routes.Create}
      primaryLabel={m.legacy_primary_create_activity()}
      secondaryHref={Routes.PlayDemo}
      secondaryLabel={m.legacy_secondary_open_student_preview()}
    />
  ),
});
