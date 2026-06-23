import type { AssignmentStatus } from '@/activities/types';
import {
  summarizeAssignmentAttempts,
  type AssignmentAttemptStatsSource,
} from '@/assignments/attempt-stats';
import type { AssignmentStatusFilter } from '@/assignments/list-filters';
import {
  type AssignmentDate,
  matchesAssignmentLifecycleStatus,
} from '@/assignments/lifecycle';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
} from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

type AssignmentListSummaryAssignmentSource = {
  expiresAt: AssignmentDate;
  status: AssignmentStatus | string;
};

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

export function buildAssignmentListSummary({
  attempts,
  assignments,
  now = Date.now(),
  totalAssignments = assignments.length,
}: {
  attempts: AssignmentAttemptStatsSource[];
  assignments: AssignmentListSummaryAssignmentSource[];
  now?: number;
  totalAssignments?: number;
}): AssignmentListSummary {
  const stats = summarizeAssignmentAttempts(attempts);

  return {
    averageScore: stats.averageScore,
    completions: stats.completions,
    openAssignments: assignments.filter((item) =>
      matchesAssignmentLifecycleStatus({
        expiresAt: item.expiresAt,
        filter: 'open',
        now,
        status: item.status,
      })
    ).length,
    totalAssignments,
  };
}

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
      value: formatAssignmentResultNumber(resolvedSummary.totalAssignments, {
        min: 0,
      }),
    },
    {
      id: 'open',
      label: m.assignment_list_summary_open_links(),
      value: formatAssignmentResultNumber(resolvedSummary.openAssignments, {
        min: 0,
      }),
    },
    {
      id: 'completions',
      label: m.assignment_list_summary_completions(),
      value: formatAssignmentResultNumber(resolvedSummary.completions, {
        min: 0,
      }),
    },
    {
      id: 'average',
      label: m.assignment_list_summary_average(),
      value: formatAssignmentResultPercent(resolvedSummary.averageScore),
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
