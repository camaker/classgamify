import { ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES } from '@/assignments/submission-lifecycle-write';

export const ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES =
  ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES;

export const ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/assignments/submission-lifecycle-write.ts',
  'src/lib/error-text.ts',
  'src/api/assignments.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/lifecycle-query.ts',
  'src/assignments/submission-idempotency-continuity-chain.ts',
  'src/assignments/attempt-limit-concurrency.ts',
  'src/assignments/attempt-limit-continuity-chain.ts',
  'src/assignments/attempt-persistence-continuity-chain.ts',
  'src/assignments/submission-validation-continuity-chain.ts',
  'src/assignments/validation.ts',
  'src/activities/runtime.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/identity.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/routes/play/$shareId.tsx',
  'src/assignments/public.ts',
  'src/assignments/unavailable-access.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/result-view.ts',
  'src/db/app.schema.ts',
  'src/db/migrations/0011_attempt_submission_lifecycle_guard.sql',
  'scripts/assignment-submission-lifecycle-write-guard-contract.test.ts',
  'tests/e2e/specs/student-runner.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentSubmissionLifecycleContinuityChainStageId =
  (typeof ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES)[number]['id'];

export type AssignmentSubmissionLifecycleContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerText: false;
  exposesAttemptNumbers: false;
  exposesIdentityKeys: false;
  exposesInternalTriggerMarkers: false;
  exposesRawAnonymousTokens: false;
  exposesStudentNames: false;
  exposesSubmissionKeys: false;
  itemIds: AssignmentSubmissionLifecycleContinuityChainStageId[];
  preservesReplayBeforeLifecycleRejection: true;
  sourceFiles: string[];
  usesDatabaseClockForExpiry: true;
  usesLocalizedLifecycleErrors: true;
  usesSameStatementWriteGuard: true;
};

const STAGE_VALUES: Record<
  AssignmentSubmissionLifecycleContinuityChainStageId,
  string
> = {
  'initial-assignment-lookup': 'Current assignment row',
  'same-key-replay-before-lifecycle': 'Persisted retry first',
  'initial-lifecycle-check': 'Open link required',
  'runtime-answer-validation': 'Frozen item boundary',
  'deterministic-score-preparation': 'Stable evaluation',
  'attempt-slot-reservation': 'Normalized identity slot',
  'same-key-replay-after-write-conflict': 'Concurrent retry recovered',
  'write-error-mapping': 'Known lifecycle failures',
  'localized-status-error': 'Closed message',
  'localized-expiry-error': 'Expired message',
  'status-trigger': 'Published state required',
  'expiry-trigger': 'Future close time required',
  'before-insert-timing': 'D1 pre-write boundary',
  'assignment-row-state-read': 'Same statement lookup',
  'database-clock-expiry-read': 'D1 clock comparison',
  'status-abort-marker': 'Internal closed marker',
  'expiry-abort-marker': 'Internal expiry marker',
  'same-statement-write-boundary': 'Race-safe rejection',
  'error-cause-chain': 'Nested D1 error text',
  'status-marker-classification': 'Closed lifecycle class',
  'expiry-marker-classification': 'Expired lifecycle class',
  'identity-slot-conflict-classification': 'Exact unique target',
  'non-slot-error-rethrow': 'Unrelated failure preserved',
  'occupied-slot-confirmation': 'Confirmed slot race',
  'bounded-slot-recount': 'Finite retry loop',
  'unlimited-write-guard': 'Lifecycle still enforced',
  'internal-marker-hidden': 'Trigger details hidden',
  'identity-slot-hidden': 'Slot metadata hidden',
  'student-answer-hidden': 'Submission content hidden',
  'teacher-result-continuity': 'Only persisted attempts visible',
};

export function buildAssignmentSubmissionLifecycleContinuityChainView() {
  const itemViews = ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = STAGE_VALUES[stage.id];
      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from replay-first API handling through the D1 write boundary, localized recovery, and sanitized result consumers.`,
        id: stage.id,
        label,
        value,
      };
    }
  );

  const privacy: AssignmentSubmissionLifecycleContinuityChainPrivacyContract = {
    chainSourceFileCount:
      ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    exposesAnswerText: false,
    exposesAttemptNumbers: false,
    exposesIdentityKeys: false,
    exposesInternalTriggerMarkers: false,
    exposesRawAnonymousTokens: false,
    exposesStudentNames: false,
    exposesSubmissionKeys: false,
    itemIds: ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES.map(
      (stage) => stage.id
    ),
    preservesReplayBeforeLifecycleRejection: true,
    sourceFiles: [
      ...ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES,
    ],
    usesDatabaseClockForExpiry: true,
    usesLocalizedLifecycleErrors: true,
    usesSameStatementWriteGuard: true,
  };

  return {
    description:
      'Thirty-slice submission lifecycle continuity chain from replay-first handling and initial lifecycle checks through D1 status and expiry triggers, conflict classification, localized errors, teacher results, and privacy.',
    itemViews,
    privacy,
    title: 'Assignment submission lifecycle continuity chain',
  };
}
