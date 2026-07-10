import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES,
} from '@/activities/authoring-library-chain';
import { ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS } from '@/activities/duplicate';
import {
  ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES,
  buildActivityLifecycleGovernanceChainHandoffView,
  type ActivityLifecycleGovernanceChainHandoffItemId,
  type ActivityLifecycleGovernanceChainHandoffView,
} from '@/activities/activity-lifecycle-governance-chain';
import {
  ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS,
  ACTIVITY_RESTORED_VISIBILITY,
  assertActivityCanArchive,
  assertActivityCanDeriveWork,
  assertActivityCanEdit,
  assertActivityCanRestore,
  buildActivityDerivativeActionExecutionPlan,
  buildActivityVisibilityActionExecutionPlan,
} from '@/activities/lifecycle';
import { ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS } from '@/activities/library-view';
import { ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS } from '@/activities/template-remix';
import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ACTIVITIES_API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ACTIVITY_HOOK_SOURCE = readFileSync(
  'src/hooks/use-activities.ts',
  'utf8'
);
const LIFECYCLE_SOURCE = readFileSync('src/activities/lifecycle.ts', 'utf8');
const LIBRARY_FILTERS_SOURCE = readFileSync(
  'src/activities/library-filters.ts',
  'utf8'
);
const LIBRARY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const LIBRARY_VIEW_SOURCE = readFileSync(
  'src/activities/library-view.ts',
  'utf8'
);
const PERSISTENCE_SOURCE = readFileSync(
  'src/activities/persistence.ts',
  'utf8'
);
const DUPLICATE_SOURCE = readFileSync('src/activities/duplicate.ts', 'utf8');
const TEMPLATE_REMIX_SOURCE = readFileSync(
  'src/activities/template-remix.ts',
  'utf8'
);
const PUBLISH_INPUT_SOURCE = readFileSync(
  'src/assignments/publish-input.ts',
  'utf8'
);
const SNAPSHOT_SOURCE = readFileSync('src/assignments/snapshot.ts', 'utf8');
const LIBRARY_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const EDIT_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities/$activityId.tsx',
  'utf8'
);
const ACTIVITY_LIBRARY_CARD_SOURCE = readFileSync(
  'src/components/activities/activity-library-card.tsx',
  'utf8'
);
const CREATED_ACTIVITY_PANEL_SOURCE = readFileSync(
  'src/components/activities/created-activity-panel.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_LIFECYCLE_CONTENT';
const PRIVATE_ACTIVITY_ID = 'SECRET_ACTIVITY_LIFECYCLE_ID';
const PRIVATE_ASSIGNMENT_SNAPSHOT = 'SECRET_ASSIGNMENT_SNAPSHOT_CONTENT';
const PRIVATE_FILE_ID = 'SECRET_ACTIVITY_SOURCE_FILE_ID';
const PRIVATE_STORAGE_KEY = 'source-materials/private/lifecycle.pdf';
const PRIVATE_TEACHER_NOTE = 'SECRET_ACTIVITY_TEACHER_NOTE';

test('activity lifecycle governance chain exposes 30 safe lifecycle slices', () => {
  const handoffView = buildActivityLifecycleGovernanceChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Activity lifecycle governance chain');
  assert.match(handoffView.description, /Thirty-slice activity lifecycle/);
  assert.equal(handoffView.itemViews.length, 30);
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
    archivedActivitiesBlockDerivatives: true,
    chainSourceFileCount:
      ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length,
    deletesActivityContentOnArchive: false,
    exposesActivityContentText: false,
    exposesAssignmentSnapshotContent: false,
    exposesInternalActivityIds: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    mutatesPublishedAssignmentSnapshots: false,
    requiresOwnerScope: true,
    restoredVisibility: 'draft',
    sourceFiles: [...ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES],
  });
  assertNoPrivateLifecycleGovernanceText(JSON.stringify(handoffView));
});

