import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS,
  buildSettingsFilesSourceMaterialHandoffView,
  type SettingsFilesSourceMaterialHandoffItemId,
  type SettingsFilesSourceMaterialHandoffView,
} from '@/settings/files-view';
import { buildUserFileMaterialSummary } from '@/storage/file-summary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT';
const SECRET_FILE_BYTES = 'SECRET_FILE_BYTES';
const SECRET_FILENAME = 'secret-classroom-source.pdf';
const SECRET_PERMISSION = 'signed-url-policy-secret';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private/source.pdf';
const SECRET_STUDENT_IDENTITY = 'SECRET_STUDENT_IDENTITY';

test('settings files source material handoff exposes 30 safe library slices', () => {
  const summary = buildUserFileMaterialSummary([
    {
      contentType: 'application/pdf',
      isPublic: false,
      originalName: SECRET_FILENAME,
      size: 2048,
    },
    {
      contentType: 'audio/mpeg',
      isPublic: false,
      originalName: 'listening.mp3',
      size: 1024,
    },
    {
      contentType: 'image/png',
      isPublic: true,
      originalName: 'worksheet.png',
      size: 3072,
    },
  ]);
  const handoffView = buildSettingsFilesSourceMaterialHandoffView({
    pageIndex: 1,
    pageSize: 2,
    summary,
    total: 3,
    visibleItemCount: 2,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS,
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
    exposesActivityContent: false,
    exposesFileBytes: false,
    exposesPermissionMetadata: false,
    exposesRawStudentIdentity: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherPrivateFilenames: false,
    itemIds,
    publicPayloadIncludesFileList: false,
    scope: 'teacher-source-material-library',
    storageKeysStayServerSide: true,
    tracksOwnerScopedUserFiles: true,
  });

  assert.equal(getHandoffValue(handoffView, 'owner-scope'), 'Teacher-owned');
  assert.equal(getHandoffValue(handoffView, 'storage-feature-gate'), 'Enabled');
  assert.equal(
    getHandoffValue(handoffView, 'source-library'),
    'Source material library'
  );
  assert.equal(getHandoffValue(handoffView, 'upload-dialog'), 'Upload file');
  assert.equal(getHandoffValue(handoffView, 'upload-file-input'), 'File');
  assert.equal(
    getHandoffValue(handoffView, 'upload-description'),
    'Description'
  );
  assert.equal(
    getHandoffValue(handoffView, 'upload-visibility'),
    'Private by default'
  );
  assert.equal(getHandoffValue(handoffView, 'total-files'), '3');
  assert.equal(getHandoffValue(handoffView, 'total-storage'), '6.0 KB');
  assert.equal(getHandoffValue(handoffView, 'worksheet-materials'), '2');
  assert.equal(getHandoffValue(handoffView, 'audio-materials'), '1');
  assert.equal(getHandoffValue(handoffView, 'private-materials'), '2');
  assert.equal(getHandoffValue(handoffView, 'public-materials'), '1');
  assert.equal(getHandoffValue(handoffView, 'visible-page-items'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'pagination'),
    'Page 2 of 2; 3 materials'
  );
  assert.equal(getHandoffValue(handoffView, 'table-name-column'), 'Name');
  assert.equal(
    getHandoffValue(handoffView, 'table-material-column'),
    'Material'
  );
  assert.equal(getHandoffValue(handoffView, 'table-access-column'), 'Access');
  assert.equal(getHandoffValue(handoffView, 'open-link-action'), 'Open');
  assert.equal(getHandoffValue(handoffView, 'delete-action'), 'Delete');
  assert.equal(
    getHandoffValue(handoffView, 'activity-source-reference'),
    'ActivityContent.sourceMaterials'
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-attachment-boundary'),
    'Activity attachments'
  );
  assert.equal(
    getHandoffValue(handoffView, 'ai-provenance'),
    'AI draft provenance'
  );
  assert.equal(
    getHandoffValue(handoffView, 'safe-filename-provenance'),
    'Basename only'
  );
  assert.equal(getHandoffValue(handoffView, 'file-byte-guard'), 'Not exposed');
  assert.equal(
    getHandoffValue(handoffView, 'storage-key-guard'),
    'Server-side only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'permission-guard'),
    'Metadata hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-payload-guard'),
    'Runtime only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-extraction-boundary'),
    'Future extension'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateFilesText(JSON.stringify(handoffView));
});

test('settings files handoff keeps loading and upload states explicit', () => {
  const handoffView = buildSettingsFilesSourceMaterialHandoffView({
    loading: true,
    pageIndex: 999,
    pageSize: 10,
    total: 0,
    uploading: true,
  });

  assert.equal(getHandoffValue(handoffView, 'upload-dialog'), 'Uploading…');
  assert.equal(
    getHandoffValue(handoffView, 'visible-page-items'),
    'Loading...'
  );
  assert.equal(
    getHandoffValue(handoffView, 'pagination'),
    'Page 1 of 1; 0 materials'
  );
  assertNoPrivateFilesText(JSON.stringify(handoffView));
});

test('settings files handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildSettingsFilesSourceMaterialHandoffView({
      summary: buildUserFileMaterialSummary([
        {
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          isPublic: false,
          originalName: '成绩.xlsx',
          size: 1024,
        },
      ]),
      total: 1,
      visibleItemCount: 1,
    });

    assert.deepEqual(
      handoffView.itemViews.map((item) => item.id),
      [...SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS]
    );
    assert.equal(handoffView.title, '来源素材库交接');
    assert.equal(getHandoffValue(handoffView, 'owner-scope'), '教师拥有');
    assert.equal(
      getHandoffValue(handoffView, 'storage-feature-gate'),
      '已启用'
    );
    assert.equal(getHandoffValue(handoffView, 'total-files'), '1');
    assert.equal(getHandoffValue(handoffView, 'storage-key-guard'), '仅服务端');
    assert.equal(
      getHandoffValue(handoffView, 'student-payload-guard'),
      '仅运行时内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );
    assertNoPrivateFilesText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: SettingsFilesSourceMaterialHandoffView,
  id: SettingsFilesSourceMaterialHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing files handoff item ${id}`);
  return item.value;
}

function assertNoPrivateFilesText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_FILE_BYTES,
    SECRET_FILENAME,
    SECRET_PERMISSION,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_IDENTITY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Settings files handoff leaked private text: ${privateValue}`
    );
  }
}
