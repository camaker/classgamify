import { getTemplateByType } from '@/activities/catalog';
import type { ActivityDraftResult } from '@/activities/ai-draft';
import {
  buildActivityDraftMeta,
  buildActivityDraftMetaSummaryView,
} from '@/activities/draft-meta';
import { formatActivityAiDraftFocusLabel } from '@/activities/ai-draft-focus';
import type { ActivityTemplateType } from '@/activities/types';
import { getRuntimeItems } from '@/activities/runtime';
import { buildActivityContent } from '@/activities/validation';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS = [
  'fallback-provider',
  'fallback-model',
  'generation-notice',
  'review-state',
  'editor-application',
  'persistence-boundary',
  'save-boundary',
  'publish-boundary',
  'template-preserved',
  'draft-focus',
  'target-item-count',
  'runtime-item-count',
  'question-count',
  'pair-count',
  'group-count',
  'vocabulary-count',
  'teacher-note-count',
  'explanation-count',
  'quiz-choice-readiness',
  'ready-template-count',
  'suggested-template-count',
  'review-checklist-count',
  'source-term-count',
  'source-summary',
  'source-material-note-boundary',
  'multi-template-runtime',
  'listening-runtime',
  'group-sort-runtime',
  'open-box-runtime',
  'privacy-guard',
] as const;

export type ActivityAiFallbackHandoffItemId =
  (typeof ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS)[number];

export type ActivityAiFallbackTemplateRuntimeEvidence = {
  runtimeItemCount: number;
  templateType: ActivityTemplateType;
};

export type ActivityAiFallbackHandoffEvidence = {
  result: ActivityDraftResult;
  sourceMaterialNotesOmitted: boolean;
  sourceTermCount: number;
  targetItemCount: number;
  templateRuntimeCounts: ActivityAiFallbackTemplateRuntimeEvidence[];
};

export type ActivityAiFallbackHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiFallbackHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAiFallbackHandoffPrivacyContract = {
  appliesBeforeActivitySave: true;
  exposesAnswerText: false;
  exposesDraftSourceText: false;
  exposesQuestionPromptText: false;
  exposesRawAiOutput: false;
  exposesRawSourceMaterialNotes: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityAiFallbackHandoffItemId[];
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  requiresTeacherReview: true;
  scope: 'deterministic-ai-draft-fallback';
  usesCreateActivityInputContract: true;
  usesRuntimeItems: true;
};

export type ActivityAiFallbackHandoffView = {
  description: string;
  itemViews: ActivityAiFallbackHandoffItemView[];
  privacy: ActivityAiFallbackHandoffPrivacyContract;
  title: string;
};

type ActivityAiFallbackHandoffContext = {
  content: ReturnType<typeof buildActivityContent>;
  evidence: ActivityAiFallbackHandoffEvidence;
  meta: ReturnType<typeof buildActivityDraftMeta>;
  runtimeItemCount: number;
  summaryView: ReturnType<typeof buildActivityDraftMetaSummaryView>;
};

export function buildActivityAiFallbackHandoffView(
  evidence: ActivityAiFallbackHandoffEvidence
): ActivityAiFallbackHandoffView {
  const content = buildActivityContent(evidence.result.activity);
  const meta = buildActivityDraftMeta({
    activity: evidence.result.activity,
    currentTemplateType: evidence.result.activity.templateType,
  });
  const summaryView = buildActivityDraftMetaSummaryView({
    draftFocus: evidence.result.draftFocus,
    meta,
    model: evidence.result.model,
    notice: evidence.result.notice,
    provider: evidence.result.provider,
  });
  const runtimeItemCount = getRuntimeItems(
    evidence.result.activity.templateType,
    content
  ).length;
  const context = {
    content,
    evidence,
    meta,
    runtimeItemCount,
    summaryView,
  } satisfies ActivityAiFallbackHandoffContext;
  const itemViews = ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityAiFallbackHandoffItemView({
      description: getActivityAiFallbackHandoffDescription(id),
      id,
      label: getActivityAiFallbackHandoffLabel(id),
      value: getActivityAiFallbackHandoffValue(id, context),
    })
  );

  return {
    description: m.activity_ai_fallback_handoff_description(),
    itemViews,
    privacy: buildActivityAiFallbackHandoffPrivacyContract(itemViews),
    title: m.activity_ai_fallback_handoff_title(),
  };
}

