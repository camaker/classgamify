import type {
  AssignmentResultStudentSearchControlView,
  StudentSummarySort,
} from '@/assignments/result-view';
import type { AssignmentResultStudentSearchHandoffView } from '@/assignments/result-student-search-handoff';
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
  searchHandoffView: AssignmentResultStudentSearchHandoffView;
  view: AssignmentResultStudentSearchControlView;
};

export function AssignmentResultsStudentSearch({
  onClear,
  onSearch,
  onSortChange,
  searchHandoffView,
  view,
}: AssignmentResultsStudentSearchProps) {
  const searchDescriptionIds = [
    view.searchIds.description,
    view.searchIds.summary,
    view.searchIds.searchStatusDescription,
  ].join(' ');
  const sortDescriptionIds = [
    view.sortIds.description,
    view.sortIds.statusDescription,
  ].join(' ');

  return (
    <>
      <section className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-start">
        <div className="grid gap-2">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <label
              htmlFor={view.searchIds.input}
              className="font-medium text-sm"
            >
              {view.label}
            </label>
            <AssignmentResultControlStatusBadge
              descriptionId={view.searchIds.searchStatusDescription}
              view={view.searchStatusView}
            />
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
            <AssignmentResultControlStatusBadge
              descriptionId={view.sortIds.statusDescription}
              view={view.sortStatusView}
            />
          </div>
          <NativeSelect
            id={view.sortIds.select}
            value={view.sort}
            aria-describedby={sortDescriptionIds}
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
          <p
            id={view.sortIds.description}
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {view.selectedSortOption.description}
          </p>
        </div>

        <p
          id={view.searchIds.summary}
          className="text-sm text-muted-foreground md:pt-7 md:text-right"
        >
          {view.summary}
        </p>
      </section>
      <AssignmentResultStudentSearchHandoff view={searchHandoffView} />
    </>
  );
}

function AssignmentResultStudentSearchHandoff({
  view,
}: {
  view: AssignmentResultStudentSearchHandoffView;
}) {
  const titleId = 'assignment-result-student-search-handoff-title';
  const descriptionId = 'assignment-result-student-search-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-result-student-search"
      data-handoff-scope={view.privacy.scope}
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <AssignmentResultStudentSearchHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentResultStudentSearchHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultStudentSearchHandoffView['itemViews'][number];
}) {
  const labelId = `assignment-result-student-search-handoff-${itemView.id}-label`;
  const valueId = `assignment-result-student-search-handoff-${itemView.id}-value`;
  const descriptionId = `assignment-result-student-search-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        {itemView.statusLabel ? (
          <span aria-hidden="true">{itemView.statusLabel}</span>
        ) : null}
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}
