import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS } from '@/activities/library-view';
import { ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS } from '@/assignments/list-view';
import {
  DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS,
  buildDashboardOverviewPageViewModel,
} from '@/dashboard/overview';
import {
  TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES,
  buildTeacherWorkspaceOperationsChainHandoffView,
  type TeacherWorkspaceOperationsChainHandoffItemId,
  type TeacherWorkspaceOperationsChainHandoffView,
} from '@/dashboard/teacher-workspace-operations-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { Routes } from '@/lib/routes';
import { SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/account-handoff';
import { SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/billing-view';
import { SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS } from '@/settings/files-material-classification-view';
import { SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS } from '@/settings/files-view';
import { SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS } from '@/settings/notifications-view';
import { SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/security-handoff';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const DASHBOARD_OVERVIEW_SOURCE = readFileSync(
  'src/dashboard/overview.ts',
  'utf8'
);
const ACTIVITY_LIBRARY_SOURCE = readFileSync(
  'src/activities/library-view.ts',
  'utf8'
);
const ACTIVITY_LIBRARY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const ASSIGNMENT_LIST_SOURCE = readFileSync(
  'src/assignments/list-view.ts',
  'utf8'
);
const ASSIGNMENT_LIST_QUERY_SOURCE = readFileSync(
  'src/assignments/list-query.ts',
  'utf8'
);
const SETTINGS_ACCOUNT_SOURCE = readFileSync(
  'src/settings/account-handoff.ts',
  'utf8'
);
const SETTINGS_SECURITY_SOURCE = readFileSync(
  'src/settings/security-handoff.ts',
  'utf8'
);
const SETTINGS_FILES_SOURCE = readFileSync(
  'src/settings/files-view.ts',
  'utf8'
);
const SETTINGS_FILES_CLASSIFICATION_SOURCE = readFileSync(
  'src/settings/files-material-classification-view.ts',
  'utf8'
);
const SETTINGS_BILLING_SOURCE = readFileSync(
  'src/settings/billing-view.ts',
  'utf8'
);
const SETTINGS_NOTIFICATION_SOURCE = readFileSync(
  'src/settings/notifications-view.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACTIVITY_CONTENT =
  'SECRET_TEACHER_WORKSPACE_PRIVATE_ACTIVITY_CONTENT';
const PRIVATE_ASSIGNMENT_RUNTIME =
  'SECRET_TEACHER_WORKSPACE_ASSIGNMENT_RUNTIME_PAYLOAD';
const PRIVATE_AUTH_SECRET = 'SECRET_TEACHER_WORKSPACE_AUTH_SECRET';
const PRIVATE_PROVIDER_SECRET = 'SECRET_TEACHER_WORKSPACE_PROVIDER_SECRET';
const PRIVATE_RESULT_EXPORT_ROW = 'SECRET_TEACHER_WORKSPACE_RESULT_EXPORT_ROW';
const PRIVATE_SOURCE_FILE_ID = 'SECRET_TEACHER_WORKSPACE_SOURCE_FILE_ID';
const PRIVATE_SOURCE_FILENAME = 'secret-teacher-workspace-source-material.pdf';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/teacher-workspace.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_TEACHER_WORKSPACE_STUDENT_ANSWER_TEXT';
const PRIVATE_STUDENT_TOKEN = 'SECRET_TEACHER_WORKSPACE_RAW_ANONYMOUS_TOKEN';
const PRIVATE_TEACHER_EMAIL = 'teacher-workspace-private@example.test';

test('teacher workspace operations chain exposes 30 safe authenticated slices', () => {
  const handoffView = buildTeacherWorkspaceOperationsChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Teacher workspace operations chain');
  assert.match(
    handoffView.description,
    /Thirty-slice authenticated teacher workspace operations chain/
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
    chainSourceFileCount:
      TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES.length,
    countsStarterPreviewAsOwned: false,
    exposesAssignmentRuntimeContent: false,
    exposesAuthSecrets: false,
    exposesPrivateActivityContent: false,
    exposesProviderSecrets: false,
    exposesRawAnonymousTokens: false,
    exposesResultExportRows: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherEmail: false,
    itemIds,
    keepsActivityLibraryOwnerScoped: true,
    keepsAssignmentListOwnerScoped: true,
    keepsDashboardOwnerScoped: true,
    keepsSettingsFromMutatingClassroomData: true,
    keepsVisiblePageCountsSeparate: true,
    sourceFiles: [...TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES],
    usesFullFilteredSummariesForOverview: true,
  });
  assertNoPrivateTeacherWorkspaceText(JSON.stringify(handoffView));
});

test('teacher workspace operations chain summarizes dashboard through settings flow', () => {
  const handoffView = buildTeacherWorkspaceOperationsChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['dashboard-owner-scope', 'Owner summaries only'],
      ['dashboard-starter-preview-boundary', 'Preview only'],
      ['dashboard-independent-loading', 'Split loading'],
      ['dashboard-top-metrics', 'Activities/templates/assignments/results'],
      ['dashboard-loop-status', 'Core loop status'],
      ['dashboard-next-actions', 'Create/publish/share/review'],
      ['dashboard-readiness', 'Activity/link/runner/results'],
      ['activity-library-route', Routes.DashboardActivities],
      ['activity-library-owner-scope', 'Owner activities only'],
      ['activity-library-search-filter', 'Search/status/template/source'],
      ['activity-library-summary', 'Full filtered summary'],
      ['activity-library-visible-page', 'Visible page separate'],
      ['activity-library-actions', 'Edit/publish/duplicate/remix/archive'],
      ['activity-library-starter-preview', 'Preview only'],
      ['assignment-list-route', Routes.DashboardAssignments],
      ['assignment-list-owner-scope', 'Owner assignments only'],
      ['assignment-list-search-status', 'Search/status'],
      ['assignment-list-summary', 'Full filtered summary'],
      ['assignment-list-visible-page', 'Visible page separate'],
      ['assignment-list-distribution', 'Copy/preview/print/review'],
      ['assignment-list-published-context', 'Post-publish handoff'],
      ['settings-account-boundary', Routes.SettingsProfile],
      ['settings-security-boundary', Routes.SettingsSecurity],
      ['settings-files-boundary', Routes.SettingsFiles],
      ['settings-files-classification', 'Safe material labels'],
      ['settings-billing-boundary', Routes.SettingsBilling],
      ['settings-notification-boundary', Routes.SettingsNotifications],
      ['workspace-private-data-guard', 'Private data hidden'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['teacher-workspace-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-library-route'),
    Routes.DashboardActivities
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-list-route'),
    Routes.DashboardAssignments
  );
  assert.equal(
    getHandoffValue(handoffView, 'settings-notification-boundary'),
    Routes.SettingsNotifications
  );
});

test('teacher workspace operations chain is backed by focused workspace gates', () => {
  assert.equal(TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing teacher workspace operations chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS.length,
      SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_SECURITY_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_FILES_SOURCE_MATERIAL_HANDOFF_ITEM_IDS.length,
      SETTINGS_FILES_MATERIAL_CLASSIFICATION_HANDOFF_ITEM_IDS.length,
      SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 9 }, () => 30)
  );
});

