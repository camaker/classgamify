import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDashboardOverviewPageViewModel,
  buildDashboardOverviewQueryBoundary,
  buildDashboardOverviewRouteViewModel,
  buildDashboardOverviewStarterPreview,
} from '@/dashboard/overview';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_TITLE = 'SECRET_TEACHER_ACTIVITY_TITLE';
const SECRET_ASSIGNMENT_TITLE = 'SECRET_ASSIGNMENT_TITLE';

test('dashboard overview keeps the owner-scoped query boundary explicit', () => {
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
  assert.deepEqual(pageView.queryBoundary, {
    activitiesResolved: true,
    assignmentsResolved: true,
    countsStarterPreviewAsOwnedMetrics: false,
    loadingState: 'both-ready',
    ownerActivityCount: 3,
    ownerAssignmentCount: 2,
    scope: 'teacher-dashboard-query-boundary',
  });
});

test('dashboard overview keeps activity and assignment loading independent', () => {
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
  assert.deepEqual(pageView.queryBoundary, {
    activitiesResolved: false,
    assignmentsResolved: true,
    countsStarterPreviewAsOwnedMetrics: false,
    loadingState: 'activity-loading',
    ownerActivityCount: 0,
    ownerAssignmentCount: 1,
    scope: 'teacher-dashboard-query-boundary',
  });
});

test('dashboard overview keeps assignment loading independent', () => {
  const pageView = buildDashboardOverviewRouteViewModel({
    activitiesData: {
      summary: {
        draftActivities: 1,
        templateCoverage: 2,
        totalActivities: 3,
      },
    },
    activitiesLoading: false,
    assignmentsData: null,
    assignmentsLoading: true,
  });
  assert.deepEqual(pageView.queryBoundary, {
    activitiesResolved: true,
    assignmentsResolved: false,
    countsStarterPreviewAsOwnedMetrics: false,
    loadingState: 'assignment-loading',
    ownerActivityCount: 3,
    ownerAssignmentCount: 0,
    scope: 'teacher-dashboard-query-boundary',
  });
});

test('dashboard overview query boundary represents both loading state', () => {
  const pageView = buildDashboardOverviewRouteViewModel({
    activitiesData: null,
    activitiesLoading: true,
    assignmentsData: null,
    assignmentsLoading: true,
  });
  assert.deepEqual(pageView.queryBoundary, {
    activitiesResolved: false,
    assignmentsResolved: false,
    countsStarterPreviewAsOwnedMetrics: false,
    loadingState: 'both-loading',
    ownerActivityCount: 0,
    ownerAssignmentCount: 0,
    scope: 'teacher-dashboard-query-boundary',
  });
});

test('dashboard overview query boundary ignores starter preview metrics', () => {
  assert.deepEqual(
    buildDashboardOverviewQueryBoundary({
      activitiesLoading: false,
      activitySummary: {
        draftActivities: 0,
        templateCoverage: 8,
        totalActivities: 12,
      },
      assignmentSummary: {
        averageScore: 91,
        completions: 6,
        openAssignments: 4,
        totalAssignments: 5,
      },
      assignmentsLoading: false,
    }),
    {
      activitiesResolved: true,
      assignmentsResolved: true,
      countsStarterPreviewAsOwnedMetrics: false,
      loadingState: 'both-ready',
      ownerActivityCount: 12,
      ownerAssignmentCount: 5,
      scope: 'teacher-dashboard-query-boundary',
    }
  );
});
