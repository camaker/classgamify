import type { ActivityTemplateRunnerKind } from '@/activities/runtime';
import type { ActivityTemplateType } from '@/activities/types';
import type { PublicRuntimeItem } from '@/assignments/public';
import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import {
  buildExclusiveChoiceAnswerChanges,
  findChoiceOwner,
  getUniqueRuntimeChoices,
  resolveChoicePairingSelectedItemId,
  resolveGroupSortSelectedItemId,
} from '@/assignments/student-runner-view';
import {
  normalizeStudentAnswersForRuntimeItems,
  type StudentAnswerMap,
} from '@/assignments/student-submission';
import { m } from '@/locale/paraglide/messages';

const STUDENT_RUNTIME_ANSWER_CONTRACT_VALUE = '{ itemId, answer }';

type StudentRuntimeChoiceAssignmentSurface = ActivityTemplateRunnerKind;

export const STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'exclusive-surface-state',
  'group-placement-state',
  'choice-list-state',
  'normalized-choice-count',
  'duplicate-choice-count',
  'choice-key-normalization',
  'selected-item-state',
  'selected-item-validity',
  'selected-choice-owner',
  'occupied-choice-count',
  'unassigned-choice-count',
  'answer-change-contract',
  'exclusive-clear-change',
  'exclusive-set-change',
  'disabled-action-policy',
  'no-selected-policy',
  'stale-selection-policy',
  'prompt-selection-toggle',
  'choice-action-boundary',
  'group-action-boundary',
  'group-clear-boundary',
  'normalized-answer-scope',
  'submission-contract',
  'public-payload-boundary',
  'runtime-choice-text-guard',
  'runtime-item-id-guard',
  'answer-text-guard',
  'privacy-guard',
] as const;

export type StudentRuntimeChoiceAssignmentHandoffItemId =
  (typeof STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS)[number];

export type StudentRuntimeChoiceAssignmentHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRuntimeChoiceAssignmentHandoffItemId;
  label: string;
  value: string;
};

export type StudentRuntimeChoiceAssignmentHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesRawChoiceOwnerItemId: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  itemIds: StudentRuntimeChoiceAssignmentHandoffItemId[];
  runnerSurface: StudentRuntimeChoiceAssignmentSurface;
  scope: 'student-runtime-choice-assignment';
  templateType: ActivityTemplateType;
  usesNormalizedChoiceKeys: true;
  usesSharedSubmissionContract: true;
};

export type StudentRuntimeChoiceAssignmentHandoffView = {
  description: string;
  itemViews: StudentRuntimeChoiceAssignmentHandoffItemView[];
  privacy: StudentRuntimeChoiceAssignmentHandoffPrivacyContract;
  title: string;
};

type StudentRuntimeChoiceAssignmentContext = {
  disabled: boolean;
  duplicateChoiceCount: number;
  exclusiveChangeCount: number;
  exclusiveClearCount: number;
  hasChoiceOwner: boolean;
  hasSelectedChoice: boolean;
  normalizedAnswers: StudentAnswerMap;
  occupiedChoiceCount: number;
  selectedItemId?: string;
  selectedItemState: 'none' | 'stale' | 'valid';
  surface: StudentRuntimeChoiceAssignmentSurface;
  templateType: ActivityTemplateType;
  unassignedChoiceCount: number;
  uniqueChoiceCount: number;
};

