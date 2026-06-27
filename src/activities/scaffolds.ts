import type { ActivityTemplateType } from '@/activities/types';
import {
  buildTemplateRemixSummary,
  getTemplateRemixPlan,
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

export type ActivityTemplateScaffoldReadinessSummary = {
  coverageMetrics: Array<{
    id: ActivityTemplateScaffoldCoverageMetricId;
    label: string;
    value: number;
  }>;
  readyTemplateCount: number;
  readyTemplateLabel: string;
  readyTemplateOptions: ReturnType<
    typeof buildTemplateRemixSummary
  >['readyTemplateOptions'];
  runtimeItemCount: number;
  runtimeItemLabel: string;
  title: string;
};

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

  return {
    coverageMetrics: [
      {
        id: 'questions',
        label: m.activity_template_scaffold_coverage_questions({
          count: content.questions.length,
        }),
        value: content.questions.length,
      },
      {
        id: 'pairs',
        label: m.activity_template_scaffold_coverage_pairs({
          count: content.pairs.length,
        }),
        value: content.pairs.length,
      },
      {
        id: 'groups',
        label: m.activity_template_scaffold_coverage_groups({
          count: content.groups.length,
        }),
        value: content.groups.length,
      },
      {
        id: 'vocabulary',
        label: m.activity_template_scaffold_coverage_vocabulary({
          count: content.vocabulary.length,
        }),
        value: content.vocabulary.length,
      },
      {
        id: 'teacherNotes',
        label: m.activity_template_scaffold_coverage_teacher_notes({
          count: content.teacherNotes.length,
        }),
        value: content.teacherNotes.length,
      },
    ],
    readyTemplateCount: remixSummary.readyTemplateOptions.length,
    readyTemplateLabel: m.activity_template_scaffold_ready_label({
      count: remixSummary.readyTemplateOptions.length,
    }),
    readyTemplateOptions: remixSummary.readyTemplateOptions,
    runtimeItemCount,
    runtimeItemLabel: m.activity_template_scaffold_runtime_item_label({
      count: runtimeItemCount,
    }),
    title: m.activity_template_scaffold_summary_title(),
  };
}
