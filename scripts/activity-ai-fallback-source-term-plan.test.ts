import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS,
  buildFallbackActivityDraftSourceTermPlan,
  buildFallbackActivityDraftTerms,
  createFallbackActivityDraft,
  type ActivityAiFallbackSourceTermPlan,
  type ActivityAiFallbackSourceTermPlanItemId,
  type GenerateActivityDraftInput,
} from '@/activities/ai-draft';
import { buildActivityContent } from '@/activities/validation';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_ID = 'SECRET_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_SOURCE = 'SECRET_SOURCE_TEXT_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/SECRET_STORAGE_KEY.pdf';
const SECRET_WORKSHEET_NAME = 'Private worksheet answer key.pdf';

const sourceReadyInput: GenerateActivityDraftInput = {
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
    `- Worksheet document: ${SECRET_WORKSHEET_NAME}`,
    `- File id: ${SECRET_FILE_ID}`,
    `- storageKey: ${SECRET_STORAGE_KEY}`,
  ].join('\n'),
  subject: 'Science',
  templateType: 'quiz',
};

test('AI fallback source-term plan exposes 30 safe planning slices', () => {
  const plan = buildFallbackActivityDraftSourceTermPlan({
    input: sourceReadyInput,
    locale: 'en',
  });
  const itemIds = plan.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.deepEqual(plan.privacy, {
    excludesDraftSourceText: true,
    excludesRawSourceMaterialNotes: true,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    scope: 'deterministic-ai-fallback-source-terms',
  });
  assert.equal(plan.usedFallbackPadding, false);
  assert.equal(plan.sourceMaterialNotesDetected, true);
  assert.equal(plan.sourceMaterialNotesOmitted, true);
  assert.deepEqual(plan.terms, ['weather', 'rain', 'storm', 'climate']);
  assert.equal(
    getPlanValue(plan, 'source-term-scope'),
    'Deterministic fallback source terms'
  );
  assert.equal(
    getPlanValue(plan, 'input-schema'),
    'GenerateActivityDraftInput'
  );
  assert.equal(getPlanValue(plan, 'source-sanitization'), 'Sanitized');
  assert.equal(getPlanValue(plan, 'material-notes-detected'), 'Detected');
  assert.equal(getPlanValue(plan, 'material-notes-omitted'), 'Omitted');
  assert.equal(
    getPlanValue(plan, 'safe-material-note-boundary'),
    'Kind and basename only'
  );
  assert.equal(getPlanValue(plan, 'content-source'), 'Teacher source notes');
  assert.equal(getPlanValue(plan, 'phrase-extraction'), '6');
  assert.equal(getPlanValue(plan, 'word-extraction'), '5');
  assert.equal(getPlanValue(plan, 'subject-fallback'), 'Included');
  assert.equal(getPlanValue(plan, 'unique-normalization'), 'NFKC + whitespace');
  assert.equal(getPlanValue(plan, 'vocabulary-limit'), '16');
  assert.equal(getPlanValue(plan, 'item-target'), '4');
  assert.equal(getPlanValue(plan, 'minimum-source-terms'), '3');
  assert.equal(getPlanValue(plan, 'source-term-count'), '7');
  assert.equal(getPlanValue(plan, 'source-term-selection'), '4');
  assert.equal(getPlanValue(plan, 'fallback-padding'), 'Not needed');
  assert.equal(getPlanValue(plan, 'fallback-key-word'), 'Not needed');
  assert.equal(getPlanValue(plan, 'fallback-example'), 'Not needed');
  assert.equal(getPlanValue(plan, 'fallback-meaning'), 'Not needed');
  assert.equal(getPlanValue(plan, 'fallback-category'), 'Not needed');
  assert.equal(getPlanValue(plan, 'fallback-review'), 'Not needed');
  assert.equal(getPlanValue(plan, 'output-term-count'), '4');
  assert.equal(getPlanValue(plan, 'vocabulary-consumer'), 'vocabularyText');
  assert.equal(getPlanValue(plan, 'question-consumer'), 'questionsText');
  assert.equal(getPlanValue(plan, 'pair-consumer'), 'pairsText');
  assert.equal(getPlanValue(plan, 'group-consumer'), 'groupsText');
  assert.equal(getPlanValue(plan, 'teacher-note-consumer'), 'teacherNotesText');
  assert.equal(getPlanValue(plan, 'privacy-source-text'), 'Hidden');
  assert.equal(getPlanValue(plan, 'privacy-material-identifiers'), 'Hidden');

  assertNoPrivatePlanViewText(
    JSON.stringify({
      itemViews: plan.itemViews,
      privacy: plan.privacy,
    })
  );
});

test('AI fallback source-term plan pads sparse teacher notes deterministically', () => {
  const sparseInput: GenerateActivityDraftInput = {
    ...sourceReadyInput,
    itemCount: 5,
    sourceText: [
      'Go.',
      '',
      'Attached classroom source materials:',
      `- Worksheet document: ${SECRET_WORKSHEET_NAME}`,
      `- storageKey: ${SECRET_STORAGE_KEY}`,
    ].join('\n'),
  };
  const plan = buildFallbackActivityDraftSourceTermPlan({
    input: sparseInput,
    locale: 'en',
  });

  assert.equal(plan.usedFallbackPadding, true);
  assert.equal(plan.sourceTerms.length < plan.minimumSourceTerms, true);
  assert.equal(plan.terms.length, 5);
  assert.equal(getPlanValue(plan, 'source-term-count'), '2');
  assert.equal(getPlanValue(plan, 'source-term-selection'), '2');
  assert.equal(getPlanValue(plan, 'fallback-padding'), 'Used');
  assert.equal(getPlanValue(plan, 'fallback-key-word'), 'Available');
  assert.equal(getPlanValue(plan, 'fallback-example'), 'Available');
  assert.equal(getPlanValue(plan, 'fallback-meaning'), 'Available');
  assert.equal(getPlanValue(plan, 'output-term-count'), '5');
  assertNoPrivatePlanViewText(
    JSON.stringify({
      itemViews: plan.itemViews,
      privacy: plan.privacy,
    })
  );
});

test('AI fallback draft generation consumes the shared source-term plan', () => {
  const plan = buildFallbackActivityDraftSourceTermPlan({
    input: sourceReadyInput,
    locale: 'en',
  });
  const terms = buildFallbackActivityDraftTerms({
    input: sourceReadyInput,
    locale: 'en',
  });
  const activity = createFallbackActivityDraft(sourceReadyInput);
  const content = buildActivityContent(activity);

  assert.deepEqual(terms, plan.terms);
  assert.deepEqual(content.vocabulary, plan.terms);
  assert.equal(content.questions.length, sourceReadyInput.itemCount);
  assert.equal(content.pairs.length, sourceReadyInput.itemCount);
  assert.equal(content.groups.length, 2);
});

function getPlanValue(
  plan: ActivityAiFallbackSourceTermPlan,
  id: ActivityAiFallbackSourceTermPlanItemId
) {
  const itemView = plan.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing source-term plan item ${id}`);
  return itemView.value;
}

function assertNoPrivatePlanViewText(serializedView: string) {
  for (const privateValue of [
    SECRET_FILE_ID,
    SECRET_SOURCE,
    SECRET_STORAGE_KEY,
    SECRET_WORKSHEET_NAME,
    'storageKey',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI fallback source-term plan leaked private view text: ${privateValue}`
    );
  }
}
