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

type ActivitySourceMaterialSummary = {
  byKind: Record<UserFileMaterialKind, number>;
  kindSummaries: ActivitySourceMaterialKindSummary[];
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
