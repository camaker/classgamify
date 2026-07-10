export const CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS = [
  'product-loop-contract',
  'activity-model',
  'activity-content-contract',
  'activity-library-owner-scope',
  'activity-authoring-library-boundary',
  'template-roadmap-capability-boundary',
  'ai-enhancement-lifecycle-boundary',
  'source-extraction-lifecycle-boundary',
  'activity-lifecycle-governance-boundary',
  'published-assignment-delivery-boundary',
  'assignment-snapshot-freeze',
  'share-link-distribution',
  'student-runner-play-boundary',
  'public-rules-summary',
  'student-identity-boundary',
  'runtime-item-contract',
  'progress-submit-readiness',
  'submission-validation',
  'scored-attempt-result-boundary',
  'answer-feedback-policy',
  'result-submitted-date-boundary',
  'teacher-result-review-boundary',
  'result-accepted-answer-boundary',
  'csv-export-boundary',
  'result-explanation-boundary',
  'dashboard-loop-status',
  'teacher-workspace-routes',
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
  chainSourceFileCount: number;
  copyArtifactsUseFormattedDates: true;
  copyArtifactsUseFormattedExplanations: true;
  csvExportsUseSharedAnswerView: true;
  csvExportsUseFormattedExplanations: true;
  csvFormulaInjectionGuardEnabled: true;
  createsAssignmentLinksWithoutTeacherAction: false;
  csvDatesUseIsoFormatter: true;
  deliveryPolicyResolvedBeforeAssignmentSurfaces: true;
  exposesAcceptedAlternativesToTeachersOnly: true;
  exposesActivityContentJsonToPublicPayload: false;
  exposesAssignmentTitle: false;
  exposesAnswerKeysToPublicRunner: false;
  exposesAnswerKeysBeforeAllowedReview: false;
  exposesCopyArtifactText: false;
  exposesCsvFilename: false;
  exposesCsvDataUrlInHandoff: false;
  exposesPrivateActivityContent: false;
  exposesRawAnonymousTokens: false;
  exposesRawAnonymousToken: false;
  exposesRawCopyArtifactsInHandoff: false;
  exposesRawCsvDataUrlInHandoff: false;
  exposesRawRuntimeItemIdsInHandoff: false;
  exposesRawSubmissionPayload: false;
  exposesResultExportRows: false;
  exposesRuntimeItemIdsInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesPromptText: false;
  exposesPromptTextInHandoff: false;
  exposesStudentAnswerText: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentInstructions: false;
  exposesStudentNamesInHandoff: false;
  exposesTeacherAnswerText: false;
  exposesTeacherAnswerTextInHandoff: false;
  exposesTeacherExplanationTextInHandoff: false;
  exportPreparationScope: 'full-assignment-results';
  exportIncludesSubmittedDateColumns: true;
  freezesAssignmentSnapshots: true;
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
  keepsTemplateRoadmapOnSharedActivityModel: true;
  printableAnswerKeysUseFormattedExplanations: true;
  publicFeedbackRespectsAnswerReveal: true;
  publicPayloadUsesRuntimeItemsOnly: true;
  publicResponseUsesSanitizedScoredResult: true;
  publicStudentRunnerPayloadUsesSanitizedRuntimeItems: true;
  rejectsClosedOrExpiredStudentRunnerSubmissions: true;
  rejectsInvalidSubmissions: true;
  resultPagesUseSharedAnswerView: true;
  resultPagesUseFormattedExplanations: true;
  resultExportsIncludeDeliveryPolicy: true;
  resultSubmittedDateSortingUsesTimestampParsing: true;
  resultUiDatesUseLocalizedFormatter: true;
  requiresTeacherReviewForAiEnhancements: true;
  requiresTeacherReviewForAiDrafts: true;
  resultConsumersUseScoredAttempts: true;
  scoringUsesSharedAcceptedAnswerParser: true;
  sourceFiles: string[];
  splitsPrimaryFromAlternatives: true;
  storesImmutableScoredAttemptAnswerJson: true;
  storesImmutableScoredAttemptResultJson: true;
  usesAiEnhancementLifecycleChain: true;
  usesActivityAuthoringLibraryChain: true;
  usesActivityAssignmentAttemptResultsLoop: true;
  usesActivityLifecycleGovernanceChain: true;
  usesPublishedAssignmentDeliveryChain: true;
  usesPublicDiscoveryIndexingChain: true;
  usesAssignmentResultsExportPreparation: true;
  usesResultAcceptedAnswerChain: true;
  usesResultExplanationChain: true;
  usesResultSubmittedDateChain: true;
  usesScoredAttemptResultChain: true;
  usesSharedAttemptStats: true;
  usesSharedDurationFormatting: true;
  usesSourceExtractionLifecycleChain: true;
  usesStudentRunnerPlayChain: true;
  usesTemplateRoadmapCapabilityChain: true;
  usesTeacherOnlyResultScope: true;
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
      'Thirty-slice classroom product loop chain from teacher-owned activities and reusable content through activity authoring/library workflow, source extraction lifecycle boundaries, activity lifecycle governance, template roadmap capability alignment, AI enhancement lifecycle review, published assignment delivery, student runner play, validated attempts, scored attempt results, submitted-date continuity, accepted-answer continuity, and explanation continuity, teacher review, copy/export/print handoffs, dashboard status, public discovery/indexing metadata, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount: CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length,
      copyArtifactsUseFormattedDates: true,
      copyArtifactsUseFormattedExplanations: true,
      csvExportsUseSharedAnswerView: true,
      csvExportsUseFormattedExplanations: true,
      csvFormulaInjectionGuardEnabled: true,
      createsAssignmentLinksWithoutTeacherAction: false,
      csvDatesUseIsoFormatter: true,
      deliveryPolicyResolvedBeforeAssignmentSurfaces: true,
      exposesAcceptedAlternativesToTeachersOnly: true,
      exposesActivityContentJsonToPublicPayload: false,
      exposesAssignmentTitle: false,
      exposesAnswerKeysToPublicRunner: false,
      exposesAnswerKeysBeforeAllowedReview: false,
      exposesCopyArtifactText: false,
      exposesCsvFilename: false,
      exposesCsvDataUrlInHandoff: false,
      exposesPrivateActivityContent: false,
      exposesRawAnonymousTokens: false,
      exposesRawAnonymousToken: false,
      exposesRawCopyArtifactsInHandoff: false,
      exposesRawCsvDataUrlInHandoff: false,
      exposesRawRuntimeItemIdsInHandoff: false,
      exposesRawSubmissionPayload: false,
      exposesResultExportRows: false,
      exposesRuntimeItemIdsInHandoff: false,
      exposesSourceMaterialStorageKeys: false,
      exposesPromptText: false,
      exposesPromptTextInHandoff: false,
      exposesStudentAnswerText: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentInstructions: false,
      exposesStudentNamesInHandoff: false,
      exposesTeacherAnswerText: false,
      exposesTeacherAnswerTextInHandoff: false,
      exposesTeacherExplanationTextInHandoff: false,
      exportPreparationScope: 'full-assignment-results',
      exportIncludesSubmittedDateColumns: true,
      freezesAssignmentSnapshots: true,
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
      keepsTemplateRoadmapOnSharedActivityModel: true,
      printableAnswerKeysUseFormattedExplanations: true,
      publicFeedbackRespectsAnswerReveal: true,
      publicPayloadUsesRuntimeItemsOnly: true,
      publicResponseUsesSanitizedScoredResult: true,
      publicStudentRunnerPayloadUsesSanitizedRuntimeItems: true,
      rejectsClosedOrExpiredStudentRunnerSubmissions: true,
      rejectsInvalidSubmissions: true,
      resultPagesUseSharedAnswerView: true,
      resultPagesUseFormattedExplanations: true,
      resultExportsIncludeDeliveryPolicy: true,
      resultSubmittedDateSortingUsesTimestampParsing: true,
      resultUiDatesUseLocalizedFormatter: true,
      requiresTeacherReviewForAiEnhancements: true,
      requiresTeacherReviewForAiDrafts: true,
      resultConsumersUseScoredAttempts: true,
      scoringUsesSharedAcceptedAnswerParser: true,
      sourceFiles: [...CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES],
      splitsPrimaryFromAlternatives: true,
      storesImmutableScoredAttemptAnswerJson: true,
      storesImmutableScoredAttemptResultJson: true,
      usesAiEnhancementLifecycleChain: true,
      usesActivityAuthoringLibraryChain: true,
      usesActivityAssignmentAttemptResultsLoop: true,
      usesActivityLifecycleGovernanceChain: true,
      usesPublishedAssignmentDeliveryChain: true,
      usesPublicDiscoveryIndexingChain: true,
      usesAssignmentResultsExportPreparation: true,
      usesResultAcceptedAnswerChain: true,
      usesResultExplanationChain: true,
      usesResultSubmittedDateChain: true,
      usesScoredAttemptResultChain: true,
      usesSharedAttemptStats: true,
      usesSharedDurationFormatting: true,
      usesSourceExtractionLifecycleChain: true,
      usesStudentRunnerPlayChain: true,
      usesTemplateRoadmapCapabilityChain: true,
      usesTeacherOnlyResultScope: true,
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
    case 'activity-content-contract':
      return item(
        id,
        'Activity content contract',
        'Template-neutral content',
        'Questions, pairs, groups, vocabulary, notes, explanations, and source references stay in the shared activity content model.'
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
    case 'share-link-distribution':
      return item(
        id,
        'Share-link distribution',
        'Copy/preview/print/review',
        'Assignment list and result surfaces keep copy, preview, printable, and review actions aligned.'
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
    case 'student-identity-boundary':
      return item(
        id,
        'Student identity boundary',
        'Name or browser token',
        'Named and anonymous identities normalize before attempt limits and teacher result grouping.'
      );
    case 'runtime-item-contract':
      return item(
        id,
        'Runtime item contract',
        '{ itemId, answer }',
        'Every student renderer submits the same template-neutral answer shape against frozen runtime items.'
      );
    case 'progress-submit-readiness':
      return item(
        id,
        'Progress submit readiness',
        'Explicit partial confirm',
        'Progress counts and submit controls make incomplete attempts an explicit student decision.'
      );
    case 'submission-validation':
      return item(
        id,
        'Submission validation',
        'Unknown duplicate guard',
        'The submit API rejects unknown runtime ids, duplicate ids, and answer lists longer than the frozen runtime.'
      );
    case 'scored-attempt-result-boundary':
      return item(
        id,
        'Scored attempt result boundary',
        '30 result slices',
        'Validated submissions, lifecycle and identity gates, runtime scoring, immutable attempt rows, sanitized public feedback, shared stats, teacher review, copy artifacts, CSV export, printable return, and privacy guards stay aligned.'
      );
    case 'answer-feedback-policy':
      return item(
        id,
        'Answer feedback policy',
        'Reveal if allowed',
        'Student feedback exposes accepted answers and explanations only after scoring and only when policy allows review.'
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
    case 'dashboard-loop-status':
      return item(
        id,
        'Dashboard loop status',
        'Create/publish/play/review',
        'Dashboard status and next actions summarize where the teacher is in the classroom loop.'
      );
    case 'teacher-workspace-routes':
      return item(
        id,
        'Teacher workspace routes',
        'Dashboard workspace',
        'Authenticated dashboard, activity library, assignment list, results, print, and settings surfaces keep owner scope.'
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
