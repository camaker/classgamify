import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT,
} from '@/activities/material-references';
import {
  STORAGE_FILE_ACCESS_ITEM_IDS,
  STORAGE_FILE_ACCESS_PRIVACY_CONTRACT,
} from '@/storage/file-access';
import {
  STORAGE_UPLOAD_READINESS_ITEM_IDS,
  buildStorageUploadReadinessPlan,
} from '@/storage/upload-readiness';

const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const STUDENT_RUNTIME_SOURCE = readFileSync(
  'src/assignments/student-runtime-item-list.ts',
  'utf8'
);
const DRAFT_SOURCE = readFileSync('src/activities/draft-source.ts', 'utf8');
const MATERIAL_REFERENCES_SOURCE = readFileSync(
  'src/activities/material-references.ts',
  'utf8'
);
const VALIDATION_SOURCE = readFileSync('src/activities/validation.ts', 'utf8');
const STORAGE_UPLOAD_SOURCE = readFileSync(
  'src/storage/upload-readiness.ts',
  'utf8'
);
const STORAGE_FILE_ACCESS_SOURCE = readFileSync(
  'src/storage/file-access.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('source-material privacy chain ties together existing focused contracts', () => {
  const uploadPlan = buildStorageUploadReadinessPlan({
    contentType: 'application/pdf',
    file: new Blob(['safe fixture bytes'], { type: 'application/pdf' }),
    filename: 'unit worksheet.pdf',
    userId: 'teacher-1',
  });

  assert.equal(STORAGE_UPLOAD_READINESS_ITEM_IDS.length, 20);
  assert.deepEqual(uploadPlan.privacy, {
    exposesFileBytes: false,
    exposesOriginalFilename: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialStorageKeysToStudents: false,
    itemIds: [...STORAGE_UPLOAD_READINESS_ITEM_IDS],
    publicPayloadIncludesFileList: false,
    readsFileBytesForClassification: false,
    tracksOwnerScopedUserFiles: true,
  });
  assert.equal(STORAGE_FILE_ACCESS_ITEM_IDS.length, 30);
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
  assert.equal(ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS.length, 30);
  assert.deepEqual(ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT, {
    exposesFileBytes: false,
    exposesPermissionMetadata: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentPayloadFileReferences: false,
    itemIds: [...ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS],
    keepsOnlyCompactReferenceShape: true,
    maxReferences: 12,
    normalizesSafeFilenameBasenames: true,
    rejectsUnsafeFileIds: true,
    scope: 'activity-source-material-reference-boundary',
  });
});

test('public, student-runtime, AI, and storage sources keep private material data out', () => {
  const publicAssignmentPayloadType = getSourceSlice(
    PUBLIC_ASSIGNMENT_SOURCE,
    'export type PublicAssignmentPayload = {',
    'export type PublicAssignmentUnavailableReason'
  );

  assert.doesNotMatch(
    publicAssignmentPayloadType,
    /\b(sourceMaterials|r2Key|storageKey|fileId|originalName|permission|bytes|fileList)\b/,
    'PublicAssignmentPayload should not expose teacher file lists, file ids, filenames, storage keys, permissions, or bytes.'
  );
  assert.doesNotMatch(
    STUDENT_RUNTIME_SOURCE,
    /\b(sourceMaterials|storageKey|fileId|originalName|permission|bytes|fileList)\b/,
    'Student runtime item lists should only read public runtime items.'
  );
  assert.match(
    DRAFT_SOURCE,
    /sanitizeActivityDraftSourceTextForAi[\s\S]*removeActivitySourceMaterialDraftNotes[\s\S]*buildActivitySourceMaterialDraftNoteViewsFromSourceText/
  );
  assert.match(
    DRAFT_SOURCE,
    /buildActivitySourceMaterialDraftNoteSafetySummary[\s\S]*omittedCount/
  );
  assert.match(
    DRAFT_SOURCE,
    /normalizeActivityMaterialReferenceFilename\(noteView\.name\)/
  );
  assert.match(
    MATERIAL_REFERENCES_SOURCE,
    /ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT[\s\S]*exposesFileBytes: false[\s\S]*exposesPermissionMetadata: false[\s\S]*exposesSourceMaterialStorageKeys: false/
  );
  assert.match(
    VALIDATION_SOURCE,
    /sourceMaterials:\s*normalizeActivityMaterialReferences\(input\.sourceMaterials\)/
  );
  assert.match(
    STORAGE_UPLOAD_SOURCE,
    /publicPayloadIncludesFileList: false[\s\S]*readsFileBytesForClassification: false/
  );
  assert.match(
    STORAGE_FILE_ACCESS_SOURCE,
    /exposesStorageKeysToStudentPayloads: false[\s\S]*returnsNoStoreForPrivateFiles: true/
  );
});

test('source-material privacy chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /source-material\s+privacy\s+gate[\s\S]*compact\s+material[\s\S]*30\s+items[\s\S]*safe\s+file\s+ids[\s\S]*12-reference\s+limit[\s\S]*must\s+not\s+expose\s+file\s+ids[\s\S]*storage keys[\s\S]*student payload file references/,
    'docs/product.md should describe the compact material-reference handoff and file privacy boundary.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Source-material privacy chain has a fast script-level gate via[\s\S]*scripts\/source-material-privacy-chain\.test\.ts/,
    'TEST-CATALOG should document the source-material privacy chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /storage upload\/access[\s\S]*ActivityContent\.sourceMaterials[\s\S]*30-item compact material reference boundary[\s\S]*settings files[\s\S]*source-material picker[\s\S]*AI draft source notes[\s\S]*student runtime[\s\S]*source-material metadata guards/,
    'TEST-CATALOG should document the cross-module source-material privacy chain scope.'
  );
});

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
