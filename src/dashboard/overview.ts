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
import { Routes } from '@/lib/routes';

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
  ariaLabel: string;
  description: string;
  id: DashboardOverviewMetricId;
  label: string;
  value: string;
};

export type DashboardOverviewLoopStatus =
  | 'empty'
  | 'publishing'
  | 'distribution'
  | 'collecting-results'
  | 'reviewing';

export type DashboardOverviewNextActionId =
  | 'create-activity'
  | 'publish-assignment'
  | 'share-assignment'
  | 'review-results';

export type DashboardOverviewNextActionStatus = 'blocked' | 'done' | 'ready';

export type DashboardOverviewNextActionView = {
  ariaLabel: string;
  cta: string;
  description: string;
  id: DashboardOverviewNextActionId;
  label: string;
  status: DashboardOverviewNextActionStatus;
  statusDescription: string;
  statusLabel: string;
  statusAriaLabel: string;
  to: string;
};

export type DashboardOverviewLoopStatusView = {
  ariaLabel: string;
  description: string;
  nextActions: DashboardOverviewNextActionView[];
  status: DashboardOverviewLoopStatus;
  statusLabel: string;
  title: string;
};

type DashboardOverviewPageViewModel = {
  actionCards: DashboardOverviewActionCard[];
  loopStatus: DashboardOverviewLoopStatusView;
  metrics: DashboardOverviewMetric[];
  preview: DashboardOverviewPreview;
  readinessView: DashboardCoreLoopReadinessView;
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
  ariaLabel: string;
  cta: string;
  description: string;
  id: DashboardOverviewActionCardId;
  title: string;
  to: string;
};

export type DashboardCoreLoopReadinessId =
  | 'activity-authoring'
  | 'assignment-links'
  | 'student-runner'
  | 'teacher-results';

export type DashboardCoreLoopReadinessStatus = 'blocked' | 'partial' | 'ready';

export type DashboardCoreLoopReadinessRow = {
  ariaLabel: string;
  description: string;
  id: DashboardCoreLoopReadinessId;
  label: string;
  percentLabel: string;
  status: DashboardCoreLoopReadinessStatus;
  statusLabel: string;
  value: number;
};

export type DashboardCoreLoopReadinessView = {
  ariaLabel: string;
  description: string;
  rows: DashboardCoreLoopReadinessRow[];
  status: DashboardCoreLoopReadinessStatus;
  statusLabel: string;
  title: string;
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
      ariaLabel: buildDashboardOverviewActionCardAriaLabel({
        description: m.dashboard_overview_action_activities_description(),
        title: m.dashboard_overview_action_activities_title(),
      }),
      cta: m.dashboard_overview_action_activities_cta(),
      description: m.dashboard_overview_action_activities_description(),
      id: 'activities',
      title: m.dashboard_overview_action_activities_title(),
      to: Routes.DashboardActivities,
    },
    {
      ariaLabel: buildDashboardOverviewActionCardAriaLabel({
        description: m.dashboard_overview_action_assignments_description(),
        title: m.dashboard_overview_action_assignments_title(),
      }),
      cta: m.dashboard_overview_action_assignments_cta(),
      description: m.dashboard_overview_action_assignments_description(),
      id: 'assignments',
      title: m.dashboard_overview_action_assignments_title(),
      to: Routes.DashboardAssignments,
    },
    {
      ariaLabel: buildDashboardOverviewActionCardAriaLabel({
        description: m.dashboard_overview_action_student_preview_description(),
        title: m.dashboard_overview_action_student_preview_title(),
      }),
      cta: m.dashboard_overview_action_student_preview_cta(),
      description: m.dashboard_overview_action_student_preview_description(),
      id: 'student-preview',
      title: m.dashboard_overview_action_student_preview_title(),
      to: Routes.StudentPreview,
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
  const readinessView = buildDashboardCoreLoopReadinessView({
    activitySummary,
    assignmentSummary,
  });

  return {
    actionCards: getDashboardOverviewActionCards(),
    loopStatus: buildDashboardOverviewLoopStatus({
      activitySummary,
      assignmentSummary,
    }),
    metrics: buildDashboardOverviewMetrics({
      activitySummary,
      activitiesLoading: resolvedActivitiesLoading,
      assignmentSummary,
      assignmentsLoading: resolvedAssignmentsLoading,
    }),
    preview,
    readinessView,
    readinessRows: readinessView.rows,
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
    buildDashboardOverviewMetricView({
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
    }),
    buildDashboardOverviewMetricView({
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
    }),
    buildDashboardOverviewMetricView({
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
    }),
    buildDashboardOverviewMetricView({
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
    }),
  ];
}

