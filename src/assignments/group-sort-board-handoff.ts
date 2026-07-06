import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import type { GroupSortRunnerView } from '@/assignments/student-runner-view';
import { m } from '@/locale/paraglide/messages';

export const GROUP_SORT_BOARD_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'board-state',
  'category-count',
  'item-count',
  'unplaced-item-count',
  'placed-item-count',
  'selected-item-state',
  'selected-item-validity',
  'selected-clear-action',
  'category-target-state',
  'available-category-count',
  'group-placement-action',
  'item-selection-toggle',
  'answered-item-count',
  'unanswered-item-count',
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
  'answer-text-guard',
  'student-identity-guard',
  'source-material-guard',
  'privacy-guard',
] as const;

export type GroupSortBoardHandoffItemId =
  (typeof GROUP_SORT_BOARD_HANDOFF_ITEM_IDS)[number];

export type GroupSortBoardHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: GroupSortBoardHandoffItemId;
  label: string;
  value: string;
};

export type GroupSortBoardHandoffPrivacyContract = {
  exposesAnswerKeys: false;
  exposesAnswerText: false;
  exposesCategoryText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentIdentity: false;
  itemIds: GroupSortBoardHandoffItemId[];
  runnerSurface: 'group-sort';
  scope: 'group-sort-category-board';
  templateType: 'group-sort';
  usesSharedSubmissionContract: true;
};

export type GroupSortBoardHandoffView = {
  description: string;
  itemViews: GroupSortBoardHandoffItemView[];
  privacy: GroupSortBoardHandoffPrivacyContract;
  title: string;
};

type GroupSortBoardHandoffContext = {
  answeredItemCount: number;
  availableCategoryCount: number;
  categoryCount: number;
  disabled: boolean;
  hasCategories: boolean;
  hasItems: boolean;
  hasSelectedItem: boolean;
  itemCount: number;
  placedItemCount: number;
  revealAnswer: boolean;
  reviewItemCount: number;
  unplacedItemCount: number;
  unansweredItemCount: number;
};

export function buildGroupSortBoardHandoffView({
  disabled = false,
  revealAnswer = false,
  runnerView,
}: {
  disabled?: boolean;
  revealAnswer?: boolean;
  runnerView: GroupSortRunnerView;
}): GroupSortBoardHandoffView {
  const context = buildGroupSortBoardHandoffContext({
    disabled,
    revealAnswer,
    runnerView,
  });
  const itemViews = GROUP_SORT_BOARD_HANDOFF_ITEM_IDS.map((id) =>
    buildGroupSortBoardHandoffItemView({
      description: getGroupSortBoardHandoffDescription(id),
      id,
      label: getGroupSortBoardHandoffLabel(id),
      value: getGroupSortBoardHandoffValue(id, context),
    })
  );

  return {
    description: m.group_sort_board_handoff_description(),
    itemViews,
    privacy: buildGroupSortBoardHandoffPrivacyContract(itemViews),
    title: m.group_sort_board_handoff_title(),
  };
}

function buildGroupSortBoardHandoffContext({
  disabled,
  revealAnswer,
  runnerView,
}: {
  disabled: boolean;
  revealAnswer: boolean;
  runnerView: GroupSortRunnerView;
}): GroupSortBoardHandoffContext {
  const itemCount = normalizeRuntimeDisplayCount(runnerView.itemViews.length);
  const categoryCount = normalizeRuntimeDisplayCount(
    runnerView.groupViews.length
  );
  const placedItemCount = normalizeRuntimeDisplayCount(
    runnerView.groupViews.reduce(
      (total, groupView) => total + groupView.placedItemViews.length,
      0
    ),
    { max: itemCount }
  );
  const hasSelectedItem = Boolean(runnerView.selectedItem);

  return {
    answeredItemCount: normalizeRuntimeDisplayCount(
      runnerView.completionSummary.answeredItemCount,
      { max: itemCount }
    ),
    availableCategoryCount: hasSelectedItem && !disabled ? categoryCount : 0,
    categoryCount,
    disabled,
    hasCategories: categoryCount > 0,
    hasItems: itemCount > 0,
    hasSelectedItem,
    itemCount,
    placedItemCount,
    revealAnswer,
    reviewItemCount: normalizeRuntimeDisplayCount(
      runnerView.itemViews.filter((itemView) => itemView.reviewItem).length,
      { max: itemCount }
    ),
    unplacedItemCount: normalizeRuntimeDisplayCount(
      runnerView.unplacedItemViews.length,
      { max: itemCount }
    ),
    unansweredItemCount: normalizeRuntimeDisplayCount(
      runnerView.completionSummary.unansweredItemCount,
      { max: itemCount }
    ),
  };
}

