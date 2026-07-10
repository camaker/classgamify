import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/ai-authoring-chain';
import { ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/authoring-library-chain';
import { ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS } from '@/activities/material-summary';
import { ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS } from '@/activities/material-references';
import {
  ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS,
  buildActivitySourceExtractionAssistHandoffView,
} from '@/activities/source-extraction-assist';
import {
  SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildSourceExtractionLifecycleChainHandoffView,
  type SourceExtractionLifecycleChainHandoffItemId,
  type SourceExtractionLifecycleChainHandoffView,
} from '@/activities/source-extraction-lifecycle-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import { TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/template-roadmap-capability-chain';
import type { ActivityMaterialReference } from '@/activities/types';
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

const SECRET_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_ANSWER';
const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT';
const SECRET_FILE_BYTES = 'SECRET_FILE_BYTES';
const SECRET_FILE_ID = 'secret-source-extraction-file-id';
const SECRET_FILENAME = 'secret source extraction worksheet.pdf';
const SECRET_PERMISSION = 'owner-only-source-extraction-permission';
const SECRET_STORAGE_KEY = 'source-materials/private/extraction-key.pdf';

const mixedSourceMaterials: Array<
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
    originalName: 'class listening.mp3',
    size: 1024,
  },
  {
    contentType: 'application/pdf',
    fileId: SECRET_FILE_ID,
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
    originalName: 'worksheet scan.png',
    size: 3072,
  },
  {
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileId: `${SECRET_FILE_ID}-sheet`,
    kind: 'spreadsheet',
    originalName: 'vocabulary.xlsx',
    size: 4096,
  },
  {
    bytes: SECRET_FILE_BYTES,
    contentType: 'video/mp4',
    fileId: `${SECRET_FILE_ID}-video`,
    kind: 'video',
    originalName: 'reference video.mp4',
    size: 5120,
  },
];

test('source extraction lifecycle chain exposes 30 safe slices', () => {
  const handoffView = buildSourceExtractionLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Source extraction lifecycle chain');
  assert.match(handoffView.description, /Thirty-slice/);
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
    chainSourceFileCount: SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    createsParallelWorksheetModel: false,
    exposesAcceptedAnswerTextInHandoff: false,
    exposesActivityContentTextInHandoff: false,
    exposesFileBytesToAi: false,
    exposesRawSourceMaterialFileIdsInHandoff: false,
    exposesSourceMaterialFilenamesInHandoff: false,
    exposesSourceMaterialStorageKeys: false,
    exposesSourceMaterialsToPublicPayload: false,
    itemIds,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    sourceFiles: [...SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES],
    targetsActivityContent: true,
    usesCompactSourceMaterialReferences: true,
  });

  assertNoPrivateLifecycleText(JSON.stringify(handoffView));
});

test('source extraction lifecycle chain summarizes every boundary', () => {
  const handoffView = buildSourceExtractionLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-extraction-policy', 'Product policy'],
      ['activity-content-source-materials', 'ActivityContent.sourceMaterials'],
      ['compact-reference-boundary', 'Compact references'],
      ['material-kind-classification', 'Metadata classification'],
      ['readiness-action-map', 'Three readiness actions'],
      ['audio-extraction-readiness', 'Audio draft ready'],
      ['worksheet-extraction-readiness', 'Worksheet extraction ready'],
      ['spreadsheet-import-readiness', 'Spreadsheet import ready'],
      ['reference-only-state', 'Reference-only explicit'],
      ['source-summary-view', 'Summary view model'],
      ['source-summary-hidden-handoff', 'Hidden dl handoff'],
      ['picker-owner-scope', 'Current teacher files'],
      ['picker-reference-write', 'Writes compact refs'],
      ['settings-library-provenance', 'Settings provenance'],
      ['ai-source-safe-provenance', 'Kind and basename only'],
      ['ai-source-omitted-notes', 'Unsafe notes omitted'],
      ['ai-draft-boundary-sanitization', 'Sanitized AI source'],
      ['activity-content-target', 'ActivityContent target'],
      ['question-pair-group-targets', 'Structured field targets'],
      ['accepted-answer-target', 'Accepted answers'],
      ['template-readiness-target', 'Template readiness'],
      ['editor-review-gate', 'Teacher review required'],
      ['persistence-boundary', 'Not auto-saved'],
      ['publish-boundary', 'No auto-publish'],
      ['assignment-snapshot-boundary', 'Snapshots unchanged'],
      ['source-material-privacy-chain-alignment', 'Privacy chain aligned'],
      ['ai-authoring-chain-alignment', 'AI authoring aligned'],
      ['template-roadmap-chain-alignment', 'Roadmap aligned'],
      ['public-payload-privacy', 'Public payload hidden'],
      ['source-extraction-lifecycle-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-content-target'),
    'ActivityContent target'
  );
});

