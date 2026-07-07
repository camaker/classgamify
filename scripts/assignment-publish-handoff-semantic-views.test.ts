import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS,
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
const SECRET_ACTIVITY_ID = 'activity-publish-ready';
const SECRET_BLOCKED_ACTIVITY_ID = 'activity-publish-blocked';
const NOW = new Date('2026-01-01T00:00:00.000Z');

test('publish dialog exposes a safe 30-slice preview handoff', () => {
  const defaults = buildAssignmentPublishDraftDefaults({
    activityId: SECRET_ACTIVITY_ID,
    title: SECRET_TITLE,
  });
  const publishView = buildAssignmentPublishDialogViewModel({
    controlIdBase: 'publish-test',
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
  assert.deepEqual(publishView.controlBoundary, {
    closeAfterStatus: 'ready',
    controlIdBase: 'publish-test',
    controlIds: {
      fieldIds: {
        closeAfter: {
          describedByIds: ['publish-test-expires-at-help'],
          helpId: 'publish-test-expires-at-help',
          inputId: 'publish-test-expires-at',
        },
        instructions: {
          describedByIds: ['publish-test-assignment-instructions-help'],
          helpId: 'publish-test-assignment-instructions-help',
          inputId: 'publish-test-assignment-instructions',
        },
        maxAttempts: {
          describedByIds: ['publish-test-max-attempts-help'],
          helpId: 'publish-test-max-attempts-help',
          inputId: 'publish-test-max-attempts',
        },
        timeLimit: {
          describedByIds: ['publish-test-time-limit-help'],
          helpId: 'publish-test-time-limit-help',
          inputId: 'publish-test-time-limit',
        },
        title: {
          describedByIds: ['publish-test-assignment-title-help'],
          helpId: 'publish-test-assignment-title-help',
          inputId: 'publish-test-assignment-title',
        },
      },
      previewContextDescription: 'publish-test-preview-context-description',
      previewContextStatusMessage:
        'publish-test-preview-context-status-message',
      previewContextTitle: 'publish-test-preview-context-title',
      previewLabel: 'publish-test-preview-label',
      previewReviewLabel: 'publish-test-preview-review-label',
      reviewItemIds: {
        'results-policy': {
          describedByIds: [
            'publish-test-preview-review-results-policy-description',
          ],
          descriptionId:
            'publish-test-preview-review-results-policy-description',
          labelledByIds: ['publish-test-preview-review-results-policy-label'],
          labelId: 'publish-test-preview-review-results-policy-label',
        },
        'snapshot-freeze': {
          describedByIds: [
            'publish-test-preview-review-snapshot-freeze-description',
          ],
          descriptionId:
            'publish-test-preview-review-snapshot-freeze-description',
          labelledByIds: ['publish-test-preview-review-snapshot-freeze-label'],
          labelId: 'publish-test-preview-review-snapshot-freeze-label',
        },
        'student-link-rules': {
          describedByIds: [
            'publish-test-preview-review-student-link-rules-description',
          ],
          descriptionId:
            'publish-test-preview-review-student-link-rules-description',
          labelledByIds: [
            'publish-test-preview-review-student-link-rules-label',
          ],
          labelId: 'publish-test-preview-review-student-link-rules-label',
        },
      },
      statItemIds: {
        closeAfter: {
          labelId: 'publish-test-preview-stat-close-after-label',
          valueId: 'publish-test-preview-stat-close-after-value',
        },
        deliveryRules: {
          labelId: 'publish-test-preview-stat-delivery-rules-label',
          valueId: 'publish-test-preview-stat-delivery-rules-value',
        },
        studentInstructions: {
          labelId: 'publish-test-preview-stat-student-instructions-label',
          valueId: 'publish-test-preview-stat-student-instructions-value',
        },
        timer: {
          labelId: 'publish-test-preview-stat-timer-label',
          valueId: 'publish-test-preview-stat-timer-value',
        },
      },
      toggleGroup: 'publish-test-delivery-toggle-group',
      toggleIds: {
        collectStudentName: {
          describedByIds: ['publish-test-collect-student-name-description'],
          descriptionId: 'publish-test-collect-student-name-description',
          inputId: 'publish-test-collect-student-name-toggle',
        },
        showCorrectAnswers: {
          describedByIds: ['publish-test-show-correct-answers-description'],
          descriptionId: 'publish-test-show-correct-answers-description',
          inputId: 'publish-test-show-correct-answers-toggle',
        },
        shuffleItems: {
          describedByIds: ['publish-test-shuffle-items-description'],
          descriptionId: 'publish-test-shuffle-items-description',
          inputId: 'publish-test-shuffle-items-toggle',
        },
      },
      validationAlert: 'publish-test-validation-alert',
    },
    deliveryRuleCount: 6,
    describesCloseTimeWithHelp: true,
    describesInstructionsWithHelp: true,
    describesMaxAttemptsWithHelp: true,
    describesPreviewWithStatus: true,
    describesPublishTogglesWithHelp: true,
    describesTimeLimitWithHelp: true,
    describesTitleWithHelp: true,
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesInternalActivityIds: false,
    exposesRawSettingsJson: false,
    exposesShareSlug: false,
    exposesStudentInstructions: false,
    fieldCount: 5,
    itemIds: [...ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS],
    previewRegionDescribedByIds: [
      'publish-test-preview-context-description',
      'publish-test-preview-context-status-message',
    ],
    previewRegionLabelledByIds: ['publish-test-preview-label'],
    previewStatCount: 4,
    publishDisabled: false,
    reviewChecklistLabelledByIds: ['publish-test-preview-review-label'],
    reviewItemCount: 3,
    scope: 'assignment-publish-control-semantics',
    status: 'ready',
    toggleCount: 3,
    usesOpaqueControlScope: true,
    usesPreparedControlIds: true,
  });
  assert.equal(publishView.controlBoundary.itemIds.length, 30);
  assertNoPrivatePublishText(JSON.stringify(publishView.controlBoundary));
});

test('publish handoff keeps blocked access and invalid drafts explicit', () => {
  const defaults = buildAssignmentPublishDraftDefaults({
    activityId: SECRET_BLOCKED_ACTIVITY_ID,
    title: SECRET_TITLE,
  });
  const publishView = buildAssignmentPublishDialogViewModel({
    controlIdBase: 'publish-blocked',
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
  assert.deepEqual(
    {
      closeAfterStatus: publishView.controlBoundary.closeAfterStatus,
      controlIdBase: publishView.controlBoundary.controlIdBase,
      deliveryRuleCount: publishView.controlBoundary.deliveryRuleCount,
      fieldCount: publishView.controlBoundary.fieldCount,
      previewStatCount: publishView.controlBoundary.previewStatCount,
      publishDisabled: publishView.controlBoundary.publishDisabled,
      reviewItemCount: publishView.controlBoundary.reviewItemCount,
      scope: publishView.controlBoundary.scope,
      status: publishView.controlBoundary.status,
      toggleCount: publishView.controlBoundary.toggleCount,
      validationAlert: publishView.controlBoundary.controlIds.validationAlert,
    },
    {
      closeAfterStatus: 'none',
      controlIdBase: 'publish-blocked',
      deliveryRuleCount: 6,
      fieldCount: 5,
      previewStatCount: 4,
      publishDisabled: true,
      reviewItemCount: 3,
      scope: 'assignment-publish-control-semantics',
      status: 'blocked',
      toggleCount: 3,
      validationAlert: 'publish-blocked-validation-alert',
    }
  );
  assertNoPrivatePublishText(JSON.stringify(handoffView));
  assertNoPrivatePublishText(JSON.stringify(publishView.controlBoundary));
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
    SECRET_ACTIVITY_ID,
    SECRET_BLOCKED_ACTIVITY_ID,
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