function getActivityAiFallbackHandoffValue(
  id: ActivityAiFallbackHandoffItemId,
  context: ActivityAiFallbackHandoffContext
) {
  const result = context.evidence.result;
  const template = getTemplateByType(result.activity.templateType);

  switch (id) {
    case 'fallback-provider':
      return context.summaryView.providerLabel;
    case 'fallback-model':
      return context.summaryView.modelName;
    case 'generation-notice':
      return (
        context.summaryView.notice ??
        m.activity_ai_fallback_handoff_no_notice_value()
      );
    case 'review-state':
      return result.reviewState.reviewRequired
        ? m.activity_ai_fallback_handoff_review_required_value()
        : m.activity_ai_fallback_handoff_review_missing_value();
    case 'editor-application':
      return result.reviewState.applicationMode === 'editor-review'
        ? m.activity_ai_fallback_handoff_editor_review_value()
        : result.reviewState.applicationMode;
    case 'persistence-boundary':
      return result.reviewState.persistenceMode === 'not-persisted'
        ? m.activity_ai_fallback_handoff_not_persisted_value()
        : result.reviewState.persistenceMode;
    case 'save-boundary':
      return m.activity_draft_meta_handoff_save_boundary_value();
    case 'publish-boundary':
      return m.activity_ai_fallback_handoff_save_before_publish_value();
    case 'template-preserved':
      return template.shortName;
    case 'draft-focus':
      return formatActivityAiDraftFocusLabel(result.draftFocus);
    case 'target-item-count':
      return formatActivityAiFallbackItemCount(
        normalizeActivityAiFallbackHandoffCount(
          context.evidence.targetItemCount
        )
      );
    case 'runtime-item-count':
      return formatActivityAiFallbackItemCount(context.runtimeItemCount);
    case 'question-count':
      return formatActivityAiFallbackQuestionCount(
        context.content.questions.length
      );
    case 'pair-count':
      return formatActivityAiFallbackPairCount(context.content.pairs.length);
    case 'group-count':
      return formatActivityAiFallbackGroupCount(context.content.groups.length);
    case 'vocabulary-count':
      return formatActivityAiFallbackVocabularyCount(
        context.content.vocabulary.length
      );
    case 'teacher-note-count':
      return formatActivityAiFallbackTeacherNoteCount(
        context.content.teacherNotes.length
      );
    case 'explanation-count':
      return formatActivityAiFallbackExplanationCount(
        context.content.questions.filter((question) => question.explanation)
          .length
      );
    case 'quiz-choice-readiness':
      return (
        context.summaryView.questionChoiceReadiness?.summaryLabel ??
        m.activity_draft_meta_handoff_quiz_choice_none_value()
      );
    case 'ready-template-count':
      return formatActivityAiFallbackTemplateCount(
        context.meta.readyTemplateCount
      );
    case 'suggested-template-count':
      return formatActivityAiFallbackTemplateCount(
        context.meta.suggestedTemplateCount
      );
    case 'review-checklist-count':
      return formatActivityAiFallbackChecklistCount(
        context.meta.reviewChecklistItems.length
      );
    case 'source-term-count':
      return formatActivityAiFallbackSourceTermCount(
        context.evidence.sourceTermCount
      );
    case 'source-summary':
      return context.content.sourceSummary
        ? m.activity_ai_fallback_handoff_present_value()
        : m.activity_draft_meta_handoff_none_value();
    case 'source-material-note-boundary':
      return context.evidence.sourceMaterialNotesOmitted
        ? m.activity_ai_fallback_handoff_material_notes_omitted_value()
        : m.activity_ai_fallback_handoff_no_material_notes_value();
    case 'multi-template-runtime':
      return formatActivityAiFallbackRuntimeTemplateCoverage(
        context.evidence.templateRuntimeCounts
      );
    case 'listening-runtime':
      return formatActivityAiFallbackTrackCount(
        getRuntimeItemCountForTemplate({
          templateRuntimeCounts: context.evidence.templateRuntimeCounts,
          templateType: 'listening',
        })
      );
    case 'group-sort-runtime':
      return formatActivityAiFallbackItemCount(
        getRuntimeItemCountForTemplate({
          templateRuntimeCounts: context.evidence.templateRuntimeCounts,
          templateType: 'group-sort',
        })
      );
    case 'open-box-runtime':
      return formatActivityAiFallbackPromptCount(
        getRuntimeItemCountForTemplate({
          templateRuntimeCounts: context.evidence.templateRuntimeCounts,
          templateType: 'open-box',
        })
      );
    case 'privacy-guard':
      return m.activity_ai_fallback_handoff_hidden_value();
  }
}

