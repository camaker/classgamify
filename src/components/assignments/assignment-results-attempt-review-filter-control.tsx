import {
  type AttemptReviewFilter,
  assignmentResultSearchCopy,
  type buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

type AssignmentResultsAttemptReviewFilterView = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['controlViews']['attemptReviewFilter'];

type AssignmentResultsAttemptReviewFilterControlProps = {
  onFilterChange: (filter: AttemptReviewFilter) => void;
  view: AssignmentResultsAttemptReviewFilterView;
};

export function AssignmentResultsAttemptReviewFilterControl({
  onFilterChange,
  view,
}: AssignmentResultsAttemptReviewFilterControlProps) {
  return (
    <div className="flex flex-col gap-2 sm:w-48">
      <label htmlFor="attempt-review-filter" className="font-medium text-sm">
        {assignmentResultSearchCopy.reviewViewLabel}
      </label>
      <NativeSelect
        id="attempt-review-filter"
        value={view.filter}
        onChange={(event) =>
          onFilterChange(event.currentTarget.value as AttemptReviewFilter)
        }
      >
        {view.options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {view.selectedFilterOption.description}
      </p>
    </div>
  );
}
