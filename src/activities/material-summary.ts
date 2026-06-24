import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import { m } from '@/locale/paraglide/messages';
import {
  USER_FILE_MATERIAL_KINDS,
  type UserFileMaterialKind,
} from '@/storage/file-materials';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';

type ActivitySourceMaterialKindSummary = {
  count: number;
  kind: UserFileMaterialKind;
};

export type ActivitySourceMaterialReadinessCapability =
  | 'audio-extraction'
  | 'spreadsheet-import'
  | 'worksheet-extraction';

type ActivitySourceMaterialReadiness = {
  capabilities: ActivitySourceMaterialReadinessCapability[];
  extractableCount: number;
  hasAudio: boolean;
  hasSpreadsheet: boolean;
  hasWorksheet: boolean;
};

type ActivitySourceMaterialSummary = {
  byKind: Record<UserFileMaterialKind, number>;
  kindSummaries: ActivitySourceMaterialKindSummary[];
  readiness: ActivitySourceMaterialReadiness;
  total: number;
};

export type ActivitySourceMaterialSummaryView = {
  countLabel: string;
  hasMaterials: boolean;
  kindBadges: Array<{
    count: number;
    kind: UserFileMaterialKind;
    label: string;
  }>;
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
    hasMaterials: summary.total > 0,
    kindBadges: summary.kindSummaries.map((item) => ({
      ...item,
      label: formatUserFileMaterialKind(item.kind),
    })),
    title: m.activity_source_material_summary_title(),
  };
}

function createEmptyMaterialKindCounts() {
  return Object.fromEntries(
    USER_FILE_MATERIAL_KINDS.map((kind) => [kind, 0])
  ) as Record<UserFileMaterialKind, number>;
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
