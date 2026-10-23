import type { ActivityTemplateType } from '@/activities/types';

/**
 * English-only teacher guides for individual game templates, rendered by
 * `/templates/$template`. Guide copy must describe what the real student
 * runner and teacher workspace do today. URLs live in template-guide-paths.ts
 * so pages that only link to guides do not bundle this copy.
 */
export type TemplateDetailGuideType = Exclude<
  ActivityTemplateType,
  'quiz' | 'matching-pairs'
>;

export type TemplateGuideExampleShape = 'groups' | 'pairs' | 'questions';

export type TemplateGuideFaq = {
  answer: string;
  question: string;
};

export type TemplateDetailGuide = {
  breadcrumbLabel: string;
  createLabel: string;
  description: string;
  exampleCaption: string;
  /** Overrides the example table headers implied by exampleShape. */
  exampleColumnLabels?: readonly [string, string];
  exampleShape: TemplateGuideExampleShape;
  faqs: TemplateGuideFaq[];
  h1: string;
  intro: string;
  seoTitle: string;
  studentSteps: string[];
  teacherTips: string[];
  type: TemplateDetailGuideType;
  useCases: { detail: string; title: string }[];
};

const TEMPLATE_DETAIL_GUIDES: Record<
  TemplateDetailGuideType,
  TemplateDetailGuide
