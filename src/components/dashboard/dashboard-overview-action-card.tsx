import type {
  DashboardOverviewActionCard as DashboardOverviewActionCardView,
  DashboardOverviewActionCardId,
} from '@/dashboard/overview';
import { Routes } from '@/lib/routes';
import {
  IconDeviceGamepad2,
  IconListCheck,
  IconPlayerPlay,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type DashboardOverviewActionCardProps = {
  card: DashboardOverviewActionCardView;
};

export function DashboardOverviewActionCard({
  card,
}: DashboardOverviewActionCardProps) {
  const Icon = dashboardActionIcons[card.id];

  return (
    <Link
      to={dashboardActionHrefs[card.id]}
      className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{card.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {card.description}
      </p>
      <span className="mt-4 inline-flex text-sm font-medium text-primary">
        {card.cta}
      </span>
    </Link>
  );
}

const dashboardActionIcons: Record<DashboardOverviewActionCardId, TablerIcon> =
  {
    activities: IconDeviceGamepad2,
    assignments: IconListCheck,
    'student-preview': IconPlayerPlay,
  };

const dashboardActionHrefs: Record<DashboardOverviewActionCardId, string> = {
  activities: Routes.DashboardActivities,
  assignments: Routes.DashboardAssignments,
  'student-preview': Routes.PlayDemo,
};
