import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  activityTemplates,
  formatActivityTemplateClassroomMode,
} from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
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
  const workflow = [
    {
      icon: IconSparkles,
      title: m.teachers_page_workflow_0_title(),
      description: m.teachers_page_workflow_0_description(),
    },
    {
      icon: IconLayoutGrid,
      title: m.teachers_page_workflow_1_title(),
      description: m.teachers_page_workflow_1_description(),
    },
    {
      icon: IconShare3,
      title: m.teachers_page_workflow_2_title(),
      description: m.teachers_page_workflow_2_description(),
    },
  ];

  const useCases = [
    {
      icon: IconUsers,
      title: m.teachers_page_use_case_0_title(),
      description: m.teachers_page_use_case_0_description(),
    },
    {
      icon: IconDeviceGamepad2,
      title: m.teachers_page_use_case_1_title(),
      description: m.teachers_page_use_case_1_description(),
    },
    {
      icon: IconChartBar,
      title: m.teachers_page_use_case_2_title(),
      description: m.teachers_page_use_case_2_description(),
    },
  ];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="min-w-0 space-y-5">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconUsers className="size-3.5" />
              {m.teachers_page_eyebrow()}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                {m.teachers_page_title()}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {m.teachers_page_description()}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                {m.teachers_page_primary_cta()}
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                to={Routes.ContactClassroom}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                {m.teachers_page_secondary_cta()}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              {m.teachers_page_template_panel_title()}
            </p>
            <div className="mt-4 grid gap-2">
              {activityTemplates.map((template) => (
                <div
                  key={template.type}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                >
                  <span className="text-sm font-medium">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatActivityTemplateClassroomMode(
                      template.classroomMode
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {workflow.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              {m.teachers_page_school_cta_title()}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {m.teachers_page_school_cta_description()}
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {m.teachers_page_school_cta()}
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {useCases.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </section>
      </div>
    </Container>
  );
}

function FeatureCard({
  item,
}: {
  item: {
    description: string;
    icon: TablerIcon;
    title: string;
  };
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <item.icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </div>
  );
}
