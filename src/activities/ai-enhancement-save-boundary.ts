import {
  buildActivityEditorSaveExecutionPlan,
  type ActivityEditorSaveBlockedReason,
} from '@/activities/editor';
import {
  buildActivityAiEnhancementEditorReviewPlan,
  type ActivityAiEnhancementEditorReviewPlan,
  type ActivityAiEnhancementEditorReviewSource,
} from '@/activities/ai-enhancement-editor-review';

export const ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS = [
  'save-scope',
  'editor-review-source',
  'review-status',
  'teacher-save-action',
  'save-status',
  'save-mode',
  'create-input-contract',
  'save-execution-plan',
  'auth-save-gate',
  'edit-activity-id-gate',
  'activity-record-target',
  'manual-persistence-boundary',
  'editor-only-source',
  'draft-text-privacy',
  'answer-key-public-guard',
  'source-material-privacy',
  'raw-output-guard',
  'file-byte-guard',
  'storage-key-guard',
  'publish-boundary',
  'assignment-link-boundary',
  'snapshot-protection',
  'protected-snapshot-count',
  'public-payload-guard',
  'result-export-continuity',
  'template-readiness-continuity',
  'review-checklist-continuity',
  'fallback-provider-continuity',
  'blocked-reason',
  'save-chain-gate',
] as const;

export type ActivityAiEnhancementSaveBoundaryItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS)[number];

export type ActivityAiEnhancementSaveBoundaryMode = 'create' | 'edit';

export type ActivityAiEnhancementSaveBoundaryStatus =
  | 'awaiting-teacher-save-action'
  | 'blocked-before-review'
  | 'blocked-before-save'
  | 'ready-for-activity-create'
  | 'ready-for-activity-update';

export type ActivityAiEnhancementSaveExecutionSummary =
  | {
      reason: ActivityEditorSaveBlockedReason;
      type: 'blocked';
    }
  | {
      type: 'create';
    }
  | {
      activityId: string;
      type: 'edit';
    };

export type ActivityAiEnhancementSaveBoundarySource =
  ActivityAiEnhancementEditorReviewSource & {
    activityId?: string;
    existingAssignmentSnapshotCount?: number;
    saveMode?: ActivityAiEnhancementSaveBoundaryMode;
    teacherSubmittedSave?: boolean;
  };

export type ActivityAiEnhancementSaveBoundaryPlan = {
  activityIdRequired: boolean;
  canPersistActivity: boolean;
  createInputReady: boolean;
  hasActivityId: boolean;
  mode: ActivityAiEnhancementSaveBoundaryMode;
  mutationTarget: 'activity-record' | 'none';
  persistenceTarget: 'activity-create' | 'activity-update' | 'none';
  preservedAssignmentSnapshotCount: number;
  review: ActivityAiEnhancementEditorReviewPlan;
  saveExecution: ActivityAiEnhancementSaveExecutionSummary | null;
  status: ActivityAiEnhancementSaveBoundaryStatus;
  teacherSubmittedSave: boolean;
};

export type ActivityAiEnhancementSaveBoundaryItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementSaveBoundaryItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementSaveBoundaryPrivacyContract = {
  appliesAfterEditorReview: true;
  createsAssignmentLinksWithoutTeacherAction: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesAnswerText: false;
  exposesDraftText: false;
  exposesFileBytesToAi: false;
  exposesQuestionPromptText: false;
  exposesRawAiOutput: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivityAiEnhancementSaveBoundaryItemId[];
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  preservesResultExportContinuity: true;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresTeacherSaveAction: true;
  scope: 'activity-ai-enhancement-save-boundary';
  usesActivityEditorSaveGate: true;
  usesEditorReviewPlan: true;
  writesOnlyActivityRecord: true;
};

export type ActivityAiEnhancementSaveBoundaryView = {
  description: string;
  itemViews: ActivityAiEnhancementSaveBoundaryItemView[];
  plan: ActivityAiEnhancementSaveBoundaryPlan;
  privacy: ActivityAiEnhancementSaveBoundaryPrivacyContract;
  title: string;
};

