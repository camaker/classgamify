import {
  getActivityTemplateRunnerKind,
  type ActivityTemplateRunnerKind,
} from '@/activities/runtime';
import { getTemplateByType } from '@/activities/catalog';
import { normalizeListeningSpeechLanguage } from '@/activities/listening-speech';
import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import type { ActivityTemplateType } from '@/activities/types';
import type { ActivityRunnerCopy } from '@/activities/runner-copy';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { normalizeRuntimeChoiceList } from '@/assignments/runtime-display';
import {
  buildDefaultRuntimeItemCardViews,
  type DefaultRuntimeItemCardView,
} from '@/assignments/student-runner-view';
import {
  buildStudentAnswerChanges,
  type StudentAnswerChange,
} from '@/assignments/student-submission';
import { m } from '@/locale/paraglide/messages';

export type { StudentAnswerChange };

export type StudentRuntimeItemListSurface = ActivityTemplateRunnerKind;

const STUDENT_RUNTIME_ANSWER_CONTRACT_VALUE = '{ itemId, answer }';

export const STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'runner-title',
  'runtime-items',
  'runtime-kind-summary',
  'choice-count',
  'choice-list-renderer',
  'line-match-renderer',
  'fill-blank-renderer',
  'open-box-renderer',
  'listening-renderer',
  'listening-language',
  'group-sort-renderer',
  'matching-pairs-renderer',
  'answer-contract',
  'answer-change-contract',
  'selection-scope',
  'review-feedback',
  'disabled-state',
  'privacy-guard',
] as const;

export type StudentRuntimeInteractionHandoffItemId =
  (typeof STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS)[number];

export type StudentRuntimeInteractionHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRuntimeInteractionHandoffItemId;
  label: string;
  value: string;
};

export type StudentRuntimeInteractionHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesStudentNames: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: StudentRuntimeInteractionHandoffItemId[];
  runnerSurface: StudentRuntimeItemListSurface;
  templateType: ActivityTemplateType;
};

export type StudentRuntimeInteractionHandoffView = {
  description: string;
  itemViews: StudentRuntimeInteractionHandoffItemView[];
  privacy: StudentRuntimeInteractionHandoffPrivacyContract;
  title: string;
};

export type StudentRuntimeItemListView = {
  defaultItemCardViews: DefaultRuntimeItemCardView[];
  interactionHandoffView: StudentRuntimeInteractionHandoffView;
  runnerCopy: ActivityRunnerCopy;
  surface: StudentRuntimeItemListSurface;
};

export function buildStudentRuntimeItemListView({
  answers,
  disabled = false,
  items,
  language,
  revealAnswer = false,
  reviewItems,
  templateType,
}: {
  answers: Record<string, string>;
  disabled?: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  templateType: ActivityTemplateType;
}): StudentRuntimeItemListView {
  const surface = getActivityTemplateRunnerKind(templateType);
  const runnerCopy = getActivityTemplateRunnerCopy(templateType);
  const defaultItemCardViews = buildDefaultRuntimeItemCardViews({
    answers,
    correctAnswerLabel: runnerCopy.correctAnswerLabel,
    inputPlaceholder: runnerCopy.inputPlaceholder,
    items,
    progressVerb: runnerCopy.progressVerb,
    reviewItems,
  });

  return {
    defaultItemCardViews,
    interactionHandoffView: buildStudentRuntimeInteractionHandoffView({
      disabled,
      items,
      language,
      revealAnswer,
      runnerCopy,
      surface,
      templateType,
    }),
    runnerCopy,
    surface,
  };
}

export function buildStudentRuntimeInteractionHandoffView({
  disabled = false,
  items,
  language,
  revealAnswer = false,
  runnerCopy,
  surface,
  templateType,
}: {
  disabled?: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  revealAnswer?: boolean;
  runnerCopy: ActivityRunnerCopy;
  surface: StudentRuntimeItemListSurface;
  templateType: ActivityTemplateType;
}): StudentRuntimeInteractionHandoffView {
  const itemViews = STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRuntimeInteractionHandoffItemView(
      buildStudentRuntimeInteractionHandoffItem({
        disabled,
        id,
        items,
        language,
        revealAnswer,
        runnerCopy,
        surface,
        templateType,
      })
    )
  );

  return {
    description: m.student_runtime_interaction_handoff_description(),
    itemViews,
    privacy: buildStudentRuntimeInteractionHandoffPrivacyContract({
      itemViews,
      surface,
      templateType,
    }),
    title: m.student_runtime_interaction_handoff_title(),
  };
}

