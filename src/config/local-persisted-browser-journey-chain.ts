import { Routes } from '@/lib/routes';

export const LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_HANDOFF_ITEM_IDS = [
  'test-account-isolation',
  'teacher-auth-session',
  'create-route-entry',
  'activity-editor-save',
  'saved-activity-library-return',
  'publish-dialog-entry',
  'assignment-title-settings',
  'assignment-publish-success',
  'share-link-distribution',
  'public-runner-open',
  'student-identity-entry',
  'partial-answer-progress',
  'partial-submit-confirmation',
  'completed-submit-persistence',
  'retry-attempt-state',
  'results-route-entry',
  'result-material-handoff-dom',
  'result-review-handoff-dom',
  'result-filter-url-state',
  'copy-artifact-handoff-dom',
  'classroom-brief-copy',
  'csv-export-download',
  'printable-worksheet-route',
  'printable-worksheet-handoff-dom',
  'answer-key-hidden-default',
  'answer-key-explicit-toggle',
  'answer-key-url-state',
  'return-to-results-route',
  'browser-health-monitor',
  'private-data-guard',
] as const;

export const LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'tests/e2e/TEST-CATALOG.md',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'tests/e2e/fixtures/auth.ts',
  'tests/e2e/fixtures/page-health.ts',
  'src/routes/create.tsx',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/created-activity-panel.tsx',
  'src/components/activities/activity-publish-dialog.tsx',
  'src/components/activities/activity-publish-settings-form.tsx',
  'src/api/assignments.ts',
  'src/routes/dashboard/activities.tsx',
  'src/routes/dashboard/assignments.tsx',
  'src/components/assignments/published-assignment-panel.tsx',
  'src/components/assignments/assignment-list-card.tsx',
  'src/routes/play/$shareId.tsx',
  'src/components/assignments/student-runner-header-card.tsx',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/components/assignments/student-runner-submit-controls.tsx',
  'src/components/assignments/student-runner-submission-handoff.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/components/assignments/assignment-results-review-handoff-panel.tsx',
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'src/components/assignments/assignment-results-item-performance-table.tsx',
  'src/components/assignments/assignment-results-student-search.tsx',
  'src/assignments/results-export.ts',
  'src/routes/print/assignments/$assignmentId.tsx',
  'src/components/assignments/printable-worksheet-toolbar.tsx',
  'src/components/assignments/printable-worksheet-handoff.tsx',
] as const;

export type LocalPersistedBrowserJourneyChainHandoffItemId =
  (typeof LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type LocalPersistedBrowserJourneyChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: LocalPersistedBrowserJourneyChainHandoffItemId;
  label: string;
  value: string;
};

export type LocalPersistedBrowserJourneyChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinksWithoutTeacherAction: false;
  exposesActivityContentJson: false;
  exposesAnswerKeyTextInHandoff: false;
  exposesAnswerKeysBeforeExplicitToggle: false;
  exposesClipboardPrivateData: false;
  exposesCsvDataUrl: false;
  exposesInternalActivityIds: false;
  exposesInternalAssignmentIds: false;
  exposesProviderSecrets: false;
  exposesRawAnonymousTokens: false;
  exposesRawRouteSearchText: false;
  exposesRawStudentIdentity: false;
  exposesResultExportRows: false;
  exposesRuntimeItemIds: false;
  exposesShareSlugInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesTeacherEmail: false;
  itemIds: LocalPersistedBrowserJourneyChainHandoffItemId[];
  keepsCopyCsvPrintReadOnly: true;
  keepsPublicRunnerStudentSafe: true;
  keepsResultReviewTeacherScoped: true;
  keepsStudentAttemptPersistedBeforeResults: true;
  requiresAuthenticatedTeacher: true;
  requiresExplicitAnswerKeyToggle: true;
  requiresLocalE2eAccountIsolation: true;
  scope: 'local-persisted-browser-journey';
  sourceFiles: string[];
  usesActivityEditorSaveFlow: true;
  usesAssignmentPublishHandoff: true;
  usesAssignmentResultCopyHandoff: true;
  usesAssignmentResultMaterialHandoff: true;
  usesAssignmentResultReviewHandoff: true;
  usesCsvExportPreparationHandoff: true;
  usesPageHealthMonitor: true;
  usesPrintableWorksheetHandoff: true;
  usesStudentRunnerSubmissionHandoff: true;
};

