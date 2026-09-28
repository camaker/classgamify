import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { RuntimeItem } from '@/activities/runtime';
import { buildPrintableWorksheetPageViewModel } from '@/assignments/printable-worksheet-view';
import {
  buildPrintableAssignmentSearch,
  buildPrintableAssignmentWorksheet,
  parsePrintableAssignmentSearch,
  summarizePrintableAssignmentWorksheet,
} from '@/assignments/printable-worksheet';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const HOOK_SOURCE = readFileSync('src/hooks/use-assignments.ts', 'utf8');
const PRINTABLE_WORKSHEET_SOURCE = readFileSync(
  'src/assignments/printable-worksheet.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_VIEW_SOURCE = readFileSync(
  'src/assignments/printable-worksheet-view.ts',
  'utf8'
);
const PRINTABLE_ROUTE_SOURCE = readFileSync(
  'src/routes/print/assignments/$assignmentId.tsx',
  'utf8'
);
const ROOT_ROUTE_SOURCE = readFileSync('src/routes/__root.tsx', 'utf8');
const PUBLIC_INDEXING_SOURCE = readFileSync(
  'src/seo/public-indexing.ts',
  'utf8'
);
const PUBLIC_ROUTES_SOURCE = readFileSync('src/seo/public-routes.ts', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULTS_HEADER_ACTIONS_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-header-actions.tsx',
  'utf8'
);
const PRINTABLE_TOOLBAR_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-toolbar.tsx',
  'utf8'
);
const PRINTABLE_HEADER_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-header.tsx',
  'utf8'
);
const PRINTABLE_PREPARATION_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-preparation-summary.tsx',
  'utf8'
);
const PRINTABLE_ANSWER_KEY_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-answer-key.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const SECRET_ANSWER_TEXT = 'SECRET_REVIEW_LIFECYCLE_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_REVIEW_LIFECYCLE_CHOICE';
const SECRET_PROMPT_TEXT = 'SECRET_REVIEW_LIFECYCLE_PROMPT';

test('printable worksheet view keeps answer-key lifecycle states explicit', () => {
  const hiddenWorksheet = buildWorksheet({ includeAnswerKey: false });
  const includedWorksheet = buildWorksheet({ includeAnswerKey: true });
  const unavailableWorksheet = {
    ...includedWorksheet,
    answerKey: [],
  };
  const hiddenPageView = buildPrintableWorksheetPageViewModel({
    answerKey: false,
    assignmentId: 'assignment-review-lifecycle',
    worksheet: hiddenWorksheet,
  });
  const includedPageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-review-lifecycle',
    worksheet: includedWorksheet,
  });
  const unavailablePageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-review-lifecycle',
    worksheet: unavailableWorksheet,
  });
  const includedSummary = summarizePrintableAssignmentWorksheet(
    includedWorksheet,
    { includeAnswerKey: true }
  );

  assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: true }), {
    answerKey: true,
  });
  assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: '1' }), {
    answerKey: true,
  });
  assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: 'false' }), {
    answerKey: undefined,
  });
  assert.deepEqual(buildPrintableAssignmentSearch({ answerKey: true }), {
    answerKey: true,
  });
  assert.deepEqual(buildPrintableAssignmentSearch({ answerKey: false }), {
    answerKey: undefined,
  });
  assert.equal(hiddenWorksheet.activityTitle, 'Frozen Review Snapshot');
  assert.equal(hiddenWorksheet.sharePath, '/play/print-review');
  assert.equal(hiddenWorksheet.includeAnswerKey, false);
  assert.equal(includedWorksheet.includeAnswerKey, true);
  assert.equal(includedWorksheet.answerKey?.length, 2);
  assert.equal(includedSummary.itemCount, 2);
  assert.equal(includedSummary.answerKeyItemCount, 2);
  assert.equal(includedSummary.showAnswerKey, true);
  assert.equal(hiddenPageView.answerKeyView.accessView.state, 'hidden');
  assert.equal(hiddenPageView.showAnswerKey, false);
  assert.equal(includedPageView.answerKeyView.accessView.state, 'included');
  assert.equal(includedPageView.showAnswerKey, true);
  assert.equal(
    unavailablePageView.answerKeyView.accessView.state,
    'unavailable'
  );
  assert.equal(unavailablePageView.showAnswerKey, false);
  assert.equal(
    JSON.stringify(hiddenPageView.answerKeyView).includes(SECRET_ANSWER_TEXT),
    false,
    'The student copy must not carry answer-key text when the key is hidden.'
  );
});

