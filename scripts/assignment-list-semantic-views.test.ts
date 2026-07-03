import assert from 'node:assert/strict';
import test from 'node:test';
import {
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

test('assignment list page exposes a 20-slice distribution handoff', () => {
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

  assert.deepEqual(itemIds, [
    'owner-scope',
    'summary-total',
    'summary-open',
    'summary-completions',
    'summary-average',
    'scope-range',
    'scope-page',
    'scope-status',
    'scope-search',
    'status-open',
    'status-closed',
    'status-expired',
    'status-draft',
    'filter-summary',
    'visible-page-items',
    'pagination',
    'published-share-context',
    'distribution-copy-link',
    'distribution-preview-link',
    'distribution-review-results',
  ]);
  assert.equal(new Set(itemIds).size, 20);
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
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
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
});

function buildAssignmentListItem({
  activityDescription = 'Classroom source text',
  averageScore,
  completions,
  id,
  shareSlug,
  status,
  title,
}: {
  activityDescription?: string;
  averageScore: number;
  completions: number;
  id: string;
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
      expiresAt: null,
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
