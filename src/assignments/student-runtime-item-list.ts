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
import {
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
} from '@/assignments/runtime-display';
import {
  buildStudentRuntimeIdentityHandoffView,
  type StudentRuntimeIdentityHandoffItemId,
  type StudentRuntimeIdentityHandoffItemView,
  type StudentRuntimeIdentityHandoffView,
} from '@/assignments/runtime-identity-handoff';
import {
  buildStudentRuntimeChoiceAssignmentHandoffView,
  type StudentRuntimeChoiceAssignmentHandoffItemId,
  type StudentRuntimeChoiceAssignmentHandoffItemView,
  type StudentRuntimeChoiceAssignmentHandoffView,
} from '@/assignments/runtime-choice-assignment-handoff';
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
const STUDENT_RUNTIME_RENDERER_SURFACES = [
  'choice-list',
  'line-match',
  'fill-blank',
  'open-box',
  'listening',
  'group-sort',
  'matching-pairs',
] satisfies StudentRuntimeItemListSurface[];

export const STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'renderer-surface-count',
  'renderer-dispatch-boundary',
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
  'submission-payload-boundary',
  'selection-scope',
  'review-feedback',
  'review-item-count',
  'feedback-data-boundary',
  'disabled-state',
  'public-payload-boundary',
  'runtime-id-boundary',
  'prompt-text-boundary',
  'choice-text-boundary',
  'answer-text-boundary',
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
  scope: 'public-student-runtime-interaction';
  templateType: ActivityTemplateType;
};

export type StudentRuntimeInteractionHandoffView = {
  description: string;
  itemViews: StudentRuntimeInteractionHandoffItemView[];
  privacy: StudentRuntimeInteractionHandoffPrivacyContract;
  title: string;
};

export const STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS = [
  'interaction-template-type',
  'interaction-runner-surface',
  'interaction-renderer-dispatch',
  'interaction-runtime-items',
  'interaction-kind-summary',
  'interaction-answer-contract',
  'interaction-selection-scope',
  'interaction-review-feedback',
  'interaction-disabled-state',
  'interaction-privacy-guard',
  'choice-runner-surface',
  'choice-exclusive-state',
  'choice-group-placement',
  'choice-choice-list',
  'choice-normalized-count',
  'choice-selected-state',
  'choice-answer-change-contract',
  'choice-normalized-answer-scope',
  'choice-public-payload',
  'choice-privacy-guard',
  'identity-template-type',
  'identity-runner-surface',
  'identity-runtime-count',
  'identity-normalized-id-count',
  'identity-unique-id-status',
  'identity-collision-guard',
  'identity-submission-validation',
  'identity-public-payload',
  'identity-snapshot-boundary',
  'identity-privacy-guard',
] as const;

export type StudentRuntimeSemanticBundleHandoffItemId =
  (typeof STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS)[number];

export type StudentRuntimeSemanticBundleHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRuntimeSemanticBundleHandoffItemId;
  label: string;
  sourceItemId:
    | StudentRuntimeChoiceAssignmentHandoffItemId
    | StudentRuntimeIdentityHandoffItemId
    | StudentRuntimeInteractionHandoffItemId;
  sourceScope: StudentRuntimeSemanticBundleSourceScope;
  value: string;
};

export type StudentRuntimeSemanticBundleSourceScope =
  | 'choice-assignment'
  | 'identity'
  | 'interaction';

export type StudentRuntimeSemanticBundleHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesAnonymousToken: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentNames: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: StudentRuntimeSemanticBundleHandoffItemId[];
  sourceScopes: StudentRuntimeSemanticBundleSourceScope[];
  scope: 'public-student-runtime-semantic-bundle';
  templateType: ActivityTemplateType;
};

export type StudentRuntimeSemanticBundleHandoffView = {
  description: string;
  itemViews: StudentRuntimeSemanticBundleHandoffItemView[];
  privacy: StudentRuntimeSemanticBundleHandoffPrivacyContract;
  title: string;
};

