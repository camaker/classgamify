import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityTemplateType,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import {
  buildTemplateRemixSummary,
  getTemplateRemixPlan,
  type TemplateRemixTemplateOption,
} from '@/activities/template-remix';
import { getRuntimeItems } from '@/activities/runtime';
import type { CreateActivityInput } from '@/activities/validation';
import {
  buildActivityContent,
  createActivityInputSchema,
} from '@/activities/validation';
import { m } from '@/locale/paraglide/messages';

export type ActivityTemplateScaffold = Pick<
  CreateActivityInput,
  | 'description'
  | 'groupsText'
  | 'learningGoal'
  | 'pairsText'
  | 'questionsText'
  | 'sourceSummary'
  | 'subject'
  | 'teacherNotesText'
  | 'title'
  | 'vocabularyText'
>;

type ActivityTemplateScaffoldCoverageMetricId =
  | 'groups'
  | 'pairs'
  | 'questions'
  | 'teacherNotes'
  | 'vocabulary';

export type ActivityTemplateScaffoldCoverageTargetMap = Record<
  ActivityTemplateScaffoldCoverageMetricId,
  number
>;

export const ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TARGETS = {
  coverage: {
    groups: 1,
    pairs: 1,
    questions: 1,
    teacherNotes: 1,
    vocabulary: 1,
  },
  readyTemplates: ACTIVITY_TEMPLATE_TYPES.length,
} as const satisfies {
  coverage: ActivityTemplateScaffoldCoverageTargetMap;
  readyTemplates: number;
};

export type ActivityTemplateScaffoldCoverageMetricView = {
  id: ActivityTemplateScaffoldCoverageMetricId;
  label: string;
  meetsTarget: boolean;
  target: number;
  value: number;
};

export type ActivityTemplateScaffoldReadyOptionView =
  TemplateRemixTemplateOption;

export const ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS = [
  'scope',
  'template-count',
  'create-input-contract',
  'catalog-coverage',
  'scaffold-parse-contract',
  'runtime-item-contract',
  'ready-template-target',
  'reusable-target',
  'question-coverage',
  'pair-coverage',
  'group-coverage',
  'vocabulary-coverage',
  'teacher-note-coverage',
  'quiz-scaffold',
  'match-up-scaffold',
  'line-match-scaffold',
  'group-sort-scaffold',
  'fill-blank-scaffold',
  'listening-scaffold',
  'matching-pairs-scaffold',
  'open-box-scaffold',
  'public-template-entry',
  'worksheet-entry',
  'editor-review-loop',
  'save-before-publish',
  'source-material-boundary',
  'raw-scaffold-boundary',
  'current-field-boundary',
  'answer-key-boundary',
  'privacy-guard',
] as const;

type ActivityTemplateScaffoldQualityTemplateItemId = Extract<
  ActivityTemplateScaffoldQualityHandoffItemId,
  | 'fill-blank-scaffold'
  | 'group-sort-scaffold'
  | 'line-match-scaffold'
  | 'listening-scaffold'
  | 'match-up-scaffold'
  | 'matching-pairs-scaffold'
  | 'open-box-scaffold'
  | 'quiz-scaffold'
>;

export type ActivityTemplateScaffoldQualityHandoffItemId =
  (typeof ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS)[number];

export type ActivityTemplateScaffoldQualityHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityTemplateScaffoldQualityHandoffItemId;
  label: string;
  value: string;
};

export type ActivityTemplateScaffoldQualityHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesCurrentFieldText: false;
  exposesQuestionPromptText: false;
  exposesRawScaffoldContent: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityTemplateScaffoldQualityHandoffItemId[];
  scope: 'activity-template-scaffold-quality';
  usesCreateActivityInputContract: true;
  verifiesAllTemplateScaffolds: true;
};

export type ActivityTemplateScaffoldQualityHandoffView = {
  description: string;
  itemViews: ActivityTemplateScaffoldQualityHandoffItemView[];
  privacy: ActivityTemplateScaffoldQualityHandoffPrivacyContract;
  title: string;
};

