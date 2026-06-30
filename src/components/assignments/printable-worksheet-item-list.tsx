import type {
  PrintableWorksheetChoiceBankChoiceView,
  PrintableWorksheetChoiceBankView,
  PrintableWorksheetEmptyState,
  PrintableWorksheetItemView,
} from '@/assignments/printable-worksheet-view';
import type { PrintableWorksheetItemLayout } from '@/assignments/printable-worksheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PrintableWorksheetItemListProps = {
  emptyState: PrintableWorksheetEmptyState;
  itemViews: PrintableWorksheetItemView[];
};

const PRINTABLE_WORKSHEET_ITEM_LAYOUT_CLASS_NAMES = {
  classification: 'border-primary/20 bg-primary/5',
  matching: 'sm:grid sm:grid-cols-[1fr_18rem] sm:gap-4',
  'multiple-choice': '',
  'short-answer': '',
} as const satisfies Record<PrintableWorksheetItemLayout, string>;

const PRINTABLE_WORKSHEET_RESPONSE_PANEL_CLASS_NAMES = {
  classification: 'rounded-md bg-background p-3',
  matching: 'mt-4 sm:mt-0',
  'multiple-choice': '',
  'short-answer': 'rounded-md border border-dashed bg-muted/20 p-3',
} as const satisfies Record<PrintableWorksheetItemLayout, string>;

const PRINTABLE_WORKSHEET_WRITING_AREA_CLASS_NAMES = {
  classification: 'mt-4 grid gap-3',
  matching: 'mt-4 grid gap-3',
  'multiple-choice': 'mt-4 grid gap-3',
  'short-answer': 'mt-3 grid gap-4',
} as const satisfies Record<PrintableWorksheetItemLayout, string>;

const PRINTABLE_WORKSHEET_WRITING_LINE_CLASS_NAMES = {
  classification: 'h-8 border-b',
  matching: 'h-8 border-b',
  'multiple-choice': 'h-8 border-b',
  'short-answer': 'h-10 border-b border-foreground/50',
} as const satisfies Record<PrintableWorksheetItemLayout, string>;

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
  itemView: PrintableWorksheetItemView;
}) {
  return (
    <section
      data-print-item
      data-print-item-layout={itemView.layout}
      className={cn(
        'break-inside-avoid rounded-lg border bg-background p-4',
        getPrintableWorksheetItemLayoutClassName(itemView.layout)
      )}
    >
      <div>
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
      </div>
      <div
        className={getPrintableWorksheetResponsePanelClassName(itemView.layout)}
      >
        <PrintableWorksheetChoiceBank choiceBank={itemView.choiceBank} />
        <PrintableWorksheetWritingArea itemView={itemView} />
      </div>
    </section>
  );
}

function getPrintableWorksheetItemLayoutClassName(
  layout: PrintableWorksheetItemLayout
) {
  return PRINTABLE_WORKSHEET_ITEM_LAYOUT_CLASS_NAMES[layout];
}

function getPrintableWorksheetResponsePanelClassName(
  layout: PrintableWorksheetItemLayout
) {
  return PRINTABLE_WORKSHEET_RESPONSE_PANEL_CLASS_NAMES[layout];
}

function getPrintableWorksheetWritingAreaClassName(
  layout: PrintableWorksheetItemLayout
) {
  return PRINTABLE_WORKSHEET_WRITING_AREA_CLASS_NAMES[layout];
}

function getPrintableWorksheetWritingLineClassName(
  layout: PrintableWorksheetItemLayout
) {
  return PRINTABLE_WORKSHEET_WRITING_LINE_CLASS_NAMES[layout];
}

function PrintableWorksheetWritingArea({
  itemView,
}: {
  itemView: PrintableWorksheetItemView;
}) {
  return (
    <div className={getPrintableWorksheetWritingAreaClassName(itemView.layout)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-muted-foreground text-xs">
          {itemView.answerAreaLabel}
        </p>
        <p className="text-muted-foreground text-xs">
          {itemView.answerLineSummary}
        </p>
      </div>
      {itemView.answerLines.map((line) => (
        <div
          key={line.key}
          className={getPrintableWorksheetWritingLineClassName(itemView.layout)}
        />
      ))}
    </div>
  );
}

function PrintableWorksheetChoiceBank({
  choiceBank,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
}) {
  if (!choiceBank.show) return null;

  if (choiceBank.choices.length === 0) {
    return <PrintableWorksheetEmptyChoiceBank choiceBank={choiceBank} />;
  }

  return (
    <div className="grid gap-2">
      <PrintableWorksheetChoiceBankHeader choiceBank={choiceBank} />
      <PrintableWorksheetChoiceBankGrid choiceBank={choiceBank} />
    </div>
  );
}

function PrintableWorksheetEmptyChoiceBank({
  choiceBank,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
}) {
  return choiceBank.emptySummary ? (
    <p className="mt-4 text-muted-foreground text-xs">
      {choiceBank.emptySummary}
    </p>
  ) : null;
}

function PrintableWorksheetChoiceBankHeader({
  choiceBank,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {choiceBank.label ? (
        <p className="font-medium text-muted-foreground text-xs">
          {choiceBank.label}
        </p>
      ) : null}
      <p className="text-muted-foreground text-xs">{choiceBank.summary}</p>
    </div>
  );
}

function PrintableWorksheetChoiceBankGrid({
  choiceBank,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
}) {
  return (
    <div
      data-print-choice-bank={choiceBank.presentation}
      className={cn(
        'grid gap-2',
        choiceBank.presentation === 'group-bank'
          ? 'sm:grid-cols-3'
          : 'sm:grid-cols-2'
      )}
    >
      {choiceBank.choices.map((choiceView) => (
        <PrintableWorksheetChoiceBankChoice
          choiceView={choiceView}
          key={choiceView.key}
          choiceBank={choiceBank}
        />
      ))}
    </div>
  );
}

function PrintableWorksheetChoiceBankChoice({
  choiceBank,
  choiceView,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
  choiceView: PrintableWorksheetChoiceBankChoiceView;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
        choiceBank.presentation === 'group-bank'
          ? 'justify-center bg-background font-medium'
          : 'bg-muted/20'
      )}
    >
      {choiceBank.showIndexLabels ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-background text-xs">
          {choiceView.indexLabel}
        </span>
      ) : null}
      <span>{choiceView.choice}</span>
    </div>
  );
}
