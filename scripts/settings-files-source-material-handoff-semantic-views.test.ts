import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS,
  buildSettingsFilesPageViewModel,
  buildSettingsFilesSourceMaterialHandoffView,
  buildSettingsFilesWorkspaceSummaryView,
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

const FILES_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/files.tsx',
  'utf8'
);
const FILES_WORKSPACE_SUMMARY_SOURCE = readFileSync(
  'src/components/settings/files/files-workspace-summary.tsx',
  'utf8'
);
const FILES_PAGE_CONTENT_SOURCE = readFileSync(
  'src/components/settings/files/files-page-content.tsx',
  'utf8'
);
const FILES_TABLE_SOURCE = readFileSync(
  'src/components/settings/files/files-table.tsx',
  'utf8'
);
const FILES_SOURCE_HANDOFF_PANEL_SOURCE = readFileSync(
  'src/components/settings/files/files-source-material-handoff-panel.tsx',
  'utf8'
);
const FILES_MATERIAL_HANDOFF_SOURCE = readFileSync(
  'src/components/settings/files/files-material-classification-handoff.tsx',
  'utf8'
);
const USER_FILES_HOOK_SOURCE = readFileSync(
  'src/hooks/use-user-files.ts',
  'utf8'
);
const USER_FILES_API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');

