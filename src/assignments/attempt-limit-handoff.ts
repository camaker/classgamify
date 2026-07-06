import {
  canUseAnotherAssignmentAttempt,
  normalizeAssignmentAttemptCount,
  normalizeAssignmentMaxAttempts,
  type AssignmentAttemptUsage,
} from '@/assignments/attempt-limits';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS = [
  'attempt-scope',
  'max-attempt-normalization',
  'previous-count-normalization',
  'used-attempts',
  'remaining-attempts',
  'unlimited-attempts',
  'limit-reached',
  'retry-availability',
  'result-usage-label',
  'student-name-identity',
  'anonymous-token-identity',
  'identity-mode',
  'attempt-counter-source',
  'max-attempt-parser',
  'api-previous-count-query',
  'server-enforcement',
  'scored-attempt-write-gate',
  'runner-result-boundary',
  'retry-button-boundary',
  'submission-gate-boundary',
  'delivery-summary-boundary',
  'public-rule-boundary',
  'result-page-boundary',
  'result-export-boundary',
  'negative-count-guard',
  'fractional-count-guard',
  'nonfinite-max-guard',
  'zero-max-guard',
  'raw-token-guard',
  'privacy-guard',
] as const;

export type AssignmentAttemptLimitHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptLimitHandoffIdentityMode =
  | 'anonymous'
  | 'student-name'
  | 'unknown';

export type AssignmentAttemptLimitHandoffEvidence = {
  anonymousIdentityUsesTokenStrategy: boolean;
  apiPreviousCountUsesIdentityQuery: boolean;
  attemptCounterUsesPreviousCount: boolean;
  deliverySummaryUsesAttemptLimit: boolean;
  fractionalCountNormalized: number;
  identityMode: AssignmentAttemptLimitHandoffIdentityMode;
  limitReachedCanRetry: boolean;
  maxAttemptParserUsesSharedHelper: boolean;
  maxAttempts?: number;
  negativeCountNormalized: number;
  nonFiniteMaxIsUnlimited: boolean;
  previousAttemptCount: number;
  privacyGuardsPrivateData: boolean;
  publicRulesUseAttemptLimit: boolean;
  rawTokenHidden: boolean;
  remainingAttempts?: number;
  resultExportUsesAttemptLimit: boolean;
  resultPageUsesAttemptLimit: boolean;
  resultUsageLabel: string;
  retryAvailable: boolean;
  retryButtonUsesLimitDecision: boolean;
  runnerResultUsesAttemptUsage: boolean;
  scoredAttemptWriteGatedByLimit: boolean;
  serverEnforcesLimit: boolean;
  studentNameIdentityUsesNameStrategy: boolean;
  submissionGateUsesLimitHelper: boolean;
  unlimitedAttempts: boolean;
  usedAttempts: number;
  zeroMaxIsUnlimited: boolean;
};

export type BuildAssignmentAttemptLimitHandoffEvidenceInput = {
  anonymousIdentityUsesTokenStrategy?: boolean;
  apiPreviousCountUsesIdentityQuery?: boolean;
  attemptUsage?: AssignmentAttemptUsage;
  attemptUsageLabel?: string;
  attemptCounterUsesPreviousCount?: boolean;
  deliverySummaryUsesAttemptLimit?: boolean;
  identityMode?: AssignmentAttemptLimitHandoffIdentityMode;
  maxAttemptParserUsesSharedHelper?: boolean;
  maxAttempts?: number | null;
  privacyGuardsPrivateData?: boolean;
  publicRulesUseAttemptLimit?: boolean;
  rawTokenHidden?: boolean;
  resultExportUsesAttemptLimit?: boolean;
  resultPageUsesAttemptLimit?: boolean;
  retryAvailable: boolean;
  retryButtonUsesLimitDecision?: boolean;
  runnerResultUsesAttemptUsage?: boolean;
  scoredAttemptWriteGatedByLimit?: boolean;
  serverEnforcesLimit?: boolean;
  studentNameIdentityUsesNameStrategy?: boolean;
  submittedAttemptCount: number;
  submissionGateUsesLimitHelper?: boolean;
};

export type AssignmentAttemptLimitHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptLimitHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptLimitHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRawIdentityKey: false;
  exposesRawSubmissionPayload: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: AssignmentAttemptLimitHandoffItemId[];
  mutatesAttempts: false;
  readsBrowserStorage: false;
  scope: 'assignment-attempt-limit-boundary';
  usesSharedAttemptLimitHelpers: true;
};

export type AssignmentAttemptLimitHandoffView = {
  description: string;
  itemViews: AssignmentAttemptLimitHandoffItemView[];
  privacy: AssignmentAttemptLimitHandoffPrivacyContract;
  title: string;
};

type AssignmentAttemptLimitHandoffItemContext =
  AssignmentAttemptLimitHandoffEvidence & {
    id: AssignmentAttemptLimitHandoffItemId;
  };

export function buildAssignmentAttemptLimitHandoffEvidence({
  anonymousIdentityUsesTokenStrategy = true,
  apiPreviousCountUsesIdentityQuery = true,
  attemptUsage,
  attemptUsageLabel,
  attemptCounterUsesPreviousCount = true,
  deliverySummaryUsesAttemptLimit = true,
  identityMode = 'unknown',
  maxAttemptParserUsesSharedHelper = true,
  maxAttempts,
  privacyGuardsPrivateData = true,
  publicRulesUseAttemptLimit = true,
  rawTokenHidden = true,
  resultExportUsesAttemptLimit = true,
  resultPageUsesAttemptLimit = true,
  retryAvailable,
  retryButtonUsesLimitDecision = true,
  runnerResultUsesAttemptUsage = true,
  scoredAttemptWriteGatedByLimit = true,
  serverEnforcesLimit = true,
  studentNameIdentityUsesNameStrategy = true,
  submittedAttemptCount,
  submissionGateUsesLimitHelper = true,
}: BuildAssignmentAttemptLimitHandoffEvidenceInput): AssignmentAttemptLimitHandoffEvidence {
  const normalizedMaxAttempts = normalizeAssignmentMaxAttempts(
    attemptUsage?.maxAttempts ?? maxAttempts
  );
  const usedAttempts = normalizeAssignmentAttemptCount(
    attemptUsage?.usedAttempts ?? submittedAttemptCount
  );
  const previousAttemptCount = normalizeAssignmentAttemptCount(
    attemptUsage
      ? Math.max(0, attemptUsage.usedAttempts - 1)
      : submittedAttemptCount
  );
  const remainingAttempts =
    attemptUsage?.remainingAttempts !== undefined
      ? normalizeAssignmentAttemptCount(attemptUsage.remainingAttempts)
      : normalizedMaxAttempts === undefined
        ? undefined
        : Math.max(0, normalizedMaxAttempts - usedAttempts);

  return {
    anonymousIdentityUsesTokenStrategy,
    apiPreviousCountUsesIdentityQuery,
    attemptCounterUsesPreviousCount,
    deliverySummaryUsesAttemptLimit,
    fractionalCountNormalized: normalizeAssignmentAttemptCount(2.8),
    identityMode,
    limitReachedCanRetry: canUseAnotherAssignmentAttempt({
      maxAttempts: normalizedMaxAttempts,
      usedAttempts: normalizedMaxAttempts ?? 0,
    }),
    maxAttemptParserUsesSharedHelper,
    maxAttempts: normalizedMaxAttempts,
    negativeCountNormalized: normalizeAssignmentAttemptCount(-3),
    nonFiniteMaxIsUnlimited:
      normalizeAssignmentMaxAttempts(Number.NaN) === undefined,
    previousAttemptCount,
    privacyGuardsPrivateData,
    publicRulesUseAttemptLimit,
    rawTokenHidden,
    remainingAttempts,
    resultExportUsesAttemptLimit,
    resultPageUsesAttemptLimit,
    resultUsageLabel:
      attemptUsageLabel ??
      formatAssignmentAttemptLimitRemainingAttempts(remainingAttempts),
    retryAvailable,
    retryButtonUsesLimitDecision,
    runnerResultUsesAttemptUsage,
    scoredAttemptWriteGatedByLimit,
    serverEnforcesLimit,
    studentNameIdentityUsesNameStrategy,
    submissionGateUsesLimitHelper,
    unlimitedAttempts: normalizedMaxAttempts === undefined,
    usedAttempts,
    zeroMaxIsUnlimited: normalizeAssignmentMaxAttempts(0) === undefined,
  };
}

