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

export type DashboardOverviewActionCardId =
  | 'activities'
  | 'assignments'
  | 'student-preview';

type DashboardOverviewActionCard = {
  cta: string;
  description: string;
  id: DashboardOverviewActionCardId;
  title: string;
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

export const dashboardOverviewPageCopy = {
  breadcrumbLabel: 'Dashboard',
  description:
    'Manage reusable activities, publish classroom assignments, and track student attempts from one workspace.',
  heroBadge: 'Teacher workspace',
  heroDescription:
    'ClassGamify separates reusable teacher activities from published assignments and student attempts. Create, publish, play, and review now share one activity data contract that AI drafting and template remixing can build on.',
  heroPrimaryAction: 'Create activity',
  heroSecondaryAction: 'Open activity library',
  heroTitle: 'Activity content is now the center of the product.',
  loopBadge: 'Wordwall-core loop',
  readinessTitle: 'Core loop readiness',
  title: 'Teacher dashboard',
} as const;

export const dashboardOverviewActionCards = [
  {
    cta: 'Open activities',
    description:
      'Review your activity library and the structured content each template consumes.',
    id: 'activities',
    title: 'Activities',
  },
  {
    cta: 'Open assignments',
    description:
      'Track published share links, assignment settings, completions, and average scores.',
    id: 'assignments',
    title: 'Assignments',
  },
  {
    cta: 'Preview play route',
    description:
      'Open a playable student assignment route with progress, timing, scoring, and review behavior.',
    id: 'student-preview',
    title: 'Student preview',
  },
] satisfies DashboardOverviewActionCard[];

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
