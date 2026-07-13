import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES,
  buildActivityAuthoringLibraryChainHandoffView,
  type ActivityAuthoringLibraryChainHandoffItemId,
  type ActivityAuthoringLibraryChainHandoffView,
} from '@/activities/authoring-library-chain';
import {
  ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS,
  ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS,
  ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS,
} from '@/activities/editor';
import { PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS } from '@/activities/entry-page-view';
import { ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS } from '@/activities/duplicate';
import { ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS } from '@/activities/lifecycle';
import { ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS } from '@/activities/library-view';
import { ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS } from '@/activities/material-summary';
import { ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS } from '@/activities/material-references';
import { ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS } from '@/activities/scaffolds';
import { ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS } from '@/activities/template-remix';
import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ACTIVITIES_API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const CREATE_ROUTE_SOURCE = readFileSync('src/routes/create.tsx', 'utf8');
const LIBRARY_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities.tsx',
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
const EDIT_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities/$activityId.tsx',
  'utf8'
);
const EDITOR_SOURCE = readFileSync('src/activities/editor.ts', 'utf8');
const LIBRARY_FILTERS_SOURCE = readFileSync(
  'src/activities/library-filters.ts',
  'utf8'
);
const LIBRARY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const LIFECYCLE_SOURCE = readFileSync('src/activities/lifecycle.ts', 'utf8');
const PUBLISH_SOURCE = readFileSync('src/assignments/publish-input.ts', 'utf8');
const SNAPSHOT_SOURCE = readFileSync('src/assignments/snapshot.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_TEXT = 'SECRET_AUTHORING_LIBRARY_ANSWER';
const PRIVATE_FILE_ID = 'secret-authoring-library-file-id';
const PRIVATE_FILENAME = 'secret-authoring-library.pdf';
const PRIVATE_PROMPT_TEXT = 'SECRET_AUTHORING_LIBRARY_PROMPT';
const PRIVATE_RAW_INPUT = '{"questionsText":"PRIVATE_RAW_EDITOR_INPUT"}';
const PRIVATE_STORAGE_KEY = 'source-materials/private/authoring.pdf';

test('activity authoring/library chain exposes 30 safe workflow slices', () => {
  const handoffView = buildActivityAuthoringLibraryChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Activity authoring/library chain');
  assert.match(
    handoffView.description,
    /Thirty-slice activity authoring and library chain/
  );
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
    chainSourceFileCount: ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
    editsPublishedAssignmentSnapshots: false,
    exposesAnswerText: false,
    exposesPromptTextInHandoff: false,
    exposesRawEditorInput: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesInHandoff: false,
    itemIds,
    requiresAuthenticatedTeacherForPersistence: true,
    requiresCreateActivityInputContract: true,
    requiresOwnerScopedLibrary: true,
    requiresTeacherSave: true,
    sourceFiles: [...ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES],
    usesAssignmentSnapshotsForExistingLinks: true,
    usesActivityEditorWorkflowHandoff: true,
    usesSharedTemplateReadiness: true,
  });
  assertNoPrivateActivityWorkflowText(JSON.stringify(handoffView));
});

test('activity authoring/library chain summarizes authoring to library flow', () => {
  const handoffView = buildActivityAuthoringLibraryChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['public-template-entry', '/templates'],
      ['worksheet-entry', '/worksheets'],
      ['create-editor-entry', '/create'],
      ['template-source-search', 'template/source params'],
      ['editor-scaffold-loading', 'Reviewed scaffolds'],
      ['shared-create-input', 'CreateActivityInput'],
      ['structured-content-fields', 'Questions/pairs/groups'],
      ['editor-readiness-preview', 'TemplateRemixPlan'],
      ['source-material-picker', 'Owner files'],
      ['source-material-summary', 'Kind/count only'],
      ['save-validation', 'Zod validation'],
      ['activity-persistence', 'Create/update helpers'],
      ['edit-route-owner-scope', 'Authenticated owner'],
      ['edit-contract-roundtrip', 'Content to editor input'],
      ['library-owner-scope', 'Owner-scoped API'],
      ['library-search-normalization', 'NFKC trimmed search'],
      ['library-template-filter', 'Exact template'],
      ['library-status-filter', 'Active/archived'],
      ['library-source-filter', 'Material kind filter'],
      ['library-pagination', 'Bounded pages'],
      ['library-summary-metrics', 'Full filtered result'],
      ['card-readiness-summary', 'Ready/locked modes'],
      ['card-source-materials', 'Kind/count badges'],
      ['duplicate-draft-boundary', 'Draft copy'],
      ['remix-readiness-boundary', 'Ready target only'],
      ['archive-lifecycle-gate', 'Archive blocks derive'],
      ['restore-lifecycle-gate', 'Restore before derive'],
      ['publish-access-boundary', 'Publish dialog only'],
      ['snapshot-protection', 'AssignmentSnapshot'],
      ['editor-workflow-handoff-boundary', '30 editor workflow slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'shared-create-input'),
    'CreateActivityInput'
  );
  assert.equal(
    getHandoffValue(handoffView, 'snapshot-protection'),
    'AssignmentSnapshot'
  );
});

