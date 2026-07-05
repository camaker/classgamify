import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFallbackActivityDraftResult,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import {
  buildActivityAiDraftBoundaryHandoffView,
  ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS,
  type ActivityAiDraftBoundaryHandoffItemId,
  type ActivityAiDraftBoundaryHandoffView,
} from '@/activities/ai-draft-boundary';
import {
  buildActivityEditorAiDraftPanelView,
  buildActivityEditorDraftSourceState,
} from '@/activities/editor';
import { WORKERS_AI_MODELS } from '@/config/ai-models';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_AI_DRAFT_ANSWER';
const SECRET_FILE_ID = 'SECRET_AI_DRAFT_FILE_ID';
const SECRET_PROMPT_TEXT = 'SECRET_AI_DRAFT_PROMPT';
const SECRET_RAW_PROVIDER_OUTPUT = 'SECRET_RAW_PROVIDER_OUTPUT';
const SECRET_SOURCE_TEXT = 'SECRET_SOURCE_TEXT';
const SECRET_STORAGE_KEY = 'classroom/private/SECRET_STORAGE_KEY.pdf';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE';
const SECRET_URL = 'https://example.test/private/worksheet.pdf?token=secret';

test('AI draft boundary handoff exposes 30 safe pre-generation slices', () => {
  const panelView = buildSourcePanelView({
    draftSourceText: [
      `${SECRET_SOURCE_TEXT} Weather lesson notes. ${SECRET_URL}`,
      'Attached classroom source materials:',
      '- Worksheet document: Weather worksheet.pdf',
      '- Audio: Weather listening.mp3',
      `- storageKey: ${SECRET_STORAGE_KEY}`,
    ].join('\n'),
    hasUser: true,
  });
  const handoffView = buildActivityAiDraftBoundaryHandoffView({
    draftFocus: 'worksheet-practice',
    draftItemCount: 8,
    panelView,
    templateType: 'group-sort',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS]);
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
    exposesActivityDraftText: false,
    exposesAnswerText: false,
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesRawProviderResponse: false,
    exposesSourceText: false,
    exposesStorageKeys: false,
    itemIds,
    persistsActivity: false,
    publishesAssignment: false,
    requiresTeacherReview: true,
  });

  assert.equal(getHandoffValue(handoffView, 'source-panel'), 'AI draft panel');
  assert.equal(getHandoffValue(handoffView, 'generation-gate'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'auth-boundary'),
    'Authenticated action'
  );
  assert.equal(
    getHandoffValue(handoffView, 'server-function'),
    'generateActivityDraft'
  );
  assert.equal(
    getHandoffValue(handoffView, 'input-schema'),
    'generateActivityDraftInputSchema'
  );
  assert.equal(getHandoffValue(handoffView, 'item-count'), '8 items');
  assert.equal(
    getHandoffValue(handoffView, 'draft-focus'),
    'Worksheet practice'
  );
  assert.equal(
    getHandoffValue(handoffView, 'template-preserved'),
    'Group sort'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-sanitization'),
    'Sanitized source'
  );
  assert.equal(
    getHandoffValue(handoffView, 'safe-material-provenance'),
    '2 safe sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'omitted-material-notes'),
    '1 omitted source'
  );
  assert.equal(
    getHandoffValue(handoffView, 'file-byte-guard'),
    'Bytes omitted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'storage-key-guard'),
    'Storage hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'provider-selection'),
    'Awaiting draft'
  );
  assert.equal(
    getHandoffValue(handoffView, 'model-selection'),
    WORKERS_AI_MODELS.activityDraft
  );
  assert.equal(
    getHandoffValue(handoffView, 'fallback-path'),
    'Fallback available'
  );
  assert.equal(
    getHandoffValue(handoffView, 'json-response-boundary'),
    'Schema enforced'
  );
  assert.equal(getHandoffValue(handoffView, 'local-completion'), 'No notice');
  assert.equal(
    getHandoffValue(handoffView, 'create-input-contract'),
    'CreateActivityInput'
  );
  assert.equal(
    getHandoffValue(handoffView, 'editor-review-gate'),
    'editor-review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'persistence-boundary'),
    'not-persisted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-review-required'),
    'Required'
  );
  assert.equal(getHandoffValue(handoffView, 'editor-application'), 'Pending');
  assert.equal(
    getHandoffValue(handoffView, 'save-boundary'),
    'Teacher saves later'
  );
  assert.equal(
    getHandoffValue(handoffView, 'publish-boundary'),
    'Publish later'
  );
  assert.equal(getHandoffValue(handoffView, 'coverage-summary'), 'Pending');
  assert.equal(getHandoffValue(handoffView, 'template-readiness'), 'Pending');
  assert.equal(
    getHandoffValue(handoffView, 'quiz-choice-readiness'),
    'Pending'
  );
  assert.equal(getHandoffValue(handoffView, 'notice-boundary'), 'No notice');
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateAiDraftBoundaryText(JSON.stringify(handoffView));
});

