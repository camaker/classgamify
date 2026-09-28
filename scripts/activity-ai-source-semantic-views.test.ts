import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_EDITOR_AI_DRAFT_SOURCE_CONTROL_IDS,
  buildActivityEditorAiDraftPanelView,
  buildActivityEditorDraftSourceState,
} from '@/activities/editor';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_ID = 'SECRET_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/SECRET_STORAGE_KEY.pdf';
const SECRET_QUERY_TOKEN = 'secret_query_token_should_not_leak';
const SECRET_URL = `https://example.test/private?token=${SECRET_QUERY_TOKEN}`;

test('AI source panel wires control ids and readiness descriptions', () => {
  const draftSourceText = [
    `Weather lesson notes. ${SECRET_URL}`,
    'Attached classroom source materials:',
    '- Worksheet document: Weather worksheet.pdf',
    '- Audio: Listening track.mp3',
    '- Spreadsheet: vocabulary.csv',
    `- storageKey: ${SECRET_STORAGE_KEY}?token=${SECRET_QUERY_TOKEN}`,
  ].join('\n');
  const sourceMaterials = [
    {
      fileId: `${SECRET_FILE_ID}-audio`,
      kind: 'audio',
      originalName: 'Listening track.mp3',
    },
    {
      fileId: `${SECRET_FILE_ID}-worksheet-document`,
      kind: 'worksheet-document',
      originalName: 'Weather worksheet.pdf',
    },
    {
      fileId: `${SECRET_FILE_ID}-worksheet-image`,
      kind: 'worksheet-image',
      originalName: 'Weather worksheet.png',
    },
    {
      fileId: `${SECRET_FILE_ID}-spreadsheet`,
      kind: 'spreadsheet',
      originalName: 'vocabulary.csv',
    },
  ];

  const panelView = buildActivityEditorAiDraftPanelView({
    draftSourceText,
    hasUser: true,
    isGeneratingDraft: false,
    sourceState: buildActivityEditorDraftSourceState({
      draftSourceText,
      sourceMaterials,
    }),
  });
  assert.deepEqual(panelView.sourceControlBoundary, {
    attachedSourceMaterialCount: 4,
    canGenerateDraft: true,
    canSyncDraftSourceMaterials: true,
    controlIds: ACTIVITY_EDITOR_AI_DRAFT_SOURCE_CONTROL_IDS,
    describesGenerateActionWithReadiness: true,
    describesSourceTextareaWithReadiness: true,
    describesSourceTextareaWithSafeSource: true,
    describesSyncActionWithSafeMaterialHelp: true,
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesStorageKeys: false,
    generateActionUsesDisabledReason: false,
    generateButtonDescribedByIds: ['activity-ai-source-readiness-description'],
    hasCapabilityDescription: true,
    hasMaterialSafetyDescription: true,
    hasSyncedMaterialNoteDescription: true,
    omittedSourceMaterialNoteCount: 1,
    safeSourceMaterialNoteCount: 3,
    scope: 'activity-ai-draft-source-controls',
    sourceMaterialCapabilityCount: 3,
    sourceMaterialNoteInputCount: 4,
    sourceMaterialNoteViewCount: 3,
    sourceReadinessHasWarnings: true,
    sourceReadinessStatus: 'synced-materials',
    sourceTextMaxLength: 2000,
    syncButtonDescribedByIds: ['activity-ai-sync-materials-help'],
    textareaDescribedByIds: [
      'activity-ai-safe-source-description',
      'activity-ai-source-readiness-description',
      'activity-ai-source-material-safety-description',
      'activity-ai-source-capability-title',
      'activity-ai-source-material-notes-label',
    ],
    usesPreparedControlIds: true,
  });
});

test('AI source panel keeps zero-material readiness explicit', () => {
  const panelView = buildActivityEditorAiDraftPanelView({
    draftSourceText: 'Teacher topic notes.',
    hasUser: false,
    isGeneratingDraft: false,
    sourceState: buildActivityEditorDraftSourceState({
      draftSourceText: 'Teacher topic notes.',
      sourceMaterials: [],
    }),
  });
  assert.deepEqual(panelView.sourceControlBoundary, {
    attachedSourceMaterialCount: 0,
    canGenerateDraft: false,
    canSyncDraftSourceMaterials: false,
    controlIds: ACTIVITY_EDITOR_AI_DRAFT_SOURCE_CONTROL_IDS,
    describesGenerateActionWithReadiness: true,
    describesSourceTextareaWithReadiness: true,
    describesSourceTextareaWithSafeSource: true,
    describesSyncActionWithSafeMaterialHelp: true,
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesStorageKeys: false,
    generateActionUsesDisabledReason: true,
    generateButtonDescribedByIds: [
      'activity-ai-source-readiness-description',
      'activity-ai-generate-disabled-reason',
    ],
    hasCapabilityDescription: false,
    hasMaterialSafetyDescription: false,
    hasSyncedMaterialNoteDescription: false,
    omittedSourceMaterialNoteCount: 0,
    safeSourceMaterialNoteCount: 0,
    scope: 'activity-ai-draft-source-controls',
    sourceMaterialCapabilityCount: 0,
    sourceMaterialNoteInputCount: 0,
    sourceMaterialNoteViewCount: 0,
    sourceReadinessHasWarnings: false,
    sourceReadinessStatus: 'ready',
    sourceTextMaxLength: 2000,
    syncButtonDescribedByIds: ['activity-ai-sync-materials-help'],
    textareaDescribedByIds: [
      'activity-ai-safe-source-description',
      'activity-ai-source-readiness-description',
    ],
    usesPreparedControlIds: true,
  });
});
