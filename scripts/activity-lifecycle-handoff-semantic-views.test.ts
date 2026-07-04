import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS,
  buildActivityLifecycleHandoffView,
  type ActivityLifecycleHandoffItemId,
  type ActivityLifecycleHandoffView,
} from '@/activities/lifecycle';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

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
