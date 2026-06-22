import { getTemplateRemixPlan } from '@/activities/template-remix';
import type { TemplateRemixPlan } from '@/activities/template-remix';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';
import {
  buildActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';
import { m } from '@/locale/paraglide/messages';

export type ActivityDraftMeta = {
  coverage: {
    groups: number;
    pairs: number;
    questions: number;
    teacherNotes: number;
    vocabulary: number;
  };
  readyTemplateCount: number;
  readyTemplateOptions: ActivityDraftTemplateOption[];
  readyTemplates: string[];
  reviewChecklist: string[];
  suggestedTemplateCount: number;
  suggestedTemplateOptions: ActivityDraftTemplateOption[];
  suggestedTemplates: string[];
  templateReadiness: ActivityDraftTemplateReadiness[];
};

export type ActivityDraftTemplateOption = {
  shortName: string;
  template: ActivityTemplateType;
};

export type ActivityDraftTemplateReadiness = {
  diagnosis: string;
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementCount: number;
  missingRequirements: string[];
  readinessLabel: string;
  shortName: string;
  template: ActivityTemplateType;
};

export type ActivityTemplateReadinessPanelOption = {
  shortName: string;
  template: ActivityTemplateType;
};

export type ActivityTemplateReadinessPanelLockedOption = {
  diagnosis: string;
  template: ActivityTemplateType;
};

export type ActivityTemplateReadinessPanelSummary = {
  description: string;
  emptyText: string;
  lockedOptions: ActivityTemplateReadinessPanelLockedOption[];
  readyCount: number;
  readyCountLabel: string;
  readyOptions: ActivityTemplateReadinessPanelOption[];
  title: string;
};

type ActivityDraftProvider = 'fallback' | 'workers-ai';

type ActivityDraftMetaSummaryReadinessOption = {
  diagnosis?: string;
  isCurrent: boolean;
  isReady: boolean;
  readinessLabel: string;
  selectedLabel?: string;
  shortName: string;
  template: ActivityTemplateType;
};

type ActivityDraftMetaSummaryView = {
  coverageStats: Array<{
    label: string;
    value: number;
  }>;
  description: string;
  modelLabel: string;
  modelName: string;
  notice?: string;
  providerLabel: string;
  readyTemplateLabel: string;
  reviewChecklist: string[];
  suggestedTemplateOptions: ActivityDraftTemplateOption[];
  templateReadinessOptions: ActivityDraftMetaSummaryReadinessOption[];
  title: string;
};

export function buildActivityDraftMeta({
  activity,
  currentTemplateType,
}: {
  activity: CreateActivityInput;
  currentTemplateType: ActivityTemplateType;
}): ActivityDraftMeta {
  const content = buildActivityContent(activity);
  const remixPlan = getTemplateRemixPlan({
    content,
    currentTemplateType,
  });
  const suggestedTemplates = remixPlan.suggestedOptions.map(
    (option) => option.template.shortName
  );
  const suggestedTemplateOptions = remixPlan.suggestedOptions.map((option) => ({
    shortName: option.template.shortName,
    template: option.template.type,
  }));
  const readyTemplates = remixPlan.readyOptions.map(
    (option) => option.template.shortName
  );
  const readyTemplateOptions = remixPlan.readyOptions.map((option) => ({
    shortName: option.template.shortName,
    template: option.template.type,
  }));
  const lockedTemplateDiagnostics = remixPlan.options
    .filter((option) => !option.isReady)
    .map((option) => option.diagnosis);

  return {
    coverage: {
      groups: content.groups.length,
      pairs: content.pairs.length,
      questions: content.questions.length,
      teacherNotes: content.teacherNotes.length,
      vocabulary: content.vocabulary.length,
    },
    readyTemplateCount: remixPlan.readyOptions.length,
    readyTemplateOptions,
    readyTemplates,
    reviewChecklist: buildDraftReviewChecklist({
      content,
      lockedTemplateDiagnostics,
      suggestedTemplates,
    }),
    suggestedTemplateCount: suggestedTemplates.length,
    suggestedTemplateOptions,
    suggestedTemplates,
    templateReadiness: remixPlan.options.map((option) => ({
      diagnosis: option.diagnosis,
      isCurrent: option.isCurrent,
      isReady: option.isReady,
      missingRequirementCount: option.missingRequirementCount,
      missingRequirements: option.missingRequirementLabels,
      readinessLabel: option.readinessLabel,
      shortName: option.template.shortName,
      template: option.template.type,
    })),
  };
}

export function buildActivityDraftMetaSummaryView({
  meta,
  model,
  notice,
  provider,
}: {
  meta: ActivityDraftMeta;
  model: string;
  notice?: string;
  provider: ActivityDraftProvider;
}): ActivityDraftMetaSummaryView {
  return {
    coverageStats: [
      {
        label: m.activity_draft_meta_coverage_questions(),
        value: meta.coverage.questions,
      },
      {
        label: m.activity_draft_meta_coverage_pairs(),
        value: meta.coverage.pairs,
      },
      {
        label: m.activity_draft_meta_coverage_groups(),
        value: meta.coverage.groups,
      },
      {
        label: m.activity_draft_meta_coverage_vocab(),
        value: meta.coverage.vocabulary,
      },
      {
        label: m.activity_draft_meta_coverage_notes(),
        value: meta.coverage.teacherNotes,
      },
    ],
    description: m.activity_draft_meta_description(),
    modelLabel: m.activity_draft_meta_model_label(),
    modelName: model.trim() || m.activity_draft_meta_unknown_model(),
    notice,
    providerLabel:
      provider === 'workers-ai'
        ? m.activity_draft_meta_provider_workers_ai()
        : m.activity_draft_meta_provider_fallback(),
    readyTemplateLabel:
      meta.readyTemplateCount === 1
        ? m.activity_draft_meta_ready_template_label_one({
            count: meta.readyTemplateCount,
          })
        : m.activity_draft_meta_ready_template_label_many({
            count: meta.readyTemplateCount,
          }),
    reviewChecklist: meta.reviewChecklist,
    suggestedTemplateOptions: meta.suggestedTemplateOptions,
    templateReadinessOptions: meta.templateReadiness.map((option) => ({
      diagnosis: option.isReady ? undefined : option.diagnosis,
      isCurrent: option.isCurrent,
      isReady: option.isReady,
      readinessLabel: option.readinessLabel,
      selectedLabel: option.isCurrent
        ? m.activity_draft_meta_selected_label()
        : undefined,
      shortName: option.shortName,
      template: option.template,
    })),
    title: m.activity_draft_meta_title(),
  };
}

export function buildActivityTemplateReadinessPanelSummary(
  remixPlan: TemplateRemixPlan | null
): ActivityTemplateReadinessPanelSummary {
  const readyOptions =
    remixPlan?.readyOptions.map((option) => ({
      shortName: option.template.shortName,
      template: option.template.type,
    })) ?? [];
  const lockedOptions =
    remixPlan?.options
      .filter((option) => !option.isReady)
      .map((option) => ({
        diagnosis: option.diagnosis,
        template: option.template.type,
      })) ?? [];

  return {
    description: m.activity_template_readiness_panel_description(),
    emptyText: m.activity_template_readiness_panel_empty(),
    lockedOptions,
    readyCount: readyOptions.length,
    readyCountLabel: m.activity_template_readiness_panel_ready_label({
      count: readyOptions.length,
    }),
    readyOptions,
    title: m.activity_template_readiness_panel_title(),
  };
}

function buildDraftReviewChecklist({
  content,
  lockedTemplateDiagnostics,
  suggestedTemplates,
}: {
  content: ActivityContent;
  lockedTemplateDiagnostics: string[];
  suggestedTemplates: string[];
}) {
  const checklist = [
    m.activity_draft_meta_checklist_review_answers(),
    m.activity_draft_meta_checklist_adjust_level(),
    buildQuestionReviewChecklistItem(content),
  ];

  if (suggestedTemplates.length > 0) {
    checklist.push(
      m.activity_draft_meta_checklist_ready_to_remix({
        templates: suggestedTemplates.join(', '),
      })
    );

    if (lockedTemplateDiagnostics[0]) {
      checklist.push(
        m.activity_draft_meta_checklist_next_gap({
          diagnosis: lockedTemplateDiagnostics[0],
        })
      );
    }

    return checklist;
  }

  checklist.push(
    lockedTemplateDiagnostics[0] ??
      m.activity_draft_meta_checklist_add_more_structure()
  );

  return checklist;
}

function buildQuestionReviewChecklistItem(content: ActivityContent) {
  if (content.questions.length === 0) {
    return m.activity_draft_meta_checklist_add_questions();
  }

  if (content.questions.some((question) => !question.explanation)) {
    return m.activity_draft_meta_checklist_add_explanations();
  }

  return m.activity_draft_meta_checklist_check_explanations();
}
