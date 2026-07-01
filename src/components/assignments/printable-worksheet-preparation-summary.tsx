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
  return (
    <section
      data-print-hidden
      className="grid gap-3 rounded-lg border bg-muted/20 p-4"
    >
      <div>
        <h2 className="font-semibold text-sm">{view.title}</h2>
        <p className="mt-1 text-muted-foreground text-xs">{view.description}</p>
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
  return (
    <div className="grid gap-2 rounded-md border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-xs">{itemView.label}</p>
        <Badge variant="outline" className="rounded-md">
          {itemView.value}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs leading-5">
        {itemView.description}
      </p>
    </div>
  );
}
