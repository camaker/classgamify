import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  STORAGE_FILE_ACCESS_ITEM_IDS,
  STORAGE_FILE_ACCESS_PRIVACY_CONTRACT,
  buildStorageFileResponseHeaders,
  isStorageFileSafeInlineContentType,
  resolveStorageFileAccessDecision,
  validateStorageFileProxyKey,
  type StorageFileAccessRecord,
} from '@/storage/file-access';

const ROUTE_SOURCE = readFileSync('src/routes/api/storage/file.ts', 'utf8');
const DOCS_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_RECORD: StorageFileAccessRecord = {
  isPublic: false,
  originalName: 'C:/private/六月听力复习.mp3',
  userId: 'teacher-1',
};

const PUBLIC_RECORD: StorageFileAccessRecord = {
  isPublic: true,
  originalName: 'school-logo.png',
  userId: 'teacher-1',
};

test('storage file access boundary exposes 30 safe proxy slices', () => {
  assert.equal(STORAGE_FILE_ACCESS_ITEM_IDS.length, 30);
  assert.equal(new Set(STORAGE_FILE_ACCESS_ITEM_IDS).size, 30);
  assert.deepEqual(STORAGE_FILE_ACCESS_PRIVACY_CONTRACT, {
    exposesFileBytesInDecision: false,
    exposesOriginalFilenameOnlyInAttachmentHeader: true,
    exposesPermissionMetadata: false,
    exposesStorageKeysToStudentPayloads: false,
    itemIds: [...STORAGE_FILE_ACCESS_ITEM_IDS],
    permitsPublicSharedFoldersWithoutUserRecord: true,
    requiresOwnerForPrivateUserFiles: true,
    returnsNoStoreForPrivateFiles: true,
    returnsNosniffHeader: true,
    scope: 'same-origin-storage-file-access',
  });
});

test('storage file access validates same-origin proxy keys safely', () => {
  assert.deepEqual(validateStorageFileProxyKey(null), {
    reason: 'missing-key',
    success: false,
  });
  assert.deepEqual(validateStorageFileProxyKey(''), {
    reason: 'missing-key',
    success: false,
  });
  assert.deepEqual(validateStorageFileProxyKey('../private.pdf'), {
    reason: 'unsafe-key',
    success: false,
  });
  assert.deepEqual(validateStorageFileProxyKey('userfiles/../private.pdf'), {
    reason: 'unsafe-key',
    success: false,
  });
  assert.deepEqual(validateStorageFileProxyKey('userfiles\\teacher\\x.pdf'), {
    reason: 'unsafe-key',
    success: false,
  });
  assert.deepEqual(validateStorageFileProxyKey(' userfiles/teacher/x.pdf'), {
    reason: 'unsafe-key',
    success: false,
  });
  assert.deepEqual(
    validateStorageFileProxyKey('userfiles/teacher-1/unit..review.pdf'),
    {
      key: 'userfiles/teacher-1/unit..review.pdf',
      success: true,
    }
  );
});

test('storage file access resolves public and private ownership decisions', () => {
  assert.deepEqual(
    resolveStorageFileAccessDecision({
      fileRecord: null,
      key: 'userfiles/teacher-1/private.pdf',
    }),
    {
      allowed: false,
      reason: 'private-record-missing',
      status: 404,
    }
  );
  assert.deepEqual(
    resolveStorageFileAccessDecision({
      fileRecord: null,
      key: 'avatars/school-logo.png',
    }),
    {
      allowed: true,
      isPublicFile: true,
      isPublicFolder: true,
      key: 'avatars/school-logo.png',
      requiresOwner: false,
      status: 200,
    }
  );
  assert.deepEqual(
    resolveStorageFileAccessDecision({
      fileRecord: PRIVATE_RECORD,
      key: 'userfiles/teacher-1/private.mp3',
    }),
    {
      allowed: false,
      reason: 'user-ownership-required',
      status: 403,
    }
  );
  assert.deepEqual(
    resolveStorageFileAccessDecision({
      fileRecord: PRIVATE_RECORD,
      key: 'userfiles/teacher-1/private.mp3',
      requesterUserId: 'teacher-2',
    }),
    {
      allowed: false,
      reason: 'user-ownership-required',
      status: 403,
    }
  );
  assert.deepEqual(
    resolveStorageFileAccessDecision({
      fileRecord: PRIVATE_RECORD,
      key: 'userfiles/teacher-1/private.mp3',
      requesterUserId: 'teacher-1',
    }),
    {
      allowed: true,
      isPublicFile: false,
      isPublicFolder: false,
      key: 'userfiles/teacher-1/private.mp3',
      requiresOwner: true,
      status: 200,
    }
  );
  assert.deepEqual(
    resolveStorageFileAccessDecision({
      fileRecord: PUBLIC_RECORD,
      key: 'userfiles/teacher-1/public-logo.png',
    }),
    {
      allowed: true,
      isPublicFile: true,
      isPublicFolder: false,
      key: 'userfiles/teacher-1/public-logo.png',
      requiresOwner: false,
      status: 200,
    }
  );
});

