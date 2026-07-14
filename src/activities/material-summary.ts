import {
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  buildActivityMaterialReferenceFromUserFile,
  getActivityMaterialReferenceKey,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import {
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeDisplaySearchKey,
} from '@/activities/runtime-display';
import type { ActivityMaterialReference } from '@/activities/types';
import { formatBytes } from '@/lib/formatter';
import { m } from '@/locale/paraglide/messages';
import {
  USER_FILE_MATERIAL_KINDS,
  type UserFileMaterialKind,
} from '@/storage/file-materials';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';

export type ActivitySourceMaterialKindSummary = {
  count: number;
  kind: UserFileMaterialKind;
};

export type ActivitySourceMaterialExtractionActionId =
  | 'extract-audio'
  | 'extract-worksheet'
  | 'import-spreadsheet';

export type ActivitySourceMaterialReadinessCapability =
  | 'audio-extraction'
  | 'spreadsheet-import'
  | 'worksheet-extraction';

export type ActivitySourceMaterialCapabilityCounts = Record<
  ActivitySourceMaterialReadinessCapability,
  number
>;

export type ActivitySourceMaterialCapabilityCopyItem = {
  description?: string;
  label: string;
};

export type ActivitySourceMaterialCapabilityView<
  TCopy extends
    ActivitySourceMaterialCapabilityCopyItem = ActivitySourceMaterialCapabilityCopyItem,
> = TCopy & {
  capability: ActivitySourceMaterialReadinessCapability;
  value: string;
};

export type ActivitySourceMaterialExtractionAction = {
  capability: ActivitySourceMaterialReadinessCapability;
  id: ActivitySourceMaterialExtractionActionId;
  sourceCount: number;
  sourceKindCounts: ActivitySourceMaterialKindSummary[];
};

type ActivitySourceMaterialExtractionActionDefinition = {
  capability: ActivitySourceMaterialReadinessCapability;
  id: ActivitySourceMaterialExtractionActionId;
  sourceKinds: ReadonlyArray<UserFileMaterialKind>;
};

export const ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS = [
  {
    capability: 'audio-extraction',
    id: 'extract-audio',
    sourceKinds: ['audio'],
  },
  {
    capability: 'worksheet-extraction',
    id: 'extract-worksheet',
    sourceKinds: ['worksheet-document', 'worksheet-image'],
  },
  {
    capability: 'spreadsheet-import',
    id: 'import-spreadsheet',
    sourceKinds: ['spreadsheet'],
  },
] as const satisfies ReadonlyArray<ActivitySourceMaterialExtractionActionDefinition>;

export const ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES =
  ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS.map(
    (action) => action.capability
  ) satisfies ActivitySourceMaterialReadinessCapability[];

export type ActivitySourceMaterialExtractionActionView =
  ActivitySourceMaterialExtractionAction & {
    label: string;
    nextStep: ActivitySourceMaterialExtractionNextStepView;
    sourceKindSummaryText: string;
    summaryText: string;
  };

export type ActivitySourceMaterialExtractionNextStepView = {
  description: string;
  label: string;
};

export type ActivitySourceMaterialKindBadgeView = {
  count: number;
  kind: UserFileMaterialKind;
  label: string;
  summaryText: string;
};

export type ActivitySourceMaterialReadinessStatusId =
  | 'extractable'
  | 'none'
  | 'reference-only';

export type ActivitySourceMaterialReadinessStatusView = {
  badgeVariant: 'outline' | 'secondary';
  description: string;
  id: ActivitySourceMaterialReadinessStatusId;
  label: string;
  value: string;
};

export type ActivitySourceMaterialReadiness = {
  capabilities: ActivitySourceMaterialReadinessCapability[];
  extractableCount: number;
  hasAudio: boolean;
  hasSpreadsheet: boolean;
  hasWorksheet: boolean;
};

type ActivitySourceMaterialSummary = {
  byKind: Record<UserFileMaterialKind, number>;
  extractionActions: ActivitySourceMaterialExtractionAction[];
  kindSummaries: ActivitySourceMaterialKindSummary[];
  readiness: ActivitySourceMaterialReadiness;
  total: number;
};

export type ActivitySourceMaterialSummaryView = {
  ariaLabel: string;
  compactSummaryText: string;
  countLabel: string;
  extractionActions: ActivitySourceMaterialExtractionActionView[];
  extractionTitle: string;
  hasMaterials: boolean;
  kindBadges: ActivitySourceMaterialKindBadgeView[];
  primaryNextStep?: ActivitySourceMaterialExtractionNextStepView;
  readiness: ActivitySourceMaterialReadiness;
  readinessStatus: ActivitySourceMaterialReadinessStatusView;
  title: string;
};

export const ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS = [
  'summary-surface',
  'activity-card-scope',
  'attached-count',
  'kind-summary',
  'kind-badge-count',
  'audio-count',
  'worksheet-document-count',
  'worksheet-image-count',
  'spreadsheet-count',
  'reference-only-count',
  'extractable-count',
  'readiness-status',
  'readiness-description',
  'primary-next-step',
  'extraction-action-count',
  'audio-extraction-action',
  'worksheet-extraction-action',
  'spreadsheet-import-action',
  'edit-action-slot',
  'editor-return-path',
  'library-status-summary',
  'activity-content-reference',
  'material-kind-metadata',
  'content-type-boundary',
  'size-summary-boundary',
  'file-byte-guard',
  'filename-guard',
  'file-id-guard',
  'storage-key-guard',
  'student-payload-guard',
] as const;

export type ActivitySourceMaterialCardHandoffItemId =
  (typeof ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS)[number];

export type ActivitySourceMaterialCardHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivitySourceMaterialCardHandoffItemId;
  label: string;
  value: string;
};

export type ActivitySourceMaterialCardHandoffPrivacyContract = {
  exposesContentTypes: false;
  exposesFileBytes: false;
  exposesOriginalFilenames: false;
  exposesPermissionMetadata: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentPayloadFileReferences: false;
  itemIds: ActivitySourceMaterialCardHandoffItemId[];
  scope: 'activity-card-source-material-summary';
  summarizesByMaterialKind: true;
  usesActivityContentSourceMaterials: true;
};

export type ActivitySourceMaterialCardHandoffView = {
  description: string;
  itemViews: ActivitySourceMaterialCardHandoffItemView[];
  privacy: ActivitySourceMaterialCardHandoffPrivacyContract;
  title: string;
};

