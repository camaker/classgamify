import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import {
  buildUserFileMaterialSummaryItems,
  type UserFileMaterialSummary,
} from '@/storage/file-summary';

export type SettingsFilesWorkspaceSummaryItemId =
  | 'activity-attachments'
  | 'ai-provenance'
  | 'source-library'
  | 'student-privacy';

export type SettingsFilesWorkspaceSummaryItemView = {
  description: string;
  id: SettingsFilesWorkspaceSummaryItemId;
  label: string;
};

export type SettingsFilesWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  itemViews: SettingsFilesWorkspaceSummaryItemView[];
  title: string;
};

export const SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS = [
  'owner-scope',
  'storage-feature-gate',
  'source-library',
  'upload-dialog',
  'upload-file-input',
  'upload-description',
  'upload-visibility',
  'total-files',
  'total-storage',
  'worksheet-materials',
  'audio-materials',
  'private-materials',
  'public-materials',
  'visible-page-items',
  'pagination',
  'table-name-column',
  'table-material-column',
  'table-access-column',
  'open-link-action',
  'delete-action',
  'activity-source-reference',
  'activity-attachment-boundary',
  'ai-provenance',
  'safe-filename-provenance',
  'file-byte-guard',
  'storage-key-guard',
  'permission-guard',
  'student-payload-guard',
  'worksheet-extraction-boundary',
  'privacy-guard',
] as const;

export type SettingsFilesSourceMaterialHandoffItemId =
  (typeof SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS)[number];

export type SettingsFilesSourceMaterialHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsFilesSourceMaterialHandoffItemId;
  label: string;
  value: string;
};

export type SettingsFilesSourceMaterialHandoffPrivacyContract = {
  exposesActivityContent: false;
  exposesFileBytes: false;
  exposesPermissionMetadata: false;
  exposesRawStudentIdentity: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherPrivateFilenames: false;
  itemIds: SettingsFilesSourceMaterialHandoffItemId[];
  publicPayloadIncludesFileList: false;
  scope: 'teacher-source-material-library';
  storageKeysStayServerSide: true;
  tracksOwnerScopedUserFiles: true;
};

export type SettingsFilesSourceMaterialHandoffView = {
  description: string;
  itemViews: SettingsFilesSourceMaterialHandoffItemView[];
  privacy: SettingsFilesSourceMaterialHandoffPrivacyContract;
  title: string;
};

export type SettingsFilesPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  title: string;
  workspaceSummaryView: SettingsFilesWorkspaceSummaryView;
};

export function isSettingsFilesEnabled() {
  return websiteConfig.storage?.enable === true;
}

export function buildSettingsFilesPageViewModel(): SettingsFilesPageViewModel {
  const title = m.settings_files_title();
  const description = m.settings_files_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'files', label: title, isCurrentPage: true },
    ],
    description,
    title,
    workspaceSummaryView: buildSettingsFilesWorkspaceSummaryView(),
  };
}

export function buildSettingsFilesWorkspaceSummaryView(): SettingsFilesWorkspaceSummaryView {
  const title = m.settings_files_workspace_summary_title();
  const description = m.settings_files_workspace_summary_description();

  return {
    ariaLabel: m.settings_files_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    itemViews: [
      {
        description: m.settings_files_workspace_summary_library_description(),
        id: 'source-library',
        label: m.settings_files_workspace_summary_library_label(),
      },
      {
        description:
          m.settings_files_workspace_summary_attachments_description(),
        id: 'activity-attachments',
        label: m.settings_files_workspace_summary_attachments_label(),
      },
      {
        description: m.settings_files_workspace_summary_ai_description(),
        id: 'ai-provenance',
        label: m.settings_files_workspace_summary_ai_label(),
      },
      {
        description: m.settings_files_workspace_summary_privacy_description(),
        id: 'student-privacy',
        label: m.settings_files_workspace_summary_privacy_label(),
      },
    ],
    title,
  };
}

