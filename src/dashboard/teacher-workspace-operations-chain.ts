import { Routes } from '@/lib/routes';

export const TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS = [
  'dashboard-owner-scope',
  'dashboard-starter-preview-boundary',
  'dashboard-independent-loading',
  'dashboard-top-metrics',
  'dashboard-loop-status',
  'dashboard-next-actions',
  'dashboard-readiness',
  'activity-library-route',
  'activity-library-owner-scope',
  'activity-library-search-filter',
  'activity-library-summary',
  'activity-library-visible-page',
  'activity-library-actions',
  'activity-library-starter-preview',
  'assignment-list-route',
  'assignment-list-owner-scope',
  'assignment-list-search-status',
  'assignment-list-summary',
  'assignment-list-visible-page',
  'assignment-list-distribution',
  'assignment-list-published-context',
  'account-governance-lifecycle-chain',
  'settings-security-boundary',
  'settings-files-boundary',
  'settings-files-classification',
  'settings-billing-payment-boundary',
  'settings-notification-boundary',
  'workspace-private-data-guard',
  'active-surface-product-boundary',
  'teacher-workspace-chain-gate',
] as const;

export const TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/dashboard/overview.ts',
  'src/routes/dashboard/index.tsx',
  'src/components/dashboard/dashboard-overview-handoff-panel.tsx',
  'src/components/dashboard/dashboard-overview-metric-card.tsx',
  'src/components/dashboard/dashboard-overview-loop-status-panel.tsx',
  'src/activities/library-view.ts',
  'src/activities/library-filters.ts',
  'src/activities/library-query.ts',
  'src/activities/library-summary.ts',
  'src/routes/dashboard/activities.tsx',
  'src/components/activities/activity-library-search.tsx',
  'src/components/activities/activity-library-card.tsx',
  'src/assignments/list-view.ts',
  'src/assignments/list-filters.ts',
  'src/assignments/list-query.ts',
  'src/assignments/list-summary.ts',
  'src/routes/dashboard/assignments.tsx',
  'src/components/assignments/assignment-list-filters.tsx',
  'src/components/assignments/assignment-list-card.tsx',
  'src/auth/account-governance-lifecycle-chain.ts',
  'src/settings/security-handoff.ts',
  'src/settings/files-view.ts',
  'src/settings/files-material-classification-view.ts',
  'src/settings/billing-view.ts',
  'src/settings/notifications-view.ts',
  'src/payment/payment-status-view.ts',
  'src/config/active-surface-product-boundary.ts',
  'src/routes/settings/files.tsx',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type TeacherWorkspaceOperationsChainHandoffItemId =
  (typeof TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS)[number];

export type TeacherWorkspaceOperationsChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: TeacherWorkspaceOperationsChainHandoffItemId;
  label: string;
  value: string;
};

export type TeacherWorkspaceOperationsChainPrivacyContract = {
  chainSourceFileCount: number;
  countsStarterPreviewAsOwned: false;
  exposesAssignmentRuntimeContent: false;
  exposesAuthSecrets: false;
  exposesPrivateActivityContent: false;
  exposesProviderSecrets: false;
  exposesRawAnonymousTokens: false;
  exposesResultExportRows: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesTeacherEmail: false;
  itemIds: TeacherWorkspaceOperationsChainHandoffItemId[];
  keepsActivityLibraryOwnerScoped: true;
  keepsAssignmentListOwnerScoped: true;
  keepsDashboardOwnerScoped: true;
  keepsSettingsFromMutatingClassroomData: true;
  keepsVisiblePageCountsSeparate: true;
  sourceFiles: string[];
  usesAccountGovernanceLifecycleChain: true;
  usesActiveSurfaceProductBoundary: true;
  usesFullFilteredSummariesForOverview: true;
  usesPaymentCallbackHandoff: true;
};