function getActivityAiFallbackHandoffLabel(
  id: ActivityAiFallbackHandoffItemId
) {
  switch (id) {
    case 'fallback-provider':
      return m.activity_ai_fallback_handoff_provider_label();
    case 'fallback-model':
      return m.activity_ai_fallback_handoff_model_label();
    case 'generation-notice':
      return m.activity_ai_fallback_handoff_notice_label();
    case 'review-state':
      return m.activity_ai_fallback_handoff_review_state_label();
    case 'editor-application':
      return m.activity_ai_fallback_handoff_editor_application_label();
    case 'persistence-boundary':
      return m.activity_ai_fallback_handoff_persistence_label();
    case 'save-boundary':
      return m.activity_draft_meta_handoff_save_boundary_label();
    case 'publish-boundary':
      return m.activity_ai_fallback_handoff_publish_boundary_label();
    case 'template-preserved':
      return m.activity_ai_fallback_handoff_template_label();
    case 'draft-focus':
      return m.activity_ai_fallback_handoff_focus_label();
    case 'target-item-count':
      return m.activity_ai_fallback_handoff_target_items_label();
    case 'runtime-item-count':
      return m.activity_ai_fallback_handoff_runtime_items_label();
    case 'question-count':
      return m.activity_ai_fallback_handoff_questions_label();
    case 'pair-count':
      return m.activity_ai_fallback_handoff_pairs_label();
    case 'group-count':
      return m.activity_ai_fallback_handoff_groups_label();
    case 'vocabulary-count':
      return m.activity_ai_fallback_handoff_vocabulary_label();
    case 'teacher-note-count':
      return m.activity_ai_fallback_handoff_teacher_notes_label();
    case 'explanation-count':
      return m.activity_ai_fallback_handoff_explanations_label();
    case 'quiz-choice-readiness':
      return m.activity_draft_meta_handoff_quiz_choice_label();
    case 'ready-template-count':
      return m.activity_ai_fallback_handoff_ready_templates_label();
    case 'suggested-template-count':
      return m.activity_draft_meta_handoff_suggested_remix_label();
    case 'review-checklist-count':
      return m.activity_ai_fallback_handoff_checklist_label();
    case 'source-term-count':
      return m.activity_ai_fallback_handoff_source_terms_label();
    case 'source-summary':
      return m.activity_ai_fallback_handoff_source_summary_label();
    case 'source-material-note-boundary':
      return m.activity_ai_fallback_handoff_material_boundary_label();
    case 'multi-template-runtime':
      return m.activity_ai_fallback_handoff_multi_template_label();
    case 'listening-runtime':
      return m.activity_ai_fallback_handoff_listening_label();
    case 'group-sort-runtime':
      return m.activity_ai_fallback_handoff_group_sort_label();
    case 'open-box-runtime':
      return m.activity_ai_fallback_handoff_open_box_label();
    case 'privacy-guard':
      return m.activity_ai_fallback_handoff_privacy_label();
  }
}

