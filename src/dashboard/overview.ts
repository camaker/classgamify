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

export type DashboardOverviewQueryBoundaryState =
  | 'activity-loading'
  | 'assignment-loading'
  | 'both-loading'
  | 'both-ready';

export type DashboardOverviewQueryBoundary = {
  activitiesResolved: boolean;
  assignmentsResolved: boolean;
  countsStarterPreviewAsOwnedMetrics: false;
  loadingState: DashboardOverviewQueryBoundaryState;
  ownerActivityCount: number;
  ownerAssignmentCount: number;
  scope: 'teacher-dashboard-query-boundary';
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
  handoffView: DashboardOverviewHandoffView;
  loopStatus: DashboardOverviewLoopStatusView;
  metrics: DashboardOverviewMetric[];
  preview: DashboardOverviewPreview;
  queryBoundary: DashboardOverviewQueryBoundary;
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

export const DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS = [
  'owner-activity-scope',
  'owner-assignment-scope',
  'starter-preview-boundary',
  'activity-loading-state',
  'assignment-loading-state',
  'activity-metric',
  'template-coverage-metric',
  'assignment-metric',
  'result-metric',
  'core-loop-status',
  'create-action',
  'publish-action',
  'share-action',
  'review-action',
  'activity-readiness',
  'assignment-link-readiness',
  'student-runner-readiness',
  'teacher-results-readiness',
  'action-card-activities',
  'action-card-assignments',
  'action-card-student-preview',
  'preview-source',
  'preview-activity',
  'preview-assignment',
  'route-create',
  'route-activities',
  'route-assignments',
  'route-student-preview',
  'loading-independence',
  'privacy-guard',
] as const;

export type DashboardOverviewHandoffItemId =
  (typeof DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS)[number];

export type DashboardOverviewHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: DashboardOverviewHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type DashboardOverviewHandoffPrivacyContract = {
  countsStarterPreviewAsOwnedMetrics: false;
  exposesAssignmentAttemptDetails: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: DashboardOverviewHandoffItemId[];
  keepsActivityLoadingIndependent: true;
  keepsAssignmentLoadingIndependent: true;
  scope: 'teacher-dashboard-overview';
  usesOwnerScopedSummaries: true;
};

export type DashboardOverviewHandoffView = {
  description: string;
  itemViews: DashboardOverviewHandoffItemView[];
  privacy: DashboardOverviewHandoffPrivacyContract;
  title: string;
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
  const queryBoundary = buildDashboardOverviewQueryBoundary({
    activitiesLoading: resolvedActivitiesLoading,
    activitySummary,
    assignmentSummary,
    assignmentsLoading: resolvedAssignmentsLoading,
  });
  const readinessView = buildDashboardCoreLoopReadinessView({
    activitySummary,
    assignmentSummary,
  });
  const actionCards = getDashboardOverviewActionCards();
  const loopStatus = buildDashboardOverviewLoopStatus({
    activitySummary,
    assignmentSummary,
  });
  const metrics = buildDashboardOverviewMetrics({
    activitySummary,
    activitiesLoading: resolvedActivitiesLoading,
    assignmentSummary,
    assignmentsLoading: resolvedAssignmentsLoading,
  });

  return {
    actionCards,
    handoffView: buildDashboardOverviewHandoffView({
      actionCards,
      activitiesLoading: resolvedActivitiesLoading,
      activitySummary,
      assignmentSummary,
      assignmentsLoading: resolvedAssignmentsLoading,
      loopStatus,
      metrics,
      preview,
      queryBoundary,
      readinessView,
    }),
    loopStatus,
    metrics,
    preview,
    queryBoundary,
    readinessView,
    readinessRows: readinessView.rows,
  };
}

export function buildDashboardOverviewHandoffView({
  actionCards,
  activitiesLoading,
  activitySummary,
  assignmentSummary,
  assignmentsLoading,
  loopStatus,
  metrics,
  preview,
  queryBoundary,
  readinessView,
}: {
  actionCards: DashboardOverviewActionCard[];
  activitiesLoading: boolean;
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
  assignmentsLoading: boolean;
  loopStatus: DashboardOverviewLoopStatusView;
  metrics: DashboardOverviewMetric[];
  preview: DashboardOverviewPreview;
  queryBoundary: DashboardOverviewQueryBoundary;
  readinessView: DashboardCoreLoopReadinessView;
}): DashboardOverviewHandoffView {
  const itemViews = DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS.map((id) =>
    buildDashboardOverviewHandoffItemView({
      actionCards,
      activitiesLoading,
      activitySummary,
      assignmentSummary,
      assignmentsLoading,
      id,
      loopStatus,
      metrics,
      preview,
      queryBoundary,
      readinessView,
    })
  );

  return {
    description: m.dashboard_overview_handoff_description(),
    itemViews,
    privacy: buildDashboardOverviewHandoffPrivacyContract(itemViews),
    title: m.dashboard_overview_handoff_title(),
  };
}

type DashboardOverviewHandoffBuildContext = {
  actionCards: DashboardOverviewActionCard[];
  activitiesLoading: boolean;
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
  assignmentsLoading: boolean;
  id: DashboardOverviewHandoffItemId;
  loopStatus: DashboardOverviewLoopStatusView;
  metrics: DashboardOverviewMetric[];
  preview: DashboardOverviewPreview;
  queryBoundary: DashboardOverviewQueryBoundary;
  readinessView: DashboardCoreLoopReadinessView;
};

function buildDashboardOverviewHandoffItemView(
  context: DashboardOverviewHandoffBuildContext
): DashboardOverviewHandoffItemView {
  switch (context.id) {
    case 'owner-activity-scope':
      return buildDashboardOverviewHandoffItem({
        description:
          m.dashboard_overview_handoff_owner_activity_scope_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_owner_activity_scope_label(),
        value: formatDashboardMetricValue(
          context.queryBoundary.ownerActivityCount
        ),
      });
    case 'owner-assignment-scope':
      return buildDashboardOverviewHandoffItem({
        description:
          m.dashboard_overview_handoff_owner_assignment_scope_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_owner_assignment_scope_label(),
        value: formatDashboardMetricValue(
          context.queryBoundary.ownerAssignmentCount
        ),
      });
    case 'starter-preview-boundary':
      return buildDashboardOverviewHandoffItem({
        description:
          m.dashboard_overview_handoff_starter_preview_boundary_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_starter_preview_boundary_label(),
        value: m.dashboard_overview_handoff_preview_only_value(),
      });
    case 'activity-loading-state':
      return buildDashboardOverviewHandoffLoadingItem({
        id: context.id,
        isLoading: context.activitiesLoading,
        label: m.dashboard_overview_handoff_activity_loading_label(),
      });
    case 'assignment-loading-state':
      return buildDashboardOverviewHandoffLoadingItem({
        id: context.id,
        isLoading: context.assignmentsLoading,
        label: m.dashboard_overview_handoff_assignment_loading_label(),
      });
    case 'activity-metric':
      return buildDashboardOverviewHandoffMetricItem({
        id: context.id,
        metric: getDashboardOverviewHandoffMetric(
          context.metrics,
          'activities'
        ),
      });
    case 'template-coverage-metric':
      return buildDashboardOverviewHandoffMetricItem({
        id: context.id,
        metric: getDashboardOverviewHandoffMetric(context.metrics, 'templates'),
      });
    case 'assignment-metric':
      return buildDashboardOverviewHandoffMetricItem({
        id: context.id,
        metric: getDashboardOverviewHandoffMetric(
          context.metrics,
          'assignments'
        ),
      });
    case 'result-metric':
      return buildDashboardOverviewHandoffMetricItem({
        id: context.id,
        metric: getDashboardOverviewHandoffMetric(context.metrics, 'results'),
      });
    case 'core-loop-status':
      return buildDashboardOverviewHandoffItem({
        description: context.loopStatus.description,
        id: context.id,
        label: context.loopStatus.title,
        statusLabel: context.loopStatus.statusLabel,
        value: context.loopStatus.statusLabel,
      });
    case 'create-action':
      return buildDashboardOverviewHandoffNextActionItem({
        action: getDashboardOverviewHandoffNextAction(
          context.loopStatus,
          'create-activity'
        ),
        id: context.id,
      });
    case 'publish-action':
      return buildDashboardOverviewHandoffNextActionItem({
        action: getDashboardOverviewHandoffNextAction(
          context.loopStatus,
          'publish-assignment'
        ),
        id: context.id,
      });
    case 'share-action':
      return buildDashboardOverviewHandoffNextActionItem({
        action: getDashboardOverviewHandoffNextAction(
          context.loopStatus,
          'share-assignment'
        ),
        id: context.id,
      });
    case 'review-action':
      return buildDashboardOverviewHandoffNextActionItem({
        action: getDashboardOverviewHandoffNextAction(
          context.loopStatus,
          'review-results'
        ),
        id: context.id,
      });
    case 'activity-readiness':
      return buildDashboardOverviewHandoffReadinessItem({
        id: context.id,
        row: getDashboardOverviewHandoffReadinessRow(
          context.readinessView,
          'activity-authoring'
        ),
      });
    case 'assignment-link-readiness':
      return buildDashboardOverviewHandoffReadinessItem({
        id: context.id,
        row: getDashboardOverviewHandoffReadinessRow(
          context.readinessView,
          'assignment-links'
        ),
      });
    case 'student-runner-readiness':
      return buildDashboardOverviewHandoffReadinessItem({
        id: context.id,
        row: getDashboardOverviewHandoffReadinessRow(
          context.readinessView,
          'student-runner'
        ),
      });
    case 'teacher-results-readiness':
      return buildDashboardOverviewHandoffReadinessItem({
        id: context.id,
        row: getDashboardOverviewHandoffReadinessRow(
          context.readinessView,
          'teacher-results'
        ),
      });
    case 'action-card-activities':
      return buildDashboardOverviewHandoffActionCardItem({
        card: getDashboardOverviewHandoffActionCard(
          context.actionCards,
          'activities'
        ),
        id: context.id,
      });
    case 'action-card-assignments':
      return buildDashboardOverviewHandoffActionCardItem({
        card: getDashboardOverviewHandoffActionCard(
          context.actionCards,
          'assignments'
        ),
        id: context.id,
      });
    case 'action-card-student-preview':
      return buildDashboardOverviewHandoffActionCardItem({
        card: getDashboardOverviewHandoffActionCard(
          context.actionCards,
          'student-preview'
        ),
        id: context.id,
      });
    case 'preview-source':
      return buildDashboardOverviewHandoffItem({
        description: m.dashboard_overview_handoff_preview_source_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_preview_source_label(),
        value: getDashboardOverviewPreviewSourceValue(context.preview.source),
      });
    case 'preview-activity':
      return buildDashboardOverviewHandoffItem({
        description:
          m.dashboard_overview_handoff_preview_activity_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_preview_activity_label(),
        value: m.dashboard_overview_handoff_preview_activity_value(),
      });
    case 'preview-assignment':
      return buildDashboardOverviewHandoffItem({
        description:
          m.dashboard_overview_handoff_preview_assignment_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_preview_assignment_label(),
        value: m.dashboard_overview_handoff_preview_assignment_value(),
      });
    case 'route-create':
      return buildDashboardOverviewHandoffRouteItem({
        id: context.id,
        label: m.dashboard_overview_handoff_route_create_label(),
        value: Routes.Create,
      });
    case 'route-activities':
      return buildDashboardOverviewHandoffRouteItem({
        id: context.id,
        label: m.dashboard_overview_handoff_route_activities_label(),
        value: Routes.DashboardActivities,
      });
    case 'route-assignments':
      return buildDashboardOverviewHandoffRouteItem({
        id: context.id,
        label: m.dashboard_overview_handoff_route_assignments_label(),
        value: Routes.DashboardAssignments,
      });
    case 'route-student-preview':
      return buildDashboardOverviewHandoffRouteItem({
        id: context.id,
        label: m.dashboard_overview_handoff_route_student_preview_label(),
        value: Routes.StudentPreview,
      });
    case 'loading-independence':
      return buildDashboardOverviewHandoffItem({
        description:
          m.dashboard_overview_handoff_loading_independence_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_loading_independence_label(),
        value: getDashboardOverviewLoadingIndependenceValue(
          context.queryBoundary.loadingState
        ),
      });
    case 'privacy-guard':
      return buildDashboardOverviewHandoffItem({
        description: m.dashboard_overview_handoff_privacy_guard_description(),
        id: context.id,
        label: m.dashboard_overview_handoff_privacy_guard_label(),
        value: m.dashboard_overview_handoff_private_data_hidden_value(),
      });
  }
}

function buildDashboardOverviewHandoffMetricItem({
  id,
  metric,
}: {
  id: DashboardOverviewHandoffItemId;
  metric: DashboardOverviewMetric;
}) {
  return buildDashboardOverviewHandoffItem({
    description: metric.description,
    id,
    label: metric.label,
    value: metric.value,
  });
}

function buildDashboardOverviewHandoffNextActionItem({
  action,
  id,
}: {
  action: DashboardOverviewNextActionView;
  id: DashboardOverviewHandoffItemId;
}) {
  return buildDashboardOverviewHandoffItem({
    description: action.description,
    id,
    label: action.label,
    statusLabel: action.statusLabel,
    value: action.statusLabel,
  });
}

function buildDashboardOverviewHandoffReadinessItem({
  id,
  row,
}: {
  id: DashboardOverviewHandoffItemId;
  row: DashboardCoreLoopReadinessRow;
}) {
  return buildDashboardOverviewHandoffItem({
    description: row.description,
    id,
    label: row.label,
    statusLabel: row.statusLabel,
    value: row.percentLabel,
  });
}

function buildDashboardOverviewHandoffActionCardItem({
  card,
  id,
}: {
  card: DashboardOverviewActionCard;
  id: DashboardOverviewHandoffItemId;
}) {
  return buildDashboardOverviewHandoffItem({
    description: card.description,
    id,
    label: card.title,
    value: card.cta,
  });
}

function buildDashboardOverviewHandoffLoadingItem({
  id,
  isLoading,
  label,
}: {
  id: DashboardOverviewHandoffItemId;
  isLoading: boolean;
  label: string;
}) {
  return buildDashboardOverviewHandoffItem({
    description: isLoading
      ? m.dashboard_overview_handoff_loading_description()
      : m.dashboard_overview_handoff_ready_description(),
    id,
    label,
    statusLabel: isLoading
      ? m.dashboard_overview_handoff_loading_value()
      : m.dashboard_overview_handoff_ready_value(),
    value: isLoading
      ? m.dashboard_overview_handoff_loading_value()
      : m.dashboard_overview_handoff_ready_value(),
  });
}

function buildDashboardOverviewHandoffRouteItem({
  id,
  label,
  value,
}: {
  id: DashboardOverviewHandoffItemId;
  label: string;
  value: string;
}) {
  return buildDashboardOverviewHandoffItem({
    description: m.dashboard_overview_handoff_route_description(),
    id,
    label,
    value,
  });
}

function buildDashboardOverviewHandoffItem({
  description,
  id,
  label,
  statusLabel,
  value,
}: Omit<DashboardOverviewHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.dashboard_overview_handoff_item_aria_label({
      description,
      label,
      status: statusLabel ? ` ${statusLabel}.` : '',
      value,
    }),
    description,
    id,
    label,
    ...(statusLabel ? { statusLabel } : {}),
    value,
  };
}