export function buildAssignmentAttemptLimitHandoffView(
  evidence: AssignmentAttemptLimitHandoffEvidence
): AssignmentAttemptLimitHandoffView {
  const itemViews = ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentAttemptLimitHandoffItemView({ ...evidence, id })
  );

  return {
    description: m.assignment_attempt_limit_handoff_description(),
    itemViews,
    privacy: buildAssignmentAttemptLimitHandoffPrivacyContract(itemViews),
    title: m.assignment_attempt_limit_handoff_title(),
  };
}

function buildAssignmentAttemptLimitHandoffItemView(
  context: AssignmentAttemptLimitHandoffItemContext
): AssignmentAttemptLimitHandoffItemView {
  const item = buildAssignmentAttemptLimitHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.assignment_attempt_limit_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildAssignmentAttemptLimitHandoffItem(
  context: AssignmentAttemptLimitHandoffItemContext
): Omit<AssignmentAttemptLimitHandoffItemView, 'ariaLabel'> {
  switch (context.id) {
    case 'attempt-scope':
      return buildStaticItem({
        context,
        value: m.assignment_attempt_limit_handoff_scope_value(),
      });
    case 'max-attempt-normalization':
      return buildStaticItem({
        context,
        value: formatAssignmentAttemptLimitMaxAttempts(context.maxAttempts),
      });
    case 'previous-count-normalization':
      return buildStaticItem({
        context,
        value: m.assignment_attempt_limit_handoff_previous_count_value({
          count: context.previousAttemptCount,
        }),
      });
    case 'used-attempts':
      return buildStaticItem({
        context,
        value: m.assignment_attempt_limit_handoff_used_count_value({
          count: context.usedAttempts,
        }),
      });
    case 'remaining-attempts':
      return buildStaticItem({
        context,
        value: formatAssignmentAttemptLimitRemainingAttempts(
          context.remainingAttempts
        ),
      });
    case 'unlimited-attempts':
      return buildStaticItem({
        context,
        value: context.unlimitedAttempts
          ? m.assignment_attempt_limit_handoff_unlimited_value()
          : formatAssignmentAttemptLimitMaxAttempts(context.maxAttempts),
      });
    case 'limit-reached':
      return buildStaticItem({
        context,
        value: context.limitReachedCanRetry
          ? m.assignment_attempt_limit_handoff_needs_review_value()
          : m.assignment_attempt_limit_handoff_blocked_value(),
      });
    case 'retry-availability':
      return buildStaticItem({
        context,
        value: context.retryAvailable
          ? m.student_runner_submission_handoff_retry_available_value()
          : m.student_runner_submission_handoff_retry_unavailable_value(),
      });
    case 'result-usage-label':
      return buildStaticItem({
        context,
        value: context.resultUsageLabel,
      });
    case 'student-name-identity':
      return buildBoundaryItem({
        context,
        ok: context.studentNameIdentityUsesNameStrategy,
        value: m.assignment_attempt_limit_handoff_student_name_value(),
      });
    case 'anonymous-token-identity':
      return buildBoundaryItem({
        context,
        ok: context.anonymousIdentityUsesTokenStrategy,
        value: m.assignment_attempt_limit_handoff_anonymous_token_value(),
      });
    case 'identity-mode':
      return buildStaticItem({
        context,
        value: formatAssignmentAttemptLimitIdentityMode(context.identityMode),
      });
    case 'attempt-counter-source':
      return buildBoundaryItem({
        context,
        ok: context.attemptCounterUsesPreviousCount,
        value: m.assignment_attempt_limit_handoff_previous_count_source_value(),
      });
    case 'max-attempt-parser':
      return buildBoundaryItem({
        context,
        ok: context.maxAttemptParserUsesSharedHelper,
      });
    case 'api-previous-count-query':
      return buildBoundaryItem({
        context,
        ok: context.apiPreviousCountUsesIdentityQuery,
      });
    case 'server-enforcement':
      return buildBoundaryItem({
        context,
        ok: context.serverEnforcesLimit,
      });
    case 'scored-attempt-write-gate':
      return buildBoundaryItem({
        context,
        ok: context.scoredAttemptWriteGatedByLimit,
      });
    case 'runner-result-boundary':
      return buildBoundaryItem({
        context,
        ok: context.runnerResultUsesAttemptUsage,
      });
    case 'retry-button-boundary':
      return buildBoundaryItem({
        context,
        ok: context.retryButtonUsesLimitDecision,
        value: context.retryAvailable
          ? m.student_runner_submission_handoff_retry_available_value()
          : m.student_runner_submission_handoff_retry_unavailable_value(),
      });
    case 'submission-gate-boundary':
      return buildBoundaryItem({
        context,
        ok: context.submissionGateUsesLimitHelper,
      });
    case 'delivery-summary-boundary':
      return buildBoundaryItem({
        context,
        ok: context.deliverySummaryUsesAttemptLimit,
      });
    case 'public-rule-boundary':
      return buildBoundaryItem({
        context,
        ok: context.publicRulesUseAttemptLimit,
      });
    case 'result-page-boundary':
      return buildBoundaryItem({
        context,
        ok: context.resultPageUsesAttemptLimit,
      });
    case 'result-export-boundary':
      return buildBoundaryItem({
        context,
        ok: context.resultExportUsesAttemptLimit,
      });
    case 'negative-count-guard':
      return buildStaticItem({
        context,
        value: String(context.negativeCountNormalized),
      });
    case 'fractional-count-guard':
      return buildStaticItem({
        context,
        value: String(context.fractionalCountNormalized),
      });
    case 'nonfinite-max-guard':
      return buildStaticItem({
        context,
        value: context.nonFiniteMaxIsUnlimited
          ? m.assignment_attempt_limit_handoff_unlimited_value()
          : m.assignment_attempt_limit_handoff_needs_review_value(),
      });
    case 'zero-max-guard':
      return buildStaticItem({
        context,
        value: context.zeroMaxIsUnlimited
          ? m.assignment_attempt_limit_handoff_unlimited_value()
          : m.assignment_attempt_limit_handoff_needs_review_value(),
      });
    case 'raw-token-guard':
      return buildBoundaryItem({
        context,
        ok: context.rawTokenHidden,
        value: m.assignment_attempt_limit_handoff_raw_token_hidden_value(),
      });
    case 'privacy-guard':
      return buildBoundaryItem({
        context,
        ok: context.privacyGuardsPrivateData,
        value: m.assignment_attempt_limit_handoff_private_data_hidden_value(),
      });
  }
}

function buildStaticItem({
  context,
  value,
}: {
  context: AssignmentAttemptLimitHandoffItemContext;
  value: string;
}): Omit<AssignmentAttemptLimitHandoffItemView, 'ariaLabel'> {
  return {
    description: getAssignmentAttemptLimitHandoffItemDescription(context.id),
    id: context.id,
    label: getAssignmentAttemptLimitHandoffItemLabel(context.id),
    value,
  };
}

function buildBoundaryItem({
  context,
  ok,
  value,
}: {
  context: AssignmentAttemptLimitHandoffItemContext;
  ok: boolean;
  value?: string;
}): Omit<AssignmentAttemptLimitHandoffItemView, 'ariaLabel'> {
  return buildStaticItem({
    context,
    value:
      ok && value
        ? value
        : ok
          ? m.assignment_attempt_limit_handoff_ready_value()
          : m.assignment_attempt_limit_handoff_needs_review_value(),
  });
}

function buildAssignmentAttemptLimitHandoffPrivacyContract(
  itemViews: AssignmentAttemptLimitHandoffItemView[]
): AssignmentAttemptLimitHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawIdentityKey: false,
    exposesRawSubmissionPayload: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesAttempts: false,
    readsBrowserStorage: false,
    scope: 'assignment-attempt-limit-boundary',
    usesSharedAttemptLimitHelpers: true,
  };
}

