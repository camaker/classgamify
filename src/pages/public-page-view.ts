import {
  formatActivityTemplateClassroomMode,
  getStarterActivity,
  getStarterAssignment,
  getActivityTemplates,
} from '@/activities/catalog';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import type {
  ActivitySeed,
  ActivityTemplateType,
  AssignmentSeed,
} from '@/activities/types';

type PublicPageRouteAction = {
  ariaLabel: string;
  label: string;
  to:
    | typeof Routes.ContactClassroom
    | typeof Routes.Create
    | typeof Routes.Worksheets
    | typeof Routes.StudentPreview
    | typeof Routes.Templates;
};

export type HomePageViewModel = {
  features: HomePageFeature[];
  featureSection: HomePageFeatureSectionView;
  hero: HomePageHeroView;
  preview: HomePagePreviewView;
  signalPanel: HomePageSignalPanelView;
  signals: HomePageSignal[];
};

export type HomePageFeatureId =
  | 'activity-templates'
  | 'assignment-links'
  | 'results'
  | 'teacher-workflows';

type HomePageFeature = {
  ariaLabel: string;
  description: string;
  id: HomePageFeatureId;
  title: string;
};

type HomePageFeatureSectionView = {
  ariaLabel: string;
  description: string;
  eyebrowLabel: string;
  title: string;
};

type HomePageHeroView = {
  badgeLabel: string;
  browseTemplatesAction: PublicPageRouteAction;
  description: string;
  primaryAction: PublicPageRouteAction;
  worksheetAction: PublicPageRouteAction;
  title: string;
};

export type HomePagePreviewView = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  source: 'starter-preview';
};

export type HomePageSignalId = 'delivery' | 'results' | 'templates';

type HomePageSignal = {
  ariaLabel: string;
  description: string;
  id: HomePageSignalId;
  label: string;
  value: string;
};

type HomePageSignalPanelView = {
  ariaLabel: string;
  description: string;
  title: string;
};

export type RoadmapPageViewModel = {
  columns: RoadmapColumnView[];
  handoffView: RoadmapPublicHandoffView;
  hero: RoadmapHeroView;
  principles: RoadmapPrincipleView[];
  snapshots: RoadmapSnapshotView[];
  validation: RoadmapValidationView;
};

export type RoadmapColumnId = 'backlog' | 'done' | 'in-progress';

export type RoadmapColumnView = {
  description: string;
  id: RoadmapColumnId;
  items: RoadmapTaskView[];
  status: string;
  title: string;
};

type RoadmapHeroView = {
  badgeLabel: string;
  description: string;
  primaryAction: PublicPageRouteAction;
  secondaryAction: PublicPageRouteAction;
  title: string;
};

export type RoadmapPrincipleId = 'focus' | 'learning' | 'validation';

export type RoadmapPrincipleView = {
  description: string;
  id: RoadmapPrincipleId;
  title: string;
};

type RoadmapSnapshotId = 'expansion' | 'live' | 'loop';

type RoadmapSnapshotView = {
  description: string;
  id: RoadmapSnapshotId;
  title: string;
};

export type RoadmapTaskId =
  | 'ai-assisted-activity-drafting'
  | 'activity-assignment-loop'
  | 'playable-template-foundation'
  | 'results-reteach-summaries'
  | 'school-team-workflows'
  | 'worksheet-extraction'
  | 'worksheet-style-delivery';

export type RoadmapTaskStatus = 'available' | 'improving' | 'planned';

type RoadmapTaskView = {
  description: string;
  evidence: string;
  evidenceLabel: string;
  id: RoadmapTaskId;
  nextStep: string;
  nextStepLabel: string;
  status: RoadmapTaskStatus;
  statusAriaLabel: string;
  statusLabel: string;
  title: string;
};

type RoadmapValidationView = {
  action: PublicPageRouteAction;
  description: string;
  eyebrowLabel: string;
  title: string;
};

export const ROADMAP_PUBLIC_HANDOFF_ITEM_IDS = [
  'current-loop',
  'available-count',
  'improving-count',
  'planned-count',
  'activity-assignment-loop',
  'template-foundation',
  'ai-draft-capability',
  'results-reteach-focus',
  'worksheet-delivery-focus',
  'worksheet-extraction-boundary',
  'school-workflow-boundary',
  'create-route',
  'templates-route',
  'feedback-route',
  'snapshot-live-core',
  'snapshot-template-depth',
  'snapshot-ai-expansion',
  'public-copy-boundary',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type RoadmapPublicHandoffItemId =
  (typeof ROADMAP_PUBLIC_HANDOFF_ITEM_IDS)[number];

export type RoadmapPublicHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: RoadmapPublicHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type RoadmapPublicHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  describesCurrentUsableLoop: true;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: RoadmapPublicHandoffItemId[];
  keepsLegacyCopyOut: true;
  readsSourceMaterialFileBytes: false;
  routeActionsUseSharedConstants: true;
  scope: 'public-roadmap-product-boundary';
};

export type RoadmapPublicHandoffView = {
  description: string;
  itemViews: RoadmapPublicHandoffItemView[];
  privacy: RoadmapPublicHandoffPrivacyContract;
  title: string;
};

