import { ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/identity-handoff';

export const ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS =
  ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS;

export const ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/identity.ts',
  'src/assignments/identity-handoff.ts',
  'src/assignments/attempt-identity-query.ts',
  'src/api/assignments.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-identity-handoff.ts',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/student-identity-lifecycle-chain.ts',
  'src/assignments/attempt-limit-continuity-chain.ts',
  'src/assignments/attempt-persistence-continuity-chain.ts',
  'src/assignments/submission-idempotency.ts',
  'src/assignments/submission-lifecycle-write.ts',
  'src/assignments/attempt-limit-concurrency.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/results.ts',
  'src/assignments/result-filters.ts',
  'src/assignments/result-view.ts',
  'src/assignments/student-follow-up-priority.ts',
  'src/assignments/student-follow-up-summary.ts',
  'src/assignments/attempt-review-card-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/routes/play/$shareId.tsx',
  'src/db/app.schema.ts',
  'scripts/assignment-identity-handoff-semantic-views.test.ts',
  'tests/e2e/specs/student-runner.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentAttemptIdentityContinuityChainHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptIdentityContinuityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptIdentityContinuityChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptIdentityContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesBrowserStorageKeys: false;
  exposesRawAnonymousTokens: false;
  exposesRawGroupingKeys: false;
  exposesRawStudentNames: false;
  exposesResultStudentKeys: false;
  itemIds: AssignmentAttemptIdentityContinuityChainHandoffItemId[];
  namedIdentityTakesPriority: true;
  sourceFiles: string[];
  usesAssignmentScopedAnonymousTokens: true;
  usesNormalizedIdentityForAttemptLimits: true;
  usesSharedIdentityHelpers: true;
};

export type AssignmentAttemptIdentityContinuityChainHandoffView = {
  description: string;
  itemViews: AssignmentAttemptIdentityContinuityChainHandoffItemView[];
  privacy: AssignmentAttemptIdentityContinuityChainPrivacyContract;
  title: string;
};

const ITEM_VALUES: Record<
  AssignmentAttemptIdentityContinuityChainHandoffItemId,
  string
> = {
  'identity-scope': 'Student attempt identity',
  'name-whitespace-normalization': 'Collapsed whitespace',
  'name-unicode-normalization': 'NFKC normalized',
  'name-case-grouping': 'Case-insensitive key',
  'name-priority': 'Named identity first',
  'anonymous-token-normalization': 'Trimmed browser token',
  'anonymous-storage-key': 'Assignment-scoped key',
  'anonymous-existing-token': 'Existing token reused',
  'anonymous-sanitized-write': 'Normalized storage value',
  'anonymous-created-token': 'Opaque token created',
  'browser-label': 'Safe short label',
  'grouping-name-key': 'Normalized name group',
  'grouping-anonymous-key': 'Anonymous token group',
  'unknown-identity': 'Stable fallback group',
  'same-name-comparison': 'Same normalized student',
  'same-token-comparison': 'Same anonymous student',
  'distinct-token-comparison': 'Separate anonymous students',
  'name-attempt-count': 'Name-scoped count',
  'token-attempt-count': 'Token-scoped count',
  'submission-name-strategy': 'Named submission identity',
  'submission-token-strategy': 'Anonymous submission identity',
  'submission-missing-strategy': 'Missing identity rejected',
  'previous-name-strategy': 'Normalized name query',
  'previous-token-strategy': 'Anonymous token query',
  'resolver-name-label': 'Normalized display label',
  'resolver-anonymous-label': 'Safe browser label',
  'resolver-ordering': 'Stable student ordering',
  'result-display-key': 'Safe result key',
  'raw-token-guard': 'Raw token hidden',
  'privacy-guard': 'Identity details hidden',
};

export function buildAssignmentAttemptIdentityContinuityChainHandoffView(): AssignmentAttemptIdentityContinuityChainHandoffView {
  const itemViews =
    ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.map((id) => {
      const label = id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = ITEM_VALUES[id];
      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from browser or named submission identity through attempt limits, persistence, teacher grouping, and safe result display.`,
        id,
        label,
        value,
      };
    });

  return {
    description:
      'Thirty-slice student attempt identity continuity chain from name and anonymous-token normalization through browser storage, submission strategy, attempt counting, persistence, teacher grouping, result ordering, and privacy.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesBrowserStorageKeys: false,
      exposesRawAnonymousTokens: false,
      exposesRawGroupingKeys: false,
      exposesRawStudentNames: false,
      exposesResultStudentKeys: false,
      itemIds: [
        ...ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
      ],
      namedIdentityTakesPriority: true,
      sourceFiles: [
        ...ASSIGNMENT_ATTEMPT_IDENTITY_CONTINUITY_CHAIN_SOURCE_FILES,
      ],
      usesAssignmentScopedAnonymousTokens: true,
      usesNormalizedIdentityForAttemptLimits: true,
      usesSharedIdentityHelpers: true,
    },
    title: 'Assignment attempt identity continuity chain',
  };
}
