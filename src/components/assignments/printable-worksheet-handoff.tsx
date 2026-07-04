import type { PrintableWorksheetHandoffView } from '@/assignments/printable-worksheet-view';

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
