import type {
  StudentSummarySort,
  AssignmentResultStudentSearchControlView,
} from '@/assignments/result-view';
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
  return (
    <section className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-start">
      <div className="grid gap-2">
        <label
          htmlFor="assignment-result-search"
          className="font-medium text-sm"
        >
          {view.label}
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-result-search"
            value={view.value}
            placeholder={view.placeholder}
            className="pl-9 pr-9"
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
        <label htmlFor="student-summary-sort" className="font-medium text-sm">
          {view.sortLabel}
        </label>
        <NativeSelect
          id="student-summary-sort"
          value={view.sort}
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          {view.selectedSortOption.description}
        </p>
      </div>
      <p className="text-sm text-muted-foreground md:pt-7 md:text-right">
        {view.summary}
      </p>
    </section>
  );
}
