import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES,
} from '@/activities/authoring-library-chain';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';
import {
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES,
} from '@/assignments/published-assignment-delivery-chain';
import { PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/public';
import { PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-view';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import {
  STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES,
} from '@/assignments/student-runner-play-chain';
import {
  TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES,
} from '@/assignments/teacher-results-review-chain';
import {
  CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildClassroomDataLifecycleChainHandoffView,
  type ClassroomDataLifecycleChainHandoffItemId,
  type ClassroomDataLifecycleChainHandoffView,
} from '@/db/classroom-data-lifecycle-chain';

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

const PRIVATE_ACTIVITY_CONTENT = 'SECRET_CLASSROOM_ACTIVITY_CONTENT_JSON';
const PRIVATE_RAW_ANONYMOUS_TOKEN =
  'SECRET_CLASSROOM_RAW_ANONYMOUS_TOKEN_VALUE';
const PRIVATE_SNAPSHOT_CONTENT = 'SECRET_CLASSROOM_SNAPSHOT_CONTENT_JSON';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/classroom.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_CLASSROOM_STUDENT_ANSWER_TEXT';
const PRIVATE_TEACHER_ANSWER = 'SECRET_CLASSROOM_TEACHER_ANSWER_KEY';

test('classroom data lifecycle chain exposes 30 safe data slices', () => {
  const handoffView = buildClassroomDataLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Classroom data lifecycle chain');
  assert.match(
    handoffView.description,
    /Thirty-slice classroom data lifecycle chain/
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
    chainSourceFileCount: CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    createsParallelWorksheetTables: false,
    exposesActivityContentJsonToPublicPayload: false,
    exposesAnswerTextInPersistenceHandoff: false,
    exposesRawAnonymousTokens: false,
    exposesRawSubmissionPayloadInPersistenceHandoff: false,
    exposesRuntimeItemIdsInPersistenceHandoff: false,
    exposesSnapshotContentJsonToPublicPayload: false,
    exposesSourceMaterialStorageKeys: false,
    exposesSourceMaterialMetadataInPersistenceHandoff: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentNameInPersistenceHandoff: false,
    exposesTeacherAnswerKeysBeforeReview: false,
    exposesTeacherOnlyAnswersInPersistenceHandoff: false,
    freezesSnapshotContent: true,
    itemIds,
    mutatesEvaluationAfterInsert: false,
    persistsAttemptsAfterValidation: true,
    publicPayloadUsesRuntimeItemsOnly: true,
    publishesAssignmentAndSnapshotTogether: true,
    requiresOwnerScopedActivities: true,
    requiresOwnerScopedAssignments: true,
    resultConsumersUseScoredAttempts: true,
    sourceFiles: [...CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES],
    storesScoredAttemptRows: true,
    usesAttemptPersistenceHandoff: true,
    usesD1AppSchema: true,
    usesSnapshotForPublicRuntime: true,
    usesScoredAttemptInsertHelper: true,
  });
  assertNoPrivateClassroomDataText(JSON.stringify(handoffView));
});

test('classroom data lifecycle chain summarizes persistence flow', () => {
  const handoffView = buildClassroomDataLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-data-model', 'Activity -> Assignment -> Attempt -> Results'],
      ['d1-app-schema-boundary', 'app.schema.ts'],
      ['activity-table-owner-scope', 'owner_id'],
      ['activity-content-json', 'ActivityContent'],
      ['activity-template-visibility-indexes', 'template + visibility'],
      ['activity-create-persistence', 'buildActivityCreateInsert'],
      ['activity-update-persistence', 'buildActivityUpdateSet'],
      ['activity-derivative-draft-persistence', 'draft clone'],
      ['activity-owner-query-scope', 'Owner where helpers'],
      ['assignment-table-owner-scope', 'owner_id + activity_id'],
      ['assignment-settings-json', 'AssignmentSettings'],
      ['assignment-share-slug-uniqueness', 'unique share_slug'],
      ['assignment-lifecycle-fields', 'status + expiresAt'],
      ['assignment-publish-transaction', 'assignment + snapshot'],
      ['assignment-snapshot-table', 'assignment_snapshot'],
      ['snapshot-content-clone', 'structuredClone'],
      ['snapshot-runtime-source', 'resolveAssignmentRuntimeSource'],
      ['public-payload-sanitization', 'Runtime items only'],
      ['public-unavailable-guard', 'Runtime hidden'],
      ['attempt-table-identity', 'name or browser token'],
      ['attempt-answer-result-json', 'answersJson + resultJson'],
      ['attempt-persistence-helper', 'buildScoredAttemptInsert'],
      ['attempt-query-scored-filter', 'resultJson required'],
      ['attempt-limit-identity-count', 'Normalized identity'],
      ['result-analysis-consumer', 'runtime items + attempts'],
      ['result-export-consumer', 'Private CSV'],
      ['printable-worksheet-consumer', 'Frozen runtime items'],
      ['source-material-storage-key-guard', 'Storage keys hidden'],
      ['raw-student-token-guard', 'Anonymous token hidden'],
      ['attempt-persistence-handoff-boundary', '30 persistence handoff slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-publish-transaction'),
    'assignment + snapshot'
  );
  assert.equal(
    getHandoffValue(handoffView, 'snapshot-runtime-source'),
    'resolveAssignmentRuntimeSource'
  );
});

test('classroom data lifecycle chain is backed by adjacent 30-item gates', () => {
  assert.equal(CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of CLASSROOM_DATA_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing classroom data lifecycle chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 12 }, () => 30)
  );
});

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
    /publishAssignment = createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildActivityDetailOwnerWhere\([\s\S]*assertActivityCanDeriveWork\(sourceActivity\.visibility\)[\s\S]*await db\.transaction\(async \(tx\) => \{[\s\S]*tx\.insert\(assignment\)[\s\S]*buildPublishedAssignmentInsert[\s\S]*tx\.insert\(assignmentSnapshot\)[\s\S]*buildPublishedAssignmentSnapshotInsert/,
    'Publishing should require owner scope, lifecycle derivation, and assignment/snapshot transaction.'
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
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /exposesCsvDataUrl: false[\s\S]*exposesPromptText: false[\s\S]*exposesRawAnonymousToken: false[\s\S]*exposesStudentAnswerText: false[\s\S]*exposesTeacherAnswerText: false/,
    'Result export preparation handoff should keep private CSV, prompt, token, and answer text out of audit summaries.'
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
    /Classroom data lifecycle chain has a fast script-level gate via[\s\S]*scripts\/classroom-data-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the classroom data lifecycle chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /D1 app schema[\s\S]*activity\/assignment persistence helpers[\s\S]*owner-scoped activity or assignment queries[\s\S]*assignment snapshot freezing[\s\S]*public assignment payload sanitization[\s\S]*attempt persistence[\s\S]*scored-attempt queries[\s\S]*result analysis\/export\/print consumers[\s\S]*source-material\/token privacy guards/,
    'TEST-CATALOG should describe the classroom data lifecycle gate scope.'
  );
  assert.match(
    normalizedCatalog,
    /attempt persistence handoff boundary/,
    'TEST-CATALOG should document the concrete attempt persistence handoff boundary.'
  );
});

function getHandoffValue(
  view: ClassroomDataLifecycleChainHandoffView,
  id: ClassroomDataLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing classroom data lifecycle chain item ${id}`);
  return item.value;
}

function assertNoPrivateClassroomDataText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_RAW_ANONYMOUS_TOKEN,
    PRIVATE_SNAPSHOT_CONTENT,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_TEACHER_ANSWER,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Classroom data lifecycle chain leaked private text: ${privateValue}`
    );
  }
}