function buildDashboardOverviewHandoffPrivacyContract(
  itemViews: DashboardOverviewHandoffItemView[]
): DashboardOverviewHandoffPrivacyContract {
  return {
    countsStarterPreviewAsOwnedMetrics: false,
    exposesAssignmentAttemptDetails: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsActivityLoadingIndependent: true,
    keepsAssignmentLoadingIndependent: true,
    scope: 'teacher-dashboard-overview',
    usesOwnerScopedSummaries: true,
  };
}

function getDashboardOverviewHandoffMetric(
  metrics: DashboardOverviewMetric[],
  id: DashboardOverviewMetricId
) {
  const metric = metrics.find((item) => item.id === id);
  if (metric) return metric;

  return buildDashboardOverviewMetricView({
    description: m.dashboard_overview_handoff_missing_metric_description(),
    id,
    label: m.dashboard_overview_handoff_missing_metric_label(),
    value: '-',
  });
}

function getDashboardOverviewHandoffNextAction(
  loopStatus: DashboardOverviewLoopStatusView,
  id: DashboardOverviewNextActionId
) {
  const action = loopStatus.nextActions.find((item) => item.id === id);
  if (action) return action;

  return buildDashboardOverviewNextActionView({ id, status: 'blocked' });
}

function getDashboardOverviewHandoffReadinessRow(
  readinessView: DashboardCoreLoopReadinessView,
  id: DashboardCoreLoopReadinessId
) {
  const row = readinessView.rows.find((item) => item.id === id);
  if (row) return row;

  return buildDashboardCoreLoopReadinessRow({
    description: m.dashboard_overview_handoff_missing_readiness_description(),
    id,
    label: m.dashboard_overview_handoff_missing_readiness_label(),
    value: 0,
  });
}

