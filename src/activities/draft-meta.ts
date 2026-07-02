import {
  buildTemplateRemixSummary,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import {
  buildQuestionChoiceReadinessSummary,
  type QuestionChoiceReadinessItem,
  type QuestionChoiceReadinessStatus,
  type QuestionChoiceReadinessSummary,
} from '@/activities/distractors';
import {
  formatActivityAiDraftFocusDescription,
  formatActivityAiDraftFocusLabel,
  type ActivityAiDraftFocus,
} from '@/activities/ai-draft-focus';
import {
  buildActivitySourceMaterialDraftNoteSafetySummary,
  getActivitySourceMaterialDraftNoteIdentityKey,
  isSafeActivitySourceMaterialDraftKind,
  normalizeActivitySourceMaterialDraftNoteView,
  type ActivitySourceMaterialDraftNoteSafetySummary,
  type ActivitySourceMaterialDraftNoteView,
} from '@/activities/draft-source';
import {
  buildActivitySourceMaterialCapabilityViews,
  createEmptyActivitySourceMaterialCapabilityCounts,
  getActivitySourceMaterialReadinessCapabilityForKindLabel,
  type ActivitySourceMaterialCapabilityView,
} from '@/activities/material-summary';
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
  normalizeRuntimeDisplayCount,
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
  questionChoiceReadiness: QuestionChoiceReadinessSummary;
  readyTemplateCount: number;
  readyTemplateOptions: ActivityDraftTemplateOption[];
  readyTemplates: string[];
  reviewChecklist: string[];
  reviewChecklistItems: ActivityDraftReviewChecklistItem[];
  suggestedTemplateCount: number;
  suggestedTemplateOptions: ActivityDraftTemplateOption[];
  suggestedTemplates: string[];
  templateReadiness: ActivityDraftTemplateReadiness[];
};

export type ActivityDraftReviewChecklistStatus =
  | 'action-needed'
  | 'ready'
  | 'review';

export type ActivityDraftReviewChecklistItem = {
  description: string;
  id:
    | 'adjust-level'
    | 'content-gap'
    | 'next-gap'
    | 'question-review'
    | 'ready-remix'
    | 'review-answers';
  label: string;
  priority: 'high' | 'normal';
  status: ActivityDraftReviewChecklistStatus;
  templateType?: ActivityTemplateType;
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
  questionChoiceReadiness?: ActivityTemplateQuizChoiceReadinessView;
  readyCount: number;
  readyCountLabel: string;
  readyOptions: ActivityTemplateReadinessPanelOption[];
  title: string;
};

export type ActivityTemplateQuizChoiceReadinessView = {
  description: string;
  emptyText: string;
  itemViews: ActivityTemplateQuizChoiceReadinessItemView[];
  summaryLabel: string;
  title: string;
};

export type ActivityTemplateQuizChoiceReadinessItemView = {
  detail: string;
  issueLabel?: string;
  key: string;
  promptLabel: string;
  sourceLabel: string;
  status: QuestionChoiceReadinessStatus;
  statusLabel: string;
};

type ActivityDraftProvider = 'fallback' | 'workers-ai';

export type ActivityDraftMetaSummaryCoverageStatId =
  | 'groups'
  | 'pairs'
  | 'questions'
  | 'teacher-notes'
  | 'vocabulary';

export type ActivityDraftMetaSummaryCoverageStatView = {
  ariaLabel: string;
  description: string;
  id: ActivityDraftMetaSummaryCoverageStatId;
  label: string;
  value: number;
};

export type ActivityDraftMetaSummaryReadinessOption = {
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

export type ActivityDraftMetaSummarySourceMaterialNoteView =
  ActivitySourceMaterialDraftNoteView & {
    ariaLabel: string;
    displayText: string;
    key: string;
  };

export type ActivityDraftMetaSummarySourceMaterialCapabilityView =
  ActivitySourceMaterialCapabilityView<{
    ariaLabel: string;
    description: string;
    label: string;
  }>;

export type ActivityDraftMetaSummarySourceMaterialSafetyMetricId =
  | 'omitted'
  | 'safe';

export type ActivityDraftMetaSummarySourceMaterialSafetyMetricView = {
  ariaLabel: string;
  description: string;
  id: ActivityDraftMetaSummarySourceMaterialSafetyMetricId;
  label: string;
  value: string;
};

export type ActivityDraftMetaSummarySourceMaterialSafetyView = {
  ariaLabel: string;
  description: string;
  hasInput: boolean;
  hasOmitted: boolean;
  inputCount: number;
  metricViews: ActivityDraftMetaSummarySourceMaterialSafetyMetricView[];
  omittedCount: number;
  safeCount: number;
};

export type ActivityDraftMetaSummaryTrustItemId =
  | 'model'
  | 'notice'
  | 'provider'
  | 'review'
  | 'source-materials';

export type ActivityDraftMetaSummaryTrustItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityDraftMetaSummaryTrustItemId;
  label: string;
  value: string;
};