export function buildStudentRuntimeChoiceAssignmentHandoffView({
  answers,
  disabled = false,
  items,
  selectedChoice,
  selectedItemId,
  surface,
  templateType,
}: {
  answers: StudentAnswerMap;
  disabled?: boolean;
  items: PublicRuntimeItem[];
  selectedChoice?: string;
  selectedItemId?: string;
  surface: StudentRuntimeChoiceAssignmentSurface;
  templateType: ActivityTemplateType;
}): StudentRuntimeChoiceAssignmentHandoffView {
  const choices = getUniqueRuntimeChoices(items);
  const choice = selectedChoice ?? choices[0] ?? '';
  const normalizedAnswers = normalizeStudentAnswersForRuntimeItems({
    answers,
    runtimeItems: items,
  });
  const selectedItemState = getStudentRuntimeSelectedItemState({
    items,
    selectedItemId,
    surface,
  });
  const exclusiveChanges =
    isChoicePairingSurface(surface) && selectedItemState === 'valid'
      ? buildExclusiveChoiceAnswerChanges({
          answers: normalizedAnswers,
          choice,
          itemId: selectedItemId ?? '',
          items,
        })
      : [];
  const occupiedChoiceCount = countOccupiedRuntimeChoices({
    answers: normalizedAnswers,
    choices,
  });
  const context = {
    disabled,
    duplicateChoiceCount: countDuplicateRuntimeChoices({ choices, items }),
    exclusiveChangeCount: exclusiveChanges.length,
    exclusiveClearCount: exclusiveChanges.filter((change) => !change.answer)
      .length,
    hasChoiceOwner: Boolean(
      choice && findChoiceOwner(normalizedAnswers, choice)
    ),
    hasSelectedChoice: Boolean(choice),
    normalizedAnswers,
    occupiedChoiceCount,
    selectedItemId,
    selectedItemState,
    surface,
    templateType,
    unassignedChoiceCount: Math.max(0, choices.length - occupiedChoiceCount),
    uniqueChoiceCount: choices.length,
  } satisfies StudentRuntimeChoiceAssignmentContext;
  const itemViews = STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildStudentRuntimeChoiceAssignmentHandoffItemView({
        description: getStudentRuntimeChoiceAssignmentHandoffDescription(id),
        id,
        label: getStudentRuntimeChoiceAssignmentHandoffLabel(id),
        value: getStudentRuntimeChoiceAssignmentHandoffValue(id, context),
      })
  );

  return {
    description: m.student_runtime_choice_assignment_handoff_description(),
    itemViews,
    privacy: buildStudentRuntimeChoiceAssignmentHandoffPrivacyContract({
      itemViews,
      surface,
      templateType,
    }),
    title: m.student_runtime_choice_assignment_handoff_title(),
  };
}

function getStudentRuntimeSelectedItemState({
  items,
  selectedItemId,
  surface,
}: {
  items: PublicRuntimeItem[];
  selectedItemId?: string;
  surface: StudentRuntimeChoiceAssignmentSurface;
}): StudentRuntimeChoiceAssignmentContext['selectedItemState'] {
  if (!selectedItemId) return 'none';

  const resolvedItemId = isChoicePairingSurface(surface)
    ? resolveChoicePairingSelectedItemId({ items, selectedItemId })
    : surface === 'group-sort'
      ? resolveGroupSortSelectedItemId({ items, selectedItemId })
      : items.some((item) => item.id === selectedItemId)
        ? selectedItemId
        : undefined;

  return resolvedItemId ? 'valid' : 'stale';
}

