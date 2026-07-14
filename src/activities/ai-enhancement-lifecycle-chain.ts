import {
  buildActivityAiEnhancementDraftApplicationPlan,
  type ActivityAiEnhancementDraftApplicationStatus,
  type ActivityAiEnhancementDraftApplicationValidationStatus,
} from '@/activities/ai-enhancement-draft-application';
import {
  buildActivityAiEnhancementDraftOutputPlan,
  type ActivityAiEnhancementDraftOutputSourceMode,
  type ActivityAiEnhancementDraftOutputStatus,
  type ActivityAiEnhancementDraftOutputValidationStatus,
} from '@/activities/ai-enhancement-draft-output';
import {
  buildActivityAiEnhancementEditorReviewPlan,
  type ActivityAiEnhancementEditorReviewStatus,
} from '@/activities/ai-enhancement-editor-review';
import {
  buildActivityAiEnhancementExecutionPlan,
  type ActivityAiEnhancementExecutionMode,
  type ActivityAiEnhancementExecutionStatus,
} from '@/activities/ai-enhancement-execution';
import {
  buildActivityAiEnhancementPolicyDecision,
  type ActivityAiEnhancementPolicyStatus,
} from '@/activities/ai-enhancement-policy';
import {
  buildActivityAiEnhancementPublishBoundaryPlan,
  type ActivityAiEnhancementPublishBoundarySource,
  type ActivityAiEnhancementPublishBoundaryStatus,
} from '@/activities/ai-enhancement-publish-boundary';
import {
  buildActivityAiEnhancementSaveBoundaryPlan,
  type ActivityAiEnhancementSaveBoundaryStatus,
} from '@/activities/ai-enhancement-save-boundary';
import type { CreateActivityInput } from '@/activities/validation';
import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';

export const ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS = [
  'policy-stage',
  'execution-stage',
  'draft-output-stage',
  'draft-application-stage',
  'teacher-review-stage',
  'manual-save-stage',
  'activity-record-stage',
  'assignment-publish-stage',
  'share-link-stage',
  'snapshot-freeze-stage',
  'source-material-stage',
  'provider-mode-stage',
  'fallback-mode-stage',
  'deterministic-mode-stage',
  'blocked-reason-stage',
  'field-target-stage',
  'coverage-stage',
  'review-checklist-stage',
  'save-action-stage',
  'publish-action-stage',
  'public-payload-stage',
  'answer-key-stage',
  'raw-output-stage',
  'source-byte-stage',
  'storage-key-stage',
  'student-data-stage',
  'result-export-stage',
  'chain-state-stage',
  'documentation-stage',
  'assignment-publish-handoff-boundary',
] as const;

export const ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/ai-enhancement-roadmap-chain.ts',
  'src/activities/ai-enhancement-policy.ts',
  'src/activities/ai-enhancement-execution.ts',
  'src/activities/ai-enhancement-draft-output.ts',
  'src/activities/ai-enhancement-draft-application.ts',
  'src/activities/ai-enhancement-editor-review.ts',
  'src/activities/ai-enhancement-save-boundary.ts',
  'src/activities/ai-enhancement-publish-boundary.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/ai-draft.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/draft-meta.ts',
  'src/activities/draft-source.ts',
  'src/activities/template-remix.ts',
  'src/activities/distractors.ts',
  'src/activities/question-options.ts',
  'src/activities/source-extraction-assist.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/material-references.ts',
  'src/activities/material-summary.ts',
  'src/activities/validation.ts',
  'src/activities/editor.ts',
  'src/activities/persistence.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/assignments/results-export.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityAiEnhancementLifecycleChainItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS)[number];

export type ActivityAiEnhancementLifecycleChainStatus =
  | 'awaiting-activity-record'
  | 'awaiting-draft-output'
  | 'awaiting-teacher-publish'
  | 'awaiting-teacher-review'
  | 'awaiting-teacher-save'
  | 'blocked-before-application'
  | 'blocked-before-execution'
  | 'blocked-before-publish'
  | 'blocked-before-save'
  | 'ready-for-assignment-publish';

