import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import type { ActivityMaterialReference } from '@/activities/types';
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

export function summarizeActivitySourceMaterials(
  value: unknown
): ActivitySourceMaterialSummary {
  const materials = normalizeActivityMaterialReferences(value);
  const byKind = createEmptyMaterialKindCounts();

  for (const material of materials) {
    byKind[material.kind] = normalizeMaterialSummaryCount(
      byKind[material.kind] + 1
    );
  }

  return {
    byKind,
    extractionActions: buildActivitySourceMaterialExtractionActions(byKind),
    kindSummaries: USER_FILE_MATERIAL_KINDS.flatMap((kind) =>
      normalizeMaterialSummaryCount(byKind[kind]) > 0
        ? [{ count: normalizeMaterialSummaryCount(byKind[kind]), kind }]
        : []
    ),
    readiness: buildActivitySourceMaterialReadiness(byKind),
    total: normalizeMaterialSummaryCount(materials.length),
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

export function formatActivitySourceMaterialReferenceMeta(
  material: ActivityMaterialReference,
  extraParts: Array<string | undefined> = []
) {
  return [
    formatUserFileMaterialKind(material.kind),
    ...extraParts,
    material.contentType,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(m.activity_source_material_summary_list_separator());
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
    const sourceKindCounts = action.sourceKinds.flatMap((kind) => {
      const count = normalizeMaterialSummaryCount(byKind[kind]);
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

function formatActivitySourceMaterialKindCounts(
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
  const audioCount = normalizeMaterialSummaryCount(byKind.audio);
  const spreadsheetCount = normalizeMaterialSummaryCount(byKind.spreadsheet);
  const worksheetDocumentCount = normalizeMaterialSummaryCount(
    byKind['worksheet-document']
  );
  const worksheetImageCount = normalizeMaterialSummaryCount(
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

function normalizeMaterialSummaryCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}
