import { PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/unavailable-access';

export const ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-lifecycle-policy',
  'managed-status-boundary',
  'lifecycle-status-resolution',
  'expiry-timestamp-normalization',
  'open-access-policy',
  'submission-error-policy',
  'close-transition-rule',
  'reopen-transition-rule',
  'expired-reopen-block',
  'status-action-view',
  'status-action-execution-plan',
  'api-list-owner-scope',
  'api-status-filter',
  'list-route-status-filter',
  'status-filter-open-alias',
  'list-summary-status-metrics',
  'assignment-card-lifecycle-handoff',
  'share-link-availability',
  'public-lookup-lifecycle',
  'public-unavailable-policy',
  'submit-api-lifecycle-gate',
  'result-page-owner-scope',
  'result-page-retention',
  'snapshot-retention',
  'attempt-review-retention',
  'published-delivery-chain-alignment',
  'public-access-handoff-alignment',
  'unavailable-access-handoff-alignment',
  'lifecycle-privacy-guard',
  'public-unavailable-access-handoff-boundary',
] as const;

export const ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/lifecycle.ts',
  'src/assignments/lifecycle-query.ts',
  'src/assignments/list-filters.ts',
  'src/assignments/list-query.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/list-view.ts',
  'src/assignments/share-link.ts',
  'src/assignments/public.ts',
  'src/assignments/unavailable-access.ts',
  'src/assignments/published-assignment.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/persistence.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/detail-query.ts',
  'src/assignments/validation.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/results-export.ts',
  'src/api/assignments.ts',
  'src/db/app.schema.ts',
  'src/components/assignments/assignment-list-card.tsx',
  'src/components/assignments/assignment-list-filters.tsx',
  'src/components/assignments/assignment-list-summary-card.tsx',
  'src/components/assignments/assignment-results-header-card.tsx',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/routes/dashboard/assignments.tsx',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentLifecycleGovernanceChainHandoffItemId =
  (typeof ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentLifecycleGovernanceChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentLifecycleGovernanceChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentLifecycleGovernanceChainPrivacyContract = {
  blocksClosedOrExpiredSubmissions: true;
  blocksDraftPublicAccess: true;
  chainSourceFileCount: number;
  exposesActivityContentInLifecycleHandoff: false;
  exposesAnswerKeysInLifecycleHandoff: false;
  exposesInternalAssignmentIdsInLifecycleHandoff: false;
  exposesPublicShareSlugsInLifecycleHandoff: false;
  exposesRawAnonymousTokensInLifecycleHandoff: false;
  exposesStudentAnswerTextInLifecycleHandoff: false;
  exposesStudentNamesInLifecycleHandoff: false;
  itemIds: AssignmentLifecycleGovernanceChainHandoffItemId[];
  keepsExpiredReopenBlocked: true;
  preservesAttemptsAfterClose: true;
  preservesSnapshotsAfterClose: true;
  publicUnavailablePayloadHidesRuntime: true;
  requiresOwnerScopedTeacherQueries: true;
  sourceFiles: string[];
  statusFiltersUseLifecycleStatus: true;
  usesUnavailableAccessHandoff: true;
};

export type AssignmentLifecycleGovernanceChainHandoffView = {
  description: string;
  itemViews: AssignmentLifecycleGovernanceChainHandoffItemView[];
  privacy: AssignmentLifecycleGovernanceChainPrivacyContract;
  title: string;
};

export function buildAssignmentLifecycleGovernanceChainHandoffView(): AssignmentLifecycleGovernanceChainHandoffView {
  const itemViews = ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentLifecycleGovernanceChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice assignment lifecycle governance chain from product status policy through shared lifecycle helpers, owner-scoped list filters, share-link availability, public unavailable payloads, submit API gates, result retention, snapshot retention, and lifecycle privacy guards.',
    itemViews,
    privacy: {
      blocksClosedOrExpiredSubmissions: true,
      blocksDraftPublicAccess: true,
      chainSourceFileCount:
        ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length,
      exposesActivityContentInLifecycleHandoff: false,
      exposesAnswerKeysInLifecycleHandoff: false,
      exposesInternalAssignmentIdsInLifecycleHandoff: false,
      exposesPublicShareSlugsInLifecycleHandoff: false,
      exposesRawAnonymousTokensInLifecycleHandoff: false,
      exposesStudentAnswerTextInLifecycleHandoff: false,
      exposesStudentNamesInLifecycleHandoff: false,
      itemIds: [...ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS],
      keepsExpiredReopenBlocked: true,
      preservesAttemptsAfterClose: true,
      preservesSnapshotsAfterClose: true,
      publicUnavailablePayloadHidesRuntime: true,
      requiresOwnerScopedTeacherQueries: true,
      sourceFiles: [...ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES],
      statusFiltersUseLifecycleStatus: true,
      usesUnavailableAccessHandoff: true,
    },
    title: 'Assignment lifecycle governance chain',
  };
}

