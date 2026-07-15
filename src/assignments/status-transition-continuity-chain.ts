import { ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES } from '@/assignments/status-transition-concurrency';

export const ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES =
  ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES;

export const ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/assignments/status-transition-concurrency.ts',
  'src/assignments/detail-query.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/lifecycle-query.ts',
  'src/api/assignments.ts',
  'src/assignments/assignment-lifecycle-governance-chain.ts',
  'src/assignments/submission-lifecycle-continuity-chain.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/public.ts',
  'src/assignments/unavailable-access.ts',
  'src/assignments/list-filters.ts',
  'src/assignments/list-query.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/list-view.ts',
  'src/assignments/share-link.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/persistence.ts',
  'src/components/assignments/assignment-list-card.tsx',
  'src/components/assignments/assignment-results-header-actions.tsx',
  'src/routes/dashboard/assignments.tsx',
  'src/db/app.schema.ts',
  'scripts/assignment-status-transition-concurrency-contract.test.ts',
  'scripts/assignment-lifecycle-governance-chain-handoff.test.ts',
  'tests/e2e/specs/protected-pages.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentStatusTransitionContinuityChainStageId =
  (typeof ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES)[number]['id'];

export type AssignmentStatusTransitionContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesActivityContent: false;
  exposesAssignmentIds: false;
  exposesShareSlugs: false;
  exposesStudentAnswers: false;
  exposesStudentIdentity: false;
  exposesTeacherOwnerIds: false;
  itemIds: AssignmentStatusTransitionContinuityChainStageId[];
  preservesAttemptsAndResults: true;
  preservesFrozenSnapshot: true;
  sourceFiles: string[];
  usesMonotonicRevision: true;
  usesOwnerScopedCompareAndSet: true;
  usesSingleUpdateReturning: true;
};

const STAGE_VALUES: Record<
  AssignmentStatusTransitionContinuityChainStageId,
  string
> = {
  'owner-scoped-initial-read': 'Teacher assignment row',
  'initial-transition-validation': 'Shared lifecycle rule',
  'transition-clock-capture': 'One server timestamp',
  'monotonic-revision-allocation': 'Strictly newer updatedAt',
  'compare-and-set-update': 'Atomic lifecycle write',
  'returning-transition-row': 'Updated row returned',
  'conflict-current-state-read': 'Current state reloaded',
  'specific-conflict-message': 'Lifecycle reason retained',
  'generic-revision-conflict': 'Stale action rejected',
  'owner-scoped-detail-return': 'Teacher detail response',
  'assignment-id-predicate': 'Exact assignment',
  'owner-id-predicate': 'Exact teacher owner',
  'expected-status-predicate': 'Expected source status',
  'expected-revision-predicate': 'Expected updatedAt',
  'reopen-expiry-null-branch': 'Unscheduled reopen allowed',
  'reopen-expiry-future-branch': 'Future window required',
  'single-update-boundary': 'One D1 statement',
  'zero-row-conflict-signal': 'No stale overwrite',
  'revision-timestamp-normalization': 'Stable timestamp input',
  'same-millisecond-revision-advance': 'Revision increments',
  'stale-status-detection': 'New status retained',
  'stale-revision-detection': 'New revision retained',
  'expired-reopen-detection': 'Elapsed window blocked',
  'already-transitioned-detection': 'Specific status error',
  'missing-assignment-detection': 'Missing row rejected',
  'retained-snapshot-boundary': 'Frozen activity retained',
  'teacher-owner-hidden': 'Owner id hidden',
  'share-slug-hidden': 'Share slug hidden',
  'student-attempts-untouched': 'Existing attempts retained',
  'source-content-untouched': 'Activity content retained',
};

export function buildAssignmentStatusTransitionContinuityChainView() {
  const itemViews = ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = STAGE_VALUES[stage.id];
      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from teacher lifecycle intent through owner-scoped compare-and-set persistence, conflict recovery, public access, and retained results.`,
        id: stage.id,
        label,
        value,
      };
    }
  );

  const privacy: AssignmentStatusTransitionContinuityChainPrivacyContract = {
    chainSourceFileCount:
      ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES.length,
    exposesActivityContent: false,
    exposesAssignmentIds: false,
    exposesShareSlugs: false,
    exposesStudentAnswers: false,
    exposesStudentIdentity: false,
    exposesTeacherOwnerIds: false,
    itemIds: ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_STAGES.map(
      (stage) => stage.id
    ),
    preservesAttemptsAndResults: true,
    preservesFrozenSnapshot: true,
    sourceFiles: [
      ...ASSIGNMENT_STATUS_TRANSITION_CONTINUITY_CHAIN_SOURCE_FILES,
    ],
    usesMonotonicRevision: true,
    usesOwnerScopedCompareAndSet: true,
    usesSingleUpdateReturning: true,
  };

  return {
    description:
      'Thirty-slice assignment status transition continuity chain from teacher close or reopen intent through monotonic owner-scoped compare-and-set writes, conflict reloads, public access changes, retained snapshots and results, and privacy.',
    itemViews,
    privacy,
    title: 'Assignment status transition continuity chain',
  };
}
