import { ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS } from '@/assignments/result-actions';

export const ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_HANDOFF_ITEM_IDS = [
  'product-source-policy',
  'snapshot-schema-fields',
  'snapshot-freeze-insert',
  'snapshot-source-resolver',
  'runtime-source-resolver',
  'list-search-current-title',
  'list-search-current-description',
  'list-search-snapshot-title',
  'list-search-snapshot-description',
  'list-card-source-description',
  'public-payload-source-summary',
  'public-snapshot-summary',
  'result-header-source-context',
  'result-print-action-context',
  'export-source-title-column',
  'export-source-description-column',
  'export-template-context',
  'printable-builder-source-context',
  'printable-header-description',
  'printable-assignment-field-description',
  'printable-handoff-field-count',
  'distribution-chain-alignment',
  'worksheet-chain-alignment',
  'data-lifecycle-alignment',
  'teacher-results-chain-alignment',
  'copy-lifecycle-alignment',
  'scored-result-chain-alignment',
  'source-material-storage-guard',
  'student-data-privacy-guard',
  'result-material-handoff-boundary',
] as const;

export const ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/db/app.schema.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/list-query.ts',
  'src/assignments/list-view.ts',
  'src/components/assignments/assignment-list-card.tsx',
  'src/assignments/public.ts',
  'src/routes/play/$shareId.tsx',
  'src/components/assignments/public-assignment-rules.tsx',
  'src/assignments/result-view.ts',
  'src/components/assignments/assignment-results-header-card.tsx',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/assignments/results-export.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/printable-worksheet.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/components/assignments/printable-worksheet-header.tsx',
  'src/components/assignments/printable-worksheet-assignment-fields.tsx',
  'src/components/assignments/printable-worksheet-handoff.tsx',
  'src/assignments/assignment-distribution-lifecycle-chain.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'src/db/classroom-data-lifecycle-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/share-link.ts',
  'src/api/assignments.ts',
  'scripts/assignment-source-activity-context-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentSourceActivityContextChainHandoffItemId =
  (typeof ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentSourceActivityContextChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentSourceActivityContextChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentSourceActivityContextChainPrivacyContract = {
  chainSourceFileCount: number;
  changesAttemptsOrResults: false;
  changesPublicRunner: false;
  exposesAnswerKeys: false;
  exposesRuntimePromptTextInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesStudentNames: false;
  exposesTeacherNotes: false;
  includesAssignmentListSearch: true;
  includesPrintableWorksheet: true;
  includesResultsExport: true;
  itemIds: AssignmentSourceActivityContextChainHandoffItemId[];
  keepsLiveActivityFallback: true;
  requiresAssignmentSnapshotBoundary: true;
  sourceFiles: string[];
  usesFrozenSnapshotSource: true;
  usesResultMaterialHandoff: true;
};

export type AssignmentSourceActivityContextChainHandoffView = {
  description: string;
  itemViews: AssignmentSourceActivityContextChainHandoffItemView[];
  privacy: AssignmentSourceActivityContextChainPrivacyContract;
  title: string;
};

export function buildAssignmentSourceActivityContextChainHandoffView(): AssignmentSourceActivityContextChainHandoffView {
  const itemViews =
    ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
      buildAssignmentSourceActivityContextChainHandoffItemView(id)
    );

  return {
    description:
      'Thirty-slice source activity context chain from assignment snapshot freezing through owner assignment-list search, public payload summaries, result headers, CSV exports, printable worksheet fields, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_SOURCE_FILES.length,
      changesAttemptsOrResults: false,
      changesPublicRunner: false,
      exposesAnswerKeys: false,
      exposesRuntimePromptTextInHandoff: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswerText: false,
      exposesStudentNames: false,
      exposesTeacherNotes: false,
      includesAssignmentListSearch: true,
      includesPrintableWorksheet: true,
      includesResultsExport: true,
      itemIds: [...ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_HANDOFF_ITEM_IDS],
      keepsLiveActivityFallback: true,
      requiresAssignmentSnapshotBoundary: true,
      sourceFiles: [...ASSIGNMENT_SOURCE_ACTIVITY_CONTEXT_CHAIN_SOURCE_FILES],
      usesFrozenSnapshotSource: true,
      usesResultMaterialHandoff: true,
    },
    title: 'Assignment source activity context chain',
  };
}

