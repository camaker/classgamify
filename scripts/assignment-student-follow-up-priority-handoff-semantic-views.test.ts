import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_CLASSROOM_BRIEF_LIMITS,
  buildAssignmentClassroomBrief,
} from '@/assignments/classroom-brief';
import {
  ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS,
  buildAssignmentStudentFollowUpPriorityHandoffView,
  compareAssignmentStudentsByFollowUpPriority,
  getAssignmentStudentFollowUpPriorityStudents,
  sortAssignmentStudentsByFollowUpPriority,
  type AssignmentStudentFollowUpPriorityHandoffItemId,
  type AssignmentStudentFollowUpPriorityHandoffView,
} from '@/assignments/student-follow-up-priority';
import type {
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_KEY = 'SECRET_STUDENT_KEY';
const SECRET_STUDENT_LABEL = 'Secret Student Label';
const SECRET_RAW_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';

const CLASSROOM_BRIEF_SOURCE = readFileSync(
  'src/assignments/classroom-brief.ts',
  'utf8'
);
const CLASSROOM_BRIEF_COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'utf8'
);
const PRIORITY_SOURCE = readFileSync(
  'src/assignments/student-follow-up-priority.ts',
  'utf8'
);
const RESULT_FILTERS_SOURCE = readFileSync(
  'src/assignments/result-filters.ts',
  'utf8'
);
const STUDENT_FOLLOW_UP_SUMMARY_SOURCE = readFileSync(
  'src/assignments/student-follow-up-summary.ts',
  'utf8'
);

