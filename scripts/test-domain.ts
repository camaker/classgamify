import assert from 'node:assert/strict';
import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import {
  isActivityTemplateType,
  normalizeActivityLibrarySearch,
  parseActivityLibraryStatus,
  parseActivityTemplateFilter,
} from '@/activities/library-filters';
import { createFallbackActivityDraft } from '@/activities/ai-draft';
import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import { getTemplateRemixPlan } from '@/activities/template-remix';
import { buildActivityContent } from '@/activities/validation';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import { summarizeAssignmentAttempts } from '@/assignments/attempt-stats';
import {
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
} from '@/assignments/attempt-duration';
import { buildAssignmentDeliverySummary } from '@/assignments/delivery-summary';
import {
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  orderAssignmentRuntimeItems,
  stableShuffle,
} from '@/assignments/item-order';
import {
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAttemptReviews,
  matchesResultSearch,
  normalizeResultSearch,
  parseAttemptReviewFilter,
  parseItemPerformanceSort,
  parseStudentSummarySort,
  sortItemPerformance,
  sortStudentSummaries,
} from '@/assignments/result-view';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvFilename,
} from '@/assignments/results-export';
import { findPublishedAssignmentInList } from '@/assignments/published-assignment';
import {
  buildAssignmentSharePath,
  buildAssignmentShareUrl,
  normalizeShareBaseUrl,
} from '@/assignments/share-link';
import { buildAssignmentStudentFollowUpSummary } from '@/assignments/student-follow-up-summary';
import {
  buildAttemptSubmissionAnswers,
  getAttemptCompletionSummary,
  getAttemptSubmitDecision,
  isStudentAnswerFilled,
} from '@/assignments/student-submission';
import type { RuntimeItem } from '@/activities/runtime';

const submissionRuntimeItems = [
  { id: 'item-1' },
  { id: 'item-2' },
  { id: 'item-3' },
];

const answers = {
  'item-1': ' apple ',
  'item-2': '   ',
} satisfies Record<string, string>;

assert.equal(isStudentAnswerFilled(undefined), false);
assert.equal(isStudentAnswerFilled('   '), false);
assert.equal(isStudentAnswerFilled(' answer '), true);

