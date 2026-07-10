export const ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS = [
  'product-explanation-policy',
  'activity-content-explanation-source',
  'public-payload-explanation-guard',
  'post-submit-explanation-policy',
  'runtime-display-normalization',
  'result-format-empty-value',
  'result-analysis-per-item-explanation',
  'result-analysis-attempt-review-explanation',
  'student-feedback-explanation-value',
  'student-feedback-explanation-line',
  'student-feedback-explanation-detail',
  'feedback-scope-explanation-count',
  'public-feedback-dom-detail',
  'item-card-explanation',
  'item-performance-explanation-column',
  'attempt-review-card-explanation',
  'attempt-review-card-handoff-lines',
  'item-review-summary-explanation',
  'copy-artifact-item-review',
  'csv-explanation-column',
  'csv-answer-row-explanation',
  'export-preparation-explanation-slice',
  'printable-answer-key-explanation',
  'printable-answer-key-detail-dom',
  'answer-feedback-chain-alignment',
  'teacher-results-chain-alignment',
  'scored-result-chain-alignment',
  'printable-review-chain-alignment',
  'explanation-privacy-guard',
  'explanation-chain-gate',
] as const;

export const ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/types.ts',
  'src/activities/runtime-display.ts',
  'src/assignments/runtime-display.ts',
  'src/assignments/result-format.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/student-runner-view.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/components/activities/public-answer-feedback.tsx',
  'src/components/assignments/assignment-results-item-analysis-card.tsx',
  'src/components/assignments/assignment-results-item-performance-table.tsx',
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/item-review-summary.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/results-export.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/answer-feedback-lifecycle-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/components/assignments/printable-worksheet-answer-key.tsx',
  'src/assignments/printable-worksheet-review-lifecycle-chain.ts',
  'scripts/answer-feedback-lifecycle-chain-handoff.test.ts',
  'scripts/assignment-results-export-preparation-handoff-semantic-views.test.ts',
  'scripts/assignment-attempt-review-card-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentResultExplanationChainHandoffItemId =
  (typeof ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentResultExplanationChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultExplanationChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentResultExplanationChainPrivacyContract = {
  chainSourceFileCount: number;
  copyArtifactsUseFormattedExplanations: true;
  csvExportsUseFormattedExplanations: true;
  exposesCsvDataUrlInHandoff: false;
  exposesPromptTextInHandoff: false;
  exposesRawRuntimeItemIdsInHandoff: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentNamesInHandoff: false;
  exposesTeacherExplanationTextInHandoff: false;
  itemIds: AssignmentResultExplanationChainHandoffItemId[];
  printableAnswerKeysUseFormattedExplanations: true;
  publicFeedbackRespectsAnswerReveal: true;
  resultPagesUseFormattedExplanations: true;
  sourceFiles: string[];
};

export type AssignmentResultExplanationChainHandoffView = {
  description: string;
  itemViews: AssignmentResultExplanationChainHandoffItemView[];
  privacy: AssignmentResultExplanationChainPrivacyContract;
  title: string;
};

export function buildAssignmentResultExplanationChainHandoffView(): AssignmentResultExplanationChainHandoffView {
  const itemViews = ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentResultExplanationChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice assignment result explanation chain from activity content and post-submit review policy through student feedback, teacher result cards, item review copy, CSV explanation columns, printable answer keys, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES.length,
      copyArtifactsUseFormattedExplanations: true,
      csvExportsUseFormattedExplanations: true,
      exposesCsvDataUrlInHandoff: false,
      exposesPromptTextInHandoff: false,
      exposesRawRuntimeItemIdsInHandoff: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentNamesInHandoff: false,
      exposesTeacherExplanationTextInHandoff: false,
      itemIds: [...ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS],
      printableAnswerKeysUseFormattedExplanations: true,
      publicFeedbackRespectsAnswerReveal: true,
      resultPagesUseFormattedExplanations: true,
      sourceFiles: [...ASSIGNMENT_RESULT_EXPLANATION_CHAIN_SOURCE_FILES],
    },
    title: 'Assignment result explanation chain',
  };
}

