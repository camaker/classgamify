import assert from 'node:assert/strict';
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

test('question choice generation handoff exposes 20 safe slices', () => {
  const handoffView = buildQuestionChoiceGenerationHandoffView({
    content: mixedChoiceContent,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 20);
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
    exposesOptionText: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
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

  assertNoPrivateQuestionChoiceText(JSON.stringify(handoffView));
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
