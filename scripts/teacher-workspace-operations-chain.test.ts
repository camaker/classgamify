import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildDashboardOverviewPageViewModel } from '@/dashboard/overview';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DASHBOARD_OVERVIEW_SOURCE = readFileSync(
  'src/dashboard/overview.ts',
  'utf8'
);
const ACTIVITY_LIBRARY_SOURCE = readFileSync(
  'src/activities/library-view.ts',
  'utf8'
);
const ACTIVITY_LIBRARY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const ASSIGNMENT_LIST_SOURCE = readFileSync(
  'src/assignments/list-view.ts',
  'utf8'
);
const ASSIGNMENT_LIST_QUERY_SOURCE = readFileSync(
  'src/assignments/list-query.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('teacher workspace operations chain preserves docs product boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /authenticated teacher dashboard should use owner-scoped activity and[\s\S]*assignment summaries for top metrics[\s\S]*starter\/demo activities may appear as[\s\S]*preview content[\s\S]*must not be counted as the teacher's real library,[\s\S]*open links, or results/i,
    'docs/product.md should keep dashboard metrics owner-scoped and starter previews out of real counts.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /activity library should stay usable as a teacher's collection grows[\s\S]*search their own activities[\s\S]*same authenticated list contract powers[\s\S]*search never broadens beyond the current owner/i,
    'docs/product.md should keep activity library search owner-scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Activity library overview cards summarize[\s\S]*full current filter result,[\s\S]*not only the visible page/i,
    'docs/product.md should keep activity library overview summaries full-filter scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /assignment list should remain searchable[\s\S]*filter their own assignments by title,[\s\S]*share id, source activity text, or assignment status[\s\S]*without broadening outside[\s\S]*current owner/i,
    'docs/product.md should keep assignment list filters owner-scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Assignment list overview cards summarize[\s\S]*full current filter result,[\s\S]*not only the visible page/i,
    'docs/product.md should keep assignment list overview summaries full-filter scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Authenticated teacher workspace, student runner,[\s\S]*results, print, and authoring tool surfaces may still use hidden semantic[\s\S]*outputs where they support workflow QA and accessibility/i,
    'docs/product.md should allow hidden semantic outputs in authenticated teacher workspace surfaces.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /active account\/contact copy[\s\S]*current forms, billing pages, and[\s\S]*configuration examples should speak in ClassGamify terms/i,
    'docs/product.md should keep settings and billing copy on ClassGamify terms.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /active surface product boundary should absorb the account governance[\s\S]*payment callback flow[\s\S]*current account, contact,[\s\S]*billing, mail, notification, and developer configuration surfaces/i,
    'docs/product.md should keep active surfaces aligned with account governance and payment callbacks.'
  );
});

test('teacher workspace operations sources preserve owner scope and preview boundaries', () => {
  assert.match(
    DASHBOARD_OVERVIEW_SOURCE,
    /countsStarterPreviewAsOwnedMetrics: false[\s\S]*ownerActivityCount: activitiesResolved/,
    'Dashboard overview privacy contract should exclude starter previews from owner metrics.'
  );
  assert.match(
    DASHBOARD_OVERVIEW_SOURCE,
    /const activitiesResolved = !activitiesLoading;[\s\S]*const assignmentsResolved = !assignmentsLoading;/,
    'Dashboard overview should keep activity and assignment loading independent.'
  );
  assert.match(
    DASHBOARD_OVERVIEW_SOURCE,
    /getDashboardOverviewActionCards[\s\S]*Routes\.DashboardActivities[\s\S]*Routes\.DashboardAssignments[\s\S]*Routes\.StudentPreview/,
    'Dashboard action cards should resolve workspace routes from the dashboard domain.'
  );
  assert.match(
    ACTIVITY_LIBRARY_SOURCE,
    /broadensBeyondOwner: false[\s\S]*countsStarterPreviewAsOwned: false[\s\S]*usesFullFilteredSummaryForOverview: true/,
    'Activity library privacy boundary should keep owner scope and full filtered summaries.'
  );
  assert.match(
    ACTIVITY_LIBRARY_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(activity\.ownerId, userId\)\][\s\S]*sqlLikeContains\(activity\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.description, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.templateType, normalizedSearch\)/,
    'Activity library query should combine search with owner scope.'
  );
  assert.match(
    ASSIGNMENT_LIST_SOURCE,
    /broadensBeyondOwner: false[\s\S]*countsStarterPreviewAsOwned: false/,
    'Assignment list privacy boundary should keep owner scope.'
  );
  assert.match(
    ASSIGNMENT_LIST_SOURCE,
    /searchMatchesAssignmentTitle: true[\s\S]*searchMatchesShareSlug: true[\s\S]*searchMatchesSourceActivityText: true/,
    'Assignment list boundary should keep title, share slug, and source activity search semantics.'
  );
  assert.match(
    ASSIGNMENT_LIST_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(assignment\.ownerId, userId\)\][\s\S]*sqlLikeContains\(assignment\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(assignment\.shareSlug, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.title, normalizedSearch\)/,
    'Assignment list query should combine search with owner scope.'
  );

  const pageView = buildDashboardOverviewPageViewModel({
    activitySummary: {
      draftActivities: 2,
      templateCoverage: 3,
      totalActivities: 5,
    },
    assignmentSummary: {
      averageScore: 82,
      completions: 7,
      openAssignments: 2,
      totalAssignments: 4,
    },
  });

  assert.equal(
    pageView.queryBoundary.countsStarterPreviewAsOwnedMetrics,
    false
  );
  assert.equal(pageView.queryBoundary.ownerActivityCount, 5);
  assert.equal(pageView.queryBoundary.ownerAssignmentCount, 4);
  assert.equal(pageView.preview.source, 'starter-preview');
});

test('teacher workspace operations chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Teacher workspace operations chain has a fast script-level gate via[\s\S]*scripts\/teacher-workspace-operations-chain\.test\.ts/,
    'TEST-CATALOG should document the teacher workspace operations chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /dashboard owner summaries[\s\S]*activity library filters\/summaries\/actions[\s\S]*assignment list filters\/distribution[\s\S]*account governance[\s\S]*teacher settings security\/files\/billing\/payment callback\/notification boundaries[\s\S]*active surface product boundary/,
    'TEST-CATALOG should describe the full teacher workspace operations chain scope.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /dashboard overview boundary/,
    'TEST-CATALOG should document the concrete dashboard overview boundary.'
  );
});
