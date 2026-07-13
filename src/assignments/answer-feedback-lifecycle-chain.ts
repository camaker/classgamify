export const ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-scoring-policy',
  'accepted-answer-parser',
  'answer-normalization',
  'separator-coverage',
  'unique-alternative-dedup',
  'blank-answer-guard',
  'runtime-item-source',
  'template-runner-map',
  'quiz-choice-completion',
  'runtime-scoring-evaluation',
  'submitted-answer-normalization',
  'scored-result-metrics',
  'public-review-policy',
  'public-feedback-view',
  'feedback-dom-semantics',
  'template-feedback-surfaces',
  'fill-blank-feedback-boundary',
  'line-match-feedback-boundary',
  'group-sort-feedback-boundary',
  'matching-pairs-feedback-boundary',
  'listening-feedback-boundary',
  'open-box-feedback-boundary',
  'teacher-analysis-feedback',
  'result-answer-text-view',
  'result-formatting-shared',
  'csv-export-feedback',
  'server-review-summary',
  'teacher-results-chain-alignment',
  'feedback-privacy-guard',
  'answer-feedback-handoff-boundary',
] as const;

export const ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/answer-matching.ts',
  'src/activities/runtime.ts',
  'src/activities/runtime-display.ts',
  'src/activities/distractors.ts',
  'src/assignments/public.ts',
  'src/assignments/student-runner-view.ts',
  'src/components/activities/public-answer-feedback.tsx',
  'src/components/activities/student-runtime-item-list.tsx',
  'src/components/activities/fill-blank-worksheet.tsx',
  'src/components/activities/line-match-board.tsx',
  'src/components/activities/group-sort-board.tsx',
  'src/components/activities/matching-pairs-board.tsx',
  'src/components/activities/listening-runner.tsx',
  'src/components/activities/open-box-runner.tsx',
  'src/assignments/fill-blank-worksheet-handoff.ts',
  'src/assignments/line-match-board-handoff.ts',
  'src/assignments/group-sort-board-handoff.ts',
  'src/assignments/matching-pairs-board-handoff.ts',
  'src/assignments/listening-speech-handoff.ts',
  'src/assignments/open-box-reveal-handoff.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/result-answer-view.ts',
  'src/assignments/result-format.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results-export.ts',
  'src/api/assignments.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AnswerFeedbackLifecycleChainHandoffItemId =
  (typeof ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AnswerFeedbackLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AnswerFeedbackLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type AnswerFeedbackLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAcceptedAlternativesAfterReview: true;
  exposesAnonymousTokenInFeedbackHandoff: false;
  exposesAnswerKeysBeforeReview: false;
  exposesPromptTextInFeedbackHandoff: false;
  exposesRawRuntimeItemIdsInFeedbackHandoff: false;
  exposesStudentAnswerTextInFeedbackHandoff: false;
  exposesStudentNamesInFeedbackHandoff: false;
  exposesTeacherExplanationsBeforeReview: false;
  exposesTeacherOnlyAnswerTextInFeedbackHandoff: false;
  itemIds: AnswerFeedbackLifecycleChainHandoffItemId[];
  mutatesAttempts: false;
  preservesTeacherResultEvidence: true;
  publicFeedbackRespectsAnswerReveal: true;
  runtimeScoringUsesSharedMatcher: true;
  sourceFiles: string[];
  templateFeedbackUsesSharedComponent: true;
  usesAnswerFeedbackHandoff: true;
  usesSharedAcceptedAnswerParser: true;
  usesSharedFeedbackViews: true;
};

export type AnswerFeedbackLifecycleChainHandoffView = {
  description: string;
  itemViews: AnswerFeedbackLifecycleChainHandoffItemView[];
  privacy: AnswerFeedbackLifecycleChainPrivacyContract;
  title: string;
};

