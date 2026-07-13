export const ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS = [
  'fallback-contract-owner',
  'credential-missing-path',
  'invalid-json-path',
  'provider-call-boundary',
  'local-draft-generator',
  'input-schema-boundary',
  'source-sanitization',
  'material-note-omission',
  'safe-provenance-boundary',
  'source-term-plan',
  'fallback-padding',
  'target-item-count',
  'template-preservation',
  'draft-focus-preservation',
  'complete-question-fields',
  'complete-pair-fields',
  'complete-group-fields',
  'vocabulary-coverage',
  'teacher-note-coverage',
  'explanation-coverage',
  'create-input-mapping',
  'draft-metadata-summary',
  'template-readiness-preview',
  'quiz-choice-readiness',
  'editor-application',
  'teacher-review-gate',
  'save-boundary',
  'publish-boundary',
  'provider-secret-guard',
  'authoring-library-chain-boundary',
] as const;

export const ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/env/server.ts',
  'src/api/activity-ai.ts',
  'src/ai/workers.ts',
  'src/activities/ai-draft.ts',
  'src/activities/ai-draft-focus.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/ai-draft-fallback-handoff.ts',
  'src/activities/draft-source.ts',
  'src/activities/draft-meta.ts',
  'src/activities/material-references.ts',
  'src/activities/material-summary.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/source-extraction-assist.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/activities/template-remix.ts',
  'src/activities/distractors.ts',
  'src/activities/validation.ts',
  'src/activities/runtime.ts',
  'src/activities/catalog.ts',
  'src/activities/editor.ts',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-ai-draft-panel.tsx',
  'src/components/activities/activity-draft-meta-summary.tsx',
  'src/components/activities/activity-source-materials-field.tsx',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/routes/create.tsx',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/ai-enhancement-execution.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityAiFallbackDraftChainHandoffItemId =
  (typeof ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivityAiFallbackDraftChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiFallbackDraftChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAiFallbackDraftChainPrivacyContract = {
  callsWorkersAiWithoutCredentials: false;
  chainSourceFileCount: number;
  createsAssignmentLinks: false;
  exposesActivityContentBeforeTeacherReview: false;
  exposesAnswerText: false;
  exposesFileBytesToAi: false;
  exposesProviderApiTokens: false;
  exposesRawFallbackDraft: false;
  exposesRawProviderResponse: false;
  exposesRawSourceMaterialNotes: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivityAiFallbackDraftChainHandoffItemId[];
  keepsLocalCiStable: true;
  persistsActivityWithoutTeacherAction: false;
  providerCredentialsServerSide: true;
  publishesAssignmentWithoutTeacherAction: false;
  requiresCreateActivityInputContract: true;
  requiresDeterministicFallback: true;
  requiresEditorApplication: true;
  requiresTeacherReview: true;
  sourceFiles: string[];
  usesAuthoringLibraryChain: true;
  usesSanitizedSourceText: true;
};

export type ActivityAiFallbackDraftChainHandoffView = {
  description: string;
  itemViews: ActivityAiFallbackDraftChainHandoffItemView[];
  privacy: ActivityAiFallbackDraftChainPrivacyContract;
  title: string;
};

export function buildActivityAiFallbackDraftChainHandoffView(): ActivityAiFallbackDraftChainHandoffView {
  const itemViews = ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildActivityAiFallbackDraftChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice deterministic AI fallback draft chain from missing Workers AI credentials or invalid provider JSON through sanitized source-term planning, local classroom draft completion, CreateActivityInput mapping, editor review, save/publish boundaries, provider secret guards, and stable local development behavior.',
    itemViews,
    privacy: {
      callsWorkersAiWithoutCredentials: false,
      chainSourceFileCount:
        ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinks: false,
      exposesActivityContentBeforeTeacherReview: false,
      exposesAnswerText: false,
      exposesFileBytesToAi: false,
      exposesProviderApiTokens: false,
      exposesRawFallbackDraft: false,
      exposesRawProviderResponse: false,
      exposesRawSourceMaterialNotes: false,
      exposesRawSourceText: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      itemIds: [...ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS],
      keepsLocalCiStable: true,
      persistsActivityWithoutTeacherAction: false,
      providerCredentialsServerSide: true,
      publishesAssignmentWithoutTeacherAction: false,
      requiresCreateActivityInputContract: true,
      requiresDeterministicFallback: true,
      requiresEditorApplication: true,
      requiresTeacherReview: true,
      sourceFiles: [...ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES],
      usesAuthoringLibraryChain: true,
      usesSanitizedSourceText: true,
    },
    title: 'Activity AI fallback draft chain',
  };
}

