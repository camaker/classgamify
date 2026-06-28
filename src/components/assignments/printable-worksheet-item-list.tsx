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
            {itemView.headingLabel}
          </p>
          <h2 className="mt-2 font-semibold leading-6">{itemView.prompt}</h2>
        </div>
        <Badge variant="outline" className="rounded-md">
          {itemView.responseHelp}
        </Badge>
      </div>
      <p className="mt-3 text-muted-foreground text-xs">
        {itemView.responseModeLabel}
      </p>
      <PrintableWorksheetChoiceBank choiceBank={itemView.choiceBank} />
      <div className="mt-4 grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-muted-foreground text-xs">
            {itemView.answerAreaLabel}
          </p>
          <p className="text-muted-foreground text-xs">
            {itemView.answerLineSummary}
          </p>
        </div>
        {itemView.answerLines.map((line) => (
          <div key={line.key} className="h-8 border-b" />
        ))}
      </div>
    </section>
  );
}

function PrintableWorksheetChoiceBank({
  choiceBank,
}: {
  choiceBank: PrintableWorksheetPageViewModel['itemViews'][number]['choiceBank'];
}) {
  if (choiceBank.choices.length === 0) {
    return choiceBank.emptySummary ? (
      <p className="mt-4 text-muted-foreground text-xs">
        {choiceBank.emptySummary}
      </p>
    ) : null;
  }

  return (
    <div className="mt-4 grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {choiceBank.label ? (
          <p className="font-medium text-muted-foreground text-xs">
            {choiceBank.label}
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">{choiceBank.summary}</p>
      </div>
      <div
        data-print-choice-bank={choiceBank.presentation}
        className={cn(
          'grid gap-2',
          choiceBank.presentation === 'group-bank'
            ? 'sm:grid-cols-3'
            : 'sm:grid-cols-2'
        )}
      >
        {choiceBank.choices.map(({ choice, indexLabel, key }) => (
          <div
            key={key}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
              choiceBank.presentation === 'group-bank'
                ? 'justify-center bg-background font-medium'
                : 'bg-muted/20'
            )}
          >
            {choiceBank.showIndexLabels ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-background text-xs">
                {indexLabel}
              </span>
            ) : null}
            <span>{choice}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