test('source extraction lifecycle chain is backed by adjacent gates', () => {
  assert.equal(SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing source extraction lifecycle file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 7 }, () => 30)
  );
});

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
});

test('source extraction assist keeps readiness counts and privacy stable', () => {
  const handoffView = buildActivitySourceExtractionAssistHandoffView({
    sourceMaterials: mixedSourceMaterials,
  });
  const values = getExtractionAssistHandoffValues(handoffView);

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS]
  );
  assert.deepEqual(
    {
      'audio-source-count': values['audio-source-count'],
      'capability-count': values['capability-count'],
      'extractable-material-count': values['extractable-material-count'],
      'reference-only-count': values['reference-only-count'],
      'source-material-count': values['source-material-count'],
      'spreadsheet-source-count': values['spreadsheet-source-count'],
      'worksheet-source-count': values['worksheet-source-count'],
    },
    {
      'audio-source-count': '1',
      'capability-count': '3',
      'extractable-material-count': '4',
      'reference-only-count': '1',
      'source-material-count': '5',
      'spreadsheet-source-count': '1',
      'worksheet-source-count': '2',
    }
  );
  assert.deepEqual(handoffView.privacy, {
    appliesBeforeActivitySave: true,
    createsParallelWorksheetModel: false,
    exposesAcceptedAnswerText: false,
    exposesActivityContentText: false,
    exposesFileBytes: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds: [...ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS],
    modifiesPublishedAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'teacher-reviewed-source-extraction-assist',
    targetModel: 'ActivityContent',
  });
  assertNoPrivateLifecycleText(JSON.stringify(handoffView));
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
  assert.match(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /className="sr-only"[\s\S]*data-handoff="activity-source-extraction-assist"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*<dl>[\s\S]*data-handoff-item=\{item\.id\}/,
    'Activity source-material summary should expose extraction readiness through a hidden semantic dl handoff.'
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
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /exposesTeacherSourceMaterials: false/
  );
  assert.match(STUDENT_RUNTIME_SOURCE, /exposesSourceMaterialMetadata: false/);
});

test('source extraction lifecycle focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Source extraction lifecycle chain has a fast script-level gate via[\s\S]*scripts\/source-extraction-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the source extraction lifecycle chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /compact source-material references[\s\S]*material-kind\s+classification[\s\S]*audio\/worksheet\/spreadsheet\s+readiness[\s\S]*AI source provenance[\s\S]*public payload privacy/,
    'TEST-CATALOG should document the source extraction lifecycle chain scope.'
  );
});

function getHandoffValue(
  view: SourceExtractionLifecycleChainHandoffView,
  id: SourceExtractionLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing source extraction lifecycle item ${id}`);
  return item.value;
}

function getExtractionAssistHandoffValues(
  view: ReturnType<typeof buildActivitySourceExtractionAssistHandoffView>
) {
  return Object.fromEntries(
    view.itemViews.map((item) => [item.id, item.value])
  );
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

function assertNoPrivateLifecycleText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACCEPTED_ANSWER,
    SECRET_ACTIVITY_CONTENT,
    SECRET_FILE_BYTES,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_PERMISSION,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Source extraction lifecycle leaked private text: ${privateValue}`
    );
  }
}
