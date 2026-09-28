import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DB_DOC_SOURCE = readFileSync('docs/db.md', 'utf8');
const APP_SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const DB_SCHEMA_SOURCE = readFileSync('src/db/schema.ts', 'utf8');
const ACTIVITIES_API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const ACTIVITY_PERSISTENCE_SOURCE = readFileSync(
  'src/activities/persistence.ts',
  'utf8'
);
const ACTIVITY_DETAIL_QUERY_SOURCE = readFileSync(
  'src/activities/detail-query.ts',
  'utf8'
);
const ACTIVITY_LIBRARY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ASSIGNMENT_PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/persistence.ts',
  'utf8'
);
const SNAPSHOT_SOURCE = readFileSync('src/assignments/snapshot.ts', 'utf8');
const ASSIGNMENT_DETAIL_QUERY_SOURCE = readFileSync(
  'src/assignments/detail-query.ts',
  'utf8'
);
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const ASSIGNMENT_VALIDATION_SOURCE = readFileSync(
  'src/assignments/validation.ts',
  'utf8'
);
const SHARE_SLUG_SOURCE = readFileSync('src/assignments/share-slug.ts', 'utf8');
const LIFECYCLE_SOURCE = readFileSync('src/assignments/lifecycle.ts', 'utf8');
const ITEM_ORDER_SOURCE = readFileSync('src/assignments/item-order.ts', 'utf8');
const ATTEMPT_ANSWERS_SOURCE = readFileSync(
  'src/assignments/attempt-answers.ts',
  'utf8'
);
const ATTEMPT_IDENTITY_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-identity-query.ts',
  'utf8'
);
const ATTEMPT_PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/attempt-persistence.ts',
  'utf8'
);
const ATTEMPT_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_SOURCE = readFileSync(
  'src/assignments/printable-worksheet.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('classroom data lifecycle docs and schema preserve the data skeleton', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Activity -> Assignment -> Attempt -> Results/,
    'docs/product.md should keep the classroom product data loop explicit.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /`Activity` is the teacher-owned reusable content object[\s\S]*`ActivityContent` is template-neutral lesson material[\s\S]*`ActivityTemplate` is a runtime renderer[\s\S]*`Assignment` is a shareable delivery instance[\s\S]*`AssignmentSnapshot` freezes the published title, template, and content[\s\S]*`Attempt` records a student's submitted answers and scored result/,
    'docs/product.md should define the activity, assignment, snapshot, and attempt model.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /future templates from creating separate content tables[\s\S]*public\s+student payloads still expose only sanitized runtime prompts and choices, not[\s\S]*file list or storage keys/,
    'docs/product.md should avoid per-template tables and public storage-key leaks.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Publishing an assignment is an explicit configuration step[\s\S]*`Assignment\.settingsJson`[\s\S]*`AssignmentSnapshot`[\s\S]*Assignment settings should\s+resolve through shared domain logic/,
    'docs/product.md should keep publish settings and snapshots connected.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Public student links must return a sanitized assignment payload[\s\S]*runtime prompts and choices, not `ActivityContent` with embedded answers[\s\S]*raw tokens/,
    'docs/product.md should keep public payloads sanitized.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /The results API analyzes frozen runtime items and stored attempt answers[\s\S]*CSV exports should include the assignment\s+delivery policy/,
    'docs/product.md should connect frozen runtime items, attempts, and result exports.'
  );
  assert.match(
    DB_DOC_SOURCE,
    /Cloudflare D1[\s\S]*auth\.schema\.ts[\s\S]*app\.schema\.ts[\s\S]*schema\.ts/,
    'docs/db.md should preserve the D1 app-schema boundary.'
  );
  assert.match(
    DB_SCHEMA_SOURCE,
    /export \* from '\.\/app\.schema'[\s\S]*export const schema = \{[\s\S]*\.\.\.authSchema,[\s\S]*\.\.\.appSchema/,
    'src/db/schema.ts should merge auth and app schemas.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /export const activity = sqliteTable\([\s\S]*ownerId: text\('owner_id'\)[\s\S]*templateType: text\('template_type'\)[\s\S]*contentJson: text\('content_json'[\s\S]*visibility: text\('visibility'\)[\s\S]*index\('activity_owner_updated_idx'\)/,
    'Activity schema should keep owner, template, content, visibility, and owner-updated index fields.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /export const assignment = sqliteTable\([\s\S]*activityId: text\('activity_id'\)[\s\S]*ownerId: text\('owner_id'\)[\s\S]*shareSlug: text\('share_slug'\)\.notNull\(\)\.unique\(\)[\s\S]*settingsJson: text\('settings_json'[\s\S]*status: text\('status'\)[\s\S]*expiresAt: integer\('expires_at'/,
    'Assignment schema should keep source activity, owner, unique share slug, settings, status, and expiry fields.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /export const assignmentSnapshot = sqliteTable\([\s\S]*assignmentId: text\('assignment_id'\)[\s\S]*\.primaryKey\(\)[\s\S]*activityTitle: text\('activity_title'\)[\s\S]*templateType: text\('template_type'\)[\s\S]*contentJson: text\('content_json'/,
    'Assignment snapshot schema should freeze title, template, and content by assignment id.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /export const attempt = sqliteTable\([\s\S]*assignmentId: text\('assignment_id'\)[\s\S]*studentName: text\('student_name'\)[\s\S]*anonymousToken: text\('anonymous_token'\)[\s\S]*answersJson: text\('answers_json'[\s\S]*resultJson: text\('result_json'[\s\S]*attempt_assignment_anonymous_token_idx[\s\S]*attempt_assignment_student_name_idx/,
    'Attempt schema should keep identity, answer/result JSON, and identity indexes.'
  );
});

