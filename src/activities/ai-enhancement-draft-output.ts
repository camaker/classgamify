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

export const ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS = [
  'output-scope',
  'execution-plan-source',
  'execution-status',
  'output-source',
  'output-status',
  'blocked-reason',
  'parser-boundary',
  'schema-validation',
  'normalized-draft',
  'create-input-contract',
  'activity-content-target',
  'field-target-count',
  'field-target-coverage',
  'question-output-count',
  'pair-output-count',
  'group-output-count',
  'vocabulary-output-count',
  'teacher-note-output-count',
  'template-readiness-preview',
  'question-choice-preview',
  'review-checklist-preview',
  'fallback-output-path',
  'provider-output-path',
  'deterministic-output-path',
  'raw-output-guard',
  'raw-source-text-guard',
  'source-material-guard',
  'editor-application-boundary',
  'save-publish-boundary',
  'snapshot-result-continuity',
] as const;

export type ActivityAiEnhancementDraftOutputItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS)[number];

export type ActivityAiEnhancementDraftOutputSourceMode =
  | 'deterministic-draft'
  | 'local-fallback'
  | 'provider'
  | 'unavailable';

export type ActivityAiEnhancementDraftOutputStatus =
  | 'awaiting-output'
  | 'blocked-before-output'
  | 'normalized-draft-ready'
  | 'rejected-output';

export type ActivityAiEnhancementDraftOutputValidationStatus =
  | 'blocked'
  | 'invalid-content'
  | 'invalid-schema'
  | 'missing'
  | 'valid';

export type ActivityAiEnhancementDraftOutputSource =
  ActivityAiEnhancementExecutionSource & {
    outputSource?: ActivityAiEnhancementDraftOutputSourceMode;
    parsedDraft?: CreateActivityInput | null;
  };

export type ActivityAiEnhancementDraftOutputPlan = {
  canPassToEditorApplication: boolean;
  contentCoverage: ActivityAiEnhancementDraftOutputContentCoverage;
  coveredFieldTargetCount: number;
  draftTarget: 'CreateActivityInput';
  execution: ActivityAiEnhancementExecutionPlan;
  fieldTargetCount: number;
  lockedTemplateCount: number;
  outputSource: ActivityAiEnhancementDraftOutputSourceMode;
  questionChoiceNeedsCandidateCount: number;
  questionChoiceReadyCount: number;
  readyTemplateCount: number;
  reviewChecklistCount: number;
  status: ActivityAiEnhancementDraftOutputStatus;
  targetModel: 'CreateActivityInput';
  usesDeterministicOutput: boolean;
  usesLocalFallbackOutput: boolean;
  usesProviderOutput: boolean;
  validationStatus: ActivityAiEnhancementDraftOutputValidationStatus;
};

export type ActivityAiEnhancementDraftOutputContentCoverage = {
  groups: number;
  pairs: number;
  questions: number;
  sourceMaterials: number;
  teacherNotes: number;
  vocabulary: number;
};

export type ActivityAiEnhancementDraftOutputItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementDraftOutputItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementDraftOutputPrivacyContract = {
  appliesAfterExecutionPlan: true;
  appliesBeforeEditorApplication: true;
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
  itemIds: ActivityAiEnhancementDraftOutputItemId[];
  mutatesExistingAssignmentSnapshots: false;
  normalizesCreateActivityInput: true;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresEditorReview: true;
  scope: 'activity-ai-enhancement-draft-output';
  usesDraftMeta: true;
  usesExecutionPlan: true;
};

export type ActivityAiEnhancementDraftOutputView = {
  description: string;
  itemViews: ActivityAiEnhancementDraftOutputItemView[];
  plan: ActivityAiEnhancementDraftOutputPlan;
  privacy: ActivityAiEnhancementDraftOutputPrivacyContract;
  title: string;
};

type ValidatedDraftOutput = {
  content?: ActivityContent;
  meta?: ActivityDraftMeta;
  validationStatus: ActivityAiEnhancementDraftOutputValidationStatus;
};

