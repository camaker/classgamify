import {
  buildActivityAiEnhancementPolicyDecision,
  type ActivityAiEnhancementKind,
  type ActivityAiEnhancementPolicyDecision,
  type ActivityAiEnhancementPolicySource,
  type ActivityAiEnhancementPolicyTargetField,
} from '@/activities/ai-enhancement-policy';

export const ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS = [
  'execution-scope',
  'policy-source',
  'enhancement-kind',
  'plan-status',
  'blocked-reason',
  'provider-mode',
  'local-fallback-mode',
  'deterministic-draft-mode',
  'editor-draft-target',
  'field-targets',
  'target-model',
  'target-template',
  'source-visibility',
  'source-material-readiness',
  'question-choice-readiness',
  'auth-gate',
  'server-function-boundary',
  'provider-call-boundary',
  'raw-output-parser',
  'fallback-stability',
  'editor-review-gate',
  'save-gate',
  'publish-boundary',
  'snapshot-guard',
  'public-payload-guard',
  'source-byte-guard',
  'storage-key-guard',
  'private-text-guard',
  'result-export-continuity',
  'execution-chain-gate',
] as const;

export type ActivityAiEnhancementExecutionItemId =
  (typeof ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS)[number];

export type ActivityAiEnhancementExecutionStatus =
  | 'blocked'
  | 'deterministic-draft'
  | 'local-fallback-ready'
  | 'provider-ready';

export type ActivityAiEnhancementExecutionBlockedReason =
  | 'editor-draft-unavailable'
  | 'source-material-required'
  | 'structured-content-required'
  | 'teacher-auth-required'
  | 'restore-source-first';

export type ActivityAiEnhancementExecutionMode =
  | 'deterministic-draft'
  | 'local-fallback'
  | 'provider'
  | 'unavailable';

export type ActivityAiEnhancementExecutionSource =
  ActivityAiEnhancementPolicySource & {
    hasAuthenticatedTeacher?: boolean;
  };

export type ActivityAiEnhancementExecutionPlan = {
  blockedReason?: ActivityAiEnhancementExecutionBlockedReason;
  canExecute: boolean;
  draftTarget: 'editor-only';
  enhancementKind: ActivityAiEnhancementKind;
  fieldTargets: ActivityAiEnhancementPolicyTargetField[];
  mode: ActivityAiEnhancementExecutionMode;
  persistenceMode: 'not-persisted';
  policy: ActivityAiEnhancementPolicyDecision;
  requiresEditorReview: true;
  status: ActivityAiEnhancementExecutionStatus;
  usesDeterministicDraft: boolean;
  usesExternalProvider: boolean;
  usesLocalFallback: boolean;
};

export type ActivityAiEnhancementExecutionItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiEnhancementExecutionItemId;
  label: string;
  value: string;
};

export type ActivityAiEnhancementExecutionPrivacyContract = {
  blocksWithoutAuthenticatedTeacher: true;
  createsAssignmentLinksWithoutTeacherAction: false;
  exposesActivityContentText: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesDraftText: false;
  exposesFileBytesToAi: false;
  exposesRawAiOutput: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: ActivityAiEnhancementExecutionItemId[];
  mutatesExistingAssignmentSnapshots: false;
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresEditorReview: true;
  scope: 'activity-ai-enhancement-execution';
  usesPolicyDecision: true;
};

export type ActivityAiEnhancementExecutionView = {
  description: string;
  itemViews: ActivityAiEnhancementExecutionItemView[];
  plan: ActivityAiEnhancementExecutionPlan;
  privacy: ActivityAiEnhancementExecutionPrivacyContract;
  title: string;
};

type ActivityAiEnhancementExecutionSummary = {
  authGate: string;
  blockedReason: string;
  deterministicDraftMode: string;
  editorDraftTarget: string;
  enhancementKind: string;
  executionChainGate: string;
  executionScope: string;
  fallbackStability: string;
  fieldTargets: string;
  localFallbackMode: string;
  planStatus: string;
  policySource: string;
  privateTextGuard: string;
  providerCallBoundary: string;
  providerMode: string;
  publicPayloadGuard: string;
  publishBoundary: string;
  questionChoiceReadiness: string;
  rawOutputParser: string;
  resultExportContinuity: string;
  saveGate: string;
  serverFunctionBoundary: string;
  snapshotGuard: string;
  sourceByteGuard: string;
  sourceMaterialReadiness: string;
  sourceVisibility: string;
  storageKeyGuard: string;
  targetModel: string;
  targetTemplate: string;
};