function buildAssignmentSourceActivityContextChainHandoffItemView(
  id: AssignmentSourceActivityContextChainHandoffItemId
): AssignmentSourceActivityContextChainHandoffItemView {
  const item = getAssignmentSourceActivityContextChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentSourceActivityContextChainHandoffItem(
  id: AssignmentSourceActivityContextChainHandoffItemId
): Omit<
  AssignmentSourceActivityContextChainHandoffItemView,
  'ariaLabel' | 'id'
> {
  switch (id) {
    case 'product-source-policy':
      return item(
        id,
        'Product source policy',
        'Source context first-class',
        'Product policy keeps source activity text searchable and carries frozen source context through assignment, result, export, and print loops.'
      );
    case 'snapshot-schema-fields':
      return item(
        id,
        'Snapshot schema fields',
        'Title and description',
        'Assignment snapshots persist source activity title, description, template, and content at publish time.'
      );
    case 'snapshot-freeze-insert':
      return item(
        id,
        'Snapshot freeze insert',
        'Copied from activity',
        'Publishing freezes source activity context into a snapshot insert before students or reports consume it.'
      );
    case 'snapshot-source-resolver':
      return item(
        id,
        'Snapshot source resolver',
        'Snapshot before live',
        'Shared source resolution prefers frozen snapshot context and falls back to live activity metadata only when no snapshot exists.'
      );
    case 'runtime-source-resolver':
      return item(
        id,
        'Runtime source resolver',
        'Runtime from source',
        'Runtime item generation uses the same resolved source so public runners, scoring, and print views agree on the frozen assignment.'
      );
    case 'list-search-current-title':
      return item(
        id,
        'List search current title',
        'Current title searchable',
        'Owner-scoped assignment list search includes current source activity titles for drafts and live fallback rows.'
      );
    case 'list-search-current-description':
      return item(
        id,
        'List search current description',
        'Current description searchable',
        'Owner-scoped assignment list search includes current source activity descriptions without broadening beyond the teacher workspace.'
      );
    case 'list-search-snapshot-title':
      return item(
        id,
        'List search snapshot title',
        'Frozen title searchable',
        'Owner-scoped assignment list search includes frozen source activity titles so renamed activities do not hide older class links.'
      );
    case 'list-search-snapshot-description':
      return item(
        id,
        'List search snapshot description',
        'Frozen description searchable',
        'Owner-scoped assignment list search includes frozen source activity descriptions for classroom archive retrieval.'
      );
    case 'list-card-source-description':
      return item(
        id,
        'List card source description',
        'Frozen description shown',
        'Assignment cards render the resolved source activity description beside distribution status and delivery settings.'
      );
    case 'public-payload-source-summary':
      return item(
        id,
        'Public payload source summary',
        'Sanitized source summary',
        'Student payloads receive sanitized title, description, template, and visibility from the resolved assignment source.'
      );
    case 'public-snapshot-summary':
      return item(
        id,
        'Public snapshot summary',
        'Snapshot metadata only',
        'Public snapshot summaries expose source metadata without sending teacher-only answers or storage keys.'
      );
    case 'result-header-source-context':
      return item(
        id,
        'Result header source context',
        'Teacher result context',
        'Teacher result headers use resolved source activity title, description, and template beside share-link and settings summaries.'
      );
    case 'result-print-action-context':
      return item(
        id,
        'Result print action context',
        'Print from result source',
        'Result-page print actions open printable worksheets that rebuild source context from the same assignment snapshot.'
      );
    case 'export-source-title-column':
      return item(
        id,
        'Export source title column',
        'activity_title',
        'CSV exports include the resolved source activity title for offline gradebook and parent follow-up context.'
      );
    case 'export-source-description-column':
      return item(
        id,
        'Export source description column',
        'activity_description',
        'CSV exports include the resolved source activity description so offline records preserve the lesson context.'
      );
    case 'export-template-context':
      return item(
        id,
        'Export template context',
        'activity_template',
        'CSV exports include resolved template context from the same source resolver as visible result headers.'
      );
    case 'printable-builder-source-context':
      return item(
        id,
        'Printable builder source context',
        'Worksheet source',
        'Printable worksheet builders copy title, description, and template from the resolved assignment source.'
      );
    case 'printable-header-description':
      return item(
        id,
        'Printable header description',
        'Header description',
        'Printable worksheet headers display the resolved source activity description when it exists.'
      );
    case 'printable-assignment-field-description':
      return item(
        id,
        'Printable assignment field description',
        'Paper source field',
        'Printable assignment fields include a source activity description row alongside share path, template, snapshot source, instructions, and delivery policy.'
      );
    case 'printable-handoff-field-count':
      return item(
        id,
        'Printable handoff field count',
        '9 print fields',
        'Printable worksheet handoff counts the source activity description as one prepared paper field.'
      );
    case 'distribution-chain-alignment':
      return item(
        id,
        'Distribution chain alignment',
        'Distribution aligned',
        'Assignment distribution lifecycle gates keep source-aware list cards connected to copy, preview, print, and result actions.'
      );
    case 'worksheet-chain-alignment':
      return item(
        id,
        'Worksheet chain alignment',
        'Worksheet aligned',
        'Worksheet delivery gates keep printable handouts and source-context fields tied to the frozen assignment snapshot.'
      );
    case 'data-lifecycle-alignment':
      return item(
        id,
        'Data lifecycle alignment',
        'Snapshot retained',
        'Classroom data lifecycle gates keep frozen source context available while attempts and results remain reviewable.'
      );
    case 'teacher-results-chain-alignment':
      return item(
        id,
        'Teacher results chain alignment',
        'Results aligned',
        'Teacher result review gates keep source context connected to review scope, copy artifacts, export, and print boundaries.'
      );
    case 'copy-lifecycle-alignment':
      return item(
        id,
        'Copy lifecycle alignment',
        'Copy aligned',
        'Teacher copy lifecycle gates keep reteach artifacts tied to the same result evidence without leaking source text in hidden summaries.'
      );
    case 'scored-result-chain-alignment':
      return item(
        id,
        'Scored result chain alignment',
        'Scoring aligned',
        'Scored-attempt result gates keep submission, stats, review, CSV, and printable return links connected to one assignment snapshot.'
      );
    case 'source-material-storage-guard':
      return item(
        id,
        'Source-material storage guard',
        'Storage keys omitted',
        'Source context handoffs never expose source-material storage keys, file ids, or raw teacher upload paths.'
      );
    case 'student-data-privacy-guard':
      return item(
        id,
        'Student data privacy guard',
        'Student data omitted',
        'Source context handoffs never expose student names, anonymous tokens, student answers, or teacher-only answer keys.'
      );
    case 'result-material-handoff-boundary':
      return item(
        id,
        'Result material handoff boundary',
        `${ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS.length} result material slices`,
        'Frozen source context must continue through shared teacher copy, CSV preparation, printable worksheet, current/full data scope, snapshot source, and privacy contracts.'
      );
  }
}

function item(
  id: AssignmentSourceActivityContextChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentSourceActivityContextChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
