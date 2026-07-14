import {
  ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS,
  buildActivityAiEnhancementSaveBoundaryPlan,
  type ActivityAiEnhancementSaveBoundaryPlan,
  type ActivityAiEnhancementSaveBoundarySource,
} from '@/activities/ai-enhancement-save-boundary';
import type { ActivityVisibility } from '@/activities/types';
import {
  buildActivityPublishExecutionPlan,
  buildAssignmentPublishDialogViewModel,
  buildAssignmentPublishDraftDefaults,
  type AssignmentPublishBlockedReason,
  type AssignmentPublishDraftValues,
} from '@/assignments/publish-input';

export const ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS = [
  'publish-scope',
  'save-boundary-source',
  'save-status',
  'activity-record-status',
  'activity-id-source',
  'publish-dialog-source',
  'publish-access',
  'teacher-publish-action',
  'publish-status',
  'publish-execution-plan',
  'validation-status',
  'delivery-rule-count',
  'settings-summary-status',
  'student-instructions-status',
  'timer-status',
  'close-time-status',
  'review-checklist-count',
  'assignment-record-target',
  'assignment-link-boundary',
  'snapshot-freeze',
  'snapshot-source',
  'protected-existing-snapshots',
  'public-payload-guard',
  'answer-key-guard',
  'source-material-privacy',
  'raw-output-guard',
  'publish-flow-boundary',
  'result-export-continuity',
  'blocked-reason',
  'manual-save-handoff-boundary',
] as const;

export type ActivityAiEnhancementPublishBoundaryItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS)[number];

export type ActivityAiEnhancementPublishBoundaryStatus =
  | 'awaiting-activity-record'
  | 'awaiting-publish-action'
  | 'blocked-before-publish'
  | 'blocked-before-save'
  | 'ready-for-assignment-publish';

export type ActivityAiEnhancementPublishExecutionSummary =
  | {
      reason: AssignmentPublishBlockedReason;
      type: 'blocked';
    }
  | {
      type: 'publish';
    };

export type ActivityAiEnhancementPublishDialogSummary = {
  closeAfterStatus: string;
  deliveryRuleCount: number;
  publishAccessValue: string;
  publishDisabled: boolean;
  reviewChecklistCount: number;
  settingsSummaryStatusValue: string;
  status: string;
  validationStatusValue: string;
};

export type ActivityAiEnhancementPublishBoundarySource =
  ActivityAiEnhancementSaveBoundarySource & {
    activityPersisted?: boolean;
    activityVisibility?: ActivityVisibility;
    existingPublishedAssignmentCount?: number;
    publishSubmitted?: boolean;
    publishValues?: AssignmentPublishDraftValues;
    savedActivityId?: string;
  };

export type ActivityAiEnhancementPublishBoundaryPlan = {
  activityPersisted: boolean;
  canCreateAssignmentLink: boolean;
  canPublishAssignment: boolean;
  hasSavedActivityId: boolean;
  protectedExistingAssignmentCount: number;
  publishDialog: ActivityAiEnhancementPublishDialogSummary | null;
  publishExecution: ActivityAiEnhancementPublishExecutionSummary | null;
  publishSubmitted: boolean;
  save: ActivityAiEnhancementSaveBoundaryPlan;
  snapshotSource: 'none' | 'saved-activity-record';
  status: ActivityAiEnhancementPublishBoundaryStatus;
};

export type ActivityAiEnhancementPublishBoundaryItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementPublishBoundaryItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementPublishBoundaryPrivacyContract = {
  appliesAfterActivitySave: true;
  createsAssignmentLinksWithoutTeacherAction: false;
  createsAssignmentSnapshotsWithoutTeacherAction: false;
  exposesActivityContentText: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesAssignmentTitle: false;
  exposesDraftText: false;
  exposesFileBytesToAi: false;
  exposesInternalActivityIds: false;
  exposesQuestionPromptText: false;
  exposesRawAiOutput: false;
  exposesRawSourceText: false;
  exposesShareSlug: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentInstructions: false;
  itemIds: ActivityAiEnhancementPublishBoundaryItemId[];
  mutatesExistingAssignmentSnapshots: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresAssignmentPublishFlow: true;
  requiresSavedActivityRecord: true;
  requiresTeacherPublishAction: true;
  scope: 'activity-ai-enhancement-publish-boundary';
  usesAssignmentPublishPreflight: true;
  usesAssignmentSnapshotFreeze: true;
  usesSaveBoundaryHandoff: true;
  usesSaveBoundaryPlan: true;
};

