import type {
  SettingsAccountWorkspaceHandoffItemView,
  SettingsAccountWorkspaceHandoffView,
} from '@/settings/account-handoff';
import type {
  SettingsProfileWorkspaceSummaryItemView,
  SettingsProfileWorkspaceSummaryView,
} from '@/settings/profile-view';
import { Badge } from '@/components/ui/badge';

type ProfileWorkspaceSummaryProps = {
  view: SettingsProfileWorkspaceSummaryView;
};

export function ProfileWorkspaceSummary({
  view,
}: ProfileWorkspaceSummaryProps) {
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
          <ProfileWorkspaceSummaryItem itemView={itemView} key={itemView.id} />
        ))}
      </ul>
      <AccountWorkspaceHandoff handoffView={view.handoffView} />
    </section>
  );
}

function ProfileWorkspaceSummaryItem({
  itemView,
}: {
  itemView: SettingsProfileWorkspaceSummaryItemView;
}) {
  return (
    <li className="grid gap-2 rounded-md border bg-background p-3">
      <Badge className="w-fit rounded-md" variant="outline">
        {itemView.label}
      </Badge>
      <p className="text-muted-foreground text-sm leading-6">
        {itemView.description}
      </p>
    </li>
  );
}

function AccountWorkspaceHandoff({
  handoffView,
}: {
  handoffView: SettingsAccountWorkspaceHandoffView;
}) {
  const titleId = 'settings-account-workspace-handoff-title';
  const descriptionId = 'settings-account-workspace-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="settings-account-workspace"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <div>
        <h3 className="font-medium text-sm" id={titleId}>
          {handoffView.title}
        </h3>
        <p className="mt-1 text-muted-foreground text-sm" id={descriptionId}>
          {handoffView.description}
        </p>
      </div>
      <dl className="grid gap-2 md:grid-cols-2">
        {handoffView.itemViews.map((itemView) => (
          <AccountWorkspaceHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function AccountWorkspaceHandoffItem({
  itemView,
}: {
  itemView: SettingsAccountWorkspaceHandoffItemView;
}) {
  const labelId = `settings-account-workspace-handoff-${itemView.id}-label`;
  const valueId = `settings-account-workspace-handoff-${itemView.id}-value`;
  const descriptionId = `settings-account-workspace-handoff-${itemView.id}-description`;

  return (
    <div
      className="rounded-md border bg-background px-3 py-2"
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
