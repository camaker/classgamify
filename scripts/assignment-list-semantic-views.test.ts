import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS,
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