assert.deepEqual(
  getAttemptCompletionSummary({
    answers,
    runtimeItems: submissionRuntimeItems,
  }),
  {
    answeredItemCount: 1,
    itemCount: 3,
    unansweredItemCount: 2,
  }
);
const incompleteCompletionSummary = getAttemptCompletionSummary({
  answers,
  runtimeItems: submissionRuntimeItems,
});
assert.deepEqual(
  getAttemptSubmitDecision({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
  }),
  {
    reason: 'unanswered-items',
    type: 'confirm-incomplete',
    unansweredItemCount: 2,
  }
);
assert.deepEqual(
  getAttemptSubmitDecision({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: true,
  }),
  {
    reason: 'confirmed-incomplete',
    type: 'submit',
  }
);
assert.deepEqual(
  getAttemptSubmitDecision({
    completionSummary: {
      answeredItemCount: 3,
      itemCount: 3,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: false,
  }),
  {
    reason: 'complete',
    type: 'submit',
  }
);

assert.deepEqual(
  buildAttemptSubmissionAnswers({
    answers,
    runtimeItems: submissionRuntimeItems,
  }),
  [
    { answer: ' apple ', itemId: 'item-1' },
    { answer: '   ', itemId: 'item-2' },
    { answer: '', itemId: 'item-3' },
  ]
);
assert.equal(
  orderAssignmentRuntimeItems({
    items: submissionRuntimeItems,
    shareSlug: 'share-1',
    shuffleItems: false,
  }),
  submissionRuntimeItems
);
const shuffledOnce = orderAssignmentRuntimeItems({
  items: submissionRuntimeItems,
  shareSlug: 'share-1',
  shuffleItems: true,
});
const shuffledAgain = orderAssignmentRuntimeItems({
  items: submissionRuntimeItems,
  shareSlug: 'share-1',
  shuffleItems: true,
});
assert.deepEqual(shuffledOnce, shuffledAgain);
assert.notEqual(shuffledOnce, submissionRuntimeItems);
assert.deepEqual(
  submissionRuntimeItems.map((item) => item.id),
  ['item-1', 'item-2', 'item-3']
);
assert.deepEqual(
  stableShuffle(submissionRuntimeItems, 'share-2').map((item) => item.id),
  stableShuffle(submissionRuntimeItems, 'share-2').map((item) => item.id)
);
assert.equal(buildAssignmentSharePath('abc 123'), '/play/abc%20123');
assert.equal(
  buildAssignmentSharePath('class/6?homework=yes'),
  '/play/class%2F6%3Fhomework%3Dyes'
);
assert.equal(
  normalizeShareBaseUrl('https://classgamify.test///'),
  'https://classgamify.test'
);
assert.equal(
  buildAssignmentShareUrl('abc 123', 'https://classgamify.test/'),
  'https://classgamify.test/play/abc%20123'
);
const publishedAssignments = [
  {
    assignment: {
      id: 'assignment-1',
      shareSlug: 'share-1',
      title: 'Week 1',
    },
  },
  {
    assignment: {
      id: 'assignment-2',
      shareSlug: 'share-2',
      title: 'Week 2',
    },
  },
];
assert.deepEqual(
  findPublishedAssignmentInList({
    items: publishedAssignments,
    shareSlug: 'share-2',
  }),
  publishedAssignments[1]?.assignment
);
assert.equal(
  findPublishedAssignmentInList({
    items: publishedAssignments,
    shareSlug: 'missing',
  }),
  undefined
);
assert.deepEqual(buildAssignmentDeliverySummary({ expiresAt: null }), [
  { id: 'attempts', label: 'Attempts', value: 'Open' },
  { id: 'timer', label: 'Timer', value: 'No timer' },
  { id: 'closes', label: 'Closes', value: 'No close time' },
  { id: 'identity', label: 'Student identity', value: 'Names' },
  { id: 'answerReveal', label: 'Answer reveal', value: 'After submit' },
  { id: 'itemOrder', label: 'Item order', value: 'Shuffled' },
]);
assert.deepEqual(
  buildAssignmentDeliverySummary({
    collectStudentName: false,
    expiresAt: 'not-a-date',
    maxAttempts: 3,
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitSeconds: 90,
  }).map((item) => [item.id, item.value]),
  [
    ['attempts', '3 max'],
    ['timer', '2 min'],
    ['closes', 'No close time'],
    ['identity', 'Anonymous'],
    ['answerReveal', 'Hidden'],
    ['itemOrder', 'Fixed order'],
  ]
);
assert.equal(normalizeActivityLibrarySearch('  word   match  '), 'word match');
assert.equal(normalizeActivityLibrarySearch('   '), undefined);
assert.equal(parseActivityLibraryStatus('archived'), 'archived');
assert.equal(parseActivityLibraryStatus('deleted'), undefined);
assert.equal(parseActivityTemplateFilter('group-sort'), 'group-sort');
assert.equal(parseActivityTemplateFilter('flashcards'), undefined);
assert.equal(isActivityTemplateType('open-box'), true);
assert.equal(isActivityTemplateType('memory-game'), false);
assert.equal(normalizeAssignmentListSearch('  share   123  '), 'share 123');
assert.equal(normalizeAssignmentListSearch('   '), undefined);
assert.equal(parseAssignmentStatusFilter('published'), 'published');
assert.equal(parseAssignmentStatusFilter('all'), undefined);
const fallbackDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  itemCount: 5,
  language: 'en',
  sourceText:
    'weather, sunny, rainy, cloudy, windy; students classify weather words and answer simple listening prompts',
  subject: 'Science',
  templateType: 'listening',
});
const fallbackContent = buildActivityContent(fallbackDraft);
const fallbackRemixPlan = getTemplateRemixPlan({
  content: fallbackContent,
  currentTemplateType: fallbackDraft.templateType,
});
assert.equal(fallbackDraft.templateType, 'listening');
assert.equal(fallbackContent.questions.length, 5);
assert.equal(fallbackContent.pairs.length, 5);
assert.ok(fallbackContent.groups.length >= 2);
assert.ok(fallbackContent.vocabulary.includes('weather'));
assert.ok(fallbackContent.teacherNotes.length >= 2);
assert.ok(
  fallbackContent.questions.every((question) =>
    question.options?.some((option) => option.text === question.answer)
  )
);
assert.ok(
  fallbackRemixPlan.readyOptions.some(
    (option) => option.template.type === 'listening'
  )
);
assert.ok(fallbackRemixPlan.suggestedOptions.length >= 3);
const multilingualGroupContent = buildActivityContent({
  description: 'Multilingual group sort',
  difficulty: 'starter',
  gradeBand: 'Grade 1',
  groupsText: ['水果 | 苹果, 香蕉', '饮品 | 牛奶, 水'].join('\n'),
  language: 'zh',
  learningGoal: 'Students can classify familiar Chinese food words.',
  pairsText: '',
  questionsText: '',
  sourceSummary: 'Chinese food vocabulary classification.',
  subject: 'Chinese',
  teacherNotesText: 'Use categories first, then submit.',
  templateType: 'group-sort',
  title: '中文分类',
  visibility: 'draft',
  vocabularyText: '苹果, 香蕉, 牛奶, 水',
});
const multilingualGroupItems = getRuntimeItems(
  'group-sort',
  multilingualGroupContent
);
assert.deepEqual(
  multilingualGroupItems.map((item) => item.id),
  ['g-1-item-1', 'g-1-item-2', 'g-2-item-1', 'g-2-item-2']
);
assert.notEqual(multilingualGroupItems[0]?.id, multilingualGroupItems[1]?.id);
assert.notEqual(multilingualGroupItems[2]?.id, multilingualGroupItems[3]?.id);
assert.equal(
  evaluateRuntimeAnswers({
    answers: multilingualGroupItems.map((item) => ({
      answer: item.answer,
      itemId: item.id,
    })),
    content: multilingualGroupContent,
    templateType: 'group-sort',
  }).result.accuracy,
  100
);
const collidingGroupContent = buildActivityContent({
  description: 'Collision group sort',
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  groupsText: 'Treats | ice cream, ice-cream',
  language: 'en',
  learningGoal: 'Students can classify similar written items safely.',
  pairsText: '',
  questionsText: '',
  sourceSummary: 'Similar words should still receive unique runtime ids.',
  subject: 'English',
  teacherNotesText: 'Check item ids before publishing.',
  templateType: 'group-sort',
  title: 'Collision sort',
  visibility: 'draft',
  vocabularyText: 'ice cream, ice-cream',
});
assert.deepEqual(
  getRuntimeItems('group-sort', collidingGroupContent).map((item) => item.id),
  ['g-treats-ice-cream-1', 'g-treats-ice-cream-2']
);

