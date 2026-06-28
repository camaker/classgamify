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
  buildAssignmentListSummaryMetrics,
  type AssignmentListFilterSummary,
  type AssignmentListSummary,
  type AssignmentListSummaryMetric,
} from '@/assignments/list-summary';
import {
  type AssignmentStatusAction,
  buildAssignmentStatusAction,
  getAssignmentStatusLabel,
  isAssignmentOpen,
} from '@/assignments/lifecycle';
import {
  buildPublishedAssignmentPanelContext,
  resolvePublishedAssignmentPanelAssignment,
} from '@/assignments/published-assignment';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
} from '@/assignments/result-format';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

type AssignmentListControlOption = {
  label: string;
  value: AssignmentStatusFilter;
};

type AssignmentListSearchPanelView = {
  filterSummary: AssignmentListFilterSummary;
  hasSearchValue: boolean;
  statusOptions: AssignmentListControlOption[];
};

type AssignmentListCardStatKey = 'average' | 'completions';

type AssignmentListCardStat = {
  key: AssignmentListCardStatKey;
  label: string;
  value: string;
};

type AssignmentListCardActionState = {
  isPersisted: boolean;
  showResultsAction: boolean;
  showShareActions: boolean;
  statusAction: AssignmentStatusAction | undefined;
};

type AssignmentListCardActionView = {
  printAction:
    | {
        assignmentId: string;
        label: string;
      }
    | undefined;
  resultAction:
    | {
        assignmentId: string;
        label: string;
      }
    | undefined;
  shareAction:
    | {
        label: string;
        sharePath: string;
        shareSlug: string;
      }
    | undefined;
  statusAction: AssignmentStatusAction | undefined;
};

type AssignmentListCardViewModel = {
  actionState: AssignmentListCardActionState;
  actionView: AssignmentListCardActionView;
  activityDescription: string;
  expiresAt: Date | null;
  id: string;
  persisted: boolean;
  settings: AssignmentSettings;
  settingsSummaryView: AssignmentSettingsSummaryView;
  shareSlug: string;
  status: AssignmentStatus;
  templateLabel: string;
  templateType: ActivityTemplateType;
  title: string;
  stats: {
    averageScore: number;
    completions: number;
  };
  statItems: AssignmentListCardStat[];
  statusLabel: string;
};

type AssignmentListCardSource = {
  activity: {
    description: string | null;
    templateType: ActivityTemplateType;
  };
  assignment: {
    expiresAt: Date | null;
    id: string;
    settingsJson: AssignmentSettings;
    shareSlug: string;
    status: AssignmentStatus;
    title: string;
  };
  snapshot?: {
    activityDescription: string | null;
    templateType: ActivityTemplateType;
  } | null;
  stats: AssignmentListCardViewModel['stats'];
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

type AssignmentListPageItem = AssignmentListCardSource & {
  assignment: AssignmentListCardSource['assignment'] & {
    id: string;
    shareSlug: string;
    title: string;
  };
};

type AssignmentListPageData<TItem extends AssignmentListPageItem> = {
  items: TItem[];
  publishedAssignment?: {
    id: string;
    shareSlug: string;
    title: string;
  } | null;
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
  publishedPanelContext?: ReturnType<
    typeof buildPublishedAssignmentPanelContext
  >;
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
    value: 'all',
  },
  {
    get label() {
      return m.assignment_list_status_filter_published();
    },
    value: 'open',
  },
  {
    get label() {
      return m.assignment_list_status_filter_expired();
    },
    value: 'expired',
  },
  {
    get label() {
      return m.assignment_list_status_filter_closed();
    },
    value: 'closed',
  },
  {
    get label() {
      return m.assignment_list_status_filter_draft();
    },
    value: 'draft',
  },
] satisfies Array<AssignmentListControlOption>;

