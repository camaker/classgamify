/**
 * English FAQ copy for the hand-built teacher guide pages. Answers describe
 * what the product does today; keep them in sync with the student runner,
 * assignment results, and plan limits before adding claims.
 */
export type GuideFaq = {
  answer: string;
  question: string;
};

export const QUIZ_GUIDE_FAQS: GuideFaq[] = [
  {
    question: 'What is a classroom quiz game?',
    answer:
      'A classroom quiz game turns review questions into something students play instead of a plain test. In ClassGamify each student sees one question at a time with large answer tiles, and you see every attempt afterwards.',
  },
  {
    question: 'How do I make a classroom quiz game?',
    answer:
      'Open the quiz template, replace the example questions, choices, and explanations with your own, save the activity, and publish an assignment link. Students open the link in a browser and play.',
  },
  {
    question: 'Do students need an account to play?',
    answer:
      'No. Students open the assignment link and type their name if you collect names. Only the teacher needs an account to save activities and read results.',
  },
  {
    question: 'Is the classroom quiz maker free?',
    answer:
      'Yes. The free plan includes every template, with limits on saved activities and open assignment links. The pricing page lists the current limits.',
  },
  {
    question: 'Can I see which questions my class missed?',
    answer:
      'Yes. The assignment results show each attempt, its score, and the answer given for every question, so you can spot the concept that needs another example.',
  },
  {
    question: 'Should I use a quiz or a matching game?',
    answer:
      'Use a quiz when each question has one clear answer, such as a fact, a definition, or a grammar choice. Use a matching game when you have a list of terms and their partners. The matching game guide shows that format.',
  },
  {
    question: 'Can ClassGamify write the questions for me?',
    answer:
      'You can ask for an AI draft from your lesson material and then edit it in the editor. Nothing is published until you review it, and the free plan includes a monthly allowance of AI drafts.',
  },
  {
    question: 'Can I print a quiz for students without devices?',
    answer:
      'Yes. Each assignment can be printed as a worksheet for students who work on paper.',
  },
];

export const MATCHING_GUIDE_FAQS: GuideFaq[] = [
  {
    question: 'What is a matching game maker?',
    answer:
      'A matching game maker turns a list of pairs, such as words and meanings, into a game students play. You write the pairs once and ClassGamify builds the activity and records each student attempt.',
  },
  {
    question: 'How do I make a matching game for my class?',
    answer:
      'Open the matching pairs template, replace the example pairs with your own terms and partners, save it, and publish an assignment link. Students open the link and match each card with its partner.',
  },
  {
    question: 'How many pairs should a matching game have?',
    answer:
      'Six to ten pairs is enough for a five-minute check. Keep every partner distinct so that no two answers fit the same term.',
  },
  {
    question: 'What can I match besides vocabulary?',
    answer:
      'Anything that comes in pairs: words and translations, events and dates, countries and capitals, formulas and what they calculate, or a description and its name.',
  },
  {
    question: 'Do students need an account?',
    answer:
      'No. Students open the link in a browser and type their name if you collect names. Only the teacher needs an account.',
  },
  {
    question: 'Is the matching game free to use?',
    answer:
      'Yes. The free plan includes every template, with limits on saved activities and open assignment links. See the pricing page for the current limits.',
  },
  {
    question: 'How is matching pairs different from match up and line match?',
    answer:
      'They use the same kind of content, a list of pairs, and show it differently. Matching pairs shows cards to connect, match up asks students to pick the right answer for each term, and line match is the two-column worksheet style.',
  },
  {
    question: 'Can I see which pairs students mixed up?',
    answer:
      'Yes. The assignment results include item-level answers for every submitted attempt, so you can see the pairs the class found hard.',
  },
];

