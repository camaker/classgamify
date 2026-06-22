import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
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
      title: `${m.roadmap_title()} | ${websiteConfig.metadata?.name}`,
      description: m.roadmap_description(),
    }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const snapshots = [
    {
      title: m.roadmap_snapshot_live_title(),
      description: m.roadmap_snapshot_live_description(),
    },
    {
      title: m.roadmap_snapshot_loop_title(),
      description: m.roadmap_snapshot_loop_description(),
    },
    {
      title: m.roadmap_snapshot_expansion_title(),
      description: m.roadmap_snapshot_expansion_description(),
    },
  ];

  const columns = [
    {
      title: m.roadmap_columns_done(),
      description: m.roadmap_columns_done_description(),
      status: m.roadmap_status_available(),
      icon: IconCheck,
      items: [
        {
          title: m.roadmap_board_tasks_done_0_title(),
          description: m.roadmap_board_tasks_done_0_description(),
        },
        {
          title: m.roadmap_board_tasks_done_1_title(),
          description: m.roadmap_board_tasks_done_1_description(),
        },
      ],
    },
    {
      title: m.roadmap_columns_in_progress(),
      description: m.roadmap_columns_in_progress_description(),
      status: m.roadmap_status_improving(),
      icon: IconDeviceGamepad2,
      items: [
        {
          title: m.roadmap_board_tasks_in_progress_0_title(),
          description: m.roadmap_board_tasks_in_progress_0_description(),
        },
        {
          title: m.roadmap_board_tasks_in_progress_1_title(),
          description: m.roadmap_board_tasks_in_progress_1_description(),
        },
      ],
    },
    {
      title: m.roadmap_columns_backlog(),
      description: m.roadmap_columns_backlog_description(),
      status: m.roadmap_status_exploring(),
      icon: IconSparkles,
      items: [
        {
          title: m.roadmap_board_tasks_backlog_0_title(),
          description: m.roadmap_board_tasks_backlog_0_description(),
        },
        {
          title: m.roadmap_board_tasks_backlog_1_title(),
          description: m.roadmap_board_tasks_backlog_1_description(),
        },
        {
          title: m.roadmap_board_tasks_backlog_2_title(),
          description: m.roadmap_board_tasks_backlog_2_description(),
        },
      ],
    },
  ];

  const principles = [
    {
      icon: IconLayoutGrid,
      title: m.roadmap_principle_focus_title(),
      description: m.roadmap_principle_focus_description(),
    },
    {
      icon: IconListCheck,
      title: m.roadmap_principle_learning_title(),
      description: m.roadmap_principle_learning_description(),
    },
    {
      icon: IconChartBar,
      title: m.roadmap_validation_item_workflow_title(),
      description: m.roadmap_validation_item_workflow_description(),
    },
  ];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="space-y-5">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              {m.roadmap_eyebrow()}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                {m.roadmap_title()}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {m.roadmap_subtitle()}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                {m.roadmap_primary_cta()}
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                to={Routes.Templates}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                {m.roadmap_secondary_cta()}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <div className="space-y-4">
              {snapshots.map((snapshot, index) => (
                <div
                  key={snapshot.title}
                  className={cn(index > 0 && 'border-t pt-4')}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {snapshot.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {snapshot.description}
                  </p>
                </div>
              ))}
            </div>
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

        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">
              {m.roadmap_validation_eyebrow()}
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {m.roadmap_validation_title()}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {m.roadmap_validation_description()}
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {m.roadmap_feedback_cta()}
          </Link>
        </section>
      </div>
    </Container>
  );
}

function RoadmapColumn({
  column,
}: {
  column: {
    description: string;
    icon: TablerIcon;
    items: {
      description: string;
      title: string;
    }[];
    status: string;
    title: string;
  };
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
            <column.icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold">{column.title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {column.description}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-md">
          {column.status}
        </Badge>
      </div>
      <ul className="mt-5 space-y-3">
        {column.items.map((item) => (
          <li
            key={item.title}
            className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-sm leading-6"
          >
            <IconCheck className="mt-1 size-4 text-primary" />
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="mt-1 block text-muted-foreground">
                {item.description}
              </span>
            </span>
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
