export const ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS = [
  'card-summary-surface',
  'activity-card-boundary',
  'activity-content-source-materials',
  'normalized-reference-input',
  'attached-count-summary',
  'material-kind-summary',
  'material-kind-badges',
  'audio-count',
  'worksheet-document-count',
  'worksheet-image-count',
  'spreadsheet-count',
  'reference-only-count',
  'extractable-count',
  'readiness-status',
  'primary-next-step',
  'extraction-action-map',
  'audio-extraction-readiness',
  'worksheet-extraction-readiness',
  'spreadsheet-import-readiness',
  'edit-action-slot',
  'editor-return-path',
  'library-card-consumer',
  'library-filter-consumer',
  'source-extraction-assist-alignment',
  'ai-source-provenance-alignment',
  'source-material-privacy-chain',
  'public-payload-guard',
  'filename-file-id-guard',
  'storage-file-byte-guard',
  'student-payload-guard',
] as const;

export const ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/material-summary.ts',
  'src/activities/material-references.ts',
  'src/activities/types.ts',
  'src/activities/library-view.ts',
  'src/activities/library-query.ts',
  'src/activities/library-summary.ts',
  'src/activities/library-filters.ts',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/components/activities/activity-library-card.tsx',
  'src/components/activities/activity-library-search.tsx',
  'src/components/activities/activity-library-summary-card.tsx',
  'src/components/activities/activity-source-materials-field.tsx',
  'src/activities/source-extraction-assist.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/draft-source.ts',
  'src/activities/ai-draft.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/storage/file-materials.ts',
  'src/storage/file-material-labels.ts',
  'src/storage/file-material-classification.ts',
  'src/settings/files-view.ts',
  'src/components/settings/files/files-source-material-handoff-panel.tsx',
  'src/assignments/public.ts',
  'src/assignments/student-runtime-item-list.ts',
  'scripts/activity-source-material-card-handoff-semantic-views.test.ts',
  'scripts/source-extraction-lifecycle-chain-handoff.test.ts',
  'scripts/source-material-privacy-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivitySourceMaterialSummaryChainHandoffItemId =
  (typeof ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivitySourceMaterialSummaryChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivitySourceMaterialSummaryChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivitySourceMaterialSummaryChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignments: false;
  exposesContentTypes: false;
  exposesFileBytes: false;
  exposesOriginalFilenames: false;
  exposesPermissionMetadata: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentPayloadFileReferences: false;
  exposesStudentPayloadFileList: false;
  itemIds: ActivitySourceMaterialSummaryChainHandoffItemId[];
  mutatesActivityContent: false;
  publishesAssignmentLinks: false;
  readsFileBytes: false;
  scope: 'activity-source-material-summary-chain';
  sourceFiles: string[];
  summarizesByMaterialKind: true;
  usesActivityCardSourceMaterialHandoff: true;
  usesActivityContentSourceMaterials: true;
  usesActivityLibraryConsumers: true;
  usesEditorReturnPath: true;
  usesExtractionReadinessActions: true;
  usesSourceExtractionLifecycleChain: true;
  usesSourceMaterialPrivacyChain: true;
};

export type ActivitySourceMaterialSummaryChainHandoffView = {
  description: string;
  itemViews: ActivitySourceMaterialSummaryChainHandoffItemView[];
  privacy: ActivitySourceMaterialSummaryChainPrivacyContract;
  title: string;
};

export function buildActivitySourceMaterialSummaryChainHandoffView(): ActivitySourceMaterialSummaryChainHandoffView {
  const itemViews = ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildActivitySourceMaterialSummaryChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice activity-card source-material summary chain from compact ActivityContent.sourceMaterials references through safe material-kind counts, extraction readiness, editor return paths, activity-library consumers, source-extraction alignment, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES.length,
      createsAssignments: false,
      exposesContentTypes: false,
      exposesFileBytes: false,
      exposesOriginalFilenames: false,
      exposesPermissionMetadata: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentPayloadFileReferences: false,
      exposesStudentPayloadFileList: false,
      itemIds: [...ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS],
      mutatesActivityContent: false,
      publishesAssignmentLinks: false,
      readsFileBytes: false,
      scope: 'activity-source-material-summary-chain',
      sourceFiles: [...ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES],
      summarizesByMaterialKind: true,
      usesActivityCardSourceMaterialHandoff: true,
      usesActivityContentSourceMaterials: true,
      usesActivityLibraryConsumers: true,
      usesEditorReturnPath: true,
      usesExtractionReadinessActions: true,
      usesSourceExtractionLifecycleChain: true,
      usesSourceMaterialPrivacyChain: true,
    },
    title: 'Activity source-material summary chain',
  };
}

