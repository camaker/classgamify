import {
  formatActivityTemplateClassroomMode,
  getActivityTemplates,
} from '@/activities/catalog';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import type { ActivityTemplateType } from '@/activities/types';

type PublicPageRouteAction = {
  label: string;
  to:
    | typeof Routes.ContactClassroom
    | typeof Routes.Create
    | typeof Routes.StudentPreview
    | typeof Routes.Templates;
};

export type HomePageViewModel = {
  features: HomePageFeature[];
  hero: HomePageHeroView;
  signals: HomePageSignal[];
};

export type HomePageFeatureId =
  | 'activity-templates'
  | 'assignment-links'
  | 'results'
  | 'teacher-workflows';

type HomePageFeature = {
  description: string;
  id: HomePageFeatureId;
  title: string;
};

type HomePageHeroView = {
  badgeLabel: string;
  browseTemplatesAction: PublicPageRouteAction;
  description: string;
  primaryAction: PublicPageRouteAction;
  title: string;
};

export type HomePageSignalId = 'delivery' | 'results' | 'templates';

type HomePageSignal = {
  id: HomePageSignalId;
  label: string;
  value: string;
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

type RoadmapTaskView = {
  description: string;
  id: RoadmapTaskId;
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
  useCases: TeachersPageItemView<TeachersPageUseCaseId>[];
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
    description: string;
    eyebrow: string;
    label: string;
    title: string;
  };
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
  id: PricingFaqItemId;
  question: string;
};

type PricingValueCardView = {
  description: string;
  id: PricingValueCardId;
  title: string;
};

export type TeachersPageWorkflowId = 'draft' | 'publish' | 'share';

export type TeachersPageUseCaseId = 'classrooms' | 'games' | 'results';

type TeachersPageItemView<Id extends string> = {
  description: string;
  id: Id;
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
  description: string;
  title: string;
};

type TeachersTemplatePanelView = {
  title: string;
  templates: TeachersTemplatePanelItemView[];
};

type TeachersTemplatePanelItemView = {
  classroomMode: string;
  name: string;
  templateType: ActivityTemplateType;
};

export function buildHomePageViewModel(): HomePageViewModel {
  return {
    features: [
      {
        description: m.home_features_items_item_1_description(),
        id: 'teacher-workflows',
        title: m.home_features_items_item_1_title(),
      },
      {
        description: m.home_features_items_item_2_description(),
        id: 'activity-templates',
        title: m.home_features_items_item_2_title(),
      },
      {
        description: m.home_features_items_item_3_description(),
        id: 'assignment-links',
        title: m.home_features_items_item_3_title(),
      },
      {
        description: m.home_features_items_item_4_description(),
        id: 'results',
        title: m.home_features_items_item_4_title(),
      },
    ],
    hero: {
      badgeLabel: m.home_hero_introduction(),
      browseTemplatesAction: {
        label: m.home_hero_browse_templates(),
        to: Routes.Templates,
      },
      description: m.home_hero_description(),
      primaryAction: {
        label: m.home_hero_primary(),
        to: Routes.Create,
      },
      title: m.home_hero_title(),
    },
    signals: [
      {
        id: 'templates',
        label: m.home_signal_templates_label(),
        value: m.home_signal_templates_value(),
      },
      {
        id: 'delivery',
        label: m.home_signal_delivery_label(),
        value: m.home_signal_delivery_value(),
      },
      {
        id: 'results',
        label: m.home_signal_results_label(),
        value: m.home_signal_results_value(),
      },
    ],
  };
}

export function buildRoadmapPageViewModel(): RoadmapPageViewModel {
  return {
    columns: [
      {
        description: m.roadmap_columns_done_description(),
        id: 'done',
        items: [
          {
            description: m.roadmap_board_tasks_done_0_description(),
            id: 'activity-assignment-loop',
            title: m.roadmap_board_tasks_done_0_title(),
          },
          {
            description: m.roadmap_board_tasks_done_1_description(),
            id: 'playable-template-foundation',
            title: m.roadmap_board_tasks_done_1_title(),
          },
        ],
        status: m.roadmap_status_available(),
        title: m.roadmap_columns_done(),
      },
      {
        description: m.roadmap_columns_in_progress_description(),
        id: 'in-progress',
        items: [
          {
            description: m.roadmap_board_tasks_in_progress_0_description(),
            id: 'results-reteach-summaries',
            title: m.roadmap_board_tasks_in_progress_0_title(),
          },
          {
            description: m.roadmap_board_tasks_in_progress_1_description(),
            id: 'worksheet-style-delivery',
            title: m.roadmap_board_tasks_in_progress_1_title(),
          },
        ],
        status: m.roadmap_status_improving(),
        title: m.roadmap_columns_in_progress(),
      },
      {
        description: m.roadmap_columns_backlog_description(),
        id: 'backlog',
        items: [
          {
            description: m.roadmap_board_tasks_backlog_0_description(),
            id: 'ai-assisted-activity-drafting',
            title: m.roadmap_board_tasks_backlog_0_title(),
          },
          {
            description: m.roadmap_board_tasks_backlog_1_description(),
            id: 'worksheet-extraction',
            title: m.roadmap_board_tasks_backlog_1_title(),
          },
          {
            description: m.roadmap_board_tasks_backlog_2_description(),
            id: 'school-team-workflows',
            title: m.roadmap_board_tasks_backlog_2_title(),
          },
        ],
        status: m.roadmap_status_exploring(),
        title: m.roadmap_columns_backlog(),
      },
    ],
    hero: {
      badgeLabel: m.roadmap_eyebrow(),
      description: m.roadmap_subtitle(),
      primaryAction: {
        label: m.roadmap_primary_cta(),
        to: Routes.Create,
      },
      secondaryAction: {
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
        label: m.roadmap_feedback_cta(),
        to: Routes.ContactClassroom,
      },
      description: m.roadmap_validation_description(),
      eyebrowLabel: m.roadmap_validation_eyebrow(),
      title: m.roadmap_validation_title(),
    },
  };
}

