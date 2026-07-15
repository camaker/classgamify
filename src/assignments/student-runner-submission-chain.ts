export const STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS = [
  'share-link',
  'runtime-items',
  'answered-items',
  'unanswered-items',
  'progress',
  'payload-summary',
  'submit-readiness',
  'partial-confirmation',
  'submission-state',
  'identity-mode',
  'identity-privacy',
  'timer-status',
  'timer-limit',
  'attempt-duration',
  'attempt-clock',
  'result-status',
  'score-summary',
  'result-accuracy',
  'attempt-usage',
  'retry-availability',
  'review-summary',
  'review-submitted',
  'review-needs-review',
  'review-unanswered',
  'feedback-scope',
  'feedback-visibility',
  'feedback-items',
  'feedback-detail-evidence',
  'next-steps',
  'privacy-guard',
] as const;

export const STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-runner-view.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/student-runner-submit-controls-handoff.ts',
  'src/components/assignments/student-runner-submit-controls.tsx',
  'src/components/assignments/student-runner-submission-handoff.tsx',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/routes/play/$shareId.tsx',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/submission-limits.ts',
  'src/assignments/submission-lifecycle-write.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-duration-handoff.ts',
  'src/assignments/attempt-limits.ts',
  'src/assignments/attempt-limit-handoff.ts',
  'src/assignments/identity.ts',
  'src/assignments/student-runner-identity-handoff.ts',
  'src/assignments/public.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/answer-feedback-lifecycle-chain.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'scripts/student-runner-submission-handoff-semantic-views.test.ts',
  'scripts/student-runner-submit-controls-handoff-semantic-views.test.ts',
  'scripts/assignment-submission-validation-handoff-semantic-views.test.ts',
  'scripts/scored-attempt-result-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type StudentRunnerSubmissionChainHandoffItemId =
  (typeof STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerSubmissionChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerSubmissionChainHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerSubmissionChainPrivacyContract = {
  chainSourceFileCount: number;
  connectsAnswerFeedbackLifecycleChain: true;
  connectsAttemptDurationHandoff: true;
  connectsAttemptLimitHandoff: true;
  connectsAttemptPersistenceHandoff: true;
  connectsScoredAttemptResultChain: true;
  connectsStudentRunnerPlayChain: true;
  connectsSubmitControlsHandoff: true;
  connectsSubmissionValidationHandoff: true;
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIds: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherSourceMaterials: false;
  itemIds: StudentRunnerSubmissionChainHandoffItemId[];
  sourceFiles: string[];
  usesAttemptTimerView: true;
  usesFeedbackScopeView: true;
  usesIdentityView: true;
  usesNextStepsView: true;
  usesPayloadSummaryView: true;
  usesPreparedPageViewModel: true;
  usesResultPanelView: true;
  usesReviewSummaryView: true;
  usesStudentRunnerSubmissionHandoff: true;
  usesSubmitReadinessView: true;
  validatesSubmissionBeforePersistence: true;
};

export type StudentRunnerSubmissionChainHandoffView = {
  description: string;
  itemViews: StudentRunnerSubmissionChainHandoffItemView[];
  privacy: StudentRunnerSubmissionChainPrivacyContract;
  title: string;
};

export function buildStudentRunnerSubmissionChainHandoffView(): StudentRunnerSubmissionChainHandoffView {
  const itemViews = STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRunnerSubmissionChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice student runner submission chain from public share-link payloads and runtime progress through prepared submit readiness, identity, timer, attempt duration, scored result, review summary, feedback scope, next steps, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount: STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES.length,
      connectsAnswerFeedbackLifecycleChain: true,
      connectsAttemptDurationHandoff: true,
      connectsAttemptLimitHandoff: true,
      connectsAttemptPersistenceHandoff: true,
      connectsScoredAttemptResultChain: true,
      connectsStudentRunnerPlayChain: true,
      connectsSubmitControlsHandoff: true,
      connectsSubmissionValidationHandoff: true,
      exposesAnonymousToken: false,
      exposesAnswerText: false,
      exposesRawSubmissionPayload: false,
      exposesRuntimeItemIds: false,
      exposesStudentName: false,
      exposesTeacherOnlyAnswers: false,
      exposesTeacherSourceMaterials: false,
      itemIds: [...STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS],
      sourceFiles: [...STUDENT_RUNNER_SUBMISSION_CHAIN_SOURCE_FILES],
      usesAttemptTimerView: true,
      usesFeedbackScopeView: true,
      usesIdentityView: true,
      usesNextStepsView: true,
      usesPayloadSummaryView: true,
      usesPreparedPageViewModel: true,
      usesResultPanelView: true,
      usesReviewSummaryView: true,
      usesStudentRunnerSubmissionHandoff: true,
      usesSubmitReadinessView: true,
      validatesSubmissionBeforePersistence: true,
    },
    title: 'Student runner submission chain',
  };
}