export type ActivityAiEnhancementPublishBoundaryView = {
  description: string;
  itemViews: ActivityAiEnhancementPublishBoundaryItemView[];
  plan: ActivityAiEnhancementPublishBoundaryPlan;
  privacy: ActivityAiEnhancementPublishBoundaryPrivacyContract;
  title: string;
};

type ActivityAiEnhancementPublishBoundarySummary = {
  activityIdSource: string;
  activityRecordStatus: string;
  answerKeyGuard: string;
  assignmentLinkBoundary: string;
  assignmentRecordTarget: string;
  blockedReason: string;
  closeTimeStatus: string;
  deliveryRuleCount: string;
  manualSaveHandoffBoundary: string;
  protectedExistingSnapshots: string;
  publicPayloadGuard: string;
  publishAccess: string;
  publishDialogSource: string;
  publishExecutionPlan: string;
  publishFlowBoundary: string;
  publishScope: string;
  publishStatus: string;
  rawOutputGuard: string;
  resultExportContinuity: string;
  reviewChecklistCount: string;
  saveBoundarySource: string;
  saveStatus: string;
  settingsSummaryStatus: string;
  snapshotFreeze: string;
  snapshotSource: string;
  sourceMaterialPrivacy: string;
  studentInstructionsStatus: string;
  teacherPublishAction: string;
  timerStatus: string;
  validationStatus: string;
};

export function buildActivityAiEnhancementPublishBoundaryView(
  source: ActivityAiEnhancementPublishBoundarySource
): ActivityAiEnhancementPublishBoundaryView {
  const plan = buildActivityAiEnhancementPublishBoundaryPlan(source);
  const summary = buildActivityAiEnhancementPublishBoundarySummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS.map(
    (id) =>
      buildActivityAiEnhancementPublishBoundaryItemView(
        buildActivityAiEnhancementPublishBoundaryItem({ id, summary })
      )
  );

  return {
    description:
      'Assignment publish boundary for saved AI enhancement drafts, proving that share links, assignment records, snapshots, public payloads, and result loops only start through the normal teacher publish flow.',
    itemViews,
    plan,
    privacy:
      buildActivityAiEnhancementPublishBoundaryPrivacyContract(itemViews),
    title: 'Activity AI enhancement publish boundary',
  };
}

export function buildActivityAiEnhancementPublishBoundaryPlan(
  source: ActivityAiEnhancementPublishBoundarySource
): ActivityAiEnhancementPublishBoundaryPlan {
  const save = buildActivityAiEnhancementSaveBoundaryPlan(source);
  const activityPersisted = source.activityPersisted === true;
  const hasSavedActivityId = Boolean(source.savedActivityId);
  const publishSubmitted = source.publishSubmitted === true;
  const publishDialog = buildActivityAiEnhancementPublishDialogSummary({
    save,
    source,
  });
  const publishExecution = buildActivityAiEnhancementPublishExecutionSummary({
    publishDialog,
    save,
    source,
  });
  const status = getActivityAiEnhancementPublishBoundaryStatus({
    activityPersisted,
    hasSavedActivityId,
    publishDialog,
    publishExecution,
    publishSubmitted,
    save,
  });
  const canPublishAssignment = status === 'ready-for-assignment-publish';

  return {
    activityPersisted,
    canCreateAssignmentLink: canPublishAssignment,
    canPublishAssignment,
    hasSavedActivityId,
    protectedExistingAssignmentCount: normalizeAssignmentCount(
      source.existingPublishedAssignmentCount
    ),
    publishDialog,
    publishExecution,
    publishSubmitted,
    save,
    snapshotSource: canPublishAssignment ? 'saved-activity-record' : 'none',
    status,
  };
}

function buildActivityAiEnhancementPublishDialogSummary({
  save,
  source,
}: {
  save: ActivityAiEnhancementSaveBoundaryPlan;
  source: ActivityAiEnhancementPublishBoundarySource;
}): ActivityAiEnhancementPublishDialogSummary | null {
  if (!save.canPersistActivity) return null;
  if (!source.activityPersisted) return null;
  if (!source.savedActivityId) return null;
  if (!source.proposedDraft) return null;

  const defaults = buildAssignmentPublishDraftDefaults({
    activityId: source.savedActivityId,
    title: source.proposedDraft.title,
  });
  const publishView = buildAssignmentPublishDialogViewModel({
    defaults,
    values: source.publishValues ?? {},
    visibility: source.activityVisibility ?? source.proposedDraft.visibility,
  });

  return {
    closeAfterStatus: publishView.controlBoundary.closeAfterStatus,
    deliveryRuleCount: publishView.controlBoundary.deliveryRuleCount,
    publishAccessValue: getPublishHandoffValue(
      publishView.handoffView.itemViews,
      'publish-access'
    ),
    publishDisabled: publishView.dialogState.publishDisabled,
    reviewChecklistCount: publishView.preview.context.reviewItems.length,
    settingsSummaryStatusValue: getPublishHandoffValue(
      publishView.handoffView.itemViews,
      'settings-summary-status'
    ),
    status: publishView.controlBoundary.status,
    validationStatusValue: getPublishHandoffValue(
      publishView.handoffView.itemViews,
      'validation-status'
    ),
  };
}

