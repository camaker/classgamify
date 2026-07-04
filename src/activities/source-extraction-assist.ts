import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import type { ActivitySourceMaterialReadinessCapability } from '@/activities/material-summary';
import type { UserFileMaterialKind } from '@/storage/file-materials';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS = [
  'source-material-count',
  'extractable-material-count',
  'audio-source-count',
  'worksheet-source-count',
  'spreadsheet-source-count',
  'reference-only-count',
  'capability-count',
  'audio-draft-path',
  'worksheet-extraction-path',
  'spreadsheet-import-path',
  'activity-content-target',
  'question-target',
  'pair-target',
  'group-target',
  'vocabulary-target',
  'teacher-note-target',
  'accepted-answer-target',
  'template-readiness-target',
  'assignment-snapshot-boundary',
  'editor-review-gate',
  'draft-output',
  'persistence-boundary',
  'publish-boundary',
  'owner-scope',
  'file-byte-guard',
  'filename-guard',
  'file-id-guard',
  'storage-key-guard',
  'parallel-model-guard',
  'privacy-guard',
] as const;

export type ActivitySourceExtractionAssistHandoffItemId =
  (typeof ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS)[number];

export type ActivitySourceExtractionAssistHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivitySourceExtractionAssistHandoffItemId;
  label: string;
  value: string;
};

export type ActivitySourceExtractionAssistHandoffPrivacyContract = {
  appliesBeforeActivitySave: true;
  createsParallelWorksheetModel: false;
  exposesActivityContentText: false;
  exposesAcceptedAnswerText: false;
  exposesFileBytes: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivitySourceExtractionAssistHandoffItemId[];
  modifiesPublishedAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresEditorReview: true;
  scope: 'teacher-reviewed-source-extraction-assist';
  targetModel: 'ActivityContent';
};

export type ActivitySourceExtractionAssistHandoffView = {
  description: string;
  itemViews: ActivitySourceExtractionAssistHandoffItemView[];
  privacy: ActivitySourceExtractionAssistHandoffPrivacyContract;
  title: string;
};

export type ActivitySourceExtractionAssistSourceKindCount = {
  count: number;
  kind: UserFileMaterialKind;
};

export type ActivitySourceExtractionAssistActionCount = {
  capability: ActivitySourceMaterialReadinessCapability;
  sourceCount: number;
};

export type ActivitySourceExtractionAssistSource = {
  extractableMaterialCount?: number;
  extractionActions?: readonly ActivitySourceExtractionAssistActionCount[];
  sourceKindCounts?: readonly ActivitySourceExtractionAssistSourceKindCount[];
  sourceMaterials?: unknown;
};

type ActivitySourceExtractionAssistSummary = {
  audioSourceCount: number;
  capabilityCount: number;
  extractableMaterialCount: number;
  referenceOnlyCount: number;
  sourceMaterialCount: number;
  spreadsheetSourceCount: number;
  worksheetSourceCount: number;
};

export function buildActivitySourceExtractionAssistHandoffView(
  source: ActivitySourceExtractionAssistSource = {}
): ActivitySourceExtractionAssistHandoffView {
  const summary = buildActivitySourceExtractionAssistSummary(source);
  const itemViews = ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildActivitySourceExtractionAssistHandoffItemView(
        buildActivitySourceExtractionAssistHandoffItem({ id, summary })
      )
  );

  return {
    description: m.activity_source_extraction_assist_handoff_description(),
    itemViews,
    privacy:
      buildActivitySourceExtractionAssistHandoffPrivacyContract(itemViews),
    title: m.activity_source_extraction_assist_handoff_title(),
  };
}

