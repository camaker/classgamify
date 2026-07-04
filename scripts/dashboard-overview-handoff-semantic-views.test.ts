import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS,
  buildDashboardOverviewPageViewModel,
  buildDashboardOverviewRouteViewModel,
  buildDashboardOverviewStarterPreview,
  type DashboardOverviewHandoffItemId,
  type DashboardOverviewHandoffView,
} from '@/dashboard/overview';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { Routes } from '@/lib/routes';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_TITLE = 'SECRET_TEACHER_ACTIVITY_TITLE';
const SECRET_ASSIGNMENT_TITLE = 'SECRET_ASSIGNMENT_TITLE';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TOKEN = 'raw-anonymous-token-value';
const SECRET_STORAGE_KEY = 'userfiles/teacher-secret/private.pdf';

test('dashboard overview handoff exposes 30 owner-scoped loop slices', () => {
  const starterPreview = buildDashboardOverviewStarterPreview();
  const pageView = buildDashboardOverviewPageViewModel({
    activitySummary: {
      draftActivities: 1,
      templateCoverage: 2,
      totalActivities: 3,
    },
    assignmentSummary: {
      averageScore: 75,
      completions: 4,
      openAssignments: 1,
      totalAssignments: 2,
    },
    preview: {
      ...starterPreview,
      activity: {
        ...starterPreview.activity,
        title: SECRET_ACTIVITY_TITLE,
      },
      assignment: {
        ...starterPreview.assignment,
        title: SECRET_ASSIGNMENT_TITLE,
      },
    },
  });
  const handoffView = pageView.handoffView;
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    handoffView.itemViews.every(
      (itemView) =>
        itemView.ariaLabel &&
        itemView.description &&
        itemView.label &&
        itemView.value
    )
  );
  assert.deepEqual(handoffView.privacy, {
    countsStarterPreviewAsOwnedMetrics: false,
    exposesAssignmentAttemptDetails: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds,
    scope: 'teacher-dashboard-overview',
  });

  assert.equal(getHandoffValue(handoffView, 'owner-activity-scope'), '3');
  assert.equal(getHandoffValue(handoffView, 'owner-assignment-scope'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'starter-preview-boundary'),
    'Preview only'
  );
  assert.equal(getHandoffValue(handoffView, 'activity-loading-state'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'assignment-loading-state'),
    'Ready'
  );
  assert.equal(getHandoffValue(handoffView, 'activity-metric'), '3');
  assert.equal(getHandoffValue(handoffView, 'template-coverage-metric'), '2/8');
  assert.equal(getHandoffValue(handoffView, 'assignment-metric'), '1');
  assert.equal(getHandoffValue(handoffView, 'result-metric'), '75%');
  assert.equal(
    getHandoffValue(handoffView, 'core-loop-status'),
    'Review ready'
  );
  assert.equal(getHandoffValue(handoffView, 'create-action'), 'Done');
  assert.equal(getHandoffValue(handoffView, 'publish-action'), 'Done');
  assert.equal(getHandoffValue(handoffView, 'share-action'), 'Done');
  assert.equal(getHandoffValue(handoffView, 'review-action'), 'Next');
  assert.equal(getHandoffValue(handoffView, 'activity-readiness'), '100%');
  assert.equal(
    getHandoffValue(handoffView, 'assignment-link-readiness'),
    '100%'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-runner-readiness'),
    '100%'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-results-readiness'),
    '100%'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-card-activities'),
    'Open activities'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-card-assignments'),
    'Open assignments'
  );
  assert.equal(
    getHandoffValue(handoffView, 'action-card-student-preview'),
    'Open student preview'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-source'),
    'Starter preview'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-activity'),
    'Starter activity'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-assignment'),
    'Starter assignment'
  );
  assert.equal(getHandoffValue(handoffView, 'route-create'), Routes.Create);
  assert.equal(
    getHandoffValue(handoffView, 'route-activities'),
    Routes.DashboardActivities
  );
  assert.equal(
    getHandoffValue(handoffView, 'route-assignments'),
    Routes.DashboardAssignments
  );
  assert.equal(
    getHandoffValue(handoffView, 'route-student-preview'),
    Routes.StudentPreview
  );
  assert.equal(
    getHandoffValue(handoffView, 'loading-independence'),
    'Both ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data hidden'
  );

  assertNoPrivateDashboardHandoffText(JSON.stringify(handoffView));
});

test('dashboard overview handoff keeps activity and assignment loading independent', () => {
  const pageView = buildDashboardOverviewRouteViewModel({
    activitiesData: null,
    activitiesLoading: true,
    assignmentsData: {
      summary: {
        averageScore: 0,
        completions: 0,
        openAssignments: 1,
        totalAssignments: 1,
      },
    },
    assignmentsLoading: false,
  });

  assert.equal(
    getHandoffValue(pageView.handoffView, 'activity-loading-state'),
    'Loading'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView, 'assignment-loading-state'),
    'Ready'
  );
  assert.equal(getHandoffValue(pageView.handoffView, 'activity-metric'), '-');
  assert.equal(getHandoffValue(pageView.handoffView, 'assignment-metric'), '1');
  assert.equal(
    getHandoffValue(pageView.handoffView, 'loading-independence'),
    'Split loading'
  );
});

function getHandoffValue(
  view: DashboardOverviewHandoffView,
  id: DashboardOverviewHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing dashboard handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateDashboardHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_TITLE,
    SECRET_ASSIGNMENT_TITLE,
    SECRET_STUDENT_ANSWER,
    SECRET_TOKEN,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Dashboard handoff leaked private text: ${privateValue}`
    );
  }
}