type ActivityAiEnhancementSaveBoundarySummary = {
  activityRecordTarget: string;
  answerKeyPublicGuard: string;
  assignmentLinkBoundary: string;
  authSaveGate: string;
  blockedReason: string;
  createInputContract: string;
  draftTextPrivacy: string;
  editActivityIdGate: string;
  editorOnlySource: string;
  editorReviewSource: string;
  fallbackProviderContinuity: string;
  fileByteGuard: string;
  manualPersistenceBoundary: string;
  protectedSnapshotCount: string;
  publicPayloadGuard: string;
  publishBoundary: string;
  rawOutputGuard: string;
  resultExportContinuity: string;
  reviewChecklistContinuity: string;
  reviewStatus: string;
  saveChainGate: string;
  saveExecutionPlan: string;
  saveMode: string;
  saveScope: string;
  saveStatus: string;
  snapshotProtection: string;
  sourceMaterialPrivacy: string;
  storageKeyGuard: string;
  teacherSaveAction: string;
  templateReadinessContinuity: string;
};

export function buildActivityAiEnhancementSaveBoundaryView(
  source: ActivityAiEnhancementSaveBoundarySource
): ActivityAiEnhancementSaveBoundaryView {
  const plan = buildActivityAiEnhancementSaveBoundaryPlan(source);
  const summary = buildActivityAiEnhancementSaveBoundarySummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS.map((id) =>
    buildActivityAiEnhancementSaveBoundaryItemView(
      buildActivityAiEnhancementSaveBoundaryItem({ id, summary })
    )
  );

  return {
    description:
      'Manual save boundary for reviewed AI enhancement drafts after editor review and before activity persistence, assignment publishing, frozen snapshots, public payloads, or result exports.',
    itemViews,
    plan,
    privacy: buildActivityAiEnhancementSaveBoundaryPrivacyContract(itemViews),
    title: 'Activity AI enhancement save boundary',
  };
}

export function buildActivityAiEnhancementSaveBoundaryPlan(
  source: ActivityAiEnhancementSaveBoundarySource
): ActivityAiEnhancementSaveBoundaryPlan {
  const review = buildActivityAiEnhancementEditorReviewPlan(source);
  const mode = source.saveMode ?? 'create';
  const teacherSubmittedSave = source.teacherSubmittedSave === true;
  const saveExecution = buildActivityAiEnhancementSaveExecution({
    mode,
    review,
    source,
    teacherSubmittedSave,
  });
  const status = getActivityAiEnhancementSaveBoundaryStatus({
    review,
    saveExecution,
    teacherSubmittedSave,
  });
  const canPersistActivity =
    status === 'ready-for-activity-create' ||
    status === 'ready-for-activity-update';

  return {
    activityIdRequired: mode === 'edit',
    canPersistActivity,
    createInputReady: review.application.validationStatus === 'valid',
    hasActivityId: Boolean(source.activityId),
    mode,
    mutationTarget: canPersistActivity ? 'activity-record' : 'none',
    persistenceTarget: getActivityAiEnhancementPersistenceTarget(status),
    preservedAssignmentSnapshotCount: normalizeSnapshotCount(
      source.existingAssignmentSnapshotCount
    ),
    review,
    saveExecution,
    status,
    teacherSubmittedSave,
  };
}

function buildActivityAiEnhancementSaveExecution({
  mode,
  review,
  source,
  teacherSubmittedSave,
}: {
  mode: ActivityAiEnhancementSaveBoundaryMode;
  review: ActivityAiEnhancementEditorReviewPlan;
  source: ActivityAiEnhancementSaveBoundarySource;
  teacherSubmittedSave: boolean;
}) {
  if (!review.canReachManualSave) return null;
  if (!teacherSubmittedSave) return null;
  if (!source.proposedDraft) return null;

  const saveExecution = buildActivityEditorSaveExecutionPlan({
    activityId: source.activityId,
    hasUser: source.hasAuthenticatedTeacher,
    mode,
    values: source.proposedDraft,
  });

  if (saveExecution.type === 'blocked') {
    return {
      reason: saveExecution.reason,
      type: 'blocked',
    };
  }

  if (saveExecution.type === 'edit') {
    return {
      activityId: saveExecution.input.id,
      type: 'edit',
    };
  }

  return {
    type: 'create',
  };
}

