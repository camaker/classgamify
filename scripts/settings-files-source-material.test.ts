import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const FILES_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/files.tsx',
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
const USER_FILES_HOOK_SOURCE = readFileSync(
  'src/hooks/use-user-files.ts',
  'utf8'
);
const USER_FILES_API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');

test('settings files route puts the material boundary before the file table', () => {
  assert.match(
    FILES_ROUTE_SOURCE,
    /beforeLoad:[\s\S]*isSettingsFilesEnabled\(\)[\s\S]*throw notFound\(\{ routeId: rootRouteId \}\)/,
    'Files settings route should centralize the storage feature gate.'
  );
  assert.match(
    FILES_ROUTE_SOURCE,
    /const pageView = buildSettingsFilesPageViewModel\(\);[\s\S]*FilesPageContent/,
    'Files settings route should render the file library directly.'
  );
  assert.doesNotMatch(
    FILES_ROUTE_SOURCE,
    /m\.settings_files_|m\.common_settings|websiteConfig\.storage/,
    'Files route should not rebuild files copy or storage visibility inline.'
  );
});

test('settings files table wires full-library summaries and classification views', () => {
  assert.match(
    FILES_TABLE_SOURCE,
    /const materialSummary = useMemo\([\s\S]*summary \?\? buildUserFileMaterialSummary\(data\)/,
    'Files table should prefer API full-library summaries over visible rows.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /buildUserFileMaterialClassificationView\(\{[\s\S]*contentType: file\.contentType,[\s\S]*filename: file\.filename,[\s\S]*originalName: file\.originalName/,
    'Material cells should use the storage-domain classification view.'
  );
  assert.match(
    FILES_TABLE_SOURCE,
    /const url = buildUserFileIdAccessPath\(row\.original\.id\);[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/,
    'Teacher table open links should stay explicit and browser-safe.'
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
  const materialListApiSource = USER_FILES_API_SOURCE.slice(
    USER_FILES_API_SOURCE.indexOf('export const listUserFileMaterials'),
    USER_FILES_API_SOURCE.indexOf('const deleteSchema')
  );
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
    /const where = buildUserFileOwnerWhere\(\{ userId \}\);[\s\S]*select\(buildUserFileClientSelect\(\)\)[\s\S]*from\(userFiles\)[\s\S]*where\(where\)[\s\S]*orderBy\(\.\.\.buildUserFileListOrderBy\(\)\)/,
    'File list API should use a reusable owner-scoped where clause.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const \[totalRows, items, summaryItems\] = await Promise\.all\(\[[\s\S]*select\(\{[\s\S]*contentType: userFiles\.contentType,[\s\S]*filename: userFiles\.filename,[\s\S]*isPublic: userFiles\.isPublic,[\s\S]*originalName: userFiles\.originalName,[\s\S]*size: userFiles\.size,[\s\S]*\}\)[\s\S]*where\(where\),[\s\S]*\]\);[\s\S]*summary: buildUserFileMaterialSummary\(summaryItems\)/,
    'File list API should summarize all owner rows, not only visible items.'
  );
  assert.match(
    materialListApiSource,
    /select\(\{[\s\S]*contentType: userFiles\.contentType,[\s\S]*filename: userFiles\.filename,[\s\S]*id: userFiles\.id,[\s\S]*originalName: userFiles\.originalName,[\s\S]*size: userFiles\.size,[\s\S]*\}\)[\s\S]*where\(where\)/,
    'Material list API should select only safe picker fields.'
  );
  assert.doesNotMatch(
    materialListApiSource,
    /r2Key: userFiles\.r2Key|isPublic: userFiles\.isPublic|description: userFiles\.description/,
    'Material list API should not expose storage keys, access flags, or notes.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const where = buildUserFileDetailOwnerWhere\(\{[\s\S]*fileId: data\.id,[\s\S]*userId,[\s\S]*\}\);[\s\S]*\.delete\(userFiles\)[\s\S]*\.where\(where\)[\s\S]*await deleteFile\(deletedRow\.r2Key\)/,
    'Delete API should claim owner-scoped metadata before deleting storage.'
  );
  assert.match(
    USER_FILES_API_SOURCE,
    /const publicFolder = isPublicFolder\(data\.folder\);[\s\S]*userId: publicFolder \? undefined : \(userId \?\? undefined\)[\s\S]*if \(!publicFolder\) \{[\s\S]*const metadata = result\.metadata[\s\S]*userId,[\s\S]*r2Key: metadata\.r2Key/,
    'Upload API should only persist required metadata for owner-scoped files.'
  );
});
