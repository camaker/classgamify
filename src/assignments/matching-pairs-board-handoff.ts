import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import type { ChoicePairingRunnerView } from '@/assignments/student-runner-view';
import { m } from '@/locale/paraglide/messages';

export const MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'board-state',
  'prompt-card-count',
  'choice-card-count',
  'selected-prompt-state',
  'selected-prompt-validity',
  'prompt-selection-toggle',
  'choice-target-state',
  'available-choice-count',
  'used-choice-count',
  'unused-choice-count',
  'exclusive-choice-policy',
  'reassignment-policy',
  'answered-prompt-count',
  'unanswered-prompt-count',
  'completion-progress',
  'disabled-action-policy',
  'review-feedback-state',
  'review-item-count',
  'accepted-answer-boundary',
  'explanation-boundary',
  'public-payload-boundary',
  'submission-contract',
  'runtime-item-id-guard',
  'prompt-text-guard',
  'choice-text-guard',
  'answer-text-guard',
  'student-source-guard',
  'privacy-guard',
] as const;

export type MatchingPairsBoardHandoffItemId =
  (typeof MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS)[number];

export type MatchingPairsBoardHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: MatchingPairsBoardHandoffItemId;
  label: string;
  value: string;
};

export type MatchingPairsBoardHandoffPrivacyContract = {
  exposesAnswerKeys: false;
  exposesAnswerText: false;
  exposesChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentIdentity: false;
  itemIds: MatchingPairsBoardHandoffItemId[];
  runnerSurface: 'matching-pairs';
  scope: 'matching-pairs-card-board';
  templateType: 'matching-pairs';
  usesSharedSubmissionContract: true;
};

export type MatchingPairsBoardHandoffView = {
  description: string;
  itemViews: MatchingPairsBoardHandoffItemView[];
  privacy: MatchingPairsBoardHandoffPrivacyContract;
  title: string;
};

type MatchingPairsBoardHandoffContext = {
  answeredPromptCount: number;
  availableChoiceCount: number;
  choiceCardCount: number;
  disabled: boolean;
  hasChoices: boolean;
  hasPrompts: boolean;
  hasSelectedPrompt: boolean;
  promptCardCount: number;
  revealAnswer: boolean;
  reviewItemCount: number;
  unansweredPromptCount: number;
  unusedChoiceCount: number;
  usedChoiceCount: number;
};

export function buildMatchingPairsBoardHandoffView({
  disabled = false,
  revealAnswer = false,
  runnerView,
}: {
  disabled?: boolean;
  revealAnswer?: boolean;
  runnerView: ChoicePairingRunnerView;
}): MatchingPairsBoardHandoffView {
  const context = buildMatchingPairsBoardHandoffContext({
    disabled,
    revealAnswer,
    runnerView,
  });
  const itemViews = MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS.map((id) =>
    buildMatchingPairsBoardHandoffItemView({
      description: getMatchingPairsBoardHandoffDescription(id),
      id,
      label: getMatchingPairsBoardHandoffLabel(id),
      value: getMatchingPairsBoardHandoffValue(id, context),
    })
  );

  return {
    description: m.matching_pairs_board_handoff_description(),
    itemViews,
    privacy: buildMatchingPairsBoardHandoffPrivacyContract(itemViews),
    title: m.matching_pairs_board_handoff_title(),
  };
}

function buildMatchingPairsBoardHandoffContext({
  disabled,
  revealAnswer,
  runnerView,
}: {
  disabled: boolean;
  revealAnswer: boolean;
  runnerView: ChoicePairingRunnerView;
}): MatchingPairsBoardHandoffContext {
  const promptCardCount = normalizeRuntimeDisplayCount(
    runnerView.promptItemViews.length
  );
  const choiceCardCount = normalizeRuntimeDisplayCount(
    runnerView.choiceViews.length
  );
  const hasSelectedPrompt = runnerView.promptItemViews.some(
    (itemView) => itemView.selected
  );
  const usedChoiceCount = normalizeRuntimeDisplayCount(
    runnerView.choiceViews.filter((choiceView) => choiceView.usedByItemId)
      .length,
    { max: choiceCardCount }
  );

  return {
    answeredPromptCount: normalizeRuntimeDisplayCount(
      runnerView.completionSummary.answeredItemCount,
      { max: promptCardCount }
    ),
    availableChoiceCount: hasSelectedPrompt && !disabled ? choiceCardCount : 0,
    choiceCardCount,
    disabled,
    hasChoices: choiceCardCount > 0,
    hasPrompts: promptCardCount > 0,
    hasSelectedPrompt,
    promptCardCount,
    revealAnswer,
    reviewItemCount: normalizeRuntimeDisplayCount(
      runnerView.promptItemViews.filter((itemView) => itemView.reviewItem)
        .length,
      { max: promptCardCount }
    ),
    unansweredPromptCount: normalizeRuntimeDisplayCount(
      runnerView.completionSummary.unansweredItemCount,
      { max: promptCardCount }
    ),
    unusedChoiceCount: normalizeRuntimeDisplayCount(
      choiceCardCount - usedChoiceCount,
      { max: choiceCardCount }
    ),
    usedChoiceCount,
  };
}