test('settings files route puts the material boundary before the file table', () => {
  const pageView = buildSettingsFilesPageViewModel();
  const workspaceView = buildSettingsFilesWorkspaceSummaryView();

  assert.equal(pageView.workspaceSummaryView.title, workspaceView.title);
  assert.deepEqual(
    workspaceView.itemViews.map((item) => item.id),
    [
      'source-library',
      'activity-attachments',
      'ai-provenance',
      'student-privacy',
    ]
  );
  assert.equal(
    workspaceView.itemViews.every(
      (item) =>
        item.ariaLabel.includes(item.label) &&
        item.ariaLabel.includes(item.description)
    ),
    true
  );

  assert.match(
    FILES_ROUTE_SOURCE,
    /beforeLoad:[\s\S]*isSettingsFilesEnabled\(\)[\s\S]*throw notFound\(\{ routeId: rootRouteId \}\)/,
    'Files settings route should centralize the storage feature gate.'
  );
  assert.match(
    FILES_ROUTE_SOURCE,
    /const pageView = buildSettingsFilesPageViewModel\(\);[\s\S]*FilesWorkspaceSummary[\s\S]*view=\{pageView\.workspaceSummaryView\}[\s\S]*FilesPageContent/,
    'Files settings route should render the material boundary before the table.'
  );
  assert.match(
    FILES_WORKSPACE_SUMMARY_SOURCE,
    /view\.itemViews\.map\(\(itemView\) =>[\s\S]*key=\{itemView\.id\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*itemView\.label[\s\S]*itemView\.description/,
    'Workspace summary should render prepared item labels and descriptions.'
  );
  assert.doesNotMatch(
    FILES_ROUTE_SOURCE,
    /m\.settings_files_|m\.common_settings|websiteConfig\.storage/,
    'Files route should not rebuild files copy or storage visibility inline.'
  );
});

test('settings files table wires full-library summaries and safe handoff panels', () => {
  assert.match(
    FILES_TABLE_SOURCE,
    /const materialSummary = useMemo\([\s\S]*summary \?\? buildUserFileMaterialSummary\(data\)/,
    'Files table should prefer API full-library summaries over visible rows.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /buildSettingsFilesSourceMaterialHandoffView\(\{[\s\S]*loading,[\s\S]*pageIndex,[\s\S]*pageSize,[\s\S]*summary: materialSummary,[\s\S]*total,[\s\S]*uploading,[\s\S]*visibleItemCount: data\.length/,
    'Files table should expose source-material handoff state from table data.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /buildSettingsFilesMaterialClassificationHandoffView\(\{[\s\S]*sampleFile: data\[0\],[\s\S]*summary: materialSummary,[\s\S]*total,[\s\S]*visibleItemCount: data\.length/,
    'Files table should expose the material-classification handoff contract.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /<FilesSummaryStrip summary=\{materialSummary\} \/>[\s\S]*<FilesSourceMaterialHandoffPanel view=\{handoffView\} \/>[\s\S]*<FilesMaterialClassificationHandoff[\s\S]*view=\{materialClassificationHandoffView\}/,
    'Files table should render summary and handoff panels before the table.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /buildUserFileMaterialClassificationView\(\{[\s\S]*contentType: file\.contentType,[\s\S]*filename: file\.filename,[\s\S]*originalName: file\.originalName/,
    'Material cells should use the storage-domain classification view.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /const url = getFileAccessUrl\(row\.original\.r2Key\);[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/,
    'Teacher table open links should stay explicit and browser-safe.'
  );
  assert.match(
    FILES_SOURCE_HANDOFF_PANEL_SOURCE,
    /SettingsFilesSourceMaterialHandoffView[\s\S]*data-handoff="settings-files-source-material"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map\(\(itemView\) =>[\s\S]*FilesSourceMaterialHandoffItem[\s\S]*function FilesSourceMaterialHandoffItem[\s\S]*const labelId = `settings-files-source-material-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `settings-files-source-material-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `settings-files-source-material-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Source-material handoff panel should render stable label, value, and description relationships.'
  );
  assert.match(
    FILES_MATERIAL_HANDOFF_SOURCE,
    /SettingsFilesMaterialClassificationHandoffView[\s\S]*data-handoff="settings-files-material-classification"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map\(\(itemView\) =>[\s\S]*FilesMaterialClassificationHandoffItem[\s\S]*function FilesMaterialClassificationHandoffItem[\s\S]*const labelId = `settings-files-material-classification-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `settings-files-material-classification-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `settings-files-material-classification-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Material-classification handoff should render stable label, value, and description relationships.'
  );
});

test('settings files upload errors stay localized and do not clear failed input', () => {
  assert.match(
    FILES_PAGE_CONTENT_SOURCE,
    /onError: \(err\) => \{[\s\S]*toast\.error\(m\.settings_files_upload_error\(\)\);[\s\S]*reject\(err\);[\s\S]*\}/,
    'Files page content should toast localized upload failures.'
  );
  assert.match(
    FILES_PAGE_CONTENT_SOURCE,
    /onError: \(\) => toast\.error\(m\.settings_files_delete_error\(\)\)/,
    'Files page content should toast localized delete failures.'
  );
  assert.doesNotMatch(
    FILES_PAGE_CONTENT_SOURCE,
    /err\.message|error\.message|err instanceof Error|error instanceof Error/,
    'Files page content should not render raw storage failure details.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /try \{[\s\S]*await onUpload\(\{[\s\S]*file: selectedFile,[\s\S]*isPublic,[\s\S]*description: description \|\| undefined,[\s\S]*\}\);[\s\S]*\} catch \{[\s\S]*return;[\s\S]*\}[\s\S]*setSelectedFile\(null\);[\s\S]*setDescription\(''\);[\s\S]*setIsPublic\(false\);[\s\S]*setUploadOpen\(false\);/,
    'Files table should keep the dialog state intact when upload rejects.'
  );
});

test('settings files hooks and APIs keep owner scope and sanitized material lists', () => {
  assert.match(
    USER_FILES_HOOK_SOURCE,
    /queryKey: userFilesKeys\.list\(\{ pageIndex, pageSize \}\)[\s\S]*queryFn: \(\) => listUserFiles\(\{ data: \{ pageIndex, pageSize \} \}\)/,
    'useUserFiles should call the owner-scoped list API with page state.'
  );
  assert.match(
    USER_FILES_HOOK_SOURCE,
    /queryKey: userFilesKeys\.materials\(\{ pageIndex, pageSize \}\)[\s\S]*queryFn: \(\) => listUserFileMaterials\(\{ data: \{ pageIndex, pageSize \} \}\)/,
    'useUserFileMaterials should call the sanitized material list API.'
  );
  assert.match(
    USER_FILES_HOOK_SOURCE,
    /deleteUserFile\(\{ data: \{ id \} \}\)[\s\S]*invalidateQueries\(\{ queryKey: userFilesKeys\.all \}\)/,
    'Deleting a file should invalidate all user-file library queries.'
  );
  assert.match(
    USER_FILES_HOOK_SOURCE,
    /form\.append\('file', params\.file\)[\s\S]*form\.append\('isPublic', params\.isPublic \? 'true' : 'false'\)[\s\S]*form\.append\('description', params\.description\)[\s\S]*uploadUserFile\(\{ data: form \}\)[\s\S]*invalidateQueries\(\{ queryKey: userFilesKeys\.all \}\)/,
    'Uploading a file should send FormData and refresh file-library queries.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const where = buildUserFileOwnerWhere\(\{ userId \}\);[\s\S]*select\(\)[\s\S]*from\(userFiles\)[\s\S]*where\(where\)[\s\S]*orderBy\(\.\.\.buildUserFileListOrderBy\(\)\)/,
    'File list API should use a reusable owner-scoped where clause.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const summaryItems = await db[\s\S]*select\(\{[\s\S]*contentType: userFiles\.contentType,[\s\S]*filename: userFiles\.filename,[\s\S]*isPublic: userFiles\.isPublic,[\s\S]*originalName: userFiles\.originalName,[\s\S]*size: userFiles\.size,[\s\S]*\}\)[\s\S]*where\(where\)[\s\S]*summary: buildUserFileMaterialSummary\(summaryItems\)/,
    'File list API should summarize all owner rows, not only visible items.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /listUserFileMaterials[\s\S]*select\(\{[\s\S]*contentType: userFiles\.contentType,[\s\S]*filename: userFiles\.filename,[\s\S]*id: userFiles\.id,[\s\S]*originalName: userFiles\.originalName,[\s\S]*size: userFiles\.size,[\s\S]*\}\)[\s\S]*where\(where\)/,
    'Material list API should select only safe picker fields.'
  );
  assert.doesNotMatch(
    USER_FILES_API_SOURCE,
    /listUserFileMaterials[\s\S]*r2Key: userFiles\.r2Key|listUserFileMaterials[\s\S]*isPublic: userFiles\.isPublic|listUserFileMaterials[\s\S]*description: userFiles\.description/,
    'Material list API should not expose storage keys, access flags, or notes.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const where = buildUserFileDetailOwnerWhere\(\{[\s\S]*fileId: data\.id,[\s\S]*userId,[\s\S]*\}\);[\s\S]*await deleteFile\(row\.r2Key\);[\s\S]*await db\.delete\(userFiles\)\.where\(where\);/,
    'Delete API should delete storage and DB rows through owner scope.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const publicFolder = isPublicFolder\(data\.folder\);[\s\S]*userId: publicFolder \? undefined : \(userId \?\? undefined\)[\s\S]*if \(!publicFolder && userId && result\.metadata\) \{[\s\S]*userId,[\s\S]*r2Key: result\.metadata\.r2Key/,
    'Upload API should only persist metadata for owner-scoped files.'
  );
});

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

test('settings files source material focused gate is documented', () => {
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

  assert.match(
    catalogSource,
    /pnpm exec tsx --test scripts\/settings-files-source-material-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point settings files source-material work at the focused script gate.'
  );
  for (const boundary of [
    'source-material library',
    'activity attachments',
    'AI draft provenance',
    'student payload privacy',
    'full-library summaries',
    'owner-scoped user files',
    'storage-key guard',
    'settings-files source-material privacy-scope boundaries',
    'settings-files-source-material handoff',
  ]) {
    assert.match(
      catalogSource,
      new RegExp(boundary.replace(/[ /.-]+/g, '[\\s/.-]+')),
      `E2E catalog should mention source-material boundary: ${boundary}`
    );
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