> = {
  'match-up': {
    type: 'match-up',
    breadcrumbLabel: 'Match up',
    seoTitle: 'Match Up Game Template for Vocabulary and Definitions',
    description:
      'An editable match up template for teachers: students pick the right meaning, category, or translation for each term. See a real example and share it as a student link.',
    h1: 'Match up template for terms, meanings, and translations',
    intro:
      'Match up turns a list of pairs into a quick matching quiz. Each term appears with the answers from your whole pair list, and students choose the one that belongs to it. Use it after a vocabulary lesson, as homework, or as a warm-up before a test.',
    exampleShape: 'pairs',
    exampleCaption: 'Example match up pairs from the food-words starter',
    studentSteps: [
      'Students open your assignment link in a browser and type their name if you collect names.',
      'For each term, they choose the matching answer from the choices built from your pair list.',
      'They submit when they finish. If any term is still unanswered, they are asked to confirm first. The attempt then appears in your results.',
    ],
    useCases: [
      {
        title: 'Vocabulary and definitions',
        detail:
          'Pair each new word with a short meaning. Because the wrong choices come from the same list, students have to tell similar words apart.',
      },
      {
        title: 'Translations',
        detail:
          'Put the target-language word on the left and the home-language word on the right for a quick language check.',
      },
      {
        title: 'Cause and effect',
        detail:
          'Match an event to its result, a country to its capital, or a formula to what it calculates.',
      },
    ],
    teacherTips: [
      'Keep every answer distinct. Two answers that both fit make the item unfair.',
      'Six to ten pairs is enough for a five-minute check.',
      'After saving, you can copy the same pairs into a line match or matching pairs activity.',
    ],
    faqs: [
      {
        question: 'Is the match up template free to use?',
        answer:
          'Yes. You can open the editable example, replace the pairs, and publish a student link on the free plan.',
      },
      {
        question: 'How is match up different from matching pairs?',
        answer:
          'Match up asks students to pick the right answer for each term from a list of choices. Matching pairs shows two columns of cards and students connect a card on the left with its partner on the right.',
      },
      {
        question: 'Can I see which pairs students got wrong?',
        answer:
          'Yes. The assignment results show each submitted attempt with item-level answers, so you can see which pairs the class mixed up.',
      },
    ],
    createLabel: 'Create a match up activity',
  },
  'line-match': {
    type: 'line-match',
    breadcrumbLabel: 'Line match',
    seoTitle: 'Line Matching Worksheet Template for Teachers',
    description:
      'Make an interactive line matching worksheet: students connect each prompt on the left to its match on the right. Edit a real example and share it with a link.',
    h1: 'Line matching worksheet students complete online',
    intro:
      'Line match works like the "draw a line" exercise on a paper worksheet, but students complete it in the browser and you get the score. Prompts sit in the left column, answers in the right column, and students connect them one at a time.',
    exampleShape: 'pairs',
    exampleCaption: 'Example line match prompts and answers',
    studentSteps: [
      'Students open the assignment link and type their name if you collect names.',
      'They select a prompt on the left, then select its match on the right.',
      'They submit when they finish, and you see the attempt in your results. Prompts left unconnected count as unanswered.',
    ],
    useCases: [
      {
        title: 'Worksheet follow-up',
        detail:
          'Use the same pairs you taught in class as a familiar worksheet-style exercise for homework.',
      },
      {
        title: 'Terms and definitions',
        detail:
          'Connect science or history terms to short definitions, or words to example sentences.',
      },
      {
        title: 'Pictures you describe in words',
        detail:
          'Match a description to its name, such as "a red or green fruit" to "apple".',
      },
    ],
    teacherTips: [
      'Keep the left-side prompts short so both columns stay readable on a phone.',
      'Use one relationship per activity, for example only word to meaning.',
      'Each assignment can also be printed as a worksheet for students working offline.',
    ],
    faqs: [
      {
        question: 'Can students do line matching on a tablet or phone?',
        answer:
          'Yes. Students select a prompt and then its match, so it works with a mouse or a touch screen.',
      },
      {
        question: 'Can I reuse my pairs in another game?',
        answer:
          'Yes. Line match uses the same pair list as match up and matching pairs, so after saving you can copy the pairs into either of those formats.',
      },
    ],
    createLabel: 'Create a line matching worksheet',
  },
  'group-sort': {
    type: 'group-sort',
    breadcrumbLabel: 'Group sort',
    seoTitle: 'Group Sort Game Template: Sorting Activity for Class',
    description:
      'An editable group sort template: students place each item into the right category. See a real food, drink, and container example and share it as a student link.',
    h1: 'Group sort template for classification practice',
    intro:
      'Group sort asks students to put each item into the category where it belongs. It is a simple way to check whether students understand the idea behind a category, not just a single answer. You define the groups and the items in each one.',
    exampleShape: 'groups',
    exampleCaption: 'Example groups and items from the food-words starter',
    studentSteps: [
      'Students open the assignment link and type their name if you collect names.',
      'They tap an item, then tap the group it belongs to.',
      'They submit when they finish, and you can review which items landed in the wrong group.',
    ],
    useCases: [
      {
        title: 'Science categories',
        detail:
          'Sort materials into solid, liquid, and gas, or animals into mammals, birds, and reptiles.',
      },
      {
        title: 'Grammar families',
        detail:
          'Sort words into nouns, verbs, and adjectives, or verbs by tense.',
      },
      {
        title: 'Small-group discussion',
        detail:
          'Project the activity and let groups argue for each placement before anyone submits.',
      },
    ],
    teacherTips: [
      'Two to four groups keep the board clear.',
      'Include one or two items that need a moment of thought, then discuss them afterwards.',
      'Ask students to explain one placement aloud after they submit.',
    ],
    faqs: [
      {
        question: 'How many groups can a sorting activity have?',
        answer:
          'You choose the groups in the editor. Two to four groups with a few items each work well for a short class activity.',
      },
      {
        question: 'Do students drag items?',
        answer:
          'Students tap or click an item and then the group it belongs to, which also works on touch screens.',
      },
    ],
    createLabel: 'Create a group sort activity',
  },
  'fill-blank': {
    type: 'fill-blank',
    breadcrumbLabel: 'Complete the sentence',
    seoTitle: 'Fill in the Blank Worksheet Template for Teachers',
    description:
      'Make an online fill-in-the-blank worksheet: students type the missing word in each sentence, with an optional word bank. Edit a real example and share it.',
    h1: 'Fill in the blank worksheet template',
    intro:
      'Complete the sentence gives students short sentences with one missing word. They type the answer, so it checks spelling and real recall rather than recognition. Add a word bank for younger or newer learners and remove it when you want more challenge.',
    exampleShape: 'questions',
    exampleCaption: 'Example sentences with the expected answer',
    studentSteps: [
      'Students open the assignment link and type their name if you collect names.',
      'They read each sentence and type the missing word, using the word bank if you included one.',
      'They submit, and you see each typed answer in the results.',
    ],
    useCases: [
      {
        title: 'Grammar patterns',
        detail:
          'Practice articles, prepositions, or verb forms in context instead of in isolation.',
      },
      {
        title: 'Spelling practice',
        detail:
          'Use sentences from the week’s reading so students spell new words in a meaningful sentence.',
      },
      {
        title: 'Reading follow-up',
        detail:
          'Take key sentences from a text and remove the word that carries the meaning.',
      },
    ],
    teacherTips: [
      'Make sure only one word fits each blank, or list every answer you accept, separated by a slash.',
      'Keep a word bank for starter groups and remove it for a harder version.',
      'Ask students to read each completed sentence aloud before you review scores.',
    ],
    faqs: [
      {
        question: 'Can students see a word bank?',
        answer:
          'Yes. You can include answer choices that students see as a word bank, or leave them out so students recall the word on their own.',
      },
      {
        question: 'What happens with spelling mistakes?',
        answer:
          'Typed answers are checked against the answer you set, ignoring capital letters and punctuation, so a misspelled word is marked wrong. You can list more than one accepted answer, separated by a slash. The results show each typed answer so you can spot near misses and decide what to reteach.',
      },
    ],
    createLabel: 'Create a fill in the blank activity',
  },
  listening: {
    type: 'listening',
    breadcrumbLabel: 'Listening',
    seoTitle: 'Listening Quiz Template for Language Classes',
    description:
      'Make a listening quiz: students play a sentence read aloud by the browser voice and pick or type the key word. Edit a real example and share it as a student link.',
    h1: 'Listening quiz template for language practice',
    intro:
      'The listening template reads each sentence aloud with the browser’s speech voice. Students listen, then tap the key word they heard, or type it when you leave out answer choices. The sentence is never shown while students answer, so the activity checks listening rather than reading.',
    exampleShape: 'questions',
    exampleColumnLabels: ['Sentence read aloud', 'Key word'],
    exampleCaption:
      'Example spoken sentences and the key word students listen for',
    studentSteps: [
      'Students open the assignment link and type their name if you collect names.',
      'They press play to hear each sentence, then choose or type the word they heard.',
      'After they submit, the sentence appears in their review so they can check what was said, unless you turned off showing answers after submission.',
    ],
    useCases: [
      {
        title: 'Dictation',
        detail:
          'Check whether students can pick out and spell a target word from a short spoken sentence.',
      },
      {
        title: 'Vocabulary listening',
        detail:
          'Reuse the words from today’s lesson in new sentences so students hear them in context.',
      },
      {
        title: 'Pronunciation follow-up',
        detail:
          'Let students hear the model sentence, then repeat it aloud before answering.',
      },
    ],
    teacherTips: [
      'Keep sentences short: one idea with one key word.',
      'Write the sentence exactly as it should be heard, because the transcript is also the review text.',
      'Speech playback depends on the student’s browser, so try the link on a class device first.',
    ],
    faqs: [
      {
        question: 'Do I need to record audio?',
        answer:
          'No. The sentence you type is read aloud by the student’s browser voice, so there is nothing to record or upload.',
      },
      {
        question: 'What if a student’s browser cannot play the audio?',
        answer:
          'The play button is turned off and the activity shows that speech is not available in that browser. Try the link on a class device before you assign it.',
      },
    ],
    createLabel: 'Create a listening quiz',
  },
  'open-box': {
    type: 'open-box',
    breadcrumbLabel: 'Open the box',
    seoTitle: 'Open the Box Game Template for Speaking Prompts',
    description:
      'An editable open the box template: students open one box at a time to reveal a prompt and type an answer. Good for speaking practice and whole-class review.',
    h1: 'Open the box template for prompts and review rounds',
    intro:
      'Open the box puts each prompt behind a numbered box. Students open the boxes in any order and answer one prompt at a time. It suits whole-class review, speaking warm-ups, and exit tickets where you want short typed answers instead of multiple choice.',
    exampleShape: 'questions',
    exampleCaption: 'Example prompts with a model answer',
    studentSteps: [
      'Students open the assignment link and type their name if you collect names.',
      'They tap a box to open its prompt, then type an answer.',
      'They submit when they finish, and you see each response in the results.',
    ],
    useCases: [
      {
        title: 'Speaking warm-ups',
        detail:
          'Project the boxes, let a student pick one, and have them answer aloud before typing.',
      },
      {
        title: 'Whole-class review',
        detail:
          'Turn last week’s key questions into a quick round at the start of class.',
      },
      {
        title: 'Exit tickets',
        detail:
          'Ask three short questions about today’s lesson and read the answers before planning tomorrow.',
      },
    ],
    teacherTips: [
      'Write prompts that have a short answer you can recognize, and add a model answer.',
      'Accept close variants when you review answers together.',
      'Strong prompts can be copied into a fill in the blank activity later.',
    ],
    faqs: [
      {
        question: 'Can I use open the box with the whole class?',
        answer:
          'Yes. Open the assignment on a projector and let students choose boxes, or share the link so each student answers on their own device.',
      },
      {
        question: 'Do answers have to match exactly?',
        answer:
          'Each prompt has a model answer for scoring. Capital letters and punctuation are ignored, but other differences are marked wrong, so add accepted alternatives separated by a slash. Review the typed responses in the results and talk through close variants with your class.',
      },
    ],
    createLabel: 'Create an open the box activity',
  },
};

export function getTemplateDetailGuide(
  type: string
): TemplateDetailGuide | undefined {
  return Object.hasOwn(TEMPLATE_DETAIL_GUIDES, type)
    ? TEMPLATE_DETAIL_GUIDES[type as TemplateDetailGuideType]
    : undefined;
}
