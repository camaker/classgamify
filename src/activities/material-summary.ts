import {
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  buildActivityMaterialReferenceFromUserFile,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import { normalizeOptionalRuntimeDisplayText } from '@/activities/runtime-display';
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

export type ActivitySourceMaterialExtractionAction = {
  capability: ActivitySourceMaterialReadinessCapability;
  id: ActivitySourceMaterialExtractionActionId;
  sourceCount: number;
  sourceKindCounts: ActivitySourceMaterialKindSummary[];
};

export type ActivitySourceMaterialExtractionActionView =
  ActivitySourceMaterialExtractionAction & {
    label: string;
    sourceKindSummaryText: string;
    summaryText: string;
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
  kindBadges: Array<{
    count: number;
    kind: UserFileMaterialKind;
    label: string;
    summaryText: string;
  }>;
  readiness: ActivitySourceMaterialReadiness;
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
  attachLabel: string;
  disabled: boolean;
  material: ActivityMaterialReference;
  meta: string;
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

  return {
    ariaLabel: formatActivitySourceMaterialSummaryAriaLabel({
      countLabel,
      kindSummaryText,
      title: m.activity_source_material_summary_title(),
    }),
    compactSummaryText,
    countLabel,
    extractionActions: summary.extractionActions.map(
      toActivitySourceMaterialExtractionActionView
    ),
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
    readiness: summary.readiness,
    title: m.activity_source_material_summary_title(),
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
    attachedMaterials.map((material) => material.fileId)
  );
  const availableItems = availableFiles.flatMap((file) => {
    const material = buildActivityMaterialReferenceFromUserFile(file);

    return material
      ? [
          buildActivitySourceMaterialPickerItemView({
            isAtLimit:
              attachedMaterials.length >= ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
            material,
            selected: selectedIds.has(material.fileId),
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
  return normalizeActivityMaterialReferences(current).filter(
    (material) => material.fileId !== fileId
  );
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
  return {
    actionLabel: selected
      ? m.activity_form_source_materials_attached()
      : m.activity_form_source_materials_attach(),
    attachLabel: m.activity_form_source_materials_attach_label({
      name: material.originalName,
    }),
    disabled: selected || isAtLimit,
    material,
    meta: formatActivitySourceMaterialReferenceMeta(material, [
      typeof material.size === 'number'
        ? formatBytes(material.size)
        : undefined,
    ]),
    removeLabel: m.activity_form_source_materials_remove_label({
      name: material.originalName,
    }),
    selected,
  };
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

type ActivitySourceMaterialExtractionActionDefinition = {
  capability: ActivitySourceMaterialReadinessCapability;
  id: ActivitySourceMaterialExtractionActionId;
  sourceKinds: UserFileMaterialKind[];
};

const ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS = [
  {
    capability: 'audio-extraction',
    id: 'extract-audio',
    sourceKinds: ['audio'],
  },
  {
    capability: 'spreadsheet-import',
    id: 'import-spreadsheet',
    sourceKinds: ['spreadsheet'],
  },
  {
    capability: 'worksheet-extraction',
    id: 'extract-worksheet',
    sourceKinds: ['worksheet-document', 'worksheet-image'],
  },
] satisfies ActivitySourceMaterialExtractionActionDefinition[];

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
  const sourceKindSummaryText = formatActivitySourceMaterialKindCounts(
    action.sourceKindCounts
  );

  return {
    ...action,
    label,
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
  const capabilities: ActivitySourceMaterialReadinessCapability[] = [];

  if (hasAudio) capabilities.push('audio-extraction');
  if (hasSpreadsheet) capabilities.push('spreadsheet-import');
  if (hasWorksheet) capabilities.push('worksheet-extraction');

  return {
    capabilities,
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

export function normalizeActivitySourceMaterialCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}