function getActivityAiEnhancementSaveBoundaryStatus({
  review,
  saveExecution,
  teacherSubmittedSave,
}: {
  review: ActivityAiEnhancementEditorReviewPlan;
  saveExecution: ActivityAiEnhancementSaveExecutionSummary | null;
  teacherSubmittedSave: boolean;
}): ActivityAiEnhancementSaveBoundaryStatus {
  if (!review.canReachManualSave) return 'blocked-before-review';
  if (!teacherSubmittedSave) return 'awaiting-teacher-save-action';
  if (!saveExecution || saveExecution.type === 'blocked') {
    return 'blocked-before-save';
  }

  if (saveExecution.type === 'edit') return 'ready-for-activity-update';

  return 'ready-for-activity-create';
}

function getActivityAiEnhancementPersistenceTarget(
  status: ActivityAiEnhancementSaveBoundaryStatus
): ActivityAiEnhancementSaveBoundaryPlan['persistenceTarget'] {
  if (status === 'ready-for-activity-create') return 'activity-create';
  if (status === 'ready-for-activity-update') return 'activity-update';

  return 'none';
}

function normalizeSnapshotCount(value?: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(Math.trunc(value ?? 0), 0);
}

function buildActivityAiEnhancementSaveBoundarySummary(
  plan: ActivityAiEnhancementSaveBoundaryPlan
): ActivityAiEnhancementSaveBoundarySummary {
  return {
    activityRecordTarget: plan.canPersistActivity
      ? plan.mode === 'edit'
        ? 'Update activity record'
        : 'Create activity record'
      : 'No persistence',
    answerKeyPublicGuard: 'No public answer keys',
    assignmentLinkBoundary: 'No share link created',
    authSaveGate:
      plan.saveExecution?.type === 'blocked' &&
      plan.saveExecution.reason === 'auth-required'
        ? 'Sign-in required'
        : 'Teacher authenticated',
    blockedReason: getActivityAiEnhancementSaveBlockedReason(plan),
    createInputContract: plan.createInputReady
      ? 'CreateActivityInput valid'
      : 'CreateActivityInput blocked',
    draftTextPrivacy: 'Draft text hidden',
    editActivityIdGate: plan.activityIdRequired
      ? plan.hasActivityId
        ? 'Activity id present'
        : 'Activity id required'
      : 'Create mode',
    editorOnlySource: 'Reviewed editor draft',
    editorReviewSource: plan.review.status,
    fallbackProviderContinuity:
      formatActivityAiEnhancementSaveSourceContinuity(plan),
    fileByteGuard: 'No file bytes',
    manualPersistenceBoundary: plan.canPersistActivity
      ? 'Teacher save submitted'
      : 'Teacher save required',
    protectedSnapshotCount: `${plan.preservedAssignmentSnapshotCount} snapshots protected`,
    publicPayloadGuard: 'Sanitized runtime only',
    publishBoundary: 'Publish flow separate',
    rawOutputGuard: 'Raw output hidden',
    resultExportContinuity: 'Shared result model',
    reviewChecklistContinuity:
      `${plan.review.reviewedCheckCount}/` +
      `${plan.review.requiredReviewCount} reviewed`,
    reviewStatus: plan.review.status,
    saveChainGate: '30 save slices',
    saveExecutionPlan: plan.saveExecution?.type ?? 'not-built',
    saveMode: plan.mode,
    saveScope: 'Manual activity save',
    saveStatus: plan.status,
    snapshotProtection: 'Frozen snapshots protected',
    sourceMaterialPrivacy: 'Source material identifiers hidden',
    storageKeyGuard: 'Storage hidden',
    teacherSaveAction: plan.teacherSubmittedSave
      ? 'Save clicked'
      : 'Awaiting save click',
    templateReadinessContinuity:
      `${plan.review.application.readyTemplateCount} ready / ` +
      `${plan.review.application.lockedTemplateCount} locked`,
  };
}