export type TeachersPageViewModel = {
  hero: TeachersHeroView;
  schoolCta: TeachersSchoolCtaView;
  templatePanel: TeachersTemplatePanelView;
  useCaseSection: TeachersPageSectionView;
  useCases: TeachersPageItemView<TeachersPageUseCaseId>[];
  workflowSection: TeachersPageSectionView;
  workflow: TeachersPageItemView<TeachersPageWorkflowId>[];
};

export type ContactIntent = 'classroom' | 'general';

export type ContactPageViewModel = {
  checklist: ContactChecklistView;
  directSubject: string;
  hero: ContactHeroView;
  inquiryPanel?: ContactInquiryPanelView;
  intent: ContactIntent;
  supportCta: ContactSupportActionView;
  supportEmail: {
    actionAriaLabel: string;
    ariaLabel: string;
    description: string;
    title: string;
  };
  topicSection: ContactSectionView;
  topics: ContactTopicView[];
};

export type ContactTopicId = 'classroom' | 'partnership' | 'product';

export type ContactChecklistItemId =
  | 'classroom-learners'
  | 'classroom-routine'
  | 'classroom-worksheets'
  | 'device'
  | 'goal'
  | 'page';

type ContactChecklistItemView = {
  ariaLabel: string;
  id: ContactChecklistItemId;
  text: string;
};

type ContactChecklistView = {
  ariaLabel: string;
  description: string;
  items: ContactChecklistItemView[];
  title: string;
};

type ContactHeroView = {
  ariaLabel: string;
  description: string;
  title: string;
};

export type ContactInquiryPanelView = {
  ariaLabel: string;
  description: string;
  highlights: ContactInquiryPanelHighlightView[];
  title: string;
};

type ContactInquiryPanelHighlightView = {
  ariaLabel: string;
  description: string;
  id: 'materials' | 'rollout' | 'students';
  title: string;
};

type ContactSectionView = {
  ariaLabel: string;
};

type ContactSupportActionView = {
  ariaLabel: string;
  label: string;
};

type ContactTopicView = {
  actionAriaLabel: string;
  ariaLabel: string;
  description: string;
  id: ContactTopicId;
  subject: string;
  title: string;
};

export type PricingPageViewModel = {
  faq: {
    ariaLabel: string;
    description: string;
    items: PricingFaqItemView[];
    title: string;
  };
  hero: {
    eyebrow: string;
    subtitle: string;
    title: string;
  };
  schoolCta: {
    action: PublicPageRouteAction;
    ariaLabel: string;
    description: string;
    eyebrow: string;
    title: string;
  };
  valueSection: PricingPageSectionView;
  valueCards: PricingValueCardView[];
};

export type PricingValueCardId = 'ai' | 'assignments' | 'templates';

export type PricingFaqItemId =
  | 'free'
  | 'pro'
  | 'schools'
  | 'student-accounts'
  | 'templates';

export type PricingFaqItemView = {
  answer: string;
  ariaLabel: string;
  id: PricingFaqItemId;
  question: string;
};

type PricingPageSectionView = {
  ariaLabel: string;
  description: string;
  title: string;
};

type PricingValueCardView = {
  ariaLabel: string;
  description: string;
  id: PricingValueCardId;
  title: string;
};

export type TeachersPageWorkflowId = 'draft' | 'publish' | 'share';

export type TeachersPageUseCaseId = 'classrooms' | 'games' | 'results';

type TeachersPageItemView<Id extends string> = {
  ariaLabel: string;
  description: string;
  id: Id;
  title: string;
};

type TeachersPageSectionView = {
  ariaLabel: string;
  description: string;
  title: string;
};

type TeachersHeroView = {
  badgeLabel: string;
  description: string;
  primaryAction: PublicPageRouteAction;
  secondaryAction: PublicPageRouteAction;
  title: string;
};

type TeachersSchoolCtaView = {
  action: PublicPageRouteAction;
  ariaLabel: string;
  description: string;
  title: string;
};

type TeachersTemplatePanelView = {
  ariaLabel: string;
  classroomModeLabel: string;
  description: string;
  title: string;
  templates: TeachersTemplatePanelItemView[];
};

type TeachersTemplatePanelItemView = {
  ariaLabel: string;
  classroomMode: string;
  name: string;
  templateType: ActivityTemplateType;
};

