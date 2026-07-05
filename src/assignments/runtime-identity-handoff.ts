import {
  getActivityTemplateRunnerKind,
  type ActivityTemplateRunnerKind,
} from '@/activities/runtime';
import { getTemplateByType } from '@/activities/catalog';
import type { ActivityTemplateType } from '@/activities/types';
import { getAttemptAnswerRuntimeItemEntries } from '@/assignments/attempt-answers';
import type { PublicRuntimeItem } from '@/assignments/public';
import {
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
} from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

const STUDENT_RUNTIME_IDENTITY_ANSWER_CONTRACT_VALUE = '{ itemId, answer }';

export const STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'runtime-item-count',
  'normalized-runtime-id-count',
  'unique-runtime-id-status',
  'duplicate-runtime-id-count',
  'blank-runtime-id-count',
  'question-count',
  'pair-count',
  'group-item-count',
  'choice-count',
  'submission-contract',
  'browser-answer-boundary',
  'scoring-lookup-boundary',
  'teacher-results-boundary',
  'public-payload-boundary',
  'prompt-choice-boundary',
  'answer-text-boundary',
  'source-material-boundary',
  'privacy-guard',
] as const;

export type StudentRuntimeIdentityHandoffItemId =
  (typeof STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS)[number];

export type StudentRuntimeIdentityHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRuntimeIdentityHandoffItemId;
  label: string;
  value: string;
};

export type StudentRuntimeIdentityHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  itemIds: StudentRuntimeIdentityHandoffItemId[];
  normalizedRuntimeIdCount: number;
  runtimeItemCount: number;
  runtimeIdsUnique: boolean;
  runnerSurface: ActivityTemplateRunnerKind;
  templateType: ActivityTemplateType;
};

export type StudentRuntimeIdentityHandoffView = {
  description: string;
  itemViews: StudentRuntimeIdentityHandoffItemView[];
  privacy: StudentRuntimeIdentityHandoffPrivacyContract;
  title: string;
};

type StudentRuntimeIdentitySummary = {
  blankRuntimeIdCount: number;
  choiceCount: number;
  duplicateRuntimeIdCount: number;
  groupItemCount: number;
  normalizedRuntimeIdCount: number;
  pairCount: number;
  questionCount: number;
  runtimeIdsUnique: boolean;
  runtimeItemCount: number;
};

export function buildStudentRuntimeIdentityHandoffView({
  items,
  templateType,
}: {
  items: PublicRuntimeItem[];
  templateType: ActivityTemplateType;
}): StudentRuntimeIdentityHandoffView {
  const runnerSurface = getActivityTemplateRunnerKind(templateType);
  const summary = summarizeStudentRuntimeIdentity(items);
  const itemViews = STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRuntimeIdentityHandoffItemView(
      buildStudentRuntimeIdentityHandoffItem({
        id,
        runnerSurface,
        summary,
        templateType,
      })
    )
  );

  return {
    description: m.student_runtime_identity_handoff_description(),
    itemViews,
    privacy: buildStudentRuntimeIdentityHandoffPrivacyContract({
      itemViews,
      runnerSurface,
      summary,
      templateType,
    }),
    title: m.student_runtime_identity_handoff_title(),
  };
}