function buildActivityAiEnhancementPublishExecutionSummary({
  publishDialog,
  save,
  source,
}: {
  publishDialog: ActivityAiEnhancementPublishDialogSummary | null;
  save: ActivityAiEnhancementSaveBoundaryPlan;
  source: ActivityAiEnhancementPublishBoundarySource;
}): ActivityAiEnhancementPublishExecutionSummary | null {
  if (!publishDialog) return null;
  if (!save.canPersistActivity) return null;
  if (!source.savedActivityId || !source.proposedDraft) return null;

  const defaults = buildAssignmentPublishDraftDefaults({
    activityId: source.savedActivityId,
    title: source.proposedDraft.title,
  });
  const publishView = buildAssignmentPublishDialogViewModel({
    defaults,
    values: source.publishValues ?? {},
    visibility: source.activityVisibility ?? source.proposedDraft.visibility,
  });
  const execution = buildActivityPublishExecutionPlan({
    draft: publishView.draft,
    visibility: source.activityVisibility ?? source.proposedDraft.visibility,
  });

  if (execution.type === 'blocked') {
    return {
      reason: execution.reason,
      type: 'blocked',
    };
  }

  return {
    type: 'publish',
  };
}

function getActivityAiEnhancementPublishBoundaryStatus({
  activityPersisted,
  hasSavedActivityId,
  publishDialog,
  publishExecution,
  publishSubmitted,
  save,
}: {
  activityPersisted: boolean;
  hasSavedActivityId: boolean;
  publishDialog: ActivityAiEnhancementPublishDialogSummary | null;
  publishExecution: ActivityAiEnhancementPublishExecutionSummary | null;
  publishSubmitted: boolean;
  save: ActivityAiEnhancementSaveBoundaryPlan;
}): ActivityAiEnhancementPublishBoundaryStatus {
  if (!save.canPersistActivity) return 'blocked-before-save';
  if (!activityPersisted || !hasSavedActivityId) {
    return 'awaiting-activity-record';
  }
  if (!publishDialog || !publishExecution) return 'blocked-before-publish';
  if (publishExecution.type === 'blocked' || publishDialog.publishDisabled) {
    return 'blocked-before-publish';
  }
  if (!publishSubmitted) return 'awaiting-publish-action';

  return 'ready-for-assignment-publish';
}

function normalizeAssignmentCount(value?: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(Math.trunc(value ?? 0), 0);
}

function buildActivityAiEnhancementPublishBoundarySummary(
  plan: ActivityAiEnhancementPublishBoundaryPlan
): ActivityAiEnhancementPublishBoundarySummary {
  return {
    activityIdSource: plan.hasSavedActivityId
      ? 'Saved activity id'
      : 'Saved activity id required',
    activityRecordStatus: plan.activityPersisted
      ? 'Saved activity record'
      : 'Activity save pending',
    answerKeyGuard: 'No public answer keys',
    assignmentLinkBoundary: plan.canCreateAssignmentLink
      ? 'Publish flow creates link'
      : 'No share link',
    assignmentRecordTarget: plan.canPublishAssignment
      ? 'Assignment record and snapshot'
      : 'No assignment record',
    blockedReason: getActivityAiEnhancementPublishBlockedReason(plan),
    closeTimeStatus: plan.publishDialog?.closeAfterStatus ?? 'unavailable',
    deliveryRuleCount: plan.publishDialog
      ? `${plan.publishDialog.deliveryRuleCount} rules`
      : 'No delivery rules',
    manualSaveHandoffBoundary:
      `${ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS.length} ` +
      'save boundary slices',
    protectedExistingSnapshots: `${plan.protectedExistingAssignmentCount} existing links protected`,
    publicPayloadGuard: 'Sanitized runtime only',
    publishAccess: plan.publishDialog?.publishAccessValue ?? 'Unavailable',
    publishDialogSource: plan.publishDialog
      ? 'Assignment publish preflight'
      : 'Publish preflight unavailable',
    publishExecutionPlan: plan.publishExecution?.type ?? 'not-built',
    publishFlowBoundary: 'Normal assignment publish flow',
    publishScope: 'Saved AI enhancement activity',
    publishStatus: plan.status,
    rawOutputGuard: 'Raw output hidden',
    resultExportContinuity: 'Shared result model',
    reviewChecklistCount: plan.publishDialog
      ? `${plan.publishDialog.reviewChecklistCount} checks`
      : 'No publish checks',
    saveBoundarySource: plan.save.status,
    saveStatus: plan.save.canPersistActivity
      ? 'Save boundary passed'
      : 'Save boundary blocked',
    settingsSummaryStatus:
      plan.publishDialog?.settingsSummaryStatusValue ?? 'Unavailable',
    snapshotFreeze: plan.canPublishAssignment
      ? 'New snapshot required'
      : 'Snapshot pending',
    snapshotSource:
      plan.snapshotSource === 'saved-activity-record'
        ? 'Saved activity record'
        : 'No snapshot source',
    sourceMaterialPrivacy: 'Source material identifiers hidden',
    studentInstructionsStatus:
      plan.publishDialog?.status === 'ready' ? 'Prepared settings' : 'Hidden',
    teacherPublishAction: plan.publishSubmitted
      ? 'Publish clicked'
      : 'Awaiting publish click',
    timerStatus: plan.publishDialog?.status ?? 'unavailable',
    validationStatus:
      plan.publishDialog?.validationStatusValue ?? 'Unavailable',
  };
}

