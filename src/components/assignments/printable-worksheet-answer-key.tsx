import type {
  PrintableWorksheetAnswerKeyDetailView,
  PrintableWorksheetAnswerKeyItemView,
  PrintableWorksheetAnswerKeyView,
} from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconKey } from '@tabler/icons-react';

type PrintableWorksheetAnswerKeyProps = {
  view: PrintableWorksheetAnswerKeyView;
};

export function PrintableWorksheetAnswerKey({
  view,
}: PrintableWorksheetAnswerKeyProps) {
  if (!view.show) return null;

  return (
    <section
      aria-label={view.accessView.ariaLabel}
      className="grid gap-3 border-t pt-5"
      data-print-answer-key
      data-print-answer-key-state={view.accessView.state}
    >
      <div className="flex items-center gap-2">
        <IconKey className="size-5 text-primary" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{view.title}</h2>
            <Badge variant="outline" className="rounded-md">
              {view.accessView.value}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{view.description}</p>
        </div>
      </div>
      <div className="grid gap-2">
        {view.itemViews.map((itemView) => (
          <PrintableWorksheetAnswerKeyItem
            key={itemView.id}
            itemView={itemView}
          />
        ))}
      </div>
    </section>
  );
}

function PrintableWorksheetAnswerKeyItem({
  itemView,
}: {
  itemView: PrintableWorksheetAnswerKeyItemView;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm">
      <p className="text-muted-foreground text-xs">{itemView.headingLabel}</p>
      <p className="mt-1 text-muted-foreground">{itemView.prompt}</p>
      <div className="mt-1 grid gap-1">
        {itemView.detailViews.map((detailView) => (
          <PrintableWorksheetAnswerKeyDetail
            detailView={detailView}
            key={detailView.id}
          />
        ))}
      </div>
    </div>
  );
}

function PrintableWorksheetAnswerKeyDetail({
  detailView,
}: {
  detailView: PrintableWorksheetAnswerKeyDetailView;
}) {
  return (
    <p
      className={cn(
        detailView.tone === 'primary' ? 'font-medium' : 'text-muted-foreground'
      )}
    >
      {detailView.label}
    </p>
  );
}