function buildDashboardOverviewMetricView({
  description,
  id,
  label,
  value,
}: Omit<DashboardOverviewMetric, 'ariaLabel'>): DashboardOverviewMetric {
  return {
    ariaLabel: m.dashboard_overview_metric_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
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
    buildDashboardCoreLoopReadinessRow({
      description:
        totalActivities > 0
          ? getDashboardActivityAuthoringReadinessDescription(totalActivities)
          : m.dashboard_overview_readiness_activity_authoring_empty(),
      id: 'activity-authoring',
      label: m.dashboard_overview_readiness_activity_authoring(),
      value: totalActivities > 0 ? 100 : 0,
    }),
    buildDashboardCoreLoopReadinessRow({
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
    }),
    buildDashboardCoreLoopReadinessRow({
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
    }),
    buildDashboardCoreLoopReadinessRow({
      description:
        completions > 0
          ? m.dashboard_overview_readiness_teacher_results_ready({
              count: completions,
            })
          : m.dashboard_overview_readiness_teacher_results_empty(),
      id: 'teacher-results',
      label: m.dashboard_overview_readiness_teacher_results(),
      value: completions > 0 ? 100 : 0,
    }),
  ];
}

export function buildDashboardCoreLoopReadinessView({
  activitySummary,
  assignmentSummary,
}: {
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
} = {}): DashboardCoreLoopReadinessView {
  const rows = buildDashboardCoreLoopReadiness({
    activitySummary,
    assignmentSummary,
  });
  const status = resolveDashboardCoreLoopReadinessStatus(rows);
  const statusLabel = getDashboardCoreLoopReadinessStatusLabel(status);
  const title = dashboardOverviewPageCopy.readinessTitle;
  const description = getDashboardCoreLoopReadinessDescription(status);

  return {
    ariaLabel: m.dashboard_overview_readiness_aria_label({
      description,
      status: statusLabel,
      title,
    }),
    description,
    rows,
    status,
    statusLabel,
    title,
  };
}

