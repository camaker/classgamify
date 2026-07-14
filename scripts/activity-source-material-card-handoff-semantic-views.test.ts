import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS,
  buildActivitySourceMaterialCardHandoffView,
  buildActivitySourceMaterialSummaryView,
  type ActivitySourceMaterialCardHandoffItemId,
  type ActivitySourceMaterialCardHandoffView,
} from '@/activities/material-summary';
import type { ActivityMaterialReference } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const MATERIAL_SUMMARY_SOURCE = readFileSync(
  'src/activities/material-summary.ts',
  'utf8'
);
const SOURCE_MATERIALS_SUMMARY_SOURCE = readFileSync(
  'src/components/activities/activity-source-materials-summary.tsx',
  'utf8'
);
const ACTIVITY_LIBRARY_CARD_SOURCE = readFileSync(
  'src/components/activities/activity-library-card.tsx',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const SECRET_BYTES = 'SECRET_CARD_FILE_BYTES';
const SECRET_FILE_ID = 'secret-card-file-id';
const SECRET_FILENAME = 'secret-card-source-material.pdf';
const SECRET_PERMISSION = 'secret-card-permission';
const SECRET_STORAGE_KEY = 'userfiles/teacher/card-source.pdf';

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
    bytes: SECRET_BYTES,
    contentType: 'video/mp4',
    fileId: `${SECRET_FILE_ID}-video`,
    kind: 'video',
    originalName: 'reference.mp4',
    size: 5120,
  },
];

test('activity source-material card handoff exposes 30 safe slices', () => {
  const handoffView = buildHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS,
  ]);
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
    exposesContentTypes: false,
    exposesFileBytes: false,
    exposesOriginalFilenames: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    itemIds,
    scope: 'activity-card-source-material-summary',
    summarizesByMaterialKind: true,
    usesActivityContentSourceMaterials: true,
  });
  assertNoPrivateSourceMaterialText(JSON.stringify(handoffView));
});

test('activity source-material card handoff summarizes card counts and actions', () => {
  const values = getHandoffValues(buildHandoffView());

  assert.equal(values.get('summary-surface'), 'Source materials');
  assert.equal(values.get('activity-card-scope'), 'Activity card');
  assert.equal(values.get('attached-count'), '5 files');
  assert.equal(values.get('kind-badge-count'), '5');
  assert.equal(values.get('audio-count'), '1');
  assert.equal(values.get('worksheet-document-count'), '1');
  assert.equal(values.get('worksheet-image-count'), '1');
  assert.equal(values.get('spreadsheet-count'), '1');
  assert.equal(values.get('reference-only-count'), '1');
  assert.equal(values.get('extractable-count'), '4');
  assert.equal(values.get('readiness-status'), '4 extraction-ready files');
  assert.equal(values.get('primary-next-step'), 'Listening draft input');
  assert.equal(values.get('extraction-action-count'), '3');
  assert.equal(values.get('audio-extraction-action'), 'Audio extraction');
  assert.equal(
    values.get('worksheet-extraction-action'),
    'Worksheet extraction'
  );
  assert.equal(values.get('spreadsheet-import-action'), 'Spreadsheet import');
  assert.equal(values.get('edit-action-slot'), 'Available');
  assert.equal(values.get('editor-return-path'), 'Activity editor');
  assert.equal(
    values.get('activity-content-reference'),
    'ActivityContent.sourceMaterials'
  );
  assert.equal(values.get('content-type-boundary'), 'Summarized by kind');
  assert.equal(values.get('size-summary-boundary'), 'Card count only');
  assert.equal(values.get('file-byte-guard'), 'Bytes not read');
  assert.equal(values.get('filename-guard'), 'Filenames hidden');
  assert.equal(values.get('file-id-guard'), 'File ids hidden');
  assert.equal(values.get('storage-key-guard'), 'Storage hidden');
  assert.equal(values.get('student-payload-guard'), 'Runtime file list hidden');
});