function getGroupSortBoardHandoffValue(
  id: GroupSortBoardHandoffItemId,
  context: GroupSortBoardHandoffContext
) {
  switch (id) {
    case 'template-type':
    case 'runner-surface':
      return 'group-sort';
    case 'board-state':
      return context.hasItems && context.hasCategories
        ? m.group_sort_board_handoff_active_value()
        : m.group_sort_board_handoff_empty_value();
    case 'category-count':
      return formatGroupSortCategoryCount(context.categoryCount);
    case 'item-count':
      return formatGroupSortItemCount(context.itemCount);
    case 'unplaced-item-count':
      return String(context.unplacedItemCount);
    case 'placed-item-count':
      return String(context.placedItemCount);
    case 'selected-item-state':
      return context.hasSelectedItem
        ? m.group_sort_board_handoff_selected_value()
        : m.group_sort_board_handoff_no_selection_value();
    case 'selected-item-validity':
      return context.hasSelectedItem
        ? m.group_sort_board_handoff_valid_value()
        : m.group_sort_board_handoff_waiting_for_item_value();
    case 'selected-clear-action':
      if (!context.hasSelectedItem) {
        return m.group_sort_board_handoff_unavailable_value();
      }
      return context.disabled
        ? m.group_sort_board_handoff_locked_value()
        : m.group_sort_board_handoff_available_value();
    case 'category-target-state':
      return getGroupSortCategoryTargetState(context);
    case 'available-category-count':
      return formatGroupSortAvailableCategoryCount(
        context.availableCategoryCount
      );
    case 'group-placement-action':
      return getGroupSortPlacementActionState(context);
    case 'item-selection-toggle':
      return context.disabled
        ? m.group_sort_board_handoff_locked_value()
        : m.group_sort_board_handoff_available_value();
    case 'answered-item-count':
      return String(context.answeredItemCount);
    case 'unanswered-item-count':
      return String(context.unansweredItemCount);
    case 'completion-progress':
      return m.group_sort_board_handoff_progress_value({
        answeredCount: context.answeredItemCount,
        itemCount: context.itemCount,
      });
    case 'disabled-action-policy':
      return context.disabled
        ? m.group_sort_board_handoff_actions_locked_value()
        : m.group_sort_board_handoff_actions_enabled_value();
    case 'review-feedback-state':
      if (!context.revealAnswer) {
        return m.group_sort_board_handoff_hidden_value();
      }
      return context.reviewItemCount > 0
        ? m.group_sort_board_handoff_visible_value()
        : m.group_sort_board_handoff_waiting_for_result_value();
    case 'review-item-count':
      return String(context.reviewItemCount);
    case 'accepted-answer-boundary':
    case 'explanation-boundary':
      return m.group_sort_board_handoff_post_submit_value();
    case 'public-payload-boundary':
      return m.group_sort_board_handoff_sanitized_runtime_value();
    case 'submission-contract':
      return m.group_sort_board_handoff_submission_value();
    case 'runtime-item-id-guard':
      return m.group_sort_board_handoff_item_ids_hidden_value();
    case 'prompt-text-guard':
      return m.group_sort_board_handoff_prompts_hidden_value();
    case 'answer-text-guard':
      return m.group_sort_board_handoff_answers_hidden_value();
    case 'student-identity-guard':
      return m.group_sort_board_handoff_student_identity_hidden_value();
    case 'source-material-guard':
      return m.group_sort_board_handoff_source_material_hidden_value();
    case 'privacy-guard':
      return m.group_sort_board_handoff_private_data_omitted_value();
  }
}

