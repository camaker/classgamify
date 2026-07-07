import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS,
  buildActivitySourceExtractionAssistHandoffView,
  type ActivitySourceExtractionAssistHandoffItemId,
  type ActivitySourceExtractionAssistHandoffView,
} from '@/activities/source-extraction-assist';
import type { ActivityMaterialReference } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_ID = 'secret-source-extraction-file-id';
const SECRET_FILENAME = 'secret source extraction worksheet.pdf';
const SECRET_STORAGE_KEY = 'source-materials/private/extraction-key.pdf';
const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT';
const SECRET_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_ANSWER';
const SECRET_FILE_BYTES = 'SECRET_FILE_BYTES';

const SOURCE_MATERIALS_SUMMARY_SOURCE = readFileSync(
  'src/components/activities/activity-source-materials-summary.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const mixedSourceMaterials: Array<
  ActivityMaterialReference & {
    bytes?: string;
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

test('source extraction assist handoff exposes 30 safe draft slices', () => {
  const handoffView = buildActivitySourceExtractionAssistHandoffView({
    sourceMaterials: mixedSourceMaterials,
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
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
    itemIds,
    modifiesPublishedAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'teacher-reviewed-source-extraction-assist',
    targetModel: 'ActivityContent',
  });

  assert.deepEqual(getExtractionAssistHandoffValues(handoffView), {
    'accepted-answer-target': 'Accepted answers',
    'activity-content-target': 'ActivityContent',
    'assignment-snapshot-boundary': 'Snapshots unchanged',
    'audio-draft-path': 'Listening draft ready',
    'audio-source-count': '1',
    'capability-count': '3',
    'draft-output': 'Editor draft',
    'editor-review-gate': 'Teacher review required',
    'extractable-material-count': '4',
    'file-byte-guard': 'Bytes not read',
    'file-id-guard': 'File ids hidden',
    'filename-guard': 'Filenames hidden',
    'group-target': 'Groups',
    'owner-scope': 'Current teacher',
    'pair-target': 'Pairs',
    'parallel-model-guard': 'No parallel worksheet model',
    'persistence-boundary': 'Not auto-saved',
    'privacy-guard': 'Private data hidden',
    'publish-boundary': 'Save before publish',
    'question-target': 'Questions',
    'reference-only-count': '1',
    'source-material-count': '5',
    'spreadsheet-import-path': 'Structured import ready',
    'spreadsheet-source-count': '1',
    'storage-key-guard': 'Storage hidden',
    'teacher-note-target': 'Teacher notes',
    'template-readiness-target': 'Template readiness',
    'vocabulary-target': 'Vocabulary',
    'worksheet-extraction-path': 'Worksheet extraction ready',
    'worksheet-source-count': '2',
  });
  assertNoPrivateExtractionAssistText(JSON.stringify(handoffView));
});

test('source extraction assist keeps reference-only and empty states explicit', () => {
  const referenceOnlyView = buildActivitySourceExtractionAssistHandoffView({
    sourceMaterials: [
      {
        contentType: 'video/mp4',
        fileId: `${SECRET_FILE_ID}-reference`,
        kind: 'video',
        originalName: 'reference.mp4',
      },
    ],
  });
  const emptyView = buildActivitySourceExtractionAssistHandoffView();

  assert.equal(
    getExtractionAssistHandoffValue(referenceOnlyView, 'source-material-count'),
    '1'
  );
  assert.equal(
    getExtractionAssistHandoffValue(
      referenceOnlyView,
      'extractable-material-count'
    ),
    '0'
  );
  assert.equal(
    getExtractionAssistHandoffValue(referenceOnlyView, 'reference-only-count'),
    '1'
  );
  assert.equal(
    getExtractionAssistHandoffValue(referenceOnlyView, 'audio-draft-path'),
    'Needs audio'
  );
  assert.equal(
    getExtractionAssistHandoffValue(
      referenceOnlyView,
      'worksheet-extraction-path'
    ),
    'Needs worksheet'
  );
  assert.equal(
    getExtractionAssistHandoffValue(
      referenceOnlyView,
      'spreadsheet-import-path'
    ),
    'Needs spreadsheet'
  );
  assert.deepEqual(
    emptyView.itemViews.map((itemView) => itemView.id),
    [...ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getExtractionAssistHandoffValue(emptyView, 'source-material-count'),
    '0'
  );
  assertNoPrivateExtractionAssistText(JSON.stringify(referenceOnlyView));
  assertNoPrivateExtractionAssistText(JSON.stringify(emptyView));
});

test('source extraction assist handoff localizes Chinese extraction paths', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildActivitySourceExtractionAssistHandoffView({
      sourceMaterials: mixedSourceMaterials,
    });

    assert.equal(handoffView.title, '来源素材提取辅助交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getExtractionAssistHandoffValue(handoffView, 'audio-draft-path'),
      '听力草稿就绪'
    );
    assert.equal(
      getExtractionAssistHandoffValue(handoffView, 'worksheet-extraction-path'),
      '练习纸提取就绪'
    );
    assert.equal(
      getExtractionAssistHandoffValue(handoffView, 'parallel-model-guard'),
      '不创建平行练习纸模型'
    );
    assert.equal(
      getExtractionAssistHandoffValue(handoffView, 'storage-key-guard'),
      '存储信息隐藏'
    );
    assertNoPrivateExtractionAssistText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('source extraction assist handoff renders stable DOM relationships', () => {
  assert.match(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /data-handoff="activity-source-extraction-assist"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*handoff\.itemViews\.map\(\(item\) =>[\s\S]*ActivitySourceExtractionAssistHandoffItem[\s\S]*const labelId = `activity-source-extraction-assist-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-source-extraction-assist-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-source-extraction-assist-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Source extraction assist handoff should render each slice with stable label, value, and description relationships.'
  );
});

test('source extraction assist focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-source-extraction-assist-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point source extraction assist work at the focused script gate.'
  );
  for (const boundary of [
    'attached-material extraction readiness',
    'audio draft paths',
    'worksheet extraction paths',
    'spreadsheet import paths',
    'ActivityContent write targets',
    'editor-review gates',
    'source-material privacy guards',
    'parallel worksheet-model boundaries',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace(/[ -]+/g, '[\\s-]+')),
      `E2E catalog should mention source extraction boundary: ${boundary}`
    );
  }
});

function getExtractionAssistHandoffValues(
  view: ActivitySourceExtractionAssistHandoffView
) {
  return Object.fromEntries(
    view.itemViews.map((itemView) => [itemView.id, itemView.value])
  );
}

function getExtractionAssistHandoffValue(
  view: ActivitySourceExtractionAssistHandoffView,
  id: ActivitySourceExtractionAssistHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing source extraction assist handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateExtractionAssistText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACCEPTED_ANSWER,
    SECRET_ACTIVITY_CONTENT,
    SECRET_FILE_BYTES,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Source extraction assist handoff leaked private text: ${privateValue}`
    );
  }
}