function buildAssignmentResultExplanationChainHandoffItemView(
  id: AssignmentResultExplanationChainHandoffItemId
): AssignmentResultExplanationChainHandoffItemView {
  const item = getAssignmentResultExplanationChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentResultExplanationChainHandoffItem(
  id: AssignmentResultExplanationChainHandoffItemId
): Omit<AssignmentResultExplanationChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-explanation-policy':
      return item(
        id,
        'Explanation policy',
        'Review after scoring',
        'Product policy keeps answer explanations out of public payloads until scored review allows them.'
      );
    case 'activity-content-explanation-source':
      return item(
        id,
        'Activity explanation source',
        'ActivityContent',
        'Teacher-authored answer explanations live in reusable activity content and assignment snapshots.'
      );
    case 'public-payload-explanation-guard':
      return item(
        id,
        'Public payload guard',
        'Hidden before review',
        'Sanitized public assignment payloads omit teacher-only answer explanations.'
      );
    case 'post-submit-explanation-policy':
      return item(
        id,
        'Post-submit policy',
        'Reveal if allowed',
        'Student feedback can include explanations only after scoring and answer-reveal policy allow review.'
      );
    case 'runtime-display-normalization':
      return item(
        id,
        'Display normalization',
        'Runtime display text',
        'Explanation text normalizes through runtime display helpers before result or feedback views use it.'
      );
    case 'result-format-empty-value':
      return item(
        id,
        'Result empty value',
        'Empty hidden',
        'Optional explanation fields collapse to empty/null instead of rendering stray placeholders.'
      );
    case 'result-analysis-per-item-explanation':
      return item(
        id,
        'Per-item explanation',
        'Item analysis',
        'Teacher item analysis carries normalized explanation notes from frozen runtime items.'
      );
    case 'result-analysis-attempt-review-explanation':
      return item(
        id,
        'Attempt review explanation',
        'Answer review',
        'Attempt review answers carry normalized explanations alongside expected answers and status.'
      );
    case 'student-feedback-explanation-value':
      return item(
        id,
        'Student feedback value',
        'Optional value',
        'Student feedback prepares explanation values through a public optional-value formatter.'
      );
    case 'student-feedback-explanation-line':
      return item(
        id,
        'Student feedback line',
        'Line when present',
        'Student feedback renders an explanation line only when normalized explanation text exists.'
      );
    case 'student-feedback-explanation-detail':
      return item(
        id,
        'Student feedback detail',
        'Detail item',
        'Public feedback detail lines include an explanation entry only after the line is prepared.'
      );
    case 'feedback-scope-explanation-count':
      return item(
        id,
        'Feedback scope count',
        'Explanation count',
        'Student feedback scope counts visible review items with explanations.'
      );
    case 'public-feedback-dom-detail':
      return item(
        id,
        'Public feedback DOM',
        'data-feedback-detail',
        'Public answer feedback renders prepared detail lines through labelled output elements.'
      );
    case 'item-card-explanation':
      return item(
        id,
        'Item card explanation',
        'Optional card note',
        'Teacher item analysis cards display normalized explanation text only when present.'
      );
    case 'item-performance-explanation-column':
      return item(
        id,
        'Performance explanation',
        'Explanation column',
        'The full item performance table uses prepared explanation text for its explanation column.'
      );
    case 'attempt-review-card-explanation':
      return item(
        id,
        'Review card explanation',
        'Optional card note',
        'Attempt review cards append normalized explanation text to card details only when present.'
      );
    case 'attempt-review-card-handoff-lines':
      return item(
        id,
        'Review handoff lines',
        'Line count',
        'Attempt review card handoff evidence counts prepared explanation lines without exposing the text.'
      );
    case 'item-review-summary-explanation':
      return item(
        id,
        'Item review summary',
        'Notes field',
        'Copied item review summaries format explanations as optional notes.'
      );
    case 'copy-artifact-item-review':
      return item(
        id,
        'Copy artifact',
        'Item review copy',
        'Result copy artifacts include the item review summary without exposing raw text in handoffs.'
      );
    case 'csv-explanation-column':
      return item(
        id,
        'CSV explanation column',
        'explanation',
        'CSV exports include a dedicated answer explanation column.'
      );
    case 'csv-answer-row-explanation':
      return item(
        id,
        'CSV answer row',
        'Formatted text',
        'CSV answer rows format explanation text through the same export text helper.'
      );
    case 'export-preparation-explanation-slice':
      return item(
        id,
        'Export explanation slice',
        'explanation-column',
        'The export preparation handoff keeps explanation columns visible as a stable slice.'
      );
    case 'printable-answer-key-explanation':
      return item(
        id,
        'Printable answer key',
        'Explanation detail',
        'Printable answer keys normalize explanations before creating teacher-only answer-key details.'
      );
    case 'printable-answer-key-detail-dom':
      return item(
        id,
        'Printable detail DOM',
        'Labelled output',
        'Printable answer-key details render prepared explanation labels through semantic output fields.'
      );
    case 'answer-feedback-chain-alignment':
      return item(
        id,
        'Feedback alignment',
        'Answer feedback',
        'Explanation visibility stays aligned with the answer feedback lifecycle chain.'
      );
    case 'teacher-results-chain-alignment':
      return item(
        id,
        'Teacher results alignment',
        'Results chain',
        'Explanation consumers remain part of the broader teacher results review chain.'
      );
    case 'scored-result-chain-alignment':
      return item(
        id,
        'Scored result alignment',
        'Scored attempts',
        'Explanations remain downstream of scored attempt result records and review payloads.'
      );
    case 'printable-review-chain-alignment':
      return item(
        id,
        'Printable alignment',
        'Printable review',
        'Printable answer-key explanations stay aligned with the review lifecycle handoff.'
      );
    case 'explanation-privacy-guard':
      return item(
        id,
        'Explanation privacy',
        'Raw data hidden',
        'Explanation handoffs omit prompt text, runtime ids, student answers, names, teacher explanation text, and CSV URLs.'
      );
    case 'explanation-chain-gate':
      return item(
        id,
        'Explanation gate',
        '30 source files',
        'A focused gate keeps explanation normalization, feedback, result review, copy, export, printable, and privacy connected.'
      );
  }
}

function item(
  id: AssignmentResultExplanationChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentResultExplanationChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
