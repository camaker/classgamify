import { getTemplateByType } from '@/activities/catalog';
import { buildQuestionChoiceReadinessSummary } from '@/activities/distractors';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import {
  formatTemplateRequirementList,
  getTemplateRemixPlan,
  type TemplateRemixOption,
} from '@/activities/template-remix';
import type {
  ActivityContent,
  ActivityTemplateContentRequirement,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import type { UserFileMaterialKind } from '@/storage/file-materials';

export const ACTIVITY_AI_ENHANCEMENT_KINDS = [
  'source-to-activity-draft',
  'template-transform',
  'ai-remix-completion',
  'distractor-generation',
  'leveled-variant',
  'answer-explanation',
  'listening-script',
  'worksheet-extraction',
  'audio-extraction',
  'spreadsheet-import',
] as const;

export const ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS = [
  'enhancement-kind',
  'teacher-auth-gate',
  'request-source',
  'source-activity-state',
  'target-template',
  'deterministic-readiness',
  'missing-requirements',
  'ai-completion-scope',
  'draft-output',
  'create-input-contract',
  'activity-content-target',
  'question-target',
  'pair-target',
  'group-target',
  'vocabulary-target',
  'question-option-target',
  'answer-explanation-target',
  'listening-script-target',
  'worksheet-extraction-target',
  'source-material-capability',
  'source-material-provenance',
  'source-byte-guard',
  'storage-key-guard',
  'raw-provider-output-guard',
  'editor-review-gate',
  'save-gate',
  'publish-boundary',
  'assignment-snapshot-protection',
  'public-payload-guard',
  'result-export-continuity',
] as const;

export type ActivityAiEnhancementKind =
  (typeof ACTIVITY_AI_ENHANCEMENT_KINDS)[number];

export type ActivityAiEnhancementPolicyItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS)[number];

export type ActivityAiEnhancementPolicyStatus =
  | 'deterministic-draft-available'
  | 'needs-source-material'
  | 'needs-structured-content'
  | 'ready-for-editor-draft'
  | 'restore-source-first';

export type ActivityAiEnhancementPolicyTargetField =
  | 'acceptedAnswers'
  | 'answerExplanations'
  | 'groups'
  | 'learningGoal'
  | 'pairs'
  | 'questionOptions'
  | 'questions'
  | 'sourceMaterials'
  | 'sourceSummary'
  | 'teacherNotes'
  | 'templateType'
  | 'vocabulary';

export type ActivityAiEnhancementPolicyItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementPolicyItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementPolicyPrivacyContract = {
  appliesBeforeActivitySave: true;
  createsAssignmentLinksWithoutTeacherAction: false;
  exposesActivityContentText: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesFileBytesToAi: false;
  exposesRawAiOutput: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivityAiEnhancementPolicyItemId[];
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresAuthenticatedTeacher: true;
  requiresCreateActivityInputContract: true;
  requiresEditorReview: true;
  scope: 'activity-ai-enhancement-policy';
  usesActivityContentModel: true;
  usesDeterministicReadinessFirst: true;
  writesDistractorsToQuestionOptions: true;
};

export type ActivityAiEnhancementPolicySource = {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
  enhancementKind?: ActivityAiEnhancementKind;
  providerConfigured?: boolean;
  requestSource?: 'editor' | 'library' | 'server-function';
  targetTemplateType?: ActivityTemplateType;
  visibility?: ActivityVisibility;
};

export type ActivityAiEnhancementPolicyDecision = {
  audioSourceCount: number;
  canCallExternalProvider: boolean;
  canEnterEditorDraftFlow: boolean;
  currentTemplateLabel: string;
  enhancementKind: ActivityAiEnhancementKind;
  fieldTargets: ActivityAiEnhancementPolicyTargetField[];
  lockedTemplateCount: number;
  missingRequirementLabels: string[];
  missingRequirements: ActivityTemplateContentRequirement[];
  providerPath: 'configured-provider' | 'local-fallback-or-disabled';
  questionChoiceNeedsCandidateCount: number;
  questionChoiceReadyCount: number;
  readyTemplateCount: number;
  requestSource: 'editor' | 'library' | 'server-function';
  sourceMaterialCount: number;
  sourceMaterialKindCount: number;
  spreadsheetSourceCount: number;
  status: ActivityAiEnhancementPolicyStatus;
  targetModel: 'ActivityContent' | 'CreateActivityInput';
  targetTemplateLabel: string;
  targetTemplateType?: ActivityTemplateType;
  visibility: ActivityVisibility;
  worksheetSourceCount: number;
};

