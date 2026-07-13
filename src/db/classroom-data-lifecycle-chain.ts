export const CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-data-model',
  'd1-app-schema-boundary',
  'activity-table-owner-scope',
  'activity-content-json',
  'activity-template-visibility-indexes',
  'activity-create-persistence',
  'activity-update-persistence',
  'activity-derivative-draft-persistence',
  'activity-owner-query-scope',
  'assignment-table-owner-scope',
  'assignment-settings-json',
  'assignment-share-slug-uniqueness',
  'assignment-lifecycle-fields',
  'assignment-publish-transaction',
  'assignment-snapshot-table',
  'snapshot-content-clone',
  'snapshot-runtime-source',
  'public-payload-sanitization',
  'public-unavailable-guard',
  'attempt-table-identity',
  'attempt-answer-result-json',
  'attempt-persistence-helper',
  'attempt-query-scored-filter',
  'attempt-limit-identity-count',
  'result-analysis-consumer',
  'result-export-consumer',
  'printable-worksheet-consumer',
  'source-material-storage-key-guard',
  'raw-student-token-guard',
  'attempt-persistence-handoff-boundary',
] as const;

export const CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/db/app.schema.ts',
  'src/db/schema.ts',
  'src/db/types.ts',
  'src/api/activities.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/activities/persistence.ts',
  'src/activities/detail-query.ts',
  'src/activities/library-query.ts',
  'src/activities/duplicate.ts',
  'src/activities/runtime.ts',
  'src/api/assignments.ts',
  'src/assignments/persistence.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/detail-query.ts',
  'src/assignments/public.ts',
  'src/assignments/validation.ts',
  'src/assignments/share-slug.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/item-order.ts',
  'src/assignments/attempt-answers.ts',
  'src/assignments/attempt-identity-query.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/printable-worksheet.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ClassroomDataLifecycleChainHandoffItemId =
  (typeof CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ClassroomDataLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ClassroomDataLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type ClassroomDataLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  createsParallelWorksheetTables: false;
  exposesActivityContentJsonToPublicPayload: false;
  exposesAnswerTextInPersistenceHandoff: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayloadInPersistenceHandoff: false;
  exposesRuntimeItemIdsInPersistenceHandoff: false;
  exposesSnapshotContentJsonToPublicPayload: false;
  exposesSourceMaterialStorageKeys: false;
  exposesSourceMaterialMetadataInPersistenceHandoff: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentNameInPersistenceHandoff: false;
  exposesTeacherAnswerKeysBeforeReview: false;
  exposesTeacherOnlyAnswersInPersistenceHandoff: false;
  freezesSnapshotContent: true;
  itemIds: ClassroomDataLifecycleChainHandoffItemId[];
  mutatesEvaluationAfterInsert: false;
  persistsAttemptsAfterValidation: true;
  publicPayloadUsesRuntimeItemsOnly: true;
  publishesAssignmentAndSnapshotTogether: true;
  requiresOwnerScopedActivities: true;
  requiresOwnerScopedAssignments: true;
  resultConsumersUseScoredAttempts: true;
  sourceFiles: string[];
  storesScoredAttemptRows: true;
  usesAttemptPersistenceHandoff: true;
  usesD1AppSchema: true;
  usesSnapshotForPublicRuntime: true;
  usesScoredAttemptInsertHelper: true;
};

export type ClassroomDataLifecycleChainHandoffView = {
  description: string;
  itemViews: ClassroomDataLifecycleChainHandoffItemView[];
  privacy: ClassroomDataLifecycleChainPrivacyContract;
  title: string;
};