type ActivityAiEnhancementDraftOutputSummary = {
  activityContentTarget: string;
  blockedReason: string;
  createInputContract: string;
  deterministicOutputPath: string;
  editorApplicationBoundary: string;
  executionPlanSource: string;
  executionStatus: string;
  fallbackOutputPath: string;
  fieldTargetCount: string;
  fieldTargetCoverage: string;
  groupOutputCount: string;
  normalizedDraft: string;
  outputScope: string;
  outputSource: string;
  outputStatus: string;
  pairOutputCount: string;
  parserBoundary: string;
  providerOutputPath: string;
  questionChoicePreview: string;
  questionOutputCount: string;
  rawOutputGuard: string;
  rawSourceTextGuard: string;
  reviewChecklistPreview: string;
  savePublishBoundary: string;
  schemaValidation: string;
  snapshotResultContinuity: string;
  sourceMaterialGuard: string;
  teacherNoteOutputCount: string;
  templateReadinessPreview: string;
  vocabularyOutputCount: string;
};

export function buildActivityAiEnhancementDraftOutputView(
  source: ActivityAiEnhancementDraftOutputSource
): ActivityAiEnhancementDraftOutputView {
  const plan = buildActivityAiEnhancementDraftOutputPlan(source);
  const summary = buildActivityAiEnhancementDraftOutputSummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS.map((id) =>
    buildActivityAiEnhancementDraftOutputItemView(
      buildActivityAiEnhancementDraftOutputItem({ id, summary })
    )
  );

  return {
    description:
      'Parsed draft output boundary for AI enhancement execution before editor-only application, teacher review, save, publish, snapshots, public payloads, or result exports.',
    itemViews,
    plan,
    privacy: buildActivityAiEnhancementDraftOutputPrivacyContract(itemViews),
    title: 'Activity AI enhancement draft output',
  };
}

export function buildActivityAiEnhancementDraftOutputPlan(
  source: ActivityAiEnhancementDraftOutputSource
): ActivityAiEnhancementDraftOutputPlan {
  const execution = buildActivityAiEnhancementExecutionPlan(source);
  const outputSource = resolveActivityAiEnhancementDraftOutputSource({
    execution,
    outputSource: source.outputSource,
  });

  if (!execution.canExecute) {
    return buildActivityAiEnhancementDraftOutputPlanFromValidation({
      execution,
      outputSource,
      status: 'blocked-before-output',
      validation: {
        validationStatus: 'blocked',
      },
    });
  }

  if (!source.parsedDraft) {
    return buildActivityAiEnhancementDraftOutputPlanFromValidation({
      execution,
      outputSource,
      status: 'awaiting-output',
      validation: {
        validationStatus: 'missing',
      },
    });
  }

  const validation = validateActivityAiEnhancementDraftOutput(
    source.parsedDraft
  );

  if (validation.validationStatus !== 'valid') {
    return buildActivityAiEnhancementDraftOutputPlanFromValidation({
      execution,
      outputSource,
      status: 'rejected-output',
      validation,
    });
  }

  return buildActivityAiEnhancementDraftOutputPlanFromValidation({
    execution,
    outputSource,
    status: 'normalized-draft-ready',
    validation,
  });
}

function resolveActivityAiEnhancementDraftOutputSource({
  execution,
  outputSource,
}: {
  execution: ActivityAiEnhancementExecutionPlan;
  outputSource?: ActivityAiEnhancementDraftOutputSourceMode;
}): ActivityAiEnhancementDraftOutputSourceMode {
  if (outputSource) return outputSource;
  if (execution.usesExternalProvider) return 'provider';
  if (execution.usesLocalFallback) return 'local-fallback';
  if (execution.usesDeterministicDraft) return 'deterministic-draft';
  return 'unavailable';
}

