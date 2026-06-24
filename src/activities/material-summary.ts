import { normalizeActivityMaterialReferences } from '@/activities/material-references';
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
  countLabel: string;
  extractionActions: ActivitySourceMaterialExtractionActionView[];
  extractionTitle: string;
  hasMaterials: boolean;
  kindBadges: Array<{
    count: number;
    kind: UserFileMaterialKind;
    label: string;
  }>;
  readiness: ActivitySourceMaterialReadiness;
  title: string;
};

export function summarizeActivitySourceMaterials(
  value: unknown
): ActivitySourceMaterialSummary {
  const materials = normalizeActivityMaterialReferences(value);
  const byKind = createEmptyMaterialKindCounts();

  for (const material of materials) {
    byKind[material.kind] += 1;
  }

  return {
    byKind,
    extractionActions: buildActivitySourceMaterialExtractionActions(byKind),
    kindSummaries: USER_FILE_MATERIAL_KINDS.flatMap((kind) =>
      byKind[kind] > 0 ? [{ count: byKind[kind], kind }] : []
    ),
    readiness: buildActivitySourceMaterialReadiness(byKind),
    total: materials.length,
  };
}

export function buildActivitySourceMaterialSummaryView(
  value: unknown
): ActivitySourceMaterialSummaryView {
  const summary = summarizeActivitySourceMaterials(value);

  return {
    countLabel:
      summary.total === 1
        ? m.activity_source_material_summary_count_one({
            count: summary.total,
          })
        : m.activity_source_material_summary_count_many({
            count: summary.total,
          }),
    extractionActions: summary.extractionActions.map(
      toActivitySourceMaterialExtractionActionView
    ),
    extractionTitle: m.activity_source_material_extraction_title(),
    hasMaterials: summary.total > 0,
    kindBadges: summary.kindSummaries.map((item) => ({
      ...item,
      label: formatUserFileMaterialKind(item.kind),
    })),
    readiness: summary.readiness,
    title: m.activity_source_material_summary_title(),
  };
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

function createEmptyMaterialKindCounts() {
  return Object.fromEntries(
    USER_FILE_MATERIAL_KINDS.map((kind) => [kind, 0])
  ) as Record<UserFileMaterialKind, number>;
}

function buildActivitySourceMaterialExtractionActions(
  byKind: Record<UserFileMaterialKind, number>
): ActivitySourceMaterialExtractionAction[] {
  return ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS.flatMap((action) => {
    const sourceKindCounts = action.sourceKinds.flatMap((kind) =>
      byKind[kind] > 0 ? [{ count: byKind[kind], kind }] : []
    );
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
  return {
    ...action,
    label: formatActivitySourceMaterialExtractionAction(action.id),
  };
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
  const hasAudio = byKind.audio > 0;
  const hasSpreadsheet = byKind.spreadsheet > 0;
  const hasWorksheet =
    byKind['worksheet-document'] > 0 || byKind['worksheet-image'] > 0;
  const capabilities: ActivitySourceMaterialReadinessCapability[] = [];

  if (hasAudio) capabilities.push('audio-extraction');
  if (hasSpreadsheet) capabilities.push('spreadsheet-import');
  if (hasWorksheet) capabilities.push('worksheet-extraction');

  return {
    capabilities,
    extractableCount:
      byKind.audio +
      byKind.spreadsheet +
      byKind['worksheet-document'] +
      byKind['worksheet-image'],
    hasAudio,
    hasSpreadsheet,
    hasWorksheet,
  };
}
