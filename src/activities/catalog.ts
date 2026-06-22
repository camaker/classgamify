import { m } from '@/locale/paraglide/messages';
import type {
  ActivityTemplateType,
  ActivitySeed,
  ActivityTemplateDefinition,
  AssignmentSeed,
} from './types';
import { ACTIVITY_TEMPLATE_TYPES } from './types';

export const activityTemplateByType = {
  quiz: defineActivityTemplate('quiz', {
    name: 'Quiz',
    shortName: 'Quiz',
    description:
      'Multiple-choice questions with immediate scoring for quick checks.',
    bestFor: 'Vocabulary checks, reading comprehension, concept review',
    contentRequirements: ['questions'],
    classroomMode: 'individual',
  }),
  'match-up': defineActivityTemplate('match-up', {
    name: 'Match up',
    shortName: 'Match',
    description:
      'Learners connect terms, definitions, translations, images, or examples.',
    bestFor: 'Words and meanings, examples and categories, cause and effect',
    contentRequirements: ['pairs'],
    classroomMode: 'individual',
  }),
  'line-match': defineActivityTemplate('line-match', {
    name: 'Line match',
    shortName: 'Lines',
    description:
      'Students connect prompts to matching answers in a worksheet-style flow.',
    bestFor: 'Vocabulary translations, terms and definitions, cause and effect',
    contentRequirements: ['pairs'],
    classroomMode: 'individual',
  }),
  'group-sort': defineActivityTemplate('group-sort', {
    name: 'Group sort',
    shortName: 'Sort',
    description:
      'Students drag items into teacher-defined groups and compare patterns.',
    bestFor: 'Grammar families, science groups, topic classification',
    contentRequirements: ['groups'],
    classroomMode: 'small-group',
  }),
  'fill-blank': defineActivityTemplate('fill-blank', {
    name: 'Complete the sentence',
    shortName: 'Fill',
    description:
      'Sentences with missing words, useful for grammar and spelling practice.',
    bestFor: 'Sentence patterns, grammar practice, listening follow-up',
    contentRequirements: ['questions'],
    classroomMode: 'individual',
  }),
  listening: defineActivityTemplate('listening', {
    name: 'Listening',
    shortName: 'Listen',
    description:
      'Students listen to a prompt or sentence, then answer from memory.',
    bestFor: 'Dictation, listening checks, pronunciation follow-up',
    contentRequirements: ['questions'],
    classroomMode: 'individual',
  }),
  'matching-pairs': defineActivityTemplate('matching-pairs', {
    name: 'Matching pairs',
    shortName: 'Pairs',
    description:
      'A memory-style activity where students reveal and match related cards.',
    bestFor: 'Recall, warmups, small-group review games',
    contentRequirements: ['pairs'],
    classroomMode: 'small-group',
  }),
  'open-box': defineActivityTemplate('open-box', {
    name: 'Open the box',
    shortName: 'Box',
    description:
      'Students reveal prompts one at a time for whole-class or group play.',
    bestFor: 'Speaking prompts, review rounds, classroom participation',
    contentRequirements: ['questions'],
    classroomMode: 'whole-class',
  }),
} satisfies Record<ActivityTemplateType, ActivityTemplateDefinition>;

export const activityTemplates = ACTIVITY_TEMPLATE_TYPES.map(
  (type) => activityTemplateByType[type]
);

