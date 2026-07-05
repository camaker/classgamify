import {
  ACTIVITY_DRAFT_REVIEW_STATE,
  canApplyActivityDraftResultToEditor,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import {
  formatActivityAiDraftFocusLabel,
  type ActivityAiDraftFocus,
} from '@/activities/ai-draft-focus';
import { getTemplateByType } from '@/activities/catalog';
import type { ActivityTemplateType } from '@/activities/types';
import type { ActivityEditorAiDraftPanelView } from '@/activities/editor';
import { WORKERS_AI_MODELS } from '@/config/ai-models';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS = [
  'source-panel',
  'generation-gate',
  'auth-boundary',
  'server-function',
  'input-schema',
  'item-count',
  'draft-focus',
  'template-preserved',
  'source-sanitization',
  'safe-material-provenance',
  'omitted-material-notes',
  'file-byte-guard',
  'storage-key-guard',
  'provider-selection',
  'model-selection',
  'fallback-path',
  'json-response-boundary',
  'local-completion',
  'create-input-contract',
  'editor-review-gate',
  'persistence-boundary',
  'teacher-review-required',
  'editor-application',
  'save-boundary',
  'publish-boundary',
  'coverage-summary',
  'template-readiness',
  'quiz-choice-readiness',
  'notice-boundary',
  'privacy-guard',
] as const;

export type ActivityAiDraftBoundaryHandoffItemId =
  (typeof ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS)[number];

export type ActivityAiDraftBoundaryHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiDraftBoundaryHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAiDraftBoundaryHandoffPrivacyContract = {
  exposesActivityDraftText: false;
  exposesAnswerText: false;
  exposesFileBytes: false;
  exposesFileIds: false;
  exposesOmittedNotePayloads: false;
  exposesRawProviderResponse: false;
  exposesSourceText: false;
  exposesStorageKeys: false;
  itemIds: ActivityAiDraftBoundaryHandoffItemId[];
  persistsActivity: false;
  publishesAssignment: false;
  requiresTeacherReview: true;
};

export type ActivityAiDraftBoundaryHandoffView = {
  description: string;
  itemViews: ActivityAiDraftBoundaryHandoffItemView[];
  privacy: ActivityAiDraftBoundaryHandoffPrivacyContract;
  title: string;
};

export function buildActivityAiDraftBoundaryHandoffView({
  draftFocus,
  draftItemCount,
  draftResult,
  panelView,
  templateType,
}: {
  draftFocus: ActivityAiDraftFocus;
  draftItemCount: number;
  draftResult?: ActivityDraftResult;
  panelView: ActivityEditorAiDraftPanelView;
  templateType: ActivityTemplateType;
}): ActivityAiDraftBoundaryHandoffView {
  const itemViews = ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityAiDraftBoundaryHandoffItemView({
      description: getActivityAiDraftBoundaryHandoffDescription(id),
      id,
      label: getActivityAiDraftBoundaryHandoffLabel(id),
      value: getActivityAiDraftBoundaryHandoffValue({
        draftFocus,
        draftItemCount,
        draftResult,
        id,
        panelView,
        templateType,
      }),
    })
  );

  return {
    description: m.activity_ai_draft_boundary_handoff_description(),
    itemViews,
    privacy: buildActivityAiDraftBoundaryHandoffPrivacyContract(itemViews),
    title: m.activity_ai_draft_boundary_handoff_title(),
  };
}

