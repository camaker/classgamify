import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS,
  buildActivityAiFallbackHandoffView,
  type ActivityAiFallbackHandoffItemId,
  type ActivityAiFallbackHandoffView,
  type ActivityAiFallbackTemplateRuntimeEvidence,
} from '@/activities/ai-draft-fallback-handoff';
import {
  ACTIVITY_AI_DRAFT_DEFAULT_FOCUS,
  type ActivityAiDraftFocus,
} from '@/activities/ai-draft-focus';
import {
  buildFallbackActivityDraftTerms,
  canApplyActivityDraftResultToEditor,
  createFallbackActivityDraft,
  createFallbackActivityDraftResult,
  extractActivityDraftSourceTerms,
  type GenerateActivityDraftInput,
} from '@/activities/ai-draft';
import {
  hasActivitySourceMaterialDraftNotes,
  removeActivitySourceMaterialDraftNotes,
} from '@/activities/draft-source';
import { getRuntimeItems } from '@/activities/runtime';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { buildActivityContent } from '@/activities/validation';
import type { Locale } from '@/locale/paraglide/runtime';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_ANSWER_SHOULD_NOT_LEAK';
const SECRET_FILE_ID = 'SECRET_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_NOTE = 'SECRET_TEACHER_NOTE_SHOULD_NOT_LEAK';
const SECRET_OPTION = 'SECRET_OPTION_SHOULD_NOT_LEAK';
const SECRET_PROMPT = 'SECRET_PROMPT_SHOULD_NOT_LEAK';
const SECRET_SOURCE = 'SECRET_SOURCE_TEXT_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/SECRET_STORAGE_KEY.pdf';

const englishInput: GenerateActivityDraftInput = {
  difficulty: 'core',
  draftFocus: 'balanced',
  gradeBand: 'Grade 4',
  itemCount: 4,
  language: 'en',
  sourceText: [
    'weather, rain, storm, climate, forecast',
    SECRET_SOURCE,
    '',
    'Attached classroom source materials:',
    '- Worksheet document: Weather worksheet.pdf',
    `- storageKey: ${SECRET_STORAGE_KEY}`,
  ].join('\n'),
  subject: 'Science',
  templateType: 'quiz',
};

test('AI fallback handoff exposes 30 deterministic draft slices', () => {
  const result = createFallbackActivityDraftResult({
    input: englishInput,
    model: 'local-fallback-model',
    notice:
      'Workers AI credentials are not configured, so a local deterministic draft was used.',
  });
  const handoffView = buildActivityAiFallbackHandoffView({
    result,
    sourceMaterialNotesOmitted: hasActivitySourceMaterialDraftNotes(
      englishInput.sourceText
    ),
    sourceTermCount: buildFallbackActivityDraftTerms({
      input: englishInput,
      locale: 'en',
    }).length,
    targetItemCount: englishInput.itemCount,
    templateRuntimeCounts: buildTemplateRuntimeEvidence({
      baseInput: englishInput,
      locale: 'en',
    }),
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    appliesBeforeActivitySave: true,
    exposesAnswerText: false,
    exposesDraftSourceText: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesRawSourceMaterialNotes: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    requiresTeacherReview: true,
    scope: 'deterministic-ai-draft-fallback',
    usesCreateActivityInputContract: true,
    usesRuntimeItems: true,
  });

  assert.equal(canApplyActivityDraftResultToEditor(result), true);
  assert.equal(getHandoffValue(handoffView, 'fallback-provider'), 'Fallback');
  assert.equal(
    getHandoffValue(handoffView, 'fallback-model'),
    'local-fallback-model'
  );
  assert.match(getHandoffValue(handoffView, 'generation-notice'), /Workers AI/);
  assert.equal(
    getHandoffValue(handoffView, 'review-state'),
    'Teacher review required'
  );
  assert.equal(
    getHandoffValue(handoffView, 'editor-application'),
    'Editor review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'persistence-boundary'),
    'Not persisted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'save-boundary'),
    'Teacher saves first'
  );
  assert.equal(
    getHandoffValue(handoffView, 'publish-boundary'),
    'Save before publish'
  );
  assert.equal(getHandoffValue(handoffView, 'template-preserved'), 'Quiz');
  assert.equal(
    getHandoffValue(handoffView, 'draft-focus'),
    'Balanced activity'
  );
  assert.equal(getHandoffValue(handoffView, 'target-item-count'), '4 items');
  assert.equal(getHandoffValue(handoffView, 'runtime-item-count'), '4 items');
  assert.equal(getHandoffValue(handoffView, 'question-count'), '4 questions');
  assert.equal(getHandoffValue(handoffView, 'pair-count'), '4 pairs');
  assert.equal(getHandoffValue(handoffView, 'group-count'), '2 groups');
  assert.equal(
    getHandoffValue(handoffView, 'vocabulary-count'),
    '4 vocabulary terms'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-note-count'),
    '3 teacher notes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'explanation-count'),
    '4 explanations'
  );
  assert.equal(
    getHandoffValue(handoffView, 'quiz-choice-readiness'),
    '4/4 questions ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'ready-template-count'),
    '8 templates'
  );
  assert.equal(
    getHandoffValue(handoffView, 'suggested-template-count'),
    '7 templates'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-checklist-count'),
    '4 checklist items'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-term-count'),
    '4 source terms'
  );
  assert.equal(getHandoffValue(handoffView, 'source-summary'), 'Present');
  assert.equal(
    getHandoffValue(handoffView, 'source-material-note-boundary'),
    'Material notes omitted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'multi-template-runtime'),
    '8/8 templates'
  );
  assert.equal(getHandoffValue(handoffView, 'listening-runtime'), '4 tracks');
  assert.equal(getHandoffValue(handoffView, 'group-sort-runtime'), '4 items');
  assert.equal(getHandoffValue(handoffView, 'open-box-runtime'), '4 prompts');
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Draft text hidden'
  );

  assertNoPrivateFallbackText(JSON.stringify(handoffView));
});