test('student follow-up priority handoff exposes 30 safe sorting slices', () => {
  const students = buildStudentSummaries();
  const selectedStudents = getAssignmentStudentFollowUpPriorityStudents(
    students,
    {
      limit: 2,
    }
  );
  const handoffView = buildAssignmentStudentFollowUpPriorityHandoffView({
    limit: 2,
    selectedStudents,
    students,
    surface: 'classroom-brief',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    handoffView.itemViews.every(
      (item) => item.ariaLabel && item.description && item.label && item.value
    )
  );
  assert.deepEqual(handoffView.privacy, {
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesStudentKeys: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    scope: 'teacher-student-follow-up-priority',
    usesSharedPriorityHelper: true,
  });
  assert.deepEqual(
    selectedStudents.map((student) => student.studentKey),
    ['avery', 'blake']
  );
  assert.equal(
    compareAssignmentStudentsByFollowUpPriority(students[0], students[1]) < 0,
    true
  );

  assertNoPrivatePriorityHandoffText(JSON.stringify(handoffView));
});

test('student follow-up priority handoff summarizes counts and rules', () => {
  const handoffView = buildAssignmentStudentFollowUpPriorityHandoffView({
    limit: 2,
    selectedStudents: getAssignmentStudentFollowUpPriorityStudents(
      buildStudentSummaries(),
      {
        limit: 2,
      }
    ),
    students: buildStudentSummaries(),
    surface: 'classroom-brief',
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['priority-source', 'student-follow-up-priority.ts'],
      ['input-students', '5 students'],
      ['eligible-students', '3 students'],
      ['selected-students', '2 students'],
      ['selection-limit', '2 students'],
      ['needs-review-filter', 'Needs-review students'],
      ['needs-review-sort', 'Highest review count first'],
      ['accuracy-tie-breaker', 'Lower latest accuracy first'],
      ['display-label-tie-breaker', 'Normalized student label'],
      ['positive-review-gate', 'Ready'],
      ['classroom-brief-scope', 'Classroom brief follow-up'],
      ['reteach-plan-scope', 'Reteach plan follow-up'],
      ['follow-up-summary-scope', 'Sorted support list'],
      ['student-summary-sort', 'Needs-review sort'],
      ['copy-artifact-order', 'Shared priority'],
      ['latest-attempt-context', 'Latest attempt context'],
      ['last-submitted-context', 'Last submitted context'],
      ['attempt-count-context', 'Attempt counts included'],
      ['average-accuracy-context', 'Average accuracy included'],
      ['best-accuracy-context', 'Best accuracy included'],
      ['latest-accuracy-context', 'Latest accuracy included'],
      ['review-count-context', 'Review counts included'],
      ['recommendation-policy', 'Review-needed next step'],
      ['empty-state', 'Follow-up ready'],
      ['limit-normalization', 'Non-negative limit'],
      ['count-normalization', 'Finite counts'],
      ['domain-helper', 'getAssignmentStudentFollowUpPriorityStudents'],
      ['result-view-consumer', 'Classroom brief'],
      ['anonymous-token-guard', 'Raw tokens hidden'],
      ['privacy-guard', 'Private student data hidden'],
    ]
  );

  assertNoPrivatePriorityHandoffText(JSON.stringify(handoffView));
});

test('student follow-up priority handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const students = buildStudentSummaries();
    const handoffView = buildAssignmentStudentFollowUpPriorityHandoffView({
      limit: 2,
      selectedStudents: getAssignmentStudentFollowUpPriorityStudents(students, {
        limit: 2,
      }),
      students,
      surface: 'classroom-brief',
    });

    assert.equal(handoffView.title, '学生跟进优先级交接');
    assert.match(handoffView.description, /三十切片/);
    assert.equal(
      getPriorityHandoffValue(handoffView, 'input-students'),
      '5 名学生'
    );
    assert.equal(
      getPriorityHandoffValue(handoffView, 'eligible-students'),
      '3 名学生'
    );
    assert.equal(
      getPriorityHandoffValue(handoffView, 'needs-review-sort'),
      '复盘数高者优先'
    );
    assert.equal(
      getPriorityHandoffValue(handoffView, 'accuracy-tie-breaker'),
      '最近正确率低者优先'
    );
    assert.equal(
      getPriorityHandoffValue(handoffView, 'result-view-consumer'),
      '课堂简报'
    );
    assert.equal(
      getPriorityHandoffValue(handoffView, 'privacy-guard'),
      '私有学生数据隐藏'
    );
    assertNoPrivatePriorityHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student follow-up priority handoff is attached to the classroom brief surface', () => {
  const students = buildStudentSummaries();
  const brief = buildAssignmentClassroomBrief({
    assignmentTitle: 'Fractions exit ticket',
    attempts: [],
    items: buildItemAnalyses(),
    stats: {
      averageDurationSeconds: 90,
      averagePoints: 2,
      averageScore: 68,
      completions: 4,
    },
    students,
  });

  assert.equal(
    brief.followUpStudents.length,
    Math.min(3, ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.followUpStudents)
  );
  assert.deepEqual(
    brief.followUpStudents.map((student) => student.studentKey),
    ['avery', 'blake', SECRET_STUDENT_KEY]
  );
  assert.equal(
    getPriorityHandoffValue(
      brief.followUpPriorityHandoffView,
      'result-view-consumer'
    ),
    'Classroom brief'
  );
  assert.equal(
    getPriorityHandoffValue(
      brief.followUpPriorityHandoffView,
      'selection-limit'
    ),
    '6 students'
  );
  assertNoPrivatePriorityHandoffText(
    JSON.stringify(brief.followUpPriorityHandoffView)
  );

  assert.match(
    CLASSROOM_BRIEF_SOURCE,
    /followUpPriorityHandoffView[\s\S]*buildAssignmentStudentFollowUpPriorityHandoffView\(\{[\s\S]*limit: ASSIGNMENT_CLASSROOM_BRIEF_LIMITS\.followUpStudents[\s\S]*selectedStudents: followUpStudents[\s\S]*surface: 'classroom-brief'/
  );
  assert.match(
    CLASSROOM_BRIEF_COMPONENT_SOURCE,
    /data-handoff="assignment-student-follow-up-priority"[\s\S]*handoffView\.itemViews\.map[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*<output[\s\S]*aria-label=\{itemView\.ariaLabel\}/
  );
});

test('student follow-up priority remains a shared domain helper', () => {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(
    buildStudentSummaries()
  );

  assert.deepEqual(
    sortedStudents.map((student) => student.studentKey),
    ['avery', 'blake', SECRET_STUDENT_KEY, 'devon', 'casey']
  );
  assert.deepEqual(
    getAssignmentStudentFollowUpPriorityStudents(buildStudentSummaries()).map(
      (student) => student.studentKey
    ),
    ['avery', 'blake', SECRET_STUDENT_KEY]
  );
  assert.match(
    PRIORITY_SOURCE,
    /ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS = \[[\s\S]*'needs-review-sort'[\s\S]*'accuracy-tie-breaker'[\s\S]*'display-label-tie-breaker'[\s\S]*'anonymous-token-guard'[\s\S]*'privacy-guard'/
  );
  assert.match(
    RESULT_FILTERS_SOURCE,
    /compareAssignmentStudentsByFollowUpPriority/
  );
  assert.match(
    STUDENT_FOLLOW_UP_SUMMARY_SOURCE,
    /sortAssignmentStudentsByFollowUpPriority/
  );
  assertNoPrivatePriorityHandoffText(
    JSON.stringify(
      buildAssignmentStudentFollowUpPriorityHandoffView({
        students: buildStudentSummaries(),
      })
    )
  );
});

function buildStudentSummaries(): AssignmentStudentSummary[] {
  return [
    {
      attempts: 2,
      averageAccuracy: 58,
      bestAccuracy: 70,
      lastCompletedAt: new Date('2026-01-01T09:00:00.000Z'),
      latestAccuracy: 65,
      needsReviewCount: 3,
      studentKey: 'avery',
      studentLabel: 'Avery',
    },
    {
      attempts: 2,
      averageAccuracy: 72,
      bestAccuracy: 82,
      lastCompletedAt: new Date('2026-01-01T09:10:00.000Z'),
      latestAccuracy: 80,
      needsReviewCount: 3,
      studentKey: 'blake',
      studentLabel: 'Blake',
    },
    {
      attempts: 1,
      averageAccuracy: 96,
      bestAccuracy: 96,
      lastCompletedAt: new Date('2026-01-01T09:20:00.000Z'),
      latestAccuracy: 96,
      needsReviewCount: 0,
      studentKey: 'casey',
      studentLabel: 'Casey',
    },
    {
      attempts: 1,
      averageAccuracy: 88,
      bestAccuracy: 88,
      lastCompletedAt: new Date('2026-01-01T09:30:00.000Z'),
      latestAccuracy: 88,
      needsReviewCount: 0,
      studentKey: 'devon',
      studentLabel: 'Devon',
    },
    {
      attempts: 1,
      averageAccuracy: 55,
      bestAccuracy: 55,
      lastCompletedAt: new Date('2026-01-01T09:40:00.000Z'),
      latestAccuracy: 55,
      needsReviewCount: 1,
      studentKey: SECRET_STUDENT_KEY,
      studentLabel: SECRET_STUDENT_LABEL,
    },
  ];
}

function buildItemAnalyses(): AssignmentItemAnalysis[] {
  return [
    {
      acceptedAnswers: [],
      correctCount: 1,
      correctRate: 25,
      expectedAnswer: 'hidden expected',
      itemId: 'item-1',
      kind: 'question',
      kindLabel: 'Question',
      prompt: 'hidden prompt',
      submittedCount: 4,
      unansweredCount: 0,
    },
  ];
}

function getPriorityHandoffValue(
  handoffView: AssignmentStudentFollowUpPriorityHandoffView,
  id: AssignmentStudentFollowUpPriorityHandoffItemId
) {
  const item = handoffView.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing student follow-up priority handoff item ${id}`);

  return item.value;
}

function assertNoPrivatePriorityHandoffText(text: string) {
  for (const privateValue of [
    SECRET_RAW_ANONYMOUS_TOKEN,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_KEY,
    SECRET_STUDENT_LABEL,
    'Avery',
    'Blake',
    'Casey',
    'Devon',
  ]) {
    assert.equal(
      text.includes(privateValue),
      false,
      `Student follow-up priority handoff leaked private text: ${privateValue}`
    );
  }
}