function getDashboardOverviewHandoffActionCard(
  actionCards: DashboardOverviewActionCard[],
  id: DashboardOverviewActionCardId
) {
  const actionCard = actionCards.find((card) => card.id === id);
  if (actionCard) return actionCard;

  return {
    ariaLabel: m.dashboard_overview_handoff_missing_action_card_label(),
    cta: m.dashboard_overview_handoff_missing_action_card_value(),
    description: m.dashboard_overview_handoff_missing_action_card_description(),
    id,
    title: m.dashboard_overview_handoff_missing_action_card_label(),
    to: Routes.Dashboard,
  } satisfies DashboardOverviewActionCard;
}

function getDashboardOverviewPreviewSourceValue(
  source: DashboardOverviewPreview['source']
) {
  return source === 'starter-preview'
    ? m.dashboard_overview_handoff_preview_source_value()
    : m.dashboard_overview_handoff_unknown_value();
}

function getDashboardOverviewLoadingIndependenceValue(
  loadingState: DashboardOverviewQueryBoundaryState
) {
  if (
    loadingState === 'activity-loading' ||
    loadingState === 'assignment-loading'
  ) {
    return m.dashboard_overview_handoff_split_loading_value();
  }

  return loadingState === 'both-loading'
    ? m.dashboard_overview_handoff_both_loading_value()
    : m.dashboard_overview_handoff_both_ready_value();
}