function getActivityAiDraftBoundaryHandoffValue({
  draftFocus,
  draftItemCount,
  draftResult,
  id,
  panelView,
  templateType,
}: {
  draftFocus: ActivityAiDraftFocus;
  draftItemCount: number;
  draftResult?: ActivityDraftResult;
  id: ActivityAiDraftBoundaryHandoffItemId;
  panelView: ActivityEditorAiDraftPanelView;
  templateType: ActivityTemplateType;
}) {
  switch (id) {
    case 'source-panel':
      return m.activity_ai_draft_boundary_handoff_source_panel_value();
    case 'generation-gate':
      return panelView.canGenerateDraft
        ? m.activity_ai_draft_boundary_handoff_ready_value()
        : m.activity_ai_draft_boundary_handoff_blocked_value();
    case 'auth-boundary':
      return m.activity_ai_draft_boundary_handoff_auth_boundary_value();
    case 'server-function':
      return 'generateActivityDraft';
    case 'input-schema':
      return 'generateActivityDraftInputSchema';
    case 'item-count':
      return m.activity_ai_draft_boundary_handoff_item_count_value({
        count: normalizeAiDraftBoundaryCount(draftItemCount),
      });
    case 'draft-focus':
      return formatActivityAiDraftFocusLabel(draftFocus);
    case 'template-preserved':
      return getTemplateByType(templateType).name;
    case 'source-sanitization':
      return m.activity_ai_draft_boundary_handoff_source_sanitization_value();
    case 'safe-material-provenance':
      return getActivityAiDraftBoundarySourceMetricValue(panelView, 'safe');
    case 'omitted-material-notes':
      return getActivityAiDraftBoundarySourceMetricValue(panelView, 'omitted');
    case 'file-byte-guard':
      return m.activity_ai_draft_boundary_handoff_file_byte_guard_value();
    case 'storage-key-guard':
      return m.activity_ai_draft_boundary_handoff_storage_key_guard_value();
    case 'provider-selection':
      return formatActivityAiDraftBoundaryProvider(draftResult);
    case 'model-selection':
      return draftResult?.model ?? WORKERS_AI_MODELS.activityDraft;
    case 'fallback-path':
      return draftResult?.provider === 'fallback'
        ? m.activity_ai_draft_boundary_handoff_fallback_used_value()
        : m.activity_ai_draft_boundary_handoff_fallback_available_value();
    case 'json-response-boundary':
      return draftResult?.provider === 'workers-ai'
        ? m.activity_ai_draft_boundary_handoff_json_parsed_value()
        : m.activity_ai_draft_boundary_handoff_json_schema_value();
    case 'local-completion':
      return draftResult?.notice
        ? m.activity_ai_draft_boundary_handoff_notice_present_value()
        : m.activity_ai_draft_boundary_handoff_notice_absent_value();
    case 'create-input-contract':
      return 'CreateActivityInput';
    case 'editor-review-gate':
      return (
        draftResult?.reviewState.applicationMode ??
        ACTIVITY_DRAFT_REVIEW_STATE.applicationMode
      );
    case 'persistence-boundary':
      return (
        draftResult?.reviewState.persistenceMode ??
        ACTIVITY_DRAFT_REVIEW_STATE.persistenceMode
      );
    case 'teacher-review-required':
      return m.activity_ai_draft_boundary_handoff_review_required_value();
    case 'editor-application':
      return draftResult
        ? formatActivityAiDraftBoundaryBoolean(
            canApplyActivityDraftResultToEditor(draftResult)
          )
        : m.activity_ai_draft_boundary_handoff_pending_value();
    case 'save-boundary':
      return m.activity_ai_draft_boundary_handoff_save_boundary_value();
    case 'publish-boundary':
      return m.activity_ai_draft_boundary_handoff_publish_boundary_value();
    case 'coverage-summary':
      return formatActivityAiDraftBoundaryCoverage(draftResult);
    case 'template-readiness':
      return formatActivityAiDraftBoundaryTemplateReadiness(draftResult);
    case 'quiz-choice-readiness':
      return formatActivityAiDraftBoundaryQuizChoiceReadiness(draftResult);
    case 'notice-boundary':
      return draftResult?.notice
        ? m.activity_ai_draft_boundary_handoff_notice_present_value()
        : m.activity_ai_draft_boundary_handoff_notice_absent_value();
    case 'privacy-guard':
      return m.activity_ai_draft_boundary_handoff_private_omitted_value();
  }
}

