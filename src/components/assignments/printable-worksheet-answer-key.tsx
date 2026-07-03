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

  const titleId = 'printable-worksheet-answer-key-title';
  const descriptionId = 'printable-worksheet-answer-key-description';
  const accessDescriptionId =
    'printable-worksheet-answer-key-access-description';
  const accessLabelId = 'printable-worksheet-answer-key-access-label';
  const accessValueId = 'printable-worksheet-answer-key-access-value';

  return (
    <section
      aria-describedby={`${descriptionId} ${accessDescriptionId}`}
      aria-labelledby={titleId}
      className="grid gap-3 border-t pt-5"
      data-print-answer-key
      data-print-answer-key-state={view.accessView.state}
    >
      <div className="flex items-center gap-2">
        <IconKey aria-hidden="true" className="size-5 text-primary" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={titleId} className="font-semibold">
              {view.title}
            </h2>
            <Badge
              aria-describedby={accessDescriptionId}
              aria-labelledby={`${accessLabelId} ${accessValueId}`}
              variant="outline"
              className="rounded-md"
            >
              <span id={accessLabelId} className="sr-only">
                {view.accessView.label}
              </span>
              <output
                aria-describedby={accessDescriptionId}
                aria-label={view.accessView.ariaLabel}
                aria-labelledby={`${accessLabelId} ${accessValueId}`}
                id={accessValueId}
              >
                {view.accessView.value}
              </output>
            </Badge>
          </div>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {view.description}
          </p>
          <p id={accessDescriptionId} className="sr-only">
            {view.accessView.description}
          </p>
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
  const titleId = `printable-worksheet-answer-key-${itemView.id}-title`;
  const descriptionId = `printable-worksheet-answer-key-${itemView.id}-description`;
  const promptId = `printable-worksheet-answer-key-${itemView.id}-prompt`;

  return (
    <article
      aria-describedby={`${promptId} ${descriptionId}`}
      aria-label={itemView.ariaLabel}
      aria-labelledby={titleId}
      className="rounded-lg border bg-muted/20 p-3 text-sm"
    >
      <p id={titleId} className="text-muted-foreground text-xs">
        {itemView.headingLabel}
      </p>
      <p id={promptId} className="mt-1 text-muted-foreground">
        {itemView.prompt}
      </p>
      <dl id={descriptionId} className="mt-1 grid gap-1">
        {itemView.detailViews.map((detailView) => (
          <PrintableWorksheetAnswerKeyDetail
            detailView={detailView}
            itemId={itemView.id}
            key={detailView.id}
          />
        ))}
      </dl>
    </article>
  );
}

function PrintableWorksheetAnswerKeyDetail({
  detailView,
  itemId,
}: {
  detailView: PrintableWorksheetAnswerKeyDetailView;
  itemId: PrintableWorksheetAnswerKeyItemView['id'];
}) {
  const labelId = `printable-worksheet-answer-key-${itemId}-detail-${detailView.id}-label`;
  const valueId = `printable-worksheet-answer-key-${itemId}-detail-${detailView.id}-value`;

  return (
    <div
      className={cn(
        detailView.tone === 'primary' ? 'font-medium' : 'text-muted-foreground'
      )}
    >
      <dt id={labelId} className="sr-only">
        {detailView.id}
      </dt>
      <dd>
        <output
          aria-label={detailView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {detailView.label}
        </output>
      </dd>
    </div>
  );
}