export function buildDashboardOverviewQueryBoundary({
  activitySummary,
  assignmentSummary,
  activitiesLoading,
  assignmentsLoading,
}: {
  activitySummary?: DashboardOverviewOwnerActivitySummary;
  assignmentSummary?: DashboardOverviewOwnerAssignmentSummary;
  activitiesLoading: boolean;
  assignmentsLoading: boolean;
}): DashboardOverviewQueryBoundary {
  const activitiesResolved = !activitiesLoading;
  const assignmentsResolved = !assignmentsLoading;

  return {
    activitiesResolved,
    assignmentsResolved,
    countsStarterPreviewAsOwnedMetrics: false,
    loadingState: getDashboardOverviewQueryBoundaryState({
      activitiesLoading,
      assignmentsLoading,
    }),
    ownerActivityCount: activitiesResolved
      ? normalizeDashboardSummaryCount(activitySummary?.totalActivities)
      : 0,
    ownerAssignmentCount: assignmentsResolved
      ? normalizeDashboardSummaryCount(assignmentSummary?.totalAssignments)
      : 0,
    scope: 'teacher-dashboard-query-boundary',
  };
}

function getDashboardOverviewQueryBoundaryState({
  activitiesLoading,
  assignmentsLoading,
}: {
  activitiesLoading: boolean;
  assignmentsLoading: boolean;
}): DashboardOverviewQueryBoundaryState {
  if (activitiesLoading && assignmentsLoading) return 'both-loading';
  if (activitiesLoading) return 'activity-loading';
  if (assignmentsLoading) return 'assignment-loading';

  return 'both-ready';
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
