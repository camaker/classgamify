import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import {
  ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS,
  buildActivitySourceMaterialPickerHandoffView,
  buildActivitySourceMaterialPickerView,
  type ActivitySourceMaterialPickerHandoffItemId,
  type ActivitySourceMaterialPickerHandoffView,
} from '@/activities/material-summary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_ID = 'secret-picker-file-id';
const SECRET_FILENAME = 'secret source picker worksheet.pdf';
const SECRET_STORAGE_KEY = 'userfiles/teacher/secret-picker-key.pdf';
const SECRET_PERMISSION = 'signed-url-policy-secret';
const SECRET_FILE_BYTES = 'SECRET_FILE_BYTES';
const SECRET_STUDENT_PAYLOAD = 'SECRET_STUDENT_PAYLOAD_FILE_LIST';

const COMPONENT_SOURCE = readFileSync(
  'src/components/activities/activity-source-materials-field.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const selectedMaterials = normalizeActivityMaterialReferences([
  {
    contentType: 'audio/mpeg',
    fileId: `${SECRET_FILE_ID}-audio`,
    kind: 'audio',
    originalName: 'listening.mp3',
    size: 1024,
    storageKey: SECRET_STORAGE_KEY,
  },
  {
    contentType: 'application/pdf',
    fileId: SECRET_FILE_ID,
    kind: 'worksheet-document',
    originalName: SECRET_FILENAME,
    permission: SECRET_PERMISSION,
    size: 2048,
  },
  {
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileId: `${SECRET_FILE_ID}-spreadsheet`,
    kind: 'spreadsheet',
    originalName: 'vocabulary.xlsx',
    size: 4096,
  },
]);

test('source material picker handoff exposes 30 safe picker slices', () => {
  const pickerView = buildActivitySourceMaterialPickerView({
    availableFiles: [
      {
        contentType: 'audio/mpeg',
        id: `${SECRET_FILE_ID}-audio`,
        originalName: 'listening.mp3',
        size: 1024,
      },
      {
        contentType: 'image/png',
        id: `${SECRET_FILE_ID}-image`,
        originalName: 'worksheet scan.png',
        size: 2048,
      },
      {
        contentType: 'video/mp4',
        id: `${SECRET_FILE_ID}-reference`,
        originalName: 'reference video.mp4',
        size: 3072,
      },
    ],
    canLoadFiles: true,
    isError: false,
    isLoading: false,
    selectedMaterials,
  });
  const handoffView = buildActivitySourceMaterialPickerHandoffView(pickerView);
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS,
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
    attachesOnlyReferences: true,
    deletesUploadedFiles: false,
    exposesFileBytes: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    itemIds,
    scope: 'activity-source-material-picker',
    usesActivityContentSourceMaterials: true,
  });
  assert.deepEqual(getPickerHandoffValues(handoffView), {
    'ai-extraction-readiness': '3',
    'at-limit-gate': 'Within limit',
    'attach-action': '2',
    'attach-disabled-reason': '1',
    'attached-items': '3',
    'attached-summary': '3',
    'attachment-limit': 'Up to 12 files',
    'available-count': '3',
    'available-items': '3',
    'content-type-meta': 'Normalized content type',
    'empty-state': 'Inactive',
    'error-state': 'Inactive',
    'file-id-guard': 'File ids hidden',
    'filename-display-boundary': 'Teacher-only basename',
    'loading-state': 'Inactive',
    'material-kind-meta': 'Kind and basename',
    'owner-scope': 'Current teacher',
    'picker-status': 'Available',
    'privacy-guard': 'Private data hidden',
    'remove-action': 'Reference-only change',
    'selected-count': '3',
    'selected-state': '1',
    'signed-out-state': 'Inactive',
    'size-meta': 'Rounded size',
    'source-material-reference': 'ActivityContent.sourceMaterials',
    'storage-key-guard': 'Storage hidden',
    'storage-load-gate': 'Enabled',
    'student-payload-guard': 'Runtime file list hidden',
    'upload-entry': 'Upload files',
    'visible-available-limit': 'Bounded list',
  });
  assertNoPrivatePickerText(JSON.stringify(handoffView));
});