function validateActivityAiEnhancementDraftOutput(
  parsedDraft: CreateActivityInput
): ValidatedDraftOutput {
  const validation = createActivityInputSchema.safeParse(parsedDraft);

  if (!validation.success) {
    return {
      validationStatus: 'invalid-schema',
    };
  }

  try {
    return {
      content: buildActivityContent(validation.data),
      meta: buildActivityDraftMeta({
        activity: validation.data,
        currentTemplateType: validation.data.templateType,
      }),
      validationStatus: 'valid',
    };
  } catch {
    return {
      content: parseActivityContent(validation.data),
      validationStatus: 'invalid-content',
    };
  }
}

function buildActivityAiEnhancementDraftOutputPlanFromValidation({
  execution,
  outputSource,
  status,
  validation,
}: {
  execution: ActivityAiEnhancementExecutionPlan;
  outputSource: ActivityAiEnhancementDraftOutputSourceMode;
  status: ActivityAiEnhancementDraftOutputStatus;
  validation: ValidatedDraftOutput;
}): ActivityAiEnhancementDraftOutputPlan {
  const contentCoverage = buildActivityAiEnhancementDraftOutputCoverage(
    validation.content
  );
  const meta = validation.meta;
  const coveredFieldTargetCount =
    validation.content && meta
      ? countCoveredActivityAiEnhancementDraftOutputTargets({
          content: validation.content,
          fields: execution.fieldTargets,
          meta,
        })
      : 0;

  return {
    canPassToEditorApplication: status === 'normalized-draft-ready',
    contentCoverage,
    coveredFieldTargetCount,
    draftTarget: 'CreateActivityInput',
    execution,
    fieldTargetCount: execution.fieldTargets.length,
    lockedTemplateCount:
      meta?.templateReadiness.filter((option) => !option.isReady).length ?? 0,
    outputSource,
    questionChoiceNeedsCandidateCount:
      meta?.questionChoiceReadiness.needsCandidateCount ?? 0,
    questionChoiceReadyCount: meta?.questionChoiceReadiness.readyCount ?? 0,
    readyTemplateCount: meta?.readyTemplateCount ?? 0,
    reviewChecklistCount: meta?.reviewChecklistItems.length ?? 0,
    status,
    targetModel: 'CreateActivityInput',
    usesDeterministicOutput: outputSource === 'deterministic-draft',
    usesLocalFallbackOutput: outputSource === 'local-fallback',
    usesProviderOutput: outputSource === 'provider',
    validationStatus: validation.validationStatus,
  };
}

function buildActivityAiEnhancementDraftOutputCoverage(
  content?: ActivityContent
): ActivityAiEnhancementDraftOutputContentCoverage {
  return {
    groups: content?.groups.length ?? 0,
    pairs: content?.pairs.length ?? 0,
    questions: content?.questions.length ?? 0,
    sourceMaterials: content?.sourceMaterials.length ?? 0,
    teacherNotes: content?.teacherNotes.length ?? 0,
    vocabulary: content?.vocabulary.length ?? 0,
  };
}

function countCoveredActivityAiEnhancementDraftOutputTargets({
  content,
  fields,
  meta,
}: {
  content: ActivityContent;
  fields: readonly ActivityAiEnhancementPolicyTargetField[];
  meta: ActivityDraftMeta;
}) {
  return fields.filter((field) =>
    doesActivityAiEnhancementDraftOutputCoverField({ content, field, meta })
  ).length;
}

