export const STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS = [
  'public-payload-gate',
  'public-rules-summary',
  'unavailable-link-policy',
  'lifecycle-access-check',
  'runtime-item-order',
  'runner-loading-state',
  'runner-start-readiness',
  'runner-identity-policy',
  'anonymous-token-guard',
  'attempt-limit-enforcement',
  'timer-start-boundary',
  'duration-normalization',
  'runtime-interaction-routing',
  'choice-assignment-contract',
  'runtime-identity-contract',
  'semantic-bundle-guard',
  'fill-blank-renderer',
  'line-match-renderer',
  'group-sort-renderer',
  'matching-pairs-renderer',
  'listening-renderer',
  'open-box-renderer',
  'progress-counts',
  'partial-submit-confirmation',
  'submit-controls-readiness',
  'submission-validation',
  'attempt-persistence',
  'answer-feedback-policy',
  'post-submit-next-steps',
  'submit-controls-handoff-boundary',
] as const;

export const STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/routes/play/$shareId.tsx',
  'src/api/assignments.ts',
  'src/assignments/public.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/unavailable-access.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/item-order.ts',
  'src/assignments/identity.ts',
  'src/assignments/attempt-limits.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-answers.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-view.ts',
  'src/assignments/student-runner-loading-handoff.ts',
  'src/assignments/student-runner-identity-handoff.ts',
  'src/assignments/student-runner-submit-controls-handoff.ts',
  'src/assignments/student-runtime-item-list.ts',
  'src/assignments/runtime-choice-assignment-handoff.ts',
  'src/assignments/runtime-identity-handoff.ts',
  'src/assignments/fill-blank-worksheet-handoff.ts',
  'src/assignments/line-match-board-handoff.ts',
  'src/assignments/group-sort-board-handoff.ts',
  'src/assignments/matching-pairs-board-handoff.ts',
  'src/assignments/listening-speech-handoff.ts',
  'src/assignments/open-box-reveal-handoff.ts',
  'src/assignments/answer-feedback-handoff.ts',
] as const;

export type StudentRunnerPlayChainHandoffItemId =
  (typeof STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerPlayChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerPlayChainHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerPlayChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerKeysBeforeReview: false;
  exposesAnswerTextInSubmitControls: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayloadInSubmitControls: false;
  exposesRuntimeItemIdsInHandoffs: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentAnswersBeforeSubmit: false;
  exposesStudentNameInHandoffs: false;
  exposesTeacherOnlyAnswersInSubmitControls: false;
  exposesTeacherSourceMaterialsInSubmitControls: false;
  itemIds: StudentRunnerPlayChainHandoffItemId[];
  preservesTeacherReviewBoundary: true;
  publicPayloadUsesSanitizedRuntimeItems: true;
  rejectsClosedOrExpiredSubmissions: true;
  rejectsInvalidSubmittedAnswers: true;
  sourceFiles: string[];
  submissionPayloadUsesRuntimeItemIds: true;
  usesSubmitControlsHandoff: true;
};

export type StudentRunnerPlayChainHandoffView = {
  description: string;
  itemViews: StudentRunnerPlayChainHandoffItemView[];
  privacy: StudentRunnerPlayChainPrivacyContract;
  title: string;
};

export function buildStudentRunnerPlayChainHandoffView(): StudentRunnerPlayChainHandoffView {
  const itemViews = STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRunnerPlayChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice public student runner play chain from sanitized assignment payloads and rule summaries through identity, timers, template renderers, partial-submit controls, validated submissions, persisted attempts, and answer-feedback policy.',
    itemViews,
    privacy: {
      chainSourceFileCount: STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES.length,
      exposesAnswerKeysBeforeReview: false,
      exposesAnswerTextInSubmitControls: false,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayloadInSubmitControls: false,
      exposesRuntimeItemIdsInHandoffs: false,
      exposesSourceMaterialMetadata: false,
      exposesStudentAnswersBeforeSubmit: false,
      exposesStudentNameInHandoffs: false,
      exposesTeacherOnlyAnswersInSubmitControls: false,
      exposesTeacherSourceMaterialsInSubmitControls: false,
      itemIds: [...STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS],
      preservesTeacherReviewBoundary: true,
      publicPayloadUsesSanitizedRuntimeItems: true,
      rejectsClosedOrExpiredSubmissions: true,
      rejectsInvalidSubmittedAnswers: true,
      sourceFiles: [...STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES],
      submissionPayloadUsesRuntimeItemIds: true,
      usesSubmitControlsHandoff: true,
    },
    title: 'Student runner play chain',
  };
}

