import { ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS } from '@/assignments/submission-validation-handoff';

export const ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS =
  ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS;

export const ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/attempt-answers.ts',
  'src/assignments/submission-limits.ts',
  'src/assignments/validation.ts',
  'src/activities/runtime.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/api/assignments.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runtime-item-list.ts',
  'src/assignments/runtime-identity-handoff.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/student-identity-lifecycle-chain.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results.ts',
  'src/components/assignments/student-runner-submit-controls.tsx',
  'src/components/assignments/student-runner-submission-handoff.tsx',
  'src/routes/play/$shareId.tsx',
  'src/activities/types.ts',
  'scripts/assignment-submission-validation-handoff-semantic-views.test.ts',
  'tests/e2e/specs/student-runner.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentSubmissionValidationContinuityChainHandoffItemId =
  (typeof ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentSubmissionValidationContinuityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentSubmissionValidationContinuityChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentSubmissionValidationContinuityChainPrivacyContract = {
  allowsConfirmedPartialSubmissions: true;
  chainSourceFileCount: number;
  exposesActivityContentJson: false;
  exposesAnswerText: false;
  exposesRawAnonymousTokens: false;
  exposesRawPayloadRows: false;
  exposesRuntimeItemIds: false;
  exposesSettingsJson: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentNames: false;
  exposesTeacherAnswers: false;
  itemIds: AssignmentSubmissionValidationContinuityChainHandoffItemId[];
  sourceFiles: string[];
  validatesBeforeScoring: true;
  usesFrozenRuntimeItems: true;
  usesSharedAttemptAnswerHelpers: true;
};

export type AssignmentSubmissionValidationContinuityChainHandoffView = {
  description: string;
  itemViews: AssignmentSubmissionValidationContinuityChainHandoffItemView[];
  privacy: AssignmentSubmissionValidationContinuityChainPrivacyContract;
  title: string;
};

const ITEM_VALUES: Record<
  AssignmentSubmissionValidationContinuityChainHandoffItemId,
  string
> = {
  'validation-scope': 'Frozen runtime submission',
  'runtime-source': 'Assignment snapshot',
  'runtime-item-count': 'Frozen item count',
  'submitted-answer-count': 'Normalized payload count',
  'partial-submission': 'Allowed after confirmation',
  'empty-answer-omission': 'Empty rows omitted',
  'runtime-id-normalization': 'Shared display normalization',
  'submitted-id-normalization': 'Shared display normalization',
  'runtime-id-uniqueness': 'Unique normalized ids',
  'blank-id-rejection': 'Rejected before scoring',
  'unknown-item-rejection': 'Rejected before scoring',
  'duplicate-item-rejection': 'Rejected before scoring',
  'too-many-rejection': 'Rejected before scoring',
  'duplicate-runtime-rejection': 'Rejected before scoring',
  'fullwidth-id-normalization': 'Unicode normalized',
  'api-answer-limit': 'Shared answer limits',
  'api-item-id-limit': 'Shared item id limit',
  'api-answer-text-limit': 'Shared answer text limit',
  'api-max-answers-limit': 'Shared row limit',
  'api-normalizes-answers': 'Normalize first',
  'api-validates-before-scoring': 'Validate second',
  'scoring-normalized-answers': 'Score validated rows',
  'persistence-normalized-answers': 'Persist scored evaluation',
  'client-payload-builder': 'Frozen runtime rows',
  'client-progress-source': 'Frozen runtime progress',
  'safe-failure-mapping': 'Public-safe error',
  'teacher-result-boundary': 'Stored scored attempts',
  'public-payload-boundary': 'Teacher answers stripped',
  'raw-payload-guard': 'Payload rows hidden',
  'privacy-guard': 'Private content hidden',
};

export function buildAssignmentSubmissionValidationContinuityChainHandoffView(): AssignmentSubmissionValidationContinuityChainHandoffView {
  const itemViews =
    ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.map(
      (id) => {
        const label = id
          .split('-')
          .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
          .join(' ');
        const value = ITEM_VALUES[id];

        return {
          ariaLabel: `${label}: ${value}`,
          description: `${label} stays aligned from the frozen assignment runtime through browser payload construction, server validation, scoring, persistence, and result consumers.`,
          id,
          label,
          value,
        };
      }
    );

  return {
    description:
      'Thirty-slice submission validation continuity chain from frozen runtime ids and browser answer rows through shared limits, normalization, rejection policies, validate-before-scoring order, persistence, public safety, and teacher results.',
    itemViews,
    privacy: {
      allowsConfirmedPartialSubmissions: true,
      chainSourceFileCount:
        ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesActivityContentJson: false,
      exposesAnswerText: false,
      exposesRawAnonymousTokens: false,
      exposesRawPayloadRows: false,
      exposesRuntimeItemIds: false,
      exposesSettingsJson: false,
      exposesSourceMaterialMetadata: false,
      exposesStudentNames: false,
      exposesTeacherAnswers: false,
      itemIds: [
        ...ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
      ],
      sourceFiles: [
        ...ASSIGNMENT_SUBMISSION_VALIDATION_CONTINUITY_CHAIN_SOURCE_FILES,
      ],
      validatesBeforeScoring: true,
      usesFrozenRuntimeItems: true,
      usesSharedAttemptAnswerHelpers: true,
    },
    title: 'Assignment submission validation continuity chain',
  };
}
