import type { PrintableWorksheetHeaderView } from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';
import { IconSchool } from '@tabler/icons-react';

type PrintableWorksheetHeaderProps = {
  headerView: PrintableWorksheetHeaderView;
};

export function PrintableWorksheetHeader({
  headerView,
}: PrintableWorksheetHeaderProps) {
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
        <h1 className="mt-3 text-2xl font-semibold leading-tight">
          {headerView.assignmentTitle}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {headerView.overviewItems.map((overviewItem) => (
            <Badge
              key={overviewItem.id}
              variant="outline"
              className="rounded-md"
            >
              {overviewItem.label}
            </Badge>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {headerView.activityTitle}
        </p>
        {headerView.activityDescription ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {headerView.activityDescription}
          </p>
        ) : null}
      </div>
      <div
        data-print-brand
        className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
      >
        <div className="flex items-center gap-2 font-medium">
          <IconSchool className="size-4" />
          {headerView.brandLabel}
        </div>
        <p className="mt-2 text-muted-foreground text-xs">
          {headerView.sharePathLabel}
        </p>
        <p className="mt-1 text-muted-foreground">{headerView.sharePath}</p>
      </div>
    </header>
  );
}
