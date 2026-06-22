import type { ActivityTemplateType } from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';
import { m } from '@/locale/paraglide/messages';

type ActivityTemplateScaffold = Pick<
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
