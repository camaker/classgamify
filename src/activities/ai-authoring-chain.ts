export const ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS = [
  'source-panel-readiness',
  'source-text-priority',
  'safe-material-provenance',
  'unsafe-material-omission',
  'generate-input-schema',
  'auth-server-boundary',
  'provider-selection',
  'model-selection',
  'fallback-draft-path',
  'fallback-source-term-plan',
  'local-completion-contract',
  'create-input-contract',
  'editor-review-gate',
  'draft-coverage-summary',
  'template-readiness-diagnosis',
  'quiz-choice-readiness',
  'template-remix-foundation',
  'ai-remix-assist-boundary',
  'source-byte-guard',
  'storage-key-guard',
  'raw-provider-response-guard',
  'direct-persistence-guard',
  'publish-boundary',
  'editor-application',
  'template-scaffold-context',
  'save-gate-review',
  'activity-persistence-handoff',
  'assignment-snapshot-protection',
  'distractor-write-target',
  'ai-authoring-chain-gate',
] as const;

export const ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/activity-ai.ts',
  'src/ai/workers.ts',
  'src/activities/ai-draft.ts',
  'src/activities/ai-draft-focus.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/ai-draft-fallback-handoff.ts',
  'src/activities/draft-source.ts',
  'src/activities/draft-meta.ts',
  'src/activities/template-remix.ts',
  'src/activities/ai-remix-assist.ts',
  'src/activities/distractors.ts',
  'src/activities/question-options.ts',
  'src/activities/scaffolds.ts',
  'src/activities/catalog.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/activities/persistence.ts',
  'src/activities/editor.ts',
  'src/activities/material-references.ts',
  'src/activities/material-summary.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/source-extraction-assist.ts',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-ai-draft-panel.tsx',
  'src/components/activities/activity-draft-meta-summary.tsx',
  'src/components/activities/activity-source-materials-field.tsx',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/routes/create.tsx',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityAiAuthoringChainHandoffItemId =
  (typeof ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivityAiAuthoringChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiAuthoringChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAiAuthoringChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinks: false;
  exposesActivityContentBeforeTeacherReview: false;
  exposesAnswerText: false;
  exposesFileBytesToAi: false;
  exposesRawProviderResponse: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivityAiAuthoringChainHandoffItemId[];
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  requiresAuthenticatedTeacher: true;
  requiresCreateActivityInputContract: true;
  requiresDeterministicFallback: true;
  requiresTeacherReview: true;
  sourceFiles: string[];
};

export type ActivityAiAuthoringChainHandoffView = {
  description: string;
  itemViews: ActivityAiAuthoringChainHandoffItemView[];
  privacy: ActivityAiAuthoringChainPrivacyContract;
  title: string;
};

export function buildActivityAiAuthoringChainHandoffView(): ActivityAiAuthoringChainHandoffView {
  const itemViews = ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityAiAuthoringChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice AI authoring chain from safe teacher source notes and authenticated draft generation through deterministic fallback, CreateActivityInput mapping, editor review, template readiness, and save/publish boundaries.',
    itemViews,
    privacy: {
      chainSourceFileCount: ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinks: false,
      exposesActivityContentBeforeTeacherReview: false,
      exposesAnswerText: false,
      exposesFileBytesToAi: false,
      exposesRawProviderResponse: false,
      exposesRawSourceText: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      itemIds: [...ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS],
      persistsActivityWithoutTeacherAction: false,
      publishesAssignmentWithoutTeacherAction: false,
      requiresAuthenticatedTeacher: true,
      requiresCreateActivityInputContract: true,
      requiresDeterministicFallback: true,
      requiresTeacherReview: true,
      sourceFiles: [...ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES],
    },
    title: 'Activity AI authoring chain',
  };
}

