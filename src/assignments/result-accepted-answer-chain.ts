export const ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS = [
  'product-accepted-answer-policy',
  'accepted-answer-parser-source',
  'accepted-answer-separators',
  'accepted-answer-unique-normalization',
  'accepted-answer-display-normalization',
  'result-format-source',
  'alternatives-empty-value',
  'alternatives-single-answer-empty',
  'alternatives-exclude-primary',
  'alternatives-localized-separator',
  'alternatives-custom-separator',
  'primary-answer-source',
  'optional-alternatives-null-empty',
  'result-answer-view-source',
  'expected-answer-text',
  'accepted-alternatives-text',
  'optional-alternatives-line',
  'attempt-answer-text-view',
  'analysis-per-item-accepted-answers',
  'analysis-attempt-review-accepted-answers',
  'item-card-accepted-line',
  'item-performance-accepted-column',
  'attempt-review-card-accepted-line',
  'csv-answer-view-consumer',
  'csv-accepted-answer-column',
  'export-preparation-alternatives-slice',
  'answer-feedback-chain-alignment',
  'scored-result-chain-alignment',
  'accepted-answer-privacy-guard',
  'result-review-handoff-boundary',
] as const;

export const ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/answer-matching.ts',
  'src/activities/runtime-display.ts',
  'src/assignments/runtime-display.ts',
  'src/assignments/result-format.ts',
  'src/assignments/result-answer-view.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results-export.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/answer-feedback-lifecycle-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/item-review-summary.ts',
  'src/assignments/classroom-brief.ts',
  'src/assignments/reteach-plan.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/assignments/printable-worksheet-review-lifecycle-chain.ts',
  'src/components/assignments/assignment-results-item-analysis-card.tsx',
  'src/components/assignments/assignment-results-item-performance-table.tsx',
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/components/assignments/printable-worksheet-answer-key.tsx',
  'scripts/assignment-results-export-preparation-handoff-semantic-views.test.ts',
  'scripts/assignment-attempt-review-card-handoff-semantic-views.test.ts',
  'scripts/scored-attempt-result-chain-handoff.test.ts',
  'scripts/answer-feedback-lifecycle-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentResultAcceptedAnswerChainHandoffItemId =
  (typeof ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentResultAcceptedAnswerChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultAcceptedAnswerChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentResultAcceptedAnswerChainPrivacyContract = {
  chainSourceFileCount: number;
  csvExportsUseSharedAnswerView: true;
  exposesCsvDataUrlInHandoff: false;
  exposesPromptTextInHandoff: false;
  exposesRawRuntimeItemIdsInHandoff: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentNamesInHandoff: false;
  exposesTeacherAnswerTextInHandoff: false;
  itemIds: AssignmentResultAcceptedAnswerChainHandoffItemId[];
  resultPagesUseSharedAnswerView: true;
  scoringUsesSharedAcceptedAnswerParser: true;
  sourceFiles: string[];
  splitsPrimaryFromAlternatives: true;
  usesResultReviewHandoff: true;
};

export type AssignmentResultAcceptedAnswerChainHandoffView = {
  description: string;
  itemViews: AssignmentResultAcceptedAnswerChainHandoffItemView[];
  privacy: AssignmentResultAcceptedAnswerChainPrivacyContract;
  title: string;
};

export function buildAssignmentResultAcceptedAnswerChainHandoffView(): AssignmentResultAcceptedAnswerChainHandoffView {
  const itemViews =
    ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
      buildAssignmentResultAcceptedAnswerChainHandoffItemView(id)
    );

  return {
    description:
      'Thirty-slice assignment result accepted-answer chain from shared answer parsing and display normalization through result cards, item performance tables, attempt review cards, CSV accepted-answer columns, printable review handoffs, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES.length,
      csvExportsUseSharedAnswerView: true,
      exposesCsvDataUrlInHandoff: false,
      exposesPromptTextInHandoff: false,
      exposesRawRuntimeItemIdsInHandoff: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentNamesInHandoff: false,
      exposesTeacherAnswerTextInHandoff: false,
      itemIds: [...ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS],
      resultPagesUseSharedAnswerView: true,
      scoringUsesSharedAcceptedAnswerParser: true,
      sourceFiles: [...ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_SOURCE_FILES],
      splitsPrimaryFromAlternatives: true,
      usesResultReviewHandoff: true,
    },
    title: 'Assignment result accepted-answer chain',
  };
}

