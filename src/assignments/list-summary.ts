import type { AssignmentStatus } from '@/activities/types';
import {
  buildAssignmentAttemptStatsView,
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

export type AssignmentListSummary = {
  averageScore: number;
  closedAssignments: number;
  completions: number;
  draftAssignments: number;
  expiredAssignments: number;
  openAssignments: number;
  totalAssignments: number;
};

export type AssignmentListSummaryMetricId =
  | 'total'
  | 'open'
  | 'completions'
  | 'average';

export type AssignmentListSummaryMetric = {
  description?: string;
  id: AssignmentListSummaryMetricId;
  label: string;
  value: string;
};

export type AssignmentListFilterSummary = {
  hasFilters: boolean;
  text: string;
};

export type AssignmentListStatusMetric = {
  label: string;
  status: AssignmentStatusFilter;
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
  const statusCounts = buildAssignmentListStatusCounts({ assignments, now });

  return {
    averageScore: stats.averageScore,
    closedAssignments: statusCounts.closed,
    completions: stats.completions,
    draftAssignments: statusCounts.draft,
    expiredAssignments: statusCounts.expired,
    openAssignments: statusCounts.open,
    totalAssignments,
  };
}

export function buildEmptyAssignmentListSummary(
  totalAssignments = 0
): AssignmentListSummary {
  return {
    averageScore: 0,
    closedAssignments: 0,
    completions: 0,
    draftAssignments: 0,
    expiredAssignments: 0,
    openAssignments: 0,
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
}): AssignmentListFilterSummary {
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
  const resolvedSummary =
    summary ?? buildEmptyAssignmentListSummary(totalAssignments);
  const statsView = buildAssignmentAttemptStatsView(resolvedSummary);

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
      description: formatAssignmentOpenLinksDescription(resolvedSummary),
      id: 'open',
      label: m.assignment_list_summary_open_links(),
      value: formatAssignmentResultNumber(resolvedSummary.openAssignments, {
        min: 0,
      }),
    },
    {
      description: formatAssignmentCompletionsDescription(resolvedSummary),
      id: 'completions',
      label: m.assignment_list_summary_completions(),
      value: formatAssignmentResultNumber(statsView.completions, {
        min: 0,
      }),
    },
    {
      description: formatAssignmentAverageDescription(resolvedSummary),
      id: 'average',
      label: m.assignment_list_summary_average(),
      value: formatAssignmentResultPercent(statsView.averageScore),
    },
  ];
}

export function buildAssignmentListStatusMetrics(
  summary?: AssignmentListSummary
): AssignmentListStatusMetric[] {
  const resolvedSummary = summary ?? buildEmptyAssignmentListSummary();

  return [
    {
      label: m.assignment_list_status_filter_published(),
      status: 'open',
      value: formatAssignmentResultNumber(resolvedSummary.openAssignments, {
        min: 0,
      }),
    },
    {
      label: m.assignment_list_status_filter_closed(),
      status: 'closed',
      value: formatAssignmentResultNumber(resolvedSummary.closedAssignments, {
        min: 0,
      }),
    },
    {
      label: m.assignment_list_status_filter_expired(),
      status: 'expired',
      value: formatAssignmentResultNumber(resolvedSummary.expiredAssignments, {
        min: 0,
      }),
    },
    {
      label: m.assignment_list_status_filter_draft(),
      status: 'draft',
      value: formatAssignmentResultNumber(resolvedSummary.draftAssignments, {
        min: 0,
      }),
    },
  ];
}

function buildAssignmentListStatusCounts({
  assignments,
  now,
}: {
  assignments: AssignmentListSummaryAssignmentSource[];
  now: number;
}) {
  return {
    closed: countAssignmentsMatchingStatus({
      assignments,
      now,
      status: 'closed',
    }),
    draft: countAssignmentsMatchingStatus({
      assignments,
      now,
      status: 'draft',
    }),
    expired: countAssignmentsMatchingStatus({
      assignments,
      now,
      status: 'expired',
    }),
    open: countAssignmentsMatchingStatus({
      assignments,
      now,
      status: 'open',
    }),
  };
}

function countAssignmentsMatchingStatus({
  assignments,
  now,
  status,
}: {
  assignments: AssignmentListSummaryAssignmentSource[];
  now: number;
  status: Exclude<AssignmentStatusFilter, 'all'>;
}) {
  return assignments.filter((item) =>
    matchesAssignmentLifecycleStatus({
      expiresAt: item.expiresAt,
      filter: status,
      now,
      status: item.status,
    })
  ).length;
}

function formatAssignmentOpenLinksDescription(summary: AssignmentListSummary) {
  const openAssignments = formatAssignmentListDescriptionCount(
    summary.openAssignments
  );

  return openAssignments === '1'
    ? m.assignment_list_summary_open_links_one({
        count: openAssignments,
      })
    : m.assignment_list_summary_open_links_many({
        count: openAssignments,
      });
}

function formatAssignmentCompletionsDescription(
  summary: AssignmentListSummary
) {
  const completions = formatAssignmentListDescriptionCount(summary.completions);

  return completions === '1'
    ? m.assignment_list_summary_completions_one({
        count: completions,
      })
    : m.assignment_list_summary_completions_many({
        count: completions,
      });
}

function formatAssignmentAverageDescription(summary: AssignmentListSummary) {
  return summary.completions > 0
    ? m.assignment_list_summary_average_with_attempts()
    : m.assignment_list_summary_average_empty();
}

function formatAssignmentListDescriptionCount(value: number) {
  return formatAssignmentResultNumber(Number.isFinite(value) ? value : 0, {
    min: 0,
  });
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