test('AI draft boundary handoff proves fallback drafts only fill the editor', () => {
  const draftResult = buildFallbackDraftResult();
  const handoffView = buildActivityAiDraftBoundaryHandoffView({
    draftFocus: draftResult.draftFocus,
    draftItemCount: 5,
    draftResult,
    panelView: buildSourcePanelView({
      draftSourceText: 'Weather, sunny, rainy, cloudy, windy',
      hasUser: true,
    }),
    templateType: draftResult.activity.templateType,
  });

  assert.equal(getHandoffValue(handoffView, 'generation-gate'), 'Ready');
  assert.equal(getHandoffValue(handoffView, 'provider-selection'), 'Fallback');
  assert.equal(getHandoffValue(handoffView, 'model-selection'), 'test-model');
  assert.equal(getHandoffValue(handoffView, 'fallback-path'), 'Fallback used');
  assert.equal(
    getHandoffValue(handoffView, 'json-response-boundary'),
    'Schema enforced'
  );
  assert.equal(
    getHandoffValue(handoffView, 'local-completion'),
    'Notice present'
  );
  assert.equal(getHandoffValue(handoffView, 'editor-application'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'persistence-boundary'),
    'not-persisted'
  );
  assert.match(
    getHandoffValue(handoffView, 'coverage-summary'),
    /Questions: 5; pairs: 5; groups: 2; vocab: 5; notes: 3/
  );
  assert.equal(
    getHandoffValue(handoffView, 'template-readiness'),
    '8 ready; 0 locked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'quiz-choice-readiness'),
    '5/5 ready (5 explicit, 0 local)'
  );
  assert.equal(
    getHandoffValue(handoffView, 'notice-boundary'),
    'Notice present'
  );

  assertNoPrivateAiDraftBoundaryText(JSON.stringify(handoffView));
});

test('AI draft boundary handoff localizes Chinese editor-review boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const panelView = buildSourcePanelView({
      draftSourceText: '天气，晴天，雨天，阴天',
      hasUser: true,
    });
    const handoffView = buildActivityAiDraftBoundaryHandoffView({
      draftFocus: 'balanced',
      draftItemCount: 3,
      panelView,
      templateType: 'fill-blank',
    });

    assert.equal(handoffView.title, 'AI 草稿边界交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(getHandoffValue(handoffView, 'generation-gate'), '就绪');
    assert.equal(getHandoffValue(handoffView, 'draft-focus'), '均衡活动');
    assert.equal(
      getHandoffValue(handoffView, 'template-preserved'),
      '完成句子'
    );
    assert.equal(getHandoffValue(handoffView, 'item-count'), '3 个项目');
    assert.equal(
      getHandoffValue(handoffView, 'source-sanitization'),
      '来源已净化'
    );
    assert.equal(getHandoffValue(handoffView, 'save-boundary'), '老师稍后保存');
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密数据'
    );

    assertNoPrivateAiDraftBoundaryText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function buildSourcePanelView({
  draftSourceText,
  hasUser,
}: {
  draftSourceText: string;
  hasUser: boolean;
}) {
  return buildActivityEditorAiDraftPanelView({
    draftSourceText,
    hasUser,
    isGeneratingDraft: false,
    sourceState: buildActivityEditorDraftSourceState({
      draftSourceText,
      sourceMaterials: [
        {
          fileId: `${SECRET_FILE_ID}-audio`,
          kind: 'audio',
          originalName: 'Weather listening.mp3',
        },
      ],
    }),
  });
}

function buildFallbackDraftResult(): ActivityDraftResult {
  return createFallbackActivityDraftResult({
    input: {
      difficulty: 'starter',
      draftFocus: 'listening-script',
      gradeBand: 'Grade 3',
      itemCount: 5,
      language: 'en',
      sourceText: 'Weather, sunny, rainy, cloudy, windy',
      subject: 'Science',
      templateType: 'listening',
    },
    model: 'test-model',
    notice: 'Fallback used for testing.',
  });
}

function getHandoffValue(
  view: ActivityAiDraftBoundaryHandoffView,
  id: ActivityAiDraftBoundaryHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing AI draft boundary handoff item ${id}`);
  return item.value;
}

function assertNoPrivateAiDraftBoundaryText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_FILE_ID,
    SECRET_PROMPT_TEXT,
    SECRET_RAW_PROVIDER_OUTPUT,
    SECRET_SOURCE_TEXT,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_NOTE,
    SECRET_URL,
    'Weather lesson notes',
    'Weather listening.mp3',
    'weather',
    'sunny',
    'rainy',
    'cloudy',
    'windy',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI draft boundary handoff leaked private text: ${privateValue}`
    );
  }
}
