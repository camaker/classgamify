import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  STORAGE_UPLOAD_READINESS_ITEM_IDS,
  buildStorageUploadObjectPlan,
  buildStorageUploadProxyUrl,
  buildStorageUploadReadinessPlan,
  normalizeStorageAllowedExtensions,
  sanitizeStorageFilename,
  validateStorageAllowedExtension,
  validateStorageContentType,
  validateStorageUploadFile,
  validateStorageUploadSize,
} from '@/storage/upload-readiness';
import { STORAGE_ERROR_CODES } from '@/storage/types';

const R2_PROVIDER_SOURCE = readFileSync('src/storage/provider/r2.ts', 'utf8');

test('storage upload readiness plans owner-scoped classroom materials safely', () => {
  const plan = buildStorageUploadReadinessPlan({
    contentType: 'Audio/MPEG; charset=binary',
    file: blob(512, 'audio/mpeg'),
    filename: 'C:/teacher/private/Listening Prompt.MP3',
    requestOrigin: 'https://classgamify.example',
    userId: 'teacher-1',
  });

  assert.deepEqual(plan.itemIds, [...STORAGE_UPLOAD_READINESS_ITEM_IDS]);
  assert.equal(new Set(plan.itemIds).size, 20);
  assert.deepEqual(plan.privacy, {
    exposesFileBytes: false,
    exposesOriginalFilename: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialStorageKeysToStudents: false,
    itemIds: [...STORAGE_UPLOAD_READINESS_ITEM_IDS],
    publicPayloadIncludesFileList: false,
    readsFileBytesForClassification: false,
    tracksOwnerScopedUserFiles: true,
  });
  assert.deepEqual(plan.allowedExtensions, []);
  assert.deepEqual(plan.validation, { data: true, success: true });
  assert.equal(plan.classification.kind, 'audio');
  assert.equal(plan.classification.basis, 'content-type');
  assert.equal(plan.contentType, 'audio/mpeg');
  assert.equal(plan.extension, 'mp3');
  assert.equal(plan.filenamePreview, 'Listening_Prompt.MP3');
  assert.equal(plan.metadataPersistence, 'tracked-user-file');
  assert.equal(plan.objectPlan.isPublicFolder, false);
  assert.equal(
    plan.objectPlan.r2Key,
    'userfiles/teacher-1/pending-file-id-Listening_Prompt.MP3'
  );
  assert.equal(
    plan.objectPlan.url,
    'https://classgamify.example/api/storage/file?key=userfiles%2Fteacher-1%2Fpending-file-id-Listening_Prompt.MP3'
  );
});

test('storage upload validation catches size, extension, mime mismatch, and dangerous mime', () => {
  assert.deepEqual(
    validateStorageUploadSize(blob(1024 * 1024 + 1), 1024 * 1024),
    {
      code: STORAGE_ERROR_CODES.FILE_TOO_LARGE,
      details: { maxMegabytes: 1 },
      success: false,
    }
  );
  assert.deepEqual(
    validateStorageAllowedExtension({
      allowedTypes: ['.pdf', 'mp3'],
      filename: 'worksheet.exe',
    }),
    {
      code: STORAGE_ERROR_CODES.INVALID_FILE_TYPE,
      details: { supportedExtensions: '.pdf, .mp3' },
      success: false,
    }
  );
  assert.deepEqual(
    validateStorageContentType({
      contentType: 'text/csv',
      filename: 'worksheet.pdf',
    }),
    {
      code: STORAGE_ERROR_CODES.CONTENT_TYPE_MISMATCH,
      details: { contentType: 'text/csv', extension: 'pdf' },
      success: false,
    }
  );
  assert.deepEqual(
    validateStorageContentType({
      contentType: 'text/html; charset=utf-8',
      filename: 'worksheet.txt',
    }),
    {
      code: STORAGE_ERROR_CODES.DANGEROUS_CONTENT_TYPE,
      details: { contentType: 'text/html' },
      success: false,
    }
  );
  assert.deepEqual(
    validateStorageUploadFile({
      allowedTypes: ['pdf'],
      contentType: 'application/pdf',
      file: blob(128, 'application/pdf'),
      filename: 'worksheet.pdf',
      maxFileSize: 1024,
    }),
    { data: true, success: true }
  );
});