export function buildHomePageViewModel({
  preview = buildHomePageStarterPreview(),
}: {
  preview?: HomePagePreviewView;
} = {}): HomePageViewModel {
  const featureSectionTitle = m.home_features_title();
  const featureSectionDescription = m.home_features_description();
  const signalPanelTitle = m.home_signal_panel_title();
  const signalPanelDescription = m.home_signal_panel_description();

  return {
    features: [
      buildHomePageFeatureView({
        description: m.home_features_items_item_1_description(),
        id: 'teacher-workflows',
        title: m.home_features_items_item_1_title(),
      }),
      buildHomePageFeatureView({
        description: m.home_features_items_item_2_description(),
        id: 'activity-templates',
        title: m.home_features_items_item_2_title(),
      }),
      buildHomePageFeatureView({
        description: m.home_features_items_item_3_description(),
        id: 'assignment-links',
        title: m.home_features_items_item_3_title(),
      }),
      buildHomePageFeatureView({
        description: m.home_features_items_item_4_description(),
        id: 'results',
        title: m.home_features_items_item_4_title(),
      }),
    ],
    featureSection: {
      ariaLabel: m.home_feature_section_aria_label({
        description: featureSectionDescription,
        title: featureSectionTitle,
      }),
      description: featureSectionDescription,
      eyebrowLabel: m.home_features_subtitle(),
      title: featureSectionTitle,
    },
    hero: {
      badgeLabel: m.home_hero_introduction(),
      browseTemplatesAction: {
        ariaLabel: m.home_hero_browse_templates_aria_label(),
        label: m.home_hero_browse_templates(),
        to: Routes.Templates,
      },
      description: m.home_hero_description(),
      primaryAction: {
        ariaLabel: m.home_hero_primary_aria_label(),
        label: m.home_hero_primary(),
        to: Routes.Create,
      },
      worksheetAction: {
        ariaLabel: m.home_hero_secondary_aria_label(),
        label: m.home_hero_secondary(),
        to: Routes.Worksheets,
      },
      title: m.home_hero_title(),
    },
    preview,
    signalPanel: {
      ariaLabel: m.home_signal_panel_aria_label({
        description: signalPanelDescription,
        title: signalPanelTitle,
      }),
      description: signalPanelDescription,
      title: signalPanelTitle,
    },
    signals: [
      buildHomePageSignalView({
        description: m.home_signal_templates_description(),
        id: 'templates',
        label: m.home_signal_templates_label(),
        value: m.home_signal_templates_value(),
      }),
      buildHomePageSignalView({
        description: m.home_signal_delivery_description(),
        id: 'delivery',
        label: m.home_signal_delivery_label(),
        value: m.home_signal_delivery_value(),
      }),
      buildHomePageSignalView({
        description: m.home_signal_results_description(),
        id: 'results',
        label: m.home_signal_results_label(),
        value: m.home_signal_results_value(),
      }),
    ],
  };
}

function buildHomePageFeatureView({
  description,
  id,
  title,
}: {
  description: string;
  id: HomePageFeatureId;
  title: string;
}): HomePageFeature {
  return {
    ariaLabel: m.home_feature_aria_label({ description, title }),
    description,
    id,
    title,
  };
}

function buildHomePageSignalView({
  description,
  id,
  label,
  value,
}: {
  description: string;
  id: HomePageSignalId;
  label: string;
  value: string;
}): HomePageSignal {
  return {
    ariaLabel: m.home_signal_aria_label({ description, label, value }),
    description,
    id,
    label,
    value,
  };
}

export function buildHomePageStarterPreview(): HomePagePreviewView {
  const assignment = getStarterAssignment();

  return {
    activity: getStarterActivity(assignment.activityId),
    assignment,
    source: 'starter-preview',
  };
}

