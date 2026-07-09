import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type InternalHelperDeclaration = {
  declaration: 'const' | 'function';
  filePath: string;
  name: string;
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
] satisfies InternalHelperDeclaration[];

test('product-domain export surface keeps 40 helpers internal', () => {
  assert.equal(INTERNAL_PRODUCT_DOMAIN_HELPERS.length, 40);

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
