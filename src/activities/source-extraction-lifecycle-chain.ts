export const SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-extraction-policy',
  'activity-content-source-materials',
  'compact-reference-boundary',
  'material-kind-classification',
  'readiness-action-map',
  'audio-extraction-readiness',
  'worksheet-extraction-readiness',
  'spreadsheet-import-readiness',
  'reference-only-state',
  'source-summary-view',
  'source-summary-hidden-handoff',
  'picker-owner-scope',
  'picker-reference-write',
  'settings-library-provenance',
  'ai-source-safe-provenance',
  'ai-source-omitted-notes',
  'ai-draft-boundary-sanitization',
  'activity-content-target',
  'question-pair-group-targets',
  'accepted-answer-target',
  'template-readiness-target',
  'editor-review-gate',
  'persistence-boundary',
  'publish-boundary',
  'assignment-snapshot-boundary',
  'source-material-privacy-chain-alignment',
  'ai-authoring-chain-alignment',
  'template-roadmap-chain-alignment',
  'public-payload-privacy',
  'source-extraction-lifecycle-gate',
] as const;

export const SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/source-extraction-assist.ts',
  'src/activities/material-summary.ts',
  'src/activities/material-references.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/activities/editor.ts',
  'src/activities/draft-source.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/ai-draft.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/template-roadmap-capability-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/storage/file-materials.ts',
  'src/storage/file-material-labels.ts',
  'src/storage/file-material-classification.ts',
  'src/storage/file-summary.ts',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/components/activities/activity-source-materials-field.tsx',
  'src/components/activities/activity-ai-draft-panel.tsx',
  'src/components/settings/files/files-source-material-handoff-panel.tsx',
  'src/settings/files-view.ts',
  'src/assignments/public.ts',
  'src/assignments/student-runtime-item-list.ts',
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'src/assignments/printable-worksheet-view.ts',
  'scripts/activity-source-extraction-assist-handoff-semantic-views.test.ts',
  'scripts/source-material-privacy-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type SourceExtractionLifecycleChainHandoffItemId =
  (typeof SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type SourceExtractionLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SourceExtractionLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type SourceExtractionLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  createsParallelWorksheetModel: false;
  exposesAcceptedAnswerTextInHandoff: false;
  exposesActivityContentTextInHandoff: false;
  exposesFileBytesToAi: false;
  exposesRawSourceMaterialFileIdsInHandoff: false;
  exposesSourceMaterialFilenamesInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesSourceMaterialsToPublicPayload: false;
  itemIds: SourceExtractionLifecycleChainHandoffItemId[];
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresEditorReview: true;
  sourceFiles: string[];
  targetsActivityContent: true;
  usesCompactSourceMaterialReferences: true;
};

export type SourceExtractionLifecycleChainHandoffView = {
  description: string;
  itemViews: SourceExtractionLifecycleChainHandoffItemView[];
  privacy: SourceExtractionLifecycleChainPrivacyContract;
  title: string;
};

export function buildSourceExtractionLifecycleChainHandoffView(): SourceExtractionLifecycleChainHandoffView {
  const itemViews = SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildSourceExtractionLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice source extraction lifecycle chain from compact teacher source-material references through extraction readiness, AI-safe provenance, ActivityContent write targets, editor review, assignment snapshot protection, and public payload privacy.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      createsParallelWorksheetModel: false,
      exposesAcceptedAnswerTextInHandoff: false,
      exposesActivityContentTextInHandoff: false,
      exposesFileBytesToAi: false,
      exposesRawSourceMaterialFileIdsInHandoff: false,
      exposesSourceMaterialFilenamesInHandoff: false,
      exposesSourceMaterialStorageKeys: false,
      exposesSourceMaterialsToPublicPayload: false,
      itemIds: [...SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      persistsActivityWithoutTeacherAction: false,
      publishesAssignmentWithoutTeacherAction: false,
      readsSourceMaterialBytes: false,
      requiresEditorReview: true,
      sourceFiles: [...SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES],
      targetsActivityContent: true,
      usesCompactSourceMaterialReferences: true,
    },
    title: 'Source extraction lifecycle chain',
  };
}

