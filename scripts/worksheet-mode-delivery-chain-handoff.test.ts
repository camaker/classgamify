import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS } from '@/activities/scaffolds';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS } from '@/activities/entry-page-view';
import { WORKSHEET_MODE_TEMPLATES } from '@/activities/worksheet-modes';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';
import {
  ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS,
  PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS,
} from '@/assignments/delivery-summary';
import { FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/fill-blank-worksheet-handoff';
import { GROUP_SORT_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/group-sort-board-handoff';
import { ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS } from '@/assignments/item-order-handoff';
import { LINE_MATCH_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/line-match-board-handoff';
import { LISTENING_SPEECH_HANDOFF_ITEM_IDS } from '@/assignments/listening-speech-handoff';
import { PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-view';
import { PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/public';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-state';
import {
  STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS,
  STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS,
} from '@/assignments/student-runtime-item-list';
import { ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS } from '@/assignments/submission-validation-handoff';
import {
  WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES,
  buildWorksheetModeDeliveryChainHandoffView,
  type WorksheetModeDeliveryChainHandoffItemId,
  type WorksheetModeDeliveryChainHandoffView,
} from '@/assignments/worksheet-mode-delivery-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ENTRY_PAGE_SOURCE = readFileSync(
  'src/activities/entry-page-view.ts',
  'utf8'
);
const TEMPLATE_ENTRY_SOURCE = readFileSync(
  'src/activities/template-entry.ts',
  'utf8'
);
const WORKSHEET_MODES_SOURCE = readFileSync(
  'src/activities/worksheet-modes.ts',
  'utf8'
);
const EDITOR_SOURCE = readFileSync('src/activities/editor.ts', 'utf8');
const CREATE_ROUTE_SOURCE = readFileSync('src/routes/create.tsx', 'utf8');
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_SOURCE = readFileSync(
  'src/assignments/printable-worksheet.ts',
  'utf8'
);
const PRINTABLE_ROUTE_SOURCE = readFileSync(
  'src/routes/print/assignments/$assignmentId.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_KEY = 'SECRET_WORKSHEET_ANSWER';
const PRIVATE_PROMPT = 'SECRET_WORKSHEET_PROMPT';
const PRIVATE_RUNTIME_ID = 'SECRET_WORKSHEET_RUNTIME_ITEM_ID';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/worksheet.pdf';
const PRIVATE_STUDENT_NAME = 'SECRET_WORKSHEET_STUDENT_NAME';
const PRIVATE_TOKEN = 'SECRET_WORKSHEET_RAW_TOKEN';

test('worksheet-mode delivery chain exposes 30 worksheet-loop slices', () => {
  const handoffView = buildWorksheetModeDeliveryChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Worksheet-mode delivery chain');
  assert.match(handoffView.description, /Thirty-slice worksheet-mode/);
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
    chainSourceFileCount: WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES.length,
    createsParallelWorksheetModel: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesPromptTextInHandoff: false,
    exposesRawAnonymousTokens: false,
    exposesRawStudentIdentity: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    printRouteRequiresTeacherAuth: true,
    publicPayloadUsesSanitizedRuntimeItems: true,
    requiresAssignmentSnapshot: true,
    requiresCreateActivityInputContract: true,
    sourceFiles: [...WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES],
  });
  assertNoPrivateWorksheetChainText(JSON.stringify(handoffView));
});

test('worksheet-mode delivery chain summarizes each worksheet handoff step', () => {
  const handoffView = buildWorksheetModeDeliveryChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['worksheets-entry-route', '/worksheets'],
      ['worksheet-mode-catalog', '4 worksheet modes'],
      ['worksheet-create-actions', 'Create editor links'],
      ['worksheet-source-param', 'source=worksheets'],
      ['template-search-param', 'template'],
      ['editor-scaffold-loading', 'Reviewed example'],
      ['shared-create-input', 'CreateActivityInput'],
      ['editor-readiness-preview', 'Template readiness'],
      ['source-material-provenance', 'Compact references'],
      ['worksheet-extraction-boundary', 'No parallel model'],
      ['assignment-publish-boundary', 'Explicit freeze step'],
      ['snapshot-freeze', 'AssignmentSnapshot'],
      ['delivery-policy-summary', 'Shared delivery rules'],
      ['student-rules-summary', 'Student-visible rules'],
      ['public-payload-sanitization', 'Runtime only'],
      ['runtime-item-order', 'Stable order'],
      ['fill-blank-runtime', 'Inline blanks'],
      ['line-match-runtime', 'Connection board'],
      ['listening-runtime', 'Speech track'],
      ['group-sort-runtime', 'Category board'],
      ['submission-contract', '{ itemId, answer }'],
      ['attempt-duration-policy', 'Normalized seconds'],
      ['answer-feedback-policy', 'Reveal if allowed'],
      ['print-route-boundary', 'Teacher print route'],
      ['print-response-policy', 'Paper response plan'],
      ['print-answer-key-toggle', 'Teacher-only key'],
      ['result-export-policy', 'Delivery rules included'],
      ['source-material-guard', 'Storage keys hidden'],
      ['raw-identity-guard', 'Identity hidden'],
      ['worksheet-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-mode-catalog'),
    '4 worksheet modes'
  );
});

test('worksheet-mode delivery chain stays backed by focused contracts', () => {
  assert.equal(WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of WORKSHEET_MODE_DELIVERY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing worksheet-mode delivery chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [...WORKSHEET_MODE_TEMPLATES],
    ['fill-blank', 'line-match', 'listening', 'group-sort']
  );
  assert.equal(
    ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS.includes(
      'worksheet-entry'
    ),
    true
  );
  assert.deepEqual(
    [
      PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS.length,
      FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS.length,
      LINE_MATCH_BOARD_HANDOFF_ITEM_IDS.length,
      LISTENING_SPEECH_HANDOFF_ITEM_IDS.length,
      GROUP_SORT_BOARD_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
    ],
    Array.from({ length: 19 }, () => 30)
  );
});

test('worksheet-mode sources keep worksheets on the shared product loop', () => {
  assert.match(
    PRODUCT_SOURCE,
    /The public `\/worksheets` route is the Liveworksheets-style entry point[\s\S]*same model rather than a separate legacy worksheet product/,
    'docs/product.md should define worksheets as an extension of the shared activity-assignment-attempt-results loop.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /send teachers into `\/create\?template=\.\.\.`[\s\S]*inside\s+the normal activity editor/,
    'docs/product.md should keep worksheet entry actions inside the shared activity editor.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Printable follow-up and teacher-uploaded worksheet\s+extraction should extend the same assignment snapshot[\s\S]*scoring[\s\S]*accepted-answer/,
    'docs/product.md should keep worksheet print and extraction work on the assignment snapshot and result-export model.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /result-export model instead of creating a parallel worksheet data shape\./,
    'docs/product.md should keep worksheet delivery out of a parallel worksheet data shape.'
  );
  assert.match(
    WORKSHEET_MODES_SOURCE,
    /WORKSHEET_MODE_TEMPLATES = \[[\s\S]*'fill-blank'[\s\S]*'line-match'[\s\S]*'listening'[\s\S]*'group-sort'/,
    'Worksheet mode catalog should keep the near-term worksheet entry modes explicit.'
  );
  assert.match(
    TEMPLATE_ENTRY_SOURCE,
    /buildWorksheetModeEntryAction[\s\S]*buildTemplateCreateSearch\(mode\.template, 'worksheets'\)[\s\S]*to: Routes\.Create/,
    'Worksheet mode cards should link into the shared create editor with the worksheets source parameter.'
  );
  assert.match(
    ENTRY_PAGE_SOURCE,
    /buildWorksheetsPageViewModel[\s\S]*handoffView: buildPublicTemplateEntryHandoffView\(\{[\s\S]*surface: 'worksheets'[\s\S]*worksheetModeDefinitions[\s\S]*\}[\s\S]*modeCards: worksheetModeDefinitions\.map/,
    'The worksheets page view model should use the shared public template entry handoff without rendering a separate worksheet model.'
  );
  assert.match(
    CREATE_ROUTE_SOURCE,
    /parseCreateActivityTemplateSourceSearch\(search\.source\)[\s\S]*templateSource: source/,
    'The create route should parse the worksheets source parameter before building the shared editor view model.'
  );
  assert.match(
    EDITOR_SOURCE,
    /templateSource === 'worksheets'[\s\S]*create_page_template_entry_source_worksheets_description/,
    'The editor should keep worksheet entry-source copy inside the shared create activity form.'
  );
});

test('worksheet-mode delivery sources preserve runtime, print, and export boundaries', () => {
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /orderAssignmentRuntimeItems\(\{[\s\S]*runtimeItems: stripRuntimeAnswers\(orderedRuntimeItems\)/,
    'Public worksheet-mode payloads should order runtime items and strip answers before reaching the runner.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /PRINTABLE_WORKSHEET_RESPONSE_POLICIES[\s\S]*'fill-blank': \{[\s\S]*responseMode: 'short-answer'[\s\S]*'group-sort': \{[\s\S]*responseMode: 'group-choice'[\s\S]*'line-match': \{[\s\S]*responseMode: 'line-match'[\s\S]*listening: \{[\s\S]*responseMode: 'short-answer'/,
    'Printable worksheet policies should cover the worksheet-mode response shapes.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /resolveAssignmentSnapshotSource\(\{[\s\S]*activity,[\s\S]*snapshot,[\s\S]*\}[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/,
    'Printable worksheets should use frozen snapshot source and shared item ordering.'
  );
  assert.match(
    PRINTABLE_ROUTE_SOURCE,
    /validateSearch: parsePrintableAssignmentSearch[\s\S]*robots: 'noindex, nofollow'[\s\S]*middleware: \[authRouteMiddleware\][\s\S]*includeAnswerKey: answerKey[\s\S]*<PrintableWorksheetHandoff view=\{pageView\.handoffView\} \/>/,
    'Printable worksheet route should stay teacher-authenticated, noindex, answer-key-toggle backed, and semantically reviewable.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Printable worksheet handoff has a fast script-level gate via[\s\S]*scripts\/printable-worksheet-handoff-semantic-views\.test\.ts/,
    'TEST-CATALOG should keep the printable worksheet focused gate discoverable.'
  );
});

test('worksheet-mode delivery chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Worksheet-mode delivery chain has a fast script-level gate via[\s\S]*scripts\/worksheet-mode-delivery-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the worksheet-mode delivery chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /\/worksheets[\s\S]*shared create editor[\s\S]*assignment snapshots[\s\S]*worksheet-style student runtimes[\s\S]*printable\s+handouts[\s\S]*result exports/,
    'TEST-CATALOG should document the worksheet-mode chain scope.'
  );
});

function getHandoffValue(
  view: WorksheetModeDeliveryChainHandoffView,
  id: WorksheetModeDeliveryChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing worksheet-mode delivery chain item ${id}`);
  return item.value;
}

function assertNoPrivateWorksheetChainText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_KEY,
    PRIVATE_PROMPT,
    PRIVATE_RUNTIME_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Worksheet-mode delivery chain leaked private text: ${privateValue}`
    );
  }
}