export type StudentRuntimeItemListView = {
  defaultItemCardViews: DefaultRuntimeItemCardView[];
  interactionHandoffView: StudentRuntimeInteractionHandoffView;
  runtimeChoiceAssignmentHandoffView: StudentRuntimeChoiceAssignmentHandoffView;
  runtimeIdentityHandoffView: StudentRuntimeIdentityHandoffView;
  semanticBundleHandoffView: StudentRuntimeSemanticBundleHandoffView;
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
  const interactionHandoffView = buildStudentRuntimeInteractionHandoffView({
    disabled,
    items,
    language,
    revealAnswer,
    reviewItems,
    runnerCopy,
    surface,
    templateType,
  });
  const runtimeChoiceAssignmentHandoffView =
    buildStudentRuntimeChoiceAssignmentHandoffView({
      answers,
      disabled,
      items,
      surface,
      templateType,
    });
  const runtimeIdentityHandoffView = buildStudentRuntimeIdentityHandoffView({
    items,
    templateType,
  });

  return {
    defaultItemCardViews,
    interactionHandoffView,
    runtimeChoiceAssignmentHandoffView,
    runtimeIdentityHandoffView,
    runnerCopy,
    semanticBundleHandoffView: buildStudentRuntimeSemanticBundleHandoffView({
      interactionHandoffView,
      runtimeChoiceAssignmentHandoffView,
      runtimeIdentityHandoffView,
      templateType,
    }),
    surface,
  };
}