export type ActivityAiEnhancementLifecycleChainSource =
  ActivityAiEnhancementPublishBoundarySource & {
    outputSource?: ActivityAiEnhancementDraftOutputSourceMode;
    parsedDraft?: CreateActivityInput | null;
  };

export type ActivityAiEnhancementLifecycleChainPlan = {
  activityPersisted: boolean;
  applicationStatus: ActivityAiEnhancementDraftApplicationStatus;
  applicationValidationStatus: ActivityAiEnhancementDraftApplicationValidationStatus;
  blockedReason: string;
  canApplyToEditor: boolean;
  canCreateAssignmentLink: boolean;
  canPassDraftOutputToApplication: boolean;
  canPersistActivity: boolean;
  canReachManualSave: boolean;
  chainStatus: ActivityAiEnhancementLifecycleChainStatus;
  coveredFieldTargetCount: number;
  draftOutputStatus: ActivityAiEnhancementDraftOutputStatus;
  draftOutputValidationStatus: ActivityAiEnhancementDraftOutputValidationStatus;
  executionMode: ActivityAiEnhancementExecutionMode;
  executionStatus: ActivityAiEnhancementExecutionStatus;
  fieldTargetCount: number;
  lockedTemplateCount: number;
  policyStatus: ActivityAiEnhancementPolicyStatus;
  protectedExistingAssignmentCount: number;
  protectedSnapshotCount: number;
  publishStatus: ActivityAiEnhancementPublishBoundaryStatus;
  publishSubmitted: boolean;
  readyTemplateCount: number;
  requiredReviewCount: number;
  reviewStatus: ActivityAiEnhancementEditorReviewStatus;
  reviewedCheckCount: number;
  saveStatus: ActivityAiEnhancementSaveBoundaryStatus;
  sourceFileCount: number;
  sourceMaterialCount: number;
  sourceMaterialKindCount: number;
  stageCount: number;
  teacherSubmittedSave: boolean;
  usesDeterministicDraft: boolean;
  usesExternalProvider: boolean;
  usesLocalFallback: boolean;
};

export type ActivityAiEnhancementLifecycleChainItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementLifecycleChainItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinksWithoutTeacherAction: false;
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
  itemIds: ActivityAiEnhancementLifecycleChainItemId[];
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresCreateActivityInputContract: true;
  requiresEditorReview: true;
  requiresTeacherPublishAction: true;
  requiresTeacherSaveAction: true;
  sourceFiles: string[];
  usesAssignmentPublishHandoff: true;
  usesAssignmentPublishPreflight: true;
  usesAssignmentSnapshotFreeze: true;
  usesDraftOutputPlan: true;
  usesPublishBoundaryPlan: true;
  usesSaveBoundaryPlan: true;
};

export type ActivityAiEnhancementLifecycleChainView = {
  description: string;
  itemViews: ActivityAiEnhancementLifecycleChainItemView[];
  plan: ActivityAiEnhancementLifecycleChainPlan;
  privacy: ActivityAiEnhancementLifecycleChainPrivacyContract;
  title: string;
};

type ActivityAiEnhancementLifecycleChainSummary = {
  activityRecordStage: string;
  answerKeyStage: string;
  assignmentPublishHandoffBoundary: string;
  assignmentPublishStage: string;
  blockedReasonStage: string;
  chainStateStage: string;
  coverageStage: string;
  deterministicModeStage: string;
  documentationStage: string;
  draftApplicationStage: string;
  draftOutputStage: string;
  executionStage: string;
  fallbackModeStage: string;
  fieldTargetStage: string;
  manualSaveStage: string;
  policyStage: string;
  providerModeStage: string;
  publicPayloadStage: string;
  publishActionStage: string;
  rawOutputStage: string;
  resultExportStage: string;
  reviewChecklistStage: string;
  saveActionStage: string;
  shareLinkStage: string;
  snapshotFreezeStage: string;
  sourceByteStage: string;
  sourceMaterialStage: string;
  storageKeyStage: string;
  studentDataStage: string;
  teacherReviewStage: string;
};