export function buildDashboardOverviewLoopStatus({
  activitySummary,
  assignmentSummary,
}: {
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
} = {}): DashboardOverviewLoopStatusView {
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
  const status = resolveDashboardOverviewLoopStatus({
    completions,
    openAssignments,
    totalActivities,
    totalAssignments,
  });
  const copy = getDashboardOverviewLoopStatusCopy(status);

  return {
    ...copy,
    ariaLabel: m.dashboard_overview_loop_status_aria_label({
      description: copy.description,
      status: copy.statusLabel,
      title: copy.title,
    }),
    nextActions: buildDashboardOverviewNextActions({
      completions,
      openAssignments,
      totalActivities,
      totalAssignments,
    }),
    status,
  };
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

function buildDashboardCoreLoopReadinessRow({
  description,
  id,
  label,
  value,
}: Omit<
  DashboardCoreLoopReadinessRow,
  'ariaLabel' | 'percentLabel' | 'status' | 'statusLabel'
>): DashboardCoreLoopReadinessRow {
  const normalizedValue = normalizeDashboardReadinessValue(value);
  const percentLabel = m.dashboard_overview_readiness_percent({
    value: String(normalizedValue),
  });
  const status = getDashboardCoreLoopReadinessRowStatus(normalizedValue);
  const statusLabel = getDashboardCoreLoopReadinessStatusLabel(status);

  return {
    ariaLabel: m.dashboard_overview_readiness_row_aria_label({
      description,
      label,
      percent: percentLabel,
      status: statusLabel,
    }),
    description,
    id,
    label,
    percentLabel,
    status,
    statusLabel,
    value: normalizedValue,
  };
}

function normalizeDashboardSummaryCount(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function normalizeDashboardReadinessValue(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getDashboardCoreLoopReadinessRowStatus(
  value: number
): DashboardCoreLoopReadinessStatus {
  if (value >= 100) return 'ready';
  if (value > 0) return 'partial';

  return 'blocked';
}

function resolveDashboardCoreLoopReadinessStatus(
  rows: DashboardCoreLoopReadinessRow[]
): DashboardCoreLoopReadinessStatus {
  if (rows.every((row) => row.status === 'ready')) return 'ready';
  if (rows.some((row) => row.status !== 'blocked')) return 'partial';

  return 'blocked';
}

function getDashboardCoreLoopReadinessDescription(
  status: DashboardCoreLoopReadinessStatus
) {
  switch (status) {
    case 'blocked':
      return m.dashboard_overview_readiness_description_blocked();
    case 'partial':
      return m.dashboard_overview_readiness_description_partial();
    case 'ready':
      return m.dashboard_overview_readiness_description_ready();
  }
}

function getDashboardCoreLoopReadinessStatusLabel(
  status: DashboardCoreLoopReadinessStatus
) {
  switch (status) {
    case 'blocked':
      return m.dashboard_overview_readiness_status_blocked();
    case 'partial':
      return m.dashboard_overview_readiness_status_partial();
    case 'ready':
      return m.dashboard_overview_readiness_status_ready();
  }
}

function resolveDashboardOverviewLoopStatus({
  completions,
  openAssignments,
  totalActivities,
  totalAssignments,
}: {
  completions: number;
  openAssignments: number;
  totalActivities: number;
  totalAssignments: number;
}): DashboardOverviewLoopStatus {
  if (completions > 0) return 'reviewing';
  if (openAssignments > 0) return 'collecting-results';
  if (totalAssignments > 0) return 'distribution';
  if (totalActivities > 0) return 'publishing';

  return 'empty';
}

function buildDashboardOverviewNextActions({
  completions,
  openAssignments,
  totalActivities,
  totalAssignments,
}: {
  completions: number;
  openAssignments: number;
  totalActivities: number;
  totalAssignments: number;
}): DashboardOverviewNextActionView[] {
  const hasActivities = totalActivities > 0;
  const hasAssignments = totalAssignments > 0;
  const hasOpenAssignments = openAssignments > 0;
  const hasCompletions = completions > 0;

  return [
    buildDashboardOverviewNextActionView({
      id: 'create-activity',
      status: hasActivities ? 'done' : 'ready',
    }),
    buildDashboardOverviewNextActionView({
      id: 'publish-assignment',
      status: hasActivities ? (hasAssignments ? 'done' : 'ready') : 'blocked',
    }),
    buildDashboardOverviewNextActionView({
      id: 'share-assignment',
      status: hasAssignments
        ? hasOpenAssignments && hasCompletions
          ? 'done'
          : 'ready'
        : 'blocked',
    }),
    buildDashboardOverviewNextActionView({
      id: 'review-results',
      status: hasCompletions ? 'ready' : 'blocked',
    }),
  ];
}

function buildDashboardOverviewNextActionView({
  id,
  status,
}: {
  id: DashboardOverviewNextActionId;
  status: DashboardOverviewNextActionStatus;
}): DashboardOverviewNextActionView {
  const copy = getDashboardOverviewNextActionCopy(id);
  const statusLabel = getDashboardOverviewNextActionStatusLabel(status);
  const statusDescription =
    getDashboardOverviewNextActionStatusDescription(status);

  return {
    ...copy,
    ariaLabel: m.dashboard_overview_next_action_aria_label({
      label: copy.label,
      status: statusLabel,
    }),
    id,
    status,
    statusDescription,
    statusLabel,
    statusAriaLabel: m.dashboard_overview_next_action_status_aria_label({
      description: statusDescription,
      label: copy.label,
      status: statusLabel,
    }),
    to: dashboardOverviewNextActionRoutes[id],
  };
}

function buildDashboardOverviewActionCardAriaLabel({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return m.dashboard_overview_action_card_aria_label({
    description,
    title,
  });
}

function getDashboardOverviewLoopStatusCopy(
  status: DashboardOverviewLoopStatus
) {
  switch (status) {
    case 'collecting-results':
      return {
        description:
          m.dashboard_overview_loop_status_collecting_results_description(),
        statusLabel:
          m.dashboard_overview_loop_status_collecting_results_label(),
        title: m.dashboard_overview_loop_status_collecting_results_title(),
      };
    case 'distribution':
      return {
        description:
          m.dashboard_overview_loop_status_distribution_description(),
        statusLabel: m.dashboard_overview_loop_status_distribution_label(),
        title: m.dashboard_overview_loop_status_distribution_title(),
      };
    case 'publishing':
      return {
        description: m.dashboard_overview_loop_status_publishing_description(),
        statusLabel: m.dashboard_overview_loop_status_publishing_label(),
        title: m.dashboard_overview_loop_status_publishing_title(),
      };
    case 'reviewing':
      return {
        description: m.dashboard_overview_loop_status_reviewing_description(),
        statusLabel: m.dashboard_overview_loop_status_reviewing_label(),
        title: m.dashboard_overview_loop_status_reviewing_title(),
      };
    case 'empty':
      return {
        description: m.dashboard_overview_loop_status_empty_description(),
        statusLabel: m.dashboard_overview_loop_status_empty_label(),
        title: m.dashboard_overview_loop_status_empty_title(),
      };
  }
}

function getDashboardOverviewNextActionCopy(id: DashboardOverviewNextActionId) {
  switch (id) {
    case 'create-activity':
      return {
        cta: m.dashboard_overview_next_action_create_activity_cta(),
        description:
          m.dashboard_overview_next_action_create_activity_description(),
        label: m.dashboard_overview_next_action_create_activity_label(),
      };
    case 'publish-assignment':
      return {
        cta: m.dashboard_overview_next_action_publish_assignment_cta(),
        description:
          m.dashboard_overview_next_action_publish_assignment_description(),
        label: m.dashboard_overview_next_action_publish_assignment_label(),
      };
    case 'review-results':
      return {
        cta: m.dashboard_overview_next_action_review_results_cta(),
        description:
          m.dashboard_overview_next_action_review_results_description(),
        label: m.dashboard_overview_next_action_review_results_label(),
      };
    case 'share-assignment':
      return {
        cta: m.dashboard_overview_next_action_share_assignment_cta(),
        description:
          m.dashboard_overview_next_action_share_assignment_description(),
        label: m.dashboard_overview_next_action_share_assignment_label(),
      };
  }
}

function getDashboardOverviewNextActionStatusLabel(
  status: DashboardOverviewNextActionStatus
) {
  switch (status) {
    case 'blocked':
      return m.dashboard_overview_next_action_status_blocked();
    case 'done':
      return m.dashboard_overview_next_action_status_done();
    case 'ready':
      return m.dashboard_overview_next_action_status_ready();
  }
}

function getDashboardOverviewNextActionStatusDescription(
  status: DashboardOverviewNextActionStatus
) {
  switch (status) {
    case 'blocked':
      return m.dashboard_overview_next_action_status_blocked_description();
    case 'done':
      return m.dashboard_overview_next_action_status_done_description();
    case 'ready':
      return m.dashboard_overview_next_action_status_ready_description();
  }
}

function getDashboardActivityAuthoringReadinessDescription(count: number) {
  if (count === 1) {
    return m.dashboard_overview_readiness_activity_authoring_ready_one({
      count,
    });
  }

  return m.dashboard_overview_readiness_activity_authoring_ready_many({
    count,
  });
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

const dashboardOverviewNextActionRoutes: Record<
  DashboardOverviewNextActionId,
  string
> = {
  'create-activity': Routes.Create,
  'publish-assignment': Routes.DashboardActivities,
  'review-results': Routes.DashboardAssignments,
  'share-assignment': Routes.DashboardAssignments,
};
