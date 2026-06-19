import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { activityTemplates } from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
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
    const description =
      'Plan game-based classroom activities, publish assignment links, and collect student results with ClassGamify.';
    const teacherPageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Teachers',
      description,
      audience: {
        '@type': 'Audience',
        audienceType: 'Teachers, tutors, and learning centers',
      },
      provider: {
        '@type': 'Organization',
        name: websiteConfig.metadata?.name ?? 'ClassGamify',
      },
    };

    return {
      ...seo(Routes.Teachers, {
        title: `Teachers | ${websiteConfig.metadata?.name}`,
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
      title: 'Start from lesson content',
      description:
        'Paste vocabulary, questions, examples, or worksheet prompts into one structured activity model.',
    },
    {
      icon: IconLayoutGrid,
      title: 'Choose a game template',
      description:
        'Render the same content as quiz, match-up, group sort, fill-blank, listening, matching pairs, or open-box play.',
    },
    {
      icon: IconShare3,
      title: 'Publish an assignment',
      description:
        'Share a public student link while keeping the reusable activity in the teacher library.',
    },
  ];

  const useCases = [
    {
      icon: IconUsers,
      title: 'Classroom homework',
      description:
        'Assign short games after class and see which students completed the activity.',
    },
    {
      icon: IconDeviceGamepad2,
      title: 'Live classroom play',
      description:
        'Use open-box, listening, sorting, and matching activities for warmups, review rounds, or small groups.',
    },
    {
      icon: IconChartBar,
      title: 'Result follow-up',
      description:
        'Use completions and scores to decide which items need reteaching or another activity.',
    },
  ];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="min-w-0 space-y-5">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconUsers className="size-3.5" />
              Teachers and tutoring teams
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Build repeatable game-based assignments from the lessons you
                already teach.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                ClassGamify is being rebuilt for the real Wordwall-style loop:
                create an activity, switch templates, publish a share link, and
                review student results.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                Create activity
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                to={Routes.ContactClassroom}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                Talk to us
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              First template families
            </p>
            <div className="mt-4 grid gap-2">
              {activityTemplates.map((template) => (
                <div
                  key={template.type}
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
          {workflow.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              Need a school or learning-center workflow?
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Multi-teacher use needs thoughtful decisions about student names,
              result retention, template sharing, and classroom permissions.
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            Contact us
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
