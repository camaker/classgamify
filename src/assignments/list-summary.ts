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
  ariaLabel: string;
  description: string;
  id: AssignmentListSummaryMetricId;
  label: string;
  value: string;
};

export type AssignmentListFilterSummary = {
  hasFilters: boolean;
  text: string;
};

export type AssignmentListStatusMetric = {
  ariaLabel: string;
  label: string;
  status: AssignmentStatusFilter;
  text: string;
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
  const stats = summarizeAssignmentAttempts(attempts, {
    respectAttemptTimeLimit: true,
  });
  const statusCounts = buildAssignmentListStatusCounts({ assignments, now });

  return {
    averageScore: stats.averageScore,
    closedAssignments: statusCounts.closed,
    completions: stats.completions,
    draftAssignments: statusCounts.draft,
    expiredAssignments: statusCounts.expired,
    openAssignments: statusCounts.open,
    totalAssignments: normalizeAssignmentListSummaryCount(totalAssignments),
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
    totalAssignments: normalizeAssignmentListSummaryCount(totalAssignments),
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
  const resolvedSummary = normalizeAssignmentListSummaryForMetrics(
    summary ?? buildEmptyAssignmentListSummary(totalAssignments)
  );
  const statsView = buildAssignmentAttemptStatsView(resolvedSummary);
  const totalDescription = hasFilters
    ? m.assignment_list_summary_matching_description()
    : m.assignment_list_summary_assignments_description();
  const totalLabel = hasFilters
    ? m.assignment_list_summary_matching()
    : m.assignment_list_summary_assignments();
  const totalValue = formatAssignmentResultNumber(
    resolvedSummary.totalAssignments,
    {
      min: 0,
    }
  );
  const openDescription = formatAssignmentOpenLinksDescription(resolvedSummary);
  const openLabel = m.assignment_list_summary_open_links();
  const openValue = formatAssignmentResultNumber(
    resolvedSummary.openAssignments,
    {
      min: 0,
    }
  );
  const completionsDescription =
    formatAssignmentCompletionsDescription(resolvedSummary);
  const completionsLabel = m.assignment_list_summary_completions();
  const completionsValue = formatAssignmentResultNumber(statsView.completions, {
    min: 0,
  });
  const averageDescription =
    formatAssignmentAverageDescription(resolvedSummary);
  const averageLabel = m.assignment_list_summary_average();
  const averageValue = formatAssignmentResultPercent(statsView.averageScore);

  return [
    {
      ariaLabel: formatAssignmentListSummaryMetricAriaLabel({
        description: totalDescription,
        label: totalLabel,
        value: totalValue,
      }),
      description: totalDescription,
      id: 'total',
      label: totalLabel,
      value: totalValue,
    },
    {
      ariaLabel: formatAssignmentListSummaryMetricAriaLabel({
        description: openDescription,
        label: openLabel,
        value: openValue,
      }),
      description: openDescription,
      id: 'open',
      label: openLabel,
      value: openValue,
    },
    {
      ariaLabel: formatAssignmentListSummaryMetricAriaLabel({
        description: completionsDescription,
        label: completionsLabel,
        value: completionsValue,
      }),
      description: completionsDescription,
      id: 'completions',
      label: completionsLabel,
      value: completionsValue,
    },
    {
      ariaLabel: formatAssignmentListSummaryMetricAriaLabel({
        description: averageDescription,
        label: averageLabel,
        value: averageValue,
      }),
      description: averageDescription,
      id: 'average',
      label: averageLabel,
      value: averageValue,
    },
  ];
}

export function buildAssignmentListStatusMetrics(
  summary?: AssignmentListSummary
): AssignmentListStatusMetric[] {
  const resolvedSummary = normalizeAssignmentListSummaryForMetrics(
    summary ?? buildEmptyAssignmentListSummary()
  );
  const openLabel = m.assignment_list_status_filter_published();
  const openValue = formatAssignmentResultNumber(
    resolvedSummary.openAssignments,
    {
      min: 0,
    }
  );
  const closedLabel = m.assignment_list_status_filter_closed();
  const closedValue = formatAssignmentResultNumber(
    resolvedSummary.closedAssignments,
    {
      min: 0,
    }
  );
  const expiredLabel = m.assignment_list_status_filter_expired();
  const expiredValue = formatAssignmentResultNumber(
    resolvedSummary.expiredAssignments,
    {
      min: 0,
    }
  );
  const draftLabel = m.assignment_list_status_filter_draft();
  const draftValue = formatAssignmentResultNumber(
    resolvedSummary.draftAssignments,
    {
      min: 0,
    }
  );

  return [
    {
      ariaLabel: formatAssignmentListStatusMetricAriaLabel({
        label: openLabel,
        value: openValue,
      }),
      label: openLabel,
      status: 'open',
      text: formatAssignmentListStatusMetricAriaLabel({
        label: openLabel,
        value: openValue,
      }),
      value: openValue,
    },
    {
      ariaLabel: formatAssignmentListStatusMetricAriaLabel({
        label: closedLabel,
        value: closedValue,
      }),
      label: closedLabel,
      status: 'closed',
      text: formatAssignmentListStatusMetricAriaLabel({
        label: closedLabel,
        value: closedValue,
      }),
      value: closedValue,
    },
    {
      ariaLabel: formatAssignmentListStatusMetricAriaLabel({
        label: expiredLabel,
        value: expiredValue,
      }),
      label: expiredLabel,
      status: 'expired',
      text: formatAssignmentListStatusMetricAriaLabel({
        label: expiredLabel,
        value: expiredValue,
      }),
      value: expiredValue,
    },
    {
      ariaLabel: formatAssignmentListStatusMetricAriaLabel({
        label: draftLabel,
        value: draftValue,
      }),
      label: draftLabel,
      status: 'draft',
      text: formatAssignmentListStatusMetricAriaLabel({
        label: draftLabel,
        value: draftValue,
      }),
      value: draftValue,
    },
  ];
}

function formatAssignmentListSummaryMetricAriaLabel({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return m.assignment_list_summary_metric_aria_label({
    description,
    label,
    value,
  });
}

function formatAssignmentListStatusMetricAriaLabel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return m.assignment_list_status_metric_aria_label({ label, value });
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
  const normalizedCount = normalizeAssignmentListSummaryCount(count);

  if (normalizedCount === 1) {
    return m.assignment_list_filter_summary_matches_one({
      count: normalizedCount,
    });
  }

  return m.assignment_list_filter_summary_matches_many({
    count: normalizedCount,
  });
}

function formatAssignmentListTotal(count: number) {
  const normalizedCount = normalizeAssignmentListSummaryCount(count);

  if (normalizedCount === 1) {
    return m.assignment_list_filter_summary_total_one({
      count: normalizedCount,
    });
  }

  return m.assignment_list_filter_summary_total_many({
    count: normalizedCount,
  });
}

function normalizeAssignmentListSummaryForMetrics(
  summary: AssignmentListSummary
): AssignmentListSummary {
  return {
    ...summary,
    closedAssignments: normalizeAssignmentListSummaryCount(
      summary.closedAssignments
    ),
    completions: normalizeAssignmentListSummaryCount(summary.completions),
    draftAssignments: normalizeAssignmentListSummaryCount(
      summary.draftAssignments
    ),
    expiredAssignments: normalizeAssignmentListSummaryCount(
      summary.expiredAssignments
    ),
    openAssignments: normalizeAssignmentListSummaryCount(
      summary.openAssignments
    ),
    totalAssignments: normalizeAssignmentListSummaryCount(
      summary.totalAssignments
    ),
  };
}

export function normalizeAssignmentListSummaryCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(Math.max(0, value));
}
