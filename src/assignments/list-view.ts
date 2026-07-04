import type {
  ActivitySeed,
  ActivityTemplateType,
  AssignmentSeed,
  AssignmentSettings,
  AssignmentStatus,
} from '@/activities/types';
import {
  getStarterActivity,
  getStarterAssignments,
  getTemplateByType,
} from '@/activities/catalog';
import {
  formatAssignmentDisplayText,
  formatAssignmentDisplayTitle,
} from '@/assignments/assignment-display';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import {
  type AssignmentSettingsSummaryView,
  buildAssignmentSettingsSummaryView,
} from '@/assignments/delivery-summary';
import {
  ASSIGNMENT_LIST_PAGE_SIZE,
  type AssignmentLifecycleStatusFilter,
  type AssignmentStatusFilter,
  getAssignmentListTotalPages,
  normalizeAssignmentListSearch,
} from '@/assignments/list-filters';
import {
  buildAssignmentListFilterSummary,
  buildAssignmentListStatusMetrics,
  buildAssignmentListSummaryMetrics,
  type AssignmentListFilterSummary,
  type AssignmentListSummary,
  type AssignmentListSummaryMetric,
  type AssignmentListStatusMetric,
  normalizeAssignmentListSummaryCount,
} from '@/assignments/list-summary';
import {
  type AssignmentStatusAction,
  buildAssignmentStatusAction,
  getAssignmentStatusLabel,
} from '@/assignments/lifecycle';
import {
  buildPrintableAssignmentSearch,
  type PrintableAssignmentSearch,
} from '@/assignments/printable-worksheet';
import {
  buildPublishedAssignmentPanelContext,
  resolvePublishedAssignmentPanelAssignment,
  type PublishedAssignmentPanelAssignment,
  type PublishedAssignmentPanelContext,
  type PublishedAssignmentPanelNextStepId,
} from '@/assignments/published-assignment';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
} from '@/assignments/result-format';
import {
  type AssignmentShareLinkActionView,
  buildAssignmentShareLinkAvailability,
  buildAssignmentShareLinkActionView,
  type AssignmentShareLinkAvailability,
  type AssignmentShareLinkDisabledReasonCode,
} from '@/assignments/share-link';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

type AssignmentListControlOption = {
  description: string;
  label: string;
  value: AssignmentStatusFilter;
};

export type AssignmentListPageScopeItemId =
  | 'page'
  | 'range'
  | 'search'
  | 'status';

export type AssignmentListPageScopeItem = {
  description: string;
  id: AssignmentListPageScopeItemId;
  label: string;
  value: string;
};

export type AssignmentListPageScopeView = {
  items: AssignmentListPageScopeItem[];
  label: string;
  summary: string;
};

export type AssignmentListSearchPanelView = {
  filterSummary: AssignmentListFilterSummary;
  hasSearchValue: boolean;
  searchDescription: string;
  statusDescription: string;
  statusLabel: string;
  statusMetrics: AssignmentListStatusMetric[];
  statusOptions: AssignmentListControlOption[];
};

export type AssignmentListPageHandoffItemId =
  | 'distribution-copy-link'
  | 'distribution-preview-link'
  | 'distribution-review-results'
  | 'filter-summary'
  | 'owner-scope'
  | 'pagination'
  | 'published-share-context'
  | 'scope-page'
  | 'scope-range'
  | 'scope-search'
  | 'scope-status'
  | 'status-closed'
  | 'status-draft'
  | 'status-expired'
  | 'status-open'
  | 'summary-average'
  | 'summary-completions'
  | 'summary-open'
  | 'summary-total'
  | 'visible-closed-links'
  | 'visible-copy-blocked'
  | 'visible-copy-ready'
  | 'visible-draft-assignments'
  | 'visible-expired-links'
  | 'visible-open-links'
  | 'visible-page-items'
  | 'visible-preview-ready'
  | 'visible-print-ready'
  | 'visible-result-evidence'
  | 'visible-results-ready';

export type AssignmentListPageHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentListPageHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentListPageHandoffPrivacyView = {
  broadensBeyondOwner: false;
  countsStarterPreviewAsOwned: false;
  exposesInternalAssignmentIds: false;
  exposesInternalOwnerId: false;
  exposesPublicRuntimeContent: false;
  exposesRawAnonymousToken: false;
  exposesResultExportRows: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: AssignmentListPageHandoffItemId[];
};

export type AssignmentListPageHandoffView = {
  description: string;
  itemViews: AssignmentListPageHandoffItemView[];
  privacy: AssignmentListPageHandoffPrivacyView;
  title: string;
};

type AssignmentListVisibleCardHandoffSummary = {
  closedLinks: number;
  copyBlocked: number;
  copyReady: number;
  draftAssignments: number;
  expiredLinks: number;
  openLinks: number;
  previewReady: number;
  printReady: number;
  resultEvidence: number;
  resultsReady: number;
};

export type AssignmentListCardStatKey = 'average' | 'completions';

export type AssignmentListCardStat = {
  ariaLabel: string;
  description: string;
  key: AssignmentListCardStatKey;
  label: string;
  value: string;
};

export type AssignmentListCardActionState = {
  isPersisted: boolean;
  shareAvailability: AssignmentShareLinkAvailability;
  shareDisabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
  shareDisabledReason?: string;
  shareLabel: string;
  showResultsAction: boolean;
  showShareActions: boolean;
  statusAction: AssignmentStatusAction | undefined;
};

export type AssignmentListPrintAction = {
  assignmentId: string;
  label: string;
  search: PrintableAssignmentSearch;
  to: typeof Routes.PrintAssignmentWorksheet;
};

export type AssignmentListResultAction = {
  assignmentId: string;
  label: string;
  to: typeof Routes.DashboardAssignmentResults;
};

export type AssignmentListShareAction = AssignmentShareLinkActionView;

export type AssignmentListStatusAction = AssignmentStatusAction;

export type AssignmentListCardActionView = {
  printAction: AssignmentListPrintAction | undefined;
  resultAction: AssignmentListResultAction | undefined;
  shareAction: AssignmentListShareAction | undefined;
  statusAction: AssignmentListStatusAction | undefined;
};

export type AssignmentListCardStatItems = AssignmentListCardStat[];

export type AssignmentListCardStats = {
  averageScore: number;
  completions: number;
};

export type AssignmentListDistributionStatus =
  | 'blocked'
  | 'collecting-results'
  | 'preview'
  | 'ready-to-share';

export type AssignmentListDistributionStepId =
  | 'copy-link'
  | 'preview-link'
  | 'print-worksheet'
  | 'review-results';

export type AssignmentListDistributionStepStatus =
  | 'blocked'
  | 'optional'
  | 'ready'
  | 'waiting';