function getGroupSortBoardHandoffLabel(id: GroupSortBoardHandoffItemId) {
  switch (id) {
    case 'template-type':
      return m.group_sort_board_handoff_template_label();
    case 'runner-surface':
      return m.group_sort_board_handoff_surface_label();
    case 'board-state':
      return m.group_sort_board_handoff_board_state_label();
    case 'category-count':
      return m.group_sort_board_handoff_category_count_label();
    case 'item-count':
      return m.group_sort_board_handoff_item_count_label();
    case 'unplaced-item-count':
      return m.group_sort_board_handoff_unplaced_count_label();
    case 'placed-item-count':
      return m.group_sort_board_handoff_placed_count_label();
    case 'selected-item-state':
      return m.group_sort_board_handoff_selected_item_label();
    case 'selected-item-validity':
      return m.group_sort_board_handoff_selected_validity_label();
    case 'selected-clear-action':
      return m.group_sort_board_handoff_clear_action_label();
    case 'category-target-state':
      return m.group_sort_board_handoff_category_target_label();
    case 'available-category-count':
      return m.group_sort_board_handoff_available_category_label();
    case 'group-placement-action':
      return m.group_sort_board_handoff_group_action_label();
    case 'item-selection-toggle':
      return m.group_sort_board_handoff_item_selection_label();
    case 'answered-item-count':
      return m.group_sort_board_handoff_answered_count_label();
    case 'unanswered-item-count':
      return m.group_sort_board_handoff_unanswered_count_label();
    case 'completion-progress':
      return m.group_sort_board_handoff_progress_label();
    case 'disabled-action-policy':
      return m.group_sort_board_handoff_disabled_label();
    case 'review-feedback-state':
      return m.group_sort_board_handoff_review_label();
    case 'review-item-count':
      return m.group_sort_board_handoff_review_count_label();
    case 'accepted-answer-boundary':
      return m.group_sort_board_handoff_accepted_answer_label();
    case 'explanation-boundary':
      return m.group_sort_board_handoff_explanation_label();
    case 'public-payload-boundary':
      return m.group_sort_board_handoff_public_payload_label();
    case 'submission-contract':
      return m.group_sort_board_handoff_submission_label();
    case 'runtime-item-id-guard':
      return m.group_sort_board_handoff_item_id_guard_label();
    case 'prompt-text-guard':
      return m.group_sort_board_handoff_prompt_guard_label();
    case 'answer-text-guard':
      return m.group_sort_board_handoff_answer_guard_label();
    case 'student-identity-guard':
      return m.group_sort_board_handoff_student_identity_label();
    case 'source-material-guard':
      return m.group_sort_board_handoff_source_material_label();
    case 'privacy-guard':
      return m.group_sort_board_handoff_privacy_label();
  }
}

