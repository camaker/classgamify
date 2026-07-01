import type {
  ItemPerformanceSort,
  AssignmentResultItemPerformanceSortControlView,
} from '@/assignments/result-view';
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
  const descriptionId = 'item-performance-sort-description';

  return (
    <div className="flex flex-col gap-2 sm:w-52">
      <label htmlFor="item-performance-sort" className="font-medium text-sm">
        {view.label}
      </label>
      <NativeSelect
        id="item-performance-sort"
        value={view.sort}
        aria-describedby={descriptionId}
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
        id={descriptionId}
        className="text-xs leading-relaxed text-muted-foreground"
      >
        {view.selectedSortOption.description}
      </p>
    </div>
  );
}