export type AssignmentListDistributionStepView = {
  ariaLabel: string;
  description: string;
  id: AssignmentListDistributionStepId;
  label: string;
  status: AssignmentListDistributionStepStatus;
  statusLabel: string;
};

export type AssignmentListDistributionView = {
  ariaLabel: string;
  description: string;
  status: AssignmentListDistributionStatus;
  statusLabel: string;
  stepViews: AssignmentListDistributionStepView[];
  title: string;
};

export type AssignmentListCardViewModel = {
  actionView: AssignmentListCardActionView;
  actionsLabel: string;
  activityDescription: string;
  ariaLabel: string;
  distributionView: AssignmentListDistributionView;
  id: string;
  persisted: boolean;
  settingsSummaryView: AssignmentSettingsSummaryView;
  shareSlug: string;
  statsLabel: string;
  summaryLabel: string;
  status: AssignmentStatus;
  templateLabel: string;
  templateType: ActivityTemplateType;
  title: string;
  stats: AssignmentListCardStats;
  statItems: AssignmentListCardStatItems;
  statusLabel: string;
};

export type AssignmentListCardActivitySource = {
  description: string | null;
  templateType: ActivityTemplateType;
};

export type AssignmentListCardAssignmentSource = {
  expiresAt: Date | null;
  id: string;
  settingsJson: AssignmentSettings;
  shareSlug: string;
  status: AssignmentStatus;
  title: string;
};

export type AssignmentListCardSnapshotSource = {
  activityDescription: string | null;
  templateType: ActivityTemplateType;
};

export type AssignmentListCardSource = {
  activity: AssignmentListCardActivitySource;
  assignment: AssignmentListCardAssignmentSource;
  snapshot?: AssignmentListCardSnapshotSource | null;
  stats: AssignmentListCardStats;
  now?: number;
};

type StarterAssignmentListCardSource = {
  activity: {
    description: string;
    templateType: ActivityTemplateType;
  };
  assignment: {
    expiresAt?: Date | null;
    id: string;
    settings: AssignmentSettings;
    shareId: string;
    status: AssignmentStatus;
    title: string;
    averageScore: number;
    completions: number;
  };
};

type AssignmentListEmptyStateView = {
  description: string;
  showStarterAssignments: boolean;
  title: string;
};

type AssignmentListPageBreadcrumb = {
  href?: string;
  id: 'assignments' | 'dashboard';
  isCurrentPage?: boolean;
  label: string;
};

type AssignmentListPageSearchState = {
  page?: number;
  published?: string;
  q?: string;
  status?: AssignmentLifecycleStatusFilter;
};

type AssignmentListPageResolvedSearch = {
  currentPage: number;
  filteredStatus?: AssignmentLifecycleStatusFilter;
  hasFilters: boolean;
  normalizedSearchQuery?: string;
  searchQuery: string;
  statusFilter: AssignmentStatusFilter;
};

type AssignmentListPageItem = AssignmentListCardSource;

type AssignmentListPageData<TItem extends AssignmentListPageItem> = {
  items: TItem[];
  publishedAssignment?: PublishedAssignmentPanelAssignment | null;
  summary?: AssignmentListSummary;
  total: number;
};

type AssignmentListPageViewModel<TItem extends AssignmentListPageItem> = {
  assignments: TItem[];
  breadcrumbs: AssignmentListPageBreadcrumb[];
  description: string;
  emptyState: AssignmentListEmptyStateView;
  handoffView: AssignmentListPageHandoffView;
  hasAssignments: boolean;
  loadErrorMessage: string;
  publishedPanelContext?: PublishedAssignmentPanelContext;
  resolvedSearch: AssignmentListPageResolvedSearch;
  scopeView: AssignmentListPageScopeView;
  starterPreview: AssignmentListStarterPreview;
  summaryMetrics: AssignmentListSummaryMetric[];
  title: string;
  totalAssignments: number;
  totalPages: number;
};

type AssignmentListRouteState<TItem extends AssignmentListPageItem> =
  | {
      pageView: AssignmentListPageViewModel<TItem>;
      showLoadError: false;
      status: 'loading';
    }
  | {
      pageView: AssignmentListPageViewModel<TItem>;
      showLoadError: true;
      status: 'error';
    }
  | {
      pageView: AssignmentListPageViewModel<TItem>;
      showLoadError: boolean;
      status: 'empty-filtered';
    }
  | {
      pageView: AssignmentListPageViewModel<TItem>;
      showLoadError: boolean;
      status: 'empty-starter';
    }
  | {
      pageView: AssignmentListPageViewModel<TItem>;
      showLoadError: boolean;
      status: 'ready';
    };

export type AssignmentListStarterPreviewItem = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
};

export type AssignmentListStarterPreview = {
  assignments: AssignmentListStarterPreviewItem[];
  source: 'starter-preview';
};

export const assignmentListPageCopy = {
  get breadcrumbCurrent() {
    return m.assignment_list_page_breadcrumb_current();
  },
  get breadcrumbDashboard() {
    return m.assignment_list_page_breadcrumb_dashboard();
  },
  get description() {
    return m.assignment_list_page_description();
  },
  get loadErrorMessage() {
    return m.assignment_list_page_load_error();
  },
  get title() {
    return m.assignment_list_page_title();
  },
} as const;

export const assignmentListSearchCopy = {
  get clearSearchLabel() {
    return m.assignment_list_search_clear();
  },
  get label() {
    return m.assignment_list_search_label();
  },
  get placeholder() {
    return m.assignment_list_search_placeholder();
  },
  get searchDescription() {
    return m.assignment_list_search_description();
  },
  get statusLabel() {
    return m.assignment_list_search_status_label();
  },
} as const;

export const assignmentListActionCopy = {
  get clearFilters() {
    return m.assignment_list_action_clear_filters();
  },
  get dismiss() {
    return m.assignment_list_action_dismiss();
  },
  get openActivityLibrary() {
    return m.assignment_list_action_open_activity_library();
  },
  get openPublishedLink() {
    return m.assignment_list_action_open_published_link();
  },
  get openShareLink() {
    return m.assignment_list_action_open_share_link();
  },
  get printWorksheet() {
    return m.assignment_list_action_print_worksheet();
  },
  get shareLinkUnavailable() {
    return m.assignment_list_action_share_link_unavailable();
  },
  get viewResults() {
    return m.assignment_list_action_view_results();
  },
} as const;

export const assignmentListPublishedPanelCopy = {
  get missingHint() {
    return m.assignment_list_published_panel_missing_hint();
  },
  get publishedLabel() {
    return m.assignment_list_published_panel_label();
  },
} as const;

const assignmentListEmptyStateCopy = {
  emptyLibrary: {
    get description() {
      return m.assignment_list_empty_library_description();
    },
    get title() {
      return m.assignment_list_empty_library_title();
    },
  },
  filtered: {
    get description() {
      return m.assignment_list_empty_filtered_description();
    },
    get title() {
      return m.assignment_list_empty_filtered_title();
    },
  },
} as const;

