import {
  assertSubmittedAnswersMatchRuntimeItems,
  getAttemptAnswerRuntimeItemEntries,
  normalizeAttemptAnswerItemId,
  normalizeSubmittedAttemptAnswers,
  type AssignmentAttemptAnswerValidationErrorCode,
  type AttemptAnswerRuntimeItem,
  type SubmittedAttemptAnswer,
} from '@/assignments/attempt-answers';
import { ASSIGNMENT_SUBMISSION_ANSWER_LIMITS } from '@/assignments/submission-limits';
import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS = [
  'validation-scope',
  'runtime-source',
  'runtime-item-count',
  'submitted-answer-count',
  'partial-submission',
  'empty-answer-omission',
  'runtime-id-normalization',
  'submitted-id-normalization',
  'runtime-id-uniqueness',
  'blank-id-rejection',
  'unknown-item-rejection',
  'duplicate-item-rejection',
  'too-many-rejection',
  'duplicate-runtime-rejection',
  'fullwidth-id-normalization',
  'api-answer-limit',
  'api-item-id-limit',
  'api-answer-text-limit',
  'api-max-answers-limit',
  'api-normalizes-answers',
  'api-validates-before-scoring',
  'scoring-normalized-answers',
  'persistence-normalized-answers',
  'client-payload-builder',
  'client-progress-source',
  'safe-failure-mapping',
  'teacher-result-boundary',
  'public-payload-boundary',
  'raw-payload-guard',
  'privacy-guard',
] as const;

export type AssignmentSubmissionValidationHandoffItemId =
  (typeof ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS)[number];

export type AssignmentSubmissionValidationHandoffEvidence = {
  answerTextLimit: number;
  apiAnswerLimitUsesSharedConstant: boolean;
  apiItemIdLimitUsesSharedConstant: boolean;
  apiMaxAnswersUsesSharedConstant: boolean;
  apiNormalizesAnswersBeforeValidation: boolean;
  apiValidatesBeforeScoring: boolean;
  blankIdRejected: boolean;
  clientPayloadUsesRuntimeItems: boolean;
  clientProgressUsesRuntimeItems: boolean;
  duplicateItemRejected: boolean;
  duplicateRuntimeItemRejected: boolean;
  emptyAnswersOmitted: boolean;
  fullwidthIdNormalized: boolean;
  itemIdLimit: number;
  maxAnswersLimit: number;
  partialSubmissionAllowed: boolean;
  persistenceUsesNormalizedAnswers: boolean;
  privacyGuardsPrivateData: boolean;
  publicPayloadExcludesTeacherAnswers: boolean;
  rawPayloadHidden: boolean;
  runtimeIdNormalizationUsesSharedHelper: boolean;
  runtimeIdsUnique: boolean;
  runtimeItemCount: number;
  runtimeSourceUsesFrozenItems: boolean;
  safeFailureMapping: boolean;
  scoringUsesNormalizedAnswers: boolean;
  submittedAnswerCount: number;
  submittedIdNormalizationUsesSharedHelper: boolean;
  teacherResultsUseStoredScoredAnswers: boolean;
  tooManyRejected: boolean;
  unknownItemRejected: boolean;
};

export type BuildAssignmentSubmissionValidationHandoffEvidenceInput = {
  apiAnswerLimitUsesSharedConstant?: boolean;
  apiItemIdLimitUsesSharedConstant?: boolean;
  apiMaxAnswersUsesSharedConstant?: boolean;
  apiNormalizesAnswersBeforeValidation?: boolean;
  apiValidatesBeforeScoring?: boolean;
  clientPayloadUsesRuntimeItems?: boolean;
  clientProgressUsesRuntimeItems?: boolean;
  emptyAnswersOmitted?: boolean;
  persistenceUsesNormalizedAnswers?: boolean;
  privacyGuardsPrivateData?: boolean;
  publicPayloadExcludesTeacherAnswers?: boolean;
  rawPayloadHidden?: boolean;
  runtimeIdNormalizationUsesSharedHelper?: boolean;
  runtimeItems: AttemptAnswerRuntimeItem[];
  runtimeSourceUsesFrozenItems?: boolean;
  safeFailureMapping?: boolean;
  scoringUsesNormalizedAnswers?: boolean;
  submittedAnswerCount?: number;
  submittedAnswers?: Array<SubmittedAttemptAnswer & { answer?: string }>;
  submittedIdNormalizationUsesSharedHelper?: boolean;
  teacherResultsUseStoredScoredAnswers?: boolean;
};

export type AssignmentSubmissionValidationHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentSubmissionValidationHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentSubmissionValidationHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesRawAnonymousToken: false;
  exposesRawPayloadRows: false;
  exposesRuntimeItemIds: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: AssignmentSubmissionValidationHandoffItemId[];
  mutatesAttempts: false;
  scope: 'assignment-submission-validation-boundary';
  usesSharedAttemptAnswerHelpers: true;
};

export type AssignmentSubmissionValidationHandoffView = {
  description: string;
  itemViews: AssignmentSubmissionValidationHandoffItemView[];
  privacy: AssignmentSubmissionValidationHandoffPrivacyContract;
  title: string;
};

type AssignmentSubmissionValidationHandoffItemContext =
  AssignmentSubmissionValidationHandoffEvidence & {
    id: AssignmentSubmissionValidationHandoffItemId;
  };

const VALIDATION_PROBE_RUNTIME_ITEMS = [
  { id: 'probe-item-1' },
  { id: 'probe-item-2' },
] as const satisfies AttemptAnswerRuntimeItem[];

export function buildAssignmentSubmissionValidationHandoffEvidence({
  apiAnswerLimitUsesSharedConstant = true,
  apiItemIdLimitUsesSharedConstant = true,
  apiMaxAnswersUsesSharedConstant = true,
  apiNormalizesAnswersBeforeValidation = true,
  apiValidatesBeforeScoring = true,
  clientPayloadUsesRuntimeItems = true,
  clientProgressUsesRuntimeItems = true,
  emptyAnswersOmitted = true,
  persistenceUsesNormalizedAnswers = true,
  privacyGuardsPrivateData = true,
  publicPayloadExcludesTeacherAnswers = true,
  rawPayloadHidden = true,
  runtimeIdNormalizationUsesSharedHelper = true,
  runtimeItems,
  runtimeSourceUsesFrozenItems = true,
  safeFailureMapping = true,
  scoringUsesNormalizedAnswers = true,
  submittedAnswerCount,
  submittedAnswers,
  submittedIdNormalizationUsesSharedHelper = true,
  teacherResultsUseStoredScoredAnswers = true,
}: BuildAssignmentSubmissionValidationHandoffEvidenceInput): AssignmentSubmissionValidationHandoffEvidence {
  const normalizedSubmittedAnswers = submittedAnswers
    ? normalizeSubmittedAttemptAnswers(
        submittedAnswers.map((answer) => ({
          answer: answer.answer ?? '',
          itemId: answer.itemId,
        }))
      )
    : [];
  const runtimeItemCount = normalizeRuntimeDisplayCount(
    getAttemptAnswerRuntimeItemEntries({ runtimeItems }).length
  );
  const effectiveSubmittedAnswerCount = normalizeRuntimeDisplayCount(
    submittedAnswers ? normalizedSubmittedAnswers.length : submittedAnswerCount
  );

  return {
    answerTextLimit: ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.answerMaxLength,
    apiAnswerLimitUsesSharedConstant,
    apiItemIdLimitUsesSharedConstant,
    apiMaxAnswersUsesSharedConstant,
    apiNormalizesAnswersBeforeValidation,
    apiValidatesBeforeScoring,
    blankIdRejected:
      validationProbeCode({
        answers: [{ itemId: '  ' }],
        runtimeItems: VALIDATION_PROBE_RUNTIME_ITEMS,
      }) === 'unknown-item',
    clientPayloadUsesRuntimeItems,
    clientProgressUsesRuntimeItems,
    duplicateItemRejected:
      validationProbeCode({
        answers: [{ itemId: 'probe-item-1' }, { itemId: 'probe-item-1' }],
        runtimeItems: VALIDATION_PROBE_RUNTIME_ITEMS,
      }) === 'duplicate-item',
    duplicateRuntimeItemRejected:
      validationProbeCode({
        answers: [{ itemId: 'probe-item-1' }],
        runtimeItems: [{ id: 'probe-item-1' }, { id: ' probe-item-1 ' }],
      }) === 'duplicate-runtime-item',
    emptyAnswersOmitted,
    fullwidthIdNormalized:
      normalizeAttemptAnswerItemId(' ｉｔｅｍ－１ ') === 'item-1',
    itemIdLimit: ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.itemIdMaxLength,
    maxAnswersLimit: ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.maxAnswers,
    partialSubmissionAllowed:
      validationProbeCode({
        answers: [{ itemId: 'probe-item-1' }],
        runtimeItems: VALIDATION_PROBE_RUNTIME_ITEMS,
      }) === undefined,
    persistenceUsesNormalizedAnswers,
    privacyGuardsPrivateData,
    publicPayloadExcludesTeacherAnswers,
    rawPayloadHidden,
    runtimeIdNormalizationUsesSharedHelper,
    runtimeIdsUnique:
      validationProbeCode({
        answers: [],
        runtimeItems,
      }) !== 'duplicate-runtime-item',
    runtimeItemCount,
    runtimeSourceUsesFrozenItems,
    safeFailureMapping,
    scoringUsesNormalizedAnswers,
    submittedAnswerCount: Math.min(
      effectiveSubmittedAnswerCount,
      ASSIGNMENT_SUBMISSION_ANSWER_LIMITS.maxAnswers
    ),
    submittedIdNormalizationUsesSharedHelper,
    teacherResultsUseStoredScoredAnswers,
    tooManyRejected:
      validationProbeCode({
        answers: [
          { itemId: 'probe-item-1' },
          { itemId: 'probe-item-2' },
          { itemId: 'probe-item-3' },
        ],
        runtimeItems: VALIDATION_PROBE_RUNTIME_ITEMS,
      }) === 'too-many',
    unknownItemRejected:
      validationProbeCode({
        answers: [{ itemId: 'unknown-probe-item' }],
        runtimeItems: VALIDATION_PROBE_RUNTIME_ITEMS,
      }) === 'unknown-item',
  };
}

