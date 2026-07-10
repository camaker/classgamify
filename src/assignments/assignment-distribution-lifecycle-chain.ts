export const ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-distribution-policy',
  'publish-redirect-context',
  'published-query-parser',
  'published-dismiss-search',
  'owner-scoped-published-lookup',
  'published-list-fallback',
  'published-panel-found-state',
  'published-panel-loading-state',
  'published-panel-missing-state',
  'share-slug-normalization',
  'share-path-builder',
  'absolute-share-url',
  'share-link-availability',
  'copy-execution-plan',
  'copy-feedback',
  'preview-route-action',
  'distribution-status',
  'copy-step-readiness',
  'preview-step-readiness',
  'print-step-readiness',
  'results-step-readiness',
  'list-card-action-parity',
  'published-panel-action-parity',
  'hidden-share-handoff',
  'filter-scope-alignment',
  'delivery-policy-summary',
  'student-runner-boundary',
  'printable-handout-boundary',
  'result-review-boundary',
  'distribution-lifecycle-gate',
] as const;

export const ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/assignments.ts',
  'src/hooks/use-assignments.ts',
  'src/routes/dashboard/assignments.tsx',
  'src/assignments/list-view.ts',
  'src/assignments/list-filters.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/published-assignment.ts',
  'src/assignments/share-link.ts',
  'src/assignments/share-slug.ts',
  'src/assignments/assignment-display.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/printable-worksheet.ts',
  'src/assignments/result-view.ts',
  'src/lib/routes.ts',
  'src/lib/clipboard.ts',
  'src/components/assignments/published-assignment-panel.tsx',
  'src/components/assignments/assignment-list-card.tsx',
  'src/components/assignments/copy-assignment-share-link-button.tsx',
  'src/components/assignments/assignment-share-link-handoff.tsx',
  'src/components/assignments/assignment-list-filters.tsx',
  'src/components/assignments/assignment-list-scope-panel.tsx',
  'src/components/assignments/assignment-list-summary-card.tsx',
  'src/components/assignments/assignment-settings-summary.tsx',
  'scripts/assignment-list-semantic-views.test.ts',
  'scripts/assignment-share-link-handoff-semantic-views.test.ts',
  'scripts/assignment-publish-handoff-semantic-views.test.ts',
  'scripts/published-assignment-delivery-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentDistributionLifecycleChainHandoffItemId =
  (typeof ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentDistributionLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentDistributionLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentDistributionLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  changesAttemptsOrResults: false;
  changesPublicRunner: false;
  createsAssignments: false;
  exposesAnswerKeys: false;
  exposesInternalAssignmentIds: false;
  exposesRawAnonymousTokens: false;
  exposesRawSettingsJson: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesStudentNames: false;
  exposesTeacherNotes: false;
  itemIds: AssignmentDistributionLifecycleChainHandoffItemId[];
  requiresOwnerScopedAssignmentList: true;
  sourceFiles: string[];
  usesAbsoluteStudentUrl: true;
  usesNormalizedShareSlug: true;
  usesPreparedShareActions: true;
  usesSharedCopyPlan: true;
};

export type AssignmentDistributionLifecycleChainHandoffView = {
  description: string;
  itemViews: AssignmentDistributionLifecycleChainHandoffItemView[];
  privacy: AssignmentDistributionLifecycleChainPrivacyContract;
  title: string;
};

export function buildAssignmentDistributionLifecycleChainHandoffView(): AssignmentDistributionLifecycleChainHandoffView {
  const itemViews =
    ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
      buildAssignmentDistributionLifecycleChainHandoffItemView(id)
    );

  return {
    description:
      'Thirty-slice assignment distribution lifecycle chain from post-publish route context and owner-scoped assignment list lookup through absolute student links, preview/copy/print/result actions, list card parity, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      changesAttemptsOrResults: false,
      changesPublicRunner: false,
      createsAssignments: false,
      exposesAnswerKeys: false,
      exposesInternalAssignmentIds: false,
      exposesRawAnonymousTokens: false,
      exposesRawSettingsJson: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswerText: false,
      exposesStudentNames: false,
      exposesTeacherNotes: false,
      itemIds: [...ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      requiresOwnerScopedAssignmentList: true,
      sourceFiles: [...ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES],
      usesAbsoluteStudentUrl: true,
      usesNormalizedShareSlug: true,
      usesPreparedShareActions: true,
      usesSharedCopyPlan: true,
    },
    title: 'Assignment distribution lifecycle chain',
  };
}