function doesActivityAiEnhancementDraftOutputCoverField({
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

function buildActivityAiEnhancementDraftOutputSummary(
  plan: ActivityAiEnhancementDraftOutputPlan
): ActivityAiEnhancementDraftOutputSummary {
  return {
    activityContentTarget:
      plan.validationStatus === 'valid'
        ? 'ActivityContent preview'
        : 'ActivityContent blocked',
    blockedReason: plan.execution.blockedReason ?? 'None',
    createInputContract:
      plan.validationStatus === 'valid'
        ? 'CreateActivityInput valid'
        : 'CreateActivityInput required',
    deterministicOutputPath: plan.usesDeterministicOutput
      ? 'Deterministic draft selected'
      : 'Deterministic draft optional',
    editorApplicationBoundary: 'Editor application next',
    executionPlanSource: plan.execution.status,
    executionStatus: plan.status,
    fallbackOutputPath: plan.usesLocalFallbackOutput
      ? 'Fallback output selected'
      : 'Fallback output optional',
    fieldTargetCount: `${plan.fieldTargetCount} targets`,
    fieldTargetCoverage: `${plan.coveredFieldTargetCount}/${plan.fieldTargetCount} targets`,
    groupOutputCount: String(plan.contentCoverage.groups),
    normalizedDraft: plan.canPassToEditorApplication
      ? 'Normalized draft ready'
      : 'No normalized draft',
    outputScope: 'Parsed draft output',
    outputSource: plan.outputSource,
    outputStatus: plan.validationStatus,
    pairOutputCount: String(plan.contentCoverage.pairs),
    parserBoundary: 'Structured parse only',
    providerOutputPath: plan.usesProviderOutput
      ? 'Provider output selected'
      : 'No provider output',
    questionChoicePreview:
      `${plan.questionChoiceReadyCount} ready / ` +
      `${plan.questionChoiceNeedsCandidateCount} needs candidates`,
    questionOutputCount: String(plan.contentCoverage.questions),
    rawOutputGuard: 'Raw output hidden',
    rawSourceTextGuard: 'Source text hidden',
    reviewChecklistPreview: `${plan.reviewChecklistCount} checks`,
    savePublishBoundary: 'No save or publish',
    schemaValidation: plan.validationStatus,
    snapshotResultContinuity: 'Snapshots protected / results shared',
    sourceMaterialGuard: `${plan.contentCoverage.sourceMaterials} references / storage hidden`,
    teacherNoteOutputCount: String(plan.contentCoverage.teacherNotes),
    templateReadinessPreview: `${plan.readyTemplateCount} ready / ${plan.lockedTemplateCount} locked`,
    vocabularyOutputCount: String(plan.contentCoverage.vocabulary),
  };
}

function buildActivityAiEnhancementDraftOutputItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementDraftOutputItemId;
  summary: ActivityAiEnhancementDraftOutputSummary;
}): Omit<ActivityAiEnhancementDraftOutputItemView, 'ariaLabel'> {
  switch (id) {
    case 'output-scope':
      return item(
        id,
        'Output scope',
        summary.outputScope,
        'The output boundary starts after execution and before editor application.'
      );
    case 'execution-plan-source':
      return item(
        id,
        'Execution plan source',
        summary.executionPlanSource,
        'Output normalization follows the shared execution plan status.'
      );
    case 'execution-status':
      return item(
        id,
        'Execution status',
        summary.executionStatus,
        'Output handling can be blocked, waiting, rejected, or normalized.'
      );
    case 'output-source':
      return item(
        id,
        'Output source',
        summary.outputSource,
        'The boundary records provider, fallback, deterministic, or unavailable source mode.'
      );
    case 'output-status':
      return item(
        id,
        'Output status',
        summary.outputStatus,
        'The parsed output status stays structured for UI and server consumers.'
      );
    case 'blocked-reason':
      return item(
        id,
        'Blocked reason',
        summary.blockedReason,
        'Blocked execution plans never reach parsed draft output.'
      );
    case 'parser-boundary':
      return item(
        id,
        'Parser boundary',
        summary.parserBoundary,
        'Provider or fallback output must be parsed before app surfaces receive it.'
      );
    case 'schema-validation':
      return item(
        id,
        'Schema validation',
        summary.schemaValidation,
        'Parsed drafts must validate against the shared input schema.'
      );
    case 'normalized-draft':
      return item(
        id,
        'Normalized draft',
        summary.normalizedDraft,
        'Only normalized drafts can move to editor application.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        summary.createInputContract,
        'Draft output remains compatible with manual activity creation and editing.'
      );
    case 'activity-content-target':
      return item(
        id,
        'Activity content target',
        summary.activityContentTarget,
        'Valid drafts preview ActivityContent without persisting records.'
      );
    case 'field-target-count':
      return item(
        id,
        'Field target count',
        summary.fieldTargetCount,
        'The output keeps planned structured target count visible.'
      );
    case 'field-target-coverage':
      return item(
        id,
        'Field target coverage',
        summary.fieldTargetCoverage,
        'Normalized output coverage is counted without exposing generated text.'
      );
    case 'question-output-count':
      return item(
        id,
        'Question output count',
        summary.questionOutputCount,
        'Question output is summarized as a count only.'
      );
    case 'pair-output-count':
      return item(
        id,
        'Pair output count',
        summary.pairOutputCount,
        'Pair output is summarized as a count only.'
      );
    case 'group-output-count':
      return item(
        id,
        'Group output count',
        summary.groupOutputCount,
        'Group output is summarized as a count only.'
      );
    case 'vocabulary-output-count':
      return item(
        id,
        'Vocabulary output count',
        summary.vocabularyOutputCount,
        'Vocabulary output is summarized as a count only.'
      );
    case 'teacher-note-output-count':
      return item(
        id,
        'Teacher note output count',
        summary.teacherNoteOutputCount,
        'Teacher-note output is summarized as a count only.'
      );
    case 'template-readiness-preview':
      return item(
        id,
        'Template readiness preview',
        summary.templateReadinessPreview,
        'Draft output refreshes ready and locked template counts before application.'
      );
    case 'question-choice-preview':
      return item(
        id,
        'Question choice preview',
        summary.questionChoicePreview,
        'Draft output refreshes quiz choice readiness counts.'
      );
    case 'review-checklist-preview':
      return item(
        id,
        'Review checklist preview',
        summary.reviewChecklistPreview,
        'Draft output refreshes review checklist count before teacher review.'
      );
    case 'fallback-output-path':
      return item(
        id,
        'Fallback output path',
        summary.fallbackOutputPath,
        'Local fallback output uses the same parser and validation path.'
      );
    case 'provider-output-path':
      return item(
        id,
        'Provider output path',
        summary.providerOutputPath,
        'Provider output is accepted only after parsing and validation.'
      );
    case 'deterministic-output-path':
      return item(
        id,
        'Deterministic output path',
        summary.deterministicOutputPath,
        'Deterministic drafts skip provider work but keep the same output boundary.'
      );
    case 'raw-output-guard':
      return item(
        id,
        'Raw output guard',
        summary.rawOutputGuard,
        'Raw provider or fallback text stays out of output views.'
      );
    case 'raw-source-text-guard':
      return item(
        id,
        'Raw source text guard',
        summary.rawSourceTextGuard,
        'Teacher source notes remain outside the output summary.'
      );
    case 'source-material-guard':
      return item(
        id,
        'Source material guard',
        summary.sourceMaterialGuard,
        'Source materials are summarized as references while identifiers and storage stay hidden.'
      );
    case 'editor-application-boundary':
      return item(
        id,
        'Editor application boundary',
        summary.editorApplicationBoundary,
        'Normalized output can only proceed to editor-only draft application.'
      );
    case 'save-publish-boundary':
      return item(
        id,
        'Save publish boundary',
        summary.savePublishBoundary,
        'Output normalization never saves activities or publishes assignments.'
      );
    case 'snapshot-result-continuity':
      return item(
        id,
        'Snapshot result continuity',
        summary.snapshotResultContinuity,
        'Existing snapshots stay protected while reviewed drafts can still use shared results later.'
      );
  }
}

function buildActivityAiEnhancementDraftOutputItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementDraftOutputItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementDraftOutputPrivacyContract(
  itemViews: ActivityAiEnhancementDraftOutputItemView[]
): ActivityAiEnhancementDraftOutputPrivacyContract {
  return {
    appliesAfterExecutionPlan: true,
    appliesBeforeEditorApplication: true,
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
    normalizesCreateActivityInput: true,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-draft-output',
    usesDraftMeta: true,
    usesExecutionPlan: true,
  };
}

function item(
  id: ActivityAiEnhancementDraftOutputItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementDraftOutputItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
