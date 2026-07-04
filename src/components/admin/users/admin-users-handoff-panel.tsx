import type {
  AdminUsersHandoffItemView,
  AdminUsersHandoffView,
} from '@/admin/users-view';

type AdminUsersHandoffPanelProps = {
  handoffView: AdminUsersHandoffView;
};

export function AdminUsersHandoffPanel({
  handoffView,
}: AdminUsersHandoffPanelProps) {
  return (
    <section
      aria-label={handoffView.title}
      className="grid gap-3 rounded-lg border bg-muted/20 p-4"
    >
      <div>
        <h2 className="font-semibold text-sm">{handoffView.title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          {handoffView.description}
        </p>
      </div>
      <dl className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {handoffView.itemViews.map((itemView) => (
          <AdminUsersHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function AdminUsersHandoffItem({
  itemView,
}: {
  itemView: AdminUsersHandoffItemView;
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
