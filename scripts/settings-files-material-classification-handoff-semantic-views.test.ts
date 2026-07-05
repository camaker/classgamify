import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS,
  buildSettingsFilesMaterialClassificationHandoffView,
  type SettingsFilesMaterialClassificationHandoffItemId,
  type SettingsFilesMaterialClassificationHandoffView,
} from '@/settings/files-material-classification-view';
import { buildUserFileMaterialClassificationView } from '@/storage/file-material-classification';
import { classifyUserFileMaterial } from '@/storage/file-materials';
import { buildUserFileMaterialSummary } from '@/storage/file-summary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_BYTES = 'SECRET_FILE_BYTES';
const SECRET_FILENAME = 'private-answer-key.pdf';
const SECRET_PERMISSION = 'signed-url-policy-secret';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private-answer-key.pdf';

test('settings files classifier keeps content type and extension fallback explicit', () => {
  assert.deepEqual(
    classifyUserFileMaterial({
      contentType: 'Audio/MPEG; charset=binary',
      originalName: 'Listening.MP3',
    }),
    {
      basis: 'content-type',
      contentType: 'audio/mpeg',
      extension: 'mp3',
      kind: 'audio',
    }
  );

  assert.deepEqual(
    classifyUserFileMaterial({
      contentType: 'application/octet-stream',
      originalName: `C:/teacher/private/${SECRET_FILENAME}`,
    }),
    {
      basis: 'extension',
      contentType: 'application/octet-stream',
      extension: 'pdf',
      kind: 'worksheet-document',
    }
  );

  assert.deepEqual(
    classifyUserFileMaterial({
      contentType: '',
      originalName: 'mystery.material',
    }),
    {
      basis: 'fallback',
      contentType: undefined,
      extension: 'material',
      kind: 'file',
    }
  );

  const classificationView = buildUserFileMaterialClassificationView({
    contentType: 'application/octet-stream',
    originalName: SECRET_FILENAME,
  });

  assert.equal(classificationView.label, 'Worksheet document');
  assert.equal(classificationView.basisLabel, 'Filename extension');
  assert.equal(classificationView.secondaryDetail, 'application/octet-stream');
  assert.equal(classificationView.secondaryLabel, 'Content type');
  assert.equal(classificationView.isWorksheetMaterial, true);
  assert.equal(classificationView.isAudioMaterial, false);
  assertNoPrivateMaterialText(JSON.stringify(classificationView));
});

test('settings files material classification handoff exposes 30 safe slices', () => {
  const summary = buildUserFileMaterialSummary([
    material('audio/mpeg', 'listening.mp3', false),
    material('image/png', 'worksheet.png', true),
    material('application/pdf', SECRET_FILENAME, false),
    material(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'grades.xlsx',
      false
    ),
    material('application/zip', 'packet.zip', false),
    material('application/json', 'import.json', true),
    material('video/mp4', 'demo.mp4', false),
    material('application/octet-stream', 'unknown.material', false),
  ]);
  const handoffView = buildSettingsFilesMaterialClassificationHandoffView({
    sampleFile: {
      contentType: 'application/octet-stream',
      originalName: SECRET_FILENAME,
    },
    summary,
    total: 8,
    visibleItemCount: 3,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS,
  ]);
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
    classificationUsesSafeBasenameExtension: true,
    exposesFileBytes: false,
    exposesOriginalFilenames: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    publicPayloadIncludesFileMetadata: false,
    scope: 'settings-files-material-classification',
    tableMayShowContentType: true,
  });

  assert.equal(
    getHandoffValue(handoffView, 'classification-source'),
    'Filename extension'
  );
  assert.equal(
    getHandoffValue(handoffView, 'content-type-normalization'),
    'application/octet-stream'
  );
  assert.equal(getHandoffValue(handoffView, 'extension-fallback'), '.pdf');
  assert.equal(getHandoffValue(handoffView, 'audio-detection'), '1');
  assert.equal(getHandoffValue(handoffView, 'worksheet-image-detection'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-document-detection'),
    '1'
  );
  assert.equal(getHandoffValue(handoffView, 'spreadsheet-detection'), '1');
  assert.equal(getHandoffValue(handoffView, 'archive-detection'), '1');
  assert.equal(getHandoffValue(handoffView, 'data-detection'), '1');
  assert.equal(getHandoffValue(handoffView, 'video-detection'), '1');
  assert.equal(getHandoffValue(handoffView, 'unknown-file-fallback'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'table-primary-label'),
    'Worksheet document'
  );
  assert.equal(
    getHandoffValue(handoffView, 'table-secondary-detail'),
    'application/octet-stream'
  );
  assert.equal(getHandoffValue(handoffView, 'summary-total-scope'), '8');
  assert.equal(getHandoffValue(handoffView, 'summary-storage-scope'), '8.0 KB');
  assert.equal(getHandoffValue(handoffView, 'summary-worksheet-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'summary-audio-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'owner-scope'), 'Teacher-owned');
  assert.equal(
    getHandoffValue(handoffView, 'activity-source-reference'),
    'ActivityContent.sourceMaterials'
  );
  assert.equal(
    getHandoffValue(handoffView, 'ai-provenance-reference'),
    'AI draft provenance'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-payload-guard'),
    'Runtime only'
  );
  assert.equal(getHandoffValue(handoffView, 'file-byte-guard'), 'Not exposed');
  assert.equal(
    getHandoffValue(handoffView, 'storage-key-guard'),
    'Server-side only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'filename-path-guard'),
    'Basename only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'permission-guard'),
    'Metadata hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-access-separation'),
    '6 private / 2 public'
  );
  assert.equal(
    getHandoffValue(handoffView, 'upload-validation-boundary'),
    'Provider validated'
  );
  assert.equal(getHandoffValue(handoffView, 'visible-row-classification'), '3');
  assert.equal(
    getHandoffValue(handoffView, 'full-library-summary'),
    '8 materials · 8.0 KB'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );
  assertNoPrivateMaterialText(JSON.stringify(handoffView));
});

test('settings files material classification handoff localizes Chinese labels', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const summary = buildUserFileMaterialSummary([
      material('application/pdf', '练习纸.pdf', false),
      material('text/csv', '成绩.csv', false),
    ]);
    const handoffView = buildSettingsFilesMaterialClassificationHandoffView({
      sampleFile: {
        contentType: 'application/pdf',
        originalName: '练习纸.pdf',
      },
      summary,
      total: 2,
      visibleItemCount: 2,
    });

    assert.deepEqual(
      handoffView.itemViews.map((item) => item.id),
      [...SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS]
    );
    assert.equal(handoffView.title, '材料分类交接');
    assert.equal(
      getHandoffValue(handoffView, 'classification-source'),
      'Content type'
    );
    assert.equal(
      getHandoffValue(handoffView, 'table-primary-label'),
      '练习纸文档'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-access-separation'),
      '2 私有 / 0 公开'
    );
    assert.equal(
      getHandoffValue(handoffView, 'full-library-summary'),
      '2 个素材 · 2.0 KB'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function material(
  contentType: string,
  originalName: string,
  isPublic: boolean
) {
  return {
    contentType,
    isPublic,
    originalName,
    size: 1024,
  };
}

function getHandoffValue(
  view: SettingsFilesMaterialClassificationHandoffView,
  id: SettingsFilesMaterialClassificationHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing material classification handoff item ${id}`);
  return item.value;
}

function assertNoPrivateMaterialText(serializedView: string) {
  for (const privateValue of [
    SECRET_BYTES,
    SECRET_FILENAME,
    SECRET_PERMISSION,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Material classification handoff leaked private text: ${privateValue}`
    );
  }
}