export function buildActivityAiEnhancementLifecycleChainView(
  source: ActivityAiEnhancementLifecycleChainSource
): ActivityAiEnhancementLifecycleChainView {
  const plan = buildActivityAiEnhancementLifecycleChainPlan(source);
  const summary = buildActivityAiEnhancementLifecycleChainSummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS.map((id) =>
    buildActivityAiEnhancementLifecycleChainItemView(
      buildActivityAiEnhancementLifecycleChainItem({ id, summary })
    )
  );

  return {
    description:
      'Thirty-slice AI enhancement lifecycle chain from request policy through execution, parsed draft output, editor application, teacher review, manual save, saved activity records, assignment publish preflight, share links, snapshots, public payloads, privacy guards, and result export continuity.',
    itemViews,
    plan,
    privacy: buildActivityAiEnhancementLifecycleChainPrivacyContract(itemViews),
    title: 'Activity AI enhancement lifecycle chain',
  };
}

export function buildActivityAiEnhancementLifecycleChainPlan(
  source: ActivityAiEnhancementLifecycleChainSource
): ActivityAiEnhancementLifecycleChainPlan {
  const policy = buildActivityAiEnhancementPolicyDecision(source);
  const execution = buildActivityAiEnhancementExecutionPlan(source);
  const draftOutput = buildActivityAiEnhancementDraftOutputPlan({
    ...source,
    parsedDraft: resolveLifecycleParsedDraft(source),
  });
  const application = buildActivityAiEnhancementDraftApplicationPlan(source);
  const review = buildActivityAiEnhancementEditorReviewPlan(source);
  const save = buildActivityAiEnhancementSaveBoundaryPlan(source);
  const publish = buildActivityAiEnhancementPublishBoundaryPlan(source);
  const chainStatus = getActivityAiEnhancementLifecycleChainStatus({
    application,
    draftOutput,
    review,
    save,
    publish,
  });

  return {
    activityPersisted: publish.activityPersisted,
    applicationStatus: application.applicationStatus,
    applicationValidationStatus: application.validationStatus,
    blockedReason: getActivityAiEnhancementLifecycleBlockedReason({
      application,
      draftOutput,
      review,
      save,
      publish,
    }),
    canApplyToEditor: application.canApplyToEditor,
    canCreateAssignmentLink:
      draftOutput.canPassToEditorApplication && publish.canCreateAssignmentLink,
    canPassDraftOutputToApplication: draftOutput.canPassToEditorApplication,
    canPersistActivity:
      draftOutput.canPassToEditorApplication && save.canPersistActivity,
    canReachManualSave:
      draftOutput.canPassToEditorApplication && review.canReachManualSave,
    chainStatus,
    coveredFieldTargetCount: application.coveredFieldTargetCount,
    draftOutputStatus: draftOutput.status,
    draftOutputValidationStatus: draftOutput.validationStatus,
    executionMode: execution.mode,
    executionStatus: execution.status,
    fieldTargetCount: application.fieldTargetCount,
    lockedTemplateCount: application.lockedTemplateCount,
    policyStatus: policy.status,
    protectedExistingAssignmentCount: publish.protectedExistingAssignmentCount,
    protectedSnapshotCount: save.preservedAssignmentSnapshotCount,
    publishStatus: publish.status,
    publishSubmitted: publish.publishSubmitted,
    readyTemplateCount: application.readyTemplateCount,
    requiredReviewCount: review.requiredReviewCount,
    reviewStatus: review.status,
    reviewedCheckCount: review.reviewedCheckCount,
    saveStatus: save.status,
    sourceFileCount:
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    sourceMaterialCount: policy.sourceMaterialCount,
    sourceMaterialKindCount: policy.sourceMaterialKindCount,
    stageCount: ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS.length,
    teacherSubmittedSave: save.teacherSubmittedSave,
    usesDeterministicDraft: execution.usesDeterministicDraft,
    usesExternalProvider: execution.usesExternalProvider,
    usesLocalFallback: execution.usesLocalFallback,
  };
}