function getActivityAiEnhancementPublishBlockedReason(
  plan: ActivityAiEnhancementPublishBoundaryPlan
) {
  if (!plan.save.canPersistActivity) return plan.save.status;
  if (!plan.activityPersisted) return 'saved-activity-required';
  if (!plan.hasSavedActivityId) return 'saved-activity-id-required';
  if (!plan.publishDialog) return 'publish-preflight-unavailable';
  if (plan.publishExecution?.type === 'blocked') {
    return plan.publishExecution.reason;
  }
  if (plan.publishDialog.publishDisabled) return 'publish-dialog-disabled';
  if (!plan.publishSubmitted) return 'teacher-publish-action-required';

  return 'None';
}

function buildActivityAiEnhancementPublishBoundaryItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementPublishBoundaryItemId;
  summary: ActivityAiEnhancementPublishBoundarySummary;
}): Omit<ActivityAiEnhancementPublishBoundaryItemView, 'ariaLabel'> {
  switch (id) {
    case 'publish-scope':
      return item(
        id,
        'Publish scope',
        summary.publishScope,
        'The publish boundary starts only after a reviewed AI enhancement draft has moved through manual activity save.'
      );
    case 'save-boundary-source':
      return item(
        id,
        'Save boundary source',
        summary.saveBoundarySource,
        'Assignment publishing follows the AI enhancement save boundary status.'
      );
    case 'save-status':
      return item(
        id,
        'Save status',
        summary.saveStatus,
        'Publish preflight cannot run until the save boundary is ready.'
      );
    case 'activity-record-status':
      return item(
        id,
        'Activity record status',
        summary.activityRecordStatus,
        'A saved activity record is required before assignment publishing.'
      );
    case 'activity-id-source':
      return item(
        id,
        'Activity id source',
        summary.activityIdSource,
        'The publish flow needs a saved activity id but does not expose it in this view.'
      );
    case 'publish-dialog-source':
      return item(
        id,
        'Publish dialog source',
        summary.publishDialogSource,
        'The normal assignment publish preflight owns delivery settings and validation.'
      );
    case 'publish-access':
      return item(
        id,
        'Publish access',
        summary.publishAccess,
        'Activity lifecycle rules still decide whether the publish dialog is available.'
      );
    case 'teacher-publish-action':
      return item(
        id,
        'Teacher publish action',
        summary.teacherPublishAction,
        'Assignment links can be created only after the teacher submits the publish action.'
      );
    case 'publish-status':
      return item(
        id,
        'Publish status',
        summary.publishStatus,
        'The boundary records waiting, blocked, and ready-to-publish states.'
      );
    case 'publish-execution-plan':
      return item(
        id,
        'Publish execution plan',
        summary.publishExecutionPlan,
        'Only a sanitized publish/blocked summary crosses this AI enhancement boundary.'
      );
    case 'validation-status':
      return item(
        id,
        'Validation status',
        summary.validationStatus,
        'Assignment publish validation is summarized without exposing title or instructions.'
      );
    case 'delivery-rule-count':
      return item(
        id,
        'Delivery rule count',
        summary.deliveryRuleCount,
        'Delivery policy coverage stays in assignment-domain preflight helpers.'
      );
    case 'settings-summary-status':
      return item(
        id,
        'Settings summary status',
        summary.settingsSummaryStatus,
        'The assignment settings summary is represented as a safe status.'
      );
    case 'student-instructions-status':
      return item(
        id,
        'Student instructions status',
        summary.studentInstructionsStatus,
        'Student instruction text is not exposed by the AI publish boundary.'
      );
    case 'timer-status':
      return item(
        id,
        'Timer status',
        summary.timerStatus,
        'Timer and close-time readiness stay in the assignment publish preflight.'
      );
    case 'close-time-status':
      return item(
        id,
        'Close time status',
        summary.closeTimeStatus,
        'Close-time parsing remains owned by assignment-domain helpers.'
      );
    case 'review-checklist-count':
      return item(
        id,
        'Review checklist count',
        summary.reviewChecklistCount,
        'Publish review checks remain separate from AI draft review checks.'
      );
    case 'assignment-record-target':
      return item(
        id,
        'Assignment record target',
        summary.assignmentRecordTarget,
        'Successful publish creates assignment records through the assignment flow.'
      );
    case 'assignment-link-boundary':
      return item(
        id,
        'Assignment link boundary',
        summary.assignmentLinkBoundary,
        'Share links are created only by the publish flow after teacher action.'
      );
    case 'snapshot-freeze':
      return item(
        id,
        'Snapshot freeze',
        summary.snapshotFreeze,
        'Published assignments require a frozen snapshot of the saved activity.'
      );
    case 'snapshot-source':
      return item(
        id,
        'Snapshot source',
        summary.snapshotSource,
        'New assignment snapshots freeze the saved activity record, not raw AI output.'
      );
    case 'protected-existing-snapshots':
      return item(
        id,
        'Protected existing snapshots',
        summary.protectedExistingSnapshots,
        'Existing published assignment links remain frozen and are not mutated.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        summary.publicPayloadGuard,
        'Student payloads remain sanitized assignment runtime data.'
      );
    case 'answer-key-guard':
      return item(
        id,
        'Answer key guard',
        summary.answerKeyGuard,
        'Answer keys never become public payload data through the AI boundary.'
      );
    case 'source-material-privacy':
      return item(
        id,
        'Source material privacy',
        summary.sourceMaterialPrivacy,
        'Source material identifiers and storage details stay hidden.'
      );
    case 'raw-output-guard':
      return item(
        id,
        'Raw output guard',
        summary.rawOutputGuard,
        'Raw provider, fallback, or deterministic draft output is not published.'
      );
    case 'publish-flow-boundary':
      return item(
        id,
        'Publish flow boundary',
        summary.publishFlowBoundary,
        'AI enhancement work must hand off to the normal assignment publish flow.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        summary.resultExportContinuity,
        'Assignments published from AI-enhanced activities still use shared result exports.'
      );
    case 'blocked-reason':
      return item(
        id,
        'Blocked reason',
        summary.blockedReason,
        'Blocked publish states keep one structured reason for diagnostics.'
      );
    case 'manual-save-handoff-boundary':
      return item(
        id,
        'Manual save handoff boundary',
        summary.manualSaveHandoffBoundary,
        'Assignment publishing remains backed by the complete manual activity-save contract.'
      );
  }
}