function buildStudentRuntimeInteractionHandoffView({
  disabled = false,
  items,
  language,
  revealAnswer = false,
  reviewItems,
  runnerCopy,
  surface,
  templateType,
}: {
  disabled?: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
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
        reviewItems,
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

function buildStudentRuntimeSemanticBundleHandoffView({
  interactionHandoffView,
  runtimeChoiceAssignmentHandoffView,
  runtimeIdentityHandoffView,
  templateType,
}: {
  interactionHandoffView: StudentRuntimeInteractionHandoffView;
  runtimeChoiceAssignmentHandoffView: StudentRuntimeChoiceAssignmentHandoffView;
  runtimeIdentityHandoffView: StudentRuntimeIdentityHandoffView;
  templateType: ActivityTemplateType;
}): StudentRuntimeSemanticBundleHandoffView {
  const context = {
    interactionHandoffView,
    runtimeChoiceAssignmentHandoffView,
    runtimeIdentityHandoffView,
  };
  const itemViews = STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRuntimeSemanticBundleHandoffItemView(id, context)
  );

  return {
    description: [
      interactionHandoffView.description,
      runtimeChoiceAssignmentHandoffView.description,
      runtimeIdentityHandoffView.description,
    ].join(' '),
    itemViews,
    privacy: buildStudentRuntimeSemanticBundleHandoffPrivacyContract({
      itemViews,
      templateType,
    }),
    title: [
      interactionHandoffView.title,
      runtimeChoiceAssignmentHandoffView.title,
      runtimeIdentityHandoffView.title,
    ].join(' / '),
  };
}

type StudentRuntimeSemanticBundleSourceItem =
  | StudentRuntimeChoiceAssignmentHandoffItemView
  | StudentRuntimeIdentityHandoffItemView
  | StudentRuntimeInteractionHandoffItemView;

type StudentRuntimeSemanticBundleBuildContext = {
  interactionHandoffView: StudentRuntimeInteractionHandoffView;
  runtimeChoiceAssignmentHandoffView: StudentRuntimeChoiceAssignmentHandoffView;
  runtimeIdentityHandoffView: StudentRuntimeIdentityHandoffView;
};

function buildStudentRuntimeSemanticBundleHandoffItemView(
  id: StudentRuntimeSemanticBundleHandoffItemId,
  context: StudentRuntimeSemanticBundleBuildContext
): StudentRuntimeSemanticBundleHandoffItemView {
  const source = getStudentRuntimeSemanticBundleSource(id);
  const sourceItem = getStudentRuntimeSemanticBundleSourceItem({
    context,
    sourceItemId: source.sourceItemId,
    sourceScope: source.sourceScope,
  });

  return {
    ariaLabel: m.student_runtime_interaction_handoff_item_aria({
      description: sourceItem.description,
      label: sourceItem.label,
      value: sourceItem.value,
    }),
    description: sourceItem.description,
    id,
    label: sourceItem.label,
    sourceItemId: source.sourceItemId,
    sourceScope: source.sourceScope,
    value: sourceItem.value,
  };
}

function getStudentRuntimeSemanticBundleSource(
  id: StudentRuntimeSemanticBundleHandoffItemId
): {
  sourceItemId:
    | StudentRuntimeChoiceAssignmentHandoffItemId
    | StudentRuntimeIdentityHandoffItemId
    | StudentRuntimeInteractionHandoffItemId;
  sourceScope: StudentRuntimeSemanticBundleSourceScope;
} {
  switch (id) {
    case 'interaction-template-type':
      return { sourceItemId: 'template-type', sourceScope: 'interaction' };
    case 'interaction-runner-surface':
      return { sourceItemId: 'runner-surface', sourceScope: 'interaction' };
    case 'interaction-renderer-dispatch':
      return {
        sourceItemId: 'renderer-dispatch-boundary',
        sourceScope: 'interaction',
      };
    case 'interaction-runtime-items':
      return { sourceItemId: 'runtime-items', sourceScope: 'interaction' };
    case 'interaction-kind-summary':
      return {
        sourceItemId: 'runtime-kind-summary',
        sourceScope: 'interaction',
      };
    case 'interaction-answer-contract':
      return { sourceItemId: 'answer-contract', sourceScope: 'interaction' };
    case 'interaction-selection-scope':
      return { sourceItemId: 'selection-scope', sourceScope: 'interaction' };
    case 'interaction-review-feedback':
      return { sourceItemId: 'review-feedback', sourceScope: 'interaction' };
    case 'interaction-disabled-state':
      return { sourceItemId: 'disabled-state', sourceScope: 'interaction' };
    case 'interaction-privacy-guard':
      return { sourceItemId: 'privacy-guard', sourceScope: 'interaction' };
    case 'choice-runner-surface':
      return {
        sourceItemId: 'runner-surface',
        sourceScope: 'choice-assignment',
      };
    case 'choice-exclusive-state':
      return {
        sourceItemId: 'exclusive-surface-state',
        sourceScope: 'choice-assignment',
      };
    case 'choice-group-placement':
      return {
        sourceItemId: 'group-placement-state',
        sourceScope: 'choice-assignment',
      };
    case 'choice-choice-list':
      return {
        sourceItemId: 'choice-list-state',
        sourceScope: 'choice-assignment',
      };
    case 'choice-normalized-count':
      return {
        sourceItemId: 'normalized-choice-count',
        sourceScope: 'choice-assignment',
      };
    case 'choice-selected-state':
      return {
        sourceItemId: 'selected-item-state',
        sourceScope: 'choice-assignment',
      };
    case 'choice-answer-change-contract':
      return {
        sourceItemId: 'answer-change-contract',
        sourceScope: 'choice-assignment',
      };
    case 'choice-normalized-answer-scope':
      return {
        sourceItemId: 'normalized-answer-scope',
        sourceScope: 'choice-assignment',
      };
    case 'choice-public-payload':
      return {
        sourceItemId: 'public-payload-boundary',
        sourceScope: 'choice-assignment',
      };
    case 'choice-privacy-guard':
      return {
        sourceItemId: 'privacy-guard',
        sourceScope: 'choice-assignment',
      };
    case 'identity-template-type':
      return { sourceItemId: 'template-type', sourceScope: 'identity' };
    case 'identity-runner-surface':
      return { sourceItemId: 'runner-surface', sourceScope: 'identity' };
    case 'identity-runtime-count':
      return { sourceItemId: 'runtime-item-count', sourceScope: 'identity' };
    case 'identity-normalized-id-count':
      return {
        sourceItemId: 'normalized-runtime-id-count',
        sourceScope: 'identity',
      };
    case 'identity-unique-id-status':
      return {
        sourceItemId: 'unique-runtime-id-status',
        sourceScope: 'identity',
      };
    case 'identity-collision-guard':
      return {
        sourceItemId: 'multilingual-id-collision-guard',
        sourceScope: 'identity',
      };
    case 'identity-submission-validation':
      return {
        sourceItemId: 'submission-validation-boundary',
        sourceScope: 'identity',
      };
    case 'identity-public-payload':
      return {
        sourceItemId: 'public-payload-boundary',
        sourceScope: 'identity',
      };
    case 'identity-snapshot-boundary':
      return {
        sourceItemId: 'assignment-snapshot-boundary',
        sourceScope: 'identity',
      };
    case 'identity-privacy-guard':
      return { sourceItemId: 'privacy-guard', sourceScope: 'identity' };
  }
}

function getStudentRuntimeSemanticBundleSourceItem({
  context,
  sourceItemId,
  sourceScope,
}: {
  context: StudentRuntimeSemanticBundleBuildContext;
  sourceItemId:
    | StudentRuntimeChoiceAssignmentHandoffItemId
    | StudentRuntimeIdentityHandoffItemId
    | StudentRuntimeInteractionHandoffItemId;
  sourceScope: StudentRuntimeSemanticBundleSourceScope;
}): StudentRuntimeSemanticBundleSourceItem {
  const itemViews =
    sourceScope === 'interaction'
      ? context.interactionHandoffView.itemViews
      : sourceScope === 'choice-assignment'
        ? context.runtimeChoiceAssignmentHandoffView.itemViews
        : context.runtimeIdentityHandoffView.itemViews;
  const sourceItem = itemViews.find((itemView) => itemView.id === sourceItemId);

  if (!sourceItem) {
    throw new Error(
      `Missing student runtime semantic bundle source item: ${sourceScope}:${sourceItemId}`
    );
  }

  return sourceItem;
}

function buildStudentRuntimeSemanticBundleHandoffPrivacyContract({
  itemViews,
  templateType,
}: {
  itemViews: StudentRuntimeSemanticBundleHandoffItemView[];
  templateType: ActivityTemplateType;
}): StudentRuntimeSemanticBundleHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesAnonymousToken: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentNames: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    scope: 'public-student-runtime-semantic-bundle',
    sourceScopes: [...new Set(itemViews.map((item) => item.sourceScope))],
    templateType,
  };
}