export function buildRoadmapPageViewModel(): RoadmapPageViewModel {
  const columns: RoadmapColumnView[] = [
    {
      description: m.roadmap_columns_done_description(),
      id: 'done',
      items: [
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_done_0_description(),
          evidence: m.roadmap_board_tasks_done_0_evidence(),
          id: 'activity-assignment-loop',
          nextStep: m.roadmap_board_tasks_done_0_next_step(),
          status: 'available',
          title: m.roadmap_board_tasks_done_0_title(),
        }),
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_done_1_description(),
          evidence: m.roadmap_board_tasks_done_1_evidence(),
          id: 'playable-template-foundation',
          nextStep: m.roadmap_board_tasks_done_1_next_step(),
          status: 'available',
          title: m.roadmap_board_tasks_done_1_title(),
        }),
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_done_2_description(),
          evidence: m.roadmap_board_tasks_done_2_evidence(),
          id: 'ai-assisted-activity-drafting',
          nextStep: m.roadmap_board_tasks_done_2_next_step(),
          status: 'available',
          title: m.roadmap_board_tasks_done_2_title(),
        }),
      ],
      status: m.roadmap_status_available(),
      title: m.roadmap_columns_done(),
    },
    {
      description: m.roadmap_columns_in_progress_description(),
      id: 'in-progress',
      items: [
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_in_progress_0_description(),
          evidence: m.roadmap_board_tasks_in_progress_0_evidence(),
          id: 'results-reteach-summaries',
          nextStep: m.roadmap_board_tasks_in_progress_0_next_step(),
          status: 'improving',
          title: m.roadmap_board_tasks_in_progress_0_title(),
        }),
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_in_progress_1_description(),
          evidence: m.roadmap_board_tasks_in_progress_1_evidence(),
          id: 'worksheet-style-delivery',
          nextStep: m.roadmap_board_tasks_in_progress_1_next_step(),
          status: 'improving',
          title: m.roadmap_board_tasks_in_progress_1_title(),
        }),
      ],
      status: m.roadmap_status_improving(),
      title: m.roadmap_columns_in_progress(),
    },
    {
      description: m.roadmap_columns_backlog_description(),
      id: 'backlog',
      items: [
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_backlog_1_description(),
          evidence: m.roadmap_board_tasks_backlog_1_evidence(),
          id: 'worksheet-extraction',
          nextStep: m.roadmap_board_tasks_backlog_1_next_step(),
          status: 'planned',
          title: m.roadmap_board_tasks_backlog_1_title(),
        }),
        buildRoadmapTaskView({
          description: m.roadmap_board_tasks_backlog_2_description(),
          evidence: m.roadmap_board_tasks_backlog_2_evidence(),
          id: 'school-team-workflows',
          nextStep: m.roadmap_board_tasks_backlog_2_next_step(),
          status: 'planned',
          title: m.roadmap_board_tasks_backlog_2_title(),
        }),
      ],
      status: m.roadmap_status_exploring(),
      title: m.roadmap_columns_backlog(),
    },
  ];
  const hero: RoadmapHeroView = {
    badgeLabel: m.roadmap_eyebrow(),
    description: m.roadmap_subtitle(),
    primaryAction: {
      ariaLabel: m.roadmap_primary_cta_aria_label(),
      label: m.roadmap_primary_cta(),
      to: Routes.Create,
    },
    secondaryAction: {
      ariaLabel: m.roadmap_secondary_cta_aria_label(),
      label: m.roadmap_secondary_cta(),
      to: Routes.Templates,
    },
    title: m.roadmap_title(),
  };
  const snapshots: RoadmapSnapshotView[] = [
    {
      description: m.roadmap_snapshot_live_description(),
      id: 'live',
      title: m.roadmap_snapshot_live_title(),
    },
    {
      description: m.roadmap_snapshot_loop_description(),
      id: 'loop',
      title: m.roadmap_snapshot_loop_title(),
    },
    {
      description: m.roadmap_snapshot_expansion_description(),
      id: 'expansion',
      title: m.roadmap_snapshot_expansion_title(),
    },
  ];
  const validation: RoadmapValidationView = {
    action: {
      ariaLabel: m.roadmap_feedback_cta_aria_label(),
      label: m.roadmap_feedback_cta(),
      to: Routes.ContactClassroom,
    },
    description: m.roadmap_validation_description(),
    eyebrowLabel: m.roadmap_validation_eyebrow(),
    title: m.roadmap_validation_title(),
  };

  return {
    columns,
    handoffView: buildRoadmapPublicHandoffView({
      columns,
      hero,
      snapshots,
      validation,
    }),
    hero,
    principles: [
      {
        description: m.roadmap_principle_focus_description(),
        id: 'focus',
        title: m.roadmap_principle_focus_title(),
      },
      {
        description: m.roadmap_principle_learning_description(),
        id: 'learning',
        title: m.roadmap_principle_learning_title(),
      },
      {
        description: m.roadmap_validation_item_workflow_description(),
        id: 'validation',
        title: m.roadmap_validation_item_workflow_title(),
      },
    ],
    snapshots,
    validation,
  };
}

export function buildRoadmapPublicHandoffView({
  columns,
  hero,
  snapshots,
  validation,
}: Pick<
  RoadmapPageViewModel,
  'columns' | 'hero' | 'snapshots' | 'validation'
>): RoadmapPublicHandoffView {
  const itemViews = ROADMAP_PUBLIC_HANDOFF_ITEM_IDS.map((id) =>
    buildRoadmapPublicHandoffItemView({
      columns,
      hero,
      id,
      snapshots,
      validation,
    })
  );

  return {
    description: m.roadmap_handoff_description(),
    itemViews,
    privacy: buildRoadmapPublicHandoffPrivacyContract(itemViews),
    title: m.roadmap_handoff_title(),
  };
}

type RoadmapPublicHandoffBuildContext = Pick<
  RoadmapPageViewModel,
  'columns' | 'hero' | 'snapshots' | 'validation'
> & {
  id: RoadmapPublicHandoffItemId;
};

