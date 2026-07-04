import type {
  PublicEditorialHandoffItemView,
  PublicEditorialHandoffView,
} from '@/pages/public-editorial-content-view';

export function PublicEditorialHandoff({
  view,
}: {
  view: PublicEditorialHandoffView;
}) {
  const titleId = 'public-editorial-handoff-title';
  const descriptionId = 'public-editorial-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="public-editorial-content"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <PublicEditorialHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function PublicEditorialHandoffItem({
  itemView,
}: {
  itemView: PublicEditorialHandoffItemView;
}) {
  return (
    <div data-handoff-item={itemView.id}>
      <dt>{itemView.label}</dt>
      <dd>
        <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
        <span>{itemView.description}</span>
      </dd>
    </div>
  );
}