export type ActivityDraftMetaSummaryTrustView = {
  description: string;
  items: ActivityDraftMetaSummaryTrustItemView[];
  title: string;
};

export type ActivityDraftMetaSummaryView = {
  appliedDescription: string;
  appliedLabel: string;
  coverageStats: ActivityDraftMetaSummaryCoverageStatView[];
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
  questionChoiceReadiness?: ActivityDraftMetaSummaryQuestionChoiceReadinessView;
  readyTemplateLabel: string;
  readyTemplatesTitle: string;
  reviewChecklist: string[];
  reviewChecklistItems: ActivityDraftReviewChecklistItemView[];
  reviewChecklistStatusViews: ActivityDraftReviewChecklistStatusView[];
  sourceMaterialCapabilityDescription: string;
  sourceMaterialCapabilityTitle: string;
  sourceMaterialCapabilityViews: ActivityDraftMetaSummarySourceMaterialCapabilityView[];
  sourceMaterialCountLabel?: string;
  sourceMaterialDescription: string;
  sourceMaterialNoteViews: ActivityDraftMetaSummarySourceMaterialNoteView[];
  sourceMaterialSafetyView: ActivityDraftMetaSummarySourceMaterialSafetyView;
  sourceMaterialTitle: string;
  suggestedTemplateOptions: ActivityDraftTemplateOption[];
  suggestedTemplatesEmptyText: string;
  suggestedTemplatesTitle: string;
  templateReadinessOptions: ActivityDraftMetaSummaryReadinessOption[];
  title: string;
  trustView: ActivityDraftMetaSummaryTrustView;
};

export type ActivityDraftReviewChecklistItemView =
  ActivityDraftReviewChecklistItem & {
    key: string;
    statusLabel: string;
  };

export type ActivityDraftReviewChecklistStatusView = {
  id: ActivityDraftReviewChecklistStatus;
  label: string;
};

export type ActivityDraftMetaSummaryQuestionChoiceReadinessView = {
  description: string;
  itemViews: ActivityDraftMetaSummaryQuestionChoiceReadinessItemView[];
  summaryLabel: string;
  title: string;
};

