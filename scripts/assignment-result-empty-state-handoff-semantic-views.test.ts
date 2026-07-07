import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS,
  buildAssignmentResultEmptyStateHandoffView,
  type AssignmentResultEmptyStateHandoffItemId,
  type AssignmentResultEmptyStateHandoffView,
} from '@/assignments/result-empty-state-handoff';
import {
  buildAssignmentResultEmptyState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  type AssignmentAttemptRowDisplayInput,
  type AssignmentResultsPageData,
} from '@/assignments/result-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_PRIVATE_STUDENT = 'Private Student';
const SECRET_RAW_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TEACHER_ANSWER = 'SECRET_TEACHER_ANSWER';

test('assignment result empty-state handoff exposes 30 safe waiting slices', () => {
  overwriteGetLocale(() => 'en');

  const handoffView = buildAssignmentResultEmptyStateHandoffView({
    description:
      'Share the student link, then completed submissions will appear here.',
    reason: 'no-student-summaries',
    search: '',
    surface: 'student-summary',
    title: 'No student summaries yet.',
    totalStudents: 0,
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    handoffView.itemViews.every(
      (itemView) =>
        itemView.ariaLabel &&
        itemView.description &&
        itemView.label &&
        itemView.value
    )
  );
  assert.deepEqual(handoffView.privacy, {
    exposesPublicRunnerContent: false,
    exposesRawAnonymousToken: false,
    exposesRawSearchText: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-result-empty-state',
    usesResultDomainHelpers: true,
  });

  assert.equal(
    getHandoffValue(handoffView, 'empty-surface'),
    'Student summary'
  );
  assert.equal(
    getHandoffValue(handoffView, 'empty-reason'),
    'No student summaries'
  );
  assert.equal(
    getHandoffValue(handoffView, 'visible-title'),
    'No student summaries yet.'
  );
  assert.equal(
    getHandoffValue(handoffView, 'visible-description'),
    'Share the student link, then completed submissions will appear here.'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-summary-section'),
    'Active empty state'
  );
  assert.equal(
    getHandoffValue(handoffView, 'attempt-table-section'),
    'Covered elsewhere'
  );
  assert.equal(getHandoffValue(handoffView, 'total-students'), '0');
  assert.equal(getHandoffValue(handoffView, 'total-attempts'), '0');
  assert.equal(getHandoffValue(handoffView, 'search-state'), 'Default');
  assert.equal(
    getHandoffValue(handoffView, 'search-normalization'),
    'normalizeResultSearch'
  );
  assert.equal(getHandoffValue(handoffView, 'review-filter'), 'Not applied');
  assert.equal(
    getHandoffValue(handoffView, 'waiting-next-step'),
    'Share the student link'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-match-next-step'),
    'Not a no-match state'
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-brief-gate'),
    'Current review scope'
  );
  assert.equal(
    getHandoffValue(handoffView, 'export-csv-gate'),
    'Full assignment scope'
  );
  assert.equal(getHandoffValue(handoffView, 'anonymous-token-guard'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'student-answer-guard'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'teacher-answer-guard'), 'Hidden');
});

test('assignment result empty-state handoff summarizes search without leaking query text', () => {
  overwriteGetLocale(() => 'en');

  const handoffView = buildAssignmentResultEmptyStateHandoffView({
    description: 'Clear the search or try another student name.',
    reason: 'attempt-search-no-matches',
    search: ` ${SECRET_PRIVATE_STUDENT} `,
    surface: 'attempt-rows',
    title: 'No matching attempts.',
    totalAttempts: 2,
  });

  assert.equal(
    getHandoffValue(handoffView, 'empty-reason'),
    'Attempt search no match'
  );
  assert.equal(
    getHandoffValue(handoffView, 'empty-surface'),
    'Student attempts'
  );
  assert.equal(getHandoffValue(handoffView, 'search-state'), 'Adjusted');
  assert.equal(
    getHandoffValue(handoffView, 'no-match-next-step'),
    'Clear search'
  );
  assert.equal(
    getHandoffValue(handoffView, 'waiting-next-step'),
    'Not waiting'
  );
  assertNoPrivateEmptyStateHandoffText(JSON.stringify(handoffView));
});

test('assignment result empty-state handoff distinguishes needs-review no matches', () => {
  overwriteGetLocale(() => 'en');

  const handoffView = buildAssignmentResultEmptyStateHandoffView({
    description:
      'Every shown submission is currently correct for this assignment snapshot.',
    filter: 'needs-review',
    reason: 'needs-review-no-matches',
    search: '',
    surface: 'attempt-review',
    title: 'No answers need review.',
    totalAttemptReviews: 3,
  });

  assert.equal(getHandoffValue(handoffView, 'empty-surface'), 'Answer review');
  assert.equal(
    getHandoffValue(handoffView, 'empty-reason'),
    'No answers need review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-filter'),
    'Needs review only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-match-next-step'),
    'Switch to all answers'
  );
  assert.equal(getHandoffValue(handoffView, 'total-answer-reviews'), '3');
});