function getLocalizedActivityTemplateByTypeMap() {
  return {
    quiz: defineActivityTemplate('quiz', {
      name: m.activity_template_quiz_name(),
      shortName: m.activity_template_quiz_short_name(),
      description: m.activity_template_quiz_description(),
      bestFor: m.activity_template_quiz_best_for(),
      contentRequirements: ['questions'],
      classroomMode: 'individual',
    }),
    'match-up': defineActivityTemplate('match-up', {
      name: m.activity_template_match_up_name(),
      shortName: m.activity_template_match_up_short_name(),
      description: m.activity_template_match_up_description(),
      bestFor: m.activity_template_match_up_best_for(),
      contentRequirements: ['pairs'],
      classroomMode: 'individual',
    }),
    'line-match': defineActivityTemplate('line-match', {
      name: m.activity_template_line_match_name(),
      shortName: m.activity_template_line_match_short_name(),
      description: m.activity_template_line_match_description(),
      bestFor: m.activity_template_line_match_best_for(),
      contentRequirements: ['pairs'],
      classroomMode: 'individual',
    }),
    'group-sort': defineActivityTemplate('group-sort', {
      name: m.activity_template_group_sort_name(),
      shortName: m.activity_template_group_sort_short_name(),
      description: m.activity_template_group_sort_description(),
      bestFor: m.activity_template_group_sort_best_for(),
      contentRequirements: ['groups'],
      classroomMode: 'small-group',
    }),
    'fill-blank': defineActivityTemplate('fill-blank', {
      name: m.activity_template_fill_blank_name(),
      shortName: m.activity_template_fill_blank_short_name(),
      description: m.activity_template_fill_blank_description(),
      bestFor: m.activity_template_fill_blank_best_for(),
      contentRequirements: ['questions'],
      classroomMode: 'individual',
    }),
    listening: defineActivityTemplate('listening', {
      name: m.activity_template_listening_name(),
      shortName: m.activity_template_listening_short_name(),
      description: m.activity_template_listening_description(),
      bestFor: m.activity_template_listening_best_for(),
      contentRequirements: ['questions'],
      classroomMode: 'individual',
    }),
    'matching-pairs': defineActivityTemplate('matching-pairs', {
      name: m.activity_template_matching_pairs_name(),
      shortName: m.activity_template_matching_pairs_short_name(),
      description: m.activity_template_matching_pairs_description(),
      bestFor: m.activity_template_matching_pairs_best_for(),
      contentRequirements: ['pairs'],
      classroomMode: 'small-group',
    }),
    'open-box': defineActivityTemplate('open-box', {
      name: m.activity_template_open_box_name(),
      shortName: m.activity_template_open_box_short_name(),
      description: m.activity_template_open_box_description(),
      bestFor: m.activity_template_open_box_best_for(),
      contentRequirements: ['questions'],
      classroomMode: 'whole-class',
    }),
  } satisfies Record<ActivityTemplateType, ActivityTemplateDefinition>;
}

export function getActivityTemplates() {
  const templatesByType = getLocalizedActivityTemplateByTypeMap();

  return ACTIVITY_TEMPLATE_TYPES.map((type) => templatesByType[type]);
}

export function getStarterActivities(): ActivitySeed[] {
  const foodWords = {
    apple: m.activity_starter_food_vocabulary_apple(),
    bread: m.activity_starter_food_vocabulary_bread(),
    egg: m.activity_starter_food_vocabulary_egg(),
    milk: m.activity_starter_food_vocabulary_milk(),
    rice: m.activity_starter_food_vocabulary_rice(),
    water: m.activity_starter_food_vocabulary_water(),
  };
  const scienceWords = {
    air: m.activity_starter_science_vocabulary_air(),
    juice: m.activity_starter_science_vocabulary_juice(),
    oil: m.activity_starter_science_vocabulary_oil(),
    steam: m.activity_starter_science_vocabulary_steam(),
    stone: m.activity_starter_science_vocabulary_stone(),
    wood: m.activity_starter_science_vocabulary_wood(),
  };

  return [
    {
      id: 'english-food-quiz',
      title: m.activity_starter_food_title(),
      description: m.activity_starter_food_description(),
      templateType: 'quiz',
      estimatedMinutes: 6,
      status: 'draft',
      content: {
        subject: m.activity_starter_food_subject(),
        gradeBand: m.activity_starter_food_grade_band(),
        language: m.activity_starter_food_language(),
        difficulty: 'starter',
        sourceSummary: m.activity_starter_food_source_summary(),
        learningGoal: m.activity_starter_food_learning_goal(),
        vocabulary: [
          foodWords.apple,
          foodWords.bread,
          foodWords.milk,
          foodWords.rice,
          foodWords.water,
          foodWords.egg,
        ],
        questions: [
          {
            id: 'q-apple',
            prompt: m.activity_starter_food_question_apple_prompt(),
            answer: foodWords.apple,
            explanation: m.activity_starter_food_question_apple_explanation(),
            options: [
              { id: 'apple', text: foodWords.apple, isCorrect: true },
              { id: 'bread', text: foodWords.bread },
              { id: 'water', text: foodWords.water },
            ],
          },
          {
            id: 'q-milk',
            prompt: m.activity_starter_food_question_milk_prompt(),
            answer: foodWords.milk,
            explanation: m.activity_starter_food_question_milk_explanation(),
            options: [
              { id: 'milk', text: foodWords.milk, isCorrect: true },
              { id: 'rice', text: foodWords.rice },
              { id: 'egg', text: foodWords.egg },
            ],
          },
          {
            id: 'q-rice',
            prompt: m.activity_starter_food_question_rice_prompt(),
            answer: foodWords.rice,
            explanation: m.activity_starter_food_question_rice_explanation(),
            options: [
              { id: 'rice', text: foodWords.rice, isCorrect: true },
              { id: 'water', text: foodWords.water },
              { id: 'apple', text: foodWords.apple },
            ],
          },
        ],
        pairs: [
          {
            id: 'p-apple',
            left: foodWords.apple,
            right: m.activity_starter_food_pair_apple_right(),
          },
          {
            id: 'p-bread',
            left: foodWords.bread,
            right: m.activity_starter_food_pair_bread_right(),
          },
          {
            id: 'p-milk',
            left: foodWords.milk,
            right: m.activity_starter_food_pair_milk_right(),
          },
          {
            id: 'p-rice',
            left: foodWords.rice,
            right: m.activity_starter_food_pair_rice_right(),
          },
        ],
        groups: [
          {
            id: 'g-food',
            label: m.activity_starter_food_group_food_label(),
            items: [
              foodWords.apple,
              foodWords.bread,
              foodWords.rice,
              foodWords.egg,
            ],
          },
          {
            id: 'g-drink',
            label: m.activity_starter_food_group_drink_label(),
            items: [foodWords.milk, foodWords.water],
          },
        ],
        teacherNotes: [
          m.activity_starter_food_teacher_note_1(),
          m.activity_starter_food_teacher_note_2(),
        ],
      },
    },
    {
      id: 'science-materials-sort',
      title: m.activity_starter_science_title(),
      description: m.activity_starter_science_description(),
      templateType: 'group-sort',
      estimatedMinutes: 8,
      status: 'draft',
      content: {
        subject: m.activity_starter_science_subject(),
        gradeBand: m.activity_starter_science_grade_band(),
        language: m.activity_starter_science_language(),
        difficulty: 'core',
        sourceSummary: m.activity_starter_science_source_summary(),
        learningGoal: m.activity_starter_science_learning_goal(),
        vocabulary: [
          scienceWords.wood,
          scienceWords.juice,
          scienceWords.steam,
          scienceWords.stone,
          scienceWords.oil,
          scienceWords.air,
        ],
        questions: [
          {
            id: 'q-steam',
            prompt: m.activity_starter_science_question_steam_prompt(),
            answer: scienceWords.steam,
            explanation:
              m.activity_starter_science_question_steam_explanation(),
            options: [
              { id: 'steam', text: scienceWords.steam, isCorrect: true },
              { id: 'wood', text: scienceWords.wood },
              { id: 'oil', text: scienceWords.oil },
            ],
          },
        ],
        pairs: [
          {
            id: 'p-wood',
            left: scienceWords.wood,
            right: m.activity_starter_science_pair_wood_right(),
          },
          {
            id: 'p-juice',
            left: scienceWords.juice,
            right: m.activity_starter_science_pair_juice_right(),
          },
          {
            id: 'p-air',
            left: scienceWords.air,
            right: m.activity_starter_science_pair_air_right(),
          },
        ],
        groups: [
          {
            id: 'solid',
            label: m.activity_starter_science_group_solid_label(),
            items: [scienceWords.wood, scienceWords.stone],
          },
          {
            id: 'liquid',
            label: m.activity_starter_science_group_liquid_label(),
            items: [scienceWords.juice, scienceWords.oil],
          },
          {
            id: 'gas',
            label: m.activity_starter_science_group_gas_label(),
            items: [scienceWords.steam, scienceWords.air],
          },
        ],
        teacherNotes: [m.activity_starter_science_teacher_note_1()],
      },
    },
  ];
}

