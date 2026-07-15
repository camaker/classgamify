import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS,
  ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS,
} from '@/activities/library-view';
import {
  ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_EXTRACTION_ACTIONS,
  ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS,
  buildActivitySourceMaterialCardHandoffView,
  buildActivitySourceMaterialSummaryView,
} from '@/activities/material-summary';
import {
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT,
} from '@/activities/material-references';
import {
  ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES,
  buildActivitySourceMaterialSummaryChainHandoffView,
  type ActivitySourceMaterialSummaryChainHandoffItemId,
  type ActivitySourceMaterialSummaryChainHandoffView,
} from '@/activities/activity-source-material-summary-chain';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-lifecycle-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
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

test('activity source-material summary chain exposes 30 safe slices', () => {
  const handoffView = buildActivitySourceMaterialSummaryChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Activity source-material summary chain');
  assert.match(
    handoffView.description,
    /Thirty-slice activity-card source-material summary chain/
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
    chainSourceFileCount:
      ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES.length,
    createsAssignments: false,
    exposesContentTypes: false,
    exposesFileBytes: false,
    exposesOriginalFilenames: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    exposesStudentPayloadFileList: false,
    itemIds,
    mutatesActivityContent: false,
    publishesAssignmentLinks: false,
    readsFileBytes: false,
    scope: 'activity-source-material-summary-chain',
    sourceFiles: [...ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES],
    summarizesByMaterialKind: true,
    usesActivityCardSourceMaterialHandoff: true,
    usesActivityContentSourceMaterials: true,
    usesActivityLibraryConsumers: true,
    usesEditorReturnPath: true,
    usesExtractionReadinessActions: true,
    usesSourceExtractionLifecycleChain: true,
    usesSourceMaterialPrivacyChain: true,
  });
  assertNoPrivateActivitySourceMaterialSummaryText(JSON.stringify(handoffView));
});

test('activity source-material summary chain summarizes the card lifecycle', () => {
  const handoffView = buildActivitySourceMaterialSummaryChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['card-summary-surface', 'Activity source-material card'],
      ['activity-card-boundary', 'Library card scope'],
      ['activity-content-source-materials', 'ActivityContent.sourceMaterials'],
      ['normalized-reference-input', 'Compact references'],
      ['attached-count-summary', 'Attached file count'],
      ['material-kind-summary', 'Kind summary'],
      ['material-kind-badges', 'Kind badges'],
      ['audio-count', 'Audio materials'],
      ['worksheet-document-count', 'Worksheet documents'],
      ['worksheet-image-count', 'Worksheet images'],
      ['spreadsheet-count', 'Spreadsheet materials'],
      ['reference-only-count', 'Reference-only materials'],
      ['extractable-count', 'Extraction-ready materials'],
      ['readiness-status', 'Extraction readiness'],
      ['primary-next-step', 'Teacher next step'],
      ['extraction-action-map', 'Three readiness actions'],
      ['audio-extraction-readiness', 'Listening draft path'],
      ['worksheet-extraction-readiness', 'Worksheet extraction path'],
      ['spreadsheet-import-readiness', 'Spreadsheet import path'],
      ['edit-action-slot', 'Edit action available'],
      ['editor-return-path', 'Return to editor'],
      ['library-card-consumer', 'Activity card consumer'],
      ['library-filter-consumer', 'Source filter consumer'],
      ['source-extraction-assist-alignment', 'Extraction lifecycle aligned'],
      ['ai-source-provenance-alignment', 'Safe AI provenance'],
      ['source-material-privacy-chain', 'Privacy chain aligned'],
      ['public-payload-guard', 'Public payload hidden'],
      ['filename-file-id-guard', 'Filenames and ids hidden'],
      ['storage-file-byte-guard', 'Storage and bytes hidden'],
      ['student-payload-guard', 'Runtime file list hidden'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-content-source-materials'),
    'ActivityContent.sourceMaterials'
  );
});

test('activity source-material summary chain is backed by adjacent gates', () => {
  assert.equal(ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity source-material summary chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 8 }, () => 30)
  );
});

test('activity source-material summary chain preserves product docs', () => {
  assert.match(
    PRODUCT_SOURCE,
    /activity-card source-material summary chain[\s\S]*30\s+slices[\s\S]*card summary surface[\s\S]*attached count[\s\S]*material-kind counts[\s\S]*extraction-readiness actions[\s\S]*edit-return path[\s\S]*ActivityContent reference[\s\S]*privacy guards/i,
    'docs/product.md should preserve the activity-card source-material summary chain scope.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/activity-source-material-summary-chain\.ts[\s\S]*source-level contract/i,
    'docs/product.md should name the activity source-material summary chain source file.'
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
  assert.match(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /data-handoff="activity-source-material-card-summary"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*handoff\.itemViews\.map/,
    'Activity source-material summaries should render the hidden card-summary handoff from the prepared view.'
  );
});

test('activity source-material summary keeps private file data out', () => {
  const summary = buildActivitySourceMaterialSummaryView(sourceMaterials);
  const handoffView = buildActivitySourceMaterialCardHandoffView({
    hasEditAction: true,
    summary,
  });

  assert.equal(summary.countLabel, '5 files');
  assert.equal(summary.readiness.extractableCount, 4);
  assert.equal(summary.extractionActions.length, 3);
  assert.deepEqual(handoffView.privacy, {
    exposesContentTypes: false,
    exposesFileBytes: false,
    exposesOriginalFilenames: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    itemIds: [...ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS],
    scope: 'activity-card-source-material-summary',
    summarizesByMaterialKind: true,
    usesActivityContentSourceMaterials: true,
  });
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
  assertNoPrivateActivitySourceMaterialSummaryText(JSON.stringify(handoffView));

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
  assert.match(STUDENT_RUNTIME_SOURCE, /exposesSourceMaterialMetadata: false/);
});

test('activity source-material summary chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity source-material summary chain has a fast script-level gate via[\s\S]*scripts\/activity-source-material-summary-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the activity source-material summary chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /card summary surface[\s\S]*attached count[\s\S]*material-kind badges[\s\S]*extraction readiness[\s\S]*edit-return path[\s\S]*activity library consumers[\s\S]*source extraction lifecycle[\s\S]*privacy guards/,
    'TEST-CATALOG should document the activity source-material summary chain scope.'
  );
});

function getHandoffValue(
  view: ActivitySourceMaterialSummaryChainHandoffView,
  id: ActivitySourceMaterialSummaryChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing activity source-material summary chain item ${id}`);
  return item.value;
}

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
