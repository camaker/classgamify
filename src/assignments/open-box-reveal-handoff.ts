import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import type { SequentialStudentRunnerView } from '@/assignments/student-runner-view';
import { m } from '@/locale/paraglide/messages';

const OPEN_BOX_ANSWER_CONTRACT_VALUE = '{ itemId, answer }';

export const OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'reveal-card-state',
  'box-count',
  'visible-prompt-count',
  'active-box-state',
  'active-box-validity',
  'selected-box-count',
  'answered-box-count',
  'unanswered-box-count',
  'completion-progress',
  'navigation-state',
  'previous-action',
  'next-action',
  'direct-box-selection',
  'answer-input-state',
  'disabled-action-policy',
  'review-feedback-state',
  'review-item-count',
  'accepted-answer-boundary',
  'explanation-boundary',
  'prompt-text-guard',
  'runtime-item-id-guard',
  'answer-text-guard',
  'student-identity-guard',
  'source-material-guard',
  'public-payload-boundary',
  'submission-contract',
  'result-review-boundary',
  'privacy-guard',
] as const;

export type OpenBoxRevealHandoffItemId =
  (typeof OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS)[number];

export type OpenBoxRevealHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: OpenBoxRevealHandoffItemId;
  label: string;
  value: string;
};

export type OpenBoxRevealHandoffPrivacyContract = {
  exposesAnswerKeys: false;
  exposesAnswerText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentIdentity: false;
  itemIds: OpenBoxRevealHandoffItemId[];
  runnerSurface: 'open-box';
  scope: 'open-box-reveal-card';
  templateType: 'open-box';
  usesSharedSubmissionContract: true;
};

export type OpenBoxRevealHandoffView = {
  description: string;
  itemViews: OpenBoxRevealHandoffItemView[];
  privacy: OpenBoxRevealHandoffPrivacyContract;
  title: string;
};

type OpenBoxRevealHandoffContext = {
  answeredBoxCount: number;
  boxCount: number;
  canMove: boolean;
  disabled: boolean;
  hasActiveBox: boolean;
  hasActiveReviewItem: boolean;
  revealAnswer: boolean;
  reviewItemCount: number;
  selectedBoxCount: number;
  unansweredBoxCount: number;
  visiblePromptCount: number;
};

export function buildOpenBoxRevealHandoffView({
  disabled = false,
  revealAnswer = false,
  runnerView,
}: {
  disabled?: boolean;
  revealAnswer?: boolean;
  runnerView: SequentialStudentRunnerView;
}): OpenBoxRevealHandoffView {
  const context = buildOpenBoxRevealHandoffContext({
    disabled,
    revealAnswer,
    runnerView,
  });
  const itemViews = OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS.map((id) =>
    buildOpenBoxRevealHandoffItemView({
      description: getOpenBoxRevealHandoffDescription(id),
      id,
      label: getOpenBoxRevealHandoffLabel(id),
      value: getOpenBoxRevealHandoffValue(id, context),
    })
  );

  return {
    description: m.open_box_reveal_handoff_description(),
    itemViews,
    privacy: buildOpenBoxRevealHandoffPrivacyContract(itemViews),
    title: m.open_box_reveal_handoff_title(),
  };
}

function buildOpenBoxRevealHandoffContext({
  disabled,
  revealAnswer,
  runnerView,
}: {
  disabled: boolean;
  revealAnswer: boolean;
  runnerView: SequentialStudentRunnerView;
}): OpenBoxRevealHandoffContext {
  const boxCount = normalizeRuntimeDisplayCount(
    runnerView.sequenceView.itemViews.length
  );
  const selectedBoxCount = normalizeRuntimeDisplayCount(
    runnerView.navigationView.itemViews.filter((itemView) => itemView.selected)
      .length
  );
  const answeredBoxCount = normalizeRuntimeDisplayCount(
    runnerView.completionSummary.answeredItemCount,
    { max: boxCount }
  );
  const unansweredBoxCount = normalizeRuntimeDisplayCount(
    runnerView.completionSummary.unansweredItemCount,
    { max: boxCount }
  );
  const hasActiveBox = Boolean(runnerView.activeItemView);

  return {
    answeredBoxCount,
    boxCount,
    canMove: runnerView.navigationView.canMove,
    disabled,
    hasActiveBox,
    hasActiveReviewItem: Boolean(runnerView.activeReviewItem),
    revealAnswer,
    reviewItemCount: normalizeRuntimeDisplayCount(
      runnerView.itemViews.filter((itemView) => itemView.reviewItem).length,
      { max: boxCount }
    ),
    selectedBoxCount,
    unansweredBoxCount,
    visiblePromptCount: hasActiveBox ? 1 : 0,
  };
}