export type ActivityAiEnhancementPolicyView = {
  decision: ActivityAiEnhancementPolicyDecision;
  description: string;
  itemViews: ActivityAiEnhancementPolicyItemView[];
  privacy: ActivityAiEnhancementPolicyPrivacyContract;
  title: string;
};

type ActivityAiEnhancementPolicySummary = {
  activityContentTarget: string;
  aiCompletionScope: string;
  answerExplanationTarget: string;
  assignmentSnapshotProtection: string;
  createInputContract: string;
  deterministicReadiness: string;
  draftOutput: string;
  editorReviewGate: string;
  enhancementKind: string;
  groupTarget: string;
  listeningScriptTarget: string;
  missingRequirements: string;
  pairTarget: string;
  publicPayloadGuard: string;
  publishBoundary: string;
  questionOptionTarget: string;
  questionTarget: string;
  rawProviderOutputGuard: string;
  requestSource: string;
  resultExportContinuity: string;
  saveGate: string;
  sourceActivityState: string;
  sourceByteGuard: string;
  sourceMaterialCapability: string;
  sourceMaterialProvenance: string;
  storageKeyGuard: string;
  targetTemplate: string;
  teacherAuthGate: string;
  vocabularyTarget: string;
  worksheetExtractionTarget: string;
};

export function buildActivityAiEnhancementPolicyView(
  source: ActivityAiEnhancementPolicySource
): ActivityAiEnhancementPolicyView {
  const decision = buildActivityAiEnhancementPolicyDecision(source);
  const summary = buildActivityAiEnhancementPolicySummary(decision);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS.map((id) =>
    buildActivityAiEnhancementPolicyItemView(
      buildActivityAiEnhancementPolicyItem({ id, summary })
    )
  );

  return {
    decision,
    description:
      'Shared request policy for future AI enhancements before they enter the teacher-reviewed editor draft flow.',
    itemViews,
    privacy: buildActivityAiEnhancementPolicyPrivacyContract(itemViews),
    title: 'Activity AI enhancement policy',
  };
}

export function buildActivityAiEnhancementPolicyDecision({
  content,
  currentTemplateType,
  enhancementKind,
  providerConfigured = false,
  requestSource = 'editor',
  targetTemplateType,
  visibility = 'draft',
}: ActivityAiEnhancementPolicySource): ActivityAiEnhancementPolicyDecision {
  const remixPlan = getTemplateRemixPlan({ content, currentTemplateType });
  const targetOption = selectActivityAiEnhancementTargetOption({
    currentTemplateType,
    options: remixPlan.options,
    targetTemplateType,
  });
  const selectedKind =
    enhancementKind ??
    selectActivityAiEnhancementKind({
      content,
      targetOption,
    });
  const sourceMaterialSummary =
    buildActivityAiEnhancementSourceMaterialSummary(content);
  const questionChoiceReadiness = buildQuestionChoiceReadinessSummary({
    content,
  });
  const fieldTargets = buildActivityAiEnhancementPolicyTargetFields({
    kind: selectedKind,
    missingRequirements: targetOption?.missingRequirements ?? [],
  });
  const status = getActivityAiEnhancementPolicyStatus({
    kind: selectedKind,
    sourceMaterialSummary,
    targetOption,
    visibility,
  });
  const providerPath = providerConfigured
    ? 'configured-provider'
    : 'local-fallback-or-disabled';

  return {
    audioSourceCount: sourceMaterialSummary.audioSourceCount,
    canCallExternalProvider:
      providerConfigured &&
      status !== 'restore-source-first' &&
      status !== 'needs-source-material',
    canEnterEditorDraftFlow:
      status === 'deterministic-draft-available' ||
      status === 'ready-for-editor-draft',
    currentTemplateLabel:
      getTemplateByType(currentTemplateType)?.shortName ?? currentTemplateType,
    enhancementKind: selectedKind,
    fieldTargets,
    lockedTemplateCount: remixPlan.options.filter((option) => !option.isReady)
      .length,
    missingRequirementLabels: targetOption?.missingRequirementLabels ?? [],
    missingRequirements: targetOption?.missingRequirements ?? [],
    providerPath,
    questionChoiceNeedsCandidateCount:
      questionChoiceReadiness.needsCandidateCount,
    questionChoiceReadyCount: questionChoiceReadiness.readyCount,
    readyTemplateCount: remixPlan.readyOptions.length,
    requestSource,
    sourceMaterialCount: sourceMaterialSummary.sourceMaterialCount,
    sourceMaterialKindCount: sourceMaterialSummary.sourceMaterialKindCount,
    spreadsheetSourceCount: sourceMaterialSummary.spreadsheetSourceCount,
    status,
    targetModel:
      selectedKind === 'source-to-activity-draft'
        ? 'CreateActivityInput'
        : 'ActivityContent',
    targetTemplateLabel:
      targetOption?.template.shortName ??
      getTemplateByType(targetTemplateType ?? currentTemplateType)?.shortName ??
      'No target',
    targetTemplateType: targetOption?.template.type ?? targetTemplateType,
    visibility,
    worksheetSourceCount: sourceMaterialSummary.worksheetSourceCount,
  };
}