export function getStarterAssignments(): AssignmentSeed[] {
  return [
    {
      id: 'assignment-food-demo',
      shareId: 'demo-food',
      title: m.activity_starter_assignment_food_title(),
      activityId: 'english-food-quiz',
      completions: 18,
      averageScore: 84,
      status: 'published',
      settings: {
        collectStudentName: true,
        showCorrectAnswers: true,
        shuffleItems: true,
        maxAttempts: 2,
      },
    },
  ];
}

function defineActivityTemplate<TType extends ActivityTemplateType>(
  type: TType,
  definition: Omit<ActivityTemplateDefinition, 'type'>
): ActivityTemplateDefinition & { type: TType } {
  return {
    ...definition,
    type,
  };
}

export function getTemplateByType(
  type: ActivityTemplateType
): ActivityTemplateDefinition;
export function getTemplateByType(
  type: string
): ActivityTemplateDefinition | undefined;
export function getTemplateByType(type: string) {
  return getLocalizedActivityTemplateByTypeMap()[type as ActivityTemplateType];
}

export function formatActivityTemplateClassroomMode(
  classroomMode: ActivityTemplateDefinition['classroomMode']
) {
  switch (classroomMode) {
    case 'individual':
      return m.activity_template_classroom_mode_individual();
    case 'small-group':
      return m.activity_template_classroom_mode_small_group();
    case 'whole-class':
      return m.activity_template_classroom_mode_whole_class();
  }
}

export function getStarterActivity(id?: string) {
  const activities = getStarterActivities();
  if (!id) return activities[0];
  return activities.find((activity) => activity.id === id) ?? activities[0];
}

export function getStarterAssignment(shareId?: string) {
  const assignments = getStarterAssignments();
  if (!shareId) return assignments[0];
  return (
    assignments.find((assignment) => assignment.shareId === shareId) ??
    assignments[0]
  );
}
