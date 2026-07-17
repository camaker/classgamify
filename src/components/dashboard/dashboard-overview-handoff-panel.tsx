import type {
  DashboardOverviewHandoffItemView,
  DashboardOverviewHandoffView,
} from '@/dashboard/overview';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardOverviewHandoffPanelProps = {
  view: DashboardOverviewHandoffView;
};

export function DashboardOverviewHandoffPanel({
  view,
}: DashboardOverviewHandoffPanelProps) {
  const titleId = 'dashboard-overview-handoff-title';
  const descriptionId = 'dashboard-overview-handoff-description';

  return (
    <Card
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="dashboard-overview"
      data-handoff-scope={view.privacy.scope}
    >
      <CardHeader>
        <CardTitle>
          <h2 className="text-base font-semibold" id={titleId}>
            {view.title}
          </h2>
        </CardTitle>
        <p
          className="text-muted-foreground text-sm leading-6"
          id={descriptionId}
        >
          {view.description}
        </p>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {view.itemViews.map((itemView) => (
          <DashboardOverviewHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardOverviewHandoffItem({
  itemView,
}: {
  itemView: DashboardOverviewHandoffItemView;
}) {
  const labelId = `dashboard-overview-handoff-${itemView.id}-label`;
  const valueId = `dashboard-overview-handoff-${itemView.id}-value`;
  const descriptionId = `dashboard-overview-handoff-${itemView.id}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-label={itemView.ariaLabel}
      className="grid gap-1 rounded-md border bg-background p-3"
      data-handoff-item={itemView.id}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs" id={labelId}>
          {itemView.label}
        </p>
        {itemView.statusLabel ? (
          <Badge variant="secondary" className="rounded-md">
            {itemView.statusLabel}
          </Badge>
        ) : null}
      </div>
      <output
        aria-describedby={descriptionId}
        aria-label={itemView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        id={valueId}
      >
        <span className="font-semibold text-base">{itemView.value}</span>
      </output>
      <p className="text-muted-foreground text-xs leading-5" id={descriptionId}>
        {itemView.description}
      </p>
    </article>
  );
}