test('teacher workspace operations chain preserves docs product boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /authenticated teacher dashboard should use owner-scoped activity and[\s\S]*assignment summaries for top metrics[\s\S]*starter\/demo activities may appear as[\s\S]*preview content[\s\S]*must not be counted as the teacher's real library,[\s\S]*open links, or results/i,
    'docs/product.md should keep dashboard metrics owner-scoped and starter previews out of real counts.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /activity library should stay usable as a teacher's collection grows[\s\S]*search their own activities[\s\S]*same authenticated list contract powers[\s\S]*search never broadens beyond the current owner/i,
    'docs/product.md should keep activity library search owner-scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Activity library overview cards summarize[\s\S]*full current filter result,[\s\S]*not only the visible page/i,
    'docs/product.md should keep activity library overview summaries full-filter scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /assignment list should remain searchable[\s\S]*filter their own assignments by title,[\s\S]*share id, source activity text, or assignment status[\s\S]*without broadening outside[\s\S]*current owner/i,
    'docs/product.md should keep assignment list filters owner-scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Assignment list overview cards summarize[\s\S]*full current filter result,[\s\S]*not only the visible page/i,
    'docs/product.md should keep assignment list overview summaries full-filter scoped.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Authenticated teacher workspace, student runner,[\s\S]*results, print, and authoring tool surfaces may still use hidden semantic[\s\S]*outputs where they support workflow QA and accessibility/i,
    'docs/product.md should allow hidden semantic outputs in authenticated teacher workspace surfaces.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /active account\/contact copy[\s\S]*current forms, billing pages, and[\s\S]*configuration examples should speak in ClassGamify terms/i,
    'docs/product.md should keep settings and billing copy on ClassGamify terms.'
  );
});

