import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconListCheck,
  IconSparkles,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/roadmap')({
  head: () =>
    seo(Routes.Roadmap, {
      title: `Roadmap | ${websiteConfig.metadata?.name}`,
      description:
        'ClassGamify roadmap for templates, activity creation, assignments, student attempts, results, and AI-assisted remixing.',
    }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const columns = [
    {
      title: 'Live skeleton',
      icon: IconCheck,
      items: [
        'Activity, assignment, attempt schema',
        'Template catalog with six starter types',
        'Teacher dashboard entry points',
        'Public student play route shell',
      ],
    },
    {
      title: 'Next build pass',
      icon: IconDeviceGamepad2,
      items: [
        'Persist teacher-created activities',
        'Structured activity editor',
        'Interactive quiz and matching runners',
        'Attempt submission and result view',
      ],
    },
    {
      title: 'AI advantage',
      icon: IconSparkles,
      items: [
        'Generate activity content from lesson notes',
        'Remix one activity into multiple templates',
        'Differentiate by grade or difficulty',
        'Suggest reteach activities from results',
      ],
    },
  ];

  const principles = [
    {
      icon: IconLayoutGrid,
      title: 'Template-first',
      description:
        'New features must preserve the Wordwall-style loop: pick a template, edit content, publish, and track.',
    },
    {
      icon: IconListCheck,
      title: 'Assignment-aware',
      description:
        'Reusable activities and classroom delivery instances stay separate so teachers can reuse lessons cleanly.',
    },
    {
      icon: IconChartBar,
      title: 'Results before polish',
      description:
        'Even simple completion and score data should arrive early, because teachers need feedback from every assignment.',
    },
  ];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="space-y-5">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              Product roadmap
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Build the Wordwall-core loop first, then make AI the
                accelerator.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                ClassGamify starts with teacher-owned activities, a focused
                template catalog, public student play links, and basic results.
                AI creation plugs into this foundation next.
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
                to={Routes.Templates}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                Browse templates
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Current north star
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {'Create -> publish -> play -> results'}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Every implementation pass should make this loop more real for a
              teacher and a student.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <RoadmapColumn key={column.title} column={column} />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <PrincipleCard key={item.title} item={item} />
          ))}
        </section>
      </div>
    </Container>
  );
}

function RoadmapColumn({
  column,
}: {
  column: {
    icon: TablerIcon;
    items: string[];
    title: string;
  };
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
          <column.icon className="size-4" />
        </div>
        <h2 className="font-semibold">{column.title}</h2>
      </div>
      <ul className="mt-5 space-y-3">
        {column.items.map((item) => (
          <li
            key={item}
            className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-sm leading-6"
          >
            <IconCheck className="mt-1 size-4 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrincipleCard({
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
