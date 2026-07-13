export const CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS = [
  'product-loop-contract',
  'activity-model',
  'classroom-data-lifecycle-boundary',
  'activity-library-owner-scope',
  'activity-authoring-library-boundary',
  'template-roadmap-capability-boundary',
  'ai-enhancement-lifecycle-boundary',
  'source-extraction-lifecycle-boundary',
  'activity-lifecycle-governance-boundary',
  'published-assignment-delivery-boundary',
  'assignment-snapshot-freeze',
  'student-runner-play-boundary',
  'public-rules-summary',
  'student-identity-lifecycle-boundary',
  'student-runtime-identity-boundary',
  'progress-submit-readiness',
  'assignment-submission-validation-boundary',
  'scored-attempt-result-boundary',
  'answer-feedback-lifecycle-boundary',
  'result-submitted-date-boundary',
  'teacher-result-review-boundary',
  'result-accepted-answer-boundary',
  'csv-export-boundary',
  'result-explanation-boundary',
  'teacher-result-copy-lifecycle-boundary',
  'teacher-workspace-operations-boundary',
  'printable-worksheet-review-lifecycle-boundary',
  'public-discovery-indexing-boundary',
  'privacy-guards',
  'product-loop-chain-gate',
] as const;

export const CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/seo/public-discovery-indexing-chain.ts',
  'src/dashboard/overview.ts',
  'src/dashboard/teacher-workspace-operations-chain.ts',
  'src/db/classroom-data-lifecycle-chain.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/activities/template-roadmap-capability-chain.ts',
  'src/activities/ai-enhancement-lifecycle-chain.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/activities/activity-lifecycle-governance-chain.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/result-submitted-date-chain.ts',
  'src/assignments/result-accepted-answer-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/result-explanation-chain.ts',
  'src/assignments/student-identity-lifecycle-chain.ts',
  'src/assignments/runtime-identity-handoff.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/answer-feedback-lifecycle-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/results-export.ts',
  'src/assignments/printable-worksheet-review-lifecycle-chain.ts',
  'src/config/classroom-trust-communication-chain.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ClassroomProductLoopChainHandoffItemId =
  (typeof CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ClassroomProductLoopChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ClassroomProductLoopChainHandoffItemId;
  label: string;
  value: string;
};

