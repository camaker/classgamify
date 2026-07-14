import {
  ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS,
  buildActivityAiEnhancementDraftApplicationPlan,
  type ActivityAiEnhancementDraftApplicationPlan,
  type ActivityAiEnhancementDraftApplicationSource,
} from '@/activities/ai-enhancement-draft-application';

export const ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS = [
  'review-scope',
  'application-plan-source',
  'application-status',
  'review-status',
  'blocked-reason',
  'teacher-review-required',
  'review-checklist-count',
  'reviewed-check-count',
  'missing-review-count',
  'title-review',
  'learning-goal-review',
  'question-review',
  'answer-review',
  'explanation-review',
  'pair-review',
  'group-review',
  'vocabulary-review',
  'teacher-note-review',
  'source-provenance-review',
  'template-readiness-review',
  'question-choice-review',
  'field-target-review',
  'action-needed-review',
  'ready-to-save-gate',
  'editor-only-boundary',
  'manual-save-boundary',
  'publish-boundary',
  'snapshot-protection',
  'public-payload-guard',
  'draft-application-handoff-boundary',
] as const;

export const ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS = [
  'title',
  'learning-goal',
  'questions',
  'answers',
  'explanations',
  'pairs',
  'groups',
  'vocabulary',
  'teacher-notes',
  'source-provenance',
  'template-readiness',
  'question-choices',
] as const;

export type ActivityAiEnhancementEditorReviewItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS)[number];

export type ActivityAiEnhancementEditorReviewCheckId =
  (typeof ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS)[number];

export type ActivityAiEnhancementEditorReviewStatus =
  | 'blocked-before-review'
  | 'needs-teacher-review'
  | 'ready-for-manual-save';

export type ActivityAiEnhancementEditorReviewSource =
  ActivityAiEnhancementDraftApplicationSource & {
    reviewedCheckIds?: readonly ActivityAiEnhancementEditorReviewCheckId[];
    teacherConfirmedReview?: boolean;
  };

export type ActivityAiEnhancementEditorReviewPlan = {
  application: ActivityAiEnhancementDraftApplicationPlan;
  canReachManualSave: boolean;
  missingReviewCount: number;
  requiredReviewCount: number;
  reviewedCheckCount: number;
  reviewedCheckIds: ActivityAiEnhancementEditorReviewCheckId[];
  status: ActivityAiEnhancementEditorReviewStatus;
  teacherConfirmedReview: boolean;
};

export type ActivityAiEnhancementEditorReviewItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementEditorReviewItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementEditorReviewPrivacyContract = {
  appliesAfterDraftApplication: true;
  blocksSaveUntilTeacherReview: true;
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
  itemIds: ActivityAiEnhancementEditorReviewItemId[];
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresEditorReview: true;
  scope: 'activity-ai-enhancement-editor-review';
  usesDraftApplicationHandoff: true;
  usesDraftApplicationPlan: true;
};

export type ActivityAiEnhancementEditorReviewView = {
  description: string;
  itemViews: ActivityAiEnhancementEditorReviewItemView[];
  plan: ActivityAiEnhancementEditorReviewPlan;
  privacy: ActivityAiEnhancementEditorReviewPrivacyContract;
  title: string;
};

type ActivityAiEnhancementEditorReviewSummary = {
  actionNeededReview: string;
  applicationPlanSource: string;
  applicationStatus: string;
  blockedReason: string;
  draftApplicationHandoffBoundary: string;
  editorOnlyBoundary: string;
  explanationReview: string;
  fieldTargetReview: string;
  groupReview: string;
  learningGoalReview: string;
  manualSaveBoundary: string;
  missingReviewCount: string;
  pairReview: string;
  publicPayloadGuard: string;
  publishBoundary: string;
  questionChoiceReview: string;
  questionReview: string;
  readyToSaveGate: string;
  reviewChecklistCount: string;
  reviewScope: string;
  reviewStatus: string;
  reviewedCheckCount: string;
  snapshotProtection: string;
  sourceProvenanceReview: string;
  teacherNoteReview: string;
  teacherReviewRequired: string;
  templateReadinessReview: string;
  titleReview: string;
  vocabularyReview: string;
  answerReview: string;
};

