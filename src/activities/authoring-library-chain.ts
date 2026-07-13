export const ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS = [
  'public-template-entry',
  'worksheet-entry',
  'create-editor-entry',
  'template-source-search',
  'editor-scaffold-loading',
  'shared-create-input',
  'structured-content-fields',
  'editor-readiness-preview',
  'source-material-picker',
  'source-material-summary',
  'save-validation',
  'activity-persistence',
  'edit-route-owner-scope',
  'edit-contract-roundtrip',
  'library-owner-scope',
  'library-search-normalization',
  'library-template-filter',
  'library-status-filter',
  'library-source-filter',
  'library-pagination',
  'library-summary-metrics',
  'card-readiness-summary',
  'card-source-materials',
  'duplicate-draft-boundary',
  'remix-readiness-boundary',
  'archive-lifecycle-gate',
  'restore-lifecycle-gate',
  'publish-access-boundary',
  'snapshot-protection',
  'editor-workflow-handoff-boundary',
] as const;

export const ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/routes/templates.tsx',
  'src/routes/worksheets.tsx',
  'src/routes/create.tsx',
  'src/routes/dashboard/activities.tsx',
  'src/routes/dashboard/activities/$activityId.tsx',
  'src/api/activities.ts',
  'src/activities/template-entry.ts',
  'src/activities/entry-page-view.ts',
  'src/activities/editor.ts',
  'src/activities/validation.ts',
  'src/activities/persistence.ts',
  'src/activities/scaffolds.ts',
  'src/activities/catalog.ts',
  'src/activities/detail-query.ts',
  'src/activities/library-filters.ts',
  'src/activities/library-query.ts',
  'src/activities/library-summary.ts',
  'src/activities/library-view.ts',
  'src/activities/lifecycle.ts',
  'src/activities/duplicate.ts',
  'src/activities/template-remix.ts',
  'src/activities/ai-remix-assist.ts',
  'src/activities/material-summary.ts',
  'src/activities/material-references.ts',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-library-card.tsx',
  'src/assignments/publish-input.ts',
  'src/assignments/snapshot.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityAuthoringLibraryChainHandoffItemId =
  (typeof ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivityAuthoringLibraryChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAuthoringLibraryChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAuthoringLibraryChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinksWithoutTeacherAction: false;
  editsPublishedAssignmentSnapshots: false;
  exposesAnswerText: false;
  exposesPromptTextInHandoff: false;
  exposesRawEditorInput: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesInHandoff: false;
  itemIds: ActivityAuthoringLibraryChainHandoffItemId[];
  requiresAuthenticatedTeacherForPersistence: true;
  requiresCreateActivityInputContract: true;
  requiresOwnerScopedLibrary: true;
  requiresTeacherSave: true;
  sourceFiles: string[];
  usesAssignmentSnapshotsForExistingLinks: true;
  usesActivityEditorWorkflowHandoff: true;
  usesSharedTemplateReadiness: true;
};

export type ActivityAuthoringLibraryChainHandoffView = {
  description: string;
  itemViews: ActivityAuthoringLibraryChainHandoffItemView[];
  privacy: ActivityAuthoringLibraryChainPrivacyContract;
  title: string;
};

export function buildActivityAuthoringLibraryChainHandoffView(): ActivityAuthoringLibraryChainHandoffView {
  const itemViews = ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildActivityAuthoringLibraryChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice activity authoring and library chain from public template and worksheet entries through shared editor save, edit hydration, owner-scoped library management, derivative drafts, lifecycle gates, and publish snapshot boundaries.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinksWithoutTeacherAction: false,
      editsPublishedAssignmentSnapshots: false,
      exposesAnswerText: false,
      exposesPromptTextInHandoff: false,
      exposesRawEditorInput: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialFilenames: false,
      exposesSourceMaterialStorageKeys: false,
      exposesTeacherNotesInHandoff: false,
      itemIds: [...ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS],
      requiresAuthenticatedTeacherForPersistence: true,
      requiresCreateActivityInputContract: true,
      requiresOwnerScopedLibrary: true,
      requiresTeacherSave: true,
      sourceFiles: [...ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES],
      usesAssignmentSnapshotsForExistingLinks: true,
      usesActivityEditorWorkflowHandoff: true,
      usesSharedTemplateReadiness: true,
    },
    title: 'Activity authoring/library chain',
  };
}