export type TeacherWorkspaceOperationsChainHandoffView = {
  description: string;
  itemViews: TeacherWorkspaceOperationsChainHandoffItemView[];
  privacy: TeacherWorkspaceOperationsChainPrivacyContract;
  title: string;
};

export function buildTeacherWorkspaceOperationsChainHandoffView(): TeacherWorkspaceOperationsChainHandoffView {
  const itemViews = TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildTeacherWorkspaceOperationsChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice authenticated teacher workspace operations chain from owner-scoped dashboard metrics through activity library filters, assignment list distribution, account governance, billing/payment callback, files, notification, and active-surface boundaries.',
    itemViews,
    privacy: {
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
      itemIds: [...TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS],
      keepsActivityLibraryOwnerScoped: true,
      keepsAssignmentListOwnerScoped: true,
      keepsDashboardOwnerScoped: true,
      keepsSettingsFromMutatingClassroomData: true,
      keepsVisiblePageCountsSeparate: true,
      sourceFiles: [...TEACHER_WORKSPACE_OPERATIONS_CHAIN_SOURCE_FILES],
      usesAccountGovernanceLifecycleChain: true,
      usesActiveSurfaceProductBoundary: true,
      usesFullFilteredSummariesForOverview: true,
      usesPaymentCallbackHandoff: true,
    },
    title: 'Teacher workspace operations chain',
  };
}

