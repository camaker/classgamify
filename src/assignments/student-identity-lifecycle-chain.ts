export const STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-identity-policy',
  'student-name-normalization',
  'anonymous-token-normalization',
  'anonymous-browser-label',
  'anonymous-token-storage-key',
  'anonymous-token-create-reuse',
  'student-name-identity-key',
  'anonymous-identity-key',
  'identity-grouping-priority',
  'identity-resolver-display',
  'submission-name-mode',
  'submission-anonymous-mode',
  'attempt-count-strategy',
  'attempt-limit-count-query',
  'runner-identity-view',
  'runner-anonymous-guidance',
  'runner-identity-handoff',
  'runner-start-privacy',
  'runner-submission-privacy',
  'submission-input-builder',
  'submission-plan-token-resolution',
  'api-submission-identity',
  'attempt-persistence-identity-fields',
  'scored-attempt-query-identity',
  'result-analysis-identity',
  'result-search-anonymous-label',
  'student-summary-sort-identity',
  'attempt-review-identity',
  'result-export-token-guard',
  'runtime-identity-handoff-boundary',
] as const;

export const STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/identity.ts',
  'src/assignments/attempt-identity-query.ts',
  'src/assignments/attempt-limits.ts',
  'src/assignments/attempt-limit-handoff.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/assignments/attempt-query.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-identity-handoff.ts',
  'src/assignments/student-runner-submit-controls-handoff.ts',
  'src/assignments/student-runner-view.ts',
  'src/assignments/runtime-identity-handoff.ts',
  'src/assignments/public.ts',
  'src/assignments/results.ts',
  'src/assignments/result-display.ts',
  'src/assignments/result-student-search-handoff.ts',
  'src/assignments/student-summary-sort-handoff.ts',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/student-follow-up-priority.ts',
  'src/assignments/results-export.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/api/assignments.ts',
  'src/db/app.schema.ts',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/components/assignments/assignment-results-student-search.tsx',
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type StudentIdentityLifecycleChainHandoffItemId =
  (typeof STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type StudentIdentityLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentIdentityLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type StudentIdentityLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnonymousBrowserLabel: true;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayloads: false;
  exposesRuntimeItemIdsInIdentityHandoff: false;
  exposesSourceMaterialMetadataInIdentityHandoff: false;
  exposesStudentAnswerTextInIdentityHandoff: false;
  exposesStudentNameInputValues: false;
  exposesStudentNamesInHandoff: false;
  exposesTeacherAnswerKeysInIdentityHandoff: false;
  itemIds: StudentIdentityLifecycleChainHandoffItemId[];
  keepsNameAndTokenModesExclusive: true;
  requiresNormalizedAnonymousTokens: true;
  requiresNormalizedStudentNames: true;
  resultConsumersUseNormalizedIdentity: true;
  sourceFiles: string[];
  usesBrowserTokenForAnonymousAttempts: true;
  usesDisplayLabelsForAnonymousResults: true;
  usesScoredAttemptsForAttemptLimits: true;
  usesStudentRuntimeIdentityHandoff: true;
};

export type StudentIdentityLifecycleChainHandoffView = {
  description: string;
  itemViews: StudentIdentityLifecycleChainHandoffItemView[];
  privacy: StudentIdentityLifecycleChainPrivacyContract;
  title: string;
};

export function buildStudentIdentityLifecycleChainHandoffView(): StudentIdentityLifecycleChainHandoffView {
  const itemViews = STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildStudentIdentityLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice student identity lifecycle chain from product identity policy through normalized names, anonymous browser tokens, runner identity views, submission identity, attempt-limit counting, persisted attempts, teacher result labels, search, sort, review, export, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      exposesAnonymousBrowserLabel: true,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayloads: false,
      exposesRuntimeItemIdsInIdentityHandoff: false,
      exposesSourceMaterialMetadataInIdentityHandoff: false,
      exposesStudentAnswerTextInIdentityHandoff: false,
      exposesStudentNameInputValues: false,
      exposesStudentNamesInHandoff: false,
      exposesTeacherAnswerKeysInIdentityHandoff: false,
      itemIds: [...STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      keepsNameAndTokenModesExclusive: true,
      requiresNormalizedAnonymousTokens: true,
      requiresNormalizedStudentNames: true,
      resultConsumersUseNormalizedIdentity: true,
      sourceFiles: [...STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES],
      usesBrowserTokenForAnonymousAttempts: true,
      usesDisplayLabelsForAnonymousResults: true,
      usesScoredAttemptsForAttemptLimits: true,
      usesStudentRuntimeIdentityHandoff: true,
    },
    title: 'Student identity lifecycle chain',
  };
}

