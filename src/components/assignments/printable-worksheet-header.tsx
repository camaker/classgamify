import type {
  PrintableWorksheetHeaderOverviewItem,
  PrintableWorksheetHeaderView,
} from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';
import { IconSchool } from '@tabler/icons-react';

type PrintableWorksheetHeaderProps = {
  headerView: PrintableWorksheetHeaderView;
};

export function PrintableWorksheetHeader({
  headerView,
}: PrintableWorksheetHeaderProps) {
  const titleId = 'printable-worksheet-header-title';
  const activityTitleId = 'printable-worksheet-header-activity-title';
  const sharePathLabelId = 'printable-worksheet-header-share-path-label';
  const sharePathValueId = 'printable-worksheet-header-share-path-value';
  const brandLabelId = 'printable-worksheet-header-brand-label';

  return (
    <header
      data-print-header
      className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {headerView.printModeLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {headerView.templateLabel}
          </Badge>
        </div>
        <h1 id={titleId} className="mt-3 text-2xl font-semibold leading-tight">
          {headerView.assignmentTitle}
        </h1>
        <dl className="mt-3 flex flex-wrap gap-2">
          {headerView.overviewItems.map((overviewItem) => (
            <PrintableWorksheetHeaderOverviewBadge
              key={overviewItem.id}
              overviewItem={overviewItem}
            />
          ))}
        </dl>
        <p id={activityTitleId} className="mt-2 text-sm text-muted-foreground">
          {headerView.activityTitle}
        </p>
        {headerView.activityDescription ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {headerView.activityDescription}
          </p>
        ) : null}
      </div>
      <section
        aria-labelledby={brandLabelId}
        data-print-brand
        className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
      >
        <div id={brandLabelId} className="flex items-center gap-2 font-medium">
          <IconSchool aria-hidden="true" className="size-4" />
          {headerView.brandLabel}
        </div>
        <p id={sharePathLabelId} className="mt-2 text-muted-foreground text-xs">
          {headerView.sharePathLabel}
        </p>
        <output
          aria-labelledby={`${sharePathLabelId} ${sharePathValueId}`}
          className="mt-1 block text-muted-foreground"
          id={sharePathValueId}
        >
          {headerView.sharePath}
        </output>
      </section>
    </header>
  );
}

function PrintableWorksheetHeaderOverviewBadge({
  overviewItem,
}: {
  overviewItem: PrintableWorksheetHeaderOverviewItem;
}) {
  const labelId = `printable-worksheet-header-overview-${overviewItem.id}-label`;
  const valueId = `printable-worksheet-header-overview-${overviewItem.id}-value`;
  const descriptionId = `printable-worksheet-header-overview-${overviewItem.id}-description`;

  return (
    <div>
      <dt id={labelId} className="sr-only">
        {overviewItem.label}
      </dt>
      <dd>
        <Badge variant="outline" className="rounded-md">
          <output
            aria-describedby={descriptionId}
            aria-label={overviewItem.ariaLabel}
            aria-labelledby={`${labelId} ${valueId}`}
            id={valueId}
          >
            {overviewItem.value}
          </output>
        </Badge>
        <span id={descriptionId} className="sr-only">
          {overviewItem.description}
        </span>
      </dd>
    </div>
  );
}