function buildStudentRuntimeInteractionHandoffItem({
  disabled,
  id,
  items,
  language,
  revealAnswer,
  reviewItems,
  runnerCopy,
  surface,
  templateType,
}: {
  disabled: boolean;
  id: StudentRuntimeInteractionHandoffItemId;
  items: PublicRuntimeItem[];
  language?: string;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
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

  if (id === 'renderer-surface-count') {
    return {
      description:
        m.student_runtime_interaction_handoff_renderer_surface_count_description(),
      id,
      label:
        m.student_runtime_interaction_handoff_renderer_surface_count_label(),
      value: m.student_runtime_interaction_handoff_renderer_surface_count_value(
        {
          count: STUDENT_RUNTIME_RENDERER_SURFACES.length,
        }
      ),
    };
  }

  if (id === 'renderer-dispatch-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_renderer_dispatch_description(),
      id,
      label: m.student_runtime_interaction_handoff_renderer_dispatch_label(),
      value: m.student_runtime_interaction_handoff_renderer_dispatch_value(),
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

  if (id === 'submission-payload-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_submission_payload_description(),
      id,
      label: m.student_runtime_interaction_handoff_submission_payload_label(),
      value: m.student_runtime_interaction_handoff_submission_payload_value(),
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

  if (id === 'review-item-count') {
    return {
      description:
        m.student_runtime_interaction_handoff_review_item_count_description(),
      id,
      label: m.student_runtime_interaction_handoff_review_item_count_label(),
      value: formatStudentRuntimeReviewItemCount(reviewItems),
    };
  }

  if (id === 'feedback-data-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_feedback_data_description(),
      id,
      label: m.student_runtime_interaction_handoff_feedback_data_label(),
      value: m.student_runtime_interaction_handoff_feedback_data_value(),
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

  if (id === 'public-payload-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_public_payload_description(),
      id,
      label: m.student_runtime_interaction_handoff_public_payload_label(),
      value: m.student_runtime_interaction_handoff_public_payload_value(),
    };
  }

  if (id === 'runtime-id-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_runtime_id_boundary_description(),
      id,
      label: m.student_runtime_interaction_handoff_runtime_id_boundary_label(),
      value: m.student_runtime_interaction_handoff_runtime_id_boundary_value(),
    };
  }

  if (id === 'prompt-text-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_prompt_text_boundary_description(),
      id,
      label: m.student_runtime_interaction_handoff_prompt_text_boundary_label(),
      value: m.student_runtime_interaction_handoff_prompt_text_boundary_value(),
    };
  }

  if (id === 'choice-text-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_choice_text_boundary_description(),
      id,
      label: m.student_runtime_interaction_handoff_choice_text_boundary_label(),
      value: m.student_runtime_interaction_handoff_choice_text_boundary_value(),
    };
  }

  if (id === 'answer-text-boundary') {
    return {
      description:
        m.student_runtime_interaction_handoff_answer_text_boundary_description(),
      id,
      label: m.student_runtime_interaction_handoff_answer_text_boundary_label(),
      value: m.student_runtime_interaction_handoff_answer_text_boundary_value(),
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
    scope: 'public-student-runtime-interaction',
    templateType,
  };
}

function countStudentRuntimeChoices(items: PublicRuntimeItem[]) {
  return (
    normalizeRuntimeChoiceList(items.flatMap((item) => item.choices ?? []))
      ?.length ?? 0
  );
}

function formatStudentRuntimeReviewItemCount(
  reviewItems: PublicAttemptReviewItem[] | undefined
) {
  const count = normalizeRuntimeDisplayCount(reviewItems?.length ?? 0, {
    min: 0,
  });

  if (count === 1) {
    return m.student_runtime_interaction_handoff_review_item_count_one({
      count,
    });
  }

  return m.student_runtime_interaction_handoff_review_item_count_many({
    count,
  });
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
