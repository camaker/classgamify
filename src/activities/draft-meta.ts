import {
  buildTemplateRemixSummary,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import {
  formatActivityAiDraftFocusDescription,
  formatActivityAiDraftFocusLabel,
  type ActivityAiDraftFocus,
} from '@/activities/ai-draft-focus';
import {
  isSafeActivitySourceMaterialDraftKind,
  type ActivitySourceMaterialDraftNoteView,
} from '@/activities/draft-source';
import type {
  TemplateRemixLockedOption,
  TemplateRemixPlan,
  TemplateRemixTemplateOption,
} from '@/activities/template-remix';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';
import {
  buildActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';
import {
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeDisplayText,
} from '@/activities/runtime-display';
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

export type ActivityDraftTemplateOption = TemplateRemixTemplateOption;

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

export type ActivityTemplateReadinessPanelOption = TemplateRemixTemplateOption;

export type ActivityTemplateReadinessPanelLockedOption =
  TemplateRemixLockedOption;

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
  diagnosis: string;
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementCount: number;
  missingRequirementLabel?: string;
  readinessLabel: string;
  selectedLabel?: string;
  shortName: string;
  template: ActivityTemplateType;
};

type ActivityDraftMetaSummarySourceMaterialNoteView =
  ActivitySourceMaterialDraftNoteView & {
    displayText: string;
  };

type ActivityDraftMetaSummaryView = {
  appliedDescription: string;
  appliedLabel: string;
  coverageStats: Array<{
    label: string;
    value: number;
  }>;
  description: string;
  draftFocusDescription: string;
  draftFocusLabel: string;
  draftFocusLineText: string;
  draftFocusName: string;
  lockedTemplateLabel: string;
  lockedTemplateOptions: ActivityDraftMetaSummaryReadinessOption[];
  lockedTemplatesTitle: string;
  modelLabel: string;
  modelLineText: string;
  modelName: string;
  nextStepLabel: string;
  nextStepText: string;
  notice?: string;
  noticeLabel: string;
  noticeLineText?: string;
  providerDescription: string;
  providerLabel: string;
  readyTemplateLabel: string;
  readyTemplatesTitle: string;
  reviewChecklist: string[];
  sourceMaterialCountLabel?: string;
  sourceMaterialDescription: string;
  sourceMaterialNoteViews: ActivityDraftMetaSummarySourceMaterialNoteView[];
  sourceMaterialTitle: string;
  suggestedTemplateOptions: ActivityDraftTemplateOption[];
  suggestedTemplatesEmptyText: string;
  suggestedTemplatesTitle: string;
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
  const remixSummary = buildTemplateRemixSummary(remixPlan);
  const suggestedTemplates = remixSummary.suggestedTemplateOptions.map(
    (option) => option.shortName
  );
  const readyTemplates = remixSummary.readyTemplateOptions.map(
    (option) => option.shortName
  );

  return {
    coverage: {
      groups: content.groups.length,
      pairs: content.pairs.length,
      questions: content.questions.length,
      teacherNotes: content.teacherNotes.length,
      vocabulary: content.vocabulary.length,
    },
    readyTemplateCount: remixPlan.readyOptions.length,
    readyTemplateOptions: remixSummary.readyTemplateOptions,
    readyTemplates,
    reviewChecklist: buildDraftReviewChecklist({
      content,
      lockedTemplateDiagnostics: remixSummary.lockedTemplateDiagnostics,
      suggestedTemplates,
    }),
    suggestedTemplateCount: suggestedTemplates.length,
    suggestedTemplateOptions: remixSummary.suggestedTemplateOptions,
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
  draftFocus,
  meta,
  model,
  notice,
  provider,
  sourceMaterialNoteViews,
}: {
  draftFocus?: ActivityAiDraftFocus;
  meta: ActivityDraftMeta;
  model: string;
  notice?: string;
  provider: ActivityDraftProvider;
  sourceMaterialNoteViews?: ActivitySourceMaterialDraftNoteView[];
}): ActivityDraftMetaSummaryView {
  const readyTemplateCount = normalizeActivityDraftMetaCount(
    meta.readyTemplateCount
  );
  const normalizedTemplateReadinessOptions = meta.templateReadiness.map(
    (option) => buildActivityDraftMetaSummaryReadinessOption(option)
  );
  const lockedTemplateCount = normalizeActivityDraftMetaCount(
    normalizedTemplateReadinessOptions.filter((option) => !option.isReady)
      .length
  );
  const modelLabel = m.activity_draft_meta_model_label();
  const modelName =
    normalizeRuntimeDisplayText(model) || m.activity_draft_meta_unknown_model();
  const normalizedNotice = normalizeOptionalRuntimeDisplayText(notice);
  const noticeLabel = m.activity_draft_meta_notice_label();
  const normalizedDraftFocus = draftFocus ?? 'balanced';
  const draftFocusLabel = m.activity_draft_meta_focus_label();
  const draftFocusName = formatActivityAiDraftFocusLabel(normalizedDraftFocus);
  const normalizedSourceMaterialNoteViews =
    normalizeActivityDraftSourceMaterialNoteViews(sourceMaterialNoteViews);

  return {
    appliedDescription: m.activity_draft_meta_applied_description(),
    appliedLabel: m.activity_draft_meta_applied_label(),
    coverageStats: [
      {
        label: m.activity_draft_meta_coverage_questions(),
        value: normalizeActivityDraftMetaCount(meta.coverage.questions),
      },
      {
        label: m.activity_draft_meta_coverage_pairs(),
        value: normalizeActivityDraftMetaCount(meta.coverage.pairs),
      },
      {
        label: m.activity_draft_meta_coverage_groups(),
        value: normalizeActivityDraftMetaCount(meta.coverage.groups),
      },
      {
        label: m.activity_draft_meta_coverage_vocab(),
        value: normalizeActivityDraftMetaCount(meta.coverage.vocabulary),
      },
      {
        label: m.activity_draft_meta_coverage_notes(),
        value: normalizeActivityDraftMetaCount(meta.coverage.teacherNotes),
      },
    ],
    description: m.activity_draft_meta_description(),
    draftFocusDescription:
      formatActivityAiDraftFocusDescription(normalizedDraftFocus),
    draftFocusLabel,
    draftFocusLineText: m.activity_draft_meta_focus_line({
      label: draftFocusLabel,
      value: draftFocusName,
    }),
    draftFocusName,
    lockedTemplateLabel:
      lockedTemplateCount === 1
        ? m.activity_draft_meta_locked_template_label_one({
            count: lockedTemplateCount,
          })
        : m.activity_draft_meta_locked_template_label_many({
            count: lockedTemplateCount,
          }),
    lockedTemplateOptions: normalizedTemplateReadinessOptions.filter(
      (option) => !option.isReady
    ),
    lockedTemplatesTitle: m.activity_draft_meta_locked_templates_title(),
    modelLabel,
    modelLineText: m.activity_draft_meta_model_line({
      label: modelLabel,
      value: modelName,
    }),
    modelName,
    nextStepLabel: m.activity_draft_meta_next_step_label(),
    nextStepText: m.activity_draft_meta_next_step_save(),
    notice: normalizedNotice,
    noticeLabel,
    noticeLineText: normalizedNotice
      ? m.activity_draft_meta_notice_line({
          label: noticeLabel,
          value: normalizedNotice,
        })
      : undefined,
    providerDescription: buildActivityDraftProviderDescription({
      notice: normalizedNotice,
      provider,
    }),
    providerLabel:
      provider === 'workers-ai'
        ? m.activity_draft_meta_provider_workers_ai()
        : m.activity_draft_meta_provider_fallback(),
    readyTemplateLabel:
      readyTemplateCount === 1
        ? m.activity_draft_meta_ready_template_label_one({
            count: readyTemplateCount,
          })
        : m.activity_draft_meta_ready_template_label_many({
            count: readyTemplateCount,
          }),
    readyTemplatesTitle: m.activity_draft_meta_ready_templates_title(),
    reviewChecklist: meta.reviewChecklist,
    sourceMaterialCountLabel:
      normalizedSourceMaterialNoteViews.length > 0
        ? buildActivityDraftSourceMaterialCountLabel(
            normalizedSourceMaterialNoteViews.length
          )
        : undefined,
    sourceMaterialDescription:
      m.activity_draft_meta_source_materials_description(),
    sourceMaterialNoteViews: normalizedSourceMaterialNoteViews,
    sourceMaterialTitle: m.activity_draft_meta_source_materials_title(),
    suggestedTemplateOptions: meta.suggestedTemplateOptions,
    suggestedTemplatesEmptyText:
      m.activity_draft_meta_suggested_templates_empty(),
    suggestedTemplatesTitle: m.activity_draft_meta_suggested_templates_title(),
    templateReadinessOptions: normalizedTemplateReadinessOptions,
    title: m.activity_draft_meta_title(),
  };
}

function normalizeActivityDraftMetaCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

function buildActivityDraftProviderDescription({
  notice,
  provider,
}: {
  notice?: string;
  provider: ActivityDraftProvider;
}) {
  if (provider === 'fallback') {
    return m.activity_draft_meta_provider_description_fallback();
  }

  if (notice) {
    return m.activity_draft_meta_provider_description_workers_ai_completed();
  }

  return m.activity_draft_meta_provider_description_workers_ai();
}

function buildActivityDraftMetaSummaryReadinessOption(
  option: ActivityDraftTemplateReadiness
): ActivityDraftMetaSummaryReadinessOption {
  const missingRequirementCount = normalizeActivityDraftMetaCount(
    option.missingRequirementCount
  );

  return {
    diagnosis: option.diagnosis,
    isCurrent: option.isCurrent,
    isReady: option.isReady,
    missingRequirementCount,
    missingRequirementLabel:
      missingRequirementCount > 0
        ? buildActivityDraftMissingRequirementLabel(missingRequirementCount)
        : undefined,
    readinessLabel: option.readinessLabel,
    selectedLabel: option.isCurrent
      ? m.activity_draft_meta_selected_label()
      : undefined,
    shortName: option.shortName,
    template: option.template,
  };
}

function buildActivityDraftMissingRequirementLabel(count: number) {
  return count === 1
    ? m.activity_draft_meta_missing_requirement_label_one({ count })
    : m.activity_draft_meta_missing_requirement_label_many({ count });
}

function buildActivityDraftSourceMaterialCountLabel(count: number) {
  return count === 1
    ? m.activity_draft_meta_source_materials_count_one({ count })
    : m.activity_draft_meta_source_materials_count_many({ count });
}

function normalizeActivityDraftSourceMaterialNoteViews(
  sourceMaterialNoteViews: ActivitySourceMaterialDraftNoteView[] | undefined
) {
  const normalizedNoteViews: ActivityDraftMetaSummarySourceMaterialNoteView[] =
    [];
  const seen = new Set<string>();

  for (const noteView of sourceMaterialNoteViews ?? []) {
    const kindLabel = normalizeRuntimeDisplayText(noteView.kindLabel);
    const name = normalizeRuntimeDisplayText(noteView.name);
    const key = `${kindLabel}\u0000${name}`.toLocaleLowerCase();

    if (
      !kindLabel ||
      !name ||
      !isSafeActivitySourceMaterialDraftKind(kindLabel) ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    normalizedNoteViews.push({
      displayText: m.activity_draft_meta_source_material_item({
        kind: kindLabel,
        name,
      }),
      kindLabel,
      name,
    });
  }

  return normalizedNoteViews;
}

export function buildActivityTemplateReadinessPanelSummary(
  remixPlan: TemplateRemixPlan | null
): ActivityTemplateReadinessPanelSummary {
  const remixSummary = remixPlan ? buildTemplateRemixSummary(remixPlan) : null;
  const readyOptions = remixSummary?.readyTemplateOptions ?? [];
  const lockedOptions = remixSummary?.lockedTemplateOptions ?? [];

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
        templates: formatActivityDraftTemplateList(suggestedTemplates),
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

function formatActivityDraftTemplateList(templates: string[]) {
  return templates.join(m.activity_draft_meta_template_list_separator());
}
