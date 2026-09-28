import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildQuestionChoiceReadinessSummary,
  buildQuestionChoices,
} from '@/activities/distractors';
import type { ActivityContent } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_ONE = 'SECRET_ANSWER_ONE';
const SECRET_ANSWER_TWO = 'SECRET_ANSWER_TWO';
const SECRET_ANSWER_THREE = 'SECRET_ANSWER_THREE';
const SECRET_OPTION_ONE = 'SECRET_OPTION_ONE';
const SECRET_OPTION_TWO = 'SECRET_OPTION_TWO';
const SECRET_OPTION_THREE = 'SECRET_OPTION_THREE';
const SECRET_PROMPT_ONE = 'SECRET_PROMPT_ONE';
const SECRET_PROMPT_TWO = 'SECRET_PROMPT_TWO';
const SECRET_PROMPT_THREE = 'SECRET_PROMPT_THREE';
const SECRET_VOCABULARY = 'SECRET_VOCABULARY';

const ACTIVITY_AI_DRAFT_SOURCE = readFileSync(
  'src/activities/ai-draft.ts',
  'utf8'
);
const ACTIVITY_DISTRACTORS_SOURCE = readFileSync(
  'src/activities/distractors.ts',
  'utf8'
);
const ACTIVITY_RUNTIME_SOURCE = readFileSync(
  'src/activities/runtime.ts',
  'utf8'
);
const ACTIVITY_VALIDATION_SOURCE = readFileSync(
  'src/activities/validation.ts',
  'utf8'
);
const QUESTION_OPTIONS_SOURCE = readFileSync(
  'src/activities/question-options.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const mixedChoiceContent: ActivityContent = {
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groups: [],
  language: 'en',
  learningGoal: 'Students review question choice completion.',
  pairs: [],
  questions: [
    {
      answer: SECRET_ANSWER_ONE,
      id: 'question-one',
      options: [
        { id: 'option-one-answer', text: SECRET_ANSWER_ONE },
        { id: 'option-one-a', text: SECRET_OPTION_ONE },
        { id: 'option-one-b', text: SECRET_OPTION_TWO },
        { id: 'option-one-c', text: SECRET_OPTION_THREE },
      ],
      prompt: SECRET_PROMPT_ONE,
    },
    {
      answer: SECRET_ANSWER_TWO,
      id: 'question-two',
      options: [{ id: 'option-two-answer', text: SECRET_ANSWER_TWO }],
      prompt: SECRET_PROMPT_TWO,
    },
    {
      answer: SECRET_ANSWER_THREE,
      id: 'question-three',
      options: [{ id: 'option-three-answer', text: SECRET_ANSWER_THREE }],
      prompt: SECRET_PROMPT_THREE,
    },
  ],
  sourceMaterials: [],
  sourceSummary: 'Source summary should not enter this handoff.',
  subject: 'Science',
  teacherNotes: [],
  vocabulary: [SECRET_VOCABULARY],
};

