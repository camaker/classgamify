import type { AssignmentStatusFilter } from '@/assignments/list-filters';
import {
  assignmentListActionCopy,
  assignmentListSearchCopy,
  buildAssignmentListSearchPanelView,
} from '@/assignments/list-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { IconFilter, IconSearch, IconX } from '@tabler/icons-react';

type AssignmentListFiltersProps = {
  isLoading: boolean;
  onClear: () => void;
  onSearch: (value: string) => void;
  onStatusChange: (value: AssignmentStatusFilter) => void;
  search: string;
  status: AssignmentStatusFilter;
  total: number;
};

export function AssignmentListFilters({
  isLoading,
  onClear,
  onSearch,
  onStatusChange,
  search,
  status,
  total,
}: AssignmentListFiltersProps) {
  const searchPanelView = buildAssignmentListSearchPanelView({
    isLoading,
    search,
    status,
    total,
  });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end">
      <div className="grid gap-2">
        <label htmlFor="assignment-list-search" className="font-medium text-sm">
          {assignmentListSearchCopy.label}
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-list-search"
            value={search}
            placeholder={assignmentListSearchCopy.placeholder}
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {searchPanelView.hasSearchValue ? (
            <button
              type="button"
              aria-label={assignmentListSearchCopy.clearSearchLabel}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => onSearch('')}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="assignment-status-filter"
          className="font-medium text-sm"
        >
          {assignmentListSearchCopy.statusLabel}
        </label>
        <NativeSelect
          id="assignment-status-filter"
          value={status}
          onChange={(event) =>
            onStatusChange(event.currentTarget.value as AssignmentStatusFilter)
          }
        >
          {searchPanelView.statusOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2 lg:items-end">
        <p className="text-sm text-muted-foreground">
          {searchPanelView.filterSummary.text}
        </p>
        {searchPanelView.filterSummary.hasFilters ? (
          <Button
            type="button"
            variant="outline"
            className="w-full bg-background lg:w-auto"
            onClick={onClear}
          >
            <IconFilter className="size-4" />
            {assignmentListActionCopy.clearFilters}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