function getGroupSortBoardHandoffDescription(id: GroupSortBoardHandoffItemId) {
  switch (id) {
    case 'template-type':
      return m.group_sort_board_handoff_template_description();
    case 'runner-surface':
      return m.group_sort_board_handoff_surface_description();
    case 'board-state':
      return m.group_sort_board_handoff_board_state_description();
    case 'category-count':
      return m.group_sort_board_handoff_category_count_description();
    case 'item-count':
      return m.group_sort_board_handoff_item_count_description();
    case 'unplaced-item-count':
      return m.group_sort_board_handoff_unplaced_count_description();
    case 'placed-item-count':
      return m.group_sort_board_handoff_placed_count_description();
    case 'selected-item-state':
      return m.group_sort_board_handoff_selected_item_description();
    case 'selected-item-validity':
      return m.group_sort_board_handoff_selected_validity_description();
    case 'selected-clear-action':
      return m.group_sort_board_handoff_clear_action_description();
    case 'category-target-state':
      return m.group_sort_board_handoff_category_target_description();
    case 'available-category-count':
      return m.group_sort_board_handoff_available_category_description();
    case 'group-placement-action':
      return m.group_sort_board_handoff_group_action_description();
    case 'item-selection-toggle':
      return m.group_sort_board_handoff_item_selection_description();
    case 'answered-item-count':
      return m.group_sort_board_handoff_answered_count_description();
    case 'unanswered-item-count':
      return m.group_sort_board_handoff_unanswered_count_description();
    case 'completion-progress':
      return m.group_sort_board_handoff_progress_description();
    case 'disabled-action-policy':
      return m.group_sort_board_handoff_disabled_description();
    case 'review-feedback-state':
      return m.group_sort_board_handoff_review_description();
    case 'review-item-count':
      return m.group_sort_board_handoff_review_count_description();
    case 'accepted-answer-boundary':
      return m.group_sort_board_handoff_accepted_answer_description();
    case 'explanation-boundary':
      return m.group_sort_board_handoff_explanation_description();
    case 'public-payload-boundary':
      return m.group_sort_board_handoff_public_payload_description();
    case 'submission-contract':
      return m.group_sort_board_handoff_submission_description();
    case 'runtime-item-id-guard':
      return m.group_sort_board_handoff_item_id_guard_description();
    case 'prompt-text-guard':
      return m.group_sort_board_handoff_prompt_guard_description();
    case 'answer-text-guard':
      return m.group_sort_board_handoff_answer_guard_description();
    case 'student-identity-guard':
      return m.group_sort_board_handoff_student_identity_description();
    case 'source-material-guard':
      return m.group_sort_board_handoff_source_material_description();
    case 'privacy-guard':
      return m.group_sort_board_handoff_privacy_description();
  }
}

function getGroupSortCategoryTargetState(
  context: GroupSortBoardHandoffContext
) {
  if (!context.hasCategories) {
    return m.group_sort_board_handoff_unavailable_value();
  }
  if (context.disabled) {
    return m.group_sort_board_handoff_locked_value();
  }
  return context.hasSelectedItem
    ? m.group_sort_board_handoff_ready_value()
    : m.group_sort_board_handoff_waiting_for_item_value();
}

function getGroupSortPlacementActionState(
  context: GroupSortBoardHandoffContext
) {
  if (!context.hasCategories) {
    return m.group_sort_board_handoff_unavailable_value();
  }
  if (context.disabled) {
    return m.group_sort_board_handoff_locked_value();
  }
  return context.hasSelectedItem
    ? m.group_sort_board_handoff_placement_ready_value()
    : m.group_sort_board_handoff_waiting_for_item_value();
}

function buildGroupSortBoardHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<GroupSortBoardHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.group_sort_board_handoff_item_aria({
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

function buildGroupSortBoardHandoffPrivacyContract(
  itemViews: GroupSortBoardHandoffItemView[]
): GroupSortBoardHandoffPrivacyContract {
  return {
    exposesAnswerKeys: false,
    exposesAnswerText: false,
    exposesCategoryText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    runnerSurface: 'group-sort',
    scope: 'group-sort-category-board',
    templateType: 'group-sort',
    usesSharedSubmissionContract: true,
  };
}

function formatGroupSortCategoryCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.group_sort_board_handoff_category_count_one({
      count: normalizedCount,
    });
  }

  return m.group_sort_board_handoff_category_count_many({
    count: normalizedCount,
  });
}

function formatGroupSortAvailableCategoryCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.group_sort_board_handoff_available_category_count_one({
      count: normalizedCount,
    });
  }

  return m.group_sort_board_handoff_available_category_count_many({
    count: normalizedCount,
  });
}

function formatGroupSortItemCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.group_sort_board_handoff_item_count_one({
      count: normalizedCount,
    });
  }

  return m.group_sort_board_handoff_item_count_many({
    count: normalizedCount,
  });
}
