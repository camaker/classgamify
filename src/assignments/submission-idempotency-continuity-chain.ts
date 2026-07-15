import { ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES } from '@/assignments/submission-idempotency';

export const ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES =
  ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES;

export const ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/assignments/submission-idempotency.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/routes/play/$shareId.tsx',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/identity.ts',
  'src/assignments/attempt-identity-continuity-chain.ts',
  'src/assignments/attempt-query.ts',
  'src/api/assignments.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/validation.ts',
  'src/activities/runtime.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-limit-concurrency.ts',
  'src/assignments/submission-lifecycle-write.ts',
  'src/assignments/attempt-limit-continuity-chain.ts',
  'src/assignments/attempt-persistence-continuity-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/public.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/result-view.ts',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/db/app.schema.ts',
  'src/db/migrations/0009_minor_winter_soldier.sql',
  'scripts/assignment-submission-idempotency-contract.test.ts',
  'tests/e2e/specs/student-runner.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentSubmissionIdempotencyContinuityChainStageId =
  (typeof ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES)[number]['id'];

export type AssignmentSubmissionIdempotencyContinuityChainItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentSubmissionIdempotencyContinuityChainStageId;
  label: string;
  value: string;
};

export type AssignmentSubmissionIdempotencyContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerText: false;
  exposesAttemptIds: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayloads: false;
  exposesStudentNames: false;
  exposesSubmissionKeys: false;
  exposesTeacherAnswers: false;
  itemIds: AssignmentSubmissionIdempotencyContinuityChainStageId[];
  preservesReplayBeforeNewAttemptGates: true;
  sourceFiles: string[];
  usesAssignmentScopedKeyUniqueness: true;
  usesNormalizedIdentityForReplay: true;
  usesOneKeyPerAttempt: true;
};

export type AssignmentSubmissionIdempotencyContinuityChainView = {
  description: string;
  itemViews: AssignmentSubmissionIdempotencyContinuityChainItemView[];
  privacy: AssignmentSubmissionIdempotencyContinuityChainPrivacyContract;
  title: string;
};

const STAGE_VALUES: Record<
  AssignmentSubmissionIdempotencyContinuityChainStageId,
  string
> = {
  'client-key-source': 'Opaque browser UUID',
  'key-normalization': 'Trimmed key',
  'key-length-validation': 'Bounded server input',
  'incomplete-submit-gate': 'Key created after confirmation',
  'identity-gate': 'Key created after identity',
  'submission-key-reuse': 'Current attempt key',
  'submission-payload': 'Private request metadata',
  'pending-submit-lock': 'Single pending mutation',
  'network-retry-reuse': 'Failed request key retained',
  'new-attempt-key-reset': 'Fresh attempt boundary',
  'assignment-change-key-reset': 'New assignment boundary',
  'server-input-validation': 'Validated opaque key',
  'assignment-lookup': 'Assignment-scoped replay',
  'settings-resolution': 'Frozen submission policy',
  'identity-normalization': 'Shared student identity',
  'existing-attempt-lookup': 'Replay before new write',
  'replay-identity-match': 'Normalized identity match',
  'replay-result-recovery': 'Persisted result reused',
  'replay-review-recovery': 'Persisted review reused',
  'replay-usage-recovery': 'Persisted usage reused',
  'lifecycle-gate-new-submit': 'New attempts only',
  'attempt-limit-gate-new-submit': 'New attempts only',
  'runtime-answer-validation': 'Frozen runtime boundary',
  'deterministic-scoring': 'Stable scored result',
  'submission-key-persistence': 'Private attempt metadata',
  'assignment-key-uniqueness': 'D1 unique boundary',
  'unique-conflict-recovery': 'Concurrent replay recovery',
  'teacher-result-continuity': 'One scored attempt',
  'public-feedback-continuity': 'Same sanitized response',
  'private-key-boundary': 'Submission key hidden',
};

export function buildAssignmentSubmissionIdempotencyContinuityChainView(): AssignmentSubmissionIdempotencyContinuityChainView {
  const itemViews =
    ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES.map((stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = STAGE_VALUES[stage.id];

      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from the browser attempt key through replay-first server recovery, concurrent persistence, and sanitized result consumers.`,
        id: stage.id,
        label,
        value,
      };
    });

  return {
    description:
      'Thirty-slice submission idempotency continuity chain from browser key creation and retry reuse through normalized replay recovery, new-attempt gates, D1 uniqueness, public feedback, teacher results, and privacy.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesAnswerText: false,
      exposesAttemptIds: false,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayloads: false,
      exposesStudentNames: false,
      exposesSubmissionKeys: false,
      exposesTeacherAnswers: false,
      itemIds: ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      ),
      preservesReplayBeforeNewAttemptGates: true,
      sourceFiles: [
        ...ASSIGNMENT_SUBMISSION_IDEMPOTENCY_CONTINUITY_CHAIN_SOURCE_FILES,
      ],
      usesAssignmentScopedKeyUniqueness: true,
      usesNormalizedIdentityForReplay: true,
      usesOneKeyPerAttempt: true,
    },
    title: 'Assignment submission idempotency continuity chain',
  };
}
