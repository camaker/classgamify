export const PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'result-page-print-action',
  'prepared-print-link',
  'print-route-auth-boundary',
  'print-route-noindex',
  'robots-print-disallow',
  'answer-key-search-parser',
  'answer-key-search-builder',
  'worksheet-query-key',
  'owner-scoped-print-api',
  'snapshot-source-resolution',
  'delivery-policy-printing',
  'share-path-printing',
  'runtime-item-order',
  'response-policy-map',
  'printable-item-mapping',
  'choice-bank-policy',
  'writing-area-policy',
  'assignment-field-handoff',
  'preparation-summary',
  'header-overview-chips',
  'answer-key-hidden-state',
  'answer-key-included-state',
  'answer-key-unavailable-state',
  'answer-key-detail-boundary',
  'toolbar-toggle-boundary',
  'print-action-boundary',
  'results-return-action',
  'result-export-alignment',
  'worksheet-delivery-chain-alignment',
  'printable-review-lifecycle-gate',
] as const;

export const PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/assignments.ts',
  'src/hooks/use-assignments.ts',
  'src/routes/print/assignments/$assignmentId.tsx',
  'src/routes/__root.tsx',
  'src/seo/public-routes.ts',
  'src/seo/public-indexing.ts',
  'src/lib/routes.ts',
  'src/assignments/printable-worksheet.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-actions.ts',
  'src/assignments/results-export.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/item-order.ts',
  'src/assignments/runtime-display.ts',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/components/assignments/printable-worksheet-toolbar.tsx',
  'src/components/assignments/printable-worksheet-header.tsx',
  'src/components/assignments/printable-worksheet-preparation-summary.tsx',
  'src/components/assignments/printable-worksheet-assignment-fields.tsx',
  'src/components/assignments/printable-worksheet-item-list.tsx',
  'src/components/assignments/printable-worksheet-answer-key.tsx',
  'src/components/assignments/printable-worksheet-handoff.tsx',
  'scripts/printable-worksheet-handoff-semantic-views.test.ts',
  'scripts/worksheet-mode-delivery-chain-handoff.test.ts',
  'scripts/assignment-results-export-preparation-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type PrintableWorksheetReviewLifecycleChainHandoffItemId =
  (typeof PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type PrintableWorksheetReviewLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PrintableWorksheetReviewLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type PrintableWorksheetReviewLifecycleChainPrivacyContract = {
  answerKeyHiddenByDefault: true;
  chainSourceFileCount: number;
  changesAttemptsOrResults: false;
  changesPublicRunner: false;
  exposesAnswerKeyTextInHandoff: false;
  exposesChoiceTextInHandoff: false;
  exposesPromptTextInHandoff: false;
  exposesRawAnonymousTokens: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentResponseTextInHandoff: false;
  itemIds: PrintableWorksheetReviewLifecycleChainHandoffItemId[];
  requiresAuthenticatedTeacher: true;
  requiresAssignmentSnapshot: true;
  requiresOwnerScopedAssignment: true;
  sourceFiles: string[];
  usesSharedDeliveryPolicy: true;
  usesSharedRuntimeItems: true;
};

export type PrintableWorksheetReviewLifecycleChainHandoffView = {
  description: string;
  itemViews: PrintableWorksheetReviewLifecycleChainHandoffItemView[];
  privacy: PrintableWorksheetReviewLifecycleChainPrivacyContract;
  title: string;
};

export function buildPrintableWorksheetReviewLifecycleChainHandoffView(): PrintableWorksheetReviewLifecycleChainHandoffView {
  const itemViews =
    PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
      buildPrintableWorksheetReviewLifecycleChainHandoffItemView(id)
    );

  return {
    description:
      'Thirty-slice printable worksheet review lifecycle chain from the teacher result-page print action through authenticated noindex handouts, frozen snapshot worksheet rendering, answer-key access states, return-to-results, and export alignment.',
    itemViews,
    privacy: {
      answerKeyHiddenByDefault: true,
      chainSourceFileCount:
        PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      changesAttemptsOrResults: false,
      changesPublicRunner: false,
      exposesAnswerKeyTextInHandoff: false,
      exposesChoiceTextInHandoff: false,
      exposesPromptTextInHandoff: false,
      exposesRawAnonymousTokens: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentResponseTextInHandoff: false,
      itemIds: [...PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      requiresAuthenticatedTeacher: true,
      requiresAssignmentSnapshot: true,
      requiresOwnerScopedAssignment: true,
      sourceFiles: [...PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_SOURCE_FILES],
      usesSharedDeliveryPolicy: true,
      usesSharedRuntimeItems: true,
    },
    title: 'Printable worksheet review lifecycle chain',
  };
}

function buildPrintableWorksheetReviewLifecycleChainHandoffItemView(
  id: PrintableWorksheetReviewLifecycleChainHandoffItemId
): PrintableWorksheetReviewLifecycleChainHandoffItemView {
  const item = getPrintableWorksheetReviewLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getPrintableWorksheetReviewLifecycleChainHandoffItem(
  id: PrintableWorksheetReviewLifecycleChainHandoffItemId
): Omit<
  PrintableWorksheetReviewLifecycleChainHandoffItemView,
  'ariaLabel' | 'id'
> {
  switch (id) {
    case 'result-page-print-action':
      return item(
        id,
        'Result page print action',
        'Teacher result action',
        'The teacher results page exposes printing as a prepared result action beside copy and CSV review tools.'
      );
    case 'prepared-print-link':
      return item(
        id,
        'Prepared print link',
        '/print/assignments/:assignmentId',
        'Result header view models prepare the printable worksheet route, assignment id, and default answer-key search state.'
      );
    case 'print-route-auth-boundary':
      return item(
        id,
        'Print route auth boundary',
        'Authenticated teacher',
        'The print route uses teacher auth middleware before loading owner-scoped assignment data.'
      );
    case 'print-route-noindex':
      return item(
        id,
        'Print route noindex',
        'noindex nofollow',
        'Printable worksheet pages set noindex metadata and stay outside public marketing surfaces.'
      );
    case 'robots-print-disallow':
      return item(
        id,
        'Robots print disallow',
        'Disallow /print',
        'Robots rules keep print routes, including localized print routes, out of crawlable public indexes.'
      );
    case 'answer-key-search-parser':
      return item(
        id,
        'Answer-key search parser',
        'answerKey parser',
        'The route parser accepts explicit truthy answer-key search values and treats false values as the hidden default.'
      );
    case 'answer-key-search-builder':
      return item(
        id,
        'Answer-key search builder',
        'answerKey=true only',
        'The search builder emits answerKey only when teachers explicitly include the key.'
      );
    case 'worksheet-query-key':
      return item(
        id,
        'Worksheet query key',
        'Keyed by answer key',
        'The print query caches answer-key and no-key variants separately for the same assignment.'
      );
    case 'owner-scoped-print-api':
      return item(
        id,
        'Owner-scoped print API',
        'Owner assignment row',
        'The printable worksheet server function is authenticated and filters assignment details by current teacher owner.'
      );
    case 'snapshot-source-resolution':
      return item(
        id,
        'Snapshot source resolution',
        'Frozen snapshot',
        'Printable worksheets resolve assignment snapshots before falling back to live activity metadata.'
      );
    case 'delivery-policy-printing':
      return item(
        id,
        'Delivery policy printing',
        'Shared delivery policy',
        'Attempts, timer, close time, identity, answer reveal, shuffle, and instructions print through shared delivery helpers.'
      );
    case 'share-path-printing':
      return item(
        id,
        'Share path printing',
        '/play share path',
        'Printable handouts show the sanitized student share path without exposing internal assignment ids.'
      );
    case 'runtime-item-order':
      return item(
        id,
        'Runtime item order',
        'Shared item order',
        'Printable items and optional answer keys use the same ordered runtime items as the assignment delivery policy.'
      );
    case 'response-policy-map':
      return item(
        id,
        'Response policy map',
        'Template response policy',
        'Printable response modes, layouts, answer lines, and choice-bank presentation come from the shared template runner kind.'
      );
    case 'printable-item-mapping':
      return item(
        id,
        'Printable item mapping',
        'Student handout items',
        'Printable item views normalize prompts, runtime kind labels, sequence numbers, response help, and choice banks.'
      );
    case 'choice-bank-policy':
      return item(
        id,
        'Choice-bank policy',
        'Choice bank from runtime',
        'Choice banks appear only for response policies that need answer, choice, or group banks.'
      );
    case 'writing-area-policy':
      return item(
        id,
        'Writing-area policy',
        'Bounded answer lines',
        'Printable writing areas use bounded answer-line counts derived from the response policy.'
      );
    case 'assignment-field-handoff':
      return item(
        id,
        'Assignment field handoff',
        '8 print fields',
        'Printed assignment fields include student name, date, score, share path, template, snapshot source, instructions, and delivery policy.'
      );
    case 'preparation-summary':
      return item(
        id,
        'Preparation summary',
        '3 preparation checks',
        'Before-printing preparation summarizes student fields, response plan, and answer-key access.'
      );
    case 'header-overview-chips':
      return item(
        id,
        'Header overview chips',
        '3 overview chips',
        'Header overview chips expose item count, response modes, and answer-key access as stable semantic summaries.'
      );
    case 'answer-key-hidden-state':
      return item(
        id,
        'Answer-key hidden state',
        'Hidden by default',
        'Teacher answer keys remain hidden unless the teacher explicitly enables the print key.'
      );
    case 'answer-key-included-state':
      return item(
        id,
        'Answer-key included state',
        'Teacher-only key included',
        'When enabled and available, answer keys render teacher-only expected answers, alternatives, and explanations.'
      );
    case 'answer-key-unavailable-state':
      return item(
        id,
        'Answer-key unavailable state',
        'No answer key available',
        'Assignments with no printable answer-key items report the unavailable state instead of rendering empty answer text.'
      );
    case 'answer-key-detail-boundary':
      return item(
        id,
        'Answer-key detail boundary',
        'Detail ids stable',
        'Answer-key detail rows use stable expected-answer, accepted-answers, and explanation identifiers.'
      );
    case 'toolbar-toggle-boundary':
      return item(
        id,
        'Toolbar toggle boundary',
        'Answer-key switch',
        'The toolbar answer-key switch is tied to prepared status descriptions and URL-backed search state.'
      );
    case 'print-action-boundary':
      return item(
        id,
        'Print action boundary',
        'window.print action',
        'The print button is a teacher-controlled browser print action and does not mutate attempts or results.'
      );
    case 'results-return-action':
      return item(
        id,
        'Results return action',
        'Back to results',
        'Printable worksheet controls link teachers back to the assignment results route through a prepared action.'
      );
    case 'result-export-alignment':
      return item(
        id,
        'Result export alignment',
        'CSV stays full export',
        'CSV export remains a full-assignment results boundary while printing stays a teacher handout boundary.'
      );
    case 'worksheet-delivery-chain-alignment':
      return item(
        id,
        'Worksheet delivery chain alignment',
        'Worksheet chain aligned',
        'The printable review lifecycle stays aligned with worksheet delivery, student runtime, snapshot, and export gates.'
      );
    case 'printable-review-lifecycle-gate':
      return item(
        id,
        'Printable review lifecycle gate',
        '30 source files',
        'The focused gate keeps result actions, print routes, worksheet builders, answer-key states, return navigation, and export boundaries connected.'
      );
  }
}

function item(
  id: PrintableWorksheetReviewLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<PrintableWorksheetReviewLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