export type ActivityTemplateScaffoldReadinessSummary = {
  coverageMetrics: ActivityTemplateScaffoldCoverageMetricView[];
  isReusableAcrossTemplates: boolean;
  meetsCoverageTarget: boolean;
  meetsReadyTemplateTarget: boolean;
  readyTemplateCount: number;
  readyTemplateLabel: string;
  readyTemplateOptions: ActivityTemplateScaffoldReadyOptionView[];
  readyTemplateTarget: number;
  runtimeItemCount: number;
  runtimeItemLabel: string;
  title: string;
};

type ActivityTemplateScaffoldQualitySummaryItem = {
  label: string;
  summary: ActivityTemplateScaffoldReadinessSummary;
  templateType: ActivityTemplateType;
};

type ActivityTemplateScaffoldQualitySummary = {
  catalogTemplateCount: number;
  coverageTargetCounts: Record<
    ActivityTemplateScaffoldCoverageMetricId,
    number
  >;
  readyTargetCount: number;
  reusableScaffoldCount: number;
  runtimeItemCount: number;
  scaffoldCount: number;
  templates: ActivityTemplateScaffoldQualitySummaryItem[];
};

const ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TEMPLATE_ITEM_TYPES = {
  'fill-blank-scaffold': 'fill-blank',
  'group-sort-scaffold': 'group-sort',
  'line-match-scaffold': 'line-match',
  'listening-scaffold': 'listening',
  'match-up-scaffold': 'match-up',
  'matching-pairs-scaffold': 'matching-pairs',
  'open-box-scaffold': 'open-box',
  'quiz-scaffold': 'quiz',
} as const satisfies Record<
  ActivityTemplateScaffoldQualityTemplateItemId,
  ActivityTemplateType
>;

function getFoodWordsScaffoldBase(): ActivityTemplateScaffold {
  return {
    description: m.activity_scaffold_food_base_description(),
    groupsText: m.activity_scaffold_food_base_groups_text(),
    learningGoal: m.activity_scaffold_food_base_learning_goal(),
    pairsText: m.activity_scaffold_food_base_pairs_text(),
    questionsText: m.activity_scaffold_food_base_questions_text(),
    sourceSummary: m.activity_scaffold_food_base_source_summary(),
    subject: m.activity_scaffold_food_base_subject(),
    teacherNotesText: m.activity_scaffold_food_base_teacher_notes_text(),
    title: m.activity_scaffold_food_base_title(),
    vocabularyText: m.activity_scaffold_food_base_vocabulary_text(),
  };
}

const activityTemplateScaffoldBuilders: Record<
  ActivityTemplateType,
  () => ActivityTemplateScaffold
