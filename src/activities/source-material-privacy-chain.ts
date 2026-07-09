export const SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS = [
  'storage-upload-validation',
  'storage-owner-metadata',
  'storage-key-planning',
  'same-origin-access-proxy',
  'private-owner-access',
  'file-byte-stream-boundary',
  'filename-disposition-boundary',
  'material-classification',
  'activity-reference-shape',
  'reference-file-id-safety',
  'reference-filename-safety',
  'reference-duplicate-collapse',
  'activity-validation-normalization',
  'settings-library-summary',
  'settings-material-handoff',
  'picker-owner-scope',
  'picker-attachment-limit',
  'picker-reference-write',
  'draft-source-safe-notes',
  'draft-source-omitted-notes',
  'ai-draft-source-sanitization',
  'ai-draft-file-byte-guard',
  'ai-draft-storage-key-guard',
  'extraction-readiness',
  'extraction-editor-review',
  'extraction-parallel-model-guard',
  'public-assignment-source-guard',
  'student-runtime-source-guard',
  'unavailable-link-content-guard',
  'privacy-chain-gate',
] as const;

export const SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES = [
  'docs/storage.md',
  'src/api/user-files.ts',
  'src/hooks/use-user-files.ts',
  'src/storage/upload-readiness.ts',
  'src/storage/file-access.ts',
  'src/storage/file-materials.ts',
  'src/storage/file-material-labels.ts',
  'src/storage/file-material-classification.ts',
  'src/storage/file-summary.ts',
  'src/storage/file-query.ts',
  'src/activities/material-references.ts',
  'src/activities/material-summary.ts',
  'src/activities/draft-source.ts',
  'src/activities/source-extraction-assist.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/ai-draft.ts',
  'src/activities/validation.ts',
  'src/activities/editor.ts',
  'src/activities/library-summary.ts',
  'src/activities/library-view.ts',
  'src/activities/template-remix.ts',
  'src/assignments/public.ts',
  'src/assignments/student-runtime-item-list.ts',
  'src/assignments/unavailable-access.ts',
  'src/settings/files-view.ts',
  'src/components/settings/files/files-table.tsx',
  'src/components/settings/files/files-source-material-handoff-panel.tsx',
  'src/components/activities/activity-source-materials-field.tsx',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/components/activities/activity-ai-draft-panel.tsx',
] as const;

export type SourceMaterialPrivacyChainHandoffItemId =
  (typeof SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type SourceMaterialPrivacyChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SourceMaterialPrivacyChainHandoffItemId;
  label: string;
  value: string;
};

export type SourceMaterialPrivacyChainPrivacyContract = {
  allowsSafeFilenameBasenamesInTeacherAiNotes: true;
  chainSourceFileCount: number;
  exposesFileBytesToAi: false;
  exposesPermissionMetadataToActivityContent: false;
  exposesRawSourceMaterialListToStudents: false;
  exposesStorageKeysToActivityContent: false;
  exposesStorageKeysToStudents: false;
  itemIds: SourceMaterialPrivacyChainHandoffItemId[];
  keepsReferencesCompact: true;
  publicPayloadIncludesSourceMaterials: false;
  requiresTeacherReviewBeforeExtractionPersistence: true;
  sourceFiles: string[];
};

export type SourceMaterialPrivacyChainHandoffView = {
  description: string;
  itemViews: SourceMaterialPrivacyChainHandoffItemView[];
  privacy: SourceMaterialPrivacyChainPrivacyContract;
  title: string;
};

export function buildSourceMaterialPrivacyChainHandoffView(): SourceMaterialPrivacyChainHandoffView {
  const itemViews = SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildSourceMaterialPrivacyChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice source-material privacy chain from owner-scoped uploads through compact ActivityContent references, teacher-reviewed AI provenance, extraction readiness, and sanitized student payloads.',
    itemViews,
    privacy: {
      allowsSafeFilenameBasenamesInTeacherAiNotes: true,
      chainSourceFileCount: SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES.length,
      exposesFileBytesToAi: false,
      exposesPermissionMetadataToActivityContent: false,
      exposesRawSourceMaterialListToStudents: false,
      exposesStorageKeysToActivityContent: false,
      exposesStorageKeysToStudents: false,
      itemIds: [...SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS],
      keepsReferencesCompact: true,
      publicPayloadIncludesSourceMaterials: false,
      requiresTeacherReviewBeforeExtractionPersistence: true,
      sourceFiles: [...SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES],
    },
    title: 'Source material privacy chain',
  };
}