function buildRoadmapPublicHandoffItemView(
  context: RoadmapPublicHandoffBuildContext
): RoadmapPublicHandoffItemView {
  switch (context.id) {
    case 'current-loop':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_current_loop_description(),
        id: context.id,
        label: m.roadmap_handoff_current_loop_label(),
        value: m.roadmap_handoff_current_loop_value(),
      });
    case 'available-count':
      return buildRoadmapPublicHandoffCountItem({
        column: getRoadmapPublicHandoffColumn(context.columns, 'done'),
        id: context.id,
        label: m.roadmap_handoff_available_count_label(),
      });
    case 'improving-count':
      return buildRoadmapPublicHandoffCountItem({
        column: getRoadmapPublicHandoffColumn(context.columns, 'in-progress'),
        id: context.id,
        label: m.roadmap_handoff_improving_count_label(),
      });
    case 'planned-count':
      return buildRoadmapPublicHandoffCountItem({
        column: getRoadmapPublicHandoffColumn(context.columns, 'backlog'),
        id: context.id,
        label: m.roadmap_handoff_planned_count_label(),
      });
    case 'activity-assignment-loop':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_activity_assignment_loop_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'activity-assignment-loop'
        ),
      });
    case 'template-foundation':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_template_foundation_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'playable-template-foundation'
        ),
      });
    case 'ai-draft-capability':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_ai_draft_capability_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'ai-assisted-activity-drafting'
        ),
      });
    case 'results-reteach-focus':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_results_reteach_focus_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'results-reteach-summaries'
        ),
      });
    case 'worksheet-delivery-focus':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_worksheet_delivery_focus_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'worksheet-style-delivery'
        ),
      });
    case 'worksheet-extraction-boundary':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_worksheet_extraction_boundary_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'worksheet-extraction'
        ),
      });
    case 'school-workflow-boundary':
      return buildRoadmapPublicHandoffTaskItem({
        id: context.id,
        label: m.roadmap_handoff_school_workflow_boundary_label(),
        task: getRoadmapPublicHandoffTask(
          context.columns,
          'school-team-workflows'
        ),
      });
    case 'create-route':
      return buildRoadmapPublicHandoffRouteItem({
        action: context.hero.primaryAction,
        id: context.id,
        label: m.roadmap_handoff_create_route_label(),
      });
    case 'templates-route':
      return buildRoadmapPublicHandoffRouteItem({
        action: context.hero.secondaryAction,
        id: context.id,
        label: m.roadmap_handoff_templates_route_label(),
      });
    case 'feedback-route':
      return buildRoadmapPublicHandoffRouteItem({
        action: context.validation.action,
        id: context.id,
        label: m.roadmap_handoff_feedback_route_label(),
      });
    case 'snapshot-live-core':
      return buildRoadmapPublicHandoffSnapshotItem({
        id: context.id,
        label: m.roadmap_handoff_snapshot_live_core_label(),
        snapshot: getRoadmapPublicHandoffSnapshot(context.snapshots, 'live'),
      });
    case 'snapshot-template-depth':
      return buildRoadmapPublicHandoffSnapshotItem({
        id: context.id,
        label: m.roadmap_handoff_snapshot_template_depth_label(),
        snapshot: getRoadmapPublicHandoffSnapshot(context.snapshots, 'loop'),
      });
    case 'snapshot-ai-expansion':
      return buildRoadmapPublicHandoffSnapshotItem({
        id: context.id,
        label: m.roadmap_handoff_snapshot_ai_expansion_label(),
        snapshot: getRoadmapPublicHandoffSnapshot(
          context.snapshots,
          'expansion'
        ),
      });
    case 'public-copy-boundary':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_public_copy_boundary_description(),
        id: context.id,
        label: m.roadmap_handoff_public_copy_boundary_label(),
        value: m.roadmap_handoff_public_copy_boundary_value(),
      });
    case 'legacy-copy-guard':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_legacy_copy_guard_description(),
        id: context.id,
        label: m.roadmap_handoff_legacy_copy_guard_label(),
        value: m.roadmap_handoff_legacy_copy_guard_value(),
      });
    case 'privacy-guard':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_privacy_guard_description(),
        id: context.id,
        label: m.roadmap_handoff_privacy_guard_label(),
        value: m.roadmap_handoff_privacy_guard_value(),
      });
  }
}

function buildRoadmapPublicHandoffItem({
  description,
  id,
  label,
  statusLabel,
  value,
}: Omit<
  RoadmapPublicHandoffItemView,
  'ariaLabel'
>): RoadmapPublicHandoffItemView {
  return {
    ariaLabel: m.roadmap_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    statusLabel,
    value,
  };
}

function buildRoadmapPublicHandoffCountItem({
  column,
  id,
  label,
}: {
  column: RoadmapColumnView;
  id: RoadmapPublicHandoffItemId;
  label: string;
}) {
  return buildRoadmapPublicHandoffItem({
    description: column.description,
    id,
    label,
    statusLabel: column.status,
    value: String(column.items.length),
  });
}

function buildRoadmapPublicHandoffTaskItem({
  id,
  label,
  task,
}: {
  id: RoadmapPublicHandoffItemId;
  label: string;
  task: RoadmapTaskView;
}) {
  return buildRoadmapPublicHandoffItem({
    description: task.evidence,
    id,
    label,
    statusLabel: task.statusLabel,
    value: task.statusLabel,
  });
}

function buildRoadmapPublicHandoffRouteItem({
  action,
  id,
  label,
}: {
  action: PublicPageRouteAction;
  id: RoadmapPublicHandoffItemId;
  label: string;
}) {
  return buildRoadmapPublicHandoffItem({
    description: action.ariaLabel,
    id,
    label,
    value: action.to,
  });
}

function buildRoadmapPublicHandoffSnapshotItem({
  id,
  label,
  snapshot,
}: {
  id: RoadmapPublicHandoffItemId;
  label: string;
  snapshot: RoadmapSnapshotView;
}) {
  return buildRoadmapPublicHandoffItem({
    description: snapshot.description,
    id,
    label,
    value: snapshot.title,
  });
}

function buildRoadmapPublicHandoffPrivacyContract(
  itemViews: RoadmapPublicHandoffItemView[]
): RoadmapPublicHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    describesCurrentUsableLoop: true,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsLegacyCopyOut: true,
    readsSourceMaterialFileBytes: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-roadmap-product-boundary',
  };
}

