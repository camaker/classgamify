import type {
  ItemPerformanceSort,
  buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

type AssignmentResultsItemPerformanceSortView = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['controlViews']['itemPerformanceSort'];

type AssignmentResultsItemPerformanceSortControlProps = {
  onSortChange: (sort: ItemPerformanceSort) => void;
  view: AssignmentResultsItemPerformanceSortView;
};

export function AssignmentResultsItemPerformanceSortControl({
  onSortChange,
  view,
}: AssignmentResultsItemPerformanceSortControlProps) {
  return (
    <div className="flex flex-col gap-2 sm:w-52">
      <label htmlFor="item-performance-sort" className="font-medium text-sm">
        {view.label}
      </label>
      <NativeSelect
        id="item-performance-sort"
        value={view.sort}
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
      <p className="text-xs leading-relaxed text-muted-foreground">
        {view.selectedSortOption.description}
      </p>
    </div>
  );
}