export type ActivityDraftMetaSummaryQuestionChoiceReadinessItemView = {
  answerLabel: string;
  choiceCountLabel: string;
  detail: string;
  key: string;
  promptLabel: string;
  sourceLabel: string;
  status: QuestionChoiceReadinessStatus;
  statusLabel: string;
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
  const readyTemplateOptions = remixSummary.readyTemplateOptions;
  const suggestedTemplateOptions = remixSummary.suggestedTemplateOptions;
  const suggestedTemplates = suggestedTemplateOptions.map(
    (option) => option.shortName
  );
  const readyTemplates = readyTemplateOptions.map((option) => option.shortName);
  const reviewChecklistItems = buildDraftReviewChecklistItems({
    content,
    lockedTemplateOptions: remixSummary.lockedTemplateOptions,
    suggestedTemplates,
  });

  return {
    coverage: {
      groups: content.groups.length,
      pairs: content.pairs.length,
      questions: content.questions.length,
      teacherNotes: content.teacherNotes.length,
      vocabulary: content.vocabulary.length,
    },
    questionChoiceReadiness: buildQuestionChoiceReadinessSummary({ content }),
    readyTemplateCount: readyTemplateOptions.length,
    readyTemplateOptions,
    readyTemplates,
    reviewChecklist: reviewChecklistItems.map((item) => item.label),
    reviewChecklistItems,
    suggestedTemplateCount: suggestedTemplateOptions.length,
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
  const sourceMaterialSafetySummary =
    buildActivitySourceMaterialDraftNoteSafetySummary(sourceMaterialNoteViews);
  const normalizedSourceMaterialNoteViews =
    normalizeActivityDraftSourceMaterialNoteViews(sourceMaterialSafetySummary);
  const reviewChecklistItems = buildActivityDraftReviewChecklistItemViews({
    checklist: meta.reviewChecklist,
    items: meta.reviewChecklistItems,
  });
  const providerDescription = buildActivityDraftProviderDescription({
    notice: normalizedNotice,
    provider,
  });
  const providerLabel =
    provider === 'workers-ai'
      ? m.activity_draft_meta_provider_workers_ai()
      : m.activity_draft_meta_provider_fallback();

  return {
    appliedDescription: m.activity_draft_meta_applied_description(),
    appliedLabel: m.activity_draft_meta_applied_label(),
    coverageStats: [
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_coverage_questions_description(),
          label: m.activity_draft_meta_coverage_questions(),
          value: String(
            normalizeActivityDraftMetaCount(meta.coverage.questions)
          ),
        }),
        description: m.activity_draft_meta_coverage_questions_description(),
        id: 'questions',
        label: m.activity_draft_meta_coverage_questions(),
        value: normalizeActivityDraftMetaCount(meta.coverage.questions),
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_coverage_pairs_description(),
          label: m.activity_draft_meta_coverage_pairs(),
          value: String(normalizeActivityDraftMetaCount(meta.coverage.pairs)),
        }),
        description: m.activity_draft_meta_coverage_pairs_description(),
        id: 'pairs',
        label: m.activity_draft_meta_coverage_pairs(),
        value: normalizeActivityDraftMetaCount(meta.coverage.pairs),
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_coverage_groups_description(),
          label: m.activity_draft_meta_coverage_groups(),
          value: String(normalizeActivityDraftMetaCount(meta.coverage.groups)),
        }),
        description: m.activity_draft_meta_coverage_groups_description(),
        id: 'groups',
        label: m.activity_draft_meta_coverage_groups(),
        value: normalizeActivityDraftMetaCount(meta.coverage.groups),
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_coverage_vocab_description(),
          label: m.activity_draft_meta_coverage_vocab(),
          value: String(
            normalizeActivityDraftMetaCount(meta.coverage.vocabulary)
          ),
        }),
        description: m.activity_draft_meta_coverage_vocab_description(),
        id: 'vocabulary',
        label: m.activity_draft_meta_coverage_vocab(),
        value: normalizeActivityDraftMetaCount(meta.coverage.vocabulary),
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_coverage_notes_description(),
          label: m.activity_draft_meta_coverage_notes(),
          value: String(
            normalizeActivityDraftMetaCount(meta.coverage.teacherNotes)
          ),
        }),
        description: m.activity_draft_meta_coverage_notes_description(),
        id: 'teacher-notes',
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
    providerDescription,
    providerLabel,
    questionChoiceReadiness:
      buildActivityDraftMetaSummaryQuestionChoiceReadinessView(
        meta.questionChoiceReadiness
      ),
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
    reviewChecklistItems,
    reviewChecklistStatusViews:
      buildActivityDraftReviewChecklistStatusViews(reviewChecklistItems),
    sourceMaterialCapabilityDescription:
      m.activity_draft_meta_source_material_capabilities_description(),
    sourceMaterialCapabilityTitle:
      m.activity_draft_meta_source_material_capabilities_title(),
    sourceMaterialCapabilityViews:
      buildActivityDraftMetaSourceMaterialCapabilityViews(
        normalizedSourceMaterialNoteViews
      ),
    sourceMaterialCountLabel:
      normalizedSourceMaterialNoteViews.length > 0
        ? buildActivityDraftSourceMaterialCountLabel(
            normalizedSourceMaterialNoteViews.length
          )
        : undefined,
    sourceMaterialDescription:
      m.activity_draft_meta_source_materials_description(),
    sourceMaterialNoteViews: normalizedSourceMaterialNoteViews,
    sourceMaterialSafetyView:
      buildActivityDraftMetaSummarySourceMaterialSafetyView(
        sourceMaterialSafetySummary
      ),
    sourceMaterialTitle: m.activity_draft_meta_source_materials_title(),
    suggestedTemplateOptions: meta.suggestedTemplateOptions,
    suggestedTemplatesEmptyText:
      m.activity_draft_meta_suggested_templates_empty(),
    suggestedTemplatesTitle: m.activity_draft_meta_suggested_templates_title(),
    templateReadinessOptions: normalizedTemplateReadinessOptions,
    title: m.activity_draft_meta_title(),
    trustView: buildActivityDraftMetaSummaryTrustView({
      modelName,
      notice: normalizedNotice,
      providerDescription,
      providerLabel,
      sourceMaterialCount: normalizedSourceMaterialNoteViews.length,
    }),
  };
}