> = {
  'fill-blank': () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_fill_blank_description(),
    learningGoal: m.activity_scaffold_fill_blank_learning_goal(),
    questionsText: m.activity_scaffold_fill_blank_questions_text(),
    sourceSummary: m.activity_scaffold_fill_blank_source_summary(),
    teacherNotesText: m.activity_scaffold_fill_blank_teacher_notes_text(),
    title: m.activity_scaffold_fill_blank_title(),
  }),
  'group-sort': () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_group_sort_description(),
    learningGoal: m.activity_scaffold_group_sort_learning_goal(),
    sourceSummary: m.activity_scaffold_group_sort_source_summary(),
    teacherNotesText: m.activity_scaffold_group_sort_teacher_notes_text(),
    title: m.activity_scaffold_group_sort_title(),
  }),
  listening: () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_listening_description(),
    learningGoal: m.activity_scaffold_listening_learning_goal(),
    questionsText: m.activity_scaffold_listening_questions_text(),
    sourceSummary: m.activity_scaffold_listening_source_summary(),
    teacherNotesText: m.activity_scaffold_listening_teacher_notes_text(),
    title: m.activity_scaffold_listening_title(),
  }),
  'line-match': () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_line_match_description(),
    learningGoal: m.activity_scaffold_line_match_learning_goal(),
    sourceSummary: m.activity_scaffold_line_match_source_summary(),
    teacherNotesText: m.activity_scaffold_line_match_teacher_notes_text(),
    title: m.activity_scaffold_line_match_title(),
  }),
  'match-up': () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_match_up_description(),
    learningGoal: m.activity_scaffold_match_up_learning_goal(),
    sourceSummary: m.activity_scaffold_match_up_source_summary(),
    teacherNotesText: m.activity_scaffold_match_up_teacher_notes_text(),
    title: m.activity_scaffold_match_up_title(),
  }),
  'matching-pairs': () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_matching_pairs_description(),
    learningGoal: m.activity_scaffold_matching_pairs_learning_goal(),
    sourceSummary: m.activity_scaffold_matching_pairs_source_summary(),
    teacherNotesText: m.activity_scaffold_matching_pairs_teacher_notes_text(),
    title: m.activity_scaffold_matching_pairs_title(),
  }),
  'open-box': () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_open_box_description(),
    learningGoal: m.activity_scaffold_open_box_learning_goal(),
    questionsText: m.activity_scaffold_open_box_questions_text(),
    sourceSummary: m.activity_scaffold_open_box_source_summary(),
    teacherNotesText: m.activity_scaffold_open_box_teacher_notes_text(),
    title: m.activity_scaffold_open_box_title(),
  }),
  quiz: () => ({
    ...getFoodWordsScaffoldBase(),
    description: m.activity_scaffold_quiz_description(),
    learningGoal: m.activity_scaffold_quiz_learning_goal(),
    sourceSummary: m.activity_scaffold_quiz_source_summary(),
    teacherNotesText: m.activity_scaffold_quiz_teacher_notes_text(),
    title: m.activity_scaffold_quiz_title(),
  }),
};

export function getActivityTemplateScaffold(type: ActivityTemplateType) {
  return activityTemplateScaffoldBuilders[type]();
}

export function buildActivityTemplateScaffoldInput({
  current,
  templateType,
}: {
  current: CreateActivityInput;
  templateType: ActivityTemplateType;
}) {
  return {
    ...current,
    ...getActivityTemplateScaffold(templateType),
    templateType,
  };
}

export function buildActivityTemplateScaffoldReadinessSummary({
  current,
  templateType,
}: {
  current: CreateActivityInput;
  templateType: ActivityTemplateType;
}): ActivityTemplateScaffoldReadinessSummary {
  const scaffoldInput = createActivityInputSchema.parse(
    buildActivityTemplateScaffoldInput({
      current,
      templateType,
    })
  );
  const content = buildActivityContent(scaffoldInput);
  const remixPlan = getTemplateRemixPlan({
    content,
    currentTemplateType: templateType,
  });
  const remixSummary = buildTemplateRemixSummary(remixPlan);
  const runtimeItemCount = getRuntimeItems(templateType, content).length;
  const coverageMetrics = [
    buildActivityTemplateScaffoldCoverageMetric({
      id: 'questions',
      label: m.activity_template_scaffold_coverage_questions({
        count: content.questions.length,
      }),
      value: content.questions.length,
    }),
    buildActivityTemplateScaffoldCoverageMetric({
      id: 'pairs',
      label: m.activity_template_scaffold_coverage_pairs({
        count: content.pairs.length,
      }),
      value: content.pairs.length,
    }),
    buildActivityTemplateScaffoldCoverageMetric({
      id: 'groups',
      label: m.activity_template_scaffold_coverage_groups({
        count: content.groups.length,
      }),
      value: content.groups.length,
    }),
    buildActivityTemplateScaffoldCoverageMetric({
      id: 'vocabulary',
      label: m.activity_template_scaffold_coverage_vocabulary({
        count: content.vocabulary.length,
      }),
      value: content.vocabulary.length,
    }),
    buildActivityTemplateScaffoldCoverageMetric({
      id: 'teacherNotes',
      label: m.activity_template_scaffold_coverage_teacher_notes({
        count: content.teacherNotes.length,
      }),
      value: content.teacherNotes.length,
    }),
  ];
  const meetsCoverageTarget = coverageMetrics.every(
    (metric) => metric.meetsTarget
  );
  const readyTemplateCount = remixSummary.readyTemplateOptions.length;
  const meetsReadyTemplateTarget =
    readyTemplateCount >=
    ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TARGETS.readyTemplates;

  return {
    coverageMetrics,
    isReusableAcrossTemplates: meetsCoverageTarget && meetsReadyTemplateTarget,
    meetsCoverageTarget,
    meetsReadyTemplateTarget,
    readyTemplateCount,
    readyTemplateLabel: m.activity_template_scaffold_ready_label({
      count: readyTemplateCount,
    }),
    readyTemplateOptions: remixSummary.readyTemplateOptions,
    readyTemplateTarget:
      ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TARGETS.readyTemplates,
    runtimeItemCount,
    runtimeItemLabel: m.activity_template_scaffold_runtime_item_label({
      count: runtimeItemCount,
    }),
    title: m.activity_template_scaffold_summary_title(),
  };
}

