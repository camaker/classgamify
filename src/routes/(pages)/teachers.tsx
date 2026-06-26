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
                to={Routes.Create}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                {pageView.hero.primaryActionLabel}
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                to={Routes.ContactClassroom}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                {pageView.hero.secondaryActionLabel}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              {pageView.templatePanel.title}
            </p>
            <div className="mt-4 grid gap-2">
              {pageView.templatePanel.templates.map((template) => (
                <div
                  key={template.templateType}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                >
                  <span className="text-sm font-medium">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {template.classroomMode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pageView.workflow.map((item) => (
            <FeatureCard
              key={item.id}
              icon={teacherWorkflowIcons[item.id]}
              item={item}
            />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              {pageView.schoolCta.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageView.schoolCta.description}
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {pageView.schoolCta.label}
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pageView.useCases.map((item) => (
            <FeatureCard
              key={item.id}
              icon={teacherUseCaseIcons[item.id]}
              item={item}
            />
          ))}
        </section>
      </div>
    </Container>
  );
}

function FeatureCard({
  icon: Icon,
  item,
}: {
  icon: TablerIcon;
  item: {
    description: string;
    title: string;
  };
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </div>
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
