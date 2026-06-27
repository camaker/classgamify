import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { isLocalizedPath } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getPricePlans } from '@/lib/price-plan';
import { buildSqlLikeContainsPattern } from '@/lib/sql-like';
import { APP_ENTITY_ID_LENGTH } from '@/lib/entity-id';
import { getFooterLinks } from '@/config/footer-config';
import { getNavbarLinks } from '@/config/navbar-config';
import { getSidebarLinks } from '@/config/sidebar-config';
import { formatUserFileUploadError } from '@/api/user-file-errors';
import {
  ADMIN_USER_LIST_INPUT_LIMITS,
  ADMIN_USER_STATUS_FILTERS,
  getAdminUserListOffset,
  normalizeAdminUserSortId,
} from '@/admin/users-query';
import {
  buildUserFileDetailOwnerWhere,
  getUserFileListOffset,
  USER_FILE_LIST_INPUT_LIMITS,
  USER_FILE_MATERIAL_PICKER_PAGE_SIZE,
} from '@/storage/file-query';
import {
  ASSIGNMENT_CLASSROOM_BRIEF_LIMITS,
  buildAssignmentClassroomBrief,
  buildAssignmentClassroomBriefFocusItemView,
  buildAssignmentClassroomBriefFollowUpStudentView,
  buildAssignmentClassroomBriefStatViews,
  formatAssignmentBriefStudentAccuracy,
} from '@/assignments/classroom-brief';
import {
  buildAssignmentItemReviewSummary,
  buildAssignmentItemReviewSummaryItemView,
} from '@/assignments/item-review-summary';
import {
  ASSIGNMENT_RETEACH_PLAN_LIMITS,
  buildAssignmentReteachPlan,
  buildAssignmentReteachPlanItemView,
  buildAssignmentReteachPlanStudentView,
} from '@/assignments/reteach-plan';
import { stripJsonComments } from './parse-wrangler';
import {
  buildActivityLibraryCardSummary,
  buildActivityLibraryFilterSummary,
  buildActivityLibrarySummaryMetrics,
  summarizeActivityLibrary,
} from '@/activities/library-summary';
import { buildActivityDetailOwnerWhere } from '@/activities/detail-query';
import {
  buildCreatedActivityListItemSelect,
  filterActivityLibrarySourceItems,
  getActivityLibraryPageItems,
} from '@/activities/library-query';
import {
  ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS,
  activityLibraryCardCopy,
  activityLibraryHeroCopy,
  activityLibraryPageCopy,
  activityLibrarySearchCopy,
  buildActivityLibraryCardActionView,
  buildActivityLibraryCardActionState,
  buildActivityLibraryCardDisplayView,
  buildActivityLibraryCardStats,
  buildActivityLibraryCardViewModel,
  buildActivityLibraryCompatibilityView,
  buildCreatedActivityPanelContext,
  buildActivityLibraryEmptyStateView,
  buildActivityLibraryPageViewModel,
  buildActivityLibraryRemixActionLabel,
  buildActivityLibraryRemixHint,
  buildActivityLibrarySearchPanelView,
  buildStarterActivityLibraryCardViewModel,
  buildActivityLibraryStarterPreview,
  buildActivityLibraryTemplateFilterOptions,
  findCreatedActivityInList,
  formatActivityLibraryTemplateShortNameList,
  formatActivityLibraryStatusLabel,
  resolveCreatedActivityPanelActivity,
} from '@/activities/library-view';
import {
  ACTIVITY_LIBRARY_INPUT_LIMITS,
  ACTIVITY_LIBRARY_PAGE_SIZE,
  ACTIVITY_LIBRARY_STATUSES,
  ACTIVITY_SOURCE_MATERIAL_FILTERS,
  buildActivityLibraryDismissCreatedRouteSearch,
  buildActivityLibraryFilterRouteSearch,
  buildActivityLibraryPageRouteSearch,
  buildActivityLibraryRouteSearch,
  buildActivityLibraryValidatedSearch,
  getActivityLibraryTotalPages,
  isActivityTemplateType,
  matchesActivitySourceMaterialFilter,
  normalizeActivityLibrarySearch,
  parseActivityLibraryStatus,
  parseActivitySourceMaterialFilter,
  parseActivityTemplateFilter,
  parseCreateActivityTemplateSearch,
} from '@/activities/library-filters';
import {
  ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS,
  ACTIVITY_AI_DRAFT_COMPLETION_LIMITS,
  ACTIVITY_AI_DRAFT_FIELD_LIMITS,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE,
  ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS,
  buildActivityDraftPrompt,
  buildFallbackActivityDraftTerms,
  buildGenerateActivityDraftInputFromEditor,
  createActivityInputFromAiDraft,
  createFallbackActivityDraft,
  createFallbackActivityDraftResult,
  extractActivityDraftSourceTerms,
  generateActivityDraftInputSchema,
  normalizeAiActivityDraft,
  type AiActivityDraft,
} from '@/activities/ai-draft';
import {
  formatEditorGroupRow,
  formatEditorGroupRows,
  formatEditorInlineList,
  formatEditorLineList,
  formatEditorPairRow,
  formatEditorQuestionRow,
} from '@/activities/editor-serialization';
import {
  formatActivityTemplateClassroomMode,
  getActivityTemplates,
  getStarterActivities,
  getStarterAssignments,
  getTemplateByType,
} from '@/activities/catalog';
import {
  buildDuplicatedActivityTitle,
  buildRemixedActivityTitle,
  cloneActivityContentForDerivative,
} from '@/activities/duplicate';
import {
  buildActivityCreateInsert,
  buildActivityUpdateSet,
  buildActivityVisibilityUpdateSet,
  buildDuplicatedActivityInsert,
  buildRemixedActivityInsert,
} from '@/activities/persistence';
import {
  ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
  DEFAULT_ACTIVITY_DRAFT_SOURCE,
  appendActivitySourceMaterialDraftNotes,
  buildActivitySourceMaterialDraftNoteViews,
  buildActivitySourceMaterialDraftNotes,
  buildActivitySourceMaterialDraftSummary,
  getActivityDraftSourceText,
  hasActivitySourceMaterialDraftNotes,
} from '@/activities/draft-source';
import {
  buildActivityPreviewViewModel,
  buildDefaultActivityPreviewPanel,
} from '@/activities/preview-view';
import {
  buildActivityDraftMeta,
  buildActivityDraftMetaSummaryView,
  buildActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
import {
  buildActivitySourceMaterialSummaryView,
  formatActivitySourceMaterialReferenceMeta,
  summarizeActivitySourceMaterials,
} from '@/activities/material-summary';
import {
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS,
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  buildActivityMaterialReferenceFromUserFile,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import {
  activityEditPageCopy,
  assertActivityCanArchive,
  assertActivityCanEdit,
  assertActivityCanDeriveWork,
  assertActivityCanRestore,
  buildActivityDerivativeActionGate,
  buildActivityEditAccessView,
  buildActivityLifecycleActionView,
  canArchiveActivity,
  canEditActivity,
  canDeriveActivityWork,
  canRestoreActivity,
  getArchivedActivityDerivationError,
  getActivityLifecycleActionCopy,
  isActivityArchived,
} from '@/activities/lifecycle';
import {
  evaluateRuntimeAnswers,
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
  getActivityTemplateRunnerKind,
  getRuntimeItems,
} from '@/activities/runtime';
import {
  ACTIVITY_STABLE_ID_LENGTH,
  makeActivityStableId,
} from '@/activities/stable-id';
import {
  getActivityRunnerKindCopy,
  getActivityTemplateRunnerCopy,
} from '@/activities/runner-copy';
import {
  buildListeningPromptView,
  normalizeListeningSpeechLanguage,
} from '@/activities/listening-speech';
import {
  getActivityTemplateDraftGuidance,
  buildTemplateRemixSummary,
  formatTemplateRequirementList,
  formatTemplateRequirement,
  formatTemplateRequirements,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import {
  buildTemplateCreateSearch,
  buildTemplateEntryAction,
  buildWorksheetHeroActions,
  buildWorksheetModeEntryAction,
} from '@/activities/template-entry';
import {
  buildTemplatesPageViewModel,
  buildWorksheetsPageViewModel,
} from '@/activities/entry-page-view';
import {
  ACTIVITY_CREATABLE_VISIBILITIES,
  ACTIVITY_DIFFICULTIES,
  ACTIVITY_EDITOR_FIELD_LIMITS,
  ACTIVITY_PERSISTED_VISIBILITIES,
  ACTIVITY_TEMPLATE_TYPES,
  ACTIVITY_TITLE_LENGTH,
  type ActivityTemplateType,
} from '@/activities/types';
import {
  activityDifficultySchema,
  activityPersistedVisibilitySchema,
  activityVisibilitySchema,
  buildActivityContent,
  createActivityInputSchema,
} from '@/activities/validation';
import {
  buildActivityCreatePageEditorViewModel,
  buildActivityCreatePageViewModel,
  buildActivityEditPageViewModel,
  activityContentToEditorInput,
  ACTIVITY_EDITOR_READINESS_PANEL_LIMITS,
  buildActivityEditorAiDraftPanelView,
  buildActivityEditorDraftGenerationGate,
  buildActivityEditorDraftSourceState,
  buildActivityEditorDraftSourceText,
  buildActivityEditorDraftSuccessMessage,
  getActivityEditorDefaultInput,
  buildActivityEditorInitialValues,
  buildActivityEditorModeView,
  buildActivityEditorPreviewPanel,
  buildActivityEditorPreviewSeed,
  buildActivityEditorReadinessPanelSummary,
  buildActivityEditorSaveGate,
  buildActivityEditorSelectOptions,
  buildActivityEditorSyncedDraftSourceText,
  buildActivityEditorTemplateScaffoldApplication,
  buildActivityEditorTemplateSetupView,
  buildActivityEditorTemplateReadiness,
  buildActivityEditorTemplateView,
  formatActivityEditorDifficulty,
  formatActivityEditorVisibility,
} from '@/activities/editor';
import {
  buildQuestionChoices,
  DEFAULT_QUESTION_CHOICE_COUNT,
} from '@/activities/distractors';
import { buildQuestionOptionTexts } from '@/activities/question-options';
import {
  buildActivityTemplateScaffoldInput,
  buildActivityTemplateScaffoldReadinessSummary,
  getActivityTemplateScaffold,
} from '@/activities/scaffolds';
import {
  getWorksheetModeDefinitions,
  WORKSHEET_MODE_TEMPLATES,
} from '@/activities/worksheet-modes';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import { getAcceptedAnswers, matchAnswer } from '@/activities/answer-matching';
import {
  buildDashboardCoreLoopReadiness,
  buildDashboardOverviewMetrics,
  buildDashboardOverviewPageViewModel,
  buildDashboardOverviewStarterPreview,
  dashboardOverviewPageCopy,
  formatDashboardMetricValue,
  formatDashboardTemplateCoverageValue,
  getDashboardOverviewActionCards,
} from '@/dashboard/overview';
import { buildDashboardPaginationView } from '@/dashboard/pagination';
import {
  buildContactPageViewModel,
  buildHomePageViewModel,
  buildPricingFaqItems,
  buildPricingPageViewModel,
  buildRoadmapPageViewModel,
  buildTeachersPageViewModel,
} from '@/pages/public-page-view';
import {
  buildPaymentStatusView,
  getInitialPaymentConfirmationStatus,
} from '@/payment/payment-status-view';
import { buildSettingsBillingCardViewModel } from '@/payment/billing-view';
import type { PricePlan, Subscription } from '@/payment/types';
import {
  assertSubmittedAnswersMatchRuntimeItems,
  normalizeSubmittedAttemptAnswers,
} from '@/assignments/attempt-answers';
import {
  buildAssignmentAttemptStatsView,
  normalizeAssignmentAttemptStats,
  summarizeAssignmentAttempts,
  summarizeAssignmentAttemptsByAssignmentId,
  withAssignmentAttemptStatsSettings,
} from '@/assignments/attempt-stats';
import { buildScoredAttemptInsert } from '@/assignments/attempt-persistence';
import {
  ASSIGNMENT_ATTEMPT_DURATION_UNITS,
  buildAttemptStartedAt,
  buildAttemptTimerState,
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
  resolveAttemptSubmissionDurationSeconds,
} from '@/assignments/attempt-duration';
import {
  buildAssignmentAttemptUsage,
  canUseAnotherAssignmentAttempt,
  normalizeAssignmentAttemptCount,
  normalizeAssignmentRemainingAttempts,
} from '@/assignments/attempt-limits';
import {
  buildChoicePairingRunnerView,
  buildDefaultRuntimeItemCardViews,
  buildFillBlankWorksheetView,
  buildGroupSortRunnerView,
  buildInlineBlankPromptView,
  buildExclusiveChoiceAnswerChanges,
  buildPublicAnswerFeedbackView,
  buildRuntimeChoiceButtonViews,
  buildRuntimeChoiceViews,
  buildSequentialStudentRunnerNavigationView,
  buildSequentialStudentRunnerView,
  buildSequentialRunnerView,
  buildStudentRunnerHeaderView,
  buildStudentRunnerView,
  findChoiceOwner,
  formatSequentialRunnerItemLabel,
  getSequentialRunnerItemIdByOffset,
  getStudentRunnerReviewStatusClassName,
  getUniqueRuntimeChoices,
  isSameRuntimeChoice,
} from '@/assignments/student-runner-view';
import {
  formatAssignmentDisplayText,
  formatAssignmentDisplayTitle,
} from '@/assignments/assignment-display';
import {
  buildAssignmentDeliverySummary,
  buildAssignmentSettingsSummaryView,
  buildPublicAssignmentRuleSummary,
  buildPublicAssignmentRuleSummaryFromSettings,
  formatAssignmentDeliveryInstructions,
  formatAssignmentDeliveryPolicyText,
  formatAssignmentExpiry,
  formatAssignmentItemCount,
} from '@/assignments/delivery-summary';
import {
  buildAssignmentActivityJoin,
  buildAssignmentDetailSelect,
  buildAssignmentDetailOwnerWhere,
  buildAssignmentDetailOwnerShareWhere,
  buildAssignmentDetailShareWhere,
  buildAssignmentSnapshotJoin,
} from '@/assignments/detail-query';
import {
  buildOpenPublicAssignmentPayload,
  buildPublicAssignmentLookupResult,
  buildPublicAssignmentPayload,
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  buildPublicAttemptResult,
  buildPublicAttemptReviewItems,
  buildPublicAttemptReviewItemMap,
  PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES,
  stripRuntimeAnswer,
  stripRuntimeAnswers,
} from '@/assignments/public';
import {
  getRuntimeDisplayAcceptedAnswers,
  getRuntimeChoiceDisplayKey,
  hasRuntimeDisplayText,
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
import {
  buildAssignmentSnapshotInsert,
  resolveAssignmentRuntimeSource,
  resolveAssignmentSnapshotSource,
} from '@/assignments/snapshot';
import {
  buildAssignmentStatusUpdateSet,
  buildPublishedAssignmentInsert,
  buildPublishedAssignmentSnapshotInsert,
} from '@/assignments/persistence';
import {
  PRINTABLE_WORKSHEET_RESPONSE_POLICIES,
  buildPrintableAssignmentSearch,
  buildPrintableAssignmentWorksheet,
  getPrintableWorksheetResponsePolicy,
  parsePrintableAssignmentSearch,
} from '@/assignments/printable-worksheet';
import {
  buildPrintableWorksheetAnswerKeyItemView,
  buildPrintableWorksheetErrorView,
  buildPrintableWorksheetItemView,
  buildPrintableWorksheetLoadingView,
  buildPrintableWorksheetPageViewModel,
} from '@/assignments/printable-worksheet-view';
import {
  ASSIGNMENT_LIST_INPUT_LIMITS,
  ASSIGNMENT_LIST_PAGE_SIZE,
  ASSIGNMENT_LIFECYCLE_STATUS_FILTERS,
  buildAssignmentListDismissPublishedRouteSearch,
  buildAssignmentListFilterRouteSearch,
  buildAssignmentListPageRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
  getAssignmentListTotalPages,
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  buildAssignmentListSummarySelect,
  buildPublishedAssignmentListItemSelect,
  getAssignmentListOffset,
} from '@/assignments/list-query';
import {
  buildAssignmentListFilterSummary,
  buildAssignmentListSummary,
  buildAssignmentListSummaryMetrics,
} from '@/assignments/list-summary';
import {
  assignmentListActionCopy,
  assignmentListPageCopy,
  assignmentListPublishedPanelCopy,
  assignmentListSearchCopy,
  assignmentStatusFilterOptions,
  buildAssignmentListCardActionView,
  buildAssignmentListCardStats,
  buildAssignmentListCardViewModel,
  buildAssignmentListEmptyStateView,
  buildAssignmentListPageViewModel,
  buildAssignmentListSearchPanelView,
  buildAssignmentListStarterPreview,
  buildStarterAssignmentListCardViewModel,
  getAssignmentListCardActionState,
  getAssignmentListEmptyState,
} from '@/assignments/list-view';
import {
  ASSIGNMENT_MANAGED_STATUSES,
  assertAssignmentAcceptsSubmissions,
  assertAssignmentStatusTransition,
  buildAssignmentStatusAction,
  buildAssignmentStatusActionExecutionPlan,
  getAssignmentLifecycleStatus,
  getAssignmentSubmissionErrorMessage,
  getAssignmentStatusActionCopy,
  getAssignmentStatusLabel,
  isAssignmentOpen,
  matchesAssignmentLifecycleStatus,
} from '@/assignments/lifecycle';
import { buildAssignmentLifecycleStatusFilter } from '@/assignments/lifecycle-query';
import {
  orderAssignmentRuntimeItems,
  stableShuffle,
} from '@/assignments/item-order';
import {
  assignmentResultPageCopy,
  assignmentResultReviewCopy,
  assignmentResultSearchCopy,
  assignmentResultSectionCopy,
  assignmentResultTableHeaders,
  assignmentResultActionDescriptors,
  assignmentResultActionOrder,
  buildAttemptReviewSubmissionSummary,
  buildAssignmentAttemptAnswerReviewView,
  buildAssignmentAttemptAnswerReviewViews,
  buildAssignmentAttemptReviewCardView,
  buildAssignmentAttemptReviewCardViews,
  buildAssignmentAttemptRowDisplay,
  buildAssignmentAttemptRowViews,
  buildAssignmentItemAnalysisCardView,
  buildAssignmentItemAnalysisCardViews,
  buildAssignmentItemPerformanceRowView,
  buildAssignmentItemPerformanceRowViews,
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionExecutionPlan,
  buildAssignmentResultActionPayload,
  buildAssignmentResultActionState,
  buildAssignmentResultCopyText,
  buildAssignmentResultContentState,
  buildAssignmentResultHeaderView,
  buildAssignmentResultHeaderShareAction,
  buildAssignmentResultMetricItems,
  buildAssignmentResultSectionState,
  buildAssignmentResultViewModel,
  buildAssignmentResultsPageViewModel,
  buildAssignmentStudentSummaryRowView,
  buildAssignmentStudentSummaryRowViews,
  buildAssignmentResultEmptyState,
  attemptReviewFilterOptions,
  buildResultSearchSummary,
  formatAssignmentAttemptReviewBadge,
  formatAssignmentItemCorrectSummary,
  formatAssignmentResultFraction,
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
  formatAssignmentReviewCount,
  getAssignmentAnswerReviewStatus,
  getAssignmentResultCompletedAttemptCount,
  itemPerformanceSortOptions,
  getAssignmentResultActionCopy,
  getAssignmentResultActionGate,
  getAssignmentResultActionGateFromState,
  studentSummarySortOptions,
} from '@/assignments/result-view';
import {
  ATTEMPT_REVIEW_FILTER_VALUES,
  DEFAULT_ATTEMPT_REVIEW_FILTER,
  DEFAULT_ITEM_PERFORMANCE_SORT,
  DEFAULT_STUDENT_SUMMARY_SORT,
  ITEM_PERFORMANCE_SORT_VALUES,
  STUDENT_SUMMARY_SORT_VALUES,
  buildAssignmentResultControlRouteSearch,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultSearchState,
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAssignmentResultCompletedAttemptRows,
  filterAttemptReviews,
  matchesResultSearch,
  normalizeResultSearch,
  normalizeResultSearchQuery,
  parseAttemptReviewFilter,
  parseItemPerformanceSort,
  parseResultStudentSearch,
  parseStudentSummarySort,
  resolveAssignmentResultViewState,
  sortItemPerformance,
  sortStudentSummaries,
} from '@/assignments/result-filters';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultCsvNumber,
  formatAssignmentResultDate,
  formatAssignmentResultValue,
  formatOptionalAcceptedAnswerAlternatives,
  formatPrimaryAcceptedAnswer,
} from '@/assignments/result-format';
import {
  buildAssignmentResultAcceptedAnswerView,
  buildAssignmentResultAnswerStatusView,
  buildAssignmentResultAttemptAnswerTextView,
} from '@/assignments/result-answer-view';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryAttemptCount,
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryCorrectRate,
  formatAssignmentSummaryItemPerformance,
  formatAssignmentSummaryReviewCount,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import {
  compareAssignmentItemsByType,
  getSubmittedAssignmentReviewPriorityItems,
  sortAssignmentItemsByReviewPriority,
} from '@/assignments/review-priority';
import {
  compareAssignmentStudentsByDisplayLabel,
  getAssignmentStudentFollowUpPriorityStudents,
  sortAssignmentStudentsByFollowUpPriority,
} from '@/assignments/student-follow-up-priority';
import {
  ASSIGNMENT_RESULTS_ANALYSIS_LIMITS,
  analyzeAssignmentResults,
  isAssignmentAttemptAnswerNeedsReview,
} from '@/assignments/results';
import {
  ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS,
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvDataUrl,
  buildAssignmentResultsCsvFilename,
} from '@/assignments/results-export';
import {
  buildPublishedAssignmentPanelContext,
  findPublishedAssignmentInList,
  resolvePublishedAssignmentPanelAssignment,
} from '@/assignments/published-assignment';
import {
  assignmentShareLinkActionCopy,
  buildAssignmentSharePath,
  buildAssignmentShareUrl,
  normalizeShareBaseUrl,
} from '@/assignments/share-link';
import {
  ASSIGNMENT_SHARE_SLUG_LENGTH,
  isSameAssignmentShareSlug,
  normalizeAssignmentShareSlug,
} from '@/assignments/share-slug';
import {
  ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS,
  assignmentPublishDialogCopy,
  assignmentPublishToggleOptions,
  buildAssignmentPublishDraft,
  buildAssignmentPublishCloseAfterMinLocal,
  buildAssignmentPublishDraftDefaults,
  buildAssignmentPublishDialogState,
  buildAssignmentPublishDialogViewModel,
  buildAssignmentPublishPreviewFromDraft,
  buildAssignmentPublishInputFromDraft,
  buildAssignmentPublishToggleViews,
  formatAssignmentDateTimeLocal,
  parseAssignmentDateTimeLocal,
  parseOptionalWholeNumber,
  validateAssignmentPublishDraft,
} from '@/assignments/publish-input';
import {
  buildAssignmentStudentFollowUpSummary,
  buildAssignmentStudentFollowUpSummaryStudentView,
} from '@/assignments/student-follow-up-summary';
import {
  formatAssignmentResultItemNumberLabel,
  formatAssignmentResultPromptLabel,
  formatAssignmentResultStudentLabel,
  joinAssignmentResultSearchSummaryParts,
} from '@/assignments/result-display';
import {
  ASSIGNMENT_RESULT_COPY_TEXT_FORMAT,
  formatAssignmentResultCopyOrdinal,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import {
  buildAnonymousAttemptTokenStorageKey,
  createStudentIdentityResolver,
  getAnonymousBrowserLabel,
  getOrCreateAnonymousAttemptToken,
  normalizeAnonymousToken,
} from '@/assignments/identity';
import {
  ASSIGNMENT_SUBMISSION_ANSWER_LIMITS,
  ASSIGNMENT_SUBMISSION_DURATION_RANGE,
  ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS,
} from '@/assignments/submission-limits';
import {
  countMatchingStudentIdentityAttempts,
  countPreviousIdentityAttempts,
  resolveAttemptIdentityCountStrategy,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import {
  buildAssignmentAttemptStatsByAssignmentSelect,
  buildAssignmentAttemptStatsSelect,
  buildAssignmentAttemptsInWhere,
  buildAttemptAssignmentJoin,
  buildAttemptCompletedAtOrderBy,
  buildScoredAnonymousAssignmentAttemptWhere,
  buildScoredAssignmentAttemptWhere,
  buildScoredAttemptWhere,
} from '@/assignments/attempt-query';
import {
  buildStudentRunnerAttemptClock,
  buildStudentRunnerAttemptRestartPlan,
  buildStudentRunnerAttemptResetState,
  buildStudentRunnerAttemptState,
  buildStudentRunnerPageState,
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerSeoView,
  getStudentRunnerAttemptStartedAt,
  shouldResetStudentRunnerAttemptSession,
  shouldStartStudentRunnerAttemptClock,
} from '@/assignments/student-runner-state';
import {
  buildAttemptCompletionCopy,
  applyStudentAnswerChanges,
  buildAnonymousAttemptCopy,
  buildAttemptSubmissionAnswers,
  buildStudentAttemptAnswerStateByItemId,
  buildStudentAttemptControlState,
  buildStudentAnswerChange,
  buildStudentAnswerChanges,
  buildStudentAttemptResultDisplay,
  buildStudentAttemptSubmissionInput,
  buildStudentAttemptSubmissionPlan,
  buildStudentAttemptSessionKey,
  buildStudentAttemptSubmitGate,
  buildStudentAttemptTimerBadge,
  buildStudentRunnerMissingView,
  canStartAnotherStudentAttempt,
  formatStudentAttemptUsageLabel,
  formatAttemptCompletionProgressLabel,
  getAttemptCompletionSummary,
  getAttemptSubmitDecision,
  getStudentRunnerCopy,
  isStudentAnswerFilled,
  resolveStudentAttemptSubmissionFailureMessage,
  resolveStudentAttemptAnonymousToken,
} from '@/assignments/student-submission';
import {
  ASSIGNMENT_MAX_ATTEMPTS_RANGE,
  ASSIGNMENT_PUBLISH_FIELD_LIMITS,
  ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE,
  ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE,
  publishAssignmentInputSchema,
  resolveAssignmentSettings,
  updateAssignmentStatusInputSchema,
  withResolvedAssignmentSettings,
} from '@/assignments/validation';
import {
  getUserFileExtension,
  normalizeUserFileContentType,
  resolveUserFileMaterialKind,
} from '@/storage/file-materials';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';
import { buildUserFileMaterialSummary } from '@/storage/file-summary';
import { buildAttachmentContentDisposition } from '@/storage/content-disposition';
import { STORAGE_ERROR_CODES, UploadError } from '@/storage/types';
import type { RuntimeItem } from '@/activities/runtime';
import type {
  AssignmentSettings,
  AttemptAnswer,
  AttemptResult,
} from '@/activities/types';

function getSourceSlice(
  source: string,
  startMarker: string,
  endMarker: string
) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source start marker: ${startMarker}`);
  const end = endMarker
    ? source.indexOf(endMarker, start + startMarker.length)
    : source.length;
  assert.notEqual(end, -1, `Missing source end marker: ${endMarker}`);

  return source.slice(start, end);
}

const activityEditorDefaultInput = getActivityEditorDefaultInput();

const submissionRuntimeItems = [
  { id: 'item-1' },
  { id: 'item-2' },
  { id: 'item-3' },
];

const answers = {
  'item-1': ' apple ',
  'item-2': '   ',
} satisfies Record<string, string>;

assert.equal(
  JSON.parse(
    stripJsonComments(`{
      // Line comments should be removed.
      "script": "https://cloud.umami.is/script.js",
      "quote": "She said \\"// keep this\\"",
      /*
       * Block comments should be removed.
       */
      "enabled": true
    }`)
  ).script,
  'https://cloud.umami.is/script.js'
);

const copiedTemplateMarkerPattern = new RegExp(
  [
    'getlangstudy',
    'Lang Study',
    'HSK',
    'Hanzi',
    'HSK1 starter loop',
    'TanStarter',
    'mkfast-template',
    'Chinese character',
    'stroke-order',
    'writing practice',
  ].join('|'),
  'i'
);

const sensitiveOauthPattern = new RegExp(
  [
    'GOCSPX-[A-Za-z0-9_-]+',
    '\\d{6,}-[a-z0-9_-]+\\.apps\\.googleusercontent\\.com',
    '客户端密钥',
  ].join('|'),
  'i'
);
const secretScanFileExtensions = ['.json', '.md', '.ts', '.tsx', '.txt'];

function collectTextFiles(directoryPath: string): string[] {
  return readdirSync(directoryPath, { withFileTypes: true })
    .flatMap((entry) => {
      const filePath = `${directoryPath}/${entry.name}`;

      if (entry.isDirectory()) {
        return collectTextFiles(filePath);
      }

      return secretScanFileExtensions.some((extension) =>
        entry.name.endsWith(extension)
      )
        ? [filePath]
        : [];
    })
    .sort();
}

for (const filePath of [
  ...collectTextFiles('content'),
  ...collectTextFiles('docs'),
  ...collectTextFiles('project.inlang/messages'),
  ...collectTextFiles('scripts'),
  ...collectTextFiles('src'),
].filter((filePath) => filePath !== 'scripts/test-domain.ts')) {
  assert.doesNotMatch(
    readFileSync(filePath, 'utf8'),
    sensitiveOauthPattern,
    `${filePath} should not contain OAuth client secrets or concrete client ids.`
  );
}

const contentSurfaceFiles = [
  'content/blog',
  'content/changelog',
  'content/pages',
].flatMap((directoryPath) =>
  readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith('.md'))
    .sort()
    .map((fileName) => `${directoryPath}/${fileName}`)
);

const activeClassGamifySurfaceFiles = [
  'CLAUDE.md',
  'README.md',
  'docs/locale.md',
  'docs/newsletter.md',
  'public/og-source.svg',
  'src/components/blog/blog-post-visual.tsx',
  'src/config/footer-config.ts',
  'src/config/navbar-config.ts',
  'src/config/sidebar-config.ts',
  'src/config/website.ts',
  'src/routes/index.tsx',
  'src/routes/templates.tsx',
  'src/routes/worksheets.tsx',
  'src/routes/create.tsx',
  'src/routes/play/$shareId.tsx',
  'src/routes/(pages)/contact.tsx',
  'src/routes/(pages)/pricing.tsx',
  'src/routes/(pages)/roadmap.tsx',
  'src/routes/(pages)/teachers.tsx',
  'src/routes/dashboard/index.tsx',
  'src/routes/dashboard/activities.tsx',
  'src/routes/dashboard/activities/$activityId.tsx',
  'src/routes/dashboard/assignments.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'src/routes/settings/billing.tsx',
  'src/routes/api/e2e/users.ts',
  'tests/e2e/fixtures/test-data.ts',
  ...contentSurfaceFiles,
];

const activeClassGamifySurfaceText = activeClassGamifySurfaceFiles
  .map((filePath) => {
    const fileText = readFileSync(filePath, 'utf8');

    assert.doesNotMatch(
      fileText,
      copiedTemplateMarkerPattern,
      `${filePath} should use ClassGamify product language`
    );

    return fileText;
  })
  .join('\n');
assert.match(activeClassGamifySurfaceText, /ClassGamify/);
const createRouteSource = readFileSync('src/routes/create.tsx', 'utf8');
assert.match(
  createRouteSource,
  /buildActivityCreatePageEditorViewModel/,
  'The create route should consume the activity-domain page view-model instead of rebuilding editor page state in the route.'
);
assert.doesNotMatch(
  createRouteSource,
  /m\.create_page_(?:eyebrow|title|description|input_shape|preview_label)/,
  'The create route should render localized create-page copy from buildActivityCreatePageEditorViewModel.'
);
const activityEditRouteSource = readFileSync(
  'src/routes/dashboard/activities/$activityId.tsx',
  'utf8'
);
assert.match(
  activityEditRouteSource,
  /buildActivityEditPageViewModel/,
  'The activity edit route should consume the activity-domain page view-model.'
);
assert.doesNotMatch(
  activityEditRouteSource,
  /activityContentToEditorInput|buildActivityEditAccessView|activityEditPageCopy/,
  'The activity edit route should not rebuild editor initial values, access state, or page copy directly.'
);
const localizedLegalPageRequirements = [
  {
    filePath: 'content/pages/terms.zh.md',
    patterns: [
      /ClassGamify/,
      /课堂活动/,
      /作业链接/,
      /学生(?:作答|提交)/,
      /结果/,
      /AI/,
    ],
  },
  {
    filePath: 'content/pages/privacy.zh.md',
    patterns: [
      /ClassGamify/,
      /课堂活动/,
      /作业链接/,
      /学生参与数据|学生作答/,
      /老师结果|结果/,
      /AI/,
    ],
  },
  {
    filePath: 'content/pages/cookie.zh.md',
    patterns: [
      /ClassGamify/,
      /课堂活动/,
      /作业链接/,
      /匿名学生|匿名尝试/,
      /本地作答状态/,
      /AI/,
    ],
  },
] as const;
for (const { filePath, patterns } of localizedLegalPageRequirements) {
  assert.equal(
    existsSync(filePath),
    true,
    `${filePath} should exist so zh legal routes do not fall back to English.`
  );

  const fileText = readFileSync(filePath, 'utf8');

  assert.doesNotMatch(
    fileText,
    copiedTemplateMarkerPattern,
    `${filePath} should not mention copied learning-site product language.`
  );

  for (const pattern of patterns) {
    assert.match(
      fileText,
      pattern,
      `${filePath} should describe the ClassGamify classroom activity, assignment, student attempt, results, and AI/file data model.`
    );
  }
}
for (const filePath of [
  'content/pages/terms.md',
  'content/pages/privacy.md',
  'content/pages/cookie.md',
  'content/pages/terms.zh.md',
  'content/pages/privacy.zh.md',
  'content/pages/cookie.zh.md',
]) {
  assert.doesNotMatch(
    readFileSync(filePath, 'utf8'),
    /\bAI demos?\b/i,
    `${filePath} should describe AI as teacher-reviewed product capability, not demo positioning.`
  );
}
const environmentTemplateFiles = ['.env.example', '.env.production.example'];
for (const filePath of environmentTemplateFiles) {
  const fileText = readFileSync(filePath, 'utf8');

  assert.doesNotMatch(
    fileText,
    copiedTemplateMarkerPattern,
    `${filePath} should not point new ClassGamify deploys at copied product domains.`
  );
  assert.match(
    fileText,
    /VITE_BASE_URL='https:\/\/classgamify\.example'/,
    `${filePath} should use a ClassGamify placeholder base URL.`
  );
  assert.match(
    fileText,
    /https:\/\/classgamify\.example\/api\/auth\/callback\/google/,
    `${filePath} should document the ClassGamify Google callback URL.`
  );
  assert.doesNotMatch(
    fileText,
    /885df2bc-1419-458c-b8b6-0821eddfb399|G-QH46LZCPE3|367bc1f5-9e17-46c5-af53-661b08883331|xa8pgti8e4/,
    `${filePath} should not carry copied Cloudflare or analytics identifiers.`
  );
}
assert.doesNotMatch(
  readFileSync('src/components/blog/blog-post-visual.tsx', 'utf8'),
  />ClassGamify</,
  'Blog visual brand copy should come from locale messages.'
);
const activeLocaleMessageText = [
  'project.inlang/messages/en.json',
  'project.inlang/messages/zh.json',
]
  .map((filePath) => readFileSync(filePath, 'utf8'))
  .join('\n');
assert.doesNotMatch(activeLocaleMessageText, /"waitlist_/);
assert.doesNotMatch(activeLocaleMessageText, /"ai_page_/);
assert.doesNotMatch(activeLocaleMessageText, /"legacy_/);
const storageTypesSource = readFileSync('src/storage/types.ts', 'utf8');
assert.doesNotMatch(
  storageTypesSource,
  /Please select a file|File is too large|File type not supported/,
  'Storage infrastructure should expose error codes, not user-facing copy.'
);
const updateAvatarCardSource = readFileSync(
  'src/components/settings/profile/update-avatar-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  updateAvatarCardSource,
  /File size exceeds the server limit/,
  'Avatar upload size errors should come from locale messages.'
);
assert.match(
  updateAvatarCardSource,
  /settings_profile_avatar_file_size_error/,
  'Avatar upload size errors should use the localized profile avatar message.'
);
assert.doesNotMatch(
  updateAvatarCardSource,
  /if \(!websiteConfig\.storage\?\.enable\) return null/,
  'Avatar settings should explain disabled classroom file storage instead of hiding the card.'
);
assert.match(
  updateAvatarCardSource,
  /settings_profile_avatar_upload_not_configured/,
  'Avatar settings should use the localized storage-not-configured label.'
);
assert.doesNotMatch(
  updateAvatarCardSource,
  /ctx\.error|err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Avatar update failures should use localized profile copy instead of raw storage or auth errors.'
);
assert.match(
  updateAvatarCardSource,
  /const message = m\.settings_profile_avatar_fail\(\);/,
  'Avatar update failures should use the localized profile avatar failure message.'
);
const updateNameCardSource = readFileSync(
  'src/components/settings/profile/update-name-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  updateNameCardSource,
  /ctx\.error|err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Profile name update failures should use localized profile copy instead of raw auth errors.'
);
assert.match(
  updateNameCardSource,
  /const message = m\.settings_profile_name_fail\(\);/,
  'Profile name update failures should use the localized name failure message.'
);
const updatePasswordCardSource = readFileSync(
  'src/components/settings/security/update-password-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  updatePasswordCardSource,
  /ctx\.error|err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Password update failures should use localized security copy instead of raw auth errors.'
);
assert.match(
  updatePasswordCardSource,
  /const message = m\.settings_security_update_password_fail\(\);/,
  'Password update failures should use the localized password failure message.'
);
const deleteAccountCardSource = readFileSync(
  'src/components/settings/security/delete-account-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  deleteAccountCardSource,
  /ctx\.error|err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Account deletion failures should use localized security copy instead of raw auth errors.'
);
assert.match(
  deleteAccountCardSource,
  /const message = m\.settings_security_delete_account_fail\(\);/,
  'Account deletion failures should use the localized delete-account failure message.'
);
const adminUserDetailViewerSource = readFileSync(
  'src/components/admin/users/user-detail-viewer.tsx',
  'utf8'
);
const adminUsersTableSource = readFileSync(
  'src/components/admin/users/users-table.tsx',
  'utf8'
);
const useAuthSource = readFileSync('src/hooks/use-auth.ts', 'utf8');
assert.match(
  adminUsersTableSource,
  /banReason \?\? m\.common_empty_value\(\)/,
  'Admin users table should render missing ban reasons through localized empty-value copy.'
);
assert.match(
  adminUsersTableSource,
  /formatDate\(new Date\(exp\)\) : m\.common_empty_value\(\)/,
  'Admin users table should render missing ban expiry dates through localized empty-value copy.'
);
assert.match(
  adminUserDetailViewerSource,
  /formatDate\(toDate\(user\.createdAt\)!\)[\s\S]*: m\.common_empty_value\(\)/,
  'Admin user details should render missing joined dates through localized empty-value copy.'
);
assert.match(
  adminUserDetailViewerSource,
  /formatDate\(toDate\(user\.updatedAt\)!\)[\s\S]*: m\.common_empty_value\(\)/,
  'Admin user details should render missing updated dates through localized empty-value copy.'
);
assert.doesNotMatch(
  `${adminUsersTableSource}\n${adminUserDetailViewerSource}`,
  /\?\? '-'|: '-'|>\s*-\s*</,
  'Admin user surfaces should not hard-code visible empty-value placeholders.'
);
assert.doesNotMatch(
  adminUserDetailViewerSource,
  /User ID is required/,
  'Admin user detail errors should use localized copy instead of hard-coded English.'
);
assert.match(
  adminUserDetailViewerSource,
  /admin_users_user_id_required/,
  'Admin user detail missing-id errors should use the localized admin message.'
);
assert.doesNotMatch(
  adminUserDetailViewerSource,
  /err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Admin user ban/unban failures should use localized admin copy instead of raw mutation errors.'
);
assert.match(
  adminUserDetailViewerSource,
  /const message = m\.admin_users_ban_error\(\);/,
  'Admin user ban failures should use the localized ban failure message.'
);
assert.match(
  adminUserDetailViewerSource,
  /const message = m\.admin_users_unban_error\(\);/,
  'Admin user unban failures should use the localized unban failure message.'
);
assert.doesNotMatch(
  useAuthSource,
  /User ID is required|Failed to fetch user accounts/,
  'Client auth hook errors should use localized security messages instead of hard-coded English.'
);
assert.match(
  useAuthSource,
  /settings_security_user_accounts_missing_user/,
  'Client auth hook missing-user errors should use localized security copy.'
);
assert.match(
  useAuthSource,
  /settings_security_user_accounts_fetch_error/,
  'Client auth hook account fetch errors should use localized security copy.'
);
const adminUsersApiSource = readFileSync('src/api/users.ts', 'utf8');
const adminUsersQuerySource = readFileSync('src/admin/users-query.ts', 'utf8');
assert.deepEqual(ADMIN_USER_LIST_INPUT_LIMITS, {
  pageSizeMax: 100,
  pageSizeMin: 1,
});
assert.deepEqual(ADMIN_USER_STATUS_FILTERS, ['active', 'inactive']);
assert.equal(normalizeAdminUserSortId('name'), 'name');
assert.equal(normalizeAdminUserSortId('EMAIL'), 'email');
assert.equal(normalizeAdminUserSortId('updatedAt'), 'createdAt');
assert.equal(getAdminUserListOffset({ pageIndex: 2, pageSize: 25 }), 50);
assert.equal(getAdminUserListOffset({ pageIndex: -1, pageSize: 25 }), 0);
assert.equal(getAdminUserListOffset({ pageIndex: 2, pageSize: 0 }), 2);
assert.match(
  adminUsersApiSource,
  /ADMIN_USER_LIST_INPUT_LIMITS[\s\S]*ADMIN_USER_STATUS_FILTERS/,
  'Admin users API should reuse admin-domain input limits and status filters.'
);
assert.match(
  adminUsersApiSource,
  /buildAdminUserListWhere\(\{ role, search, status \}\)/,
  'Admin users API should delegate search, role, and status filtering to the admin query domain.'
);
assert.match(
  adminUsersApiSource,
  /orderBy\(buildAdminUserListOrderBy\(\{ sortDesc, sortId: data\.sortId \}\)\)/,
  'Admin users API should delegate ordering to the admin query domain.'
);
assert.match(
  adminUsersApiSource,
  /offset\(getAdminUserListOffset\(\{ pageIndex, pageSize \}\)\)/,
  'Admin users API should delegate pagination offset to the admin query domain.'
);
assert.doesNotMatch(
  adminUsersApiSource,
  /pageIndex \* pageSize|SORT_FIELD_MAP|normalizeSortId|replace\([^)]*%|lower\(\$\{user\.(?:name|email)\}\)|eq\(user\.banned|isNull\(user\.banned\)/,
  'Admin users API should not keep local pagination, search, sort, or status query rules.'
);
assert.match(
  adminUsersQuerySource,
  /buildSqlLikeContainsPattern/,
  'Admin users search filtering should reuse the shared SQL LIKE escaping helper.'
);
const activityRuntimeSource = readFileSync('src/activities/runtime.ts', 'utf8');
const activityTemplateRemixSource = readFileSync(
  'src/activities/template-remix.ts',
  'utf8'
);
assert.match(
  activityRuntimeSource,
  /normalizeRuntimeDisplayText\(answer\.answer\)/,
  'Runtime evaluation should normalize submitted answers through the shared runtime display helper.'
);
assert.match(
  activityRuntimeSource,
  /completedItemCount: countSubmittedRuntimeAnswers\(scoredAnswers\)/,
  'Runtime evaluation should derive completed item count through the shared submitted-answer helper.'
);
assert.match(
  activityRuntimeSource,
  /hasRuntimePairContent[\s\S]*return hasRuntimeDisplayText\(left\) && hasRuntimeDisplayText\(right\)/,
  'Runtime pair filtering should use the shared runtime display-text helper.'
);
assert.match(
  activityRuntimeSource,
  /hasRuntimeQuestionContent[\s\S]*return hasRuntimeDisplayText\(prompt\) && hasRuntimeDisplayText\(answer\)/,
  'Runtime question filtering should use the shared runtime display-text helper.'
);
assert.match(
  activityRuntimeSource,
  /\.filter\(hasRuntimeDisplayText\)/,
  'Runtime group-sort item filtering should use the shared runtime display-text helper.'
);
assert.doesNotMatch(
  activityRuntimeSource,
  /answer\.answer\.trim\(\)|scoredAnswers\.filter\(\(answer\) => answer\.answer\)|left\.trim\(\)|right\.trim\(\)|prompt\.trim\(\)|answer\.trim\(\)|item\.trim\(\)|label\.trim\(\)/,
  'Runtime evaluation and content filtering should not use ad hoc trim-only answer or runtime item checks.'
);
assert.match(
  activityTemplateRemixSource,
  /hasRuntimeDisplayText\(group\.label\)[\s\S]*group\.items\.some\(hasRuntimeDisplayText\)/,
  'Template remix group readiness should use the shared runtime display-text helper.'
);
assert.match(
  activityTemplateRemixSource,
  /hasRuntimeDisplayText\(pair\.left\)[\s\S]*hasRuntimeDisplayText\(pair\.right\)/,
  'Template remix pair readiness should use the shared runtime display-text helper.'
);
assert.match(
  activityTemplateRemixSource,
  /hasRuntimeDisplayText\(question\.prompt\)[\s\S]*hasRuntimeDisplayText\(question\.answer\)/,
  'Template remix question readiness should use the shared runtime display-text helper.'
);
assert.doesNotMatch(
  activityTemplateRemixSource,
  /\.trim\(\)/,
  'Template remix readiness should not use ad hoc trim-only content checks.'
);
const copyAssignmentShareLinkButtonSource = readFileSync(
  'src/components/assignments/copy-assignment-share-link-button.tsx',
  'utf8'
);
assert.doesNotMatch(
  copyAssignmentShareLinkButtonSource,
  /error\.message|error instanceof Error/,
  'Share-link copy failures should use localized assignment copy instead of raw clipboard errors.'
);
assert.match(
  copyAssignmentShareLinkButtonSource,
  /assignmentShareLinkActionCopy\.failureMessage/,
  'Share-link copy failures should keep using localized assignment failure copy.'
);
const assignmentResultsRouteSource = readFileSync(
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'utf8'
);
assert.doesNotMatch(
  assignmentResultsRouteSource,
  /error\.message|error instanceof Error/,
  'Result copy/download failures should not expose raw browser or network errors.'
);
assert.match(
  assignmentResultsRouteSource,
  /toast\.error\(executionPlan\.failureMessage\)/,
  'Result copy/download failures should use the localized action failure copy.'
);
assert.match(
  assignmentResultsRouteSource,
  /buildAssignmentResultActionExecutionPlan\(\{\s*actionButton,[\s\S]*data,[\s\S]*\}\)/,
  'Result route should let the assignment-domain execution plan build copy and CSV download artifacts from page data.'
);
assert.doesNotMatch(
  assignmentResultsRouteSource,
  /buildAssignmentResultActionPayload\(|data:text\/csv|encodeURIComponent\(/,
  'Result route should not build result action payloads or CSV data URLs locally.'
);
assert.doesNotMatch(
  assignmentResultsRouteSource,
  /classroomBriefText|items: data\.analysis\.perItem|students: data\.analysis\.students|assignmentTitle: data\.assignment\.title|exportData: data/,
  'Result route should not hand-wire individual result artifact inputs.'
);
const assignmentClassroomBriefSource = readFileSync(
  'src/assignments/classroom-brief.ts',
  'utf8'
);
const assignmentResultCopyFormatSource = readFileSync(
  'src/assignments/result-copy-format.ts',
  'utf8'
);
assert.match(
  assignmentResultCopyFormatSource,
  /ASSIGNMENT_RESULT_COPY_TEXT_FORMAT[\s\S]*lineBreak: '\\n'/,
  'Assignment result copy formatting should expose the shared line-break contract.'
);
assert.match(
  assignmentResultCopyFormatSource,
  /joinAssignmentResultCopyLines[\s\S]*ASSIGNMENT_RESULT_COPY_TEXT_FORMAT\.lineBreak/,
  'Assignment result copy formatting should expose a shared line joiner.'
);
assert.match(
  assignmentResultCopyFormatSource,
  /formatAssignmentResultCopyOrdinal[\s\S]*Math\.floor\(Math\.max\(0, index\)\) \+ 1/,
  'Assignment result copy formatting should expose a shared ordinal normalizer.'
);
assert.match(
  assignmentClassroomBriefSource,
  /buildAssignmentAttemptStatsView\(stats\)/,
  'Classroom brief should format assignment-level metrics through the shared attempt stats view.'
);
assert.match(
  assignmentClassroomBriefSource,
  /ASSIGNMENT_CLASSROOM_BRIEF_LIMITS[\s\S]*focusItems: 3[\s\S]*followUpStudents: 6/,
  'Classroom brief focus and follow-up limits should be named assignment-domain constants.'
);
assert.match(
  assignmentClassroomBriefSource,
  /getSubmittedAssignmentReviewPriorityItems\(items,[\s\S]*ASSIGNMENT_CLASSROOM_BRIEF_LIMITS\.focusItems/,
  'Classroom brief focus-item selection should reuse the classroom brief limit.'
);
assert.match(
  assignmentClassroomBriefSource,
  /getAssignmentStudentFollowUpPriorityStudents\(students,[\s\S]*ASSIGNMENT_CLASSROOM_BRIEF_LIMITS\.followUpStudents/,
  'Classroom brief student follow-up selection should reuse the classroom brief limit.'
);
assert.doesNotMatch(
  assignmentClassroomBriefSource,
  /limit: 3|limit: 6/,
  'Classroom brief selection should not maintain local numeric limits.'
);
assert.match(
  assignmentClassroomBriefSource,
  /joinAssignmentResultCopyLines\(lines\)/,
  'Classroom brief should use the shared assignment-result copy line joiner.'
);
assert.match(
  assignmentClassroomBriefSource,
  /formatAssignmentResultCopyOrdinal\(index\)/,
  'Classroom brief should use the shared assignment-result copy ordinal formatter.'
);
assert.match(
  assignmentClassroomBriefSource,
  /formatAssignmentResultStudentLabel\(/,
  'Classroom brief should format student labels through the shared result-display helper.'
);
assert.doesNotMatch(
  assignmentClassroomBriefSource,
  /lines\.join\('\\n'\)|index \+ 1|student: student\.studentLabel/,
  'Classroom brief should not hand-compose copy line breaks, ordinals, or raw student labels.'
);
const assignmentReteachPlanSource = readFileSync(
  'src/assignments/reteach-plan.ts',
  'utf8'
);
assert.match(
  assignmentReteachPlanSource,
  /ASSIGNMENT_RETEACH_PLAN_LIMITS[\s\S]*reviewItems: 5[\s\S]*reviewStudents: 8/,
  'Reteach plan review and follow-up limits should be named assignment-domain constants.'
);
assert.match(
  assignmentReteachPlanSource,
  /getSubmittedAssignmentReviewPriorityItems\(items,[\s\S]*ASSIGNMENT_RETEACH_PLAN_LIMITS\.reviewItems/,
  'Reteach plan review-item selection should reuse the reteach plan limit.'
);
assert.match(
  assignmentReteachPlanSource,
  /getAssignmentStudentFollowUpPriorityStudents\([\s\S]*ASSIGNMENT_RETEACH_PLAN_LIMITS\.reviewStudents/,
  'Reteach plan student follow-up selection should reuse the reteach plan limit.'
);
assert.doesNotMatch(
  assignmentReteachPlanSource,
  /limit: 5|limit: 8/,
  'Reteach plan selection should not maintain local numeric limits.'
);
assert.match(
  assignmentReteachPlanSource,
  /joinAssignmentResultCopyLines\(lines\)/,
  'Reteach plan should use the shared assignment-result copy line joiner.'
);
assert.match(
  assignmentReteachPlanSource,
  /formatAssignmentResultStudentLabel\(/,
  'Reteach plan should format student labels through the shared result-display helper.'
);
assert.doesNotMatch(
  assignmentReteachPlanSource,
  /lines\.join\('\\n'\)|student: student\.studentLabel/,
  'Reteach plan should not hand-compose copy line breaks or raw student labels.'
);
const assignmentResultsSource = readFileSync(
  'src/assignments/results.ts',
  'utf8'
);
const activityRuntimeDisplaySource = readFileSync(
  'src/activities/runtime-display.ts',
  'utf8'
);
const assignmentResultViewSource = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const assignmentDisplaySource = readFileSync(
  'src/assignments/assignment-display.ts',
  'utf8'
);
const assignmentResultFiltersSource = readFileSync(
  'src/assignments/result-filters.ts',
  'utf8'
);
const assignmentReviewPrioritySource = readFileSync(
  'src/assignments/review-priority.ts',
  'utf8'
);
const assignmentStudentFollowUpPrioritySource = readFileSync(
  'src/assignments/student-follow-up-priority.ts',
  'utf8'
);
const assignmentAttemptStatsSource = readFileSync(
  'src/assignments/attempt-stats.ts',
  'utf8'
);
const assignmentListSummarySource = readFileSync(
  'src/assignments/list-summary.ts',
  'utf8'
);
const assignmentListViewStatsSource = readFileSync(
  'src/assignments/list-view.ts',
  'utf8'
);
assert.match(
  assignmentAttemptStatsSource,
  /export function normalizeAssignmentAttemptStats/,
  'Assignment attempt stats should expose a shared normalization helper.'
);
assert.match(
  assignmentAttemptStatsSource,
  /export function buildAssignmentAttemptStatsView/,
  'Assignment attempt stats should expose a shared display view helper.'
);
assert.match(
  assignmentDisplaySource,
  /formatAssignmentDisplayTitle[\s\S]*formatAssignmentDisplayText\(value\)[\s\S]*formatAssignmentDisplayText[\s\S]*normalizeRuntimeDisplayText\(value\)/,
  'Assignment display helpers should normalize teacher/student visible assignment text through the shared runtime display helper.'
);
assert.match(
  assignmentResultViewSource,
  /assignmentTitle: formatAssignmentDisplayTitle\(assignment\.title\)[\s\S]*const assignmentTitle = formatAssignmentDisplayTitle\(data\.assignment\.title\)/,
  'Assignment result views and copy artifacts should normalize assignment titles through the shared assignment display helper.'
);
assert.doesNotMatch(
  assignmentResultViewSource,
  /assignmentTitle: data\.assignment\.title|assignmentTitle: assignment\.title/,
  'Assignment result views should not expose raw assignment titles.'
);
assert.match(
  assignmentResultViewSource,
  /buildAssignmentAttemptStatsView\(\{[\s\S]*averageDurationSeconds[\s\S]*completions[\s\S]*\}\)/,
  'Assignment result metrics should format values through the shared attempt stats view.'
);
assert.match(
  assignmentResultViewSource,
  /buildAssignmentResultControlOptions\([\s\S]*values\.map\(\(value\)/,
  'Assignment result control options should map directly from the domain enum values.'
);
assert.doesNotMatch(
  assignmentResultViewSource,
  /(?:STUDENT_SUMMARY_SORT_VALUES|ITEM_PERFORMANCE_SORT_VALUES|ATTEMPT_REVIEW_FILTER_VALUES)\[\d+\]/,
  'Assignment result control options should not bind labels to enum values by array index.'
);
assert.match(
  assignmentResultViewSource,
  /buildAssignmentResultsCsvDataUrl\(payload\.csv\)/,
  'Assignment result action plans should use the result-export CSV data URL helper.'
);
assert.doesNotMatch(
  assignmentResultViewSource,
  /data:text\/csv|encodeURIComponent\(/,
  'Assignment result view should not hand-compose CSV data URLs.'
);
assert.match(
  assignmentListSummarySource,
  /buildAssignmentAttemptStatsView\(resolvedSummary\)/,
  'Assignment list summary metrics should format values through the shared attempt stats view.'
);
assert.match(
  assignmentListViewStatsSource,
  /buildAssignmentAttemptStatsView\(\{[\s\S]*averageScore,[\s\S]*completions,[\s\S]*\}\)/,
  'Assignment list cards should format values through the shared attempt stats view.'
);
assert.match(
  assignmentResultFiltersSource,
  /export function filterAndSortStudentSummaries/,
  'Assignment result student search and sort rules should live in the assignment result filter domain helper.'
);
assert.match(
  assignmentResultFiltersSource,
  /export function sortItemPerformance/,
  'Assignment result item performance sort rules should live in the assignment result filter domain helper.'
);
assert.match(
  assignmentResultFiltersSource,
  /export function filterAttemptReviews/,
  'Assignment result answer-review filtering should live in the assignment result filter domain helper.'
);
assert.match(
  assignmentResultFiltersSource,
  /compareAssignmentStudentsByDisplayLabel/,
  'Assignment result student sorting should reuse the shared normalized display-label comparator.'
);
assert.match(
  assignmentStudentFollowUpPrioritySource,
  /export function compareAssignmentStudentsByDisplayLabel[\s\S]*normalizeRuntimeDisplayText/,
  'Assignment student follow-up ordering should expose a normalized display-label comparator.'
);
assert.match(
  assignmentReviewPrioritySource,
  /export function compareAssignmentItemsByType[\s\S]*normalizeRuntimeDisplayText/,
  'Assignment item review-priority ordering should compare normalized display text.'
);
assert.doesNotMatch(
  `${assignmentResultFiltersSource}\n${assignmentStudentFollowUpPrioritySource}`,
  /studentLabel\.localeCompare/,
  'Assignment result student ordering should not compare raw student labels directly.'
);
assert.doesNotMatch(
  assignmentReviewPrioritySource,
  /\b(?:kind|prompt|itemId)\.localeCompare/,
  'Assignment item review-priority ordering should not compare raw item text directly.'
);
assert.match(
  assignmentResultFiltersSource,
  /export function buildAssignmentResultRouteSearch/,
  'Assignment result route search parsing should live in the assignment result filter domain helper.'
);
assert.doesNotMatch(
  assignmentResultViewSource,
  /export function (?:filterAndSortStudentSummaries|sortItemPerformance|filterAttemptReviews|buildAssignmentResultRouteSearch|buildAssignmentResultControlSearchState)/,
  'Assignment result view should not define search, sort, filter, or URL search rules directly.'
);
assert.match(
  assignmentResultsSource,
  /ASSIGNMENT_RESULTS_ANALYSIS_LIMITS[\s\S]*needsReviewItems: 3/,
  'Assignment result analysis should expose its default review-priority limit.'
);
assert.match(
  assignmentResultsSource,
  /limit: ASSIGNMENT_RESULTS_ANALYSIS_LIMITS\.needsReviewItems/,
  'Assignment result analysis should reuse the named review-priority limit.'
);
assert.match(
  assignmentResultsSource,
  /hasRuntimeDisplayText\(answer\?\.answer\)/,
  'Assignment item analysis should count submitted answers through the shared runtime display-text helper.'
);
assert.match(
  assignmentResultsSource,
  /submitted: hasRuntimeDisplayText\(submittedAnswer\?\.answer\)/,
  'Assignment attempt review answers should derive submitted state through the shared runtime display-text helper.'
);
assert.match(
  assignmentResultsSource,
  /completedAttemptAnswerMaps = completedAttempts\.map\([\s\S]*buildAttemptAnswerMapByItemId\(attempt\.answersJson\.answers\)[\s\S]*completedAttemptAnswerMaps\.flatMap\([\s\S]*answerMap\.get\(item\.id\)/,
  'Assignment result analysis should look up submitted answers through the shared item-id map helper.'
);
assert.match(
  activityRuntimeDisplaySource,
  /export function getRuntimeDisplayAcceptedAnswers[\s\S]*normalizeRuntimeDisplayList\(getAcceptedAnswers\(answer\)\)[\s\S]*normalizeRuntimeDisplayText\(answer\)/,
  'Runtime display accepted answers should share parser and display normalization in one activity-domain helper.'
);
assert.match(
  assignmentResultsSource,
  /function getResultAcceptedAnswers\(answer: string\)[\s\S]*getRuntimeDisplayAcceptedAnswers\(answer\)/,
  'Assignment result analysis should delegate accepted-answer display normalization to the shared runtime helper.'
);
assert.doesNotMatch(
  assignmentResultsSource,
  /limit: 3/,
  'Assignment result analysis should not keep a local review-priority limit.'
);
assert.doesNotMatch(
  assignmentResultsSource,
  /normalizeRuntimeDisplayList\(getAcceptedAnswers\(answer\)\)/,
  'Assignment result analysis should not duplicate accepted-answer display normalization.'
);
assert.doesNotMatch(
  assignmentResultsSource,
  /answer(?:\?|\.)\.answer\.trim\(\)|submittedAnswer\.answer\.trim\(\)/,
  'Assignment result analysis should not use ad hoc trim-only submitted-answer checks.'
);
assert.doesNotMatch(
  assignmentResultsSource,
  /answers\.find\([\s\S]*itemId === item\.id|new Map\(\s*attempt\.answersJson\.answers\.map/,
  'Assignment result analysis should not hand-roll submitted-answer item-id maps.'
);
const assignmentResultsExportSource = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
assert.match(
  assignmentResultsExportSource,
  /const statsView = buildAssignmentAttemptStatsView\(data\.stats\)/,
  'Assignment CSV export should format aggregate metrics through the shared attempt stats view.'
);
assert.match(
  assignmentResultsExportSource,
  /formatAssignmentResultCsvNumber\(statsView\.completions[\s\S]*formatAssignmentResultCsvNumber\(storedAttempt\?\.score \?\? attempt\.score[\s\S]*formatAssignmentResultCsvNumber\(studentSummary\?\.needsReviewCount/,
  'Assignment CSV export should format numeric cells through the shared result-format CSV helper.'
);
assert.match(
  assignmentResultsExportSource,
  /formatAssignmentResultStudentLabel\(attempt\.studentLabel\)/,
  'Assignment CSV export should format student labels through the shared result-display helper.'
);
assert.match(
  assignmentResultsExportSource,
  /const assignmentTitle = formatAssignmentDisplayTitle\(data\.assignment\.title\)[\s\S]*const shareSlug = normalizeAssignmentShareSlug\(data\.assignment\.shareSlug\)[\s\S]*assignmentTitle,[\s\S]*shareSlug,/,
  'Assignment CSV export should normalize assignment title and share slug before writing display columns.'
);
assert.match(
  assignmentResultsExportSource,
  /const exportSettings = buildAssignmentExportSettings\(settings\)[\s\S]*formatAssignmentDeliveryPolicyText\(\{[\s\S]*settings: exportSettings[\s\S]*exportSettings\.instructions \?\? ''[\s\S]*formatAssignmentExportText\(answer\.prompt\)[\s\S]*formatAssignmentExportText\(answer\.explanation\)/,
  'Assignment CSV export should format delivery policy, instructions, prompt, and explanation cells through the shared text helper.'
);
assert.doesNotMatch(
  assignmentResultsExportSource,
  /data\.stats\.completions > 0/,
  'Assignment CSV export should not use a local raw completion-count check for average duration.'
);
assert.doesNotMatch(
  assignmentResultsExportSource,
  /function formatAssignmentExportNumber/,
  'Assignment CSV export should not keep local numeric cell formatting.'
);
assert.doesNotMatch(
  assignmentResultsExportSource,
  /\battempt\.studentLabel,|\banswer\.prompt,|\bsettings\.instructions \?\?|\banswer\.explanation \?\?|data\.assignment\.title,|data\.assignment\.shareSlug,/,
  'Assignment CSV export should not write raw student labels, assignment titles, share slugs, prompts, instructions, or explanations directly.'
);
assert.match(
  assignmentResultsExportSource,
  /ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS[\s\S]*shareSlugMaxLength: 48[\s\S]*titleMaxLength: 80/,
  'Assignment results export filename limits should be named for title and share slug.'
);
assert.match(
  assignmentResultsExportSource,
  /maxLength = ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS\.titleMaxLength[\s\S]*slice\(0, maxLength\)/,
  'Assignment results export filename truncation should reuse named limits through the shared slug helper.'
);
assert.match(
  assignmentResultsExportSource,
  /slugifyFilename\(\s*normalizeAssignmentShareSlug\(data\.assignment\.shareSlug\),[\s\S]*ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS\.shareSlugMaxLength/,
  'Assignment results export filenames should include a bounded share slug segment.'
);
assert.doesNotMatch(
  assignmentResultsExportSource,
  /ASSIGNMENT_RESULTS_EXPORT_TITLE_MAX_LENGTH|slice\(0, 80\)/,
  'Assignment results export filenames should not keep local title length limits.'
);
const assignmentPublishSource = readFileSync(
  'src/assignments/publish-input.ts',
  'utf8'
);
assert.match(
  assignmentPublishSource,
  /ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS[\s\S]*minLeadMinutes: 1[\s\S]*millisecondsPerSecond: 1000[\s\S]*secondsPerMinute: 60/,
  'Assignment publish close-after helpers should expose named time-unit constants.'
);
assert.match(
  assignmentPublishSource,
  /ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS\.minLeadMinutes[\s\S]*ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS\.secondsPerMinute[\s\S]*ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS\.millisecondsPerSecond/,
  'Assignment publish close-after minimum should reuse the named time units.'
);
assert.doesNotMatch(
  assignmentPublishSource,
  /60 \* 1000|60000/,
  'Assignment publish close-after helpers should not keep local millisecond constants.'
);
const publicAssignmentSource = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
assert.match(
  publicAssignmentSource,
  /PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES[\s\S]*max: 20[\s\S]*min: 5[\s\S]*perItem: 2/,
  'Public assignment estimated minutes should expose named domain limits.'
);
assert.match(
  publicAssignmentSource,
  /normalizeRuntimeDisplayCount\(itemCount\)[\s\S]*normalizedItemCount \* PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES\.perItem/,
  'Public assignment estimated minutes should normalize item count and reuse the per-item estimate.'
);
assert.match(
  publicAssignmentSource,
  /submitted: hasRuntimeDisplayText\(answer\?\.answer\)/,
  'Public attempt review items should derive submitted state through the shared runtime display-text helper.'
);
assert.match(
  publicAssignmentSource,
  /return runtimeItems\.map\(\(item\) =>[\s\S]*buildPublicAttemptReviewItem\(\{[\s\S]*answer: answerByItemId\.get\(item\.id\),[\s\S]*item,/,
  'Public attempt review lists should delegate per-item sanitization to the public review item helper.'
);
assert.match(
  publicAssignmentSource,
  /const answerByItemId = buildAttemptAnswerMapByItemId\(answers\)/,
  'Public attempt review lists should look up submitted answers through the shared item-id map helper.'
);
assert.match(
  publicAssignmentSource,
  /function buildPublicAttemptReviewItem[\s\S]*const acceptedAnswers = getRuntimeDisplayAcceptedAnswers\(item\.answer\)[\s\S]*acceptedAnswers,[\s\S]*correct: Boolean\(answer\?\.correct\),[\s\S]*correctAnswer: normalizeRuntimeDisplayText\([\s\S]*explanation: normalizeOptionalRuntimeDisplayText\(item\.explanation\),[\s\S]*itemId: item\.id,[\s\S]*submitted: hasRuntimeDisplayText\(answer\?\.answer\)/,
  'Public attempt review items should explicitly pick the only fields allowed in post-submit student review payloads.'
);
assert.match(
  publicAssignmentSource,
  /export function buildPublicAttemptResult[\s\S]*accuracy: result\.accuracy,[\s\S]*completedItemCount: result\.completedItemCount,[\s\S]*correctItemCount: result\.correctItemCount,[\s\S]*durationSeconds: result\.durationSeconds,[\s\S]*earnedPoints: result\.earnedPoints,[\s\S]*totalPoints: result\.totalPoints/,
  'Public attempt results should explicitly pick the only score fields allowed in student submission responses.'
);
assert.match(
  publicAssignmentSource,
  /activity: buildPublicAssignmentActivitySummary\(\{[\s\S]*activity,[\s\S]*description: resolvedSource\.activityDescription,[\s\S]*templateType,[\s\S]*title: resolvedSource\.activityTitle/,
  'Public assignment payload should delegate activity metadata sanitization to the public activity summary helper.'
);
assert.match(
  publicAssignmentSource,
  /assignment: buildPublicAssignmentDeliverySummary\(\{[\s\S]*assignment,[\s\S]*settings,[\s\S]*shareSlug/,
  'Public assignment payload should delegate assignment metadata sanitization to the public delivery summary helper.'
);
assert.match(
  publicAssignmentSource,
  /function buildPublicAssignmentActivitySummary[\s\S]*description,[\s\S]*id: activity\.id,[\s\S]*templateType,[\s\S]*title,[\s\S]*visibility: activity\.visibility/,
  'Public activity metadata should explicitly pick the only activity fields allowed in student payloads.'
);
assert.match(
  publicAssignmentSource,
  /function buildPublicAssignmentDeliverySummary[\s\S]*expiresAt: assignment\.expiresAt,[\s\S]*id: assignment\.id,[\s\S]*settingsJson: buildPublicAssignmentSettings\(settings\),[\s\S]*shareSlug,[\s\S]*status: assignment\.status,[\s\S]*title: formatAssignmentDisplayTitle\(assignment\.title\)/,
  'Public assignment metadata should explicitly pick the only assignment fields allowed in student payloads and normalize title display text.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /title: assignment\.title|title: data\.assignment\.title/,
  'Public assignment payload and preview seeds should not expose raw assignment titles.'
);
assert.match(
  publicAssignmentSource,
  /function buildPublicAssignmentSettings[\s\S]*collectStudentName: settings\.collectStudentName,[\s\S]*instructions: formatAssignmentDeliveryInstructions\(settings\.instructions\),[\s\S]*maxAttempts: settings\.maxAttempts,[\s\S]*showCorrectAnswers: settings\.showCorrectAnswers,[\s\S]*shuffleItems: settings\.shuffleItems,[\s\S]*timeLimitSeconds: settings\.timeLimitSeconds/,
  'Public assignment settings should explicitly pick the only delivery-rule fields allowed in student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /instructions: settings\.instructions/,
  'Public assignment settings should not expose raw student instructions.'
);
assert.match(
  publicAssignmentSource,
  /summary: buildPublicAssignmentSummary\(\{[\s\S]*content,[\s\S]*itemCount: orderedRuntimeItems\.length/,
  'Public assignment payload should delegate summary sanitization to the public assignment summary helper.'
);
assert.match(
  publicAssignmentSource,
  /snapshot: buildPublicAssignmentSnapshotSummary\(snapshot\)/,
  'Public assignment payload should delegate snapshot sanitization to the public assignment snapshot helper.'
);
assert.match(
  publicAssignmentSource,
  /function buildPublicAssignmentSnapshotSummary[\s\S]*activityDescription: snapshot\.activityDescription,[\s\S]*activityTitle: snapshot\.activityTitle,[\s\S]*templateType: snapshot\.templateType/,
  'Public assignment snapshot should explicitly pick the only snapshot fields allowed in student payloads.'
);
assert.match(
  publicAssignmentSource,
  /function buildPublicAssignmentSummary[\s\S]*difficulty: content\.difficulty,[\s\S]*estimatedMinutes: estimateAssignmentMinutes\(itemCount\),[\s\S]*gradeBand: content\.gradeBand,[\s\S]*itemCount: normalizeRuntimeDisplayCount\(itemCount\),[\s\S]*language: content\.language,[\s\S]*learningGoal: content\.learningGoal,[\s\S]*subject: content\.subject/,
  'Public assignment summary should explicitly pick the only content fields allowed in student payloads.'
);
assert.match(
  publicAssignmentSource,
  /return \{\s*choices,[\s\S]*id: item\.id,[\s\S]*kind: item\.kind,[\s\S]*prompt: normalizeRuntimeDisplayText\(item\.prompt\),[\s\S]*\};/,
  'Public runtime sanitization should explicitly pick the only fields allowed in student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /function buildPublicAssignmentSummary[\s\S]*sourceMaterials[\s\S]*export function stripRuntimeAnswers|summary: \{[\s\S]*sourceMaterials[\s\S]*runtimeItems: stripRuntimeAnswers/,
  'Public assignment summary should not expose source material references.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /function buildPublicAssignmentSnapshotSummary[\s\S]*(?:contentJson|sourceMaterials|\.{3}snapshot)[\s\S]*function buildPublicAssignmentSummary/,
  'Public assignment snapshot should not expose frozen content or source material references.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /function buildPublicAssignmentActivitySummary[\s\S]\.\.\.activity[\s\S]*function buildPublicAssignmentDeliverySummary|function buildPublicAssignmentDeliverySummary[\s\S]\.\.\.assignment[\s\S]*function buildPublicAssignmentSnapshotSummary/,
  'Public activity and assignment metadata should not spread source rows into student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /function buildPublicAssignmentSettings[\s\S]\.\.\.settings[\s\S]*function buildPublicAssignmentSnapshotSummary/,
  'Public assignment settings should not spread resolved settings into student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /stripRuntimeAnswer[\s\S]*\.\.\.item/,
  'Public runtime sanitization should not spread runtime items into student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /function buildPublicAttemptReviewItem[\s\S]*(?:\.\.\.item|\.\.\.answer)[\s\S]*function buildAttemptReviewItems/,
  'Public attempt review item sanitization should not spread runtime items or stored answers into student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /new Map\(\s*answers\.map\(\(answer\) => \[answer\.itemId, answer\]\)/,
  'Public attempt review lists should not hand-roll submitted-answer item-id maps.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /function buildPublicAttemptResult[\s\S]\.\.\.result[\s\S]*export function buildPublicAssignmentPreviewActivity/,
  'Public attempt result sanitization should not spread scorer results into student payloads.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /Math\.max\(5, Math\.min\(20, itemCount \* 2\)\)/,
  'Public assignment estimated minutes should not keep local numeric limits.'
);
assert.doesNotMatch(
  publicAssignmentSource,
  /answer\?\.answer\.trim\(\)/,
  'Public attempt review items should not use ad hoc trim-only submitted-answer checks.'
);
const activityLibraryViewSource = readFileSync(
  'src/activities/library-view.ts',
  'utf8'
);
assert.match(
  activityLibraryViewSource,
  /ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS[\s\S]*lockedTemplateDiagnostics: 2[\s\S]*remixActionOptions: 3/,
  'Activity library compatibility view should expose named display limits.'
);
assert.match(
  activityLibraryViewSource,
  /ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS\.lockedTemplateDiagnostics[\s\S]*ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS\.remixActionOptions/,
  'Activity library compatibility view should reuse named display limits.'
);
assert.doesNotMatch(
  activityLibraryViewSource,
  /slice\(0, 2\)|slice\(0, 3\)/,
  'Activity library compatibility view should not keep local display limits.'
);
assert.match(
  activityLibraryViewSource,
  /formatActivityLibraryTemplateShortNameList[\s\S]*activity_library_template_list_separator/,
  'Activity library remix hints should format template short-name lists through localized domain copy.'
);
assert.match(
  activityLibraryViewSource,
  /formatActivityLibraryTemplateShortNameList[\s\S]*normalizeRuntimeDisplayText/,
  'Activity library remix hints should normalize template short names through the shared display helper.'
);
assert.match(
  activityLibraryViewSource,
  /buildActivityLibraryRemixActionLabel[\s\S]*normalizeRuntimeDisplayText\(shortName\)/,
  'Activity library remix action labels should normalize template short names through the shared display helper.'
);
assert.doesNotMatch(
  activityLibraryViewSource,
  /join\(', '\)/,
  'Activity library remix hints should not hard-code visible template list separators.'
);
assert.doesNotMatch(
  activityLibraryViewSource,
  /shortName\.trim\(\)/,
  'Activity library remix labels should not fall back to trim-only template short-name cleanup.'
);
const activityPreviewSource = readFileSync(
  'src/components/activities/activity-preview.tsx',
  'utf8'
);
const activitySourceMaterialsFieldSource = readFileSync(
  'src/components/activities/activity-source-materials-field.tsx',
  'utf8'
);
const activitySourceMaterialsSummarySource = readFileSync(
  'src/components/activities/activity-source-materials-summary.tsx',
  'utf8'
);
const activityPreviewViewSource = readFileSync(
  'src/activities/preview-view.ts',
  'utf8'
);
const activityPreviewFixture = {
  content: buildActivityContent({
    description: 'Preview description',
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groupsText:
      'Group A | one, two\nGroup B | three\nGroup C | four\nGroup D | five',
    language: 'en',
    learningGoal: 'Students reuse one activity across templates.',
    pairsText: 'A | 1\nB | 2\nC | 3\nD | 4\nE | 5',
    questionsText: 'Q1? | A\nQ2? | B\nQ3? | C\nQ4? | D\nQ5? | E',
    sourceSummary: 'Preview fixture',
    subject: 'ELA',
    teacherNotesText: 'Review before publishing.',
    templateType: 'quiz',
    title: 'Preview activity',
    visibility: 'draft',
    vocabularyText: 'one, two, three',
  }),
  description: 'Preview description',
  estimatedMinutes: 9,
  id: 'preview-activity',
  status: 'draft' as const,
  templateType: 'quiz' as const,
  title: 'Preview activity',
};
const activityPreviewView = buildActivityPreviewViewModel({
  activity: activityPreviewFixture,
  assignment: {
    activityId: 'preview-activity',
    averageScore: 74,
    completions: 6,
    expiresAt: null,
    id: 'preview-assignment',
    settings: {
      collectStudentName: true,
      showCorrectAnswers: true,
      shuffleItems: false,
    },
    shareId: 'preview-share',
    status: 'published',
    title: 'Preview assignment',
  },
});
assert.deepEqual(
  {
    actionLabels: activityPreviewView.panel.actions?.map(
      (action) => action.label
    ),
    groupSummaries: activityPreviewView.content.visibleGroups.map(
      (group) => group.summaryText
    ),
    groupCount: activityPreviewView.content.visibleGroups.length,
    pairCount: activityPreviewView.content.visiblePairs.length,
    pairSummaries: activityPreviewView.content.visiblePairs.map(
      (pair) => pair.summaryText
    ),
    questionCount: activityPreviewView.content.visibleQuestions.length,
    questionSummaries: activityPreviewView.content.visibleQuestions.map(
      (question) => question.summaryText
    ),
    metrics: activityPreviewView.metrics,
    templateName: activityPreviewView.templateName,
  },
  {
    actionLabels: ['Create activity', 'Open student preview'],
    groupSummaries: ['Group A: one, two', 'Group B: three', 'Group C: four'],
    groupCount: 3,
    pairCount: 4,
    pairSummaries: ['A -> 1', 'B -> 2', 'C -> 3', 'D -> 4'],
    questionCount: 3,
    questionSummaries: ['Q1?', 'Q2?', 'Q3?'],
    metrics: {
      classroomMode: 'Individual',
      estimatedTime: '9 min',
      resultTarget: '6 completions · 74% avg',
    },
    templateName: 'Quiz',
  }
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    buildActivityPreviewViewModel({
      activity: activityPreviewFixture,
    }).content.visibleGroups[0]?.summaryText,
    'Group A：one、two'
  );
  assert.equal(
    buildActivityPreviewViewModel({
      activity: activityPreviewFixture,
    }).content.visiblePairs[0]?.summaryText,
    'A → 1'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  buildDefaultActivityPreviewPanel().actions?.map((action) => action.to),
  [Routes.Create, Routes.StudentPreview]
);
assert.match(
  activityPreviewViewSource,
  /ACTIVITY_PREVIEW_CONTENT_LIMITS[\s\S]*groups: 3[\s\S]*pairs: 4[\s\S]*questions: 3/,
  'Activity preview content slices should expose named display limits.'
);
for (const key of ['questions', 'pairs', 'groups']) {
  assert.match(
    activityPreviewViewSource,
    new RegExp(`ACTIVITY_PREVIEW_CONTENT_LIMITS\\.${key}`),
    `Activity preview should reuse the named ${key} display limit.`
  );
}
assert.doesNotMatch(
  activityPreviewViewSource,
  /slice\(0, 3\)|slice\(0, 4\)/,
  'Activity preview should not keep local content slice limits.'
);
assert.match(
  activityPreviewViewSource,
  /formatActivityPreviewGroupItems[\s\S]*activity_preview_group_item_separator/,
  'Activity preview group summaries should format item lists through localized domain copy.'
);
assert.doesNotMatch(
  activityPreviewViewSource,
  /group\.items\.join\(', '\)/,
  'Activity preview group summaries should not hard-code visible item list separators.'
);
assert.match(
  activityPreviewSource,
  /buildActivityPreviewViewModel/,
  'Activity preview component should consume the activity-domain preview view-model.'
);
assert.doesNotMatch(
  activityPreviewSource,
  /ACTIVITY_PREVIEW_CONTENT_LIMITS|const visibleQuestions|const visiblePairs|const visibleGroups|buildDefaultActivityPreviewPanel|question\.prompt|group\.label|group\.items\.join|pair\.left|pair\.right/,
  'Activity preview component should not rebuild content slices, question, pair, or group summary text, or default panel state.'
);
assert.match(
  activityPreviewSource,
  /question\.summaryText[\s\S]*pair\.summaryText[\s\S]*group\.summaryText/,
  'Activity preview component should render prepared question, pair, and group summary text.'
);
assert.match(
  activitySourceMaterialsFieldSource,
  /buildActivitySourceMaterialSummaryView\(selectedMaterials\)/,
  'Activity source-material picker should reuse the activity-domain material summary view.'
);
assert.match(
  activitySourceMaterialsFieldSource,
  /ActivitySourceMaterialsSummary[\s\S]*summary=\{selectedSummary\}/,
  'Activity source-material picker should render attached material readiness through the summary component.'
);
assert.match(
  activitySourceMaterialsFieldSource,
  /formatActivitySourceMaterialReferenceMeta/,
  'Activity source-material picker should format material row metadata through the activity-domain helper.'
);
assert.doesNotMatch(
  activitySourceMaterialsFieldSource,
  /join\(' \/ '\)/,
  'Activity source-material picker should not hard-code visible material metadata separators.'
);
assert.match(
  activitySourceMaterialsSummarySource,
  /ActivitySourceMaterialSummaryView/,
  'Activity source-material summary component should consume the activity-domain summary view contract.'
);
assert.match(
  activitySourceMaterialsSummarySource,
  /summary\.kindBadges[\s\S]*summary\.extractionActions/,
  'Activity source-material summary component should render material kinds and extraction readiness actions.'
);
assert.doesNotMatch(
  activitySourceMaterialsSummarySource,
  /\{(?:badge\.label|action\.label)\}\s*·\s*\{(?:badge\.count|action\.sourceCount)\}/,
  'Activity source-material summary component should not hand-compose visible source-material count separators.'
);
assert.match(
  activitySourceMaterialsSummarySource,
  /badge\.summaryText[\s\S]*action\.summaryText/,
  'Activity source-material summary component should render prepared source-material metric text.'
);
assert.doesNotMatch(
  activitySourceMaterialsSummarySource,
  /action\.sourceCount|action\.sourceKindCounts/,
  'Activity source-material summary component should not rebuild extraction source counts locally.'
);
assert.doesNotMatch(
  activitySourceMaterialsFieldSource,
  /hasAudio|hasSpreadsheet|hasWorksheet|worksheet-extraction|audio-extraction|spreadsheet-import/,
  'Activity source-material picker should not recalculate extraction readiness locally.'
);
const sourceMaterialsUserFilesApiSource = readFileSync(
  'src/api/user-files.ts',
  'utf8'
);
assert.match(
  sourceMaterialsUserFilesApiSource,
  /export const listUserFileMaterials[\s\S]*return \{[\s\S]*items,[\s\S]*total: totalRow\?\.count \?\? 0,[\s\S]*\}/,
  'Activity source-material picker API should return an object with items and total, matching the hook/component contract.'
);
assert.match(
  activitySourceMaterialsFieldSource,
  /\(data\?\.items \?\? \[\]\)\.flatMap/,
  'Activity source-material picker should read available files from the material list response items.'
);
assert.match(
  activitySourceMaterialsFieldSource,
  /USER_FILE_MATERIAL_PICKER_PAGE_SIZE/,
  'Activity source-material picker should reuse the storage-domain material picker page size.'
);
assert.doesNotMatch(
  activitySourceMaterialsFieldSource,
  /SOURCE_MATERIAL_PICKER_PAGE_SIZE|pageSize:\s*100|,\s*100,\s*\{\s*enabled:\s*canLoadFiles/,
  'Activity source-material picker should not keep local page-size rules.'
);
const activityEditorFormSource = readFileSync(
  'src/components/activities/activity-create-form.tsx',
  'utf8'
);
const activityDraftMetaSummarySource = readFileSync(
  'src/components/activities/activity-draft-meta-summary.tsx',
  'utf8'
);
const activityTemplateReadinessPanelSource = readFileSync(
  'src/components/activities/activity-template-readiness-panel.tsx',
  'utf8'
);
const activityEditorSource = readFileSync('src/activities/editor.ts', 'utf8');
assert.match(
  activityEditorSource,
  /ACTIVITY_EDITOR_READINESS_PANEL_LIMITS[\s\S]*lockedOptions: 4/,
  'Activity editor domain should expose its locked-option display limit.'
);
assert.match(
  activityEditorSource,
  /ACTIVITY_EDITOR_READINESS_PANEL_LIMITS\.lockedOptions/,
  'Activity editor domain should reuse the named locked-option limit.'
);
assert.match(
  activityEditorSource,
  /formatEditorGroupRows[\s\S]*formatEditorQuestionRows[\s\S]*formatEditorInlineList/,
  'Activity editor should serialize structured content back into form text through shared editor serialization helpers.'
);
assert.doesNotMatch(
  activityEditorSource,
  /group\.items\.join\(', '\)|options\.join\(', '\)|vocabulary\.join\(', '\)/,
  'Activity editor should not hand-compose editor text list separators locally.'
);
assert.match(
  activityEditorFormSource,
  /ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS/,
  'Activity editor AI draft item-count options should come from the AI draft domain contract.'
);
assert.match(
  activityEditorFormSource,
  /ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE\.default/,
  'Activity editor AI draft item-count default should come from the AI draft domain contract.'
);
assert.doesNotMatch(
  activityEditorFormSource,
  /summary\.lockedOptions\.slice\(0, 4\)/,
  'Activity editor readiness panel should not keep a local locked-option display limit.'
);
assert.match(
  activityEditorFormSource,
  /buildActivityEditorTemplateView/,
  'Activity editor form should consume the activity-domain template view.'
);
assert.match(
  activityEditorFormSource,
  /buildActivityEditorDraftGenerationGate/,
  'Activity editor form should consume the activity-domain AI draft gate.'
);
assert.match(
  activityEditorFormSource,
  /buildActivityEditorAiDraftPanelView/,
  'Activity editor form should consume the activity-domain AI draft panel view.'
);
assert.match(
  activityEditorFormSource,
  /buildActivityEditorTemplateScaffoldApplication/,
  'Activity editor form should apply template scaffolds through the activity-domain helper.'
);
assert.match(
  activityEditorFormSource,
  /buildActivityEditorSaveGate/,
  'Activity editor form should consume the activity-domain save gate.'
);
assert.match(
  activityEditorFormSource,
  /ActivityDraftMetaSummary[\s\S]*result=\{draftResult\}/,
  'Activity editor form should delegate AI draft review summary rendering.'
);
assert.match(
  activityEditorFormSource,
  /ActivityTemplateReadinessPanel[\s\S]*summary=\{templateView\.readinessSummary\}/,
  'Activity editor form should delegate template-readiness panel rendering.'
);
assert.match(
  activityEditorFormSource,
  /const scaffoldSummary = templateView\.setupView\.scaffoldSummary[\s\S]*scaffoldSummary\.runtimeItemLabel[\s\S]*scaffoldSummary\.readyTemplateLabel[\s\S]*scaffoldSummary\.coverageMetrics\.map[\s\S]*scaffoldSummary\.readyTemplateOptions\.map/,
  'Activity editor form should render scaffold coverage from the activity-domain setup view.'
);
assert.doesNotMatch(
  activityEditorFormSource,
  /getActivityTemplates|getTemplateByType|getActivityDraftSourceText|hasActivitySourceMaterialDraftNotes|appendActivitySourceMaterialDraftNotes|getActivityTemplateScaffold|buildActivityEditorTemplateSetupView|buildActivityEditorTemplateReadiness|buildActivityTemplateReadinessPanelSummary|activityDifficultySchema|activityVisibilitySchema|formatActivityDifficulty|formatActivityVisibility|activity_form_ai_draft_badge|activity_form_ai_draft_review_note|activity_form_ai_source_label|activity_form_ai_source_placeholder|activity_form_ai_item_count_label|activity_form_use_attached_materials|activity_form_generate_draft|activity_form_toast_source_materials_synced/,
  'Activity editor form should not rebuild template, draft-source, readiness, scaffold, AI panel copy, or option-label state locally.'
);
assert.doesNotMatch(
  activityEditorFormSource,
  /function ActivityDraftMetaSummary|function ActivityTemplateReadinessPanel|function ActivityDraftCoverageStat|buildActivityDraftMetaSummaryView|ActivityTemplateReadinessPanelSummary/,
  'Activity editor form should not own AI draft summary or readiness panel display components.'
);
assert.match(
  activityEditorSource,
  /formatTemplateRequirements\([\s\S]*template\.contentRequirements/,
  'Activity editor template setup should use the activity-domain requirement list formatter.'
);
assert.doesNotMatch(
  activityEditorSource,
  /template\.contentRequirements\.map\(\(requirement\) =>[\s\S]*formatTemplateRequirement\(requirement\)/,
  'Activity editor template setup should not map template requirement labels locally.'
);
assert.match(
  activityDraftMetaSummarySource,
  /buildActivityDraftMetaSummaryView/,
  'AI draft summary component should consume the activity-domain draft summary view-model.'
);
assert.match(
  activityDraftMetaSummarySource,
  /ActivityDraftResult/,
  'AI draft summary component should accept the server draft result contract.'
);
assert.match(
  activityDraftMetaSummarySource,
  /summaryView\.templateReadinessOptions[\s\S]*summaryView\.reviewChecklist/,
  'AI draft summary component should render reviewable readiness and checklist details.'
);
assert.match(
  activityDraftMetaSummarySource,
  /ActivityDraftCoverageStat[\s\S]*stat=\{stat\}/,
  'AI draft summary component should pass prepared coverage stat views into the coverage stat component.'
);
assert.doesNotMatch(
  activityDraftMetaSummarySource,
  /<ActivityDraftCoverageStat[\s\S]*label=\{stat\.label\}[\s\S]*value=\{stat\.value\}/,
  'AI draft summary component should not split coverage stat view props in the list renderer.'
);
assert.doesNotMatch(
  activityDraftMetaSummarySource,
  /\{summaryView\.(?:modelLabel|noticeLabel)\}:/,
  'AI draft summary component should not hand-compose visible model or notice separators.'
);
assert.match(
  activityDraftMetaSummarySource,
  /summaryView\.modelLineText[\s\S]*summaryView\.noticeLineText/,
  'AI draft summary component should render prepared model and notice text lines.'
);
const activityDraftMetaSource = readFileSync(
  'src/activities/draft-meta.ts',
  'utf8'
);
assert.match(
  activityDraftMetaSource,
  /formatActivityDraftTemplateList[\s\S]*activity_draft_meta_template_list_separator/,
  'AI draft meta should format suggested template lists through localized separators.'
);
assert.doesNotMatch(
  activityDraftMetaSource,
  /suggestedTemplates\.join\(', '\)/,
  'AI draft meta should not hard-code English separators in teacher-visible checklist copy.'
);
assert.match(
  activityDraftMetaSource,
  /normalizeRuntimeDisplayText\(model\)/,
  'AI draft meta should normalize provider model names with the shared runtime display helper.'
);
assert.match(
  activityDraftMetaSource,
  /normalizeOptionalRuntimeDisplayText\(notice\)/,
  'AI draft meta should normalize optional generation notices with the shared runtime display helper.'
);
assert.doesNotMatch(
  activityDraftMetaSource,
  /model\.trim\(\)/,
  'AI draft meta should not fall back to trim-only model name cleanup.'
);
assert.match(
  activityEditorSource,
  /buildActivityEditorDraftSuccessMessage[\s\S]*normalizeOptionalRuntimeDisplayText\(notice\)/,
  'Activity editor draft success copy should classify fallback notices through shared display normalization.'
);
assert.match(
  activityTemplateReadinessPanelSource,
  /ActivityTemplateReadinessPanelSummary/,
  'Template-readiness panel should consume the activity-domain readiness summary contract.'
);
assert.match(
  activityTemplateReadinessPanelSource,
  /summary\.readyOptions[\s\S]*summary\.lockedOptions/,
  'Template-readiness panel should render ready and locked template diagnostics from the summary.'
);
assert.doesNotMatch(
  activityEditorFormSource,
  /const draftItemCountOptions = \[3, 5, 8, 10\]|useState\(5\)/,
  'Activity editor should not keep local AI draft item-count options or defaults.'
);
const entityIdSource = readFileSync('src/lib/entity-id.ts', 'utf8');
assert.match(
  entityIdSource,
  /APP_ENTITY_ID_LENGTH[\s\S]*generated: 16/,
  'Generated app entity ids should expose a shared length constant.'
);
const activityDashboardRouteSource = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const activityDashboardCardSource = readFileSync(
  'src/components/activities/activity-library-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  activityDashboardRouteSource,
  /error\.message|error instanceof Error/,
  'Activity dashboard actions should use localized action failure copy instead of raw server or network errors.'
);
assert.doesNotMatch(
  activityDashboardCardSource,
  /error\.message|error instanceof Error/,
  'Activity dashboard card actions should use localized action failure copy instead of raw server or network errors.'
);
assert.match(
  activityDashboardCardSource,
  /toast\.error\(actionView\.failureMessage\)/,
  'Activity remix and duplicate failures should use localized derivative action failure copy.'
);
assert.match(
  activityDashboardCardSource,
  /toast\.error\(actionCopy\.failureMessage\)/,
  'Activity archive and restore failures should use localized lifecycle action failure copy.'
);
const assignmentDashboardRouteSource = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const assignmentDashboardCardSource = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  assignmentDashboardRouteSource,
  /error\.message|error instanceof Error/,
  'Assignment dashboard status actions should use localized action failure copy instead of raw server or network errors.'
);
assert.doesNotMatch(
  assignmentDashboardCardSource,
  /error\.message|error instanceof Error/,
  'Assignment dashboard card status actions should use localized action failure copy instead of raw server or network errors.'
);
assert.match(
  assignmentDashboardCardSource,
  /toast\.error\(plan\.failureMessage\)/,
  'Assignment close and reopen failures should use localized status action failure copy.'
);
const activityPublishDialogSource = readFileSync(
  'src/components/activities/activity-publish-dialog.tsx',
  'utf8'
);
const activityPublishSettingsFormSource = readFileSync(
  'src/components/activities/activity-publish-settings-form.tsx',
  'utf8'
);
const templatesRouteSource = readFileSync('src/routes/templates.tsx', 'utf8');
const templateDirectoryCardSource = readFileSync(
  'src/components/activities/template-directory-card.tsx',
  'utf8'
);
const worksheetsRouteSource = readFileSync('src/routes/worksheets.tsx', 'utf8');
const worksheetModeCardSource = readFileSync(
  'src/components/activities/worksheet-mode-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  activityPublishDialogSource,
  /error\.message|error instanceof Error/,
  'Assignment publish failures should use localized publish action copy instead of raw server or network errors.'
);
assert.match(
  activityPublishDialogSource,
  /toast\.error\(actionView\.failureMessage\)/,
  'Assignment publish failures should use localized publish failure copy.'
);
assert.match(
  activityPublishSettingsFormSource,
  /min=\{buildAssignmentPublishCloseAfterMinLocal\(\)\}/,
  'Assignment publish close-time input minimum should come from the assignment publish domain helper.'
);
assert.match(
  activityPublishSettingsFormSource,
  /ASSIGNMENT_PUBLISH_FIELD_LIMITS\.instructionsMaxLength/,
  'Assignment publish instructions input length should reuse the assignment-domain field limit.'
);
assert.match(
  activityPublishSettingsFormSource,
  /ASSIGNMENT_MAX_ATTEMPTS_RANGE\.min[\s\S]*ASSIGNMENT_MAX_ATTEMPTS_RANGE\.max/,
  'Assignment publish max-attempts input bounds should reuse the assignment-domain attempt range.'
);
assert.match(
  activityPublishSettingsFormSource,
  /ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE\.min[\s\S]*ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE\.max/,
  'Assignment publish timer input bounds should reuse the assignment-domain timer range.'
);
assert.doesNotMatch(
  `${activityPublishDialogSource}\n${activityPublishSettingsFormSource}`,
  /maxLength=\{500\}|min=\{1\}|max=\{10\}|max=\{180\}/,
  'Assignment publish surfaces should not keep local field or numeric bounds.'
);
assert.match(
  activityPublishDialogSource,
  /buildAssignmentPublishDialogViewModel/,
  'Assignment publish dialog should consume the assignment-domain dialog view-model.'
);
assert.match(
  activityPublishDialogSource,
  /ActivityPublishSettingsForm[\s\S]*draft=\{publishView\.draft\}[\s\S]*view=\{publishView\}/,
  'Assignment publish dialog should delegate settings inputs and preview rendering.'
);
assert.match(
  activityPublishSettingsFormSource,
  /AssignmentPublishDialogViewModel[\s\S]*AssignmentPublishDraft/,
  'Assignment publish settings form should consume the assignment-domain dialog view-model and draft contract.'
);
assert.match(
  activityPublishSettingsFormSource,
  /AssignmentSettingsSummary[\s\S]*view\.preview\.settings/,
  'Assignment publish settings form should render the delivery preview from the assignment-domain view-model.'
);
assert.doesNotMatch(
  activityPublishDialogSource,
  /buildAssignmentPublishDraft\(|buildAssignmentPublishPreviewFromDraft|validateAssignmentPublishDraft|buildAssignmentPublishDialogState|buildAssignmentPublishToggleViews|AssignmentSettingsSummary|ASSIGNMENT_PUBLISH_FIELD_LIMITS|ASSIGNMENT_MAX_ATTEMPTS_RANGE|ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE|buildAssignmentPublishCloseAfterMinLocal|function PublishSetting|<Input|<Textarea|<Switch/,
  'Assignment publish dialog should not rebuild draft, preview, validation, dialog state, field bounds, or setting controls directly.'
);
assert.match(
  templatesRouteSource,
  /TemplateDirectoryCard[\s\S]*template=\{template\}/,
  'Templates route should delegate template card rendering to the activity component.'
);
assert.match(
  templateDirectoryCardSource,
  /TemplatesPageViewModel\['cards'\]\[number\]/,
  'Template directory cards should consume the activity entry-page view-model card contract.'
);
assert.match(
  templateDirectoryCardSource,
  /template\.contentRequirements\.map[\s\S]*template\.action\.search/,
  'Template directory cards should own card requirement badges and create actions.'
);
assert.doesNotMatch(
  templatesRouteSource,
  /IconDeviceGamepad2|CardHeader|CardContent|contentRequirements\.map|template\.bestForLabel|template\.classroomModeLabel/,
  'Templates route should not rebuild low-level template card presentation locally.'
);
assert.match(
  worksheetsRouteSource,
  /WorksheetModeCard[\s\S]*mode=\{mode\}/,
  'Worksheets route should delegate worksheet mode card rendering to the activity component.'
);
assert.match(
  worksheetsRouteSource,
  /pageView\.printable\.title[\s\S]*pageView\.printable\.description/,
  'Worksheets route should render printable copy from the worksheet page view-model.'
);
assert.match(
  worksheetModeCardSource,
  /WorksheetsPageViewModel\['modeCards'\]\[number\]/,
  'Worksheet mode cards should consume the worksheet page view-model card contract.'
);
assert.match(
  worksheetModeCardSource,
  /worksheetModeIcons[\s\S]*satisfies Record<WorksheetModeTemplate, TablerIcon>/,
  'Worksheet mode card icon mapping should stay beside the reusable card presentation.'
);
assert.doesNotMatch(
  worksheetsRouteSource,
  /function WorksheetModeCard|const worksheetModeIcons|WorksheetModeTemplate|type TablerIcon|IconClipboardText|IconCategory2|IconLayoutColumns|IconHeadphones|m\.worksheets_page_printable_title|m\.worksheets_page_printable_description/,
  'Worksheets route should not rebuild worksheet card icons or printable copy locally.'
);
const publicPlayRouteSource = readFileSync(
  'src/routes/play/$shareId.tsx',
  'utf8'
);
assert.doesNotMatch(
  publicPlayRouteSource,
  /error\.message|error instanceof Error/,
  'Student attempt submission failures should use localized runner copy instead of raw server or network errors.'
);
assert.match(
  publicPlayRouteSource,
  /toast\.error\(resolveStudentAttemptSubmissionFailureMessage\(error\)\)/,
  'Student attempt submission failures should resolve through the safe localized failure helper.'
);
const assignmentResultRouteSource = readFileSync(
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'utf8'
);
const assignmentResultsMetricCardSource = readFileSync(
  'src/components/assignments/assignment-results-metric-card.tsx',
  'utf8'
);
const assignmentResultsHeaderCardSource = readFileSync(
  'src/components/assignments/assignment-results-header-card.tsx',
  'utf8'
);
const assignmentResultsClassroomBriefCardSource = readFileSync(
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'utf8'
);
const assignmentResultsStudentSearchSource = readFileSync(
  'src/components/assignments/assignment-results-student-search.tsx',
  'utf8'
);
const assignmentResultsAttemptReviewFilterSource = readFileSync(
  'src/components/assignments/assignment-results-attempt-review-filter-control.tsx',
  'utf8'
);
const assignmentResultsItemPerformanceSortSource = readFileSync(
  'src/components/assignments/assignment-results-item-performance-sort-control.tsx',
  'utf8'
);
const assignmentResultsItemPerformanceTableSource = readFileSync(
  'src/components/assignments/assignment-results-item-performance-table.tsx',
  'utf8'
);
const assignmentResultsStudentSummaryTableSource = readFileSync(
  'src/components/assignments/assignment-results-student-summary-table.tsx',
  'utf8'
);
const assignmentResultsAttemptsTableSource = readFileSync(
  'src/components/assignments/assignment-results-attempts-table.tsx',
  'utf8'
);
const assignmentResultsItemAnalysisCardSource = readFileSync(
  'src/components/assignments/assignment-results-item-analysis-card.tsx',
  'utf8'
);
const assignmentResultsAttemptReviewCardSource = readFileSync(
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'utf8'
);
const assignmentResultsEmptyStateSource = readFileSync(
  'src/components/assignments/assignment-results-empty-state.tsx',
  'utf8'
);
const assignmentResultDisplaySource = readFileSync(
  'src/assignments/result-display.ts',
  'utf8'
);
const assignmentResultFormatSource = readFileSync(
  'src/assignments/result-format.ts',
  'utf8'
);
const assignmentResultAnswerViewSource = readFileSync(
  'src/assignments/result-answer-view.ts',
  'utf8'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /attemptCount:\s*data\?\.attempts\.length/,
  'Assignment result actions should not unlock from raw stored attempt rows.'
);
assert.match(
  assignmentResultRouteSource,
  /buildAssignmentResultsPageViewModel/,
  'Assignment result route should consume the assignment-domain page view-model.'
);
assert.match(
  assignmentResultRouteSource,
  /buildAssignmentResultControlRouteSearch/,
  'Assignment result route should update result controls through the assignment-domain route search helper.'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /getAssignmentResultCompletedAttemptCount|filterAssignmentResultCompletedAttemptRows|buildAssignmentResultActionState|buildAssignmentResultSectionState|buildAssignmentResultMetricItems|buildAssignmentAttemptRowDisplay|buildAssignmentStudentSummaryRowView|buildAssignmentItemPerformanceRowView/,
  'Assignment result route should not rebuild completed-attempt, metric, action, section, attempt-row, student-row, or item-row state directly.'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /studentSummarySortOptions|itemPerformanceSortOptions|attemptReviewFilterOptions|buildAssignmentResultControlSearchState/,
  'Assignment result route should render result controls from pageView.controlViews instead of importing low-level option or search helpers.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsStudentSearch[\s\S]*view=\{pageView\.controlViews\.studentSearch\}/,
  'Assignment result route should delegate student search controls with the assignment-domain control view.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsItemPerformanceSortControl[\s\S]*view=\{pageView\.controlViews\.itemPerformanceSort\}/,
  'Assignment result route should delegate item performance controls with the assignment-domain control view.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsAttemptReviewFilterControl[\s\S]*view=\{pageView\.controlViews\.attemptReviewFilter\}/,
  'Assignment result route should delegate answer review controls with the assignment-domain control view.'
);
assert.match(
  assignmentResultRouteSource,
  /pageView\.contentState\.hasStudentSummaryRows/,
  'Assignment result route should render student-summary empty state from the assignment-domain content state.'
);
assert.match(
  assignmentResultRouteSource,
  /pageView\.contentState\.hasAttemptRows/,
  'Assignment result route should render attempt-row empty state from the assignment-domain content state.'
);
assert.match(
  assignmentResultRouteSource,
  /pageView\.contentState\.hasAttemptReviewCards/,
  'Assignment result route should render answer-review empty state from the assignment-domain content state.'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /filteredStudents\.length|filteredAttemptRows\.length|attemptReviewCardViews\.length/,
  'Assignment result route should not inspect filtered result array lengths directly.'
);
assert.match(
  assignmentResultViewSource,
  /controlViews:\s*AssignmentResultControlViews/,
  'Assignment result page view-model should expose route-ready control views.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsAttemptsTable[\s\S]*attempts=\{pageView\.attemptRowViews\}/,
  'Assignment result route should delegate attempt row rendering with the assignment-domain page view-model rows.'
);
assert.match(
  assignmentResultViewSource,
  /attemptRowViews: buildAssignmentAttemptRowViews|const attemptRowViews = data[\s\S]*buildAssignmentAttemptRowViews/,
  'Assignment result page view-model should own formatted attempt row views.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsStudentSummaryTable[\s\S]*students=\{pageView\.studentSummaryRowViews\}/,
  'Assignment result route should delegate student summary row rendering with the assignment-domain page view-model rows.'
);
assert.match(
  assignmentResultViewSource,
  /studentSummaryRowViews: buildAssignmentStudentSummaryRowViews|const studentSummaryRowViews = buildAssignmentStudentSummaryRowViews/,
  'Assignment result page view-model should own formatted student summary row views.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsItemPerformanceTable[\s\S]*items=\{pageView\.itemPerformanceRowViews\}/,
  'Assignment result route should delegate item performance row rendering with the assignment-domain page view-model rows.'
);
assert.match(
  assignmentResultViewSource,
  /itemPerformanceRowViews: buildAssignmentItemPerformanceRowViews|const itemPerformanceRowViews = buildAssignmentItemPerformanceRowViews/,
  'Assignment result page view-model should own formatted item performance row views.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsItemAnalysisCard[\s\S]*itemView=\{itemView\}/,
  'Assignment result route should delegate reteach-priority cards with assignment-domain card views.'
);
assert.match(
  assignmentResultViewSource,
  /itemAnalysisCardViews: buildAssignmentItemAnalysisCardViews|const itemAnalysisCardViews = data[\s\S]*buildAssignmentItemAnalysisCardViews/,
  'Assignment result page view-model should own reteach-priority card views.'
);
assert.match(
  assignmentResultRouteSource,
  /AssignmentResultsAttemptReviewCard[\s\S]*attemptView=\{attemptView\}/,
  'Assignment result route should delegate answer review cards with assignment-domain card views.'
);
assert.match(
  assignmentResultViewSource,
  /attemptReviewCardViews: buildAssignmentAttemptReviewCardViews|const attemptReviewCardViews = buildAssignmentAttemptReviewCardViews/,
  'Assignment result page view-model should own answer review card views.'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /buildAssignmentAttemptReviewCardView|buildAssignmentAttemptAnswerReviewView|buildAssignmentItemAnalysisCardView/,
  'Assignment result route should not build reteach-priority or answer-review card state directly.'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /function (?:ClassroomBriefCard|ResultStudentSearch|ResultEmptyState|StudentSummaryTable|ItemPerformanceSortControl|AttemptReviewFilterControl|ItemPerformanceTable|ItemAnalysisCard|AttemptReviewCard|ResultMetric)\(/,
  'Assignment result route should not keep local result metric, control, table, brief, or review card components.'
);
assert.doesNotMatch(
  assignmentResultRouteSource,
  /NativeSelect|NativeSelectOption|TableBody|TableHead|TableRow|TableCell|Progress|IconSearch|IconListDetails|IconClipboardText/,
  'Assignment result route should not own low-level result controls, tables, progress bars, or review icons.'
);
assert.match(
  assignmentResultsMetricCardSource,
  /resultMetricIconByKey/,
  'Assignment result metric component should own result metric icon mapping.'
);
assert.match(
  assignmentResultsHeaderCardSource,
  /AssignmentSettingsSummary[\s\S]*CopyAssignmentShareLinkButton[\s\S]*resultActionIconByAction/,
  'Assignment result header component should own delivery summary, share actions, and result action icons.'
);
assert.doesNotMatch(
  assignmentResultsHeaderCardSource,
  /assignmentResultPageCopy/,
  'Assignment result header component should render page labels from prepared header and action views.'
);
assert.match(
  assignmentResultsClassroomBriefCardSource,
  /focusItemViews[\s\S]*followUpStudentViews/,
  'Assignment classroom brief component should render prepared focus item and follow-up student views.'
);
assert.match(
  assignmentResultsClassroomBriefCardSource,
  /itemView\.promptLabel/,
  'Assignment classroom brief component should render prepared focus item prompt labels.'
);
assert.doesNotMatch(
  assignmentResultsClassroomBriefCardSource,
  /itemView\.itemNumberLabel[\s\S]*itemView\.prompt/,
  'Assignment classroom brief component should not hand-compose focus item number and prompt text.'
);
assert.match(
  assignmentResultsStudentSearchSource,
  /view\.sortOptions[\s\S]*view\.summary/,
  'Assignment result student search component should render prepared sort options and result summary.'
);
assert.match(
  assignmentResultsAttemptReviewFilterSource,
  /view\.options/,
  'Assignment result attempt review filter component should render prepared filter options.'
);
assert.match(
  assignmentResultsItemPerformanceSortSource,
  /view\.options/,
  'Assignment result item performance sort component should render prepared sort options.'
);
assert.match(
  assignmentResultsItemPerformanceTableSource,
  /assignmentResultTableHeaders\.itemPerformance[\s\S]*items\.map/,
  'Assignment result item performance table component should render prepared item row views.'
);
assert.match(
  assignmentResultsItemPerformanceTableSource,
  /rowView\.promptLabel/,
  'Assignment result item performance table should render prepared prompt labels.'
);
assert.doesNotMatch(
  assignmentResultsItemPerformanceTableSource,
  /rowView\.itemNumberLabel[\s\S]*rowView\.prompt/,
  'Assignment result item performance table should not hand-compose item number and prompt text.'
);
assert.match(
  assignmentResultsStudentSummaryTableSource,
  /assignmentResultTableHeaders\.studentSummary[\s\S]*students\.map/,
  'Assignment result student summary table component should render prepared student row views.'
);
assert.match(
  assignmentResultsAttemptsTableSource,
  /assignmentResultTableHeaders\.studentAttempts[\s\S]*attempts\.map/,
  'Assignment result attempts table component should render prepared attempt row views.'
);
assert.match(
  assignmentResultsItemAnalysisCardSource,
  /correctRateProgressValue/,
  'Assignment result item analysis card component should render prepared reteach-priority card progress.'
);
assert.doesNotMatch(
  assignmentResultsItemAnalysisCardSource,
  /\{itemView\.(?:acceptedAnswersLabel|expectedAnswerLabel)\}:/,
  'Assignment result item analysis card component should not hand-compose visible answer label separators.'
);
assert.match(
  assignmentResultsItemAnalysisCardSource,
  /itemView\.expectedAnswerSummaryText[\s\S]*itemView\.acceptedAnswersLineText/,
  'Assignment result item analysis card component should render prepared answer summary text lines.'
);
assert.match(
  assignmentResultsAttemptReviewCardSource,
  /attemptView\.answerViews\.map/,
  'Assignment result attempt review card component should render prepared answer review views.'
);
assert.doesNotMatch(
  assignmentResultsAttemptReviewCardSource,
  /\{answerView\.(?:studentAnswerLabel|expectedAnswerLabel|acceptedAnswersLabel)\}:/,
  'Assignment result attempt review card component should not hand-compose visible answer label separators.'
);
assert.match(
  assignmentResultsAttemptReviewCardSource,
  /answerView\.studentAnswerLineText[\s\S]*answerView\.expectedAnswerLineText[\s\S]*answerView\.acceptedAnswersLineText/,
  'Assignment result attempt review card component should render prepared answer review text lines.'
);
assert.match(
  assignmentResultsEmptyStateSource,
  /AssignmentResultEmptyState/,
  'Assignment result empty-state component should consume the assignment-domain empty-state view.'
);
assert.match(
  assignmentResultViewSource,
  /getAssignmentResultCompletedAttemptCount\(\s*data\?\.stats\.completions\s*\)/,
  'Assignment result actions should derive attempt availability from completed attempt stats.'
);
assert.match(
  assignmentResultDisplaySource,
  /formatAssignmentResultPromptLabel[\s\S]*m\.assignment_result_prompt_label/,
  'Assignment result display helper should own localized prompt-label formatting.'
);
assert.match(
  assignmentResultDisplaySource,
  /formatAssignmentResultPromptLabel[\s\S]*normalizeRuntimeDisplayText\(prompt\)/,
  'Assignment result prompt labels should normalize prompt display text through the shared runtime helper.'
);
assert.doesNotMatch(
  assignmentResultDisplaySource,
  /prompt\.trim\(\)/,
  'Assignment result prompt labels should not use ad hoc trim-only prompt cleanup.'
);
assert.match(
  assignmentResultDisplaySource,
  /export function formatAssignmentResultStudentLabel[\s\S]*normalizeRuntimeDisplayText\(value\)[\s\S]*student_identity_anonymous_student/,
  'Assignment result student labels should share normalized display text with a localized anonymous fallback.'
);
assert.match(
  assignmentResultDisplaySource,
  /formatAssignmentResultFraction[\s\S]*m\.assignment_result_fraction/,
  'Assignment result display helper should own localized fraction formatting.'
);
assert.match(
  assignmentResultFormatSource,
  /formatAcceptedAnswerAlternatives[\s\S]*assignment_result_accepted_answer_separator/,
  'Assignment result formatting should use the localized accepted-answer separator by default.'
);
assert.match(
  assignmentResultFormatSource,
  /includePrimary[\s\S]*getDisplayAcceptedAnswers/,
  'Assignment result formatting should expose a shared option for formatting only accepted-answer alternatives.'
);
assert.match(
  assignmentResultFormatSource,
  /formatPrimaryAcceptedAnswer[\s\S]*getUniqueAcceptedAnswers/,
  'Assignment result formatting should expose a shared primary accepted-answer formatter.'
);
assert.match(
  assignmentResultFormatSource,
  /function getDisplayAcceptedAnswerValues[\s\S]*normalizeRuntimeDisplayList\(getUniqueAcceptedAnswers\(values\)\)/,
  'Assignment result accepted-answer formatting should normalize display values through the shared runtime display-list helper.'
);
assert.match(
  assignmentResultFormatSource,
  /getAssignmentResultEmptyValue[\s\S]*assignment_result_empty_value/,
  'Assignment result formatting should use the localized empty-value placeholder by default.'
);
assert.match(
  assignmentResultFormatSource,
  /formatAssignmentResultValue[\s\S]*normalizeRuntimeDisplayText\(value\)/,
  'Assignment result text values should normalize whitespace and fullwidth text through the shared runtime display helper.'
);
assert.doesNotMatch(
  assignmentResultFormatSource,
  /\?\? '-'/,
  'Assignment result formatting should not hard-code the default empty-value placeholder.'
);
assert.doesNotMatch(
  assignmentResultFormatSource,
  /value\?\.trim\(\)/,
  'Assignment result text values should not use trim-only display normalization.'
);
assert.doesNotMatch(
  assignmentResultsExportSource,
  /separator:\s*' \| '/,
  'Assignment result CSV export should not override accepted-answer formatting with a hard-coded separator.'
);
assert.match(
  assignmentResultAnswerViewSource,
  /buildAssignmentResultAcceptedAnswerView[\s\S]*formatAcceptedAnswerAlternatives\([\s\S]*includePrimary: false[\s\S]*formatPrimaryAcceptedAnswer/,
  'Assignment result answer view should split primary expected answers from accepted alternatives.'
);
assert.match(
  assignmentResultAnswerViewSource,
  /buildAssignmentResultAttemptAnswerTextView[\s\S]*exportStatusLabel[\s\S]*exportStudentAnswerText/,
  'Assignment result answer view should prepare both teacher-review and CSV answer text.'
);
assert.match(
  assignmentResultsExportSource,
  /buildAssignmentResultAttemptAnswerTextView\(answer,[\s\S]*answerView\.exportStudentAnswerText[\s\S]*answerView\.expectedAnswerText[\s\S]*answerView\.acceptedAlternativesText[\s\S]*answerView\.exportStatusLabel/,
  'Assignment result CSV export should consume the shared answer text view.'
);
assert.match(
  assignmentResultViewSource,
  /joinAssignmentResultSearchSummaryParts/,
  'Assignment result view should use the shared localized result-summary joiner.'
);
assert.match(
  assignmentResultViewSource,
  /buildAssignmentItemAnalysisCardView[\s\S]*buildAssignmentResultAcceptedAnswerView\(/
);
assert.match(
  assignmentResultViewSource,
  /buildAssignmentItemPerformanceRowView[\s\S]*buildAssignmentResultAcceptedAnswerView\(/
);
assert.match(
  assignmentResultViewSource,
  /buildAssignmentAttemptAnswerReviewView[\s\S]*buildAssignmentResultAttemptAnswerTextView\(answer\)/,
  'Assignment result views should consume the shared answer text view.'
);
assert.doesNotMatch(
  assignmentResultViewSource,
  /formatAssignmentReviewStudentAnswer|formatPrimaryAcceptedAnswer|formatAcceptedAnswerAlternatives|formatOptionalAcceptedAnswerAlternatives/,
  'Assignment result view should not rebuild accepted-answer or student-answer text locally.'
);
assert.doesNotMatch(
  assignmentResultsExportSource,
  /formatAssignmentExportStudentAnswer|formatAssignmentExportAnswerStatus|isAssignmentAttemptAnswerNeedsReview|formatPrimaryAcceptedAnswer|formatAcceptedAnswerAlternatives/,
  'Assignment result CSV export should not rebuild answer status or accepted-answer text locally.'
);
assert.match(
  assignmentResultViewSource,
  /attemptReviewCount:\s*completedAttemptReviewCount/,
  'Assignment answer review sections should not unlock from raw review rows alone.'
);
assert.match(
  assignmentResultViewSource,
  /filterAssignmentResultCompletedAttemptRows/,
  'Assignment attempt rows should be filtered to completed result reviews before display.'
);
const directRunnerFeedbackSources = [
  'src/components/activities/fill-blank-worksheet.tsx',
  'src/components/activities/line-match-board.tsx',
  'src/components/activities/listening-runner.tsx',
  'src/components/activities/matching-pairs-board.tsx',
  'src/components/activities/open-box-runner.tsx',
];
for (const filePath of directRunnerFeedbackSources) {
  assert.match(
    readFileSync(filePath, 'utf8'),
    /<PublicAnswerFeedback[\s\S]*correctLabel=\{copy\.correctAnswerLabel\}/,
    `${filePath} should use the template-specific correct-answer label in student review feedback.`
  );
}
const publicAnswerFeedbackSource = readFileSync(
  'src/components/activities/public-answer-feedback.tsx',
  'utf8'
);
assert.doesNotMatch(
  publicAnswerFeedbackSource,
  /@\/locale\/paraglide\/messages/,
  'Public answer feedback component should render localized text prepared by the assignment-domain feedback view.'
);
assert.doesNotMatch(
  publicAnswerFeedbackSource,
  /\{feedback\.(?:correctAnswerLabel|acceptedAnswersLabel|explanationLabel)\}:/,
  'Public answer feedback component should not hand-compose visible feedback label separators.'
);
assert.match(
  publicAnswerFeedbackSource,
  /feedback\.correctAnswerText[\s\S]*feedback\.acceptedAnswersText[\s\S]*feedback\.explanationText/,
  'Public answer feedback component should render prepared feedback text lines.'
);
const groupSortBoardSource = readFileSync(
  'src/components/activities/group-sort-board.tsx',
  'utf8'
);
const fillBlankWorksheetSource = readFileSync(
  'src/components/activities/fill-blank-worksheet.tsx',
  'utf8'
);
assert.match(
  fillBlankWorksheetSource,
  /buildFillBlankWorksheetView/,
  'Fill-blank worksheet should consume the assignment-domain worksheet view helper.'
);
assert.doesNotMatch(
  fillBlankWorksheetSource,
  /buildInlineBlankPromptView|buildStudentRunnerView|item\.choices\.join|\{index \+ 1\}|\{copy\.wordBankLabel\}:/,
  'Fill-blank worksheet should not rebuild prompt parsing, word-bank text, visible word-bank separators, or item labels in the component.'
);
assert.match(
  groupSortBoardSource,
  /buildGroupSortRunnerView/,
  'Group-sort runner should consume the assignment-domain board view helper.'
);
assert.match(
  groupSortBoardSource,
  /<GroupSortItemButton[\s\S]*correctLabel=\{copy\.correctAnswerLabel\}/,
  'Group-sort runner should pass the template-specific correct-answer label into item feedback.'
);
assert.doesNotMatch(
  groupSortBoardSource,
  /buildStudentRunnerView|isSameRuntimeChoice|itemViews\.filter|selectedItemId === item\.id/,
  'Group-sort runner should not rebuild selected, unplaced, or grouped item views in the component.'
);
for (const filePath of [
  'src/components/activities/listening-runner.tsx',
  'src/components/activities/open-box-runner.tsx',
]) {
  const source = readFileSync(filePath, 'utf8');

  assert.match(
    source,
    /buildSequentialStudentRunnerView/,
    `${filePath} should consume the assignment-domain sequential runner view helper.`
  );
  assert.match(
    source,
    /navigationView/,
    `${filePath} should render sequence navigation state from the assignment-domain helper.`
  );
  assert.doesNotMatch(
    source,
    /buildSequentialRunnerView|buildStudentRunnerView|getStudentRunnerReviewStatusClassName/,
    `${filePath} should not manually compose sequence views or review status classes.`
  );
}
const listeningRunnerSource = readFileSync(
  'src/components/activities/listening-runner.tsx',
  'utf8'
);
assert.match(
  listeningRunnerSource,
  /runnerView\.activeChoiceViews/,
  'Listening runner should render choice state from the sequential runner view.'
);
assert.match(
  listeningRunnerSource,
  /buildListeningPromptView/,
  'Listening runner should delegate speech language and transcript visibility to the listening prompt view helper.'
);
assert.doesNotMatch(
  listeningRunnerSource,
  /normalizeListeningSpeechLanguage|isSameRuntimeChoice|activeItem\.choices|answers\[activeItem\.id\]|revealAnswer \?[\s\S]*activeItem\.prompt/,
  'Listening runner should not rebuild speech language, transcript visibility, active choice, or input value state directly.'
);
const openBoxRunnerSource = readFileSync(
  'src/components/activities/open-box-runner.tsx',
  'utf8'
);
assert.match(
  openBoxRunnerSource,
  /navigationView\.previousItemId[\s\S]*navigationView\.nextItemId/,
  'Open-box runner should navigate active cards through the assignment-domain navigation view.'
);
assert.doesNotMatch(
  openBoxRunnerSource,
  /activeIndex \+ offset|getSequentialRunnerItemIdByOffset|getStudentRunnerReviewStatusClassName|answers\[activeItem\.id\]/,
  'Open-box runner should not hand-roll sequence wrapping, review styles, or active answer state.'
);
for (const filePath of [
  'src/components/activities/line-match-board.tsx',
  'src/components/activities/matching-pairs-board.tsx',
]) {
  const source = readFileSync(filePath, 'utf8');

  assert.match(
    source,
    /runnerView\.promptItemViews/,
    `${filePath} should render prompt-card labels and selection from the choice-pairing view.`
  );
  assert.doesNotMatch(
    source,
    /runnerView\.itemViews\.map|\{index \+ 1\}\.|selectedItemId === item\.id/,
    `${filePath} should not rebuild prompt-card labels or selection state directly.`
  );
}
const activityCreateFormSource = readFileSync(
  'src/components/activities/activity-create-form.tsx',
  'utf8'
);
assert.doesNotMatch(
  activityCreateFormSource,
  /error\.message|error instanceof Error/,
  'Activity create form failures should use localized form copy instead of raw AI or save errors.'
);
assert.match(
  activityCreateFormSource,
  /toast\.error\(m\.activity_form_toast_draft_generation_failed\(\)\)/,
  'Activity draft generation failures should use the localized draft failure message.'
);
assert.match(
  activityCreateFormSource,
  /toast\.error\(m\.activity_form_toast_save_failed\(\)\)/,
  'Activity save failures should use the localized save failure message.'
);
const contactFormCardSource = readFileSync(
  'src/components/contact/contact-form-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  contactFormCardSource,
  /err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Contact form failures should use localized contact copy instead of raw API or mail errors.'
);
assert.match(
  contactFormCardSource,
  /const msg = m\.contact_error\(\);/,
  'Contact form failures should show the localized contact failure message.'
);
const newsletterFormCardSource = readFileSync(
  'src/components/settings/notification/newsletter-form-card.tsx',
  'utf8'
);
assert.doesNotMatch(
  newsletterFormCardSource,
  /err\.message|error\.message|statusError\?\.message|subscribeMutation\.error\?\.message|unsubscribeMutation\.error\?\.message|err instanceof Error|error instanceof Error/,
  'Newsletter settings failures should use localized notification copy instead of raw status or mutation errors.'
);
assert.match(
  newsletterFormCardSource,
  /const newsletterErrorMessage =[\s\S]*m\.settings_notification_newsletter_error\(\)/,
  'Newsletter settings inline errors should show the localized settings failure message.'
);
assert.match(
  newsletterFormCardSource,
  /toast\.error\(m\.settings_notification_newsletter_error\(\)\)/,
  'Newsletter settings toast failures should show the localized settings failure message.'
);
const billingCardSource = readFileSync(
  'src/components/settings/billing/billing-card.tsx',
  'utf8'
);
const billingViewSource = readFileSync('src/payment/billing-view.ts', 'utf8');
const paymentCardSource = readFileSync(
  'src/components/payment/payment-card.tsx',
  'utf8'
);
const paymentStatusViewSource = readFileSync(
  'src/payment/payment-status-view.ts',
  'utf8'
);
assert.doesNotMatch(
  billingCardSource,
  /loadPaymentError\?\.message|loadPaymentError\.message|err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Billing status failures should use localized billing copy instead of raw payment or network errors.'
);
assert.match(
  billingViewSource,
  /m\.settings_billing_card_load_error\(\)/,
  'Billing status failures should show the localized billing load failure message.'
);
assert.match(
  billingCardSource,
  /buildSettingsBillingCardViewModel/,
  'BillingCard should render the shared billing view model instead of rebuilding plan state locally.'
);
assert.doesNotMatch(
  billingCardSource,
  /getPricePlans\(\)[\s\S]*find\(\(p\) => p\.id === currentPlan\.id\)|subscription\.status === 'trialing'|subscription\.cancelAtPeriodEnd/,
  'BillingCard should not keep plan resolution or subscription status rules in the component.'
);
assert.match(
  paymentCardSource,
  /buildPaymentStatusView/,
  'PaymentCard should render the shared payment status view instead of owning localized status copy.'
);
assert.match(
  paymentCardSource,
  /getInitialPaymentConfirmationStatus/,
  'PaymentCard should derive its initial status through the payment status helper.'
);
assert.doesNotMatch(
  paymentCardSource,
  /settings_payment_(?:processing|success|failed|timeout)_(?:title|description)/,
  'PaymentCard should not keep payment status copy keys in the component.'
);
assert.match(
  paymentStatusViewSource,
  /settings_payment_processing_description[\s\S]*settings_payment_success_description[\s\S]*settings_payment_failed_description[\s\S]*settings_payment_timeout_description/,
  'Payment status copy should stay centralized in the payment status view helper.'
);
overwriteGetLocale(() => 'en');
const formatBillingTestDate = (date: Date) =>
  `date:${date.toISOString().slice(0, 10)}`;
const freeBillingPlan: PricePlan = {
  id: 'free',
  isFree: true,
  isLifetime: false,
  name: 'Imported Free',
  prices: [],
};
const configuredFreeBillingPlan: PricePlan = {
  ...freeBillingPlan,
  name: 'Configured Free',
};
const proBillingPlan: PricePlan = {
  id: 'pro',
  isFree: false,
  isLifetime: false,
  name: 'Classroom Pro',
  prices: [
    {
      amount: 699,
      currency: 'USD',
      interval: 'month',
      priceId: 'price_pro_monthly',
      type: 'subscription',
    },
  ],
};
const lifetimeBillingPlan: PricePlan = {
  id: 'lifetime',
  isFree: false,
  isLifetime: true,
  name: 'Lifetime Studio',
  prices: [
    {
      amount: 7900,
      currency: 'USD',
      priceId: 'price_lifetime',
      type: 'one_time',
    },
  ],
};
const trialBillingSubscription: Subscription = {
  createdAt: new Date('2026-01-01T00:00:00Z'),
  currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
  currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
  customerId: 'cus_test',
  id: 'sub_test',
  interval: 'month',
  priceId: 'price_pro_monthly',
  status: 'trialing',
  trialEndDate: new Date('2026-01-15T00:00:00Z'),
  type: 'subscription',
};
const loadingBillingView = buildSettingsBillingCardViewModel({
  canManageBilling: false,
  currentPlan: null,
  formatDate: formatBillingTestDate,
  hasLoadError: false,
  isLoading: true,
  plans: [],
  subscription: null,
});
assert.equal(loadingBillingView.state, 'loading');
assert.equal(loadingBillingView.action, undefined);
const errorBillingView = buildSettingsBillingCardViewModel({
  canManageBilling: false,
  currentPlan: null,
  formatDate: formatBillingTestDate,
  hasLoadError: true,
  isLoading: false,
  plans: [],
  subscription: null,
});
assert.equal(errorBillingView.state, 'error');
assert.equal(errorBillingView.action?.kind, 'retry');
assert.equal(errorBillingView.message, 'Failed to load billing info');
const noPlanBillingView = buildSettingsBillingCardViewModel({
  canManageBilling: false,
  currentPlan: null,
  formatDate: formatBillingTestDate,
  hasLoadError: false,
  isLoading: false,
  plans: [],
  subscription: null,
});
assert.equal(noPlanBillingView.state, 'no-plan');
assert.equal(noPlanBillingView.action?.kind, 'upgrade');
const freeBillingView = buildSettingsBillingCardViewModel({
  canManageBilling: true,
  currentPlan: freeBillingPlan,
  formatDate: formatBillingTestDate,
  hasLoadError: false,
  isLoading: false,
  plans: [configuredFreeBillingPlan, proBillingPlan],
  subscription: null,
});
assert.equal(freeBillingView.state, 'ready');
assert.equal(freeBillingView.plan?.name, 'Configured Free');
assert.equal(freeBillingView.plan?.isFree, true);
assert.equal(freeBillingView.action?.kind, 'upgrade');
assert.match(freeBillingView.plan?.message ?? '', /starter activity workflow/);
const trialBillingView = buildSettingsBillingCardViewModel({
  canManageBilling: true,
  currentPlan: proBillingPlan,
  formatDate: formatBillingTestDate,
  hasLoadError: false,
  isLoading: false,
  plans: [configuredFreeBillingPlan, proBillingPlan],
  subscription: {
    ...trialBillingSubscription,
    cancelAtPeriodEnd: true,
  },
});
assert.equal(trialBillingView.statusBadge?.tone, 'trial');
assert.equal(trialBillingView.statusBadge?.icon, 'clock');
assert.equal(trialBillingView.action?.kind, 'manage-subscription');
assert.deepEqual(
  trialBillingView.periodRows.map((row) => [
    row.id,
    row.value,
    row.suffix ?? '',
  ]),
  [
    ['period-start', 'date:2026-01-01', ''],
    ['period-end', 'date:2026-02-01', '(cancels at period end)'],
    ['trial-end', 'date:2026-01-15', ''],
  ]
);
const lifetimeBillingView = buildSettingsBillingCardViewModel({
  canManageBilling: true,
  currentPlan: lifetimeBillingPlan,
  formatDate: formatBillingTestDate,
  hasLoadError: false,
  isLoading: false,
  plans: [lifetimeBillingPlan],
  subscription: null,
});
assert.equal(lifetimeBillingView.action?.kind, 'manage-billing');
assert.match(lifetimeBillingView.plan?.message ?? '', /lifetime access/);
assert.equal(getInitialPaymentConfirmationStatus(undefined), 'failed');
assert.equal(getInitialPaymentConfirmationStatus('cs_test'), 'processing');
assert.deepEqual(buildPaymentStatusView('processing'), {
  description: 'Please wait while we verify your ClassGamify plan access.',
  icon: 'loader',
  title: 'Confirming your payment',
  tone: 'working',
});
assert.equal(buildPaymentStatusView('success').tone, 'success');
assert.match(
  buildPaymentStatusView('success').description,
  /ClassGamify workspace billing page/
);
assert.equal(buildPaymentStatusView('failed').icon, 'x');
assert.match(buildPaymentStatusView('failed').description, /pricing page/);
assert.equal(buildPaymentStatusView('timeout').tone, 'warning');
assert.match(buildPaymentStatusView('timeout').description, /Billing/);
const newsletterApiSource = readFileSync('src/api/newsletter.ts', 'utf8');
assert.doesNotMatch(
  newsletterApiSource,
  /error instanceof Error \? error\.message|throw new Error\(\s*error\.message/,
  'Newsletter server functions should not expose raw provider errors to clients.'
);
assert.match(
  newsletterApiSource,
  /throw new Error\(m\.newsletter_error_generic\(\)\);/,
  'Newsletter status failures should use the localized generic failure message.'
);
assert.match(
  newsletterApiSource,
  /throw new Error\(m\.newsletter_error\(\)\);/,
  'Newsletter subscribe failures should use the localized subscribe failure message.'
);
assert.match(
  newsletterApiSource,
  /throw new Error\(m\.newsletter_error_unsubscribe\(\)\);/,
  'Newsletter unsubscribe failures should use the localized unsubscribe failure message.'
);
const paymentApiSource = readFileSync('src/api/payment.ts', 'utf8');
assert.doesNotMatch(
  paymentApiSource,
  /error instanceof Error \? error\.message|throw new Error\(\s*error\.message/,
  'Payment server functions should not expose raw provider errors to clients.'
);
assert.match(
  paymentApiSource,
  /catch \(error\) {[\s\S]*?Payment checkout creation failed:[\s\S]*?throw new Error\(m\.pricing_checkout_failed\(\)\);/,
  'Checkout creation failures should use the localized checkout failure message.'
);
assert.match(
  paymentApiSource,
  /catch \(error\) {[\s\S]*?Payment customer portal creation failed:[\s\S]*?throw new Error\(m\.pricing_customer_portal_failed\(\)\);/,
  'Customer portal failures should use the localized portal failure message.'
);
const clipboardSource = readFileSync('src/lib/clipboard.ts', 'utf8');
assert.match(
  clipboardSource,
  /let copied = false;[\s\S]*copied = document\.execCommand\('copy'\);/,
  'Clipboard textarea fallback should inspect whether execCommand actually copied.'
);
assert.match(
  clipboardSource,
  /if \(!copied\) {[\s\S]*throw new ClipboardCopyError\(\);[\s\S]*}/,
  'Clipboard textarea fallback should fail instead of reporting a silent copy success.'
);
const filesPageContentSource = readFileSync(
  'src/components/settings/files/files-page-content.tsx',
  'utf8'
);
const filesTableSource = readFileSync(
  'src/components/settings/files/files-table.tsx',
  'utf8'
);
assert.doesNotMatch(
  filesPageContentSource,
  /err\.message|error\.message|err instanceof Error|error instanceof Error/,
  'Classroom material upload failures should use localized settings copy instead of raw storage errors.'
);
assert.match(
  filesPageContentSource,
  /toast\.error\(m\.settings_files_upload_error\(\)\)/,
  'Classroom material upload failures should show the localized upload failure message.'
);
assert.match(
  filesTableSource,
  /originalName \?\? m\.common_empty_value\(\)/,
  'Settings files table should render missing original names through localized empty-value copy.'
);
assert.match(
  filesTableSource,
  /formatDate\(d\) : m\.common_empty_value\(\)/,
  'Settings files table should render missing uploaded dates through localized empty-value copy.'
);
assert.doesNotMatch(
  filesTableSource,
  /['"]—['"]/,
  'Settings files table should not hard-code visible empty-value placeholders.'
);
const userFilesApiSource = readFileSync('src/api/user-files.ts', 'utf8');
const userFileQuerySource = readFileSync('src/storage/file-query.ts', 'utf8');
assert.deepEqual(USER_FILE_LIST_INPUT_LIMITS, {
  pageSizeMax: 100,
  pageSizeMin: 1,
});
assert.equal(USER_FILE_MATERIAL_PICKER_PAGE_SIZE, 100);
assert.equal(getUserFileListOffset({ pageIndex: 2, pageSize: 25 }), 50);
assert.equal(getUserFileListOffset({ pageIndex: -1, pageSize: 25 }), 0);
assert.equal(getUserFileListOffset({ pageIndex: 2, pageSize: 0 }), 2);
assert.ok(
  buildUserFileDetailOwnerWhere({ fileId: 'file-1', userId: 'user-1' })
);
assert.match(
  userFileQuerySource,
  /USER_FILE_LIST_INPUT_LIMITS[\s\S]*pageSizeMax: 100[\s\S]*pageSizeMin: 1/,
  'User file list pagination should expose named storage-domain input limits.'
);
assert.match(
  userFileQuerySource,
  /USER_FILE_MATERIAL_PICKER_PAGE_SIZE\s*=\s*USER_FILE_LIST_INPUT_LIMITS\.pageSizeMax/,
  'Activity source-material picker page size should live in the storage query domain.'
);
assert.match(
  userFilesApiSource,
  /pageSize:[\s\S]*USER_FILE_LIST_INPUT_LIMITS\.pageSizeMin[\s\S]*USER_FILE_LIST_INPUT_LIMITS\.pageSizeMax/,
  'User file list APIs should reuse the named page-size input limits.'
);
assert.doesNotMatch(
  userFilesApiSource,
  /pageSize: z\.number\(\)\.int\(\)\.min\(1\)\.max\(100\)/,
  'User file list APIs should not keep local page-size limits.'
);
assert.match(
  userFilesApiSource,
  /buildUserFileOwnerWhere\(\{ userId \}\)/,
  'User file list APIs should delegate owner scoping to the storage query domain.'
);
assert.match(
  userFileQuerySource,
  /buildUserFileDetailOwnerWhere[\s\S]*eq\(userFiles\.id, fileId\)[\s\S]*eq\(userFiles\.userId, userId\)/,
  'User file detail owner scoping should live in the storage query domain.'
);
assert.match(
  userFilesApiSource,
  /orderBy\(buildUserFileListOrderBy\(\)\)/,
  'User file list APIs should delegate created-at ordering to the storage query domain.'
);
assert.match(
  userFilesApiSource,
  /getUserFileListOffset\(\{[\s\S]*pageIndex: data\.pageIndex,[\s\S]*pageSize: data\.pageSize/,
  'User file list APIs should delegate offset calculation to the storage query domain.'
);
assert.doesNotMatch(
  userFilesApiSource,
  /desc\(userFiles\.createdAt\)|data\.pageIndex \* data\.pageSize|const pageIndex = data\.pageIndex|const pageSize = data\.pageSize/,
  'User file list APIs should not keep local order or offset list rules.'
);
assert.match(
  userFilesApiSource,
  /deleteUserFile[\s\S]*const where = buildUserFileDetailOwnerWhere\(\{[\s\S]*fileId: data\.id,[\s\S]*userId,[\s\S]*\.where\(where\)[\s\S]*delete\(userFiles\)\.where\(where\)/,
  'User file deletion should reuse owner-scoped detail rules for destructive file operations.'
);
assert.doesNotMatch(
  userFilesApiSource,
  /Buffer\.from|arrayBuffer\(\)/,
  'User file upload API should pass the FormData File to storage without Node Buffer conversion.'
);
const storageIndexSource = readFileSync('src/storage/index.ts', 'utf8');
const r2ProviderSource = readFileSync('src/storage/provider/r2.ts', 'utf8');
for (const [filePath, fileText] of [
  ['src/storage/index.ts', storageIndexSource],
  ['src/storage/types.ts', storageTypesSource],
  ['src/storage/provider/r2.ts', r2ProviderSource],
]) {
  assert.doesNotMatch(
    fileText,
    /\bBuffer\s*\||as Buffer|Uint8Array\(file as Buffer\)/,
    `${filePath} should keep uploads on Cloudflare-native Blob/File types.`
  );
}
overwriteGetLocale(() => 'en');
assert.equal(
  formatUserFileUploadError(
    new UploadError(STORAGE_ERROR_CODES.FILE_TOO_LARGE, {
      maxMegabytes: 4,
    })
  ),
  'The file is too large. Choose a file up to 4 MB.'
);
assert.equal(
  formatUserFileUploadError(
    new UploadError(STORAGE_ERROR_CODES.INVALID_FILE_TYPE, {
      supportedExtensions: '.pdf, .mp3',
    })
  ),
  'This file type is not supported. Supported types: .pdf, .mp3.'
);
overwriteGetLocale(() => 'zh');
assert.equal(
  formatUserFileUploadError(
    new UploadError(STORAGE_ERROR_CODES.DANGEROUS_CONTENT_TYPE, {
      contentType: 'text/html',
    })
  ),
  '出于课堂安全考虑，这类文件不能上传。'
);
overwriteGetLocale(() => 'en');
assert.equal(
  resolveUserFileMaterialKind({
    contentType: 'audio/mpeg',
    originalName: '三年级听力.mp3',
  }),
  'audio'
);
assert.equal(
  resolveUserFileMaterialKind({
    contentType: 'image/png',
    originalName: 'worksheet-scan.png',
  }),
  'worksheet-image'
);
assert.equal(
  resolveUserFileMaterialKind({
    contentType: 'application/pdf',
    originalName: '复习练习纸.pdf',
  }),
  'worksheet-document'
);
assert.equal(
  normalizeUserFileContentType(
    ' Ａｐｐｌｉｃａｔｉｏｎ／ＰＤＦ ; charset=UTF-8 '
  ),
  'application/pdf'
);
assert.equal(normalizeUserFileContentType(' ; charset=UTF-8 '), undefined);
assert.equal(
  resolveUserFileMaterialKind({
    contentType: ' Application / Pdf ; charset=UTF-8 ',
    originalName: 'fallback.bin',
  }),
  'worksheet-document'
);
assert.equal(
  resolveUserFileMaterialKind({
    contentType: 'application/octet-stream',
    originalName: 'scores.xlsx',
  }),
  'spreadsheet'
);
assert.equal(
  getUserFileExtension({
    originalName: 'C:\\class\\六月材料\\听力复习.WAV',
  }),
  'wav'
);
assert.equal(
  getUserFileExtension({
    originalName: 'C:\\class\\六月材料\\复习练习纸．ＰＤＦ',
  }),
  'pdf'
);
assert.equal(formatUserFileMaterialKind('audio'), 'Audio');
assert.equal(
  formatUserFileMaterialKind('worksheet-document'),
  'Worksheet document'
);
const userFileMaterialSummary = buildUserFileMaterialSummary([
  {
    contentType: 'audio/mpeg',
    isPublic: false,
    originalName: '三年级听力.mp3',
    size: 2_048,
  },
  {
    contentType: 'image/png',
    isPublic: true,
    originalName: 'worksheet-scan.png',
    size: 1_024,
  },
  {
    contentType: 'application/pdf',
    isPublic: false,
    originalName: '复习练习纸.pdf',
    size: 512,
  },
  {
    contentType: 'application/octet-stream',
    isPublic: false,
    originalName: 'scores.xlsx',
    size: 256,
  },
]);
assert.equal(userFileMaterialSummary.totalFiles, 4);
assert.equal(userFileMaterialSummary.totalBytes, 3_840);
assert.equal(userFileMaterialSummary.publicFiles, 1);
assert.equal(userFileMaterialSummary.privateFiles, 3);
assert.equal(userFileMaterialSummary.audioFiles, 1);
assert.equal(userFileMaterialSummary.worksheetFiles, 2);
assert.equal(userFileMaterialSummary.byKind.spreadsheet, 1);
const abnormalUserFileMaterialSummary = buildUserFileMaterialSummary([
  {
    contentType: 'application/pdf; charset=utf-8',
    isPublic: true,
    originalName: 'worksheet.pdf',
    size: 128.9,
  },
  {
    contentType: 'audio/mpeg',
    isPublic: false,
    originalName: 'listening.mp3',
    size: Number.POSITIVE_INFINITY,
  },
  {
    contentType: 'image/png',
    isPublic: null,
    originalName: 'scan.png',
    size: -4,
  },
]);
assert.equal(abnormalUserFileMaterialSummary.totalFiles, 3);
assert.equal(abnormalUserFileMaterialSummary.totalBytes, 128);
assert.equal(abnormalUserFileMaterialSummary.publicFiles, 1);
assert.equal(abnormalUserFileMaterialSummary.privateFiles, 2);
assert.equal(abnormalUserFileMaterialSummary.audioFiles, 1);
assert.equal(abnormalUserFileMaterialSummary.worksheetFiles, 2);
const activityMaterialReferencesSource = readFileSync(
  'src/activities/material-references.ts',
  'utf8'
);
const activityMaterialSummarySource = readFileSync(
  'src/activities/material-summary.ts',
  'utf8'
);
assert.match(
  activityMaterialReferencesSource,
  /ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS[\s\S]*fileIdMaxLength: 120[\s\S]*originalNameMaxLength: 200/,
  'Activity source material references should expose named text limits.'
);
assert.match(
  activityMaterialReferencesSource,
  /ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS\.fileIdMaxLength[\s\S]*ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS\.originalNameMaxLength/,
  'Activity source material reference normalization should reuse named text limits.'
);
assert.doesNotMatch(
  activityMaterialReferencesSource,
  /normalizeReferenceText\([^,\n]+,\s*(?:120|200)\)/,
  'Activity source material references should not keep local text length limits.'
);
assert.deepEqual(ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS, {
  fileIdMaxLength: 120,
  originalNameMaxLength: 200,
});
assert.match(
  activityMaterialSummarySource,
  /sourceKindSummaryText:[\s\S]*formatActivitySourceMaterialKindCounts/,
  'Activity source-material extraction action views should expose prepared source-kind summary text.'
);
assert.match(
  activityMaterialSummarySource,
  /summaryText: m\.activity_source_material_extraction_summary/,
  'Activity source-material extraction action summaries should use localized summary formatting.'
);
assert.match(
  activityMaterialSummarySource,
  /join\(m\.activity_source_material_summary_list_separator\(\)\)/,
  'Activity source-material source-kind summaries should use a localized list separator.'
);
assert.match(
  activityMaterialSummarySource,
  /formatActivitySourceMaterialReferenceMeta[\s\S]*activity_source_material_summary_list_separator/,
  'Activity source-material reference meta should use the activity-domain localized list separator.'
);
assert.match(
  activityMaterialSummarySource,
  /formatActivitySourceMaterialReferenceMeta[\s\S]*normalizeOptionalRuntimeDisplayText/,
  'Activity source-material reference meta should normalize visible meta parts through the shared display helper.'
);
assert.doesNotMatch(
  activityMaterialSummarySource,
  /summaryText: formatActivitySourceMaterialMetric\(\{[\s\S]*action\.sourceCount|join\(', '\)|part\?\.trim\(\)/,
  'Activity source-material extraction summaries should not only show raw source counts or hard-code list separators.'
);
const listeningMaterialReference = buildActivityMaterialReferenceFromUserFile({
  contentType: 'audio/mpeg',
  id: 'file-listening-1',
  originalName: ' 三年级听力.mp3 ',
  size: 2_048.7,
});
assert.deepEqual(listeningMaterialReference, {
  contentType: 'audio/mpeg',
  fileId: 'file-listening-1',
  kind: 'audio',
  originalName: '三年级听力.mp3',
  size: 2_048,
});
assert.equal(
  formatActivitySourceMaterialReferenceMeta(listeningMaterialReference, [
    '2 KB',
  ]),
  'Audio, 2 KB, audio/mpeg'
);
assert.equal(
  formatActivitySourceMaterialReferenceMeta(
    {
      ...listeningMaterialReference,
      contentType: ' audio / mpeg ',
    },
    ['  ２　KB  ', '   ']
  ),
  'Audio, 2 KB, audio / mpeg'
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    formatActivitySourceMaterialReferenceMeta(listeningMaterialReference, [
      '2 KB',
    ]),
    '音频，2 KB，audio/mpeg'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(
  buildActivityMaterialReferenceFromUserFile({
    contentType: 'application/pdf',
    id: ' ',
    originalName: 'worksheet.pdf',
  }),
  null
);
assert.deepEqual(
  normalizeActivityMaterialReferences([
    listeningMaterialReference,
    {
      contentType: 'application/pdf',
      fileId: 'file-worksheet-1',
      kind: 'unknown-kind',
      originalName: 'revision worksheet.pdf',
      size: 512.9,
    },
    {
      fileId: 'file-listening-1',
      kind: 'audio',
      originalName: 'duplicate.mp3',
    },
    { fileId: '', kind: 'audio', originalName: 'missing-id.mp3' },
  ]),
  [
    {
      contentType: 'audio/mpeg',
      fileId: 'file-listening-1',
      kind: 'audio',
      originalName: '三年级听力.mp3',
      size: 2_048,
    },
    {
      contentType: 'application/pdf',
      fileId: 'file-worksheet-1',
      kind: 'worksheet-document',
      originalName: 'revision worksheet.pdf',
      size: 512,
    },
  ]
);
assert.deepEqual(
  normalizeActivityMaterialReferences([
    {
      contentType: ' Application / Pdf ; charset=UTF-8 ',
      fileId: ' File １ ',
      kind: 'unknown-kind',
      originalName: '  Worksheet\tScan.pdf  ',
      size: -10,
    },
    {
      contentType: 'application/pdf',
      fileId: 'file 1',
      kind: 'worksheet-document',
      originalName: 'duplicate worksheet.pdf',
      size: 512,
    },
  ]),
  [
    {
      contentType: 'application/pdf',
      fileId: 'File 1',
      kind: 'worksheet-document',
      originalName: 'Worksheet Scan.pdf',
      size: 0,
    },
  ]
);
const sourceMaterialSummary = summarizeActivitySourceMaterials([
  listeningMaterialReference,
  {
    contentType: 'application/pdf',
    fileId: 'file-worksheet-1',
    kind: 'worksheet-document',
    originalName: 'revision worksheet.pdf',
    size: 512,
  },
  {
    contentType: 'application/pdf',
    fileId: 'file-worksheet-2',
    kind: 'worksheet-document',
    originalName: 'extra worksheet.pdf',
    size: 256,
  },
]);
assert.equal(sourceMaterialSummary.total, 3);
assert.equal(sourceMaterialSummary.byKind.audio, 1);
assert.equal(sourceMaterialSummary.byKind['worksheet-document'], 2);
assert.deepEqual(sourceMaterialSummary.readiness, {
  capabilities: ['audio-extraction', 'worksheet-extraction'],
  extractableCount: 3,
  hasAudio: true,
  hasSpreadsheet: false,
  hasWorksheet: true,
});
assert.deepEqual(sourceMaterialSummary.extractionActions, [
  {
    capability: 'audio-extraction',
    id: 'extract-audio',
    sourceCount: 1,
    sourceKindCounts: [{ count: 1, kind: 'audio' }],
  },
  {
    capability: 'worksheet-extraction',
    id: 'extract-worksheet',
    sourceCount: 2,
    sourceKindCounts: [{ count: 2, kind: 'worksheet-document' }],
  },
]);
assert.deepEqual(sourceMaterialSummary.kindSummaries, [
  { count: 1, kind: 'audio' },
  { count: 2, kind: 'worksheet-document' },
]);
const mixedSourceMaterialSummary = summarizeActivitySourceMaterials([
  {
    fileId: 'file-archive',
    kind: 'archive',
    originalName: 'classroom.zip',
  },
  {
    fileId: 'file-sheet',
    kind: 'spreadsheet',
    originalName: 'word-list.xlsx',
  },
  {
    fileId: 'file-scan',
    kind: 'worksheet-image',
    originalName: 'scan.png',
  },
  {
    fileId: 'file-video',
    kind: 'video',
    originalName: 'lesson.mp4',
  },
]);
assert.deepEqual(mixedSourceMaterialSummary.readiness, {
  capabilities: ['spreadsheet-import', 'worksheet-extraction'],
  extractableCount: 2,
  hasAudio: false,
  hasSpreadsheet: true,
  hasWorksheet: true,
});
assert.deepEqual(mixedSourceMaterialSummary.extractionActions, [
  {
    capability: 'spreadsheet-import',
    id: 'import-spreadsheet',
    sourceCount: 1,
    sourceKindCounts: [{ count: 1, kind: 'spreadsheet' }],
  },
  {
    capability: 'worksheet-extraction',
    id: 'extract-worksheet',
    sourceCount: 1,
    sourceKindCounts: [{ count: 1, kind: 'worksheet-image' }],
  },
]);
const normalizedSourceMaterialSummary = summarizeActivitySourceMaterials([
  {
    contentType: ' audio / mpeg ',
    fileId: 'audio-１',
    kind: 'unknown-kind',
    originalName: ' listening.mp3 ',
    size: Number.NaN,
  },
  {
    contentType: 'audio/mpeg',
    fileId: 'audio-1',
    kind: 'audio',
    originalName: 'duplicate-listening.mp3',
  },
  {
    contentType: ' application/pdf ; charset=utf-8 ',
    fileId: 'worksheet-1',
    kind: 'unknown-kind',
    originalName: 'worksheet.pdf',
  },
  {
    contentType: ' text/csv ',
    fileId: 'sheet-1',
    kind: 'unknown-kind',
    originalName: 'words.csv',
  },
]);
assert.equal(normalizedSourceMaterialSummary.total, 3);
assert.deepEqual(normalizedSourceMaterialSummary.kindSummaries, [
  { count: 1, kind: 'audio' },
  { count: 1, kind: 'spreadsheet' },
  { count: 1, kind: 'worksheet-document' },
]);
assert.deepEqual(normalizedSourceMaterialSummary.readiness, {
  capabilities: [
    'audio-extraction',
    'spreadsheet-import',
    'worksheet-extraction',
  ],
  extractableCount: 3,
  hasAudio: true,
  hasSpreadsheet: true,
  hasWorksheet: true,
});
assert.deepEqual(normalizedSourceMaterialSummary.extractionActions, [
  {
    capability: 'audio-extraction',
    id: 'extract-audio',
    sourceCount: 1,
    sourceKindCounts: [{ count: 1, kind: 'audio' }],
  },
  {
    capability: 'spreadsheet-import',
    id: 'import-spreadsheet',
    sourceCount: 1,
    sourceKindCounts: [{ count: 1, kind: 'spreadsheet' }],
  },
  {
    capability: 'worksheet-extraction',
    id: 'extract-worksheet',
    sourceCount: 1,
    sourceKindCounts: [{ count: 1, kind: 'worksheet-document' }],
  },
]);
assert.deepEqual(
  buildActivitySourceMaterialSummaryView([
    listeningMaterialReference,
    {
      contentType: 'application/pdf',
      fileId: 'file-worksheet-1',
      kind: 'worksheet-document',
      originalName: 'revision worksheet.pdf',
      size: 512,
    },
  ]),
  {
    countLabel: '2 files',
    extractionActions: [
      {
        capability: 'audio-extraction',
        id: 'extract-audio',
        label: 'Audio extraction',
        sourceCount: 1,
        sourceKindCounts: [{ count: 1, kind: 'audio' }],
        sourceKindSummaryText: 'Audio · 1',
        summaryText: 'Audio extraction · Audio · 1',
      },
      {
        capability: 'worksheet-extraction',
        id: 'extract-worksheet',
        label: 'Worksheet extraction',
        sourceCount: 1,
        sourceKindCounts: [{ count: 1, kind: 'worksheet-document' }],
        sourceKindSummaryText: 'Worksheet document · 1',
        summaryText: 'Worksheet extraction · Worksheet document · 1',
      },
    ],
    extractionTitle: 'Ready for future AI extraction',
    hasMaterials: true,
    kindBadges: [
      {
        count: 1,
        kind: 'audio',
        label: 'Audio',
        summaryText: 'Audio · 1',
      },
      {
        count: 1,
        kind: 'worksheet-document',
        label: 'Worksheet document',
        summaryText: 'Worksheet document · 1',
      },
    ],
    readiness: {
      capabilities: ['audio-extraction', 'worksheet-extraction'],
      extractableCount: 2,
      hasAudio: true,
      hasSpreadsheet: false,
      hasWorksheet: true,
    },
    title: 'Source materials',
  }
);
assert.deepEqual(
  buildActivitySourceMaterialSummaryView([
    {
      contentType: 'application/pdf',
      fileId: 'worksheet-doc',
      kind: 'worksheet-document',
      originalName: 'worksheet.pdf',
    },
    {
      contentType: 'image/png',
      fileId: 'worksheet-image',
      kind: 'worksheet-image',
      originalName: 'worksheet.png',
    },
  ]).extractionActions,
  [
    {
      capability: 'worksheet-extraction',
      id: 'extract-worksheet',
      label: 'Worksheet extraction',
      sourceCount: 2,
      sourceKindCounts: [
        { count: 1, kind: 'worksheet-document' },
        { count: 1, kind: 'worksheet-image' },
      ],
      sourceKindSummaryText: 'Worksheet document · 1, Worksheet image · 1',
      summaryText:
        'Worksheet extraction · Worksheet document · 1, Worksheet image · 1',
    },
  ]
);
overwriteGetLocale(() => 'zh');
try {
  assert.deepEqual(
    buildActivitySourceMaterialSummaryView([
      {
        contentType: 'application/pdf',
        fileId: 'zh-worksheet-doc',
        kind: 'worksheet-document',
        originalName: '练习纸.pdf',
      },
      {
        contentType: 'image/png',
        fileId: 'zh-worksheet-image',
        kind: 'worksheet-image',
        originalName: '练习纸.png',
      },
    ]).extractionActions,
    [
      {
        capability: 'worksheet-extraction',
        id: 'extract-worksheet',
        label: '可用于练习纸解析',
        sourceCount: 2,
        sourceKindCounts: [
          { count: 1, kind: 'worksheet-document' },
          { count: 1, kind: 'worksheet-image' },
        ],
        sourceKindSummaryText: '练习纸文档 · 1，练习纸图片 · 1',
        summaryText: '可用于练习纸解析 · 练习纸文档 · 1，练习纸图片 · 1',
      },
    ]
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(buildActivitySourceMaterialSummaryView([]), {
  countLabel: '0 files',
  extractionActions: [],
  extractionTitle: 'Ready for future AI extraction',
  hasMaterials: false,
  kindBadges: [],
  readiness: {
    capabilities: [],
    extractableCount: 0,
    hasAudio: false,
    hasSpreadsheet: false,
    hasWorksheet: false,
  },
  title: 'Source materials',
});
assert.equal(
  normalizeActivityMaterialReferences(
    Array.from(
      { length: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT + 2 },
      (_, index) => ({
        fileId: `file-${index}`,
        kind: 'worksheet-image',
        originalName: `scan-${index}.png`,
      })
    )
  ).length,
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT
);
const whitespaceMaterialReference = buildActivityMaterialReferenceFromUserFile({
  contentType: ' application/pdf ',
  id: ' file\tmessy\nid ',
  originalName: '  Worksheet\nScan\t1.pdf  ',
  size: 1024.9,
});
assert.deepEqual(whitespaceMaterialReference, {
  contentType: 'application/pdf',
  fileId: 'file messy id',
  kind: 'worksheet-document',
  originalName: 'Worksheet Scan 1.pdf',
  size: 1024,
});
const clippedMaterialReference = buildActivityMaterialReferenceFromUserFile({
  contentType: 'audio/wav',
  id: 'f'.repeat(ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.fileIdMaxLength + 1),
  originalName: `${'worksheet '.repeat(40)}.wav`,
});
assert.equal(
  clippedMaterialReference?.fileId.length,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.fileIdMaxLength
);
assert.equal(
  clippedMaterialReference?.originalName.length,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.originalNameMaxLength
);
assert.equal(
  buildActivitySourceMaterialDraftNotes([whitespaceMaterialReference]),
  'Attached classroom source materials:\n- Worksheet document: Worksheet Scan 1.pdf'
);
const activityDraftSourceMaterialSummary =
  buildActivitySourceMaterialDraftSummary([
    whitespaceMaterialReference,
    listeningMaterialReference,
    {
      contentType: 'application/pdf',
      fileId: 'secret-worksheet',
      kind: 'worksheet-document',
      originalName: 'Parent guide.pdf',
      size: 4096,
    },
    {
      fileId: '',
      kind: 'audio',
      originalName: 'ignored.mp3',
    },
  ]);
assert.deepEqual(activityDraftSourceMaterialSummary, {
  hasMaterials: true,
  kindCounts: {
    audio: 1,
    'worksheet-document': 2,
  },
  noteViews: [
    {
      kindLabel: 'Worksheet document',
      name: 'Worksheet Scan 1.pdf',
    },
    {
      kindLabel: 'Audio',
      name: '三年级听力.mp3',
    },
    {
      kindLabel: 'Worksheet document',
      name: 'Parent guide.pdf',
    },
  ],
  notesText:
    'Attached classroom source materials:\n- Worksheet document: Worksheet Scan 1.pdf\n- Audio: 三年级听力.mp3\n- Worksheet document: Parent guide.pdf',
  totalCount: 3,
});
assert.deepEqual(buildActivitySourceMaterialDraftSummary([]), {
  hasMaterials: false,
  kindCounts: {},
  noteViews: [],
  notesText: undefined,
  totalCount: 0,
});
assert.doesNotMatch(
  JSON.stringify(activityDraftSourceMaterialSummary),
  /secret-worksheet|file-listening-1|contentType|size|permission|ownerId|storageKey|r2Key/i,
  'AI draft source material summaries should expose only safe material kind labels and filenames.'
);
const storageModuleDocs = readFileSync('docs/storage.md', 'utf8');
assert.match(storageModuleDocs, /teacher-managed classroom\s+materials/);
assert.match(storageModuleDocs, /content-disposition\.ts/);
assert.match(storageModuleDocs, /file-materials\.ts/);
assert.match(storageModuleDocs, /file-summary\.ts/);
assert.match(storageModuleDocs, /material-references\.ts/);
assert.match(storageModuleDocs, /listUserFileMaterials/);
assert.match(storageModuleDocs, /does\s+not\s+return\s+`r2Key`/);
assert.match(storageModuleDocs, /ActivityContent\.sourceMaterials/);
assert.match(storageModuleDocs, /current default is 10MB/);
assert.match(storageModuleDocs, /`userFiles`\s+table/);
assert.doesNotMatch(
  storageModuleDocs,
  /It is used for avatar uploads \(Settings → Profile\) when enabled\.|default 4MB|There is no separate file-metadata table/,
  'Storage docs should describe current ClassGamify classroom-file behavior.'
);
assert.equal(
  buildAttachmentContentDisposition('scores final.csv'),
  'attachment; filename="scores final.csv"; filename*=UTF-8\'\'scores%20final.csv'
);
const chineseDownloadDisposition = buildAttachmentContentDisposition(
  'C:\\class\\六月材料\\听力复习.WAV'
);
assert.match(
  chineseDownloadDisposition,
  /^attachment; filename="classgamify-file\.wav"; filename\*=UTF-8''/
);
assert.match(
  chineseDownloadDisposition,
  /%E5%90%AC%E5%8A%9B%E5%A4%8D%E4%B9%A0\.WAV/
);
assert.doesNotMatch(chineseDownloadDisposition, /\r|\n|C:\\/);
const robotsRouteSource = readFileSync('src/routes/robots[.]txt.ts', 'utf8');
const sitemapRouteSource = readFileSync('src/routes/sitemap[.]xml.ts', 'utf8');
const routeConstantsSource = readFileSync('src/lib/routes.ts', 'utf8');
const websiteConfigSource = readFileSync('src/config/website.ts', 'utf8');
const storageFileRouteSource = readFileSync(
  'src/routes/api/storage/file.ts',
  'utf8'
);
assert.match(storageFileRouteSource, /originalName: userFiles\.originalName/);
assert.match(
  storageFileRouteSource,
  /buildAttachmentContentDisposition\(fileRecord\?\.originalName\)/
);
assert.doesNotMatch(
  storageFileRouteSource,
  /Content-Disposition'\] = 'attachment'/,
  'Storage file route should preserve original filenames for attachments.'
);
assert.match(
  websiteConfigSource,
  /blog:\s*\{\s*enable:\s*true,\s*paginationSize:\s*6,/s,
  'ClassGamify articles should be enabled because /blog is an indexed product resource.'
);
assert.ok(
  getNavbarLinks().some(
    (item) => item.href === Routes.Blog && item.title === 'Blog'
  ),
  'Top navigation should expose the ClassGamify articles route.'
);
const footerSupportItem = getFooterLinks().find(
  (item) => item.title === 'Support'
);
assert.ok(
  footerSupportItem?.items?.some(
    (item) =>
      item.href === Routes.Blog &&
      item.title === 'Articles' &&
      item.description ===
        'Read short guides for templates, assignments, and classroom review.'
  ),
  'Footer support links should expose ClassGamify articles.'
);
const sidebarSettingsItem = getSidebarLinks().find(
  (item) => item.href === undefined && item.title === 'Settings'
);
assert.ok(sidebarSettingsItem?.items, 'Settings sidebar group should exist.');
assert.ok(
  sidebarSettingsItem.items.some(
    (item) => item.href === Routes.SettingsFiles && item.title === 'Files'
  ),
  'Storage-enabled workspaces should expose Settings → Files in the sidebar.'
);
const settingsFilesRouteSource = readFileSync(
  'src/routes/settings/files.tsx',
  'utf8'
);
const settingsBillingRouteSource = readFileSync(
  'src/routes/settings/billing.tsx',
  'utf8'
);
const settingsPaymentRouteSource = readFileSync(
  'src/routes/settings/payment.tsx',
  'utf8'
);
const settingsNotificationsRouteSource = readFileSync(
  'src/routes/settings/notifications.tsx',
  'utf8'
);
const protectedPagesSpecSource = readFileSync(
  'tests/e2e/specs/protected-pages.spec.ts',
  'utf8'
);
assert.match(
  settingsFilesRouteSource,
  /websiteConfig\.storage\?\.enable !== true/
);
assert.match(
  settingsBillingRouteSource,
  /websiteConfig\.payment\?\.enable !== true/
);
assert.match(
  settingsPaymentRouteSource,
  /websiteConfig\.payment\?\.enable !== true/
);
assert.match(
  settingsNotificationsRouteSource,
  /websiteConfig\.newsletter\?\.enable !== true/
);
assert.doesNotMatch(
  settingsFilesRouteSource,
  /beforeLoad:\s*\(\)\s*=>\s*\{\s*throw notFound/s,
  'Settings files route should only be hidden when storage is disabled.'
);
assert.doesNotMatch(
  protectedPagesSpecSource,
  /\/settings\/(?:apikeys|billing|payment|notifications)/,
  'Protected smoke tests should only require active default settings pages.'
);
assert.doesNotMatch(
  routeConstantsSource,
  /SettingsApiKeys/,
  'Retired API key settings should not stay in public route constants.'
);
const retiredRouteDocumentationText = [
  'docs/locale.md',
  'docs/newsletter.md',
  'src/lib/urls.ts',
]
  .map((filePath) => readFileSync(filePath, 'utf8'))
  .join('\n');
const e2eTestCatalogText = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const localeMessageText = [
  'project.inlang/messages/en.json',
  'project.inlang/messages/zh.json',
]
  .map((filePath) => readFileSync(filePath, 'utf8'))
  .join('\n');
const pricingMessageText = [
  'project.inlang/messages/en.json',
  'project.inlang/messages/zh.json',
]
  .map((filePath) => {
    const messages = JSON.parse(readFileSync(filePath, 'utf8')) as Record<
      string,
      string
    >;

    return Object.entries(messages)
      .filter(
        ([key]) =>
          key.startsWith('pricing_') || key.startsWith('settings_billing_')
      )
      .map(([, value]) => value)
      .join('\n');
  })
  .join('\n');
const excludedPageRouteFiles = readdirSync('src/routes/(pages)');
assert.doesNotMatch(
  retiredRouteDocumentationText,
  /\/about|\/zh\/about|waitlist|src\/components\/blocks\/newsletter-card\.tsx/
);
assert.doesNotMatch(
  e2eTestCatalogText,
  /ClassGamify migration entry point/,
  'Retired legacy routes should not be documented as active migration pages.'
);
assert.match(e2eTestCatalogText, /retired legacy learning routes/);
assert.doesNotMatch(
  localeMessageText,
  /settings_api_keys_|latest news and updates|Join the community|Manage your account information|Manage your security settings|Manage your notification preferences|管理您的账户信息|管理您的安全设置|管理您的通知偏好|加入我们的社区|最新资讯与更新/,
  'Visible settings copy should use ClassGamify teacher-workspace language.'
);
assert.doesNotMatch(
  pricingMessageText,
  /HSK|Hanzi|Lang Study|getlangstudy|Chinese character|saved character|skeleton|shell|脚手架|骨架|汉字|中文分级/,
  'Pricing and billing copy should describe ClassGamify plans, not copied learning or unfinished scaffold language.'
);
overwriteGetLocale(() => 'en');
const pricePlans = getPricePlans();
assert.deepEqual(Object.keys(pricePlans), ['free', 'pro', 'lifetime']);
assert.ok(
  pricePlans.free?.features?.some((feature) =>
    feature.toLowerCase().includes('assignment link')
  ),
  'The free plan should describe a real sample assignment-link workflow.'
);
assert.ok(
  pricePlans.pro?.features?.some((feature) =>
    feature.toLowerCase().includes('student completion')
  ),
  'The Pro plan should include student completion and score tracking.'
);
assert.ok(
  pricePlans.pro?.features?.some((feature) =>
    feature.toLowerCase().includes('ai-assisted')
  ),
  'The Pro plan should include AI-assisted activity drafting.'
);
assert.ok(
  pricePlans.lifetime?.features?.some((feature) =>
    feature.toLowerCase().includes('new templates')
  ),
  'The lifetime plan should preserve early access to new ClassGamify templates.'
);
assert.equal(
  existsSync('src/routes/settings/apikeys.tsx'),
  false,
  'Retired API key settings route should stay unmounted.'
);
assert.equal(
  existsSync('src/components/settings/apikeys/apikeys-page-content.tsx'),
  false,
  'Retired API key settings page content should stay deleted.'
);
assert.equal(
  existsSync('src/components/settings/apikeys/apikeys-table.tsx'),
  false,
  'Retired API key settings table should stay deleted.'
);
assert.equal(
  existsSync('src/hooks/use-apikeys.ts'),
  false,
  'Retired API key settings hook should stay deleted.'
);
assert.equal(
  existsSync('src/routes/hanzi/$character.tsx'),
  false,
  'Legacy Hanzi dynamic route should stay unmounted.'
);
assert.equal(
  existsSync('src/routes/hsk/1.tsx'),
  false,
  'Legacy HSK course route should stay unmounted.'
);
assert.equal(
  existsSync('src/routes/learn.tsx'),
  false,
  'Legacy learning route should stay unmounted.'
);
assert.equal(
  existsSync('src/components/activities/legacy-product-route.tsx'),
  false,
  'Legacy product migration component should stay removed.'
);
assert.doesNotMatch(robotsRouteSource, /['"]\/worksheets['"]/);
assert.match(robotsRouteSource, /['"]\/play['"]/);
for (const retiredStubRoute of [
  '/about',
  '/ai',
  '/changelog',
  '/hanzi',
  '/hsk',
  '/learn',
  '/settings/credits',
  '/waitlist',
]) {
  assert.doesNotMatch(robotsRouteSource, new RegExp(`['"]${retiredStubRoute}`));
  assert.doesNotMatch(
    routeConstantsSource,
    new RegExp(`['"]${retiredStubRoute}`)
  );
}
for (const retiredStubRouteFile of [
  '-about.tsx',
  '-ai.tsx',
  '-changelog.tsx',
  '-waitlist.tsx',
]) {
  assert.equal(excludedPageRouteFiles.includes(retiredStubRouteFile), false);
}
assert.match(sitemapRouteSource, /Routes\.Worksheets/);
assert.doesNotMatch(sitemapRouteSource, /Routes\.StudentPreview/);
assert.doesNotMatch(routeConstantsSource, /['"]\/play\/demo-food['"]/);
assert.equal(isLocalizedPath('/worksheets'), true);
assert.equal(isLocalizedPath('/play/demo-food'), false);
assert.equal(
  Routes.StudentPreview,
  buildAssignmentSharePath(STARTER_FOOD_ASSIGNMENT_SHARE_ID)
);
const playRouteSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');
const publicAssignmentRulesComponentSource = readFileSync(
  'src/components/assignments/public-assignment-rules.tsx',
  'utf8'
);
const studentRunnerAttemptShellSource = readFileSync(
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'utf8'
);
const studentRunnerHeaderCardSource = readFileSync(
  'src/components/assignments/student-runner-header-card.tsx',
  'utf8'
);
const studentRunnerLoadingPanelSource = readFileSync(
  'src/components/assignments/student-runner-loading-panel.tsx',
  'utf8'
);
const studentRunnerMissingPanelSource = readFileSync(
  'src/components/assignments/student-runner-missing-panel.tsx',
  'utf8'
);
const studentRunnerStateSource = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const studentRunnerSubmissionSource = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const studentRunnerViewSource = readFileSync(
  'src/assignments/student-runner-view.ts',
  'utf8'
);
const studentRuntimeItemListSource = readFileSync(
  'src/components/activities/student-runtime-item-list.tsx',
  'utf8'
);
const lineMatchBoardSource = readFileSync(
  'src/components/activities/line-match-board.tsx',
  'utf8'
);
const matchingPairsBoardSource = readFileSync(
  'src/components/activities/matching-pairs-board.tsx',
  'utf8'
);
assert.match(
  studentRunnerSubmissionSource,
  /m\.student_runner_result_accuracy_line[\s\S]*m\.student_runner_result_time_line[\s\S]*m\.student_runner_result_score_line/,
  'Student submission display should format result accuracy, time, and score through localized message lines.'
);
assert.match(
  studentRunnerSubmissionSource,
  /m\.student_attempt_progress_label/,
  'Student attempt progress labels should come from localized message formatting.'
);
assert.match(
  studentRunnerSubmissionSource,
  /export function buildStudentAttemptAnswerStateByItemId/,
  'Student submission domain should expose runtime answer state for runner views.'
);
assert.match(
  studentRunnerSubmissionSource,
  /export type StudentAnswerChange/,
  'Student submission domain should expose a shared answer-change contract.'
);
assert.match(
  studentRunnerSubmissionSource,
  /buildStudentAnswerChange[\s\S]*applyStudentAnswerChanges\(\{[\s\S]*buildStudentAnswerChanges/,
  'Single answer updates should reuse the shared answer-change application contract.'
);
assert.match(
  studentRunnerSubmissionSource,
  /applyStudentAnswerChanges[\s\S]*const nextAnswers = \{ \.\.\.answers \}[\s\S]*const itemId = normalizeSubmissionItemId\(change\.itemId\)[\s\S]*nextAnswers\[itemId\] = change\.answer/,
  'Student submission domain should normalize changed item ids without mutating current browser answers.'
);
assert.match(
  studentRunnerSubmissionSource,
  /buildStudentAnswerChanges[\s\S]*const normalizedItemId = normalizeSubmissionItemId\(itemId\)[\s\S]*itemId: normalizedItemId/,
  'Student answer-change creation should normalize item ids through the submission item-id helper.'
);
assert.match(
  studentRunnerSubmissionSource,
  /resolveAttemptSubmissionDurationSeconds\(\{[\s\S]*now,[\s\S]*startedAt,[\s\S]*timeLimitSeconds/,
  'Student submission planning should resolve submitted duration through the assignment duration helper.'
);
assert.match(
  studentRunnerSubmissionSource,
  /normalizeAssignmentRemainingAttempts\(remainingAttempts\)/,
  'Student attempt usage labels should normalize remaining attempts through the assignment attempt-limit domain.'
);
assert.doesNotMatch(
  studentRunnerSubmissionSource,
  /buildAttemptTimerState\(/,
  'Student submission planning should not rebuild attempt timer state directly.'
);
assert.doesNotMatch(
  studentRunnerSubmissionSource,
  /function normalizeStudentRemainingAttemptCount|Number\.isFinite\(remainingAttempts\)/,
  'Student submission should not keep local remaining-attempt normalization logic.'
);
assert.match(
  studentRunnerViewSource,
  /buildStudentAttemptAnswerStateByItemId\(\{[\s\S]*answers,[\s\S]*runtimeItems: items/,
  'Student runner view should derive answer display state from submission-domain runtime item parsing.'
);
assert.match(
  studentRunnerViewSource,
  /title: formatAssignmentDisplayTitle\(assignment\.title\)/,
  'Student runner headers should normalize assignment titles through the shared assignment display helper.'
);
assert.doesNotMatch(
  studentRunnerViewSource,
  /title: assignment\.title/,
  'Student runner headers should not expose raw assignment titles.'
);
assert.doesNotMatch(
  studentRunnerSubmissionSource,
  /`\$\{formatAssignmentResultPercent\(accuracy\)\}|\$\{normalizedEarnedPoints\}\/\$\{normalizedTotalPoints\}|`\$\{answeredItemCount\}\/\$\{itemCount\}/,
  'Student submission display should not hand-compose visible progress, score, or accuracy lines.'
);
assert.doesNotMatch(
  studentRunnerViewSource,
  /answers\[item\.id\][\s\S]*isStudentAnswerFilled\(answer\)/,
  'Student runner view should not derive answered state directly from raw item ids.'
);
assert.match(
  studentRunnerViewSource,
  /m\.student_runner_item_position_label/,
  'Student runner view should format item position labels through localized messages.'
);
assert.match(
  studentRunnerViewSource,
  /m\.activity_runner_word_bank_separator\(\)/,
  'Fill-blank word-bank text should use the localized activity runner separator.'
);
assert.match(
  studentRunnerViewSource,
  /separator: m\.student_runner_choice_separator\(\)/,
  'Student answer feedback accepted alternatives should use the localized student runner choice separator.'
);
assert.match(
  studentRunnerViewSource,
  /buildStudentRunnerInstructionView[\s\S]*normalizeRuntimeDisplayText\(instructions\)/,
  'Student runner instructions should normalize whitespace and fullwidth text through the shared runtime display helper.'
);
assert.match(
  studentRunnerViewSource,
  /formatOptionalAcceptedAnswerAlternatives\([\s\S]*includePrimary: false[\s\S]*student_runner_choice_separator/,
  'Student answer feedback should show accepted alternatives without repeating the primary correct answer.'
);
assert.doesNotMatch(
  studentRunnerViewSource,
  /`\$\{index \+ 1\}\. \$\{prompt\}`|\.join\(', '\)|separator: ' \| '/,
  'Student runner view should not hand-compose item position, word-bank, or accepted-answer separators.'
);
assert.doesNotMatch(
  studentRunnerViewSource,
  /instructions\?\.trim\(\)/,
  'Student runner instructions should not use trim-only display normalization.'
);
assert.match(playRouteSource, /robots: 'noindex,follow'/);
assert.match(
  playRouteSource,
  /seo\(buildAssignmentSharePath\(params\.shareId\),/,
  'Student play route SEO path should use the assignment share-path helper.'
);
assert.doesNotMatch(
  playRouteSource,
  /seo\(`\/play\/\$\{params\.shareId\}`/,
  'Student play route should not hand-build share paths in route metadata.'
);
assert.match(
  playRouteSource,
  /window\.setInterval\([\s\S]*ASSIGNMENT_ATTEMPT_DURATION_UNITS\.millisecondsPerSecond/,
  'Student play route timer refresh should reuse the assignment duration unit contract.'
);
assert.doesNotMatch(
  playRouteSource,
  /window\.setInterval\([\s\S]*,\s*1000\)/,
  'Student play route timer refresh should not keep a local millisecond interval.'
);
assert.match(
  playRouteSource,
  /buildStudentRunnerPageViewModel/,
  'Student play route should consume the assignment-domain runner page view-model.'
);
assert.match(
  playRouteSource,
  /buildStudentRunnerSeoView/,
  'Student play route should consume assignment-domain SEO view state.'
);
assert.doesNotMatch(
  playRouteSource,
  /getStudentRunnerAttemptStartedAt|buildStudentRunnerAttemptState|buildAttemptTimerState|buildAttemptCompletionCopy|buildAnonymousAttemptCopy|buildStudentAttemptControlState|buildStudentAttemptResultDisplay|buildStudentAttemptTimerBadge|canStartAnotherStudentAttempt|formatStudentAttemptUsageLabel|buildStudentRunnerHeaderView/,
  'Student play route should not rebuild runner page, timer, completion, result, or header view state directly.'
);
assert.doesNotMatch(
  playRouteSource,
  /getStudentRunnerCopy|buildStudentRunnerMissingView/,
  'Student play route should render student-runner shell copy from the page view-model.'
);
assert.match(
  playRouteSource,
  /StudentRunnerLoadingPanel[\s\S]*runnerPageView\.loadingView[\s\S]*StudentRunnerMissingPanel[\s\S]*missingView/,
  'Student play route should delegate loading and missing states with runner page view fields.'
);
assert.match(
  playRouteSource,
  /StudentRunnerHeaderCard[\s\S]*badgeLabel=\{runnerPageView\.routeBadgeLabel\}[\s\S]*view=\{headerView\}/,
  'Student play route should delegate student assignment header rendering.'
);
assert.match(
  playRouteSource,
  /StudentRunnerAttemptShell[\s\S]*controlView=\{controlView\}[\s\S]*identityView=\{identityView\}[\s\S]*resultPanelView=\{resultPanelView\}/,
  'Student play route should delegate attempt shell, identity, timer, and result presentation.'
);
assert.match(
  playRouteSource,
  /StudentRuntimeItemList/,
  'Student play route should delegate template runtime item rendering to the student runtime item list component.'
);
assert.match(
  playRouteSource,
  /buildStudentRunnerAttemptRestartPlan/,
  'Student play route should restart attempts through the assignment-domain restart plan.'
);
assert.doesNotMatch(
  playRouteSource,
  /function startAnotherAttempt\(\)[\s\S]*buildStudentRunnerAttemptResetState/,
  'Student play route should not rebuild the start-another-attempt reset details directly.'
);
assert.doesNotMatch(
  playRouteSource,
  /function startAnotherAttempt\(\)[\s\S]*setSubmittedAttemptCount/,
  'Starting another student attempt should not reset the tracked submitted-attempt count.'
);
assert.match(
  studentRunnerHeaderCardSource,
  /PublicAssignmentRules/,
  'Student runner header card should delegate public rule summary rendering to the public assignment rules component.'
);
assert.match(
  studentRunnerLoadingPanelSource,
  /view\.message/,
  'Student runner loading panel should consume the loading view message.'
);
assert.match(
  studentRunnerMissingPanelSource,
  /view\.badgeLabel[\s\S]*view\.browseTemplatesLabel/,
  'Student runner missing panel should consume the missing view call to action.'
);
assert.match(
  studentRunnerHeaderCardSource,
  /view\.instructions[\s\S]*view\.ruleItems[\s\S]*view\.teacherActionLabel/,
  'Student runner header card should consume header instructions, rules, and teacher action view fields.'
);
assert.match(
  studentRunnerAttemptShellSource,
  /controlView\.progressLabel[\s\S]*controlView\.timerBadge[\s\S]*identityView\.mode[\s\S]*StudentRunnerResultPanel/,
  'Student runner attempt shell should own progress, timer, identity, and result-panel presentation.'
);
assert.doesNotMatch(
  playRouteSource,
  /runnerPageView\.loadingView\.message|missingView\.browseTemplatesLabel|headerView\.ruleItems|identityView\.mode|resultPanelView\.scoreLabel|controlView\.timerBadge\.label/,
  'Student play route should not render low-level student-runner display fields directly.'
);
assert.match(
  publicAssignmentRulesComponentSource,
  /PublicAssignmentRuleSummaryItem/,
  'Public assignment rules component should consume assignment-domain public rule summary items.'
);
assert.match(
  publicAssignmentRulesComponentSource,
  /aria-label=\{rule\.ariaLabel\}[\s\S]*rule\.description/,
  'Public assignment rules component should render prepared rule accessibility labels and student-facing descriptions.'
);
assert.doesNotMatch(
  publicAssignmentRulesComponentSource,
  /timer starts|submitted attempts|student identity|答案|作答|计时|匿名/,
  'Public assignment rules component should not hard-code student-facing rule explanations.'
);
assert.match(
  publicAssignmentRulesComponentSource,
  /getPublicAssignmentRuleIcon[\s\S]*id === 'items'[\s\S]*id === 'attempts'[\s\S]*id === 'identity'[\s\S]*id === 'answerReveal'/,
  'Public assignment rules component should own rule icon mapping for student-facing delivery policy.'
);
const assignmentDeliverySummarySource = readFileSync(
  'src/assignments/delivery-summary.ts',
  'utf8'
);
assert.match(
  assignmentDeliverySummarySource,
  /toPublicAssignmentRuleSummaryItem[\s\S]*assignment_delivery_public_rule_aria/,
  'Public assignment rule aria labels should be formatted in the assignment delivery domain.'
);
assert.match(
  assignmentDeliverySummarySource,
  /getPublicAssignmentRuleDescription[\s\S]*assignment_delivery_public_rule_items_description[\s\S]*assignment_delivery_public_rule_attempts_description[\s\S]*assignment_delivery_public_rule_timer_description[\s\S]*assignment_delivery_public_rule_closes_description[\s\S]*assignment_delivery_public_rule_identity_description[\s\S]*assignment_delivery_public_rule_review_description/,
  'Public assignment rule descriptions should come from localized assignment delivery messages.'
);
assert.doesNotMatch(
  assignmentDeliverySummarySource,
  /playable items|submitted attempts|activity is ready|stops accepting|work is identified|answers appear|可作答项目|次数限制|计时才会开始/,
  'Assignment delivery summary should not hard-code public rule descriptions.'
);
assert.doesNotMatch(
  playRouteSource,
  /buildDefaultRuntimeItemCardViews|getActivityTemplateRunnerKind|getActivityTemplateRunnerCopy|LineMatchBoard|MatchingPairsBoard|GroupSortBoard|FillBlankWorksheet|OpenBoxRunner|ListeningRunner|RuntimeItemList\(|RuntimeItemCard\(|ChoiceGrid\(/,
  'Student play route should not own template runner dispatch or default runtime-card rendering.'
);
assert.doesNotMatch(
  playRouteSource,
  /PublicAssignmentRuleIcon|PublicAssignmentRuleSummaryItem|PublicAssignmentRuleSummaryId|getPublicAssignmentRuleIcon/,
  'Student play route should not own public assignment rule card or icon rendering details.'
);
assert.doesNotMatch(
  playRouteSource,
  /isSameRuntimeChoice|buildStudentRunnerView/,
  'Student play route should not rebuild default runtime card or choice selected state directly.'
);
assert.match(
  studentRunnerStateSource,
  /getStudentRunnerAttemptStartedAt\(/,
  'Student runner page view-model should resolve attempt start times through assignment-domain helpers.'
);
assert.match(
  studentRunnerStateSource,
  /orderStudentRunnerRuntimeItems[\s\S]*shareSlug: normalizeAssignmentShareSlug\(assignment\.shareId\)/,
  'Student runner runtime ordering should normalize assignment share IDs before deriving shuffled item order.'
);
assert.doesNotMatch(
  studentRunnerStateSource,
  /orderStudentRunnerRuntimeItems[\s\S]*shareSlug: assignment\.shareId/,
  'Student runner runtime ordering should not pass raw assignment share IDs into item ordering.'
);
assert.match(
  playRouteSource,
  /shouldStartStudentRunnerAttemptClock\(/,
  'Student play route should start attempt clocks through assignment-domain helpers.'
);
assert.doesNotMatch(
  playRouteSource,
  /attemptClock\?\.shareId === activeShareId\s*\?\s*attemptClock\.startedAt\s*:\s*now/,
  'Student play route should not keep local attempt-clock share-id math.'
);
assert.match(
  playRouteSource,
  /buildStudentAttemptSubmissionPlan\(/,
  'Student play route should build submission payloads through the assignment-domain submission plan.'
);
assert.doesNotMatch(
  playRouteSource,
  /buildStudentAttemptSubmissionInput\(|buildStudentAttemptSubmitGate\(|resolveStudentAttemptAnonymousToken\(|resolveStudentAttemptSubmissionDurationSeconds\(|durationSeconds:\s*buildAttemptTimerState\(/,
  'Student play route should not rebuild submit gates, anonymous identity, duration, or submission input locally.'
);
assert.match(
  playRouteSource,
  /applyStudentAnswerChanges\(\{[\s\S]*answers: current,[\s\S]*changes/,
  'Student play route should apply browser answer changes through assignment-domain helpers.'
);
assert.doesNotMatch(
  playRouteSource,
  /setAnswers\(\(current\) => \(\{[\s\S]*\.\.\.current,[\s\S]*\[itemId\]: answer/,
  'Student play route should not hand-build answer-map updates.'
);
assert.match(
  playRouteSource,
  /function updateAnswers\(changes: StudentAnswerChange\[\]\)[\s\S]*setConfirmIncompleteSubmit\(false\)[\s\S]*applyStudentAnswerChanges/,
  'Student play route should reset incomplete-submit confirmation inside the shared answer-update path.'
);
assert.match(
  playRouteSource,
  /if \(changes\.length === 0\) return/,
  'Student play route should ignore empty answer-change batches.'
);
assert.match(
  studentRuntimeItemListSource,
  /onAnswerChanges: \(changes: StudentAnswerChange\[\]\) => void/,
  'Student runtime item list should expose answer-change batches to the play route.'
);
assert.match(
  studentRuntimeItemListSource,
  /buildStudentAnswerChanges\(\{ answer, itemId \}\)/,
  'Student runtime item list should convert simple answer events through the shared answer-change builder.'
);
assert.match(
  lineMatchBoardSource,
  /onAnswerChanges\([\s\S]*buildExclusiveChoiceAnswerChanges/,
  'Line-match should submit exclusive choice changes as one answer-change batch.'
);
assert.doesNotMatch(
  lineMatchBoardSource,
  /for \(const change of buildExclusiveChoiceAnswerChanges/,
  'Line-match should not loop exclusive choice answer changes through repeated parent updates.'
);
assert.match(
  matchingPairsBoardSource,
  /onAnswerChanges\([\s\S]*buildExclusiveChoiceAnswerChanges/,
  'Matching-pairs should submit exclusive choice changes as one answer-change batch.'
);
assert.doesNotMatch(
  matchingPairsBoardSource,
  /for \(const change of buildExclusiveChoiceAnswerChanges/,
  'Matching-pairs should not loop exclusive choice answer changes through repeated parent updates.'
);
assert.match(
  playRouteSource,
  /buildStudentRunnerAttemptResetState\(\)/,
  'Student play route should use the shared attempt reset state helper.'
);
assert.doesNotMatch(
  playRouteSource,
  /setAnswers\(\{\}\)[\s\S]*setConfirmIncompleteSubmit\(false\)[\s\S]*setStudentName\(''\)[\s\S]*setAttemptClock\(undefined\)[\s\S]*setSubmittedAttemptCount\(0\)[\s\S]*setAnonymousToken\(undefined\)/,
  'Student play route should not hand-write the attempt reset bundle.'
);
const attemptDurationSource = readFileSync(
  'src/assignments/attempt-duration.ts',
  'utf8'
);
assert.match(
  attemptDurationSource,
  /ASSIGNMENT_ATTEMPT_DURATION_UNITS[\s\S]*millisecondsPerSecond: 1000[\s\S]*secondsPerMinute: 60[\s\S]*timerSecondPaddingLength: 2/,
  'Attempt duration helpers should expose named time-unit constants.'
);
assert.match(
  attemptDurationSource,
  /m\.assignment_result_empty_value\(\)/,
  'Assignment attempt duration formatting should use localized result empty-value copy by default.'
);
assert.match(
  attemptDurationSource,
  /resolveAttemptSubmissionDurationSeconds[\s\S]*buildAttemptTimerState[\s\S]*normalizeAttemptDurationSeconds/,
  'Attempt duration helpers should centralize submitted-duration timer derivation and clamping.'
);
assert.doesNotMatch(
  attemptDurationSource,
  /\* 1000|\/ 1000|\/ 60|% 60|padStart\(2,/,
  'Attempt duration helpers should not keep local time-unit or timer-padding numbers.'
);
assert.doesNotMatch(
  attemptDurationSource,
  /emptyValue = options\?\.emptyValue \?\? '-'/,
  'Assignment attempt duration formatting should not hard-code the default empty-value placeholder.'
);
const activityDistractorsSource = readFileSync(
  'src/activities/distractors.ts',
  'utf8'
);
assert.match(
  activityDistractorsSource,
  /DEFAULT_QUESTION_CHOICE_COUNT = 4/,
  'Question choice completion should expose the default quiz choice count.'
);
assert.match(
  activityDistractorsSource,
  /targetCount = DEFAULT_QUESTION_CHOICE_COUNT/,
  'Question choice completion should reuse the default quiz choice count.'
);
assert.doesNotMatch(
  activityDistractorsSource,
  /const DEFAULT_CHOICE_COUNT|targetCount = 4/,
  'Question choice completion should not keep a local unnamed default choice count.'
);

assert.equal(isStudentAnswerFilled(undefined), false);
assert.equal(isStudentAnswerFilled('   '), false);
assert.equal(isStudentAnswerFilled(' answer '), true);
assert.equal(isStudentAnswerFilled(' Ａ '), true);
const normalizedRuntimeAnswerState = buildStudentAttemptAnswerStateByItemId({
  answers: { Ａ: '  fullwidth answer  ' },
  runtimeItems: [{ id: 'A' }, { id: 'Ａ' }],
});
assert.deepEqual(normalizedRuntimeAnswerState.get('A'), {
  answer: 'fullwidth answer',
  answered: true,
  itemId: 'A',
});
assert.equal(
  normalizedRuntimeAnswerState.get('Ａ')?.answer,
  'fullwidth answer'
);
assert.equal(
  buildAnonymousAttemptTokenStorageKey('share/one'),
  'classgamify:attempt-token:share/one'
);
assert.equal(
  buildAnonymousAttemptTokenStorageKey('  share/one  '),
  'classgamify:attempt-token:share/one'
);
const anonymousTokenStorage = new Map<string, string>();
const anonymousTokenStore = {
  getItem: (key: string) => anonymousTokenStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    anonymousTokenStorage.set(key, value);
  },
};
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-1',
    shareId: 'share-one',
    storage: anonymousTokenStore,
  }),
  'anon-token-1'
);
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-2',
    shareId: 'share-one',
    storage: anonymousTokenStore,
  }),
  'anon-token-1'
);
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-spaced-share',
    shareId: ' share-one ',
    storage: anonymousTokenStore,
  }),
  'anon-token-1'
);
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-3',
    shareId: 'share-two',
    storage: anonymousTokenStore,
  }),
  'anon-token-3'
);
anonymousTokenStorage.set(
  buildAnonymousAttemptTokenStorageKey('blank-token-share'),
  '   '
);
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => ' replacement-token ',
    shareId: 'blank-token-share',
    storage: anonymousTokenStore,
  }),
  'replacement-token'
);
assert.equal(
  anonymousTokenStorage.get(
    buildAnonymousAttemptTokenStorageKey('blank-token-share')
  ),
  'replacement-token'
);
assert.equal(normalizeAnonymousToken('  ａｎｏｎ－１２３  '), 'anon-123');
assert.deepEqual(
  resolveAttemptIdentityCountStrategy({
    anonymousToken: ' anonymous-token-1 ',
    studentName: '   ',
  }),
  {
    identity: {
      anonymousToken: 'anonymous-token-1',
    },
    type: 'anonymous-token',
  }
);
assert.deepEqual(
  resolveAttemptIdentityCountStrategy({
    anonymousToken: ' ａｎｏｎｙｍｏｕｓ－ｔｏｋｅｎ－１ ',
  }),
  {
    identity: {
      anonymousToken: 'anonymous-token-1',
    },
    type: 'anonymous-token',
  }
);
assert.deepEqual(
  resolveAttemptIdentityCountStrategy({
    anonymousToken: 'stale-token',
    studentName: ' Ava   Chen ',
  }),
  {
    identity: {
      studentName: 'Ava Chen',
    },
    type: 'normalized-student-name',
  }
);
assert.deepEqual(
  resolveAttemptIdentityCountStrategy({
    anonymousToken: ' ',
    studentName: ' ',
  }),
  {
    type: 'unknown',
  }
);
assert.deepEqual(
  resolveAttemptSubmissionIdentity({
    anonymousToken: ' stale-token ',
    collectStudentName: true,
    studentName: ' Ava   Chen ',
  }),
  {
    anonymousToken: null,
    studentName: 'Ava Chen',
    type: 'student-name',
  }
);
assert.deepEqual(
  resolveAttemptSubmissionIdentity({
    anonymousToken: ' anonymous-token-1 ',
    collectStudentName: false,
    studentName: 'Stale Name',
  }),
  {
    anonymousToken: 'anonymous-token-1',
    studentName: null,
    type: 'anonymous-token',
  }
);
assert.deepEqual(
  resolveAttemptSubmissionIdentity({
    anonymousToken: ' ａｎｏｎｙｍｏｕｓ－ｔｏｋｅｎ－１ ',
    collectStudentName: false,
    studentName: 'Stale Name',
  }),
  {
    anonymousToken: 'anonymous-token-1',
    studentName: null,
    type: 'anonymous-token',
  }
);
assert.deepEqual(
  resolveAttemptSubmissionIdentity({
    collectStudentName: true,
    studentName: '   ',
  }),
  {
    anonymousToken: null,
    studentName: null,
    type: 'missing',
  }
);
assert.deepEqual(
  resolveAttemptSubmissionIdentity({
    anonymousToken: '   ',
    collectStudentName: false,
  }),
  {
    anonymousToken: null,
    studentName: null,
    type: 'missing',
  }
);
assert.equal(
  countMatchingStudentIdentityAttempts({
    attempts: [
      { anonymousToken: null, studentName: ' Ava   Chen ' },
      { anonymousToken: 'ignored-token', studentName: 'ava chen' },
      { anonymousToken: 'anonymous-token-1', studentName: null },
      { anonymousToken: 'anonymous-token-1', studentName: 'Different' },
    ],
    identity: {
      studentName: 'AVA CHEN',
    },
  }),
  2
);
assert.equal(
  countMatchingStudentIdentityAttempts({
    attempts: [
      { anonymousToken: ' anonymous-token-1 ', studentName: null },
      {
        anonymousToken: 'ａｎｏｎｙｍｏｕｓ－ｔｏｋｅｎ－１',
        studentName: null,
      },
      { anonymousToken: 'anonymous-token-2', studentName: null },
    ],
    identity: {
      anonymousToken: 'anonymous-token-1',
    },
  }),
  2
);
const anonymousBrowserLabel = getAnonymousBrowserLabel('anonymous-token-1');
assert.equal(getAnonymousBrowserLabel(), 'Anonymous browser');
assert.match(anonymousBrowserLabel, /^Anonymous browser [0-9A-Z]{6}$/);
assert.equal(
  getAnonymousBrowserLabel(' anonymous-token-1 '),
  anonymousBrowserLabel
);
assert.notEqual(
  getAnonymousBrowserLabel('anonymous-token-2'),
  anonymousBrowserLabel
);
assert.equal(anonymousBrowserLabel.toLowerCase().includes('token'), false);
const studentIdentityResolver = createStudentIdentityResolver([
  { anonymousToken: ' browser-token-1 ', studentName: null },
  { anonymousToken: 'browser-token-1', studentName: null },
  { anonymousToken: 'browser-token-2', studentName: null },
  { anonymousToken: 'ignored-token', studentName: ' Alice ' },
]);
assert.deepEqual(
  studentIdentityResolver.resolve({
    anonymousToken: 'browser-token-1',
    studentName: null,
  }),
  {
    key: 'anonymous:1',
    label: 'Anonymous student 1',
  }
);
assert.deepEqual(
  studentIdentityResolver.resolve({
    anonymousToken: 'browser-token-2',
    studentName: null,
  }),
  {
    key: 'anonymous:2',
    label: 'Anonymous student 2',
  }
);
assert.deepEqual(
  studentIdentityResolver.resolve({
    anonymousToken: 'ignored-token',
    studentName: 'alice',
  }),
  {
    key: 'name:alice',
    label: 'Alice',
  }
);
assert.equal(
  JSON.stringify([
    studentIdentityResolver.resolve({
      anonymousToken: 'browser-token-1',
      studentName: null,
    }),
    studentIdentityResolver.resolve({
      anonymousToken: 'browser-token-2',
      studentName: null,
    }),
  ]).includes('browser-token'),
  false
);
const chronologicalStudentIdentityResolver = createStudentIdentityResolver([
  {
    anonymousToken: 'newer-browser-token',
    completedAt: new Date('2026-01-03T10:00:00.000Z'),
    studentName: null,
  },
  {
    anonymousToken: 'older-browser-token',
    completedAt: new Date('2026-01-01T10:00:00.000Z'),
    studentName: null,
  },
  {
    anonymousToken: 'newer-browser-token',
    completedAt: new Date('2026-01-02T10:00:00.000Z'),
    studentName: null,
  },
]);
assert.deepEqual(
  chronologicalStudentIdentityResolver.resolve({
    anonymousToken: 'older-browser-token',
    studentName: null,
  }),
  {
    key: 'anonymous:1',
    label: 'Anonymous student 1',
  }
);
assert.deepEqual(
  chronologicalStudentIdentityResolver.resolve({
    anonymousToken: 'newer-browser-token',
    studentName: null,
  }),
  {
    key: 'anonymous:2',
    label: 'Anonymous student 2',
  }
);
assert.deepEqual(buildAnonymousAttemptCopy({}), {
  description:
    'This assignment does not collect student names. This browser will submit as Anonymous browser.',
  title: 'Anonymous attempt',
});
assert.deepEqual(
  buildAnonymousAttemptCopy({ browserLabel: ' Anonymous browser A1B2C3 ' }),
  {
    description:
      'This assignment does not collect student names. This browser will submit as Anonymous browser A1B2C3.',
    title: 'Anonymous attempt',
  }
);
assert.deepEqual(
  buildAnonymousAttemptCopy({ browserLabel: ' Ａｎｏｎ   １ ' }),
  {
    description:
      'This assignment does not collect student names. This browser will submit as Anon 1.',
    title: 'Anonymous attempt',
  }
);
assert.deepEqual(getStudentRunnerCopy(), {
  browseTemplatesLabel: 'Browse templates',
  loadingMessage: 'Loading student activity...',
  missingAssignmentDescription:
    'This link may have been unpublished, closed, or typed incorrectly.',
  missingAssignmentTitle: 'Assignment not found',
  publicAssignmentDescription:
    "This public assignment loads from the teacher share link, collects answers, and scores against the teacher's frozen assignment snapshot.",
  publicRouteBadgeLabel: 'Student play route',
  readOnlyPreviewMessage:
    'Preview assignments are read-only until a teacher publishes a share link.',
  resultAccuracyLabel: 'accuracy',
  resultSubmittedLabel: 'Score submitted',
  resultTimePrefix: 'Time:',
  seoDescription:
    'Open a public student activity runner from a teacher assignment link.',
  seoTitlePrefix: 'Student activity',
  startAnotherAttemptLabel: 'Start another attempt',
  missingStudentNameMessage: 'Type your name before submitting.',
  studentNameLabel: 'Student name',
  studentNamePlaceholder: 'Type your name',
  submissionFailureMessage: 'Attempt could not be saved.',
  submissionSuccessMessage: 'Attempt submitted.',
  timeExpiredMessage: 'Time is up. Review your saved answers, then submit.',
  timeEndedLabel: 'Time ended',
  teacherViewLabel: 'Teacher view',
});
assert.deepEqual(buildStudentRunnerSeoView(), {
  description:
    'Open a public student activity runner from a teacher assignment link.',
  titlePrefix: 'Student activity',
});
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage(
    new Error('This assignment has reached its attempt limit.')
  ),
  'This assignment has reached its attempt limit.'
);
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage(
    new Error('Assignment runtime items include a duplicate item id.')
  ),
  'Attempt could not be saved.'
);
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage(
    new Error('Submitted answers include an unknown item.')
  ),
  'Submitted answers include an unknown item.'
);
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage(
    new Error('Submitted answers include a duplicate item.')
  ),
  'Submitted answers include a duplicate item.'
);
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage(
    new Error('Submitted answers exceed assignment item count.')
  ),
  'Submitted answers exceed assignment item count.'
);
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage(
    new Error('database timeout for assignment_attempts')
  ),
  'Attempt could not be saved.'
);
assert.equal(
  resolveStudentAttemptSubmissionFailureMessage('network closed'),
  'Attempt could not be saved.'
);
assert.deepEqual(buildStudentRunnerMissingView('not-found'), {
  description:
    'This link may have been unpublished, closed, or typed incorrectly.',
  title: 'Assignment not found',
});
assert.deepEqual(buildStudentRunnerMissingView('closed'), {
  description:
    'This assignment link has been closed by the teacher. Ask your teacher for a reopened or new link.',
  title: 'Assignment closed',
});
assert.deepEqual(buildStudentRunnerMissingView('expired'), {
  description:
    'This assignment link has expired. Students can no longer open the activity from this link.',
  title: 'Assignment expired',
});
assert.deepEqual(buildStudentRunnerMissingView('draft'), {
  description:
    'This assignment has not been published for students yet. Ask your teacher to share the published link.',
  title: 'Assignment not published',
});
assert.deepEqual(getActivityRunnerKindCopy('line-match'), {
  correctAnswerLabel: 'Correct match',
  helpText: 'Select a prompt on the left, then select its match on the right.',
  inputPlaceholder: 'Choose a match',
  progressVerb: 'connected',
  title: 'Line match',
  usedChoiceLabel: 'Connected',
});
assert.deepEqual(getActivityRunnerKindCopy('fill-blank'), {
  correctAnswerLabel: 'Correct answer',
  inlineBlankPlaceholder: 'answer',
  inputPlaceholder: 'Type the missing word',
  progressVerb: 'completed',
  title: 'Fill blanks',
  usedChoiceLabel: 'Used',
  wordBankLabel: 'Word bank',
});
assert.deepEqual(getActivityRunnerKindCopy('group-sort'), {
  clearSelectionLabel: 'Clear',
  correctAnswerLabel: 'Correct group',
  emptyItemsLabel: 'All items sorted',
  inputPlaceholder: 'Choose a group',
  itemListLabel: 'Items',
  progressVerb: 'sorted',
  title: 'Group sort',
  usedChoiceLabel: 'Placed',
});
assert.deepEqual(getActivityRunnerKindCopy('listening'), {
  correctAnswerLabel: 'Correct answer',
  helpText: 'Use the play button, then answer what you heard.',
  inputPlaceholder: 'Type what you heard',
  listeningPromptLabel: 'Listen first',
  playAudioLabel: 'Play audio',
  progressVerb: 'answered',
  sequenceItemLabel: 'Track',
  title: 'Listening',
  usedChoiceLabel: 'Selected',
});
assert.equal(getActivityRunnerKindCopy('open-box').sequenceItemLabel, 'Box');
assert.equal(getActivityTemplateRunnerCopy('quiz').title, 'Quiz');
assert.equal(
  getActivityTemplateRunnerCopy('match-up').correctAnswerLabel,
  'Correct match'
);
assert.equal(
  getActivityTemplateRunnerCopy('matching-pairs').progressVerb,
  'matched'
);
assert.equal(
  findChoiceOwner({ 'item-1': 'Paris', 'item-2': 'Rome' }, 'Rome'),
  'item-2'
);
assert.equal(
  findChoiceOwner({ 'item-1': 'Paris', 'item-2': 'Rome' }, 'Berlin'),
  undefined
);
assert.equal(
  findChoiceOwner({ 'item-1': ' Ｐａｒｉｓ ', 'item-2': 'Rome' }, 'paris'),
  'item-1'
);
assert.equal(isSameRuntimeChoice(' Ｆｒｕｉｔ ', 'fruit'), true);
assert.equal(isSameRuntimeChoice('New   York', ' new york '), true);
assert.equal(isSameRuntimeChoice('', 'fruit'), false);
assert.equal(isSameRuntimeChoice('Fruit', 'Drink'), false);
assert.deepEqual(
  buildExclusiveChoiceAnswerChanges({
    answers: { 'item-1': 'Paris' },
    choice: 'Rome',
    itemId: 'item-2',
  }),
  [{ answer: 'Rome', itemId: 'item-2' }]
);
assert.deepEqual(
  buildExclusiveChoiceAnswerChanges({
    answers: { 'item-1': ' Ｐａｒｉｓ ', 'item-2': 'Rome' },
    choice: 'paris',
    itemId: 'item-2',
  }),
  [
    { answer: '', itemId: 'item-1' },
    { answer: 'paris', itemId: 'item-2' },
  ]
);
assert.deepEqual(
  buildExclusiveChoiceAnswerChanges({
    answers: { 'item-1': 'Paris' },
    choice: 'Paris',
    itemId: 'item-1',
  }),
  [{ answer: 'Paris', itemId: 'item-1' }]
);
assert.deepEqual(
  getUniqueRuntimeChoices([
    {
      choices: [' Paris ', '', 'Rome', 'ＰＡＲＩＳ'],
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital?',
    },
    {
      choices: ['Paris', 'Berlin', 'New   York', 'New York'],
      id: 'q-2',
      kind: 'question',
      prompt: 'Another capital?',
    },
  ]),
  ['Paris', 'Rome', 'Berlin', 'New York']
);
assert.deepEqual(
  getUniqueRuntimeChoices([
    {
      choices: [' Ｆｒｕｉｔ ', 'fruit', '  ', 'New   York'],
      id: 'q-fullwidth',
      kind: 'question',
      prompt: 'Normalize choices?',
    },
  ]),
  ['Fruit', 'New York']
);
assert.deepEqual(
  buildRuntimeChoiceViews({
    answers: { 'item-1': 'Ｐａｒｉｓ', 'item-2': 'rome' },
    choices: ['Paris', 'Rome'],
    selectedItemId: 'item-2',
  }),
  [
    {
      choice: 'Paris',
      selected: false,
      usedByItemId: 'item-1',
    },
    {
      choice: 'Rome',
      selected: true,
      usedByItemId: 'item-2',
    },
  ]
);
assert.deepEqual(
  buildRuntimeChoiceButtonViews({
    answer: ' Ｐａｒｉｓ ',
    choices: ['Paris', 'Rome'],
  }),
  [
    {
      choice: 'Paris',
      selected: true,
    },
    {
      choice: 'Rome',
      selected: false,
    },
  ]
);
assert.deepEqual(
  buildDefaultRuntimeItemCardViews({
    answers: { 'q-1': 'Ｐａｒｉｓ' },
    correctAnswerLabel: 'Correct choice',
    inputPlaceholder: 'Type an answer',
    items: [
      {
        choices: ['Paris', 'Rome'],
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
      {
        id: 'q-2',
        kind: 'question',
        prompt: 'Type the capital of Italy.',
      },
    ],
    reviewItems: [
      {
        acceptedAnswers: ['Paris'],
        correct: true,
        correctAnswer: 'Paris',
        itemId: 'q-1',
        submitted: true,
      },
    ],
  }).map((itemView) => ({
    choiceViews: itemView.choiceViews,
    correctAnswerLabel: itemView.correctAnswerLabel,
    inputPlaceholder: itemView.inputPlaceholder,
    positionLabel: itemView.positionLabel,
    reviewSubmitted: itemView.reviewItem?.submitted,
    showChoices: itemView.showChoices,
  })),
  [
    {
      choiceViews: [
        {
          choice: 'Paris',
          selected: true,
        },
        {
          choice: 'Rome',
          selected: false,
        },
      ],
      correctAnswerLabel: 'Correct choice',
      inputPlaceholder: 'Type an answer',
      positionLabel: '1. Capital of France?',
      reviewSubmitted: true,
      showChoices: true,
    },
    {
      choiceViews: [],
      correctAnswerLabel: 'Correct choice',
      inputPlaceholder: 'Type an answer',
      positionLabel: '2. Type the capital of Italy.',
      reviewSubmitted: undefined,
      showChoices: false,
    },
  ]
);
const sequentialRunnerView = buildSequentialRunnerView({
  activeItemId: 'item-2',
  itemLabel: 'Track',
  itemViews: [
    {
      item: {
        id: 'item-1',
        kind: 'question',
        prompt: 'First prompt',
      },
    },
    {
      item: {
        id: 'item-2',
        kind: 'question',
        prompt: 'Second prompt',
      },
    },
  ],
});
assert.equal(sequentialRunnerView.activeIndex, 1);
assert.equal(sequentialRunnerView.activeItem?.id, 'item-2');
assert.equal(sequentialRunnerView.activeLabel, 'Track 2');
assert.equal(sequentialRunnerView.itemViews[0]?.sequenceLabel, 'Track 1');
assert.equal(sequentialRunnerView.itemViews[1]?.sequenceLabel, 'Track 2');
assert.deepEqual(
  buildSequentialRunnerView({
    activeItemId: 'missing',
    itemLabel: 'Box',
    itemViews: [
      {
        item: {
          id: 'box-1',
          kind: 'question',
          prompt: 'Open one',
        },
      },
    ],
  }),
  {
    activeIndex: 0,
    activeItem: {
      id: 'box-1',
      kind: 'question',
      prompt: 'Open one',
    },
    activeItemView: {
      item: {
        id: 'box-1',
        kind: 'question',
        prompt: 'Open one',
      },
      sequenceLabel: 'Box 1',
    },
    activeLabel: 'Box 1',
    itemViews: [
      {
        item: {
          id: 'box-1',
          kind: 'question',
          prompt: 'Open one',
        },
        sequenceLabel: 'Box 1',
      },
    ],
  }
);
assert.equal(formatSequentialRunnerItemLabel(' ', -4), 'Item 1');
overwriteGetLocale(() => 'zh');
try {
  assert.equal(formatSequentialRunnerItemLabel('题目', 1), '题目 2');
} finally {
  overwriteGetLocale(() => 'en');
}
const sequentialStudentRunnerView = buildSequentialStudentRunnerView({
  activeItemId: 'q-1',
  answers: { 'q-1': 'Paris' },
  itemLabel: 'Track',
  items: [
    {
      choices: ['Paris', 'Lyon'],
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
    {
      choices: ['Cold', 'Warm'],
      id: 'pair-1',
      kind: 'pair',
      prompt: 'Hot',
    },
  ],
  progressVerb: 'answered',
  reviewItems: [
    {
      acceptedAnswers: ['Paris'],
      correct: true,
      correctAnswer: 'Paris',
      itemId: 'q-1',
      submitted: true,
    },
  ],
});
assert.equal(sequentialStudentRunnerView.progressLabel, '1/2 answered');
assert.equal(sequentialStudentRunnerView.activeItem?.id, 'q-1');
assert.equal(sequentialStudentRunnerView.activeAnswer, 'Paris');
assert.equal(sequentialStudentRunnerView.activeReviewItem?.correct, true);
assert.deepEqual(sequentialStudentRunnerView.activeChoiceViews, [
  {
    choice: 'Paris',
    selected: true,
  },
  {
    choice: 'Lyon',
    selected: false,
  },
]);
assert.equal(sequentialStudentRunnerView.sequenceView.activeLabel, 'Track 1');
assert.equal(sequentialStudentRunnerView.navigationView.canMove, true);
assert.equal(sequentialStudentRunnerView.navigationView.nextItemId, 'pair-1');
assert.equal(
  sequentialStudentRunnerView.navigationView.previousItemId,
  'pair-1'
);
assert.equal(
  sequentialStudentRunnerView.navigationView.itemViews[0]?.selected,
  true
);
assert.equal(
  sequentialStudentRunnerView.navigationView.itemViews[1]?.selected,
  false
);
assert.equal(
  sequentialStudentRunnerView.navigationView.itemViews[0]
    ?.reviewStatusClassName,
  undefined
);
const revealedSequentialNavigationView =
  buildSequentialStudentRunnerNavigationView({
    activeIndex: 1,
    itemViews: [
      {
        ...sequentialStudentRunnerView.sequenceView.itemViews[0]!,
        status: 'correct',
      },
      {
        ...sequentialStudentRunnerView.sequenceView.itemViews[1]!,
        status: 'needs-review',
      },
    ],
    revealAnswer: true,
  });
assert.equal(
  revealedSequentialNavigationView.activePanelStatusClassName,
  'border-destructive/30 bg-destructive/5'
);
assert.equal(revealedSequentialNavigationView.itemViews[0]?.selected, false);
assert.equal(revealedSequentialNavigationView.itemViews[1]?.selected, true);
assert.equal(
  revealedSequentialNavigationView.itemViews[0]?.reviewStatusClassName,
  'border-primary/35 bg-primary/5'
);
assert.equal(
  revealedSequentialNavigationView.itemViews[1]?.reviewStatusClassName,
  'border-destructive/30 bg-destructive/5'
);
assert.equal(revealedSequentialNavigationView.previousItemId, 'q-1');
assert.equal(revealedSequentialNavigationView.nextItemId, 'q-1');
assert.deepEqual(
  buildSequentialStudentRunnerNavigationView({
    activeIndex: 99,
    itemViews: [
      {
        ...sequentialStudentRunnerView.sequenceView.itemViews[0]!,
        status: 'idle',
      },
    ],
    revealAnswer: true,
  }),
  {
    activePanelStatusClassName: undefined,
    canMove: false,
    itemViews: [
      {
        ...sequentialStudentRunnerView.sequenceView.itemViews[0]!,
        reviewStatusClassName: undefined,
        selected: true,
        status: 'idle',
      },
    ],
    nextItemId: 'q-1',
    previousItemId: 'q-1',
  }
);
assert.equal(
  getSequentialRunnerItemIdByOffset({
    activeIndex: 0,
    itemIds: ['q-1', 'q-2', 'q-3'],
    offset: 1,
  }),
  'q-2'
);
assert.equal(
  getSequentialRunnerItemIdByOffset({
    activeIndex: 0,
    itemIds: ['q-1', 'q-2', 'q-3'],
    offset: -1,
  }),
  'q-3'
);
assert.equal(
  getSequentialRunnerItemIdByOffset({
    activeIndex: Number.POSITIVE_INFINITY,
    itemIds: ['q-1', 'q-2'],
    offset: Number.NaN,
  }),
  'q-1'
);
assert.equal(
  getSequentialRunnerItemIdByOffset({
    activeIndex: 0,
    itemIds: [],
    offset: 1,
  }),
  undefined
);
assert.deepEqual(buildInlineBlankPromptView('I eat ___ for breakfast.'), {
  after: ' for breakfast.',
  before: 'I eat ',
  mode: 'inline',
});
assert.deepEqual(buildInlineBlankPromptView('The capital is [ blank ].'), {
  after: '.',
  before: 'The capital is ',
  mode: 'inline',
});
assert.deepEqual(buildInlineBlankPromptView('Photosynthesis makes (blank).'), {
  after: '.',
  before: 'Photosynthesis makes ',
  mode: 'inline',
});
assert.deepEqual(buildInlineBlankPromptView('Type the missing word.'), {
  mode: 'standalone',
  prompt: 'Type the missing word.',
});
assert.deepEqual(
  buildFillBlankWorksheetView({
    answers: { 'blank-1': 'apple' },
    items: [
      {
        choices: ['apple', 'banana'],
        id: 'blank-1',
        kind: 'question',
        prompt: 'I eat ___ for breakfast.',
      },
      {
        id: 'blank-2',
        kind: 'question',
        prompt: 'Type the missing word.',
      },
    ],
    progressVerb: 'completed',
    wordBankLabel: 'Word bank',
  }).fillBlankItemViews.map((itemView) => ({
    id: itemView.item.id,
    promptView: itemView.promptView,
    sequenceLabel: itemView.sequenceLabel,
    wordBankLineText: itemView.wordBankLineText,
    wordBankText: itemView.wordBankText,
  })),
  [
    {
      id: 'blank-1',
      promptView: {
        after: ' for breakfast.',
        before: 'I eat ',
        mode: 'inline',
      },
      sequenceLabel: '1',
      wordBankLineText: 'Word bank: apple, banana',
      wordBankText: 'apple, banana',
    },
    {
      id: 'blank-2',
      promptView: {
        mode: 'standalone',
        prompt: 'Type the missing word.',
      },
      sequenceLabel: '2',
      wordBankLineText: null,
      wordBankText: null,
    },
  ]
);
overwriteGetLocale(() => 'zh');
try {
  const zhFillBlankView = buildFillBlankWorksheetView({
    answers: {},
    items: [
      {
        choices: ['apple', 'banana'],
        id: 'blank-zh',
        kind: 'question',
        prompt: 'I eat ___ for breakfast.',
      },
    ],
    wordBankLabel: '词库',
  }).fillBlankItemViews[0];

  assert.equal(zhFillBlankView?.wordBankText, 'apple、banana');
  assert.equal(zhFillBlankView?.wordBankLineText, '词库：apple、banana');
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  buildPublicAnswerFeedbackView({
    correctAnswerLabel: 'Correct match',
    reviewItem: {
      acceptedAnswers: ['Paris', 'Paris, France'],
      correct: false,
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital of France.',
      itemId: 'item-1',
      submitted: true,
    },
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersText: 'Accepted answers: Paris, France',
    correctAnswer: 'Paris',
    correctAnswerLabel: 'Correct match',
    correctAnswerText: 'Correct match: Paris',
    explanation: 'Paris is the capital of France.',
    explanationLabel: 'Why',
    explanationText: 'Why: Paris is the capital of France.',
    status: 'needs-review',
    statusLabel: 'Needs review',
  }
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    buildPublicAnswerFeedbackView({
      reviewItem: {
        acceptedAnswers: ['Paris', 'Paris, France'],
        correct: false,
        correctAnswer: 'Paris',
        itemId: 'item-zh',
        submitted: true,
      },
    })?.acceptedAnswersText,
    '可接受答案：Paris, France'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  buildPublicAnswerFeedbackView({
    reviewItem: {
      acceptedAnswers: ['Mitochondria'],
      correct: true,
      correctAnswer: 'Mitochondria',
      itemId: 'item-2',
      submitted: true,
    },
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersText: null,
    correctAnswer: 'Mitochondria',
    correctAnswerLabel: 'Correct answer',
    correctAnswerText: 'Correct answer: Mitochondria',
    explanation: null,
    explanationLabel: 'Why',
    explanationText: null,
    status: 'correct',
    statusLabel: 'Correct',
  }
);
assert.equal(
  getStudentRunnerReviewStatusClassName('correct'),
  'border-primary/35 bg-primary/5'
);
assert.equal(
  getStudentRunnerReviewStatusClassName('needs-review'),
  'border-destructive/30 bg-destructive/5'
);
assert.equal(getStudentRunnerReviewStatusClassName('idle'), undefined);
assert.equal(
  buildPublicAnswerFeedbackView({
    reviewItem: {
      acceptedAnswers: ['Cold'],
      correct: false,
      correctAnswer: 'Cold',
      itemId: 'pair-1',
      submitted: false,
    },
  }),
  null
);

assert.deepEqual(
  getAttemptCompletionSummary({
    answers,
    runtimeItems: submissionRuntimeItems,
  }),
  {
    answeredItemCount: 1,
    itemCount: 3,
    unansweredItemCount: 2,
  }
);
const dirtySubmissionRuntimeItems = [
  { id: ' item-１ ' },
  { id: 'item-1' },
  { id: '   ' },
  { id: 'item-2' },
  { id: 'item-２' },
];
const dirtySubmissionAnswers = {
  ' item-１ ': ' Ａｐｐｌｅ ',
  'item-1': '   ',
  'item-2': '   ',
  'item-２': ' ｂａｎａｎａ ',
};
assert.deepEqual(
  getAttemptCompletionSummary({
    answers: dirtySubmissionAnswers,
    runtimeItems: dirtySubmissionRuntimeItems,
  }),
  {
    answeredItemCount: 2,
    itemCount: 2,
    unansweredItemCount: 0,
  }
);
assert.deepEqual(
  getAttemptCompletionSummary({
    answers: {
      ' item-１ ': ' Ａｐｐｌｅ ',
    },
    runtimeItems: dirtySubmissionRuntimeItems,
  }),
  {
    answeredItemCount: 1,
    itemCount: 2,
    unansweredItemCount: 1,
  }
);
const incompleteCompletionSummary = getAttemptCompletionSummary({
  answers,
  runtimeItems: submissionRuntimeItems,
});
assert.deepEqual(
  getAttemptSubmitDecision({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
  }),
  {
    reason: 'unanswered-items',
    type: 'confirm-incomplete',
    unansweredItemCount: 2,
  }
);
assert.deepEqual(
  getAttemptSubmitDecision({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: true,
  }),
  {
    reason: 'confirmed-incomplete',
    type: 'submit',
  }
);
assert.deepEqual(
  getAttemptSubmitDecision({
    completionSummary: {
      answeredItemCount: 3,
      itemCount: 3,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: false,
  }),
  {
    reason: 'complete',
    type: 'submit',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmitGate({
    canSubmit: false,
    collectStudentName: false,
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
    studentName: '',
  }),
  {
    message:
      'Preview assignments are read-only until a teacher publishes a share link.',
    reason: 'read-only',
    type: 'blocked',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmitGate({
    canSubmit: true,
    collectStudentName: true,
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
    studentName: '   ',
  }),
  {
    message: 'Type your name before submitting.',
    reason: 'missing-student-name',
    type: 'blocked',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmitGate({
    canSubmit: true,
    collectStudentName: true,
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
    studentName: 'Ava',
  }),
  {
    message: '2 questions are still unanswered.',
    reason: 'unanswered-items',
    type: 'confirm-incomplete',
    unansweredItemCount: 2,
  }
);
assert.deepEqual(
  buildStudentAttemptSubmitGate({
    canSubmit: true,
    collectStudentName: true,
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: true,
    studentName: 'Ava',
  }),
  {
    reason: 'confirmed-incomplete',
    type: 'submit',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmitGate({
    canSubmit: true,
    collectStudentName: false,
    completionSummary: {
      answeredItemCount: 3,
      itemCount: 3,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: false,
    studentName: '',
  }),
  {
    reason: 'complete',
    type: 'submit',
  }
);
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
  }),
  {
    confirmIncompleteSubmit: '2 questions are still unanswered.',
    progressLabel: '1/3 answered',
    submitButtonLabel: 'Submit answers',
    unansweredLabel: '2 items left unanswered.',
  }
);
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
    progressVerb: getActivityTemplateRunnerCopy('group-sort').progressVerb,
  }),
  {
    confirmIncompleteSubmit: '2 questions are still unanswered.',
    progressLabel: '1/3 sorted',
    submitButtonLabel: 'Submit answers',
    unansweredLabel: '2 items left unanswered.',
  }
);
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: {
      answeredItemCount: 2,
      itemCount: 3,
      unansweredItemCount: 1,
    },
    confirmIncompleteSubmit: true,
  }),
  {
    confirmIncompleteSubmit: '1 question is still unanswered.',
    progressLabel: '2/3 answered',
    submitButtonLabel: 'Submit anyway',
    unansweredLabel: '1 item left unanswered.',
  }
);
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: {
      answeredItemCount: 3,
      itemCount: 3,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: true,
  }),
  {
    confirmIncompleteSubmit: 'All items are answered.',
    progressLabel: '3/3 answered',
    submitButtonLabel: 'Submit answers',
    unansweredLabel: undefined,
  }
);
assert.equal(
  formatAttemptCompletionProgressLabel({
    completionSummary: incompleteCompletionSummary,
  }),
  '1/3 answered'
);
assert.equal(
  formatAttemptCompletionProgressLabel({
    completionSummary: incompleteCompletionSummary,
    verb: 'matched',
  }),
  '1/3 matched'
);
assert.equal(
  formatAttemptCompletionProgressLabel({
    completionSummary: incompleteCompletionSummary,
    verb: '   ',
  }),
  '1/3 answered'
);
assert.equal(
  formatAttemptCompletionProgressLabel({
    completionSummary: {
      answeredItemCount: Number.NaN,
      itemCount: -1,
      unansweredItemCount: 9,
    },
    verb: ' ｍａｔｃｈｅｄ ',
  }),
  '0/0 matched'
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    formatAttemptCompletionProgressLabel({
      completionSummary: incompleteCompletionSummary,
    }),
    '1/3 已作答'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: {
      answeredItemCount: -1,
      itemCount: Number.NaN,
      unansweredItemCount: -2,
    },
    confirmIncompleteSubmit: true,
    progressVerb: ' ｓｏｒｔｅｄ ',
  }),
  {
    confirmIncompleteSubmit: 'All items are answered.',
    progressLabel: '0/0 sorted',
    submitButtonLabel: 'Submit answers',
    unansweredLabel: undefined,
  }
);
assert.equal(
  buildStudentAttemptSessionKey({
    runtimeItems: submissionRuntimeItems,
    shareSlug: ' share-one ',
  }),
  '["share-one",["item-1","item-2","item-3"]]'
);
assert.equal(
  buildStudentAttemptSessionKey({
    assignmentId: ' assignment-１ ',
    runtimeItems: dirtySubmissionRuntimeItems,
    shareSlug: ' share-one ',
    templateType: ' ｑｕｉｚ ',
  }),
  '["share-one",{"assignmentId":"assignment-1","templateType":"quiz"},["item-1","item-2"]]'
);
assert.notEqual(
  buildStudentAttemptSessionKey({
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
  }),
  buildStudentAttemptSessionKey({
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-two',
  })
);
assert.notEqual(
  buildStudentAttemptSessionKey({
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
  }),
  buildStudentAttemptSessionKey({
    runtimeItems: submissionRuntimeItems.slice().reverse(),
    shareSlug: 'share-one',
  })
);
assert.notEqual(
  buildStudentAttemptSessionKey({
    assignmentId: 'assignment-one',
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
    templateType: 'quiz',
  }),
  buildStudentAttemptSessionKey({
    assignmentId: 'assignment-two',
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
    templateType: 'quiz',
  })
);
assert.notEqual(
  buildStudentAttemptSessionKey({
    assignmentId: 'assignment-one',
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
    templateType: 'quiz',
  }),
  buildStudentAttemptSessionKey({
    assignmentId: 'assignment-one',
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
    templateType: 'line-match',
  })
);

assert.deepEqual(
  buildAttemptSubmissionAnswers({
    answers,
    runtimeItems: submissionRuntimeItems,
  }),
  [
    { answer: 'apple', itemId: 'item-1' },
    { answer: '', itemId: 'item-2' },
    { answer: '', itemId: 'item-3' },
  ]
);
assert.deepEqual(
  buildAttemptSubmissionAnswers({
    answers: dirtySubmissionAnswers,
    runtimeItems: dirtySubmissionRuntimeItems,
  }),
  [
    { answer: 'Apple', itemId: 'item-1' },
    { answer: 'banana', itemId: 'item-2' },
  ]
);
const changedAnswers = buildStudentAnswerChange({
  answer: 'banana',
  answers,
  itemId: 'item-2',
});
assert.deepEqual(changedAnswers, {
  'item-1': ' apple ',
  'item-2': 'banana',
});
assert.deepEqual(answers, {
  'item-1': ' apple ',
  'item-2': '   ',
});
assert.deepEqual(buildStudentAnswerChanges({ answer: 'pear', itemId: 'q-1' }), [
  { answer: 'pear', itemId: 'q-1' },
]);
assert.deepEqual(
  buildStudentAnswerChanges({ answer: 'pear', itemId: ' Ｑ－１ ' }),
  [{ answer: 'pear', itemId: 'Q-1' }]
);
assert.deepEqual(buildStudentAnswerChanges({ answer: 'pear', itemId: '' }), []);
assert.deepEqual(
  buildStudentAnswerChanges({ answer: 'pear', itemId: '\u00A0　\t' }),
  []
);
const batchChangedAnswers = applyStudentAnswerChanges({
  answers,
  changes: [
    { answer: '', itemId: 'item-2' },
    { answer: 'pear', itemId: 'item-3' },
    { answer: 'ignored', itemId: '' },
  ],
});
assert.deepEqual(batchChangedAnswers, {
  'item-1': ' apple ',
  'item-2': '',
  'item-3': 'pear',
});
assert.deepEqual(answers, {
  'item-1': ' apple ',
  'item-2': '   ',
});
assert.deepEqual(
  applyStudentAnswerChanges({
    answers: {},
    changes: [
      { answer: 'apple', itemId: ' ｉｔｅｍ－１ ' },
      { answer: 'ignored', itemId: '\u00A0　\t' },
    ],
  }),
  {
    'item-1': 'apple',
  }
);
assert.deepEqual(
  buildStudentAttemptResultDisplay({
    accuracy: 66.6,
    durationSeconds: 65,
    earnedPoints: 2,
    fallbackDurationSeconds: 120,
    totalPoints: 3,
  }),
  {
    accuracyLabel: '67% accuracy',
    durationLabel: 'Time: 1:05',
    scoreLabel: '2/3',
  }
);
assert.deepEqual(
  buildStudentAttemptResultDisplay({
    accuracy: 100,
    earnedPoints: 4,
    fallbackDurationSeconds: 5,
    totalPoints: 4,
  }),
  {
    accuracyLabel: '100% accuracy',
    durationLabel: 'Time: 5s',
    scoreLabel: '4/4',
  }
);
assert.deepEqual(
  buildStudentAttemptResultDisplay({
    accuracy: Number.NaN,
    durationSeconds: Number.POSITIVE_INFINITY,
    earnedPoints: Number.NaN,
    fallbackDurationSeconds: 4.6,
    totalPoints: -2,
  }),
  {
    accuracyLabel: '- accuracy',
    durationLabel: 'Time: 5s',
    scoreLabel: '0/0',
  }
);
assert.deepEqual(
  buildStudentAttemptResultDisplay({
    accuracy: 50,
    earnedPoints: 1.9,
    fallbackDurationSeconds: 5,
    totalPoints: 2.9,
  }),
  {
    accuracyLabel: '50% accuracy',
    durationLabel: 'Time: 5s',
    scoreLabel: '1/2',
  }
);
overwriteGetLocale(() => 'zh');
try {
  assert.deepEqual(
    buildStudentAttemptResultDisplay({
      accuracy: 50,
      earnedPoints: 1,
      fallbackDurationSeconds: 5,
      totalPoints: 2,
    }),
    {
      accuracyLabel: '50% 正确率',
      durationLabel: '用时：5 秒',
      scoreLabel: '1/2',
    }
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  buildStudentAttemptControlState({
    canSubmit: true,
    hasResult: false,
    isSubmitting: false,
    timeExpired: false,
    unansweredLabel: '2 items left unanswered.',
  }),
  {
    readOnlyMessage: undefined,
    runtimeItemsDisabled: false,
    showTimeExpiredMessage: false,
    submitDisabled: false,
    unansweredLabel: '2 items left unanswered.',
  }
);
assert.deepEqual(
  buildStudentAttemptControlState({
    canSubmit: true,
    hasResult: false,
    isSubmitting: false,
    timeExpired: true,
  }),
  {
    readOnlyMessage: undefined,
    runtimeItemsDisabled: true,
    showTimeExpiredMessage: true,
    submitDisabled: false,
    unansweredLabel: undefined,
  }
);
assert.deepEqual(
  buildStudentAttemptControlState({
    canSubmit: true,
    hasResult: true,
    isSubmitting: false,
    timeExpired: true,
    unansweredLabel: '1 item left unanswered.',
  }),
  {
    readOnlyMessage: undefined,
    runtimeItemsDisabled: true,
    showTimeExpiredMessage: false,
    submitDisabled: true,
    unansweredLabel: undefined,
  }
);
assert.deepEqual(
  buildStudentAttemptControlState({
    canSubmit: false,
    hasResult: false,
    isSubmitting: true,
    timeExpired: false,
  }),
  {
    readOnlyMessage:
      'Preview assignments are read-only until a teacher publishes a share link.',
    runtimeItemsDisabled: false,
    showTimeExpiredMessage: false,
    submitDisabled: true,
    unansweredLabel: undefined,
  }
);
assert.deepEqual(
  buildAssignmentAttemptUsage({
    maxAttempts: 2,
    previousAttemptCount: 0,
  }),
  {
    maxAttempts: 2,
    remainingAttempts: 1,
    usedAttempts: 1,
  }
);
assert.deepEqual(
  buildAssignmentAttemptUsage({
    maxAttempts: 2,
    previousAttemptCount: 1,
  }),
  {
    maxAttempts: 2,
    remainingAttempts: 0,
    usedAttempts: 2,
  }
);
assert.deepEqual(
  buildAssignmentAttemptUsage({
    maxAttempts: null,
    previousAttemptCount: 3,
  }),
  {
    maxAttempts: undefined,
    remainingAttempts: undefined,
    usedAttempts: 4,
  }
);
assert.equal(normalizeAssignmentAttemptCount(2.9), 2);
assert.equal(normalizeAssignmentAttemptCount(-1), 0);
assert.equal(normalizeAssignmentAttemptCount(Number.NaN), 0);
assert.equal(normalizeAssignmentRemainingAttempts(2.9), 2);
assert.equal(normalizeAssignmentRemainingAttempts(-1), 0);
assert.equal(normalizeAssignmentRemainingAttempts(Number.NaN), 0);
assert.equal(
  canUseAnotherAssignmentAttempt({
    maxAttempts: 2,
    usedAttempts: 1,
  }),
  true
);
assert.equal(
  canUseAnotherAssignmentAttempt({
    maxAttempts: 2,
    usedAttempts: 2,
  }),
  false
);
assert.equal(
  canUseAnotherAssignmentAttempt({
    maxAttempts: null,
    usedAttempts: 25,
  }),
  true
);
assert.equal(
  formatStudentAttemptUsageLabel({
    maxAttempts: 2,
    remainingAttempts: 1,
    usedAttempts: 1,
  }),
  '1 attempt left'
);
assert.equal(
  formatStudentAttemptUsageLabel({
    maxAttempts: 3,
    remainingAttempts: 2,
    usedAttempts: 1,
  }),
  '2 attempts left'
);
assert.equal(
  formatStudentAttemptUsageLabel({
    maxAttempts: 2,
    remainingAttempts: 0,
    usedAttempts: 2,
  }),
  'No attempts left'
);
assert.equal(
  formatStudentAttemptUsageLabel({
    maxAttempts: 3,
    remainingAttempts: 2.9,
    usedAttempts: 1,
  }),
  '2 attempts left'
);
assert.equal(
  formatStudentAttemptUsageLabel({
    maxAttempts: 2,
    remainingAttempts: -1,
    usedAttempts: 3,
  }),
  'No attempts left'
);
assert.equal(
  formatStudentAttemptUsageLabel({
    maxAttempts: 2,
    remainingAttempts: Number.NaN,
    usedAttempts: 1,
  }),
  'No attempts left'
);
assert.equal(
  formatStudentAttemptUsageLabel({
    usedAttempts: 12,
  }),
  'Additional attempts allowed'
);
assert.equal(
  canStartAnotherStudentAttempt({
    canSubmit: false,
    hasResult: true,
    maxAttempts: 2,
    submittedAttemptCount: 1,
  }),
  false
);
assert.equal(
  canStartAnotherStudentAttempt({
    canSubmit: true,
    hasResult: false,
    maxAttempts: 2,
    submittedAttemptCount: 1,
  }),
  false
);
assert.equal(
  canStartAnotherStudentAttempt({
    canSubmit: true,
    hasResult: true,
    maxAttempts: 2,
    submittedAttemptCount: 1,
  }),
  true
);
assert.equal(
  canStartAnotherStudentAttempt({
    canSubmit: true,
    hasResult: true,
    maxAttempts: 2,
    submittedAttemptCount: 2,
  }),
  false
);
assert.equal(
  canStartAnotherStudentAttempt({
    canSubmit: true,
    hasResult: true,
    submittedAttemptCount: 25,
  }),
  true
);
assert.equal(
  canStartAnotherStudentAttempt({
    canSubmit: true,
    hasResult: true,
    maxAttempts: 1,
    submittedAttemptCount: Number.NaN,
  }),
  true
);
assert.deepEqual(
  buildStudentAttemptTimerBadge({
    remainingSeconds: undefined,
    timeExpired: false,
    timeLimitSeconds: undefined,
  }),
  {
    label: '',
    show: false,
  }
);
assert.deepEqual(
  buildStudentAttemptTimerBadge({
    remainingSeconds: 30,
    timeExpired: false,
    timeLimitSeconds: Number.NaN,
  }),
  {
    label: '',
    show: false,
  }
);
assert.deepEqual(
  buildStudentAttemptTimerBadge({
    remainingSeconds: 30,
    timeExpired: false,
    timeLimitSeconds: -120,
  }),
  {
    label: '',
    show: false,
  }
);
assert.deepEqual(
  buildStudentAttemptTimerBadge({
    remainingSeconds: 65,
    timeExpired: false,
    timeLimitSeconds: 120,
  }),
  {
    label: '1:05',
    show: true,
  }
);
assert.deepEqual(
  buildStudentAttemptTimerBadge({
    remainingSeconds: Number.NaN,
    timeExpired: false,
    timeLimitSeconds: 120,
  }),
  {
    label: '',
    show: false,
  }
);
assert.deepEqual(
  buildStudentAttemptTimerBadge({
    remainingSeconds: 0,
    timeExpired: true,
    timeLimitSeconds: 120,
  }),
  {
    label: 'Time ended',
    show: true,
  }
);
assert.deepEqual(
  buildStudentAttemptSubmissionInput({
    answers,
    collectStudentName: true,
    durationSeconds: 89,
    runtimeItems: submissionRuntimeItems,
    shareSlug: ' share-one ',
    anonymousToken: ' anonymous-token-should-not-send ',
    studentName: ' Ava   Chen ',
  }),
  {
    answers: [
      { answer: 'apple', itemId: 'item-1' },
      { answer: '', itemId: 'item-2' },
      { answer: '', itemId: 'item-3' },
    ],
    durationSeconds: 89,
    shareSlug: 'share-one',
    studentName: 'Ava Chen',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmissionInput({
    answers,
    collectStudentName: true,
    durationSeconds: Number.POSITIVE_INFINITY,
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
    studentName: 'Ava Chen',
  }),
  {
    answers: [
      { answer: 'apple', itemId: 'item-1' },
      { answer: '', itemId: 'item-2' },
      { answer: '', itemId: 'item-3' },
    ],
    shareSlug: 'share-one',
    studentName: 'Ava Chen',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmissionInput({
    answers,
    collectStudentName: true,
    durationSeconds: 4.6,
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-one',
    studentName: 'Ava Chen',
  }),
  {
    answers: [
      { answer: 'apple', itemId: 'item-1' },
      { answer: '', itemId: 'item-2' },
      { answer: '', itemId: 'item-3' },
    ],
    durationSeconds: 5,
    shareSlug: 'share-one',
    studentName: 'Ava Chen',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmissionInput({
    answers,
    collectStudentName: false,
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-two',
    anonymousToken: ' anonymous-token-1 ',
    studentName: 'Stale Name',
  }),
  {
    anonymousToken: 'anonymous-token-1',
    answers: [
      { answer: 'apple', itemId: 'item-1' },
      { answer: '', itemId: 'item-2' },
      { answer: '', itemId: 'item-3' },
    ],
    shareSlug: 'share-two',
  }
);
assert.deepEqual(
  buildStudentAttemptSubmissionPlan({
    answers,
    canSubmit: true,
    collectStudentName: true,
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
    createAnonymousToken: () => {
      throw new Error('Anonymous token should not be created before confirm.');
    },
    now: 6_500,
    runtimeItems: submissionRuntimeItems,
    shareSlug: ' share-one ',
    startedAt: 1_000,
    studentName: 'Ava',
    timeLimitSeconds: 10,
  }),
  {
    message: '2 questions are still unanswered.',
    reason: 'unanswered-items',
    type: 'confirm-incomplete',
    unansweredItemCount: 2,
  }
);
let submissionPlanAnonymousTokenCreateCount = 0;
assert.deepEqual(
  buildStudentAttemptSubmissionPlan({
    answers,
    canSubmit: true,
    collectStudentName: false,
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: true,
    createAnonymousToken: () => {
      submissionPlanAnonymousTokenCreateCount += 1;
      return ' created-plan-token ';
    },
    now: 6_500,
    runtimeItems: submissionRuntimeItems,
    shareSlug: ' share-two ',
    startedAt: 1_000,
    studentName: 'Stale Name',
    timeLimitSeconds: 10,
  }),
  {
    anonymousToken: 'created-plan-token',
    input: {
      anonymousToken: 'created-plan-token',
      answers: [
        { answer: 'apple', itemId: 'item-1' },
        { answer: '', itemId: 'item-2' },
        { answer: '', itemId: 'item-3' },
      ],
      durationSeconds: 6,
      shareSlug: 'share-two',
    },
    reason: 'confirmed-incomplete',
    type: 'submit',
  }
);
assert.equal(submissionPlanAnonymousTokenCreateCount, 1);
assert.deepEqual(
  buildStudentAttemptSubmissionPlan({
    anonymousToken: ' current-plan-token ',
    answers,
    canSubmit: true,
    collectStudentName: true,
    completionSummary: {
      answeredItemCount: 3,
      itemCount: 3,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: false,
    createAnonymousToken: () => {
      throw new Error('Named submissions should not create anonymous tokens.');
    },
    now: 12_000,
    runtimeItems: submissionRuntimeItems,
    shareSlug: ' share-three ',
    startedAt: 1_000,
    studentName: ' Ava   Chen ',
    timeLimitSeconds: 10,
  }),
  {
    anonymousToken: undefined,
    input: {
      answers: [
        { answer: 'apple', itemId: 'item-1' },
        { answer: '', itemId: 'item-2' },
        { answer: '', itemId: 'item-3' },
      ],
      durationSeconds: 10,
      shareSlug: 'share-three',
      studentName: 'Ava Chen',
    },
    reason: 'complete',
    type: 'submit',
  }
);
assert.equal(
  resolveAttemptSubmissionDurationSeconds({
    now: 6_500,
    startedAt: 1_000,
    timeLimitSeconds: 10,
  }),
  6
);
assert.equal(
  resolveAttemptSubmissionDurationSeconds({
    now: 12_000,
    startedAt: 1_000,
    timeLimitSeconds: 10,
  }),
  10
);
assert.equal(
  resolveAttemptSubmissionDurationSeconds({
    now: 1_000,
    startedAt: 2_000,
  }),
  0
);
let anonymousTokenCreateCount = 0;
assert.equal(
  resolveStudentAttemptAnonymousToken({
    collectStudentName: true,
    currentAnonymousToken: ' current-token ',
    createAnonymousToken: () => {
      anonymousTokenCreateCount += 1;
      return 'created-token';
    },
  }),
  undefined
);
assert.equal(anonymousTokenCreateCount, 0);
assert.equal(
  resolveStudentAttemptAnonymousToken({
    collectStudentName: false,
    currentAnonymousToken: ' current-token ',
    createAnonymousToken: () => {
      anonymousTokenCreateCount += 1;
      return 'created-token';
    },
  }),
  'current-token'
);
assert.equal(anonymousTokenCreateCount, 0);
assert.equal(
  resolveStudentAttemptAnonymousToken({
    collectStudentName: false,
    currentAnonymousToken: '   ',
    createAnonymousToken: () => {
      anonymousTokenCreateCount += 1;
      return ' created-token ';
    },
  }),
  'created-token'
);
assert.equal(anonymousTokenCreateCount, 1);
const fixedOrderRuntimeItems = orderAssignmentRuntimeItems({
  items: submissionRuntimeItems,
  shareSlug: 'share-1',
  shuffleItems: false,
});
assert.deepEqual(fixedOrderRuntimeItems, submissionRuntimeItems);
assert.notEqual(fixedOrderRuntimeItems, submissionRuntimeItems);
const shuffledOnce = orderAssignmentRuntimeItems({
  items: submissionRuntimeItems,
  shareSlug: 'share-1',
  shuffleItems: true,
});
const shuffledAgain = orderAssignmentRuntimeItems({
  items: submissionRuntimeItems,
  shareSlug: 'share-1',
  shuffleItems: true,
});
assert.deepEqual(shuffledOnce, shuffledAgain);
assert.deepEqual(
  orderAssignmentRuntimeItems({
    items: submissionRuntimeItems,
    shareSlug: ' share-1 ',
    shuffleItems: true,
  }),
  shuffledOnce
);
assert.notEqual(shuffledOnce, submissionRuntimeItems);
assert.deepEqual(
  submissionRuntimeItems.map((item) => item.id),
  ['item-1', 'item-2', 'item-3']
);
assert.deepEqual(
  stableShuffle(submissionRuntimeItems, 'share-2').map((item) => item.id),
  stableShuffle(submissionRuntimeItems, 'share-2').map((item) => item.id)
);
assert.deepEqual(ASSIGNMENT_MANAGED_STATUSES, ['published', 'closed']);
assert.equal(
  updateAssignmentStatusInputSchema.parse({
    assignmentId: 'assignment-1',
    status: 'published',
  }).status,
  'published'
);
assert.equal(
  updateAssignmentStatusInputSchema.parse({
    assignmentId: 'assignment-1',
    status: 'closed',
  }).status,
  'closed'
);
assert.throws(() =>
  updateAssignmentStatusInputSchema.parse({
    assignmentId: 'assignment-1',
    status: 'draft',
  })
);
assert.deepEqual(getAssignmentStatusActionCopy('closed'), {
  failureMessage: 'Assignment status could not be updated.',
  label: 'Close link',
  successMessage: 'Assignment link closed.',
});
assert.deepEqual(getAssignmentStatusActionCopy('published'), {
  failureMessage: 'Assignment status could not be updated.',
  label: 'Reopen link',
  successMessage: 'Assignment link reopened.',
});
const assignmentLifecycleNow = new Date('2026-01-01T10:00:00.000Z').getTime();
assert.equal(
  getAssignmentLifecycleStatus(
    'published',
    new Date('2026-01-01T10:00:01.000Z'),
    assignmentLifecycleNow
  ),
  'open'
);
assert.equal(
  getAssignmentLifecycleStatus(
    'published',
    new Date('2026-01-01T10:00:00.000Z'),
    assignmentLifecycleNow
  ),
  'expired'
);
assert.equal(
  getAssignmentLifecycleStatus(
    'published',
    'not-a-date',
    assignmentLifecycleNow
  ),
  'open'
);
assert.equal(
  getAssignmentLifecycleStatus('closed', null, assignmentLifecycleNow),
  'closed'
);
assert.equal(
  getAssignmentLifecycleStatus('draft', null, assignmentLifecycleNow),
  'draft'
);
assert.equal(
  getAssignmentLifecycleStatus('legacy-status', null, assignmentLifecycleNow),
  'draft'
);
assert.equal(
  getAssignmentStatusLabel(
    'published',
    new Date('2026-01-01T10:00:00.000Z'),
    assignmentLifecycleNow
  ),
  'Expired'
);
assert.equal(
  isAssignmentOpen(
    'published',
    new Date('2026-01-01T10:00:01.000Z'),
    assignmentLifecycleNow
  ),
  true
);
assert.equal(
  isAssignmentOpen(
    'published',
    new Date('2026-01-01T10:00:00.000Z'),
    assignmentLifecycleNow
  ),
  false
);
assert.equal(
  matchesAssignmentLifecycleStatus({
    expiresAt: new Date('2026-01-01T10:00:00.000Z'),
    filter: 'expired',
    now: assignmentLifecycleNow,
    status: 'published',
  }),
  true
);
assert.equal(
  matchesAssignmentLifecycleStatus({
    expiresAt: null,
    filter: 'open',
    now: assignmentLifecycleNow,
    status: 'closed',
  }),
  false
);
for (const lifecycleStatus of ASSIGNMENT_LIFECYCLE_STATUS_FILTERS) {
  const filter = buildAssignmentLifecycleStatusFilter({
    now: new Date(assignmentLifecycleNow),
    status: lifecycleStatus,
  }) as { queryChunks?: unknown[] };

  assert.equal(Array.isArray(filter.queryChunks), true);
  assert.equal((filter.queryChunks?.length ?? 0) > 0, true);
}
assert.equal(
  getAssignmentSubmissionErrorMessage({
    expiresAt: new Date('2026-01-01T10:00:01.000Z'),
    now: assignmentLifecycleNow,
    status: 'published',
  }),
  undefined
);
assert.equal(
  getAssignmentSubmissionErrorMessage({
    expiresAt: null,
    now: assignmentLifecycleNow,
    status: 'closed',
  }),
  'This assignment is closed.'
);
assert.equal(
  getAssignmentSubmissionErrorMessage({
    expiresAt: new Date('2026-01-01T10:00:00.000Z'),
    now: assignmentLifecycleNow,
    status: 'published',
  }),
  'This assignment has expired.'
);
assert.equal(
  getAssignmentSubmissionErrorMessage({
    expiresAt: null,
    now: assignmentLifecycleNow,
    status: 'draft',
  }),
  'This assignment has not been published for students yet.'
);
assert.doesNotThrow(() =>
  assertAssignmentAcceptsSubmissions({
    expiresAt: new Date('2026-01-01T10:00:01.000Z'),
    now: assignmentLifecycleNow,
    status: 'published',
  })
);
assert.throws(
  () =>
    assertAssignmentAcceptsSubmissions({
      expiresAt: null,
      now: assignmentLifecycleNow,
      status: 'closed',
    }),
  /This assignment is closed\./
);
assert.throws(
  () =>
    assertAssignmentAcceptsSubmissions({
      expiresAt: new Date('2026-01-01T10:00:00.000Z'),
      now: assignmentLifecycleNow,
      status: 'published',
    }),
  /This assignment has expired\./
);
assert.throws(
  () =>
    assertAssignmentAcceptsSubmissions({
      expiresAt: null,
      now: assignmentLifecycleNow,
      status: 'draft',
    }),
  /This assignment has not been published for students yet\./
);
assert.deepEqual(
  buildAssignmentStatusAction({
    currentStatus: 'published',
    expiresAt: null,
    isPersisted: true,
  }),
  {
    failureMessage: 'Assignment status could not be updated.',
    kind: 'close-link',
    label: 'Close link',
    nextStatus: 'closed',
    successMessage: 'Assignment link closed.',
  }
);
assert.deepEqual(
  buildAssignmentStatusAction({
    currentStatus: 'closed',
    expiresAt: null,
    isPersisted: true,
  }),
  {
    failureMessage: 'Assignment status could not be updated.',
    kind: 'reopen-link',
    label: 'Reopen link',
    nextStatus: 'published',
    successMessage: 'Assignment link reopened.',
  }
);
assert.equal(
  buildAssignmentStatusAction({
    currentStatus: 'closed',
    expiresAt: new Date('2026-01-01T09:00:00.000Z'),
    isPersisted: true,
    now: new Date('2026-01-01T10:00:00.000Z').getTime(),
  }),
  undefined
);
assert.equal(
  buildAssignmentStatusAction({
    currentStatus: 'published',
    expiresAt: null,
    isPersisted: false,
  }),
  undefined
);
assert.deepEqual(
  buildAssignmentStatusActionExecutionPlan({
    assignmentId: 'assignment-close',
    statusAction: buildAssignmentStatusAction({
      currentStatus: 'published',
      expiresAt: null,
      isPersisted: true,
    }),
  }),
  {
    failureMessage: 'Assignment status could not be updated.',
    input: {
      assignmentId: 'assignment-close',
      status: 'closed',
    },
    successMessage: 'Assignment link closed.',
    type: 'update-status',
  }
);
assert.deepEqual(
  buildAssignmentStatusActionExecutionPlan({
    assignmentId: 'assignment-reopen',
    statusAction: buildAssignmentStatusAction({
      currentStatus: 'closed',
      expiresAt: null,
      isPersisted: true,
    }),
  }),
  {
    failureMessage: 'Assignment status could not be updated.',
    input: {
      assignmentId: 'assignment-reopen',
      status: 'published',
    },
    successMessage: 'Assignment link reopened.',
    type: 'update-status',
  }
);
assert.deepEqual(
  buildAssignmentStatusActionExecutionPlan({
    assignmentId: 'assignment-blocked',
    statusAction: undefined,
  }),
  {
    type: 'blocked',
  }
);
assert.doesNotThrow(() =>
  assertAssignmentStatusTransition({
    currentStatus: 'published',
    expiresAt: null,
    nextStatus: 'closed',
  })
);
assert.doesNotThrow(() =>
  assertAssignmentStatusTransition({
    currentStatus: 'closed',
    expiresAt: null,
    nextStatus: 'published',
  })
);
assert.throws(
  () =>
    assertAssignmentStatusTransition({
      currentStatus: 'published',
      expiresAt: null,
      nextStatus: 'published',
    }),
  /Assignment link is already open\./
);
assert.throws(
  () =>
    assertAssignmentStatusTransition({
      currentStatus: 'closed',
      expiresAt: null,
      nextStatus: 'closed',
    }),
  /Assignment link is already closed\./
);
assert.throws(
  () =>
    assertAssignmentStatusTransition({
      currentStatus: 'draft',
      expiresAt: null,
      nextStatus: 'closed',
    }),
  /Only published assignment links can be closed\./
);
assert.throws(
  () =>
    assertAssignmentStatusTransition({
      currentStatus: 'draft',
      expiresAt: null,
      nextStatus: 'published',
    }),
  /Only closed assignment links can be reopened\./
);
assert.throws(
  () =>
    assertAssignmentStatusTransition({
      currentStatus: 'closed',
      expiresAt: new Date('2026-01-01T09:00:00.000Z'),
      nextStatus: 'published',
      now: new Date('2026-01-01T10:00:00.000Z').getTime(),
    }),
  /Expired assignments cannot be reopened\./
);
assert.deepEqual(resolveAssignmentSettings(null), {
  collectStudentName: true,
  instructions: undefined,
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
  timeLimitSeconds: undefined,
});
assert.deepEqual(
  resolveAssignmentSettings({
    maxAttempts: null,
  }),
  {
    collectStudentName: true,
    instructions: undefined,
    maxAttempts: null,
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitSeconds: undefined,
  }
);
assert.deepEqual(
  resolveAssignmentSettings({
    maxAttempts: undefined,
  }),
  {
    collectStudentName: true,
    instructions: undefined,
    maxAttempts: 2,
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitSeconds: undefined,
  }
);
assert.deepEqual(
  resolveAssignmentSettings({
    collectStudentName: false,
    instructions: '  Finish before class.  ',
    maxAttempts: 3,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 900,
  }),
  {
    collectStudentName: false,
    instructions: 'Finish before class.',
    maxAttempts: 3,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 900,
  }
);
assert.deepEqual(
  resolveAssignmentSettings({
    instructions: '   ',
    maxAttempts: 99,
    timeLimitSeconds: 30,
  }),
  {
    collectStudentName: true,
    instructions: undefined,
    maxAttempts: 2,
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitSeconds: undefined,
  }
);
assert.deepEqual(
  withResolvedAssignmentSettings({
    assignment: {
      id: 'assignment-1',
      settingsJson: {
        collectStudentName: false,
        maxAttempts: null,
        showCorrectAnswers: false,
      },
    },
    meta: 'kept',
  }),
  {
    assignment: {
      id: 'assignment-1',
      settingsJson: {
        collectStudentName: false,
        instructions: undefined,
        maxAttempts: null,
        showCorrectAnswers: false,
        shuffleItems: true,
        timeLimitSeconds: undefined,
      },
    },
    meta: 'kept',
  }
);
assert.deepEqual(ASSIGNMENT_MAX_ATTEMPTS_RANGE, { max: 10, min: 1 });
assert.deepEqual(ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE, {
  max: 10_800,
  min: 60,
});
assert.deepEqual(ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE, {
  max: 180,
  min: 1,
});
assert.deepEqual(ASSIGNMENT_PUBLISH_FIELD_LIMITS, {
  instructionsMaxLength: 500,
  titleMaxLength: 120,
  titleMinLength: 3,
});
assert.deepEqual(
  publishAssignmentInputSchema.parse({
    activityId: 'activity-1',
    settings: {
      instructions: 'A'.repeat(
        ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength
      ),
    },
    title: 'A'.repeat(ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength),
  }).title,
  'A'.repeat(ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength)
);
assert.throws(() =>
  publishAssignmentInputSchema.parse({
    activityId: 'activity-1',
    title: 'A'.repeat(ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength - 1),
  })
);
assert.throws(() =>
  publishAssignmentInputSchema.parse({
    activityId: 'activity-1',
    settings: {
      instructions: 'A'.repeat(
        ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength + 1
      ),
    },
    title: 'A'.repeat(ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMinLength),
  })
);
const assignmentPublishInputSource = readFileSync(
  'src/assignments/publish-input.ts',
  'utf8'
);
assert.match(
  assignmentPublishInputSource,
  /ASSIGNMENT_MAX_ATTEMPTS_RANGE/,
  'Publish dialog input parsing should reuse the assignment-domain max-attempt range.'
);
assert.match(
  assignmentPublishInputSource,
  /ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE/,
  'Publish dialog input parsing should reuse the assignment-domain timer range.'
);
assert.match(
  assignmentPublishInputSource,
  /ASSIGNMENT_PUBLISH_FIELD_LIMITS/,
  'Publish dialog input validation should reuse assignment-domain field limits.'
);
assert.doesNotMatch(
  assignmentPublishInputSource,
  /const PUBLISH_ATTEMPTS_RANGE|const PUBLISH_TIME_LIMIT_MINUTES_RANGE/,
  'Publish dialog input parsing should not maintain separate local delivery ranges.'
);
assert.deepEqual(ASSIGNMENT_SHARE_SLUG_LENGTH, {
  generated: 10,
  max: 80,
  min: 1,
});
assert.equal(buildAssignmentSharePath('abc 123'), '/play/abc%20123');
assert.equal(buildAssignmentSharePath('  abc 123  '), '/play/abc%20123');
assert.equal(buildAssignmentSharePath('　abc １２３　'), '/play/abc%20123');
assert.equal(
  buildAssignmentSharePath('class/6?homework=yes'),
  '/play/class%2F6%3Fhomework%3Dyes'
);
assert.equal(normalizeAssignmentShareSlug('  share-one  '), 'share-one');
assert.equal(normalizeAssignmentShareSlug('　share-１２３　'), 'share-123');
assert.equal(isSameAssignmentShareSlug(' share-１２３ ', 'share-123'), true);
assert.equal(isSameAssignmentShareSlug('share-123', 'share-124'), false);
assert.equal(
  normalizeShareBaseUrl('  https://classgamify.test///  '),
  'https://classgamify.test'
);
assert.equal(
  normalizeShareBaseUrl('https://classgamify.test/app?utm=teacher#share'),
  'https://classgamify.test'
);
assert.equal(
  normalizeShareBaseUrl('http://localhost:3000/base/path'),
  'http://localhost:3000'
);
assert.equal(
  buildAssignmentShareUrl('abc 123', 'https://classgamify.test/'),
  'https://classgamify.test/play/abc%20123'
);
assert.equal(
  buildAssignmentShareUrl(
    'class/6',
    'https://classgamify.test/dashboard/assignments?published=class'
  ),
  'https://classgamify.test/play/class%2F6'
);
assert.equal(
  buildAssignmentShareUrl('abc 123', '   '),
  buildAssignmentShareUrl('abc 123')
);
assert.deepEqual(assignmentShareLinkActionCopy, {
  copyLabel: 'Copy link',
  failureMessage: 'Student link could not be copied.',
  successMessage: 'Student link copied.',
});
assert.equal(parseOptionalWholeNumber(''), undefined);
assert.equal(parseOptionalWholeNumber(' 12 '), 12);
assert.equal(parseOptionalWholeNumber(' １２ '), 12);
assert.equal(parseOptionalWholeNumber(' １ ２ '), 12);
assert.equal(parseOptionalWholeNumber('1.5'), undefined);
assert.equal(parseOptionalWholeNumber('1e1'), undefined);
assert.equal(parseOptionalWholeNumber('0x10'), undefined);
assert.equal(parseOptionalWholeNumber('+2'), undefined);
assert.equal(parseOptionalWholeNumber('abc'), undefined);
assert.equal(parseAssignmentDateTimeLocal(''), null);
assert.equal(parseAssignmentDateTimeLocal('not-a-date'), null);
assert.equal(parseAssignmentDateTimeLocal('2026-02-30T09:30'), null);
assert.equal(parseAssignmentDateTimeLocal('2026-01-10 09:30'), null);
assert.equal(
  parseAssignmentDateTimeLocal('2026-01-10T09:30')?.getFullYear(),
  2026
);
assert.equal(
  parseAssignmentDateTimeLocal('2026-01-10T09:30:45')?.getSeconds(),
  45
);
assert.match(
  formatAssignmentDateTimeLocal(new Date('2026-01-10T09:30:00.000Z')),
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
);
assert.deepEqual(ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS, {
  minLeadMinutes: 1,
  millisecondsPerSecond: 1000,
  secondsPerMinute: 60,
});
assert.equal(
  buildAssignmentPublishCloseAfterMinLocal(new Date(2026, 0, 10, 9, 30, 45)),
  '2026-01-10T09:31'
);
assert.deepEqual(
  buildAssignmentPublishDraftDefaults({
    activityId: 'activity-1',
    title: 'Food groups',
  }),
  {
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Food groups',
  }
);
assert.deepEqual(
  assignmentPublishToggleOptions.map((option) => option.key),
  ['collectStudentName', 'showCorrectAnswers', 'shuffleItems']
);
assert.deepEqual(
  assignmentPublishToggleOptions.map((option) => option.label),
  ['Collect student name', 'Show correct answers', 'Shuffle items']
);
assert.deepEqual(
  buildAssignmentPublishToggleViews({
    collectStudentName: false,
    showCorrectAnswers: true,
    shuffleItems: false,
  }),
  [
    {
      checked: false,
      description: 'Ask learners to type their name before submitting.',
      key: 'collectStudentName',
      label: 'Collect student name',
    },
    {
      checked: true,
      description: 'Reveal correct answers after an attempt is submitted.',
      key: 'showCorrectAnswers',
      label: 'Show correct answers',
    },
    {
      checked: false,
      description: 'Prepare this assignment for randomized item order.',
      key: 'shuffleItems',
      label: 'Shuffle items',
    },
  ]
);
assert.equal(assignmentPublishDialogCopy.title, 'Publish assignment');
assert.equal(
  assignmentPublishDialogCopy.description,
  'Freeze this activity into a student share link with classroom delivery settings.'
);
assert.equal(assignmentPublishDialogCopy.previewLabel, 'Delivery preview');
assert.equal(assignmentPublishDialogCopy.timeLimitPlaceholder, 'No limit');
assert.equal(
  assignmentPublishDialogCopy.maxAttemptsHelp,
  'Leave blank for unlimited attempts. Use 1-10 to cap each student identity.'
);
assert.deepEqual(
  buildAssignmentPublishDraft({
    defaults: buildAssignmentPublishDraftDefaults({
      activityId: 'activity-1',
      title: 'Food groups',
    }),
    values: {
      activityId: 'activity-should-stay-1',
      collectStudentName: false,
      instructions: 'Chapter 1 review',
      maxAttempts: '3',
      title: 'Week 1 homework',
    } as Partial<ReturnType<typeof buildAssignmentPublishDraftDefaults>>,
  }),
  {
    activityId: 'activity-1',
    collectStudentName: false,
    expiresAtLocal: '',
    instructions: 'Chapter 1 review',
    maxAttempts: '3',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 homework',
  }
);
const assignmentPublishDialogViewModel = buildAssignmentPublishDialogViewModel({
  defaults: buildAssignmentPublishDraftDefaults({
    activityId: 'activity-1',
    title: 'Food groups',
  }),
  now: new Date('2026-01-01T00:00:00.000Z'),
  values: {
    collectStudentName: false,
    expiresAtLocal: '2026-01-10T09:30',
    instructions: '  Finish before class.  ',
    maxAttempts: '３',
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitMinutes: '１５',
    title: 'Week 1 review',
  },
});
assert.deepEqual(
  {
    dialogState: assignmentPublishDialogViewModel.dialogState,
    draft: assignmentPublishDialogViewModel.draft,
    preview: assignmentPublishDialogViewModel.preview,
    toggleViews: assignmentPublishDialogViewModel.toggleViews,
    validation: assignmentPublishDialogViewModel.validation,
  },
  {
    dialogState: {
      errorMessage: undefined,
      publishDisabled: false,
    },
    draft: {
      activityId: 'activity-1',
      collectStudentName: false,
      expiresAtLocal: '2026-01-10T09:30',
      instructions: '  Finish before class.  ',
      maxAttempts: '３',
      showCorrectAnswers: false,
      shuffleItems: false,
      timeLimitMinutes: '１５',
      title: 'Week 1 review',
    },
    preview: {
      expiresAt: new Date('2026-01-10T09:30'),
      settings: {
        collectStudentName: false,
        instructions: 'Finish before class.',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: false,
        timeLimitSeconds: 900,
      },
    },
    toggleViews: [
      {
        checked: false,
        description: 'Ask learners to type their name before submitting.',
        key: 'collectStudentName',
        label: 'Collect student name',
      },
      {
        checked: false,
        description: 'Reveal correct answers after an attempt is submitted.',
        key: 'showCorrectAnswers',
        label: 'Show correct answers',
      },
      {
        checked: false,
        description: 'Prepare this assignment for randomized item order.',
        key: 'shuffleItems',
        label: 'Shuffle items',
      },
    ],
    validation: { ok: true },
  }
);
assert.deepEqual(
  buildAssignmentPublishDialogViewModel({
    defaults: buildAssignmentPublishDraftDefaults({
      activityId: 'activity-1',
      title: 'Food groups',
    }),
    isPublishing: true,
    now: new Date('2026-01-01T00:00:00.000Z'),
    values: {
      title: '  ',
    },
  }).dialogState,
  {
    errorMessage: 'Add an assignment title before publishing.',
    publishDisabled: true,
  }
);
assert.deepEqual(
  buildAssignmentPublishPreviewFromDraft({
    activityId: 'activity-1',
    collectStudentName: false,
    expiresAtLocal: '2026-01-10T09:30',
    instructions: ' Ｆｉｎｉｓｈ\tbefore   class. ',
    maxAttempts: ' ３ ',
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitMinutes: ' １ ５ ',
    title: ' Ｗｅｅｋ   １ review ',
  }),
  {
    expiresAt: new Date('2026-01-10T09:30'),
    settings: {
      collectStudentName: false,
      instructions: 'Finish before class.',
      maxAttempts: 3,
      showCorrectAnswers: false,
      shuffleItems: false,
      timeLimitSeconds: 900,
    },
  }
);
assert.deepEqual(
  buildAssignmentPublishPreviewFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: 'not-a-date',
    instructions: '  ',
    maxAttempts: 'abc',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '1.5',
    title: 'Week 1 review',
  }),
  {
    expiresAt: null,
    settings: {
      collectStudentName: true,
      instructions: undefined,
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleItems: true,
      timeLimitSeconds: undefined,
    },
  }
);
assert.deepEqual(
  buildAssignmentPublishPreviewFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '0',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '181',
    title: 'Week 1 review',
  }),
  {
    expiresAt: null,
    settings: {
      collectStudentName: true,
      instructions: undefined,
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleItems: true,
      timeLimitSeconds: undefined,
    },
  }
);
assert.deepEqual(
  buildAssignmentPublishPreviewFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '11',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '180',
    title: 'Week 1 review',
  }).settings,
  {
    collectStudentName: true,
    instructions: undefined,
    maxAttempts: 2,
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitSeconds: 10_800,
  }
);
assert.deepEqual(
  buildAssignmentPublishPreviewFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '   ',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Open practice',
  }).settings,
  {
    collectStudentName: true,
    instructions: undefined,
    maxAttempts: null,
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitSeconds: undefined,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  { ok: true }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Open practice',
  }),
  { ok: true }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'AB',
  }),
  {
    message: 'Assignment title must be at least 3 characters.',
    ok: false,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'A'.repeat(ASSIGNMENT_PUBLISH_FIELD_LIMITS.titleMaxLength + 1),
  }),
  {
    message: 'Assignment title must be 120 characters or fewer.',
    ok: false,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: 'A'.repeat(
      ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength + 1
    ),
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Instructions must be 500 characters or fewer.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishDialogState({
    validation: { ok: true },
  }),
  {
    errorMessage: undefined,
    publishDisabled: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishDialogState({
    isPublishing: true,
    validation: { ok: true },
  }),
  {
    errorMessage: undefined,
    publishDisabled: true,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '0',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Max attempts must be a whole number from 1 to 10.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishDialogState({
    validation: {
      message: 'Max attempts must be a whole number from 1 to 10.',
      ok: false,
    },
  }),
  {
    errorMessage: 'Max attempts must be a whole number from 1 to 10.',
    publishDisabled: true,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '181',
    title: 'Week 1 review',
  }),
  {
    message: 'Time limit must be a whole number from 1 to 180 minutes.',
    ok: false,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: 'not-a-date',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Choose a valid close time.',
    ok: false,
  }
);
assert.deepEqual(
  validateAssignmentPublishDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '2025-12-31T23:59',
    instructions: '',
    maxAttempts: '2',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Close time must be in the future.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: false,
    expiresAtLocal: '2026-01-10T09:30',
    instructions: ' Ｆｉｎｉｓｈ\tbefore   class. ',
    maxAttempts: ' ３ ',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitMinutes: ' １ ５ ',
    title: '  Ｗｅｅｋ   １ review  ',
  }),
  {
    input: {
      activityId: 'activity-1',
      expiresAt: new Date('2026-01-10T09:30').toISOString(),
      settings: {
        collectStudentName: false,
        instructions: 'Finish before class.',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: false,
        timeLimitSeconds: 900,
      },
      title: 'Week 1 review',
    },
    ok: true,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Open practice',
  }),
  {
    input: {
      activityId: 'activity-1',
      expiresAt: undefined,
      settings: {
        collectStudentName: true,
        instructions: undefined,
        maxAttempts: null,
        showCorrectAnswers: true,
        shuffleItems: true,
        timeLimitSeconds: undefined,
      },
      title: 'Open practice',
    },
    ok: true,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '   ',
    maxAttempts: '2',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Untimed homework',
  }),
  {
    input: {
      activityId: 'activity-1',
      expiresAt: undefined,
      settings: {
        collectStudentName: true,
        instructions: undefined,
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: true,
        timeLimitSeconds: undefined,
      },
      title: 'Untimed homework',
    },
    ok: true,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: '  ',
  }),
  {
    message: 'Add an assignment title before publishing.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '11',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Max attempts must be a whole number from 1 to 10.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '1.5',
    title: 'Week 1 review',
  }),
  {
    message: 'Time limit must be a whole number from 1 to 180 minutes.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '2025-12-31T23:59',
    instructions: '',
    maxAttempts: '2',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Close time must be in the future.',
    ok: false,
  }
);
const publishedAssignments = [
  {
    assignment: {
      id: 'assignment-1',
      shareSlug: 'share-1',
      title: 'Week 1',
    },
  },
  {
    assignment: {
      id: 'assignment-2',
      shareSlug: ' share-２ ',
      title: ' Ｗｅｅｋ\u00A0　2 ',
    },
  },
];
assert.deepEqual(
  findPublishedAssignmentInList({
    items: publishedAssignments,
    shareSlug: ' share-2 ',
  }),
  publishedAssignments[1]?.assignment
);
assert.equal(
  findPublishedAssignmentInList({
    items: publishedAssignments,
    shareSlug: 'missing',
  }),
  undefined
);
const publishedAssignmentFromLookup = {
  id: 'assignment-3',
  shareSlug: ' share-３ ',
  title: 'Week 3',
};
assert.deepEqual(
  resolvePublishedAssignmentPanelAssignment({
    assignment: publishedAssignmentFromLookup,
    items: publishedAssignments,
    shareSlug: ' share-3 ',
  }),
  publishedAssignmentFromLookup
);
assert.deepEqual(
  resolvePublishedAssignmentPanelAssignment({
    assignment: publishedAssignmentFromLookup,
    items: publishedAssignments,
    shareSlug: ' share-2 ',
  }),
  publishedAssignments[1]?.assignment
);
assert.deepEqual(
  buildPublishedAssignmentPanelContext({
    assignment: publishedAssignments[1]?.assignment,
    isLoading: false,
    shareSlug: ' share-2 ',
  }),
  {
    assignment: publishedAssignments[1]?.assignment,
    body: 'Copy the student link for your class, open the student preview, or jump into the results page before submissions arrive.',
    printAction: {
      assignmentId: 'assignment-2',
    },
    sharePath: '/play/share-2',
    showDismissAction: true,
    showMissingHint: false,
    showResultsAction: true,
    showShareActions: true,
    status: 'found',
    title: 'Week 2',
  }
);
assert.deepEqual(
  buildPublishedAssignmentPanelContext({
    assignment: undefined,
    isLoading: true,
    shareSlug: 'share-2',
  }),
  {
    body: 'Loading the newly published assignment link and classroom actions.',
    printAction: undefined,
    sharePath: '/play/share-2',
    showDismissAction: true,
    showMissingHint: false,
    showResultsAction: false,
    showShareActions: true,
    status: 'loading',
    title: 'Student share link is being prepared.',
  }
);
assert.deepEqual(
  buildPublishedAssignmentPanelContext({
    assignment: undefined,
    isLoading: false,
    shareSlug: 'missing',
  }),
  {
    body: 'Copy the student link for your class or open the student preview. Results will appear once the assignment is visible in this list.',
    printAction: undefined,
    sharePath: '/play/missing',
    showDismissAction: true,
    showMissingHint: true,
    showResultsAction: false,
    showShareActions: true,
    status: 'missing',
    title: 'Student share link is ready.',
  }
);
assert.equal(
  buildPublishedAssignmentPanelContext({
    assignment: undefined,
    isLoading: true,
    shareSlug: 'share two',
  }).sharePath,
  '/play/share%20two'
);
assert.deepEqual(buildAssignmentDeliverySummary({ expiresAt: null }), [
  { id: 'attempts', label: 'Attempts', value: '2 max' },
  { id: 'timer', label: 'Timer', value: 'No timer' },
  { id: 'closes', label: 'Closes', value: 'No close time' },
  { id: 'identity', label: 'Student identity', value: 'Names' },
  { id: 'answerReveal', label: 'Answer reveal', value: 'After submit' },
  { id: 'itemOrder', label: 'Item order', value: 'Shuffled' },
]);
assert.deepEqual(
  buildAssignmentDeliverySummary({
    expiresAt: null,
    maxAttempts: null,
  }).map((item) => [item.id, item.value]),
  [
    ['attempts', 'Open'],
    ['timer', 'No timer'],
    ['closes', 'No close time'],
    ['identity', 'Names'],
    ['answerReveal', 'After submit'],
    ['itemOrder', 'Shuffled'],
  ]
);
assert.deepEqual(
  buildAssignmentDeliverySummary({
    collectStudentName: false,
    expiresAt: 'not-a-date',
    maxAttempts: 3,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 90,
  }).map((item) => [item.id, item.value]),
  [
    ['attempts', '3 max'],
    ['timer', '2 min'],
    ['closes', 'No close time'],
    ['identity', 'Anonymous'],
    ['answerReveal', 'Hidden'],
    ['itemOrder', 'Fixed order'],
  ]
);
assert.deepEqual(
  buildAssignmentDeliverySummary({
    expiresAt: null,
    maxAttempts: 0,
    timeLimitSeconds: 0,
  }).map((item) => [item.id, item.value]),
  [
    ['attempts', 'Open'],
    ['timer', 'No timer'],
    ['closes', 'No close time'],
    ['identity', 'Names'],
    ['answerReveal', 'After submit'],
    ['itemOrder', 'Shuffled'],
  ]
);
assert.deepEqual(
  buildAssignmentDeliverySummary({
    expiresAt: null,
    maxAttempts: -1,
    timeLimitSeconds: -60,
  }).map((item) => [item.id, item.value]),
  [
    ['attempts', 'Open'],
    ['timer', 'No timer'],
    ['closes', 'No close time'],
    ['identity', 'Names'],
    ['answerReveal', 'After submit'],
    ['itemOrder', 'Shuffled'],
  ]
);
assert.deepEqual(
  buildAssignmentDeliverySummary({
    expiresAt: null,
    maxAttempts: 1.5,
    timeLimitSeconds: 61,
  }).map((item) => [item.id, item.value]),
  [
    ['attempts', 'Open'],
    ['timer', '2 min'],
    ['closes', 'No close time'],
    ['identity', 'Names'],
    ['answerReveal', 'After submit'],
    ['itemOrder', 'Shuffled'],
  ]
);
assert.equal(
  formatAssignmentDeliveryInstructions(' Ｒｅｖｉｅｗ\u00A0　carefully. '),
  'Review carefully.'
);
assert.equal(formatAssignmentDeliveryInstructions('   '), undefined);
const assignmentSettingsSummaryView = buildAssignmentSettingsSummaryView({
  expiresAt: null,
  settings: {
    collectStudentName: false,
    instructions: 'Finish before class.',
    maxAttempts: 3,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 90,
  },
});
assert.deepEqual(assignmentSettingsSummaryView.instructions, {
  isEmpty: false,
  label: 'Student instructions',
  value: 'Finish before class.',
});
assert.equal(assignmentSettingsSummaryView.settings.collectStudentName, false);
assert.deepEqual(
  assignmentSettingsSummaryView.items.map((item) => [item.id, item.value]),
  [
    ['attempts', '3 max'],
    ['timer', '2 min'],
    ['closes', 'No close time'],
    ['identity', 'Anonymous'],
    ['answerReveal', 'Hidden'],
    ['itemOrder', 'Fixed order'],
  ]
);
const partialAssignmentSettingsSummaryView = buildAssignmentSettingsSummaryView(
  {
    expiresAt: null,
    settings: {
      collectStudentName: false,
      instructions: '  Review before Friday.  ',
      maxAttempts: 99,
      timeLimitSeconds: 30,
    },
  }
);
assert.deepEqual(partialAssignmentSettingsSummaryView.settings, {
  collectStudentName: false,
  instructions: 'Review before Friday.',
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
  timeLimitSeconds: undefined,
});
assert.deepEqual(partialAssignmentSettingsSummaryView.instructions, {
  isEmpty: false,
  label: 'Student instructions',
  value: 'Review before Friday.',
});
assert.deepEqual(
  partialAssignmentSettingsSummaryView.items.map((item) => [
    item.id,
    item.value,
  ]),
  [
    ['attempts', '2 max'],
    ['timer', 'No timer'],
    ['closes', 'No close time'],
    ['identity', 'Anonymous'],
    ['answerReveal', 'After submit'],
    ['itemOrder', 'Shuffled'],
  ]
);
assert.deepEqual(
  buildAssignmentSettingsSummaryView({
    expiresAt: null,
    settings: {},
  }).instructions,
  {
    isEmpty: true,
    label: 'Student instructions',
    value: 'No student instructions',
  }
);
const legacyAssignmentSettingsSummaryView = buildAssignmentSettingsSummaryView({
  collectStudentName: false,
  expiresAt: null,
  instructions: 'Legacy field instructions.',
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
  timeLimitSeconds: undefined,
});
assert.deepEqual(legacyAssignmentSettingsSummaryView.settings, {
  collectStudentName: false,
  instructions: 'Legacy field instructions.',
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
  timeLimitSeconds: undefined,
});
assert.deepEqual(legacyAssignmentSettingsSummaryView.instructions, {
  isEmpty: false,
  label: 'Student instructions',
  value: 'Legacy field instructions.',
});
assert.equal(
  formatAssignmentDeliveryPolicyText({
    expiresAt: null,
    settings: {
      collectStudentName: false,
      instructions: '  Review quietly.  ',
      maxAttempts: 3,
      showCorrectAnswers: false,
      shuffleItems: false,
      timeLimitSeconds: 120,
    },
  }),
  [
    'Student instructions: Review quietly.',
    'Attempts: 3 max',
    'Timer: 2 min',
    'Closes: No close time',
    'Student identity: Anonymous',
    'Answer reveal: Hidden',
    'Item order: Fixed order',
  ].join('; ')
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    formatAssignmentDeliveryPolicyText({
      expiresAt: null,
      settings: {
        collectStudentName: false,
        instructions: '  安静复习。  ',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
    }),
    [
      '学生说明：安静复习。',
      '作答次数：最多 3 次',
      '计时：2 分钟',
      '关闭时间：不设关闭时间',
      '学生身份：匿名',
      '答案显示：隐藏',
      '题目顺序：固定顺序',
    ].join('；')
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(formatAssignmentItemCount(1), '1 item');
assert.equal(formatAssignmentItemCount(3), '3 items');
assert.equal(formatAssignmentItemCount(3.9), '3 items');
assert.equal(formatAssignmentItemCount(-1), '0 items');
assert.equal(formatAssignmentItemCount(Number.NaN), '0 items');
assert.deepEqual(
  buildPublicAssignmentRuleSummary({
    collectStudentName: false,
    expiresAt: null,
    itemCount: 1,
    maxAttempts: 2,
    showCorrectAnswers: false,
    timeLimitSeconds: 60,
  }),
  [
    {
      ariaLabel:
        'Items: 1 item. These are the playable items in this assignment.',
      description: 'These are the playable items in this assignment.',
      id: 'items',
      label: 'Items',
      value: '1 item',
    },
    {
      ariaLabel:
        'Attempts: 2 max. Your submitted attempts count toward this limit.',
      description: 'Your submitted attempts count toward this limit.',
      id: 'attempts',
      label: 'Attempts',
      value: '2 max',
    },
    {
      ariaLabel: 'Timer: 1 min. The timer starts when the activity is ready.',
      description: 'The timer starts when the activity is ready.',
      id: 'timer',
      label: 'Timer',
      value: '1 min',
    },
    {
      ariaLabel:
        'Closes: No close time. The link stops accepting work after this time.',
      description: 'The link stops accepting work after this time.',
      id: 'closes',
      label: 'Closes',
      value: 'No close time',
    },
    {
      ariaLabel:
        'Student identity: Anonymous. This setting controls how your work is identified.',
      description: 'This setting controls how your work is identified.',
      id: 'identity',
      label: 'Student identity',
      value: 'Anonymous',
    },
    {
      ariaLabel:
        'Review: Hidden. This controls whether answers appear after submission.',
      description: 'This controls whether answers appear after submission.',
      id: 'answerReveal',
      label: 'Review',
      value: 'Hidden',
    },
  ]
);
assert.equal(
  buildPublicAssignmentRuleSummary({
    expiresAt: null,
    itemCount: Number.POSITIVE_INFINITY,
  })[0]?.value,
  '0 items'
);
assert.deepEqual(
  buildPublicAssignmentRuleSummaryFromSettings({
    expiresAt: null,
    itemCount: 2,
    settings: {
      collectStudentName: true,
      maxAttempts: 3,
      showCorrectAnswers: true,
      shuffleItems: false,
      timeLimitSeconds: 120,
    },
  }),
  [
    {
      ariaLabel:
        'Items: 2 items. These are the playable items in this assignment.',
      description: 'These are the playable items in this assignment.',
      id: 'items',
      label: 'Items',
      value: '2 items',
    },
    {
      ariaLabel:
        'Attempts: 3 max. Your submitted attempts count toward this limit.',
      description: 'Your submitted attempts count toward this limit.',
      id: 'attempts',
      label: 'Attempts',
      value: '3 max',
    },
    {
      ariaLabel: 'Timer: 2 min. The timer starts when the activity is ready.',
      description: 'The timer starts when the activity is ready.',
      id: 'timer',
      label: 'Timer',
      value: '2 min',
    },
    {
      ariaLabel:
        'Closes: No close time. The link stops accepting work after this time.',
      description: 'The link stops accepting work after this time.',
      id: 'closes',
      label: 'Closes',
      value: 'No close time',
    },
    {
      ariaLabel:
        'Student identity: Names. This setting controls how your work is identified.',
      description: 'This setting controls how your work is identified.',
      id: 'identity',
      label: 'Student identity',
      value: 'Names',
    },
    {
      ariaLabel:
        'Review: After submit. This controls whether answers appear after submission.',
      description: 'This controls whether answers appear after submission.',
      id: 'answerReveal',
      label: 'Review',
      value: 'After submit',
    },
  ]
);
assert.deepEqual(
  buildPublicAssignmentRuleSummaryFromSettings({
    expiresAt: null,
    itemCount: 4,
    settings: {
      collectStudentName: false,
      maxAttempts: 99,
      showCorrectAnswers: false,
      timeLimitSeconds: 30,
    },
  }),
  [
    {
      ariaLabel:
        'Items: 4 items. These are the playable items in this assignment.',
      description: 'These are the playable items in this assignment.',
      id: 'items',
      label: 'Items',
      value: '4 items',
    },
    {
      ariaLabel:
        'Attempts: 2 max. Your submitted attempts count toward this limit.',
      description: 'Your submitted attempts count toward this limit.',
      id: 'attempts',
      label: 'Attempts',
      value: '2 max',
    },
    {
      ariaLabel:
        'Timer: No timer. The timer starts when the activity is ready.',
      description: 'The timer starts when the activity is ready.',
      id: 'timer',
      label: 'Timer',
      value: 'No timer',
    },
    {
      ariaLabel:
        'Closes: No close time. The link stops accepting work after this time.',
      description: 'The link stops accepting work after this time.',
      id: 'closes',
      label: 'Closes',
      value: 'No close time',
    },
    {
      ariaLabel:
        'Student identity: Anonymous. This setting controls how your work is identified.',
      description: 'This setting controls how your work is identified.',
      id: 'identity',
      label: 'Student identity',
      value: 'Anonymous',
    },
    {
      ariaLabel:
        'Review: Hidden. This controls whether answers appear after submission.',
      description: 'This controls whether answers appear after submission.',
      id: 'answerReveal',
      label: 'Review',
      value: 'Hidden',
    },
  ]
);
overwriteGetLocale(() => 'zh');
try {
  assert.deepEqual(
    buildPublicAssignmentRuleSummary({
      collectStudentName: false,
      expiresAt: null,
      itemCount: 2,
      maxAttempts: 1,
      showCorrectAnswers: true,
      timeLimitSeconds: 120,
    }),
    [
      {
        ariaLabel: '题目：2 项。这是这份作业中的可作答项目。',
        description: '这是这份作业中的可作答项目。',
        id: 'items',
        label: '题目',
        value: '2 项',
      },
      {
        ariaLabel: '作答次数：最多 1 次。已提交的作答会计入这个次数限制。',
        description: '已提交的作答会计入这个次数限制。',
        id: 'attempts',
        label: '作答次数',
        value: '最多 1 次',
      },
      {
        ariaLabel: '计时：2 分钟。活动准备好后，计时才会开始。',
        description: '活动准备好后，计时才会开始。',
        id: 'timer',
        label: '计时',
        value: '2 分钟',
      },
      {
        ariaLabel:
          '关闭时间：不设关闭时间。超过这个时间后，链接将停止接收作答。',
        description: '超过这个时间后，链接将停止接收作答。',
        id: 'closes',
        label: '关闭时间',
        value: '不设关闭时间',
      },
      {
        ariaLabel: '学生身份：匿名。这个设置决定你的作答如何被识别。',
        description: '这个设置决定你的作答如何被识别。',
        id: 'identity',
        label: '学生身份',
        value: '匿名',
      },
      {
        ariaLabel: '回顾：提交后显示。这个设置决定提交后是否显示答案。',
        description: '这个设置决定提交后是否显示答案。',
        id: 'answerReveal',
        label: '回顾',
        value: '提交后显示',
      },
    ]
  );
} finally {
  overwriteGetLocale(() => 'en');
}
const studentRunnerHeaderView = buildStudentRunnerHeaderView({
  assignment: {
    expiresAt: null,
    settings: {
      collectStudentName: true,
      instructions: '  Read each prompt carefully.  ',
      maxAttempts: 3,
      showCorrectAnswers: true,
      shuffleItems: false,
      timeLimitSeconds: 120,
    },
    title: ' Ｐｕｂｌｉｃ\u00A0　assignment ',
  },
  itemCount: 2,
});
assert.deepEqual(studentRunnerHeaderView, {
  description:
    "This public assignment loads from the teacher share link, collects answers, and scores against the teacher's frozen assignment snapshot.",
  instructions: {
    label: 'Student instructions',
    value: 'Read each prompt carefully.',
  },
  ruleItems: buildPublicAssignmentRuleSummaryFromSettings({
    expiresAt: null,
    itemCount: 2,
    settings: {
      collectStudentName: true,
      instructions: '  Read each prompt carefully.  ',
      maxAttempts: 3,
      showCorrectAnswers: true,
      shuffleItems: false,
      timeLimitSeconds: 120,
    },
  }),
  teacherActionLabel: 'Teacher view',
  title: 'Public assignment',
});
assert.equal(
  studentRunnerHeaderView.ruleItems[0]?.description,
  'These are the playable items in this assignment.'
);
assert.deepEqual(
  buildStudentRunnerHeaderView({
    assignment: {
      expiresAt: null,
      settings: {
        collectStudentName: false,
        instructions: '  Ｒｅｖｉｅｗ\u00A0　carefully.  ',
        showCorrectAnswers: false,
        shuffleItems: true,
      },
      title: 'Normalized instructions',
    },
    itemCount: 1,
  }).instructions,
  {
    label: 'Student instructions',
    value: 'Review carefully.',
  }
);
assert.equal(
  buildStudentRunnerHeaderView({
    assignment: {
      expiresAt: null,
      settings: {
        collectStudentName: false,
        instructions: '   ',
        showCorrectAnswers: false,
        shuffleItems: true,
      },
      title: 'Anonymous assignment',
    },
    itemCount: 1,
  }).instructions,
  undefined
);
const publicPayloadActivityContent = buildActivityContent({
  description: 'Original activity payload source',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer the current activity content.',
  pairsText: '',
  questionsText: 'Current prompt? | Current answer',
  sourceSummary: 'Current activity content',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Current activity',
  visibility: 'draft',
  vocabularyText: '',
  sourceMaterials: [listeningMaterialReference],
});
const publicPayloadSnapshotContent = buildActivityContent({
  description: 'Frozen assignment payload source',
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer the frozen snapshot content.',
  pairsText: '',
  questionsText:
    'Frozen prompt? | Frozen answer / Frozen accepted | Frozen answer, Other | Frozen explanation',
  sourceSummary: 'Frozen snapshot content',
  subject: 'History',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Frozen activity',
  visibility: 'draft',
  vocabularyText: 'Frozen answer, Other',
  sourceMaterials: [
    {
      contentType: 'application/pdf',
      fileId: 'file-snapshot-worksheet',
      kind: 'worksheet-document',
      originalName: 'Frozen worksheet.pdf',
      size: 512,
    },
  ],
});
const assignmentSnapshotCreatedAt = new Date('2026-01-15T12:30:00.000Z');
const assignmentSnapshotSourceActivity = {
  contentJson: structuredClone(publicPayloadSnapshotContent),
  description: 'Snapshot source description',
  templateType: 'quiz' as ActivityTemplateType,
  title: 'Snapshot source title',
};
const assignmentSnapshotInsert = buildAssignmentSnapshotInsert({
  assignmentId: 'assignment-snapshot-1',
  createdAt: assignmentSnapshotCreatedAt,
  sourceActivity: assignmentSnapshotSourceActivity,
});
const assignmentSnapshotSource = readFileSync(
  'src/assignments/snapshot.ts',
  'utf8'
);
const assignmentPersistenceSource = readFileSync(
  'src/assignments/persistence.ts',
  'utf8'
);
const assignmentAttemptPersistenceSource = readFileSync(
  'src/assignments/attempt-persistence.ts',
  'utf8'
);
assert.match(
  assignmentSnapshotSource,
  /resolveAssignmentSnapshotSource[\s\S]*normalizeOptionalRuntimeDisplayText\([\s\S]*activityDescription[\s\S]*normalizeRuntimeDisplayText\(activityTitle\)/,
  'Assignment snapshot source resolution should normalize activity metadata for all display/export consumers.'
);
const publishedAssignmentInsert = buildPublishedAssignmentInsert({
  expiresAt: new Date('2026-01-20T09:00:00.000Z'),
  id: 'assignment-published-1',
  now: assignmentSnapshotCreatedAt,
  settings: {
    collectStudentName: false,
    instructions: 'Finish before class.',
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 600,
  },
  shareSlug: 'share-published-1',
  sourceActivity: {
    id: 'activity-source-1',
  },
  title: 'Published homework link',
  userId: 'teacher-1',
});
assert.deepEqual(publishedAssignmentInsert, {
  activityId: 'activity-source-1',
  createdAt: assignmentSnapshotCreatedAt,
  expiresAt: new Date('2026-01-20T09:00:00.000Z'),
  id: 'assignment-published-1',
  ownerId: 'teacher-1',
  settingsJson: {
    collectStudentName: false,
    instructions: 'Finish before class.',
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 600,
  },
  shareSlug: 'share-published-1',
  status: 'published',
  title: 'Published homework link',
  updatedAt: assignmentSnapshotCreatedAt,
});
assert.deepEqual(
  buildPublishedAssignmentSnapshotInsert({
    assignmentId: 'assignment-snapshot-1',
    createdAt: assignmentSnapshotCreatedAt,
    sourceActivity: assignmentSnapshotSourceActivity,
  }),
  assignmentSnapshotInsert
);
assert.deepEqual(
  buildAssignmentStatusUpdateSet({
    nextStatus: 'closed',
    updatedAt: assignmentSnapshotCreatedAt,
  }),
  {
    status: 'closed',
    updatedAt: assignmentSnapshotCreatedAt,
  }
);
const scoredAttemptEvaluation = {
  answers: [
    {
      answer: 'Frozen answer',
      correct: true,
      itemId: 'item-1',
    },
    {
      answer: 'Other answer',
      correct: false,
      itemId: 'item-2',
    },
  ],
  result: {
    accuracy: 50,
    completedItemCount: 2,
    correctItemCount: 1,
    durationSeconds: 75,
    earnedPoints: 1,
    totalPoints: 2,
  },
};
assert.deepEqual(
  buildScoredAttemptInsert({
    assignmentId: 'assignment-published-1',
    completedAt: assignmentSnapshotCreatedAt,
    evaluation: scoredAttemptEvaluation,
    id: 'attempt-scored-1',
    identity: {
      anonymousToken: null,
      studentName: 'Ada Lovelace',
    },
    startedAt: new Date('2026-01-15T12:28:45.000Z'),
    templateType: 'quiz',
  }),
  {
    anonymousToken: null,
    answersJson: {
      answers: scoredAttemptEvaluation.answers,
      templateType: 'quiz',
    },
    assignmentId: 'assignment-published-1',
    completedAt: assignmentSnapshotCreatedAt,
    id: 'attempt-scored-1',
    maxScore: 2,
    resultJson: scoredAttemptEvaluation.result,
    score: 1,
    startedAt: new Date('2026-01-15T12:28:45.000Z'),
    studentName: 'Ada Lovelace',
  }
);
assert.match(
  assignmentPersistenceSource,
  /buildPublishedAssignmentInsert[\s\S]*activityId: sourceActivity\.id[\s\S]*settingsJson: settings[\s\S]*status: 'published'[\s\S]*buildPublishedAssignmentSnapshotInsert[\s\S]*buildAssignmentSnapshotInsert[\s\S]*buildAssignmentStatusUpdateSet[\s\S]*status: nextStatus[\s\S]*updatedAt/,
  'Assignment persistence should own published assignment, snapshot insert, and status update payload shapes.'
);
assert.match(
  assignmentAttemptPersistenceSource,
  /buildScoredAttemptInsert[\s\S]*answersJson: \{[\s\S]*answers: evaluation\.answers[\s\S]*templateType[\s\S]*maxScore: evaluation\.result\.totalPoints[\s\S]*resultJson: evaluation\.result[\s\S]*score: evaluation\.result\.earnedPoints/,
  'Attempt persistence should own scored attempt insert payload shapes.'
);
assignmentSnapshotSourceActivity.description = 'Edited after publish';
assignmentSnapshotSourceActivity.templateType = 'match-up';
assignmentSnapshotSourceActivity.title = 'Edited source title';
assignmentSnapshotSourceActivity.contentJson.questions[0]!.prompt =
  'Edited prompt after publish';
assignmentSnapshotSourceActivity.contentJson.sourceMaterials[0]!.originalName =
  'Edited worksheet after publish.pdf';
assert.deepEqual(assignmentSnapshotInsert, {
  activityDescription: 'Snapshot source description',
  activityTitle: 'Snapshot source title',
  assignmentId: 'assignment-snapshot-1',
  contentJson: {
    ...publicPayloadSnapshotContent,
    questions: [
      {
        ...publicPayloadSnapshotContent.questions[0]!,
        prompt: 'Frozen prompt?',
      },
    ],
    sourceMaterials: [
      {
        ...publicPayloadSnapshotContent.sourceMaterials[0]!,
        originalName: 'Frozen worksheet.pdf',
      },
    ],
  },
  createdAt: assignmentSnapshotCreatedAt,
  templateType: 'quiz',
});
assert.deepEqual(
  resolveAssignmentSnapshotSource({
    activity: {
      contentJson: publicPayloadActivityContent,
      description: 'Current activity description',
      templateType: 'match-up',
      title: 'Current activity title',
    },
    snapshot: {
      activityDescription: ' Ｆｒｏｚｅｎ\u00A0　activity   description ',
      activityTitle: ' Ｆｒｏｚｅｎ\u00A0　activity   title ',
      contentJson: publicPayloadSnapshotContent,
      templateType: 'quiz',
    },
  }),
  {
    activityDescription: 'Frozen activity description',
    activityTitle: 'Frozen activity title',
    contentJson: publicPayloadSnapshotContent,
    hasSnapshot: true,
    templateType: 'quiz',
  }
);
assert.deepEqual(
  resolveAssignmentSnapshotSource({
    activity: {
      contentJson: publicPayloadActivityContent,
      description: ' Ｃｕｒｒｅｎｔ\u00A0　activity   description ',
      templateType: 'match-up',
      title: ' Ｃｕｒｒｅｎｔ\u00A0　activity   title ',
    },
    snapshot: null,
  }),
  {
    activityDescription: 'Current activity description',
    activityTitle: 'Current activity title',
    contentJson: publicPayloadActivityContent,
    hasSnapshot: false,
    templateType: 'match-up',
  }
);
const resolvedAssignmentRuntimeSource = resolveAssignmentRuntimeSource({
  activity: {
    contentJson: {
      ...publicPayloadActivityContent,
      pairs: [
        {
          id: 'current-pair',
          left: 'Current left',
          right: 'Current right',
        },
      ],
    },
    description: 'Current activity description',
    templateType: 'match-up',
    title: 'Current activity title',
  },
  snapshot: {
    activityDescription: ' Ｆｒｏｚｅｎ\u00A0　activity   description ',
    activityTitle: ' Ｆｒｏｚｅｎ\u00A0　activity   title ',
    contentJson: publicPayloadSnapshotContent,
    templateType: 'quiz',
  },
});
assert.equal(resolvedAssignmentRuntimeSource.hasSnapshot, true);
assert.equal(resolvedAssignmentRuntimeSource.templateType, 'quiz');
assert.equal(
  resolvedAssignmentRuntimeSource.contentJson.learningGoal,
  'Students answer the frozen snapshot content.'
);
assert.deepEqual(
  resolvedAssignmentRuntimeSource.runtimeItems.map((item) => [
    item.id,
    item.kind,
    item.prompt,
    item.answer,
  ]),
  [
    [
      'q-frozen-prompt',
      'question',
      'Frozen prompt?',
      'Frozen answer / Frozen accepted',
    ],
  ]
);
const publicAssignmentPayloadSource = {
  activity: {
    contentJson: publicPayloadActivityContent,
    description: 'Current activity description',
    id: 'activity-public',
    templateType: 'quiz',
    title: 'Current activity title',
    visibility: 'draft',
  },
  assignment: {
    expiresAt: null,
    id: 'assignment-public',
    settingsJson: { collectStudentName: false },
    shareSlug: ' share-public ',
    status: 'published',
    title: ' Ｐｕｂｌｉｃ\u00A0　assignment ',
  },
  snapshot: {
    activityDescription: 'Frozen activity description',
    activityTitle: 'Frozen activity title',
    contentJson: publicPayloadSnapshotContent,
    templateType: 'quiz',
  },
} satisfies Parameters<typeof buildPublicAssignmentPayload>[0];
const publicAssignmentPayload = buildPublicAssignmentPayload(
  publicAssignmentPayloadSource
);
const publicAssignmentLookupAvailable = buildPublicAssignmentLookupResult(
  publicAssignmentPayloadSource
);
assert.deepEqual(PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES, {
  max: 20,
  min: 5,
  perItem: 2,
});
assert.equal(normalizeRuntimeDisplayText('  Ｎｅｗ   York  '), 'New York');
assert.equal(hasRuntimeDisplayText('  Ｎｅｗ   York  '), true);
assert.equal(hasRuntimeDisplayText('\u00A0　\t'), false);
assert.equal(normalizeOptionalRuntimeDisplayText('   '), undefined);
assert.equal(
  formatAssignmentDisplayTitle(' Ｗｅｅｋ\u00A0　1   results '),
  'Week 1 results'
);
assert.equal(
  formatAssignmentDisplayText(' Ｓｔａｒｔｅｒ\u00A0　activity   description '),
  'Starter activity description'
);
assert.deepEqual(
  getRuntimeDisplayAcceptedAnswers(
    ' Paris / Ｐａｒｉｓ / Paris\u00A0　France '
  ),
  ['Paris', 'Paris France']
);
assert.equal(normalizeRuntimeDisplayCount(Number.NaN), 0);
assert.equal(normalizeRuntimeDisplayCount(-2.4), 0);
assert.equal(normalizeRuntimeDisplayCount(3.9), 3);
assert.equal(normalizeRuntimeDisplayCount(12, { max: 4, min: 1 }), 4);
assert.deepEqual(
  normalizeRuntimeChoiceList([
    ' Paris ',
    '',
    'ＰＡＲＩＳ',
    'New   York',
    'new york',
    'Rome',
  ]),
  ['Paris', 'New York', 'Rome']
);
assert.equal(getRuntimeChoiceDisplayKey(' Ｐａｒｉｓ '), 'paris');
assert.equal(publicAssignmentPayload.activity.title, 'Frozen activity title');
assert.equal(publicAssignmentPayload.assignment.title, 'Public assignment');
assert.equal(
  publicAssignmentPayload.activity.description,
  'Frozen activity description'
);
assert.equal(publicAssignmentPayload.summary.subject, 'History');
assert.equal(publicAssignmentPayload.summary.gradeBand, 'Grade 4');
assert.equal(publicAssignmentPayload.summary.itemCount, 1);
assert.equal(publicAssignmentPayload.summary.estimatedMinutes, 5);
assert.equal(
  buildPublicAssignmentPayload({
    ...publicAssignmentPayloadSource,
    snapshot: {
      ...publicAssignmentPayloadSource.snapshot,
      contentJson: {
        ...publicAssignmentPayloadSource.snapshot.contentJson,
        questions: Array.from({ length: 20 }, (_, index) => ({
          answer: `Answer ${index}`,
          id: `question-${index}`,
          prompt: `Prompt ${index}?`,
        })),
      },
    },
  }).summary.estimatedMinutes,
  PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES.max
);
assert.deepEqual(
  stripRuntimeAnswers([
    {
      answer: ' Paris / Paris, France ',
      choices: [' Paris ', 'ＰＡＲＩＳ', '', 'Rome'],
      explanation: '  France capital.  ',
      id: 'messy-q-1',
      kind: 'question',
      prompt: '  Capital   of   France?  ',
    },
    {
      answer: ' Cold ',
      choices: [' Cold ', 'cold', 'Warm'],
      explanation: '   ',
      id: 'messy-pair-1',
      kind: 'pair',
      prompt: ' Hot ',
    },
  ]),
  [
    {
      choices: ['Paris', 'Rome'],
      id: 'messy-q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
    {
      choices: ['Cold', 'Warm'],
      id: 'messy-pair-1',
      kind: 'pair',
      prompt: 'Hot',
    },
  ]
);
assert.equal('sourceMaterials' in publicAssignmentPayload.summary, false);
assert.equal(
  'sourceMaterials' in publicAssignmentPayload.runtimeItems[0]!,
  false
);
assert.equal(publicAssignmentPayload.assignment.shareSlug, 'share-public');
assert.equal(
  publicAssignmentPayload.assignment.settingsJson.collectStudentName,
  false
);
assert.equal(
  publicAssignmentPayload.assignment.settingsJson.showCorrectAnswers,
  true
);
const publicAssignmentPayloadWithPrivateSettings = buildPublicAssignmentPayload(
  {
    ...publicAssignmentPayloadSource,
    assignment: {
      ...publicAssignmentPayloadSource.assignment,
      settingsJson: {
        collectStudentName: false,
        instructions: ' Ｆｉｎｉｓｈ\u00A0　quietly. ',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: false,
        teacherOnlyNotes: 'Do not show this to students.',
        timeLimitSeconds: 120,
      } satisfies Partial<AssignmentSettings> & {
        teacherOnlyNotes: string;
      },
    },
  }
);
assert.deepEqual(
  Object.keys(
    publicAssignmentPayloadWithPrivateSettings.assignment.settingsJson
  ).sort(),
  [
    'collectStudentName',
    'instructions',
    'maxAttempts',
    'showCorrectAnswers',
    'shuffleItems',
    'timeLimitSeconds',
  ]
);
assert.deepEqual(
  publicAssignmentPayloadWithPrivateSettings.assignment.settingsJson,
  {
    collectStudentName: false,
    instructions: 'Finish quietly.',
    maxAttempts: 3,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 120,
  }
);
assert.equal(
  'teacherOnlyNotes' in
    publicAssignmentPayloadWithPrivateSettings.assignment.settingsJson,
  false
);
assert.deepEqual(publicAssignmentPayload.snapshot, {
  activityDescription: 'Frozen activity description',
  activityTitle: 'Frozen activity title',
  templateType: 'quiz',
});
assert.equal('contentJson' in publicAssignmentPayload.snapshot!, false);
assert.equal('sourceMaterials' in publicAssignmentPayload.snapshot!, false);
assert.equal(publicAssignmentPayload.runtimeItems[0]?.prompt, 'Frozen prompt?');
assert.equal('answer' in publicAssignmentPayload.runtimeItems[0]!, false);
assert.equal('explanation' in publicAssignmentPayload.runtimeItems[0]!, false);
assert.equal(
  buildOpenPublicAssignmentPayload(publicAssignmentPayloadSource)?.assignment
    .shareSlug,
  'share-public'
);
assert.deepEqual(publicAssignmentLookupAvailable, {
  payload: publicAssignmentPayload,
  status: 'available',
});
const printableSnapshotWorksheet = buildPrintableAssignmentWorksheet({
  activity: {
    description: 'Current activity description',
    templateType: 'quiz',
    title: 'Current activity title',
  },
  assignment: {
    expiresAt: null,
    settingsJson: {
      collectStudentName: false,
      instructions: ' Ｆｉｎｉｓｈ\u00A0　on   paper. ',
      maxAttempts: 3,
      showCorrectAnswers: false,
      shuffleItems: false,
      timeLimitSeconds: 120,
    },
    shareSlug: ' printable-１ ',
    title: ' Ｐｒｉｎｔａｂｌｅ\u00A0　assignment ',
  },
  runtimeItems: getRuntimeItems('quiz', publicPayloadSnapshotContent),
  snapshot: {
    activityDescription: 'Frozen activity description',
    activityTitle: 'Frozen activity title',
    templateType: 'quiz',
  },
});
assert.equal(printableSnapshotWorksheet.activityTitle, 'Frozen activity title');
assert.equal(
  printableSnapshotWorksheet.activityDescription,
  'Frozen activity description'
);
assert.equal(
  printableSnapshotWorksheet.assignmentTitle,
  'Printable assignment'
);
assert.equal(printableSnapshotWorksheet.includeAnswerKey, false);
assert.equal(printableSnapshotWorksheet.answerKey, undefined);
assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: true }), {
  answerKey: true,
});
assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: 'true' }), {
  answerKey: true,
});
assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: '1' }), {
  answerKey: true,
});
assert.deepEqual(buildPrintableAssignmentSearch({ answerKey: true }), {
  answerKey: true,
});
assert.deepEqual(buildPrintableAssignmentSearch({ answerKey: false }), {
  answerKey: undefined,
});
assert.deepEqual(
  parsePrintableAssignmentSearch(
    buildPrintableAssignmentSearch({ answerKey: true })
  ),
  { answerKey: true }
);
assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: 'yes' }), {
  answerKey: undefined,
});
assert.deepEqual(parsePrintableAssignmentSearch({}), {
  answerKey: undefined,
});
assert.equal(printableSnapshotWorksheet.instructions, 'Finish on paper.');
assert.equal(printableSnapshotWorksheet.shareSlug, 'printable-1');
assert.equal(printableSnapshotWorksheet.sharePath, '/play/printable-1');
assert.match(
  printableSnapshotWorksheet.deliveryPolicyText,
  /Student instructions: Finish on paper\./
);
assert.deepEqual(
  printableSnapshotWorksheet.deliverySummary.map((item) => [
    item.id,
    item.value,
  ]),
  [
    ['attempts', '3 max'],
    ['timer', '2 min'],
    ['closes', 'No close time'],
    ['identity', 'Anonymous'],
    ['answerReveal', 'Hidden'],
    ['itemOrder', 'Fixed order'],
  ]
);
assert.deepEqual(printableSnapshotWorksheet.items[0], {
  answerSpaceLines: 1,
  choicePresentation: 'choice-list',
  choices: ['Frozen answer / Frozen accepted', 'Frozen answer', 'Other'],
  id: 'q-frozen-prompt',
  kind: 'question',
  prompt: 'Frozen prompt?',
  responseMode: 'choice',
  sequenceNumber: 1,
});
const printableChoiceSourceItems = getRuntimeItems(
  'quiz',
  publicPayloadSnapshotContent
);
const printableChoiceWorksheet = buildPrintableAssignmentWorksheet({
  activity: {
    description: 'Choice copy source',
    templateType: 'quiz',
    title: 'Choice copy source',
  },
  assignment: {
    expiresAt: null,
    settingsJson: null,
    shareSlug: 'printable-choice-copy',
    title: 'Printable choice copy',
  },
  runtimeItems: printableChoiceSourceItems,
  snapshot: null,
});
assert.deepEqual(
  printableChoiceWorksheet.items[0]?.choices,
  printableChoiceSourceItems[0]?.choices
);
assert.notEqual(
  printableChoiceWorksheet.items[0]?.choices,
  printableChoiceSourceItems[0]?.choices
);
printableChoiceWorksheet.items[0]?.choices.push('Print-only choice');
assert.equal(
  printableChoiceSourceItems[0]?.choices?.includes('Print-only choice'),
  false
);
const messyPrintableWorksheet = buildPrintableAssignmentWorksheet({
  activity: {
    description: 'Messy printable activity',
    templateType: 'quiz',
    title: 'Messy printable activity',
  },
  assignment: {
    expiresAt: null,
    settingsJson: null,
    shareSlug: 'messy-printable',
    title: 'Messy printable assignment',
  },
  includeAnswerKey: true,
  runtimeItems: [
    {
      answer: ' Paris / Ｐａｒｉｓ / Paris, France ',
      choices: [' Paris ', 'ＰＡＲＩＳ', '', 'Rome'],
      explanation: '  France capital.  ',
      id: 'messy-print-q',
      kind: 'question',
      prompt: '  Capital   of   France?  ',
    },
  ],
  snapshot: null,
});
assert.deepEqual(messyPrintableWorksheet.items[0], {
  answerSpaceLines: 1,
  choicePresentation: 'choice-list',
  choices: ['Paris', 'Rome'],
  id: 'messy-print-q',
  kind: 'question',
  prompt: 'Capital of France?',
  responseMode: 'choice',
  sequenceNumber: 1,
});
assert.deepEqual(messyPrintableWorksheet.answerKey?.[0], {
  acceptedAnswers: ['Paris', 'Paris, France'],
  answer: 'Paris',
  explanation: 'France capital.',
  id: 'messy-print-q',
  kind: 'question',
  prompt: 'Capital of France?',
  sequenceNumber: 1,
});
const printableSnapshotItemView = buildPrintableWorksheetItemView(
  printableSnapshotWorksheet.items[0]!
);
assert.equal(printableSnapshotItemView.id, 'q-frozen-prompt');
assert.equal(printableSnapshotItemView.headingLabel, 'Item 1 · Question');
assert.equal(printableSnapshotItemView.answerAreaLabel, 'Answer');
assert.equal(printableSnapshotItemView.choiceBank.label, 'Choices');
assert.deepEqual(printableSnapshotItemView.answerLines, [
  { key: 'q-frozen-prompt-answer-line-0' },
]);
assert.deepEqual(printableSnapshotItemView.choiceBank.choices, [
  {
    choice: 'Frozen answer / Frozen accepted',
    indexLabel: 'A',
    key: 'q-frozen-prompt-choice-0',
  },
  {
    choice: 'Frozen answer',
    indexLabel: 'B',
    key: 'q-frozen-prompt-choice-1',
  },
  {
    choice: 'Other',
    indexLabel: 'C',
    key: 'q-frozen-prompt-choice-2',
  },
]);
const messyPrintableItemView = buildPrintableWorksheetItemView({
  answerSpaceLines: Number.POSITIVE_INFINITY,
  choicePresentation: 'choice-list',
  choices: [' Ｐａｒｉｓ ', 'Paris', '', 'Rome'],
  id: 'messy-print-item',
  kind: 'question',
  prompt: '  Choose   the   capital.  ',
  responseMode: 'choice',
  sequenceNumber: Number.NaN,
});
assert.equal(messyPrintableItemView.headingLabel, 'Item 1 · Question');
assert.equal(messyPrintableItemView.sequenceLabel, 'Item 1');
assert.equal(messyPrintableItemView.answerAreaLabel, 'Answer');
assert.equal(messyPrintableItemView.choiceBank.label, 'Choices');
assert.deepEqual(messyPrintableItemView.answerLines, [
  { key: 'messy-print-item-answer-line-0' },
]);
assert.deepEqual(messyPrintableItemView.choices, ['Paris', 'Rome']);
assert.deepEqual(messyPrintableItemView.choiceBank.choices, [
  {
    choice: 'Paris',
    indexLabel: 'A',
    key: 'messy-print-item-choice-0',
  },
  {
    choice: 'Rome',
    indexLabel: 'B',
    key: 'messy-print-item-choice-1',
  },
]);
assert.equal(
  buildPrintableWorksheetItemView({
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    choices: ['left', 'right'],
    id: 'printable-answer-bank',
    kind: 'pair',
    prompt: 'Match it.',
    responseMode: 'line-match',
    sequenceNumber: 2,
  }).choiceBank.label,
  'Answer bank'
);
assert.equal(
  buildPrintableWorksheetItemView({
    answerSpaceLines: 1,
    choicePresentation: 'group-bank',
    choices: ['Animals', 'Food'],
    id: 'printable-group-bank',
    kind: 'group-item',
    prompt: 'Classify it.',
    responseMode: 'group-choice',
    sequenceNumber: 3,
  }).choiceBank.label,
  'Groups'
);
assert.equal(
  buildPrintableWorksheetItemView({
    answerSpaceLines: 1,
    choicePresentation: 'none',
    choices: [],
    id: 'printable-no-bank',
    kind: 'question',
    prompt: 'Write it.',
    responseMode: 'short-answer',
    sequenceNumber: 4,
  }).choiceBank.label,
  null
);
overwriteGetLocale(() => 'zh');
try {
  const zhPrintableItemView = buildPrintableWorksheetItemView({
    answerSpaceLines: 2,
    choicePresentation: 'choice-list',
    choices: ['苹果', '香蕉'],
    id: 'zh-printable-item',
    kind: 'question',
    prompt: '选择水果。',
    responseMode: 'choice',
    sequenceNumber: 2,
  });

  assert.equal(zhPrintableItemView.headingLabel, '第 2 题 · 题目');
  assert.equal(zhPrintableItemView.answerAreaLabel, '作答区');
  assert.equal(zhPrintableItemView.choiceBank.label, '选项');
  assert.deepEqual(zhPrintableItemView.choiceBank.choices, [
    {
      choice: '苹果',
      indexLabel: 'A',
      key: 'zh-printable-item-choice-0',
    },
    {
      choice: '香蕉',
      indexLabel: 'B',
      key: 'zh-printable-item-choice-1',
    },
  ]);
} finally {
  overwriteGetLocale(() => 'en');
}
const printableSnapshotWorksheetWithAnswers = buildPrintableAssignmentWorksheet(
  {
    activity: {
      description: 'Current activity description',
      templateType: 'quiz',
      title: 'Current activity title',
    },
    assignment: {
      expiresAt: null,
      settingsJson: {
        collectStudentName: false,
        instructions: '  Finish on paper.  ',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: false,
        timeLimitSeconds: 120,
      },
      shareSlug: ' printable-１ ',
      title: ' Ｐｒｉｎｔａｂｌｅ\u00A0　assignment ',
    },
    includeAnswerKey: true,
    runtimeItems: getRuntimeItems('quiz', publicPayloadSnapshotContent),
    snapshot: {
      activityDescription: 'Frozen activity description',
      activityTitle: 'Frozen activity title',
      templateType: 'quiz',
    },
  }
);
assert.deepEqual(printableSnapshotWorksheetWithAnswers.answerKey, [
  {
    acceptedAnswers: ['Frozen answer', 'Frozen accepted'],
    answer: 'Frozen answer',
    explanation: 'Frozen explanation',
    id: 'q-frozen-prompt',
    kind: 'question',
    prompt: 'Frozen prompt?',
    sequenceNumber: 1,
  },
]);
assert.deepEqual(
  buildPrintableWorksheetAnswerKeyItemView(
    printableSnapshotWorksheetWithAnswers.answerKey[0]!
  ),
  {
    acceptedAnswersLabel: 'Accepted alternatives: Frozen accepted',
    answerLabel: '1. Frozen answer',
    explanationLabel: 'Explanation: Frozen explanation',
    id: 'q-frozen-prompt',
    prompt: 'Frozen prompt?',
  }
);
assert.deepEqual(
  buildPrintableWorksheetAnswerKeyItemView({
    acceptedAnswers: [' Paris ', 'Paris, France'],
    answer: ' Paris ',
    explanation: '  France capital.  ',
    id: 'messy-answer-key',
    kind: 'question',
    prompt: '  Capital   of   France?  ',
    sequenceNumber: Number.POSITIVE_INFINITY,
  }),
  {
    acceptedAnswersLabel: 'Accepted alternatives: Paris, France',
    answerLabel: '1. Paris',
    explanationLabel: 'Explanation: France capital.',
    id: 'messy-answer-key',
    prompt: 'Capital of France?',
  }
);
assert.deepEqual(
  buildPrintableWorksheetAnswerKeyItemView({
    acceptedAnswers: [
      ' Paris ',
      'paris',
      'Ｐａｒｉｓ',
      'Paris, France',
      'La capitale',
    ],
    answer: ' Paris ',
    explanation: '',
    id: 'deduped-answer-key',
    kind: 'question',
    prompt: 'Capital?',
    sequenceNumber: 2,
  }),
  {
    acceptedAnswersLabel: 'Accepted alternatives: Paris, France, La capitale',
    answerLabel: '2. Paris',
    explanationLabel: undefined,
    id: 'deduped-answer-key',
    prompt: 'Capital?',
  }
);
overwriteGetLocale(() => 'zh');
try {
  assert.deepEqual(
    buildPrintableWorksheetAnswerKeyItemView({
      acceptedAnswers: ['答案', '答案', '答案一', '答案二'],
      answer: '答案',
      id: 'zh-answer-key',
      kind: 'question',
      prompt: '题目？',
      sequenceNumber: 1,
    }),
    {
      acceptedAnswersLabel: '可接受变体：答案一，答案二',
      answerLabel: '1. 答案',
      explanationLabel: undefined,
      id: 'zh-answer-key',
      prompt: '题目?',
    }
  );
} finally {
  overwriteGetLocale(() => 'en');
}
const printableWorksheetPageView = buildPrintableWorksheetPageViewModel({
  answerKey: true,
  worksheet: printableSnapshotWorksheetWithAnswers,
});
assert.deepEqual(
  {
    answerKeyView: {
      description: printableWorksheetPageView.answerKeyView.description,
      itemIds: printableWorksheetPageView.answerKeyView.itemViews.map(
        (item) => item.id
      ),
      show: printableWorksheetPageView.answerKeyView.show,
      title: printableWorksheetPageView.answerKeyView.title,
    },
    answerKeyItemIds: printableWorksheetPageView.answerKeyItemViews.map(
      (item) => item.id
    ),
    assignmentFieldViews: printableWorksheetPageView.assignmentFieldViews,
    controlView: printableWorksheetPageView.controlView,
    emptyState: printableWorksheetPageView.emptyState,
    headerView: printableWorksheetPageView.headerView,
    itemIds: printableWorksheetPageView.itemViews.map((item) => item.id),
    showAnswerKey: printableWorksheetPageView.showAnswerKey,
  },
  {
    answerKeyView: {
      description: 'Teacher-only answers from the frozen assignment snapshot.',
      itemIds: ['q-frozen-prompt'],
      show: true,
      title: 'Answer key',
    },
    answerKeyItemIds: ['q-frozen-prompt'],
    assignmentFieldViews: [
      {
        id: 'student-name',
        kind: 'blank-line',
        label: 'Student name',
      },
      {
        id: 'date',
        kind: 'blank-line',
        label: 'Date',
      },
      {
        id: 'score',
        kind: 'blank-line',
        label: 'Score',
      },
      {
        id: 'share-path',
        kind: 'text',
        label: 'Student link',
        value: '/play/printable-1',
      },
      {
        id: 'instructions',
        kind: 'text',
        label: 'Instructions',
        value: 'Finish on paper.',
      },
      {
        id: 'delivery-policy',
        kind: 'text',
        label: 'Delivery policy',
        value: printableSnapshotWorksheetWithAnswers.deliveryPolicyText,
      },
    ],
    controlView: {
      answerKeyLabel: 'Include answer key',
      answerKeyValue: true,
      backToResultsLabel: 'Back to results',
      printButtonLabel: 'Print',
    },
    emptyState: {
      description:
        'Add questions, pairs, or groups to the activity before printing this assignment.',
      title: 'No printable items yet.',
    },
    headerView: {
      activityDescription: 'Frozen activity description',
      activityTitle: 'Frozen activity title',
      assignmentTitle: 'Printable assignment',
      brandLabel: 'ClassGamify worksheet',
      deliveryPolicy: printableSnapshotWorksheetWithAnswers.deliveryPolicyText,
      instructions: 'Finish on paper.',
      printModeLabel: 'Printable practice',
      sharePath: '/play/printable-1',
      templateLabel: 'Quiz',
    },
    itemIds: ['q-frozen-prompt'],
    showAnswerKey: true,
  }
);
assert.deepEqual(
  buildPrintableWorksheetPageViewModel({
    answerKey: false,
    worksheet: printableSnapshotWorksheetWithAnswers,
  }).answerKeyView.show,
  false
);
assert.deepEqual(buildPrintableWorksheetLoadingView(), {
  message: 'Loading printable worksheet',
});
assert.deepEqual(buildPrintableWorksheetErrorView(), {
  message:
    'Printable worksheet could not be loaded. Return to results and try again.',
});
assert.equal(
  buildOpenPublicAssignmentPayload({
    ...publicAssignmentPayloadSource,
    assignment: {
      ...publicAssignmentPayloadSource.assignment,
      status: 'closed',
    },
  }),
  null
);
assert.deepEqual(
  buildPublicAssignmentLookupResult({
    ...publicAssignmentPayloadSource,
    assignment: {
      ...publicAssignmentPayloadSource.assignment,
      status: 'closed',
    },
  }),
  {
    reason: 'closed',
    status: 'unavailable',
  }
);
assert.equal(
  buildOpenPublicAssignmentPayload(
    {
      ...publicAssignmentPayloadSource,
      assignment: {
        ...publicAssignmentPayloadSource.assignment,
        expiresAt: new Date('2026-01-01T09:00:00.000Z'),
      },
    },
    new Date('2026-01-01T10:00:00.000Z').getTime()
  ),
  null
);
assert.deepEqual(
  buildPublicAssignmentLookupResult(
    {
      ...publicAssignmentPayloadSource,
      assignment: {
        ...publicAssignmentPayloadSource.assignment,
        expiresAt: new Date('2026-01-01T09:00:00.000Z'),
      },
    },
    new Date('2026-01-01T10:00:00.000Z').getTime()
  ),
  {
    reason: 'expired',
    status: 'unavailable',
  }
);
assert.deepEqual(
  buildPublicAssignmentLookupResult({
    ...publicAssignmentPayloadSource,
    assignment: {
      ...publicAssignmentPayloadSource.assignment,
      status: 'draft',
    },
  }),
  {
    reason: 'draft',
    status: 'unavailable',
  }
);
const publicRuntimeSanitizationInput = {
  description: 'Sanitized runtime payload source',
  difficulty: 'core' as const,
  gradeBand: 'Grade 4',
  groupsText: 'Animals | cat, dog\nPlants | tree, fern',
  language: 'en',
  learningGoal: 'Students answer every supported public activity mode.',
  pairsText: 'Hot | Cold\nUp | Down',
  questionsText:
    'Capital? | Paris / Paris, France | Paris, Rome, Lyon | Paris explanation\nOpposite of day? | night | day, night, noon | Night explanation',
  sourceSummary: 'A complete activity for public runtime sanitization.',
  subject: 'General',
  teacherNotesText: 'These notes should never reach public runtime items.',
  title: 'Sanitized runtime activity',
  visibility: 'draft' as const,
  vocabularyText: 'Paris, France, night, cat, tree, Cold, Down',
};
assert.deepEqual(PRINTABLE_WORKSHEET_RESPONSE_POLICIES, {
  'choice-list': {
    answerSpaceLines: 1,
    choicePresentation: 'choice-list',
    responseMode: 'choice',
  },
  'fill-blank': {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    responseMode: 'short-answer',
  },
  'group-sort': {
    answerSpaceLines: 1,
    choicePresentation: 'group-bank',
    responseMode: 'group-choice',
  },
  'line-match': {
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    responseMode: 'line-match',
  },
  listening: {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    responseMode: 'short-answer',
  },
  'matching-pairs': {
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    responseMode: 'matching-pairs',
  },
  'open-box': {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    responseMode: 'short-answer',
  },
});
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const content = buildActivityContent({
    ...publicRuntimeSanitizationInput,
    templateType,
  });
  const payload = buildPublicAssignmentPayload({
    activity: {
      contentJson: content,
      description: 'Sanitized runtime activity description',
      id: `activity-public-${templateType}`,
      templateType,
      title: `Sanitized ${templateType}`,
      visibility: 'draft',
    },
    assignment: {
      expiresAt: null,
      id: `assignment-public-${templateType}`,
      settingsJson: null,
      shareSlug: ` share-${templateType} `,
      status: 'published',
      title: `Public ${templateType}`,
    },
    snapshot: null,
  });
  const runtimeItems = getRuntimeItems(templateType, content);
  const expectedPublicRuntimeItems = stripRuntimeAnswers(
    orderAssignmentRuntimeItems({
      items: runtimeItems,
      shareSlug: `share-${templateType}`,
      shuffleItems: true,
    })
  );

  assert.equal(payload.assignment.shareSlug, `share-${templateType}`);
  assert.equal(payload.runtimeItems.length, runtimeItems.length);
  assert.deepEqual(payload.runtimeItems, expectedPublicRuntimeItems);
  const printableWorksheet = buildPrintableAssignmentWorksheet({
    activity: {
      description: 'Printable runtime activity description',
      templateType,
      title: `Printable ${templateType}`,
    },
    assignment: {
      expiresAt: null,
      settingsJson: {
        shuffleItems: false,
      },
      shareSlug: ` printable-${templateType} `,
      title: `Printable ${templateType}`,
    },
    runtimeItems,
    snapshot: null,
  });
  const responsePolicy = getPrintableWorksheetResponsePolicy(templateType);
  assert.equal(printableWorksheet.items.length, runtimeItems.length);
  assert.equal(
    printableWorksheet.items.every(
      (item) => item.answerSpaceLines === responsePolicy.answerSpaceLines
    ),
    true
  );
  assert.equal(
    printableWorksheet.items.every(
      (item) => item.choicePresentation === responsePolicy.choicePresentation
    ),
    true
  );
  assert.equal(
    printableWorksheet.items.every(
      (item) => item.responseMode === responsePolicy.responseMode
    ),
    true
  );
  assert.equal(printableWorksheet.answerKey, undefined);
  payload.runtimeItems.forEach((item, index) => {
    assert.deepEqual(Object.keys(item).sort(), [
      'choices',
      'id',
      'kind',
      'prompt',
    ]);
    assert.equal('answer' in item, false);
    assert.equal('explanation' in item, false);
    assert.deepEqual(item, expectedPublicRuntimeItems[index]);
  });
}
const publicRuntimeOrderingContent = buildActivityContent({
  ...publicRuntimeSanitizationInput,
  templateType: 'quiz',
});
const publicRuntimeOrderingItems = getRuntimeItems(
  'quiz',
  publicRuntimeOrderingContent
);
const publicRuntimeChoiceViews = stripRuntimeAnswers(
  publicRuntimeOrderingItems
);
assert.deepEqual(
  publicRuntimeChoiceViews[0]?.choices,
  publicRuntimeOrderingItems[0]?.choices
);
assert.notEqual(
  publicRuntimeChoiceViews[0]?.choices,
  publicRuntimeOrderingItems[0]?.choices
);
publicRuntimeChoiceViews[0]?.choices?.push('Student-local choice');
assert.equal(
  publicRuntimeOrderingItems[0]?.choices?.includes('Student-local choice'),
  false
);
const publicRuntimeOrderingSource = {
  activity: {
    contentJson: publicRuntimeOrderingContent,
    description: 'Public runtime ordering activity',
    id: 'activity-public-order',
    templateType: 'quiz',
    title: 'Public runtime ordering',
    visibility: 'draft',
  },
  assignment: {
    expiresAt: null,
    id: 'assignment-public-order',
    settingsJson: {
      collectStudentName: true,
      showCorrectAnswers: true,
      shuffleItems: true,
    },
    shareSlug: ' share-public-order ',
    status: 'published',
    title: 'Ordered public assignment',
  },
  snapshot: null,
} satisfies Parameters<typeof buildPublicAssignmentPayload>[0];
const expectedPublicRuntimeOrderingIds = orderAssignmentRuntimeItems({
  items: publicRuntimeOrderingItems,
  shareSlug: 'share-public-order',
  shuffleItems: true,
}).map((item) => item.id);
const publicRuntimeOrderingPayload = buildPublicAssignmentPayload(
  publicRuntimeOrderingSource
);
assert.deepEqual(
  publicRuntimeOrderingPayload.runtimeItems.map((item) => item.id),
  expectedPublicRuntimeOrderingIds
);
assert.notDeepEqual(
  publicRuntimeOrderingPayload.runtimeItems.map((item) => item.id),
  publicRuntimeOrderingItems.map((item) => item.id)
);
assert.deepEqual(
  buildPublicAssignmentPayload({
    ...publicRuntimeOrderingSource,
    assignment: {
      ...publicRuntimeOrderingSource.assignment,
      settingsJson: {
        ...publicRuntimeOrderingSource.assignment.settingsJson,
        shuffleItems: false,
      },
    },
  }).runtimeItems.map((item) => item.id),
  publicRuntimeOrderingItems.map((item) => item.id)
);
const publicRuntimeOrderingLookup = buildPublicAssignmentLookupResult(
  publicRuntimeOrderingSource
);
if (publicRuntimeOrderingLookup.status !== 'available') {
  throw new Error('Expected public runtime ordering lookup to be available.');
}
assert.deepEqual(
  publicRuntimeOrderingLookup.payload.runtimeItems.map((item) => item.id),
  expectedPublicRuntimeOrderingIds
);
assert.deepEqual(
  buildOpenPublicAssignmentPayload(
    publicRuntimeOrderingSource
  )?.runtimeItems.map((item) => item.id),
  expectedPublicRuntimeOrderingIds
);
const runnerStateStarterActivity = {
  content: publicPayloadSnapshotContent,
  description: 'Starter activity description',
  estimatedMinutes: 5,
  id: 'activity-starter',
  status: 'draft' as const,
  templateType: 'quiz' as const,
  title: 'Starter activity',
};
const runnerStateStarterAssignment = {
  activityId: 'activity-starter',
  averageScore: 0,
  completions: 0,
  expiresAt: null,
  id: 'assignment-starter',
  settings: {
    collectStudentName: true,
    showCorrectAnswers: true,
    shuffleItems: false,
  },
  shareId: 'demo-runner',
  status: 'published' as const,
  title: 'Starter assignment',
};
const runnerStateStarterRuntimeItems = getRuntimeItems(
  'quiz',
  publicPayloadSnapshotContent
);
assert.deepEqual(
  buildStudentRunnerPageState({
    data: publicAssignmentLookupAvailable,
    isLoading: true,
    shareId: 'share-public',
    starterActivity: runnerStateStarterActivity,
    starterAssignment: runnerStateStarterAssignment,
    starterRuntimeItems: runnerStateStarterRuntimeItems,
  }),
  { status: 'loading' }
);
assert.deepEqual(
  buildStudentRunnerPageState({
    data: null,
    isLoading: false,
    shareId: 'missing-share',
    starterActivity: runnerStateStarterActivity,
    starterAssignment: runnerStateStarterAssignment,
    starterRuntimeItems: runnerStateStarterRuntimeItems,
  }),
  { reason: 'not-found', status: 'missing' }
);
assert.deepEqual(
  buildStudentRunnerPageState({
    data: {
      reason: 'closed',
      status: 'unavailable',
    },
    isLoading: false,
    shareId: 'share-public',
    starterActivity: runnerStateStarterActivity,
    starterAssignment: runnerStateStarterAssignment,
    starterRuntimeItems: runnerStateStarterRuntimeItems,
  }),
  { reason: 'closed', status: 'missing' }
);
assert.deepEqual(
  buildStudentRunnerPageState({
    data: {
      reason: 'expired',
      status: 'unavailable',
    },
    isLoading: false,
    shareId: 'share-public',
    starterActivity: runnerStateStarterActivity,
    starterAssignment: runnerStateStarterAssignment,
    starterRuntimeItems: runnerStateStarterRuntimeItems,
  }),
  { reason: 'expired', status: 'missing' }
);
assert.deepEqual(
  buildStudentRunnerPageState({
    data: {
      reason: 'draft',
      status: 'unavailable',
    },
    isLoading: false,
    shareId: 'share-public',
    starterActivity: runnerStateStarterActivity,
    starterAssignment: runnerStateStarterAssignment,
    starterRuntimeItems: runnerStateStarterRuntimeItems,
  }),
  { reason: 'draft', status: 'missing' }
);
const publicRunnerState = buildStudentRunnerPageState({
  data: publicAssignmentLookupAvailable,
  isLoading: false,
  shareId: ' share-public ',
  starterActivity: runnerStateStarterActivity,
  starterAssignment: runnerStateStarterAssignment,
  starterRuntimeItems: runnerStateStarterRuntimeItems,
});
if (publicRunnerState.status !== 'ready') {
  throw new Error('Expected public runner state to be ready.');
}
assert.equal(publicRunnerState.source, 'public-assignment');
assert.equal(publicRunnerState.canSubmit, true);
assert.equal(publicRunnerState.hidePreviewAnswers, true);
assert.equal(publicRunnerState.assignment.shareId, 'share-public');
assert.equal(publicRunnerState.activity.title, 'Frozen activity title');
assert.equal(publicRunnerState.runtimeItems[0]?.prompt, 'Frozen prompt?');
assert.equal('answer' in publicRunnerState.runtimeItems[0]!, false);
assert.equal('explanation' in publicRunnerState.runtimeItems[0]!, false);
const orderedPublicRunnerState = buildStudentRunnerPageState({
  data: publicRuntimeOrderingLookup,
  isLoading: false,
  shareId: ' share-public-order ',
  starterActivity: runnerStateStarterActivity,
  starterAssignment: runnerStateStarterAssignment,
  starterRuntimeItems: runnerStateStarterRuntimeItems,
});
if (orderedPublicRunnerState.status !== 'ready') {
  throw new Error('Expected ordered public runner state to be ready.');
}
assert.deepEqual(
  orderedPublicRunnerState.runtimeItems.map((item) => item.id),
  expectedPublicRuntimeOrderingIds
);
assert.deepEqual(
  buildStudentRunnerReadyState({
    activity: publicRunnerState.activity,
    assignment: publicRunnerState.assignment,
    runtimeItems: [],
    source: 'public-assignment',
  }),
  {
    activity: publicRunnerState.activity,
    assignment: publicRunnerState.assignment,
    canSubmit: false,
    hidePreviewAnswers: true,
    runtimeItems: [],
    source: 'public-assignment',
    status: 'ready',
  }
);
const runnerReadyChoiceSource = [
  {
    choices: ['Paris', 'Rome'],
    id: 'choice-runner',
    kind: 'question' as const,
    prompt: 'Capital?',
  },
];
const runnerReadyChoiceState = buildStudentRunnerReadyState({
  activity: publicRunnerState.activity,
  assignment: publicRunnerState.assignment,
  runtimeItems: runnerReadyChoiceSource,
  source: 'public-assignment',
});
assert.notEqual(runnerReadyChoiceState.runtimeItems, runnerReadyChoiceSource);
assert.deepEqual(
  runnerReadyChoiceState.runtimeItems[0]?.choices,
  runnerReadyChoiceSource[0]?.choices
);
assert.notEqual(
  runnerReadyChoiceState.runtimeItems[0]?.choices,
  runnerReadyChoiceSource[0]?.choices
);
assert.deepEqual(
  buildStudentRunnerReadyState({
    activity: runnerStateStarterActivity,
    assignment: runnerStateStarterAssignment,
    runtimeItems: stripRuntimeAnswers(runnerStateStarterRuntimeItems),
    source: 'starter-preview',
  }),
  {
    activity: runnerStateStarterActivity,
    assignment: runnerStateStarterAssignment,
    canSubmit: false,
    hidePreviewAnswers: false,
    runtimeItems: stripRuntimeAnswers(runnerStateStarterRuntimeItems),
    source: 'starter-preview',
    status: 'ready',
  }
);
assert.deepEqual(
  buildStudentRunnerAttemptState({
    answers: {
      [publicRunnerState.runtimeItems[0]!.id]: 'Student answer',
    },
    pageState: publicRunnerState,
    shareId: ' share-public ',
  }),
  {
    activeShareId: 'share-public',
    canSubmit: true,
    completionSummary: {
      answeredItemCount: 1,
      itemCount: publicRunnerState.runtimeItems.length,
      unansweredItemCount: publicRunnerState.runtimeItems.length - 1,
    },
    currentAttemptSessionKey: buildStudentAttemptSessionKey({
      assignmentId: publicRunnerState.assignment.id,
      runtimeItems: publicRunnerState.runtimeItems,
      shareSlug: 'share-public',
      templateType: publicRunnerState.activity.templateType,
    }),
    itemCount: publicRunnerState.runtimeItems.length,
    runtimeItems: publicRunnerState.runtimeItems,
  }
);
const starterRunnerState = buildStudentRunnerPageState({
  data: null,
  isLoading: false,
  shareId: ' demo-runner ',
  starterActivity: runnerStateStarterActivity,
  starterAssignment: runnerStateStarterAssignment,
  starterRuntimeItems: runnerStateStarterRuntimeItems,
});
if (starterRunnerState.status !== 'ready') {
  throw new Error('Expected starter runner state to be ready.');
}
assert.equal(starterRunnerState.source, 'starter-preview');
assert.equal(starterRunnerState.canSubmit, false);
assert.equal(starterRunnerState.hidePreviewAnswers, false);
assert.equal(starterRunnerState.assignment.shareId, 'demo-runner');
assert.equal(starterRunnerState.runtimeItems[0]?.prompt, 'Frozen prompt?');
assert.equal('answer' in starterRunnerState.runtimeItems[0]!, false);
assert.equal('explanation' in starterRunnerState.runtimeItems[0]!, false);
assert.deepEqual(
  buildStudentRunnerAttemptState({
    answers: {},
    pageState: starterRunnerState,
    shareId: ' demo-runner ',
  }),
  {
    activeShareId: 'demo-runner',
    canSubmit: false,
    completionSummary: {
      answeredItemCount: 0,
      itemCount: starterRunnerState.runtimeItems.length,
      unansweredItemCount: starterRunnerState.runtimeItems.length,
    },
    currentAttemptSessionKey: buildStudentAttemptSessionKey({
      assignmentId: starterRunnerState.assignment.id,
      runtimeItems: starterRunnerState.runtimeItems,
      shareSlug: 'demo-runner',
      templateType: starterRunnerState.activity.templateType,
    }),
    itemCount: starterRunnerState.runtimeItems.length,
    runtimeItems: starterRunnerState.runtimeItems,
  }
);
assert.deepEqual(
  buildStudentRunnerAttemptState({
    answers: {},
    pageState: { reason: 'not-found', status: 'missing' },
    shareId: 'missing-share',
  }),
  {
    activeShareId: 'missing-share',
    canSubmit: false,
    completionSummary: {
      answeredItemCount: 0,
      itemCount: 0,
      unansweredItemCount: 0,
    },
    currentAttemptSessionKey: undefined,
    itemCount: 0,
    runtimeItems: [],
  }
);
const studentRunnerPageView = buildStudentRunnerPageViewModel({
  anonymousToken: 'browser-1',
  answers: {
    [publicRunnerState.runtimeItems[0]!.id]: 'Student answer',
  },
  attemptClock: {
    shareId: ' share-public ',
    startedAt: 1_000,
  },
  confirmIncompleteSubmit: false,
  fallbackStartedAt: 91_000,
  isSubmitting: false,
  pageState: publicRunnerState,
  result: {
    accuracy: 50,
    attemptUsage: {
      maxAttempts: 2,
      remainingAttempts: 1,
      usedAttempts: 1,
    },
    durationSeconds: 80,
    earnedPoints: 1,
    totalPoints: 2,
  },
  shareId: ' share-public ',
  submittedAttemptCount: 0,
});
assert.deepEqual(
  {
    activeShareId: studentRunnerPageView.activeShareId,
    anonymousAttemptCopy: studentRunnerPageView.anonymousAttemptCopy,
    attemptControlState: studentRunnerPageView.attemptControlState,
    attemptResultDisplay: studentRunnerPageView.attemptResultDisplay,
    attemptTimerBadge: studentRunnerPageView.attemptTimerBadge,
    attemptUsageLabel: studentRunnerPageView.attemptUsageLabel,
    completionCopy: studentRunnerPageView.completionCopy,
    controlView: studentRunnerPageView.controlView,
    currentAttemptSessionKey: studentRunnerPageView.currentAttemptSessionKey,
    headerView: studentRunnerPageView.headerView,
    identityView: studentRunnerPageView.identityView,
    itemCount: studentRunnerPageView.itemCount,
    loadingView: studentRunnerPageView.loadingView,
    missingView: studentRunnerPageView.missingView,
    resultPanelView: studentRunnerPageView.resultPanelView,
    routeBadgeLabel: studentRunnerPageView.routeBadgeLabel,
    runtimeItemIds: studentRunnerPageView.runtimeItems.map((item) => item.id),
    showStartAnotherAttempt: studentRunnerPageView.showStartAnotherAttempt,
    startedAt: studentRunnerPageView.startedAt,
    submissionSuccessMessage: studentRunnerPageView.submissionSuccessMessage,
    timeLimitSeconds: studentRunnerPageView.timeLimitSeconds,
  },
  {
    activeShareId: 'share-public',
    anonymousAttemptCopy: {
      description: `This assignment does not collect student names. This browser will submit as ${getAnonymousBrowserLabel('browser-1')}.`,
      title: 'Anonymous attempt',
    },
    attemptControlState: {
      readOnlyMessage: undefined,
      runtimeItemsDisabled: true,
      showTimeExpiredMessage: false,
      submitDisabled: true,
      unansweredLabel: undefined,
    },
    attemptResultDisplay: {
      accuracyLabel: '50% accuracy',
      durationLabel: 'Time: 1:20',
      scoreLabel: '1/2',
    },
    attemptTimerBadge: {
      label: '',
      show: false,
    },
    attemptUsageLabel: '1 attempt left',
    completionCopy: {
      confirmIncompleteSubmit: 'All items are answered.',
      progressLabel: '1/1 answered',
      submitButtonLabel: 'Submit answers',
      unansweredLabel: undefined,
    },
    controlView: {
      progressLabel: '1/1 answered',
      readOnlyMessage: undefined,
      runnerTitle: 'Quiz',
      runtimeItemsDisabled: true,
      showTimeExpiredMessage: false,
      submitButtonLabel: 'Submit answers',
      submitDisabled: true,
      timeExpiredMessage: 'Time is up. Review your saved answers, then submit.',
      timerBadge: {
        label: '',
        show: false,
      },
      unansweredLabel: undefined,
    },
    currentAttemptSessionKey: buildStudentAttemptSessionKey({
      assignmentId: publicRunnerState.assignment.id,
      runtimeItems: publicRunnerState.runtimeItems,
      shareSlug: 'share-public',
      templateType: publicRunnerState.activity.templateType,
    }),
    headerView: buildStudentRunnerHeaderView({
      assignment: publicRunnerState.assignment,
      itemCount: publicRunnerState.runtimeItems.length,
    }),
    identityView: {
      copy: {
        description: `This assignment does not collect student names. This browser will submit as ${getAnonymousBrowserLabel('browser-1')}.`,
        title: 'Anonymous attempt',
      },
      mode: 'anonymous',
    },
    itemCount: publicRunnerState.runtimeItems.length,
    loadingView: {
      message: 'Loading student activity...',
    },
    missingView: undefined,
    resultPanelView: {
      accuracyLabel: '50% accuracy',
      attemptUsageLabel: '1 attempt left',
      durationLabel: 'Time: 1:20',
      scoreLabel: '1/2',
      show: true,
      showStartAnotherAttempt: true,
      startAnotherAttemptLabel: 'Start another attempt',
      statusLabel: 'Score submitted',
    },
    routeBadgeLabel: 'Student play route',
    runtimeItemIds: publicRunnerState.runtimeItems.map((item) => item.id),
    showStartAnotherAttempt: true,
    startedAt: 1_000,
    submissionSuccessMessage: 'Attempt submitted.',
    timeLimitSeconds: undefined,
  }
);
assert.deepEqual(
  buildStudentRunnerPageViewModel({
    answers: {},
    attemptClock: undefined,
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 2_000,
    isSubmitting: false,
    pageState: { reason: 'not-found', status: 'missing' },
    shareId: 'missing-share',
    submittedAttemptCount: 0,
  }).attemptControlState,
  {
    readOnlyMessage:
      'Preview assignments are read-only until a teacher publishes a share link.',
    runtimeItemsDisabled: false,
    showTimeExpiredMessage: false,
    submitDisabled: true,
    unansweredLabel: undefined,
  }
);
const missingStudentRunnerPageView = buildStudentRunnerPageViewModel({
  answers: {},
  attemptClock: undefined,
  confirmIncompleteSubmit: false,
  fallbackStartedAt: 2_000,
  isSubmitting: false,
  pageState: { reason: 'closed', status: 'missing' },
  shareId: 'missing-share',
  submittedAttemptCount: 0,
});
assert.deepEqual(missingStudentRunnerPageView.loadingView, {
  message: 'Loading student activity...',
});
assert.deepEqual(missingStudentRunnerPageView.missingView, {
  badgeLabel: 'Student play route',
  browseTemplatesLabel: 'Browse templates',
  description:
    'This assignment link has been closed by the teacher. Ask your teacher for a reopened or new link.',
  title: 'Assignment closed',
});
assert.deepEqual(missingStudentRunnerPageView.resultPanelView, {
  show: false,
});
assert.equal(missingStudentRunnerPageView.identityView, undefined);
const namedStudentRunnerPageView = buildStudentRunnerPageViewModel({
  answers: {},
  attemptClock: undefined,
  confirmIncompleteSubmit: false,
  fallbackStartedAt: 2_000,
  isSubmitting: false,
  pageState: starterRunnerState,
  shareId: 'demo-runner',
  submittedAttemptCount: 0,
});
assert.deepEqual(namedStudentRunnerPageView.identityView, {
  label: 'Student name',
  mode: 'student-name',
  placeholder: 'Type your name',
});
assert.equal(namedStudentRunnerPageView.controlView.runnerTitle, 'Quiz');
assert.deepEqual(namedStudentRunnerPageView.resultPanelView, {
  show: false,
});
assert.deepEqual(
  buildStudentRunnerAttemptClock({
    activeShareId: ' share-public ',
    now: 12_345,
  }),
  {
    shareId: 'share-public',
    startedAt: 12_345,
  }
);
assert.equal(
  getStudentRunnerAttemptStartedAt({
    activeShareId: 'share-public',
    attemptClock: {
      shareId: ' share-public ',
      startedAt: 1_000,
    },
    fallbackStartedAt: 2_000,
  }),
  1_000
);
assert.equal(
  getStudentRunnerAttemptStartedAt({
    activeShareId: 'other-share',
    attemptClock: {
      shareId: 'share-public',
      startedAt: 1_000,
    },
    fallbackStartedAt: 2_000,
  }),
  2_000
);
assert.equal(
  shouldStartStudentRunnerAttemptClock({
    activeShareId: 'share-public',
    attemptClock: undefined,
    hasResult: false,
    itemCount: 2,
    ready: true,
  }),
  true
);
assert.equal(
  shouldStartStudentRunnerAttemptClock({
    activeShareId: ' share-public ',
    attemptClock: {
      shareId: 'share-public',
      startedAt: 1_000,
    },
    hasResult: false,
    itemCount: 2,
    ready: true,
  }),
  false
);
assert.equal(
  shouldStartStudentRunnerAttemptClock({
    activeShareId: 'share-public',
    attemptClock: undefined,
    hasResult: true,
    itemCount: 2,
    ready: true,
  }),
  false
);
assert.equal(
  shouldStartStudentRunnerAttemptClock({
    activeShareId: 'share-public',
    attemptClock: undefined,
    hasResult: false,
    itemCount: 0,
    ready: true,
  }),
  false
);
assert.equal(
  shouldStartStudentRunnerAttemptClock({
    activeShareId: 'share-public',
    attemptClock: undefined,
    hasResult: false,
    itemCount: 2,
    ready: false,
  }),
  false
);
assert.deepEqual(buildStudentRunnerAttemptResetState(), {
  answers: {},
  anonymousToken: undefined,
  attemptClock: undefined,
  confirmIncompleteSubmit: false,
  studentName: '',
  submittedAttemptCount: 0,
});
assert.deepEqual(buildStudentRunnerAttemptRestartPlan({ now: 98_765 }), {
  answers: {},
  attemptClock: undefined,
  confirmIncompleteSubmit: false,
  startedAt: 98_765,
});
assert.equal(
  shouldResetStudentRunnerAttemptSession({
    attemptSessionKey: undefined,
    currentAttemptSessionKey: 'session-1',
  }),
  true
);
assert.equal(
  shouldResetStudentRunnerAttemptSession({
    attemptSessionKey: 'session-1',
    currentAttemptSessionKey: 'session-1',
  }),
  false
);
assert.equal(
  shouldResetStudentRunnerAttemptSession({
    attemptSessionKey: 'session-1',
    currentAttemptSessionKey: undefined,
  }),
  false
);
assert.deepEqual(
  buildPublicAssignmentPreviewActivity(publicAssignmentPayload),
  {
    content: {
      difficulty: 'core',
      gradeBand: 'Grade 4',
      groups: [],
      language: 'en',
      learningGoal: 'Students answer the frozen snapshot content.',
      pairs: [],
      questions: [],
      sourceSummary: '',
      sourceMaterials: [],
      subject: 'History',
      teacherNotes: [],
      vocabulary: [],
    },
    description: 'Frozen activity description',
    estimatedMinutes: 5,
    id: 'activity-public',
    status: 'draft',
    templateType: 'quiz',
    title: 'Frozen activity title',
  }
);
assert.deepEqual(
  buildPublicAssignmentPreviewAssignment(publicAssignmentPayload),
  {
    activityId: 'activity-public',
    averageScore: 0,
    completions: 0,
    expiresAt: null,
    id: 'assignment-public',
    settings: publicAssignmentPayload.assignment.settingsJson,
    shareId: 'share-public',
    status: 'published',
    title: 'Public assignment',
  }
);
const publicReviewMap = buildPublicAttemptReviewItemMap([
  {
    acceptedAnswers: ['Paris', 'Paris, France'],
    correct: true,
    correctAnswer: 'Paris',
    explanation: 'Paris is the capital of France.',
    itemId: 'q-1',
    submitted: true,
  },
  {
    acceptedAnswers: ['Cold'],
    correct: false,
    correctAnswer: 'Cold',
    itemId: 'pair-1',
    submitted: true,
  },
]);
assert.equal(publicReviewMap.get('q-1')?.correctAnswer, 'Paris');
assert.equal(publicReviewMap.get('pair-1')?.correct, false);
assert.equal(publicReviewMap.get('missing'), undefined);
assert.equal(buildPublicAttemptReviewItemMap(undefined).size, 0);
const publicAttemptResultWithPrivateFields = buildPublicAttemptResult({
  accuracy: 50,
  completedItemCount: 1,
  correctItemCount: 1,
  durationSeconds: 80,
  earnedPoints: 1,
  rawAnswers: [{ answer: 'Paris', itemId: 'q-1' }],
  scorerTraceId: 'teacher-only-trace',
  totalPoints: 2,
} satisfies AttemptResult & {
  rawAnswers: Array<{ answer: string; itemId: string }>;
  scorerTraceId: string;
});
assert.deepEqual(Object.keys(publicAttemptResultWithPrivateFields).sort(), [
  'accuracy',
  'completedItemCount',
  'correctItemCount',
  'durationSeconds',
  'earnedPoints',
  'totalPoints',
]);
assert.deepEqual(publicAttemptResultWithPrivateFields, {
  accuracy: 50,
  completedItemCount: 1,
  correctItemCount: 1,
  durationSeconds: 80,
  earnedPoints: 1,
  totalPoints: 2,
});
assert.equal('rawAnswers' in publicAttemptResultWithPrivateFields, false);
assert.equal('scorerTraceId' in publicAttemptResultWithPrivateFields, false);
const studentRunnerView = buildStudentRunnerView({
  answers: { 'pair-1': 'Cold', 'q-1': 'Paris' },
  items: [
    {
      choices: ['Paris', 'Lyon'],
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
    {
      choices: ['Cold', 'Warm'],
      id: 'pair-1',
      kind: 'pair',
      prompt: 'Hot',
    },
    {
      choices: ['North', 'South'],
      id: 'pair-2',
      kind: 'pair',
      prompt: 'Up',
    },
  ],
  progressVerb: 'matched',
  reviewItems: [...publicReviewMap.values()],
});
assert.equal(studentRunnerView.progressLabel, '2/3 matched');
assert.deepEqual(studentRunnerView.choices, [
  'Paris',
  'Lyon',
  'Cold',
  'Warm',
  'North',
  'South',
]);
assert.equal(studentRunnerView.itemViewsById.get('q-1')?.status, 'correct');
assert.deepEqual(studentRunnerView.itemViews[0], {
  answer: 'Paris',
  answered: true,
  item: {
    choices: ['Paris', 'Lyon'],
    id: 'q-1',
    kind: 'question',
    prompt: 'Capital of France?',
  },
  kindLabel: 'Question',
  positionLabel: '1. Capital of France?',
  prompt: 'Capital of France?',
  reviewItem: publicReviewMap.get('q-1'),
  status: 'correct',
});
assert.equal(
  studentRunnerView.itemViewsById.get('pair-1')?.status,
  'needs-review'
);
assert.equal(studentRunnerView.itemViewsById.get('pair-1')?.kindLabel, 'Pair');
assert.equal(studentRunnerView.itemViewsById.get('pair-2')?.answered, false);
const choicePairingRunnerView = buildChoicePairingRunnerView({
  answers: { 'pair-1': 'Cold', 'q-1': 'Paris' },
  items: studentRunnerView.itemViews.map((itemView) => itemView.item),
  progressVerb: 'matched',
  selectedItemId: 'pair-2',
});
assert.equal(choicePairingRunnerView.progressLabel, '2/3 matched');
assert.deepEqual(
  choicePairingRunnerView.promptItemViews.map((itemView) => [
    itemView.item.id,
    itemView.promptLabel,
    itemView.selected,
  ]),
  [
    ['q-1', '1. Capital of France?', false],
    ['pair-1', '2. Match "Hot" with its pair.', false],
    ['pair-2', '3. Match "Up" with its pair.', true],
  ]
);
assert.deepEqual(choicePairingRunnerView.choiceViews, [
  { choice: 'Paris', selected: false, usedByItemId: 'q-1' },
  { choice: 'Lyon', selected: false, usedByItemId: undefined },
  { choice: 'Cold', selected: false, usedByItemId: 'pair-1' },
  { choice: 'Warm', selected: false, usedByItemId: undefined },
  { choice: 'North', selected: false, usedByItemId: undefined },
  { choice: 'South', selected: false, usedByItemId: undefined },
]);
const groupSortRunnerView = buildStudentRunnerView({
  answers: {
    'group-drink-water': 'drink',
    'group-fruit-apple': ' Ｆｒｕｉｔ ',
  },
  items: [
    {
      choices: ['Fruit', 'Drink'],
      id: 'group-fruit-apple',
      kind: 'group-item',
      prompt: 'Apple',
    },
    {
      choices: ['Fruit', 'Drink'],
      id: 'group-drink-water',
      kind: 'group-item',
      prompt: 'Water',
    },
    {
      choices: ['Fruit', 'Drink'],
      id: 'group-fruit-pear',
      kind: 'group-item',
      prompt: 'Pear',
    },
  ],
  progressVerb: 'sorted',
});
assert.equal(groupSortRunnerView.progressLabel, '2/3 sorted');
assert.deepEqual(groupSortRunnerView.choices, ['Fruit', 'Drink']);
assert.deepEqual(
  groupSortRunnerView.itemViews
    .filter((itemView) => isSameRuntimeChoice(itemView.answer, 'Fruit'))
    .map((itemView) => itemView.item.id),
  ['group-fruit-apple']
);
assert.deepEqual(
  groupSortRunnerView.itemViews
    .filter((itemView) => isSameRuntimeChoice(itemView.answer, 'Drink'))
    .map((itemView) => itemView.item.id),
  ['group-drink-water']
);
const groupSortBoardView = buildGroupSortRunnerView({
  answers: {
    'group-drink-water': 'drink',
    'group-fruit-apple': ' Ｆｒｕｉｔ ',
  },
  items: groupSortRunnerView.itemViews.map((itemView) => itemView.item),
  progressVerb: 'sorted',
  selectedItemId: 'group-fruit-pear',
});
assert.equal(groupSortBoardView.selectedItem?.id, 'group-fruit-pear');
assert.deepEqual(
  groupSortBoardView.unplacedItemViews.map((itemView) => itemView.item.id),
  ['group-fruit-pear']
);
assert.deepEqual(
  groupSortBoardView.unplacedItemViews.map((itemView) => [
    itemView.item.id,
    itemView.selected,
  ]),
  [['group-fruit-pear', true]]
);
assert.deepEqual(
  groupSortBoardView.groupViews.map(({ group, placedItemViews }) => [
    group,
    placedItemViews.map((itemView) => itemView.item.id),
  ]),
  [
    ['Fruit', ['group-fruit-apple']],
    ['Drink', ['group-drink-water']],
  ]
);
assert.deepEqual(
  groupSortBoardView.groupViews.map(({ group, placedItemViews }) => [
    group,
    placedItemViews.map((itemView) => [itemView.item.id, itemView.selected]),
  ]),
  [
    ['Fruit', [['group-fruit-apple', false]]],
    ['Drink', [['group-drink-water', false]]],
  ]
);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
    runtimeItems: [
      {
        answer: 'Paris / Paris, France',
        explanation: 'Paris is the capital of France.',
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
    ],
    showCorrectAnswers: false,
  }),
  []
);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
    runtimeItems: [
      {
        answer: 'Paris / Paris, France',
        explanation: 'Paris is the capital of France.',
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
    ],
    showCorrectAnswers: true,
  }),
  [
    {
      acceptedAnswers: ['Paris', 'Paris, France'],
      correct: true,
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital of France.',
      itemId: 'q-1',
      submitted: true,
    },
  ]
);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [{ answer: 'paris', correct: true, itemId: 'messy-q-1' }],
    runtimeItems: [
      {
        answer: ' Paris / Ｐａｒｉｓ / Paris, France ',
        explanation: '  France capital.  ',
        id: 'messy-q-1',
        kind: 'question',
        prompt: 'Capital?',
      },
    ],
    showCorrectAnswers: true,
  }),
  [
    {
      acceptedAnswers: ['Paris', 'Paris, France'],
      correct: true,
      correctAnswer: 'Paris',
      explanation: 'France capital.',
      itemId: 'messy-q-1',
      submitted: true,
    },
  ]
);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [
      { answer: 'paris', correct: true, itemId: ' ｍｅｓｓｙ－ｑ－１ ' },
    ],
    runtimeItems: [
      {
        answer: 'Paris',
        id: 'messy-q-1',
        kind: 'question',
        prompt: 'Capital?',
      },
    ],
    showCorrectAnswers: true,
  }),
  [
    {
      acceptedAnswers: ['Paris'],
      correct: true,
      correctAnswer: 'Paris',
      explanation: undefined,
      itemId: 'messy-q-1',
      submitted: true,
    },
  ]
);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [{ answer: '\u00A0　\t', correct: false, itemId: 'q-1' }],
    runtimeItems: [
      {
        answer: 'Paris',
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
    ],
    showCorrectAnswers: true,
  }),
  [
    {
      acceptedAnswers: ['Paris'],
      correct: false,
      correctAnswer: 'Paris',
      explanation: undefined,
      itemId: 'q-1',
      submitted: false,
    },
  ]
);
const partialPublicReviewItems = buildPublicAttemptReviewItems({
  answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
  runtimeItems: [
    {
      answer: 'Paris / Paris, France',
      explanation: 'Paris is the capital of France.',
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
    {
      answer: 'Cold',
      choices: ['Cold', 'Warm'],
      id: 'pair-1',
      kind: 'pair',
      prompt: 'Hot',
    },
  ],
  showCorrectAnswers: true,
});
assert.deepEqual(partialPublicReviewItems, [
  {
    acceptedAnswers: ['Paris', 'Paris, France'],
    correct: true,
    correctAnswer: 'Paris',
    explanation: 'Paris is the capital of France.',
    itemId: 'q-1',
    submitted: true,
  },
  {
    acceptedAnswers: ['Cold'],
    correct: false,
    correctAnswer: 'Cold',
    explanation: undefined,
    itemId: 'pair-1',
    submitted: false,
  },
]);
const publicReviewItemsWithPrivateFields = buildPublicAttemptReviewItems({
  answers: [
    {
      answer: 'Paris',
      correct: true,
      itemId: 'q-private-review',
      reviewerNotes: 'teacher-only note',
      storageKey: 'teacher-only/answer',
    } satisfies AttemptAnswer & {
      reviewerNotes: string;
      storageKey: string;
    },
  ],
  runtimeItems: [
    {
      acceptedAnswers: ['Paris', 'Paris, France'],
      answer: 'Paris / Paris, France',
      explanation: 'Paris is the capital of France.',
      id: 'q-private-review',
      kind: 'question',
      prompt: 'Capital of France?',
      sourceMaterials: [listeningMaterialReference],
      storageKey: 'teacher-only/runtime',
    } satisfies RuntimeItem & {
      acceptedAnswers: string[];
      sourceMaterials: unknown[];
      storageKey: string;
    },
  ],
  showCorrectAnswers: true,
});
assert.deepEqual(Object.keys(publicReviewItemsWithPrivateFields[0]!).sort(), [
  'acceptedAnswers',
  'correct',
  'correctAnswer',
  'explanation',
  'itemId',
  'submitted',
]);
assert.deepEqual(publicReviewItemsWithPrivateFields, [
  {
    acceptedAnswers: ['Paris', 'Paris, France'],
    correct: true,
    correctAnswer: 'Paris',
    explanation: 'Paris is the capital of France.',
    itemId: 'q-private-review',
    submitted: true,
  },
]);
assert.equal(
  'sourceMaterials' in publicReviewItemsWithPrivateFields[0]!,
  false
);
assert.equal('storageKey' in publicReviewItemsWithPrivateFields[0]!, false);
assert.equal('reviewerNotes' in publicReviewItemsWithPrivateFields[0]!, false);
assert.equal(
  buildStudentRunnerView({
    answers: { 'q-1': 'Paris' },
    items: [
      {
        choices: ['Paris', 'Rome'],
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
      {
        choices: ['Cold', 'Warm'],
        id: 'pair-1',
        kind: 'pair',
        prompt: 'Hot',
      },
    ],
    reviewItems: partialPublicReviewItems,
  }).itemViewsById.get('pair-1')?.status,
  'idle'
);
const publicRuntimeItem = stripRuntimeAnswer({
  answer: 'Paris',
  choices: ['Paris', 'Rome'],
  explanation: 'Paris is the capital of France.',
  id: 'q-1',
  kind: 'question',
  prompt: 'Capital of France?',
});
assert.deepEqual(publicRuntimeItem, {
  choices: ['Paris', 'Rome'],
  id: 'q-1',
  kind: 'question',
  prompt: 'Capital of France?',
});
assert.equal('answer' in publicRuntimeItem, false);
assert.equal('explanation' in publicRuntimeItem, false);
const publicRuntimeItemWithPrivateFields = stripRuntimeAnswer({
  acceptedAnswers: ['Paris', 'Paris, France'],
  answer: 'Paris',
  choices: ['Paris', 'Rome'],
  explanation: 'Paris is the capital of France.',
  id: 'q-private',
  kind: 'question',
  prompt: 'Capital of France?',
  sourceMaterials: [listeningMaterialReference],
  storageKey: 'teacher-only/key',
} satisfies RuntimeItem & {
  acceptedAnswers: string[];
  sourceMaterials: unknown[];
  storageKey: string;
});
assert.deepEqual(Object.keys(publicRuntimeItemWithPrivateFields).sort(), [
  'choices',
  'id',
  'kind',
  'prompt',
]);
assert.equal('acceptedAnswers' in publicRuntimeItemWithPrivateFields, false);
assert.equal('sourceMaterials' in publicRuntimeItemWithPrivateFields, false);
assert.equal('storageKey' in publicRuntimeItemWithPrivateFields, false);
const runtimeChoiceSource = ['Paris', 'Rome'];
const clonedPublicRuntimeItem = stripRuntimeAnswer({
  answer: 'Paris',
  choices: runtimeChoiceSource,
  id: 'q-1',
  kind: 'question',
  prompt: 'Capital of France?',
});
assert.notStrictEqual(clonedPublicRuntimeItem.choices, runtimeChoiceSource);
runtimeChoiceSource.push('Lyon');
assert.deepEqual(clonedPublicRuntimeItem.choices, ['Paris', 'Rome']);
assert.deepEqual(
  stripRuntimeAnswers([
    {
      answer: 'Paris',
      explanation: 'Paris is the capital of France.',
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
  ]),
  [
    {
      choices: undefined,
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
  ]
);
const createdActivities = [
  {
    id: 'activity-1',
    templateType: 'quiz',
    title: 'Food words',
    visibility: 'draft',
  },
  {
    id: 'activity-2',
    templateType: 'group-sort',
    title: 'Material groups',
    visibility: 'private',
  },
] as const;
assert.deepEqual(
  findCreatedActivityInList({
    activityId: 'activity-2',
    items: createdActivities,
  }),
  createdActivities[1]
);
assert.equal(
  findCreatedActivityInList({
    activityId: 'missing',
    items: createdActivities,
  }),
  undefined
);
const createdActivityFromLookup = {
  id: 'activity-3',
  templateType: 'line-match',
  title: 'Definition lines',
  visibility: 'draft',
} as const;
const archivedCreatedActivity = {
  id: 'activity-4',
  templateType: 'quiz',
  title: 'Archived words',
  visibility: 'archived',
} as const;
assert.deepEqual(
  resolveCreatedActivityPanelActivity({
    activity: createdActivityFromLookup,
    activityId: 'activity-3',
    items: createdActivities,
  }),
  createdActivityFromLookup
);
assert.deepEqual(
  resolveCreatedActivityPanelActivity({
    activity: createdActivityFromLookup,
    activityId: 'activity-2',
    items: createdActivities,
  }),
  createdActivities[1]
);
assert.equal(
  resolveCreatedActivityPanelActivity({
    activity: createdActivityFromLookup,
    activityId: undefined,
    items: createdActivities,
  }),
  undefined
);
assert.deepEqual(
  buildCreatedActivityPanelContext({
    activity: createdActivities[1],
    isLoading: false,
  }),
  {
    activity: createdActivities[1],
    body: 'Review the structured content, keep building the library, or publish it from the activity card when you are ready to share it with students.',
    showCreateAction: true,
    showDismissAction: true,
    showEditAction: true,
    showMissingHint: false,
    showPublishAction: true,
    status: 'found',
    title: 'Material groups',
  }
);
assert.equal(
  buildCreatedActivityPanelContext({
    activity: archivedCreatedActivity,
    isLoading: false,
  }).showPublishAction,
  false
);
assert.deepEqual(
  buildCreatedActivityPanelContext({
    activity: undefined,
    isLoading: true,
  }),
  {
    body: 'Loading the newly saved activity and next classroom actions.',
    showCreateAction: true,
    showDismissAction: true,
    showEditAction: false,
    showMissingHint: false,
    showPublishAction: false,
    status: 'loading',
    title: 'New activity is being added to your library.',
  }
);
assert.deepEqual(
  buildCreatedActivityPanelContext({
    activity: undefined,
    isLoading: false,
  }),
  {
    body: 'The activity was saved, but it is not visible in the current list view yet. Filters or pagination may be hiding it.',
    showCreateAction: true,
    showDismissAction: true,
    showEditAction: false,
    showMissingHint: true,
    showPublishAction: false,
    status: 'missing',
    title: 'Activity saved to your library.',
  }
);
assert.equal(normalizeActivityLibrarySearch('  word   match  '), 'word match');
assert.equal(normalizeActivityLibrarySearch('  Ｇｒｏｕｐ   １  '), 'Group 1');
assert.equal(normalizeActivityLibrarySearch('   '), undefined);
assert.equal(
  buildSqlLikeContainsPattern('100%_ \\ review'),
  String.raw`%100\%\_ \\ review%`
);
assert.deepEqual(
  buildActivityLibraryValidatedSearch({
    created: ' activity-1 ',
    page: '4',
    q: '  Ｇｒｏｕｐ   １  ',
    source: 'worksheet',
    status: 'archived',
    template: 'group-sort',
  }),
  {
    created: 'activity-1',
    page: 4,
    q: 'Group 1',
    source: 'worksheet',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.deepEqual(
  buildActivityLibraryValidatedSearch({
    created: '   ',
    page: '1',
    q: '   ',
    source: 'video',
    status: 'deleted',
    template: 'flashcards',
  }),
  {
    created: undefined,
    page: undefined,
    q: undefined,
    source: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 1,
    q: '  word   match  ',
    source: 'all',
    status: 'active',
    template: 'all',
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: 'word match',
    source: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 3,
    q: ' sort ',
    source: 'audio',
    status: 'archived',
    template: 'group-sort',
  }),
  {
    created: 'activity-1',
    page: 3,
    q: 'sort',
    source: 'audio',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 2,
    q: ' valid ',
    source: 'video',
    status: 'deleted',
    template: 'flashcards',
  } as never),
  {
    created: 'activity-1',
    page: 2,
    q: 'valid',
    source: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryPageRouteSearch({
    current: {
      created: 'activity-1',
      q: '  word   match  ',
      source: 'all',
      status: 'active',
      template: 'all',
    },
    page: 0,
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: 'word match',
    source: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryPageRouteSearch({
    current: {
      created: 'activity-1',
      q: ' sort ',
      source: 'spreadsheet',
      status: 'archived',
      template: 'group-sort',
    },
    page: 5,
  }),
  {
    created: 'activity-1',
    page: 5,
    q: 'sort',
    source: 'spreadsheet',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.deepEqual(
  buildActivityLibraryFilterRouteSearch({
    created: 'activity-1',
    current: {
      q: 'old search',
      source: 'audio',
      status: 'archived',
      template: 'quiz',
    },
    next: {
      q: '  Ｎｅｗ   search  ',
      source: 'worksheet',
    },
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: 'New search',
    source: 'worksheet',
    status: 'archived',
    template: 'quiz',
  }
);
assert.deepEqual(
  buildActivityLibraryFilterRouteSearch({
    created: 'activity-1',
    current: {
      q: 'old search',
      source: 'audio',
      status: 'archived',
      template: 'quiz',
    },
    next: {
      q: '',
      source: 'all',
      status: 'active',
      template: 'all',
    },
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: undefined,
    source: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryDismissCreatedRouteSearch({
    current: {
      page: 1,
      q: '  word   match  ',
      source: 'all',
      status: 'active',
      template: 'all',
    },
  }),
  {
    created: undefined,
    page: undefined,
    q: 'word match',
    source: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryDismissCreatedRouteSearch({
    current: {
      page: 3,
      q: 'group',
      source: 'spreadsheet',
      status: 'archived',
      template: 'group-sort',
    },
  }),
  {
    created: undefined,
    page: 3,
    q: 'group',
    source: 'spreadsheet',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.equal(parseActivityLibraryStatus('archived'), 'archived');
assert.equal(parseActivityLibraryStatus('deleted'), undefined);
assert.equal(parseActivitySourceMaterialFilter('extractable'), 'extractable');
assert.equal(parseActivitySourceMaterialFilter('worksheet'), 'worksheet');
assert.equal(parseActivitySourceMaterialFilter('video'), undefined);
assert.equal(parseActivityTemplateFilter('group-sort'), 'group-sort');
assert.equal(parseActivityTemplateFilter('flashcards'), undefined);
assert.equal(parseCreateActivityTemplateSearch('line-match'), 'line-match');
assert.equal(parseCreateActivityTemplateSearch('worksheet'), undefined);
assert.equal(parseCreateActivityTemplateSearch(['quiz']), undefined);
assert.equal(isActivityTemplateType('open-box'), true);
assert.equal(isActivityTemplateType('memory-game'), false);
assert.equal(ACTIVITY_LIBRARY_PAGE_SIZE, 12);
assert.deepEqual(ACTIVITY_LIBRARY_INPUT_LIMITS, {
  createdActivityIdMaxLength: 80,
  idMinLength: 1,
  pageSizeMax: 100,
  pageSizeMin: 1,
  searchMaxLength: 120,
});
assert.deepEqual(ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS, {
  lockedTemplateDiagnostics: 2,
  remixActionOptions: 3,
});
assert.deepEqual(APP_ENTITY_ID_LENGTH, { generated: 16 });
assert.deepEqual(ACTIVITY_STABLE_ID_LENGTH, { max: 40 });
assert.equal(
  makeActivityStableId('A'.repeat(ACTIVITY_STABLE_ID_LENGTH.max + 5)).length,
  ACTIVITY_STABLE_ID_LENGTH.max
);
assert.deepEqual(ACTIVITY_LIBRARY_STATUSES, ['active', 'archived']);
assert.deepEqual(ACTIVITY_SOURCE_MATERIAL_FILTERS, [
  'all',
  'audio',
  'extractable',
  'spreadsheet',
  'worksheet',
]);
assert.equal(getActivityLibraryTotalPages({ pageSize: 12, total: 31 }), 3);
assert.equal(getActivityLibraryTotalPages({ pageSize: 0, total: 31 }), 3);
assert.equal(getActivityLibraryTotalPages({ pageSize: 12, total: 0 }), 1);
assert.equal(getActivityLibraryTotalPages({ pageSize: 12, total: -3 }), 1);
assert.equal(getActivityLibraryTotalPages({ pageSize: 12, total: 12.9 }), 1);
const activityLibraryPageItems = [
  { id: 'oldest', updatedAt: new Date('2026-01-01T00:00:00.000Z') },
  { id: 'newest', updatedAt: new Date('2026-01-03T00:00:00.000Z') },
  { id: 'middle', updatedAt: new Date('2026-01-02T00:00:00.000Z') },
];
assert.deepEqual(
  getActivityLibraryPageItems({
    items: activityLibraryPageItems,
    pageIndex: 0,
    pageSize: 2,
  }).map((item) => item.id),
  ['newest', 'middle']
);
assert.deepEqual(
  getActivityLibraryPageItems({
    items: activityLibraryPageItems,
    pageIndex: 1,
    pageSize: 2,
  }).map((item) => item.id),
  ['oldest']
);
assert.deepEqual(
  activityLibraryPageItems.map((item) => item.id),
  ['oldest', 'newest', 'middle']
);
const sourceMaterialFilterBaseContent = buildActivityContent({
  description: 'Source filter fixture',
  difficulty: 'starter',
  gradeBand: 'Primary',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer source filter questions.',
  pairsText: '',
  questionsText: 'Capital of France? | Paris',
  sourceSummary: 'Source filter notes',
  subject: 'Geography',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Source filter',
  visibility: 'draft',
  vocabularyText: '',
});
const sourceMaterialFilterContent = {
  ...sourceMaterialFilterBaseContent,
  sourceMaterials: [
    listeningMaterialReference,
    {
      fileId: 'file-sheet-filter',
      kind: 'spreadsheet',
      originalName: 'filter words.xlsx',
    },
    {
      fileId: 'file-worksheet-filter',
      kind: 'worksheet-image',
      originalName: 'filter worksheet.png',
    },
  ],
};
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterContent,
    source: 'all',
  }),
  true
);
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterContent,
    source: 'audio',
  }),
  true
);
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterContent,
    source: 'extractable',
  }),
  true
);
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterContent,
    source: 'spreadsheet',
  }),
  true
);
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterContent,
    source: 'worksheet',
  }),
  true
);
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterBaseContent,
    source: 'extractable',
  }),
  false
);
assert.equal(
  matchesActivitySourceMaterialFilter({
    content: sourceMaterialFilterBaseContent,
    source: 'worksheet',
  }),
  false
);
const activityLibrarySourceItems = [
  { contentJson: sourceMaterialFilterContent, id: 'with-sources' },
  { contentJson: sourceMaterialFilterBaseContent, id: 'without-sources' },
];
assert.deepEqual(
  filterActivityLibrarySourceItems({
    items: activityLibrarySourceItems,
    source: 'worksheet',
  }).map((item) => item.id),
  ['with-sources']
);
assert.deepEqual(
  filterActivityLibrarySourceItems({
    items: activityLibrarySourceItems,
    source: 'all',
  }).map((item) => item.id),
  ['with-sources', 'without-sources']
);
assert.equal(canArchiveActivity('draft'), true);
assert.equal(canArchiveActivity('archived'), false);
assert.equal(canRestoreActivity('archived'), true);
assert.equal(canRestoreActivity('draft'), false);
assert.doesNotThrow(() => assertActivityCanArchive('private'));
assert.throws(
  () => assertActivityCanArchive('archived'),
  /This activity is already archived\./
);
assert.doesNotThrow(() => assertActivityCanRestore('archived'));
assert.throws(
  () => assertActivityCanRestore('draft'),
  /Only archived activities can be restored\./
);
const activityValidationSource = readFileSync(
  'src/activities/validation.ts',
  'utf8'
);
assert.match(
  activityValidationSource,
  /activityDifficultySchema = z\.enum\(ACTIVITY_DIFFICULTIES\)/,
  'Activity difficulty schema should reuse the activity-domain difficulty values.'
);
assert.match(
  activityValidationSource,
  /activityVisibilitySchema = z\.enum\(ACTIVITY_CREATABLE_VISIBILITIES\)/,
  'Activity creation visibility schema should reuse creatable visibility values.'
);
assert.match(
  activityValidationSource,
  /activityPersistedVisibilitySchema = z\.enum\(\s*ACTIVITY_PERSISTED_VISIBILITIES\s*\)/,
  'Activity persisted visibility schema should reuse persisted visibility values.'
);
assert.match(
  activityValidationSource,
  /title: z[\s\S]*ACTIVITY_TITLE_LENGTH\.min[\s\S]*ACTIVITY_TITLE_LENGTH\.max/,
  'Activity title schema should reuse the activity-domain title length range.'
);
assert.match(
  activityValidationSource,
  /description:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.descriptionMaxLength[\s\S]*gradeBand:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.gradeBandMinLength[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.gradeBandMaxLength[\s\S]*groupsText:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.groupsTextMaxLength/,
  'Activity editor schema should reuse field limits for overview and group inputs.'
);
assert.match(
  activityValidationSource,
  /language:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.languageMinLength[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.languageMaxLength[\s\S]*learningGoal:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.learningGoalMinLength[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.learningGoalMaxLength/,
  'Activity editor schema should reuse field limits for language and learning goal inputs.'
);
assert.match(
  activityValidationSource,
  /pairsText:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.pairsTextMaxLength[\s\S]*questionsText:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.questionsTextMaxLength[\s\S]*sourceSummary:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.sourceSummaryMaxLength/,
  'Activity editor schema should reuse field limits for structured source inputs.'
);
assert.match(
  activityValidationSource,
  /subject:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.subjectMinLength[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.subjectMaxLength[\s\S]*teacherNotesText:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.teacherNotesTextMaxLength[\s\S]*vocabularyText:[\s\S]*ACTIVITY_EDITOR_FIELD_LIMITS\.vocabularyTextMaxLength/,
  'Activity editor schema should reuse field limits for subject, notes, and vocabulary inputs.'
);
assert.doesNotMatch(
  activityValidationSource,
  /z\.enum\(\[\s*'starter'/,
  'Activity difficulty schema should not maintain local difficulty values.'
);
assert.doesNotMatch(
  activityValidationSource,
  /activityVisibilitySchema = z\.enum\(\[\s*'draft'/,
  'Activity creation visibility schema should not maintain local visibility values.'
);
assert.doesNotMatch(
  activityValidationSource,
  /title: z\.string\(\)\.trim\(\)\.min\(3\)\.max\(120\)/,
  'Activity title schema should not maintain local title length values.'
);
assert.doesNotMatch(
  activityValidationSource,
  /description: z\.string\(\)\.trim\(\)\.max\(400\)/,
  'Activity description schema should not maintain a local field length.'
);
assert.doesNotMatch(
  activityValidationSource,
  /questionsText: z\.string\(\)\.max\(6000\)/,
  'Activity question text schema should not maintain a local field length.'
);
assert.doesNotMatch(
  activityValidationSource,
  /teacherNotesText: z\.string\(\)\.max\(2000\)/,
  'Activity notes schema should not maintain a local field length.'
);
const activityStableIdSource = readFileSync(
  'src/activities/stable-id.ts',
  'utf8'
);
assert.match(
  activityStableIdSource,
  /ACTIVITY_STABLE_ID_LENGTH[\s\S]*max: 40/,
  'Activity stable ids should expose their maximum length as a named domain constant.'
);
assert.match(
  activityStableIdSource,
  /slice\(0, ACTIVITY_STABLE_ID_LENGTH\.max\)/,
  'Activity stable id generation should reuse the stable-id length constant.'
);
assert.doesNotMatch(
  activityStableIdSource,
  /slice\(0, 40\)/,
  'Activity stable id generation should not keep a local maximum length.'
);
const activitiesApiSource = readFileSync('src/api/activities.ts', 'utf8');
const createActivityApiSource = getSourceSlice(
  activitiesApiSource,
  'export const createActivity',
  'const duplicateActivityInputSchema'
);
const duplicateActivityApiSource = getSourceSlice(
  activitiesApiSource,
  'export const duplicateActivity',
  'const remixActivityTemplateInputSchema'
);
const remixActivityApiSource = getSourceSlice(
  activitiesApiSource,
  'export const remixActivityTemplate',
  'const updateActivityInputSchema'
);
const updateActivityApiSource = getSourceSlice(
  activitiesApiSource,
  'export const updateActivity',
  'const updateActivityVisibilityInputSchema'
);
const updateActivityVisibilityApiSource = getSourceSlice(
  activitiesApiSource,
  'async function updateActivityVisibility',
  ''
);
const activityLibraryQuerySource = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const activityPersistenceSource = readFileSync(
  'src/activities/persistence.ts',
  'utf8'
);
assert.match(
  activityLibraryQuerySource,
  /sqlLikeContains\(activity\.title, normalizedSearch\)/,
  'Activity list search should escape SQL LIKE wildcard characters in the activity query domain.'
);
assert.match(
  activitiesApiSource,
  /source: activityListSourceSchema\.default\('all'\)/,
  'Activity list API should accept a source-material filter with an all default.'
);
assert.match(
  activitiesApiSource,
  /z\.enum\(ACTIVITY_LIBRARY_STATUSES\)/,
  'Activity list API should reuse the activity-domain status filter values.'
);
assert.match(
  activitiesApiSource,
  /z\.enum\(ACTIVITY_SOURCE_MATERIAL_FILTERS\)/,
  'Activity list API should reuse the activity-domain source-material filter values.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /const activityListStatusSchema = z\.enum\(\[/,
  'Activity list API should not maintain a separate hand-written status filter enum.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /const activityListSourceSchema = z\.enum\(\[/,
  'Activity list API should not maintain a separate hand-written source-material filter enum.'
);
assert.match(
  activitiesApiSource,
  /buildActivityLibraryWhere\(\{[\s\S]*search: data\.search,[\s\S]*status: data\.status,[\s\S]*template: data\.template,[\s\S]*userId/,
  'Activity list API should delegate owner, status, template, and search where clauses to the activity domain.'
);
assert.match(
  activitiesApiSource,
  /getActivityLibraryPageItems\(\{[\s\S]*items: matchingActivities,[\s\S]*pageIndex: data\.pageIndex,[\s\S]*pageSize: data\.pageSize/,
  'Activity list API should delegate sorting and pagination to the activity domain.'
);
assert.match(
  activitiesApiSource,
  /filterActivityLibrarySourceItems\(\{[\s\S]*items: matchingRows,[\s\S]*source: data\.source/,
  'Activity list API should delegate source-material filtering to the activity domain.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /normalizeActivityLibrarySearch\(data\.search\)|sqlLikeContains\(activity\.title|const statusWhere|const templateWhere/,
  'Activity list API should not keep local search, status, or template where logic.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /matchesActivitySourceMaterialFilter|matchingRows\.filter/,
  'Activity list API should not keep local source-material filtering.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /\.sort\(\(a, b\) => b\.updatedAt\.getTime\(\) - a\.updatedAt\.getTime\(\)\)|\.slice\(\s*data\.pageIndex \* data\.pageSize/,
  'Activity list API should not keep local updated-at sorting or page slicing.'
);
assert.match(
  activityLibraryQuerySource,
  /filterActivityLibrarySourceItems[\s\S]*matchesActivitySourceMaterialFilter\({[\s\S]*content: item\.contentJson,[\s\S]*source/,
  'Activity list source-material filtering should live in the activity query domain.'
);
assert.equal(typeof buildCreatedActivityListItemSelect, 'function');
assert.match(
  activityLibraryQuerySource,
  /buildCreatedActivityListItemSelect[\s\S]*id: activity\.id[\s\S]*templateType: activity\.templateType[\s\S]*title: activity\.title[\s\S]*visibility: activity\.visibility/,
  'Created-activity list panel select shape should live in the activity query domain.'
);
assert.match(
  activitiesApiSource,
  /createdActivity[\s\S]*\.select\(buildCreatedActivityListItemSelect\(\)\)/,
  'Activity list API should reuse the created-activity panel select helper.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /createdActivity[\s\S]*id: activity\.id[\s\S]*templateType: activity\.templateType[\s\S]*title: activity\.title[\s\S]*visibility: activity\.visibility/,
  'Activity list API should not hand-write created-activity panel select fields.'
);
assert.match(
  activitiesApiSource,
  /summary: summarizeActivityLibrary\(matchingActivities\)/,
  'Activity list summary should reflect source-material filtered activities.'
);
assert.match(
  activitiesApiSource,
  /default\(ACTIVITY_LIBRARY_PAGE_SIZE\)/,
  'Activity list API should default page size through the activity-domain pagination constant.'
);
assert.match(
  activitiesApiSource,
  /createdActivityId:[\s\S]*ACTIVITY_LIBRARY_INPUT_LIMITS\.idMinLength[\s\S]*ACTIVITY_LIBRARY_INPUT_LIMITS\.createdActivityIdMaxLength/,
  'Activity list API should reuse activity-domain limits for created activity ids.'
);
assert.match(
  activitiesApiSource,
  /pageSize:[\s\S]*ACTIVITY_LIBRARY_INPUT_LIMITS\.pageSizeMin[\s\S]*ACTIVITY_LIBRARY_INPUT_LIMITS\.pageSizeMax/,
  'Activity list API should reuse activity-domain page-size input limits.'
);
assert.match(
  activitiesApiSource,
  /search:[\s\S]*ACTIVITY_LIBRARY_INPUT_LIMITS\.searchMaxLength/,
  'Activity list API should reuse the activity-domain search input limit.'
);
assert.match(
  activitiesApiSource,
  /nanoid\(APP_ENTITY_ID_LENGTH\.generated\)/,
  'Activity API generated ids should reuse the shared app entity id length.'
);
assert.equal(typeof buildActivityDetailOwnerWhere, 'function');
assert.match(
  activitiesApiSource,
  /getActivity[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId: data\.id, userId \}\)/,
  'Get activity API should load owner-scoped activity details through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /createActivity[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId: id, userId \}\)/,
  'Create activity API should reload the saved activity through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /duplicateActivity[\s\S]*buildActivityDetailOwnerWhere\(\{[\s\S]*activityId: data\.activityId,[\s\S]*userId,[\s\S]*\}\)/,
  'Duplicate activity API should load source activity through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /duplicateActivity[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId: id, userId \}\)/,
  'Duplicate activity API should reload derivative drafts through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /remixActivityTemplate[\s\S]*buildActivityDetailOwnerWhere\(\{[\s\S]*activityId: data\.activityId,[\s\S]*userId,[\s\S]*\}\)/,
  'Template remix API should load source activity through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /remixActivityTemplate[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId: id, userId \}\)/,
  'Template remix API should reload remixed drafts through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /updateActivity[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId: data\.id, userId \}\)/,
  'Update activity API should load owner-scoped activity details through the activity detail query helper.'
);
assert.match(
  activitiesApiSource,
  /updateActivityVisibility[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId, userId: ownerId \}\)/,
  'Archive and restore APIs should load owner-scoped activity details through the activity detail query helper.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /nanoid\(16\)|pageSize:[\s\S]*\.max\(100\)|search:[\s\S]*\.max\(120\)/,
  'Activity API should not keep local id or list input limits.'
);
assert.doesNotMatch(
  activitiesApiSource,
  /and\(eq\(activity\.id, (?:data\.id|data\.activityId|activityId)\), eq\(activity\.ownerId, (?:userId|ownerId)\)\)|\.where\(eq\(activity\.id, id\)\)/,
  'Activity API should not keep local owner-scoped detail lookup rules.'
);
assert.doesNotMatch(
  activityLibraryQuerySource,
  /like\(activity\.title, `%\$\{search\}%`\)/,
  'Activity list search should not pass raw user text directly to LIKE.'
);
assert.match(
  activitiesApiSource,
  /assertActivityCanArchive\(row\.visibility\)/,
  'Archive activity API should enforce the activity lifecycle transition server-side.'
);
assert.match(
  activitiesApiSource,
  /assertActivityCanRestore\(row\.visibility\)/,
  'Restore activity API should enforce the activity lifecycle transition server-side.'
);
assert.match(
  activitiesApiSource,
  /export const duplicateActivity[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)/,
  'Duplicate activity API should block archived activities server-side.'
);
assert.match(
  activitiesApiSource,
  /export const remixActivityTemplate[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)/,
  'Template remix API should block archived activities server-side.'
);
assert.match(
  activitiesApiSource,
  /export const createActivity[\s\S]*buildActivityCreateInsert\(\{ id, input: data, now, userId \}\)/,
  'Create activity API should build insert payloads through the activity domain helper.'
);
assert.match(
  activitiesApiSource,
  /export const duplicateActivity[\s\S]*buildDuplicatedActivityInsert\(\{[\s\S]*sourceActivity,[\s\S]*userId/,
  'Duplicate activity API should build derivative insert payloads through the activity domain helper.'
);
assert.match(
  activitiesApiSource,
  /export const remixActivityTemplate[\s\S]*buildRemixedActivityInsert\(\{[\s\S]*sourceActivity,[\s\S]*targetTemplate,[\s\S]*userId/,
  'Template remix API should build derivative insert payloads through the activity domain helper.'
);
assert.match(
  activitiesApiSource,
  /export const updateActivity[\s\S]*buildActivityUpdateSet\(\{ input: data, now \}\)/,
  'Update activity API should build update payloads through the activity persistence helper.'
);
assert.match(
  updateActivityVisibilityApiSource,
  /buildActivityVisibilityUpdateSet\(\{ nextVisibility, updatedAt \}\)/,
  'Archive and restore APIs should build visibility update payloads through the activity persistence helper.'
);
assert.match(
  activityPersistenceSource,
  /buildActivityCreateInsert[\s\S]*contentJson: buildActivityContent\(input\)[\s\S]*description: normalizeActivityDescription\(input\.description\)[\s\S]*buildActivityUpdateSet[\s\S]*contentJson: buildActivityContent\(input\)[\s\S]*buildActivityVisibilityUpdateSet[\s\S]*visibility: nextVisibility[\s\S]*buildDuplicatedActivityInsert[\s\S]*cloneActivityContentForDerivative\(sourceActivity\.contentJson\)[\s\S]*buildRemixedActivityInsert[\s\S]*targetTemplate\.type/,
  'Activity persistence helpers should own create, edit, visibility, duplicate, and remix payload shapes.'
);
assert.doesNotMatch(
  createActivityApiSource,
  /description: data\.description\?\.trim\(\) \|\| null/,
  'Create activity API should not hand-write activity create insert payloads.'
);
assert.doesNotMatch(
  duplicateActivityApiSource,
  /contentJson: cloneActivityContentForDerivative|title: buildDuplicatedActivityTitle/,
  'Duplicate activity API should not hand-write derivative insert payloads.'
);
assert.doesNotMatch(
  remixActivityApiSource,
  /contentJson: cloneActivityContentForDerivative|title: buildRemixedActivityTitle/,
  'Activity API should not hand-write activity create, duplicate, or remix insert payloads.'
);
assert.doesNotMatch(
  updateActivityApiSource,
  /contentJson: content|description: data\.description\?\.trim\(\) \|\| null|templateType: data\.templateType|visibility: data\.visibility/,
  'Update activity API should not hand-write activity edit update payloads.'
);
assert.doesNotMatch(
  updateActivityVisibilityApiSource,
  /\.set\(\{[\s\S]*visibility: nextVisibility/,
  'Archive and restore APIs should not hand-write visibility update payloads.'
);
assert.match(
  activitiesApiSource,
  /export const updateActivity[\s\S]*assertActivityCanEdit\(existingActivity\.visibility\)/,
  'Update activity API should block edits to archived activities server-side.'
);
const useActivitiesSource = readFileSync('src/hooks/use-activities.ts', 'utf8');
assert.match(
  useActivitiesSource,
  /pageSize = ACTIVITY_LIBRARY_PAGE_SIZE/,
  'useActivities should default page size through the activity-domain pagination constant.'
);
assert.match(
  useActivitiesSource,
  /source\?: ActivitySourceMaterialFilter/,
  'useActivities should expose source-material filtering to route callers.'
);
assert.match(
  useActivitiesSource,
  /queryKey: activitiesKeys\.list\({[\s\S]*source,[\s\S]*}\)/,
  'useActivities query key should include the source-material filter.'
);
const dashboardActivitiesRouteSource = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const activityLibrarySearchComponentSource = readFileSync(
  'src/components/activities/activity-library-search.tsx',
  'utf8'
);
const activityLibraryCardComponentSource = readFileSync(
  'src/components/activities/activity-library-card.tsx',
  'utf8'
);
const activityLibrarySummaryCardComponentSource = readFileSync(
  'src/components/activities/activity-library-summary-card.tsx',
  'utf8'
);
const createdActivityPanelComponentSource = readFileSync(
  'src/components/activities/created-activity-panel.tsx',
  'utf8'
);
assert.match(
  dashboardActivitiesRouteSource,
  /const \{ created, page, q, source, status, template \} = Route\.useSearch\(\)/,
  'Activity library route should read the source-material filter from URL search.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /source: sourceFilter/,
  'Activity library route should pass the source-material filter to list queries and preserve it in pagination.'
);
assert.match(
  activityLibrarySearchComponentSource,
  /id="activity-source-filter"/,
  'Activity library search component should render a source-material filter control.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /onSourceChange=\{\(value\) =>[\s\S]*updateLibraryFilters\(\{ source: value \}\)/,
  'Activity library source-material filter control should update route filters.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /buildActivityLibraryPageViewModel/,
  'Activity dashboard route should consume the activity-domain page view-model.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /activePageView\.starterPreview\.activities/,
  'Activity dashboard route should render starter cards from the activity-domain preview view-model.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /buildActivityLibraryFilterRouteSearch/,
  'Activity dashboard route should update filters through the activity-domain filter route helper.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /buildActivityLibraryDismissCreatedRouteSearch/,
  'Activity dashboard route should dismiss created-panel state through the activity-domain route helper.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /ActivityLibrarySearch/,
  'Activity dashboard route should delegate filter controls to the activity library search component.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /ActivityLibraryCard/,
  'Activity dashboard route should delegate activity card rendering to the activity library card component.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /ActivityLibrarySummaryCard/,
  'Activity dashboard route should delegate summary metric rendering to the activity library summary card component.'
);
assert.match(
  dashboardActivitiesRouteSource,
  /CreatedActivityPanel/,
  'Activity dashboard route should delegate the saved-activity panel to a focused component.'
);
assert.match(
  activityLibrarySearchComponentSource,
  /buildActivityLibrarySearchPanelView/,
  'Activity library search component should render filter summary and filter options from the activity-domain search panel view.'
);
assert.match(
  activityLibraryCardComponentSource,
  /buildActivityLibraryCardDisplayView/,
  'Activity library card component should render card display state from the activity-domain card display view.'
);
assert.match(
  activityLibraryCardComponentSource,
  /cardDisplayView\.actionView\.(?:remix|duplicate|archive|restore)/,
  'Activity library card component should use card action copy and gates from the activity-domain card display view.'
);
assert.match(
  activityLibraryCardComponentSource,
  /cardDisplayView\.sourceMaterials\.kindBadges[\s\S]*badge\.summaryText[\s\S]*cardDisplayView\.sourceMaterials\.extractionActions[\s\S]*action\.summaryText/,
  'Activity library card component should render prepared source-material badge and extraction summary text.'
);
assert.doesNotMatch(
  activityLibraryCardComponentSource,
  /\{(?:badge|action)\.label\}/,
  'Activity library card component should not drop source-material counts by rendering raw source-material labels.'
);
assert.match(
  activityLibrarySummaryCardComponentSource,
  /ActivityLibrarySummaryMetricId/,
  'Activity library summary card component should map icons by the activity-domain metric id.'
);
assert.match(
  createdActivityPanelComponentSource,
  /buildCreatedActivityPanelContext/,
  'Created activity panel component should render saved-activity state from the activity-domain panel context.'
);
assert.doesNotMatch(
  dashboardActivitiesRouteSource,
  /buildActivityLibrarySearchPanelView|activityLibrarySearchCopy|NativeSelect|NativeSelectOption|id="activity-source-filter"/,
  'Activity dashboard route should not own activity library search-control rendering details.'
);
assert.doesNotMatch(
  dashboardActivitiesRouteSource,
  /buildActivityLibraryCardDisplayView|buildCreatedActivityPanelContext|cardDisplayView|useArchiveActivity|useDuplicateActivity|useRemixActivityTemplate|useRestoreActivity/,
  'Activity dashboard route should not own activity card actions or saved-panel rendering details.'
);
assert.doesNotMatch(
  dashboardActivitiesRouteSource,
  /function (?:ActivityCard|CreatedActivityPanel|ActivityStat|ActivitySummaryCard)\(/,
  'Activity dashboard route should not keep local activity card, saved-panel, stat, or summary components.'
);
assert.doesNotMatch(
  dashboardActivitiesRouteSource,
  /getStarterActivities|getStarterActivity|getActivityTemplates|buildActivityLifecycleActionView|getActivityLifecycleActionCopy|buildActivityLibraryFilterSummary|normalizeActivityLibrarySearch|getActivityLibraryTotalPages|buildActivityLibrarySummaryMetrics|buildActivityLibraryEmptyStateView|resolveCreatedActivityPanelActivity/,
  'Activity dashboard route should not rebuild starter previews, template options, lifecycle action views, filter summaries, pagination, summary, empty state, or created panel lookup directly.'
);
assert.match(
  activityLibraryViewSource,
  /getActivityLibraryTotalPages\(\{[\s\S]*pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,[\s\S]*total: totalActivities,[\s\S]*\}\)/,
  'Activity library page view-model should calculate total pages through the activity-domain helper.'
);
assert.doesNotMatch(
  dashboardActivitiesRouteSource,
  /const ACTIVITY_LIBRARY_PAGE_SIZE = 12/,
  'Activity dashboard route should not maintain a local page-size constant.'
);
const assignmentsApiSource = readFileSync('src/api/assignments.ts', 'utf8');
const attemptAnswersSource = readFileSync(
  'src/assignments/attempt-answers.ts',
  'utf8'
);
const dashboardAssignmentsRouteSource = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const assignmentListFiltersComponentSource = readFileSync(
  'src/components/assignments/assignment-list-filters.tsx',
  'utf8'
);
const assignmentListCardComponentSource = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
const assignmentListSummaryCardComponentSource = readFileSync(
  'src/components/assignments/assignment-list-summary-card.tsx',
  'utf8'
);
const publishedAssignmentPanelComponentSource = readFileSync(
  'src/components/assignments/published-assignment-panel.tsx',
  'utf8'
);
const assignmentListViewSource = readFileSync(
  'src/assignments/list-view.ts',
  'utf8'
);
const assignmentListQuerySource = readFileSync(
  'src/assignments/list-query.ts',
  'utf8'
);
const assignmentDetailQuerySource = readFileSync(
  'src/assignments/detail-query.ts',
  'utf8'
);
const assignmentAttemptQuerySource = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const assignmentAttemptIdentityQuerySource = readFileSync(
  'src/assignments/attempt-identity-query.ts',
  'utf8'
);
const assignmentListApiSource = getSourceSlice(
  assignmentsApiSource,
  'export const listAssignments',
  'export const publishAssignment'
);
assert.match(
  assignmentsApiSource,
  /default\(ASSIGNMENT_LIST_PAGE_SIZE\)/,
  'Assignment list API should default page size through the assignment-domain pagination constant.'
);
assert.match(
  assignmentsApiSource,
  /pageSize:[\s\S]*ASSIGNMENT_LIST_INPUT_LIMITS\.pageSizeMin[\s\S]*ASSIGNMENT_LIST_INPUT_LIMITS\.pageSizeMax/,
  'Assignment list API should reuse assignment-domain page-size input limits.'
);
assert.match(
  assignmentsApiSource,
  /search:[\s\S]*ASSIGNMENT_LIST_INPUT_LIMITS\.searchMaxLength/,
  'Assignment list API should reuse the assignment-domain search input limit.'
);
assert.match(
  assignmentsApiSource,
  /nanoid\(APP_ENTITY_ID_LENGTH\.generated\)/,
  'Assignment and attempt APIs should reuse the shared app entity id length.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /nanoid\(16\)|pageSize:[\s\S]*\.max\(100\)|search:[\s\S]*\.max\(120\)/,
  'Assignment API should not keep local id or list input limits.'
);
assert.match(
  assignmentsApiSource,
  /assignmentShareSlugSchema[\s\S]*ASSIGNMENT_SHARE_SLUG_LENGTH\.min[\s\S]*ASSIGNMENT_SHARE_SLUG_LENGTH\.max/,
  'Assignment share-slug schema should reuse the assignment-domain slug length range.'
);
assert.match(
  assignmentsApiSource,
  /const shareSlug = nanoid\(ASSIGNMENT_SHARE_SLUG_LENGTH\.generated\)/,
  'Published assignment share slugs should reuse the generated slug length constant.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /\.pipe\(z\.string\(\)\.min\(1\)\.max\(80\)\)/,
  'Assignment share-slug schema should not keep local length bounds.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /const shareSlug = nanoid\(10\)/,
  'Published assignment share slugs should not keep a local generated length.'
);
assert.match(
  assignmentsApiSource,
  /ASSIGNMENT_LIFECYCLE_STATUS_FILTERS/,
  'Assignment list API should reuse the assignment-domain status filter values.'
);
assert.match(
  assignmentsApiSource,
  /z\.preprocess\(\s*parseAssignmentStatusFilter,\s*z\.enum\(ASSIGNMENT_LIFECYCLE_STATUS_FILTERS\)\.optional\(\)\s*\)/,
  'Assignment list API should parse status filters through assignment-domain helpers.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /const assignmentStatusFilterSchema = z\.enum\(\[/,
  'Assignment list API should not maintain a separate hand-written status filter enum.'
);
assert.match(
  assignmentListQuerySource,
  /sqlLikeContains\(assignment\.title, normalizedSearch\)/,
  'Assignment list search should escape SQL LIKE wildcard characters in the assignment query domain.'
);
assert.match(
  assignmentListQuerySource,
  /sqlLikeContains\(activity\.contentJson, normalizedSearch\)/,
  'Assignment list search should include current source activity structured text.'
);
assert.match(
  assignmentListQuerySource,
  /sqlLikeContains\(assignmentSnapshot\.contentJson, normalizedSearch\)/,
  'Assignment list search should include frozen assignment snapshot structured text.'
);
assert.doesNotMatch(
  assignmentListQuerySource,
  /like\(assignment\.title, `%\$\{normalizedSearch\}%`\)/,
  'Assignment list search should not pass raw user text directly to LIKE.'
);
assert.match(
  assignmentsApiSource,
  /buildAssignmentListWhere\(\{[\s\S]*search: data\.search,[\s\S]*status: data\.status,[\s\S]*userId/,
  'Assignment list API should delegate owner, status, and search filtering to the assignment query domain.'
);
assert.match(
  assignmentsApiSource,
  /getAssignmentListOffset\(\{[\s\S]*pageIndex: data\.pageIndex,[\s\S]*pageSize: data\.pageSize/,
  'Assignment list API should delegate pagination offset calculation to the assignment query domain.'
);
assert.match(
  assignmentListQuerySource,
  /buildAssignmentListOrderBy[\s\S]*desc\(assignment\.updatedAt\)/,
  'Assignment list ordering should live in the assignment query domain.'
);
assert.match(
  assignmentsApiSource,
  /orderBy\(buildAssignmentListOrderBy\(\)\)/,
  'Assignment list API should delegate updated-at ordering to the assignment query domain.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /function buildAssignmentListWhere|sqlLikeContains\(assignment\.title|normalizeAssignmentListSearch\(search\)/,
  'Assignment list API should not keep local search/status where-clause logic.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /data\.pageIndex \* data\.pageSize/,
  'Assignment list API should not keep local pagination offset math.'
);
assert.match(
  assignmentsApiSource,
  /const summaryAttempts = await db[\s\S]*\.select\(buildAssignmentAttemptStatsSelect\(\)\)[\s\S]*\.innerJoin\(assignment, buildAttemptAssignmentJoin\(\)\)[\s\S]*\.where\(buildScoredAttemptWhere\(where\)\)/,
  'Assignment list summaries should only read completed attempts with scored results.'
);
assert.match(
  assignmentsApiSource,
  /const itemAttempts =[\s\S]*\.select\(buildAssignmentAttemptStatsByAssignmentSelect\(\)\)[\s\S]*\.innerJoin\(assignment, buildAttemptAssignmentJoin\(\)\)[\s\S]*buildScoredAttemptWhere\([\s\S]*buildAssignmentAttemptsInWhere\(\{[\s\S]*assignmentIds: itemAssignmentIds/,
  'Assignment list card stats should only read completed attempts with scored results.'
);
const assignmentLifecycleQuerySource = readFileSync(
  'src/assignments/lifecycle-query.ts',
  'utf8'
);
assert.match(
  assignmentListQuerySource,
  /buildAssignmentLifecycleStatusFilter\(\{[\s\S]*now,[\s\S]*status,[\s\S]*\}\)/,
  'Assignment list query should delegate lifecycle SQL filtering to the assignment-domain lifecycle query helper.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /function buildAssignmentStatusFilter|status === 'open'[\s\S]*gt\(assignment\.expiresAt|status === 'expired'[\s\S]*lte\(assignment\.expiresAt/,
  'Assignment list API should not keep local lifecycle SQL filter rules.'
);
assert.match(
  assignmentLifecycleQuerySource,
  /export function buildAssignmentLifecycleStatusFilter[\s\S]*status === 'open'[\s\S]*eq\(assignment\.status, 'published'\)[\s\S]*isNull\(assignment\.expiresAt\)[\s\S]*gt\(assignment\.expiresAt, now\)/,
  'Assignment lifecycle query helper should encode the open-link SQL filter.'
);
assert.match(
  assignmentLifecycleQuerySource,
  /status === 'expired'[\s\S]*eq\(assignment\.status, 'published'\)[\s\S]*isNotNull\(assignment\.expiresAt\)[\s\S]*lte\(assignment\.expiresAt, now\)/,
  'Assignment lifecycle query helper should encode the expired-link SQL filter.'
);
assert.match(
  assignmentsApiSource,
  /export const publishAssignment[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)/,
  'Publish assignment API should block archived source activities server-side before snapshotting.'
);
assert.match(
  assignmentsApiSource,
  /export const publishAssignment[\s\S]*buildActivityDetailOwnerWhere\(\{[\s\S]*activityId: data\.activityId,[\s\S]*userId,[\s\S]*\}\)/,
  'Publish assignment API should load the source activity through the shared activity detail owner query helper.'
);
assert.match(
  assignmentsApiSource,
  /export const publishAssignment[\s\S]*buildAssignmentDetailOwnerWhere\(\{ assignmentId: id, userId \}\)/,
  'Publish assignment API should reload newly published assignments through the assignment detail owner query helper.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /publishAssignment[\s\S]*eq\(activity\.id, data\.activityId\)[\s\S]*eq\(activity\.ownerId, userId\)|publishAssignment[\s\S]*\.where\(eq\(assignment\.id, id\)\)/,
  'Publish assignment API should not keep local activity owner lookup rules.'
);
assert.match(
  assignmentsApiSource,
  /export const publishAssignment[\s\S]*await db\.transaction\(async \(tx\) => \{[\s\S]*await tx\.insert\(assignment\)[\s\S]*await tx\.insert\(assignmentSnapshot\)/,
  'Publish assignment API should write the assignment and frozen snapshot atomically.'
);
assert.match(
  assignmentsApiSource,
  /export const publishAssignment[\s\S]*buildPublishedAssignmentInsert\(\{[\s\S]*sourceActivity,[\s\S]*title: data\.title,[\s\S]*userId,[\s\S]*\}\)[\s\S]*buildPublishedAssignmentSnapshotInsert\(\{[\s\S]*assignmentId: id,[\s\S]*sourceActivity/,
  'Publish assignment API should build assignment and snapshot insert payloads through assignment persistence helpers.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /tx\.insert\(assignment\)\.values\(\{[\s\S]*activityId: sourceActivity\.id[\s\S]*status: 'published'|tx\.insert\(assignmentSnapshot\)\.values\([\s\S]*buildAssignmentSnapshotInsert/,
  'Publish assignment API should not hand-write published assignment or snapshot insert payloads.'
);
assert.match(
  assignmentsApiSource,
  /export const updateAssignmentStatus[\s\S]*assertAssignmentStatusTransition\(\{[\s\S]*currentStatus: existingAssignment\.status[\s\S]*nextStatus: data\.status[\s\S]*\.update\(assignment\)[\s\S]*buildAssignmentStatusUpdateSet\(\{[\s\S]*nextStatus: data\.status[\s\S]*updatedAt: new Date\(\)/,
  'Update assignment status API should validate lifecycle transitions before using assignment persistence status payloads.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /updateAssignmentStatus[\s\S]*\.set\(\{[\s\S]*status: data\.status[\s\S]*updatedAt: new Date\(\)/,
  'Update assignment status API should not hand-write assignment status update payloads.'
);
assert.match(
  assignmentsApiSource,
  /export const submitAttempt[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*shareSlug: row\.assignment\.shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems,[\s\S]*\}\)/,
  'Submit attempt API should apply the assignment delivery item order before validating submitted answers.'
);
assert.match(
  assignmentsApiSource,
  /const submittedAnswers = normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*answers: submittedAnswers,[\s\S]*evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/,
  'Submit attempt API should normalize submitted item ids once before validation and scoring.'
);
assert.match(
  attemptAnswersSource,
  /normalizeSubmittedAttemptAnswers[\s\S]*normalizeAttemptAnswerItemId\(answer\.itemId\)/,
  'Attempt answer helpers should normalize submitted item ids before scoring uses them.'
);
assert.match(
  attemptAnswersSource,
  /assertSubmittedAnswersMatchRuntimeItems[\s\S]*normalizeAttemptAnswerItemId\(item\.id\)[\s\S]*normalizeAttemptAnswerItemId\(answer\.itemId\)/,
  'Attempt answer validation should compare runtime and submitted item ids through the same normalization.'
);
assert.match(
  attemptAnswersSource,
  /function normalizeAttemptAnswerItemId[\s\S]*normalizeRuntimeDisplayText\(value\)/,
  'Attempt answer item-id normalization should reuse the shared runtime display helper.'
);
assert.match(
  assignmentsApiSource,
  /export const submitAttempt[\s\S]*const resolvedSource = resolveAssignmentRuntimeSource\(row\)[\s\S]*items: resolvedSource\.runtimeItems/,
  'Submit attempt API should resolve playable content and template through the shared assignment runtime helper.'
);
assert.match(
  assignmentsApiSource,
  /export const submitAttempt[\s\S]*canUseAnotherAssignmentAttempt\(\{[\s\S]*maxAttempts: settings\.maxAttempts,[\s\S]*usedAttempts: previousAttemptCount/,
  'Submit attempt API should enforce attempt limits through the shared assignment-domain helper.'
);
assert.match(
  assignmentsApiSource,
  /export const submitAttempt[\s\S]*const evaluation = evaluateRuntimeAnswers\(\{[\s\S]*const startedAt = buildAttemptStartedAt\(\{[\s\S]*await db\.insert\(attempt\)\.values\([\s\S]*buildScoredAttemptInsert\(\{[\s\S]*assignmentId: row\.assignment\.id[\s\S]*evaluation,[\s\S]*identity: submissionIdentity[\s\S]*templateType/,
  'Submit attempt API should persist scored attempts through the attempt persistence helper after scoring and duration normalization.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /db\.insert\(attempt\)\.values\(\{[\s\S]*answersJson:[\s\S]*resultJson:[\s\S]*score:/,
  'Submit attempt API should not hand-write scored attempt insert payloads.'
);
assert.match(
  assignmentsApiSource,
  /anonymousToken:[\s\S]*ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS\.anonymousTokenMinLength[\s\S]*ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS\.anonymousTokenMaxLength/,
  'Submit attempt API should reuse anonymous-token submission limits.'
);
assert.match(
  assignmentsApiSource,
  /answer:[\s\S]*ASSIGNMENT_SUBMISSION_ANSWER_LIMITS\.answerMaxLength[\s\S]*itemId:[\s\S]*ASSIGNMENT_SUBMISSION_ANSWER_LIMITS\.itemIdMaxLength[\s\S]*\.max\(ASSIGNMENT_SUBMISSION_ANSWER_LIMITS\.maxAnswers\)/,
  'Submit attempt API should reuse answer payload submission limits.'
);
assert.match(
  assignmentsApiSource,
  /durationSeconds:[\s\S]*ASSIGNMENT_SUBMISSION_DURATION_RANGE\.min[\s\S]*ASSIGNMENT_SUBMISSION_DURATION_RANGE\.max/,
  'Submit attempt API should reuse duration submission limits.'
);
assert.match(
  assignmentsApiSource,
  /studentName:[\s\S]*ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS\.studentNameMaxLength/,
  'Submit attempt API should reuse student-name submission limits.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /anonymousToken: z\.string\(\)\.trim\(\)\.min\(12\)\.max\(120\)/,
  'Submit attempt API should not keep local anonymous-token bounds.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /\.max\(24 \* 60 \* 60\)/,
  'Submit attempt API should not keep a local duration upper bound.'
);
const useAssignmentsSource = readFileSync(
  'src/hooks/use-assignments.ts',
  'utf8'
);
assert.match(
  useAssignmentsSource,
  /pageSize = ASSIGNMENT_LIST_PAGE_SIZE/,
  'useAssignments should default page size through the assignment-domain pagination constant.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /buildAssignmentListPageViewModel/,
  'Assignment dashboard route should consume the assignment-domain page view-model.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /activePageView\.starterPreview\.assignments/,
  'Assignment dashboard route should render starter cards from the assignment-domain preview view-model.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /buildAssignmentListFilterRouteSearch/,
  'Assignment dashboard route should update filters through the assignment-domain route helper.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /buildAssignmentListDismissPublishedRouteSearch/,
  'Assignment dashboard route should dismiss published-panel state through the assignment-domain route helper.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /AssignmentListFilters/,
  'Assignment dashboard route should delegate filter controls to the assignment list filters component.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /AssignmentListCard/,
  'Assignment dashboard route should delegate assignment card rendering to the assignment list card component.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /AssignmentListSummaryCard/,
  'Assignment dashboard route should delegate summary metric rendering to the assignment list summary card component.'
);
assert.match(
  dashboardAssignmentsRouteSource,
  /PublishedAssignmentPanel/,
  'Assignment dashboard route should delegate the just-published share panel to a focused component.'
);
assert.match(
  assignmentListFiltersComponentSource,
  /buildAssignmentListSearchPanelView/,
  'Assignment list filters component should render filter summary and status options from the assignment-domain search panel view.'
);
assert.match(
  assignmentListCardComponentSource,
  /buildAssignmentListCardViewModel/,
  'Assignment list card component should receive assignment-domain card view models.'
);
assert.match(
  assignmentListCardComponentSource,
  /useUpdateAssignmentStatus/,
  'Assignment list card component should own close and reopen interactions instead of the route.'
);
assert.match(
  assignmentListCardComponentSource,
  /buildAssignmentStatusActionExecutionPlan/,
  'Assignment list card component should execute status updates through the assignment-domain action plan.'
);
assert.doesNotMatch(
  assignmentListCardComponentSource,
  /statusAction\.nextStatus/,
  'Assignment list card component should not rebuild status mutation input from status action details.'
);
assert.match(
  assignmentListCardComponentSource,
  /to="\/print\/assignments\/\$assignmentId"/,
  'Assignment list card component should link persisted assignments to the printable worksheet route.'
);
assert.doesNotMatch(
  assignmentListCardComponentSource,
  /Print worksheet|打印练习纸/,
  'Assignment list card component should render printable worksheet labels from the assignment-domain action view.'
);
assert.match(
  assignmentListSummaryCardComponentSource,
  /AssignmentListSummaryMetricId/,
  'Assignment list summary card component should map icons by the assignment-domain metric id.'
);
assert.match(
  publishedAssignmentPanelComponentSource,
  /buildPublishedAssignmentPanelContext/,
  'Published assignment panel component should render share-panel state from the assignment-domain panel context.'
);
assert.match(
  publishedAssignmentPanelComponentSource,
  /to="\/print\/assignments\/\$assignmentId"/,
  'Published assignment panel component should link newly published assignments to the printable worksheet route.'
);
assert.doesNotMatch(
  publishedAssignmentPanelComponentSource,
  /Print worksheet|打印练习纸/,
  'Published assignment panel component should render printable worksheet labels from the assignment-domain action copy.'
);
assert.doesNotMatch(
  dashboardAssignmentsRouteSource,
  /buildAssignmentListSearchPanelView|assignmentListSearchCopy|NativeSelect|NativeSelectOption|id="assignment-status-filter"/,
  'Assignment dashboard route should not own assignment list filter-control rendering details.'
);
assert.doesNotMatch(
  dashboardAssignmentsRouteSource,
  /buildPublishedAssignmentPanelContext|useUpdateAssignmentStatus|toast\.|statusAction|shareAction|resultAction|assignmentListCardStatIcons/,
  'Assignment dashboard route should not own assignment card actions or published-panel rendering details.'
);
assert.doesNotMatch(
  dashboardAssignmentsRouteSource,
  /function (?:AssignmentCard|PublishedAssignmentPanel|SummaryCard|AssignmentStat)\(/,
  'Assignment dashboard route should not keep local assignment card, published-panel, stat, or summary components.'
);
assert.doesNotMatch(
  dashboardAssignmentsRouteSource,
  /getStarterActivity|getStarterAssignment|getStarterAssignments|assignmentStatusFilterOptions|normalizeAssignmentListSearch|buildAssignmentListFilterSummary|getAssignmentListTotalPages|buildAssignmentListSummaryMetrics|buildAssignmentListEmptyStateView|resolvePublishedAssignmentPanelAssignment/,
  'Assignment dashboard route should not rebuild starter previews, status options, filter summaries, pagination, summary, empty state, or published panel context directly.'
);
assert.match(
  assignmentListViewSource,
  /getAssignmentListTotalPages\(\{[\s\S]*pageSize: ASSIGNMENT_LIST_PAGE_SIZE,[\s\S]*total: totalAssignments,[\s\S]*\}\)/,
  'Assignment list page view-model should calculate total pages through the assignment-domain helper.'
);
assert.match(
  assignmentListViewSource,
  /title: formatAssignmentDisplayTitle\(assignment\.title\)[\s\S]*const shareSlug = normalizeAssignmentShareSlug\(assignment\.shareId\)[\s\S]*title: formatAssignmentDisplayTitle\(assignment\.title\)/,
  'Assignment list card view-models should normalize persisted and starter assignment titles through the shared assignment display helper.'
);
assert.match(
  assignmentListViewSource,
  /const shareSlug = normalizeAssignmentShareSlug\(assignment\.shareSlug\)[\s\S]*const shareSlug = normalizeAssignmentShareSlug\(assignment\.shareId\)/,
  'Assignment list card view-models should normalize persisted and starter share IDs before exposing card fields.'
);
assert.doesNotMatch(
  assignmentListViewSource,
  /title: assignment\.title|shareSlug: assignment\.(?:shareSlug|shareId),/,
  'Assignment list card view-models should not expose raw assignment titles or share IDs.'
);
assert.doesNotMatch(
  dashboardAssignmentsRouteSource,
  /const ASSIGNMENT_LIST_PAGE_SIZE = 12/,
  'Assignment dashboard route should not maintain a local page-size constant.'
);
assert.match(
  assignmentsApiSource,
  /summaryAttempts\.map\(withAssignmentAttemptStatsSettings\)/,
  'Assignment list API summary stats should attach timer settings through the assignment-domain stats helper.'
);
assert.match(
  assignmentsApiSource,
  /itemAttempts\.map\(withAssignmentAttemptStatsSettings\)/,
  'Assignment list API card stats should attach timer settings through the assignment-domain stats helper.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /function withAttemptStatsSettings|const settings = resolveAssignmentSettings\(item\.settingsJson\)[\s\S]*timeLimitSeconds: settings\.timeLimitSeconds/,
  'Assignment list API should not keep local attempt-stats timer-setting mapping logic.'
);
assert.match(
  assignmentsApiSource,
  /buildPublicAttemptReviewItems\(\{[\s\S]*runtimeItems: orderedRuntimeItems,[\s\S]*showCorrectAnswers: settings\.showCorrectAnswers/,
  'Submit attempt API should build student review payloads in the same stable delivery order.'
);
assert.match(
  assignmentsApiSource,
  /result: buildPublicAttemptResult\(evaluation\.result\)/,
  'Submit attempt API should sanitize scorer results before returning them to the student runner.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /result: evaluation\.result/,
  'Submit attempt API should not return raw scorer results directly.'
);
assert.match(
  assignmentsApiSource,
  /export const getAssignmentResults[\s\S]*buildScoredAssignmentAttemptWhere\(\{[\s\S]*assignmentId: row\.assignment\.id,[\s\S]*\}\)[\s\S]*orderBy\(buildAttemptCompletedAtOrderBy\(\)\)[\s\S]*analyzeAssignmentResults/,
  'Assignment results API should only return completed attempts with scored results.'
);
assert.match(
  assignmentsApiSource,
  /export const getAssignmentResults[\s\S]*const resolvedSource = resolveAssignmentRuntimeSource\(row\)[\s\S]*runtimeItems: resolvedSource\.runtimeItems/,
  'Assignment results API should analyze attempts against the shared frozen assignment runtime source.'
);
assert.equal(typeof buildAssignmentDetailOwnerWhere, 'function');
assert.equal(typeof buildAssignmentDetailOwnerShareWhere, 'function');
assert.equal(typeof buildAssignmentDetailShareWhere, 'function');
assert.equal(typeof buildAssignmentDetailSelect, 'function');
assert.equal(typeof buildAssignmentActivityJoin, 'function');
assert.equal(typeof buildAssignmentSnapshotJoin, 'function');
assert.match(
  assignmentDetailQuerySource,
  /buildAssignmentDetailSelect[\s\S]*activity,[\s\S]*assignment,[\s\S]*snapshot: assignmentSnapshot[\s\S]*buildAssignmentActivityJoin[\s\S]*eq\(assignment\.activityId, activity\.id\)[\s\S]*buildAssignmentSnapshotJoin[\s\S]*eq\(assignmentSnapshot\.assignmentId, assignment\.id\)/,
  'Assignment detail select and join shape should live in the assignment detail query domain.'
);
assert.match(
  assignmentsApiSource,
  /const items = await db[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)/,
  'Assignment list item queries should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /export const publishAssignment[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)[\s\S]*buildAssignmentDetailOwnerWhere\(\{ assignmentId: id, userId \}\)/,
  'Publish assignment reloads should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /export const updateAssignmentStatus[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)[\s\S]*\.where\(where\)/,
  'Assignment status reloads should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /export const getAssignmentResults[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)[\s\S]*buildAssignmentDetailOwnerWhere/,
  'Assignment results should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /export const getPrintableAssignmentWorksheet[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)[\s\S]*buildAssignmentDetailOwnerWhere/,
  'Printable worksheet lookups should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /export const getPublicAssignment[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)[\s\S]*buildAssignmentDetailShareWhere/,
  'Public assignment lookups should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /export const submitAttempt[\s\S]*\.select\(buildAssignmentDetailSelect\(\)\)[\s\S]*\.innerJoin\(activity, buildAssignmentActivityJoin\(\)\)[\s\S]*\.leftJoin\(assignmentSnapshot, buildAssignmentSnapshotJoin\(\)\)[\s\S]*buildAssignmentDetailShareWhere/,
  'Student attempt submissions should reuse the shared assignment detail select and join shape.'
);
assert.match(
  assignmentsApiSource,
  /publishedAssignment[\s\S]*buildAssignmentDetailOwnerShareWhere\(\{[\s\S]*shareSlug: data\.publishedShareSlug,[\s\S]*userId,[\s\S]*\}\)/,
  'Assignment list publish-success lookup should use the shared owner-scoped share-slug detail query helper.'
);
assert.equal(typeof buildAssignmentListSummarySelect, 'function');
assert.equal(typeof buildPublishedAssignmentListItemSelect, 'function');
assert.match(
  assignmentListQuerySource,
  /buildAssignmentListSummarySelect[\s\S]*expiresAt: assignment\.expiresAt[\s\S]*id: assignment\.id[\s\S]*status: assignment\.status[\s\S]*buildPublishedAssignmentListItemSelect[\s\S]*id: assignment\.id[\s\S]*shareSlug: assignment\.shareSlug[\s\S]*title: assignment\.title/,
  'Assignment list summary and publish-success select shapes should live in the assignment query domain.'
);
assert.match(
  assignmentsApiSource,
  /matchingAssignments = await db[\s\S]*\.select\(buildAssignmentListSummarySelect\(\)\)/,
  'Assignment list API should reuse the summary select helper.'
);
assert.match(
  assignmentsApiSource,
  /publishedAssignment[\s\S]*\.select\(buildPublishedAssignmentListItemSelect\(\)\)/,
  'Assignment list API should reuse the publish-success select helper.'
);
assert.doesNotMatch(
  assignmentListApiSource,
  /matchingAssignments[\s\S]*expiresAt: assignment\.expiresAt[\s\S]*status: assignment\.status|publishedAssignment[\s\S]*shareSlug: assignment\.shareSlug[\s\S]*title: assignment\.title/,
  'Assignment list API should not hand-write summary or publish-success select fields.'
);
assert.match(
  assignmentsApiSource,
  /updateAssignmentStatus[\s\S]*const where = buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId,[\s\S]*userId,[\s\S]*\}\)/,
  'Assignment status updates should load owner-scoped assignment details through the assignment detail query helper.'
);
assert.match(
  assignmentsApiSource,
  /getAssignmentResults[\s\S]*buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId,[\s\S]*userId,[\s\S]*\}\)/,
  'Assignment results API should load teacher-owned assignment details through the assignment detail query helper.'
);
assert.match(
  assignmentsApiSource,
  /export const getPrintableAssignmentWorksheet = createServerFn\(\{[\s\S]*method: 'GET'[\s\S]*\}\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)/,
  'Printable worksheet API should require authenticated teacher access.'
);
assert.match(
  assignmentsApiSource,
  /getPrintableAssignmentWorksheet[\s\S]*buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId,[\s\S]*userId,[\s\S]*\}\)/,
  'Printable worksheet API should stay owner-scoped through the assignment detail query helper.'
);
assert.match(
  assignmentsApiSource,
  /export const getPrintableAssignmentWorksheet[\s\S]*const resolvedSource = resolveAssignmentRuntimeSource\(row\)[\s\S]*runtimeItems: resolvedSource\.runtimeItems/,
  'Printable worksheet API should resolve frozen assignment content and template through the shared runtime helper.'
);
assert.match(
  assignmentsApiSource,
  /export const getPrintableAssignmentWorksheet[\s\S]*includeAnswerKey: data\.includeAnswerKey/,
  'Printable worksheet API should pass the explicit answer-key choice into the worksheet builder.'
);
const assignmentsPublicSource = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
assert.match(
  assignmentsPublicSource,
  /buildPublicAssignmentPayload[\s\S]*resolveAssignmentRuntimeSource\(\{[\s\S]*runtimeItems = resolvedSource\.runtimeItems/,
  'Public assignment payloads should build sanitized runtime items from the shared frozen assignment runtime source.'
);
assert.match(
  assignmentsApiSource,
  /getPublicAssignment[\s\S]*buildAssignmentDetailShareWhere\(\{ shareSlug: data\.shareSlug \}\)/,
  'Public assignment lookup should load assignment details through the shared share-slug query helper.'
);
assert.match(
  assignmentsApiSource,
  /submitAttempt[\s\S]*buildAssignmentDetailShareWhere\(\{ shareSlug: data\.shareSlug \}\)/,
  'Student attempt submission should load assignment details through the shared share-slug query helper.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /publishedAssignment[\s\S]*eq\(assignment\.ownerId, userId\)[\s\S]*eq\(assignment\.shareSlug, data\.publishedShareSlug\)|updateAssignmentStatus[\s\S]*eq\(assignment\.id, data\.assignmentId\)[\s\S]*eq\(assignment\.ownerId, userId\)|getAssignmentResults[\s\S]*eq\(assignment\.id, data\.assignmentId\)[\s\S]*eq\(assignment\.ownerId, userId\)|getPrintableAssignmentWorksheet[\s\S]*eq\(assignment\.id, data\.assignmentId\)[\s\S]*eq\(assignment\.ownerId, userId\)|getPublicAssignment[\s\S]*eq\(assignment\.shareSlug, data\.shareSlug\)|submitAttempt[\s\S]*eq\(assignment\.shareSlug, data\.shareSlug\)/,
  'Assignment API should not keep local detail owner/share lookup rules.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /eq\(assignment\.activityId, activity\.id\)|eq\(assignmentSnapshot\.assignmentId, assignment\.id\)|snapshot: assignmentSnapshot/,
  'Assignment API should not hand-write assignment detail joins or detail select shape.'
);
assert.equal(typeof buildScoredAttemptWhere, 'function');
assert.equal(typeof buildAssignmentAttemptStatsSelect, 'function');
assert.equal(typeof buildAssignmentAttemptStatsByAssignmentSelect, 'function');
assert.equal(typeof buildAttemptAssignmentJoin, 'function');
assert.equal(typeof buildAssignmentAttemptsInWhere, 'function');
assert.equal(typeof buildAttemptCompletedAtOrderBy, 'function');
assert.equal(typeof buildScoredAnonymousAssignmentAttemptWhere, 'function');
assert.equal(typeof buildScoredAssignmentAttemptWhere, 'function');
assert.match(
  assignmentAttemptQuerySource,
  /buildAssignmentAttemptStatsSelect[\s\S]*resultJson: attempt\.resultJson[\s\S]*settingsJson: assignment\.settingsJson[\s\S]*buildAssignmentAttemptStatsByAssignmentSelect[\s\S]*assignmentId: attempt\.assignmentId[\s\S]*buildAttemptAssignmentJoin[\s\S]*eq\(attempt\.assignmentId, assignment\.id\)[\s\S]*buildScoredAttemptWhere[\s\S]*isNotNull\(attempt\.resultJson\)[\s\S]*buildAssignmentAttemptsInWhere[\s\S]*inArray\(attempt\.assignmentId, assignmentIds\)[\s\S]*buildScoredAssignmentAttemptWhere[\s\S]*buildScoredAnonymousAssignmentAttemptWhere[\s\S]*buildAttemptCompletedAtOrderBy[\s\S]*desc\(attempt\.completedAt\)/,
  'Assignment scored-attempt SQL filtering and stats select shape should live in assignment-domain query helpers.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /isNotNull\(attempt\.resultJson\)|desc\(assignment\.updatedAt\)|desc\(attempt\.completedAt\)|inArray\(attempt\.assignmentId, itemAssignmentIds\)|settingsJson: assignment\.settingsJson|resultJson: attempt\.resultJson|eq\(attempt\.assignmentId, assignment\.id\)/,
  'Assignment API should not hand-write scored-attempt filters, ordering, stats selects, or attempt assignment joins.'
);
const activityAiApiSource = readFileSync('src/api/activity-ai.ts', 'utf8');
assert.match(
  activityAiApiSource,
  /generateActivityDraftFromAi\(data\)/,
  'AI draft server function should return a teacher-reviewable activity draft instead of persisting activity rows.'
);
assert.doesNotMatch(
  activityAiApiSource,
  /getDb|db\.|insert\(activity\)|from\(activity\)|@\/db/,
  'AI draft server function should not write directly to the activity database.'
);
const activityDraftSourceSource = readFileSync(
  'src/activities/draft-source.ts',
  'utf8'
);
assert.match(
  activityDraftSourceSource,
  /export type ActivitySourceMaterialDraftSummary[\s\S]*hasMaterials[\s\S]*kindCounts[\s\S]*noteViews[\s\S]*notesText[\s\S]*totalCount/,
  'AI draft source materials should expose a structured safe provenance summary.'
);
assert.match(
  activityDraftSourceSource,
  /buildActivitySourceMaterialDraftSummary[\s\S]*normalizeActivityMaterialReferences\(value\)[\s\S]*formatActivitySourceMaterialDraftNotes\(noteViews\)/,
  'AI draft source material summaries should normalize references once and derive safe note text from note views.'
);
assert.match(
  activityDraftSourceSource,
  /getActivityDraftSourceText[\s\S]*buildActivitySourceMaterialDraftSummary\([\s\S]*values\.sourceMaterials[\s\S]*sourceMaterialSummary\.notesText/,
  'AI draft source text should append source-material notes from the shared safe summary.'
);
assert.match(
  activityDraftSourceSource,
  /appendActivitySourceMaterialDraftNotes[\s\S]*buildActivitySourceMaterialDraftSummary\(sourceMaterials\)[\s\S]*sourceMaterialSummary\.notesText/,
  'AI draft source note syncing should reuse the shared source-material summary.'
);
assert.match(
  activityDraftSourceSource,
  /isActivitySourceMaterialDraftNotesParagraph[\s\S]*normalizeRuntimeDisplayText/,
  'AI draft source note syncing should identify existing material-note headings through shared display normalization.'
);
assert.doesNotMatch(
  activityDraftSourceSource,
  /fileId: material\.fileId|contentType: material\.contentType|size: material\.size/,
  'AI draft source material summaries should not expose file ids, content types, or sizes.'
);
assert.doesNotMatch(
  activityDraftSourceSource,
  /activity_draft_source_materials_heading\(\)\.trim\(\)|\?\.trim\(\) === heading/,
  'AI draft source note syncing should not rely on trim-only heading checks.'
);
const assignmentValidationSource = readFileSync(
  'src/assignments/validation.ts',
  'utf8'
);
assert.match(
  assignmentValidationSource,
  /status: z\.enum\(ASSIGNMENT_MANAGED_STATUSES\)/,
  'Assignment status update schema should reuse lifecycle managed statuses.'
);
assert.doesNotMatch(
  assignmentValidationSource,
  /status: z\.enum\(\['published', 'closed'\]\)/,
  'Assignment status update schema should not maintain a local managed-status enum.'
);
assert.match(
  assignmentValidationSource,
  /ASSIGNMENT_PUBLISH_FIELD_LIMITS[\s\S]*instructionsMaxLength: 500[\s\S]*titleMaxLength: 120[\s\S]*titleMinLength: 3/,
  'Assignment publish field lengths should expose a named domain contract.'
);
assert.match(
  assignmentValidationSource,
  /const assignmentInstructionsSchema[\s\S]*ASSIGNMENT_PUBLISH_FIELD_LIMITS\.instructionsMaxLength[\s\S]*instructions: assignmentInstructionsSchema/,
  'Assignment settings schema should reuse the assignment publish instructions limit.'
);
assert.match(
  assignmentValidationSource,
  /export function withResolvedAssignmentSettings[\s\S]*settingsJson: resolveAssignmentSettings\(item\.assignment\.settingsJson\)/,
  'Assignment row settings resolution should live in the assignment validation domain.'
);
assert.match(
  assignmentsApiSource,
  /import \{[\s\S]*withResolvedAssignmentSettings,[\s\S]*\} from '@\/assignments\/validation'/,
  'Assignment API should reuse the shared assignment settings row resolver.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /function withResolvedAssignmentSettings|settingsJson: resolveAssignmentSettings\(item\.assignment\.settingsJson\)/,
  'Assignment API should not keep local persisted settings resolution logic.'
);
assert.match(
  assignmentValidationSource,
  /title:[\s\S]*ASSIGNMENT_PUBLISH_FIELD_LIMITS\.titleMinLength[\s\S]*ASSIGNMENT_PUBLISH_FIELD_LIMITS\.titleMaxLength/,
  'Assignment publish schema should reuse assignment-domain title limits.'
);
assert.doesNotMatch(
  assignmentValidationSource,
  /\.max\(500\)|\.min\(3\)\.max\(120\)/,
  'Assignment publish validation should not keep local title or instructions limits.'
);
const activityAiDraftSource = readFileSync(
  'src/activities/ai-draft.ts',
  'utf8'
);
assert.match(
  activityAiDraftSource,
  /function createActivityDraftResult[\s\S]*activity,[\s\S]*meta: buildActivityDraftMeta\(\{[\s\S]*currentTemplateType: input\.templateType/,
  'AI draft results should include deterministic coverage and template-readiness metadata for editor review.'
);
assert.match(
  activityAiDraftSource,
  /type ActivityDraftResult = \{[\s\S]*activity: CreateActivityInput;[\s\S]*meta: ActivityDraftMeta;[\s\S]*provider: 'fallback' \| 'workers-ai';/,
  'AI draft result contract should expose editor input, meta, provider, and model provenance.'
);
assert.match(
  activityAiDraftSource,
  /itemCount: z[\s\S]*ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE\.min[\s\S]*ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE\.max[\s\S]*ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE\.default/,
  'AI draft input schema should reuse the domain item-count range.'
);
assert.match(
  activityAiDraftSource,
  /sourceText: z[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.sourceText\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.sourceText\.max/,
  'AI draft source-text input schema should reuse the shared source-text field limit.'
);
assert.match(
  activityAiDraftSource,
  /const aiQuestionSchema[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.answer\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.answer\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.option\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.option\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.options\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.prompt\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.prompt\.max/,
  'AI draft question schema should reuse named AI draft field limits.'
);
assert.match(
  activityAiDraftSource,
  /const aiDraftSchema[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.description\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.description\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.learningGoal\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.learningGoal\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.sourceSummary\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.sourceSummary\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.teacherNote\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.teacherNote\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.title\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.title\.max[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.vocabulary\.min[\s\S]*ACTIVITY_AI_DRAFT_FIELD_LIMITS\.vocabulary\.max/,
  'AI draft response schema should reuse named AI draft field limits.'
);
assert.doesNotMatch(
  activityAiDraftSource,
  /sourceText: z[\s\S]*\.max\(2000,/,
  'AI draft source-text schema should not maintain a local source-text maximum.'
);
assert.doesNotMatch(
  activityAiDraftSource,
  /title: z\.string\(\)\.trim\(\)\.min\(3\)\.max\(90\)/,
  'AI draft title schema should not maintain local title field limits.'
);
assert.match(
  activityAiDraftSource,
  /function completeAiActivityDraft[\s\S]*max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS\.questions[\s\S]*max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS\.pairs[\s\S]*max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS\.vocabulary[\s\S]*max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS\.teacherNotes/,
  'AI draft completion should reuse domain completion limits.'
);
assert.match(
  activityAiDraftSource,
  /function completeAiDraftGroups[\s\S]*ACTIVITY_AI_DRAFT_COMPLETION_LIMITS\.groups[\s\S]*ACTIVITY_AI_DRAFT_COMPLETION_LIMITS\.groupItems/,
  'AI draft group completion should reuse domain group limits.'
);
assert.match(
  activityAiDraftSource,
  /ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS[\s\S]*maxPhraseLength: 48[\s\S]*maxWordLength: 32[\s\S]*minPhraseLength: 2[\s\S]*minWordLength: 3/,
  'AI draft source-term extraction should expose named source-term limits.'
);
assert.match(
  activityAiDraftSource,
  /export function buildFallbackActivityDraftTerms[\s\S]*extractActivityDraftSourceTerms\([\s\S]*slice\(0, input\.itemCount\)/,
  'Fallback activity drafts should choose source terms through the shared source-term helper.'
);
assert.match(
  activityAiDraftSource,
  /export function extractActivityDraftSourceTerms[\s\S]*ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS\.minPhraseLength[\s\S]*ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS\.maxPhraseLength[\s\S]*ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS\.minWordLength[\s\S]*ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS\.maxWordLength/,
  'AI draft source-term extraction should reuse named phrase and word limits.'
);
assert.doesNotMatch(
  activityAiDraftSource,
  /value\.length >= 2 && value\.length <= 48|value\.length >= 3 && value\.length <= 32/,
  'AI draft source-term extraction should not keep local phrase or word length limits.'
);
assert.match(
  assignmentAttemptIdentityQuerySource,
  /export async function countPreviousIdentityAttempts[\s\S]*db: AssignmentAttemptIdentityDb[\s\S]*buildScoredAnonymousAssignmentAttemptWhere\(\{[\s\S]*assignmentId,[\s\S]*buildScoredAssignmentAttemptWhere\(\{ assignmentId \}\)[\s\S]*countMatchingStudentIdentityAttempts/,
  'Assignment attempt limits should only count completed attempts with scored results.'
);
assert.equal(typeof countPreviousIdentityAttempts, 'function');
assert.match(
  assignmentsApiSource,
  /previousAttemptCount = await countPreviousIdentityAttempts\(\{[\s\S]*assignmentId: row\.assignment\.id,[\s\S]*db,[\s\S]*studentName: submissionIdentity\.studentName/,
  'Assignment submission API should delegate previous identity attempt counting to the assignment identity query domain.'
);
assert.doesNotMatch(
  assignmentsApiSource,
  /async function countPreviousIdentityAttempts|resolveAttemptIdentityCountStrategy|countMatchingStudentIdentityAttempts/,
  'Assignment API should not keep local attempt identity count strategy or matching rules.'
);
const useAssignmentsHookSource = readFileSync(
  'src/hooks/use-assignments.ts',
  'utf8'
);
assert.match(
  useAssignmentsHookSource,
  /export function usePrintableAssignmentWorksheet/,
  'Assignments hook should expose a teacher-facing printable worksheet query.'
);
assert.match(
  useAssignmentsHookSource,
  /queryFn: \(\) =>[\s\S]*getPrintableAssignmentWorksheet\(\{[\s\S]*data: \{ assignmentId, includeAnswerKey \}/,
  'Printable worksheet hook should call the owner-scoped printable worksheet server function.'
);
assert.match(
  useAssignmentsHookSource,
  /assignmentsKeys\.detail\(assignmentId\)[\s\S]*'printable'[\s\S]*includeAnswerKey/,
  'Printable worksheet hook should cache printable variants separately by answer-key visibility.'
);
const printableWorksheetViewSource = readFileSync(
  'src/assignments/printable-worksheet-view.ts',
  'utf8'
);
const printableWorksheetSource = readFileSync(
  'src/assignments/printable-worksheet.ts',
  'utf8'
);
assert.match(
  printableWorksheetSource,
  /PRINTABLE_WORKSHEET_RESPONSE_POLICIES[\s\S]*satisfies Record<[\s\S]*ActivityTemplateRunnerKind,[\s\S]*PrintableWorksheetResponsePolicy/,
  'Printable worksheet response rules should be captured in one exhaustive runner-kind policy table.'
);
assert.match(
  printableWorksheetSource,
  /getPrintableWorksheetResponsePolicy[\s\S]*getActivityTemplateRunnerKind\(templateType\)/,
  'Printable worksheet response policies should resolve from the shared activity runner kind.'
);
assert.match(
  printableWorksheetSource,
  /toPrintableWorksheetItem[\s\S]*const responsePolicy = getPrintableWorksheetResponsePolicy\(templateType\)[\s\S]*answerSpaceLines: responsePolicy\.answerSpaceLines[\s\S]*choicePresentation: responsePolicy\.choicePresentation[\s\S]*responseMode: responsePolicy\.responseMode/,
  'Printable worksheet item generation should consume the shared response policy.'
);
assert.match(
  printableWorksheetSource,
  /toPrintableWorksheetAnswerKeyItem[\s\S]*getRuntimeDisplayAcceptedAnswers\(item\.answer\)/,
  'Printable worksheet answer keys should normalize accepted alternatives through the shared runtime display-list helper.'
);
assert.match(
  printableWorksheetSource,
  /instructions: formatAssignmentDeliveryInstructions\(settings\.instructions\)/,
  'Printable worksheets should format student instructions through the shared delivery helper.'
);
assert.match(
  printableWorksheetSource,
  /assignmentTitle: formatAssignmentDisplayTitle\(assignment\.title\)/,
  'Printable worksheets should normalize assignment titles through the shared assignment display helper.'
);
assert.doesNotMatch(
  printableWorksheetSource,
  /instructions: settings\.instructions|assignmentTitle: assignment\.title/,
  'Printable worksheets should not expose raw student instructions or assignment titles.'
);
assert.doesNotMatch(
  printableWorksheetSource,
  /function getPrintableWorksheetResponseMode|function getPrintableWorksheetAnswerSpaceLines|function getPrintableWorksheetChoicePresentation/,
  'Printable worksheet item generation should not keep separate response-mode, answer-line, or choice-presentation switches.'
);
assert.doesNotMatch(
  printableWorksheetSource,
  /getAcceptedAnswers\(item\.answer\)|normalizeRuntimeDisplayList\(getAcceptedAnswers/,
  'Printable worksheet answer keys should not duplicate accepted-answer display normalization.'
);
assert.match(
  printableWorksheetViewSource,
  /formatRuntimeItemPrompt/,
  'Printable worksheet view should reuse runtime item prompt formatting.'
);
assert.match(
  printableWorksheetViewSource,
  /formatRuntimeItemKindLabel/,
  'Printable worksheet view should reuse runtime item kind labels.'
);
assert.match(
  printableWorksheetViewSource,
  /choicePresentation: item\.choicePresentation/,
  'Printable worksheet view should preserve structured choice presentation metadata.'
);
assert.match(
  printableWorksheetViewSource,
  /choiceBank: buildPrintableWorksheetChoiceBankView\(item\)/,
  'Printable worksheet view should normalize printable choice-bank display data.'
);
assert.match(
  printableWorksheetViewSource,
  /answerLines: getPrintableWorksheetAnswerLines\(item\)/,
  'Printable worksheet item views should own printable answer-line display data.'
);
assert.match(
  printableWorksheetViewSource,
  /answerAreaLabel: m\.assignment_printable_answer_area_label\(\)/,
  'Printable worksheet item views should localize answer-area labels in the view layer.'
);
assert.match(
  printableWorksheetViewSource,
  /label:[\s\S]*getPrintableWorksheetChoiceBankLabel\(item\.choicePresentation\)/,
  'Printable worksheet choice-bank views should own localized choice-bank section labels.'
);
assert.match(
  printableWorksheetViewSource,
  /showIndexLabels: item\.choicePresentation !== 'group-bank'/,
  'Printable worksheet view should hide lettered choice labels for classification group banks.'
);
assert.match(
  printableWorksheetViewSource,
  /key: `\$\{item\.id\}-choice-\$\{index\}`/,
  'Printable worksheet choice-bank views should expose stable per-choice keys.'
);
assert.match(
  printableWorksheetViewSource,
  /function getPrintableWorksheetChoiceBankLabel[\s\S]*assignment_printable_choice_bank_answer_label[\s\S]*assignment_printable_choice_bank_choice_label[\s\S]*assignment_printable_choice_bank_group_label/,
  'Printable worksheet choice-bank labels should come from localized messages for answer, choice, and group banks.'
);
assert.match(
  printableWorksheetViewSource,
  /function formatPrintableWorksheetChoiceIndex[\s\S]*m\.assignment_printable_choice_index_label/,
  'Printable worksheet choice indices should be formatted through localized messages.'
);
assert.match(
  printableWorksheetViewSource,
  /formatPrintableWorksheetAnswerKeyPrompt[\s\S]*formatRuntimeItemPrompt/,
  'Printable worksheet answer keys should reuse the same runtime prompt formatting as printable items.'
);
assert.match(
  printableWorksheetViewSource,
  /buildPrintableWorksheetAnswerKeyItemView[\s\S]*formatPrintableWorksheetAnswerKeyPrompt/,
  'Printable worksheet answer-key item views should own formatted answer-key prompt text.'
);
assert.match(
  printableWorksheetViewSource,
  /buildPrintableWorksheetAnswerKeyItemView[\s\S]*assignment_printable_answer_key_item/,
  'Printable worksheet answer-key item views should localize answer labels in the view layer.'
);
assert.match(
  printableWorksheetViewSource,
  /formatPrintableWorksheetAcceptedAnswers[\s\S]*formatAcceptedAnswerAlternatives[\s\S]*includePrimary: false[\s\S]*assignment_printable_answer_separator/,
  'Printable worksheet accepted alternatives should reuse shared result formatting while omitting the primary answer.'
);
assert.doesNotMatch(
  printableWorksheetViewSource,
  /values\.slice\(1\)\.join/,
  'Printable worksheet answer keys should not locally slice and join accepted answers.'
);
assert.match(
  printableWorksheetViewSource,
  /m\.assignment_printable_response_line_match/,
  'Printable worksheet view should localize response-mode helper text.'
);
assert.match(
  printableWorksheetViewSource,
  /buildPrintableWorksheetPageViewModel[\s\S]*buildPrintableWorksheetHeaderView/,
  'Printable worksheet page view-model should own formatted worksheet header state.'
);
assert.match(
  printableWorksheetViewSource,
  /buildPrintableWorksheetPageViewModel[\s\S]*worksheet\.items\.map\(buildPrintableWorksheetItemView\)/,
  'Printable worksheet page view-model should own formatted printable item views.'
);
assert.match(
  printableWorksheetViewSource,
  /buildPrintableWorksheetPageViewModel[\s\S]*worksheet\.answerKey\?\.map\(\s*buildPrintableWorksheetAnswerKeyItemView\s*\)/,
  'Printable worksheet page view-model should own formatted answer-key item views.'
);
assert.match(
  printableWorksheetViewSource,
  /controlView: buildPrintableWorksheetControlView\(\{ answerKey \}\)/,
  'Printable worksheet page view-model should own printable toolbar state.'
);
assert.match(
  printableWorksheetViewSource,
  /assignmentFieldViews:[\s\S]*buildPrintableWorksheetAssignmentFieldViews/,
  'Printable worksheet page view-model should own printable assignment field rows.'
);
assert.match(
  printableWorksheetViewSource,
  /const answerKeyView = buildPrintableWorksheetAnswerKeyView/,
  'Printable worksheet page view-model should own answer-key section state.'
);
assert.match(
  printableWorksheetViewSource,
  /emptyState: buildPrintableWorksheetEmptyState\(\)/,
  'Printable worksheet page view-model should own empty worksheet state.'
);
const printableAssignmentRouteSource = readFileSync(
  'src/routes/print/assignments/$assignmentId.tsx',
  'utf8'
);
const printableWorksheetToolbarSource = readFileSync(
  'src/components/assignments/printable-worksheet-toolbar.tsx',
  'utf8'
);
const printableWorksheetStatePanelSource = readFileSync(
  'src/components/assignments/printable-worksheet-state-panel.tsx',
  'utf8'
);
const printableWorksheetHeaderSource = readFileSync(
  'src/components/assignments/printable-worksheet-header.tsx',
  'utf8'
);
const printableWorksheetAssignmentFieldsSource = readFileSync(
  'src/components/assignments/printable-worksheet-assignment-fields.tsx',
  'utf8'
);
const printableWorksheetItemListSource = readFileSync(
  'src/components/assignments/printable-worksheet-item-list.tsx',
  'utf8'
);
const printableWorksheetAnswerKeySource = readFileSync(
  'src/components/assignments/printable-worksheet-answer-key.tsx',
  'utf8'
);
assert.match(
  printableAssignmentRouteSource,
  /middleware: \[authRouteMiddleware\]/,
  'Printable worksheet route should require authenticated teacher access.'
);
assert.match(
  printableAssignmentRouteSource,
  /parsePrintableAssignmentSearch/,
  'Printable worksheet route should reuse the assignment-domain search parser.'
);
assert.match(
  printableAssignmentRouteSource,
  /buildPrintableAssignmentSearch\(\{ answerKey: nextAnswerKey \}\)/,
  'Printable worksheet answer-key toggle should reuse the assignment-domain search builder.'
);
assert.doesNotMatch(
  printableAssignmentRouteSource,
  /answerKey === 'true'|answerKey === '1'/,
  'Printable worksheet route should not keep local answer-key query parsing.'
);
assert.match(
  printableAssignmentRouteSource,
  /usePrintableAssignmentWorksheet\(\{[\s\S]*includeAnswerKey: answerKey/,
  'Printable worksheet route should load teacher-only answer keys only when explicitly requested.'
);
assert.match(
  printableAssignmentRouteSource,
  /search: buildPrintableAssignmentSearch/,
  'Printable worksheet answer-key toggle should persist through the shared route search builder.'
);
assert.match(
  printableAssignmentRouteSource,
  /document\.body\.dataset\.printMode = 'worksheet'/,
  'Printable worksheet route should activate print-mode page chrome hiding.'
);
assert.match(
  printableAssignmentRouteSource,
  /buildPrintableWorksheetPageViewModel\(\{[\s\S]*answerKey,[\s\S]*worksheet: data/,
  'Printable worksheet route should consume the assignment-domain page view-model.'
);
assert.match(
  printableAssignmentRouteSource,
  /PrintableWorksheetToolbar[\s\S]*controlView=\{controlView\}/,
  'Printable worksheet route should delegate toolbar rendering with the printable control view.'
);
assert.match(
  printableAssignmentRouteSource,
  /PrintableWorksheetHeader[\s\S]*headerView=\{headerView\}/,
  'Printable worksheet route should delegate worksheet header rendering.'
);
assert.match(
  printableAssignmentRouteSource,
  /PrintableWorksheetAssignmentFields[\s\S]*fieldViews=\{pageView\.assignmentFieldViews\}/,
  'Printable worksheet route should delegate assignment field rendering.'
);
assert.match(
  printableAssignmentRouteSource,
  /PrintableWorksheetItemList[\s\S]*emptyState=\{pageView\.emptyState\}[\s\S]*itemViews=\{pageView\.itemViews\}/,
  'Printable worksheet route should delegate printable item rendering.'
);
assert.match(
  printableAssignmentRouteSource,
  /PrintableWorksheetAnswerKey[\s\S]*view=\{pageView\.answerKeyView\}/,
  'Printable worksheet route should delegate answer-key rendering.'
);
assert.doesNotMatch(
  printableAssignmentRouteSource,
  /buildPrintableWorksheetHeaderView|buildPrintableWorksheetItemView|buildPrintableWorksheetAnswerKeyItemView/,
  'Printable worksheet route should not directly rebuild header, item, or answer-key display state.'
);
assert.doesNotMatch(
  printableAssignmentRouteSource,
  /printableWorksheetPageCopy/,
  'Printable worksheet route should render localized page copy through printable worksheet view models.'
);
assert.doesNotMatch(
  printableAssignmentRouteSource,
  /pageView\.assignmentFieldViews\.map|pageView\.answerKeyView\.show|pageView\.emptyState\.title|controlView\.printButtonLabel|data-print-choice-bank=\{itemView\.choiceBank\.presentation\}|itemView\.answerLines\.map|pageView\.answerKeyView\.itemViews\.map|<Switch|<Badge|<Card|<Spinner/,
  'Printable worksheet route should not render low-level printable worksheet fields, items, answer keys, or controls directly.'
);
assert.match(
  printableWorksheetAssignmentFieldsSource,
  /fieldViews\.map/,
  'Printable worksheet assignment fields component should render assignment fields from the printable worksheet page view-model.'
);
assert.match(
  printableWorksheetAnswerKeySource,
  /view\.show/,
  'Printable worksheet answer-key component should render answer-key visibility from the printable worksheet page view-model.'
);
assert.match(
  printableWorksheetItemListSource,
  /emptyState\.title/,
  'Printable worksheet item list component should render the empty printable state from the printable worksheet page view-model.'
);
assert.doesNotMatch(
  printableWorksheetItemListSource,
  /itemView\.sequenceLabel[\s\S]*·[\s\S]*itemView\.kindLabel/,
  'Printable worksheet item list component should not hand-compose visible item heading separators.'
);
assert.match(
  printableWorksheetItemListSource,
  /itemView\.headingLabel/,
  'Printable worksheet item list component should render the prepared printable item heading.'
);
assert.match(
  printableWorksheetItemListSource,
  /itemView\.choiceBank\.label[\s\S]*itemView\.choiceBank\.label/,
  'Printable worksheet item list should render prepared choice-bank labels from the item view.'
);
assert.match(
  printableWorksheetItemListSource,
  /itemView\.answerAreaLabel/,
  'Printable worksheet item list should render the prepared answer-area label from the item view.'
);
assert.doesNotMatch(
  printableWorksheetItemListSource,
  /Choices|Answer bank|Groups|Answer|选项|答案库|分类|作答区/,
  'Printable worksheet item list should not hard-code visible answer or choice-bank labels.'
);
assert.match(
  printableWorksheetToolbarSource,
  /controlView\.printButtonLabel/,
  'Printable worksheet toolbar should render toolbar copy from the printable worksheet control view.'
);
assert.match(
  printableWorksheetItemListSource,
  /data-print-choice-bank=\{itemView\.choiceBank\.presentation\}/,
  'Printable worksheet item list should render choice-bank presentation metadata for print layout variants.'
);
assert.match(
  printableWorksheetItemListSource,
  /itemView\.choiceBank\.presentation === 'group-bank'[\s\S]*sm:grid-cols-3/,
  'Printable worksheet item list should render group banks as a denser classification layout.'
);
assert.match(
  printableWorksheetItemListSource,
  /itemView\.choiceBank\.showIndexLabels \?[\s\S]*indexLabel/,
  'Printable worksheet item list should render lettered choice labels only when the choice-bank view asks for them.'
);
assert.match(
  printableWorksheetItemListSource,
  /itemView\.answerLines\.map/,
  'Printable worksheet item list should render answer lines from the printable item view.'
);
assert.match(
  printableWorksheetAnswerKeySource,
  /view\.itemViews\.map/,
  'Printable worksheet answer-key component should render answer-key items from the printable worksheet page view-model.'
);
assert.match(
  printableWorksheetToolbarSource,
  /to="\/dashboard\/assignments\/\$assignmentId"/,
  'Printable worksheet toolbar should link teachers back to assignment results.'
);
assert.match(
  printableWorksheetStatePanelSource,
  /Spinner[\s\S]*view\.message[\s\S]*text-destructive/,
  'Printable worksheet state panel should own loading and error shell rendering.'
);
assert.match(
  printableWorksheetHeaderSource,
  /headerView\.assignmentTitle[\s\S]*headerView\.sharePath/,
  'Printable worksheet header should consume header view fields.'
);
assert.match(
  assignmentResultsHeaderCardSource,
  /to="\/print\/assignments\/\$assignmentId"/,
  'Assignment results header should expose the printable worksheet teacher action.'
);
const rootRouteSource = readFileSync('src/routes/__root.tsx', 'utf8');
assert.match(
  rootRouteSource,
  /canonicalPathname\.startsWith\('\/print'\)/,
  'Printable worksheet pages should render without public marketing chrome.'
);
assert.match(
  robotsRouteSource,
  /'\/print'/,
  'Printable worksheet pages should be disallowed in robots.txt.'
);
assert.match(
  e2eTestCatalogText,
  /printable worksheet action[\s\S]*\/print\/assignments\/:assignmentId[\s\S]*answerKey=true/,
  'E2E catalog should cover the teacher printable worksheet journey and answer-key toggle.'
);
assert.match(
  e2eTestCatalogText,
  /student-name, date, and score lines/,
  'E2E catalog should cover the printable worksheet student, date, and score fields.'
);
const activityTemplates = getActivityTemplates();
assert.deepEqual(
  activityTemplates.map((template) => template.type),
  ACTIVITY_TEMPLATE_TYPES
);
assert.equal(activityTemplates.length, ACTIVITY_TEMPLATE_TYPES.length);
assert.deepEqual(
  ACTIVITY_TEMPLATE_TYPES.map(
    (templateType) => getTemplateByType(templateType).type
  ),
  ACTIVITY_TEMPLATE_TYPES
);
assert.equal(formatActivityTemplateClassroomMode('individual'), 'Individual');
assert.equal(formatActivityTemplateClassroomMode('small-group'), 'Small group');
assert.equal(formatActivityTemplateClassroomMode('whole-class'), 'Whole class');
const starterActivities = getStarterActivities();
const starterAssignments = getStarterAssignments();
assert.equal(starterActivities[0]?.title, 'Food words quick check');
assert.equal(starterAssignments[0]?.title, 'Food words homework');
assert.equal(starterAssignments[0]?.shareId, STARTER_FOOD_ASSIGNMENT_SHARE_ID);
assert.equal(getStarterActivities()[0]?.title, 'Food words quick check');
assert.equal(getStarterAssignments()[0]?.title, 'Food words homework');
overwriteGetLocale(() => 'zh');
try {
  const localizedStarterActivities = getStarterActivities();
  const localizedStarterAssignments = getStarterAssignments();

  assert.equal(getActivityTemplates()[0]?.name, '测验');
  assert.equal(getTemplateByType('group-sort')?.shortName, '分类');
  assert.equal(formatActivityTemplateClassroomMode('whole-class'), '全班互动');
  assert.equal(localizedStarterActivities[0]?.title, '食物词汇快速检查');
  assert.equal(
    localizedStarterActivities[0]?.content.questions[0]?.prompt,
    '哪个单词表示红色或绿色的水果？'
  );
  assert.equal(localizedStarterActivities[1]?.content.groups[0]?.label, '固体');
  assert.equal(localizedStarterAssignments[0]?.title, '食物词汇作业');
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(buildTemplateCreateSearch('line-match'), {
  template: 'line-match',
});
assert.deepEqual(
  activityTemplates.map((template) => buildTemplateEntryAction(template)),
  activityTemplates.map((template) => ({
    label: `Start ${template.shortName}`,
    search: { template: template.type },
  }))
);
assert.deepEqual(buildHomePageViewModel(), {
  features: [
    {
      description:
        'Build reusable questions, pairs, groups, vocabulary, learning goals, and teacher notes in one structured editor.',
      id: 'teacher-workflows',
      title: 'Structured activities',
    },
    {
      description:
        'Render the same content as quiz, matching games, line matching, group sorting, fill-in, listening, pair matching, or box reveals.',
      id: 'activity-templates',
      title: 'Template switching',
    },
    {
      description:
        'Publish student links with attempt limits, timers, answer reveal, shuffle, and close-time settings.',
      id: 'assignment-links',
      title: 'Assignment links',
    },
    {
      description:
        'Review scores, item performance, accepted answers, reteach priorities, and student follow-up summaries.',
      id: 'results',
      title: 'Teacher results',
    },
  ],
  hero: {
    badgeLabel: 'Wordwall-style classroom activities',
    browseTemplatesLabel: 'Browse templates',
    description:
      'Create game-based classroom activities, publish assignment links, and review student attempts from the same structured content.',
    primaryActionLabel: 'Create activity',
    title: 'Make classroom practice feel like a game',
  },
  signals: [
    { id: 'templates', label: 'Templates', value: '8 first' },
    { id: 'delivery', label: 'Delivery', value: 'Share link' },
    { id: 'results', label: 'Results', value: 'Attempt log' },
  ],
});
assert.deepEqual(
  buildContactPageViewModel().topics.map((topic) => [
    topic.id,
    topic.title,
    topic.subject,
  ]),
  [
    ['product', 'Activity support', 'ClassGamify product support'],
    ['classroom', 'Teachers and parents', 'ClassGamify classroom workflow'],
    [
      'partnership',
      'Pricing or partnership',
      'ClassGamify pricing or partnership',
    ],
  ]
);
assert.deepEqual(buildContactPageViewModel().hero, {
  description:
    'Reach the ClassGamify team for product feedback, classroom use, account support, or partnership questions.',
  title: 'Contact',
});
assert.deepEqual(buildContactPageViewModel().checklist, {
  description: 'A little context helps us answer faster.',
  items: [
    'Share the activity, template, assignment, page URL, or workflow you mean.',
    'Tell us which device, browser, or printer setup you used.',
    'Say whether this is for a class, tutoring group, family practice, or worksheet follow-up.',
  ],
  title: 'What to include',
});
assert.equal(buildContactPageViewModel().intent, 'general');
assert.equal(buildContactPageViewModel().inquiryPanel, undefined);
assert.equal(
  buildContactPageViewModel('classroom').directSubject,
  'ClassGamify classroom workflow'
);
assert.deepEqual(buildContactPageViewModel('classroom').hero, {
  description:
    'Tell us how you want to use ClassGamify with students, tutoring groups, or a school team, and we will help shape the workflow around your routine.',
  title: 'Classroom inquiry',
});
assert.deepEqual(
  buildContactPageViewModel('classroom').inquiryPanel?.highlights.map(
    (item) => item.id
  ),
  ['students', 'materials', 'rollout']
);
assert.deepEqual(buildPricingPageViewModel().hero, {
  eyebrow: 'ClassGamify plans',
  subtitle:
    'Start with the classroom activity loop, then upgrade for more creation, assignment, AI, and result workflows.',
  title: 'ClassGamify Plans',
});
assert.deepEqual(
  buildPricingPageViewModel().valueCards.map((card) => [card.id, card.title]),
  [
    ['templates', 'Template library'],
    ['assignments', 'Activities and assignments'],
    ['ai', 'AI creation speed'],
  ]
);
assert.deepEqual(
  buildPricingFaqItems().map((item) => item.question),
  [
    'What is the free plan for?',
    'What will Pro unlock?',
    'Why are there only a few templates first?',
    'Do students need accounts?',
    'Can schools or tutoring teams use it?',
  ]
);
assert.deepEqual(buildPricingPageViewModel().faq.items, buildPricingFaqItems());
assert.deepEqual(buildTemplatesPageViewModel(), {
  cards: activityTemplates.map((template) => ({
    action: {
      label: `Start ${template.shortName}`,
      search: { template: template.type },
    },
    bestFor: template.bestFor,
    bestForLabel: 'Best for',
    classroomMode: formatActivityTemplateClassroomMode(template.classroomMode),
    classroomModeLabel: 'Classroom mode',
    contentRequirements: formatTemplateRequirements(
      template.contentRequirements
    ),
    description: template.description,
    name: template.name,
    template: template.type,
  })),
  footer: {
    createActivityLabel: 'Create activity',
    description:
      'Open the editor, load an example for the selected game format, then publish it as a shareable student assignment link.',
    title: 'Ready to draft one?',
  },
  hero: {
    badgeLabel: 'Template library',
    createFromTemplateLabel: 'Create from template',
    description:
      'ClassGamify templates render shared questions, pairs, groups, and vocabulary as quick checks, matching games, worksheet practice, listening prompts, or whole-class reveal rounds.',
    openStudentPreviewLabel: 'Open student preview',
    title: 'Pick a game format for the same lesson content.',
  },
});
assert.deepEqual(buildRoadmapPageViewModel(), {
  columns: [
    {
      description:
        'The teacher and student foundation that must stay reliable while copied starter surfaces are retired.',
      id: 'done',
      items: [
        {
          description:
            'Teachers can create reusable structured activities, publish assignment links, and keep snapshots stable for student attempts.',
          title: 'Activity to assignment loop',
        },
        {
          description:
            'Quiz, matching games, group sorting, line matching, fill-ins, listening, pair matching, and box reveal modes share one content model.',
          title: 'Playable template foundation',
        },
      ],
      status: 'Live',
      title: 'Available now',
    },
    {
      description:
        'Current focus: make results, worksheet delivery, and template polish more classroom-ready.',
      id: 'in-progress',
      items: [
        {
          description:
            'Make completion, scores, item misses, exports, and review filters clearer for teacher follow-up.',
          title: 'Results and reteach summaries',
        },
        {
          description:
            'Tighten printable follow-up, fill-in, line matching, and listening flows around the same assignment snapshot.',
          title: 'Worksheet-style delivery',
        },
      ],
      status: 'Improving',
      title: 'Improving now',
    },
    {
      description:
        'Next product bets once the core classroom loop stays dependable.',
      id: 'backlog',
      items: [
        {
          description:
            'Turn teacher notes, vocabulary lists, and worksheet prompts into reviewable activity drafts without bypassing teacher control.',
          title: 'AI-assisted activity drafting',
        },
        {
          description:
            'Read teacher-uploaded worksheets into structured prompts, accepted answers, and printable follow-up modes.',
          title: 'Worksheet extraction',
        },
        {
          description:
            'Add multi-teacher sharing, class-level result retention, and permission rules for schools and learning centers.',
          title: 'School team workflows',
        },
      ],
      status: 'Exploring',
      title: 'Next bets',
    },
  ],
  hero: {
    badgeLabel: 'Product direction',
    description:
      'A practical view of what is already usable, what is being tightened now, and where AI-assisted classroom activity creation comes next.',
    primaryActionLabel: 'Create activity',
    secondaryActionLabel: 'Browse templates',
    title: 'ClassGamify product roadmap',
  },
  principles: [
    {
      description:
        'We build around the Activity -> Assignment -> Attempt -> Results loop before adding parallel surfaces.',
      id: 'focus',
      title: 'Core loop before breadth',
    },
    {
      description:
        'The same structured content should render as games, worksheets, listening prompts, and printable follow-up.',
      id: 'learning',
      title: 'One content model',
    },
    {
      description:
        'Classroom and learning-center workflows should handle sharing links, student names, result retention, and team permissions deliberately.',
      id: 'validation',
      title: 'School-ready operations',
    },
  ],
  snapshots: [
    {
      description:
        'Reusable activities, assignment links, student runners, and teacher result review are the product foundation.',
      id: 'live',
      title: 'Usable classroom core',
    },
    {
      description:
        'The next passes deepen worksheet-style delivery, listening prompts, drag interactions, and reteach summaries.',
      id: 'loop',
      title: 'Template depth now',
    },
    {
      description:
        'AI should draft, remix, differentiate, and summarize inside the teacher-reviewed activity model.',
      id: 'expansion',
      title: 'AI and worksheet extraction next',
    },
  ],
  validation: {
    ctaLabel: 'Share classroom feedback',
    description:
      'We prioritize work that can be tested in the teacher flow, improves assignment delivery or review, and strengthens the data model instead of creating one-off demos.',
    eyebrowLabel: 'How we decide',
    title: 'Every roadmap item needs classroom proof',
  },
});
assert.deepEqual(buildTeachersPageViewModel(), {
  hero: {
    badgeLabel: 'Teachers and learning teams',
    description:
      'ClassGamify supports the real Wordwall-style loop: create an activity, switch templates, publish a share link, and review student results.',
    primaryActionLabel: 'Create activity',
    secondaryActionLabel: 'Talk to us',
    title:
      'Build repeatable game-based assignments from the lessons you already teach.',
  },
  schoolCta: {
    description:
      'Multi-teacher use needs thoughtful decisions about student names, result retention, template sharing, and classroom permissions.',
    label: 'Contact us',
    title: 'Need a school or learning-center workflow?',
  },
  templatePanel: {
    templates: activityTemplates.map((template) => ({
      classroomMode: formatActivityTemplateClassroomMode(
        template.classroomMode
      ),
      name: template.name,
      templateType: template.type,
    })),
    title: 'First template families',
  },
  useCases: [
    {
      description:
        'Assign short games after class and see which students completed the activity.',
      id: 'classrooms',
      title: 'Classroom homework',
    },
    {
      description:
        'Use box reveals, listening, line matching, sorting, and matching activities for warmups, review rounds, or small groups.',
      id: 'games',
      title: 'Live classroom play',
    },
    {
      description:
        'Use completions and scores to decide which items need reteaching or another activity.',
      id: 'results',
      title: 'Result follow-up',
    },
  ],
  workflow: [
    {
      description:
        'Paste vocabulary, questions, examples, or worksheet prompts into one structured activity model.',
      id: 'draft',
      title: 'Start from lesson content',
    },
    {
      description:
        'Render the same content as quiz, matching games, line matching, group sorting, fill-ins, listening, pair matching, or box reveal play.',
      id: 'publish',
      title: 'Choose a game template',
    },
    {
      description:
        'Share a public student link while keeping the reusable activity in the teacher library.',
      id: 'share',
      title: 'Publish an assignment',
    },
  ],
});
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const template = getTemplateByType(templateType);

  assert.equal(template.type, templateType);
  assert.ok(template.name.length > 0);
  assert.ok(template.contentRequirements.length > 0);
}
const worksheetModeDefinitions = getWorksheetModeDefinitions();
const worksheetsPageView = buildWorksheetsPageViewModel();
assert.deepEqual(WORKSHEET_MODE_TEMPLATES, [
  'fill-blank',
  'line-match',
  'listening',
  'group-sort',
]);
assert.deepEqual(
  worksheetModeDefinitions.map((mode) => mode.template),
  [...WORKSHEET_MODE_TEMPLATES]
);
assert.equal(
  WORKSHEET_MODE_TEMPLATES.every((templateType) =>
    isActivityTemplateType(templateType)
  ),
  true
);
assert.equal(
  worksheetModeDefinitions.every(
    (mode) => mode.action.length > 0 && mode.description.length > 0
  ),
  true
);
assert.deepEqual(
  worksheetModeDefinitions.map((mode) => mode.template),
  WORKSHEET_MODE_TEMPLATES.map(
    (templateType) => getTemplateByType(templateType).type
  )
);
for (const templateType of WORKSHEET_MODE_TEMPLATES) {
  const scaffold = getActivityTemplateScaffold(templateType);

  assert.ok(scaffold.title.length > 0);
  assert.ok(scaffold.description.length > 0);
}
assert.deepEqual(
  worksheetsPageView.heroActions.map((action) => action.template),
  [...WORKSHEET_MODE_TEMPLATES]
);
assert.deepEqual(
  worksheetsPageView.modeCards.map((card) => card.template),
  [...WORKSHEET_MODE_TEMPLATES]
);
assert.deepEqual(worksheetsPageView, {
  hero: {
    badgeLabel: 'Liveworksheets-style modes',
    description:
      'ClassGamify treats fill-in practice, line matching, listening, and classification as playable assignment templates. Teachers create reusable content once, publish a student link, and review results without exposing answer keys before submission.',
    title: 'Worksheet modes for the same activity content.',
  },
  heroActions: [
    {
      isPrimary: true,
      label: 'Create fill blanks',
      search: { template: 'fill-blank' },
      template: 'fill-blank',
    },
    {
      isPrimary: false,
      label: 'Start line match',
      search: { template: 'line-match' },
      template: 'line-match',
    },
    {
      isPrimary: false,
      label: 'Create listening',
      search: { template: 'listening' },
      template: 'listening',
    },
    {
      isPrimary: false,
      label: 'Create sort',
      search: { template: 'group-sort' },
      template: 'group-sort',
    },
  ],
  modeCards: [
    {
      action: {
        label: 'Create fill blanks',
        search: { template: 'fill-blank' },
      },
      description:
        'Place short answers directly into sentence gaps for grammar, spelling, vocabulary, or reading checks.',
      template: 'fill-blank',
      title: 'Fill blanks',
    },
    {
      action: {
        label: 'Start line match',
        search: { template: 'line-match' },
      },
      description:
        'Turn terms and definitions into a two-column connection board that feels familiar to worksheet users.',
      template: 'line-match',
      title: 'Line matching',
    },
    {
      action: {
        label: 'Create listening',
        search: { template: 'listening' },
      },
      description:
        'Use spoken tracks for dictation, comprehension, or pronunciation follow-up while hiding transcripts before review.',
      template: 'listening',
      title: 'Listening prompts',
    },
    {
      action: {
        label: 'Create sort',
        search: { template: 'group-sort' },
      },
      description:
        'Ask learners to classify words, examples, or concepts into teacher-defined groups before seeing the answer pattern.',
      template: 'group-sort',
      title: 'Drag sorting',
    },
  ],
  printable: {
    description:
      'The first product pass focuses on interactive worksheets with scoring, attempts, accepted answers, and result exports. Printable practice and teacher-uploaded worksheet extraction should extend the same activity snapshot and results model instead of creating a separate worksheet product.',
    title: 'Printable follow-up can build on the same assignment record.',
  },
  resultSignals: [
    'Attempt summaries',
    'Accepted answer alternatives',
    'Reteach priorities',
    'CSV export',
  ],
  templatesCta: {
    description:
      'Browse the full template library to switch the same structured content into quiz, matching games, box reveals, and group play.',
    label: 'Browse templates',
    title: 'Want a different game view for the same lesson?',
  },
  workflowSteps: [
    'Paste lesson material once into questions, pairs, groups, vocabulary, and notes.',
    'Choose a worksheet-style template and review the example before saving.',
    'Publish a student assignment link with attempts, timer, answer reveal, and close time.',
    'Review submissions, accepted answers, reteach priorities, and CSV exports.',
  ],
});
assert.deepEqual(
  getWorksheetModeDefinitions().map((mode) =>
    buildWorksheetModeEntryAction(mode)
  ),
  getWorksheetModeDefinitions().map((mode) => ({
    label: mode.action,
    search: { template: mode.template },
  }))
);
assert.deepEqual(buildWorksheetHeroActions(getWorksheetModeDefinitions()), [
  {
    isPrimary: true,
    label: 'Create fill blanks',
    search: { template: 'fill-blank' },
    template: 'fill-blank',
  },
  {
    isPrimary: false,
    label: 'Start line match',
    search: { template: 'line-match' },
    template: 'line-match',
  },
  {
    isPrimary: false,
    label: 'Create listening',
    search: { template: 'listening' },
    template: 'listening',
  },
  {
    isPrimary: false,
    label: 'Create sort',
    search: { template: 'group-sort' },
    template: 'group-sort',
  },
]);
assert.deepEqual(
  buildWorksheetHeroActions(
    getWorksheetModeDefinitions().filter(
      (mode) => mode.template !== 'line-match'
    )
  )[1],
  {
    isPrimary: false,
    label: 'Create Lines',
    search: { template: 'line-match' },
    template: 'line-match',
  }
);
const worksheetsPageWithoutLineMatch = buildWorksheetsPageViewModel({
  worksheetModeDefinitions: worksheetModeDefinitions.filter(
    (mode) => mode.template !== 'line-match'
  ),
});
assert.deepEqual(
  worksheetsPageWithoutLineMatch.heroActions.map((action) => action.template),
  [...WORKSHEET_MODE_TEMPLATES]
);
assert.deepEqual(worksheetsPageWithoutLineMatch.heroActions[1], {
  isPrimary: false,
  label: 'Create Lines',
  search: { template: 'line-match' },
  template: 'line-match',
});
assert.deepEqual(
  worksheetsPageWithoutLineMatch.modeCards.map((card) => card.template),
  ['fill-blank', 'listening', 'group-sort']
);
const templateEntrySource = readFileSync(
  'src/activities/template-entry.ts',
  'utf8'
);
const entryPageViewSource = readFileSync(
  'src/activities/entry-page-view.ts',
  'utf8'
);
const publicCopyMessages = {
  en: JSON.parse(
    readFileSync('project.inlang/messages/en.json', 'utf8')
  ) as Record<string, string>,
  zh: JSON.parse(
    readFileSync('project.inlang/messages/zh.json', 'utf8')
  ) as Record<string, string>,
};
const rawTemplateIdCopyPattern =
  /(?:fill-blank|group-sort|line-match|match-up|matching-pairs|open-box)/i;
for (const [locale, messages] of Object.entries(publicCopyMessages) as [
  'en' | 'zh',
  Record<string, string>,
][]) {
  for (const [key, value] of Object.entries(messages)) {
    assert.doesNotMatch(
      value,
      rawTemplateIdCopyPattern,
      `${locale}.${key} should not expose raw template ids.`
    );
  }
}
assert.match(
  templateEntrySource,
  /getTemplateByType\(template\)[\s\S]*fallbackTemplate\.shortName/,
  'Worksheet fallback actions should use localized template short names.'
);
assert.doesNotMatch(
  templateEntrySource,
  /worksheets_page_mode_fallback_action\(\{ template \}\)/,
  'Worksheet fallback actions should not render raw internal template ids.'
);
assert.match(
  entryPageViewSource,
  /buildWorksheetHeroActions\(worksheetModeDefinitions\)/,
  'Worksheets page view-model should reuse the worksheet hero action helper.'
);
assert.match(
  entryPageViewSource,
  /formatTemplateRequirements\([\s\S]*template\.contentRequirements/,
  'Template entry page view-model should use the activity-domain requirement list formatter.'
);
assert.doesNotMatch(
  entryPageViewSource,
  /const heroActions = worksheetModeDefinitions\.map/,
  'Worksheets page view-model should not rebuild hero actions locally.'
);
assert.doesNotMatch(
  entryPageViewSource,
  /template\.contentRequirements\.map\(\(requirement\) =>[\s\S]*formatTemplateRequirement\(requirement\)/,
  'Template entry page view-model should not map requirement labels locally.'
);
overwriteGetLocale(() => 'zh');
try {
  assert.deepEqual(
    buildWorksheetHeroActions(
      getWorksheetModeDefinitions().filter(
        (mode) => mode.template !== 'line-match'
      )
    )[1],
    {
      isPrimary: false,
      label: '创建连线',
      search: { template: 'line-match' },
      template: 'line-match',
    }
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(formatDashboardMetricValue(undefined), '-');
assert.equal(formatDashboardMetricValue(0), '0');
assert.equal(formatDashboardMetricValue(Number.NaN), '-');
assert.equal(formatDashboardMetricValue(-3), '0');
assert.equal(
  formatDashboardTemplateCoverageValue(undefined),
  `0/${ACTIVITY_TEMPLATE_TYPES.length}`
);
assert.equal(
  formatDashboardTemplateCoverageValue(Number.NaN),
  `0/${ACTIVITY_TEMPLATE_TYPES.length}`
);
assert.equal(
  formatDashboardTemplateCoverageValue(-3),
  `0/${ACTIVITY_TEMPLATE_TYPES.length}`
);
assert.equal(
  formatDashboardTemplateCoverageValue(2.4),
  `2/${ACTIVITY_TEMPLATE_TYPES.length}`
);
assert.deepEqual(
  buildDashboardOverviewMetrics({
    isLoading: true,
  }),
  [
    {
      description: 'Loading your library...',
      id: 'activities',
      label: 'Activities',
      value: '-',
    },
    {
      description: 'Template families represented by your active activities',
      id: 'templates',
      label: 'Templates',
      value: `0/${ACTIVITY_TEMPLATE_TYPES.length}`,
    },
    {
      description: 'Open classroom share links',
      id: 'assignments',
      label: 'Assignments',
      value: '-',
    },
    {
      description: '0 submitted attempts logged',
      id: 'results',
      label: 'Results',
      value: '0%',
    },
  ]
);
assert.deepEqual(
  buildDashboardOverviewMetrics({
    activitySummary: {
      draftActivities: 2,
      templateCoverage: 5,
      totalActivities: 9,
    },
    assignmentSummary: {
      averageScore: 82.6,
      completions: 14,
      openAssignments: 3,
      totalAssignments: 6,
    },
    isLoading: false,
  }),
  [
    {
      description: '2 drafts in your active library',
      id: 'activities',
      label: 'Activities',
      value: '9',
    },
    {
      description: 'Template families represented by your active activities',
      id: 'templates',
      label: 'Templates',
      value: `5/${ACTIVITY_TEMPLATE_TYPES.length}`,
    },
    {
      description: 'Open classroom share links',
      id: 'assignments',
      label: 'Assignments',
      value: '3',
    },
    {
      description: '14 submitted attempts logged',
      id: 'results',
      label: 'Results',
      value: '83%',
    },
  ]
);
assert.equal(
  buildDashboardOverviewMetrics({
    activitySummary: {
      draftActivities: 0,
      templateCoverage: Number.NaN,
      totalActivities: 1,
    },
    isLoading: false,
  })[1]?.value,
  `0/${ACTIVITY_TEMPLATE_TYPES.length}`
);
assert.equal(
  buildDashboardOverviewMetrics({
    assignmentSummary: {
      averageScore: Number.NaN,
      completions: 1,
      openAssignments: 1,
      totalAssignments: 1,
    },
    isLoading: false,
  })[3]?.value,
  '-'
);
const dashboardOverviewPageView = buildDashboardOverviewPageViewModel({
  activitySummary: {
    draftActivities: 2,
    templateCoverage: 5,
    totalActivities: 9,
  },
  assignmentSummary: {
    averageScore: 82.6,
    completions: 14,
    openAssignments: 3,
    totalAssignments: 6,
  },
  isLoading: false,
});
const dashboardOverviewStarterPreview = buildDashboardOverviewStarterPreview();
assert.deepEqual(
  {
    activityId: dashboardOverviewStarterPreview.activity.id,
    assignmentActivityId: dashboardOverviewStarterPreview.assignment.activityId,
    source: dashboardOverviewStarterPreview.source,
  },
  {
    activityId: 'english-food-quiz',
    assignmentActivityId: 'english-food-quiz',
    source: 'starter-preview',
  }
);
assert.deepEqual(
  {
    activityId: dashboardOverviewPageView.preview.activity.id,
    assignmentId: dashboardOverviewPageView.preview.assignment.id,
    source: dashboardOverviewPageView.preview.source,
  },
  {
    activityId: 'english-food-quiz',
    assignmentId: 'assignment-food-demo',
    source: 'starter-preview',
  }
);
assert.deepEqual(
  {
    actionCardIds: dashboardOverviewPageView.actionCards.map((card) => card.id),
    metricIds: dashboardOverviewPageView.metrics.map((metric) => metric.id),
    readinessValues: dashboardOverviewPageView.readinessRows.map((row) => [
      row.id,
      row.value,
    ]),
  },
  {
    actionCardIds: ['activities', 'assignments', 'student-preview'],
    metricIds: ['activities', 'templates', 'assignments', 'results'],
    readinessValues: [
      ['activity-authoring', 100],
      ['assignment-links', 100],
      ['student-runner', 100],
      ['teacher-results', 100],
    ],
  }
);
assert.deepEqual(buildDashboardCoreLoopReadiness(), [
  {
    id: 'activity-authoring',
    label: 'Activity authoring',
    value: 0,
  },
  {
    id: 'assignment-links',
    label: 'Assignment links',
    value: 0,
  },
  {
    id: 'student-runner',
    label: 'Student runner',
    value: 0,
  },
  {
    id: 'teacher-results',
    label: 'Teacher results',
    value: 0,
  },
]);
assert.deepEqual(
  buildDashboardCoreLoopReadiness({
    activitySummary: {
      draftActivities: 1,
      templateCoverage: 1,
      totalActivities: 1,
    },
    assignmentSummary: {
      averageScore: 0,
      completions: 0,
      openAssignments: 0,
      totalAssignments: 0,
    },
  }),
  [
    {
      id: 'activity-authoring',
      label: 'Activity authoring',
      value: 100,
    },
    {
      id: 'assignment-links',
      label: 'Assignment links',
      value: 0,
    },
    {
      id: 'student-runner',
      label: 'Student runner',
      value: 0,
    },
    {
      id: 'teacher-results',
      label: 'Teacher results',
      value: 0,
    },
  ]
);
assert.deepEqual(
  buildDashboardCoreLoopReadiness({
    activitySummary: {
      draftActivities: 0,
      templateCoverage: 2,
      totalActivities: 2,
    },
    assignmentSummary: {
      averageScore: 0,
      completions: 0,
      openAssignments: 1,
      totalAssignments: 1,
    },
  }),
  [
    {
      id: 'activity-authoring',
      label: 'Activity authoring',
      value: 100,
    },
    {
      id: 'assignment-links',
      label: 'Assignment links',
      value: 100,
    },
    {
      id: 'student-runner',
      label: 'Student runner',
      value: 75,
    },
    {
      id: 'teacher-results',
      label: 'Teacher results',
      value: 0,
    },
  ]
);
assert.deepEqual(
  buildDashboardCoreLoopReadiness({
    activitySummary: {
      draftActivities: 0,
      templateCoverage: 3,
      totalActivities: 3,
    },
    assignmentSummary: {
      averageScore: 86,
      completions: 8,
      openAssignments: 0,
      totalAssignments: 2,
    },
  }),
  [
    {
      id: 'activity-authoring',
      label: 'Activity authoring',
      value: 100,
    },
    {
      id: 'assignment-links',
      label: 'Assignment links',
      value: 60,
    },
    {
      id: 'student-runner',
      label: 'Student runner',
      value: 100,
    },
    {
      id: 'teacher-results',
      label: 'Teacher results',
      value: 100,
    },
  ]
);
assert.deepEqual(
  buildDashboardCoreLoopReadiness({
    activitySummary: {
      draftActivities: Number.NaN,
      templateCoverage: Number.NaN,
      totalActivities: Number.NaN,
    },
    assignmentSummary: {
      averageScore: Number.NaN,
      completions: Number.POSITIVE_INFINITY,
      openAssignments: -1,
      totalAssignments: 1.4,
    },
  }),
  [
    {
      id: 'activity-authoring',
      label: 'Activity authoring',
      value: 0,
    },
    {
      id: 'assignment-links',
      label: 'Assignment links',
      value: 60,
    },
    {
      id: 'student-runner',
      label: 'Student runner',
      value: 40,
    },
    {
      id: 'teacher-results',
      label: 'Teacher results',
      value: 0,
    },
  ]
);
assert.deepEqual(dashboardOverviewPageCopy, {
  breadcrumbLabel: 'Dashboard',
  description:
    'Manage reusable activities, publish classroom assignments, and track student attempts from one workspace.',
  heroBadge: 'Teacher workspace',
  heroDescription:
    'ClassGamify separates reusable teacher activities from published assignments and student attempts. Create, publish, play, and review now share one activity data contract that AI drafting and template remixing can build on.',
  heroPrimaryAction: 'Create activity',
  heroSecondaryAction: 'Open activity library',
  heroTitle: 'Activity content is now the center of the product.',
  loopBadge: 'Wordwall-core loop',
  readinessTitle: 'Core loop readiness',
  title: 'Teacher dashboard',
});
const dashboardOverviewRouteSource = readFileSync(
  'src/routes/dashboard/index.tsx',
  'utf8'
);
const dashboardOverviewActionCardSource = readFileSync(
  'src/components/dashboard/dashboard-overview-action-card.tsx',
  'utf8'
);
const dashboardOverviewMetricCardSource = readFileSync(
  'src/components/dashboard/dashboard-overview-metric-card.tsx',
  'utf8'
);
const dashboardOverviewReadinessRowSource = readFileSync(
  'src/components/dashboard/dashboard-overview-readiness-row.tsx',
  'utf8'
);
assert.match(
  dashboardOverviewRouteSource,
  /useActivities\(\{[\s\S]*pageIndex: 0,[\s\S]*pageSize: 1,[\s\S]*status: 'active'/,
  'Dashboard overview metrics should read the owner-scoped activity summary from the activities API.'
);
assert.match(
  dashboardOverviewRouteSource,
  /useAssignments\(\{[\s\S]*pageIndex: 0,[\s\S]*pageSize: 1/,
  'Dashboard overview metrics should read the owner-scoped assignment summary from the assignments API.'
);
assert.match(
  dashboardOverviewRouteSource,
  /buildDashboardOverviewPageViewModel\(\{[\s\S]*activitySummary: activitiesData\?\.summary,[\s\S]*assignmentSummary: assignmentsData\?\.summary,[\s\S]*isLoading: activitiesLoading \|\| assignmentsLoading/,
  'Dashboard overview route should pass owner-scoped API summaries into the page view-model.'
);
assert.doesNotMatch(
  dashboardOverviewRouteSource,
  /buildDashboardOverviewMetrics|buildDashboardCoreLoopReadiness|getDashboardOverviewActionCards/,
  'Dashboard overview route should not directly rebuild metrics, readiness rows, or action cards.'
);
assert.match(
  dashboardOverviewRouteSource,
  /DashboardOverviewMetricCard/,
  'Dashboard overview route should delegate metric card rendering to the dashboard overview metric component.'
);
assert.match(
  dashboardOverviewRouteSource,
  /DashboardOverviewReadinessRow/,
  'Dashboard overview route should delegate readiness row rendering to the dashboard overview readiness component.'
);
assert.match(
  dashboardOverviewRouteSource,
  /DashboardOverviewActionCard/,
  'Dashboard overview route should delegate action card rendering to the dashboard overview action component.'
);
assert.doesNotMatch(
  dashboardOverviewRouteSource,
  /function (?:MetricCard|ReadinessRow|ActionCard)\(|dashboardMetricIcons|dashboardActionIcons|dashboardActionHrefs|Progress/,
  'Dashboard overview route should not own local metric, readiness, action-card, icon, href, or progress rendering details.'
);
assert.match(
  dashboardOverviewMetricCardSource,
  /dashboardMetricIcons/,
  'Dashboard overview metric component should own metric icon mapping.'
);
assert.match(
  dashboardOverviewReadinessRowSource,
  /Progress/,
  'Dashboard overview readiness component should own readiness progress rendering.'
);
assert.match(
  dashboardOverviewActionCardSource,
  /dashboardActionIcons[\s\S]*dashboardActionHrefs/,
  'Dashboard overview action component should own action icon and route mapping.'
);
assert.match(
  dashboardOverviewRouteSource,
  /<ActivityPreview[\s\S]*activity=\{pageView\.preview\.activity\}[\s\S]*assignment=\{pageView\.preview\.assignment\}[\s\S]*\/>/,
  'Dashboard starter activity and assignment should render only through the dashboard preview view-model.'
);
assert.doesNotMatch(
  dashboardOverviewRouteSource,
  /getStarterActivity|getStarterAssignment|getStarterActivities|getStarterAssignments/,
  'Dashboard overview route should not pull starter catalog data directly into owner-scoped metric surfaces.'
);
assert.deepEqual(
  getDashboardOverviewActionCards().map((card) => [
    card.id,
    card.title,
    card.cta,
  ]),
  [
    ['activities', 'Activities', 'Open activities'],
    ['assignments', 'Assignments', 'Open assignments'],
    ['student-preview', 'Student preview', 'Open student preview'],
  ]
);
assert.deepEqual(
  buildDashboardPaginationView({
    currentPage: 2,
    itemKind: 'activities',
    pageSize: 12,
    total: 31,
    totalPages: 3,
  }),
  {
    ariaLabel: 'Activity pages',
    nextLabel: 'Next',
    pageLabel: 'Page 2 of 3',
    previousLabel: 'Previous',
    summary: 'Showing 13-24 of 31 activities',
  }
);
assert.deepEqual(
  buildDashboardPaginationView({
    currentPage: 1,
    itemKind: 'assignments',
    pageSize: 12,
    total: 4,
    totalPages: 1,
  }),
  {
    ariaLabel: 'Assignment pages',
    nextLabel: 'Next',
    pageLabel: 'Page 1 of 1',
    previousLabel: 'Previous',
    summary: 'Showing 1-4 of 4 assignments',
  }
);
overwriteGetLocale(() => 'zh');
try {
  assert.deepEqual(
    buildDashboardPaginationView({
      currentPage: 2,
      itemKind: 'activities',
      pageSize: 12,
      total: 31,
      totalPages: 3,
    }),
    {
      ariaLabel: '活动分页',
      nextLabel: '下一页',
      pageLabel: '第 2 页，共 3 页',
      previousLabel: '上一页',
      summary: '显示第 13-24 项，共 31 个活动',
    }
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(isActivityArchived('archived'), true);
assert.equal(isActivityArchived('draft'), false);
assert.equal(canDeriveActivityWork('draft'), true);
assert.equal(canDeriveActivityWork('published'), true);
assert.equal(canDeriveActivityWork('archived'), false);
assert.equal(canEditActivity('draft'), true);
assert.equal(canEditActivity('published'), true);
assert.equal(canEditActivity('archived'), false);
const archivedActivityDerivationError = getArchivedActivityDerivationError();
assert.deepEqual(
  buildActivityDerivativeActionGate({
    action: 'publish',
    visibility: 'draft',
  }),
  { type: 'ready' }
);
assert.deepEqual(
  buildActivityDerivativeActionGate({
    action: 'duplicate',
    visibility: 'archived',
  }),
  {
    action: 'duplicate',
    message: archivedActivityDerivationError,
    type: 'blocked',
  }
);
assert.deepEqual(getActivityLifecycleActionCopy('publish'), {
  failureMessage: 'Assignment could not be published.',
  successMessage: 'Assignment link published.',
});
assert.deepEqual(getActivityLifecycleActionCopy('remix'), {
  failureMessage: 'Activity could not be remixed.',
  successMessage: 'Template remix created.',
});
assert.deepEqual(getActivityLifecycleActionCopy('duplicate'), {
  failureMessage: 'Activity could not be duplicated.',
  successMessage: 'Activity duplicated.',
});
assert.deepEqual(getActivityLifecycleActionCopy('archive'), {
  failureMessage: 'Activity could not be archived.',
  successMessage: 'Activity archived.',
});
assert.deepEqual(getActivityLifecycleActionCopy('restore'), {
  failureMessage: 'Activity could not be restored.',
  successMessage: 'Activity restored to drafts.',
});
assert.deepEqual(
  buildActivityLifecycleActionView({
    action: 'remix',
    visibility: 'published',
  }),
  {
    failureMessage: 'Activity could not be remixed.',
    gate: { type: 'ready' },
    successMessage: 'Template remix created.',
  }
);
assert.deepEqual(
  buildActivityLifecycleActionView({
    action: 'publish',
    visibility: 'archived',
  }),
  {
    failureMessage: 'Assignment could not be published.',
    gate: {
      action: 'publish',
      message: archivedActivityDerivationError,
      type: 'blocked',
    },
    successMessage: 'Assignment link published.',
  }
);
assert.deepEqual(buildActivityEditAccessView('draft'), {
  actionLabel: 'Edit activity',
  canEdit: true,
  description:
    'Update reusable activity content before publishing or reusing it across templates.',
  title: 'Edit reusable activity',
});
assert.deepEqual(buildActivityEditAccessView('archived'), {
  actionLabel: 'Open archived activities',
  canEdit: false,
  description:
    'Restore this activity from the archived library before editing its structured content.',
  title: 'Activity is archived.',
});
assert.doesNotThrow(() => assertActivityCanDeriveWork('draft'));
assert.throws(
  () => assertActivityCanDeriveWork('archived'),
  new Error(archivedActivityDerivationError)
);
assert.doesNotThrow(() => assertActivityCanEdit('draft'));
assert.throws(
  () => assertActivityCanEdit('archived'),
  new Error(
    'Restore this activity from the archived library before editing its structured content.'
  )
);
assert.deepEqual(activityEditPageCopy, {
  backToLibraryLabel: 'Back to library',
  breadcrumbActivities: 'Activities',
  breadcrumbDashboard: 'Dashboard',
  fallbackDescription:
    'Update reusable activity content before publishing or reusing it across templates.',
  fallbackTitle: 'Edit activity',
  loadErrorMessage:
    'Activity could not be loaded. Refresh the page or return to the activity library.',
});
assert.deepEqual(buildActivityEditPageViewModel(undefined), {
  archivedActivitiesAction: {
    href: '/dashboard/activities',
    search: { status: 'archived' },
  },
  backAction: {
    href: '/dashboard/activities',
    label: 'Back to library',
  },
  breadcrumbs: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/activities', label: 'Activities' },
    { isCurrentPage: true, label: 'Edit activity' },
  ],
  description:
    'Update reusable activity content before publishing or reusing it across templates.',
  editAccessView: null,
  editor: undefined,
  loadErrorMessage:
    'Activity could not be loaded. Refresh the page or return to the activity library.',
  title: 'Edit activity',
});
assert.deepEqual(activityLibraryPageCopy, {
  breadcrumbCurrent: 'Activities',
  breadcrumbDashboard: 'Dashboard',
  createActivityLabel: 'Create activity',
  description:
    'Reusable teacher-owned activities. Each activity stores template-neutral content so it can render as different classroom games.',
  loadErrorMessage:
    'Activities could not be loaded. Refresh the page or sign in again.',
  title: 'Activity library',
});
assert.deepEqual(activityLibraryHeroCopy, {
  badgeLabel: 'Structured activity content',
  description:
    'The activity model separates questions, pairs, groups, vocabulary, and teacher notes. Template switching and AI creation can both build on this shared contract.',
  title: 'One lesson, several renderings.',
});
assert.equal(
  activityLibrarySearchCopy.placeholder,
  'Search by title, description, or template'
);
assert.deepEqual(
  activityLibrarySearchCopy.statusOptions.map((option) => option.value),
  ['active', 'archived']
);
assert.equal(activityLibrarySearchCopy.sourceLabel, 'Source material');
assert.deepEqual(
  activityLibrarySearchCopy.sourceOptions.map((option) => option.value),
  ['all', 'extractable', 'audio', 'spreadsheet', 'worksheet']
);
assert.deepEqual(
  buildActivityLibraryTemplateFilterOptions().map((option) => option.value),
  [
    'all',
    'quiz',
    'match-up',
    'line-match',
    'group-sort',
    'fill-blank',
    'listening',
    'matching-pairs',
    'open-box',
  ]
);
assert.deepEqual(
  buildActivityLibrarySearchPanelView({
    isLoading: false,
    search: '  food  ',
    source: 'worksheet',
    status: 'active',
    template: 'quiz',
    total: 3,
  }),
  {
    filterSummary: { hasFilters: true, text: '3 matches' },
    hasSearchValue: true,
    sourceOptions: activityLibrarySearchCopy.sourceOptions,
    statusOptions: activityLibrarySearchCopy.statusOptions,
    templateOptions: buildActivityLibraryTemplateFilterOptions(),
  }
);
assert.deepEqual(
  buildActivityLibrarySearchPanelView({
    isLoading: true,
    search: '',
    source: 'all',
    status: 'active',
    template: 'all',
    total: 0,
  }).filterSummary,
  { hasFilters: false, text: 'Loading activities...' }
);
assert.equal(
  buildActivityLibrarySearchPanelView({
    isLoading: false,
    search: '   ',
    source: 'all',
    status: 'active',
    template: 'all',
    total: 0,
  }).hasSearchValue,
  false
);
assert.deepEqual(
  buildActivityLibraryEmptyStateView({
    search: undefined,
    status: 'active',
    template: 'all',
  }),
  {
    actionLabel: 'Create activity',
    description:
      'Create the first reusable classroom activity, then publish it as a student assignment link for your class.',
    showStarterActivities: true,
    title: 'No saved activities yet.',
  }
);
assert.deepEqual(
  buildActivityLibraryEmptyStateView({
    search: undefined,
    status: 'archived',
    template: 'all',
  }),
  {
    actionLabel: 'Clear filters',
    description:
      'Archived activities will appear here after you move them out of the active library.',
    showStarterActivities: false,
    title: 'No archived activities.',
  }
);
assert.deepEqual(
  buildActivityLibraryEmptyStateView({
    search: 'vocab',
    status: 'active',
    template: 'quiz',
  }),
  {
    actionLabel: 'Clear filters',
    description:
      'Try another title, description, template keyword, or template family from your classroom activity library.',
    showStarterActivities: false,
    title: 'No matching activities.',
  }
);
assert.deepEqual(activityLibraryCardCopy.actionLabels, {
  archive: 'Archive',
  duplicate: 'Duplicate',
  edit: 'Edit activity',
  publish: 'Publish assignment',
  restore: 'Restore',
});
assert.equal(
  activityLibraryCardCopy.compatibleTemplatesLabel,
  'Compatible template families'
);
assert.equal(
  activityLibraryCardCopy.restoreRequiredMessage,
  archivedActivityDerivationError
);
assert.deepEqual(
  buildActivityLibraryCardStats({
    groups: 2,
    pairs: 4,
    questions: 3,
  }),
  [
    { key: 'questions', label: 'Questions', value: 3 },
    { key: 'pairs', label: 'Pairs', value: 4 },
    { key: 'groups', label: 'Groups', value: 2 },
  ]
);
const starterActivityCardView = buildStarterActivityLibraryCardViewModel(
  starterActivities[0]
);
assert.deepEqual(
  buildActivityLibraryCardViewModel({
    contentJson: starterActivities[0].content,
    description: null,
    id: 'persisted-activity-1',
    templateType: 'line-match',
    title: 'Persisted line match',
    visibility: 'private',
  }),
  {
    content: starterActivities[0].content,
    description: '',
    id: 'persisted-activity-1',
    persisted: true,
    status: 'private',
    templateType: 'line-match',
    title: 'Persisted line match',
  }
);
assert.deepEqual(starterActivityCardView, {
  content: starterActivities[0].content,
  description: starterActivities[0].description,
  id: starterActivities[0].id,
  persisted: false,
  status: starterActivities[0].status,
  templateType: starterActivities[0].templateType,
  title: starterActivities[0].title,
});
const starterActivityDisplayView = buildActivityLibraryCardDisplayView({
  activity: starterActivityCardView,
  libraryStatus: 'active',
});
assert.equal(starterActivityDisplayView.templateName, 'Quiz');
assert.equal(starterActivityDisplayView.templateType, 'quiz');
assert.equal(starterActivityDisplayView.statusLabel, 'Preview');
assert.deepEqual(starterActivityDisplayView.stats, [
  { key: 'questions', label: 'Questions', value: 3 },
  { key: 'pairs', label: 'Pairs', value: 4 },
  { key: 'groups', label: 'Groups', value: 2 },
]);
assert.deepEqual(starterActivityDisplayView.sourceMaterials, {
  countLabel: '0 files',
  extractionActions: [],
  extractionTitle: 'Ready for future AI extraction',
  hasMaterials: false,
  kindBadges: [],
  readiness: {
    capabilities: [],
    extractableCount: 0,
    hasAudio: false,
    hasSpreadsheet: false,
    hasWorksheet: false,
  },
  title: 'Source materials',
});
assert.deepEqual(
  buildActivityLibraryCardDisplayView({
    activity: {
      ...starterActivityCardView,
      content: {
        ...starterActivityCardView.content,
        sourceMaterials: [listeningMaterialReference],
      },
    },
    libraryStatus: 'active',
  }).sourceMaterials,
  {
    countLabel: '1 file',
    extractionActions: [
      {
        capability: 'audio-extraction',
        id: 'extract-audio',
        label: 'Audio extraction',
        sourceCount: 1,
        sourceKindCounts: [{ count: 1, kind: 'audio' }],
        sourceKindSummaryText: 'Audio · 1',
        summaryText: 'Audio extraction · Audio · 1',
      },
    ],
    extractionTitle: 'Ready for future AI extraction',
    hasMaterials: true,
    kindBadges: [
      {
        count: 1,
        kind: 'audio',
        label: 'Audio',
        summaryText: 'Audio · 1',
      },
    ],
    readiness: {
      capabilities: ['audio-extraction'],
      extractableCount: 1,
      hasAudio: true,
      hasSpreadsheet: false,
      hasWorksheet: false,
    },
    title: 'Source materials',
  }
);
assert.equal(formatActivityLibraryStatusLabel('archived'), 'Archived');
assert.equal(formatActivityLibraryStatusLabel('private'), 'Private');
assert.equal(
  buildActivityLibraryCardDisplayView({
    activity: {
      ...starterActivityCardView,
      status: 'archived',
    },
    libraryStatus: 'archived',
  }).statusLabel,
  'Preview'
);
assert.deepEqual(buildActivityLibraryCardActionView('archived').duplicate, {
  failureMessage: 'Activity could not be duplicated.',
  gate: {
    action: 'duplicate',
    message: archivedActivityDerivationError,
    type: 'blocked',
  },
  successMessage: 'Activity duplicated.',
});
assert.deepEqual(buildActivityLibraryCardActionView('draft').remix, {
  failureMessage: 'Activity could not be remixed.',
  gate: { type: 'ready' },
  successMessage: 'Template remix created.',
});
assert.deepEqual(buildActivityLibraryCardActionView('private').archive, {
  failureMessage: 'Activity could not be archived.',
  successMessage: 'Activity archived.',
});
assert.deepEqual(buildActivityLibraryCardActionView('archived').restore, {
  failureMessage: 'Activity could not be restored.',
  successMessage: 'Activity restored to drafts.',
});
assert.equal(
  starterActivityDisplayView.actionState.showPersistedActions,
  false
);
assert.ok(
  starterActivityDisplayView.compatibility.readyTemplateOptions.some(
    (option) => option.template === 'quiz' && option.isCurrent
  )
);
assert.equal(
  buildActivityLibraryRemixHint(['Quiz', ' Fill ', '']),
  'Ready to remix into Quiz, Fill.'
);
assert.equal(
  formatActivityLibraryTemplateShortNameList(['Quiz', ' Fill ', '']),
  'Quiz, Fill'
);
assert.equal(
  formatActivityLibraryTemplateShortNameList([
    '  Ｍａｔｃｈ   up  ',
    ' Ｆｉｌｌ　blank ',
    '',
  ]),
  'Match up, Fill blank'
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    formatActivityLibraryTemplateShortNameList(['测验', ' 填空 ', '']),
    '测验、填空'
  );
  assert.equal(
    buildActivityLibraryRemixHint(['测验', ' 填空 ', '']),
    '可改编为：测验、填空。'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(buildActivityLibraryRemixHint([]), undefined);
assert.equal(buildActivityLibraryRemixActionLabel('Fill'), 'Copy as Fill');
assert.equal(
  buildActivityLibraryRemixActionLabel('  Ｆｉｌｌ　blank  '),
  'Copy as Fill blank'
);
assert.equal(buildActivityLibraryRemixActionLabel('   '), 'Copy as template');
assert.deepEqual(
  buildActivityLibraryCardActionState({
    libraryStatus: 'active',
    persisted: true,
    readyRemixCount: 2,
    visibility: 'draft',
  }),
  {
    canCreateDerivedWork: true,
    showArchiveAction: true,
    showDerivativeActions: true,
    showEditAction: true,
    showPersistedActions: true,
    showPublishAction: true,
    showRestoreAction: false,
    showRestoreRequiredMessage: false,
    showRemixActions: true,
  }
);
assert.deepEqual(
  buildActivityLibraryCardActionState({
    libraryStatus: 'archived',
    persisted: true,
    readyRemixCount: 2,
    visibility: 'archived',
  }),
  {
    canCreateDerivedWork: false,
    showArchiveAction: false,
    showDerivativeActions: false,
    showEditAction: false,
    showPersistedActions: true,
    showPublishAction: false,
    showRestoreAction: true,
    showRestoreRequiredMessage: true,
    showRemixActions: false,
  }
);
assert.deepEqual(
  buildActivityLibraryCardActionState({
    libraryStatus: 'active',
    persisted: true,
    readyRemixCount: 2,
    visibility: 'archived',
  }),
  {
    canCreateDerivedWork: false,
    showArchiveAction: false,
    showDerivativeActions: false,
    showEditAction: false,
    showPersistedActions: true,
    showPublishAction: false,
    showRestoreAction: true,
    showRestoreRequiredMessage: true,
    showRemixActions: false,
  }
);
assert.deepEqual(
  buildActivityLibraryCardActionState({
    libraryStatus: 'active',
    persisted: false,
    readyRemixCount: 2,
    visibility: 'draft',
  }),
  {
    canCreateDerivedWork: true,
    showArchiveAction: false,
    showDerivativeActions: false,
    showEditAction: false,
    showPersistedActions: false,
    showPublishAction: false,
    showRestoreAction: false,
    showRestoreRequiredMessage: false,
    showRemixActions: false,
  }
);
assert.equal(
  buildActivityLibraryCardActionState({
    libraryStatus: 'active',
    persisted: true,
    readyRemixCount: 0,
    visibility: 'published',
  }).showRemixActions,
  false
);
assert.equal(normalizeAssignmentListSearch('  share   123  '), 'share 123');
assert.equal(normalizeAssignmentListSearch('  Ｗｅｅｋ   １  '), 'Week 1');
assert.equal(normalizeAssignmentListSearch('   '), undefined);
assert.deepEqual(ASSIGNMENT_LIST_INPUT_LIMITS, {
  pageSizeMax: 100,
  pageSizeMin: 1,
  searchMaxLength: 120,
});
assert.equal(ASSIGNMENT_LIST_PAGE_SIZE, 12);
assert.equal(getAssignmentListOffset({ pageIndex: 2, pageSize: 25 }), 50);
assert.equal(getAssignmentListOffset({ pageIndex: -1, pageSize: 25 }), 0);
assert.equal(getAssignmentListOffset({ pageIndex: 2, pageSize: 0 }), 24);
assert.equal(getAssignmentListTotalPages({ total: 0 }), 1);
assert.equal(getAssignmentListTotalPages({ pageSize: 12, total: 31 }), 3);
assert.equal(getAssignmentListTotalPages({ pageSize: 0, total: 31 }), 3);
assert.deepEqual(
  [...ASSIGNMENT_LIFECYCLE_STATUS_FILTERS],
  ['closed', 'draft', 'expired', 'open']
);
assert.deepEqual(
  buildAssignmentListValidatedSearch({
    page: '3',
    published: ' share-1 ',
    q: '  Ｗｅｅｋ   １  ',
    status: 'published',
  }),
  {
    page: 3,
    published: 'share-1',
    q: 'Week 1',
    status: 'open',
  }
);
assert.deepEqual(
  buildAssignmentListValidatedSearch({
    page: '1',
    published: '   ',
    q: '   ',
    status: 'all',
  }),
  {
    page: undefined,
    published: undefined,
    q: undefined,
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListRouteSearch({
    page: 1,
    published: 'share-1',
    q: '  share   123  ',
    status: 'all',
  }),
  {
    page: undefined,
    published: 'share-1',
    q: 'share 123',
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListRouteSearch({
    page: 4,
    published: 'share-1',
    q: ' week ',
    status: 'expired',
  }),
  {
    page: 4,
    published: 'share-1',
    q: 'week',
    status: 'expired',
  }
);
assert.deepEqual(
  buildAssignmentListRouteSearch({
    page: 2,
    published: 'share-1',
    q: ' valid ',
    status: 'deleted',
  } as never),
  {
    page: 2,
    published: 'share-1',
    q: 'valid',
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListPageRouteSearch({
    current: {
      published: 'share-1',
      q: '  share   123  ',
      status: 'all',
    },
    page: 0,
  }),
  {
    page: undefined,
    published: 'share-1',
    q: 'share 123',
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListPageRouteSearch({
    current: {
      published: 'share-1',
      q: ' week ',
      status: 'closed',
    },
    page: 5,
  }),
  {
    page: 5,
    published: 'share-1',
    q: 'week',
    status: 'closed',
  }
);
assert.deepEqual(
  buildAssignmentListFilterRouteSearch({
    current: {
      q: 'old search',
      status: 'closed',
    },
    next: {
      q: '  Ｎｅｗ   search  ',
    },
    published: 'share-1',
  }),
  {
    page: undefined,
    published: 'share-1',
    q: 'New search',
    status: 'closed',
  }
);
assert.deepEqual(
  buildAssignmentListFilterRouteSearch({
    current: {
      q: 'old search',
      status: 'closed',
    },
    next: {
      q: '',
      status: 'all',
    },
    published: 'share-1',
  }),
  {
    page: undefined,
    published: 'share-1',
    q: undefined,
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListDismissPublishedRouteSearch({
    current: {
      page: 1,
      q: '  share   123  ',
      status: 'all',
    },
  }),
  {
    page: undefined,
    published: undefined,
    q: 'share 123',
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListDismissPublishedRouteSearch({
    current: {
      page: 5,
      q: 'week',
      status: 'expired',
    },
  }),
  {
    page: 5,
    published: undefined,
    q: 'week',
    status: 'expired',
  }
);
assert.equal(parseAssignmentStatusFilter('published'), 'open');
assert.equal(parseAssignmentStatusFilter('open'), 'open');
assert.equal(parseAssignmentStatusFilter('expired'), 'expired');
assert.equal(parseAssignmentStatusFilter('all'), undefined);
assert.deepEqual(
  buildAssignmentListFilterSummary({
    isLoading: true,
    search: undefined,
    status: 'all',
    total: 0,
  }),
  { hasFilters: false, text: 'Loading assignments...' }
);
assert.deepEqual(
  buildAssignmentListFilterSummary({
    isLoading: false,
    search: undefined,
    status: 'all',
    total: 1,
  }),
  { hasFilters: false, text: '1 total assignment' }
);
assert.deepEqual(
  buildAssignmentListFilterSummary({
    isLoading: false,
    search: 'week',
    status: 'open',
    total: 2,
  }),
  { hasFilters: true, text: '2 matches' }
);
assert.deepEqual(
  buildAssignmentListSearchPanelView({
    isLoading: false,
    search: ' week ',
    status: 'open',
    total: 2,
  }),
  {
    filterSummary: { hasFilters: true, text: '2 matches' },
    hasSearchValue: true,
    statusOptions: assignmentStatusFilterOptions,
  }
);
assert.deepEqual(
  buildAssignmentListSearchPanelView({
    isLoading: true,
    search: '',
    status: 'all',
    total: 0,
  }),
  {
    filterSummary: {
      hasFilters: false,
      text: 'Loading assignments...',
    },
    hasSearchValue: false,
    statusOptions: assignmentStatusFilterOptions,
  }
);
assert.equal(
  buildAssignmentListSearchPanelView({
    isLoading: false,
    search: '   ',
    status: 'all',
    total: 0,
  }).hasSearchValue,
  false
);
assert.deepEqual(
  buildAssignmentListSummary({
    assignments: [
      {
        expiresAt: '2026-02-01T00:00:00.000Z',
        status: 'published',
      },
      {
        expiresAt: '2025-12-31T23:59:59.000Z',
        status: 'published',
      },
      {
        expiresAt: null,
        status: 'closed',
      },
    ],
    attempts: [
      {
        resultJson: {
          accuracy: 50,
          completedItemCount: 1,
          correctItemCount: 1,
          durationSeconds: 30,
          earnedPoints: 1,
          totalPoints: 2,
        },
      },
      {
        resultJson: {
          accuracy: 100,
          completedItemCount: 2,
          correctItemCount: 2,
          durationSeconds: 60,
          earnedPoints: 2,
          totalPoints: 2,
        },
      },
    ],
    now: Date.parse('2026-01-01T00:00:00.000Z'),
  }),
  {
    averageScore: 75,
    completions: 2,
    openAssignments: 1,
    totalAssignments: 3,
  }
);
assert.deepEqual(
  buildAssignmentListSummaryMetrics({
    hasFilters: false,
    totalAssignments: 0,
  }),
  [
    { id: 'total', label: 'Assignments', value: '0' },
    { id: 'open', label: 'Open links', value: '0' },
    { id: 'completions', label: 'Completions', value: '0' },
    { id: 'average', label: 'Average', value: '-' },
  ]
);
assert.deepEqual(
  buildAssignmentListSummaryMetrics({
    hasFilters: true,
    summary: {
      averageScore: 76.6,
      completions: 11,
      openAssignments: 2,
      totalAssignments: 5,
    },
    totalAssignments: 99,
  }),
  [
    { id: 'total', label: 'Matching', value: '5' },
    { id: 'open', label: 'Open links', value: '2' },
    { id: 'completions', label: 'Completions', value: '11' },
    { id: 'average', label: 'Average', value: '77%' },
  ]
);
assert.deepEqual(
  buildAssignmentListSummaryMetrics({
    hasFilters: true,
    summary: {
      averageScore: Number.NaN,
      completions: Number.NaN,
      openAssignments: -2,
      totalAssignments: Number.POSITIVE_INFINITY,
    },
    totalAssignments: 99,
  }),
  [
    { id: 'total', label: 'Matching', value: '-' },
    { id: 'open', label: 'Open links', value: '0' },
    { id: 'completions', label: 'Completions', value: '-' },
    { id: 'average', label: 'Average', value: '-' },
  ]
);
assert.deepEqual(
  assignmentStatusFilterOptions.map((option) => option.value),
  ['all', 'open', 'expired', 'closed', 'draft']
);
assert.deepEqual(
  assignmentStatusFilterOptions.map((option) => option.label),
  ['All statuses', 'Open', 'Expired', 'Closed', 'Draft']
);
assert.deepEqual(assignmentListPageCopy, {
  breadcrumbCurrent: 'Assignments',
  breadcrumbDashboard: 'Dashboard',
  description:
    'Published activity instances with share links, classroom settings, and result metrics.',
  loadErrorMessage:
    'Assignments could not be loaded. Refresh the page or sign in again.',
  title: 'Assignments',
});
assert.equal(
  assignmentListSearchCopy.placeholder,
  'Search by assignment, activity, or share id'
);
assert.equal(assignmentListActionCopy.viewResults, 'View results');
assert.equal(
  assignmentListPublishedPanelCopy.publishedLabel,
  'Assignment published'
);
assert.deepEqual(getAssignmentListEmptyState({ hasFilters: true }), {
  description:
    'Try another assignment title, share id, activity name, or status.',
  title: 'No matching assignments.',
});
assert.deepEqual(getAssignmentListEmptyState({ hasFilters: false }), {
  description:
    'Open the activity library and publish a saved activity to create a student share link.',
  title: 'No published assignments yet.',
});
assert.deepEqual(buildAssignmentListEmptyStateView({ hasFilters: true }), {
  description:
    'Try another assignment title, share id, activity name, or status.',
  showStarterAssignments: false,
  title: 'No matching assignments.',
});
assert.deepEqual(buildAssignmentListEmptyStateView({ hasFilters: false }), {
  description:
    'Open the activity library and publish a saved activity to create a student share link.',
  showStarterAssignments: true,
  title: 'No published assignments yet.',
});
const emptyAssignmentListPageView = buildAssignmentListPageViewModel({
  data: null,
  isLoading: false,
  search: {},
});
const assignmentListStarterPreview = buildAssignmentListStarterPreview();
assert.deepEqual(
  {
    assignmentIds: assignmentListStarterPreview.assignments.map(
      (item) => item.assignment.id
    ),
    activityIds: assignmentListStarterPreview.assignments.map(
      (item) => item.activity.id
    ),
    source: assignmentListStarterPreview.source,
  },
  {
    assignmentIds: ['assignment-food-demo'],
    activityIds: ['english-food-quiz'],
    source: 'starter-preview',
  }
);
assert.deepEqual(
  {
    breadcrumbs: emptyAssignmentListPageView.breadcrumbs,
    emptyState: emptyAssignmentListPageView.emptyState,
    hasAssignments: emptyAssignmentListPageView.hasAssignments,
    publishedPanelContext: emptyAssignmentListPageView.publishedPanelContext,
    resolvedSearch: emptyAssignmentListPageView.resolvedSearch,
    starterPreview: {
      assignmentIds: emptyAssignmentListPageView.starterPreview.assignments.map(
        (item) => item.assignment.id
      ),
      source: emptyAssignmentListPageView.starterPreview.source,
    },
    summaryMetrics: emptyAssignmentListPageView.summaryMetrics,
    title: emptyAssignmentListPageView.title,
    totalAssignments: emptyAssignmentListPageView.totalAssignments,
    totalPages: emptyAssignmentListPageView.totalPages,
  },
  {
    breadcrumbs: [
      { href: '/dashboard', label: 'Dashboard' },
      { isCurrentPage: true, label: 'Assignments' },
    ],
    emptyState: {
      description:
        'Open the activity library and publish a saved activity to create a student share link.',
      showStarterAssignments: true,
      title: 'No published assignments yet.',
    },
    hasAssignments: false,
    publishedPanelContext: undefined,
    resolvedSearch: {
      currentPage: 1,
      filteredStatus: undefined,
      hasFilters: false,
      normalizedSearchQuery: undefined,
      searchQuery: '',
      statusFilter: 'all',
    },
    starterPreview: {
      assignmentIds: ['assignment-food-demo'],
      source: 'starter-preview',
    },
    summaryMetrics: [
      { id: 'total', label: 'Assignments', value: '0' },
      { id: 'open', label: 'Open links', value: '0' },
      { id: 'completions', label: 'Completions', value: '0' },
      { id: 'average', label: 'Average', value: '-' },
    ],
    title: 'Assignments',
    totalAssignments: 0,
    totalPages: 1,
  }
);
assert.equal(
  buildAssignmentListPageViewModel({
    data: null,
    isLoading: false,
    search: { page: -2 },
  }).resolvedSearch.currentPage,
  1
);
assert.equal(
  buildAssignmentListPageViewModel({
    data: null,
    isLoading: false,
    search: { page: 1.5 },
  }).resolvedSearch.currentPage,
  1
);
assert.equal(
  buildAssignmentListPageViewModel({
    data: null,
    isLoading: false,
    search: { page: 0 },
  }).resolvedSearch.currentPage,
  1
);
const filteredAssignmentListPageView = buildAssignmentListPageViewModel({
  data: {
    items: [
      {
        activity: {
          description: 'Current activity description',
          templateType: 'quiz',
        },
        assignment: {
          expiresAt: null,
          id: 'persisted-assignment-1',
          settingsJson: {
            collectStudentName: true,
            showCorrectAnswers: true,
            shuffleItems: false,
          },
          shareSlug: 'share-1',
          status: 'published',
          title: 'Persisted assignment',
        },
        snapshot: null,
        stats: {
          averageScore: 76,
          completions: 9,
        },
      },
    ],
    publishedAssignment: {
      id: 'persisted-assignment-1',
      shareSlug: 'share-1',
      title: 'Persisted assignment',
    },
    summary: {
      averageScore: 76,
      completions: 9,
      openAssignments: 1,
      totalAssignments: 1,
    },
    total: 31,
  },
  isLoading: false,
  search: {
    page: 3,
    published: ' share-1 ',
    q: '  Week   1 ',
    status: 'open',
  },
});
assert.deepEqual(
  {
    assignmentIds: filteredAssignmentListPageView.assignments.map(
      (item) => item.assignment.id
    ),
    emptyState: filteredAssignmentListPageView.emptyState,
    hasAssignments: filteredAssignmentListPageView.hasAssignments,
    publishedPanelContext: filteredAssignmentListPageView.publishedPanelContext,
    resolvedSearch: filteredAssignmentListPageView.resolvedSearch,
    summaryMetrics: filteredAssignmentListPageView.summaryMetrics,
    totalAssignments: filteredAssignmentListPageView.totalAssignments,
    totalPages: filteredAssignmentListPageView.totalPages,
  },
  {
    assignmentIds: ['persisted-assignment-1'],
    emptyState: {
      description:
        'Try another assignment title, share id, activity name, or status.',
      showStarterAssignments: false,
      title: 'No matching assignments.',
    },
    hasAssignments: true,
    publishedPanelContext: {
      assignment: {
        id: 'persisted-assignment-1',
        shareSlug: 'share-1',
        title: 'Persisted assignment',
      },
      body: 'Copy the student link for your class, open the student preview, or jump into the results page before submissions arrive.',
      printAction: {
        assignmentId: 'persisted-assignment-1',
      },
      sharePath: '/play/share-1',
      showDismissAction: true,
      showMissingHint: false,
      showResultsAction: true,
      showShareActions: true,
      status: 'found',
      title: 'Persisted assignment',
    },
    resolvedSearch: {
      currentPage: 3,
      filteredStatus: 'open',
      hasFilters: true,
      normalizedSearchQuery: 'Week 1',
      searchQuery: '  Week   1 ',
      statusFilter: 'open',
    },
    summaryMetrics: [
      { id: 'total', label: 'Matching', value: '1' },
      { id: 'open', label: 'Open links', value: '1' },
      { id: 'completions', label: 'Completions', value: '9' },
      { id: 'average', label: 'Average', value: '76%' },
    ],
    totalAssignments: 31,
    totalPages: 3,
  }
);
assert.deepEqual(
  buildAssignmentListCardStats({
    averageScore: 83,
    completions: 12,
  }),
  [
    { key: 'completions', label: 'Completions', value: '12' },
    { key: 'average', label: 'Average', value: '83%' },
  ]
);
assert.deepEqual(
  buildAssignmentListCardStats({
    averageScore: Number.NaN,
    completions: Number.NaN,
  }),
  [
    { key: 'completions', label: 'Completions', value: '-' },
    { key: 'average', label: 'Average', value: '-' },
  ]
);
assert.deepEqual(
  buildAssignmentListCardStats({
    averageScore: 0,
    completions: 0,
  }),
  [
    { key: 'completions', label: 'Completions', value: '0' },
    { key: 'average', label: 'Average', value: '-' },
  ]
);
assert.deepEqual(
  buildAssignmentListCardViewModel({
    activity: {
      description: 'Current activity description',
      templateType: 'quiz',
    },
    assignment: {
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
      id: 'persisted-assignment-1',
      settingsJson: {
        collectStudentName: false,
        instructions: 'Finish before Friday.',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: true,
        timeLimitSeconds: 600,
      },
      shareSlug: '　share-１　',
      status: 'published',
      title: ' Ｐｅｒｓｉｓｔｅｄ\u00A0　assignment ',
    },
    snapshot: {
      activityDescription: 'Frozen activity description',
      templateType: 'line-match',
    },
    stats: {
      averageScore: 76,
      completions: 9,
    },
    now: new Date('2026-01-15T00:00:00.000Z').getTime(),
  }),
  {
    actionState: {
      isPersisted: true,
      showResultsAction: true,
      showShareActions: true,
      statusAction: {
        failureMessage: 'Assignment status could not be updated.',
        kind: 'close-link',
        label: 'Close link',
        nextStatus: 'closed',
        successMessage: 'Assignment link closed.',
      },
    },
    actionView: {
      printAction: {
        assignmentId: 'persisted-assignment-1',
        label: 'Print worksheet',
      },
      resultAction: {
        assignmentId: 'persisted-assignment-1',
        label: 'View results',
      },
      shareAction: {
        label: 'Open share link',
        sharePath: '/play/share-1',
        shareSlug: 'share-1',
      },
      statusAction: {
        failureMessage: 'Assignment status could not be updated.',
        kind: 'close-link',
        label: 'Close link',
        nextStatus: 'closed',
        successMessage: 'Assignment link closed.',
      },
    },
    activityDescription: 'Frozen activity description',
    expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    id: 'persisted-assignment-1',
    persisted: true,
    settings: {
      collectStudentName: false,
      instructions: 'Finish before Friday.',
      maxAttempts: 3,
      showCorrectAnswers: false,
      shuffleItems: true,
      timeLimitSeconds: 600,
    },
    shareSlug: 'share-1',
    stats: {
      averageScore: 76,
      completions: 9,
    },
    statItems: [
      { key: 'completions', label: 'Completions', value: '9' },
      { key: 'average', label: 'Average', value: '76%' },
    ],
    status: 'published',
    statusLabel: 'Open',
    templateLabel: 'Line match',
    templateType: 'line-match',
    title: 'Persisted assignment',
  }
);
assert.deepEqual(
  buildAssignmentListCardViewModel({
    activity: {
      description: null,
      templateType: 'quiz',
    },
    assignment: {
      expiresAt: null,
      id: 'persisted-assignment-2',
      settingsJson: {
        collectStudentName: true,
        showCorrectAnswers: true,
        shuffleItems: false,
      },
      shareSlug: 'share-2',
      status: 'closed',
      title: 'Fallback assignment',
    },
    snapshot: null,
    stats: {
      averageScore: 0,
      completions: 0,
    },
  }).activityDescription,
  ''
);
assert.deepEqual(
  buildStarterAssignmentListCardViewModel({
    activity: {
      description: ' Ｓｔａｒｔｅｒ\u00A0　activity   description ',
      templateType: 'group-sort',
    },
    assignment: {
      averageScore: 84,
      completions: 18,
      id: 'assignment-food-demo',
      settings: {
        collectStudentName: true,
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: true,
      },
      shareId: '　demo-food　',
      status: 'published',
      title: ' Ｆｏｏｄ\u00A0　words   homework ',
    },
  }),
  {
    actionState: {
      isPersisted: false,
      showResultsAction: false,
      showShareActions: true,
      statusAction: undefined,
    },
    actionView: {
      printAction: undefined,
      resultAction: undefined,
      shareAction: {
        label: 'Open share link',
        sharePath: '/play/demo-food',
        shareSlug: 'demo-food',
      },
      statusAction: undefined,
    },
    activityDescription: 'Starter activity description',
    expiresAt: null,
    id: 'assignment-food-demo',
    persisted: false,
    settings: {
      collectStudentName: true,
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleItems: true,
    },
    shareSlug: 'demo-food',
    stats: {
      averageScore: 84,
      completions: 18,
    },
    statItems: [
      { key: 'completions', label: 'Completions', value: '18' },
      { key: 'average', label: 'Average', value: '84%' },
    ],
    status: 'published',
    statusLabel: 'Preview',
    templateLabel: 'Group sort',
    templateType: 'group-sort',
    title: 'Food words homework',
  }
);
assert.deepEqual(
  getAssignmentListCardActionState({
    expiresAt: null,
    persisted: false,
    status: 'published',
  }),
  {
    isPersisted: false,
    showResultsAction: false,
    showShareActions: true,
    statusAction: undefined,
  }
);
assert.deepEqual(
  getAssignmentListCardActionState({
    expiresAt: null,
    persisted: true,
    status: 'published',
  }),
  {
    isPersisted: true,
    showResultsAction: true,
    showShareActions: true,
    statusAction: {
      failureMessage: 'Assignment status could not be updated.',
      kind: 'close-link',
      label: 'Close link',
      nextStatus: 'closed',
      successMessage: 'Assignment link closed.',
    },
  }
);
assert.deepEqual(
  getAssignmentListCardActionState({
    expiresAt: null,
    persisted: true,
    status: 'closed',
  }),
  {
    isPersisted: true,
    showResultsAction: true,
    showShareActions: false,
    statusAction: {
      failureMessage: 'Assignment status could not be updated.',
      kind: 'reopen-link',
      label: 'Reopen link',
      nextStatus: 'published',
      successMessage: 'Assignment link reopened.',
    },
  }
);
assert.deepEqual(
  getAssignmentListCardActionState({
    expiresAt: new Date('2026-01-01T09:00:00.000Z'),
    now: new Date('2026-01-01T10:00:00.000Z').getTime(),
    persisted: true,
    status: 'published',
  }),
  {
    isPersisted: true,
    showResultsAction: true,
    showShareActions: false,
    statusAction: {
      failureMessage: 'Assignment status could not be updated.',
      kind: 'close-link',
      label: 'Close link',
      nextStatus: 'closed',
      successMessage: 'Assignment link closed.',
    },
  }
);
assert.deepEqual(
  getAssignmentListCardActionState({
    expiresAt: null,
    persisted: true,
    status: 'draft',
  }),
  {
    isPersisted: true,
    showResultsAction: false,
    showShareActions: false,
    statusAction: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListCardActionView({
    actionState: {
      isPersisted: true,
      showResultsAction: true,
      showShareActions: true,
      statusAction: undefined,
    },
    assignmentId: 'assignment-with-space',
    shareSlug: '　share １２３　',
  }),
  {
    printAction: {
      assignmentId: 'assignment-with-space',
      label: 'Print worksheet',
    },
    resultAction: {
      assignmentId: 'assignment-with-space',
      label: 'View results',
    },
    shareAction: {
      label: 'Open share link',
      sharePath: '/play/share%20123',
      shareSlug: 'share 123',
    },
    statusAction: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListCardActionView({
    actionState: {
      isPersisted: true,
      showResultsAction: false,
      showShareActions: false,
      statusAction: undefined,
    },
    assignmentId: 'draft-assignment',
    shareSlug: 'draft-share',
  }),
  {
    printAction: undefined,
    resultAction: undefined,
    shareAction: undefined,
    statusAction: undefined,
  }
);
assert.equal(
  buildAssignmentListCardViewModel({
    activity: {
      description: 'Current activity description',
      templateType: 'quiz',
    },
    assignment: {
      expiresAt: null,
      id: 'assignment-real-id-can-start-with-prefix',
      settingsJson: {
        collectStudentName: true,
        showCorrectAnswers: true,
        shuffleItems: false,
      },
      shareSlug: 'share-real',
      status: 'published',
      title: 'Real assignment id',
    },
    snapshot: null,
    stats: {
      averageScore: 0,
      completions: 0,
    },
  }).persisted,
  true
);
assert.deepEqual(ACTIVITY_DIFFICULTIES, ['starter', 'core', 'challenge']);
assert.deepEqual(ACTIVITY_CREATABLE_VISIBILITIES, [
  'draft',
  'private',
  'public',
  'unlisted',
]);
assert.deepEqual(ACTIVITY_PERSISTED_VISIBILITIES, [
  'archived',
  ...ACTIVITY_CREATABLE_VISIBILITIES,
]);
assert.deepEqual(ACTIVITY_TITLE_LENGTH, { max: 120, min: 3 });
assert.deepEqual(ACTIVITY_EDITOR_FIELD_LIMITS, {
  descriptionMaxLength: 400,
  gradeBandMaxLength: 80,
  gradeBandMinLength: 1,
  groupsTextMaxLength: 4000,
  languageMaxLength: 20,
  languageMinLength: 2,
  learningGoalMaxLength: 400,
  learningGoalMinLength: 8,
  pairsTextMaxLength: 4000,
  questionsTextMaxLength: 6000,
  sourceSummaryMaxLength: 500,
  subjectMaxLength: 80,
  subjectMinLength: 1,
  teacherNotesTextMaxLength: 2000,
  vocabularyTextMaxLength: 2000,
});
assert.equal(activityDifficultySchema.parse('core'), 'core');
assert.equal(activityVisibilitySchema.parse('private'), 'private');
assert.equal(activityPersistedVisibilitySchema.parse('archived'), 'archived');
assert.throws(() => activityVisibilitySchema.parse('archived'));
const questionOnlyContent = buildActivityContent({
  description: 'Question only activity',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer quick review questions.',
  pairsText: '',
  questionsText: ['Capital of France? | Paris', '2 + 2? | 4'].join('\n'),
  sourceSummary: 'Quick review',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Question review',
  visibility: 'draft',
  vocabularyText: '',
});
assert.deepEqual(
  buildQuestionOptionTexts({
    answer: 'Paris',
    options: [' paris ', 'Rome', 'ROME', 'Berlin', 'Madrid', 'Lisbon'],
  }),
  ['Paris', 'Rome', 'Berlin', 'Madrid', 'Lisbon']
);
assert.deepEqual(
  buildQuestionOptionTexts({
    answer: ' Ｃａｔ ',
    options: ['cat', ' CAT ', 'ｔｒｅｅ'],
  }),
  ['Cat', 'tree']
);
assert.equal(formatEditorInlineList([' cat ', '', ' tree ']), 'cat, tree');
assert.equal(
  formatEditorLineList([' note one ', '', ' note two ']),
  ['note one', 'note two'].join('\n')
);
assert.equal(
  formatEditorGroupRow({
    items: [' cat ', '', ' dog '],
    label: ' Animals ',
  }),
  'Animals | cat, dog'
);
assert.equal(
  formatEditorGroupRows([
    { items: [' cat ', ' dog '], label: ' Animals ' },
    { items: [' tree '], label: ' Plants ' },
  ]),
  ['Animals | cat, dog', 'Plants | tree'].join('\n')
);
assert.equal(
  formatEditorPairRow({ left: ' cat ', right: ' animal ' }),
  'cat | animal'
);
assert.equal(
  formatEditorQuestionRow({
    answer: ' Ｃａｔ ',
    explanation: ' A cat is an animal. ',
    options: [
      { id: 'cat', text: 'cat' },
      { id: 'tree', text: ' tree ' },
      { id: 'cat-duplicate', text: 'CAT' },
    ],
    prompt: ' Which word is an animal? ',
  }),
  'Which word is an animal? | Ｃａｔ | Cat, tree | A cat is an animal.'
);
const optionRoundTripContent = buildActivityContent({
  description: 'Question option normalization',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer normalized option questions.',
  pairsText: '',
  questionsText: 'Capital of France? | Paris | paris, Rome, ROME, Berlin',
  sourceSummary: 'Option normalization check',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Option normalization',
  visibility: 'draft',
  vocabularyText: '',
  sourceMaterials: [listeningMaterialReference],
});
assert.deepEqual(
  optionRoundTripContent.questions[0]?.options.map((option) => option.text),
  ['Paris', 'Rome', 'Berlin']
);
const optionRoundTripEditorInput = activityContentToEditorInput({
  content: optionRoundTripContent,
  description: 'Question option normalization',
  templateType: 'quiz',
  title: 'Option normalization',
  visibility: 'draft',
});
assert.equal(
  optionRoundTripEditorInput.questionsText,
  'Capital of France? | Paris | Paris, Rome, Berlin'
);
assert.deepEqual(optionRoundTripEditorInput.sourceMaterials, [
  listeningMaterialReference,
]);
assert.deepEqual(activityEditorDefaultInput.sourceMaterials, []);
assert.deepEqual(
  activityContentToEditorInput({
    content: optionRoundTripContent,
    description: 'Question option normalization',
    templateType: 'quiz',
    title: 'Option normalization',
    visibility: 'draft',
  }).sourceMaterials,
  [listeningMaterialReference]
);
assert.equal(DEFAULT_QUESTION_CHOICE_COUNT, 4);
const choiceCompletionContent = buildActivityContent({
  description: 'Choice completion activity',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer quick quiz choices.',
  pairsText: '',
  questionsText: [
    'Capital of France? | Paris | Paris, Rome',
    'Capital of Italy? | Rome',
    'Capital of Germany? | Berlin',
  ].join('\n'),
  sourceSummary: 'European capitals',
  subject: 'Geography',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Capital Choices',
  visibility: 'draft',
  vocabularyText: 'Madrid, Lisbon',
});
const completedQuestionChoices = buildQuestionChoices({
  content: choiceCompletionContent,
  question: choiceCompletionContent.questions[0]!,
});
assert.deepEqual(
  completedQuestionChoices.length,
  DEFAULT_QUESTION_CHOICE_COUNT
);
assert.deepEqual(completedQuestionChoices, [
  'Paris',
  'Rome',
  'Berlin',
  'Lisbon',
]);
assert.deepEqual(
  buildQuestionChoices({
    content: choiceCompletionContent,
    question: choiceCompletionContent.questions[0]!,
    targetCount: 5,
  }),
  ['Paris', 'Rome', 'Berlin', 'Lisbon', 'Madrid']
);
assert.deepEqual(
  buildQuestionChoices({
    content: choiceCompletionContent,
    question: choiceCompletionContent.questions[0]!,
  }),
  completedQuestionChoices
);
assert.deepEqual(
  getRuntimeItems('quiz', choiceCompletionContent)[0]?.choices,
  completedQuestionChoices
);
assert.equal(
  new Set(completedQuestionChoices.map((choice) => choice.toLowerCase())).size,
  completedQuestionChoices.length
);
const tabSeparatedQuestionContent = buildActivityContent({
  description: 'Spreadsheet-pasted question rows',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'zh',
  learningGoal: 'Students answer tab pasted review questions.',
  pairsText: '',
  questionsText: '中国的首都是？\t北京\t北京，上海，广州\t中国首都题',
  sourceSummary: 'Spreadsheet pasted rows',
  subject: '中文',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Tab row parser',
  visibility: 'draft',
  vocabularyText: '',
});
assert.equal(tabSeparatedQuestionContent.questions[0]?.answer, '北京');
assert.deepEqual(
  tabSeparatedQuestionContent.questions[0]?.options.map(
    (option) => option.text
  ),
  ['北京', '上海', '广州']
);
assert.equal(
  tabSeparatedQuestionContent.questions[0]?.explanation,
  '中国首都题'
);
const fullwidthColonPairContent = buildActivityContent({
  description: 'Fullwidth colon pair rows',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'zh',
  learningGoal: 'Students match fullwidth colon pair rows.',
  pairsText: '苹果：apple\n香蕉：banana',
  questionsText: '',
  sourceSummary: 'Fullwidth colon pair rows',
  subject: '英语',
  teacherNotesText: '',
  templateType: 'line-match',
  title: 'Colon pairs',
  visibility: 'draft',
  vocabularyText: '',
});
assert.deepEqual(
  fullwidthColonPairContent.pairs.map((pair) => [pair.left, pair.right]),
  [
    ['苹果', 'apple'],
    ['香蕉', 'banana'],
  ]
);
const fullwidthColonGroupContent = buildActivityContent({
  description: 'Fullwidth colon group rows',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '水果：苹果、香蕉\n蔬菜：胡萝卜，白菜',
  language: 'zh',
  learningGoal: 'Students sort fullwidth colon group rows.',
  pairsText: '',
  questionsText: '',
  sourceSummary: 'Fullwidth colon group rows',
  subject: '科学',
  teacherNotesText: '',
  templateType: 'group-sort',
  title: 'Colon groups',
  visibility: 'draft',
  vocabularyText: '',
});
assert.deepEqual(
  fullwidthColonGroupContent.groups.map((group) => ({
    items: group.items,
    label: group.label,
  })),
  [
    { items: ['苹果', '香蕉'], label: '水果' },
    { items: ['胡萝卜', '白菜'], label: '蔬菜' },
  ]
);
const fullwidthAnswerContent = buildActivityContent({
  description: 'Fullwidth answer normalization',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer normalized fullwidth option questions.',
  pairsText: '',
  questionsText: 'Which word is an animal? | Ｃａｔ | cat, ｔｒｅｅ',
  sourceSummary: 'Fullwidth option normalization check',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Fullwidth option normalization',
  visibility: 'draft',
  vocabularyText: '',
});
assert.equal(fullwidthAnswerContent.questions[0]?.answer, 'Cat');
assert.deepEqual(
  fullwidthAnswerContent.questions[0]?.options.map((option) => [
    option.text,
    option.isCorrect,
  ]),
  [
    ['Cat', true],
    ['tree', false],
  ]
);
assert.deepEqual(getAcceptedAnswers('苹果／苹果树；苹果、苹果公司'), [
  '苹果',
  '苹果树',
  '苹果公司',
]);
assert.deepEqual(getAcceptedAnswers('Paris, France／Paris'), [
  'Paris, France',
  'Paris',
]);
assert.deepEqual(getAcceptedAnswers('Paris／ paris ; Ｐａｒｉｓ'), ['Paris']);
assert.deepEqual(getAcceptedAnswers('ice cream / ice-cream / ice—cream'), [
  'ice cream',
]);
assert.deepEqual(
  matchAnswer({
    expectedAnswer: '苹果／苹果树；苹果公司',
    submittedAnswer: ' 苹果公司 ',
  }),
  {
    acceptedAnswer: '苹果公司',
    correct: true,
    normalizedAcceptedAnswer: '苹果公司',
    normalizedSubmittedAnswer: '苹果公司',
  }
);
assert.deepEqual(
  matchAnswer({
    expectedAnswer: 'ice cream',
    submittedAnswer: 'ice-cream',
  }),
  {
    acceptedAnswer: 'ice cream',
    correct: true,
    normalizedAcceptedAnswer: 'ice cream',
    normalizedSubmittedAnswer: 'ice cream',
  }
);
const defaultSourceSummaryContent = buildActivityContent({
  description: 'Default source summary',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer a question with default source metadata.',
  pairsText: '',
  questionsText: 'Default summary prompt? | Yes',
  sourceSummary: '   ',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Default source summary',
  visibility: 'draft',
  vocabularyText: '',
});
assert.equal(
  defaultSourceSummaryContent.sourceSummary,
  'Teacher-created activity from structured editor input.'
);
const editableActivityPageView = buildActivityEditPageViewModel({
  contentJson: defaultSourceSummaryContent,
  description: 'Default source summary',
  id: 'activity-edit-1',
  templateType: 'quiz',
  title: 'Default source summary',
  visibility: 'draft',
});
assert.deepEqual(
  {
    accessTitle: editableActivityPageView.editAccessView?.title,
    backHref: editableActivityPageView.backAction.href,
    breadcrumbLabels: editableActivityPageView.breadcrumbs.map(
      (breadcrumb) => breadcrumb.label
    ),
    editorActivityId: editableActivityPageView.editor?.activityId,
    editorMode: editableActivityPageView.editor?.mode,
    editorTitle: editableActivityPageView.editor?.initialValues.title,
    title: editableActivityPageView.title,
  },
  {
    accessTitle: 'Edit reusable activity',
    backHref: '/dashboard/activities',
    breadcrumbLabels: ['Dashboard', 'Activities', 'Default source summary'],
    editorActivityId: 'activity-edit-1',
    editorMode: 'edit',
    editorTitle: 'Default source summary',
    title: 'Default source summary',
  }
);
const archivedActivityPageView = buildActivityEditPageViewModel({
  contentJson: defaultSourceSummaryContent,
  description: 'Archived source summary',
  id: 'activity-edit-archived',
  templateType: 'quiz',
  title: 'Archived source summary',
  visibility: 'archived',
});
assert.deepEqual(
  {
    actionLabel: archivedActivityPageView.editAccessView?.actionLabel,
    canEdit: archivedActivityPageView.editAccessView?.canEdit,
    editor: archivedActivityPageView.editor,
    restoreHref: archivedActivityPageView.archivedActivitiesAction.href,
    restoreSearch: archivedActivityPageView.archivedActivitiesAction.search,
  },
  {
    actionLabel: 'Open archived activities',
    canEdit: false,
    editor: undefined,
    restoreHref: '/dashboard/activities',
    restoreSearch: { status: 'archived' },
  }
);
assert.doesNotThrow(() =>
  buildActivityContent(
    createActivityInputSchema.parse(activityEditorDefaultInput)
  )
);
const invalidStructuredInputBase = createActivityInputSchema.parse({
  description: 'Invalid structured row messages',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: 'Fruit | apple, pear',
  language: 'en',
  learningGoal: 'Students can review structured activity input.',
  pairsText: 'hot | cold',
  questionsText: 'Capital of France? | Paris',
  sourceSummary: 'Invalid structured rows',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Invalid rows',
  visibility: 'draft',
  vocabularyText: '',
});
assert.throws(
  () =>
    buildActivityContent({
      ...invalidStructuredInputBase,
      questionsText: 'Missing answer |',
    }),
  /Question line 1 needs "prompt \| answer \| options"\./
);
assert.throws(
  () =>
    buildActivityContent({
      ...invalidStructuredInputBase,
      questionsText: 'Missing separator',
    }),
  /Each question line must use "\|" separators\./
);
assert.throws(
  () =>
    buildActivityContent({
      ...invalidStructuredInputBase,
      pairsText: 'Only left |',
      templateType: 'match-up',
    }),
  /Pair line 1 needs "left \| right"\./
);
assert.throws(
  () =>
    buildActivityContent({
      ...invalidStructuredInputBase,
      groupsText: 'Group only |',
      templateType: 'group-sort',
    }),
  /Group line 1 needs "group \| item one, item two"\./
);
assert.deepEqual(buildActivityCreatePageViewModel(), {
  hero: {
    badgeLabel: 'Teacher activity builder',
    description:
      'Start with structured classroom content: questions, match pairs, categories, vocabulary, learning goal, and teacher notes. The same saved activity can later become a quiz, match game, group sort, worksheet, or assignment.',
    title: 'Create once, teach through many templates.',
  },
  inputShape: {
    items: [
      '1. Questions: prompt | answer | options.',
      '2. Match pairs: left | right.',
      '3. Groups: label | item one, item two.',
      '4. Notes and vocabulary as simple lists.',
    ],
    title: 'Supported input shapes',
  },
  previewLabel: 'Example rendering',
});
assert.equal(buildActivityEditorInitialValues(undefined), undefined);
assert.deepEqual(buildActivityEditorInitialValues('group-sort'), {
  ...activityEditorDefaultInput,
  ...getActivityTemplateScaffold('group-sort'),
  templateType: 'group-sort',
  visibility: 'draft',
});
const lineMatchCreatePageView =
  buildActivityCreatePageEditorViewModel('line-match');
assert.deepEqual(
  {
    initialTemplate: lineMatchCreatePageView.initialValues?.templateType,
    previewPanelTitle: lineMatchCreatePageView.previewPanel.title,
    previewTemplate: lineMatchCreatePageView.previewActivity.templateType,
  },
  {
    initialTemplate: 'line-match',
    previewPanelTitle: 'Line match example preview',
    previewTemplate: 'line-match',
  }
);
const defaultEditorPreviewSeed = buildActivityEditorPreviewSeed();
assert.deepEqual(
  {
    description: defaultEditorPreviewSeed.description,
    templateType: defaultEditorPreviewSeed.templateType,
    title: defaultEditorPreviewSeed.title,
  },
  {
    description: activityEditorDefaultInput.description,
    templateType: 'quiz',
    title: activityEditorDefaultInput.title,
  }
);
const lineMatchPreviewSeed = buildActivityEditorPreviewSeed(
  buildActivityEditorInitialValues('line-match')
);
assert.equal(lineMatchPreviewSeed.id, 'activity-editor-preview');
assert.equal(lineMatchPreviewSeed.status, 'draft');
assert.equal(lineMatchPreviewSeed.templateType, 'line-match');
assert.equal(lineMatchPreviewSeed.title, 'Draw lines for food words');
assert.equal(lineMatchPreviewSeed.content.pairs.length, 8);
const lineMatchPreviewPanel = buildActivityEditorPreviewPanel(
  buildActivityEditorInitialValues('line-match')
);
assert.equal(lineMatchPreviewPanel.editorSectionId, 'activity-editor');
assert.equal(lineMatchPreviewPanel.title, 'Line match example preview');
assert.match(lineMatchPreviewPanel.description, /still a draft/);
assert.deepEqual(lineMatchPreviewPanel.actions, [
  {
    href: '#activity-editor',
    icon: 'edit',
    label: 'Review example fields',
  },
]);
assert.deepEqual(buildActivityEditorTemplateSetupView('group-sort'), {
  actionLabel: 'Load example',
  description:
    'Students drag items into teacher-defined groups and compare patterns.',
  requirementBadges: ['Requires groups'],
  scaffoldSummary: {
    coverageMetrics: [
      { id: 'questions', label: '4 questions', value: 4 },
      { id: 'pairs', label: '8 pairs', value: 8 },
      { id: 'groups', label: '3 groups', value: 3 },
      { id: 'vocabulary', label: '8 words', value: 8 },
      { id: 'teacherNotes', label: '2 notes', value: 2 },
    ],
    readyTemplateCount: ACTIVITY_TEMPLATE_TYPES.length,
    readyTemplateLabel: '8 modes ready',
    readyTemplateOptions: ACTIVITY_TEMPLATE_TYPES.map((templateType) => ({
      shortName: getTemplateByType(templateType).shortName,
      template: templateType,
    })),
    runtimeItemCount: 8,
    runtimeItemLabel: '8 playable items',
    title: 'Example coverage',
  },
  shortName: 'Sort',
  successMessage: 'Group sort example loaded.',
  title: 'Group sort setup',
});
const editorQuestionReadiness = buildActivityEditorTemplateReadiness({
  description: 'Editor readiness helper',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students can answer a question from editor input.',
  pairsText: '',
  questionsText: 'Capital of France? | Paris | Paris, Rome',
  sourceSummary: 'Editor readiness source',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Editor readiness',
  visibility: 'draft',
  vocabularyText: '',
});
assert.equal(editorQuestionReadiness?.currentTemplateType, 'quiz');
assert.equal(
  editorQuestionReadiness?.options.find(
    (option) => option.template.type === 'quiz'
  )?.diagnosis,
  'Quiz is selected and ready.'
);
assert.deepEqual(ACTIVITY_EDITOR_READINESS_PANEL_LIMITS, {
  lockedOptions: 4,
});
assert.deepEqual(buildActivityEditorModeView('create'), {
  footerHint:
    'Saved activities appear in the teacher dashboard and can later be published as assignments.',
  isEditMode: false,
  saveLabel: 'Save activity',
  saveSuccessMessage: 'Activity saved to your library.',
  title: 'Create a reusable activity',
});
assert.deepEqual(buildActivityEditorModeView('edit'), {
  footerHint:
    'Changes update the reusable activity used by future assignments.',
  isEditMode: true,
  saveLabel: 'Save changes',
  saveSuccessMessage: 'Activity updated.',
  title: 'Edit reusable activity',
});
assert.deepEqual(
  buildActivityEditorDraftGenerationGate({
    hasUser: false,
    sourceText: '  apples  ',
  }),
  {
    canGenerate: false,
    errorMessage: 'Sign in to generate AI activity drafts.',
    sourceText: 'apples',
  }
);
assert.deepEqual(
  buildActivityEditorDraftGenerationGate({
    hasUser: true,
    sourceText: '  ',
  }),
  {
    canGenerate: false,
    errorMessage: 'Add a topic, vocabulary list, or source notes first.',
    sourceText: '',
  }
);
assert.deepEqual(
  buildActivityEditorDraftGenerationGate({
    hasUser: true,
    sourceText: '  apple, milk  ',
  }),
  {
    canGenerate: true,
    sourceText: 'apple, milk',
  }
);
assert.deepEqual(
  buildActivityEditorSaveGate({
    hasUser: false,
    mode: 'create',
  }),
  {
    canSave: false,
    errorMessage: 'Sign in to save activities to your teacher library.',
    mode: 'create',
  }
);
assert.deepEqual(
  buildActivityEditorSaveGate({
    hasUser: true,
    mode: 'edit',
  }),
  {
    canSave: false,
    errorMessage: 'Activity could not be identified for editing.',
    mode: 'edit',
  }
);
assert.deepEqual(
  buildActivityEditorSaveGate({
    activityId: 'activity-1',
    hasUser: true,
    mode: 'edit',
  }),
  {
    activityId: 'activity-1',
    canSave: true,
    mode: 'edit',
  }
);
assert.equal(
  buildActivityEditorDraftSuccessMessage({}),
  'AI activity draft generated.'
);
assert.equal(
  buildActivityEditorDraftSuccessMessage({ notice: 'Local fallback.' }),
  'Draft filled from the local generator.'
);
assert.equal(
  buildActivityEditorDraftSuccessMessage({ notice: '   ' }),
  'AI activity draft generated.'
);
assert.equal(
  buildActivityEditorDraftSuccessMessage({
    notice: '  Ｌｏｃａｌ　fallback.  ',
  }),
  'Draft filled from the local generator.'
);
assert.equal(
  buildActivityEditorDraftSourceText({
    ...activityEditorDefaultInput,
    vocabularyText: ' apple, milk ',
  }).includes('apple, milk'),
  true
);
assert.deepEqual(
  buildActivityEditorDraftSourceState({
    draftSourceText: 'No attached material notes yet.',
    sourceMaterials: [],
  }),
  {
    canSyncDraftSourceMaterials: false,
    hasAttachedSourceMaterials: false,
    hasDraftSourceMaterialNotes: false,
  }
);
const syncedEditorDraftSource = buildActivityEditorSyncedDraftSourceText({
  sourceMaterials: [
    {
      fileId: 'file-1',
      kind: 'document',
      originalName: 'unit-notes.pdf',
    },
  ],
  sourceText: 'Classroom source notes.',
});
assert.match(syncedEditorDraftSource, /Classroom source notes\./);
assert.match(syncedEditorDraftSource, /unit-notes\.pdf/);
assert.deepEqual(
  buildActivityEditorDraftSourceState({
    draftSourceText: syncedEditorDraftSource,
    sourceMaterials: [],
  }),
  {
    canSyncDraftSourceMaterials: true,
    hasAttachedSourceMaterials: false,
    hasDraftSourceMaterialNotes: true,
  }
);
const disabledAiDraftPanelView = buildActivityEditorAiDraftPanelView({
  hasUser: false,
  isGeneratingDraft: false,
  sourceState: {
    canSyncDraftSourceMaterials: false,
    hasAttachedSourceMaterials: false,
    hasDraftSourceMaterialNotes: false,
  },
});
assert.deepEqual(disabledAiDraftPanelView, {
  badgeLabel: 'AI draft',
  canGenerateDraft: false,
  canSyncDraftSourceMaterials: false,
  generateButtonLabel: 'Generate draft',
  itemCountLabel: 'Items',
  reviewNote: 'Teacher reviews before saving',
  sourcePlaceholder: 'Paste vocabulary, a reading passage, or lesson notes.',
  sourceTextLabel: 'Topic or source notes',
  syncMaterialsLabel: 'Sync attached materials',
  syncSuccessMessage: 'Attached materials synced to AI source notes.',
});
assert.deepEqual(
  buildActivityEditorAiDraftPanelView({
    hasUser: true,
    isGeneratingDraft: false,
    sourceState: {
      canSyncDraftSourceMaterials: true,
      hasAttachedSourceMaterials: true,
      hasDraftSourceMaterialNotes: false,
    },
  }),
  {
    ...disabledAiDraftPanelView,
    canGenerateDraft: true,
    canSyncDraftSourceMaterials: true,
  }
);
assert.equal(
  buildActivityEditorAiDraftPanelView({
    hasUser: true,
    isGeneratingDraft: true,
    sourceState: {
      canSyncDraftSourceMaterials: true,
      hasAttachedSourceMaterials: false,
      hasDraftSourceMaterialNotes: true,
    },
  }).canGenerateDraft,
  false
);
const editorSelectOptions = buildActivityEditorSelectOptions();
assert.deepEqual(
  editorSelectOptions.difficultyOptions.map((option) => option.label),
  ['Starter', 'Core', 'Challenge']
);
assert.deepEqual(
  editorSelectOptions.visibilityOptions.map((option) => option.label),
  ['Draft', 'Private', 'Public', 'Unlisted']
);
assert.equal(editorSelectOptions.templateOptions.length, 8);
assert.equal(formatActivityEditorDifficulty('challenge'), 'Challenge');
assert.equal(formatActivityEditorVisibility('unlisted'), 'Unlisted');
const editorTemplateView = buildActivityEditorTemplateView({
  input: {
    ...activityEditorDefaultInput,
    groupsText: '',
    pairsText: '',
    questionsText: 'Capital of France? | Paris | Paris, Rome',
    templateType: 'quiz',
  },
  templateType: 'quiz',
});
assert.equal(editorTemplateView.template.name, 'Quiz');
assert.equal(editorTemplateView.setupView.title, 'Quiz setup');
assert.equal(editorTemplateView.templateOptions.length, 8);
assert.equal(editorTemplateView.readinessSummary.readyCount, 4);
assert.equal(
  editorTemplateView.setupView.scaffoldSummary.title,
  'Example coverage'
);
assert.equal(
  editorTemplateView.setupView.scaffoldSummary.runtimeItemLabel,
  '4 playable items'
);
assert.equal(
  editorTemplateView.setupView.scaffoldSummary.readyTemplateLabel,
  '8 modes ready'
);
assert.deepEqual(
  editorTemplateView.setupView.scaffoldSummary.readyTemplateOptions.map(
    (option) => option.template
  ),
  [...ACTIVITY_TEMPLATE_TYPES]
);
assert.deepEqual(
  editorTemplateView.setupView.scaffoldSummary.coverageMetrics.map((metric) => [
    metric.id,
    metric.label,
    metric.value,
  ]),
  [
    ['questions', '4 questions', 4],
    ['pairs', '8 pairs', 8],
    ['groups', '3 groups', 3],
    ['vocabulary', '8 words', 8],
    ['teacherNotes', '2 notes', 2],
  ]
);
assert.ok(
  editorTemplateView.readinessSummary.lockedOptions.length <=
    ACTIVITY_EDITOR_READINESS_PANEL_LIMITS.lockedOptions
);
assert.deepEqual(
  buildActivityEditorReadinessPanelSummary(
    getTemplateRemixPlan({
      content: buildActivityContent({
        ...activityEditorDefaultInput,
        groupsText: '',
        pairsText: '',
        questionsText: 'Capital of France? | Paris | Paris, Rome',
      }),
      currentTemplateType: 'quiz',
    })
  ).lockedOptions.map((option) => option.template),
  ['match-up', 'line-match', 'group-sort', 'matching-pairs']
);
const groupSortScaffoldApplication =
  buildActivityEditorTemplateScaffoldApplication({
    current: {
      ...activityEditorDefaultInput,
      title: 'Keep current until scaffold loads',
      visibility: 'private',
    },
    templateType: 'group-sort',
  });
assert.equal(groupSortScaffoldApplication.values.templateType, 'group-sort');
assert.equal(groupSortScaffoldApplication.values.visibility, 'private');
assert.equal(
  groupSortScaffoldApplication.values.title,
  'Sort food, drinks, and containers'
);
assert.match(groupSortScaffoldApplication.draftSourceText, /apple/);
assert.equal(
  groupSortScaffoldApplication.successMessage,
  'Group sort example loaded.'
);
assert.deepEqual(
  buildActivityTemplateScaffoldInput({
    current: {
      ...activityEditorDefaultInput,
      title: 'Keep current until scaffold loads',
      visibility: 'private',
    },
    templateType: 'group-sort',
  }),
  groupSortScaffoldApplication.values
);
assert.deepEqual(
  buildActivityTemplateScaffoldReadinessSummary({
    current: activityEditorDefaultInput,
    templateType: 'group-sort',
  }),
  {
    coverageMetrics: [
      { id: 'questions', label: '4 questions', value: 4 },
      { id: 'pairs', label: '8 pairs', value: 8 },
      { id: 'groups', label: '3 groups', value: 3 },
      { id: 'vocabulary', label: '8 words', value: 8 },
      { id: 'teacherNotes', label: '2 notes', value: 2 },
    ],
    readyTemplateCount: ACTIVITY_TEMPLATE_TYPES.length,
    readyTemplateLabel: '8 modes ready',
    readyTemplateOptions: ACTIVITY_TEMPLATE_TYPES.map((templateType) => ({
      shortName: getTemplateByType(templateType).shortName,
      template: templateType,
    })),
    runtimeItemCount: 8,
    runtimeItemLabel: '8 playable items',
    title: 'Example coverage',
  }
);
assert.equal(
  buildActivityEditorTemplateReadiness({
    ...createActivityInputSchema.parse({
      description: 'Invalid template readiness',
      difficulty: 'starter',
      gradeBand: 'Grade 3',
      groupsText: '',
      language: 'en',
      learningGoal: 'Students can answer a question from editor input.',
      pairsText: '',
      questionsText: 'Capital of France? | Paris',
      sourceSummary: 'Editor readiness source',
      subject: 'General',
      teacherNotesText: '',
      templateType: 'quiz',
      title: 'Editor readiness',
      visibility: 'draft',
      vocabularyText: '',
    }),
    title: 'No',
  }),
  null
);
assert.equal(
  buildActivityEditorTemplateReadiness({
    description: 'Invalid editor rows',
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    groupsText: '',
    language: 'en',
    learningGoal: 'Students can answer a question from editor input.',
    pairsText: '',
    questionsText: 'Missing answer only',
    sourceSummary: 'Editor readiness source',
    subject: 'General',
    teacherNotesText: '',
    templateType: 'quiz',
    title: 'Invalid editor rows',
    visibility: 'draft',
    vocabularyText: '',
  }),
  null
);
assert.throws(
  () =>
    buildActivityContent({
      description: 'Missing pairs',
      difficulty: 'starter',
      gradeBand: 'Grade 3',
      groupsText: '',
      language: 'en',
      learningGoal: 'Students match vocabulary terms to definitions.',
      pairsText: '',
      questionsText: 'Capital of France? | Paris',
      sourceSummary: 'Missing pairs check',
      subject: 'General',
      teacherNotesText: '',
      templateType: 'match-up',
      title: 'Missing pairs',
      visibility: 'draft',
      vocabularyText: '',
    }),
  /Add match pairs to unlock Match\./
);
const questionOnlyRemixPlan = getTemplateRemixPlan({
  content: questionOnlyContent,
  currentTemplateType: 'quiz',
});
const blankStructuredRemixPlan = getTemplateRemixPlan({
  content: {
    ...questionOnlyContent,
    gradeBand: '\u00A0　\t',
    groups: [{ id: 'g-blank', items: ['\u00A0　\t'], label: '\u00A0　\t' }],
    learningGoal: '\u00A0　\t',
    pairs: [{ id: 'p-blank', left: '\u00A0　\t', right: '\u00A0　\t' }],
    questions: [{ answer: '\u00A0　\t', id: 'q-blank', prompt: '\u00A0　\t' }],
    sourceSummary: '\u00A0　\t',
    teacherNotes: ['\u00A0　\t'],
    vocabulary: ['\u00A0　\t'],
  },
  currentTemplateType: 'quiz',
});
assert.deepEqual(
  blankStructuredRemixPlan.options
    .filter((option) =>
      ['group-sort', 'match-up', 'quiz'].includes(option.template.type)
    )
    .map((option) => [
      option.template.type,
      option.isReady,
      option.missingRequirements,
    ]),
  [
    ['quiz', false, ['questions']],
    ['match-up', false, ['pairs']],
    ['group-sort', false, ['groups']],
  ]
);
assert.equal(
  getTemplateRemixPlan({
    content: {
      ...questionOnlyContent,
      groups: [{ id: 'g-valid', items: ['   ', 'mammal'], label: 'Animal' }],
    },
    currentTemplateType: 'quiz',
  }).options.find((option) => option.template.type === 'group-sort')?.isReady,
  true
);
const questionOnlyRemixSummary = buildTemplateRemixSummary(
  questionOnlyRemixPlan
);
assert.ok(questionOnlyRemixPlan.readyOptions.length > 0);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'quiz'
  )?.isCurrent,
  true
);
assert.equal(
  questionOnlyRemixPlan.suggestedOptions.some(
    (option) => option.template.type === 'quiz'
  ),
  false
);
assert.deepEqual(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.missingRequirements,
  ['pairs']
);
assert.deepEqual(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.missingRequirementLabels,
  ['match pairs']
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.missingRequirementCount,
  1
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.readinessLabel,
  'Needs more content'
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.diagnosis,
  'Add match pairs to unlock Match.'
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'quiz'
  )?.diagnosis,
  'Quiz is selected and ready.'
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'fill-blank'
  )?.diagnosis,
  'Ready to remix into Fill.'
);
assert.deepEqual(questionOnlyRemixSummary, {
  lockedTemplateDiagnostics: [
    'Add match pairs to unlock Match.',
    'Add match pairs to unlock Lines.',
    'Add groups to unlock Sort.',
    'Add match pairs to unlock Pairs.',
  ],
  lockedTemplateOptions: [
    { diagnosis: 'Add match pairs to unlock Match.', template: 'match-up' },
    { diagnosis: 'Add match pairs to unlock Lines.', template: 'line-match' },
    {
      diagnosis: 'Add groups to unlock Sort.',
      template: 'group-sort',
    },
    {
      diagnosis: 'Add match pairs to unlock Pairs.',
      template: 'matching-pairs',
    },
  ],
  readyTemplateOptions: [
    { shortName: 'Quiz', template: 'quiz' },
    { shortName: 'Fill', template: 'fill-blank' },
    { shortName: 'Listen', template: 'listening' },
    { shortName: 'Box', template: 'open-box' },
  ],
  suggestedTemplateOptions: [
    { shortName: 'Fill', template: 'fill-blank' },
    { shortName: 'Listen', template: 'listening' },
    { shortName: 'Box', template: 'open-box' },
  ],
});
assert.deepEqual(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'group-sort'
  )?.missingRequirements,
  ['groups']
);
assert.deepEqual(
  buildActivityTemplateReadinessPanelSummary(questionOnlyRemixPlan),
  {
    description:
      'The same structured content can become multiple Wordwall-style activity formats after saving.',
    emptyText: 'Add questions, pairs, or groups to unlock playable templates.',
    lockedOptions: [
      { diagnosis: 'Add match pairs to unlock Match.', template: 'match-up' },
      { diagnosis: 'Add match pairs to unlock Lines.', template: 'line-match' },
      {
        diagnosis: 'Add groups to unlock Sort.',
        template: 'group-sort',
      },
      {
        diagnosis: 'Add match pairs to unlock Pairs.',
        template: 'matching-pairs',
      },
    ],
    readyCount: 4,
    readyCountLabel: '4 ready',
    readyOptions: [
      { shortName: 'Quiz', template: 'quiz' },
      { shortName: 'Fill', template: 'fill-blank' },
      { shortName: 'Listen', template: 'listening' },
      { shortName: 'Box', template: 'open-box' },
    ],
    title: 'Template readiness',
  }
);
assert.deepEqual(buildActivityTemplateReadinessPanelSummary(null), {
  description:
    'The same structured content can become multiple Wordwall-style activity formats after saving.',
  emptyText: 'Add questions, pairs, or groups to unlock playable templates.',
  lockedOptions: [],
  readyCount: 0,
  readyCountLabel: '0 ready',
  readyOptions: [],
  title: 'Template readiness',
});
const questionOnlyCardSummary = buildActivityLibraryCardSummary({
  content: questionOnlyContent,
  templateType: 'quiz',
});
assert.deepEqual(questionOnlyCardSummary.contentCounts, {
  groups: 0,
  pairs: 0,
  questions: 2,
});
assert.deepEqual(
  questionOnlyCardSummary.readyTemplateOptions.map((option) => option.template),
  ['quiz', 'fill-blank', 'listening', 'open-box']
);
assert.deepEqual(
  questionOnlyCardSummary.suggestedTemplateOptions.map(
    (option) => option.template
  ),
  ['fill-blank', 'listening', 'open-box']
);
assert.ok(
  questionOnlyCardSummary.lockedTemplateDiagnostics.includes(
    'Add match pairs to unlock Match.'
  )
);
assert.deepEqual(
  buildActivityLibraryCompatibilityView({
    currentTemplateType: 'quiz',
    summary: questionOnlyCardSummary,
  }),
  {
    lockedTemplateDiagnostics: [
      'Add match pairs to unlock Match.',
      'Add match pairs to unlock Lines.',
    ],
    readyTemplateOptions: [
      { isCurrent: true, shortName: 'Quiz', template: 'quiz' },
      { isCurrent: false, shortName: 'Fill', template: 'fill-blank' },
      { isCurrent: false, shortName: 'Listen', template: 'listening' },
      { isCurrent: false, shortName: 'Box', template: 'open-box' },
    ],
    remixActionOptions: [
      {
        actionLabel: 'Copy as Fill',
        shortName: 'Fill',
        template: 'fill-blank',
      },
      {
        actionLabel: 'Copy as Listen',
        shortName: 'Listen',
        template: 'listening',
      },
      {
        actionLabel: 'Copy as Box',
        shortName: 'Box',
        template: 'open-box',
      },
    ],
    remixHint: 'Ready to remix into Fill, Listen, Box.',
  }
);
const questionOnlyCompatibilityView = buildActivityLibraryCompatibilityView({
  currentTemplateType: 'quiz',
  summary: questionOnlyCardSummary,
});
assert.equal(
  questionOnlyCompatibilityView.lockedTemplateDiagnostics.length,
  ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS.lockedTemplateDiagnostics
);
assert.equal(
  questionOnlyCompatibilityView.remixActionOptions.length,
  ACTIVITY_LIBRARY_COMPATIBILITY_LIMITS.remixActionOptions
);
assert.equal(formatTemplateRequirement('pairs'), 'match pairs');
assert.equal(formatTemplateRequirement('learningGoal'), 'learning goal');
assert.deepEqual(
  (
    [
      'gradeBand',
      'groups',
      'learningGoal',
      'pairs',
      'questions',
      'sourceSummary',
      'teacherNotes',
      'vocabulary',
    ] as const
  ).map(formatTemplateRequirement),
  [
    'grade band',
    'groups',
    'learning goal',
    'match pairs',
    'questions',
    'source summary',
    'teacher notes',
    'vocabulary',
  ]
);
assert.deepEqual(formatTemplateRequirements(['questions', 'pairs', 'groups']), [
  'questions',
  'match pairs',
  'groups',
]);
assert.equal(formatTemplateRequirementList(['questions']), 'questions');
assert.equal(
  formatTemplateRequirementList(['questions', 'match pairs']),
  'questions and match pairs'
);
assert.equal(
  formatTemplateRequirementList(['questions', 'match pairs', 'groups']),
  'questions, match pairs, and groups'
);
const completeScaffoldContent = buildActivityContent({
  ...getActivityTemplateScaffold('group-sort'),
  difficulty: 'starter',
  gradeBand: 'Primary',
  language: 'en',
  templateType: 'group-sort',
  visibility: 'draft',
});
const completeScaffoldCardSummary = buildActivityLibraryCardSummary({
  content: completeScaffoldContent,
  templateType: 'group-sort',
});
const librarySummary = summarizeActivityLibrary([
  {
    contentJson: {
      ...questionOnlyContent,
      sourceMaterials: [listeningMaterialReference],
    },
    templateType: 'quiz',
    visibility: 'draft',
  },
  {
    contentJson: {
      ...completeScaffoldContent,
      sourceMaterials: [
        {
          fileId: 'file-worksheet-library',
          kind: 'worksheet-document',
          originalName: 'library worksheet.pdf',
        },
        {
          fileId: 'file-spreadsheet-library',
          kind: 'spreadsheet',
          originalName: 'library words.xlsx',
        },
      ],
    },
    templateType: 'group-sort',
    visibility: 'archived',
  },
]);
assert.equal(librarySummary.totalActivities, 2);
assert.equal(librarySummary.draftActivities, 1);
assert.equal(librarySummary.archivedActivities, 1);
assert.equal(librarySummary.templateCoverage, 2);
assert.equal(librarySummary.extractableSourceActivities, 2);
assert.equal(librarySummary.totalExtractableSourceMaterials, 3);
assert.deepEqual(librarySummary.sourceMaterialCapabilityCounts, {
  'audio-extraction': 1,
  'spreadsheet-import': 1,
  'worksheet-extraction': 1,
});
assert.equal(
  librarySummary.totalReadyTemplateOptions,
  questionOnlyCardSummary.readyTemplateOptions.length +
    completeScaffoldCardSummary.readyTemplateOptions.length
);
assert.equal(librarySummary.remixReadyActivities, 2);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: true,
    search: undefined,
    status: 'active',
    template: 'all',
    total: 0,
  }),
  { hasFilters: false, text: 'Loading activities...' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: 'food',
    status: 'active',
    template: 'all',
    total: 1,
  }),
  { hasFilters: true, text: '1 match' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: undefined,
    source: 'worksheet',
    status: 'active',
    template: 'all',
    total: 3,
  }),
  { hasFilters: true, text: '3 matches' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: undefined,
    status: 'archived',
    template: 'all',
    total: 2,
  }),
  { hasFilters: false, text: '2 archived activities' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: undefined,
    status: 'archived',
    template: 'quiz',
    total: 0,
  }),
  { hasFilters: true, text: '0 matches' }
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: false,
    totalActivities: 0,
  }),
  [
    { id: 'total', label: 'Activities', value: '0' },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: `0/${ACTIVITY_TEMPLATE_TYPES.length}`,
    },
    { id: 'remix', label: 'Ready to remix', value: '0' },
    {
      id: 'sourceExtraction',
      label: 'Source extraction',
      value: '0',
    },
  ]
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: true,
    summary: librarySummary,
    totalActivities: 99,
  }),
  [
    { id: 'total', label: 'Matching activities', value: '2' },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: `2/${ACTIVITY_TEMPLATE_TYPES.length}`,
    },
    { id: 'remix', label: 'Ready to remix', value: '2' },
    {
      id: 'sourceExtraction',
      label: 'Source extraction',
      value: String(librarySummary.totalExtractableSourceMaterials),
    },
  ]
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: true,
    summary: {
      archivedActivities: 0,
      draftActivities: 0,
      extractableSourceActivities: Number.NaN,
      remixReadyActivities: Number.NaN,
      sourceMaterialCapabilityCounts: {
        'audio-extraction': Number.NaN,
        'spreadsheet-import': Number.NaN,
        'worksheet-extraction': Number.NaN,
      },
      templateCoverage: -1,
      templateCoverageTotal: Number.POSITIVE_INFINITY,
      totalActivities: Number.NaN,
      totalExtractableSourceMaterials: Number.NaN,
      totalReadyTemplateOptions: -3,
    },
    totalActivities: 99,
  }),
  [
    { id: 'total', label: 'Matching activities', value: '-' },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: '-',
    },
    { id: 'remix', label: 'Ready to remix', value: '-' },
    {
      id: 'sourceExtraction',
      label: 'Source extraction',
      value: '-',
    },
  ]
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: true,
    summary: {
      archivedActivities: 0,
      draftActivities: 0,
      extractableSourceActivities: 0,
      remixReadyActivities: 1.8,
      sourceMaterialCapabilityCounts: {
        'audio-extraction': 0,
        'spreadsheet-import': 0,
        'worksheet-extraction': 0,
      },
      templateCoverage: 2.9,
      templateCoverageTotal: ACTIVITY_TEMPLATE_TYPES.length + 0.9,
      totalActivities: 3.7,
      totalExtractableSourceMaterials: 4.2,
      totalReadyTemplateOptions: 5.6,
    },
    totalActivities: 99,
  }),
  [
    { id: 'total', label: 'Matching activities', value: '3' },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: `2/${ACTIVITY_TEMPLATE_TYPES.length}`,
    },
    { id: 'remix', label: 'Ready to remix', value: '1' },
    {
      id: 'sourceExtraction',
      label: 'Source extraction',
      value: '4',
    },
  ]
);
const emptyActivityLibraryPageView = buildActivityLibraryPageViewModel({
  data: null,
  isLoading: false,
  search: {},
});
const activityLibraryStarterPreview = buildActivityLibraryStarterPreview();
assert.deepEqual(
  {
    activityIds: activityLibraryStarterPreview.activities.map(
      (item) => item.id
    ),
    source: activityLibraryStarterPreview.source,
  },
  {
    activityIds: ['english-food-quiz', 'science-materials-sort'],
    source: 'starter-preview',
  }
);
assert.deepEqual(
  {
    activityIds: emptyActivityLibraryPageView.activities.map((item) => item.id),
    breadcrumbs: emptyActivityLibraryPageView.breadcrumbs,
    createdPanelContext: emptyActivityLibraryPageView.createdPanelContext,
    emptyState: emptyActivityLibraryPageView.emptyState,
    hasActivities: emptyActivityLibraryPageView.hasActivities,
    resolvedSearch: emptyActivityLibraryPageView.resolvedSearch,
    starterPreview: {
      activityIds: emptyActivityLibraryPageView.starterPreview.activities.map(
        (item) => item.id
      ),
      source: emptyActivityLibraryPageView.starterPreview.source,
    },
    summaryMetrics: emptyActivityLibraryPageView.summaryMetrics,
    title: emptyActivityLibraryPageView.title,
    totalActivities: emptyActivityLibraryPageView.totalActivities,
    totalPages: emptyActivityLibraryPageView.totalPages,
  },
  {
    activityIds: [],
    breadcrumbs: [
      { href: '/dashboard', label: 'Dashboard' },
      { isCurrentPage: true, label: 'Activities' },
    ],
    createdPanelContext: undefined,
    emptyState: {
      actionLabel: 'Create activity',
      description:
        'Create the first reusable classroom activity, then publish it as a student assignment link for your class.',
      showStarterActivities: true,
      title: 'No saved activities yet.',
    },
    hasActivities: false,
    resolvedSearch: {
      currentPage: 1,
      hasFilters: false,
      libraryStatus: 'active',
      normalizedSearchQuery: undefined,
      searchQuery: '',
      sourceFilter: 'all',
      templateFilter: 'all',
    },
    starterPreview: {
      activityIds: ['english-food-quiz', 'science-materials-sort'],
      source: 'starter-preview',
    },
    summaryMetrics: [
      { id: 'total', label: 'Activities', value: '0' },
      {
        id: 'coverage',
        label: 'Template coverage',
        value: `0/${ACTIVITY_TEMPLATE_TYPES.length}`,
      },
      { id: 'remix', label: 'Ready to remix', value: '0' },
      {
        id: 'sourceExtraction',
        label: 'Source extraction',
        value: '0',
      },
    ],
    title: 'Activity library',
    totalActivities: 0,
    totalPages: 1,
  }
);
assert.equal(
  buildActivityLibraryPageViewModel({
    data: null,
    isLoading: false,
    search: { page: -2 },
  }).resolvedSearch.currentPage,
  1
);
assert.equal(
  buildActivityLibraryPageViewModel({
    data: null,
    isLoading: false,
    search: { page: 1.5 },
  }).resolvedSearch.currentPage,
  1
);
assert.equal(
  buildActivityLibraryPageViewModel({
    data: null,
    isLoading: false,
    search: { page: 0 },
  }).resolvedSearch.currentPage,
  1
);
const filteredActivityLibraryPageView = buildActivityLibraryPageViewModel({
  data: {
    createdActivity: {
      id: 'persisted-activity-1',
      templateType: 'quiz',
      title: 'Persisted quiz',
      visibility: 'draft',
    },
    items: [
      {
        contentJson: questionOnlyContent,
        description: 'Short diagnostic quiz',
        id: 'persisted-activity-1',
        templateType: 'quiz',
        title: 'Persisted quiz',
        visibility: 'draft',
      },
    ],
    summary: librarySummary,
    total: 31,
  },
  isLoading: false,
  search: {
    created: 'persisted-activity-1',
    page: 3,
    q: '  Food   words ',
    source: 'worksheet',
    status: 'archived',
    template: 'quiz',
  },
});
assert.deepEqual(
  {
    activityIds: filteredActivityLibraryPageView.activities.map(
      (item) => item.id
    ),
    createdPanelContext: filteredActivityLibraryPageView.createdPanelContext,
    emptyState: filteredActivityLibraryPageView.emptyState,
    hasActivities: filteredActivityLibraryPageView.hasActivities,
    resolvedSearch: filteredActivityLibraryPageView.resolvedSearch,
    summaryMetrics: filteredActivityLibraryPageView.summaryMetrics,
    totalActivities: filteredActivityLibraryPageView.totalActivities,
    totalPages: filteredActivityLibraryPageView.totalPages,
  },
  {
    activityIds: ['persisted-activity-1'],
    createdPanelContext: {
      activity: {
        id: 'persisted-activity-1',
        templateType: 'quiz',
        title: 'Persisted quiz',
        visibility: 'draft',
      },
      body: 'Review the structured content, keep building the library, or publish it from the activity card when you are ready to share it with students.',
      showCreateAction: true,
      showDismissAction: true,
      showEditAction: true,
      showMissingHint: false,
      showPublishAction: true,
      status: 'found',
      title: 'Persisted quiz',
    },
    emptyState: {
      actionLabel: 'Clear filters',
      description:
        'Try another title, description, template keyword, or template family from your classroom activity library.',
      showStarterActivities: false,
      title: 'No matching activities.',
    },
    hasActivities: true,
    resolvedSearch: {
      currentPage: 3,
      hasFilters: true,
      libraryStatus: 'archived',
      normalizedSearchQuery: 'Food words',
      searchQuery: '  Food   words ',
      sourceFilter: 'worksheet',
      templateFilter: 'quiz',
    },
    summaryMetrics: [
      { id: 'total', label: 'Matching activities', value: '2' },
      {
        id: 'coverage',
        label: 'Template coverage',
        value: `2/${ACTIVITY_TEMPLATE_TYPES.length}`,
      },
      { id: 'remix', label: 'Ready to remix', value: '2' },
      {
        id: 'sourceExtraction',
        label: 'Source extraction',
        value: String(librarySummary.totalExtractableSourceMaterials),
      },
    ],
    totalActivities: 31,
    totalPages: 3,
  }
);
assert.equal(
  buildActivityLibraryPageViewModel({
    data: {
      createdActivity: null,
      items: [],
      total: 0,
    },
    isLoading: true,
    search: { created: 'activity-loading' },
  }).createdPanelContext?.status,
  'loading'
);
assert.equal(
  buildActivityLibraryPageViewModel({
    data: {
      createdActivity: null,
      items: [],
      total: 0,
    },
    isLoading: false,
    search: { created: 'activity-missing' },
  }).createdPanelContext?.status,
  'missing'
);
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const scaffold = getActivityTemplateScaffold(templateType);
  const input = createActivityInputSchema.parse({
    ...scaffold,
    difficulty: 'starter',
    gradeBand: 'Primary',
    language: 'en',
    templateType,
    visibility: 'draft',
  });
  const content = buildActivityContent(input);
  const runtimeItems = getRuntimeItems(templateType, content);
  const scaffoldRemixPlan = getTemplateRemixPlan({
    content,
    currentTemplateType: templateType,
  });

  assert.ok(content.questions.length >= 3);
  assert.ok(content.pairs.length >= 3);
  assert.ok(content.groups.length >= 2);
  assert.ok(content.vocabulary.length >= 3);
  assert.ok(content.teacherNotes.length >= 1);
  assert.ok(runtimeItems.length >= 3);
  assert.ok(
    scaffoldRemixPlan.readyOptions.some(
      (option) => option.template.type === templateType
    )
  );
}
overwriteGetLocale(() => 'zh');
try {
  const zhGroupSortScaffold = getActivityTemplateScaffold('group-sort');
  assert.equal(zhGroupSortScaffold.title, '分类食物、饮品和容器');
  const zhGroupSortInput = createActivityInputSchema.parse({
    ...zhGroupSortScaffold,
    difficulty: 'starter',
    gradeBand: '小学',
    language: 'zh',
    templateType: 'group-sort',
    visibility: 'draft',
  });
  const zhGroupSortContent = buildActivityContent(zhGroupSortInput);
  assert.ok(zhGroupSortContent.groups.some((group) => group.label === '食物'));
  assert.ok(getRuntimeItems('group-sort', zhGroupSortContent).length >= 3);
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  ACTIVITY_TEMPLATE_TYPES.map((templateType) => [
    templateType,
    getActivityTemplateRunnerKind(templateType),
  ]),
  [
    ['quiz', 'choice-list'],
    ['match-up', 'choice-list'],
    ['line-match', 'line-match'],
    ['group-sort', 'group-sort'],
    ['fill-blank', 'fill-blank'],
    ['listening', 'listening'],
    ['matching-pairs', 'matching-pairs'],
    ['open-box', 'open-box'],
  ]
);
assert.equal(normalizeListeningSpeechLanguage('zh'), 'zh-CN');
assert.equal(normalizeListeningSpeechLanguage('中文'), 'zh-CN');
assert.equal(normalizeListeningSpeechLanguage('Chinese'), 'zh-CN');
assert.equal(normalizeListeningSpeechLanguage('zh-TW'), 'zh-TW');
assert.equal(normalizeListeningSpeechLanguage('zh_CN'), 'zh-CN');
assert.equal(normalizeListeningSpeechLanguage('zh_Hant'), 'zh-TW');
assert.equal(normalizeListeningSpeechLanguage('en'), 'en-US');
assert.equal(normalizeListeningSpeechLanguage('en_US'), 'en-US');
assert.equal(normalizeListeningSpeechLanguage('pt-br'), 'pt-BR');
assert.equal(normalizeListeningSpeechLanguage('  '), undefined);
assert.equal(
  normalizeListeningSpeechLanguage('not a language tag!'),
  undefined
);
assert.deepEqual(
  buildListeningPromptView({
    language: '中文',
    prompt: '今天天气很好。',
    revealAnswer: false,
  }),
  {
    speechLanguage: 'zh-CN',
    speechText: '今天天气很好。',
    transcriptText: undefined,
  }
);
assert.deepEqual(
  buildListeningPromptView({
    language: 'en_US',
    prompt: 'The weather is sunny.',
    revealAnswer: true,
  }),
  {
    speechLanguage: 'en-US',
    speechText: 'The weather is sunny.',
    transcriptText: 'The weather is sunny.',
  }
);
assert.deepEqual(
  [
    {
      answer: 'Paris',
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
    {
      answer: 'Cold',
      choices: ['Cold', 'Warm'],
      id: 'p-1',
      kind: 'pair',
      prompt: 'Hot',
    },
    {
      answer: 'Fruit',
      choices: ['Fruit', 'Drink'],
      id: 'g-1-apple',
      kind: 'group-item',
      prompt: 'Apple',
    },
  ].map((item) => [
    formatRuntimeItemPrompt(item),
    formatRuntimeItemKindLabel(item),
  ]),
  [
    ['Capital of France?', 'Question'],
    ['Match "Hot" with its pair.', 'Pair'],
    ['Choose the group for "Apple".', 'Group item'],
  ]
);
const dirtyRuntimeContent = {
  ...questionOnlyContent,
  groups: [
    { id: 'g-blank', items: ['   ', '\u00A0　\t'], label: 'Blank group' },
    { id: 'g-valid', items: ['   ', '\u00A0　\t', 'Apple'], label: 'Fruit' },
    { id: 'g-empty-label', items: ['Water'], label: '\u00A0　\t' },
  ],
  pairs: [
    { id: 'p-blank-left', left: '   ', right: 'Definition' },
    { id: 'p-blank-right', left: 'Term', right: '\u00A0　\t' },
    { id: 'p-valid', left: 'Hot', right: 'Cold' },
  ],
  questions: [
    { answer: '\u00A0　\t', id: 'q-blank-answer', prompt: 'Question?' },
    { answer: 'Paris', id: 'q-blank-prompt', prompt: '\u00A0　\t' },
    { answer: 'Paris', id: 'q-valid', prompt: 'Capital of France?' },
  ],
};
assert.deepEqual(
  getRuntimeItems('quiz', dirtyRuntimeContent).map((item) => item.id),
  ['q-valid']
);
assert.deepEqual(
  getRuntimeItems('match-up', dirtyRuntimeContent).map((item) => item.id),
  ['p-valid']
);
assert.deepEqual(
  getRuntimeItems('group-sort', dirtyRuntimeContent).map((item) => [
    item.id,
    item.choices,
    item.prompt,
  ]),
  [['g-valid-apple', ['Fruit'], 'Apple']]
);
assert.deepEqual(
  evaluateRuntimeAnswers({
    answers: [
      { answer: 'Paris', itemId: 'q-valid' },
      { answer: 'Anything', itemId: 'q-blank-answer' },
    ],
    content: dirtyRuntimeContent,
    templateType: 'quiz',
  }).result,
  {
    accuracy: 100,
    completedItemCount: 1,
    correctItemCount: 1,
    durationSeconds: undefined,
    earnedPoints: 1,
    totalPoints: 1,
  }
);
assert.deepEqual(
  evaluateRuntimeAnswers({
    answers: [
      { answer: '  Ｐａｒｉｓ\tFrance  ', itemId: 'q-capital-of-france' },
    ],
    content: buildActivityContent({
      description: 'Messy answer normalization',
      difficulty: 'starter',
      gradeBand: 'Grade 4',
      groupsText: '',
      language: 'en',
      learningGoal: 'Students answer with natural keyboard spacing.',
      pairsText: '',
      questionsText: 'Capital of France? | Paris France',
      sourceSummary: 'Normalize fullwidth and whitespace answer input.',
      subject: 'Geography',
      teacherNotesText: '',
      templateType: 'quiz',
      title: 'Messy answer normalization',
      visibility: 'draft',
      vocabularyText: '',
    }),
    templateType: 'quiz',
  }),
  {
    answers: [
      { answer: 'Paris France', correct: true, itemId: 'q-capital-of-france' },
    ],
    result: {
      accuracy: 100,
      completedItemCount: 1,
      correctItemCount: 1,
      durationSeconds: undefined,
      earnedPoints: 1,
      totalPoints: 1,
    },
  }
);
assert.equal(
  evaluateRuntimeAnswers({
    answers: [{ answer: '\u00A0　\t', itemId: 'q-valid' }],
    content: dirtyRuntimeContent,
    templateType: 'quiz',
  }).result.completedItemCount,
  0
);
assert.equal(
  buildDuplicatedActivityTitle('  Food words quick check  '),
  'Copy of Food words quick check'
);
const activityDuplicateSource = readFileSync(
  'src/activities/duplicate.ts',
  'utf8'
);
assert.match(
  activityDuplicateSource,
  /ACTIVITY_TITLE_LENGTH\.max - formatDuplicatedTitle\(''\)\.length/,
  'Duplicate activity titles should reuse the activity-domain title length.'
);
assert.match(
  activityDuplicateSource,
  /ACTIVITY_TITLE_LENGTH\.max -[\s\S]*formatRemixedTitle/,
  'Remix activity titles should reuse the activity-domain title length.'
);
assert.doesNotMatch(
  activityDuplicateSource,
  /const MAX_ACTIVITY_TITLE_LENGTH = 120/,
  'Activity duplicate helpers should not maintain a local title length.'
);
assert.equal(buildDuplicatedActivityTitle('   '), 'Copy of Untitled activity');
assert.equal(
  buildDuplicatedActivityTitle('A'.repeat(200)).length,
  ACTIVITY_TITLE_LENGTH.max
);
assert.equal(
  buildDuplicatedActivityTitle('A'.repeat(200)),
  `Copy of ${'A'.repeat(109)}...`
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: 'Food words quick check',
    targetShortName: 'Match',
  }),
  'Food words quick check (Match)'
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: '  Food\nwords\tquick check  ',
    targetShortName: '  Match\npairs  ',
  }),
  'Food words quick check (Match pairs)'
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: '   ',
    targetShortName: 'Quiz',
  }),
  'Untitled activity (Quiz)'
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: 'Food words quick check',
    targetShortName: '   ',
  }),
  'Food words quick check (template)'
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: 'A'.repeat(200),
    targetShortName: 'Match',
  }).length,
  ACTIVITY_TITLE_LENGTH.max
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: 'A'.repeat(200),
    targetShortName: 'Match',
  }),
  `${'A'.repeat(109)}... (Match)`
);
const derivativeSourceContent = buildActivityContent({
  description: 'Derivative source content',
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groupsText: 'Foods | apple, bread',
  language: 'en',
  learningGoal: 'Students classify and answer food vocabulary prompts.',
  pairsText: 'hot | cold',
  questionsText: 'Favorite food? | apple | apple, bread | Choose the food.',
  sourceMaterials: [
    listeningMaterialReference,
    {
      contentType: 'application/pdf',
      fileId: ' file-worksheet-derivative ',
      kind: 'unknown-kind',
      originalName: ' worksheet derivative.pdf ',
      r2Key: 'userfiles/teacher/private.pdf',
      size: 512.9,
    },
    {
      fileId: 'file-listening-1',
      kind: 'audio',
      originalName: 'Duplicate should be ignored.mp3',
    },
  ],
  sourceSummary: 'Derivative source summary',
  subject: 'English',
  teacherNotesText: 'Use after vocabulary warmup.',
  templateType: 'group-sort',
  title: 'Derivative source',
  visibility: 'draft',
  vocabularyText: 'apple, bread',
});
const derivativeClonedContent = cloneActivityContentForDerivative(
  derivativeSourceContent
);
const activityInsertNow = new Date('2026-01-15T08:00:00.000Z');
const baseActivityCreateInput = {
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groupsText: 'Foods | apple, bread',
  language: 'en',
  learningGoal: 'Students classify and answer food vocabulary prompts.',
  pairsText: 'hot | cold',
  questionsText: 'Favorite food? | apple | apple, bread | Choose the food.',
  sourceSummary: 'Teacher source notes',
  subject: 'English',
  teacherNotesText: 'Use after vocabulary warmup.',
  templateType: 'group-sort',
  title: 'Food review',
  vocabularyText: 'apple, bread',
} as const;
const activityCreateInsert = buildActivityCreateInsert({
  id: 'activity-create-1',
  input: {
    ...baseActivityCreateInput,
    description: '  A quick food review.  ',
    visibility: 'private',
  },
  now: activityInsertNow,
  userId: 'teacher-1',
});
assert.equal(activityCreateInsert.id, 'activity-create-1');
assert.equal(activityCreateInsert.ownerId, 'teacher-1');
assert.equal(activityCreateInsert.description, 'A quick food review.');
assert.equal(activityCreateInsert.templateType, 'group-sort');
assert.equal(activityCreateInsert.title, 'Food review');
assert.equal(activityCreateInsert.visibility, 'private');
assert.equal(activityCreateInsert.createdAt, activityInsertNow);
assert.equal(activityCreateInsert.updatedAt, activityInsertNow);
assert.equal(activityCreateInsert.contentJson.subject, 'English');
assert.equal(activityCreateInsert.contentJson.groups[0]?.label, 'Foods');
assert.equal(
  buildActivityCreateInsert({
    id: 'activity-create-blank-description',
    input: {
      ...baseActivityCreateInput,
      description: '   ',
      visibility: 'draft',
    },
    now: activityInsertNow,
    userId: 'teacher-1',
  }).description,
  null
);
const activityUpdateSet = buildActivityUpdateSet({
  input: {
    ...baseActivityCreateInput,
    description: '  Updated description.  ',
    title: 'Updated food review',
    visibility: 'unlisted',
  },
  now: activityInsertNow,
});
assert.equal(activityUpdateSet.description, 'Updated description.');
assert.equal(activityUpdateSet.templateType, 'group-sort');
assert.equal(activityUpdateSet.title, 'Updated food review');
assert.equal(activityUpdateSet.updatedAt, activityInsertNow);
assert.equal(activityUpdateSet.visibility, 'unlisted');
assert.equal(activityUpdateSet.contentJson.subject, 'English');
assert.equal(
  buildActivityUpdateSet({
    input: {
      ...baseActivityCreateInput,
      description: '   ',
      visibility: 'draft',
    },
    now: activityInsertNow,
  }).description,
  null
);
assert.deepEqual(
  buildActivityVisibilityUpdateSet({
    nextVisibility: 'archived',
    updatedAt: activityInsertNow,
  }),
  {
    updatedAt: activityInsertNow,
    visibility: 'archived',
  }
);
const duplicatedActivityInsert = buildDuplicatedActivityInsert({
  id: 'activity-duplicate-1',
  now: activityInsertNow,
  sourceActivity: {
    contentJson: derivativeSourceContent,
    description: 'Source description',
    templateType: 'group-sort',
    title: '  Food words quick check  ',
  },
  userId: 'teacher-1',
});
assert.equal(duplicatedActivityInsert.id, 'activity-duplicate-1');
assert.equal(duplicatedActivityInsert.ownerId, 'teacher-1');
assert.equal(duplicatedActivityInsert.description, 'Source description');
assert.equal(duplicatedActivityInsert.templateType, 'group-sort');
assert.equal(duplicatedActivityInsert.title, 'Copy of Food words quick check');
assert.equal(duplicatedActivityInsert.visibility, 'draft');
assert.equal(duplicatedActivityInsert.createdAt, activityInsertNow);
assert.equal(duplicatedActivityInsert.updatedAt, activityInsertNow);
assert.deepEqual(duplicatedActivityInsert.contentJson, derivativeClonedContent);
assert.notEqual(duplicatedActivityInsert.contentJson, derivativeSourceContent);
const remixedActivityInsert = buildRemixedActivityInsert({
  id: 'activity-remix-1',
  now: activityInsertNow,
  sourceActivity: {
    contentJson: derivativeSourceContent,
    description: null,
    templateType: 'group-sort',
    title: 'Food words quick check',
  },
  targetTemplate: {
    shortName: 'Match',
    type: 'match-up',
  },
  userId: 'teacher-1',
});
assert.equal(remixedActivityInsert.id, 'activity-remix-1');
assert.equal(remixedActivityInsert.ownerId, 'teacher-1');
assert.equal(remixedActivityInsert.description, null);
assert.equal(remixedActivityInsert.templateType, 'match-up');
assert.equal(remixedActivityInsert.title, 'Food words quick check (Match)');
assert.equal(remixedActivityInsert.visibility, 'draft');
assert.deepEqual(remixedActivityInsert.contentJson, derivativeClonedContent);
assert.notEqual(remixedActivityInsert.contentJson, derivativeSourceContent);
assert.deepEqual(derivativeClonedContent, {
  ...derivativeSourceContent,
  sourceMaterials: [
    listeningMaterialReference,
    {
      contentType: 'application/pdf',
      fileId: 'file-worksheet-derivative',
      kind: 'worksheet-document',
      originalName: 'worksheet derivative.pdf',
      size: 512,
    },
  ],
});
assert.notEqual(derivativeClonedContent, derivativeSourceContent);
assert.notEqual(
  derivativeClonedContent.questions,
  derivativeSourceContent.questions
);
assert.notEqual(
  derivativeClonedContent.questions[0],
  derivativeSourceContent.questions[0]
);
assert.notEqual(
  derivativeClonedContent.questions[0]?.options,
  derivativeSourceContent.questions[0]?.options
);
assert.notEqual(
  derivativeClonedContent.groups[0]?.items,
  derivativeSourceContent.groups[0]?.items
);
assert.notEqual(
  derivativeClonedContent.sourceMaterials[0],
  derivativeSourceContent.sourceMaterials[0]
);
derivativeClonedContent.questions[0]!.prompt = 'Edited cloned prompt';
derivativeClonedContent.questions[0]!.options![0]!.text = 'Edited option';
derivativeClonedContent.groups[0]!.items[0] = 'edited item';
derivativeClonedContent.sourceMaterials[0]!.originalName = 'Edited audio.mp3';
assert.equal(derivativeSourceContent.questions[0]?.prompt, 'Favorite food?');
assert.equal(derivativeSourceContent.questions[0]?.options?.[0]?.text, 'apple');
assert.equal(derivativeSourceContent.groups[0]?.items[0], 'apple');
assert.equal(
  derivativeSourceContent.sourceMaterials[0]?.originalName,
  '三年级听力.mp3'
);
assert.deepEqual(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE, {
  default: 5,
  max: 10,
  min: 3,
});
assert.deepEqual(ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS, [3, 5, 8, 10]);
assert.deepEqual(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS, {
  groups: 4,
  groupItems: 8,
  pairs: 10,
  questions: 10,
  teacherNotes: 5,
  vocabulary: 16,
});
assert.deepEqual(ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS, {
  maxPhraseLength: 48,
  maxWordLength: 32,
  minPhraseLength: 2,
  minWordLength: 3,
});
assert.deepEqual(ACTIVITY_AI_DRAFT_FIELD_LIMITS, {
  answer: {
    max: 120,
    min: 1,
  },
  description: {
    max: 220,
    min: 8,
  },
  explanation: {
    max: 240,
    min: 4,
  },
  gradeBand: {
    max: ACTIVITY_EDITOR_FIELD_LIMITS.gradeBandMaxLength,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.gradeBandMinLength,
  },
  groupItem: {
    max: 80,
    min: 1,
  },
  groupLabel: {
    max: 80,
    min: 1,
  },
  language: {
    max: ACTIVITY_EDITOR_FIELD_LIMITS.languageMaxLength,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.languageMinLength,
  },
  learningGoal: {
    max: 260,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.learningGoalMinLength,
  },
  option: {
    max: 120,
    min: 1,
  },
  options: {
    max: 12,
  },
  pairLeft: {
    max: 100,
    min: 1,
  },
  pairRight: {
    max: 140,
    min: 1,
  },
  prompt: {
    max: 240,
    min: 4,
  },
  sourceSummary: {
    max: 300,
    min: 8,
  },
  sourceSummaryFallback: {
    max: 280,
  },
  sourceText: {
    max: ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
    min: 8,
  },
  subject: {
    max: ACTIVITY_EDITOR_FIELD_LIMITS.subjectMaxLength,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.subjectMinLength,
  },
  teacherNote: {
    max: 160,
    min: 1,
  },
  title: {
    max: 90,
    min: ACTIVITY_TITLE_LENGTH.min,
  },
  vocabulary: {
    max: 80,
    min: 1,
  },
});
assert.deepEqual(
  buildGenerateActivityDraftInputFromEditor({
    current: activityEditorDefaultInput,
    itemCount: ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default,
    sourceText: 'food, apple, bread, milk',
  }).itemCount,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default
);
assert.equal(
  generateActivityDraftInputSchema.parse({
    sourceText: 'food, apple, bread, milk',
  }).itemCount,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default
);
assert.deepEqual(
  buildGenerateActivityDraftInputFromEditor({
    current: {
      ...activityEditorDefaultInput,
      gradeBand: '',
      language: '',
      subject: '',
      templateType: 'line-match',
    },
    itemCount: 5,
    sourceText: '  food, apple, bread, milk  ',
  }),
  {
    difficulty: activityEditorDefaultInput.difficulty,
    gradeBand: 'Primary',
    itemCount: 5,
    language: 'en',
    sourceText: 'food, apple, bread, milk',
    subject: 'English',
    templateType: 'line-match',
  }
);
assert.deepEqual(
  buildGenerateActivityDraftInputFromEditor({
    current: {
      ...activityEditorDefaultInput,
      difficulty: 'challenge',
      gradeBand: 'Grade 5',
      language: 'zh',
      subject: 'Science',
      templateType: 'group-sort',
    },
    itemCount: 8,
    sourceText: 'states of matter, solid, liquid, gas',
  }),
  {
    difficulty: 'challenge',
    gradeBand: 'Grade 5',
    itemCount: 8,
    language: 'zh',
    sourceText: 'states of matter, solid, liquid, gas',
    subject: 'Science',
    templateType: 'group-sort',
  }
);
assert.throws(() =>
  buildGenerateActivityDraftInputFromEditor({
    current: activityEditorDefaultInput,
    itemCount: ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.max + 1,
    sourceText: 'food, apple, bread, milk',
  })
);
assert.throws(() =>
  buildGenerateActivityDraftInputFromEditor({
    current: activityEditorDefaultInput,
    itemCount: ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min - 1,
    sourceText: 'food, apple, bread, milk',
  })
);
assert.equal(
  generateActivityDraftInputSchema.parse({
    sourceText: 'A'.repeat(ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceText.max),
  }).sourceText.length,
  ACTIVITY_DRAFT_SOURCE_MAX_LENGTH
);
assert.throws(() =>
  generateActivityDraftInputSchema.parse({
    sourceText: 'A'.repeat(ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceText.max + 1),
  })
);
const sourceMaterialDraftNotesText = [
  'weather, sunny, rainy, cloudy',
  'Attached classroom source materials:',
  '- Worksheet document: Weather worksheet.pdf',
  '- Audio: Weather listening.mp3',
].join('\n');
assert.deepEqual(
  extractActivityDraftSourceTerms({
    sourceText: sourceMaterialDraftNotesText,
    subject: 'Science',
  }).slice(0, 6),
  [
    'weather',
    'sunny',
    'rainy',
    'cloudy',
    'Attached classroom source materials',
    '- Worksheet document',
  ]
);
assert.deepEqual(
  buildFallbackActivityDraftTerms({
    input: {
      difficulty: 'starter',
      gradeBand: 'Grade 2',
      itemCount: 3,
      language: 'en',
      sourceText: sourceMaterialDraftNotesText,
      subject: 'Science',
      templateType: 'quiz',
    },
    locale: 'en',
  }),
  ['weather', 'sunny', 'rainy']
);
const fallbackDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  itemCount: 5,
  language: 'en',
  sourceText:
    'weather, sunny, rainy, cloudy, windy; students classify weather words and answer simple listening prompts',
  subject: 'Science',
  templateType: 'listening',
});
const fillBlankDraftPrompt = buildActivityDraftPrompt({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 5,
  language: 'en',
  sourceText: 'plants, root, stem, leaf',
  subject: 'Science',
  templateType: 'fill-blank',
});
assert.match(fillBlankDraftPrompt, /Template requirements: questions/);
assert.match(fillBlankDraftPrompt, /worksheet sentence with ___/);
const fillBlankPromptJsonExample = fillBlankDraftPrompt.match(
  /Return exactly this JSON object shape:\n([\s\S]*?)\n\nRules:/
)?.[1];
assert.ok(fillBlankPromptJsonExample);
const fillBlankPromptJsonShape = JSON.parse(fillBlankPromptJsonExample) as {
  questions?: Array<{ prompt?: string }>;
  title?: string;
};
assert.equal(fillBlankPromptJsonShape.title, 'short teacher-facing title');
assert.equal(
  fillBlankPromptJsonShape.questions?.[0]?.prompt,
  'question or fill-in prompt'
);
const groupSortDraftPrompt = buildActivityDraftPrompt({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 5,
  language: 'en',
  sourceText: 'solid, liquid, gas',
  subject: 'Science',
  templateType: 'group-sort',
});
assert.match(groupSortDraftPrompt, /Template requirements: groups/);
assert.match(groupSortDraftPrompt, /Make groups the primary structure/);
const aiDraftSource = readFileSync('src/activities/ai-draft.ts', 'utf8');
assert.match(aiDraftSource, /m\.activity_ai_prompt_intro\(\)/);
assert.match(aiDraftSource, /buildActivityDraftPromptJsonExample\(\)/);
assert.match(aiDraftSource, /m\.activity_ai_prompt_json_title\(\)/);
assert.match(
  aiDraftSource,
  /formatTemplateRequirements\(template\.contentRequirements\)/,
  'AI draft prompt template requirements should reuse the shared template requirement formatter.'
);
assert.match(
  aiDraftSource,
  /formatEditorGroupRows[\s\S]*formatEditorPairRows[\s\S]*formatEditorQuestionRows[\s\S]*formatEditorInlineList/,
  'AI draft mapping should serialize generated classroom structure through shared editor serialization helpers.'
);
assert.match(
  aiDraftSource,
  /buildFallbackQuestions[\s\S]*formatEditorQuestionRow[\s\S]*buildFallbackGroups[\s\S]*formatEditorGroupRow/,
  'AI draft fallback rows should reuse shared editor row serialization helpers.'
);
assert.doesNotMatch(
  aiDraftSource,
  /template\.contentRequirements\.map\([\s\S]*formatTemplateRequirement/,
  'AI draft prompt should not map template requirement labels locally.'
);
assert.doesNotMatch(
  aiDraftSource,
  /options\.join\(', '\)|normalizedTerms\.join\(', '\)|`\$\{firstLabel\} \| \$\{first\.join/,
  'AI draft mapping should not hand-compose editor text list separators locally.'
);
assert.doesNotMatch(
  aiDraftSource,
  /Create a reusable ClassGamify classroom activity draft\./
);
const draftPromptInput = {
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 4,
  language: 'en',
  sourceText: 'shared source notes for template prompt coverage',
  subject: 'Science',
} as const;
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const prompt = buildActivityDraftPrompt({
    ...draftPromptInput,
    templateType,
  });
  const guidance = getActivityTemplateDraftGuidance(templateType);

  assert.ok(guidance.length > 20);
  assert.match(prompt, /Template requirements:/);
  assert.match(prompt, /Template guidance:/);
  assert.ok(prompt.includes(guidance));
  assert.match(prompt, /Target item count: 4/);
  assert.match(
    prompt,
    /Source notes: shared source notes for template prompt coverage/
  );
  assert.match(prompt, /Return JSON only\./);
}
overwriteGetLocale(() => 'zh');
try {
  const zhFillBlankDraftPrompt = buildActivityDraftPrompt({
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    itemCount: 5,
    language: 'en',
    sourceText: 'plants, root, stem, leaf',
    subject: 'Science',
    templateType: 'fill-blank',
  });

  assert.match(zhFillBlankDraftPrompt, /主题：Science/);
  assert.match(zhFillBlankDraftPrompt, /年级：Grade 3/);
  assert.match(zhFillBlankDraftPrompt, /模板要求：题目/);
  assert.match(zhFillBlankDraftPrompt, /请返回以下 JSON 对象结构：/);
  assert.match(zhFillBlankDraftPrompt, /规则：/);
  assert.match(zhFillBlankDraftPrompt, /只返回 JSON。/);
  const zhPromptJsonExample = zhFillBlankDraftPrompt.match(
    /请返回以下 JSON 对象结构：\n([\s\S]*?)\n\n规则：/
  )?.[1];

  assert.ok(zhPromptJsonExample);
  const zhPromptJsonShape = JSON.parse(zhPromptJsonExample) as {
    questions?: Array<{ prompt?: string }>;
    title?: string;
  };
  assert.equal(zhPromptJsonShape.title, '面向老师的简短标题');
  assert.equal(zhPromptJsonShape.questions?.[0]?.prompt, '题目或填空提示');
} finally {
  overwriteGetLocale(() => 'en');
}
assert.match(getActivityTemplateDraftGuidance('listening'), /spoken aloud/);
assert.match(getActivityTemplateDraftGuidance('open-box'), /reveal-card/);
assert.match(getActivityTemplateDraftGuidance('line-match'), /line matching/);
assert.match(
  getActivityTemplateDraftGuidance('matching-pairs'),
  /memory-style cards/
);
const fallbackDraftResult = createFallbackActivityDraftResult({
  input: {
    difficulty: 'starter',
    gradeBand: 'Grade 2',
    itemCount: 5,
    language: 'en',
    sourceText:
      'weather, sunny, rainy, cloudy, windy; students classify weather words and answer simple listening prompts',
    subject: 'Science',
    templateType: 'listening',
  },
  model: 'test-model',
  notice: 'Fallback used for testing.',
});
const fallbackContent = buildActivityContent(fallbackDraft);
const fallbackRemixPlan = getTemplateRemixPlan({
  content: fallbackContent,
  currentTemplateType: fallbackDraft.templateType,
});
const fallbackDraftMeta = buildActivityDraftMeta({
  activity: fallbackDraft,
  currentTemplateType: fallbackDraft.templateType,
});
assert.equal(fallbackDraft.templateType, 'listening');
assert.equal(fallbackDraftResult.provider, 'fallback');
assert.equal(fallbackDraftResult.model, 'test-model');
assert.equal(fallbackDraftResult.notice, 'Fallback used for testing.');
assert.equal(fallbackDraftResult.activity.templateType, 'listening');
assert.equal(fallbackDraftResult.meta.coverage.questions, 5);
assert.equal(
  fallbackDraftResult.meta.readyTemplateCount,
  fallbackDraftResult.meta.readyTemplates.length
);
assert.ok(
  fallbackDraftResult.meta.templateReadiness.some(
    (option) =>
      option.template === 'listening' &&
      option.isCurrent &&
      option.diagnosis === 'Listen is selected and ready.'
  )
);
assert.ok(
  fallbackDraftResult.meta.reviewChecklist.some((item) =>
    item.includes('Review every answer')
  )
);
assert.equal(fallbackContent.questions.length, 5);
assert.equal(fallbackContent.pairs.length, 5);
assert.equal(
  new Set(fallbackContent.pairs.map((pair) => pair.right)).size,
  fallbackContent.pairs.length
);
assert.ok(
  fallbackContent.pairs.every(
    (pair, index) =>
      pair.right.startsWith(`Science lesson clue ${index + 1}`) &&
      !pair.right.includes('key idea from')
  )
);
assert.ok(fallbackContent.groups.length >= 2);
assert.ok(fallbackContent.vocabulary.includes('weather'));
assert.ok(fallbackContent.teacherNotes.length >= 2);
assert.ok(
  fallbackContent.questions.every((question) =>
    question.options?.some((option) => option.text === question.answer)
  )
);
assert.ok(
  fallbackRemixPlan.readyOptions.some(
    (option) => option.template.type === 'listening'
  )
);
assert.ok(fallbackRemixPlan.suggestedOptions.length >= 3);
assert.deepEqual(fallbackDraftMeta.coverage, fallbackDraftResult.meta.coverage);
assert.equal(
  fallbackDraftMeta.readyTemplateCount,
  fallbackDraftMeta.readyTemplates.length
);
assert.deepEqual(
  fallbackDraftMeta.readyTemplateOptions.map((option) => option.shortName),
  fallbackDraftMeta.readyTemplates
);
assert.ok(
  fallbackDraftMeta.readyTemplateOptions.some(
    (option) => option.template === 'listening' && option.shortName === 'Listen'
  )
);
assert.equal(
  fallbackDraftMeta.suggestedTemplateCount,
  fallbackDraftMeta.suggestedTemplates.length
);
assert.deepEqual(
  fallbackDraftMeta.suggestedTemplateOptions.map((option) => option.shortName),
  fallbackDraftMeta.suggestedTemplates
);
assert.equal(
  fallbackDraftMeta.suggestedTemplateOptions.every(
    (option) => option.template !== fallbackDraft.templateType
  ),
  true
);
assert.ok(
  fallbackDraftMeta.templateReadiness.some(
    (option) =>
      option.template === 'listening' &&
      option.isCurrent &&
      option.readinessLabel === 'Ready'
  )
);
assert.ok(
  fallbackDraftMeta.reviewChecklist.some((item) =>
    item.includes('Ready to remix after saving')
  )
);
const fallbackDraftMetaSummary = buildActivityDraftMetaSummaryView({
  meta: fallbackDraftMeta,
  model: 'test-model',
  notice: 'Fallback used for testing.',
  provider: 'fallback',
});
assert.deepEqual(fallbackDraftMetaSummary.coverageStats, [
  { label: 'Questions', value: 5 },
  { label: 'Pairs', value: 5 },
  { label: 'Groups', value: fallbackDraftMeta.coverage.groups },
  { label: 'Vocab', value: fallbackDraftMeta.coverage.vocabulary },
  { label: 'Notes', value: fallbackDraftMeta.coverage.teacherNotes },
]);
assert.equal(fallbackDraftMetaSummary.title, 'AI draft coverage');
assert.equal(
  fallbackDraftMetaSummary.description,
  'Review the generated content before saving it to the activity library.'
);
assert.equal(fallbackDraftMetaSummary.modelLabel, 'Model');
assert.equal(fallbackDraftMetaSummary.modelLineText, 'Model: test-model');
assert.equal(fallbackDraftMetaSummary.modelName, 'test-model');
assert.equal(fallbackDraftMetaSummary.notice, 'Fallback used for testing.');
assert.equal(fallbackDraftMetaSummary.noticeLabel, 'Generation note');
assert.equal(
  fallbackDraftMetaSummary.noticeLineText,
  'Generation note: Fallback used for testing.'
);
assert.equal(
  fallbackDraftMetaSummary.providerDescription,
  'Generated locally from the source notes, so treat it like a scaffold before assigning.'
);
assert.equal(fallbackDraftMetaSummary.providerLabel, 'Fallback');
assert.equal(
  fallbackDraftMetaSummary.readyTemplateLabel,
  `${fallbackDraftMeta.readyTemplateCount} ready templates`
);
assert.equal(
  fallbackDraftMetaSummary.reviewChecklist,
  fallbackDraftMeta.reviewChecklist
);
assert.equal(
  fallbackDraftMetaSummary.suggestedTemplateOptions,
  fallbackDraftMeta.suggestedTemplateOptions
);
assert.deepEqual(
  fallbackDraftMetaSummary.templateReadinessOptions.find(
    (option) => option.template === 'listening'
  ),
  {
    diagnosis: 'Listen is selected and ready.',
    isCurrent: true,
    isReady: true,
    readinessLabel: 'Ready',
    selectedLabel: 'selected',
    shortName: 'Listen',
    template: 'listening',
  }
);
const questionOnlyDraftMetaSummary = buildActivityDraftMetaSummaryView({
  meta: buildActivityDraftMeta({
    activity: {
      ...activityEditorDefaultInput,
      groupsText: '',
      pairsText: '',
      questionsText: 'Question only? | Yes | Yes, No, Maybe',
      templateType: 'quiz',
    },
    currentTemplateType: 'quiz',
  }),
  model: 'test-model',
  provider: 'workers-ai',
});
assert.equal(
  questionOnlyDraftMetaSummary.providerDescription,
  'Generated by Workers AI and converted into the teacher-reviewable activity editor contract.'
);
assert.ok(
  questionOnlyDraftMetaSummary.templateReadinessOptions.some(
    (option) =>
      option.template === 'line-match' &&
      !option.isReady &&
      option.diagnosis?.includes('match pairs')
  )
);
assert.equal(
  buildActivityDraftMetaSummaryView({
    meta: fallbackDraftMeta,
    model: 'test-model',
    notice: 'Workers AI returned a partial draft for testing.',
    provider: 'workers-ai',
  }).providerDescription,
  'Drafted by Workers AI, then completed locally where required classroom structures were missing.'
);
assert.equal(
  buildActivityDraftMetaSummaryView({
    meta: {
      ...fallbackDraftMeta,
      readyTemplateCount: 1,
    },
    model: 'test-model',
    provider: 'workers-ai',
  }).readyTemplateLabel,
  '1 ready template'
);
const malformedDraftMetaSummary = buildActivityDraftMetaSummaryView({
  meta: {
    ...fallbackDraftMeta,
    coverage: {
      groups: 2.9,
      pairs: Number.NaN,
      questions: Number.POSITIVE_INFINITY,
      teacherNotes: -3,
      vocabulary: 4.2,
    },
    readyTemplateCount: -1.8,
  },
  model: 'test-model',
  provider: 'workers-ai',
});
assert.deepEqual(malformedDraftMetaSummary.coverageStats, [
  { label: 'Questions', value: 0 },
  { label: 'Pairs', value: 0 },
  { label: 'Groups', value: 2 },
  { label: 'Vocab', value: 4 },
  { label: 'Notes', value: 0 },
]);
assert.equal(malformedDraftMetaSummary.readyTemplateLabel, '0 ready templates');
assert.equal(
  buildActivityDraftMetaSummaryView({
    meta: fallbackDraftMeta,
    model: 'test-model',
    provider: 'workers-ai',
  }).providerLabel,
  'Workers AI'
);
assert.equal(
  buildActivityDraftMetaSummaryView({
    meta: fallbackDraftMeta,
    model: '   ',
    provider: 'workers-ai',
  }).modelName,
  'Unknown model'
);
const normalizedDraftMetaSummary = buildActivityDraftMetaSummaryView({
  meta: fallbackDraftMeta,
  model: '  Ｗｏｒｋｅｒｓ　ＡＩ  ',
  notice: '  Ｌｏｃａｌ　completion　used.  ',
  provider: 'workers-ai',
});
assert.equal(normalizedDraftMetaSummary.modelName, 'Workers AI');
assert.equal(normalizedDraftMetaSummary.modelLineText, 'Model: Workers AI');
assert.equal(normalizedDraftMetaSummary.notice, 'Local completion used.');
assert.equal(
  normalizedDraftMetaSummary.noticeLineText,
  'Generation note: Local completion used.'
);
assert.equal(
  normalizedDraftMetaSummary.providerDescription,
  'Drafted by Workers AI, then completed locally where required classroom structures were missing.'
);
const blankNoticeDraftMetaSummary = buildActivityDraftMetaSummaryView({
  meta: fallbackDraftMeta,
  model: 'test-model',
  notice: '   ',
  provider: 'workers-ai',
});
assert.equal(blankNoticeDraftMetaSummary.notice, undefined);
assert.equal(blankNoticeDraftMetaSummary.noticeLineText, undefined);
assert.equal(
  blankNoticeDraftMetaSummary.providerDescription,
  'Generated by Workers AI and converted into the teacher-reviewable activity editor contract.'
);
try {
  overwriteGetLocale(() => 'zh');
  const zhFallbackDraftMeta = buildActivityDraftMeta({
    activity: fallbackDraft,
    currentTemplateType: 'listening',
  });
  const zhFallbackDraftMetaSummary = buildActivityDraftMetaSummaryView({
    meta: zhFallbackDraftMeta,
    model: 'test-model',
    provider: 'fallback',
  });

  assert.equal(zhFallbackDraftMetaSummary.noticeLabel, '生成说明');
  assert.equal(zhFallbackDraftMetaSummary.modelLineText, '模型：test-model');
  assert.equal(
    zhFallbackDraftMetaSummary.providerDescription,
    '已根据素材备注在本地生成，请把它当作脚手架检查后再发布。'
  );
  assert.ok(
    zhFallbackDraftMetaSummary.reviewChecklist.some((item) =>
      /保存后可改编为：.+、.+。/.test(item)
    )
  );
} finally {
  overwriteGetLocale(() => 'en');
}
const oversizedAiDraft = {
  description: 'Oversized AI draft for item count shaping.',
  groups: [
    { label: 'Animals', items: ['cat', 'dog', 'bird'] },
    { label: 'Plants', items: ['tree', 'flower', 'grass'] },
    { label: 'Weather', items: ['rain', 'snow', 'wind'] },
  ],
  learningGoal: 'Students can classify and answer lesson review prompts.',
  pairs: [
    { left: 'cat', right: 'animal' },
    { left: 'tree', right: 'plant' },
    { left: 'rain', right: 'weather' },
    { left: 'dog', right: 'animal' },
    { left: 'flower', right: 'plant' },
  ],
  questions: [
    {
      answer: 'cat',
      explanation: 'A cat is an animal.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is an animal?',
    },
    {
      answer: 'tree',
      explanation: 'A tree is a plant.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is a plant?',
    },
    {
      answer: 'rain',
      explanation: 'Rain is weather.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is weather?',
    },
    {
      answer: 'dog',
      explanation: 'A dog is an animal.',
      options: ['dog', 'grass', 'snow'],
      prompt: 'Which word names an animal?',
    },
    {
      answer: 'flower',
      explanation: 'A flower is a plant.',
      options: ['bird', 'flower', 'wind'],
      prompt: 'Which word names a plant?',
    },
  ],
  sourceSummary: 'Words about animals, plants, and weather.',
  teacherNotes: ['Review AI output before assigning.'],
  title: 'Nature word sort',
  vocabulary: ['cat', 'dog', 'bird', 'tree', 'flower', 'rain', 'snow'],
} satisfies AiActivityDraft;
const aiDraftInputBase = {
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  itemCount: 3,
  language: 'en',
  sourceText: 'cat, dog, bird, tree, flower, rain, snow',
  subject: 'Science',
} as const;
const spacedAiDraft = {
  description: '  Spaced AI draft for schema normalization.  ',
  groups: [
    { label: ' Animals ', items: [' cat ', ' dog '] },
    { label: ' Plants ', items: [' tree ', ' flower '] },
  ],
  learningGoal: '  Students can sort and answer nature words.  ',
  pairs: [
    { left: ' cat ', right: ' animal ' },
    { left: ' tree ', right: ' plant ' },
    { left: ' rain ', right: ' weather ' },
  ],
  questions: [
    {
      answer: ' cat ',
      explanation: ' A cat is an animal. ',
      options: [' CAT ', ' tree ', ' rain '],
      prompt: ' Which word is an animal? ',
    },
    {
      answer: ' tree ',
      explanation: ' A tree is a plant. ',
      options: [' tree ', ' cat ', ' rain '],
      prompt: ' Which word is a plant? ',
    },
    {
      answer: ' rain ',
      explanation: ' Rain is weather. ',
      options: [' rain ', ' cat ', ' tree '],
      prompt: ' Which word is weather? ',
    },
  ],
  sourceSummary: '  Nature source notes.  ',
  teacherNotes: [' Check all answer keys. '],
  title: '  Nature sort  ',
  vocabulary: [' cat ', ' tree ', ' rain '],
} satisfies AiActivityDraft;
const normalizedSpacedDraft = createActivityInputFromAiDraft({
  draft: spacedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'quiz',
  },
});
assert.equal(normalizedSpacedDraft.title, 'Nature sort');
assert.equal(
  normalizedSpacedDraft.description,
  'Spaced AI draft for schema normalization.'
);
assert.equal(
  normalizedSpacedDraft.questionsText.split('\n')[0],
  'Which word is an animal? | cat | cat, tree, rain | A cat is an animal.'
);
assert.equal(normalizedSpacedDraft.pairsText.split('\n')[0], 'cat | animal');
assert.equal(
  normalizedSpacedDraft.groupsText.split('\n')[0],
  'Animals | cat, dog'
);
assert.equal(normalizedSpacedDraft.vocabularyText, 'cat, tree, rain');
assert.equal(normalizedSpacedDraft.teacherNotesText, 'Check all answer keys.');
const completedMissingNotesDraft = normalizeAiActivityDraft({
  draft: {
    ...spacedAiDraft,
    teacherNotes: [],
  },
  input: {
    ...aiDraftInputBase,
    templateType: 'quiz',
  },
});
assert.equal(completedMissingNotesDraft.usedLocalCompletion, true);
assert.equal(
  completedMissingNotesDraft.draft.questions[0]?.prompt,
  'Which word is an animal?'
);
assert.ok(completedMissingNotesDraft.draft.teacherNotes.length >= 1);
const partialAiDraft = {
  description: 'AI provided a usable but incomplete draft.',
  learningGoal: 'Students can sort and answer nature review prompts.',
  questions: [
    {
      answer: 'cat',
      explanation: 'A cat is an animal.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is an animal?',
    },
  ],
  sourceSummary: 'Nature source notes from the AI response.',
  title: 'AI nature draft',
  vocabulary: ['cat'],
};
const completedPartialAiDraft = normalizeAiActivityDraft({
  draft: partialAiDraft,
  input: {
    ...aiDraftInputBase,
    itemCount: 4,
    templateType: 'quiz',
  },
});
assert.equal(completedPartialAiDraft.usedLocalCompletion, true);
assert.equal(completedPartialAiDraft.draft.title, 'AI nature draft');
assert.equal(
  completedPartialAiDraft.draft.questions[0]?.prompt,
  'Which word is an animal?'
);
assert.equal(completedPartialAiDraft.draft.questions.length, 4);
assert.equal(completedPartialAiDraft.draft.pairs.length, 4);
assert.ok(completedPartialAiDraft.draft.groups.length >= 2);
assert.ok(completedPartialAiDraft.draft.vocabulary.includes('cat'));
assert.ok(completedPartialAiDraft.draft.vocabulary.length >= 4);
assert.ok(completedPartialAiDraft.draft.teacherNotes.length >= 1);
const duplicateCompletionAiDraft = normalizeAiActivityDraft({
  draft: {
    ...partialAiDraft,
    groups: [
      { label: ' Animals ', items: [' cat ', 'ｃａｔ', 'dog'] },
      { label: 'animals', items: ['CAT', ' bird '] },
    ],
    pairs: [
      { left: ' cat ', right: ' animal ' },
      { left: 'ｃａｔ', right: 'Animal' },
    ],
    questions: [
      partialAiDraft.questions[0]!,
      {
        answer: 'CAT',
        explanation: 'A cat is an animal.',
        options: ['CAT', 'tree', 'rain'],
        prompt: ' Which   word is an animal? ',
      },
    ],
    teacherNotes: ['Review answers.', ' review   answers. '],
    vocabulary: [' cat ', 'ｃａｔ', 'CAT', 'dog'],
  },
  input: {
    ...aiDraftInputBase,
    itemCount: 4,
    templateType: 'quiz',
  },
});
assert.equal(duplicateCompletionAiDraft.usedLocalCompletion, true);
assert.equal(
  duplicateCompletionAiDraft.draft.questions.filter(
    (question) =>
      question.prompt === 'Which word is an animal?' &&
      question.answer.toLocaleLowerCase() === 'cat'
  ).length,
  1
);
assert.equal(
  duplicateCompletionAiDraft.draft.pairs.filter(
    (pair) =>
      pair.left.toLocaleLowerCase() === 'cat' &&
      pair.right.toLocaleLowerCase() === 'animal'
  ).length,
  1
);
assert.deepEqual(duplicateCompletionAiDraft.draft.groups[0], {
  items: ['cat', 'dog', 'bird'],
  label: 'Animals',
});
assert.deepEqual(duplicateCompletionAiDraft.draft.vocabulary.slice(0, 2), [
  'cat',
  'dog',
]);
assert.equal(
  duplicateCompletionAiDraft.draft.teacherNotes.filter((note) =>
    note.toLocaleLowerCase().includes('review answers')
  ).length,
  1
);
const maxCountCompletedAiDraft = normalizeAiActivityDraft({
  draft: partialAiDraft,
  input: {
    ...aiDraftInputBase,
    itemCount: ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.max,
    sourceText:
      'cat, dog, bird, tree, flower, grass, rain, snow, wind, cloud, sun, moon',
    templateType: 'quiz',
  },
});
assert.equal(
  maxCountCompletedAiDraft.draft.questions.length,
  ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.questions
);
assert.equal(
  maxCountCompletedAiDraft.draft.pairs.length,
  ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.pairs
);
assert.equal(
  maxCountCompletedAiDraft.draft.vocabulary.length,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.max
);
assert.ok(
  maxCountCompletedAiDraft.draft.teacherNotes.length <=
    ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.teacherNotes
);
const completedPartialActivityDraft = createActivityInputFromAiDraft({
  draft: partialAiDraft,
  input: {
    ...aiDraftInputBase,
    itemCount: 4,
    templateType: 'quiz',
  },
});
assert.equal(completedPartialActivityDraft.title, 'AI nature draft');
assert.equal(
  getRuntimeItems('quiz', buildActivityContent(completedPartialActivityDraft))
    .length,
  4
);
const shapedQuizDraft = createActivityInputFromAiDraft({
  draft: oversizedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'quiz',
  },
});
assert.equal(
  getRuntimeItems('quiz', buildActivityContent(shapedQuizDraft)).length,
  3
);
const missingOptionAiDraft = {
  ...oversizedAiDraft,
  questions: [
    {
      answer: 'cat',
      explanation: 'A cat is an animal.',
      prompt: 'Which word is an animal?',
    },
    {
      answer: 'tree',
      explanation: 'A tree is a plant.',
      prompt: 'Which word is a plant?',
    },
    {
      answer: 'rain',
      explanation: 'Rain is weather.',
      prompt: 'Which word is weather?',
    },
  ],
} satisfies AiActivityDraft;
const missingOptionQuizDraft = createActivityInputFromAiDraft({
  draft: missingOptionAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'quiz',
  },
});
const missingOptionQuizRuntimeItems = getRuntimeItems(
  'quiz',
  buildActivityContent(missingOptionQuizDraft)
);
assert.equal(missingOptionQuizRuntimeItems.length, 3);
assert.ok(missingOptionQuizRuntimeItems[0]?.choices?.includes('cat') ?? false);
assert.ok((missingOptionQuizRuntimeItems[0]?.choices?.length ?? 0) > 1);
const duplicateOptionAiDraft = {
  ...oversizedAiDraft,
  questions: [
    {
      answer: 'ｃａｔ',
      explanation: 'A cat is an animal.',
      options: [' CAT ', 'cat', 'ｃａｔ', 'tree', ' TREE ', 'rain'],
      prompt: 'Which word is an animal?',
    },
    {
      answer: 'tree',
      explanation: 'A tree is a plant.',
      options: ['tree', ' TREE ', 'cat', 'rain'],
      prompt: 'Which word is a plant?',
    },
    {
      answer: 'rain',
      explanation: 'Rain is weather.',
      options: ['rain', ' RAIN ', 'cat', 'tree'],
      prompt: 'Which word is weather?',
    },
  ],
} satisfies AiActivityDraft;
const duplicateOptionQuizDraft = createActivityInputFromAiDraft({
  draft: duplicateOptionAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'quiz',
  },
});
assert.equal(
  duplicateOptionQuizDraft.questionsText.split('\n')[0],
  'Which word is an animal? | cat | cat, tree, rain | A cat is an animal.'
);
const duplicateOptionQuizContent = buildActivityContent(
  duplicateOptionQuizDraft
);
assert.deepEqual(
  duplicateOptionQuizContent.questions[0]?.options.map((option) => [
    option.text,
    option.isCorrect,
  ]),
  [
    ['cat', true],
    ['tree', false],
    ['rain', false],
  ]
);
assert.deepEqual(
  duplicateOptionQuizContent.questions[0]?.options.filter(
    (option) => option.isCorrect
  ),
  [{ id: 'o-cat', isCorrect: true, text: 'cat' }]
);
const duplicateOptionRuntimeChoices =
  getRuntimeItems('quiz', duplicateOptionQuizContent)[0]?.choices ?? [];
assert.equal(
  duplicateOptionRuntimeChoices.filter((choice) => choice === 'cat').length,
  1
);
assert.equal(
  duplicateOptionRuntimeChoices.filter((choice) =>
    [' CAT ', 'ｃａｔ'].includes(choice)
  ).length,
  0
);
const shapedMatchDraft = createActivityInputFromAiDraft({
  draft: oversizedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'match-up',
  },
});
assert.equal(
  getRuntimeItems('match-up', buildActivityContent(shapedMatchDraft)).length,
  3
);
const shapedGroupSortDraft = createActivityInputFromAiDraft({
  draft: oversizedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'group-sort',
  },
});
assert.deepEqual(
  buildActivityContent(shapedGroupSortDraft).groups.map((group) => [
    group.label,
    group.items,
  ]),
  [
    ['Animals', ['cat']],
    ['Plants', ['tree']],
    ['Weather', ['rain']],
  ]
);
assert.equal(
  getRuntimeItems('group-sort', buildActivityContent(shapedGroupSortDraft))
    .length,
  3
);
const questionOnlyDraftMeta = buildActivityDraftMeta({
  activity: {
    description: 'Question only draft',
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    groupsText: '',
    language: 'en',
    learningGoal: 'Students answer quick review questions.',
    pairsText: '',
    questionsText: 'Capital of France? | Paris',
    sourceSummary: 'Question only source',
    subject: 'General',
    teacherNotesText: '',
    templateType: 'quiz',
    title: 'Question only draft',
    visibility: 'draft',
    vocabularyText: '',
  },
  currentTemplateType: 'quiz',
});
assert.ok(
  questionOnlyDraftMeta.reviewChecklist.includes(
    'Next content gap: Add match pairs to unlock Match.'
  )
);
assert.ok(
  questionOnlyDraftMeta.reviewChecklist.includes(
    'Add short explanations before students see answer feedback.'
  )
);
const lockedOnlyDraftMeta = buildActivityDraftMeta({
  activity: {
    description: 'Group only draft',
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    groupsText: 'Fruit | apple, banana\nDrink | milk, water',
    language: 'en',
    learningGoal: 'Students sort vocabulary terms into groups.',
    pairsText: '',
    questionsText: '',
    sourceSummary: 'Group only source',
    subject: 'General',
    teacherNotesText: '',
    templateType: 'group-sort',
    title: 'Group only draft',
    visibility: 'draft',
    vocabularyText: 'apple, banana, milk, water',
  },
  currentTemplateType: 'group-sort',
});
assert.ok(
  lockedOnlyDraftMeta.reviewChecklist.includes('Add questions to unlock Quiz.')
);
const fallbackFillBlankDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'plants, root, stem, leaf',
  subject: 'Science',
  templateType: 'fill-blank',
});
const fallbackFillBlankContent = buildActivityContent(fallbackFillBlankDraft);
assert.ok(
  fallbackFillBlankContent.questions.every((question) =>
    question.prompt.includes('___')
  )
);
assert.equal(fallbackFillBlankContent.questions[0]?.answer, 'plants');
assert.equal(
  fallbackFillBlankContent.questions[0]?.prompt.includes('plants'),
  false
);
assert.match(
  fallbackFillBlankContent.questions[0]?.prompt ?? '',
  /starts with "p" and has 6 characters/
);
assert.equal(getRuntimeItems('fill-blank', fallbackFillBlankContent).length, 3);
const fallbackQuizDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'weather, sunny, rainy, windy',
  subject: 'Science',
  templateType: 'quiz',
});
const fallbackQuizContent = buildActivityContent(fallbackQuizDraft);
const fallbackQuizRuntimeItems = getRuntimeItems('quiz', fallbackQuizContent);
assert.equal(fallbackQuizContent.questions[0]?.answer, 'weather');
assert.equal(
  fallbackQuizContent.questions[0]?.prompt.includes('weather'),
  false
);
assert.match(
  fallbackQuizContent.questions[0]?.prompt ?? '',
  /starts with "w" and has 7 characters/
);
assert.ok(fallbackQuizRuntimeItems[0]?.choices?.includes('weather') ?? false);
assert.equal(fallbackQuizRuntimeItems.length, 3);
const fallbackChineseQuizDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: '小学三年级',
  itemCount: 3,
  language: 'zh-CN',
  sourceText: '苹果，香蕉，牛奶，面包',
  subject: '英语',
  templateType: 'quiz',
});
const fallbackChineseQuizContent = buildActivityContent(
  fallbackChineseQuizDraft
);
assert.equal(
  fallbackChineseQuizDraft.description,
  '根据课堂素材生成的英语活动，老师可检查后使用。'
);
assert.equal(
  fallbackChineseQuizDraft.learningGoal,
  '学生能够识别并运用本课的英语重点内容。'
);
assert.equal(fallbackChineseQuizDraft.title, '苹果快速练习');
assert.match(
  fallbackChineseQuizDraft.teacherNotesText,
  /发布给小学三年级学生前，请先检查这份草稿。/
);
assert.match(
  fallbackChineseQuizContent.questions[0]?.prompt ?? '',
  /^哪个英语课堂词/
);
assert.match(
  fallbackChineseQuizContent.questions[0]?.prompt ?? '',
  /以"苹"开头，长度为2 个字符/
);
assert.equal(
  fallbackChineseQuizContent.questions[0]?.explanation,
  '苹果 是本课的目标内容之一。'
);
const fallbackListeningDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'weather, sunny, rainy, windy',
  subject: 'Science',
  templateType: 'listening',
});
const fallbackListeningContent = buildActivityContent(fallbackListeningDraft);
assert.ok(
  fallbackListeningContent.questions.every((question) =>
    /^Track \d+:/.test(question.prompt)
  )
);
assert.equal(fallbackListeningContent.questions[0]?.answer, 'weather');
assert.match(
  fallbackListeningContent.questions[0]?.prompt ?? '',
  /listening word is weather/
);
assert.match(
  fallbackListeningContent.questions[0]?.explanation ?? '',
  /spoken track names weather/
);
assert.equal(getRuntimeItems('listening', fallbackListeningContent).length, 3);
const fallbackGroupSortDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 4,
  language: 'en',
  sourceText: 'weather, sunny, rainy, windy',
  subject: 'Science',
  templateType: 'group-sort',
});
const fallbackGroupSortContent = buildActivityContent(fallbackGroupSortDraft);
assert.deepEqual(
  fallbackGroupSortContent.groups.map((group) => group.label),
  ['Review focus', 'Science examples']
);
assert.equal(
  fallbackGroupSortContent.groups.every((group) => group.items.length > 0),
  true
);
assert.equal(
  fallbackGroupSortContent.groups.some((group) =>
    ['Core ideas', 'Examples'].includes(group.label)
  ),
  false
);
assert.equal(getRuntimeItems('group-sort', fallbackGroupSortContent).length, 4);
const fallbackChineseGroupSortDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: '小学三年级',
  itemCount: 4,
  language: '中文',
  sourceText: '天气，晴天，雨天，刮风',
  subject: '科学',
  templateType: 'group-sort',
});
const fallbackChineseGroupSortContent = buildActivityContent(
  fallbackChineseGroupSortDraft
);
assert.deepEqual(
  fallbackChineseGroupSortContent.groups.map((group) => group.label),
  ['复习重点', '科学例子']
);
assert.equal(
  fallbackChineseGroupSortContent.groups.every(
    (group) => group.items.length > 0
  ),
  true
);
const fallbackOpenBoxDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'community, helper, school, clinic',
  subject: 'Social studies',
  templateType: 'open-box',
});
const fallbackOpenBoxContent = buildActivityContent(fallbackOpenBoxDraft);
assert.ok(
  fallbackOpenBoxContent.questions.every((question) =>
    question.prompt.startsWith('Open the box: explain or name')
  )
);
assert.equal(fallbackOpenBoxContent.questions[0]?.answer, 'community');
assert.equal(
  fallbackOpenBoxContent.questions[0]?.prompt.includes('community'),
  false
);
assert.match(
  fallbackOpenBoxContent.questions[0]?.explanation ?? '',
  /Model answer: community\./
);
assert.ok(
  fallbackOpenBoxContent.questions.every(
    (question) => question.options?.length === 1
  )
);
assert.equal(getRuntimeItems('open-box', fallbackOpenBoxContent).length, 3);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    groupsText: 'Group source',
    pairsText: 'Pair source',
    questionsText: 'Question source',
    sourceSummary: '  Summary source  ',
    teacherNotesText: 'Teacher note source',
    vocabularyText: 'Vocabulary source',
  }),
  [
    'Summary source',
    'Vocabulary source',
    'Question source',
    'Pair source',
    'Group source',
    'Teacher note source',
  ].join('\n\n')
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    groupsText: '',
    pairsText: '',
    questionsText: 'Question source',
    sourceSummary: '   ',
    teacherNotesText: '',
    vocabularyText: '  Vocabulary source  ',
  }),
  ['Vocabulary source', 'Question source'].join('\n\n')
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    groupsText: 'Group source',
    pairsText: 'Pair source',
    questionsText: 'Ｓｈａｒｅｄ source',
    sourceSummary: 'Shared source',
    teacherNotesText: 'shared source',
    vocabularyText: '  shared   source  ',
  }),
  ['Shared source', 'Pair source', 'Group source'].join('\n\n')
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    groupsText: ' Group\t source ',
    pairsText: 'Pair   source',
    questionsText: 'Question   source',
    sourceSummary: '  Ｓｈａｒｅｄ\t source  ',
    teacherNotesText: 'Shared source',
    vocabularyText: 'shared   source',
  }),
  ['Shared source', 'Question source', 'Pair source', 'Group source'].join(
    '\n\n'
  )
);
assert.equal(
  buildActivitySourceMaterialDraftNotes([
    listeningMaterialReference,
    {
      contentType: 'application/pdf',
      fileId: 'file-worksheet-1',
      kind: 'worksheet-document',
      originalName: 'revision worksheet.pdf',
      size: 512,
    },
  ]),
  [
    'Attached classroom source materials:',
    '- Audio: 三年级听力.mp3',
    '- Worksheet document: revision worksheet.pdf',
  ].join('\n')
);
const unsafeMaterialMetadataPattern =
  /r2Key|userfiles\/|fileId|contentType|size|permission|ownerId|storageKey/i;
const sensitiveMaterialReferences = [
  {
    contentType: 'application/pdf',
    fileId: 'file-secret-worksheet',
    kind: 'worksheet-document',
    originalName: 'safe worksheet.pdf',
    ownerId: 'teacher-secret',
    permission: 'owner-only',
    r2Key: 'userfiles/teacher-secret/safe worksheet.pdf',
    size: 512,
    storageKey: 'private-storage-key',
  },
] as const;
const sensitiveMaterialDraftNoteViews =
  buildActivitySourceMaterialDraftNoteViews(sensitiveMaterialReferences);
assert.deepEqual(sensitiveMaterialDraftNoteViews, [
  {
    kindLabel: 'Worksheet document',
    name: 'safe worksheet.pdf',
  },
]);
assert.deepEqual(
  buildActivitySourceMaterialDraftNoteViews([
    {
      contentType: 'application/pdf',
      fileId: 'file-messy-worksheet',
      kind: 'worksheet-document',
      originalName: '  Ｗｏｒｋｓｈｅｅｔ\tScan   1.pdf  ',
    },
  ]),
  [
    {
      kindLabel: 'Worksheet document',
      name: 'Worksheet Scan 1.pdf',
    },
  ]
);
assert.deepEqual(Object.keys(sensitiveMaterialDraftNoteViews[0] ?? {}).sort(), [
  'kindLabel',
  'name',
]);
const sensitiveMaterialDraftNotes = buildActivitySourceMaterialDraftNotes(
  sensitiveMaterialReferences
);
assert.equal(
  sensitiveMaterialDraftNotes,
  [
    'Attached classroom source materials:',
    '- Worksheet document: safe worksheet.pdf',
  ].join('\n')
);
assert.doesNotMatch(
  sensitiveMaterialDraftNotes ?? '',
  unsafeMaterialMetadataPattern
);
const appendedMaterialDraftSourceText = appendActivitySourceMaterialDraftNotes({
  sourceMaterials: [listeningMaterialReference],
  sourceText: 'Teacher source notes',
});
assert.equal(
  appendedMaterialDraftSourceText,
  [
    'Teacher source notes',
    'Attached classroom source materials:\n- Audio: 三年级听力.mp3',
  ].join('\n\n')
);
assert.doesNotMatch(
  appendedMaterialDraftSourceText,
  unsafeMaterialMetadataPattern
);
assert.equal(
  hasActivitySourceMaterialDraftNotes(appendedMaterialDraftSourceText),
  true
);
assert.equal(
  hasActivitySourceMaterialDraftNotes('Teacher source notes only'),
  false
);
const refreshedMaterialDraftSourceText = appendActivitySourceMaterialDraftNotes(
  {
    sourceMaterials: [
      {
        contentType: 'application/pdf',
        fileId: 'file-worksheet-2',
        kind: 'worksheet-document',
        originalName: 'updated worksheet.pdf',
        size: 1024,
      },
    ],
    sourceText: appendedMaterialDraftSourceText,
  }
);
assert.equal(
  refreshedMaterialDraftSourceText,
  [
    'Teacher source notes',
    'Attached classroom source materials:\n- Worksheet document: updated worksheet.pdf',
  ].join('\n\n')
);
assert.equal(
  appendActivitySourceMaterialDraftNotes({
    sourceMaterials: [
      {
        contentType: 'application/pdf',
        fileId: 'file-worksheet-3',
        kind: 'worksheet-document',
        originalName: ' Ｕｐｄａｔｅｄ\tworksheet.pdf ',
      },
    ],
    sourceText: [
      ' Teacher   source notes ',
      'Attached classroom source materials:\n- Audio: stale.mp3',
    ].join('\n\n'),
  }),
  [
    'Teacher source notes',
    'Attached classroom source materials:\n- Worksheet document: Updated worksheet.pdf',
  ].join('\n\n')
);
assert.equal(
  appendActivitySourceMaterialDraftNotes({
    sourceMaterials: [listeningMaterialReference],
    sourceText: [
      'Teacher source notes',
      '  Ａｔｔａｃｈｅｄ　classroom source materials:  \n- Worksheet document: stale.pdf',
    ].join('\n\n'),
  }),
  [
    'Teacher source notes',
    'Attached classroom source materials:\n- Audio: 三年级听力.mp3',
  ].join('\n\n')
);
assert.equal(
  appendActivitySourceMaterialDraftNotes({
    sourceMaterials: [],
    sourceText: refreshedMaterialDraftSourceText,
  }),
  'Teacher source notes'
);
const materialDraftSourceText = getActivityDraftSourceText({
  ...fallbackDraft,
  groupsText: '',
  pairsText: '',
  questionsText: '',
  sourceMaterials: [listeningMaterialReference],
  sourceSummary: 'Safe source summary',
  teacherNotesText: '',
  vocabularyText: '',
});
assert.equal(
  materialDraftSourceText,
  [
    'Safe source summary',
    'Attached classroom source materials:\n- Audio: 三年级听力.mp3',
  ].join('\n\n')
);
assert.doesNotMatch(materialDraftSourceText, unsafeMaterialMetadataPattern);
assert.equal(
  buildGenerateActivityDraftInputFromEditor({
    current: {
      ...activityEditorDefaultInput,
      sourceMaterials: [listeningMaterialReference],
    },
    itemCount: 5,
    sourceText: materialDraftSourceText,
  }).sourceText,
  materialDraftSourceText
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    groupsText: '',
    pairsText: '',
    questionsText: '',
    sourceSummary: '',
    sourceMaterials: [listeningMaterialReference],
    teacherNotesText: '',
    vocabularyText: '',
  }),
  'Attached classroom source materials:\n- Audio: 三年级听力.mp3'
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    groupsText: '',
    pairsText: '',
    questionsText: '',
    sourceSummary: '',
    sourceMaterials: [],
    teacherNotesText: '',
    vocabularyText: '',
  }),
  DEFAULT_ACTIVITY_DRAFT_SOURCE
);
const longDraftSourceText = getActivityDraftSourceText({
  ...fallbackDraft,
  groupsText: '',
  pairsText: '',
  questionsText: '',
  sourceSummary: 'A'.repeat(ACTIVITY_DRAFT_SOURCE_MAX_LENGTH - 10),
  teacherNotesText: '',
  vocabularyText: 'Vocabulary source should be clipped.',
});
assert.equal(longDraftSourceText.length, ACTIVITY_DRAFT_SOURCE_MAX_LENGTH);
assert.ok(longDraftSourceText.endsWith('...'));
const multilingualGroupContent = buildActivityContent({
  description: 'Multilingual group sort',
  difficulty: 'starter',
  gradeBand: 'Grade 1',
  groupsText: ['水果 | 苹果, 香蕉', '饮品 | 牛奶, 水'].join('\n'),
  language: 'zh',
  learningGoal: 'Students can classify familiar Chinese food words.',
  pairsText: '',
  questionsText: '',
  sourceSummary: 'Chinese food vocabulary classification.',
  subject: 'Chinese',
  teacherNotesText: 'Use categories first, then submit.',
  templateType: 'group-sort',
  title: '中文分类',
  visibility: 'draft',
  vocabularyText: '苹果, 香蕉, 牛奶, 水',
});
const multilingualGroupItems = getRuntimeItems(
  'group-sort',
  multilingualGroupContent
);
assert.deepEqual(
  multilingualGroupItems.map((item) => item.id),
  ['g-水果-苹果', 'g-水果-香蕉', 'g-饮品-牛奶', 'g-饮品-水']
);
assert.notEqual(multilingualGroupItems[0]?.id, multilingualGroupItems[1]?.id);
assert.notEqual(multilingualGroupItems[2]?.id, multilingualGroupItems[3]?.id);
assert.equal(
  evaluateRuntimeAnswers({
    answers: multilingualGroupItems.map((item) => ({
      answer: item.answer,
      itemId: item.id,
    })),
    content: multilingualGroupContent,
    templateType: 'group-sort',
  }).result.accuracy,
  100
);
const chinesePunctuationContent = buildActivityContent({
  description: 'Chinese punctuation classification',
  difficulty: 'starter',
  gradeBand: 'Grade 1',
  groupsText: ['水果 | 苹果，香蕉', '饮品 | 牛奶、水'].join('\n'),
  language: 'zh',
  learningGoal: 'Students can classify words entered with Chinese punctuation.',
  pairsText: '',
  questionsText: '苹果是什么？ | 苹果 | 苹果，香蕉；牛奶、水 | 苹果是水果。',
  sourceSummary: 'Chinese punctuation should split inline structured lists.',
  subject: 'Chinese',
  teacherNotesText: 'Use natural Chinese punctuation in the editor.',
  templateType: 'group-sort',
  title: '中文标点分类',
  visibility: 'draft',
  vocabularyText: '苹果，香蕉；牛奶、水',
});
assert.deepEqual(chinesePunctuationContent.vocabulary, [
  '苹果',
  '香蕉',
  '牛奶',
  '水',
]);
assert.deepEqual(
  chinesePunctuationContent.groups.flatMap((group) => group.items),
  ['苹果', '香蕉', '牛奶', '水']
);
assert.deepEqual(
  chinesePunctuationContent.questions[0]?.options.map((option) => option.text),
  ['苹果', '香蕉', '牛奶', '水']
);
const fullwidthRowSeparatorContent = buildActivityContent({
  description: 'Fullwidth row separator classification',
  difficulty: 'starter',
  gradeBand: 'Grade 1',
  groupsText: ['水果 ｜ 苹果，香蕉', '饮品 ｜ 牛奶、水'].join('\n'),
  language: 'zh',
  learningGoal: 'Students can use fullwidth separators in structured rows.',
  pairsText: '苹果｜水果',
  questionsText: '苹果是什么？｜苹果｜苹果，香蕉；牛奶、水｜苹果是水果。',
  sourceSummary: 'Fullwidth row separators should parse like ASCII pipes.',
  subject: 'Chinese',
  teacherNotesText: 'Use natural Chinese input method punctuation.',
  templateType: 'quiz',
  title: '全角分隔符练习',
  visibility: 'draft',
  vocabularyText: '',
});
assert.equal(fullwidthRowSeparatorContent.pairs[0]?.right, '水果');
assert.deepEqual(fullwidthRowSeparatorContent.groups[0]?.items, [
  '苹果',
  '香蕉',
]);
assert.deepEqual(
  fullwidthRowSeparatorContent.questions[0]?.options.map(
    (option) => option.text
  ),
  ['苹果', '香蕉', '牛奶', '水']
);
assert.equal(fullwidthRowSeparatorContent.questions[0]?.id, 'q-苹果是什么');
const chinesePunctuationGroupItems = getRuntimeItems(
  'group-sort',
  chinesePunctuationContent
);
assert.equal(chinesePunctuationGroupItems.length, 4);
assert.deepEqual(
  chinesePunctuationGroupItems.map((item) => item.id),
  ['g-水果-苹果', 'g-水果-香蕉', 'g-饮品-牛奶', 'g-饮品-水']
);
assert.equal(
  evaluateRuntimeAnswers({
    answers: chinesePunctuationGroupItems.map((item) => ({
      answer: item.answer,
      itemId: item.id,
    })),
    content: chinesePunctuationContent,
    templateType: 'group-sort',
  }).result.accuracy,
  100
);
const collidingGroupContent = buildActivityContent({
  description: 'Collision group sort',
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  groupsText: 'Treats | ice cream, ice-cream',
  language: 'en',
  learningGoal: 'Students can classify similar written items safely.',
  pairsText: '',
  questionsText: '',
  sourceSummary: 'Similar words should still receive unique runtime ids.',
  subject: 'English',
  teacherNotesText: 'Check item ids before publishing.',
  templateType: 'group-sort',
  title: 'Collision sort',
  visibility: 'draft',
  vocabularyText: 'ice cream, ice-cream',
});
assert.deepEqual(
  getRuntimeItems('group-sort', collidingGroupContent).map((item) => item.id),
  ['g-treats-ice-cream-1', 'g-treats-ice-cream-2']
);
assert.deepEqual(
  getRuntimeItems('group-sort', {
    ...collidingGroupContent,
    groups: [
      {
        id: 'g-food',
        items: ['苹果', '苹果！'],
        label: '食物',
      },
      {
        id: 'g-food',
        items: ['苹果', '苹果！'],
        label: '水果',
      },
    ],
  }).map((item) => item.id),
  ['g-food-苹果-1', 'g-food-苹果-2', 'g-food-苹果-3', 'g-food-苹果-4']
);
const collidingEditorContent = buildActivityContent({
  description: 'Editor id collision coverage',
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  groupsText: ['Treats | ice cream', 'Treats | ice-cream'].join('\n'),
  language: 'en',
  learningGoal: 'Students can answer repeated structured editor rows safely.',
  pairsText: ['ice cream | dessert', 'ice-cream | dessert'].join('\n'),
  questionsText: [
    'Frozen dessert? | ice cream | ice cream, ice-cream',
    'Frozen dessert? | ice-cream',
  ].join('\n'),
  sourceSummary: 'Repeated classroom text should still receive unique ids.',
  subject: 'English',
  teacherNotesText: 'Duplicate rows can happen while drafting.',
  templateType: 'quiz',
  title: 'Editor id collisions',
  visibility: 'draft',
  vocabularyText: 'ice cream, ice-cream',
});
assert.deepEqual(
  collidingEditorContent.questions.map((question) => question.id),
  ['q-frozen-dessert-1', 'q-frozen-dessert-2']
);
assert.deepEqual(
  collidingEditorContent.questions[0]?.options.map((option) => option.id),
  ['o-ice-cream-1', 'o-ice-cream-2']
);
assert.deepEqual(
  collidingEditorContent.pairs.map((pair) => pair.id),
  ['p-ice-cream-dessert-1', 'p-ice-cream-dessert-2']
);
assert.deepEqual(
  collidingEditorContent.groups.map((group) => group.id),
  ['g-treats-1', 'g-treats-2']
);

assert.deepEqual(ASSIGNMENT_SUBMISSION_ANSWER_LIMITS, {
  answerMaxLength: 500,
  itemIdMaxLength: 120,
  maxAnswers: 200,
});
assert.deepEqual(ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS, {
  anonymousTokenMaxLength: 120,
  anonymousTokenMinLength: 12,
  studentNameMaxLength: 80,
});
assert.deepEqual(ASSIGNMENT_SUBMISSION_DURATION_RANGE, {
  max: 24 * 60 * 60,
  min: 0,
});
assert.doesNotThrow(() =>
  assertSubmittedAnswersMatchRuntimeItems({
    answers: [{ itemId: 'item-1' }, { itemId: 'item-3' }],
    runtimeItems: submissionRuntimeItems,
  })
);
assert.deepEqual(
  normalizeSubmittedAttemptAnswers([
    { answer: 'Paris', itemId: ' ｉｔｅｍ－１ ' },
    { answer: 'Rome', itemId: 'item-3' },
  ]),
  [
    { answer: 'Paris', itemId: 'item-1' },
    { answer: 'Rome', itemId: 'item-3' },
  ]
);
assert.doesNotThrow(() =>
  assertSubmittedAnswersMatchRuntimeItems({
    answers: [{ itemId: ' ｉｔｅｍ－１ ' }, { itemId: 'item-3' }],
    runtimeItems: submissionRuntimeItems,
  })
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [
        { itemId: 'item-1' },
        { itemId: 'item-2' },
        { itemId: 'item-3' },
        { itemId: 'item-4' },
      ],
      runtimeItems: submissionRuntimeItems,
    }),
  /exceed assignment item count/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'unknown-item' }],
      runtimeItems: submissionRuntimeItems,
    }),
  /unknown item/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }, { itemId: 'item-1' }],
      runtimeItems: submissionRuntimeItems,
    }),
  /duplicate item/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }, { itemId: ' ｉｔｅｍ－１ ' }],
      runtimeItems: submissionRuntimeItems,
    }),
  /duplicate item/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }, { itemId: 'item-2' }],
      runtimeItems: [{ id: 'item-1' }, { id: 'item-1' }, { id: 'item-2' }],
    }),
  /runtime items include a duplicate item id/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }],
      runtimeItems: [{ id: 'item-1' }, { id: ' ｉｔｅｍ－１ ' }],
    }),
  /runtime items include a duplicate item id/
);

assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: undefined,
    timeLimitSeconds: 60,
  }),
  undefined
);
assert.deepEqual(ASSIGNMENT_ATTEMPT_DURATION_UNITS, {
  millisecondsPerSecond: 1000,
  secondsPerMinute: 60,
  timerSecondPaddingLength: 2,
});
assert.equal(normalizeAttemptDurationSeconds({ durationSeconds: -3 }), 0);
assert.equal(normalizeAttemptDurationSeconds({ durationSeconds: 4.6 }), 5);
assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: Number.POSITIVE_INFINITY,
  }),
  undefined
);
assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: 90,
    timeLimitSeconds: 60,
  }),
  60
);
assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: 90,
    timeLimitSeconds: -60,
  }),
  90
);
assert.equal(
  buildAttemptStartedAt({
    completedAt: new Date('2026-01-01T10:00:00.000Z'),
    durationSeconds: 65,
  }).toISOString(),
  '2026-01-01T09:58:55.000Z'
);
assert.equal(
  buildAttemptStartedAt({
    completedAt: new Date('2026-01-01T10:00:00.000Z'),
    durationSeconds: -3,
  }).toISOString(),
  '2026-01-01T10:00:00.000Z'
);
assert.equal(
  buildAttemptStartedAt({
    completedAt: new Date('2026-01-01T10:00:00.000Z'),
    durationSeconds: Number.POSITIVE_INFINITY,
  }).toISOString(),
  '2026-01-01T10:00:00.000Z'
);
assert.equal(
  buildAttemptStartedAt({
    completedAt: new Date('not-a-date'),
    durationSeconds: 65,
  }).getTime(),
  Number.NaN
);
assert.deepEqual(
  buildAttemptTimerState({
    now: 1_000,
    startedAt: 2_000,
  }),
  {
    durationSeconds: 0,
    elapsedSeconds: 0,
    remainingSeconds: undefined,
    timeExpired: false,
  }
);
assert.deepEqual(
  buildAttemptTimerState({
    now: Number.NaN,
    startedAt: 1_000,
    timeLimitSeconds: Number.POSITIVE_INFINITY,
  }),
  {
    durationSeconds: 0,
    elapsedSeconds: 0,
    remainingSeconds: undefined,
    timeExpired: false,
  }
);
assert.deepEqual(
  buildAttemptTimerState({
    now: 6_500,
    startedAt: 1_000,
    timeLimitSeconds: 10,
  }),
  {
    durationSeconds: 6,
    elapsedSeconds: 6,
    remainingSeconds: 4,
    timeExpired: false,
  }
);
assert.deepEqual(
  buildAttemptTimerState({
    now: 12_000,
    startedAt: 1_000,
    timeLimitSeconds: 10,
  }),
  {
    durationSeconds: 11,
    elapsedSeconds: 11,
    remainingSeconds: 0,
    timeExpired: true,
  }
);
assert.equal(formatAttemptDuration(undefined), '-');
assert.equal(formatAttemptDuration(undefined, { emptyValue: '' }), '');
assert.equal(formatAttemptDuration(0), '-');
assert.equal(formatAttemptDuration(4.6), '5s');
assert.equal(formatAttemptDuration(65), '1m 05s');
assert.equal(formatAttemptDuration(-3), '-');
assert.equal(formatAttemptDuration(Number.NaN, { style: 'timer' }), '-');
assert.equal(formatAttemptDuration(65, { style: 'timer' }), '1:05');
assert.equal(formatAttemptDuration(5, { style: 'timer' }), '5s');
assert.equal(formatAssignmentResultDate(null), '-');
assert.equal(formatAssignmentResultDate('not-a-date'), '-');
assert.equal(formatAssignmentResultCsvNumber(null), '');
assert.equal(formatAssignmentResultCsvNumber(Number.NaN), '');
assert.equal(formatAssignmentResultCsvNumber(-3, { min: 0 }), 0);
assert.equal(formatAssignmentResultCsvNumber(4.6), 4.6);
assert.equal(formatAssignmentResultCsvNumber(4.6, { round: true }), 5);
assert.match(
  formatAssignmentResultDate(new Date('2026-01-01T10:00:00.000Z'), {
    locale: 'en-US',
    timeZone: 'UTC',
  }),
  /Jan 1, 2026, 10:00 AM/
);
assert.equal(formatAcceptedAnswerAlternatives([]), '-');
assert.equal(formatAcceptedAnswerAlternatives(['Paris']), '-');
assert.equal(
  formatAcceptedAnswerAlternatives(['Paris', 'Paris, France']),
  'Paris, Paris, France'
);
assert.equal(
  formatAcceptedAnswerAlternatives(['Paris', 'Paris, France'], {
    emptyValue: '',
    separator: ' | ',
  }),
  'Paris | Paris, France'
);
assert.equal(
  formatAcceptedAnswerAlternatives(['Paris', 'Paris, France'], {
    emptyValue: '',
    includePrimary: false,
  }),
  'Paris, France'
);
assert.equal(
  formatPrimaryAcceptedAnswer([' Paris ', 'Paris, France']),
  'Paris'
);
assert.equal(formatPrimaryAcceptedAnswer([]), '-');
assert.equal(
  formatAcceptedAnswerAlternatives([
    ' Paris ',
    '',
    'paris',
    'Ｐａｒｉｓ',
    'Paris, France',
  ]),
  'Paris, Paris, France'
);
assert.equal(
  formatAcceptedAnswerAlternatives([' Ｐａｒｉｓ ', 'Paris\u00A0　France']),
  'Paris, Paris France'
);
assert.equal(formatOptionalAcceptedAnswerAlternatives([]), null);
assert.equal(formatOptionalAcceptedAnswerAlternatives(['Paris']), null);
assert.equal(
  formatOptionalAcceptedAnswerAlternatives(['Paris', ' paris ', 'Ｐａｒｉｓ']),
  null
);
assert.equal(
  formatOptionalAcceptedAnswerAlternatives(['Paris', 'Paris, France']),
  'Paris, Paris, France'
);
assert.equal(
  formatOptionalAcceptedAnswerAlternatives(['Paris', 'Paris, France'], {
    separator: ' | ',
  }),
  'Paris | Paris, France'
);
assert.equal(
  formatOptionalAcceptedAnswerAlternatives(['Paris', 'Paris, France'], {
    includePrimary: false,
  }),
  'Paris, France'
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(formatAssignmentResultDate(null), '-');
  assert.equal(formatAssignmentResultNumber(Number.NaN), '-');
  assert.equal(formatAssignmentResultPercent(Number.NaN), '-');
  assert.equal(formatAssignmentResultValue(''), '-');
  assert.equal(
    formatAcceptedAnswerAlternatives(['Paris', 'Paris, France']),
    'Paris，Paris, France'
  );
  assert.equal(formatAcceptedAnswerAlternatives([]), '-');
  assert.equal(
    formatOptionalAcceptedAnswerAlternatives(['Paris', 'Paris, France']),
    'Paris，Paris, France'
  );
  assert.equal(
    formatAcceptedAnswerAlternatives(['Paris', 'Paris, France'], {
      includePrimary: false,
    }),
    'Paris, France'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(formatAssignmentResultValue(''), '-');
assert.equal(formatAssignmentResultValue('   '), '-');
assert.equal(formatAssignmentResultValue(' Paris '), 'Paris');
assert.equal(
  formatAssignmentResultValue(' Ｐａｒｉｓ\u00A0　France '),
  'Paris France'
);
assert.equal(formatAssignmentResultValue('\u00A0　\t'), '-');
assert.equal(formatAssignmentResultValue(null, { emptyValue: '' }), '');
assert.equal(formatAssignmentResultValue('', { emptyValue: 'none' }), 'none');
assert.equal(formatAssignmentSummaryAccuracy(67), '67%');
assert.equal(formatAssignmentSummaryAccuracy(67.4), '67%');
assert.equal(formatAssignmentSummaryAccuracy(Number.NaN), '-');
assert.equal(formatAssignmentSummaryCorrectRate(67), '67% correct');
assert.equal(
  formatAssignmentSummaryCorrectCount({
    correctCount: 2,
    submittedCount: 3,
  }),
  '2/3 correct'
);
assert.equal(
  formatAssignmentSummaryCorrectCount({
    correctCount: Number.NaN,
    submittedCount: -3,
  }),
  '0/0 correct'
);
assert.equal(
  formatAssignmentSummaryCorrectCount({
    correctCount: 2.8,
    submittedCount: 3.9,
  }),
  '2/3 correct'
);
assert.equal(
  formatAssignmentSummaryItemPerformance({
    correctCount: 2,
    correctRate: 67,
    submittedCount: 3,
  }),
  '67% correct, 2/3'
);
assert.equal(
  formatAssignmentSummaryItemPerformance({
    correctCount: Number.POSITIVE_INFINITY,
    correctRate: Number.NaN,
    submittedCount: -1,
  }),
  '- correct, 0/0'
);
assert.equal(formatAssignmentSummaryReviewItemCount(1), '1 item to review');
assert.equal(formatAssignmentSummaryReviewItemCount(2), '2 items to review');
assert.equal(formatAssignmentSummaryReviewItemCount(-2), '0 items to review');
assert.equal(
  formatAssignmentSummaryReviewItemCount(Number.NaN),
  '0 items to review'
);
assert.equal(formatAssignmentSummaryReviewCount(1), '1 review');
assert.equal(formatAssignmentSummaryReviewCount(-2), '0 reviews');
assert.equal(formatAssignmentSummaryReviewCount(2.8), '2 reviews');
assert.equal(formatAssignmentSummaryAttemptCount(1), '1 attempt');
assert.equal(formatAssignmentSummaryAttemptCount(2), '2 attempts');
assert.equal(formatAssignmentSummaryAttemptCount(-1), '0 attempts');
assert.equal(formatAssignmentSummaryAttemptCount(2.8), '2 attempts');
assert.deepEqual(summarizeAssignmentAttempts([]), {
  averageDurationSeconds: 0,
  averagePoints: 0,
  averageScore: 0,
  completions: 0,
});
assert.deepEqual(normalizeAssignmentAttemptStats(null), {
  averageDurationSeconds: 0,
  averagePoints: 0,
  averageScore: 0,
  completions: 0,
});
assert.deepEqual(
  normalizeAssignmentAttemptStats({
    averageDurationSeconds: 12.4,
    averagePoints: -1,
    averageScore: Number.NaN,
    completions: 2.8,
  }),
  {
    averageDurationSeconds: 12,
    averagePoints: 0,
    averageScore: 0,
    completions: 2,
  }
);
assert.deepEqual(buildAssignmentAttemptStatsView(undefined), {
  averageDurationSeconds: undefined,
  averagePoints: undefined,
  averageScore: undefined,
  completed: false,
  completions: 0,
});
assert.deepEqual(
  withAssignmentAttemptStatsSettings({
    resultJson: null,
    settingsJson: {
      timeLimitSeconds: 120,
    },
  }),
  {
    resultJson: null,
    settingsJson: {
      timeLimitSeconds: 120,
    },
    timeLimitSeconds: 120,
  }
);
assert.deepEqual(
  withAssignmentAttemptStatsSettings({
    resultJson: null,
    settingsJson: {
      timeLimitSeconds: Number.NaN,
    },
  }),
  {
    resultJson: null,
    settingsJson: {
      timeLimitSeconds: Number.NaN,
    },
    timeLimitSeconds: undefined,
  }
);
assert.deepEqual(
  buildAssignmentAttemptStatsView({
    averageDurationSeconds: 0,
    averagePoints: 0,
    averageScore: 0,
    completions: 0,
  }),
  {
    averageDurationSeconds: undefined,
    averagePoints: undefined,
    averageScore: undefined,
    completed: false,
    completions: 0,
  }
);
assert.deepEqual(
  buildAssignmentAttemptStatsView({
    averageDurationSeconds: 12.4,
    averagePoints: 1.6,
    averageScore: 76.6,
    completions: 2.8,
  }),
  {
    averageDurationSeconds: 12,
    averagePoints: 2,
    averageScore: 77,
    completed: true,
    completions: 2,
  }
);
assert.deepEqual(
  buildAssignmentAttemptStatsView({
    averageDurationSeconds: Number.NaN,
    averagePoints: Number.POSITIVE_INFINITY,
    averageScore: -4,
    completions: 2,
  }),
  {
    averageDurationSeconds: undefined,
    averagePoints: undefined,
    averageScore: 0,
    completed: true,
    completions: 2,
  }
);
assert.deepEqual(
  buildAssignmentAttemptStatsView({
    averageDurationSeconds: 60,
    averagePoints: 2,
    averageScore: 50,
    completions: Number.POSITIVE_INFINITY,
  }),
  {
    averageDurationSeconds: undefined,
    averagePoints: undefined,
    averageScore: undefined,
    completed: false,
    completions: undefined,
  }
);
assert.deepEqual(
  summarizeAssignmentAttempts([
    {
      resultJson: {
        accuracy: 50,
        completedItemCount: 1,
        correctItemCount: 1,
        durationSeconds: 30,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
    },
    {
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        durationSeconds: 61,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
    },
    {
      resultJson: {
        accuracy: 0,
        completedItemCount: 0,
        correctItemCount: 0,
        earnedPoints: 0,
        totalPoints: 2,
      },
      score: Number.NaN,
    },
    {
      resultJson: null,
      score: null,
    },
  ]),
  {
    averageDurationSeconds: 46,
    averagePoints: 1,
    averageScore: 50,
    completions: 3,
  }
);
assert.deepEqual(
  summarizeAssignmentAttempts([
    {
      resultJson: null,
      score: 10,
    },
  ]),
  {
    averageDurationSeconds: 0,
    averagePoints: 0,
    averageScore: 0,
    completions: 0,
  }
);
assert.deepEqual(
  summarizeAssignmentAttempts([
    {
      resultJson: {
        accuracy: Number.NaN,
        completedItemCount: 0,
        correctItemCount: 0,
        durationSeconds: Number.POSITIVE_INFINITY,
        earnedPoints: Number.NaN,
        totalPoints: 2,
      },
      score: Number.NaN,
    },
    {
      resultJson: {
        accuracy: 80,
        completedItemCount: 1,
        correctItemCount: 1,
        durationSeconds: -3,
        earnedPoints: 4,
        totalPoints: 5,
      },
      score: null,
    },
    {
      resultJson: {
        accuracy: Number.POSITIVE_INFINITY,
        completedItemCount: 1,
        correctItemCount: 1,
        durationSeconds: 4.4,
        earnedPoints: Number.POSITIVE_INFINITY,
        totalPoints: 5,
      },
      score: 3,
    },
  ]),
  {
    averageDurationSeconds: 2,
    averagePoints: 2,
    averageScore: 27,
    completions: 3,
  }
);
assert.deepEqual(
  summarizeAssignmentAttempts(
    [
      {
        resultJson: {
          accuracy: 100,
          completedItemCount: 2,
          correctItemCount: 2,
          durationSeconds: 120,
          earnedPoints: 2,
          totalPoints: 2,
        },
        score: 2,
      },
      {
        resultJson: {
          accuracy: 50,
          completedItemCount: 1,
          correctItemCount: 1,
          durationSeconds: 30,
          earnedPoints: 1,
          totalPoints: 2,
        },
        score: 1,
      },
    ],
    { timeLimitSeconds: 60 }
  ),
  {
    averageDurationSeconds: 45,
    averagePoints: 2,
    averageScore: 75,
    completions: 2,
  }
);
const assignmentAttemptStatsById = summarizeAssignmentAttemptsByAssignmentId([
  {
    assignmentId: 'assignment-a',
    resultJson: {
      accuracy: 50,
      completedItemCount: 1,
      correctItemCount: 1,
      durationSeconds: 30,
      earnedPoints: 1,
      totalPoints: 2,
    },
  },
  {
    assignmentId: 'assignment-b',
    resultJson: {
      accuracy: 100,
      completedItemCount: 2,
      correctItemCount: 2,
      durationSeconds: 60,
      earnedPoints: 2,
      totalPoints: 2,
    },
  },
  {
    assignmentId: 'assignment-a',
    resultJson: {
      accuracy: 100,
      completedItemCount: 2,
      correctItemCount: 2,
      durationSeconds: 60,
      earnedPoints: 2,
      totalPoints: 2,
    },
  },
]);
assert.deepEqual(assignmentAttemptStatsById.get('assignment-a'), {
  averageDurationSeconds: 45,
  averagePoints: 2,
  averageScore: 75,
  completions: 2,
});
assert.deepEqual(assignmentAttemptStatsById.get('assignment-b'), {
  averageDurationSeconds: 60,
  averagePoints: 2,
  averageScore: 100,
  completions: 1,
});
assert.equal(assignmentAttemptStatsById.get('assignment-c'), undefined);
assert.deepEqual(
  summarizeAssignmentAttemptsByAssignmentId([
    {
      assignmentId: 'assignment-c',
      resultJson: null,
      score: 10,
    },
  ]).get('assignment-c'),
  {
    averageDurationSeconds: 0,
    averagePoints: 0,
    averageScore: 0,
    completions: 0,
  }
);
const clampedAssignmentAttemptStatsById =
  summarizeAssignmentAttemptsByAssignmentId([
    {
      assignmentId: 'assignment-a',
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        durationSeconds: 120,
        earnedPoints: 2,
        totalPoints: 2,
      },
      timeLimitSeconds: 60,
    },
    {
      assignmentId: 'assignment-a',
      resultJson: {
        accuracy: 50,
        completedItemCount: 1,
        correctItemCount: 1,
        durationSeconds: 30,
        earnedPoints: 1,
        totalPoints: 2,
      },
      timeLimitSeconds: 60,
    },
    {
      assignmentId: 'assignment-b',
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        durationSeconds: 120,
        earnedPoints: 2,
        totalPoints: 2,
      },
    },
  ]);
assert.equal(
  clampedAssignmentAttemptStatsById.get('assignment-a')?.averageDurationSeconds,
  45
);
assert.equal(
  clampedAssignmentAttemptStatsById.get('assignment-b')?.averageDurationSeconds,
  120
);

const resultRuntimeItems = [
  {
    answer: 'Paris / Paris, France',
    choices: ['Paris', 'Rome'],
    explanation: 'Paris is the capital of France.',
    id: 'q-1',
    kind: 'question',
    prompt: 'Capital of France?',
  },
  {
    answer: 'Cold',
    choices: ['Cold', 'Warm'],
    id: 'pair-1',
    kind: 'pair',
    prompt: 'Hot',
  },
] satisfies RuntimeItem[];

const resultAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          { answer: 'paris france', correct: true, itemId: 'q-1' },
          { answer: 'Warm', correct: false, itemId: 'pair-1' },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'attempt-1',
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        correctItemCount: 1,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
      studentName: ' Alice ',
    },
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          { answer: 'Paris', correct: true, itemId: 'q-1' },
          { answer: 'Cold', correct: true, itemId: 'pair-1' },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-02T10:00:00.000Z'),
      id: 'attempt-2',
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
      studentName: 'alice',
    },
    {
      anonymousToken: 'browser-token-1',
      answersJson: {
        answers: [{ answer: 'Rome', correct: false, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-03T10:00:00.000Z'),
      id: 'attempt-3',
      resultJson: {
        accuracy: 0,
        completedItemCount: 1,
        correctItemCount: 0,
        earnedPoints: 0,
        totalPoints: 2,
      },
      score: 0,
      studentName: null,
    },
  ],
  runtimeItems: resultRuntimeItems,
});
assert.deepEqual(ASSIGNMENT_RESULTS_ANALYSIS_LIMITS, {
  needsReviewItems: 3,
});

const chronologicalAnonymousResultAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: 'newer-browser-token',
      answersJson: {
        answers: [{ answer: 'Rome', correct: false, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-03T10:00:00.000Z'),
      id: 'newer-anonymous-attempt',
      resultJson: {
        accuracy: 0,
        completedItemCount: 1,
        correctItemCount: 0,
        earnedPoints: 0,
        totalPoints: 1,
      },
      score: 0,
      studentName: null,
    },
    {
      anonymousToken: 'older-browser-token',
      answersJson: {
        answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'older-anonymous-attempt',
      resultJson: {
        accuracy: 100,
        completedItemCount: 1,
        correctItemCount: 1,
        earnedPoints: 1,
        totalPoints: 1,
      },
      score: 1,
      studentName: null,
    },
  ],
  runtimeItems: resultRuntimeItems.slice(0, 1),
});
assert.deepEqual(
  chronologicalAnonymousResultAnalysis.attempts.map((attempt) => ({
    id: attempt.id,
    studentKey: attempt.studentKey,
    studentLabel: attempt.studentLabel,
  })),
  [
    {
      id: 'newer-anonymous-attempt',
      studentKey: 'anonymous:2',
      studentLabel: 'Anonymous student 2',
    },
    {
      id: 'older-anonymous-attempt',
      studentKey: 'anonymous:1',
      studentLabel: 'Anonymous student 1',
    },
  ]
);
assert.deepEqual(
  chronologicalAnonymousResultAnalysis.students.map((student) => ({
    studentKey: student.studentKey,
    studentLabel: student.studentLabel,
  })),
  [
    {
      studentKey: 'anonymous:2',
      studentLabel: 'Anonymous student 2',
    },
    {
      studentKey: 'anonymous:1',
      studentLabel: 'Anonymous student 1',
    },
  ]
);
assert.equal(
  JSON.stringify(chronologicalAnonymousResultAnalysis).includes(
    'browser-token'
  ),
  false
);

const resultAnalysisWithUnscoredAttempt = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'completed-attempt',
      resultJson: {
        accuracy: 100,
        completedItemCount: 1,
        correctItemCount: 1,
        earnedPoints: 1,
        totalPoints: 1,
      },
      score: 1,
      studentName: 'Alice',
    },
    {
      anonymousToken: null,
      answersJson: {
        answers: [{ answer: 'Rome', correct: false, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: null,
      id: 'unscored-attempt',
      resultJson: null,
      score: null,
      studentName: 'Bob',
    },
  ],
  runtimeItems: resultRuntimeItems,
});
assert.deepEqual(
  resultAnalysisWithUnscoredAttempt.attempts.map((attempt) => attempt.id),
  ['completed-attempt']
);
assert.equal(resultAnalysisWithUnscoredAttempt.perItem[0]?.submittedCount, 1);
assert.equal(resultAnalysisWithUnscoredAttempt.perItem[0]?.correctRate, 100);
assert.deepEqual(
  resultAnalysisWithUnscoredAttempt.students.map((student) => ({
    attempts: student.attempts,
    studentLabel: student.studentLabel,
  })),
  [{ attempts: 1, studentLabel: 'Alice' }]
);
assert.deepEqual(
  filterAssignmentResultCompletedAttemptRows({
    attempts: [
      { id: 'completed-attempt', studentName: 'Alice' },
      { id: 'unscored-attempt', studentName: 'Bob' },
    ],
    reviews: resultAnalysisWithUnscoredAttempt.attempts,
  }).map((attempt) => attempt.id),
  ['completed-attempt']
);
const emptyResultsPageView = buildAssignmentResultsPageViewModel({
  data: null,
  search: {},
});
assert.deepEqual(
  {
    actionCount: emptyResultsPageView.actionButtons.length,
    breadcrumbs: emptyResultsPageView.breadcrumbs,
    completedAttemptCount: emptyResultsPageView.completedAttemptCount,
    contentState: emptyResultsPageView.contentState,
    headerView: emptyResultsPageView.headerView,
    metricItems: emptyResultsPageView.metricItems,
    sectionState: emptyResultsPageView.sectionState,
    title: emptyResultsPageView.title,
    viewState: emptyResultsPageView.viewState,
  },
  {
    actionCount: 5,
    breadcrumbs: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/assignments', label: 'Assignments' },
      { isCurrentPage: true, label: 'Assignment results' },
    ],
    completedAttemptCount: 0,
    contentState: {
      hasAttemptReviewCards: false,
      hasAttemptRows: false,
      hasStudentSummaryRows: false,
    },
    headerView: null,
    metricItems: [],
    sectionState: {
      showAnswerReview: false,
      showClassroomBrief: false,
      showItemPerformance: false,
      showReteachPriorities: false,
      showStudentSearch: false,
      showStudentSummary: false,
    },
    title: 'Assignment results',
    viewState: {
      attemptReviewFilter: 'all',
      itemPerformanceSort: 'original',
      studentSearch: '',
      studentSort: 'needs-review',
    },
  }
);
const scoredResultsPageView = buildAssignmentResultsPageViewModel({
  data: {
    activity: {
      description: 'Current activity description',
      templateType: 'quiz',
      title: 'Current activity title',
    },
    analysis: resultAnalysisWithUnscoredAttempt,
    assignment: {
      expiresAt: null,
      settingsJson: {
        timeLimitSeconds: 60,
      },
      shareSlug: 'result-share',
      status: 'published',
      title: ' Ｗｅｅｋ\u00A0　1   results ',
    },
    attempts: [
      {
        completedAt: new Date('2026-01-01T10:00:00.000Z'),
        id: 'completed-attempt',
        maxScore: 1,
        resultJson: {
          accuracy: 100,
          completedItemCount: 1,
          durationSeconds: 30,
          totalPoints: 1,
        },
        score: 1,
        studentName: 'Alice',
      },
      {
        completedAt: null,
        id: 'unscored-attempt',
        maxScore: null,
        resultJson: null,
        score: null,
        studentName: 'Bob',
      },
    ],
    snapshot: null,
    stats: {
      averageDurationSeconds: 30,
      averagePoints: 1,
      averageScore: 100,
      completions: 1,
    },
  },
  search: {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: 'name',
    student: 'Alice',
  },
});
assert.deepEqual(
  {
    actionDisabled: scoredResultsPageView.actionButtons.map((button) => [
      button.action,
      button.disabled,
    ]),
    attemptReviewCardViews: scoredResultsPageView.attemptReviewCardViews.map(
      (card) => [card.id, card.studentLabel, card.answerViews.length]
    ),
    attemptRowViews: scoredResultsPageView.attemptRowViews.map((row) => [
      row.id,
      row.studentLabel,
      row.durationLabel,
    ]),
    breadcrumbs: scoredResultsPageView.breadcrumbs.map(
      (breadcrumb) => breadcrumb.label
    ),
    completedAttemptIds: scoredResultsPageView.completedAttempts.map(
      (attempt) => attempt.id
    ),
    completedAttemptReviewCount:
      scoredResultsPageView.completedAttemptReviewCount,
    contentState: scoredResultsPageView.contentState,
    classroomBriefReady: Boolean(scoredResultsPageView.classroomBrief),
    controlViews: {
      attemptReviewFilter: [
        scoredResultsPageView.controlViews.attemptReviewFilter.filter,
        scoredResultsPageView.controlViews.attemptReviewFilter.options.map(
          (option) => option.value
        ),
      ],
      itemPerformanceSort: [
        scoredResultsPageView.controlViews.itemPerformanceSort.sort,
        scoredResultsPageView.controlViews.itemPerformanceSort.options.map(
          (option) => option.value
        ),
      ],
      studentSearch: {
        hasSearchValue:
          scoredResultsPageView.controlViews.studentSearch.hasSearchValue,
        sort: scoredResultsPageView.controlViews.studentSearch.sort,
        sortOptions:
          scoredResultsPageView.controlViews.studentSearch.sortOptions.map(
            (option) => option.value
          ),
        summary: scoredResultsPageView.controlViews.studentSearch.summary,
        value: scoredResultsPageView.controlViews.studentSearch.value,
      },
    },
    filteredAttemptIds:
      scoredResultsPageView.resultView.filteredAttemptRows.map(
        ({ attempt }) => attempt.id
      ),
    headerPrintLabel: scoredResultsPageView.headerView?.printAction.label,
    headerTitle: scoredResultsPageView.headerView?.assignmentTitle,
    itemPerformanceRowViews: scoredResultsPageView.itemPerformanceRowViews.map(
      (row) => [row.id, row.itemNumberLabel, row.correctRateLabel]
    ),
    itemAnalysisCardViews: scoredResultsPageView.itemAnalysisCardViews.map(
      (item) => [item.id, item.correctRateLabel]
    ),
    metricValues: scoredResultsPageView.metricItems.map((metric) => [
      metric.key,
      metric.value,
    ]),
    sectionState: scoredResultsPageView.sectionState,
    studentSummaryRowViews: scoredResultsPageView.studentSummaryRowViews.map(
      (row) => [row.studentLabel, row.needsReviewLabel]
    ),
    title: scoredResultsPageView.title,
    viewState: scoredResultsPageView.viewState,
  },
  {
    actionDisabled: [
      ['copy-brief', false],
      ['copy-reteach-plan', false],
      ['copy-item-review', false],
      ['copy-follow-up', false],
      ['export-csv', false],
    ],
    attemptReviewCardViews: [],
    attemptRowViews: [['completed-attempt', 'Alice', '30s']],
    breadcrumbs: ['Dashboard', 'Assignments', 'Week 1 results'],
    completedAttemptIds: ['completed-attempt'],
    completedAttemptReviewCount: 1,
    contentState: {
      hasAttemptReviewCards: false,
      hasAttemptRows: true,
      hasStudentSummaryRows: true,
    },
    classroomBriefReady: true,
    controlViews: {
      attemptReviewFilter: ['needs-review', ['all', 'needs-review']],
      itemPerformanceSort: [
        'accuracy',
        ['original', 'accuracy', 'submitted', 'type'],
      ],
      studentSearch: {
        hasSearchValue: true,
        sort: 'name',
        sortOptions: ['needs-review', 'best', 'name', 'attempts'],
        summary: '1 student · 1 attempt',
        value: 'Alice',
      },
    },
    filteredAttemptIds: ['completed-attempt'],
    headerPrintLabel: 'Print worksheet',
    headerTitle: 'Week 1 results',
    itemPerformanceRowViews: [
      ['pair-1', '1.', '0%'],
      ['q-1', '2.', '100%'],
    ],
    itemAnalysisCardViews: [['q-1', '100%']],
    metricValues: [
      ['completions', '1'],
      ['average-accuracy', '100%'],
      ['average-points', '1'],
      ['average-time', '30s'],
      ['closes', 'No close time'],
    ],
    sectionState: {
      showAnswerReview: true,
      showClassroomBrief: true,
      showItemPerformance: true,
      showReteachPriorities: true,
      showStudentSearch: true,
      showStudentSummary: true,
    },
    studentSummaryRowViews: [['Alice', '0']],
    title: 'Week 1 results',
    viewState: {
      attemptReviewFilter: 'needs-review',
      itemPerformanceSort: 'accuracy',
      studentSearch: 'Alice',
      studentSort: 'name',
    },
  }
);
assert.deepEqual(
  buildAssignmentResultContentState({
    attemptReviewCardCount: 1,
    attemptRowCount: 0,
    studentSummaryRowCount: 2,
  }),
  {
    hasAttemptReviewCards: true,
    hasAttemptRows: false,
    hasStudentSummaryRows: true,
  }
);

assert.equal(resultAnalysis.perItem[0]?.correctCount, 2);
assert.equal(resultAnalysis.perItem[0]?.submittedCount, 3);
assert.equal(resultAnalysis.perItem[0]?.correctRate, 67);
assert.equal(resultAnalysis.perItem[0]?.kindLabel, 'Question');
assert.equal(resultAnalysis.perItem[1]?.kindLabel, 'Pair');
assert.deepEqual(resultAnalysis.perItem[0]?.acceptedAnswers, [
  'Paris',
  'Paris, France',
]);
assert.deepEqual(
  buildAssignmentResultAcceptedAnswerView(['Paris', 'Paris, France']),
  {
    acceptedAlternativesText: 'Paris, France',
    expectedAnswerText: 'Paris',
    optionalAcceptedAlternativesText: 'Paris, France',
  }
);
assert.deepEqual(buildAssignmentResultAcceptedAnswerView(['Cold']), {
  acceptedAlternativesText: '-',
  expectedAnswerText: 'Cold',
  optionalAcceptedAlternativesText: null,
});
assert.deepEqual(
  buildAssignmentResultAnswerStatusView(
    resultAnalysis.attempts[0]!.answers[0]!
  ),
  {
    exportLabel: 'correct',
    label: 'Correct',
    tone: 'correct',
  }
);
assert.deepEqual(
  buildAssignmentResultAttemptAnswerTextView(
    resultAnalysis.attempts[0]!.answers[0]!
  ),
  {
    acceptedAlternativesText: 'Paris, France',
    expectedAnswerText: 'Paris',
    exportStatusLabel: 'correct',
    exportStudentAnswerText: 'paris france',
    optionalAcceptedAlternativesText: 'Paris, France',
    statusLabel: 'Correct',
    statusTone: 'correct',
    studentAnswerText: 'paris france',
  }
);
assert.deepEqual(
  buildAssignmentResultAttemptAnswerTextView(
    {
      ...resultAnalysis.attempts[0]!.answers[1]!,
      acceptedAnswers: ['Cold'],
      answer: '',
      submitted: false,
    },
    {
      acceptedAnswerEmptyValue: '',
      studentAnswerEmptyValue: '',
    }
  ),
  {
    acceptedAlternativesText: '',
    expectedAnswerText: 'Cold',
    exportStatusLabel: 'unanswered',
    exportStudentAnswerText: 'unanswered',
    optionalAcceptedAlternativesText: null,
    statusLabel: 'Unanswered',
    statusTone: 'idle',
    studentAnswerText: 'Unanswered',
  }
);
assert.deepEqual(
  buildAssignmentItemAnalysisCardView(resultAnalysis.perItem[0]!),
  {
    acceptedAnswersLabel: 'Accepted',
    acceptedAnswersLineText: 'Accepted: Paris, France',
    acceptedAnswersText: 'Paris, France',
    correctRateLabel: '67%',
    correctRateProgressValue: 67,
    correctSummaryLabel: '2/3 correct',
    expectedAnswerLabel: 'answer',
    expectedAnswerSummaryText: '2/3 correct · answer: Paris',
    expectedAnswerText: 'Paris',
    explanationText: 'Paris is the capital of France.',
    kindLabel: 'Question',
    prompt: 'Capital of France?',
  }
);
assert.deepEqual(
  buildAssignmentItemAnalysisCardView({
    ...resultAnalysis.perItem[1]!,
    acceptedAnswers: ['Cold'],
    expectedAnswer: '',
    explanation: '',
  }),
  {
    acceptedAnswersLabel: 'Accepted',
    acceptedAnswersLineText: null,
    acceptedAnswersText: null,
    correctRateLabel: '50%',
    correctRateProgressValue: 50,
    correctSummaryLabel: '1/2 correct',
    expectedAnswerLabel: 'answer',
    expectedAnswerSummaryText: '1/2 correct · answer: Cold',
    expectedAnswerText: 'Cold',
    explanationText: null,
    kindLabel: 'Pair',
    prompt: 'Match "Hot" with its pair.',
  }
);
assert.deepEqual(
  buildAssignmentItemAnalysisCardViews(resultAnalysis.perItem).map((item) => [
    item.id,
    item.kindLabel,
    item.correctRateLabel,
  ]),
  [
    ['q-1', 'Question', '67%'],
    ['pair-1', 'Pair', '50%'],
  ]
);
assert.equal(
  buildAssignmentItemAnalysisCardView({
    ...resultAnalysis.perItem[0]!,
    correctRate: 120,
  }).correctRateProgressValue,
  100
);
assert.equal(
  buildAssignmentItemAnalysisCardView({
    ...resultAnalysis.perItem[0]!,
    correctRate: Number.NaN,
  }).correctRateProgressValue,
  0
);
assert.equal(
  buildAssignmentItemAnalysisCardView({
    ...resultAnalysis.perItem[0]!,
    correctRate: -20,
  }).correctRateProgressValue,
  0
);
assert.deepEqual(
  buildAssignmentItemPerformanceRowView({
    index: 0,
    item: resultAnalysis.perItem[0]!,
  }),
  {
    acceptedAnswersText: 'Paris, France',
    correctRateLabel: '67%',
    expectedAnswerText: 'Paris',
    explanationText: 'Paris is the capital of France.',
    itemNumberLabel: '1.',
    kindLabel: 'Question',
    prompt: 'Capital of France?',
    promptLabel: '1. Capital of France?',
    submittedLabel: '2/3',
  }
);
assert.deepEqual(
  buildAssignmentItemPerformanceRowView({
    index: -1,
    item: {
      ...resultAnalysis.perItem[1]!,
      acceptedAnswers: ['Cold'],
      expectedAnswer: '',
      explanation: '',
    },
  }),
  {
    acceptedAnswersText: '-',
    correctRateLabel: '50%',
    expectedAnswerText: 'Cold',
    explanationText: '-',
    itemNumberLabel: '1.',
    kindLabel: 'Pair',
    prompt: 'Match "Hot" with its pair.',
    promptLabel: '1. Match "Hot" with its pair.',
    submittedLabel: '1/2',
  }
);
assert.deepEqual(
  buildAssignmentItemPerformanceRowViews(resultAnalysis.perItem).map((row) => [
    row.id,
    row.itemNumberLabel,
    row.promptLabel,
    row.correctRateLabel,
  ]),
  [
    ['q-1', '1.', '1. Capital of France?', '67%'],
    ['pair-1', '2.', '2. Match "Hot" with its pair.', '50%'],
  ]
);
assert.equal(
  resultAnalysis.attempts[0]?.answers[0]?.explanation,
  'Paris is the capital of France.'
);
assert.deepEqual(
  buildAssignmentAttemptAnswerReviewView({
    answer: resultAnalysis.attempts[0]!.answers[0]!,
    index: 0,
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersLineText: 'Accepted answers: Paris, France',
    acceptedAnswersText: 'Paris, France',
    expectedAnswerLabel: 'Expected',
    expectedAnswerLineText: 'Expected: Paris',
    expectedAnswerText: 'Paris',
    explanationText: 'Paris is the capital of France.',
    promptLabel: '1. Capital of France?',
    statusLabel: 'Correct',
    statusTone: 'correct',
    studentAnswerLabel: 'Student',
    studentAnswerLineText: 'Student: paris france',
    studentAnswerText: 'paris france',
  }
);
assert.equal(
  isAssignmentAttemptAnswerNeedsReview({ correct: false, submitted: true }),
  true
);
assert.equal(
  isAssignmentAttemptAnswerNeedsReview({ correct: false, submitted: false }),
  false
);
assert.equal(
  isAssignmentAttemptAnswerNeedsReview({ correct: true, submitted: true }),
  false
);
assert.deepEqual(
  buildAssignmentAttemptAnswerReviewView({
    answer: {
      ...resultAnalysis.attempts[0]!.answers[1]!,
      acceptedAnswers: ['Cold'],
      answer: '',
      expectedAnswer: '',
      explanation: '',
      submitted: false,
    },
    index: -3,
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersLineText: null,
    acceptedAnswersText: null,
    expectedAnswerLabel: 'Expected',
    expectedAnswerLineText: 'Expected: Cold',
    expectedAnswerText: 'Cold',
    explanationText: null,
    promptLabel: '1. Match "Hot" with its pair.',
    statusLabel: 'Unanswered',
    statusTone: 'idle',
    studentAnswerLabel: 'Student',
    studentAnswerLineText: 'Student: Unanswered',
    studentAnswerText: 'Unanswered',
  }
);
assert.deepEqual(
  buildAssignmentAttemptAnswerReviewViews(
    resultAnalysis.attempts[0]!.answers
  ).map((answerView) => [
    answerView.id,
    answerView.promptLabel,
    answerView.statusLabel,
  ]),
  [
    ['q-1', '1. Capital of France?', 'Correct'],
    ['pair-1', '2. Match "Hot" with its pair.', 'Review'],
  ]
);
assert.equal(resultAnalysis.attempts[0]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[1]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[2]?.studentKey, 'anonymous:1');
assert.equal(resultAnalysis.attempts[2]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.studentKey, 'anonymous:1');
assert.equal(resultAnalysis.students[0]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.latestAccuracy, 0);
assert.equal(resultAnalysis.students[1]?.studentKey, 'name:alice');
assert.equal(resultAnalysis.students[1]?.attempts, 2);
assert.equal(resultAnalysis.students[1]?.averageAccuracy, 75);
assert.equal(resultAnalysis.students[1]?.bestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.latestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.needsReviewCount, 0);
assert.equal(JSON.stringify(resultAnalysis).includes('browser-token-1'), false);
assert.deepEqual(
  buildAssignmentStudentSummaryRowView(resultAnalysis.students[1]!),
  {
    attemptsLabel: '2',
    averageAccuracyLabel: '75%',
    bestAccuracyLabel: '100%',
    lastSubmittedLabel: formatAssignmentResultDate(
      resultAnalysis.students[1]!.lastCompletedAt
    ),
    latestAccuracyLabel: '100%',
    needsReviewLabel: '0',
    studentLabel: 'Alice',
  }
);
assert.deepEqual(
  buildAssignmentStudentSummaryRowView({
    attempts: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    lastCompletedAt: null,
    latestAccuracy: 0,
    needsReviewCount: 0,
    studentKey: 'anonymous:empty',
    studentLabel: ' Ａｎｏｎｙｍｏｕｓ\u00A0　student 2 ',
  }),
  {
    attemptsLabel: '0',
    averageAccuracyLabel: '0%',
    bestAccuracyLabel: '0%',
    lastSubmittedLabel: '-',
    latestAccuracyLabel: '0%',
    needsReviewLabel: '0',
    studentLabel: 'Anonymous student 2',
  }
);
assert.deepEqual(
  buildAssignmentStudentSummaryRowViews([
    resultAnalysis.students[1]!,
    {
      attempts: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      lastCompletedAt: null,
      latestAccuracy: 0,
      needsReviewCount: 0,
      studentKey: 'anonymous:empty',
      studentLabel: 'Anonymous student 2',
    },
  ]).map((row) => [row.id, row.studentLabel, row.attemptsLabel]),
  [
    ['name:alice', 'Alice', '2'],
    ['anonymous:empty', 'Anonymous student 2', '0'],
  ]
);
const runtimeOrderedResultAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-04T10:00:00.000Z'),
      id: 'attempt-missing-answer',
      resultJson: {
        accuracy: 50,
        completedItemCount: 1,
        correctItemCount: 1,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
      studentName: 'Casey',
    },
  ],
  runtimeItems: resultRuntimeItems.slice().reverse(),
});
assert.deepEqual(
  runtimeOrderedResultAnalysis.attempts[0]?.answers.map((answer) => ({
    answer: answer.answer,
    correct: answer.correct,
    itemId: answer.itemId,
    prompt: answer.prompt,
    submitted: answer.submitted,
  })),
  [
    {
      answer: '',
      correct: false,
      itemId: 'pair-1',
      prompt: 'Match "Hot" with its pair.',
      submitted: false,
    },
    {
      answer: 'Paris',
      correct: true,
      itemId: 'q-1',
      prompt: 'Capital of France?',
      submitted: true,
    },
  ]
);
assert.deepEqual(
  runtimeOrderedResultAnalysis.perItem.map((item) => ({
    correctCount: item.correctCount,
    correctRate: item.correctRate,
    itemId: item.itemId,
    submittedCount: item.submittedCount,
  })),
  [
    {
      correctCount: 0,
      correctRate: 0,
      itemId: 'pair-1',
      submittedCount: 0,
    },
    {
      correctCount: 1,
      correctRate: 100,
      itemId: 'q-1',
      submittedCount: 1,
    },
  ]
);
assert.deepEqual(
  runtimeOrderedResultAnalysis.needsReview.map((item) => item.itemId),
  ['q-1']
);
const sanitizedResultAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [{ answer: 'Rome', correct: false, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-04T10:00:00.000Z'),
      id: 'attempt-invalid-score',
      resultJson: {
        accuracy: Number.NaN,
        completedItemCount: 1,
        correctItemCount: 0,
        earnedPoints: Number.NaN,
        totalPoints: 2,
      },
      score: Number.NaN,
      studentName: 'Beta',
    },
    {
      anonymousToken: null,
      answersJson: {
        answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-05T10:00:00.000Z'),
      id: 'attempt-earned-points-fallback',
      resultJson: {
        accuracy: Number.POSITIVE_INFINITY,
        completedItemCount: 1,
        correctItemCount: 1,
        earnedPoints: 4,
        totalPoints: 4,
      },
      score: null,
      studentName: ' beta ',
    },
  ],
  runtimeItems: resultRuntimeItems,
});
assert.deepEqual(
  sanitizedResultAnalysis.attempts.map((attempt) => ({
    accuracy: attempt.accuracy,
    score: attempt.score,
  })),
  [
    { accuracy: 0, score: 0 },
    { accuracy: 0, score: 4 },
  ]
);
assert.equal(sanitizedResultAnalysis.students[0]?.averageAccuracy, 0);
assert.equal(sanitizedResultAnalysis.students[0]?.bestAccuracy, 0);
assert.equal(sanitizedResultAnalysis.students[0]?.latestAccuracy, 0);
const normalizedResultDisplayAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          {
            answer: '  Ｐａｒｉｓ\tFrance  ',
            correct: true,
            itemId: ' ｍｅｓｓｙ－ｑ ',
          },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-06T10:00:00.000Z'),
      id: 'messy-result-attempt-1',
      resultJson: {
        accuracy: 150,
        completedItemCount: 1,
        correctItemCount: 1,
        earnedPoints: 2.9,
        totalPoints: 1,
      },
      score: -3.4,
      studentName: ' Messy Student ',
    },
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          {
            answer: '  ',
            correct: false,
            itemId: 'messy-q',
          },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-07T10:00:00.000Z'),
      id: 'messy-result-attempt-2',
      resultJson: {
        accuracy: -20,
        completedItemCount: 0,
        correctItemCount: 0,
        earnedPoints: Number.POSITIVE_INFINITY,
        totalPoints: 1,
      },
      score: null,
      studentName: 'messy student',
    },
  ],
  runtimeItems: [
    {
      answer: ' Paris / Ｐａｒｉｓ / Paris, France ',
      explanation: '  France\tcapital.  ',
      id: 'messy-q',
      kind: 'question',
      prompt: '  Capital   of   France?  ',
    },
  ],
});
assert.deepEqual(normalizedResultDisplayAnalysis.perItem, [
  {
    acceptedAnswers: ['Paris', 'Paris, France'],
    correctCount: 1,
    correctRate: 100,
    expectedAnswer: 'Paris / Paris / Paris, France',
    explanation: 'France capital.',
    itemId: 'messy-q',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Capital of France?',
    submittedCount: 1,
  },
]);
assert.deepEqual(
  normalizedResultDisplayAnalysis.attempts.map((attempt) => ({
    accuracy: attempt.accuracy,
    answer: attempt.answers[0]?.answer,
    expectedAnswer: attempt.answers[0]?.expectedAnswer,
    explanation: attempt.answers[0]?.explanation,
    score: attempt.score,
    submitted: attempt.answers[0]?.submitted,
  })),
  [
    {
      accuracy: 100,
      answer: 'Paris France',
      expectedAnswer: 'Paris / Paris / Paris, France',
      explanation: 'France capital.',
      score: 0,
      submitted: true,
    },
    {
      accuracy: 0,
      answer: '',
      expectedAnswer: 'Paris / Paris / Paris, France',
      explanation: 'France capital.',
      score: 0,
      submitted: false,
    },
  ]
);
assert.deepEqual(normalizedResultDisplayAnalysis.students, [
  {
    attempts: 2,
    averageAccuracy: 50,
    bestAccuracy: 100,
    lastCompletedAt: new Date('2026-01-07T10:00:00.000Z'),
    latestAccuracy: 0,
    needsReviewCount: 0,
    studentKey: 'name:messy student',
    studentLabel: 'Messy Student',
  },
]);
assert.equal(resultAnalysis.needsReview[0]?.itemId, 'pair-1');
assert.equal(resultAnalysis.needsReview[0]?.correctRate, 50);
assert.equal(
  normalizeResultSearch('  Anonymous   Student 1  '),
  'anonymous student 1'
);
assert.equal(normalizeResultSearch('  Ａｖａ   Ｃｈｅｎ  '), 'ava chen');
assert.equal(matchesResultSearch('Anonymous student 1', 'student 1'), true);
assert.equal(matchesResultSearch('Ava Chen', '  ａｖａ '), true);
assert.equal(matchesResultSearch(null, 'student 1'), false);
assert.equal(
  buildResultSearchSummary({
    matchedAttempts: 3,
    matchedStudents: 2,
    search: '',
  }),
  'All students'
);
assert.equal(
  buildResultSearchSummary({
    matchedAttempts: 1,
    matchedStudents: 1,
    search: 'alice',
  }),
  '1 student · 1 attempt'
);
assert.equal(
  buildResultSearchSummary({
    matchedAttempts: 2,
    matchedStudents: 1,
    search: ' alice ',
  }),
  '1 student · 2 attempts'
);
assert.equal(
  buildAttemptReviewSubmissionSummary({
    shownAttempts: 1,
    totalAttempts: 1,
  }),
  'Showing 1 of 1 submission.'
);
assert.equal(
  buildAttemptReviewSubmissionSummary({
    shownAttempts: 2,
    totalAttempts: 3,
  }),
  'Showing 2 of 3 submissions.'
);
assert.equal(DEFAULT_STUDENT_SUMMARY_SORT, 'needs-review');
assert.equal(DEFAULT_ITEM_PERFORMANCE_SORT, 'original');
assert.equal(DEFAULT_ATTEMPT_REVIEW_FILTER, 'all');
assert.deepEqual(STUDENT_SUMMARY_SORT_VALUES, [
  'needs-review',
  'best',
  'name',
  'attempts',
]);
assert.deepEqual(ITEM_PERFORMANCE_SORT_VALUES, [
  'original',
  'accuracy',
  'submitted',
  'type',
]);
assert.deepEqual(ATTEMPT_REVIEW_FILTER_VALUES, ['all', 'needs-review']);
assert.deepEqual(
  studentSummarySortOptions.map((option) => option.value),
  ['needs-review', 'best', 'name', 'attempts']
);
assert.deepEqual(
  studentSummarySortOptions.map((option) => [option.value, option.label]),
  [
    ['needs-review', 'Needs review'],
    ['best', 'Best score'],
    ['name', 'Student name'],
    ['attempts', 'Attempts'],
  ]
);
assert.deepEqual(
  itemPerformanceSortOptions.map((option) => option.value),
  ['original', 'accuracy', 'submitted', 'type']
);
assert.deepEqual(
  itemPerformanceSortOptions.map((option) => [option.value, option.label]),
  [
    ['original', 'Snapshot order'],
    ['accuracy', 'Lowest accuracy'],
    ['submitted', 'Most answered'],
    ['type', 'Item type'],
  ]
);
assert.deepEqual(
  attemptReviewFilterOptions.map((option) => option.value),
  ['all', 'needs-review']
);
assert.deepEqual(
  attemptReviewFilterOptions.map((option) => [option.value, option.label]),
  [
    ['all', 'All answers'],
    ['needs-review', 'Needs review only'],
  ]
);
assert.equal(
  assignmentResultPageCopy.description,
  'Review student attempts, scores, and assignment-level result metrics.'
);
assert.deepEqual(Object.values(assignmentResultSearchCopy), [
  'Clear student search',
  'Find student',
  'Search by student name',
  'Review view',
  'Sort items',
  'Sort students',
]);
assert.deepEqual(
  Object.values(assignmentResultSectionCopy).map((section) => section.title),
  [
    'Answer review',
    'Classroom brief',
    'Class review focus',
    'Item performance',
    'Reteach priorities',
    'Student attempts',
    'Student follow-up',
    'Student summary',
  ]
);
assert.deepEqual(
  buildAssignmentResultMetricItems({
    averageDurationSeconds: 150,
    averagePoints: 7,
    averageScore: 82.6,
    completions: 12,
    expiresAt: '2026-06-30T12:00:00.000Z',
  }),
  [
    { key: 'completions', label: 'Completions', value: '12' },
    { key: 'average-accuracy', label: 'Average accuracy', value: '83%' },
    { key: 'average-points', label: 'Average points', value: '7' },
    { key: 'average-time', label: 'Average time', value: '2m 30s' },
    {
      key: 'closes',
      label: 'Closes',
      value: formatAssignmentExpiry('2026-06-30T12:00:00.000Z'),
    },
  ]
);
assert.deepEqual(
  buildAssignmentResultMetricItems({
    averageDurationSeconds: Number.NaN,
    averagePoints: Number.NaN,
    averageScore: Number.NaN,
    completions: Number.POSITIVE_INFINITY,
    expiresAt: 'not-a-date',
  }),
  [
    { key: 'completions', label: 'Completions', value: '-' },
    { key: 'average-accuracy', label: 'Average accuracy', value: '-' },
    { key: 'average-points', label: 'Average points', value: '-' },
    { key: 'average-time', label: 'Average time', value: '-' },
    {
      key: 'closes',
      label: 'Closes',
      value: formatAssignmentExpiry('not-a-date'),
    },
  ]
);
assert.deepEqual(
  buildAssignmentResultMetricItems({
    averageDurationSeconds: 0,
    averagePoints: 0,
    averageScore: 0,
    completions: 0,
    expiresAt: null,
  }),
  [
    { key: 'completions', label: 'Completions', value: '0' },
    { key: 'average-accuracy', label: 'Average accuracy', value: '-' },
    { key: 'average-points', label: 'Average points', value: '-' },
    { key: 'average-time', label: 'Average time', value: '-' },
    {
      key: 'closes',
      label: 'Closes',
      value: formatAssignmentExpiry(null),
    },
  ]
);
assert.deepEqual(
  buildAssignmentResultHeaderView({
    activity: {
      description: 'Current activity description',
      templateType: 'quiz',
      title: 'Current activity title',
    },
    assignment: {
      expiresAt: new Date('2026-07-01T00:00:00.000Z'),
      shareSlug: '　share １２３　',
      status: 'published',
      title: ' Ｗｅｅｋ\u00A0　1   results ',
    },
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    snapshot: {
      activityDescription: ' Ｓｎａｐｓｈｏｔ\u00A0　description ',
      activityTitle: ' Ｓｎａｐｓｈｏｔ\u00A0　title ',
      templateType: 'line-match',
    },
  }),
  {
    activityDescription: 'Snapshot description',
    activityTitle: 'Snapshot title',
    assignmentSharePath: '/play/share%20123',
    assignmentTitle: 'Week 1 results',
    printAction: {
      label: 'Print worksheet',
    },
    shareAction: {
      disabledReason: undefined,
      isAvailable: true,
      label: 'Open student link',
      sharePath: '/play/share%20123',
      shareSlug: 'share 123',
    },
    shareSlug: 'share 123',
    statusLabel: 'Open',
    templateLabel: 'Line match',
    templateType: 'line-match',
  }
);
assert.deepEqual(
  buildAssignmentResultHeaderView({
    activity: {
      description: null,
      templateType: 'quiz',
      title: 'Current activity title',
    },
    assignment: {
      expiresAt: new Date('2026-05-01T00:00:00.000Z'),
      shareSlug: 'closed-share',
      status: 'published',
      title: 'Expired results',
    },
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    snapshot: null,
  }),
  {
    activityDescription: '',
    activityTitle: 'Current activity title',
    assignmentSharePath: '/play/closed-share',
    assignmentTitle: 'Expired results',
    printAction: {
      label: 'Print worksheet',
    },
    shareAction: {
      disabledReason:
        'This assignment link has expired. Students cannot open it from the results page.',
      isAvailable: false,
      label: 'Student link unavailable',
      sharePath: '/play/closed-share',
      shareSlug: 'closed-share',
    },
    shareSlug: 'closed-share',
    statusLabel: 'Expired',
    templateLabel: 'Quiz',
    templateType: 'quiz',
  }
);
assert.deepEqual(
  buildAssignmentResultHeaderShareAction({
    expiresAt: null,
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    shareSlug: '　share ｔｗｏ　',
    status: 'published',
  }),
  {
    disabledReason: undefined,
    isAvailable: true,
    label: 'Open student link',
    sharePath: '/play/share%20two',
    shareSlug: 'share two',
  }
);
assert.deepEqual(
  buildAssignmentResultHeaderShareAction({
    expiresAt: null,
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    shareSlug: 'closed-share',
    status: 'closed',
  }),
  {
    disabledReason:
      'This assignment is closed. Reopen it before sharing the student link.',
    isAvailable: false,
    label: 'Student link unavailable',
    sharePath: '/play/closed-share',
    shareSlug: 'closed-share',
  }
);
assert.deepEqual(
  buildAssignmentResultHeaderShareAction({
    expiresAt: null,
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    shareSlug: 'draft-share',
    status: 'draft',
  }),
  {
    disabledReason: 'Publish this assignment before sharing a student link.',
    isAvailable: false,
    label: 'Student link unavailable',
    sharePath: '/play/draft-share',
    shareSlug: 'draft-share',
  }
);
assert.deepEqual(
  buildAssignmentResultHeaderShareAction({
    expiresAt: new Date('2026-05-01T00:00:00.000Z'),
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    shareSlug: 'expired-share',
    status: 'published',
  }),
  {
    disabledReason:
      'This assignment link has expired. Students cannot open it from the results page.',
    isAvailable: false,
    label: 'Student link unavailable',
    sharePath: '/play/expired-share',
    shareSlug: 'expired-share',
  }
);
assert.equal(
  assignmentResultPageCopy.studentLinkClosedMessage,
  'This assignment is closed. Reopen it before sharing the student link.'
);
assert.equal(
  assignmentResultPageCopy.studentLinkDraftMessage,
  'Publish this assignment before sharing a student link.'
);
assert.equal(
  assignmentResultPageCopy.studentLinkExpiredMessage,
  'This assignment link has expired. Students cannot open it from the results page.'
);
assert.deepEqual(assignmentResultTableHeaders.studentAttempts, [
  'Student',
  'Score',
  'Accuracy',
  'Answered',
  'Time',
  'Submitted',
]);
assert.deepEqual(assignmentResultTableHeaders.studentSummary, [
  'Student',
  'Attempts',
  'Latest',
  'Average',
  'Best',
  'Needs review',
  'Last submitted',
]);
assert.deepEqual(assignmentResultTableHeaders.itemPerformance, [
  'Item',
  'Type',
  'Correct rate',
  'Submitted',
  'Expected',
  'Accepted',
  'Explanation',
]);
assert.equal(assignmentResultReviewCopy.emptyValue, '-');
const attemptRowCompletedAt = new Date('2026-01-01T00:00:00.000Z');
assert.deepEqual(
  buildAssignmentAttemptRowDisplay({
    attempt: {
      completedAt: attemptRowCompletedAt,
      id: 'attempt-row',
      maxScore: 4,
      resultJson: {
        accuracy: 75,
        completedItemCount: 3,
        durationSeconds: 62,
        totalPoints: 4,
      },
      score: 3,
      studentName: ' Raw student ',
    },
    review: {
      accuracy: 80,
      answers: [],
      completedAt: new Date('2026-01-01T00:00:00.000Z'),
      id: 'attempt-row',
      score: 3,
      studentKey: 'name:alice',
      studentLabel: 'Alice',
    },
  }),
  {
    accuracyLabel: '75%',
    answeredLabel: '3/4',
    durationLabel: '1m 02s',
    id: 'attempt-row',
    scoreLabel: '3/4',
    studentLabel: 'Alice',
    submittedAtLabel: formatAssignmentResultDate(attemptRowCompletedAt),
  }
);
assert.deepEqual(
  buildAssignmentAttemptRowDisplay({
    attempt: {
      completedAt: attemptRowCompletedAt,
      id: 'messy-review-label-row',
      maxScore: 4,
      resultJson: {
        accuracy: 75,
        completedItemCount: 3,
        durationSeconds: 62,
        totalPoints: 4,
      },
      score: 3,
      studentName: ' Raw student ',
    },
    review: {
      accuracy: 80,
      answers: [],
      completedAt: new Date('2026-01-01T00:00:00.000Z'),
      id: 'messy-review-label-row',
      score: 3,
      studentKey: 'name:ava',
      studentLabel: ' Ａｖａ\u00A0　Chen ',
    },
  }).studentLabel,
  'Ava Chen'
);
assert.deepEqual(
  buildAssignmentAttemptRowDisplay({
    attempt: {
      completedAt: attemptRowCompletedAt,
      id: 'timed-attempt-row',
      maxScore: 4,
      resultJson: {
        accuracy: 75,
        completedItemCount: 3,
        durationSeconds: 62,
        totalPoints: 4,
      },
      score: 3,
      studentName: ' Raw student ',
    },
    review: undefined,
    timeLimitSeconds: 60,
  }),
  {
    accuracyLabel: '75%',
    answeredLabel: '3/4',
    durationLabel: '1m 00s',
    id: 'timed-attempt-row',
    scoreLabel: '3/4',
    studentLabel: 'Raw student',
    submittedAtLabel: formatAssignmentResultDate(attemptRowCompletedAt),
  }
);
assert.deepEqual(
  buildAssignmentAttemptRowDisplay({
    attempt: {
      completedAt: new Date('2026-01-03T10:00:00.000Z'),
      id: 'attempt-3',
      maxScore: 2,
      resultJson: {
        accuracy: 0,
        completedItemCount: 1,
        durationSeconds: 40,
        totalPoints: 2,
      },
      score: 0,
      studentName: null,
    },
    review: resultAnalysis.attempts[2],
  }),
  {
    accuracyLabel: '0%',
    answeredLabel: '1/2',
    durationLabel: '40s',
    id: 'attempt-3',
    scoreLabel: '0/2',
    studentLabel: 'Anonymous student 1',
    submittedAtLabel: formatAssignmentResultDate(
      new Date('2026-01-03T10:00:00.000Z')
    ),
  }
);
assert.deepEqual(
  buildAssignmentAttemptRowDisplay({
    attempt: {
      completedAt: null,
      id: 'anonymous-row',
      maxScore: null,
      resultJson: null,
      score: null,
      studentName: '   ',
    },
    review: undefined,
  }),
  {
    accuracyLabel: '0%',
    answeredLabel: '0/0',
    durationLabel: '-',
    id: 'anonymous-row',
    scoreLabel: '0/0',
    studentLabel: 'Anonymous student',
    submittedAtLabel: '-',
  }
);
assert.deepEqual(
  buildAssignmentAttemptRowDisplay({
    attempt: {
      completedAt: null,
      id: 'normalized-name-row',
      maxScore: null,
      resultJson: null,
      score: null,
      studentName: ' Ａｖａ   Ｃｈｅｎ ',
    },
    review: undefined,
  }),
  {
    accuracyLabel: '0%',
    answeredLabel: '0/0',
    durationLabel: '-',
    id: 'normalized-name-row',
    scoreLabel: '0/0',
    studentLabel: 'Ava Chen',
    submittedAtLabel: '-',
  }
);
assert.deepEqual(
  buildAssignmentAttemptRowViews({
    rows: [
      {
        attempt: {
          completedAt: attemptRowCompletedAt,
          id: 'row-view-1',
          maxScore: 4,
          resultJson: {
            accuracy: 75,
            completedItemCount: 3,
            durationSeconds: 62,
            totalPoints: 4,
          },
          score: 3,
          studentName: ' Raw student ',
        },
        review: undefined,
        studentLabel: ' Ｄｉｓｐｌａｙｅｄ   student ',
      },
    ],
    timeLimitSeconds: 60,
  }),
  [
    {
      accuracyLabel: '75%',
      answeredLabel: '3/4',
      durationLabel: '1m 00s',
      id: 'row-view-1',
      scoreLabel: '3/4',
      studentLabel: 'Displayed student',
      submittedAtLabel: formatAssignmentResultDate(attemptRowCompletedAt),
    },
  ]
);
assert.deepEqual(
  getAssignmentAnswerReviewStatus({ correct: true, submitted: true }),
  {
    exportLabel: 'correct',
    label: 'Correct',
    tone: 'correct',
  }
);
assert.deepEqual(
  getAssignmentAnswerReviewStatus({ correct: false, submitted: true }),
  {
    exportLabel: 'review',
    label: 'Review',
    tone: 'review',
  }
);
assert.deepEqual(
  getAssignmentAnswerReviewStatus({ correct: false, submitted: false }),
  {
    exportLabel: 'unanswered',
    label: 'Unanswered',
    tone: 'idle',
  }
);
assert.equal(
  formatAssignmentAttemptReviewBadge({ accuracy: 67, score: 2 }),
  '2 pts · 67%'
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    formatAssignmentAttemptReviewBadge({ accuracy: 67, score: 2 }),
    '2 分 · 67%'
  );
} finally {
  overwriteGetLocale(() => 'en');
}
assert.deepEqual(
  buildAssignmentAttemptReviewCardView({
    accuracy: 67,
    answers: [
      {
        acceptedAnswers: ['Paris'],
        answer: 'Paris',
        correct: true,
        expectedAnswer: 'Paris',
        itemId: 'q-1',
        prompt: 'Capital?',
        submitted: true,
      },
    ],
    completedAt: attemptRowCompletedAt,
    id: 'attempt-1',
    score: 2,
    studentLabel: 'Alice',
  }),
  {
    answerViews: [
      {
        acceptedAnswersLabel: 'Accepted answers',
        acceptedAnswersLineText: null,
        acceptedAnswersText: null,
        expectedAnswerLabel: 'Expected',
        expectedAnswerLineText: 'Expected: Paris',
        expectedAnswerText: 'Paris',
        explanationText: null,
        id: 'q-1',
        promptLabel: '1. Capital?',
        statusLabel: 'Correct',
        statusTone: 'correct',
        studentAnswerLabel: 'Student',
        studentAnswerLineText: 'Student: Paris',
        studentAnswerText: 'Paris',
      },
    ],
    badgeLabel: '2 pts · 67%',
    id: 'attempt-1',
    studentLabel: 'Alice',
    submittedAtLabel: formatAssignmentResultDate(attemptRowCompletedAt),
  }
);
assert.deepEqual(
  buildAssignmentAttemptReviewCardView({
    accuracy: 0,
    answers: [],
    completedAt: null,
    id: 'attempt-empty',
    score: 0,
    studentLabel: '   ',
  }),
  {
    answerViews: [],
    badgeLabel: '0 pts · 0%',
    id: 'attempt-empty',
    studentLabel: 'Anonymous student',
    submittedAtLabel: '-',
  }
);
assert.deepEqual(
  buildAssignmentAttemptReviewCardViews(resultAnalysis.attempts).map(
    (cardView) => [
      cardView.id,
      cardView.studentLabel,
      cardView.answerViews.length,
    ]
  ),
  [
    ['attempt-1', 'Alice', 2],
    ['attempt-2', 'Alice', 2],
    ['attempt-3', 'Anonymous student 1', 2],
  ]
);
assert.equal(
  formatAssignmentBriefStudentAccuracy({
    bestAccuracy: 100,
    latestAccuracy: 75,
  }),
  'Latest 75% · best 100%'
);
assert.equal(
  formatAssignmentItemCorrectSummary({
    correctCount: 2,
    submittedCount: 3,
  }),
  '2/3 correct'
);
assert.equal(
  formatAssignmentItemCorrectSummary({
    correctCount: 2.9,
    submittedCount: Number.POSITIVE_INFINITY,
  }),
  '2/0 correct'
);
assert.equal(formatAssignmentResultFraction(2, 5), '2/5');
assert.equal(formatAssignmentResultFraction(-1, 5), '0/5');
assert.equal(formatAssignmentResultFraction(2.5, 5), '2/5');
assert.equal(formatAssignmentResultFraction(Number.NaN, 5), '-');
assert.equal(formatAssignmentResultFraction(2, Number.POSITIVE_INFINITY), '-');
assert.equal(formatAssignmentResultItemNumberLabel(0), '1.');
assert.equal(formatAssignmentResultItemNumberLabel(-1), '1.');
assert.equal(formatAssignmentResultItemNumberLabel(2.9), '3.');
assert.equal(formatAssignmentResultStudentLabel(' Alice '), 'Alice');
assert.equal(
  formatAssignmentResultStudentLabel(' Ａｖａ\u00A0　Chen '),
  'Ava Chen'
);
assert.equal(formatAssignmentResultStudentLabel('   '), 'Anonymous student');
assert.equal(
  formatAssignmentResultPromptLabel({
    index: 1,
    prompt: 'Capital of France?',
  }),
  '2. Capital of France?'
);
assert.equal(
  formatAssignmentResultPromptLabel({
    index: 1,
    prompt: ' Ｃａｐｉｔａｌ\u00A0　of   France? ',
  }),
  '2. Capital of France?'
);
assert.equal(
  joinAssignmentResultSearchSummaryParts(['1 student', '2 attempts']),
  '1 student · 2 attempts'
);
overwriteGetLocale(() => 'zh');
try {
  assert.equal(
    formatAssignmentResultPromptLabel({
      index: 0,
      prompt: 'Capital of France?',
    }),
    '1. Capital of France?'
  );
  assert.equal(
    joinAssignmentResultSearchSummaryParts(['1 名学生', '2 次作答']),
    '1 名学生 · 2 次作答'
  );
  assert.equal(formatAssignmentResultStudentLabel('   '), '匿名学生');
} finally {
  overwriteGetLocale(() => 'en');
}
assert.equal(formatAssignmentResultNumber(2.5), '2');
assert.equal(formatAssignmentResultNumber(Number.NaN), '-');
assert.equal(formatAssignmentResultNumber(null), '-');
assert.equal(formatAssignmentResultNumber(-3, { min: 0 }), '0');
assert.equal(formatAssignmentResultPercent(82), '82%');
assert.equal(formatAssignmentResultPercent(82.6), '83%');
assert.equal(formatAssignmentResultPercent(Number.NaN), '-');
assert.equal(formatAssignmentResultValue(''), '-');
assert.equal(formatAssignmentResultValue('Paris'), 'Paris');
assert.equal(formatAssignmentReviewCount(1), '1 review');
assert.equal(formatAssignmentReviewCount(3), '3 reviews');
assert.equal(getAssignmentResultCompletedAttemptCount(2), 2);
assert.equal(getAssignmentResultCompletedAttemptCount(2.8), 2);
assert.equal(getAssignmentResultCompletedAttemptCount(-1), 0);
assert.equal(getAssignmentResultCompletedAttemptCount(Number.NaN), 0);
assert.equal(getAssignmentResultCompletedAttemptCount(null), 0);
assert.deepEqual(assignmentResultActionDescriptors, [
  {
    action: 'copy-brief',
    kind: 'copy-text',
  },
  {
    action: 'copy-reteach-plan',
    kind: 'copy-text',
  },
  {
    action: 'copy-item-review',
    kind: 'copy-text',
  },
  {
    action: 'copy-follow-up',
    kind: 'copy-text',
  },
  {
    action: 'export-csv',
    kind: 'download-csv',
  },
]);
assert.deepEqual(assignmentResultActionOrder, [
  'copy-brief',
  'copy-reteach-plan',
  'copy-item-review',
  'copy-follow-up',
  'export-csv',
]);
const emptyAssignmentResultActionState = buildAssignmentResultActionState({
  attemptCount: 0,
  itemCount: 0,
  studentCount: 0,
});
assert.deepEqual(emptyAssignmentResultActionState, {
  attemptCount: 0,
  classroomBriefReady: false,
  itemCount: 0,
  studentCount: 0,
});
assert.deepEqual(
  buildAssignmentResultActionButtons(emptyAssignmentResultActionState),
  [
    {
      action: 'copy-brief',
      disabled: true,
      failureMessage: 'Classroom brief could not be copied.',
      gate: {
        message: 'Submit at least one attempt before copying a brief.',
        type: 'blocked',
      },
      kind: 'copy-text',
      label: 'Copy brief',
      successMessage: 'Classroom brief copied.',
    },
    {
      action: 'copy-reteach-plan',
      disabled: true,
      failureMessage: 'Reteach plan could not be copied.',
      gate: {
        message: 'Submit at least one attempt before copying a reteach plan.',
        type: 'blocked',
      },
      kind: 'copy-text',
      label: 'Copy reteach plan',
      successMessage: 'Reteach plan copied.',
    },
    {
      action: 'copy-item-review',
      disabled: true,
      failureMessage: 'Item review could not be copied.',
      gate: {
        message: 'Add assignment items before copying item review.',
        type: 'blocked',
      },
      kind: 'copy-text',
      label: 'Copy item review',
      successMessage: 'Item review copied.',
    },
    {
      action: 'copy-follow-up',
      disabled: true,
      failureMessage: 'Student follow-up could not be copied.',
      gate: {
        message: 'Submit at least one attempt before copying follow-up.',
        type: 'blocked',
      },
      kind: 'copy-text',
      label: 'Copy follow-up',
      successMessage: 'Student follow-up copied.',
    },
    {
      action: 'export-csv',
      disabled: true,
      failureMessage: 'Results CSV could not be downloaded.',
      gate: {
        message: 'Submit at least one attempt before exporting results.',
        type: 'blocked',
      },
      kind: 'download-csv',
      label: 'Download CSV',
      successMessage: 'Results CSV downloaded.',
    },
  ]
);
const readyAssignmentResultActionState = buildAssignmentResultActionState({
  attemptCount: 2,
  classroomBriefReady: true,
  itemCount: 3,
  studentCount: 1,
});
assert.deepEqual(
  buildAssignmentResultActionButtons(readyAssignmentResultActionState),
  [
    {
      action: 'copy-brief',
      disabled: false,
      failureMessage: 'Classroom brief could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy brief',
      successMessage: 'Classroom brief copied.',
    },
    {
      action: 'copy-reteach-plan',
      disabled: false,
      failureMessage: 'Reteach plan could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy reteach plan',
      successMessage: 'Reteach plan copied.',
    },
    {
      action: 'copy-item-review',
      disabled: false,
      failureMessage: 'Item review could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy item review',
      successMessage: 'Item review copied.',
    },
    {
      action: 'copy-follow-up',
      disabled: false,
      failureMessage: 'Student follow-up could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy follow-up',
      successMessage: 'Student follow-up copied.',
    },
    {
      action: 'export-csv',
      disabled: false,
      failureMessage: 'Results CSV could not be downloaded.',
      gate: { type: 'ready' },
      kind: 'download-csv',
      label: 'Download CSV',
      successMessage: 'Results CSV downloaded.',
    },
  ]
);
assert.deepEqual(
  getAssignmentResultActionGateFromState({
    action: 'copy-brief',
    state: emptyAssignmentResultActionState,
  }),
  {
    message: 'Submit at least one attempt before copying a brief.',
    type: 'blocked',
  }
);
assert.deepEqual(
  getAssignmentResultActionGateFromState({
    action: 'export-csv',
    state: readyAssignmentResultActionState,
  }),
  { type: 'ready' }
);
assert.deepEqual(
  buildAssignmentResultSectionState({
    attemptCount: 0,
    attemptReviewCount: 0,
    classroomBriefReady: false,
    itemCount: 0,
    studentCount: 0,
  }),
  {
    showAnswerReview: false,
    showClassroomBrief: false,
    showItemPerformance: false,
    showReteachPriorities: false,
    showStudentSearch: false,
    showStudentSummary: false,
  }
);
assert.deepEqual(
  buildAssignmentResultSectionState({
    attemptCount: 1,
    attemptReviewCount: 0,
    classroomBriefReady: false,
    itemCount: 0,
    studentCount: 0,
  }),
  {
    showAnswerReview: false,
    showClassroomBrief: false,
    showItemPerformance: false,
    showReteachPriorities: false,
    showStudentSearch: true,
    showStudentSummary: false,
  }
);
assert.deepEqual(
  buildAssignmentResultSectionState({
    attemptCount: 2,
    attemptReviewCount: 2,
    classroomBriefReady: true,
    itemCount: 3,
    studentCount: 1,
  }),
  {
    showAnswerReview: true,
    showClassroomBrief: true,
    showItemPerformance: true,
    showReteachPriorities: true,
    showStudentSearch: true,
    showStudentSummary: true,
  }
);
assert.equal(parseStudentSummarySort('best'), 'best');
assert.equal(parseStudentSummarySort('needs-review'), undefined);
assert.equal(parseItemPerformanceSort('submitted'), 'submitted');
assert.equal(parseItemPerformanceSort('original'), undefined);
assert.equal(parseAttemptReviewFilter('needs-review'), 'needs-review');
assert.equal(parseAttemptReviewFilter('all'), undefined);
assert.equal(parseResultStudentSearch('  Ａｖａ   Ｃｈｅｎ  '), 'Ava Chen');
assert.equal(parseResultStudentSearch('   '), undefined);
assert.equal(parseResultStudentSearch(['Ava Chen']), undefined);
assert.equal(normalizeResultSearchQuery('  Mei   Lin  '), 'Mei Lin');
assert.deepEqual(
  buildAssignmentResultRouteSearch({
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'attempts',
    student: '  Ａｖａ   Ｃｈｅｎ  ',
  }),
  {
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'attempts',
    student: 'Ava Chen',
  }
);
assert.deepEqual(
  buildAssignmentResultRouteSearch({
    itemSort: 'original',
    review: 'all',
    sort: 'needs-review',
    student: '   ',
  }),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
    student: undefined,
  }
);
assert.deepEqual(
  buildAssignmentResultRouteSearch({
    itemSort: 'random',
    review: 'done',
    sort: ['best'],
    student: ['Ava'],
  }),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
    student: undefined,
  }
);
assert.deepEqual(resolveAssignmentResultViewState({}), {
  attemptReviewFilter: 'all',
  itemPerformanceSort: 'original',
  studentSearch: '',
  studentSort: 'needs-review',
});
assert.deepEqual(
  resolveAssignmentResultViewState({
    itemSort: 'type',
    review: 'needs-review',
    sort: 'name',
    student: 'Ava Chen',
  }),
  {
    attemptReviewFilter: 'needs-review',
    itemPerformanceSort: 'type',
    studentSearch: 'Ava Chen',
    studentSort: 'name',
  }
);
assert.deepEqual(
  resolveAssignmentResultViewState({
    itemSort: 'invalid',
    review: 'later',
    sort: 'fastest',
    student: '  Ava   Chen  ',
  } as never),
  {
    attemptReviewFilter: 'all',
    itemPerformanceSort: 'original',
    studentSearch: 'Ava Chen',
    studentSort: 'needs-review',
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {},
    next: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: '  Ava   Chen  ',
    },
  }),
  {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: 'best',
    student: 'Ava Chen',
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: 'Ava Chen',
    },
    next: {
      itemSort: 'original',
      review: 'all',
      sort: 'needs-review',
      student: '',
    },
  }),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
    student: undefined,
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {
      itemSort: 'submitted',
      review: 'needs-review',
      sort: 'attempts',
      student: 'Ava Chen',
    },
    next: {
      review: 'all',
    },
  }),
  {
    itemSort: 'submitted',
    review: undefined,
    sort: 'attempts',
    student: 'Ava Chen',
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {
      itemSort: 'submitted',
      review: 'needs-review',
      sort: 'attempts',
      student: 'Ava Chen',
    },
    next: {
      itemSort: 'later',
      review: 'wrong',
      sort: 'fastest',
    },
  } as never),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
    student: 'Ava Chen',
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      review: 'needs-review',
      sort: 'best',
      student: 'Mei Lin',
    },
    update: {
      control: 'item-performance-sort',
      value: 'type',
    },
  }),
  {
    itemSort: 'type',
    review: 'needs-review',
    sort: 'best',
    student: 'Mei Lin',
  }
);
assert.deepEqual(
  buildAssignmentResultControlRouteSearch({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'attempts',
      student: 'Ava Chen',
    },
    update: {
      control: 'student-search',
      value: '  Mei   Lin  ',
    },
  }),
  {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: 'attempts',
    student: 'Mei Lin',
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'attempts',
      student: 'Ava Chen',
    },
    update: {
      control: 'attempt-review-filter',
      value: 'all',
    },
  }),
  {
    itemSort: 'accuracy',
    review: undefined,
    sort: 'attempts',
    student: 'Ava Chen',
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      student: 'Ava Chen',
    },
    update: {
      control: 'student-sort',
      value: 'needs-review',
    },
  }),
  {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: undefined,
    student: 'Ava Chen',
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      student: 'Ava Chen',
    },
    update: {
      control: 'student-search',
      value: '  Mei   Lin  ',
    },
  }),
  {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: undefined,
    student: 'Mei Lin',
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      student: 'Ava Chen',
    },
    update: {
      control: 'student-search',
      value: '',
    },
  }),
  {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: undefined,
    student: undefined,
  }
);
assert.deepEqual(
  buildAssignmentResultEmptyState({
    search: '',
    surface: 'attempt-rows',
    totalAttempts: 0,
  }),
  {
    description:
      'Share the student link, then completed submissions will appear here.',
    title: 'No student attempts yet.',
  }
);
assert.deepEqual(
  buildAssignmentResultEmptyState({
    search: ' alice ',
    surface: 'student-summary',
    totalStudents: 2,
  }),
  {
    description:
      'Clear the search or try another student name from this assignment.',
    title: 'No matching students.',
  }
);
assert.deepEqual(
  buildAssignmentResultEmptyState({
    filter: 'needs-review',
    search: '',
    surface: 'attempt-review',
    totalAttemptReviews: 2,
  }),
  {
    description:
      'Every shown submission is currently correct for this assignment snapshot.',
    title: 'No answers need review.',
  }
);
assert.deepEqual(
  buildAssignmentResultEmptyState({
    filter: 'all',
    search: ' nobody ',
    surface: 'attempt-review',
    totalAttemptReviews: 2,
  }),
  {
    description:
      'Clear the search or try another student name from this assignment.',
    title: 'No matching answer reviews.',
  }
);
assert.equal(
  buildAssignmentResultEmptyState({
    search: '',
    surface: 'student-summary',
    totalStudents: 2,
  }),
  undefined
);
assert.deepEqual(
  sortStudentSummaries(resultAnalysis.students, 'attempts').map(
    (student) => student.studentLabel
  ),
  ['Alice', 'Anonymous student 1']
);
assert.equal(
  compareAssignmentStudentsByDisplayLabel(
    { studentLabel: ' Ｂｅｔａ ' },
    { studentLabel: 'alpha' }
  ) > 0,
  true
);
assert.deepEqual(
  sortStudentSummaries(
    [
      {
        ...resultAnalysis.students[0]!,
        attempts: 2,
        studentLabel: ' Ｂｅｔａ ',
      },
      {
        ...resultAnalysis.students[1]!,
        attempts: 2,
        studentLabel: 'alpha',
      },
    ],
    'attempts'
  ).map((student) => student.studentLabel),
  ['alpha', ' Ｂｅｔａ ']
);
assert.deepEqual(
  sortStudentSummaries(
    [
      {
        ...resultAnalysis.students[0]!,
        studentLabel: ' Ｂｅｔａ ',
      },
      {
        ...resultAnalysis.students[1]!,
        studentLabel: 'alpha',
      },
    ],
    'name'
  ).map((student) => student.studentLabel),
  ['alpha', ' Ｂｅｔａ ']
);
assert.deepEqual(
  filterAndSortStudentSummaries({
    search: ' ａｎｏｎｙｍｏｕｓ ',
    sort: 'needs-review',
    students: resultAnalysis.students,
  }).map((student) => student.studentLabel),
  ['Anonymous student 1']
);
const assignmentResultViewModel = buildAssignmentResultViewModel({
  attemptReviewFilter: 'needs-review',
  attempts: [
    {
      completedAt: new Date('2026-01-03T10:00:00.000Z'),
      id: 'attempt-1',
      maxScore: 2,
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        durationSeconds: 30,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
      studentName: ' Alice ',
    },
    {
      completedAt: new Date('2026-01-04T10:00:00.000Z'),
      id: 'attempt-2',
      maxScore: 2,
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        durationSeconds: 28,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
      studentName: 'Alice',
    },
    {
      completedAt: new Date('2026-01-05T10:00:00.000Z'),
      id: 'attempt-3',
      maxScore: 2,
      resultJson: {
        accuracy: 0,
        completedItemCount: 1,
        durationSeconds: 40,
        earnedPoints: 0,
        totalPoints: 2,
      },
      score: 0,
      studentName: null,
    },
  ],
  itemPerformanceSort: 'accuracy',
  items: resultAnalysis.perItem,
  reviews: resultAnalysis.attempts,
  search: ' ａｎｏｎｙｍｏｕｓ ',
  studentSort: 'needs-review',
  students: resultAnalysis.students,
});
assert.deepEqual(
  assignmentResultViewModel.filteredStudents.map(
    (student) => student.studentLabel
  ),
  ['Anonymous student 1']
);
assert.deepEqual(
  assignmentResultViewModel.filteredAttemptRows.map((row) => row.attempt.id),
  ['attempt-3']
);
assert.deepEqual(
  assignmentResultViewModel.filteredAttemptReviews.map((attempt) => attempt.id),
  ['attempt-3']
);
assert.deepEqual(
  assignmentResultViewModel.sortedPerformanceItems.map((item) => item.itemId),
  ['pair-1', 'q-1']
);
assert.equal(
  assignmentResultViewModel.resultSearchSummary,
  '1 student · 1 attempt'
);
assert.equal(
  assignmentResultViewModel.attemptReviewSubmissionSummary,
  'Showing 1 of 3 submissions.'
);
assert.deepEqual(assignmentResultViewModel.emptyStates, {
  attemptReview: {
    description:
      'Clear the search or try another student name from this assignment.',
    title: 'No matching answer reviews.',
  },
  attemptRows: {
    description:
      'Clear the search or try another student name from this assignment.',
    title: 'No matching attempts.',
  },
  studentSummary: {
    description:
      'Clear the search or try another student name from this assignment.',
    title: 'No matching students.',
  },
});
assert.deepEqual(
  getAssignmentResultActionGate({
    action: 'export-csv',
    attemptCount: 0,
    itemCount: 2,
    studentCount: 1,
  }),
  {
    message: 'Submit at least one attempt before exporting results.',
    type: 'blocked',
  }
);
assert.deepEqual(
  getAssignmentResultActionGate({
    action: 'copy-reteach-plan',
    attemptCount: 0,
    itemCount: 2,
    studentCount: 1,
  }),
  {
    message: 'Submit at least one attempt before copying a reteach plan.',
    type: 'blocked',
  }
);
assert.deepEqual(
  getAssignmentResultActionGate({
    action: 'copy-brief',
    attemptCount: 1,
    classroomBriefReady: false,
    itemCount: 2,
    studentCount: 1,
  }),
  {
    message: 'Submit at least one attempt before copying a brief.',
    type: 'blocked',
  }
);
assert.deepEqual(
  getAssignmentResultActionGate({
    action: 'copy-item-review',
    attemptCount: 0,
    itemCount: 0,
    studentCount: 0,
  }),
  {
    message: 'Add assignment items before copying item review.',
    type: 'blocked',
  }
);
assert.deepEqual(
  getAssignmentResultActionGate({
    action: 'copy-follow-up',
    attemptCount: 1,
    itemCount: 2,
    studentCount: 0,
  }),
  {
    message: 'Submit at least one attempt before copying follow-up.',
    type: 'blocked',
  }
);
assert.deepEqual(
  getAssignmentResultActionGate({
    action: 'copy-brief',
    attemptCount: 1,
    classroomBriefReady: true,
    itemCount: 2,
    studentCount: 1,
  }),
  { type: 'ready' }
);
assert.deepEqual(getAssignmentResultActionCopy('copy-brief'), {
  failureMessage: 'Classroom brief could not be copied.',
  label: 'Copy brief',
  successMessage: 'Classroom brief copied.',
});
assert.deepEqual(getAssignmentResultActionCopy('copy-follow-up'), {
  failureMessage: 'Student follow-up could not be copied.',
  label: 'Copy follow-up',
  successMessage: 'Student follow-up copied.',
});
assert.deepEqual(getAssignmentResultActionCopy('copy-item-review'), {
  failureMessage: 'Item review could not be copied.',
  label: 'Copy item review',
  successMessage: 'Item review copied.',
});
assert.deepEqual(getAssignmentResultActionCopy('copy-reteach-plan'), {
  failureMessage: 'Reteach plan could not be copied.',
  label: 'Copy reteach plan',
  successMessage: 'Reteach plan copied.',
});
assert.deepEqual(getAssignmentResultActionCopy('export-csv'), {
  failureMessage: 'Results CSV could not be downloaded.',
  label: 'Download CSV',
  successMessage: 'Results CSV downloaded.',
});
const followUpPriorityStudents = [
  {
    attempts: 1,
    averageAccuracy: 0,
    bestAccuracy: 0,
    lastCompletedAt: new Date('2026-01-03T10:00:00.000Z'),
    latestAccuracy: 0,
    needsReviewCount: 0,
    studentKey: 'name:no-review',
    studentLabel: 'No review',
  },
  {
    attempts: 1,
    averageAccuracy: 70,
    bestAccuracy: 70,
    lastCompletedAt: new Date('2026-01-02T10:00:00.000Z'),
    latestAccuracy: 70,
    needsReviewCount: 3,
    studentKey: 'name:more-review',
    studentLabel: 'More review',
  },
  {
    attempts: 1,
    averageAccuracy: 10,
    bestAccuracy: 10,
    lastCompletedAt: new Date('2026-01-01T10:00:00.000Z'),
    latestAccuracy: 10,
    needsReviewCount: 1,
    studentKey: 'name:lower-score',
    studentLabel: 'Lower score',
  },
  {
    attempts: 1,
    averageAccuracy: 70,
    bestAccuracy: 70,
    lastCompletedAt: new Date('2026-01-04T10:00:00.000Z'),
    latestAccuracy: 70,
    needsReviewCount: 3,
    studentKey: 'name:alpha-review',
    studentLabel: 'Alpha review',
  },
] satisfies typeof resultAnalysis.students;
assert.deepEqual(
  sortAssignmentStudentsByFollowUpPriority(followUpPriorityStudents).map(
    (student) => student.studentLabel
  ),
  ['Alpha review', 'More review', 'Lower score', 'No review']
);
assert.deepEqual(
  sortAssignmentStudentsByFollowUpPriority([
    {
      ...followUpPriorityStudents[0]!,
      latestAccuracy: 70,
      needsReviewCount: 3,
      studentLabel: ' Ｂｅｔａ review ',
    },
    {
      ...followUpPriorityStudents[1]!,
      latestAccuracy: 70,
      needsReviewCount: 3,
      studentLabel: 'alpha review',
    },
  ]).map((student) => student.studentLabel),
  ['alpha review', ' Ｂｅｔａ review ']
);
assert.deepEqual(
  getAssignmentStudentFollowUpPriorityStudents(followUpPriorityStudents, {
    limit: 2,
  }).map((student) => student.studentLabel),
  ['Alpha review', 'More review']
);
const abnormalFollowUpPriorityStudents = [
  {
    ...followUpPriorityStudents[0]!,
    latestAccuracy: Number.NaN,
    needsReviewCount: 2.9,
    studentLabel: 'Fractional review',
  },
  {
    ...followUpPriorityStudents[1]!,
    latestAccuracy: 10,
    needsReviewCount: Number.POSITIVE_INFINITY,
    studentLabel: 'Non-finite review',
  },
  {
    ...followUpPriorityStudents[2]!,
    latestAccuracy: 0,
    needsReviewCount: -1,
    studentLabel: 'Negative review',
  },
  {
    ...followUpPriorityStudents[3]!,
    latestAccuracy: 5,
    needsReviewCount: 2,
    studentLabel: 'Lower finite score',
  },
] satisfies typeof resultAnalysis.students;
assert.deepEqual(
  sortAssignmentStudentsByFollowUpPriority(
    abnormalFollowUpPriorityStudents
  ).map((student) => student.studentLabel),
  [
    'Fractional review',
    'Lower finite score',
    'Negative review',
    'Non-finite review',
  ]
);
assert.deepEqual(
  getAssignmentStudentFollowUpPriorityStudents(
    abnormalFollowUpPriorityStudents,
    {
      limit: 1.9,
    }
  ).map((student) => student.studentLabel),
  ['Fractional review']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'accuracy').map(
    (item) => item.itemId
  ),
  ['pair-1', 'q-1']
);
const reviewPriorityItems = [
  {
    acceptedAnswers: ['Seed'],
    correctCount: 0,
    correctRate: 0,
    expectedAnswer: 'Seed',
    itemId: 'unsubmitted',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Unsubmitted item',
    submittedCount: 0,
  },
  {
    acceptedAnswers: ['A'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'A',
    itemId: 'tie-more-submitted',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Tie with more submissions',
    submittedCount: 6,
  },
  {
    acceptedAnswers: ['B'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'B',
    itemId: 'tie-fewer-submitted',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Tie with fewer submissions',
    submittedCount: 2,
  },
  {
    acceptedAnswers: ['C'],
    correctCount: 3,
    correctRate: 75,
    expectedAnswer: 'C',
    itemId: 'higher-accuracy',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Higher accuracy',
    submittedCount: 4,
  },
] satisfies typeof resultAnalysis.perItem;
assert.deepEqual(
  sortAssignmentItemsByReviewPriority(reviewPriorityItems).map(
    (item) => item.itemId
  ),
  [
    'unsubmitted',
    'tie-more-submitted',
    'tie-fewer-submitted',
    'higher-accuracy',
  ]
);
const stableTieReviewPriorityItems = [
  {
    acceptedAnswers: ['Question B'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'Question B',
    itemId: 'question-b',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Same prompt',
    submittedCount: 3,
  },
  {
    acceptedAnswers: ['Pair Z'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'Pair Z',
    itemId: 'pair-z',
    kind: 'pair',
    kindLabel: 'Pair',
    prompt: 'Alpha prompt',
    submittedCount: 3,
  },
  {
    acceptedAnswers: ['Question A'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'Question A',
    itemId: 'question-a',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Same prompt',
    submittedCount: 3,
  },
  {
    acceptedAnswers: ['Group Z'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'Group Z',
    itemId: 'group-z',
    kind: 'group-item',
    kindLabel: 'Group item',
    prompt: 'Zoo prompt',
    submittedCount: 3,
  },
] satisfies typeof resultAnalysis.perItem;
const stableTieItemOrder = ['group-z', 'pair-z', 'question-a', 'question-b'];
assert.deepEqual(
  [...stableTieReviewPriorityItems]
    .sort(compareAssignmentItemsByType)
    .map((item) => item.itemId),
  stableTieItemOrder
);
assert.deepEqual(
  sortAssignmentItemsByReviewPriority(stableTieReviewPriorityItems).map(
    (item) => item.itemId
  ),
  stableTieItemOrder
);
const normalizedTieReviewPriorityItems = [
  {
    ...stableTieReviewPriorityItems[0]!,
    itemId: 'zoo-id',
    prompt: '　Zoo prompt',
  },
  {
    ...stableTieReviewPriorityItems[1]!,
    itemId: 'alpha-id',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Alpha prompt',
  },
  {
    ...stableTieReviewPriorityItems[2]!,
    itemId: '　z-id',
  },
  {
    ...stableTieReviewPriorityItems[3]!,
    itemId: 'a-id',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Same prompt',
  },
] satisfies typeof resultAnalysis.perItem;
const normalizedTieItemOrder = ['alpha-id', 'a-id', '　z-id', 'zoo-id'];
assert.deepEqual(
  [...normalizedTieReviewPriorityItems]
    .sort(compareAssignmentItemsByType)
    .map((item) => item.itemId),
  normalizedTieItemOrder
);
assert.deepEqual(
  sortAssignmentItemsByReviewPriority(normalizedTieReviewPriorityItems).map(
    (item) => item.itemId
  ),
  normalizedTieItemOrder
);
assert.deepEqual(
  getSubmittedAssignmentReviewPriorityItems(reviewPriorityItems, {
    limit: 2,
  }).map((item) => item.itemId),
  ['tie-more-submitted', 'tie-fewer-submitted']
);
const abnormalReviewPriorityItems = [
  {
    ...reviewPriorityItems[0]!,
    correctRate: Number.NaN,
    itemId: 'nan-unsubmitted',
    submittedCount: Number.POSITIVE_INFINITY,
  },
  {
    ...reviewPriorityItems[1]!,
    correctRate: -10,
    itemId: 'negative-rate',
    submittedCount: 2.9,
  },
  {
    ...reviewPriorityItems[2]!,
    correctRate: 0,
    itemId: 'zero-rate',
    submittedCount: 2,
  },
  {
    ...reviewPriorityItems[3]!,
    correctRate: 50.5,
    itemId: 'fractional-rate',
    submittedCount: 5,
  },
] satisfies typeof resultAnalysis.perItem;
assert.deepEqual(
  sortAssignmentItemsByReviewPriority(abnormalReviewPriorityItems).map(
    (item) => item.itemId
  ),
  ['zero-rate', 'negative-rate', 'nan-unsubmitted', 'fractional-rate']
);
assert.deepEqual(
  getSubmittedAssignmentReviewPriorityItems(abnormalReviewPriorityItems, {
    limit: 2.9,
  }).map((item) => item.itemId),
  ['zero-rate', 'negative-rate']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'submitted').map(
    (item) => item.itemId
  ),
  ['q-1', 'pair-1']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'type').map(
    (item) => item.itemId
  ),
  ['pair-1', 'q-1']
);
assert.deepEqual(
  sortItemPerformance(stableTieReviewPriorityItems, 'submitted').map(
    (item) => item.itemId
  ),
  stableTieItemOrder
);
assert.deepEqual(
  sortItemPerformance(stableTieReviewPriorityItems, 'type').map(
    (item) => item.itemId
  ),
  stableTieItemOrder
);
assert.deepEqual(
  sortItemPerformance(normalizedTieReviewPriorityItems, 'submitted').map(
    (item) => item.itemId
  ),
  normalizedTieItemOrder
);
assert.deepEqual(
  sortItemPerformance(normalizedTieReviewPriorityItems, 'type').map(
    (item) => item.itemId
  ),
  normalizedTieItemOrder
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'original').map(
    (item) => item.itemId
  ),
  resultAnalysis.perItem.map((item) => item.itemId)
);
assert.notEqual(
  sortItemPerformance(resultAnalysis.perItem, 'original'),
  resultAnalysis.perItem
);
assert.deepEqual(
  buildFilteredAttemptRows({
    attempts: [
      { id: 'attempt-1', studentName: ' Alice ' },
      { id: 'attempt-2', studentName: 'alice' },
      { id: 'attempt-3', studentName: null },
    ],
    reviews: resultAnalysis.attempts,
    search: 'ａｎｏｎｙｍｏｕｓ',
  }).map((row) => row.attempt.id),
  ['attempt-3']
);
const fallbackIdentityAttemptRows = buildFilteredAttemptRows({
  attempts: [
    {
      anonymousToken: 'browser-token-1',
      id: 'fallback-anonymous-attempt',
      studentName: null,
    },
  ],
  reviews: [],
  search: 'student 1',
});
assert.deepEqual(
  fallbackIdentityAttemptRows.map((row) => ({
    id: row.attempt.id,
    studentLabel: row.studentLabel,
  })),
  [
    {
      id: 'fallback-anonymous-attempt',
      studentLabel: 'Anonymous student 1',
    },
  ]
);
assert.deepEqual(
  filterAttemptReviews({
    attempts: resultAnalysis.attempts,
    filter: 'needs-review',
    search: '',
  }).map((attempt) => attempt.id),
  ['attempt-1', 'attempt-3']
);
assert.deepEqual(
  filterAttemptReviews({
    attempts: [
      {
        accuracy: 0,
        answers: [
          {
            acceptedAnswers: ['Cold'],
            answer: '',
            correct: false,
            expectedAnswer: 'Cold',
            itemId: 'pair-1',
            prompt: 'Hot',
            submitted: false,
          },
        ],
        completedAt: new Date('2026-01-05T10:00:00.000Z'),
        id: 'only-unanswered',
        score: 0,
        studentKey: 'name:casey',
        studentLabel: 'Casey',
      },
    ],
    filter: 'needs-review',
    search: '',
  }).map((attempt) => attempt.id),
  []
);
assert.deepEqual(
  filterAttemptReviews({
    attempts: resultAnalysis.attempts,
    filter: 'all',
    search: ' ａｌｉｃｅ ',
  }).map((attempt) => attempt.id),
  ['attempt-1', 'attempt-2']
);

const csvExportData = {
  activity: {
    description: 'Original activity',
    templateType: 'quiz',
    title: 'Original Capitals',
  },
  analysis: resultAnalysis,
  assignment: {
    expiresAt: new Date('2026-01-10T10:00:00.000Z'),
    id: 'assignment-1',
    settingsJson: {
      collectStudentName: true,
      instructions: 'Use "complete sentences", then submit.',
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleItems: false,
      timeLimitSeconds: 60,
    },
    shareSlug: 'share-123',
    status: 'published',
    title: 'Capital Review, Week 1',
  },
  attempts: [
    {
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'attempt-1',
      maxScore: 2,
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        durationSeconds: 45,
        totalPoints: 2,
      },
      score: 1,
    },
  ],
  snapshot: {
    activityDescription: 'Snapshot description',
    activityTitle: 'Snapshot Capitals',
    templateType: 'quiz',
  },
  stats: {
    averageDurationSeconds: 45,
    averagePoints: 1,
    averageScore: 50,
    completions: 1,
  },
  now: new Date('2026-01-02T10:00:00.000Z').getTime(),
} satisfies Parameters<typeof buildAssignmentResultsCsv>[0];

const csv = buildAssignmentResultsCsv(csvExportData);
assert.ok(csv.startsWith('\uFEFF"assignment_id","assignment_title"'));
assert.match(csv, /"expires_at","delivery_policy","instructions"/);
assert.match(csv, /"assignment-1","Capital Review, Week 1","share-123","Open"/);
assert.match(
  csv,
  /"Student instructions: Use ""complete sentences"", then submit\.; Attempts: 2 max; Timer: 1 min;/
);
assert.match(csv, /Answer reveal: After submit; Item order: Fixed order/);
assert.match(csv, /"Use ""complete sentences"", then submit\."/);
assert.match(
  csv,
  /"Use ""complete sentences"", then submit\.","Names","After submit","Fixed order","2","60"/
);
assert.match(csv, /"Snapshot Capitals","Quiz"/);
assert.match(csv, /"attempt-1","Alice","2026-01-01T10:00:00\.000Z"/);
assert.match(
  csv,
  /"attempt-3","Anonymous student 1","2026-01-03T10:00:00\.000Z"/
);
assert.match(csv, /"Paris","Paris, France","correct"/);
assert.match(csv, /"Paris is the capital of France\."/);
assert.match(
  csv,
  /"pair-1","Match ""Hot"" with its pair\.","unanswered","Cold","","unanswered"/
);
assert.equal(csv.includes('browser-token-1'), false);
const normalizedDisplayCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  analysis: {
    ...csvExportData.analysis,
    attempts: csvExportData.analysis.attempts.map((attempt, attemptIndex) =>
      attemptIndex === 0
        ? {
            ...attempt,
            answers: attempt.answers.map((answer, answerIndex) =>
              answerIndex === 0
                ? {
                    ...answer,
                    explanation: ' Ｆｒａｎｃｅ\u00A0　capital. ',
                    prompt: ' Ｃａｐｉｔａｌ\u00A0　of   France? ',
                  }
                : answer
            ),
            studentLabel: ' Ａｖａ\u00A0　Chen ',
          }
        : attempt
    ),
  },
  assignment: {
    ...csvExportData.assignment,
    shareSlug: '　share-１２３　',
    title: ' Ｃａｐｉｔａｌ\u00A0　Review,   Week 1 ',
    settingsJson: {
      ...csvExportData.assignment.settingsJson,
      instructions: ' Ｆｉｎｉｓｈ\u00A0　before   class. ',
    },
  },
});
assert.match(
  normalizedDisplayCsv,
  /"assignment-1","Capital Review, Week 1","share-123","Open"/
);
assert.match(normalizedDisplayCsv, /"Finish before class\."/);
assert.match(
  normalizedDisplayCsv,
  /"attempt-1","Ava Chen","2026-01-01T10:00:00\.000Z"/
);
assert.match(
  normalizedDisplayCsv,
  /"q-1","Capital of France\?","Paris","Paris","Paris, France","correct"/
);
assert.match(normalizedDisplayCsv, /"correct","France capital\."/);
assert.doesNotMatch(
  normalizedDisplayCsv,
  /Ａｖａ|Ｃａｐｉｔａｌ|Ｆｉｎｉｓｈ|Ｆｒａｎｃｅ|１２３|\u00A0/
);
const csvWithUnscoredAttempt = buildAssignmentResultsCsv({
  ...csvExportData,
  analysis: resultAnalysisWithUnscoredAttempt,
  attempts: [
    {
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'completed-attempt',
      maxScore: 1,
      resultJson: {
        accuracy: 100,
        completedItemCount: 1,
        durationSeconds: 20,
        totalPoints: 1,
      },
      score: 1,
    },
    {
      completedAt: null,
      id: 'unscored-attempt',
      maxScore: null,
      resultJson: null,
      score: null,
    },
  ],
  stats: {
    averageDurationSeconds: 20,
    averagePoints: 1,
    averageScore: 100,
    completions: 1,
  },
});
assert.match(csvWithUnscoredAttempt, /"completed-attempt","Alice"/);
assert.doesNotMatch(csvWithUnscoredAttempt, /unscored-attempt|Bob|Rome/);
const weightedScoreCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  attempts: [
    {
      ...csvExportData.attempts[0]!,
      maxScore: 10,
      resultJson: {
        ...csvExportData.attempts[0]!.resultJson!,
        totalPoints: 10,
      },
    },
  ],
});
assert.match(
  weightedScoreCsv,
  /"attempt-1","Alice","2026-01-01T10:00:00\.000Z","1","10","50","2","2","45"/
);
function buildCsvWithStoredAttemptDuration(durationSeconds: number) {
  return buildAssignmentResultsCsv({
    ...csvExportData,
    attempts: [
      {
        ...csvExportData.attempts[0]!,
        resultJson: {
          ...csvExportData.attempts[0]!.resultJson!,
          durationSeconds,
        },
      },
    ],
  });
}
assert.match(
  buildCsvWithStoredAttemptDuration(120),
  /"attempt-1","Alice","2026-01-01T10:00:00\.000Z","1","2","50","2","2","60"/
);
assert.match(
  buildCsvWithStoredAttemptDuration(-3),
  /"attempt-1","Alice","2026-01-01T10:00:00\.000Z","1","2","50","2","2","0"/
);
assert.match(
  buildCsvWithStoredAttemptDuration(4.6),
  /"attempt-1","Alice","2026-01-01T10:00:00\.000Z","1","2","50","2","2","5"/
);
assert.match(
  buildCsvWithStoredAttemptDuration(Number.POSITIVE_INFINITY),
  /"attempt-1","Alice","2026-01-01T10:00:00\.000Z","1","2","50","2","2",""/
);
const zeroAverageDurationCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  stats: {
    ...csvExportData.stats,
    averageDurationSeconds: 0,
  },
});
assert.match(
  zeroAverageDurationCsv,
  /"Snapshot Capitals","Quiz","1","50","1","0","attempt-1"/
);
const invalidStatsCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  stats: {
    averageDurationSeconds: Number.NaN,
    averagePoints: Number.NEGATIVE_INFINITY,
    averageScore: Number.POSITIVE_INFINITY,
    completions: Number.NaN,
  },
});
assert.doesNotMatch(invalidStatsCsv, /NaN|Infinity/);
assert.match(
  invalidStatsCsv,
  /"Snapshot Capitals","Quiz","","","","","attempt-1"/
);
const invalidStoredAttemptCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  attempts: [
    {
      ...csvExportData.attempts[0]!,
      maxScore: Number.POSITIVE_INFINITY,
      resultJson: {
        ...csvExportData.attempts[0]!.resultJson!,
        accuracy: Number.NaN,
        completedItemCount: -3,
      },
      score: -3,
    },
  ],
});
assert.doesNotMatch(invalidStoredAttemptCsv, /NaN|Infinity/);
assert.match(
  invalidStoredAttemptCsv,
  /"attempt-1","Alice","2026-01-01T10:00:00\.000Z","0","","50","0","2","45"/
);
const activityTemplateFallbackCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  activity: {
    ...csvExportData.activity,
    templateType: 'line-match',
  },
  snapshot: null,
});
assert.match(
  activityTemplateFallbackCsv,
  /"Original Capitals","Line match","1","50","1","45","attempt-1"/
);
const expiredAssignmentStatusCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  now: new Date('2026-01-11T10:00:00.000Z').getTime(),
});
assert.match(
  expiredAssignmentStatusCsv,
  /"assignment-1","Capital Review, Week 1","share-123","Expired"/
);
assert.equal(
  buildAssignmentResultsCsvFilename(csvExportData),
  'classgamify-capital-review-week-1-share-123-results.csv'
);
assert.deepEqual(ASSIGNMENT_RESULTS_EXPORT_FILENAME_LIMITS, {
  shareSlugMaxLength: 48,
  titleMaxLength: 80,
});
assert.equal(
  buildAssignmentResultsCsvFilename({
    ...csvExportData,
    assignment: {
      ...csvExportData.assignment,
      title: '三年级｜听力复习 Ａ 班',
    },
  }),
  'classgamify-三年级-听力复习-a-班-share-123-results.csv'
);
assert.equal(
  buildAssignmentResultsCsvFilename({
    ...csvExportData,
    assignment: {
      ...csvExportData.assignment,
      title: 'A '.repeat(120),
    },
  }),
  `classgamify-${`${'a-'.repeat(39)}a`}-share-123-results.csv`
);
assert.equal(
  buildAssignmentResultsCsvFilename({
    ...csvExportData,
    assignment: {
      ...csvExportData.assignment,
      shareSlug: ' Classroom Link/With Spaces '.repeat(4),
    },
  }),
  'classgamify-capital-review-week-1-classroom-link-with-spaces-classroom-link-with-s-results.csv'
);
const partialSettingsCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  assignment: {
    ...csvExportData.assignment,
    settingsJson: {
      collectStudentName: false,
      instructions: '  Review quietly.  ',
      maxAttempts: 99,
      showCorrectAnswers: false,
      timeLimitSeconds: 30,
    },
  },
});
assert.match(
  partialSettingsCsv,
  /"Review quietly\.","Anonymous","Hidden","Shuffled","2",""/
);
assert.match(
  partialSettingsCsv,
  /"Student instructions: Review quietly\.; Attempts: 2 max; Timer: No timer; Closes:/
);
assert.match(partialSettingsCsv, /Answer reveal: Hidden; Item order: Shuffled/);
const unlimitedAttemptsCsv = buildAssignmentResultsCsv({
  ...csvExportData,
  assignment: {
    ...csvExportData.assignment,
    settingsJson: {
      ...csvExportData.assignment.settingsJson,
      maxAttempts: null,
    },
  },
});
assert.match(
  unlimitedAttemptsCsv,
  /"Student instructions: Use ""complete sentences"", then submit\.; Attempts: Open; Timer: 1 min;/
);
assert.match(
  unlimitedAttemptsCsv,
  /"Use ""complete sentences"", then submit\.","Names","After submit","Fixed order","Open","60"/
);

assert.deepEqual(ASSIGNMENT_CLASSROOM_BRIEF_LIMITS, {
  focusItems: 3,
  followUpStudents: 6,
});
const classroomBrief = buildAssignmentClassroomBrief({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
  stats: csvExportData.stats,
  students: resultAnalysis.students,
});
assert.equal(classroomBrief.focusItems[0]?.itemId, 'pair-1');
assert.equal(
  classroomBrief.followUpStudents[0]?.studentLabel,
  'Anonymous student 1'
);
assert.deepEqual(buildAssignmentClassroomBriefStatViews(csvExportData.stats), [
  { key: 'completions', text: 'Completions: 1' },
  { key: 'average-accuracy', text: 'Average accuracy: 50%' },
  { key: 'average-points', text: 'Average points: 1' },
  { key: 'average-time', text: 'Average time: 45s' },
]);
assert.deepEqual(classroomBrief.statViews, [
  { key: 'completions', text: 'Completions: 1' },
  { key: 'average-accuracy', text: 'Average accuracy: 50%' },
  { key: 'average-points', text: 'Average points: 1' },
  { key: 'average-time', text: 'Average time: 45s' },
]);
assert.deepEqual(
  buildAssignmentClassroomBriefFocusItemView({
    index: 0,
    item: classroomBrief.focusItems[0]!,
  }),
  {
    correctRateLabel: '50%',
    correctSummaryLabel: '1/2 correct',
    itemId: 'pair-1',
    itemNumberLabel: '1.',
    performanceLabel: '50% correct, 1/2',
    prompt: 'Match "Hot" with its pair.',
    promptLabel: '1. Match "Hot" with its pair.',
    text: '- 1. Match "Hot" with its pair. (50% correct, 1/2)',
  }
);
assert.deepEqual(classroomBrief.focusItemViews[0], {
  correctRateLabel: '50%',
  correctSummaryLabel: '1/2 correct',
  itemId: 'pair-1',
  itemNumberLabel: '1.',
  performanceLabel: '50% correct, 1/2',
  prompt: 'Match "Hot" with its pair.',
  promptLabel: '1. Match "Hot" with its pair.',
  text: '- 1. Match "Hot" with its pair. (50% correct, 1/2)',
});
assert.deepEqual(
  buildAssignmentClassroomBriefFollowUpStudentView({
    index: 0,
    student: classroomBrief.followUpStudents[0]!,
  }),
  {
    accuracyLabel: 'Latest 0% · best 0%',
    latestAccuracyLabel: '0%',
    needsReviewLabel: '1 review',
    reviewItemCountLabel: '1 item to review',
    studentKey: 'anonymous:1',
    studentLabel: 'Anonymous student 1',
    text: '- 1. Anonymous student 1: 0% latest, 1 item to review',
  }
);
assert.deepEqual(classroomBrief.followUpStudentViews[0], {
  accuracyLabel: 'Latest 0% · best 0%',
  latestAccuracyLabel: '0%',
  needsReviewLabel: '1 review',
  reviewItemCountLabel: '1 item to review',
  studentKey: 'anonymous:1',
  studentLabel: 'Anonymous student 1',
  text: '- 1. Anonymous student 1: 0% latest, 1 item to review',
});
assert.deepEqual(ASSIGNMENT_RESULT_COPY_TEXT_FORMAT, { lineBreak: '\n' });
assert.equal(joinAssignmentResultCopyLines(['one', '', 'two']), 'one\n\ntwo');
assert.equal(formatAssignmentResultCopyOrdinal(0), 1);
assert.equal(formatAssignmentResultCopyOrdinal(2.9), 3);
assert.equal(formatAssignmentResultCopyOrdinal(-3), 1);
assert.equal(formatAssignmentResultCopyOrdinal(Number.NaN), 1);
assert.equal(
  buildAssignmentClassroomBriefFollowUpStudentView({
    index: Number.NaN,
    student: classroomBrief.followUpStudents[0]!,
  }).text,
  '- 1. Anonymous student 1: 0% latest, 1 item to review'
);
assert.deepEqual(
  buildAssignmentClassroomBriefFollowUpStudentView({
    index: 0,
    student: {
      ...classroomBrief.followUpStudents[0]!,
      studentLabel: ' Ａｖａ\u00A0　Chen ',
    },
  }).studentLabel,
  'Ava Chen'
);
assert.match(
  classroomBrief.text,
  /ClassGamify classroom brief: Capital Review, Week 1/
);
assert.match(classroomBrief.text, /Completions: 1/);
assert.match(classroomBrief.text, /Average accuracy: 50%/);
assert.match(classroomBrief.text, /Average time: 45s/);
assert.match(
  classroomBrief.text,
  /- 1\. Match "Hot" with its pair\. \(50% correct, 1\/2\)/
);
assert.match(
  classroomBrief.text,
  /- 1\. Anonymous student 1: 0% latest, 1 item to review/
);
const invalidStatsClassroomBrief = buildAssignmentClassroomBrief({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
  stats: {
    averageDurationSeconds: Number.NaN,
    averagePoints: Number.POSITIVE_INFINITY,
    averageScore: Number.NaN,
    completions: Number.POSITIVE_INFINITY,
  },
  students: resultAnalysis.students,
});
assert.match(invalidStatsClassroomBrief.text, /Completions: 0/);
assert.match(invalidStatsClassroomBrief.text, /Average accuracy: -/);
assert.match(invalidStatsClassroomBrief.text, /Average points: -/);
assert.match(invalidStatsClassroomBrief.text, /Average time: -/);
const expandedClassroomBrief = buildAssignmentClassroomBrief({
  assignmentTitle: csvExportData.assignment.title,
  items: reviewPriorityItems,
  stats: csvExportData.stats,
  students: [
    ...followUpPriorityStudents,
    ...followUpPriorityStudents.map((student, index) => ({
      ...student,
      studentKey: `${student.studentKey}-extra-${index}`,
      studentLabel: `${student.studentLabel} extra ${index}`,
    })),
  ],
});
assert.equal(
  expandedClassroomBrief.focusItems.length,
  ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.focusItems
);
assert.equal(
  expandedClassroomBrief.followUpStudents.length,
  ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.followUpStudents
);

assert.deepEqual(ASSIGNMENT_RETEACH_PLAN_LIMITS, {
  reviewItems: 5,
  reviewStudents: 8,
});
const reteachPlan = buildAssignmentReteachPlan({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
  students: followUpPriorityStudents,
});
const alphaReviewStudent = followUpPriorityStudents.find(
  (student) => student.studentKey === 'name:alpha-review'
)!;
assert.deepEqual(
  buildAssignmentReteachPlanItemView({
    index: 0,
    item: resultAnalysis.perItem[1]!,
  }),
  {
    itemId: 'pair-1',
    performanceLabel: '50% correct, 1/2',
    promptLabel: '1. Match "Hot" with its pair.',
    text: '- 1. Match "Hot" with its pair. (50% correct, 1/2)',
  }
);
assert.deepEqual(buildAssignmentReteachPlanStudentView(alphaReviewStudent), {
  accuracyLabel: '70%',
  reviewItemCountLabel: '3 items to review',
  studentKey: 'name:alpha-review',
  studentLabel: 'Alpha review',
  text: '- Alpha review: 70% latest accuracy, 3 items to review',
});
assert.deepEqual(
  buildAssignmentReteachPlanStudentView({
    ...alphaReviewStudent,
    studentLabel: ' Ａｖａ\u00A0　Chen ',
  }).studentLabel,
  'Ava Chen'
);
assert.match(reteachPlan, /ClassGamify reteach plan: Capital Review, Week 1/);
assert.match(reteachPlan, /Review first:/);
assert.match(reteachPlan, /Student follow-up:/);
assert.match(reteachPlan, /Match "Hot" with its pair\. \(50% correct, 1\/2\)/);
assert.match(
  reteachPlan,
  /Alpha review: 70% latest accuracy, 3 items to review\n- More review: 70% latest accuracy, 3 items to review\n- Lower score: 10% latest accuracy, 1 item to review/
);
const expandedReteachPlan = buildAssignmentReteachPlan({
  assignmentTitle: csvExportData.assignment.title,
  items: [
    ...reviewPriorityItems,
    {
      acceptedAnswers: ['D'],
      correctCount: 1,
      correctRate: 20,
      expectedAnswer: 'D',
      itemId: 'lower-than-tie',
      kind: 'question',
      kindLabel: 'Question',
      prompt: 'Lower than tie',
      submittedCount: 5,
    },
    {
      acceptedAnswers: ['E'],
      correctCount: 2,
      correctRate: 40,
      expectedAnswer: 'E',
      itemId: 'another-reviewed',
      kind: 'question',
      kindLabel: 'Question',
      prompt: 'Another reviewed item',
      submittedCount: 1,
    },
  ],
  students: [
    ...followUpPriorityStudents,
    ...followUpPriorityStudents.map((student, index) => ({
      ...student,
      studentKey: `${student.studentKey}-reteach-extra-${index}`,
      studentLabel: `${student.studentLabel} reteach extra ${index}`,
    })),
    ...followUpPriorityStudents.map((student, index) => ({
      ...student,
      studentKey: `${student.studentKey}-reteach-more-${index}`,
      studentLabel: `${student.studentLabel} reteach more ${index}`,
    })),
  ],
});
assert.equal(
  (expandedReteachPlan.match(/^- \d+\. /gm) ?? []).length,
  ASSIGNMENT_RETEACH_PLAN_LIMITS.reviewItems
);
assert.equal(
  (expandedReteachPlan.match(/^- .*latest accuracy/gm) ?? []).length,
  ASSIGNMENT_RETEACH_PLAN_LIMITS.reviewStudents
);

const itemReviewSummary = buildAssignmentItemReviewSummary({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
});
const assignmentItemReviewSummarySource = readFileSync(
  'src/assignments/item-review-summary.ts',
  'utf8'
);
assert.match(
  assignmentItemReviewSummarySource,
  /joinAssignmentResultCopyLines\(lines\)/,
  'Assignment item review summaries should use the shared assignment-result copy line joiner.'
);
assert.doesNotMatch(
  assignmentItemReviewSummarySource,
  /lines\.join\('\\n'\)/,
  'Assignment item review summaries should not hand-compose copy line breaks.'
);
assert.match(
  assignmentItemReviewSummarySource,
  /formatOptionalAcceptedAnswerAlternatives\(item\.acceptedAnswers,[\s\S]*includePrimary: false[\s\S]*formatPrimaryAcceptedAnswer\(item\.acceptedAnswers\)/,
  'Assignment item review summaries should split primary expected answers from accepted alternatives.'
);
assert.match(
  assignmentItemReviewSummarySource,
  /formatAssignmentResultValue\(item\.explanation,[\s\S]*emptyValue: ''/,
  'Assignment item review summaries should normalize explanation notes through the shared result-format helper.'
);
assert.doesNotMatch(
  assignmentItemReviewSummarySource,
  /item\.explanation \?\? ''/,
  'Assignment item review summaries should not write raw explanation notes directly.'
);
assert.deepEqual(
  buildAssignmentItemReviewSummaryItemView({
    index: 0,
    item: resultAnalysis.perItem[0]!,
  }),
  {
    acceptedAnswersText: 'Paris, France',
    correctCountLabel: '2/3 correct',
    correctRateLabel: '67% correct',
    expectedAnswerText: 'Paris',
    explanationText: 'Paris is the capital of France.',
    itemId: 'q-1',
    kindLabel: 'Question',
    promptLabel: '1. Capital of France?',
    text: '- 1. Capital of France? (Question) - 67% correct, 2/3 correct. Expected: Paris. Accepted answers: Paris, France. Notes: Paris is the capital of France.',
  }
);
assert.deepEqual(
  buildAssignmentItemReviewSummaryItemView({
    index: 0,
    item: {
      ...resultAnalysis.perItem[0]!,
      explanation: ' Ｆｒａｎｃｅ\u00A0　capital. ',
    },
  }).explanationText,
  'France capital.'
);
assert.match(
  itemReviewSummary,
  /ClassGamify item review: Capital Review, Week 1/
);
assert.match(
  itemReviewSummary,
  /Capital of France\? \(Question\) - 67% correct, 2\/3 correct/
);
assert.match(
  itemReviewSummary,
  /Match "Hot" with its pair\. \(Pair\) - 50% correct, 1\/2 correct/
);
assert.match(itemReviewSummary, /Expected: Paris\./);
assert.match(itemReviewSummary, /Accepted answers: Paris, France\./);
assert.match(itemReviewSummary, /Notes: Paris is the capital of France\./);

const studentFollowUpSummary = buildAssignmentStudentFollowUpSummary({
  assignmentTitle: csvExportData.assignment.title,
  students: followUpPriorityStudents,
});
const assignmentStudentFollowUpSummarySource = readFileSync(
  'src/assignments/student-follow-up-summary.ts',
  'utf8'
);
assert.match(
  assignmentStudentFollowUpSummarySource,
  /joinAssignmentResultCopyLines\(lines\)/,
  'Assignment student follow-up summaries should use the shared assignment-result copy line joiner.'
);
assert.match(
  assignmentStudentFollowUpSummarySource,
  /formatAssignmentResultCopyOrdinal\(index\)/,
  'Assignment student follow-up summaries should use the shared assignment-result copy ordinal formatter.'
);
assert.match(
  assignmentStudentFollowUpSummarySource,
  /formatAssignmentResultStudentLabel\(/,
  'Assignment student follow-up summaries should format student labels through the shared result-display helper.'
);
assert.doesNotMatch(
  assignmentStudentFollowUpSummarySource,
  /lines\.join\('\\n'\)|index \+ 1|student: student\.studentLabel/,
  'Assignment student follow-up summaries should not hand-compose copy line breaks, ordinals, or raw student labels.'
);
assert.deepEqual(
  buildAssignmentStudentFollowUpSummaryStudentView({
    index: 0,
    student: alphaReviewStudent,
  }),
  {
    attemptsLabel: '1 attempt',
    averageAccuracyLabel: '70%',
    bestAccuracyLabel: '70%',
    latestAccuracyLabel: '70%',
    reviewItemCountLabel: '3 items to review',
    studentKey: 'name:alpha-review',
    studentLabel: 'Alpha review',
    text: '- 1. Alpha review: latest 70%, average 70%, best 70%, 1 attempt, 3 items to review',
  }
);
assert.equal(
  buildAssignmentStudentFollowUpSummaryStudentView({
    index: -5,
    student: alphaReviewStudent,
  }).text,
  '- 1. Alpha review: latest 70%, average 70%, best 70%, 1 attempt, 3 items to review'
);
assert.deepEqual(
  buildAssignmentStudentFollowUpSummaryStudentView({
    index: 0,
    student: {
      ...alphaReviewStudent,
      studentLabel: ' Ａｖａ\u00A0　Chen ',
    },
  }).studentLabel,
  'Ava Chen'
);
assert.match(
  studentFollowUpSummary,
  /ClassGamify student follow-up: Capital Review, Week 1/
);
assert.match(
  studentFollowUpSummary,
  /1\. Alpha review: latest 70%, average 70%, best 70%, 1 attempt, 3 items to review/
);
assert.match(
  studentFollowUpSummary,
  /2\. More review: latest 70%, average 70%, best 70%, 1 attempt, 3 items to review/
);
assert.match(
  studentFollowUpSummary,
  /4\. No review: latest 0%, average 0%, best 0%, 1 attempt, 0 items to review/
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-brief',
    data: csvExportData,
  }),
  classroomBrief.text
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-reteach-plan',
    data: {
      ...csvExportData,
      analysis: {
        ...csvExportData.analysis,
        students: followUpPriorityStudents,
      },
    },
  }),
  reteachPlan
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-item-review',
    data: csvExportData,
  }),
  itemReviewSummary
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-follow-up',
    data: {
      ...csvExportData,
      analysis: {
        ...csvExportData.analysis,
        students: followUpPriorityStudents,
      },
    },
  }),
  studentFollowUpSummary
);
assert.deepEqual(
  buildAssignmentResultActionPayload({
    actionButton: {
      action: 'copy-brief',
      disabled: false,
      failureMessage: 'Classroom brief could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy brief',
      successMessage: 'Classroom brief copied.',
    },
    data: csvExportData,
  }),
  {
    kind: 'copy-text',
    text: classroomBrief.text,
  }
);
assert.deepEqual(
  buildAssignmentResultActionExecutionPlan({
    actionButton: {
      action: 'copy-brief',
      disabled: false,
      failureMessage: 'Classroom brief could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy brief',
      successMessage: 'Classroom brief copied.',
    },
    data: csvExportData,
  }),
  {
    failureMessage: 'Classroom brief could not be copied.',
    successMessage: 'Classroom brief copied.',
    text: classroomBrief.text,
    type: 'copy-text',
  }
);
assert.throws(
  () =>
    buildAssignmentResultActionPayload({
      actionButton: {
        action: 'copy-brief',
        disabled: true,
        failureMessage: 'Classroom brief could not be copied.',
        gate: {
          message: 'Submit at least one attempt before copying a brief.',
          type: 'blocked',
        },
        kind: 'copy-text',
        label: 'Copy brief',
        successMessage: 'Classroom brief copied.',
      },
      data: csvExportData,
    }),
  /Submit at least one attempt before copying a brief\./
);
const downloadCsvPayload = buildAssignmentResultActionPayload({
  actionButton: {
    action: 'export-csv',
    disabled: false,
    failureMessage: 'Results CSV could not be downloaded.',
    gate: { type: 'ready' },
    kind: 'download-csv',
    label: 'Download CSV',
    successMessage: 'Results CSV downloaded.',
  },
  data: csvExportData,
});
assert.equal(downloadCsvPayload.kind, 'download-csv');
assert.equal(
  downloadCsvPayload.kind === 'download-csv' ? downloadCsvPayload.filename : '',
  buildAssignmentResultsCsvFilename(csvExportData)
);
assert.equal(
  downloadCsvPayload.kind === 'download-csv' ? downloadCsvPayload.csv : '',
  csv
);
assert.equal(
  buildAssignmentResultsCsvDataUrl(csv),
  `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
);
assert.deepEqual(
  buildAssignmentResultActionExecutionPlan({
    actionButton: {
      action: 'export-csv',
      disabled: false,
      failureMessage: 'Results CSV could not be downloaded.',
      gate: { type: 'ready' },
      kind: 'download-csv',
      label: 'Download CSV',
      successMessage: 'Results CSV downloaded.',
    },
    data: csvExportData,
  }),
  {
    failureMessage: 'Results CSV could not be downloaded.',
    filename: buildAssignmentResultsCsvFilename(csvExportData),
    successMessage: 'Results CSV downloaded.',
    type: 'download-csv',
    url: buildAssignmentResultsCsvDataUrl(csv),
  }
);
assert.throws(
  () =>
    buildAssignmentResultActionPayload({
      actionButton: {
        action: 'export-csv',
        disabled: true,
        failureMessage: 'Results CSV could not be downloaded.',
        gate: {
          message: 'Submit at least one attempt before exporting results.',
          type: 'blocked',
        },
        kind: 'download-csv',
        label: 'Download CSV',
        successMessage: 'Results CSV downloaded.',
      },
      data: csvExportData,
    }),
  /Submit at least one attempt before exporting results\./
);
assert.deepEqual(
  buildAssignmentResultActionExecutionPlan({
    actionButton: {
      action: 'export-csv',
      disabled: true,
      failureMessage: 'Results CSV could not be downloaded.',
      gate: {
        message: 'Submit at least one attempt before exporting results.',
        type: 'blocked',
      },
      kind: 'download-csv',
      label: 'Download CSV',
      successMessage: 'Results CSV downloaded.',
    },
    data: csvExportData,
  }),
  {
    failureMessage: 'Results CSV could not be downloaded.',
    message: 'Submit at least one attempt before exporting results.',
    type: 'blocked',
  }
);
assert.deepEqual(
  buildAssignmentResultActionExecutionPlan({
    actionButton: {
      action: 'copy-brief',
      disabled: false,
      failureMessage: 'Classroom brief could not be copied.',
      gate: { type: 'ready' },
      kind: 'copy-text',
      label: 'Copy brief',
      successMessage: 'Classroom brief copied.',
    },
    data: null,
  }),
  {
    failureMessage: 'Classroom brief could not be copied.',
    message: 'Classroom brief could not be copied.',
    type: 'blocked',
  }
);

console.log('Domain tests passed.');