export function buildStudentRuntimeSingleAnswerChanges({
  answer,
  itemId,
}: {
  answer: string;
  itemId: string;
}): StudentAnswerChange[] {
  return buildStudentAnswerChanges({ answer, itemId });
}

function buildStudentRuntimeInteractionHandoffItem({
  disabled,
  id,
  items,
  language,
  revealAnswer,
  runnerCopy,
  surface,
  templateType,
}: {
  disabled: boolean;
  id: StudentRuntimeInteractionHandoffItemId;
  items: PublicRuntimeItem[];
  language?: string;
  revealAnswer: boolean;
  runnerCopy: ActivityRunnerCopy;
  surface: StudentRuntimeItemListSurface;
  templateType: ActivityTemplateType;
}): Omit<StudentRuntimeInteractionHandoffItemView, 'ariaLabel'> {
  if (id === 'template-type') {
    return {
      description: m.student_runtime_interaction_handoff_template_description(),
      id,
      label: m.student_runtime_interaction_handoff_template_label(),
      value: getTemplateByType(templateType).name,
    };
  }

  if (id === 'runner-surface') {
    return {
      description: m.student_runtime_interaction_handoff_surface_description(),
      id,
      label: m.student_runtime_interaction_handoff_surface_label(),
      value: surface,
    };
  }

  if (id === 'runner-title') {
    return {
      description: m.student_runtime_interaction_handoff_title_description(),
      id,
      label: m.student_runtime_interaction_handoff_title_label(),
      value: runnerCopy.title,
    };
  }

  if (id === 'runtime-items') {
    return {
      description:
        m.student_runtime_interaction_handoff_runtime_items_description(),
      id,
      label: m.create_page_template_entry_runtime_items_label(),
      value: m.create_page_template_entry_runtime_items_value({
        count: items.length,
      }),
    };
  }

  if (id === 'runtime-kind-summary') {
    return {
      description:
        m.student_runtime_interaction_handoff_runtime_kind_description(),
      id,
      label: m.student_runtime_interaction_handoff_runtime_kind_label(),
      value: formatStudentRuntimeKindSummary(items),
    };
  }

  if (id === 'choice-count') {
    return {
      description: m.student_runtime_interaction_handoff_choices_description(),
      id,
      label: m.student_runtime_interaction_handoff_choices_label(),
      value: m.student_runtime_interaction_handoff_choices_value({
        count: countStudentRuntimeChoices(items),
      }),
    };
  }

  if (id === 'choice-list-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description:
        m.student_runtime_interaction_handoff_choice_list_description(),
      id,
      label: m.activity_runner_choice_activity_title(),
      surface,
      targetSurface: 'choice-list',
    });
  }

  if (id === 'line-match-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description:
        m.student_runtime_interaction_handoff_line_match_description(),
      id,
      label: m.activity_runner_line_match_title(),
      surface,
      targetSurface: 'line-match',
    });
  }

  if (id === 'fill-blank-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description:
        m.student_runtime_interaction_handoff_fill_blank_description(),
      id,
      label: m.activity_runner_fill_blanks_title(),
      surface,
      targetSurface: 'fill-blank',
    });
  }

  if (id === 'open-box-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description: m.student_runtime_interaction_handoff_open_box_description(),
      id,
      label: m.activity_runner_open_box_title(),
      surface,
      targetSurface: 'open-box',
    });
  }

  if (id === 'listening-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description:
        m.student_runtime_interaction_handoff_listening_description(),
      id,
      label: m.activity_runner_listening_title(),
      surface,
      targetSurface: 'listening',
    });
  }

  if (id === 'listening-language') {
    return {
      description:
        m.student_runtime_interaction_handoff_listening_language_description(),
      id,
      label: m.activity_runner_listening_language_label(),
      value:
        surface === 'listening'
          ? (normalizeListeningSpeechLanguage(language) ??
            m.activity_runner_listening_language_unknown())
          : m.student_runtime_interaction_handoff_not_applicable_value(),
    };
  }

  if (id === 'group-sort-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description:
        m.student_runtime_interaction_handoff_group_sort_description(),
      id,
      label: m.activity_runner_group_sort_title(),
      surface,
      targetSurface: 'group-sort',
    });
  }

  if (id === 'matching-pairs-renderer') {
    return buildStudentRuntimeRendererHandoffItem({
      description:
        m.student_runtime_interaction_handoff_matching_pairs_description(),
      id,
      label: m.activity_runner_matching_pairs_title(),
      surface,
      targetSurface: 'matching-pairs',
    });
  }

  if (id === 'answer-contract') {
    return {
      description:
        m.student_runtime_interaction_handoff_answer_contract_description(),
      id,
      label: m.student_runtime_interaction_handoff_answer_contract_label(),
      value: STUDENT_RUNTIME_ANSWER_CONTRACT_VALUE,
    };
  }

  if (id === 'answer-change-contract') {
    return {
      description:
        m.student_runtime_interaction_handoff_answer_change_description(),
      id,
      label: m.student_runtime_interaction_handoff_answer_change_label(),
      value: formatStudentRuntimeAnswerChangeContract(surface),
    };
  }

  if (id === 'selection-scope') {
    return {
      description:
        m.student_runtime_interaction_handoff_selection_scope_description(),
      id,
      label: m.student_runtime_interaction_handoff_selection_scope_label(),
      value: formatStudentRuntimeSelectionScope(surface),
    };
  }

  if (id === 'review-feedback') {
    return {
      description:
        m.student_runtime_interaction_handoff_review_feedback_description(),
      id,
      label: m.student_runtime_interaction_handoff_review_feedback_label(),
      value: revealAnswer
        ? m.student_runtime_interaction_handoff_review_visible_value()
        : m.student_runtime_interaction_handoff_review_hidden_value(),
    };
  }

  if (id === 'disabled-state') {
    return {
      description: m.student_runtime_interaction_handoff_disabled_description(),
      id,
      label: m.student_runtime_interaction_handoff_disabled_label(),
      value: disabled
        ? m.student_runtime_interaction_handoff_disabled_value()
        : m.student_runtime_interaction_handoff_enabled_value(),
    };
  }

  return {
    description: m.student_runtime_interaction_handoff_privacy_description(),
    id,
    label: m.student_runtime_interaction_handoff_privacy_label(),
    value: m.student_runtime_interaction_handoff_private_omitted_value(),
  };
}

