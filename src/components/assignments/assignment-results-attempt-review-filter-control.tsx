import type {
  AttemptReviewFilter,
  AssignmentResultAttemptReviewFilterControlView,
} from '@/assignments/result-view';
import { AssignmentResultControlStatusBadge } from '@/components/assignments/assignment-result-control-status-badge';
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
  const descriptionId = 'attempt-review-filter-description';
  const statusDescriptionId = 'attempt-review-filter-status-description';

  return (
    <div className="flex flex-col gap-2 sm:w-48">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <label htmlFor="attempt-review-filter" className="font-medium text-sm">
          {view.label}
        </label>
        <AssignmentResultControlStatusBadge
          descriptionId={statusDescriptionId}
          view={view.statusView}
        />
      </div>
      <NativeSelect
        id="attempt-review-filter"
        value={view.filter}
        aria-describedby={`${descriptionId} ${statusDescriptionId}`}
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
      <p
        id={descriptionId}
        className="text-xs leading-relaxed text-muted-foreground"
      >
        {view.selectedFilterOption.description}
      </p>
    </div>
  );
}