function buildStudentRunnerPlayChainHandoffItemView(
  id: StudentRunnerPlayChainHandoffItemId
): StudentRunnerPlayChainHandoffItemView {
  const item = getStudentRunnerPlayChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getStudentRunnerPlayChainHandoffItem(
  id: StudentRunnerPlayChainHandoffItemId
): Omit<StudentRunnerPlayChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'public-payload-gate':
      return item(
        id,
        'Public payload gate',
        'Open links only',
        'Public runner payloads are prepared only after assignment lifecycle and sanitized runtime-content checks pass.'
      );
    case 'public-rules-summary':
      return item(
        id,
        'Public rules summary',
        'Student-visible policy',
        'Student runners show item count, attempts, timer, close time, identity mode, item order, and review behavior.'
      );
    case 'unavailable-link-policy':
      return item(
        id,
        'Unavailable link policy',
        'Runtime hidden',
        'Draft, closed, expired, or missing links expose unavailable policy instead of runtime prompts, answers, or teacher material.'
      );
    case 'lifecycle-access-check':
      return item(
        id,
        'Lifecycle access check',
        'Published and open',
        'Student access and submit APIs share lifecycle helpers for published, closed, and expired states.'
      );
    case 'runtime-item-order':
      return item(
        id,
        'Runtime item order',
        'Stable order',
        'Runtime item ordering uses the shared assignment-domain order helper keyed by the share link.'
      );
    case 'runner-loading-state':
      return item(
        id,
        'Runner loading state',
        'Payload pending',
        'Student runner loading surfaces keep assignment, runtime, identity, and privacy boundaries explicit while data loads.'
      );
    case 'runner-start-readiness':
      return item(
        id,
        'Runner start readiness',
        'Rules before play',
        'Start readiness waits for sanitized payload, rule summary, identity, runtime items, and timer preparation.'
      );
    case 'runner-identity-policy':
      return item(
        id,
        'Runner identity policy',
        'Name or browser',
        'Named and anonymous runner identities normalize before attempt limits and teacher result grouping.'
      );
    case 'anonymous-token-guard':
      return item(
        id,
        'Anonymous token guard',
        'Raw token hidden',
        'Anonymous browser tokens can enforce attempt limits without being exposed in runner handoffs or teacher summaries.'
      );
    case 'attempt-limit-enforcement':
      return item(
        id,
        'Attempt-limit enforcement',
        'Per identity',
        'Attempt counts and remaining attempts are shared across public rules, runner controls, server enforcement, and results.'
      );
    case 'timer-start-boundary':
      return item(
        id,
        'Timer start boundary',
        'After readiness',
        'Timed assignments start the attempt clock only after payload and playable runtime items are available.'
      );
    case 'duration-normalization':
      return item(
        id,
        'Duration normalization',
        'Whole seconds',
        'Submitted durations are normalized into non-negative whole seconds and capped by the assignment timer.'
      );
    case 'runtime-interaction-routing':
      return item(
        id,
        'Runtime interaction routing',
        'Template renderer',
        'The runner routes runtime items by template and runtime kind while keeping the same answer contract.'
      );
    case 'choice-assignment-contract':
      return item(
        id,
        'Choice assignment contract',
        '{ itemId, answer }',
        'Choice-style renderers write answers through the shared template-neutral submission shape.'
      );
    case 'runtime-identity-contract':
      return item(
        id,
        'Runtime identity contract',
        'Identity hidden',
        'Runtime semantic outputs describe identity scope without exposing student names or raw anonymous tokens.'
      );
    case 'semantic-bundle-guard':
      return item(
        id,
        'Semantic bundle guard',
        'Safe handoff bundle',
        'Runtime semantic bundles connect renderer, choice-assignment, and identity contracts without leaking prompts or answers.'
      );
    case 'fill-blank-renderer':
      return item(
        id,
        'Fill-blank renderer',
        'Worksheet blanks',
        'Fill-blank interactions keep inline blanks, fallback answer rows, word banks, and review visibility on the shared contract.'
      );
    case 'line-match-renderer':
      return item(
        id,
        'Line-match renderer',
        'Connection flow',
        'Line-match uses pair content in a two-column connection flow without exposing answer maps.'
      );
    case 'group-sort-renderer':
      return item(
        id,
        'Group-sort renderer',
        'Category board',
        'Group-sort interactions use a category board with selected item and placement state.'
      );
    case 'matching-pairs-renderer':
      return item(
        id,
        'Matching-pairs renderer',
        'Left/right cards',
        'Matching-pairs interactions select prompt and choice cards without exposing answer keys.'
      );
    case 'listening-renderer':
      return item(
        id,
        'Listening renderer',
        'Speech track',
        'Listening uses browser speech language from activity content and hides transcript details until review.'
      );
    case 'open-box-renderer':
      return item(
        id,
        'Open-box renderer',
        'Reveal flow',
        'Open-box interactions reveal prompts through boxes while submitting the same runtime answer shape.'
      );
    case 'progress-counts':
      return item(
        id,
        'Progress counts',
        'Answered items',
        'Student progress counts answered and unanswered items through assignment-domain helpers.'
      );
    case 'partial-submit-confirmation':
      return item(
        id,
        'Partial-submit confirmation',
        'Explicit second action',
        'Students must explicitly confirm incomplete attempts before partial submissions are sent.'
      );
    case 'submit-controls-readiness':
      return item(
        id,
        'Submit controls readiness',
        'Prepared controls',
        'Submit controls combine runtime readiness, identity, completion, confirmation, payload, and disabled-policy state.'
      );
    case 'submission-validation':
      return item(
        id,
        'Submission validation',
        'Shared answer guard',
        'Server validation rejects unknown runtime ids, duplicate ids, and answer lists longer than the frozen runtime.'
      );
    case 'attempt-persistence':
      return item(
        id,
        'Attempt persistence',
        'Scored attempt',
        'Validated submissions persist through the shared scored-attempt insert shape.'
      );
    case 'answer-feedback-policy':
      return item(
        id,
        'Answer feedback policy',
        'Reveal if allowed',
        'Correct answers, accepted alternatives, and explanations appear only after scoring when assignment policy allows review.'
      );
    case 'post-submit-next-steps':
      return item(
        id,
        'Post-submit next steps',
        'Review or retry',
        'Post-submit runner state prepares score review, feedback visibility, retry availability, and done-state guidance.'
      );
    case 'submit-controls-handoff-boundary':
      return item(
        id,
        'Submit controls handoff boundary',
        '30 submit control slices',
        'Readiness and payload summaries, completion counts, button and disabled policy, incomplete confirmation, ordered hints, submit action scope, identity privacy, and payload guards stay aligned.'
      );
  }
}

function item(
  id: StudentRunnerPlayChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<StudentRunnerPlayChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