type ActivitySourceMaterialPickerAvailableFile = {
  contentType?: string | null;
  filename?: string | null;
  id?: string | null;
  originalName?: string | null;
  size?: number | null;
};

export type ActivitySourceMaterialPickerItemView = {
  actionLabel: string;
  ariaLabel: string;
  attachDescription: string;
  attachLabel: string;
  description: string;
  disabled: boolean;
  material: ActivityMaterialReference;
  meta: string;
  removeDescription: string;
  removeLabel: string;
  selected: boolean;
};

export type ActivitySourceMaterialPickerStatus =
  | 'available'
  | 'empty'
  | 'error'
  | 'loading'
  | 'signed-out';

export type ActivitySourceMaterialPickerView = {
  attachedItems: ActivitySourceMaterialPickerItemView[];
  availableItems: ActivitySourceMaterialPickerItemView[];
  attachedSummary: ActivitySourceMaterialSummaryView;
  countLabel: string;
  hasAttachedItems: boolean;
  hasAvailableItems: boolean;
  isAtLimit: boolean;
  limitLabel: string;
  status: ActivitySourceMaterialPickerStatus;
  statusMessage?: string;
};

export const ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS = [
  'owner-scope',
  'storage-load-gate',
  'picker-status',
  'selected-count',
  'available-count',
  'visible-available-limit',
  'attachment-limit',
  'at-limit-gate',
  'attached-summary',
  'attached-items',
  'available-items',
  'selected-state',
  'attach-action',
  'attach-disabled-reason',
  'remove-action',
  'upload-entry',
  'loading-state',
  'error-state',
  'empty-state',
  'signed-out-state',
  'material-kind-meta',
  'content-type-meta',
  'size-meta',
  'source-material-reference',
  'ai-extraction-readiness',
  'student-payload-guard',
  'file-id-guard',
  'filename-display-boundary',
  'storage-key-guard',
  'privacy-guard',
] as const;

export type ActivitySourceMaterialPickerHandoffItemId =
  (typeof ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS)[number];

export type ActivitySourceMaterialPickerHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivitySourceMaterialPickerHandoffItemId;
  label: string;
  value: string;
};

export type ActivitySourceMaterialPickerHandoffPrivacyContract = {
  attachesOnlyReferences: true;
  deletesUploadedFiles: false;
  exposesFileBytes: false;
  exposesPermissionMetadata: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentPayloadFileReferences: false;
  itemIds: ActivitySourceMaterialPickerHandoffItemId[];
  scope: 'activity-source-material-picker';
  usesActivityContentSourceMaterials: true;
};

export type ActivitySourceMaterialPickerHandoffView = {
  description: string;
  itemViews: ActivitySourceMaterialPickerHandoffItemView[];
  privacy: ActivitySourceMaterialPickerHandoffPrivacyContract;
  title: string;
};

type ActivitySourceMaterialPickerHandoffSummary = {
  activeStatus: ActivitySourceMaterialPickerStatus;
  attachableCount: number;
  attachedCount: number;
  availableCount: number;
  disabledAvailableCount: number;
  extractionCapabilityCount: number;
  isAtLimit: boolean;
  limitLabel: string;
  selectedAvailableCount: number;
};

export function summarizeActivitySourceMaterials(
  value: unknown
): ActivitySourceMaterialSummary {
  const materials = normalizeActivityMaterialReferences(value);
  const byKind = createEmptyActivitySourceMaterialKindCounts();

  for (const material of materials) {
    byKind[material.kind] = normalizeActivitySourceMaterialCount(
      byKind[material.kind] + 1
    );
  }

  return {
    byKind,
    extractionActions: buildActivitySourceMaterialExtractionActions(byKind),
    kindSummaries: buildActivitySourceMaterialKindSummaries(byKind),
    readiness: buildActivitySourceMaterialReadiness(byKind),
    total: normalizeActivitySourceMaterialCount(materials.length),
  };
}

export function buildActivitySourceMaterialSummaryView(
  value: unknown
): ActivitySourceMaterialSummaryView {
  const summary = summarizeActivitySourceMaterials(value);
  const countLabel = formatActivitySourceMaterialCountLabel(summary.total);
  const kindSummaryText = formatActivitySourceMaterialKindCounts(
    summary.kindSummaries
  );
  const compactSummaryText = kindSummaryText || countLabel;
  const extractionActions = summary.extractionActions.map(
    toActivitySourceMaterialExtractionActionView
  );
  const readinessStatus = buildActivitySourceMaterialReadinessStatusView({
    readiness: summary.readiness,
    total: summary.total,
  });

  return {
    ariaLabel: formatActivitySourceMaterialSummaryAriaLabel({
      countLabel,
      kindSummaryText,
      title: m.activity_source_material_summary_title(),
    }),
    compactSummaryText,
    countLabel,
    extractionActions,
    extractionTitle: m.activity_source_material_extraction_title(),
    hasMaterials: summary.total > 0,
    kindBadges: summary.kindSummaries.map((item) => {
      const label = formatUserFileMaterialKind(item.kind);

      return {
        ...item,
        label,
        summaryText: formatActivitySourceMaterialMetric({
          count: item.count,
          label,
        }),
      };
    }),
    primaryNextStep: extractionActions[0]?.nextStep,
    readiness: summary.readiness,
    readinessStatus,
    title: m.activity_source_material_summary_title(),
  };
}

export function buildActivitySourceMaterialCardHandoffView({
  hasEditAction = false,
  summary,
}: {
  hasEditAction?: boolean;
  summary: ActivitySourceMaterialSummaryView;
}): ActivitySourceMaterialCardHandoffView {
  const itemViews = ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS.map((id) =>
    buildActivitySourceMaterialCardHandoffItemView({
      hasEditAction,
      id,
      summary,
    })
  );

  return {
    description: m.activity_source_material_card_handoff_description(),
    itemViews,
    privacy: {
      exposesContentTypes: false,
      exposesFileBytes: false,
      exposesOriginalFilenames: false,
      exposesPermissionMetadata: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentPayloadFileReferences: false,
      itemIds: itemViews.map((item) => item.id),
      scope: 'activity-card-source-material-summary',
      summarizesByMaterialKind: true,
      usesActivityContentSourceMaterials: true,
    },
    title: m.activity_source_material_card_handoff_title(),
  };
}

