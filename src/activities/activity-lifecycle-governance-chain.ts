import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';

export const ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-archive-policy',
  'lifecycle-domain-source',
  'restored-visibility-contract',
  'library-status-parser',
  'library-active-scope',
  'library-archived-scope',
  'library-owner-query',
  'library-status-summary',
  'card-action-state',
  'hidden-lifecycle-handoff',
  'archive-execution-plan',
  'restore-execution-plan',
  'edit-access-gate',
  'publish-access-gate',
  'publish-api-derivation-gate',
  'duplicate-ui-plan',
  'duplicate-api-gate',
  'remix-ui-plan',
  'remix-api-gate',
  'same-template-remix-guard',
  'ready-template-remix-guard',
  'visibility-update-helper',
  'archive-server-guard',
  'restore-server-guard',
  'content-retention',
  'source-material-retention',
  'snapshot-protection',
  'public-assignment-continuity',
  'created-panel-publish-gate',
  'assignment-publish-handoff-boundary',
] as const;

export const ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/activities.ts',
  'src/api/assignments.ts',
  'src/hooks/use-activities.ts',
  'src/activities/lifecycle.ts',
  'src/activities/library-filters.ts',
  'src/activities/library-query.ts',
  'src/activities/library-summary.ts',
  'src/activities/library-view.ts',
  'src/activities/duplicate.ts',
  'src/activities/template-remix.ts',
  'src/activities/persistence.ts',
  'src/activities/detail-query.ts',
  'src/activities/editor.ts',
  'src/activities/material-summary.ts',
  'src/activities/material-references.ts',
  'src/activities/authoring-library-chain.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/snapshot.ts',
  'src/routes/dashboard/activities.tsx',
  'src/routes/dashboard/activities/$activityId.tsx',
  'src/components/activities/activity-library-card.tsx',
  'src/components/activities/activity-library-action-status-badge.tsx',
  'src/components/activities/activity-library-compatibility-panel.tsx',
  'src/components/activities/activity-publish-dialog.tsx',
  'src/components/activities/created-activity-panel.tsx',
  'src/components/activities/activity-create-form.tsx',
  'scripts/activity-lifecycle-handoff-semantic-views.test.ts',
  'scripts/activity-authoring-library-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityLifecycleGovernanceChainHandoffItemId =
  (typeof ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivityLifecycleGovernanceChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityLifecycleGovernanceChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivityLifecycleGovernanceChainPrivacyContract = {
  archivedActivitiesBlockDerivatives: true;
  chainSourceFileCount: number;
  deletesActivityContentOnArchive: false;
  exposesActivityContentText: false;
  exposesAssignmentSnapshotContent: false;
  exposesInternalActivityIds: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityLifecycleGovernanceChainHandoffItemId[];
  mutatesPublishedAssignmentSnapshots: false;
  requiresOwnerScope: true;
  restoredVisibility: 'draft';
  sourceFiles: string[];
  usesAssignmentPublishHandoff: true;
};

export type ActivityLifecycleGovernanceChainHandoffView = {
  description: string;
  itemViews: ActivityLifecycleGovernanceChainHandoffItemView[];
  privacy: ActivityLifecycleGovernanceChainPrivacyContract;
  title: string;
};

export function buildActivityLifecycleGovernanceChainHandoffView(): ActivityLifecycleGovernanceChainHandoffView {
  const itemViews = ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildActivityLifecycleGovernanceChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice activity lifecycle governance chain for owner-scoped archive and restore, edit/publish/duplicate/remix gates, content retention, source-material retention, assignment snapshot protection, public assignment continuity, and server-side lifecycle enforcement.',
    itemViews,
    privacy: {
      archivedActivitiesBlockDerivatives: true,
      chainSourceFileCount:
        ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length,
      deletesActivityContentOnArchive: false,
      exposesActivityContentText: false,
      exposesAssignmentSnapshotContent: false,
      exposesInternalActivityIds: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      exposesTeacherNotesText: false,
      itemIds: [...ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS],
      mutatesPublishedAssignmentSnapshots: false,
      requiresOwnerScope: true,
      restoredVisibility: 'draft',
      sourceFiles: [...ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES],
      usesAssignmentPublishHandoff: true,
    },
    title: 'Activity lifecycle governance chain',
  };
}