test('activity source-material card handoff localizes visible card semantics', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const values = getHandoffValues(buildHandoffView());

    assert.equal(values.get('summary-surface'), '来源素材');
    assert.equal(values.get('activity-card-scope'), '活动卡片');
    assert.equal(values.get('attached-count'), '5 个文件');
    assert.equal(values.get('readiness-status'), '4 个文件可提取');
    assert.equal(values.get('primary-next-step'), '听力草稿输入');
    assert.equal(values.get('edit-action-slot'), '可用');
    assert.equal(values.get('editor-return-path'), '活动编辑器');
    assert.equal(values.get('content-type-boundary'), '按类型汇总');
    assert.equal(values.get('size-summary-boundary'), '卡片只计数');
    assert.equal(values.get('file-byte-guard'), '不读取文件内容');
    assert.equal(values.get('filename-guard'), '文件名隐藏');
    assert.equal(values.get('file-id-guard'), '文件 ID 隐藏');
    assert.equal(values.get('storage-key-guard'), '存储信息隐藏');
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('activity source-material card summary renders a hidden semantic dl', () => {
  assert.match(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /buildActivitySourceMaterialCardHandoffView\(\{[\s\S]*hasEditAction: Boolean\(actionSlot\),[\s\S]*summary,[\s\S]*\}\)/
  );
  assert.match(
    SOURCE_MATERIALS_SUMMARY_SOURCE,
    /data-handoff="activity-source-material-card-summary"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*<dl>[\s\S]*handoff\.itemViews\.map\(\(item\) =>[\s\S]*ActivitySourceMaterialCardHandoffItem[\s\S]*const labelId = `activity-source-material-card-summary-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-source-material-card-summary-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-source-material-card-summary-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    ACTIVITY_LIBRARY_CARD_SOURCE,
    /ActivitySourceMaterialsSummary[\s\S]*actionSlot=\{[\s\S]*cardDisplayView\.actionState\.showEditAction[\s\S]*cardDisplayView\.sourceMaterials\.hasMaterials[\s\S]*summary=\{cardDisplayView\.sourceMaterials\}/
  );
});

test('activity source-material card handoff is documented and domain-owned', () => {
  assert.match(
    MATERIAL_SUMMARY_SOURCE,
    /ACTIVITY_SOURCE_MATERIAL_CARD_HANDOFF_ITEM_IDS = \[[\s\S]*'summary-surface'[\s\S]*'activity-card-scope'[\s\S]*'attached-count'[\s\S]*'audio-count'[\s\S]*'worksheet-document-count'[\s\S]*'worksheet-image-count'[\s\S]*'spreadsheet-count'[\s\S]*'edit-action-slot'[\s\S]*'storage-key-guard'[\s\S]*'student-payload-guard'/
  );
  assert.match(
    PRODUCT_SOURCE,
    /activity-card source-material summary chain[\s\S]*30\s+slices[\s\S]*material-kind counts[\s\S]*extraction-readiness actions[\s\S]*edit-return path[\s\S]*privacy guards/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity source-material card summary has a fast script-level gate via[\s\S]*scripts\/activity-source-material-card-handoff-semantic-views\.test\.ts/
  );
});

function buildHandoffView() {
  return buildActivitySourceMaterialCardHandoffView({
    hasEditAction: true,
    summary: buildActivitySourceMaterialSummaryView(sourceMaterials),
  });
}

function getHandoffValues(view: ActivitySourceMaterialCardHandoffView) {
  return new Map(
    view.itemViews.map((item) => [
      item.id satisfies ActivitySourceMaterialCardHandoffItemId,
      item.value,
    ])
  );
}

function assertNoPrivateSourceMaterialText(serializedView: string) {
  for (const privateValue of [
    SECRET_BYTES,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_PERMISSION,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity card source-material handoff leaked private text: ${privateValue}`
    );
  }
}