function getActivityAiEnhancementSaveBlockedReason(
  plan: ActivityAiEnhancementSaveBoundaryPlan
) {
  if (!plan.review.application.canApplyToEditor) {
    return (
      plan.review.application.execution.blockedReason ??
      plan.review.application.validationStatus
    );
  }

  if (!plan.review.canReachManualSave) return 'teacher-review-incomplete';
  if (!plan.teacherSubmittedSave) return 'teacher-save-action-required';

  if (plan.saveExecution?.type === 'blocked') {
    return plan.saveExecution.reason;
  }

  return 'None';
}

function formatActivityAiEnhancementSaveSourceContinuity(
  plan: ActivityAiEnhancementSaveBoundaryPlan
) {
  const execution = plan.review.application.execution;

  if (execution.usesExternalProvider) return 'Provider draft reviewed';
  if (execution.usesLocalFallback) return 'Fallback draft reviewed';
  if (execution.usesDeterministicDraft) return 'Deterministic draft reviewed';

  return 'Draft source unavailable';
}

function buildActivityAiEnhancementSaveBoundaryItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementSaveBoundaryItemId;
  summary: ActivityAiEnhancementSaveBoundarySummary;
}): Omit<ActivityAiEnhancementSaveBoundaryItemView, 'ariaLabel'> {
  switch (id) {
    case 'save-scope':
      return item(
        id,
        'Save scope',
        summary.saveScope,
        'The save boundary starts only after a reviewed AI enhancement draft reaches the editor.'
      );
    case 'editor-review-source':
      return item(
        id,
        'Editor review source',
        summary.editorReviewSource,
        'The save boundary follows the structured editor review plan.'
      );
    case 'review-status':
      return item(
        id,
        'Review status',
        summary.reviewStatus,
        'Manual save stays blocked until teacher review is complete.'
      );
    case 'teacher-save-action':
      return item(
        id,
        'Teacher save action',
        summary.teacherSaveAction,
        'Persistence requires the teacher to submit the normal save action.'
      );
    case 'save-status':
      return item(
        id,
        'Save status',
        summary.saveStatus,
        'The save boundary records whether it is waiting, blocked, or ready for create/update.'
      );
    case 'save-mode':
      return item(
        id,
        'Save mode',
        summary.saveMode,
        'The same boundary covers create and edit save paths.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        summary.createInputContract,
        'Saved AI enhancement drafts still use the validated CreateActivityInput contract.'
      );
    case 'save-execution-plan':
      return item(
        id,
        'Save execution plan',
        summary.saveExecutionPlan,
        'The boundary delegates create/edit execution shape to the shared activity editor save plan.'
      );
    case 'auth-save-gate':
      return item(
        id,
        'Auth save gate',
        summary.authSaveGate,
        'Activity persistence remains scoped to an authenticated teacher.'
      );
    case 'edit-activity-id-gate':
      return item(
        id,
        'Edit activity id gate',
        summary.editActivityIdGate,
        'Edit saves require the existing activity id before update payloads are prepared.'
      );
    case 'activity-record-target':
      return item(
        id,
        'Activity record target',
        summary.activityRecordTarget,
        'A completed save targets only the activity record create or update path.'
      );
    case 'manual-persistence-boundary':
      return item(
        id,
        'Manual persistence boundary',
        summary.manualPersistenceBoundary,
        'AI enhancement review never persists an activity without teacher action.'
      );
    case 'editor-only-source':
      return item(
        id,
        'Editor-only source',
        summary.editorOnlySource,
        'The persisted input comes from the reviewed editor draft, not raw provider output.'
      );
    case 'draft-text-privacy':
      return item(
        id,
        'Draft text privacy',
        summary.draftTextPrivacy,
        'Save handoffs expose statuses and counts instead of classroom draft text.'
      );
    case 'answer-key-public-guard':
      return item(
        id,
        'Answer key public guard',
        summary.answerKeyPublicGuard,
        'Answer keys remain private activity content and are never public payloads here.'
      );
    case 'source-material-privacy':
      return item(
        id,
        'Source material privacy',
        summary.sourceMaterialPrivacy,
        'File identifiers, filenames, and storage details stay outside the save view.'
      );
    case 'raw-output-guard':
      return item(
        id,
        'Raw output guard',
        summary.rawOutputGuard,
        'Raw AI provider or fallback output does not reach the persistence boundary.'
      );
    case 'file-byte-guard':
      return item(
        id,
        'File byte guard',
        summary.fileByteGuard,
        'Uploaded source-material bytes remain outside the AI enhancement save path.'
      );
    case 'storage-key-guard':
      return item(
        id,
        'Storage key guard',
        summary.storageKeyGuard,
        'Storage keys, URLs, path segments, query tokens, and permissions stay hidden.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        summary.publishBoundary,
        'Saving reviewed activity content remains separate from assignment publishing.'
      );
    case 'assignment-link-boundary':
      return item(
        id,
        'Assignment link boundary',
        summary.assignmentLinkBoundary,
        'The save boundary cannot create or refresh assignment share links.'
      );
    case 'snapshot-protection':
      return item(
        id,
        'Snapshot protection',
        summary.snapshotProtection,
        'Existing published assignment snapshots remain frozen during save preparation.'
      );
    case 'protected-snapshot-count':
      return item(
        id,
        'Protected snapshot count',
        summary.protectedSnapshotCount,
        'Snapshot counts are reported as protected context rather than mutation targets.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        summary.publicPayloadGuard,
        'Student runtime payloads remain sanitized and separate from draft save data.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        summary.resultExportContinuity,
        'Activities saved after review continue through the shared attempt and result export model.'
      );
    case 'template-readiness-continuity':
      return item(
        id,
        'Template readiness continuity',
        summary.templateReadinessContinuity,
        'Template readiness diagnostics stay attached to the reviewed draft before persistence.'
      );
    case 'review-checklist-continuity':
      return item(
        id,
        'Review checklist continuity',
        summary.reviewChecklistContinuity,
        'The save boundary preserves how much of the review checklist was completed.'
      );
    case 'fallback-provider-continuity':
      return item(
        id,
        'Fallback provider continuity',
        summary.fallbackProviderContinuity,
        'Provider, fallback, and deterministic drafts enter the same reviewed save path.'
      );
    case 'blocked-reason':
      return item(
        id,
        'Blocked reason',
        summary.blockedReason,
        'Blocked save states keep one structured reason for diagnostics.'
      );
    case 'save-chain-gate':
      return item(
        id,
        'Save chain gate',
        summary.saveChainGate,
        'A focused gate keeps review, manual save, persistence, publish, snapshot, and privacy boundaries aligned.'
      );
  }
}

function buildActivityAiEnhancementSaveBoundaryItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementSaveBoundaryItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementSaveBoundaryPrivacyContract(
  itemViews: ActivityAiEnhancementSaveBoundaryItemView[]
): ActivityAiEnhancementSaveBoundaryPrivacyContract {
  return {
    appliesAfterEditorReview: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesAnswerText: false,
    exposesDraftText: false,
    exposesFileBytesToAi: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesExistingAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    preservesResultExportContinuity: true,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresTeacherSaveAction: true,
    scope: 'activity-ai-enhancement-save-boundary',
    usesActivityEditorSaveGate: true,
    usesEditorReviewPlan: true,
    writesOnlyActivityRecord: true,
  };
}

function item(
  id: ActivityAiEnhancementSaveBoundaryItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementSaveBoundaryItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