function getStudentRuntimeChoiceAssignmentHandoffValue(
  id: StudentRuntimeChoiceAssignmentHandoffItemId,
  context: StudentRuntimeChoiceAssignmentContext
) {
  switch (id) {
    case 'template-type':
      return context.templateType;
    case 'runner-surface':
      return context.surface;
    case 'exclusive-surface-state':
      return isChoicePairingSurface(context.surface)
        ? m.student_runtime_choice_assignment_active_value()
        : m.student_runtime_choice_assignment_inactive_value();
    case 'group-placement-state':
      return context.surface === 'group-sort'
        ? m.student_runtime_choice_assignment_active_value()
        : m.student_runtime_choice_assignment_inactive_value();
    case 'choice-list-state':
      return context.surface === 'choice-list'
        ? m.student_runtime_choice_assignment_active_value()
        : m.student_runtime_choice_assignment_inactive_value();
    case 'normalized-choice-count':
      return formatStudentRuntimeChoiceAssignmentCount(
        context.uniqueChoiceCount
      );
    case 'duplicate-choice-count':
      return String(normalizeRuntimeDisplayCount(context.duplicateChoiceCount));
    case 'choice-key-normalization':
      return m.student_runtime_choice_assignment_normalized_key_value();
    case 'selected-item-state':
      return formatStudentRuntimeSelectedItemState(context.selectedItemState);
    case 'selected-item-validity':
      return context.selectedItemState === 'stale'
        ? m.student_runtime_choice_assignment_selection_cleared_value()
        : context.selectedItemState === 'valid'
          ? m.student_runtime_choice_assignment_selection_valid_value()
          : m.student_runtime_choice_assignment_selection_none_value();
    case 'selected-choice-owner':
      return context.hasChoiceOwner
        ? m.student_runtime_choice_assignment_choice_occupied_value()
        : context.hasSelectedChoice
          ? m.student_runtime_choice_assignment_choice_free_value()
          : m.student_runtime_choice_assignment_no_choice_value();
    case 'occupied-choice-count':
      return String(normalizeRuntimeDisplayCount(context.occupiedChoiceCount));
    case 'unassigned-choice-count':
      return String(
        normalizeRuntimeDisplayCount(context.unassignedChoiceCount)
      );
    case 'answer-change-contract':
      return isChoicePairingSurface(context.surface)
        ? m.student_runtime_choice_assignment_batched_changes_value()
        : m.student_runtime_choice_assignment_single_change_value();
    case 'exclusive-clear-change':
      return context.exclusiveClearCount > 0
        ? m.student_runtime_choice_assignment_previous_owner_cleared_value()
        : isChoicePairingSurface(context.surface)
          ? m.student_runtime_choice_assignment_no_previous_owner_value()
          : m.student_runtime_choice_assignment_not_applicable_value();
    case 'exclusive-set-change':
      if (isChoicePairingSurface(context.surface)) {
        return context.exclusiveChangeCount > 0
          ? m.student_runtime_choice_assignment_selected_prompt_set_value()
          : m.student_runtime_choice_assignment_wait_for_prompt_value();
      }

      return context.surface === 'group-sort'
        ? m.student_runtime_choice_assignment_group_placement_value()
        : m.student_runtime_choice_assignment_per_item_value();
    case 'disabled-action-policy':
      return context.disabled
        ? m.student_runtime_choice_assignment_actions_locked_value()
        : m.student_runtime_choice_assignment_actions_enabled_value();
    case 'no-selected-policy':
      return context.selectedItemState === 'valid'
        ? m.student_runtime_choice_assignment_ready_value()
        : isChoicePairingSurface(context.surface)
          ? m.student_runtime_choice_assignment_wait_for_prompt_value()
          : context.surface === 'group-sort'
            ? m.student_runtime_choice_assignment_wait_for_item_value()
            : m.student_runtime_choice_assignment_not_applicable_value();
    case 'stale-selection-policy':
      return context.selectedItemState === 'stale'
        ? m.student_runtime_choice_assignment_selection_cleared_value()
        : m.student_runtime_choice_assignment_selection_safe_value();
    case 'prompt-selection-toggle':
      return isChoicePairingSurface(context.surface)
        ? m.student_runtime_choice_assignment_prompt_toggle_value()
        : context.surface === 'group-sort'
          ? m.student_runtime_choice_assignment_item_toggle_value()
          : m.student_runtime_choice_assignment_not_applicable_value();
    case 'choice-action-boundary':
      return isChoicePairingSurface(context.surface)
        ? m.student_runtime_choice_assignment_choice_requires_prompt_value()
        : context.surface === 'choice-list'
          ? m.student_runtime_choice_assignment_choice_per_card_value()
          : m.student_runtime_choice_assignment_not_applicable_value();
    case 'group-action-boundary':
      return context.surface === 'group-sort'
        ? m.student_runtime_choice_assignment_group_requires_item_value()
        : m.student_runtime_choice_assignment_not_applicable_value();
    case 'group-clear-boundary':
      return context.surface === 'group-sort'
        ? context.selectedItemState === 'valid'
          ? m.student_runtime_choice_assignment_clear_available_value()
          : m.student_runtime_choice_assignment_clear_waiting_value()
        : m.student_runtime_choice_assignment_not_applicable_value();
    case 'normalized-answer-scope':
      return m.student_runtime_choice_assignment_runtime_items_only_value();
    case 'submission-contract':
      return STUDENT_RUNTIME_ANSWER_CONTRACT_VALUE;
    case 'public-payload-boundary':
      return m.student_runtime_choice_assignment_public_payload_value();
    case 'runtime-choice-text-guard':
      return m.student_runtime_choice_assignment_choice_text_hidden_value();
    case 'runtime-item-id-guard':
      return m.student_runtime_choice_assignment_item_ids_hidden_value();
    case 'answer-text-guard':
      return m.student_runtime_choice_assignment_answer_text_hidden_value();
    case 'privacy-guard':
      return m.student_runtime_choice_assignment_private_data_omitted_value();
  }
}

