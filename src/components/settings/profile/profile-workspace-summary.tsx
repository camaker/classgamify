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
  return (
    <section
      aria-label={handoffView.title}
      className="grid gap-3 border-t pt-3"
    >
      <div>
        <h3 className="font-medium text-sm">{handoffView.title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">
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
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <dt className="font-medium text-xs">{itemView.label}</dt>
      <dd className="mt-1">
        <output aria-label={itemView.ariaLabel} className="text-sm">
          {itemView.value}
        </output>
        <p className="mt-1 text-muted-foreground text-xs leading-5">
          {itemView.description}
        </p>
      </dd>
    </div>
  );
}