test('activity lifecycle governance chain summarizes archive and restore boundaries', () => {
  const handoffView = buildActivityLifecycleGovernanceChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-archive-policy', 'Restore before derive'],
      ['lifecycle-domain-source', 'activities/lifecycle'],
      ['restored-visibility-contract', 'draft'],
      ['library-status-parser', 'active/archived'],
      ['library-active-scope', 'Archived hidden'],
      ['library-archived-scope', 'Archived only'],
      ['library-owner-query', 'Owner scoped'],
      ['library-status-summary', 'Full filtered result'],
      ['card-action-state', 'Restore-only archived'],
      ['hidden-lifecycle-handoff', '30 semantic items'],
      ['archive-execution-plan', 'Validated transition'],
      ['restore-execution-plan', 'Validated transition'],
      ['edit-access-gate', 'Archived blocked'],
      ['publish-access-gate', 'Archived blocked'],
      ['publish-api-derivation-gate', 'Server enforced'],
      ['duplicate-ui-plan', 'Blocked or draft'],
      ['duplicate-api-gate', 'Server enforced'],
      ['remix-ui-plan', 'Ready target only'],
      ['remix-api-gate', 'Server enforced'],
      ['same-template-remix-guard', 'Blocked'],
      ['ready-template-remix-guard', 'Missing content blocked'],
      ['visibility-update-helper', 'Visibility only'],
      ['archive-server-guard', 'Already archived blocked'],
      ['restore-server-guard', 'Not archived blocked'],
      ['content-retention', 'Content retained'],
      ['source-material-retention', 'References retained'],
      ['snapshot-protection', 'Snapshots unchanged'],
      ['public-assignment-continuity', 'Existing links unchanged'],
      ['created-panel-publish-gate', 'Same access view'],
      ['lifecycle-governance-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'restored-visibility-contract'),
    'draft'
  );
  assert.equal(
    getHandoffValue(handoffView, 'snapshot-protection'),
    'Snapshots unchanged'
  );
});

test('activity lifecycle governance chain is backed by focused lifecycle gates', () => {
  assert.equal(ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity lifecycle governance chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 7 }, () => 30)
  );
});

test('activity lifecycle domain helpers enforce restore before derivative work', () => {
  assert.equal(ACTIVITY_RESTORED_VISIBILITY, 'draft');
  assert.doesNotThrow(() => assertActivityCanDeriveWork('draft'));
  assert.throws(
    () => assertActivityCanDeriveWork('archived'),
    /Restore this activity before publishing, duplicating, or remixing it/
  );
  assert.doesNotThrow(() => assertActivityCanEdit('draft'));
  assert.throws(() => assertActivityCanEdit('archived'));
  assert.doesNotThrow(() => assertActivityCanArchive('draft'));
  assert.throws(() => assertActivityCanArchive('archived'));
  assert.doesNotThrow(() => assertActivityCanRestore('archived'));
  assert.throws(() => assertActivityCanRestore('draft'));
  assert.deepEqual(
    buildActivityDerivativeActionExecutionPlan({
      action: 'duplicate',
      activityId: 'activity-restore-first',
      visibility: 'archived',
    }),
    {
      failureMessage: 'Activity could not be duplicated.',
      message:
        'Restore this activity before publishing, duplicating, or remixing it.',
      reason: 'activity-archived',
      type: 'blocked',
    }
  );
  assert.deepEqual(
    buildActivityVisibilityActionExecutionPlan({
      action: 'restore',
      activityId: 'activity-restore-first',
      visibility: 'archived',
    }),
    {
      action: 'restore',
      failureMessage: 'Activity could not be restored.',
      input: {
        activityId: 'activity-restore-first',
      },
      successMessage: 'Activity restored to drafts.',
      type: 'update-visibility',
    }
  );
});