function buildAssignmentResultAcceptedAnswerChainHandoffItemView(
  id: AssignmentResultAcceptedAnswerChainHandoffItemId
): AssignmentResultAcceptedAnswerChainHandoffItemView {
  const item = getAssignmentResultAcceptedAnswerChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentResultAcceptedAnswerChainHandoffItem(
  id: AssignmentResultAcceptedAnswerChainHandoffItemId
): Omit<
  AssignmentResultAcceptedAnswerChainHandoffItemView,
  'ariaLabel' | 'id'
> {
  switch (id) {
    case 'product-accepted-answer-policy':
      return item(
        id,
        'Accepted-answer policy',
        'Shared result formatting',
        'Product policy keeps result pages and CSV exports on assignment-domain accepted-answer formatting.'
      );
    case 'accepted-answer-parser-source':
      return item(
        id,
        'Parser source',
        'answer-matching.ts',
        'Accepted alternatives come from the shared answer-matching parser used by scoring.'
      );
    case 'accepted-answer-separators':
      return item(
        id,
        'Parser separators',
        'Slash/semicolon/Chinese',
        'Accepted answers split on slash, full-width slash, semicolon, Chinese semicolon, and ideographic comma.'
      );
    case 'accepted-answer-unique-normalization':
      return item(
        id,
        'Unique normalization',
        'Normalized dedupe',
        'Accepted alternatives dedupe by normalized matching value while preserving display text.'
      );
    case 'accepted-answer-display-normalization':
      return item(
        id,
        'Display normalization',
        'Runtime display text',
        'Accepted-answer display values go through runtime display normalization before rendering or export.'
      );
    case 'result-format-source':
      return item(
        id,
        'Result format source',
        'result-format.ts',
        'Primary answer and accepted-alternative formatting live in the shared result-format module.'
      );
    case 'alternatives-empty-value':
      return item(
        id,
        'Alternatives empty value',
        'Empty value',
        'Missing accepted alternatives render through the result empty value for teacher-facing displays.'
      );
    case 'alternatives-single-answer-empty':
      return item(
        id,
        'Single answer alternatives',
        'No alternatives',
        'A single accepted answer produces no alternative line or extra CSV alternative text.'
      );
    case 'alternatives-exclude-primary':
      return item(
        id,
        'Exclude primary',
        'Primary split',
        'Result answer views split the first accepted answer from optional alternatives.'
      );
    case 'alternatives-localized-separator':
      return item(
        id,
        'Localized separator',
        'Locale aware',
        'Accepted-answer alternatives use the localized result separator by default.'
      );
    case 'alternatives-custom-separator':
      return item(
        id,
        'Custom separator',
        'Caller override',
        'Callers can pass a separator for export or copy contexts without changing parser output.'
      );
    case 'primary-answer-source':
      return item(
        id,
        'Primary answer source',
        'First accepted answer',
        'Expected-answer text comes from the first normalized accepted answer.'
      );
    case 'optional-alternatives-null-empty':
      return item(
        id,
        'Optional alternatives',
        'Null when empty',
        'Optional accepted-answer lines return null when no real alternatives exist.'
      );
    case 'result-answer-view-source':
      return item(
        id,
        'Answer view source',
        'result-answer-view.ts',
        'Result pages and CSV exports consume a shared accepted-answer text view.'
      );
    case 'expected-answer-text':
      return item(
        id,
        'Expected answer text',
        'Primary answer',
        'The answer view exposes expected-answer text separately from alternatives.'
      );
    case 'accepted-alternatives-text':
      return item(
        id,
        'Accepted alternatives text',
        'Alternatives only',
        'The answer view exposes accepted alternatives without repeating the primary answer.'
      );
    case 'optional-alternatives-line':
      return item(
        id,
        'Optional alternatives line',
        'Line when present',
        'Review cards render an accepted-answer line only when alternatives exist.'
      );
    case 'attempt-answer-text-view':
      return item(
        id,
        'Attempt answer text view',
        'Shared attempt view',
        'Attempt answer text combines student answer, expected answer, alternatives, and status through one helper.'
      );
    case 'analysis-per-item-accepted-answers':
      return item(
        id,
        'Per-item analysis',
        'Accepted answers retained',
        'Item performance analysis carries accepted answers from frozen runtime items.'
      );
    case 'analysis-attempt-review-accepted-answers':
      return item(
        id,
        'Attempt review analysis',
        'Accepted answers retained',
        'Attempt review rows carry accepted answers for every runtime item.'
      );
    case 'item-card-accepted-line':
      return item(
        id,
        'Item card line',
        'Optional line',
        'Reteach item cards show accepted alternatives only when the shared answer view provides them.'
      );
    case 'item-performance-accepted-column':
      return item(
        id,
        'Performance column',
        'Accepted column',
        'The full item performance table uses the shared alternatives text for its accepted-answer column.'
      );
    case 'attempt-review-card-accepted-line':
      return item(
        id,
        'Review card line',
        'Optional line',
        'Attempt review cards reuse the shared optional accepted-alternatives line.'
      );
    case 'csv-answer-view-consumer':
      return item(
        id,
        'CSV answer view',
        'Shared answer view',
        'CSV answer rows consume the same answer text view as result pages.'
      );
    case 'csv-accepted-answer-column':
      return item(
        id,
        'CSV accepted column',
        'accepted answers',
        'CSV export rows include an accepted-answer alternatives column from the shared view.'
      );
    case 'export-preparation-alternatives-slice':
      return item(
        id,
        'Export alternatives slice',
        'accepted-alternatives',
        'The export preparation handoff keeps accepted-answer columns visible as a stable slice.'
      );
    case 'answer-feedback-chain-alignment':
      return item(
        id,
        'Feedback chain alignment',
        'Answer feedback',
        'Accepted-answer formatting remains downstream of the shared answer feedback lifecycle.'
      );
    case 'scored-result-chain-alignment':
      return item(
        id,
        'Scored result alignment',
        'Scored attempts',
        'Accepted-answer result views remain downstream of scored attempt result records.'
      );
    case 'accepted-answer-privacy-guard':
      return item(
        id,
        'Accepted-answer privacy',
        'Raw data hidden',
        'Accepted-answer handoffs omit prompt text, raw runtime ids, student answers, student names, teacher answers, and CSV URLs.'
      );
    case 'result-review-handoff-boundary':
      return item(
        id,
        'Result review handoff',
        '30 review slices',
        'Accepted-answer formatting stays connected to result review status, controls, matched scope, copy previews, export actions, route state, and privacy.'
      );
  }
}

function item(
  id: AssignmentResultAcceptedAnswerChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentResultAcceptedAnswerChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
