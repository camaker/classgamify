import type { buildPrintableWorksheetPageViewModel } from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PrintableWorksheetPageViewModel = ReturnType<
  typeof buildPrintableWorksheetPageViewModel
>;

type PrintableWorksheetItemListProps = {
  emptyState: PrintableWorksheetPageViewModel['emptyState'];
  itemViews: PrintableWorksheetPageViewModel['itemViews'];
};

export function PrintableWorksheetItemList({
  emptyState,
  itemViews,
}: PrintableWorksheetItemListProps) {
  if (itemViews.length === 0) {
    return (
      <section className="rounded-lg border border-dashed p-6">
        <h2 className="font-semibold">{emptyState.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {emptyState.description}
        </p>
      </section>
    );
  }

  return (
    <section data-print-items className="grid gap-4">
      {itemViews.map((itemView) => (
        <PrintableWorksheetItem key={itemView.id} itemView={itemView} />
      ))}
    </section>
  );
}

function PrintableWorksheetItem({
  itemView,
}: {
  itemView: PrintableWorksheetPageViewModel['itemViews'][number];
}) {
  return (
    <section
      data-print-item
      className="break-inside-avoid rounded-lg border bg-background p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            {itemView.sequenceLabel} · {itemView.kindLabel}
          </p>
          <h2 className="mt-2 font-semibold leading-6">{itemView.prompt}</h2>
        </div>
        <Badge variant="outline" className="rounded-md">
          {itemView.responseHelp}
        </Badge>
      </div>
      {itemView.choiceBank.choices.length > 0 ? (
        <div
          data-print-choice-bank={itemView.choiceBank.presentation}
          className={cn(
            'mt-4 grid gap-2',
            itemView.choiceBank.presentation === 'group-bank'
              ? 'sm:grid-cols-3'
              : 'sm:grid-cols-2'
          )}
        >
          {itemView.choiceBank.choices.map(({ choice, indexLabel, key }) => (
            <div
              key={key}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                itemView.choiceBank.presentation === 'group-bank'
                  ? 'justify-center bg-background font-medium'
                  : 'bg-muted/20'
              )}
            >
              {itemView.choiceBank.showIndexLabels ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-background text-xs">
                  {indexLabel}
                </span>
              ) : null}
              <span>{choice}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3">
        {itemView.answerLines.map((line) => (
          <div key={line.key} className="h-8 border-b" />
        ))}
      </div>
    </section>
  );
}