export function buildAssignmentSubmissionValidationHandoffView(
  evidence: AssignmentSubmissionValidationHandoffEvidence
): AssignmentSubmissionValidationHandoffView {
  const itemViews = ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildAssignmentSubmissionValidationHandoffItemView({ ...evidence, id })
  );

  return {
    description: m.assignment_submission_validation_handoff_description(),
    itemViews,
    privacy:
      buildAssignmentSubmissionValidationHandoffPrivacyContract(itemViews),
    title: m.assignment_submission_validation_handoff_title(),
  };
}

function buildAssignmentSubmissionValidationHandoffItemView(
  context: AssignmentSubmissionValidationHandoffItemContext
): AssignmentSubmissionValidationHandoffItemView {
  const item = buildAssignmentSubmissionValidationHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.assignment_submission_validation_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildAssignmentSubmissionValidationHandoffItem(
  context: AssignmentSubmissionValidationHandoffItemContext
): Omit<AssignmentSubmissionValidationHandoffItemView, 'ariaLabel'> {
  switch (context.id) {
    case 'validation-scope':
      return buildStaticItem({
        context,
        value: m.assignment_submission_validation_handoff_scope_value(),
      });
    case 'runtime-source':
      return buildBoundaryItem({
        context,
        ok: context.runtimeSourceUsesFrozenItems,
        value: m.assignment_submission_validation_handoff_frozen_value(),
      });
    case 'runtime-item-count':
      return buildStaticItem({
        context,
        value: m.assignment_submission_validation_handoff_runtime_count_value({
          count: context.runtimeItemCount,
        }),
      });
    case 'submitted-answer-count':
      return buildStaticItem({
        context,
        value: m.assignment_submission_validation_handoff_answer_count_value({
          count: context.submittedAnswerCount,
        }),
      });
    case 'partial-submission':
      return buildBoundaryItem({
        context,
        ok: context.partialSubmissionAllowed,
        value: m.assignment_submission_validation_handoff_partial_value(),
      });
    case 'empty-answer-omission':
      return buildBoundaryItem({
        context,
        ok: context.emptyAnswersOmitted,
        value: m.assignment_submission_validation_handoff_empty_omitted_value(),
      });
    case 'runtime-id-normalization':
      return buildBoundaryItem({
        context,
        ok: context.runtimeIdNormalizationUsesSharedHelper,
      });
    case 'submitted-id-normalization':
      return buildBoundaryItem({
        context,
        ok: context.submittedIdNormalizationUsesSharedHelper,
      });
    case 'runtime-id-uniqueness':
      return buildBoundaryItem({
        context,
        ok: context.runtimeIdsUnique,
        value: m.assignment_submission_validation_handoff_unique_value(),
      });
    case 'blank-id-rejection':
      return buildRejectionItem({
        context,
        ok: context.blankIdRejected,
      });
    case 'unknown-item-rejection':
      return buildRejectionItem({
        context,
        ok: context.unknownItemRejected,
      });
    case 'duplicate-item-rejection':
      return buildRejectionItem({
        context,
        ok: context.duplicateItemRejected,
      });
    case 'too-many-rejection':
      return buildRejectionItem({
        context,
        ok: context.tooManyRejected,
      });
    case 'duplicate-runtime-rejection':
      return buildRejectionItem({
        context,
        ok: context.duplicateRuntimeItemRejected,
      });
    case 'fullwidth-id-normalization':
      return buildBoundaryItem({
        context,
        ok: context.fullwidthIdNormalized,
        value: m.assignment_submission_validation_handoff_normalized_value(),
      });
    case 'api-answer-limit':
      return buildLimitItem({
        context,
        count: context.maxAnswersLimit,
        ok: context.apiAnswerLimitUsesSharedConstant,
      });
    case 'api-item-id-limit':
      return buildLimitItem({
        context,
        count: context.itemIdLimit,
        ok: context.apiItemIdLimitUsesSharedConstant,
      });
    case 'api-answer-text-limit':
      return buildLimitItem({
        context,
        count: context.answerTextLimit,
        ok: true,
        unit: m.assignment_submission_validation_handoff_chars_unit(),
      });
    case 'api-max-answers-limit':
      return buildLimitItem({
        context,
        count: context.maxAnswersLimit,
        ok: context.apiMaxAnswersUsesSharedConstant,
      });
    case 'api-normalizes-answers':
      return buildBoundaryItem({
        context,
        ok: context.apiNormalizesAnswersBeforeValidation,
      });
    case 'api-validates-before-scoring':
      return buildBoundaryItem({
        context,
        ok: context.apiValidatesBeforeScoring,
      });
    case 'scoring-normalized-answers':
      return buildBoundaryItem({
        context,
        ok: context.scoringUsesNormalizedAnswers,
      });
    case 'persistence-normalized-answers':
      return buildBoundaryItem({
        context,
        ok: context.persistenceUsesNormalizedAnswers,
      });
    case 'client-payload-builder':
      return buildBoundaryItem({
        context,
        ok: context.clientPayloadUsesRuntimeItems,
      });
    case 'client-progress-source':
      return buildBoundaryItem({
        context,
        ok: context.clientProgressUsesRuntimeItems,
      });
    case 'safe-failure-mapping':
      return buildBoundaryItem({
        context,
        ok: context.safeFailureMapping,
        value: m.assignment_submission_validation_handoff_safe_error_value(),
      });
    case 'teacher-result-boundary':
      return buildBoundaryItem({
        context,
        ok: context.teacherResultsUseStoredScoredAnswers,
      });
    case 'public-payload-boundary':
      return buildBoundaryItem({
        context,
        ok: context.publicPayloadExcludesTeacherAnswers,
      });
    case 'raw-payload-guard':
      return buildBoundaryItem({
        context,
        ok: context.rawPayloadHidden,
        value:
          m.assignment_submission_validation_handoff_raw_payload_hidden_value(),
      });
    case 'privacy-guard':
      return buildBoundaryItem({
        context,
        ok: context.privacyGuardsPrivateData,
        value:
          m.assignment_submission_validation_handoff_private_data_hidden_value(),
      });
  }
}

function buildStaticItem({
  context,
  value,
}: {
  context: AssignmentSubmissionValidationHandoffItemContext;
  value: string;
}): Omit<AssignmentSubmissionValidationHandoffItemView, 'ariaLabel'> {
  return {
    description: getAssignmentSubmissionValidationHandoffItemDescription(
      context.id
    ),
    id: context.id,
    label: getAssignmentSubmissionValidationHandoffItemLabel(context.id),
    value,
  };
}

function buildBoundaryItem({
  context,
  ok,
  value,
}: {
  context: AssignmentSubmissionValidationHandoffItemContext;
  ok: boolean;
  value?: string;
}): Omit<AssignmentSubmissionValidationHandoffItemView, 'ariaLabel'> {
  return buildStaticItem({
    context,
    value:
      ok && value
        ? value
        : ok
          ? m.assignment_submission_validation_handoff_ready_value()
          : m.assignment_submission_validation_handoff_needs_review_value(),
  });
}

function buildRejectionItem({
  context,
  ok,
}: {
  context: AssignmentSubmissionValidationHandoffItemContext;
  ok: boolean;
}) {
  return buildBoundaryItem({
    context,
    ok,
    value: m.assignment_submission_validation_handoff_rejected_value(),
  });
}

function buildLimitItem({
  context,
  count,
  ok,
  unit = m.assignment_submission_validation_handoff_max_unit(),
}: {
  context: AssignmentSubmissionValidationHandoffItemContext;
  count: number;
  ok: boolean;
  unit?: string;
}) {
  return buildBoundaryItem({
    context,
    ok,
    value: m.assignment_submission_validation_handoff_limit_value({
      count,
      unit,
    }),
  });
}

function buildAssignmentSubmissionValidationHandoffPrivacyContract(
  itemViews: AssignmentSubmissionValidationHandoffItemView[]
): AssignmentSubmissionValidationHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesRawAnonymousToken: false,
    exposesRawPayloadRows: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesAttempts: false,
    scope: 'assignment-submission-validation-boundary',
    usesSharedAttemptAnswerHelpers: true,
  };
}

