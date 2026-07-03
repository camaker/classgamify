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
  supportCtaLabel: string;
  supportEmail: {
    description: string;
    title: string;
  };
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
  id: ContactChecklistItemId;
  text: string;
};

type ContactChecklistView = {
  description: string;
  items: ContactChecklistItemView[];
  title: string;
};

type ContactHeroView = {
  description: string;
  title: string;
};

export type ContactInquiryPanelView = {
  description: string;
  highlights: ContactInquiryPanelHighlightView[];
  title: string;
};

type ContactInquiryPanelHighlightView = {
  description: string;
  id: 'materials' | 'rollout' | 'students';
  title: string;
};

type ContactTopicView = {
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
  return {
    columns: [
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
    ],
    hero: {
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
    },
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
    snapshots: [
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
    ],
    validation: {
      action: {
        ariaLabel: m.roadmap_feedback_cta_aria_label(),
        label: m.roadmap_feedback_cta(),
        to: Routes.ContactClassroom,
      },
      description: m.roadmap_validation_description(),
      eyebrowLabel: m.roadmap_validation_eyebrow(),
      title: m.roadmap_validation_title(),
    },
  };
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

  return {
    checklist: buildContactChecklist(intent),
    directSubject: isClassroom
      ? m.contact_subject_classroom()
      : m.contact_subject_general(),
    hero: {
      description: isClassroom
        ? m.contact_classroom_description()
        : m.contact_description(),
      title: isClassroom ? m.contact_classroom_title() : m.contact_title(),
    },
    inquiryPanel: isClassroom ? buildContactInquiryPanel() : undefined,
    intent,
    supportCtaLabel: m.contact_support_cta(),
    supportEmail: {
      description: m.contact_email_support_description(),
      title: m.contact_email_support(),
    },
    topics: [
      {
        description: m.contact_topic_learning_description(),
        id: 'product',
        subject: m.contact_subject_product(),
        title: m.contact_topic_learning_title(),
      },
      {
        description: m.contact_topic_classroom_description(),
        id: 'classroom',
        subject: m.contact_subject_classroom(),
        title: m.contact_topic_classroom_title(),
      },
      {
        description: m.contact_topic_partnership_description(),
        id: 'partnership',
        subject: m.contact_subject_pricing(),
        title: m.contact_topic_partnership_title(),
      },
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
    return {
      description: m.contact_classroom_checklist_description(),
      items: [
        {
          id: 'classroom-learners',
          text: m.contact_classroom_checklist_learners(),
        },
        {
          id: 'classroom-routine',
          text: m.contact_classroom_checklist_routine(),
        },
        {
          id: 'classroom-worksheets',
          text: m.contact_classroom_checklist_worksheets(),
        },
      ],
      title: m.contact_classroom_checklist_title(),
    };
  }

  return {
    description: m.contact_checklist_description(),
    items: [
      {
        id: 'page',
        text: m.contact_checklist_page(),
      },
      {
        id: 'device',
        text: m.contact_checklist_device(),
      },
      {
        id: 'goal',
        text: m.contact_checklist_goal(),
      },
    ],
    title: m.contact_checklist_title(),
  };
}

function buildContactInquiryPanel(): ContactInquiryPanelView {
  return {
    description: m.contact_classroom_panel_description(),
    highlights: [
      {
        description: m.contact_classroom_panel_students_description(),
        id: 'students',
        title: m.contact_classroom_panel_students_title(),
      },
      {
        description: m.contact_classroom_panel_materials_description(),
        id: 'materials',
        title: m.contact_classroom_panel_materials_title(),
      },
      {
        description: m.contact_classroom_panel_rollout_description(),
        id: 'rollout',
        title: m.contact_classroom_panel_rollout_title(),
      },
    ],
    title: m.contact_classroom_panel_title(),
  };
}
