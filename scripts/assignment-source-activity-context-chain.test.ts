import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildAssignmentListCardViewModel } from '@/assignments/list-view';
import { buildPrintableWorksheetPageViewModel } from '@/assignments/printable-worksheet-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const APP_SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const SNAPSHOT_SOURCE = readFileSync('src/assignments/snapshot.ts', 'utf8');
const LIST_QUERY_SOURCE = readFileSync('src/assignments/list-query.ts', 'utf8');
const LIST_VIEW_SOURCE = readFileSync('src/assignments/list-view.ts', 'utf8');
const LIST_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_SOURCE = readFileSync(
  'src/assignments/printable-worksheet.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_VIEW_SOURCE = readFileSync(
  'src/assignments/printable-worksheet-view.ts',
  'utf8'
);
const PRINTABLE_HEADER_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-header.tsx',
  'utf8'
);
const PRINTABLE_FIELDS_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-assignment-fields.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment source activity context uses frozen snapshots across surfaces', () => {
  const cardView = buildAssignmentListCardViewModel({
    activity: {
      description: 'Live source description.',
      templateType: 'fill-blank',
      title: 'Live source title',
    },
    assignment: {
      expiresAt: null,
      id: 'source-context-assignment',
      settingsJson: {
        collectStudentName: true,
        showCorrectAnswers: false,
        shuffleItems: false,
      },
      shareSlug: 'source-context',
      status: 'published',
      title: 'Source Context Assignment',
    },
    snapshot: {
      activityDescription: 'Frozen source context description.',
      activityTitle: 'Frozen source context title',
      templateType: 'quiz',
    },
    stats: {
      averageScore: 0,
      completions: 0,
    },
  });
  const printablePageView = buildPrintableWorksheetPageViewModel({
    answerKey: false,
    assignmentId: 'source-context-assignment',
    worksheet: {
      activityDescription: 'Frozen source context description.',
      activityTitle: 'Frozen source context title',
      assignmentTitle: 'Source Context Assignment',
      deliveryPolicyText: 'Delivery policy',
      deliverySummary: {
        answerReveal: 'Hidden',
        closeTime: 'No close time',
        identityMode: 'Names',
        instructions: 'None',
        itemOrder: 'Fixed order',
        maxAttempts: 'Unlimited',
        timeLimit: 'No timer',
      },
      includeAnswerKey: false,
      instructions: '',
      items: [],
      sharePath: '/play/source-context',
      shareSlug: 'source-context',
      templateType: 'quiz',
    },
  });

  assert.equal(
    cardView.activityDescription,
    'Frozen source context description.'
  );
  assert.equal(cardView.templateLabel, 'Quiz');
  assert.deepEqual(
    printablePageView.assignmentFieldViews.find(
      (fieldView) => fieldView.id === 'activity-description'
    ),
    {
      ariaLabel:
        'Activity description: Frozen source context description.. Printed context copied from the frozen assignment snapshot.',
      description:
        'Printed context copied from the frozen assignment snapshot.',
      id: 'activity-description',
      kind: 'text',
      label: 'Activity description',
      value: 'Frozen source context description.',
    }
  );
});

