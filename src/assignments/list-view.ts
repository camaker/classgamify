import type {
  ActivityTemplateType,
  AssignmentSettings,
  AssignmentStatus,
} from '@/activities/types';
import type { AssignmentStatusFilter } from '@/assignments/list-filters';
import {
  type AssignmentStatusAction,
  buildAssignmentStatusAction,
  getAssignmentStatusLabel,
} from '@/assignments/lifecycle';
import { buildAssignmentSharePath } from '@/assignments/share-link';

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
  breadcrumbCurrent: 'Assignments',
  breadcrumbDashboard: 'Dashboard',
  description:
    'Published activity instances with share links, classroom settings, and result metrics.',
  loadErrorMessage:
    'Assignments could not be loaded. Refresh the page or sign in again.',
  title: 'Assignments',
} as const;

export const assignmentListSearchCopy = {
  clearSearchLabel: 'Clear assignment search',
  label: 'Search assignments',
  placeholder: 'Search by assignment, activity, or share id',
  statusLabel: 'Status',
} as const;

export const assignmentListActionCopy = {
  clearFilters: 'Clear filters',
  dismiss: 'Dismiss',
  openActivityLibrary: 'Open activity library',
  openPublishedLink: 'Open link',
  openShareLink: 'Open share link',
  viewResults: 'View results',
} as const;

export const assignmentListPublishedPanelCopy = {
  missingHint:
    'The new assignment may be on another page after filtering. The share link actions still use the published link id.',
  publishedLabel: 'Assignment published',
} as const;

const assignmentListEmptyStateCopy = {
  emptyLibrary: {
    description:
      'Open the activity library and publish a saved activity to create a student share link.',
    title: 'No published assignments yet.',
  },
  filtered: {
    description:
      'Try another assignment title, share id, activity name, or status.',
    title: 'No matching assignments.',
  },
} as const;

export const assignmentStatusFilterOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Closed', value: 'closed' },
  { label: 'Draft', value: 'draft' },
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
      label: 'Completions',
      value: String(completions),
    },
    {
      key: 'average',
      label: 'Average',
      value: `${averageScore}%`,
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
    templateType: snapshot?.templateType ?? activity.templateType,
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
