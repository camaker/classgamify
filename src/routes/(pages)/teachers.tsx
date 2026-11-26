import { getActivityTemplates } from '@/activities/catalog';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
import {
  buildTeachersPageViewModel,
  type TeachersPageUseCaseId,
  type TeachersPageWorkflowId,
} from '@/pages/public-page-view';
import { cn } from '@/lib/utils';
import { TEMPLATE_GUIDE_PATHS } from '@/pages/template-guide-paths';
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

        {getLocale() === 'en' ? <TemplateChooser /> : null}
      </div>
    </Container>
  );
}

const TEACHER_GUIDE_LINKS = [
  { href: '/classroom-quiz-game', label: 'Classroom quiz game' },
  { href: '/classroom-matching-game', label: 'Matching game maker' },
  { href: '/worksheets', label: 'Matching worksheet generator' },
  {
    href: '/review-game-for-classroom',
    label: 'Review game for the classroom',
  },
  { href: '/spelling-game-generator', label: 'Spelling game generator' },
] as const;

/** English-only chooser: which template fits which content and class format. */
function TemplateChooser() {
  const templates = getActivityTemplates();

  return (
    <section aria-labelledby="teachers-chooser-heading" className="space-y-4">
      <div>
        <h2
          id="teachers-chooser-heading"
          className="text-2xl font-semibold tracking-normal"
        >
          Pick a game by what you are teaching
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Every template starts from an editable example. Choose by the kind of
          content you have and how the class will play.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Classroom game templates by content and class format
          </caption>
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-semibold" scope="col">
                Template
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Best for
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Class format
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {templates.map((template) => (
              <tr key={template.type}>
                <th className="px-4 py-3 font-medium" scope="row">
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href={TEMPLATE_GUIDE_PATHS[template.type]}
                  >
                    {template.name}
                  </a>
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {template.bestFor}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {template.classroomMode === 'small-group'
                    ? 'Small group'
                    : 'Individual'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Looking for a specific activity? See the{' '}
        {TEACHER_GUIDE_LINKS.map((link, index) => (
          <span key={link.href}>
            {index > 0
              ? index === TEACHER_GUIDE_LINKS.length - 1
                ? ', or '
                : ', '
              : ''}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href={link.href}
            >
              {link.label.toLowerCase()}
            </a>
          </span>
        ))}
        .
      </p>
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