function buildActivityDraftMetaSummaryTrustView({
  modelName,
  notice,
  providerDescription,
  providerLabel,
  sourceMaterialCount,
}: {
  modelName: string;
  notice?: string;
  providerDescription: string;
  providerLabel: string;
  sourceMaterialCount: number;
}): ActivityDraftMetaSummaryTrustView {
  const safeSourceCount = normalizeActivityDraftMetaCount(sourceMaterialCount);

  return {
    description: m.activity_draft_meta_trust_description(),
    items: [
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: providerDescription,
          label: m.activity_draft_meta_trust_provider_label(),
          value: providerLabel,
        }),
        description: providerDescription,
        id: 'provider',
        label: m.activity_draft_meta_trust_provider_label(),
        value: providerLabel,
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_trust_model_description(),
          label: m.activity_draft_meta_trust_model_label(),
          value: modelName,
        }),
        description: m.activity_draft_meta_trust_model_description(),
        id: 'model',
        label: m.activity_draft_meta_trust_model_label(),
        value: modelName,
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_trust_review_description(),
          label: m.activity_draft_meta_trust_review_label(),
          value: m.activity_draft_meta_trust_review_value(),
        }),
        description: m.activity_draft_meta_trust_review_description(),
        id: 'review',
        label: m.activity_draft_meta_trust_review_label(),
        value: m.activity_draft_meta_trust_review_value(),
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_trust_source_description(),
          label: m.activity_draft_meta_trust_source_label(),
          value: buildActivityDraftMetaTrustSourceValue(safeSourceCount),
        }),
        description: m.activity_draft_meta_trust_source_description(),
        id: 'source-materials',
        label: m.activity_draft_meta_trust_source_label(),
        value: buildActivityDraftMetaTrustSourceValue(safeSourceCount),
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: m.activity_draft_meta_trust_notice_description(),
          label: m.activity_draft_meta_trust_notice_label(),
          value: notice ?? m.activity_draft_meta_trust_notice_none_value(),
        }),
        description: m.activity_draft_meta_trust_notice_description(),
        id: 'notice',
        label: m.activity_draft_meta_trust_notice_label(),
        value: notice ?? m.activity_draft_meta_trust_notice_none_value(),
      },
    ],
    title: m.activity_draft_meta_trust_title(),
  };
}

function buildActivityDraftMetaTrustSourceValue(count: number) {
  if (count === 0) {
    return m.activity_draft_meta_trust_source_none_value();
  }

  return count === 1
    ? m.activity_draft_meta_trust_source_one_value({ count })
    : m.activity_draft_meta_trust_source_many_value({ count });
}

function buildActivityDraftMetaSummaryQuestionChoiceReadinessView(
  summary: QuestionChoiceReadinessSummary
): ActivityDraftMetaSummaryQuestionChoiceReadinessView | undefined {
  if (summary.itemCount === 0) return undefined;

  return {
    description: m.activity_draft_meta_quiz_choices_description({
      targetCount: summary.targetCount,
    }),
    itemViews: summary.items.map((item, index) =>
      buildActivityDraftMetaSummaryQuestionChoiceReadinessItemView({
        index,
        item,
      })
    ),
    summaryLabel:
      summary.itemCount === 1
        ? m.activity_draft_meta_quiz_choices_summary_one({
            readyCount: summary.readyCount,
            totalCount: summary.itemCount,
          })
        : m.activity_draft_meta_quiz_choices_summary_many({
            readyCount: summary.readyCount,
            totalCount: summary.itemCount,
          }),
    title: m.activity_draft_meta_quiz_choices_title(),
  };
}

function buildActivityDraftMetaSummaryQuestionChoiceReadinessItemView({
  index,
  item,
}: {
  index: number;
  item: QuestionChoiceReadinessItem;
}): ActivityDraftMetaSummaryQuestionChoiceReadinessItemView {
  return {
    answerLabel: item.answerIncluded
      ? m.activity_draft_meta_quiz_choices_answer_included()
      : m.activity_draft_meta_quiz_choices_answer_missing(),
    choiceCountLabel: m.activity_draft_meta_quiz_choices_choice_count({
      completedCount: item.completedChoiceCount,
      deterministicCount: item.deterministicChoiceCount,
      explicitCount: item.explicitChoiceCount,
      targetCount: item.targetCount,
    }),
    detail: buildActivityDraftMetaSummaryQuestionChoiceReadinessDetail(item),
    key: item.questionId,
    promptLabel: m.activity_draft_meta_quiz_choices_prompt({
      index: getActivityTemplateQuizChoiceReadinessItemPosition(index),
      prompt: item.prompt,
    }),
    sourceLabel: m.activity_draft_meta_quiz_choices_sources({
      siblingCount: item.siblingAnswerCandidateCount,
      vocabularyCount: item.vocabularyCandidateCount,
    }),
    status: item.status,
    statusLabel: formatActivityDraftMetaSummaryQuestionChoiceReadinessStatus(
      item.status
    ),
  };
}

function buildActivityDraftMetaSummaryQuestionChoiceReadinessDetail(
  item: QuestionChoiceReadinessItem
) {
  switch (item.status) {
    case 'explicit-ready':
      return m.activity_draft_meta_quiz_choices_explicit_detail({
        choiceCount: item.explicitChoiceCount,
        targetCount: item.targetCount,
      });
    case 'completed-locally':
      return m.activity_draft_meta_quiz_choices_completed_detail({
        deterministicCount: item.deterministicChoiceCount,
        targetCount: item.targetCount,
      });
    case 'needs-candidates':
      return m.activity_draft_meta_quiz_choices_needs_detail({
        missingCount: item.missingChoiceCount,
      });
  }
}

