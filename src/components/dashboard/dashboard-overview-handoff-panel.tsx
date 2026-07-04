import type { DashboardOverviewHandoffView } from '@/dashboard/overview';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardOverviewHandoffPanelProps = {
  view: DashboardOverviewHandoffView;
};

export function DashboardOverviewHandoffPanel({
  view,
}: DashboardOverviewHandoffPanelProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          <h2 className="text-base font-semibold">{view.title}</h2>
        </CardTitle>
        <p className="text-muted-foreground text-sm leading-6">
          {view.description}
        </p>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {view.itemViews.map((itemView) => (
          <article
            aria-label={itemView.ariaLabel}
            className="grid gap-1 rounded-md border bg-background p-3"
            key={itemView.id}
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">{itemView.label}</p>
              {itemView.statusLabel ? (
                <Badge variant="secondary" className="rounded-md">
                  {itemView.statusLabel}
                </Badge>
              ) : null}
            </div>
            <output aria-label={itemView.ariaLabel}>
              <span className="font-semibold text-base">{itemView.value}</span>
            </output>
            <p className="text-muted-foreground text-xs leading-5">
              {itemView.description}
            </p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