function getMatchingPairsBoardHandoffValue(
  id: MatchingPairsBoardHandoffItemId,
  context: MatchingPairsBoardHandoffContext
) {
  switch (id) {
    case 'template-type':
    case 'runner-surface':
      return 'matching-pairs';
    case 'board-state':
      return context.hasPrompts && context.hasChoices
        ? m.matching_pairs_board_handoff_active_value()
        : m.matching_pairs_board_handoff_empty_value();
    case 'prompt-card-count':
      return formatMatchingPairsPromptCount(context.promptCardCount);
    case 'choice-card-count':
      return formatMatchingPairsChoiceCount(context.choiceCardCount);
    case 'selected-prompt-state':
      return context.hasSelectedPrompt
        ? m.matching_pairs_board_handoff_selected_value()
        : m.matching_pairs_board_handoff_no_selection_value();
    case 'selected-prompt-validity':
      return context.hasSelectedPrompt
        ? m.matching_pairs_board_handoff_valid_value()
        : m.matching_pairs_board_handoff_waiting_for_prompt_value();
    case 'prompt-selection-toggle':
      return context.disabled
        ? m.matching_pairs_board_handoff_locked_value()
        : m.matching_pairs_board_handoff_available_value();
    case 'choice-target-state':
      return getMatchingPairsChoiceTargetState(context);
    case 'available-choice-count':
      return formatMatchingPairsAvailableChoiceCount(
        context.availableChoiceCount
      );
    case 'used-choice-count':
      return formatMatchingPairsUsedChoiceCount(context.usedChoiceCount);
    case 'unused-choice-count':
      return formatMatchingPairsUnusedChoiceCount(context.unusedChoiceCount);
    case 'exclusive-choice-policy':
      return m.matching_pairs_board_handoff_exclusive_choice_value();
    case 'reassignment-policy':
      return m.matching_pairs_board_handoff_reassignment_value();
    case 'answered-prompt-count':
      return String(context.answeredPromptCount);
    case 'unanswered-prompt-count':
      return String(context.unansweredPromptCount);
    case 'completion-progress':
      return m.matching_pairs_board_handoff_progress_value({
        answeredCount: context.answeredPromptCount,
        promptCount: context.promptCardCount,
      });
    case 'disabled-action-policy':
      return context.disabled
        ? m.matching_pairs_board_handoff_actions_locked_value()
        : m.matching_pairs_board_handoff_actions_enabled_value();
    case 'review-feedback-state':
      if (!context.revealAnswer) {
        return m.matching_pairs_board_handoff_hidden_value();
      }
      return context.reviewItemCount > 0
        ? m.matching_pairs_board_handoff_visible_value()
        : m.matching_pairs_board_handoff_waiting_for_result_value();
    case 'review-item-count':
      return String(context.reviewItemCount);
    case 'accepted-answer-boundary':
    case 'explanation-boundary':
      return m.matching_pairs_board_handoff_post_submit_value();
    case 'public-payload-boundary':
      return m.matching_pairs_board_handoff_sanitized_runtime_value();
    case 'submission-contract':
      return m.matching_pairs_board_handoff_submission_value();
    case 'runtime-item-id-guard':
      return m.matching_pairs_board_handoff_item_ids_hidden_value();
    case 'prompt-text-guard':
      return m.matching_pairs_board_handoff_prompts_hidden_value();
    case 'choice-text-guard':
      return m.matching_pairs_board_handoff_choices_hidden_value();
    case 'answer-text-guard':
      return m.matching_pairs_board_handoff_answers_hidden_value();
    case 'student-source-guard':
      return m.matching_pairs_board_handoff_student_source_hidden_value();
    case 'privacy-guard':
      return m.matching_pairs_board_handoff_private_data_omitted_value();
  }
}

