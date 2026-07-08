import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_RESTORED_VISIBILITY,
  ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS,
  buildActivityDerivativeActionExecutionPlan,
  buildActivityLifecycleHandoffView,
  buildActivityVisibilityActionExecutionPlan,
  getArchivedActivityDerivationError,
  type ActivityLifecycleHandoffItemId,
  type ActivityLifecycleHandoffView,
} from '@/activities/lifecycle';
import {
  buildActivityLibraryCardDisplayView,
  type ActivityLibraryCardViewModel,
} from '@/activities/library-view';
import type { ActivityContent } from '@/activities/types';
import { buildAssignmentPublishDialogAccessView } from '@/assignments/publish-input';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const ACTIVITY_LIBRARY_CARD_SOURCE = readFileSync(
  'src/components/activities/activity-library-card.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT_SHOULD_NOT_LEAK';
const SECRET_ACTIVITY_ID = 'SECRET_ACTIVITY_ID_SHOULD_NOT_LEAK';
const SECRET_ASSIGNMENT_SNAPSHOT = 'SECRET_ASSIGNMENT_SNAPSHOT_SHOULD_NOT_LEAK';
const SECRET_SOURCE_FILE_ID = 'SECRET_SOURCE_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'SECRET_STORAGE_KEY_SHOULD_NOT_LEAK';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE_SHOULD_NOT_LEAK';

test('active activity lifecycle exposes 30 safe archive and derivative slices', () => {
  const handoffView = buildActivityLifecycleHandoffView({
    surface: 'active-library',
    visibility: 'private',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesActivityContentText: false,
    exposesAssignmentSnapshotContent: false,
    exposesInternalActivityIds: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    mutatesAssignmentSnapshots: false,
    scope: 'owner-activity-lifecycle',
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['source-status', 'Private'],
      ['lifecycle-surface', 'Active library'],
      ['owner-scope', 'Owner scoped'],
      ['persisted-source', 'Saved source'],
      ['default-library-scope', 'Active workspace'],
      ['archived-library-scope', 'Restore workspace'],
      ['active-library-visibility', 'Visible'],
      ['archived-library-visibility', 'Hidden'],
      ['edit-action', 'Ready'],
      ['publish-action', 'Ready'],
      ['duplicate-action', 'Ready'],
      ['remix-action', 'Ready'],
      ['archive-action', 'Ready'],
      ['restore-action', 'Not available'],
      ['derivative-gate', 'Derivative allowed'],
      ['restore-before-derive', 'Not required'],
      ['archive-transition', 'To archived'],
      ['restore-transition', 'Blocked'],
      ['restored-visibility', 'Draft'],
      ['content-retention', 'Content retained'],
      ['source-material-retention', 'References retained'],
      ['assignment-snapshot-protection', 'Snapshots unchanged'],
      ['public-assignment-continuity', 'Existing links unchanged'],
      ['status-filter-alignment', 'Active filter'],
      ['server-archive-guard', 'Validated'],
      ['server-restore-guard', 'Validated'],
      ['server-derivative-guard', 'Validated'],
      ['execution-plan', 'archive-or-derive'],
      ['teacher-next-step', 'Ready for library actions'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateLifecycleHandoffText(JSON.stringify(handoffView));
});

test('archived activity lifecycle requires restore before editing or deriving', () => {
  const handoffView = buildActivityLifecycleHandoffView({
    surface: 'archived-library',
    visibility: 'archived',
  });

  assert.equal(
    getLifecycleHandoffValue(handoffView, 'source-status'),
    'Archived'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'lifecycle-surface'),
    'Archived library'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'active-library-visibility'),
    'Hidden'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'archived-library-visibility'),
    'Visible'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'edit-action'),
    'Restore required'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'publish-action'),
    'Restore required'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'duplicate-action'),
    'Restore required'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'remix-action'),
    'Restore required'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'archive-action'),
    'Already archived'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'restore-action'),
    'Ready'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'derivative-gate'),
    'Restore required'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'restore-before-derive'),
    'Restore first'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'restore-transition'),
    'To draft'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'status-filter-alignment'),
    'Archived filter'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'execution-plan'),
    'restore'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'teacher-next-step'),
    'Restore before editing'
  );
  assertNoPrivateLifecycleHandoffText(JSON.stringify(handoffView));
});