function buildActivityLifecycleGovernanceChainHandoffItemView(
  id: ActivityLifecycleGovernanceChainHandoffItemId
): ActivityLifecycleGovernanceChainHandoffItemView {
  const item = getActivityLifecycleGovernanceChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivityLifecycleGovernanceChainHandoffItem(
  id: ActivityLifecycleGovernanceChainHandoffItemId
): Omit<ActivityLifecycleGovernanceChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-archive-policy':
      return item(
        id,
        'Product archive policy',
        'Restore before derive',
        'Product documentation keeps archived activities out of casual republishing, duplication, and remixing until restored.'
      );
    case 'lifecycle-domain-source':
      return item(
        id,
        'Lifecycle domain source',
        'activities/lifecycle',
        'Shared lifecycle helpers own archive, restore, edit, publish, duplicate, and remix gate semantics.'
      );
    case 'restored-visibility-contract':
      return item(
        id,
        'Restored visibility',
        'draft',
        'Restoring an archived activity returns it to draft visibility before future classroom work resumes.'
      );
    case 'library-status-parser':
      return item(
        id,
        'Library status parser',
        'active/archived',
        'Activity library route state accepts only the shared active and archived lifecycle scopes.'
      );
    case 'library-active-scope':
      return item(
        id,
        'Active library scope',
        'Archived hidden',
        'The default library excludes archived rows while preserving active classroom activities.'
      );
    case 'library-archived-scope':
      return item(
        id,
        'Archived library scope',
        'Archived only',
        'The archived view shows restore candidates without mixing them into the active library.'
      );
    case 'library-owner-query':
      return item(
        id,
        'Library owner query',
        'Owner scoped',
        'Activity lifecycle views and summaries stay filtered to the authenticated teacher owner.'
      );
    case 'library-status-summary':
      return item(
        id,
        'Library status summary',
        'Full filtered result',
        'Active and archived counts summarize the full filtered owner result, not only the visible page.'
      );
    case 'card-action-state':
      return item(
        id,
        'Card action state',
        'Restore-only archived',
        'Archived cards hide edit, publish, duplicate, and remix actions while surfacing restore guidance.'
      );
    case 'hidden-lifecycle-handoff':
      return item(
        id,
        'Hidden lifecycle handoff',
        '30 semantic items',
        'Activity cards expose hidden lifecycle labels, values, and descriptions for audit and accessibility.'
      );
    case 'archive-execution-plan':
      return item(
        id,
        'Archive execution plan',
        'Validated transition',
        'Archive actions resolve through a shared execution plan before the UI calls the mutation.'
      );
    case 'restore-execution-plan':
      return item(
        id,
        'Restore execution plan',
        'Validated transition',
        'Restore actions resolve through a shared execution plan before the UI calls the mutation.'
      );
    case 'edit-access-gate':
      return item(
        id,
        'Edit access gate',
        'Archived blocked',
        'Edit routes and update server functions block archived activities until restore.'
      );
    case 'publish-access-gate':
      return item(
        id,
        'Publish access gate',
        'Archived blocked',
        'Publish dialogs refuse archived sources before a teacher can create a new assignment link.'
      );
    case 'publish-api-derivation-gate':
      return item(
        id,
        'Publish API derivation gate',
        'Server enforced',
        'The publish server function also checks that the activity can derive work before freezing a snapshot.'
      );
    case 'duplicate-ui-plan':
      return item(
        id,
        'Duplicate UI plan',
        'Blocked or draft',
        'Duplicate buttons use the lifecycle execution plan and only create draft copies for eligible sources.'
      );
    case 'duplicate-api-gate':
      return item(
        id,
        'Duplicate API gate',
        'Server enforced',
        'The duplicate server function reloads the owner-scoped source and blocks archived activities.'
      );
    case 'remix-ui-plan':
      return item(
        id,
        'Remix UI plan',
        'Ready target only',
        'Remix buttons use lifecycle and readiness plans before requesting a derivative draft.'
      );
    case 'remix-api-gate':
      return item(
        id,
        'Remix API gate',
        'Server enforced',
        'The remix server function checks lifecycle and target readiness before inserting a remixed draft.'
      );
    case 'same-template-remix-guard':
      return item(
        id,
        'Same-template guard',
        'Blocked',
        'Remix requests cannot create a derivative draft with the same template as the source.'
      );
    case 'ready-template-remix-guard':
      return item(
        id,
        'Ready-template guard',
        'Missing content blocked',
        'Template remix remains a deterministic content-readiness decision before AI transformation.'
      );
    case 'visibility-update-helper':
      return item(
        id,
        'Visibility update helper',
        'Visibility only',
        'Archive and restore update only lifecycle visibility fields, not structured classroom content.'
      );
    case 'archive-server-guard':
      return item(
        id,
        'Archive server guard',
        'Already archived blocked',
        'The archive server path rejects activities that are already archived.'
      );
    case 'restore-server-guard':
      return item(
        id,
        'Restore server guard',
        'Not archived blocked',
        'The restore server path rejects active activities and only restores archived rows.'
      );
    case 'content-retention':
      return item(
        id,
        'Content retention',
        'Content retained',
        'Archiving hides an activity from the active library without deleting questions, pairs, groups, or notes.'
      );
    case 'source-material-retention':
      return item(
        id,
        'Source material retention',
        'References retained',
        'Lifecycle changes preserve compact source-material references for future review and extraction.'
      );
    case 'snapshot-protection':
      return item(
        id,
        'Snapshot protection',
        'Snapshots unchanged',
        'Published assignment snapshots remain immutable when source activities are archived, restored, duplicated, or remixed.'
      );
    case 'public-assignment-continuity':
      return item(
        id,
        'Public assignment continuity',
        'Existing links unchanged',
        'Existing student links keep using their frozen assignment snapshots after source activity lifecycle changes.'
      );
    case 'created-panel-publish-gate':
      return item(
        id,
        'Created panel publish gate',
        'Same access view',
        'The post-save created-activity panel uses the same publish access boundary as library cards.'
      );
    case 'assignment-publish-handoff-boundary':
      return item(
        id,
        'Assignment publish handoff boundary',
        `${ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length} assignment publish slices`,
        'Restored activities must enter the shared assignment publish access, validation, delivery settings, review checklist, snapshot freeze, public payload, result policy, and privacy contracts.'
      );
  }
}

function item(
  id: ActivityLifecycleGovernanceChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityLifecycleGovernanceChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
