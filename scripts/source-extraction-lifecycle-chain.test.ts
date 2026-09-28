import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const MATERIAL_SUMMARY_SOURCE = readFileSync(
  'src/activities/material-summary.ts',
  'utf8'
);
const MATERIAL_REFERENCES_SOURCE = readFileSync(
  'src/activities/material-references.ts',
  'utf8'
);
const SOURCE_MATERIALS_SUMMARY_SOURCE = readFileSync(
  'src/components/activities/activity-source-materials-summary.tsx',
  'utf8'
);
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const STUDENT_RUNTIME_SOURCE = readFileSync(
  'src/assignments/student-runtime-item-list.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('source extraction lifecycle follows docs product policy', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teacher-uploaded audio, worksheet images, worksheet documents, or spreadsheets[\s\S]*ActivityContent\.sourceMaterials` as compact references[\s\S]*public\s+student payloads[\s\S]*not\s+the teacher's file list or storage keys/,
    'docs/product.md should keep teacher source materials compact and private from student payloads.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /teacher-uploaded worksheet\s+extraction[\s\S]*same assignment snapshot, scoring, accepted-answer,\s+and result-export model[\s\S]*parallel worksheet data shape/,
    'docs/product.md should keep worksheet extraction on the shared assignment/result model.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /AI draft source\s+notes[\s\S]*safe material provenance[\s\S]*filename basenames[\s\S]*must not read file bytes, storage keys,\s+URLs, path segments, query tokens, or permission metadata/,
    'docs/product.md should limit AI draft source material provenance before a dedicated extraction pipeline exists.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /source\s+extraction\s+lifecycle\s+gate[\s\S]*shared\s+create\s+and\s+edit\s+contracts[\s\S]*owner-scoped\s+library[\s\S]*assignment\s+snapshot\s+protection/,
    'docs/product.md should return source extraction output to the shared authoring and library lifecycle.'
  );
});

test('material summary and reference sources preserve extraction boundaries', () => {
  assert.match(
    MATERIAL_SUMMARY_SOURCE,
    /ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS = \[[\s\S]*capability: 'audio-extraction'[\s\S]*id: 'extract-audio'[\s\S]*capability: 'worksheet-extraction'[\s\S]*id: 'extract-worksheet'[\s\S]*capability: 'spreadsheet-import'[\s\S]*id: 'import-spreadsheet'/,
    'Material summary should keep the three extraction readiness action definitions.'
  );
  assert.match(
    MATERIAL_SUMMARY_SOURCE,
    /buildActivitySourceMaterialSummaryView[\s\S]*summary\.extractionActions\.map[\s\S]*readinessStatus[\s\S]*primaryNextStep/,
    'Material summary view should keep readiness status, extraction actions, and the primary next step together.'
  );
  assert.match(
    MATERIAL_SUMMARY_SOURCE,
    /getActivitySourceMaterialReadinessCapabilityForKind[\s\S]*case 'audio':[\s\S]*'audio-extraction'[\s\S]*case 'spreadsheet':[\s\S]*'spreadsheet-import'[\s\S]*case 'worksheet-document':[\s\S]*case 'worksheet-image':[\s\S]*'worksheet-extraction'/,
    'Material summary should classify readiness by safe material kind.'
  );
  assert.match(
    MATERIAL_REFERENCES_SOURCE,
    /ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT[\s\S]*exposesFileBytes: false[\s\S]*exposesPermissionMetadata: false[\s\S]*exposesSourceMaterialStorageKeys: false[\s\S]*exposesStudentPayloadFileReferences: false/,
    'Material references should keep the compact reference privacy contract explicit.'
  );

  const compactReferenceSlice = getSourceSlice(
    MATERIAL_REFERENCES_SOURCE,
    'function compactActivityMaterialReference(',
    'export function normalizeActivityMaterialReferenceFilename'
  );
  assert.match(compactReferenceSlice, /fileId/);
  assert.match(compactReferenceSlice, /kind/);
  assert.match(compactReferenceSlice, /originalName/);
  assert.doesNotMatch(
    compactReferenceSlice,
    /\b(bytes|permission|r2Key|storageKey)\b/,
    'Compact references should not carry file bytes, permission metadata, or storage keys.'
  );
});

test('DOM handoff and public payloads do not expose source material secrets', () => {
  assert.doesNotMatch(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /data-handoff/,
    'Source-material summaries should render no hidden extraction audit output.'
  );

  const publicAssignmentPayloadType = getSourceSlice(
    PUBLIC_ASSIGNMENT_SOURCE,
    'export type PublicAssignmentPayload = {',
    'export type PublicAssignmentUnavailableReason'
  );
  assert.doesNotMatch(
    publicAssignmentPayloadType,
    /\b(sourceMaterials|r2Key|storageKey|fileId|originalName|permission|bytes|fileList)\b/,
    'PublicAssignmentPayload should not expose teacher source-material metadata.'
  );
  assert.doesNotMatch(
    STUDENT_RUNTIME_SOURCE,
    /\b(sourceMaterials|storageKey|fileId|originalName|permission|bytes|fileList)\b/,
    'Student runtime item lists should only read public runtime items.'
  );
});

test('source extraction lifecycle focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Source extraction lifecycle chain has a fast script-level gate via[\s\S]*scripts\/source-extraction-lifecycle-chain\.test\.ts/,
    'TEST-CATALOG should document the source extraction lifecycle chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /compact source-material references[\s\S]*material-kind\s+classification[\s\S]*audio\/worksheet\/spreadsheet\s+readiness[\s\S]*AI source provenance[\s\S]*public payload privacy/,
    'TEST-CATALOG should document the source extraction lifecycle chain scope.'
  );
});

function getSourceSlice(
  source: string,
  startMarker: string,
  endMarker: string
) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source start marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source end marker: ${endMarker}`);
  return source.slice(start, end);
}