function getActivityAiFallbackHandoffDescription(
  id: ActivityAiFallbackHandoffItemId
) {
  switch (id) {
    case 'fallback-provider':
      return m.activity_ai_fallback_handoff_provider_description();
    case 'fallback-model':
      return m.activity_ai_fallback_handoff_model_description();
    case 'generation-notice':
      return m.activity_ai_fallback_handoff_notice_description();
    case 'review-state':
      return m.activity_ai_fallback_handoff_review_state_description();
    case 'editor-application':
      return m.activity_ai_fallback_handoff_editor_application_description();
    case 'persistence-boundary':
      return m.activity_ai_fallback_handoff_persistence_description();
    case 'save-boundary':
      return m.activity_draft_meta_handoff_save_boundary_description();
    case 'publish-boundary':
      return m.activity_ai_fallback_handoff_publish_boundary_description();
    case 'template-preserved':
      return m.activity_ai_fallback_handoff_template_description();
    case 'draft-focus':
      return m.activity_ai_fallback_handoff_focus_description();
    case 'target-item-count':
      return m.activity_ai_fallback_handoff_target_items_description();
    case 'runtime-item-count':
      return m.activity_ai_fallback_handoff_runtime_items_description();
    case 'question-count':
      return m.activity_ai_fallback_handoff_questions_description();
    case 'pair-count':
      return m.activity_ai_fallback_handoff_pairs_description();
    case 'group-count':
      return m.activity_ai_fallback_handoff_groups_description();
    case 'vocabulary-count':
      return m.activity_ai_fallback_handoff_vocabulary_description();
    case 'teacher-note-count':
      return m.activity_ai_fallback_handoff_teacher_notes_description();
    case 'explanation-count':
      return m.activity_ai_fallback_handoff_explanations_description();
    case 'quiz-choice-readiness':
      return m.activity_draft_meta_handoff_quiz_choice_description();
    case 'ready-template-count':
      return m.activity_ai_fallback_handoff_ready_templates_description();
    case 'suggested-template-count':
      return m.activity_draft_meta_handoff_suggested_remix_description();
    case 'review-checklist-count':
      return m.activity_ai_fallback_handoff_checklist_description();
    case 'source-term-count':
      return m.activity_ai_fallback_handoff_source_terms_description();
    case 'source-summary':
      return m.activity_ai_fallback_handoff_source_summary_description();
    case 'source-material-note-boundary':
      return m.activity_ai_fallback_handoff_material_boundary_description();
    case 'multi-template-runtime':
      return m.activity_ai_fallback_handoff_multi_template_description();
    case 'listening-runtime':
      return m.activity_ai_fallback_handoff_listening_description();
    case 'group-sort-runtime':
      return m.activity_ai_fallback_handoff_group_sort_description();
    case 'open-box-runtime':
      return m.activity_ai_fallback_handoff_open_box_description();
    case 'privacy-guard':
      return m.activity_ai_fallback_handoff_privacy_description();
  }
}

function buildActivityAiFallbackHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiFallbackHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.activity_ai_fallback_handoff_item_aria_label({
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

function buildActivityAiFallbackHandoffPrivacyContract(
  itemViews: ActivityAiFallbackHandoffItemView[]
): ActivityAiFallbackHandoffPrivacyContract {
  return {
    appliesBeforeActivitySave: true,
    exposesAnswerText: false,
    exposesDraftSourceText: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesRawSourceMaterialNotes: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    requiresTeacherReview: true,
    scope: 'deterministic-ai-draft-fallback',
    usesCreateActivityInputContract: true,
    usesRuntimeItems: true,
  };
}

function formatActivityAiFallbackRuntimeTemplateCoverage(
  templateRuntimeCounts: ActivityAiFallbackTemplateRuntimeEvidence[]
) {
  const totalCount = normalizeActivityAiFallbackHandoffCount(
    templateRuntimeCounts.length
  );
  const readyCount = normalizeActivityAiFallbackHandoffCount(
    templateRuntimeCounts.filter((item) => item.runtimeItemCount > 0).length
  );

  return m.activity_ai_fallback_handoff_template_runtime_value({
    readyCount,
    totalCount,
  });
}

function getRuntimeItemCountForTemplate({
  templateRuntimeCounts,
  templateType,
}: {
  templateRuntimeCounts: ActivityAiFallbackTemplateRuntimeEvidence[];
  templateType: ActivityTemplateType;
}) {
  return normalizeActivityAiFallbackHandoffCount(
    templateRuntimeCounts.find((item) => item.templateType === templateType)
      ?.runtimeItemCount ?? 0
  );
}

function formatActivityAiFallbackChecklistCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_checklist_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_checklist_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackExplanationCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_explanation_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_explanation_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackGroupCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_group_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_group_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackItemCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_item_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_item_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackPairCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_pair_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_pair_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackPromptCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_prompt_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_prompt_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackQuestionCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_question_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_question_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackSourceTermCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_source_term_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_source_term_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackTeacherNoteCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_teacher_note_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_teacher_note_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackTemplateCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_template_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_template_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackTrackCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_track_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_track_count_many({
        count: normalizedCount,
      });
}

function formatActivityAiFallbackVocabularyCount(count: number) {
  const normalizedCount = normalizeActivityAiFallbackHandoffCount(count);
  return normalizedCount === 1
    ? m.activity_ai_fallback_handoff_vocabulary_count_one({
        count: normalizedCount,
      })
    : m.activity_ai_fallback_handoff_vocabulary_count_many({
        count: normalizedCount,
      });
}

function normalizeActivityAiFallbackHandoffCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
