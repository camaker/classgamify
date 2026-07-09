import type {
  SettingsAccountWorkspaceHandoffItemView,
  SettingsAccountWorkspaceHandoffView,
} from '@/settings/account-handoff';
import type {
  SettingsSecurityWorkspaceHandoffItemView,
  SettingsSecurityWorkspaceHandoffView,
} from '@/settings/security-handoff';
import type {
  SettingsSecurityCapabilityView,
  SettingsSecurityWorkspaceSummaryItemView,
  SettingsSecurityWorkspaceSummaryView,
} from '@/settings/security-view';
import { Badge } from '@/components/ui/badge';

type SecurityWorkspaceSummaryProps = {
  view: SettingsSecurityWorkspaceSummaryView;
};

export function SecurityWorkspaceSummary({
  view,
}: SecurityWorkspaceSummaryProps) {
  return (
    <section
      aria-label={view.ariaLabel}
      className="grid gap-4 rounded-lg border bg-muted/20 p-4"
    >
      <div>
        <h2 className="font-semibold text-sm">{view.title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{view.description}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {view.itemViews.map((itemView) => (
          <SecurityWorkspaceSummaryItem itemView={itemView} key={itemView.id} />
        ))}
      </ul>
      <div className="grid gap-3 border-t pt-4">
        <div>
          <h3 className="font-semibold text-sm">{view.capabilityTitle}</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            {view.capabilityDescription}
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {view.capabilityViews.map((capabilityView) => (
            <SecurityCapabilityItem
              capabilityView={capabilityView}
              key={capabilityView.id}
            />
          ))}
        </ul>
      </div>
      <AccountWorkspaceHandoff handoffView={view.handoffView} />
      <SettingsSecurityWorkspaceHandoff
        handoffView={view.securityHandoffView}
      />
    </section>
  );
}

function SecurityWorkspaceSummaryItem({
  itemView,
}: {
  itemView: SettingsSecurityWorkspaceSummaryItemView;
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
      className="grid gap-3 border-t pt-3"
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

function SecurityCapabilityItem({
  capabilityView,
}: {
  capabilityView: SettingsSecurityCapabilityView;
}) {
  return (
    <li
      className="grid gap-2 rounded-md border bg-background p-3"
      data-security-capability-state={capabilityView.state}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-sm">{capabilityView.label}</p>
        <Badge
          className="rounded-md"
          variant={capabilityView.state === 'enabled' ? 'secondary' : 'outline'}
        >
          {capabilityView.value}
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm leading-6">
        {capabilityView.description}
      </p>
    </li>
  );
}

function SettingsSecurityWorkspaceHandoff({
  handoffView,
}: {
  handoffView: SettingsSecurityWorkspaceHandoffView;
}) {
  const titleId = 'settings-security-workspace-handoff-title';
  const descriptionId = 'settings-security-workspace-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="settings-security-workspace"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <h3 id={titleId}>{handoffView.title}</h3>
      <p id={descriptionId}>{handoffView.description}</p>
      <dl>
        {handoffView.itemViews.map((itemView) => (
          <SettingsSecurityWorkspaceHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function SettingsSecurityWorkspaceHandoffItem({
  itemView,
}: {
  itemView: SettingsSecurityWorkspaceHandoffItemView;
}) {
  const labelId = `settings-security-workspace-handoff-${itemView.id}-label`;
  const valueId = `settings-security-workspace-handoff-${itemView.id}-value`;
  const descriptionId = `settings-security-workspace-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
      </dd>
      <dd id={descriptionId}>{itemView.description}</dd>
    </div>
  );
}
