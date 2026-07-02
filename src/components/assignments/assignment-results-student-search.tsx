import type {
  StudentSummarySort,
  AssignmentResultStudentSearchControlView,
} from '@/assignments/result-view';
import { AssignmentResultControlStatusBadge } from '@/components/assignments/assignment-result-control-status-badge';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { IconSearch, IconX } from '@tabler/icons-react';

type AssignmentResultsStudentSearchProps = {
  onClear: () => void;
  onSearch: (value: string) => void;
  onSortChange: (sort: StudentSummarySort) => void;
  view: AssignmentResultStudentSearchControlView;
};

export function AssignmentResultsStudentSearch({
  onClear,
  onSearch,
  onSortChange,
  view,
}: AssignmentResultsStudentSearchProps) {
  const searchSummaryId = 'assignment-result-search-summary';
  const searchStatusDescriptionId =
    'assignment-result-search-status-description';
  const studentSortDescriptionId = 'student-summary-sort-description';
  const studentSortStatusDescriptionId =
    'student-summary-sort-status-description';

  return (
    <section className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-start">
      <div className="grid gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <label
            htmlFor="assignment-result-search"
            className="font-medium text-sm"
          >
            {view.label}
          </label>
          <AssignmentResultControlStatusBadge
            descriptionId={searchStatusDescriptionId}
            view={view.searchStatusView}
          />
        </div>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-result-search"
            value={view.value}
            placeholder={view.placeholder}
            className="pl-9 pr-9"
            aria-describedby={`${searchSummaryId} ${searchStatusDescriptionId}`}
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {view.hasSearchValue ? (
            <button
              type="button"
              aria-label={view.clearLabel}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClear}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <label htmlFor="student-summary-sort" className="font-medium text-sm">
            {view.sortLabel}
          </label>
          <AssignmentResultControlStatusBadge
            descriptionId={studentSortStatusDescriptionId}
            view={view.sortStatusView}
          />
        </div>
        <NativeSelect
          id="student-summary-sort"
          value={view.sort}
          aria-describedby={`${studentSortDescriptionId} ${studentSortStatusDescriptionId}`}
          onChange={(event) =>
            onSortChange(event.currentTarget.value as StudentSummarySort)
          }
        >
          {view.sortOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p
          id={studentSortDescriptionId}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {view.selectedSortOption.description}
        </p>
      </div>
      <p
        id={searchSummaryId}
        className="text-sm text-muted-foreground md:pt-7 md:text-right"
      >
        {view.summary}
      </p>
    </section>
  );
}