export function buildActivityAiEnhancementExecutionView(
  source: ActivityAiEnhancementExecutionSource
): ActivityAiEnhancementExecutionView {
  const plan = buildActivityAiEnhancementExecutionPlan(source);
  const summary = buildActivityAiEnhancementExecutionSummary(plan);
  const itemViews = ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS.map((id) =>
    buildActivityAiEnhancementExecutionItemView(
      buildActivityAiEnhancementExecutionItem({ id, summary })
    )
  );

  return {
    description:
      'Execution plan for future AI enhancement requests before provider work, local fallback, deterministic drafts, editor review, save, or publish.',
    itemViews,
    plan,
    privacy: buildActivityAiEnhancementExecutionPrivacyContract(itemViews),
    title: 'Activity AI enhancement execution',
  };
}

export function buildActivityAiEnhancementExecutionPlan(
  source: ActivityAiEnhancementExecutionSource
): ActivityAiEnhancementExecutionPlan {
  const policy = buildActivityAiEnhancementPolicyDecision(source);
  const hasAuthenticatedTeacher = source.hasAuthenticatedTeacher === true;
  const blockedReason = getActivityAiEnhancementExecutionBlockedReason({
    hasAuthenticatedTeacher,
    policy,
  });

  if (blockedReason) {
    return {
      blockedReason,
      canExecute: false,
      draftTarget: 'editor-only',
      enhancementKind: policy.enhancementKind,
      fieldTargets: policy.fieldTargets,
      mode: 'unavailable',
      persistenceMode: 'not-persisted',
      policy,
      requiresEditorReview: true,
      status: 'blocked',
      usesDeterministicDraft: false,
      usesExternalProvider: false,
      usesLocalFallback: false,
    };
  }

  const status = getActivityAiEnhancementExecutionReadyStatus(policy);
  const mode = getActivityAiEnhancementExecutionMode(status);

  return {
    canExecute: true,
    draftTarget: 'editor-only',
    enhancementKind: policy.enhancementKind,
    fieldTargets: policy.fieldTargets,
    mode,
    persistenceMode: 'not-persisted',
    policy,
    requiresEditorReview: true,
    status,
    usesDeterministicDraft: mode === 'deterministic-draft',
    usesExternalProvider: mode === 'provider',
    usesLocalFallback: mode === 'local-fallback',
  };
}

function getActivityAiEnhancementExecutionBlockedReason({
  hasAuthenticatedTeacher,
  policy,
}: {
  hasAuthenticatedTeacher: boolean;
  policy: ActivityAiEnhancementPolicyDecision;
}): ActivityAiEnhancementExecutionBlockedReason | undefined {
  if (!hasAuthenticatedTeacher) return 'teacher-auth-required';

  if (policy.canEnterEditorDraftFlow) return undefined;

  switch (policy.status) {
    case 'needs-source-material':
      return 'source-material-required';
    case 'needs-structured-content':
      return 'structured-content-required';
    case 'restore-source-first':
      return 'restore-source-first';
    case 'deterministic-draft-available':
    case 'ready-for-editor-draft':
      return undefined;
  }

  return 'editor-draft-unavailable';
}

function getActivityAiEnhancementExecutionReadyStatus(
  policy: ActivityAiEnhancementPolicyDecision
): Exclude<ActivityAiEnhancementExecutionStatus, 'blocked'> {
  if (policy.status === 'deterministic-draft-available') {
    return 'deterministic-draft';
  }

  return policy.canCallExternalProvider
    ? 'provider-ready'
    : 'local-fallback-ready';
}

function getActivityAiEnhancementExecutionMode(
  status: Exclude<ActivityAiEnhancementExecutionStatus, 'blocked'>
): Exclude<ActivityAiEnhancementExecutionMode, 'unavailable'> {
  switch (status) {
    case 'deterministic-draft':
      return 'deterministic-draft';
    case 'local-fallback-ready':
      return 'local-fallback';
    case 'provider-ready':
      return 'provider';
  }
}

