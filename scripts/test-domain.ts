import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { isLocalizedPath } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getFooterLinks } from '@/config/footer-config';
import { getNavbarLinks } from '@/config/navbar-config';
import { getSidebarLinks } from '@/config/sidebar-config';
import { formatUserFileUploadError } from '@/api/user-file-errors';
import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import { stripJsonComments } from './parse-wrangler';
import {
  buildActivityLibraryCardSummary,
  buildActivityLibraryFilterSummary,
  buildActivityLibrarySummaryMetrics,
  summarizeActivityLibrary,
} from '@/activities/library-summary';
import {
  activityLibraryCardCopy,
  activityLibraryHeroCopy,
  activityLibraryPageCopy,
  activityLibrarySearchCopy,
  buildActivityLibraryCardActionState,
  buildActivityLibraryCardDisplayView,
  buildActivityLibraryCardStats,
  buildActivityLibraryCardViewModel,
  buildActivityLibraryCompatibilityView,
  buildCreatedActivityPanelContext,
  buildActivityLibraryEmptyStateView,
  buildActivityLibraryRemixActionLabel,
  buildActivityLibraryRemixHint,
  buildStarterActivityLibraryCardViewModel,
  findCreatedActivityInList,
  formatActivityLibraryStatusLabel,
  resolveCreatedActivityPanelActivity,
} from '@/activities/library-view';
import {
  buildActivityLibraryPageRouteSearch,
  buildActivityLibraryRouteSearch,
  buildActivityLibraryValidatedSearch,
  isActivityTemplateType,
  normalizeActivityLibrarySearch,
  parseActivityLibraryStatus,
  parseActivityTemplateFilter,
  parseCreateActivityTemplateSearch,
} from '@/activities/library-filters';
import {
  buildActivityDraftPrompt,
  buildGenerateActivityDraftInputFromEditor,
  createActivityInputFromAiDraft,
  createFallbackActivityDraft,
  createFallbackActivityDraftResult,
  type AiActivityDraft,
} from '@/activities/ai-draft';
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
} from '@/activities/duplicate';
import {
  ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
  DEFAULT_ACTIVITY_DRAFT_SOURCE,
  buildActivitySourceMaterialDraftNotes,
  getActivityDraftSourceText,
} from '@/activities/draft-source';
import {
  buildActivityDraftMeta,
  buildActivityDraftMetaSummaryView,
  buildActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
import {
  buildActivitySourceMaterialSummaryView,
  summarizeActivitySourceMaterials,
} from '@/activities/material-summary';
import {
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  buildActivityMaterialReferenceFromUserFile,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import {
  activityEditPageCopy,
  assertActivityCanEdit,
  assertActivityCanDeriveWork,
  buildActivityDerivativeActionGate,
  buildActivityEditAccessView,
  buildActivityLifecycleActionView,
  canEditActivity,
  canDeriveActivityWork,
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
  getActivityRunnerKindCopy,
  getActivityTemplateRunnerCopy,
} from '@/activities/runner-copy';
import { normalizeListeningSpeechLanguage } from '@/activities/listening-speech';
import {
  getActivityTemplateDraftGuidance,
  buildTemplateRemixSummary,
  formatTemplateRequirementList,
  formatTemplateRequirement,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import {
  buildTemplateCreateSearch,
  buildTemplateEntryAction,
  buildWorksheetHeroActions,
  buildWorksheetModeEntryAction,
} from '@/activities/template-entry';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import {
  buildActivityContent,
  createActivityInputSchema,
} from '@/activities/validation';
import {
  activityContentToEditorInput,
  getActivityEditorDefaultInput,
  buildActivityEditorInitialValues,
  buildActivityEditorPreviewPanel,
  buildActivityEditorPreviewSeed,
  buildActivityEditorTemplateSetupView,
  buildActivityEditorTemplateReadiness,
} from '@/activities/editor';
import { buildQuestionOptionTexts } from '@/activities/question-options';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import { getWorksheetModeDefinitions } from '@/activities/worksheet-modes';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import { getAcceptedAnswers, matchAnswer } from '@/activities/answer-matching';
import {
  buildDashboardCoreLoopReadiness,
  buildDashboardOverviewMetrics,
  dashboardOverviewPageCopy,
  formatDashboardMetricValue,
  getDashboardOverviewActionCards,
} from '@/dashboard/overview';
import { buildDashboardPaginationView } from '@/dashboard/pagination';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import {
  summarizeAssignmentAttempts,
  summarizeAssignmentAttemptsByAssignmentId,
} from '@/assignments/attempt-stats';
import {
  buildAttemptStartedAt,
  buildAttemptTimerState,
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
} from '@/assignments/attempt-duration';
import {
  buildAssignmentAttemptUsage,
  canUseAnotherAssignmentAttempt,
} from '@/assignments/attempt-limits';
import {
  buildInlineBlankPromptView,
  buildExclusiveChoiceAnswerChanges,
  buildPublicAnswerFeedbackView,
  buildRuntimeChoiceViews,
  buildSequentialRunnerView,
  buildStudentRunnerHeaderView,
  buildStudentRunnerView,
  findChoiceOwner,
  formatSequentialRunnerItemLabel,
  getUniqueRuntimeChoices,
  isSameRuntimeChoice,
} from '@/assignments/student-runner-view';
import {
  buildAssignmentDeliverySummary,
  buildAssignmentSettingsSummaryView,
  buildPublicAssignmentRuleSummary,
  buildPublicAssignmentRuleSummaryFromSettings,
  formatAssignmentDeliveryPolicyText,
  formatAssignmentExpiry,
  formatAssignmentItemCount,
} from '@/assignments/delivery-summary';
import {
  buildOpenPublicAssignmentPayload,
  buildPublicAssignmentLookupResult,
  buildPublicAssignmentPayload,
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  buildPublicAttemptReviewItems,
  buildPublicAttemptReviewItemMap,
  stripRuntimeAnswer,
  stripRuntimeAnswers,
} from '@/assignments/public';
import {
  buildAssignmentListPageRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
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
  buildStarterAssignmentListCardViewModel,
  getAssignmentListCardActionState,
  getAssignmentListEmptyState,
} from '@/assignments/list-view';
import {
  assertAssignmentAcceptsSubmissions,
  assertAssignmentStatusTransition,
  buildAssignmentStatusAction,
  getAssignmentLifecycleStatus,
  getAssignmentSubmissionErrorMessage,
  getAssignmentStatusActionCopy,
  getAssignmentStatusLabel,
  isAssignmentOpen,
  matchesAssignmentLifecycleStatus,
} from '@/assignments/lifecycle';
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
  assignmentResultActionOrder,
  buildAttemptReviewSubmissionSummary,
  buildAssignmentAttemptAnswerReviewView,
  buildAssignmentAttemptReviewCardView,
  buildAssignmentAttemptRowDisplay,
  buildAssignmentClassroomBriefFocusItemView,
  buildAssignmentClassroomBriefFollowUpStudentView,
  buildAssignmentItemAnalysisCardView,
  buildAssignmentItemPerformanceRowView,
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionPayload,
  buildAssignmentResultActionState,
  buildAssignmentResultCopyText,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultHeaderView,
  buildAssignmentResultHeaderShareAction,
  buildAssignmentResultMetricItems,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultSearchState,
  buildAssignmentResultSectionState,
  buildAssignmentResultViewModel,
  buildAssignmentStudentSummaryRowView,
  buildAssignmentResultEmptyState,
  attemptReviewFilterOptions,
  buildFilteredAttemptRows,
  buildResultSearchSummary,
  filterAndSortStudentSummaries,
  filterAttemptReviews,
  formatAssignmentAttemptReviewBadge,
  formatAssignmentBriefStudentAccuracy,
  formatAssignmentItemCorrectSummary,
  formatAssignmentResultFraction,
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
  formatAssignmentReviewCount,
  getAssignmentAnswerReviewStatus,
  itemPerformanceSortOptions,
  getAssignmentResultActionCopy,
  getAssignmentResultActionGate,
  getAssignmentResultActionGateFromState,
  matchesResultSearch,
  normalizeResultSearch,
  parseAttemptReviewFilter,
  parseItemPerformanceSort,
  parseStudentSummarySort,
  resolveAssignmentResultViewState,
  studentSummarySortOptions,
  sortItemPerformance,
  sortStudentSummaries,
} from '@/assignments/result-view';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultValue,
  formatAssignmentResultDate,
  formatOptionalAcceptedAnswerAlternatives,
} from '@/assignments/result-format';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryAttemptCount,
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryCorrectRate,
  formatAssignmentSummaryItemPerformance,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import {
  getSubmittedAssignmentReviewPriorityItems,
  sortAssignmentItemsByReviewPriority,
} from '@/assignments/review-priority';
import {
  getAssignmentStudentFollowUpPriorityStudents,
  sortAssignmentStudentsByFollowUpPriority,
} from '@/assignments/student-follow-up-priority';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  buildAssignmentResultsCsv,
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
  isSameAssignmentShareSlug,
  normalizeAssignmentShareSlug,
} from '@/assignments/share-slug';
import {
  assignmentPublishDialogCopy,
  assignmentPublishToggleOptions,
  buildAssignmentPublishDraft,
  buildAssignmentPublishDraftDefaults,
  buildAssignmentPublishDialogState,
  buildAssignmentPublishPreviewFromDraft,
  buildAssignmentPublishInputFromDraft,
  buildAssignmentPublishToggleViews,
  formatAssignmentDateTimeLocal,
  parseAssignmentDateTimeLocal,
  parseOptionalWholeNumber,
  validateAssignmentPublishDraft,
} from '@/assignments/publish-input';
import { buildAssignmentStudentFollowUpSummary } from '@/assignments/student-follow-up-summary';
import {
  buildAnonymousAttemptTokenStorageKey,
  getAnonymousBrowserLabel,
  getOrCreateAnonymousAttemptToken,
} from '@/assignments/identity';
import {
  countMatchingStudentIdentityAttempts,
  resolveAttemptIdentityCountStrategy,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import {
  buildStudentRunnerAttemptState,
  buildStudentRunnerPageState,
  buildStudentRunnerReadyState,
} from '@/assignments/student-runner-state';
import {
  buildAttemptCompletionCopy,
  buildAnonymousAttemptCopy,
  buildAttemptSubmissionAnswers,
  buildStudentAttemptControlState,
  buildStudentAttemptResultDisplay,
  buildStudentAttemptSubmissionInput,
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
  resolveStudentAttemptAnonymousToken,
} from '@/assignments/student-submission';
import { resolveAssignmentSettings } from '@/assignments/validation';
import {
  getUserFileExtension,
  resolveUserFileMaterialKind,
} from '@/storage/file-materials';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';
import { buildUserFileMaterialSummary } from '@/storage/file-summary';
import { buildAttachmentContentDisposition } from '@/storage/content-disposition';
import { STORAGE_ERROR_CODES, UploadError } from '@/storage/types';
import type { RuntimeItem } from '@/activities/runtime';

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
const adminUserDetailViewerSource = readFileSync(
  'src/components/admin/users/user-detail-viewer.tsx',
  'utf8'
);
const useAuthSource = readFileSync('src/hooks/use-auth.ts', 'utf8');
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
assert.deepEqual(sourceMaterialSummary.kindSummaries, [
  { count: 1, kind: 'audio' },
  { count: 2, kind: 'worksheet-document' },
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
    hasMaterials: true,
    kindBadges: [
      { count: 1, kind: 'audio', label: 'Audio' },
      {
        count: 1,
        kind: 'worksheet-document',
        label: 'Worksheet document',
      },
    ],
    title: 'Source materials',
  }
);
assert.deepEqual(buildActivitySourceMaterialSummaryView([]), {
  countLabel: '0 files',
  hasMaterials: false,
  kindBadges: [],
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
assert.equal(
  buildActivitySourceMaterialDraftNotes([whitespaceMaterialReference]),
  'Attached classroom source materials:\n- Worksheet document: Worksheet Scan 1.pdf'
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
assert.match(robotsRouteSource, /['"]\/learn['"]/);
assert.match(robotsRouteSource, /['"]\/hsk['"]/);
assert.match(robotsRouteSource, /['"]\/hanzi['"]/);
for (const retiredStubRoute of [
  '/about',
  '/ai',
  '/changelog',
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
assert.doesNotMatch(sitemapRouteSource, /Routes\.PlayDemo/);
assert.doesNotMatch(routeConstantsSource, /['"]\/play\/demo-food['"]/);
assert.equal(isLocalizedPath('/worksheets'), true);
assert.equal(isLocalizedPath('/play/demo-food'), false);
assert.equal(
  Routes.PlayDemo,
  buildAssignmentSharePath(STARTER_FOOD_ASSIGNMENT_SHARE_ID)
);
const playRouteSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');
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

assert.equal(isStudentAnswerFilled(undefined), false);
assert.equal(isStudentAnswerFilled('   '), false);
assert.equal(isStudentAnswerFilled(' answer '), true);
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
      { anonymousToken: 'anonymous-token-1', studentName: null },
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
  buildPublicAnswerFeedbackView({
    correctAnswerLabel: 'Correct match',
    reviewItem: {
      acceptedAnswers: ['Paris', 'Paris, France'],
      correct: false,
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital of France.',
      itemId: 'item-1',
    },
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersText: 'Paris | Paris, France',
    correctAnswer: 'Paris',
    correctAnswerLabel: 'Correct match',
    explanation: 'Paris is the capital of France.',
    explanationLabel: 'Why',
    status: 'needs-review',
    statusLabel: 'Needs review',
  }
);
assert.deepEqual(
  buildPublicAnswerFeedbackView({
    reviewItem: {
      acceptedAnswers: ['Mitochondria'],
      correct: true,
      correctAnswer: 'Mitochondria',
      itemId: 'item-2',
    },
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersText: null,
    correctAnswer: 'Mitochondria',
    correctAnswerLabel: 'Correct answer',
    explanation: null,
    explanationLabel: 'Why',
    status: 'correct',
    statusLabel: 'Correct',
  }
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
  buildStudentAttemptSessionKey({
    runtimeItems: submissionRuntimeItems,
    shareSlug: ' share-one ',
  }),
  '["share-one",["item-1","item-2","item-3"]]'
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
    { answer: ' apple ', itemId: 'item-1' },
    { answer: '   ', itemId: 'item-2' },
    { answer: '', itemId: 'item-3' },
  ]
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
    previousAttemptCount: 3,
  }),
  {
    maxAttempts: undefined,
    remainingAttempts: undefined,
    usedAttempts: 4,
  }
);
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
      { answer: ' apple ', itemId: 'item-1' },
      { answer: '   ', itemId: 'item-2' },
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
    collectStudentName: false,
    runtimeItems: submissionRuntimeItems,
    shareSlug: 'share-two',
    anonymousToken: ' anonymous-token-1 ',
    studentName: 'Stale Name',
  }),
  {
    anonymousToken: 'anonymous-token-1',
    answers: [
      { answer: ' apple ', itemId: 'item-1' },
      { answer: '   ', itemId: 'item-2' },
      { answer: '', itemId: 'item-3' },
    ],
    shareSlug: 'share-two',
  }
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
assert.equal(
  orderAssignmentRuntimeItems({
    items: submissionRuntimeItems,
    shareSlug: 'share-1',
    shuffleItems: false,
  }),
  submissionRuntimeItems
);
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
  buildAssignmentShareUrl('abc 123', 'https://classgamify.test/'),
  'https://classgamify.test/play/abc%20123'
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
assert.deepEqual(
  buildAssignmentPublishPreviewFromDraft({
    activityId: 'activity-1',
    collectStudentName: false,
    expiresAtLocal: '2026-01-10T09:30',
    instructions: '  Finish before class.  ',
    maxAttempts: '３',
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitMinutes: '１５',
    title: 'Week 1 review',
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
      maxAttempts: undefined,
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
      maxAttempts: undefined,
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
    maxAttempts: undefined,
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
    maxAttempts: undefined,
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
    instructions: '  Finish before class.  ',
    maxAttempts: '3',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitMinutes: '15',
    title: '  Week 1 review  ',
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
        maxAttempts: undefined,
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
      title: 'Week 2',
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
  { id: 'attempts', label: 'Attempts', value: 'Open' },
  { id: 'timer', label: 'Timer', value: 'No timer' },
  { id: 'closes', label: 'Closes', value: 'No close time' },
  { id: 'identity', label: 'Student identity', value: 'Names' },
  { id: 'answerReveal', label: 'Answer reveal', value: 'After submit' },
  { id: 'itemOrder', label: 'Item order', value: 'Shuffled' },
]);
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
assert.equal(formatAssignmentItemCount(1), '1 item');
assert.equal(formatAssignmentItemCount(3), '3 items');
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
    { id: 'items', label: 'Items', value: '1 item' },
    { id: 'attempts', label: 'Attempts', value: '2 max' },
    { id: 'timer', label: 'Timer', value: '1 min' },
    { id: 'closes', label: 'Closes', value: 'No close time' },
    { id: 'identity', label: 'Student identity', value: 'Anonymous' },
    { id: 'answerReveal', label: 'Review', value: 'Hidden' },
  ]
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
    { id: 'items', label: 'Items', value: '2 items' },
    { id: 'attempts', label: 'Attempts', value: '3 max' },
    { id: 'timer', label: 'Timer', value: '2 min' },
    { id: 'closes', label: 'Closes', value: 'No close time' },
    { id: 'identity', label: 'Student identity', value: 'Names' },
    { id: 'answerReveal', label: 'Review', value: 'After submit' },
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
    { id: 'items', label: 'Items', value: '4 items' },
    { id: 'attempts', label: 'Attempts', value: '2 max' },
    { id: 'timer', label: 'Timer', value: 'No timer' },
    { id: 'closes', label: 'Closes', value: 'No close time' },
    { id: 'identity', label: 'Student identity', value: 'Anonymous' },
    { id: 'answerReveal', label: 'Review', value: 'Hidden' },
  ]
);
assert.deepEqual(
  buildStudentRunnerHeaderView({
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
      title: 'Public assignment',
    },
    itemCount: 2,
  }),
  {
    description:
      "This public assignment loads from the teacher share link, collects answers, and scores against the teacher's frozen assignment snapshot.",
    instructions: {
      label: 'Student instructions',
      value: 'Read each prompt carefully.',
    },
    ruleItems: [
      { id: 'items', label: 'Items', value: '2 items' },
      { id: 'attempts', label: 'Attempts', value: '3 max' },
      { id: 'timer', label: 'Timer', value: '2 min' },
      { id: 'closes', label: 'Closes', value: 'No close time' },
      { id: 'identity', label: 'Student identity', value: 'Names' },
      { id: 'answerReveal', label: 'Review', value: 'After submit' },
    ],
    teacherActionLabel: 'Teacher view',
    title: 'Public assignment',
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
    title: 'Public assignment',
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
assert.equal(publicAssignmentPayload.activity.title, 'Frozen activity title');
assert.equal(
  publicAssignmentPayload.activity.description,
  'Frozen activity description'
);
assert.equal(publicAssignmentPayload.summary.subject, 'History');
assert.equal(publicAssignmentPayload.summary.gradeBand, 'Grade 4');
assert.equal(publicAssignmentPayload.summary.itemCount, 1);
assert.equal(publicAssignmentPayload.summary.estimatedMinutes, 5);
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
assert.deepEqual(publicAssignmentPayload.snapshot, {
  activityDescription: 'Frozen activity description',
  activityTitle: 'Frozen activity title',
  templateType: 'quiz',
});
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

  assert.equal(payload.assignment.shareSlug, `share-${templateType}`);
  assert.equal(payload.runtimeItems.length, runtimeItems.length);
  payload.runtimeItems.forEach((item, index) => {
    assert.deepEqual(Object.keys(item).sort(), [
      'choices',
      'id',
      'kind',
      'prompt',
    ]);
    assert.equal('answer' in item, false);
    assert.equal('explanation' in item, false);
    assert.deepEqual(item.choices, runtimeItems[index]?.choices);
  });
}
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
  },
  {
    acceptedAnswers: ['Cold'],
    correct: false,
    correctAnswer: 'Cold',
    itemId: 'pair-1',
  },
]);
assert.equal(publicReviewMap.get('q-1')?.correctAnswer, 'Paris');
assert.equal(publicReviewMap.get('pair-1')?.correct, false);
assert.equal(publicReviewMap.get('missing'), undefined);
assert.equal(buildPublicAttemptReviewItemMap(undefined).size, 0);
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
    },
  ]
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
assert.deepEqual(
  buildActivityLibraryValidatedSearch({
    created: ' activity-1 ',
    page: '4',
    q: '  Ｇｒｏｕｐ   １  ',
    status: 'archived',
    template: 'group-sort',
  }),
  {
    created: 'activity-1',
    page: 4,
    q: 'Group 1',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.deepEqual(
  buildActivityLibraryValidatedSearch({
    created: '   ',
    page: '1',
    q: '   ',
    status: 'deleted',
    template: 'flashcards',
  }),
  {
    created: undefined,
    page: undefined,
    q: undefined,
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 1,
    q: '  word   match  ',
    status: 'active',
    template: 'all',
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: 'word match',
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 3,
    q: ' sort ',
    status: 'archived',
    template: 'group-sort',
  }),
  {
    created: 'activity-1',
    page: 3,
    q: 'sort',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.deepEqual(
  buildActivityLibraryPageRouteSearch({
    current: {
      created: 'activity-1',
      q: '  word   match  ',
      status: 'active',
      template: 'all',
    },
    page: 0,
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: 'word match',
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryPageRouteSearch({
    current: {
      created: 'activity-1',
      q: ' sort ',
      status: 'archived',
      template: 'group-sort',
    },
    page: 5,
  }),
  {
    created: 'activity-1',
    page: 5,
    q: 'sort',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.equal(parseActivityLibraryStatus('archived'), 'archived');
assert.equal(parseActivityLibraryStatus('deleted'), undefined);
assert.equal(parseActivityTemplateFilter('group-sort'), 'group-sort');
assert.equal(parseActivityTemplateFilter('flashcards'), undefined);
assert.equal(parseCreateActivityTemplateSearch('line-match'), 'line-match');
assert.equal(parseCreateActivityTemplateSearch('worksheet'), undefined);
assert.equal(parseCreateActivityTemplateSearch(['quiz']), undefined);
assert.equal(isActivityTemplateType('open-box'), true);
assert.equal(isActivityTemplateType('memory-game'), false);
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
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const template = getTemplateByType(templateType);

  assert.equal(template.type, templateType);
  assert.ok(template.name.length > 0);
  assert.ok(template.contentRequirements.length > 0);
}
assert.deepEqual(
  getWorksheetModeDefinitions().map((mode) => mode.template),
  ['fill-blank', 'line-match', 'listening', 'group-sort']
);
assert.equal(
  getWorksheetModeDefinitions().every((mode) =>
    isActivityTemplateType(mode.template)
  ),
  true
);
assert.equal(
  getWorksheetModeDefinitions().every(
    (mode) => mode.action.length > 0 && mode.description.length > 0
  ),
  true
);
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
    label: 'Create fill-blank',
    search: { template: 'fill-blank' },
    template: 'fill-blank',
  },
  {
    label: 'Start line match',
    search: { template: 'line-match' },
    template: 'line-match',
  },
]);
assert.deepEqual(
  buildWorksheetHeroActions(
    getWorksheetModeDefinitions().filter(
      (mode) => mode.template !== 'line-match'
    )
  )[1],
  {
    label: 'Create line-match',
    search: { template: 'line-match' },
    template: 'line-match',
  }
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
      label: '创建line-match',
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
    assignmentSummary: {
      averageScore: Number.NaN,
      completions: 1,
      openAssignments: 1,
    },
    isLoading: false,
  })[3]?.value,
  '-'
);
assert.deepEqual(buildDashboardCoreLoopReadiness(), [
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
    value: 85,
  },
  {
    id: 'teacher-results',
    label: 'Teacher results',
    value: 90,
  },
]);
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
assert.deepEqual(
  getDashboardOverviewActionCards().map((card) => [
    card.id,
    card.title,
    card.cta,
  ]),
  [
    ['activities', 'Activities', 'Open activities'],
    ['assignments', 'Assignments', 'Open assignments'],
    ['student-preview', 'Student preview', 'Preview play route'],
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
assert.equal(starterActivityDisplayView.statusLabel, 'Draft');
assert.deepEqual(starterActivityDisplayView.stats, [
  { key: 'questions', label: 'Questions', value: 3 },
  { key: 'pairs', label: 'Pairs', value: 4 },
  { key: 'groups', label: 'Groups', value: 2 },
]);
assert.deepEqual(starterActivityDisplayView.sourceMaterials, {
  countLabel: '0 files',
  hasMaterials: false,
  kindBadges: [],
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
    hasMaterials: true,
    kindBadges: [{ count: 1, kind: 'audio', label: 'Audio' }],
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
  'Archived'
);
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
assert.equal(buildActivityLibraryRemixHint([]), undefined);
assert.equal(buildActivityLibraryRemixActionLabel('Fill'), 'Copy as Fill');
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
    { id: 'average', label: 'Average', value: '0%' },
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
      shareSlug: 'share-1',
      status: 'published',
      title: 'Persisted assignment',
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
      description: 'Starter activity description',
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
      shareId: 'demo-food',
      status: 'published',
      title: 'Food words homework',
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
    statusLabel: 'Open',
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
assert.equal(buildActivityEditorInitialValues(undefined), undefined);
assert.deepEqual(buildActivityEditorInitialValues('group-sort'), {
  ...activityEditorDefaultInput,
  ...getActivityTemplateScaffold('group-sort'),
  templateType: 'group-sort',
  visibility: 'draft',
});
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
    contentJson: questionOnlyContent,
    templateType: 'quiz',
    visibility: 'draft',
  },
  {
    contentJson: completeScaffoldContent,
    templateType: 'group-sort',
    visibility: 'archived',
  },
]);
assert.equal(librarySummary.totalActivities, 2);
assert.equal(librarySummary.draftActivities, 1);
assert.equal(librarySummary.archivedActivities, 1);
assert.equal(librarySummary.templateCoverage, 2);
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
    { id: 'readyModes', label: 'Ready modes', value: '0' },
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
      id: 'readyModes',
      label: 'Ready modes',
      value: String(librarySummary.totalReadyTemplateOptions),
    },
  ]
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: true,
    summary: {
      archivedActivities: 0,
      draftActivities: 0,
      remixReadyActivities: Number.NaN,
      templateCoverage: -1,
      templateCoverageTotal: Number.POSITIVE_INFINITY,
      totalActivities: Number.NaN,
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
      id: 'readyModes',
      label: 'Ready modes',
      value: '0',
    },
  ]
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
assert.equal(
  buildDuplicatedActivityTitle('  Food words quick check  '),
  'Copy of Food words quick check'
);
assert.equal(buildDuplicatedActivityTitle('   '), 'Copy of Untitled activity');
assert.equal(buildDuplicatedActivityTitle('A'.repeat(200)).length, 120);
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
  120
);
assert.equal(
  buildRemixedActivityTitle({
    sourceTitle: 'A'.repeat(200),
    targetShortName: 'Match',
  }),
  `${'A'.repeat(109)}... (Match)`
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
    itemCount: 11,
    sourceText: 'food, apple, bread, milk',
  })
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
assert.equal(fallbackDraftMetaSummary.modelName, 'test-model');
assert.equal(fallbackDraftMetaSummary.notice, 'Fallback used for testing.');
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
    diagnosis: undefined,
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
    meta: {
      ...fallbackDraftMeta,
      readyTemplateCount: 1,
    },
    model: 'test-model',
    provider: 'workers-ai',
  }).readyTemplateLabel,
  '1 ready template'
);
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
assert.throws(() =>
  createActivityInputFromAiDraft({
    draft: {
      ...spacedAiDraft,
      teacherNotes: [],
    },
    input: {
      ...aiDraftInputBase,
      templateType: 'quiz',
    },
  })
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
assert.doesNotMatch(materialDraftSourceText, /r2Key|userfiles\/|fileId/);
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

assert.doesNotThrow(() =>
  assertSubmittedAnswersMatchRuntimeItems({
    answers: [{ itemId: 'item-1' }, { itemId: 'item-3' }],
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

assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: undefined,
    timeLimitSeconds: 60,
  }),
  undefined
);
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
  formatAcceptedAnswerAlternatives([
    ' Paris ',
    '',
    'paris',
    'Ｐａｒｉｓ',
    'Paris, France',
  ]),
  'Paris, Paris, France'
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
assert.equal(formatAssignmentResultValue(''), '-');
assert.equal(formatAssignmentResultValue('   '), '-');
assert.equal(formatAssignmentResultValue(' Paris '), 'Paris');
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
  formatAssignmentSummaryItemPerformance({
    correctCount: 2,
    correctRate: 67,
    submittedCount: 3,
  }),
  '67% correct, 2/3'
);
assert.equal(formatAssignmentSummaryReviewItemCount(1), '1 item to review');
assert.equal(formatAssignmentSummaryReviewItemCount(2), '2 items to review');
assert.equal(formatAssignmentSummaryAttemptCount(1), '1 attempt');
assert.equal(formatAssignmentSummaryAttemptCount(2), '2 attempts');
assert.deepEqual(summarizeAssignmentAttempts([]), {
  averageDurationSeconds: 0,
  averagePoints: 0,
  averageScore: 0,
  completions: 0,
});
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
    averageScore: 38,
    completions: 4,
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
  buildAssignmentItemAnalysisCardView(resultAnalysis.perItem[0]!),
  {
    acceptedAnswersLabel: 'Accepted',
    acceptedAnswersText: 'Paris, Paris, France',
    correctRateLabel: '67%',
    correctRateProgressValue: 67,
    correctSummaryLabel: '2/3 correct',
    expectedAnswerLabel: 'answer',
    expectedAnswerText: 'Paris / Paris, France',
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
    acceptedAnswersText: null,
    correctRateLabel: '50%',
    correctRateProgressValue: 50,
    correctSummaryLabel: '1/2 correct',
    expectedAnswerLabel: 'answer',
    expectedAnswerText: '-',
    explanationText: null,
    kindLabel: 'Pair',
    prompt: 'Match "Hot" with its pair.',
  }
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
    acceptedAnswersText: 'Paris, Paris, France',
    correctRateLabel: '67%',
    expectedAnswerText: 'Paris / Paris, France',
    explanationText: 'Paris is the capital of France.',
    itemNumberLabel: '1.',
    kindLabel: 'Question',
    prompt: 'Capital of France?',
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
    expectedAnswerText: '-',
    explanationText: '-',
    itemNumberLabel: '1.',
    kindLabel: 'Pair',
    prompt: 'Match "Hot" with its pair.',
    submittedLabel: '1/2',
  }
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
    acceptedAnswersText: 'Paris, Paris, France',
    expectedAnswerLabel: 'Expected',
    expectedAnswerText: 'Paris / Paris, France',
    explanationText: 'Paris is the capital of France.',
    promptLabel: '1. Capital of France?',
    statusLabel: 'Correct',
    statusTone: 'correct',
    studentAnswerLabel: 'Student',
    studentAnswerText: 'paris france',
  }
);
assert.deepEqual(
  buildAssignmentAttemptAnswerReviewView({
    answer: {
      ...resultAnalysis.attempts[0]!.answers[1]!,
      acceptedAnswers: ['Cold'],
      answer: '',
      expectedAnswer: '',
      explanation: '',
    },
    index: -3,
  }),
  {
    acceptedAnswersLabel: 'Accepted answers',
    acceptedAnswersText: null,
    expectedAnswerLabel: 'Expected',
    expectedAnswerText: '-',
    explanationText: null,
    promptLabel: '1. Match "Hot" with its pair.',
    statusLabel: 'Review',
    statusTone: 'review',
    studentAnswerLabel: 'Student',
    studentAnswerText: '-',
  }
);
assert.equal(resultAnalysis.attempts[0]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[1]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[2]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.latestAccuracy, 0);
assert.equal(resultAnalysis.students[1]?.studentKey, 'name:alice');
assert.equal(resultAnalysis.students[1]?.attempts, 2);
assert.equal(resultAnalysis.students[1]?.averageAccuracy, 75);
assert.equal(resultAnalysis.students[1]?.bestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.latestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.needsReviewCount, 0);
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
    studentLabel: 'Anonymous student 2',
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
assert.deepEqual(
  studentSummarySortOptions.map((option) => option.value),
  ['needs-review', 'best', 'name', 'attempts']
);
assert.deepEqual(
  itemPerformanceSortOptions.map((option) => option.value),
  ['original', 'accuracy', 'submitted', 'type']
);
assert.deepEqual(
  attemptReviewFilterOptions.map((option) => option.value),
  ['all', 'needs-review']
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
      title: 'Week 1 results',
    },
    now: new Date('2026-06-01T00:00:00.000Z').getTime(),
    snapshot: {
      activityDescription: 'Snapshot description',
      activityTitle: 'Snapshot title',
      templateType: 'line-match',
    },
  }),
  {
    activityDescription: 'Snapshot description',
    activityTitle: 'Snapshot title',
    assignmentSharePath: '/play/share%20123',
    assignmentTitle: 'Week 1 results',
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
    scoreLabel: '3/4',
    studentLabel: 'Alice',
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
    scoreLabel: '0/0',
    studentLabel: 'Ava Chen',
    submittedAtLabel: '-',
  }
);
assert.deepEqual(getAssignmentAnswerReviewStatus(true), {
  label: 'Correct',
  tone: 'correct',
});
assert.deepEqual(getAssignmentAnswerReviewStatus(false), {
  label: 'Review',
  tone: 'review',
});
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
    completedAt: attemptRowCompletedAt,
    score: 2,
    studentLabel: 'Alice',
  }),
  {
    badgeLabel: '2 pts · 67%',
    studentLabel: 'Alice',
    submittedAtLabel: formatAssignmentResultDate(attemptRowCompletedAt),
  }
);
assert.deepEqual(
  buildAssignmentAttemptReviewCardView({
    accuracy: 0,
    completedAt: null,
    score: 0,
    studentLabel: 'Anonymous student',
  }),
  {
    badgeLabel: '0 pts · 0%',
    studentLabel: 'Anonymous student',
    submittedAtLabel: '-',
  }
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
assert.equal(formatAssignmentResultFraction(2, 5), '2/5');
assert.equal(formatAssignmentResultFraction(-1, 5), '0/5');
assert.equal(formatAssignmentResultFraction(2.5, 5), '2.5/5');
assert.equal(formatAssignmentResultFraction(Number.NaN, 5), '-');
assert.equal(formatAssignmentResultFraction(2, Number.POSITIVE_INFINITY), '-');
assert.equal(formatAssignmentResultNumber(2.5), '2.5');
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
assert.deepEqual(
  buildAssignmentResultRouteSearch({
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'attempts',
  }),
  {
    itemSort: 'submitted',
    review: 'needs-review',
    sort: 'attempts',
  }
);
assert.deepEqual(
  buildAssignmentResultRouteSearch({
    itemSort: 'original',
    review: 'all',
    sort: 'needs-review',
  }),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
  }
);
assert.deepEqual(
  buildAssignmentResultRouteSearch({
    itemSort: 'random',
    review: 'done',
    sort: ['best'],
  }),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
  }
);
assert.deepEqual(resolveAssignmentResultViewState({}), {
  attemptReviewFilter: 'all',
  itemPerformanceSort: 'original',
  studentSort: 'needs-review',
});
assert.deepEqual(
  resolveAssignmentResultViewState({
    itemSort: 'type',
    review: 'needs-review',
    sort: 'name',
  }),
  {
    attemptReviewFilter: 'needs-review',
    itemPerformanceSort: 'type',
    studentSort: 'name',
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {},
    next: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
    },
  }),
  {
    itemSort: 'accuracy',
    review: 'needs-review',
    sort: 'best',
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
    },
    next: {
      itemSort: 'original',
      review: 'all',
      sort: 'needs-review',
    },
  }),
  {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
  }
);
assert.deepEqual(
  buildAssignmentResultSearchState({
    current: {
      itemSort: 'submitted',
      review: 'needs-review',
      sort: 'attempts',
    },
    next: {
      review: 'all',
    },
  }),
  {
    itemSort: 'submitted',
    review: undefined,
    sort: 'attempts',
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      review: 'needs-review',
      sort: 'best',
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
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'attempts',
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
  }
);
assert.deepEqual(
  buildAssignmentResultControlSearchState({
    current: {
      itemSort: 'accuracy',
      review: 'needs-review',
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
  getAssignmentStudentFollowUpPriorityStudents(followUpPriorityStudents, {
    limit: 2,
  }).map((student) => student.studentLabel),
  ['Alpha review', 'More review']
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
assert.deepEqual(
  getSubmittedAssignmentReviewPriorityItems(reviewPriorityItems, {
    limit: 2,
  }).map((item) => item.itemId),
  ['tie-more-submitted', 'tie-fewer-submitted']
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
assert.equal(
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
assert.match(csv, /"Paris \| Paris, France","correct"/);
assert.match(csv, /"Paris is the capital of France\."/);
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
  'classgamify-capital-review-week-1-results.csv'
);
assert.equal(
  buildAssignmentResultsCsvFilename({
    ...csvExportData,
    assignment: {
      ...csvExportData.assignment,
      title: '三年级｜听力复习 Ａ 班',
    },
  }),
  'classgamify-三年级-听力复习-a-班-results.csv'
);
assert.equal(
  buildAssignmentResultsCsvFilename({
    ...csvExportData,
    assignment: {
      ...csvExportData.assignment,
      title: 'A '.repeat(120),
    },
  }),
  `classgamify-${`${'a-'.repeat(39)}a`}-results.csv`
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
assert.deepEqual(
  buildAssignmentClassroomBriefFocusItemView({
    index: 0,
    item: classroomBrief.focusItems[0]!,
  }),
  {
    correctRateLabel: '50%',
    correctSummaryLabel: '1/2 correct',
    itemNumberLabel: '1.',
    prompt: 'Match "Hot" with its pair.',
  }
);
assert.deepEqual(
  buildAssignmentClassroomBriefFollowUpStudentView(
    classroomBrief.followUpStudents[0]!
  ),
  {
    accuracyLabel: 'Latest 0% · best 0%',
    needsReviewLabel: '1 review',
    studentLabel: 'Anonymous student 1',
  }
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

const reteachPlan = buildAssignmentReteachPlan({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
  students: followUpPriorityStudents,
});
assert.match(reteachPlan, /ClassGamify reteach plan: Capital Review, Week 1/);
assert.match(reteachPlan, /Review first:/);
assert.match(reteachPlan, /Student follow-up:/);
assert.match(reteachPlan, /Match "Hot" with its pair\. \(50% correct, 1\/2\)/);
assert.match(
  reteachPlan,
  /Alpha review: 70% latest accuracy, 3 items to review\n- More review: 70% latest accuracy, 3 items to review\n- Lower score: 10% latest accuracy, 1 item to review/
);

const itemReviewSummary = buildAssignmentItemReviewSummary({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
});
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
assert.match(itemReviewSummary, /Expected: Paris \/ Paris, France\./);
assert.match(itemReviewSummary, /Accepted answers: Paris, Paris, France\./);
assert.match(itemReviewSummary, /Notes: Paris is the capital of France\./);

const studentFollowUpSummary = buildAssignmentStudentFollowUpSummary({
  assignmentTitle: csvExportData.assignment.title,
  students: followUpPriorityStudents,
});
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
    assignmentTitle: csvExportData.assignment.title,
    classroomBriefText: classroomBrief.text,
    items: resultAnalysis.perItem,
    students: resultAnalysis.students,
  }),
  classroomBrief.text
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-reteach-plan',
    assignmentTitle: csvExportData.assignment.title,
    items: resultAnalysis.perItem,
    students: followUpPriorityStudents,
  }),
  reteachPlan
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-item-review',
    assignmentTitle: csvExportData.assignment.title,
    items: resultAnalysis.perItem,
    students: resultAnalysis.students,
  }),
  itemReviewSummary
);
assert.equal(
  buildAssignmentResultCopyText({
    action: 'copy-follow-up',
    assignmentTitle: csvExportData.assignment.title,
    items: resultAnalysis.perItem,
    students: followUpPriorityStudents,
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
    assignmentTitle: csvExportData.assignment.title,
    classroomBriefText: classroomBrief.text,
    exportData: csvExportData,
    items: resultAnalysis.perItem,
    students: resultAnalysis.students,
  }),
  {
    kind: 'copy-text',
    text: classroomBrief.text,
  }
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
  assignmentTitle: csvExportData.assignment.title,
  classroomBriefText: classroomBrief.text,
  exportData: csvExportData,
  items: resultAnalysis.perItem,
  students: resultAnalysis.students,
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

console.log('Domain tests passed.');