function getAssignmentAttemptLimitHandoffItemLabel(
  id: AssignmentAttemptLimitHandoffItemId
) {
  switch (id) {
    case 'attempt-scope':
      return m.assignment_attempt_limit_handoff_attempt_scope_label();
    case 'max-attempt-normalization':
      return m.assignment_attempt_limit_handoff_max_attempt_label();
    case 'previous-count-normalization':
      return m.assignment_attempt_limit_handoff_previous_count_label();
    case 'used-attempts':
      return m.assignment_attempt_limit_handoff_used_attempts_label();
    case 'remaining-attempts':
      return m.assignment_attempt_limit_handoff_remaining_attempts_label();
    case 'unlimited-attempts':
      return m.assignment_attempt_limit_handoff_unlimited_attempts_label();
    case 'limit-reached':
      return m.assignment_attempt_limit_handoff_limit_reached_label();
    case 'retry-availability':
      return m.assignment_attempt_limit_handoff_retry_availability_label();
    case 'result-usage-label':
      return m.assignment_attempt_limit_handoff_result_usage_label();
    case 'student-name-identity':
      return m.assignment_attempt_limit_handoff_student_name_label();
    case 'anonymous-token-identity':
      return m.assignment_attempt_limit_handoff_anonymous_token_label();
    case 'identity-mode':
      return m.assignment_attempt_limit_handoff_identity_mode_label();
    case 'attempt-counter-source':
      return m.assignment_attempt_limit_handoff_counter_source_label();
    case 'max-attempt-parser':
      return m.assignment_attempt_limit_handoff_max_attempt_parser_label();
    case 'api-previous-count-query':
      return m.assignment_attempt_limit_handoff_previous_query_label();
    case 'server-enforcement':
      return m.assignment_attempt_limit_handoff_server_enforcement_label();
    case 'scored-attempt-write-gate':
      return m.assignment_attempt_limit_handoff_write_gate_label();
    case 'runner-result-boundary':
      return m.assignment_attempt_limit_handoff_runner_result_label();
    case 'retry-button-boundary':
      return m.assignment_attempt_limit_handoff_retry_button_label();
    case 'submission-gate-boundary':
      return m.assignment_attempt_limit_handoff_submission_gate_label();
    case 'delivery-summary-boundary':
      return m.assignment_attempt_limit_handoff_delivery_summary_label();
    case 'public-rule-boundary':
      return m.assignment_attempt_limit_handoff_public_rule_label();
    case 'result-page-boundary':
      return m.assignment_attempt_limit_handoff_result_page_label();
    case 'result-export-boundary':
      return m.assignment_attempt_limit_handoff_result_export_label();
    case 'negative-count-guard':
      return m.assignment_attempt_limit_handoff_negative_count_label();
    case 'fractional-count-guard':
      return m.assignment_attempt_limit_handoff_fractional_count_label();
    case 'nonfinite-max-guard':
      return m.assignment_attempt_limit_handoff_nonfinite_max_label();
    case 'zero-max-guard':
      return m.assignment_attempt_limit_handoff_zero_max_label();
    case 'raw-token-guard':
      return m.assignment_attempt_limit_handoff_raw_token_label();
    case 'privacy-guard':
      return m.assignment_attempt_limit_handoff_privacy_guard_label();
  }
}