export const REVIEW_GUIDE_FAQS: GuideFaq[] = [
  {
    question: 'What is a review game for the classroom?',
    answer:
      'A review game turns the key facts of a unit into a short activity students play before a test. The goal is to find out what students still mix up while there is time to reteach.',
  },
  {
    question: 'How do I turn a unit review into a game?',
    answer:
      'List eight to twelve things students must know, choose a template that fits the content, replace the example in the editor, and publish a link. Students play on any device with a browser.',
  },
  {
    question: 'Which game format works best for review?',
    answer:
      'Use a quiz for facts and definitions, matching for term and meaning pairs, group sort for categories, and fill blank for sentences. You can copy the same content from one template to another that uses the same kind of content.',
  },
  {
    question: 'How long should a review game take?',
    answer:
      'Aim for five to ten minutes. A short activity is easier to repeat, and the results tell you what to review next.',
  },
  {
    question: 'Do students need accounts or devices at school?',
    answer:
      'Students need no account, only a browser and the link. For students without devices you can print the assignment as a worksheet.',
  },
  {
    question: 'Can I use the results to plan reteaching?',
    answer:
      'Yes. The results page lists each attempt with item-level answers, so you can see which questions the class missed and start tomorrow with those.',
  },
  {
    question: 'Is it free to make a review game?',
    answer:
      'Yes. The free plan includes every template, with limits on saved activities and open assignment links. The pricing page lists the current limits.',
  },
];

export const SPELLING_GUIDE_FAQS: GuideFaq[] = [
  {
    question: 'What is a spelling game generator?',
    answer:
      'A spelling game generator turns a word list into practice. On this page you paste your words and get a type-the-word drill with the first letter and the number of letters as hints.',
  },
  {
    question: 'How do I make a spelling game from my word list?',
    answer:
      'Paste one word per line into the box on this page and press the button to practice right away. To give it to students as a link with scores, create a fill blank or listening activity from the same list.',
  },
  {
    question: 'Does the practice on this page save my words?',
    answer:
      'No. The practice runs in your browser and nothing is stored or sent anywhere. To keep a word list and collect student results, save it as an activity with a teacher account.',
  },
  {
    question: 'Can students practice by listening and typing?',
    answer:
      'Yes. The listening template plays a spoken prompt and students type what they hear, which suits dictation and spelling follow-up. The hear button on this page uses your browser voice when it is available.',
  },
  {
    question: 'How many words should a spelling list have?',
    answer:
      'Eight to twelve words suits a short daily practice. Group words by spelling pattern so students notice the pattern as well as the word.',
  },
  {
    question: 'Do students need an account?',
    answer:
      'No. Students open the assignment link in a browser and type their name if you collect names.',
  },
  {
    question: 'Is it free?',
    answer:
      'The practice on this page is free to use without an account. Saved activities and assignment links are covered by the free plan, which has limits listed on the pricing page.',
  },
];

export const WORKSHEETS_GUIDE_FAQS: GuideFaq[] = [
  {
    question: 'What is a matching worksheet generator?',
    answer:
      'A matching worksheet generator turns pairs of terms and meanings into a worksheet. In ClassGamify you write the pairs once, and students complete the worksheet online or on paper while you see the scores.',
  },
  {
    question: 'Can I make a matching worksheet for free?',
    answer:
      'Yes. The free plan includes every worksheet-style template, with limits on saved activities and open assignment links. The pricing page lists the current limits.',
  },
  {
    question: 'How do I create a matching worksheet for my class?',
    answer:
      'Open the line match template, replace the example pairs with your own, save it, and publish a student link. You can also print the same assignment as a paper worksheet.',
  },
  {
    question: 'Can students complete the worksheet online?',
    answer:
      'Yes. Students open the link in a browser, connect each prompt to its match, and submit. The attempt is scored and appears in your results.',
  },
  {
    question: 'Can I print the worksheet?',
    answer:
      'Yes. Each assignment can be printed as a worksheet for students who work on paper.',
  },
  {
    question: 'What other worksheets can I make?',
    answer:
      'Fill in the blanks for grammar and spelling, group sorting for categories, and listening prompts for dictation. They all use the same editor and the same student link.',
  },
  {
    question: 'Do students need an account?',
    answer:
      'No. Students open the link and type their name if you collect names. Only the teacher needs an account.',
  },
  {
    question: 'How do I see how students did?',
    answer:
      'The assignment results list every attempt with the score and item-level answers, and you can download them as a CSV file.',
  },
];
