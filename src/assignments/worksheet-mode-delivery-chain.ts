export const WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS = [
  'worksheets-entry-route',
  'worksheet-mode-catalog',
  'worksheet-create-actions',
  'worksheet-source-param',
  'template-search-param',
  'editor-scaffold-loading',
  'shared-create-input',
  'editor-readiness-preview',
  'source-material-provenance',
  'worksheet-extraction-boundary',
  'assignment-publish-boundary',
  'snapshot-freeze',
  'delivery-policy-summary',
  'student-rules-summary',
  'public-payload-sanitization',
  'runtime-item-order',
  'fill-blank-runtime',
  'line-match-runtime',
  'listening-runtime',
  'group-sort-runtime',
  'submission-contract',
  'attempt-duration-policy',
  'answer-feedback-policy',
  'print-route-boundary',
  'print-response-policy',
  'print-answer-key-toggle',
  'result-export-policy',
  'source-material-guard',
  'raw-identity-guard',
  'printable-worksheet-handoff-boundary',
] as const;

export const WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/routes/worksheets.tsx',
  'src/activities/worksheet-modes.ts',
  'src/activities/template-entry.ts',
  'src/activities/entry-page-view.ts',
  'src/activities/scaffolds.ts',
  'src/activities/editor.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/activities/material-summary.ts',
  'src/activities/source-extraction-assist.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/public.ts',
  'src/assignments/item-order.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-view.ts',
  'src/assignments/student-runtime-item-list.ts',
  'src/assignments/fill-blank-worksheet-handoff.ts',
  'src/assignments/line-match-board-handoff.ts',
  'src/assignments/listening-speech-handoff.ts',
  'src/assignments/group-sort-board-handoff.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/attempt-duration-handoff.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/printable-worksheet.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/assignments/results-export.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type WorksheetModeDeliveryChainHandoffItemId =
  (typeof WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type WorksheetModeDeliveryChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: WorksheetModeDeliveryChainHandoffItemId;
  label: string;
  value: string;
};

export type WorksheetModeDeliveryChainPrivacyContract = {
  chainSourceFileCount: number;
  createsParallelWorksheetModel: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesPromptTextInHandoff: false;
  exposesRawAnonymousTokens: false;
  exposesRawStudentIdentity: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentResponseTextInHandoff: false;
  itemIds: WorksheetModeDeliveryChainHandoffItemId[];
  printRouteRequiresTeacherAuth: true;
  publicPayloadUsesSanitizedRuntimeItems: true;
  requiresAssignmentSnapshot: true;
  requiresCreateActivityInputContract: true;
  sourceFiles: string[];
  usesPrintableWorksheetHandoff: true;
};

export type WorksheetModeDeliveryChainHandoffView = {
  description: string;
  itemViews: WorksheetModeDeliveryChainHandoffItemView[];
  privacy: WorksheetModeDeliveryChainPrivacyContract;
  title: string;
};

export function buildWorksheetModeDeliveryChainHandoffView(): WorksheetModeDeliveryChainHandoffView {
  const itemViews = WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildWorksheetModeDeliveryChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice worksheet-mode delivery chain from the public /worksheets creation entry through shared editor scaffolds, assignment snapshots, worksheet-style student runtimes, printable handouts, and result exports.',
    itemViews,
    privacy: {
      chainSourceFileCount: WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES.length,
      createsParallelWorksheetModel: false,
      exposesAnswerKeysToPublicPayload: false,
      exposesPromptTextInHandoff: false,
      exposesRawAnonymousTokens: false,
      exposesRawStudentIdentity: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentResponseTextInHandoff: false,
      itemIds: [...WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS],
      printRouteRequiresTeacherAuth: true,
      publicPayloadUsesSanitizedRuntimeItems: true,
      requiresAssignmentSnapshot: true,
      requiresCreateActivityInputContract: true,
      sourceFiles: [...WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES],
      usesPrintableWorksheetHandoff: true,
    },
    title: 'Worksheet-mode delivery chain',
  };
}

