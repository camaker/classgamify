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
      <section
        aria-describedby="printable-worksheet-empty-description"
        aria-labelledby="printable-worksheet-empty-title"
        className="rounded-lg border border-dashed p-6"
      >
        <h2 id="printable-worksheet-empty-title" className="font-semibold">
          {emptyState.title}
        </h2>
        <p
          id="printable-worksheet-empty-description"
          className="mt-2 text-sm text-muted-foreground"
        >
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
  const headingId = `printable-worksheet-item-${itemView.id}-heading`;
  const promptId = `printable-worksheet-item-${itemView.id}-prompt`;
  const responseHelpId = `printable-worksheet-item-${itemView.id}-response-help`;
  const responseModeId = `printable-worksheet-item-${itemView.id}-response-mode`;

  return (
    <section
      aria-describedby={`${promptId} ${responseHelpId} ${responseModeId}`}
      aria-labelledby={headingId}
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
            <p id={headingId} className="text-muted-foreground text-xs">
              {itemView.headingLabel}
            </p>
            <h2 id={promptId} className="mt-2 font-semibold leading-6">
              {itemView.prompt}
            </h2>
          </div>
          <Badge variant="outline" className="rounded-md">
            <output id={responseHelpId}>{itemView.responseHelp}</output>
          </Badge>
        </div>
        <p id={responseModeId} className="mt-3 text-muted-foreground text-xs">
          {itemView.responseModeLabel}
        </p>
      </div>
      <div
        className={getPrintableWorksheetResponsePanelClassName(itemView.layout)}
      >
        <PrintableWorksheetChoiceBank
          choiceBank={itemView.choiceBank}
          itemId={itemView.id}
        />
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
  const labelId = `printable-worksheet-item-${itemView.id}-answer-area-label`;
  const summaryId = `printable-worksheet-item-${itemView.id}-answer-line-summary`;

  return (
    <fieldset
      aria-describedby={summaryId}
      className={getPrintableWorksheetWritingAreaClassName(itemView.layout)}
    >
      <legend
        id={labelId}
        className="font-medium text-muted-foreground text-xs"
      >
        {itemView.answerAreaLabel}
      </legend>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <output id={summaryId} className="text-muted-foreground text-xs">
          {itemView.answerLineSummary}
        </output>
      </div>
      {itemView.answerLines.map((line) => (
        <div
          aria-hidden="true"
          key={line.key}
          className={getPrintableWorksheetWritingLineClassName(itemView.layout)}
        />
      ))}
    </fieldset>
  );
}

function PrintableWorksheetChoiceBank({
  choiceBank,
  itemId,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
  itemId: PrintableWorksheetItemView['id'];
}) {
  if (!choiceBank.show) return null;

  if (choiceBank.choices.length === 0) {
    return <PrintableWorksheetEmptyChoiceBank choiceBank={choiceBank} />;
  }

  return (
    <div className="grid gap-2">
      <PrintableWorksheetChoiceBankHeader
        choiceBank={choiceBank}
        itemId={itemId}
      />
      <PrintableWorksheetChoiceBankGrid
        choiceBank={choiceBank}
        itemId={itemId}
      />
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
  itemId,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
  itemId: PrintableWorksheetItemView['id'];
}) {
  const labelId = getPrintableWorksheetChoiceBankLabelId(choiceBank, itemId);
  const summaryId = getPrintableWorksheetChoiceBankSummaryId(
    choiceBank,
    itemId
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {choiceBank.label ? (
        <p id={labelId} className="font-medium text-muted-foreground text-xs">
          {choiceBank.label}
        </p>
      ) : null}
      {choiceBank.summary ? (
        <output id={summaryId} className="text-muted-foreground text-xs">
          {choiceBank.summary}
        </output>
      ) : null}
    </div>
  );
}

function PrintableWorksheetChoiceBankGrid({
  choiceBank,
  itemId,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
  itemId: PrintableWorksheetItemView['id'];
}) {
  return (
    <section
      aria-describedby={getPrintableWorksheetChoiceBankSummaryId(
        choiceBank,
        itemId
      )}
      aria-labelledby={getPrintableWorksheetChoiceBankLabelId(
        choiceBank,
        itemId
      )}
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
    </section>
  );
}

function PrintableWorksheetChoiceBankChoice({
  choiceBank,
  choiceView,
}: {
  choiceBank: PrintableWorksheetChoiceBankView;
  choiceView: PrintableWorksheetChoiceBankChoiceView;
}) {
  const labelId = `printable-worksheet-choice-bank-${choiceView.key}-label`;
  const valueId = `printable-worksheet-choice-bank-${choiceView.key}-value`;
  const descriptionId = `printable-worksheet-choice-bank-${choiceView.key}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-labelledby={`${labelId} ${valueId}`}
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
        choiceBank.presentation === 'group-bank'
          ? 'justify-center bg-background font-medium'
          : 'bg-muted/20'
      )}
    >
      {choiceBank.showIndexLabels ? (
        <span
          id={labelId}
          className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-background text-xs"
        >
          {choiceView.indexLabel}
        </span>
      ) : (
        <span id={labelId} className="sr-only">
          {choiceBank.label}
        </span>
      )}
      <output
        aria-describedby={descriptionId}
        aria-label={choiceView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        id={valueId}
      >
        {choiceView.choice}
      </output>
      <span id={descriptionId} className="sr-only">
        {choiceView.description}
      </span>
    </article>
  );
}

function getPrintableWorksheetChoiceBankLabelId(
  choiceBank: PrintableWorksheetChoiceBankView,
  itemId: PrintableWorksheetItemView['id']
) {
  return `printable-worksheet-choice-bank-${itemId}-${choiceBank.presentation}-label`;
}

function getPrintableWorksheetChoiceBankSummaryId(
  choiceBank: PrintableWorksheetChoiceBankView,
  itemId: PrintableWorksheetItemView['id']
) {
  return `printable-worksheet-choice-bank-${itemId}-${choiceBank.presentation}-summary`;
}
