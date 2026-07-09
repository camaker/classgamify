import {
  formatActivityTemplateClassroomMode,
  getStarterActivity,
  getStarterAssignment,
  getActivityTemplates,
} from '@/activities/catalog';
import { m } from '@/locale/paraglide/messages';
import { getAllPricePlans } from '@/lib/price-plan';
import { Routes } from '@/lib/routes';
import { PaymentTypes, type PricePlan } from '@/payment/types';
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
  handoffView: HomePageProductLoopHandoffView;
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

export const HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS = [
  'product-loop',
  'homepage-surface',
  'hero-create-route',
  'hero-template-route',
  'hero-worksheet-route',
  'create-route',
  'templates-route',
  'worksheets-route',
  'starter-preview-source',
  'starter-preview-activity',
  'starter-preview-assignment',
  'starter-preview-submit-boundary',
  'feature-section',
  'feature-structured-activities',
  'feature-template-switching',
  'feature-assignment-links',
  'feature-teacher-results',
  'signal-panel',
  'signal-templates',
  'signal-delivery',
  'signal-results',
  'activity-content-model',
  'assignment-snapshot-boundary',
  'student-runner-boundary',
  'result-review-boundary',
  'worksheet-extension-boundary',
  'ai-draft-boundary',
  'legacy-entrypoint-guard',
  'indexing-scope',
  'privacy-guard',
] as const;

export type HomePageProductLoopHandoffItemId =
  (typeof HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS)[number];

export type HomePageProductLoopHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: HomePageProductLoopHandoffItemId;
  label: string;
  value: string;
};

export type HomePageProductLoopHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: HomePageProductLoopHandoffItemId[];
  keepsLegacyEntrypointsOut: true;
  mutatesTeacherData: false;
  previewIsStarterOnly: true;
  routeActionsUseSharedConstants: true;
  scope: 'public-home-product-loop';
};

export type HomePageProductLoopHandoffView = {
  description: string;
  itemViews: HomePageProductLoopHandoffItemView[];
  privacy: HomePageProductLoopHandoffPrivacyContract;
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
  'roadmap-surface',
  'available-count',
  'improving-count',
  'planned-count',
  'column-board',
  'status-label-boundary',
  'activity-assignment-loop',
  'template-foundation',
  'ai-draft-capability',
  'results-reteach-focus',
  'worksheet-delivery-focus',
  'worksheet-extraction-boundary',
  'school-workflow-boundary',
  'task-evidence-boundary',
  'task-next-step-boundary',
  'hero-action-boundary',
  'create-route',
  'templates-route',
  'feedback-route',
  'snapshot-panel',
  'snapshot-live-core',
  'snapshot-template-depth',
  'snapshot-ai-expansion',
  'principle-focus-boundary',
  'principle-model-boundary',
  'validation-decision-boundary',
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
  describesPublicRoadmapSurface: true;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: RoadmapPublicHandoffItemId[];
  keepsLegacyCopyOut: true;
  keepsPlannedBetsExploratory: true;
  mutatesTeacherWorkspace: false;
  readsSourceMaterialFileBytes: false;
  rendersTaskEvidence: true;
  rendersTaskNextSteps: true;
  rendersValidationCriteria: true;
  routeActionsUseSharedConstants: true;
  scope: 'public-roadmap-product-boundary';
  usesPreparedViewModel: true;
};

export type RoadmapPublicHandoffView = {
  description: string;
  itemViews: RoadmapPublicHandoffItemView[];
  privacy: RoadmapPublicHandoffPrivacyContract;
  title: string;
};

export type TeachersPageViewModel = {
  handoffView: TeachersPageHandoffView;
  hero: TeachersHeroView;
  schoolCta: TeachersSchoolCtaView;
  templatePanel: TeachersTemplatePanelView;
  useCaseSection: TeachersPageSectionView;
  useCases: TeachersPageItemView<TeachersPageUseCaseId>[];
  workflowSection: TeachersPageSectionView;
  workflow: TeachersPageItemView<TeachersPageWorkflowId>[];
};

export const TEACHERS_PAGE_HANDOFF_ITEM_IDS = [
  'teachers-route',
  'teacher-audience',
  'hero-positioning',
  'primary-create-action',
  'secondary-contact-action',
  'workflow-section',
  'workflow-draft',
  'workflow-publish',
  'workflow-share',
  'use-case-section',
  'use-case-classrooms',
  'use-case-games',
  'use-case-results',
  'template-panel',
  'template-count',
  'template-classroom-mode-label',
  'template-mode-coverage',
  'template-quiz',
  'template-match-up',
  'template-group-sort',
  'template-fill-blank',
  'template-listening',
  'template-matching-pairs',
  'template-line-match',
  'template-open-box',
  'school-cta',
  'school-contact-route',
  'activity-assignment-loop',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type TeachersPageHandoffItemId =
  (typeof TEACHERS_PAGE_HANDOFF_ITEM_IDS)[number];

export type TeachersPageHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: TeachersPageHandoffItemId;
  label: string;
  value: string;
};

export type TeachersPageHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: TeachersPageHandoffItemId[];
  mutatesTeacherWorkspace: false;
  routeActionsUseSharedConstants: true;
  scope: 'public-teachers-product-loop';
  templateModesComeFromCatalog: true;
  usesClassGamifyCopy: true;
  usesPreparedViewModel: true;
};