test('activity authoring/library chain is backed by focused gates', () => {
  assert.equal(ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity authoring/library chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS.length,
      ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS.length,
      ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIFECYCLE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 12 }, () => 30)
  );
});

test('activity authoring/library sources preserve product boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teachers must be able to reopen and edit saved activities[\s\S]*Editing uses the same `CreateActivityInput` contract[\s\S]*Published assignments score against their snapshot/,
    'docs/product.md should keep edit roundtrips on the shared activity input contract and protect published snapshots.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /The public template directory should act as a real creation entry point[\s\S]*land in `\/create` with that\s+primary template selected/,
    'docs/product.md should keep public templates as creation entry points.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /The public `\/worksheets` route[\s\S]*send teachers into `\/create\?template=\.\.\.`[\s\S]*normal activity editor/,
    'docs/product.md should keep worksheet entries inside the normal activity editor.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /authoring\/library chain[\s\S]*editor workflow's 30[\s\S]*AI draft source[\s\S]*review[\s\S]*save controls[\s\S]*publish boundaries[\s\S]*teacher\s+notes[\s\S]*storage keys/,
    'docs/product.md should describe the 30-slice editor workflow handoff and its privacy boundary.'
  );
  assert.match(
    CREATE_ROUTE_SOURCE,
    /source: parseCreateActivityTemplateSourceSearch\(search\.source\)[\s\S]*template: parseCreateActivityTemplateSearch\(search\.template\)[\s\S]*buildActivityCreatePageEditorViewModel\(\{[\s\S]*templateSource: source,[\s\S]*templateType: template/,
    'The create route should parse template/source search params through shared helpers before building the editor view model.'
  );
  assert.match(
    EDITOR_SOURCE,
    /activityContentToEditorInput[\s\S]*CreateActivityInput[\s\S]*questionsText: formatEditorQuestionRows[\s\S]*sourceMaterials: normalizeActivityMaterialReferences/,
    'Saved activity content should roundtrip back into CreateActivityInput fields for edit hydration.'
  );
});