function buildActivityAiEnhancementExecutionSummary(
  plan: ActivityAiEnhancementExecutionPlan
): ActivityAiEnhancementExecutionSummary {
  return {
    authGate:
      plan.blockedReason === 'teacher-auth-required'
        ? 'Teacher sign-in required'
        : 'Authenticated teacher',
    blockedReason: plan.blockedReason ?? 'None',
    deterministicDraftMode: plan.usesDeterministicDraft ? 'Selected' : 'Off',
    editorDraftTarget: plan.draftTarget,
    enhancementKind: plan.enhancementKind,
    executionChainGate: '30 execution slices',
    executionScope: 'Editor draft request',
    fallbackStability: plan.usesLocalFallback ? 'Local fallback' : 'Available',
    fieldTargets: formatActivityAiEnhancementExecutionFields(plan.fieldTargets),
    localFallbackMode: plan.usesLocalFallback ? 'Selected' : 'Available',
    planStatus: plan.status,
    policySource: plan.policy.requestSource,
    privateTextGuard: 'Private text hidden',
    providerCallBoundary: plan.usesExternalProvider
      ? 'Provider call allowed'
      : 'No provider call',
    providerMode: plan.usesExternalProvider ? 'Selected' : 'Off',
    publicPayloadGuard: 'Sanitized runtime only',
    publishBoundary: 'No assignment link',
    questionChoiceReadiness:
      `${plan.policy.questionChoiceReadyCount} ready / ` +
      `${plan.policy.questionChoiceNeedsCandidateCount} needs candidates`,
    rawOutputParser: 'Parsed fields only',
    resultExportContinuity: 'Shared result model',
    saveGate: 'Teacher save required',
    serverFunctionBoundary: 'Authenticated server function',
    snapshotGuard: 'Frozen snapshots protected',
    sourceByteGuard: 'No file bytes',
    sourceMaterialReadiness:
      `${plan.policy.audioSourceCount} audio / ` +
      `${plan.policy.worksheetSourceCount} worksheet / ` +
      `${plan.policy.spreadsheetSourceCount} spreadsheet`,
    sourceVisibility: plan.policy.visibility,
    storageKeyGuard: 'Storage hidden',
    targetModel: plan.policy.targetModel,
    targetTemplate: plan.policy.targetTemplateLabel,
  };
}