export function buildActivityTemplateScaffoldQualityHandoffView({
  current,
}: {
  current: CreateActivityInput;
}): ActivityTemplateScaffoldQualityHandoffView {
  const summary = buildActivityTemplateScaffoldQualitySummary(current);
  const itemViews = ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildActivityTemplateScaffoldQualityHandoffItemView(
        buildActivityTemplateScaffoldQualityHandoffItem({
          id,
          summary,
        })
      )
  );

  return {
    description: m.activity_template_scaffold_quality_handoff_description(),
    itemViews,
    privacy:
      buildActivityTemplateScaffoldQualityHandoffPrivacyContract(itemViews),
    title: m.activity_template_scaffold_quality_handoff_title(),
  };
}

function buildActivityTemplateScaffoldQualitySummary(
  current: CreateActivityInput
): ActivityTemplateScaffoldQualitySummary {
  const templates = ACTIVITY_TEMPLATE_TYPES.map((templateType) => ({
    label: getTemplateByType(templateType).shortName,
    summary: buildActivityTemplateScaffoldReadinessSummary({
      current,
      templateType,
    }),
    templateType,
  }));
  const coverageTargetCounts = Object.fromEntries(
    Object.keys(ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TARGETS.coverage).map(
      (id) => [
        id,
        templates.filter(({ summary }) =>
          summary.coverageMetrics.some(
            (metric) =>
              metric.id === id &&
              metric.value >= metric.target &&
              metric.meetsTarget
          )
        ).length,
      ]
    )
  ) as Record<ActivityTemplateScaffoldCoverageMetricId, number>;

  return {
    catalogTemplateCount: ACTIVITY_TEMPLATE_TYPES.length,
    coverageTargetCounts,
    readyTargetCount: templates.filter(
      ({ summary }) => summary.meetsReadyTemplateTarget
    ).length,
    reusableScaffoldCount: templates.filter(
      ({ summary }) => summary.isReusableAcrossTemplates
    ).length,
    runtimeItemCount: templates.reduce(
      (total, { summary }) => total + summary.runtimeItemCount,
      0
    ),
    scaffoldCount: templates.length,
    templates,
  };
}

