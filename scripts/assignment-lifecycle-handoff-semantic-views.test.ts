import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS,
  buildAssignmentLifecycleHandoffView,
  type AssignmentLifecycleHandoffItemId,
} from '@/assignments/lifecycle';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT_SHOULD_NOT_LEAK';
const SECRET_ANSWER_KEY = 'SECRET_ANSWER_KEY_SHOULD_NOT_LEAK';
const SECRET_ASSIGNMENT_ID = 'SECRET_ASSIGNMENT_ID_SHOULD_NOT_LEAK';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER_SHOULD_NOT_LEAK';
const SECRET_STUDENT_NAME = 'SECRET_STUDENT_NAME_SHOULD_NOT_LEAK';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE_SHOULD_NOT_LEAK';
const SECRET_TOKEN = 'SECRET_ANONYMOUS_TOKEN_SHOULD_NOT_LEAK';
const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();

test('open assignment lifecycle exposes a safe 20-slice handoff', () => {
  const handoffView = buildAssignmentLifecycleHandoffView({
    currentStatus: 'published',
    expiresAt: new Date('2026-01-02T00:00:00.000Z'),
    now: NOW,
    surface: 'student-access',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS]);
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
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    exposesTeacherNotes: false,
    itemIds,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['current-status', 'open'],
      ['status-label', 'Open'],
      ['student-access', 'Available'],
      ['public-payload', 'Available'],
      ['submission-gate', 'Accepting submissions'],
      ['teacher-list-state', 'Open'],
      ['result-page-state', 'Open'],
      ['close-action', 'Ready'],
      ['reopen-action', 'Not available'],
      ['next-status', 'Closed'],
      ['transition-error', 'None'],
      ['execution-plan', 'update-status'],
      ['expiry-check', 'Future close time'],
      ['close-time', 'Scheduled'],
      ['draft-snapshot-gate', 'Snapshot frozen'],
      ['closed-snapshot-retention', 'Snapshot frozen'],
      ['attempt-review-retention', 'Attempt review retained'],
      ['server-transition-guard', 'Validated'],
      ['owner-scope', 'Owner scoped'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateLifecycleText(JSON.stringify(handoffView));
});

test('closed assignment lifecycle keeps results and reopen action explicit', () => {
  const handoffView = buildAssignmentLifecycleHandoffView({
    currentStatus: 'closed',
    expiresAt: null,
    now: NOW,
    surface: 'teacher-list',
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-status'),
    'closed'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'student-access'),
    'Blocked'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'submission-gate'),
    'This assignment is closed.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'close-action'),
    'Not available'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'reopen-action'),
    'Ready'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'next-status'),
    'Open'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'closed-snapshot-retention'),
    'Results retained'
  );
  assertNoPrivateLifecycleText(JSON.stringify(handoffView));
});

test('expired lifecycle blocks reopen without changing close window', () => {
  const handoffView = buildAssignmentLifecycleHandoffView({
    currentStatus: 'closed',
    expiresAt: new Date('2025-12-31T00:00:00.000Z'),
    now: NOW,
    surface: 'server-function',
  });

  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-status'),
    'closed'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'reopen-action'),
    'Not available'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'transition-error'),
    'Expired assignments cannot be reopened.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'execution-plan'),
    'blocked'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'expiry-check'),
    'Expired close time'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'attempt-review-retention'),
    'Attempt review retained'
  );
  assertNoPrivateLifecycleText(JSON.stringify(handoffView));
});

test('draft lifecycle cannot bypass publish-and-snapshot flow', () => {
  const handoffView = buildAssignmentLifecycleHandoffView({
    currentStatus: 'draft',
    expiresAt: null,
    now: NOW,
    surface: 'result-page',
  });

  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-status'),
    'draft'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'public-payload'),
    'Blocked'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'submission-gate'),
    'This assignment has not been published for students yet.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'transition-error'),
    'Only published assignment links can be closed.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'execution-plan'),
    'blocked'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'draft-snapshot-gate'),
    'Publish required'
  );
  assertNoPrivateLifecycleText(JSON.stringify(handoffView));
});

function getHandoffItemValue(
  itemViews: Array<{ id: AssignmentLifecycleHandoffItemId; value: string }>,
  id: AssignmentLifecycleHandoffItemId
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected lifecycle handoff item ${id}`);
  return item.value;
}

function assertNoPrivateLifecycleText(value: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_ANSWER_KEY,
    SECRET_ASSIGNMENT_ID,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
    SECRET_TEACHER_NOTE,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Lifecycle handoff leaked private text: ${privateValue}`
    );
  }
}