test('source material picker handoff keeps limit and sign-in gates explicit', () => {
  const limitView = buildActivitySourceMaterialPickerHandoffView(
    buildActivitySourceMaterialPickerView({
      availableFiles: [
        {
          contentType: 'application/pdf',
          id: `${SECRET_FILE_ID}-limit`,
          originalName: SECRET_FILENAME,
        },
        {
          contentType: 'audio/mpeg',
          id: `${SECRET_FILE_ID}-limit-audio`,
          originalName: 'extra listening.mp3',
        },
      ],
      canLoadFiles: true,
      isError: false,
      isLoading: false,
      selectedMaterials: Array.from(
        { length: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT },
        (_, index) => ({
          fileId: `limit-${index}`,
          kind: 'file',
          originalName: `Reference ${index}.txt`,
        })
      ),
    })
  );
  const signedOutView = buildActivitySourceMaterialPickerHandoffView(
    buildActivitySourceMaterialPickerView({
      availableFiles: [],
      canLoadFiles: false,
      isError: false,
      isLoading: false,
      selectedMaterials: [],
    })
  );

  assert.equal(getPickerHandoffValue(limitView, 'selected-count'), '12');
  assert.equal(
    getPickerHandoffValue(limitView, 'at-limit-gate'),
    'Limit reached'
  );
  assert.equal(getPickerHandoffValue(limitView, 'attach-action'), '0');
  assert.equal(getPickerHandoffValue(limitView, 'attach-disabled-reason'), '2');
  assert.equal(
    getPickerHandoffValue(signedOutView, 'storage-load-gate'),
    'Sign-in required'
  );
  assert.equal(
    getPickerHandoffValue(signedOutView, 'picker-status'),
    'Signed out'
  );
  assert.equal(
    getPickerHandoffValue(signedOutView, 'signed-out-state'),
    'Active'
  );
  assertNoPrivatePickerText(JSON.stringify(limitView));
  assertNoPrivatePickerText(JSON.stringify(signedOutView));
});

test('source material picker handoff localizes Chinese picker boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildActivitySourceMaterialPickerHandoffView(
      buildActivitySourceMaterialPickerView({
        availableFiles: [
          {
            contentType: 'text/csv',
            id: `${SECRET_FILE_ID}-csv`,
            originalName: '词汇.csv',
          },
        ],
        canLoadFiles: true,
        isError: false,
        isLoading: false,
        selectedMaterials: selectedMaterials.slice(0, 1),
      })
    );

    assert.equal(handoffView.title, '来源素材选择器交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(getPickerHandoffValue(handoffView, 'picker-status'), '可用');
    assert.equal(
      getPickerHandoffValue(handoffView, 'at-limit-gate'),
      '未达上限'
    );
    assert.equal(
      getPickerHandoffValue(handoffView, 'storage-key-guard'),
      '存储信息隐藏'
    );
    assert.equal(
      getPickerHandoffValue(handoffView, 'student-payload-guard'),
      '运行时文件列表隐藏'
    );
    assertNoPrivatePickerText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('source material picker handoff renders inside the activity editor field', () => {
  assert.match(
    COMPONENT_SOURCE,
    /buildActivitySourceMaterialPickerHandoffView\(pickerView\)/
  );
  assert.match(
    COMPONENT_SOURCE,
    /ActivitySourceMaterialPickerHandoffView[\s\S]*function ActivitySourceMaterialPickerHandoff[\s\S]*const titleId = 'activity-source-material-picker-handoff-title'[\s\S]*const descriptionId = 'activity-source-material-picker-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-source-material-picker"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map[\s\S]*ActivitySourceMaterialPickerHandoffItem[\s\S]*function ActivitySourceMaterialPickerHandoffItem[\s\S]*itemView: ActivitySourceMaterialPickerHandoffView\['itemViews'\]\[number\][\s\S]*const labelId = `activity-source-material-picker-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `activity-source-material-picker-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId =[\s\S]*`activity-source-material-picker-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

test('source material picker focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-source-material-picker-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'owner scope',
    'storage load gate',
    'picker status',
    'selected count',
    'available count',
    'attachment limit',
    'attached summary',
    'attach/remove actions',
    'upload entry',
    'material kind metadata',
    'content-type metadata',
    'size metadata',
    'ActivityContent.sourceMaterials reference',
    'AI extraction readiness',
    'student payload guard',
    'file-id guard',
    'filename display boundary',
    'storage-key guard',
    'source material picker privacy-scope boundaries',
    'hidden activity-source-material-picker handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

function getPickerHandoffValues(view: ActivitySourceMaterialPickerHandoffView) {
  return Object.fromEntries(
    view.itemViews.map((itemView) => [itemView.id, itemView.value])
  );
}

function getPickerHandoffValue(
  view: ActivitySourceMaterialPickerHandoffView,
  id: ActivitySourceMaterialPickerHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing source material picker handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivatePickerText(serializedView: string) {
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
      `Source material picker handoff leaked private text: ${privateValue}`
    );
  }
}
