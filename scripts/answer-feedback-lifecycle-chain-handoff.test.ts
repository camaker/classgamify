import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getAcceptedAnswers,
  getUniqueAcceptedAnswers,
  matchAnswer,
} from '@/activities/answer-matching';
import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import type { ActivityContent } from '@/activities/types';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import {
  ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildAnswerFeedbackLifecycleChainHandoffView,
  type AnswerFeedbackLifecycleChainHandoffItemId,
  type AnswerFeedbackLifecycleChainHandoffView,
} from '@/assignments/answer-feedback-lifecycle-chain';
import { FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/fill-blank-worksheet-handoff';
import { GROUP_SORT_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/group-sort-board-handoff';
import { LINE_MATCH_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/line-match-board-handoff';
import { LISTENING_SPEECH_HANDOFF_ITEM_IDS } from '@/assignments/listening-speech-handoff';
import { MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/matching-pairs-board-handoff';
import { OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS } from '@/assignments/open-box-reveal-handoff';
import {
  buildPublicAttemptReviewSummaryView,
  type PublicAttemptReviewItem,
} from '@/assignments/public';
import { buildAssignmentResultAttemptAnswerTextView } from '@/assignments/result-answer-view';
import { analyzeAssignmentResults } from '@/assignments/results';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-play-chain';
import { buildPublicAnswerFeedbackView } from '@/assignments/student-runner-view';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ANSWER_MATCHING_SOURCE = readFileSync(
  'src/activities/answer-matching.ts',
  'utf8'
);
const RUNTIME_SOURCE = readFileSync('src/activities/runtime.ts', 'utf8');
const DISTRACTORS_SOURCE = readFileSync(
  'src/activities/distractors.ts',
  'utf8'
);
const PUBLIC_SOURCE = readFileSync('src/assignments/public.ts', 'utf8');
const STUDENT_RUNNER_VIEW_SOURCE = readFileSync(
  'src/assignments/student-runner-view.ts',
  'utf8'
);
const PUBLIC_ANSWER_FEEDBACK_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/public-answer-feedback.tsx',
  'utf8'
);
const STUDENT_RUNTIME_ITEM_LIST_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/student-runtime-item-list.tsx',
  'utf8'
);
const FILL_BLANK_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/fill-blank-worksheet.tsx',
  'utf8'
);
const LINE_MATCH_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/line-match-board.tsx',
  'utf8'
);
const GROUP_SORT_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/group-sort-board.tsx',
  'utf8'
);
const MATCHING_PAIRS_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/matching-pairs-board.tsx',
  'utf8'
);
const LISTENING_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/listening-runner.tsx',
  'utf8'
);
const OPEN_BOX_COMPONENT_SOURCE = readFileSync(
  'src/components/activities/open-box-runner.tsx',
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
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_PROMPT_TEXT = 'SECRET_FEEDBACK_PROMPT_SHOULD_NOT_LEAK';
const PRIVATE_RUNTIME_ID = 'SECRET_FEEDBACK_RUNTIME_ID_SHOULD_NOT_LEAK';
const PRIVATE_STUDENT_ANSWER = 'SECRET_FEEDBACK_STUDENT_ANSWER_SHOULD_NOT_LEAK';
const PRIVATE_STUDENT_NAME = 'SECRET_FEEDBACK_STUDENT_NAME_SHOULD_NOT_LEAK';
const PRIVATE_TEACHER_ANSWER = 'SECRET_FEEDBACK_TEACHER_ANSWER_SHOULD_NOT_LEAK';
const PRIVATE_TOKEN = 'SECRET_FEEDBACK_TOKEN_SHOULD_NOT_LEAK';

test('answer feedback lifecycle chain exposes 30 safe scoring slices', () => {
  const handoffView = buildAnswerFeedbackLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Answer feedback lifecycle chain');
  assert.match(
    handoffView.description,
    /Thirty-slice answer scoring and feedback lifecycle chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
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
    chainSourceFileCount: ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    exposesAcceptedAlternativesAfterReview: true,
    exposesAnonymousTokenInFeedbackHandoff: false,
    exposesAnswerKeysBeforeReview: false,
    exposesPromptTextInFeedbackHandoff: false,
    exposesRawRuntimeItemIdsInFeedbackHandoff: false,
    exposesStudentAnswerTextInFeedbackHandoff: false,
    exposesStudentNamesInFeedbackHandoff: false,
    exposesTeacherExplanationsBeforeReview: false,
    exposesTeacherOnlyAnswerTextInFeedbackHandoff: false,
    itemIds,
    mutatesAttempts: false,
    preservesTeacherResultEvidence: true,
    publicFeedbackRespectsAnswerReveal: true,
    runtimeScoringUsesSharedMatcher: true,
    sourceFiles: [...ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES],
    templateFeedbackUsesSharedComponent: true,
    usesAnswerFeedbackHandoff: true,
    usesSharedAcceptedAnswerParser: true,
    usesSharedFeedbackViews: true,
  });
  assertNoPrivateFeedbackText(JSON.stringify(handoffView));
});