function buildSourceMaterialPrivacyChainHandoffItemView(
  id: SourceMaterialPrivacyChainHandoffItemId
): SourceMaterialPrivacyChainHandoffItemView {
  const item = getSourceMaterialPrivacyChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getSourceMaterialPrivacyChainHandoffItem(
  id: SourceMaterialPrivacyChainHandoffItemId
): Omit<SourceMaterialPrivacyChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'storage-upload-validation':
      return item(
        id,
        'Storage upload validation',
        '20 upload slices',
        'Upload planning validates file size, extension, content type, filename, owner scope, and public payload boundaries.'
      );
    case 'storage-owner-metadata':
      return item(
        id,
        'Storage owner metadata',
        'Owner-scoped userFiles',
        'Private classroom materials are tracked as owner-scoped userFiles metadata after upload.'
      );
    case 'storage-key-planning':
      return item(
        id,
        'Storage key planning',
        'Server-side R2 key',
        'R2 object keys stay in storage planning and server-side metadata instead of ActivityContent or student payloads.'
      );
    case 'same-origin-access-proxy':
      return item(
        id,
        'Same-origin access proxy',
        '30 access slices',
        'File access goes through the same-origin proxy boundary with safe key validation and cache/header rules.'
      );
    case 'private-owner-access':
      return item(
        id,
        'Private owner access',
        'Owner required',
        'Private userFiles require the current owner before storage provider fetches.'
      );
    case 'file-byte-stream-boundary':
      return item(
        id,
        'File byte stream boundary',
        'Stream only from storage',
        'File bytes may stream through file access responses but are absent from planning, ActivityContent, AI handoffs, and student payloads.'
      );
    case 'filename-disposition-boundary':
      return item(
        id,
        'Filename disposition boundary',
        'Attachment header only',
        'Original filenames are limited to teacher-facing rows and response disposition headers, not hidden payload contracts.'
      );
    case 'material-classification':
      return item(
        id,
        'Material classification',
        'Kind from metadata',
        'Material kind is derived from safe content-type and extension metadata without reading file bytes.'
      );
    case 'activity-reference-shape':
      return item(
        id,
        'Activity reference shape',
        'Compact reference',
        'ActivityContent.sourceMaterials keeps only fileId, kind, safe basename, content type, and size.'
      );
    case 'reference-file-id-safety':
      return item(
        id,
        'Reference file id safety',
        'Unsafe ids rejected',
        'Reference normalization rejects URLs, paths, tokens, control characters, and storage-key-like file ids.'
      );
    case 'reference-filename-safety':
      return item(
        id,
        'Reference filename safety',
        'Safe basename',
        'Reference filenames normalize to safe basenames and remove sensitive key/value fragments.'
      );
    case 'reference-duplicate-collapse':
      return item(
        id,
        'Reference duplicate collapse',
        'First 12 safe references',
        'Duplicate file ids collapse while preserving first safe references up to the source-material limit.'
      );
    case 'activity-validation-normalization':
      return item(
        id,
        'Activity validation normalization',
        'CreateActivityInput normalized',
        'Create/edit validation normalizes sourceMaterials through the shared compact reference contract.'
      );
    case 'settings-library-summary':
      return item(
        id,
        'Settings library summary',
        'Full owner library',
        'Settings files summaries describe the full owner-scoped material library, not only the visible page.'
      );
    case 'settings-material-handoff':
      return item(
        id,
        'Settings material handoff',
        '30 library slices',
        'Settings files handoff covers library, upload, table, ActivityContent reference, AI provenance, and student payload privacy.'
      );
    case 'picker-owner-scope':
      return item(
        id,
        'Picker owner scope',
        'Current teacher files',
        'Activity source-material picker reads sanitized current-teacher materials only.'
      );
    case 'picker-attachment-limit':
      return item(
        id,
        'Picker attachment limit',
        'Up to 12 files',
        'Picker state and reference normalization share the same attachment limit.'
      );
    case 'picker-reference-write':
      return item(
        id,
        'Picker reference write',
        'ActivityContent.sourceMaterials',
        'Attach and remove actions write compact source-material references into the activity editor.'
      );
    case 'draft-source-safe-notes':
      return item(
        id,
        'Draft source safe notes',
        'Safe material provenance',
        'AI draft source notes may include safe material kind labels and safe filename basenames.'
      );
    case 'draft-source-omitted-notes':
      return item(
        id,
        'Draft source omitted notes',
        'Unsafe notes omitted',
        'Unsafe source-material note lines are removed before AI draft input is prepared.'
      );
    case 'ai-draft-source-sanitization':
      return item(
        id,
        'AI draft source sanitization',
        'Sanitized source',
        'AI draft boundary uses sanitized source text and counts safe versus omitted material provenance.'
      );
    case 'ai-draft-file-byte-guard':
      return item(
        id,
        'AI draft file-byte guard',
        'Bytes omitted',
        'AI draft generation does not read or expose attached source-material file bytes.'
      );
    case 'ai-draft-storage-key-guard':
      return item(
        id,
        'AI draft storage-key guard',
        'Storage hidden',
        'AI draft handoffs keep R2 storage keys, file ids, URLs, query tokens, and permission metadata out.'
      );
    case 'extraction-readiness':
      return item(
        id,
        'Extraction readiness',
        'Future extraction paths',
        'Extraction assist exposes readiness for audio, worksheet, and spreadsheet paths without claiming bytes were read.'
      );
    case 'extraction-editor-review':
      return item(
        id,
        'Extraction editor review',
        'Teacher review required',
        'Extraction output targets the editor and requires teacher review before persistence or publishing.'
      );
    case 'extraction-parallel-model-guard':
      return item(
        id,
        'Extraction parallel model guard',
        'No parallel worksheet model',
        'Worksheet extraction extends ActivityContent instead of creating a parallel worksheet data model.'
      );
    case 'public-assignment-source-guard':
      return item(
        id,
        'Public assignment source guard',
        'Teacher materials hidden',
        'Public assignment payloads expose runtime prompts and choices, not teacher source-material lists.'
      );
    case 'student-runtime-source-guard':
      return item(
        id,
        'Student runtime source guard',
        'Source metadata hidden',
        'Student runtime semantic bundles do not include source-material metadata.'
      );
    case 'unavailable-link-content-guard':
      return item(
        id,
        'Unavailable link content guard',
        'Runtime hidden',
        'Closed or expired links hide runtime content, teacher materials, answers, and browser identity.'
      );
    case 'privacy-chain-gate':
      return item(
        id,
        'Privacy chain gate',
        '30 source files',
        'The source-material privacy chain keeps focused gates connected across storage, activity, AI, settings, and public assignment modules.'
      );
  }
}

function item(
  id: SourceMaterialPrivacyChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<SourceMaterialPrivacyChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