export const assignmentStatusFilterOptions = [
  {
    get label() {
      return m.assignment_list_status_filter_all();
    },
    get description() {
      return m.assignment_list_status_filter_all_description();
    },
    value: 'all',
  },
  {
    get label() {
      return m.assignment_list_status_filter_published();
    },
    get description() {
      return m.assignment_list_status_filter_published_description();
    },
    value: 'open',
  },
  {
    get label() {
      return m.assignment_list_status_filter_expired();
    },
    get description() {
      return m.assignment_list_status_filter_expired_description();
    },
    value: 'expired',
  },
  {
    get label() {
      return m.assignment_list_status_filter_closed();
    },
    get description() {
      return m.assignment_list_status_filter_closed_description();
    },
    value: 'closed',
  },
  {
    get label() {
      return m.assignment_list_status_filter_draft();
    },
    get description() {
      return m.assignment_list_status_filter_draft_description();
    },
    value: 'draft',
  },
] satisfies Array<AssignmentListControlOption>;

export function buildAssignmentListSearchPanelView({
  isLoading,
  search,
  status,
  summary,
  total,
}: {
  isLoading: boolean;
  search: string;
  status: AssignmentStatusFilter;
  summary?: AssignmentListSummary;
  total: number;
}): AssignmentListSearchPanelView {
  const normalizedSearch = normalizeAssignmentListSearch(search);
  const statusView = getAssignmentListStatusFilterView(status);

  return {
    filterSummary: buildAssignmentListFilterSummary({
      isLoading,
      search: normalizedSearch,
      status,
      total,
    }),
    hasSearchValue: Boolean(normalizedSearch),
    searchDescription: assignmentListSearchCopy.searchDescription,
    statusDescription: m.assignment_list_search_status_description({
      description: statusView.description,
      status: statusView.label,
    }),
    statusLabel: statusView.label,
    statusMetrics: buildAssignmentListStatusMetrics(summary),
    statusOptions: assignmentStatusFilterOptions,
  };
}

