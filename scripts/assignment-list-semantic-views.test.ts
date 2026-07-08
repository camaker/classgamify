import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS,
  buildAssignmentListFilterScopeBoundary,
  buildAssignmentListPageViewModel,
  buildAssignmentListStarterPreview,
} from '@/assignments/list-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_INTERNAL_ASSIGNMENT_ID = 'SECRET_INTERNAL_ASSIGNMENT_ID';
const SECRET_OWNER_ID = 'SECRET_OWNER_ID';
const SECRET_STORAGE_KEY = 'classroom/private/assignment-source.json';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TOKEN = 'raw-anonymous-token-value';
const DASHBOARD_ASSIGNMENTS_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment dashboard route renders the page handoff marker and item outputs', () => {
  assert.match(
    DASHBOARD_ASSIGNMENTS_ROUTE_SOURCE,
    /<AssignmentListPageHandoff[\s\S]*handoffView=\{activePageView\.handoffView\}[\s\S]*\/>/,
    'Assignment dashboard route should render the prepared assignment-list page handoff view.'
  );
  assert.match(
    DASHBOARD_ASSIGNMENTS_ROUTE_SOURCE,
    /function AssignmentListPageHandoff[\s\S]*const titleId = useId\(\)[\s\S]*const descriptionId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="assignment-list"[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map\(\(item\) =>[\s\S]*AssignmentListPageHandoffItem[\s\S]*function AssignmentListPageHandoffItem[\s\S]*item: AssignmentListPageHandoffItemView[\s\S]*const labelId = `assignment-list-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `assignment-list-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `assignment-list-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Assignment dashboard route should expose the assignment-list marker, stable item markers, and prepared item outputs.'
  );
});

test('assignment list focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-list-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'assignment list overview metrics',
    'status/search filters',
    'published share context',
    'visible-card counts',
    'hidden assignment-list handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

test('assignment list page exposes a 30-slice distribution handoff', () => {
  const pageView = buildAssignmentListPageViewModel({
    data: {
      items: [
        buildAssignmentListItem({
          activityDescription: `Source text ${SECRET_STORAGE_KEY}`,
          averageScore: 72,
          completions: 9,
          id: `${SECRET_INTERNAL_ASSIGNMENT_ID}-open`,
          shareSlug: 'share-1',
          status: 'published',
          title: 'Week 1 vocabulary',
        }),
        buildAssignmentListItem({
          averageScore: 50,
          completions: 1,
          id: `${SECRET_INTERNAL_ASSIGNMENT_ID}-closed`,
          shareSlug: 'closed-link',
          status: 'closed',
          title: 'Closed review',
        }),
      ],
      publishedAssignment: {
        id: `${SECRET_INTERNAL_ASSIGNMENT_ID}-open`,
        shareSlug: 'share-1',
        title: 'Week 1 vocabulary',
      },
      summary: {
        averageScore: 72,
        closedAssignments: 1,
        completions: 10,
        draftAssignments: 2,
        expiredAssignments: 3,
        openAssignments: 4,
        totalAssignments: 31,
      },
      total: 31,
    },
    isLoading: false,
    search: {
      page: 2,
      published: ' share-1 ',
      q: '  Week   1  ',
      status: 'open',
    },
  });
  const handoffView = pageView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS]);
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
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    exposesInternalAssignmentIds: false,
    exposesInternalOwnerId: false,
    exposesPublicRuntimeContent: false,
    exposesRawAnonymousToken: false,
    exposesResultExportRows: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    keepsDistributionStepsPrepared: true,
    keepsVisiblePageCountsSeparate: true,
    searchMatchesAssignmentTitle: true,
    searchMatchesShareSlug: true,
    searchMatchesSourceActivityText: true,
    usesFullFilteredSummaryForOverview: true,
    usesOwnerScopedStatusFilters: true,
  });
  assert.deepEqual(pageView.filterScopeBoundary, {
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    fullFilteredAssignmentCount: 31,
    keepsDistributionStepsPrepared: true,
    keepsVisiblePageCountsSeparate: true,
    normalizedSearchQuery: 'Week 1',
    overviewAssignmentCount: 31,
    publishedShareContextStatus: 'found',
    scope: 'owner-assignment-list-filter-scope',
    searchMatchesAssignmentTitle: true,
    searchMatchesShareSlug: true,
    searchMatchesSourceActivityText: true,
    statusFilter: 'open',
    usesFullFilteredSummaryForOverview: true,
    visiblePageAssignmentCount: 2,
  });

  assert.equal(getHandoffValue(handoffView.itemViews, 'summary-total'), '31');
  assert.equal(getHandoffValue(handoffView.itemViews, 'summary-open'), '4');
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'summary-completions'),
    '10'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'summary-average'),
    '72%'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'scope-range'),
    '13-14 of 31'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'scope-search'),
    'Week 1'
  );
  assert.equal(getHandoffValue(handoffView.itemViews, 'status-open'), '4');
  assert.equal(getHandoffValue(handoffView.itemViews, 'status-closed'), '1');
  assert.equal(getHandoffValue(handoffView.itemViews, 'status-expired'), '3');
  assert.equal(getHandoffValue(handoffView.itemViews, 'status-draft'), '2');
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'filter-summary'),
    '31 matches'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-page-items'),
    '2 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-open-links'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-closed-links'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-expired-links'),
    '0 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-draft-assignments'),
    '0 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-copy-ready'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-copy-blocked'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-preview-ready'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-print-ready'),
    '2 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-results-ready'),
    '2 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-result-evidence'),
    '2 visible assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'pagination'),
    'Page 2 of 3; 31 teacher assignments'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'published-share-context'),
    'Ready: /play/share-1'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'distribution-copy-link'),
    'Ready now'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'distribution-preview-link'),
    'Ready now'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'distribution-review-results'),
    'After submissions'
  );

  assertNoPrivateAssignmentText(JSON.stringify(handoffView));
});

test('assignment list handoff counts draft and expired distribution gates', () => {
  const now = Date.parse('2026-01-02T00:00:00.000Z');
  const pageView = buildAssignmentListPageViewModel({
    data: {
      items: [
        buildAssignmentListItem({
          averageScore: 0,
          completions: 0,
          id: `${SECRET_INTERNAL_ASSIGNMENT_ID}-draft`,
          shareSlug: 'draft-link',
          status: 'draft',
          title: 'Draft link',
        }),
        buildAssignmentListItem({
          averageScore: 0,
          completions: 0,
          expiresAt: new Date('2026-01-01T00:00:00.000Z'),
          id: `${SECRET_INTERNAL_ASSIGNMENT_ID}-expired`,
          now,
          shareSlug: 'expired-link',
          status: 'published',
          title: 'Expired link',
        }),
      ],
      summary: {
        averageScore: 0,
        closedAssignments: 0,
        completions: 0,
        draftAssignments: 1,
        expiredAssignments: 1,
        openAssignments: 0,
        totalAssignments: 2,
      },
      total: 2,
    },
    isLoading: false,
    search: {},
  });
  const itemViews = pageView.handoffView.itemViews;

  assert.equal(
    getHandoffValue(itemViews, 'visible-open-links'),
    '0 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-expired-links'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-draft-assignments'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-copy-ready'),
    '0 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-copy-blocked'),
    '2 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-preview-ready'),
    '0 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-print-ready'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-results-ready'),
    '1 visible assignments'
  );
  assert.equal(
    getHandoffValue(itemViews, 'visible-result-evidence'),
    '0 visible assignments'
  );
});

test('starter previews remain outside owned assignment metrics', () => {
  const pageView = buildAssignmentListPageViewModel({
    data: null,
    isLoading: false,
    search: {},
  });
  const starterPreview = buildAssignmentListStarterPreview();

  assert.equal(pageView.totalAssignments, 0);
  assert.equal(starterPreview.assignments.length, 1);
  assert.equal(pageView.starterPreview.assignments.length, 1);
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'summary-total'),
    '0'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'published-share-context'),
    'No new share link'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'distribution-copy-link'),
    'Not ready'
  );
  assert.equal(pageView.handoffView.privacy.countsStarterPreviewAsOwned, false);
  assert.deepEqual(pageView.filterScopeBoundary, {
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    fullFilteredAssignmentCount: 0,
    keepsDistributionStepsPrepared: true,
    keepsVisiblePageCountsSeparate: true,
    overviewAssignmentCount: 0,
    publishedShareContextStatus: 'none',
    scope: 'owner-assignment-list-filter-scope',
    searchMatchesAssignmentTitle: true,
    searchMatchesShareSlug: true,
    searchMatchesSourceActivityText: true,
    statusFilter: 'all',
    usesFullFilteredSummaryForOverview: true,
    visiblePageAssignmentCount: 0,
  });
});

test('assignment list filter scope boundary normalizes unsafe counts', () => {
  assert.deepEqual(
    buildAssignmentListFilterScopeBoundary({
      statusFilter: 'closed',
      totalAssignments: Number.NaN,
      visibleCount: 5,
    }),
    {
      broadensBeyondOwner: false,
      countsStarterPreviewAsOwned: false,
      fullFilteredAssignmentCount: 0,
      keepsDistributionStepsPrepared: true,
      keepsVisiblePageCountsSeparate: true,
      overviewAssignmentCount: 0,
      publishedShareContextStatus: 'none',
      scope: 'owner-assignment-list-filter-scope',
      searchMatchesAssignmentTitle: true,
      searchMatchesShareSlug: true,
      searchMatchesSourceActivityText: true,
      statusFilter: 'closed',
      usesFullFilteredSummaryForOverview: true,
      visiblePageAssignmentCount: 0,
    }
  );
});

function buildAssignmentListItem({
  activityDescription = 'Classroom source text',
  averageScore,
  completions,
  expiresAt = null,
  id,
  now,
  shareSlug,
  status,
  title,
}: {
  activityDescription?: string;
  averageScore: number;
  completions: number;
  expiresAt?: Date | null;
  id: string;
  now?: number;
  shareSlug: string;
  status: 'closed' | 'draft' | 'published';
  title: string;
}) {
  return {
    activity: {
      description: activityDescription,
      templateType: 'quiz' as const,
    },
    assignment: {
      expiresAt,
      id,
      settingsJson: {
        collectStudentName: true,
        showCorrectAnswers: true,
        shuffleItems: false,
      },
      shareSlug,
      status,
      title,
    },
    snapshot: {
      activityDescription,
      templateType: 'quiz' as const,
    },
    stats: {
      averageScore,
      completions,
    },
    ...(now === undefined ? {} : { now }),
  };
}

function getHandoffValue(
  itemViews: Array<{ id: string; value: string }>,
  id: string
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected assignment list handoff item ${id}`);
  return item.value;
}

function assertNoPrivateAssignmentText(value: string) {
  for (const privateValue of [
    SECRET_INTERNAL_ASSIGNMENT_ID,
    SECRET_OWNER_ID,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Assignment list handoff leaked private text: ${privateValue}`
    );
  }
}
