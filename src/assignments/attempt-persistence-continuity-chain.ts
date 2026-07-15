import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';

export const ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS =
  ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS;

export const ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/api/assignments.ts',
  'src/assignments/attempt-answers.ts',
  'src/assignments/submission-validation-continuity-chain.ts',
  'src/assignments/attempt-limit-continuity-chain.ts',
  'src/assignments/attempt-duration-continuity-chain.ts',
  'src/assignments/submission-idempotency.ts',
  'src/assignments/submission-lifecycle-write.ts',
  'src/assignments/attempt-limit-concurrency.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/public.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/attempt-stats-continuity-chain.ts',
  'src/assignments/results-export.ts',
  'src/assignments/attempt-review-card-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/db/app.schema.ts',
  'scripts/assignment-attempt-persistence-handoff-semantic-views.test.ts',
  'scripts/scored-attempt-result-chain-handoff.test.ts',
  'tests/e2e/specs/student-runner.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentAttemptPersistenceContinuityChainHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptPersistenceContinuityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptPersistenceContinuityChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptPersistenceContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerText: false;
  exposesAttemptIds: false;
  exposesCsvDataUrl: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIds: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentNames: false;
  exposesTeacherAnswers: false;
  itemIds: AssignmentAttemptPersistenceContinuityChainHandoffItemId[];
  sourceFiles: string[];
  storesImmutableAnswerJson: true;
  storesImmutableResultJson: true;
  storesScoredAttemptsOnly: true;
  usesScoredAttemptInsertHelper: true;
};

export type AssignmentAttemptPersistenceContinuityChainHandoffView = {
  description: string;
  itemViews: AssignmentAttemptPersistenceContinuityChainHandoffItemView[];
  privacy: AssignmentAttemptPersistenceContinuityChainPrivacyContract;
  title: string;
};

const ITEM_VALUES: Record<
  AssignmentAttemptPersistenceContinuityChainHandoffItemId,
  string
> = {
  'persistence-scope': 'Scored attempt row',
  'api-lifecycle-gate': 'Open assignment',
  'api-identity-gate': 'Normalized identity',
  'attempt-limit-gate': 'Reserved attempt slot',
  'runtime-validation-gate': 'Validated frozen ids',
  'scoring-source': 'Runtime evaluation',
  'insert-builder': 'buildScoredAttemptInsert',
  'assignment-id': 'Assignment relation',
  'attempt-id': 'Generated row identity',
  'started-at': 'Derived start time',
  'completed-at': 'Submission completion time',
  'student-name-identity': 'Normalized named identity',
  'anonymous-token-identity': 'Normalized browser identity',
  'answers-json': 'Cloned scored answer rows',
  'template-type': 'Frozen template type',
  'answer-correctness': 'Scored correctness flags',
  'result-json': 'Cloned scored result',
  'score-source': 'Earned points',
  'max-score-source': 'Total points',
  'duration-source': 'Normalized duration',
  'immutable-answer-copy': 'Independent answer copy',
  'immutable-result-copy': 'Independent result copy',
  'public-result-boundary': 'Sanitized result response',
  'review-summary-boundary': 'Evaluation review summary',
  'result-analysis-boundary': 'Stored attempt analysis',
  'attempt-stats-boundary': 'Stored result metrics',
  'csv-export-boundary': 'Teacher-only export',
  'source-material-guard': 'Source metadata excluded',
  'raw-payload-guard': 'Raw payload excluded',
  'privacy-guard': 'Private values hidden',
};

export function buildAssignmentAttemptPersistenceContinuityChainHandoffView(): AssignmentAttemptPersistenceContinuityChainHandoffView {
  const itemViews =
    ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.map(
      (id) => {
        const label = id
          .split('-')
          .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
          .join(' ');
        const value = ITEM_VALUES[id];
        return {
          ariaLabel: `${label}: ${value}`,
          description: `${label} stays aligned from validated scored evaluation through immutable database persistence and every result consumer.`,
          id,
          label,
          value,
        };
      }
    );

  return {
    description:
      'Thirty-slice scored-attempt persistence continuity chain from submission gates and runtime evaluation through immutable answer/result JSON, sanitized feedback, teacher analysis, statistics, and CSV export.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesAnswerText: false,
      exposesAttemptIds: false,
      exposesCsvDataUrl: false,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayload: false,
      exposesRuntimeItemIds: false,
      exposesSourceMaterialMetadata: false,
      exposesStudentNames: false,
      exposesTeacherAnswers: false,
      itemIds: [
        ...ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
      ],
      sourceFiles: [
        ...ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES,
      ],
      storesImmutableAnswerJson: true,
      storesImmutableResultJson: true,
      storesScoredAttemptsOnly: true,
      usesScoredAttemptInsertHelper: true,
    },
    title: 'Assignment attempt persistence continuity chain',
  };
}
