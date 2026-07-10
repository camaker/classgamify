import {
  buildActivityAiEnhancementExecutionPlan,
  type ActivityAiEnhancementExecutionPlan,
  type ActivityAiEnhancementExecutionSource,
} from '@/activities/ai-enhancement-execution';
import type { ActivityAiEnhancementPolicyTargetField } from '@/activities/ai-enhancement-policy';
import {
  buildActivityDraftMeta,
  type ActivityDraftMeta,
} from '@/activities/draft-meta';
import type { ActivityContent } from '@/activities/types';
import {
  buildActivityContent,
  createActivityInputSchema,
  parseActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';

export const ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS = [
  'application-scope',
  'execution-plan-source',
  'execution-status',
  'blocked-reason',
  'draft-output-presence',
  'draft-contract-validation',
  'editor-only-target',
  'field-target-coverage',
  'create-input-contract',
  'activity-content-normalization',
  'template-readiness-refresh',
  'draft-coverage-summary',
  'review-checklist-refresh',
  'question-choice-refresh',
  'source-provenance-summary',
  'raw-provider-output-guard',
  'raw-source-text-guard',
  'source-byte-guard',
  'storage-key-guard',
  'answer-key-public-guard',
  'draft-text-privacy',
  'teacher-review-gate',
  'save-gate',
  'publish-boundary',
  'snapshot-protection',
  'public-payload-guard',
  'result-export-continuity',
  'fallback-application',
  'provider-application',
  'application-chain-gate',
] as const;

export type ActivityAiEnhancementDraftApplicationItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS)[number];

export type ActivityAiEnhancementDraftApplicationStatus =
  | 'awaiting-draft-output'
  | 'blocked-before-draft'
  | 'invalid-draft'
  | 'ready-for-editor-review';

export type ActivityAiEnhancementDraftApplicationValidationStatus =
  | 'blocked'
  | 'invalid'
  | 'missing'
  | 'valid';

export type ActivityAiEnhancementDraftApplicationSource =
  ActivityAiEnhancementExecutionSource & {
    proposedDraft?: CreateActivityInput | null;
  };

export type ActivityAiEnhancementDraftApplicationPlan = {
  actionNeededCount: number;
  applicationStatus: ActivityAiEnhancementDraftApplicationStatus;
  canApplyToEditor: boolean;
  contentCoverage: ActivityAiEnhancementDraftContentCoverage;
  coveredFieldTargetCount: number;
  draftTarget: 'editor-only';
  execution: ActivityAiEnhancementExecutionPlan;
  fieldTargetCount: number;
  lockedTemplateCount: number;
  questionChoiceNeedsCandidateCount: number;
  questionChoiceReadyCount: number;
  readyTemplateCount: number;
  reviewChecklistCount: number;
  validationStatus: ActivityAiEnhancementDraftApplicationValidationStatus;
};

export type ActivityAiEnhancementDraftContentCoverage = {
  groups: number;
  pairs: number;
  questions: number;
  sourceMaterials: number;
  teacherNotes: number;
  vocabulary: number;
};

export type ActivityAiEnhancementDraftApplicationItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementDraftApplicationItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementDraftApplicationPrivacyContract = {
  appliesAfterExecutionPlan: true;
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
  fillsEditorOnly: true;
  itemIds: ActivityAiEnhancementDraftApplicationItemId[];
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresCreateActivityInputContract: true;
  requiresEditorReview: true;
  scope: 'activity-ai-enhancement-draft-application';
  usesDraftMeta: true;
  usesExecutionPlan: true;
  usesTemplateReadinessDomain: true;
};

export type ActivityAiEnhancementDraftApplicationView = {
  description: string;
  itemViews: ActivityAiEnhancementDraftApplicationItemView[];
  plan: ActivityAiEnhancementDraftApplicationPlan;
  privacy: ActivityAiEnhancementDraftApplicationPrivacyContract;
  title: string;
};

type ValidatedDraftApplication = {
  content?: ActivityContent;
  meta?: ActivityDraftMeta;
  validationStatus: ActivityAiEnhancementDraftApplicationValidationStatus;
};