function buildActivitySourceExtractionAssistSummary(
  source: ActivitySourceExtractionAssistSource
): ActivitySourceExtractionAssistSummary {
  const sourceKindCounts =
    source.sourceKindCounts ?? buildSourceKindCounts(source.sourceMaterials);
  const sourceMaterialCount = normalizeExtractionCount(
    sourceKindCounts.reduce((total, item) => total + item.count, 0)
  );
  const actionCounts =
    source.extractionActions ?? buildExtractionActionCounts(sourceKindCounts);
  const audioSourceCount = getActionSourceCount(
    actionCounts,
    'audio-extraction'
  );
  const spreadsheetSourceCount = getActionSourceCount(
    actionCounts,
    'spreadsheet-import'
  );
  const worksheetSourceCount = getActionSourceCount(
    actionCounts,
    'worksheet-extraction'
  );
  const calculatedExtractableCount = normalizeExtractionCount(
    audioSourceCount + spreadsheetSourceCount + worksheetSourceCount
  );
  const extractableMaterialCount = normalizeExtractionCount(
    source.extractableMaterialCount ?? calculatedExtractableCount
  );
  const capabilityCount = [
    audioSourceCount,
    spreadsheetSourceCount,
    worksheetSourceCount,
  ].filter((count) => count > 0).length;

  return {
    audioSourceCount,
    capabilityCount,
    extractableMaterialCount,
    referenceOnlyCount: normalizeExtractionCount(
      sourceMaterialCount - extractableMaterialCount
    ),
    sourceMaterialCount,
    spreadsheetSourceCount,
    worksheetSourceCount,
  };
}

function buildSourceKindCounts(
  sourceMaterials: unknown
): ActivitySourceExtractionAssistSourceKindCount[] {
  const byKind = new Map<UserFileMaterialKind, number>();

  for (const material of normalizeActivityMaterialReferences(sourceMaterials)) {
    byKind.set(
      material.kind,
      normalizeExtractionCount(byKind.get(material.kind) ?? 0) + 1
    );
  }

  return [...byKind.entries()].map(([kind, count]) => ({
    count: normalizeExtractionCount(count),
    kind,
  }));
}

function buildExtractionActionCounts(
  sourceKindCounts: readonly ActivitySourceExtractionAssistSourceKindCount[]
): ActivitySourceExtractionAssistActionCount[] {
  const byCapability = new Map<
    ActivitySourceMaterialReadinessCapability,
    number
  >();

  for (const { count, kind } of sourceKindCounts) {
    const capability = getSourceExtractionCapabilityForKind(kind);
    if (!capability) continue;

    byCapability.set(
      capability,
      normalizeExtractionCount(byCapability.get(capability) ?? 0) +
        normalizeExtractionCount(count)
    );
  }

  return [...byCapability.entries()].map(([capability, sourceCount]) => ({
    capability,
    sourceCount: normalizeExtractionCount(sourceCount),
  }));
}

