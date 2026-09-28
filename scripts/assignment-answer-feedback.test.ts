import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getRuntimeItems, evaluateRuntimeAnswers } from '@/activities/runtime';
import type { ActivityContent } from '@/activities/types';
import {
  getAcceptedAnswers,
  getUniqueAcceptedAnswers,
  matchAnswer,
} from '@/activities/answer-matching';
import {
  buildPublicAttemptReviewSummaryView,
  type PublicAttemptReviewItem,
} from '@/assignments/public';
import { analyzeAssignmentResults } from '@/assignments/results';
import { buildAssignmentResultAttemptAnswerTextView } from '@/assignments/result-answer-view';
import { buildPublicAnswerFeedbackView } from '@/assignments/student-runner-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_PROMPT_TEXT = 'SECRET_TEACHER_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'Secret Student';
const SECRET_TOKEN = 'raw-secret-anonymous-token';
const SECRET_RUNTIME_ITEM_ID = 'secret-runtime-id';
const SECRET_TEACHER_ANSWER = 'SECRET_TEACHER_ANSWER';

const PUBLIC_SOURCE = readFileSync('src/assignments/public.ts', 'utf8');
const PUBLIC_ANSWER_FEEDBACK_SOURCE = readFileSync(
  'src/components/activities/public-answer-feedback.tsx',
  'utf8'
);
const RESULT_ANSWER_VIEW_SOURCE = readFileSync(
  'src/assignments/result-answer-view.ts',
  'utf8'
);
const RESULT_FORMAT_SOURCE = readFileSync(
  'src/assignments/result-format.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RUNTIME_SOURCE = readFileSync('src/activities/runtime.ts', 'utf8');
const STUDENT_RUNNER_VIEW_SOURCE = readFileSync(
  'src/assignments/student-runner-view.ts',
  'utf8'
);

test('assignment answer feedback evidence comes from shared parser, review, and export helpers', () => {
  assert.equal(EVIDENCE.acceptedAnswerCount, 3);
  assert.equal(EVIDENCE.uniqueAcceptedAnswerCount, 2);
  assert.equal(EVIDENCE.caseInsensitiveMatchCorrect, true);
  assert.equal(EVIDENCE.punctuationMatchCorrect, true);
  assert.equal(EVIDENCE.ampersandMatchCorrect, true);
  assert.equal(EVIDENCE.blankAnswerCorrect, false);
  assert.equal(EVIDENCE.runtimeCorrectItemCount, 2);
  assert.equal(EVIDENCE.runtimeCompletedItemCount, 2);
  assert.equal(EVIDENCE.publicHiddenReviewIsHiddenBySettings, true);
  assert.equal(EVIDENCE.teacherAnswerExpectedReady, true);
  assert.equal(EVIDENCE.teacherAnswerAlternativesReady, true);
  assert.equal(EVIDENCE.csvAnswerViewReady, true);
  assert.equal(EVIDENCE.csvAcceptedAlternativesColumnReady, true);
  assert.equal(EVIDENCE.csvExplanationColumnReady, true);
  assert.match(RUNTIME_SOURCE, /matchAnswer/);
  assert.match(PUBLIC_SOURCE, /getRuntimeDisplayAcceptedAnswers/);
  assert.match(RESULTS_SOURCE, /getRuntimeDisplayAcceptedAnswers/);
  assert.match(RESULT_ANSWER_VIEW_SOURCE, /formatPrimaryAcceptedAnswer/);
  assert.match(RESULT_FORMAT_SOURCE, /getUniqueAcceptedAnswers/);
  assert.match(STUDENT_RUNNER_VIEW_SOURCE, /buildPublicAnswerFeedbackView/);
  assertNoPrivateAnswerFeedbackText(JSON.stringify(EVIDENCE));
});

test('public answer feedback renders stable semantic DOM relationships', () => {
  assert.match(
    PUBLIC_ANSWER_FEEDBACK_SOURCE,
    /useId[\s\S]*const feedbackId = useId\(\)[\s\S]*const descriptionId = `\$\{feedbackId\}-description`[\s\S]*const statusLabelId = `\$\{feedbackId\}-status-label`[\s\S]*const statusValueId = `\$\{feedbackId\}-status-value`[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{feedback\.ariaLabel\}[\s\S]*id=\{statusLabelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{feedback\.statusAriaLabel\}[\s\S]*aria-labelledby=\{`\$\{statusLabelId\} \$\{statusValueId\}`\}[\s\S]*id=\{statusValueId\}[\s\S]*id=\{descriptionId\}/,
    'Public answer feedback should expose the shared status with stable label, value, and description relationships without using raw runtime item ids.'
  );
  assert.match(
    PUBLIC_ANSWER_FEEDBACK_SOURCE,
    /PublicAnswerFeedbackDetailLine[\s\S]*PublicAnswerFeedbackDetailLineItem[\s\S]*descriptionId=\{descriptionId\}[\s\S]*feedbackId=\{feedbackId\}[\s\S]*line=\{line\}[\s\S]*function PublicAnswerFeedbackDetailLineItem[\s\S]*const labelId = `\$\{feedbackId\}-\$\{line\.id\}-label`[\s\S]*const valueId = `\$\{feedbackId\}-\$\{line\.id\}-value`[\s\S]*data-feedback-detail=\{line\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{line\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}/,
    'Public answer feedback detail lines should expose submitted answer, correct answer, accepted alternatives, and explanations as stable labelled outputs.'
  );
  assert.doesNotMatch(
    PUBLIC_ANSWER_FEEDBACK_SOURCE,
    /reviewItem\.itemId/,
    'Public answer feedback DOM ids should not be derived from raw runtime item ids.'
  );
});

function buildAnswerFeedbackEvidence() {
  const acceptedAnswers = getAcceptedAnswers('Paris / Lutèce; 巴黎');
  const runtimeItems = getRuntimeItems('quiz', ANSWER_FEEDBACK_CONTENT);
  const evaluation = evaluateRuntimeAnswers({
    answers: [
      {
        answer: 'paris',
        itemId: 'q1',
      },
      {
        answer: 'tea and milk',
        itemId: 'q2',
      },
    ],
    content: ANSWER_FEEDBACK_CONTENT,
    templateType: 'quiz',
  });
  const visibleReview = buildPublicAttemptReviewSummaryView({
    answers: evaluation.answers,
    runtimeItems,
    showCorrectAnswers: true,
  });
  const hiddenReview = buildPublicAttemptReviewSummaryView({
    answers: evaluation.answers,
    runtimeItems,
    showCorrectAnswers: false,
  });
  const feedbackView = buildPublicAnswerFeedbackView({
    reviewItem: visibleReview.items[0] as PublicAttemptReviewItem,
  });
  const analysis = analyzeAssignmentResults({
    attempts: [
      {
        anonymousToken: SECRET_TOKEN,
        answersJson: {
          answers: evaluation.answers,
          templateType: 'quiz',
        },
        completedAt: new Date('2026-07-05T00:00:00.000Z'),
        id: 'attempt-1',
        resultJson: evaluation.result,
        score: evaluation.result.earnedPoints,
        studentName: SECRET_STUDENT_NAME,
      },
    ],
    runtimeItems,
  });
  const answerTextView = buildAssignmentResultAttemptAnswerTextView(
    analysis.attempts[0]?.answers[0] ?? {
      acceptedAnswers: [],
      answer: '',
      correct: false,
      expectedAnswer: '',
      itemId: '',
      prompt: '',
      submitted: false,
    }
  );

  return {
    acceptedAnswerCount: acceptedAnswers.length,
    ampersandMatchCorrect: matchAnswer({
      expectedAnswer: 'Tea & milk',
      submittedAnswer: 'tea and milk',
    }).correct,
    blankAnswerCorrect: matchAnswer({
      expectedAnswer: 'Paris',
      submittedAnswer: '   ',
    }).correct,
    caseInsensitiveMatchCorrect: matchAnswer({
      expectedAnswer: 'Paris / 巴黎',
      submittedAnswer: 'paris',
    }).correct,
    chineseSeparatorCount: getAcceptedAnswers('一、二；三').length,
    csvAcceptedAlternativesColumnReady:
      /answerView\.acceptedAlternativesText/.test(RESULTS_EXPORT_SOURCE),
    csvAnswerViewReady: /buildAssignmentResultAttemptAnswerTextView/.test(
      RESULTS_EXPORT_SOURCE
    ),
    csvExplanationColumnReady:
      /formatAssignmentExportText\(answer\.explanation\)/.test(
        RESULTS_EXPORT_SOURCE
      ),
    punctuationMatchCorrect: matchAnswer({
      expectedAnswer: 'co-operate',
      submittedAnswer: 'co operate',
    }).correct,
    publicAcceptedAlternativeCount: countAcceptedAlternatives(
      visibleReview.items
    ),
    publicExplanationCount: visibleReview.items.filter((item) =>
      Boolean(item.explanation)
    ).length,
    publicHiddenReviewIsHiddenBySettings: hiddenReview.summary.hiddenBySettings,
    publicHiddenReviewItemCount: hiddenReview.items.length,
    publicVisibleReviewItemCount: visibleReview.items.length,
    runtimeAccuracy: evaluation.result.accuracy,
    runtimeCompletedItemCount: evaluation.result.completedItemCount,
    runtimeCorrectItemCount: evaluation.result.correctItemCount,
    runtimeTotalPoints: evaluation.result.totalPoints,
    semicolonSeparatorCount: getAcceptedAnswers('left; right').length,
    slashSeparatorCount: getAcceptedAnswers('left / right').length,
    studentFeedbackAcceptedLineCount: feedbackView.detailLines.filter(
      (line) => line.id === 'accepted-answers'
    ).length,
    studentFeedbackDetailLineCount: feedbackView.detailLines.length,
    studentFeedbackExplanationLineCount: feedbackView.detailLines.filter(
      (line) => line.id === 'explanation'
    ).length,
    studentFeedbackStatus: feedbackView.statusLabel,
    teacherAcceptedAnswerCount:
      analysis.perItem[0]?.acceptedAnswers.length ?? 0,
    teacherAnalysisItemCount: analysis.perItem.length,
    teacherAnswerAlternativesReady: Boolean(
      answerTextView.optionalAcceptedAlternativesText
    ),
    teacherAnswerExpectedReady: Boolean(answerTextView.expectedAnswerText),
    teacherAnswerStatus: answerTextView.statusLabel,
    teacherNeedsReviewCount: analysis.needsReview.length,
    uniqueAcceptedAnswerCount: getUniqueAcceptedAnswers([
      'Paris',
      ' paris ',
      'PARIS',
      '巴黎',
    ]).length,
  };
}

const ANSWER_FEEDBACK_CONTENT: ActivityContent = {
  difficulty: 'core',
  gradeBand: 'Grade 5',
  groups: [],
  language: 'en',
  learningGoal: 'Review accepted answers and feedback.',
  pairs: [],
  questions: [
    {
      answer: 'Paris / Lutèce; 巴黎',
      explanation: 'Capital city accepted in multiple classroom languages.',
      id: 'q1',
      prompt: 'What is the capital of France?',
    },
    {
      answer: 'Tea & milk',
      id: 'q2',
      prompt: 'Which phrase uses an ampersand?',
    },
    {
      answer: 'co-operate',
      explanation: 'Hyphenated words are normalized for scoring.',
      id: 'q3',
      prompt: 'Spell the teamwork verb.',
    },
  ],
  sourceMaterials: [],
  sourceSummary: 'Teacher-created answer feedback sample.',
  subject: 'Language',
  teacherNotes: [],
  vocabulary: [],
};

const EVIDENCE = buildAnswerFeedbackEvidence();

function countAcceptedAlternatives(items: PublicAttemptReviewItem[]) {
  return items.reduce(
    (count, item) => count + Math.max(0, item.acceptedAnswers.length - 1),
    0
  );
}

function assertNoPrivateAnswerFeedbackText(serialized: string) {
  for (const secret of [
    SECRET_PROMPT_TEXT,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_TEACHER_ANSWER,
  ]) {
    assert.equal(
      serialized.includes(secret),
      false,
      `Leaked private answer feedback text: ${secret}`
    );
  }
}