test('activity API and library helpers keep owner scope and lifecycle gates', () => {
  assert.match(
    ACTIVITIES_API_SOURCE,
    /listActivities = createServerFn\(\{ method: 'GET' \}\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildActivityLibraryWhere\(\{[\s\S]*userId/,
    'Activity listing should require auth and build an owner-scoped query.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /createActivity = createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.validator\(createActivityInputSchema\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildActivityCreateInsert/,
    'Activity creation should validate CreateActivityInput before authenticated persistence.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /updateActivity = createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.validator\(updateActivityInputSchema\)[\s\S]*assertActivityCanEdit\(existingActivity\.visibility\)[\s\S]*buildActivityUpdateSet/,
    'Activity updates should validate input and pass the edit lifecycle gate before persistence.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /duplicateActivity = createServerFn[\s\S]*buildActivityDetailOwnerWhere[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*buildDuplicatedActivityInsert/,
    'Activity duplication should stay owner-scoped and blocked for archived source activities.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /remixActivityTemplate = createServerFn[\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*assertTemplateRemixOptionReady\(remixOption\)[\s\S]*buildRemixedActivityInsert/,
    'Template remix should require owner scope, lifecycle derivation, and ready target templates.'
  );
  assert.match(
    LIBRARY_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(activity\.ownerId, userId\)\][\s\S]*eq\(activity\.visibility, 'archived'\)[\s\S]*ne\(activity\.visibility, 'archived'\)[\s\S]*sqlLikeContains\(activity\.title/,
    'Library queries should keep owner scope while applying status and normalized search filters.'
  );
  assert.match(
    LIBRARY_FILTERS_SOURCE,
    /normalizeActivityLibrarySearch[\s\S]*normalize\('NFKC'\)[\s\S]*buildActivityLibraryRouteSearch[\s\S]*parseActivitySourceMaterialFilter[\s\S]*matchesActivitySourceMaterialFilter/,
    'Library filters should normalize search and share template/status/source parsing.'
  );
});

test('activity authoring/library sources preserve publish and snapshot boundary', () => {
  assert.match(
    LIBRARY_ROUTE_SOURCE,
    /<ActivityLibraryCard[\s\S]*activity=\{buildActivityLibraryCardViewModel\(activity\)\}[\s\S]*libraryStatus=\{libraryStatus\}/,
    'The activity library route should render owner-scoped activity cards for publish and lifecycle actions.'
  );
  assert.match(
    ACTIVITY_LIBRARY_CARD_SOURCE,
    /buildAssignmentPublishDialogAccessView\(activity\.status\)[\s\S]*setPublishDialogOpen\(true\)[\s\S]*<ActivityPublishDialog[\s\S]*activity=\{\{[\s\S]*id: activity\.id,[\s\S]*title: cardDisplayView\.displayTitle,[\s\S]*visibility: activity\.status,[\s\S]*search: buildAssignmentListRouteSearch\(\{[\s\S]*published: result\.assignment\.shareSlug/,
    'Activity cards should gate publish access before opening the publish dialog and redirect with the published share context.'
  );
  assert.match(
    CREATED_ACTIVITY_PANEL_SOURCE,
    /buildAssignmentPublishDialogAccessView\([\s\S]*activity\.visibility[\s\S]*setPublishDialogOpen\(true\)[\s\S]*<ActivityPublishDialog[\s\S]*id: activity\.id,[\s\S]*visibility: activity\.visibility[\s\S]*published: result\.assignment\.shareSlug/,
    'The created-activity panel should use the same publish access gate and publish dialog path.'
  );
  assert.match(
    EDIT_ROUTE_SOURCE,
    /buildActivityEditRouteState\(\{[\s\S]*activity,[\s\S]*isError,[\s\S]*isLoading,[\s\S]*<ActivityCreateForm[\s\S]*activityId=\{pageView\.editor\.activityId\}[\s\S]*initialValues=\{pageView\.editor\.initialValues\}[\s\S]*mode=\{pageView\.editor\.mode\}/,
    'The edit route should hydrate the shared activity form in edit mode.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /canDeriveActivityWork\(visibility: ActivityVisibility\)[\s\S]*return !isActivityArchived\(visibility\)[\s\S]*assertActivityCanDeriveWork\(visibility: ActivityVisibility\)[\s\S]*!canDeriveActivityWork\(visibility\)[\s\S]*getArchivedActivityDerivationError/,
    'Archived activities should block publish, duplicate, and remix derivation until restore.'
  );
  assert.match(
    PUBLISH_SOURCE,
    /buildAssignmentPublishDialogViewModel[\s\S]*buildAssignmentPublishHandoffView[\s\S]*snapshot-freeze[\s\S]*public-payload-boundary/,
    'Publish dialog view models should expose snapshot and public-payload boundaries.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /buildAssignmentSnapshotInsert[\s\S]*activityTitle[\s\S]*templateType[\s\S]*contentJson/,
    'Assignment snapshots should freeze title, template, and content for published links.'
  );
});

test('activity authoring/library chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity authoring\/library chain has a fast script-level gate via[\s\S]*scripts\/activity-authoring-library-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the activity authoring/library chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /public template and worksheet entries[\s\S]*shared editor save[\s\S]*30-slice editor workflow handoff boundary[\s\S]*edit hydration[\s\S]*owner-scoped library management[\s\S]*derivative drafts[\s\S]*lifecycle gates[\s\S]*publish snapshot boundaries/,
    'TEST-CATALOG should document the public-entry to library-management chain scope.'
  );
});

function getHandoffValue(
  view: ActivityAuthoringLibraryChainHandoffView,
  id: ActivityAuthoringLibraryChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing activity authoring/library chain item ${id}`);
  return item.value;
}

function assertNoPrivateActivityWorkflowText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_TEXT,
    PRIVATE_FILE_ID,
    PRIVATE_FILENAME,
    PRIVATE_PROMPT_TEXT,
    PRIVATE_RAW_INPUT,
    PRIVATE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity authoring/library chain leaked private text: ${privateValue}`
    );
  }
}
