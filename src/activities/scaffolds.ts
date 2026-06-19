import type { ActivityTemplateType } from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';

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

export const activityTemplateScaffolds: Record<
  ActivityTemplateType,
  ActivityTemplateScaffold
> = {
  'fill-blank': {
    description: 'Sentence completion practice for target words and patterns.',
    groupsText: '',
    learningGoal:
      'Students can complete sentences with the correct target vocabulary.',
    pairsText: '',
    questionsText:
      'I drink ___ in the morning. | milk | milk, rice, apple\nShe eats an ___ after lunch. | apple | apple, bread, water\nWe have ___ for dinner. | rice | rice, milk, egg',
    sourceSummary: 'Fill-blank scaffold from a short vocabulary lesson.',
    subject: 'English',
    teacherNotesText:
      'Ask students to read each completed sentence aloud.\nUse answer reveal for self-correction homework.',
    title: 'Complete the food sentences',
    vocabularyText: 'milk, apple, rice, bread, water, egg',
  },
  'group-sort': {
    description: 'Classification practice with learner-friendly categories.',
    groupsText:
      'Food | apple, bread, rice, egg\nDrink | milk, water\nContainer | bowl, cup',
    learningGoal: 'Students can sort everyday words into the correct category.',
    pairsText: '',
    questionsText: '',
    sourceSummary: 'Group-sort scaffold from a vocabulary classification task.',
    subject: 'English',
    teacherNotesText:
      'Review one category at a time before students submit.\nAsk students to explain one item choice.',
    title: 'Sort food and drink words',
    vocabularyText: 'apple, bread, rice, egg, milk, water, bowl, cup',
  },
  listening: {
    description:
      'Short listening checks with spoken prompts and quick answers.',
    groupsText: '',
    learningGoal:
      'Students can understand short spoken food sentences and identify the key word.',
    pairsText: '',
    questionsText:
      'I drink milk in the morning. | milk | milk, rice, apple\nShe eats an apple after lunch. | apple | apple, bread, water\nWe have rice for dinner. | rice | rice, milk, egg',
    sourceSummary: 'Listening scaffold from short vocabulary sentences.',
    subject: 'English',
    teacherNotesText:
      'Ask students to listen before reading the transcript.\nUse answer reveal to show the spoken sentence after submission.',
    title: 'Food listening check',
    vocabularyText: 'milk, apple, rice, bread, water, egg',
  },
  'match-up': {
    description: 'Match terms with meanings for quick vocabulary practice.',
    groupsText: '',
    learningGoal:
      'Students can connect each key word with its meaning or category.',
    pairsText:
      'apple | fruit\nbread | bakery food\nmilk | drink\nrice | grain\nwater | drink',
    questionsText: '',
    sourceSummary: 'Match-up scaffold from a unit vocabulary list.',
    subject: 'English',
    teacherNotesText:
      'Use shuffled items for independent homework.\nDiscuss incorrect pairs during review.',
    title: 'Match food words to meanings',
    vocabularyText: 'apple, bread, milk, rice, water',
  },
  'matching-pairs': {
    description: 'Memory-style pair review for a class warmup or homework.',
    groupsText: '',
    learningGoal:
      'Students can recall matching word pairs through repeated practice.',
    pairsText:
      'apple | fruit\nbread | bakery food\nmilk | drink\nrice | grain\nwater | drink\negg | protein food',
    questionsText: '',
    sourceSummary: 'Matching-pairs scaffold from a recall activity.',
    subject: 'English',
    teacherNotesText:
      'Use this as a low-stakes warmup before a quiz.\nAsk pairs to say one sentence after finishing.',
    title: 'Food word memory pairs',
    vocabularyText: 'apple, bread, milk, rice, water, egg',
  },
  'open-box': {
    description: 'Prompt reveal activity for speaking or whole-class review.',
    groupsText: '',
    learningGoal:
      'Students can answer short prompts using the target vocabulary.',
    pairsText: '',
    questionsText:
      'Name one fruit you like. | apple\nWhat do you drink in the morning? | milk\nSay a sentence with rice. | rice',
    sourceSummary: 'Open-box scaffold from speaking prompts.',
    subject: 'English',
    teacherNotesText:
      'Use whole-class mode and let students answer orally.\nAccept close variants when reviewing.',
    title: 'Food speaking prompts',
    vocabularyText: 'apple, milk, rice, bread, water',
  },
  quiz: {
    description: 'Multiple-choice check for fast homework scoring.',
    groupsText: '',
    learningGoal:
      'Students can choose the correct word from simple multiple-choice prompts.',
    pairsText: '',
    questionsText:
      'Which word means a red or green fruit? | apple | apple, bread, water\nWhich drink is white? | milk | milk, rice, egg\nWhich food is often eaten from a bowl? | rice | rice, water, apple',
    sourceSummary: 'Quiz scaffold from a unit vocabulary list.',
    subject: 'English',
    teacherNotesText:
      'Publish as homework with answer reveal on.\nUse result analysis to choose reteach words.',
    title: 'Food words quick check',
    vocabularyText: 'apple, bread, milk, rice, water, egg',
  },
};

export function getActivityTemplateScaffold(type: ActivityTemplateType) {
  return activityTemplateScaffolds[type];
}