function summarizeStudentRuntimeIdentity(
  items: PublicRuntimeItem[]
): StudentRuntimeIdentitySummary {
  const runtimeEntries = getAttemptAnswerRuntimeItemEntries({
    includeEmpty: true,
    runtimeItems: items,
  });
  const blankRuntimeIdCount =
    runtimeEntries.find((entry) => !entry.itemId)?.originalIds.length ?? 0;
  const duplicateRuntimeIdCount = runtimeEntries.reduce(
    (count, entry) =>
      count + (entry.itemId ? Math.max(0, entry.originalIds.length - 1) : 0),
    0
  );
  const counts = countStudentRuntimeIdentityKinds(items);

  return {
    blankRuntimeIdCount: normalizeRuntimeDisplayCount(blankRuntimeIdCount),
    choiceCount: countStudentRuntimeIdentityChoices(items),
    duplicateRuntimeIdCount: normalizeRuntimeDisplayCount(
      duplicateRuntimeIdCount
    ),
    groupItemCount: normalizeRuntimeDisplayCount(counts.groupItem),
    normalizedRuntimeIdCount: normalizeRuntimeDisplayCount(
      runtimeEntries.filter((entry) => Boolean(entry.itemId)).length
    ),
    pairCount: normalizeRuntimeDisplayCount(counts.pair),
    questionCount: normalizeRuntimeDisplayCount(counts.question),
    runtimeIdsUnique:
      blankRuntimeIdCount === 0 && duplicateRuntimeIdCount === 0,
    runtimeItemCount: normalizeRuntimeDisplayCount(items.length),
  };
}

