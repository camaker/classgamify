import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type InternalHelperDeclaration = {
  declaration: 'const' | 'function';
  filePath: string;
  name: string;
};

type ReExportBoundary = {
  aggregatorFilePath: string;
  name: string;
  sourceFilePath: string;
};

const INTERNAL_PRODUCT_DOMAIN_HELPERS = [
  {
    declaration: 'function',
    filePath: 'src/seo/public-indexing.ts',
    name: 'getRobotsDisallowLines',
  },
  {
    declaration: 'function',
    filePath: 'src/seo/public-indexing.ts',
    name: 'getLocalizedPublicPathVariants',
  },
  {
    declaration: 'function',
    filePath: 'src/seo/public-indexing.ts',
    name: 'escapeSitemapXml',
  },
  {
    declaration: 'function',
    filePath: 'src/seo/web-manifest.ts',
    name: 'getWebAppManifestMaskableIconCount',
  },
  {
    declaration: 'function',
    filePath: 'src/dashboard/overview.ts',
    name: 'buildDashboardOverviewHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/payment/billing-view.ts',
    name: 'resolveSettingsBillingPlan',
  },
  {
    declaration: 'function',
    filePath: 'src/pages/public-page-view.ts',
    name: 'buildHomePageProductLoopHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/pages/public-page-view.ts',
    name: 'buildRoadmapPublicHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/pages/public-page-view.ts',
    name: 'buildTeachersPageHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/pages/public-page-view.ts',
    name: 'buildPricingPageHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/reteach-plan.ts',
    name: 'buildAssignmentReteachPlanItemViews',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/reteach-plan.ts',
    name: 'buildAssignmentReteachPlanStudentViews',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/item-review-summary.ts',
    name: 'buildAssignmentItemReviewSummaryItemViews',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/delivery-summary.ts',
    name: 'formatAssignmentAttempts',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/classroom-brief.ts',
    name: 'buildAssignmentClassroomBriefFocusItemViews',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/classroom-brief.ts',
    name: 'buildAssignmentClassroomBriefFollowUpStudentViews',
  },
  {
    declaration: 'function',
    filePath: 'src/activities/distractors.ts',
    name: 'buildQuestionChoiceReadiness',
  },
  {
    declaration: 'function',
    filePath: 'src/activities/lifecycle.ts',
    name: 'getSameTemplateRemixError',
  },
  {
    declaration: 'const',
    filePath: 'src/activities/library-filters.ts',
    name: 'ACTIVITY_FILTERABLE_SOURCE_MATERIALS',
  },
  {
    declaration: 'function',
    filePath: 'src/activities/editor.ts',
    name: 'buildActivityEditorTemplateHandoffView',
  },
  {
    declaration: 'const',
    filePath: 'src/activities/library-view.ts',
    name: 'activityLibraryActionCopy',
  },
  {
    declaration: 'function',
    filePath: 'src/activities/library-view.ts',
    name: 'resolveActivityLibraryPageSearch',
  },
  {
    declaration: 'function',
    filePath: 'src/activities/library-view.ts',
    name: 'buildActivityLibraryCardStatusSummaryView',
  },
  {
    declaration: 'const',
    filePath: 'src/activities/preview-view.ts',
    name: 'ACTIVITY_PREVIEW_CONTENT_LIMITS',
  },
  {
    declaration: 'const',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'printableWorksheetPageCopy',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'buildPrintableWorksheetHeaderView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'buildPrintableWorksheetHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'buildPrintableWorksheetControlView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'buildPrintableWorksheetAssignmentFieldViews',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'buildPrintableWorksheetEmptyState',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'buildPrintableWorksheetAnswerKeyView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'getPrintableWorksheetAnswerLines',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'formatPrintableWorksheetAcceptedAnswers',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'formatPrintableWorksheetValue',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/printable-worksheet-view.ts',
    name: 'formatPrintableWorksheetAnswerKeyPrompt',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/list-view.ts',
    name: 'resolveAssignmentListPageSearch',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/result-summary-format.ts',
    name: 'normalizeAssignmentSummaryPercent',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/student-follow-up-priority.ts',
    name: 'buildAssignmentStudentFollowUpPriorityHandoffEvidence',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/publish-input.ts',
    name: 'buildAssignmentPublishHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/student-follow-up-summary.ts',
    name: 'buildAssignmentStudentFollowUpSummaryStudentViews',
  },
  {
    declaration: 'const',
    filePath: 'src/assignments/result-view.ts',
    name: 'assignmentResultCopyScopeCopy',
  },
  {
    declaration: 'const',
    filePath: 'src/assignments/result-view.ts',
    name: 'assignmentResultReviewScopeCopy',
  },
  {
    declaration: 'const',
    filePath: 'src/assignments/result-view.ts',
    name: 'assignmentResultReviewStatusCopy',
  },
  {
    declaration: 'const',
    filePath: 'src/assignments/result-view.ts',
    name: 'assignmentResultActionRegionCopy',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/attempt-query.ts',
    name: 'buildAssignmentAttemptWhere',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/student-runner-state.ts',
    name: 'buildStudentRunnerSubmissionContractView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/student-runner-state.ts',
    name: 'buildStudentRunnerSubmissionHandoffView',
  },
  {
    declaration: 'function',
    filePath: 'src/assignments/student-runtime-item-list.ts',
    name: 'buildStudentRuntimeInteractionHandoffView',
  },
] satisfies InternalHelperDeclaration[];

