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

export const ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES = [
  'audio-extraction',
  'worksheet-extraction',
  'spreadsheet-import',
] as const satisfies ActivitySourceMaterialReadinessCapability[];

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

export type ActivitySourceMaterialExtractionActionView =
  ActivitySourceMaterialExtractionAction & {
    label: string;
    nextStep: {
      description: string;
      label: string;
    };
    sourceKindSummaryText: string;
    summaryText: string;
  };

export type ActivitySourceMaterialKindBadgeView = {
  count: number;
  kind: UserFileMaterialKind;
  label: string;
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
  kindBadges: ActivitySourceMaterialKindBadgeView[];
  primaryNextStep?: ActivitySourceMaterialExtractionActionView['nextStep'];
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
  const extractionActions = summary.extractionActions.map(
    toActivitySourceMaterialExtractionActionView
  );

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
  const normalizedKindLabel = normalizeOptionalRuntimeDisplayText(kindLabel);
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
  ].map(normalizeOptionalRuntimeDisplayText);
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

  if (hasAudio) {
    addActivitySourceMaterialReadinessCapability(capabilities, 'audio');
  }
  if (hasSpreadsheet) {
    addActivitySourceMaterialReadinessCapability(capabilities, 'spreadsheet');
  }
  if (hasWorksheet) {
    addActivitySourceMaterialReadinessCapability(
      capabilities,
      'worksheet-document'
    );
  }

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

function addActivitySourceMaterialReadinessCapability(
  capabilities: ActivitySourceMaterialReadinessCapability[],
  kind: UserFileMaterialKind
) {
  const capability = getActivitySourceMaterialReadinessCapabilityForKind(kind);
  if (capability) capabilities.push(capability);
}

export function normalizeActivitySourceMaterialCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}