assert.doesNotThrow(() =>
  assertSubmittedAnswersMatchRuntimeItems({
    answers: [{ itemId: 'item-1' }, { itemId: 'item-3' }],
    runtimeItems: submissionRuntimeItems,
  })
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [
        { itemId: 'item-1' },
        { itemId: 'item-2' },
        { itemId: 'item-3' },
        { itemId: 'item-4' },
      ],
      runtimeItems: submissionRuntimeItems,
    }),
  /exceed assignment item count/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'unknown-item' }],
      runtimeItems: submissionRuntimeItems,
    }),
  /unknown item/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }, { itemId: 'item-1' }],
      runtimeItems: submissionRuntimeItems,
    }),
  /duplicate item/
);

assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: undefined,
    timeLimitSeconds: 60,
  }),
  undefined
);
assert.equal(normalizeAttemptDurationSeconds({ durationSeconds: -3 }), 0);
assert.equal(normalizeAttemptDurationSeconds({ durationSeconds: 4.6 }), 5);
assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: 90,
    timeLimitSeconds: 60,
  }),
  60
);
assert.equal(formatAttemptDuration(undefined), '-');
assert.equal(formatAttemptDuration(undefined, { emptyValue: '' }), '');
assert.equal(formatAttemptDuration(0), '-');
assert.equal(formatAttemptDuration(4.6), '5s');
assert.equal(formatAttemptDuration(65), '1m 05s');
assert.equal(formatAttemptDuration(-3), '-');
assert.equal(formatAttemptDuration(65, { style: 'timer' }), '1:05');
assert.equal(formatAttemptDuration(5, { style: 'timer' }), '5s');
assert.deepEqual(summarizeAssignmentAttempts([]), {
  averageDurationSeconds: 0,
  averagePoints: 0,
  averageScore: 0,
  completions: 0,
});
assert.deepEqual(
  summarizeAssignmentAttempts([
    {
      resultJson: {
        accuracy: 50,
        completedItemCount: 1,
        correctItemCount: 1,
        durationSeconds: 30,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
    },
    {
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        durationSeconds: 61,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
    },
    {
      resultJson: {
        accuracy: 0,
        completedItemCount: 0,
        correctItemCount: 0,
        earnedPoints: 0,
        totalPoints: 2,
      },
      score: null,
    },
    {
      resultJson: null,
      score: null,
    },
  ]),
  {
    averageDurationSeconds: 46,
    averagePoints: 1,
    averageScore: 38,
    completions: 4,
  }
);

const resultRuntimeItems = [
  {
    answer: 'Paris / Paris, France',
    choices: ['Paris', 'Rome'],
    explanation: 'Paris is the capital of France.',
    id: 'q-1',
    kind: 'question',
    prompt: 'Capital of France?',
  },
  {
    answer: 'Cold',
    choices: ['Cold', 'Warm'],
    id: 'pair-1',
    kind: 'pair',
    prompt: 'Hot',
  },
] satisfies RuntimeItem[];

const resultAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          { answer: 'paris france', correct: true, itemId: 'q-1' },
          { answer: 'Warm', correct: false, itemId: 'pair-1' },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'attempt-1',
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        correctItemCount: 1,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
      studentName: ' Alice ',
    },
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          { answer: 'Paris', correct: true, itemId: 'q-1' },
          { answer: 'Cold', correct: true, itemId: 'pair-1' },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-02T10:00:00.000Z'),
      id: 'attempt-2',
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
      studentName: 'alice',
    },
    {
      anonymousToken: 'browser-token-1',
      answersJson: {
        answers: [{ answer: 'Rome', correct: false, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-03T10:00:00.000Z'),
      id: 'attempt-3',
      resultJson: {
        accuracy: 0,
        completedItemCount: 1,
        correctItemCount: 0,
        earnedPoints: 0,
        totalPoints: 2,
      },
      score: 0,
      studentName: null,
    },
  ],
  runtimeItems: resultRuntimeItems,
});