function getStudentRuntimeChoiceAssignmentHandoffLabel(
  id: StudentRuntimeChoiceAssignmentHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.student_runtime_choice_assignment_template_label();
    case 'runner-surface':
      return m.student_runtime_choice_assignment_surface_label();
    case 'exclusive-surface-state':
      return m.student_runtime_choice_assignment_exclusive_surface_label();
    case 'group-placement-state':
      return m.student_runtime_choice_assignment_group_state_label();
    case 'choice-list-state':
      return m.student_runtime_choice_assignment_choice_list_label();
    case 'normalized-choice-count':
      return m.student_runtime_choice_assignment_choice_count_label();
    case 'duplicate-choice-count':
      return m.student_runtime_choice_assignment_duplicate_choice_label();
    case 'choice-key-normalization':
      return m.student_runtime_choice_assignment_normalization_label();
    case 'selected-item-state':
      return m.student_runtime_choice_assignment_selected_item_label();
    case 'selected-item-validity':
      return m.student_runtime_choice_assignment_selection_validity_label();
    case 'selected-choice-owner':
      return m.student_runtime_choice_assignment_choice_owner_label();
    case 'occupied-choice-count':
      return m.student_runtime_choice_assignment_occupied_count_label();
    case 'unassigned-choice-count':
      return m.student_runtime_choice_assignment_unassigned_count_label();
    case 'answer-change-contract':
      return m.student_runtime_choice_assignment_change_contract_label();
    case 'exclusive-clear-change':
      return m.student_runtime_choice_assignment_clear_change_label();
    case 'exclusive-set-change':
      return m.student_runtime_choice_assignment_set_change_label();
    case 'disabled-action-policy':
      return m.student_runtime_choice_assignment_disabled_policy_label();
    case 'no-selected-policy':
      return m.student_runtime_choice_assignment_no_selected_policy_label();
    case 'stale-selection-policy':
      return m.student_runtime_choice_assignment_stale_policy_label();
    case 'prompt-selection-toggle':
      return m.student_runtime_choice_assignment_selection_toggle_label();
    case 'choice-action-boundary':
      return m.student_runtime_choice_assignment_choice_action_label();
    case 'group-action-boundary':
      return m.student_runtime_choice_assignment_group_action_label();
    case 'group-clear-boundary':
      return m.student_runtime_choice_assignment_group_clear_label();
    case 'normalized-answer-scope':
      return m.student_runtime_choice_assignment_answer_scope_label();
    case 'submission-contract':
      return m.student_runtime_choice_assignment_submission_contract_label();
    case 'public-payload-boundary':
      return m.student_runtime_choice_assignment_public_payload_label();
    case 'runtime-choice-text-guard':
      return m.student_runtime_choice_assignment_choice_text_guard_label();
    case 'runtime-item-id-guard':
      return m.student_runtime_choice_assignment_item_id_guard_label();
    case 'answer-text-guard':
      return m.student_runtime_choice_assignment_answer_text_guard_label();
    case 'privacy-guard':
      return m.student_runtime_choice_assignment_privacy_label();
  }
}