export type TeachersPageHandoffView = {
  description: string;
  itemViews: TeachersPageHandoffItemView[];
  privacy: TeachersPageHandoffPrivacyContract;
  title: string;
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
  handoffView: PricingPageHandoffView;
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

export const PRICING_PAGE_HANDOFF_ITEM_IDS = [
  'pricing-route',
  'product-loop',
  'hero-positioning',
  'value-section',
  'template-value',
  'assignment-value',
  'ai-value',
  'plan-source',
  'plan-count',
  'free-plan-boundary',
  'pro-plan-boundary',
  'lifetime-plan-boundary',
  'subscription-price-path',
  'one-time-price-path',
  'free-preview-action',
  'authenticated-checkout',
  'hosted-checkout',
  'payment-provider-boundary',
  'current-plan-context',
  'billing-return-path',
  'school-cta-path',
  'faq-boundary',
  'student-account-boundary',
  'activity-library-access',
  'assignment-workflow-access',
  'ai-draft-access',
  'result-export-access',
  'source-material-access',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type PricingPageHandoffItemId =
  (typeof PRICING_PAGE_HANDOFF_ITEM_IDS)[number];

export type PricingPageHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PricingPageHandoffItemId;
  label: string;
  value: string;
};

export type PricingPageHandoffPrivacyContract = {
  exposesAnswerKeys: false;
  exposesCheckoutSessionIds: false;
  exposesPaymentProviderSecrets: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: PricingPageHandoffItemId[];
  mutatesTeacherData: false;
  publishesAssignmentLinks: false;
  routeActionsUseSharedConstants: true;
  scope: 'public-pricing-plan-boundary';
};

export type PricingPageHandoffView = {
  description: string;
  itemViews: PricingPageHandoffItemView[];
  privacy: PricingPageHandoffPrivacyContract;
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
  const features = [
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
  ];
  const featureSection = {
    ariaLabel: m.home_feature_section_aria_label({
      description: featureSectionDescription,
      title: featureSectionTitle,
    }),
    description: featureSectionDescription,
    eyebrowLabel: m.home_features_subtitle(),
    title: featureSectionTitle,
  };
  const hero = {
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
  };
  const signalPanel = {
    ariaLabel: m.home_signal_panel_aria_label({
      description: signalPanelDescription,
      title: signalPanelTitle,
    }),
    description: signalPanelDescription,
    title: signalPanelTitle,
  };
  const signals = [
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
  ];

  return {
    features,
    featureSection,
    handoffView: buildHomePageProductLoopHandoffView({
      features,
      featureSection,
      hero,
      preview,
      signalPanel,
      signals,
    }),
    hero,
    preview,
    signalPanel,
    signals,
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

function buildHomePageProductLoopHandoffView({
  features,
  featureSection,
  hero,
  preview,
  signalPanel,
  signals,
}: Pick<
  HomePageViewModel,
  'features' | 'featureSection' | 'hero' | 'preview' | 'signalPanel' | 'signals'
>): HomePageProductLoopHandoffView {
  const itemViews = HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS.map((id) =>
    buildHomePageProductLoopHandoffItemView({
      features,
      featureSection,
      hero,
      id,
      preview,
      signalPanel,
      signals,
    })
  );

  return {
    description: m.home_handoff_description(),
    itemViews,
    privacy: buildHomePageProductLoopHandoffPrivacyContract(itemViews),
    title: m.home_handoff_title(),
  };
}

type HomePageProductLoopHandoffBuildContext = Pick<
  HomePageViewModel,
  'features' | 'featureSection' | 'hero' | 'preview' | 'signalPanel' | 'signals'
> & {
  id: HomePageProductLoopHandoffItemId;
};

function buildHomePageProductLoopHandoffItemView(
  context: HomePageProductLoopHandoffBuildContext
): HomePageProductLoopHandoffItemView {
  const value = getHomePageProductLoopHandoffItemValue(context);
  const label = getHomePageProductLoopHandoffItemLabel(context);
  const description = getHomePageProductLoopHandoffItemDescription(context);

  return {
    ariaLabel: m.home_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function getHomePageProductLoopHandoffItemValue(
  context: HomePageProductLoopHandoffBuildContext
) {
  switch (context.id) {
    case 'product-loop':
      return 'Activity -> Assignment -> Attempt -> Results';
    case 'homepage-surface':
      return m.home_handoff_surface_value();
    case 'hero-create-route':
      return context.hero.primaryAction.to;
    case 'hero-template-route':
      return context.hero.browseTemplatesAction.to;
    case 'hero-worksheet-route':
      return context.hero.worksheetAction.to;
    case 'create-route':
      return Routes.Create;
    case 'templates-route':
      return Routes.Templates;
    case 'worksheets-route':
      return Routes.Worksheets;
    case 'starter-preview-source':
      return m.home_handoff_starter_preview_source_value();
    case 'starter-preview-activity':
      return m.home_handoff_starter_preview_activity_value();
    case 'starter-preview-assignment':
      return m.home_handoff_starter_preview_assignment_value();
    case 'starter-preview-submit-boundary':
      return m.home_handoff_starter_preview_submit_value();
    case 'feature-section':
      return formatHomePageHandoffCount(context.features.length);
    case 'feature-structured-activities':
      return getHomePageFeature(context.features, 'teacher-workflows').title;
    case 'feature-template-switching':
      return getHomePageFeature(context.features, 'activity-templates').title;
    case 'feature-assignment-links':
      return getHomePageFeature(context.features, 'assignment-links').title;
    case 'feature-teacher-results':
      return getHomePageFeature(context.features, 'results').title;
    case 'signal-panel':
      return formatHomePageHandoffCount(context.signals.length);
    case 'signal-templates':
      return getHomePageSignal(context.signals, 'templates').value;
    case 'signal-delivery':
      return getHomePageSignal(context.signals, 'delivery').value;
    case 'signal-results':
      return getHomePageSignal(context.signals, 'results').value;
    case 'activity-content-model':
      return 'ActivityContent';
    case 'assignment-snapshot-boundary':
      return 'AssignmentSnapshot';
    case 'student-runner-boundary':
      return m.home_handoff_student_runner_value();
    case 'result-review-boundary':
      return m.home_handoff_result_review_value();
    case 'worksheet-extension-boundary':
      return Routes.Worksheets;
    case 'ai-draft-boundary':
      return m.home_handoff_ai_draft_value();
    case 'legacy-entrypoint-guard':
      return m.home_handoff_legacy_guard_value();
    case 'indexing-scope':
      return m.home_handoff_indexing_value();
    case 'privacy-guard':
      return m.home_handoff_privacy_value();
  }
}

function getHomePageProductLoopHandoffItemLabel(
  context: HomePageProductLoopHandoffBuildContext
) {
  switch (context.id) {
    case 'product-loop':
      return m.home_handoff_product_loop_label();
    case 'homepage-surface':
      return m.home_handoff_surface_label();
    case 'hero-create-route':
      return context.hero.primaryAction.label;
    case 'hero-template-route':
      return context.hero.browseTemplatesAction.label;
    case 'hero-worksheet-route':
      return context.hero.worksheetAction.label;
    case 'create-route':
      return m.home_handoff_create_route_label();
    case 'templates-route':
      return m.home_handoff_templates_route_label();
    case 'worksheets-route':
      return m.home_handoff_worksheets_route_label();
    case 'starter-preview-source':
      return m.home_handoff_starter_preview_source_label();
    case 'starter-preview-activity':
      return m.home_handoff_starter_preview_activity_label();
    case 'starter-preview-assignment':
      return m.home_handoff_starter_preview_assignment_label();
    case 'starter-preview-submit-boundary':
      return m.home_handoff_starter_preview_submit_label();
    case 'feature-section':
      return context.featureSection.title;
    case 'feature-structured-activities':
      return getHomePageFeature(context.features, 'teacher-workflows').title;
    case 'feature-template-switching':
      return getHomePageFeature(context.features, 'activity-templates').title;
    case 'feature-assignment-links':
      return getHomePageFeature(context.features, 'assignment-links').title;
    case 'feature-teacher-results':
      return getHomePageFeature(context.features, 'results').title;
    case 'signal-panel':
      return context.signalPanel.title;
    case 'signal-templates':
      return getHomePageSignal(context.signals, 'templates').label;
    case 'signal-delivery':
      return getHomePageSignal(context.signals, 'delivery').label;
    case 'signal-results':
      return getHomePageSignal(context.signals, 'results').label;
    case 'activity-content-model':
      return m.home_handoff_activity_model_label();
    case 'assignment-snapshot-boundary':
      return m.home_handoff_snapshot_label();
    case 'student-runner-boundary':
      return m.home_handoff_student_runner_label();
    case 'result-review-boundary':
      return m.home_handoff_result_review_label();
    case 'worksheet-extension-boundary':
      return m.home_handoff_worksheet_extension_label();
    case 'ai-draft-boundary':
      return m.home_handoff_ai_draft_label();
    case 'legacy-entrypoint-guard':
      return m.home_handoff_legacy_guard_label();
    case 'indexing-scope':
      return m.home_handoff_indexing_label();
    case 'privacy-guard':
      return m.home_handoff_privacy_label();
  }
}

function getHomePageProductLoopHandoffItemDescription(
  context: HomePageProductLoopHandoffBuildContext
) {
  switch (context.id) {
    case 'product-loop':
      return m.home_handoff_product_loop_description();
    case 'homepage-surface':
      return m.home_handoff_surface_description();
    case 'hero-create-route':
      return context.hero.primaryAction.ariaLabel;
    case 'hero-template-route':
      return context.hero.browseTemplatesAction.ariaLabel;
    case 'hero-worksheet-route':
      return context.hero.worksheetAction.ariaLabel;
    case 'create-route':
      return m.home_handoff_create_route_description();
    case 'templates-route':
      return m.home_handoff_templates_route_description();
    case 'worksheets-route':
      return m.home_handoff_worksheets_route_description();
    case 'starter-preview-source':
      return m.home_handoff_starter_preview_source_description();
    case 'starter-preview-activity':
      return m.home_handoff_starter_preview_activity_description();
    case 'starter-preview-assignment':
      return m.home_handoff_starter_preview_assignment_description();
    case 'starter-preview-submit-boundary':
      return m.home_handoff_starter_preview_submit_description();
    case 'feature-section':
      return context.featureSection.description;
    case 'feature-structured-activities':
      return getHomePageFeature(context.features, 'teacher-workflows')
        .description;
    case 'feature-template-switching':
      return getHomePageFeature(context.features, 'activity-templates')
        .description;
    case 'feature-assignment-links':
      return getHomePageFeature(context.features, 'assignment-links')
        .description;
    case 'feature-teacher-results':
      return getHomePageFeature(context.features, 'results').description;
    case 'signal-panel':
      return context.signalPanel.description;
    case 'signal-templates':
      return getHomePageSignal(context.signals, 'templates').description;
    case 'signal-delivery':
      return getHomePageSignal(context.signals, 'delivery').description;
    case 'signal-results':
      return getHomePageSignal(context.signals, 'results').description;
    case 'activity-content-model':
      return m.home_handoff_activity_model_description();
    case 'assignment-snapshot-boundary':
      return m.home_handoff_snapshot_description();
    case 'student-runner-boundary':
      return m.home_handoff_student_runner_description();
    case 'result-review-boundary':
      return m.home_handoff_result_review_description();
    case 'worksheet-extension-boundary':
      return m.home_handoff_worksheet_extension_description();
    case 'ai-draft-boundary':
      return m.home_handoff_ai_draft_description();
    case 'legacy-entrypoint-guard':
      return m.home_handoff_legacy_guard_description();
    case 'indexing-scope':
      return m.home_handoff_indexing_description();
    case 'privacy-guard':
      return m.home_handoff_privacy_description();
  }
}

function buildHomePageProductLoopHandoffPrivacyContract(
  itemViews: HomePageProductLoopHandoffItemView[]
): HomePageProductLoopHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsLegacyEntrypointsOut: true,
    mutatesTeacherData: false,
    previewIsStarterOnly: true,
    routeActionsUseSharedConstants: true,
    scope: 'public-home-product-loop',
  };
}

function getHomePageFeature(
  features: HomePageFeature[],
  id: HomePageFeatureId
) {
  const feature = features.find((candidate) => candidate.id === id);

  if (!feature) {
    throw new Error(`Missing homepage feature: ${id}`);
  }

  return feature;
}

function getHomePageSignal(signals: HomePageSignal[], id: HomePageSignalId) {
  const signal = signals.find((candidate) => candidate.id === id);

  if (!signal) {
    throw new Error(`Missing homepage signal: ${id}`);
  }

  return signal;
}

function formatHomePageHandoffCount(count: number) {
  return m.home_handoff_count_value({
    count: Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0)),
  });
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
  const principles: RoadmapPrincipleView[] = [
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
  ];

  return {
    columns,
    handoffView: buildRoadmapPublicHandoffView({
      columns,
      hero,
      principles,
      snapshots,
      validation,
    }),
    hero,
    principles,
    snapshots,
    validation,
  };
}

function buildRoadmapPublicHandoffView({
  columns,
  hero,
  principles,
  snapshots,
  validation,
}: Pick<
  RoadmapPageViewModel,
  'columns' | 'hero' | 'principles' | 'snapshots' | 'validation'
>): RoadmapPublicHandoffView {
  const itemViews = ROADMAP_PUBLIC_HANDOFF_ITEM_IDS.map((id) =>
    buildRoadmapPublicHandoffItemView({
      columns,
      hero,
      id,
      principles,
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
  'columns' | 'hero' | 'principles' | 'snapshots' | 'validation'
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
    case 'roadmap-surface':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_roadmap_surface_description(),
        id: context.id,
        label: m.roadmap_handoff_roadmap_surface_label(),
        value: m.roadmap_handoff_roadmap_surface_value(),
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
    case 'column-board':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_column_board_description({
          columnCount: context.columns.length,
        }),
        id: context.id,
        label: m.roadmap_handoff_column_board_label(),
        value: m.roadmap_handoff_column_board_value({
          columnCount: context.columns.length,
        }),
      });
    case 'status-label-boundary':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_status_label_boundary_description(),
        id: context.id,
        label: m.roadmap_handoff_status_label_boundary_label(),
        value: m.roadmap_handoff_status_label_boundary_value(),
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
    case 'task-evidence-boundary':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_task_evidence_boundary_description(),
        id: context.id,
        label: m.roadmap_handoff_task_evidence_boundary_label(),
        value: m.roadmap_handoff_task_evidence_boundary_value(),
      });
    case 'task-next-step-boundary':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_task_next_step_boundary_description(),
        id: context.id,
        label: m.roadmap_handoff_task_next_step_boundary_label(),
        value: m.roadmap_handoff_task_next_step_boundary_value(),
      });
    case 'hero-action-boundary':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_hero_action_boundary_description({
          createRoute: context.hero.primaryAction.to,
          templatesRoute: context.hero.secondaryAction.to,
        }),
        id: context.id,
        label: m.roadmap_handoff_hero_action_boundary_label(),
        value: m.roadmap_handoff_hero_action_boundary_value(),
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
    case 'snapshot-panel':
      return buildRoadmapPublicHandoffItem({
        description: m.roadmap_handoff_snapshot_panel_description({
          snapshotCount: context.snapshots.length,
        }),
        id: context.id,
        label: m.roadmap_handoff_snapshot_panel_label(),
        value: m.roadmap_handoff_snapshot_panel_value({
          snapshotCount: context.snapshots.length,
        }),
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
    case 'principle-focus-boundary':
      return buildRoadmapPublicHandoffPrincipleItem({
        id: context.id,
        label: m.roadmap_handoff_principle_focus_boundary_label(),
        principle: getRoadmapPublicHandoffPrinciple(
          context.principles,
          'focus'
        ),
      });
    case 'principle-model-boundary':
      return buildRoadmapPublicHandoffPrincipleItem({
        id: context.id,
        label: m.roadmap_handoff_principle_model_boundary_label(),
        principle: getRoadmapPublicHandoffPrinciple(
          context.principles,
          'learning'
        ),
      });
    case 'validation-decision-boundary':
      return buildRoadmapPublicHandoffItem({
        description: context.validation.description,
        id: context.id,
        label: m.roadmap_handoff_validation_decision_boundary_label(),
        value: context.validation.title,
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

function buildRoadmapPublicHandoffPrincipleItem({
  id,
  label,
  principle,
}: {
  id: RoadmapPublicHandoffItemId;
  label: string;
  principle: RoadmapPrincipleView;
}) {
  return buildRoadmapPublicHandoffItem({
    description: principle.description,
    id,
    label,
    value: principle.title,
  });
}

function buildRoadmapPublicHandoffPrivacyContract(
  itemViews: RoadmapPublicHandoffItemView[]
): RoadmapPublicHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    describesCurrentUsableLoop: true,
    describesPublicRoadmapSurface: true,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsLegacyCopyOut: true,
    keepsPlannedBetsExploratory: true,
    mutatesTeacherWorkspace: false,
    readsSourceMaterialFileBytes: false,
    rendersTaskEvidence: true,
    rendersTaskNextSteps: true,
    rendersValidationCriteria: true,
    routeActionsUseSharedConstants: true,
    scope: 'public-roadmap-product-boundary',
    usesPreparedViewModel: true,
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

function getRoadmapPublicHandoffPrinciple(
  principles: RoadmapPrincipleView[],
  id: RoadmapPrincipleId
) {
  const principle = principles.find((candidate) => candidate.id === id);

  if (!principle) {
    throw new Error(`Missing roadmap principle: ${id}`);
  }

  return principle;
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
  const hero = {
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
  };
  const schoolCta = {
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
  };
  const templatePanel = {
    ariaLabel: m.teachers_page_template_panel_aria_label({
      description: templatePanelDescription,
      title: templatePanelTitle,
    }),
    classroomModeLabel: m.teachers_page_template_panel_mode_label(),
    description: templatePanelDescription,
    templates: getActivityTemplates().map(buildTeachersTemplatePanelItemView),
    title: templatePanelTitle,
  };
  const useCaseSection = {
    ariaLabel: m.teachers_page_use_case_section_aria_label({
      description: useCaseSectionDescription,
      title: useCaseSectionTitle,
    }),
    description: useCaseSectionDescription,
    title: useCaseSectionTitle,
  };
  const useCases = [
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
  ];
  const workflowSection = {
    ariaLabel: m.teachers_page_workflow_section_aria_label({
      description: workflowSectionDescription,
      title: workflowSectionTitle,
    }),
    description: workflowSectionDescription,
    title: workflowSectionTitle,
  };
  const workflow = [
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
  ];

  return {
    handoffView: buildTeachersPageHandoffView({
      hero,
      schoolCta,
      templatePanel,
      useCaseSection,
      useCases,
      workflow,
      workflowSection,
    }),
    hero,
    schoolCta,
    templatePanel,
    useCaseSection,
    useCases,
    workflow,
    workflowSection,
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

function buildTeachersPageHandoffView({
  hero,
  schoolCta,
  templatePanel,
  useCaseSection,
  useCases,
  workflow,
  workflowSection,
}: Pick<
  TeachersPageViewModel,
  | 'hero'
  | 'schoolCta'
  | 'templatePanel'
  | 'useCaseSection'
  | 'useCases'
  | 'workflow'
  | 'workflowSection'
>): TeachersPageHandoffView {
  const itemViews = TEACHERS_PAGE_HANDOFF_ITEM_IDS.map((id) =>
    buildTeachersPageHandoffItemView({
      hero,
      id,
      schoolCta,
      templatePanel,
      useCaseSection,
      useCases,
      workflow,
      workflowSection,
    })
  );

  return {
    description: m.teachers_page_handoff_description(),
    itemViews,
    privacy: buildTeachersPageHandoffPrivacyContract(itemViews),
    title: m.teachers_page_handoff_title(),
  };
}

type TeachersPageHandoffBuildContext = Pick<
  TeachersPageViewModel,
  | 'hero'
  | 'schoolCta'
  | 'templatePanel'
  | 'useCaseSection'
  | 'useCases'
  | 'workflow'
  | 'workflowSection'
> & {
  id: TeachersPageHandoffItemId;
};

function buildTeachersPageHandoffItemView(
  context: TeachersPageHandoffBuildContext
): TeachersPageHandoffItemView {
  const label = getTeachersPageHandoffItemLabel(context);
  const description = getTeachersPageHandoffItemDescription(context);
  const value = getTeachersPageHandoffItemValue(context);

  return {
    ariaLabel: m.home_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function getTeachersPageHandoffItemLabel(
  context: TeachersPageHandoffBuildContext
) {
  switch (context.id) {
    case 'teachers-route':
      return m.teachers_page_seo_title();
    case 'teacher-audience':
      return m.teachers_page_eyebrow();
    case 'hero-positioning':
      return m.teachers_page_handoff_hero_positioning_label();
    case 'primary-create-action':
      return context.hero.primaryAction.label;
    case 'secondary-contact-action':
      return context.hero.secondaryAction.label;
    case 'workflow-section':
      return context.workflowSection.title;
    case 'workflow-draft':
      return getTeachersPageWorkflowItem(context.workflow, 'draft').title;
    case 'workflow-publish':
      return getTeachersPageWorkflowItem(context.workflow, 'publish').title;
    case 'workflow-share':
      return getTeachersPageWorkflowItem(context.workflow, 'share').title;
    case 'use-case-section':
      return context.useCaseSection.title;
    case 'use-case-classrooms':
      return getTeachersPageUseCaseItem(context.useCases, 'classrooms').title;
    case 'use-case-games':
      return getTeachersPageUseCaseItem(context.useCases, 'games').title;
    case 'use-case-results':
      return getTeachersPageUseCaseItem(context.useCases, 'results').title;
    case 'template-panel':
      return context.templatePanel.title;
    case 'template-count':
      return m.teachers_page_handoff_template_count_label();
    case 'template-classroom-mode-label':
      return context.templatePanel.classroomModeLabel;
    case 'template-mode-coverage':
      return m.teachers_page_handoff_template_mode_coverage_label();
    case 'template-quiz':
    case 'template-match-up':
    case 'template-group-sort':
    case 'template-fill-blank':
    case 'template-listening':
    case 'template-matching-pairs':
    case 'template-line-match':
    case 'template-open-box':
      return getTeachersPageTemplateHandoffItem(context).name;
    case 'school-cta':
      return context.schoolCta.title;
    case 'school-contact-route':
      return context.schoolCta.action.label;
    case 'activity-assignment-loop':
      return m.teachers_page_handoff_activity_assignment_loop_label();
    case 'legacy-copy-guard':
      return m.teachers_page_handoff_legacy_copy_guard_label();
    case 'privacy-guard':
      return m.teachers_page_handoff_privacy_guard_label();
  }
}

function getTeachersPageHandoffItemDescription(
  context: TeachersPageHandoffBuildContext
) {
  switch (context.id) {
    case 'teachers-route':
      return m.teachers_page_handoff_route_description();
    case 'teacher-audience':
      return m.teachers_page_handoff_teacher_audience_description();
    case 'hero-positioning':
      return context.hero.description;
    case 'primary-create-action':
      return context.hero.primaryAction.ariaLabel;
    case 'secondary-contact-action':
      return context.hero.secondaryAction.ariaLabel;
    case 'workflow-section':
      return context.workflowSection.description;
    case 'workflow-draft':
      return getTeachersPageWorkflowItem(context.workflow, 'draft').description;
    case 'workflow-publish':
      return getTeachersPageWorkflowItem(context.workflow, 'publish')
        .description;
    case 'workflow-share':
      return getTeachersPageWorkflowItem(context.workflow, 'share').description;
    case 'use-case-section':
      return context.useCaseSection.description;
    case 'use-case-classrooms':
      return getTeachersPageUseCaseItem(context.useCases, 'classrooms')
        .description;
    case 'use-case-games':
      return getTeachersPageUseCaseItem(context.useCases, 'games').description;
    case 'use-case-results':
      return getTeachersPageUseCaseItem(context.useCases, 'results')
        .description;
    case 'template-panel':
      return context.templatePanel.description;
    case 'template-count':
      return m.teachers_page_handoff_template_count_description();
    case 'template-classroom-mode-label':
      return m.teachers_page_handoff_template_mode_label_description();
    case 'template-mode-coverage':
      return m.teachers_page_handoff_template_mode_coverage_description();
    case 'template-quiz':
    case 'template-match-up':
    case 'template-group-sort':
    case 'template-fill-blank':
    case 'template-listening':
    case 'template-matching-pairs':
    case 'template-line-match':
    case 'template-open-box':
      return getTeachersPageTemplateHandoffItem(context).ariaLabel;
    case 'school-cta':
      return context.schoolCta.description;
    case 'school-contact-route':
      return context.schoolCta.action.ariaLabel;
    case 'activity-assignment-loop':
      return m.teachers_page_handoff_activity_assignment_loop_description();
    case 'legacy-copy-guard':
      return m.teachers_page_handoff_legacy_copy_guard_description();
    case 'privacy-guard':
      return m.teachers_page_handoff_privacy_guard_description();
  }
}

function getTeachersPageHandoffItemValue(
  context: TeachersPageHandoffBuildContext
) {
  switch (context.id) {
    case 'teachers-route':
      return Routes.Teachers;
    case 'teacher-audience':
      return m.teachers_page_audience_type();
    case 'hero-positioning':
      return context.hero.title;
    case 'primary-create-action':
      return context.hero.primaryAction.to;
    case 'secondary-contact-action':
      return context.hero.secondaryAction.to;
    case 'workflow-section':
      return formatHomePageHandoffCount(context.workflow.length);
    case 'workflow-draft':
      return getTeachersPageWorkflowItem(context.workflow, 'draft').title;
    case 'workflow-publish':
      return getTeachersPageWorkflowItem(context.workflow, 'publish').title;
    case 'workflow-share':
      return getTeachersPageWorkflowItem(context.workflow, 'share').title;
    case 'use-case-section':
      return formatHomePageHandoffCount(context.useCases.length);
    case 'use-case-classrooms':
      return getTeachersPageUseCaseItem(context.useCases, 'classrooms').title;
    case 'use-case-games':
      return getTeachersPageUseCaseItem(context.useCases, 'games').title;
    case 'use-case-results':
      return getTeachersPageUseCaseItem(context.useCases, 'results').title;
    case 'template-panel':
      return context.templatePanel.title;
    case 'template-count':
      return formatHomePageHandoffCount(context.templatePanel.templates.length);
    case 'template-classroom-mode-label':
      return context.templatePanel.classroomModeLabel;
    case 'template-mode-coverage':
      return m.teachers_page_handoff_template_mode_coverage_value({
        count: context.templatePanel.templates.length,
      });
    case 'template-quiz':
    case 'template-match-up':
    case 'template-group-sort':
    case 'template-fill-blank':
    case 'template-listening':
    case 'template-matching-pairs':
    case 'template-line-match':
    case 'template-open-box':
      return getTeachersPageTemplateHandoffItem(context).name;
    case 'school-cta':
      return context.schoolCta.title;
    case 'school-contact-route':
      return context.schoolCta.action.to;
    case 'activity-assignment-loop':
      return 'Activity -> Assignment -> Attempt -> Results';
    case 'legacy-copy-guard':
      return m.teachers_page_handoff_legacy_copy_guard_value();
    case 'privacy-guard':
      return m.teachers_page_handoff_privacy_guard_value();
  }
}

function buildTeachersPageHandoffPrivacyContract(
  itemViews: TeachersPageHandoffItemView[]
): TeachersPageHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesTeacherWorkspace: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-teachers-product-loop',
    templateModesComeFromCatalog: true,
    usesClassGamifyCopy: true,
    usesPreparedViewModel: true,
  };
}

function getTeachersPageTemplateHandoffItem(
  context: TeachersPageHandoffBuildContext
) {
  return getTeachersPageTemplatePanelItem(
    context.templatePanel.templates,
    getTeachersPageTemplateTypeForHandoffItem(context.id)
  );
}

function getTeachersPageTemplateTypeForHandoffItem(
  id: TeachersPageHandoffItemId
): ActivityTemplateType {
  switch (id) {
    case 'template-quiz':
      return 'quiz';
    case 'template-match-up':
      return 'match-up';
    case 'template-group-sort':
      return 'group-sort';
    case 'template-fill-blank':
      return 'fill-blank';
    case 'template-listening':
      return 'listening';
    case 'template-matching-pairs':
      return 'matching-pairs';
    case 'template-line-match':
      return 'line-match';
    case 'template-open-box':
      return 'open-box';
    case 'activity-assignment-loop':
    case 'hero-positioning':
    case 'legacy-copy-guard':
    case 'primary-create-action':
    case 'privacy-guard':
    case 'school-contact-route':
    case 'school-cta':
    case 'secondary-contact-action':
    case 'teacher-audience':
    case 'teachers-route':
    case 'template-classroom-mode-label':
    case 'template-count':
    case 'template-mode-coverage':
    case 'template-panel':
    case 'use-case-classrooms':
    case 'use-case-games':
    case 'use-case-results':
    case 'use-case-section':
    case 'workflow-draft':
    case 'workflow-publish':
    case 'workflow-section':
    case 'workflow-share':
      throw new Error(`Unsupported teacher template handoff item: ${id}`);
  }
}

function getTeachersPageTemplatePanelItem(
  templates: TeachersTemplatePanelItemView[],
  templateType: ActivityTemplateType
) {
  const template = templates.find((item) => item.templateType === templateType);

  if (!template) {
    throw new Error(
      `Missing teacher page template handoff item: ${templateType}`
    );
  }

  return template;
}

function getTeachersPageUseCaseItem(
  useCases: TeachersPageItemView<TeachersPageUseCaseId>[],
  id: TeachersPageUseCaseId
) {
  const useCase = useCases.find((item) => item.id === id);

  if (!useCase) {
    throw new Error(`Missing teacher page use case: ${id}`);
  }

  return useCase;
}

function getTeachersPageWorkflowItem(
  workflow: TeachersPageItemView<TeachersPageWorkflowId>[],
  id: TeachersPageWorkflowId
) {
  const workflowItem = workflow.find((item) => item.id === id);

  if (!workflowItem) {
    throw new Error(`Missing teacher page workflow item: ${id}`);
  }

  return workflowItem;
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
    handoffView: buildPricingPageHandoffView({
      faqItems: buildPricingFaqItems(),
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
      valueCards,
      valueSection: {
        ariaLabel: m.pricing_value_section_aria_label({
          description: valueSectionDescription,
          title: valueSectionTitle,
        }),
        description: valueSectionDescription,
        title: valueSectionTitle,
      },
    }),
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

function buildPricingPageHandoffView({
  faqItems,
  schoolCta,
  valueCards,
  valueSection,
}: Pick<PricingPageViewModel, 'schoolCta' | 'valueCards' | 'valueSection'> & {
  faqItems: PricingFaqItemView[];
}): PricingPageHandoffView {
  const plans = getAllPricePlans();
  const itemViews = PRICING_PAGE_HANDOFF_ITEM_IDS.map((id) =>
    buildPricingPageHandoffItemView({
      faqItems,
      id,
      plans,
      schoolCta,
      valueCards,
      valueSection,
    })
  );

  return {
    description: m.pricing_subtitle(),
    itemViews,
    privacy: buildPricingPageHandoffPrivacyContract(itemViews),
    title: m.pricing_title(),
  };
}

type PricingPageHandoffBuildContext = Pick<
  PricingPageViewModel,
  'schoolCta' | 'valueCards' | 'valueSection'
> & {
  faqItems: PricingFaqItemView[];
  id: PricingPageHandoffItemId;
  plans: PricePlan[];
};

function buildPricingPageHandoffItemView(
  context: PricingPageHandoffBuildContext
): PricingPageHandoffItemView {
  const label = getPricingPageHandoffItemLabel(context);
  const description = getPricingPageHandoffItemDescription(context);
  const value = getPricingPageHandoffItemValue(context);

  return {
    ariaLabel: m.home_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function getPricingPageHandoffItemLabel(
  context: PricingPageHandoffBuildContext
) {
  switch (context.id) {
    case 'pricing-route':
      return m.nav_pricing();
    case 'product-loop':
      return m.home_handoff_product_loop_label();
    case 'hero-positioning':
      return m.pricing_eyebrow();
    case 'value-section':
      return context.valueSection.title;
    case 'template-value':
      return getPricingValueCard(context.valueCards, 'templates').title;
    case 'assignment-value':
      return getPricingValueCard(context.valueCards, 'assignments').title;
    case 'ai-value':
      return getPricingValueCard(context.valueCards, 'ai').title;
    case 'plan-source':
    case 'plan-count':
      return m.settings_billing_handoff_plan_source_label();
    case 'free-plan-boundary':
      return m.settings_billing_handoff_free_plan_boundary_label();
    case 'pro-plan-boundary':
      return m.settings_billing_handoff_pro_plan_boundary_label();
    case 'lifetime-plan-boundary':
      return m.settings_billing_handoff_lifetime_plan_boundary_label();
    case 'subscription-price-path':
    case 'one-time-price-path':
    case 'authenticated-checkout':
    case 'hosted-checkout':
      return m.settings_billing_handoff_hosted_checkout_label();
    case 'free-preview-action':
      return m.pricing_card_get_started_for_free();
    case 'payment-provider-boundary':
      return m.settings_billing_handoff_provider_boundary_label();
    case 'current-plan-context':
      return m.settings_billing_handoff_current_plan_card_label();
    case 'billing-return-path':
      return m.settings_billing_handoff_payment_callback_label();
    case 'school-cta-path':
      return context.schoolCta.title;
    case 'faq-boundary':
      return m.pricing_faq_title();
    case 'student-account-boundary':
      return getPricingFaqItem(context.faqItems, 'student-accounts').question;
    case 'activity-library-access':
      return m.settings_billing_handoff_activity_library_access_label();
    case 'assignment-workflow-access':
      return m.settings_billing_handoff_assignment_workflow_access_label();
    case 'ai-draft-access':
      return m.settings_billing_handoff_ai_draft_access_label();
    case 'result-export-access':
      return m.settings_billing_handoff_result_export_access_label();
    case 'source-material-access':
      return m.settings_billing_handoff_source_material_access_label();
    case 'legacy-copy-guard':
      return m.home_handoff_legacy_guard_label();
    case 'privacy-guard':
      return m.settings_billing_handoff_privacy_guard_label();
  }
}

function getPricingPageHandoffItemDescription(
  context: PricingPageHandoffBuildContext
) {
  switch (context.id) {
    case 'pricing-route':
      return m.pricing_description();
    case 'product-loop':
      return m.home_handoff_product_loop_description();
    case 'hero-positioning':
      return m.pricing_subtitle();
    case 'value-section':
      return context.valueSection.description;
    case 'template-value':
      return getPricingValueCard(context.valueCards, 'templates').description;
    case 'assignment-value':
      return getPricingValueCard(context.valueCards, 'assignments').description;
    case 'ai-value':
      return getPricingValueCard(context.valueCards, 'ai').description;
    case 'plan-source':
    case 'plan-count':
      return m.settings_billing_handoff_plan_source_description();
    case 'free-plan-boundary':
      return m.settings_billing_handoff_free_plan_boundary_description();
    case 'pro-plan-boundary':
      return m.settings_billing_handoff_pro_plan_boundary_description();
    case 'lifetime-plan-boundary':
      return m.settings_billing_handoff_lifetime_plan_boundary_description();
    case 'subscription-price-path':
    case 'one-time-price-path':
    case 'authenticated-checkout':
    case 'hosted-checkout':
      return m.settings_billing_handoff_hosted_checkout_description();
    case 'free-preview-action':
      return m.pricing_faq_free_answer();
    case 'payment-provider-boundary':
      return m.settings_billing_handoff_provider_boundary_description();
    case 'current-plan-context':
      return m.settings_billing_handoff_current_plan_card_description();
    case 'billing-return-path':
      return m.settings_billing_handoff_payment_callback_description();
    case 'school-cta-path':
      return context.schoolCta.description;
    case 'faq-boundary':
      return m.pricing_faq_description();
    case 'student-account-boundary':
      return getPricingFaqItem(context.faqItems, 'student-accounts').answer;
    case 'activity-library-access':
      return m.settings_billing_handoff_activity_library_access_description();
    case 'assignment-workflow-access':
      return m.settings_billing_handoff_assignment_workflow_access_description();
    case 'ai-draft-access':
      return m.settings_billing_handoff_ai_draft_access_description();
    case 'result-export-access':
      return m.settings_billing_handoff_result_export_access_description();
    case 'source-material-access':
      return m.settings_billing_handoff_source_material_access_description();
    case 'legacy-copy-guard':
      return m.home_handoff_legacy_guard_description();
    case 'privacy-guard':
      return m.settings_billing_handoff_privacy_guard_description();
  }
}

function getPricingPageHandoffItemValue(
  context: PricingPageHandoffBuildContext
) {
  switch (context.id) {
    case 'pricing-route':
      return Routes.Pricing;
    case 'product-loop':
      return 'Activity -> Assignment -> Attempt -> Results';
    case 'hero-positioning':
      return m.pricing_title();
    case 'value-section':
      return formatPricingHandoffCount(context.valueCards.length);
    case 'template-value':
      return getPricingValueCard(context.valueCards, 'templates').title;
    case 'assignment-value':
      return getPricingValueCard(context.valueCards, 'assignments').title;
    case 'ai-value':
      return getPricingValueCard(context.valueCards, 'ai').title;
    case 'plan-source':
      return m.pricing_eyebrow();
    case 'plan-count':
      return formatPricingHandoffCount(countEnabledPricingPlans(context.plans));
    case 'free-plan-boundary':
      return getPricingPlanValue(context.plans, 'free');
    case 'pro-plan-boundary':
      return getPricingPlanValue(context.plans, 'pro');
    case 'lifetime-plan-boundary':
      return getPricingPlanValue(context.plans, 'lifetime');
    case 'subscription-price-path':
      return formatPricingHandoffCount(
        countPricingPrices(context.plans, PaymentTypes.SUBSCRIPTION)
      );
    case 'one-time-price-path':
      return formatPricingHandoffCount(
        countPricingPrices(context.plans, PaymentTypes.ONE_TIME)
      );
    case 'free-preview-action':
      return Routes.Create;
    case 'authenticated-checkout':
      return m.pricing_trust_checkout();
    case 'hosted-checkout':
      return m.pricing_trust_secure();
    case 'payment-provider-boundary':
      return m.settings_billing_handoff_provider_boundary_value();
    case 'current-plan-context':
      return m.pricing_card_your_current_plan();
    case 'billing-return-path':
      return Routes.Payment;
    case 'school-cta-path':
      return context.schoolCta.action.to;
    case 'faq-boundary':
      return formatPricingHandoffCount(context.faqItems.length);
    case 'student-account-boundary':
      return getPricingFaqItem(context.faqItems, 'student-accounts').question;
    case 'activity-library-access':
      return m.settings_billing_workspace_summary_activities_label();
    case 'assignment-workflow-access':
      return m.settings_billing_workspace_summary_assignments_label();
    case 'ai-draft-access':
      return m.settings_billing_handoff_ai_draft_access_value();
    case 'result-export-access':
      return m.settings_billing_handoff_result_export_access_value();
    case 'source-material-access':
      return m.settings_billing_handoff_source_material_access_value();
    case 'legacy-copy-guard':
      return m.home_handoff_legacy_guard_value();
    case 'privacy-guard':
      return m.settings_billing_handoff_privacy_guard_value();
  }
}

function buildPricingPageHandoffPrivacyContract(
  itemViews: PricingPageHandoffItemView[]
): PricingPageHandoffPrivacyContract {
  return {
    exposesAnswerKeys: false,
    exposesCheckoutSessionIds: false,
    exposesPaymentProviderSecrets: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesTeacherData: false,
    publishesAssignmentLinks: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-pricing-plan-boundary',
  };
}

function getPricingValueCard(
  valueCards: PricingValueCardView[],
  id: PricingValueCardId
) {
  const valueCard = valueCards.find((card) => card.id === id);

  if (!valueCard) {
    throw new Error(`Missing pricing value card: ${id}`);
  }

  return valueCard;
}

function getPricingFaqItem(
  faqItems: PricingFaqItemView[],
  id: PricingFaqItemId
) {
  const faqItem = faqItems.find((item) => item.id === id);

  if (!faqItem) {
    throw new Error(`Missing pricing FAQ item: ${id}`);
  }

  return faqItem;
}

function getPricingPlanValue(plans: PricePlan[], id: string) {
  const plan = plans.find((item) => item.id === id);

  return plan?.name ?? id;
}

function countEnabledPricingPlans(plans: PricePlan[]) {
  return plans.filter((plan) => !plan.disabled).length;
}

function countPricingPrices(
  plans: PricePlan[],
  type: typeof PaymentTypes.ONE_TIME | typeof PaymentTypes.SUBSCRIPTION
) {
  return plans.reduce(
    (total, plan) =>
      total +
      plan.prices.filter((price) => !price.disabled && price.type === type)
        .length,
    0
  );
}

function formatPricingHandoffCount(count: number) {
  return m.home_handoff_count_value({
    count: Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0)),
  });
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