type ActivityAiEnhancementDraftApplicationSummary = {
  activityContentNormalization: string;
  answerKeyPublicGuard: string;
  applicationChainGate: string;
  applicationScope: string;
  blockedReason: string;
  createInputContract: string;
  draftContractValidation: string;
  draftCoverageSummary: string;
  draftOutputPresence: string;
  draftTextPrivacy: string;
  editorOnlyTarget: string;
  executionPlanSource: string;
  executionStatus: string;
  fallbackApplication: string;
  fieldTargetCoverage: string;
  providerApplication: string;
  publicPayloadGuard: string;
  publishBoundary: string;
  questionChoiceRefresh: string;
  rawProviderOutputGuard: string;
  rawSourceTextGuard: string;
  resultExportContinuity: string;
  reviewChecklistRefresh: string;
  saveGate: string;
  snapshotProtection: string;
  sourceByteGuard: string;
  sourceProvenanceSummary: string;
  storageKeyGuard: string;
  teacherReviewGate: string;
  templateReadinessRefresh: string;
};

export function buildActivityAiEnhancementDraftApplicationView(
  source: ActivityAiEnhancementDraftApplicationSource
): ActivityAiEnhancementDraftApplicationView {
  const plan = buildActivityAiEnhancementDraftApplicationPlan(source);
  const summary = buildActivityAiEnhancementDraftApplicationSummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS.map(
    (id) =>
      buildActivityAiEnhancementDraftApplicationItemView(
        buildActivityAiEnhancementDraftApplicationItem({ id, summary })
      )
  );

  return {
    description:
      'Editor-only application contract for AI enhancement draft output after the execution plan but before teacher review, save, publish, snapshots, public payloads, or result exports.',
    itemViews,
    plan,
    privacy:
      buildActivityAiEnhancementDraftApplicationPrivacyContract(itemViews),
    title: 'Activity AI enhancement draft application',
  };
}

export function buildActivityAiEnhancementDraftApplicationPlan(
  source: ActivityAiEnhancementDraftApplicationSource
): ActivityAiEnhancementDraftApplicationPlan {
  const execution = buildActivityAiEnhancementExecutionPlan(source);
  const validatedDraft = validateActivityAiEnhancementDraftApplication(source);

  if (!execution.canExecute) {
    return buildActivityAiEnhancementDraftApplicationPlanFromValidation({
      execution,
      status: 'blocked-before-draft',
      validation: {
        validationStatus: 'blocked',
      },
    });
  }

  if (!source.proposedDraft) {
    return buildActivityAiEnhancementDraftApplicationPlanFromValidation({
      execution,
      status: 'awaiting-draft-output',
      validation: {
        validationStatus: 'missing',
      },
    });
  }

  if (validatedDraft.validationStatus !== 'valid') {
    return buildActivityAiEnhancementDraftApplicationPlanFromValidation({
      execution,
      status: 'invalid-draft',
      validation: validatedDraft,
    });
  }

  return buildActivityAiEnhancementDraftApplicationPlanFromValidation({
    execution,
    status: 'ready-for-editor-review',
    validation: validatedDraft,
  });
}

function validateActivityAiEnhancementDraftApplication({
  proposedDraft,
}: ActivityAiEnhancementDraftApplicationSource): ValidatedDraftApplication {
  if (!proposedDraft) {
    return {
      validationStatus: 'missing',
    };
  }

  const parsedDraft = createActivityInputSchema.safeParse(proposedDraft);

  if (!parsedDraft.success) {
    return {
      validationStatus: 'invalid',
    };
  }

  try {
    return {
      content: buildActivityContent(parsedDraft.data),
      meta: buildActivityDraftMeta({
        activity: parsedDraft.data,
        currentTemplateType: parsedDraft.data.templateType,
      }),
      validationStatus: 'valid',
    };
  } catch {
    return {
      content: parseActivityContent(parsedDraft.data),
      validationStatus: 'invalid',
    };
  }
}

