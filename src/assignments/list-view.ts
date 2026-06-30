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

export type AssignmentListSearchPanelView = {
  filterSummary: AssignmentListFilterSummary;
  hasSearchValue: boolean;
  statusDescription: string;
  statusLabel: string;
  statusMetrics: AssignmentListStatusMetric[];
  statusOptions: AssignmentListControlOption[];
};

export type AssignmentListCardStatKey = 'average' | 'completions';

export type AssignmentListCardStat = {
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

export type AssignmentListCardViewModel = {
  actionView: AssignmentListCardActionView;
  activityDescription: string;
  id: string;
  persisted: boolean;
  settingsSummaryView: AssignmentSettingsSummaryView;
  shareSlug: string;
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
  hasAssignments: boolean;
  loadErrorMessage: string;
  publishedPanelContext?: PublishedAssignmentPanelContext;
  resolvedSearch: AssignmentListPageResolvedSearch;
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
    statusDescription: statusView.description,
    statusLabel: statusView.label,
    statusMetrics: buildAssignmentListStatusMetrics(summary),
    statusOptions: assignmentStatusFilterOptions,
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
  const totalAssignments = data?.total ?? 0;
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
    hasAssignments: assignments.length > 0,
    loadErrorMessage: assignmentListPageCopy.loadErrorMessage,
    publishedPanelContext,
    resolvedSearch,
    starterPreview: resolvedStarterPreview,
    summaryMetrics: buildAssignmentListSummaryMetrics({
      hasFilters: resolvedSearch.hasFilters,
      summary: data?.summary,
      totalAssignments,
    }),
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

  return [
    {
      key: 'completions',
      label: m.assignment_list_card_stat_completions(),
      value: formatAssignmentResultNumber(statsView.completions, { min: 0 }),
    },
    {
      key: 'average',
      label: m.assignment_list_card_stat_average(),
      value: formatAssignmentResultPercent(statsView.averageScore),
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

  return {
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
    }),
    activityDescription: resolvedSource.activityDescription ?? '',
    id: assignment.id,
    persisted,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt: assignment.expiresAt,
      settings: assignment.settingsJson,
    }),
    shareSlug: actionState.shareAvailability.shareSlug,
    stats,
    statItems: buildAssignmentListCardStats(stats),
    status: assignment.status,
    statusLabel: getAssignmentListCardStatusLabel({
      expiresAt: assignment.expiresAt,
      now,
      persisted,
      status: assignment.status,
    }),
    templateLabel: getTemplateByType(templateType).name,
    templateType,
    title: formatAssignmentDisplayTitle(assignment.title),
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

  return {
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
    }),
    activityDescription: formatAssignmentDisplayText(activity.description),
    id: assignment.id,
    persisted,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt,
      settings: assignment.settings,
    }),
    shareSlug: actionState.shareAvailability.shareSlug,
    stats,
    statItems: buildAssignmentListCardStats(stats),
    status: assignment.status,
    statusLabel: getAssignmentListCardStatusLabel({
      expiresAt,
      persisted,
      status: assignment.status,
    }),
    templateLabel: getTemplateByType(activity.templateType).name,
    templateType: activity.templateType,
    title: formatAssignmentDisplayTitle(assignment.title),
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