export type LocalPersistedBrowserJourneyChainHandoffView = {
  description: string;
  itemViews: LocalPersistedBrowserJourneyChainHandoffItemView[];
  privacy: LocalPersistedBrowserJourneyChainPrivacyContract;
  title: string;
};

export function buildLocalPersistedBrowserJourneyChainHandoffView(): LocalPersistedBrowserJourneyChainHandoffView {
  const itemViews = LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildLocalPersistedBrowserJourneyChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice local persisted browser journey from a saved teacher activity through assignment publishing, student attempt persistence, teacher result review, copy and CSV actions, printable worksheet answer-key review, return-to-results navigation, browser health, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinksWithoutTeacherAction: false,
      exposesActivityContentJson: false,
      exposesAnswerKeyTextInHandoff: false,
      exposesAnswerKeysBeforeExplicitToggle: false,
      exposesClipboardPrivateData: false,
      exposesCsvDataUrl: false,
      exposesInternalActivityIds: false,
      exposesInternalAssignmentIds: false,
      exposesProviderSecrets: false,
      exposesRawAnonymousTokens: false,
      exposesRawRouteSearchText: false,
      exposesRawStudentIdentity: false,
      exposesResultExportRows: false,
      exposesRuntimeItemIds: false,
      exposesShareSlugInHandoff: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesTeacherEmail: false,
      itemIds: [...LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_HANDOFF_ITEM_IDS],
      keepsCopyCsvPrintReadOnly: true,
      keepsPublicRunnerStudentSafe: true,
      keepsResultReviewTeacherScoped: true,
      keepsStudentAttemptPersistedBeforeResults: true,
      requiresAuthenticatedTeacher: true,
      requiresExplicitAnswerKeyToggle: true,
      requiresLocalE2eAccountIsolation: true,
      scope: 'local-persisted-browser-journey',
      sourceFiles: [...LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES],
      usesActivityEditorSaveFlow: true,
      usesAssignmentPublishHandoff: true,
      usesAssignmentResultCopyHandoff: true,
      usesAssignmentResultMaterialHandoff: true,
      usesAssignmentResultReviewHandoff: true,
      usesCsvExportPreparationHandoff: true,
      usesPageHealthMonitor: true,
      usesPrintableWorksheetHandoff: true,
      usesStudentRunnerSubmissionHandoff: true,
    },
    title: 'Local persisted browser journey chain',
  };
}