function resolveLifecycleParsedDraft(
  source: ActivityAiEnhancementLifecycleChainSource
) {
  if (Object.hasOwn(source, 'parsedDraft')) return source.parsedDraft;

  return source.proposedDraft ?? null;
}

function getActivityAiEnhancementLifecycleChainStatus({
  application,
  draftOutput,
  publish,
  review,
  save,
}: {
  application: ReturnType<
    typeof buildActivityAiEnhancementDraftApplicationPlan
  >;
  draftOutput: ReturnType<typeof buildActivityAiEnhancementDraftOutputPlan>;
  publish: ReturnType<typeof buildActivityAiEnhancementPublishBoundaryPlan>;
  review: ReturnType<typeof buildActivityAiEnhancementEditorReviewPlan>;
  save: ReturnType<typeof buildActivityAiEnhancementSaveBoundaryPlan>;
}): ActivityAiEnhancementLifecycleChainStatus {
  if (draftOutput.execution.status === 'blocked') {
    return 'blocked-before-execution';
  }

  if (draftOutput.status === 'awaiting-output') {
    return 'awaiting-draft-output';
  }

  if (
    !draftOutput.canPassToEditorApplication ||
    !application.canApplyToEditor
  ) {
    return 'blocked-before-application';
  }

  if (!review.canReachManualSave) return 'awaiting-teacher-review';

  if (!save.canPersistActivity) {
    return save.status === 'awaiting-teacher-save-action'
      ? 'awaiting-teacher-save'
      : 'blocked-before-save';
  }

  switch (publish.status) {
    case 'awaiting-activity-record':
      return 'awaiting-activity-record';
    case 'awaiting-publish-action':
      return 'awaiting-teacher-publish';
    case 'ready-for-assignment-publish':
      return 'ready-for-assignment-publish';
    case 'blocked-before-publish':
    case 'blocked-before-save':
      return 'blocked-before-publish';
  }
}

function getActivityAiEnhancementLifecycleBlockedReason({
  application,
  draftOutput,
  publish,
  review,
  save,
}: {
  application: ReturnType<
    typeof buildActivityAiEnhancementDraftApplicationPlan
  >;
  draftOutput: ReturnType<typeof buildActivityAiEnhancementDraftOutputPlan>;
  publish: ReturnType<typeof buildActivityAiEnhancementPublishBoundaryPlan>;
  review: ReturnType<typeof buildActivityAiEnhancementEditorReviewPlan>;
  save: ReturnType<typeof buildActivityAiEnhancementSaveBoundaryPlan>;
}) {
  if (draftOutput.execution.blockedReason) {
    return draftOutput.execution.blockedReason;
  }

  if (!draftOutput.canPassToEditorApplication) {
    return draftOutput.validationStatus;
  }

  if (!application.canApplyToEditor) return application.validationStatus;
  if (!review.canReachManualSave) return 'teacher-review-incomplete';
  if (!save.canPersistActivity) return save.status;
  if (!publish.canPublishAssignment) return publish.status;

  return 'None';
}