function buildAssignmentDistributionLifecycleChainHandoffItemView(
  id: AssignmentDistributionLifecycleChainHandoffItemId
): AssignmentDistributionLifecycleChainHandoffItemView {
  const item = getAssignmentDistributionLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentDistributionLifecycleChainHandoffItem(
  id: AssignmentDistributionLifecycleChainHandoffItemId
): Omit<
  AssignmentDistributionLifecycleChainHandoffItemView,
  'ariaLabel' | 'id'
> {
  switch (id) {
    case 'product-distribution-policy':
      return item(
        id,
        'Product distribution policy',
        'Immediate next step',
        'Product policy keeps copy, student preview, printable worksheet, and results actions as the immediate post-publish distribution loop.'
      );
    case 'publish-redirect-context':
      return item(
        id,
        'Publish redirect context',
        'published=:shareId',
        'Publish success redirects into the assignment list with the published share slug in route state.'
      );
    case 'published-query-parser':
      return item(
        id,
        'Published query parser',
        'Validated search',
        'Assignment list route search validates page, status, search, and published share context before rendering.'
      );
    case 'published-dismiss-search':
      return item(
        id,
        'Published dismiss search',
        'Context removed',
        'Dismissing the published panel removes only the published share context while preserving current filters.'
      );
    case 'owner-scoped-published-lookup':
      return item(
        id,
        'Owner-scoped published lookup',
        'Owner list query',
        'The assignments hook and server query resolve the published share slug inside the owner-scoped assignment list data.'
      );
    case 'published-list-fallback':
      return item(
        id,
        'Published list fallback',
        'Visible list fallback',
        'The published panel can resolve the share slug from the focused published assignment row or the visible owner list.'
      );
    case 'published-panel-found-state':
      return item(
        id,
        'Published panel found state',
        'Found',
        'When the published assignment is found, the panel shows the normalized title, share URL/path, next steps, and prepared actions.'
      );
    case 'published-panel-loading-state':
      return item(
        id,
        'Published panel loading state',
        'Loading',
        'Loading state keeps the share URL/path visible while withholding assignment-only print and results actions.'
      );
    case 'published-panel-missing-state':
      return item(
        id,
        'Published panel missing state',
        'Missing',
        'Missing state keeps copy and preview guidance available while explaining that the assignment row was not resolved.'
      );
    case 'share-slug-normalization':
      return item(
        id,
        'Share slug normalization',
        'normalizeAssignmentShareSlug',
        'Share slugs are normalized before matching list rows, building links, and preparing action state.'
      );
    case 'share-path-builder':
      return item(
        id,
        'Share path builder',
        '/play/:shareId',
        'The student path is built through the shared /play route helper rather than hand-composed in UI components.'
      );
    case 'absolute-share-url':
      return item(
        id,
        'Absolute share URL',
        'Student URL',
        'Copy actions use the prepared absolute student URL while visible summaries also show the route path.'
      );
    case 'share-link-availability':
      return item(
        id,
        'Share-link availability',
        'Lifecycle guarded',
        'Availability combines assignment lifecycle status and missing-slug guards before copy or preview actions activate.'
      );
    case 'copy-execution-plan':
      return item(
        id,
        'Copy execution plan',
        'Shared copy plan',
        'The copy button asks the assignment-domain copy plan whether to copy the URL or surface a blocked reason.'
      );
    case 'copy-feedback':
      return item(
        id,
        'Copy feedback',
        'Toast mapped',
        'Clipboard success, clipboard failure, and blocked states use shared localized feedback instead of raw browser errors.'
      );
    case 'preview-route-action':
      return item(
        id,
        'Preview route action',
        'Student runner link',
        'Preview links use the prepared route target and normalized share slug route params.'
      );
    case 'distribution-status':
      return item(
        id,
        'Distribution status',
        'Ready or collecting',
        'Assignment cards summarize whether a link is ready to share, blocked, a preview, or already collecting results.'
      );
    case 'copy-step-readiness':
      return item(
        id,
        'Copy step readiness',
        'Copy step',
        'Distribution steps expose copy-link readiness from the same share availability used by actions.'
      );
    case 'preview-step-readiness':
      return item(
        id,
        'Preview step readiness',
        'Preview step',
        'Distribution steps expose student-preview readiness from the same share availability used by the preview link.'
      );
    case 'print-step-readiness':
      return item(
        id,
        'Print step readiness',
        'Print step',
        'Published assignments prepare printable worksheet actions while drafts keep the step blocked.'
      );
    case 'results-step-readiness':
      return item(
        id,
        'Results step readiness',
        'Results step',
        'Results steps wait for submissions but remain linked to the published assignment results route.'
      );
    case 'list-card-action-parity':
      return item(
        id,
        'List card action parity',
        'Card actions',
        'Assignment cards prepare result, print, status, preview, and copy actions from the same action state.'
      );
    case 'published-panel-action-parity':
      return item(
        id,
        'Published panel action parity',
        'Panel actions',
        'The just-published panel prepares the same share, print, and results actions as assignment cards when the row is found.'
      );
    case 'hidden-share-handoff':
      return item(
        id,
        'Hidden share handoff',
        '30 share slices',
        'Assignment list, publish-success, and result-page share surfaces render the shared hidden share-link handoff contract.'
      );
    case 'filter-scope-alignment':
      return item(
        id,
        'Filter scope alignment',
        'Owner scope',
        'Assignment list handoff keeps full filtered counts, visible page counts, filters, and published context aligned.'
      );
    case 'delivery-policy-summary':
      return item(
        id,
        'Delivery policy summary',
        'Shared settings',
        'Assignment cards keep delivery settings visible beside distribution actions so teachers can verify link rules.'
      );
    case 'student-runner-boundary':
      return item(
        id,
        'Student runner boundary',
        'Public /play',
        'Distribution links enter the sanitized student runner rather than exposing assignment internals.'
      );
    case 'printable-handout-boundary':
      return item(
        id,
        'Printable handout boundary',
        'Teacher print',
        'Print actions stay teacher-only, noindex handouts with answer keys hidden by default.'
      );
    case 'result-review-boundary':
      return item(
        id,
        'Result review boundary',
        'Teacher results',
        'Result actions stay teacher-only review surfaces backed by the frozen assignment snapshot and attempts.'
      );
    case 'distribution-lifecycle-gate':
      return item(
        id,
        'Distribution lifecycle gate',
        '30 source files',
        'A focused gate keeps publish redirect context, assignment list distribution, share-link actions, student preview, print, and results boundaries connected.'
      );
  }
}

function item(
  id: AssignmentDistributionLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentDistributionLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
