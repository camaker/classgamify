import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS,
  buildAssignmentPublishDialogViewModel,
  buildAssignmentPublishDraftDefaults,
  type AssignmentPublishHandoffItemId,
} from '@/assignments/publish-input';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_TITLE = 'SECRET_ASSIGNMENT_TITLE_SHOULD_NOT_LEAK';
const SECRET_INSTRUCTIONS = 'SECRET_STUDENT_INSTRUCTIONS_SHOULD_NOT_LEAK';
const SECRET_SHARE_SLUG = 'SECRET_SHARE_SLUG_SHOULD_NOT_LEAK';
const NOW = new Date('2026-01-01T00:00:00.000Z');

test('publish dialog exposes a safe 30-slice preview handoff', () => {
  const defaults = buildAssignmentPublishDraftDefaults({
    activityId: 'activity-publish-ready',
    title: SECRET_TITLE,
  });
  const publishView = buildAssignmentPublishDialogViewModel({
    defaults,
    now: NOW,
    values: {
      collectStudentName: false,
      expiresAtLocal: '2026-01-01T11:30',
      instructions: SECRET_INSTRUCTIONS,
      maxAttempts: '3',
      showCorrectAnswers: false,
      shuffleItems: false,
      timeLimitMinutes: '15',
    },
    visibility: 'draft',
  });
  const handoffView = publishView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS]);
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
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesInternalActivityIds: false,
    exposesPublicRuntimeContent: false,
    exposesRawSettingsJson: false,
    exposesShareSlug: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesStudentInstructions: false,
    exposesStudentNames: false,
    exposesTeacherNotes: false,
    itemIds,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['publish-access', 'Available'],
      ['activity-lifecycle-gate', 'Available'],
      ['publish-action', 'Enabled'],
      ['publish-disabled', 'Enabled'],
      ['validation-status', 'Ready to publish'],
      ['validation-message', 'No validation blocker'],
      ['title-field', 'Provided'],
      ['draft-field-count', '8 draft fields'],
      ['field-limit-boundary', 'Limits enforced'],
      ['frozen-link-status', 'Ready to publish'],
      ['delivery-rule-count', '6 rules'],
      ['settings-summary-status', 'Timer and close time'],
      ['student-instructions', 'Added'],
      ['timer-status', 'Enabled'],
      ['close-time-status', 'Scheduled'],
      ['review-checklist-count', '3 checks'],
      ['delivery-defaults', 'Resolved settings'],
      ['attempts-policy', '3 max'],
      ['attempt-limit-parser', 'Limited'],
      ['identity-policy', 'Anonymous'],
      ['answer-reveal-policy', 'Hidden'],
      ['item-order-policy', 'Fixed order'],
      ['timer-parser', '15 min'],
      ['settings-json', '6 setting fields'],
      ['close-time-parser', 'Scheduled'],
      ['snapshot-freeze', 'Ready to publish'],
      ['student-link-rules', 'Ready to publish'],
      ['public-payload-boundary', 'Student payload safe'],
      ['results-policy', 'Ready to publish'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivatePublishText(JSON.stringify(handoffView));
});

test('publish handoff keeps blocked access and invalid drafts explicit', () => {
  const defaults = buildAssignmentPublishDraftDefaults({
    activityId: 'activity-publish-blocked',
    title: SECRET_TITLE,
  });
  const publishView = buildAssignmentPublishDialogViewModel({
    defaults,
    now: NOW,
    values: {
      instructions: SECRET_INSTRUCTIONS,
      title: '',
    },
    visibility: 'archived',
  });
  const handoffView = publishView.handoffView;

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'publish-access'),
    'Restore required'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'activity-lifecycle-gate'),
    'Restore required'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'publish-action'),
    'Disabled'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'validation-message'),
    'Add an assignment title before publishing.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'title-field'),
    'Missing'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'student-instructions'),
    'Added'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'public-payload-boundary'),
    'Student payload safe'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'privacy-guard'),
    'Private data omitted'
  );
  assertNoPrivatePublishText(JSON.stringify(handoffView));
});

function getHandoffItemValue(
  itemViews: Array<{ id: AssignmentPublishHandoffItemId; value: string }>,
  id: AssignmentPublishHandoffItemId
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected publish handoff item ${id}`);
  return item.value;
}

function assertNoPrivatePublishText(value: string) {
  for (const privateValue of [
    SECRET_TITLE,
    SECRET_INSTRUCTIONS,
    SECRET_SHARE_SLUG,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Publish handoff leaked private draft text: ${privateValue}`
    );
  }
}