function getSourceExtractionCapabilityForKind(
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

function getActionSourceCount(
  actionCounts: readonly ActivitySourceExtractionAssistActionCount[],
  capability: ActivitySourceMaterialReadinessCapability
) {
  return normalizeExtractionCount(
    actionCounts.find((action) => action.capability === capability)
      ?.sourceCount ?? 0
  );
}

function buildActivitySourceExtractionAssistHandoffItem({
  id,
  summary,
}: {
  id: ActivitySourceExtractionAssistHandoffItemId;
  summary: ActivitySourceExtractionAssistSummary;
}): Omit<ActivitySourceExtractionAssistHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'source-material-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_source_material_count_description(),
        id,
        label:
          m.activity_source_extraction_assist_source_material_count_label(),
        value: summary.sourceMaterialCount,
      });
    case 'extractable-material-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_extractable_material_count_description(),
        id,
        label:
          m.activity_source_extraction_assist_extractable_material_count_label(),
        value: summary.extractableMaterialCount,
      });
    case 'audio-source-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_audio_source_count_description(),
        id,
        label: m.activity_source_extraction_assist_audio_source_count_label(),
        value: summary.audioSourceCount,
      });
    case 'worksheet-source-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_worksheet_source_count_description(),
        id,
        label:
          m.activity_source_extraction_assist_worksheet_source_count_label(),
        value: summary.worksheetSourceCount,
      });
    case 'spreadsheet-source-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_spreadsheet_source_count_description(),
        id,
        label:
          m.activity_source_extraction_assist_spreadsheet_source_count_label(),
        value: summary.spreadsheetSourceCount,
      });
    case 'reference-only-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_reference_only_count_description(),
        id,
        label: m.activity_source_extraction_assist_reference_only_count_label(),
        value: summary.referenceOnlyCount,
      });
    case 'capability-count':
      return buildActivitySourceExtractionAssistCountItem({
        description:
          m.activity_source_extraction_assist_capability_count_description(),
        id,
        label: m.activity_source_extraction_assist_capability_count_label(),
        value: summary.capabilityCount,
      });
    case 'audio-draft-path':
      return {
        description:
          m.activity_source_extraction_assist_audio_draft_path_description(),
        id,
        label: m.activity_source_extraction_assist_audio_draft_path_label(),
        value:
          summary.audioSourceCount > 0
            ? m.activity_source_extraction_assist_audio_draft_path_ready_value()
            : m.activity_source_extraction_assist_audio_draft_path_needs_value(),
      };
    case 'worksheet-extraction-path':
      return {
        description:
          m.activity_source_extraction_assist_worksheet_extraction_path_description(),
        id,
        label:
          m.activity_source_extraction_assist_worksheet_extraction_path_label(),
        value:
          summary.worksheetSourceCount > 0
            ? m.activity_source_extraction_assist_worksheet_extraction_path_ready_value()
            : m.activity_source_extraction_assist_worksheet_extraction_path_needs_value(),
      };
    case 'spreadsheet-import-path':
      return {
        description:
          m.activity_source_extraction_assist_spreadsheet_import_path_description(),
        id,
        label:
          m.activity_source_extraction_assist_spreadsheet_import_path_label(),
        value:
          summary.spreadsheetSourceCount > 0
            ? m.activity_source_extraction_assist_spreadsheet_import_path_ready_value()
            : m.activity_source_extraction_assist_spreadsheet_import_path_needs_value(),
      };
    case 'activity-content-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_activity_content_target_description(),
        id,
        label:
          m.activity_source_extraction_assist_activity_content_target_label(),
        value:
          m.activity_source_extraction_assist_activity_content_target_value(),
      });
    case 'question-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_question_target_description(),
        id,
        label: m.activity_source_extraction_assist_question_target_label(),
        value: m.activity_source_extraction_assist_question_target_value(),
      });
    case 'pair-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_pair_target_description(),
        id,
        label: m.activity_source_extraction_assist_pair_target_label(),
        value: m.activity_source_extraction_assist_pair_target_value(),
      });
    case 'group-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_group_target_description(),
        id,
        label: m.activity_source_extraction_assist_group_target_label(),
        value: m.activity_source_extraction_assist_group_target_value(),
      });
    case 'vocabulary-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_vocabulary_target_description(),
        id,
        label: m.activity_source_extraction_assist_vocabulary_target_label(),
        value: m.activity_source_extraction_assist_vocabulary_target_value(),
      });
    case 'teacher-note-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_teacher_note_target_description(),
        id,
        label: m.activity_source_extraction_assist_teacher_note_target_label(),
        value: m.activity_source_extraction_assist_teacher_note_target_value(),
      });
    case 'accepted-answer-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_accepted_answer_target_description(),
        id,
        label:
          m.activity_source_extraction_assist_accepted_answer_target_label(),
        value:
          m.activity_source_extraction_assist_accepted_answer_target_value(),
      });
    case 'template-readiness-target':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_template_readiness_target_description(),
        id,
        label:
          m.activity_source_extraction_assist_template_readiness_target_label(),
        value:
          m.activity_source_extraction_assist_template_readiness_target_value(),
      });
    case 'assignment-snapshot-boundary':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_assignment_snapshot_boundary_description(),
        id,
        label:
          m.activity_source_extraction_assist_assignment_snapshot_boundary_label(),
        value:
          m.activity_source_extraction_assist_assignment_snapshot_boundary_value(),
      });
    case 'editor-review-gate':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_editor_review_gate_description(),
        id,
        label: m.activity_source_extraction_assist_editor_review_gate_label(),
        value: m.activity_source_extraction_assist_editor_review_gate_value(),
      });
    case 'draft-output':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_draft_output_description(),
        id,
        label: m.activity_source_extraction_assist_draft_output_label(),
        value: m.activity_source_extraction_assist_draft_output_value(),
      });
    case 'persistence-boundary':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_persistence_boundary_description(),
        id,
        label: m.activity_source_extraction_assist_persistence_boundary_label(),
        value: m.activity_source_extraction_assist_persistence_boundary_value(),
      });
    case 'publish-boundary':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_publish_boundary_description(),
        id,
        label: m.activity_source_extraction_assist_publish_boundary_label(),
        value: m.activity_source_extraction_assist_publish_boundary_value(),
      });
    case 'owner-scope':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_owner_scope_description(),
        id,
        label: m.activity_source_extraction_assist_owner_scope_label(),
        value: m.activity_source_extraction_assist_owner_scope_value(),
      });
    case 'file-byte-guard':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_file_byte_guard_description(),
        id,
        label: m.activity_source_extraction_assist_file_byte_guard_label(),
        value: m.activity_source_extraction_assist_file_byte_guard_value(),
      });
    case 'filename-guard':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_filename_guard_description(),
        id,
        label: m.activity_source_extraction_assist_filename_guard_label(),
        value: m.activity_source_extraction_assist_filename_guard_value(),
      });
    case 'file-id-guard':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_file_id_guard_description(),
        id,
        label: m.activity_source_extraction_assist_file_id_guard_label(),
        value: m.activity_source_extraction_assist_file_id_guard_value(),
      });
    case 'storage-key-guard':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_storage_key_guard_description(),
        id,
        label: m.activity_source_extraction_assist_storage_key_guard_label(),
        value: m.activity_source_extraction_assist_storage_key_guard_value(),
      });
    case 'parallel-model-guard':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_parallel_model_guard_description(),
        id,
        label: m.activity_source_extraction_assist_parallel_model_guard_label(),
        value: m.activity_source_extraction_assist_parallel_model_guard_value(),
      });
    case 'privacy-guard':
      return buildActivitySourceExtractionAssistStaticItem({
        description:
          m.activity_source_extraction_assist_privacy_guard_description(),
        id,
        label: m.activity_source_extraction_assist_privacy_guard_label(),
        value: m.activity_source_extraction_assist_privacy_guard_value(),
      });
  }
}