function buildActivitySourceMaterialCardHandoffItemView({
  hasEditAction,
  id,
  summary,
}: {
  hasEditAction: boolean;
  id: ActivitySourceMaterialCardHandoffItemId;
  summary: ActivitySourceMaterialSummaryView;
}): ActivitySourceMaterialCardHandoffItemView {
  const label = getActivitySourceMaterialCardHandoffItemLabel(id);
  const description = getActivitySourceMaterialCardHandoffItemDescription(id);
  const value = getActivitySourceMaterialCardHandoffItemValue({
    hasEditAction,
    id,
    summary,
  });

  return {
    ariaLabel: m.activity_source_material_card_handoff_item_aria({
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

function getActivitySourceMaterialCardHandoffItemValue({
  hasEditAction,
  id,
  summary,
}: {
  hasEditAction: boolean;
  id: ActivitySourceMaterialCardHandoffItemId;
  summary: ActivitySourceMaterialSummaryView;
}) {
  const totalCount = getActivitySourceMaterialSummaryTotalCount(summary);
  const extractableCount = normalizeActivitySourceMaterialCount(
    summary.readiness.extractableCount
  );
  const actionLabel = (actionId: ActivitySourceMaterialExtractionActionId) =>
    summary.extractionActions.find((action) => action.id === actionId)?.label ??
    m.activity_source_material_card_handoff_unavailable_value();

  switch (id) {
    case 'summary-surface':
      return summary.title;
    case 'activity-card-scope':
      return m.activity_source_material_card_handoff_activity_card_scope_value();
    case 'attached-count':
      return summary.countLabel;
    case 'kind-summary':
      return summary.compactSummaryText;
    case 'kind-badge-count':
      return String(summary.kindBadges.length);
    case 'audio-count':
      return String(
        getActivitySourceMaterialSummaryKindCount(summary, 'audio')
      );
    case 'worksheet-document-count':
      return String(
        getActivitySourceMaterialSummaryKindCount(summary, 'worksheet-document')
      );
    case 'worksheet-image-count':
      return String(
        getActivitySourceMaterialSummaryKindCount(summary, 'worksheet-image')
      );
    case 'spreadsheet-count':
      return String(
        getActivitySourceMaterialSummaryKindCount(summary, 'spreadsheet')
      );
    case 'reference-only-count':
      return String(Math.max(0, totalCount - extractableCount));
    case 'extractable-count':
      return String(extractableCount);
    case 'readiness-status':
      return summary.readinessStatus.value;
    case 'readiness-description':
      return summary.readinessStatus.description;
    case 'primary-next-step':
      return (
        summary.primaryNextStep?.label ??
        m.activity_source_material_card_handoff_unavailable_value()
      );
    case 'extraction-action-count':
      return String(summary.extractionActions.length);
    case 'audio-extraction-action':
      return actionLabel('extract-audio');
    case 'worksheet-extraction-action':
      return actionLabel('extract-worksheet');
    case 'spreadsheet-import-action':
      return actionLabel('import-spreadsheet');
    case 'edit-action-slot':
      return hasEditAction
        ? m.activity_source_material_card_handoff_available_value()
        : m.activity_source_material_card_handoff_unavailable_value();
    case 'editor-return-path':
      return m.activity_source_material_card_handoff_editor_return_path_value();
    case 'library-status-summary':
      return m.activity_source_material_card_handoff_library_status_summary_value();
    case 'activity-content-reference':
      return 'ActivityContent.sourceMaterials';
    case 'material-kind-metadata':
      return summary.compactSummaryText;
    case 'content-type-boundary':
      return m.activity_source_material_card_handoff_content_type_boundary_value();
    case 'size-summary-boundary':
      return m.activity_source_material_card_handoff_size_summary_boundary_value();
    case 'file-byte-guard':
      return m.activity_source_extraction_assist_file_byte_guard_value();
    case 'filename-guard':
      return m.activity_source_extraction_assist_filename_guard_value();
    case 'file-id-guard':
      return m.activity_source_extraction_assist_file_id_guard_value();
    case 'storage-key-guard':
      return m.activity_source_extraction_assist_storage_key_guard_value();
    case 'student-payload-guard':
      return m.activity_source_material_picker_handoff_student_payload_guard_value();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getActivitySourceMaterialCardHandoffItemLabel(
  id: ActivitySourceMaterialCardHandoffItemId
) {
  switch (id) {
    case 'summary-surface':
      return m.activity_source_material_card_handoff_summary_surface_label();
    case 'activity-card-scope':
      return m.activity_source_material_card_handoff_activity_card_scope_label();
    case 'attached-count':
      return m.activity_source_material_card_handoff_attached_count_label();
    case 'kind-summary':
      return m.activity_source_material_card_handoff_kind_summary_label();
    case 'kind-badge-count':
      return m.activity_source_material_card_handoff_kind_badge_count_label();
    case 'audio-count':
      return m.activity_source_extraction_assist_audio_source_count_label();
    case 'worksheet-document-count':
      return m.activity_source_material_card_handoff_worksheet_document_count_label();
    case 'worksheet-image-count':
      return m.activity_source_material_card_handoff_worksheet_image_count_label();
    case 'spreadsheet-count':
      return m.activity_source_extraction_assist_spreadsheet_source_count_label();
    case 'reference-only-count':
      return m.activity_source_extraction_assist_reference_only_count_label();
    case 'extractable-count':
      return m.activity_source_extraction_assist_extractable_material_count_label();
    case 'readiness-status':
      return m.activity_source_material_readiness_label();
    case 'readiness-description':
      return m.activity_source_material_card_handoff_readiness_description_label();
    case 'primary-next-step':
      return m.activity_source_material_card_handoff_primary_next_step_label();
    case 'extraction-action-count':
      return m.activity_source_material_card_handoff_extraction_action_count_label();
    case 'audio-extraction-action':
      return m.activity_source_material_extraction_audio();
    case 'worksheet-extraction-action':
      return m.activity_source_material_extraction_worksheet();
    case 'spreadsheet-import-action':
      return m.activity_source_material_extraction_spreadsheet();
    case 'edit-action-slot':
      return m.activity_source_material_card_handoff_edit_action_slot_label();
    case 'editor-return-path':
      return m.activity_source_material_card_handoff_editor_return_path_label();
    case 'library-status-summary':
      return m.activity_source_material_card_handoff_library_status_summary_label();
    case 'activity-content-reference':
      return m.activity_source_material_picker_handoff_source_material_reference_label();
    case 'material-kind-metadata':
      return m.activity_source_material_card_handoff_material_kind_metadata_label();
    case 'content-type-boundary':
      return m.activity_source_material_card_handoff_content_type_boundary_label();
    case 'size-summary-boundary':
      return m.activity_source_material_card_handoff_size_summary_boundary_label();
    case 'file-byte-guard':
      return m.activity_source_extraction_assist_file_byte_guard_label();
    case 'filename-guard':
      return m.activity_source_extraction_assist_filename_guard_label();
    case 'file-id-guard':
      return m.activity_source_extraction_assist_file_id_guard_label();
    case 'storage-key-guard':
      return m.activity_source_extraction_assist_storage_key_guard_label();
    case 'student-payload-guard':
      return m.activity_source_material_picker_handoff_student_payload_guard_label();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getActivitySourceMaterialCardHandoffItemDescription(
  id: ActivitySourceMaterialCardHandoffItemId
) {
  switch (id) {
    case 'summary-surface':
      return m.activity_source_material_card_handoff_summary_surface_description();
    case 'activity-card-scope':
      return m.activity_source_material_card_handoff_activity_card_scope_description();
    case 'attached-count':
      return m.activity_source_material_card_handoff_attached_count_description();
    case 'kind-summary':
      return m.activity_source_material_card_handoff_kind_summary_description();
    case 'kind-badge-count':
      return m.activity_source_material_card_handoff_kind_badge_count_description();
    case 'audio-count':
      return m.activity_source_extraction_assist_audio_source_count_description();
    case 'worksheet-document-count':
      return m.activity_source_material_card_handoff_worksheet_document_count_description();
    case 'worksheet-image-count':
      return m.activity_source_material_card_handoff_worksheet_image_count_description();
    case 'spreadsheet-count':
      return m.activity_source_extraction_assist_spreadsheet_source_count_description();
    case 'reference-only-count':
      return m.activity_source_extraction_assist_reference_only_count_description();
    case 'extractable-count':
      return m.activity_source_extraction_assist_extractable_material_count_description();
    case 'readiness-status':
      return m.activity_source_material_card_handoff_readiness_status_description();
    case 'readiness-description':
      return m.activity_source_material_card_handoff_readiness_description_description();
    case 'primary-next-step':
      return m.activity_source_material_card_handoff_primary_next_step_description();
    case 'extraction-action-count':
      return m.activity_source_material_card_handoff_extraction_action_count_description();
    case 'audio-extraction-action':
      return m.activity_source_material_next_step_audio_description();
    case 'worksheet-extraction-action':
      return m.activity_source_material_next_step_worksheet_description();
    case 'spreadsheet-import-action':
      return m.activity_source_material_next_step_spreadsheet_description();
    case 'edit-action-slot':
      return m.activity_source_material_card_handoff_edit_action_slot_description();
    case 'editor-return-path':
      return m.activity_source_material_card_handoff_editor_return_path_description();
    case 'library-status-summary':
      return m.activity_source_material_card_handoff_library_status_summary_description();
    case 'activity-content-reference':
      return m.activity_source_material_picker_handoff_source_material_reference_description();
    case 'material-kind-metadata':
      return m.activity_source_material_card_handoff_material_kind_metadata_description();
    case 'content-type-boundary':
      return m.activity_source_material_card_handoff_content_type_boundary_description();
    case 'size-summary-boundary':
      return m.activity_source_material_card_handoff_size_summary_boundary_description();
    case 'file-byte-guard':
      return m.activity_source_extraction_assist_file_byte_guard_description();
    case 'filename-guard':
      return m.activity_source_extraction_assist_filename_guard_description();
    case 'file-id-guard':
      return m.activity_source_extraction_assist_file_id_guard_description();
    case 'storage-key-guard':
      return m.activity_source_extraction_assist_storage_key_guard_description();
    case 'student-payload-guard':
      return m.activity_source_material_picker_handoff_student_payload_guard_description();
  }

  const exhaustiveId: never = id;
  return exhaustiveId;
}

function getActivitySourceMaterialSummaryTotalCount(
  summary: ActivitySourceMaterialSummaryView
) {
  return normalizeActivitySourceMaterialCount(
    summary.kindBadges.reduce((total, badge) => total + badge.count, 0)
  );
}

function getActivitySourceMaterialSummaryKindCount(
  summary: ActivitySourceMaterialSummaryView,
  kind: UserFileMaterialKind
) {
  return normalizeActivitySourceMaterialCount(
    summary.kindBadges.find((badge) => badge.kind === kind)?.count ?? 0
  );
}

function buildActivitySourceMaterialReadinessStatusView({
  readiness,
  total,
}: {
  readiness: ActivitySourceMaterialReadiness;
  total: number;
}): ActivitySourceMaterialReadinessStatusView {
  const normalizedTotal = normalizeActivitySourceMaterialCount(total);
  const extractableCount = normalizeActivitySourceMaterialCount(
    readiness.extractableCount
  );

  if (normalizedTotal === 0) {
    return {
      badgeVariant: 'outline',
      description: m.activity_source_material_readiness_none_description(),
      id: 'none',
      label: m.activity_source_material_readiness_label(),
      value: m.activity_source_material_readiness_none_value(),
    };
  }

  if (extractableCount === 0) {
    return {
      badgeVariant: 'outline',
      description:
        m.activity_source_material_readiness_reference_only_description(),
      id: 'reference-only',
      label: m.activity_source_material_readiness_label(),
      value: m.activity_source_material_readiness_reference_only_value(),
    };
  }

  return {
    badgeVariant: 'secondary',
    description: m.activity_source_material_readiness_extractable_description(),
    id: 'extractable',
    label: m.activity_source_material_readiness_label(),
    value:
      extractableCount === 1
        ? m.activity_source_material_readiness_extractable_value_one({
            count: extractableCount,
          })
        : m.activity_source_material_readiness_extractable_value_many({
            count: extractableCount,
          }),
  };
}

export function formatActivitySourceMaterialCountLabel(count: number) {
  const normalizedCount = normalizeActivitySourceMaterialCount(count);

  return normalizedCount === 1
    ? m.activity_source_material_summary_count_one({
        count: normalizedCount,
      })
    : m.activity_source_material_summary_count_many({
        count: normalizedCount,
      });
}

export function formatActivitySourceMaterialSummaryAriaLabel({
  countLabel,
  kindSummaryText,
  title,
}: {
  countLabel: string;
  kindSummaryText?: string;
  title: string;
}) {
  return [title, kindSummaryText || countLabel]
    .map(normalizeOptionalRuntimeDisplayText)
    .filter(Boolean)
    .join(m.activity_source_material_summary_list_separator());
}

export function buildActivitySourceMaterialPickerView({
  availableFiles,
  canLoadFiles,
  isError,
  isLoading,
  selectedMaterials,
}: {
  availableFiles: ActivitySourceMaterialPickerAvailableFile[];
  canLoadFiles: boolean;
  isError: boolean;
  isLoading: boolean;
  selectedMaterials: unknown;
}): ActivitySourceMaterialPickerView {
  const attachedMaterials =
    normalizeActivityMaterialReferences(selectedMaterials);
  const selectedIds = new Set(
    attachedMaterials
      .map((material) => getActivityMaterialReferenceKey(material.fileId))
      .filter((key): key is string => Boolean(key))
  );
  const availableItems = availableFiles.flatMap((file) => {
    const material = buildActivityMaterialReferenceFromUserFile(file);

    return material
      ? [
          buildActivitySourceMaterialPickerItemView({
            isAtLimit:
              attachedMaterials.length >= ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
            material,
            selected: isActivitySourceMaterialSelected({
              material,
              selectedIds,
            }),
          }),
        ]
      : [];
  });
  const status = resolveActivitySourceMaterialPickerStatus({
    canLoadFiles,
    hasAvailableItems: availableItems.length > 0,
    isError,
    isLoading,
  });

  return {
    attachedItems: attachedMaterials.map((material) =>
      buildActivitySourceMaterialPickerItemView({
        isAtLimit: false,
        material,
        selected: true,
      })
    ),
    attachedSummary: buildActivitySourceMaterialSummaryView(attachedMaterials),
    availableItems,
    countLabel: m.activity_form_source_materials_count({
      count: attachedMaterials.length,
    }),
    hasAttachedItems: attachedMaterials.length > 0,
    hasAvailableItems: availableItems.length > 0,
    isAtLimit: attachedMaterials.length >= ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
    limitLabel: m.activity_form_source_materials_limit({
      count: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
    }),
    status,
    statusMessage: getActivitySourceMaterialPickerStatusMessage(status),
  };
}

export function buildActivitySourceMaterialPickerHandoffView(
  pickerView: ActivitySourceMaterialPickerView
): ActivitySourceMaterialPickerHandoffView {
  const summary = buildActivitySourceMaterialPickerHandoffSummary(pickerView);
  const itemViews = ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.map((id) =>
    buildActivitySourceMaterialPickerHandoffItemView(
      buildActivitySourceMaterialPickerHandoffItem({ id, summary })
    )
  );

  return {
    description: m.activity_source_material_picker_handoff_description(),
    itemViews,
    privacy: buildActivitySourceMaterialPickerHandoffPrivacyContract(itemViews),
    title: m.activity_source_material_picker_handoff_title(),
  };
}

function buildActivitySourceMaterialPickerHandoffSummary(
  pickerView: ActivitySourceMaterialPickerView
): ActivitySourceMaterialPickerHandoffSummary {
  const attachedCount = normalizeActivitySourceMaterialCount(
    pickerView.attachedItems.length
  );
  const availableCount = normalizeActivitySourceMaterialCount(
    pickerView.availableItems.length
  );
  const selectedAvailableCount = normalizeActivitySourceMaterialCount(
    pickerView.availableItems.filter((item) => item.selected).length
  );
  const disabledAvailableCount = normalizeActivitySourceMaterialCount(
    pickerView.availableItems.filter((item) => item.disabled).length
  );
  const attachableCount = normalizeActivitySourceMaterialCount(
    pickerView.availableItems.filter((item) => !item.disabled).length
  );

  return {
    activeStatus: pickerView.status,
    attachableCount,
    attachedCount,
    availableCount,
    disabledAvailableCount,
    extractionCapabilityCount:
      pickerView.attachedSummary.readiness.capabilities.length,
    isAtLimit: pickerView.isAtLimit,
    limitLabel: pickerView.limitLabel,
    selectedAvailableCount,
  };
}

function buildActivitySourceMaterialPickerHandoffItem({
  id,
  summary,
}: {
  id: ActivitySourceMaterialPickerHandoffItemId;
  summary: ActivitySourceMaterialPickerHandoffSummary;
}): Omit<ActivitySourceMaterialPickerHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'owner-scope':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_owner_scope_description(),
        id,
        label: m.activity_source_material_picker_handoff_owner_scope_label(),
        value: m.activity_source_material_picker_handoff_owner_scope_value(),
      });
    case 'storage-load-gate':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_storage_load_gate_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_storage_load_gate_label(),
        value:
          summary.activeStatus === 'signed-out'
            ? m.activity_source_material_picker_handoff_sign_in_required_value()
            : m.activity_source_material_picker_handoff_enabled_value(),
      });
    case 'picker-status':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_picker_status_description(),
        id,
        label: m.activity_source_material_picker_handoff_picker_status_label(),
        value: getActivitySourceMaterialPickerStatusValue(summary.activeStatus),
      });
    case 'selected-count':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_selected_count_description(),
        id,
        label: m.activity_source_material_picker_handoff_selected_count_label(),
        value: summary.attachedCount,
      });
    case 'available-count':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_available_count_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_available_count_label(),
        value: summary.availableCount,
      });
    case 'visible-available-limit':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_visible_available_limit_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_visible_available_limit_label(),
        value:
          m.activity_source_material_picker_handoff_visible_available_limit_value(),
      });
    case 'attachment-limit':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_attachment_limit_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_attachment_limit_label(),
        value: summary.limitLabel,
      });
    case 'at-limit-gate':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_at_limit_gate_description(),
        id,
        label: m.activity_source_material_picker_handoff_at_limit_gate_label(),
        value: summary.isAtLimit
          ? m.activity_source_material_picker_handoff_limit_reached_value()
          : m.activity_source_material_picker_handoff_within_limit_value(),
      });
    case 'attached-summary':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_attached_summary_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_attached_summary_label(),
        value: String(summary.extractionCapabilityCount),
      });
    case 'attached-items':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_attached_items_description(),
        id,
        label: m.activity_source_material_picker_handoff_attached_items_label(),
        value: summary.attachedCount,
      });
    case 'available-items':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_available_items_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_available_items_label(),
        value: summary.availableCount,
      });
    case 'selected-state':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_selected_state_description(),
        id,
        label: m.activity_source_material_picker_handoff_selected_state_label(),
        value: summary.selectedAvailableCount,
      });
    case 'attach-action':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_attach_action_description(),
        id,
        label: m.activity_source_material_picker_handoff_attach_action_label(),
        value: summary.attachableCount,
      });
    case 'attach-disabled-reason':
      return buildActivitySourceMaterialPickerCountItem({
        description:
          m.activity_source_material_picker_handoff_attach_disabled_reason_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_attach_disabled_reason_label(),
        value: summary.disabledAvailableCount,
      });
    case 'remove-action':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_remove_action_description(),
        id,
        label: m.activity_source_material_picker_handoff_remove_action_label(),
        value:
          m.activity_source_material_picker_handoff_reference_only_change_value(),
      });
    case 'upload-entry':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_upload_entry_description(),
        id,
        label: m.activity_source_material_picker_handoff_upload_entry_label(),
        value: m.activity_form_source_materials_upload_action(),
      });
    case 'loading-state':
      return buildActivitySourceMaterialPickerStatusItem({
        activeStatus: summary.activeStatus,
        description:
          m.activity_source_material_picker_handoff_loading_state_description(),
        id,
        label: m.activity_source_material_picker_handoff_loading_state_label(),
        targetStatus: 'loading',
      });
    case 'error-state':
      return buildActivitySourceMaterialPickerStatusItem({
        activeStatus: summary.activeStatus,
        description:
          m.activity_source_material_picker_handoff_error_state_description(),
        id,
        label: m.activity_source_material_picker_handoff_error_state_label(),
        targetStatus: 'error',
      });
    case 'empty-state':
      return buildActivitySourceMaterialPickerStatusItem({
        activeStatus: summary.activeStatus,
        description:
          m.activity_source_material_picker_handoff_empty_state_description(),
        id,
        label: m.activity_source_material_picker_handoff_empty_state_label(),
        targetStatus: 'empty',
      });
    case 'signed-out-state':
      return buildActivitySourceMaterialPickerStatusItem({
        activeStatus: summary.activeStatus,
        description:
          m.activity_source_material_picker_handoff_signed_out_state_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_signed_out_state_label(),
        targetStatus: 'signed-out',
      });
    case 'material-kind-meta':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_material_kind_meta_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_material_kind_meta_label(),
        value:
          m.activity_source_material_picker_handoff_material_kind_meta_value(),
      });
    case 'content-type-meta':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_content_type_meta_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_content_type_meta_label(),
        value:
          m.activity_source_material_picker_handoff_content_type_meta_value(),
      });
    case 'size-meta':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_size_meta_description(),
        id,
        label: m.activity_source_material_picker_handoff_size_meta_label(),
        value: m.activity_source_material_picker_handoff_size_meta_value(),
      });
    case 'source-material-reference':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_source_material_reference_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_source_material_reference_label(),
        value:
          m.activity_source_material_picker_handoff_source_material_reference_value(),
      });
    case 'ai-extraction-readiness':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_ai_extraction_readiness_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_ai_extraction_readiness_label(),
        value: String(summary.extractionCapabilityCount),
      });
    case 'student-payload-guard':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_student_payload_guard_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_student_payload_guard_label(),
        value:
          m.activity_source_material_picker_handoff_student_payload_guard_value(),
      });
    case 'file-id-guard':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_file_id_guard_description(),
        id,
        label: m.activity_source_material_picker_handoff_file_id_guard_label(),
        value: m.activity_source_material_picker_handoff_file_id_guard_value(),
      });
    case 'filename-display-boundary':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_filename_display_boundary_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_filename_display_boundary_label(),
        value:
          m.activity_source_material_picker_handoff_filename_display_boundary_value(),
      });
    case 'storage-key-guard':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_storage_key_guard_description(),
        id,
        label:
          m.activity_source_material_picker_handoff_storage_key_guard_label(),
        value:
          m.activity_source_material_picker_handoff_storage_key_guard_value(),
      });
    case 'privacy-guard':
      return buildActivitySourceMaterialPickerStaticItem({
        description:
          m.activity_source_material_picker_handoff_privacy_guard_description(),
        id,
        label: m.activity_source_material_picker_handoff_privacy_guard_label(),
        value: m.activity_source_material_picker_handoff_privacy_guard_value(),
      });
  }
}