test('storage upload object plans separate owner and public folder persistence', () => {
  const ownerPlan = buildStorageUploadObjectPlan({
    fileId: 'file-id',
    filename: '..\\private\\worksheet pack.pdf',
    folder: 'classroom uploads/../worksheets',
    requestOrigin: 'https://classgamify.example',
    userFilesFolder: 'class files',
    userId: 'teacher-2',
  });

  assert.deepEqual(ownerPlan, {
    isPublicFolder: false,
    r2Key: 'classroom-uploads/worksheets/teacher-2/file-id-worksheet_pack.pdf',
    sanitizedFolder: 'classroom-uploads/worksheets',
    storedFilename: 'file-id-worksheet_pack.pdf',
    url: 'https://classgamify.example/api/storage/file?key=classroom-uploads%2Fworksheets%2Fteacher-2%2Ffile-id-worksheet_pack.pdf',
  });

  const publicPlan = buildStorageUploadObjectPlan({
    fileId: 'avatar-id',
    filename: 'team logo.png',
    folder: 'avatars/../school photos',
    userId: 'teacher-ignored',
  });

  assert.deepEqual(publicPlan, {
    isPublicFolder: true,
    r2Key: 'avatars/school-photos/avatar-id-team_logo.png',
    sanitizedFolder: 'avatars/school-photos',
    storedFilename: 'avatar-id-team_logo.png',
    url: 'avatars/school-photos/avatar-id-team_logo.png',
  });

  const defaultFolderPlan = buildStorageUploadObjectPlan({
    fileId: 'default-id',
    filename: 'grades.csv',
    userFilesFolder: 'class files',
    userId: 'teacher-3',
  });

  assert.equal(
    defaultFolderPlan.r2Key,
    'class-files/teacher-3/default-id-grades.csv'
  );
});

test('storage upload helpers normalize filename and extension contracts', () => {
  assert.equal(
    sanitizeStorageFilename('C:\\teacher\\private\\练习 1.pdf'),
    '___1.pdf'
  );
  assert.equal(sanitizeStorageFilename(''), 'file');
  assert.deepEqual(normalizeStorageAllowedExtensions([' .PDF ', 'MP3', '']), [
    'pdf',
    'mp3',
  ]);
  assert.equal(
    buildStorageUploadProxyUrl(
      'userfiles/teacher-1/worksheet.pdf',
      'https://classgamify.example'
    ),
    'https://classgamify.example/api/storage/file?key=userfiles%2Fteacher-1%2Fworksheet.pdf'
  );
  assert.equal(
    buildStorageUploadProxyUrl('userfiles/teacher-1/worksheet.pdf'),
    'userfiles/teacher-1/worksheet.pdf'
  );
});

test('r2 provider consumes shared upload readiness helpers', () => {
  assert.match(
    R2_PROVIDER_SOURCE,
    /validateStorageUploadFile\(\{[\s\S]*allowedTypes,[\s\S]*contentType,[\s\S]*file,[\s\S]*filename: originalName,[\s\S]*maxFileSize/
  );
  assert.match(
    R2_PROVIDER_SOURCE,
    /buildStorageUploadObjectPlan\(\{[\s\S]*fileId,[\s\S]*filename,[\s\S]*folder,[\s\S]*requestOrigin,[\s\S]*userFilesFolder: this\.userFilesFolder,[\s\S]*userId/
  );
  assert.match(
    R2_PROVIDER_SOURCE,
    /buildStorageUploadProxyUrl\(key,\s*requestOrigin\)/
  );
  assert.doesNotMatch(
    R2_PROVIDER_SOURCE,
    /MIME_TO_EXTENSIONS|DANGEROUS_CONTENT_TYPE|sanitizeFilename\(/
  );
  assert.doesNotMatch(
    R2_PROVIDER_SOURCE,
    /\/api\/storage\/file\?key=\$\{encodeURIComponent\(key\)\}/
  );
});

function blob(size: number, type = 'application/octet-stream') {
  return new Blob([new Uint8Array(size)], { type });
}