function buildActivityAiFallbackDraftChainHandoffItemView(
  id: ActivityAiFallbackDraftChainHandoffItemId
): ActivityAiFallbackDraftChainHandoffItemView {
  const item = getActivityAiFallbackDraftChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivityAiFallbackDraftChainHandoffItem(
  id: ActivityAiFallbackDraftChainHandoffItemId
): Omit<ActivityAiFallbackDraftChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'fallback-contract-owner':
      return item(
        id,
        'Fallback contract owner',
        'ai-draft.ts',
        'AI draft generation owns the deterministic fallback path as a product-domain contract.'
      );
    case 'credential-missing-path':
      return item(
        id,
        'Credential missing path',
        'Missing credentials -> fallback',
        'When Workers AI credentials are absent, draft generation returns a local fallback draft instead of failing the editor flow.'
      );
    case 'invalid-json-path':
      return item(
        id,
        'Invalid JSON path',
        'Invalid provider JSON -> fallback',
        'Provider responses that cannot parse into draft JSON are discarded and replaced with a deterministic fallback draft.'
      );
    case 'provider-call-boundary':
      return item(
        id,
        'Provider call boundary',
        'Workers AI only when configured',
        'Workers AI calls happen only behind server-side credential checks and the authenticated server function.'
      );
    case 'local-draft-generator':
      return item(
        id,
        'Local draft generator',
        'createFallbackActivityDraft',
        'The local fallback generator produces a complete teacher-reviewable activity draft.'
      );
    case 'input-schema-boundary':
      return item(
        id,
        'Input schema boundary',
        'GenerateActivityDraftInput',
        'Fallback generation parses the same source, template, focus, difficulty, language, grade, and item-count input as provider generation.'
      );
    case 'source-sanitization':
      return item(
        id,
        'Source sanitization',
        'sanitizeActivityDraftSourceTextForAi',
        'Teacher notes are normalized and stripped of unsafe source-material metadata before fallback source-term planning.'
      );
    case 'material-note-omission':
      return item(
        id,
        'Material note omission',
        'Raw material notes omitted',
        'Fallback planning detects and omits raw attached-material note blocks from the generated source-term contract.'
      );
    case 'safe-provenance-boundary':
      return item(
        id,
        'Safe provenance boundary',
        'Kind and basename only',
        'Safe material provenance may describe kind and basename, not file ids, URLs, permissions, storage keys, or file bytes.'
      );
    case 'source-term-plan':
      return item(
        id,
        'Source-term plan',
        '30 planning slices',
        'Fallback source terms use a focused 30-slice plan for sanitization, extraction, selection, padding, consumers, and privacy.'
      );
    case 'fallback-padding':
      return item(
        id,
        'Fallback padding',
        'Deterministic classroom terms',
        'Sparse source notes are padded with localized deterministic classroom terms so local drafts remain usable.'
      );
    case 'target-item-count':
      return item(
        id,
        'Target item count',
        'Bounded item target',
        'Fallback questions, pairs, vocabulary, and runtime evidence follow the validated item-count range.'
      );
    case 'template-preservation':
      return item(
        id,
        'Template preservation',
        'Selected template kept',
        'The selected template type is preserved so teachers see the expected classroom mode in the editor.'
      );
    case 'draft-focus-preservation':
      return item(
        id,
        'Draft focus preservation',
        'Selected focus kept',
        'The selected draft focus carries into fallback copy, metadata, and review context.'
      );
    case 'complete-question-fields':
      return item(
        id,
        'Complete question fields',
        'Questions with explanations',
        'Fallback drafts include questions, answers, options where appropriate, and explanations.'
      );
    case 'complete-pair-fields':
      return item(
        id,
        'Complete pair fields',
        'Pairs ready',
        'Fallback drafts include match pairs for reusable match-up and line-match modes.'
      );
    case 'complete-group-fields':
      return item(
        id,
        'Complete group fields',
        'Groups ready',
        'Fallback drafts include group-sort data instead of leaving the activity tied to quiz-only content.'
      );
    case 'vocabulary-coverage':
      return item(
        id,
        'Vocabulary coverage',
        'Vocabulary terms',
        'Fallback drafts preserve the extracted source terms as vocabulary for review and remix readiness.'
      );
    case 'teacher-note-coverage':
      return item(
        id,
        'Teacher-note coverage',
        'Review notes',
        'Fallback drafts include teacher notes that explain focus, review, and remix expectations.'
      );
    case 'explanation-coverage':
      return item(
        id,
        'Explanation coverage',
        'Answer explanations',
        'Fallback questions include explanations so post-submit review and teacher result loops have useful context.'
      );
    case 'create-input-mapping':
      return item(
        id,
        'Create input mapping',
        'CreateActivityInput',
        'Fallback output is validated through the same CreateActivityInput contract as manual creation.'
      );
    case 'draft-metadata-summary':
      return item(
        id,
        'Draft metadata summary',
        'Coverage + trust',
        'Draft metadata summarizes provider, model, fallback notice, coverage counts, and review checklist state.'
      );
    case 'template-readiness-preview':
      return item(
        id,
        'Template readiness preview',
        'Ready and locked modes',
        'Fallback drafts feed deterministic template-readiness previews before teachers save.'
      );
    case 'quiz-choice-readiness':
      return item(
        id,
        'Quiz choice readiness',
        'Local choices checked',
        'Quiz fallback choices are checked through the same readiness contract as AI and manual drafts.'
      );
    case 'editor-application':
      return item(
        id,
        'Editor application',
        'Apply to editor',
        'Fallback drafts fill the existing editor fields for teacher review instead of bypassing the form.'
      );
    case 'teacher-review-gate':
      return item(
        id,
        'Teacher review gate',
        'Review required',
        'Teachers must inspect generated title, content, readiness, and notes before persistence.'
      );
    case 'save-boundary':
      return item(
        id,
        'Save boundary',
        'Teacher saves first',
        'Fallback draft generation never writes an activity record without an explicit teacher save action.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        'Save before publish',
        'Fallback draft generation cannot create assignment links or snapshots without the normal publish flow.'
      );
    case 'provider-secret-guard':
      return item(
        id,
        'Provider secret guard',
        'Worker secrets only',
        'Cloudflare account id and API token remain server-side and are not exposed through fallback handoffs.'
      );
    case 'authoring-library-chain-boundary':
      return item(
        id,
        'Authoring library chain',
        '30 authoring slices',
        'Fallback drafts remain inside shared authoring, teacher-owned persistence, activity library management, lifecycle gates, publish access, and assignment snapshot protection.'
      );
  }
}

function item(
  id: ActivityAiFallbackDraftChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiFallbackDraftChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