test('assignment source activity context sources preserve snapshot contracts', () => {
  assert.match(
    PRODUCT_SOURCE,
    /source activity text[\s\S]*Assignment attempt metrics[\s\S]*Printable worksheet pages should do the same/,
    'docs/product.md should keep source activity search, result metrics, and printable worksheet context connected.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /activityTitle: text\('activity_title'\)[\s\S]*activityDescription: text\('activity_description'\)/,
    'Assignment snapshot schema should persist source activity title and description.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /buildAssignmentSnapshotInsert[\s\S]*activityDescription: sourceActivity\.description[\s\S]*activityTitle: sourceActivity\.title[\s\S]*contentJson: structuredClone\(sourceActivity\.contentJson\)/,
    'Snapshot inserts should freeze source activity context and content.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /resolveAssignmentSnapshotSource[\s\S]*snapshot\s*\?\s*snapshot\.activityDescription[\s\S]*snapshot\s*\?\s*snapshot\.activityTitle[\s\S]*normalizeOptionalRuntimeDisplayText\(activityDescription\)[\s\S]*normalizeRuntimeDisplayText\(activityTitle\)/,
    'Source resolution should prefer frozen snapshot title and description with normalized live fallback.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /resolveAssignmentRuntimeSource[\s\S]*resolveAssignmentSnapshotSource[\s\S]*getRuntimeItems\(resolvedSource\.templateType, contentJson\)/,
    'Runtime source resolution should derive runtime items from the resolved source template and content.'
  );
  assert.match(
    LIST_QUERY_SOURCE,
    /sqlLikeContains\(activity\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.description, normalizedSearch\)[\s\S]*sqlLikeContains\(assignmentSnapshot\.activityTitle, normalizedSearch\)[\s\S]*sqlLikeContains\([\s\S]*assignmentSnapshot\.activityDescription,[\s\S]*normalizedSearch/,
    'Assignment list search should include current and frozen source activity title and description.'
  );
  assert.match(
    LIST_VIEW_SOURCE,
    /resolveAssignmentSnapshotSource\(\{[\s\S]*activity,[\s\S]*snapshot[\s\S]*const templateType = resolvedSource\.templateType[\s\S]*activityDescription: resolvedSource\.activityDescription \?\? ''/,
    'Assignment list cards should render resolved source description and template context.'
  );
  assert.match(
    LIST_CARD_SOURCE,
    /function AssignmentListCardHeader[\s\S]*assignment\.statusLabel[\s\S]*assignment\.templateLabel[\s\S]*assignment\.title[\s\S]*assignment\.activityDescription/,
    'Assignment list card headers should display prepared source activity descriptions.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /resolveAssignmentRuntimeSource\(\{[\s\S]*activity,[\s\S]*snapshot[\s\S]*buildPublicAssignmentActivitySummary\(\{[\s\S]*description: resolvedSource\.activityDescription,[\s\S]*title: resolvedSource\.activityTitle[\s\S]*buildPublicAssignmentSnapshotSummary\(snapshot\)/,
    'Public assignment payloads should use resolved source summaries plus compact snapshot metadata.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /resolveAssignmentSnapshotSource\(\{[\s\S]*activity,[\s\S]*snapshot[\s\S]*activityDescription: resolvedSource\.activityDescription \?\? ''[\s\S]*activityTitle: resolvedSource\.activityTitle[\s\S]*buildPrintableAssignmentSearch\(\{ answerKey: false \}\)/,
    'Result headers should show resolved source context and prepare print from the same assignment.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /resolvedSource\.activityTitle,[\s\S]*formatAssignmentExportText\(resolvedSource\.activityDescription\),[\s\S]*formatAssignmentExportTemplateLabel\(resolvedSource\.templateType\)/,
    'CSV exports should include resolved source title, description, and template context.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /resolveAssignmentSnapshotSource\(\{[\s\S]*activity,[\s\S]*snapshot[\s\S]*activityDescription: resolvedSource\.activityDescription \?\? null,[\s\S]*activityTitle: resolvedSource\.activityTitle[\s\S]*templateType/,
    'Printable worksheet builders should copy resolved source title, description, and template.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_VIEW_SOURCE,
    /buildPrintableWorksheetActivityDescriptionFieldView\(headerView\)[\s\S]*id: 'activity-description'[\s\S]*activityDescriptionLabel[\s\S]*activityDescriptionFallback/,
    'Printable worksheet fields should include a localized source activity description row.'
  );
  assert.match(
    PRINTABLE_HEADER_SOURCE,
    /headerView\.activityDescription[\s\S]*\{headerView\.activityDescription\}/,
    'Printable headers should render the prepared source activity description when present.'
  );
  assert.match(
    PRINTABLE_FIELDS_SOURCE,
    /fieldViews\.map\(\(fieldView\)[\s\S]*fieldView\.label[\s\S]*fieldView\.value[\s\S]*fieldView\.description/,
    'Printable assignment fields should render prepared source field labels, values, and descriptions.'
  );
});

test('assignment source activity context focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /assignment\s+source\s+activity\s+context\s+chain[\s\S]*frozen\s+source\s+title[\s\S]*teacher\s+copy\s+text[\s\S]*CSV\s+export[\s\S]*printable\s+worksheet/,
    'docs/product.md should carry frozen source context into teacher copy, CSV, and print.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment source-activity context chain has a fast script-level gate via[\s\S]*scripts\/assignment-source-activity-context-chain\.test\.ts[\s\S]*result-material\s+boundary/,
    'TEST-CATALOG should document the assignment source-activity context chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /source-activity snapshot resolution.*assignment-list search.*public student payloads.*result headers.*CSV source columns.*printable worksheet fields/,
    'TEST-CATALOG should describe the source-activity context chain scope.'
  );
});
