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
  return (
    <div className="flex flex-col gap-2 sm:w-52">
      <div className="flex min-w-0 items-center gap-2">
        <label htmlFor={view.ids.select} className="font-medium text-sm">
          {view.label}
        </label>
      </div>
      <NativeSelect
        id={view.ids.select}
        value={view.sort}
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
    </div>
  );
}