test('activity lifecycle sources keep library scopes and UI gates aligned', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teachers can soft-archive activities[\s\S]*restore them\s+later[\s\S]*Archived activities cannot be\s+published, duplicated, or remixed[\s\S]*server functions/,
    'docs/product.md should preserve the restore-before-derive lifecycle policy.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Activity lifecycle governance should flow through shared domain helpers[\s\S]*library cards[\s\S]*server functions[\s\S]*restore-before-derive contract/,
    'docs/product.md should keep lifecycle governance shared across UI and server enforcement.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /export const ACTIVITY_RESTORED_VISIBILITY = 'draft'[\s\S]*canDeriveActivityWork\(visibility: ActivityVisibility\)[\s\S]*return !isActivityArchived\(visibility\)[\s\S]*buildActivityDerivativeActionGate[\s\S]*reason: 'activity-archived'[\s\S]*buildActivityDerivativeActionExecutionPlan[\s\S]*reason: actionView\.gate\.reason/,
    'Activity lifecycle domain should restore to draft and block archived derivative work.'
  );
  assert.match(
    LIBRARY_FILTERS_SOURCE,
    /export const ACTIVITY_LIBRARY_STATUSES = \[[\s\S]*'active'[\s\S]*'archived'/,
    'Library route filters should declare the shared active and archived scopes.'
  );
  assert.match(
    LIBRARY_FILTERS_SOURCE,
    /buildActivityLibraryRouteSearch[\s\S]*status: normalizedStatus === 'active' \? undefined : normalizedStatus/,
    'Library route filters should omit active status from default route URLs.'
  );
  assert.match(
    LIBRARY_FILTERS_SOURCE,
    /parseActivityLibraryStatus[\s\S]*isActivityLibraryStatus\(value\)/,
    'Library route filters should parse status through the shared lifecycle status guard.'
  );
  assert.match(
    LIBRARY_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(activity\.ownerId, userId\)\][\s\S]*status === 'archived'[\s\S]*eq\(activity\.visibility, 'archived'\)[\s\S]*ne\(activity\.visibility, 'archived'\)/,
    'Library queries should keep owner scope and split active versus archived visibility.'
  );
  assert.match(
    LIBRARY_VIEW_SOURCE,
    /buildActivityLibraryCardActionState[\s\S]*canCreateDerivedWork = canDeriveActivityWork\(visibility\)[\s\S]*showPublishAction: persisted && showActiveActions && canCreateDerivedWork[\s\S]*showRestoreAction: persisted && archived[\s\S]*showRestoreRequiredMessage: persisted && archived/,
    'Library card state should hide derivative actions and show restore guidance for archived cards.'
  );
  assert.match(
    LIBRARY_ROUTE_SOURCE,
    /validateSearch: buildActivityLibraryValidatedSearch[\s\S]*status: libraryStatus[\s\S]*<ActivityLibraryCard[\s\S]*libraryStatus=\{libraryStatus\}/,
    'Activity library route should pass validated lifecycle scope into cards.'
  );
  assert.match(
    ACTIVITY_LIBRARY_CARD_SOURCE,
    /buildActivityDerivativeActionExecutionPlan[\s\S]*buildActivityVisibilityActionExecutionPlan[\s\S]*openPublishDialog\(\)[\s\S]*buildAssignmentPublishDialogAccessView\(activity\.status\)[\s\S]*ActivityLibraryLifecycleHandoff/,
    'Activity cards should use shared lifecycle plans for archive, restore, duplicate, remix, and publish access.'
  );
});

test('activity lifecycle APIs preserve server-side lifecycle enforcement', () => {
  assert.match(
    ACTIVITIES_API_SOURCE,
    /export const updateActivity[\s\S]*buildActivityLifecycleGateSelect\(\)[\s\S]*assertActivityCanEdit\(existingActivity\.visibility\)[\s\S]*buildActivityUpdateSet/,
    'Activity updates should load the owner-scoped lifecycle gate and block archived edit saves.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /export const duplicateActivity[\s\S]*buildActivityDetailOwnerWhere[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*buildDuplicatedActivityInsert/,
    'Duplicate server function should reload an owner-scoped source and block archived sources.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /export const remixActivityTemplate[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*sourceActivity\.templateType === data\.targetTemplateType[\s\S]*assertTemplateRemixOptionReady\(remixOption\)[\s\S]*buildRemixedActivityInsert/,
    'Remix server function should block archived, same-template, and not-ready target requests.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /export const archiveActivity[\s\S]*nextVisibility: 'archived'[\s\S]*export const restoreActivity[\s\S]*nextVisibility: ACTIVITY_RESTORED_VISIBILITY[\s\S]*function updateActivityVisibility[\s\S]*assertActivityCanArchive\(row\.visibility\)[\s\S]*assertActivityCanRestore\(row\.visibility\)[\s\S]*buildActivityVisibilityUpdateSet/,
    'Archive and restore server functions should share one visibility update helper with lifecycle guards.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /export const publishAssignment[\s\S]*buildActivityDetailOwnerWhere[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*buildPublishedAssignmentSnapshotInsert/,
    'Assignment publish API should enforce source lifecycle before freezing a snapshot.'
  );
  assert.match(
    ACTIVITY_HOOK_SOURCE,
    /useArchiveActivity[\s\S]*archiveActivity\(\{ data: input \}\)[\s\S]*invalidateQueries[\s\S]*useRestoreActivity[\s\S]*restoreActivity\(\{ data: input \}\)[\s\S]*invalidateQueries/,
    'Archive and restore hooks should refresh owner-scoped library views after lifecycle mutations.'
  );
});