test('storage file response headers keep inline, download, and cache rules explicit', () => {
  assert.equal(
    isStorageFileSafeInlineContentType('Image/PNG; charset=utf-8'),
    true
  );
  assert.equal(isStorageFileSafeInlineContentType('text/html'), false);

  assert.deepEqual(
    buildStorageFileResponseHeaders({
      contentType: 'Image/PNG; charset=utf-8',
      fileRecord: PUBLIC_RECORD,
      isPublicFile: true,
    }),
    {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
    }
  );

  const privateAudioHeaders = buildStorageFileResponseHeaders({
    contentType: 'audio/mpeg',
    fileRecord: PRIVATE_RECORD,
    isPublicFile: false,
  });
  assert.equal(privateAudioHeaders['Cache-Control'], 'private, no-store');
  assert.equal(privateAudioHeaders['Content-Type'], 'audio/mpeg');
  assert.equal(privateAudioHeaders['X-Content-Type-Options'], 'nosniff');
  assert.match(
    privateAudioHeaders['Content-Disposition'] ?? '',
    /^attachment; filename="classgamify-file\.mp3"; filename\*=UTF-8''/
  );
  assert.match(
    privateAudioHeaders['Content-Disposition'] ?? '',
    /%E5%85%AD%E6%9C%88%E5%90%AC%E5%8A%9B%E5%A4%8D%E4%B9%A0\.mp3/
  );
  assert.doesNotMatch(
    JSON.stringify(privateAudioHeaders),
    /C:\/private|userfiles\/teacher-1|permission|owner/i
  );

  assert.deepEqual(
    buildStorageFileResponseHeaders({
      contentType: 'text/html; charset=utf-8',
      isPublicFile: false,
    }),
    {
      'Cache-Control': 'private, no-store',
      'Content-Disposition':
        'attachment; filename="classgamify-file"; filename*=UTF-8\'\'classgamify-file',
      'Content-Type': 'text/html',
      'X-Content-Type-Options': 'nosniff',
    }
  );
});

test('storage file route delegates access and header policy to storage domain helpers', () => {
  assert.match(
    ROUTE_SOURCE,
    /const requestedKey = url\.searchParams\.get\('key'\)[\s\S]*validateStorageFileProxyKey\(key\)/
  );
  assert.match(
    ROUTE_SOURCE,
    /resolveStorageFileAccessDecision\(\{[\s\S]*fileRecord,[\s\S]*key: keyValidation\.key,[\s\S]*requesterUserId: userId/
  );
  assert.match(
    ROUTE_SOURCE,
    /buildStorageFileResponseHeaders\(\{[\s\S]*contentType: file\.contentType,[\s\S]*fileRecord,[\s\S]*isPublicFile: accessDecision\.isPublicFile/
  );
  assert.match(ROUTE_SOURCE, /originalName: userFiles\.originalName/);
  assert.doesNotMatch(ROUTE_SOURCE, /key\.includes\('..'\)/);
  assert.doesNotMatch(ROUTE_SOURCE, /safeInlineTypes\s*=\s*\[/);
  assert.doesNotMatch(
    ROUTE_SOURCE,
    /buildAttachmentContentDisposition\(fileRecord\?\.originalName\)/
  );
});

test('storage file access focused gate is documented', () => {
  assert.match(DOCS_SOURCE, /file-access\.ts/);
  assert.match(DOCS_SOURCE, /same-origin storage file access/);
  assert.match(
    TEST_CATALOG_SOURCE,
    /scripts\/storage-file-access-boundary\.test\.ts/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /same-origin file proxy access[\s\S]*owner checks[\s\S]*cache headers/
  );
});