test('teacher workspace operations sources preserve owner scope and preview boundaries', () => {
  assert.match(
    DASHBOARD_OVERVIEW_SOURCE,
    /countsStarterPreviewAsOwnedMetrics: false[\s\S]*usesOwnerScopedSummaries: true/,
    'Dashboard overview privacy contract should exclude starter previews from owner metrics.'
  );
  assert.match(
    DASHBOARD_OVERVIEW_SOURCE,
    /keepsActivityLoadingIndependent: true[\s\S]*keepsAssignmentLoadingIndependent: true/,
    'Dashboard overview should keep activity and assignment loading independent.'
  );
  assert.match(
    DASHBOARD_OVERVIEW_SOURCE,
    /getDashboardOverviewActionCards[\s\S]*Routes\.DashboardActivities[\s\S]*Routes\.DashboardAssignments[\s\S]*Routes\.StudentPreview/,
    'Dashboard action cards should resolve workspace routes from the dashboard domain.'
  );
  assert.match(
    ACTIVITY_LIBRARY_SOURCE,
    /broadensBeyondOwner: false[\s\S]*countsStarterPreviewAsOwned: false[\s\S]*usesFullFilteredSummaryForOverview: true/,
    'Activity library privacy boundary should keep owner scope and full filtered summaries.'
  );
  assert.match(
    ACTIVITY_LIBRARY_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(activity\.ownerId, userId\)\][\s\S]*sqlLikeContains\(activity\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.description, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.templateType, normalizedSearch\)/,
    'Activity library query should combine search with owner scope.'
  );
  assert.match(
    ASSIGNMENT_LIST_SOURCE,
    /broadensBeyondOwner: false[\s\S]*countsStarterPreviewAsOwned: false[\s\S]*keepsDistributionStepsPrepared: true/,
    'Assignment list privacy boundary should keep owner scope and distribution readiness.'
  );
  assert.match(
    ASSIGNMENT_LIST_SOURCE,
    /searchMatchesAssignmentTitle: true[\s\S]*searchMatchesShareSlug: true[\s\S]*searchMatchesSourceActivityText: true/,
    'Assignment list boundary should keep title, share slug, and source activity search semantics.'
  );
  assert.match(
    ASSIGNMENT_LIST_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(assignment\.ownerId, userId\)\][\s\S]*sqlLikeContains\(assignment\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(assignment\.shareSlug, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.title, normalizedSearch\)/,
    'Assignment list query should combine search with owner scope.'
  );

  const pageView = buildDashboardOverviewPageViewModel({
    activitySummary: {
      draftActivities: 2,
      templateCoverage: 3,
      totalActivities: 5,
    },
    assignmentSummary: {
      averageScore: 82,
      completions: 7,
      openAssignments: 2,
      totalAssignments: 4,
    },
  });

  assert.equal(
    pageView.queryBoundary.countsStarterPreviewAsOwnedMetrics,
    false
  );
  assert.equal(pageView.queryBoundary.ownerActivityCount, 5);
  assert.equal(pageView.queryBoundary.ownerAssignmentCount, 4);
  assert.equal(pageView.preview.source, 'starter-preview');
});