function getActivityAiDraftBoundaryHandoffLabel(
  id: ActivityAiDraftBoundaryHandoffItemId
) {
  switch (id) {
    case 'source-panel':
      return m.activity_ai_draft_boundary_handoff_source_panel_label();
    case 'generation-gate':
      return m.activity_ai_draft_boundary_handoff_generation_gate_label();
    case 'auth-boundary':
      return m.activity_ai_draft_boundary_handoff_auth_boundary_label();
    case 'server-function':
      return m.activity_ai_draft_boundary_handoff_server_function_label();
    case 'input-schema':
      return m.activity_ai_draft_boundary_handoff_input_schema_label();
    case 'item-count':
      return m.activity_form_ai_item_count_label();
    case 'draft-focus':
      return m.activity_form_ai_focus_label();
    case 'template-preserved':
      return m.student_runtime_interaction_handoff_template_label();
    case 'source-sanitization':
      return m.activity_ai_draft_boundary_handoff_source_sanitization_label();
    case 'safe-material-provenance':
      return m.activity_ai_draft_boundary_handoff_safe_material_label();
    case 'omitted-material-notes':
      return m.activity_ai_draft_boundary_handoff_omitted_material_label();
    case 'file-byte-guard':
      return m.activity_ai_draft_boundary_handoff_file_byte_guard_label();
    case 'storage-key-guard':
      return m.activity_ai_draft_boundary_handoff_storage_key_guard_label();
    case 'provider-selection':
      return m.activity_ai_draft_boundary_handoff_provider_label();
    case 'model-selection':
      return m.activity_ai_draft_boundary_handoff_model_label();
    case 'fallback-path':
      return m.activity_ai_draft_boundary_handoff_fallback_label();
    case 'json-response-boundary':
      return m.activity_ai_draft_boundary_handoff_json_boundary_label();
    case 'local-completion':
      return m.activity_ai_draft_boundary_handoff_local_completion_label();
    case 'create-input-contract':
      return m.activity_ai_draft_boundary_handoff_create_input_label();
    case 'editor-review-gate':
      return m.activity_ai_draft_boundary_handoff_editor_review_label();
    case 'persistence-boundary':
      return m.activity_ai_draft_boundary_handoff_persistence_label();
    case 'teacher-review-required':
      return m.activity_ai_draft_boundary_handoff_teacher_review_label();
    case 'editor-application':
      return m.activity_ai_draft_boundary_handoff_editor_application_label();
    case 'save-boundary':
      return m.activity_ai_draft_boundary_handoff_save_boundary_label();
    case 'publish-boundary':
      return m.activity_ai_draft_boundary_handoff_publish_boundary_label();
    case 'coverage-summary':
      return m.activity_ai_draft_boundary_handoff_coverage_label();
    case 'template-readiness':
      return m.activity_ai_draft_boundary_handoff_template_readiness_label();
    case 'quiz-choice-readiness':
      return m.activity_ai_draft_boundary_handoff_quiz_choice_label();
    case 'notice-boundary':
      return m.activity_ai_draft_boundary_handoff_notice_label();
    case 'privacy-guard':
      return m.student_runtime_interaction_handoff_privacy_label();
  }
}

function getActivityAiDraftBoundaryHandoffDescription(
  id: ActivityAiDraftBoundaryHandoffItemId
) {
  switch (id) {
    case 'source-panel':
      return m.activity_ai_draft_boundary_handoff_source_panel_description();
    case 'generation-gate':
      return m.activity_ai_draft_boundary_handoff_generation_gate_description();
    case 'auth-boundary':
      return m.activity_ai_draft_boundary_handoff_auth_boundary_description();
    case 'server-function':
      return m.activity_ai_draft_boundary_handoff_server_function_description();
    case 'input-schema':
      return m.activity_ai_draft_boundary_handoff_input_schema_description();
    case 'item-count':
      return m.activity_ai_draft_boundary_handoff_item_count_description();
    case 'draft-focus':
      return m.activity_ai_draft_boundary_handoff_draft_focus_description();
    case 'template-preserved':
      return m.activity_ai_draft_boundary_handoff_template_description();
    case 'source-sanitization':
      return m.activity_ai_draft_boundary_handoff_source_sanitization_description();
    case 'safe-material-provenance':
      return m.activity_ai_draft_boundary_handoff_safe_material_description();
    case 'omitted-material-notes':
      return m.activity_ai_draft_boundary_handoff_omitted_material_description();
    case 'file-byte-guard':
      return m.activity_ai_draft_boundary_handoff_file_byte_guard_description();
    case 'storage-key-guard':
      return m.activity_ai_draft_boundary_handoff_storage_key_guard_description();
    case 'provider-selection':
      return m.activity_ai_draft_boundary_handoff_provider_description();
    case 'model-selection':
      return m.activity_ai_draft_boundary_handoff_model_description();
    case 'fallback-path':
      return m.activity_ai_draft_boundary_handoff_fallback_description();
    case 'json-response-boundary':
      return m.activity_ai_draft_boundary_handoff_json_boundary_description();
    case 'local-completion':
      return m.activity_ai_draft_boundary_handoff_local_completion_description();
    case 'create-input-contract':
      return m.activity_ai_draft_boundary_handoff_create_input_description();
    case 'editor-review-gate':
      return m.activity_ai_draft_boundary_handoff_editor_review_description();
    case 'persistence-boundary':
      return m.activity_ai_draft_boundary_handoff_persistence_description();
    case 'teacher-review-required':
      return m.activity_ai_draft_boundary_handoff_teacher_review_description();
    case 'editor-application':
      return m.activity_ai_draft_boundary_handoff_editor_application_description();
    case 'save-boundary':
      return m.activity_ai_draft_boundary_handoff_save_boundary_description();
    case 'publish-boundary':
      return m.activity_ai_draft_boundary_handoff_publish_boundary_description();
    case 'coverage-summary':
      return m.activity_ai_draft_boundary_handoff_coverage_description();
    case 'template-readiness':
      return m.activity_ai_draft_boundary_handoff_template_readiness_description();
    case 'quiz-choice-readiness':
      return m.activity_ai_draft_boundary_handoff_quiz_choice_description();
    case 'notice-boundary':
      return m.activity_ai_draft_boundary_handoff_notice_description();
    case 'privacy-guard':
      return m.activity_ai_draft_boundary_handoff_privacy_description();
  }
}

function buildActivityAiDraftBoundaryHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiDraftBoundaryHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.activity_ai_draft_boundary_handoff_item_aria({
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

function buildActivityAiDraftBoundaryHandoffPrivacyContract(
  itemViews: ActivityAiDraftBoundaryHandoffItemView[]
): ActivityAiDraftBoundaryHandoffPrivacyContract {
  return {
    exposesActivityDraftText: false,
    exposesAnswerText: false,
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesRawProviderResponse: false,
    exposesSourceText: false,
    exposesStorageKeys: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    persistsActivity: false,
    publishesAssignment: false,
    requiresTeacherReview: true,
  };
}

function getActivityAiDraftBoundarySourceMetricValue(
  panelView: ActivityEditorAiDraftPanelView,
  id: 'omitted' | 'safe'
) {
  return (
    panelView.sourceMaterialSafetyView.metricViews.find(
      (metricView) => metricView.id === id
    )?.value ?? m.activity_ai_draft_boundary_handoff_zero_sources_value()
  );
}

function formatActivityAiDraftBoundaryProvider(
  draftResult: ActivityDraftResult | undefined
) {
  if (!draftResult) {
    return m.activity_ai_draft_boundary_handoff_provider_pending_value();
  }

  return draftResult.provider === 'workers-ai'
    ? m.activity_draft_meta_provider_workers_ai()
    : m.activity_draft_meta_provider_fallback();
}

function formatActivityAiDraftBoundaryBoolean(value: boolean) {
  return value
    ? m.activity_ai_draft_boundary_handoff_ready_value()
    : m.activity_ai_draft_boundary_handoff_blocked_value();
}

function formatActivityAiDraftBoundaryCoverage(
  draftResult: ActivityDraftResult | undefined
) {
  if (!draftResult) {
    return m.activity_ai_draft_boundary_handoff_pending_value();
  }

  return m.activity_ai_draft_boundary_handoff_coverage_value({
    groups: draftResult.meta.coverage.groups,
    pairs: draftResult.meta.coverage.pairs,
    questions: draftResult.meta.coverage.questions,
    teacherNotes: draftResult.meta.coverage.teacherNotes,
    vocabulary: draftResult.meta.coverage.vocabulary,
  });
}

function formatActivityAiDraftBoundaryTemplateReadiness(
  draftResult: ActivityDraftResult | undefined
) {
  if (!draftResult) {
    return m.activity_ai_draft_boundary_handoff_pending_value();
  }

  const lockedTemplateCount = Math.max(
    0,
    draftResult.meta.templateReadiness.length -
      draftResult.meta.readyTemplateCount
  );

  return m.activity_ai_draft_boundary_handoff_template_readiness_value({
    locked: lockedTemplateCount,
    ready: draftResult.meta.readyTemplateCount,
  });
}

function formatActivityAiDraftBoundaryQuizChoiceReadiness(
  draftResult: ActivityDraftResult | undefined
) {
  if (!draftResult) {
    return m.activity_ai_draft_boundary_handoff_pending_value();
  }

  const readiness = draftResult.meta.questionChoiceReadiness;

  return m.activity_ai_draft_boundary_handoff_quiz_choice_value({
    completed: readiness.completedLocallyCount,
    explicit: readiness.explicitReadyCount,
    ready: readiness.readyCount,
    total: readiness.itemCount,
  });
}

function normalizeAiDraftBoundaryCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}
