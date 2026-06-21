import type { AssignmentStatus } from '@/activities/types';
import type { AssignmentStatusFilter } from '@/assignments/list-filters';
import { buildAssignmentStatusAction } from '@/assignments/lifecycle';

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

export function getAssignmentListCardActionState({
  expiresAt,
  id,
  status,
}: {
  expiresAt: Date | null;
  id: string;
  status: AssignmentStatus;
}) {
  const isPersisted = !id.startsWith('assignment-');

  return {
    isPersisted,
    statusAction: buildAssignmentStatusAction({
      currentStatus: status,
      expiresAt,
      isPersisted,
    }),
  };
}