function getMatchingPairsBoardHandoffLabel(
  id: MatchingPairsBoardHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.matching_pairs_board_handoff_template_label();
    case 'runner-surface':
      return m.matching_pairs_board_handoff_surface_label();
    case 'board-state':
      return m.matching_pairs_board_handoff_board_state_label();
    case 'prompt-card-count':
      return m.matching_pairs_board_handoff_prompt_count_label();
    case 'choice-card-count':
      return m.matching_pairs_board_handoff_choice_count_label();
    case 'selected-prompt-state':
      return m.matching_pairs_board_handoff_selected_prompt_label();
    case 'selected-prompt-validity':
      return m.matching_pairs_board_handoff_selected_validity_label();
    case 'prompt-selection-toggle':
      return m.matching_pairs_board_handoff_prompt_selection_label();
    case 'choice-target-state':
      return m.matching_pairs_board_handoff_choice_target_label();
    case 'available-choice-count':
      return m.matching_pairs_board_handoff_available_choice_label();
    case 'used-choice-count':
      return m.matching_pairs_board_handoff_used_choice_label();
    case 'unused-choice-count':
      return m.matching_pairs_board_handoff_unused_choice_label();
    case 'exclusive-choice-policy':
      return m.matching_pairs_board_handoff_exclusive_choice_label();
    case 'reassignment-policy':
      return m.matching_pairs_board_handoff_reassignment_label();
    case 'answered-prompt-count':
      return m.matching_pairs_board_handoff_answered_count_label();
    case 'unanswered-prompt-count':
      return m.matching_pairs_board_handoff_unanswered_count_label();
    case 'completion-progress':
      return m.matching_pairs_board_handoff_progress_label();
    case 'disabled-action-policy':
      return m.matching_pairs_board_handoff_disabled_label();
    case 'review-feedback-state':
      return m.matching_pairs_board_handoff_review_label();
    case 'review-item-count':
      return m.matching_pairs_board_handoff_review_count_label();
    case 'accepted-answer-boundary':
      return m.matching_pairs_board_handoff_accepted_answer_label();
    case 'explanation-boundary':
      return m.matching_pairs_board_handoff_explanation_label();
    case 'public-payload-boundary':
      return m.matching_pairs_board_handoff_public_payload_label();
    case 'submission-contract':
      return m.matching_pairs_board_handoff_submission_label();
    case 'runtime-item-id-guard':
      return m.matching_pairs_board_handoff_item_id_guard_label();
    case 'prompt-text-guard':
      return m.matching_pairs_board_handoff_prompt_guard_label();
    case 'choice-text-guard':
      return m.matching_pairs_board_handoff_choice_guard_label();
    case 'answer-text-guard':
      return m.matching_pairs_board_handoff_answer_guard_label();
    case 'student-source-guard':
      return m.matching_pairs_board_handoff_student_source_label();
    case 'privacy-guard':
      return m.matching_pairs_board_handoff_privacy_label();
  }
}

