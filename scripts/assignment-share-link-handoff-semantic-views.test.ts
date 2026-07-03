import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAssignmentListCardViewModel,
  buildAssignmentListPageViewModel,
} from '@/assignments/list-view';
import { buildPublishedAssignmentPanelContext } from '@/assignments/published-assignment';
import { buildAssignmentResultHeaderView } from '@/assignments/result-view';
import {
  ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS,
  buildAssignmentShareLinkActionView,
  buildAssignmentShareLinkHandoffView,
  buildAssignmentShareUrl,
} from '@/assignments/share-link';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT_SHOULD_NOT_LEAK';
const SECRET_ANSWER_KEY = 'SECRET_ANSWER_KEY_SHOULD_NOT_LEAK';
const SECRET_INTERNAL_ID = 'SECRET_INTERNAL_ASSIGNMENT_ID_SHOULD_NOT_LEAK';
const SECRET_LABEL = 'SECRET_ACTION_LABEL_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'SECRET_STORAGE_KEY_SHOULD_NOT_LEAK';
const SECRET_STUDENT_NAME = 'SECRET_STUDENT_NAME_SHOULD_NOT_LEAK';
const SECRET_TOKEN = 'SECRET_ANONYMOUS_TOKEN_SHOULD_NOT_LEAK';

test('share-link helper exposes a safe 20-slice handoff', () => {
  const actionView = buildAssignmentShareLinkActionView({
    baseUrl: ' classgamify.test/dashboard ',
    label: SECRET_LABEL,
    shareSlug: '　Class １/２　',
  });
  const handoffView = buildAssignmentShareLinkHandoffView(actionView, {
    surface: 'result-page',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS]);
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
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesInternalAssignmentIds: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    exposesTeacherNotes: false,
    itemIds,
    shareUrlIsPublicDeliveryLink: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['route-target', '/play/$shareId'],
      ['normalized-share-slug', 'Resolved'],
      ['encoded-share-path', '/play/Class%201%2F2'],
      ['absolute-share-url', 'https://classgamify.test/play/Class%201%2F2'],
      ['base-url-origin', 'https://classgamify.test'],
      ['route-param', 'shareId'],
      ['path-label', 'Student link'],
      ['url-label', 'Full student link'],
      ['availability', 'Available'],
      ['lifecycle-guard', 'Open'],
      ['disabled-reason', 'None'],
      ['copy-action', 'Enabled'],
      ['copy-feedback', 'Student link copied.'],
      ['preview-action', 'Enabled'],
      ['student-runner-target', '/play/$shareId'],
      ['publish-success-surface', 'Compatible'],
      ['assignment-list-surface', 'Compatible'],
      ['result-page-surface', 'Active'],
      ['missing-slug-guard', 'Passed'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateShareText(JSON.stringify(handoffView));
});

test('share-link handoff keeps missing slugs blocked before copy or preview', () => {
  const actionView = buildAssignmentShareLinkActionView({
    disabledReasonCode: 'missing-share-slug',
    label: 'Student link unavailable',
    shareSlug: '   ',
  });
  const handoffView = buildAssignmentShareLinkHandoffView(actionView, {
    surface: 'assignment-list',
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'normalized-share-slug'),
    'Missing'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'availability'),
    'Unavailable'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'lifecycle-guard'),
    'Missing share slug'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'disabled-reason'),
    'Missing share slug'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'copy-action'),
    'Disabled'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'preview-action'),
    'Disabled'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'assignment-list-surface'),
    'Active'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'missing-slug-guard'),
    'Blocked'
  );
  assertNoPrivateShareText(JSON.stringify(handoffView));
});

test('publish panel, assignment list, and result page share one link contract', () => {
  const shareSlug = 'shared-class';
  const publishedPanelShareAction = buildPublishedAssignmentPanelContext({
    assignment: {
      id: SECRET_INTERNAL_ID,
      shareSlug,
      title: 'Shared class',
    },
    isLoading: false,
    shareSlug,
  }).actionView.shareAction;
  const assignmentListPageView = buildAssignmentListPageViewModel({
    data: {
      items: [
        {
          activity: {
            description: SECRET_ACTIVITY_CONTENT,
            templateType: 'quiz',
          },
          assignment: {
            expiresAt: null,
            id: SECRET_INTERNAL_ID,
            settingsJson: {
              collectStudentName: true,
              showCorrectAnswers: false,
              shuffleItems: false,
            },
            shareSlug,
            status: 'published',
            title: 'Shared class',
          },
          snapshot: {
            activityDescription: SECRET_ACTIVITY_CONTENT,
            templateType: 'quiz',
          },
          stats: {
            averageScore: 0,
            completions: 0,
          },
        },
      ],
      summary: {
        averageScore: null,
        closedAssignments: 0,
        completions: 0,
        draftAssignments: 0,
        expiredAssignments: 0,
        openAssignments: 1,
        totalAssignments: 1,
      },
      total: 1,
    },
    isLoading: false,
    search: {},
  });
  const assignmentListShareAction = buildAssignmentListCardViewModel(
    assignmentListPageView.assignments[0]
  ).actionView.shareAction;
  const resultPageShareAction = buildAssignmentResultHeaderView({
    activity: {
      description: SECRET_ACTIVITY_CONTENT,
      templateType: 'quiz',
      title: 'Shared class',
    },
    assignment: {
      expiresAt: null,
      id: SECRET_INTERNAL_ID,
      settingsJson: {
        collectStudentName: true,
        showCorrectAnswers: false,
        shuffleItems: false,
      },
      shareSlug,
      status: 'published',
      title: 'Shared class',
    },
    now: new Date('2026-01-01T00:00:00.000Z').getTime(),
    snapshot: {
      activityDescription: SECRET_ACTIVITY_CONTENT,
      activityTitle: 'Shared class',
      templateType: 'quiz',
    },
  }).shareAction;

  assert.ok(publishedPanelShareAction);
  assert.ok(assignmentListShareAction);

  const sharedActionViews = [
    {
      actionView: publishedPanelShareAction,
      activeSurfaceId: 'publish-success-surface',
      surface: 'publish-success' as const,
    },
    {
      actionView: assignmentListShareAction,
      activeSurfaceId: 'assignment-list-surface',
      surface: 'assignment-list' as const,
    },
    {
      actionView: resultPageShareAction,
      activeSurfaceId: 'result-page-surface',
      surface: 'result-page' as const,
    },
  ];

  for (const { actionView, activeSurfaceId, surface } of sharedActionViews) {
    const handoffView = buildAssignmentShareLinkHandoffView(actionView, {
      surface,
    });

    assert.deepEqual(
      handoffView.itemViews.map((item) => item.id),
      [...ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS]
    );
    assert.equal(
      getHandoffItemValue(handoffView.itemViews, 'encoded-share-path'),
      '/play/shared-class'
    );
    assert.equal(
      getHandoffItemValue(handoffView.itemViews, 'absolute-share-url'),
      buildAssignmentShareUrl(shareSlug)
    );
    assert.equal(
      getHandoffItemValue(handoffView.itemViews, activeSurfaceId),
      'Active'
    );
    assertNoPrivateShareText(JSON.stringify(handoffView));
  }
});

function getHandoffItemValue(
  itemViews: Array<{ id: string; value: string }>,
  id: string
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected share-link handoff item ${id}`);
  return item.value;
}

function assertNoPrivateShareText(value: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_ANSWER_KEY,
    SECRET_INTERNAL_ID,
    SECRET_LABEL,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Share-link handoff leaked private text: ${privateValue}`
    );
  }
}