function buildActivityTemplateScaffoldQualityHandoffItem({
  id,
  summary,
}: {
  id: ActivityTemplateScaffoldQualityHandoffItemId;
  summary: ActivityTemplateScaffoldQualitySummary;
}): Omit<ActivityTemplateScaffoldQualityHandoffItemView, 'ariaLabel'> {
  const templateType =
    ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TEMPLATE_ITEM_TYPES[
      id as ActivityTemplateScaffoldQualityTemplateItemId
    ];

  if (templateType) {
    return buildActivityTemplateScaffoldQualityTemplateItem({
      id,
      summary,
      templateType,
    });
  }

  switch (id) {
    case 'scope':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_scope_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_scope_label(),
        value: m.activity_template_scaffold_quality_handoff_scope_value(),
      };
    case 'template-count':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_template_count_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_template_count_label(),
        value:
          m.activity_template_scaffold_quality_handoff_template_count_value({
            count: summary.catalogTemplateCount,
          }),
      };
    case 'create-input-contract':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_create_input_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_create_input_label(),
        value:
          m.activity_template_scaffold_quality_handoff_create_input_value(),
      };
    case 'catalog-coverage':
      return buildActivityTemplateScaffoldQualityRatioItem({
        description:
          m.activity_template_scaffold_quality_handoff_catalog_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_catalog_label(),
        passed: summary.scaffoldCount,
        total: summary.catalogTemplateCount,
      });
    case 'scaffold-parse-contract':
      return buildActivityTemplateScaffoldQualityRatioItem({
        description:
          m.activity_template_scaffold_quality_handoff_parse_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_parse_label(),
        passed: summary.scaffoldCount,
        total: summary.catalogTemplateCount,
      });
    case 'runtime-item-contract':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_runtime_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_runtime_label(),
        value: m.activity_template_scaffold_quality_handoff_runtime_value({
          count: summary.runtimeItemCount,
        }),
      };
    case 'ready-template-target':
      return buildActivityTemplateScaffoldQualityRatioItem({
        description:
          m.activity_template_scaffold_quality_handoff_ready_target_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_ready_target_label(),
        passed: summary.readyTargetCount,
        total: summary.scaffoldCount,
      });
    case 'reusable-target':
      return buildActivityTemplateScaffoldQualityRatioItem({
        description:
          m.activity_template_scaffold_quality_handoff_reusable_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_reusable_label(),
        passed: summary.reusableScaffoldCount,
        total: summary.scaffoldCount,
      });
    case 'question-coverage':
      return buildActivityTemplateScaffoldQualityCoverageItem({
        description:
          m.activity_template_scaffold_quality_handoff_question_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_question_label(),
        metricId: 'questions',
        summary,
      });
    case 'pair-coverage':
      return buildActivityTemplateScaffoldQualityCoverageItem({
        description:
          m.activity_template_scaffold_quality_handoff_pair_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_pair_label(),
        metricId: 'pairs',
        summary,
      });
    case 'group-coverage':
      return buildActivityTemplateScaffoldQualityCoverageItem({
        description:
          m.activity_template_scaffold_quality_handoff_group_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_group_label(),
        metricId: 'groups',
        summary,
      });
    case 'vocabulary-coverage':
      return buildActivityTemplateScaffoldQualityCoverageItem({
        description:
          m.activity_template_scaffold_quality_handoff_vocabulary_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_vocabulary_label(),
        metricId: 'vocabulary',
        summary,
      });
    case 'teacher-note-coverage':
      return buildActivityTemplateScaffoldQualityCoverageItem({
        description:
          m.activity_template_scaffold_quality_handoff_teacher_note_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_teacher_note_label(),
        metricId: 'teacherNotes',
        summary,
      });
    case 'public-template-entry':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_public_entry_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_public_entry_label(),
        value:
          m.activity_template_scaffold_quality_handoff_public_entry_value(),
      };
    case 'worksheet-entry':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_worksheet_entry_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_worksheet_entry_label(),
        value:
          m.activity_template_scaffold_quality_handoff_worksheet_entry_value(),
      };
    case 'editor-review-loop':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_editor_review_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_editor_review_label(),
        value:
          m.activity_template_scaffold_quality_handoff_editor_review_value(),
      };
    case 'save-before-publish':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_save_boundary_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_save_boundary_label(),
        value:
          m.activity_template_scaffold_quality_handoff_save_boundary_value(),
      };
    case 'source-material-boundary':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_source_boundary_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_source_boundary_label(),
        value: m.activity_template_scaffold_quality_handoff_hidden_value(),
      };
    case 'raw-scaffold-boundary':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_raw_scaffold_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_raw_scaffold_label(),
        value: m.activity_template_scaffold_quality_handoff_hidden_value(),
      };
    case 'current-field-boundary':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_current_field_description(),
        id,
        label:
          m.activity_template_scaffold_quality_handoff_current_field_label(),
        value: m.activity_template_scaffold_quality_handoff_hidden_value(),
      };
    case 'answer-key-boundary':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_answer_key_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_answer_key_label(),
        value: m.activity_template_scaffold_quality_handoff_hidden_value(),
      };
    case 'privacy-guard':
      return {
        description:
          m.activity_template_scaffold_quality_handoff_privacy_description(),
        id,
        label: m.activity_template_scaffold_quality_handoff_privacy_label(),
        value: m.activity_template_scaffold_quality_handoff_hidden_value(),
      };
  }
}