test('activity lifecycle persistence preserves content, source references, and snapshots', () => {
  assert.match(
    PERSISTENCE_SOURCE,
    /buildActivityVisibilityUpdateSet[\s\S]*updatedAt,[\s\S]*visibility: nextVisibility[\s\S]*buildDuplicatedActivityInsert[\s\S]*contentJson: cloneActivityContentForDerivative\(sourceActivity\.contentJson\)[\s\S]*visibility: 'draft'[\s\S]*buildRemixedActivityInsert[\s\S]*contentJson: cloneActivityContentForDerivative\(sourceActivity\.contentJson\)[\s\S]*visibility: 'draft'/,
    'Lifecycle visibility updates should avoid content mutation while derivative inserts clone content into drafts.'
  );
  assert.match(
    DUPLICATE_SOURCE,
    /cloneActivityContentForDerivative[\s\S]*sourceMaterials: normalizeActivityMaterialReferences[\s\S]*teacherNotes: \[\.\.\.content\.teacherNotes\][\s\S]*buildDuplicatedActivityTitle[\s\S]*buildRemixedActivityTitle/,
    'Derivative content cloning should preserve source-material references and teacher notes without mutating originals.'
  );
  assert.match(
    TEMPLATE_REMIX_SOURCE,
    /assertTemplateRemixOptionReady\(option: TemplateRemixOption\)[\s\S]*throw new TemplateRemixReadinessError\(option\)[\s\S]*getMissingTemplateRequirements/,
    'Template remix readiness should remain a deterministic content-readiness gate.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /buildAssignmentSnapshotInsert[\s\S]*activityTitle[\s\S]*templateType[\s\S]*contentJson/,
    'Assignment snapshots should preserve frozen published content outside activity lifecycle changes.'
  );
  assert.match(
    PUBLISH_INPUT_SOURCE,
    /buildAssignmentPublishDialogAccessView[\s\S]*buildActivityLifecycleActionView\(\{[\s\S]*action: 'publish'[\s\S]*canOpen: !blockedGate[\s\S]*canPublish: !blockedGate/,
    'Publish dialog access should share the activity lifecycle gate before teacher publication.'
  );
  assert.match(
    CREATED_ACTIVITY_PANEL_SOURCE,
    /buildAssignmentPublishDialogAccessView\([\s\S]*activity\.visibility[\s\S]*!accessView\.canOpen[\s\S]*ActivityPublishDialog[\s\S]*visibility: activity\.visibility/,
    'Created activity panel should use the same publish access gate as library cards.'
  );
  assert.match(
    EDIT_ROUTE_SOURCE,
    /buildActivityEditRouteState\(\{[\s\S]*activity,[\s\S]*<ActivityCreateForm[\s\S]*mode=\{pageView\.editor\.mode\}/,
    'Edit route should delegate archived edit access to the activity-domain route state.'
  );
});

test('activity lifecycle governance focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity lifecycle governance chain has a fast script-level gate via[\s\S]*scripts\/activity-lifecycle-governance-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the activity lifecycle governance chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /owner-scoped archive and restore[\s\S]*edit, publish, duplicate, and remix gates[\s\S]*server lifecycle enforcement[\s\S]*content and source-material retention[\s\S]*assignment snapshot protection[\s\S]*public assignment continuity/,
    'TEST-CATALOG should describe the activity lifecycle governance scope.'
  );
});

function getHandoffValue(
  view: ActivityLifecycleGovernanceChainHandoffView,
  id: ActivityLifecycleGovernanceChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing activity lifecycle governance chain item ${id}`);
  return item.value;
}

function assertNoPrivateLifecycleGovernanceText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ACTIVITY_ID,
    PRIVATE_ASSIGNMENT_SNAPSHOT,
    PRIVATE_FILE_ID,
    PRIVATE_STORAGE_KEY,
    PRIVATE_TEACHER_NOTE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity lifecycle governance leaked private text: ${privateValue}`
    );
  }
}