function buildActivitySourceExtractionAssistCountItem({
  description,
  id,
  label,
  value,
}: {
  description: string;
  id: ActivitySourceExtractionAssistHandoffItemId;
  label: string;
  value: number;
}) {
  return buildActivitySourceExtractionAssistStaticItem({
    description,
    id,
    label,
    value: String(normalizeExtractionCount(value)),
  });
}

function buildActivitySourceExtractionAssistStaticItem({
  description,
  id,
  label,
  value,
}: Omit<ActivitySourceExtractionAssistHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildActivitySourceExtractionAssistHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivitySourceExtractionAssistHandoffItemView,
  'ariaLabel'
>): ActivitySourceExtractionAssistHandoffItemView {
  return {
    ariaLabel: m.activity_source_extraction_assist_item_aria({
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

function buildActivitySourceExtractionAssistHandoffPrivacyContract(
  itemViews: ActivitySourceExtractionAssistHandoffItemView[]
): ActivitySourceExtractionAssistHandoffPrivacyContract {
  return {
    appliesBeforeActivitySave: true,
    createsParallelWorksheetModel: false,
    exposesActivityContentText: false,
    exposesAcceptedAnswerText: false,
    exposesFileBytes: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    modifiesPublishedAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'teacher-reviewed-source-extraction-assist',
    targetModel: 'ActivityContent',
  };
}

function normalizeExtractionCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}