function getRoadmapPublicHandoffColumn(
  columns: RoadmapColumnView[],
  id: RoadmapColumnId
) {
  const column = columns.find((candidate) => candidate.id === id);

  if (!column) {
    throw new Error(`Missing roadmap column: ${id}`);
  }

  return column;
}

function getRoadmapPublicHandoffSnapshot(
  snapshots: RoadmapSnapshotView[],
  id: RoadmapSnapshotId
) {
  const snapshot = snapshots.find((candidate) => candidate.id === id);

  if (!snapshot) {
    throw new Error(`Missing roadmap snapshot: ${id}`);
  }

  return snapshot;
}

function getRoadmapPublicHandoffTask(
  columns: RoadmapColumnView[],
  id: RoadmapTaskId
) {
  const task = columns
    .flatMap((column) => column.items)
    .find((candidate) => candidate.id === id);

  if (!task) {
    throw new Error(`Missing roadmap task: ${id}`);
  }

  return task;
}

function buildRoadmapTaskView({
  description,
  evidence,
  id,
  nextStep,
  status,
  title,
}: {
  description: string;
  evidence: string;
  id: RoadmapTaskId;
  nextStep: string;
  status: RoadmapTaskStatus;
  title: string;
}): RoadmapTaskView {
  const statusLabel = getRoadmapTaskStatusLabel(status);

  return {
    description,
    evidence,
    evidenceLabel: m.roadmap_task_evidence_label(),
    id,
    nextStep,
    nextStepLabel: m.roadmap_task_next_step_label(),
    status,
    statusAriaLabel: m.roadmap_task_status_aria({
      status: statusLabel,
      title,
    }),
    statusLabel,
    title,
  };
}

function getRoadmapTaskStatusLabel(status: RoadmapTaskStatus) {
  if (status === 'available') return m.roadmap_status_available();
  if (status === 'improving') return m.roadmap_status_improving();

  return m.roadmap_status_exploring();
}

export function buildTeachersPageViewModel(): TeachersPageViewModel {
  const templatePanelTitle = m.teachers_page_template_panel_title();
  const templatePanelDescription = m.teachers_page_template_panel_description();
  const schoolCtaTitle = m.teachers_page_school_cta_title();
  const schoolCtaDescription = m.teachers_page_school_cta_description();
  const useCaseSectionTitle = m.teachers_page_use_case_section_title();
  const useCaseSectionDescription =
    m.teachers_page_use_case_section_description();
  const workflowSectionTitle = m.teachers_page_workflow_section_title();
  const workflowSectionDescription =
    m.teachers_page_workflow_section_description();

  return {
    hero: {
      badgeLabel: m.teachers_page_eyebrow(),
      description: m.teachers_page_description(),
      primaryAction: {
        ariaLabel: m.teachers_page_primary_cta_aria_label(),
        label: m.teachers_page_primary_cta(),
        to: Routes.Create,
      },
      secondaryAction: {
        ariaLabel: m.teachers_page_secondary_cta_aria_label(),
        label: m.teachers_page_secondary_cta(),
        to: Routes.ContactClassroom,
      },
      title: m.teachers_page_title(),
    },
    schoolCta: {
      action: {
        ariaLabel: m.teachers_page_school_cta_aria_label(),
        label: m.teachers_page_school_cta(),
        to: Routes.ContactClassroom,
      },
      ariaLabel: m.teachers_page_school_cta_section_aria_label({
        description: schoolCtaDescription,
        title: schoolCtaTitle,
      }),
      description: schoolCtaDescription,
      title: schoolCtaTitle,
    },
    templatePanel: {
      ariaLabel: m.teachers_page_template_panel_aria_label({
        description: templatePanelDescription,
        title: templatePanelTitle,
      }),
      classroomModeLabel: m.teachers_page_template_panel_mode_label(),
      description: templatePanelDescription,
      templates: getActivityTemplates().map(buildTeachersTemplatePanelItemView),
      title: templatePanelTitle,
    },
    useCaseSection: {
      ariaLabel: m.teachers_page_use_case_section_aria_label({
        description: useCaseSectionDescription,
        title: useCaseSectionTitle,
      }),
      description: useCaseSectionDescription,
      title: useCaseSectionTitle,
    },
    useCases: [
      buildTeachersPageItemView({
        description: m.teachers_page_use_case_0_description(),
        id: 'classrooms',
        title: m.teachers_page_use_case_0_title(),
      }),
      buildTeachersPageItemView({
        description: m.teachers_page_use_case_1_description(),
        id: 'games',
        title: m.teachers_page_use_case_1_title(),
      }),
      buildTeachersPageItemView({
        description: m.teachers_page_use_case_2_description(),
        id: 'results',
        title: m.teachers_page_use_case_2_title(),
      }),
    ],
    workflowSection: {
      ariaLabel: m.teachers_page_workflow_section_aria_label({
        description: workflowSectionDescription,
        title: workflowSectionTitle,
      }),
      description: workflowSectionDescription,
      title: workflowSectionTitle,
    },
    workflow: [
      buildTeachersPageItemView({
        description: m.teachers_page_workflow_0_description(),
        id: 'draft',
        title: m.teachers_page_workflow_0_title(),
      }),
      buildTeachersPageItemView({
        description: m.teachers_page_workflow_1_description(),
        id: 'publish',
        title: m.teachers_page_workflow_1_title(),
      }),
      buildTeachersPageItemView({
        description: m.teachers_page_workflow_2_description(),
        id: 'share',
        title: m.teachers_page_workflow_2_title(),
      }),
    ],
  };
}

