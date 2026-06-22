import type { AssignmentStatusFilter } from '@/assignments/list-filters';
import { m } from '@/locale/paraglide/messages';

type AssignmentListSummary = {
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
      ? m.assignment_list_filter_summary_loading()
      : hasFilters
        ? formatAssignmentListMatches(total)
        : formatAssignmentListTotal(total),
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
      label: hasFilters
        ? m.assignment_list_summary_matching()
        : m.assignment_list_summary_assignments(),
      value: String(resolvedSummary.totalAssignments),
    },
    {
      id: 'open',
      label: m.assignment_list_summary_open_links(),
      value: String(resolvedSummary.openAssignments),
    },
    {
      id: 'completions',
      label: m.assignment_list_summary_completions(),
      value: String(resolvedSummary.completions),
    },
    {
      id: 'average',
      label: m.assignment_list_summary_average(),
      value: `${resolvedSummary.averageScore}%`,
    },
  ];
}

function formatAssignmentListMatches(count: number) {
  if (count === 1) {
    return m.assignment_list_filter_summary_matches_one({ count });
  }

  return m.assignment_list_filter_summary_matches_many({ count });
}

function formatAssignmentListTotal(count: number) {
  if (count === 1) {
    return m.assignment_list_filter_summary_total_one({ count });
  }

  return m.assignment_list_filter_summary_total_many({ count });
}