function buildStudentIdentityLifecycleChainHandoffItemView(
  id: StudentIdentityLifecycleChainHandoffItemId
): StudentIdentityLifecycleChainHandoffItemView {
  const item = getStudentIdentityLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getStudentIdentityLifecycleChainHandoffItem(
  id: StudentIdentityLifecycleChainHandoffItemId
): Omit<StudentIdentityLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-identity-policy':
      return item(
        id,
        'Product identity policy',
        'Name or browser token',
        'The product uses collected names or anonymous browser tokens for attempts, limits, and result grouping.'
      );
    case 'student-name-normalization':
      return item(
        id,
        'Student name normalization',
        'NFKC + collapsed spaces',
        'Typed student names normalize with NFKC, collapsed whitespace, and trimming before identity checks.'
      );
    case 'anonymous-token-normalization':
      return item(
        id,
        'Anonymous token normalization',
        'NFKC + no whitespace',
        'Anonymous browser tokens normalize with NFKC and whitespace removal before storage, submit, and counting.'
      );
    case 'anonymous-browser-label':
      return item(
        id,
        'Anonymous browser label',
        '6-char browser code',
        'Students see a short browser label derived from the token instead of the raw token value.'
      );
    case 'anonymous-token-storage-key':
      return item(
        id,
        'Anonymous token storage key',
        'classgamify:attempt-token',
        'Anonymous browser tokens are scoped to normalized share links through the ClassGamify storage-key prefix.'
      );
    case 'anonymous-token-create-reuse':
      return item(
        id,
        'Anonymous token create/reuse',
        'Reuse or create',
        'The runner reuses an existing normalized token or creates and stores a normalized replacement.'
      );
    case 'student-name-identity-key':
      return item(
        id,
        'Student name identity key',
        'name:*',
        'Named identities use a lowercased normalized name key for matching attempts across whitespace and case.'
      );
    case 'anonymous-identity-key':
      return item(
        id,
        'Anonymous identity key',
        'anonymous:*',
        'Anonymous identities group by normalized token internally while display surfaces avoid raw token keys.'
      );
    case 'identity-grouping-priority':
      return item(
        id,
        'Identity grouping priority',
        'Name before token',
        'Identity grouping prefers normalized student names and falls back to anonymous tokens or unknown identity.'
      );
    case 'identity-resolver-display':
      return item(
        id,
        'Identity resolver display',
        'Safe labels',
        'Teacher result identity resolution turns raw attempts into normalized names or indexed anonymous labels.'
      );
    case 'submission-name-mode':
      return item(
        id,
        'Submission name mode',
        'Name only',
        'When an assignment collects names, submission identity keeps the normalized name and drops anonymous token.'
      );
    case 'submission-anonymous-mode':
      return item(
        id,
        'Submission anonymous mode',
        'Token only',
        'When names are not collected, submission identity keeps the normalized anonymous token and drops names.'
      );
    case 'attempt-count-strategy':
      return item(
        id,
        'Attempt count strategy',
        'Normalized strategy',
        'Attempt-limit counting chooses normalized student-name, anonymous-token, or unknown strategy.'
      );
    case 'attempt-limit-count-query':
      return item(
        id,
        'Attempt limit count query',
        'Scored attempts',
        'Previous-attempt limits count only scored attempts for the same normalized identity.'
      );
    case 'runner-identity-view':
      return item(
        id,
        'Runner identity view',
        'Prepared identity view',
        'The student runner builds a prepared identity view before start and submission handoff summaries.'
      );
    case 'runner-anonymous-guidance':
      return item(
        id,
        'Runner anonymous guidance',
        'Browser guidance',
        'Anonymous runner copy explains browser-bound identity and retry behavior with a safe browser label.'
      );
    case 'runner-identity-handoff':
      return item(
        id,
        'Runner identity handoff',
        '30 identity slices',
        'The dedicated runner identity handoff covers named, anonymous, browser, retry, and privacy boundaries.'
      );
    case 'runner-start-privacy':
      return item(
        id,
        'Runner start privacy',
        'Start handoff hidden',
        'Start readiness handoffs hide anonymous tokens, names, runtime ids, prompts, answers, and teacher data.'
      );
    case 'runner-submission-privacy':
      return item(
        id,
        'Runner submission privacy',
        'Submission handoff hidden',
        'Submission handoffs hide raw payloads, anonymous tokens, student names, runtime ids, and answers.'
      );
    case 'submission-input-builder':
      return item(
        id,
        'Submission input builder',
        'Sanitized input',
        'Browser submission input normalizes share slug, answers, duration, and identity before API submission.'
      );
    case 'submission-plan-token-resolution':
      return item(
        id,
        'Submission plan token resolution',
        'Anonymous only',
        'Submission planning resolves anonymous tokens only for assignments that do not collect student names.'
      );
    case 'api-submission-identity':
      return item(
        id,
        'API submission identity',
        'Resolved identity',
        'The submit-attempt API resolves identity, rejects missing identity, and enforces attempt limits.'
      );
    case 'attempt-persistence-identity-fields':
      return item(
        id,
        'Attempt persistence identity fields',
        'Name or token',
        'Scored attempt persistence stores the resolved student name or anonymous token alongside answers/results.'
      );
    case 'scored-attempt-query-identity':
      return item(
        id,
        'Scored attempt query identity',
        'Identity selects',
        'Result-facing scored-attempt queries select identity fields while filtering to rows with result JSON.'
      );
    case 'result-analysis-identity':
      return item(
        id,
        'Result analysis identity',
        'Identity resolver',
        'Result analysis uses the shared student identity resolver for student summaries and attempt rows.'
      );
    case 'result-search-anonymous-label':
      return item(
        id,
        'Result search anonymous label',
        'Normalized labels',
        'Teacher search uses normalized display labels, including anonymous labels, without exposing raw tokens.'
      );
    case 'student-summary-sort-identity':
      return item(
        id,
        'Student summary sort identity',
        'Student label sort',
        'Student summary sorting consumes the same normalized labels and guards raw identity values.'
      );
    case 'attempt-review-identity':
      return item(
        id,
        'Attempt review identity',
        'Review label only',
        'Attempt review cards use display labels while hiding raw anonymous tokens and student answer text.'
      );
    case 'result-export-token-guard':
      return item(
        id,
        'Result export token guard',
        'Raw token hidden',
        'Result export preparation covers identity policy while keeping raw anonymous tokens out of handoff summaries.'
      );
    case 'runtime-identity-handoff-boundary':
      return item(
        id,
        'Runtime identity handoff boundary',
        '30 runtime identity slices',
        'Runtime kind counts, normalized and unique ids, collision and blank-id guards, submission validation, browser answers, scoring lookups, teacher results, public payload, assignment snapshot, and privacy stay aligned.'
      );
  }
}

function item(
  id: StudentIdentityLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<StudentIdentityLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