function buildTeachersTemplatePanelItemView(
  template: ReturnType<typeof getActivityTemplates>[number]
): TeachersTemplatePanelItemView {
  const classroomMode = formatActivityTemplateClassroomMode(
    template.classroomMode
  );

  return {
    ariaLabel: m.teachers_page_template_panel_item_aria_label({
      mode: classroomMode,
      template: template.name,
    }),
    classroomMode,
    name: template.name,
    templateType: template.type,
  };
}

function buildTeachersPageItemView<Id extends string>({
  description,
  id,
  title,
}: {
  description: string;
  id: Id;
  title: string;
}): TeachersPageItemView<Id> {
  return {
    ariaLabel: m.teachers_page_card_aria_label({ description, title }),
    description,
    id,
    title,
  };
}

export function buildContactPageViewModel(
  intent: ContactIntent = 'general'
): ContactPageViewModel {
  const isClassroom = intent === 'classroom';
  const directSubject = isClassroom
    ? m.contact_subject_classroom()
    : m.contact_subject_general();
  const heroDescription = isClassroom
    ? m.contact_classroom_description()
    : m.contact_description();
  const heroTitle = isClassroom
    ? m.contact_classroom_title()
    : m.contact_title();
  const supportEmailDescription = m.contact_email_support_description();
  const supportEmailTitle = m.contact_email_support();
  const supportCtaLabel = m.contact_support_cta();

  return {
    checklist: buildContactChecklist(intent),
    directSubject,
    hero: {
      ariaLabel: m.contact_hero_aria_label({
        description: heroDescription,
        title: heroTitle,
      }),
      description: heroDescription,
      title: heroTitle,
    },
    inquiryPanel: isClassroom ? buildContactInquiryPanel() : undefined,
    intent,
    supportCta: {
      ariaLabel: m.contact_support_cta_aria_label({
        subject: directSubject,
      }),
      label: supportCtaLabel,
    },
    supportEmail: {
      actionAriaLabel: m.contact_email_support_action_aria_label({
        subject: directSubject,
      }),
      ariaLabel: m.contact_email_support_card_aria_label({
        description: supportEmailDescription,
        title: supportEmailTitle,
      }),
      description: supportEmailDescription,
      title: supportEmailTitle,
    },
    topicSection: {
      ariaLabel: m.contact_topic_section_aria_label(),
    },
    topics: [
      buildContactTopicView({
        description: m.contact_topic_learning_description(),
        id: 'product',
        subject: m.contact_subject_product(),
        title: m.contact_topic_learning_title(),
      }),
      buildContactTopicView({
        description: m.contact_topic_classroom_description(),
        id: 'classroom',
        subject: m.contact_subject_classroom(),
        title: m.contact_topic_classroom_title(),
      }),
      buildContactTopicView({
        description: m.contact_topic_partnership_description(),
        id: 'partnership',
        subject: m.contact_subject_pricing(),
        title: m.contact_topic_partnership_title(),
      }),
    ],
  };
}

export function buildPricingPageViewModel(): PricingPageViewModel {
  const faqTitle = m.pricing_faq_title();
  const faqDescription = m.pricing_faq_description();
  const schoolCtaTitle = m.pricing_school_title();
  const schoolCtaDescription = m.pricing_school_description();
  const schoolCtaLabel = m.pricing_school_cta();
  const valueSectionTitle = m.pricing_value_section_title();
  const valueSectionDescription = m.pricing_value_section_description();
  const valueCards = [
    buildPricingValueCardView({
      description: m.pricing_value_templates_description(),
      id: 'templates',
      title: m.pricing_value_templates_title(),
    }),
    buildPricingValueCardView({
      description: m.pricing_value_assignments_description(),
      id: 'assignments',
      title: m.pricing_value_assignments_title(),
    }),
    buildPricingValueCardView({
      description: m.pricing_value_ai_description(),
      id: 'ai',
      title: m.pricing_value_ai_title(),
    }),
  ];

  return {
    faq: {
      ariaLabel: m.pricing_faq_section_aria_label({
        description: faqDescription,
        title: faqTitle,
      }),
      description: faqDescription,
      items: buildPricingFaqItems(),
      title: faqTitle,
    },
    hero: {
      eyebrow: m.pricing_eyebrow(),
      subtitle: m.pricing_subtitle(),
      title: m.pricing_title(),
    },
    schoolCta: {
      action: {
        ariaLabel: m.pricing_school_cta_aria_label(),
        label: schoolCtaLabel,
        to: Routes.ContactClassroom,
      },
      ariaLabel: m.pricing_school_cta_section_aria_label({
        description: schoolCtaDescription,
        title: schoolCtaTitle,
      }),
      description: schoolCtaDescription,
      eyebrow: m.pricing_school_eyebrow(),
      title: schoolCtaTitle,
    },
    valueSection: {
      ariaLabel: m.pricing_value_section_aria_label({
        description: valueSectionDescription,
        title: valueSectionTitle,
      }),
      description: valueSectionDescription,
      title: valueSectionTitle,
    },
    valueCards,
  };
}