test('answer feedback lifecycle chain summarizes each feedback boundary', () => {
  const handoffView = buildAnswerFeedbackLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-scoring-policy', 'Shared scoring'],
      ['accepted-answer-parser', 'getAcceptedAnswers'],
      ['answer-normalization', 'NFKC + punctuation'],
      ['separator-coverage', 'Slash/semicolon/Chinese'],
      ['unique-alternative-dedup', 'Normalized unique'],
      ['blank-answer-guard', 'Blank is incorrect'],
      ['runtime-item-source', 'Questions/pairs/groups'],
      ['template-runner-map', 'Seven runners'],
      ['quiz-choice-completion', 'Deterministic choices'],
      ['runtime-scoring-evaluation', 'evaluateRuntimeAnswers'],
      ['submitted-answer-normalization', 'Display text'],
      ['scored-result-metrics', 'Accuracy/points/completed'],
      ['public-review-policy', 'Reveal if allowed'],
      ['public-feedback-view', 'Shared feedback view'],
      ['feedback-dom-semantics', 'Label/value/details'],
      ['template-feedback-surfaces', 'Shared component'],
      ['fill-blank-feedback-boundary', 'Blank review'],
      ['line-match-feedback-boundary', 'Connection review'],
      ['group-sort-feedback-boundary', 'Category review'],
      ['matching-pairs-feedback-boundary', 'Pair review'],
      ['listening-feedback-boundary', 'Transcript review'],
      ['open-box-feedback-boundary', 'Reveal review'],
      ['teacher-analysis-feedback', 'Accepted answers retained'],
      ['result-answer-text-view', 'Expected/alternatives'],
      ['result-formatting-shared', 'Shared accepted formatting'],
      ['csv-export-feedback', 'Answer columns'],
      ['server-review-summary', 'Scored review payload'],
      ['teacher-results-chain-alignment', 'Results chain'],
      ['feedback-privacy-guard', 'Private data hidden'],
      ['answer-feedback-handoff-boundary', '30 feedback handoff slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-scoring-evaluation'),
    'evaluateRuntimeAnswers'
  );
});

test('answer feedback lifecycle chain is backed by adjacent gates', () => {
  assert.equal(ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing answer feedback lifecycle source file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS.length,
      LINE_MATCH_BOARD_HANDOFF_ITEM_IDS.length,
      GROUP_SORT_BOARD_HANDOFF_ITEM_IDS.length,
      MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS.length,
      LISTENING_SPEECH_HANDOFF_ITEM_IDS.length,
      OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
    ],
    Array.from({ length: 10 }, () => 30)
  );
});

