import {
  getActivityTemplates,
  getStarterActivities,
  getTemplateByType,
} from '@/activities/catalog';
import {
  ACTIVITY_LIBRARY_PAGE_SIZE,
  type ActivityLibraryCreatedSource,
  type ActivityLibraryStatus,
  type ActivitySourceMaterialFilter,
  type ActivityTemplateFilter,
  getActivityLibraryTotalPages,
  normalizeActivityLibrarySearch,
} from '@/activities/library-filters';
import {
  canArchiveActivity,
  canEditActivity,
  canDeriveActivityWork,
  canRestoreActivity,
  type ActivityDerivativeAction,
  type ActivityLifecycleAction,
  buildActivityLifecycleActionView,
  buildActivityDerivativeActionGate,
  type ActivityLifecycleActionCopy,
  type ActivityLifecycleActionView,
  getActivityLifecycleActionCopy,
  isActivityArchived,
} from '@/activities/lifecycle';
import {
  buildActivityLibraryCardSummary,
  buildActivityLibraryFilterSummary,
  buildActivityLibrarySourceCapabilityMetrics,
  buildActivityLibraryStatusMetrics,
  buildActivityLibrarySummaryMetrics,
  type ActivityLibraryCardSummary,
  type ActivityLibraryFilterSummary,
  type ActivityLibrarySourceCapabilityMetric,
  type ActivityLibraryStatusMetric,
  type ActivityLibrarySummary,
  type ActivityLibrarySummaryMetric,
  type ActivityLibraryTemplateOption,
  normalizeActivityLibraryListCount,
} from '@/activities/library-summary';
import {
  buildActivitySourceMaterialSummaryView,
  type ActivitySourceMaterialSummaryView,
} from '@/activities/material-summary';
import { normalizeRuntimeDisplayText } from '@/activities/runtime-display';
import type {
  ActivityContent,
  ActivitySeed,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

type ActivityLibraryStatusOption = {
  label: string;
  value: ActivityLibraryStatus;
};

type ActivitySourceMaterialFilterOption = {
  label: string;
  value: ActivitySourceMaterialFilter;
};

type ActivityLibraryTemplateFilterOption = {
  label: string;
  value: ActivityTemplateFilter;
};

type ActivityLibraryEmptyStateView = {
  actionLabel: string;
  description: string;
  showStarterActivities: boolean;
  title: string;
};

type ActivityLibraryCardStatKey = 'groups' | 'pairs' | 'questions';

export type ActivityLibraryCardStat = {
  ariaLabel: string;
  description: string;
  key: ActivityLibraryCardStatKey;
  label: string;
  value: number;
};

export type ActivityLibraryReadyTemplateOptionView =
  ActivityLibraryTemplateOption & {
    isCurrent: boolean;
  };

export type ActivityLibraryRemixActionOptionView =
  ActivityLibraryTemplateOption & {
    actionLabel: string;
  };

export type ActivityLibraryActionStatusTone = 'blocked' | 'ready';

export type ActivityLibraryActionStatusView = {
  ariaLabel: string;
  description: string;
  label: string;
  tone: ActivityLibraryActionStatusTone;
  value: string;
};

export type ActivityLibraryLockedTemplateDiagnosticView = {
  diagnosis: string;
  id: ActivityTemplateType;
};

export type ActivityLibraryCompatibilityView = {
  lockedTemplateDiagnostics: ActivityLibraryLockedTemplateDiagnosticView[];
  readyTemplateOptions: ActivityLibraryReadyTemplateOptionView[];
  remixStatusView: ActivityLibraryActionStatusView;
  remixActionOptions: ActivityLibraryRemixActionOptionView[];
  restoreRequiredMessage?: string;
  remixHint?: string;
};

export const ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS = {
  lockedTemplateDiagnostics: 2,
  remixActionOptions: 3,
} as const;

export type ActivityLibraryCardActionState = {
  canCreateDerivedWork: boolean;
  showArchiveAction: boolean;
  showDerivativeActions: boolean;
  showEditAction: boolean;
  showPersistedActions: boolean;
  showPublishAction: boolean;
  showRestoreAction: boolean;
  showRestoreRequiredMessage: boolean;
  showRemixHint: boolean;
  showRemixActions: boolean;
};

export type ActivityLibraryCardStatusSummaryItemId =
  | 'library-status'
  | 'publish'
  | 'remix'
  | 'source-materials';

export type ActivityLibraryCardStatusSummaryTone =
  | 'blocked'
  | 'neutral'
  | 'ready';

export type ActivityLibraryCardStatusSummaryItem = {
  ariaLabel: string;
  description: string;
  id: ActivityLibraryCardStatusSummaryItemId;
  label: string;
  tone: ActivityLibraryCardStatusSummaryTone;
  value: string;
};

export type ActivityLibraryCardStatusSummaryView = {
  ariaLabel: string;
  items: ActivityLibraryCardStatusSummaryItem[];
  label: string;
};

type PersistedActivityLibraryCardSource = {
  contentJson: ActivityContent;
  description: string | null;
  id: string;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

export type ActivityLibraryCardViewModel = {
  content: ActivityContent;
  description: string;
  id: string;
  persisted: boolean;
  status: ActivityVisibility;
  templateType: ActivityTemplateType;
  title: string;
};

export type ActivityLibraryCardDisplayView = {
  editAction: ActivityLibraryEditorActionView;
  actionState: ActivityLibraryCardActionState;
  actionView: ActivityLibraryCardActionView;
  actionsLabel: string;
  ariaLabel: string;
  compatibility: ActivityLibraryCompatibilityView;
  compatibilityLabel: string;
  contentLabel: string;
  detailsLabel: string;
  displayDescription: string;
  displayTitle: string;
  restoreRequiredLabel: string;
  sourceMaterials: ActivitySourceMaterialSummaryView;
  sourceMaterialsLabel: string;
  sourceMaterialEditAction: ActivityLibraryEditorActionView;
  statusSummary: ActivityLibraryCardStatusSummaryView;
  stats: ActivityLibraryCardStat[];
  statusLabel: string;
  templateName: string;
  templateType: ActivityTemplateType;
};

export type ActivityLibraryCardTemplateType = ActivityTemplateType;

export type CreatedActivityListItem = {
  id: string;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

export type CreatedActivityPanelContext = {
  activity?: CreatedActivityListItem;
  actionView: CreatedActivityPanelActionView;
  body: string;
  showCreateAction: boolean;
  showDismissAction: boolean;
  showEditAction: boolean;
  showMissingHint: boolean;
  showPublishAction: boolean;
  status: 'found' | 'loading' | 'missing';
  title: string;
};

export type CreatedActivityPanelActivity = CreatedActivityListItem | undefined;

export type CreatedActivityPanelEditAction = ActivityLibraryEditorActionView;

export type CreatedActivityPanelPublishActionView =
  ActivityLibraryCardDerivativeActionView;

export type CreatedActivityPanelCreateActionView = {
  label: string;
  to: typeof Routes.Create;
};

export type CreatedActivityPanelDismissActionView = {
  label: string;
};

export type CreatedActivityPanelActionView = {
  create: CreatedActivityPanelCreateActionView;
  dismiss: CreatedActivityPanelDismissActionView;
  edit?: CreatedActivityPanelEditAction;
  publish?: CreatedActivityPanelPublishActionView;
};

type ActivityLibraryPageBreadcrumb = {
  href?: string;
  id: 'activities' | 'dashboard';
  isCurrentPage?: boolean;
  label: string;
};

type ActivityLibraryPageSearchState = {
  created?: string;
  createdFrom?: ActivityLibraryCreatedSource;
  page?: number;
  q?: string;
  source?: ActivitySourceMaterialFilter;
  status?: ActivityLibraryStatus;
  template?: ActivityTemplateFilter;
};

type ActivityLibraryPageResolvedSearch = {
  currentPage: number;
  hasFilters: boolean;
  libraryStatus: ActivityLibraryStatus;
  normalizedSearchQuery?: string;
  searchQuery: string;
  sourceFilter: ActivitySourceMaterialFilter;
  templateFilter: ActivityTemplateFilter;
};

type ActivityLibrarySearchPanelView = {
  filterSummary: ActivityLibraryFilterSummary;
  hasSearchValue: boolean;
  searchDescription: string;
  sourceCapabilityMetrics: ActivityLibrarySourceCapabilityMetric[];
  sourceFilterDescription: string;
  sourceFilterLabel: string;
  sourceOptions: ActivitySourceMaterialFilterOption[];
  statusDescription: string;
  statusLabel: string;
  statusMetrics: ActivityLibraryStatusMetric[];
  statusOptions: ActivityLibraryStatusOption[];
  templateDescription: string;
  templateOptions: ActivityLibraryTemplateFilterOption[];
};

export type ActivityLibraryPageScopeItemId =
  | 'page'
  | 'range'
  | 'search'
  | 'source'
  | 'status'
  | 'template';

export type ActivityLibraryPageScopeItem = {
  description: string;
  id: ActivityLibraryPageScopeItemId;
  label: string;
  value: string;
};

export type ActivityLibraryPageScopeView = {
  items: ActivityLibraryPageScopeItem[];
  label: string;
  summary: string;
};

export type ActivityLibraryCardActionButtonView =
  ActivityLifecycleActionCopy & {
    ariaLabel: string;
    label: string;
    statusView: ActivityLibraryActionStatusView;
  };

export type ActivityLibraryCardDerivativeActionView =
  ActivityLifecycleActionView & {
    ariaLabel: string;
    label: string;
    statusView: ActivityLibraryActionStatusView;
  };

export type ActivityLibraryCardRestoreActionView =
  ActivityLibraryCardActionButtonView & {
    requiredMessage: string;
  };

export type ActivityLibraryCardRemixActionView = ActivityLifecycleActionView & {
  statusView: ActivityLibraryActionStatusView;
};

export type ActivityLibraryCardActionView = {
  archive: ActivityLibraryCardActionButtonView;
  duplicate: ActivityLibraryCardDerivativeActionView;
  publish: ActivityLibraryCardDerivativeActionView;
  remix: ActivityLibraryCardRemixActionView;
  restore: ActivityLibraryCardRestoreActionView;
};

export type ActivityLibraryEditorActionView = {
  activityId: string;
  label: string;
  to: typeof Routes.DashboardActivityEdit;
};

type ActivityLibraryPageItem = PersistedActivityLibraryCardSource & {
  id: string;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

type ActivityLibraryPageData<TItem extends ActivityLibraryPageItem> = {
  createdActivity?: CreatedActivityListItem | null;
  items: TItem[];
  summary?: ActivityLibrarySummary;
  statusSummary?: ActivityLibrarySummary;
  total: number;
};

type ActivityLibraryPageViewModel<TItem extends ActivityLibraryPageItem> = {
  activities: TItem[];
  breadcrumbs: ActivityLibraryPageBreadcrumb[];
  createdPanelContext?: CreatedActivityPanelContext;
  description: string;
  emptyState: ActivityLibraryEmptyStateView;
  hasActivities: boolean;
  hero: typeof activityLibraryHeroCopy;
  loadErrorMessage: string;
  resolvedSearch: ActivityLibraryPageResolvedSearch;
  scopeView: ActivityLibraryPageScopeView;
  starterPreview: ActivityLibraryStarterPreview;
  summaryMetrics: ActivityLibrarySummaryMetric[];
  title: string;
  totalActivities: number;
  totalPages: number;
};

type ActivityLibraryRouteState<TItem extends ActivityLibraryPageItem> =
  | {
      pageView: ActivityLibraryPageViewModel<TItem>;
      showLoadError: false;
      status: 'loading';
    }
  | {
      pageView: ActivityLibraryPageViewModel<TItem>;
      showLoadError: true;
      status: 'error';
    }
  | {
      pageView: ActivityLibraryPageViewModel<TItem>;
      showLoadError: boolean;
      status: 'empty-filtered';
    }
  | {
      pageView: ActivityLibraryPageViewModel<TItem>;
      showLoadError: boolean;
      status: 'empty-starter';
    }
  | {
      pageView: ActivityLibraryPageViewModel<TItem>;
      showLoadError: boolean;
      status: 'ready';
    };

export type ActivityLibraryStarterPreview = {
  activities: ActivitySeed[];
  source: 'starter-preview';
};

export const activityLibraryPageCopy = {
  get breadcrumbCurrent() {
    return m.activity_library_breadcrumb_current();
  },
  get breadcrumbDashboard() {
    return m.activity_library_breadcrumb_dashboard();
  },
  get createActivityLabel() {
    return m.activity_library_page_create();
  },
  get description() {
    return m.activity_library_page_description();
  },
  get loadErrorMessage() {
    return m.activity_library_load_error();
  },
  get title() {
    return m.activity_library_page_title();
  },
} as const;

export const activityLibraryActionCopy = {
  get dismiss() {
    return m.activity_library_action_dismiss();
  },
} as const;

export const activityLibraryCreatedPanelCopy = {
  get missingHint() {
    return m.activity_library_created_panel_missing_hint();
  },
  get savedLabel() {
    return m.activity_library_created_panel_label();
  },
} as const;

export const activityLibraryHeroCopy = {
  get badgeLabel() {
    return m.activity_library_hero_badge();
  },
  get description() {
    return m.activity_library_hero_description();
  },
  get title() {
    return m.activity_library_hero_title();
  },
} as const;

export const activityLibrarySearchCopy = {
  get clearFiltersLabel() {
    return m.activity_library_filter_clear_filters();
  },
  get clearSearchLabel() {
    return m.activity_library_filter_clear_search();
  },
  get label() {
    return m.activity_library_filter_label();
  },
  get placeholder() {
    return m.activity_library_filter_placeholder();
  },
  get searchDescription() {
    return m.activity_library_filter_search_description();
  },
  get statusOptions() {
    return [
      { label: m.activity_library_filter_active(), value: 'active' },
      { label: m.activity_library_filter_archived(), value: 'archived' },
    ];
  },
  get sourceLabel() {
    return m.activity_library_filter_source_label();
  },
  get statusLabel() {
    return m.activity_library_filter_status_label();
  },
  get statusDescription() {
    return m.activity_library_filter_status_description();
  },
  get sourceOptions() {
    return [
      { label: m.activity_library_filter_source_all(), value: 'all' },
      {
        label: m.activity_library_filter_source_extractable(),
        value: 'extractable',
      },
      { label: m.activity_library_filter_source_audio(), value: 'audio' },
      {
        label: m.activity_library_filter_source_spreadsheet(),
        value: 'spreadsheet',
      },
      {
        label: m.activity_library_filter_source_worksheet(),
        value: 'worksheet',
      },
    ];
  },
  get templateLabel() {
    return m.activity_library_filter_template_label();
  },
  get templateDescription() {
    return m.activity_library_filter_template_description();
  },
  get templatePlaceholder() {
    return m.activity_library_filter_template_placeholder();
  },
} satisfies {
  clearFiltersLabel: string;
  clearSearchLabel: string;
  label: string;
  placeholder: string;
  searchDescription: string;
  sourceLabel: string;
  sourceOptions: ActivitySourceMaterialFilterOption[];
  statusDescription: string;
  statusOptions: ActivityLibraryStatusOption[];
  templateDescription: string;
  templateLabel: string;
  templatePlaceholder: string;
  statusLabel: string;
} as const;

export const activityLibraryCardCopy = {
  get actionLabels() {
    return {
      archive: m.activity_library_action_archive(),
      duplicate: m.activity_library_action_duplicate(),
      edit: m.activity_library_action_edit(),
      publish: m.activity_library_action_publish(),
      restore: m.activity_library_action_restore(),
    };
  },
  get compatibleTemplatesLabel() {
    return m.activity_library_card_compatible_templates();
  },
  get restoreRequiredMessage() {
    return m.activity_library_card_restore_required();
  },
  get remixRestoreRequiredMessage() {
    return m.activity_library_card_remix_restore_required();
  },
  get remixActionLabel() {
    return m.activity_library_action_remix();
  },
  get sourceMaterialEditActionLabel() {
    return m.activity_library_card_source_material_edit_action();
  },
} as const;

const activityLibraryEmptyStateCopy = {
  archived: {
    get actionLabel() {
      return activityLibrarySearchCopy.clearFiltersLabel;
    },
    get description() {
      return m.activity_library_empty_archived_description();
    },
    get title() {
      return m.activity_library_empty_archived_title();
    },
  },
  emptyLibrary: {
    get actionLabel() {
      return activityLibraryPageCopy.createActivityLabel;
    },
    get description() {
      return m.activity_library_empty_saved_description();
    },
    get title() {
      return m.activity_library_empty_saved_title();
    },
  },
  filtered: {
    get actionLabel() {
      return activityLibrarySearchCopy.clearFiltersLabel;
    },
    get description() {
      return m.activity_library_empty_filtered_description();
    },
    get title() {
      return m.activity_library_empty_filtered_title();
    },
  },
} as const;

export function buildActivityLibraryEmptyStateView({
  search,
  source,
  status,
  template,
}: {
  search?: string;
  source?: ActivitySourceMaterialFilter;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
}): ActivityLibraryEmptyStateView {
  const sourceFilter = source ?? 'all';
  const hasContentFilters =
    Boolean(search) || sourceFilter !== 'all' || template !== 'all';
  const hasFilters = hasContentFilters || status !== 'active';

  if (status === 'archived' && !hasContentFilters) {
    return {
      ...activityLibraryEmptyStateCopy.archived,
      showStarterActivities: false,
    };
  }

  if (hasFilters) {
    const sourceFilterView =
      sourceFilter === 'all'
        ? undefined
        : buildActivityLibrarySourceFilterView(sourceFilter);

    return {
      ...activityLibraryEmptyStateCopy.filtered,
      description: sourceFilterView
        ? m.activity_library_empty_source_filtered_description({
            source: sourceFilterView.label,
          })
        : activityLibraryEmptyStateCopy.filtered.description,
      showStarterActivities: false,
    };
  }

  return {
    ...activityLibraryEmptyStateCopy.emptyLibrary,
    showStarterActivities: true,
  };
}

export function buildActivityLibraryPageViewModel<
  TItem extends ActivityLibraryPageItem,
>({
  data,
  isLoading,
  starterPreview,
  search,
}: {
  data?: ActivityLibraryPageData<TItem> | null;
  isLoading: boolean;
  starterPreview?: ActivityLibraryStarterPreview;
  search: ActivityLibraryPageSearchState;
}): ActivityLibraryPageViewModel<TItem> {
  const resolvedSearch = resolveActivityLibraryPageSearch(search);
  const activities = data?.items ?? [];
  const totalActivities = normalizeActivityLibraryListCount(data?.total ?? 0);
  const totalPages = getActivityLibraryTotalPages({
    pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
    total: totalActivities,
  });
  const createdPanelActivity = resolveCreatedActivityPanelActivity({
    activity: data?.createdActivity,
    activityId: search.created,
    items: activities,
  });
  const createdPanelContext = search.created
    ? buildCreatedActivityPanelContext({
        activity: createdPanelActivity,
        createdFrom: search.createdFrom,
        isLoading,
      })
    : undefined;
  const emptyState = buildActivityLibraryEmptyStateView({
    search: resolvedSearch.normalizedSearchQuery,
    source: resolvedSearch.sourceFilter,
    status: resolvedSearch.libraryStatus,
    template: resolvedSearch.templateFilter,
  });
  const resolvedStarterPreview = resolveActivityLibraryStarterPreview({
    activities,
    emptyState,
    isLoading,
    starterPreview,
  });

  return {
    activities,
    breadcrumbs: [
      {
        href: Routes.Dashboard,
        id: 'dashboard',
        label: activityLibraryPageCopy.breadcrumbDashboard,
      },
      {
        id: 'activities',
        isCurrentPage: true,
        label: activityLibraryPageCopy.breadcrumbCurrent,
      },
    ],
    createdPanelContext,
    description: activityLibraryPageCopy.description,
    emptyState,
    hasActivities: activities.length > 0,
    hero: activityLibraryHeroCopy,
    loadErrorMessage: activityLibraryPageCopy.loadErrorMessage,
    resolvedSearch,
    scopeView: buildActivityLibraryPageScopeView({
      currentPage: resolvedSearch.currentPage,
      pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
      search: resolvedSearch.searchQuery,
      source: resolvedSearch.sourceFilter,
      status: resolvedSearch.libraryStatus,
      template: resolvedSearch.templateFilter,
      total: totalActivities,
      totalPages,
      visibleCount: activities.length,
    }),
    starterPreview: resolvedStarterPreview,
    summaryMetrics: buildActivityLibrarySummaryMetrics({
      hasFilters: resolvedSearch.hasFilters,
      summary: data?.summary,
      totalActivities,
    }),
    title: activityLibraryPageCopy.title,
    totalActivities,
    totalPages,
  };
}

export function buildActivityLibraryRouteState<
  TItem extends ActivityLibraryPageItem,
>({
  data,
  isError,
  isLoading,
  search,
}: {
  data?: ActivityLibraryPageData<TItem> | null;
  isError: boolean;
  isLoading: boolean;
  search: ActivityLibraryPageSearchState;
}): ActivityLibraryRouteState<TItem> {
  const pageView = buildActivityLibraryPageViewModel({
    data,
    isLoading,
    search,
    ...(isError && !data
      ? { starterPreview: createEmptyActivityLibraryStarterPreview() }
      : {}),
  });

  if (isLoading) {
    return {
      pageView,
      showLoadError: false,
      status: 'loading',
    };
  }

  if (isError && !data) {
    return {
      pageView,
      showLoadError: true,
      status: 'error',
    };
  }

  if (!pageView.hasActivities && pageView.resolvedSearch.hasFilters) {
    return {
      pageView,
      showLoadError: isError,
      status: 'empty-filtered',
    };
  }

  if (!pageView.hasActivities) {
    return {
      pageView,
      showLoadError: isError,
      status: 'empty-starter',
    };
  }

  return {
    pageView,
    showLoadError: isError,
    status: 'ready',
  };
}

export function buildActivityLibraryStarterPreview(): ActivityLibraryStarterPreview {
  return {
    activities: getStarterActivities(),
    source: 'starter-preview',
  };
}

function createEmptyActivityLibraryStarterPreview(): ActivityLibraryStarterPreview {
  return {
    activities: [],
    source: 'starter-preview',
  };
}

function resolveActivityLibraryStarterPreview<TItem>({
  activities,
  emptyState,
  isLoading,
  starterPreview,
}: {
  activities: TItem[];
  emptyState: ActivityLibraryEmptyStateView;
  isLoading: boolean;
  starterPreview?: ActivityLibraryStarterPreview;
}) {
  if (isLoading || activities.length > 0 || !emptyState.showStarterActivities) {
    return createEmptyActivityLibraryStarterPreview();
  }

  return starterPreview ?? buildActivityLibraryStarterPreview();
}

export function buildActivityLibrarySearchPanelView({
  isLoading,
  search,
  source,
  status,
  summary,
  statusSummary,
  template,
  total,
}: {
  isLoading: boolean;
  search: string;
  source: ActivitySourceMaterialFilter;
  status: ActivityLibraryStatus;
  summary?: ActivityLibrarySummary;
  statusSummary?: ActivityLibrarySummary;
  template: ActivityTemplateFilter;
  total: number;
}): ActivityLibrarySearchPanelView {
  const normalizedSearch = normalizeActivityLibrarySearch(search);
  const sourceFilterView = buildActivityLibrarySourceFilterView(source);
  const statusFilterView = buildActivityLibraryStatusFilterView(status);

  return {
    filterSummary: buildActivityLibraryFilterSummary({
      isLoading,
      search: normalizedSearch,
      source,
      status,
      template,
      total,
    }),
    hasSearchValue: Boolean(normalizedSearch),
    searchDescription: activityLibrarySearchCopy.searchDescription,
    sourceCapabilityMetrics:
      buildActivityLibrarySourceCapabilityMetrics(summary),
    sourceFilterDescription:
      m.activity_library_filter_source_selected_description({
        description: sourceFilterView.description,
        source: sourceFilterView.label,
      }),
    sourceFilterLabel: sourceFilterView.label,
    sourceOptions: activityLibrarySearchCopy.sourceOptions,
    statusDescription: m.activity_library_filter_status_selected_description({
      description: statusFilterView.description,
      status: statusFilterView.label,
    }),
    statusLabel: statusFilterView.label,
    statusMetrics: buildActivityLibraryStatusMetrics(statusSummary ?? summary),
    statusOptions: activityLibrarySearchCopy.statusOptions,
    templateDescription: activityLibrarySearchCopy.templateDescription,
    templateOptions: buildActivityLibraryTemplateFilterOptions(),
  };
}

export function buildActivityLibraryPageScopeView({
  currentPage,
  pageSize = ACTIVITY_LIBRARY_PAGE_SIZE,
  search,
  source,
  status,
  template,
  total,
  totalPages,
  visibleCount,
}: {
  currentPage: number;
  pageSize?: number;
  search?: string;
  source: ActivitySourceMaterialFilter;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
  total: number;
  totalPages: number;
  visibleCount: number;
}): ActivityLibraryPageScopeView {
  const normalizedCurrentPage = normalizeActivityLibraryScopePage(currentPage);
  const normalizedPageSize = normalizeActivityLibraryScopePageSize(pageSize);
  const normalizedSearch = normalizeActivityLibrarySearch(search);
  const normalizedTotal = normalizeActivityLibraryListCount(total);
  const normalizedTotalPages = Math.max(
    1,
    normalizeActivityLibraryListCount(totalPages)
  );
  const normalizedVisibleCount = Math.min(
    normalizeActivityLibraryListCount(visibleCount),
    normalizedTotal
  );
  const firstVisible =
    normalizedTotal > 0 && normalizedVisibleCount > 0
      ? (normalizedCurrentPage - 1) * normalizedPageSize + 1
      : 0;
  const lastVisible =
    firstVisible > 0
      ? Math.min(normalizedTotal, firstVisible + normalizedVisibleCount - 1)
      : 0;
  const sourceFilterView = buildActivityLibrarySourceFilterView(source);
  const statusFilterView = buildActivityLibraryStatusFilterView(status);
  const templateFilterView = buildActivityLibraryTemplateScopeView(template);
  const isOutOfRange =
    normalizedTotal > 0 && normalizedCurrentPage > normalizedTotalPages;
  const hasResults =
    normalizedTotal > 0 && normalizedVisibleCount > 0 && !isOutOfRange;

  return {
    items: [
      {
        description: m.activity_library_scope_range_description(),
        id: 'range',
        label: m.activity_library_scope_range_label(),
        value: hasResults
          ? m.activity_library_scope_range_value({
              firstItem: formatActivityLibraryScopeNumber(firstVisible),
              lastItem: formatActivityLibraryScopeNumber(lastVisible),
              total: formatActivityLibraryScopeNumber(normalizedTotal),
            })
          : m.activity_library_scope_range_empty_value(),
      },
      {
        description: isOutOfRange
          ? m.activity_library_scope_page_out_of_range_description({
              totalPages:
                formatActivityLibraryScopeNumber(normalizedTotalPages),
            })
          : m.activity_library_scope_page_description(),
        id: 'page',
        label: m.activity_library_scope_page_label(),
        value: m.activity_library_scope_page_value({
          currentPage: formatActivityLibraryScopeNumber(normalizedCurrentPage, {
            min: 1,
          }),
          totalPages: formatActivityLibraryScopeNumber(normalizedTotalPages, {
            min: 1,
          }),
        }),
      },
      {
        description: statusFilterView.description,
        id: 'status',
        label: m.activity_library_scope_status_label(),
        value: statusFilterView.label,
      },
      {
        description: templateFilterView.description,
        id: 'template',
        label: m.activity_library_scope_template_label(),
        value: templateFilterView.label,
      },
      {
        description: sourceFilterView.description,
        id: 'source',
        label: m.activity_library_scope_source_label(),
        value: sourceFilterView.label,
      },
      {
        description: normalizedSearch
          ? m.activity_library_scope_search_filtered_description()
          : m.activity_library_scope_search_all_description(),
        id: 'search',
        label: m.activity_library_scope_search_label(),
        value: normalizedSearch ?? m.activity_library_scope_search_all_value(),
      },
    ],
    label: m.activity_library_scope_label(),
    summary: isOutOfRange
      ? m.activity_library_scope_summary_out_of_range({
          currentPage: formatActivityLibraryScopeNumber(normalizedCurrentPage, {
            min: 1,
          }),
          totalPages: formatActivityLibraryScopeNumber(normalizedTotalPages, {
            min: 1,
          }),
        })
      : hasResults
        ? m.activity_library_scope_summary({
            currentPage: formatActivityLibraryScopeNumber(
              normalizedCurrentPage,
              { min: 1 }
            ),
            firstItem: formatActivityLibraryScopeNumber(firstVisible),
            lastItem: formatActivityLibraryScopeNumber(lastVisible),
            total: formatActivityLibraryScopeNumber(normalizedTotal),
            totalPages: formatActivityLibraryScopeNumber(normalizedTotalPages, {
              min: 1,
            }),
          })
        : m.activity_library_scope_summary_empty(),
  };
}

function buildActivityLibraryStatusFilterView(status: ActivityLibraryStatus) {
  const option =
    activityLibrarySearchCopy.statusOptions.find(
      (item) => item.value === status
    ) ?? activityLibrarySearchCopy.statusOptions[0];

  return {
    description: activityLibrarySearchCopy.statusDescription,
    label: option.label,
  };
}

function buildActivityLibraryTemplateScopeView(
  template: ActivityTemplateFilter
) {
  if (template === 'all') {
    return {
      description: m.activity_library_scope_template_all_description(),
      label: activityLibrarySearchCopy.templatePlaceholder,
    };
  }

  return {
    description: m.activity_library_scope_template_filtered_description(),
    label: getTemplateByType(template).name,
  };
}

function buildActivityLibrarySourceFilterView(
  source: ActivitySourceMaterialFilter
) {
  switch (source) {
    case 'audio':
      return {
        description: m.activity_library_filter_source_audio_description(),
        label: m.activity_library_filter_source_audio(),
      };
    case 'extractable':
      return {
        description: m.activity_library_filter_source_extractable_description(),
        label: m.activity_library_filter_source_extractable(),
      };
    case 'spreadsheet':
      return {
        description: m.activity_library_filter_source_spreadsheet_description(),
        label: m.activity_library_filter_source_spreadsheet(),
      };
    case 'worksheet':
      return {
        description: m.activity_library_filter_source_worksheet_description(),
        label: m.activity_library_filter_source_worksheet(),
      };
    case 'all':
      return {
        description: m.activity_library_filter_source_all_description(),
        label: m.activity_library_filter_source_all(),
      };
  }
}

export function buildActivityLibraryTemplateFilterOptions(): ActivityLibraryTemplateFilterOption[] {
  return [
    {
      label: activityLibrarySearchCopy.templatePlaceholder,
      value: 'all',
    },
    ...getActivityTemplates().map((template) => ({
      label: template.name,
      value: template.type,
    })),
  ];
}

export function resolveActivityLibraryPageSearch(
  search: ActivityLibraryPageSearchState
): ActivityLibraryPageResolvedSearch {
  const searchQuery = search.q ?? '';
  const libraryStatus = search.status ?? 'active';
  const sourceFilter = search.source ?? 'all';
  const templateFilter = search.template ?? 'all';
  const currentPage =
    search.page && Number.isInteger(search.page) && search.page > 0
      ? search.page
      : 1;
  const normalizedSearchQuery = normalizeActivityLibrarySearch(searchQuery);

  return {
    currentPage,
    hasFilters:
      Boolean(normalizedSearchQuery) ||
      sourceFilter !== 'all' ||
      templateFilter !== 'all' ||
      libraryStatus !== 'active',
    libraryStatus,
    normalizedSearchQuery,
    searchQuery,
    sourceFilter,
    templateFilter,
  };
}

function normalizeActivityLibraryScopePage(value: number) {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function normalizeActivityLibraryScopePageSize(value: number) {
  return Number.isInteger(value) && value > 0
    ? value
    : ACTIVITY_LIBRARY_PAGE_SIZE;
}

function formatActivityLibraryScopeNumber(
  value: number,
  options?: { min?: number }
) {
  const normalizedValue = normalizeActivityLibraryListCount(value);
  return String(
    options?.min === undefined
      ? normalizedValue
      : Math.max(options.min, normalizedValue)
  );
}

export function findCreatedActivityInList<
  TItem extends CreatedActivityListItem,
>({ activityId, items }: { activityId?: string; items: TItem[] }) {
  if (!activityId) return undefined;

  return items.find((item) => item.id === activityId);
}

export function resolveCreatedActivityPanelActivity<
  TItem extends CreatedActivityListItem,
>({
  activity,
  activityId,
  items,
}: {
  activity?: CreatedActivityListItem | null;
  activityId?: string;
  items: TItem[];
}) {
  if (!activityId) return undefined;
  if (activity?.id === activityId) return activity;

  return findCreatedActivityInList({ activityId, items });
}

export function buildCreatedActivityPanelContext({
  activity,
  createdFrom = 'create',
  isLoading,
}: {
  activity?: CreatedActivityListItem;
  createdFrom?: ActivityLibraryCreatedSource;
  isLoading: boolean;
}): CreatedActivityPanelContext {
  const actionView = buildCreatedActivityPanelActionView(activity);

  if (activity) {
    const canEdit = canEditActivity(activity.visibility);
    const canPublish = canDeriveActivityWork(activity.visibility);
    const displayTitle = formatActivityLibraryDisplayTitle(activity.title);

    return {
      activity,
      actionView,
      body: getCreatedActivityPanelFoundBody(createdFrom),
      showCreateAction: true,
      showDismissAction: true,
      showEditAction: canEdit,
      showMissingHint: false,
      showPublishAction: canPublish,
      status: 'found',
      title: displayTitle,
    };
  }

  if (isLoading) {
    return {
      actionView,
      body: m.activity_created_panel_loading_body(),
      showCreateAction: true,
      showDismissAction: true,
      showEditAction: false,
      showMissingHint: false,
      showPublishAction: false,
      status: 'loading',
      title: m.activity_created_panel_loading_title(),
    };
  }

  return {
    actionView,
    body: m.activity_created_panel_missing_body(),
    showCreateAction: true,
    showDismissAction: true,
    showEditAction: false,
    showMissingHint: true,
    showPublishAction: false,
    status: 'missing',
    title: m.activity_created_panel_missing_title(),
  };
}

function buildCreatedActivityPanelActionView(
  activity?: CreatedActivityListItem
): CreatedActivityPanelActionView {
  return {
    create: {
      label: activityLibraryPageCopy.createActivityLabel,
      to: Routes.Create,
    },
    dismiss: {
      label: activityLibraryActionCopy.dismiss,
    },
    ...(activity && canEditActivity(activity.visibility)
      ? {
          edit: buildActivityLibraryEditorAction({
            activityId: activity.id,
            label: activityLibraryCardCopy.actionLabels.edit,
          }),
        }
      : {}),
    ...(activity && canDeriveActivityWork(activity.visibility)
      ? {
          publish: buildActivityLibraryCardDerivativeActionView({
            action: 'publish',
            visibility: activity.visibility,
          }),
        }
      : {}),
  };
}

function getCreatedActivityPanelFoundBody(
  createdFrom: ActivityLibraryCreatedSource
) {
  switch (createdFrom) {
    case 'duplicate':
      return m.activity_created_panel_duplicate_body();
    case 'remix':
      return m.activity_created_panel_remix_body();
    case 'create':
      return m.activity_created_panel_found_body();
  }
}

export function buildActivityLibraryCardStats({
  groups,
  pairs,
  questions,
}: {
  groups: number;
  pairs: number;
  questions: number;
}): ActivityLibraryCardStat[] {
  const questionsLabel = m.activity_library_stat_questions();
  const questionsDescription = m.activity_library_stat_questions_description();
  const pairsLabel = m.activity_library_stat_pairs();
  const pairsDescription = m.activity_library_stat_pairs_description();
  const groupsLabel = m.activity_library_stat_groups();
  const groupsDescription = m.activity_library_stat_groups_description();

  return [
    {
      ariaLabel: formatActivityLibraryStatAriaLabel({
        description: questionsDescription,
        label: questionsLabel,
        value: questions,
      }),
      description: questionsDescription,
      key: 'questions',
      label: questionsLabel,
      value: questions,
    },
    {
      ariaLabel: formatActivityLibraryStatAriaLabel({
        description: pairsDescription,
        label: pairsLabel,
        value: pairs,
      }),
      description: pairsDescription,
      key: 'pairs',
      label: pairsLabel,
      value: pairs,
    },
    {
      ariaLabel: formatActivityLibraryStatAriaLabel({
        description: groupsDescription,
        label: groupsLabel,
        value: groups,
      }),
      description: groupsDescription,
      key: 'groups',
      label: groupsLabel,
      value: groups,
    },
  ];
}

export function buildActivityLibraryCardViewModel(
  activity: PersistedActivityLibraryCardSource
): ActivityLibraryCardViewModel {
  return {
    content: activity.contentJson,
    description: activity.description ?? '',
    id: activity.id,
    persisted: true,
    status: activity.visibility,
    templateType: activity.templateType,
    title: activity.title,
  };
}

export function buildStarterActivityLibraryCardViewModel(
  activity: ActivitySeed
): ActivityLibraryCardViewModel {
  return {
    content: activity.content,
    description: activity.description,
    id: activity.id,
    persisted: false,
    status: activity.status,
    templateType: activity.templateType,
    title: activity.title,
  };
}

export function formatActivityLibraryDisplayTitle(title: string) {
  return (
    normalizeRuntimeDisplayText(title) || m.activity_library_card_untitled()
  );
}

export function formatActivityLibraryDisplayDescription(description: string) {
  return normalizeRuntimeDisplayText(description);
}

export function buildActivityLibraryCardDisplayView({
  activity,
  libraryStatus,
}: {
  activity: ActivityLibraryCardViewModel;
  libraryStatus: ActivityLibraryStatus;
}): ActivityLibraryCardDisplayView {
  const template = getTemplateByType(activity.templateType);
  const summary = buildActivityLibraryCardSummary({
    content: activity.content,
    templateType: template.type,
  });
  const statusLabel = formatActivityLibraryCardStatusLabel(activity);
  const displayTitle = formatActivityLibraryDisplayTitle(activity.title);
  const displayDescription = formatActivityLibraryDisplayDescription(
    activity.description
  );
  const actionState = buildActivityLibraryCardActionState({
    libraryStatus,
    persisted: activity.persisted,
    readyRemixCount: summary.suggestedTemplateOptions.length,
    visibility: activity.status,
  });
  const actionView = buildActivityLibraryCardActionView(activity.status);
  const compatibility = buildActivityLibraryCompatibilityView({
    currentTemplateType: activity.templateType,
    summary,
    visibility: activity.status,
  });
  const sourceMaterials = buildActivitySourceMaterialSummaryView(
    activity.content.sourceMaterials
  );

  return {
    actionState,
    actionView,
    actionsLabel: m.activity_library_card_actions_label({
      title: displayTitle,
    }),
    ariaLabel: m.activity_library_card_aria_label({
      status: statusLabel,
      template: template.name,
      title: displayTitle,
    }),
    compatibility,
    compatibilityLabel: m.activity_library_card_compatibility_label({
      title: displayTitle,
    }),
    contentLabel: m.activity_library_card_content_label({
      title: displayTitle,
    }),
    detailsLabel: m.activity_library_card_details_label({
      title: displayTitle,
    }),
    displayDescription,
    displayTitle,
    editAction: buildActivityLibraryEditorAction({
      activityId: activity.id,
      label: activityLibraryCardCopy.actionLabels.edit,
    }),
    restoreRequiredLabel: m.activity_library_card_restore_required_label({
      title: displayTitle,
    }),
    sourceMaterials,
    sourceMaterialsLabel: m.activity_library_card_source_materials_label({
      title: displayTitle,
    }),
    sourceMaterialEditAction: buildActivityLibraryEditorAction({
      activityId: activity.id,
      label: activityLibraryCardCopy.sourceMaterialEditActionLabel,
    }),
    statusSummary: buildActivityLibraryCardStatusSummaryView({
      activity,
      actionView,
      compatibility,
      displayTitle,
      sourceMaterials,
      statusLabel,
    }),
    stats: buildActivityLibraryCardStats({
      groups: summary.contentCounts.groups,
      pairs: summary.contentCounts.pairs,
      questions: summary.contentCounts.questions,
    }),
    statusLabel,
    templateName: template.name,
    templateType: template.type,
  };
}

export function buildActivityLibraryCardStatusSummaryView({
  activity,
  actionView,
  compatibility,
  displayTitle,
  sourceMaterials,
  statusLabel,
}: {
  activity: ActivityLibraryCardViewModel;
  actionView: Pick<ActivityLibraryCardActionView, 'publish'>;
  compatibility: Pick<ActivityLibraryCompatibilityView, 'remixStatusView'>;
  displayTitle: string;
  sourceMaterials: ActivitySourceMaterialSummaryView;
  statusLabel: string;
}): ActivityLibraryCardStatusSummaryView {
  const label = m.activity_library_card_status_summary_label({
    title: displayTitle,
  });
  const items: ActivityLibraryCardStatusSummaryItem[] = [
    buildActivityLibraryCardStatusSummaryItem({
      description:
        getActivityLibraryCardStatusSummaryStatusDescription(activity),
      id: 'library-status',
      label: m.activity_library_card_status_summary_status_label(),
      tone: getActivityLibraryCardStatusSummaryStatusTone(activity),
      value: statusLabel,
    }),
    buildActivityLibraryCardStatusSummaryItem({
      description: actionView.publish.statusView.description,
      id: 'publish',
      label: actionView.publish.label,
      tone: actionView.publish.statusView.tone,
      value: actionView.publish.statusView.value,
    }),
    buildActivityLibraryCardStatusSummaryItem({
      description: compatibility.remixStatusView.description,
      id: 'remix',
      label: activityLibraryCardCopy.remixActionLabel,
      tone: compatibility.remixStatusView.tone,
      value: compatibility.remixStatusView.value,
    }),
    buildActivityLibraryCardStatusSummaryItem({
      description: sourceMaterials.readinessStatus.description,
      id: 'source-materials',
      label: sourceMaterials.readinessStatus.label,
      tone:
        sourceMaterials.readinessStatus.id === 'extractable'
          ? 'ready'
          : 'neutral',
      value: sourceMaterials.readinessStatus.value,
    }),
  ];

  return {
    ariaLabel: formatActivityLibraryCardStatusSummaryAriaLabel({
      items,
      label,
    }),
    items,
    label,
  };
}

function buildActivityLibraryCardStatusSummaryItem({
  description,
  id,
  label,
  tone,
  value,
}: Omit<ActivityLibraryCardStatusSummaryItem, 'ariaLabel'>) {
  return {
    ariaLabel: m.activity_library_card_status_summary_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    tone,
    value,
  };
}

function formatActivityLibraryCardStatusSummaryAriaLabel({
  items,
  label,
}: {
  items: ActivityLibraryCardStatusSummaryItem[];
  label: string;
}) {
  return [label, ...items.map((item) => item.ariaLabel)]
    .map(normalizeRuntimeDisplayText)
    .filter(Boolean)
    .join(m.activity_source_material_summary_list_separator());
}

function getActivityLibraryCardStatusSummaryStatusDescription(
  activity: ActivityLibraryCardViewModel
) {
  if (!activity.persisted) {
    return m.activity_library_card_status_summary_status_preview_description();
  }

  return isActivityArchived(activity.status)
    ? m.activity_library_card_status_summary_status_archived_description()
    : m.activity_library_card_status_summary_status_saved_description();
}

function getActivityLibraryCardStatusSummaryStatusTone(
  activity: ActivityLibraryCardViewModel
): ActivityLibraryCardStatusSummaryTone {
  if (!activity.persisted) return 'neutral';

  return isActivityArchived(activity.status) ? 'blocked' : 'ready';
}

function formatActivityLibraryStatAriaLabel({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: number;
}) {
  return m.activity_library_stat_aria_label({
    description,
    label,
    value: String(value),
  });
}

function buildActivityLibraryEditorAction({
  activityId,
  label,
}: {
  activityId: string;
  label: string;
}): ActivityLibraryEditorActionView {
  return {
    activityId,
    label,
    to: Routes.DashboardActivityEdit,
  };
}

export function buildActivityLibraryCardActionView(
  visibility: ActivityVisibility
): ActivityLibraryCardActionView {
  return {
    archive: buildActivityLibraryCardActionButtonView({
      action: 'archive',
      visibility,
    }),
    duplicate: buildActivityLibraryCardDerivativeActionView({
      action: 'duplicate',
      visibility,
    }),
    publish: buildActivityLibraryCardDerivativeActionView({
      action: 'publish',
      visibility,
    }),
    remix: buildActivityLibraryCardRemixActionView({
      visibility,
    }),
    restore: {
      ...buildActivityLibraryCardActionButtonView({
        action: 'restore',
        visibility,
      }),
      requiredMessage: activityLibraryCardCopy.restoreRequiredMessage,
    },
  };
}

function buildActivityLibraryCardActionButtonView({
  action,
  visibility,
}: {
  action: Extract<ActivityLifecycleAction, 'archive' | 'restore'>;
  visibility: ActivityVisibility;
}): ActivityLibraryCardActionButtonView {
  const label = getActivityLibraryCardActionLabel(action);
  const statusView = buildActivityLibraryVisibilityActionStatusView({
    action,
    label,
    visibility,
  });

  return {
    ...getActivityLifecycleActionCopy(action),
    ariaLabel: buildActivityLibraryActionAriaLabel({ label, statusView }),
    label,
    statusView,
  };
}

function buildActivityLibraryCardDerivativeActionView({
  action,
  visibility,
}: {
  action: Exclude<ActivityDerivativeAction, 'remix'>;
  visibility: ActivityVisibility;
}): ActivityLibraryCardDerivativeActionView {
  const actionView = buildActivityLifecycleActionView({
    action,
    visibility,
  });
  const label = getActivityLibraryCardActionLabel(action);
  const statusView = buildActivityLibraryActionStatusView({
    actionLabel: label,
    blockedMessage:
      actionView.gate.type === 'blocked' ? actionView.gate.message : undefined,
  });

  return {
    ...actionView,
    ariaLabel: buildActivityLibraryActionAriaLabel({ label, statusView }),
    label,
    statusView,
  };
}

function buildActivityLibraryCardRemixActionView({
  visibility,
}: {
  visibility: ActivityVisibility;
}): ActivityLibraryCardRemixActionView {
  const actionView = buildActivityLifecycleActionView({
    action: 'remix',
    visibility,
  });

  return {
    ...actionView,
    statusView: buildActivityLibraryActionStatusView({
      actionLabel: activityLibraryCardCopy.remixActionLabel,
      blockedMessage:
        actionView.gate.type === 'blocked'
          ? actionView.gate.message
          : undefined,
    }),
  };
}

function getActivityLibraryCardActionLabel(
  action: Exclude<ActivityLifecycleAction, 'remix'>
) {
  return activityLibraryCardCopy.actionLabels[action];
}

export function buildActivityLibraryActionStatusView({
  actionLabel,
  blockedMessage,
}: {
  actionLabel: string;
  blockedMessage?: string;
}): ActivityLibraryActionStatusView {
  const blocked = Boolean(blockedMessage);
  const label = m.activity_library_action_status_label();
  const value = blocked
    ? m.activity_library_action_status_blocked_value()
    : m.activity_library_action_status_ready_value();
  const description = blocked
    ? m.activity_library_action_status_blocked_description({
        reason: blockedMessage ?? '',
      })
    : m.activity_library_action_status_ready_description({
        action: actionLabel,
      });

  return {
    ariaLabel: m.activity_library_action_status_aria_label({
      description,
      label,
      value,
    }),
    description,
    label,
    tone: blocked ? 'blocked' : 'ready',
    value,
  };
}

function buildActivityLibraryActionAriaLabel({
  label,
  statusView,
}: {
  label: string;
  statusView: ActivityLibraryActionStatusView;
}) {
  return m.activity_library_action_aria_label({
    label,
    status: statusView.ariaLabel,
  });
}

function buildActivityLibraryVisibilityActionStatusView({
  action,
  label,
  visibility,
}: {
  action: Extract<ActivityLifecycleAction, 'archive' | 'restore'>;
  label: string;
  visibility: ActivityVisibility;
}) {
  const blockedMessage =
    action === 'archive' && !canArchiveActivity(visibility)
      ? m.activity_lifecycle_archive_blocked()
      : action === 'restore' && !canRestoreActivity(visibility)
        ? m.activity_lifecycle_restore_blocked()
        : undefined;

  return buildActivityLibraryActionStatusView({
    actionLabel: label,
    blockedMessage,
  });
}

function formatActivityLibraryCardStatusLabel({
  persisted,
  status,
}: Pick<ActivityLibraryCardViewModel, 'persisted' | 'status'>) {
  if (!persisted) {
    return m.activity_library_status_preview();
  }

  return formatActivityLibraryStatusLabel(status);
}

export function formatActivityLibraryStatusLabel(
  visibility: ActivityVisibility
) {
  switch (visibility) {
    case 'archived':
      return m.activity_library_status_archived();
    case 'draft':
      return m.activity_form_visibility_draft();
    case 'private':
      return m.activity_form_visibility_private();
    case 'public':
      return m.activity_form_visibility_public();
    case 'unlisted':
      return m.activity_form_visibility_unlisted();
  }
}

export function buildActivityLibraryRemixHint(shortNames: string[]) {
  const templateList = formatActivityLibraryTemplateShortNameList(shortNames);

  return templateList
    ? m.activity_library_remix_hint({ templates: templateList })
    : undefined;
}

export function formatActivityLibraryTemplateShortNameList(
  shortNames: string[]
) {
  return shortNames
    .map(normalizeRuntimeDisplayText)
    .filter(Boolean)
    .join(m.activity_library_template_list_separator());
}

export function buildActivityLibraryRemixActionLabel(shortName: string) {
  const templateName = normalizeRuntimeDisplayText(shortName);

  return m.activity_library_remix_action({
    template: templateName || m.activity_library_remix_action_fallback(),
  });
}

export function buildActivityLibraryCompatibilityView({
  currentTemplateType,
  summary,
  visibility = 'draft',
}: {
  currentTemplateType: ActivityTemplateType;
  summary: ActivityLibraryCardSummary;
  visibility?: ActivityVisibility;
}): ActivityLibraryCompatibilityView {
  const remixGate = buildActivityDerivativeActionGate({
    action: 'remix',
    visibility,
  });
  const remixStatusView = buildActivityLibraryActionStatusView({
    actionLabel: activityLibraryCardCopy.remixActionLabel,
    blockedMessage:
      remixGate.type === 'blocked' ? remixGate.message : undefined,
  });

  return {
    lockedTemplateDiagnostics: summary.lockedTemplateOptions
      .slice(0, ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS.lockedTemplateDiagnostics)
      .map((option) => ({
        diagnosis: option.diagnosis,
        id: option.template,
      })),
    readyTemplateOptions: summary.readyTemplateOptions.map((option) => ({
      ...option,
      isCurrent: option.template === currentTemplateType,
    })),
    remixStatusView,
    remixActionOptions: summary.suggestedTemplateOptions
      .slice(0, ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS.remixActionOptions)
      .map((option) => ({
        ...option,
        actionLabel: buildActivityLibraryRemixActionLabel(option.shortName),
      })),
    ...(remixGate.type === 'blocked'
      ? {
          restoreRequiredMessage:
            activityLibraryCardCopy.remixRestoreRequiredMessage,
        }
      : {}),
    remixHint: buildActivityLibraryRemixHint(
      summary.suggestedTemplateOptions.map((option) => option.shortName)
    ),
  };
}

export function buildActivityLibraryCardActionState({
  libraryStatus,
  persisted,
  readyRemixCount,
  visibility,
}: {
  libraryStatus: ActivityLibraryStatus;
  persisted: boolean;
  readyRemixCount: number;
  visibility: ActivityVisibility;
}): ActivityLibraryCardActionState {
  const showActiveActions = libraryStatus === 'active';
  const canCreateDerivedWork = canDeriveActivityWork(visibility);
  const archived = isActivityArchived(visibility);
  const showDerivativeActions =
    persisted && showActiveActions && canCreateDerivedWork;
  const hasRemixOptions = readyRemixCount > 0;

  return {
    canCreateDerivedWork,
    showArchiveAction: persisted && showActiveActions && !archived,
    showDerivativeActions,
    showEditAction: persisted && showActiveActions && !archived,
    showPersistedActions: persisted,
    showPublishAction: persisted && showActiveActions && canCreateDerivedWork,
    showRestoreAction: persisted && archived,
    showRestoreRequiredMessage: persisted && archived,
    showRemixHint: showDerivativeActions && hasRemixOptions,
    showRemixActions: showDerivativeActions && hasRemixOptions,
  };
}