function buildActivitySourceMaterialPickerCountItem({
  description,
  id,
  label,
  value,
}: {
  description: string;
  id: ActivitySourceMaterialPickerHandoffItemId;
  label: string;
  value: number;
}) {
  return buildActivitySourceMaterialPickerStaticItem({
    description,
    id,
    label,
    value: String(normalizeActivitySourceMaterialCount(value)),
  });
}

function buildActivitySourceMaterialPickerStatusItem({
  activeStatus,
  description,
  id,
  label,
  targetStatus,
}: {
  activeStatus: ActivitySourceMaterialPickerStatus;
  description: string;
  id: ActivitySourceMaterialPickerHandoffItemId;
  label: string;
  targetStatus: ActivitySourceMaterialPickerStatus;
}) {
  return buildActivitySourceMaterialPickerStaticItem({
    description,
    id,
    label,
    value:
      activeStatus === targetStatus
        ? m.activity_source_material_picker_handoff_active_value()
        : m.activity_source_material_picker_handoff_inactive_value(),
  });
}

function buildActivitySourceMaterialPickerStaticItem({
  description,
  id,
  label,
  value,
}: Omit<ActivitySourceMaterialPickerHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildActivitySourceMaterialPickerHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivitySourceMaterialPickerHandoffItemView,
  'ariaLabel'
>): ActivitySourceMaterialPickerHandoffItemView {
  return {
    ariaLabel: m.activity_source_material_picker_handoff_item_aria({
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

function buildActivitySourceMaterialPickerHandoffPrivacyContract(
  itemViews: ActivitySourceMaterialPickerHandoffItemView[]
): ActivitySourceMaterialPickerHandoffPrivacyContract {
  return {
    attachesOnlyReferences: true,
    deletesUploadedFiles: false,
    exposesFileBytes: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    scope: 'activity-source-material-picker',
    usesActivityContentSourceMaterials: true,
  };
}

function getActivitySourceMaterialPickerStatusValue(
  status: ActivitySourceMaterialPickerStatus
) {
  switch (status) {
    case 'available':
      return m.activity_source_material_picker_handoff_available_value();
    case 'empty':
      return m.activity_source_material_picker_handoff_empty_value();
    case 'error':
      return m.activity_source_material_picker_handoff_error_value();
    case 'loading':
      return m.activity_source_material_picker_handoff_loading_value();
    case 'signed-out':
      return m.activity_source_material_picker_handoff_signed_out_value();
  }
}

export function addActivitySourceMaterialPickerItem({
  current,
  material,
}: {
  current: unknown;
  material: ActivityMaterialReference;
}) {
  return normalizeActivityMaterialReferences([
    ...normalizeActivityMaterialReferences(current),
    material,
  ]);
}

export function removeActivitySourceMaterialPickerItem({
  current,
  fileId,
}: {
  current: unknown;
  fileId: string;
}) {
  const removedMaterialKey = getActivityMaterialReferenceKey(fileId);
  if (!removedMaterialKey) return normalizeActivityMaterialReferences(current);

  return normalizeActivityMaterialReferences(current).filter(
    (material) =>
      getActivityMaterialReferenceKey(material.fileId) !== removedMaterialKey
  );
}

function isActivitySourceMaterialSelected({
  material,
  selectedIds,
}: {
  material: ActivityMaterialReference;
  selectedIds: Set<string>;
}) {
  const materialKey = getActivityMaterialReferenceKey(material.fileId);

  return Boolean(materialKey && selectedIds.has(materialKey));
}

export function formatActivitySourceMaterialReferenceMeta(
  material: ActivityMaterialReference,
  extraParts: Array<string | undefined> = []
) {
  return [
    formatUserFileMaterialKind(material.kind),
    ...extraParts,
    material.contentType,
  ]
    .map(normalizeOptionalRuntimeDisplayText)
    .filter(Boolean)
    .join(m.activity_source_material_summary_list_separator());
}

function buildActivitySourceMaterialPickerItemView({
  isAtLimit,
  material,
  selected,
}: {
  isAtLimit: boolean;
  material: ActivityMaterialReference;
  selected: boolean;
}): ActivitySourceMaterialPickerItemView {
  const meta = formatActivitySourceMaterialReferenceMeta(material, [
    typeof material.size === 'number' ? formatBytes(material.size) : undefined,
  ]);
  const description = m.activity_form_source_materials_item_description();

  return {
    actionLabel: selected
      ? m.activity_form_source_materials_attached()
      : m.activity_form_source_materials_attach(),
    ariaLabel: m.activity_form_source_materials_item_aria_label({
      description,
      meta,
      name: material.originalName,
    }),
    attachDescription: getActivitySourceMaterialAttachDescription({
      isAtLimit,
      material,
      selected,
    }),
    attachLabel: m.activity_form_source_materials_attach_label({
      name: material.originalName,
    }),
    description,
    disabled: selected || isAtLimit,
    material,
    meta,
    removeDescription: m.activity_form_source_materials_remove_description({
      name: material.originalName,
    }),
    removeLabel: m.activity_form_source_materials_remove_label({
      name: material.originalName,
    }),
    selected,
  };
}

function getActivitySourceMaterialAttachDescription({
  isAtLimit,
  material,
  selected,
}: {
  isAtLimit: boolean;
  material: ActivityMaterialReference;
  selected: boolean;
}) {
  if (selected) {
    return m.activity_form_source_materials_attached_description({
      name: material.originalName,
    });
  }

  if (isAtLimit) {
    return m.activity_form_source_materials_attach_limit_description({
      count: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
      name: material.originalName,
    });
  }

  return m.activity_form_source_materials_attach_description({
    name: material.originalName,
  });
}

function resolveActivitySourceMaterialPickerStatus({
  canLoadFiles,
  hasAvailableItems,
  isError,
  isLoading,
}: {
  canLoadFiles: boolean;
  hasAvailableItems: boolean;
  isError: boolean;
  isLoading: boolean;
}): ActivitySourceMaterialPickerStatus {
  if (!canLoadFiles) return 'signed-out';
  if (isLoading) return 'loading';
  if (isError) return 'error';
  return hasAvailableItems ? 'available' : 'empty';
}

function getActivitySourceMaterialPickerStatusMessage(
  status: ActivitySourceMaterialPickerStatus
) {
  switch (status) {
    case 'available':
      return undefined;
    case 'empty':
      return m.activity_form_source_materials_empty_available();
    case 'error':
      return m.activity_form_source_materials_load_error();
    case 'loading':
      return m.activity_form_source_materials_loading();
    case 'signed-out':
      return m.activity_form_source_materials_sign_in_hint();
  }
}

export function createEmptyActivitySourceMaterialKindCounts() {
  return Object.fromEntries(
    USER_FILE_MATERIAL_KINDS.map((kind) => [kind, 0])
  ) as Record<UserFileMaterialKind, number>;
}

export function buildActivitySourceMaterialKindSummaries(
  byKind: Record<UserFileMaterialKind, number>
): ActivitySourceMaterialKindSummary[] {
  return USER_FILE_MATERIAL_KINDS.flatMap((kind) => {
    const count = normalizeActivitySourceMaterialCount(byKind[kind]);
    return count > 0 ? [{ count, kind }] : [];
  });
}

export function createEmptyActivitySourceMaterialCapabilityCounts() {
  return {
    'audio-extraction': 0,
    'spreadsheet-import': 0,
    'worksheet-extraction': 0,
  } satisfies ActivitySourceMaterialCapabilityCounts;
}

export function buildActivitySourceMaterialCapabilityCountsFromActions(
  extractionActions: ReadonlyArray<{
    capability: ActivitySourceMaterialReadinessCapability;
    sourceCount: number;
  }>
) {
  const counts = createEmptyActivitySourceMaterialCapabilityCounts();

  for (const action of extractionActions) {
    counts[action.capability] = normalizeActivitySourceMaterialCount(
      counts[action.capability] + action.sourceCount
    );
  }

  return counts;
}

export function buildActivitySourceMaterialCapabilityViews<
  TCopy extends ActivitySourceMaterialCapabilityCopyItem,
>({
  capabilityCounts,
  copy,
  formatValue = formatActivitySourceMaterialCapabilityValue,
  includeZero = false,
}: {
  capabilityCounts?: Partial<ActivitySourceMaterialCapabilityCounts>;
  copy: Record<ActivitySourceMaterialReadinessCapability, TCopy>;
  formatValue?: (
    count: number,
    capability: ActivitySourceMaterialReadinessCapability
  ) => string | undefined;
  includeZero?: boolean;
}): Array<ActivitySourceMaterialCapabilityView<TCopy>> {
  return ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES.flatMap(
    (capability) => {
      const count = capabilityCounts?.[capability] ?? 0;
      const normalizedCount = normalizeActivitySourceMaterialCount(count);
      const value = formatValue(count, capability);

      if (!includeZero && normalizedCount === 0) return [];
      if (!value) return [];

      return [
        {
          ...copy[capability],
          capability,
          value,
        },
      ];
    }
  );
}

export function getActivitySourceMaterialReadinessCapabilityForKind(
  kind: UserFileMaterialKind
): ActivitySourceMaterialReadinessCapability | undefined {
  switch (kind) {
    case 'audio':
      return 'audio-extraction';
    case 'spreadsheet':
      return 'spreadsheet-import';
    case 'worksheet-document':
    case 'worksheet-image':
      return 'worksheet-extraction';
    default:
      return undefined;
  }
}

export function getActivitySourceMaterialReadinessCapabilityForKindLabel(
  kindLabel: string
): ActivitySourceMaterialReadinessCapability | undefined {
  const kind = getActivitySourceMaterialKindFromLabel(kindLabel);
  return kind
    ? getActivitySourceMaterialReadinessCapabilityForKind(kind)
    : undefined;
}

function buildActivitySourceMaterialExtractionActions(
  byKind: Record<UserFileMaterialKind, number>
): ActivitySourceMaterialExtractionAction[] {
  return ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS.flatMap((action) => {
    const sourceKindCounts = action.sourceKinds.flatMap((kind) => {
      const count = normalizeActivitySourceMaterialCount(byKind[kind]);
      return count > 0 ? [{ count, kind }] : [];
    });
    const sourceCount = sourceKindCounts.reduce(
      (total, item) => total + item.count,
      0
    );

    return sourceCount > 0
      ? [
          {
            capability: action.capability,
            id: action.id,
            sourceCount,
            sourceKindCounts,
          },
        ]
      : [];
  });
}

function toActivitySourceMaterialExtractionActionView(
  action: ActivitySourceMaterialExtractionAction
): ActivitySourceMaterialExtractionActionView {
  const label = formatActivitySourceMaterialExtractionAction(action.id);
  const nextStep = buildActivitySourceMaterialExtractionNextStep(action.id);
  const sourceKindSummaryText = formatActivitySourceMaterialKindCounts(
    action.sourceKindCounts
  );

  return {
    ...action,
    label,
    nextStep,
    sourceKindSummaryText,
    summaryText: m.activity_source_material_extraction_summary({
      label,
      sources: sourceKindSummaryText,
    }),
  };
}

function formatActivitySourceMaterialMetric({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return m.activity_source_material_summary_metric({ count, label });
}

export function formatActivitySourceMaterialKindCounts(
  sourceKindCounts: ActivitySourceMaterialKindSummary[]
) {
  return sourceKindCounts
    .map((item) =>
      formatActivitySourceMaterialMetric({
        count: item.count,
        label: formatUserFileMaterialKind(item.kind),
      })
    )
    .join(m.activity_source_material_summary_list_separator());
}

function formatActivitySourceMaterialCapabilityValue(count: number) {
  return String(normalizeActivitySourceMaterialCount(count));
}

function formatActivitySourceMaterialExtractionAction(
  id: ActivitySourceMaterialExtractionActionId
) {
  switch (id) {
    case 'extract-audio':
      return m.activity_source_material_extraction_audio();
    case 'extract-worksheet':
      return m.activity_source_material_extraction_worksheet();
    case 'import-spreadsheet':
      return m.activity_source_material_extraction_spreadsheet();
  }
}

function buildActivitySourceMaterialExtractionNextStep(
  id: ActivitySourceMaterialExtractionActionId
) {
  switch (id) {
    case 'extract-audio':
      return {
        description: m.activity_source_material_next_step_audio_description(),
        label: m.activity_source_material_next_step_audio_label(),
      };
    case 'extract-worksheet':
      return {
        description:
          m.activity_source_material_next_step_worksheet_description(),
        label: m.activity_source_material_next_step_worksheet_label(),
      };
    case 'import-spreadsheet':
      return {
        description:
          m.activity_source_material_next_step_spreadsheet_description(),
        label: m.activity_source_material_next_step_spreadsheet_label(),
      };
  }
}

function getActivitySourceMaterialKindFromLabel(
  kindLabel: string
): UserFileMaterialKind | undefined {
  const normalizedKindLabel = normalizeRuntimeDisplaySearchKey(kindLabel);
  if (!normalizedKindLabel) return undefined;

  return USER_FILE_MATERIAL_KINDS.find((kind) =>
    getActivitySourceMaterialKindLabels(kind).includes(normalizedKindLabel)
  );
}

function getActivitySourceMaterialKindLabels(kind: UserFileMaterialKind) {
  return [
    formatUserFileMaterialKind(kind),
    formatUserFileMaterialKind(kind, { locale: 'en' }),
    formatUserFileMaterialKind(kind, { locale: 'zh' }),
  ].map(normalizeRuntimeDisplaySearchKey);
}

function buildActivitySourceMaterialReadiness(
  byKind: Record<UserFileMaterialKind, number>
): ActivitySourceMaterialReadiness {
  const audioCount = normalizeActivitySourceMaterialCount(byKind.audio);
  const spreadsheetCount = normalizeActivitySourceMaterialCount(
    byKind.spreadsheet
  );
  const worksheetDocumentCount = normalizeActivitySourceMaterialCount(
    byKind['worksheet-document']
  );
  const worksheetImageCount = normalizeActivitySourceMaterialCount(
    byKind['worksheet-image']
  );
  const hasAudio = audioCount > 0;
  const hasSpreadsheet = spreadsheetCount > 0;
  const hasWorksheet = worksheetDocumentCount > 0 || worksheetImageCount > 0;

  return {
    capabilities: buildActivitySourceMaterialReadinessCapabilities({
      hasAudio,
      hasSpreadsheet,
      hasWorksheet,
    }),
    extractableCount:
      audioCount +
      spreadsheetCount +
      worksheetDocumentCount +
      worksheetImageCount,
    hasAudio,
    hasSpreadsheet,
    hasWorksheet,
  };
}

function buildActivitySourceMaterialReadinessCapabilities({
  hasAudio,
  hasSpreadsheet,
  hasWorksheet,
}: {
  hasAudio: boolean;
  hasSpreadsheet: boolean;
  hasWorksheet: boolean;
}) {
  return ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES.filter(
    (capability) => {
      switch (capability) {
        case 'audio-extraction':
          return hasAudio;
        case 'spreadsheet-import':
          return hasSpreadsheet;
        case 'worksheet-extraction':
          return hasWorksheet;
      }

      return false;
    }
  );
}

export function normalizeActivitySourceMaterialCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}
