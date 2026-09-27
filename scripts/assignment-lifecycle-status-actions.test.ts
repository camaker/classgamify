import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAssignmentStatusAction,
  buildAssignmentStatusActionExecutionPlan,
  getAssignmentLifecycleStatus,
  getAssignmentStatusTransitionError,
  getAssignmentSubmissionErrorMessage,
} from '@/assignments/lifecycle';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();
const PAST = new Date('2025-12-01T00:00:00.000Z');
const FUTURE = new Date('2026-02-01T00:00:00.000Z');

test('open assignments accept submissions and offer the close action', () => {
  assert.equal(getAssignmentLifecycleStatus('published', FUTURE, NOW), 'open');
  assert.equal(
    getAssignmentSubmissionErrorMessage({
      expiresAt: FUTURE,
      now: NOW,
      status: 'published',
    }),
    undefined
  );

  const action = buildAssignmentStatusAction({
    currentStatus: 'published',
    expiresAt: FUTURE,
    now: NOW,
  });
  assert.equal(action?.kind, 'close-link');
  assert.equal(action?.nextStatus, 'closed');
  assert.deepEqual(
    buildAssignmentStatusActionExecutionPlan({
      assignmentId: 'assignment-1',
      statusAction: action,
    }),
    {
      failureMessage: action?.failureMessage,
      input: { assignmentId: 'assignment-1', status: 'closed' },
      successMessage: action?.successMessage,
      type: 'update-status',
    }
  );
});

test('closed assignments block students and offer reopen', () => {
  assert.equal(getAssignmentLifecycleStatus('closed', null, NOW), 'closed');
  assert.equal(
    getAssignmentSubmissionErrorMessage({
      expiresAt: null,
      now: NOW,
      status: 'closed',
    }),
    'This assignment is closed.'
  );
  assert.equal(
    getAssignmentStatusTransitionError({
      currentStatus: 'closed',
      expiresAt: null,
      nextStatus: 'closed',
      now: NOW,
    }),
    'Assignment link is already closed.'
  );

  const action = buildAssignmentStatusAction({
    currentStatus: 'closed',
    expiresAt: null,
    now: NOW,
  });
  assert.equal(action?.kind, 'reopen-link');
  assert.equal(action?.nextStatusValue, 'Open');
});

test('expired assignments stay blocked and cannot be reopened', () => {
  assert.equal(getAssignmentLifecycleStatus('published', PAST, NOW), 'expired');
  assert.ok(
    getAssignmentSubmissionErrorMessage({
      expiresAt: PAST,
      now: NOW,
      status: 'published',
    })
  );
  assert.ok(
    getAssignmentStatusTransitionError({
      currentStatus: 'closed',
      expiresAt: PAST,
      nextStatus: 'published',
      now: NOW,
    })
  );
  assert.equal(
    buildAssignmentStatusAction({
      currentStatus: 'closed',
      expiresAt: PAST,
      now: NOW,
    }),
    undefined
  );
});

test('drafts and previews cannot bypass publish-and-snapshot', () => {
  assert.equal(getAssignmentLifecycleStatus('draft', null, NOW), 'draft');
  assert.ok(
    getAssignmentSubmissionErrorMessage({
      expiresAt: null,
      now: NOW,
      status: 'draft',
    })
  );
  assert.equal(
    buildAssignmentStatusAction({
      currentStatus: 'published',
      expiresAt: FUTURE,
      isPersisted: false,
      now: NOW,
    }),
    undefined
  );
  assert.deepEqual(
    buildAssignmentStatusActionExecutionPlan({
      assignmentId: 'preview',
      statusAction: undefined,
    }),
    { reason: 'missing-status-action', type: 'blocked' }
  );
});