export function buildActivityAiEnhancementEditorReviewView(
  source: ActivityAiEnhancementEditorReviewSource
): ActivityAiEnhancementEditorReviewView {
  const plan = buildActivityAiEnhancementEditorReviewPlan(source);
  const summary = buildActivityAiEnhancementEditorReviewSummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS.map((id) =>
    buildActivityAiEnhancementEditorReviewItemView(
      buildActivityAiEnhancementEditorReviewItem({ id, summary })
    )
  );

  return {
    description:
      'Teacher review gate for AI enhancement drafts after editor application and before manual activity save, publish, snapshots, public payloads, or result exports.',
    itemViews,
    plan,
    privacy: buildActivityAiEnhancementEditorReviewPrivacyContract(itemViews),
    title: 'Activity AI enhancement editor review',
  };
}

export function buildActivityAiEnhancementEditorReviewPlan(
  source: ActivityAiEnhancementEditorReviewSource
): ActivityAiEnhancementEditorReviewPlan {
  const application = buildActivityAiEnhancementDraftApplicationPlan(source);
  const reviewedCheckIds = normalizeReviewedCheckIds(source.reviewedCheckIds);
  const teacherConfirmedReview = source.teacherConfirmedReview === true;
  const requiredReviewCount =
    ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS.length;
  const reviewedCheckCount = teacherConfirmedReview
    ? requiredReviewCount
    : reviewedCheckIds.length;
  const missingReviewCount = Math.max(
    requiredReviewCount - reviewedCheckCount,
    0
  );
  const status = getActivityAiEnhancementEditorReviewStatus({
    application,
    missingReviewCount,
    teacherConfirmedReview,
  });

  return {
    application,
    canReachManualSave: status === 'ready-for-manual-save',
    missingReviewCount,
    requiredReviewCount,
    reviewedCheckCount,
    reviewedCheckIds,
    status,
    teacherConfirmedReview,
  };
}

function normalizeReviewedCheckIds(
  reviewedCheckIds?: readonly ActivityAiEnhancementEditorReviewCheckId[]
) {
  const allowedCheckIds = new Set(
    ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS
  );
  const normalizedCheckIds: ActivityAiEnhancementEditorReviewCheckId[] = [];

  for (const checkId of reviewedCheckIds ?? []) {
    if (!allowedCheckIds.has(checkId)) continue;
    if (normalizedCheckIds.includes(checkId)) continue;
    normalizedCheckIds.push(checkId);
  }

  return normalizedCheckIds;
}

function getActivityAiEnhancementEditorReviewStatus({
  application,
  missingReviewCount,
  teacherConfirmedReview,
}: {
  application: ActivityAiEnhancementDraftApplicationPlan;
  missingReviewCount: number;
  teacherConfirmedReview: boolean;
}): ActivityAiEnhancementEditorReviewStatus {
  if (!application.canApplyToEditor) return 'blocked-before-review';

  if (teacherConfirmedReview || missingReviewCount === 0) {
    return 'ready-for-manual-save';
  }

  return 'needs-teacher-review';
}