export function buildTeachersPageViewModel(): TeachersPageViewModel {
  const templates = getActivityTemplates().map((template) => ({
    classroomMode: formatActivityTemplateClassroomMode(template.classroomMode),
    name: template.name,
    templateType: template.type,
  }));

  return {
    hero: {
      badgeLabel: m.teachers_page_eyebrow(),
      description: m.teachers_page_description(),
      primaryAction: {
        label: m.teachers_page_primary_cta(),
        to: Routes.Create,
      },
      secondaryAction: {
        label: m.teachers_page_secondary_cta(),
        to: Routes.ContactClassroom,
      },
      title: m.teachers_page_title(),
    },
    schoolCta: {
      action: {
        label: m.teachers_page_school_cta(),
        to: Routes.ContactClassroom,
      },
      description: m.teachers_page_school_cta_description(),
      title: m.teachers_page_school_cta_title(),
    },
    templatePanel: {
      title: m.teachers_page_template_panel_title(),
      templates,
    },
    useCases: [
      {
        description: m.teachers_page_use_case_0_description(),
        id: 'classrooms',
        title: m.teachers_page_use_case_0_title(),
      },
      {
        description: m.teachers_page_use_case_1_description(),
        id: 'games',
        title: m.teachers_page_use_case_1_title(),
      },
      {
        description: m.teachers_page_use_case_2_description(),
        id: 'results',
        title: m.teachers_page_use_case_2_title(),
      },
    ],
    workflow: [
      {
        description: m.teachers_page_workflow_0_description(),
        id: 'draft',
        title: m.teachers_page_workflow_0_title(),
      },
      {
        description: m.teachers_page_workflow_1_description(),
        id: 'publish',
        title: m.teachers_page_workflow_1_title(),
      },
      {
        description: m.teachers_page_workflow_2_description(),
        id: 'share',
        title: m.teachers_page_workflow_2_title(),
      },
    ],
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
  return {
    faq: {
      description: m.pricing_faq_description(),
      items: buildPricingFaqItems(),
      title: m.pricing_faq_title(),
    },
    hero: {
      eyebrow: m.pricing_eyebrow(),
      subtitle: m.pricing_subtitle(),
      title: m.pricing_title(),
    },
    schoolCta: {
      description: m.pricing_school_description(),
      eyebrow: m.pricing_school_eyebrow(),
      label: m.pricing_school_cta(),
      title: m.pricing_school_title(),
    },
    valueCards: [
      {
        description: m.pricing_value_templates_description(),
        id: 'templates',
        title: m.pricing_value_templates_title(),
      },
      {
        description: m.pricing_value_assignments_description(),
        id: 'assignments',
        title: m.pricing_value_assignments_title(),
      },
      {
        description: m.pricing_value_ai_description(),
        id: 'ai',
        title: m.pricing_value_ai_title(),
      },
    ],
  };
}

export function buildPricingFaqItems(): PricingFaqItemView[] {
  return [
    {
      answer: m.pricing_faq_free_answer(),
      id: 'free',
      question: m.pricing_faq_free_question(),
    },
    {
      answer: m.pricing_faq_pro_answer(),
      id: 'pro',
      question: m.pricing_faq_pro_question(),
    },
    {
      answer: m.pricing_faq_templates_answer(),
      id: 'templates',
      question: m.pricing_faq_templates_question(),
    },
    {
      answer: m.pricing_faq_student_accounts_answer(),
      id: 'student-accounts',
      question: m.pricing_faq_student_accounts_question(),
    },
    {
      answer: m.pricing_faq_schools_answer(),
      id: 'schools',
      question: m.pricing_faq_schools_question(),
    },
  ];
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
