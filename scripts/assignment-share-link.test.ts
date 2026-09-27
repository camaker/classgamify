import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAssignmentListCardViewModel,
  buildAssignmentListPageViewModel,
} from '@/assignments/list-view';
import { buildPublishedAssignmentPanelContext } from '@/assignments/published-assignment';
import { buildAssignmentResultHeaderView } from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT_SHOULD_NOT_LEAK';
const SECRET_INTERNAL_ID = 'SECRET_INTERNAL_ASSIGNMENT_ID_SHOULD_NOT_LEAK';

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

  for (const actionView of [assignmentListShareAction, resultPageShareAction]) {
    assert.equal(actionView.sharePath, publishedPanelShareAction.sharePath);
    assert.equal(actionView.shareUrl, publishedPanelShareAction.shareUrl);
    assert.equal(actionView.isAvailable, publishedPanelShareAction.isAvailable);
  }
});