function buildActivityAiEnhancementExecutionItem({
  id,
  summary,
}: {
  id: ActivityAiEnhancementExecutionItemId;
  summary: ActivityAiEnhancementExecutionSummary;
}): Omit<ActivityAiEnhancementExecutionItemView, 'ariaLabel'> {
  switch (id) {
    case 'execution-scope':
      return item(
        id,
        'Execution scope',
        summary.executionScope,
        'The plan covers an AI enhancement request before any persisted product mutation.'
      );
    case 'policy-source':
      return item(
        id,
        'Policy source',
        summary.policySource,
        'The execution plan is derived from the shared AI enhancement policy decision.'
      );
    case 'enhancement-kind':
      return item(
        id,
        'Enhancement kind',
        summary.enhancementKind,
        'The selected future AI enhancement capability.'
      );
    case 'plan-status':
      return item(
        id,
        'Plan status',
        summary.planStatus,
        'The request is either blocked, deterministic, local fallback ready, or provider ready.'
      );
    case 'blocked-reason':
      return item(
        id,
        'Blocked reason',
        summary.blockedReason,
        'Blocked plans preserve a structured reason for UI and server handling.'
      );
    case 'provider-mode':
      return item(
        id,
        'Provider mode',
        summary.providerMode,
        'Configured provider calls are selected only after policy gates pass.'
      );
    case 'local-fallback-mode':
      return item(
        id,
        'Local fallback mode',
        summary.localFallbackMode,
        'Local fallback remains available for stable development and CI behavior.'
      );
    case 'deterministic-draft-mode':
      return item(
        id,
        'Deterministic draft mode',
        summary.deterministicDraftMode,
        'Ready deterministic paths avoid provider work.'
      );
    case 'editor-draft-target':
      return item(
        id,
        'Editor draft target',
        summary.editorDraftTarget,
        'Execution results target editor-only draft review.'
      );
    case 'field-targets':
      return item(
        id,
        'Field targets',
        summary.fieldTargets,
        'Structured field targets remain inspectable before save.'
      );
    case 'target-model':
      return item(
        id,
        'Target model',
        summary.targetModel,
        'Enhancements stay inside CreateActivityInput or ActivityContent.'
      );
    case 'target-template':
      return item(
        id,
        'Target template',
        summary.targetTemplate,
        'Template-targeted work follows deterministic readiness first.'
      );
    case 'source-visibility':
      return item(
        id,
        'Source visibility',
        summary.sourceVisibility,
        'Archived sources are blocked before derivation.'
      );
    case 'source-material-readiness':
      return item(
        id,
        'Source material readiness',
        summary.sourceMaterialReadiness,
        'Extraction modes depend on safe material kind counts.'
      );
    case 'question-choice-readiness':
      return item(
        id,
        'Question choice readiness',
        summary.questionChoiceReadiness,
        'Distractor work follows the existing question option readiness model.'
      );
    case 'auth-gate':
      return item(
        id,
        'Auth gate',
        summary.authGate,
        'Execution requires an authenticated teacher.'
      );
    case 'server-function-boundary':
      return item(
        id,
        'Server function boundary',
        summary.serverFunctionBoundary,
        'Provider execution stays behind authenticated server functions.'
      );
    case 'provider-call-boundary':
      return item(
        id,
        'Provider call boundary',
        summary.providerCallBoundary,
        'Provider calls are skipped when policy chooses local fallback, deterministic drafts, or blocking.'
      );
    case 'raw-output-parser':
      return item(
        id,
        'Raw output parser',
        summary.rawOutputParser,
        'Provider output must be parsed before reaching app surfaces.'
      );
    case 'fallback-stability':
      return item(
        id,
        'Fallback stability',
        summary.fallbackStability,
        'Fallback keeps local development and CI deterministic.'
      );
    case 'editor-review-gate':
      return item(
        id,
        'Editor review gate',
        'Teacher review required',
        'Drafts remain teacher-reviewed before persistence.'
      );
    case 'save-gate':
      return item(
        id,
        'Save gate',
        summary.saveGate,
        'No activity is saved without explicit teacher action.'
      );
    case 'publish-boundary':
      return item(
        id,
        'Publish boundary',
        summary.publishBoundary,
        'No assignment links are created by enhancement execution.'
      );
    case 'snapshot-guard':
      return item(
        id,
        'Snapshot guard',
        summary.snapshotGuard,
        'Existing assignment snapshots remain unchanged.'
      );
    case 'public-payload-guard':
      return item(
        id,
        'Public payload guard',
        summary.publicPayloadGuard,
        'Student payloads receive sanitized runtime content only.'
      );
    case 'source-byte-guard':
      return item(
        id,
        'Source byte guard',
        summary.sourceByteGuard,
        'File bytes remain outside the execution plan.'
      );
    case 'storage-key-guard':
      return item(
        id,
        'Storage key guard',
        summary.storageKeyGuard,
        'Storage keys, URLs, path segments, query tokens, and permissions stay hidden.'
      );
    case 'private-text-guard':
      return item(
        id,
        'Private text guard',
        summary.privateTextGuard,
        'The plan hides source text, prompt text, answers, and draft text.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        summary.resultExportContinuity,
        'AI-enhanced activities continue through the shared results model.'
      );
    case 'execution-chain-gate':
      return item(
        id,
        'Execution chain gate',
        summary.executionChainGate,
        'A focused gate keeps execution plans aligned with policy and privacy.'
      );
  }
}

function buildActivityAiEnhancementExecutionItemView({
  description,
  id,
  label,
  value,
}: Omit<ActivityAiEnhancementExecutionItemView, 'ariaLabel'>) {
  return {
    ariaLabel: `${label}: ${value}`,
    description,
    id,
    label,
    value,
  };
}

function buildActivityAiEnhancementExecutionPrivacyContract(
  itemViews: ActivityAiEnhancementExecutionItemView[]
): ActivityAiEnhancementExecutionPrivacyContract {
  return {
    blocksWithoutAuthenticatedTeacher: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentText: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesDraftText: false,
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
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-execution',
    usesPolicyDecision: true,
  };
}

function item(
  id: ActivityAiEnhancementExecutionItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAiEnhancementExecutionItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}

function formatActivityAiEnhancementExecutionFields(
  fields: readonly ActivityAiEnhancementPolicyTargetField[]
) {
  return fields.length > 0 ? fields.join(', ') : 'No draft fields';
}