const RESULT_VIEW_REEXPORT_BOUNDARIES = [
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'ATTEMPT_REVIEW_FILTER_VALUES',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'DEFAULT_ATTEMPT_REVIEW_FILTER',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'DEFAULT_ITEM_PERFORMANCE_SORT',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'DEFAULT_STUDENT_SUMMARY_SORT',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'ITEM_PERFORMANCE_SORT_VALUES',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'STUDENT_SUMMARY_SORT_VALUES',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'buildAssignmentResultReviewScope',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'buildAssignmentResultControlRouteSearch',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'buildAssignmentResultSearchState',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'buildFilteredAttemptRows',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'filterAndSortStudentSummaries',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'filterAssignmentResultCompletedAttemptRows',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'filterAttemptReviews',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'matchesResultSearch',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'normalizeResultSearch',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'normalizeResultSearchQuery',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'parseAttemptReviewFilter',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'parseItemPerformanceSort',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'parseResultStudentSearch',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'parseStudentSummarySort',
    sourceFilePath: 'src/assignments/result-filters.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'buildAssignmentResultMaterialHandoffView',
    sourceFilePath: 'src/assignments/result-actions.ts',
  },
  {
    aggregatorFilePath: 'src/assignments/result-view.ts',
    name: 'buildAssignmentResultClassroomBriefStats',
    sourceFilePath: 'src/assignments/result-actions.ts',
  },
] satisfies ReExportBoundary[];

test('product-domain export surface keeps 48 helpers internal', () => {
  assert.equal(INTERNAL_PRODUCT_DOMAIN_HELPERS.length, 48);

  for (const helper of INTERNAL_PRODUCT_DOMAIN_HELPERS) {
    const source = readFileSync(helper.filePath, 'utf8');
    const helperName = escapeRegExp(helper.name);
    const declarationPattern = new RegExp(
      `\\b${helper.declaration}\\s+${helperName}\\b`
    );
    const exportedDeclarationPattern = new RegExp(
      `\\bexport\\s+${helper.declaration}\\s+${helperName}\\b`
    );
    const exportedNamedPattern = new RegExp(
      `\\bexport\\s*\\{[^}]*\\b${helperName}\\b[^}]*\\}`
    );

    assert.match(
      source,
      declarationPattern,
      `${helper.filePath} should keep ${helper.name} as an internal ${helper.declaration}.`
    );
    assert.doesNotMatch(
      source,
      exportedDeclarationPattern,
      `${helper.filePath} should not export ${helper.name} directly.`
    );
    assert.doesNotMatch(
      source,
      exportedNamedPattern,
      `${helper.filePath} should not re-export ${helper.name}.`
    );
  }
});

test('result-view export surface keeps 22 domain helpers on their source modules', () => {
  assert.equal(RESULT_VIEW_REEXPORT_BOUNDARIES.length, 22);

  for (const boundary of RESULT_VIEW_REEXPORT_BOUNDARIES) {
    const aggregatorSource = readFileSync(boundary.aggregatorFilePath, 'utf8');
    const sourceModule = readFileSync(boundary.sourceFilePath, 'utf8');
    const helperName = escapeRegExp(boundary.name);
    const sourceExportPattern = new RegExp(
      `\\bexport\\s+[^\\n;]*\\b${helperName}\\b`
    );
    const aggregatorReExportPattern = new RegExp(
      `\\bexport\\s*\\{[^}]*\\b${helperName}\\b[^}]*\\}\\s*from`
    );

    assert.match(
      sourceModule,
      sourceExportPattern,
      `${boundary.sourceFilePath} should keep ${boundary.name} on the source domain module.`
    );
    assert.doesNotMatch(
      aggregatorSource,
      aggregatorReExportPattern,
      `${boundary.aggregatorFilePath} should not re-export ${boundary.name}.`
    );
  }
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
