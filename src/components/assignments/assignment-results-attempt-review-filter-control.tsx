import type {
  AttemptReviewFilter,
  AssignmentResultAttemptReviewFilterControlView,
} from '@/assignments/result-view';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

type AssignmentResultsAttemptReviewFilterControlProps = {
  onFilterChange: (filter: AttemptReviewFilter) => void;
  view: AssignmentResultAttemptReviewFilterControlView;
};

export function AssignmentResultsAttemptReviewFilterControl({
  onFilterChange,
  view,
}: AssignmentResultsAttemptReviewFilterControlProps) {
  return (
    <div className="flex flex-col gap-2 sm:w-48">
      <div className="flex min-w-0 items-center gap-2">
        <label htmlFor={view.ids.select} className="font-medium text-sm">
          {view.label}
        </label>
      </div>
      <NativeSelect
        id={view.ids.select}
        value={view.filter}
        aria-label={view.ariaLabel}
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
    </div>
  );
}
