import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

type DashboardActivitySummary = {
  draftActivities: number;
  templateCoverage: number;
  totalActivities: number;
};

type DashboardAssignmentSummary = {
  averageScore: number;
  completions: number;
  openAssignments: number;
};

export type DashboardOverviewMetricId =
  | 'activities'
  | 'templates'
  | 'assignments'
  | 'results';

type DashboardOverviewMetric = {
  description: string;
  id: DashboardOverviewMetricId;
  label: string;
  value: string;
};

export type DashboardOverviewActionCardId =
  | 'activities'
  | 'assignments'
  | 'student-preview';

export type DashboardOverviewActionCard = {
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
  get breadcrumbLabel() {
    return m.dashboard_overview_breadcrumb();
  },
  get description() {
    return m.dashboard_overview_description();
  },
  get heroBadge() {
    return m.dashboard_overview_hero_badge();
  },
  get heroDescription() {
    return m.dashboard_overview_hero_description();
  },
  get heroPrimaryAction() {
    return m.dashboard_overview_hero_primary_action();
  },
  get heroSecondaryAction() {
    return m.dashboard_overview_hero_secondary_action();
  },
  get heroTitle() {
    return m.dashboard_overview_hero_title();
  },
  get loopBadge() {
    return m.dashboard_overview_loop_badge();
  },
  get readinessTitle() {
    return m.dashboard_overview_readiness_title();
  },
  get title() {
    return m.dashboard_overview_title();
  },
} as const;

export function getDashboardOverviewActionCards(): DashboardOverviewActionCard[] {
  return [
    {
      cta: m.dashboard_overview_action_activities_cta(),
      description: m.dashboard_overview_action_activities_description(),
      id: 'activities',
      title: m.dashboard_overview_action_activities_title(),
    },
    {
      cta: m.dashboard_overview_action_assignments_cta(),
      description: m.dashboard_overview_action_assignments_description(),
      id: 'assignments',
      title: m.dashboard_overview_action_assignments_title(),
    },
    {
      cta: m.dashboard_overview_action_student_preview_cta(),
      description: m.dashboard_overview_action_student_preview_description(),
      id: 'student-preview',
      title: m.dashboard_overview_action_student_preview_title(),
    },
  ];
}

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
        ? m.dashboard_overview_metric_activities_description_loading()
        : formatDashboardDraftDescription(
            activitySummary?.draftActivities ?? 0
          ),
      id: 'activities',
      label: m.dashboard_overview_metric_activities_label(),
      value: formatDashboardMetricValue(activitySummary?.totalActivities),
    },
    {
      description: m.dashboard_overview_metric_templates_description(),
      id: 'templates',
      label: m.dashboard_overview_metric_templates_label(),
      value: `${activitySummary?.templateCoverage ?? 0}/${ACTIVITY_TEMPLATE_TYPES.length}`,
    },
    {
      description: m.dashboard_overview_metric_assignments_description(),
      id: 'assignments',
      label: m.dashboard_overview_metric_assignments_label(),
      value: formatDashboardMetricValue(assignmentSummary?.openAssignments),
    },
    {
      description: m.dashboard_overview_metric_results_description({
        count: assignmentSummary?.completions ?? 0,
      }),
      id: 'results',
      label: m.dashboard_overview_metric_results_label(),
      value: `${assignmentSummary?.averageScore ?? 0}%`,
    },
  ];
}

export function buildDashboardCoreLoopReadiness(): DashboardCoreLoopReadinessRow[] {
  return [
    {
      id: 'activity-authoring',
      label: m.dashboard_overview_readiness_activity_authoring(),
      value: 100,
    },
    {
      id: 'assignment-links',
      label: m.dashboard_overview_readiness_assignment_links(),
      value: 100,
    },
    {
      id: 'student-runner',
      label: m.dashboard_overview_readiness_student_runner(),
      value: 85,
    },
    {
      id: 'teacher-results',
      label: m.dashboard_overview_readiness_teacher_results(),
      value: 90,
    },
  ];
}

export function formatDashboardMetricValue(value: number | undefined) {
  return value === undefined ? '-' : String(value);
}

function formatDashboardDraftDescription(count: number) {
  return count === 1
    ? m.dashboard_overview_metric_activities_description_one({ count })
    : m.dashboard_overview_metric_activities_description_many({ count });
}