function buildStudentRunnerSubmissionChainHandoffItemView(
  id: StudentRunnerSubmissionChainHandoffItemId
): StudentRunnerSubmissionChainHandoffItemView {
  const item = getStudentRunnerSubmissionChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getStudentRunnerSubmissionChainHandoffItem(
  id: StudentRunnerSubmissionChainHandoffItemId
): Omit<StudentRunnerSubmissionChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'share-link':
      return item(
        id,
        'Share link',
        'Normalized public share link',
        'Submission state is scoped to the normalized public assignment share link without exposing private route internals.'
      );
    case 'runtime-items':
      return item(
        id,
        'Runtime items',
        'Frozen runtime count',
        'Submission summaries count frozen runtime items without exposing raw runtime item ids.'
      );
    case 'answered-items':
      return item(
        id,
        'Answered items',
        'Answered count',
        'Answered item counts come from prepared assignment-domain progress state.'
      );
    case 'unanswered-items':
      return item(
        id,
        'Unanswered items',
        'Unanswered count',
        'Unanswered item counts stay explicit so partial submission confirmation can be trusted.'
      );
    case 'progress':
      return item(
        id,
        'Progress',
        'Progress label',
        'Student progress labels are prepared from answered and total item counts.'
      );
    case 'payload-summary':
      return item(
        id,
        'Payload summary',
        'Prepared payload metrics',
        'Browser payload summaries expose share, item, answer, and unanswered counts without raw submission rows.'
      );
    case 'submit-readiness':
      return item(
        id,
        'Submit readiness',
        'Prepared readiness state',
        'Submit readiness combines share-link, runtime, completion, confirmation, and submission-state checks.'
      );
    case 'partial-confirmation':
      return item(
        id,
        'Partial confirmation',
        'Explicit incomplete confirmation',
        'Incomplete attempts require an explicit confirmation state before the browser sends a partial submission.'
      );
    case 'submission-state':
      return item(
        id,
        'Submission state',
        'Ready, submitting, or blocked',
        'Submission-state checks keep pending, disabled, and read-only conditions visible to the runner.'
      );
    case 'identity-mode':
      return item(
        id,
        'Identity mode',
        'Name or anonymous mode',
        'Runner identity mode is prepared before submission and result display.'
      );
    case 'identity-privacy':
      return item(
        id,
        'Identity privacy',
        'Name/token hidden',
        'Submission handoffs keep student names and raw anonymous browser tokens outside safe summaries.'
      );
    case 'timer-status':
      return item(
        id,
        'Timer status',
        'Prepared timer badge',
        'Timer badges describe whether a timed assignment is active for the current attempt.'
      );
    case 'timer-limit':
      return item(
        id,
        'Timer limit',
        'Assignment time limit',
        'Timer limits are formatted through assignment-domain helpers before the runner displays them.'
      );
    case 'attempt-duration':
      return item(
        id,
        'Attempt duration',
        'Normalized duration display',
        'Submitted and current attempt durations stay connected to server-side normalization.'
      );
    case 'attempt-clock':
      return item(
        id,
        'Attempt clock',
        'Clock starts after readiness',
        'Attempt-clock state starts only after payload and playable runtime items are ready.'
      );
    case 'result-status':
      return item(
        id,
        'Result status',
        'Pending or submitted',
        'Result status switches from submit-readiness state to scored result state after persistence.'
      );
    case 'score-summary':
      return item(
        id,
        'Score summary',
        'Earned/total points',
        'Score summaries come from scored attempt results after successful submission.'
      );
    case 'result-accuracy':
      return item(
        id,
        'Result accuracy',
        'Accuracy label',
        'Accuracy labels stay downstream of scored attempts and result display helpers.'
      );
    case 'attempt-usage':
      return item(
        id,
        'Attempt usage',
        'Remaining attempts',
        'Attempt usage aligns public result state with server-enforced attempt limits.'
      );
    case 'retry-availability':
      return item(
        id,
        'Retry availability',
        'Retry if allowed',
        'Start-another-attempt state is prepared from result usage and assignment attempt policy.'
      );
    case 'review-summary':
      return item(
        id,
        'Review summary',
        'Submitted, correct, review, unanswered',
        'Post-submit review summaries expose aggregate counts without answer text.'
      );
    case 'review-submitted':
      return item(
        id,
        'Review submitted',
        'Submitted review count',
        'Submitted review counts come from public review-summary metrics.'
      );
    case 'review-needs-review':
      return item(
        id,
        'Review needs review',
        'Needs-review count',
        'Needs-review counts remain available for student feedback and teacher review alignment.'
      );
    case 'review-unanswered':
      return item(
        id,
        'Review unanswered',
        'Unanswered count',
        'Unanswered counts remain explicit after partial submissions.'
      );
    case 'feedback-scope':
      return item(
        id,
        'Feedback scope',
        'Hidden or visible',
        'Feedback scope follows assignment answer-reveal policy after scoring.'
      );
    case 'feedback-visibility':
      return item(
        id,
        'Feedback visibility',
        'Visibility metric',
        'Feedback visibility is prepared as a metric instead of inferred from raw review items.'
      );
    case 'feedback-items':
      return item(
        id,
        'Feedback items',
        'Visible feedback item count',
        'Feedback item counts expose coverage without prompt, answer, or teacher-only answer text.'
      );
    case 'feedback-detail-evidence':
      return item(
        id,
        'Feedback detail evidence',
        'Alternatives and explanations counts',
        'Accepted-answer and explanation evidence stays count-based in the submission handoff.'
      );
    case 'next-steps':
      return item(
        id,
        'Next steps',
        'Review or retry guidance',
        'Post-submit next steps prepare score review, feedback, teacher review, and retry guidance.'
      );
    case 'privacy-guard':
      return item(
        id,
        'Privacy guard',
        'Private submission data omitted',
        'The chain exposes progress, readiness, result, review, feedback, and next-step summaries without leaking anonymous tokens, student names, answer text, raw payload rows, runtime ids, teacher-only answers, or source-material metadata.'
      );
  }
}

function item(
  id: StudentRunnerSubmissionChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<StudentRunnerSubmissionChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