export function buildSettingsFilesSourceMaterialHandoffView({
  loading = false,
  pageIndex = 0,
  pageSize = 10,
  summary,
  total = summary?.totalFiles ?? 0,
  uploading = false,
  visibleItemCount = 0,
}: {
  loading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  summary?: UserFileMaterialSummary;
  total?: number;
  uploading?: boolean;
  visibleItemCount?: number;
} = {}): SettingsFilesSourceMaterialHandoffView {
  const normalizedSummary = summary ?? createEmptySettingsFilesSummary();
  const itemViews = SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS.map((id) =>
    buildSettingsFilesSourceMaterialHandoffItemView({
      id,
      loading,
      pageIndex,
      pageSize,
      summary: normalizedSummary,
      total,
      uploading,
      visibleItemCount,
    })
  );

  return {
    description: m.settings_files_handoff_description(),
    itemViews,
    privacy: buildSettingsFilesSourceMaterialHandoffPrivacyContract(itemViews),
    title: m.settings_files_handoff_title(),
  };
}

function buildSettingsFilesSourceMaterialHandoffItemView({
  id,
  loading,
  pageIndex,
  pageSize,
  summary,
  total,
  uploading,
  visibleItemCount,
}: {
  id: SettingsFilesSourceMaterialHandoffItemId;
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  summary: UserFileMaterialSummary;
  total: number;
  uploading: boolean;
  visibleItemCount: number;
}): SettingsFilesSourceMaterialHandoffItemView {
  const value = getSettingsFilesSourceMaterialHandoffItemValue({
    id,
    loading,
    pageIndex,
    pageSize,
    summary,
    total,
    uploading,
    visibleItemCount,
  });
  const label = getSettingsFilesSourceMaterialHandoffItemLabel(id);
  const description = getSettingsFilesSourceMaterialHandoffItemDescription(id);

  return {
    ariaLabel: m.settings_files_handoff_item_aria_label({
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

function getSettingsFilesSourceMaterialHandoffItemValue({
  id,
  loading,
  pageIndex,
  pageSize,
  summary,
  total,
  uploading,
  visibleItemCount,
}: {
  id: SettingsFilesSourceMaterialHandoffItemId;
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  summary: UserFileMaterialSummary;
  total: number;
  uploading: boolean;
  visibleItemCount: number;
}) {
  const summaryItems = buildUserFileMaterialSummaryItems(summary);
  const summaryValue = (summaryItemId: (typeof summaryItems)[number]['id']) =>
    summaryItems.find((item) => item.id === summaryItemId)?.value ??
    m.common_empty_value();

  switch (id) {
    case 'owner-scope':
      return m.settings_files_handoff_owner_scope_value();
    case 'storage-feature-gate':
      return isSettingsFilesEnabled()
        ? m.settings_files_handoff_storage_enabled_value()
        : m.settings_files_handoff_storage_unavailable_value();
    case 'source-library':
      return m.settings_files_workspace_summary_library_label();
    case 'upload-dialog':
      return uploading
        ? m.settings_files_uploading()
        : m.settings_files_upload_dialog_title();
    case 'upload-file-input':
      return m.settings_files_file_label();
    case 'upload-description':
      return m.settings_files_description_label();
    case 'upload-visibility':
      return m.settings_files_handoff_upload_visibility_value();
    case 'total-files':
      return summaryValue('total-files');
    case 'total-storage':
      return summaryValue('total-storage');
    case 'worksheet-materials':
      return summaryValue('worksheet-materials');
    case 'audio-materials':
      return summaryValue('audio-materials');
    case 'private-materials':
      return String(summary.privateFiles);
    case 'public-materials':
      return String(summary.publicFiles);
    case 'visible-page-items':
      return loading ? m.common_loading() : String(visibleItemCount);
    case 'pagination':
      return formatSettingsFilesHandoffPagination({
        pageIndex,
        pageSize,
        total,
      });
    case 'table-name-column':
      return m.settings_files_columns_original_name();
    case 'table-material-column':
      return m.settings_files_columns_content_type();
    case 'table-access-column':
      return m.settings_files_columns_is_public();
    case 'open-link-action':
      return m.settings_files_open_link();
    case 'delete-action':
      return m.settings_files_delete();
    case 'activity-source-reference':
      return 'ActivityContent.sourceMaterials';
    case 'activity-attachment-boundary':
      return m.settings_files_workspace_summary_attachments_label();
    case 'ai-provenance':
      return m.settings_files_workspace_summary_ai_label();
    case 'safe-filename-provenance':
      return m.settings_files_handoff_safe_filename_value();
    case 'file-byte-guard':
      return m.settings_files_handoff_file_byte_guard_value();
    case 'storage-key-guard':
      return m.settings_files_handoff_storage_key_guard_value();
    case 'permission-guard':
      return m.settings_files_handoff_permission_guard_value();
    case 'student-payload-guard':
      return m.settings_files_handoff_student_payload_guard_value();
    case 'worksheet-extraction-boundary':
      return m.settings_files_handoff_worksheet_extraction_value();
    case 'privacy-guard':
      return m.settings_files_handoff_privacy_guard_value();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getSettingsFilesSourceMaterialHandoffItemLabel(
  id: SettingsFilesSourceMaterialHandoffItemId
) {
  switch (id) {
    case 'owner-scope':
      return m.settings_files_handoff_owner_scope_label();
    case 'storage-feature-gate':
      return m.settings_files_handoff_storage_gate_label();
    case 'source-library':
      return m.settings_files_workspace_summary_library_label();
    case 'upload-dialog':
      return m.settings_files_handoff_upload_dialog_label();
    case 'upload-file-input':
      return m.settings_files_handoff_upload_file_label();
    case 'upload-description':
      return m.settings_files_handoff_upload_description_label();
    case 'upload-visibility':
      return m.settings_files_handoff_upload_visibility_label();
    case 'total-files':
      return m.settings_files_summary_total_files();
    case 'total-storage':
      return m.settings_files_summary_total_storage();
    case 'worksheet-materials':
      return m.settings_files_summary_worksheet_materials();
    case 'audio-materials':
      return m.settings_files_summary_audio_materials();
    case 'private-materials':
      return m.settings_files_handoff_private_materials_label();
    case 'public-materials':
      return m.settings_files_handoff_public_materials_label();
    case 'visible-page-items':
      return m.settings_files_handoff_visible_items_label();
    case 'pagination':
      return m.settings_files_handoff_pagination_label();
    case 'table-name-column':
      return m.settings_files_columns_original_name();
    case 'table-material-column':
      return m.settings_files_columns_content_type();
    case 'table-access-column':
      return m.settings_files_columns_is_public();
    case 'open-link-action':
      return m.settings_files_handoff_open_link_label();
    case 'delete-action':
      return m.settings_files_handoff_delete_action_label();
    case 'activity-source-reference':
      return m.settings_files_handoff_activity_source_reference_label();
    case 'activity-attachment-boundary':
      return m.settings_files_workspace_summary_attachments_label();
    case 'ai-provenance':
      return m.settings_files_workspace_summary_ai_label();
    case 'safe-filename-provenance':
      return m.settings_files_handoff_safe_filename_label();
    case 'file-byte-guard':
      return m.settings_files_handoff_file_byte_guard_label();
    case 'storage-key-guard':
      return m.settings_files_handoff_storage_key_guard_label();
    case 'permission-guard':
      return m.settings_files_handoff_permission_guard_label();
    case 'student-payload-guard':
      return m.settings_files_handoff_student_payload_guard_label();
    case 'worksheet-extraction-boundary':
      return m.settings_files_handoff_worksheet_extraction_label();
    case 'privacy-guard':
      return m.settings_files_handoff_privacy_guard_label();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getSettingsFilesSourceMaterialHandoffItemDescription(
  id: SettingsFilesSourceMaterialHandoffItemId
) {
  switch (id) {
    case 'owner-scope':
      return m.settings_files_handoff_owner_scope_description();
    case 'storage-feature-gate':
      return m.settings_files_handoff_storage_gate_description();
    case 'source-library':
      return m.settings_files_workspace_summary_library_description();
    case 'upload-dialog':
      return m.settings_files_handoff_upload_dialog_description();
    case 'upload-file-input':
      return m.settings_files_handoff_upload_file_description();
    case 'upload-description':
      return m.settings_files_handoff_upload_description_description();
    case 'upload-visibility':
      return m.settings_files_handoff_upload_visibility_description();
    case 'total-files':
      return m.settings_files_handoff_total_files_description();
    case 'total-storage':
      return m.settings_files_handoff_total_storage_description();
    case 'worksheet-materials':
      return m.settings_files_handoff_worksheet_materials_description();
    case 'audio-materials':
      return m.settings_files_handoff_audio_materials_description();
    case 'private-materials':
      return m.settings_files_handoff_private_materials_description();
    case 'public-materials':
      return m.settings_files_handoff_public_materials_description();
    case 'visible-page-items':
      return m.settings_files_handoff_visible_items_description();
    case 'pagination':
      return m.settings_files_handoff_pagination_description();
    case 'table-name-column':
      return m.settings_files_handoff_table_name_description();
    case 'table-material-column':
      return m.settings_files_handoff_table_material_description();
    case 'table-access-column':
      return m.settings_files_handoff_table_access_description();
    case 'open-link-action':
      return m.settings_files_handoff_open_link_description();
    case 'delete-action':
      return m.settings_files_handoff_delete_action_description();
    case 'activity-source-reference':
      return m.settings_files_handoff_activity_source_reference_description();
    case 'activity-attachment-boundary':
      return m.settings_files_workspace_summary_attachments_description();
    case 'ai-provenance':
      return m.settings_files_workspace_summary_ai_description();
    case 'safe-filename-provenance':
      return m.settings_files_handoff_safe_filename_description();
    case 'file-byte-guard':
      return m.settings_files_handoff_file_byte_guard_description();
    case 'storage-key-guard':
      return m.settings_files_handoff_storage_key_guard_description();
    case 'permission-guard':
      return m.settings_files_handoff_permission_guard_description();
    case 'student-payload-guard':
      return m.settings_files_handoff_student_payload_guard_description();
    case 'worksheet-extraction-boundary':
      return m.settings_files_handoff_worksheet_extraction_description();
    case 'privacy-guard':
      return m.settings_files_handoff_privacy_guard_description();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function buildSettingsFilesSourceMaterialHandoffPrivacyContract(
  itemViews: SettingsFilesSourceMaterialHandoffItemView[]
): SettingsFilesSourceMaterialHandoffPrivacyContract {
  return {
    exposesActivityContent: false,
    exposesFileBytes: false,
    exposesPermissionMetadata: false,
    exposesRawStudentIdentity: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherPrivateFilenames: false,
    itemIds: itemViews.map((item) => item.id),
    publicPayloadIncludesFileList: false,
    scope: 'teacher-source-material-library',
    storageKeysStayServerSide: true,
    tracksOwnerScopedUserFiles: true,
  };
}

function createEmptySettingsFilesSummary(): UserFileMaterialSummary {
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

function formatSettingsFilesHandoffPagination({
  pageIndex,
  pageSize,
  total,
}: {
  pageIndex: number;
  pageSize: number;
  total: number;
}) {
  const normalizedPageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(0, total) / normalizedPageSize)
  );
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Math.floor(pageIndex) + 1)
  );

  return m.settings_files_handoff_pagination_value({
    page: currentPage,
    pages: totalPages,
    total: Math.max(0, total),
  });
}