export function buildClassroomDataLifecycleChainHandoffView(): ClassroomDataLifecycleChainHandoffView {
  const itemViews = CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildClassroomDataLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice classroom data lifecycle chain from D1 app schema through activity persistence, assignment publishing, frozen snapshots, public payloads, scored attempts, result consumers, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      createsParallelWorksheetTables: false,
      exposesActivityContentJsonToPublicPayload: false,
      exposesAnswerTextInPersistenceHandoff: false,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayloadInPersistenceHandoff: false,
      exposesRuntimeItemIdsInPersistenceHandoff: false,
      exposesSnapshotContentJsonToPublicPayload: false,
      exposesSourceMaterialStorageKeys: false,
      exposesSourceMaterialMetadataInPersistenceHandoff: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentNameInPersistenceHandoff: false,
      exposesTeacherAnswerKeysBeforeReview: false,
      exposesTeacherOnlyAnswersInPersistenceHandoff: false,
      freezesSnapshotContent: true,
      itemIds: [...CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      mutatesEvaluationAfterInsert: false,
      persistsAttemptsAfterValidation: true,
      publicPayloadUsesRuntimeItemsOnly: true,
      publishesAssignmentAndSnapshotTogether: true,
      requiresOwnerScopedActivities: true,
      requiresOwnerScopedAssignments: true,
      resultConsumersUseScoredAttempts: true,
      sourceFiles: [...CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES],
      storesScoredAttemptRows: true,
      usesAttemptPersistenceHandoff: true,
      usesD1AppSchema: true,
      usesSnapshotForPublicRuntime: true,
      usesScoredAttemptInsertHelper: true,
    },
    title: 'Classroom data lifecycle chain',
  };
}