function buildLocalPersistedBrowserJourneyChainHandoffItemView(
  id: LocalPersistedBrowserJourneyChainHandoffItemId
): LocalPersistedBrowserJourneyChainHandoffItemView {
  const item = getLocalPersistedBrowserJourneyChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getLocalPersistedBrowserJourneyChainHandoffItem(
  id: LocalPersistedBrowserJourneyChainHandoffItemId
): Omit<LocalPersistedBrowserJourneyChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'test-account-isolation':
      return item(
        id,
        'Test account isolation',
        'E2E user cleanup',
        'The journey starts with local e2e accounts and cleanup helpers so persisted classroom records stay isolated.'
      );
    case 'teacher-auth-session':
      return item(
        id,
        'Teacher auth session',
        'Authenticated teacher',
        'The saved activity, assignment list, results, and print routes run as the same authenticated teacher.'
      );
    case 'create-route-entry':
      return item(
        id,
        'Create route entry',
        Routes.Create,
        'The teacher enters the reusable activity authoring workflow from the create route.'
      );
    case 'activity-editor-save':
      return item(
        id,
        'Activity editor save',
        'Saved activity',
        'The activity editor persists teacher-reviewed structured content before any assignment link exists.'
      );
    case 'saved-activity-library-return':
      return item(
        id,
        'Activity library return',
        Routes.DashboardActivities,
        'After save, the teacher returns to the owner-scoped activity library with a saved-activity panel.'
      );
    case 'publish-dialog-entry':
      return item(
        id,
        'Publish dialog entry',
        'Teacher publish action',
        'Publishing starts only from the saved activity panel and keeps the publish dialog teacher controlled.'
      );
    case 'assignment-title-settings':
      return item(
        id,
        'Assignment settings',
        'Title and delivery fields',
        'The journey fills assignment title and delivery controls through the prepared publish form.'
      );
    case 'assignment-publish-success':
      return item(
        id,
        'Assignment publish success',
        'Frozen share link',
        'A successful publish freezes the activity snapshot and redirects to the assignment list.'
      );
    case 'share-link-distribution':
      return item(
        id,
        'Share link distribution',
        Routes.DashboardAssignments,
        'The assignment list exposes copy, student preview, print, and result-review actions from the persisted assignment.'
      );
    case 'public-runner-open':
      return item(
        id,
        'Public runner open',
        '/play/:shareId',
        'The generated student link opens the sanitized public runner without teacher-only answers.'
      );
    case 'student-identity-entry':
      return item(
        id,
        'Student identity entry',
        'Student name',
        'The student enters display identity through the public runner before submitting answers.'
      );
    case 'partial-answer-progress':
      return item(
        id,
        'Partial answer progress',
        'Answered counter',
        'The runner reports answered and unanswered counts while the attempt is in progress.'
      );
    case 'partial-submit-confirmation':
      return item(
        id,
        'Partial submit confirmation',
        'Submit anyway gate',
        'Partial submissions require an explicit confirmation before the student can send incomplete work.'
      );
    case 'completed-submit-persistence':
      return item(
        id,
        'Completed submit persistence',
        'Scored attempt',
        'Completed answers are scored and persisted before the teacher opens the results route.'
      );
    case 'retry-attempt-state':
      return item(
        id,
        'Retry attempt state',
        'Remaining attempts',
        'The runner can start another attempt while preserving the student identity value.'
      );
    case 'results-route-entry':
      return item(
        id,
        'Results route entry',
        '/dashboard/assignments/:assignmentId',
        'The teacher returns to the owner-scoped results page for the persisted assignment.'
      );
    case 'result-material-handoff-dom':
      return item(
        id,
        'Result material handoff DOM',
        '30 material slices',
        'The rendered result page exposes the assignment-result-material handoff as 30 hidden semantic slices.'
      );
    case 'result-review-handoff-dom':
      return item(
        id,
        'Result review handoff DOM',
        '30 review slices',
        'The rendered result page exposes current review status, scope, controls, and matched counts.'
      );
    case 'result-filter-url-state':
      return item(
        id,
        'Result filter URL state',
        'Search/sort/review route state',
        'Student search, student sort, item sort, and answer-review filters stay reflected in the URL.'
      );
    case 'copy-artifact-handoff-dom':
      return item(
        id,
        'Copy artifact handoff DOM',
        '30 copy slices',
        'The classroom brief copy surface exposes a hidden 30-slice copy artifact handoff.'
      );
    case 'classroom-brief-copy':
      return item(
        id,
        'Classroom brief copy',
        'Clipboard text',
        'Copying a classroom brief uses the current review data and confirms clipboard success.'
      );
    case 'csv-export-download':
      return item(
        id,
        'CSV export download',
        'Full assignment CSV',
        'CSV download uses full-assignment result data and preserves gradebook-ready columns.'
      );
    case 'printable-worksheet-route':
      return item(
        id,
        'Printable worksheet route',
        '/print/assignments/:assignmentId',
        'The teacher opens the authenticated print route from results without public marketing chrome.'
      );
    case 'printable-worksheet-handoff-dom':
      return item(
        id,
        'Printable worksheet handoff DOM',
        '30 worksheet slices',
        'The rendered print page exposes 30 hidden semantic slices for handout and print readiness.'
      );
    case 'answer-key-hidden-default':
      return item(
        id,
        'Answer key hidden default',
        'Hidden by default',
        'Teacher-only answer keys remain hidden until the teacher explicitly includes them.'
      );
    case 'answer-key-explicit-toggle':
      return item(
        id,
        'Answer key explicit toggle',
        'Include answer key',
        'The answer-key switch is the explicit teacher action that reveals the printable key.'
      );
    case 'answer-key-url-state':
      return item(
        id,
        'Answer key URL state',
        'answerKey=true',
        'The print route records answer-key inclusion in URL state for repeatable teacher review.'
      );
    case 'return-to-results-route':
      return item(
        id,
        'Return to results route',
        Routes.DashboardAssignments,
        'The print page sends the teacher back to the same assignment results route.'
      );
    case 'browser-health-monitor':
      return item(
        id,
        'Browser health monitor',
        'No browser errors',
        'The local journey records browser errors and asserts a clean page-health monitor.'
      );
    case 'private-data-guard':
      return item(
        id,
        'Private data guard',
        'Private data hidden',
        'The journey contract excludes raw ids, tokens, answer text, CSV data URLs, storage keys, secrets, and teacher email from handoffs.'
      );
  }
}

function item(
  id: LocalPersistedBrowserJourneyChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<LocalPersistedBrowserJourneyChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