test('archived activity card keeps restore-only actions and snapshot boundaries', () => {
  const archivedActivity = buildLifecycleActivity('archived');
  const cardView = buildActivityLibraryCardDisplayView({
    activity: archivedActivity,
    libraryStatus: 'archived',
  });

  assert.equal(cardView.statusLabel, 'Archived');
  assert.equal(cardView.lifecycleHandoffView.surface, 'archived-library');
  assert.equal(
    getLifecycleHandoffValue(
      cardView.lifecycleHandoffView,
      'assignment-snapshot-protection'
    ),
    'Snapshots unchanged'
  );
  assert.equal(
    getLifecycleHandoffValue(
      cardView.lifecycleHandoffView,
      'public-assignment-continuity'
    ),
    'Existing links unchanged'
  );
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
  assertNoPrivateLifecycleHandoffText(JSON.stringify(cardView));
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

test('preview activity lifecycle stays semantic but blocks persisted actions', () => {
  const handoffView = buildActivityLifecycleHandoffView({
    persisted: false,
    surface: 'library-card',
    visibility: 'draft',
  });

  assert.equal(
    getLifecycleHandoffValue(handoffView, 'source-status'),
    'Preview'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'persisted-source'),
    'Preview source'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'edit-action'),
    'Preview only'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'publish-action'),
    'Preview only'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'duplicate-action'),
    'Preview only'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'remix-action'),
    'Preview only'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'archive-action'),
    'Preview only'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'restore-action'),
    'Preview only'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'execution-plan'),
    'blocked'
  );
  assert.equal(
    getLifecycleHandoffValue(handoffView, 'teacher-next-step'),
    'Save activity first'
  );
  assertNoPrivateLifecycleHandoffText(JSON.stringify(handoffView));
});

test('activity lifecycle handoff renders stable DOM relationships', () => {
  assert.match(
    ACTIVITY_LIBRARY_CARD_SOURCE,
    /ActivityLifecycleHandoffItemView[\s\S]*ActivityLifecycleHandoffView[\s\S]*function ActivityLibraryLifecycleHandoff\([\s\S]*const titleId = useId\(\)[\s\S]*const descriptionId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-lifecycle"[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoff\.itemViews\.map[\s\S]*ActivityLibraryLifecycleHandoffItem[\s\S]*function ActivityLibraryLifecycleHandoffItem[\s\S]*const labelId = `activity-lifecycle-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-lifecycle-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-lifecycle-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Activity lifecycle handoff should render each lifecycle slice with stable label, value, and description relationships.'
  );
});

test('activity lifecycle focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-lifecycle-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point activity lifecycle work at the focused script gate.'
  );
  for (const boundary of [
    'owner-scoped archive and restore actions',
    'active and archived library visibility',
    'edit/publish/duplicate/remix gates',
    'restore-before-derive policy',
    'assignment snapshot protection',
    'public assignment continuity',
    'server archive/restore/derivative guards',
    'hidden activity-lifecycle handoff',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace(/[ /-]+/g, '[\\s/-]+')),
      `E2E catalog should mention activity lifecycle boundary: ${boundary}`
    );
  }
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

function getLifecycleHandoffValue(
  view: ActivityLifecycleHandoffView,
  id: ActivityLifecycleHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing lifecycle handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateLifecycleHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_ACTIVITY_ID,
    SECRET_ASSIGNMENT_SNAPSHOT,
    SECRET_SOURCE_FILE_ID,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_NOTE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Lifecycle handoff leaked private text: ${privateValue}`
    );
  }
}