export function buildPricingFaqItems(): PricingFaqItemView[] {
  return [
    buildPricingFaqItemView({
      answer: m.pricing_faq_free_answer(),
      id: 'free',
      question: m.pricing_faq_free_question(),
    }),
    buildPricingFaqItemView({
      answer: m.pricing_faq_pro_answer(),
      id: 'pro',
      question: m.pricing_faq_pro_question(),
    }),
    buildPricingFaqItemView({
      answer: m.pricing_faq_templates_answer(),
      id: 'templates',
      question: m.pricing_faq_templates_question(),
    }),
    buildPricingFaqItemView({
      answer: m.pricing_faq_student_accounts_answer(),
      id: 'student-accounts',
      question: m.pricing_faq_student_accounts_question(),
    }),
    buildPricingFaqItemView({
      answer: m.pricing_faq_schools_answer(),
      id: 'schools',
      question: m.pricing_faq_schools_question(),
    }),
  ];
}

function buildPricingFaqItemView({
  answer,
  id,
  question,
}: {
  answer: string;
  id: PricingFaqItemId;
  question: string;
}): PricingFaqItemView {
  return {
    answer,
    ariaLabel: m.pricing_faq_item_aria_label({ answer, question }),
    id,
    question,
  };
}

function buildPricingValueCardView({
  description,
  id,
  title,
}: {
  description: string;
  id: PricingValueCardId;
  title: string;
}): PricingValueCardView {
  return {
    ariaLabel: m.pricing_value_card_aria_label({ description, title }),
    description,
    id,
    title,
  };
}

function buildContactChecklist(intent: ContactIntent): ContactChecklistView {
  if (intent === 'classroom') {
    const description = m.contact_classroom_checklist_description();
    const title = m.contact_classroom_checklist_title();

    return {
      ariaLabel: m.contact_checklist_aria_label({
        description,
        title,
      }),
      description,
      items: [
        buildContactChecklistItemView({
          id: 'classroom-learners',
          text: m.contact_classroom_checklist_learners(),
        }),
        buildContactChecklistItemView({
          id: 'classroom-routine',
          text: m.contact_classroom_checklist_routine(),
        }),
        buildContactChecklistItemView({
          id: 'classroom-worksheets',
          text: m.contact_classroom_checklist_worksheets(),
        }),
      ],
      title,
    };
  }

  const description = m.contact_checklist_description();
  const title = m.contact_checklist_title();

  return {
    ariaLabel: m.contact_checklist_aria_label({
      description,
      title,
    }),
    description,
    items: [
      buildContactChecklistItemView({
        id: 'page',
        text: m.contact_checklist_page(),
      }),
      buildContactChecklistItemView({
        id: 'device',
        text: m.contact_checklist_device(),
      }),
      buildContactChecklistItemView({
        id: 'goal',
        text: m.contact_checklist_goal(),
      }),
    ],
    title,
  };
}

function buildContactInquiryPanel(): ContactInquiryPanelView {
  const description = m.contact_classroom_panel_description();
  const title = m.contact_classroom_panel_title();

  return {
    ariaLabel: m.contact_classroom_panel_aria_label({ description, title }),
    description,
    highlights: [
      buildContactInquiryPanelHighlightView({
        description: m.contact_classroom_panel_students_description(),
        id: 'students',
        title: m.contact_classroom_panel_students_title(),
      }),
      buildContactInquiryPanelHighlightView({
        description: m.contact_classroom_panel_materials_description(),
        id: 'materials',
        title: m.contact_classroom_panel_materials_title(),
      }),
      buildContactInquiryPanelHighlightView({
        description: m.contact_classroom_panel_rollout_description(),
        id: 'rollout',
        title: m.contact_classroom_panel_rollout_title(),
      }),
    ],
    title,
  };
}

function buildContactChecklistItemView({
  id,
  text,
}: {
  id: ContactChecklistItemId;
  text: string;
}): ContactChecklistItemView {
  return {
    ariaLabel: m.contact_checklist_item_aria_label({ text }),
    id,
    text,
  };
}

function buildContactInquiryPanelHighlightView({
  description,
  id,
  title,
}: {
  description: string;
  id: ContactInquiryPanelHighlightView['id'];
  title: string;
}): ContactInquiryPanelHighlightView {
  return {
    ariaLabel: m.contact_classroom_panel_highlight_aria_label({
      description,
      title,
    }),
    description,
    id,
    title,
  };
}

function buildContactTopicView({
  description,
  id,
  subject,
  title,
}: {
  description: string;
  id: ContactTopicId;
  subject: string;
  title: string;
}): ContactTopicView {
  return {
    actionAriaLabel: m.contact_topic_action_aria_label({ title }),
    ariaLabel: m.contact_topic_card_aria_label({ description, title }),
    description,
    id,
    subject,
    title,
  };
}