export type ClassroomProductLoopChainPrivacyContract = {
  appendsCopyScopeToArtifacts: true;
  apiNormalizesAnswersBeforeValidation: true;
  apiValidatesBeforeScoring: true;
  answerKeyHiddenByDefault: true;
  chainSourceFileCount: number;
  changesAttemptsOrResults: false;
  changesPublicRunner: false;
  submissionContractUsesRuntimeItemAnswerRows: true;
  copyArtifactsUseFormattedDates: true;
  copyArtifactsUseFormattedExplanations: true;
  countsStarterPreviewAsOwned: false;
  createsParallelWorksheetTables: false;
  clientPayloadUsesRuntimeItems: true;
  clientProgressUsesRuntimeItems: true;
  csvExportsUseSharedAnswerView: true;
  csvExportsUseFormattedExplanations: true;
  csvFormulaInjectionGuardEnabled: true;
  createsAssignmentLinksWithoutTeacherAction: false;
  csvDatesUseIsoFormatter: true;
  deliveryPolicyResolvedBeforeAssignmentSurfaces: true;
  emptyAnswersOmitted: true;
  exposesAnswerText: false;
  exposesAssignmentRuntimeContent: false;
  exposesAnonymousBrowserLabel: true;
  exposesAcceptedAlternativesToTeachersOnly: true;
  exposesAcceptedAlternativesAfterReview: true;
  exposesAcceptedAnswerTextInHandoff: false;
  exposesActivityContentJsonToPublicPayload: false;
  exposesActivityContentJson: false;
  exposesAssignmentTitle: false;
  exposesAuthSecrets: false;
  exposesAnonymousToken: false;
  exposesAnswerKeyTextInHandoff: false;
  exposesAnswerKeysBeforeReview: false;
  exposesAnswerKeysToPublicRunner: false;
  exposesAnswerKeysBeforeAllowedReview: false;
  exposesChoiceTextInHandoff: false;
  exposesCopyArtifactText: false;
  exposesCsvFilename: false;
  exposesCsvDataUrlInHandoff: false;
  exposesPrivateActivityContent: false;
  exposesProviderSecrets: false;
  exposesRawAnonymousTokens: false;
  exposesRawAnonymousToken: false;
  exposesRawCopyArtifactsInHandoff: false;
  exposesRawCsvDataUrlInHandoff: false;
  exposesRawRuntimeItemIdsInHandoff: false;
  exposesRawPayloadRows: false;
  exposesRawSubmissionPayload: false;
  exposesRawSubmissionPayloads: false;
  exposesResultExportRows: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimeItemIdsInHandoff: false;
  exposesRuntimePromptText: false;
  exposesSnapshotContentJsonToPublicPayload: false;
  exposesSourceMaterialMetadataInIdentityHandoff: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesSourceMaterialMetadata: false;
  exposesPromptText: false;
  exposesPromptTextInFeedbackHandoff: false;
  exposesPromptTextInHandoff: false;
  exposesRawRuntimeItemIdsInFeedbackHandoff: false;
  exposesExpectedAnswerTextInHandoff: false;
  exposesStudentAnswerText: false;
  exposesStudentAnswerTextInIdentityHandoff: false;
  exposesStudentAnswerTextInFeedbackHandoff: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentInstructions: false;
  exposesStudentLabelsInHandoff: false;
  exposesStudentName: false;
  exposesStudentNameInputValues: false;
  exposesStudentNamesInFeedbackHandoff: false;
  exposesStudentNamesInHandoff: false;
  exposesStudentResponseTextInHandoff: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherAnswerText: false;
  exposesTeacherAnswerKeysInIdentityHandoff: false;
  exposesTeacherAnswerTextInHandoff: false;
  exposesTeacherEmail: false;
  exposesTeacherExplanationsBeforeReview: false;
  exposesTeacherExplanationTextInHandoff: false;
  exposesRawAnonymousTokensInHandoff: false;
  exposesRawCopyArtifactTextInHandoff: false;
  exportPreparationScope: 'full-assignment-results';
  exportIncludesSubmittedDateColumns: true;
  freezesAssignmentSnapshots: true;
  freezesSnapshotContent: true;
  itemIds: ClassroomProductLoopChainHandoffItemId[];
  preservesFrozenSnapshots: true;
  requiresTeacherSaveBeforeActivityPersistence: true;
  keepsSourceMaterialExtractionEditorReviewed: true;
  archivedActivitiesRequireRestoreBeforeDerive: true;
  keepsProtectedRoutesOutOfIndex: true;
  keepsPublicDiscoverySourceLevel: true;
  keepsActivityLibraryOwnerScoped: true;
  keepsAssignmentListOwnerScoped: true;
  keepsDashboardOwnerScoped: true;
  keepsCsvExportFullAssignment: true;
  keepsTemplateRoadmapOnSharedActivityModel: true;
  keepsSettingsFromMutatingClassroomData: true;
  keepsVisiblePageCountsSeparate: true;
  keepsNameAndTokenModesExclusive: true;
  mutatesAttemptsFromValidationHandoff: false;
  mutatesPublicRunner: false;
  partialSubmissionAllowed: true;
  persistenceUsesNormalizedAnswers: true;
  printableAnswerKeysUseFormattedExplanations: true;
  preservesTeacherResultEvidence: true;
  persistsAttemptsAfterValidation: true;
  publishesAssignmentAndSnapshotTogether: true;
  publicFeedbackRespectsAnswerReveal: true;
  publicPayloadUsesRuntimeItemsOnly: true;
  publicResponseUsesSanitizedScoredResult: true;
  publicStudentRunnerPayloadUsesSanitizedRuntimeItems: true;
  rejectsClosedOrExpiredStudentRunnerSubmissions: true;
  rejectsDuplicateAnswerIds: true;
  rejectsInvalidSubmissions: true;
  rejectsOverlongAnswerRows: true;
  rejectsUnknownRuntimeIds: true;
  requiresRuntimeIdsUniqueBeforeSubmission: true;
  resultPagesUseSharedAnswerView: true;
  resultPagesUseFormattedExplanations: true;
  resultExportsIncludeDeliveryPolicy: true;
  resultSubmittedDateSortingUsesTimestampParsing: true;
  resultUiDatesUseLocalizedFormatter: true;
  runtimeIdentityUsesFrozenSnapshot: true;
  runtimeIdentityUsesSharedNormalizer: true;
  requiresTeacherReviewForAiEnhancements: true;
  requiresTeacherReviewForAiDrafts: true;
  requiresAuthenticatedTeacher: true;
  requiresAssignmentSnapshot: true;
  requiresNormalizedAnonymousTokens: true;
  requiresNormalizedStudentNames: true;
  requiresOwnerScopedActivities: true;
  requiresOwnerScopedAssignments: true;
  requiresOwnerScopedAssignment: true;
  resultConsumersUseNormalizedIdentity: true;
  resultConsumersUseScoredAttempts: true;
  runtimeScoringUsesSharedMatcher: true;
  scoringUsesSharedAcceptedAnswerParser: true;
  scoringUsesNormalizedAnswers: true;
  sourceFiles: string[];
  splitsPrimaryFromAlternatives: true;
  storesImmutableScoredAttemptAnswerJson: true;
  storesImmutableScoredAttemptResultJson: true;
  usesAiEnhancementLifecycleChain: true;
  usesActivityAuthoringLibraryChain: true;
  usesActivityAssignmentAttemptResultsLoop: true;
  usesActivityLifecycleGovernanceChain: true;
  usesAccountGovernanceLifecycleChain: true;
  usesActiveSurfaceProductBoundary: true;
  usesAnswerFeedbackLifecycleChain: true;
  usesAssignmentSubmissionValidationHandoff: true;
  usesClassroomDataLifecycleChain: true;
  usesD1AppSchema: true;
  usesPublishedAssignmentDeliveryChain: true;
  usesPublicDiscoveryIndexingChain: true;
  usesAssignmentResultsExportPreparation: true;
  usesBrowserTokenForAnonymousAttempts: true;
  usesDisplayLabelsForAnonymousResults: true;
  usesFullFilteredSummariesForOverview: true;
  usesPaymentCallbackHandoff: true;
  usesPrintableWorksheetReviewLifecycleChain: true;
  usesResultAcceptedAnswerChain: true;
  usesResultExplanationChain: true;
  usesResultSubmittedDateChain: true;
  usesScoredAttemptResultChain: true;
  usesSharedAttemptStats: true;
  usesSharedDurationFormatting: true;
  usesSourceExtractionLifecycleChain: true;
  usesStudentRuntimeIdentityHandoff: true;
  usesStudentRunnerPlayChain: true;
  usesTemplateRoadmapCapabilityChain: true;
  usesTeacherOnlyResultScope: true;
  usesCurrentReviewScopeForCopyActions: true;
  usesSharedCopyArtifactBuilders: true;
  usesSharedDeliveryPolicy: true;
  usesSharedRuntimeItems: true;
  usesSharedAttemptAnswerHelpers: true;
  usesScoredAttemptsForAttemptLimits: true;
  usesSnapshotForPublicRuntime: true;
  submissionValidationUsesFrozenRuntimeItems: true;
  usesStudentIdentityLifecycleChain: true;
  usesTeacherWorkspaceOperationsChain: true;
  templateFeedbackUsesSharedComponent: true;
  usesTeacherResultCopyLifecycleChain: true;
  usesTeacherResultsReviewChain: true;
};