export function buildAssignmentListSearchPanelView({
  isLoading,
  search,
  status,
  total,
}: {
  isLoading: boolean;
  search: string;
  status: AssignmentStatusFilter;
  total: number;
}): AssignmentListSearchPanelView {
  const normalizedSearch = normalizeAssignmentListSearch(search);

  return {
    filterSummary: buildAssignmentListFilterSummary({
      isLoading,
      search: normalizedSearch,
      status,
      total,
    }),
    hasSearchValue: Boolean(normalizedSearch),
    statusOptions: assignmentStatusFilterOptions,
  };
}

export function getAssignmentListEmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return hasFilters
    ? assignmentListEmptyStateCopy.filtered
    : assignmentListEmptyStateCopy.emptyLibrary;
}

export function buildAssignmentListEmptyStateView({
  hasFilters,
}: {
  hasFilters: boolean;
}): AssignmentListEmptyStateView {
  return {
    ...getAssignmentListEmptyState({ hasFilters }),
    showStarterAssignments: !hasFilters,
  };
}

export function buildAssignmentListPageViewModel<
  TItem extends AssignmentListPageItem,
>({
  data,
  isLoading,
  starterPreview = buildAssignmentListStarterPreview(),
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

  return {
    assignments,
    breadcrumbs: [
      {
        href: Routes.Dashboard,
        label: assignmentListPageCopy.breadcrumbDashboard,
      },
      {
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
    starterPreview,
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
}: {
  averageScore: number;
  completions: number;
}): AssignmentListCardStat[] {
  const statsView = buildAssignmentAttemptStatsView({
    averageScore,
    completions,
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
  const shareSlug = normalizeAssignmentShareSlug(assignment.shareSlug);
  const actionState = getAssignmentListCardActionState({
    expiresAt: assignment.expiresAt,
    now,
    persisted,
    status: assignment.status,
  });

  return {
    actionState,
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
      shareSlug,
    }),
    activityDescription: resolvedSource.activityDescription ?? '',
    expiresAt: assignment.expiresAt,
    id: assignment.id,
    persisted,
    settings: assignment.settingsJson,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt: assignment.expiresAt,
      settings: assignment.settingsJson,
    }),
    shareSlug,
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
  const shareSlug = normalizeAssignmentShareSlug(assignment.shareId);
  const actionState = getAssignmentListCardActionState({
    expiresAt,
    persisted,
    status: assignment.status,
  });

  return {
    actionState,
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
      shareSlug,
    }),
    activityDescription: formatAssignmentDisplayText(activity.description),
    expiresAt,
    id: assignment.id,
    persisted,
    settings: assignment.settings,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt,
      settings: assignment.settings,
    }),
    shareSlug,
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
  status,
}: {
  expiresAt: Date | null;
  now?: number;
  persisted: boolean;
  status: AssignmentStatus;
}): AssignmentListCardActionState {
  const hasPublishedSnapshot = status !== 'draft';
  const canShareStudentLink = isAssignmentOpen(status, expiresAt, now);

  return {
    isPersisted: persisted,
    showResultsAction: persisted && hasPublishedSnapshot,
    showShareActions: canShareStudentLink,
    statusAction: buildAssignmentStatusAction({
      currentStatus: status,
      expiresAt,
      isPersisted: persisted,
      now,
    }),
  };
}

export function buildAssignmentListCardActionView({
  actionState,
  assignmentId,
  shareSlug,
}: {
  actionState: AssignmentListCardActionState;
  assignmentId: string;
  shareSlug: string;
}): AssignmentListCardActionView {
  const normalizedShareSlug = normalizeAssignmentShareSlug(shareSlug);

  return {
    printAction: actionState.showResultsAction
      ? {
          assignmentId,
          label: assignmentListActionCopy.printWorksheet,
        }
      : undefined,
    resultAction: actionState.showResultsAction
      ? {
          assignmentId,
          label: assignmentListActionCopy.viewResults,
        }
      : undefined,
    shareAction: actionState.showShareActions
      ? {
          label: assignmentListActionCopy.openShareLink,
          sharePath: buildAssignmentSharePath(normalizedShareSlug),
          shareSlug: normalizedShareSlug,
        }
      : undefined,
    statusAction: actionState.statusAction,
  };
}