export function buildAssignmentListPageScopeView({
  currentPage,
  pageSize = ASSIGNMENT_LIST_PAGE_SIZE,
  search,
  status,
  total,
  totalPages,
  visibleCount,
}: {
  currentPage: number;
  pageSize?: number;
  search?: string;
  status: AssignmentStatusFilter;
  total: number;
  totalPages: number;
  visibleCount: number;
}): AssignmentListPageScopeView {
  const normalizedCurrentPage = normalizeAssignmentListScopePage(currentPage);
  const normalizedPageSize = normalizeAssignmentListScopePageSize(pageSize);
  const normalizedSearch = normalizeAssignmentListSearch(search);
  const normalizedTotal = normalizeAssignmentListSummaryCount(total);
  const normalizedTotalPages = Math.max(
    1,
    normalizeAssignmentListSummaryCount(totalPages)
  );
  const normalizedVisibleCount = Math.min(
    normalizeAssignmentListSummaryCount(visibleCount),
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
  const statusView = getAssignmentListStatusFilterView(status);
  const isOutOfRange =
    normalizedTotal > 0 && normalizedCurrentPage > normalizedTotalPages;
  const hasResults =
    normalizedTotal > 0 && normalizedVisibleCount > 0 && !isOutOfRange;

  return {
    items: [
      {
        description: m.assignment_list_scope_range_description(),
        id: 'range',
        label: m.assignment_list_scope_range_label(),
        value: hasResults
          ? m.assignment_list_scope_range_value({
              firstItem: formatAssignmentResultNumber(firstVisible, {
                min: 0,
              }),
              lastItem: formatAssignmentResultNumber(lastVisible, { min: 0 }),
              total: formatAssignmentResultNumber(normalizedTotal, { min: 0 }),
            })
          : m.assignment_list_scope_range_empty_value(),
      },
      {
        description: isOutOfRange
          ? m.assignment_list_scope_page_out_of_range_description({
              totalPages: formatAssignmentResultNumber(normalizedTotalPages, {
                min: 1,
              }),
            })
          : m.assignment_list_scope_page_description(),
        id: 'page',
        label: m.assignment_list_scope_page_label(),
        value: m.assignment_list_scope_page_value({
          currentPage: formatAssignmentResultNumber(normalizedCurrentPage, {
            min: 1,
          }),
          totalPages: formatAssignmentResultNumber(normalizedTotalPages, {
            min: 1,
          }),
        }),
      },
      {
        description:
          status === 'all'
            ? m.assignment_list_scope_status_all_description()
            : statusView.description,
        id: 'status',
        label: m.assignment_list_scope_status_label(),
        value: statusView.label,
      },
      {
        description: normalizedSearch
          ? m.assignment_list_scope_search_filtered_description()
          : m.assignment_list_scope_search_all_description(),
        id: 'search',
        label: m.assignment_list_scope_search_label(),
        value: normalizedSearch ?? m.assignment_list_scope_search_all_value(),
      },
    ],
    label: m.assignment_list_scope_label(),
    summary: isOutOfRange
      ? m.assignment_list_scope_summary_out_of_range({
          currentPage: formatAssignmentResultNumber(normalizedCurrentPage, {
            min: 1,
          }),
          totalPages: formatAssignmentResultNumber(normalizedTotalPages, {
            min: 1,
          }),
        })
      : hasResults
        ? m.assignment_list_scope_summary({
            currentPage: formatAssignmentResultNumber(normalizedCurrentPage, {
              min: 1,
            }),
            firstItem: formatAssignmentResultNumber(firstVisible, { min: 0 }),
            lastItem: formatAssignmentResultNumber(lastVisible, { min: 0 }),
            total: formatAssignmentResultNumber(normalizedTotal, { min: 0 }),
            totalPages: formatAssignmentResultNumber(normalizedTotalPages, {
              min: 1,
            }),
          })
        : m.assignment_list_scope_summary_empty(),
  };
}

function getAssignmentListStatusFilterView(status: AssignmentStatusFilter) {
  return (
    assignmentStatusFilterOptions.find((option) => option.value === status) ??
    assignmentStatusFilterOptions[0]
  );
}

export function getAssignmentListEmptyState({
  hasFilters,
  status = 'all',
}: {
  hasFilters: boolean;
  status?: AssignmentStatusFilter;
}) {
  if (!hasFilters) return assignmentListEmptyStateCopy.emptyLibrary;

  if (status !== 'all') {
    const statusView = getAssignmentListStatusFilterView(status);

    return {
      ...assignmentListEmptyStateCopy.filtered,
      description: m.assignment_list_empty_status_filtered_description({
        status: statusView.label,
      }),
    };
  }

  return assignmentListEmptyStateCopy.filtered;
}

export function buildAssignmentListEmptyStateView({
  hasFilters,
  status = 'all',
}: {
  hasFilters: boolean;
  status?: AssignmentStatusFilter;
}): AssignmentListEmptyStateView {
  return {
    ...getAssignmentListEmptyState({ hasFilters, status }),
    showStarterAssignments: !hasFilters,
  };
}

export function buildAssignmentListPageViewModel<
  TItem extends AssignmentListPageItem,
>({
  data,
  isLoading,
  starterPreview,
  search,
}: {
  data?: AssignmentListPageData<TItem> | null;
  isLoading: boolean;
  starterPreview?: AssignmentListStarterPreview;
  search: AssignmentListPageSearchState;
}): AssignmentListPageViewModel<TItem> {
  const resolvedSearch = resolveAssignmentListPageSearch(search);
  const assignments = data?.items ?? [];
  const totalAssignments = normalizeAssignmentListSummaryCount(
    data?.total ?? 0
  );
  const totalPages = getAssignmentListTotalPages({
    pageSize: ASSIGNMENT_LIST_PAGE_SIZE,
    total: totalAssignments,
  });
  const emptyState = buildAssignmentListEmptyStateView({
    hasFilters: resolvedSearch.hasFilters,
    status: resolvedSearch.statusFilter,
  });
  const publishedPanelAssignment = resolvePublishedAssignmentPanelAssignment({
    assignment: data?.publishedAssignment,
    items: assignments,
    shareSlug: search.published,
  });
  const publishedPanelContext = search.published
    ? buildPublishedAssignmentPanelContext({
        assignment: publishedPanelAssignment,
        isLoading,
        shareSlug: search.published,
      })
    : undefined;
  const resolvedStarterPreview = resolveAssignmentListStarterPreview({
    assignments,
    emptyState,
    isLoading,
    starterPreview,
  });
  const scopeView = buildAssignmentListPageScopeView({
    currentPage: resolvedSearch.currentPage,
    pageSize: ASSIGNMENT_LIST_PAGE_SIZE,
    search: resolvedSearch.searchQuery,
    status: resolvedSearch.statusFilter,
    total: totalAssignments,
    totalPages,
    visibleCount: assignments.length,
  });
  const summaryMetrics = buildAssignmentListSummaryMetrics({
    hasFilters: resolvedSearch.hasFilters,
    summary: data?.summary,
    totalAssignments,
  });
  const searchPanelView = buildAssignmentListSearchPanelView({
    isLoading,
    search: resolvedSearch.searchQuery,
    status: resolvedSearch.statusFilter,
    summary: data?.summary,
    total: totalAssignments,
  });

  return {
    assignments,
    breadcrumbs: [
      {
        href: Routes.Dashboard,
        id: 'dashboard',
        label: assignmentListPageCopy.breadcrumbDashboard,
      },
      {
        id: 'assignments',
        isCurrentPage: true,
        label: assignmentListPageCopy.breadcrumbCurrent,
      },
    ],
    description: assignmentListPageCopy.description,
    emptyState,
    handoffView: buildAssignmentListPageHandoffView({
      assignments,
      publishedPanelContext,
      resolvedSearch,
      scopeView,
      searchPanelView,
      summaryMetrics,
      totalAssignments,
      totalPages,
      visibleCount: assignments.length,
    }),
    hasAssignments: assignments.length > 0,
    loadErrorMessage: assignmentListPageCopy.loadErrorMessage,
    publishedPanelContext,
    resolvedSearch,
    scopeView,
    starterPreview: resolvedStarterPreview,
    summaryMetrics,
    title: assignmentListPageCopy.title,
    totalAssignments,
    totalPages,
  };
}

export function buildAssignmentListRouteState<
  TItem extends AssignmentListPageItem,
>({
  data,
  isError,
  isLoading,
  search,
}: {
  data?: AssignmentListPageData<TItem> | null;
  isError: boolean;
  isLoading: boolean;
  search: AssignmentListPageSearchState;
}): AssignmentListRouteState<TItem> {
  const pageView = buildAssignmentListPageViewModel({
    data,
    isLoading,
    search,
    ...(isError && !data
      ? { starterPreview: createEmptyAssignmentListStarterPreview() }
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

  if (!pageView.hasAssignments && pageView.resolvedSearch.hasFilters) {
    return {
      pageView,
      showLoadError: isError,
      status: 'empty-filtered',
    };
  }

  if (!pageView.hasAssignments) {
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

export function buildAssignmentListStarterPreview(): AssignmentListStarterPreview {
  return {
    assignments: getStarterAssignments().map((assignment) => ({
      activity: getStarterActivity(assignment.activityId),
      assignment,
    })),
    source: 'starter-preview',
  };
}

function createEmptyAssignmentListStarterPreview(): AssignmentListStarterPreview {
  return {
    assignments: [],
    source: 'starter-preview',
  };
}

function resolveAssignmentListStarterPreview<TItem>({
  assignments,
  emptyState,
  isLoading,
  starterPreview,
}: {
  assignments: TItem[];
  emptyState: AssignmentListEmptyStateView;
  isLoading: boolean;
  starterPreview?: AssignmentListStarterPreview;
}) {
  if (
    isLoading ||
    assignments.length > 0 ||
    !emptyState.showStarterAssignments
  ) {
    return createEmptyAssignmentListStarterPreview();
  }

  return starterPreview ?? buildAssignmentListStarterPreview();
}

export function resolveAssignmentListPageSearch(
  search: AssignmentListPageSearchState
): AssignmentListPageResolvedSearch {
  const searchQuery = search.q ?? '';
  const statusFilter = search.status ?? 'all';
  const currentPage =
    search.page && Number.isInteger(search.page) && search.page > 0
      ? search.page
      : 1;
  const normalizedSearchQuery = normalizeAssignmentListSearch(searchQuery);
  const filteredStatus = statusFilter === 'all' ? undefined : statusFilter;

  return {
    currentPage,
    filteredStatus,
    hasFilters: Boolean(normalizedSearchQuery) || Boolean(filteredStatus),
    normalizedSearchQuery,
    searchQuery,
    statusFilter,
  };
}

function buildAssignmentListPageHandoffView<
  TItem extends AssignmentListPageItem,
>({
  assignments,
  publishedPanelContext,
  resolvedSearch,
  scopeView,
  searchPanelView,
  summaryMetrics,
  totalAssignments,
  totalPages,
  visibleCount,
}: {
  assignments: TItem[];
  publishedPanelContext?: PublishedAssignmentPanelContext;
  resolvedSearch: AssignmentListPageResolvedSearch;
  scopeView: AssignmentListPageScopeView;
  searchPanelView: AssignmentListSearchPanelView;
  summaryMetrics: AssignmentListSummaryMetric[];
  totalAssignments: number;
  totalPages: number;
  visibleCount: number;
}): AssignmentListPageHandoffView {
  const distributionStepViews = resolveAssignmentListHandoffDistributionSteps({
    assignments,
    publishedPanelContext,
  });
  const visibleCardSummary = summarizeAssignmentListVisibleCards(assignments);
  const itemViews: AssignmentListPageHandoffItemView[] = [
    buildAssignmentListPageHandoffItem({
      description: m.assignment_list_handoff_owner_scope_description(),
      id: 'owner-scope',
      label: m.assignment_list_handoff_owner_scope_label(),
      value: m.assignment_list_handoff_owner_scope_value(),
    }),
    ...summaryMetrics.map((metric) =>
      buildAssignmentListPageHandoffItem({
        description: metric.description,
        id: toAssignmentListSummaryHandoffItemId(metric.id),
        label: metric.label,
        value: metric.value,
      })
    ),
    ...scopeView.items.map((item) =>
      buildAssignmentListPageHandoffItem({
        description: item.description,
        id: toAssignmentListScopeHandoffItemId(item.id),
        label: item.label,
        value: item.value,
      })
    ),
    ...searchPanelView.statusMetrics.map((metric) =>
      buildAssignmentListPageHandoffItem({
        description: m.assignment_list_handoff_status_metric_description({
          status: metric.label,
        }),
        id: toAssignmentListStatusHandoffItemId(metric.status),
        label: metric.label,
        value: metric.value,
      })
    ),
    buildAssignmentListPageHandoffItem({
      description: searchPanelView.searchDescription,
      id: 'filter-summary',
      label: assignmentListSearchCopy.label,
      value: searchPanelView.filterSummary.text,
    }),
    buildAssignmentListPageHandoffItem({
      description: m.assignment_list_handoff_visible_items_description(),
      id: 'visible-page-items',
      label: m.assignment_list_handoff_visible_items_label(),
      value: m.assignment_list_handoff_visible_items_value({
        count: normalizeAssignmentListSummaryCount(visibleCount),
      }),
    }),
    ...buildAssignmentListVisibleCardHandoffItems(visibleCardSummary),
    buildAssignmentListPageHandoffItem({
      description: m.assignment_list_handoff_pagination_description(),
      id: 'pagination',
      label: m.assignment_list_handoff_pagination_label(),
      value: m.assignment_list_handoff_pagination_value({
        currentPage: formatAssignmentListHandoffNumber(
          resolvedSearch.currentPage,
          { min: 1 }
        ),
        totalAssignments: formatAssignmentListHandoffNumber(totalAssignments),
        totalPages: formatAssignmentListHandoffNumber(totalPages, { min: 1 }),
      }),
    }),
    buildAssignmentListPageHandoffItem({
      description: formatAssignmentListPublishedContextDescription(
        publishedPanelContext
      ),
      id: 'published-share-context',
      label: m.assignment_list_handoff_published_context_label(),
      value: formatAssignmentListPublishedContextValue(publishedPanelContext),
    }),
    ...distributionStepViews.map((stepView) =>
      buildAssignmentListPageHandoffItem({
        description: stepView.description,
        id: toAssignmentListDistributionHandoffItemId(stepView.id),
        label: stepView.label,
        value: stepView.statusLabel,
      })
    ),
  ];

  return {
    description: m.assignment_list_handoff_description(),
    itemViews,
    privacy: buildAssignmentListPageHandoffPrivacyView(itemViews),
    title: m.assignment_list_handoff_title(),
  };
}

function toAssignmentListSummaryHandoffItemId(
  id: AssignmentListSummaryMetric['id']
): AssignmentListPageHandoffItemId {
  switch (id) {
    case 'average':
      return 'summary-average';
    case 'completions':
      return 'summary-completions';
    case 'open':
      return 'summary-open';
    case 'total':
      return 'summary-total';
  }
}

function toAssignmentListScopeHandoffItemId(
  id: AssignmentListPageScopeItemId
): AssignmentListPageHandoffItemId {
  switch (id) {
    case 'page':
      return 'scope-page';
    case 'range':
      return 'scope-range';
    case 'search':
      return 'scope-search';
    case 'status':
      return 'scope-status';
  }
}

function toAssignmentListStatusHandoffItemId(
  status: AssignmentListStatusMetric['status']
): AssignmentListPageHandoffItemId {
  switch (status) {
    case 'closed':
      return 'status-closed';
    case 'draft':
      return 'status-draft';
    case 'expired':
      return 'status-expired';
    case 'open':
      return 'status-open';
    case 'all':
      return 'status-open';
  }
}

type AssignmentListHandoffDistributionStepId = Extract<
  PublishedAssignmentPanelNextStepId,
  'copy-link' | 'preview-link' | 'review-results'
>;

type AssignmentListHandoffDistributionStepView = {
  description: string;
  id: AssignmentListHandoffDistributionStepId;
  label: string;
  statusLabel: string;
};

function resolveAssignmentListHandoffDistributionSteps<
  TItem extends AssignmentListPageItem,
>({
  assignments,
  publishedPanelContext,
}: {
  assignments: TItem[];
  publishedPanelContext?: PublishedAssignmentPanelContext;
}): AssignmentListHandoffDistributionStepView[] {
  const stepViews =
    publishedPanelContext?.nextStepViews ??
    (assignments[0]
      ? buildAssignmentListCardViewModel(assignments[0]).distributionView
          .stepViews
      : []);

  return [
    resolveAssignmentListHandoffDistributionStep(stepViews, 'copy-link'),
    resolveAssignmentListHandoffDistributionStep(stepViews, 'preview-link'),
    resolveAssignmentListHandoffDistributionStep(stepViews, 'review-results'),
  ];
}

function resolveAssignmentListHandoffDistributionStep(
  stepViews: Array<{
    description: string;
    id: PublishedAssignmentPanelNextStepId | AssignmentListDistributionStepId;
    label: string;
    statusLabel: string;
  }>,
  id: AssignmentListHandoffDistributionStepId
): AssignmentListHandoffDistributionStepView {
  const matchedStepView = stepViews.find((stepView) => stepView.id === id);

  if (matchedStepView) {
    return {
      description: matchedStepView.description,
      id,
      label: matchedStepView.label,
      statusLabel: matchedStepView.statusLabel,
    };
  }

  return {
    description: m.assignment_list_handoff_distribution_empty_description(),
    id,
    label: formatAssignmentListHandoffDistributionStepLabel(id),
    statusLabel: m.assignment_list_handoff_distribution_empty_value(),
  };
}

function formatAssignmentListHandoffDistributionStepLabel(
  id: AssignmentListHandoffDistributionStepId
) {
  switch (id) {
    case 'copy-link':
      return m.assignment_list_distribution_step_copy_label();
    case 'preview-link':
      return m.assignment_list_distribution_step_preview_label();
    case 'review-results':
      return m.assignment_list_distribution_step_results_label();
  }
}

function toAssignmentListDistributionHandoffItemId(
  id: AssignmentListHandoffDistributionStepId
): AssignmentListPageHandoffItemId {
  switch (id) {
    case 'copy-link':
      return 'distribution-copy-link';
    case 'preview-link':
      return 'distribution-preview-link';
    case 'review-results':
      return 'distribution-review-results';
  }
}

function formatAssignmentListPublishedContextDescription(
  context?: PublishedAssignmentPanelContext
) {
  return context?.body ?? m.assignment_list_handoff_published_context_empty();
}

function formatAssignmentListPublishedContextValue(
  context?: PublishedAssignmentPanelContext
) {
  if (!context) {
    return m.assignment_list_handoff_published_context_empty_value();
  }

  return m.assignment_list_handoff_published_context_value({
    sharePath: context.sharePath,
    status: formatAssignmentListPublishedContextStatus(context.status),
  });
}

function formatAssignmentListPublishedContextStatus(
  status: PublishedAssignmentPanelContext['status']
) {
  switch (status) {
    case 'found':
      return m.assignment_list_handoff_published_context_found();
    case 'loading':
      return m.assignment_list_handoff_published_context_loading();
    case 'missing':
      return m.assignment_list_handoff_published_context_missing();
  }
}

function buildAssignmentListPageHandoffPrivacyView(
  itemViews: AssignmentListPageHandoffItemView[]
): AssignmentListPageHandoffPrivacyView {
  return {
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    exposesInternalAssignmentIds: false,
    exposesInternalOwnerId: false,
    exposesPublicRuntimeContent: false,
    exposesRawAnonymousToken: false,
    exposesResultExportRows: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
  };
}

function buildAssignmentListVisibleCardHandoffItems(
  summary: AssignmentListVisibleCardHandoffSummary
): AssignmentListPageHandoffItemView[] {
  return [
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.openLinks,
      description: m.assignment_list_handoff_visible_open_links_description(),
      id: 'visible-open-links',
      label: m.assignment_list_handoff_visible_open_links_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.closedLinks,
      description: m.assignment_list_handoff_visible_closed_links_description(),
      id: 'visible-closed-links',
      label: m.assignment_list_handoff_visible_closed_links_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.expiredLinks,
      description:
        m.assignment_list_handoff_visible_expired_links_description(),
      id: 'visible-expired-links',
      label: m.assignment_list_handoff_visible_expired_links_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.draftAssignments,
      description:
        m.assignment_list_handoff_visible_draft_assignments_description(),
      id: 'visible-draft-assignments',
      label: m.assignment_list_handoff_visible_draft_assignments_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.copyReady,
      description: m.assignment_list_handoff_visible_copy_ready_description(),
      id: 'visible-copy-ready',
      label: m.assignment_list_handoff_visible_copy_ready_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.copyBlocked,
      description: m.assignment_list_handoff_visible_copy_blocked_description(),
      id: 'visible-copy-blocked',
      label: m.assignment_list_handoff_visible_copy_blocked_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.previewReady,
      description:
        m.assignment_list_handoff_visible_preview_ready_description(),
      id: 'visible-preview-ready',
      label: m.assignment_list_handoff_visible_preview_ready_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.printReady,
      description: m.assignment_list_handoff_visible_print_ready_description(),
      id: 'visible-print-ready',
      label: m.assignment_list_handoff_visible_print_ready_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.resultsReady,
      description:
        m.assignment_list_handoff_visible_results_ready_description(),
      id: 'visible-results-ready',
      label: m.assignment_list_handoff_visible_results_ready_label(),
    }),
    buildAssignmentListVisibleCardCountHandoffItem({
      count: summary.resultEvidence,
      description:
        m.assignment_list_handoff_visible_result_evidence_description(),
      id: 'visible-result-evidence',
      label: m.assignment_list_handoff_visible_result_evidence_label(),
    }),
  ];
}

function buildAssignmentListVisibleCardCountHandoffItem({
  count,
  description,
  id,
  label,
}: {
  count: number;
  description: string;
  id: AssignmentListPageHandoffItemId;
  label: string;
}) {
  return buildAssignmentListPageHandoffItem({
    description,
    id,
    label,
    value: m.assignment_list_handoff_visible_assignment_count_value({
      count: normalizeAssignmentListSummaryCount(count),
    }),
  });
}

function summarizeAssignmentListVisibleCards<
  TItem extends AssignmentListPageItem,
>(assignments: TItem[]): AssignmentListVisibleCardHandoffSummary {
  const summary: AssignmentListVisibleCardHandoffSummary = {
    closedLinks: 0,
    copyBlocked: 0,
    copyReady: 0,
    draftAssignments: 0,
    expiredLinks: 0,
    openLinks: 0,
    previewReady: 0,
    printReady: 0,
    resultEvidence: 0,
    resultsReady: 0,
  };

  for (const assignment of assignments) {
    const cardView = buildAssignmentListCardViewModel(assignment);
    const lifecycleStatus = buildAssignmentShareLinkAvailability({
      expiresAt: assignment.assignment.expiresAt,
      now: assignment.now,
      shareSlug: assignment.assignment.shareSlug,
      status: assignment.assignment.status,
    }).lifecycleStatus;
    const shareAction = cardView.actionView.shareAction;

    switch (lifecycleStatus) {
      case 'closed':
        summary.closedLinks += 1;
        break;
      case 'draft':
        summary.draftAssignments += 1;
        break;
      case 'expired':
        summary.expiredLinks += 1;
        break;
      case 'open':
        summary.openLinks += 1;
        break;
    }

    if (shareAction?.isAvailable) {
      summary.copyReady += 1;
      summary.previewReady += 1;
    } else if (shareAction) {
      summary.copyBlocked += 1;
    }

    if (cardView.actionView.printAction) {
      summary.printReady += 1;
    }
    if (cardView.actionView.resultAction) {
      summary.resultsReady += 1;
    }
    if (normalizeAssignmentListSummaryCount(cardView.stats.completions) > 0) {
      summary.resultEvidence += 1;
    }
  }

  return summary;
}

function buildAssignmentListPageHandoffItem({
  description,
  id,
  label,
  value,
}: {
  description: string;
  id: AssignmentListPageHandoffItemId;
  label: string;
  value: string;
}): AssignmentListPageHandoffItemView {
  return {
    ariaLabel: m.assignment_list_summary_metric_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function formatAssignmentListHandoffNumber(
  value: number,
  options?: { min?: number }
) {
  const normalizedValue = normalizeAssignmentListSummaryCount(value);
  return String(
    options?.min === undefined
      ? normalizedValue
      : Math.max(options.min, normalizedValue)
  );
}

export function buildAssignmentListCardStats({
  averageScore,
  completions,
}: AssignmentListCardStats): AssignmentListCardStat[] {
  const normalizedCompletions =
    normalizeAssignmentListCardStatCount(completions);
  const statsView = buildAssignmentAttemptStatsView({
    averageScore,
    completions: normalizedCompletions,
  });
  const completionsDescription =
    m.assignment_list_card_stat_completions_description();
  const completionsLabel = m.assignment_list_card_stat_completions();
  const completionsValue = formatAssignmentResultNumber(statsView.completions, {
    min: 0,
  });
  const averageDescription = m.assignment_list_card_stat_average_description();
  const averageLabel = m.assignment_list_card_stat_average();
  const averageValue = formatAssignmentResultPercent(statsView.averageScore);

  return [
    {
      ariaLabel: formatAssignmentListCardStatAriaLabel({
        description: completionsDescription,
        label: completionsLabel,
        value: completionsValue,
      }),
      description: completionsDescription,
      key: 'completions',
      label: completionsLabel,
      value: completionsValue,
    },
    {
      ariaLabel: formatAssignmentListCardStatAriaLabel({
        description: averageDescription,
        label: averageLabel,
        value: averageValue,
      }),
      description: averageDescription,
      key: 'average',
      label: averageLabel,
      value: averageValue,
    },
  ];
}

export function buildAssignmentListCardViewModel({
  activity,
  assignment,
  now,
  snapshot,
  stats,
}: AssignmentListCardSource): AssignmentListCardViewModel {
  const persisted = true;
  const resolvedSource = resolveAssignmentSnapshotSource({
    activity,
    snapshot,
  });
  const templateType = resolvedSource.templateType;
  const actionState = getAssignmentListCardActionState({
    expiresAt: assignment.expiresAt,
    now,
    persisted,
    shareSlug: assignment.shareSlug,
    status: assignment.status,
  });
  const statusLabel = getAssignmentListCardStatusLabel({
    expiresAt: assignment.expiresAt,
    now,
    persisted,
    status: assignment.status,
  });
  const templateLabel = getTemplateByType(templateType).name;
  const title = formatAssignmentDisplayTitle(assignment.title);

  return {
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
    }),
    actionsLabel: m.assignment_list_card_actions_label({ title }),
    activityDescription: resolvedSource.activityDescription ?? '',
    ariaLabel: m.assignment_list_card_aria_label({
      shareSlug: actionState.shareAvailability.shareSlug,
      status: statusLabel,
      template: templateLabel,
      title,
    }),
    distributionView: buildAssignmentListDistributionView({
      actionState,
      stats,
    }),
    id: assignment.id,
    persisted,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt: assignment.expiresAt,
      settings: assignment.settingsJson,
    }),
    shareSlug: actionState.shareAvailability.shareSlug,
    stats,
    statsLabel: m.assignment_list_card_stats_label({ title }),
    statItems: buildAssignmentListCardStats(stats),
    status: assignment.status,
    statusLabel,
    summaryLabel: m.assignment_list_card_summary_label({ title }),
    templateLabel,
    templateType,
    title,
  };
}

export function buildStarterAssignmentListCardViewModel({
  activity,
  assignment,
}: StarterAssignmentListCardSource): AssignmentListCardViewModel {
  const expiresAt = assignment.expiresAt ?? null;
  const persisted = false;
  const stats = {
    averageScore: assignment.averageScore,
    completions: assignment.completions,
  };
  const actionState = getAssignmentListCardActionState({
    expiresAt,
    persisted,
    shareSlug: assignment.shareId,
    status: assignment.status,
  });
  const statusLabel = getAssignmentListCardStatusLabel({
    expiresAt,
    persisted,
    status: assignment.status,
  });
  const templateLabel = getTemplateByType(activity.templateType).name;
  const title = formatAssignmentDisplayTitle(assignment.title);

  return {
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
    }),
    actionsLabel: m.assignment_list_card_actions_label({ title }),
    activityDescription: formatAssignmentDisplayText(activity.description),
    ariaLabel: m.assignment_list_card_aria_label({
      shareSlug: actionState.shareAvailability.shareSlug,
      status: statusLabel,
      template: templateLabel,
      title,
    }),
    distributionView: buildAssignmentListDistributionView({
      actionState,
      stats,
    }),
    id: assignment.id,
    persisted,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt,
      settings: assignment.settings,
    }),
    shareSlug: actionState.shareAvailability.shareSlug,
    stats,
    statsLabel: m.assignment_list_card_stats_label({ title }),
    statItems: buildAssignmentListCardStats(stats),
    status: assignment.status,
    statusLabel,
    summaryLabel: m.assignment_list_card_summary_label({ title }),
    templateLabel,
    templateType: activity.templateType,
    title,
  };
}