export type ClassroomProductLoopChainHandoffView = {
  description: string;
  itemViews: ClassroomProductLoopChainHandoffItemView[];
  privacy: ClassroomProductLoopChainPrivacyContract;
  title: string;
};

export function buildClassroomProductLoopChainHandoffView(): ClassroomProductLoopChainHandoffView {
  const itemViews = CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildClassroomProductLoopChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice classroom product loop chain from teacher-owned activities and reusable content through classroom data lifecycle, activity authoring/library workflow, source extraction lifecycle boundaries, activity lifecycle governance, template roadmap capability alignment, AI enhancement lifecycle review, published assignment delivery, student runner play, student identity lifecycle, student runtime identity boundary, assignment submission validation boundary, scored attempt results, answer feedback lifecycle, submitted-date continuity, accepted-answer continuity, and explanation continuity, teacher review, teacher result copy lifecycle, printable worksheet review lifecycle, copy/export/print handoffs, teacher workspace operations, public discovery/indexing metadata, and privacy guards.',
    itemViews,
    privacy: {
      appendsCopyScopeToArtifacts: true,
      apiNormalizesAnswersBeforeValidation: true,
      apiValidatesBeforeScoring: true,
      answerKeyHiddenByDefault: true,
      chainSourceFileCount: CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length,
      changesAttemptsOrResults: false,
      changesPublicRunner: false,
      submissionContractUsesRuntimeItemAnswerRows: true,
      clientPayloadUsesRuntimeItems: true,
      clientProgressUsesRuntimeItems: true,
      copyArtifactsUseFormattedDates: true,
      copyArtifactsUseFormattedExplanations: true,
      countsStarterPreviewAsOwned: false,
      createsParallelWorksheetTables: false,
      csvExportsUseSharedAnswerView: true,
      csvExportsUseFormattedExplanations: true,
      csvFormulaInjectionGuardEnabled: true,
      createsAssignmentLinksWithoutTeacherAction: false,
      csvDatesUseIsoFormatter: true,
      deliveryPolicyResolvedBeforeAssignmentSurfaces: true,
      emptyAnswersOmitted: true,
      exposesAnswerText: false,
      exposesAssignmentRuntimeContent: false,
      exposesAnonymousBrowserLabel: true,
      exposesAcceptedAlternativesToTeachersOnly: true,
      exposesAcceptedAlternativesAfterReview: true,
      exposesAcceptedAnswerTextInHandoff: false,
      exposesActivityContentJsonToPublicPayload: false,
      exposesActivityContentJson: false,
      exposesAssignmentTitle: false,
      exposesAuthSecrets: false,
      exposesAnonymousToken: false,
      exposesAnswerKeyTextInHandoff: false,
      exposesAnswerKeysBeforeReview: false,
      exposesAnswerKeysToPublicRunner: false,
      exposesAnswerKeysBeforeAllowedReview: false,
      exposesChoiceTextInHandoff: false,
      exposesCopyArtifactText: false,
      exposesCsvFilename: false,
      exposesCsvDataUrlInHandoff: false,
      exposesPrivateActivityContent: false,
      exposesProviderSecrets: false,
      exposesRawAnonymousTokens: false,
      exposesRawAnonymousToken: false,
      exposesRawCopyArtifactsInHandoff: false,
      exposesRawCsvDataUrlInHandoff: false,
      exposesRawRuntimeItemIdsInHandoff: false,
      exposesRawPayloadRows: false,
      exposesRawSubmissionPayload: false,
      exposesRawSubmissionPayloads: false,
      exposesResultExportRows: false,
      exposesRuntimeChoiceText: false,
      exposesRuntimeItemIds: false,
      exposesRuntimeItemIdsInHandoff: false,
      exposesRuntimePromptText: false,
      exposesSnapshotContentJsonToPublicPayload: false,
      exposesSourceMaterialMetadataInIdentityHandoff: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialFilenames: false,
      exposesSourceMaterialStorageKeys: false,
      exposesSourceMaterialMetadata: false,
      exposesPromptText: false,
      exposesPromptTextInFeedbackHandoff: false,
      exposesPromptTextInHandoff: false,
      exposesRawRuntimeItemIdsInFeedbackHandoff: false,
      exposesExpectedAnswerTextInHandoff: false,
      exposesStudentAnswerText: false,
      exposesStudentAnswerTextInIdentityHandoff: false,
      exposesStudentAnswerTextInFeedbackHandoff: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentInstructions: false,
      exposesStudentLabelsInHandoff: false,
      exposesStudentName: false,
      exposesStudentNameInputValues: false,
      exposesStudentNamesInFeedbackHandoff: false,
      exposesStudentNamesInHandoff: false,
      exposesStudentResponseTextInHandoff: false,
      exposesTeacherOnlyAnswers: false,
      exposesTeacherAnswerText: false,
      exposesTeacherAnswerKeysInIdentityHandoff: false,
      exposesTeacherAnswerTextInHandoff: false,
      exposesTeacherEmail: false,
      exposesTeacherExplanationsBeforeReview: false,
      exposesTeacherExplanationTextInHandoff: false,
      exposesRawAnonymousTokensInHandoff: false,
      exposesRawCopyArtifactTextInHandoff: false,
      exportPreparationScope: 'full-assignment-results',
      exportIncludesSubmittedDateColumns: true,
      freezesAssignmentSnapshots: true,
      freezesSnapshotContent: true,
      itemIds: [...CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS],
      preservesFrozenSnapshots: true,
      requiresTeacherSaveBeforeActivityPersistence: true,
      keepsSourceMaterialExtractionEditorReviewed: true,
      archivedActivitiesRequireRestoreBeforeDerive: true,
      keepsProtectedRoutesOutOfIndex: true,
      keepsPublicDiscoverySourceLevel: true,
      keepsActivityLibraryOwnerScoped: true,
      keepsAssignmentListOwnerScoped: true,
      keepsDashboardOwnerScoped: true,
      keepsCsvExportFullAssignment: true,
      keepsTemplateRoadmapOnSharedActivityModel: true,
      keepsSettingsFromMutatingClassroomData: true,
      keepsVisiblePageCountsSeparate: true,
      keepsNameAndTokenModesExclusive: true,
      mutatesAttemptsFromValidationHandoff: false,
      mutatesPublicRunner: false,
      partialSubmissionAllowed: true,
      persistenceUsesNormalizedAnswers: true,
      printableAnswerKeysUseFormattedExplanations: true,
      preservesTeacherResultEvidence: true,
      persistsAttemptsAfterValidation: true,
      publishesAssignmentAndSnapshotTogether: true,
      publicFeedbackRespectsAnswerReveal: true,
      publicPayloadUsesRuntimeItemsOnly: true,
      publicResponseUsesSanitizedScoredResult: true,
      publicStudentRunnerPayloadUsesSanitizedRuntimeItems: true,
      rejectsClosedOrExpiredStudentRunnerSubmissions: true,
      rejectsDuplicateAnswerIds: true,
      rejectsInvalidSubmissions: true,
      rejectsOverlongAnswerRows: true,
      rejectsUnknownRuntimeIds: true,
      requiresRuntimeIdsUniqueBeforeSubmission: true,
      resultPagesUseSharedAnswerView: true,
      resultPagesUseFormattedExplanations: true,
      resultExportsIncludeDeliveryPolicy: true,
      resultSubmittedDateSortingUsesTimestampParsing: true,
      resultUiDatesUseLocalizedFormatter: true,
      runtimeIdentityUsesFrozenSnapshot: true,
      runtimeIdentityUsesSharedNormalizer: true,
      requiresTeacherReviewForAiEnhancements: true,
      requiresTeacherReviewForAiDrafts: true,
      requiresAuthenticatedTeacher: true,
      requiresAssignmentSnapshot: true,
      requiresNormalizedAnonymousTokens: true,
      requiresNormalizedStudentNames: true,
      requiresOwnerScopedActivities: true,
      requiresOwnerScopedAssignments: true,
      requiresOwnerScopedAssignment: true,
      resultConsumersUseNormalizedIdentity: true,
      resultConsumersUseScoredAttempts: true,
      runtimeScoringUsesSharedMatcher: true,
      scoringUsesSharedAcceptedAnswerParser: true,
      scoringUsesNormalizedAnswers: true,
      sourceFiles: [...CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES],
      splitsPrimaryFromAlternatives: true,
      storesImmutableScoredAttemptAnswerJson: true,
      storesImmutableScoredAttemptResultJson: true,
      usesAiEnhancementLifecycleChain: true,
      usesActivityAuthoringLibraryChain: true,
      usesActivityAssignmentAttemptResultsLoop: true,
      usesActivityLifecycleGovernanceChain: true,
      usesAccountGovernanceLifecycleChain: true,
      usesActiveSurfaceProductBoundary: true,
      usesAnswerFeedbackLifecycleChain: true,
      usesAssignmentSubmissionValidationHandoff: true,
      usesClassroomDataLifecycleChain: true,
      usesD1AppSchema: true,
      usesPublishedAssignmentDeliveryChain: true,
      usesPublicDiscoveryIndexingChain: true,
      usesAssignmentResultsExportPreparation: true,
      usesBrowserTokenForAnonymousAttempts: true,
      usesDisplayLabelsForAnonymousResults: true,
      usesFullFilteredSummariesForOverview: true,
      usesPaymentCallbackHandoff: true,
      usesPrintableWorksheetReviewLifecycleChain: true,
      usesResultAcceptedAnswerChain: true,
      usesResultExplanationChain: true,
      usesResultSubmittedDateChain: true,
      usesScoredAttemptResultChain: true,
      usesSharedAttemptStats: true,
      usesSharedDurationFormatting: true,
      usesSourceExtractionLifecycleChain: true,
      usesStudentRuntimeIdentityHandoff: true,
      usesStudentRunnerPlayChain: true,
      usesTemplateRoadmapCapabilityChain: true,
      usesTeacherOnlyResultScope: true,
      usesCurrentReviewScopeForCopyActions: true,
      usesSharedCopyArtifactBuilders: true,
      usesSharedDeliveryPolicy: true,
      usesSharedRuntimeItems: true,
      usesSharedAttemptAnswerHelpers: true,
      usesScoredAttemptsForAttemptLimits: true,
      usesSnapshotForPublicRuntime: true,
      submissionValidationUsesFrozenRuntimeItems: true,
      usesStudentIdentityLifecycleChain: true,
      usesTeacherWorkspaceOperationsChain: true,
      templateFeedbackUsesSharedComponent: true,
      usesTeacherResultCopyLifecycleChain: true,
      usesTeacherResultsReviewChain: true,
    },
    title: 'Classroom product loop chain',
  };
}