function buildActivityAuthoringLibraryChainHandoffItemView(
  id: ActivityAuthoringLibraryChainHandoffItemId
): ActivityAuthoringLibraryChainHandoffItemView {
  const item = getActivityAuthoringLibraryChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivityAuthoringLibraryChainHandoffItem(
  id: ActivityAuthoringLibraryChainHandoffItemId
): Omit<ActivityAuthoringLibraryChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'public-template-entry':
      return item(
        id,
        'Public template entry',
        '/templates',
        'Template cards start teachers in /create with a selected primary template and the shared editor contract.'
      );
    case 'worksheet-entry':
      return item(
        id,
        'Worksheet entry',
        '/worksheets',
        'Worksheet-style modes enter the same activity editor instead of creating a parallel worksheet product.'
      );
    case 'create-editor-entry':
      return item(
        id,
        'Create editor entry',
        '/create',
        'The create route owns the teacher-reviewed editor workflow before any activity is saved.'
      );
    case 'template-source-search':
      return item(
        id,
        'Template source search',
        'template/source params',
        'Template and source query parsing uses shared helpers before the editor chooses scaffolds or copy.'
      );
    case 'editor-scaffold-loading':
      return item(
        id,
        'Editor scaffold loading',
        'Reviewed scaffolds',
        'Template-specific scaffolds fill structured example fields for teacher review before saving.'
      );
    case 'shared-create-input':
      return item(
        id,
        'Shared create input',
        'CreateActivityInput',
        'Manual creation, AI-applied drafts, edit saves, and scaffolds use the same validated activity input shape.'
      );
    case 'structured-content-fields':
      return item(
        id,
        'Structured content fields',
        'Questions/pairs/groups',
        'The editor keeps reusable questions, pairs, groups, vocabulary, source summary, and teacher notes in the shared content model.'
      );
    case 'editor-readiness-preview':
      return item(
        id,
        'Editor readiness preview',
        'TemplateRemixPlan',
        'Before save, the editor previews ready and locked template families with the deterministic remix model.'
      );
    case 'source-material-picker':
      return item(
        id,
        'Source material picker',
        'Owner files',
        'Teacher files attach as compact source-material references owned by the current teacher.'
      );
    case 'source-material-summary':
      return item(
        id,
        'Source material summary',
        'Kind/count only',
        'Cards and editor summaries show safe material counts and kinds without raw file identifiers or storage keys.'
      );
    case 'save-validation':
      return item(
        id,
        'Save validation',
        'Zod validation',
        'Create and update server functions validate teacher-reviewed input before persistence.'
      );
    case 'activity-persistence':
      return item(
        id,
        'Activity persistence',
        'Create/update helpers',
        'Persistence helpers build insert and update sets only after an authenticated teacher save action.'
      );
    case 'edit-route-owner-scope':
      return item(
        id,
        'Edit route owner scope',
        'Authenticated owner',
        'Saved activity detail loading and edit access stay scoped to the current teacher owner.'
      );
    case 'edit-contract-roundtrip':
      return item(
        id,
        'Edit contract roundtrip',
        'Content to editor input',
        'Saved ActivityContent converts back into CreateActivityInput fields so reopened activities use the same editor.'
      );
    case 'library-owner-scope':
      return item(
        id,
        'Library owner scope',
        'Owner-scoped API',
        'Activity library list queries filter by the current teacher and never include other teachers or starter previews as owned rows.'
      );
    case 'library-search-normalization':
      return item(
        id,
        'Library search normalization',
        'NFKC trimmed search',
        'Search terms are normalized before matching titles, descriptions, or template types.'
      );
    case 'library-template-filter':
      return item(
        id,
        'Library template filter',
        'Exact template',
        'Template filters resolve to known template families before narrowing the owner-scoped library.'
      );
    case 'library-status-filter':
      return item(
        id,
        'Library status filter',
        'Active/archived',
        'Status filters separate active and archived activity visibility in the same list contract.'
      );
    case 'library-source-filter':
      return item(
        id,
        'Library source filter',
        'Material kind filter',
        'Source-material filters reuse material summary readiness for audio, worksheet, spreadsheet, and extractable activities.'
      );
    case 'library-pagination':
      return item(
        id,
        'Library pagination',
        'Bounded pages',
        'Paginated library pages sort deterministically and keep search, status, template, and source filters stable.'
      );
    case 'library-summary-metrics':
      return item(
        id,
        'Library summary metrics',
        'Full filtered result',
        'Overview metrics summarize the full current filtered result instead of only the visible page.'
      );
    case 'card-readiness-summary':
      return item(
        id,
        'Card readiness summary',
        'Ready/locked modes',
        'Activity cards expose template readiness and remix actions from the shared deterministic readiness model.'
      );
    case 'card-source-materials':
      return item(
        id,
        'Card source materials',
        'Kind/count badges',
        'Activity cards summarize attached source materials by safe count and material kind before reopening the editor.'
      );
    case 'duplicate-draft-boundary':
      return item(
        id,
        'Duplicate draft boundary',
        'Draft copy',
        'Duplicating clones structured content into a draft without mutating the original activity or existing assignments.'
      );
    case 'remix-readiness-boundary':
      return item(
        id,
        'Remix readiness boundary',
        'Ready target only',
        'Template remix drafts are allowed only for ready target templates and remain teacher-reviewed drafts.'
      );
    case 'archive-lifecycle-gate':
      return item(
        id,
        'Archive lifecycle gate',
        'Archive blocks derive',
        'Archived activities leave snapshots intact but block publish, duplicate, and remix derivations until restore.'
      );
    case 'restore-lifecycle-gate':
      return item(
        id,
        'Restore lifecycle gate',
        'Restore before derive',
        'Restoring returns an activity to draft visibility so future edits, publishing, duplication, and remixing can resume.'
      );
    case 'publish-access-boundary':
      return item(
        id,
        'Publish access boundary',
        'Publish dialog only',
        'Assignments and share links are created only through the explicit publish dialog and delivery preview.'
      );
    case 'snapshot-protection':
      return item(
        id,
        'Snapshot protection',
        'AssignmentSnapshot',
        'Editing, duplicating, archiving, or remixing an activity does not mutate already published assignment snapshots.'
      );
    case 'editor-workflow-handoff-boundary':
      return item(
        id,
        'Editor workflow handoff boundary',
        '30 editor workflow slices',
        'Workflow source and order, create/edit surfaces, template and scaffold state, AI draft source, structured content, source materials, review readiness, save controls, auth, publish boundaries, and privacy guards stay aligned.'
      );
  }
}

function item(
  id: ActivityAuthoringLibraryChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityAuthoringLibraryChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
