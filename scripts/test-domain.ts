import assert from 'node:assert/strict';
import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import { stripJsonComments } from './parse-wrangler';
import {
  buildActivityLibraryCardSummary,
  buildActivityLibraryFilterSummary,
  buildActivityLibrarySummaryMetrics,
  summarizeActivityLibrary,
} from '@/activities/library-summary';
import {
  buildActivityLibraryRouteSearch,
  isActivityTemplateType,
  normalizeActivityLibrarySearch,
  parseActivityLibraryStatus,
  parseActivityTemplateFilter,
  parseCreateActivityTemplateSearch,
} from '@/activities/library-filters';
import {
  buildActivityDraftPrompt,
  createActivityInputFromAiDraft,
  createFallbackActivityDraft,
  createFallbackActivityDraftResult,
  type AiActivityDraft,
} from '@/activities/ai-draft';
import {
  activityTemplateByType,
  activityTemplates,
  formatActivityTemplateClassroomMode,
} from '@/activities/catalog';
import {
  DEFAULT_ACTIVITY_DRAFT_SOURCE,
  getActivityDraftSourceText,
} from '@/activities/draft-source';
import { buildActivityDraftMeta } from '@/activities/draft-meta';
import {
  ARCHIVED_ACTIVITY_DERIVATION_ERROR,
  assertActivityCanDeriveWork,
  canDeriveActivityWork,
  isActivityArchived,
} from '@/activities/lifecycle';
import {
  evaluateRuntimeAnswers,
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
  getActivityTemplateRunnerKind,
  getRuntimeItems,
} from '@/activities/runtime';
import {
  getActivityTemplateDraftGuidance,
  formatTemplateRequirementList,
  formatTemplateRequirement,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import {
  buildActivityContent,
  createActivityInputSchema,
} from '@/activities/validation';
import {
  activityContentToEditorInput,
  activityEditorDefaultInput,
  buildActivityEditorInitialValues,
  buildActivityEditorTemplateReadiness,
} from '@/activities/editor';
import { buildQuestionOptionTexts } from '@/activities/question-options';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import { worksheetModeDefinitions } from '@/activities/worksheet-modes';
import {
  buildDashboardOverviewMetrics,
  formatDashboardMetricValue,
} from '@/dashboard/overview';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import { summarizeAssignmentAttempts } from '@/assignments/attempt-stats';
import {
  buildAttemptTimerState,
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
} from '@/assignments/attempt-duration';
import {
  buildExclusiveChoiceAnswerChanges,
  findChoiceOwner,
} from '@/components/activities/runtime-choice-answers';
import {
  buildAssignmentDeliverySummary,
  buildPublicAssignmentRuleSummary,
  formatAssignmentItemCount,
} from '@/assignments/delivery-summary';
import {
  buildPublicAssignmentPayload,
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  buildPublicAttemptReviewItems,
  buildPublicAttemptReviewItemMap,
  stripRuntimeAnswer,
  stripRuntimeAnswers,
} from '@/assignments/public';
import {
  buildAssignmentListRouteSearch,
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  buildAssignmentListFilterSummary,
  buildAssignmentListSummaryMetrics,
} from '@/assignments/list-summary';
import {
  orderAssignmentRuntimeItems,
  stableShuffle,
} from '@/assignments/item-order';
import {
  buildAttemptReviewSubmissionSummary,
  buildFilteredAttemptRows,
  buildResultSearchSummary,
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
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultDate,
} from '@/assignments/result-format';
import {
  getSubmittedAssignmentReviewPriorityItems,
  sortAssignmentItemsByReviewPriority,
} from '@/assignments/review-priority';
import {
  getAssignmentStudentFollowUpPriorityStudents,
  sortAssignmentStudentsByFollowUpPriority,
} from '@/assignments/student-follow-up-priority';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvFilename,
} from '@/assignments/results-export';
import {
  buildPublishedAssignmentPanelContext,
  findPublishedAssignmentInList,
} from '@/assignments/published-assignment';
import {
  buildAssignmentSharePath,
  buildAssignmentShareUrl,
  normalizeShareBaseUrl,
} from '@/assignments/share-link';
import {
  buildAssignmentPublishInputFromDraft,
  formatAssignmentDateTimeLocal,
  parseAssignmentDateTimeLocal,
  parseOptionalWholeNumber,
} from '@/assignments/publish-input';
import { buildAssignmentStudentFollowUpSummary } from '@/assignments/student-follow-up-summary';
import {
  buildAnonymousAttemptTokenStorageKey,
  getOrCreateAnonymousAttemptToken,
} from '@/assignments/identity';
import {
  buildAttemptCompletionCopy,
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

assert.equal(
  JSON.parse(
    stripJsonComments(`{
      // Line comments should be removed.
      "script": "https://cloud.umami.is/script.js",
      "quote": "She said \\"// keep this\\"",
      /*
       * Block comments should be removed.
       */
      "enabled": true
    }`)
  ).script,
  'https://cloud.umami.is/script.js'
);

assert.equal(isStudentAnswerFilled(undefined), false);
assert.equal(isStudentAnswerFilled('   '), false);
assert.equal(isStudentAnswerFilled(' answer '), true);
assert.equal(
  buildAnonymousAttemptTokenStorageKey('share/one'),
  'classgamify:attempt-token:share/one'
);
const anonymousTokenStorage = new Map<string, string>();
const anonymousTokenStore = {
  getItem: (key: string) => anonymousTokenStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    anonymousTokenStorage.set(key, value);
  },
};
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-1',
    shareId: 'share-one',
    storage: anonymousTokenStore,
  }),
  'anon-token-1'
);
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-2',
    shareId: 'share-one',
    storage: anonymousTokenStore,
  }),
  'anon-token-1'
);
assert.equal(
  getOrCreateAnonymousAttemptToken({
    createToken: () => 'anon-token-3',
    shareId: 'share-two',
    storage: anonymousTokenStore,
  }),
  'anon-token-3'
);
assert.equal(
  findChoiceOwner({ 'item-1': 'Paris', 'item-2': 'Rome' }, 'Rome'),
  'item-2'
);
assert.equal(
  findChoiceOwner({ 'item-1': 'Paris', 'item-2': 'Rome' }, 'Berlin'),
  undefined
);
assert.deepEqual(
  buildExclusiveChoiceAnswerChanges({
    answers: { 'item-1': 'Paris' },
    choice: 'Rome',
    itemId: 'item-2',
  }),
  [{ answer: 'Rome', itemId: 'item-2' }]
);
assert.deepEqual(
  buildExclusiveChoiceAnswerChanges({
    answers: { 'item-1': 'Paris', 'item-2': 'Rome' },
    choice: 'Paris',
    itemId: 'item-2',
  }),
  [
    { answer: '', itemId: 'item-1' },
    { answer: 'Paris', itemId: 'item-2' },
  ]
);
assert.deepEqual(
  buildExclusiveChoiceAnswerChanges({
    answers: { 'item-1': 'Paris' },
    choice: 'Paris',
    itemId: 'item-1',
  }),
  [{ answer: 'Paris', itemId: 'item-1' }]
);

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
  buildAttemptCompletionCopy({
    completionSummary: incompleteCompletionSummary,
    confirmIncompleteSubmit: false,
  }),
  {
    confirmIncompleteSubmit: '2 questions are still unanswered.',
    progressLabel: '1/3 answered',
    submitButtonLabel: 'Submit answers',
    unansweredLabel: '2 items left unanswered.',
  }
);
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: {
      answeredItemCount: 2,
      itemCount: 3,
      unansweredItemCount: 1,
    },
    confirmIncompleteSubmit: true,
  }),
  {
    confirmIncompleteSubmit: '1 question is still unanswered.',
    progressLabel: '2/3 answered',
    submitButtonLabel: 'Submit anyway',
    unansweredLabel: '1 item left unanswered.',
  }
);
assert.deepEqual(
  buildAttemptCompletionCopy({
    completionSummary: {
      answeredItemCount: 3,
      itemCount: 3,
      unansweredItemCount: 0,
    },
    confirmIncompleteSubmit: true,
  }),
  {
    confirmIncompleteSubmit: '0 questions are still unanswered.',
    progressLabel: '3/3 answered',
    submitButtonLabel: 'Submit answers',
    unansweredLabel: undefined,
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
assert.equal(parseOptionalWholeNumber(''), undefined);
assert.equal(parseOptionalWholeNumber(' 12 '), 12);
assert.equal(parseOptionalWholeNumber('1.5'), undefined);
assert.equal(parseOptionalWholeNumber('abc'), undefined);
assert.equal(parseAssignmentDateTimeLocal(''), null);
assert.equal(parseAssignmentDateTimeLocal('not-a-date'), null);
assert.equal(
  parseAssignmentDateTimeLocal('2026-01-10T09:30')?.getFullYear(),
  2026
);
assert.match(
  formatAssignmentDateTimeLocal(new Date('2026-01-10T09:30:00.000Z')),
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: false,
    expiresAtLocal: '2026-01-10T09:30',
    instructions: '  Finish before class.  ',
    maxAttempts: '3',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: false,
    shuffleItems: false,
    timeLimitMinutes: '15',
    title: '  Week 1 review  ',
  }),
  {
    input: {
      activityId: 'activity-1',
      expiresAt: new Date('2026-01-10T09:30').toISOString(),
      settings: {
        collectStudentName: false,
        instructions: 'Finish before class.',
        maxAttempts: 3,
        showCorrectAnswers: false,
        shuffleItems: false,
        timeLimitSeconds: 900,
      },
      title: 'Week 1 review',
    },
    ok: true,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '   ',
    maxAttempts: '2',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Untimed homework',
  }),
  {
    input: {
      activityId: 'activity-1',
      expiresAt: undefined,
      settings: {
        collectStudentName: true,
        instructions: undefined,
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: true,
        timeLimitSeconds: undefined,
      },
      title: 'Untimed homework',
    },
    ok: true,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: '  ',
  }),
  {
    message: 'Add an assignment title before publishing.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '11',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Max attempts must be a whole number from 1 to 10.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '',
    instructions: '',
    maxAttempts: '2',
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '1.5',
    title: 'Week 1 review',
  }),
  {
    message: 'Time limit must be a whole number from 1 to 180 minutes.',
    ok: false,
  }
);
assert.deepEqual(
  buildAssignmentPublishInputFromDraft({
    activityId: 'activity-1',
    collectStudentName: true,
    expiresAtLocal: '2025-12-31T23:59',
    instructions: '',
    maxAttempts: '2',
    now: new Date('2026-01-01T00:00:00.000Z'),
    showCorrectAnswers: true,
    shuffleItems: true,
    timeLimitMinutes: '',
    title: 'Week 1 review',
  }),
  {
    message: 'Close time must be in the future.',
    ok: false,
  }
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
assert.deepEqual(
  buildPublishedAssignmentPanelContext({
    isLoading: false,
    items: publishedAssignments,
    shareSlug: 'share-2',
  }),
  {
    assignment: publishedAssignments[1]?.assignment,
    body: 'Copy the student link for your class, open the student preview, or jump into the results page before submissions arrive.',
    showMissingHint: false,
    status: 'found',
    title: 'Week 2',
  }
);
assert.deepEqual(
  buildPublishedAssignmentPanelContext({
    isLoading: true,
    items: [],
    shareSlug: 'share-2',
  }),
  {
    body: 'Loading the newly published assignment link and classroom actions.',
    showMissingHint: false,
    status: 'loading',
    title: 'Student share link is being prepared.',
  }
);
assert.deepEqual(
  buildPublishedAssignmentPanelContext({
    isLoading: false,
    items: publishedAssignments,
    shareSlug: 'missing',
  }),
  {
    body: 'Copy the student link for your class or open the student preview. Results will appear once the assignment is visible in this list.',
    showMissingHint: true,
    status: 'missing',
    title: 'Student share link is ready.',
  }
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
assert.equal(formatAssignmentItemCount(1), '1 item');
assert.equal(formatAssignmentItemCount(3), '3 items');
assert.deepEqual(
  buildPublicAssignmentRuleSummary({
    collectStudentName: false,
    expiresAt: null,
    itemCount: 1,
    maxAttempts: 2,
    showCorrectAnswers: false,
    timeLimitSeconds: 60,
  }),
  [
    { id: 'items', label: 'Items', value: '1 item' },
    { id: 'attempts', label: 'Attempts', value: '2 max' },
    { id: 'timer', label: 'Timer', value: '1 min' },
    { id: 'closes', label: 'Closes', value: 'No close time' },
    { id: 'identity', label: 'Student identity', value: 'Anonymous' },
    { id: 'answerReveal', label: 'Review', value: 'Hidden' },
  ]
);
const publicPayloadActivityContent = buildActivityContent({
  description: 'Original activity payload source',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer the current activity content.',
  pairsText: '',
  questionsText: 'Current prompt? | Current answer',
  sourceSummary: 'Current activity content',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Current activity',
  visibility: 'draft',
  vocabularyText: '',
});
const publicPayloadSnapshotContent = buildActivityContent({
  description: 'Frozen assignment payload source',
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer the frozen snapshot content.',
  pairsText: '',
  questionsText:
    'Frozen prompt? | Frozen answer / Frozen accepted | Frozen answer, Other | Frozen explanation',
  sourceSummary: 'Frozen snapshot content',
  subject: 'History',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Frozen activity',
  visibility: 'draft',
  vocabularyText: 'Frozen answer, Other',
});
const publicAssignmentPayload = buildPublicAssignmentPayload({
  activity: {
    contentJson: publicPayloadActivityContent,
    description: 'Current activity description',
    id: 'activity-public',
    templateType: 'quiz',
    title: 'Current activity title',
    visibility: 'draft',
  },
  assignment: {
    expiresAt: null,
    id: 'assignment-public',
    settingsJson: { collectStudentName: false },
    shareSlug: 'share-public',
    status: 'published',
    title: 'Public assignment',
  },
  snapshot: {
    activityDescription: 'Frozen activity description',
    activityTitle: 'Frozen activity title',
    contentJson: publicPayloadSnapshotContent,
    templateType: 'quiz',
  },
});
assert.equal(publicAssignmentPayload.activity.title, 'Frozen activity title');
assert.equal(
  publicAssignmentPayload.activity.description,
  'Frozen activity description'
);
assert.equal(publicAssignmentPayload.summary.subject, 'History');
assert.equal(publicAssignmentPayload.summary.gradeBand, 'Grade 4');
assert.equal(publicAssignmentPayload.summary.itemCount, 1);
assert.equal(publicAssignmentPayload.summary.estimatedMinutes, 5);
assert.equal(
  publicAssignmentPayload.assignment.settingsJson.collectStudentName,
  false
);
assert.equal(
  publicAssignmentPayload.assignment.settingsJson.showCorrectAnswers,
  true
);
assert.deepEqual(publicAssignmentPayload.snapshot, {
  activityDescription: 'Frozen activity description',
  activityTitle: 'Frozen activity title',
  templateType: 'quiz',
});
assert.equal(publicAssignmentPayload.runtimeItems[0]?.prompt, 'Frozen prompt?');
assert.equal('answer' in publicAssignmentPayload.runtimeItems[0]!, false);
assert.equal('explanation' in publicAssignmentPayload.runtimeItems[0]!, false);
assert.deepEqual(
  buildPublicAssignmentPreviewActivity(publicAssignmentPayload),
  {
    content: {
      difficulty: 'core',
      gradeBand: 'Grade 4',
      groups: [],
      language: 'en',
      learningGoal: 'Students answer the frozen snapshot content.',
      pairs: [],
      questions: [],
      sourceSummary: '',
      subject: 'History',
      teacherNotes: [],
      vocabulary: [],
    },
    description: 'Frozen activity description',
    estimatedMinutes: 5,
    id: 'activity-public',
    status: 'draft',
    templateType: 'quiz',
    title: 'Frozen activity title',
  }
);
assert.deepEqual(
  buildPublicAssignmentPreviewAssignment(publicAssignmentPayload),
  {
    activityId: 'activity-public',
    averageScore: 0,
    completions: 0,
    expiresAt: null,
    id: 'assignment-public',
    settings: publicAssignmentPayload.assignment.settingsJson,
    shareId: 'share-public',
    status: 'published',
    title: 'Public assignment',
  }
);
const publicReviewMap = buildPublicAttemptReviewItemMap([
  {
    acceptedAnswers: ['Paris', 'Paris, France'],
    correct: true,
    correctAnswer: 'Paris',
    explanation: 'Paris is the capital of France.',
    itemId: 'q-1',
  },
  {
    acceptedAnswers: ['Cold'],
    correct: false,
    correctAnswer: 'Cold',
    itemId: 'pair-1',
  },
]);
assert.equal(publicReviewMap.get('q-1')?.correctAnswer, 'Paris');
assert.equal(publicReviewMap.get('pair-1')?.correct, false);
assert.equal(publicReviewMap.get('missing'), undefined);
assert.equal(buildPublicAttemptReviewItemMap(undefined).size, 0);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
    runtimeItems: [
      {
        answer: 'Paris / Paris, France',
        explanation: 'Paris is the capital of France.',
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
    ],
    showCorrectAnswers: false,
  }),
  []
);
assert.deepEqual(
  buildPublicAttemptReviewItems({
    answers: [{ answer: 'Paris', correct: true, itemId: 'q-1' }],
    runtimeItems: [
      {
        answer: 'Paris / Paris, France',
        explanation: 'Paris is the capital of France.',
        id: 'q-1',
        kind: 'question',
        prompt: 'Capital of France?',
      },
    ],
    showCorrectAnswers: true,
  }),
  [
    {
      acceptedAnswers: ['Paris', 'Paris, France'],
      correct: true,
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital of France.',
      itemId: 'q-1',
    },
  ]
);
const publicRuntimeItem = stripRuntimeAnswer({
  answer: 'Paris',
  choices: ['Paris', 'Rome'],
  explanation: 'Paris is the capital of France.',
  id: 'q-1',
  kind: 'question',
  prompt: 'Capital of France?',
});
assert.deepEqual(publicRuntimeItem, {
  choices: ['Paris', 'Rome'],
  id: 'q-1',
  kind: 'question',
  prompt: 'Capital of France?',
});
assert.equal('answer' in publicRuntimeItem, false);
assert.equal('explanation' in publicRuntimeItem, false);
assert.deepEqual(
  stripRuntimeAnswers([
    {
      answer: 'Paris',
      explanation: 'Paris is the capital of France.',
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
  ]),
  [
    {
      choices: undefined,
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
  ]
);
assert.equal(normalizeActivityLibrarySearch('  word   match  '), 'word match');
assert.equal(normalizeActivityLibrarySearch('   '), undefined);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 1,
    q: '  word   match  ',
    status: 'active',
    template: 'all',
  }),
  {
    created: 'activity-1',
    page: undefined,
    q: 'word match',
    status: undefined,
    template: undefined,
  }
);
assert.deepEqual(
  buildActivityLibraryRouteSearch({
    created: 'activity-1',
    page: 3,
    q: ' sort ',
    status: 'archived',
    template: 'group-sort',
  }),
  {
    created: 'activity-1',
    page: 3,
    q: 'sort',
    status: 'archived',
    template: 'group-sort',
  }
);
assert.equal(parseActivityLibraryStatus('archived'), 'archived');
assert.equal(parseActivityLibraryStatus('deleted'), undefined);
assert.equal(parseActivityTemplateFilter('group-sort'), 'group-sort');
assert.equal(parseActivityTemplateFilter('flashcards'), undefined);
assert.equal(parseCreateActivityTemplateSearch('line-match'), 'line-match');
assert.equal(parseCreateActivityTemplateSearch('worksheet'), undefined);
assert.equal(parseCreateActivityTemplateSearch(['quiz']), undefined);
assert.equal(isActivityTemplateType('open-box'), true);
assert.equal(isActivityTemplateType('memory-game'), false);
assert.deepEqual(
  activityTemplates.map((template) => template.type),
  ACTIVITY_TEMPLATE_TYPES
);
assert.equal(activityTemplates.length, 8);
assert.deepEqual(
  Object.keys(activityTemplateByType).sort(),
  [...ACTIVITY_TEMPLATE_TYPES].sort()
);
assert.equal(formatActivityTemplateClassroomMode('individual'), 'Individual');
assert.equal(formatActivityTemplateClassroomMode('small-group'), 'Small group');
assert.equal(formatActivityTemplateClassroomMode('whole-class'), 'Whole class');
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  assert.equal(activityTemplateByType[templateType].type, templateType);
  assert.ok(activityTemplateByType[templateType].name.length > 0);
  assert.ok(
    activityTemplateByType[templateType].contentRequirements.length > 0
  );
}
assert.deepEqual(
  worksheetModeDefinitions.map((mode) => mode.template),
  ['fill-blank', 'line-match', 'listening', 'group-sort']
);
assert.equal(
  worksheetModeDefinitions.every((mode) =>
    isActivityTemplateType(mode.template)
  ),
  true
);
assert.equal(
  worksheetModeDefinitions.every(
    (mode) => mode.action.length > 0 && mode.description.length > 0
  ),
  true
);
assert.equal(formatDashboardMetricValue(undefined), '-');
assert.equal(formatDashboardMetricValue(0), '0');
assert.deepEqual(
  buildDashboardOverviewMetrics({
    isLoading: true,
  }),
  [
    {
      description: 'Loading your library...',
      id: 'activities',
      label: 'Activities',
      value: '-',
    },
    {
      description: 'Template families represented by your active activities',
      id: 'templates',
      label: 'Templates',
      value: `0/${activityTemplates.length}`,
    },
    {
      description: 'Open classroom share links',
      id: 'assignments',
      label: 'Assignments',
      value: '-',
    },
    {
      description: '0 submitted attempts logged',
      id: 'results',
      label: 'Results',
      value: '0%',
    },
  ]
);
assert.deepEqual(
  buildDashboardOverviewMetrics({
    activitySummary: {
      draftActivities: 2,
      templateCoverage: 5,
      totalActivities: 9,
    },
    assignmentSummary: {
      averageScore: 82,
      completions: 14,
      openAssignments: 3,
    },
    isLoading: false,
  }),
  [
    {
      description: '2 drafts in your active library',
      id: 'activities',
      label: 'Activities',
      value: '9',
    },
    {
      description: 'Template families represented by your active activities',
      id: 'templates',
      label: 'Templates',
      value: `5/${activityTemplates.length}`,
    },
    {
      description: 'Open classroom share links',
      id: 'assignments',
      label: 'Assignments',
      value: '3',
    },
    {
      description: '14 submitted attempts logged',
      id: 'results',
      label: 'Results',
      value: '82%',
    },
  ]
);
assert.equal(isActivityArchived('archived'), true);
assert.equal(isActivityArchived('draft'), false);
assert.equal(canDeriveActivityWork('draft'), true);
assert.equal(canDeriveActivityWork('published'), true);
assert.equal(canDeriveActivityWork('archived'), false);
assert.doesNotThrow(() => assertActivityCanDeriveWork('draft'));
assert.throws(
  () => assertActivityCanDeriveWork('archived'),
  new Error(ARCHIVED_ACTIVITY_DERIVATION_ERROR)
);
assert.equal(normalizeAssignmentListSearch('  share   123  '), 'share 123');
assert.equal(normalizeAssignmentListSearch('   '), undefined);
assert.deepEqual(
  buildAssignmentListRouteSearch({
    page: 1,
    published: 'share-1',
    q: '  share   123  ',
    status: 'all',
  }),
  {
    page: undefined,
    published: 'share-1',
    q: 'share 123',
    status: undefined,
  }
);
assert.deepEqual(
  buildAssignmentListRouteSearch({
    page: 4,
    published: 'share-1',
    q: ' week ',
    status: 'closed',
  }),
  {
    page: 4,
    published: 'share-1',
    q: 'week',
    status: 'closed',
  }
);
assert.equal(parseAssignmentStatusFilter('published'), 'published');
assert.equal(parseAssignmentStatusFilter('all'), undefined);
assert.deepEqual(
  buildAssignmentListFilterSummary({
    isLoading: true,
    search: undefined,
    status: 'all',
    total: 0,
  }),
  { hasFilters: false, text: 'Loading assignments...' }
);
assert.deepEqual(
  buildAssignmentListFilterSummary({
    isLoading: false,
    search: undefined,
    status: 'all',
    total: 1,
  }),
  { hasFilters: false, text: '1 total assignment' }
);
assert.deepEqual(
  buildAssignmentListFilterSummary({
    isLoading: false,
    search: 'week',
    status: 'published',
    total: 2,
  }),
  { hasFilters: true, text: '2 matches' }
);
assert.deepEqual(
  buildAssignmentListSummaryMetrics({
    hasFilters: false,
    totalAssignments: 0,
  }),
  [
    { id: 'total', label: 'Assignments', value: '0' },
    { id: 'open', label: 'Open links', value: '0' },
    { id: 'completions', label: 'Completions', value: '0' },
    { id: 'average', label: 'Average', value: '0%' },
  ]
);
assert.deepEqual(
  buildAssignmentListSummaryMetrics({
    hasFilters: true,
    summary: {
      averageScore: 76,
      completions: 11,
      openAssignments: 2,
      totalAssignments: 5,
    },
    totalAssignments: 99,
  }),
  [
    { id: 'total', label: 'Matching', value: '5' },
    { id: 'open', label: 'Open links', value: '2' },
    { id: 'completions', label: 'Completions', value: '11' },
    { id: 'average', label: 'Average', value: '76%' },
  ]
);
const questionOnlyContent = buildActivityContent({
  description: 'Question only activity',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer quick review questions.',
  pairsText: '',
  questionsText: ['Capital of France? | Paris', '2 + 2? | 4'].join('\n'),
  sourceSummary: 'Quick review',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Question review',
  visibility: 'draft',
  vocabularyText: '',
});
assert.deepEqual(
  buildQuestionOptionTexts({
    answer: 'Paris',
    options: [' paris ', 'Rome', 'ROME', 'Berlin', 'Madrid', 'Lisbon'],
  }),
  ['Paris', 'Rome', 'Berlin', 'Madrid', 'Lisbon']
);
const optionRoundTripContent = buildActivityContent({
  description: 'Question option normalization',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students answer normalized option questions.',
  pairsText: '',
  questionsText: 'Capital of France? | Paris | paris, Rome, ROME, Berlin',
  sourceSummary: 'Option normalization check',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Option normalization',
  visibility: 'draft',
  vocabularyText: '',
});
assert.deepEqual(
  optionRoundTripContent.questions[0]?.options.map((option) => option.text),
  ['Paris', 'Rome', 'Berlin']
);
assert.equal(
  activityContentToEditorInput({
    content: optionRoundTripContent,
    description: 'Question option normalization',
    templateType: 'quiz',
    title: 'Option normalization',
    visibility: 'draft',
  }).questionsText,
  'Capital of France? | Paris | Paris, Rome, Berlin'
);
assert.doesNotThrow(() =>
  buildActivityContent(
    createActivityInputSchema.parse(activityEditorDefaultInput)
  )
);
assert.equal(buildActivityEditorInitialValues(undefined), undefined);
assert.deepEqual(buildActivityEditorInitialValues('group-sort'), {
  ...activityEditorDefaultInput,
  ...getActivityTemplateScaffold('group-sort'),
  templateType: 'group-sort',
  visibility: 'draft',
});
const editorQuestionReadiness = buildActivityEditorTemplateReadiness({
  description: 'Editor readiness helper',
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  groupsText: '',
  language: 'en',
  learningGoal: 'Students can answer a question from editor input.',
  pairsText: '',
  questionsText: 'Capital of France? | Paris | Paris, Rome',
  sourceSummary: 'Editor readiness source',
  subject: 'General',
  teacherNotesText: '',
  templateType: 'quiz',
  title: 'Editor readiness',
  visibility: 'draft',
  vocabularyText: '',
});
assert.equal(editorQuestionReadiness?.currentTemplateType, 'quiz');
assert.equal(
  editorQuestionReadiness?.options.find(
    (option) => option.template.type === 'quiz'
  )?.diagnosis,
  'Quiz is selected and ready.'
);
assert.equal(
  buildActivityEditorTemplateReadiness({
    ...createActivityInputSchema.parse({
      description: 'Invalid template readiness',
      difficulty: 'starter',
      gradeBand: 'Grade 3',
      groupsText: '',
      language: 'en',
      learningGoal: 'Students can answer a question from editor input.',
      pairsText: '',
      questionsText: 'Capital of France? | Paris',
      sourceSummary: 'Editor readiness source',
      subject: 'General',
      teacherNotesText: '',
      templateType: 'quiz',
      title: 'Editor readiness',
      visibility: 'draft',
      vocabularyText: '',
    }),
    title: 'No',
  }),
  null
);
assert.equal(
  buildActivityEditorTemplateReadiness({
    description: 'Invalid editor rows',
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    groupsText: '',
    language: 'en',
    learningGoal: 'Students can answer a question from editor input.',
    pairsText: '',
    questionsText: 'Missing answer only',
    sourceSummary: 'Editor readiness source',
    subject: 'General',
    teacherNotesText: '',
    templateType: 'quiz',
    title: 'Invalid editor rows',
    visibility: 'draft',
    vocabularyText: '',
  }),
  null
);
assert.throws(
  () =>
    buildActivityContent({
      description: 'Missing pairs',
      difficulty: 'starter',
      gradeBand: 'Grade 3',
      groupsText: '',
      language: 'en',
      learningGoal: 'Students match vocabulary terms to definitions.',
      pairsText: '',
      questionsText: 'Capital of France? | Paris',
      sourceSummary: 'Missing pairs check',
      subject: 'General',
      teacherNotesText: '',
      templateType: 'match-up',
      title: 'Missing pairs',
      visibility: 'draft',
      vocabularyText: '',
    }),
  /Add match pairs to unlock Match\./
);
const questionOnlyRemixPlan = getTemplateRemixPlan({
  content: questionOnlyContent,
  currentTemplateType: 'quiz',
});
assert.ok(questionOnlyRemixPlan.readyOptions.length > 0);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'quiz'
  )?.isCurrent,
  true
);
assert.equal(
  questionOnlyRemixPlan.suggestedOptions.some(
    (option) => option.template.type === 'quiz'
  ),
  false
);
assert.deepEqual(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.missingRequirements,
  ['pairs']
);
assert.deepEqual(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.missingRequirementLabels,
  ['match pairs']
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.missingRequirementCount,
  1
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.readinessLabel,
  'Needs more content'
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'match-up'
  )?.diagnosis,
  'Add match pairs to unlock Match.'
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'quiz'
  )?.diagnosis,
  'Quiz is selected and ready.'
);
assert.equal(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'fill-blank'
  )?.diagnosis,
  'Ready to remix into Fill.'
);
assert.deepEqual(
  questionOnlyRemixPlan.options.find(
    (option) => option.template.type === 'group-sort'
  )?.missingRequirements,
  ['groups']
);
const questionOnlyCardSummary = buildActivityLibraryCardSummary({
  content: questionOnlyContent,
  templateType: 'quiz',
});
assert.deepEqual(questionOnlyCardSummary.contentCounts, {
  groups: 0,
  pairs: 0,
  questions: 2,
});
assert.deepEqual(
  questionOnlyCardSummary.readyTemplateOptions.map((option) => option.template),
  ['quiz', 'fill-blank', 'listening', 'open-box']
);
assert.deepEqual(
  questionOnlyCardSummary.suggestedTemplateOptions.map(
    (option) => option.template
  ),
  ['fill-blank', 'listening', 'open-box']
);
assert.ok(
  questionOnlyCardSummary.lockedTemplateDiagnostics.includes(
    'Add match pairs to unlock Match.'
  )
);
assert.equal(formatTemplateRequirement('pairs'), 'match pairs');
assert.equal(formatTemplateRequirement('learningGoal'), 'learning goal');
assert.equal(formatTemplateRequirementList(['questions']), 'questions');
assert.equal(
  formatTemplateRequirementList(['questions', 'match pairs']),
  'questions and match pairs'
);
assert.equal(
  formatTemplateRequirementList(['questions', 'match pairs', 'groups']),
  'questions, match pairs, and groups'
);
const completeScaffoldContent = buildActivityContent({
  ...getActivityTemplateScaffold('group-sort'),
  difficulty: 'starter',
  gradeBand: 'Primary',
  language: 'en',
  templateType: 'group-sort',
  visibility: 'draft',
});
const completeScaffoldCardSummary = buildActivityLibraryCardSummary({
  content: completeScaffoldContent,
  templateType: 'group-sort',
});
const librarySummary = summarizeActivityLibrary([
  {
    contentJson: questionOnlyContent,
    templateType: 'quiz',
    visibility: 'draft',
  },
  {
    contentJson: completeScaffoldContent,
    templateType: 'group-sort',
    visibility: 'archived',
  },
]);
assert.equal(librarySummary.totalActivities, 2);
assert.equal(librarySummary.draftActivities, 1);
assert.equal(librarySummary.archivedActivities, 1);
assert.equal(librarySummary.templateCoverage, 2);
assert.equal(
  librarySummary.totalReadyTemplateOptions,
  questionOnlyCardSummary.readyTemplateOptions.length +
    completeScaffoldCardSummary.readyTemplateOptions.length
);
assert.equal(librarySummary.remixReadyActivities, 2);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: true,
    search: undefined,
    status: 'active',
    template: 'all',
    total: 0,
  }),
  { hasFilters: false, text: 'Loading activities...' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: 'food',
    status: 'active',
    template: 'all',
    total: 1,
  }),
  { hasFilters: true, text: '1 match' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: undefined,
    status: 'archived',
    template: 'all',
    total: 2,
  }),
  { hasFilters: false, text: '2 archived activities' }
);
assert.deepEqual(
  buildActivityLibraryFilterSummary({
    isLoading: false,
    search: undefined,
    status: 'archived',
    template: 'quiz',
    total: 0,
  }),
  { hasFilters: true, text: '0 matches' }
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: false,
    totalActivities: 0,
  }),
  [
    { id: 'total', label: 'Activities', value: '0' },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: `0/${activityTemplates.length}`,
    },
    { id: 'remix', label: 'Ready to remix', value: '0' },
    { id: 'readyModes', label: 'Ready modes', value: '0' },
  ]
);
assert.deepEqual(
  buildActivityLibrarySummaryMetrics({
    hasFilters: true,
    summary: librarySummary,
    totalActivities: 99,
  }),
  [
    { id: 'total', label: 'Matching activities', value: '2' },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: `2/${activityTemplates.length}`,
    },
    { id: 'remix', label: 'Ready to remix', value: '2' },
    {
      id: 'readyModes',
      label: 'Ready modes',
      value: String(librarySummary.totalReadyTemplateOptions),
    },
  ]
);
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const scaffold = getActivityTemplateScaffold(templateType);
  const input = createActivityInputSchema.parse({
    ...scaffold,
    difficulty: 'starter',
    gradeBand: 'Primary',
    language: 'en',
    templateType,
    visibility: 'draft',
  });
  const content = buildActivityContent(input);
  const runtimeItems = getRuntimeItems(templateType, content);
  const scaffoldRemixPlan = getTemplateRemixPlan({
    content,
    currentTemplateType: templateType,
  });

  assert.ok(content.questions.length >= 3);
  assert.ok(content.pairs.length >= 3);
  assert.ok(content.groups.length >= 2);
  assert.ok(content.vocabulary.length >= 3);
  assert.ok(content.teacherNotes.length >= 1);
  assert.ok(runtimeItems.length >= 3);
  assert.ok(
    scaffoldRemixPlan.readyOptions.some(
      (option) => option.template.type === templateType
    )
  );
}
assert.deepEqual(
  ACTIVITY_TEMPLATE_TYPES.map((templateType) => [
    templateType,
    getActivityTemplateRunnerKind(templateType),
  ]),
  [
    ['quiz', 'choice-list'],
    ['match-up', 'choice-list'],
    ['line-match', 'line-match'],
    ['group-sort', 'group-sort'],
    ['fill-blank', 'fill-blank'],
    ['listening', 'listening'],
    ['matching-pairs', 'matching-pairs'],
    ['open-box', 'open-box'],
  ]
);
assert.deepEqual(
  [
    {
      answer: 'Paris',
      id: 'q-1',
      kind: 'question',
      prompt: 'Capital of France?',
    },
    {
      answer: 'Cold',
      choices: ['Cold', 'Warm'],
      id: 'p-1',
      kind: 'pair',
      prompt: 'Hot',
    },
    {
      answer: 'Fruit',
      choices: ['Fruit', 'Drink'],
      id: 'g-1-apple',
      kind: 'group-item',
      prompt: 'Apple',
    },
  ].map((item) => [
    formatRuntimeItemPrompt(item),
    formatRuntimeItemKindLabel(item),
  ]),
  [
    ['Capital of France?', 'Question'],
    ['Match "Hot" with its pair.', 'Pair'],
    ['Choose the group for "Apple".', 'Group item'],
  ]
);
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
const fillBlankDraftPrompt = buildActivityDraftPrompt({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 5,
  language: 'en',
  sourceText: 'plants, root, stem, leaf',
  subject: 'Science',
  templateType: 'fill-blank',
});
assert.match(fillBlankDraftPrompt, /Template requirements: questions/);
assert.match(fillBlankDraftPrompt, /worksheet sentence with ___/);
const groupSortDraftPrompt = buildActivityDraftPrompt({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 5,
  language: 'en',
  sourceText: 'solid, liquid, gas',
  subject: 'Science',
  templateType: 'group-sort',
});
assert.match(groupSortDraftPrompt, /Template requirements: groups/);
assert.match(groupSortDraftPrompt, /Make groups the primary structure/);
const draftPromptInput = {
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 4,
  language: 'en',
  sourceText: 'shared source notes for template prompt coverage',
  subject: 'Science',
} as const;
for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
  const prompt = buildActivityDraftPrompt({
    ...draftPromptInput,
    templateType,
  });
  const guidance = getActivityTemplateDraftGuidance(templateType);

  assert.ok(guidance.length > 20);
  assert.match(prompt, /Template requirements:/);
  assert.match(prompt, /Template guidance:/);
  assert.ok(prompt.includes(guidance));
  assert.match(prompt, /Target item count: 4/);
  assert.match(
    prompt,
    /Source notes: shared source notes for template prompt coverage/
  );
  assert.match(prompt, /Return JSON only\./);
}
assert.match(getActivityTemplateDraftGuidance('listening'), /spoken aloud/);
assert.match(getActivityTemplateDraftGuidance('open-box'), /reveal-card/);
assert.match(getActivityTemplateDraftGuidance('line-match'), /line matching/);
assert.match(
  getActivityTemplateDraftGuidance('matching-pairs'),
  /memory-style cards/
);
const fallbackDraftResult = createFallbackActivityDraftResult({
  input: {
    difficulty: 'starter',
    gradeBand: 'Grade 2',
    itemCount: 5,
    language: 'en',
    sourceText:
      'weather, sunny, rainy, cloudy, windy; students classify weather words and answer simple listening prompts',
    subject: 'Science',
    templateType: 'listening',
  },
  model: 'test-model',
  notice: 'Fallback used for testing.',
});
const fallbackContent = buildActivityContent(fallbackDraft);
const fallbackRemixPlan = getTemplateRemixPlan({
  content: fallbackContent,
  currentTemplateType: fallbackDraft.templateType,
});
const fallbackDraftMeta = buildActivityDraftMeta({
  activity: fallbackDraft,
  currentTemplateType: fallbackDraft.templateType,
});
assert.equal(fallbackDraft.templateType, 'listening');
assert.equal(fallbackDraftResult.provider, 'fallback');
assert.equal(fallbackDraftResult.model, 'test-model');
assert.equal(fallbackDraftResult.notice, 'Fallback used for testing.');
assert.equal(fallbackDraftResult.activity.templateType, 'listening');
assert.equal(fallbackDraftResult.meta.coverage.questions, 5);
assert.equal(
  fallbackDraftResult.meta.readyTemplateCount,
  fallbackDraftResult.meta.readyTemplates.length
);
assert.ok(
  fallbackDraftResult.meta.templateReadiness.some(
    (option) =>
      option.template === 'listening' &&
      option.isCurrent &&
      option.diagnosis === 'Listen is selected and ready.'
  )
);
assert.ok(
  fallbackDraftResult.meta.reviewChecklist.some((item) =>
    item.includes('Review every answer')
  )
);
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
assert.deepEqual(fallbackDraftMeta.coverage, fallbackDraftResult.meta.coverage);
assert.equal(
  fallbackDraftMeta.readyTemplateCount,
  fallbackDraftMeta.readyTemplates.length
);
assert.deepEqual(
  fallbackDraftMeta.readyTemplateOptions.map((option) => option.shortName),
  fallbackDraftMeta.readyTemplates
);
assert.ok(
  fallbackDraftMeta.readyTemplateOptions.some(
    (option) => option.template === 'listening' && option.shortName === 'Listen'
  )
);
assert.equal(
  fallbackDraftMeta.suggestedTemplateCount,
  fallbackDraftMeta.suggestedTemplates.length
);
assert.deepEqual(
  fallbackDraftMeta.suggestedTemplateOptions.map((option) => option.shortName),
  fallbackDraftMeta.suggestedTemplates
);
assert.equal(
  fallbackDraftMeta.suggestedTemplateOptions.every(
    (option) => option.template !== fallbackDraft.templateType
  ),
  true
);
assert.ok(
  fallbackDraftMeta.templateReadiness.some(
    (option) =>
      option.template === 'listening' &&
      option.isCurrent &&
      option.readinessLabel === 'Ready'
  )
);
assert.ok(
  fallbackDraftMeta.reviewChecklist.some((item) =>
    item.includes('Ready to remix after saving')
  )
);
const oversizedAiDraft = {
  description: 'Oversized AI draft for item count shaping.',
  groups: [
    { label: 'Animals', items: ['cat', 'dog', 'bird'] },
    { label: 'Plants', items: ['tree', 'flower', 'grass'] },
    { label: 'Weather', items: ['rain', 'snow', 'wind'] },
  ],
  learningGoal: 'Students can classify and answer lesson review prompts.',
  pairs: [
    { left: 'cat', right: 'animal' },
    { left: 'tree', right: 'plant' },
    { left: 'rain', right: 'weather' },
    { left: 'dog', right: 'animal' },
    { left: 'flower', right: 'plant' },
  ],
  questions: [
    {
      answer: 'cat',
      explanation: 'A cat is an animal.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is an animal?',
    },
    {
      answer: 'tree',
      explanation: 'A tree is a plant.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is a plant?',
    },
    {
      answer: 'rain',
      explanation: 'Rain is weather.',
      options: ['cat', 'tree', 'rain'],
      prompt: 'Which word is weather?',
    },
    {
      answer: 'dog',
      explanation: 'A dog is an animal.',
      options: ['dog', 'grass', 'snow'],
      prompt: 'Which word names an animal?',
    },
    {
      answer: 'flower',
      explanation: 'A flower is a plant.',
      options: ['bird', 'flower', 'wind'],
      prompt: 'Which word names a plant?',
    },
  ],
  sourceSummary: 'Words about animals, plants, and weather.',
  teacherNotes: ['Review AI output before assigning.'],
  title: 'Nature word sort',
  vocabulary: ['cat', 'dog', 'bird', 'tree', 'flower', 'rain', 'snow'],
} satisfies AiActivityDraft;
const aiDraftInputBase = {
  difficulty: 'starter',
  gradeBand: 'Grade 2',
  itemCount: 3,
  language: 'en',
  sourceText: 'cat, dog, bird, tree, flower, rain, snow',
  subject: 'Science',
} as const;
const shapedQuizDraft = createActivityInputFromAiDraft({
  draft: oversizedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'quiz',
  },
});
assert.equal(
  getRuntimeItems('quiz', buildActivityContent(shapedQuizDraft)).length,
  3
);
const shapedMatchDraft = createActivityInputFromAiDraft({
  draft: oversizedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'match-up',
  },
});
assert.equal(
  getRuntimeItems('match-up', buildActivityContent(shapedMatchDraft)).length,
  3
);
const shapedGroupSortDraft = createActivityInputFromAiDraft({
  draft: oversizedAiDraft,
  input: {
    ...aiDraftInputBase,
    templateType: 'group-sort',
  },
});
assert.deepEqual(
  buildActivityContent(shapedGroupSortDraft).groups.map((group) => [
    group.label,
    group.items,
  ]),
  [
    ['Animals', ['cat']],
    ['Plants', ['tree']],
    ['Weather', ['rain']],
  ]
);
assert.equal(
  getRuntimeItems('group-sort', buildActivityContent(shapedGroupSortDraft))
    .length,
  3
);
const questionOnlyDraftMeta = buildActivityDraftMeta({
  activity: {
    description: 'Question only draft',
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    groupsText: '',
    language: 'en',
    learningGoal: 'Students answer quick review questions.',
    pairsText: '',
    questionsText: 'Capital of France? | Paris',
    sourceSummary: 'Question only source',
    subject: 'General',
    teacherNotesText: '',
    templateType: 'quiz',
    title: 'Question only draft',
    visibility: 'draft',
    vocabularyText: '',
  },
  currentTemplateType: 'quiz',
});
assert.ok(
  questionOnlyDraftMeta.reviewChecklist.includes(
    'Next content gap: Add match pairs to unlock Match.'
  )
);
const lockedOnlyDraftMeta = buildActivityDraftMeta({
  activity: {
    description: 'Group only draft',
    difficulty: 'starter',
    gradeBand: 'Grade 3',
    groupsText: 'Fruit | apple, banana\nDrink | milk, water',
    language: 'en',
    learningGoal: 'Students sort vocabulary terms into groups.',
    pairsText: '',
    questionsText: '',
    sourceSummary: 'Group only source',
    subject: 'General',
    teacherNotesText: '',
    templateType: 'group-sort',
    title: 'Group only draft',
    visibility: 'draft',
    vocabularyText: 'apple, banana, milk, water',
  },
  currentTemplateType: 'group-sort',
});
assert.ok(
  lockedOnlyDraftMeta.reviewChecklist.includes('Add questions to unlock Quiz.')
);
const fallbackFillBlankDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'plants, root, stem, leaf',
  subject: 'Science',
  templateType: 'fill-blank',
});
const fallbackFillBlankContent = buildActivityContent(fallbackFillBlankDraft);
assert.ok(
  fallbackFillBlankContent.questions.every((question) =>
    question.prompt.includes('___')
  )
);
assert.equal(getRuntimeItems('fill-blank', fallbackFillBlankContent).length, 3);
const fallbackListeningDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'weather, sunny, rainy, windy',
  subject: 'Science',
  templateType: 'listening',
});
const fallbackListeningContent = buildActivityContent(fallbackListeningDraft);
assert.ok(
  fallbackListeningContent.questions.every((question) =>
    question.prompt.startsWith('Listen to this sentence:')
  )
);
assert.equal(getRuntimeItems('listening', fallbackListeningContent).length, 3);
const fallbackOpenBoxDraft = createFallbackActivityDraft({
  difficulty: 'starter',
  gradeBand: 'Grade 3',
  itemCount: 3,
  language: 'en',
  sourceText: 'community, helper, school, clinic',
  subject: 'Social studies',
  templateType: 'open-box',
});
const fallbackOpenBoxContent = buildActivityContent(fallbackOpenBoxDraft);
assert.ok(
  fallbackOpenBoxContent.questions.every((question) =>
    question.prompt.startsWith('Open the box')
  )
);
assert.ok(
  fallbackOpenBoxContent.questions.every(
    (question) => question.options?.length === 1
  )
);
assert.equal(getRuntimeItems('open-box', fallbackOpenBoxContent).length, 3);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    questionsText: 'Question source',
    sourceSummary: '  Summary source  ',
    vocabularyText: 'Vocabulary source',
  }),
  'Summary source'
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    questionsText: 'Question source',
    sourceSummary: '   ',
    vocabularyText: '  Vocabulary source  ',
  }),
  'Vocabulary source'
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    questionsText: '  Question source  ',
    sourceSummary: '',
    vocabularyText: '',
  }),
  'Question source'
);
assert.equal(
  getActivityDraftSourceText({
    ...fallbackDraft,
    questionsText: '',
    sourceSummary: '',
    vocabularyText: '',
  }),
  DEFAULT_ACTIVITY_DRAFT_SOURCE
);
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
assert.deepEqual(
  buildAttemptTimerState({
    now: 1_000,
    startedAt: 2_000,
  }),
  {
    durationSeconds: 0,
    elapsedSeconds: 0,
    remainingSeconds: undefined,
    timeExpired: false,
  }
);
assert.deepEqual(
  buildAttemptTimerState({
    now: 6_500,
    startedAt: 1_000,
    timeLimitSeconds: 10,
  }),
  {
    durationSeconds: 6,
    elapsedSeconds: 6,
    remainingSeconds: 4,
    timeExpired: false,
  }
);
assert.deepEqual(
  buildAttemptTimerState({
    now: 12_000,
    startedAt: 1_000,
    timeLimitSeconds: 10,
  }),
  {
    durationSeconds: 11,
    elapsedSeconds: 11,
    remainingSeconds: 0,
    timeExpired: true,
  }
);
assert.equal(formatAttemptDuration(undefined), '-');
assert.equal(formatAttemptDuration(undefined, { emptyValue: '' }), '');
assert.equal(formatAttemptDuration(0), '-');
assert.equal(formatAttemptDuration(4.6), '5s');
assert.equal(formatAttemptDuration(65), '1m 05s');
assert.equal(formatAttemptDuration(-3), '-');
assert.equal(formatAttemptDuration(65, { style: 'timer' }), '1:05');
assert.equal(formatAttemptDuration(5, { style: 'timer' }), '5s');
assert.equal(formatAssignmentResultDate(null), '-');
assert.equal(formatAssignmentResultDate('not-a-date'), '-');
assert.match(
  formatAssignmentResultDate(new Date('2026-01-01T10:00:00.000Z'), {
    locale: 'en-US',
    timeZone: 'UTC',
  }),
  /Jan 1, 2026, 10:00 AM/
);
assert.equal(formatAcceptedAnswerAlternatives([]), '-');
assert.equal(formatAcceptedAnswerAlternatives(['Paris']), '-');
assert.equal(
  formatAcceptedAnswerAlternatives(['Paris', 'Paris, France']),
  'Paris, Paris, France'
);
assert.equal(
  formatAcceptedAnswerAlternatives(['Paris', 'Paris, France'], {
    emptyValue: '',
    separator: ' | ',
  }),
  'Paris | Paris, France'
);
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
assert.equal(resultAnalysis.perItem[0]?.kindLabel, 'Question');
assert.equal(resultAnalysis.perItem[1]?.kindLabel, 'Pair');
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
assert.equal(
  buildResultSearchSummary({
    matchedAttempts: 3,
    matchedStudents: 2,
    search: '',
  }),
  'All students'
);
assert.equal(
  buildResultSearchSummary({
    matchedAttempts: 1,
    matchedStudents: 1,
    search: 'alice',
  }),
  '1 student · 1 attempt'
);
assert.equal(
  buildResultSearchSummary({
    matchedAttempts: 2,
    matchedStudents: 1,
    search: ' alice ',
  }),
  '1 student · 2 attempts'
);
assert.equal(
  buildAttemptReviewSubmissionSummary({
    shownAttempts: 1,
    totalAttempts: 1,
  }),
  'Showing 1 of 1 submission.'
);
assert.equal(
  buildAttemptReviewSubmissionSummary({
    shownAttempts: 2,
    totalAttempts: 3,
  }),
  'Showing 2 of 3 submissions.'
);
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
const followUpPriorityStudents = [
  {
    attempts: 1,
    averageAccuracy: 0,
    bestAccuracy: 0,
    lastCompletedAt: new Date('2026-01-03T10:00:00.000Z'),
    latestAccuracy: 0,
    needsReviewCount: 0,
    studentKey: 'name:no-review',
    studentLabel: 'No review',
  },
  {
    attempts: 1,
    averageAccuracy: 70,
    bestAccuracy: 70,
    lastCompletedAt: new Date('2026-01-02T10:00:00.000Z'),
    latestAccuracy: 70,
    needsReviewCount: 3,
    studentKey: 'name:more-review',
    studentLabel: 'More review',
  },
  {
    attempts: 1,
    averageAccuracy: 10,
    bestAccuracy: 10,
    lastCompletedAt: new Date('2026-01-01T10:00:00.000Z'),
    latestAccuracy: 10,
    needsReviewCount: 1,
    studentKey: 'name:lower-score',
    studentLabel: 'Lower score',
  },
  {
    attempts: 1,
    averageAccuracy: 70,
    bestAccuracy: 70,
    lastCompletedAt: new Date('2026-01-04T10:00:00.000Z'),
    latestAccuracy: 70,
    needsReviewCount: 3,
    studentKey: 'name:alpha-review',
    studentLabel: 'Alpha review',
  },
] satisfies typeof resultAnalysis.students;
assert.deepEqual(
  sortAssignmentStudentsByFollowUpPriority(followUpPriorityStudents).map(
    (student) => student.studentLabel
  ),
  ['Alpha review', 'More review', 'Lower score', 'No review']
);
assert.deepEqual(
  getAssignmentStudentFollowUpPriorityStudents(followUpPriorityStudents, {
    limit: 2,
  }).map((student) => student.studentLabel),
  ['Alpha review', 'More review']
);
assert.deepEqual(
  sortItemPerformance(resultAnalysis.perItem, 'accuracy').map(
    (item) => item.itemId
  ),
  ['pair-1', 'q-1']
);
const reviewPriorityItems = [
  {
    acceptedAnswers: ['Seed'],
    correctCount: 0,
    correctRate: 0,
    expectedAnswer: 'Seed',
    itemId: 'unsubmitted',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Unsubmitted item',
    submittedCount: 0,
  },
  {
    acceptedAnswers: ['A'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'A',
    itemId: 'tie-more-submitted',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Tie with more submissions',
    submittedCount: 6,
  },
  {
    acceptedAnswers: ['B'],
    correctCount: 1,
    correctRate: 50,
    expectedAnswer: 'B',
    itemId: 'tie-fewer-submitted',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Tie with fewer submissions',
    submittedCount: 2,
  },
  {
    acceptedAnswers: ['C'],
    correctCount: 3,
    correctRate: 75,
    expectedAnswer: 'C',
    itemId: 'higher-accuracy',
    kind: 'question',
    kindLabel: 'Question',
    prompt: 'Higher accuracy',
    submittedCount: 4,
  },
] satisfies typeof resultAnalysis.perItem;
assert.deepEqual(
  sortAssignmentItemsByReviewPriority(reviewPriorityItems).map(
    (item) => item.itemId
  ),
  [
    'unsubmitted',
    'tie-more-submitted',
    'tie-fewer-submitted',
    'higher-accuracy',
  ]
);
assert.deepEqual(
  getSubmittedAssignmentReviewPriorityItems(reviewPriorityItems, {
    limit: 2,
  }).map((item) => item.itemId),
  ['tie-more-submitted', 'tie-fewer-submitted']
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
  students: followUpPriorityStudents,
});
assert.match(reteachPlan, /ClassGamify reteach plan: Capital Review, Week 1/);
assert.match(reteachPlan, /Review first:/);
assert.match(reteachPlan, /Student follow-up:/);
assert.match(reteachPlan, /Match "Hot" with its pair\. \(50% correct, 1\/2\)/);
assert.match(
  reteachPlan,
  /Alpha review: 70% latest accuracy, 3 items to review\n- More review: 70% latest accuracy, 3 items to review\n- Lower score: 10% latest accuracy, 1 item to review/
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
  /Capital of France\? \(Question\) - 67% correct, 2\/3 correct/
);
assert.match(
  itemReviewSummary,
  /Match "Hot" with its pair\. \(Pair\) - 50% correct, 1\/2 correct/
);
assert.match(itemReviewSummary, /Expected: Paris \/ Paris, France\./);
assert.match(itemReviewSummary, /Accepted answers: Paris, Paris, France\./);
assert.match(itemReviewSummary, /Notes: Paris is the capital of France\./);

const studentFollowUpSummary = buildAssignmentStudentFollowUpSummary({
  assignmentTitle: csvExportData.assignment.title,
  students: followUpPriorityStudents,
});
assert.match(
  studentFollowUpSummary,
  /ClassGamify student follow-up: Capital Review, Week 1/
);
assert.match(
  studentFollowUpSummary,
  /1\. Alpha review: latest 70%, average 70%, best 70%, 1 attempt, 3 items to review/
);
assert.match(
  studentFollowUpSummary,
  /2\. More review: latest 70%, average 70%, best 70%, 1 attempt, 3 items to review/
);
assert.match(
  studentFollowUpSummary,
  /4\. No review: latest 0%, average 0%, best 0%, 1 attempt, 0 items to review/
);

console.log('Domain tests passed.');
