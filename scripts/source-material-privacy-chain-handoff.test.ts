import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS,
  SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES,
  buildSourceMaterialPrivacyChainHandoffView,
  type SourceMaterialPrivacyChainHandoffItemId,
  type SourceMaterialPrivacyChainHandoffView,
} from '@/activities/source-material-privacy-chain';
import { ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS } from '@/activities/ai-draft-boundary';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS } from '@/activities/material-summary';
import {
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_REFERENCE_PRIVACY_CONTRACT,
} from '@/activities/material-references';
import { PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/public';
import { STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS } from '@/assignments/student-runtime-item-list';
import { PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/unavailable-access';
import { SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS } from '@/settings/files-view';
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
const SETTINGS_FILES_SOURCE = readFileSync(
  'src/settings/files-view.ts',
  'utf8'
);
const STORAGE_UPLOAD_SOURCE = readFileSync(
  'src/storage/upload-readiness.ts',
  'utf8'
);
const STORAGE_FILE_ACCESS_SOURCE = readFileSync(
  'src/storage/file-access.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_FILE_BYTES = 'SECRET_PRIVATE_FILE_BYTES';
const PRIVATE_FILE_ID = 'private-source-file-id';
const PRIVATE_ORIGINAL_NAME = 'private-worksheet-answer-key.pdf';
const PRIVATE_PERMISSION = 'owner-only-permission';
const PRIVATE_STORAGE_KEY = 'userfiles/teacher/private/source.pdf';
const PRIVATE_TEACHER_LIST = 'SECRET_TEACHER_FILE_LIST';

test('source-material privacy chain exposes 30 cross-module slices', () => {
  const handoffView = buildSourceMaterialPrivacyChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'Source material privacy chain');
  assert.match(handoffView.description, /Thirty-slice/);
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
    allowsSafeFilenameBasenamesInTeacherAiNotes: true,
    chainSourceFileCount: SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES.length,
    exposesFileBytesToAi: false,
    exposesPermissionMetadataToActivityContent: false,
    exposesRawSourceMaterialListToStudents: false,
    exposesStorageKeysToActivityContent: false,
    exposesStorageKeysToStudents: false,
    itemIds,
    keepsReferencesCompact: true,
    publicPayloadIncludesSourceMaterials: false,
    requiresTeacherReviewBeforeExtractionPersistence: true,
    sourceFiles: [...SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES],
  });

  assertNoPrivateSourceMaterialChainText(JSON.stringify(handoffView));
});

test('source-material privacy chain summarizes every linked product slice', () => {
  const handoffView = buildSourceMaterialPrivacyChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['storage-upload-validation', '20 upload slices'],
      ['storage-owner-metadata', 'Owner-scoped userFiles'],
      ['storage-key-planning', 'Server-side R2 key'],
      ['same-origin-access-proxy', '30 access slices'],
      ['private-owner-access', 'Owner required'],
      ['file-byte-stream-boundary', 'Stream only from storage'],
      ['filename-disposition-boundary', 'Attachment header only'],
      ['material-classification', 'Kind from metadata'],
      ['activity-reference-shape', 'Compact reference'],
      ['reference-file-id-safety', 'Unsafe ids rejected'],
      ['reference-filename-safety', 'Safe basename'],
      ['reference-duplicate-collapse', 'First 12 safe references'],
      ['activity-validation-normalization', 'CreateActivityInput normalized'],
      ['settings-library-summary', 'Full owner library'],
      ['settings-material-handoff', '30 library slices'],
      ['picker-owner-scope', 'Current teacher files'],
      ['picker-attachment-limit', 'Up to 12 files'],
      ['picker-reference-write', 'ActivityContent.sourceMaterials'],
      ['draft-source-safe-notes', 'Safe material provenance'],
      ['draft-source-omitted-notes', 'Unsafe notes omitted'],
      ['ai-draft-source-sanitization', 'Sanitized source'],
      ['ai-draft-file-byte-guard', 'Bytes omitted'],
      ['ai-draft-storage-key-guard', 'Storage hidden'],
      ['extraction-readiness', 'Future extraction paths'],
      ['extraction-editor-review', 'Teacher review required'],
      ['extraction-parallel-model-guard', 'No parallel worksheet model'],
      ['public-assignment-source-guard', 'Teacher materials hidden'],
      ['student-runtime-source-guard', 'Source metadata hidden'],
      ['unavailable-link-content-guard', 'Runtime hidden'],
      ['privacy-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-assignment-source-guard'),
    'Teacher materials hidden'
  );
});

test('source-material privacy chain ties together existing focused contracts', () => {
  assert.equal(SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of SOURCE_MATERIAL_PRIVACY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(filePath), `Missing source-material file ${filePath}`);
  }

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
  assert.deepEqual(
    [
      SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.length,
    ],
    [30, 30, 30, 30, 30, 30, 30]
  );
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
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /exposesTeacherSourceMaterials: false/
  );
  assert.match(STUDENT_RUNTIME_SOURCE, /exposesSourceMaterialMetadata: false/);
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
    SETTINGS_FILES_SOURCE,
    /publicPayloadIncludesFileList: false[\s\S]*storageKeysStayServerSide: true/
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
  assert.match(
    TEST_CATALOG_SOURCE,
    /Source-material privacy chain has a fast script-level gate via[\s\S]*scripts\/source-material-privacy-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the source-material privacy chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /storage upload\/access[\s\S]*ActivityContent\.sourceMaterials[\s\S]*settings files[\s\S]*source-material picker[\s\S]*AI draft source notes[\s\S]*student runtime[\s\S]*source-material metadata guards/,
    'TEST-CATALOG should document the cross-module source-material privacy chain scope.'
  );
});

function getHandoffValue(
  view: SourceMaterialPrivacyChainHandoffView,
  id: SourceMaterialPrivacyChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing source-material privacy chain item ${id}`);
  return item.value;
}

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

function assertNoPrivateSourceMaterialChainText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_FILE_BYTES,
    PRIVATE_FILE_ID,
    PRIVATE_ORIGINAL_NAME,
    PRIVATE_PERMISSION,
    PRIVATE_STORAGE_KEY,
    PRIVATE_TEACHER_LIST,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Source-material privacy chain leaked private text: ${privateValue}`
    );
  }
}