function buildSourceExtractionLifecycleChainHandoffItemView(
  id: SourceExtractionLifecycleChainHandoffItemId
): SourceExtractionLifecycleChainHandoffItemView {
  const item = getSourceExtractionLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getSourceExtractionLifecycleChainHandoffItem(
  id: SourceExtractionLifecycleChainHandoffItemId
): Omit<SourceExtractionLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-extraction-policy':
      return item(
        id,
        'Product extraction policy',
        'Product policy',
        'docs/product.md keeps teacher-uploaded audio, worksheet, and spreadsheet materials as compact references before dedicated extraction pipelines exist.'
      );
    case 'activity-content-source-materials':
      return item(
        id,
        'ActivityContent source materials',
        'ActivityContent.sourceMaterials',
        'Source materials attach to the shared activity content model instead of a separate extraction-only model.'
      );
    case 'compact-reference-boundary':
      return item(
        id,
        'Compact reference boundary',
        'Compact references',
        'Material references keep the compact fileId, material kind, safe basename, content type, and size shape.'
      );
    case 'material-kind-classification':
      return item(
        id,
        'Material kind classification',
        'Metadata classification',
        'Readiness decisions use safe content-type and extension metadata without reading source file bytes.'
      );
    case 'readiness-action-map':
      return item(
        id,
        'Readiness action map',
        'Three readiness actions',
        'Material summary actions map extractable audio, worksheet, and spreadsheet materials to teacher-facing readiness paths.'
      );
    case 'audio-extraction-readiness':
      return item(
        id,
        'Audio extraction readiness',
        'Audio draft ready',
        'Audio materials can signal a future listening draft path while still requiring teacher review.'
      );
    case 'worksheet-extraction-readiness':
      return item(
        id,
        'Worksheet extraction readiness',
        'Worksheet extraction ready',
        'Worksheet images and documents can signal future extraction into existing activity fields.'
      );
    case 'spreadsheet-import-readiness':
      return item(
        id,
        'Spreadsheet import readiness',
        'Spreadsheet import ready',
        'Spreadsheet materials can signal structured import readiness for vocabulary, questions, or grouped content.'
      );
    case 'reference-only-state':
      return item(
        id,
        'Reference-only state',
        'Reference-only explicit',
        'Non-extractable materials remain visible as reference-only counts instead of implying unsupported extraction.'
      );
    case 'source-summary-view':
      return item(
        id,
        'Source summary view',
        'Summary view model',
        'The source-material summary view prepares counts, readiness status, extraction actions, and primary next steps.'
      );
    case 'source-summary-hidden-handoff':
      return item(
        id,
        'Source summary hidden handoff',
        'Hidden dl handoff',
        'The activity source summary exposes extraction readiness through a hidden dl handoff, not an extra visible product surface.'
      );
    case 'picker-owner-scope':
      return item(
        id,
        'Picker owner scope',
        'Current teacher files',
        'The source-material picker attaches sanitized current-teacher file references only.'
      );
    case 'picker-reference-write':
      return item(
        id,
        'Picker reference write',
        'Writes compact refs',
        'Picker attach and remove actions write compact source-material references into ActivityContent.'
      );
    case 'settings-library-provenance':
      return item(
        id,
        'Settings library provenance',
        'Settings provenance',
        'Settings files handoffs preserve material provenance for teachers without exposing storage keys to students.'
      );
    case 'ai-source-safe-provenance':
      return item(
        id,
        'AI source safe provenance',
        'Kind and basename only',
        'AI draft source notes may include material kind labels and safe filename basenames.'
      );
    case 'ai-source-omitted-notes':
      return item(
        id,
        'AI source omitted notes',
        'Unsafe notes omitted',
        'File ids, storage keys, URLs, paths, query tokens, and permission metadata are omitted before AI prompts.'
      );
    case 'ai-draft-boundary-sanitization':
      return item(
        id,
        'AI draft boundary sanitization',
        'Sanitized AI source',
        'AI draft boundaries use sanitized source text and keep raw source-material provenance private.'
      );
    case 'activity-content-target':
      return item(
        id,
        'ActivityContent target',
        'ActivityContent target',
        'Extraction readiness targets the existing ActivityContent structure used by manual activities.'
      );
    case 'question-pair-group-targets':
      return item(
        id,
        'Question pair group targets',
        'Structured field targets',
        'Future extracted material must land in the existing question, pair, group, vocabulary, and teacher-note fields.'
      );
    case 'accepted-answer-target':
      return item(
        id,
        'Accepted answer target',
        'Accepted answers',
        'Accepted-answer data stays inside the reviewed activity model and is not exposed in handoff payloads.'
      );
    case 'template-readiness-target':
      return item(
        id,
        'Template readiness target',
        'Template readiness',
        'Extraction output must continue through shared template-readiness checks before teachers publish assignments.'
      );
    case 'editor-review-gate':
      return item(
        id,
        'Editor review gate',
        'Teacher review required',
        'Extraction assists can prepare editor drafts but cannot persist content without teacher review.'
      );
    case 'persistence-boundary':
      return item(
        id,
        'Persistence boundary',
        'Not auto-saved',
        'Source extraction readiness cannot save or update an activity without a teacher save action.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        'No auto-publish',
        'Extraction readiness cannot publish assignment links or snapshots directly.'
      );
    case 'assignment-snapshot-boundary':
      return item(
        id,
        'Assignment snapshot boundary',
        'Snapshots unchanged',
        'Existing published assignment snapshots remain unchanged when draft source materials are attached or prepared.'
      );
    case 'source-material-privacy-chain-alignment':
      return item(
        id,
        'Source-material privacy chain alignment',
        'Privacy chain aligned',
        'The lifecycle chain stays aligned with storage, activity reference, AI source, and student payload privacy contracts.'
      );
    case 'ai-authoring-chain-alignment':
      return item(
        id,
        'AI authoring chain alignment',
        'AI authoring aligned',
        'AI authoring keeps source safety, deterministic fallback, editor review, and save/publish boundaries intact.'
      );
    case 'template-roadmap-chain-alignment':
      return item(
        id,
        'Template roadmap chain alignment',
        'Roadmap aligned',
        'Template roadmap promises keep worksheet extraction on the shared activity-assignment-attempt-results foundation.'
      );
    case 'public-payload-privacy':
      return item(
        id,
        'Public payload privacy',
        'Public payload hidden',
        'Public student payloads expose runtime prompts and choices, not teacher source-material lists or storage keys.'
      );
    case 'source-extraction-lifecycle-gate':
      return item(
        id,
        'Source extraction lifecycle gate',
        '30 source files',
        'The focused gate keeps source extraction readiness discoverable across product docs, activity, AI, storage, settings, assignment, and catalog surfaces.'
      );
  }
}

function item(
  id: SourceExtractionLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<SourceExtractionLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
