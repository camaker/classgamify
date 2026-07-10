export const ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-submitted-date-policy',
  'result-format-source',
  'ui-date-empty-value',
  'ui-date-invalid-guard',
  'ui-date-locale-option',
  'ui-date-timezone-option',
  'csv-date-source',
  'csv-date-empty-value',
  'csv-date-invalid-guard',
  'csv-date-iso-output',
  'attempt-row-submitted-label',
  'attempt-review-card-submitted-label',
  'student-summary-last-submitted',
  'latest-attempt-completed-at',
  'follow-up-last-submitted-context',
  'attempt-review-sort-timestamp',
  'attempt-row-sort-timestamp',
  'student-summary-sort-timestamp',
  'review-scope-submitted-at',
  'copy-artifact-latest-attempt',
  'copy-artifact-follow-up-context',
  'csv-attempt-submitted-column',
  'csv-student-last-submitted-column',
  'export-preparation-date-slice',
  'result-view-format-consumer',
  'results-export-format-consumer',
  'teacher-results-chain-alignment',
  'scored-result-chain-alignment',
  'submitted-date-privacy-guard',
  'submitted-date-chain-gate',
] as const;

export const ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/result-format.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-filters.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/result-copy-format.ts',
  'src/assignments/student-follow-up-summary.ts',
  'src/assignments/student-follow-up-priority.ts',
  'src/assignments/classroom-brief.ts',
  'src/assignments/reteach-plan.ts',
  'src/assignments/item-review-summary.ts',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/components/assignments/assignment-results-attempts-table.tsx',
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'src/components/assignments/assignment-results-student-summary-table.tsx',
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'src/components/assignments/assignment-results-review-scope-panel.tsx',
  'src/components/assignments/assignment-results-review-status-panel.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'scripts/assignment-results-export-preparation-handoff-semantic-views.test.ts',
  'scripts/assignment-student-summary-sort-handoff-semantic-views.test.ts',
  'scripts/assignment-copy-artifact-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentResultSubmittedDateChainHandoffItemId =
  (typeof ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentResultSubmittedDateChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultSubmittedDateChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentResultSubmittedDateChainPrivacyContract = {
  chainSourceFileCount: number;
  copyArtifactsUseFormattedDates: true;
  csvDatesUseIsoFormatter: true;
  exportIncludesSubmittedDateColumns: true;
  exposesCsvDataUrlInHandoff: false;
  exposesRawAnonymousTokensInHandoff: false;
  exposesRawCompletedAtValuesInHandoff: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentLabelsInHandoff: false;
  exposesStudentNamesInHandoff: false;
  itemIds: AssignmentResultSubmittedDateChainHandoffItemId[];
  preservesTeacherOnlyResultScope: true;
  sortingUsesTimestampParsing: true;
  sourceFiles: string[];
  uiDatesUseLocalizedFormatter: true;
};

export type AssignmentResultSubmittedDateChainHandoffView = {
  description: string;
  itemViews: AssignmentResultSubmittedDateChainHandoffItemView[];
  privacy: AssignmentResultSubmittedDateChainPrivacyContract;
  title: string;
};

export function buildAssignmentResultSubmittedDateChainHandoffView(): AssignmentResultSubmittedDateChainHandoffView {
  const itemViews = ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentResultSubmittedDateChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice assignment result submitted-date chain from shared result date formatters through result rows, review cards, student summaries, copy artifacts, completed-at sorting, CSV submitted-date columns, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES.length,
      copyArtifactsUseFormattedDates: true,
      csvDatesUseIsoFormatter: true,
      exportIncludesSubmittedDateColumns: true,
      exposesCsvDataUrlInHandoff: false,
      exposesRawAnonymousTokensInHandoff: false,
      exposesRawCompletedAtValuesInHandoff: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentLabelsInHandoff: false,
      exposesStudentNamesInHandoff: false,
      itemIds: [...ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS],
      preservesTeacherOnlyResultScope: true,
      sortingUsesTimestampParsing: true,
      sourceFiles: [...ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES],
      uiDatesUseLocalizedFormatter: true,
    },
    title: 'Assignment result submitted-date chain',
  };
}

