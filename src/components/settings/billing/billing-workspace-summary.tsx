import type {
  SettingsBillingWorkspaceHandoffItemView,
  SettingsBillingWorkspaceHandoffView,
  SettingsBillingWorkspaceSummaryItemView,
  SettingsBillingWorkspaceSummaryView,
} from '@/settings/billing-view';
import { Badge } from '@/components/ui/badge';

type BillingWorkspaceSummaryProps = {
  view: SettingsBillingWorkspaceSummaryView;
};

export function BillingWorkspaceSummary({
  view,
}: BillingWorkspaceSummaryProps) {
  return (
    <section
      aria-label={view.ariaLabel}
      className="grid gap-3 rounded-lg border bg-muted/20 p-4"
    >
      <div>
        <h2 className="font-semibold text-sm">{view.title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{view.description}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {view.itemViews.map((itemView) => (
          <BillingWorkspaceSummaryItem itemView={itemView} key={itemView.id} />
        ))}
      </ul>
      <BillingWorkspaceHandoff handoffView={view.handoffView} />
    </section>
  );
}

function BillingWorkspaceSummaryItem({
  itemView,
}: {
  itemView: SettingsBillingWorkspaceSummaryItemView;
}) {
  return (
    <li
      aria-label={itemView.ariaLabel}
      className="grid gap-2 rounded-md border bg-background p-3"
    >
      <Badge className="w-fit rounded-md" variant="outline">
        {itemView.label}
      </Badge>
      <p className="text-muted-foreground text-sm leading-6">
        {itemView.description}
      </p>
    </li>
  );
}

function BillingWorkspaceHandoff({
  handoffView,
}: {
  handoffView: SettingsBillingWorkspaceHandoffView;
}) {
  const titleId = 'settings-billing-workspace-handoff-title';
  const descriptionId = 'settings-billing-workspace-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid gap-3 rounded-md border bg-background/80 p-3"
      data-handoff="settings-billing-workspace"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <div>
        <h3 className="font-medium text-sm" id={titleId}>
          {handoffView.title}
        </h3>
        <p
          className="mt-1 text-muted-foreground text-xs leading-5"
          id={descriptionId}
        >
          {handoffView.description}
        </p>
      </div>
      <dl className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {handoffView.itemViews.map((itemView) => (
          <BillingWorkspaceHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function BillingWorkspaceHandoffItem({
  itemView,
}: {
  itemView: SettingsBillingWorkspaceHandoffItemView;
}) {
  const labelId = `settings-billing-workspace-handoff-${itemView.id}-label`;
  const valueId = `settings-billing-workspace-handoff-${itemView.id}-value`;
  const descriptionId = `settings-billing-workspace-handoff-${itemView.id}-description`;

  return (
    <div
      className="rounded-md border bg-muted/20 px-3 py-2"
      data-handoff-item={itemView.id}
    >
      <dt className="font-medium text-xs" id={labelId}>
        {itemView.label}
      </dt>
      <dd className="mt-1">
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          className="text-sm"
          id={valueId}
        >
          {itemView.value}
        </output>
        <p
          className="mt-1 text-muted-foreground text-xs leading-5"
          id={descriptionId}
        >
          {itemView.description}
        </p>
      </dd>
    </div>
  );
}