function buildActivityAiAuthoringChainHandoffItemView(
  id: ActivityAiAuthoringChainHandoffItemId
): ActivityAiAuthoringChainHandoffItemView {
  const item = getActivityAiAuthoringChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivityAiAuthoringChainHandoffItem(
  id: ActivityAiAuthoringChainHandoffItemId
): Omit<ActivityAiAuthoringChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'source-panel-readiness':
      return item(
        id,
        'Source panel readiness',
        'Teacher source gate',
        'The create editor prepares source notes, attached-material context, and generate-button readiness before requesting a draft.'
      );
    case 'source-text-priority':
      return item(
        id,
        'Source text priority',
        'Structured notes first',
        'Draft source helpers choose teacher-entered source text before synced structured activity fields.'
      );
    case 'safe-material-provenance':
      return item(
        id,
        'Safe material provenance',
        'Kind and basename only',
        'Attached source-material notes may include safe material kind labels and sanitized filename basenames.'
      );
    case 'unsafe-material-omission':
      return item(
        id,
        'Unsafe material omission',
        'Unsafe notes omitted',
        'Storage keys, URLs, ids, permission details, and unsafe material notes are removed before AI draft prompts.'
      );
    case 'generate-input-schema':
      return item(
        id,
        'Generate input schema',
        'GenerateActivityDraftInput',
        'AI generation input is parsed through the shared schema for source text, template, focus, item count, and classroom fields.'
      );
    case 'auth-server-boundary':
      return item(
        id,
        'Auth server boundary',
        'Authenticated teacher',
        'The server function requires the teacher auth middleware before calling the AI draft service.'
      );
    case 'provider-selection':
      return item(
        id,
        'Provider selection',
        'Workers AI or fallback',
        'Workers AI runs only when credentials are present; otherwise the same contract returns a local deterministic draft.'
      );
    case 'model-selection':
      return item(
        id,
        'Model selection',
        'Configured model',
        'The active Workers AI activity-draft model is selected from shared AI model configuration.'
      );
    case 'fallback-draft-path':
      return item(
        id,
        'Fallback draft path',
        'Deterministic local draft',
        'Missing credentials or invalid model JSON return a stable teacher-reviewable fallback draft result.'
      );
    case 'fallback-source-term-plan':
      return item(
        id,
        'Fallback source-term plan',
        'Safe terms only',
        'Fallback source terms are extracted from sanitized notes and padded deterministically when source material is sparse.'
      );
    case 'local-completion-contract':
      return item(
        id,
        'Local completion contract',
        'Complete classroom fields',
        'Partial AI drafts are locally completed into questions, pairs, groups, vocabulary, explanations, and teacher notes.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        'CreateActivityInput',
        'Generated drafts map into the same CreateActivityInput contract used by manual activity creation.'
      );
    case 'editor-review-gate':
      return item(
        id,
        'Editor review gate',
        'Review before save',
        'Drafts fill the editor for teacher review and do not persist directly from the AI layer.'
      );
    case 'draft-coverage-summary':
      return item(
        id,
        'Draft coverage summary',
        'Coverage counts',
        'Draft metadata summarizes question, pair, group, vocabulary, and teacher-note coverage.'
      );
    case 'template-readiness-diagnosis':
      return item(
        id,
        'Template readiness diagnosis',
        'Ready and locked modes',
        'Draft metadata reuses deterministic template-readiness diagnostics so teachers see playable and blocked modes.'
      );
    case 'quiz-choice-readiness':
      return item(
        id,
        'Quiz choice readiness',
        'Distractors checked',
        'Quiz-choice readiness checks explicit choices and local deterministic completion before publish.'
      );
    case 'template-remix-foundation':
      return item(
        id,
        'Template remix foundation',
        'Deterministic readiness',
        'Template remixing stays a content-readiness decision before any AI completion path.'
      );
    case 'ai-remix-assist-boundary':
      return item(
        id,
        'AI remix assist boundary',
        'Completion before save',
        'AI remix assist may fill missing structured fields only before save and still requires editor review.'
      );
    case 'source-byte-guard':
      return item(
        id,
        'Source byte guard',
        'No file bytes',
        'AI authoring handoffs do not read or expose attached source-material file bytes.'
      );
    case 'storage-key-guard':
      return item(
        id,
        'Storage key guard',
        'Storage hidden',
        'Source-material storage keys and file identifiers stay out of AI prompts, handoffs, and draft summaries.'
      );
    case 'raw-provider-response-guard':
      return item(
        id,
        'Raw provider response guard',
        'Parsed JSON only',
        'Raw provider responses are parsed into normalized draft fields or discarded for fallback.'
      );
    case 'direct-persistence-guard':
      return item(
        id,
        'Direct persistence guard',
        'No direct save',
        'AI draft and remix paths cannot mutate the activity library without a teacher save action.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        'No assignment link',
        'AI authoring cannot create assignment links or publish snapshots without the explicit assignment flow.'
      );
    case 'editor-application':
      return item(
        id,
        'Editor application',
        'Apply to form',
        'The AI draft result is applied into editor fields for teacher editing instead of bypassing the form.'
      );
    case 'template-scaffold-context':
      return item(
        id,
        'Template scaffold context',
        'Shared editor model',
        'Template scaffolds and AI drafts both demonstrate the same one-activity-many-modes content model.'
      );
    case 'save-gate-review':
      return item(
        id,
        'Save gate review',
        'Teacher action required',
        'Editor save gates keep manual validation and teacher intent between AI output and persisted content.'
      );
    case 'activity-persistence-handoff':
      return item(
        id,
        'Activity persistence handoff',
        'Create/update helpers',
        'Activity persistence uses shared create/update helpers after teacher review, not AI service writes.'
      );
    case 'assignment-snapshot-protection':
      return item(
        id,
        'Assignment snapshot protection',
        'Future links only',
        'AI edits and remixes affect drafts or future assignments without changing existing frozen snapshots.'
      );
    case 'distractor-write-target':
      return item(
        id,
        'Distractor write target',
        'ActivityQuestion.options',
        'Future AI distractors must write into the existing question option structure and keep the student submission contract unchanged.'
      );
    case 'ai-authoring-chain-gate':
      return item(
        id,
        'AI authoring chain gate',
        '30 source files',
        'The AI authoring chain keeps source safety, generation, fallback, metadata, remix, editor, persistence, and publish gates connected.'
      );
  }
}

function item(
  id: ActivityAiAuthoringChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiAuthoringChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