function buildAssignmentResultSubmittedDateChainHandoffItemView(
  id: AssignmentResultSubmittedDateChainHandoffItemId
): AssignmentResultSubmittedDateChainHandoffItemView {
  const item = getAssignmentResultSubmittedDateChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentResultSubmittedDateChainHandoffItem(
  id: AssignmentResultSubmittedDateChainHandoffItemId
): Omit<AssignmentResultSubmittedDateChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-submitted-date-policy':
      return item(
        id,
        'Submitted date policy',
        'Shared result formatting',
        'Product policy keeps result pages and CSV exports on assignment-domain submitted-date formatting.'
      );
    case 'result-format-source':
      return item(
        id,
        'Result format source',
        'result-format.ts',
        'UI and CSV submitted-date helpers live in the shared result-format module.'
      );
    case 'ui-date-empty-value':
      return item(
        id,
        'UI empty date',
        'Empty value',
        'Missing submitted dates render through the result empty value instead of ad hoc table text.'
      );
    case 'ui-date-invalid-guard':
      return item(
        id,
        'UI invalid date',
        'Invalid hidden',
        'Invalid submitted date inputs fall back to the same empty result value.'
      );
    case 'ui-date-locale-option':
      return item(
        id,
        'UI locale option',
        'Locale aware',
        'Teacher-facing submitted-date labels can use an explicit Intl locale.'
      );
    case 'ui-date-timezone-option':
      return item(
        id,
        'UI timezone option',
        'Timezone aware',
        'Teacher-facing submitted-date labels can use an explicit Intl time zone.'
      );
    case 'csv-date-source':
      return item(
        id,
        'CSV date source',
        'CSV formatter',
        'CSV submitted-date columns use the assignment result CSV date helper.'
      );
    case 'csv-date-empty-value':
      return item(
        id,
        'CSV empty date',
        'Blank cell',
        'Missing submitted dates export as blank CSV cells.'
      );
    case 'csv-date-invalid-guard':
      return item(
        id,
        'CSV invalid date',
        'Blank cell',
        'Invalid submitted dates export as blank CSV cells.'
      );
    case 'csv-date-iso-output':
      return item(
        id,
        'CSV ISO date',
        'ISO string',
        'Valid CSV submitted dates export as ISO strings for gradebooks.'
      );
    case 'attempt-row-submitted-label':
      return item(
        id,
        'Attempt row submitted',
        'Table label',
        'Teacher attempt rows use the shared UI date formatter for submitted labels.'
      );
    case 'attempt-review-card-submitted-label':
      return item(
        id,
        'Review card submitted',
        'Card label',
        'Answer review cards use the same submitted-date label as attempt rows.'
      );
    case 'student-summary-last-submitted':
      return item(
        id,
        'Student last submitted',
        'Summary label',
        'Student summary rows format last-submitted dates through the shared helper.'
      );
    case 'latest-attempt-completed-at':
      return item(
        id,
        'Latest attempt date',
        'Latest attempt',
        'Student follow-up latest-attempt context formats completed-at dates once.'
      );
    case 'follow-up-last-submitted-context':
      return item(
        id,
        'Follow-up submitted',
        'Last submitted',
        'Follow-up copy falls back to a formatted last-submitted context when no latest attempt line is present.'
      );
    case 'attempt-review-sort-timestamp':
      return item(
        id,
        'Review sort timestamp',
        'Parsed timestamp',
        'Attempt review sorting compares parsed completed-at timestamps.'
      );
    case 'attempt-row-sort-timestamp':
      return item(
        id,
        'Attempt row timestamp',
        'Parsed timestamp',
        'Attempt table sorting uses the same completed-at timestamp comparator.'
      );
    case 'student-summary-sort-timestamp':
      return item(
        id,
        'Student sort timestamp',
        'Last submitted',
        'Student summary sorting can order by latest submitted timestamp.'
      );
    case 'review-scope-submitted-at':
      return item(
        id,
        'Review submitted scope',
        'Scoped attempts',
        'Review-scope counts preserve completed attempt rows before copy actions run.'
      );
    case 'copy-artifact-latest-attempt':
      return item(
        id,
        'Copy latest attempt',
        'Formatted copy',
        'Copy artifacts reuse formatted latest-attempt submitted-date context.'
      );
    case 'copy-artifact-follow-up-context':
      return item(
        id,
        'Copy follow-up date',
        'Formatted copy',
        'Student follow-up copy uses formatted submitted context without raw timestamps.'
      );
    case 'csv-attempt-submitted-column':
      return item(
        id,
        'CSV attempt submitted',
        'attempt submitted_at',
        'The full export includes the attempt submitted-at column from stored attempts.'
      );
    case 'csv-student-last-submitted-column':
      return item(
        id,
        'CSV student submitted',
        'student last submitted',
        'The full export includes the student last-submitted column from summaries.'
      );
    case 'export-preparation-date-slice':
      return item(
        id,
        'Export date slice',
        'submitted-date-format',
        'The export preparation handoff keeps submitted-date formatting visible as a stable slice.'
      );
    case 'result-view-format-consumer':
      return item(
        id,
        'Result view consumer',
        'UI formatter',
        'Result-page tables, cards, and summaries consume the shared UI date formatter.'
      );
    case 'results-export-format-consumer':
      return item(
        id,
        'Export consumer',
        'CSV formatter',
        'CSV rows consume the shared CSV date formatter for attempts and students.'
      );
    case 'teacher-results-chain-alignment':
      return item(
        id,
        'Teacher results alignment',
        'Results chain',
        'Submitted-date formatting stays aligned with the broader teacher results review chain.'
      );
    case 'scored-result-chain-alignment':
      return item(
        id,
        'Scored result alignment',
        'Scored attempts',
        'Submitted-date consumers remain downstream of scored attempt result records.'
      );
    case 'submitted-date-privacy-guard':
      return item(
        id,
        'Submitted date privacy',
        'Raw data hidden',
        'Submitted-date handoffs omit raw completed-at values, names, labels, tokens, answers, and CSV URLs.'
      );
    case 'submitted-date-chain-gate':
      return item(
        id,
        'Submitted date gate',
        '30 source files',
        'A focused gate keeps submitted-date formatters, result consumers, copy artifacts, CSV columns, and privacy aligned.'
      );
  }
}

function item(
  id: AssignmentResultSubmittedDateChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentResultSubmittedDateChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