export function buildAnswerFeedbackLifecycleChainHandoffView(): AnswerFeedbackLifecycleChainHandoffView {
  const itemViews = ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildAnswerFeedbackLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice answer scoring and feedback lifecycle chain from accepted-answer parsing and normalized runtime scoring through public post-submit feedback, template feedback surfaces, teacher result analysis, CSV export, and privacy guards.',
    itemViews,
    privacy: {
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
      itemIds: [...ANSWER_FEEDBACK_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      mutatesAttempts: false,
      preservesTeacherResultEvidence: true,
      publicFeedbackRespectsAnswerReveal: true,
      runtimeScoringUsesSharedMatcher: true,
      sourceFiles: [...ANSWER_FEEDBACK_LIFECYCLE_CHAIN_SOURCE_FILES],
      templateFeedbackUsesSharedComponent: true,
      usesAnswerFeedbackHandoff: true,
      usesSharedAcceptedAnswerParser: true,
      usesSharedFeedbackViews: true,
    },
    title: 'Answer feedback lifecycle chain',
  };
}

function buildAnswerFeedbackLifecycleChainHandoffItemView(
  id: AnswerFeedbackLifecycleChainHandoffItemId
): AnswerFeedbackLifecycleChainHandoffItemView {
  const item = getAnswerFeedbackLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAnswerFeedbackLifecycleChainHandoffItem(
  id: AnswerFeedbackLifecycleChainHandoffItemId
): Omit<AnswerFeedbackLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-scoring-policy':
      return item(
        id,
        'Product scoring policy',
        'Shared scoring',
        'Answer scoring, accepted alternatives, student feedback, teacher results, and exports use one assignment-domain scoring model.'
      );
    case 'accepted-answer-parser':
      return item(
        id,
        'Accepted answer parser',
        'getAcceptedAnswers',
        'Expected answers split into accepted alternatives through the shared answer-matching helper.'
      );
    case 'answer-normalization':
      return item(
        id,
        'Answer normalization',
        'NFKC + punctuation',
        'Submitted and accepted answers normalize case, spacing, punctuation, apostrophes, and ampersands before matching.'
      );
    case 'separator-coverage':
      return item(
        id,
        'Separator coverage',
        'Slash/semicolon/Chinese',
        'Accepted-answer parsing supports slash, full-width slash, semicolon, Chinese semicolon, and ideographic comma separators.'
      );
    case 'unique-alternative-dedup':
      return item(
        id,
        'Unique alternative dedup',
        'Normalized unique',
        'Alternative answers dedupe by normalized value while preserving display text for review.'
      );
    case 'blank-answer-guard':
      return item(
        id,
        'Blank answer guard',
        'Blank is incorrect',
        'Blank or whitespace-only submissions cannot match an accepted answer.'
      );
    case 'runtime-item-source':
      return item(
        id,
        'Runtime item source',
        'Questions/pairs/groups',
        'Runtime items come from questions, pairs, and group items without creating template-specific answer tables.'
      );
    case 'template-runner-map':
      return item(
        id,
        'Template runner map',
        'Seven runners',
        'Quiz, match-up, fill-blank, line-match, group-sort, matching-pairs, listening, and open-box map to shared runner kinds.'
      );
    case 'quiz-choice-completion':
      return item(
        id,
        'Quiz choice completion',
        'Deterministic choices',
        'Quiz runtime can complete missing choices deterministically without changing the answer contract.'
      );
    case 'runtime-scoring-evaluation':
      return item(
        id,
        'Runtime scoring evaluation',
        'evaluateRuntimeAnswers',
        'Runtime evaluation scores submitted answers with the shared matcher for every runtime item.'
      );
    case 'submitted-answer-normalization':
      return item(
        id,
        'Submitted answer normalization',
        'Display text',
        'Submitted answer text normalizes before scoring and before public or teacher feedback views consume it.'
      );
    case 'scored-result-metrics':
      return item(
        id,
        'Scored result metrics',
        'Accuracy/points/completed',
        'Scored attempts compute correct count, completed count, earned points, total points, accuracy, and duration.'
      );
    case 'public-review-policy':
      return item(
        id,
        'Public review policy',
        'Reveal if allowed',
        'Public review items are built only after scoring and are hidden when answer reveal is disabled.'
      );
    case 'public-feedback-view':
      return item(
        id,
        'Public feedback view',
        'Shared feedback view',
        'Student post-submit feedback renders submitted answer, correct answer, accepted alternatives, explanation, and status from one view model.'
      );
    case 'feedback-dom-semantics':
      return item(
        id,
        'Feedback DOM semantics',
        'Label/value/details',
        'Public feedback DOM keeps stable label, value, description, and detail relationships without runtime ids.'
      );
    case 'template-feedback-surfaces':
      return item(
        id,
        'Template feedback surfaces',
        'Shared component',
        'Choice list, fill-blank, line-match, group-sort, matching-pairs, listening, and open-box surfaces reuse public answer feedback.'
      );
    case 'fill-blank-feedback-boundary':
      return item(
        id,
        'Fill-blank feedback boundary',
        'Blank review',
        'Fill-blank worksheet feedback follows the shared accepted-answer and explanation visibility policy.'
      );
    case 'line-match-feedback-boundary':
      return item(
        id,
        'Line-match feedback boundary',
        'Connection review',
        'Line-match board feedback follows the shared accepted-answer and explanation visibility policy.'
      );
    case 'group-sort-feedback-boundary':
      return item(
        id,
        'Group-sort feedback boundary',
        'Category review',
        'Group-sort board feedback follows the shared accepted-answer and explanation visibility policy.'
      );
    case 'matching-pairs-feedback-boundary':
      return item(
        id,
        'Matching-pairs feedback boundary',
        'Pair review',
        'Matching-pairs board feedback follows the shared accepted-answer and explanation visibility policy.'
      );
    case 'listening-feedback-boundary':
      return item(
        id,
        'Listening feedback boundary',
        'Transcript review',
        'Listening feedback follows the shared accepted-answer and explanation visibility policy after submission.'
      );
    case 'open-box-feedback-boundary':
      return item(
        id,
        'Open-box feedback boundary',
        'Reveal review',
        'Open-box feedback follows the shared accepted-answer and explanation visibility policy.'
      );
    case 'teacher-analysis-feedback':
      return item(
        id,
        'Teacher analysis feedback',
        'Accepted answers retained',
        'Teacher result analysis carries expected answers, accepted alternatives, explanations, submitted answers, and correctness.'
      );
    case 'result-answer-text-view':
      return item(
        id,
        'Result answer text view',
        'Expected/alternatives',
        'Teacher answer review text splits primary expected answers from optional accepted alternatives.'
      );
    case 'result-formatting-shared':
      return item(
        id,
        'Result formatting shared',
        'Shared accepted formatting',
        'Result pages, review cards, printable views, and exports reuse shared accepted-answer formatting helpers.'
      );
    case 'csv-export-feedback':
      return item(
        id,
        'CSV export feedback',
        'Answer columns',
        'CSV export rows include submitted answer, expected answer, accepted alternatives, correctness, and explanations.'
      );
    case 'server-review-summary':
      return item(
        id,
        'Server review summary',
        'Scored review payload',
        'The submit-attempt API returns public review summary items from the scored evaluation and ordered runtime items.'
      );
    case 'teacher-results-chain-alignment':
      return item(
        id,
        'Teacher results chain alignment',
        'Results chain',
        'Answer feedback remains aligned with the teacher results review chain and its export/copy boundaries.'
      );
    case 'feedback-privacy-guard':
      return item(
        id,
        'Feedback privacy guard',
        'Private data hidden',
        'Feedback lifecycle handoffs hide prompts, raw runtime ids, student answers, student names, tokens, and teacher-only answers before review.'
      );
    case 'answer-feedback-handoff-boundary':
      return item(
        id,
        'Answer feedback handoff boundary',
        '30 feedback handoff slices',
        'Accepted-answer parser evidence, separator and normalization coverage, runtime scoring metrics, public review visibility, student feedback details, teacher analysis, CSV answer views, and feedback privacy guards stay aligned.'
      );
  }
}

function item(
  id: AnswerFeedbackLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AnswerFeedbackLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