function buildActivityAiEnhancementPublishBoundaryItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementPublishBoundaryItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementPublishBoundaryPrivacyContract(
  itemViews: ActivityAiEnhancementPublishBoundaryItemView[]
): ActivityAiEnhancementPublishBoundaryPrivacyContract {
  return {
    appliesAfterActivitySave: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    createsAssignmentSnapshotsWithoutTeacherAction: false,
    exposesActivityContentText: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesAssignmentTitle: false,
    exposesDraftText: false,
    exposesFileBytesToAi: false,
    exposesInternalActivityIds: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesShareSlug: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentInstructions: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesExistingAssignmentSnapshots: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresAssignmentPublishFlow: true,
    requiresSavedActivityRecord: true,
    requiresTeacherPublishAction: true,
    scope: 'activity-ai-enhancement-publish-boundary',
    usesAssignmentPublishPreflight: true,
    usesAssignmentSnapshotFreeze: true,
    usesSaveBoundaryHandoff: true,
    usesSaveBoundaryPlan: true,
  };
}

function getPublishHandoffValue(
  itemViews: Array<{ id: string; value: string }>,
  id: string
) {
  return itemViews.find((itemView) => itemView.id === id)?.value ?? '';
}

function item(
  id: ActivityAiEnhancementPublishBoundaryItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementPublishBoundaryItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
