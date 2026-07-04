import type { PublicAssignmentAccessHandoffView } from '@/assignments/public';

type PublicAssignmentAccessHandoffProps = {
  view: PublicAssignmentAccessHandoffView;
};

export function PublicAssignmentAccessHandoff({
  view,
}: PublicAssignmentAccessHandoffProps) {
  const titleId = 'public-assignment-access-handoff-title';
  const descriptionId = 'public-assignment-access-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="public-assignment-access"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <div data-handoff-item={item.id} key={item.id}>
            <dt>{item.label}</dt>
            <dd>
              <output aria-label={item.ariaLabel}>{item.value}</output>
              <span>{item.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
