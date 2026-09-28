import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canApplyActivityDraftResultToEditor,
  createFallbackActivityDraftResult,
  extractActivityDraftSourceTerms,
  type GenerateActivityDraftInput,
} from '@/activities/ai-draft';
import { removeActivitySourceMaterialDraftNotes } from '@/activities/draft-source';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');
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

  assert.equal(canApplyActivityDraftResultToEditor(result), true);
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