function buildActivityAiEnhancementDraftApplicationPlanFromValidation({
  execution,
  status,
  validation,
}: {
  execution: ActivityAiEnhancementExecutionPlan;
  status: ActivityAiEnhancementDraftApplicationStatus;
  validation: ValidatedDraftApplication;
}): ActivityAiEnhancementDraftApplicationPlan {
  const contentCoverage = buildActivityAiEnhancementDraftContentCoverage(
    validation.content
  );
  const reviewChecklistItems = validation.meta?.reviewChecklistItems ?? [];
  const readyTemplateCount = validation.meta?.readyTemplateCount ?? 0;
  const lockedTemplateCount =
    validation.meta?.templateReadiness.filter((option) => !option.isReady)
      .length ?? 0;
  const questionChoiceReadiness = validation.meta?.questionChoiceReadiness;
  const coveredFieldTargetCount =
    validation.content && validation.meta
      ? countCoveredActivityAiEnhancementFieldTargets({
          content: validation.content,
          fields: execution.fieldTargets,
          meta: validation.meta,
        })
      : 0;

  return {
    actionNeededCount: reviewChecklistItems.filter(
      (item) => item.status === 'action-needed'
    ).length,
    applicationStatus: status,
    canApplyToEditor: status === 'ready-for-editor-review',
    contentCoverage,
    coveredFieldTargetCount,
    draftTarget: 'editor-only',
    execution,
    fieldTargetCount: execution.fieldTargets.length,
    lockedTemplateCount,
    questionChoiceNeedsCandidateCount:
      questionChoiceReadiness?.needsCandidateCount ?? 0,
    questionChoiceReadyCount: questionChoiceReadiness?.readyCount ?? 0,
    readyTemplateCount,
    reviewChecklistCount: reviewChecklistItems.length,
    validationStatus: validation.validationStatus,
  };
}

function buildActivityAiEnhancementDraftContentCoverage(
  content?: ActivityContent
): ActivityAiEnhancementDraftContentCoverage {
  return {
    groups: content?.groups.length ?? 0,
    pairs: content?.pairs.length ?? 0,
    questions: content?.questions.length ?? 0,
    sourceMaterials: content?.sourceMaterials.length ?? 0,
    teacherNotes: content?.teacherNotes.length ?? 0,
    vocabulary: content?.vocabulary.length ?? 0,
  };
}

function countCoveredActivityAiEnhancementFieldTargets({
  content,
  fields,
  meta,
}: {
  content: ActivityContent;
  fields: readonly ActivityAiEnhancementPolicyTargetField[];
  meta: ActivityDraftMeta;
}) {
  return fields.filter((field) =>
    doesActivityAiEnhancementDraftCoverField({ content, field, meta })
  ).length;
}

function doesActivityAiEnhancementDraftCoverField({
  content,
  field,
  meta,
}: {
  content: ActivityContent;
  field: ActivityAiEnhancementPolicyTargetField;
  meta: ActivityDraftMeta;
}) {
  switch (field) {
    case 'acceptedAnswers':
      return content.questions.some((question) => question.answer.trim());
    case 'answerExplanations':
      return content.questions.some((question) => question.explanation);
    case 'groups':
      return content.groups.length > 0;
    case 'learningGoal':
      return Boolean(content.learningGoal.trim());
    case 'pairs':
      return content.pairs.length > 0;
    case 'questionOptions':
      return meta.questionChoiceReadiness.needsCandidateCount === 0;
    case 'questions':
      return content.questions.length > 0;
    case 'sourceMaterials':
      return content.sourceMaterials.length > 0;
    case 'sourceSummary':
      return Boolean(content.sourceSummary.trim());
    case 'teacherNotes':
      return content.teacherNotes.length > 0;
    case 'templateType':
      return true;
    case 'vocabulary':
      return content.vocabulary.length > 0;
  }
}

