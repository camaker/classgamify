import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { getBaseUrl, getCanonicalUrl } from '@/lib/urls';
import {
  graphJsonLd,
  jsonLdScript,
  organizationJsonLd,
} from '@/lib/structured-data';
import { seo } from '@/lib/seo';
import { getLocale, localeConfig } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/about')({
  head: () => {
    const title = m.nav_about_title();
    const description = m.teachers_page_seo_description();
    const url = getCanonicalUrl(Routes.About);
    const baseUrl = getBaseUrl().replace(/\/$/, '');
    return {
      ...seo(Routes.About, {
        title: `${title} | ${m.site_name()}`,
        description,
      }),
      scripts: [
        jsonLdScript(
          graphJsonLd([
            organizationJsonLd(),
            {
              '@type': 'AboutPage',
              '@id': `${url}#about`,
              name: title,
              description,
              url,
              inLanguage: localeConfig[getLocale()].hreflang,
              about: { '@id': `${baseUrl}/#organization` },
            },
          ])
        ),
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-4xl space-y-12 pb-16">
        <header className="space-y-5">
          <p className="font-semibold text-primary text-xs uppercase">
            {m.teachers_page_eyebrow()}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {m.nav_about_title()}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            {m.teachers_page_description()}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-normal">
            {m.teachers_page_workflow_section_title()}
          </h2>
          <p className="text-base leading-8 text-muted-foreground">
            {m.teachers_page_workflow_section_description()}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-normal">
            {m.teachers_page_use_case_section_title()}
          </h2>
          <p className="text-base leading-8 text-muted-foreground">
            {m.teachers_page_use_case_section_description()}
          </p>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-xl font-semibold">
            {m.teachers_page_school_cta_title()}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {m.teachers_page_school_cta_description()}
          </p>
          <Link
            to={Routes.Contact}
            className={cn(buttonVariants(), 'mt-4 w-full sm:w-auto')}
          >
            {m.teachers_page_school_cta()}
          </Link>
        </section>
      </div>
    </Container>
  );
}