test('product docs and answer matcher preserve accepted-answer policy', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Answer scoring is centralized[\s\S]*tolerant of case, spacing, and common\s+punctuation differences[\s\S]*Teachers can use `\/` or `;` inside an answer field[\s\S]*Accepted alternatives are revealed only in the post-submit review/,
    'docs/product.md should keep centralized scoring and accepted-answer policy.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Student review feedback should use[\s\S]*same shared presentation[\s\S]*quiz[\s\S]*fill-blank[\s\S]*listening[\s\S]*line-match[\s\S]*matching-pairs[\s\S]*group-sort[\s\S]*open-box/,
    'docs/product.md should require shared feedback across templates.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Accepted\s+alternatives must use the same parser as scoring and student post-submit\s+review/,
    'docs/product.md should keep teacher review aligned with scoring.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Result pages and CSV exports should share\s+assignment-domain formatting/,
    'docs/product.md should keep teacher results and CSV aligned with scoring.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /export function matchAnswer[\s\S]*normalizeAnswerForMatching\(submittedAnswer\)[\s\S]*getAcceptedAnswers\(expectedAnswer\)[\s\S]*correct: Boolean\(match && normalizedSubmittedAnswer\)/,
    'matchAnswer should use normalized submitted answers and accepted alternatives while rejecting blanks.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /split\(\/\\s\*\(\?:\\\/\|／\|;\|；\|、\)\\s\*\/u\)/,
    'Accepted-answer parsing should cover slash, semicolon, and Chinese separators.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /getUniqueAcceptedAnswers[\s\S]*normalizeAnswerForMatching\(displayValue\)[\s\S]*seen\.has\(normalized\)/,
    'Accepted answers should dedupe by normalized value.'
  );
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /normalizeAnswerForMatching[\s\S]*normalize\('NFKC'\)[\s\S]*toLocaleLowerCase\(\)/,
    'Answer normalization should cover NFKC and case.'
  );
  assert.match(ANSWER_MATCHING_SOURCE, /replace\(\/&\/gu, ' and '\)/);
  assert.match(
    ANSWER_MATCHING_SOURCE,
    /replace\(\/\[\.,!\?;:/,
    'Answer normalization should cover common punctuation.'
  );
  assert.equal(getAcceptedAnswers('Paris / Lutèce; 巴黎').length, 3);
  assert.equal(getAcceptedAnswers('left／right；中、英').length, 4);
  assert.deepEqual(getUniqueAcceptedAnswers(['Paris', ' paris ', '巴黎']), [
    'Paris',
    '巴黎',
  ]);
  assert.equal(
    matchAnswer({
      expectedAnswer: 'Tea & milk',
      submittedAnswer: 'tea and milk',
    }).correct,
    true
  );
  assert.equal(
    matchAnswer({ expectedAnswer: 'co-operate', submittedAnswer: 'co operate' })
      .correct,
    true
  );
  assert.equal(
    matchAnswer({ expectedAnswer: 'Paris', submittedAnswer: '   ' }).correct,
    false
  );
});

