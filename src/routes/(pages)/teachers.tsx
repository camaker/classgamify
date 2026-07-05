import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
import {
  buildTeachersPageViewModel,
  type TeachersPageHandoffView,
  type TeachersPageUseCaseId,
  type TeachersPageWorkflowId,
} from '@/pages/public-page-view';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconChartBar,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconShare3,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/teachers')({
  head: () => {
    const description = m.teachers_page_seo_description();
    const teacherPageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: m.teachers_page_seo_title(),
      description,
      audience: {
        '@type': 'Audience',
        audienceType: m.teachers_page_audience_type(),
      },
      provider: {
        '@type': 'Organization',
        name: websiteConfig.metadata?.name ?? m.site_name(),
      },
    };

    return {
      ...seo(Routes.Teachers, {
        title: `${m.teachers_page_seo_title()} | ${
          websiteConfig.metadata?.name
        }`,
        description,
      }),
      scripts: [jsonLdScript(teacherPageJsonLd)],
    };
  },
  component: TeachersPage,
});

function TeachersPage() {
  const pageView = buildTeachersPageViewModel();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="min-w-0 space-y-5">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconUsers className="size-3.5" />
              {pageView.hero.badgeLabel}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                {pageView.hero.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {pageView.hero.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={pageView.hero.primaryAction.to}
                aria-label={pageView.hero.primaryAction.ariaLabel}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                {pageView.hero.primaryAction.label}
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                to={pageView.hero.secondaryAction.to}
                aria-label={pageView.hero.secondaryAction.ariaLabel}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                {pageView.hero.secondaryAction.label}
              </Link>
            </div>
          </div>

          <section
            aria-label={pageView.templatePanel.ariaLabel}
            className="rounded-lg border bg-card p-5"
          >
            <h2 className="text-sm font-medium text-muted-foreground">
              {pageView.templatePanel.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageView.templatePanel.description}
            </p>
            <div className="mt-4 grid gap-2">
              {pageView.templatePanel.templates.map((template) => (
                <dl
                  aria-label={template.ariaLabel}
                  key={template.templateType}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                >
                  <dt className="text-sm font-medium">{template.name}</dt>
                  <dd className="text-right text-xs text-muted-foreground">
                    <span className="sr-only">
                      {pageView.templatePanel.classroomModeLabel}:{' '}
                    </span>
                    {template.classroomMode}
                  </dd>
                </dl>
              ))}
            </div>
          </section>
        </section>

        <section
          aria-label={pageView.workflowSection.ariaLabel}
          className="space-y-4"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">
              {pageView.workflowSection.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {pageView.workflowSection.description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pageView.workflow.map((item) => (
              <FeatureCard
                key={item.id}
                icon={teacherWorkflowIcons[item.id]}
                item={item}
              />
            ))}
          </div>
        </section>

        <section
          aria-label={pageView.schoolCta.ariaLabel}
          className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        >
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              {pageView.schoolCta.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageView.schoolCta.description}
            </p>
          </div>
          <Link
            to={pageView.schoolCta.action.to}
            aria-label={pageView.schoolCta.action.ariaLabel}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {pageView.schoolCta.action.label}
          </Link>
        </section>

        <TeachersPageHandoffPanel view={pageView.handoffView} />

        <section
          aria-label={pageView.useCaseSection.ariaLabel}
          className="space-y-4"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">
              {pageView.useCaseSection.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {pageView.useCaseSection.description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pageView.useCases.map((item) => (
              <FeatureCard
                key={item.id}
                icon={teacherUseCaseIcons[item.id]}
                item={item}
              />
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}

function TeachersPageHandoffPanel({ view }: { view: TeachersPageHandoffView }) {
  const titleId = 'teachers-page-product-loop-handoff-title';
  const descriptionId = 'teachers-page-product-loop-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="teachers-page-product-loop"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <div data-handoff-item={item.id} key={item.id}>
            <dt>{item.label}</dt>
            <dd>
              <output aria-label={item.ariaLabel}>{item.value}</output>
              <span>{item.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  item,
}: {
  icon: TablerIcon;
  item: {
    ariaLabel: string;
    description: string;
    title: string;
  };
}) {
  return (
    <article
      aria-label={item.ariaLabel}
      className="rounded-lg border bg-card p-5"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </article>
  );
}

const teacherUseCaseIcons = {
  classrooms: IconUsers,
  games: IconDeviceGamepad2,
  results: IconChartBar,
} satisfies Record<TeachersPageUseCaseId, TablerIcon>;

const teacherWorkflowIcons = {
  draft: IconSparkles,
  publish: IconLayoutGrid,
  share: IconShare3,
} satisfies Record<TeachersPageWorkflowId, TablerIcon>;