test('printable worksheet sources preserve route, API, and DOM boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Printable worksheet pages should do the same for handout overview chips,[\s\S]*answer-key access state[\s\S]*writing areas[\s\S]*return-to-results links[\s\S]*print controls/,
    'docs/product.md should keep printable worksheet review semantics tied to result review.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /getPrintableAssignmentWorksheet = createServerFn\(\{[\s\S]*method: 'GET'[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId,[\s\S]*userId[\s\S]*buildPrintableAssignmentWorksheet\(\{[\s\S]*includeAnswerKey: data\.includeAnswerKey/,
    'Printable worksheet API should remain authenticated, owner-scoped, and explicit about answer-key inclusion.'
  );
  assert.match(
    HOOK_SOURCE,
    /usePrintableAssignmentWorksheet[\s\S]*queryKey: \[[\s\S]*'printable'[\s\S]*\{ includeAnswerKey \}/,
    'Printable worksheet query keys should separate hidden-key and included-key variants.'
  );
  assert.match(
    PRINTABLE_ROUTE_SOURCE,
    /validateSearch: parsePrintableAssignmentSearch[\s\S]*robots: 'noindex, nofollow'[\s\S]*middleware: \[authRouteMiddleware\][\s\S]*includeAnswerKey: answerKey[\s\S]*document\.body\.dataset\.printMode = PRINTABLE_WORKSHEET_BODY_PRINT_MODE[\s\S]*search: buildPrintableAssignmentSearch\(\{ answerKey: nextAnswerKey \}\)[\s\S]*onPrint=\{\(\) => window\.print\(\)\}[\s\S]*PrintableWorksheetAnswerKey view=\{pageView\.answerKeyView\}/,
    'Printable route should stay search-validated, teacher-only, noindex, print-mode scoped, and URL-toggle backed, with the answer key rendered only through its own view.'
  );
  assert.match(
    ROOT_ROUTE_SOURCE,
    /canonicalPathname\.startsWith\('\/print'\)/,
    'Print routes should render without public marketing chrome.'
  );
  assert.match(
    PUBLIC_ROUTES_SOURCE,
    /PUBLIC_ROBOTS_DISALLOW_RULES[\s\S]*\{ id: 'print', path: '\/print' \}/,
    'Public route indexing rules should disallow print paths.'
  );
  assert.match(
    PUBLIC_INDEXING_SOURCE,
    /getRobotsDisallowPaths\(\)[\s\S]*PUBLIC_ROBOTS_DISALLOW_RULES\.flatMap[\s\S]*getLocalizedPublicPathVariants\(rule\.path\)/,
    'Public indexing should localize robots disallow rules for print paths.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /export type AssignmentResultHeaderPrintAction[\s\S]*search: PrintableAssignmentSearch[\s\S]*to: typeof Routes\.PrintAssignmentWorksheet[\s\S]*printAction: \{[\s\S]*assignmentId: assignment\.id[\s\S]*search: buildPrintableAssignmentSearch\(\{ answerKey: false \}\)[\s\S]*to: Routes\.PrintAssignmentWorksheet/,
    'Result header view should prepare printable worksheet links with answer keys hidden by default.'
  );
  assert.match(
    RESULTS_HEADER_ACTIONS_SOURCE,
    /AssignmentResultsHeaderPrintActionLink[\s\S]*to=\{printAction\.to\}[\s\S]*assignmentId: printAction\.assignmentId[\s\S]*search=\{printAction\.search\}/,
    'Result header actions should render the prepared printable worksheet action target.'
  );
});