export function buildActivityAiEnhancementPolicyTargetFields({
  kind,
  missingRequirements = [],
}: {
  kind: ActivityAiEnhancementKind;
  missingRequirements?: readonly ActivityTemplateContentRequirement[];
}): ActivityAiEnhancementPolicyTargetField[] {
  switch (kind) {
    case 'source-to-activity-draft':
      return [
        'learningGoal',
        'sourceSummary',
        'vocabulary',
        'questions',
        'pairs',
        'groups',
        'teacherNotes',
      ];
    case 'template-transform':
      return ['templateType', 'questions', 'pairs', 'groups'];
    case 'ai-remix-completion':
      return mapTemplateRequirementsToEnhancementFields(missingRequirements);
    case 'distractor-generation':
      return ['questionOptions'];
    case 'leveled-variant':
      return [
        'learningGoal',
        'vocabulary',
        'questions',
        'pairs',
        'groups',
        'teacherNotes',
      ];
    case 'answer-explanation':
      return ['answerExplanations', 'acceptedAnswers'];
    case 'listening-script':
      return ['questions', 'answerExplanations'];
    case 'worksheet-extraction':
      return ['questions', 'pairs', 'groups', 'sourceSummary'];
    case 'audio-extraction':
      return ['questions', 'answerExplanations'];
    case 'spreadsheet-import':
      return ['vocabulary', 'questions', 'pairs', 'groups'];
  }
}

function mapTemplateRequirementsToEnhancementFields(
  requirements: readonly ActivityTemplateContentRequirement[]
): ActivityAiEnhancementPolicyTargetField[] {
  const fields: ActivityAiEnhancementPolicyTargetField[] = [];

  for (const requirement of requirements) {
    switch (requirement) {
      case 'gradeBand':
      case 'learningGoal':
      case 'sourceSummary':
      case 'teacherNotes':
      case 'vocabulary':
        fields.push(requirement);
        break;
      case 'groups':
      case 'pairs':
      case 'questions':
        fields.push(requirement);
        break;
    }
  }

  return fields.length > 0 ? uniquePolicyFields(fields) : ['questions'];
}

function selectActivityAiEnhancementTargetOption({
  currentTemplateType,
  options,
  targetTemplateType,
}: {
  currentTemplateType: ActivityTemplateType;
  options: TemplateRemixOption[];
  targetTemplateType?: ActivityTemplateType;
}) {
  if (targetTemplateType) {
    return options.find(
      (option) => option.template.type === targetTemplateType
    );
  }

  return (
    options.find((option) => !option.isReady && !option.isCurrent) ??
    options.find((option) => option.isReady && !option.isCurrent) ??
    options.find((option) => option.template.type === currentTemplateType)
  );
}