function validationProbeCode({
  answers,
  runtimeItems,
}: {
  answers: SubmittedAttemptAnswer[];
  runtimeItems: AttemptAnswerRuntimeItem[];
}): AssignmentAttemptAnswerValidationErrorCode | undefined {
  try {
    assertSubmittedAnswersMatchRuntimeItems({ answers, runtimeItems });
    return undefined;
  } catch (error) {
    return error instanceof Error && 'code' in error
      ? (error.code as AssignmentAttemptAnswerValidationErrorCode)
      : undefined;
  }
}

function getAssignmentSubmissionValidationHandoffItemLabel(
  id: AssignmentSubmissionValidationHandoffItemId
) {
  switch (id) {
    case 'validation-scope':
      return m.assignment_submission_validation_handoff_scope_label();
    case 'runtime-source':
      return m.assignment_submission_validation_handoff_runtime_source_label();
    case 'runtime-item-count':
      return m.assignment_submission_validation_handoff_runtime_count_label();
    case 'submitted-answer-count':
      return m.assignment_submission_validation_handoff_answer_count_label();
    case 'partial-submission':
      return m.assignment_submission_validation_handoff_partial_label();
    case 'empty-answer-omission':
      return m.assignment_submission_validation_handoff_empty_omission_label();
    case 'runtime-id-normalization':
      return m.assignment_submission_validation_handoff_runtime_norm_label();
    case 'submitted-id-normalization':
      return m.assignment_submission_validation_handoff_submitted_norm_label();
    case 'runtime-id-uniqueness':
      return m.assignment_submission_validation_handoff_unique_ids_label();
    case 'blank-id-rejection':
      return m.assignment_submission_validation_handoff_blank_id_label();
    case 'unknown-item-rejection':
      return m.assignment_submission_validation_handoff_unknown_item_label();
    case 'duplicate-item-rejection':
      return m.assignment_submission_validation_handoff_duplicate_item_label();
    case 'too-many-rejection':
      return m.assignment_submission_validation_handoff_too_many_label();
    case 'duplicate-runtime-rejection':
      return m.assignment_submission_validation_handoff_duplicate_runtime_label();
    case 'fullwidth-id-normalization':
      return m.assignment_submission_validation_handoff_fullwidth_label();
    case 'api-answer-limit':
      return m.assignment_submission_validation_handoff_api_answer_limit_label();
    case 'api-item-id-limit':
      return m.assignment_submission_validation_handoff_api_item_id_limit_label();
    case 'api-answer-text-limit':
      return m.assignment_submission_validation_handoff_api_answer_text_label();
    case 'api-max-answers-limit':
      return m.assignment_submission_validation_handoff_api_max_answers_label();
    case 'api-normalizes-answers':
      return m.assignment_submission_validation_handoff_api_normalizes_label();
    case 'api-validates-before-scoring':
      return m.assignment_submission_validation_handoff_api_before_scoring_label();
    case 'scoring-normalized-answers':
      return m.assignment_submission_validation_handoff_scoring_label();
    case 'persistence-normalized-answers':
      return m.assignment_submission_validation_handoff_persistence_label();
    case 'client-payload-builder':
      return m.assignment_submission_validation_handoff_client_payload_label();
    case 'client-progress-source':
      return m.assignment_submission_validation_handoff_client_progress_label();
    case 'safe-failure-mapping':
      return m.assignment_submission_validation_handoff_safe_failure_label();
    case 'teacher-result-boundary':
      return m.assignment_submission_validation_handoff_teacher_result_label();
    case 'public-payload-boundary':
      return m.assignment_submission_validation_handoff_public_payload_label();
    case 'raw-payload-guard':
      return m.assignment_submission_validation_handoff_raw_payload_label();
    case 'privacy-guard':
      return m.assignment_submission_validation_handoff_privacy_label();
  }
}

