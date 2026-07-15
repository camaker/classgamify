import { ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS } from '@/assignments/attempt-limit-handoff';

export const ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS =
  ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS;

export const ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/attempt-limits.ts',
  'src/assignments/attempt-limit-handoff.ts',
  'src/assignments/attempt-limit-concurrency.ts',
  'src/assignments/attempt-identity-query.ts',
  'src/assignments/identity.ts',
  'src/assignments/submission-idempotency.ts',
  'src/assignments/submission-lifecycle-write.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/api/assignments.ts',
  'src/assignments/validation.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/student-identity-lifecycle-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/public.ts',
  'src/assignments/results-export.ts',
  'src/assignments/result-view.ts',
  'src/components/assignments/assignment-settings-summary.tsx',
  'src/components/assignments/public-assignment-rules.tsx',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/routes/play/$shareId.tsx',
  'src/db/app.schema.ts',
  'src/db/migrations/0010_breezy_toro.sql',
  'scripts/assignment-attempt-limit-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentAttemptLimitContinuityChainHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptLimitContinuityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptLimitContinuityChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptLimitContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerText: false;
  exposesAttemptNumbers: false;
  exposesCsvDataUrl: false;
  exposesIdentityKeys: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayload: false;
  exposesStudentNames: false;
  exposesSubmissionKeys: false;
  exposesTeacherAnswerKeys: false;
  finiteAttemptsUseUniqueIdentitySlots: true;
  itemIds: AssignmentAttemptLimitContinuityChainHandoffItemId[];
  preservesIdempotentReplayPriority: true;
  sourceFiles: string[];
  unlimitedAttemptsAvoidSlotContention: true;
  usesSharedAttemptLimitHelpers: true;
};

export type AssignmentAttemptLimitContinuityChainHandoffView = {
  description: string;
  itemViews: AssignmentAttemptLimitContinuityChainHandoffItemView[];
  privacy: AssignmentAttemptLimitContinuityChainPrivacyContract;
  title: string;
};

const ITEM_VALUES: Record<
  AssignmentAttemptLimitContinuityChainHandoffItemId,
  string
> = {
  'attempt-scope': 'Normalized student identity',
  'max-attempt-normalization': 'Positive whole limit',
  'previous-count-normalization': 'Stored scored attempts',
  'used-attempts': 'Previous plus current',
  'remaining-attempts': 'Bounded remaining count',
  'unlimited-attempts': 'Nullable identity slots',
  'limit-reached': 'Server rejection',
  'retry-availability': 'Shared retry decision',
  'result-usage-label': 'Prepared usage label',
  'student-name-identity': 'Normalized name key',
  'anonymous-token-identity': 'Browser token key',
  'identity-mode': 'Assignment delivery policy',
  'attempt-counter-source': 'Owner-scoped query',
  'max-attempt-parser': 'Shared parser',
  'api-previous-count-query': 'Identity attempt count',
  'server-enforcement': 'Authoritative limit gate',
  'scored-attempt-write-gate': 'Reserved identity slot',
  'runner-result-boundary': 'Sanitized attempt usage',
  'retry-button-boundary': 'Remaining attempt state',
  'submission-gate-boundary': 'New-attempt decision',
  'delivery-summary-boundary': 'Teacher policy summary',
  'public-rule-boundary': 'Sanitized student rule',
  'result-page-boundary': 'Frozen delivery policy',
  'result-export-boundary': 'Offline policy record',
  'negative-count-guard': 'Clamped to zero',
  'fractional-count-guard': 'Whole attempt count',
  'nonfinite-max-guard': 'Unlimited fallback',
  'zero-max-guard': 'Unlimited fallback',
  'raw-token-guard': 'Token hidden',
  'privacy-guard': 'Private slot metadata hidden',
};

export function buildAssignmentAttemptLimitContinuityChainHandoffView(): AssignmentAttemptLimitContinuityChainHandoffView {
  const itemViews =
    ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.map((id) => {
      const label = id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = ITEM_VALUES[id];

      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from normalized student identity and idempotent replay through concurrent scored persistence and every attempt-usage consumer.`,
        id,
        label,
        value,
      };
    });

  return {
    description:
      'Thirty-slice attempt limit continuity chain from normalized student identity and previous scored-attempt counts through idempotent replay, concurrent identity slots, server enforcement, student retry state, teacher policy views, and exports.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesAnswerText: false,
      exposesAttemptNumbers: false,
      exposesCsvDataUrl: false,
      exposesIdentityKeys: false,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayload: false,
      exposesStudentNames: false,
      exposesSubmissionKeys: false,
      exposesTeacherAnswerKeys: false,
      finiteAttemptsUseUniqueIdentitySlots: true,
      itemIds: [...ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS],
      preservesIdempotentReplayPriority: true,
      sourceFiles: [...ASSIGNMENT_ATTEMPT_LIMIT_CONTINUITY_CHAIN_SOURCE_FILES],
      unlimitedAttemptsAvoidSlotContention: true,
      usesSharedAttemptLimitHelpers: true,
    },
    title: 'Assignment attempt limit continuity chain',
  };
}
