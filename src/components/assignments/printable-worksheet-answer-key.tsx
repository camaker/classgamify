import type { buildPrintableWorksheetPageViewModel } from '@/assignments/printable-worksheet-view';
import { IconKey } from '@tabler/icons-react';

type PrintableWorksheetPageViewModel = ReturnType<
  typeof buildPrintableWorksheetPageViewModel
>;

type PrintableWorksheetAnswerKeyProps = {
  view: PrintableWorksheetPageViewModel['answerKeyView'];
};

export function PrintableWorksheetAnswerKey({
  view,
}: PrintableWorksheetAnswerKeyProps) {
  if (!view.show) return null;

  return (
    <section data-print-answer-key className="grid gap-3 border-t pt-5">
      <div className="flex items-center gap-2">
        <IconKey className="size-5 text-primary" />
        <div>
          <h2 className="font-semibold">{view.title}</h2>
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
  itemView: PrintableWorksheetPageViewModel['answerKeyView']['itemViews'][number];
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm">
      <p className="text-muted-foreground text-xs">{itemView.headingLabel}</p>
      <p className="mt-1 font-medium">{itemView.answerLabel}</p>
      <p className="mt-1 text-muted-foreground">{itemView.prompt}</p>
      {itemView.acceptedAnswersLabel ? (
        <p className="mt-1 text-muted-foreground">
          {itemView.acceptedAnswersLabel}
        </p>
      ) : null}
      {itemView.explanationLabel ? (
        <p className="mt-1 text-muted-foreground">
          {itemView.explanationLabel}
        </p>
      ) : null}
    </div>
  );
}