function buildAssignmentLifecycleGovernanceChainHandoffItemView(
  id: AssignmentLifecycleGovernanceChainHandoffItemId
): AssignmentLifecycleGovernanceChainHandoffItemView {
  const item = getAssignmentLifecycleGovernanceChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentLifecycleGovernanceChainHandoffItem(
  id: AssignmentLifecycleGovernanceChainHandoffItemId
): Omit<AssignmentLifecycleGovernanceChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-lifecycle-policy':
      return item(
        id,
        'Product lifecycle policy',
        'Open, closed, expired, draft',
        'The assignment product loop treats draft, open, closed, and expired states as first-class lifecycle states.'
      );
    case 'managed-status-boundary':
      return item(
        id,
        'Managed status boundary',
        'published + closed',
        'Teacher status actions are limited to persisted published and closed assignment records.'
      );
    case 'lifecycle-status-resolution':
      return item(
        id,
        'Lifecycle status resolution',
        'getAssignmentLifecycleStatus',
        'Shared helpers resolve stored assignment status and close-after time into the product lifecycle status.'
      );
    case 'expiry-timestamp-normalization':
      return item(
        id,
        'Expiry timestamp normalization',
        'Finite timestamp',
        'Close-after values normalize to finite timestamps before open, expired, and transition checks run.'
      );
    case 'open-access-policy':
      return item(
        id,
        'Open access policy',
        'Open only',
        'Student access and public runtime payloads are available only while the lifecycle state is open.'
      );
    case 'submission-error-policy':
      return item(
        id,
        'Submission error policy',
        'Reasoned rejection',
        'Closed, expired, and draft assignments return distinct localized submission rejection reasons.'
      );
    case 'close-transition-rule':
      return item(
        id,
        'Close transition rule',
        'Published -> closed',
        'Only currently published assignment links can transition to closed.'
      );
    case 'reopen-transition-rule':
      return item(
        id,
        'Reopen transition rule',
        'Closed -> published',
        'Only closed assignment links can transition back to published/open.'
      );
    case 'expired-reopen-block':
      return item(
        id,
        'Expired reopen block',
        'Expired blocked',
        'Assignments whose close window has expired cannot be reopened without a future product action.'
      );
    case 'status-action-view':
      return item(
        id,
        'Status action view',
        'Prepared action',
        'Teacher-facing status actions are prepared from the same lifecycle transition helper.'
      );
    case 'status-action-execution-plan':
      return item(
        id,
        'Status action execution plan',
        'update-status or blocked',
        'Client execution plans either call the update-status server function or remain blocked.'
      );
    case 'api-list-owner-scope':
      return item(
        id,
        'API list owner scope',
        'Owner scoped',
        'Assignment list and result queries stay scoped to the current teacher owner.'
      );
    case 'api-status-filter':
      return item(
        id,
        'API status filter',
        'Lifecycle SQL filter',
        'Server-side list filters translate lifecycle status into SQL predicates.'
      );
    case 'list-route-status-filter':
      return item(
        id,
        'List route status filter',
        'URL status state',
        'The dashboard assignment list route preserves lifecycle status in validated URL search state.'
      );
    case 'status-filter-open-alias':
      return item(
        id,
        'Status filter open alias',
        'published -> open',
        'Legacy published filters normalize to the open lifecycle status before list queries run.'
      );
    case 'list-summary-status-metrics':
      return item(
        id,
        'List summary status metrics',
        'Open/closed/expired/draft',
        'Assignment list summaries count open, closed, expired, and draft links from the filtered result.'
      );
    case 'assignment-card-lifecycle-handoff':
      return item(
        id,
        'Assignment card lifecycle handoff',
        'Hidden card handoff',
        'Assignment cards render a hidden semantic lifecycle handoff alongside visible status actions.'
      );
    case 'share-link-availability':
      return item(
        id,
        'Share link availability',
        'Open persisted links',
        'Copy and preview share-link actions stay ready only for persisted open assignments.'
      );
    case 'public-lookup-lifecycle':
      return item(
        id,
        'Public lookup lifecycle',
        'Available or unavailable',
        'Public share lookups return either sanitized runtime payloads or unavailable policy payloads.'
      );
    case 'public-unavailable-policy':
      return item(
        id,
        'Public unavailable policy',
        'Runtime hidden',
        'Unavailable public links hide runtime content, answers, materials, identity details, and submissions.'
      );
    case 'submit-api-lifecycle-gate':
      return item(
        id,
        'Submit API lifecycle gate',
        'assertAssignmentAcceptsSubmissions',
        'The submit-attempt API rechecks assignment lifecycle before validating and persisting answers.'
      );
    case 'result-page-owner-scope':
      return item(
        id,
        'Result page owner scope',
        'Owner results only',
        'Teacher result pages load assignment records and attempts through owner-scoped queries.'
      );
    case 'result-page-retention':
      return item(
        id,
        'Result page retention',
        'Closed attempts retained',
        'Closing or expiring a link blocks new submissions while preserving prior attempts for review.'
      );
    case 'snapshot-retention':
      return item(
        id,
        'Snapshot retention',
        'Frozen snapshot',
        'Published assignment snapshots remain the source of truth after lifecycle transitions.'
      );
    case 'attempt-review-retention':
      return item(
        id,
        'Attempt review retention',
        'Scored attempts',
        'Attempt review, stats, and exports keep using scored attempt records after links close.'
      );
    case 'published-delivery-chain-alignment':
      return item(
        id,
        'Published delivery chain alignment',
        'Delivery chain',
        'Lifecycle governance stays aligned with the broad published assignment delivery chain.'
      );
    case 'public-access-handoff-alignment':
      return item(
        id,
        'Public access handoff alignment',
        'Public access handoff',
        'Open public access remains covered by the public-assignment-access contract.'
      );
    case 'unavailable-access-handoff-alignment':
      return item(
        id,
        'Unavailable access handoff alignment',
        'Unavailable handoff',
        'Closed, expired, draft, and missing public states remain covered by unavailable-access contracts.'
      );
    case 'lifecycle-privacy-guard':
      return item(
        id,
        'Lifecycle privacy guard',
        'Private data hidden',
        'Lifecycle handoffs omit activity content, answer keys, ids, slugs, tokens, student answers, and names.'
      );
    case 'public-unavailable-access-handoff-boundary':
      return item(
        id,
        'Public unavailable access handoff boundary',
        `${PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.length} unavailable access slices`,
        'Closed, expired, draft, and missing links must use the shared unavailable-access contract for lifecycle reasons, hidden runtime and answers, blocked submissions, retained results, reopen guidance, indexing, and privacy.'
      );
  }
}

function item(
  id: AssignmentLifecycleGovernanceChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentLifecycleGovernanceChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