function getStudentRuntimeChoiceAssignmentHandoffDescription(
  id: StudentRuntimeChoiceAssignmentHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.student_runtime_choice_assignment_template_description();
    case 'runner-surface':
      return m.student_runtime_choice_assignment_surface_description();
    case 'exclusive-surface-state':
      return m.student_runtime_choice_assignment_exclusive_surface_description();
    case 'group-placement-state':
      return m.student_runtime_choice_assignment_group_state_description();
    case 'choice-list-state':
      return m.student_runtime_choice_assignment_choice_list_description();
    case 'normalized-choice-count':
      return m.student_runtime_choice_assignment_choice_count_description();
    case 'duplicate-choice-count':
      return m.student_runtime_choice_assignment_duplicate_choice_description();
    case 'choice-key-normalization':
      return m.student_runtime_choice_assignment_normalization_description();
    case 'selected-item-state':
      return m.student_runtime_choice_assignment_selected_item_description();
    case 'selected-item-validity':
      return m.student_runtime_choice_assignment_selection_validity_description();
    case 'selected-choice-owner':
      return m.student_runtime_choice_assignment_choice_owner_description();
    case 'occupied-choice-count':
      return m.student_runtime_choice_assignment_occupied_count_description();
    case 'unassigned-choice-count':
      return m.student_runtime_choice_assignment_unassigned_count_description();
    case 'answer-change-contract':
      return m.student_runtime_choice_assignment_change_contract_description();
    case 'exclusive-clear-change':
      return m.student_runtime_choice_assignment_clear_change_description();
    case 'exclusive-set-change':
      return m.student_runtime_choice_assignment_set_change_description();
    case 'disabled-action-policy':
      return m.student_runtime_choice_assignment_disabled_policy_description();
    case 'no-selected-policy':
      return m.student_runtime_choice_assignment_no_selected_policy_description();
    case 'stale-selection-policy':
      return m.student_runtime_choice_assignment_stale_policy_description();
    case 'prompt-selection-toggle':
      return m.student_runtime_choice_assignment_selection_toggle_description();
    case 'choice-action-boundary':
      return m.student_runtime_choice_assignment_choice_action_description();
    case 'group-action-boundary':
      return m.student_runtime_choice_assignment_group_action_description();
    case 'group-clear-boundary':
      return m.student_runtime_choice_assignment_group_clear_description();
    case 'normalized-answer-scope':
      return m.student_runtime_choice_assignment_answer_scope_description();
    case 'submission-contract':
      return m.student_runtime_choice_assignment_submission_contract_description();
    case 'public-payload-boundary':
      return m.student_runtime_choice_assignment_public_payload_description();
    case 'runtime-choice-text-guard':
      return m.student_runtime_choice_assignment_choice_text_guard_description();
    case 'runtime-item-id-guard':
      return m.student_runtime_choice_assignment_item_id_guard_description();
    case 'answer-text-guard':
      return m.student_runtime_choice_assignment_answer_text_guard_description();
    case 'privacy-guard':
      return m.student_runtime_choice_assignment_privacy_description();
  }
}

function buildStudentRuntimeChoiceAssignmentHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  StudentRuntimeChoiceAssignmentHandoffItemView,
  'ariaLabel'
>): StudentRuntimeChoiceAssignmentHandoffItemView {
  return {
    ariaLabel: m.student_runtime_choice_assignment_handoff_item_aria({
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

function buildStudentRuntimeChoiceAssignmentHandoffPrivacyContract({
  itemViews,
  surface,
  templateType,
}: {
  itemViews: StudentRuntimeChoiceAssignmentHandoffItemView[];
  surface: StudentRuntimeChoiceAssignmentSurface;
  templateType: ActivityTemplateType;
}): StudentRuntimeChoiceAssignmentHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesRawChoiceOwnerItemId: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    itemIds: itemViews.map((item) => item.id),
    runnerSurface: surface,
    scope: 'student-runtime-choice-assignment',
    templateType,
    usesNormalizedChoiceKeys: true,
    usesSharedSubmissionContract: true,
  };
}

function countDuplicateRuntimeChoices({
  choices,
  items,
}: {
  choices: string[];
  items: PublicRuntimeItem[];
}) {
  const rawChoiceCount = items.reduce(
    (total, item) => total + (item.choices?.length ?? 0),
    0
  );
  return Math.max(0, rawChoiceCount - choices.length);
}

function countOccupiedRuntimeChoices({
  answers,
  choices,
}: {
  answers: StudentAnswerMap;
  choices: string[];
}) {
  return choices.filter((choice) => findChoiceOwner(answers, choice)).length;
}

function formatStudentRuntimeChoiceAssignmentCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);
  return normalizedCount === 1
    ? m.student_runtime_choice_assignment_choice_count_one({
        count: normalizedCount,
      })
    : m.student_runtime_choice_assignment_choice_count_many({
        count: normalizedCount,
      });
}

function formatStudentRuntimeSelectedItemState(
  state: StudentRuntimeChoiceAssignmentContext['selectedItemState']
) {
  if (state === 'valid') {
    return m.student_runtime_choice_assignment_selected_valid_value();
  }

  if (state === 'stale') {
    return m.student_runtime_choice_assignment_selected_stale_value();
  }

  return m.student_runtime_choice_assignment_selected_none_value();
}

function isChoicePairingSurface(
  surface: StudentRuntimeChoiceAssignmentSurface
) {
  return surface === 'line-match' || surface === 'matching-pairs';
}
