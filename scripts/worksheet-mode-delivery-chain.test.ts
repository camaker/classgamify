import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { WORKSHEET_MODE_TEMPLATES } from '@/activities/worksheet-modes';

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

test('worksheet-mode delivery chain stays backed by focused contracts', () => {
  assert.deepEqual(
    [...WORKSHEET_MODE_TEMPLATES],
    ['fill-blank', 'line-match', 'listening', 'group-sort']
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
    /buildWorksheetsPageViewModel[\s\S]*modeCards: worksheetModeDefinitions\.map/,
    'The worksheets page view model should build mode cards from the shared worksheet mode definitions.'
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
    /validateSearch: parsePrintableAssignmentSearch[\s\S]*robots: 'noindex, nofollow'[\s\S]*middleware: \[authRouteMiddleware\][\s\S]*includeAnswerKey: answerKey[\s\S]*<PrintableWorksheetAnswerKey view=\{pageView\.answerKeyView\} \/>/,
    'Printable worksheet route should stay teacher-authenticated, noindex, answer-key-toggle backed, and semantically reviewable.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Printable worksheet view has a fast script-level gate via[\s\S]*scripts\/printable-worksheet-view\.test\.ts/,
    'TEST-CATALOG should keep the printable worksheet focused gate discoverable.'
  );
});

test('worksheet-mode delivery chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /worksheet-mode delivery chain[\s\S]*visible print page[\s\S]*choice banks[\s\S]*answer-key access[\s\S]*without exposing prompt[\s\S]*student-response[\s\S]*source-material\s+storage-key text/,
    'docs/product.md should describe the visible print page and student-response privacy boundary.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Worksheet-mode delivery chain has a fast script-level gate via[\s\S]*scripts\/worksheet-mode-delivery-chain\.test\.ts/,
    'TEST-CATALOG should document the worksheet-mode delivery chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /\/worksheets[\s\S]*shared create editor[\s\S]*assignment snapshots[\s\S]*worksheet-style student runtimes[\s\S]*printable handouts[\s\S]*printable worksheet boundary[\s\S]*result exports/,
    'TEST-CATALOG should document the worksheet-mode chain scope.'
  );
});