function buildTeacherWorkspaceOperationsChainHandoffItemView(
  id: TeacherWorkspaceOperationsChainHandoffItemId
): TeacherWorkspaceOperationsChainHandoffItemView {
  const item = getTeacherWorkspaceOperationsChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getTeacherWorkspaceOperationsChainHandoffItem(
  id: TeacherWorkspaceOperationsChainHandoffItemId
): Omit<TeacherWorkspaceOperationsChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'dashboard-owner-scope':
      return item(
        id,
        'Dashboard owner scope',
        'Owner summaries only',
        'Dashboard metrics read authenticated teacher activity and assignment summaries.'
      );
    case 'dashboard-starter-preview-boundary':
      return item(
        id,
        'Dashboard starter preview',
        'Preview only',
        'Starter catalog content may render as preview but never counts as owned metrics.'
      );
    case 'dashboard-independent-loading':
      return item(
        id,
        'Dashboard loading boundary',
        'Split loading',
        'Activity and assignment summary loading states resolve independently.'
      );
    case 'dashboard-top-metrics':
      return item(
        id,
        'Dashboard top metrics',
        'Activities/templates/assignments/results',
        'Top metric cards come from the dashboard domain view model.'
      );
    case 'dashboard-loop-status':
      return item(
        id,
        'Dashboard loop status',
        'Core loop status',
        'The dashboard resolves create, publish, share, and review progression.'
      );
    case 'dashboard-next-actions':
      return item(
        id,
        'Dashboard next actions',
        'Create/publish/share/review',
        'Next actions point teachers to the next classroom-loop step.'
      );
    case 'dashboard-readiness':
      return item(
        id,
        'Dashboard readiness',
        'Activity/link/runner/results',
        'Readiness rows summarize activity authoring, assignment links, runner, and review.'
      );
    case 'activity-library-route':
      return item(
        id,
        'Activity library route',
        Routes.DashboardActivities,
        'The activity library is the authenticated teacher-owned activity collection.'
      );
    case 'activity-library-owner-scope':
      return item(
        id,
        'Activity library owner scope',
        'Owner activities only',
        'Library queries and summaries do not broaden beyond the current owner.'
      );
    case 'activity-library-search-filter':
      return item(
        id,
        'Activity library filters',
        'Search/status/template/source',
        'Activity filters preserve normalized URL state for teacher workflows.'
      );
    case 'activity-library-summary':
      return item(
        id,
        'Activity library summary',
        'Full filtered summary',
        'Overview metrics summarize the full filtered result, not only visible cards.'
      );
    case 'activity-library-visible-page':
      return item(
        id,
        'Activity library visible page',
        'Visible page separate',
        'Visible card counts remain separate from full filtered summaries.'
      );
    case 'activity-library-actions':
      return item(
        id,
        'Activity library actions',
        'Edit/publish/duplicate/remix/archive',
        'Activity card actions respect lifecycle and derivative-work gates.'
      );
    case 'activity-library-starter-preview':
      return item(
        id,
        'Activity library starter preview',
        'Preview only',
        'Starter activities help empty states without becoming teacher-owned rows.'
      );
    case 'assignment-list-route':
      return item(
        id,
        'Assignment list route',
        Routes.DashboardAssignments,
        'The assignment list is the authenticated teacher-owned distribution surface.'
      );
    case 'assignment-list-owner-scope':
      return item(
        id,
        'Assignment list owner scope',
        'Owner assignments only',
        'Assignment search and status filters do not broaden beyond the current owner.'
      );
    case 'assignment-list-search-status':
      return item(
        id,
        'Assignment list filters',
        'Search/status',
        'Assignment filters match title, share slug, source text, and lifecycle status.'
      );
    case 'assignment-list-summary':
      return item(
        id,
        'Assignment list summary',
        'Full filtered summary',
        'Assignment metrics summarize full filtered open links, completions, and average score.'
      );
    case 'assignment-list-visible-page':
      return item(
        id,
        'Assignment list visible page',
        'Visible page separate',
        'Visible assignment card readiness remains separate from overview counts.'
      );
    case 'assignment-list-distribution':
      return item(
        id,
        'Assignment distribution',
        'Copy/preview/print/review',
        'Assignment cards keep distribution steps prepared for classroom handoff.'
      );
    case 'assignment-list-published-context':
      return item(
        id,
        'Published context',
        'Post-publish handoff',
        'Recently published assignments surface copy, preview, and results follow-up.'
      );
    case 'account-governance-lifecycle-chain':
      return item(
        id,
        'Account governance lifecycle chain',
        '30 governance slices',
        'Account governance keeps auth, profile/security, deletion, admin users, billing/payment callback, files, and privacy guards aligned with teacher workspace operations.'
      );
    case 'settings-security-boundary':
      return item(
        id,
        'Settings security boundary',
        Routes.SettingsSecurity,
        'Security controls guard credentials, sessions, providers, and explicit deletion.'
      );
    case 'settings-files-boundary':
      return item(
        id,
        'Settings files boundary',
        Routes.SettingsFiles,
        'Source-material library summaries stay owner scoped and privacy preserving.'
      );
    case 'settings-files-classification':
      return item(
        id,
        'Settings files classification',
        'Safe material labels',
        'Material classification uses safe labels without exposing filenames or bytes.'
      );
    case 'settings-billing-payment-boundary':
      return item(
        id,
        'Settings billing/payment boundary',
        'Billing + callback',
        'Billing and payment callback handoffs expose hosted plan status without classroom data mutation or provider-session leaks.'
      );
    case 'settings-notification-boundary':
      return item(
        id,
        'Settings notification boundary',
        Routes.SettingsNotifications,
        'Teacher-controlled update preferences avoid student reminder or learner notifications.'
      );
    case 'workspace-private-data-guard':
      return item(
        id,
        'Workspace private data guard',
        'Private data hidden',
        'The workspace chain omits activity content, runtime payloads, answers, tokens, storage keys, secrets, and teacher email.'
      );
    case 'active-surface-product-boundary':
      return item(
        id,
        'Active surface product boundary',
        '30 active-surface slices',
        'Authenticated workspace operations inherit the active-surface guard against legacy learning-site, starter, or unused provider copy.'
      );
    case 'teacher-workspace-chain-gate':
      return item(
        id,
        'Teacher workspace chain gate',
        '30 source files',
        'A focused gate keeps dashboard, library, assignment list, and settings boundaries aligned.'
      );
  }
}

function item(
  id: TeacherWorkspaceOperationsChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<TeacherWorkspaceOperationsChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