test('question choice generation keeps runtime and draft option contracts aligned', () => {
  const summary = buildQuestionChoiceReadinessSummary({
    content: mixedChoiceContent,
  });
  const completedChoices = buildQuestionChoices({
    content: mixedChoiceContent,
    question: mixedChoiceContent.questions[1]!,
  });

  assert.equal(summary.itemCount, 3);
  assert.equal(summary.readyCount, 3);
  assert.equal(summary.explicitReadyCount, 1);
  assert.equal(summary.completedLocallyCount, 2);
  assert.equal(summary.needsCandidateCount, 0);
  assert.deepEqual(
    summary.items.map((item) => item.status),
    ['explicit-ready', 'completed-locally', 'completed-locally']
  );
  assert.equal(completedChoices.length, 4);
  assert.equal(completedChoices.includes(SECRET_ANSWER_TWO), true);
  assert.equal(completedChoices.includes(SECRET_ANSWER_ONE), true);
  assert.equal(completedChoices.includes(SECRET_ANSWER_THREE), true);
  assert.equal(completedChoices.includes(SECRET_VOCABULARY), true);
  assert.equal(completedChoices.includes(SECRET_PROMPT_TWO), false);
  assert.equal(new Set(completedChoices).size, completedChoices.length);
  const quizRuntimeBranch = ACTIVITY_RUNTIME_SOURCE.match(
    /case 'quiz':\s*return content\.questions[\s\S]*?prompt: question\.prompt,\s*\}\)\);/
  )?.[0];

  assert.ok(quizRuntimeBranch, 'Expected getRuntimeItems quiz runtime branch.');

  assert.match(
    ACTIVITY_DISTRACTORS_SOURCE,
    /buildQuestionChoices[\s\S]*const explicitOptions = question\.options\?\.map\(\(option\) => option\.text\) \?\? \[\][\s\S]*buildQuestionOptionTexts\(\{[\s\S]*answer: question\.answer[\s\S]*maxOptions: targetCount[\s\S]*options: explicitOptions[\s\S]*buildQuestionDistractorCandidateSources[\s\S]*stableChoiceRank\(question\.id, left\)[\s\S]*buildQuestionOptionTexts\(\{[\s\S]*answer: question\.answer[\s\S]*maxOptions: targetCount[\s\S]*options: \[\.\.\.explicitChoices, \.\.\.distractors\]/,
    'Deterministic quiz choices should preserve explicit ActivityQuestion.options, then add stable sibling/vocabulary candidates.'
  );
  assert.match(
    quizRuntimeBranch,
    /choices: buildQuestionChoices\(\{ content, question \}\)/,
    'Quiz runtime items should use the deterministic question-choice helper.'
  );
  assert.doesNotMatch(
    quizRuntimeBranch,
    /question\.options\?\.map\(\(option\) => option\.text\)/,
    'Quiz runtime items should not bypass local distractor completion.'
  );
  assert.match(
    ACTIVITY_VALIDATION_SOURCE,
    /const normalizedAnswer = normalizeQuestionOptionDisplayText\(answer\)[\s\S]*const allOptions = buildQuestionOptionTexts\(\{[\s\S]*answer: normalizedAnswer,[\s\S]*options: parseInlineList\(optionsRaw\),[\s\S]*\}\)[\s\S]*options: allOptions\.map[\s\S]*isCorrect: option === normalizedAnswer[\s\S]*text: option/,
    'Editor validation should write parsed choices into ActivityQuestion.options with the correct answer retained.'
  );
  assert.match(
    ACTIVITY_AI_DRAFT_SOURCE,
    /toEditorQuestionInput\(question: AiActivityDraftQuestion\)[\s\S]*buildAiDraftQuestionOptionViews\(\s*buildQuestionOptionTexts\(\{[\s\S]*answer,[\s\S]*options: question\.options \?\? \[\],[\s\S]*\}\)\s*\)/,
    'AI draft editor application should normalize generated choices through the shared option-text helper.'
  );
  assert.match(
    ACTIVITY_AI_DRAFT_SOURCE,
    /function buildAiDraftQuestionOptions[\s\S]*buildAiDraftQuestionOptionViews\(\s*buildQuestionOptionTexts\(\{[\s\S]*answer,[\s\S]*options,[\s\S]*\}\)\s*\)/,
    'Fallback draft questions should use the same stable option view helper.'
  );
  assert.doesNotMatch(
    ACTIVITY_AI_DRAFT_SOURCE,
    /id: text/,
    'AI draft option ids should not be generated directly from visible option text.'
  );
  assert.match(
    QUESTION_OPTIONS_SOURCE,
    /uniqueQuestionOptionTexts[\s\S]*normalizeQuestionOptionDisplayText\(value\)[\s\S]*normalizeQuestionOptionText\(option\)[\s\S]*seen\.has\(key\)[\s\S]*normalizeQuestionOptionDisplayText\(value\)\.toLowerCase\(\)[\s\S]*value\.normalize\('NFKC'\)\.trim\(\)/,
    'Question option normalization should keep NFKC display text and case-insensitive de-duplication shared.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /quiz-choice generation privacy-scope boundaries/,
    'The E2E catalog should document the quiz-choice privacy-scope fast gate.'
  );
});
