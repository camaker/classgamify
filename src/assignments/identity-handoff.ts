import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS = [
  'identity-scope',
  'name-whitespace-normalization',
  'name-unicode-normalization',
  'name-case-grouping',
  'name-priority',
  'anonymous-token-normalization',
  'anonymous-storage-key',
  'anonymous-existing-token',
  'anonymous-sanitized-write',
  'anonymous-created-token',
  'browser-label',
  'grouping-name-key',
  'grouping-anonymous-key',
  'unknown-identity',
  'same-name-comparison',
  'same-token-comparison',
  'distinct-token-comparison',
  'name-attempt-count',
  'token-attempt-count',
  'submission-name-strategy',
  'submission-token-strategy',
  'submission-missing-strategy',
  'previous-name-strategy',
  'previous-token-strategy',
  'resolver-name-label',
  'resolver-anonymous-label',
  'resolver-ordering',
  'result-display-key',
  'raw-token-guard',
  'privacy-guard',
] as const;

export type AssignmentIdentityHandoffItemId =
  (typeof ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS)[number];

export type AssignmentIdentityHandoffEvidence = {
  anonymousAttemptMatchCount: number;
  anonymousBrowserLabelHasSafeCode: boolean;
  anonymousBrowserLabelHidesToken: boolean;
  anonymousGroupingKeyReady: boolean;
  anonymousStorageKeyScoped: boolean;
  anonymousTokenCreatedWhenMissing: boolean;
  anonymousTokenExistingReused: boolean;
  anonymousTokenSanitizedInStorage: boolean;
  anonymousTokenWhitespaceRemoved: boolean;
  distinctAnonymousTokensSeparated: boolean;
  nameAttemptMatchCount: number;
  nameCaseInsensitiveGrouping: boolean;
  nameGroupingKeyReady: boolean;
  nameTakesPriorityOverAnonymousToken: boolean;
  nameUnicodeNormalized: boolean;
  nameWhitespaceCollapsed: boolean;
  previousNameStrategyType: 'normalized-student-name' | string;
  previousTokenStrategyType: 'anonymous-token' | string;
  resolverAnonymousLabelReady: boolean;
  resolverNameLabelReady: boolean;
  resolverOrderingStable: boolean;
  resultDisplayKeyHidesRawToken: boolean;
  sameAnonymousTokenMatched: boolean;
  sameNameMatched: boolean;
  studentNameHiddenFromHandoff: boolean;
  submissionAnonymousStrategyType: 'anonymous-token' | string;
  submissionMissingStrategyType: 'missing' | string;
  submissionNameStrategyType: 'student-name' | string;
  unknownIdentityUsesFallback: boolean;
};

export type AssignmentIdentityHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentIdentityHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentIdentityHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesBrowserStorageKey: false;
  exposesRawGroupingKey: false;
  exposesRawStudentName: false;
  exposesResultStudentKey: false;
  itemIds: AssignmentIdentityHandoffItemId[];
  mutatesAttempts: false;
  readsBrowserStorage: false;
  scope: 'assignment-attempt-identity-boundary';
  usesSharedIdentityHelpers: true;
};

export type AssignmentIdentityHandoffView = {
  description: string;
  itemViews: AssignmentIdentityHandoffItemView[];
  privacy: AssignmentIdentityHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentIdentityHandoffView(
  evidence: AssignmentIdentityHandoffEvidence
): AssignmentIdentityHandoffView {
  const itemViews = ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentIdentityHandoffItemView(
      buildAssignmentIdentityHandoffItem({ evidence, id })
    )
  );

  return {
    description: m.assignment_identity_handoff_description(),
    itemViews,
    privacy: buildAssignmentIdentityHandoffPrivacyContract(itemViews),
    title: m.assignment_identity_handoff_title(),
  };
}

