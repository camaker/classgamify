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

const foodWordsScaffoldBase = {
  description:
    'Reusable food and drink vocabulary practice for game or worksheet modes.',
  groupsText: [
    'Food | apple, bread, rice, egg',
    'Drink | milk, water',
    'Container | bowl, cup',
  ].join('\n'),
  learningGoal:
    'Students can recognize everyday food and drink words and connect them to simple meanings.',
  pairsText: [
    'apple | fruit',
    'bread | bakery food',
    'milk | drink',
    'rice | grain',
    'water | drink',
    'egg | protein food',
    'bowl | container',
    'cup | container',
  ].join('\n'),
  questionsText: [
    'Which word means a red or green fruit? | apple | apple, bread, water, cup | Apple is the fruit clue.',
    'Which drink is white? | milk | milk, rice, egg, bowl | Milk is the white drink.',
    'Which food is often eaten from a bowl? | rice | rice, water, apple, cup | Rice is commonly served in a bowl.',
    'Which item can hold a drink? | cup | cup, bread, egg, apple | A cup can hold a drink.',
  ].join('\n'),
  sourceSummary:
    'Scaffold from a short food and drink vocabulary lesson that can become multiple templates.',
  subject: 'English',
  teacherNotesText:
    'Start with the primary template, then check ready modes before publishing.\nUse result analysis to choose one reteach activity for the next lesson.',
  title: 'Food words quick check',
  vocabularyText: 'apple, bread, milk, rice, water, egg, bowl, cup',
} satisfies ActivityTemplateScaffold;

const activityTemplateScaffolds: Record<
  ActivityTemplateType,
  ActivityTemplateScaffold
> = {
  'fill-blank': {
    ...foodWordsScaffoldBase,
    description:
      'Worksheet-style sentence completion for target food and drink words.',
    learningGoal:
      'Students can complete short sentences with the correct target vocabulary.',
    questionsText: [
      'I drink ___ in the morning. | milk | milk, water, rice, apple | Milk is the drink that fits the sentence.',
      'She eats an ___ after lunch. | apple | apple, bread, water, cup | Apple fits after "an" and is a food.',
      'We have ___ for dinner. | rice | rice, milk, egg, water | Rice is a common dinner food.',
      'Please put the soup in a ___. | bowl | bowl, cup, bread, water | A bowl can hold soup.',
    ].join('\n'),
    sourceSummary:
      'Fill-blank scaffold from a food and drink vocabulary lesson.',
    teacherNotesText:
      'Use the word bank for starter classes and remove it for challenge mode.\nAsk students to read each completed sentence aloud before reviewing scores.',
    title: 'Complete the food sentences',
  },
  'group-sort': {
    ...foodWordsScaffoldBase,
    description:
      'Drag-and-sort classification practice with learner-friendly categories.',
    learningGoal:
      'Students can sort everyday words into food, drink, and container groups.',
    sourceSummary:
      'Group-sort scaffold from a food and drink classification task.',
    teacherNotesText:
      'Review one category at a time before students submit.\nAsk students to explain one item choice, then remix the same content as a quiz.',
    title: 'Sort food, drinks, and containers',
  },
  listening: {
    ...foodWordsScaffoldBase,
    description:
      'Short listening checks with spoken prompts and quick answer choices.',
    learningGoal:
      'Students can understand short spoken food sentences and identify the key word.',
    questionsText: [
      'I drink milk in the morning. | milk | milk, rice, apple, bowl | The spoken sentence says milk.',
      'She eats an apple after lunch. | apple | apple, bread, water, cup | The key word in the sentence is apple.',
      'We have rice for dinner. | rice | rice, milk, egg, water | Rice is the food named in the sentence.',
      'The cup has water in it. | water | water, bread, bowl, apple | The spoken sentence says water.',
    ].join('\n'),
    sourceSummary: 'Listening scaffold from short vocabulary sentences.',
    teacherNotesText:
      'Ask students to play each track before reading any transcript.\nUse answer reveal after submission so the spoken sentence becomes the review text.',
    title: 'Food listening check',
  },
  'line-match': {
    ...foodWordsScaffoldBase,
    description:
      'Worksheet-style line matching for words, meanings, and categories.',
    learningGoal:
      'Students can connect each food word to the correct meaning or category.',
    sourceSummary: 'Line-match scaffold from a vocabulary matching task.',
    teacherNotesText:
      'Ask students to draw or tap one connection at a time.\nReview mismatched lines, then reuse the same pairs as matching cards.',
    title: 'Draw lines for food words',
  },
  'match-up': {
    ...foodWordsScaffoldBase,
    description:
      'Match terms with meanings for quick vocabulary practice and homework.',
    learningGoal:
      'Students can connect each key word with its meaning or category.',
    sourceSummary: 'Match-up scaffold from a unit vocabulary list.',
    teacherNotesText:
      'Use shuffled items for independent homework.\nDiscuss incorrect pairs during review, then remix as line match for worksheet follow-up.',
    title: 'Match food words to meanings',
  },
  'matching-pairs': {
    ...foodWordsScaffoldBase,
    description:
      'Memory-style pair review for a class warmup, center, or homework link.',
    learningGoal:
      'Students can recall matching word pairs through repeated practice.',
    sourceSummary: 'Matching-pairs scaffold from a recall activity.',
    teacherNotesText:
      'Use this as a low-stakes warmup before a quiz.\nAsk pairs to say one sentence after finishing, then check the result summary for reteach words.',
    title: 'Food word memory pairs',
  },
  'open-box': {
    ...foodWordsScaffoldBase,
    description:
      'Prompt reveal activity for speaking, whole-class review, or exit tickets.',
    learningGoal:
      'Students can answer short prompts using the target vocabulary.',
    questionsText: [
      'Name one fruit you like. | apple | | Apple is an example fruit answer.',
      'What do you drink in the morning? | milk | | Milk is a model answer for this prompt.',
      'Say a sentence with rice. | rice | | The answer should use rice in a sentence.',
      'What can hold water? | cup | | Cup is a model answer for this prompt.',
    ].join('\n'),
    sourceSummary: 'Open-box scaffold from speaking prompts.',
    teacherNotesText:
      'Use whole-class mode and let students answer orally before typing.\nAccept close variants when reviewing and reuse strong prompts as fill blanks.',
    title: 'Food speaking prompts',
  },
  quiz: {
    ...foodWordsScaffoldBase,
    description:
      'Multiple-choice check for fast homework scoring and reteach planning.',
    learningGoal:
      'Students can choose the correct word from simple multiple-choice prompts.',
    sourceSummary: 'Quiz scaffold from a unit vocabulary list.',
    teacherNotesText:
      'Publish as homework with answer reveal on.\nUse result analysis to choose reteach words, then remix the same content into match-up practice.',
    title: 'Food words quick check',
  },
};

export function getActivityTemplateScaffold(type: ActivityTemplateType) {
  return activityTemplateScaffolds[type];
}
