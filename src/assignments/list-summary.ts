import type { AssignmentStatusFilter } from '@/assignments/list-filters';

export type AssignmentListSummary = {
  averageScore: number;
  completions: number;
  openAssignments: number;
  totalAssignments: number;
};

export type AssignmentListSummaryMetricId =
  | 'total'
  | 'open'
  | 'completions'
  | 'average';

export type AssignmentListSummaryMetric = {
  id: AssignmentListSummaryMetricId;
  label: string;
  value: string;
};

export function buildAssignmentListFilterSummary({
  isLoading,
  search,
  status,
  total,
}: {
  isLoading: boolean;
  search?: string;
  status: AssignmentStatusFilter;
  total: number;
}) {
  const hasFilters = Boolean(search) || status !== 'all';

  return {
    hasFilters,
    text: isLoading
      ? 'Loading assignments...'
      : hasFilters
        ? `${total} ${total === 1 ? 'match' : 'matches'}`
        : `${total} total ${total === 1 ? 'assignment' : 'assignments'}`,
  };
}

export function buildAssignmentListSummaryMetrics({
  hasFilters,
  summary,
  totalAssignments,
}: {
  hasFilters: boolean;
  summary?: AssignmentListSummary;
  totalAssignments: number;
}): AssignmentListSummaryMetric[] {
  const resolvedSummary = summary ?? {
    averageScore: 0,
    completions: 0,
    openAssignments: 0,
    totalAssignments,
  };

  return [
    {
      id: 'total',
      label: hasFilters ? 'Matching' : 'Assignments',
      value: String(resolvedSummary.totalAssignments),
    },
    {
      id: 'open',
      label: 'Open links',
      value: String(resolvedSummary.openAssignments),
    },
    {
      id: 'completions',
      label: 'Completions',
      value: String(resolvedSummary.completions),
    },
    {
      id: 'average',
      label: 'Average',
      value: `${resolvedSummary.averageScore}%`,
    },
  ];
}