function buildActivityAiEnhancementLifecycleChainSummary(
  plan: ActivityAiEnhancementLifecycleChainPlan
): ActivityAiEnhancementLifecycleChainSummary {
  return {
    activityRecordStage: plan.activityPersisted
      ? 'Saved activity record'
      : 'Activity save pending',
    answerKeyStage: 'No public answer keys',
    assignmentPublishHandoffBoundary: `${ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length} assignment publish slices`,
    assignmentPublishStage: plan.publishStatus,
    blockedReasonStage: plan.blockedReason,
    chainStateStage: plan.chainStatus,
    coverageStage: `${plan.coveredFieldTargetCount}/${plan.fieldTargetCount} targets`,
    deterministicModeStage: plan.usesDeterministicDraft
      ? 'Deterministic draft'
      : 'Deterministic optional',
    documentationStage: `${plan.sourceFileCount} source files`,
    draftApplicationStage: plan.applicationStatus,
    draftOutputStage: plan.draftOutputStatus,
    executionStage: plan.executionStatus,
    fallbackModeStage: plan.usesLocalFallback
      ? 'Fallback selected'
      : 'Fallback available',
    fieldTargetStage: `${plan.fieldTargetCount} targets`,
    manualSaveStage: plan.saveStatus,
    policyStage: plan.policyStatus,
    providerModeStage: plan.usesExternalProvider
      ? 'Provider selected'
      : 'Provider off',
    publicPayloadStage: 'Sanitized runtime only',
    publishActionStage: plan.publishSubmitted
      ? 'Publish clicked'
      : 'Awaiting publish click',
    rawOutputStage: 'Raw output hidden',
    resultExportStage: 'Shared result model',
    reviewChecklistStage:
      `${plan.reviewedCheckCount}/` + `${plan.requiredReviewCount} reviewed`,
    saveActionStage: plan.teacherSubmittedSave
      ? 'Save clicked'
      : 'Awaiting save click',
    shareLinkStage: plan.canCreateAssignmentLink
      ? 'Publish flow creates link'
      : 'No share link',
    snapshotFreezeStage: plan.canCreateAssignmentLink
      ? 'Saved activity snapshot'
      : 'Snapshot pending',
    sourceByteStage: 'No file bytes',
    sourceMaterialStage:
      `${plan.sourceMaterialCount} references / ` +
      `${plan.sourceMaterialKindCount} kinds`,
    storageKeyStage: 'Storage hidden',
    studentDataStage: 'No student records touched',
    teacherReviewStage: plan.reviewStatus,
  };
}

function buildActivityAiEnhancementLifecycleChainItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementLifecycleChainItemId;
  summary: ActivityAiEnhancementLifecycleChainSummary;
}): Omit<ActivityAiEnhancementLifecycleChainItemView, 'ariaLabel'> {
  switch (id) {
    case 'policy-stage':
      return item(
        id,
        'Policy stage',
        summary.policyStage,
        'The lifecycle starts with the shared AI enhancement request policy.'
      );
    case 'execution-stage':
      return item(
        id,
        'Execution stage',
        summary.executionStage,
        'Execution stays provider-ready, fallback-ready, deterministic, or blocked.'
      );
    case 'draft-output-stage':
      return item(
        id,
        'Draft output stage',
        summary.draftOutputStage,
        'Provider, fallback, or deterministic output must be parsed before application.'
      );
    case 'draft-application-stage':
      return item(
        id,
        'Draft application stage',
        summary.draftApplicationStage,
        'Parsed drafts fill editor-only state before teacher review.'
      );
    case 'teacher-review-stage':
      return item(
        id,
        'Teacher review stage',
        summary.teacherReviewStage,
        'Manual save remains blocked until the teacher review gate passes.'
      );
    case 'manual-save-stage':
      return item(
        id,
        'Manual save stage',
        summary.manualSaveStage,
        'Activity persistence remains behind the normal teacher save action.'
      );
    case 'activity-record-stage':
      return item(
        id,
        'Activity record stage',
        summary.activityRecordStage,
        'Assignment publishing waits for a saved activity record.'
      );
    case 'assignment-publish-stage':
      return item(
        id,
        'Assignment publish stage',
        summary.assignmentPublishStage,
        'Assignment links are created only through the normal publish flow.'
      );
    case 'share-link-stage':
      return item(
        id,
        'Share link stage',
        summary.shareLinkStage,
        'The lifecycle summarizes whether the publish flow can create a link.'
      );
    case 'snapshot-freeze-stage':
      return item(
        id,
        'Snapshot freeze stage',
        summary.snapshotFreezeStage,
        'Published assignments freeze the saved activity record, not raw AI output.'
      );
    case 'source-material-stage':
      return item(
        id,
        'Source material stage',
        summary.sourceMaterialStage,
        'Only source-material counts and kind coverage move through the chain.'
      );
    case 'provider-mode-stage':
      return item(
        id,
        'Provider mode stage',
        summary.providerModeStage,
        'Provider work is selected only after policy and execution gates pass.'
      );
    case 'fallback-mode-stage':
      return item(
        id,
        'Fallback mode stage',
        summary.fallbackModeStage,
        'Local fallback keeps development and tests deterministic.'
      );
    case 'deterministic-mode-stage':
      return item(
        id,
        'Deterministic mode stage',
        summary.deterministicModeStage,
        'Deterministic draft paths avoid provider work when structured readiness is enough.'
      );
    case 'blocked-reason-stage':
      return item(
        id,
        'Blocked reason stage',
        summary.blockedReasonStage,
        'The lifecycle keeps one safe structured reason for diagnostics.'
      );
    case 'field-target-stage':
      return item(
        id,
        'Field target stage',
        summary.fieldTargetStage,
        'Enhancement field targets stay visible as counts instead of draft text.'
      );
    case 'coverage-stage':
      return item(
        id,
        'Coverage stage',
        summary.coverageStage,
        'Draft coverage is summarized without exposing generated classroom content.'
      );
    case 'review-checklist-stage':
      return item(
        id,
        'Review checklist stage',
        summary.reviewChecklistStage,
        'The chain preserves teacher review completion counts.'
      );
    case 'save-action-stage':
      return item(
        id,
        'Save action stage',
        summary.saveActionStage,
        'The teacher save click remains the only activity persistence trigger.'
      );
    case 'publish-action-stage':
      return item(
        id,
        'Publish action stage',
        summary.publishActionStage,
        'The teacher publish click remains the only assignment link trigger.'
      );
    case 'public-payload-stage':
      return item(
        id,
        'Public payload stage',
        summary.publicPayloadStage,
        'Student runners receive sanitized assignment runtime data only.'
      );
    case 'answer-key-stage':
      return item(
        id,
        'Answer key stage',
        summary.answerKeyStage,
        'Answer keys stay private until normal assignment settings allow review.'
      );
    case 'raw-output-stage':
      return item(
        id,
        'Raw output stage',
        summary.rawOutputStage,
        'Raw provider, fallback, or deterministic output stays outside handoffs.'
      );
    case 'source-byte-stage':
      return item(
        id,
        'Source byte stage',
        summary.sourceByteStage,
        'Uploaded source-material bytes remain outside this lifecycle.'
      );
    case 'storage-key-stage':
      return item(
        id,
        'Storage key stage',
        summary.storageKeyStage,
        'Storage keys, URLs, file ids, paths, query tokens, and permissions stay hidden.'
      );
    case 'student-data-stage':
      return item(
        id,
        'Student data stage',
        summary.studentDataStage,
        'AI enhancement lifecycle planning does not touch student attempts or identities.'
      );
    case 'result-export-stage':
      return item(
        id,
        'Result export stage',
        summary.resultExportStage,
        'Assignments from reviewed AI-enhanced activities keep the shared result model.'
      );
    case 'chain-state-stage':
      return item(
        id,
        'Chain state stage',
        summary.chainStateStage,
        'The chain state reflects the first lifecycle gate that still needs action.'
      );
    case 'documentation-stage':
      return item(
        id,
        'Documentation stage',
        summary.documentationStage,
        'The lifecycle is backed by product, domain, assignment, and catalog sources.'
      );
    case 'assignment-publish-handoff-boundary':
      return item(
        id,
        'Assignment publish handoff boundary',
        summary.assignmentPublishHandoffBoundary,
        'The AI lifecycle returns to the complete core assignment publish contract.'
      );
  }
}

function buildActivityAiEnhancementLifecycleChainItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementLifecycleChainItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementLifecycleChainPrivacyContract(
  itemViews: ActivityAiEnhancementLifecycleChainItemView[]
): ActivityAiEnhancementLifecycleChainPrivacyContract {
  return {
    chainSourceFileCount:
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
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
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    requiresTeacherPublishAction: true,
    requiresTeacherSaveAction: true,
    sourceFiles: [...ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES],
    usesAssignmentPublishHandoff: true,
    usesAssignmentPublishPreflight: true,
    usesAssignmentSnapshotFreeze: true,
    usesDraftOutputPlan: true,
    usesPublishBoundaryPlan: true,
    usesSaveBoundaryPlan: true,
  };
}

function item(
  id: ActivityAiEnhancementLifecycleChainItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementLifecycleChainItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
