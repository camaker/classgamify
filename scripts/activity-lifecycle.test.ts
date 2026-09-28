import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_RESTORED_VISIBILITY,
  buildActivityDerivativeActionExecutionPlan,
  buildActivityVisibilityActionExecutionPlan,
  getArchivedActivityDerivationError,
} from '@/activities/lifecycle';
import {
  buildActivityLibraryCardDisplayView,
  type ActivityLibraryCardViewModel,
} from '@/activities/library-view';
import type { ActivityContent } from '@/activities/types';
import { buildAssignmentPublishDialogAccessView } from '@/assignments/publish-input';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('archived activity card keeps restore-only actions and snapshot boundaries', () => {
  const archivedActivity = buildLifecycleActivity('archived');
  const cardView = buildActivityLibraryCardDisplayView({
    activity: archivedActivity,
    libraryStatus: 'archived',
  });

  assert.equal(cardView.statusLabel, 'Archived');
  assert.deepEqual(cardView.actionState, {
    canCreateDerivedWork: false,
    showArchiveAction: false,
    showDerivativeActions: false,
    showEditAction: false,
    showPersistedActions: true,
    showPublishAction: false,
    showRestoreAction: true,
    showRestoreRequiredMessage: true,
    showRemixHint: false,
    showRemixActions: false,
  });
  assert.deepEqual(
    cardView.statusSummary.items.map((item) => ({
      id: item.id,
      tone: item.tone,
      value: item.value,
    })),
    [
      { id: 'library-status', tone: 'blocked', value: 'Archived' },
      { id: 'publish', tone: 'blocked', value: 'Restore required' },
      { id: 'remix', tone: 'blocked', value: 'Restore required' },
      { id: 'source-materials', tone: 'neutral', value: 'No materials' },
    ]
  );
  assert.equal(cardView.actionView.publish.gate.type, 'blocked');
  assert.equal(cardView.actionView.duplicate.gate.type, 'blocked');
  assert.equal(cardView.actionView.remix.gate.type, 'blocked');
  assert.equal(cardView.actionView.restore.statusView.tone, 'ready');
  assert.equal(cardView.actionView.restore.statusView.value, 'Available');
  assert.equal(
    cardView.actionView.restore.requiredMessage,
    getArchivedActivityDerivationError()
  );
  assert.equal(
    cardView.compatibility.restoreRequiredMessage,
    'Ready template modes are preserved, but remix actions unlock only after restore.'
  );
  assert.equal(cardView.compatibility.remixStatusView.tone, 'blocked');
  assert.equal(
    cardView.compatibility.remixStatusView.value,
    'Restore required'
  );
  assert.ok(
    cardView.compatibility.readyTemplateOptions.some(
      (option) => option.template === 'quiz' && option.isCurrent
    )
  );
  assert.ok(cardView.compatibility.lockedTemplateDiagnostics.length > 0);
});

test('archived publish and derivative plans block until restored to draft', () => {
  const archivedActivityId = 'activity-archive-restore';
  const blockedPublishAccess =
    buildAssignmentPublishDialogAccessView('archived');

  assert.equal(blockedPublishAccess.canOpen, false);
  assert.equal(blockedPublishAccess.canPublish, false);
  assert.equal(
    blockedPublishAccess.message,
    getArchivedActivityDerivationError()
  );
  assert.equal(blockedPublishAccess.status, 'blocked');
  assert.equal(blockedPublishAccess.value, 'Restore required');
  assert.deepEqual(
    buildActivityDerivativeActionExecutionPlan({
      action: 'duplicate',
      activityId: archivedActivityId,
      visibility: 'archived',
    }),
    {
      failureMessage: 'Activity could not be duplicated.',
      message: getArchivedActivityDerivationError(),
      reason: 'activity-archived',
      type: 'blocked',
    }
  );
  assert.deepEqual(
    buildActivityDerivativeActionExecutionPlan({
      action: 'remix',
      activityId: archivedActivityId,
      currentTemplateType: 'quiz',
      targetTemplateType: 'match-up',
      visibility: 'archived',
    }),
    {
      failureMessage: 'Activity could not be remixed.',
      message: getArchivedActivityDerivationError(),
      reason: 'activity-archived',
      type: 'blocked',
    }
  );
  assert.deepEqual(
    buildActivityVisibilityActionExecutionPlan({
      action: 'restore',
      activityId: archivedActivityId,
      visibility: 'archived',
    }),
    {
      action: 'restore',
      failureMessage: 'Activity could not be restored.',
      input: {
        activityId: archivedActivityId,
      },
      successMessage: 'Activity restored to drafts.',
      type: 'update-visibility',
    }
  );

  const restoredPublishAccess = buildAssignmentPublishDialogAccessView(
    ACTIVITY_RESTORED_VISIBILITY
  );
  assert.equal(ACTIVITY_RESTORED_VISIBILITY, 'draft');
  assert.equal(restoredPublishAccess.canOpen, true);
  assert.equal(restoredPublishAccess.canPublish, true);
  assert.equal(restoredPublishAccess.status, 'ready');
  assert.equal(restoredPublishAccess.value, 'Available');
  assert.deepEqual(
    buildActivityVisibilityActionExecutionPlan({
      action: 'archive',
      activityId: archivedActivityId,
      visibility: ACTIVITY_RESTORED_VISIBILITY,
    }),
    {
      action: 'archive',
      failureMessage: 'Activity could not be archived.',
      input: {
        activityId: archivedActivityId,
      },
      successMessage: 'Activity archived.',
      type: 'update-visibility',
    }
  );
  assert.deepEqual(
    buildActivityDerivativeActionExecutionPlan({
      action: 'duplicate',
      activityId: archivedActivityId,
      visibility: ACTIVITY_RESTORED_VISIBILITY,
    }),
    {
      action: 'duplicate',
      failureMessage: 'Activity could not be duplicated.',
      input: {
        activityId: archivedActivityId,
      },
      successMessage: 'Activity duplicated.',
      type: 'duplicate',
    }
  );
});

function buildLifecycleActivity(
  status: ActivityLibraryCardViewModel['status']
): ActivityLibraryCardViewModel {
  return {
    content: buildLifecycleContent(),
    description: 'Lifecycle card for archive and restore checks.',
    id: 'activity-archive-restore',
    persisted: true,
    status,
    templateType: 'quiz',
    title: 'Weather lifecycle review',
  };
}

function buildLifecycleContent(): ActivityContent {
  return {
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groups: [],
    language: 'en',
    learningGoal: 'Students can review weather vocabulary.',
    pairs: [
      {
        id: 'pair-rain',
        left: 'rain',
        right: 'water from clouds',
      },
    ],
    questions: [
      {
        answer: 'rain',
        id: 'question-rain',
        options: [
          { id: 'rain', isCorrect: true, text: 'rain' },
          { id: 'sun', text: 'sun' },
        ],
        prompt: 'What falls from clouds?',
      },
    ],
    sourceMaterials: [],
    sourceSummary: 'Weather lesson notes.',
    subject: 'English',
    teacherNotes: ['Restore before editing.'],
    vocabulary: ['rain', 'sun', 'cloud'],
  };
}