function buildActivityAiEnhancementDraftApplicationSummary(
  plan: ActivityAiEnhancementDraftApplicationPlan
): ActivityAiEnhancementDraftApplicationSummary {
  return {
    activityContentNormalization:
      plan.validationStatus === 'valid'
        ? 'ActivityContent normalized'
        : 'Not normalized',
    answerKeyPublicGuard: 'No public answer keys',
    applicationChainGate: '30 application slices',
    applicationScope: 'Editor draft application',
    blockedReason: plan.execution.blockedReason ?? 'None',
    createInputContract:
      plan.validationStatus === 'valid'
        ? 'CreateActivityInput valid'
        : 'CreateActivityInput required',
    draftContractValidation: plan.validationStatus,
    draftCoverageSummary:
      `${plan.contentCoverage.questions} questions / ` +
      `${plan.contentCoverage.pairs} pairs / ` +
      `${plan.contentCoverage.groups} groups / ` +
      `${plan.contentCoverage.vocabulary} vocabulary / ` +
      `${plan.contentCoverage.teacherNotes} notes`,
    draftOutputPresence:
      plan.validationStatus === 'missing'
        ? 'Awaiting draft output'
        : 'Draft output supplied',
    draftTextPrivacy: 'Draft text hidden',
    editorOnlyTarget: plan.draftTarget,
    executionPlanSource: plan.execution.status,
    executionStatus: plan.applicationStatus,
    fallbackApplication: plan.execution.usesLocalFallback
      ? 'Fallback draft selected'
      : 'Fallback draft optional',
    fieldTargetCoverage: `${plan.coveredFieldTargetCount}/${plan.fieldTargetCount} targets`,
    providerApplication: plan.execution.usesExternalProvider
      ? 'Provider draft selected'
      : 'No provider draft',
    publicPayloadGuard: 'Sanitized runtime only',
    publishBoundary: 'No assignment link',
    questionChoiceRefresh:
      `${plan.questionChoiceReadyCount} ready / ` +
      `${plan.questionChoiceNeedsCandidateCount} needs candidates`,
    rawProviderOutputGuard: 'Parsed draft only',
    rawSourceTextGuard: 'Source text hidden',
    resultExportContinuity: 'Shared result model',
    reviewChecklistRefresh:
      `${plan.reviewChecklistCount} checks / ` +
      `${plan.actionNeededCount} action needed`,
    saveGate: 'Teacher save required',
    snapshotProtection: 'Frozen snapshots protected',
    sourceByteGuard: 'No file bytes',
    sourceProvenanceSummary:
      `${plan.execution.policy.sourceMaterialCount} references / ` +
      `${plan.execution.policy.sourceMaterialKindCount} kinds`,
    storageKeyGuard: 'Storage hidden',
    teacherReviewGate: 'Teacher review required',
    templateReadinessRefresh: `${plan.readyTemplateCount} ready / ${plan.lockedTemplateCount} locked`,
  };
}

function buildActivityAiEnhancementDraftApplicationItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementDraftApplicationItemId;
  summary: ActivityAiEnhancementDraftApplicationSummary;
}): Omit<ActivityAiEnhancementDraftApplicationItemView, 'ariaLabel'> {
  switch (id) {
    case 'application-scope':
      return item(
        id,
        'Application scope',
        summary.applicationScope,
        'Draft application starts after execution planning and before any product mutation.'
      );
    case 'execution-plan-source':
      return item(
        id,
        'Execution plan source',
        summary.executionPlanSource,
        'The draft application contract is derived from the shared execution plan.'
      );
    case 'execution-status':
      return item(
        id,
        'Execution status',
        summary.executionStatus,
        'Application can be blocked, waiting for output, invalid, or ready for review.'
      );
    case 'blocked-reason':
      return item(
        id,
        'Blocked reason',
        summary.blockedReason,
        'Blocked execution plans keep a structured reason before draft handling.'
      );
    case 'draft-output-presence':
      return item(
        id,
        'Draft output presence',
        summary.draftOutputPresence,
        'The application layer records whether a parsed draft is available.'
      );
    case 'draft-contract-validation':
      return item(
        id,
        'Draft contract validation',
        summary.draftContractValidation,
        'Draft output must validate before filling editor fields.'
      );
    case 'editor-only-target':
      return item(
        id,
        'Editor-only target',
        summary.editorOnlyTarget,
        'Validated drafts fill the activity editor only.'
      );
    case 'field-target-coverage':
      return item(
        id,
        'Field target coverage',
        summary.fieldTargetCoverage,
        'The contract checks whether proposed draft content covers planned structured targets.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        summary.createInputContract,
        'Application output stays on the same validated activity input contract as manual creation.'
      );
    case 'activity-content-normalization':
      return item(
        id,
        'Activity content normalization',
        summary.activityContentNormalization,
        'Valid drafts normalize into ActivityContent before review metadata is refreshed.'
      );
    case 'template-readiness-refresh':
      return item(
        id,
        'Template readiness refresh',
        summary.templateReadinessRefresh,
        'Applying a draft refreshes deterministic ready and locked template diagnostics.'
      );
    case 'draft-coverage-summary':
      return item(
        id,
        'Draft coverage summary',
        summary.draftCoverageSummary,
        'The contract exposes counts for classroom content fields without exposing text.'
      );
    case 'review-checklist-refresh':
      return item(
        id,
        'Review checklist refresh',
        summary.reviewChecklistRefresh,
        'Draft metadata refreshes teacher review checks before save.'
      );
    case 'question-choice-refresh':
      return item(
        id,
        'Question choice refresh',
        summary.questionChoiceRefresh,
        'Quiz choice readiness is recalculated from the applied draft.'
      );
    case 'source-provenance-summary':
      return item(
        id,
        'Source provenance summary',
        summary.sourceProvenanceSummary,
        'Only compact source-material counts and kind coverage move through application views.'
      );
    case 'raw-provider-output-guard':
      return item(
        id,
        'Raw provider output guard',
        summary.rawProviderOutputGuard,
        'Raw provider output stays outside draft application handoffs.'
      );
    case 'raw-source-text-guard':
      return item(
        id,
        'Raw source text guard',
        summary.rawSourceTextGuard,
        'Raw teacher source notes are not exposed by the application contract.'
      );
    case 'source-byte-guard':
      return item(
        id,
        'Source byte guard',
        summary.sourceByteGuard,
        'Uploaded file bytes remain outside draft application.'
      );
    case 'storage-key-guard':
      return item(
        id,
        'Storage key guard',
        summary.storageKeyGuard,
        'Storage keys, file ids, URLs, query tokens, and permission metadata stay hidden.'
      );
    case 'answer-key-public-guard':
      return item(
        id,
        'Answer key public guard',
        summary.answerKeyPublicGuard,
        'Answer data remains editor review material and is not sent to public payloads here.'
      );
    case 'draft-text-privacy':
      return item(
        id,
        'Draft text privacy',
        summary.draftTextPrivacy,
        'The application handoff exposes counts and statuses instead of draft text.'
      );
    case 'teacher-review-gate':
      return item(
        id,
        'Teacher review gate',
        summary.teacherReviewGate,
        'Teachers must inspect applied draft fields before save.'
      );
    case 'save-gate':
      return item(
        id,
        'Save gate',
        summary.saveGate,
        'Draft application never persists an activity without teacher action.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        summary.publishBoundary,
        'Draft application cannot create assignment links.'
      );
    case 'snapshot-protection':
      return item(
        id,
        'Snapshot protection',
        summary.snapshotProtection,
        'Existing published assignment snapshots remain unchanged.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        summary.publicPayloadGuard,
        'Student runtime payloads stay sanitized and separate from draft application.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        summary.resultExportContinuity,
        'Activities saved after review continue through shared attempt and result exports.'
      );
    case 'fallback-application':
      return item(
        id,
        'Fallback application',
        summary.fallbackApplication,
        'Local fallback drafts apply through the same editor-only contract.'
      );
    case 'provider-application':
      return item(
        id,
        'Provider application',
        summary.providerApplication,
        'Provider drafts are accepted only as parsed editor drafts.'
      );
    case 'application-chain-gate':
      return item(
        id,
        'Application chain gate',
        summary.applicationChainGate,
        'A focused gate keeps draft application aligned with execution, metadata, and privacy boundaries.'
      );
  }
}

function buildActivityAiEnhancementDraftApplicationItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementDraftApplicationItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementDraftApplicationPrivacyContract(
  itemViews: ActivityAiEnhancementDraftApplicationItemView[]
): ActivityAiEnhancementDraftApplicationPrivacyContract {
  return {
    appliesAfterExecutionPlan: true,
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
    fillsEditorOnly: true,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesExistingAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-draft-application',
    usesDraftMeta: true,
    usesExecutionPlan: true,
    usesTemplateReadinessDomain: true,
  };
}

function item(
  id: ActivityAiEnhancementDraftApplicationItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementDraftApplicationItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
