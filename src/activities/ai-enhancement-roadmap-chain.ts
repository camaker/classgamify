export const ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_HANDOFF_ITEM_IDS = [
  'product-ai-enhancement-boundary',
  'source-to-activity-draft',
  'template-transform-boundary',
  'deterministic-remix-precheck',
  'ai-remix-completion',
  'distractor-generation-target',
  'question-option-contract',
  'leveled-variant-boundary',
  'answer-explanation-target',
  'listening-script-boundary',
  'worksheet-extraction-boundary',
  'audio-extraction-readiness',
  'spreadsheet-import-readiness',
  'source-material-provenance',
  'source-byte-guard',
  'storage-key-guard',
  'raw-provider-output-guard',
  'create-input-contract',
  'activity-content-target',
  'editor-review-gate',
  'draft-coverage-summary',
  'template-readiness-diagnosis',
  'save-gate',
  'publish-boundary',
  'assignment-snapshot-protection',
  'public-payload-guard',
  'result-export-continuity',
  'deterministic-fallback',
  'provider-credential-gate',
  'ai-enhancement-chain-gate',
] as const;

export const ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/activity-ai.ts',
  'src/ai/workers.ts',
  'src/config/ai-models.ts',
  'src/activities/ai-draft.ts',
  'src/activities/ai-draft-focus.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/ai-draft-fallback-handoff.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/ai-remix-assist.ts',
  'src/activities/template-roadmap-capability-chain.ts',
  'src/activities/template-remix.ts',
  'src/activities/distractors.ts',
  'src/activities/question-options.ts',
  'src/activities/draft-meta.ts',
  'src/activities/draft-source.ts',
  'src/activities/source-extraction-assist.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/material-references.ts',
  'src/activities/material-summary.ts',
  'src/activities/listening-speech.ts',
  'src/activities/validation.ts',
  'src/activities/editor.ts',
  'src/activities/persistence.ts',
  'src/activities/scaffolds.ts',
  'src/activities/types.ts',
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'src/assignments/results-export.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityAiEnhancementRoadmapChainHandoffItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivityAiEnhancementRoadmapChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementRoadmapChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementRoadmapChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinksWithoutTeacherAction: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesFileBytesToAi: false;
  exposesRawAiOutput: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivityAiEnhancementRoadmapChainHandoffItemId[];
  keepsLeveledVariantsAsDrafts: true;
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresCreateActivityInputContract: true;
  requiresEditorReview: true;
  sourceFiles: string[];
  usesDeterministicFallback: true;
  usesSharedActivityAssignmentModel: true;
  writesDistractorsToQuestionOptions: true;
};

export type ActivityAiEnhancementRoadmapChainHandoffView = {
  description: string;
  itemViews: ActivityAiEnhancementRoadmapChainHandoffItemView[];
  privacy: ActivityAiEnhancementRoadmapChainPrivacyContract;
  title: string;
};

export function buildActivityAiEnhancementRoadmapChainHandoffView(): ActivityAiEnhancementRoadmapChainHandoffView {
  const itemViews = ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildActivityAiEnhancementRoadmapChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice AI enhancement roadmap chain from template transforms, distractors, leveled variants, answer explanations, listening scripts, and worksheet extraction through teacher-reviewed CreateActivityInput drafts, source privacy, save/publish gates, snapshots, public payloads, and result export continuity.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinksWithoutTeacherAction: false,
      exposesAnswerKeysToPublicPayload: false,
      exposesFileBytesToAi: false,
      exposesRawAiOutput: false,
      exposesRawSourceText: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      itemIds: [...ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_HANDOFF_ITEM_IDS],
      keepsLeveledVariantsAsDrafts: true,
      mutatesExistingAssignmentSnapshots: false,
      persistsActivityWithoutTeacherAction: false,
      publishesAssignmentWithoutTeacherAction: false,
      readsSourceMaterialBytes: false,
      requiresCreateActivityInputContract: true,
      requiresEditorReview: true,
      sourceFiles: [...ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES],
      usesDeterministicFallback: true,
      usesSharedActivityAssignmentModel: true,
      writesDistractorsToQuestionOptions: true,
    },
    title: 'Activity AI enhancement roadmap chain',
  };
}