test('printable worksheet sources preserve snapshot, delivery, and review alignment', () => {
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /resolveAssignmentSettings\(assignment\.settingsJson\)[\s\S]*normalizeAssignmentShareSlug\(assignment\.shareSlug\)[\s\S]*resolveAssignmentSnapshotSource\(\{[\s\S]*activity,[\s\S]*snapshot[\s\S]*buildPrintableAssignmentDeliveryView\(\{[\s\S]*expiresAt: assignment\.expiresAt,[\s\S]*settings[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*items: runtimeItems,[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/,
    'Printable worksheet builder should resolve settings, share path, snapshot source, delivery policy, and runtime item order through shared helpers.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /answerKey: includeAnswerKey[\s\S]*orderedRuntimeItems\.map\(toPrintableWorksheetAnswerKeyItem\)[\s\S]*items: orderedRuntimeItems\.map\(\(item, index\) =>[\s\S]*toPrintableWorksheetItem/,
    'Printable worksheet builder should derive student handout items and optional answer keys from the same ordered runtime items.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /PRINTABLE_WORKSHEET_RESPONSE_POLICIES[\s\S]*'fill-blank'[\s\S]*responseMode: 'short-answer'[\s\S]*'group-sort'[\s\S]*responseMode: 'group-choice'[\s\S]*'line-match'[\s\S]*responseMode: 'line-match'[\s\S]*listening[\s\S]*responseMode: 'short-answer'/,
    'Printable response policies should cover worksheet-style runner families.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_VIEW_SOURCE,
    /const answerKeyAccessView = buildPrintableWorksheetAnswerKeyAccessView[\s\S]*buildPrintableWorksheetHeaderView\(worksheet, \{[\s\S]*answerKeyAccessView[\s\S]*buildPrintableWorksheetControlView\(\{[\s\S]*answerKeyAccessView[\s\S]*buildPrintableWorksheetPreparationView\(summary, \{[\s\S]*answerKeyAccessView/,
    'Printable worksheet view model should reuse one answer-key access state across header, controls, and preparation summary.'
  );
  assert.match(
    PRINTABLE_TOOLBAR_SOURCE,
    /Switch[\s\S]*id="printable-answer-key"[\s\S]*checked=\{toggleView\.value\}[\s\S]*aria-describedby=\{`\$\{answerKeyDescriptionId\} \$\{answerKeyStatusDescriptionId\}`\}[\s\S]*onCheckedChange=\{onAnswerKeyChange\}[\s\S]*Button[\s\S]*aria-describedby=\{printDescriptionId\}[\s\S]*onClick=\{onPrint\}[\s\S]*PrintableWorksheetBackToResultsLink[\s\S]*to=\{action\.to\}[\s\S]*assignmentId: action\.assignmentId/,
    'Printable toolbar should keep answer-key toggle, print action, and return-to-results action prepared and described.'
  );
  assert.match(
    PRINTABLE_HEADER_SOURCE,
    /headerView\.overviewItems\.map[\s\S]*PrintableWorksheetHeaderOverviewBadge[\s\S]*overviewItem\.ariaLabel/,
    'Printable header should render prepared overview chips.'
  );
  assert.match(
    PRINTABLE_PREPARATION_SOURCE,
    /view\.items\.map[\s\S]*PrintableWorksheetPreparationItem[\s\S]*itemView\.ariaLabel/,
    'Printable preparation summary should render prepared before-printing checks.'
  );
  assert.match(
    PRINTABLE_ANSWER_KEY_SOURCE,
    /data-print-answer-key-state=\{view\.accessView\.state\}[\s\S]*view\.itemViews\.map[\s\S]*PrintableWorksheetAnswerKeyItem[\s\S]*detailView\.id/,
    'Printable answer-key component should expose access state and stable detail ids.'
  );
  assert.doesNotMatch(
    PRINTABLE_ROUTE_SOURCE,
    /data-handoff|Handoff\b/,
    'The print page should render no hidden audit sections.'
  );
});

test('printable worksheet review lifecycle focused gate is documented', () => {
  assert.match(
    PRODUCT_SOURCE,
    /printable\s+worksheet\s+review\s+lifecycle\s+chain[\s\S]*visible\s+print\s+page[\s\S]*answer-key\s+access[\s\S]*print\s+controls[\s\S]*independent\s+30-file\s+gate/,
    'docs/product.md should carry printable review through the visible print page while retaining the source-file gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Printable worksheet review lifecycle chain has a fast script-level gate via[\s\S]*scripts\/printable-worksheet-review-lifecycle-chain\.test\.ts[\s\S]*30-slice\s+printable\s+worksheet\s+handoff\s+boundary/,
    'TEST-CATALOG should document the printable worksheet review lifecycle gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /result-page print actions[\s\S]*teacher-only print routes[\s\S]*frozen snapshot handouts[\s\S]*answer-key hidden\/included\/unavailable states[\s\S]*return-to-results links[\s\S]*CSV export alignment/,
    'TEST-CATALOG should describe the printable worksheet review lifecycle scope.'
  );
});

function buildWorksheet({ includeAnswerKey }: { includeAnswerKey: boolean }) {
  return buildPrintableAssignmentWorksheet({
    activity: {
      description: 'Live activity description.',
      templateType: 'fill-blank',
      title: 'Live Activity Title',
    },
    assignment: {
      expiresAt: '2026-07-15T10:00:00.000Z',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Bring a pencil.',
        maxAttempts: null,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 600,
      },
      shareSlug: ' print-review ',
      title: ' Print Review Assignment ',
    },
    includeAnswerKey,
    runtimeItems: SOURCE_RUNTIME_ITEMS,
    snapshot: {
      activityDescription: 'Frozen printable review copy.',
      activityTitle: 'Frozen Review Snapshot',
      templateType: 'quiz',
    },
  });
}

const SOURCE_RUNTIME_ITEMS: RuntimeItem[] = [
  {
    answer: `${SECRET_ANSWER_TEXT} / Backup answer; Alt answer`,
    choices: [SECRET_ANSWER_TEXT, SECRET_CHOICE_TEXT],
    explanation: 'Teacher-only explanation text.',
    id: 'question-1',
    kind: 'question',
    prompt: SECRET_PROMPT_TEXT,
  },
  {
    answer: 'Second answer',
    choices: ['Second answer', 'Second choice'],
    id: 'question-2',
    kind: 'question',
    prompt: 'Second prompt',
  },
];
