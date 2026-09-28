import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS,
  buildActivitySourceMaterialSummaryView,
} from '@/activities/material-summary';
import { ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT } from '@/activities/material-references';
import type { ActivityMaterialReference } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const MATERIAL_SUMMARY_SOURCE = readFileSync(
  'src/activities/material-summary.ts',
  'utf8'
);
const LIBRARY_VIEW_SOURCE = readFileSync(
  'src/activities/library-view.ts',
  'utf8'
);
const ACTIVITY_LIBRARY_CARD_SOURCE = readFileSync(
  'src/components/activities/activity-library-card.tsx',
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

const SECRET_FILE_BYTES = 'SECRET_ACTIVITY_CARD_FILE_BYTES';
const SECRET_FILE_ID = 'secret-activity-card-file-id';
const SECRET_FILENAME = 'secret-card-source-material.pdf';
const SECRET_PERMISSION = 'secret-card-permission';
const SECRET_STORAGE_KEY = 'source-materials/private/secret-card.pdf';
const SECRET_STUDENT_PAYLOAD = 'SECRET_STUDENT_PAYLOAD_FILE_REFERENCE';

const sourceMaterials: Array<
  ActivityMaterialReference & {
    bytes?: string;
    permission?: string;
    storageKey?: string;
  }
> = [
  {
    contentType: 'audio/mpeg',
    fileId: `${SECRET_FILE_ID}-audio`,
    kind: 'audio',
    originalName: 'listening.mp3',
    size: 1024,
  },
  {
    contentType: 'application/pdf',
    fileId: `${SECRET_FILE_ID}-document`,
    kind: 'worksheet-document',
    originalName: SECRET_FILENAME,
    permission: SECRET_PERMISSION,
    size: 2048,
    storageKey: SECRET_STORAGE_KEY,
  },
  {
    contentType: 'image/png',
    fileId: `${SECRET_FILE_ID}-image`,
    kind: 'worksheet-image',
    originalName: 'worksheet.png',
    size: 3072,
  },
  {
    contentType: 'text/csv',
    fileId: `${SECRET_FILE_ID}-spreadsheet`,
    kind: 'spreadsheet',
    originalName: 'vocabulary.csv',
    size: 4096,
  },
  {
    bytes: SECRET_FILE_BYTES,
    contentType: 'video/mp4',
    fileId: `${SECRET_FILE_ID}-video`,
    kind: 'video',
    originalName: 'reference.mp4',
    size: 5120,
  },
];

test('activity source-material summary chain preserves product docs', () => {
  assert.match(
    PRODUCT_SOURCE,
    /activity-card source-material summary gate[\s\S]*card summary surface[\s\S]*attached count[\s\S]*material-kind counts[\s\S]*extraction-readiness actions[\s\S]*edit-return path[\s\S]*ActivityContent reference[\s\S]*privacy guards/i,
    'docs/product.md should preserve the activity-card source-material summary chain scope.'
  );
});

test('activity source-material summary uses the shared domain summary', () => {
  assert.deepEqual(
    ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS.map((action) => [
      action.id,
      action.capability,
    ]),
    [
      ['extract-audio', 'audio-extraction'],
      ['extract-worksheet', 'worksheet-extraction'],
      ['import-spreadsheet', 'spreadsheet-import'],
    ]
  );
  assert.match(
    MATERIAL_SUMMARY_SOURCE,
    /buildActivitySourceMaterialSummaryView[\s\S]*summarizeActivitySourceMaterials[\s\S]*summary\.extractionActions\.map[\s\S]*readinessStatus[\s\S]*primaryNextStep/,
    'Material summary should keep counts, extraction actions, readiness status, and primary next step in one domain view model.'
  );
  assert.match(
    LIBRARY_VIEW_SOURCE,
    /buildActivitySourceMaterialSummaryView\(\s*activity\.content\.sourceMaterials\s*\)[\s\S]*sourceMaterialsLabel/,
    'Activity library card view models should derive source-material summaries from ActivityContent.sourceMaterials.'
  );
  assert.match(
    ACTIVITY_LIBRARY_CARD_SOURCE,
    /ActivitySourceMaterialsSummary[\s\S]*actionSlot=\{[\s\S]*cardDisplayView\.actionState\.showEditAction[\s\S]*summary=\{cardDisplayView\.sourceMaterials\}/,
    'Activity library cards should render the prepared source-material summary and edit action slot.'
  );
  assert.doesNotMatch(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /data-handoff/,
    'Source-material summaries should render no hidden audit output.'
  );
});

test('activity source-material summary keeps private file data out', () => {
  const summary = buildActivitySourceMaterialSummaryView(sourceMaterials);

  assert.equal(summary.countLabel, '5 files');
  assert.equal(summary.readiness.extractableCount, 4);
  assert.equal(summary.extractionActions.length, 3);
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT.exposesFileBytes,
    false
  );
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT.exposesPermissionMetadata,
    false
  );
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT.exposesSourceMaterialStorageKeys,
    false
  );
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT.exposesStudentPayloadFileReferences,
    false
  );
  assert.equal(
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT.itemIds.length,
    30
  );
  assertNoPrivateActivitySourceMaterialSummaryText(JSON.stringify(summary));

  const publicAssignmentPayloadType = getSourceSlice(
    PUBLIC_ASSIGNMENT_SOURCE,
    'export type PublicAssignmentPayload = {',
    'export type PublicAssignmentUnavailableReason'
  );
  assert.doesNotMatch(
    publicAssignmentPayloadType,
    /\b(sourceMaterials|storageKey|fileId|originalName|permission|bytes|fileList)\b/,
    'PublicAssignmentPayload should not expose teacher source-material details.'
  );
  assert.doesNotMatch(
    STUDENT_RUNTIME_SOURCE,
    /\b(sourceMaterials|storageKey|fileId|originalName|permission|bytes|fileList)\b/,
    'Student runtime item lists should only read public runtime items.'
  );
});

test('activity source-material summary chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity source-material summary chain has a fast script-level gate via[\s\S]*scripts\/activity-source-material-summary-chain\.test\.ts/,
    'TEST-CATALOG should document the activity source-material summary chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /card summary surface[\s\S]*attached count[\s\S]*material-kind badges[\s\S]*extraction readiness[\s\S]*edit-return path[\s\S]*activity library consumers[\s\S]*source extraction lifecycle[\s\S]*privacy guards/,
    'TEST-CATALOG should document the activity source-material summary chain scope.'
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

function assertNoPrivateActivitySourceMaterialSummaryText(
  serializedView: string
) {
  for (const privateValue of [
    SECRET_FILE_BYTES,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_PERMISSION,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_PAYLOAD,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity source-material summary chain leaked private text: ${privateValue}`
    );
  }
}
