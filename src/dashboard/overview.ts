import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivitySeed,
  type AssignmentSeed,
} from '@/activities/types';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
} from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export type DashboardOverviewOwnerActivitySummary = {
  draftActivities: number;
  templateCoverage: number;
  totalActivities: number;
};

export type DashboardOverviewOwnerAssignmentSummary = {
  averageScore: number;
  completions: number;
  openAssignments: number;
  totalAssignments: number;
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

type DashboardOverviewPageViewModel = {
  actionCards: DashboardOverviewActionCard[];
  metrics: DashboardOverviewMetric[];
  preview: DashboardOverviewPreview;
  readinessRows: DashboardCoreLoopReadinessRow[];
};

type DashboardOverviewOwnerActivityData = {
  summary?: DashboardOverviewOwnerActivitySummary;
};

type DashboardOverviewOwnerAssignmentData = {
  summary?: DashboardOverviewOwnerAssignmentSummary;
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
  description: string;
  id: DashboardCoreLoopReadinessId;
  label: string;
  value: number;
};

export type DashboardOverviewPreview = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  source: 'starter-preview';
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

export function buildDashboardOverviewPageViewModel({
  activitySummary,
  assignmentSummary,
  activitiesLoading,
  assignmentsLoading,
  isLoading,
  preview = buildDashboardOverviewStarterPreview(),
}: {
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
  activitiesLoading?: boolean;
  assignmentsLoading?: boolean;
  isLoading?: boolean;
  preview?: DashboardOverviewPreview;
}): DashboardOverviewPageViewModel {
  const resolvedActivitiesLoading = activitiesLoading ?? isLoading ?? false;
  const resolvedAssignmentsLoading = assignmentsLoading ?? isLoading ?? false;

  return {
    actionCards: getDashboardOverviewActionCards(),
    metrics: buildDashboardOverviewMetrics({
      activitySummary,
      activitiesLoading: resolvedActivitiesLoading,
      assignmentSummary,
      assignmentsLoading: resolvedAssignmentsLoading,
    }),
    preview,
    readinessRows: buildDashboardCoreLoopReadiness({
      activitySummary,
      assignmentSummary,
    }),
  };
}

export function buildDashboardOverviewRouteViewModel({
  activitiesData,
  activitiesLoading,
  assignmentsData,
  assignmentsLoading,
  preview,
}: {
  activitiesData?: DashboardOverviewOwnerActivityData | null;
  activitiesLoading: boolean;
  assignmentsData?: DashboardOverviewOwnerAssignmentData | null;
  assignmentsLoading: boolean;
  preview?: DashboardOverviewPreview;
}): DashboardOverviewPageViewModel {
  return buildDashboardOverviewPageViewModel({
    activitySummary: activitiesData?.summary,
    activitiesLoading,
    assignmentSummary: assignmentsData?.summary,
    assignmentsLoading,
    preview,
  });
}

export function buildDashboardOverviewStarterPreview(): DashboardOverviewPreview {
  const assignment = getStarterAssignment();

  return {
    activity: getStarterActivity(assignment.activityId),
    assignment,
    source: 'starter-preview',
  };
}

export function buildDashboardOverviewMetrics({
  activitySummary,
  activitiesLoading,
  assignmentSummary,
  assignmentsLoading,
  isLoading,
}: {
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  activitiesLoading?: boolean;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
  assignmentsLoading?: boolean;
  isLoading?: boolean;
}): DashboardOverviewMetric[] {
  const resolvedActivitiesLoading = activitiesLoading ?? isLoading ?? false;
  const resolvedAssignmentsLoading = assignmentsLoading ?? isLoading ?? false;
  const totalActivities = normalizeDashboardSummaryCount(
    activitySummary?.totalActivities
  );
  const draftActivities = normalizeDashboardSummaryCount(
    activitySummary?.draftActivities
  );
  const templateCoverage = normalizeDashboardSummaryCount(
    activitySummary?.templateCoverage
  );
  const openAssignments = normalizeDashboardSummaryCount(
    assignmentSummary?.openAssignments
  );
  const totalAssignments = normalizeDashboardSummaryCount(
    assignmentSummary?.totalAssignments
  );
  const completions = normalizeDashboardSummaryCount(
    assignmentSummary?.completions
  );

  return [
    {
      description: resolvedActivitiesLoading
        ? m.dashboard_overview_metric_activities_description_loading()
        : formatDashboardActivityDescription({
            drafts: draftActivities,
            total: totalActivities,
          }),
      id: 'activities',
      label: m.dashboard_overview_metric_activities_label(),
      value: resolvedActivitiesLoading
        ? '-'
        : formatDashboardMetricValue(totalActivities),
    },
    {
      description: resolvedActivitiesLoading
        ? m.dashboard_overview_metric_templates_description_loading()
        : m.dashboard_overview_metric_templates_description({
            ready: templateCoverage,
            total: ACTIVITY_TEMPLATE_TYPES.length,
          }),
      id: 'templates',
      label: m.dashboard_overview_metric_templates_label(),
      value: resolvedActivitiesLoading
        ? '-'
        : formatDashboardTemplateCoverageValue(templateCoverage),
    },
    {
      description: resolvedAssignmentsLoading
        ? m.dashboard_overview_metric_assignments_description_loading()
        : formatDashboardAssignmentDescription({
            open: openAssignments,
            total: totalAssignments,
          }),
      id: 'assignments',
      label: m.dashboard_overview_metric_assignments_label(),
      value: resolvedAssignmentsLoading
        ? '-'
        : formatDashboardMetricValue(openAssignments),
    },
    {
      description: resolvedAssignmentsLoading
        ? m.dashboard_overview_metric_results_description_loading()
        : m.dashboard_overview_metric_results_description({
            count: completions,
          }),
      id: 'results',
      label: m.dashboard_overview_metric_results_label(),
      value: resolvedAssignmentsLoading
        ? '-'
        : formatAssignmentResultPercent(assignmentSummary?.averageScore ?? 0),
    },
  ];
}

export function buildDashboardCoreLoopReadiness({
  activitySummary,
  assignmentSummary,
}: {
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
} = {}): DashboardCoreLoopReadinessRow[] {
  const totalActivities = normalizeDashboardSummaryCount(
    activitySummary?.totalActivities
  );
  const totalAssignments = normalizeDashboardSummaryCount(
    assignmentSummary?.totalAssignments
  );
  const openAssignments = normalizeDashboardSummaryCount(
    assignmentSummary?.openAssignments
  );
  const completions = normalizeDashboardSummaryCount(
    assignmentSummary?.completions
  );

  return [
    {
      description:
        totalActivities > 0
          ? m.dashboard_overview_readiness_activity_authoring_ready({
              count: totalActivities,
            })
          : m.dashboard_overview_readiness_activity_authoring_empty(),
      id: 'activity-authoring',
      label: m.dashboard_overview_readiness_activity_authoring(),
      value: totalActivities > 0 ? 100 : 0,
    },
    {
      description: getDashboardAssignmentLinkReadinessDescription({
        openAssignments,
        totalAssignments,
      }),
      id: 'assignment-links',
      label: m.dashboard_overview_readiness_assignment_links(),
      value: getDashboardAssignmentLinkReadiness({
        openAssignments,
        totalAssignments,
      }),
    },
    {
      description: getDashboardStudentRunnerReadinessDescription({
        completions,
        openAssignments,
        totalAssignments,
      }),
      id: 'student-runner',
      label: m.dashboard_overview_readiness_student_runner(),
      value: getDashboardStudentRunnerReadiness({
        completions,
        openAssignments,
        totalAssignments,
      }),
    },
    {
      description:
        completions > 0
          ? m.dashboard_overview_readiness_teacher_results_ready({
              count: completions,
            })
          : m.dashboard_overview_readiness_teacher_results_empty(),
      id: 'teacher-results',
      label: m.dashboard_overview_readiness_teacher_results(),
      value: completions > 0 ? 100 : 0,
    },
  ];
}

export function formatDashboardMetricValue(value: number | undefined) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

export function formatDashboardTemplateCoverageValue(
  value: number | undefined
) {
  return `${normalizeDashboardSummaryCount(value)}/${ACTIVITY_TEMPLATE_TYPES.length}`;
}

function formatDashboardActivityDescription({
  drafts,
  total,
}: {
  drafts: number;
  total: number;
}) {
  if (total === 1) {
    return m.dashboard_overview_metric_activities_description_one({
      drafts,
      total,
    });
  }

  return m.dashboard_overview_metric_activities_description_many({
    drafts,
    total,
  });
}

function formatDashboardAssignmentDescription({
  open,
  total,
}: {
  open: number;
  total: number;
}) {
  if (open === 1 && total === 1) {
    return m.dashboard_overview_metric_assignments_description_one_one({
      open,
      total,
    });
  }
  if (open === 1) {
    return m.dashboard_overview_metric_assignments_description_one_many({
      open,
      total,
    });
  }
  if (total === 1) {
    return m.dashboard_overview_metric_assignments_description_many_one({
      open,
      total,
    });
  }

  return m.dashboard_overview_metric_assignments_description_many_many({
    open,
    total,
  });
}

function normalizeDashboardSummaryCount(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function getDashboardAssignmentLinkReadiness({
  openAssignments,
  totalAssignments,
}: {
  openAssignments: number;
  totalAssignments: number;
}) {
  if (openAssignments > 0) return 100;
  if (totalAssignments > 0) return 60;

  return 0;
}

function getDashboardAssignmentLinkReadinessDescription({
  openAssignments,
  totalAssignments,
}: {
  openAssignments: number;
  totalAssignments: number;
}) {
  if (openAssignments > 0) {
    return openAssignments === 1
      ? m.dashboard_overview_readiness_assignment_links_ready_one({
          count: openAssignments,
        })
      : m.dashboard_overview_readiness_assignment_links_ready_many({
          count: openAssignments,
        });
  }
  if (totalAssignments > 0) {
    return totalAssignments === 1
      ? m.dashboard_overview_readiness_assignment_links_closed_one({
          count: totalAssignments,
        })
      : m.dashboard_overview_readiness_assignment_links_closed_many({
          count: totalAssignments,
        });
  }

  return m.dashboard_overview_readiness_assignment_links_empty();
}

function getDashboardStudentRunnerReadiness({
  completions,
  openAssignments,
  totalAssignments,
}: {
  completions: number;
  openAssignments: number;
  totalAssignments: number;
}) {
  if (completions > 0) return 100;
  if (openAssignments > 0) return 75;
  if (totalAssignments > 0) return 40;

  return 0;
}

function getDashboardStudentRunnerReadinessDescription({
  completions,
  openAssignments,
  totalAssignments,
}: {
  completions: number;
  openAssignments: number;
  totalAssignments: number;
}) {
  if (completions > 0) {
    return completions === 1
      ? m.dashboard_overview_readiness_student_runner_completed_one({
          count: completions,
        })
      : m.dashboard_overview_readiness_student_runner_completed_many({
          count: completions,
        });
  }
  if (openAssignments > 0) {
    return openAssignments === 1
      ? m.dashboard_overview_readiness_student_runner_open_one({
          count: openAssignments,
        })
      : m.dashboard_overview_readiness_student_runner_open_many({
          count: openAssignments,
        });
  }
  if (totalAssignments > 0) {
    return totalAssignments === 1
      ? m.dashboard_overview_readiness_student_runner_closed_one({
          count: totalAssignments,
        })
      : m.dashboard_overview_readiness_student_runner_closed_many({
          count: totalAssignments,
        });
  }

  return m.dashboard_overview_readiness_student_runner_empty();
}
