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