test('activity persistence and query sources preserve owner scope', () => {
  assert.match(
    ACTIVITY_PERSISTENCE_SOURCE,
    /buildActivityCreateInsert[\s\S]*contentJson: buildActivityContent\(input\)[\s\S]*ownerId: userId[\s\S]*visibility: input\.visibility/,
    'Activity creation should persist validated content under the teacher owner.'
  );
  assert.match(
    ACTIVITY_PERSISTENCE_SOURCE,
    /buildActivityUpdateSet[\s\S]*contentJson: buildActivityContent\(input\)[\s\S]*templateType: input\.templateType[\s\S]*visibility: input\.visibility/,
    'Activity updates should reuse the same CreateActivityInput content builder.'
  );
  assert.match(
    ACTIVITY_PERSISTENCE_SOURCE,
    /buildDuplicatedActivityInsert[\s\S]*cloneActivityContentForDerivative\(sourceActivity\.contentJson\)[\s\S]*ownerId: userId[\s\S]*visibility: 'draft'[\s\S]*buildRemixedActivityInsert[\s\S]*cloneActivityContentForDerivative\(sourceActivity\.contentJson\)[\s\S]*visibility: 'draft'/,
    'Derivative activities should clone content into teacher-owned draft rows.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /listActivities = createServerFn\(\{ method: 'GET' \}\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildActivityLibraryWhere\(\{[\s\S]*userId/,
    'Activity list should require auth and build owner-scoped filters.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /getActivity = createServerFn\(\{ method: 'GET' \}\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildActivityDetailOwnerWhere\(\{ activityId: data\.id, userId \}\)/,
    'Activity detail should load only the current teacher owner row.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /createActivity = createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.validator\(createActivityInputSchema\)[\s\S]*buildActivityCreateInsert/,
    'Activity creation should validate before using the persistence helper.'
  );
  assert.match(
    ACTIVITIES_API_SOURCE,
    /updateActivity = createServerFn\(\{ method: 'POST' \}\)[\s\S]*assertActivityCanEdit\(existingActivity\.visibility\)[\s\S]*buildActivityUpdateSet/,
    'Activity updates should pass lifecycle gating before persistence.'
  );
  assert.match(
    ACTIVITY_DETAIL_QUERY_SOURCE,
    /return and\(eq\(activity\.id, activityId\), eq\(activity\.ownerId, userId\)\)/,
    'Activity detail owner helper should bind activity id and owner id.'
  );
  assert.match(
    ACTIVITY_LIBRARY_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(activity\.ownerId, userId\)\][\s\S]*eq\(activity\.visibility, 'archived'\)[\s\S]*ne\(activity\.visibility, 'archived'\)[\s\S]*sqlLikeContains\(activity\.title/,
    'Activity library filters should not broaden beyond the owner scope.'
  );
});

