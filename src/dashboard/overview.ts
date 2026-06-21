import { activityTemplates } from '@/activities/catalog';

export type DashboardActivitySummary = {
  draftActivities: number;
  templateCoverage: number;
  totalActivities: number;
};

export type DashboardAssignmentSummary = {
  averageScore: number;
  completions: number;
  openAssignments: number;
};

export type DashboardOverviewMetricId =
  | 'activities'
  | 'templates'
  | 'assignments'
  | 'results';

export type DashboardOverviewMetric = {
  description: string;
  id: DashboardOverviewMetricId;
  label: string;
  value: string;
};

export type DashboardCoreLoopReadinessId =
  | 'activity-authoring'
  | 'assignment-links'
  | 'student-runner'
  | 'teacher-results';

export type DashboardCoreLoopReadinessRow = {
  id: DashboardCoreLoopReadinessId;
  label: string;
  value: number;
};

export function buildDashboardOverviewMetrics({
  activitySummary,
  assignmentSummary,
  isLoading,
}: {
  activitySummary?: DashboardActivitySummary;
  assignmentSummary?: DashboardAssignmentSummary;
  isLoading: boolean;
}): DashboardOverviewMetric[] {
  return [
    {
      description: isLoading
        ? 'Loading your library...'
        : `${activitySummary?.draftActivities ?? 0} drafts in your active library`,
      id: 'activities',
      label: 'Activities',
      value: formatDashboardMetricValue(activitySummary?.totalActivities),
    },
    {
      description: 'Template families represented by your active activities',
      id: 'templates',
      label: 'Templates',
      value: `${activitySummary?.templateCoverage ?? 0}/${activityTemplates.length}`,
    },
    {
      description: 'Open classroom share links',
      id: 'assignments',
      label: 'Assignments',
      value: formatDashboardMetricValue(assignmentSummary?.openAssignments),
    },
    {
      description: `${assignmentSummary?.completions ?? 0} submitted attempts logged`,
      id: 'results',
      label: 'Results',
      value: `${assignmentSummary?.averageScore ?? 0}%`,
    },
  ];
}

export function buildDashboardCoreLoopReadiness(): DashboardCoreLoopReadinessRow[] {
  return [
    {
      id: 'activity-authoring',
      label: 'Activity authoring',
      value: 100,
    },
    {
      id: 'assignment-links',
      label: 'Assignment links',
      value: 100,
    },
    {
      id: 'student-runner',
      label: 'Student runner',
      value: 85,
    },
    {
      id: 'teacher-results',
      label: 'Teacher results',
      value: 90,
    },
  ];
}

export function formatDashboardMetricValue(value: number | undefined) {
  return value === undefined ? '-' : String(value);
}
