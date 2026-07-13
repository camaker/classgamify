export const CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS = [
  'assignment-lifecycle-governance-boundary',
  'assignment-source-activity-context-boundary',
  'classroom-data-lifecycle-boundary',
  'activity-library-page-boundary',
  'activity-authoring-library-boundary',
  'template-roadmap-capability-boundary',
  'ai-enhancement-lifecycle-boundary',
  'source-extraction-lifecycle-boundary',
  'activity-lifecycle-governance-boundary',
  'published-assignment-delivery-boundary',
  'assignment-publish-preflight-boundary',
  'student-runner-play-boundary',
  'public-assignment-rules-boundary',
  'student-identity-lifecycle-boundary',
  'student-runtime-identity-boundary',
  'assignment-attempt-persistence-boundary',
  'assignment-submission-validation-boundary',
  'scored-attempt-result-boundary',
  'answer-feedback-lifecycle-boundary',
  'assignment-attempt-duration-boundary',
  'teacher-result-review-boundary',
  'result-accepted-answer-boundary',
  'csv-export-boundary',
  'result-explanation-boundary',
  'teacher-result-copy-lifecycle-boundary',
  'teacher-workspace-operations-boundary',
  'worksheet-mode-delivery-boundary',
  'public-discovery-indexing-boundary',
  'assignment-distribution-lifecycle-boundary',
  'assignment-attempt-stats-boundary',
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
  assignmentPublishFreezesSnapshots: true;
  assignmentPublishRequiresActivityLifecycleGate: true;
  assignmentPublishResolvesSettingsBeforePersist: true;
  assignmentPublishValidatesDraftBeforePersist: true;
  blocksClosedOrExpiredSubmissions: true;
  blocksDraftPublicAccess: true;
  chainSourceFileCount: number;
  changesAttemptsOrResults: false;
  changesPublicRunner: false;
  submissionContractUsesRuntimeItemAnswerRows: true;
  copyArtifactsUseFormattedDates: true;
  copyArtifactsUseFormattedExplanations: true;
  countsStarterPreviewAsOwned: false;
  createsAssignments: false;
  createsParallelWorksheetModel: false;
  exposesDerivativeDraftPayloads: false;
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
  exposesAnswerKeys: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesAssignmentRuntimeContent: false;
  exposesAnonymousBrowserLabel: true;
  exposesAcceptedAlternativesToTeachersOnly: true;
  exposesAcceptedAlternativesAfterReview: true;
  exposesAcceptedAnswerTextInHandoff: false;
  exposesAcceptedAnswers: false;
  exposesActivityContentJsonToPublicPayload: false;
  exposesActivityContentJson: false;
  exposesInternalActivityIds: false;
  exposesInternalAssignmentIds: false;
  exposesInternalAssignmentIdsInLifecycleHandoff: false;
  exposesAssignmentTitle: false;
  exposesAuthSecrets: false;
  exposesAnonymousToken: false;
  exposesAnswerKeyTextInHandoff: false;
  exposesAnswerKeysBeforeReview: false;
  exposesAnswerKeysToPublicRunner: false;
  exposesAnswerKeysBeforeAllowedReview: false;
  exposesChoiceTextInHandoff: false;
  exposesCopyArtifactText: false;
  exposesCsvDataUrl: false;
  exposesCsvFilename: false;
  exposesCsvDataUrlInHandoff: false;
  exposesPrivateActivityContent: false;
  exposesProviderSecrets: false;
  exposesRawSettingsJson: false;
  exposesRawStartedAt: false;
  exposesRawAnonymousTokens: false;
  exposesRawStudentIdentity: false;
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
  exposesStudentAnswerTextInLifecycleHandoff: false;
  exposesStudentInstructions: false;
  exposesStudentLabelsInHandoff: false;
  exposesStudentDisplayLabels: false;
  exposesStudentName: false;
  exposesStudentNameInputValues: false;
  exposesStudentNames: false;
  exposesStudentNamesInFeedbackHandoff: false;
  exposesStudentNamesInHandoff: false;
  exposesStudentNamesInLifecycleHandoff: false;
  exposesStudentResponseTextInHandoff: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherAnswerKey: false;
  exposesTeacherAnswerText: false;
  exposesTeacherAnswerKeysInIdentityHandoff: false;
  exposesTeacherAnswerTextInHandoff: false;
  exposesTeacherEmail: false;
  exposesTeacherExplanationsBeforeReview: false;
  exposesTeacherExplanationTextInHandoff: false;
  exposesTeacherNotes: false;
  exposesShareSlug: false;
  exposesRawAnonymousTokensInHandoff: false;
  exposesPublicShareSlugsInLifecycleHandoff: false;
  exposesRawAnonymousTokensInLifecycleHandoff: false;
  exposesRawCopyArtifactTextInHandoff: false;
  exportPreparationScope: 'full-assignment-results';
  exportIncludesSubmittedDateColumns: true;
  freezesAssignmentSnapshots: true;
  freezesSnapshotContent: true;
  includesAssignmentListSearch: true;
  includesPrintableWorksheet: true;
  includesResultsExport: true;
  itemIds: ClassroomProductLoopChainHandoffItemId[];
  preservesFrozenSnapshots: true;
  preservesAttemptsAfterClose: true;
  preservesSnapshotsAfterClose: true;
  requiresTeacherSaveBeforeActivityPersistence: true;
  keepsSourceMaterialExtractionEditorReviewed: true;
  archivedActivitiesRequireRestoreBeforeDerive: true;
  attemptPersistenceKeepsSourceMaterialsOutOfRows: true;
  attemptPersistenceUsesAttemptLimitGate: true;
  attemptPersistenceUsesIdentityGate: true;
  attemptPersistenceUsesImmutableAnswerCopy: true;
  attemptPersistenceUsesImmutableResultCopy: true;
  attemptPersistenceUsesLifecycleGate: true;
  attemptPersistenceUsesRuntimeValidationGate: true;
  keepsProtectedRoutesOutOfIndex: true;
  keepsPublicDiscoverySourceLevel: true;
  keepsActivityLibraryOwnerScoped: true;
  keepsLiveActivityFallback: true;
  keepsExpiredReopenBlocked: true;
  keepsAssignmentListOwnerScoped: true;
  keepsDashboardOwnerScoped: true;
  keepsCsvExportFullAssignment: true;
  keepsTemplateRoadmapOnSharedActivityModel: true;
  keepsSettingsFromMutatingClassroomData: true;
  keepsVisiblePageCountsSeparate: true;
  keepsNameAndTokenModesExclusive: true;
  mutatesAttemptsFromValidationHandoff: false;
  mutatesAttempts: false;
  mutatesEvaluationAfterInsert: false;
  mutatesResultData: false;
  mutatesPublicRunner: false;
  partialSubmissionAllowed: true;
  persistenceUsesNormalizedAnswers: true;
  printableAnswerKeysUseFormattedExplanations: true;
  printRouteRequiresTeacherAuth: true;
  preservesTeacherResultEvidence: true;
  persistsAttemptsAfterValidation: true;
  publishesAssignmentAndSnapshotTogether: true;
  publicRulesDoNotMutateAssignment: true;
  publicRulesHideRuntimeContent: true;
  publicRulesHideTeacherSettings: true;
  publicRulesUseResolvedSettings: true;
  publicFeedbackRespectsAnswerReveal: true;
  publicPayloadUsesRuntimeItemsOnly: true;
  publicPayloadUsesSanitizedRuntimeItems: true;
  publicUnavailablePayloadHidesRuntime: true;
  publicResponseUsesSanitizedScoredResult: true;
  publicStudentRunnerPayloadUsesSanitizedRuntimeItems: true;
  rejectsClosedOrExpiredStudentRunnerSubmissions: true;
  rejectsDuplicateAnswerIds: true;
  rejectsInvalidSubmissions: true;
  rejectsOverlongAnswerRows: true;
  rejectsUnknownRuntimeIds: true;
  readsBrowserStorage: false;
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
  requiresAssignmentSnapshotBoundary: true;
  requiresCreateActivityInputContract: true;
  requiresNormalizedAnonymousTokens: true;
  requiresNormalizedStudentNames: true;
  requiresOwnerScopedActivities: true;
  requiresOwnerScopedAssignments: true;
  requiresOwnerScopedAssignment: true;
  requiresOwnerScopedAssignmentList: true;
  requiresOwnerScopedTeacherQueries: true;
  resultConsumersUseNormalizedIdentity: true;
  resultConsumersUseScoredAttempts: true;
  runtimeScoringUsesSharedMatcher: true;
  scoringUsesSharedAcceptedAnswerParser: true;
  scoringUsesNormalizedAnswers: true;
  sourceFiles: string[];
  splitsPrimaryFromAlternatives: true;
  storesImmutableScoredAttemptAnswerJson: true;
  storesImmutableScoredAttemptResultJson: true;
  storesScoredAttemptRows: true;
  statusFiltersUseLifecycleStatus: true;
  usesAiEnhancementLifecycleChain: true;
  usesActivityAuthoringLibraryChain: true;
  usesActivityAssignmentAttemptResultsLoop: true;
  usesActivityLifecycleGovernanceChain: true;
  usesAccountGovernanceLifecycleChain: true;
  usesActiveSurfaceProductBoundary: true;
  usesAnswerFeedbackLifecycleChain: true;
  usesAssignmentPublishHandoff: true;
  usesAssignmentAttemptPersistenceHandoff: true;
  usesAssignmentAttemptDurationHandoff: true;
  usesAssignmentAttemptStatsHandoff: true;
  usesAssignmentSubmissionValidationHandoff: true;
  usesAssignmentSourceActivityContextChain: true;
  usesAssignmentLifecycleGovernanceChain: true;
  usesAssignmentDistributionLifecycleChain: true;
  usesClassroomDataLifecycleChain: true;
  usesD1AppSchema: true;
  usesAssignmentDomainHelpers: true;
  usesPublishedAssignmentDeliveryChain: true;
  usesPublicAssignmentRulesHandoff: true;
  usesPublicDiscoveryIndexingChain: true;
  usesAssignmentResultsExportPreparation: true;
  usesBrowserTokenForAnonymousAttempts: true;
  usesAbsoluteStudentUrl: true;
  usesDisplayLabelsForAnonymousResults: true;
  usesFullFilteredSummariesForOverview: true;
  usesFrozenSnapshotSource: true;
  usesFrozenSourceActivityContext: true;
  usesActivityLibraryPageHandoff: true;
  usesOwnerScopedSourceFilters: true;
  usesNormalizedShareSlug: true;
  usesPreparedShareActions: true;
  usesPaymentCallbackHandoff: true;
  usesPrintableWorksheetReviewLifecycleChain: true;
  usesWorksheetModeDeliveryChain: true;
  usesResultAcceptedAnswerChain: true;
  usesResultExplanationChain: true;
  usesResultSubmittedDateChain: true;
  usesScoredAttemptResultChain: true;
  usesSharedAttemptStats: true;
  usesSharedDurationFormatting: true;
  usesSharedDurationHelpers: true;
  usesSourceExtractionLifecycleChain: true;
  usesStudentRuntimeIdentityHandoff: true;
  usesStudentRunnerPlayChain: true;
  usesTemplateRoadmapCapabilityChain: true;
  usesTeacherOnlyResultScope: true;
  usesCurrentReviewScopeForCopyActions: true;
  usesSharedCopyArtifactBuilders: true;
  usesSharedCopyPlan: true;
  usesSharedDeliveryPolicy: true;
  usesSharedRuntimeItems: true;
  usesSharedAttemptAnswerHelpers: true;
  usesScoredAttemptInsertHelper: true;
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
      'Thirty-slice Activity -> Assignment -> Attempt -> Results classroom product loop from teacher-owned activities and reusable content through classroom data lifecycle, activity authoring/library workflow, source extraction lifecycle boundaries, activity lifecycle governance, template roadmap capability alignment, AI enhancement lifecycle review, published assignment delivery, assignment publish preflight boundary, assignment lifecycle governance, assignment distribution lifecycle, public assignment rules boundary, student runner play, student identity lifecycle, student runtime identity boundary, assignment submission validation boundary, assignment attempt persistence boundary, scored attempt results, assignment attempt stats, answer feedback lifecycle, assignment attempt duration, submitted-date continuity, accepted-answer continuity, and explanation continuity, teacher review, teacher result copy lifecycle, worksheet-mode delivery, printable worksheet review lifecycle, copy/export/print handoffs, teacher workspace operations, public discovery/indexing metadata, and privacy guards.',
    itemViews,
    privacy: {
      appendsCopyScopeToArtifacts: true,
      apiNormalizesAnswersBeforeValidation: true,
      apiValidatesBeforeScoring: true,
      answerKeyHiddenByDefault: true,
      assignmentPublishFreezesSnapshots: true,
      assignmentPublishRequiresActivityLifecycleGate: true,
      assignmentPublishResolvesSettingsBeforePersist: true,
      assignmentPublishValidatesDraftBeforePersist: true,
      blocksClosedOrExpiredSubmissions: true,
      blocksDraftPublicAccess: true,
      chainSourceFileCount: CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length,
      changesAttemptsOrResults: false,
      changesPublicRunner: false,
      submissionContractUsesRuntimeItemAnswerRows: true,
      clientPayloadUsesRuntimeItems: true,
      clientProgressUsesRuntimeItems: true,
      copyArtifactsUseFormattedDates: true,
      copyArtifactsUseFormattedExplanations: true,
      countsStarterPreviewAsOwned: false,
      createsAssignments: false,
      createsParallelWorksheetModel: false,
      exposesDerivativeDraftPayloads: false,
      createsParallelWorksheetTables: false,
      csvExportsUseSharedAnswerView: true,
      csvExportsUseFormattedExplanations: true,
      csvFormulaInjectionGuardEnabled: true,
      createsAssignmentLinksWithoutTeacherAction: false,
      csvDatesUseIsoFormatter: true,
      deliveryPolicyResolvedBeforeAssignmentSurfaces: true,
      emptyAnswersOmitted: true,
      exposesAnswerText: false,
      exposesAnswerKeys: false,
      exposesAnswerKeysToPublicPayload: false,
      exposesAssignmentRuntimeContent: false,
      exposesAnonymousBrowserLabel: true,
      exposesAcceptedAlternativesToTeachersOnly: true,
      exposesAcceptedAlternativesAfterReview: true,
      exposesAcceptedAnswerTextInHandoff: false,
      exposesAcceptedAnswers: false,
      exposesActivityContentJsonToPublicPayload: false,
      exposesActivityContentJson: false,
      exposesInternalActivityIds: false,
      exposesInternalAssignmentIds: false,
      exposesInternalAssignmentIdsInLifecycleHandoff: false,
      exposesAssignmentTitle: false,
      exposesAuthSecrets: false,
      exposesAnonymousToken: false,
      exposesAnswerKeyTextInHandoff: false,
      exposesAnswerKeysBeforeReview: false,
      exposesAnswerKeysToPublicRunner: false,
      exposesAnswerKeysBeforeAllowedReview: false,
      exposesChoiceTextInHandoff: false,
      exposesCopyArtifactText: false,
      exposesCsvDataUrl: false,
      exposesCsvFilename: false,
      exposesCsvDataUrlInHandoff: false,
      exposesPrivateActivityContent: false,
      exposesProviderSecrets: false,
      exposesRawSettingsJson: false,
      exposesRawStartedAt: false,
      exposesRawAnonymousTokens: false,
      exposesRawStudentIdentity: false,
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
      exposesStudentAnswerTextInLifecycleHandoff: false,
      exposesStudentInstructions: false,
      exposesStudentLabelsInHandoff: false,
      exposesStudentDisplayLabels: false,
      exposesStudentName: false,
      exposesStudentNameInputValues: false,
      exposesStudentNames: false,
      exposesStudentNamesInFeedbackHandoff: false,
      exposesStudentNamesInHandoff: false,
      exposesStudentNamesInLifecycleHandoff: false,
      exposesStudentResponseTextInHandoff: false,
      exposesTeacherOnlyAnswers: false,
      exposesTeacherAnswerKey: false,
      exposesTeacherAnswerText: false,
      exposesTeacherAnswerKeysInIdentityHandoff: false,
      exposesTeacherAnswerTextInHandoff: false,
      exposesTeacherEmail: false,
      exposesTeacherExplanationsBeforeReview: false,
      exposesTeacherExplanationTextInHandoff: false,
      exposesTeacherNotes: false,
      exposesShareSlug: false,
      exposesRawAnonymousTokensInHandoff: false,
      exposesPublicShareSlugsInLifecycleHandoff: false,
      exposesRawAnonymousTokensInLifecycleHandoff: false,
      exposesRawCopyArtifactTextInHandoff: false,
      exportPreparationScope: 'full-assignment-results',
      exportIncludesSubmittedDateColumns: true,
      freezesAssignmentSnapshots: true,
      freezesSnapshotContent: true,
      includesAssignmentListSearch: true,
      includesPrintableWorksheet: true,
      includesResultsExport: true,
      itemIds: [...CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS],
      preservesFrozenSnapshots: true,
      preservesAttemptsAfterClose: true,
      preservesSnapshotsAfterClose: true,
      requiresTeacherSaveBeforeActivityPersistence: true,
      keepsSourceMaterialExtractionEditorReviewed: true,
      archivedActivitiesRequireRestoreBeforeDerive: true,
      attemptPersistenceKeepsSourceMaterialsOutOfRows: true,
      attemptPersistenceUsesAttemptLimitGate: true,
      attemptPersistenceUsesIdentityGate: true,
      attemptPersistenceUsesImmutableAnswerCopy: true,
      attemptPersistenceUsesImmutableResultCopy: true,
      attemptPersistenceUsesLifecycleGate: true,
      attemptPersistenceUsesRuntimeValidationGate: true,
      keepsProtectedRoutesOutOfIndex: true,
      keepsPublicDiscoverySourceLevel: true,
      keepsActivityLibraryOwnerScoped: true,
      keepsLiveActivityFallback: true,
      keepsExpiredReopenBlocked: true,
      keepsAssignmentListOwnerScoped: true,
      keepsDashboardOwnerScoped: true,
      keepsCsvExportFullAssignment: true,
      keepsTemplateRoadmapOnSharedActivityModel: true,
      keepsSettingsFromMutatingClassroomData: true,
      keepsVisiblePageCountsSeparate: true,
      keepsNameAndTokenModesExclusive: true,
      mutatesAttemptsFromValidationHandoff: false,
      mutatesAttempts: false,
      mutatesEvaluationAfterInsert: false,
      mutatesResultData: false,
      mutatesPublicRunner: false,
      partialSubmissionAllowed: true,
      persistenceUsesNormalizedAnswers: true,
      printableAnswerKeysUseFormattedExplanations: true,
      printRouteRequiresTeacherAuth: true,
      preservesTeacherResultEvidence: true,
      persistsAttemptsAfterValidation: true,
      publishesAssignmentAndSnapshotTogether: true,
      publicRulesDoNotMutateAssignment: true,
      publicRulesHideRuntimeContent: true,
      publicRulesHideTeacherSettings: true,
      publicRulesUseResolvedSettings: true,
      publicFeedbackRespectsAnswerReveal: true,
      publicPayloadUsesRuntimeItemsOnly: true,
      publicPayloadUsesSanitizedRuntimeItems: true,
      publicUnavailablePayloadHidesRuntime: true,
      publicResponseUsesSanitizedScoredResult: true,
      publicStudentRunnerPayloadUsesSanitizedRuntimeItems: true,
      rejectsClosedOrExpiredStudentRunnerSubmissions: true,
      rejectsDuplicateAnswerIds: true,
      rejectsInvalidSubmissions: true,
      rejectsOverlongAnswerRows: true,
      rejectsUnknownRuntimeIds: true,
      readsBrowserStorage: false,
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
      requiresAssignmentSnapshotBoundary: true,
      requiresCreateActivityInputContract: true,
      requiresNormalizedAnonymousTokens: true,
      requiresNormalizedStudentNames: true,
      requiresOwnerScopedActivities: true,
      requiresOwnerScopedAssignments: true,
      requiresOwnerScopedAssignment: true,
      requiresOwnerScopedAssignmentList: true,
      requiresOwnerScopedTeacherQueries: true,
      resultConsumersUseNormalizedIdentity: true,
      resultConsumersUseScoredAttempts: true,
      runtimeScoringUsesSharedMatcher: true,
      scoringUsesSharedAcceptedAnswerParser: true,
      scoringUsesNormalizedAnswers: true,
      sourceFiles: [...CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES],
      splitsPrimaryFromAlternatives: true,
      storesImmutableScoredAttemptAnswerJson: true,
      storesImmutableScoredAttemptResultJson: true,
      storesScoredAttemptRows: true,
      statusFiltersUseLifecycleStatus: true,
      usesAiEnhancementLifecycleChain: true,
      usesActivityAuthoringLibraryChain: true,
      usesActivityAssignmentAttemptResultsLoop: true,
      usesActivityLifecycleGovernanceChain: true,
      usesAccountGovernanceLifecycleChain: true,
      usesActiveSurfaceProductBoundary: true,
      usesAnswerFeedbackLifecycleChain: true,
      usesAssignmentPublishHandoff: true,
      usesAssignmentAttemptPersistenceHandoff: true,
      usesAssignmentAttemptDurationHandoff: true,
      usesAssignmentAttemptStatsHandoff: true,
      usesAssignmentSubmissionValidationHandoff: true,
      usesAssignmentSourceActivityContextChain: true,
      usesAssignmentLifecycleGovernanceChain: true,
      usesAssignmentDistributionLifecycleChain: true,
      usesClassroomDataLifecycleChain: true,
      usesD1AppSchema: true,
      usesAssignmentDomainHelpers: true,
      usesPublishedAssignmentDeliveryChain: true,
      usesPublicAssignmentRulesHandoff: true,
      usesPublicDiscoveryIndexingChain: true,
      usesAssignmentResultsExportPreparation: true,
      usesBrowserTokenForAnonymousAttempts: true,
      usesAbsoluteStudentUrl: true,
      usesDisplayLabelsForAnonymousResults: true,
      usesFullFilteredSummariesForOverview: true,
      usesFrozenSnapshotSource: true,
      usesFrozenSourceActivityContext: true,
      usesActivityLibraryPageHandoff: true,
      usesOwnerScopedSourceFilters: true,
      usesNormalizedShareSlug: true,
      usesPreparedShareActions: true,
      usesPaymentCallbackHandoff: true,
      usesPrintableWorksheetReviewLifecycleChain: true,
      usesWorksheetModeDeliveryChain: true,
      usesResultAcceptedAnswerChain: true,
      usesResultExplanationChain: true,
      usesResultSubmittedDateChain: true,
      usesScoredAttemptResultChain: true,
      usesSharedAttemptStats: true,
      usesSharedDurationFormatting: true,
      usesSharedDurationHelpers: true,
      usesSourceExtractionLifecycleChain: true,
      usesStudentRuntimeIdentityHandoff: true,
      usesStudentRunnerPlayChain: true,
      usesTemplateRoadmapCapabilityChain: true,
      usesTeacherOnlyResultScope: true,
      usesCurrentReviewScopeForCopyActions: true,
      usesSharedCopyArtifactBuilders: true,
      usesSharedCopyPlan: true,
      usesSharedDeliveryPolicy: true,
      usesSharedRuntimeItems: true,
      usesSharedAttemptAnswerHelpers: true,
      usesScoredAttemptInsertHelper: true,
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
    case 'assignment-lifecycle-governance-boundary':
      return item(
        id,
        'Assignment lifecycle governance boundary',
        '30 assignment lifecycle slices',
        'Draft, open, closed, and expired status resolution, close and reopen transitions, owner-scoped filters, public access, submission gates, result and snapshot retention, and lifecycle privacy guards stay aligned.'
      );
    case 'assignment-source-activity-context-boundary':
      return item(
        id,
        'Assignment source activity context boundary',
        '30 source context slices',
        'Snapshot freezing, current and frozen source search, sanitized public summaries, result context, CSV columns, printable fields, live fallback, and source-context privacy guards stay aligned.'
      );
    case 'classroom-data-lifecycle-boundary':
      return item(
        id,
        'Classroom data lifecycle boundary',
        '30 data slices',
        'D1 app schema, owner-scoped activity and assignment persistence, frozen snapshots, sanitized public payloads, scored attempts, result consumers, exports, printable worksheets, and data privacy guards stay aligned.'
      );
    case 'activity-library-page-boundary':
      return item(
        id,
        'Activity library page boundary',
        '30 library slices',
        'Owner scope, full filtered summaries, visible-page counts, search, status, template and source filters, lifecycle actions, pagination, starter previews, and source-material privacy guards stay aligned.'
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
    case 'assignment-publish-preflight-boundary':
      return item(
        id,
        'Assignment publish preflight boundary',
        '30 publish slices',
        'Publish access, activity lifecycle gates, draft validation, field limits, delivery defaults, attempts, timers, close times, settings JSON, snapshot freeze, public payload, results policy, and privacy guards stay aligned before persist.'
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
    case 'public-assignment-rules-boundary':
      return item(
        id,
        'Public assignment rules boundary',
        '30 rule slices',
        'Visible rule panels, status badges, item counts, attempts, timers, close times, identity, review behavior, item order, timer start, public payload, runtime-content, teacher-settings, answer-key, and privacy guards stay aligned.'
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
    case 'assignment-attempt-persistence-boundary':
      return item(
        id,
        'Assignment attempt persistence boundary',
        '30 persistence slices',
        'Lifecycle, identity, attempt-limit, and runtime-validation gates, buildScoredAttemptInsert, stored ids/timestamps/identity, cloned answer/result JSON, score/max/duration sources, public/review/analysis/stats/export consumers, and privacy guards stay aligned.'
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
    case 'assignment-attempt-duration-boundary':
      return item(
        id,
        'Assignment attempt duration boundary',
        '30 duration slices',
        'Duration units, timer normalization, rounding, caps, invalid-value guards, runner clocks, expiry controls, submission persistence, result displays, analysis, exports, and duration privacy guards stay aligned.'
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
    case 'worksheet-mode-delivery-boundary':
      return item(
        id,
        'Worksheet-mode delivery boundary',
        '30 worksheet slices',
        'Public worksheet creation, shared editor scaffolds, source provenance, assignment snapshots, four worksheet runtimes, submission, duration, feedback, teacher print routes, result exports, and worksheet privacy guards stay aligned.'
      );
    case 'public-discovery-indexing-boundary':
      return item(
        id,
        'Public discovery indexing boundary',
        '30 discovery slices',
        'Public entry routes, sitemap, robots, manifest, legacy route retirement, public DOM handoff blocking, and privacy/indexing guards stay aligned.'
      );
    case 'assignment-distribution-lifecycle-boundary':
      return item(
        id,
        'Assignment distribution lifecycle boundary',
        '30 distribution slices',
        'Post-publish context, owner-scoped published lookup, normalized share links, copy feedback, student preview, printable worksheet, result actions, list-card parity, and distribution privacy guards stay aligned.'
      );
    case 'assignment-attempt-stats-boundary':
      return item(
        id,
        'Assignment attempt stats boundary',
        '30 stats slices',
        'Completed-attempt filtering, average accuracy, points and duration, numeric guards, empty states, result metrics, assignment summaries, classroom briefs, copy artifacts, CSV exports, and stats privacy guards stay aligned.'
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