test('teacher workspace settings boundaries do not mutate classroom data', () => {
  assert.match(
    SETTINGS_ACCOUNT_SOURCE,
    /changesActivityContent: false[\s\S]*changesPublicAssignmentLinks: false[\s\S]*exposesAuthSecrets: false[\s\S]*modifiesAssignmentSnapshots: false[\s\S]*modifiesStudentAttempts: false/,
    'Account settings handoff should not mutate classroom content, links, snapshots, or attempts.'
  );
  assert.match(
    SETTINGS_SECURITY_SOURCE,
    /changesActivityContent: false[\s\S]*changesPublicAssignmentLinks: false[\s\S]*exposesAuthSecrets: false[\s\S]*exposesPasswordValues: false[\s\S]*exposesProviderErrors: false[\s\S]*modifiesAssignmentSnapshots: false[\s\S]*modifiesStudentAttempts: false/,
    'Security settings handoff should hide secrets and avoid classroom data mutation.'
  );
  assert.match(
    SETTINGS_FILES_SOURCE,
    /exposesFileBytes: false[\s\S]*exposesPermissionMetadata: false[\s\S]*exposesRawStudentIdentity: false[\s\S]*exposesSourceMaterialStorageKeys: false[\s\S]*exposesTeacherPrivateFilenames: false[\s\S]*publicPayloadIncludesFileList: false[\s\S]*storageKeysStayServerSide: true/,
    'Settings files handoff should protect source-material file metadata.'
  );
  assert.match(
    SETTINGS_FILES_CLASSIFICATION_SOURCE,
    /classificationUsesSafeBasenameExtension: true[\s\S]*exposesFileBytes: false[\s\S]*exposesOriginalFilenames: false[\s\S]*exposesPermissionMetadata: false[\s\S]*exposesSourceMaterialStorageKeys: false/,
    'Settings files classification should use safe extension labels without exposing file bytes or storage keys.'
  );
  assert.match(
    SETTINGS_BILLING_SOURCE,
    /changesActivityContent: false[\s\S]*changesAssignmentLinks: false[\s\S]*exposesPaymentProviderSecrets: false[\s\S]*hostedBillingOnly: true[\s\S]*modifiesAssignmentSnapshots: false/,
    'Billing settings should expose hosted billing controls without classroom data mutation.'
  );
  assert.match(
    SETTINGS_NOTIFICATION_SOURCE,
    /changesActivityContent: false[\s\S]*changesActivityLibrary: false[\s\S]*changesAssignmentSnapshots: false[\s\S]*changesAttemptRecords: false[\s\S]*changesPublicAssignmentLinks: false[\s\S]*notifiesLearners: false[\s\S]*sendsStudentAssignmentReminders: false/,
    'Notification settings should remain teacher product-email preferences, not learner notifications.'
  );
});

test('teacher workspace operations chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Teacher workspace operations chain has a fast script-level gate via[\s\S]*scripts\/teacher-workspace-operations-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the teacher workspace operations chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /dashboard owner summaries[\s\S]*activity library filters\/summaries\/actions[\s\S]*assignment list filters\/distribution[\s\S]*teacher settings account\/security\/files\/billing\/notification boundaries/,
    'TEST-CATALOG should describe the full teacher workspace operations chain scope.'
  );
});

function getHandoffValue(
  view: TeacherWorkspaceOperationsChainHandoffView,
  id: TeacherWorkspaceOperationsChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing teacher workspace operations chain item ${id}`);
  return item.value;
}

function assertNoPrivateTeacherWorkspaceText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ASSIGNMENT_RUNTIME,
    PRIVATE_AUTH_SECRET,
    PRIVATE_PROVIDER_SECRET,
    PRIVATE_RESULT_EXPORT_ROW,
    PRIVATE_SOURCE_FILE_ID,
    PRIVATE_SOURCE_FILENAME,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_TOKEN,
    PRIVATE_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Teacher workspace operations chain leaked private text: ${privateValue}`
    );
  }
}
