import type {
  PrintableWorksheetHandoffItemView,
  PrintableWorksheetHandoffView,
} from '@/assignments/printable-worksheet-view';

type PrintableWorksheetHandoffProps = {
  view: PrintableWorksheetHandoffView;
};

export function PrintableWorksheetHandoff({
  view,
}: PrintableWorksheetHandoffProps) {
  const titleId = 'printable-worksheet-handoff-title';
  const descriptionId = 'printable-worksheet-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="printable-worksheet"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <PrintableWorksheetHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function PrintableWorksheetHandoffItem({
  itemView,
}: {
  itemView: PrintableWorksheetHandoffItemView;
}) {
  const labelId = `printable-worksheet-handoff-${itemView.id}-label`;
  const valueId = `printable-worksheet-handoff-${itemView.id}-value`;
  const descriptionId = `printable-worksheet-handoff-${itemView.id}-description`;

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
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}