function buildClassroomProductLoopChainHandoffItemView(
  id: ClassroomProductLoopChainHandoffItemId
): ClassroomProductLoopChainHandoffItemView {
  const item = getClassroomProductLoopChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getClassroomProductLoopChainHandoffItem(
  id: ClassroomProductLoopChainHandoffItemId
): Omit<ClassroomProductLoopChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-loop-contract':
      return item(
        id,
        'Product loop contract',
        'Activity -> Assignment -> Attempt -> Results',
        'The top-level product loop stays grounded in teacher activities, assignment links, student attempts, and teacher results.'
      );
    case 'activity-model':
      return item(
        id,
        'Activity model',
        'Teacher-owned activity',
        'Reusable activities remain owner-scoped classroom content rather than public demo rows.'
      );
    case 'classroom-data-lifecycle-boundary':
      return item(
        id,
        'Classroom data lifecycle boundary',
        '30 data slices',
        'D1 app schema, owner-scoped activity and assignment persistence, frozen snapshots, sanitized public payloads, scored attempts, result consumers, exports, printable worksheets, and data privacy guards stay aligned.'
      );
    case 'activity-library-owner-scope':
      return item(
        id,
        'Activity library owner scope',
        'Owner activities only',
        'Activity library search, filters, pagination, and summaries stay scoped to the authenticated teacher.'
      );
    case 'activity-authoring-library-boundary':
      return item(
        id,
        'Activity authoring/library boundary',
        '30 authoring slices',
        'Public template and worksheet entries, shared editor save, edit hydration, owner-scoped library management, derivative drafts, lifecycle gates, and publish snapshot boundaries stay aligned.'
      );
    case 'template-roadmap-capability-boundary':
      return item(
        id,
        'Template roadmap capability boundary',
        '30 roadmap slices',
        'Wordwall-style templates, Liveworksheets-style modes, shared editor scaffolds, AI enhancements, worksheet delivery, print follow-up, and result exports stay on the shared activity-assignment model.'
      );
    case 'ai-enhancement-lifecycle-boundary':
      return item(
        id,
        'AI enhancement lifecycle boundary',
        'Policy-to-publish review',
        'AI enhancements stay inside policy, execution, draft output, editor application, teacher review, save, publish, snapshot, public payload, and result-continuity gates.'
      );
    case 'source-extraction-lifecycle-boundary':
      return item(
        id,
        'Source extraction lifecycle boundary',
        '30 extraction slices',
        'Compact source-material references, material classification, audio/worksheet/spreadsheet readiness, AI-safe provenance, editor review, snapshot protection, and public payload privacy stay aligned.'
      );
    case 'activity-lifecycle-governance-boundary':
      return item(
        id,
        'Activity lifecycle governance boundary',
        '30 lifecycle slices',
        'Owner-scoped archive and restore, edit/publish/duplicate/remix gates, server enforcement, content/source-material retention, snapshot protection, and public assignment continuity stay aligned.'
      );
    case 'published-assignment-delivery-boundary':
      return item(
        id,
        'Published assignment delivery boundary',
        '30 delivery slices',
        'Publish preflight, frozen snapshots, share links, delivery policy, public student rules, validated submissions, attempt persistence, result review, export policy, and privacy guards stay aligned.'
      );
    case 'assignment-snapshot-freeze':
      return item(
        id,
        'Assignment snapshot freeze',
        'Frozen ActivityContent',
        'Published links freeze title, template, content, and delivery context so later activity edits affect only future assignments.'
      );
    case 'teacher-result-copy-lifecycle-boundary':
      return item(
        id,
        'Teacher result copy lifecycle boundary',
        '30 copy slices',
        'Current-review classroom briefs, reteach plans, item reviews, student follow-ups, previews, copy execution, result card consumers, and copy privacy guards stay aligned.'
      );
    case 'student-runner-play-boundary':
      return item(
        id,
        'Student runner play boundary',
        '30 runner slices',
        'Sanitized public payloads, rule summaries, unavailable-link handling, identity, timers, template renderers, partial-submit controls, validated submissions, attempt persistence, answer feedback, and privacy guards stay aligned.'
      );
    case 'public-rules-summary':
      return item(
        id,
        'Public rules summary',
        'Student-visible rules',
        'Student runners show safe delivery rules without answer keys or teacher-only content.'
      );
    case 'student-identity-lifecycle-boundary':
      return item(
        id,
        'Student identity lifecycle boundary',
        '30 identity slices',
        'Normalized student names, anonymous browser tokens, attempt-limit counting, submission identity, teacher result labels, search/sort/review, export token guards, and identity privacy stay aligned.'
      );
    case 'student-runtime-identity-boundary':
      return item(
        id,
        'Student runtime identity boundary',
        '30 runtime identity slices',
        'Template runner surfaces, runtime item counts, normalized runtime id counts, duplicate/blank/collision guards, shared submission contract, server validation, browser/scoring/teacher/public payload boundaries, frozen snapshots, and runtime privacy guards stay aligned.'
      );
    case 'progress-submit-readiness':
      return item(
        id,
        'Progress submit readiness',
        'Explicit partial confirm',
        'Progress counts and submit controls make incomplete attempts an explicit student decision.'
      );
    case 'assignment-submission-validation-boundary':
      return item(
        id,
        'Assignment submission validation boundary',
        '30 validation slices',
        'Frozen runtime validation, partial submissions, empty-answer omission, runtime/submitted id normalization, rejection guards, API limits, validate-before-scoring order, normalized persistence, teacher/public payload boundaries, and privacy guards stay aligned.'
      );
    case 'scored-attempt-result-boundary':
      return item(
        id,
        'Scored attempt result boundary',
        '30 result slices',
        'Validated submissions, lifecycle and identity gates, runtime scoring, immutable attempt rows, sanitized public feedback, shared stats, teacher review, copy artifacts, CSV export, printable return, and privacy guards stay aligned.'
      );
    case 'answer-feedback-lifecycle-boundary':
      return item(
        id,
        'Answer feedback lifecycle boundary',
        '30 feedback slices',
        'Shared scoring, accepted-answer parsing, public review policy, template feedback surfaces, teacher result evidence, CSV feedback columns, and feedback privacy guards stay aligned.'
      );
    case 'result-submitted-date-boundary':
      return item(
        id,
        'Result submitted-date boundary',
        '30 date slices',
        'Shared UI and CSV date formatters, attempt rows, review cards, student summaries, latest-attempt copy context, completed-at sorting, submitted-date export columns, and privacy guards stay aligned.'
      );
    case 'teacher-result-review-boundary':
      return item(
        id,
        'Teacher result review boundary',
        '30 review slices',
        'Owner-scoped result routes, frozen snapshots, attempt stats, review controls, reteach priorities, copy artifacts, CSV exports, result-material handoffs, and privacy guards stay aligned.'
      );
    case 'result-accepted-answer-boundary':
      return item(
        id,
        'Result accepted-answer boundary',
        '30 answer slices',
        'Shared accepted-answer parsing, display normalization, primary-vs-alternative formatting, result cards, item performance tables, attempt review cards, CSV accepted-answer columns, printable review, and privacy guards stay aligned.'
      );
    case 'csv-export-boundary':
      return item(
        id,
        'CSV export boundary',
        '30 export slices',
        'Full-assignment export scope, frozen snapshot context, delivery policy columns, result metrics, answer rows, accepted alternatives, submitted dates, durations, formula guards, and CSV privacy stay aligned.'
      );
    case 'result-explanation-boundary':
      return item(
        id,
        'Result explanation boundary',
        '30 explanation slices',
        'Activity content explanations, public payload guards, post-submit reveal policy, student feedback, teacher result cards, copy artifacts, CSV explanation columns, printable answer keys, and privacy guards stay aligned.'
      );
    case 'teacher-workspace-operations-boundary':
      return item(
        id,
        'Teacher workspace operations boundary',
        '30 workspace slices',
        'Dashboard owner summaries, activity library filters, assignment distribution, account governance, settings files/billing/notification, active-surface copy, and workspace privacy guards stay aligned.'
      );
    case 'printable-worksheet-review-lifecycle-boundary':
      return item(
        id,
        'Printable worksheet review lifecycle boundary',
        '30 print slices',
        'Teacher-only print routes, frozen worksheet snapshots, hidden answer-key defaults, handout fields, print actions, return links, and printable privacy guards stay aligned.'
      );
    case 'public-discovery-indexing-boundary':
      return item(
        id,
        'Public discovery indexing boundary',
        '30 discovery slices',
        'Public entry routes, sitemap, robots, manifest, legacy route retirement, public DOM handoff blocking, and privacy/indexing guards stay aligned.'
      );
    case 'privacy-guards':
      return item(
        id,
        'Privacy guards',
        'Private data hidden',
        'Loop handoffs hide teacher private content, raw student identifiers, answers, source storage keys, and CSV payloads.'
      );
    case 'product-loop-chain-gate':
      return item(
        id,
        'Product loop chain gate',
        '30 source files',
        'A focused gate keeps activity, assignment, attempt, result continuity, workspace, public entry, and privacy boundaries connected.'
      );
  }
}

function item(
  id: ClassroomProductLoopChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ClassroomProductLoopChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
