import type {
  ActivityLibraryStatus,
  ActivitySourceMaterialFilter,
  ActivityTemplateFilter,
} from '@/activities/library-filters';
import type { ActivityLibrarySummary } from '@/activities/library-summary';
import {
  activityLibrarySearchCopy,
  buildActivityLibrarySearchPanelView,
} from '@/activities/library-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  IconFolder,
  IconFolderOff,
  IconSearch,
  IconX,
} from '@tabler/icons-react';

type ActivityLibrarySearchProps = {
  isLoading: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearch: (value: string) => void;
  onSourceChange: (value: ActivitySourceMaterialFilter) => void;
  onStatusChange: (value: ActivityLibraryStatus) => void;
  onTemplateChange: (value: ActivityTemplateFilter) => void;
  source: ActivitySourceMaterialFilter;
  status: ActivityLibraryStatus;
  summary?: ActivityLibrarySummary;
  statusSummary?: ActivityLibrarySummary;
  template: ActivityTemplateFilter;
  total: number;
  value: string;
};

export function ActivityLibrarySearch({
  isLoading,
  onClearFilters,
  onClearSearch,
  onSearch,
  onSourceChange,
  onStatusChange,
  onTemplateChange,
  source,
  status,
  summary,
  statusSummary,
  template,
  total,
  value,
}: ActivityLibrarySearchProps) {
  const searchDescriptionId = 'activity-library-search-description';
  const sourceFilterDescriptionId = 'activity-source-filter-description';
  const statusFilterDescriptionId = 'activity-status-filter-description';
  const statusFilterGroupLabelId = 'activity-status-filter-label';
  const templateFilterDescriptionId = 'activity-template-filter-description';
  const searchPanelView = buildActivityLibrarySearchPanelView({
    isLoading,
    search: value,
    source,
    status,
    summary,
    statusSummary,
    template,
    total,
  });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_13rem_auto] xl:items-end">
      <div className="grid gap-2">
        <label
          htmlFor="activity-library-search"
          className="font-medium text-sm"
        >
          {activityLibrarySearchCopy.label}
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="activity-library-search"
            value={value}
            placeholder={activityLibrarySearchCopy.placeholder}
            className="pl-9 pr-9"
            aria-describedby={searchDescriptionId}
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {searchPanelView.hasSearchValue ? (
            <button
              type="button"
              aria-label={activityLibrarySearchCopy.clearSearchLabel}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClearSearch}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
        <p id={searchDescriptionId} className="sr-only">
          {searchPanelView.searchDescription}
        </p>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="activity-template-filter"
          className="font-medium text-sm"
        >
          {activityLibrarySearchCopy.templateLabel}
        </label>
        <NativeSelect
          id="activity-template-filter"
          value={template}
          aria-describedby={templateFilterDescriptionId}
          onChange={(event) =>
            onTemplateChange(
              event.currentTarget.value as ActivityTemplateFilter
            )
          }
        >
          {searchPanelView.templateOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p id={templateFilterDescriptionId} className="sr-only">
          {searchPanelView.templateDescription}
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor="activity-source-filter" className="font-medium text-sm">
          {activityLibrarySearchCopy.sourceLabel}
        </label>
        <NativeSelect
          id="activity-source-filter"
          value={source}
          aria-describedby={sourceFilterDescriptionId}
          onChange={(event) =>
            onSourceChange(
              event.currentTarget.value as ActivitySourceMaterialFilter
            )
          }
        >
          {searchPanelView.sourceOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p
          id={sourceFilterDescriptionId}
          className="text-xs leading-5 text-muted-foreground"
        >
          <span className="font-medium text-foreground">
            {searchPanelView.sourceFilterLabel}
          </span>
          {' - '}
          {searchPanelView.sourceFilterDescription}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {searchPanelView.sourceCapabilityMetrics.map((metric) => (
            <span
              key={metric.capability}
              className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {metric.value}
              </span>{' '}
              {metric.label}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <fieldset
          className="inline-flex w-fit rounded-lg border bg-background p-1"
          aria-describedby={statusFilterDescriptionId}
          aria-labelledby={statusFilterGroupLabelId}
        >
          <legend id={statusFilterGroupLabelId} className="sr-only">
            {activityLibrarySearchCopy.statusLabel}
          </legend>
          {searchPanelView.statusOptions.map((option) => {
            const Icon = option.value === 'active' ? IconFolder : IconFolderOff;

            return (
              <Button
                key={option.value}
                type="button"
                variant={status === option.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onStatusChange(option.value)}
                aria-pressed={status === option.value}
              >
                <Icon className="size-4" />
                {option.label}
              </Button>
            );
          })}
        </fieldset>
        <p
          id={statusFilterDescriptionId}
          className="text-xs leading-5 text-muted-foreground"
        >
          <span className="font-medium text-foreground">
            {searchPanelView.statusLabel}
          </span>
          {' - '}
          {searchPanelView.statusDescription}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {searchPanelView.statusMetrics.map((metric) => (
            <span
              key={metric.status}
              className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {metric.value}
              </span>{' '}
              {metric.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <p className="text-sm text-muted-foreground lg:text-right">
          {searchPanelView.filterSummary.text}
        </p>
        {searchPanelView.filterSummary.hasFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-background lg:w-auto"
            onClick={onClearFilters}
          >
            <IconX className="size-4" />
            {activityLibrarySearchCopy.clearFiltersLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