test('AI fallback handoff proves material notes do not become source terms', () => {
  const sourceTerms = extractActivityDraftSourceTerms({
    sourceText: removeActivitySourceMaterialDraftNotes(englishInput.sourceText),
    subject: englishInput.subject,
  });

  assert.equal(
    sourceTerms.some((term) => term.includes('Weather worksheet')),
    false
  );
  assert.equal(
    sourceTerms.some((term) => term.includes('storageKey')),
    false
  );
});

test('AI fallback handoff keeps empty material-note boundary explicit', () => {
  const input: GenerateActivityDraftInput = {
    ...englishInput,
    sourceText: 'weather, rain, storm, climate',
  };
  const handoffView = buildActivityAiFallbackHandoffView({
    result: createFallbackActivityDraftResult({
      input,
      model: 'local-fallback-model',
      notice: 'Local fallback used for test coverage.',
    }),
    sourceMaterialNotesOmitted: hasActivitySourceMaterialDraftNotes(
      input.sourceText
    ),
    sourceTermCount: buildFallbackActivityDraftTerms({
      input,
      locale: 'en',
    }).length,
    targetItemCount: input.itemCount,
    templateRuntimeCounts: buildTemplateRuntimeEvidence({
      baseInput: input,
      locale: 'en',
    }),
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => itemView.id),
    [...ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-note-boundary'),
    'No material notes'
  );
  assertNoPrivateFallbackText(JSON.stringify(handoffView));
});

test('AI fallback handoff localizes Chinese fallback boundaries', () => {
  overwriteGetLocale(() => 'zh');

  const input: GenerateActivityDraftInput = {
    difficulty: 'starter',
    draftFocus: ACTIVITY_AI_DRAFT_DEFAULT_FOCUS,
    gradeBand: '三年级',
    itemCount: 3,
    language: 'zh-CN',
    sourceText: '苹果，香蕉，水果，分类',
    subject: '语文',
    templateType: 'group-sort',
  };
  const handoffView = buildActivityAiFallbackHandoffView({
    result: createFallbackActivityDraftResult({
      input,
      model: 'local-fallback-model',
      notice: '本地确定性草稿用于测试。',
    }),
    sourceMaterialNotesOmitted: hasActivitySourceMaterialDraftNotes(
      input.sourceText
    ),
    sourceTermCount: buildFallbackActivityDraftTerms({
      input,
      locale: 'zh',
    }).length,
    targetItemCount: input.itemCount,
    templateRuntimeCounts: buildTemplateRuntimeEvidence({
      baseInput: input,
      locale: 'zh',
    }),
  });

  assert.equal(handoffView.title, 'AI 兜底草稿交接');
  assert.match(handoffView.description, /30 个切片/);
  assert.equal(getHandoffValue(handoffView, 'fallback-provider'), '本地兜底');
  assert.equal(getHandoffValue(handoffView, 'review-state'), '必须由老师检查');
  assert.equal(getHandoffValue(handoffView, 'template-preserved'), '分类');
  assert.equal(getHandoffValue(handoffView, 'target-item-count'), '3 个项目');
  assert.equal(getHandoffValue(handoffView, 'runtime-item-count'), '3 个项目');
  assert.equal(
    getHandoffValue(handoffView, 'source-material-note-boundary'),
    '无来源素材备注'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '草稿文本已隐藏');

  overwriteGetLocale(() => 'en');
});

function buildTemplateRuntimeEvidence({
  baseInput,
  locale,
}: {
  baseInput: GenerateActivityDraftInput;
  locale: Locale;
}): ActivityAiFallbackTemplateRuntimeEvidence[] {
  return ACTIVITY_TEMPLATE_TYPES.map((templateType) => {
    const activity = createFallbackActivityDraft({
      ...baseInput,
      draftFocus: baseInput.draftFocus as ActivityAiDraftFocus,
      templateType,
    });
    const content = buildActivityContent(activity);

    return {
      runtimeItemCount: getRuntimeItems(templateType, content).length,
      templateType,
    };
  }).filter((item) => {
    // Keep the locale argument observable in this pure helper call site.
    assert.ok(locale === 'en' || locale === 'zh');
    return item.runtimeItemCount >= 0;
  });
}

function getHandoffValue(
  view: ActivityAiFallbackHandoffView,
  id: ActivityAiFallbackHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing AI fallback handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateFallbackText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_FILE_ID,
    SECRET_NOTE,
    SECRET_OPTION,
    SECRET_PROMPT,
    SECRET_SOURCE,
    SECRET_STORAGE_KEY,
    'Weather worksheet.pdf',
    'storageKey',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI fallback handoff leaked private draft text: ${privateValue}`
    );
  }
}
