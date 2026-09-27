import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildAssignmentListFilterScopeBoundary,
  buildAssignmentListPageViewModel,
  buildAssignmentListStarterPreview,
} from '@/assignments/list-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_INTERNAL_ASSIGNMENT_ID = 'SECRET_INTERNAL_ASSIGNMENT_ID';
const SECRET_STORAGE_KEY = 'classroom/private/assignment-source.json';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment list focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-list-semantic-views\.test\.ts/
  );
});

test('assignment list page keeps the owner filter scope explicit', () => {
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