function buildAssignmentIdentityHandoffItem({
  evidence,
  id,
}: {
  evidence: AssignmentIdentityHandoffEvidence;
  id: AssignmentIdentityHandoffItemId;
}): Omit<AssignmentIdentityHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'identity-scope':
      return {
        description: m.assignment_identity_handoff_scope_description(),
        id,
        label: m.assignment_identity_handoff_scope_label(),
        value: m.assignment_identity_handoff_scope_value(),
      };
    case 'name-whitespace-normalization':
      return {
        description:
          m.assignment_identity_handoff_name_whitespace_description(),
        id,
        label: m.assignment_identity_handoff_name_whitespace_label(),
        value: formatReadyValue(
          evidence.nameWhitespaceCollapsed,
          m.assignment_identity_handoff_name_whitespace_value()
        ),
      };
    case 'name-unicode-normalization':
      return {
        description: m.assignment_identity_handoff_name_unicode_description(),
        id,
        label: m.assignment_identity_handoff_name_unicode_label(),
        value: formatReadyValue(
          evidence.nameUnicodeNormalized,
          m.assignment_identity_handoff_name_unicode_value()
        ),
      };
    case 'name-case-grouping':
      return {
        description: m.assignment_identity_handoff_name_case_description(),
        id,
        label: m.assignment_identity_handoff_name_case_label(),
        value: formatReadyValue(
          evidence.nameCaseInsensitiveGrouping,
          m.assignment_identity_handoff_name_case_value()
        ),
      };
    case 'name-priority':
      return {
        description: m.assignment_identity_handoff_name_priority_description(),
        id,
        label: m.assignment_identity_handoff_name_priority_label(),
        value: formatReadyValue(
          evidence.nameTakesPriorityOverAnonymousToken,
          m.assignment_identity_handoff_name_priority_value()
        ),
      };
    case 'anonymous-token-normalization':
      return {
        description:
          m.assignment_identity_handoff_token_normalization_description(),
        id,
        label: m.assignment_identity_handoff_token_normalization_label(),
        value: formatReadyValue(
          evidence.anonymousTokenWhitespaceRemoved,
          m.assignment_identity_handoff_token_normalization_value()
        ),
      };
    case 'anonymous-storage-key':
      return {
        description: m.assignment_identity_handoff_storage_key_description(),
        id,
        label: m.assignment_identity_handoff_storage_key_label(),
        value: formatReadyValue(
          evidence.anonymousStorageKeyScoped,
          m.assignment_identity_handoff_storage_key_value()
        ),
      };
    case 'anonymous-existing-token':
      return {
        description: m.assignment_identity_handoff_existing_token_description(),
        id,
        label: m.assignment_identity_handoff_existing_token_label(),
        value: formatReadyValue(
          evidence.anonymousTokenExistingReused,
          m.assignment_identity_handoff_existing_token_value()
        ),
      };
    case 'anonymous-sanitized-write':
      return {
        description:
          m.assignment_identity_handoff_sanitized_write_description(),
        id,
        label: m.assignment_identity_handoff_sanitized_write_label(),
        value: formatReadyValue(
          evidence.anonymousTokenSanitizedInStorage,
          m.assignment_identity_handoff_sanitized_write_value()
        ),
      };
    case 'anonymous-created-token':
      return {
        description: m.assignment_identity_handoff_created_token_description(),
        id,
        label: m.assignment_identity_handoff_created_token_label(),
        value: formatReadyValue(
          evidence.anonymousTokenCreatedWhenMissing,
          m.assignment_identity_handoff_created_token_value()
        ),
      };
    case 'browser-label':
      return {
        description: m.assignment_identity_handoff_browser_label_description(),
        id,
        label: m.assignment_identity_handoff_browser_label_label(),
        value: formatReadyValue(
          evidence.anonymousBrowserLabelHasSafeCode &&
            evidence.anonymousBrowserLabelHidesToken,
          m.assignment_identity_handoff_browser_label_value()
        ),
      };
    case 'grouping-name-key':
      return {
        description: m.assignment_identity_handoff_name_key_description(),
        id,
        label: m.assignment_identity_handoff_name_key_label(),
        value: formatReadyValue(
          evidence.nameGroupingKeyReady,
          m.assignment_identity_handoff_name_key_value()
        ),
      };
    case 'grouping-anonymous-key':
      return {
        description: m.assignment_identity_handoff_anonymous_key_description(),
        id,
        label: m.assignment_identity_handoff_anonymous_key_label(),
        value: formatReadyValue(
          evidence.anonymousGroupingKeyReady,
          m.assignment_identity_handoff_anonymous_key_value()
        ),
      };
    case 'unknown-identity':
      return {
        description: m.assignment_identity_handoff_unknown_description(),
        id,
        label: m.assignment_identity_handoff_unknown_label(),
        value: formatReadyValue(
          evidence.unknownIdentityUsesFallback,
          m.assignment_identity_handoff_unknown_value()
        ),
      };
    case 'same-name-comparison':
      return {
        description:
          m.assignment_identity_handoff_same_name_comparison_description(),
        id,
        label: m.assignment_identity_handoff_same_name_comparison_label(),
        value: formatReadyValue(
          evidence.sameNameMatched,
          m.assignment_identity_handoff_matched_value()
        ),
      };
    case 'same-token-comparison':
      return {
        description:
          m.assignment_identity_handoff_same_token_comparison_description(),
        id,
        label: m.assignment_identity_handoff_same_token_comparison_label(),
        value: formatReadyValue(
          evidence.sameAnonymousTokenMatched,
          m.assignment_identity_handoff_matched_value()
        ),
      };
    case 'distinct-token-comparison':
      return {
        description:
          m.assignment_identity_handoff_distinct_token_comparison_description(),
        id,
        label: m.assignment_identity_handoff_distinct_token_comparison_label(),
        value: formatReadyValue(
          evidence.distinctAnonymousTokensSeparated,
          m.assignment_identity_handoff_separated_value()
        ),
      };
    case 'name-attempt-count':
      return {
        description: m.assignment_identity_handoff_name_count_description(),
        id,
        label: m.assignment_identity_handoff_name_count_label(),
        value: m.assignment_identity_handoff_attempts_value({
          count: evidence.nameAttemptMatchCount,
        }),
      };
    case 'token-attempt-count':
      return {
        description: m.assignment_identity_handoff_token_count_description(),
        id,
        label: m.assignment_identity_handoff_token_count_label(),
        value: m.assignment_identity_handoff_attempts_value({
          count: evidence.anonymousAttemptMatchCount,
        }),
      };
    case 'submission-name-strategy':
      return {
        description:
          m.assignment_identity_handoff_submission_name_description(),
        id,
        label: m.assignment_identity_handoff_submission_name_label(),
        value: formatReadyValue(
          evidence.submissionNameStrategyType === 'student-name',
          m.assignment_identity_handoff_submission_name_value()
        ),
      };
    case 'submission-token-strategy':
      return {
        description:
          m.assignment_identity_handoff_submission_token_description(),
        id,
        label: m.assignment_identity_handoff_submission_token_label(),
        value: formatReadyValue(
          evidence.submissionAnonymousStrategyType === 'anonymous-token',
          m.assignment_identity_handoff_submission_token_value()
        ),
      };
    case 'submission-missing-strategy':
      return {
        description:
          m.assignment_identity_handoff_submission_missing_description(),
        id,
        label: m.assignment_identity_handoff_submission_missing_label(),
        value: formatReadyValue(
          evidence.submissionMissingStrategyType === 'missing',
          m.assignment_identity_handoff_submission_missing_value()
        ),
      };
    case 'previous-name-strategy':
      return {
        description: m.assignment_identity_handoff_previous_name_description(),
        id,
        label: m.assignment_identity_handoff_previous_name_label(),
        value: formatReadyValue(
          evidence.previousNameStrategyType === 'normalized-student-name',
          m.assignment_identity_handoff_previous_name_value()
        ),
      };
    case 'previous-token-strategy':
      return {
        description: m.assignment_identity_handoff_previous_token_description(),
        id,
        label: m.assignment_identity_handoff_previous_token_label(),
        value: formatReadyValue(
          evidence.previousTokenStrategyType === 'anonymous-token',
          m.assignment_identity_handoff_previous_token_value()
        ),
      };
    case 'resolver-name-label':
      return {
        description: m.assignment_identity_handoff_resolver_name_description(),
        id,
        label: m.assignment_identity_handoff_resolver_name_label(),
        value: formatReadyValue(
          evidence.resolverNameLabelReady,
          m.assignment_identity_handoff_resolver_name_value()
        ),
      };
    case 'resolver-anonymous-label':
      return {
        description:
          m.assignment_identity_handoff_resolver_anonymous_description(),
        id,
        label: m.assignment_identity_handoff_resolver_anonymous_label(),
        value: formatReadyValue(
          evidence.resolverAnonymousLabelReady,
          m.assignment_identity_handoff_resolver_anonymous_value()
        ),
      };
    case 'resolver-ordering':
      return {
        description:
          m.assignment_identity_handoff_resolver_ordering_description(),
        id,
        label: m.assignment_identity_handoff_resolver_ordering_label(),
        value: formatReadyValue(
          evidence.resolverOrderingStable,
          m.assignment_identity_handoff_resolver_ordering_value()
        ),
      };
    case 'result-display-key':
      return {
        description:
          m.assignment_identity_handoff_result_display_key_description(),
        id,
        label: m.assignment_identity_handoff_result_display_key_label(),
        value: formatReadyValue(
          evidence.resultDisplayKeyHidesRawToken,
          m.assignment_identity_handoff_result_display_key_value()
        ),
      };
    case 'raw-token-guard':
      return {
        description:
          m.assignment_identity_handoff_raw_token_guard_description(),
        id,
        label: m.assignment_identity_handoff_raw_token_guard_label(),
        value: m.assignment_identity_handoff_raw_token_guard_value(),
      };
    case 'privacy-guard':
      return {
        description: m.assignment_identity_handoff_privacy_guard_description(),
        id,
        label: m.assignment_identity_handoff_privacy_guard_label(),
        value: formatReadyValue(
          evidence.studentNameHiddenFromHandoff,
          m.assignment_identity_handoff_private_data_hidden_value()
        ),
      };
  }
}

function buildAssignmentIdentityHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  AssignmentIdentityHandoffItemView,
  'ariaLabel'
>): AssignmentIdentityHandoffItemView {
  return {
    ariaLabel: m.assignment_identity_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildAssignmentIdentityHandoffPrivacyContract(
  itemViews: AssignmentIdentityHandoffItemView[]
): AssignmentIdentityHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesBrowserStorageKey: false,
    exposesRawGroupingKey: false,
    exposesRawStudentName: false,
    exposesResultStudentKey: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesAttempts: false,
    readsBrowserStorage: false,
    scope: 'assignment-attempt-identity-boundary',
    usesSharedIdentityHelpers: true,
  };
}

function formatReadyValue(isReady: boolean, value: string) {
  return isReady ? value : m.assignment_identity_handoff_needs_review_value();
}