function getAssignmentListCardStatusLabel({
  expiresAt,
  now,
  persisted,
  status,
}: {
  expiresAt: Date | null;
  now?: number;
  persisted: boolean;
  status: AssignmentStatus;
}) {
  if (!persisted) {
    return m.assignment_list_status_preview();
  }

  return getAssignmentStatusLabel(status, expiresAt, now);
}

function normalizeAssignmentListScopePage(value: number) {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function normalizeAssignmentListScopePageSize(value: number) {
  return Number.isInteger(value) && value > 0
    ? value
    : ASSIGNMENT_LIST_PAGE_SIZE;
}

export function getAssignmentListCardActionState({
  expiresAt,
  now,
  persisted,
  shareSlug,
  status,
}: {
  expiresAt: Date | null;
  now?: number;
  persisted: boolean;
  shareSlug: string;
  status: AssignmentStatus;
}): AssignmentListCardActionState {
  const hasPublishedSnapshot = status !== 'draft';
  const shareAvailability = buildAssignmentShareLinkAvailability({
    expiresAt,
    now,
    shareSlug,
    status,
  });
  const shareDisabledReasonCode = shareAvailability.disabledReasonCode;
  const shareDisabledReason = shareDisabledReasonCode
    ? getAssignmentListShareDisabledReason(shareDisabledReasonCode)
    : undefined;

  return {
    isPersisted: persisted,
    shareAvailability,
    ...(shareDisabledReasonCode ? { shareDisabledReasonCode } : {}),
    ...(shareDisabledReason ? { shareDisabledReason } : {}),
    shareLabel: shareAvailability.isAvailable
      ? assignmentListActionCopy.openShareLink
      : assignmentListActionCopy.shareLinkUnavailable,
    showResultsAction: persisted && hasPublishedSnapshot,
    showShareActions: persisted || shareAvailability.isAvailable,
    statusAction: buildAssignmentStatusAction({
      currentStatus: status,
      expiresAt,
      isPersisted: persisted,
      now,
    }),
  };
}

function normalizeAssignmentListCardStatCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(Math.max(0, value));
}