function buildStudentRuntimeIdentityHandoffItem({
  id,
  runnerSurface,
  summary,
  templateType,
}: {
  id: StudentRuntimeIdentityHandoffItemId;
  runnerSurface: ActivityTemplateRunnerKind;
  summary: StudentRuntimeIdentitySummary;
  templateType: ActivityTemplateType;
}): Omit<StudentRuntimeIdentityHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'template-type':
      return {
        description: m.student_runtime_identity_handoff_template_description(),
        id,
        label: m.student_runtime_interaction_handoff_template_label(),
        value: getTemplateByType(templateType).name,
      };
    case 'runner-surface':
      return {
        description: m.student_runtime_identity_handoff_surface_description(),
        id,
        label: m.student_runtime_interaction_handoff_surface_label(),
        value: runnerSurface,
      };
    case 'runtime-item-count':
      return {
        description:
          m.student_runtime_identity_handoff_runtime_item_count_description(),
        id,
        label: m.student_runtime_identity_handoff_runtime_item_count_label(),
        value: m.student_runtime_identity_handoff_runtime_item_count_value({
          count: summary.runtimeItemCount,
        }),
      };
    case 'normalized-runtime-id-count':
      return {
        description:
          m.student_runtime_identity_handoff_normalized_id_count_description(),
        id,
        label: m.student_runtime_identity_handoff_normalized_id_count_label(),
        value: m.student_runtime_identity_handoff_id_count_value({
          count: summary.normalizedRuntimeIdCount,
        }),
      };
    case 'unique-runtime-id-status':
      return {
        description:
          m.student_runtime_identity_handoff_unique_id_status_description(),
        id,
        label: m.assignment_item_order_handoff_unique_ids_label(),
        value: summary.runtimeIdsUnique
          ? m.assignment_item_order_handoff_unique_value()
          : m.assignment_item_order_handoff_blocked_value(),
      };
    case 'duplicate-runtime-id-count':
      return {
        description:
          m.student_runtime_identity_handoff_duplicate_id_count_description(),
        id,
        label: m.student_runtime_identity_handoff_duplicate_id_count_label(),
        value: m.student_runtime_identity_handoff_duplicate_id_count_value({
          count: summary.duplicateRuntimeIdCount,
        }),
      };
    case 'blank-runtime-id-count':
      return {
        description:
          m.student_runtime_identity_handoff_blank_id_count_description(),
        id,
        label: m.student_runtime_identity_handoff_blank_id_count_label(),
        value: m.student_runtime_identity_handoff_blank_id_count_value({
          count: summary.blankRuntimeIdCount,
        }),
      };
    case 'question-count':
      return {
        description: m.student_runtime_identity_handoff_question_description(),
        id,
        label: m.activity_runtime_kind_question(),
        value: m.student_runtime_identity_handoff_question_count_value({
          count: summary.questionCount,
        }),
      };
    case 'pair-count':
      return {
        description: m.student_runtime_identity_handoff_pair_description(),
        id,
        label: m.activity_runtime_kind_pair(),
        value: m.student_runtime_identity_handoff_pair_count_value({
          count: summary.pairCount,
        }),
      };
    case 'group-item-count':
      return {
        description:
          m.student_runtime_identity_handoff_group_item_description(),
        id,
        label: m.activity_runtime_kind_group_item(),
        value: m.student_runtime_identity_handoff_group_item_count_value({
          count: summary.groupItemCount,
        }),
      };
    case 'choice-count':
      return {
        description: m.student_runtime_identity_handoff_choice_description(),
        id,
        label: m.student_runtime_interaction_handoff_choices_label(),
        value: m.student_runtime_interaction_handoff_choices_value({
          count: summary.choiceCount,
        }),
      };
    case 'submission-contract':
      return {
        description:
          m.student_runtime_identity_handoff_submission_contract_description(),
        id,
        label: m.student_runtime_interaction_handoff_answer_contract_label(),
        value: STUDENT_RUNTIME_IDENTITY_ANSWER_CONTRACT_VALUE,
      };
    case 'browser-answer-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_browser_answer_description(),
        id,
        label: m.student_runtime_identity_handoff_browser_answer_label(),
        value: m.student_runtime_identity_handoff_browser_answer_value(),
      };
    case 'scoring-lookup-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_scoring_lookup_description(),
        id,
        label: m.student_runtime_identity_handoff_scoring_lookup_label(),
        value: m.student_runtime_identity_handoff_scoring_lookup_value(),
      };
    case 'teacher-results-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_teacher_results_description(),
        id,
        label: m.student_runtime_identity_handoff_teacher_results_label(),
        value: m.student_runtime_identity_handoff_teacher_results_value(),
      };
    case 'public-payload-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_public_payload_description(),
        id,
        label: m.student_runtime_interaction_handoff_public_payload_label(),
        value: m.student_runtime_interaction_handoff_public_payload_value(),
      };
    case 'prompt-choice-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_prompt_choice_description(),
        id,
        label: m.student_runtime_identity_handoff_prompt_choice_label(),
        value: m.student_runtime_identity_handoff_prompt_choice_value(),
      };
    case 'answer-text-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_answer_text_description(),
        id,
        label:
          m.student_runtime_interaction_handoff_answer_text_boundary_label(),
        value:
          m.student_runtime_interaction_handoff_answer_text_boundary_value(),
      };
    case 'source-material-boundary':
      return {
        description:
          m.student_runtime_identity_handoff_source_material_description(),
        id,
        label: m.assignment_item_order_handoff_source_material_boundary_label(),
        value: m.assignment_item_order_handoff_hidden_value(),
      };
    case 'privacy-guard':
      return {
        description: m.student_runtime_identity_handoff_privacy_description(),
        id,
        label: m.student_runtime_interaction_handoff_privacy_label(),
        value: m.student_runtime_interaction_handoff_private_omitted_value(),
      };
  }
}

function buildStudentRuntimeIdentityHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  StudentRuntimeIdentityHandoffItemView,
  'ariaLabel'
>): StudentRuntimeIdentityHandoffItemView {
  return {
    ariaLabel: m.student_runtime_identity_handoff_item_aria({
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

function buildStudentRuntimeIdentityHandoffPrivacyContract({
  itemViews,
  runnerSurface,
  summary,
  templateType,
}: {
  itemViews: StudentRuntimeIdentityHandoffItemView[];
  runnerSurface: ActivityTemplateRunnerKind;
  summary: StudentRuntimeIdentitySummary;
  templateType: ActivityTemplateType;
}): StudentRuntimeIdentityHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    normalizedRuntimeIdCount: summary.normalizedRuntimeIdCount,
    runtimeItemCount: summary.runtimeItemCount,
    runtimeIdsUnique: summary.runtimeIdsUnique,
    runnerSurface,
    templateType,
  };
}

function countStudentRuntimeIdentityKinds(items: PublicRuntimeItem[]) {
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

function countStudentRuntimeIdentityChoices(items: PublicRuntimeItem[]) {
  return (
    normalizeRuntimeChoiceList(items.flatMap((item) => item.choices ?? []))
      ?.length ?? 0
  );
}