assert.equal(resultAnalysis.perItem[0]?.correctCount, 2);
assert.equal(resultAnalysis.perItem[0]?.submittedCount, 3);
assert.equal(resultAnalysis.perItem[0]?.correctRate, 67);
assert.deepEqual(resultAnalysis.perItem[0]?.acceptedAnswers, [
  'Paris',
  'Paris, France',
]);
assert.equal(
  resultAnalysis.attempts[0]?.answers[0]?.explanation,
  'Paris is the capital of France.'
);
assert.equal(resultAnalysis.attempts[0]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[1]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[2]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.latestAccuracy, 0);
assert.equal(resultAnalysis.students[1]?.studentKey, 'name:alice');
assert.equal(resultAnalysis.students[1]?.attempts, 2);
assert.equal(resultAnalysis.students[1]?.averageAccuracy, 75);
assert.equal(resultAnalysis.students[1]?.bestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.latestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.needsReviewCount, 0);
assert.equal(resultAnalysis.needsReview[0]?.itemId, 'pair-1');
assert.equal(resultAnalysis.needsReview[0]?.correctRate, 50);
assert.equal(
  normalizeResultSearch('  Anonymous   Student 1  '),
  'anonymous student 1'
);
assert.equal(matchesResultSearch('Anonymous student 1', 'student 1'), true);
assert.equal(matchesResultSearch(null, 'student 1'), false);
assert.equal(parseStudentSummarySort('best'), 'best');
assert.equal(parseStudentSummarySort('needs-review'), undefined);
assert.equal(parseItemPerformanceSort('submitted'), 'submitted');
assert.equal(parseItemPerformanceSort('original'), undefined);
assert.equal(parseAttemptReviewFilter('needs-review'), 'needs-review');
assert.equal(parseAttemptReviewFilter('all'), undefined);
assert.deepEqual(
  sortStudentSummaries(resultAnalysis.students, 'attempts').map(
    (student) => student.studentLabel
  ),
  ['Alice', 'Anonymous student 1']
);
assert.deepEqual(
  filterAndSortStudentSummaries({
    search: ' anonymous ',
    sort: 'needs-review',
    students: resultAnalysis.students,
  }).map((student) => student.studentLabel),
  ['Anonymous student 1']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'accuracy').map(
    (item) => item.itemId
  ),
  ['pair-1', 'q-1']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'submitted').map(
    (item) => item.itemId
  ),
  ['q-1', 'pair-1']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'type').map(
    (item) => item.itemId
  ),
  ['pair-1', 'q-1']
);
assert.equal(
  sortItemPerformance(resultAnalysis.perItem, 'original'),
  resultAnalysis.perItem
);
assert.deepEqual(
  buildFilteredAttemptRows({
    attempts: [
      { id: 'attempt-1', studentName: ' Alice ' },
      { id: 'attempt-2', studentName: 'alice' },
      { id: 'attempt-3', studentName: null },
    ],
    reviews: resultAnalysis.attempts,
    search: 'anonymous',
  }).map((row) => row.attempt.id),
  ['attempt-3']
);
assert.deepEqual(
  filterAttemptReviews({
    attempts: resultAnalysis.attempts,
    filter: 'needs-review',
    search: '',
  }).map((attempt) => attempt.id),
  ['attempt-1', 'attempt-3']
);
assert.deepEqual(
  filterAttemptReviews({
    attempts: resultAnalysis.attempts,
    filter: 'all',
    search: ' alice ',
  }).map((attempt) => attempt.id),
  ['attempt-1', 'attempt-2']
);

