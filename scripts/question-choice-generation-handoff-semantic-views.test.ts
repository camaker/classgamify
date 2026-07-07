import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
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

const TEMPLATE_READINESS_PANEL_SOURCE = readFileSync(
  'src/components/activities/activity-template-readiness-panel.tsx',
  'utf8'
);

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

test('question choice generation handoff renders stable DOM relationships', () => {
  assert.match(
    TEMPLATE_READINESS_PANEL_SOURCE,
    /QuestionChoiceGenerationHandoffItemView[\s\S]*QuestionChoiceGenerationHandoffView[\s\S]*function ActivityTemplateQuizChoiceGenerationHandoff[\s\S]*const titleId = 'question-choice-generation-handoff-title'[\s\S]*const descriptionId = 'question-choice-generation-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="question-choice-generation"[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map[\s\S]*ActivityTemplateQuizChoiceGenerationHandoffItem/,
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