function selectActivityAiEnhancementKind({
  content,
  targetOption,
}: {
  content: ActivityContent;
  targetOption?: TemplateRemixOption;
}): ActivityAiEnhancementKind {
  if (targetOption && !targetOption.isCurrent && !targetOption.isReady) {
    return 'ai-remix-completion';
  }

  if (targetOption && !targetOption.isCurrent && targetOption.isReady) {
    return 'template-transform';
  }

  const questionChoiceReadiness = buildQuestionChoiceReadinessSummary({
    content,
  });
  if (questionChoiceReadiness.needsCandidateCount > 0) {
    return 'distractor-generation';
  }

  const sourceMaterialSummary =
    buildActivityAiEnhancementSourceMaterialSummary(content);
  if (sourceMaterialSummary.worksheetSourceCount > 0) {
    return 'worksheet-extraction';
  }
  if (sourceMaterialSummary.audioSourceCount > 0) return 'audio-extraction';
  if (sourceMaterialSummary.spreadsheetSourceCount > 0) {
    return 'spreadsheet-import';
  }

  return 'answer-explanation';
}

function getActivityAiEnhancementPolicyStatus({
  kind,
  sourceMaterialSummary,
  targetOption,
  visibility,
}: {
  kind: ActivityAiEnhancementKind;
  sourceMaterialSummary: ReturnType<
    typeof buildActivityAiEnhancementSourceMaterialSummary
  >;
  targetOption?: TemplateRemixOption;
  visibility: ActivityVisibility;
}): ActivityAiEnhancementPolicyStatus {
  if (visibility === 'archived') return 'restore-source-first';

  if (
    kind === 'worksheet-extraction' &&
    sourceMaterialSummary.worksheetSourceCount === 0
  ) {
    return 'needs-source-material';
  }

  if (
    kind === 'audio-extraction' &&
    sourceMaterialSummary.audioSourceCount === 0
  ) {
    return 'needs-source-material';
  }

  if (
    kind === 'spreadsheet-import' &&
    sourceMaterialSummary.spreadsheetSourceCount === 0
  ) {
    return 'needs-source-material';
  }

  if (
    kind === 'ai-remix-completion' &&
    targetOption &&
    targetOption.missingRequirementCount === 0
  ) {
    return 'deterministic-draft-available';
  }

  if (
    kind === 'template-transform' &&
    targetOption &&
    targetOption.missingRequirementCount > 0
  ) {
    return 'needs-structured-content';
  }

  return 'ready-for-editor-draft';
}

function buildActivityAiEnhancementSourceMaterialSummary(
  content: ActivityContent
) {
  const sourceMaterials = normalizeActivityMaterialReferences(
    content.sourceMaterials
  );
  const counts = new Map<UserFileMaterialKind, number>();

  for (const material of sourceMaterials) {
    counts.set(material.kind, (counts.get(material.kind) ?? 0) + 1);
  }

  const worksheetSourceCount =
    (counts.get('worksheet-document') ?? 0) +
    (counts.get('worksheet-image') ?? 0);

  return {
    audioSourceCount: counts.get('audio') ?? 0,
    sourceMaterialCount: sourceMaterials.length,
    sourceMaterialKindCount: counts.size,
    spreadsheetSourceCount: counts.get('spreadsheet') ?? 0,
    worksheetSourceCount,
  };
}