function buildActivitySourceMaterialSummaryChainHandoffItemView(
  id: ActivitySourceMaterialSummaryChainHandoffItemId
): ActivitySourceMaterialSummaryChainHandoffItemView {
  const item = getActivitySourceMaterialSummaryChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivitySourceMaterialSummaryChainHandoffItem(
  id: ActivitySourceMaterialSummaryChainHandoffItemId
): Omit<ActivitySourceMaterialSummaryChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'card-summary-surface':
      return item(
        id,
        'Card summary surface',
        'Activity source-material card',
        'Activity cards can summarize attached classroom materials without opening the editor.'
      );
    case 'activity-card-boundary':
      return item(
        id,
        'Activity card boundary',
        'Library card scope',
        'The source-material summary belongs to the owner-scoped activity library card surface.'
      );
    case 'activity-content-source-materials':
      return item(
        id,
        'ActivityContent source materials',
        'ActivityContent.sourceMaterials',
        'Card summaries derive from the shared activity content references instead of file-table rows.'
      );
    case 'normalized-reference-input':
      return item(
        id,
        'Normalized reference input',
        'Compact references',
        'Source-material references are normalized before counts, readiness, and display labels are prepared.'
      );
    case 'attached-count-summary':
      return item(
        id,
        'Attached count summary',
        'Attached file count',
        'The card exposes a safe total count of attached source materials.'
      );
    case 'material-kind-summary':
      return item(
        id,
        'Material-kind summary',
        'Kind summary',
        'The summary groups attached materials by teacher-facing material kind.'
      );
    case 'material-kind-badges':
      return item(
        id,
        'Material-kind badges',
        'Kind badges',
        'Visible badges show safe material-kind labels and counts only.'
      );
    case 'audio-count':
      return item(
        id,
        'Audio count',
        'Audio materials',
        'Audio materials contribute to listening-draft readiness without exposing filenames.'
      );
    case 'worksheet-document-count':
      return item(
        id,
        'Worksheet document count',
        'Worksheet documents',
        'Worksheet document materials contribute to worksheet extraction readiness.'
      );
    case 'worksheet-image-count':
      return item(
        id,
        'Worksheet image count',
        'Worksheet images',
        'Worksheet image materials contribute to worksheet extraction readiness.'
      );
    case 'spreadsheet-count':
      return item(
        id,
        'Spreadsheet count',
        'Spreadsheet materials',
        'Spreadsheet materials contribute to future vocabulary or question import readiness.'
      );
    case 'reference-only-count':
      return item(
        id,
        'Reference-only count',
        'Reference-only materials',
        'Non-extractable materials stay visible as reference-only classroom provenance.'
      );
    case 'extractable-count':
      return item(
        id,
        'Extractable count',
        'Extraction-ready materials',
        'Audio, worksheet, and spreadsheet materials contribute to the extractable count.'
      );
    case 'readiness-status':
      return item(
        id,
        'Readiness status',
        'Extraction readiness',
        'The card prepares a readiness status before any future extraction pipeline runs.'
      );
    case 'primary-next-step':
      return item(
        id,
        'Primary next step',
        'Teacher next step',
        'The first available extraction action provides a teacher-facing next-step label.'
      );
    case 'extraction-action-map':
      return item(
        id,
        'Extraction action map',
        'Three readiness actions',
        'The summary maps attached materials to audio extraction, worksheet extraction, and spreadsheet import actions.'
      );
    case 'audio-extraction-readiness':
      return item(
        id,
        'Audio extraction readiness',
        'Listening draft path',
        'Audio readiness points toward future teacher-reviewed listening draft generation.'
      );
    case 'worksheet-extraction-readiness':
      return item(
        id,
        'Worksheet extraction readiness',
        'Worksheet extraction path',
        'Worksheet readiness points toward future teacher-reviewed worksheet extraction.'
      );
    case 'spreadsheet-import-readiness':
      return item(
        id,
        'Spreadsheet import readiness',
        'Spreadsheet import path',
        'Spreadsheet readiness points toward future teacher-reviewed structured import.'
      );
    case 'edit-action-slot':
      return item(
        id,
        'Edit action slot',
        'Edit action available',
        'The library card can expose a safe edit action when the activity lifecycle allows editing.'
      );
    case 'editor-return-path':
      return item(
        id,
        'Editor return path',
        'Return to editor',
        'Teachers reopen the activity editor before changing source-material references.'
      );
    case 'library-card-consumer':
      return item(
        id,
        'Library card consumer',
        'Activity card consumer',
        'Activity library cards consume the prepared summary view instead of rebuilding count logic.'
      );
    case 'library-filter-consumer':
      return item(
        id,
        'Library filter consumer',
        'Source filter consumer',
        'Activity library source filters consume the same material-kind readiness semantics.'
      );
    case 'source-extraction-assist-alignment':
      return item(
        id,
        'Source extraction assist alignment',
        'Extraction lifecycle aligned',
        'The card summary stays aligned with the broader source extraction lifecycle chain.'
      );
    case 'ai-source-provenance-alignment':
      return item(
        id,
        'AI source provenance alignment',
        'Safe AI provenance',
        'AI draft provenance may use safe material kind and basename signals without exposing storage details.'
      );
    case 'source-material-privacy-chain':
      return item(
        id,
        'Source-material privacy chain',
        'Privacy chain aligned',
        'The card summary inherits compact-reference and source-material privacy guards.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        'Public payload hidden',
        'Student runtime payloads do not receive the teacher source-material file list.'
      );
    case 'filename-file-id-guard':
      return item(
        id,
        'Filename and file-id guard',
        'Filenames and ids hidden',
        'The chain hides original filenames and file ids from aggregate handoff output.'
      );
    case 'storage-file-byte-guard':
      return item(
        id,
        'Storage and file-byte guard',
        'Storage and bytes hidden',
        'The chain never exposes R2 keys, storage metadata, or file bytes.'
      );
    case 'student-payload-guard':
      return item(
        id,
        'Student payload guard',
        'Runtime file list hidden',
        'Public assignment and student-runner payloads stay free of source-material references.'
      );
  }
}

function item(
  id: ActivitySourceMaterialSummaryChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivitySourceMaterialSummaryChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
