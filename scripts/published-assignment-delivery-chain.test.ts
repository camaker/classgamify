import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const SHARE_LINK_SOURCE = readFileSync('src/assignments/share-link.ts', 'utf8');
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const STUDENT_RUNNER_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('published assignment delivery sources preserve sanitized public and submission boundaries', () => {
  const publicAssignmentPayloadType = getSourceSlice(
    PUBLIC_ASSIGNMENT_SOURCE,
    'export type PublicAssignmentPayload = {',
    'export type PublicAssignmentUnavailableReason'
  );

  assert.doesNotMatch(
    publicAssignmentPayloadType,
    /\b(contentJson|sourceMaterials|teacherNotes|answerKeys|acceptedAlternatives|explanations)\b/,
    'PublicAssignmentPayload should not expose ActivityContent, source materials, answer keys, accepted alternatives, or explanations.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /resolveAssignmentRuntimeSource\(\{[\s\S]*activity,[\s\S]*snapshot,[\s\S]*\}[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems,[\s\S]*\}[\s\S]*runtimeItems: stripRuntimeAnswers\(orderedRuntimeItems\)/
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /runtimeItemsHidden: true[\s\S]*teacherMaterialsHidden: true[\s\S]*rawAnonymousTokenHidden: true/
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /\.batch\(\[[\s\S]*db\.insert\(assignment\)\.values\([\s\S]*buildPublishedAssignmentInsert\(\{[\s\S]*sourceActivity,[\s\S]*userId,[\s\S]*\}\)[\s\S]*db\.insert\(assignmentSnapshot\)\.values\([\s\S]*buildPublishedAssignmentSnapshotInsert/
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /resolveAssignmentRuntimeSource\(row\)[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*items: resolvedSource\.runtimeItems,[\s\S]*normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*answers: submittedAnswers,[\s\S]*runtimeItems: orderedRuntimeItems[\s\S]*buildScoredAttemptInsert\(\{/
  );
  assert.match(
    STUDENT_RUNNER_SOURCE,
    /buildStudentRunnerSubmissionExecutionPlan[\s\S]*confirmIncompleteSubmit/
  );
});

test('published assignment delivery privacy contracts stay explicit across surfaces', () => {
  assert.doesNotMatch(
    SHARE_LINK_SOURCE,
    /anonymousToken|storageKey/,
    'Share links should never read raw anonymous tokens or storage keys.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /deliveryView\.closeTime,[\s\S]*deliveryView\.policyText,[\s\S]*deliveryView\.identityMode,[\s\S]*deliveryView\.answerReveal,[\s\S]*deliveryView\.itemOrder,[\s\S]*deliveryView\.maxAttempts,[\s\S]*deliveryView\.timeLimitSeconds/
  );
  assert.doesNotMatch(
    RESULTS_EXPORT_SOURCE,
    /anonymousToken|storageKey/,
    'Results CSV export should never read raw anonymous tokens or storage keys.'
  );
});

test('published assignment delivery chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /published-assignment\s+delivery\s+chain[\s\S]*publish\s+dialog's\s+30[\s\S]*review\s+checklist[\s\S]*opaque[\s\S]*omits\s+generated\s+control\s+ids[\s\S]*raw\s+settings[\s\S]*source-material\s+storage\s+keys/,
    'docs/product.md should describe the publish-control handoff and opaque-id privacy boundary.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Published assignment delivery chain has a fast script-level gate via[\s\S]*scripts\/published-assignment-delivery-chain\.test\.ts/,
    'TEST-CATALOG should document the published assignment delivery chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /publish preflight[\s\S]*30-item publish control boundary[\s\S]*frozen snapshots[\s\S]*share links[\s\S]*public student rules[\s\S]*validated submissions[\s\S]*results export/,
    'TEST-CATALOG should document the cross-module assignment delivery chain scope.'
  );
});

function getSourceSlice(
  source: string,
  startMarker: string,
  endMarker: string
) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source start marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source end marker: ${endMarker}`);
  return source.slice(start, end);
}