function getAssignmentSubmissionValidationHandoffItemDescription(
  id: AssignmentSubmissionValidationHandoffItemId
) {
  switch (id) {
    case 'validation-scope':
      return m.assignment_submission_validation_handoff_scope_description();
    case 'runtime-source':
      return m.assignment_submission_validation_handoff_runtime_source_description();
    case 'runtime-item-count':
      return m.assignment_submission_validation_handoff_runtime_count_description();
    case 'submitted-answer-count':
      return m.assignment_submission_validation_handoff_answer_count_description();
    case 'partial-submission':
      return m.assignment_submission_validation_handoff_partial_description();
    case 'empty-answer-omission':
      return m.assignment_submission_validation_handoff_empty_omission_description();
    case 'runtime-id-normalization':
      return m.assignment_submission_validation_handoff_runtime_norm_description();
    case 'submitted-id-normalization':
      return m.assignment_submission_validation_handoff_submitted_norm_description();
    case 'runtime-id-uniqueness':
      return m.assignment_submission_validation_handoff_unique_ids_description();
    case 'blank-id-rejection':
      return m.assignment_submission_validation_handoff_blank_id_description();
    case 'unknown-item-rejection':
      return m.assignment_submission_validation_handoff_unknown_item_description();
    case 'duplicate-item-rejection':
      return m.assignment_submission_validation_handoff_duplicate_item_description();
    case 'too-many-rejection':
      return m.assignment_submission_validation_handoff_too_many_description();
    case 'duplicate-runtime-rejection':
      return m.assignment_submission_validation_handoff_duplicate_runtime_description();
    case 'fullwidth-id-normalization':
      return m.assignment_submission_validation_handoff_fullwidth_description();
    case 'api-answer-limit':
      return m.assignment_submission_validation_handoff_api_answer_limit_description();
    case 'api-item-id-limit':
      return m.assignment_submission_validation_handoff_api_item_id_limit_description();
    case 'api-answer-text-limit':
      return m.assignment_submission_validation_handoff_api_answer_text_description();
    case 'api-max-answers-limit':
      return m.assignment_submission_validation_handoff_api_max_answers_description();
    case 'api-normalizes-answers':
      return m.assignment_submission_validation_handoff_api_normalizes_description();
    case 'api-validates-before-scoring':
      return m.assignment_submission_validation_handoff_api_before_scoring_description();
    case 'scoring-normalized-answers':
      return m.assignment_submission_validation_handoff_scoring_description();
    case 'persistence-normalized-answers':
      return m.assignment_submission_validation_handoff_persistence_description();
    case 'client-payload-builder':
      return m.assignment_submission_validation_handoff_client_payload_description();
    case 'client-progress-source':
      return m.assignment_submission_validation_handoff_client_progress_description();
    case 'safe-failure-mapping':
      return m.assignment_submission_validation_handoff_safe_failure_description();
    case 'teacher-result-boundary':
      return m.assignment_submission_validation_handoff_teacher_result_description();
    case 'public-payload-boundary':
      return m.assignment_submission_validation_handoff_public_payload_description();
    case 'raw-payload-guard':
      return m.assignment_submission_validation_handoff_raw_payload_description();
    case 'privacy-guard':
      return m.assignment_submission_validation_handoff_privacy_description();
  }
}