function buildWorksheetModeDeliveryChainHandoffItemView(
  id: WorksheetModeDeliveryChainHandoffItemId
): WorksheetModeDeliveryChainHandoffItemView {
  const item = getWorksheetModeDeliveryChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getWorksheetModeDeliveryChainHandoffItem(
  id: WorksheetModeDeliveryChainHandoffItemId
): Omit<WorksheetModeDeliveryChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'worksheets-entry-route':
      return item(
        id,
        'Worksheets entry route',
        '/worksheets',
        'The Liveworksheets-style entry page stays a creation entry into the shared activity model, not a separate worksheet product.'
      );
    case 'worksheet-mode-catalog':
      return item(
        id,
        'Worksheet mode catalog',
        '4 worksheet modes',
        'Fill-blank, line-match, listening, and group-sort are the public worksheet-style modes that start from the same template catalog.'
      );
    case 'worksheet-create-actions':
      return item(
        id,
        'Worksheet create actions',
        'Create editor links',
        'Worksheet cards and hero actions send teachers to /create with the selected template instead of creating assignments directly.'
      );
    case 'worksheet-source-param':
      return item(
        id,
        'Worksheet source parameter',
        'source=worksheets',
        'Create links preserve the worksheets source so the editor can explain the scaffold origin.'
      );
    case 'template-search-param':
      return item(
        id,
        'Template search parameter',
        'template',
        'Template query parsing uses the shared activity-template parser before the editor selects a mode.'
      );
    case 'editor-scaffold-loading':
      return item(
        id,
        'Editor scaffold loading',
        'Reviewed example',
        'Worksheet modes load teacher-reviewable scaffolds inside the normal activity editor.'
      );
    case 'shared-create-input':
      return item(
        id,
        'Shared create input',
        'CreateActivityInput',
        'Worksheet-mode authoring still saves through the shared CreateActivityInput validation and persistence contract.'
      );
    case 'editor-readiness-preview':
      return item(
        id,
        'Editor readiness preview',
        'Template readiness',
        'Editor readiness uses the same deterministic template-remix model before teachers save or publish.'
      );
    case 'source-material-provenance':
      return item(
        id,
        'Source material provenance',
        'Compact references',
        'Teacher worksheet files stay owner-scoped source material references for drafts and future extraction.'
      );
    case 'worksheet-extraction-boundary':
      return item(
        id,
        'Worksheet extraction boundary',
        'No parallel model',
        'Extraction readiness extends ActivityContent and does not introduce a separate worksheet data shape.'
      );
    case 'assignment-publish-boundary':
      return item(
        id,
        'Assignment publish boundary',
        'Explicit freeze step',
        'Worksheet-mode work becomes shareable only through the assignment publish dialog.'
      );
    case 'snapshot-freeze':
      return item(
        id,
        'Snapshot freeze',
        'AssignmentSnapshot',
        'Published worksheet-style activities freeze title, template, and content for existing class links.'
      );
    case 'delivery-policy-summary':
      return item(
        id,
        'Delivery policy summary',
        'Shared delivery rules',
        'Attempts, timer, close time, identity, answer reveal, item order, and instructions resolve through assignment-domain helpers.'
      );
    case 'student-rules-summary':
      return item(
        id,
        'Student rules summary',
        'Student-visible rules',
        'Student runners show sanitized rule summaries before worksheet-style play begins.'
      );
    case 'public-payload-sanitization':
      return item(
        id,
        'Public payload sanitization',
        'Runtime only',
        'Public worksheet-mode payloads expose runtime prompts and choices without ActivityContent, answer keys, or teacher material lists.'
      );
    case 'runtime-item-order':
      return item(
        id,
        'Runtime item order',
        'Stable order',
        'Worksheet-mode runners use the shared item-order helper so shuffled and unshuffled snapshots stay predictable.'
      );
    case 'fill-blank-runtime':
      return item(
        id,
        'Fill-blank runtime',
        'Inline blanks',
        'Fill-blank renders worksheet-style blanks while preserving the same itemId and answer submission shape.'
      );
    case 'line-match-runtime':
      return item(
        id,
        'Line-match runtime',
        'Connection board',
        'Line-match renders pair content as two-column connections without exposing the answer map.'
      );
    case 'listening-runtime':
      return item(
        id,
        'Listening runtime',
        'Speech track',
        'Listening uses browser speech language from activity content and hides transcript details until review.'
      );
    case 'group-sort-runtime':
      return item(
        id,
        'Group-sort runtime',
        'Category board',
        'Group-sort keeps classification interactions on the shared runtime and scoring contract.'
      );
    case 'submission-contract':
      return item(
        id,
        'Submission contract',
        '{ itemId, answer }',
        'Worksheet-mode renderers submit the template-neutral answer list and use shared server-side validation.'
      );
    case 'attempt-duration-policy':
      return item(
        id,
        'Attempt duration policy',
        'Normalized seconds',
        'Worksheet-mode attempts share timer start, duration normalization, and capped duration semantics.'
      );
    case 'answer-feedback-policy':
      return item(
        id,
        'Answer feedback policy',
        'Reveal if allowed',
        'Accepted alternatives, explanations, and correct answers appear only after scoring when the assignment allows review.'
      );
    case 'print-route-boundary':
      return item(
        id,
        'Print route boundary',
        'Teacher print route',
        'Printable worksheet pages are teacher-only, noindex, and reuse the frozen assignment snapshot.'
      );
    case 'print-response-policy':
      return item(
        id,
        'Print response policy',
        'Paper response plan',
        'Printable worksheets derive response modes, answer lines, and choice banks from runtime item kind and template type.'
      );
    case 'print-answer-key-toggle':
      return item(
        id,
        'Print answer-key toggle',
        'Teacher-only key',
        'Answer keys are optional teacher print aids and stay out of public student payloads.'
      );
    case 'result-export-policy':
      return item(
        id,
        'Result export policy',
        'Delivery rules included',
        'Results and CSV exports keep worksheet-mode attempts aligned with the same delivery policy and accepted-answer formatting.'
      );
    case 'source-material-guard':
      return item(
        id,
        'Source material guard',
        'Storage keys hidden',
        'Worksheet-mode chain handoffs do not expose teacher storage keys, filenames, file bytes, or permission metadata.'
      );
    case 'raw-identity-guard':
      return item(
        id,
        'Raw identity guard',
        'Identity hidden',
        'Student names and anonymous browser tokens are normalized before limits and results without being exposed in handoff summaries.'
      );
    case 'printable-worksheet-handoff-boundary':
      return item(
        id,
        'Printable worksheet handoff boundary',
        '30 printable worksheet slices',
        'Handout overview, student fields, response modes, choice banks, writing areas, answer lines, delivery policy, answer-key access and details, results return, print controls, and privacy stay aligned.'
      );
  }
}

function item(
  id: WorksheetModeDeliveryChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<WorksheetModeDeliveryChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