function formatAssignmentListCardStatAriaLabel({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return m.assignment_list_card_stat_aria_label({
    description,
    label,
    value,
  });
}

export function buildAssignmentListDistributionView({
  actionState,
  stats,
}: {
  actionState: AssignmentListCardActionState;
  stats: AssignmentListCardStats;
}): AssignmentListDistributionView {
  const status = resolveAssignmentListDistributionStatus({
    actionState,
    stats,
  });
  const statusLabel = formatAssignmentListDistributionStatus(status);

  return {
    ariaLabel: m.assignment_list_distribution_aria_label({
      status: statusLabel,
      title: m.assignment_list_distribution_title(),
    }),
    description: formatAssignmentListDistributionDescription(status),
    status,
    statusLabel,
    stepViews: buildAssignmentListDistributionStepViews({
      actionState,
      stats,
    }),
    title: m.assignment_list_distribution_title(),
  };
}

function resolveAssignmentListDistributionStatus({
  actionState,
  stats,
}: {
  actionState: AssignmentListCardActionState;
  stats: AssignmentListCardStats;
}): AssignmentListDistributionStatus {
  if (!actionState.isPersisted) return 'preview';
  if (!actionState.shareAvailability.isAvailable) return 'blocked';

  return normalizeAssignmentListCardStatCount(stats.completions) > 0
    ? 'collecting-results'
    : 'ready-to-share';
}

function buildAssignmentListDistributionStepViews({
  actionState,
  stats,
}: {
  actionState: AssignmentListCardActionState;
  stats: AssignmentListCardStats;
}): AssignmentListDistributionStepView[] {
  const isShareAvailable = actionState.shareAvailability.isAvailable;
  const hasPublishedSnapshot = actionState.showResultsAction;
  const hasCompletions =
    normalizeAssignmentListCardStatCount(stats.completions) > 0;

  return [
    buildAssignmentListDistributionStepView({
      description: isShareAvailable
        ? m.assignment_list_distribution_step_copy_ready_description()
        : m.assignment_list_distribution_step_copy_blocked_description(),
      id: 'copy-link',
      label: m.assignment_list_distribution_step_copy_label(),
      status: isShareAvailable ? 'ready' : 'blocked',
    }),
    buildAssignmentListDistributionStepView({
      description: isShareAvailable
        ? m.assignment_list_distribution_step_preview_ready_description()
        : m.assignment_list_distribution_step_preview_blocked_description(),
      id: 'preview-link',
      label: m.assignment_list_distribution_step_preview_label(),
      status: isShareAvailable ? 'ready' : 'blocked',
    }),
    buildAssignmentListDistributionStepView({
      description: hasPublishedSnapshot
        ? m.assignment_list_distribution_step_print_optional_description()
        : m.assignment_list_distribution_step_print_blocked_description(),
      id: 'print-worksheet',
      label: m.assignment_list_distribution_step_print_label(),
      status: hasPublishedSnapshot ? 'optional' : 'blocked',
    }),
    buildAssignmentListDistributionStepView({
      description: !hasPublishedSnapshot
        ? m.assignment_list_distribution_step_results_blocked_description()
        : hasCompletions
          ? m.assignment_list_distribution_step_results_ready_description()
          : m.assignment_list_distribution_step_results_waiting_description(),
      id: 'review-results',
      label: m.assignment_list_distribution_step_results_label(),
      status: !hasPublishedSnapshot
        ? 'blocked'
        : hasCompletions
          ? 'ready'
          : 'waiting',
    }),
  ];
}

function buildAssignmentListDistributionStepView({
  description,
  id,
  label,
  status,
}: {
  description: string;
  id: AssignmentListDistributionStepId;
  label: string;
  status: AssignmentListDistributionStepStatus;
}): AssignmentListDistributionStepView {
  const statusLabel = formatAssignmentListDistributionStepStatus(status);

  return {
    ariaLabel: m.assignment_list_distribution_step_aria_label({
      description,
      label,
      status: statusLabel,
    }),
    description,
    id,
    label,
    status,
    statusLabel,
  };
}

function formatAssignmentListDistributionStatus(
  status: AssignmentListDistributionStatus
) {
  switch (status) {
    case 'blocked':
      return m.assignment_list_distribution_status_blocked();
    case 'collecting-results':
      return m.assignment_list_distribution_status_collecting_results();
    case 'preview':
      return m.assignment_list_distribution_status_preview();
    case 'ready-to-share':
      return m.assignment_list_distribution_status_ready_to_share();
  }
}

function formatAssignmentListDistributionDescription(
  status: AssignmentListDistributionStatus
) {
  switch (status) {
    case 'blocked':
      return m.assignment_list_distribution_description_blocked();
    case 'collecting-results':
      return m.assignment_list_distribution_description_collecting_results();
    case 'preview':
      return m.assignment_list_distribution_description_preview();
    case 'ready-to-share':
      return m.assignment_list_distribution_description_ready_to_share();
  }
}

function formatAssignmentListDistributionStepStatus(
  status: AssignmentListDistributionStepStatus
) {
  switch (status) {
    case 'blocked':
      return m.assignment_list_distribution_step_status_blocked();
    case 'optional':
      return m.assignment_list_distribution_step_status_optional();
    case 'ready':
      return m.assignment_list_distribution_step_status_ready();
    case 'waiting':
      return m.assignment_list_distribution_step_status_waiting();
  }
}

export function buildAssignmentListCardActionView({
  actionState,
  assignmentId,
}: {
  actionState: AssignmentListCardActionState;
  assignmentId: string;
}): AssignmentListCardActionView {
  return {
    printAction: actionState.showResultsAction
      ? {
          assignmentId,
          label: assignmentListActionCopy.printWorksheet,
          search: buildPrintableAssignmentSearch({ answerKey: false }),
          to: Routes.PrintAssignmentWorksheet,
        }
      : undefined,
    resultAction: actionState.showResultsAction
      ? {
          assignmentId,
          label: assignmentListActionCopy.viewResults,
          to: Routes.DashboardAssignmentResults,
        }
      : undefined,
    shareAction: actionState.showShareActions
      ? buildAssignmentShareLinkActionView({
          disabledReasonCode: actionState.shareDisabledReasonCode,
          disabledReason: actionState.shareDisabledReason,
          isAvailable: actionState.shareAvailability.isAvailable,
          label: actionState.shareLabel,
          shareSlug: actionState.shareAvailability.shareSlug,
        })
      : undefined,
    statusAction: actionState.statusAction,
  };
}

function getAssignmentListShareDisabledReason(
  reasonCode: AssignmentShareLinkDisabledReasonCode
) {
  if (reasonCode === 'closed') {
    return m.assignment_list_share_link_closed();
  }

  if (reasonCode === 'expired') {
    return m.assignment_list_share_link_expired();
  }

  if (reasonCode === 'draft') {
    return m.assignment_list_share_link_draft();
  }

  return undefined;
}