function getAssignmentAttemptLimitHandoffItemDescription(
  id: AssignmentAttemptLimitHandoffItemId
) {
  switch (id) {
    case 'attempt-scope':
      return m.assignment_attempt_limit_handoff_attempt_scope_description();
    case 'max-attempt-normalization':
      return m.assignment_attempt_limit_handoff_max_attempt_description();
    case 'previous-count-normalization':
      return m.assignment_attempt_limit_handoff_previous_count_description();
    case 'used-attempts':
      return m.assignment_attempt_limit_handoff_used_attempts_description();
    case 'remaining-attempts':
      return m.assignment_attempt_limit_handoff_remaining_attempts_description();
    case 'unlimited-attempts':
      return m.assignment_attempt_limit_handoff_unlimited_attempts_description();
    case 'limit-reached':
      return m.assignment_attempt_limit_handoff_limit_reached_description();
    case 'retry-availability':
      return m.assignment_attempt_limit_handoff_retry_availability_description();
    case 'result-usage-label':
      return m.assignment_attempt_limit_handoff_result_usage_description();
    case 'student-name-identity':
      return m.assignment_attempt_limit_handoff_student_name_description();
    case 'anonymous-token-identity':
      return m.assignment_attempt_limit_handoff_anonymous_token_description();
    case 'identity-mode':
      return m.assignment_attempt_limit_handoff_identity_mode_description();
    case 'attempt-counter-source':
      return m.assignment_attempt_limit_handoff_counter_source_description();
    case 'max-attempt-parser':
      return m.assignment_attempt_limit_handoff_max_attempt_parser_description();
    case 'api-previous-count-query':
      return m.assignment_attempt_limit_handoff_previous_query_description();
    case 'server-enforcement':
      return m.assignment_attempt_limit_handoff_server_enforcement_description();
    case 'scored-attempt-write-gate':
      return m.assignment_attempt_limit_handoff_write_gate_description();
    case 'runner-result-boundary':
      return m.assignment_attempt_limit_handoff_runner_result_description();
    case 'retry-button-boundary':
      return m.assignment_attempt_limit_handoff_retry_button_description();
    case 'submission-gate-boundary':
      return m.assignment_attempt_limit_handoff_submission_gate_description();
    case 'delivery-summary-boundary':
      return m.assignment_attempt_limit_handoff_delivery_summary_description();
    case 'public-rule-boundary':
      return m.assignment_attempt_limit_handoff_public_rule_description();
    case 'result-page-boundary':
      return m.assignment_attempt_limit_handoff_result_page_description();
    case 'result-export-boundary':
      return m.assignment_attempt_limit_handoff_result_export_description();
    case 'negative-count-guard':
      return m.assignment_attempt_limit_handoff_negative_count_description();
    case 'fractional-count-guard':
      return m.assignment_attempt_limit_handoff_fractional_count_description();
    case 'nonfinite-max-guard':
      return m.assignment_attempt_limit_handoff_nonfinite_max_description();
    case 'zero-max-guard':
      return m.assignment_attempt_limit_handoff_zero_max_description();
    case 'raw-token-guard':
      return m.assignment_attempt_limit_handoff_raw_token_description();
    case 'privacy-guard':
      return m.assignment_attempt_limit_handoff_privacy_guard_description();
  }
}