function formatActivityDraftMetaSummaryQuestionChoiceReadinessStatus(
  status: QuestionChoiceReadinessStatus
) {
  switch (status) {
    case 'explicit-ready':
      return m.activity_draft_meta_quiz_choices_status_explicit();
    case 'completed-locally':
      return m.activity_draft_meta_quiz_choices_status_completed();
    case 'needs-candidates':
      return m.activity_draft_meta_quiz_choices_status_needs();
  }
}

export function normalizeActivityDraftMetaCount(count: number) {
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

function buildActivityDraftMetaSummarySourceMaterialSafetyView(
  summary: ActivitySourceMaterialDraftNoteSafetySummary
): ActivityDraftMetaSummarySourceMaterialSafetyView {
  const safeCount = normalizeActivityDraftMetaCount(summary.safeCount);
  const omittedCount = normalizeActivityDraftMetaCount(summary.omittedCount);
  const inputCount = normalizeActivityDraftMetaCount(summary.inputCount);
  const safeValue = buildActivityDraftMetaSafeSourceCountValue(safeCount);
  const omittedValue =
    buildActivityDraftMetaOmittedSourceCountValue(omittedCount);
  const safeDescription =
    m.activity_draft_meta_source_material_safety_safe_description();
  const omittedDescription =
    m.activity_draft_meta_source_material_safety_omitted_description();
  const metricViews: ActivityDraftMetaSummarySourceMaterialSafetyMetricView[] =
    [
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: safeDescription,
          label: m.activity_draft_meta_source_material_safety_safe_label(),
          value: safeValue,
        }),
        description: safeDescription,
        id: 'safe',
        label: m.activity_draft_meta_source_material_safety_safe_label(),
        value: safeValue,
      },
      {
        ariaLabel: formatActivityDraftMetaSummaryItemAriaLabel({
          description: omittedDescription,
          label: m.activity_draft_meta_source_material_safety_omitted_label(),
          value: omittedValue,
        }),
        description: omittedDescription,
        id: 'omitted',
        label: m.activity_draft_meta_source_material_safety_omitted_label(),
        value: omittedValue,
      },
    ];

  return {
    ariaLabel: formatActivityDraftMetaSourceMaterialSafetyAriaLabel({
      omittedValue,
      safeValue,
    }),
    description: m.activity_draft_meta_source_material_safety_description(),
    hasInput: inputCount > 0,
    hasOmitted: omittedCount > 0,
    inputCount,
    metricViews,
    omittedCount,
    safeCount,
  };
}

function buildActivityDraftMetaSafeSourceCountValue(count: number) {
  if (count === 0) {
    return m.activity_draft_meta_source_material_safety_safe_none_value();
  }

  return count === 1
    ? m.activity_draft_meta_source_material_safety_safe_one_value({ count })
    : m.activity_draft_meta_source_material_safety_safe_many_value({ count });
}

function buildActivityDraftMetaOmittedSourceCountValue(count: number) {
  if (count === 0) {
    return m.activity_draft_meta_source_material_safety_omitted_none_value();
  }

  return count === 1
    ? m.activity_draft_meta_source_material_safety_omitted_one_value({ count })
    : m.activity_draft_meta_source_material_safety_omitted_many_value({
        count,
      });
}

function formatActivityDraftMetaSourceMaterialSafetyAriaLabel({
  omittedValue,
  safeValue,
}: {
  omittedValue: string;
  safeValue: string;
}) {
  return m.activity_draft_meta_source_material_safety_aria_label({
    omittedValue,
    safeValue,
  });
}

function buildActivityDraftMetaSourceMaterialCapabilityViews(
  noteViews: ActivityDraftMetaSummarySourceMaterialNoteView[]
): ActivityDraftMetaSummarySourceMaterialCapabilityView[] {
  const capabilityCounts =
    buildActivityDraftMetaSourceMaterialCapabilityCounts(noteViews);

  return buildActivitySourceMaterialCapabilityViews({
    capabilityCounts,
    copy: {
      'audio-extraction': {
        ariaLabel: buildActivityDraftMetaSourceMaterialCapabilityAriaLabel({
          count: capabilityCounts['audio-extraction'],
          description:
            m.activity_draft_meta_source_material_capability_audio_description(),
          label: m.activity_draft_meta_source_material_capability_audio_label(),
        }),
        description:
          m.activity_draft_meta_source_material_capability_audio_description(),
        label: m.activity_draft_meta_source_material_capability_audio_label(),
      },
      'spreadsheet-import': {
        ariaLabel: buildActivityDraftMetaSourceMaterialCapabilityAriaLabel({
          count: capabilityCounts['spreadsheet-import'],
          description:
            m.activity_draft_meta_source_material_capability_spreadsheet_description(),
          label:
            m.activity_draft_meta_source_material_capability_spreadsheet_label(),
        }),
        description:
          m.activity_draft_meta_source_material_capability_spreadsheet_description(),
        label:
          m.activity_draft_meta_source_material_capability_spreadsheet_label(),
      },
      'worksheet-extraction': {
        ariaLabel: buildActivityDraftMetaSourceMaterialCapabilityAriaLabel({
          count: capabilityCounts['worksheet-extraction'],
          description:
            m.activity_draft_meta_source_material_capability_worksheet_description(),
          label:
            m.activity_draft_meta_source_material_capability_worksheet_label(),
        }),
        description:
          m.activity_draft_meta_source_material_capability_worksheet_description(),
        label:
          m.activity_draft_meta_source_material_capability_worksheet_label(),
      },
    },
  });
}

