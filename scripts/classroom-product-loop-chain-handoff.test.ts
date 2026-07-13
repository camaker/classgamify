import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES,
} from '@/activities/ai-authoring-chain';
import {
  ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS,
  ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/activities/ai-enhancement-lifecycle-chain';
import {
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES,
} from '@/activities/authoring-library-chain';
import { ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS } from '@/activities/library-view';
import {
  ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES,
} from '@/activities/activity-lifecycle-governance-chain';
import {
  SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/activities/source-extraction-lifecycle-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import {
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS,
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES,
} from '@/activities/template-roadmap-capability-chain';
import {
  ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/assignments/answer-feedback-lifecycle-chain';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';
import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';
import {
  ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/assignments/assignment-distribution-lifecycle-chain';
import {
  ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES,
} from '@/assignments/assignment-lifecycle-governance-chain';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS } from '@/assignments/submission-validation-handoff';
import { ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/source-activity-context-chain';
import {
  PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/assignments/printable-worksheet-review-lifecycle-chain';
import {
  WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES,
} from '@/assignments/worksheet-mode-delivery-chain';
import {
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES,
} from '@/assignments/published-assignment-delivery-chain';
import { PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS } from '@/assignments/delivery-summary';
import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';
import {
  ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES,
} from '@/assignments/result-accepted-answer-chain';
import {
  ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES,
} from '@/assignments/result-explanation-chain';
import {
  ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES,
} from '@/assignments/result-submitted-date-chain';
import {
  SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS,
  SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES,
} from '@/assignments/scored-attempt-result-chain';
import { STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/runtime-identity-handoff';
import {
  STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/assignments/student-identity-lifecycle-chain';
import {
  STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES,
} from '@/assignments/student-runner-play-chain';
import {
  TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/assignments/teacher-result-copy-lifecycle-chain';
import {
  TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES,
} from '@/assignments/teacher-results-review-chain';
import {
  CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS,
  CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES,
  buildClassroomProductLoopChainHandoffView,
  type ClassroomProductLoopChainHandoffItemId,
  type ClassroomProductLoopChainHandoffView,
} from '@/config/classroom-product-loop-chain';
import { CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS } from '@/config/classroom-trust-communication-chain';
import {
  CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/db/classroom-data-lifecycle-chain';
import { DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS } from '@/dashboard/overview';
import {
  TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES,
} from '@/dashboard/teacher-workspace-operations-chain';
import { HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS } from '@/pages/public-page-view';
import {
  PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS,
  PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES,
} from '@/seo/public-discovery-indexing-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const NORMALIZED_PRODUCT_SOURCE = PRODUCT_SOURCE.replace(/\s+/g, ' ');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const NORMALIZED_TEST_CATALOG_SOURCE = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

const PRIVATE_ACTIVITY_CONTENT = 'SECRET_PRODUCT_LOOP_ACTIVITY_CONTENT';
const PRIVATE_ANSWER_KEY = 'SECRET_PRODUCT_LOOP_ANSWER_KEY';
const PRIVATE_CSV_DATA_URL = 'data:text/csv;charset=utf-8,SECRET_LOOP';
const PRIVATE_RAW_SUBMISSION = 'SECRET_PRODUCT_LOOP_RAW_SUBMISSION';
const PRIVATE_RESULT_EXPORT_ROW = 'SECRET_PRODUCT_LOOP_RESULT_EXPORT_ROW';
const PRIVATE_RUNTIME_ITEM_ID = 'SECRET_PRODUCT_LOOP_RUNTIME_ITEM_ID';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/product-loop.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_PRODUCT_LOOP_STUDENT_ANSWER';
const PRIVATE_STUDENT_NAME = 'SECRET_PRODUCT_LOOP_STUDENT_NAME';
const PRIVATE_STUDENT_TOKEN = 'SECRET_PRODUCT_LOOP_RAW_TOKEN';

test('classroom product loop chain exposes 30 safe product slices', () => {
  const handoffView = buildClassroomProductLoopChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Classroom product loop chain');
  assert.match(
    handoffView.description,
    /Thirty-slice Activity -> Assignment -> Attempt -> Results classroom product loop/
  );
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
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
    itemIds,
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
  });
  assertNoPrivateProductLoopText(JSON.stringify(handoffView));
});

test('classroom product loop chain summarizes activity to results flow', () => {
  const handoffView = buildClassroomProductLoopChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      [
        'assignment-lifecycle-governance-boundary',
        '30 assignment lifecycle slices',
      ],
      [
        'assignment-source-activity-context-boundary',
        '30 source context slices',
      ],
      ['classroom-data-lifecycle-boundary', '30 data slices'],
      ['activity-library-page-boundary', '30 library slices'],
      ['activity-authoring-library-boundary', '30 authoring slices'],
      ['template-roadmap-capability-boundary', '30 roadmap slices'],
      ['ai-enhancement-lifecycle-boundary', 'Policy-to-publish review'],
      ['source-extraction-lifecycle-boundary', '30 extraction slices'],
      ['activity-lifecycle-governance-boundary', '30 lifecycle slices'],
      ['published-assignment-delivery-boundary', '30 delivery slices'],
      ['assignment-publish-preflight-boundary', '30 publish slices'],
      ['student-runner-play-boundary', '30 runner slices'],
      ['public-assignment-rules-boundary', '30 rule slices'],
      ['student-identity-lifecycle-boundary', '30 identity slices'],
      ['student-runtime-identity-boundary', '30 runtime identity slices'],
      ['assignment-attempt-persistence-boundary', '30 persistence slices'],
      ['assignment-submission-validation-boundary', '30 validation slices'],
      ['scored-attempt-result-boundary', '30 result slices'],
      ['answer-feedback-lifecycle-boundary', '30 feedback slices'],
      ['assignment-attempt-duration-boundary', '30 duration slices'],
      ['teacher-result-review-boundary', '30 review slices'],
      ['result-accepted-answer-boundary', '30 answer slices'],
      ['csv-export-boundary', '30 export slices'],
      ['result-explanation-boundary', '30 explanation slices'],
      ['teacher-result-copy-lifecycle-boundary', '30 copy slices'],
      ['teacher-workspace-operations-boundary', '30 workspace slices'],
      ['worksheet-mode-delivery-boundary', '30 worksheet slices'],
      ['public-discovery-indexing-boundary', '30 discovery slices'],
      ['assignment-distribution-lifecycle-boundary', '30 distribution slices'],
      ['assignment-attempt-stats-boundary', '30 stats slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-runtime-identity-boundary'),
    '30 runtime identity slices'
  );
});

test('classroom product loop chain is backed by adjacent focused gates', () => {
  assert.equal(CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing classroom product loop chain source ${filePath}`
    );
  }

  assert.deepEqual(
    [
      HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS.length,
      DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS.length,
      TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES.length,
      CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length,
      ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length,
      TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS.length,
      TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES.length,
      ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length,
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length,
      PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES.length,
      STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS.length,
      ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.length,
      SCORED_ATTEMPT_RESULT_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES.length,
      PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES.length,
      CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 60 }, () => 30)
  );
});

test('classroom product loop chain is documented in product and catalog', () => {
  assert.match(
    PRODUCT_SOURCE,
    /ClassGamify is a teacher-first activity and assignment platform[\s\S]*teachers create reusable activity content[\s\S]*publish assignments[\s\S]*review student attempts/,
    'docs/product.md should define the teacher-first product loop.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Activity -> Assignment -> Attempt -> Results/,
    'docs/product.md should keep the explicit classroom loop sequence.'
  );
  assert.match(
    NORMALIZED_PRODUCT_SOURCE,
    /src\/config\/classroom-product-loop-chain\.ts` owns the cross-surface product-loop handoff[\s\S]*teacher-owned activities[\s\S]*assignment source activity context boundary[\s\S]*classroom data lifecycle[\s\S]*activity library page boundary[\s\S]*activity authoring\/library[\s\S]*source extraction lifecycle[\s\S]*activity lifecycle governance[\s\S]*template roadmap capability[\s\S]*AI enhancement lifecycle[\s\S]*published assignment delivery[\s\S]*assignment publish preflight boundary[\s\S]*assignment lifecycle governance boundary[\s\S]*assignment distribution lifecycle boundary[\s\S]*public assignment rules boundary[\s\S]*student runner play[\s\S]*student identity lifecycle[\s\S]*student runtime identity boundary[\s\S]*assignment submission validation boundary[\s\S]*assignment attempt persistence boundary[\s\S]*scored attempt results[\s\S]*assignment attempt stats boundary[\s\S]*answer feedback lifecycle[\s\S]*assignment attempt duration boundary[\s\S]*submitted-date continuity[\s\S]*accepted-answer continuity[\s\S]*explanation continuity[\s\S]*teacher result review[\s\S]*teacher result copy lifecycle[\s\S]*worksheet-mode delivery boundary[\s\S]*printable worksheet review lifecycle[\s\S]*copy\/export\/print handoffs[\s\S]*teacher workspace operations[\s\S]*public discovery\/indexing[\s\S]*privacy guards/,
    'docs/product.md should document the classroom product loop chain owner.'
  );
  assert.match(
    NORMALIZED_TEST_CATALOG_SOURCE,
    /Classroom product loop chain has a fast script-level gate via[\s\S]*scripts\/classroom-product-loop-chain-handoff\.test\.ts[\s\S]*Activity -> Assignment -> Attempt -> Results[\s\S]*assignment source activity context boundary[\s\S]*classroom data lifecycle[\s\S]*activity library page boundary[\s\S]*activity authoring\/library workflow[\s\S]*source extraction lifecycle[\s\S]*activity lifecycle governance[\s\S]*template roadmap capability[\s\S]*AI enhancement lifecycle[\s\S]*published assignment delivery[\s\S]*assignment publish preflight boundary[\s\S]*assignment lifecycle governance boundary[\s\S]*assignment distribution lifecycle boundary[\s\S]*public assignment rules boundary[\s\S]*student runner play[\s\S]*student identity lifecycle[\s\S]*student runtime identity boundary[\s\S]*assignment submission validation boundary[\s\S]*assignment attempt persistence boundary[\s\S]*scored attempt results[\s\S]*assignment attempt stats boundary[\s\S]*answer feedback lifecycle[\s\S]*assignment attempt duration boundary[\s\S]*submitted-date continuity[\s\S]*accepted-answer continuity[\s\S]*explanation continuity[\s\S]*teacher result review[\s\S]*teacher result copy lifecycle[\s\S]*worksheet-mode delivery boundary[\s\S]*printable worksheet review lifecycle[\s\S]*copy\/export\/print handoffs[\s\S]*teacher workspace operations[\s\S]*public discovery[\s\S]*privacy guards/,
    'TEST-CATALOG should document the classroom product loop chain gate.'
  );
});

function getHandoffValue(
  view: ClassroomProductLoopChainHandoffView,
  id: ClassroomProductLoopChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing classroom product loop chain item ${id}`);
  return item.value;
}

function assertNoPrivateProductLoopText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ANSWER_KEY,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_RAW_SUBMISSION,
    PRIVATE_RESULT_EXPORT_ROW,
    PRIVATE_RUNTIME_ITEM_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Classroom product loop chain leaked private text: ${privateValue}`
    );
  }
}