function buildClassroomDataLifecycleChainHandoffItemView(
  id: ClassroomDataLifecycleChainHandoffItemId
): ClassroomDataLifecycleChainHandoffItemView {
  const item = getClassroomDataLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getClassroomDataLifecycleChainHandoffItem(
  id: ClassroomDataLifecycleChainHandoffItemId
): Omit<ClassroomDataLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-data-model':
      return item(
        id,
        'Product data model',
        'Activity -> Assignment -> Attempt -> Results',
        'The product loop stays grounded in reusable teacher activities, publishable assignments, student attempts, and teacher results.'
      );
    case 'd1-app-schema-boundary':
      return item(
        id,
        'D1 app schema boundary',
        'app.schema.ts',
        'Application tables live in the D1 app schema and are merged through the shared Drizzle schema entry point.'
      );
    case 'activity-table-owner-scope':
      return item(
        id,
        'Activity table owner scope',
        'owner_id',
        'Activity rows carry the teacher owner id so saved classroom content remains scoped to the authenticated teacher.'
      );
    case 'activity-content-json':
      return item(
        id,
        'Activity content JSON',
        'ActivityContent',
        'Reusable lesson material persists as template-neutral ActivityContent JSON instead of per-template tables.'
      );
    case 'activity-template-visibility-indexes':
      return item(
        id,
        'Activity indexes',
        'template + visibility',
        'Activity indexes support owner, template, visibility, and owner-updated library queries.'
      );
    case 'activity-create-persistence':
      return item(
        id,
        'Activity create persistence',
        'buildActivityCreateInsert',
        'Create persistence converts validated CreateActivityInput into owner-scoped ActivityContent.'
      );
    case 'activity-update-persistence':
      return item(
        id,
        'Activity update persistence',
        'buildActivityUpdateSet',
        'Update persistence reuses the same activity input contract after the edit lifecycle gate passes.'
      );
    case 'activity-derivative-draft-persistence':
      return item(
        id,
        'Derivative draft persistence',
        'draft clone',
        'Duplicate and remix helpers clone structured content into draft rows without mutating the source activity.'
      );
    case 'activity-owner-query-scope':
      return item(
        id,
        'Activity owner query scope',
        'Owner where helpers',
        'Activity detail and library queries start from the current teacher owner before applying filters.'
      );
    case 'assignment-table-owner-scope':
      return item(
        id,
        'Assignment table owner scope',
        'owner_id + activity_id',
        'Assignment rows retain both the source activity id and teacher owner id for list, result, and status queries.'
      );
    case 'assignment-settings-json':
      return item(
        id,
        'Assignment settings JSON',
        'AssignmentSettings',
        'Delivery rules persist as AssignmentSettings JSON and resolve through shared assignment defaults.'
      );
    case 'assignment-share-slug-uniqueness':
      return item(
        id,
        'Share slug uniqueness',
        'unique share_slug',
        'Public classroom links use normalized, unique share slugs instead of exposing database internals.'
      );
    case 'assignment-lifecycle-fields':
      return item(
        id,
        'Assignment lifecycle fields',
        'status + expiresAt',
        'Status and expiry fields drive open, closed, draft, and expired behavior across teacher and student surfaces.'
      );
    case 'assignment-publish-transaction':
      return item(
        id,
        'Publish transaction',
        'assignment + snapshot',
        'Publishing inserts the assignment row and immutable snapshot together in a database transaction.'
      );
    case 'assignment-snapshot-table':
      return item(
        id,
        'Assignment snapshot table',
        'assignment_snapshot',
        'Snapshots freeze published title, description, template, and content under the assignment id.'
      );
    case 'snapshot-content-clone':
      return item(
        id,
        'Snapshot content clone',
        'structuredClone',
        'Snapshot inserts clone ActivityContent so later activity edits do not change already shared links.'
      );
    case 'snapshot-runtime-source':
      return item(
        id,
        'Snapshot runtime source',
        'resolveAssignmentRuntimeSource',
        'Runtime resolution prefers snapshot data and falls back to activity data only when a snapshot is absent.'
      );
    case 'public-payload-sanitization':
      return item(
        id,
        'Public payload sanitization',
        'Runtime items only',
        'Public payloads expose sanitized runtime prompts and choices rather than ActivityContent or answer-bearing rows.'
      );
    case 'public-unavailable-guard':
      return item(
        id,
        'Unavailable public guard',
        'Runtime hidden',
        'Unavailable public links return lifecycle policy instead of runtime content, teacher materials, or answers.'
      );
    case 'attempt-table-identity':
      return item(
        id,
        'Attempt identity table',
        'name or browser token',
        'Attempt rows store either a student name or anonymous browser token for identity and attempt-limit enforcement.'
      );
    case 'attempt-answer-result-json':
      return item(
        id,
        'Attempt answer/result JSON',
        'answersJson + resultJson',
        'Student submissions persist template-neutral answers and scored result JSON for later review.'
      );
    case 'attempt-persistence-helper':
      return item(
        id,
        'Attempt persistence helper',
        'buildScoredAttemptInsert',
        'Scored attempt insertion is delegated to the assignment-domain helper after validation and scoring.'
      );
    case 'attempt-query-scored-filter':
      return item(
        id,
        'Scored attempt query filter',
        'resultJson required',
        'Result-facing attempt queries only consume rows with scored result JSON.'
      );
    case 'attempt-limit-identity-count':
      return item(
        id,
        'Attempt identity count',
        'Normalized identity',
        'Attempt-limit checks count previous submissions by normalized student name or anonymous token.'
      );
    case 'result-analysis-consumer':
      return item(
        id,
        'Result analysis consumer',
        'runtime items + attempts',
        'Teacher analysis combines frozen runtime items with stored scored attempts for item and student summaries.'
      );
    case 'result-export-consumer':
      return item(
        id,
        'Result export consumer',
        'Private CSV',
        'CSV export consumes the same assignment, snapshot, attempts, analysis, stats, and delivery policy.'
      );
    case 'printable-worksheet-consumer':
      return item(
        id,
        'Printable worksheet consumer',
        'Frozen runtime items',
        'Printable worksheets render ordered runtime items from the same snapshot-aware assignment source.'
      );
    case 'source-material-storage-key-guard':
      return item(
        id,
        'Source material storage key guard',
        'Storage keys hidden',
        'Classroom data handoffs keep teacher source-material storage keys out of public payloads and audit summaries.'
      );
    case 'raw-student-token-guard':
      return item(
        id,
        'Raw student token guard',
        'Anonymous token hidden',
        'Raw anonymous browser tokens enforce limits but stay out of public and teacher-facing handoff summaries.'
      );
    case 'attempt-persistence-handoff-boundary':
      return item(
        id,
        'Attempt persistence handoff boundary',
        '30 persistence handoff slices',
        'Submission lifecycle, identity, attempt-limit and runtime-validation gates, scoring output, immutable answer/result JSON, scored rows, result consumers, source-material guards, and raw-payload privacy stay aligned.'
      );
  }
}

function item(
  id: ClassroomDataLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ClassroomDataLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