function buildActivityAiEnhancementRoadmapChainHandoffItemView(
  id: ActivityAiEnhancementRoadmapChainHandoffItemId
): ActivityAiEnhancementRoadmapChainHandoffItemView {
  const item = getActivityAiEnhancementRoadmapChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivityAiEnhancementRoadmapChainHandoffItem(
  id: ActivityAiEnhancementRoadmapChainHandoffItemId
): Omit<ActivityAiEnhancementRoadmapChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-ai-enhancement-boundary':
      return item(
        id,
        'Product AI enhancement boundary',
        'Teacher-reviewed roadmap',
        'AI enhancements are roadmap capabilities that must stay inside teacher-reviewed activity authoring and assignment delivery boundaries.'
      );
    case 'source-to-activity-draft':
      return item(
        id,
        'Source-to-activity draft',
        'CreateActivityInput draft',
        'Source-to-activity generation continues to produce a validated activity draft instead of direct persistence.'
      );
    case 'template-transform-boundary':
      return item(
        id,
        'Template transform boundary',
        'Structured field proposal',
        'Template transforms may propose missing questions, pairs, groups, vocabulary, or notes before save.'
      );
    case 'deterministic-remix-precheck':
      return item(
        id,
        'Deterministic remix precheck',
        'Readiness first',
        'Template readiness and deterministic remix paths are evaluated before any AI completion is considered.'
      );
    case 'ai-remix-completion':
      return item(
        id,
        'AI remix completion',
        'Missing fields only',
        'AI remix assistance fills missing structured fields while keeping the original activity and published snapshots protected.'
      );
    case 'distractor-generation-target':
      return item(
        id,
        'Distractor generation target',
        'ActivityQuestion.options',
        'Future AI distractors write into the existing question option list instead of changing runtime submission shape.'
      );
    case 'question-option-contract':
      return item(
        id,
        'Question option contract',
        'Four-choice readiness',
        'Quiz option readiness stays aligned with deterministic choice generation and teacher approval.'
      );
    case 'leveled-variant-boundary':
      return item(
        id,
        'Leveled variant boundary',
        'Draft copy variant',
        'Leveled variants should be draft copies or editor proposals, not mutations to the source activity or frozen assignment snapshots.'
      );
    case 'answer-explanation-target':
      return item(
        id,
        'Answer explanation target',
        'Question explanations',
        'Generated explanations target the activity question explanation fields and remain teacher-reviewed before students see them.'
      );
    case 'listening-script-boundary':
      return item(
        id,
        'Listening script boundary',
        'Listening prompt draft',
        'Listening scripts feed the activity content model and speech-language path without exposing transcript details before review.'
      );
    case 'worksheet-extraction-boundary':
      return item(
        id,
        'Worksheet extraction boundary',
        'ActivityContent target',
        'Worksheet extraction targets the shared ActivityContent model and editor review rather than a parallel worksheet schema.'
      );
    case 'audio-extraction-readiness':
      return item(
        id,
        'Audio extraction readiness',
        'Listening draft path',
        'Audio source materials can signal listening draft readiness while file bytes remain outside AI handoffs.'
      );
    case 'spreadsheet-import-readiness':
      return item(
        id,
        'Spreadsheet import readiness',
        'Structured import path',
        'Spreadsheet source materials can signal future structured import readiness without creating product records.'
      );
    case 'source-material-provenance':
      return item(
        id,
        'Source material provenance',
        'Kind and basename only',
        'AI enhancement prompts may use safe material kind and filename basename provenance, never storage identifiers.'
      );
    case 'source-byte-guard':
      return item(
        id,
        'Source byte guard',
        'No file bytes',
        'Future enhancement contracts do not read uploaded source-material bytes until a dedicated extraction pipeline exists.'
      );
    case 'storage-key-guard':
      return item(
        id,
        'Storage key guard',
        'Storage hidden',
        'Storage keys, file ids, URLs, path segments, query tokens, and permission metadata stay out of AI enhancement handoffs.'
      );
    case 'raw-provider-output-guard':
      return item(
        id,
        'Raw provider output guard',
        'Parsed fields only',
        'Provider output must be parsed into normalized draft fields or discarded for fallback before reaching app surfaces.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        'CreateActivityInput',
        'AI enhancement outputs target the same validated input contract used by manual creation and editing.'
      );
    case 'activity-content-target':
      return item(
        id,
        'Activity content target',
        'Questions/pairs/groups',
        'Generated transforms, explanations, scripts, and extraction results map into shared ActivityContent fields.'
      );
    case 'editor-review-gate':
      return item(
        id,
        'Editor review gate',
        'Review before save',
        'Teachers must inspect and edit AI enhancement proposals in the activity editor before persistence.'
      );
    case 'draft-coverage-summary':
      return item(
        id,
        'Draft coverage summary',
        'Coverage counts',
        'Enhancement outputs keep coverage counts for questions, pairs, groups, vocabulary, and teacher notes visible before save.'
      );
    case 'template-readiness-diagnosis':
      return item(
        id,
        'Template readiness diagnosis',
        'Ready and locked modes',
        'Enhancements continue to use deterministic ready/locked template diagnostics for teacher review.'
      );
    case 'save-gate':
      return item(
        id,
        'Save gate',
        'Teacher action required',
        'AI enhancement proposals cannot write activity records until the teacher explicitly saves the editor form.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        'No assignment link',
        'AI enhancement work cannot publish assignments or create share links without the assignment flow.'
      );
    case 'assignment-snapshot-protection':
      return item(
        id,
        'Assignment snapshot protection',
        'Frozen links protected',
        'Existing assignment snapshots keep their frozen title, template, content, and delivery rules.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        'Sanitized runtime only',
        'Public student payloads receive sanitized runtime prompts and choices, not source materials, answer keys, or raw AI output.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        'Shared export model',
        'AI-enhanced activities still produce attempts and result exports through the same assignment result model.'
      );
    case 'deterministic-fallback':
      return item(
        id,
        'Deterministic fallback',
        'Local stable draft',
        'Missing credentials or invalid provider JSON must keep returning stable teacher-reviewable draft output.'
      );
    case 'provider-credential-gate':
      return item(
        id,
        'Provider credential gate',
        'Configured provider only',
        'Workers AI or future providers run only through configured server-side credentials and authenticated server functions.'
      );
    case 'ai-enhancement-chain-gate':
      return item(
        id,
        'AI enhancement chain gate',
        '30 source files',
        'A focused gate keeps AI enhancement roadmap promises aligned with source privacy, editor review, save/publish boundaries, snapshots, public payloads, and result exports.'
      );
  }
}

function item(
  id: ActivityAiEnhancementRoadmapChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementRoadmapChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