function getOpenBoxRevealHandoffValue(
  id: OpenBoxRevealHandoffItemId,
  context: OpenBoxRevealHandoffContext
) {
  switch (id) {
    case 'template-type':
    case 'runner-surface':
      return 'open-box';
    case 'reveal-card-state':
      return context.hasActiveBox
        ? m.open_box_reveal_handoff_active_value()
        : m.open_box_reveal_handoff_empty_value();
    case 'box-count':
      return formatOpenBoxRevealBoxCount(context.boxCount);
    case 'visible-prompt-count':
      return formatOpenBoxRevealPromptCount(context.visiblePromptCount);
    case 'active-box-state':
      return context.hasActiveBox
        ? m.open_box_reveal_handoff_selected_value()
        : m.open_box_reveal_handoff_no_selection_value();
    case 'active-box-validity':
      return context.hasActiveBox && context.selectedBoxCount === 1
        ? m.open_box_reveal_handoff_valid_value()
        : m.open_box_reveal_handoff_waiting_value();
    case 'selected-box-count':
      return String(context.selectedBoxCount);
    case 'answered-box-count':
      return String(context.answeredBoxCount);
    case 'unanswered-box-count':
      return String(context.unansweredBoxCount);
    case 'completion-progress':
      return m.open_box_reveal_handoff_progress_value({
        answeredCount: context.answeredBoxCount,
        boxCount: context.boxCount,
      });
    case 'navigation-state':
      return context.canMove
        ? m.open_box_reveal_handoff_available_value()
        : m.open_box_reveal_handoff_single_box_value();
    case 'previous-action':
    case 'next-action':
      return context.canMove
        ? m.open_box_reveal_handoff_available_value()
        : m.open_box_reveal_handoff_unavailable_value();
    case 'direct-box-selection':
      return context.boxCount > 0
        ? m.open_box_reveal_handoff_available_value()
        : m.open_box_reveal_handoff_unavailable_value();
    case 'answer-input-state':
      if (!context.hasActiveBox)
        return m.open_box_reveal_handoff_unavailable_value();
      return context.disabled
        ? m.open_box_reveal_handoff_locked_value()
        : m.open_box_reveal_handoff_ready_value();
    case 'disabled-action-policy':
      return context.disabled
        ? m.open_box_reveal_handoff_actions_locked_value()
        : m.open_box_reveal_handoff_actions_enabled_value();
    case 'review-feedback-state':
      if (!context.revealAnswer)
        return m.open_box_reveal_handoff_hidden_value();
      return context.hasActiveReviewItem
        ? m.open_box_reveal_handoff_visible_value()
        : m.open_box_reveal_handoff_waiting_for_result_value();
    case 'review-item-count':
      return String(context.reviewItemCount);
    case 'accepted-answer-boundary':
    case 'explanation-boundary':
      return m.open_box_reveal_handoff_post_submit_value();
    case 'prompt-text-guard':
      return m.open_box_reveal_handoff_prompts_hidden_value();
    case 'runtime-item-id-guard':
      return m.open_box_reveal_handoff_item_ids_hidden_value();
    case 'answer-text-guard':
      return m.open_box_reveal_handoff_answers_hidden_value();
    case 'student-identity-guard':
      return m.open_box_reveal_handoff_student_identity_hidden_value();
    case 'source-material-guard':
      return m.open_box_reveal_handoff_source_material_hidden_value();
    case 'public-payload-boundary':
      return m.open_box_reveal_handoff_sanitized_runtime_value();
    case 'submission-contract':
      return OPEN_BOX_ANSWER_CONTRACT_VALUE;
    case 'result-review-boundary':
      return m.open_box_reveal_handoff_teacher_review_value();
    case 'privacy-guard':
      return m.open_box_reveal_handoff_private_data_omitted_value();
  }
}

function getOpenBoxRevealHandoffLabel(id: OpenBoxRevealHandoffItemId) {
  switch (id) {
    case 'template-type':
      return m.open_box_reveal_handoff_template_label();
    case 'runner-surface':
      return m.open_box_reveal_handoff_surface_label();
    case 'reveal-card-state':
      return m.open_box_reveal_handoff_reveal_state_label();
    case 'box-count':
      return m.open_box_reveal_handoff_box_count_label();
    case 'visible-prompt-count':
      return m.open_box_reveal_handoff_visible_prompt_label();
    case 'active-box-state':
      return m.open_box_reveal_handoff_active_box_label();
    case 'active-box-validity':
      return m.open_box_reveal_handoff_active_validity_label();
    case 'selected-box-count':
      return m.open_box_reveal_handoff_selected_count_label();
    case 'answered-box-count':
      return m.open_box_reveal_handoff_answered_count_label();
    case 'unanswered-box-count':
      return m.open_box_reveal_handoff_unanswered_count_label();
    case 'completion-progress':
      return m.open_box_reveal_handoff_progress_label();
    case 'navigation-state':
      return m.open_box_reveal_handoff_navigation_label();
    case 'previous-action':
      return m.open_box_reveal_handoff_previous_label();
    case 'next-action':
      return m.open_box_reveal_handoff_next_label();
    case 'direct-box-selection':
      return m.open_box_reveal_handoff_direct_selection_label();
    case 'answer-input-state':
      return m.open_box_reveal_handoff_input_label();
    case 'disabled-action-policy':
      return m.open_box_reveal_handoff_disabled_label();
    case 'review-feedback-state':
      return m.open_box_reveal_handoff_review_label();
    case 'review-item-count':
      return m.open_box_reveal_handoff_review_count_label();
    case 'accepted-answer-boundary':
      return m.open_box_reveal_handoff_accepted_answer_label();
    case 'explanation-boundary':
      return m.open_box_reveal_handoff_explanation_label();
    case 'prompt-text-guard':
      return m.open_box_reveal_handoff_prompt_guard_label();
    case 'runtime-item-id-guard':
      return m.open_box_reveal_handoff_item_id_guard_label();
    case 'answer-text-guard':
      return m.open_box_reveal_handoff_answer_guard_label();
    case 'student-identity-guard':
      return m.open_box_reveal_handoff_student_identity_label();
    case 'source-material-guard':
      return m.open_box_reveal_handoff_source_material_label();
    case 'public-payload-boundary':
      return m.open_box_reveal_handoff_public_payload_label();
    case 'submission-contract':
      return m.open_box_reveal_handoff_submission_label();
    case 'result-review-boundary':
      return m.open_box_reveal_handoff_result_review_label();
    case 'privacy-guard':
      return m.open_box_reveal_handoff_privacy_label();
  }
}