function getMatchingPairsBoardHandoffDescription(
  id: MatchingPairsBoardHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.matching_pairs_board_handoff_template_description();
    case 'runner-surface':
      return m.matching_pairs_board_handoff_surface_description();
    case 'board-state':
      return m.matching_pairs_board_handoff_board_state_description();
    case 'prompt-card-count':
      return m.matching_pairs_board_handoff_prompt_count_description();
    case 'choice-card-count':
      return m.matching_pairs_board_handoff_choice_count_description();
    case 'selected-prompt-state':
      return m.matching_pairs_board_handoff_selected_prompt_description();
    case 'selected-prompt-validity':
      return m.matching_pairs_board_handoff_selected_validity_description();
    case 'prompt-selection-toggle':
      return m.matching_pairs_board_handoff_prompt_selection_description();
    case 'choice-target-state':
      return m.matching_pairs_board_handoff_choice_target_description();
    case 'available-choice-count':
      return m.matching_pairs_board_handoff_available_choice_description();
    case 'used-choice-count':
      return m.matching_pairs_board_handoff_used_choice_description();
    case 'unused-choice-count':
      return m.matching_pairs_board_handoff_unused_choice_description();
    case 'exclusive-choice-policy':
      return m.matching_pairs_board_handoff_exclusive_choice_description();
    case 'reassignment-policy':
      return m.matching_pairs_board_handoff_reassignment_description();
    case 'answered-prompt-count':
      return m.matching_pairs_board_handoff_answered_count_description();
    case 'unanswered-prompt-count':
      return m.matching_pairs_board_handoff_unanswered_count_description();
    case 'completion-progress':
      return m.matching_pairs_board_handoff_progress_description();
    case 'disabled-action-policy':
      return m.matching_pairs_board_handoff_disabled_description();
    case 'review-feedback-state':
      return m.matching_pairs_board_handoff_review_description();
    case 'review-item-count':
      return m.matching_pairs_board_handoff_review_count_description();
    case 'accepted-answer-boundary':
      return m.matching_pairs_board_handoff_accepted_answer_description();
    case 'explanation-boundary':
      return m.matching_pairs_board_handoff_explanation_description();
    case 'public-payload-boundary':
      return m.matching_pairs_board_handoff_public_payload_description();
    case 'submission-contract':
      return m.matching_pairs_board_handoff_submission_description();
    case 'runtime-item-id-guard':
      return m.matching_pairs_board_handoff_item_id_guard_description();
    case 'prompt-text-guard':
      return m.matching_pairs_board_handoff_prompt_guard_description();
    case 'choice-text-guard':
      return m.matching_pairs_board_handoff_choice_guard_description();
    case 'answer-text-guard':
      return m.matching_pairs_board_handoff_answer_guard_description();
    case 'student-source-guard':
      return m.matching_pairs_board_handoff_student_source_description();
    case 'privacy-guard':
      return m.matching_pairs_board_handoff_privacy_description();
  }
}

function getMatchingPairsChoiceTargetState(
  context: MatchingPairsBoardHandoffContext
) {
  if (!context.hasChoices) {
    return m.matching_pairs_board_handoff_unavailable_value();
  }
  if (context.disabled) {
    return m.matching_pairs_board_handoff_locked_value();
  }
  return context.hasSelectedPrompt
    ? m.matching_pairs_board_handoff_ready_value()
    : m.matching_pairs_board_handoff_waiting_for_prompt_value();
}

function buildMatchingPairsBoardHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<MatchingPairsBoardHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.matching_pairs_board_handoff_item_aria({
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

function buildMatchingPairsBoardHandoffPrivacyContract(
  itemViews: MatchingPairsBoardHandoffItemView[]
): MatchingPairsBoardHandoffPrivacyContract {
  return {
    exposesAnswerKeys: false,
    exposesAnswerText: false,
    exposesChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    runnerSurface: 'matching-pairs',
    scope: 'matching-pairs-card-board',
    templateType: 'matching-pairs',
    usesSharedSubmissionContract: true,
  };
}

function formatMatchingPairsPromptCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.matching_pairs_board_handoff_prompt_count_one({
      count: normalizedCount,
    });
  }

  return m.matching_pairs_board_handoff_prompt_count_many({
    count: normalizedCount,
  });
}

function formatMatchingPairsChoiceCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.matching_pairs_board_handoff_choice_count_one({
      count: normalizedCount,
    });
  }

  return m.matching_pairs_board_handoff_choice_count_many({
    count: normalizedCount,
  });
}

function formatMatchingPairsAvailableChoiceCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.matching_pairs_board_handoff_available_choice_count_one({
      count: normalizedCount,
    });
  }

  return m.matching_pairs_board_handoff_available_choice_count_many({
    count: normalizedCount,
  });
}

function formatMatchingPairsUsedChoiceCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.matching_pairs_board_handoff_used_choice_count_one({
      count: normalizedCount,
    });
  }

  return m.matching_pairs_board_handoff_used_choice_count_many({
    count: normalizedCount,
  });
}

function formatMatchingPairsUnusedChoiceCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.matching_pairs_board_handoff_unused_choice_count_one({
      count: normalizedCount,
    });
  }

  return m.matching_pairs_board_handoff_unused_choice_count_many({
    count: normalizedCount,
  });
}