test('assignment publish, snapshot, and public payload sources stay frozen', () => {
  assert.match(
    ASSIGNMENT_PERSISTENCE_SOURCE,
    /buildPublishedAssignmentInsert[\s\S]*activityId: sourceActivity\.id[\s\S]*ownerId: userId[\s\S]*settingsJson: settings[\s\S]*shareSlug: normalizeAssignmentShareSlug\(shareSlug\)[\s\S]*status: 'published'/,
    'Assignment publish persistence should normalize share slug and persist settings under the teacher owner.'
  );
  assert.match(
    ASSIGNMENT_PERSISTENCE_SOURCE,
    /buildPublishedAssignmentSnapshotInsert[\s\S]*return buildAssignmentSnapshotInsert\(/,
    'Published assignment snapshot persistence should delegate to the snapshot helper.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /publishAssignment = createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildActivityDetailOwnerWhere\([\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*await db[\s\S]*\.batch\(\[[\s\S]*db\.insert\(assignment\)[\s\S]*buildPublishedAssignmentInsert[\s\S]*db\.insert\(assignmentSnapshot\)[\s\S]*buildPublishedAssignmentSnapshotInsert[\s\S]*\.catch\(rethrowAssignmentPublishSourceWriteError\)/,
    'Publishing should require owner scope, lifecycle derivation, an atomic D1 assignment/snapshot batch, and write-time source error mapping.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /getPublicAssignment = createServerFn\(\{ method: 'GET' \}\)[\s\S]*buildAssignmentDetailShareWhere\(\{ shareSlug: data\.shareSlug \}\)[\s\S]*buildPublicAssignmentLookupResult\(row\)/,
    'Public assignment lookup should use share slug and return the public lookup result.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /submitAttempt = createServerFn\(\{ method: 'POST' \}\)[\s\S]*resolveAssignmentRuntimeSource\(row\)[\s\S]*recoverAttemptSubmissionResponse[\s\S]*assertAssignmentAcceptsSubmissions[\s\S]*assertSubmittedAnswersMatchRuntimeItems[\s\S]*evaluateRuntimeAnswers[\s\S]*persistAttemptWithinIdentityLimit[\s\S]*buildScoredAttemptInsert[\s\S]*isSlotConflict: isAttemptIdentitySlotConflict[\s\S]*catch\(rethrowAssignmentSubmissionWriteError\)/,
    'Submission should preserve replay priority, then pass lifecycle, answer validation, scoring, slot persistence, conflict classification, and write-time lifecycle mapping boundaries.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /contentJson: structuredClone\(sourceActivity\.contentJson\)[\s\S]*resolveAssignmentSnapshotSource[\s\S]*snapshot\s*\?\s*snapshot\.activityDescription[\s\S]*snapshot\?\.contentJson \?\? activity\.contentJson[\s\S]*resolveAssignmentRuntimeSource[\s\S]*getRuntimeItems/,
    'Snapshot resolution should clone content and prefer snapshot runtime data.'
  );
  assert.match(
    ASSIGNMENT_DETAIL_QUERY_SOURCE,
    /buildAssignmentDetailOwnerWhere[\s\S]*eq\(assignment\.id, assignmentId\)[\s\S]*eq\(assignment\.ownerId, userId\)[\s\S]*buildAssignmentDetailShareWhere[\s\S]*eq\(assignment\.shareSlug, shareSlug\)/,
    'Assignment detail helpers should separate owner-scoped and public share lookups.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /buildPublicAssignmentPayload[\s\S]*resolveAssignmentRuntimeSource\([\s\S]*runtimeItems: stripRuntimeAnswers\(orderedRuntimeItems\)[\s\S]*buildPublicAssignmentSnapshotSummary[\s\S]*activityTitle: snapshot\.activityTitle[\s\S]*templateType: snapshot\.templateType/,
    'Public payload should use snapshot-aware runtime items and omit snapshot content JSON.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /buildPublicAssignmentUnavailablePayload[\s\S]*runtimeItemsHidden: true[\s\S]*teacherMaterialsHidden: true[\s\S]*rawAnonymousTokenHidden: true[\s\S]*submissionsBlocked: true/,
    'Unavailable public payloads should hide runtime items, teacher materials, raw tokens, and submissions.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /function buildPublicAssignmentSettings[\s\S]*collectStudentName[\s\S]*instructions[\s\S]*maxAttempts[\s\S]*showCorrectAnswers[\s\S]*shuffleItems[\s\S]*timeLimitSeconds/,
    'Public settings should expose only the allowed student-facing delivery rules.'
  );
  assert.match(
    ASSIGNMENT_VALIDATION_SOURCE,
    /resolveAssignmentSettings[\s\S]*collectStudentName[\s\S]*maxAttempts[\s\S]*showCorrectAnswers[\s\S]*shuffleItems[\s\S]*timeLimitSeconds/,
    'Assignment settings should resolve through shared validation defaults.'
  );
  assert.match(
    SHARE_SLUG_SOURCE,
    /normalizeAssignmentShareSlug[\s\S]*normalize\('NFKC'\)\.trim\(\)/,
    'Share slugs should normalize before they become public link identifiers.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /(?=[\s\S]*getAssignmentLifecycleStatus)(?=[\s\S]*isAssignmentOpen)(?=[\s\S]*assertAssignmentAcceptsSubmissions)/,
    'Assignment lifecycle should govern public availability and submissions.'
  );
  assert.match(
    ITEM_ORDER_SOURCE,
    /orderAssignmentRuntimeItems[\s\S]*shuffleItems[\s\S]*shareSlug/,
    'Runtime item ordering should use assignment delivery policy and share slug.'
  );
});

test('attempt persistence, result consumers, and export privacy stay aligned', () => {
  assert.match(
    ATTEMPT_ANSWERS_SOURCE,
    /normalizeSubmittedAttemptAnswers[\s\S]*assertSubmittedAnswersMatchRuntimeItems[\s\S]*duplicate[\s\S]*unknown|unknown[\s\S]*duplicate/,
    'Submitted attempt answers should normalize ids and reject duplicate or unknown runtime ids.'
  );
  assert.match(
    ATTEMPT_IDENTITY_QUERY_SOURCE,
    /resolveAttemptSubmissionIdentity[\s\S]*collectStudentName[\s\S]*normalizeStudentName[\s\S]*normalizeAnonymousToken[\s\S]*countPreviousIdentityAttempts[\s\S]*buildScoredAnonymousAssignmentAttemptWhere[\s\S]*buildScoredAssignmentAttemptWhere/,
    'Attempt identity should normalize names or tokens before counting previous scored attempts.'
  );
  assert.match(
    ATTEMPT_PERSISTENCE_SOURCE,
    /buildScoredAttemptInsert[\s\S]*answersJson: \{[\s\S]*answers: cloneAttemptAnswerRows\(evaluation\.answers\)[\s\S]*templateType[\s\S]*maxScore: evaluation\.result\.totalPoints[\s\S]*resultJson: cloneAttemptResult\(evaluation\.result\)[\s\S]*score: evaluation\.result\.earnedPoints/,
    'Scored attempt persistence should clone answers and result into answer/result JSON plus score fields.'
  );
  assert.match(
    ATTEMPT_QUERY_SOURCE,
    /buildAssignmentResultsAttemptSelect[\s\S]*anonymousToken: attempt\.anonymousToken[\s\S]*answersJson: attempt\.answersJson[\s\S]*resultJson: attempt\.resultJson[\s\S]*buildScoredAttemptWhere[\s\S]*isNotNull\(attempt\.resultJson\)/,
    'Attempt queries should select review data but filter result consumers to scored attempts.'
  );
  assert.match(
    RESULTS_SOURCE,
    /analyzeAssignmentResults[\s\S]*attempts[\s\S]*runtimeItems[\s\S]*attempts\.filter\(hasAttemptResult\)[\s\S]*createStudentIdentityResolver\(completedAttempts\)[\s\S]*normalizeAttemptDurationSeconds/,
    'Result analysis should combine scored attempts, runtime items, identity grouping, and duration normalization.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /AssignmentResultsExportData[\s\S]*activity:[\s\S]*analysis:[\s\S]*assignment:[\s\S]*attempts:[\s\S]*snapshot:[\s\S]*stats:[\s\S]*buildAssignmentResultsCsv[\s\S]*formatAssignmentDeliveryPolicyText[\s\S]*CSV_FORMULA_PREFIX_PATTERN/,
    'Result export should consume assignment context, delivery policy, analysis, attempts, snapshots, stats, and formula guards.'
  );
  assert.doesNotMatch(
    RESULTS_EXPORT_SOURCE,
    /anonymousToken|storageKey/,
    'Results CSV export should never read raw anonymous tokens or storage keys.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /buildPrintableAssignmentWorksheet[\s\S]*resolveAssignmentSnapshotSource\([\s\S]*orderAssignmentRuntimeItems\([\s\S]*toPrintableWorksheetItem[\s\S]*toPrintableWorksheetAnswerKeyItem/,
    'Printable worksheets should consume snapshot-aware runtime items and gate answer-key rendering.'
  );
});

test('classroom data lifecycle chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Classroom data lifecycle chain has a fast script-level gate via[\s\S]*scripts\/classroom-data-lifecycle-chain\.test\.ts/,
    'TEST-CATALOG should document the classroom data lifecycle chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /D1 app schema[\s\S]*activity\/assignment persistence helpers[\s\S]*owner-scoped activity or assignment queries[\s\S]*assignment snapshot freezing[\s\S]*public assignment payload sanitization[\s\S]*attempt persistence[\s\S]*scored-attempt queries[\s\S]*result analysis\/export\/print consumers[\s\S]*source-material\/token privacy guards/,
    'TEST-CATALOG should describe the classroom data lifecycle gate scope.'
  );
  assert.match(
    normalizedCatalog,
    /attempt persistence boundary/,
    'TEST-CATALOG should document the concrete attempt persistence handoff boundary.'
  );
});
