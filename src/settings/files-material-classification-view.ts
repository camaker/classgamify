import { formatBytes } from '@/lib/formatter';
import { m } from '@/locale/paraglide/messages';
import {
  buildUserFileMaterialClassificationView,
  type UserFileMaterialClassificationInput,
} from '@/storage/file-material-classification';
import {
  buildUserFileMaterialSummaryItems,
  type UserFileMaterialSummary,
} from '@/storage/file-summary';

export const SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS = [
  'classification-source',
  'content-type-normalization',
  'extension-fallback',
  'audio-detection',
  'worksheet-image-detection',
  'worksheet-document-detection',
  'spreadsheet-detection',
  'archive-detection',
  'data-detection',
  'video-detection',
  'unknown-file-fallback',
  'table-primary-label',
  'table-secondary-detail',
  'summary-total-scope',
  'summary-storage-scope',
  'summary-worksheet-count',
  'summary-audio-count',
  'owner-scope',
  'activity-source-reference',
  'ai-provenance-reference',
  'student-payload-guard',
  'file-byte-guard',
  'storage-key-guard',
  'filename-path-guard',
  'permission-guard',
  'public-access-separation',
  'upload-validation-boundary',
  'visible-row-classification',
  'full-library-summary',
  'privacy-guard',
] as const;

export type SettingsFilesMaterialClassificationHandoffItemId =
  (typeof SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS)[number];

export type SettingsFilesMaterialClassificationHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsFilesMaterialClassificationHandoffItemId;
  label: string;
  value: string;
};

export type SettingsFilesMaterialClassificationPrivacyContract = {
  classificationUsesSafeBasenameExtension: true;
  exposesFileBytes: false;
  exposesOriginalFilenames: false;
  exposesPermissionMetadata: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: SettingsFilesMaterialClassificationHandoffItemId[];
  publicPayloadIncludesFileMetadata: false;
  scope: 'settings-files-material-classification';
  tableMayShowContentType: true;
};

export type SettingsFilesMaterialClassificationHandoffView = {
  description: string;
  itemViews: SettingsFilesMaterialClassificationHandoffItemView[];
  privacy: SettingsFilesMaterialClassificationPrivacyContract;
  title: string;
};

type BuildSettingsFilesMaterialClassificationHandoffViewOptions = {
  sampleFile?: UserFileMaterialClassificationInput;
  summary?: UserFileMaterialSummary;
  total?: number;
  visibleItemCount?: number;
};

export function buildSettingsFilesMaterialClassificationHandoffView({
  sampleFile,
  summary,
  total = summary?.totalFiles ?? 0,
  visibleItemCount = 0,
}: BuildSettingsFilesMaterialClassificationHandoffViewOptions = {}): SettingsFilesMaterialClassificationHandoffView {
  const normalizedSummary =
    summary ?? createEmptyMaterialClassificationSummary();
  const classificationView = buildUserFileMaterialClassificationView(
    sampleFile ?? {}
  );
  const itemViews = SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildSettingsFilesMaterialClassificationHandoffItemView({
        classificationView,
        id,
        summary: normalizedSummary,
        total,
        visibleItemCount,
      })
  );

  return {
    description: m.settings_files_material_classification_handoff_description(),
    itemViews,
    privacy: buildSettingsFilesMaterialClassificationPrivacyContract(itemViews),
    title: m.settings_files_material_classification_handoff_title(),
  };
}

function buildSettingsFilesMaterialClassificationHandoffItemView({
  classificationView,
  id,
  summary,
  total,
  visibleItemCount,
}: {
  classificationView: ReturnType<
    typeof buildUserFileMaterialClassificationView
  >;
  id: SettingsFilesMaterialClassificationHandoffItemId;
  summary: UserFileMaterialSummary;
  total: number;
  visibleItemCount: number;
}): SettingsFilesMaterialClassificationHandoffItemView {
  const value = getSettingsFilesMaterialClassificationHandoffItemValue({
    classificationView,
    id,
    summary,
    total,
    visibleItemCount,
  });
  const label = getSettingsFilesMaterialClassificationHandoffItemLabel(id);
  const description =
    getSettingsFilesMaterialClassificationHandoffItemDescription(id);

  return {
    ariaLabel: m.settings_files_material_classification_handoff_item_aria_label(
      {
        description,
        label,
        value,
      }
    ),
    description,
    id,
    label,
    value,
  };
}

