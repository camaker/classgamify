import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildQuestionChoiceReadinessSummary,
  buildQuestionChoices,
  buildQuestionChoiceGenerationHandoffView,
  QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS,
  type QuestionChoiceGenerationHandoffItemId,
  type QuestionChoiceGenerationHandoffView,
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
const TEMPLATE_READINESS_PANEL_SOURCE = readFileSync(
  'src/components/activities/activity-template-readiness-panel.tsx',
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

test('question choice generation handoff exposes 30 safe slices', () => {
  const handoffView = buildQuestionChoiceGenerationHandoffView({
    content: mixedChoiceContent,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS]);
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
    appliesBeforeActivitySave: true,
    exposesAnswerText: false,
    exposesCandidateText: false,
    exposesOptionText: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesStableChoiceSeed: false,
    exposesVocabularyText: false,
    itemIds,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    requiresTeacherReview: true,
    scope: 'teacher-reviewed-quiz-choice-generation',
    usesQuestionOptionStructure: true,
    writeTarget: 'ActivityQuestion.options',
  });

  assert.equal(
    getHandoffValue(handoffView, 'generation-scope'),
    'Editor before save'
  );
  assert.equal(getHandoffValue(handoffView, 'target-choice-count'), '4');
  assert.equal(getHandoffValue(handoffView, 'question-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'ready-question-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'explicit-ready-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'completed-locally-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'needs-candidates-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'explicit-choice-count'), '6');
  assert.equal(getHandoffValue(handoffView, 'deterministic-choice-count'), '6');
  assert.equal(getHandoffValue(handoffView, 'missing-choice-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'sibling-answer-candidates'), '6');
  assert.equal(getHandoffValue(handoffView, 'vocabulary-candidates'), '3');
  assert.equal(getHandoffValue(handoffView, 'candidate-source-count'), '9');
  assert.equal(getHandoffValue(handoffView, 'answer-coverage-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'missing-answer-count'), '0');
  assert.equal(
    getHandoffValue(handoffView, 'option-structure'),
    'ActivityQuestionOption[]'
  );
  assert.equal(
    getHandoffValue(handoffView, 'generation-mode'),
    'Deterministic now, AI later'
  );
  assert.equal(
    getHandoffValue(handoffView, 'write-target'),
    'Question options'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-review'),
    'Review before save'
  );
  assert.equal(
    getHandoffValue(handoffView, 'publish-boundary'),
    'Save before publish'
  );
  assert.equal(getHandoffValue(handoffView, 'completed-choice-count'), '12');
  assert.equal(
    getHandoffValue(handoffView, 'explicit-answer-coverage-count'),
    '3'
  );
  assert.equal(
    getHandoffValue(handoffView, 'local-candidate-question-count'),
    '3'
  );
  assert.equal(
    getHandoffValue(handoffView, 'candidate-deduplication'),
    'Unique candidates'
  );
  assert.equal(
    getHandoffValue(handoffView, 'candidate-normalization'),
    'Shared option normalization'
  );
  assert.equal(
    getHandoffValue(handoffView, 'stable-choice-order'),
    'Question-seeded order'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-choice-source'),
    'buildQuestionChoices'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-inclusion-guard'),
    'Answer retained'
  );
  assert.equal(
    getHandoffValue(handoffView, 'empty-content-guard'),
    'Questions present'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Choice text hidden'
  );

  assertNoPrivateQuestionChoiceText(JSON.stringify(handoffView));
});

test('question choice generation handoff keeps sparse quizzes explicit', () => {
  const handoffView = buildQuestionChoiceGenerationHandoffView({
    content: {
      ...mixedChoiceContent,
      questions: [
        {
          answer: SECRET_ANSWER_ONE,
          id: 'question-sparse',
          prompt: SECRET_PROMPT_ONE,
        },
      ],
      vocabulary: [],
    },
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS]
  );
  assert.equal(getHandoffValue(handoffView, 'question-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'ready-question-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'explicit-ready-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'completed-locally-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'needs-candidates-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'explicit-choice-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'deterministic-choice-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'missing-choice-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'sibling-answer-candidates'), '0');
  assert.equal(getHandoffValue(handoffView, 'vocabulary-candidates'), '0');
  assert.equal(getHandoffValue(handoffView, 'candidate-source-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'answer-coverage-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'missing-answer-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'completed-choice-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'explicit-answer-coverage-count'),
    '1'
  );
  assert.equal(
    getHandoffValue(handoffView, 'local-candidate-question-count'),
    '0'
  );
  assert.equal(
    getHandoffValue(handoffView, 'empty-content-guard'),
    'Questions present'
  );

  assertNoPrivateQuestionChoiceText(JSON.stringify(handoffView));
});

test('question choice generation handoff keeps empty content safe', () => {
  const handoffView = buildQuestionChoiceGenerationHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS]
  );
  assert.equal(getHandoffValue(handoffView, 'question-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'ready-question-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'completed-choice-count'), '0');
  assert.equal(
    getHandoffValue(handoffView, 'empty-content-guard'),
    'No quiz questions'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Choice text hidden'
  );
});

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
  assertNoPrivateQuestionChoiceText(
    JSON.stringify(
      buildQuestionChoiceGenerationHandoffView({
        summary,
      })
    )
  );
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
    ACTIVITY_DISTRACTORS_SOURCE,
    /writeTarget: 'ActivityQuestion\.options'/,
    'Future AI distractor generation should keep the same question option write target.'
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
    TEMPLATE_READINESS_PANEL_SOURCE,
    /ActivityTemplateQuizChoiceGenerationHandoff[\s\S]*handoffView=\{readiness\.generationHandoffView\}/,
    'Editor readiness should render the prepared question-choice handoff view.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /scripts\/question-choice-generation-handoff-semantic-views\.test\.ts/,
    'The E2E catalog should list the fast gate for quiz-choice contract changes.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /quiz-choice generation privacy-scope boundaries/,
    'The E2E catalog should document the quiz-choice privacy-scope fast gate.'
  );
});

