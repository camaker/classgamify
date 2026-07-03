import type {
  PrintableWorksheetPreparationItemView,
  PrintableWorksheetPreparationView,
} from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';

type PrintableWorksheetPreparationSummaryProps = {
  view: PrintableWorksheetPreparationView;
};

export function PrintableWorksheetPreparationSummary({
  view,
}: PrintableWorksheetPreparationSummaryProps) {
  const titleId = 'printable-worksheet-preparation-title';
  const descriptionId = 'printable-worksheet-preparation-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      data-print-hidden
      className="grid gap-3 rounded-lg border bg-muted/20 p-4"
    >
      <div>
        <h2 id={titleId} className="font-semibold text-sm">
          {view.title}
        </h2>
        <p id={descriptionId} className="mt-1 text-muted-foreground text-xs">
          {view.description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {view.items.map((itemView) => (
          <PrintableWorksheetPreparationItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </div>
    </section>
  );
}

function PrintableWorksheetPreparationItem({
  itemView,
}: {
  itemView: PrintableWorksheetPreparationItemView;
}) {
  const labelId = `printable-worksheet-preparation-${itemView.id}-label`;
  const valueId = `printable-worksheet-preparation-${itemView.id}-value`;
  const descriptionId = `printable-worksheet-preparation-${itemView.id}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-labelledby={`${labelId} ${valueId}`}
      className="grid gap-2 rounded-md border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={labelId} className="font-medium text-xs">
          {itemView.label}
        </p>
        <Badge variant="outline" className="rounded-md">
          <output
            aria-describedby={descriptionId}
            aria-label={itemView.ariaLabel}
            aria-labelledby={`${labelId} ${valueId}`}
            id={valueId}
          >
            {itemView.value}
          </output>
        </Badge>
      </div>
      <p id={descriptionId} className="text-muted-foreground text-xs leading-5">
        {itemView.description}
      </p>
    </article>
  );
}
