import Container from '@/components/layout/container';
import { TemplateDirectoryCard } from '@/components/activities/template-directory-card';
import { Badge } from '@/components/ui/badge';
import { buildTemplatesPageViewModel } from '@/activities/entry-page-view';
import { websiteConfig } from '@/config/website';
import { getPathWithLocale } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import { seo } from '@/lib/seo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTemplateNamesByRequirement } from '@/pages/home-guide-view';
import { IconLayoutGrid, IconPlayerPlay, IconPlus } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/templates')({
  head: () =>
    seo('/templates', {
      title: `${m.templates_page_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.templates_page_seo_description(),
    }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const pageView = buildTemplatesPageViewModel();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconLayoutGrid className="size-3.5" />
            {pageView.hero.badgeLabel}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {pageView.hero.title}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {pageView.hero.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              aria-label={pageView.hero.createAction.ariaLabel}
              to={getPathWithLocale(pageView.hero.createAction.to)}
              search={pageView.hero.createAction.search}
              className={cn(buttonVariants(), 'w-fit')}
            >
              <IconPlus className="size-4" />
              {pageView.hero.createAction.label}
            </Link>
            <Link
              aria-label={pageView.hero.studentPreviewAction.ariaLabel}
              to={pageView.hero.studentPreviewAction.to}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-fit bg-background'
              )}
            >
              <IconPlayerPlay className="size-4" />
              {pageView.hero.studentPreviewAction.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageView.cards.map((template) => (
            <TemplateDirectoryCard
              key={template.template}
              template={template}
            />
          ))}
        </div>

        <section
          aria-labelledby="templates-choose-heading"
          className="space-y-5 border-t pt-10"
        >
          <div className="max-w-3xl space-y-2">
            <h2
              id="templates-choose-heading"
              className="text-2xl font-semibold"
            >
              {m.templates_page_choose_title()}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.templates_page_choose_description()}
            </p>
          </div>
          <dl className="grid gap-4 md:grid-cols-3">
            {chooseByContent().map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-5">
                <dt className="font-semibold">{item.title}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{pageView.footer.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {pageView.footer.description}
              </p>
            </div>
            <Link
              aria-label={pageView.footer.createAction.ariaLabel}
              to={getPathWithLocale(pageView.footer.createAction.to)}
              className={cn(buttonVariants(), 'w-fit')}
            >
              <IconPlus className="size-4" />
              {pageView.footer.createAction.label}
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

function chooseByContent() {
  return [
    {
      id: 'questions',
      title: m.templates_page_choose_questions_title(),
      description: m.templates_page_choose_questions_description({
        templates: getTemplateNamesByRequirement('questions'),
      }),
    },
    {
      id: 'pairs',
      title: m.templates_page_choose_pairs_title(),
      description: m.templates_page_choose_pairs_description({
        templates: getTemplateNamesByRequirement('pairs'),
      }),
    },
    {
      id: 'groups',
      title: m.templates_page_choose_groups_title(),
      description: m.templates_page_choose_groups_description({
        templates: getTemplateNamesByRequirement('groups'),
      }),
    },
  ];
}