function buildActivityDraftMetaSourceMaterialCapabilityAriaLabel({
  count,
  description,
  label,
}: {
  count: number;
  description: string;
  label: string;
}) {
  return formatActivityDraftMetaSummaryItemAriaLabel({
    description,
    label,
    value: String(normalizeActivityDraftMetaCount(count)),
  });
}

function buildActivityDraftMetaSourceMaterialCapabilityCounts(
  noteViews: ActivityDraftMetaSummarySourceMaterialNoteView[]
) {
  const counts = createEmptyActivitySourceMaterialCapabilityCounts();

  for (const noteView of noteViews) {
    const capability = getActivitySourceMaterialReadinessCapabilityForKindLabel(
      noteView.kindLabel
    );

    if (!capability) continue;

    counts[capability] = normalizeActivityDraftMetaCount(
      counts[capability] + 1
    );
  }

  return counts;
}

function normalizeActivityDraftSourceMaterialNoteViews(
  safetySummary: ActivitySourceMaterialDraftNoteSafetySummary
) {
  const normalizedNoteViews: ActivityDraftMetaSummarySourceMaterialNoteView[] =
    [];
  const seen = new Set<string>();

  for (const noteView of safetySummary.safeNoteViews) {
    const normalizedNoteView =
      normalizeActivitySourceMaterialDraftNoteView(noteView);
    const kindLabel = normalizedNoteView.kindLabel;
    const name = normalizedNoteView.name;
    const key =
      getActivitySourceMaterialDraftNoteIdentityKey(normalizedNoteView);

    if (
      !key ||
      !kindLabel ||
      !name ||
      !isSafeActivitySourceMaterialDraftKind(kindLabel) ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    const displayText = m.activity_draft_meta_source_material_item({
      kind: kindLabel,
      name,
    });
    normalizedNoteViews.push({
      ariaLabel: m.activity_draft_meta_source_material_item_aria_label({
        displayText,
      }),
      displayText,
      key,
      kindLabel,
      name,
    });
  }

  return normalizedNoteViews;
}

function formatActivityDraftMetaSummaryItemAriaLabel({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return m.activity_draft_meta_item_aria_label({
    description,
    label,
    value: normalizeActivityDraftMetaAriaValue(value),
  });
}

function normalizeActivityDraftMetaAriaValue(value: string) {
  return value.replace(/[.!?。！？]+$/u, '');
}

function buildActivityDraftReviewChecklistItemViews({
  checklist,
  items,
}: {
  checklist: string[];
  items?: ActivityDraftReviewChecklistItem[];
}): ActivityDraftReviewChecklistItemView[] {
  const sourceItems =
    items && items.length > 0
      ? items
      : checklist.map((label, index) =>
          buildFallbackActivityDraftReviewChecklistItem(label, index)
        );

  return sourceItems.map((item, index) => ({
    ...item,
    key: buildActivityDraftReviewChecklistItemKey(item, index),
    statusLabel: formatActivityDraftReviewChecklistStatus(item.status),
  }));
}

function buildActivityDraftReviewChecklistItemKey(
  item: ActivityDraftReviewChecklistItem,
  index: number
) {
  return [item.id, item.templateType ?? 'all', index].join(':');
}

function buildActivityDraftReviewChecklistStatusViews(
  items: ActivityDraftReviewChecklistItemView[]
): ActivityDraftReviewChecklistStatusView[] {
  return [
    {
      id: 'action-needed',
      label: m.activity_draft_meta_checklist_status_summary_action_needed({
        count: countActivityDraftReviewChecklistStatus(items, 'action-needed'),
      }),
    },
    {
      id: 'review',
      label: m.activity_draft_meta_checklist_status_summary_review({
        count: countActivityDraftReviewChecklistStatus(items, 'review'),
      }),
    },
    {
      id: 'ready',
      label: m.activity_draft_meta_checklist_status_summary_ready({
        count: countActivityDraftReviewChecklistStatus(items, 'ready'),
      }),
    },
  ];
}

function countActivityDraftReviewChecklistStatus(
  items: ActivityDraftReviewChecklistItemView[],
  status: ActivityDraftReviewChecklistStatus
) {
  return normalizeActivityDraftMetaCount(
    items.filter((item) => item.status === status).length
  );
}

function buildFallbackActivityDraftReviewChecklistItem(
  label: string,
  index: number
): ActivityDraftReviewChecklistItem {
  return {
    description: m.activity_draft_meta_checklist_review_description(),
    id: 'content-gap',
    label,
    priority: index === 0 ? 'high' : 'normal',
    status: 'review',
  };
}

function formatActivityDraftReviewChecklistStatus(
  status: ActivityDraftReviewChecklistStatus
) {
  switch (status) {
    case 'action-needed':
      return m.activity_draft_meta_checklist_status_action_needed();
    case 'ready':
      return m.activity_draft_meta_checklist_status_ready();
    case 'review':
      return m.activity_draft_meta_checklist_status_review();
  }
}

export function buildActivityTemplateReadinessPanelSummary(
  remixPlan: TemplateRemixPlan | null,
  content?: ActivityContent | null
): ActivityTemplateReadinessPanelSummary {
  const remixSummary = remixPlan ? buildTemplateRemixSummary(remixPlan) : null;
  const readyOptions = remixSummary?.readyTemplateOptions ?? [];
  const lockedOptions = remixSummary?.lockedTemplateOptions ?? [];
  const questionChoiceReadiness = content
    ? buildActivityTemplateQuizChoiceReadinessView(content)
    : null;

  return {
    description: m.activity_template_readiness_panel_description(),
    emptyText: m.activity_template_readiness_panel_empty(),
    lockedOptions,
    ...(questionChoiceReadiness ? { questionChoiceReadiness } : {}),
    readyCount: readyOptions.length,
    readyCountLabel: m.activity_template_readiness_panel_ready_label({
      count: readyOptions.length,
    }),
    readyOptions,
    title: m.activity_template_readiness_panel_title(),
  };
}

function buildActivityTemplateQuizChoiceReadinessView(
  content: ActivityContent
): ActivityTemplateQuizChoiceReadinessView | null {
  const summary = buildQuestionChoiceReadinessSummary({ content });

  if (summary.itemCount === 0) return null;

  return {
    description: m.activity_template_readiness_panel_quiz_choices_description({
      targetCount: summary.targetCount,
    }),
    emptyText: m.activity_template_readiness_panel_quiz_choices_empty(),
    itemViews: summary.items.map((item, index) =>
      buildActivityTemplateQuizChoiceReadinessItemView({ index, item })
    ),
    summaryLabel:
      summary.itemCount === 1
        ? m.activity_template_readiness_panel_quiz_choices_summary_one({
            readyCount: summary.readyCount,
            totalCount: summary.itemCount,
          })
        : m.activity_template_readiness_panel_quiz_choices_summary_many({
            readyCount: summary.readyCount,
            totalCount: summary.itemCount,
          }),
    title: m.activity_template_readiness_panel_quiz_choices_title(),
  };
}

function buildActivityTemplateQuizChoiceReadinessItemView({
  index,
  item,
}: {
  index: number;
  item: QuestionChoiceReadinessItem;
}): ActivityTemplateQuizChoiceReadinessItemView {
  const issueLabel = item.answerIncluded
    ? null
    : m.activity_template_readiness_panel_quiz_choices_answer_missing();

  return {
    detail: buildActivityTemplateQuizChoiceReadinessDetail(item),
    key: item.questionId,
    promptLabel: m.activity_template_readiness_panel_quiz_choices_prompt({
      index: getActivityTemplateQuizChoiceReadinessItemPosition(index),
      prompt: item.prompt,
    }),
    sourceLabel: m.activity_template_readiness_panel_quiz_choices_sources({
      siblingCount: item.siblingAnswerCandidateCount,
      vocabularyCount: item.vocabularyCandidateCount,
    }),
    status: item.status,
    statusLabel: formatActivityTemplateQuizChoiceReadinessStatus(item.status),
    ...(issueLabel ? { issueLabel } : {}),
  };
}

function buildActivityTemplateQuizChoiceReadinessDetail(
  item: QuestionChoiceReadinessItem
) {
  switch (item.status) {
    case 'explicit-ready':
      return m.activity_template_readiness_panel_quiz_choices_explicit_detail({
        choiceCount: item.explicitChoiceCount,
        targetCount: item.targetCount,
      });
    case 'completed-locally':
      return m.activity_template_readiness_panel_quiz_choices_completed_detail({
        completedCount: item.completedChoiceCount,
        deterministicCount: item.deterministicChoiceCount,
        explicitCount: item.explicitChoiceCount,
        targetCount: item.targetCount,
      });
    case 'needs-candidates':
      return m.activity_template_readiness_panel_quiz_choices_needs_detail({
        completedCount: item.completedChoiceCount,
        missingCount: item.missingChoiceCount,
        targetCount: item.targetCount,
      });
  }
}

export function getActivityTemplateQuizChoiceReadinessItemPosition(
  index: number
) {
  return normalizeRuntimeDisplayCount(index + 1, { min: 1 });
}

function formatActivityTemplateQuizChoiceReadinessStatus(
  status: QuestionChoiceReadinessStatus
) {
  switch (status) {
    case 'explicit-ready':
      return m.activity_template_readiness_panel_quiz_choices_status_explicit();
    case 'completed-locally':
      return m.activity_template_readiness_panel_quiz_choices_status_completed();
    case 'needs-candidates':
      return m.activity_template_readiness_panel_quiz_choices_status_needs();
  }
}

function buildDraftReviewChecklistItems({
  content,
  lockedTemplateOptions,
  suggestedTemplates,
}: {
  content: ActivityContent;
  lockedTemplateOptions: TemplateRemixLockedOption[];
  suggestedTemplates: string[];
}): ActivityDraftReviewChecklistItem[] {
  const checklist: ActivityDraftReviewChecklistItem[] = [
    {
      description: m.activity_draft_meta_checklist_review_answers_description(),
      id: 'review-answers',
      label: m.activity_draft_meta_checklist_review_answers(),
      priority: 'high',
      status: 'review',
    },
    {
      description: m.activity_draft_meta_checklist_adjust_level_description(),
      id: 'adjust-level',
      label: m.activity_draft_meta_checklist_adjust_level(),
      priority: 'normal',
      status: 'review',
    },
    buildQuestionReviewChecklistItem(content),
  ];

  if (suggestedTemplates.length > 0) {
    checklist.push({
      description: m.activity_draft_meta_checklist_ready_to_remix_description(),
      id: 'ready-remix',
      label: m.activity_draft_meta_checklist_ready_to_remix({
        templates: formatActivityDraftTemplateList(suggestedTemplates),
      }),
      priority: 'normal',
      status: 'ready',
    });

    const nextLockedTemplate = lockedTemplateOptions[0];
    if (nextLockedTemplate) {
      checklist.push({
        description: m.activity_draft_meta_checklist_next_gap_description(),
        id: 'next-gap',
        label: m.activity_draft_meta_checklist_next_gap({
          diagnosis: nextLockedTemplate.diagnosis,
        }),
        priority: 'normal',
        status: 'action-needed',
        templateType: nextLockedTemplate.template,
      });
    }

    return checklist;
  }

  checklist.push({
    description:
      m.activity_draft_meta_checklist_add_more_structure_description(),
    id: 'content-gap',
    label:
      lockedTemplateOptions[0]?.diagnosis ??
      m.activity_draft_meta_checklist_add_more_structure(),
    priority: 'high',
    status: 'action-needed',
    ...(lockedTemplateOptions[0]
      ? { templateType: lockedTemplateOptions[0].template }
      : {}),
  });

  return checklist;
}

function buildQuestionReviewChecklistItem(
  content: ActivityContent
): ActivityDraftReviewChecklistItem {
  if (content.questions.length === 0) {
    return {
      description: m.activity_draft_meta_checklist_add_questions_description(),
      id: 'question-review',
      label: m.activity_draft_meta_checklist_add_questions(),
      priority: 'high',
      status: 'action-needed',
    };
  }

  const questionChoiceReadiness = buildQuestionChoiceReadinessSummary({
    content,
  });

  if (questionChoiceReadiness.needsCandidateCount > 0) {
    const label =
      questionChoiceReadiness.needsCandidateCount === 1
        ? m.activity_draft_meta_checklist_add_quiz_choices_one({
            count: questionChoiceReadiness.needsCandidateCount,
          })
        : m.activity_draft_meta_checklist_add_quiz_choices_many({
            count: questionChoiceReadiness.needsCandidateCount,
          });

    return {
      description:
        m.activity_draft_meta_checklist_add_quiz_choices_description(),
      id: 'question-review',
      label,
      priority: 'high',
      status: 'action-needed',
    };
  }

  if (content.questions.some((question) => !question.explanation)) {
    return {
      description:
        m.activity_draft_meta_checklist_add_explanations_description(),
      id: 'question-review',
      label: m.activity_draft_meta_checklist_add_explanations(),
      priority: 'normal',
      status: 'action-needed',
    };
  }

  return {
    description:
      m.activity_draft_meta_checklist_check_explanations_description(),
    id: 'question-review',
    label: m.activity_draft_meta_checklist_check_explanations(),
    priority: 'normal',
    status: 'review',
  };
}

function formatActivityDraftTemplateList(templates: string[]) {
  return templates.join(m.activity_draft_meta_template_list_separator());
}