function getSettingsFilesMaterialClassificationHandoffItemValue({
  classificationView,
  id,
  summary,
  total,
  visibleItemCount,
}: {
  classificationView: ReturnType<
    typeof buildUserFileMaterialClassificationView
  >;
  id: SettingsFilesMaterialClassificationHandoffItemId;
  summary: UserFileMaterialSummary;
  total: number;
  visibleItemCount: number;
}) {
  const summaryItems = buildUserFileMaterialSummaryItems(summary);
  const summaryValue = (summaryItemId: (typeof summaryItems)[number]['id']) =>
    summaryItems.find((item) => item.id === summaryItemId)?.value ??
    m.common_empty_value();

  switch (id) {
    case 'classification-source':
      return classificationView.basisLabel;
    case 'content-type-normalization':
      return classificationView.contentType ?? m.common_empty_value();
    case 'extension-fallback':
      return classificationView.extension
        ? `.${classificationView.extension}`
        : m.common_empty_value();
    case 'audio-detection':
      return String(summary.byKind.audio);
    case 'worksheet-image-detection':
      return String(summary.byKind['worksheet-image']);
    case 'worksheet-document-detection':
      return String(summary.byKind['worksheet-document']);
    case 'spreadsheet-detection':
      return String(summary.byKind.spreadsheet);
    case 'archive-detection':
      return String(summary.byKind.archive);
    case 'data-detection':
      return String(summary.byKind.data);
    case 'video-detection':
      return String(summary.byKind.video);
    case 'unknown-file-fallback':
      return String(summary.byKind.file);
    case 'table-primary-label':
      return classificationView.label;
    case 'table-secondary-detail':
      return classificationView.secondaryDetail;
    case 'summary-total-scope':
      return summaryValue('total-files');
    case 'summary-storage-scope':
      return summaryValue('total-storage');
    case 'summary-worksheet-count':
      return summaryValue('worksheet-materials');
    case 'summary-audio-count':
      return summaryValue('audio-materials');
    case 'owner-scope':
      return m.settings_files_handoff_owner_scope_value();
    case 'activity-source-reference':
      return 'ActivityContent.sourceMaterials';
    case 'ai-provenance-reference':
      return m.settings_files_workspace_summary_ai_label();
    case 'student-payload-guard':
      return m.settings_files_handoff_student_payload_guard_value();
    case 'file-byte-guard':
      return m.settings_files_handoff_file_byte_guard_value();
    case 'storage-key-guard':
      return m.settings_files_handoff_storage_key_guard_value();
    case 'filename-path-guard':
      return m.settings_files_handoff_safe_filename_value();
    case 'permission-guard':
      return m.settings_files_handoff_permission_guard_value();
    case 'public-access-separation':
      return m.settings_files_material_classification_public_access_value({
        privateCount: summary.privateFiles,
        publicCount: summary.publicFiles,
      });
    case 'upload-validation-boundary':
      return m.settings_files_material_classification_upload_validation_value();
    case 'visible-row-classification':
      return String(visibleItemCount);
    case 'full-library-summary':
      return m.settings_files_material_classification_library_value({
        count: Math.max(0, total, summary.totalFiles),
        storage: formatBytes(summary.totalBytes),
      });
    case 'privacy-guard':
      return m.settings_files_handoff_privacy_guard_value();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getSettingsFilesMaterialClassificationHandoffItemLabel(
  id: SettingsFilesMaterialClassificationHandoffItemId
) {
  switch (id) {
    case 'classification-source':
      return m.settings_files_material_classification_source_label();
    case 'content-type-normalization':
      return m.settings_files_material_classification_content_type_label();
    case 'extension-fallback':
      return m.settings_files_material_classification_extension_label();
    case 'audio-detection':
      return m.settings_files_material_type_audio();
    case 'worksheet-image-detection':
      return m.settings_files_material_type_worksheet_image();
    case 'worksheet-document-detection':
      return m.settings_files_material_type_worksheet_document();
    case 'spreadsheet-detection':
      return m.settings_files_material_type_spreadsheet();
    case 'archive-detection':
      return m.settings_files_material_type_archive();
    case 'data-detection':
      return m.settings_files_material_type_data();
    case 'video-detection':
      return m.settings_files_material_type_video();
    case 'unknown-file-fallback':
      return m.settings_files_material_type_file();
    case 'table-primary-label':
      return m.settings_files_material_classification_table_primary_label();
    case 'table-secondary-detail':
      return m.settings_files_material_classification_table_secondary_label();
    case 'summary-total-scope':
      return m.settings_files_summary_total_files();
    case 'summary-storage-scope':
      return m.settings_files_summary_total_storage();
    case 'summary-worksheet-count':
      return m.settings_files_summary_worksheet_materials();
    case 'summary-audio-count':
      return m.settings_files_summary_audio_materials();
    case 'owner-scope':
      return m.settings_files_handoff_owner_scope_label();
    case 'activity-source-reference':
      return m.settings_files_handoff_activity_source_reference_label();
    case 'ai-provenance-reference':
      return m.settings_files_workspace_summary_ai_label();
    case 'student-payload-guard':
      return m.settings_files_handoff_student_payload_guard_label();
    case 'file-byte-guard':
      return m.settings_files_handoff_file_byte_guard_label();
    case 'storage-key-guard':
      return m.settings_files_handoff_storage_key_guard_label();
    case 'filename-path-guard':
      return m.settings_files_handoff_safe_filename_label();
    case 'permission-guard':
      return m.settings_files_handoff_permission_guard_label();
    case 'public-access-separation':
      return m.settings_files_material_classification_public_access_label();
    case 'upload-validation-boundary':
      return m.settings_files_material_classification_upload_validation_label();
    case 'visible-row-classification':
      return m.settings_files_handoff_visible_items_label();
    case 'full-library-summary':
      return m.settings_files_material_classification_library_label();
    case 'privacy-guard':
      return m.settings_files_handoff_privacy_guard_label();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getSettingsFilesMaterialClassificationHandoffItemDescription(
  id: SettingsFilesMaterialClassificationHandoffItemId
) {
  switch (id) {
    case 'classification-source':
      return m.settings_files_material_classification_source_description();
    case 'content-type-normalization':
      return m.settings_files_material_classification_content_type_description();
    case 'extension-fallback':
      return m.settings_files_material_classification_extension_description();
    case 'audio-detection':
      return m.settings_files_handoff_audio_materials_description();
    case 'worksheet-image-detection':
      return m.settings_files_material_classification_worksheet_image_description();
    case 'worksheet-document-detection':
      return m.settings_files_material_classification_worksheet_document_description();
    case 'spreadsheet-detection':
      return m.settings_files_material_classification_spreadsheet_description();
    case 'archive-detection':
      return m.settings_files_material_classification_archive_description();
    case 'data-detection':
      return m.settings_files_material_classification_data_description();
    case 'video-detection':
      return m.settings_files_material_classification_video_description();
    case 'unknown-file-fallback':
      return m.settings_files_material_classification_unknown_description();
    case 'table-primary-label':
      return m.settings_files_material_classification_table_primary_description();
    case 'table-secondary-detail':
      return m.settings_files_material_classification_table_secondary_description();
    case 'summary-total-scope':
      return m.settings_files_handoff_total_files_description();
    case 'summary-storage-scope':
      return m.settings_files_handoff_total_storage_description();
    case 'summary-worksheet-count':
      return m.settings_files_handoff_worksheet_materials_description();
    case 'summary-audio-count':
      return m.settings_files_handoff_audio_materials_description();
    case 'owner-scope':
      return m.settings_files_handoff_owner_scope_description();
    case 'activity-source-reference':
      return m.settings_files_handoff_activity_source_reference_description();
    case 'ai-provenance-reference':
      return m.settings_files_workspace_summary_ai_description();
    case 'student-payload-guard':
      return m.settings_files_handoff_student_payload_guard_description();
    case 'file-byte-guard':
      return m.settings_files_handoff_file_byte_guard_description();
    case 'storage-key-guard':
      return m.settings_files_handoff_storage_key_guard_description();
    case 'filename-path-guard':
      return m.settings_files_handoff_safe_filename_description();
    case 'permission-guard':
      return m.settings_files_handoff_permission_guard_description();
    case 'public-access-separation':
      return m.settings_files_material_classification_public_access_description();
    case 'upload-validation-boundary':
      return m.settings_files_material_classification_upload_validation_description();
    case 'visible-row-classification':
      return m.settings_files_handoff_visible_items_description();
    case 'full-library-summary':
      return m.settings_files_material_classification_library_description();
    case 'privacy-guard':
      return m.settings_files_handoff_privacy_guard_description();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function buildSettingsFilesMaterialClassificationPrivacyContract(
  itemViews: SettingsFilesMaterialClassificationHandoffItemView[]
): SettingsFilesMaterialClassificationPrivacyContract {
  return {
    classificationUsesSafeBasenameExtension: true,
    exposesFileBytes: false,
    exposesOriginalFilenames: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds: itemViews.map((item) => item.id),
    publicPayloadIncludesFileMetadata: false,
    scope: 'settings-files-material-classification',
    tableMayShowContentType: true,
  };
}

function createEmptyMaterialClassificationSummary(): UserFileMaterialSummary {
  return {
    audioFiles: 0,
    byKind: {
      archive: 0,
      audio: 0,
      data: 0,
      file: 0,
      spreadsheet: 0,
      video: 0,
      'worksheet-document': 0,
      'worksheet-image': 0,
    },
    privateFiles: 0,
    publicFiles: 0,
    totalBytes: 0,
    totalFiles: 0,
    worksheetFiles: 0,
  };
}