function buildActivityAiEnhancementEditorReviewSummary(
  plan: ActivityAiEnhancementEditorReviewPlan
): ActivityAiEnhancementEditorReviewSummary {
  return {
    actionNeededReview: `${plan.application.actionNeededCount} action needed`,
    answerReview: getReviewCheckStatus(plan, 'answers'),
    applicationPlanSource: plan.application.applicationStatus,
    applicationStatus: plan.application.validationStatus,
    blockedReason: plan.application.execution.blockedReason ?? 'None',
    draftApplicationHandoffBoundary:
      `${ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS.length} ` +
      'draft application slices',
    editorOnlyBoundary: 'Editor-only draft',
    explanationReview: getReviewCheckStatus(plan, 'explanations'),
    fieldTargetReview:
      `${plan.application.coveredFieldTargetCount}/` +
      `${plan.application.fieldTargetCount} targets`,
    groupReview: getReviewCheckStatus(plan, 'groups'),
    learningGoalReview: getReviewCheckStatus(plan, 'learning-goal'),
    manualSaveBoundary: plan.canReachManualSave
      ? 'Manual save enabled'
      : 'Manual save blocked',
    missingReviewCount: String(plan.missingReviewCount),
    pairReview: getReviewCheckStatus(plan, 'pairs'),
    publicPayloadGuard: 'Sanitized runtime only',
    publishBoundary: 'No assignment link',
    questionChoiceReview:
      `${plan.application.questionChoiceReadyCount} ready / ` +
      `${plan.application.questionChoiceNeedsCandidateCount} needs candidates`,
    questionReview: getReviewCheckStatus(plan, 'questions'),
    readyToSaveGate: plan.canReachManualSave
      ? 'Ready for manual save'
      : 'Review required',
    reviewChecklistCount: String(plan.requiredReviewCount),
    reviewScope: 'Teacher editor review',
    reviewStatus: plan.status,
    reviewedCheckCount: String(plan.reviewedCheckCount),
    snapshotProtection: 'Frozen snapshots protected',
    sourceProvenanceReview: getReviewCheckStatus(plan, 'source-provenance'),
    teacherNoteReview: getReviewCheckStatus(plan, 'teacher-notes'),
    teacherReviewRequired: 'Teacher review required',
    templateReadinessReview:
      `${plan.application.readyTemplateCount} ready / ` +
      `${plan.application.lockedTemplateCount} locked`,
    titleReview: getReviewCheckStatus(plan, 'title'),
    vocabularyReview: getReviewCheckStatus(plan, 'vocabulary'),
  };
}

function getReviewCheckStatus(
  plan: ActivityAiEnhancementEditorReviewPlan,
  checkId: ActivityAiEnhancementEditorReviewCheckId
) {
  if (plan.teacherConfirmedReview || plan.reviewedCheckIds.includes(checkId)) {
    return 'Reviewed';
  }

  return 'Needs review';
}

function buildActivityAiEnhancementEditorReviewItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementEditorReviewItemId;
  summary: ActivityAiEnhancementEditorReviewSummary;
}): Omit<ActivityAiEnhancementEditorReviewItemView, 'ariaLabel'> {
  switch (id) {
    case 'review-scope':
      return item(
        id,
        'Review scope',
        summary.reviewScope,
        'The review gate covers applied AI enhancement drafts inside the editor.'
      );
    case 'application-plan-source':
      return item(
        id,
        'Application plan source',
        summary.applicationPlanSource,
        'Editor review follows the draft application plan status.'
      );
    case 'application-status':
      return item(
        id,
        'Application status',
        summary.applicationStatus,
        'Only valid applied drafts can move through teacher review.'
      );
    case 'review-status':
      return item(
        id,
        'Review status',
        summary.reviewStatus,
        'Review status stays structured before the manual save button is enabled.'
      );
    case 'blocked-reason':
      return item(
        id,
        'Blocked reason',
        summary.blockedReason,
        'Blocked application plans preserve the upstream reason.'
      );
    case 'teacher-review-required':
      return item(
        id,
        'Teacher review required',
        summary.teacherReviewRequired,
        'AI enhancement drafts must be reviewed before save.'
      );
    case 'review-checklist-count':
      return item(
        id,
        'Review checklist count',
        summary.reviewChecklistCount,
        'The review gate keeps a fixed checklist of classroom draft areas.'
      );
    case 'reviewed-check-count':
      return item(
        id,
        'Reviewed check count',
        summary.reviewedCheckCount,
        'Reviewed checks are counted without exposing draft text.'
      );
    case 'missing-review-count':
      return item(
        id,
        'Missing review count',
        summary.missingReviewCount,
        'Missing checks keep manual save blocked until review is complete.'
      );
    case 'title-review':
      return item(
        id,
        'Title review',
        summary.titleReview,
        'The teacher reviews the generated title before save.'
      );
    case 'learning-goal-review':
      return item(
        id,
        'Learning goal review',
        summary.learningGoalReview,
        'The teacher reviews the learning goal before save.'
      );
    case 'question-review':
      return item(
        id,
        'Question review',
        summary.questionReview,
        'The teacher reviews generated questions before save.'
      );
    case 'answer-review':
      return item(
        id,
        'Answer review',
        summary.answerReview,
        'The teacher reviews accepted answers before save and public payloads stay sanitized.'
      );
    case 'explanation-review':
      return item(
        id,
        'Explanation review',
        summary.explanationReview,
        'The teacher reviews answer explanations before students can see them through normal settings.'
      );
    case 'pair-review':
      return item(
        id,
        'Pair review',
        summary.pairReview,
        'The teacher reviews pair content for match and line-match modes.'
      );
    case 'group-review':
      return item(
        id,
        'Group review',
        summary.groupReview,
        'The teacher reviews group-sort and classification content before save.'
      );
    case 'vocabulary-review':
      return item(
        id,
        'Vocabulary review',
        summary.vocabularyReview,
        'The teacher reviews vocabulary terms before save.'
      );
    case 'teacher-note-review':
      return item(
        id,
        'Teacher note review',
        summary.teacherNoteReview,
        'The teacher reviews private notes before persistence.'
      );
    case 'source-provenance-review':
      return item(
        id,
        'Source provenance review',
        summary.sourceProvenanceReview,
        'The teacher reviews safe source-material provenance counts without file identifiers.'
      );
    case 'template-readiness-review':
      return item(
        id,
        'Template readiness review',
        summary.templateReadinessReview,
        'The teacher reviews ready and locked template counts before save.'
      );
    case 'question-choice-review':
      return item(
        id,
        'Question choice review',
        summary.questionChoiceReview,
        'The teacher reviews quiz choice readiness before publishing future assignments.'
      );
    case 'field-target-review':
      return item(
        id,
        'Field target review',
        summary.fieldTargetReview,
        'The teacher sees whether the draft covered the planned structured targets.'
      );
    case 'action-needed-review':
      return item(
        id,
        'Action needed review',
        summary.actionNeededReview,
        'The review gate keeps action-needed count visible without exposing content.'
      );
    case 'ready-to-save-gate':
      return item(
        id,
        'Ready to save gate',
        summary.readyToSaveGate,
        'Manual save is reachable only after review is complete.'
      );
    case 'editor-only-boundary':
      return item(
        id,
        'Editor-only boundary',
        summary.editorOnlyBoundary,
        'Review happens inside the editor and does not persist records by itself.'
      );
    case 'manual-save-boundary':
      return item(
        id,
        'Manual save boundary',
        summary.manualSaveBoundary,
        'The normal save action remains the only persistence step.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        summary.publishBoundary,
        'Review completion does not create assignment links.'
      );
    case 'snapshot-protection':
      return item(
        id,
        'Snapshot protection',
        summary.snapshotProtection,
        'Existing assignment snapshots remain frozen during review.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        summary.publicPayloadGuard,
        'Student payloads remain separate from reviewed draft data.'
      );
    case 'draft-application-handoff-boundary':
      return item(
        id,
        'Draft application handoff boundary',
        summary.draftApplicationHandoffBoundary,
        'Teacher review remains backed by the complete editor-only draft application contract.'
      );
  }
}

function buildActivityAiEnhancementEditorReviewItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementEditorReviewItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementEditorReviewPrivacyContract(
  itemViews: ActivityAiEnhancementEditorReviewItemView[]
): ActivityAiEnhancementEditorReviewPrivacyContract {
  return {
    appliesAfterDraftApplication: true,
    blocksSaveUntilTeacherReview: true,
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
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-editor-review',
    usesDraftApplicationHandoff: true,
    usesDraftApplicationPlan: true,
  };
}

function item(
  id: ActivityAiEnhancementEditorReviewItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementEditorReviewItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
