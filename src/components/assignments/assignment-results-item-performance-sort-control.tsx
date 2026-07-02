import type {
  ItemPerformanceSort,
  AssignmentResultItemPerformanceSortControlView,
} from '@/assignments/result-view';
import { AssignmentResultControlStatusBadge } from '@/components/assignments/assignment-result-control-status-badge';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

type AssignmentResultsItemPerformanceSortControlProps = {
  onSortChange: (sort: ItemPerformanceSort) => void;
  view: AssignmentResultItemPerformanceSortControlView;
};

export function AssignmentResultsItemPerformanceSortControl({
  onSortChange,
  view,
}: AssignmentResultsItemPerformanceSortControlProps) {
  const descriptionIds = [
    view.ids.description,
    view.ids.statusDescription,
  ].join(' ');

  return (
    <div className="flex flex-col gap-2 sm:w-52">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <label htmlFor={view.ids.select} className="font-medium text-sm">
          {view.label}
        </label>
        <AssignmentResultControlStatusBadge
          descriptionId={view.ids.statusDescription}
          view={view.statusView}
        />
      </div>
      <NativeSelect
        id={view.ids.select}
        value={view.sort}
        aria-describedby={descriptionIds}
        aria-label={view.ariaLabel}
        onChange={(event) =>
          onSortChange(event.currentTarget.value as ItemPerformanceSort)
        }
      >
        {view.options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <p
        id={view.ids.description}
        className="text-xs leading-relaxed text-muted-foreground"
      >
        {view.selectedSortOption.description}
      </p>
    </div>
  );
}