function buildActivityAiEnhancementPolicySummary(
  decision: ActivityAiEnhancementPolicyDecision
): ActivityAiEnhancementPolicySummary {
  return {
    activityContentTarget: decision.targetModel,
    aiCompletionScope: formatActivityAiEnhancementPolicyFields(
      decision.fieldTargets
    ),
    answerExplanationTarget: decision.fieldTargets.includes(
      'answerExplanations'
    )
      ? 'Question explanations'
      : 'Preserved',
    assignmentSnapshotProtection: 'Existing snapshots protected',
    createInputContract: 'CreateActivityInput',
    deterministicReadiness:
      decision.status === 'deterministic-draft-available'
        ? 'Ready without AI'
        : `${decision.readyTemplateCount} ready / ${decision.lockedTemplateCount} locked`,
    draftOutput: decision.canEnterEditorDraftFlow
      ? 'Editor draft proposal'
      : 'Blocked before draft',
    editorReviewGate: 'Teacher review required',
    enhancementKind: decision.enhancementKind,
    groupTarget: decision.fieldTargets.includes('groups')
      ? 'ActivityContent.groups'
      : 'Preserved',
    listeningScriptTarget:
      decision.enhancementKind === 'listening-script'
        ? 'Question prompt draft'
        : 'Preserved',
    missingRequirements:
      formatTemplateRequirementList(decision.missingRequirementLabels) ||
      'None',
    pairTarget: decision.fieldTargets.includes('pairs')
      ? 'ActivityContent.pairs'
      : 'Preserved',
    publicPayloadGuard: 'Sanitized runtime only',
    publishBoundary: 'No assignment link',
    questionOptionTarget: decision.fieldTargets.includes('questionOptions')
      ? 'ActivityQuestion.options'
      : 'Preserved',
    questionTarget: decision.fieldTargets.includes('questions')
      ? 'ActivityContent.questions'
      : 'Preserved',
    rawProviderOutputGuard: 'Parsed fields only',
    requestSource: decision.requestSource,
    resultExportContinuity: 'Shared result export model',
    saveGate: 'Teacher save required',
    sourceActivityState: decision.visibility,
    sourceByteGuard: 'No file bytes',
    sourceMaterialCapability:
      `${decision.audioSourceCount} audio / ` +
      `${decision.worksheetSourceCount} worksheet / ` +
      `${decision.spreadsheetSourceCount} spreadsheet`,
    sourceMaterialProvenance:
      `${decision.sourceMaterialCount} references / ` +
      `${decision.sourceMaterialKindCount} kinds`,
    storageKeyGuard: 'Storage hidden',
    targetTemplate: decision.targetTemplateLabel,
    teacherAuthGate: 'Authenticated teacher only',
    vocabularyTarget: decision.fieldTargets.includes('vocabulary')
      ? 'ActivityContent.vocabulary'
      : 'Preserved',
    worksheetExtractionTarget:
      decision.enhancementKind === 'worksheet-extraction'
        ? 'ActivityContent extraction'
        : 'Shared model only',
  };
}

function buildActivityAiEnhancementPolicyItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementPolicyItemId;
  summary: ActivityAiEnhancementPolicySummary;
}): Omit<ActivityAiEnhancementPolicyItemView, 'ariaLabel'> {
  switch (id) {
    case 'enhancement-kind':
      return item(
        id,
        'Enhancement kind',
        summary.enhancementKind,
        'Selected AI enhancement capability for this editor-reviewed request.'
      );
    case 'teacher-auth-gate':
      return item(
        id,
        'Teacher auth gate',
        summary.teacherAuthGate,
        'Requests enter through authenticated teacher-owned server functions or editor actions.'
      );
    case 'request-source':
      return item(
        id,
        'Request source',
        summary.requestSource,
        'The policy records whether the request started from the editor, library, or server function.'
      );
    case 'source-activity-state':
      return item(
        id,
        'Source activity state',
        summary.sourceActivityState,
        'Archived sources must be restored before AI enhancement drafts can be derived.'
      );
    case 'target-template':
      return item(
        id,
        'Target template',
        summary.targetTemplate,
        'Template-targeted enhancements reuse the deterministic remix plan before provider work.'
      );
    case 'deterministic-readiness':
      return item(
        id,
        'Deterministic readiness',
        summary.deterministicReadiness,
        'Existing structured content is checked first so AI fills gaps instead of replacing ready paths.'
      );
    case 'missing-requirements':
      return item(
        id,
        'Missing requirements',
        summary.missingRequirements,
        'Missing template requirements become draft field targets, not direct persisted mutations.'
      );
    case 'ai-completion-scope':
      return item(
        id,
        'AI completion scope',
        summary.aiCompletionScope,
        'The enhancement is limited to structured draft fields teachers can inspect.'
      );
    case 'draft-output':
      return item(
        id,
        'Draft output',
        summary.draftOutput,
        'Successful requests produce editor draft proposals rather than saved records.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        summary.createInputContract,
        'Enhancement output stays compatible with the manual activity creation and editing contract.'
      );
    case 'activity-content-target':
      return item(
        id,
        'Activity content target',
        summary.activityContentTarget,
        'Future enhancement fields map back into the shared activity model.'
      );
    case 'question-target':
      return item(
        id,
        'Question target',
        summary.questionTarget,
        'Generated prompts, accepted answers, and scripts reuse the existing question list.'
      );
    case 'pair-target':
      return item(
        id,
        'Pair target',
        summary.pairTarget,
        'Match and line-match work remains in the shared pair structure.'
      );
    case 'group-target':
      return item(
        id,
        'Group target',
        summary.groupTarget,
        'Classification and group-sort work remains in the shared group structure.'
      );
    case 'vocabulary-target':
      return item(
        id,
        'Vocabulary target',
        summary.vocabularyTarget,
        'Vocabulary enrichment remains editable structured content.'
      );
    case 'question-option-target':
      return item(
        id,
        'Question option target',
        summary.questionOptionTarget,
        'AI distractor work writes into ActivityQuestion.options when needed.'
      );
    case 'answer-explanation-target':
      return item(
        id,
        'Answer explanation target',
        summary.answerExplanationTarget,
        'Generated explanations target teacher-reviewed question explanation fields.'
      );
    case 'listening-script-target':
      return item(
        id,
        'Listening script target',
        summary.listeningScriptTarget,
        'Listening scripts stay as draft question prompts before the transcript reaches students.'
      );
    case 'worksheet-extraction-target':
      return item(
        id,
        'Worksheet extraction target',
        summary.worksheetExtractionTarget,
        'Worksheet extraction extends ActivityContent instead of creating a parallel worksheet model.'
      );
    case 'source-material-capability':
      return item(
        id,
        'Source material capability',
        summary.sourceMaterialCapability,
        'Extraction readiness is based on safe material kind counts.'
      );
    case 'source-material-provenance':
      return item(
        id,
        'Source material provenance',
        summary.sourceMaterialProvenance,
        'Only compact source-material counts and kinds are exposed by this policy.'
      );
    case 'source-byte-guard':
      return item(
        id,
        'Source byte guard',
        summary.sourceByteGuard,
        'Uploaded file bytes remain outside AI enhancement policy outputs.'
      );
    case 'storage-key-guard':
      return item(
        id,
        'Storage key guard',
        summary.storageKeyGuard,
        'Storage keys, URLs, path segments, query tokens, and permissions stay hidden.'
      );
    case 'raw-provider-output-guard':
      return item(
        id,
        'Raw provider output guard',
        summary.rawProviderOutputGuard,
        'Provider output must be parsed into normalized fields before app surfaces receive it.'
      );
    case 'editor-review-gate':
      return item(
        id,
        'Editor review gate',
        summary.editorReviewGate,
        'Teachers must review enhancement proposals before save.'
      );
    case 'save-gate':
      return item(
        id,
        'Save gate',
        summary.saveGate,
        'Activity persistence still requires an explicit teacher save action.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        summary.publishBoundary,
        'Enhancements cannot create assignment links or publish on their own.'
      );
    case 'assignment-snapshot-protection':
      return item(
        id,
        'Assignment snapshot protection',
        summary.assignmentSnapshotProtection,
        'Already-published assignment snapshots stay frozen.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        summary.publicPayloadGuard,
        'Student payloads receive sanitized runtime content only.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        summary.resultExportContinuity,
        'AI-enhanced activities continue through shared attempt, result, and export models.'
      );
  }
}

function buildActivityAiEnhancementPolicyItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementPolicyItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementPolicyPrivacyContract(
  itemViews: ActivityAiEnhancementPolicyItemView[]
): ActivityAiEnhancementPolicyPrivacyContract {
  return {
    appliesBeforeActivitySave: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentText: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesFileBytesToAi: false,
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
    requiresAuthenticatedTeacher: true,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-policy',
    usesActivityContentModel: true,
    usesDeterministicReadinessFirst: true,
    writesDistractorsToQuestionOptions: true,
  };
}

function item(
  id: ActivityAiEnhancementPolicyItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementPolicyItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}

function formatActivityAiEnhancementPolicyFields(
  fields: readonly ActivityAiEnhancementPolicyTargetField[]
) {
  return fields.length > 0 ? fields.join(', ') : 'No draft fields';
}

function uniquePolicyFields(fields: ActivityAiEnhancementPolicyTargetField[]) {
  return [...new Set(fields)];
}