function formatAssignmentAttemptLimitMaxAttempts(maxAttempts?: number) {
  if (maxAttempts === undefined) {
    return m.assignment_delivery_attempts_open();
  }

  return m.assignment_delivery_attempts_max({ count: maxAttempts });
}

function formatAssignmentAttemptLimitRemainingAttempts(
  remainingAttempts: number | undefined
) {
  if (remainingAttempts === undefined) {
    return m.student_runner_attempts_remaining_open();
  }

  const normalizedRemainingAttempts =
    normalizeAssignmentAttemptCount(remainingAttempts);

  if (normalizedRemainingAttempts <= 0) {
    return m.student_runner_attempts_remaining_none();
  }

  if (normalizedRemainingAttempts === 1) {
    return m.student_runner_attempts_remaining_one();
  }

  return m.student_runner_attempts_remaining_many({
    count: normalizedRemainingAttempts,
  });
}

function formatAssignmentAttemptLimitIdentityMode(
  mode: AssignmentAttemptLimitHandoffIdentityMode
) {
  if (mode === 'student-name') {
    return m.assignment_attempt_limit_handoff_identity_mode_student_name_value();
  }

  if (mode === 'anonymous') {
    return m.assignment_attempt_limit_handoff_identity_mode_anonymous_value();
  }

  return m.assignment_attempt_limit_handoff_identity_mode_unknown_value();
}
