import type {
  AssignmentResultStudentSearchControlView,
  StudentSummarySort,
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
  const searchDescriptionIds = [
    view.searchIds.description,
    view.searchIds.summary,
  ].join(' ');

  return (
    <>
      <section className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
        <div className="grid gap-2">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <label
              htmlFor={view.searchIds.input}
              className="font-medium text-sm"
            >
              {view.label}
            </label>
          </div>
          <div className="relative max-w-xl">
            <IconSearch
              aria-hidden="true"
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
            />
            <Input
              id={view.searchIds.input}
              value={view.value}
              placeholder={view.placeholder}
              className="pl-9 pr-9"
              aria-describedby={searchDescriptionIds}
              aria-label={view.searchAriaLabel}
              onChange={(event) => onSearch(event.currentTarget.value)}
            />
            {view.hasSearchValue ? (
              <button
                type="button"
                aria-describedby={searchDescriptionIds}
                aria-label={view.clearLabel}
                className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                onClick={onClear}
              >
                <IconX aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>
          <p id={view.searchIds.description} className="sr-only">
            {view.searchDescription}
          </p>
        </div>

        <div className="grid gap-2">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <label
              htmlFor={view.sortIds.select}
              className="font-medium text-sm"
            >
              {view.sortLabel}
            </label>
          </div>
          <NativeSelect
            id={view.sortIds.select}
            value={view.sort}
            aria-label={view.sortAriaLabel}
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
        </div>

        <p
          id={view.searchIds.summary}
          className="text-sm text-muted-foreground md:text-right"
        >
          {view.summary}
        </p>
      </section>
    </>
  );
}