test('runtime scoring and server review summary use shared feedback evidence', () => {
  const runtimeItems = getRuntimeItems('quiz', ANSWER_FEEDBACK_CONTENT);
  const evaluation = evaluateRuntimeAnswers({
    answers: [
      { answer: 'paris', itemId: 'q1' },
      { answer: 'tea and milk', itemId: 'q2' },
    ],
    content: ANSWER_FEEDBACK_CONTENT,
    templateType: 'quiz',
  });
  const reviewSummary = buildPublicAttemptReviewSummaryView({
    answers: evaluation.answers,
    runtimeItems,
    showCorrectAnswers: true,
  });
  const hiddenReviewSummary = buildPublicAttemptReviewSummaryView({
    answers: evaluation.answers,
    runtimeItems,
    showCorrectAnswers: false,
  });

  assert.deepEqual(evaluation.result, {
    accuracy: 67,
    completedItemCount: 2,
    correctItemCount: 2,
    durationSeconds: undefined,
    earnedPoints: 2,
    totalPoints: 3,
  });
  assert.equal(reviewSummary.items.length, 3);
  assert.equal(reviewSummary.summary.hiddenBySettings, false);
  assert.equal(hiddenReviewSummary.items.length, 0);
  assert.equal(hiddenReviewSummary.summary.hiddenBySettings, true);
  assert.match(RUNTIME_SOURCE, /import \{ matchAnswer \}/);
  assert.match(
    RUNTIME_SOURCE,
    /evaluateRuntimeAnswers[\s\S]*getRuntimeItems\(templateType, content\)[\s\S]*normalizeRuntimeDisplayText\(answer\.answer\)[\s\S]*matchAnswer\(\{[\s\S]*expectedAnswer: item\.answer[\s\S]*submittedAnswer: submitted/
  );
  assert.match(
    RUNTIME_SOURCE,
    /correctItemCount[\s\S]*earnedPoints[\s\S]*totalPoints[\s\S]*accuracy[\s\S]*durationSeconds: normalizedDurationSeconds/
  );
  assert.match(
    DISTRACTORS_SOURCE,
    /buildQuestionChoices[\s\S]*question\.answer/,
    'Quiz choice completion should preserve the expected answer contract.'
  );
  assert.match(
    PUBLIC_SOURCE,
    /buildPublicAttemptReviewSummaryView[\s\S]*if \(!showCorrectAnswers\)[\s\S]*buildHiddenPublicAttemptReviewSummary[\s\S]*buildAttemptReviewItems/
  );
  assert.match(PUBLIC_SOURCE, /hiddenBySettings: !showCorrectAnswers/);
  assert.match(
    PUBLIC_SOURCE,
    /buildPublicAttemptReviewItem[\s\S]*getRuntimeDisplayAcceptedAnswers\(item\.answer\)[\s\S]*correctAnswer: normalizeRuntimeDisplayText/
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers[\s\S]*buildPublicAttemptReviewSummaryView\(\{[\s\S]*answers: evaluation\.answers[\s\S]*runtimeItems: orderedRuntimeItems[\s\S]*showCorrectAnswers: settings\.showCorrectAnswers/
  );
  assertNoPrivateFeedbackText(JSON.stringify(reviewSummary));
});

test('public feedback view and all template surfaces share feedback rendering', () => {
  const feedback = buildPublicAnswerFeedbackView({
    reviewItem: buildVisibleReviewItem(),
  });

  assert.equal(feedback.status, 'correct');
  assert.deepEqual(
    feedback.detailLines.map((line) => line.id),
    ['submitted-answer', 'correct-answer', 'accepted-answers', 'explanation']
  );
  assert.match(
    STUDENT_RUNNER_VIEW_SOURCE,
    /export type PublicAnswerFeedbackDetailLineId =[\s\S]*'accepted-answers'[\s\S]*'correct-answer'[\s\S]*'explanation'[\s\S]*'submitted-answer'[\s\S]*buildPublicAnswerFeedbackView[\s\S]*getPublicAnswerFeedbackStatus/
  );
  assert.match(
    PUBLIC_ANSWER_FEEDBACK_COMPONENT_SOURCE,
    /buildPublicAnswerFeedbackView\(\{[\s\S]*reviewItem[\s\S]*\}\)[\s\S]*data-feedback-detail=\{line\.id\}/
  );
  assert.doesNotMatch(
    PUBLIC_ANSWER_FEEDBACK_COMPONENT_SOURCE,
    /reviewItem\.itemId/,
    'Public feedback DOM should not derive ids from raw runtime item ids.'
  );
  for (const [label, source] of [
    ['choice-list', STUDENT_RUNTIME_ITEM_LIST_COMPONENT_SOURCE],
    ['fill-blank', FILL_BLANK_COMPONENT_SOURCE],
    ['line-match', LINE_MATCH_COMPONENT_SOURCE],
    ['group-sort', GROUP_SORT_COMPONENT_SOURCE],
    ['matching-pairs', MATCHING_PAIRS_COMPONENT_SOURCE],
    ['listening', LISTENING_COMPONENT_SOURCE],
    ['open-box', OPEN_BOX_COMPONENT_SOURCE],
  ] as const) {
    assert.match(
      source,
      /PublicAnswerFeedback[\s\S]*reviewItem=\{/,
      `${label} should render feedback through the shared component.`
    );
  }
});

test('teacher results, result answer text, and CSV export reuse feedback helpers', () => {
  const runtimeItems = getRuntimeItems('quiz', ANSWER_FEEDBACK_CONTENT);
  const evaluation = evaluateRuntimeAnswers({
    answers: [
      { answer: 'paris', itemId: 'q1' },
      { answer: 'tea and milk', itemId: 'q2' },
    ],
    content: ANSWER_FEEDBACK_CONTENT,
    templateType: 'quiz',
  });
  const analysis = analyzeAssignmentResults({
    attempts: [
      {
        anonymousToken: PRIVATE_TOKEN,
        answersJson: {
          answers: evaluation.answers,
          templateType: 'quiz',
        },
        completedAt: new Date('2026-07-10T00:00:00.000Z'),
        id: 'attempt-1',
        resultJson: evaluation.result,
        score: evaluation.result.earnedPoints,
        studentName: PRIVATE_STUDENT_NAME,
      },
    ],
    runtimeItems,
  });
  const correctAnswer = analysis.attempts
    .flatMap((attempt) => attempt.answers)
    .find((answer) => {
      return answer.correct && answer.submitted;
    }) ?? {
    acceptedAnswers: [],
    answer: '',
    correct: false,
    expectedAnswer: '',
    itemId: '',
    prompt: '',
    submitted: false,
  };
  const answerView = buildAssignmentResultAttemptAnswerTextView(correctAnswer);

  assert.equal(analysis.perItem[0]?.acceptedAnswers.length, 3);
  assert.equal(Boolean(answerView.expectedAnswerText), true);
  assert.equal(Boolean(answerView.optionalAcceptedAlternativesText), true);
  assert.equal(answerView.statusTone, 'correct');
  assert.match(
    RESULTS_SOURCE,
    /const acceptedAnswers = getResultAcceptedAnswers\(item\.answer\)[\s\S]*acceptedAnswers/
  );
  assert.match(RESULTS_SOURCE, /getRuntimeDisplayAcceptedAnswers\(answer\)/);
  assert.match(
    RESULT_ANSWER_VIEW_SOURCE,
    /buildAssignmentResultAcceptedAnswerView[\s\S]*formatPrimaryAcceptedAnswer[\s\S]*formatOptionalAcceptedAnswerAlternatives/
  );
  assert.match(
    RESULT_ANSWER_VIEW_SOURCE,
    /buildAssignmentResultAttemptAnswerTextView[\s\S]*buildAssignmentResultAcceptedAnswerView/
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /import \{ getUniqueAcceptedAnswers \} from '@\/activities\/answer-matching'/
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /formatPrimaryAcceptedAnswer[\s\S]*getDisplayAcceptedAnswerValues/
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /formatOptionalAcceptedAnswerAlternatives[\s\S]*getDisplayAcceptedAnswers/
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /getDisplayAcceptedAnswerValues[\s\S]*getUniqueAcceptedAnswers/
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultAttemptAnswerTextView\(answer\)/
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /buildAssignmentResultAttemptAnswerTextView\(answer,[\s\S]*answerView\.exportStudentAnswerText[\s\S]*answerView\.expectedAnswerText[\s\S]*answerView\.acceptedAlternativesText[\s\S]*formatAssignmentExportText\(answer\.explanation\)/
  );
  assertNoPrivateFeedbackText(JSON.stringify(answerView));
});

test('answer feedback lifecycle focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Answer feedback lifecycle chain has a fast script-level gate via[\s\S]*scripts\/answer-feedback-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the answer feedback lifecycle chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /accepted-answer parsing[\s\S]*answer normalization[\s\S]*runtime scoring[\s\S]*public post-submit feedback[\s\S]*template feedback surfaces[\s\S]*teacher result analysis[\s\S]*result answer text views[\s\S]*CSV answer columns[\s\S]*server review summaries[\s\S]*feedback privacy guards/,
    'TEST-CATALOG should describe the answer feedback lifecycle scope.'
  );
  assert.match(
    normalizedCatalog,
    /answer feedback handoff boundary/,
    'TEST-CATALOG should document the concrete answer feedback handoff boundary.'
  );
});

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

function buildVisibleReviewItem(): PublicAttemptReviewItem {
  return {
    acceptedAnswers: ['Paris', 'Lutèce', '巴黎'],
    correct: true,
    correctAnswer: 'Paris',
    explanation: 'Capital city accepted in multiple classroom languages.',
    itemId: 'q1',
    prompt: 'What is the capital of France?',
    submitted: true,
    submittedAnswer: 'paris',
  };
}

function getHandoffValue(
  view: AnswerFeedbackLifecycleChainHandoffView,
  id: AnswerFeedbackLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing answer feedback lifecycle chain item ${id}`);
  return item.value;
}

function assertNoPrivateFeedbackText(serialized: string) {
  for (const privateValue of [
    PRIVATE_PROMPT_TEXT,
    PRIVATE_RUNTIME_ID,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TEACHER_ANSWER,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
      `Answer feedback lifecycle chain leaked private text: ${privateValue}`
    );
  }
}