const csvExportData = {
  activity: {
    description: 'Original activity',
    templateType: 'quiz',
    title: 'Original Capitals',
  },
  analysis: resultAnalysis,
  assignment: {
    expiresAt: new Date('2026-01-10T10:00:00.000Z'),
    id: 'assignment-1',
    settingsJson: {
      collectStudentName: true,
      instructions: 'Use "complete sentences", then submit.',
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleItems: false,
      timeLimitSeconds: 60,
    },
    shareSlug: 'share-123',
    status: 'published',
    title: 'Capital Review, Week 1',
  },
  attempts: [
    {
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'attempt-1',
      maxScore: 2,
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        durationSeconds: 45,
        totalPoints: 2,
      },
      score: 1,
    },
  ],
  snapshot: {
    activityDescription: 'Snapshot description',
    activityTitle: 'Snapshot Capitals',
    templateType: 'quiz',
  },
  stats: {
    averageDurationSeconds: 45,
    averagePoints: 1,
    averageScore: 50,
    completions: 1,
  },
} satisfies Parameters<typeof buildAssignmentResultsCsv>[0];

const csv = buildAssignmentResultsCsv(csvExportData);
assert.ok(csv.startsWith('\uFEFF"assignment_id","assignment_title"'));
assert.match(csv, /"assignment-1","Capital Review, Week 1","share-123"/);
assert.match(csv, /"Use ""complete sentences"", then submit\."/);
assert.match(csv, /"Snapshot Capitals","quiz"/);
assert.match(csv, /"attempt-1","Alice","2026-01-01T10:00:00\.000Z"/);
assert.match(csv, /"Paris \| Paris, France","correct"/);
assert.match(csv, /"Paris is the capital of France\."/);
assert.equal(
  buildAssignmentResultsCsvFilename(csvExportData),
  'classgamify-capital-review-week-1-results.csv'
);

const classroomBrief = buildAssignmentClassroomBrief({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
  stats: csvExportData.stats,
  students: resultAnalysis.students,
});
assert.equal(classroomBrief.focusItems[0]?.itemId, 'pair-1');
assert.equal(
  classroomBrief.followUpStudents[0]?.studentLabel,
  'Anonymous student 1'
);
assert.match(
  classroomBrief.text,
  /ClassGamify classroom brief: Capital Review, Week 1/
);
assert.match(classroomBrief.text, /Completions: 1/);
assert.match(classroomBrief.text, /Average accuracy: 50%/);
assert.match(classroomBrief.text, /Average time: 45s/);
assert.match(
  classroomBrief.text,
  /- 1\. Match "Hot" with its pair\. \(50% correct, 1\/2\)/
);
assert.match(
  classroomBrief.text,
  /- 1\. Anonymous student 1: 0% latest, 1 item to review/
);

const reteachPlan = buildAssignmentReteachPlan({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
  students: resultAnalysis.students,
});
assert.match(reteachPlan, /ClassGamify reteach plan: Capital Review, Week 1/);
assert.match(reteachPlan, /Review first:/);
assert.match(reteachPlan, /Student follow-up:/);
assert.match(reteachPlan, /Match "Hot" with its pair\. \(50% correct, 1\/2\)/);
assert.match(
  reteachPlan,
  /Anonymous student 1: 0% latest accuracy, 1 item to review/
);

const itemReviewSummary = buildAssignmentItemReviewSummary({
  assignmentTitle: csvExportData.assignment.title,
  items: resultAnalysis.perItem,
});
assert.match(
  itemReviewSummary,
  /ClassGamify item review: Capital Review, Week 1/
);
assert.match(
  itemReviewSummary,
  /Capital of France\? \(question\) - 67% correct, 2\/3 correct/
);
assert.match(itemReviewSummary, /Expected: Paris \/ Paris, France\./);
assert.match(itemReviewSummary, /Accepted answers: Paris, Paris, France\./);
assert.match(itemReviewSummary, /Notes: Paris is the capital of France\./);

const studentFollowUpSummary = buildAssignmentStudentFollowUpSummary({
  assignmentTitle: csvExportData.assignment.title,
  students: resultAnalysis.students,
});
assert.match(
  studentFollowUpSummary,
  /ClassGamify student follow-up: Capital Review, Week 1/
);
assert.match(
  studentFollowUpSummary,
  /Anonymous student 1: latest 0%, average 0%, best 0%, 1 attempt, 1 item to review/
);
assert.match(
  studentFollowUpSummary,
  /Alice: latest 100%, average 75%, best 100%, 2 attempts, 0 items to review/
);

console.log('Domain tests passed.');