test('assignment result empty-state handoff localizes Chinese review boundaries', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentResultEmptyStateHandoffView({
    description: '清除搜索或尝试这个作业中的其他学生姓名。',
    reason: 'answer-review-search-no-matches',
    search: '  Alice  ',
    surface: 'attempt-review',
    title: '没有匹配的答题复查。',
    totalAttemptReviews: 2,
  });

  assert.equal(handoffView.title, '结果空状态交接');
  assert.match(handoffView.description, /30 切片/);
  assert.equal(getHandoffValue(handoffView, 'empty-surface'), '答题复查');
  assert.equal(
    getHandoffValue(handoffView, 'empty-reason'),
    '答题复查搜索无匹配'
  );
  assert.equal(getHandoffValue(handoffView, 'search-state'), '已调整');
  assert.equal(getHandoffValue(handoffView, 'no-match-next-step'), '清除搜索');
  assert.equal(getHandoffValue(handoffView, 'teacher-answer-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

test('assignment result empty-state handoff is carried by result view models', () => {
  overwriteGetLocale(() => 'en');

  const directEmptyState = buildAssignmentResultEmptyState({
    search: '',
    surface: 'attempt-rows',
    totalAttempts: 0,
  });

  assert.ok(directEmptyState);
  assert.equal(
    directEmptyState.handoffView.privacy.scope,
    'teacher-result-empty-state'
  );
  assert.equal(directEmptyState.handoffView.itemViews.length, 30);
  assert.equal(
    getHandoffValue(directEmptyState.handoffView, 'empty-reason'),
    'No attempts'
  );

  const pageView = buildAssignmentResultsPageViewModel({
    data: buildEmptyStatePageData(),
    search: buildAssignmentResultRouteSearch({
      student: SECRET_PRIVATE_STUDENT,
    }),
  });

  assert.ok(pageView.resultView.emptyStates.studentSummary?.handoffView);
  assert.ok(pageView.resultView.emptyStates.attemptRows?.handoffView);
  assert.ok(pageView.resultView.emptyStates.attemptReview?.handoffView);
  assert.equal(
    pageView.sectionViews.studentSummary.emptyState,
    pageView.resultView.emptyStates.studentSummary
  );
  assert.equal(
    pageView.sectionViews.studentAttempts.emptyState,
    pageView.resultView.emptyStates.attemptRows
  );
  assert.equal(
    pageView.sectionViews.answerReview.emptyState,
    pageView.resultView.emptyStates.attemptReview
  );
  assertNoPrivateEmptyStateHandoffText(
    JSON.stringify(pageView.resultView.emptyStates)
  );
});

test('assignment result empty-state component renders stable handoff markers', () => {
  const source = readFileSync(
    'src/components/assignments/assignment-results-empty-state.tsx',
    'utf8'
  );

  assert.match(
    source,
    /function AssignmentResultEmptyStateHandoff[\s\S]*const baseId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="assignment-result-empty-state"[\s\S]*data-handoff-scope=\{state\.handoffView\.privacy\.scope\}[\s\S]*state\.handoffView\.itemViews\.map[\s\S]*AssignmentResultEmptyStateHandoffItem[\s\S]*baseId=\{baseId\}[\s\S]*function AssignmentResultEmptyStateHandoffItem[\s\S]*const itemId = `\$\{baseId\}-assignment-result-empty-state-\$\{itemView\.id\}`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Assignment result empty-state handoff should expose the localized result-page marker, privacy scope, item ids, and stable label/value/description output relationships.'
  );
});

function buildEmptyStatePageData(): AssignmentResultsPageData<AssignmentAttemptRowDisplayInput> {
  const completedAt = new Date('2026-05-03T10:00:00.000Z');

  return {
    activity: {
      description: 'Teacher-owned classroom review.',
      templateType: 'quiz',
      title: 'Empty-state review',
    },
    analysis: {
      attempts: [
        {
          accuracy: 100,
          answers: [
            {
              acceptedAnswers: ['2', SECRET_TEACHER_ANSWER],
              answer: SECRET_STUDENT_ANSWER,
              correct: true,
              expectedAnswer: SECRET_TEACHER_ANSWER,
              explanation: 'Teacher-only explanation.',
              itemId: 'item-empty-state',
              prompt: 'Teacher-only prompt.',
              submitted: true,
            },
          ],
          completedAt,
          durationSeconds: 45,
          id: 'attempt-bob',
          score: 1,
          studentKey: 'student:bob',
          studentLabel: 'Bob',
        },
      ],
      needsReview: [],
      perItem: [
        {
          acceptedAnswers: ['2', SECRET_TEACHER_ANSWER],
          correctCount: 1,
          correctRate: 100,
          explanation: 'Teacher-only explanation.',
          expectedAnswer: SECRET_TEACHER_ANSWER,
          itemId: 'item-empty-state',
          kind: 'question',
          kindLabel: 'Question',
          prompt: 'Teacher-only prompt.',
          submittedCount: 1,
          unansweredCount: 0,
        },
      ],
      students: [
        {
          attempts: 1,
          averageAccuracy: 100,
          bestAccuracy: 100,
          lastCompletedAt: completedAt,
          latestAccuracy: 100,
          needsReviewCount: 0,
          studentKey: 'student:bob',
          studentLabel: 'Bob',
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-05-10T10:00:00.000Z'),
      id: 'assignment-result-empty-state-handoff',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review empty-state boundaries.',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 180,
      },
      shareSlug: 'empty-state-share',
      status: 'published',
      title: 'Empty-state exit ticket',
    },
    attempts: [
      {
        anonymousToken: SECRET_RAW_ANONYMOUS_TOKEN,
        completedAt,
        id: 'attempt-bob',
        maxScore: 1,
        resultJson: {
          accuracy: 100,
          completedItemCount: 1,
          durationSeconds: 45,
          totalPoints: 1,
        },
        score: 1,
        studentName: 'Bob',
      },
    ],
    snapshot: {
      activityDescription: 'Frozen classroom activity snapshot.',
      activityTitle: 'Empty-state review snapshot',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 45,
      averagePoints: 1,
      averageScore: 100,
      completions: 1,
    },
  };
}

function getHandoffValue(
  view: AssignmentResultEmptyStateHandoffView,
  id: AssignmentResultEmptyStateHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing result empty-state handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateEmptyStateHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_PRIVATE_STUDENT,
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_STUDENT_ANSWER,
    SECRET_TEACHER_ANSWER,
    'empty-state-share',
    'item-empty-state',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Result empty-state handoff leaked private text: ${privateValue}`
    );
  }
}
