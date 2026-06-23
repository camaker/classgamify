import type {
  ActivityTemplateType,
  AssignmentSettings,
  AssignmentStatus,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import type { AssignmentStatusFilter } from '@/assignments/list-filters';
import {
  type AssignmentStatusAction,
  buildAssignmentStatusAction,
  getAssignmentStatusLabel,
} from '@/assignments/lifecycle';
import { formatAssignmentResultPercent } from '@/assignments/result-format';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { m } from '@/locale/paraglide/messages';

type AssignmentListControlOption = {
  label: string;
  value: AssignmentStatusFilter;
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

export function buildAssignmentListCardStats({
  averageScore,
  completions,
}: {
  averageScore: number;
  completions: number;
}): AssignmentListCardStat[] {
  return [
    {
      key: 'completions',
      label: m.assignment_list_card_stat_completions(),
      value: String(completions),
    },
    {
      key: 'average',
      label: m.assignment_list_card_stat_average(),
      value: formatAssignmentResultPercent(averageScore),
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
  const templateType = snapshot?.templateType ?? activity.templateType;
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
      shareSlug: assignment.shareSlug,
    }),
    activityDescription:
      snapshot?.activityDescription ?? activity.description ?? '',
    expiresAt: assignment.expiresAt,
    id: assignment.id,
    persisted,
    settings: assignment.settingsJson,
    shareSlug: assignment.shareSlug,
    stats,
    statItems: buildAssignmentListCardStats(stats),
    status: assignment.status,
    statusLabel: getAssignmentStatusLabel(
      assignment.status,
      assignment.expiresAt,
      now
    ),
    templateLabel: getTemplateByType(templateType).name,
    templateType,
    title: assignment.title,
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
    status: assignment.status,
  });

  return {
    actionState,
    actionView: buildAssignmentListCardActionView({
      actionState,
      assignmentId: assignment.id,
      shareSlug: assignment.shareId,
    }),
    activityDescription: activity.description,
    expiresAt,
    id: assignment.id,
    persisted,
    settings: assignment.settings,
    shareSlug: assignment.shareId,
    stats,
    statItems: buildAssignmentListCardStats(stats),
    status: assignment.status,
    statusLabel: getAssignmentStatusLabel(assignment.status, expiresAt),
    templateLabel: getTemplateByType(activity.templateType).name,
    templateType: activity.templateType,
    title: assignment.title,
  };
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

  return {
    isPersisted: persisted,
    showResultsAction: persisted && hasPublishedSnapshot,
    showShareActions: hasPublishedSnapshot,
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
  return {
    resultAction: actionState.showResultsAction
      ? {
          assignmentId,
          label: assignmentListActionCopy.viewResults,
        }
      : undefined,
    shareAction: actionState.showShareActions
      ? {
          label: assignmentListActionCopy.openShareLink,
          sharePath: buildAssignmentSharePath(shareSlug),
          shareSlug,
        }
      : undefined,
    statusAction: actionState.statusAction,
  };
}