function buildStudentRuntimeRendererHandoffItem({
  description,
  id,
  label,
  surface,
  targetSurface,
}: {
  description: string;
  id: StudentRuntimeInteractionHandoffItemId;
  label: string;
  surface: StudentRuntimeItemListSurface;
  targetSurface: StudentRuntimeItemListSurface;
}): Omit<StudentRuntimeInteractionHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value:
      surface === targetSurface
        ? m.student_runtime_interaction_handoff_active_value()
        : m.student_runtime_interaction_handoff_inactive_value(),
  };
}

function buildStudentRuntimeInteractionHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  StudentRuntimeInteractionHandoffItemView,
  'ariaLabel'
>): StudentRuntimeInteractionHandoffItemView {
  return {
    ariaLabel: m.student_runtime_interaction_handoff_item_aria({
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

function buildStudentRuntimeInteractionHandoffPrivacyContract({
  itemViews,
  surface,
  templateType,
}: {
  itemViews: StudentRuntimeInteractionHandoffItemView[];
  surface: StudentRuntimeItemListSurface;
  templateType: ActivityTemplateType;
}): StudentRuntimeInteractionHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesStudentNames: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    runnerSurface: surface,
    templateType,
  };
}

function countStudentRuntimeChoices(items: PublicRuntimeItem[]) {
  return (
    normalizeRuntimeChoiceList(items.flatMap((item) => item.choices ?? []))
      ?.length ?? 0
  );
}

function formatStudentRuntimeKindSummary(items: PublicRuntimeItem[]) {
  const counts = countStudentRuntimeItemKinds(items);

  return m.student_runtime_interaction_handoff_runtime_kind_value({
    groupItems: counts.groupItem,
    pairs: counts.pair,
    questions: counts.question,
  });
}

function countStudentRuntimeItemKinds(items: PublicRuntimeItem[]) {
  const counts = {
    groupItem: 0,
    pair: 0,
    question: 0,
  };

  for (const item of items) {
    if (item.kind === 'group-item') {
      counts.groupItem += 1;
    } else {
      counts[item.kind] += 1;
    }
  }

  return counts;
}

function formatStudentRuntimeAnswerChangeContract(
  surface: StudentRuntimeItemListSurface
) {
  return surface === 'line-match' || surface === 'matching-pairs'
    ? m.student_runtime_interaction_handoff_answer_change_batch_value()
    : m.student_runtime_interaction_handoff_answer_change_single_value();
}

function formatStudentRuntimeSelectionScope(
  surface: StudentRuntimeItemListSurface
) {
  if (surface === 'line-match' || surface === 'matching-pairs') {
    return m.student_runtime_interaction_handoff_selection_pair_value();
  }

  if (surface === 'group-sort') {
    return m.student_runtime_interaction_handoff_selection_group_value();
  }

  if (surface === 'listening' || surface === 'open-box') {
    return m.student_runtime_interaction_handoff_selection_sequence_value();
  }

  return m.student_runtime_interaction_handoff_selection_item_value();
}