function buildActivityTemplateScaffoldQualityTemplateItem({
  id,
  summary,
  templateType,
}: {
  id: ActivityTemplateScaffoldQualityHandoffItemId;
  summary: ActivityTemplateScaffoldQualitySummary;
  templateType: ActivityTemplateType;
}): Omit<ActivityTemplateScaffoldQualityHandoffItemView, 'ariaLabel'> {
  const templateSummary = summary.templates.find(
    (item) => item.templateType === templateType
  );
  const label =
    templateSummary?.label ??
    m.activity_template_scaffold_quality_handoff_unknown_value();
  const runtimeItems = templateSummary?.summary.runtimeItemCount ?? 0;
  const readyTemplates = templateSummary?.summary.readyTemplateCount ?? 0;

  return {
    description:
      m.activity_template_scaffold_quality_handoff_template_description({
        template: label,
      }),
    id,
    label,
    value: m.activity_template_scaffold_quality_handoff_template_value({
      readyTemplates,
      runtimeItems,
    }),
  };
}

function buildActivityTemplateScaffoldQualityCoverageItem({
  description,
  id,
  label,
  metricId,
  summary,
}: {
  description: string;
  id: ActivityTemplateScaffoldQualityHandoffItemId;
  label: string;
  metricId: ActivityTemplateScaffoldCoverageMetricId;
  summary: ActivityTemplateScaffoldQualitySummary;
}): Omit<ActivityTemplateScaffoldQualityHandoffItemView, 'ariaLabel'> {
  return buildActivityTemplateScaffoldQualityRatioItem({
    description,
    id,
    label,
    passed: summary.coverageTargetCounts[metricId],
    total: summary.scaffoldCount,
  });
}

function buildActivityTemplateScaffoldQualityRatioItem({
  description,
  id,
  label,
  passed,
  total,
}: {
  description: string;
  id: ActivityTemplateScaffoldQualityHandoffItemId;
  label: string;
  passed: number;
  total: number;
}): Omit<ActivityTemplateScaffoldQualityHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value: m.activity_template_scaffold_quality_handoff_ratio_value({
      passed,
      total,
    }),
  };
}

function buildActivityTemplateScaffoldQualityHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivityTemplateScaffoldQualityHandoffItemView,
  'ariaLabel'
>): ActivityTemplateScaffoldQualityHandoffItemView {
  return {
    ariaLabel: m.activity_template_scaffold_quality_handoff_item_aria({
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

function buildActivityTemplateScaffoldQualityHandoffPrivacyContract(
  itemViews: ActivityTemplateScaffoldQualityHandoffItemView[]
): ActivityTemplateScaffoldQualityHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesCurrentFieldText: false,
    exposesQuestionPromptText: false,
    exposesRawScaffoldContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    scope: 'activity-template-scaffold-quality',
    usesCreateActivityInputContract: true,
    verifiesAllTemplateScaffolds: true,
  };
}

function buildActivityTemplateScaffoldCoverageMetric({
  id,
  label,
  value,
}: {
  id: ActivityTemplateScaffoldCoverageMetricId;
  label: string;
  value: number;
}): ActivityTemplateScaffoldCoverageMetricView {
  const target = ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_TARGETS.coverage[id];

  return {
    id,
    label,
    meetsTarget: value >= target,
    target,
    value,
  };
}