test('question choice generation handoff renders stable DOM relationships', () => {
  assert.match(
    TEMPLATE_READINESS_PANEL_SOURCE,
    /function ActivityTemplateQuizChoiceGenerationHandoff[\s\S]*className="sr-only"/,
    'Question-choice audit semantics should remain machine-readable without taking over the teacher review surface.'
  );
  assert.match(
    TEMPLATE_READINESS_PANEL_SOURCE,
    /QuestionChoiceGenerationHandoffItemView[\s\S]*QuestionChoiceGenerationHandoffView[\s\S]*function ActivityTemplateQuizChoiceGenerationHandoff[\s\S]*const titleId = 'question-choice-generation-handoff-title'[\s\S]*const descriptionId = 'question-choice-generation-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="question-choice-generation"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map[\s\S]*ActivityTemplateQuizChoiceGenerationHandoffItem/,
    'Question choice generation handoff should render a labelled section tied to its prepared description.'
  );
  assert.match(
    TEMPLATE_READINESS_PANEL_SOURCE,
    /function ActivityTemplateQuizChoiceGenerationHandoffItem[\s\S]*const labelId = `question-choice-generation-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `question-choice-generation-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `question-choice-generation-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Question choice generation handoff should render each safe slice with stable label, value, and description relationships.'
  );
});

function getHandoffValue(
  view: QuestionChoiceGenerationHandoffView,
  id: QuestionChoiceGenerationHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing question choice generation handoff item ${id}`);
  return item.value;
}

function assertNoPrivateQuestionChoiceText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_ONE,
    SECRET_ANSWER_TWO,
    SECRET_ANSWER_THREE,
    SECRET_OPTION_ONE,
    SECRET_OPTION_TWO,
    SECRET_OPTION_THREE,
    SECRET_PROMPT_ONE,
    SECRET_PROMPT_TWO,
    SECRET_PROMPT_THREE,
    SECRET_VOCABULARY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Question choice generation handoff leaked private text: ${privateValue}`
    );
  }
}