function getOpenBoxRevealHandoffDescription(id: OpenBoxRevealHandoffItemId) {
  switch (id) {
    case 'template-type':
      return m.open_box_reveal_handoff_template_description();
    case 'runner-surface':
      return m.open_box_reveal_handoff_surface_description();
    case 'reveal-card-state':
      return m.open_box_reveal_handoff_reveal_state_description();
    case 'box-count':
      return m.open_box_reveal_handoff_box_count_description();
    case 'visible-prompt-count':
      return m.open_box_reveal_handoff_visible_prompt_description();
    case 'active-box-state':
      return m.open_box_reveal_handoff_active_box_description();
    case 'active-box-validity':
      return m.open_box_reveal_handoff_active_validity_description();
    case 'selected-box-count':
      return m.open_box_reveal_handoff_selected_count_description();
    case 'answered-box-count':
      return m.open_box_reveal_handoff_answered_count_description();
    case 'unanswered-box-count':
      return m.open_box_reveal_handoff_unanswered_count_description();
    case 'completion-progress':
      return m.open_box_reveal_handoff_progress_description();
    case 'navigation-state':
      return m.open_box_reveal_handoff_navigation_description();
    case 'previous-action':
      return m.open_box_reveal_handoff_previous_description();
    case 'next-action':
      return m.open_box_reveal_handoff_next_description();
    case 'direct-box-selection':
      return m.open_box_reveal_handoff_direct_selection_description();
    case 'answer-input-state':
      return m.open_box_reveal_handoff_input_description();
    case 'disabled-action-policy':
      return m.open_box_reveal_handoff_disabled_description();
    case 'review-feedback-state':
      return m.open_box_reveal_handoff_review_description();
    case 'review-item-count':
      return m.open_box_reveal_handoff_review_count_description();
    case 'accepted-answer-boundary':
      return m.open_box_reveal_handoff_accepted_answer_description();
    case 'explanation-boundary':
      return m.open_box_reveal_handoff_explanation_description();
    case 'prompt-text-guard':
      return m.open_box_reveal_handoff_prompt_guard_description();
    case 'runtime-item-id-guard':
      return m.open_box_reveal_handoff_item_id_guard_description();
    case 'answer-text-guard':
      return m.open_box_reveal_handoff_answer_guard_description();
    case 'student-identity-guard':
      return m.open_box_reveal_handoff_student_identity_description();
    case 'source-material-guard':
      return m.open_box_reveal_handoff_source_material_description();
    case 'public-payload-boundary':
      return m.open_box_reveal_handoff_public_payload_description();
    case 'submission-contract':
      return m.open_box_reveal_handoff_submission_description();
    case 'result-review-boundary':
      return m.open_box_reveal_handoff_result_review_description();
    case 'privacy-guard':
      return m.open_box_reveal_handoff_privacy_description();
  }
}

function buildOpenBoxRevealHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<OpenBoxRevealHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.open_box_reveal_handoff_item_aria({
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

function buildOpenBoxRevealHandoffPrivacyContract(
  itemViews: OpenBoxRevealHandoffItemView[]
): OpenBoxRevealHandoffPrivacyContract {
  return {
    exposesAnswerKeys: false,
    exposesAnswerText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    runnerSurface: 'open-box',
    scope: 'open-box-reveal-card',
    templateType: 'open-box',
    usesSharedSubmissionContract: true,
  };
}

function formatOpenBoxRevealBoxCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.open_box_reveal_handoff_box_count_one({
      count: normalizedCount,
    });
  }

  return m.open_box_reveal_handoff_box_count_many({
    count: normalizedCount,
  });
}

function formatOpenBoxRevealPromptCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.open_box_reveal_handoff_prompt_count_one({
      count: normalizedCount,
    });
  }

  return m.open_box_reveal_handoff_prompt_count_many({
    count: normalizedCount,
  });
}
