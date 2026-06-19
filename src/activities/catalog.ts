import type {
  ActivitySeed,
  ActivityTemplateDefinition,
  AssignmentSeed,
} from './types';

export const activityTemplates: ActivityTemplateDefinition[] = [
  {
    type: 'quiz',
    name: 'Quiz',
    shortName: 'Quiz',
    description:
      'Multiple-choice questions with immediate scoring for quick checks.',
    bestFor: 'Vocabulary checks, reading comprehension, concept review',
    contentRequirements: ['questions'],
    classroomMode: 'individual',
  },
  {
    type: 'match-up',
    name: 'Match up',
    shortName: 'Match',
    description:
      'Learners connect terms, definitions, translations, images, or examples.',
    bestFor: 'Words and meanings, examples and categories, cause and effect',
    contentRequirements: ['pairs'],
    classroomMode: 'individual',
  },
  {
    type: 'line-match',
    name: 'Line match',
    shortName: 'Lines',
    description:
      'Students connect prompts to matching answers in a worksheet-style flow.',
    bestFor: 'Vocabulary translations, terms and definitions, cause and effect',
    contentRequirements: ['pairs'],
    classroomMode: 'individual',
  },
  {
    type: 'group-sort',
    name: 'Group sort',
    shortName: 'Sort',
    description:
      'Students drag items into teacher-defined groups and compare patterns.',
    bestFor: 'Grammar families, science groups, topic classification',
    contentRequirements: ['groups'],
    classroomMode: 'small-group',
  },
  {
    type: 'fill-blank',
    name: 'Complete the sentence',
    shortName: 'Fill',
    description:
      'Sentences with missing words, useful for grammar and spelling practice.',
    bestFor: 'Sentence patterns, grammar practice, listening follow-up',
    contentRequirements: ['questions'],
    classroomMode: 'individual',
  },
  {
    type: 'listening',
    name: 'Listening',
    shortName: 'Listen',
    description:
      'Students listen to a prompt or sentence, then answer from memory.',
    bestFor: 'Dictation, listening checks, pronunciation follow-up',
    contentRequirements: ['questions'],
    classroomMode: 'individual',
  },
  {
    type: 'matching-pairs',
    name: 'Matching pairs',
    shortName: 'Pairs',
    description:
      'A memory-style activity where students reveal and match related cards.',
    bestFor: 'Recall, warmups, small-group review games',
    contentRequirements: ['pairs'],
    classroomMode: 'small-group',
  },
  {
    type: 'open-box',
    name: 'Open the box',
    shortName: 'Box',
    description:
      'Students reveal prompts one at a time for whole-class or group play.',
    bestFor: 'Speaking prompts, review rounds, classroom participation',
    contentRequirements: ['questions'],
    classroomMode: 'whole-class',
  },
];

export const starterActivities: ActivitySeed[] = [
  {
    id: 'english-food-quiz',
    title: 'Food words quick check',
    description:
      'A starter English vocabulary activity that can render as quiz, match, lines, or pairs.',
    templateType: 'quiz',
    estimatedMinutes: 6,
    status: 'draft',
    content: {
      subject: 'English',
      gradeBand: 'Primary',
      language: 'en',
      difficulty: 'starter',
      sourceSummary: 'Unit vocabulary list about common food and drinks.',
      learningGoal:
        'Students can recognize core food words and connect them to simple meanings.',
      vocabulary: ['apple', 'bread', 'milk', 'rice', 'water', 'egg'],
      questions: [
        {
          id: 'q-apple',
          prompt: 'Which word means a red or green fruit?',
          answer: 'apple',
          options: [
            { id: 'apple', text: 'apple', isCorrect: true },
            { id: 'bread', text: 'bread' },
            { id: 'water', text: 'water' },
          ],
        },
        {
          id: 'q-milk',
          prompt: 'Which drink is white?',
          answer: 'milk',
          options: [
            { id: 'milk', text: 'milk', isCorrect: true },
            { id: 'rice', text: 'rice' },
            { id: 'egg', text: 'egg' },
          ],
        },
        {
          id: 'q-rice',
          prompt: 'Which food is often eaten from a bowl?',
          answer: 'rice',
          options: [
            { id: 'rice', text: 'rice', isCorrect: true },
            { id: 'water', text: 'water' },
            { id: 'apple', text: 'apple' },
          ],
        },
      ],
      pairs: [
        { id: 'p-apple', left: 'apple', right: 'fruit' },
        { id: 'p-bread', left: 'bread', right: 'bakery food' },
        { id: 'p-milk', left: 'milk', right: 'drink' },
        { id: 'p-rice', left: 'rice', right: 'grain' },
      ],
      groups: [
        {
          id: 'g-food',
          label: 'Food',
          items: ['apple', 'bread', 'rice', 'egg'],
        },
        { id: 'g-drink', label: 'Drink', items: ['milk', 'water'] },
      ],
      teacherNotes: [
        'Use the same content as a quiz for homework, line match for worksheet practice, or matching pairs for class warmup.',
        'Ask students to say one sentence after each correct answer.',
      ],
    },
  },
  {
    id: 'science-materials-sort',
    title: 'Materials group sort',
    description:
      'A simple science classification activity for solids, liquids, and gases.',
    templateType: 'group-sort',
    estimatedMinutes: 8,
    status: 'draft',
    content: {
      subject: 'Science',
      gradeBand: 'Primary',
      language: 'en',
      difficulty: 'core',
      sourceSummary: 'Lesson notes about states of matter.',
      learningGoal:
        'Students can classify everyday materials by observable state.',
      vocabulary: ['wood', 'juice', 'steam', 'stone', 'oil', 'air'],
      questions: [
        {
          id: 'q-steam',
          prompt: 'Which item belongs with gases?',
          answer: 'steam',
          options: [
            { id: 'steam', text: 'steam', isCorrect: true },
            { id: 'wood', text: 'wood' },
            { id: 'oil', text: 'oil' },
          ],
        },
      ],
      pairs: [
        { id: 'p-wood', left: 'wood', right: 'solid' },
        { id: 'p-juice', left: 'juice', right: 'liquid' },
        { id: 'p-air', left: 'air', right: 'gas' },
      ],
      groups: [
        { id: 'solid', label: 'Solid', items: ['wood', 'stone'] },
        { id: 'liquid', label: 'Liquid', items: ['juice', 'oil'] },
        { id: 'gas', label: 'Gas', items: ['steam', 'air'] },
      ],
      teacherNotes: [
        'Use group sort in class, then publish the quiz version as homework.',
      ],
    },
  },
];

export const starterAssignments: AssignmentSeed[] = [
  {
    id: 'assignment-food-demo',
    shareId: 'demo-food',
    title: 'Food words homework',
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

export function getTemplateByType(type: string) {
  return activityTemplates.find((template) => template.type === type);
}

export function getStarterActivity(id?: string) {
  if (!id) return starterActivities[0];
  return (
    starterActivities.find((activity) => activity.id === id) ??
    starterActivities[0]
  );
}

export function getStarterAssignment(shareId?: string) {
  if (!shareId) return starterAssignments[0];
  return (
    starterAssignments.find((assignment) => assignment.shareId === shareId) ??
    starterAssignments[0]
  );
}
