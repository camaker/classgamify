import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS,
  buildActivityEditorAiDraftPanelView,
  buildActivityEditorDraftSourceState,
} from '@/activities/editor';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_ID = 'SECRET_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/SECRET_STORAGE_KEY.pdf';
const SECRET_QUERY_TOKEN = 'secret_query_token_should_not_leak';
const SECRET_URL = `https://example.test/private?token=${SECRET_QUERY_TOKEN}`;

test('AI source panel exposes a complete safe handoff contract', () => {
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
  const handoffView = panelView.sourceHandoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS,
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
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesPathSegments: false,
    exposesPermissionMetadata: false,
    exposesQueryTokens: false,
    exposesStorageKeys: false,
    exposesUrls: false,
    itemIds: [...ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS],
  });

  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'safe-material-notes'),
    '3 safe sources'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'omitted-material-notes'),
    '1 omitted source'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'synced-material-provenance'),
    [
      'Worksheet document · Weather worksheet.pdf',
      'Audio · Listening track.mp3',
      'Spreadsheet · vocabulary.csv',
    ].join(', ')
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'capability-audio-extraction'),
    '1'
  );
  assert.equal(
    getHandoffItemValue(
      handoffView.itemViews,
      'capability-worksheet-extraction'
    ),
    '2'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'capability-spreadsheet-import'),
    '1'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'generate-action'),
    'Ready'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'source-sanitization'),
    'Sanitized source'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'auth-boundary'),
    'Authenticated action'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'input-schema'),
    'generateActivityDraftInputSchema'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'create-input-contract'),
    'CreateActivityInput'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'editor-application-boundary'),
    'editor-review'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'persistence-boundary'),
    'not-persisted'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'save-boundary'),
    'Teacher saves later'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'publish-boundary'),
    'Publish later'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'file-byte-guard'),
    'Bytes omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'storage-key-guard'),
    'Storage hidden'
  );

  const serializedHandoffView = JSON.stringify(handoffView);
  assertNoUnsafeSourceText(serializedHandoffView);
});

test('AI source handoff exposes zero-count extraction readiness', () => {
  const panelView = buildActivityEditorAiDraftPanelView({
    draftSourceText: 'Teacher topic notes.',
    hasUser: false,
    isGeneratingDraft: false,
    sourceState: buildActivityEditorDraftSourceState({
      draftSourceText: 'Teacher topic notes.',
      sourceMaterials: [],
    }),
  });

  assert.deepEqual(
    panelView.sourceHandoffView.itemViews
      .filter((item) => item.id.startsWith('capability-'))
      .map((item) => [item.id, item.value]),
    [
      ['capability-audio-extraction', '0'],
      ['capability-worksheet-extraction', '0'],
      ['capability-spreadsheet-import', '0'],
    ]
  );
  assert.equal(
    getHandoffItemValue(panelView.sourceHandoffView.itemViews, 'sync-action'),
    'Disabled'
  );
  assert.equal(
    getHandoffItemValue(
      panelView.sourceHandoffView.itemViews,
      'generation-gate'
    ),
    'Sign in to generate an AI draft.'
  );
});

function getHandoffItemValue(
  itemViews: Array<{ id: string; value: string }>,
  id: string
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected handoff item ${id}`);
  return item.value;
}

function assertNoUnsafeSourceText(value: string) {
  for (const unsafeValue of [
    SECRET_FILE_ID,
    SECRET_STORAGE_KEY,
    SECRET_QUERY_TOKEN,
    SECRET_URL,
    'storageKey',
  ]) {
    assert.equal(
      value.includes(unsafeValue),
      false,
      `Handoff view leaked unsafe source text: ${unsafeValue}`
    );
  }
}
